import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { HuduClient } from "../client/HuduClient.js";
import { formatToolSuccess, formatToolError, withPaginationMeta } from "../types/mcp.js";
import { ListRelationsSchema, CreateRelationSchema, DeleteRelationSchema } from "../schemas/relations.js";

const GetRelationsInput = ListRelationsSchema.extend({
  summary: z.boolean().optional().describe(
    "When true, return lightweight summaries instead of full details. Useful for browsing or scanning large result sets."
  ),
});

export function registerRelationTools(server: McpServer, client: HuduClient): void {
  server.tool(
    "hudu_get_relations",
    "Get relations between Hudu records (assets, companies, articles, etc.). Returns full details by default.",
    GetRelationsInput.shape,
    { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    async ({ summary, ...params }) => {
      try {
        const result = await client.listRelations(params as Record<string, unknown>);
        return formatToolSuccess(withPaginationMeta(result as Record<string, unknown>, "relations", params));
      } catch (error) {
        return formatToolError(error);
      }
    }
  );

  server.tool(
    "hudu_create_relation",
    "Create a relation between two Hudu records. Both fromable and toable entities must be specified by type and ID.",
    CreateRelationSchema.shape,
    { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
    async (args) => {
      try {
        const result = await client.createRelation(args as Record<string, unknown>);
        return formatToolSuccess(result);
      } catch (error) {
        return formatToolError(error);
      }
    }
  );

  server.tool(
    "hudu_delete_relation",
    "Delete a relation between two Hudu records by its ID.",
    DeleteRelationSchema.shape,
    { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: true },
    async ({ id }) => {
      try {
        await client.deleteRelation(id);
        return formatToolSuccess({ message: `Relation ${id} deleted successfully.` });
      } catch (error) {
        return formatToolError(error);
      }
    }
  );
}
