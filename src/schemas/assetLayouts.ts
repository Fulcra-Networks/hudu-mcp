// Auto-generated from api-docs.json — do not edit by hand.
// Regenerate: npm run generate:schemas
import { z } from "zod";

export const ListAssetLayoutsSchema = z.object({
  name: z.string().optional().describe("Filter by the name of the Asset Layout"),
  page: z.number().optional().describe("Get the current page of results"),
  slug: z.string().optional().describe("Filter by URL slug"),
  active: z.boolean().optional().describe("If true, the Asset Layout is active"),
  updated_at: z.string().optional().describe("Filter asset layouts updated within a range or at an exact time. Format: 'start_datetime,end_datetime' for range, 'exact_datetime' for exact match. Both 'start_datetime' and 'end_datetime' should be in ISO 8601 format. If 'start_datetime' is provided and 'end_datetime' is blank, it filters asset layouts updated from 'start_datetime' until now. Example: '2023-06-07T12:34:56Z,' If 'end_datetime' is provided and 'start_datetime' is blank, it filters asset layouts updated from the past until 'end_datetime'. Example: ',2023-06-07T12:34:56Z' If both 'start_datetime' and 'end_datetime' are provided, it filters asset layouts updated within that range. Example: '2023-06-01T12:34:56Z,2023-06-07T12:34:56Z'"),
});

export const GetAssetLayoutSchema = z.object({
  id: z.number().describe("ID of the requested Asset Layout"),
});
