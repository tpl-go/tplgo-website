"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Archive,
  BookOpenText,
  CircleDot,
  Clock3,
  FileClock,
  FileText,
  Globe2,
  Image,
  Layers3,
  LayoutTemplate,
  ListFilter,
  MapPin,
  Megaphone,
  Package,
  Search,
  ShieldCheck,
  Sparkles,
  Tags,
  type LucideIcon,
} from "lucide-react";
import {
  getAdminContentDashboard,
  type AdminApiError,
  type AdminContentDashboard,
  type AdminContentHomepageSection,
  type AdminContentItem,
  type AdminContentMediaItem,
  type AdminContentSeoItem,
  type AdminContentStatus,
  type AdminContentVersionItem,
  type AdminContentWorkflowItem,
} from "../../lib/admin/adminApiClient";
import { WebsiteExperienceManager } from "./WebsiteExperienceManager";

type LoadState<T> =
  | { status: "loading"; data: T; error: null }
  | { status: "ready"; data: T; error: null }
  | { status: "error"; data: T; error: AdminApiError };

type FilterState = {
  search: string;
  status: string;
  module: string;
};

const emptyDashboard: AdminContentDashboard = {
  homepage: [],
  destinations: [],
  packages: [],
  themes: [],
  offers: [],
  blogs: [],
  smartPlanner: [],
  creators: [],
  tplMarketplace: [],
  localLife: [],
  seo: [],
  landingPages: [],
  media: [],
  approvalQueue: [],
  publishQueue: [],
  versionHistory: [],
};

const emptyFilters: FilterState = {
  search: "",
  status: "",
  module: "",
};

const contentModules = [
  "Homepage",
  "Destinations",
  "Packages",
  "Themes",
  "Offers",
  "Blogs / Travel Guides",
  "Smart Planner Content",
  "Creators Content",
  "TPL Marketplace Content",
  "Local Life Content",
  "SEO",
  "Landing Pages",
  "Media Library",
  "Approval Queue",
  "Publish Queue",
  "Version History",
];

export function AdminContentOperationsCenter() {
  const [filters, setFilters] = useState<FilterState>(emptyFilters);
  const [state, setState] = useState<LoadState<AdminContentDashboard>>({ status: "loading", data: emptyDashboard, error: null });

  useEffect(() => {
    let active = true;
    void getAdminContentDashboard().then((result) => {
      if (!active) return;
      setState(result.ok ? { status: "ready", data: result.data, error: null } : { status: "error", data: emptyDashboard, error: result.error });
    });
    return () => {
      active = false;
    };
  }, []);

  const dashboard = state.data;
  const allItems = useMemo(() => flattenContentItems(dashboard), [dashboard]);
  const filteredItems = useMemo(() => filterContentItems(allItems, filters), [allItems, filters]);
  const metrics = useMemo(() => buildMetrics(dashboard, allItems), [dashboard, allItems]);

  return (
    <div className="space-y-6">
      <Hero />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-8">
        <MetricCard icon={Layers3} label="Content Modules" value={contentModules.length} detail="Foundation map" />
        <MetricCard icon={Globe2} label="Homepage Sections" value={dashboard.homepage.length} detail="Read-only sections" />
        <MetricCard icon={MapPin} label="Destinations" value={dashboard.destinations.length} detail="Destination inventory" />
        <MetricCard icon={Package} label="Packages" value={dashboard.packages.length} detail="Package foundation" />
        <MetricCard icon={Megaphone} label="Offers" value={dashboard.offers.length} detail="Campaign visibility" />
        <MetricCard icon={Search} label="SEO Items" value={dashboard.seo.length} detail="Metadata inventory" />
        <MetricCard icon={Image} label="Media Assets" value={dashboard.media.length} detail="Storage pending" />
        <MetricCard icon={AlertTriangle} label="Needs API" value={metrics.needsApi} tone="warning" detail="Integration gaps" />
      </div>

      {state.status === "loading" ? <Notice text="Loading content operations..." /> : null}
      {state.status === "error" ? <Notice tone="danger" text={state.error.message} /> : null}

      <WebsiteExperienceManager />

      <section className="grid gap-4 xl:grid-cols-[17rem_1fr]">
        <ContentNavigation />
        <div className="space-y-4">
          <FilterPanel filters={filters} onChange={setFilters} />
          <HomepagePanel sections={dashboard.homepage} />
          <ContentInventory rows={filteredItems} />
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <CompactContentPanel title="Destinations" icon={MapPin} rows={dashboard.destinations} />
        <CompactContentPanel title="Packages" icon={Package} rows={dashboard.packages} />
        <CompactContentPanel title="Themes" icon={Tags} rows={dashboard.themes} />
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <CompactContentPanel title="Offers" icon={Megaphone} rows={dashboard.offers} />
        <CompactContentPanel title="Blogs / Travel Guides" icon={BookOpenText} rows={dashboard.blogs} />
        <CompactContentPanel title="Smart Planner Content" icon={Sparkles} rows={dashboard.smartPlanner} />
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <CompactContentPanel title="Creators Content" icon={FileText} rows={dashboard.creators} />
        <CompactContentPanel title="TPL Marketplace Content" icon={Archive} rows={dashboard.tplMarketplace} />
        <CompactContentPanel title="Local Life Content" icon={LayoutTemplate} rows={dashboard.localLife} />
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <SeoPanel rows={dashboard.seo} />
        <MediaPanel rows={dashboard.media} />
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <WorkflowPanel title="Approval Queue" rows={dashboard.approvalQueue} />
        <WorkflowPanel title="Publish Queue" rows={dashboard.publishQueue} />
        <VersionPanel rows={dashboard.versionHistory} />
      </section>
    </div>
  );
}

function Hero() {
  return (
    <section className="rounded border border-slate-200 bg-white p-5">
      <p className="text-xs font-semibold uppercase text-slate-500">Digital Experience</p>
      <div className="mt-2 flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-normal text-slate-950">Digital Experience & Dynamic Website Operations Center</h2>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">
            Read-only management foundation for website content, homepage slots, destinations, packages, SEO, media, approval workflow, publish queue, and future ecosystem content.
          </p>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
          <ShieldCheck className="h-4 w-4" />
          No live publishing
        </span>
      </div>
    </section>
  );
}

function ContentNavigation() {
  return (
    <aside className="rounded border border-slate-200 bg-white p-3">
      <p className="px-2 pb-2 text-xs font-semibold uppercase text-slate-500">Content</p>
      <div className="space-y-1">
        {contentModules.map((item) => (
          <div key={item} className="flex h-9 items-center justify-between rounded px-2 text-sm font-medium text-slate-600">
            <span className="truncate">{item}</span>
            <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-slate-500">Read</span>
          </div>
        ))}
      </div>
    </aside>
  );
}

function FilterPanel({ filters, onChange }: { filters: FilterState; onChange: (filters: FilterState) => void }) {
  const update = (key: keyof FilterState, value: string) => onChange({ ...filters, [key]: value });
  return (
    <section className="rounded border border-slate-200 bg-white">
      <div className="flex min-h-14 items-center gap-2 border-b border-slate-100 px-4">
        <ListFilter className="h-4 w-4 text-slate-500" />
        <h3 className="text-sm font-semibold text-slate-950">Content Filters</h3>
      </div>
      <div className="grid gap-3 p-4 md:grid-cols-3">
        <FilterInput label="Search" value={filters.search} onChange={(value) => update("search", value)} />
        <FilterInput label="Status" value={filters.status} onChange={(value) => update("status", value)} />
        <FilterInput label="Module" value={filters.module} onChange={(value) => update("module", value)} />
      </div>
    </section>
  );
}

function HomepagePanel({ sections }: { sections: AdminContentHomepageSection[] }) {
  return (
    <section className="rounded border border-slate-200 bg-white">
      <div className="flex min-h-14 items-center justify-between border-b border-slate-100 px-4">
        <h3 className="text-sm font-semibold text-slate-950">Homepage Management Foundation</h3>
        <span className="rounded bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">{sections.length} sections</span>
      </div>
      <div className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-3">
        {sections.map((section) => (
          <div key={section.id} className="rounded border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-950">{section.name}</p>
                <p className="mt-1 text-xs text-slate-500">{section.module} | {section.source.replaceAll("_", " ")}</p>
              </div>
              <StatusPill value={section.status} />
            </div>
            <p className="mt-3 text-xs leading-5 text-slate-600">{section.notes}</p>
            <p className="mt-3 text-xs font-semibold text-slate-500">Items: {section.itemCount} | Visibility: {section.visibility.replaceAll("_", " ")}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function ContentInventory({ rows }: { rows: Array<AdminContentItem & { group: string }> }) {
  return (
    <section className="rounded border border-slate-200 bg-white">
      <div className="flex min-h-14 items-center justify-between border-b border-slate-100 px-4">
        <h3 className="text-sm font-semibold text-slate-950">Unified Content Inventory</h3>
        <span className="rounded bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">{rows.length} records</span>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
            <tr>{["Module", "Title", "Type", "Destination", "Theme", "Price", "Visibility", "Status", "Actions"].map((header) => <th key={header} className="px-3 py-3 font-semibold">{header}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => (
              <tr key={`${row.group}:${row.id}`} className="hover:bg-slate-50">
                <td className="px-3 py-3 text-slate-600">{row.group}</td>
                <td className="px-3 py-3 font-semibold text-slate-950">{row.title}</td>
                <td className="px-3 py-3 text-slate-600">{row.type}</td>
                <td className="px-3 py-3 text-slate-600">{row.destination || row.country || row.region || "-"}</td>
                <td className="px-3 py-3 text-slate-600">{row.theme || "-"}</td>
                <td className="px-3 py-3 text-slate-600">{row.price || "-"}</td>
                <td className="px-3 py-3 text-slate-600">{(row.visibility || "needs_api").replaceAll("_", " ")}</td>
                <td className="px-3 py-3"><StatusPill value={row.status} /></td>
                <td className="px-3 py-3"><button type="button" disabled className="h-8 rounded border border-slate-200 bg-slate-50 px-2 text-xs font-semibold text-slate-400">Edit disabled</button></td>
              </tr>
            ))}
            {rows.length === 0 ? <tr><td colSpan={9} className="px-3 py-8 text-center text-sm text-slate-500">No content records match the current filters.</td></tr> : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function CompactContentPanel({ title, icon: Icon, rows }: { title: string; icon: LucideIcon; rows: AdminContentItem[] }) {
  return (
    <Panel title={title} icon={Icon}>
      <div className="space-y-2">
        {rows.map((row) => (
          <div key={row.id} className="rounded border border-slate-100 bg-slate-50 px-3 py-2">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-950">{row.title}</p>
                <p className="mt-1 text-xs text-slate-500">{row.type} | {(row.visibility || "needs_api").replaceAll("_", " ")}</p>
              </div>
              <StatusPill value={row.status} />
            </div>
            {row.notes ? <p className="mt-2 text-xs leading-5 text-slate-500">{row.notes}</p> : null}
          </div>
        ))}
      </div>
    </Panel>
  );
}

function SeoPanel({ rows }: { rows: AdminContentSeoItem[] }) {
  return (
    <Panel title="SEO Center" icon={Search}>
      <div className="space-y-3">
        {rows.map((row) => (
          <details key={row.id} className="rounded border border-slate-200" open>
            <summary className="cursor-pointer px-3 py-2 text-sm font-semibold text-slate-950">{row.title}</summary>
            <div className="border-t border-slate-100 p-3">
              <KeyValue rows={[["Slug", row.slug], ["Description", row.description], ["Canonical", row.canonical], ["Robots", row.robots], ["OpenGraph", row.openGraph]]} />
            </div>
          </details>
        ))}
      </div>
    </Panel>
  );
}

function MediaPanel({ rows }: { rows: AdminContentMediaItem[] }) {
  return (
    <Panel title="Media Library" icon={Image}>
      <div className="grid gap-3 sm:grid-cols-2">
        {rows.map((row) => (
          <div key={row.id} className="rounded border border-slate-100 bg-slate-50 p-3">
            <p className="text-sm font-semibold text-slate-950">{row.name}</p>
            <p className="mt-1 text-xs text-slate-500">{row.type} | {row.storage.replaceAll("_", " ")}</p>
            <p className="mt-2 text-xs leading-5 text-slate-600">{row.usage}</p>
            <div className="mt-3"><StatusPill value={row.status} /></div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function WorkflowPanel({ title, rows }: { title: string; rows: AdminContentWorkflowItem[] }) {
  return (
    <Panel title={title} icon={Clock3}>
      <div className="space-y-3">
        {rows.map((row) => (
          <div key={row.id} className="rounded border border-slate-100 bg-slate-50 p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-950">{row.title}</p>
                <p className="mt-1 text-xs text-slate-500">{row.module} | {row.actor} | {row.action}</p>
              </div>
              <StatusPill value={row.status} />
            </div>
            <button type="button" disabled className="mt-3 h-8 rounded border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-400">Action disabled</button>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function VersionPanel({ rows }: { rows: AdminContentVersionItem[] }) {
  return (
    <Panel title="Version History" icon={FileClock}>
      <div className="space-y-3">
        {rows.map((row) => (
          <div key={row.id} className="rounded border border-slate-100 bg-slate-50 p-3">
            <p className="text-sm font-semibold text-slate-950">{row.title}</p>
            <p className="mt-1 text-xs text-slate-500">{row.module} | {row.version}</p>
            <div className="mt-3 flex items-center justify-between gap-3">
              <StatusPill value={row.status} />
              <button type="button" disabled className="h-8 rounded border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-400">Rollback disabled</button>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function MetricCard({ icon: Icon, label, value, detail, tone = "default" }: { icon: LucideIcon; label: string; value: React.ReactNode; detail: string; tone?: "default" | "warning" | "danger" }) {
  const toneClass = tone === "danger" ? "border-rose-200 bg-rose-50 text-rose-700" : tone === "warning" ? "border-amber-200 bg-amber-50 text-amber-700" : "border-slate-200 bg-slate-50 text-slate-700";
  return (
    <div className="rounded border border-slate-200 bg-white p-4">
      <div className={`flex h-9 w-9 items-center justify-center rounded border ${toneClass}`}><Icon className="h-4 w-4" /></div>
      <p className="mt-4 text-xs font-semibold uppercase text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-slate-950">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{detail}</p>
    </div>
  );
}

function Panel({ title, icon: Icon, children }: { title: string; icon: LucideIcon; children: React.ReactNode }) {
  return (
    <section className="rounded border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-slate-500" />
        <h3 className="text-sm font-semibold text-slate-950">{title}</h3>
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function StatusPill({ value }: { value: AdminContentStatus | string }) {
  const classes = value === "failed" || value === "rejected"
    ? "bg-rose-50 text-rose-700"
    : value === "pending" || value === "queued" || value === "draft" || value === "needs_api"
      ? "bg-amber-50 text-amber-700"
      : "bg-slate-100 text-slate-600";
  return <span className={`inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-semibold capitalize ${classes}`}><CircleDot className="h-3 w-3" />{String(value).replaceAll("_", " ")}</span>;
}

function FilterInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="space-y-1 text-xs font-semibold uppercase text-slate-500">
      <span>{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} className="h-10 w-full rounded border border-slate-200 bg-white px-3 text-sm font-medium normal-case text-slate-900 outline-none focus:border-slate-400" />
    </label>
  );
}

function KeyValue({ rows }: { rows: string[][] }) {
  return <dl className="space-y-2">{rows.map(([label, value]) => <div key={label} className="grid grid-cols-[7rem_1fr] gap-2 text-sm"><dt className="text-slate-500">{label}</dt><dd className="break-words font-medium text-slate-950">{value || "-"}</dd></div>)}</dl>;
}

function Notice({ text, tone = "default" }: { text: string; tone?: "default" | "danger" }) {
  const classes = tone === "danger" ? "border-rose-200 bg-rose-50 text-rose-700" : "border-slate-200 bg-white text-slate-600";
  return <div className={`rounded border p-4 text-sm ${classes}`}>{text}</div>;
}

function flattenContentItems(dashboard: AdminContentDashboard): Array<AdminContentItem & { group: string }> {
  return [
    ...withGroup("Destinations", dashboard.destinations),
    ...withGroup("Packages", dashboard.packages),
    ...withGroup("Themes", dashboard.themes),
    ...withGroup("Offers", dashboard.offers),
    ...withGroup("Blogs", dashboard.blogs),
    ...withGroup("Smart Planner", dashboard.smartPlanner),
    ...withGroup("Creators", dashboard.creators),
    ...withGroup("TPL Marketplace", dashboard.tplMarketplace),
    ...withGroup("Local Life", dashboard.localLife),
    ...withGroup("Landing Pages", dashboard.landingPages),
  ];
}

function withGroup(group: string, rows: AdminContentItem[]): Array<AdminContentItem & { group: string }> {
  return rows.map((row) => ({ ...row, group }));
}

function filterContentItems(rows: Array<AdminContentItem & { group: string }>, filters: FilterState) {
  return rows.filter((row) => {
    const haystack = [row.group, row.id, row.title, row.type, row.status, row.destination, row.theme, row.country, row.state, row.city, row.region, row.author, row.notes].join(" ").toLowerCase();
    if (filters.search && !haystack.includes(filters.search.toLowerCase())) return false;
    if (filters.status && row.status !== filters.status) return false;
    if (filters.module && !row.group.toLowerCase().includes(filters.module.toLowerCase())) return false;
    return true;
  });
}

function buildMetrics(dashboard: AdminContentDashboard, allItems: AdminContentItem[]) {
  const needsApiItems = allItems.filter((row) => row.status === "needs_api").length;
  const needsApiHomepage = dashboard.homepage.filter((row) => row.status === "needs_api").length;
  const needsApiSeo = dashboard.seo.filter((row) => row.status === "needs_api").length;
  const needsApiMedia = dashboard.media.filter((row) => row.status === "needs_api").length;
  return {
    needsApi: needsApiItems + needsApiHomepage + needsApiSeo + needsApiMedia,
  };
}
