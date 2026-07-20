/**
 * Auto-generates Zod schema files from the Hudu Swagger spec (api-docs.json).
 *
 * Usage: npx tsx scripts/generate-schemas.ts
 *
 * The Swagger file must be manually downloaded from a logged-in Hudu instance.
 * Re-run this script after updating it.
 */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SPEC_PATH = join(ROOT, "api-docs.json");
const SCHEMAS_DIR = join(ROOT, "src", "schemas");

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SwaggerParam {
  name: string;
  type: string;
  in: string;
  required?: boolean;
  description?: string;
  enum?: string[];
}

interface SwaggerProperty {
  type: string;
  description?: string;
  enum?: string[];
  items?: { type: string };
}

interface SwaggerSchema {
  type: string;
  properties?: Record<string, SwaggerProperty>;
  required?: string[];
}

interface SwaggerBodyParam {
  name: string;
  in: "body";
  schema: SwaggerSchema;
}

interface SwaggerOperation {
  parameters?: (SwaggerParam | SwaggerBodyParam)[];
}

interface SwaggerSpec {
  paths: Record<string, Record<string, SwaggerOperation>>;
}

// ---------------------------------------------------------------------------
// Field definition for a generated schema
// ---------------------------------------------------------------------------

interface FieldDef {
  name: string;
  zodType: string; // e.g. "z.string()", "z.number()", "z.enum([...])"
  optional: boolean;
  description: string;
}

interface SchemaDef {
  exportName: string;
  fields: FieldDef[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function swaggerTypeToZod(type: string): string {
  switch (type) {
    case "string":
      return "z.string()";
    case "number":
    case "integer":
      return "z.number()";
    case "boolean":
      return "z.boolean()";
    default:
      return "z.unknown()";
  }
}

function escapeDesc(desc: string): string {
  return desc.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n");
}

function makeZodField(f: FieldDef): string {
  let expr = f.zodType;
  if (f.optional) expr += ".optional()";
  expr += `.describe("${escapeDesc(f.description)}")`;
  return `  ${f.name}: ${expr},`;
}

function renderSchema(s: SchemaDef): string {
  const lines = s.fields.map(makeZodField);
  return `export const ${s.exportName} = z.object({\n${lines.join("\n")}\n});`;
}

function renderFile(schemas: SchemaDef[]): string {
  const header = `// Auto-generated from api-docs.json — do not edit by hand.\n// Regenerate: npm run generate:schemas\n`;
  const imp = `import { z } from "zod";\n`;
  const body = schemas.map(renderSchema).join("\n\n");
  return `${header}${imp}\n${body}\n`;
}

// ---------------------------------------------------------------------------
// Extract params from Swagger spec
// ---------------------------------------------------------------------------

function getQueryParams(spec: SwaggerSpec, path: string, method: string): SwaggerParam[] {
  const op = spec.paths[path]?.[method];
  if (!op?.parameters) return [];
  return (op.parameters as SwaggerParam[]).filter((p) => p.in === "query");
}

function getPathParams(spec: SwaggerSpec, path: string, method: string): SwaggerParam[] {
  const op = spec.paths[path]?.[method];
  if (!op?.parameters) return [];
  return (op.parameters as SwaggerParam[]).filter((p) => p.in === "path");
}

interface BodyResult {
  properties: Record<string, SwaggerProperty>;
  required: string[];
}

function getBodyProperties(
  spec: SwaggerSpec,
  path: string,
  method: string,
  nestedKey?: string
): BodyResult {
  const op = spec.paths[path]?.[method];
  if (!op?.parameters) return { properties: {}, required: [] };
  const bodyParam = op.parameters.find((p) => p.in === "body") as SwaggerBodyParam | undefined;
  if (!bodyParam?.schema) return { properties: {}, required: [] };

  let schema = bodyParam.schema;
  if (nestedKey && schema.properties?.[nestedKey]) {
    const nested = schema.properties[nestedKey] as unknown as SwaggerSchema;
    schema = nested;
  }

  return {
    properties: schema.properties ?? {},
    required: schema.required ?? [],
  };
}

// ---------------------------------------------------------------------------
// Build FieldDefs from query params
// ---------------------------------------------------------------------------

function queryParamsToFields(params: SwaggerParam[], allOptional = true): FieldDef[] {
  return params.map((p) => {
    let zodType: string;
    if (p.enum) {
      zodType = `z.enum([${p.enum.map((v) => `"${v}"`).join(", ")}])`;
    } else {
      zodType = swaggerTypeToZod(p.type);
    }
    return {
      name: p.name,
      zodType,
      optional: allOptional ? true : !p.required,
      description: p.description ?? "",
    };
  });
}

function pathParamsToFields(params: SwaggerParam[], schemaName?: string): FieldDef[] {
  return params.map((p) => {
    const descKey = schemaName ? `${schemaName}.${p.name}` : "";
    const fallback = (p.description && p.description !== "undefined") ? p.description : `The ${p.name}`;
    return {
      name: p.name,
      zodType: swaggerTypeToZod(p.type),
      optional: false,
      description: DESC_OVERRIDES[descKey] ?? fallback,
    };
  });
}

// Overrides for fields Swagger doesn't describe accurately
const FIELD_TYPE_OVERRIDES: Record<string, string> = {
  "assets.custom_fields": 'z.array(z.record(z.string()))',
  "relations.fromable_type":
    'z.enum(["Asset", "Website", "Procedure", "AssetPassword", "Company", "Article"])',
  "relations.toable_type":
    'z.enum(["Asset", "Website", "Procedure", "AssetPassword", "Company", "Article"])',
};

// Fields that should be required even though Swagger doesn't mark them
const REQUIRED_OVERRIDES: Record<string, string[]> = {
  "relations.CreateRelationSchema": ["fromable_id", "fromable_type", "toable_id", "toable_type"],
  "folders.CreateFolderSchema": ["name"],
};

// Description overrides for fields with missing/bad descriptions
const DESC_OVERRIDES: Record<string, string> = {
  "UpdateArticleSchema.id": "The unique ID of the article to update",
};

function bodyPropsToFields(
  body: BodyResult,
  resourceKey: string,
  schemaName?: string
): FieldDef[] {
  const reqOverrides = schemaName
    ? REQUIRED_OVERRIDES[`${resourceKey}.${schemaName}`] ?? []
    : [];

  const fields: FieldDef[] = [];
  for (const [name, prop] of Object.entries(body.properties)) {
    const overrideKey = `${resourceKey}.${name}`;
    let zodType: string;
    if (FIELD_TYPE_OVERRIDES[overrideKey]) {
      zodType = FIELD_TYPE_OVERRIDES[overrideKey];
    } else if (prop.enum) {
      zodType = `z.enum([${prop.enum.map((v) => `"${v}"`).join(", ")}])`;
    } else {
      zodType = swaggerTypeToZod(prop.type);
    }

    const isRequired =
      reqOverrides.includes(name) || body.required.includes(name);

    const descKey = schemaName ? `${schemaName}.${name}` : "";
    const description = DESC_OVERRIDES[descKey] ?? prop.description ?? "";

    fields.push({
      name,
      zodType,
      optional: !isRequired,
      description,
    });
  }
  return fields;
}

// ---------------------------------------------------------------------------
// Schema mapping config
// ---------------------------------------------------------------------------

function buildSchemas(spec: SwaggerSpec): Record<string, SchemaDef[]> {
  const output: Record<string, SchemaDef[]> = {};

  // --- Companies ---
  output["companies.ts"] = [
    {
      exportName: "ListCompaniesSchema",
      fields: queryParamsToFields(getQueryParams(spec, "/companies", "get")),
    },
    {
      exportName: "GetCompanySchema",
      fields: pathParamsToFields(getPathParams(spec, "/companies/{id}", "get")),
    },
    {
      exportName: "CreateCompanySchema",
      fields: bodyPropsToFields(
        getBodyProperties(spec, "/companies", "post"),
        "companies"
      ),
    },
    {
      exportName: "UpdateCompanySchema",
      fields: [
        ...pathParamsToFields(getPathParams(spec, "/companies/{id}", "put")),
        ...bodyPropsToFields(
          getBodyProperties(spec, "/companies/{id}", "put"),
          "companies"
        ),
      ],
    },
    {
      exportName: "ArchiveCompanySchema",
      fields: pathParamsToFields(
        getPathParams(spec, "/companies/{id}/archive", "put")
      ),
    },
    {
      exportName: "UnarchiveCompanySchema",
      fields: pathParamsToFields(
        getPathParams(spec, "/companies/{id}/unarchive", "put")
      ),
    },
  ];

  // --- Articles ---
  output["articles.ts"] = [
    {
      exportName: "ListArticlesSchema",
      fields: queryParamsToFields(getQueryParams(spec, "/articles", "get")),
    },
    {
      exportName: "GetArticleSchema",
      fields: pathParamsToFields(getPathParams(spec, "/articles/{id}", "get")),
    },
    {
      exportName: "CreateArticleSchema",
      fields: bodyPropsToFields(
        getBodyProperties(spec, "/articles", "post"),
        "articles"
      ),
    },
    {
      exportName: "UpdateArticleSchema",
      fields: [
        ...pathParamsToFields(getPathParams(spec, "/articles/{id}", "put"), "UpdateArticleSchema"),
        ...bodyPropsToFields(
          getBodyProperties(spec, "/articles/{id}", "put"),
          "articles",
          "UpdateArticleSchema"
        ),
      ],
    },
    {
      exportName: "ArchiveArticleSchema",
      fields: pathParamsToFields(
        getPathParams(spec, "/articles/{id}/archive", "put")
      ),
    },
    {
      exportName: "UnarchiveArticleSchema",
      fields: pathParamsToFields(
        getPathParams(spec, "/articles/{id}/unarchive", "put")
      ),
    },
  ];

  // --- Assets ---
  // List uses GET /assets (global), Create uses POST /companies/{company_id}/assets
  // Note: PUT assets body has no `properties` in Swagger (only `example`),
  // so we reuse the POST body properties for UpdateAssetSchema.
  const assetCreateBody = getBodyProperties(spec, "/companies/{company_id}/assets", "post");
  output["assets.ts"] = [
    {
      exportName: "ListAssetsSchema",
      fields: queryParamsToFields(getQueryParams(spec, "/assets", "get")),
    },
    {
      exportName: "GetAssetSchema",
      fields: pathParamsToFields(
        getPathParams(spec, "/companies/{company_id}/assets/{id}", "get")
      ),
    },
    {
      exportName: "CreateAssetSchema",
      fields: [
        ...pathParamsToFields(
          getPathParams(spec, "/companies/{company_id}/assets", "post")
        ),
        ...bodyPropsToFields(assetCreateBody, "assets"),
      ],
    },
    {
      exportName: "UpdateAssetSchema",
      fields: [
        ...pathParamsToFields(
          getPathParams(spec, "/companies/{company_id}/assets/{id}", "put")
        ),
        // Reuse create body (PUT has no properties in Swagger), all optional for update
        ...bodyPropsToFields(assetCreateBody, "assets").map((f) => ({
          ...f,
          optional: true,
        })),
      ],
    },
    {
      exportName: "ArchiveAssetSchema",
      fields: pathParamsToFields(
        getPathParams(spec, "/companies/{company_id}/assets/{id}/archive", "put")
      ),
    },
    {
      exportName: "UnarchiveAssetSchema",
      fields: pathParamsToFields(
        getPathParams(spec, "/companies/{company_id}/assets/{id}/unarchive", "put")
      ),
    },
  ];

  // --- Asset Layouts ---
  output["assetLayouts.ts"] = [
    {
      exportName: "ListAssetLayoutsSchema",
      fields: queryParamsToFields(
        getQueryParams(spec, "/asset_layouts", "get")
      ),
    },
    {
      exportName: "GetAssetLayoutSchema",
      fields: pathParamsToFields(
        getPathParams(spec, "/asset_layouts/{id}", "get")
      ),
    },
  ];

  // --- Flags ---
  output["flags.ts"] = [
    {
      exportName: "ListFlagsSchema",
      fields: queryParamsToFields(getQueryParams(spec, "/flags", "get")),
    },
    {
      exportName: "GetFlagSchema",
      fields: pathParamsToFields(getPathParams(spec, "/flags/{id}", "get")),
    },
    {
      exportName: "CreateFlagSchema",
      fields: bodyPropsToFields(
        getBodyProperties(spec, "/flags", "post", "flag"),
        "flags"
      ),
    },
    {
      exportName: "UpdateFlagSchema",
      fields: [
        ...pathParamsToFields(getPathParams(spec, "/flags/{id}", "put")),
        ...bodyPropsToFields(
          getBodyProperties(spec, "/flags/{id}", "put", "flag"),
          "flags"
        ),
      ],
    },
    {
      exportName: "DeleteFlagSchema",
      fields: pathParamsToFields(
        getPathParams(spec, "/flags/{id}", "delete")
      ),
    },
  ];

  // --- Flag Types ---
  output["flagTypes.ts"] = [
    {
      exportName: "ListFlagTypesSchema",
      fields: queryParamsToFields(
        getQueryParams(spec, "/flag_types", "get")
      ),
    },
    {
      exportName: "GetFlagTypeSchema",
      fields: pathParamsToFields(
        getPathParams(spec, "/flag_types/{id}", "get")
      ),
    },
  ];

  // --- Websites ---
  output["websites.ts"] = [
    {
      exportName: "ListWebsitesSchema",
      fields: queryParamsToFields(getQueryParams(spec, "/websites", "get")),
    },
    {
      exportName: "GetWebsiteSchema",
      fields: pathParamsToFields(getPathParams(spec, "/websites/{id}", "get")),
    },
    {
      exportName: "CreateWebsiteSchema",
      fields: bodyPropsToFields(
        getBodyProperties(spec, "/websites", "post", "website"),
        "websites"
      ),
    },
    {
      exportName: "UpdateWebsiteSchema",
      fields: [
        ...pathParamsToFields(getPathParams(spec, "/websites/{id}", "put")),
        ...bodyPropsToFields(
          getBodyProperties(spec, "/websites/{id}", "put", "website"),
          "websites"
        ),
      ],
    },
    {
      exportName: "DeleteWebsiteSchema",
      fields: pathParamsToFields(
        getPathParams(spec, "/websites/{id}", "delete")
      ),
    },
  ];

  // --- Folders ---
  output["folders.ts"] = [
    {
      exportName: "ListFoldersSchema",
      fields: queryParamsToFields(getQueryParams(spec, "/folders", "get")),
    },
    {
      exportName: "GetFolderSchema",
      fields: pathParamsToFields(getPathParams(spec, "/folders/{id}", "get")),
    },
    {
      exportName: "CreateFolderSchema",
      fields: bodyPropsToFields(
        getBodyProperties(spec, "/folders", "post", "folder"),
        "folders"
      ),
    },
    {
      exportName: "UpdateFolderSchema",
      fields: [
        ...pathParamsToFields(getPathParams(spec, "/folders/{id}", "put")),
        ...bodyPropsToFields(
          getBodyProperties(spec, "/folders/{id}", "put", "folder"),
          "folders"
        ),
      ],
    },
    {
      exportName: "DeleteFolderSchema",
      fields: pathParamsToFields(
        getPathParams(spec, "/folders/{id}", "delete")
      ),
    },
  ];

  // --- Relations ---
  output["relations.ts"] = [
    {
      exportName: "ListRelationsSchema",
      fields: queryParamsToFields(getQueryParams(spec, "/relations", "get")),
    },
    {
      exportName: "CreateRelationSchema",
      fields: bodyPropsToFields(
        getBodyProperties(spec, "/relations", "post"),
        "relations",
        "CreateRelationSchema"
      ),
    },
    {
      exportName: "DeleteRelationSchema",
      fields: pathParamsToFields(
        getPathParams(spec, "/relations/{id}", "delete")
      ),
    },
  ];

  return output;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const spec: SwaggerSpec = JSON.parse(readFileSync(SPEC_PATH, "utf8"));
const allSchemas = buildSchemas(spec);

mkdirSync(SCHEMAS_DIR, { recursive: true });

for (const [filename, schemas] of Object.entries(allSchemas)) {
  const content = renderFile(schemas);
  const outPath = join(SCHEMAS_DIR, filename);
  writeFileSync(outPath, content, "utf8");
  console.log(`  wrote ${filename} (${schemas.length} schemas)`);
}

console.log("Done.");
