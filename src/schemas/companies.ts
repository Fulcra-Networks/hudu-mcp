// Auto-generated from api-docs.json — do not edit by hand.
// Regenerate: npm run generate:schemas
import { z } from "zod";

export const ListCompaniesSchema = z.object({
  page: z.number().optional().describe("Retrieve the specified page of results"),
  page_size: z.number().optional().describe("Specify the number of results to return per page"),
  name: z.string().optional().describe("Filter companies by name"),
  phone_number: z.string().optional().describe("Filter companies by phone number"),
  website: z.string().optional().describe("Filter companies by website"),
  city: z.string().optional().describe("Filter companies by city"),
  id_number: z.string().optional().describe("Filter companies by id_number"),
  state: z.string().optional().describe("Filter companies by state"),
  slug: z.string().optional().describe("Filter companies by URL slug"),
  search: z.string().optional().describe("Filter companies by a search query"),
  id_in_integration: z.string().optional().describe("Filter companies by id/identifier in PSA/RMM/outside integration"),
  updated_at: z.string().optional().describe("Filter companies updated within a range or at an exact time"),
});

export const GetCompanySchema = z.object({
  id: z.number().describe("ID of the requested company"),
});

export const CreateCompanySchema = z.object({
  name: z.string().optional().describe("The name of the company"),
  nickname: z.string().optional().describe("The nickname of the company"),
  company_type: z.string().optional().describe("The type of the company"),
  address_line_1: z.string().optional().describe("The first line of the company's address"),
  address_line_2: z.string().optional().describe("The second line of the company's address"),
  city: z.string().optional().describe("The city where the company is located"),
  state: z.string().optional().describe("The state where the company is located"),
  zip: z.string().optional().describe("The zip code of the company's location"),
  country_name: z.string().optional().describe("The country where the company is located"),
  phone_number: z.string().optional().describe("The company's phone number"),
  fax_number: z.string().optional().describe("The company's fax number"),
  website: z.string().optional().describe("The company's website"),
  id_number: z.string().optional().describe("The company's ID number"),
  parent_company_id: z.number().optional().describe("The parent company's ID, if applicable"),
  notes: z.string().optional().describe("Additional notes about the company"),
});

export const UpdateCompanySchema = z.object({
  id: z.number().describe("ID of the company to update"),
  name: z.string().optional().describe("The name of the company"),
  nickname: z.string().optional().describe("The nickname of the company"),
  company_type: z.string().optional().describe("The type of the company"),
  address_line_1: z.string().optional().describe("The first line of the company's address"),
  address_line_2: z.string().optional().describe("The second line of the company's address"),
  city: z.string().optional().describe("The city where the company is located"),
  state: z.string().optional().describe("The state where the company is located"),
  zip: z.string().optional().describe("The zip code of the company's location"),
  country_name: z.string().optional().describe("The country where the company is located"),
  phone_number: z.string().optional().describe("The company's phone number"),
  fax_number: z.string().optional().describe("The company's fax number"),
  website: z.string().optional().describe("The company's website"),
  id_number: z.string().optional().describe("The company's ID number"),
  parent_company_id: z.number().optional().describe("The parent company's ID, if applicable"),
  notes: z.string().optional().describe("Additional notes about the company"),
});

export const ArchiveCompanySchema = z.object({
  id: z.number().describe("ID of the company to archive"),
});

export const UnarchiveCompanySchema = z.object({
  id: z.number().describe("ID of the company to unarchive"),
});
