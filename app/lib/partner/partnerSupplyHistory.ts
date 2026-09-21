export type PartnerSupplyHistoryEntry = {
  entityType: string;
  action: string;
  version: number;
  summary: Record<string, unknown>;
  at: string;
};

const sourceLabels: Record<string, string> = {
  website: "Website Partner Desk",
  mobile: "Mobile Partner Desk",
  admin: "TPL Admin",
  api: "Partner API",
};

export function partnerSupplyHistorySource(summary: Record<string, unknown>): string {
  const surface = typeof summary.clientSurface === "string" ? summary.clientSurface.toLowerCase() : "";
  return sourceLabels[surface] ?? "Partner Desk";
}

export function partnerSupplyHistoryTitle(entry: PartnerSupplyHistoryEntry): string {
  const subject = entry.entityType === "availability"
    ? "Availability"
    : entry.entityType === "inventory"
      ? "Inventory"
      : entry.entityType === "rate"
        ? "Rate plan"
        : entry.entityType === "media"
          ? "Media"
          : "Supply record";
  const action = entry.action === "created" ? "added" : entry.action === "updated" ? "updated" : entry.action === "removed" ? "removed" : "changed";
  return `${subject} ${action} · version ${entry.version}`;
}
