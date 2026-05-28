import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { HuduClient } from "../client/HuduClient.js";
import { formatToolSuccess, formatToolError, withPaginationMeta } from "../types/mcp.js";
import { ListFlagTypesSchema, GetFlagTypeSchema } from "../schemas/flagTypes.js";

const FULL_DETAIL_DESC = "When true, preserve null values and return the complete raw API payload. Use when exploring all available fields including unpopulated ones. summary takes precedence if both are set.";

const GetFlagTypesInput = ListFlagTypesSchema.extend({
  summary: z.boolean().optional().describe(
    "When true, return lightweight summaries instead of full details. Useful for browsing or scanning large result sets."
  ),
  full_detail: z.boolean().optional().describe(FULL_DETAIL_DESC),
});

const GetFlagTypeInput = GetFlagTypeSchema.extend({
  full_detail: z.boolean().optional().describe(FULL_DETAIL_DESC),
});

export function registerFlagTypeTools(server: McpServer, client: HuduClient): void {
  server.registerTool(
    "hudu_get_flag_types",
    {
      description: "Get flag types from Hudu. Returns full details by default (null values stripped). Flag types define the appearance and meaning of flags on records. Use full_detail: true for the raw API response including null values.",
      inputSchema: GetFlagTypesInput.shape,
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async ({ summary, full_detail, ...params }) => {
      try {
        const result = await client.listFlagTypes(params as Record<string, unknown>);
        const opts = full_detail ? { preserveNulls: true } : undefined;
        return formatToolSuccess(withPaginationMeta(result as Record<string, unknown>, "flag_types", params), opts);
      } catch (error) {
        return formatToolError(error);
      }
    }
  );

  server.registerTool(
    "hudu_get_flag_type",
    {
      description: "Get a single flag type from Hudu by its ID. Use full_detail: true to include null values in the response.",
      inputSchema: GetFlagTypeInput.shape,
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async ({ id, full_detail }) => {
      try {
        const result = await client.getFlagType(id);
        return formatToolSuccess(result, full_detail ? { preserveNulls: true } : undefined);
      } catch (error) {
        return formatToolError(error);
      }
    }
  );
}
