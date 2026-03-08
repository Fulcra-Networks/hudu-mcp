// Auto-generated from api-docs.json — do not edit by hand.
// Regenerate: npm run generate:schemas
import { z } from "zod";

export const ListAssetsSchema = z.object({
  company_id: z.number().optional().describe("Filter assets by the parent company's ID"),
  id: z.number().optional().describe("Filter assets by their ID"),
  name: z.string().optional().describe("Filter assets by their name"),
  primary_serial: z.string().optional().describe("Filter assets by their primary serial number"),
  asset_layout_id: z.number().optional().describe("Filter assets by their associated asset layout's ID"),
  page: z.number().optional().describe("Specify the page number of results to return"),
  archived: z.boolean().optional().describe("Set to true to display only archived assets"),
  page_size: z.number().optional().describe("Limit the number of assets returned per page"),
  slug: z.string().optional().describe("Filter assets by their URL slug"),
  search: z.string().optional().describe("Filter assets using a search query"),
  updated_at: z.string().optional().describe("Filter assets updated within a range or at an exact time. Format: 'start_datetime,end_datetime' for range, 'exact_datetime' for exact match."),
});

export const GetAssetSchema = z.object({
  id: z.number().describe("The identifier of the requested Asset"),
  company_id: z.number().describe("The identifier of the requested parent Company"),
});

export const CreateAssetSchema = z.object({
  company_id: z.number().describe("The identifier of the parent company for the new asset"),
  name: z.string().optional().describe("The name of the new asset"),
  asset_layout_id: z.number().optional().describe("The identifier of the asset layout associated with the new asset"),
  primary_serial: z.string().optional().describe("The primary serial number of the new asset"),
  primary_mail: z.string().optional().describe("The primary email associated with the new asset"),
  primary_model: z.string().optional().describe("The primary model of the new asset"),
  primary_manufacturer: z.string().optional().describe("The primary manufacturer of the new asset"),
  custom_fields: z.array(z.record(z.string())).optional().describe("Array of custom fields with their values. Each object should have a single key-value pair where the key is the field label."),
});

export const UpdateAssetSchema = z.object({
  id: z.number().describe("The identifier of the requested Asset"),
  company_id: z.number().describe("The identifier of the requested parent Company"),
  name: z.string().optional().describe("The name of the new asset"),
  asset_layout_id: z.number().optional().describe("The identifier of the asset layout associated with the new asset"),
  primary_serial: z.string().optional().describe("The primary serial number of the new asset"),
  primary_mail: z.string().optional().describe("The primary email associated with the new asset"),
  primary_model: z.string().optional().describe("The primary model of the new asset"),
  primary_manufacturer: z.string().optional().describe("The primary manufacturer of the new asset"),
  custom_fields: z.array(z.record(z.string())).optional().describe("Array of custom fields with their values. Each object should have a single key-value pair where the key is the field label."),
});

export const ArchiveAssetSchema = z.object({
  id: z.number().describe("The identifier of the requested Asset"),
  company_id: z.number().describe("The identifier of the requested parent Company"),
});

export const UnarchiveAssetSchema = z.object({
  id: z.number().describe("The identifier of the requested Asset"),
  company_id: z.number().describe("The identifier of the requested parent Company"),
});
