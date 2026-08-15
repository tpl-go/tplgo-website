import assert from "node:assert/strict";
import test from "node:test";
import { GET as getBackendCatalog } from "../../api/v1/creators/catalog/route";
import { GET as searchBackendAssets } from "../../api/v1/creators/assets/search/route";
import { GET as getBackendAsset } from "../../api/v1/creators/assets/[assetSlug]/route";
import { GET as getBackendRelatedAssets } from "../../api/v1/creators/assets/related/route";
import { GET as getBackendCategories } from "../../api/v1/creators/categories/route";
import { GET as getBackendCategory } from "../../api/v1/creators/categories/[categorySlug]/route";
import { GET as getBackendCollections } from "../../api/v1/creators/collections/route";
import { GET as getBackendCollection } from "../../api/v1/creators/collections/[collectionSlug]/route";
import { GET as getBackendAuthor } from "../../api/v1/creators/authors/[creatorSlug]/route";
import { GET as getBackendFilters } from "../../api/v1/creators/filters/route";
import { GET as getBackendLicenses } from "../../api/v1/creators/licenses/route";
import { GET as getPreviewLicenses } from "../../api/creators/licenses/route";
import { getAsset, getCatalog, searchAssets } from "./creatorCatalogRepository";

const flagNames = [
  "NEXT_PUBLIC_TPL_CREATOR_BACKEND_CATALOG",
  "NEXT_PUBLIC_TPL_CREATOR_BACKEND_PREVIEW_APIS",
  "NEXT_PUBLIC_TPL_CREATOR_LICENSE_ENGINE",
  "NEXT_PUBLIC_TPL_API_BASE_URL",
] as const;

async function withFlags(values: Partial<Record<(typeof flagNames)[number], string>>, run: () => Promise<void> | void) {
  const previous = new Map<string, string | undefined>();
  for (const flag of flagNames) {
    previous.set(flag, process.env[flag]);
    const value = values[flag];
    if (value === undefined) delete process.env[flag];
    else process.env[flag] = value;
  }
  try {
    await run();
  } finally {
    for (const flag of flagNames) {
      const value = previous.get(flag);
      if (value === undefined) delete process.env[flag];
      else process.env[flag] = value;
    }
  }
}

async function parse(response: Response) {
  return (await response.json()) as Record<string, unknown>;
}

test("Creator backend read endpoints are disabled by default", async () => {
  const response = await getBackendCatalog(new Request("http://localhost/api/v1/creators/catalog"));
  const body = await parse(response);

  assert.equal(response.status, 404);
  assert.equal(body.ok, false);
  assert.equal((body.error as Record<string, unknown>).code, "CREATOR_BACKEND_CATALOG_DISABLED");
});

test("Creator backend read endpoints expose catalog, search, detail, collections, profiles, filters and licenses", async () => {
  await withFlags({ NEXT_PUBLIC_TPL_CREATOR_BACKEND_CATALOG: "true" }, async () => {
    const catalog = await parse(await getBackendCatalog(new Request("http://localhost/api/v1/creators/catalog?page=1&pageSize=2")));
    const search = await parse(await searchBackendAssets(new Request("http://localhost/api/v1/creators/assets/search?category=videos&pageSize=1")));
    const asset = await parse(await getBackendAsset(new Request("http://localhost"), { params: Promise.resolve({ assetSlug: "cinematic-ladakh-drone-pack" }) }));
    const related = await parse(await getBackendRelatedAssets(new Request("http://localhost/api/v1/creators/assets/related?assetSlug=cinematic-ladakh-drone-pack")));
    const categories = await parse(await getBackendCategories());
    const category = await parse(await getBackendCategory(new Request("http://localhost"), { params: Promise.resolve({ categorySlug: "videos" }) }));
    const collections = await parse(await getBackendCollections());
    const collection = await parse(await getBackendCollection(new Request("http://localhost/api/v1/creators/collections/creator-launch-kits?pageSize=2"), { params: Promise.resolve({ collectionSlug: "creator-launch-kits" }) }));
    const author = await parse(await getBackendAuthor(new Request("http://localhost/api/v1/creators/authors/aira-studio?pageSize=2"), { params: Promise.resolve({ creatorSlug: "aira-studio" }) }));
    const filters = await parse(await getBackendFilters());
    const licenses = await parse(await getBackendLicenses());

    assert.equal(catalog.source, "backend");
    assert.equal(((catalog.data as Record<string, unknown>).pagination as Record<string, unknown>).pageSize, 2);
    assert.equal(search.source, "backend");
    assert.equal(((search.data as Record<string, unknown>).pagination as Record<string, unknown>).pageSize, 1);
    assert.equal(asset.source, "backend");
    assert.equal(related.source, "backend");
    assert.equal(categories.source, "backend");
    assert.equal(category.source, "backend");
    assert.equal(collections.source, "backend");
    assert.equal(((collection.collection as Record<string, unknown>).data as Record<string, unknown>).slug, "creator-launch-kits");
    assert.equal(((author.profile as Record<string, unknown>).data as Record<string, unknown>).slug, "aira-studio");
    assert.ok(Array.isArray((filters.data as Record<string, unknown>).formats));
    assert.ok(Array.isArray((licenses.data as Record<string, unknown>).definitions));
  });
});

test("Creator catalog repository uses backend when available and preview fallback when unavailable", async () => {
  await withFlags({ NEXT_PUBLIC_TPL_CREATOR_BACKEND_CATALOG: "true", NEXT_PUBLIC_TPL_API_BASE_URL: "http://creator-backend.test" }, async () => {
    const originalFetch = global.fetch;
    let calls = 0;
    global.fetch = (async (input: RequestInfo | URL) => {
      calls += 1;
      const url = String(input);
      if (url.includes("/assets/search")) {
        return Response.json({ data: { assets: [], pagination: { hasNext: false, hasPrevious: false, total: 0 } }, source: "backend" });
      }
      if (url.includes("/assets/cinematic-ladakh-drone-pack")) {
        return Response.json({ data: { slug: "backend-asset" }, source: "backend" });
      }
      return Response.json({ data: { assets: [], categories: [], collections: [], creators: [], pagination: { hasNext: false, hasPrevious: false, total: 0 } }, source: "backend" });
    }) as typeof fetch;

    try {
      const catalog = await getCatalog();
      const search = await searchAssets({ query: "anything" });
      const asset = await getAsset("cinematic-ladakh-drone-pack");

      assert.equal(catalog.source, "backend");
      assert.equal(search.source, "backend");
      assert.equal(asset.source, "backend");
      assert.equal((asset.data as unknown as Record<string, unknown>).slug, "backend-asset");
      assert.equal(calls, 3);
    } finally {
      global.fetch = originalFetch;
    }
  });

  await withFlags({ NEXT_PUBLIC_TPL_CREATOR_BACKEND_CATALOG: "true", NEXT_PUBLIC_TPL_API_BASE_URL: "http://creator-backend.test" }, async () => {
    const originalFetch = global.fetch;
    global.fetch = (async () => {
      throw new Error("backend unavailable");
    }) as typeof fetch;

    try {
      const catalog = await getCatalog();
      const search = await searchAssets({ query: "drone" });

      assert.equal(catalog.source, "fallback");
      assert.equal(search.source, "fallback");
      assert.equal(catalog.error, "backend unavailable");
      assert.ok(search.data.assets.length >= 1);
    } finally {
      global.fetch = originalFetch;
    }
  });
});

test("Creator preview license API consumes backend license definitions when backend read is available", async () => {
  await withFlags(
    {
      NEXT_PUBLIC_TPL_CREATOR_BACKEND_CATALOG: "true",
      NEXT_PUBLIC_TPL_CREATOR_BACKEND_PREVIEW_APIS: "true",
      NEXT_PUBLIC_TPL_API_BASE_URL: "http://creator-backend.test",
    },
    async () => {
      const originalFetch = global.fetch;
      global.fetch = (async () => Response.json({ data: { definitions: [{ licenseType: "personal", displayName: "Backend Personal" }] }, source: "backend" })) as typeof fetch;

      try {
        const body = await parse(await getPreviewLicenses());
        assert.equal(body.ok, true);
        assert.equal((body.meta as Record<string, unknown>).source, "preview_service");
        assert.equal((((body.data as Record<string, unknown>).definitions as Array<Record<string, unknown>>)[0]).displayName, "Backend Personal");
      } finally {
        global.fetch = originalFetch;
      }
    }
  );
});
