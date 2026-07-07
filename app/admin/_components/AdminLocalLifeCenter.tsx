"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  BarChart3,
  Bot,
  CalendarDays,
  Compass,
  FileBarChart,
  Globe2,
  Map,
  Mountain,
  Search,
  ShieldCheck,
  Sparkles,
  Store,
  Utensils,
  Users,
  type LucideIcon,
} from "lucide-react";
import {
  getAdminLocalLife,
  type AdminApiError,
  type AdminLocalLifeDashboard,
  type AdminLocalLifeItem,
  type AdminLocalLifeMetric,
  type AdminLocalLifeStatus,
} from "../../lib/admin/adminApiClient";

type LoadState =
  | { status: "loading"; data: AdminLocalLifeDashboard; error: null }
  | { status: "ready"; data: AdminLocalLifeDashboard; error: null }
  | { status: "error"; data: AdminLocalLifeDashboard; error: AdminApiError };

const emptyDashboard: AdminLocalLifeDashboard = {
  metrics: [],
  executive: [],
  experienceCenter: [],
  foodCulinaryCenter: [],
  cultureCenter: [],
  adventureCenter: [],
  localGuidesCenter: [],
  eventsCenter: [],
  marketplace: [],
  intelligence: [],
  crm: [],
  reports: [],
  search: [],
  ecosystem: [],
  aiLocalLife: [],
  mobileReadiness: [],
};

export function AdminLocalLifeCenter() {
  const [state, setState] = useState<LoadState>({ status: "loading", data: emptyDashboard, error: null });

  useEffect(() => {
    let active = true;
    void getAdminLocalLife().then((result) => {
      if (!active) return;
      setState(result.ok ? { status: "ready", data: result.data, error: null } : { status: "error", data: emptyDashboard, error: result.error });
    });
    return () => {
      active = false;
    };
  }, []);

  const data = state.data;

  return (
    <div className="space-y-6">
      <Hero />

      {state.status === "error" ? <Notice tone="danger" text={state.error.message} /> : null}
      {state.status === "loading" ? <Notice tone="neutral" text="Loading TPL Local Life enterprise read models from the admin API." /> : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-8">
        {data.metrics.map((metric) => <MetricCard key={metric.id} metric={metric} />)}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_28rem]">
        <div className="space-y-4">
          <PlatformSection title="Executive Dashboard" icon={BarChart3} rows={data.executive} />
          <PlatformSection title="Experience Center" icon={Compass} rows={data.experienceCenter} />
          <PlatformSection title="Food & Culinary Center" icon={Utensils} rows={data.foodCulinaryCenter} />
          <PlatformSection title="Culture Center" icon={Globe2} rows={data.cultureCenter} />
          <PlatformSection title="Adventure Center" icon={Mountain} rows={data.adventureCenter} />
          <PlatformSection title="Local Guides Center" icon={Users} rows={data.localGuidesCenter} />
          <PlatformSection title="Events Center" icon={CalendarDays} rows={data.eventsCenter} />
          <PlatformSection title="Experience Marketplace" icon={Store} rows={data.marketplace} />
          <PlatformSection title="Experience CRM" icon={Users} rows={data.crm} />
          <PlatformSection title="Reports" icon={FileBarChart} rows={data.reports} />
          <PlatformSection title="Enterprise Search" icon={Search} rows={data.search} />
          <PlatformSection title="Deep Ecosystem Integration" icon={Map} rows={data.ecosystem} />
        </div>
        <div className="space-y-4">
          <CompactSection title="Experience Intelligence" icon={Sparkles} rows={data.intelligence} />
          <CompactSection title="AI Local Life Center" icon={Bot} rows={data.aiLocalLife} />
          <CompactSection title="Mobile Local Life Readiness" icon={ShieldCheck} rows={data.mobileReadiness} />
        </div>
      </section>
    </div>
  );
}

function Hero() {
  return (
    <section className="rounded border border-slate-200 bg-white p-5">
      <p className="text-xs font-semibold uppercase text-slate-500">TPL Destination Discovery</p>
      <div className="mt-2 flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-normal text-slate-950">TPL Local Life Enterprise Platform</h2>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">
            Premium local experiences operating console for food, culture, adventure, guides, events, marketplace packaging, intelligence, CRM, reports, AI suggestions, and TPL ecosystem distribution.
          </p>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
          <ShieldCheck className="h-4 w-4" />
          No booking, provider, experience approval, or destructive mutations
        </span>
      </div>
    </section>
  );
}

function PlatformSection({ title, icon: Icon, rows }: { title: string; icon: LucideIcon; rows: AdminLocalLifeItem[] }) {
  return (
    <Panel title={title} icon={Icon}>
      <DataTable
        headers={["Area", "Capability", "Read Model", "Status", "Action"]}
        rows={rows.map((row) => [
          row.area,
          row.item,
          <div key={`${row.id}-detail`} className="max-w-xl">
            <p className="font-semibold text-slate-800">{row.value}</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">{row.detail}</p>
          </div>,
          <StatusPill key={`${row.id}-status`} status={row.status} />,
          <DisabledButton key={`${row.id}-action`} label="Read only" />,
        ])}
        emptyText={`No ${title.toLowerCase()} rows returned.`}
      />
    </Panel>
  );
}

function CompactSection({ title, icon: Icon, rows }: { title: string; icon: LucideIcon; rows: AdminLocalLifeItem[] }) {
  return (
    <Panel title={title} icon={Icon}>
      <div className="space-y-3">
        {rows.length === 0 ? <p className="text-sm text-slate-500">No {title.toLowerCase()} rows returned.</p> : null}
        {rows.map((row) => (
          <article key={row.id} className="rounded border border-slate-200 p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-950">{row.item}</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">{row.detail}</p>
              </div>
              <StatusPill status={row.status} />
            </div>
            <p className="mt-3 text-sm font-semibold text-slate-900">{row.value}</p>
            <div className="mt-3">
              <DisabledButton label="Action disabled" />
            </div>
          </article>
        ))}
      </div>
    </Panel>
  );
}

function MetricCard({ metric }: { metric: AdminLocalLifeMetric }) {
  return (
    <article className="rounded border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase text-slate-500">{metric.label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-normal text-slate-950">{metric.value}</p>
        </div>
        <span className="flex h-9 w-9 items-center justify-center rounded bg-cyan-50 text-cyan-700">
          <Compass className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-3 text-xs leading-5 text-slate-500">{metric.detail}</p>
      <div className="mt-3">
        <StatusPill status={metric.status} />
      </div>
    </article>
  );
}

function Panel({ title, icon: Icon, children }: { title: string; icon: LucideIcon; children: ReactNode }) {
  return (
    <section className="rounded border border-slate-200 bg-white">
      <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3">
        <Icon className="h-4 w-4 text-slate-500" />
        <h3 className="text-sm font-semibold text-slate-950">{title}</h3>
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

function DataTable({ headers, rows, emptyText }: { headers: string[]; rows: Array<Array<ReactNode>>; emptyText: string }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
          <tr>{headers.map((header) => <th key={header} className="px-3 py-3 font-semibold">{header}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.length === 0 ? (
            <tr>
              <td className="px-3 py-8 text-center text-sm text-slate-500" colSpan={headers.length}>{emptyText}</td>
            </tr>
          ) : null}
          {rows.map((row, rowIndex) => (
            <tr key={`row-${rowIndex}`} className="hover:bg-slate-50">
              {row.map((cell, cellIndex) => <td key={`cell-${rowIndex}-${cellIndex}`} className="px-3 py-3 text-slate-600">{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatusPill({ status }: { status: AdminLocalLifeStatus }) {
  return <span className={`inline-flex rounded px-2 py-1 text-xs font-semibold ${statusClass(status)}`}>{status.replace(/_/g, " ")}</span>;
}

function DisabledButton({ label }: { label: string }) {
  return <button type="button" disabled className="h-8 rounded border border-slate-200 bg-slate-50 px-2 text-xs font-semibold text-slate-400">{label}</button>;
}

function Notice({ tone, text }: { tone: "danger" | "neutral"; text: string }) {
  const className = tone === "danger" ? "border-red-200 bg-red-50 text-red-700" : "border-slate-200 bg-white text-slate-600";
  return <div className={`rounded border px-4 py-3 text-sm ${className}`}>{text}</div>;
}

function statusClass(status: AdminLocalLifeStatus) {
  if (status === "healthy" || status === "active") return "bg-emerald-50 text-emerald-700";
  if (status === "pending" || status === "planned" || status === "needs_api" || status === "watch") return "bg-amber-50 text-amber-700";
  return "bg-red-50 text-red-700";
}
