"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Building2,
  ChevronRight,
  ClipboardCheck,
  FileText,
  Layers3,
  RefreshCcw,
  Search,
  ShieldCheck,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { adminApiRequest, type AdminApiResult } from "../../../lib/admin/adminApiClient";
import type { PartnerOrganizationBundle, PartnerServiceScope } from "../../../lib/partner/partnerApiClient";

type PartnerQueueRow = {
  review: { id: string; status: string; submittedAt?: string | null };
  organization: { id: string; legalName: string; brandName?: string | null; organizationType: string };
  selectedServices: PartnerServiceScope[];
  readiness: PartnerOrganizationBundle["readiness"];
  blockingCount: number;
};

type PartnerAdminMode = "overview" | "applications" | "organizations" | "services" | "documents";

export function PartnerAdminReadModel({ mode }: { mode: PartnerAdminMode }) {
  const [result, setResult] = useState<AdminApiResult<PartnerQueueRow[]> | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [service, setService] = useState("");

  const loadQueue = useCallback(async () => {
    setLoading(true);
    const response = await adminApiRequest<PartnerQueueRow[]>("/api/v1/admin/partner-verification/queue");
    setResult(response);
    setLoading(false);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadQueue();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadQueue]);

  const rows = useMemo(() => (result?.ok ? result.data : []), [result]);
  const filteredRows = useMemo(() => filterRows(rows, { query, status, service }), [rows, query, status, service]);
  const serviceRows = useMemo(() => buildServiceRows(filteredRows), [filteredRows]);
  const documentRows = useMemo(() => buildDocumentRows(filteredRows), [filteredRows]);
  const metrics = useMemo(() => buildMetrics(rows), [rows]);

  return (
    <div className="space-y-5">
      <HeaderPanel onRefresh={loadQueue} loading={loading} />
      {result && !result.ok ? <Notice text={result.error.message} /> : null}
      {mode === "overview" ? <Overview metrics={metrics} rows={filteredRows} /> : null}
      {mode !== "overview" ? (
        <FilterPanel
          query={query}
          status={status}
          service={service}
          onQuery={setQuery}
          onStatus={setStatus}
          onService={setService}
        />
      ) : null}
      {mode === "applications" ? <Applications rows={filteredRows} loading={loading} /> : null}
      {mode === "organizations" ? <Organizations rows={filteredRows} loading={loading} /> : null}
      {mode === "services" ? <Services rows={serviceRows} loading={loading} /> : null}
      {mode === "documents" ? <Documents rows={documentRows} loading={loading} /> : null}
    </div>
  );
}

function HeaderPanel({ onRefresh, loading }: { onRefresh: () => void; loading: boolean }) {
  return (
    <section className="rounded border border-slate-200 bg-white p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase text-slate-400">Partner domain</p>
          <h2 className="mt-1 text-base font-semibold text-slate-950">Staging Partner operations</h2>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500">
            Read-models are derived from the live Partner Verification queue. Broader Partner management APIs can extend these pages without moving Partners under Suppliers.
          </p>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          className="inline-flex h-10 w-fit items-center justify-center gap-2 rounded bg-slate-950 px-4 text-sm font-medium text-white hover:bg-slate-800"
        >
          <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>
    </section>
  );
}

function Overview({ metrics, rows }: { metrics: ReturnType<typeof buildMetrics>; rows: PartnerQueueRow[] }) {
  return (
    <>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard icon={Building2} label="Queue organizations" value={metrics.total} />
        <MetricCard icon={ClipboardCheck} label="Submitted" value={metrics.submitted} />
        <MetricCard icon={ShieldCheck} label="Under review" value={metrics.underReview} />
        <MetricCard icon={Users} label="Verified" value={metrics.verified} />
        <MetricCard icon={FileText} label="Blocking items" value={metrics.blocking} />
      </section>
      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Panel title="Applications Needing Attention" actionHref="/admin/partners/applications">
          <QueueList rows={rows.slice(0, 6)} emptyLabel="No Partner records are currently returned by the verification queue." />
        </Panel>
        <Panel title="Partner Navigation">
          <div className="grid gap-3">
            <NavCard href="/admin/partners/applications" icon={ClipboardCheck} title="Applications" detail="Submitted onboarding records and review state" />
            <NavCard href="/admin/partner-verification" icon={ShieldCheck} title="Verification" detail="Operational review, signed document access, and decisions" />
            <NavCard href="/admin/partners/organizations" icon={Building2} title="Organizations" detail="Organization and TPL Identity membership visibility" />
          </div>
        </Panel>
      </section>
    </>
  );
}

function Applications({ rows, loading }: { rows: PartnerQueueRow[]; loading: boolean }) {
  return (
    <Panel title="Partner Applications" actionHref="/admin/partner-verification">
      <QueueList rows={rows} emptyLabel={loading ? "Loading Partner applications." : "No Partner applications are currently returned by the verification queue."} />
    </Panel>
  );
}

function Organizations({ rows, loading }: { rows: PartnerQueueRow[]; loading: boolean }) {
  if (rows.length === 0) {
    return <Empty label={loading ? "Loading Partner organizations." : "No Partner organizations are currently returned by the verification queue."} />;
  }
  return (
    <div className="overflow-x-auto rounded border border-slate-200 bg-white">
      <table className="min-w-[760px] w-full text-left text-sm">
        <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
          <tr>
            <th className="px-4 py-3">Organization</th>
            <th className="px-4 py-3">Type</th>
            <th className="px-4 py-3">Membership</th>
            <th className="px-4 py-3">Services</th>
            <th className="px-4 py-3">Verification</th>
            <th className="px-4 py-3">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row) => (
            <tr key={row.organization.id}>
              <td className="px-4 py-3">
                <p className="font-semibold text-slate-950">{row.organization.legalName}</p>
                <p className="mt-1 text-xs text-slate-500">{row.organization.brandName || "No brand name"}</p>
              </td>
              <td className="px-4 py-3 text-slate-600">{row.organization.organizationType}</td>
              <td className="px-4 py-3 text-slate-600">TPL Identity owner/member linked</td>
              <td className="px-4 py-3 text-slate-600">{row.selectedServices.map((item) => item.serviceLabel).join(", ") || "No services"}</td>
              <td className="px-4 py-3"><StatusPill value={row.readiness.overallVerificationStatus} /></td>
              <td className="px-4 py-3">
                <Link className="inline-flex h-8 items-center gap-1 rounded bg-slate-950 px-3 text-xs font-semibold text-white" href={`/admin/partner-verification?organizationId=${encodeURIComponent(row.organization.id)}`}>
                  Review <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Services({ rows, loading }: { rows: ReturnType<typeof buildServiceRows>; loading: boolean }) {
  if (rows.length === 0) {
    return <Empty label={loading ? "Loading Partner service scopes." : "No Partner service scopes are currently returned by the verification queue."} />;
  }
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {rows.map((row) => (
        <div key={row.serviceCode} className="rounded border border-slate-200 bg-white p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-950">{row.serviceLabel}</p>
              <p className="mt-1 text-xs text-slate-500">{row.organizations} organization{row.organizations === 1 ? "" : "s"}</p>
            </div>
            <Layers3 className="h-5 w-5 text-slate-400" />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <StatusPill value={`${row.blockingCount} blocking`} />
            <StatusPill value={`${row.verifiedCount} verified`} />
          </div>
        </div>
      ))}
    </section>
  );
}

function Documents({ rows, loading }: { rows: ReturnType<typeof buildDocumentRows>; loading: boolean }) {
  if (rows.length === 0) {
    return (
      <Empty
        label={loading ? "Loading Partner document compliance." : "No Partner document metadata is currently returned by the verification queue. Private document access remains available inside Partner Verification detail."}
      />
    );
  }
  return (
    <div className="overflow-x-auto rounded border border-slate-200 bg-white">
      <table className="min-w-[760px] w-full text-left text-sm">
        <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
          <tr>
            <th className="px-4 py-3">Organization</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Blocking Requirements</th>
            <th className="px-4 py-3">Private Access</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row) => (
            <tr key={row.organizationId}>
              <td className="px-4 py-3 font-semibold text-slate-950">{row.legalName}</td>
              <td className="px-4 py-3"><StatusPill value={row.status} /></td>
              <td className="px-4 py-3 text-slate-600">{row.blockingCount}</td>
              <td className="px-4 py-3 text-slate-600">Signed access through Verification detail only</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FilterPanel({
  query,
  status,
  service,
  onQuery,
  onStatus,
  onService,
}: {
  query: string;
  status: string;
  service: string;
  onQuery: (value: string) => void;
  onStatus: (value: string) => void;
  onService: (value: string) => void;
}) {
  return (
    <section className="rounded border border-slate-200 bg-white p-4">
      <div className="grid gap-3 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
        <label className="block">
          <span className="text-xs font-semibold uppercase text-slate-500">Search</span>
          <div className="mt-1 flex h-10 items-center gap-2 rounded border border-slate-200 px-3">
            <Search className="h-4 w-4 text-slate-400" />
            <input value={query} onChange={(event) => onQuery(event.target.value)} className="min-w-0 flex-1 text-sm outline-none" placeholder="Legal name, brand, type" />
          </div>
        </label>
        <FilterInput label="Status" value={status} onChange={onStatus} placeholder="UNDER_REVIEW" />
        <FilterInput label="Service" value={service} onChange={onService} placeholder="Guide" />
      </div>
    </section>
  );
}

function QueueList({ rows, emptyLabel }: { rows: PartnerQueueRow[]; emptyLabel: string }) {
  if (rows.length === 0) return <Empty label={emptyLabel} />;
  return (
    <div className="divide-y divide-slate-100">
      {rows.map((row) => (
        <div key={row.organization.id} className="py-3 first:pt-0 last:pb-0">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0">
              <Link className="font-semibold text-slate-950 underline-offset-2 hover:underline" href={`/admin/partner-verification?organizationId=${encodeURIComponent(row.organization.id)}`}>
                {row.organization.legalName}
              </Link>
              <p className="mt-1 text-xs text-slate-500">{row.organization.brandName || "No brand name"} · {row.organization.organizationType}</p>
              <p className="mt-2 text-sm text-slate-600">{row.selectedServices.map((item) => item.serviceLabel).join(", ") || "No services"}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <StatusPill value={row.review.status} />
              <StatusPill value={`${row.blockingCount} blocking`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function Panel({ title, actionHref, children }: { title: string; actionHref?: string; children: React.ReactNode }) {
  return (
    <section className="rounded border border-slate-200 bg-white p-5">
      <div className="mb-4 flex items-start justify-between gap-4">
        <h3 className="text-sm font-semibold text-slate-950">{title}</h3>
        {actionHref ? (
          <Link href={actionHref} className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 underline-offset-2 hover:text-slate-950 hover:underline">
            Open <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function MetricCard({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: number }) {
  return (
    <section className="rounded border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
        <Icon className="h-5 w-5 text-slate-400" />
      </div>
      <p className="mt-4 text-2xl font-semibold text-slate-950">{value.toLocaleString("en-IN")}</p>
    </section>
  );
}

function NavCard({ href, icon: Icon, title, detail }: { href: string; icon: LucideIcon; title: string; detail: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 rounded border border-slate-200 bg-slate-50 p-3 hover:border-slate-300 hover:bg-white">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-white text-slate-700">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-slate-950">{title}</p>
        <p className="mt-1 text-xs leading-5 text-slate-500">{detail}</p>
      </div>
    </Link>
  );
}

function FilterInput({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder: string }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase text-slate-500">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 h-10 w-full rounded border border-slate-200 px-3 text-sm outline-none focus:border-slate-950"
        placeholder={placeholder}
      />
    </label>
  );
}

function StatusPill({ value }: { value: unknown }) {
  const text = String(value ?? "unknown");
  const normalized = text.toLowerCase();
  const classes = normalized.includes("verified") || normalized.includes("approved")
    ? "bg-emerald-50 text-emerald-700"
    : normalized.includes("reject") || normalized.includes("blocking") || normalized.includes("changes")
      ? "bg-amber-50 text-amber-700"
      : "bg-slate-100 text-slate-600";
  return <span className={`inline-flex max-w-44 rounded px-2 py-1 text-xs font-medium ${classes}`}><span className="truncate">{text}</span></span>;
}

function Empty({ label }: { label: string }) {
  return <div className="rounded border border-dashed border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-500">{label}</div>;
}

function Notice({ text }: { text: string }) {
  return <div className="rounded border border-amber-200 bg-amber-50 p-3 text-sm font-medium text-amber-800">{text}</div>;
}

function filterRows(rows: PartnerQueueRow[], filters: { query: string; status: string; service: string }) {
  const query = filters.query.trim().toLowerCase();
  const status = filters.status.trim().toLowerCase();
  const service = filters.service.trim().toLowerCase();
  return rows.filter((row) => {
    const haystack = [
      row.organization.legalName,
      row.organization.brandName ?? "",
      row.organization.organizationType,
      row.review.status,
      row.readiness.overallVerificationStatus,
      ...row.selectedServices.map((item) => `${item.serviceCode} ${item.serviceLabel}`),
    ].join(" ").toLowerCase();
    return (!query || haystack.includes(query)) &&
      (!status || row.review.status.toLowerCase().includes(status) || row.readiness.overallVerificationStatus.toLowerCase().includes(status)) &&
      (!service || row.selectedServices.some((item) => `${item.serviceCode} ${item.serviceLabel}`.toLowerCase().includes(service)));
  });
}

function buildMetrics(rows: PartnerQueueRow[]) {
  return {
    total: rows.length,
    submitted: rows.filter((row) => row.review.status === "SUBMITTED").length,
    underReview: rows.filter((row) => row.review.status === "UNDER_REVIEW").length,
    verified: rows.filter((row) => row.readiness.overallVerificationStatus === "VERIFIED").length,
    blocking: rows.reduce((sum, row) => sum + row.blockingCount, 0),
  };
}

function buildServiceRows(rows: PartnerQueueRow[]) {
  const map = new Map<string, { serviceCode: string; serviceLabel: string; organizations: number; blockingCount: number; verifiedCount: number }>();
  for (const row of rows) {
    for (const service of row.selectedServices) {
      const current = map.get(service.serviceCode) ?? {
        serviceCode: service.serviceCode,
        serviceLabel: service.serviceLabel,
        organizations: 0,
        blockingCount: 0,
        verifiedCount: 0,
      };
      current.organizations += 1;
      current.blockingCount += row.readiness.serviceComplianceStatus.find((item) => item.serviceScopeId === service.id)?.blockingRequirements.length ?? 0;
      if (row.readiness.serviceComplianceStatus.find((item) => item.serviceScopeId === service.id)?.status === "VERIFIED") current.verifiedCount += 1;
      map.set(service.serviceCode, current);
    }
  }
  return [...map.values()].sort((left, right) => left.serviceLabel.localeCompare(right.serviceLabel));
}

function buildDocumentRows(rows: PartnerQueueRow[]) {
  return rows
    .filter((row) => row.blockingCount > 0 || row.readiness.overallVerificationStatus !== "NOT_SUBMITTED")
    .map((row) => ({
      organizationId: row.organization.id,
      legalName: row.organization.legalName,
      status: row.readiness.overallVerificationStatus,
      blockingCount: row.blockingCount,
    }));
}
