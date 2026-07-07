"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  Boxes,
  GitBranch,
  Link2,
  Network,
  Save,
  ShieldCheck,
  Sparkles,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import {
  getAdminIntegrationHub,
  type AdminApiError,
  type AdminCrossModuleIntelligenceItem,
  type AdminDependencyGraphItem,
  type AdminEcosystemReadinessItem,
  type AdminEventFlowItem,
  type AdminIntegrationHubDashboard,
  type AdminIntegrationMetric,
  type AdminIntegrationRegistryItem,
  type AdminIntegrationStatus,
  type AdminWorkspaceFoundationItem,
} from "../../lib/admin/adminApiClient";

type LoadState =
  | { status: "loading"; data: AdminIntegrationHubDashboard; error: null }
  | { status: "ready"; data: AdminIntegrationHubDashboard; error: null }
  | { status: "error"; data: AdminIntegrationHubDashboard; error: AdminApiError };

const emptyDashboard: AdminIntegrationHubDashboard = {
  metrics: [],
  registry: [],
  dependencyGraph: [],
  eventFlow: [],
  workspaceFoundation: [],
  crossModuleIntelligence: [],
  ecosystemReadiness: [],
};

export function AdminIntegrationHub() {
  const [state, setState] = useState<LoadState>({ status: "loading", data: emptyDashboard, error: null });

  useEffect(() => {
    let active = true;
    void getAdminIntegrationHub().then((result) => {
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
      {state.status === "loading" ? <Notice tone="neutral" text="Loading integration registry, dependency graph, event flow, and workspace readiness from the admin API." /> : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5 2xl:grid-cols-9">
        {data.metrics.map((metric) => <MetricCard key={metric.id} metric={metric} />)}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_28rem]">
        <div className="space-y-4">
          <IntegrationRegistry rows={data.registry} />
          <DependencyGraph rows={data.dependencyGraph} />
          <EventFlow rows={data.eventFlow} />
        </div>
        <div className="space-y-4">
          <WorkspaceFoundation rows={data.workspaceFoundation} />
          <CrossModuleIntelligence rows={data.crossModuleIntelligence} />
          <EcosystemReadiness rows={data.ecosystemReadiness} />
        </div>
      </section>
    </div>
  );
}

function Hero() {
  return (
    <section className="rounded border border-slate-200 bg-white p-5">
      <p className="text-xs font-semibold uppercase text-slate-500">Enterprise Integration</p>
      <div className="mt-2 flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-normal text-slate-950">Enterprise Integration Hub</h2>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">
            Read-only integration layer for module registry, API dependencies, event relationships, cross-module intelligence, workspace readiness, personalization placeholders, and future ecosystem readiness.
          </p>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
          <ShieldCheck className="h-4 w-4" />
          No settings, workspace, event, API, or integration execution
        </span>
      </div>
    </section>
  );
}

function IntegrationRegistry({ rows }: { rows: AdminIntegrationRegistryItem[] }) {
  return (
    <Panel title="Integration Registry" icon={Boxes}>
      <DataTable
        headers={["Module", "Integration", "Health", "Dependency", "Version", "Edit"]}
        rows={rows.map((row) => [
          row.module,
          <StatusPill key={`${row.id}-integration`} status={row.integrationStatus} />,
          <StatusPill key={`${row.id}-health`} status={row.health} />,
          row.dependency,
          row.version,
          <DisabledButton key={`${row.id}-edit`} label="Edit disabled" />,
        ])}
        emptyText="No integration registry entries returned."
      />
    </Panel>
  );
}

function DependencyGraph({ rows }: { rows: AdminDependencyGraphItem[] }) {
  return (
    <Panel title="API Dependency Graph" icon={Network}>
      <div className="grid gap-2 md:grid-cols-2">
        {rows.map((row) => (
          <div key={row.id} className="rounded border border-slate-200 px-3 py-2">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-950">{row.source} to {row.target}</p>
                <p className="mt-1 text-xs text-slate-500">{row.relationship}</p>
              </div>
              <StatusPill status={row.status} />
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function EventFlow({ rows }: { rows: AdminEventFlowItem[] }) {
  return (
    <Panel title="Event Flow Visualization" icon={Workflow}>
      <DataTable
        headers={["Event", "Source", "Target", "Status", "Execution"]}
        rows={rows.map((row) => [
          row.event,
          row.sourceModule,
          row.targetModule,
          <StatusPill key={`${row.id}-status`} status={row.status} />,
          <DisabledButton key={`${row.id}-execute`} label="Execution disabled" />,
        ])}
        emptyText="No event flow entries returned."
      />
    </Panel>
  );
}

function WorkspaceFoundation({ rows }: { rows: AdminWorkspaceFoundationItem[] }) {
  return (
    <Panel title="Workspace Foundation" icon={Save}>
      <div className="space-y-3">
        {rows.map((row) => (
          <article key={row.id} className="rounded border border-slate-200 p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-950">{row.area.replace(/_/g, " ")}</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">{row.detail}</p>
              </div>
              <StatusPill status={row.status} />
            </div>
            <DisabledButton label="Save disabled" />
          </article>
        ))}
      </div>
    </Panel>
  );
}

function CrossModuleIntelligence({ rows }: { rows: AdminCrossModuleIntelligenceItem[] }) {
  return (
    <Panel title="Cross-module Intelligence" icon={GitBranch}>
      <div className="space-y-2">
        {rows.map((row) => (
          <div key={row.id} className="rounded border border-slate-200 px-3 py-2">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-950">{row.relationship}</p>
                <p className="mt-1 text-xs text-slate-500">{row.source} to {row.target}</p>
              </div>
              <StatusPill status={row.status} />
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function EcosystemReadiness({ rows }: { rows: AdminEcosystemReadinessItem[] }) {
  return (
    <Panel title="Future Ecosystem Readiness" icon={Sparkles}>
      <div className="space-y-3">
        {rows.map((row) => (
          <article key={row.id} className="rounded border border-slate-200 p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-950">{row.ecosystem}</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">{row.detail}</p>
              </div>
              <StatusPill status={row.readiness} />
            </div>
          </article>
        ))}
      </div>
    </Panel>
  );
}

function MetricCard({ metric }: { metric: AdminIntegrationMetric }) {
  return (
    <article className="rounded border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase text-slate-500">{metric.label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-normal text-slate-950">{metric.value}</p>
        </div>
        <span className="flex h-9 w-9 items-center justify-center rounded bg-emerald-50 text-emerald-700">
          <Link2 className="h-4 w-4" />
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

function StatusPill({ status }: { status: AdminIntegrationStatus }) {
  return <span className={`inline-flex rounded px-2 py-1 text-xs font-semibold ${statusClass(status)}`}>{status.replace(/_/g, " ")}</span>;
}

function DisabledButton({ label }: { label: string }) {
  return <button type="button" disabled className="mt-3 h-8 rounded border border-slate-200 bg-slate-50 px-2 text-xs font-semibold text-slate-400">{label}</button>;
}

function Notice({ tone, text }: { tone: "danger" | "neutral"; text: string }) {
  const className = tone === "danger" ? "border-red-200 bg-red-50 text-red-700" : "border-slate-200 bg-white text-slate-600";
  return <div className={`rounded border px-4 py-3 text-sm ${className}`}>{text}</div>;
}

function statusClass(status: AdminIntegrationStatus) {
  if (status === "connected" || status === "ready") return "bg-emerald-50 text-emerald-700";
  if (status === "watch") return "bg-amber-50 text-amber-700";
  if (status === "planned") return "bg-slate-100 text-slate-600";
  return "bg-blue-50 text-blue-700";
}
