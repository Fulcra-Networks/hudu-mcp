# Contributing to @fulcra-networks/hudu-mcp

Thank you for your interest in contributing! This document covers dev setup, conventions, and how to add new Hudu resources.

---

## Dev Setup

**Prerequisites:** Node.js 18+, npm

```bash
# Clone the repo
git clone https://github.com/Fulcra-Networks/hudu-mcp.git
cd hudu-mcp

# Install dependencies
npm install

# Copy env template and fill in your Hudu credentials
cp .env.example .env
```

---

## Running in Dev Mode

```bash
npm run dev
```

This runs `tsx src/index.ts` directly — no build step required. The server starts and listens on stdio. You won't see output in the terminal (that's correct — stdio transport is working).

To test it interactively, connect it to Claude Desktop or VS Code using the local path:

```json
{
  "mcpServers": {
    "hudu-dev": {
      "command": "npx",
      "args": ["tsx", "/absolute/path/to/hudu-mcp/src/index.ts"],
      "env": {
        "HUDU_BASE_URL": "https://your-instance.huducloud.com",
        "HUDU_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

---

## Type Checking

```bash
npm run typecheck
```

This runs `tsc --noEmit` — no output means no errors.

---

## Building

```bash
npm run build
```

Compiles TypeScript to `dist/`. The `dist/index.js` file is the published entry point.

---

## Project Structure

```
api-docs.json              # Swagger spec (manually downloaded from Hudu)
scripts/
└── generate-schemas.ts    # Reads api-docs.json, writes src/schemas/*.ts
src/
├── index.ts               # Entry point — loads .env, connects stdio transport
├── server.ts              # createHuduMcpServer() factory — no I/O here
├── client/
│   ├── HuduClient.ts      # All HTTP calls to the Hudu API
│   └── HuduApiError.ts
├── tools/
│   ├── index.ts           # registerAllTools() — calls all register* functions
│   ├── companies.ts       # Tool handlers for /companies
│   ├── assets.ts          # Tool handlers for /assets
│   └── ...
├── schemas/               # Auto-generated — do not edit by hand
│   ├── companies.ts
│   └── ...
└── types/
    ├── hudu.ts            # TypeScript interfaces for Hudu API response shapes
    └── mcp.ts             # formatToolSuccess() and formatToolError() helpers
```

---

## Schemas

Zod schemas in `src/schemas/` are **auto-generated** from the Swagger spec — do not edit them by hand.

### Updating schemas

1. Download a fresh `api-docs.json` from your Hudu instance (Settings → API → Swagger docs). This file is not publicly available and requires a logged-in session.
2. Replace `api-docs.json` at the project root.
3. Run the generator:

```bash
npm run generate:schemas
```

4. Run `npm run typecheck` to verify nothing broke.

### How the generator works

`scripts/generate-schemas.ts` reads `api-docs.json` and writes all schema files. It maps Swagger types to Zod types (`string` → `z.string()`, `number`/`integer` → `z.number()`, etc.) and pulls descriptions directly from the spec. No extra constraints (`.int()`, `.positive()`, `.max()`) are added beyond what Swagger specifies.

A small set of overrides handles cases where the spec is inaccurate:
- `custom_fields` in assets → `z.array(z.record(z.string()))` (Swagger just says `array` of `object`)
- `fromable_type`/`toable_type` in relations → `z.enum([...])` (Swagger has no `enum`, values are in description only)

---

## Adding a New Resource

Follow these steps to add support for a new Hudu resource (e.g. Websites):

### 1. Add client methods to `HuduClient.ts`

```typescript
// ── Websites ────────────────────────────────────────────────────────────────

async listWebsites(params?: Record<string, unknown>) {
  return this.request<{ websites: unknown[] }>("GET", "/websites", undefined, params);
}

async getWebsite(id: number) {
  return this.request<{ website: unknown }>("GET", `/websites/${id}`);
}
```

### 2. Add schema mappings to `scripts/generate-schemas.ts`

Add entries to the `buildSchemas()` function mapping Swagger paths to export names, then regenerate:

```bash
npm run generate:schemas
```

### 3. Create `src/tools/websites.ts`

```typescript
import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { HuduClient } from "../client/HuduClient.js";
import { formatToolSuccess, formatToolError } from "../types/mcp.js";
import { ListWebsitesSchema, GetWebsiteSchema } from "../schemas/websites.js";

const GetWebsitesInput = ListWebsitesSchema.extend({
  summary: z.boolean().optional().describe(
    "When true, return lightweight summaries instead of full details."
  ),
});

export function registerWebsiteTools(server: McpServer, client: HuduClient): void {
  server.tool(
    "hudu_get_websites",
    "Get websites from Hudu. Returns full details by default. Use summary: true for lightweight results.",
    GetWebsitesInput.shape,
    { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    async ({ summary, ...params }) => {
      try {
        const result = await client.listWebsites(params as Record<string, unknown>);
        if (summary) {
          // strip heavy fields if applicable
        }
        return formatToolSuccess(result);
      } catch (error) {
        return formatToolError(error);
      }
    }
  );

  // ... more tools
}
```

### 4. Register in `src/tools/index.ts`

```typescript
import { registerWebsiteTools } from "./websites.js";

export function registerAllTools(server: McpServer, client: HuduClient): void {
  // ... existing registrations
  registerWebsiteTools(server, client);
}
```

### 5. Add TypeScript interfaces to `src/types/hudu.ts` (optional but recommended)

### 6. Update `README.md` tool reference and `CONTRIBUTING.md` examples

### 7. Run `npm run typecheck` — fix any errors

---

## Conventions

- Tool naming follows a two-tier pattern:
  - `hudu_get_<resources>` (multiple) — query multiple items with filters, full details by default, optional `summary: true`
  - `hudu_get_<resource>` (singular) — get one item by ID
  - `hudu_create_<resource>`, `hudu_update_<resource>`, etc. — write operations
- All tools include MCP annotations (readOnlyHint, destructiveHint, idempotentHint, openWorldHint) to help clients understand tool behavior.
- The `summary` param is added via `.extend()` on the auto-generated `List*Schema` — never edit schema files directly
- All tool inputs validated with Zod schemas in `src/schemas/`
- Tool handlers never throw — always return `formatToolSuccess` or `formatToolError`
- All Zod fields use `.describe()` — these are what Claude reads to understand parameters
- Imports use `.js` extension (required for ESM/NodeNext module resolution)
- When adding or changing tools, update `README.md` tool reference and this file if affected

---

## Submitting a PR

1. Fork the repo and create a feature branch
2. Run `npm run typecheck` — must pass with zero errors
3. Open a pull request with a clear description of what you added
