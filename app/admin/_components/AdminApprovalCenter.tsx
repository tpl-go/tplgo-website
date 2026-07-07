"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardCheck,
  FileSearch,
  GitBranch,
  Scale,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import {
  getAdminApprovalCenter,
  type AdminApiError,
  type AdminApprovalCenterDashboard,
  type AdminApprovalChain,
  type AdminApprovalMetric,
  type AdminApprovalPriority,
  type AdminApprovalStatus,
  type AdminComplianceWorkflow,
  type AdminGovernanceReview,
  type AdminReviewQueueItem,
} from "../../lib/admin/adminApiClient";

type LoadState =
  | { status: "loading"; data: AdminApprovalCenterDashboard; error: null }
  | { status: "ready"; data: AdminApprovalCenterDashboard; error: null }
  | { status: "error"; data: AdminApprovalCenterDashboard; error: AdminApiError };

const emptyDashboard: AdminApprovalCenterDashboard = {
  metrics: [],
  approvalChains: [],
  governanceReviews: [],
  reviewQueue: [],
  complianceWorkflows: [],
};

export function AdminApprovalCenter() {
  const [state, setState] = useState<LoadState>({ status: "loading", data: emptyDashboard, error: null });

  useEffect(() => {
    let active = true;
    void getAdminApprovalCenter().then((result) => {
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
      {state.status === "loading" ? <Notice tone="neutral" text="Loading approval, governance, review, and compliance read models from the admin API." /> : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5 2xl:grid-cols-11">
        {data.metrics.map((metric) => <MetricCard key={metric.id} metric={metric} />)}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_28rem]">
        <div className="space-y-4">
          <ApprovalChains rows={data.approvalChains} />
          <ReviewQueue rows={data.reviewQueue} />
          <ComplianceWorkflows rows={data.complianceWorkflows} />
        </div>
        <div className="space-y-4">
          <GovernanceReviews rows={data.governanceReviews} />
          <FutureGovernance />
        </div>
      </section>
    </div>
  );
}

function Hero() {
  return (
    <section className="rounded border border-slate-200 bg-white p-5">
      <p className="text-xs font-semibold uppercase text-slate-500">Governance Operations</p>
      <div className="mt-2 flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-normal text-slate-950">Enterprise Approval, Compliance Workflow & Governance Review Center</h2>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">
            Read-only approval and compliance visibility for approval chains, finance gates, security gates, content gates, review queues, controls, evidence placeholders, and future ecosystem governance.
          </p>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
          <ShieldCheck className="h-4 w-4" />
          No approve, reject, workflow, or permission mutations
        </span>
      </div>
    </section>
  );
}

function ApprovalChains({ rows }: { rows: AdminApprovalChain[] }) {
  return (
    <Panel title="Approval Chain Inventory" icon={GitBranch}>
      <DataTable
        headers={["Module", "Trigger", "Review Level", "Required Role", "SLA", "Status", "Edit"]}
        rows={rows.map((row) => [
          row.module,
          row.trigger,
          row.reviewLevel,
          row.requiredRole,
          row.sla,
          <StatusPill key={`${row.id}-status`} status={row.status} />,
          <DisabledButton key={`${row.id}-edit`} label="Edit disabled" />,
        ])}
        emptyText="No approval chains returned."
      />
    </Panel>
  );
}

function ReviewQueue({ rows }: { rows: AdminReviewQueueItem[] }) {
  return (
    <Panel title="Review Queue" icon={ClipboardCheck}>
      <DataTable
        headers={["Item", "Module", "Priority", "Owner / Team", "Stage", "Risk", "Created", "SLA", "Actions"]}
        rows={rows.map((row) => [
          row.item,
          row.module,
          <PriorityPill key={`${row.id}-priority`} priority={row.priority} />,
          row.ownerTeam,
          row.stage.replace(/_/g, " "),
          row.risk,
          row.createdAt,
          row.sla,
          <div key={`${row.id}-actions`} className="flex gap-2">
            <DisabledButton label="Approve disabled" />
            <DisabledButton label="Reject disabled" />
          </div>,
        ])}
        emptyText="No review queue items returned."
      />
    </Panel>
  );
}

function ComplianceWorkflows({ rows }: { rows: AdminComplianceWorkflow[] }) {
  return (
    <Panel title="Compliance Workflow Visibility" icon={FileSearch}>
      <DataTable
        headers={["Policy", "Control", "Evidence", "Audit Link", "Status"]}
        rows={rows.map((row) => [
          row.policy,
          row.control,
          row.evidence,
          row.auditLink,
          <StatusPill key={`${row.id}-status`} status={row.status} />,
        ])}
        emptyText="No compliance workflow visibility returned."
      />
    </Panel>
  );
}

function GovernanceReviews({ rows }: { rows: AdminGovernanceReview[] }) {
  return (
    <Panel title="Governance Review Center" icon={Scale}>
      <div className="space-y-3">
        {rows.map((row) => (
          <article key={row.id} className="rounded border border-slate-200 p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-950">{row.gate}</p>
                <p className="mt-1 text-xs text-slate-500">{row.module} · {row.ownerTeam}</p>
              </div>
              <StatusPill status={row.status} />
            </div>
            <p className="mt-3 text-xs leading-5 text-slate-500">{row.detail}</p>
            <div className="mt-3 flex items-center justify-between gap-2">
              <PriorityPill priority={row.risk} />
              <span className="text-xs font-semibold text-slate-400">Review only</span>
            </div>
          </article>
        ))}
      </div>
    </Panel>
  );
}

function FutureGovernance() {
  const rows = ["Approval Chains", "SOP Approval Visibility", "Finance Review Gates", "Security Review Gates", "Content Publishing Gates", "Supplier Onboarding Gates", "AI Recommendation Review", "Creator Approvals", "Vendor Approvals", "Local Life Approvals"];
  return (
    <Panel title="Future Governance Readiness" icon={AlertTriangle}>
      <div className="grid gap-2">
        {rows.map((row) => (
          <div key={row} className="flex items-center justify-between rounded border border-slate-200 px-3 py-2 text-sm">
            <span className="font-medium text-slate-700">{row}</span>
            <span className="text-xs font-semibold text-slate-400">Read only</span>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function MetricCard({ metric }: { metric: AdminApprovalMetric }) {
  return (
    <article className="rounded border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase text-slate-500">{metric.label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-normal text-slate-950">{metric.value}</p>
        </div>
        <span className="flex h-9 w-9 items-center justify-center rounded bg-emerald-50 text-emerald-700">
          <CheckCircle2 className="h-4 w-4" />
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

function StatusPill({ status }: { status: AdminApprovalStatus }) {
  return <span className={`inline-flex rounded px-2 py-1 text-xs font-semibold ${statusClass(status)}`}>{status.replace(/_/g, " ")}</span>;
}

function PriorityPill({ priority }: { priority: AdminApprovalPriority }) {
  return <span className={`inline-flex rounded px-2 py-1 text-xs font-semibold ${priorityClass(priority)}`}>{priority}</span>;
}

function DisabledButton({ label }: { label: string }) {
  return <button type="button" disabled className="h-8 rounded border border-slate-200 bg-slate-50 px-2 text-xs font-semibold text-slate-400">{label}</button>;
}

function Notice({ tone, text }: { tone: "danger" | "neutral"; text: string }) {
  const className = tone === "danger" ? "border-red-200 bg-red-50 text-red-700" : "border-slate-200 bg-white text-slate-600";
  return <div className={`rounded border px-4 py-3 text-sm ${className}`}>{text}</div>;
}

function statusClass(status: AdminApprovalStatus) {
  if (status === "active") return "bg-emerald-50 text-emerald-700";
  if (status === "pending" || status === "watch") return "bg-amber-50 text-amber-700";
  if (status === "blocked") return "bg-red-50 text-red-700";
  if (status === "planned") return "bg-slate-100 text-slate-600";
  return "bg-blue-50 text-blue-700";
}

function priorityClass(priority: AdminApprovalPriority) {
  if (priority === "critical") return "bg-red-50 text-red-700";
  if (priority === "high") return "bg-amber-50 text-amber-700";
  if (priority === "normal") return "bg-blue-50 text-blue-700";
  return "bg-slate-100 text-slate-600";
}
