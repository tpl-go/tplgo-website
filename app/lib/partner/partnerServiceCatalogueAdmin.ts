import {
  filterEligiblePartnerServiceCatalog,
  partnerServiceCatalogue,
  partnerServiceCatalog,
  type PartnerServiceCatalogueItem,
  type PartnerServiceDomainId,
} from "./partnerServiceCatalog";

export type PartnerCatalogueWorkflowState = "draft" | "preview" | "scheduled" | "published";

export type PartnerRequestedServiceAdminRow = {
  id: string;
  requestedName: string;
  description: string;
  closestDomain: PartnerServiceDomainId;
  requesterContext: string;
  status: "new" | "mapped_to_existing" | "draft_service_created" | "closed";
  resolutionNote: string;
  createdAt: string;
};

export type PartnerServiceCatalogueAdminView = {
  domains: Array<{
    id: PartnerServiceDomainId;
    title: string;
    description: string;
    serviceCount: number;
    selectableCount: number;
  }>;
  services: PartnerServiceCatalogueItem[];
  requestedServices: PartnerRequestedServiceAdminRow[];
  workflow: {
    draftVersion: number;
    publishedVersion: number;
    scheduledVersion: number | null;
    state: PartnerCatalogueWorkflowState;
    canRead: boolean;
    canManage: boolean;
    canPublish: boolean;
  };
  contentTree: string[];
};

export function buildPartnerServiceCatalogueAdminView(permissions: string[] = []): PartnerServiceCatalogueAdminView {
  return {
    domains: catalogueDomainIds().map((domainId) => {
      const domain = partnerServiceCatalog.find((item) => item.id === domainId);
      const domainServices = partnerServiceCatalogue.filter((service) => service.domain === domainId);
      return {
        id: domainId,
        title: domain?.title ?? "Other / Emerging",
        description: domain?.description ?? "Controlled requested-service intake and emerging service review.",
        serviceCount: domainServices.length,
        selectableCount: filterEligiblePartnerServiceCatalog(domain ? [domain] : [], "IN", "Private Limited Company").flatMap((item) => item.services).length,
      };
    }),
    services: partnerServiceCatalogue,
    requestedServices: requestedServicePreviewRows,
    workflow: {
      draftVersion: 1,
      publishedVersion: 1,
      scheduledVersion: null,
      state: "published",
      canRead: hasAnyPermission(permissions, ["partner_service_catalogue.read", "admin.users.read"]),
      canManage: hasAnyPermission(permissions, ["partner_service_catalogue.manage", "admin.users.write"]),
      canPublish: hasAnyPermission(permissions, ["partner_service_catalogue.publish", "content.publish"]),
    },
    contentTree: [
      "Partner Experience",
      "Partner Application",
      "Application Shell",
      "Step 1 Account & Contact",
      "Step 2 Business Identity",
      "Step 3 Business Location",
      "Step 4 Services",
      "Step 5 Verification & Compliance",
      "Step 6 Payout & Tax",
      "Step 7 Partner Agreement",
      "Step 8 Review & Submit",
    ],
  };
}

export function filterPartnerCatalogueAdminServices(
  services: PartnerServiceCatalogueItem[],
  filters: {
    query?: string;
    domain?: string;
    status?: string;
    published?: string;
    country?: string;
    entity?: string;
    selectable?: string;
    verificationProfile?: string;
  }
): PartnerServiceCatalogueItem[] {
  const query = normalize(filters.query);
  return services.filter((service) => {
    const haystack = normalize([
      service.name,
      service.shortDescription,
      service.stableCode,
      service.domain,
      service.verificationProfileKey,
      service.aliases.join(" "),
    ].join(" "));
    const entityMatch = filters.entity === "individual"
      ? service.individualAllowed
      : filters.entity === "organization"
        ? service.organizationAllowed
        : true;
    return (!query || haystack.includes(query)) &&
      (!filters.domain || service.domain === filters.domain) &&
      (!filters.status || service.status === filters.status) &&
      (!filters.published || String(service.published) === filters.published) &&
      (!filters.country || service.countries.includes(filters.country)) &&
      (!filters.selectable || String(service.applicationSelectable) === filters.selectable) &&
      (!filters.verificationProfile || service.verificationProfileKey === filters.verificationProfile) &&
      entityMatch;
  });
}

export function validateDraftCatalogueItem(input: Pick<PartnerServiceCatalogueItem, "stableCode" | "name" | "domain" | "displayOrder">): string[] {
  const errors: string[] = [];
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(input.stableCode)) errors.push("Stable code must use lowercase words separated by hyphens.");
  if (partnerServiceCatalogue.some((service) => service.stableCode === input.stableCode)) errors.push("Stable code already exists.");
  if (input.name.trim().length < 2) errors.push("Display label is required.");
  if (!partnerServiceCatalog.some((domain) => domain.id === input.domain)) errors.push("Choose a valid domain.");
  if (!Number.isFinite(input.displayOrder) || input.displayOrder < 1) errors.push("Display order must be a positive number.");
  return errors;
}

function hasAnyPermission(actual: string[], accepted: string[]): boolean {
  if (actual.length === 0) return true;
  return accepted.some((permission) => actual.includes(permission));
}

function normalize(value: string | undefined): string {
  return (value ?? "").trim().toLowerCase().replace(/\s+/g, " ");
}

function catalogueDomainIds(): PartnerServiceDomainId[] {
  return [...new Set(partnerServiceCatalogue.map((service) => service.domain))];
}

const requestedServicePreviewRows: PartnerRequestedServiceAdminRow[] = [
  {
    id: "req_yatra_accessibility_support",
    requestedName: "Accessible yatra assistance",
    description: "Wheelchair-aware support staff and route assistance for pilgrimage groups.",
    closestDomain: "yatra-spiritual-cultural",
    requesterContext: "Draft Partner application",
    status: "new",
    resolutionNote: "",
    createdAt: "2026-08-31T10:15:00.000Z",
  },
  {
    id: "req_astro_tourism_guide",
    requestedName: "Astro tourism guide",
    description: "Night-sky viewing and astronomy storytelling for travellers.",
    closestDomain: "experiences-activities-adventure",
    requesterContext: "QA Preview local-only request",
    status: "mapped_to_existing",
    resolutionNote: "Candidate mapping: Tour Guide or Experience Host.",
    createdAt: "2026-08-31T12:40:00.000Z",
  },
  {
    id: "req_film_permit_runner",
    requestedName: "Film permit runner",
    description: "Local coordination for production paperwork and on-ground approvals.",
    closestDomain: "film-shooting-ott",
    requesterContext: "Partner service draft",
    status: "draft_service_created",
    resolutionNote: "Draft catalogue item must stay unpublished until review.",
    createdAt: "2026-08-31T14:05:00.000Z",
  },
];
