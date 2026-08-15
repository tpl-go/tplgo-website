import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { creatorRoutes } from "./creatorRouteRegistry.ts";

const creatorSourceFiles = [
  "app/components/creators/catalog/CreatorMarketplaceHeader.tsx",
  "app/components/creators/catalog/CreatorMarketplaceFooter.tsx",
  "app/components/creators/catalog/CreatorCategoryStrip.tsx",
];

test("shared Creator navigation has no dead hash destination", () => {
  for (const file of creatorSourceFiles) {
    const source = readFileSync(file, "utf8");
    assert.doesNotMatch(source, /href\s*=\s*["']#["']/);
  }
});

test("locked B1 primary navigation remains compact and ordered", () => {
  const source = readFileSync(creatorSourceFiles[0], "utf8");
  assert.match(source, /"explore", "photos", "videos", "reels", "drone", "templates", "collections", "creators", "licensing", "plans"/);
});

test("every registry link uses an intentional absolute application path", () => {
  for (const item of creatorRoutes) {
    assert.ok(item.href.startsWith("/"), `${item.key} has a non-application href`);
    assert.notEqual(item.href, "/");
    assert.notEqual(item.href, "#");
    assert.ok(item.fallbackHref.startsWith("/"));
  }
});

test("all approved categories remain discoverable outside the primary row", () => {
  const footer = readFileSync(creatorSourceFiles[1], "utf8");
  for (const key of ["photos", "videos", "reels", "drone", "templates", "presets", "graphics", "destination-guides"]) {
    assert.match(footer, new RegExp(`\\b${key}\\b`));
  }
});

test("footer contains every required stabilization section", () => {
  const footer = readFileSync(creatorSourceFiles[1], "utf8");
  for (const label of ["Explore", "Categories", "Creators", "Licensing", "Plans", "Company", "Support", "Legal", "Social", "newsletter", "Become a Creator"]) {
    assert.match(footer, new RegExp(label, "i"));
  }
});
