import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { HuduClient } from "../client/HuduClient.js";
import { formatToolSuccess, formatToolError } from "../types/mcp.js";
import {
  ListFlagsSchema,
  GetFlagSchema,
  CreateFlagSchema,
  UpdateFlagSchema,
  DeleteFlagSchema,
} from "../schemas/flags.js";

const GetFlagsInput = ListFlagsSchema.extend({
  summary: z.boolean().optional().describe(
    "When true, return lightweight summaries instead of full details. Useful for browsing or scanning large result sets."
  ),
});

export function registerFlagTools(server: McpServer, client: HuduClient): void {
  server.tool(
    "get_flags",
    "Get flags from Hudu. Returns full details by default. Optionally filter by flag type, the type of flagged record, or the flagged record ID.",
    GetFlagsInput.shape,
    async ({ summary, ...params }) => {
      try {
        const result = await client.listFlags(params as Record<string, unknown>);
        return formatToolSuccess(result);
      } catch (error) {
        return formatToolError(error);
      }
    }
  );

  server.tool(
    "get_flag",
    "Get a single flag from Hudu by its ID.",
    GetFlagSchema.shape,
    async ({ id }) => {
      try {
        const result = await client.getFlag(id);
        return formatToolSuccess(result);
      } catch (error) {
        return formatToolError(error);
      }
    }
  );

  server.tool(
    "create_flag",
    "Create a new flag on a Hudu record. Flags are visual indicators attached to records. Requires a flag_type_id, the type of record, and the record's ID.",
    CreateFlagSchema.shape,
    async (args) => {
      try {
        const result = await client.createFlag(args as Record<string, unknown>);
        return formatToolSuccess(result);
      } catch (error) {
        return formatToolError(error);
      }
    }
  );

  server.tool(
    "update_flag",
    "Update an existing flag in Hudu. Provide only the fields you want to change.",
    UpdateFlagSchema.shape,
    async ({ id, ...data }) => {
      try {
        const result = await client.updateFlag(id, data as Record<string, unknown>);
        return formatToolSuccess(result);
      } catch (error) {
        return formatToolError(error);
      }
    }
  );

  server.tool(
    "delete_flag",
    "Delete a flag from a Hudu record by its ID.",
    DeleteFlagSchema.shape,
    async ({ id }) => {
      try {
        await client.deleteFlag(id);
        return formatToolSuccess({ message: `Flag ${id} deleted successfully.` });
      } catch (error) {
        return formatToolError(error);
      }
    }
  );
}
