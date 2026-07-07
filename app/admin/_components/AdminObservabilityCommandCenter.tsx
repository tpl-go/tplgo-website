"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  Activity,
  AlertTriangle,
  BellRing,
  CheckCircle2,
  GitBranch,
  Network,
  Radar,
  SearchCheck,
  ServerCog,
  Timer,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import {
  getAdminObservabilityDashboard,
  type AdminAlertCategory,
  type AdminApiError,
  type AdminEventCorrelation,
  type AdminIncidentEvent,
  type AdminMetricsInventoryItem,
  type AdminObservabilityDashboard,
  type AdminObservabilityMetric,
  type AdminObservabilityStatus,
  type AdminRootCauseReadModel,
  type AdminServiceDependency,
  type AdminTraceReadinessItem,
} from "../../lib/admin/adminApiClient";

type LoadState =
  | { status: "loading"; data: AdminObservabilityDashboard; error: null }
  | { status: "ready"; data: AdminObservabilityDashboard; error: null }
  | { status: "error"; data: AdminObservabilityDashboard; error: AdminApiError };

const emptyDashboard: AdminObservabilityDashboard = {
  incidentCards: [],
  incidents: [],
  correlations: [],
  reliability: [],
  dependencies: [],
  metrics: [],
  traces: [],
  rootCause: [],
  alerts: [],
};

export function AdminObservabilityCommandCenter() {
  const [state, setState] = useState<LoadState>({ status: "loading", data: emptyDashboard, error: null });

  useEffect(() => {
    let active = true;
    void getAdminObservabilityDashboard().then((result) => {
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
      {state.status === "loading" ? <Notice tone="neutral" text="Loading observability read models from the admin API." /> : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-7">
        {data.incidentCards.map((metric) => <MetricCard key={metric.id} metric={metric} />)}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_27rem]">
        <div className="space-y-4">
          <IncidentTimeline rows={data.incidents} />
          <EventCorrelations rows={data.correlations} />
          <ReliabilityDashboard rows={data.reliability} />
          <DependencyGraph rows={data.dependencies} />
          <MetricsFoundation rows={data.metrics} />
        </div>
        <div className="space-y-4">
          <TracingFoundation rows={data.traces} />
          <RootCauseFoundation rows={data.rootCause} />
          <AlertIntelligence rows={data.alerts} />
          <FutureReadiness />
        </div>
      </section>
    </div>
  );
}

function Hero() {
  return (
    <section className="rounded border border-slate-200 bg-white p-5">
      <p className="text-xs font-semibold uppercase text-slate-500">Reliability Read Models</p>
      <div className="mt-2 flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-normal text-slate-950">Advanced Observability, Incident Intelligence & Reliability</h2>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">
            Read-only observability foundation for incident intelligence, event correlation, reliability, service dependencies, metrics, tracing readiness, RCA, and alert categories.
          </p>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
          <CheckCircle2 className="h-4 w-4" />
          No incident mutations
        </span>
      </div>
    </section>
  );
}

function IncidentTimeline({ rows }: { rows: AdminIncidentEvent[] }) {
  return (
    <Panel title="Incident Timeline" icon={Timer}>
      <div className="mb-4 grid gap-3 md:grid-cols-3 xl:grid-cols-5">
        {["Module", "Severity", "Status", "Time", "Environment"].map((filter) => (
          <div key={filter} className="rounded border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500">
            {filter} filter
          </div>
        ))}
      </div>
      <div className="divide-y divide-slate-100 rounded border border-slate-200">
        {rows.length === 0 ? <EmptyState text="No incident source is connected yet. This timeline is intentionally empty instead of fabricating incidents." /> : null}
        {rows.map((row) => (
          <article key={row.id} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-950">{row.title}</p>
                <p className="mt-1 text-xs text-slate-500">{row.module} · {row.service} · {row.environment}</p>
              </div>
              <StatusPill status={row.status === "open" ? "critical" : row.status === "resolved" ? "healthy" : "needs_api"} />
            </div>
            <p className="mt-3 text-sm text-slate-600">{row.detail}</p>
            <DisabledButton label="Acknowledge disabled" />
          </article>
        ))}
      </div>
    </Panel>
  );
}

function EventCorrelations({ rows }: { rows: AdminEventCorrelation[] }) {
  return (
    <Panel title="Event Correlation Center" icon={Workflow}>
      <div className="grid gap-3 md:grid-cols-2">
        {rows.map((row) => (
          <article key={row.id} className="rounded border border-slate-200 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase text-slate-500">{row.sourceModule} to {row.targetModule}</p>
                <p className="mt-1 text-sm font-semibold text-slate-950">{row.relationship}</p>
              </div>
              <StatusPill status={row.status} />
            </div>
            <p className="mt-3 text-xs leading-5 text-slate-500">{row.evidence}</p>
          </article>
        ))}
      </div>
    </Panel>
  );
}

function ReliabilityDashboard({ rows }: { rows: AdminObservabilityMetric[] }) {
  return (
    <Panel title="Reliability Dashboard" icon={Activity}>
      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {rows.map((metric) => <MiniMetric key={metric.id} metric={metric} />)}
      </section>
    </Panel>
  );
}

function DependencyGraph({ rows }: { rows: AdminServiceDependency[] }) {
  return (
    <Panel title="Service Dependency Graph" icon={Network}>
      <div className="grid gap-3 md:grid-cols-2">
        {rows.map((row) => (
          <article key={row.id} className="rounded border border-slate-200 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-950">{row.service}</p>
                <p className="mt-1 text-xs text-slate-500">Depends on: {row.dependsOn.join(", ") || "None"}</p>
              </div>
              <StatusPill status={row.health} />
            </div>
            <p className="mt-3 text-xs leading-5 text-slate-500">{row.detail}</p>
          </article>
        ))}
      </div>
    </Panel>
  );
}

function MetricsFoundation({ rows }: { rows: AdminMetricsInventoryItem[] }) {
  return (
    <Panel title="Metrics Foundation" icon={Radar}>
      <DataTable
        headers={["Metric", "Category", "Status", "Source", "Readiness"]}
        rows={rows.map((row) => [
          row.metric,
          row.category,
          <StatusPill key={`${row.id}-status`} status={row.status} />,
          row.source,
          row.readiness,
        ])}
        emptyText="No metrics inventory returned."
      />
    </Panel>
  );
}

function TracingFoundation({ rows }: { rows: AdminTraceReadinessItem[] }) {
  return (
    <Panel title="Tracing Foundation" icon={GitBranch}>
      <div className="space-y-3">
        {rows.map((row) => (
          <article key={row.id} className="rounded border border-slate-200 p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-950">{row.service}</p>
                <p className="mt-1 text-xs text-slate-500">Propagation: {row.propagation} · Exporter: {row.exporter}</p>
              </div>
              <StatusPill status={row.status} />
            </div>
            <p className="mt-3 text-xs leading-5 text-slate-500">{row.detail}</p>
          </article>
        ))}
      </div>
    </Panel>
  );
}

function RootCauseFoundation({ rows }: { rows: AdminRootCauseReadModel[] }) {
  return (
    <Panel title="Root Cause Analysis Foundation" icon={SearchCheck}>
      {rows.length === 0 ? <EmptyState text="No incidents available for RCA. Future AI RCA remains disabled until real incident and trace sources exist." /> : null}
      {rows.map((row) => (
        <article key={row.id} className="rounded border border-slate-200 p-3">
          <p className="text-sm font-semibold text-slate-950">Incident: {row.incidentId ?? "None"}</p>
          <p className="mt-2 text-xs text-slate-500">Potential cause: {row.potentialCause}</p>
          <p className="text-xs text-slate-500">Evidence: {row.evidence}</p>
          <DisabledButton label="AI RCA disabled" />
        </article>
      ))}
    </Panel>
  );
}

function AlertIntelligence({ rows }: { rows: AdminAlertCategory[] }) {
  return (
    <Panel title="Alert Intelligence" icon={BellRing}>
      <div className="space-y-3">
        {rows.map((row) => (
          <article key={row.id} className="rounded border border-slate-200 p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold capitalize text-slate-950">{row.category}</p>
                <p className="mt-1 text-xs text-slate-500">{row.count} alerts · routing {row.routing}</p>
              </div>
              <StatusPill status={row.status} />
            </div>
            <p className="mt-3 text-xs leading-5 text-slate-500">{row.detail}</p>
          </article>
        ))}
      </div>
    </Panel>
  );
}

function FutureReadiness() {
  const rows = ["OpenTelemetry", "Prometheus", "Grafana", "Jaeger", "AI Incident Analysis", "Predictive Reliability", "Autonomous RCA", "AI Observability", "Agentic AI", "Multi-agent orchestration"];
  return (
    <Panel title="Future Observability Readiness" icon={ServerCog}>
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

function MetricCard({ metric }: { metric: AdminObservabilityMetric }) {
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

function MiniMetric({ metric }: { metric: AdminObservabilityMetric }) {
  return (
    <article className="rounded border border-slate-200 p-3">
      <p className="text-xs font-semibold uppercase text-slate-500">{metric.label}</p>
      <p className="mt-2 text-lg font-semibold text-slate-950">{metric.value}</p>
      <p className="mt-2 text-xs text-slate-500">{metric.detail}</p>
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

function StatusPill({ status }: { status: AdminObservabilityStatus }) {
  return <span className={`inline-flex rounded px-2 py-1 text-xs font-semibold ${statusClass(status)}`}>{status.replace(/_/g, " ")}</span>;
}

function DisabledButton({ label }: { label: string }) {
  return <button type="button" disabled className="mt-3 h-8 rounded border border-slate-200 bg-slate-50 px-2 text-xs font-semibold text-slate-400">{label}</button>;
}

function EmptyState({ text }: { text: string }) {
  return <div className="rounded border border-slate-200 bg-slate-50 p-4 text-center text-sm text-slate-500">{text}</div>;
}

function Notice({ tone, text }: { tone: "danger" | "neutral"; text: string }) {
  const className = tone === "danger" ? "border-red-200 bg-red-50 text-red-700" : "border-slate-200 bg-white text-slate-600";
  return <div className={`rounded border px-4 py-3 text-sm ${className}`}>{text}</div>;
}

function statusClass(status: AdminObservabilityStatus) {
  if (status === "healthy") return "bg-emerald-50 text-emerald-700";
  if (status === "watch") return "bg-amber-50 text-amber-700";
  if (status === "critical") return "bg-red-50 text-red-700";
  if (status === "disabled") return "bg-slate-100 text-slate-600";
  return "bg-blue-50 text-blue-700";
}

function statusIconClass(status: AdminObservabilityStatus) {
  if (status === "healthy") return "bg-emerald-50 text-emerald-700";
  if (status === "watch") return "bg-amber-50 text-amber-700";
  if (status === "critical") return "bg-red-50 text-red-700";
  if (status === "disabled") return "bg-slate-100 text-slate-600";
  return "bg-blue-50 text-blue-700";
}
