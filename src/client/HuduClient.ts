import { HuduApiError } from "./HuduApiError.js";

export interface HuduClientConfig {
  baseUrl: string;
  apiKey: string;
}

export class HuduClient {
  private readonly baseUrl: string;
  private readonly headers: Record<string, string>;

  constructor(config: HuduClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, "");
    this.headers = {
      "x-api-key": config.apiKey,
      "Content-Type": "application/json",
      Accept: "application/json",
    };
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
    params?: Record<string, unknown>
  ): Promise<T> {
    const url = new URL(`${this.baseUrl}/api/v1${path}`);

    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null) {
          url.searchParams.set(key, String(value));
        }
      }
    }

    const response = await fetch(url.toString(), {
      method,
      headers: this.headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(30_000),
    });

    if (!response.ok) {
      let message = `HTTP ${response.status} ${response.statusText}`;
      try {
        const errorBody = await response.text();
        if (errorBody) message += `: ${errorBody}`;
      } catch {
        // ignore
      }
      throw new HuduApiError(response.status, path, message);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return response.json() as Promise<T>;
  }

  // ── Companies ────────────────────────────────────────────────────────────────

  async listCompanies(params?: Record<string, unknown>) {
    return this.request<{ companies: unknown[] }>("GET", "/companies", undefined, params);
  }

  async getCompany(id: number) {
    return this.request<{ company: unknown }>("GET", `/companies/${id}`);
  }

  async createCompany(data: Record<string, unknown>) {
    return this.request<{ company: unknown }>("POST", "/companies", { company: data });
  }

  async updateCompany(id: number, data: Record<string, unknown>) {
    return this.request<{ company: unknown }>("PUT", `/companies/${id}`, { company: data });
  }

  async archiveCompany(id: number) {
    return this.request<{ company: unknown }>("PUT", `/companies/${id}/archive`);
  }

  async unarchiveCompany(id: number) {
    return this.request<{ company: unknown }>("PUT", `/companies/${id}/unarchive`);
  }

  // ── Assets ───────────────────────────────────────────────────────────────────

  async listAssets(params?: Record<string, unknown>) {
    return this.request<{ assets: unknown[] }>("GET", "/assets", undefined, params);
  }

  async getAsset(companyId: number, id: number) {
    return this.request<{ asset: unknown }>("GET", `/companies/${companyId}/assets/${id}`);
  }

  async createAsset(companyId: number, data: Record<string, unknown>) {
    return this.request<{ asset: unknown }>("POST", `/companies/${companyId}/assets`, { asset: data });
  }

  async updateAsset(companyId: number, id: number, data: Record<string, unknown>) {
    return this.request<{ asset: unknown }>("PUT", `/companies/${companyId}/assets/${id}`, { asset: data });
  }

  async archiveAsset(companyId: number, id: number) {
    return this.request<{ asset: unknown }>("PUT", `/companies/${companyId}/assets/${id}/archive`);
  }

  async unarchiveAsset(companyId: number, id: number) {
    return this.request<{ asset: unknown }>("PUT", `/companies/${companyId}/assets/${id}/unarchive`);
  }

  // ── Asset Layouts ─────────────────────────────────────────────────────────────

  async listAssetLayouts(params?: Record<string, unknown>) {
    return this.request<{ asset_layouts: unknown[] }>("GET", "/asset_layouts", undefined, params);
  }

  async getAssetLayout(id: number) {
    return this.request<{ asset_layout: unknown }>("GET", `/asset_layouts/${id}`);
  }

  // ── Articles ──────────────────────────────────────────────────────────────────

  async listArticles(params?: Record<string, unknown>) {
    return this.request<{ articles: unknown[] }>("GET", "/articles", undefined, params);
  }

  async getArticle(id: number) {
    return this.request<{ article: unknown }>("GET", `/articles/${id}`);
  }

  async createArticle(data: Record<string, unknown>) {
    return this.request<{ article: unknown }>("POST", "/articles", { article: data });
  }

  async updateArticle(id: number, data: Record<string, unknown>) {
    return this.request<{ article: unknown }>("PUT", `/articles/${id}`, { article: data });
  }

  async archiveArticle(id: number) {
    return this.request<{ article: unknown }>("PUT", `/articles/${id}/archive`);
  }

  async unarchiveArticle(id: number) {
    return this.request<{ article: unknown }>("PUT", `/articles/${id}/unarchive`);
  }

  // ── Relations ─────────────────────────────────────────────────────────────────

  async listRelations(params?: Record<string, unknown>) {
    return this.request<{ relations: unknown[] }>("GET", "/relations", undefined, params);
  }

  async createRelation(data: Record<string, unknown>) {
    return this.request<{ relation: unknown }>("POST", "/relations", { relation: data });
  }

  async deleteRelation(id: number) {
    return this.request<void>("DELETE", `/relations/${id}`);
  }

  // ── Flags ─────────────────────────────────────────────────────────────────────

  async listFlags(params?: Record<string, unknown>) {
    return this.request<{ flags: unknown[] }>("GET", "/flags", undefined, params);
  }

  async getFlag(id: number) {
    return this.request<{ flag: unknown }>("GET", `/flags/${id}`);
  }

  async createFlag(data: Record<string, unknown>) {
    return this.request<{ flag: unknown }>("POST", "/flags", { flag: data });
  }

  async updateFlag(id: number, data: Record<string, unknown>) {
    return this.request<{ flag: unknown }>("PUT", `/flags/${id}`, { flag: data });
  }

  async deleteFlag(id: number) {
    return this.request<void>("DELETE", `/flags/${id}`);
  }

  // ── Flag Types ────────────────────────────────────────────────────────────────

  async listFlagTypes(params?: Record<string, unknown>) {
    return this.request<{ flag_types: unknown[] }>("GET", "/flag_types", undefined, params);
  }

  async getFlagType(id: number) {
    return this.request<{ flag_type: unknown }>("GET", `/flag_types/${id}`);
  }

  // ── Websites ──────────────────────────────────────────────────────────────────
  // Unlike other resources, Hudu's website endpoints return bare objects/arrays
  // instead of a { website: ... } envelope — wrapped here to match the rest of the client.

  async listWebsites(params?: Record<string, unknown>) {
    const websites = await this.request<unknown[]>("GET", "/websites", undefined, params);
    return { websites };
  }

  async getWebsite(id: number) {
    const website = await this.request<unknown>("GET", `/websites/${id}`);
    return { website };
  }

  async createWebsite(data: Record<string, unknown>) {
    const website = await this.request<unknown>("POST", "/websites", { website: data });
    return { website };
  }

  async updateWebsite(id: number, data: Record<string, unknown>) {
    const website = await this.request<unknown>("PUT", `/websites/${id}`, { website: data });
    return { website };
  }

  async deleteWebsite(id: number) {
    return this.request<void>("DELETE", `/websites/${id}`);
  }
}
