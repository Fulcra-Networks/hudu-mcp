import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { HuduClient } from "../client/HuduClient.js";
import { formatToolSuccess, formatToolError, withPaginationMeta } from "../types/mcp.js";
import {
  ListArticlesSchema,
  GetArticleSchema,
  CreateArticleSchema,
  UpdateArticleSchema,
  ArchiveArticleSchema,
  UnarchiveArticleSchema,
} from "../schemas/articles.js";

const FULL_DETAIL_DESC = "When true, preserve null values and return the complete raw API payload. Use when exploring all available fields including unpopulated ones. summary takes precedence if both are set.";

const GetArticlesInput = ListArticlesSchema.extend({
  summary: z.boolean().optional().describe(
    "When true, return lightweight summaries instead of full details. Replaces content with a short content_preview."
  ),
  full_detail: z.boolean().optional().describe(FULL_DETAIL_DESC),
});

const GetArticleInput = GetArticleSchema.extend({
  full_detail: z.boolean().optional().describe(FULL_DETAIL_DESC),
});

export function registerArticleTools(server: McpServer, client: HuduClient): void {
  server.registerTool(
    "hudu_get_articles",
    {
      description: "Get knowledge base articles from Hudu. Returns full details by default (null values stripped). Optionally filter by company, name, draft status, or search term. Use summary: true for lightweight results, full_detail: true for the raw API response including null values.",
      inputSchema: GetArticlesInput.shape,
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async ({ summary, full_detail, ...params }) => {
      try {
        const result = await client.listArticles(params as Record<string, unknown>);
        if (summary) {
          const items = (result.articles as Record<string, unknown>[]).map(
            ({ content, ...rest }) => ({
              ...rest,
              content_preview: typeof content === "string" ? content.slice(0, 200) : null,
            })
          );
          return formatToolSuccess(withPaginationMeta({ articles: items }, "articles", params));
        }
        const opts = full_detail ? { preserveNulls: true } : undefined;
        return formatToolSuccess(withPaginationMeta(result as Record<string, unknown>, "articles", params), opts);
      } catch (error) {
        return formatToolError(error);
      }
    }
  );

  server.registerTool(
    "hudu_get_article",
    {
      description: "Get a single knowledge base article from Hudu by its ID. Use full_detail: true to include null values in the response.",
      inputSchema: GetArticleInput.shape,
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async ({ id, full_detail }) => {
      try {
        const result = await client.getArticle(id);
        return formatToolSuccess(result, full_detail ? { preserveNulls: true } : undefined);
      } catch (error) {
        return formatToolError(error);
      }
    }
  );

  server.registerTool(
    "hudu_create_article",
    {
      description: "Create a new knowledge base article in Hudu. Optionally associate it with a company or folder.",
      inputSchema: CreateArticleSchema.shape,
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
    },
    async (args) => {
      try {
        const result = await client.createArticle(args as Record<string, unknown>);
        return formatToolSuccess(result);
      } catch (error) {
        return formatToolError(error);
      }
    }
  );

  server.registerTool(
    "hudu_update_article",
    {
      description: "Update an existing knowledge base article in Hudu. Provide only the fields you want to change.",
      inputSchema: UpdateArticleSchema.shape,
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async ({ id, ...data }) => {
      try {
        const result = await client.updateArticle(id, data as Record<string, unknown>);
        return formatToolSuccess(result);
      } catch (error) {
        return formatToolError(error);
      }
    }
  );

  server.registerTool(
    "hudu_archive_article",
    {
      description: "Archive a knowledge base article in Hudu. Archived articles are hidden from normal views but not deleted.",
      inputSchema: ArchiveArticleSchema.shape,
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async ({ id }) => {
      try {
        const result = await client.archiveArticle(id);
        return formatToolSuccess(result);
      } catch (error) {
        return formatToolError(error);
      }
    }
  );

  server.registerTool(
    "hudu_unarchive_article",
    {
      description: "Unarchive a previously archived knowledge base article in Hudu, making it visible again.",
      inputSchema: UnarchiveArticleSchema.shape,
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async ({ id }) => {
      try {
        const result = await client.unarchiveArticle(id);
        return formatToolSuccess(result);
      } catch (error) {
        return formatToolError(error);
      }
    }
  );
}
