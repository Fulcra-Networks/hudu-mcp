import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { HuduClient } from "../client/HuduClient.js";
import { formatToolSuccess, formatToolError, withPaginationMeta } from "../types/mcp.js";
import {
  ListFlagsSchema,
  GetFlagSchema,
  CreateFlagSchema,
  UpdateFlagSchema,
  DeleteFlagSchema,
} from "../schemas/flags.js";

const FULL_DETAIL_DESC = "When true, preserve null values and return the complete raw API payload. Use when exploring all available fields including unpopulated ones. summary takes precedence if both are set.";

const GetFlagsInput = ListFlagsSchema.extend({
  summary: z.boolean().optional().describe(
    "When true, return lightweight summaries instead of full details. Useful for browsing or scanning large result sets."
  ),
  full_detail: z.boolean().optional().describe(FULL_DETAIL_DESC),
});

const GetFlagInput = GetFlagSchema.extend({
  full_detail: z.boolean().optional().describe(FULL_DETAIL_DESC),
});

export function registerFlagTools(server: McpServer, client: HuduClient): void {
  server.registerTool(
    "hudu_get_flags",
    {
      description: "Get flags from Hudu. Returns full details by default (null values stripped). Optionally filter by flag type, the type of flagged record, or the flagged record ID. Use full_detail: true for the raw API response including null values.",
      inputSchema: GetFlagsInput.shape,
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async ({ summary, full_detail, ...params }) => {
      try {
        const result = await client.listFlags(params as Record<string, unknown>);
        const opts = full_detail ? { preserveNulls: true } : undefined;
        return formatToolSuccess(withPaginationMeta(result as Record<string, unknown>, "flags", params), opts);
      } catch (error) {
        return formatToolError(error);
      }
    }
  );

  server.registerTool(
    "hudu_get_flag",
    {
      description: "Get a single flag from Hudu by its ID. Use full_detail: true to include null values in the response.",
      inputSchema: GetFlagInput.shape,
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async ({ id, full_detail }) => {
      try {
        const result = await client.getFlag(id);
        return formatToolSuccess(result, full_detail ? { preserveNulls: true } : undefined);
      } catch (error) {
        return formatToolError(error);
      }
    }
  );

  server.registerTool(
    "hudu_create_flag",
    {
      description: "Create a new flag on a Hudu record. Flags are visual indicators attached to records. Requires a flag_type_id, the type of record, and the record's ID.",
      inputSchema: CreateFlagSchema.shape,
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
    },
    async (args) => {
      try {
        const result = await client.createFlag(args as Record<string, unknown>);
        return formatToolSuccess(result);
      } catch (error) {
        return formatToolError(error);
      }
    }
  );

  server.registerTool(
    "hudu_update_flag",
    {
      description: "Update an existing flag in Hudu. Provide only the fields you want to change.",
      inputSchema: UpdateFlagSchema.shape,
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async ({ id, ...data }) => {
      try {
        const result = await client.updateFlag(id, data as Record<string, unknown>);
        return formatToolSuccess(result);
      } catch (error) {
        return formatToolError(error);
      }
    }
  );

  server.registerTool(
    "hudu_delete_flag",
    {
      description: "Delete a flag from a Hudu record by its ID.",
      inputSchema: DeleteFlagSchema.shape,
      annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: true },
    },
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
