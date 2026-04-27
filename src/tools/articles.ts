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

const GetArticlesInput = ListArticlesSchema.extend({
  summary: z.boolean().optional().describe(
    "When true, return lightweight summaries instead of full details. Replaces content with a short content_preview."
  ),
});

export function registerArticleTools(server: McpServer, client: HuduClient): void {
  server.tool(
    "hudu_get_articles",
    "Get knowledge base articles from Hudu. Returns full details by default. Optionally filter by company, name, draft status, or search term. Use summary: true for lightweight results.",
    GetArticlesInput.shape,
    { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    async ({ summary, ...params }) => {
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
        return formatToolSuccess(withPaginationMeta(result as Record<string, unknown>, "articles", params));
      } catch (error) {
        return formatToolError(error);
      }
    }
  );

  server.tool(
    "hudu_get_article",
    "Get a single knowledge base article from Hudu by its ID.",
    GetArticleSchema.shape,
    { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    async ({ id }) => {
      try {
        const result = await client.getArticle(id);
        return formatToolSuccess(result);
      } catch (error) {
        return formatToolError(error);
      }
    }
  );

  server.tool(
    "hudu_create_article",
    "Create a new knowledge base article in Hudu. Optionally associate it with a company or folder.",
    CreateArticleSchema.shape,
    { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
    async (args) => {
      try {
        const result = await client.createArticle(args as Record<string, unknown>);
        return formatToolSuccess(result);
      } catch (error) {
        return formatToolError(error);
      }
    }
  );

  server.tool(
    "hudu_update_article",
    "Update an existing knowledge base article in Hudu. Provide only the fields you want to change.",
    UpdateArticleSchema.shape,
    { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    async ({ id, ...data }) => {
      try {
        const result = await client.updateArticle(id, data as Record<string, unknown>);
        return formatToolSuccess(result);
      } catch (error) {
        return formatToolError(error);
      }
    }
  );

  server.tool(
    "hudu_archive_article",
    "Archive a knowledge base article in Hudu. Archived articles are hidden from normal views but not deleted.",
    ArchiveArticleSchema.shape,
    { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    async ({ id }) => {
      try {
        const result = await client.archiveArticle(id);
        return formatToolSuccess(result);
      } catch (error) {
        return formatToolError(error);
      }
    }
  );

  server.tool(
    "hudu_unarchive_article",
    "Unarchive a previously archived knowledge base article in Hudu, making it visible again.",
    UnarchiveArticleSchema.shape,
    { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: true },
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
