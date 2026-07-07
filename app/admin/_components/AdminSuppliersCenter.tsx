"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  ChevronRight,
  CircleDot,
  Clock3,
  Gauge,
  Network,
  ServerCog,
  ShieldCheck,
  Users,
  type LucideIcon,
} from "lucide-react";
import {
  getAdminSupplierDetail,
  listAdminInventoryHealth,
  listAdminProviderHealth,
  listAdminSupplierEvents,
  listAdminSuppliers,
  type AdminApiError,
  type AdminInventoryHealth,
  type AdminProviderHealth,
  type AdminSupplierDetail,
  type AdminSupplierEvent,
  type AdminSupplierRow,
} from "../../lib/admin/adminApiClient";

type LoadState<T> =
  | { status: "loading"; data: T; error: null }
  | { status: "ready"; data: T; error: null }
  | { status: "error"; data: T; error: AdminApiError };

type FilterState = {
  search: string;
  supplierType: string;
  country: string;
  status: string;
  provider: string;
  service: string;
  verification: string;
  health: string;
  sla: string;
};

const emptyFilters: FilterState = {
  search: "",
  supplierType: "",
  country: "",
  status: "",
  provider: "",
  service: "",
  verification: "",
  health: "",
  sla: "",
};

export function AdminSuppliersCenter() {
  const [filters, setFilters] = useState<FilterState>(emptyFilters);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [suppliers, setSuppliers] = useState<LoadState<AdminSupplierRow[]>>({ status: "loading", data: [], error: null });
  const [providerHealth, setProviderHealth] = useState<LoadState<AdminProviderHealth[]>>({ status: "loading", data: [], error: null });
  const [inventoryHealth, setInventoryHealth] = useState<LoadState<AdminInventoryHealth[]>>({ status: "loading", data: [], error: null });
  const [events, setEvents] = useState<LoadState<AdminSupplierEvent[]>>({ status: "loading", data: [], error: null });

  useEffect(() => {
    let active = true;
    void listAdminSuppliers({ limit: 100, offset: 0, search: filters.search || undefined, service: filters.service || undefined, status: filters.status || undefined }).then((result) => {
      if (!active) return;
      setSuppliers(result.ok ? { status: "ready", data: result.data, error: null } : { status: "error", data: [], error: result.error });
    });
    return () => {
      active = false;
    };
  }, [filters.search, filters.service, filters.status]);

  useEffect(() => {
    let active = true;
    void Promise.all([listAdminProviderHealth(), listAdminInventoryHealth(), listAdminSupplierEvents({ limit: 100, offset: 0 })]).then(([providers, inventory, supplierEvents]) => {
      if (!active) return;
      setProviderHealth(providers.ok ? { status: "ready", data: providers.data, error: null } : { status: "error", data: [], error: providers.error });
      setInventoryHealth(inventory.ok ? { status: "ready", data: inventory.data, error: null } : { status: "error", data: [], error: inventory.error });
      setEvents(supplierEvents.ok ? { status: "ready", data: supplierEvents.data, error: null } : { status: "error", data: [], error: supplierEvents.error });
    });
    return () => {
      active = false;
    };
  }, []);

  const filteredSuppliers = useMemo(() => applySupplierFilters(suppliers.data, filters), [suppliers.data, filters]);
  const selected = filteredSuppliers.find((row) => row.id === selectedId) ?? filteredSuppliers[0] ?? null;
  const metrics = useMemo(() => buildMetrics(filteredSuppliers), [filteredSuppliers]);

  return (
    <div className="space-y-6">
      <Hero />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-9">
        <MetricCard icon={Building2} label="Total Suppliers" value={filteredSuppliers.length} detail="Foundation read model" />
        <MetricCard icon={CheckCircle2} label="Active Suppliers" value={metrics.active} detail="Live API pending" />
        <MetricCard icon={AlertTriangle} label="Offline Suppliers" value={metrics.offline} tone="danger" detail="Health API pending" />
        <MetricCard icon={Network} label="API Connected" value={metrics.apiConnected} detail="API suppliers" />
        <MetricCard icon={Users} label="Manual Suppliers" value={metrics.manual} detail="Manual/partner suppliers" />
        <MetricCard icon={ServerCog} label="Sync Issues" value="Needs API" tone="warning" detail="Sync telemetry pending" />
        <MetricCard icon={Clock3} label="SLA Alerts" value="Needs API" tone="warning" detail="SLA engine pending" />
        <MetricCard icon={ShieldCheck} label="Pending Verification" value={metrics.pendingVerification} tone="warning" detail="Verification pending" />
        <MetricCard icon={Gauge} label="High Priority" value={metrics.highPriority} detail="Priority partners" />
      </div>
      <Filters filters={filters} onChange={setFilters} />
      <section className="grid gap-4 xl:grid-cols-[1fr_28rem]">
        <SupplierList state={suppliers} rows={filteredSuppliers} selectedId={selected?.id ?? null} onSelect={setSelectedId} />
        <div className="space-y-4">
          <SupplierWorkspace supplier={selected} />
          <ExtranetFoundation />
          <EcosystemReady />
        </div>
      </section>
      <section className="grid gap-4 xl:grid-cols-3">
        <ProviderHealthPanel state={providerHealth} />
        <InventoryPanel state={inventoryHealth} />
        <SupplierTimeline state={events} />
      </section>
      <SlaCenter />
    </div>
  );
}

function Hero() {
  return (
    <section className="rounded border border-slate-200 bg-white p-5">
      <p className="text-xs font-semibold uppercase text-slate-500">Supplier & Extranet</p>
      <div className="mt-2 flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-normal text-slate-950">Supplier & Extranet Operations Center</h2>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">
            Read-only supplier backbone for OTA providers, manual partners, inventory health, SLA readiness, and future ecosystem partners.
          </p>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
          <ShieldCheck className="h-4 w-4" />
          No supplier mutations
        </span>
      </div>
    </section>
  );
}

function Filters({ filters, onChange }: { filters: FilterState; onChange: (filters: FilterState) => void }) {
  const update = (key: keyof FilterState, value: string) => onChange({ ...filters, [key]: value });
  return (
    <section className="rounded border border-slate-200 bg-white">
      <div className="border-b border-slate-100 px-4 py-3">
        <h3 className="text-sm font-semibold text-slate-950">Advanced Filters</h3>
      </div>
      <div className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-5">
        {[
          ["Supplier Name", "search"],
          ["Supplier Type", "supplierType"],
          ["Country", "country"],
          ["Status", "status"],
          ["Provider", "provider"],
          ["Service", "service"],
          ["Verification", "verification"],
          ["Health", "health"],
          ["SLA", "sla"],
        ].map(([label, key]) => (
          <label key={key} className="space-y-1 text-xs font-semibold uppercase text-slate-500">
            <span>{label}</span>
            <input value={filters[key as keyof FilterState]} onChange={(event) => update(key as keyof FilterState, event.target.value)} className="h-10 w-full rounded border border-slate-200 bg-white px-3 text-sm font-medium normal-case text-slate-900 outline-none focus:border-slate-400" />
          </label>
        ))}
      </div>
    </section>
  );
}

function SupplierList({ state, rows, selectedId, onSelect }: { state: LoadState<AdminSupplierRow[]>; rows: AdminSupplierRow[]; selectedId: string | null; onSelect: (id: string) => void }) {
  return (
    <section className="rounded border border-slate-200 bg-white">
      <div className="flex min-h-14 items-center justify-between border-b border-slate-100 px-4">
        <h3 className="text-sm font-semibold text-slate-950">Supplier List</h3>
        <span className="rounded bg-slate-100 px-2 py-1 text-xs font-semibold capitalize text-slate-600">{state.status}</span>
      </div>
      {state.status === "error" ? <div className="p-4 text-sm text-rose-700">{state.error.message}</div> : null}
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
            <tr>{["Supplier", "Provider", "Services", "Country", "Status", "Health", "Last Sync", "SLA", "Quick View"].map((header) => <th key={header} className="px-3 py-3 font-semibold">{header}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => (
              <tr key={row.id} className={selectedId === row.id ? "bg-slate-50" : "hover:bg-slate-50"}>
                <td className="px-3 py-3 font-semibold text-slate-950">{row.supplier}</td>
                <td className="px-3 py-3 text-slate-600">{row.provider}</td>
                <td className="px-3 py-3 text-slate-600">{row.services.join(", ")}</td>
                <td className="px-3 py-3 text-slate-600">{row.country}</td>
                <td className="px-3 py-3"><StatusPill value={row.status} /></td>
                <td className="px-3 py-3"><StatusPill value={row.health} /></td>
                <td className="px-3 py-3 text-slate-500">{row.lastSync || "Needs API"}</td>
                <td className="px-3 py-3"><StatusPill value={row.sla} /></td>
                <td className="px-3 py-3"><button type="button" onClick={() => onSelect(row.id)} className="inline-flex items-center gap-1 text-sm font-semibold text-slate-950">Open <ChevronRight className="h-4 w-4" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function SupplierWorkspace({ supplier }: { supplier: AdminSupplierRow | null }) {
  const [detail, setDetail] = useState<LoadState<AdminSupplierDetail | null>>({ status: "ready", data: null, error: null });
  useEffect(() => {
    if (!supplier) return;
    let active = true;
    void Promise.resolve().then(() => {
      if (active) setDetail({ status: "loading", data: null, error: null });
      return getAdminSupplierDetail(supplier.id);
    }).then((result) => {
      if (!active) return;
      setDetail(result.ok ? { status: "ready", data: result.data, error: null } : { status: "error", data: null, error: result.error });
    });
    return () => {
      active = false;
    };
  }, [supplier]);

  if (!supplier) return <Panel title="Supplier Workspace"><p className="text-sm text-slate-500">No supplier selected.</p></Panel>;
  const record = detail.data;
  const sections: Array<[string, React.ReactNode]> = [
    ["Overview", <KeyValue key="overview" rows={[["Supplier", supplier.supplier], ["Provider", supplier.provider], ["Type", supplier.supplierType], ["Priority", supplier.priority]]} />],
    ["Profile", <Raw key="profile" value={record?.profile ?? { status: "Loading profile" }} />],
    ["Services", <p key="services" className="text-sm text-slate-600">{supplier.services.join(", ")}</p>],
    ["API Status", <Raw key="api" value={record?.apiStatus ?? { status: "Needs provider API" }} />],
    ["Sync Timeline", <Timeline key="sync" rows={record?.syncTimeline ?? []} />],
    ["Booking Activity", <Raw key="booking" value={record?.bookingActivity ?? { status: "Needs supplier booking API" }} />],
    ["Inventory Status", <Raw key="inventory" value={record?.inventoryStatus ?? { status: "Needs inventory API" }} />],
    ["Health", <Raw key="health" value={record?.health ?? { health: supplier.health, sla: supplier.sla }} />],
    ["Documents", <Raw key="documents" value={record?.documents ?? []} />],
    ["Contacts", <Raw key="contacts" value={record?.contacts ?? []} />],
    ["Audit", <Raw key="audit" value={record?.audit ?? { status: "Read-only foundation" }} />],
    ["Operations", <DisabledActions key="ops" />],
  ];
  return (
    <Panel title="Supplier Workspace">
      {detail.status === "error" ? <p className="mb-3 text-sm text-rose-700">{detail.error.message}</p> : null}
      <div className="space-y-3">
        {sections.map(([title, content]) => (
          <details key={title} className="rounded border border-slate-200" open>
            <summary className="cursor-pointer px-3 py-2 text-sm font-semibold text-slate-950">{title}</summary>
            <div className="border-t border-slate-100 p-3">{content}</div>
          </details>
        ))}
      </div>
    </Panel>
  );
}

function ProviderHealthPanel({ state }: { state: LoadState<AdminProviderHealth[]> }) {
  return (
    <Panel title="Provider Health">
      <div className="space-y-3">
        {state.data.map((row) => (
          <InfoCard key={row.provider} title={row.provider} detail={`${row.health} | ${row.latency} | ${row.apiAvailability}`} />
        ))}
      </div>
    </Panel>
  );
}

function InventoryPanel({ state }: { state: LoadState<AdminInventoryHealth[]> }) {
  return (
    <Panel title="Inventory Intelligence">
      <div className="grid gap-3 sm:grid-cols-2">
        {state.data.map((row) => (
          <InfoCard key={row.service} title={row.service} detail={`${row.syncStatus} | ${row.inventoryDelay}`} />
        ))}
      </div>
    </Panel>
  );
}

function SupplierTimeline({ state }: { state: LoadState<AdminSupplierEvent[]> }) {
  return (
    <Panel title="Supplier Timeline">
      <Timeline rows={state.data} />
    </Panel>
  );
}

function SlaCenter() {
  return (
    <section className="rounded border border-slate-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-slate-950">SLA Center</h3>
      <div className="mt-4 grid gap-3 md:grid-cols-4">
        {["Supplier SLA", "Sync SLA", "API SLA", "Inventory SLA"].map((title) => <InfoCard key={title} title={title} detail="Needs SLA API" />)}
      </div>
      <div className="mt-4"><DisabledActions /></div>
    </section>
  );
}

function ExtranetFoundation() {
  return (
    <Panel title="Extranet Foundation">
      <KeyValue rows={[["Supplier Login Status", "Needs API"], ["Last Login", "Needs API"], ["Pending Accounts", "Needs API"], ["Future Portal", "Reserved"], ["Future Inventory Upload", "Reserved"], ["Future Contract", "Reserved"], ["Future Settlement", "Reserved"]]} />
    </Panel>
  );
}

function EcosystemReady() {
  return (
    <Panel title="Ecosystem Ready">
      <div className="space-y-2">
        {["TPL Creators Partners", "TPL Marketplace Vendors", "TPL Local Life Partners"].map((label) => <InfoCard key={label} title={label} detail="Architecture reserved, no business logic implemented" />)}
      </div>
    </Panel>
  );
}

function MetricCard({ icon: Icon, label, value, detail, tone = "default" }: { icon: LucideIcon; label: string; value: React.ReactNode; detail: string; tone?: "default" | "warning" | "danger" }) {
  const toneClass = tone === "danger" ? "border-rose-200 bg-rose-50 text-rose-700" : tone === "warning" ? "border-amber-200 bg-amber-50 text-amber-700" : "border-slate-200 bg-slate-50 text-slate-700";
  return <div className="rounded border border-slate-200 bg-white p-4"><div className={`flex h-9 w-9 items-center justify-center rounded border ${toneClass}`}><Icon className="h-4 w-4" /></div><p className="mt-4 text-xs font-semibold uppercase text-slate-500">{label}</p><p className="mt-1 text-2xl font-semibold text-slate-950">{value}</p><p className="mt-1 text-xs text-slate-500">{detail}</p></div>;
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="rounded border border-slate-200 bg-white p-4"><h3 className="text-sm font-semibold text-slate-950">{title}</h3><div className="mt-4">{children}</div></section>;
}

function InfoCard({ title, detail }: { title: string; detail: string }) {
  return <div className="rounded border border-slate-100 bg-slate-50 px-3 py-2"><p className="text-sm font-semibold text-slate-950">{title}</p><p className="mt-1 text-xs leading-5 text-slate-500">{detail}</p></div>;
}

function StatusPill({ value }: { value: string }) {
  const classes = value.includes("offline") || value.includes("breach") ? "bg-rose-50 text-rose-700" : value.includes("pending") || value.includes("needs") || value.includes("watch") ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-600";
  return <span className={`inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-semibold capitalize ${classes}`}><CircleDot className="h-3 w-3" />{value.replaceAll("_", " ")}</span>;
}

function KeyValue({ rows }: { rows: string[][] }) {
  return <dl className="space-y-2">{rows.map(([label, value]) => <div key={label} className="grid grid-cols-[9rem_1fr] gap-2 text-sm"><dt className="text-slate-500">{label}</dt><dd className="break-words font-medium text-slate-950">{value}</dd></div>)}</dl>;
}

function Raw({ value }: { value: unknown }) {
  return <pre className="max-h-64 overflow-auto rounded bg-slate-950 p-3 text-xs text-slate-100">{JSON.stringify(value, null, 2)}</pre>;
}

function Timeline({ rows }: { rows: AdminSupplierEvent[] }) {
  if (rows.length === 0) return <p className="text-sm text-slate-500">No supplier timeline events returned.</p>;
  return <div className="space-y-3">{rows.map((row) => <div key={row.id} className="flex gap-3"><div className="mt-1 h-2 w-2 rounded-full bg-slate-950" /><div><p className="text-sm font-semibold text-slate-950">{row.eventType}</p><p className="text-xs text-slate-500">{row.source} | {row.status}</p><p className="text-sm text-slate-600">{row.message}</p></div></div>)}</div>;
}

function DisabledActions() {
  return <div className="grid gap-2 sm:grid-cols-2">{["Verify supplier", "Edit credentials", "Sync inventory", "Escalate SLA"].map((action) => <button key={action} type="button" disabled className="h-9 rounded border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-400">{action} disabled</button>)}</div>;
}

function applySupplierFilters(rows: AdminSupplierRow[], filters: FilterState) {
  return rows.filter((row) => {
    if (filters.supplierType && !row.supplierType.includes(filters.supplierType.toLowerCase())) return false;
    if (filters.country && !row.country.toLowerCase().includes(filters.country.toLowerCase())) return false;
    if (filters.provider && !row.provider.toLowerCase().includes(filters.provider.toLowerCase())) return false;
    if (filters.verification && row.verification !== filters.verification) return false;
    if (filters.health && row.health !== filters.health) return false;
    if (filters.sla && row.sla !== filters.sla) return false;
    return true;
  });
}

function buildMetrics(rows: AdminSupplierRow[]) {
  return {
    active: rows.filter((row) => row.status === "active").length,
    offline: rows.filter((row) => row.status === "offline" || row.health === "offline").length,
    apiConnected: rows.filter((row) => row.supplierType === "api").length,
    manual: rows.filter((row) => row.supplierType === "manual" || row.supplierType === "partner").length,
    pendingVerification: rows.filter((row) => row.verification === "pending").length,
    highPriority: rows.filter((row) => row.priority === "high").length,
  };
}
