# @fulcra-networks/hudu-mcp

A Model Context Protocol (MCP) server for the [Hudu](https://www.hudu.com) IT documentation platform. Connect any LLM directly to your Hudu instance to manage companies, assets, knowledge base articles, and other IT systems documentation using natural language.

---

## Features

- **30 MCP tools** covering the core Hudu API surface
- **Companies** — get multiple, get by ID, create, update, archive, unarchive
- **Assets** — get multiple, get by ID, create, update, archive, unarchive (company-scoped)
- **Asset Layouts** — get multiple, get by ID (read-only)
- **Knowledge Base Articles** — get multiple, get by ID, create, update, archive, unarchive
- **Relations** — get multiple, create, delete (link any two Hudu records)
- **Flags** — get multiple, get by ID, create, update, delete
- **Flag Types** — get multiple, get by ID (read-only)
- **Summary mode** — all get-multiple tools accept `summary: true` for lightweight results
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

All get-multiple tools return **full details by default**. Pass `summary: true` to get lightweight results with heavy fields stripped (see [Summary Mode](#summary-mode) below).

### Companies

| Tool | Description |
|---|---|
| `get_companies` | Get companies with optional name/type/search filters |
| `get_company` | Get a company by ID |
| `create_company` | Create a new company |
| `update_company` | Update company fields |
| `archive_company` | Archive a company |
| `unarchive_company` | Unarchive a company |

### Assets

Assets in Hudu always belong to a company. All write operations require `company_id`.

| Tool | Description |
|---|---|
| `get_assets` | Get assets across all companies (optional filters) |
| `get_asset` | Get an asset by company ID and asset ID |
| `create_asset` | Create an asset under a company |
| `update_asset` | Update asset fields |
| `archive_asset` | Archive an asset |
| `unarchive_asset` | Unarchive an asset |

### Asset Layouts

| Tool | Description |
|---|---|
| `get_asset_layouts` | Get all asset layouts |
| `get_asset_layout` | Get an asset layout by ID |
| `get_asset_layout_fields` | Get field definitions (label, type, required, hint) for an asset layout — use before writing custom_fields |

### Knowledge Base Articles

| Tool | Description |
|---|---|
| `get_articles` | Get articles with optional company/draft/search filters |
| `get_article` | Get an article by ID |
| `create_article` | Create a new article |
| `update_article` | Update article content or metadata |
| `archive_article` | Archive an article |
| `unarchive_article` | Unarchive an article |

### Relations

| Tool | Description |
|---|---|
| `get_relations` | Get all relations between records |
| `create_relation` | Create a relation between two records |
| `delete_relation` | Delete a relation by ID |

### Flags

| Tool | Description |
|---|---|
| `get_flags` | Get flags with optional filters |
| `get_flag` | Get a flag by ID |
| `create_flag` | Add a flag to a record |
| `update_flag` | Update a flag |
| `delete_flag` | Remove a flag |

### Flag Types

| Tool | Description |
|---|---|
| `get_flag_types` | Get all flag types |
| `get_flag_type` | Get a flag type by ID |

---

## Summary Mode

All get-multiple tools (`get_companies`, `get_assets`, etc.) accept an optional `summary: true` parameter. When enabled, heavy fields are stripped to reduce response size:

| Resource | Fields stripped | Replacement |
|---|---|---|
| Companies | `notes`, `integrations` | _(dropped)_ |
| Assets | `cards` | _(dropped)_ |
| Articles | `content` | `content_preview` (first 200 chars) |
| Asset Layouts | `fields` | `field_count` (integer) |
| Relations | _(none — already lean)_ | — |
| Flags | _(none — already lean)_ | — |
| Flag Types | _(none — already lean)_ | — |

Use summary mode for browsing or scanning large result sets. Omit it (the default) to get full details.

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
