// Auto-generated from api-docs.json — do not edit by hand.
// Regenerate: npm run generate:schemas
import { z } from "zod";

export const ListRelationsSchema = z.object({
  page: z.number().optional().describe("Get the current page of results"),
  page_size: z.number().optional().describe("Number of results to return per page"),
});

export const CreateRelationSchema = z.object({
  toable_id: z.number().describe("The ID of the destination entity in the relation"),
  toable_type: z.enum(["Asset", "Website", "Procedure", "AssetPassword", "Company", "Article"]).describe("The type of the destination entity in the relation (Asset, Website, Procedure, AssetPassword, Company, Article)"),
  fromable_id: z.number().describe("The ID of the origin entity in the relation"),
  fromable_type: z.enum(["Asset", "Website", "Procedure", "AssetPassword", "Company", "Article"]).describe("The type of the origin entity in the relation (Asset, Website, Procedure, AssetPassword, Company, Article)"),
  description: z.string().optional().describe("Provide a description for the relation to explain the relationship between the two entities"),
  is_inverse: z.boolean().optional().describe("When a relation is created, it will also create another relation that is the inverse. When this is true, this relation is the inverse."),
});

export const DeleteRelationSchema = z.object({
  id: z.number().describe("ID of the Relation to be deleted"),
});
