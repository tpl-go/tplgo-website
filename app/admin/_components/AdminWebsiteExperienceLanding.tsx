"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowLeft,
  BookOpen,
  Car,
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
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Tags,
  Users,
  type LucideIcon,
} from "lucide-react";
import {
  getAdminWebsiteExperienceLoginSignup,
  type AdminApiError,
  type WebsiteExperienceAdminContext,
  type WebsiteExperienceAdminResponse,
} from "../../lib/admin/adminApiClient";

type LandingView = "root" | "global" | "pages" | "partner";

type LoadState =
  | { status: "loading"; data: null; error: null }
  | { status: "ready"; data: WebsiteExperienceAdminResponse; error: null }
  | { status: "error"; data: null; error: AdminApiError };

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
  const [search, setSearch] = useState("");

  useEffect(() => {
    let active = true;
    void getAdminWebsiteExperienceLoginSignup().then((result) => {
      if (!active) return;
      setState(result.ok ? { status: "ready", data: result.data, error: null } : { status: "error", data: null, error: result.error });
    });
    return () => {
      active = false;
    };
  }, []);

  const summary = useMemo(() => buildLoginSignupSummary(state.status === "ready" ? state.data.contexts.filter((context) => context.context !== "partner_application") : []), [state]);
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
    <div className="space-y-6">
      <section className="overflow-hidden rounded-2xl border border-sky-300/15 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.22),transparent_34%),linear-gradient(135deg,#06101e,#0b1f3d_52%,#1f2937)] p-5 shadow-2xl shadow-sky-950/30 md:p-7">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-300/20 bg-orange-400/10 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-orange-200">
              <MonitorCog className="h-4 w-4" />
              Website Experience
            </div>
            <h2 className="mt-4 text-3xl font-black tracking-normal text-sky-100 md:text-4xl">Global Experience / Pages</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
              Manage central presentation experiences while security, service policy, payments, providers, and private storage stay outside content editing.
            </p>
          </div>
          <div className="rounded-2xl border border-sky-300/15 bg-white/[0.04] px-4 py-3 text-sm text-blue-50 shadow-sm backdrop-blur">
            <div className="flex items-center gap-2 font-semibold text-sky-100">
              <ShieldCheck className="h-4 w-4 text-orange-200" />
              Presentation only
            </div>
            <p className="mt-1 max-w-xs text-xs leading-5 text-slate-300">Draft, Preview, Schedule, Publish, media, versions, and audit remain in the certified Website Experience engine.</p>
          </div>
        </div>
      </section>

      {state.status === "error" ? (
        <section className="rounded-xl border border-orange-300/35 bg-orange-500/10 p-4 text-sm font-semibold text-orange-100">{state.error.message}</section>
      ) : null}

      <section className="space-y-3">
        <VerticalEntry icon={MonitorCog} title="Global Experience" detail="Shared Website Experience modules used across TPL GO." count={`${summary.publishedLabel} published`} href="/admin/website-experience/global" />
        <VerticalEntry icon={LayoutTemplate} title="Pages" detail="Registered page-specific experiences and Partner management entries." count={`${pageModules.length} pages`} href="/admin/website-experience/pages" />
      </section>
    </div>
  );
}

function buildLoginSignupSummary(contexts: WebsiteExperienceAdminContext[]) {
  const published = contexts.filter((context) => context.publishedVersion > 0).length;
  const draftChanges = contexts.filter((context) => context.draftVersion > context.publishedVersion).length;
  const scheduled = contexts.filter((context) => context.scheduledFor).length;
  return {
    publishedLabel: contexts.length ? `${published}/${contexts.length}` : "Loading",
    draftLabel: contexts.length ? String(draftChanges) : "Loading",
    scheduledLabel: contexts.length ? String(scheduled) : "Loading",
  };
}

function DrilldownShell({ eyebrow, title, detail, backHref, backLabel, children }: { eyebrow: string; title: string; detail: string; backHref: string; backLabel: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4 rounded-2xl border border-sky-300/10 bg-[#0b1628]/95 p-5 shadow-xl shadow-black/20">
      <Link href={backHref} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-sky-300/15 bg-white/[0.04] px-3 text-sm font-black text-slate-200 hover:border-sky-300/40 focus:outline-none focus:ring-2 focus:ring-sky-300">
        <ArrowLeft className="h-4 w-4" />
        {backLabel}
      </Link>
      <div>
        <p className="text-xs font-black uppercase tracking-[0.14em] text-orange-200">{eyebrow}</p>
        <h3 className="mt-1 text-2xl font-black text-cyan-100">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-slate-400">{detail}</p>
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function VerticalEntry({ icon: Icon, title, detail, count, href, disabled = false }: { icon: LucideIcon; title: string; detail: string; count: string; href?: string; disabled?: boolean }) {
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
        <span className="rounded-full border border-orange-300/20 bg-orange-400/10 px-3 py-1 text-xs font-black text-orange-100">{count}</span>
        <ArrowRight className="h-4 w-4 text-sky-200" />
      </span>
    </>
  );
  const className = "flex min-h-20 w-full items-center justify-between gap-4 rounded-2xl border border-sky-300/10 bg-[#081427] p-4 text-left shadow-lg shadow-black/10 transition hover:border-sky-300/35 hover:bg-[#0b1b33] focus:outline-none focus:ring-2 focus:ring-sky-300";
  if (!href || disabled) {
    return <div className={`${className} opacity-75`}>{body}</div>;
  }
  return <Link href={href} className={className}>{body}</Link>;
}
