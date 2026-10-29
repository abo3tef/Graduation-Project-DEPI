import type { Locale } from "@/i18n/routing";
import type { ProblemDetails } from "@/types/api";

const FALLBACK_API_URL = "http://localhost:5168";

export function getApiBaseUrl(): string {
  return (process.env.API_BASE_URL ?? FALLBACK_API_URL).replace(/\/+$/, "");
}

export interface ApiRequestOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  token?: string;
  locale: Locale;
  body?: unknown;
  query?: Record<string, string | number | boolean | null | undefined>;
  /** Requests for authenticated screens must never be cached. */
  cache?: RequestCache;
}

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly fieldErrors: Record<string, string[]>;
  readonly fieldCodes: Record<string, string[]>;

  constructor(
    status: number,
    code: string,
    message: string,
    fieldErrors: Record<string, string[]> = {},
    fieldCodes: Record<string, string[]> = {},
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.fieldErrors = fieldErrors;
    this.fieldCodes = fieldCodes;
  }
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions,
): Promise<T> {
  const url = new URL(`${getApiBaseUrl()}${path}`);

  for (const [key, value] of Object.entries(options.query ?? {})) {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  }

  const headers: Record<string, string> = {
    Accept: "application/json",
    "Accept-Language": options.locale,
  };

  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  let response: Response;
  try {
    response = await fetch(url, {
      method: options.method ?? "GET",
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      cache: options.cache ?? "no-store",
    });
  } catch {
    throw new ApiError(
      0,
      "network_error",
      "The Medilog API could not be reached.",
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get("content-type") ?? "";
  const payload = contentType.includes("json")
    ? await response.json().catch(() => null)
    : null;

  if (!response.ok) {
    const problem = (payload ?? {}) as ProblemDetails;
    throw new ApiError(
      response.status,
      problem.code ?? `http_${response.status}`,
      problem.detail ?? problem.title ?? "The request failed.",
      problem.errors ?? {},
      problem.codes ?? {},
    );
  }

  return payload as T;
}
