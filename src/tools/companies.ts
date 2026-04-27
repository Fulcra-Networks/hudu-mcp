import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { HuduClient } from "../client/HuduClient.js";
import { formatToolSuccess, formatToolError, withPaginationMeta } from "../types/mcp.js";
import {
  ListCompaniesSchema,
  GetCompanySchema,
  CreateCompanySchema,
  UpdateCompanySchema,
  ArchiveCompanySchema,
  UnarchiveCompanySchema,
} from "../schemas/companies.js";

const GetCompaniesInput = ListCompaniesSchema.extend({
  summary: z.boolean().optional().describe(
    "When true, return lightweight summaries instead of full details. Useful for browsing or scanning large result sets."
  ),
});

export function registerCompanyTools(server: McpServer, client: HuduClient): void {
  server.registerTool(
    "hudu_get_companies",
    {
      description: "Get companies from Hudu. Returns full details by default. Optionally filter by name, company type, or a search term. Use summary: true for lightweight results.",
      inputSchema: GetCompaniesInput.shape,
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async ({ summary, ...params }) => {
      try {
        const result = await client.listCompanies(params as Record<string, unknown>);
        if (summary) {
          const items = (result.companies as Record<string, unknown>[]).map(
            ({ notes, integrations, ...rest }) => rest
          );
          return formatToolSuccess(withPaginationMeta({ companies: items }, "companies", params));
        }
        return formatToolSuccess(withPaginationMeta(result as Record<string, unknown>, "companies", params));
      } catch (error) {
        return formatToolError(error);
      }
    }
  );

  server.registerTool(
    "hudu_get_company",
    {
      description: "Get a single company from Hudu by its ID.",
      inputSchema: GetCompanySchema.shape,
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async ({ id }) => {
      try {
        const result = await client.getCompany(id);
        return formatToolSuccess(result);
      } catch (error) {
        return formatToolError(error);
      }
    }
  );

  server.registerTool(
    "hudu_create_company",
    {
      description: "Create a new company in Hudu. Only the name is required; all other fields are optional.",
      inputSchema: CreateCompanySchema.shape,
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
    },
    async (args) => {
      try {
        const result = await client.createCompany(args as Record<string, unknown>);
        return formatToolSuccess(result);
      } catch (error) {
        return formatToolError(error);
      }
    }
  );

  server.registerTool(
    "hudu_update_company",
    {
      description: "Update an existing company in Hudu. Provide only the fields you want to change.",
      inputSchema: UpdateCompanySchema.shape,
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async ({ id, ...data }) => {
      try {
        const result = await client.updateCompany(id, data as Record<string, unknown>);
        return formatToolSuccess(result);
      } catch (error) {
        return formatToolError(error);
      }
    }
  );

  server.registerTool(
    "hudu_archive_company",
    {
      description: "Archive a company in Hudu. Archived companies are hidden from normal views but not deleted.",
      inputSchema: ArchiveCompanySchema.shape,
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async ({ id }) => {
      try {
        const result = await client.archiveCompany(id);
        return formatToolSuccess(result);
      } catch (error) {
        return formatToolError(error);
      }
    }
  );

  server.registerTool(
    "hudu_unarchive_company",
    {
      description: "Unarchive a previously archived company in Hudu, making it visible again.",
      inputSchema: UnarchiveCompanySchema.shape,
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async ({ id }) => {
      try {
        const result = await client.unarchiveCompany(id);
        return formatToolSuccess(result);
      } catch (error) {
        return formatToolError(error);
      }
    }
  );
}
