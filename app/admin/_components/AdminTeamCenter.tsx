"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  BriefcaseBusiness,
  CheckCircle2,
  GitBranch,
  Network,
  ShieldCheck,
  Table2,
  UserCog,
  Users,
  type LucideIcon,
} from "lucide-react";
import {
  getAdminTeamCenter,
  type AdminApiError,
  type AdminCapacityMetric,
  type AdminCrossModuleTeamMapping,
  type AdminOrganizationNode,
  type AdminOwnershipMapItem,
  type AdminRaciItem,
  type AdminSkillMatrixItem,
  type AdminTeamCenterDashboard,
  type AdminTeamMetric,
  type AdminTeamStatus,
  type AdminTeamSummary,
} from "../../lib/admin/adminApiClient";

type LoadState =
  | { status: "loading"; data: AdminTeamCenterDashboard; error: null }
  | { status: "ready"; data: AdminTeamCenterDashboard; error: null }
  | { status: "error"; data: AdminTeamCenterDashboard; error: AdminApiError };

const emptyDashboard: AdminTeamCenterDashboard = {
  metrics: [],
  teams: [],
  organization: [],
  raci: [],
  ownershipMap: [],
  skills: [],
  capacity: [],
  crossModuleMapping: [],
};

export function AdminTeamCenter() {
  const [state, setState] = useState<LoadState>({ status: "loading", data: emptyDashboard, error: null });

  useEffect(() => {
    let active = true;
    void getAdminTeamCenter().then((result) => {
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
      {state.status === "loading" ? <Notice tone="neutral" text="Loading team, role, RACI, ownership, and capacity read models from the admin API." /> : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5 2xl:grid-cols-10">
        {data.metrics.map((metric) => <MetricCard key={metric.id} metric={metric} />)}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_28rem]">
        <div className="space-y-4">
          <TeamDirectory rows={data.teams} />
          <OrganizationStructure rows={data.organization} />
          <RaciMatrix rows={data.raci} />
          <OwnershipMapping rows={data.ownershipMap} />
        </div>
        <div className="space-y-4">
          <CapacityDashboard rows={data.capacity} />
          <SkillMatrix rows={data.skills} />
          <CrossModuleMapping rows={data.crossModuleMapping} />
          <FutureReadiness />
        </div>
      </section>
    </div>
  );
}

function Hero() {
  return (
    <section className="rounded border border-slate-200 bg-white p-5">
      <p className="text-xs font-semibold uppercase text-slate-500">Team Operations</p>
      <div className="mt-2 flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-normal text-slate-950">Enterprise Team, Role Operations & Responsibility Matrix Center</h2>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">
            Read-only organizational backbone for teams, reporting structure, RACI, ownership, skills, capacity, and cross-module responsibility mapping.
          </p>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
          <ShieldCheck className="h-4 w-4" />
          No team, role, assignment, or permission mutations
        </span>
      </div>
    </section>
  );
}

function TeamDirectory({ rows }: { rows: AdminTeamSummary[] }) {
  return (
    <Panel title="Executive Team Dashboard" icon={Users}>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {rows.map((row) => (
          <article key={row.id} className="rounded border border-slate-200 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-950">{row.team}</p>
                <p className="mt-1 text-xs text-slate-500">{row.department} · {row.module}</p>
              </div>
              <StatusPill status={row.status} />
            </div>
            <div className="mt-4 grid gap-1 text-xs text-slate-500">
              <span>Lead: {row.lead}</span>
              <span>Manager: {row.manager}</span>
            </div>
          </article>
        ))}
      </div>
    </Panel>
  );
}

function OrganizationStructure({ rows }: { rows: AdminOrganizationNode[] }) {
  return (
    <Panel title="Organization Structure" icon={Network}>
      <DataTable
        headers={["Department", "Division", "Team", "Lead", "Manager", "Reporting", "Edit"]}
        rows={rows.map((row) => [
          row.department,
          row.division,
          row.team,
          row.lead,
          row.manager,
          row.reportingStructure,
          <DisabledButton key={`${row.id}-edit`} label="Edit disabled" />,
        ])}
        emptyText="No organization structure returned."
      />
    </Panel>
  );
}

function RaciMatrix({ rows }: { rows: AdminRaciItem[] }) {
  return (
    <Panel title="Responsibility Matrix (RACI)" icon={Table2}>
      <DataTable
        headers={["Module", "Responsible", "Accountable", "Consulted", "Informed", "Edit"]}
        rows={rows.map((row) => [
          row.module,
          row.responsible,
          row.accountable,
          row.consulted.join(", "),
          row.informed.join(", "),
          <DisabledButton key={`${row.id}-edit`} label="Edit disabled" />,
        ])}
        emptyText="No RACI matrix returned."
      />
    </Panel>
  );
}

function OwnershipMapping({ rows }: { rows: AdminOwnershipMapItem[] }) {
  return (
    <Panel title="Ownership Mapping" icon={UserCog}>
      <DataTable
        headers={["Domain", "Queue Owner", "Incident Owner", "Workflow Owner", "Knowledge Owner", "Platform Owner", "Service Owner", "Assignment"]}
        rows={rows.map((row) => [
          row.domain,
          row.queueOwner,
          row.incidentOwner,
          row.workflowOwner,
          row.knowledgeOwner,
          row.platformOwner,
          row.serviceOwner,
          <DisabledButton key={`${row.id}-assign`} label="Assign disabled" />,
        ])}
        emptyText="No ownership map returned."
      />
    </Panel>
  );
}

function CapacityDashboard({ rows }: { rows: AdminCapacityMetric[] }) {
  return (
    <Panel title="Capacity Dashboard" icon={BriefcaseBusiness}>
      <div className="space-y-3">
        {rows.map((row) => (
          <article key={row.id} className="rounded border border-slate-200 p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-950">{row.label}</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">{row.detail}</p>
              </div>
              <StatusPill status={row.status} />
            </div>
            <p className="mt-3 text-lg font-semibold text-slate-950">{row.value}</p>
          </article>
        ))}
      </div>
    </Panel>
  );
}

function SkillMatrix({ rows }: { rows: AdminSkillMatrixItem[] }) {
  return (
    <Panel title="Skill Matrix" icon={CheckCircle2}>
      <DataTable
        headers={["Role", "Primary Skills", "Secondary Skills", "Certification", "Edit"]}
        rows={rows.map((row) => [
          row.role,
          row.primarySkills.join(", "),
          row.secondarySkills.join(", "),
          row.certification,
          <DisabledButton key={`${row.id}-edit`} label="Edit disabled" />,
        ])}
        emptyText="No skill matrix returned."
      />
    </Panel>
  );
}

function CrossModuleMapping({ rows }: { rows: AdminCrossModuleTeamMapping[] }) {
  return (
    <Panel title="Cross Module Mapping" icon={GitBranch}>
      <div className="space-y-2">
        {rows.map((row) => (
          <div key={row.id} className="rounded border border-slate-200 px-3 py-2">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-950">{row.relationship}</p>
                <p className="mt-1 text-xs text-slate-500">{row.source} to {row.targetTeam}</p>
              </div>
              <StatusPill status={row.status} />
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function FutureReadiness() {
  const rows = ["Workforce Planning", "Shift Management", "Team Capacity Planning", "Approval Chains", "Cross-functional Collaboration", "Enterprise Org Chart", "AI Workforce Insights", "Creator Moderation Teams", "TPL Marketplace Operations Teams", "Local Life Operations Teams"];
  return (
    <Panel title="Future Workforce Readiness" icon={BriefcaseBusiness}>
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

function MetricCard({ metric }: { metric: AdminTeamMetric }) {
  return (
    <article className="rounded border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase text-slate-500">{metric.label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-normal text-slate-950">{metric.value}</p>
        </div>
        <span className="flex h-9 w-9 items-center justify-center rounded bg-emerald-50 text-emerald-700">
          <Users className="h-4 w-4" />
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

function StatusPill({ status }: { status: AdminTeamStatus }) {
  return <span className={`inline-flex rounded px-2 py-1 text-xs font-semibold ${statusClass(status)}`}>{status.replace(/_/g, " ")}</span>;
}

function DisabledButton({ label }: { label: string }) {
  return <button type="button" disabled className="mt-3 h-8 rounded border border-slate-200 bg-slate-50 px-2 text-xs font-semibold text-slate-400">{label}</button>;
}

function Notice({ tone, text }: { tone: "danger" | "neutral"; text: string }) {
  const className = tone === "danger" ? "border-red-200 bg-red-50 text-red-700" : "border-slate-200 bg-white text-slate-600";
  return <div className={`rounded border px-4 py-3 text-sm ${className}`}>{text}</div>;
}

function statusClass(status: AdminTeamStatus) {
  if (status === "active") return "bg-emerald-50 text-emerald-700";
  if (status === "planned") return "bg-amber-50 text-amber-700";
  return "bg-blue-50 text-blue-700";
}
