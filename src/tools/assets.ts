import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { HuduClient } from "../client/HuduClient.js";
import { formatToolSuccess, formatToolError, withPaginationMeta } from "../types/mcp.js";
import {
  ListAssetsSchema,
  GetAssetSchema,
  CreateAssetSchema,
  UpdateAssetSchema,
  ArchiveAssetSchema,
  UnarchiveAssetSchema,
} from "../schemas/assets.js";

const GetAssetsInput = ListAssetsSchema.extend({
  summary: z.boolean().optional().describe(
    "When true, return lightweight summaries instead of full details. Useful for browsing or scanning large result sets."
  ),
});

export function registerAssetTools(server: McpServer, client: HuduClient): void {
  server.tool(
    "hudu_get_assets",
    "Get assets across all companies in Hudu. Returns full details by default. Optionally filter by company, asset layout, name, or search term. Use summary: true for lightweight results.",
    GetAssetsInput.shape,
    { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    async ({ summary, ...params }) => {
      try {
        const result = await client.listAssets(params as Record<string, unknown>);
        if (summary) {
          const items = (result.assets as Record<string, unknown>[]).map(
            ({ cards, ...rest }) => rest
          );
          return formatToolSuccess(withPaginationMeta({ assets: items }, "assets", params));
        }
        return formatToolSuccess(withPaginationMeta(result as Record<string, unknown>, "assets", params));
      } catch (error) {
        return formatToolError(error);
      }
    }
  );

  server.tool(
    "hudu_get_asset",
    "Get a single asset from Hudu by company ID and asset ID.",
    GetAssetSchema.shape,
    { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    async ({ company_id, id }) => {
      try {
        const result = await client.getAsset(company_id, id);
        return formatToolSuccess(result);
      } catch (error) {
        return formatToolError(error);
      }
    }
  );

  server.tool(
    "hudu_create_asset",
    "Create a new asset under a specific company in Hudu. Requires a company_id and asset_layout_id. IMPORTANT: Before submitting custom_fields, call get_asset_layout_fields with the asset_layout_id to retrieve the valid field labels. Each custom_fields entry must use an exact label match from the layout's fields array — unrecognized keys are silently dropped by the API.",
    CreateAssetSchema.shape,
    { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
    async ({ company_id, ...data }) => {
      try {
        const result = await client.createAsset(company_id, data as Record<string, unknown>);
        return formatToolSuccess(result);
      } catch (error) {
        return formatToolError(error);
      }
    }
  );

  server.tool(
    "hudu_update_asset",
    "Update an existing asset in Hudu. Requires company_id and asset id. Provide only the fields you want to change. IMPORTANT: Before submitting custom_fields, call get_asset_layout_fields with the asset_layout_id to retrieve the valid field labels. Each custom_fields entry must use an exact label match from the layout's fields array — unrecognized keys are silently dropped by the API.",
    UpdateAssetSchema.shape,
    { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    async ({ company_id, id, ...data }) => {
      try {
        const result = await client.updateAsset(company_id, id, data as Record<string, unknown>);
        return formatToolSuccess(result);
      } catch (error) {
        return formatToolError(error);
      }
    }
  );

  server.tool(
    "hudu_archive_asset",
    "Archive an asset in Hudu. Archived assets are hidden from normal views but not deleted.",
    ArchiveAssetSchema.shape,
    { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    async ({ company_id, id }) => {
      try {
        const result = await client.archiveAsset(company_id, id);
        return formatToolSuccess(result);
      } catch (error) {
        return formatToolError(error);
      }
    }
  );

  server.tool(
    "hudu_unarchive_asset",
    "Unarchive a previously archived asset in Hudu, making it visible again.",
    UnarchiveAssetSchema.shape,
    { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    async ({ company_id, id }) => {
      try {
        const result = await client.unarchiveAsset(company_id, id);
        return formatToolSuccess(result);
      } catch (error) {
        return formatToolError(error);
      }
    }
  );
}
