import { expect, test } from "vitest";
import { catalogueDomainTitle } from "./catalogueDomainTitle";
import type { AdminPartnerServiceCatalogueItem } from "@/app/lib/admin/adminApiClient";

test("uses saved root spelling and punctuation, with exact legacy fallback", () => {
  expect(catalogueDomainTitle("travel-agencies-dmc-tour-operators", [])).toBe("Travel Agencies, DMC & Tour Operators");
  expect(catalogueDomainTitle("other-emerging", [])).toBe("Other / Emerging");
  const root = { domain: "esim-provider", stableCode: "esim-provider-root", name: "eSIM Provider", applicationSelectable: false } as AdminPartnerServiceCatalogueItem;
  expect(catalogueDomainTitle(root.domain, [root])).toBe("eSIM Provider");
  expect(catalogueDomainTitle(root.domain, [{ ...root, name: "eSIM & Connectivity" }])).toBe("eSIM & Connectivity");
  expect(catalogueDomainTitle(root.domain, [{ ...root, applicationSelectable: true }])).toBe("Esim Provider");
});
