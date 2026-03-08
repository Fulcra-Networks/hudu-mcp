import { createRequire } from "node:module";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { HuduClient } from "./client/HuduClient.js";
import { registerAllTools } from "./tools/index.js";

const require = createRequire(import.meta.url);
const { name, version } = require("../package.json") as { name: string; version: string };

export interface HuduMcpServerConfig {
  baseUrl: string;
  apiKey: string;
}

export function createHuduMcpServer(config: HuduMcpServerConfig): McpServer {
  const server = new McpServer({
    name,
    version,
  });

  const client = new HuduClient({
    baseUrl: config.baseUrl,
    apiKey: config.apiKey,
  });

  registerAllTools(server, client);

  return server;
}
