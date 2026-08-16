import { NextResponse, type NextRequest } from "next/server";
import {
  isProductionApiUrl,
  isVercelPreviewEnv,
  TPL_PRODUCTION_API_BASE_URL,
} from "@/app/lib/api/apiTargetResolver";

const DEFAULT_BACKEND_BASE_URL = TPL_PRODUCTION_API_BASE_URL;

type RouteContext = {
  params: Promise<{
    path?: string[];
  }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  return proxyBackendRequest(request, context);
}

export async function POST(request: NextRequest, context: RouteContext) {
  return proxyBackendRequest(request, context);
}

export async function PUT(request: NextRequest, context: RouteContext) {
  return proxyBackendRequest(request, context);
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  return proxyBackendRequest(request, context);
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  return proxyBackendRequest(request, context);
}

async function proxyBackendRequest(request: NextRequest, context: RouteContext) {
  if (!isSmokeProxyEnabled()) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "SMOKE_BACKEND_PROXY_DISABLED",
          message: "Backend smoke proxy is disabled.",
        },
      },
      { status: 404 }
    );
  }

  const { path = [] } = await context.params;
  const backendPath = normalizeBackendPath(path);
  const backendBaseUrl = getBackendBaseUrl();
  if (!backendBaseUrl) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "SMOKE_BACKEND_PROXY_PREVIEW_TARGET_BLOCKED",
          message: "Preview backend smoke proxy requires an explicit non-production API target.",
        },
      },
      { status: 404 }
    );
  }

  const target = new URL(backendPath, backendBaseUrl);
  target.search = request.nextUrl.search;

  const headers = buildForwardHeaders(request, backendPath);
  const init: RequestInit = {
    method: request.method,
    headers,
    body: ["GET", "HEAD"].includes(request.method)
      ? undefined
      : await request.arrayBuffer(),
    cache: "no-store",
  };

  const response = await fetch(target, init);
  const responseHeaders = new Headers();
  const contentType = response.headers.get("content-type");
  if (contentType) responseHeaders.set("content-type", contentType);
  const requestId = response.headers.get("x-request-id");
  if (requestId) responseHeaders.set("x-request-id", requestId);

  return new NextResponse(await response.arrayBuffer(), {
    status: response.status,
    headers: responseHeaders,
  });
}

function isSmokeProxyEnabled() {
  const enabled =
    process.env.NEXT_PUBLIC_TPL_SMOKE_API_PROXY_ENABLED === "true";
  if (!enabled) return false;

  return (
    process.env.NODE_ENV !== "production" ||
    process.env.TPL_ALLOW_PRODUCTION_SMOKE_PROXY === "true"
  );
}

function getBackendBaseUrl() {
  const configured = (
    process.env.TPL_BACKEND_API_BASE_URL ||
    process.env.NEXT_PUBLIC_TPL_API_BASE_URL ||
    ""
  ).replace(/\/+$/, "");

  if (configured) {
    if (isVercelPreviewEnv() && isProductionApiUrl(configured)) return "";
    return configured;
  }

  if (isVercelPreviewEnv()) return "";
  return DEFAULT_BACKEND_BASE_URL;
}

function normalizeBackendPath(path: string[]) {
  const cleanPath = path.map((part) => encodeURIComponent(part)).join("/");
  if (!cleanPath) return "/api/v1/health";
  if (cleanPath === "api/v1" || cleanPath.startsWith("api/v1/")) {
    return `/${cleanPath}`;
  }
  return `/api/v1/${cleanPath}`;
}

function buildForwardHeaders(request: NextRequest, backendPath: string) {
  const headers = new Headers({
    accept: request.headers.get("accept") || "application/json",
  });

  const contentType = request.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);

  for (const headerName of [
    "authorization",
    "idempotency-key",
    "x-request-id",
  ]) {
    const value = request.headers.get(headerName);
    if (value) headers.set(headerName, value);
  }

  if (isGuestClaimPath(backendPath) && isGuestClaimSmokeProxyEnabled()) {
    const secret = process.env.TPL_GUEST_BOOKING_CLAIM_SMOKE_SECRET;
    if (secret) headers.set("x-tpl-guest-claim-secret", secret);
  }

  return headers;
}

function isGuestClaimPath(backendPath: string) {
  return /^\/api\/v1\/bookings\/[^/]+\/guest-claim\/(?:start|verify)$/.test(
    backendPath
  );
}

function isGuestClaimSmokeProxyEnabled() {
  return (
    process.env.TPL_GUEST_BOOKING_CLAIM_SMOKE_PROXY_ENABLED === "true" &&
    (process.env.NODE_ENV !== "production" ||
      process.env.TPL_ALLOW_PRODUCTION_SMOKE_PROXY === "true")
  );
}

