import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { HuduClient } from "../client/HuduClient.js";
import { registerCompanyTools } from "./companies.js";
import { registerAssetTools } from "./assets.js";
import { registerAssetLayoutTools } from "./assetLayouts.js";
import { registerArticleTools } from "./articles.js";
import { registerRelationTools } from "./relations.js";
import { registerFlagTools } from "./flags.js";
import { registerFlagTypeTools } from "./flagTypes.js";
import { registerWebsiteTools } from "./websites.js";
import { registerFolderTools } from "./folders.js";

export function registerAllTools(server: McpServer, client: HuduClient): void {
  registerCompanyTools(server, client);
  registerAssetTools(server, client);
  registerAssetLayoutTools(server, client);
  registerArticleTools(server, client);
  registerRelationTools(server, client);
  registerFlagTools(server, client);
  registerFlagTypeTools(server, client);
  registerWebsiteTools(server, client);
  registerFolderTools(server, client);
}
