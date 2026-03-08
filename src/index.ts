#!/usr/bin/env node
import "dotenv/config";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createHuduMcpServer } from "./server.js";

const baseUrl = process.env["HUDU_BASE_URL"];
const apiKey = process.env["HUDU_API_KEY"];

if (!baseUrl) {
  process.stderr.write("Error: HUDU_BASE_URL environment variable is required.\n");
  process.exit(1);
}

if (!apiKey) {
  process.stderr.write("Error: HUDU_API_KEY environment variable is required.\n");
  process.exit(1);
}

const server = createHuduMcpServer({ baseUrl, apiKey });
const transport = new StdioServerTransport();

await server.connect(transport);
