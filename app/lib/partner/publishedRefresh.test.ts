import { expect, test } from "vitest";
import { acceptsPublishedVersions, publishedContentVersion } from "./publishedRefresh";

test("unpublished application copy is explicit version zero; malformed copy is not a match", () => {
  expect(publishedContentVersion("partner_application:default")).toBe(0);
  expect(publishedContentVersion("partner_application:12")).toBe(12);
  expect(Number.isNaN(publishedContentVersion(undefined))).toBe(true);
});
test("independent version authorities cannot be downgraded by delayed responses", () => {
  const previous = { catalogue: 10, content: 2, policy: 4 };
  expect(acceptsPublishedVersions(previous, { catalogue: 11, content: 2, policy: 4 })).toBe(true);
  expect(acceptsPublishedVersions(previous, { catalogue: 11, content: 1, policy: 4 })).toBe(false);
  expect(acceptsPublishedVersions(previous, { catalogue: 9, content: 3, policy: 5 })).toBe(false);
  expect(acceptsPublishedVersions(previous, { catalogue: 10, content: 2, policy: NaN })).toBe(false);
});
