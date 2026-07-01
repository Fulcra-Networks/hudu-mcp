# @fulcra-networks/hudu-mcp

A Model Context Protocol (MCP) server for the [Hudu](https://www.hudu.com) IT documentation platform. Connect any LLM directly to your Hudu instance to manage companies, assets, knowledge base articles, and other IT systems documentation using natural language.

---

## Features

- **35 MCP tools** covering the core Hudu API surface
- **Companies** — get multiple, get by ID, create, update, archive, unarchive
- **Assets** — get multiple, get by ID, create, update, archive, unarchive (company-scoped)
- **Asset Layouts** — get multiple, get by ID (read-only)
- **Knowledge Base Articles** — get multiple, get by ID, create, update, archive, unarchive
- **Relations** — get multiple, create, delete (link any two Hudu records)
- **Flags** — get multiple, get by ID, create, update, delete
- **Flag Types** — get multiple, get by ID (read-only)
- **Websites** — get multiple, get by ID, create, update, delete (Core assets — HTTP/SSL/DNS/WHOIS monitoring)
- **Three response modes** — default (null-stripped), `summary: true` (lightweight), `full_detail: true` (raw API response)
- Clean error messages for auth failures, missing resources, and validation errors
- Works with Claude Desktop, VS Code MCP extension, and all stdio-based MCP clients

---

## Prerequisites

- Node.js 18 or later
- A Hudu instance with API access
- Your Hudu API key (Settings → API Keys in Hudu)

---

## Installation

### Option 1 — npx (no install required)

```bash
npx @fulcra-networks/hudu-mcp
```

### Option 2 — Global install

```bash
npm install -g @fulcra-networks/hudu-mcp
hudu-mcp
```

### Option 3 — Build from source

```bash
git clone https://github.com/fulcra-networks/hudu-mcp.git
cd hudu-mcp
npm install
npm run build
node dist/index.js
```

---

## Configuration

The server reads two environment variables. Create your API key in Hudu: Admin → API Keys.

| Variable | Description |
|---|---|
| `HUDU_BASE_URL` | Your Hudu instance URL, e.g. `https://docs.example.com` |
| `HUDU_API_KEY` | Your Hudu API key |

Create a `.env` file in the project root (copy from `.env.example`):

```
HUDU_BASE_URL=https://your-instance.huducloud.com
HUDU_API_KEY=your-api-key-here
```

---

## Claude Desktop Setup

Add to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "hudu": {
      "command": "npx",
      "args": ["-y", "@fulcra-networks/hudu-mcp"],
      "env": {
        "HUDU_BASE_URL": "https://your-instance.huducloud.com",
        "HUDU_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

---

## VS Code Setup

Add to your VS Code MCP settings:

```json
{
  "mcp": {
    "servers": {
      "hudu": {
        "type": "stdio",
        "command": "npx",
        "args": ["-y", "@fulcra-networks/hudu-mcp"],
        "env": {
          "HUDU_BASE_URL": "https://your-instance.huducloud.com",
          "HUDU_API_KEY": "your-api-key-here"
        }
      }
    }
  }
}
```

---

## Tool Reference

All get-multiple tools return **full details by default** (null values stripped). Pass `summary: true` to get lightweight results with heavy fields stripped, or `full_detail: true` for the raw API response including null values (see [Response Modes](#response-modes) below).

### Companies

| Tool | Description |
|---|---|
| `hudu_get_companies` | Get companies with optional name/type/search filters |
| `hudu_get_company` | Get a company by ID |
| `hudu_create_company` | Create a new company |
| `hudu_update_company` | Update company fields |
| `hudu_archive_company` | Archive a company |
| `hudu_unarchive_company` | Unarchive a company |

### Assets

Assets in Hudu always belong to a company. All write operations require `company_id`.

| Tool | Description |
|---|---|
| `hudu_get_assets` | Get assets across all companies (optional filters) |
| `hudu_get_asset` | Get an asset by company ID and asset ID |
| `hudu_create_asset` | Create an asset under a company |
| `hudu_update_asset` | Update asset fields |
| `hudu_archive_asset` | Archive an asset |
| `hudu_unarchive_asset` | Unarchive an asset |

### Asset Layouts

| Tool | Description |
|---|---|
| `hudu_get_asset_layouts` | Get all asset layouts |
| `hudu_get_asset_layout` | Get an asset layout by ID |
| `hudu_get_asset_layout_fields` | Get field definitions (label, type, required, hint) for an asset layout — use before writing custom_fields |

### Knowledge Base Articles

| Tool | Description |
|---|---|
| `hudu_get_articles` | Get articles with optional company/draft/search filters |
| `hudu_get_article` | Get an article by ID |
| `hudu_create_article` | Create a new article |
| `hudu_update_article` | Update article content or metadata |
| `hudu_archive_article` | Archive an article |
| `hudu_unarchive_article` | Unarchive an article |

### Relations

| Tool | Description |
|---|---|
| `hudu_get_relations` | Get all relations between records |
| `hudu_create_relation` | Create a relation between two records |
| `hudu_delete_relation` | Delete a relation by ID |

### Flags

| Tool | Description |
|---|---|
| `hudu_get_flags` | Get flags with optional filters |
| `hudu_get_flag` | Get a flag by ID |
| `hudu_create_flag` | Add a flag to a record |
| `hudu_update_flag` | Update a flag |
| `hudu_delete_flag` | Remove a flag |

### Flag Types

| Tool | Description |
|---|---|
| `hudu_get_flag_types` | Get all flag types |
| `hudu_get_flag_type` | Get a flag type by ID |

### Websites

Websites are what the Hudu UI calls "Core" assets — monitored URLs with HTTP status, SSL, DNS, and WHOIS checks. Hudu has no archive/unarchive tier for websites; delete is permanent.

| Tool | Description |
|---|---|
| `hudu_get_websites` | Get websites with optional name/slug/search filters |
| `hudu_get_website` | Get a website by ID |
| `hudu_create_website` | Create a new website under a company |
| `hudu_update_website` | Update website fields |
| `hudu_delete_website` | Delete a website |

---

## Response Modes

All read tools support three response modes:

| Mode | Parameter | Behavior |
|---|---|---|
| **Default** | _(omit both)_ | Full API response with null values stripped. Best for most tasks. |
| **Summary** | `summary: true` | Lightweight results — heavy fields stripped per resource (see table below). Use for browsing or scanning large result sets. |
| **Full detail** | `full_detail: true` | Raw API response including null values. Use when exploring unpopulated fields (e.g. integration card fields). |

`summary` takes precedence over `full_detail` if both are set.

### Summary mode — fields stripped

| Resource | Fields stripped | Replacement |
|---|---|---|
| Companies | `notes`, `integrations` | _(dropped)_ |
| Assets | `cards` | _(dropped)_ |
| Articles | `content` | `content_preview` (first 200 chars) |
| Asset Layouts | `fields` | `field_count` (integer) |
| Relations | _(none — already lean)_ | — |
| Flags | _(none — already lean)_ | — |
| Flag Types | _(none — already lean)_ | — |
| Websites | _(none — already lean)_ | — |

---

## Example Prompts

Once connected, you can ask Claude things like:

**Browsing & discovery**
- _"Give me a quick summary of all our clients"_
- _"What asset layouts do we have configured?"_
- _"Show me all knowledge base articles tagged with onboarding"_

**Finding assets across clients**
- _"Show me all assets for Acme Corp"_
- _"List every server across all our clients — just names and companies"_
- _"Find all machines still running Windows Server 2012 or older"_
- _"List every instance of Veeam Backup and which company it belongs to"_
- _"Which clients have a firewall asset documented?"_

**Linking records**
- _"Create a relation between Acme Corp's file server and their Veeam backup asset"_
- _"Which assets are linked to Contoso's Active Directory server?"_

**Day-to-day operations**
- _"Create a new company for Blue Ridge Technologies with website blueridgetech.com"_
- _"Archive Riverside Dental — we stopped managing them last month"_
- _"Update the phone number for Woodfield Legal to 555-0100"_
- _"Flag Acme Corp's main router as needing attention"_
- _"Draft a knowledge base article on our standard workstation imaging procedure"_

---

## Contributing
Contributions are welcome.

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development setup and how to add new resources.

---

## License

MIT — see [LICENSE](./LICENSE).

---

Maintained by [Fulcra](https://www.fulcra.net/) — managed IT services and solutions for businesses and IT departments.
