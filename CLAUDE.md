# CLAUDE.md — hudu-mcp

## Project Overview

MCP server for the Hudu IT documentation platform. 30 tools across 7 resource types (companies, assets, articles, asset layouts, flags, flag types, relations).

## Key Files

- `src/index.ts` — Entry point (stdio transport only)
- `src/server.ts` — `createHuduMcpServer()` factory
- `src/client/HuduClient.ts` — Native fetch API client
- `src/tools/{resource}.ts` — `register*Tools(server, client)` per resource
- `src/schemas/{resource}.ts` — **Auto-generated** Zod schemas (do not hand-edit)
- `src/types/mcp.ts` — `formatToolSuccess()` / `formatToolError()`
- `scripts/generate-schemas.ts` — Reads `api-docs.json`, writes all schema files
- `api-docs.json` — Swagger spec, manually downloaded from a logged-in Hudu instance

## Commands

- `npm run typecheck` — `tsc --noEmit`
- `npm run build` — compiles to `dist/`
- `npm run generate:schemas` — regenerate `src/schemas/*.ts` from `api-docs.json`
- `npm run dev` — run server via tsx (stdio, no visible output)

## Schemas are auto-generated

Never edit files in `src/schemas/` directly. They are generated from `api-docs.json` by `scripts/generate-schemas.ts`. To update schemas: update `api-docs.json`, then run `npm run generate:schemas`.

The generator has overrides for Swagger inaccuracies:
- Asset `custom_fields` → `z.array(z.record(z.string()))` (Swagger just says `array` of `object`)
- Relation `fromable_type`/`toable_type` → `z.enum([...])` (Swagger has no enum, values only in description)
- Asset PUT body has no `properties` in Swagger (only `example`) — generator reuses POST body
- Article PUT `id` param description is `"undefined"` in Swagger — overridden via `DESC_OVERRIDES`
- Relation create fields are all optional in Swagger — `REQUIRED_OVERRIDES` marks the four type/id fields required

## Conventions

- Tool naming follows a two-tier pattern:
  - `hudu_get_<resources>` (multiple) — query multiple items with filters, returns full details by default. Accepts optional `summary: true` for lightweight results.
  - `hudu_get_<resource>` (singular) — get one item by ID, always returns full details
  - `hudu_create_<resource>`, `hudu_update_<resource>`, `hudu_archive_<resource>`, `hudu_unarchive_<resource>`, `hudu_delete_<resource>` — write operations
- All tools include MCP annotations (readOnlyHint, destructiveHint, idempotentHint, openWorldHint) passed as the 4th argument to `server.tool()`, before the callback.
- The `summary` param is added via `.extend()` on the auto-generated `List*Schema` in each tool file — not in the schema files themselves
- Tool handlers never throw — always return `formatToolSuccess` or `formatToolError`
- All Zod fields use `.describe()` — these are shown to Claude as parameter descriptions
- Imports use `.js` extension (ESM/NodeNext module resolution)
- Schemas export names like `ListCompaniesSchema`, `CreateAssetSchema`, etc. — tools reference `.shape`
- When adding or changing tools, update `README.md` tool reference and `CONTRIBUTING.md` examples if affected

## Known API Limitations

- Article creation is always attributed to the API key owner (no `user_id` param)
