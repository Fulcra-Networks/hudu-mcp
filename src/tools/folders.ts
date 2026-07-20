import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { HuduClient } from "../client/HuduClient.js";
import { formatToolSuccess, formatToolError, withPaginationMeta } from "../types/mcp.js";
import {
  ListFoldersSchema,
  GetFolderSchema,
  CreateFolderSchema,
  UpdateFolderSchema,
  DeleteFolderSchema,
} from "../schemas/folders.js";

const FULL_DETAIL_DESC = "When true, preserve null values and return the complete raw API payload. Use when exploring all available fields including unpopulated ones. summary takes precedence if both are set.";

const GetFoldersInput = ListFoldersSchema.extend({
  summary: z.boolean().optional().describe(
    "When true, return lightweight summaries instead of full details. Strips description field."
  ),
  full_detail: z.boolean().optional().describe(FULL_DETAIL_DESC),
});

const GetFolderInput = GetFolderSchema.extend({
  full_detail: z.boolean().optional().describe(FULL_DETAIL_DESC),
});

export function registerFolderTools(server: McpServer, client: HuduClient): void {
  server.registerTool(
    "hudu_get_folders",
    {
      description: "Get KB folders from Hudu. Returns full details by default (null values stripped). Optionally filter by name or company_id. Use summary: true for lightweight results, full_detail: true for the raw API response including null values.",
      inputSchema: GetFoldersInput.shape,
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async ({ summary, full_detail, ...params }) => {
      try {
        const result = await client.listFolders(params as Record<string, unknown>);
        if (summary) {
          const items = (result.folders as Record<string, unknown>[]).map(
            ({ description, ...rest }) => rest
          );
          return formatToolSuccess(withPaginationMeta({ folders: items }, "folders", params));
        }
        const opts = full_detail ? { preserveNulls: true } : undefined;
        return formatToolSuccess(withPaginationMeta(result as Record<string, unknown>, "folders", params), opts);
      } catch (error) {
        return formatToolError(error);
      }
    }
  );

  server.registerTool(
    "hudu_get_folder",
    {
      description: "Get a single KB folder from Hudu by its ID. Use full_detail: true to include null values in the response.",
      inputSchema: GetFolderInput.shape,
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async ({ id, full_detail }) => {
      try {
        const result = await client.getFolder(id);
        return formatToolSuccess(result, full_detail ? { preserveNulls: true } : undefined);
      } catch (error) {
        return formatToolError(error);
      }
    }
  );

  server.registerTool(
    "hudu_create_folder",
    {
      description: "Create a new KB folder in Hudu. Use parent_folder_id to nest under an existing folder. Use company_id to create a company-specific folder.",
      inputSchema: CreateFolderSchema.shape,
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
    },
    async (args) => {
      try {
        const result = await client.createFolder(args as Record<string, unknown>);
        return formatToolSuccess(result);
      } catch (error) {
        return formatToolError(error);
      }
    }
  );

  server.registerTool(
    "hudu_update_folder",
    {
      description: "Update an existing KB folder in Hudu. Provide only the fields you want to change.",
      inputSchema: UpdateFolderSchema.shape,
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async ({ id, ...data }) => {
      try {
        const result = await client.updateFolder(id, data as Record<string, unknown>);
        return formatToolSuccess(result);
      } catch (error) {
        return formatToolError(error);
      }
    }
  );

  server.registerTool(
    "hudu_delete_folder",
    {
      description: "Delete a KB folder from Hudu by its ID. This is a permanent removal.",
      inputSchema: DeleteFolderSchema.shape,
      annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: true },
    },
    async ({ id }) => {
      try {
        await client.deleteFolder(id);
        return formatToolSuccess({ message: `Folder ${id} deleted successfully.` });
      } catch (error) {
        return formatToolError(error);
      }
    }
  );
}
