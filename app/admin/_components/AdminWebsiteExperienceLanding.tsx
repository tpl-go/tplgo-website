"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  CalendarClock,
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

export function AdminWebsiteExperienceLanding() {
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

      <section className="grid gap-5 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <HubPanel eyebrow="Global Experience" title="Shared Website Experiences" detail="Global modules used across TPL GO. Login & Signup remains here.">
          <div className="rounded-2xl border border-orange-300/20 bg-orange-400/10 p-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-orange-300/15 text-orange-200 ring-1 ring-orange-300/25">
                  <MonitorCog className="h-5 w-5" />
                </div>
                <p className="mt-3 text-xs font-black uppercase tracking-[0.12em] text-orange-200">Global Experience</p>
                <h3 className="mt-1 text-lg font-black text-sky-50">Login & Signup</h3>
                <p className="mt-1 text-sm leading-6 text-slate-300">User Login, Partner Login, and Partner Registration presentation content.</p>
              </div>
              <Link href="/admin/website-experience/login-signup" className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-sky-500 px-4 text-sm font-black text-[#06101e] hover:bg-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200">
                Manage
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <StatusTile icon={BadgeCheck} label="Published" value={summary.publishedLabel} detail="Public login reads published content" />
              <StatusTile icon={FilePenLine} label="Draft" value={summary.draftLabel} detail="Private until publish or schedule" />
              <StatusTile icon={CalendarClock} label="Scheduled" value={summary.scheduledLabel} detail="Future effective versions" />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {futureGlobalModules.map((item) => <FutureModule key={item.label} label={item.label} icon={item.icon} />)}
          </div>
        </HubPanel>

        <HubPanel eyebrow="Pages" title="Page-Specific Experience" detail="Browse registered pages and open Partner application or catalogue management from the Partner page.">
          <label className="relative block">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search pages or routes"
              className="h-10 w-full rounded-xl border border-sky-300/15 bg-[#081427] pl-9 pr-3 text-sm font-medium text-slate-100 outline-none placeholder:text-slate-500 focus:border-sky-300"
            />
          </label>
          <div className="grid gap-3">
            {visiblePages.map((page) => <PageCard key={page.label} page={page} partnerContext={partnerContext} />)}
          </div>
        </HubPanel>
      </section>

      <section className="rounded-2xl border border-white/10 bg-[#0b1628]/95 p-5 shadow-lg shadow-black/20">
        <div className="flex items-center gap-2">
          <LayoutTemplate className="h-4 w-4 text-cyan-300" />
          <h3 className="text-sm font-black text-cyan-100">Hierarchy Model</h3>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-5">
          {["Website Experience", "Global Experience / Pages", "Page or Module", "Section or Context", "Block / Fields"].map((item, index) => (
            <div key={item} className="rounded-xl border border-sky-300/10 bg-white/[0.04] p-3">
              <p className="text-[11px] font-black uppercase text-slate-500">Level {index + 1}</p>
              <p className="mt-1 text-sm font-black text-slate-200">{item}</p>
            </div>
          ))}
        </div>
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

function HubPanel({ eyebrow, title, detail, children }: { eyebrow: string; title: string; detail: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-sky-300/10 bg-[#0b1628]/95 p-5 shadow-xl shadow-black/20">
      <p className="text-xs font-black uppercase tracking-[0.14em] text-orange-200">{eyebrow}</p>
      <h3 className="mt-1 text-xl font-black text-cyan-100">{title}</h3>
      <p className="mt-1 text-sm leading-6 text-slate-400">{detail}</p>
      <div className="mt-5 space-y-4">{children}</div>
    </section>
  );
}

function StatusTile({ icon: Icon, label, value, detail }: { icon: LucideIcon; label: string; value: string; detail: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#0a1424] p-3">
      <div className="flex items-center gap-2 text-[11px] font-black uppercase text-slate-400">
        <Icon className="h-3.5 w-3.5 text-orange-200" />
        {label}
      </div>
      <p className="mt-1 text-xl font-black text-sky-100">{value}</p>
      <p className="mt-1 text-xs leading-5 text-slate-500">{detail}</p>
    </div>
  );
}

function FutureModule({ label, icon: Icon }: { label: string; icon: LucideIcon }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-dashed border-sky-300/15 bg-white/[0.03] px-3 py-3 text-sm text-slate-400">
      <span className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-slate-500" />
        {label}
      </span>
      <span className="rounded-full border border-slate-600/50 bg-slate-800/80 px-2 py-1 text-[10px] font-black uppercase text-slate-400">Future</span>
    </div>
  );
}

function PageCard({ page, partnerContext }: { page: typeof pageModules[number]; partnerContext?: WebsiteExperienceAdminContext }) {
  const Icon = page.icon;
  const isPartner = page.label === "Partner";
  return (
    <div className="rounded-2xl border border-sky-300/10 bg-[#081427] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-sm font-black text-sky-50">
            <Icon className="h-4 w-4 text-cyan-300" />
            {page.label}
          </p>
          <p className="mt-1 truncate text-xs text-slate-500">{page.path}</p>
        </div>
        <span className="rounded-full border border-sky-300/15 bg-white/[0.04] px-2 py-1 text-[10px] font-black uppercase text-slate-400">{page.status}</span>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {page.sections.map((section) => <span key={section} className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-1 text-[11px] font-bold text-slate-300">{section}</span>)}
      </div>
      {isPartner ? (
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          <PartnerEntry label="Partner Page" href="/partner-preview" disabled />
          <PartnerEntry label="Partner Application" href="/admin/website-experience/pages/partner/application" detail={partnerContext ? `Draft v${partnerContext.draftVersion}` : "Loading"} />
          <PartnerEntry label="Service Catalogue" href="/admin/website-experience/pages/partner/service-catalogue" detail="Domains / Services" />
        </div>
      ) : (
        <p className="mt-3 text-xs leading-5 text-slate-500">Dynamic editing is not configured for this page in UI.1E.4.</p>
      )}
    </div>
  );
}

function PartnerEntry({ label, href, detail, disabled = false }: { label: string; href: string; detail?: string; disabled?: boolean }) {
  const className = "flex min-h-16 flex-col justify-between rounded-xl border border-sky-300/15 bg-white/[0.04] p-3 text-left text-sm font-black text-slate-200 hover:border-sky-300/45 focus:outline-none focus:ring-2 focus:ring-sky-300";
  if (disabled) {
    return (
      <span className={`${className} cursor-not-allowed opacity-70`}>
        <span>{label}</span>
        <span className="text-[11px] font-bold text-slate-500">Foundation</span>
      </span>
    );
  }
  return (
    <Link href={href} className={className}>
      <span>{label}</span>
      <span className="text-[11px] font-bold text-orange-200">{detail}</span>
    </Link>
  );
}
