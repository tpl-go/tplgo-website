export type PartnerServiceDomainId = string;

export type PartnerServiceStatus = "active" | "inactive" | "archived";

export type PartnerServiceCapability = string;

export type PartnerServiceCatalogueItem = {
  id: string;
  stableCode: string;
  name: string;
  shortDescription: string;
  domain: PartnerServiceDomainId;
  parentCode?: string;
  icon: string;
  displayOrder: number;
  status: PartnerServiceStatus;
  published: boolean;
  countries: string[];
  individualAllowed: boolean;
  organizationAllowed: boolean;
  applicationSelectable: boolean;
  serviceApprovalRequired: boolean;
  verificationProfileKey: string;
  capabilities: PartnerServiceCapability[];
  aliases: string[];
};

export type PartnerServiceDefinition = {
  id: string;
  label: string;
  keywords: string[];
};

export type PartnerServiceCategory = {
  id: PartnerServiceDomainId;
  title: string;
  description: string;
  services: PartnerServiceDefinition[];
};

export type PartnerServiceCatalogueRuntimeDomain = {
  id: PartnerServiceDomainId;
  title: string;
  description: string;
  icon: string;
  displayOrder: number;
  status: PartnerServiceStatus;
  serviceCount: number;
  selectableCount: number;
};

export function getAllPartnerServices(catalog: PartnerServiceCategory[] = []): PartnerServiceDefinition[] {
  return catalog.flatMap((category) => category.services);
}

export function findPartnerCatalogueItemIn(
  catalogueItems: PartnerServiceCatalogueItem[],
  serviceId: string
): PartnerServiceCatalogueItem | undefined {
  return catalogueItems.find((serviceItem) => serviceItem.stableCode === serviceId || serviceItem.id === serviceId);
}

export function partnerServiceEligibleForApplication(
  serviceItem: PartnerServiceCatalogueItem,
  countryCodeOrName: string,
  businessType: string
): boolean {
  const country = normalizeCountryCode(countryCodeOrName);
  const individual = isIndividualBusinessType(businessType);
  return Boolean(
    serviceItem.published &&
    serviceItem.status === "active" &&
    serviceItem.applicationSelectable &&
    serviceItem.countries.includes(country) &&
    (individual ? serviceItem.individualAllowed : serviceItem.organizationAllowed)
  );
}

export function filterEligiblePartnerServiceCatalog(
  catalog: PartnerServiceCategory[],
  countryCodeOrName: string,
  businessType: string,
  catalogueItems: PartnerServiceCatalogueItem[]
): PartnerServiceCategory[] {
  return catalog
    .map((category) => ({
      ...category,
      services: category.services.filter((service) => {
        const item = findPartnerCatalogueItemIn(catalogueItems, service.id);
        return item ? partnerServiceEligibleForApplication(item, countryCodeOrName, businessType) : false;
      }),
    }))
    .filter((category) => category.services.length > 0);
}

export function filterPartnerServiceCatalog(query: string, catalog: PartnerServiceCategory[] = []): PartnerServiceCategory[] {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return catalog;

  return catalog
    .map((category) => {
      const searchableCategory = normalizeSearchText(`${category.title} ${category.description}`);
      const categoryMatches = searchableCategory.includes(normalizedQuery);
      const services = category.services.filter((serviceItem) => {
        const haystack = normalizeSearchText(`${serviceItem.label} ${serviceItem.keywords.join(" ")}`);
        return categoryMatches || haystack.includes(normalizedQuery);
      });
      return { ...category, services };
    })
    .filter((category) => category.services.length > 0);
}

export function getEligiblePartnerServiceDomainOptions(
  countryCodeOrName: string,
  businessType: string,
  options: { excludeDomainIds?: PartnerServiceDomainId[]; query?: string; catalog?: PartnerServiceCategory[]; catalogueItems?: PartnerServiceCatalogueItem[] } = {}
): PartnerServiceCategory[] {
  const excluded = new Set(options.excludeDomainIds ?? []);
  const query = normalizeSearchText(options.query ?? "");
  return filterEligiblePartnerServiceCatalog(options.catalog ?? [], countryCodeOrName, businessType, options.catalogueItems ?? [])
    .filter((category) => !excluded.has(category.id))
    .filter((category) => {
      if (!query) return true;
      return normalizeSearchText(`${category.title} ${category.description}`).includes(query);
    });
}

export function getEligiblePartnerServicesForDomain(
  domainId: PartnerServiceDomainId,
  countryCodeOrName: string,
  businessType: string,
  query = "",
  catalogueItems: PartnerServiceCatalogueItem[] = [],
  domainTitle = "Service"
): PartnerServiceCatalogueItem[] {
  const normalizedQuery = normalizeSearchText(query);
  return catalogueItems
    .filter((serviceItem) => serviceItem.domain === domainId)
    .filter((serviceItem) => partnerServiceEligibleForApplication(serviceItem, countryCodeOrName, businessType))
    .filter((serviceItem) => {
      if (!normalizedQuery) return true;
      return normalizeSearchText(`${serviceItem.name} ${serviceItem.shortDescription} ${serviceItem.aliases.join(" ")} ${domainTitle}`).includes(normalizedQuery);
    })
    .sort((a, b) => a.displayOrder - b.displayOrder || a.name.localeCompare(b.name));
}

export function groupPartnerServiceCodesByDomain(
  serviceCodes: string[],
  catalogueItems: PartnerServiceCatalogueItem[],
  runtimeDomains: PartnerServiceCatalogueRuntimeDomain[] = []
): Array<{ domainId: PartnerServiceDomainId; title: string; services: PartnerServiceCatalogueItem[] }> {
  const groups = new Map<PartnerServiceDomainId, PartnerServiceCatalogueItem[]>();
  for (const code of [...new Set(serviceCodes)]) {
    const serviceItem = findPartnerCatalogueItemIn(catalogueItems, code);
    if (!serviceItem) continue;
    groups.set(serviceItem.domain, [...(groups.get(serviceItem.domain) ?? []), serviceItem]);
  }
  return [...groups.entries()].map(([domainId, services]) => ({
    domainId,
    title: runtimeDomains.find((domain) => domain.id === domainId)?.title ?? titleFromDomainId(domainId),
    services,
  }));
}

export function buildPartnerServiceCatalogFromItems(
  runtimeDomains: PartnerServiceCatalogueRuntimeDomain[],
  catalogueItems: PartnerServiceCatalogueItem[]
): PartnerServiceCategory[] {
  return runtimeDomains
    .map((domain) => ({
      id: domain.id,
      title: domain.title,
      description: domain.description,
      services: catalogueItems
        .filter((serviceItem) => serviceItem.domain === domain.id && serviceItem.applicationSelectable && serviceItem.published && serviceItem.status === "active")
        .sort((a, b) => a.displayOrder - b.displayOrder || a.name.localeCompare(b.name))
        .map((serviceItem) => ({
          id: serviceItem.stableCode,
          label: serviceItem.name,
          keywords: [serviceItem.shortDescription, ...serviceItem.aliases, serviceItem.domain, serviceItem.verificationProfileKey],
        })),
    }))
    .filter((category) => category.services.length > 0);
}

export function normalizeSearchText(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function normalizeCountryCode(countryCodeOrName: string): string {
  const normalized = countryCodeOrName.trim().toUpperCase();
  const aliases: Record<string, string> = {
    INDIA: "IN",
    "UNITED ARAB EMIRATES": "AE",
    UAE: "AE",
    "UNITED STATES": "US",
    USA: "US",
    CANADA: "CA",
    "UNITED KINGDOM": "GB",
    UK: "GB",
    AUSTRALIA: "AU",
    SINGAPORE: "SG",
    THAILAND: "TH",
    NEPAL: "NP",
    BHUTAN: "BT",
  };
  return aliases[normalized] ?? normalized;
}

function isIndividualBusinessType(businessType: string): boolean {
  const normalized = normalizeSearchText(businessType);
  return (
    normalized.includes("individual") ||
    normalized.includes("independent professional") ||
    normalized.includes("sole proprietorship") ||
    normalized.includes("proprietor")
  );
}

function titleFromDomainId(domainId: string): string {
  return domainId
    .split("-")
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ");
}
