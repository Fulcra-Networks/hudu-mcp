import { ZodError } from "zod";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { HuduApiError } from "../client/HuduApiError.js";

export function formatToolSuccess(data: unknown): CallToolResult {
  return {
    content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
  };
}

export function formatToolError(error: unknown): CallToolResult {
  if (error instanceof HuduApiError) {
    let message: string;
    if (error.isUnauthorized) {
      message = `Authentication failed — check your HUDU_API_KEY. (${error.endpoint})`;
    } else if (error.isNotFound) {
      message = `Resource not found. (${error.endpoint})`;
    } else {
      message = `Hudu API error ${error.status} on ${error.endpoint}: ${error.message}`;
    }
    return { content: [{ type: "text", text: message }], isError: true };
  }

  if (error instanceof ZodError) {
    const fields = error.errors
      .map((e) => `${e.path.join(".")}: ${e.message}`)
      .join("; ");
    return {
      content: [{ type: "text", text: `Validation error — ${fields}` }],
      isError: true,
    };
  }

  if (error instanceof Error) {
    const cause = (error as Error & { cause?: unknown }).cause;
    const causeDetail = cause instanceof Error ? ` — ${cause.message}` : "";

    // Node.js fetch() wraps network-level failures (DNS, refused, timeout, SSL)
    // as TypeError("fetch failed") with the real reason in error.cause
    if (error.message === "fetch failed") {
      return {
        content: [
          {
            type: "text",
            text: `Network error: could not reach Hudu${causeDetail}. Verify HUDU_BASE_URL is correct and the host is reachable.`,
          },
        ],
        isError: true,
      };
    }

    return {
      content: [{ type: "text", text: `Error: ${error.message}${causeDetail}` }],
      isError: true,
    };
  }

  return {
    content: [{ type: "text", text: "An unknown error occurred." }],
    isError: true,
  };
}
