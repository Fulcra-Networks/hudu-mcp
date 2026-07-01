// Auto-generated from api-docs.json — do not edit by hand.
// Regenerate: npm run generate:schemas
import { z } from "zod";

export const ListWebsitesSchema = z.object({
  page: z.number().optional().describe("Get current page of results"),
  name: z.string().optional().describe("Filter websites by name"),
  page_size: z.number().optional().describe("Number of results to return per page"),
  slug: z.string().optional().describe("Filter by URL slug"),
  search: z.string().optional().describe("Filter by search query"),
  updated_at: z.string().optional().describe("Filter websites updated within a range or at an exact time. Format: 'start_datetime,end_datetime' for range, 'exact_datetime' for exact match. Both 'start_datetime' and 'end_datetime' should be in ISO 8601 format. If 'start_datetime' is provided and 'end_datetime' is blank, it filters websites updated from 'start_datetime' until now. Example: '2023-06-07T12:34:56Z,' If 'end_datetime' is provided and 'start_datetime' is blank, it filters websites updated from the past until 'end_datetime'. Example: ',2023-06-07T12:34:56Z' If both 'start_datetime' and 'end_datetime' are provided, it filters websites updated within that range. Example: '2023-06-01T12:34:56Z,2023-06-07T12:34:56Z'"),
});

export const GetWebsiteSchema = z.object({
  id: z.number().describe("ID of the requested website"),
});

export const CreateWebsiteSchema = z.object({
  company_id: z.number().describe("Used to associate website with company"),
  name: z.string().describe("The name or URL of the website"),
  notes: z.string().optional().describe("Add additional notes to a website"),
  paused: z.boolean().optional().describe("When true, website monitoring is paused"),
  disable_dns: z.boolean().optional().describe("When true, DNS monitoring is paused"),
  disable_ssl: z.boolean().optional().describe("When true, SSL certificate monitoring is paused"),
  disable_whois: z.boolean().optional().describe("When true, WHOIS monitoring is paused"),
});

export const UpdateWebsiteSchema = z.object({
  id: z.number().describe("ID of the requested website"),
  company_id: z.number().optional().describe("Used to associate website with company"),
  name: z.string().optional().describe("The name or URL of the website"),
  notes: z.string().optional().describe("Add additional notes to a website"),
  paused: z.boolean().optional().describe("When true, website monitoring is paused"),
  disable_dns: z.boolean().optional().describe("When true, DNS monitoring is paused"),
  disable_ssl: z.boolean().optional().describe("When true, SSL certificate monitoring is paused"),
  disable_whois: z.boolean().optional().describe("When true, WHOIS monitoring is paused"),
});

export const DeleteWebsiteSchema = z.object({
  id: z.number().describe("ID of the requested website"),
});
