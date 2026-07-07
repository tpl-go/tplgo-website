"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  Clock,
  Cpu,
  Gauge,
  Lightbulb,
  ServerCog,
  ShieldCheck,
  Sparkles,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import {
  getAdminAiOpsDashboard,
  type AdminAiOpsDashboard,
  type AdminAiOpsIntelligenceItem,
  type AdminAiOpsMetric,
  type AdminAiOpsStatus,
  type AdminAiProviderStatus,
  type AdminAiRecommendation,
  type AdminApiError,
  type AdminAutomationWorkflow,
  type AdminIncidentEvent,
  type AdminSlaItem,
} from "../../lib/admin/adminApiClient";

type LoadState =
  | { status: "loading"; data: AdminAiOpsDashboard; error: null }
  | { status: "ready"; data: AdminAiOpsDashboard; error: null }
  | { status: "error"; data: AdminAiOpsDashboard; error: AdminApiError };

const emptyDashboard: AdminAiOpsDashboard = {
  metrics: [],
  intelligence: [],
  reliability: [],
  incidents: [],
  sla: [],
  recommendations: [],
  automation: [],
  providers: [],
};

export function AdminAiOperationsCenter() {
  const [state, setState] = useState<LoadState>({ status: "loading", data: emptyDashboard, error: null });

  useEffect(() => {
    let active = true;
    void getAdminAiOpsDashboard().then((result) => {
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
      {state.status === "loading" ? <Notice tone="neutral" text="Loading AI operations read model from the admin API." /> : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-6">
        {data.metrics.map((metric) => <MetricCard key={metric.id} metric={metric} />)}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_27rem]">
        <div className="space-y-4">
          <OperationsAssistant rows={data.intelligence} />
          <ReliabilityCenter rows={data.reliability} />
          <IncidentTimeline rows={data.incidents} />
          <SlaCenter rows={data.sla} />
        </div>
        <div className="space-y-4">
          <Recommendations rows={data.recommendations} />
          <AutomationCenter rows={data.automation} />
          <ProviderStatus rows={data.providers} />
          <FutureReadiness />
        </div>
      </section>
    </div>
  );
}

function Hero() {
  return (
    <section className="rounded border border-slate-200 bg-white p-5">
      <p className="text-xs font-semibold uppercase text-slate-500">AI Operations</p>
      <div className="mt-2 flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-normal text-slate-950">AI Operations, Reliability & Automation Command Center</h2>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">
            Read-only operational intelligence foundation for AI health, reliability posture, SLA visibility, recommendations, automation inventory, and future agentic operations.
          </p>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
          <ShieldCheck className="h-4 w-4" />
          No AI auto-actions
        </span>
      </div>
    </section>
  );
}

function OperationsAssistant({ rows }: { rows: AdminAiOpsIntelligenceItem[] }) {
  return (
    <Panel title="AI Operations Assistant" icon={Sparkles}>
      <div className="grid gap-3 md:grid-cols-2">
        {rows.length === 0 ? <EmptyState text="No intelligence modules returned." /> : null}
        {rows.map((row) => (
          <article key={row.id} className="rounded border border-slate-200 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase text-slate-500">{row.module}</p>
                <h3 className="mt-1 text-sm font-semibold text-slate-950">{row.title}</h3>
              </div>
              <StatusPill status={row.status} />
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">{row.insight}</p>
            <p className="mt-3 text-xs font-semibold text-slate-400">Source: {row.source.replace(/_/g, " ")}</p>
          </article>
        ))}
      </div>
    </Panel>
  );
}

function ReliabilityCenter({ rows }: { rows: AdminAiOpsMetric[] }) {
  return (
    <Panel title="Reliability Command Center" icon={Gauge}>
      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        {rows.length === 0 ? <EmptyState text="No reliability metrics returned." /> : null}
        {rows.map((metric) => <MiniMetric key={metric.id} metric={metric} />)}
      </section>
    </Panel>
  );
}

function IncidentTimeline({ rows }: { rows: AdminIncidentEvent[] }) {
  return (
    <Panel title="Incident Timeline" icon={Clock}>
      <div className="mb-4 grid gap-3 md:grid-cols-3 xl:grid-cols-6">
        {["Module", "Severity", "Status", "Date", "Service", "Environment"].map((filter) => (
          <div key={filter} className="rounded border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500">
            {filter} filter
          </div>
        ))}
      </div>
      <div className="divide-y divide-slate-100 rounded border border-slate-200">
        {rows.length === 0 ? <EmptyState text="No incident source API is connected yet. The timeline is intentionally empty instead of showing fake incidents." /> : null}
        {rows.map((row) => (
          <div key={row.id} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-950">{row.title}</p>
                <p className="mt-1 text-xs text-slate-500">{row.module} · {row.service} · {row.environment}</p>
              </div>
              <StatusPill status={row.status === "open" ? "critical" : row.status === "monitoring" ? "watch" : row.status === "resolved" ? "healthy" : "needs_api"} />
            </div>
            <p className="mt-3 text-sm text-slate-600">{row.detail}</p>
            <DisabledButton label="Acknowledge disabled" />
          </div>
        ))}
      </div>
    </Panel>
  );
}

function SlaCenter({ rows }: { rows: AdminSlaItem[] }) {
  return (
    <Panel title="SLA Center" icon={AlertTriangle}>
      <DataTable
        headers={["SLA", "Module", "Target", "Current", "Breaches", "Escalation"]}
        rows={rows.map((row) => [
          <div key={`${row.id}-sla`}>
            <p className="font-semibold text-slate-950">{row.name}</p>
            <StatusPill status={row.status} />
          </div>,
          row.module,
          row.target,
          row.current,
          row.potentialBreaches,
          <DisabledButton key={`${row.id}-escalate`} label="Escalate disabled" />,
        ])}
        emptyText="No SLA rows returned."
      />
    </Panel>
  );
}

function Recommendations({ rows }: { rows: AdminAiRecommendation[] }) {
  return (
    <Panel title="AI Recommendations" icon={Lightbulb}>
      <div className="space-y-3">
        {rows.length === 0 ? <EmptyState text="No recommendations returned." /> : null}
        {rows.map((row) => (
          <article key={row.id} className="rounded border border-slate-200 p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-950">{row.title}</p>
                <p className="mt-1 text-xs text-slate-500">{row.module} · {row.priority} priority</p>
              </div>
              <StatusPill status={row.status} />
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">{row.recommendation}</p>
            <DisabledButton label="Execute disabled" />
          </article>
        ))}
      </div>
    </Panel>
  );
}

function AutomationCenter({ rows }: { rows: AdminAutomationWorkflow[] }) {
  return (
    <Panel title="Automation Center" icon={Workflow}>
      <DataTable
        headers={["Workflow", "Module", "Status", "Trigger", "Future Action"]}
        rows={rows.map((row) => [
          row.workflow,
          row.module,
          row.status,
          row.trigger,
          <DisabledButton key={`${row.id}-edit`} label="Edit disabled" />,
        ])}
        emptyText="No automation inventory returned."
      />
    </Panel>
  );
}

function ProviderStatus({ rows }: { rows: AdminAiProviderStatus[] }) {
  return (
    <Panel title="AI Provider Status" icon={Cpu}>
      <div className="space-y-3">
        {rows.length === 0 ? <EmptyState text="No AI provider rows returned." /> : null}
        {rows.map((row) => (
          <div key={row.id} className="flex items-start justify-between gap-3 rounded border border-slate-200 p-3">
            <div>
              <p className="text-sm font-semibold text-slate-950">{row.label}</p>
              <p className="mt-1 text-xs text-slate-500">{row.provider} · {row.version} · {row.configuration}</p>
            </div>
            <StatusPill status={row.health} />
          </div>
        ))}
      </div>
    </Panel>
  );
}

function FutureReadiness() {
  const rows = [
    "Agentic AI",
    "MCP integration",
    "Multi-agent orchestration",
    "Predictive analytics",
    "Root Cause Analysis",
    "Autonomous recommendations",
    "Workflow automation",
    "Reliability Engineering",
    "Incident Intelligence",
    "TPL Creators",
    "TPL Marketplace",
    "TPL Local Life",
  ];
  return (
    <Panel title="Future AI Readiness" icon={ServerCog}>
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

function MetricCard({ metric }: { metric: AdminAiOpsMetric }) {
  const Icon = metric.status === "healthy" ? CheckCircle2 : metric.status === "disabled" ? Bot : AlertTriangle;
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

function MiniMetric({ metric }: { metric: AdminAiOpsMetric }) {
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

function StatusPill({ status }: { status: AdminAiOpsStatus }) {
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

function statusClass(status: AdminAiOpsStatus) {
  if (status === "healthy") return "bg-emerald-50 text-emerald-700";
  if (status === "watch") return "bg-amber-50 text-amber-700";
  if (status === "critical") return "bg-red-50 text-red-700";
  if (status === "disabled") return "bg-slate-100 text-slate-600";
  return "bg-blue-50 text-blue-700";
}

function statusIconClass(status: AdminAiOpsStatus) {
  if (status === "healthy") return "bg-emerald-50 text-emerald-700";
  if (status === "watch") return "bg-amber-50 text-amber-700";
  if (status === "critical") return "bg-red-50 text-red-700";
  if (status === "disabled") return "bg-slate-100 text-slate-600";
  return "bg-blue-50 text-blue-700";
}
