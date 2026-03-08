// Auto-generated from api-docs.json — do not edit by hand.
// Regenerate: npm run generate:schemas
import { z } from "zod";

export const ListFlagsSchema = z.object({
  flag_type_id: z.number().optional().describe("Filter by flag type ID"),
  flagable_type: z.string().optional().describe("Filter by flagable type (Asset, Website, Article, AssetPassword, Company, Procedure, RackStorage, Network, IpAddress, Vlan, VlanZone)"),
  flagable_id: z.number().optional().describe("Filter by flagable record ID"),
  description: z.string().optional().describe("Filter by description"),
  created_at: z.string().optional().describe("Filter by creation date (YYYY-MM-DD or ISO datetime)"),
  updated_at: z.string().optional().describe("Filter by update date (YYYY-MM-DD or ISO datetime)"),
  page: z.number().optional().describe("Page number for pagination"),
  page_size: z.number().optional().describe("Number of results per page (1-1000, default: 25)"),
});

export const GetFlagSchema = z.object({
  id: z.number().describe("ID of the Flag to retrieve"),
});

export const CreateFlagSchema = z.object({
  flag_type_id: z.number().describe("ID of the flag type"),
  description: z.string().optional().describe("Optional description for the flag"),
  flagable_type: z.enum(["Asset", "Website", "Article", "AssetPassword", "Company", "Procedure", "RackStorage", "Network", "IpAddress", "Vlan", "VlanZone"]).describe("The type of record being flagged"),
  flagable_id: z.number().describe("The ID of the record being flagged"),
});

export const UpdateFlagSchema = z.object({
  id: z.number().describe("ID of the Flag to update"),
  flag_type_id: z.number().optional().describe("ID of the flag type"),
  description: z.string().optional().describe("Description for the flag"),
  flagable_type: z.enum(["Asset", "Website", "Article", "AssetPassword", "Company", "Procedure", "RackStorage", "Network", "IpAddress", "Vlan", "VlanZone"]).optional().describe("The type of record being flagged"),
  flagable_id: z.number().optional().describe("The ID of the record being flagged"),
});

export const DeleteFlagSchema = z.object({
  id: z.number().describe("ID of the Flag to delete"),
});
