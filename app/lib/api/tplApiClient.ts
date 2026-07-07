export type TplApiMeta = {
  requestId: string;
  apiVersion: "v1";
  pagination?: {
    limit: number;
    offset: number;
    total: number;
  };
};

export type TplApiErrorPayload = {
  code: string;
  message: string;
  details?: unknown;
  fieldErrors?: unknown[];
};

export type TplApiSuccess<TData> = {
  ok: true;
  data: TData;
  meta: TplApiMeta;
  status: number;
  requestId: string;
};

export type TplApiFailure = {
  ok: false;
  error: TplApiErrorPayload;
  meta?: Partial<TplApiMeta>;
  status: number;
  requestId: string;
  fallback: boolean;
};

export type TplApiResult<TData> = TplApiSuccess<TData> | TplApiFailure;

export type TplApiRequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  headers?: Record<string, string>;
  idempotencyKey?: string;
  requestId?: string;
  authToken?: string | null;
  fallbackOnError?: boolean;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_TPL_API_BASE_URL?.replace(/\/+$/, "") || "";
const AUTH_STORAGE_KEY = "tpl_auth_session_v1";

export function getTplApiBaseUrl(): string {
  return API_BASE_URL;
}

export function isTplApiConfigured(): boolean {
  return Boolean(API_BASE_URL);
}

export function createTplRequestId(prefix = "tpl_web"): string {
  const randomValue =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  return `${prefix}_${randomValue}`;
}

export async function tplApiRequest<TData>(
  path: string,
  options: TplApiRequestOptions = {}
): Promise<TplApiResult<TData>> {
  const requestId = options.requestId || createTplRequestId();
  const fallbackOnError = options.fallbackOnError ?? true;

  if (!API_BASE_URL) {
    return buildFallbackFailure(requestId, "TPL_API_NOT_CONFIGURED", "TPL API base URL is not configured.", 0);
  }

  const headers: Record<string, string> = {
    Accept: "application/json",
    "X-Request-Id": requestId,
    ...options.headers,
  };

  if (typeof options.body !== "undefined") {
    headers["Content-Type"] = "application/json";
  }

  if (options.idempotencyKey) {
    headers["Idempotency-Key"] = options.idempotencyKey;
  }

  const authToken = options.authToken ?? readStoredAuthToken();
  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${normalizePath(path)}`, {
      method: options.method || "GET",
      headers,
      body: typeof options.body === "undefined" ? undefined : JSON.stringify(options.body),
    });

    const payload = await readJsonBody(response);
    const meta = readMeta(payload);
    const responseRequestId = meta?.requestId || response.headers.get("x-request-id") || requestId;

    if (response.ok && payload && payload.ok === true) {
      return {
        ok: true,
        data: payload.data as TData,
        meta: meta as TplApiMeta,
        status: response.status,
        requestId: responseRequestId,
      };
    }

    const apiError = readError(payload);
    return {
      ok: false,
      error: apiError,
      meta,
      status: response.status,
      requestId: responseRequestId,
      fallback: fallbackOnError,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "TPL API request failed.";
    return buildFallbackFailure(requestId, "TPL_API_NETWORK_ERROR", message, 0);
  }
}

function normalizePath(path: string): string {
  return path.startsWith("/") ? path : `/${path}`;
}

async function readJsonBody(response: Response): Promise<Record<string, unknown> | null> {
  const text = await response.text();
  if (!text) return null;

  try {
    const parsed = JSON.parse(text);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function readMeta(payload: Record<string, unknown> | null): Partial<TplApiMeta> | undefined {
  if (!payload?.meta || typeof payload.meta !== "object" || Array.isArray(payload.meta)) return undefined;
  return payload.meta as Partial<TplApiMeta>;
}

function readError(payload: Record<string, unknown> | null): TplApiErrorPayload {
  if (payload?.error && typeof payload.error === "object" && !Array.isArray(payload.error)) {
    const error = payload.error as Record<string, unknown>;
    return {
      code: typeof error.code === "string" ? error.code : "TPL_API_ERROR",
      message: typeof error.message === "string" ? error.message : "TPL API request failed.",
      details: error.details,
      fieldErrors: Array.isArray(error.fieldErrors) ? error.fieldErrors : undefined,
    };
  }

  return {
    code: "TPL_API_INVALID_RESPONSE",
    message: "TPL API returned an unexpected response.",
  };
}

function buildFallbackFailure(
  requestId: string,
  code: string,
  message: string,
  status: number
): TplApiFailure {
  return {
    ok: false,
    error: { code, message },
    status,
    requestId,
    fallback: true,
  };
}

function readStoredAuthToken(): string | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;
    const session = parsed as Record<string, unknown>;

    return readTokenValue(session) || readTokenValue(session.session) || readTokenValue(session.auth);
  } catch {
    return null;
  }
}

function readTokenValue(source: unknown): string | null {
  if (!source || typeof source !== "object" || Array.isArray(source)) return null;
  const record = source as Record<string, unknown>;
  const token =
    record.sessionToken ||
    record.accessToken ||
    record.token ||
    record.authToken ||
    record.bearerToken;
  return typeof token === "string" && token.trim() ? token.trim() : null;
}

