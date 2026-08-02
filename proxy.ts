import { NextResponse, type NextRequest } from "next/server";

const COMING_SOON_PATH = "/coming-soon";
const PUBLIC_FILE_PATTERN = /\/[^/]+\.[^/]+$/;

const excludedExactPaths = new Set([
  "/",
  COMING_SOON_PATH,
  "/favicon.ico",
  "/manifest.json",
  "/robots.txt",
  "/sitemap.xml",
]);

const excludedPrefixes = [
  "/api",
  "/_next",
  "/admin",
  "/account",
  "/creator",
  "/creator-studio",
  "/flights",
  "/manage",
];

function isComingSoonGateEnabled() {
  return process.env.NEXT_PUBLIC_TPL_COMING_SOON_GATE_ENABLED !== "false";
}

function shouldSkipComingSoonGate(pathname: string) {
  if (excludedExactPaths.has(pathname)) {
    return true;
  }

  if (PUBLIC_FILE_PATTERN.test(pathname)) {
    return true;
  }

  return excludedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isComingSoonGateEnabled() || shouldSkipComingSoonGate(pathname)) {
    return NextResponse.next();
  }

  const rewriteUrl = request.nextUrl.clone();
  rewriteUrl.pathname = COMING_SOON_PATH;
  rewriteUrl.searchParams.set("from", pathname);

  return NextResponse.rewrite(rewriteUrl);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|robots.txt|sitemap.xml).*)",
  ],
};
