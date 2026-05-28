import { ZodError } from "zod";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { HuduApiError } from "../client/HuduApiError.js";

const MAX_RESPONSE_CHARS = 50_000;

function stripNullValues(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(stripNullValues);
  }
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([, v]) => v !== null)
        .map(([k, v]) => [k, stripNullValues(v)])
    );
  }
  return value;
}

export function formatToolSuccess(data: unknown, options?: { preserveNulls?: boolean }): CallToolResult {
  const processed = options?.preserveNulls ? data : stripNullValues(data);
  const text = JSON.stringify(processed, null, 2);
  if (text.length > MAX_RESPONSE_CHARS) {
    return {
      content: [{
        type: "text",
        text: text.slice(0, MAX_RESPONSE_CHARS)
          + "\n\n[Response truncated — use page_size, filters, or summary: true to reduce results]",
      }],
    };
  }
  return { content: [{ type: "text", text }] };
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

export function withPaginationMeta(
  data: Record<string, unknown>,
  itemsKey: string,
  params: Record<string, unknown>
): Record<string, unknown> {
  const items = data[itemsKey];
  const count = Array.isArray(items) ? items.length : 0;
  const page = typeof params.page === "number" ? params.page : 1;
  const pageSize = typeof params.page_size === "number" ? params.page_size : undefined;

  return {
    ...data,
    _pagination: {
      count,
      page,
      ...(pageSize !== undefined ? { has_more: count >= pageSize } : {}),
      ...(pageSize !== undefined && count >= pageSize ? { next_page: page + 1 } : {}),
    },
  };
}
