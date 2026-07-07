"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  Bell,
  BriefcaseBusiness,
  CircleDot,
  CreditCard,
  FileBarChart,
  Gauge,
  LineChart,
  Lock,
  Megaphone,
  Network,
  PieChart,
  RefreshCcw,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
  WalletCards,
  type LucideIcon,
} from "lucide-react";
import {
  getAdminExecutiveDashboard,
  type AdminApiError,
  type AdminExecutiveAlert,
  type AdminExecutiveAnalyticsItem,
  type AdminExecutiveDashboard,
  type AdminExecutiveInsight,
  type AdminExecutiveKpi,
  type AdminExecutiveReport,
  type AdminExecutiveTrend,
} from "../../lib/admin/adminApiClient";

type LoadState<T> =
  | { status: "loading"; data: T; error: null }
  | { status: "ready"; data: T; error: null }
  | { status: "error"; data: T; error: AdminApiError };

const emptyDashboard: AdminExecutiveDashboard = {
  kpis: [],
  analytics: [],
  trends: [],
  reports: [],
  alerts: [],
  insights: [],
};

const moduleIcons: Record<string, LucideIcon> = {
  Bookings: BriefcaseBusiness,
  Finance: CreditCard,
  Customers: Users,
  CRM: Users,
  Suppliers: Network,
  Wallet: WalletCards,
  Refunds: RefreshCcw,
  Offers: Megaphone,
  Content: FileBarChart,
  Communications: Bell,
  "Smart Planner": Sparkles,
  "TPL Creators": Sparkles,
  "TPL Marketplace": BriefcaseBusiness,
  "TPL Local Life": Users,
};

export function AdminExecutiveIntelligenceCenter() {
  const [state, setState] = useState<LoadState<AdminExecutiveDashboard>>({ status: "loading", data: emptyDashboard, error: null });
  const [selectedKpiId, setSelectedKpiId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void getAdminExecutiveDashboard().then((result) => {
      if (!active) return;
      setState(result.ok ? { status: "ready", data: result.data, error: null } : { status: "error", data: emptyDashboard, error: result.error });
    });
    return () => {
      active = false;
    };
  }, []);

  const dashboard = state.data;
  const selectedKpi = dashboard.kpis.find((kpi) => kpi.id === selectedKpiId) ?? dashboard.kpis[0] ?? null;
  const alertMetrics = useMemo(() => ({
    watch: dashboard.alerts.filter((alert) => alert.status === "watch").length,
    needsApi: dashboard.alerts.filter((alert) => alert.status === "needs_api").length,
  }), [dashboard.alerts]);

  return (
    <div className="space-y-6">
      <Hero />

      {state.status === "loading" ? <Notice text="Loading executive intelligence..." /> : null}
      {state.status === "error" ? <Notice tone="danger" text={state.error.message} /> : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-8">
        {dashboard.kpis.map((kpi) => (
          <KpiCard key={kpi.id} kpi={kpi} active={selectedKpi?.id === kpi.id} onSelect={setSelectedKpiId} />
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_27rem]">
        <div className="space-y-4">
          <KpiDrilldown kpi={selectedKpi} />
          <BusinessAnalytics rows={dashboard.analytics} />
          <ExecutiveTrends rows={dashboard.trends} />
        </div>
        <div className="space-y-4">
          <ExecutiveAlerts rows={dashboard.alerts} watch={alertMetrics.watch} needsApi={alertMetrics.needsApi} />
          <CrossModuleInsights rows={dashboard.insights} />
        </div>
      </section>

      <ReportCenter rows={dashboard.reports} />
      <EcosystemReadiness />
    </div>
  );
}

function Hero() {
  return (
    <section className="rounded border border-slate-200 bg-white p-5">
      <p className="text-xs font-semibold uppercase text-slate-500">Executive Intelligence</p>
      <div className="mt-2 flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-normal text-slate-950">Executive Intelligence & Business Insights Center</h2>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">
            Business overview for leadership across bookings, revenue, finance, customers, suppliers, content, communications, Smart Planner, and future TPL ecosystem lines.
          </p>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
          <ShieldCheck className="h-4 w-4" />
          Read-only insights
        </span>
      </div>
    </section>
  );
}

function KpiCard({ kpi, active, onSelect }: { kpi: AdminExecutiveKpi; active: boolean; onSelect: (id: string) => void }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(kpi.id)}
      className={["rounded border bg-white p-4 text-left hover:border-slate-300", active ? "border-slate-950" : "border-slate-200"].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <StatusIcon status={kpi.status} />
        <StatusPill value={kpi.status} />
      </div>
      <p className="mt-4 text-xs font-semibold uppercase text-slate-500">{kpi.label}</p>
      <p className="mt-1 break-words text-2xl font-semibold text-slate-950">{kpi.value}</p>
      <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{kpi.detail}</p>
    </button>
  );
}

function KpiDrilldown({ kpi }: { kpi: AdminExecutiveKpi | null }) {
  return (
    <Panel title="KPI Drilldown" icon={Search}>
      {kpi ? (
        <div className="grid gap-4 xl:grid-cols-[1fr_14rem]">
          <div>
            <p className="text-xl font-semibold text-slate-950">{kpi.label}</p>
            <p className="mt-1 text-3xl font-semibold text-slate-950">{kpi.value}</p>
            <p className="mt-3 text-sm leading-6 text-slate-600">{kpi.detail}</p>
          </div>
          <div className="rounded border border-slate-100 bg-slate-50 p-3">
            <KeyValue rows={[["Status", kpi.status], ["Source", kpi.source], ["Actions", "Read only"]]} />
            <button type="button" disabled className="mt-3 h-9 w-full rounded border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-400">Edit disabled</button>
          </div>
        </div>
      ) : <p className="text-sm text-slate-500">No KPI selected.</p>}
    </Panel>
  );
}

function BusinessAnalytics({ rows }: { rows: AdminExecutiveAnalyticsItem[] }) {
  return (
    <Panel title="Business Analytics" icon={BarChart3}>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {rows.map((row) => {
          const Icon = moduleIcons[row.module] ?? PieChart;
          return (
            <div key={row.id} className="rounded border border-slate-100 bg-slate-50 p-3">
              <div className="flex items-start justify-between gap-3">
                <Icon className="h-4 w-4 text-slate-500" />
                <StatusPill value={row.status} />
              </div>
              <p className="mt-3 text-sm font-semibold text-slate-950">{row.title}</p>
              <p className="mt-1 text-xl font-semibold text-slate-950">{row.metric}</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">{row.detail}</p>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

function ExecutiveTrends({ rows }: { rows: AdminExecutiveTrend[] }) {
  return (
    <Panel title="Executive Trends" icon={LineChart}>
      <div className="grid gap-3 md:grid-cols-5">
        {rows.map((row) => (
          <div key={row.period} className="rounded border border-slate-100 bg-slate-50 p-3">
            <p className="text-xs font-semibold uppercase text-slate-500">{row.period}</p>
            <p className="mt-2 text-sm font-semibold text-slate-950">{row.bookings} bookings</p>
            <p className="mt-1 text-sm text-slate-600">INR {Math.round(row.revenue).toLocaleString("en-IN")}</p>
            <div className="mt-3"><StatusPill value={row.status} /></div>
            <p className="mt-2 text-xs text-slate-500">{row.forecast.replaceAll("_", " ")}</p>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function ExecutiveAlerts({ rows, watch, needsApi }: { rows: AdminExecutiveAlert[]; watch: number; needsApi: number }) {
  return (
    <Panel title="Executive Alerts" icon={AlertTriangle}>
      <div className="mb-4 grid grid-cols-2 gap-3">
        <MiniStat label="Watch" value={watch} />
        <MiniStat label="Needs API" value={needsApi} />
      </div>
      <div className="space-y-3">
        {rows.map((row) => (
          <div key={row.id} className="rounded border border-slate-100 bg-slate-50 p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-950">{row.title}</p>
                <p className="mt-1 text-xs text-slate-500">{row.module} | {row.status.replaceAll("_", " ")}</p>
              </div>
              <StatusPill value={row.severity} />
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-600">{row.detail}</p>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function CrossModuleInsights({ rows }: { rows: AdminExecutiveInsight[] }) {
  return (
    <Panel title="Cross Module Insights" icon={Network}>
      <div className="space-y-3">
        {rows.map((row) => (
          <div key={row.id} className="rounded border border-slate-100 bg-slate-50 p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-950">{row.title}</p>
                <p className="mt-1 text-xs text-slate-500">{row.relationship}</p>
              </div>
              <StatusPill value={row.status} />
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-600">{row.detail}</p>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function ReportCenter({ rows }: { rows: AdminExecutiveReport[] }) {
  return (
    <Panel title="Report Center" icon={FileBarChart}>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {rows.map((row) => (
          <div key={row.id} className="rounded border border-slate-100 bg-slate-50 p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-950">{row.name}</p>
                <p className="mt-1 text-xs text-slate-500 capitalize">{row.category}</p>
              </div>
              <StatusPill value={row.status} />
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-600">{row.detail}</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button type="button" disabled className="h-8 rounded border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-400">Export disabled</button>
              <button type="button" disabled className="h-8 rounded border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-400">Schedule disabled</button>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function EcosystemReadiness() {
  return (
    <Panel title="Future Intelligence Readiness" icon={Sparkles}>
      <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
        {["TPL Creators", "TPL Marketplace", "TPL Local Life", "AI Business Insights", "Predictive Analytics", "Forecasting"].map((item) => (
          <div key={item} className="rounded border border-slate-100 bg-slate-50 p-3">
            <Lock className="h-4 w-4 text-slate-500" />
            <p className="mt-2 text-sm font-semibold text-slate-950">{item}</p>
            <p className="mt-1 text-xs text-slate-500">Architecture reserved</p>
          </div>
        ))}
      </div>
    </Panel>
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

function StatusIcon({ status }: { status: string }) {
  const classes = status === "critical" ? "border-rose-200 bg-rose-50 text-rose-700" : status === "watch" || status === "needs_api" ? "border-amber-200 bg-amber-50 text-amber-700" : "border-slate-200 bg-slate-50 text-slate-700";
  const Icon = status === "critical" ? AlertTriangle : status === "watch" || status === "needs_api" ? Gauge : TrendingUp;
  return <span className={`flex h-9 w-9 items-center justify-center rounded border ${classes}`}><Icon className="h-4 w-4" /></span>;
}

function StatusPill({ value }: { value: string }) {
  const classes = value === "critical" || value === "failed"
    ? "bg-rose-50 text-rose-700"
    : value === "watch" || value === "warning" || value === "partial" || value === "placeholder" || value === "needs_api"
      ? "bg-amber-50 text-amber-700"
      : "bg-slate-100 text-slate-600";
  return <span className={`inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-semibold capitalize ${classes}`}><CircleDot className="h-3 w-3" />{value.replaceAll("_", " ")}</span>;
}

function MiniStat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded border border-slate-100 bg-white p-3">
      <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-semibold text-slate-950">{value}</p>
    </div>
  );
}

function KeyValue({ rows }: { rows: string[][] }) {
  return <dl className="space-y-2">{rows.map(([label, value]) => <div key={label} className="grid grid-cols-[5rem_1fr] gap-2 text-sm"><dt className="text-slate-500">{label}</dt><dd className="break-words font-medium capitalize text-slate-950">{value.replaceAll("_", " ")}</dd></div>)}</dl>;
}

function Notice({ text, tone = "default" }: { text: string; tone?: "default" | "danger" }) {
  const classes = tone === "danger" ? "border-rose-200 bg-rose-50 text-rose-700" : "border-slate-200 bg-white text-slate-600";
  return <div className={`rounded border p-4 text-sm ${classes}`}>{text}</div>;
}
