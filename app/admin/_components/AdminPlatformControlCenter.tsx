"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Database,
  FileJson,
  GitBranch,
  KeyRound,
  Layers3,
  Lock,
  ServerCog,
  SlidersHorizontal,
  ToggleLeft,
  type LucideIcon,
} from "lucide-react";
import {
  getAdminPlatformDashboard,
  type AdminApiError,
  type AdminPlatformApiRegistryItem,
  type AdminPlatformDashboard,
  type AdminPlatformFeatureFlag,
  type AdminPlatformInfrastructure,
  type AdminPlatformIntegration,
  type AdminPlatformMetric,
  type AdminPlatformReadinessItem,
  type AdminPlatformRuntimeItem,
  type AdminPlatformSecretStatus,
  type AdminPlatformStatus,
} from "../../lib/admin/adminApiClient";

type LoadState =
  | { status: "loading"; data: AdminPlatformDashboard; error: null }
  | { status: "ready"; data: AdminPlatformDashboard; error: null }
  | { status: "error"; data: AdminPlatformDashboard; error: AdminApiError };

const emptyDashboard: AdminPlatformDashboard = {
  overview: [],
  runtime: [],
  featureFlags: [],
  integrations: [],
  infrastructure: [],
  apis: [],
  secrets: [],
  readiness: [],
  diagnostics: {
    warnings: [],
    knownIssues: [],
    recommendations: [],
    maintenanceMode: "disabled",
  },
};

export function AdminPlatformControlCenter() {
  const [state, setState] = useState<LoadState>({ status: "loading", data: emptyDashboard, error: null });

  useEffect(() => {
    let active = true;
    void getAdminPlatformDashboard().then((result) => {
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
      {state.status === "loading" ? <Notice tone="neutral" text="Loading platform control data from the admin API." /> : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-6">
        {data.overview.map((metric) => <MetricCard key={metric.id} metric={metric} />)}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_27rem]">
        <div className="space-y-4">
          <RuntimePanel rows={data.runtime} />
          <FeatureFlags rows={data.featureFlags} />
          <IntegrationRegistry rows={data.integrations} />
          <InfrastructureHealth rows={data.infrastructure} />
          <ApiRegistry rows={data.apis} />
        </div>
        <div className="space-y-4">
          <DeploymentReadiness rows={data.readiness} />
          <SecretsPanel rows={data.secrets} />
          <DiagnosticsPanel dashboard={data} />
          <FutureArchitecturePanel />
        </div>
      </section>
    </div>
  );
}

function Hero() {
  return (
    <section className="rounded border border-slate-200 bg-white p-5">
      <p className="text-xs font-semibold uppercase text-slate-500">Platform Control</p>
      <div className="mt-2 flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-normal text-slate-950">Platform Control & Configuration Center</h2>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">
            Read-only visibility for runtime configuration, integrations, infrastructure health, feature flags, API registry, masked credentials, and deployment readiness.
          </p>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
          <Lock className="h-4 w-4" />
          No platform mutations
        </span>
      </div>
    </section>
  );
}

function RuntimePanel({ rows }: { rows: AdminPlatformRuntimeItem[] }) {
  return (
    <Panel title="Runtime Configuration" icon={ServerCog}>
      <DataTable
        headers={["Setting", "Value", "Status", "Edit"]}
        rows={rows.map((row) => [
          row.label,
          row.value,
          <StatusPill key={`${row.key}-status`} status={row.status} />,
          <DisabledButton key={`${row.key}-edit`} label="Edit disabled" />,
        ])}
        emptyText="No runtime configuration returned."
      />
    </Panel>
  );
}

function FeatureFlags({ rows }: { rows: AdminPlatformFeatureFlag[] }) {
  return (
    <Panel title="Feature Flag Center" icon={ToggleLeft}>
      <DataTable
        headers={["Feature", "Module", "Status", "Environment", "Action"]}
        rows={rows.map((row) => [
          <div key={`${row.id}-feature`}>
            <p className="font-semibold text-slate-950">{row.feature}</p>
            <p className="text-xs text-slate-500">{row.description}</p>
          </div>,
          row.module,
          <StatusPill key={`${row.id}-status`} status={row.status === "enabled" ? "healthy" : row.status === "disabled" ? "not_configured" : "needs_api"} />,
          row.environment,
          <DisabledButton key={`${row.id}-action`} label="Toggle disabled" />,
        ])}
        emptyText="No feature flags returned."
      />
    </Panel>
  );
}

function IntegrationRegistry({ rows }: { rows: AdminPlatformIntegration[] }) {
  return (
    <Panel title="Integration Registry" icon={Layers3}>
      <DataTable
        headers={["Integration", "Category", "Provider", "Health", "Config"]}
        rows={rows.map((row) => [
          row.name,
          row.category,
          row.provider,
          <StatusPill key={`${row.id}-health`} status={row.status} />,
          row.configuration === "masked" ? "Masked" : row.configuration === "missing" ? "Missing" : "Placeholder",
        ])}
        emptyText="No integrations returned."
      />
    </Panel>
  );
}

function InfrastructureHealth({ rows }: { rows: AdminPlatformInfrastructure[] }) {
  return (
    <Panel title="Infrastructure Health" icon={Database}>
      <div className="grid gap-3 md:grid-cols-2">
        {rows.length === 0 ? <EmptyState text="No infrastructure health returned." /> : null}
        {rows.map((row) => (
          <div key={row.id} className="rounded border border-slate-200 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-slate-950">{row.name}</p>
                <p className="mt-1 text-xs text-slate-500">Latency: {row.latency}</p>
                <p className="text-xs text-slate-500">Connections: {row.connections}</p>
              </div>
              <StatusPill status={row.health} />
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function ApiRegistry({ rows }: { rows: AdminPlatformApiRegistryItem[] }) {
  return (
    <Panel title="API Registry" icon={FileJson}>
      <DataTable
        headers={["API Group", "Category", "Count", "Status", "Docs"]}
        rows={rows.map((row) => [
          row.name,
          row.category,
          row.count,
          <StatusPill key={`${row.id}-status`} status={row.status} />,
          "Placeholder",
        ])}
        emptyText="No API registry data returned."
      />
    </Panel>
  );
}

function DeploymentReadiness({ rows }: { rows: AdminPlatformReadinessItem[] }) {
  return (
    <Panel title="Deployment Readiness" icon={GitBranch}>
      <div className="space-y-3">
        {rows.length === 0 ? <EmptyState text="No readiness checks returned." /> : null}
        {rows.map((row) => (
          <div key={row.id} className="rounded border border-slate-200 p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-950">{row.label}</p>
                <p className="mt-1 text-xs text-slate-500">{row.detail}</p>
              </div>
              <StatusPill status={row.status} />
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function SecretsPanel({ rows }: { rows: AdminPlatformSecretStatus[] }) {
  return (
    <Panel title="Secrets & Credentials" icon={KeyRound}>
      <div className="space-y-3">
        {rows.length === 0 ? <EmptyState text="No credential status returned." /> : null}
        {rows.map((row) => (
          <div key={row.id} className="flex items-center justify-between gap-3 rounded border border-slate-200 p-3">
            <div>
              <p className="text-sm font-semibold text-slate-950">{row.provider}</p>
              <p className="text-xs text-slate-500">{row.configured ? "Configured" : "Missing"} · {row.value}</p>
            </div>
            <StatusPill status={row.health} />
          </div>
        ))}
      </div>
    </Panel>
  );
}

function DiagnosticsPanel({ dashboard }: { dashboard: AdminPlatformDashboard }) {
  return (
    <Panel title="System Diagnostics" icon={AlertTriangle}>
      <DiagnosticList title="Warnings" rows={dashboard.diagnostics.warnings} emptyText="No active platform warnings returned." />
      <DiagnosticList title="Known Issues" rows={dashboard.diagnostics.knownIssues} emptyText="No known issues returned." />
      <DiagnosticList title="Recommendations" rows={dashboard.diagnostics.recommendations} emptyText="No recommendations returned." />
      <div className="mt-3 rounded border border-slate-200 bg-slate-50 p-3 text-xs font-semibold text-slate-500">
        Maintenance mode: {dashboard.diagnostics.maintenanceMode}
      </div>
    </Panel>
  );
}

function FutureArchitecturePanel() {
  const rows = [
    "Multi-region deployment",
    "Kubernetes",
    "Microservices",
    "AI orchestration",
    "Provider switching",
    "Auto-scaling",
    "Disaster Recovery",
    "Blue/Green deployment",
    "Feature rollout",
    "TPL Creators",
    "TPL Marketplace",
    "TPL Local Life",
  ];
  return (
    <Panel title="Future Architecture Readiness" icon={SlidersHorizontal}>
      <div className="grid gap-2">
        {rows.map((row) => (
          <div key={row} className="flex items-center justify-between rounded border border-slate-200 px-3 py-2 text-sm">
            <span className="font-medium text-slate-700">{row}</span>
            <span className="text-xs font-semibold text-slate-400">Reserved</span>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function MetricCard({ metric }: { metric: AdminPlatformMetric }) {
  const Icon = metric.status === "healthy" ? CheckCircle2 : AlertTriangle;
  return (
    <article className="rounded border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase text-slate-500">{metric.label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-normal text-slate-950">{metric.value}</p>
        </div>
        <span className={`flex h-9 w-9 items-center justify-center rounded ${statusIconClass(metric.status)}`}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-3 text-xs leading-5 text-slate-500">{metric.detail}</p>
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

function DiagnosticList({ title, rows, emptyText }: { title: string; rows: string[]; emptyText: string }) {
  return (
    <div className="mb-3">
      <p className="mb-2 text-xs font-semibold uppercase text-slate-500">{title}</p>
      <div className="space-y-2">
        {rows.length === 0 ? <p className="rounded border border-slate-200 bg-slate-50 p-3 text-xs text-slate-500">{emptyText}</p> : null}
        {rows.map((row) => <p key={row} className="rounded border border-slate-200 p-3 text-xs leading-5 text-slate-600">{row}</p>)}
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: AdminPlatformStatus }) {
  return <span className={`inline-flex rounded px-2 py-1 text-xs font-semibold ${statusClass(status)}`}>{status.replace(/_/g, " ")}</span>;
}

function DisabledButton({ label }: { label: string }) {
  return <button type="button" disabled className="h-8 rounded border border-slate-200 bg-slate-50 px-2 text-xs font-semibold text-slate-400">{label}</button>;
}

function EmptyState({ text }: { text: string }) {
  return <div className="rounded border border-slate-200 bg-slate-50 p-4 text-center text-sm text-slate-500">{text}</div>;
}

function Notice({ tone, text }: { tone: "danger" | "neutral"; text: string }) {
  const className = tone === "danger" ? "border-red-200 bg-red-50 text-red-700" : "border-slate-200 bg-white text-slate-600";
  return <div className={`rounded border px-4 py-3 text-sm ${className}`}>{text}</div>;
}

function statusClass(status: AdminPlatformStatus) {
  if (status === "healthy") return "bg-emerald-50 text-emerald-700";
  if (status === "degraded") return "bg-amber-50 text-amber-700";
  if (status === "offline") return "bg-red-50 text-red-700";
  if (status === "not_configured") return "bg-slate-100 text-slate-600";
  return "bg-blue-50 text-blue-700";
}

function statusIconClass(status: AdminPlatformStatus) {
  if (status === "healthy") return "bg-emerald-50 text-emerald-700";
  if (status === "degraded") return "bg-amber-50 text-amber-700";
  if (status === "offline") return "bg-red-50 text-red-700";
  if (status === "not_configured") return "bg-slate-100 text-slate-600";
  return "bg-blue-50 text-blue-700";
}
