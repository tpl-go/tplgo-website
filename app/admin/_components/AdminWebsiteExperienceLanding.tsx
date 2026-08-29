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
  Eye,
  FilePenLine,
  Globe2,
  Home,
  Image as ImageIcon,
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

type ExperienceFilter = "all" | "global" | "pages" | "published" | "scheduled" | "draft";

const futureGlobalModules = [
  { label: "Header / Navigation", icon: Navigation },
  { label: "Footer", icon: Tags },
  { label: "Global Notices", icon: PanelTop },
  { label: "Global Promotional Banners", icon: ImageIcon },
];

const pageModules = [
  { label: "Homepage", path: "/", icon: Home, sections: ["Hero", "Search", "Themes", "Offers"], status: "Static route" },
  { label: "Flights", path: "/flights", icon: Plane, sections: ["Search", "Results", "Review"], status: "Static route" },
  { label: "Hotels", path: "/hotels/results", icon: Globe2, sections: ["Search", "Results", "Booking"], status: "Static route" },
  { label: "Partner", path: "/partner-preview", icon: Users, sections: ["Entry", "Desk", "Verification"], status: "Foundation" },
  { label: "Creator", path: "/creators", icon: BookOpen, sections: ["Catalog", "Licensing", "Checkout"], status: "Static route" },
  { label: "Smart Planner", path: "/smart-planner", icon: Sparkles, sections: ["Planner", "Workspace", "Review"], status: "Static route" },
  { label: "Marketplace", path: "/local-market", icon: ShoppingBag, sections: ["Catalog", "Seller", "Compliance"], status: "Static route" },
  { label: "Local Life", path: "/local-life", icon: Compass, sections: ["Experiences", "Creators", "Local"], status: "Static route" },
  { label: "Cab", path: "/cab/result", icon: Car, sections: ["Search", "Results", "Booking"], status: "Static route" },
];

export function AdminWebsiteExperienceLanding() {
  const [state, setState] = useState<LoadState>({ status: "loading", data: null, error: null });
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<ExperienceFilter>("all");

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

  const summary = useMemo(() => buildLoginSignupSummary(state.status === "ready" ? state.data.contexts : []), [state]);
  const visiblePages = useMemo(() => {
    const query = search.trim().toLowerCase();
    return pageModules.filter((page) => !query || page.label.toLowerCase().includes(query) || page.path.toLowerCase().includes(query));
  }, [search]);
  const showGlobal = filter === "all" || filter === "global" || filter === "published" || filter === "scheduled" || filter === "draft";
  const showPages = filter === "all" || filter === "pages";

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded border border-amber-100 bg-white">
        <div className="relative bg-gradient-to-r from-slate-950 via-blue-950 to-amber-700 px-5 py-6 text-white md:px-7 md:py-8">
          <div className="absolute right-8 top-6 hidden h-28 w-28 rounded-full border border-white/10 bg-white/5 md:block" />
          <div className="relative flex max-w-5xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase text-amber-100">
                <MonitorCog className="h-4 w-4" />
                Website & Content
              </div>
              <h2 className="mt-4 text-2xl font-semibold tracking-normal md:text-3xl">Website Experience</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-50">
                Manage what customers and partners see across TPL GO.
              </p>
            </div>
            <div className="rounded border border-white/15 bg-white/10 px-4 py-3 text-sm text-blue-50 shadow-sm backdrop-blur">
              <div className="flex items-center gap-2 font-semibold text-white">
                <ShieldCheck className="h-4 w-4 text-amber-200" />
                Presentation only
              </div>
              <p className="mt-1 max-w-xs text-xs leading-5 text-blue-100">
                Auth routes, OTP providers, RBAC, payments, and private storage credentials are not editable here.
              </p>
            </div>
          </div>
        </div>
      </section>

      {state.status === "error" ? (
        <section className="rounded border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {state.error.message}
        </section>
      ) : null}

      <section className="grid gap-5 xl:grid-cols-2">
        {showGlobal ? (
          <DomainCard
            eyebrow="Global Experience"
            title="Shared Website Experiences"
            detail="Manage content used across multiple TPL GO pages and flows."
            icon={Globe2}
            tone="amber"
          >
          <div className="rounded border border-amber-200 bg-amber-50 p-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="inline-flex h-10 w-10 items-center justify-center rounded bg-white text-amber-700">
                  <MonitorCog className="h-5 w-5" />
                </div>
                <p className="mt-3 text-xs font-semibold uppercase text-amber-700">Operational</p>
                <h3 className="mt-1 text-lg font-semibold text-slate-950">Login & Signup</h3>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  User Login, Partner Login, and Partner Registration presentation content.
                </p>
              </div>
              <Link href="/admin/website-experience/login-signup" className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded bg-slate-950 px-4 text-sm font-semibold text-white hover:bg-slate-800">
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
          </DomainCard>
        ) : null}

        {showPages ? (
          <DomainCard
            eyebrow="Pages"
            title="Page-Specific Experience"
            detail="Browse page surfaces and their future section hierarchy."
            icon={LayoutTemplate}
            tone="blue"
          >
          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search pages or routes"
                className="h-10 w-full rounded border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-blue-500"
              />
            </label>
            <select value={filter} onChange={(event) => setFilter(event.target.value as ExperienceFilter)} className="h-10 rounded border border-slate-200 bg-white px-3 text-sm text-slate-700">
              <option value="all">All</option>
              <option value="global">Global</option>
              <option value="pages">Pages</option>
              <option value="published">Published</option>
              <option value="scheduled">Scheduled</option>
              <option value="draft">Draft</option>
            </select>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {visiblePages.map((page) => <PageCard key={page.label} page={page} />)}
          </div>
          </DomainCard>
        ) : null}
      </section>

      <section className="rounded border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-slate-500" />
          <h3 className="text-sm font-semibold text-slate-950">Hierarchy Model</h3>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-5">
          {["Website", "Global Experience / Pages", "Module or Page", "Section or Context", "Block / Fields"].map((item, index) => (
            <div key={item} className="rounded border border-slate-200 bg-slate-50 p-3">
              <p className="text-[11px] font-semibold uppercase text-slate-400">Level {index + 1}</p>
              <p className="mt-1 text-sm font-semibold text-slate-800">{item}</p>
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

function DomainCard({
  eyebrow,
  title,
  detail,
  icon: Icon,
  tone,
  children,
}: {
  eyebrow: string;
  title: string;
  detail: string;
  icon: LucideIcon;
  tone: "amber" | "blue";
  children: React.ReactNode;
}) {
  const color = tone === "amber" ? "bg-amber-50 text-amber-700 border-amber-100" : "bg-blue-50 text-blue-700 border-blue-100";
  return (
    <section className="rounded border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <div className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded border ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase text-slate-500">{eyebrow}</p>
          <h3 className="mt-1 text-xl font-semibold text-slate-950">{title}</h3>
          <p className="mt-1 text-sm leading-6 text-slate-600">{detail}</p>
        </div>
      </div>
      <div className="mt-5 space-y-4">{children}</div>
    </section>
  );
}

function StatusTile({ icon: Icon, label, value, detail }: { icon: LucideIcon; label: string; value: string; detail: string }) {
  return (
    <div className="rounded border border-white bg-white/75 p-3">
      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase text-slate-500">
        <Icon className="h-3.5 w-3.5 text-amber-700" />
        {label}
      </div>
      <p className="mt-1 text-xl font-semibold text-slate-950">{value}</p>
      <p className="mt-1 text-xs leading-5 text-slate-500">{detail}</p>
    </div>
  );
}

function FutureModule({ label, icon: Icon }: { label: string; icon: LucideIcon }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded border border-dashed border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-500">
      <span className="flex items-center gap-2">
        <Icon className="h-4 w-4" />
        {label}
      </span>
      <span className="rounded bg-white px-2 py-1 text-[10px] font-semibold uppercase text-slate-400">Future</span>
    </div>
  );
}

function PageCard({ page }: { page: typeof pageModules[number] }) {
  const Icon = page.icon;
  return (
    <div className="rounded border border-slate-200 bg-slate-50 p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-sm font-semibold text-slate-950">
            <Icon className="h-4 w-4 text-blue-700" />
            {page.label}
          </p>
          <p className="mt-1 truncate text-xs text-slate-500">{page.path}</p>
        </div>
        <span className="rounded bg-white px-2 py-1 text-[10px] font-semibold uppercase text-slate-500">{page.status}</span>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {page.sections.map((section) => <span key={section} className="rounded bg-white px-2 py-1 text-[11px] font-semibold text-slate-500">{section}</span>)}
      </div>
      <p className="mt-3 text-xs leading-5 text-slate-500">Dynamic editing is not configured for this page in UI.1E.4.</p>
    </div>
  );
}
