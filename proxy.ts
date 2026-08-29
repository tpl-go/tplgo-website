import { NextResponse, type NextRequest } from "next/server";
import { isPartnerDeskPreviewEnabled } from "./app/lib/partner/partnerPreviewGate";

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
  "/manage",
  "/flights",
];

const partnerPreviewPaths = new Set(["/partner-preview"]);

function isComingSoonGateEnabled() {
  if (isSmokeComingSoonBypassEnabled()) {
    return false;
  }

  if (process.env.VERCEL_ENV === "preview" || process.env.NEXT_PUBLIC_VERCEL_ENV === "preview") {
    return false;
  }

  return process.env.NEXT_PUBLIC_TPL_COMING_SOON_GATE_ENABLED === "true";
}

function isSmokeComingSoonBypassEnabled() {
  const enabled =
    process.env.NEXT_PUBLIC_TPL_SMOKE_BYPASS_COMING_SOON === "true";
  if (!enabled) return false;

  return (
    process.env.NODE_ENV !== "production" ||
    process.env.TPL_ALLOW_PRODUCTION_SMOKE_BYPASS === "true"
  );
}

function shouldSkipComingSoonGate(pathname: string) {
  if (partnerPreviewPaths.has(pathname) && isPartnerPreviewGateBypassEnabled()) {
    return true;
  }

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

function isPartnerPreviewGateBypassEnabled() {
  return isPartnerDeskPreviewEnabled();
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
