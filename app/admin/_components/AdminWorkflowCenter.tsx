"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  Gauge,
  GitBranch,
  Inbox,
  ListChecks,
  ShieldCheck,
  Users,
  type LucideIcon,
} from "lucide-react";
import {
  getAdminWorkflowCenter,
  type AdminApiError,
  type AdminEscalationQueueItem,
  type AdminOperationsQueue,
  type AdminOwnershipItem,
  type AdminTaskReadModel,
  type AdminWorkflowCenterDashboard,
  type AdminWorkflowMetric,
  type AdminWorkflowStateItem,
  type AdminWorkflowStatus,
} from "../../lib/admin/adminApiClient";

type LoadState =
  | { status: "loading"; data: AdminWorkflowCenterDashboard; error: null }
  | { status: "ready"; data: AdminWorkflowCenterDashboard; error: null }
  | { status: "error"; data: AdminWorkflowCenterDashboard; error: AdminApiError };

const emptyDashboard: AdminWorkflowCenterDashboard = {
  metrics: [],
  queues: [],
  tasks: [],
  workflowStates: [],
  ownership: [],
  escalationQueue: [],
  analytics: [],
};

export function AdminWorkflowCenter() {
  const [state, setState] = useState<LoadState>({ status: "loading", data: emptyDashboard, error: null });

  useEffect(() => {
    let active = true;
    void getAdminWorkflowCenter().then((result) => {
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
      {state.status === "loading" ? <Notice tone="neutral" text="Loading workflow and operations queue read models from the admin API." /> : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5 2xl:grid-cols-10">
        {data.metrics.map((metric) => <MetricCard key={metric.id} metric={metric} />)}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_27rem]">
        <div className="space-y-4">
          <OperationsQueues rows={data.queues} />
          <TaskIntelligence rows={data.tasks} />
          <WorkflowStates rows={data.workflowStates} />
          <OwnershipCenter rows={data.ownership} />
        </div>
        <div className="space-y-4">
          <EscalationQueue rows={data.escalationQueue} />
          <WorkflowAnalytics rows={data.analytics} />
          <FutureReadiness />
        </div>
      </section>
    </div>
  );
}

function Hero() {
  return (
    <section className="rounded border border-slate-200 bg-white p-5">
      <p className="text-xs font-semibold uppercase text-slate-500">Workflow Operations</p>
      <div className="mt-2 flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-normal text-slate-950">Enterprise Workflow, Tasking & Operations Queue Center</h2>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">
            Read-only workflow foundation for operations queues, task intelligence, workflow states, ownership, escalation queues, and workload analytics.
          </p>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
          <ShieldCheck className="h-4 w-4" />
          No task or workflow mutations
        </span>
      </div>
    </section>
  );
}

function OperationsQueues({ rows }: { rows: AdminOperationsQueue[] }) {
  return (
    <Panel title="Operations Queue" icon={Inbox}>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {rows.map((row) => (
          <article key={row.id} className="rounded border border-slate-200 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-950">{row.queue}</p>
                <p className="mt-1 text-xs text-slate-500">{row.module} · {row.ownerTeam}</p>
              </div>
              <StatusPill status={row.status} />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-slate-500">
              <span>Open: {row.openTasks}</span>
              <span>SLA: {row.slaWatch}</span>
            </div>
            <DisabledButton label="Queue action disabled" />
          </article>
        ))}
      </div>
    </Panel>
  );
}

function TaskIntelligence({ rows }: { rows: AdminTaskReadModel[] }) {
  return (
    <Panel title="Task Intelligence" icon={ClipboardList}>
      <DataTable
        headers={["Task ID", "Module", "Priority", "Owner", "Status", "Queue", "SLA", "Edit"]}
        rows={rows.map((row) => [
          row.taskId,
          row.module,
          row.priority,
          row.owner,
          row.status,
          row.queue,
          row.sla,
          <DisabledButton key={`${row.id}-edit`} label="Edit disabled" />,
        ])}
        emptyText="No task source is connected yet. Task creation, assignment, and status changes are intentionally unavailable."
      />
    </Panel>
  );
}

function WorkflowStates({ rows }: { rows: AdminWorkflowStateItem[] }) {
  return (
    <Panel title="Workflow State Inventory" icon={GitBranch}>
      <DataTable
        headers={["Workflow", "State", "Trigger", "Dependencies", "Module", "Edit"]}
        rows={rows.map((row) => [
          row.workflow,
          row.state,
          row.trigger,
          row.dependencies.join(", "),
          row.module,
          <DisabledButton key={`${row.id}-edit`} label="Edit disabled" />,
        ])}
        emptyText="No workflow state inventory returned."
      />
    </Panel>
  );
}

function OwnershipCenter({ rows }: { rows: AdminOwnershipItem[] }) {
  return (
    <Panel title="Ownership Center" icon={Users}>
      <DataTable
        headers={["Owner", "Team", "Role", "Queue", "Capacity", "Load", "Assignment"]}
        rows={rows.map((row) => [
          row.owner,
          row.team,
          row.role,
          row.queue,
          row.capacity,
          row.load,
          <DisabledButton key={`${row.id}-assign`} label="Assign disabled" />,
        ])}
        emptyText="No ownership inventory returned."
      />
    </Panel>
  );
}

function EscalationQueue({ rows }: { rows: AdminEscalationQueueItem[] }) {
  return (
    <Panel title="Escalation Queue" icon={AlertTriangle}>
      <div className="space-y-3">
        {rows.map((row) => (
          <article key={row.id} className="rounded border border-slate-200 p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold capitalize text-slate-950">{row.category.replace(/_/g, " ")}</p>
                <p className="mt-1 text-lg font-semibold text-slate-950">{row.count}</p>
              </div>
              <StatusPill status={row.status} />
            </div>
            <DisabledButton label="Escalation disabled" />
          </article>
        ))}
      </div>
    </Panel>
  );
}

function WorkflowAnalytics({ rows }: { rows: AdminWorkflowMetric[] }) {
  return (
    <Panel title="Workflow Analytics" icon={Gauge}>
      <div className="space-y-3">
        {rows.map((row) => <MiniMetric key={row.id} metric={row} />)}
      </div>
    </Panel>
  );
}

function FutureReadiness() {
  const rows = ["Human Task Management", "Workflow Engine", "Cross-module Operations", "AI Task Routing", "Smart Assignment", "Enterprise BPM", "Multi-team Collaboration", "Creators", "TPL Marketplace", "Local Life"];
  return (
    <Panel title="Future Workflow Readiness" icon={ListChecks}>
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

function MetricCard({ metric }: { metric: AdminWorkflowMetric }) {
  const Icon = metric.status === "healthy" || metric.status === "completed" ? CheckCircle2 : AlertTriangle;
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

function MiniMetric({ metric }: { metric: AdminWorkflowMetric }) {
  return (
    <article className="rounded border border-slate-200 p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-950">{metric.label}</p>
          <p className="mt-1 text-xs text-slate-500">{metric.detail}</p>
        </div>
        <StatusPill status={metric.status} />
      </div>
      <p className="mt-3 text-lg font-semibold text-slate-950">{metric.value}</p>
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

function StatusPill({ status }: { status: AdminWorkflowStatus }) {
  return <span className={`inline-flex rounded px-2 py-1 text-xs font-semibold ${statusClass(status)}`}>{status.replace(/_/g, " ")}</span>;
}

function DisabledButton({ label }: { label: string }) {
  return <button type="button" disabled className="mt-3 h-8 rounded border border-slate-200 bg-slate-50 px-2 text-xs font-semibold text-slate-400">{label}</button>;
}

function Notice({ tone, text }: { tone: "danger" | "neutral"; text: string }) {
  const className = tone === "danger" ? "border-red-200 bg-red-50 text-red-700" : "border-slate-200 bg-white text-slate-600";
  return <div className={`rounded border px-4 py-3 text-sm ${className}`}>{text}</div>;
}

function statusClass(status: AdminWorkflowStatus) {
  if (status === "healthy" || status === "completed") return "bg-emerald-50 text-emerald-700";
  if (status === "watch") return "bg-amber-50 text-amber-700";
  if (status === "blocked") return "bg-red-50 text-red-700";
  if (status === "disabled") return "bg-slate-100 text-slate-600";
  return "bg-blue-50 text-blue-700";
}

function statusIconClass(status: AdminWorkflowStatus) {
  if (status === "healthy" || status === "completed") return "bg-emerald-50 text-emerald-700";
  if (status === "watch") return "bg-amber-50 text-amber-700";
  if (status === "blocked") return "bg-red-50 text-red-700";
  if (status === "disabled") return "bg-slate-100 text-slate-600";
  return "bg-blue-50 text-blue-700";
}
