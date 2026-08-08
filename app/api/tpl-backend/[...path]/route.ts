import { NextRequest, NextResponse } from "next/server";

const LOCAL_BACKEND_BASE_URL = "http://127.0.0.1:4000";
const ALLOWED_PREFIX = "api/v1/";

function getBackendBaseUrl() {
  return (
    process.env.TPL_BACKEND_BASE_URL ||
    process.env.TPL_API_BASE_URL ||
    process.env.NEXT_PUBLIC_TPL_API_BASE_URL ||
    LOCAL_BACKEND_BASE_URL
  ).replace(/\/$/, "");
}

type RouteContext = {
  params: Promise<{ path?: string[] }>;
};

async function proxyTplBackendRequest(
  request: NextRequest,
  context: RouteContext
) {
  const { path = [] } = await context.params;
  const backendPath = path.join("/");

  if (!backendPath.startsWith(ALLOWED_PREFIX)) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "TPL_BACKEND_PROXY_PATH_NOT_ALLOWED",
          message: "Requested backend path is not allowed.",
        },
      },
      { status: 404 }
    );
  }

  const targetUrl = new URL(`${getBackendBaseUrl()}/${backendPath}`);
  targetUrl.search = request.nextUrl.search;

  const headers = new Headers();
  for (const header of [
    "accept",
    "authorization",
    "content-type",
    "idempotency-key",
    "x-request-id",
  ]) {
    const value = request.headers.get(header);
    if (value) headers.set(header, value);
  }

  const body =
    request.method === "GET" || request.method === "HEAD"
      ? undefined
      : await request.text();

  try {
    const response = await fetch(targetUrl, {
      method: request.method,
      headers,
      body,
      cache: "no-store",
    });
    const responseBody = await response.text();

    return new NextResponse(responseBody, {
      status: response.status,
      headers: {
        "content-type":
          response.headers.get("content-type") || "application/json",
      },
    });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "TPL_BACKEND_PROXY_UNAVAILABLE",
          message: "TPL backend is currently unreachable.",
        },
      },
      { status: 502 }
    );
  }
}

export const GET = proxyTplBackendRequest;
export const POST = proxyTplBackendRequest;
