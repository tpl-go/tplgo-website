"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  CircleDot,
  FileClock,
  Fingerprint,
  Lock,
  Monitor,
  ShieldAlert,
  ShieldCheck,
  SlidersHorizontal,
  UserCog,
  type LucideIcon,
} from "lucide-react";
import {
  getAdminSecurityAuditIntelligence,
  getAdminSecurityOverview,
  getAdminSecurityRbac,
  type AdminApiError,
  type AdminSecurityAuditEvent,
  type AdminSecurityAuditIntelligence,
  type AdminSecurityMetric,
  type AdminSecurityOverview,
  type AdminSecurityRbac,
  type AdminSecurityRbacRole,
} from "../../lib/admin/adminApiClient";

type LoadState<T> =
  | { status: "loading"; data: T; error: null }
  | { status: "ready"; data: T; error: null }
  | { status: "error"; data: T; error: AdminApiError };

type FilterState = {
  search: string;
  module: string;
  severity: string;
  actor: string;
};

const emptyOverview: AdminSecurityOverview = {
  metrics: [],
  posture: {
    activeSessions: 0,
    revokedSessions: 0,
    mfaEnabled: false,
    mfaBackupCodesCount: 0,
    ssoEnabled: false,
    ssoProviders: [],
    recommendations: [],
  },
  riskAlerts: [],
  compliance: [],
};

const emptyRbac: AdminSecurityRbac = {
  roles: [],
  permissions: [],
};

const emptyAudit: AdminSecurityAuditIntelligence = {
  events: [],
  categories: [],
};

const emptyFilters: FilterState = {
  search: "",
  module: "",
  severity: "",
  actor: "",
};

export function AdminSecurityCommandCenter() {
  const [filters, setFilters] = useState<FilterState>(emptyFilters);
  const [overview, setOverview] = useState<LoadState<AdminSecurityOverview>>({ status: "loading", data: emptyOverview, error: null });
  const [rbac, setRbac] = useState<LoadState<AdminSecurityRbac>>({ status: "loading", data: emptyRbac, error: null });
  const [audit, setAudit] = useState<LoadState<AdminSecurityAuditIntelligence>>({ status: "loading", data: emptyAudit, error: null });

  useEffect(() => {
    let active = true;
    void Promise.all([getAdminSecurityOverview(), getAdminSecurityRbac()]).then(([overviewResult, rbacResult]) => {
      if (!active) return;
      setOverview(overviewResult.ok ? { status: "ready", data: overviewResult.data, error: null } : { status: "error", data: emptyOverview, error: overviewResult.error });
      setRbac(rbacResult.ok ? { status: "ready", data: rbacResult.data, error: null } : { status: "error", data: emptyRbac, error: rbacResult.error });
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    void getAdminSecurityAuditIntelligence({
      limit: 150,
      offset: 0,
      search: filters.search || undefined,
      module: filters.module || undefined,
      severity: filters.severity || undefined,
      actor: filters.actor || undefined,
    }).then((result) => {
      if (!active) return;
      setAudit(result.ok ? { status: "ready", data: result.data, error: null } : { status: "error", data: emptyAudit, error: result.error });
    });
    return () => {
      active = false;
    };
  }, [filters]);

  const sensitivePermissions = useMemo(() => rbac.data.permissions.filter((permission) => permission.sensitive).length, [rbac.data.permissions]);

  return (
    <div className="space-y-6">
      <Hero />

      {overview.status === "error" ? <Notice tone="danger" text={overview.error.message} /> : null}
      {rbac.status === "error" ? <Notice tone="danger" text={rbac.error.message} /> : null}
      {audit.status === "error" ? <Notice tone="danger" text={audit.error.message} /> : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-9">
        {overview.data.metrics.map((metric) => <MetricCard key={metric.id} metric={metric} />)}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_27rem]">
        <div className="space-y-4">
          <RbacMatrix rbac={rbac.data} sensitivePermissions={sensitivePermissions} />
          <AuditFilters filters={filters} onChange={setFilters} />
          <AuditTimeline events={audit.data.events} />
        </div>
        <div className="space-y-4">
          <PosturePanel overview={overview.data} />
          <ActivityIntelligence categories={audit.data.categories} />
          <RiskAlerts rows={overview.data.riskAlerts} />
          <CompliancePanel rows={overview.data.compliance} />
        </div>
      </section>
    </div>
  );
}

function Hero() {
  return (
    <section className="rounded border border-slate-200 bg-white p-5">
      <p className="text-xs font-semibold uppercase text-slate-500">Security Governance</p>
      <div className="mt-2 flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-normal text-slate-950">Security, Governance & Audit Command Center</h2>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">
            Read-only command center for admin users, sessions, MFA, SSO, RBAC, sensitive access, audit intelligence, and compliance readiness.
          </p>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
          <ShieldCheck className="h-4 w-4" />
          No permission mutations
        </span>
      </div>
    </section>
  );
}

function RbacMatrix({ rbac, sensitivePermissions }: { rbac: AdminSecurityRbac; sensitivePermissions: number }) {
  return (
    <Panel title="RBAC Matrix" icon={UserCog}>
      <div className="mb-4 grid gap-3 md:grid-cols-3">
        <MiniStat label="Roles" value={rbac.roles.length} />
        <MiniStat label="Permissions" value={rbac.permissions.length} />
        <MiniStat label="Sensitive" value={sensitivePermissions} />
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
            <tr>{["Role", "Module Access", "Permissions", "Sensitive Permissions", "Future Edit"].map((header) => <th key={header} className="px-3 py-3 font-semibold">{header}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rbac.roles.map((role) => <RbacRow key={role.role} role={role} />)}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

function RbacRow({ role }: { role: AdminSecurityRbacRole }) {
  return (
    <tr className="hover:bg-slate-50">
      <td className="px-3 py-3 font-semibold text-slate-950">{role.role}</td>
      <td className="px-3 py-3 text-slate-600">{role.moduleAccess.join(", ") || "-"}</td>
      <td className="px-3 py-3 text-slate-600">{role.permissions.length}</td>
      <td className="px-3 py-3 text-slate-600">{role.sensitivePermissions.join(", ") || "-"}</td>
      <td className="px-3 py-3">
        <button type="button" disabled className="h-8 rounded border border-slate-200 bg-slate-50 px-2 text-xs font-semibold text-slate-400">Edit disabled</button>
      </td>
    </tr>
  );
}

function AuditFilters({ filters, onChange }: { filters: FilterState; onChange: (filters: FilterState) => void }) {
  const update = (key: keyof FilterState, value: string) => onChange({ ...filters, [key]: value });
  return (
    <Panel title="Audit Filters" icon={SlidersHorizontal}>
      <div className="grid gap-3 md:grid-cols-4">
        <FilterInput label="Search" value={filters.search} onChange={(value) => update("search", value)} />
        <FilterInput label="Module" value={filters.module} onChange={(value) => update("module", value)} />
        <SelectInput label="Severity" value={filters.severity} options={["", "info", "warning", "critical"]} onChange={(value) => update("severity", value)} />
        <FilterInput label="Actor" value={filters.actor} onChange={(value) => update("actor", value)} />
      </div>
    </Panel>
  );
}

function AuditTimeline({ events }: { events: AdminSecurityAuditEvent[] }) {
  return (
    <Panel title="Audit Command Center" icon={FileClock}>
      <div className="mb-4 flex justify-end">
        <button type="button" disabled className="h-8 rounded border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-400">Export disabled</button>
      </div>
      <div className="divide-y divide-slate-100 rounded border border-slate-200">
        {events.length === 0 ? <div className="p-8 text-center text-sm text-slate-500">No audit events returned for current filters.</div> : null}
        {events.map((event) => (
          <div key={event.id} className="grid gap-3 p-4 xl:grid-cols-[9rem_1fr_11rem]">
            <div>
              <StatusPill value={event.severity} />
              <p className="mt-2 text-xs text-slate-500">{formatDate(event.timestamp)}</p>
            </div>
            <div>
              <p className="font-semibold text-slate-950">{event.action}</p>
              <p className="mt-1 text-sm text-slate-600">{event.detail}</p>
              <p className="mt-2 text-xs text-slate-500">Actor: {event.actor} | Entity: {event.entityType || "-"} {event.entityId || ""}</p>
            </div>
            <div className="text-xs text-slate-500">
              <p className="font-semibold text-slate-700">{event.module}</p>
              <p>IP: {event.ipAddress.replaceAll("_", " ")}</p>
              <p>Device: {event.device.replaceAll("_", " ")}</p>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function PosturePanel({ overview }: { overview: AdminSecurityOverview }) {
  return (
    <Panel title="Session / MFA / SSO Posture" icon={Fingerprint}>
      <KeyValue rows={[
        ["Active sessions", String(overview.posture.activeSessions)],
        ["Revoked sessions", String(overview.posture.revokedSessions)],
        ["MFA", overview.posture.mfaEnabled ? "Enabled" : "Not enrolled"],
        ["Backup codes", String(overview.posture.mfaBackupCodesCount)],
        ["SSO", overview.posture.ssoEnabled ? "Configured" : "Not configured"],
        ["Providers", overview.posture.ssoProviders.join(", ") || "-"],
      ]} />
      <div className="mt-4 space-y-2">
        {overview.posture.recommendations.map((item) => (
          <div key={item} className="rounded border border-slate-100 bg-slate-50 px-3 py-2 text-sm text-slate-700">{item}</div>
        ))}
      </div>
    </Panel>
  );
}

function ActivityIntelligence({ categories }: { categories: AdminSecurityMetric[] }) {
  return (
    <Panel title="Admin Activity Intelligence" icon={Monitor}>
      <div className="grid gap-3 sm:grid-cols-2">
        {categories.map((category) => <MiniMetric key={category.id} metric={category} />)}
      </div>
    </Panel>
  );
}

function RiskAlerts({ rows }: { rows: AdminSecurityMetric[] }) {
  return (
    <Panel title="Risk Alerts" icon={ShieldAlert}>
      <div className="space-y-3">
        {rows.map((row) => <MiniMetric key={row.id} metric={row} />)}
      </div>
    </Panel>
  );
}

function CompliancePanel({ rows }: { rows: AdminSecurityOverview["compliance"] }) {
  return (
    <Panel title="Compliance Readiness" icon={Lock}>
      <div className="space-y-3">
        {rows.map((row) => (
          <div key={row.id} className="rounded border border-slate-100 bg-slate-50 p-3">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-semibold text-slate-950">{row.title}</p>
              <StatusPill value={row.status} />
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-600">{row.detail}</p>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function MetricCard({ metric }: { metric: AdminSecurityMetric }) {
  return (
    <div className="rounded border border-slate-200 bg-white p-4">
      <StatusIcon status={metric.status} />
      <p className="mt-4 text-xs font-semibold uppercase text-slate-500">{metric.label}</p>
      <p className="mt-1 break-words text-2xl font-semibold text-slate-950">{metric.value}</p>
      <p className="mt-1 text-xs leading-5 text-slate-500">{metric.detail}</p>
    </div>
  );
}

function MiniMetric({ metric }: { metric: AdminSecurityMetric }) {
  return (
    <div className="rounded border border-slate-100 bg-slate-50 p-3">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-semibold text-slate-950">{metric.label}</p>
        <StatusPill value={metric.status} />
      </div>
      <p className="mt-1 text-xl font-semibold text-slate-950">{metric.value}</p>
      <p className="mt-1 text-xs leading-5 text-slate-500">{metric.detail}</p>
    </div>
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
  const Icon = status === "critical" ? AlertTriangle : status === "ok" || status === "ready" ? CheckCircle2 : ShieldAlert;
  return <span className={`flex h-9 w-9 items-center justify-center rounded border ${classes}`}><Icon className="h-4 w-4" /></span>;
}

function StatusPill({ value }: { value: string }) {
  const classes = value === "critical"
    ? "bg-rose-50 text-rose-700"
    : value === "watch" || value === "warning" || value === "partial" || value === "needs_api"
      ? "bg-amber-50 text-amber-700"
      : "bg-slate-100 text-slate-600";
  return <span className={`inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-semibold capitalize ${classes}`}><CircleDot className="h-3 w-3" />{value.replaceAll("_", " ")}</span>;
}

function MiniStat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded border border-slate-100 bg-slate-50 p-3">
      <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-semibold text-slate-950">{value}</p>
    </div>
  );
}

function FilterInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="space-y-1 text-xs font-semibold uppercase text-slate-500">
      <span>{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} className="h-10 w-full rounded border border-slate-200 bg-white px-3 text-sm font-medium normal-case text-slate-900 outline-none focus:border-slate-400" />
    </label>
  );
}

function SelectInput({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return (
    <label className="space-y-1 text-xs font-semibold uppercase text-slate-500">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="h-10 w-full rounded border border-slate-200 bg-white px-3 text-sm font-medium normal-case text-slate-900 outline-none focus:border-slate-400">
        {options.map((option) => <option key={option || "all"} value={option}>{option || "All"}</option>)}
      </select>
    </label>
  );
}

function KeyValue({ rows }: { rows: string[][] }) {
  return <dl className="space-y-2">{rows.map(([label, value]) => <div key={label} className="grid grid-cols-[8rem_1fr] gap-2 text-sm"><dt className="text-slate-500">{label}</dt><dd className="break-words font-medium text-slate-950">{value || "-"}</dd></div>)}</dl>;
}

function Notice({ text, tone = "default" }: { text: string; tone?: "default" | "danger" }) {
  const classes = tone === "danger" ? "border-rose-200 bg-rose-50 text-rose-700" : "border-slate-200 bg-white text-slate-600";
  return <div className={`rounded border p-4 text-sm ${classes}`}>{text}</div>;
}

function formatDate(value?: string) {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}
