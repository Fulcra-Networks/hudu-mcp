import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { HuduClient } from "../client/HuduClient.js";
import { formatToolSuccess, formatToolError } from "../types/mcp.js";
import { ListAssetLayoutsSchema, GetAssetLayoutSchema } from "../schemas/assetLayouts.js";

const GetAssetLayoutsInput = ListAssetLayoutsSchema.extend({
  summary: z.boolean().optional().describe(
    "When true, return lightweight summaries instead of full details. Replaces fields array with field_count."
  ),
});

export function registerAssetLayoutTools(server: McpServer, client: HuduClient): void {
  server.tool(
    "get_asset_layouts",
    "Get asset layouts from Hudu. Returns full details by default. Asset layouts define the structure and fields for a category of assets. Use summary: true for lightweight results.",
    GetAssetLayoutsInput.shape,
    async ({ summary, ...params }) => {
      try {
        const result = await client.listAssetLayouts(params as Record<string, unknown>);
        if (summary) {
          const items = (result.asset_layouts as Record<string, unknown>[]).map(
            ({ fields, ...rest }) => ({
              ...rest,
              field_count: Array.isArray(fields) ? fields.length : 0,
            })
          );
          return formatToolSuccess({ asset_layouts: items });
        }
        return formatToolSuccess(result);
      } catch (error) {
        return formatToolError(error);
      }
    }
  );

  server.tool(
    "get_asset_layout",
    "Get a single asset layout from Hudu by its ID.",
    GetAssetLayoutSchema.shape,
    async ({ id }) => {
      try {
        const result = await client.getAssetLayout(id);
        return formatToolSuccess(result);
      } catch (error) {
        return formatToolError(error);
      }
    }
  );

  server.tool(
    "get_asset_layout_fields",
    "Get the field definitions for an asset layout. Returns only the information needed to populate custom_fields correctly: label, field_type, required, and hint. Call this before create_asset or update_asset to ensure custom_fields keys match the exact field labels defined in the layout.",
    { id: GetAssetLayoutSchema.shape.id },
    async ({ id }) => {
      try {
        const result = await client.getAssetLayout(id) as Record<string, unknown>;
        const layout = result.asset_layout as Record<string, unknown> | undefined;
        const fields = Array.isArray(layout?.fields) ? layout.fields : [];
        const fieldDefs = (fields as Record<string, unknown>[]).map(
          ({ label, field_type, required, hint }) => ({ label, field_type, required, hint })
        );
        return formatToolSuccess({ asset_layout_id: id, fields: fieldDefs });
      } catch (error) {
        return formatToolError(error);
      }
    }
  );
}
