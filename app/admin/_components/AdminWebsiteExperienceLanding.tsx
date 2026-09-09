"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, FilePenLine, Eye, LayoutTemplate, MonitorCog, Pencil, Search, Tags, Users, type LucideIcon } from "lucide-react";
import { AdminBackButton } from "./AdminBackButton";
import {
  getAdminWebsiteExperienceLoginSignup,
  getAdminPartnerServiceCatalogue,
  getAdminVerificationPolicyWorkflow,
  type AdminApiError,
  type AdminPartnerServiceCatalogueResponse,
  type AdminVerificationPolicyWorkflowView,
  type WebsiteExperienceAdminResponse,
  type WebsiteExperienceContext,
} from "../../lib/admin/adminApiClient";

type LandingView = "root" | "global" | "pages" | "partner";

type LoadState =
  | { status: "loading"; data: null; error: null }
  | { status: "ready"; data: WebsiteExperienceAdminResponse; error: null }
  | { status: "error"; data: null; error: AdminApiError };

type CatalogueLoadState =
  | { status: "loading"; data: null }
  | { status: "ready"; data: AdminPartnerServiceCatalogueResponse }
  | { status: "error"; data: null };

type PolicyWorkflowLoadState =
  | { status: "loading"; data: null }
  | { status: "ready"; data: AdminVerificationPolicyWorkflowView }
  | { status: "denied"; data: null }
  | { status: "error"; data: null };

type CentralWorkflowStage = "all" | "drafts" | "in_review" | "changes_requested" | "approved" | "scheduled" | "published" | "archived";
type CentralWorkflowContentType = "all" | "website_experience" | "agreement_template" | "service_catalogue" | "verification_rules";

type CentralWorkflowItem = {
  id: string;
  stage: Exclude<CentralWorkflowStage, "all">;
  publishedInventory: boolean;
  contentType: Exclude<CentralWorkflowContentType, "all">;
  title: string;
  hierarchy: string;
  module: string;
  detail: string;
  status: string;
  draftVersion: string;
  publishedVersion: string;
  changedAt?: string;
  changedBy?: string;
  readiness: string;
  missing: string[];
  scheduledFor?: string;
  scheduledTimezone?: string;
  href: string;
  previewHref?: string;
  primaryAction: string;
  secondaryAction?: string;
};

type CentralWorkflowCounts = Record<Exclude<CentralWorkflowStage, "all" | "published">, number> & {
  publishedContent: string;
};

const pageModules = [
  { label: "Partner", path: "/partner-preview", icon: Users, sections: ["Partner Page", "Partner Application", "Service Catalogue"], description: "Manage Partner experience content." },
];

const contextLabels: Record<WebsiteExperienceContext, string> = {
  user_login: "User Login",
  partner_login: "Partner Login",
  partner_registration: "Partner Registration",
  partner_application: "Partner Application",
};

export function AdminWebsiteExperienceLanding({ view = "root" }: { view?: LandingView }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [state, setState] = useState<LoadState>({ status: "loading", data: null, error: null });
  const [catalogueState, setCatalogueState] = useState<CatalogueLoadState>({ status: "loading", data: null });
  const [policyWorkflowState, setPolicyWorkflowState] = useState<PolicyWorkflowLoadState>({ status: "loading", data: null });
  const [search, setSearch] = useState("");
  const [dashboardSearch, setDashboardSearch] = useState("");
  const [dashboardType, setDashboardType] = useState<CentralWorkflowContentType>("all");
  const dashboardStage = centralWorkflowStageFromValue(searchParams.get("view")) ?? "published";
  const setDashboardStage = useCallback((nextStage: CentralWorkflowStage) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", centralWorkflowStageToUrlValue(nextStage));
    router.push(`/admin/website-experience?${params.toString()}`, { scroll: false });
  }, [router, searchParams]);

  const loadWebsiteExperience = useCallback((active: { current: boolean }) => {
    void getAdminWebsiteExperienceLoginSignup().then((result) => {
      if (!active.current) return;
      setState(result.ok ? { status: "ready", data: result.data, error: null } : { status: "error", data: null, error: result.error });
    });
  }, []);

  const loadCatalogueSummary = useCallback((active: { current: boolean }) => {
    void getAdminPartnerServiceCatalogue().then((result) => {
      if (!active.current) return;
      setCatalogueState(result.ok ? { status: "ready", data: result.data } : { status: "error", data: null });
    });
  }, []);

  const loadPolicyWorkflowSummary = useCallback((active: { current: boolean }) => {
    void getAdminVerificationPolicyWorkflow().then((result) => {
      if (!active.current) return;
      if (result.ok) setPolicyWorkflowState({ status: "ready", data: result.data });
      else if (result.error.code === "ADMIN_UNAUTHORIZED" || result.error.code === "ADMIN_FORBIDDEN") setPolicyWorkflowState({ status: "denied", data: null });
      else setPolicyWorkflowState({ status: "error", data: null });
    });
  }, []);

  useEffect(() => {
    const active = { current: true };
    loadWebsiteExperience(active);
    return () => {
      active.current = false;
    };
  }, [loadWebsiteExperience]);

  useEffect(() => {
    const active = { current: true };
    loadCatalogueSummary(active);
    return () => {
      active.current = false;
    };
  }, [loadCatalogueSummary]);

  useEffect(() => {
    const active = { current: true };
    loadPolicyWorkflowSummary(active);
    return () => {
      active.current = false;
    };
  }, [loadPolicyWorkflowSummary]);

  const dashboardItems = useMemo(() => buildCentralWorkflowItems(
    state.status === "ready" ? state.data : null,
    catalogueState.status === "ready" ? catalogueState.data : null,
    policyWorkflowState.status === "ready" ? policyWorkflowState.data : null,
  ), [catalogueState, policyWorkflowState, state]);
  const filteredDashboardItems = useMemo(() => {
    const query = dashboardSearch.trim().toLowerCase();
    return dashboardItems.filter((item) => {
      const matchesStage = dashboardStage === "all"
        || (dashboardStage === "published" ? item.publishedInventory : item.stage === dashboardStage);
      const matchesType = dashboardType === "all" || item.contentType === dashboardType;
      const haystack = `${item.title} ${item.hierarchy} ${item.module} ${item.detail} ${item.status} ${item.changedBy ?? ""}`.toLowerCase();
      return matchesStage && matchesType && (!query || haystack.includes(query));
    });
  }, [dashboardItems, dashboardSearch, dashboardStage, dashboardType]);
  const dashboardCounts = useMemo(() => countCentralWorkflowStages(dashboardItems, state.status === "ready" ? state.data : null), [dashboardItems, state]);
  const partnerContext = state.status === "ready" ? state.data.contexts.find((context) => context.context === "partner_application") : undefined;
  const visiblePages = useMemo(() => {
    const query = search.trim().toLowerCase();
    return pageModules.filter((page) => !query || page.label.toLowerCase().includes(query) || page.path.toLowerCase().includes(query) || page.sections.some((section) => section.toLowerCase().includes(query)));
  }, [search]);

  if (view === "global") {
    return (
      <ListingShell
        current="Global Experience"
        title="Global Experience"
        detail="Manage content shared across the website."
      >
        <VerticalEntry
          icon={MonitorCog}
          title="Login & Signup"
          detail="Manage login and registration content."
          count="3 experiences"
          href="/admin/website-experience/login-signup"
        />
      </ListingShell>
    );
  }

  if (view === "pages") {
    return (
      <ListingShell
        current="Pages"
        title="Pages"
        detail="Choose a page to manage its content."
      >
        <label className="relative block">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search pages"
            className="h-11 w-full rounded-xl border border-sky-300/15 bg-[#081427] pl-9 pr-3 text-sm font-medium text-slate-100 outline-none placeholder:text-slate-500 focus:border-sky-300"
          />
        </label>
        {visiblePages.map((page) => (
          <VerticalEntry
            key={page.label}
            icon={page.icon}
            title={page.label}
            detail={page.description}
            count={`${page.sections.length} sections`}
            href={page.label === "Partner" ? "/admin/website-experience/pages/partner" : undefined}
            disabled={page.label !== "Partner"}
          />
        ))}
      </ListingShell>
    );
  }

  if (view === "partner") {
    return (
      <ListingShell
        current="Partner"
        parent={{ label: "Pages", href: "/admin/website-experience/pages" }}
        title="Partner"
        detail="Choose a Partner area to manage."
      >
        <VerticalEntry icon={FilePenLine} title="Partner Application" detail="Manage Partner onboarding content." count={partnerContext ? `Draft v${partnerContext.draftVersion}` : "Loading"} href="/admin/website-experience/pages/partner/application" />
        <VerticalEntry icon={Tags} title="Service Catalogue" detail="Manage Partner service domains and services." count="Management" href="/admin/website-experience/pages/partner/service-catalogue" />
      </ListingShell>
    );
  }

  return (
    <div className="space-y-5">
      <AdminBackButton href="/admin" label="Back to Admin" />
      <h2 className="sr-only">Website Experience</h2>

      {state.status === "error" || catalogueState.status === "error" || policyWorkflowState.status === "error" ? (
        <section className="flex flex-col gap-3 rounded-xl border border-orange-300/35 bg-orange-500/10 p-4 text-sm font-semibold text-orange-100 sm:flex-row sm:items-center sm:justify-between">
          <span>Some workflow data could not load. Navigation is still available.</span>
          <button
            type="button"
            onClick={() => {
              const active = { current: true };
              setState({ status: "loading", data: null, error: null });
              setCatalogueState({ status: "loading", data: null });
              setPolicyWorkflowState({ status: "loading", data: null });
              loadWebsiteExperience(active);
              loadCatalogueSummary(active);
              loadPolicyWorkflowSummary(active);
            }}
            className="inline-flex h-10 items-center justify-center rounded-xl border border-orange-200/40 px-4 text-sm font-black text-orange-50 hover:bg-orange-300/10 focus:outline-none focus:ring-2 focus:ring-orange-200"
          >
            Retry
          </button>
        </section>
      ) : null}

      <CentralWorkflowDashboard
        items={filteredDashboardItems}
        counts={dashboardCounts}
        loading={state.status === "loading" || catalogueState.status === "loading" || policyWorkflowState.status === "loading"}
        search={dashboardSearch}
        stage={dashboardStage}
        contentType={dashboardType}
        onSearchChange={setDashboardSearch}
        onStageChange={setDashboardStage}
        onContentTypeChange={setDashboardType}
        onClear={() => {
          setDashboardSearch("");
          setDashboardType("all");
        }}
      />

      <section className="rounded-2xl border border-sky-300/10 bg-[#0b1628]/95 p-4 shadow-xl shadow-black/20" data-compact-website-experience-navigation="true">
        <div className="mb-3">
          <h3 className="text-lg font-black text-cyan-100">Content areas</h3>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <CompactNavLink icon={MonitorCog} title="Global Experience" detail="Login and registration content" href="/admin/website-experience/global" />
          <CompactNavLink icon={LayoutTemplate} title="Pages" detail="Page-specific website content" href="/admin/website-experience/pages" />
        </div>
      </section>
    </div>
  );
}

function CompactNavLink({ icon: Icon, title, detail, href }: { icon: LucideIcon; title: string; detail: string; href: string }) {
  return (
    <Link href={href} className="flex min-h-16 items-center gap-3 rounded-2xl border border-sky-300/10 bg-[#081427] p-3 text-left transition hover:border-sky-300/35 hover:bg-[#0b1b33] focus:outline-none focus:ring-2 focus:ring-sky-300">
      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-400/10 text-cyan-200 ring-1 ring-sky-300/20">
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-black text-sky-50">{title}</span>
        <span className="mt-0.5 block text-xs leading-5 text-slate-400">{detail}</span>
      </span>
    </Link>
  );
}

function CentralWorkflowDashboard({
  items,
  counts,
  loading,
  search,
  stage,
  contentType,
  onSearchChange,
  onStageChange,
  onContentTypeChange,
  onClear,
}: {
  items: CentralWorkflowItem[];
  counts: CentralWorkflowCounts;
  loading: boolean;
  search: string;
  stage: CentralWorkflowStage;
  contentType: CentralWorkflowContentType;
  onSearchChange: (value: string) => void;
  onStageChange: (value: CentralWorkflowStage) => void;
  onContentTypeChange: (value: CentralWorkflowContentType) => void;
  onClear: () => void;
}) {
  return (
    <section className="space-y-4 rounded-2xl border border-sky-300/10 bg-[#0b1628]/95 p-5 shadow-xl shadow-black/20" data-central-workflow-dashboard="real-data">
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8" aria-label="Website Experience workflow navigation" data-authoritative-workflow-overview="true">
        <DashboardCountCard label="Published" value={`${counts.publishedContent}`} selected={stage === "published"} onClick={() => onStageChange("published")} tone="green" />
        <DashboardCountCard label="Drafts" value={`${counts.drafts}`} selected={stage === "drafts"} onClick={() => onStageChange("drafts")} tone="amber" />
        <DashboardCountCard label="Awaiting Approval" value={`${counts.in_review}`} selected={stage === "in_review"} onClick={() => onStageChange("in_review")} tone="sky" />
        <DashboardCountCard label="Changes Requested" value={`${counts.changes_requested}`} selected={stage === "changes_requested"} onClick={() => onStageChange("changes_requested")} tone="orange" />
        <DashboardCountCard label="Approved" value={`${counts.approved}`} selected={stage === "approved"} onClick={() => onStageChange("approved")} tone="emerald" />
        <DashboardCountCard label="Scheduled" value={`${counts.scheduled}`} selected={stage === "scheduled"} onClick={() => onStageChange("scheduled")} tone="violet" />
        <DashboardCountCard label="Archived" value={`${counts.archived}`} selected={stage === "archived"} onClick={() => onStageChange("archived")} tone="slate" />
        <Link href="/admin/website-experience/versions-audit" className="rounded-xl border border-sky-300/15 bg-[#081427] p-3 text-slate-200 transition hover:bg-white/[0.04] focus:outline-none focus:ring-2 focus:ring-sky-300">
          <span className="block text-xl font-black">History</span>
          <span className="mt-0.5 block text-[11px] font-black uppercase tracking-[0.12em]">Activity</span>
        </Link>
      </div>

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_14rem_auto]" data-central-workflow-filters="true">
        <label className="relative block">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
          <span className="sr-only">Search workflow items</span>
          <input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search by content, page, template or editor"
            className="h-11 w-full rounded-xl border border-sky-300/15 bg-[#081427] pl-9 pr-3 text-sm font-medium text-slate-100 outline-none placeholder:text-slate-500 focus:border-sky-300"
          />
        </label>
        <label className="block">
          <span className="sr-only">Content type</span>
          <select value={contentType} onChange={(event) => onContentTypeChange(event.target.value as CentralWorkflowContentType)} className="h-11 w-full rounded-xl border border-sky-300/15 bg-[#081427] px-3 text-sm font-bold text-slate-100 outline-none focus:border-sky-300">
            <option value="all">All content types</option>
            <option value="website_experience">Website Experience</option>
            <option value="agreement_template">Agreement Templates</option>
            <option value="service_catalogue">Service Catalogue</option>
            <option value="verification_rules">Verification Rules</option>
          </select>
        </label>
        {search.trim() || contentType !== "all" ? (
          <button type="button" onClick={onClear} className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-600 bg-slate-900 px-4 text-sm font-black text-slate-200 hover:border-sky-300/30 hover:text-sky-100 focus:outline-none focus:ring-2 focus:ring-sky-300">
            Clear Filters
          </button>
        ) : null}
      </div>

      <div className="space-y-3" data-central-workflow-queue="authoritative">
        {loading ? (
          <p className="rounded-2xl border border-sky-300/10 bg-[#081427] p-4 text-sm font-semibold text-slate-300">Loading workflow items...</p>
        ) : items.length ? (
          items.map((item) => <CentralWorkflowQueueItem key={item.id} item={item} selectedStage={stage} />)
        ) : (
          <div className="rounded-2xl border border-sky-300/10 bg-[#081427] p-5">
            <h4 className="text-base font-black text-sky-50">{stage === "published" ? "No published content matches the current filters." : "No matching workflow items"}</h4>
            <p className="mt-1 text-sm leading-6 text-slate-400">Clear filters or search for another content area.</p>
          </div>
        )}
      </div>
    </section>
  );
}

function DashboardCountCard({ label, value, selected, onClick, tone }: { label: string; value: string; selected: boolean; onClick: () => void; tone: "amber" | "sky" | "orange" | "emerald" | "violet" | "green" | "slate" }) {
  const toneClass = {
    amber: "border-amber-300/25 bg-amber-400/10 text-amber-100",
    sky: "border-sky-300/25 bg-sky-400/10 text-sky-100",
    orange: "border-orange-300/25 bg-orange-400/10 text-orange-100",
    emerald: "border-emerald-300/25 bg-emerald-400/10 text-emerald-100",
    violet: "border-violet-300/25 bg-violet-400/10 text-violet-100",
    green: "border-green-300/25 bg-green-400/10 text-green-100",
    slate: "border-slate-600 bg-slate-900 text-slate-200",
  }[tone];
  return (
    <button type="button" aria-pressed={selected} onClick={onClick} className={`rounded-xl border p-3 text-left transition hover:bg-white/[0.04] focus:outline-none focus:ring-2 focus:ring-sky-300 ${toneClass} ${selected ? "ring-2 ring-orange-200" : ""}`}>
      <span className="block text-xl font-black">{value}</span>
      <span className="mt-0.5 block text-[11px] font-black uppercase tracking-[0.12em]">{label}</span>
    </button>
  );
}

function CentralWorkflowQueueItem({ item, selectedStage }: { item: CentralWorkflowItem; selectedStage: CentralWorkflowStage }) {
  const hasMissing = item.missing.length > 0;
  const newerVersionLabel = selectedStage === "published" && item.stage !== "published" ? `New version: ${item.status} ${item.draftVersion}` : "";
  const primaryAction = selectedStage === "published" ? "Open" : item.primaryAction;
  if (selectedStage === "published") {
    return (
      <article className="rounded-xl border border-sky-300/10 bg-[#081427] p-3" data-central-workflow-item={item.id}>
        <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_10rem]">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-sm font-black text-sky-50">{item.title}</h4>
              <span className="rounded-full border border-emerald-300/25 bg-emerald-400/10 px-2.5 py-1 text-[11px] font-black text-emerald-100">Published {item.publishedVersion}</span>
              {newerVersionLabel ? <span className={`rounded-full border px-2.5 py-1 text-[11px] font-black ${centralStageTone(item.stage)}`}>{newerVersionLabel}</span> : null}
              <span className="rounded-full border border-sky-300/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-black text-slate-300">{contentTypeLabel(item.contentType)}</span>
            </div>
            <p className="mt-1 text-xs leading-5 text-slate-400">{item.hierarchy}</p>
            {item.changedAt ? <p className="mt-2 text-xs font-semibold text-slate-300">Updated {formatDateTime(item.changedAt)}</p> : null}
          </div>
          <div className="flex flex-wrap gap-2 xl:items-start xl:justify-end">
            <Link href={item.href} className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border border-orange-300/20 bg-orange-400/10 px-3 text-xs font-black text-orange-100 hover:bg-orange-400/15 focus:outline-none focus:ring-2 focus:ring-orange-200">
              <Pencil className="h-4 w-4" />
              {primaryAction}
            </Link>
            {item.previewHref ? (
              <Link href={item.previewHref} className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border border-cyan-300/20 bg-cyan-400/10 px-3 text-xs font-black text-cyan-100 hover:bg-cyan-400/15 focus:outline-none focus:ring-2 focus:ring-cyan-200">
                <Eye className="h-4 w-4" />
                Preview
              </Link>
            ) : null}
          </div>
        </div>
      </article>
    );
  }
  return (
    <article className="rounded-xl border border-sky-300/10 bg-[#081427] p-3" data-central-workflow-item={item.id}>
      <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_13rem]">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-sm font-black text-sky-50">{item.title}</h4>
            <span className={`rounded-full border px-2.5 py-1 text-[11px] font-black ${centralStageTone(item.stage)}`}>{item.status}</span>
            <span className="rounded-full border border-sky-300/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-black text-slate-300">{contentTypeLabel(item.contentType)}</span>
          </div>
          <p className="mt-1 text-xs leading-5 text-slate-400">{item.hierarchy}</p>
          <p className="mt-1 text-xs font-semibold text-slate-500">{item.module}{item.detail ? ` · ${item.detail}` : ""}</p>
          <div className="mt-2 grid gap-2 text-xs font-semibold text-slate-300 sm:grid-cols-2 xl:grid-cols-4">
            <span>Draft version: {item.draftVersion}</span>
            <span>Published: {item.publishedVersion}</span>
            <span>Changed: {item.changedAt ? formatDateTime(item.changedAt) : "Not available"}</span>
            {item.changedBy ? <span>Saved by: {item.changedBy}</span> : null}
          </div>
          {item.scheduledFor ? <p className="mt-2 text-xs font-bold text-amber-100">Scheduled for {formatDateTime(item.scheduledFor)} {item.scheduledTimezone ?? ""}</p> : null}
          <div className={`mt-2 rounded-lg border px-3 py-2 text-xs font-semibold ${hasMissing ? "border-amber-300/25 bg-amber-400/10 text-amber-100" : "border-emerald-300/20 bg-emerald-400/10 text-emerald-100"}`}>
            <p>{item.readiness}</p>
            {hasMissing ? (
              <ul className="mt-2 grid gap-1">
                {item.missing.slice(0, 4).map((missing) => <li key={missing}>• {missing}</li>)}
              </ul>
            ) : null}
          </div>
        </div>
        <div className="flex flex-wrap gap-2 xl:items-start xl:justify-end">
          <Link href={item.href} className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border border-orange-300/20 bg-orange-400/10 px-3 text-xs font-black text-orange-100 hover:bg-orange-400/15 focus:outline-none focus:ring-2 focus:ring-orange-200">
            <Pencil className="h-4 w-4" />
            {primaryAction}
          </Link>
          {item.previewHref ? (
            <Link href={item.previewHref} className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border border-cyan-300/20 bg-cyan-400/10 px-3 text-xs font-black text-cyan-100 hover:bg-cyan-400/15 focus:outline-none focus:ring-2 focus:ring-cyan-200">
              <Eye className="h-4 w-4" />
              Preview
            </Link>
          ) : null}
          {item.secondaryAction ? (
            <span className="rounded-lg border border-sky-300/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-slate-300">{item.secondaryAction}</span>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function buildCentralWorkflowItems(
  website: WebsiteExperienceAdminResponse | null,
  catalogue: AdminPartnerServiceCatalogueResponse | null,
  policy: AdminVerificationPolicyWorkflowView | null,
): CentralWorkflowItem[] {
  const items: CentralWorkflowItem[] = [];
  for (const row of website?.contexts ?? []) {
    const marker = row.draftContent.agreementTemplateDraft;
    const stage = centralStageFromState(row.workflowState ?? row.status, Boolean(row.scheduledFor), Boolean(row.hasUnpublishedChanges));
    const centralDraftId = marker?.centralDraftId ?? (marker?.templateId ? `agreement_template:${marker.templateId}` : row.context);
    const draftHref = marker?.centralDraftRoute?.startsWith("/admin/")
      ? marker.centralDraftRoute
      : `/admin/website-experience/login-signup?workflow=drafts&context=${row.context}&draftId=${encodeURIComponent(centralDraftId)}`;
    const editHref = marker?.templateId
      ? `/admin/website-experience/pages/partner/application/step-7-partner-agreement/agreement-templates/${encodeURIComponent(marker.templateId)}`
      : row.context === "partner_application"
        ? "/admin/website-experience/pages/partner/application"
        : "/admin/website-experience/login-signup";
    const title = marker?.targetLabel ?? row.label;
    items.push({
      id: marker?.centralDraftId ?? `${row.context}:${row.draftVersion}:${stage}`,
      stage,
      publishedInventory: row.publishedVersion > 0,
      contentType: marker ? "agreement_template" : "website_experience",
      title,
      hierarchy: marker ? "Website Experience > Pages > Partner > Partner Application > Step 7 Partner Agreement" : `Website Experience > ${row.context === "partner_application" ? "Pages > Partner > Partner Application" : "Global Experience > Login & Signup"}`,
      module: row.context === "partner_application" ? "Partner Application" : contextLabels[row.context],
      detail: marker ? `Agreement Template: ${marker.title}` : publishScope(row.context),
      status: centralStageLabel(stage),
      draftVersion: `v${row.draftVersion}`,
      publishedVersion: row.publishedVersion > 0 ? `v${row.publishedVersion}` : "Not published",
      changedAt: marker?.updatedAt ?? row.updatedAt,
      changedBy: displayActor(row.review?.submittedByAdminId ?? row.review?.reviewedByAdminId),
      readiness: marker?.readinessMissing?.length ? "Needs more details before approval" : readinessForStage(stage),
      missing: marker?.readinessMissing ?? [],
      scheduledFor: row.scheduledFor,
      scheduledTimezone: row.scheduledTimezone,
      href: stage === "drafts" && marker ? draftHref : editHref,
      previewHref: `${editHref}#website-experience-preview`,
      primaryAction: stage === "drafts" ? "Open Draft" : stage === "in_review" ? "Review" : stage === "approved" ? "Publish or Schedule" : stage === "scheduled" ? "Manage Schedule" : stage === "published" ? "View Published" : "Open",
      secondaryAction: stage === "scheduled" ? "Reschedule or cancel from Scheduled" : undefined,
    });
  }

  if (catalogue) {
    const stage = centralStageFromState(catalogue.workflowState ?? catalogue.status, false, Boolean(catalogue.hasUnpublishedChanges));
    items.push({
      id: `service_catalogue:${catalogue.draftVersion}:${stage}`,
      stage,
      publishedInventory: catalogue.publishedVersion > 0,
      contentType: "service_catalogue",
      title: "Service Catalogue",
      hierarchy: "Website Experience > Pages > Partner > Service Catalogue",
      module: "Partner Services",
      detail: `${catalogue.draft.items.length} draft items · ${catalogue.published.items.length} published items`,
      status: centralStageLabel(stage),
      draftVersion: `v${catalogue.draftVersion}`,
      publishedVersion: catalogue.publishedVersion > 0 ? `v${catalogue.publishedVersion}` : "Not published",
      changedAt: catalogue.review?.changedAt,
      changedBy: displayActor(catalogue.review?.changedByAdminId ?? catalogue.review?.submittedByAdminId ?? catalogue.review?.reviewedByAdminId),
      readiness: catalogue.hasUnpublishedChanges ? "Draft changes are available for central review" : readinessForStage(stage),
      missing: [],
      href: "/admin/website-experience/pages/partner/service-catalogue",
      previewHref: "/admin/website-experience/pages/partner/service-catalogue?preview=1",
      primaryAction: stage === "approved" ? "Publish or Schedule" : stage === "in_review" ? "Review" : "Open",
    });
  }

  if (policy?.workflowRecord) {
    const stage = centralStageFromState(policy.workflowRecord.workflowState, Boolean(policy.workflowRecord.scheduledFor), policy.workflowRecord.workflowState === "DRAFT");
    items.push({
      id: `verification_policy:${policy.workflowRecord.draftVersionId ?? policy.published.version}:${stage}`,
      stage,
      publishedInventory: Boolean(policy.published.version),
      contentType: "verification_rules",
      title: "Verification Rules",
      hierarchy: "Website Experience > Partner Operations > Verification Rules",
      module: "Partner Verification",
      detail: policy.workflowRecord.changeSummary || `${policy.totals.activeRequirements} active rules`,
      status: centralStageLabel(stage),
      draftVersion: policy.workflowRecord.draftVersionId ?? policy.draft?.version ?? "No draft",
      publishedVersion: policy.published.version,
      changedAt: policy.workflowRecord.updatedAt,
      readiness: policy.totals.validationIssues.length ? "Needs policy corrections before approval" : readinessForStage(stage),
      missing: policy.totals.validationIssues,
      scheduledFor: policy.workflowRecord.scheduledFor ?? undefined,
      href: policy.workflowRecord.editorReturnRoute || "/admin/partner-verification/rules",
      previewHref: "/admin/partner-verification/rules",
      primaryAction: stage === "approved" ? "Publish or Schedule" : stage === "in_review" ? "Review" : "Open",
    });
  }

  return items.sort((a, b) => {
    const stageRank = { drafts: 1, changes_requested: 2, in_review: 3, approved: 4, scheduled: 5, published: 6, archived: 7 };
    return stageRank[a.stage] - stageRank[b.stage] || Date.parse(b.changedAt ?? "1970-01-01") - Date.parse(a.changedAt ?? "1970-01-01");
  });
}

function countCentralWorkflowStages(items: CentralWorkflowItem[], website: WebsiteExperienceAdminResponse | null): CentralWorkflowCounts {
  return {
    drafts: items.filter((item) => item.stage === "drafts").length,
    changes_requested: items.filter((item) => item.stage === "changes_requested").length,
    in_review: items.filter((item) => item.stage === "in_review").length,
    approved: items.filter((item) => item.stage === "approved").length,
    scheduled: items.filter((item) => item.stage === "scheduled").length,
    archived: items.filter((item) => item.stage === "archived").length,
    publishedContent: website ? `${items.filter((item) => item.publishedInventory).length}` : "Loading",
  };
}

function centralWorkflowStageFromValue(value: string | null): CentralWorkflowStage | null {
  return value === "drafts"
    || value === "in_review"
    || value === "awaiting-approval"
    || value === "changes_requested"
    || value === "changes-requested"
    || value === "approved"
    || value === "scheduled"
    || value === "published"
    || value === "archived"
    || value === "all"
    ? value === "awaiting-approval" ? "in_review" : value === "changes-requested" ? "changes_requested" : value
    : null;
}

function centralWorkflowStageToUrlValue(value: CentralWorkflowStage) {
  if (value === "in_review") return "awaiting-approval";
  if (value === "changes_requested") return "changes-requested";
  return value;
}

function displayActor(value?: string) {
  if (!value) return undefined;
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)) return "System administrator";
  if (/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(value)) return value;
  return value.length > 48 ? "System administrator" : value;
}

function centralStageFromState(state: string | undefined, scheduled: boolean, hasDraftChanges: boolean): Exclude<CentralWorkflowStage, "all"> {
  const normalized = (state ?? "").toLowerCase();
  if (scheduled || normalized === "scheduled") return "scheduled";
  if (normalized === "in_review" || normalized === "pending_approval") return "in_review";
  if (normalized === "changes_requested") return "changes_requested";
  if (normalized === "approved") return "approved";
  if (normalized === "archived" || normalized === "archive") return "archived";
  if (hasDraftChanges || normalized === "draft" || normalized === "working_changes" || normalized === "drafts") return "drafts";
  return "published";
}

function centralStageLabel(stage: Exclude<CentralWorkflowStage, "all">) {
  if (stage === "drafts") return "Draft";
  if (stage === "changes_requested") return "Changes Requested";
  if (stage === "in_review") return "In Review";
  if (stage === "approved") return "Approved";
  if (stage === "scheduled") return "Scheduled";
  if (stage === "archived") return "Archived";
  return "Published";
}

function readinessForStage(stage: Exclude<CentralWorkflowStage, "all">) {
  if (stage === "drafts") return "Ready for approval";
  if (stage === "changes_requested") return "Editor action required before resubmission";
  if (stage === "in_review") return "Waiting for authorized approval";
  if (stage === "approved") return "Ready for Publish Now or Schedule";
  if (stage === "scheduled") return "Scheduled publication is managed centrally";
  if (stage === "archived") return "Archived content remains available in history";
  return "Published content is live; create a new draft to change it";
}

function centralStageTone(stage: Exclude<CentralWorkflowStage, "all">) {
  if (stage === "drafts" || stage === "changes_requested" || stage === "scheduled") return "border-amber-300/25 bg-amber-400/10 text-amber-100";
  if (stage === "in_review") return "border-sky-300/25 bg-sky-400/10 text-sky-100";
  if (stage === "approved" || stage === "published") return "border-emerald-300/25 bg-emerald-400/10 text-emerald-100";
  return "border-slate-600 bg-slate-900 text-slate-300";
}

function contentTypeLabel(type: Exclude<CentralWorkflowContentType, "all">) {
  if (type === "agreement_template") return "Agreement Template";
  if (type === "service_catalogue") return "Service Catalogue";
  if (type === "verification_rules") return "Verification Rules";
  return "Website Experience";
}

function publishScope(context: WebsiteExperienceContext) {
  if (context === "partner_application") return "Partner Application onboarding content.";
  if (context === "partner_login") return "Partner Login content.";
  if (context === "partner_registration") return "Partner Registration content.";
  return "User Login content.";
}

function formatDateTime(value: string) {
  try {
    return new Intl.DateTimeFormat("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function ListingShell({ current, parent, title, detail, children }: { current: "Global Experience" | "Pages" | "Partner"; parent?: { label: string; href: string }; title: string; detail: string; children: React.ReactNode }) {
  const backTarget = parent ?? { label: "Website Experience", href: "/admin/website-experience" };
  return (
    <section className="space-y-4 rounded-2xl border border-sky-300/10 bg-[#0b1628]/95 p-5 shadow-xl shadow-black/20">
      <AdminBackButton href={backTarget.href} label={`Back to ${backTarget.label}`} />
      <BreadcrumbTrail current={current} parent={parent} />
      <div>
        <h3 className="text-2xl font-black text-cyan-100">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-slate-400">{detail}</p>
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function BreadcrumbTrail({ current, parent }: { current: "Global Experience" | "Pages" | "Partner"; parent?: { label: string; href: string } }) {
  return (
    <nav className="flex flex-wrap items-center gap-2 text-xs font-black text-slate-400" aria-label="Website Experience breadcrumbs">
      <Link href="/admin/website-experience" className="rounded text-sky-200 hover:text-orange-100 focus:outline-none focus:ring-2 focus:ring-sky-300">
        Website Experience
      </Link>
      <span aria-hidden="true" className="text-slate-600">&gt;</span>
      {parent ? (
        <>
          <Link href={parent.href} className="rounded text-sky-200 hover:text-orange-100 focus:outline-none focus:ring-2 focus:ring-sky-300">
            {parent.label}
          </Link>
          <span aria-hidden="true" className="text-slate-600">&gt;</span>
        </>
      ) : null}
      <span aria-current="page" className="text-slate-300">{current}</span>
    </nav>
  );
}

function VerticalEntry({
  icon: Icon,
  title,
  detail,
  count,
  href,
  disabled = false,
  disabledHelp = "This area is not available yet.",
  highlight = false,
}: {
  icon: LucideIcon;
  title: string;
  detail: string;
  count: string;
  href?: string;
  disabled?: boolean;
  disabledHelp?: string;
  highlight?: boolean;
}) {
  const body = (
    <>
      <span className="flex min-w-0 items-start gap-3">
        <span className="mt-1 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-400/10 text-cyan-200 ring-1 ring-sky-300/20">
          <Icon className="h-5 w-5" />
        </span>
        <span className="min-w-0">
          <span className="block text-base font-black text-sky-50">{title}</span>
          <span className="mt-1 block text-sm leading-6 text-slate-400">{detail}</span>
        </span>
      </span>
      <span className="flex shrink-0 items-center gap-3">
        <span className={`rounded-full border px-3 py-1 text-xs font-black ${highlight ? "border-orange-300/25 bg-orange-400/10 text-orange-100" : "border-sky-300/10 bg-white/[0.04] text-slate-300"}`}>{count}</span>
        {disabled ? null : <ArrowRight className="h-4 w-4 text-sky-200" />}
      </span>
    </>
  );
  const className = "flex min-h-20 w-full flex-col justify-between gap-4 rounded-2xl border border-sky-300/10 bg-[#081427] p-4 text-left shadow-lg shadow-black/10 transition hover:border-sky-300/35 hover:bg-[#0b1b33] focus:outline-none focus:ring-2 focus:ring-sky-300 sm:flex-row sm:items-center";
  if (!href || disabled) {
    return (
      <div className={`${className} opacity-75 hover:border-sky-300/10 hover:bg-[#081427]`} aria-disabled="true" title={disabledHelp}>
        <span className="sr-only">{disabledHelp}</span>
        {body}
      </div>
    );
  }
  return <Link href={href} className={className}>{body}</Link>;
}
