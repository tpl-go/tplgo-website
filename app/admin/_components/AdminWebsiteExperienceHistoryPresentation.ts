import type { AdminPartnerServiceCatalogueResponse, WebsiteExperienceAdminResponse } from "../../lib/admin/adminApiClient";

export type HistoryRecordKind = "workflow_activity" | "saved_version";
export type HistoryEventType = "draft_changes" | "approval" | "scheduling" | "publishing" | "archived" | "versions";
export type HistoryArea = "global" | "pages" | "partner_application" | "agreement_template" | "service_catalogue";
export type HistoryTarget = { label: "Open item" | "View version"; href: string };
export type HistoryRow = {
  id: string;
  recordKind: HistoryRecordKind;
  eventType: HistoryEventType;
  source: HistoryArea;
  actionLabel: string;
  itemTitle: string;
  contentType: string;
  contentArea: string;
  summary: string;
  actor: string;
  createdAt: string;
  versionLabel?: string;
  previousState?: string;
  resultingState?: string;
  target?: HistoryTarget;
};
export type HistoryFilters = { search: string; source: "all" | HistoryArea; eventType: "all" | HistoryEventType };

export function buildAuditRows(website: WebsiteExperienceAdminResponse, catalogue: AdminPartnerServiceCatalogueResponse): HistoryRow[] {
  const catalogueVersionByRelation = new Map<string, AdminPartnerServiceCatalogueResponse["versions"][number]>();
  for (const version of catalogue.versions) {
    catalogueVersionByRelation.set(version.id, version);
    catalogueVersionByRelation.set(String(version.version), version);
    catalogueVersionByRelation.set(`version:${version.version}`, version);
    catalogueVersionByRelation.set(`catalogue-version:${version.version}`, version);
  }
  const pairedVersionIds = new Set<string>();
  const websiteRows: HistoryRow[] = website.recentAudit.map((row) => {
    const target = websiteTarget(row.context, row.entityId, row.changeSummary);
    return {
      id: `website:${row.id}`,
      recordKind: "workflow_activity",
      eventType: historyEventType(row.action),
      source: target.area,
      actionLabel: historyActionLabel(row.action),
      itemTitle: target.title,
      contentType: target.contentType,
      contentArea: target.contentArea,
      summary: cleanHistorySummary(row.changeSummary) || `${historyActionLabel(row.action)} for ${target.title}.`,
      actor: historyActor(row.actorAdminId),
      createdAt: row.createdAt,
      resultingState: workflowStateFromAction(row.action),
      target: target.href ? { label: "Open item", href: target.href } : undefined,
    };
  });
  const catalogueAudit: HistoryRow[] = catalogue.audit.map((row) => {
    const relatedVersion = row.entityId ? catalogueVersionByRelation.get(row.entityId) : undefined;
    if (relatedVersion) pairedVersionIds.add(relatedVersion.id);
    return {
      id: `catalogue-audit:${row.id}`,
      recordKind: "workflow_activity",
      eventType: historyEventType(row.action),
      source: "service_catalogue",
      actionLabel: historyActionLabel(row.action),
      itemTitle: serviceCatalogueItemTitle(row, catalogue),
      contentType: "Service Catalogue",
      contentArea: "Service Catalogue",
      summary: cleanHistorySummary(row.changeSummary) || `${historyActionLabel(row.action)} for Service Catalogue.`,
      actor: historyActor(row.actorAdminId),
      createdAt: row.createdAt,
      versionLabel: relatedVersion ? `Version ${relatedVersion.version}` : undefined,
      resultingState: workflowStateFromAction(row.action) ?? (relatedVersion ? workflowStateLabel(relatedVersion.status) : undefined),
      target: { label: "Open item", href: "/admin/website-experience/pages/partner/service-catalogue" },
    };
  });
  const catalogueVersions: HistoryRow[] = catalogue.versions
    .filter((row) => !pairedVersionIds.has(row.id))
    .map((row) => ({
      id: `catalogue-version:${row.id}`,
      recordKind: "saved_version",
      eventType: "versions",
      source: "service_catalogue",
      actionLabel: "Saved version",
      itemTitle: "Service Catalogue",
      contentType: "Service Catalogue",
      contentArea: "Service Catalogue",
      summary: `Version ${row.version} - ${workflowStateLabel(row.status)}.`,
      actor: historyActor(row.publishedByAdminId ?? row.createdByAdminId),
      createdAt: row.publishedAt || row.createdAt,
      versionLabel: `Version ${row.version}`,
      resultingState: workflowStateLabel(row.status),
      target: { label: "Open item", href: "/admin/website-experience/pages/partner/service-catalogue" },
    }));
  return [...catalogueAudit, ...catalogueVersions, ...websiteRows].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

export function filterHistoryRows(records: HistoryRow[], filters: HistoryFilters) {
  return records.filter((record) => {
    const query = filters.search.trim().toLowerCase();
    const matchesSearch = !query || [record.actionLabel, record.itemTitle, record.contentType, record.contentArea, record.summary].some((value) => value.toLowerCase().includes(query));
    const matchesSource = filters.source === "all" || record.source === filters.source;
    const matchesType = filters.eventType === "all" || (filters.eventType === "versions" ? Boolean(record.versionLabel) : record.eventType === filters.eventType);
    return matchesSearch && matchesSource && matchesType;
  });
}

export function historyAreaFromValue(value: string | null): "all" | HistoryArea {
  return value === "global" || value === "pages" || value === "partner_application" || value === "agreement_template" || value === "service_catalogue" ? value : "all";
}

export function historyEventTypeFromValue(value: string | null): "all" | HistoryEventType {
  return value === "draft_changes" || value === "approval" || value === "scheduling" || value === "publishing" || value === "archived" || value === "versions" ? value : "all";
}

export function historyActionLabel(value: string) {
  const normalized = normalizedHistoryAction(value);
  const labels: Record<string, string> = {
    draft: "Draft saved",
    saved: "Draft saved",
    draft_saved: "Draft saved",
    saved_draft: "Draft saved",
    save_draft: "Draft saved",
    draft_save: "Draft saved",
    submitted: "Sent for approval",
    submitted_for_approval: "Sent for approval",
    approved: "Approved",
    changes_requested: "Changes requested",
    scheduled: "Scheduled",
    schedule_cancelled: "Schedule cancelled",
    published: "Published",
    archived: "Archived",
    baseline: "Initial version created",
    context: "Initial version created",
    initialized: "Initial version created",
    initial_version_created: "Initial version created",
  };
  return labels[normalized] ?? humanize(normalized);
}

export function historyEventType(value: string): HistoryEventType {
  const normalized = normalizedHistoryAction(value);
  if (normalized === "draft" || normalized === "saved" || normalized === "draft_saved" || normalized === "saved_draft" || normalized === "save_draft" || normalized === "draft_save") return "draft_changes";
  if (normalized === "submitted" || normalized === "submitted_for_approval" || normalized === "approved" || normalized === "changes_requested") return "approval";
  if (normalized === "scheduled" || normalized === "schedule_cancelled") return "scheduling";
  if (normalized === "published") return "publishing";
  if (normalized === "archived") return "archived";
  return "versions";
}

export function recordKindLabel(kind: HistoryRecordKind) {
  return kind === "saved_version" ? "Saved version" : "Workflow activity";
}

export function formatHistoryDateTime(value?: string) {
  if (!value) return "Not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "medium" }).format(date);
}

function normalizedHistoryAction(value: string) {
  const lastSegment = value.split(".").filter(Boolean).pop() ?? value;
  return lastSegment
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toLowerCase();
}

function workflowStateFromAction(value: string): string | undefined {
  const normalized = normalizedHistoryAction(value);
  if (normalized === "draft" || normalized === "saved" || normalized === "draft_saved" || normalized === "saved_draft" || normalized === "save_draft" || normalized === "draft_save") return "Draft";
  if (normalized === "submitted" || normalized === "submitted_for_approval") return "In review";
  if (normalized === "approved") return "Approved";
  if (normalized === "changes_requested") return "Changes requested";
  if (normalized === "scheduled") return "Scheduled";
  if (normalized === "schedule_cancelled") return "Approved";
  if (normalized === "published") return "Published";
  if (normalized === "archived") return "Archived";
  if (normalized === "baseline" || normalized === "context" || normalized === "initialized" || normalized === "initial_version_created") return "Draft";
  return undefined;
}

function workflowStateLabel(value?: string | null): string {
  if (!value) return "Not available";
  const normalized = value.toLowerCase();
  if (normalized === "in_review") return "In review";
  if (normalized === "changes_requested") return "Changes requested";
  if (normalized === "schedule_cancelled") return "Schedule cancelled";
  return humanize(normalized);
}

function historyActor(value?: string | null) {
  if (!value) return "Not available";
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)) return "Admin user";
  if (/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(value)) return value;
  return value.length > 64 ? "Admin user" : value;
}

function cleanHistorySummary(value?: string | null) {
  if (!value) return "";
  return value.replace(/\b(?:Website Experience|Partner Service Catalogue)\.([a-z_ -]+)/gi, (_, action: string) => historyActionLabel(action)).trim();
}

function websiteTarget(context?: string, entityId?: string, summary?: string): { area: HistoryArea; title: string; contentType: string; contentArea: string; href?: string } {
  const agreementTemplateTitle = agreementTemplateTitleFromHistory(entityId, summary);
  if (agreementTemplateTitle) {
    const templateId = agreementTemplateIdFromHistory(entityId);
    return {
      area: "agreement_template",
      title: agreementTemplateTitle,
      contentType: "Agreement Template",
      contentArea: "Partner Application",
      href: templateId ? `/admin/website-experience/pages/partner/application/step-7-partner-agreement/agreement-templates/${encodeURIComponent(templateId)}` : "/admin/website-experience/pages/partner/application/step-7-partner-agreement/agreement-templates",
    };
  }
  if (context === "partner_application") {
    return {
      area: "partner_application",
      title: "Partner Application",
      contentType: "Partner Application",
      contentArea: "Pages",
      href: "/admin/website-experience/pages/partner/application",
    };
  }
  const area = auditSource(context);
  return {
    area,
    title: contextTitle(context) || "Website Experience",
    contentType: "Website Experience",
    contentArea: area === "global" ? "Global Experience" : "Pages",
    href: websiteContextHref(context),
  };
}

function auditSource(context?: string): HistoryArea {
  if (context === "partner_application") return "partner_application";
  if (context?.includes("page")) return "pages";
  return "global";
}

function agreementTemplateTitleFromHistory(entityId?: string, summary?: string) {
  const text = `${entityId ?? ""} ${summary ?? ""}`;
  if (!/agreement[_ -]?template|Agreement Template/i.test(text)) return "";
  const labelled = summary?.match(/Agreement Template\s*[/:-]\s*([^|]+)$/i)?.[1]?.trim();
  if (labelled) return cleanAgreementTemplateTitle(labelled);
  const quoted = summary?.match(/["']([^"']+)["']/)?.[1]?.trim();
  if (quoted) return cleanAgreementTemplateTitle(quoted);
  const saved = summary?.match(/(?:Saved|Updated|Created)\s+(?:agreement\s+template\s+)?(.+)$/i)?.[1]?.trim();
  return saved ? cleanAgreementTemplateTitle(saved) : "Agreement Template";
}

function cleanAgreementTemplateTitle(value: string) {
  return value.replace(/^(?:draft|saved|published|approved|submitted|scheduled|archived|changes[_ ]requested)\s*:\s*/i, "").trim() || "Agreement Template";
}

function agreementTemplateIdFromHistory(entityId?: string) {
  const match = entityId?.match(/agreement[_-]template[:/](.+)$/i);
  return match?.[1] ?? "";
}

function websiteContextHref(context?: string) {
  if (context === "partner_application") return "/admin/website-experience/pages/partner/application";
  if (context === "partner_registration" || context === "partner_login" || context === "user_login") {
    return `/admin/website-experience/login-signup?context=${context}`;
  }
  return "/admin/website-experience";
}

function serviceCatalogueItemTitle(row: AdminPartnerServiceCatalogueResponse["audit"][number], catalogue: AdminPartnerServiceCatalogueResponse) {
  const item = catalogue.draft.items.find((entry) => entry.stableCode === row.entityId || entry.id === row.entityId)
    ?? catalogue.published.items.find((entry) => entry.stableCode === row.entityId || entry.id === row.entityId);
  if (item) return item.name;
  return "Service Catalogue";
}

function contextTitle(context?: string) {
  if (context === "partner_application") return "Partner Application";
  if (context === "partner_registration") return "Partner Registration";
  if (context === "partner_login") return "Partner Login";
  if (context === "user_login") return "User Login";
  return "";
}

function humanize(value: string) {
  return value.split(/[_-]/g).filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}
