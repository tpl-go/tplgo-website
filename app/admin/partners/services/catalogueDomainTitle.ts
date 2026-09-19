import { partnerServiceDomainMetadata, type PartnerServiceDomainId } from "@/app/lib/partner/partnerServiceCatalog";
import type { AdminPartnerServiceCatalogueItem } from "@/app/lib/admin/adminApiClient";

export function catalogueDomainTitle(id: string, items: AdminPartnerServiceCatalogueItem[]) {
  const candidates = items.filter(item => item.domain === id && !item.parentCode && !item.applicationSelectable);
  const root = candidates.find(item => item.stableCode === `${id}-root`)
    ?? candidates.find(item => item.stableCode === id || item.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") === id);
  return root?.name || partnerServiceDomainMetadata[id as PartnerServiceDomainId]?.title || id.split("-").map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}
