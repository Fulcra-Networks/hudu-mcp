import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { HuduClient } from "../client/HuduClient.js";
import { formatToolSuccess, formatToolError, withPaginationMeta } from "../types/mcp.js";
import { ListFlagTypesSchema, GetFlagTypeSchema } from "../schemas/flagTypes.js";

const GetFlagTypesInput = ListFlagTypesSchema.extend({
  summary: z.boolean().optional().describe(
    "When true, return lightweight summaries instead of full details. Useful for browsing or scanning large result sets."
  ),
});

export function registerFlagTypeTools(server: McpServer, client: HuduClient): void {
  server.registerTool(
    "hudu_get_flag_types",
    {
      description: "Get flag types from Hudu. Returns full details by default. Flag types define the appearance and meaning of flags on records.",
      inputSchema: GetFlagTypesInput.shape,
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async ({ summary, ...params }) => {
      try {
        const result = await client.listFlagTypes(params as Record<string, unknown>);
        return formatToolSuccess(withPaginationMeta(result as Record<string, unknown>, "flag_types", params));
      } catch (error) {
        return formatToolError(error);
      }
    }
  );

  server.registerTool(
    "hudu_get_flag_type",
    {
      description: "Get a single flag type from Hudu by its ID.",
      inputSchema: GetFlagTypeSchema.shape,
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async ({ id }) => {
      try {
        const result = await client.getFlagType(id);
        return formatToolSuccess(result);
      } catch (error) {
        return formatToolError(error);
      }
    }
  );
}
