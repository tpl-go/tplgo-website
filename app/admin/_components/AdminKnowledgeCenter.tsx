"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  BookOpenCheck,
  CheckCircle2,
  FileCheck2,
  FileText,
  Filter,
  GitBranch,
  Search,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import {
  getAdminKnowledgeCenter,
  getAdminKnowledgeDetail,
  type AdminApiError,
  type AdminKnowledgeDashboard,
  type AdminKnowledgeDetail,
  type AdminKnowledgeItem,
  type AdminKnowledgeMetric,
  type AdminKnowledgeSeverity,
  type AdminKnowledgeStatus,
  type AdminRunbookItem,
} from "../../lib/admin/adminApiClient";

type LoadState =
  | { status: "loading"; data: AdminKnowledgeDashboard; error: null }
  | { status: "ready"; data: AdminKnowledgeDashboard; error: null }
  | { status: "error"; data: AdminKnowledgeDashboard; error: AdminApiError };

type DetailState =
  | { status: "idle"; data: AdminKnowledgeDetail | null; error: null }
  | { status: "loading"; data: AdminKnowledgeDetail | null; error: null }
  | { status: "ready"; data: AdminKnowledgeDetail; error: null }
  | { status: "error"; data: AdminKnowledgeDetail | null; error: AdminApiError };

type Filters = {
  search: string;
  module: string;
  category: string;
  severity: string;
  owner: string;
  status: string;
};

const emptyDashboard: AdminKnowledgeDashboard = {
  metrics: [],
  sopLibrary: [],
  runbooks: [],
  featuredDetail: null,
  filters: {
    modules: [],
    categories: [],
    severities: [],
    owners: [],
    statuses: [],
  },
};

const initialFilters: Filters = {
  search: "",
  module: "all",
  category: "all",
  severity: "all",
  owner: "all",
  status: "all",
};

export function AdminKnowledgeCenter() {
  const [state, setState] = useState<LoadState>({ status: "loading", data: emptyDashboard, error: null });
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [detail, setDetail] = useState<DetailState>({ status: "idle", data: null, error: null });

  useEffect(() => {
    let active = true;
    void getAdminKnowledgeCenter().then((result) => {
      if (!active) return;
      if (result.ok) {
        setState({ status: "ready", data: result.data, error: null });
        setDetail(result.data.featuredDetail ? { status: "ready", data: result.data.featuredDetail, error: null } : { status: "idle", data: null, error: null });
      } else {
        setState({ status: "error", data: emptyDashboard, error: result.error });
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const combinedLibrary = useMemo(() => [...state.data.sopLibrary, ...state.data.runbooks], [state.data.runbooks, state.data.sopLibrary]);
  const filteredLibrary = useMemo(() => filterKnowledge(combinedLibrary, filters), [combinedLibrary, filters]);

  function updateFilter(key: keyof Filters, value: string) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  function openDetail(itemId: string) {
    setDetail((current) => ({ status: "loading", data: current.data, error: null }));
    void getAdminKnowledgeDetail(itemId).then((result) => {
      setDetail(result.ok ? { status: "ready", data: result.data, error: null } : { status: "error", data: null, error: result.error });
    });
  }

  return (
    <div className="space-y-6">
      <Hero />

      {state.status === "error" ? <Notice tone="danger" text={state.error.message} /> : null}
      {state.status === "loading" ? <Notice tone="neutral" text="Loading knowledge, SOP, and runbook read models from the admin API." /> : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5 2xl:grid-cols-10">
        {state.data.metrics.map((metric) => <MetricCard key={metric.id} metric={metric} />)}
      </section>

      <FiltersPanel dashboard={state.data} filters={filters} onChange={updateFilter} />

      <section className="grid gap-4 xl:grid-cols-[1fr_28rem]">
        <div className="space-y-4">
          <SopLibrary rows={filteredLibrary} onOpen={openDetail} />
          <RunbookCenter rows={state.data.runbooks} onOpen={openDetail} />
        </div>
        <div className="space-y-4">
          <DetailWorkspace detail={detail} />
          <RelatedOperations />
        </div>
      </section>
    </div>
  );
}

function Hero() {
  return (
    <section className="rounded border border-slate-200 bg-white p-5">
      <p className="text-xs font-semibold uppercase text-slate-500">Knowledge Operations</p>
      <div className="mt-2 flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-normal text-slate-950">Enterprise Knowledge Base, Runbook & SOP Center</h2>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">
            Read-only operational knowledge foundation for SOPs, incident guides, escalation runbooks, platform recovery, finance, supplier, CRM, security, and AI governance.
          </p>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
          <ShieldCheck className="h-4 w-4" />
          Edit and approval disabled
        </span>
      </div>
    </section>
  );
}

function FiltersPanel({ dashboard, filters, onChange }: { dashboard: AdminKnowledgeDashboard; filters: Filters; onChange: (key: keyof Filters, value: string) => void }) {
  return (
    <section className="rounded border border-slate-200 bg-white p-4">
      <div className="mb-3 flex items-center gap-2">
        <Filter className="h-4 w-4 text-slate-500" />
        <h3 className="text-sm font-semibold text-slate-950">Search & Filter Foundation</h3>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
        <label className="relative xl:col-span-2">
          <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <input
            value={filters.search}
            onChange={(event) => onChange("search", event.target.value)}
            placeholder="Search title, module, category"
            className="h-10 w-full rounded border border-slate-200 pl-9 pr-3 text-sm outline-none focus:border-slate-400"
          />
        </label>
        <Select label="Module" value={filters.module} values={dashboard.filters.modules} onChange={(value) => onChange("module", value)} />
        <Select label="Category" value={filters.category} values={dashboard.filters.categories} onChange={(value) => onChange("category", value)} />
        <Select label="Severity" value={filters.severity} values={dashboard.filters.severities} onChange={(value) => onChange("severity", value)} />
        <Select label="Owner" value={filters.owner} values={dashboard.filters.owners} onChange={(value) => onChange("owner", value)} />
        <Select label="Status" value={filters.status} values={dashboard.filters.statuses} onChange={(value) => onChange("status", value)} />
      </div>
    </section>
  );
}

function SopLibrary({ rows, onOpen }: { rows: AdminKnowledgeItem[]; onOpen: (itemId: string) => void }) {
  return (
    <Panel title="SOP Library" icon={FileText}>
      <DataTable
        headers={["Title", "Module", "Category", "Version", "Owner", "Status", "Last Updated", "Future Edit"]}
        rows={rows.map((row) => [
          <button key={`${row.id}-title`} type="button" onClick={() => onOpen(row.id)} className="text-left font-semibold text-slate-950 hover:text-slate-700">{row.title}</button>,
          row.module,
          row.category,
          row.version,
          row.owner,
          <StatusPill key={`${row.id}-status`} status={row.status} />,
          row.lastUpdated,
          <DisabledButton key={`${row.id}-edit`} label="Edit disabled" />,
        ])}
        emptyText="No SOP or runbook matched the current filters."
      />
    </Panel>
  );
}

function RunbookCenter({ rows, onOpen }: { rows: AdminRunbookItem[]; onOpen: (itemId: string) => void }) {
  const grouped = [
    "incident",
    "escalation",
    "recovery",
    "finance",
    "supplier",
    "security",
  ] as const;

  return (
    <Panel title="Runbook Center" icon={BookOpenCheck}>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {grouped.map((type) => {
          const items = rows.filter((row) => row.runbookType === type);
          return (
            <article key={type} className="rounded border border-slate-200 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold capitalize text-slate-950">{type} runbooks</p>
                  <p className="mt-1 text-xs text-slate-500">{items.length} available</p>
                </div>
                <span className="rounded bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">Read only</span>
              </div>
              <div className="mt-3 space-y-2">
                {items.map((item) => (
                  <button key={item.id} type="button" onClick={() => onOpen(item.id)} className="block w-full rounded border border-slate-100 px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50">
                    {item.title}
                  </button>
                ))}
              </div>
            </article>
          );
        })}
      </div>
    </Panel>
  );
}

function DetailWorkspace({ detail }: { detail: DetailState }) {
  const data = detail.data;
  return (
    <Panel title="SOP Detail Workspace" icon={FileCheck2}>
      {detail.status === "loading" ? <Notice tone="neutral" text="Loading SOP detail workspace." /> : null}
      {detail.status === "error" ? <Notice tone="danger" text={detail.error.message} /> : null}
      {!data ? <p className="text-sm text-slate-500">Select an SOP or runbook to inspect the read-only workspace.</p> : null}
      {data ? (
        <div className="space-y-3">
          <Accordion title="Overview">
            <p className="text-sm leading-6 text-slate-600">{data.overview}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <StatusPill status={data.item.status} />
              <SeverityPill severity={data.item.severity} />
              <span className="rounded bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">{data.approvalStatus.replace(/_/g, " ")}</span>
            </div>
          </Accordion>
          <Accordion title="Steps">
            <ol className="space-y-2">
              {data.steps.map((step, index) => (
                <li key={step} className="flex gap-2 text-sm text-slate-600">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-slate-100 text-xs font-semibold text-slate-600">{index + 1}</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </Accordion>
          <Accordion title="Related Context">
            <KeyValue label="Related workflow" value={data.relatedWorkflow} />
            <KeyValue label="Related incident" value={data.relatedIncident} />
            <KeyValue label="Related notification" value={data.relatedNotification} />
            <KeyValue label="Related team" value={data.relatedTeam} />
          </Accordion>
          <Accordion title="Version History">
            <DataTable
              headers={["Version", "Updated", "Summary"]}
              rows={data.versionHistory.map((row) => [row.version, row.updatedAt, row.summary])}
              emptyText="No version history returned."
            />
          </Accordion>
          <div className="grid gap-2 md:grid-cols-2">
            <DisabledButton label="Future edit disabled" />
            <DisabledButton label="Future approve disabled" />
          </div>
        </div>
      ) : null}
    </Panel>
  );
}

function RelatedOperations() {
  const rows = [
    ["Workflow Center", "Related workflow execution remains disabled."],
    ["Incident Intelligence", "Incident mutation remains disabled."],
    ["Notification Center", "Sending, retry, and routing edits remain disabled."],
    ["Operations Teams", "Ownership is read-only until assignment APIs exist."],
    ["Creators", "Future ecosystem SOPs reserved."],
    ["TPL Marketplace", "Future marketplace SOPs reserved."],
    ["Local Life", "Future local experience SOPs reserved."],
  ];

  return (
    <Panel title="Operational Linkage" icon={GitBranch}>
      <div className="space-y-2">
        {rows.map(([label, detail]) => (
          <div key={label} className="rounded border border-slate-200 px-3 py-2">
            <p className="text-sm font-semibold text-slate-950">{label}</p>
            <p className="mt-1 text-xs text-slate-500">{detail}</p>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function MetricCard({ metric }: { metric: AdminKnowledgeMetric }) {
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

function Select({ label, value, values, onChange }: { label: string; value: string; values: string[]; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-1">
      <span className="text-xs font-semibold text-slate-500">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="h-10 rounded border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-400">
        <option value="all">All</option>
        {values.map((item) => <option key={item} value={item}>{item.replace(/_/g, " ")}</option>)}
      </select>
    </label>
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

function Accordion({ title, children }: { title: string; children: ReactNode }) {
  return (
    <details className="rounded border border-slate-200" open>
      <summary className="cursor-pointer px-3 py-2 text-sm font-semibold text-slate-950">{title}</summary>
      <div className="border-t border-slate-100 p-3">{children}</div>
    </details>
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

function KeyValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[9rem_1fr] gap-3 border-b border-slate-100 py-2 text-sm last:border-b-0">
      <span className="font-semibold text-slate-500">{label}</span>
      <span className="text-slate-700">{value}</span>
    </div>
  );
}

function StatusPill({ status }: { status: AdminKnowledgeStatus }) {
  return <span className={`inline-flex rounded px-2 py-1 text-xs font-semibold ${statusClass(status)}`}>{status.replace(/_/g, " ")}</span>;
}

function SeverityPill({ severity }: { severity: AdminKnowledgeSeverity }) {
  return <span className={`inline-flex rounded px-2 py-1 text-xs font-semibold ${severityClass(severity)}`}>{severity}</span>;
}

function DisabledButton({ label }: { label: string }) {
  return <button type="button" disabled className="mt-3 h-8 rounded border border-slate-200 bg-slate-50 px-2 text-xs font-semibold text-slate-400">{label}</button>;
}

function Notice({ tone, text }: { tone: "danger" | "neutral"; text: string }) {
  const className = tone === "danger" ? "border-red-200 bg-red-50 text-red-700" : "border-slate-200 bg-white text-slate-600";
  return <div className={`rounded border px-4 py-3 text-sm ${className}`}>{text}</div>;
}

function filterKnowledge(rows: AdminKnowledgeItem[], filters: Filters): AdminKnowledgeItem[] {
  const search = filters.search.trim().toLowerCase();
  return rows.filter((row) => {
    const matchesSearch = search.length === 0 || [row.title, row.module, row.category, row.owner].some((value) => value.toLowerCase().includes(search));
    const matchesModule = filters.module === "all" || row.module === filters.module;
    const matchesCategory = filters.category === "all" || row.category === filters.category;
    const matchesSeverity = filters.severity === "all" || row.severity === filters.severity;
    const matchesOwner = filters.owner === "all" || row.owner === filters.owner;
    const matchesStatus = filters.status === "all" || row.status === filters.status;
    return matchesSearch && matchesModule && matchesCategory && matchesSeverity && matchesOwner && matchesStatus;
  });
}

function statusClass(status: AdminKnowledgeStatus) {
  if (status === "active") return "bg-emerald-50 text-emerald-700";
  if (status === "draft") return "bg-amber-50 text-amber-700";
  if (status === "archived") return "bg-slate-100 text-slate-600";
  return "bg-blue-50 text-blue-700";
}

function severityClass(severity: AdminKnowledgeSeverity) {
  if (severity === "critical") return "bg-red-50 text-red-700";
  if (severity === "high") return "bg-amber-50 text-amber-700";
  if (severity === "normal") return "bg-blue-50 text-blue-700";
  return "bg-slate-100 text-slate-600";
}
