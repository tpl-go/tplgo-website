import { expect, test } from "vitest";
import {
  buildPartnerServiceCatalogFromItems,
  filterEligiblePartnerServiceCatalog,
  findPartnerCatalogueItemIn,
  getAllPartnerServices,
  groupPartnerServiceCodesByDomain,
  type PartnerServiceCatalogueItem,
  type PartnerServiceCatalogueRuntimeDomain,
} from "./partnerServiceCatalogRuntime";

const runtimeDomains: PartnerServiceCatalogueRuntimeDomain[] = [
  {
    id: "runtime-domain",
    title: "Runtime Domain",
    description: "Domain loaded from the published backend catalogue.",
    icon: "sparkles",
    displayOrder: 1,
    status: "active",
    serviceCount: 3,
    selectableCount: 1,
  },
];

const runtimeItems: PartnerServiceCatalogueItem[] = [
  runtimeItem("runtime-service", "Runtime Service", { applicationSelectable: true }),
  runtimeItem("runtime-draft", "Runtime Draft", { published: false, applicationSelectable: true }),
  runtimeItem("runtime-inactive", "Runtime Inactive", { status: "inactive", applicationSelectable: true }),
];

test("runtime catalogue helpers build Partner Step 4 categories only from published backend payload data", () => {
  const catalog = buildPartnerServiceCatalogFromItems(runtimeDomains, runtimeItems);

  expect(catalog).toHaveLength(1);
  expect(catalog[0]?.title).toBe("Runtime Domain");
  expect(getAllPartnerServices(catalog).map((service) => service.label)).toEqual(["Runtime Service"]);
});

test("runtime catalogue helpers filter eligibility without falling back to a frontend mirror", () => {
  const catalog = buildPartnerServiceCatalogFromItems(runtimeDomains, runtimeItems);
  const eligible = filterEligiblePartnerServiceCatalog(catalog, "India", "Private Limited Company", runtimeItems);

  expect(eligible[0]?.services.map((service) => service.id)).toEqual(["runtime-service"]);
  expect(findPartnerCatalogueItemIn(runtimeItems, "runtime-service")?.name).toBe("Runtime Service");
});

test("runtime catalogue helpers group selected stable codes using runtime domain labels", () => {
  const groups = groupPartnerServiceCodesByDomain(["runtime-service"], runtimeItems, runtimeDomains);

  expect(groups).toEqual([
    {
      domainId: "runtime-domain",
      title: "Runtime Domain",
      services: [runtimeItems[0]],
    },
  ]);
});

function runtimeItem(
  stableCode: string,
  name: string,
  overrides: Partial<PartnerServiceCatalogueItem> = {}
): PartnerServiceCatalogueItem {
  return {
    id: `svc_${stableCode}`,
    stableCode,
    name,
    shortDescription: `${name} description.`,
    domain: "runtime-domain",
    icon: "sparkles",
    displayOrder: 1,
    status: "active",
    published: true,
    countries: ["IN"],
    individualAllowed: true,
    organizationAllowed: true,
    applicationSelectable: true,
    serviceApprovalRequired: true,
    verificationProfileKey: "runtime_profile",
    capabilities: ["runtime_capability"],
    aliases: [name],
    ...overrides,
  };
}
