// Auto-generated from api-docs.json — do not edit by hand.
// Regenerate: npm run generate:schemas
import { z } from "zod";

export const ListArticlesSchema = z.object({
  name: z.string().optional().describe("Filter by article name"),
  company_id: z.number().optional().describe("Filter by company_id"),
  page: z.number().optional().describe("Get current page of results"),
  draft: z.boolean().optional().describe("Filter by draft status"),
  enable_sharing: z.boolean().optional().describe("If true, filter by public articles"),
  page_size: z.number().optional().describe("Number of results to return"),
  slug: z.string().optional().describe("Filter by URL slug"),
  search: z.string().optional().describe("Filter by search query"),
  updated_at: z.string().optional().describe("Filter articles updated within a range or at an exact time. Format: 'start_datetime,end_datetime' for range, 'exact_datetime' for exact match. Both 'start_datetime' and 'end_datetime' should be in ISO 8601 format. If 'start_datetime' is provided and 'end_datetime' is blank, it filters articles updated from 'start_datetime' until now. Example: '2023-06-07T12:34:56Z,' If 'end_datetime' is provided and 'start_datetime' is blank, it filters articles updated from the past until 'end_datetime'. Example: ',2023-06-07T12:34:56Z' If both 'start_datetime' and 'end_datetime' are provided, it filters articles updated within that range. Example: '2023-06-01T12:34:56Z,2023-06-07T12:34:56Z'"),
});

export const GetArticleSchema = z.object({
  id: z.number().describe("ID of the requested article"),
});

export const CreateArticleSchema = z.object({
  content: z.string().optional().describe("Article content"),
  name: z.string().optional().describe("Article name"),
  enable_sharing: z.boolean().optional().describe("When true, the article has a public URL for non-authenticated users to view"),
  folder_id: z.number().optional().describe("Used to associate article with a folder"),
  company_id: z.number().optional().describe("Used to associate article with a company"),
});

export const UpdateArticleSchema = z.object({
  id: z.number().describe("The unique ID of the article to update"),
  content: z.string().optional().describe("Article content"),
  name: z.string().optional().describe("Article name"),
  enable_sharing: z.boolean().optional().describe("When true, the article has a public URL for non-authenticated users to view"),
  folder_id: z.number().optional().describe("Used to associate article with a folder"),
  company_id: z.number().optional().describe("Used to associate article with a company"),
});

export const ArchiveArticleSchema = z.object({
  id: z.number().describe("ID of the requested article"),
});

export const UnarchiveArticleSchema = z.object({
  id: z.number().describe("ID of the requested article"),
});
