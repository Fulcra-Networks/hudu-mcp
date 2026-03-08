// Auto-generated from api-docs.json — do not edit by hand.
// Regenerate: npm run generate:schemas
import { z } from "zod";

export const ListFlagTypesSchema = z.object({
  name: z.string().optional().describe("Filter by exact flag type name"),
  color: z.string().optional().describe("Filter by exact color value (e.g., #FF0000)"),
  slug: z.string().optional().describe("Filter by exact slug value"),
  created_at: z.string().optional().describe("Filter by creation date (YYYY-MM-DD or ISO datetime)"),
  updated_at: z.string().optional().describe("Filter by update date (YYYY-MM-DD or ISO datetime)"),
  page: z.number().optional().describe("Page number for pagination"),
  page_size: z.number().optional().describe("Number of results per page (1-1000, default: 25)"),
});

export const GetFlagTypeSchema = z.object({
  id: z.number().describe("ID of the Flag Type to retrieve"),
});
