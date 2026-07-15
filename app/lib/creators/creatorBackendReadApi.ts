import { NextResponse } from "next/server";
import { isCreatorBackendCatalogEnabled } from "./creatorFeatureFlags";
import type { CreatorCatalogFilters } from "./creatorCatalogTypes";

export function creatorBackendReadDisabled() {
  return NextResponse.json(
    {
      ok: false,
      error: {
        code: "CREATOR_BACKEND_CATALOG_DISABLED",
        message: "Creator backend catalog is unavailable.",
      },
    },
    { status: 404 }
  );
}

export function requireCreatorBackendCatalog() {
  return isCreatorBackendCatalogEnabled();
}

export function creatorBackendReadOk<T>(data: T) {
  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

export function creatorBackendReadNotFound(code: string, message: string) {
  return NextResponse.json({ ok: false, error: { code, message } }, { status: 404 });
}

export function filtersFromRequest(request: Request): CreatorCatalogFilters {
  const url = new URL(request.url);
  return Object.fromEntries(url.searchParams.entries()) as CreatorCatalogFilters;
}
