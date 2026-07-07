"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  Database,
  FileClock,
  Fingerprint,
  GitBranch,
  LockKeyhole,
  Scale,
  ShieldCheck,
  UserCheck,
  type LucideIcon,
} from "lucide-react";
import {
  getAdminDataGovernance,
  type AdminApiError,
  type AdminComplianceReadinessItem,
  type AdminConsentPrivacyItem,
  type AdminDataClassificationItem,
  type AdminDataGovernanceDashboard,
  type AdminDataGovernanceMetric,
  type AdminDataGovernanceStatus,
  type AdminDataLineageItem,
  type AdminPersonalizationGovernanceItem,
  type AdminPiiGovernanceItem,
  type AdminPrivacyRequestItem,
  type AdminRetentionPolicyItem,
} from "../../lib/admin/adminApiClient";

type LoadState =
  | { status: "loading"; data: AdminDataGovernanceDashboard; error: null }
  | { status: "ready"; data: AdminDataGovernanceDashboard; error: null }
  | { status: "error"; data: AdminDataGovernanceDashboard; error: AdminApiError };

const emptyDashboard: AdminDataGovernanceDashboard = {
  metrics: [],
  classifications: [],
  piiGovernance: [],
  retentionPolicies: [],
  consentPrivacy: [],
  lineage: [],
  complianceReadiness: [],
  privacyRequests: [],
  personalizationGovernance: [],
};

export function AdminDataGovernanceCenter() {
  const [state, setState] = useState<LoadState>({ status: "loading", data: emptyDashboard, error: null });

  useEffect(() => {
    let active = true;
    void getAdminDataGovernance().then((result) => {
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
      {state.status === "loading" ? <Notice tone="neutral" text="Loading data governance, privacy, retention, and lineage read models from the admin API." /> : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6 2xl:grid-cols-12">
        {data.metrics.map((metric) => <MetricCard key={metric.id} metric={metric} />)}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_28rem]">
        <div className="space-y-4">
          <DataClassification rows={data.classifications} />
          <PiiGovernance rows={data.piiGovernance} />
          <RetentionPolicies rows={data.retentionPolicies} />
          <DataLineage rows={data.lineage} />
        </div>
        <div className="space-y-4">
          <ConsentPrivacy rows={data.consentPrivacy} />
          <ComplianceReadiness rows={data.complianceReadiness} />
          <PrivacyRequests rows={data.privacyRequests} />
          <PersonalizationGovernance rows={data.personalizationGovernance} />
        </div>
      </section>
    </div>
  );
}

function Hero() {
  return (
    <section className="rounded border border-slate-200 bg-white p-5">
      <p className="text-xs font-semibold uppercase text-slate-500">Data Control Layer</p>
      <div className="mt-2 flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-normal text-slate-950">Data Governance, Compliance & Privacy Center</h2>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">
            Read-only governance visibility for data domains, PII, sensitive data, consent, retention, lineage, privacy requests, compliance readiness, AI data usage, and future ecosystem data.
          </p>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
          <ShieldCheck className="h-4 w-4" />
          No delete, export, consent, retention, or privacy mutations
        </span>
      </div>
    </section>
  );
}

function DataClassification({ rows }: { rows: AdminDataClassificationItem[] }) {
  return (
    <Panel title="Data Classification Center" icon={Database}>
      <DataTable
        headers={["Domain", "Type", "Classification", "Sensitivity", "Owner", "Retention", "Consent", "Masking", "Status"]}
        rows={rows.map((row) => [
          row.domain,
          row.dataType,
          row.classification,
          row.sensitivity,
          row.owner,
          row.retention,
          row.consentRequired ? "Required" : "Not required",
          row.maskingRequired ? "Required" : "Not required",
          <StatusPill key={`${row.id}-status`} status={row.status} />,
        ])}
        emptyText="No data classification records returned."
      />
    </Panel>
  );
}

function PiiGovernance({ rows }: { rows: AdminPiiGovernanceItem[] }) {
  return (
    <Panel title="PII Governance" icon={Fingerprint}>
      <DataTable
        headers={["Field", "Domain", "Masking", "Access Audit", "Consent Flag"]}
        rows={rows.map((row) => [
          row.field,
          row.domain,
          <StatusPill key={`${row.id}-masking`} status={row.maskingStatus} />,
          <StatusPill key={`${row.id}-audit`} status={row.accessAuditStatus} />,
          row.consentFlag,
        ])}
        emptyText="No PII governance records returned."
      />
    </Panel>
  );
}

function RetentionPolicies({ rows }: { rows: AdminRetentionPolicyItem[] }) {
  return (
    <Panel title="Retention Policy Center" icon={FileClock}>
      <DataTable
        headers={["Policy", "Domain", "Duration", "Legal Basis", "Disposal", "Status", "Edit"]}
        rows={rows.map((row) => [
          row.policy,
          row.domain,
          row.retentionDuration,
          row.legalBasis,
          row.disposalMethod,
          <StatusPill key={`${row.id}-status`} status={row.status} />,
          <DisabledButton key={`${row.id}-edit`} label="Edit disabled" />,
        ])}
        emptyText="No retention policies returned."
      />
    </Panel>
  );
}

function ConsentPrivacy({ rows }: { rows: AdminConsentPrivacyItem[] }) {
  return (
    <Panel title="Consent & Privacy Center" icon={UserCheck}>
      <div className="space-y-3">
        {rows.map((row) => (
          <article key={row.id} className="rounded border border-slate-200 p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-950">{row.consentCategory}</p>
                <p className="mt-1 text-xs text-slate-500">{row.source} · {row.coverage}</p>
              </div>
              <StatusPill status={row.status} />
            </div>
            <div className="mt-3 flex items-center justify-between gap-2">
              <span className="text-xs text-slate-500">Last updated: {row.lastUpdated}</span>
              <DisabledButton label="Action disabled" />
            </div>
          </article>
        ))}
      </div>
    </Panel>
  );
}

function DataLineage({ rows }: { rows: AdminDataLineageItem[] }) {
  return (
    <Panel title="Data Lineage Foundation" icon={GitBranch}>
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

function ComplianceReadiness({ rows }: { rows: AdminComplianceReadinessItem[] }) {
  return (
    <Panel title="Compliance Readiness" icon={Scale}>
      <div className="space-y-3">
        {rows.map((row) => (
          <article key={row.id} className="rounded border border-slate-200 p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-950">{row.area}</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">{row.detail}</p>
              </div>
              <StatusPill status={row.status} />
            </div>
          </article>
        ))}
      </div>
    </Panel>
  );
}

function PrivacyRequests({ rows }: { rows: AdminPrivacyRequestItem[] }) {
  return (
    <Panel title="Privacy Request Foundation" icon={LockKeyhole}>
      <DataTable
        headers={["Request", "Queue", "Status", "Workflow"]}
        rows={rows.map((row) => [
          row.requestType.replace(/_/g, " "),
          row.queue,
          <StatusPill key={`${row.id}-status`} status={row.status} />,
          <DisabledButton key={`${row.id}-workflow`} label="Workflow disabled" />,
        ])}
        emptyText="No privacy request queues returned."
      />
    </Panel>
  );
}

function PersonalizationGovernance({ rows }: { rows: AdminPersonalizationGovernanceItem[] }) {
  return (
    <Panel title="Personalization Governance Placeholder" icon={ShieldCheck}>
      <div className="space-y-2">
        {rows.map((row) => (
          <div key={row.id} className="rounded border border-slate-200 px-3 py-2">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-950">{row.dataSet.replace(/_/g, " ")}</p>
                <p className="mt-1 text-xs text-slate-500">{row.governanceNote}</p>
              </div>
              <StatusPill status={row.status} />
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function MetricCard({ metric }: { metric: AdminDataGovernanceMetric }) {
  return (
    <article className="rounded border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase text-slate-500">{metric.label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-normal text-slate-950">{metric.value}</p>
        </div>
        <span className="flex h-9 w-9 items-center justify-center rounded bg-emerald-50 text-emerald-700">
          <Database className="h-4 w-4" />
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

function StatusPill({ status }: { status: AdminDataGovernanceStatus }) {
  return <span className={`inline-flex rounded px-2 py-1 text-xs font-semibold ${statusClass(status)}`}>{status.replace(/_/g, " ")}</span>;
}

function DisabledButton({ label }: { label: string }) {
  return <button type="button" disabled className="h-8 rounded border border-slate-200 bg-slate-50 px-2 text-xs font-semibold text-slate-400">{label}</button>;
}

function Notice({ tone, text }: { tone: "danger" | "neutral"; text: string }) {
  const className = tone === "danger" ? "border-red-200 bg-red-50 text-red-700" : "border-slate-200 bg-white text-slate-600";
  return <div className={`rounded border px-4 py-3 text-sm ${className}`}>{text}</div>;
}

function statusClass(status: AdminDataGovernanceStatus) {
  if (status === "ready") return "bg-emerald-50 text-emerald-700";
  if (status === "watch") return "bg-amber-50 text-amber-700";
  if (status === "planned") return "bg-slate-100 text-slate-600";
  return "bg-blue-50 text-blue-700";
}
