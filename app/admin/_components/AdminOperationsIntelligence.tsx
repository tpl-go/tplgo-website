"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  Bell,
  BookOpen,
  Boxes,
  ChevronRight,
  CircleDot,
  Clock3,
  CreditCard,
  Filter,
  Gauge,
  Map,
  RefreshCcw,
  ShieldAlert,
  Users,
  WalletCards,
  type LucideIcon,
} from "lucide-react";
import {
  listAdminOperationsEvents,
  type AdminApiError,
  type AdminListQuery,
  type AdminOperationsEvent,
} from "../../lib/admin/adminApiClient";

type LoadState =
  | { status: "loading"; data: AdminOperationsEvent[]; error: null }
  | { status: "ready"; data: AdminOperationsEvent[]; error: null }
  | { status: "error"; data: AdminOperationsEvent[]; error: AdminApiError };

type FilterState = {
  module: string;
  severity: string;
  actor: string;
  reference: string;
  dateFrom: string;
  dateTo: string;
};

const emptyFilters: FilterState = {
  module: "",
  severity: "",
  actor: "",
  reference: "",
  dateFrom: "",
  dateTo: "",
};

const moduleOptions = [
  ["", "All modules"],
  ["admin", "Admin"],
  ["booking", "Booking"],
  ["smart_planner", "Smart Planner"],
  ["payment", "Payment"],
  ["refund", "Refund"],
  ["wallet", "Wallet / Ledger"],
];

const severityOptions = [
  ["", "All severities"],
  ["critical", "Critical"],
  ["warning", "Warning"],
  ["info", "Info"],
];

export function AdminOperationsIntelligenceCenter() {
  const [filters, setFilters] = useState<FilterState>(emptyFilters);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [state, setState] = useState<LoadState>({ status: "loading", data: [], error: null });

  useEffect(() => {
    let active = true;
    void listAdminOperationsEvents(toQuery(filters)).then((result) => {
      if (!active) return;
      setState(result.ok ? { status: "ready", data: result.data, error: null } : { status: "error", data: [], error: result.error });
    });
    return () => {
      active = false;
    };
  }, [filters]);

  const events = state.data;
  const selectedEvent = events.find((event) => event.id === selectedEventId) ?? events[0] ?? null;
  const counts = useMemo(() => buildCounts(events), [events]);

  return (
    <div className="space-y-6">
      <section className="rounded border border-slate-200 bg-white p-5">
        <p className="text-xs font-semibold uppercase text-slate-500">Operations Intelligence</p>
        <div className="mt-2 flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-normal text-slate-950">Unified Operations Timeline</h2>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">
              Read-only view of admin audit, booking, Smart Planner, payment, refund, wallet, and ledger events from existing operational sources.
            </p>
          </div>
          <span className="inline-flex w-fit items-center gap-2 rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
            <ShieldAlert className="h-4 w-4" />
            No mutations
          </span>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <MetricCard icon={Activity} label="Total Events" value={events.length} detail="Current read model" />
        <MetricCard icon={AlertTriangle} label="Failed Events" value={counts.critical} tone="danger" detail="Critical severity" />
        <MetricCard icon={Clock3} label="Manual Review" value={counts.warning} tone="warning" detail="Warning severity" />
        <MetricCard icon={Bell} label="Notification Failures" value="Needs API" tone="warning" detail="Notification events pending" />
        <MetricCard icon={CreditCard} label="Payment / Refund Alerts" value={counts.financeAlerts} tone="warning" detail="Finance warnings" />
        <MetricCard icon={Gauge} label="Supplier / API" value="Needs API" detail="Provider events pending" />
      </div>

      <section className="rounded border border-slate-200 bg-white">
        <div className="flex min-h-14 items-center justify-between gap-3 border-b border-slate-100 px-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-950">Filters</h3>
            <p className="text-xs text-slate-500">Module, severity, date range, actor, and reference search</p>
          </div>
          <Filter className="h-4 w-4 text-slate-500" />
        </div>
        <div className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-6">
          <SelectInput label="Module" value={filters.module} options={moduleOptions} onChange={(module) => setFilters((current) => ({ ...current, module }))} />
          <SelectInput label="Severity" value={filters.severity} options={severityOptions} onChange={(severity) => setFilters((current) => ({ ...current, severity }))} />
          <FilterInput label="Actor" value={filters.actor} onChange={(actor) => setFilters((current) => ({ ...current, actor }))} />
          <FilterInput label="Reference" value={filters.reference} onChange={(reference) => setFilters((current) => ({ ...current, reference }))} />
          <FilterInput label="Date from" type="date" value={filters.dateFrom} onChange={(dateFrom) => setFilters((current) => ({ ...current, dateFrom }))} />
          <FilterInput label="Date to" type="date" value={filters.dateTo} onChange={(dateTo) => setFilters((current) => ({ ...current, dateTo }))} />
        </div>
      </section>

      {state.status === "loading" ? <StatusPanel text="Loading operations events..." /> : null}
      {state.status === "error" ? <StatusPanel tone="danger" text={state.error.message} /> : null}

      <section className="grid gap-4 xl:grid-cols-[1fr_24rem]">
        <div className="rounded border border-slate-200 bg-white">
          <div className="flex min-h-14 items-center justify-between gap-3 border-b border-slate-100 px-4">
            <h3 className="text-sm font-semibold text-slate-950">Unified Event Timeline</h3>
            <span className="rounded bg-slate-100 px-2 py-1 text-xs font-semibold capitalize text-slate-600">{state.status}</span>
          </div>
          <div className="divide-y divide-slate-100">
            {events.length === 0 && state.status === "ready" ? (
              <div className="p-8 text-center text-sm text-slate-500">No operations events returned for the current filters.</div>
            ) : (
              events.map((event) => (
                <button
                  key={event.id}
                  type="button"
                  onClick={() => setSelectedEventId(event.id)}
                  className="grid w-full gap-3 px-4 py-4 text-left hover:bg-slate-50 xl:grid-cols-[12rem_1fr_10rem]"
                >
                  <div>
                    <SeverityPill severity={event.severity} />
                    <p className="mt-2 text-xs text-slate-500">{formatDate(event.timestamp)}</p>
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <ModuleIcon module={event.sourceModule} />
                      <p className="font-semibold text-slate-950">{event.eventType}</p>
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">{event.sourceModule}</span>
                    </div>
                    <p className="mt-1 text-sm text-slate-600">{event.message}</p>
                    <p className="mt-2 text-xs text-slate-500">
                      Actor: {event.actor} | Ref: {event.bookingRef || event.customerRef || event.paymentRef || event.refundRef || event.walletRef || event.entityId || "-"}
                    </p>
                  </div>
                  <div className="flex items-start justify-between gap-2 xl:justify-end">
                    <StatusPill>{event.status}</StatusPill>
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        <aside className="space-y-4">
          <EventDetailPanel event={selectedEvent} />
          <NeedsApiPanel />
          <EcosystemPanel />
        </aside>
      </section>
    </div>
  );
}

function EventDetailPanel({ event }: { event: AdminOperationsEvent | null }) {
  if (!event) {
    return (
      <section className="rounded border border-slate-200 bg-white p-4">
        <h3 className="text-sm font-semibold text-slate-950">Event Detail</h3>
        <p className="mt-2 text-sm text-slate-500">Select an event to inspect its operational context.</p>
      </section>
    );
  }
  const links = Object.entries(event.links ?? {});
  return (
    <section className="rounded border border-slate-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-slate-950">Event Detail</h3>
      <dl className="mt-4 space-y-3">
        <DetailItem label="Type" value={event.eventType} />
        <DetailItem label="Module" value={event.sourceModule} />
        <DetailItem label="Severity" value={event.severity} />
        <DetailItem label="Actor" value={event.actor} />
        <DetailItem label="Status" value={event.status} />
        <DetailItem label="Timestamp" value={formatDate(event.timestamp)} />
      </dl>
      {links.length ? (
        <div className="mt-4 space-y-2">
          {links.map(([label, href]) => (
            <Link key={label} href={href} className="flex h-9 items-center justify-between rounded border border-slate-200 px-3 text-sm font-semibold text-slate-950">
              {label}
              <ChevronRight className="h-4 w-4" />
            </Link>
          ))}
        </div>
      ) : null}
      <pre className="mt-4 max-h-64 overflow-auto rounded bg-slate-950 p-3 text-xs text-slate-100">{JSON.stringify(event.metadata ?? {}, null, 2)}</pre>
    </section>
  );
}

function NeedsApiPanel() {
  const items = [
    ["Notification events", "Delivery, bounce, webhook, SMS, WhatsApp, email status"],
    ["Supplier/provider events", "Inventory sync, provider latency, supplier failure"],
    ["Customer CRM events", "Leads, notes, support cases, follow-up history"],
  ];
  return (
    <section className="rounded border border-dashed border-slate-300 bg-white p-4">
      <h3 className="text-sm font-semibold text-slate-950">Needs API</h3>
      <div className="mt-3 space-y-3">
        {items.map(([title, detail]) => (
          <div key={title}>
            <p className="text-sm font-semibold text-slate-800">{title}</p>
            <p className="text-xs leading-5 text-slate-500">{detail}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function EcosystemPanel() {
  return (
    <section className="rounded border border-dashed border-slate-300 bg-white p-4">
      <h3 className="text-sm font-semibold text-slate-950">Ecosystem Ready</h3>
      <div className="mt-3 grid gap-2">
        {["TPL Creators", "TPL Marketplace", "TPL Local Life"].map((label) => (
          <div key={label} className="flex items-center justify-between rounded bg-slate-50 px-3 py-2 text-sm">
            <span className="font-medium text-slate-700">{label}</span>
            <span className="text-xs font-semibold uppercase text-slate-400">Reserved</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function MetricCard({ icon: Icon, label, value, detail, tone = "default" }: { icon: LucideIcon; label: string; value: React.ReactNode; detail: string; tone?: "default" | "warning" | "danger" }) {
  const toneClass = tone === "danger" ? "border-rose-200 bg-rose-50 text-rose-700" : tone === "warning" ? "border-amber-200 bg-amber-50 text-amber-700" : "border-slate-200 bg-slate-50 text-slate-700";
  return (
    <div className="rounded border border-slate-200 bg-white p-4">
      <div className={`flex h-9 w-9 items-center justify-center rounded border ${toneClass}`}>
        <Icon className="h-4 w-4" />
      </div>
      <p className="mt-4 text-xs font-semibold uppercase text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-slate-950">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{detail}</p>
    </div>
  );
}

function SelectInput({ label, value, options, onChange }: { label: string; value: string; options: string[][]; onChange: (value: string) => void }) {
  return (
    <label className="space-y-1 text-xs font-semibold uppercase text-slate-500">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="h-10 w-full rounded border border-slate-200 bg-white px-3 text-sm font-medium normal-case text-slate-900 outline-none focus:border-slate-400">
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionLabel} value={optionValue}>{optionLabel}</option>
        ))}
      </select>
    </label>
  );
}

function FilterInput({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return (
    <label className="space-y-1 text-xs font-semibold uppercase text-slate-500">
      <span>{label}</span>
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="h-10 w-full rounded border border-slate-200 bg-white px-3 text-sm font-medium normal-case text-slate-900 outline-none focus:border-slate-400" />
    </label>
  );
}

function SeverityPill({ severity }: { severity: AdminOperationsEvent["severity"] }) {
  const classes = severity === "critical" ? "bg-rose-50 text-rose-700" : severity === "warning" ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-600";
  return <span className={`inline-flex rounded px-2 py-1 text-xs font-semibold capitalize ${classes}`}>{severity}</span>;
}

function StatusPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex max-w-36 items-center gap-1 rounded bg-slate-100 px-2 py-1 text-xs font-medium capitalize text-slate-600">
      <CircleDot className="h-3 w-3 shrink-0" />
      <span className="truncate">{children}</span>
    </span>
  );
}

function ModuleIcon({ module }: { module: string }) {
  const Icon = module.includes("payment") ? CreditCard
    : module.includes("refund") ? RefreshCcw
      : module.includes("wallet") ? WalletCards
        : module.includes("planner") ? Map
          : module.includes("customer") ? Users
            : module.includes("booking") || module.includes("flight") || module.includes("hotel") ? BookOpen
              : module.includes("admin") ? Activity
                : Boxes;
  return (
    <span className="flex h-8 w-8 items-center justify-center rounded bg-slate-100 text-slate-600">
      <Icon className="h-4 w-4" />
    </span>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase text-slate-500">{label}</dt>
      <dd className="mt-1 break-words text-sm font-medium text-slate-950">{value || "-"}</dd>
    </div>
  );
}

function StatusPanel({ text, tone = "default" }: { text: string; tone?: "default" | "danger" }) {
  const classes = tone === "danger" ? "border-rose-200 bg-rose-50 text-rose-700" : "border-slate-200 bg-white text-slate-600";
  return <div className={`rounded border p-4 text-sm ${classes}`}>{text}</div>;
}

function buildCounts(events: AdminOperationsEvent[]) {
  return {
    critical: events.filter((event) => event.severity === "critical").length,
    warning: events.filter((event) => event.severity === "warning").length,
    financeAlerts: events.filter((event) => ["payment", "refund", "wallet"].includes(event.sourceModule) && event.severity !== "info").length,
  };
}

function toQuery(filters: FilterState): AdminListQuery {
  return {
    limit: 120,
    offset: 0,
    module: filters.module || undefined,
    severity: filters.severity || undefined,
    actor: filters.actor || undefined,
    reference: filters.reference || undefined,
    dateFrom: filters.dateFrom || undefined,
    dateTo: filters.dateTo || undefined,
  };
}

function formatDate(value?: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}
