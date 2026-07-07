"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  AlertTriangle,
  BellRing,
  CheckCircle2,
  Clock,
  Mail,
  MessageSquare,
  RadioTower,
  Route,
  ShieldCheck,
  Smartphone,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import {
  getAdminNotificationCenter,
  type AdminAlertRoutingRule,
  type AdminApiError,
  type AdminCommunicationEvent,
  type AdminEscalationPolicy,
  type AdminNotificationCenterDashboard,
  type AdminNotificationChannelHealth,
  type AdminNotificationMetric,
  type AdminNotificationStatus,
  type AdminNotificationTemplateView,
} from "../../lib/admin/adminApiClient";

type LoadState =
  | { status: "loading"; data: AdminNotificationCenterDashboard; error: null }
  | { status: "ready"; data: AdminNotificationCenterDashboard; error: null }
  | { status: "error"; data: AdminNotificationCenterDashboard; error: AdminApiError };

const emptyDashboard: AdminNotificationCenterDashboard = {
  metrics: [],
  routingRules: [],
  escalationPolicies: [],
  timeline: [],
  channelHealth: [],
  alertIntelligence: [],
  templates: [],
};

export function AdminNotificationCenter() {
  const [state, setState] = useState<LoadState>({ status: "loading", data: emptyDashboard, error: null });

  useEffect(() => {
    let active = true;
    void getAdminNotificationCenter({ limit: 100, offset: 0 }).then((result) => {
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
      {state.status === "loading" ? <Notice tone="neutral" text="Loading notification and alert routing read models from the admin API." /> : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-8">
        {data.metrics.map((metric) => <MetricCard key={metric.id} metric={metric} />)}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_27rem]">
        <div className="space-y-4">
          <AlertRouting rows={data.routingRules} />
          <EscalationPolicies rows={data.escalationPolicies} />
          <NotificationTimeline rows={data.timeline} />
          <TemplateLibrary rows={data.templates} />
        </div>
        <div className="space-y-4">
          <ChannelMonitoring rows={data.channelHealth} />
          <AlertIntelligence rows={data.alertIntelligence} />
          <FutureReadiness />
        </div>
      </section>
    </div>
  );
}

function Hero() {
  return (
    <section className="rounded border border-slate-200 bg-white p-5">
      <p className="text-xs font-semibold uppercase text-slate-500">Notification Operations</p>
      <div className="mt-2 flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-normal text-slate-950">Enterprise Notification, Alert Routing & Escalation Center</h2>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">
            Read-only visibility for notification health, alert routing, escalation policies, delivery timeline, channel monitoring, alert intelligence, and template inventory.
          </p>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
          <ShieldCheck className="h-4 w-4" />
          No sending or escalation execution
        </span>
      </div>
    </section>
  );
}

function AlertRouting({ rows }: { rows: AdminAlertRoutingRule[] }) {
  return (
    <Panel title="Alert Routing Center" icon={Route}>
      <DataTable
        headers={["Module", "Priority", "Channels", "Target Team", "Status", "Edit"]}
        rows={rows.map((row) => [
          row.module,
          row.priority,
          row.channels.join(", "),
          row.targetTeam,
          <StatusPill key={`${row.id}-status`} status={row.status} />,
          <DisabledButton key={`${row.id}-edit`} label="Edit disabled" />,
        ])}
        emptyText="No routing rules returned."
      />
    </Panel>
  );
}

function EscalationPolicies({ rows }: { rows: AdminEscalationPolicy[] }) {
  return (
    <Panel title="Escalation Policy Center" icon={Workflow}>
      <DataTable
        headers={["Policy", "Priority", "Target Team", "Level", "SLA", "Edit"]}
        rows={rows.map((row) => [
          row.policy,
          row.priority,
          row.targetTeam,
          row.escalationLevel,
          row.sla,
          <DisabledButton key={`${row.id}-edit`} label="Edit disabled" />,
        ])}
        emptyText="No escalation policies returned."
      />
    </Panel>
  );
}

function NotificationTimeline({ rows }: { rows: AdminCommunicationEvent[] }) {
  return (
    <Panel title="Notification Timeline" icon={Clock}>
      <div className="mb-4 grid gap-3 md:grid-cols-4 xl:grid-cols-7">
        {["Channel", "Severity", "Module", "Status", "Reference", "Time", "Recipient"].map((filter) => (
          <div key={filter} className="rounded border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500">
            {filter}
          </div>
        ))}
      </div>
      <div className="divide-y divide-slate-100 rounded border border-slate-200">
        {rows.length === 0 ? <EmptyState text="No notification events returned from existing read-only sources." /> : null}
        {rows.map((row) => (
          <article key={row.id} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-950">{row.eventType}</p>
                <p className="mt-1 text-xs text-slate-500">{row.module} · {row.channel} · {row.recipient ?? "recipient pending"}</p>
              </div>
              <StatusPill status={mapEventStatus(row.status, row.priority)} />
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">{row.message}</p>
            <p className="mt-2 text-xs text-slate-400">{row.reference ?? row.id} · {row.timestamp ?? "time pending"}</p>
          </article>
        ))}
      </div>
    </Panel>
  );
}

function ChannelMonitoring({ rows }: { rows: AdminNotificationChannelHealth[] }) {
  const iconByChannel: Record<AdminNotificationChannelHealth["channel"], LucideIcon> = {
    email: Mail,
    sms: MessageSquare,
    whatsapp: MessageSquare,
    push: Smartphone,
    "in-app": BellRing,
    webhook: RadioTower,
  };
  return (
    <Panel title="Channel Monitoring" icon={RadioTower}>
      <div className="space-y-3">
        {rows.map((row) => {
          const Icon = iconByChannel[row.channel];
          return (
            <article key={row.id} className="rounded border border-slate-200 p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded bg-slate-100 text-slate-600">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold capitalize text-slate-950">{row.channel}</p>
                    <p className="mt-1 text-xs text-slate-500">{row.provider} · {row.status}</p>
                  </div>
                </div>
                <StatusPill status={row.health} />
              </div>
              <p className="mt-3 text-xs leading-5 text-slate-500">{row.detail}</p>
            </article>
          );
        })}
      </div>
    </Panel>
  );
}

function AlertIntelligence({ rows }: { rows: AdminNotificationMetric[] }) {
  return (
    <Panel title="Alert Intelligence" icon={AlertTriangle}>
      <div className="space-y-3">
        {rows.map((row) => <MiniMetric key={row.id} metric={row} />)}
      </div>
    </Panel>
  );
}

function TemplateLibrary({ rows }: { rows: AdminNotificationTemplateView[] }) {
  return (
    <Panel title="Notification Templates" icon={Mail}>
      <DataTable
        headers={["Template", "Type", "Version", "Usage", "Status", "Edit"]}
        rows={rows.map((row) => [
          row.name,
          row.type,
          row.version,
          row.usageCount,
          row.status,
          <DisabledButton key={`${row.id}-edit`} label="Edit disabled" />,
        ])}
        emptyText="No notification templates returned."
      />
    </Panel>
  );
}

function FutureReadiness() {
  const rows = ["Intelligent Alert Routing", "AI Notification Prioritization", "AI Escalation Suggestions", "Incident Communication", "Executive Alerting", "On-call Operations", "Creator Notifications", "TPL Marketplace Notifications", "Local Life Notifications"];
  return (
    <Panel title="Future Notification Readiness" icon={BellRing}>
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

function MetricCard({ metric }: { metric: AdminNotificationMetric }) {
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

function MiniMetric({ metric }: { metric: AdminNotificationMetric }) {
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

function StatusPill({ status }: { status: AdminNotificationStatus }) {
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

function mapEventStatus(status: AdminCommunicationEvent["status"], priority: AdminCommunicationEvent["priority"]): AdminNotificationStatus {
  if (status === "successful") return "healthy";
  if (status === "failed") return "critical";
  if (priority === "critical") return "critical";
  if (status === "pending" || status === "suppressed") return "watch";
  return "needs_api";
}

function statusClass(status: AdminNotificationStatus) {
  if (status === "healthy") return "bg-emerald-50 text-emerald-700";
  if (status === "watch") return "bg-amber-50 text-amber-700";
  if (status === "critical") return "bg-red-50 text-red-700";
  if (status === "disabled") return "bg-slate-100 text-slate-600";
  return "bg-blue-50 text-blue-700";
}

function statusIconClass(status: AdminNotificationStatus) {
  if (status === "healthy") return "bg-emerald-50 text-emerald-700";
  if (status === "watch") return "bg-amber-50 text-amber-700";
  if (status === "critical") return "bg-red-50 text-red-700";
  if (status === "disabled") return "bg-slate-100 text-slate-600";
  return "bg-blue-50 text-blue-700";
}
