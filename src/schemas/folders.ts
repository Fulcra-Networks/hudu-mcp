// Auto-generated from api-docs.json — do not edit by hand.
// Regenerate: npm run generate:schemas
import { z } from "zod";

export const ListFoldersSchema = z.object({
  name: z.string().optional().describe("Filter folders by name"),
  company_id: z.number().optional().describe("Filter folders by company ID"),
  in_company: z.boolean().optional().describe("When true, only returns company-specific KB articles"),
  page: z.number().optional().describe("The current page of results to retrieve"),
  page_size: z.number().optional().describe("The number of results to return per page"),
});

export const GetFolderSchema = z.object({
  id: z.number().describe("ID of the requested folder"),
});

export const CreateFolderSchema = z.object({
  name: z.string().optional().describe("Name of the folder"),
  icon: z.string().optional().describe("Icon for the folder"),
  description: z.string().optional().describe("Description of the folder"),
  parent_folder_id: z.number().optional().describe("ID of the parent folder (optional)"),
  company_id: z.number().optional().describe("ID of the associated company (optional)"),
});

export const UpdateFolderSchema = z.object({
  id: z.number().describe("ID of the folder to update"),
  name: z.string().optional().describe("Name of the folder"),
  icon: z.string().optional().describe("Icon for the folder"),
  description: z.string().optional().describe("Description of the folder"),
  parent_folder_id: z.number().optional().describe("ID of the parent folder (optional)"),
  company_id: z.number().optional().describe("ID of the associated company (optional)"),
});

export const DeleteFolderSchema = z.object({
  id: z.number().describe("ID of the folder to delete"),
});
