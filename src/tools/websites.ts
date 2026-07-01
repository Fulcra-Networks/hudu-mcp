import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { HuduClient } from "../client/HuduClient.js";
import { formatToolSuccess, formatToolError, withPaginationMeta } from "../types/mcp.js";
import {
  ListWebsitesSchema,
  GetWebsiteSchema,
  CreateWebsiteSchema,
  UpdateWebsiteSchema,
  DeleteWebsiteSchema,
} from "../schemas/websites.js";

const FULL_DETAIL_DESC = "When true, preserve null values and return the complete raw API payload. Use when exploring all available fields including unpopulated ones. summary takes precedence if both are set.";

const GetWebsitesInput = ListWebsitesSchema.extend({
  summary: z.boolean().optional().describe(
    "When true, return lightweight summaries instead of full details. Useful for browsing or scanning large result sets."
  ),
  full_detail: z.boolean().optional().describe(FULL_DETAIL_DESC),
});

const GetWebsiteInput = GetWebsiteSchema.extend({
  full_detail: z.boolean().optional().describe(FULL_DETAIL_DESC),
});

export function registerWebsiteTools(server: McpServer, client: HuduClient): void {
  server.registerTool(
    "hudu_get_websites",
    {
      description: "Get websites (Core assets) from Hudu. Returns full details by default (null values stripped). Optionally filter by name, slug, or search term. Use full_detail: true for the raw API response including null values.",
      inputSchema: GetWebsitesInput.shape,
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async ({ summary, full_detail, ...params }) => {
      try {
        const result = await client.listWebsites(params as Record<string, unknown>);
        const opts = full_detail ? { preserveNulls: true } : undefined;
        return formatToolSuccess(withPaginationMeta(result as Record<string, unknown>, "websites", params), opts);
      } catch (error) {
        return formatToolError(error);
      }
    }
  );

  server.registerTool(
    "hudu_get_website",
    {
      description: "Get a single website (Core asset) from Hudu by its ID. Use full_detail: true to include null values in the response.",
      inputSchema: GetWebsiteInput.shape,
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async ({ id, full_detail }) => {
      try {
        const result = await client.getWebsite(id);
        return formatToolSuccess(result, full_detail ? { preserveNulls: true } : undefined);
      } catch (error) {
        return formatToolError(error);
      }
    }
  );

  server.registerTool(
    "hudu_create_website",
    {
      description: "Create a new website (Core asset) in Hudu. Requires a company_id and name. Websites are monitored for HTTP status, SSL, DNS, and WHOIS by default.",
      inputSchema: CreateWebsiteSchema.shape,
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
    },
    async (args) => {
      try {
        const result = await client.createWebsite(args as Record<string, unknown>);
        return formatToolSuccess(result);
      } catch (error) {
        return formatToolError(error);
      }
    }
  );

  server.registerTool(
    "hudu_update_website",
    {
      description: "Update an existing website in Hudu. Provide only the fields you want to change.",
      inputSchema: UpdateWebsiteSchema.shape,
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async ({ id, ...data }) => {
      try {
        const result = await client.updateWebsite(id, data as Record<string, unknown>);
        return formatToolSuccess(result);
      } catch (error) {
        return formatToolError(error);
      }
    }
  );

  server.registerTool(
    "hudu_delete_website",
    {
      description: "Delete a website from Hudu by its ID. Hudu has no archive/unarchive tier for websites — this is a permanent removal.",
      inputSchema: DeleteWebsiteSchema.shape,
      annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: true },
    },
    async ({ id }) => {
      try {
        await client.deleteWebsite(id);
        return formatToolSuccess({ message: `Website ${id} deleted successfully.` });
      } catch (error) {
        return formatToolError(error);
      }
    }
  );
}
