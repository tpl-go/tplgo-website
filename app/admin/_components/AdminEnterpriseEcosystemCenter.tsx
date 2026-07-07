"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  BarChart3,
  Bot,
  Brain,
  Building2,
  Compass,
  FileBarChart,
  Globe2,
  Handshake,
  Network,
  Search,
  ShieldCheck,
  Sparkles,
  Utensils,
  Users,
  WalletCards,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import {
  getAdminEnterpriseEcosystem,
  type AdminApiError,
  type AdminEnterpriseEcosystemDashboard,
  type AdminEnterpriseEcosystemEdge,
  type AdminEnterpriseEcosystemItem,
  type AdminEnterpriseEcosystemMetric,
  type AdminEnterpriseEcosystemStatus,
} from "../../lib/admin/adminApiClient";

type LoadState =
  | { status: "loading"; data: AdminEnterpriseEcosystemDashboard; error: null }
  | { status: "ready"; data: AdminEnterpriseEcosystemDashboard; error: null }
  | { status: "error"; data: AdminEnterpriseEcosystemDashboard; error: AdminApiError };

const emptyDashboard: AdminEnterpriseEcosystemDashboard = {
  metrics: [],
  missionControl: [],
  customer360: [],
  businessIntelligence: [],
  trustEngine: [],
  aiMemory: [],
  aiCommandCenter: [],
  foodTrustCenter: [],
  localStoriesCenter: [],
  communityIntelligence: [],
  aiLocalConcierge: [],
  reputationEngine: [],
  enterpriseGraph: [],
  enterpriseSearch: [],
  executiveAnalytics: [],
};

export function AdminEnterpriseEcosystemCenter() {
  const [state, setState] = useState<LoadState>({ status: "loading", data: emptyDashboard, error: null });

  useEffect(() => {
    let active = true;
    void getAdminEnterpriseEcosystem().then((result) => {
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
      {state.status === "loading" ? <Notice tone="neutral" text="Loading unified ecosystem intelligence from the admin API." /> : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-8">
        {data.metrics.map((metric) => <MetricCard key={metric.id} metric={metric} />)}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_28rem]">
        <div className="space-y-4">
          <PlatformSection title="Executive Mission Control" icon={Network} rows={data.missionControl} />
          <PlatformSection title="Unified Customer 360" icon={Users} rows={data.customer360} />
          <PlatformSection title="Unified Business Intelligence" icon={BarChart3} rows={data.businessIntelligence} />
          <PlatformSection title="Unified Trust Engine" icon={ShieldCheck} rows={data.trustEngine} />
          <PlatformSection title="Unified AI Memory" icon={Brain} rows={data.aiMemory} />
          <PlatformSection title="AI Command Center" icon={Bot} rows={data.aiCommandCenter} />
          <PlatformSection title="Food Trust Center" icon={Utensils} rows={data.foodTrustCenter} />
          <PlatformSection title="Local Stories Center" icon={Globe2} rows={data.localStoriesCenter} />
          <PlatformSection title="Community Intelligence" icon={Handshake} rows={data.communityIntelligence} />
          <PlatformSection title="AI Local Concierge" icon={Compass} rows={data.aiLocalConcierge} />
          <PlatformSection title="Unified Reputation Engine" icon={Sparkles} rows={data.reputationEngine} />
          <PlatformSection title="Enterprise Search" icon={Search} rows={data.enterpriseSearch} />
          <PlatformSection title="Executive Analytics" icon={FileBarChart} rows={data.executiveAnalytics} />
        </div>
        <div className="space-y-4">
          <GraphPanel rows={data.enterpriseGraph} />
          <CompactSection title="Finance, Wallet, Workflow" icon={WalletCards} rows={data.missionControl.filter((row) => ["wallet", "finance", "workflow"].includes(row.id))} />
          <CompactSection title="Operations Kernel" icon={Workflow} rows={data.missionControl.filter((row) => ["operations", "notifications", "knowledge", "governance", "security", "platform"].includes(row.id))} />
        </div>
      </section>
    </div>
  );
}

function Hero() {
  return (
    <section className="rounded border border-slate-200 bg-white p-5">
      <p className="text-xs font-semibold uppercase text-slate-500">TPL Enterprise Operating System</p>
      <div className="mt-2 flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-normal text-slate-950">Enterprise Ecosystem Intelligence & Unified Operations Platform</h2>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">
            Central operating surface connecting travel, Smart Planner, Creators, TPL Marketplace, Local Life, Wallet, CRM, Finance, AI, Operations, Workflow, Notifications, Knowledge, Governance, Search, Security, and Platform.
          </p>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
          <ShieldCheck className="h-4 w-4" />
          Unified read-only command layer
        </span>
      </div>
    </section>
  );
}

function PlatformSection({ title, icon: Icon, rows }: { title: string; icon: LucideIcon; rows: AdminEnterpriseEcosystemItem[] }) {
  return (
    <Panel title={title} icon={Icon}>
      <DataTable
        headers={["Domain", "Capability", "Signal", "Status", "Action"]}
        rows={rows.map((row) => [
          row.domain,
          row.capability,
          <div key={`${row.id}-detail`} className="max-w-xl">
            <p className="font-semibold text-slate-800">{row.signal}</p>
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

function CompactSection({ title, icon: Icon, rows }: { title: string; icon: LucideIcon; rows: AdminEnterpriseEcosystemItem[] }) {
  return (
    <Panel title={title} icon={Icon}>
      <div className="space-y-3">
        {rows.map((row) => (
          <article key={row.id} className="rounded border border-slate-200 p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-950">{row.capability}</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">{row.detail}</p>
              </div>
              <StatusPill status={row.status} />
            </div>
            <p className="mt-3 text-sm font-semibold text-slate-900">{row.signal}</p>
          </article>
        ))}
      </div>
    </Panel>
  );
}

function GraphPanel({ rows }: { rows: AdminEnterpriseEcosystemEdge[] }) {
  return (
    <Panel title="Enterprise Graph" icon={Network}>
      <div className="space-y-3">
        {rows.map((edge) => (
          <article key={edge.id} className="rounded border border-slate-200 p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-950">{edge.source} to {edge.target}</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">{edge.detail}</p>
              </div>
              <StatusPill status={edge.status} />
            </div>
            <p className="mt-3 text-xs font-semibold uppercase text-slate-500">{edge.relationship}</p>
          </article>
        ))}
      </div>
    </Panel>
  );
}

function MetricCard({ metric }: { metric: AdminEnterpriseEcosystemMetric }) {
  return (
    <article className="rounded border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase text-slate-500">{metric.label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-normal text-slate-950">{metric.value}</p>
        </div>
        <span className="flex h-9 w-9 items-center justify-center rounded bg-indigo-50 text-indigo-700">
          <Building2 className="h-4 w-4" />
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

function StatusPill({ status }: { status: AdminEnterpriseEcosystemStatus }) {
  return <span className={`inline-flex rounded px-2 py-1 text-xs font-semibold ${statusClass(status)}`}>{status.replace(/_/g, " ")}</span>;
}

function DisabledButton({ label }: { label: string }) {
  return <button type="button" disabled className="h-8 rounded border border-slate-200 bg-slate-50 px-2 text-xs font-semibold text-slate-400">{label}</button>;
}

function Notice({ tone, text }: { tone: "danger" | "neutral"; text: string }) {
  const className = tone === "danger" ? "border-red-200 bg-red-50 text-red-700" : "border-slate-200 bg-white text-slate-600";
  return <div className={`rounded border px-4 py-3 text-sm ${className}`}>{text}</div>;
}

function statusClass(status: AdminEnterpriseEcosystemStatus) {
  if (status === "operational" || status === "connected") return "bg-emerald-50 text-emerald-700";
  if (status === "source_ready" || status === "external_pending") return "bg-amber-50 text-amber-700";
  return "bg-red-50 text-red-700";
}
