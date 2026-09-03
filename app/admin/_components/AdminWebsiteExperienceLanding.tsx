"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CalendarClock,
  Car,
  CheckCircle2,
  Compass,
  FilePenLine,
  Globe2,
  Home,
  LayoutTemplate,
  MonitorCog,
  Navigation,
  PanelTop,
  Plane,
  Search,
  ShoppingBag,
  Sparkles,
  Tags,
  Archive,
  Clock3,
  Send,
  Users,
  type LucideIcon,
} from "lucide-react";
import { AdminBackButton } from "./AdminBackButton";
import {
  getAdminWebsiteExperienceLoginSignup,
  getAdminPartnerServiceCatalogue,
  type AdminApiError,
  type AdminPartnerServiceCatalogueResponse,
  type WebsiteExperienceAdminContext,
  type WebsiteExperienceAdminResponse,
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

const futureGlobalModules = [
  { label: "Header / Navigation", icon: Navigation },
  { label: "Footer", icon: Tags },
  { label: "Global Notices", icon: PanelTop },
];

const pageModules = [
  { label: "Homepage", path: "/", icon: Home, sections: ["Hero", "Search", "Themes", "Offers"], status: "Static route" },
  { label: "Flights", path: "/flights", icon: Plane, sections: ["Search", "Results", "Review"], status: "Static route" },
  { label: "Hotels", path: "/hotels/results", icon: Globe2, sections: ["Search", "Results", "Booking"], status: "Static route" },
  { label: "Partner", path: "/partner-preview", icon: Users, sections: ["Partner Page", "Partner Application", "Service Catalogue"], status: "Foundation" },
  { label: "Creator", path: "/creators", icon: BookOpen, sections: ["Catalog", "Licensing", "Checkout"], status: "Static route" },
  { label: "Smart Planner", path: "/smart-planner", icon: Sparkles, sections: ["Planner", "Workspace", "Review"], status: "Static route" },
  { label: "Marketplace", path: "/local-market", icon: ShoppingBag, sections: ["Catalog", "Seller", "Compliance"], status: "Static route" },
  { label: "Local Life", path: "/local-life", icon: Compass, sections: ["Experiences", "Creators", "Local"], status: "Static route" },
  { label: "Cab", path: "/cab/result", icon: Car, sections: ["Search", "Results", "Booking"], status: "Static route" },
];

export function AdminWebsiteExperienceLanding({ view = "root" }: { view?: LandingView }) {
  const [state, setState] = useState<LoadState>({ status: "loading", data: null, error: null });
  const [catalogueState, setCatalogueState] = useState<CatalogueLoadState>({ status: "loading", data: null });
  const [search, setSearch] = useState("");

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

  const summary = useMemo(() => buildLoginSignupSummary(state.status === "ready" ? state.data.contexts.filter((context) => context.context !== "partner_application") : []), [state]);
  const workflowSummary = useMemo(() => mergeWorkflowSummary(summary, catalogueState.status === "ready" ? catalogueState.data : null), [catalogueState, summary]);
  const partnerContext = state.status === "ready" ? state.data.contexts.find((context) => context.context === "partner_application") : undefined;
  const visiblePages = useMemo(() => {
    const query = search.trim().toLowerCase();
    return pageModules.filter((page) => !query || page.label.toLowerCase().includes(query) || page.path.toLowerCase().includes(query) || page.sections.some((section) => section.toLowerCase().includes(query)));
  }, [search]);

  if (view === "global") {
    return (
      <DrilldownShell
        eyebrow="Website Experience"
        title="Global Experience"
        detail="Shared Website Experience modules used across TPL GO."
        backHref="/admin/website-experience"
        backLabel="Back to Website Experience"
      >
        <VerticalEntry
          icon={MonitorCog}
          title="Login & Signup"
          detail="User Login, Partner Login, and Partner Registration presentation content."
          count="3 contexts"
          href="/admin/website-experience/login-signup"
        />
        {futureGlobalModules.map((item) => (
          <VerticalEntry key={item.label} icon={item.icon} title={item.label} detail="Registered global module. Dynamic editing is not configured for this module yet." count="Future" disabled />
        ))}
      </DrilldownShell>
    );
  }

  if (view === "pages") {
    return (
      <DrilldownShell
        eyebrow="Website Experience"
        title="Pages"
        detail="Open one registered page at a time."
        backHref="/admin/website-experience"
        backLabel="Back to Website Experience"
      >
        <label className="relative block">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search pages or routes"
            className="h-11 w-full rounded-xl border border-sky-300/15 bg-[#081427] pl-9 pr-3 text-sm font-medium text-slate-100 outline-none placeholder:text-slate-500 focus:border-sky-300"
          />
        </label>
        {visiblePages.map((page) => (
          <VerticalEntry
            key={page.label}
            icon={page.icon}
            title={page.label}
            detail={page.path}
            count={`${page.sections.length} sections`}
            href={page.label === "Partner" ? "/admin/website-experience/pages/partner" : undefined}
            disabled={page.label !== "Partner"}
          />
        ))}
      </DrilldownShell>
    );
  }

  if (view === "partner") {
    return (
      <DrilldownShell
        eyebrow="Website Experience > Pages"
        title="Partner"
        detail="Open Partner page content, Partner Application content, or the authoritative Service Catalogue."
        backHref="/admin/website-experience/pages"
        backLabel="Back to Pages"
      >
        <VerticalEntry icon={Users} title="Partner Page" detail="Existing Partner landing/page safe presentation content." count="Foundation" disabled />
        <VerticalEntry icon={FilePenLine} title="Partner Application" detail="Application Shell and Steps 1-8 safe presentation fields." count={partnerContext ? `Draft v${partnerContext.draftVersion}` : "Loading"} href="/admin/website-experience/pages/partner/application" />
        <VerticalEntry icon={Tags} title="Service Catalogue" detail="Domains, Services, Requested Services, versions and audit." count="Management" href="/admin/website-experience/pages/partner/service-catalogue" />
      </DrilldownShell>
    );
  }

  return (
    <div className="space-y-5">
      <AdminBackButton href="/admin" label="Back to Admin" />
      <section className="rounded-2xl border border-sky-300/10 bg-[#0b1628] p-5 shadow-xl shadow-black/20">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-orange-200">Website Experience</p>
            <h2 className="mt-2 text-3xl font-black tracking-normal text-sky-100">Website Experience</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">Manage website content and publishing.</p>
          </div>
          <StatusSummary summary={workflowSummary} loading={state.status === "loading" || catalogueState.status === "loading"} />
        </div>
      </section>

      {state.status === "error" || catalogueState.status === "error" ? (
        <section className="flex flex-col gap-3 rounded-xl border border-orange-300/35 bg-orange-500/10 p-4 text-sm font-semibold text-orange-100 sm:flex-row sm:items-center sm:justify-between">
          <span>Some counts could not load. Navigation is still available.</span>
          <button
            type="button"
            onClick={() => {
              const active = { current: true };
              setState({ status: "loading", data: null, error: null });
              setCatalogueState({ status: "loading", data: null });
              loadWebsiteExperience(active);
              loadCatalogueSummary(active);
            }}
            className="inline-flex h-10 items-center justify-center rounded-xl border border-orange-200/40 px-4 text-sm font-black text-orange-50 hover:bg-orange-300/10 focus:outline-none focus:ring-2 focus:ring-orange-200"
          >
            Retry
          </button>
        </section>
      ) : null}

      <section className="space-y-3">
        <SectionLabel title="Content" detail="Choose what you want to manage." />
        <VerticalEntry icon={MonitorCog} title="Global Experience" detail="Shared content used across the website." count={`${summary.publishedLabel} published`} href="/admin/website-experience/global" />
        <VerticalEntry icon={LayoutTemplate} title="Pages" detail="Manage page-specific content." count={`${pageModules.length} pages`} href="/admin/website-experience/pages" />
      </section>

      <section className="space-y-3">
        <SectionLabel title="Work Queue" detail="Continue or review pending changes." />
        <VerticalEntry icon={FilePenLine} title="Drafts" detail="Continue editing saved changes." count={formatCountLabel(workflowSummary.draftLabel, "Draft")} href="/admin/website-experience/login-signup?workflow=drafts" highlight={isPendingCount(workflowSummary.draftLabel)} />
        <VerticalEntry icon={Send} title="Needs Approval" detail="Review changes waiting for approval." count={formatCountLabel(workflowSummary.reviewLabel, "Needs Approval")} href="/admin/website-experience/login-signup?workflow=in_review" highlight={isPendingCount(workflowSummary.reviewLabel)} />
        <VerticalEntry icon={CheckCircle2} title="Ready to Publish" detail="Publish or schedule approved changes." count={formatCountLabel(workflowSummary.approvedLabel, "Ready")} href="/admin/website-experience/login-signup?workflow=approved" highlight={isPendingCount(workflowSummary.approvedLabel)} />
        <VerticalEntry icon={CalendarClock} title="Scheduled" detail="View upcoming publications." count={formatCountLabel(workflowSummary.scheduledLabel, "Scheduled")} href="/admin/website-experience/login-signup?workflow=scheduled" highlight={isPendingCount(workflowSummary.scheduledLabel)} />
      </section>

      <section className="space-y-3">
        <SectionLabel title="Records" detail="View published content and change history." />
        <VerticalEntry icon={Globe2} title="Published Content" detail="View content currently published." count={workflowSummary.publishedLabel} href="/admin/website-experience/login-signup?workflow=published" />
        <VerticalEntry icon={Archive} title="Archive" detail="Archived content and restore workflow." count={workflowSummary.archiveLabel} href="/admin/website-experience/login-signup?workflow=archive" />
        <VerticalEntry icon={Clock3} title="Versions & Audit" detail="Human-readable content history." count={state.status === "ready" ? String(state.data.recentAudit.length) : "Loading"} href="/admin/website-experience/login-signup?workflow=versions" />
      </section>
    </div>
  );
}

function buildLoginSignupSummary(contexts: WebsiteExperienceAdminContext[]) {
  const published = contexts.filter((context) => context.publishedVersion > 0).length;
  const draftChanges = contexts.filter((context) => context.draftVersion > context.publishedVersion).length;
  const scheduled = contexts.filter((context) => context.scheduledFor).length;
  const review = contexts.filter((context) => context.workflowState === "in_review").length;
  const approved = contexts.filter((context) => context.workflowState === "approved").length;
  const archived = contexts.filter((context) => context.workflowState === "archived" || context.status === "archived").length;
  return {
    publishedLabel: contexts.length ? `${published}/${contexts.length}` : "Loading",
    draftLabel: contexts.length ? String(draftChanges) : "Loading",
    reviewLabel: contexts.length ? String(review) : "Loading",
    approvedLabel: contexts.length ? String(approved) : "Loading",
    scheduledLabel: contexts.length ? String(scheduled) : "Loading",
    archiveLabel: contexts.length ? String(archived) : "Loading",
  };
}

function mergeWorkflowSummary(summary: ReturnType<typeof buildLoginSignupSummary>, catalogue: AdminPartnerServiceCatalogueResponse | null) {
  if (!catalogue) return summary;
  const catalogueState = catalogue.workflowState ?? (catalogue.hasUnpublishedChanges ? "draft" : "published");
  const add = (value: string, amount: number) => Number.isFinite(Number(value)) ? String(Number(value) + amount) : value;
  return {
    publishedLabel: summary.publishedLabel,
    draftLabel: add(summary.draftLabel, catalogue.hasUnpublishedChanges && ["draft", "changes_requested"].includes(catalogueState) ? 1 : 0),
    reviewLabel: add(summary.reviewLabel, catalogueState === "in_review" ? 1 : 0),
    approvedLabel: add(summary.approvedLabel, catalogueState === "approved" ? 1 : 0),
    scheduledLabel: summary.scheduledLabel,
    archiveLabel: add(summary.archiveLabel, catalogueState === "archived" ? 1 : 0),
  };
}

function SectionLabel({ title, detail }: { title: string; detail: string }) {
  return (
    <div>
      <h3 className="text-lg font-black text-cyan-100">{title}</h3>
      <p className="mt-1 text-sm leading-6 text-slate-400">{detail}</p>
    </div>
  );
}

function StatusSummary({ summary, loading }: { summary: ReturnType<typeof mergeWorkflowSummary>; loading: boolean }) {
  const chips = [
    { label: "Drafts", value: summary.draftLabel, countLabel: formatCountLabel(summary.draftLabel, "Draft"), href: "/admin/website-experience/login-signup?workflow=drafts" },
    { label: "Needs Approval", value: summary.reviewLabel, countLabel: formatCountLabel(summary.reviewLabel, "Needs Approval", "Needs Approval"), href: "/admin/website-experience/login-signup?workflow=in_review" },
    { label: "Scheduled", value: summary.scheduledLabel, countLabel: formatCountLabel(summary.scheduledLabel, "Scheduled", "Scheduled"), href: "/admin/website-experience/login-signup?workflow=scheduled" },
  ];
  return (
    <div className="flex flex-wrap gap-2" aria-label={loading ? "Workflow counts loading" : "Workflow status summary"}>
      {chips.map((chip) => (
        <Link
          key={chip.label}
          href={chip.href}
          className={`inline-flex min-h-10 items-center gap-2 rounded-full border px-3 text-xs font-black transition focus:outline-none focus:ring-2 focus:ring-sky-300 ${
            isPendingCount(chip.value)
              ? "border-orange-300/30 bg-orange-400/10 text-orange-100 hover:bg-orange-400/15"
              : "border-sky-300/10 bg-white/[0.04] text-slate-300 hover:border-sky-300/25"
          }`}
        >
          <span>{chip.countLabel}</span>
        </Link>
      ))}
    </div>
  );
}

function DrilldownShell({ eyebrow, title, detail, backHref, backLabel, children }: { eyebrow: string; title: string; detail: string; backHref: string; backLabel: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4 rounded-2xl border border-sky-300/10 bg-[#0b1628]/95 p-5 shadow-xl shadow-black/20">
      <AdminBackButton href={backHref} label={backLabel} />
      <div>
        <p className="text-xs font-black uppercase tracking-[0.14em] text-orange-200">{eyebrow}</p>
        <h3 className="mt-1 text-2xl font-black text-cyan-100">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-slate-400">{detail}</p>
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function VerticalEntry({ icon: Icon, title, detail, count, href, disabled = false, highlight = false }: { icon: LucideIcon; title: string; detail: string; count: string; href?: string; disabled?: boolean; highlight?: boolean }) {
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
        <ArrowRight className="h-4 w-4 text-sky-200" />
      </span>
    </>
  );
  const className = "flex min-h-20 w-full flex-col justify-between gap-4 rounded-2xl border border-sky-300/10 bg-[#081427] p-4 text-left shadow-lg shadow-black/10 transition hover:border-sky-300/35 hover:bg-[#0b1b33] focus:outline-none focus:ring-2 focus:ring-sky-300 sm:flex-row sm:items-center";
  if (!href || disabled) {
    return <div className={`${className} opacity-75`}>{body}</div>;
  }
  return <Link href={href} className={className}>{body}</Link>;
}

function formatCountLabel(value: string, singular: string, plural = `${singular}s`) {
  if (value === "Loading") return "Loading";
  const count = Number(value);
  if (!Number.isFinite(count)) return value;
  return `${count} ${count === 1 ? singular : plural}`;
}

function isPendingCount(value: string) {
  const count = Number(value);
  return Number.isFinite(count) && count > 0;
}
