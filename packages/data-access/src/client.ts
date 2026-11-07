import { apiErrorBodySchema, type ApiErrorCode } from "@ayahloop/shared";
import type { z } from "zod";

export class ApiClientError extends Error {
  readonly status: number;
  readonly code: ApiErrorCode;
  readonly details: Record<string, unknown> | undefined;

  constructor(
    status: number,
    code: ApiErrorCode,
    message: string,
    details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function isPermissionError(error: unknown): error is ApiClientError {
  return error instanceof ApiClientError && (error.status === 403 || error.code === "forbidden");
}

export interface ApiClientOptions {
  readonly baseUrl?: string;
  readonly fetchImpl?: typeof fetch;
  readonly credentials?: "omit" | "same-origin" | "include";
  readonly getAccessToken?: () => Promise<string | null> | string | null;
  readonly refreshAccessToken?: () => Promise<string | null>;
  readonly onUnauthorized?: () => void;
  readonly onForbidden?: () => void;
}

export interface RequestConfig<T> {
  readonly method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  readonly path: string;
  readonly query?: Readonly<Record<string, string | number | boolean | undefined>>;
  readonly body?: unknown;
  readonly schema: z.ZodType<T>;
  readonly headers?: Readonly<Record<string, string>>;
}

export interface ApiClient {
  request<T>(config: RequestConfig<T>): Promise<T>;
}

function buildUrl(
  baseUrl: string,
  path: string,
  query?: Readonly<Record<string, string | number | boolean | undefined>>,
): string {
  const cleanBase = baseUrl.replace(/\/+$/, "");
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const full = `${cleanBase}${cleanPath}`;
  if (!query) return full;
  const search = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    if (v !== undefined) search.set(k, String(v));
  }
  const qs = search.toString();
  return qs ? `${full}?${qs}` : full;
}

export function createApiClient(options: ApiClientOptions = {}): ApiClient {
  const fetchFn = options.fetchImpl ?? fetch;
  const baseUrl = options.baseUrl ?? "";

  async function execute<T>(config: RequestConfig<T>, tokenOverride?: string | null): Promise<Response> {
    const token =
      tokenOverride !== undefined
        ? tokenOverride
        : options.getAccessToken
          ? await options.getAccessToken()
          : null;
    const headers: Record<string, string> = {
      Accept: "application/json",
      ...config.headers,
    };
    if (config.body !== undefined) {
      headers["Content-Type"] = "application/json";
    }
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const init: RequestInit = {
      method: config.method ?? "GET",
      headers,
    };
    if (options.credentials !== undefined) {
      init.credentials = options.credentials;
    }
    if (config.body !== undefined) {
      init.body = JSON.stringify(config.body);
    }

    return fetchFn(buildUrl(baseUrl, config.path, config.query), init);
  }

  return {
    async request<T>(config: RequestConfig<T>): Promise<T> {
      let response = await execute(config);

      if (response.status === 401 && options.refreshAccessToken) {
        const refreshed = await options.refreshAccessToken();
        if (refreshed) {
          response = await execute(config, refreshed);
        }
      }

      if (response.status === 401) {
        options.onUnauthorized?.();
      }
      if (response.status === 403) {
        options.onForbidden?.();
      }

      const rawText = await response.text();
      let json: unknown = null;
      if (rawText.length > 0) {
        try {
          json = JSON.parse(rawText);
        } catch {
          json = null;
        }
      }

      if (!response.ok) {
        const parsedError = apiErrorBodySchema.safeParse(json);
        if (parsedError.success) {
          throw new ApiClientError(
            response.status,
            parsedError.data.error.code,
            parsedError.data.error.message,
            parsedError.data.error.details,
          );
        }
        throw new ApiClientError(
          response.status,
          response.status === 403
            ? "forbidden"
            : response.status === 401
              ? "unauthenticated"
              : response.status === 404
                ? "not_found"
                : "internal_error",
          `HTTP ${response.status}`,
        );
      }

      return config.schema.parse(json);
    },
  };
}
