"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  ChevronRight,
  CircleDot,
  Clock3,
  Eye,
  Gauge,
  Mail,
  MessageCircle,
  MousePointerClick,
  Phone,
  Send,
  Smartphone,
  Users,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import {
  getAdminCommunicationDetail,
  listAdminCommunicationTemplates,
  listAdminCommunications,
  type AdminApiError,
  type AdminCommunicationDetail,
  type AdminCommunicationEvent,
  type AdminCommunicationTemplate,
  type AdminListQuery,
} from "../../lib/admin/adminApiClient";

type LoadState<T> =
  | { status: "loading"; data: T; error: null }
  | { status: "ready"; data: T; error: null }
  | { status: "error"; data: T; error: AdminApiError };

type FilterState = {
  channel: string;
  module: string;
  customer: string;
  booking: string;
  dateFrom: string;
  dateTo: string;
  status: string;
  template: string;
  priority: string;
  reference: string;
};

const emptyFilters: FilterState = {
  channel: "",
  module: "",
  customer: "",
  booking: "",
  dateFrom: "",
  dateTo: "",
  status: "",
  template: "",
  priority: "",
  reference: "",
};

const channels = ["", "email", "sms", "whatsapp", "push", "in-app", "admin-alert"];
const modules = ["", "booking", "payment", "refund", "wallet", "admin", "smart_planner", "crm", "supplier"];
const statuses = ["", "successful", "failed", "pending", "suppressed", "needs_api"];
const priorities = ["", "low", "normal", "high", "critical"];

export function AdminCommunicationsCenter() {
  const [filters, setFilters] = useState<FilterState>(emptyFilters);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [eventsState, setEventsState] = useState<LoadState<AdminCommunicationEvent[]>>({ status: "loading", data: [], error: null });
  const [templatesState, setTemplatesState] = useState<LoadState<AdminCommunicationTemplate[]>>({ status: "loading", data: [], error: null });

  useEffect(() => {
    let active = true;
    void listAdminCommunications(toQuery(filters)).then((result) => {
      if (!active) return;
      setEventsState(result.ok ? { status: "ready", data: result.data, error: null } : { status: "error", data: [], error: result.error });
    });
    return () => {
      active = false;
    };
  }, [filters]);

  useEffect(() => {
    let active = true;
    void listAdminCommunicationTemplates().then((result) => {
      if (!active) return;
      setTemplatesState(result.ok ? { status: "ready", data: result.data, error: null } : { status: "error", data: [], error: result.error });
    });
    return () => {
      active = false;
    };
  }, []);

  const events = eventsState.data;
  const selected = events.find((event) => event.id === selectedId) ?? events[0] ?? null;
  const metrics = useMemo(() => buildMetrics(events), [events]);

  return (
    <div className="space-y-6">
      <Hero />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-8">
        <MetricCard icon={Bell} label="Total Communications" value={events.length} detail="Current read model" />
        <MetricCard icon={CheckCircle2} label="Successful Deliveries" value={metrics.successful} detail="Derived status" />
        <MetricCard icon={XCircle} label="Failed Deliveries" value={metrics.failed} tone="danger" detail="Needs delivery API" />
        <MetricCard icon={Clock3} label="Pending" value={metrics.pending} tone="warning" detail="Pending review" />
        <MetricCard icon={AlertTriangle} label="Suppressed" value={metrics.suppressed} detail="Suppression API pending" />
        <MetricCard icon={Gauge} label="High Priority" value={metrics.highPriority} tone="warning" detail="High/critical priority" />
        <MetricCard icon={Eye} label="Unread Queue" value="Needs API" detail="Inbox/read API pending" />
        <MetricCard icon={Send} label="Manual Review" value={metrics.manualReview} tone="warning" detail="Warnings and failures" />
      </div>

      <FilterPanel filters={filters} onChange={setFilters} />

      {eventsState.status === "loading" ? <Notice text="Loading communication events..." /> : null}
      {eventsState.status === "error" ? <Notice tone="danger" text={eventsState.error.message} /> : null}

      <section className="grid gap-4 xl:grid-cols-[1fr_26rem]">
        <Timeline events={events} selectedId={selected?.id ?? null} onSelect={setSelectedId} />
        <div className="space-y-4">
          <CommunicationDetail event={selected} />
          <ChannelHealth />
          <Analytics metrics={metrics} />
          <EcosystemReadiness />
        </div>
      </section>

      <TemplateLibrary state={templatesState} />
    </div>
  );
}

function Hero() {
  return (
    <section className="rounded border border-slate-200 bg-white p-5">
      <p className="text-xs font-semibold uppercase text-slate-500">Communication & Engagement</p>
      <div className="mt-2 flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-normal text-slate-950">Communication Operations Center</h2>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">
            Read-only operational visibility across booking, customer, CRM, finance, admin, notification, and future ecosystem communication.
          </p>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
          <CheckCircle2 className="h-4 w-4" />
          Visibility only
        </span>
      </div>
    </section>
  );
}

function FilterPanel({ filters, onChange }: { filters: FilterState; onChange: (filters: FilterState) => void }) {
  const update = (key: keyof FilterState, value: string) => onChange({ ...filters, [key]: value });
  return (
    <section className="rounded border border-slate-200 bg-white">
      <div className="border-b border-slate-100 px-4 py-3">
        <h3 className="text-sm font-semibold text-slate-950">Communication Filters</h3>
      </div>
      <div className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-5">
        <SelectInput label="Channel" value={filters.channel} options={channels} onChange={(value) => update("channel", value)} />
        <SelectInput label="Module" value={filters.module} options={modules} onChange={(value) => update("module", value)} />
        <FilterInput label="Customer" value={filters.customer} onChange={(value) => update("customer", value)} />
        <FilterInput label="Booking" value={filters.booking} onChange={(value) => update("booking", value)} />
        <FilterInput label="Reference" value={filters.reference} onChange={(value) => update("reference", value)} />
        <FilterInput label="Date" type="date" value={filters.dateFrom} onChange={(value) => update("dateFrom", value)} />
        <FilterInput label="Date to" type="date" value={filters.dateTo} onChange={(value) => update("dateTo", value)} />
        <SelectInput label="Status" value={filters.status} options={statuses} onChange={(value) => update("status", value)} />
        <FilterInput label="Template" value={filters.template} onChange={(value) => update("template", value)} />
        <SelectInput label="Priority" value={filters.priority} options={priorities} onChange={(value) => update("priority", value)} />
      </div>
    </section>
  );
}

function Timeline({ events, selectedId, onSelect }: { events: AdminCommunicationEvent[]; selectedId: string | null; onSelect: (id: string) => void }) {
  return (
    <section className="rounded border border-slate-200 bg-white">
      <div className="flex min-h-14 items-center justify-between gap-3 border-b border-slate-100 px-4">
        <h3 className="text-sm font-semibold text-slate-950">Unified Communication Timeline</h3>
        <span className="rounded bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">{events.length} events</span>
      </div>
      <div className="divide-y divide-slate-100">
        {events.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">No communication events returned for current filters.</div>
        ) : events.map((event) => (
          <button
            key={event.id}
            type="button"
            onClick={() => onSelect(event.id)}
            className={["grid w-full gap-3 px-4 py-4 text-left hover:bg-slate-50 xl:grid-cols-[12rem_1fr_10rem]", selectedId === event.id ? "bg-slate-50" : ""].join(" ")}
          >
            <div>
              <StatusPill value={event.status} />
              <p className="mt-2 text-xs text-slate-500">{formatDate(event.timestamp)}</p>
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <ChannelIcon channel={event.channel} />
                <p className="font-semibold text-slate-950">{event.template || event.eventType}</p>
                <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">{event.channel}</span>
                <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">{event.module}</span>
              </div>
              <p className="mt-1 text-sm text-slate-600">{event.message}</p>
              <p className="mt-2 text-xs text-slate-500">Recipient: {event.recipient || event.customerRef || "Needs recipient API"} | Ref: {event.reference || "-"}</p>
            </div>
            <div className="flex items-start justify-between gap-2 xl:justify-end">
              <PriorityPill value={event.priority} />
              <ChevronRight className="h-4 w-4 text-slate-400" />
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

function CommunicationDetail({ event }: { event: AdminCommunicationEvent | null }) {
  const [detail, setDetail] = useState<LoadState<AdminCommunicationDetail | null>>({ status: "ready", data: null, error: null });

  useEffect(() => {
    if (!event) {
      return;
    }
    let active = true;
    void Promise.resolve().then(() => {
      if (active) setDetail({ status: "loading", data: null, error: null });
      return getAdminCommunicationDetail(event.id);
    }).then((result) => {
      if (!active) return;
      setDetail(result.ok ? { status: "ready", data: result.data, error: null } : { status: "error", data: null, error: result.error });
    });
    return () => {
      active = false;
    };
  }, [event]);

  if (!event) return <Panel title="Communication Detail"><p className="text-sm text-slate-500">Select a communication event.</p></Panel>;
  return (
    <Panel title="Communication Detail">
      {detail.status === "error" ? <Notice tone="danger" text={detail.error.message} /> : null}
      <div className="space-y-3">
        {[
          ["Overview", [["Event", event.eventType], ["Status", event.status], ["Priority", event.priority], ["Reference", event.reference || "-"]]],
          ["Recipient", [["Recipient", event.recipient || "Needs recipient API"], ["Actor", event.actor || "-"], ["Customer", event.customerRef || "-"]]],
          ["Channel", [["Channel", event.channel], ["Template", event.template || "-"], ["Module", event.module]]],
          ["Delivery Timeline", [["Current", detail.data?.deliveryTimeline?.[0]?.status ? String(detail.data.deliveryTimeline[0].status) : event.status], ["Source", "Existing operational read model"]]],
          ["Booking", [["Booking", event.bookingRef || "-"]]],
          ["Customer", [["Customer", event.customerRef || "-"]]],
          ["Related Payment", [["Payment", event.paymentRef || "-"]]],
          ["Related Refund", [["Refund", event.refundRef || "-"]]],
          ["Related Wallet", [["Wallet", event.walletRef || "-"]]],
          ["Audit", [["Source", String(event.metadata?.sourceEventId ?? "-")], ["Delivery history", String(event.metadata?.deliveryHistory ?? "Needs API")]]],
        ].map(([title, rows]) => (
          <details key={String(title)} className="rounded border border-slate-200" open>
            <summary className="cursor-pointer px-3 py-2 text-sm font-semibold text-slate-950">{String(title)}</summary>
            <div className="border-t border-slate-100 p-3">
              <KeyValue rows={rows as string[][]} />
            </div>
          </details>
        ))}
        <details className="rounded border border-slate-200" open>
          <summary className="cursor-pointer px-3 py-2 text-sm font-semibold text-slate-950">Operations</summary>
          <div className="border-t border-slate-100 p-3">
            <DisabledActions />
          </div>
        </details>
      </div>
    </Panel>
  );
}

function TemplateLibrary({ state }: { state: LoadState<AdminCommunicationTemplate[]> }) {
  const grouped = useMemo(() => groupTemplates(state.data), [state.data]);
  return (
    <section className="rounded border border-slate-200 bg-white">
      <div className="flex min-h-14 items-center justify-between border-b border-slate-100 px-4">
        <h3 className="text-sm font-semibold text-slate-950">Template Library Foundation</h3>
        <span className="rounded bg-slate-100 px-2 py-1 text-xs font-semibold capitalize text-slate-600">{state.status}</span>
      </div>
      {state.status === "error" ? <div className="p-4"><Notice tone="danger" text={state.error.message} /></div> : null}
      <div className="grid gap-4 p-4 xl:grid-cols-5">
        {["email", "sms", "whatsapp", "push", "in-app"].map((type) => (
          <div key={type} className="rounded border border-slate-200">
            <div className="border-b border-slate-100 px-3 py-2 text-sm font-semibold capitalize text-slate-950">{type} Templates</div>
            <div className="divide-y divide-slate-100">
              {(grouped[type] ?? []).slice(0, 8).map((template) => (
                <div key={template.id} className="px-3 py-3">
                  <p className="truncate text-sm font-semibold text-slate-950">{template.name}</p>
                  <p className="mt-1 text-xs text-slate-500">v{template.version.replace(/^v/, "")} | {template.status} | used {template.usageCount}</p>
                  <button type="button" disabled className="mt-2 h-8 rounded border border-slate-200 bg-slate-50 px-2 text-xs font-semibold text-slate-400">Edit disabled</button>
                </div>
              ))}
              {(grouped[type] ?? []).length === 0 ? <div className="px-3 py-6 text-sm text-slate-500">No templates.</div> : null}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ChannelHealth() {
  return (
    <Panel title="Channel Health">
      <div className="space-y-3">
        {["Email", "SMS", "WhatsApp", "Push", "In-App"].map((channel) => (
          <div key={channel} className="rounded border border-slate-100 bg-slate-50 px-3 py-2">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-slate-950">{channel}</p>
              <span className="rounded bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-500">API placeholder</span>
            </div>
            <p className="mt-1 text-xs text-slate-500">Health, latency, queue, and provider metrics need notification provider telemetry.</p>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function Analytics({ metrics }: { metrics: ReturnType<typeof buildMetrics> }) {
  const failureRate = metrics.total ? Math.round((metrics.failed / metrics.total) * 100) : 0;
  return (
    <Panel title="Communication Analytics">
      <div className="grid gap-3 sm:grid-cols-2">
        <MiniStat icon={CheckCircle2} label="Delivery Success" value={`${metrics.successRate}%`} />
        <MiniStat icon={XCircle} label="Failure %" value={`${failureRate}%`} />
        <MiniStat icon={AlertTriangle} label="Bounce" value="Needs API" />
        <MiniStat icon={Eye} label="Open" value="Needs API" />
        <MiniStat icon={MousePointerClick} label="Click" value="Needs API" />
        <MiniStat icon={MessageCircle} label="Read" value="Needs API" />
      </div>
    </Panel>
  );
}

function EcosystemReadiness() {
  return (
    <Panel title="Ecosystem Communication">
      <div className="space-y-2">
        {["Supplier communication", "TPL Creators", "TPL Marketplace", "TPL Local Life"].map((item) => (
          <div key={item} className="flex items-center justify-between rounded bg-slate-50 px-3 py-2 text-sm">
            <span className="font-medium text-slate-700">{item}</span>
            <span className="text-xs font-semibold uppercase text-slate-400">Reserved</span>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function MetricCard({ icon: Icon, label, value, detail, tone = "default" }: { icon: LucideIcon; label: string; value: React.ReactNode; detail: string; tone?: "default" | "warning" | "danger" }) {
  const toneClass = tone === "danger" ? "border-rose-200 bg-rose-50 text-rose-700" : tone === "warning" ? "border-amber-200 bg-amber-50 text-amber-700" : "border-slate-200 bg-slate-50 text-slate-700";
  return (
    <div className="rounded border border-slate-200 bg-white p-4">
      <div className={`flex h-9 w-9 items-center justify-center rounded border ${toneClass}`}><Icon className="h-4 w-4" /></div>
      <p className="mt-4 text-xs font-semibold uppercase text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-slate-950">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{detail}</p>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded border border-slate-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-slate-950">{title}</h3>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function MiniStat({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: React.ReactNode }) {
  return (
    <div className="rounded border border-slate-100 bg-slate-50 p-3">
      <Icon className="h-4 w-4 text-slate-500" />
      <p className="mt-2 text-xs font-semibold uppercase text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-950">{value}</p>
    </div>
  );
}

function KeyValue({ rows }: { rows: string[][] }) {
  return (
    <dl className="space-y-2">
      {rows.map(([label, value]) => (
        <div key={label} className="grid grid-cols-[7rem_1fr] gap-2 text-sm">
          <dt className="text-slate-500">{label}</dt>
          <dd className="break-words font-medium text-slate-950">{value || "-"}</dd>
        </div>
      ))}
    </dl>
  );
}

function DisabledActions() {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {["Send", "Retry", "Suppress", "Edit template"].map((action) => (
        <button key={action} type="button" disabled className="h-9 rounded border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-400">{action} disabled</button>
      ))}
    </div>
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

function FilterInput({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return (
    <label className="space-y-1 text-xs font-semibold uppercase text-slate-500">
      <span>{label}</span>
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="h-10 w-full rounded border border-slate-200 bg-white px-3 text-sm font-medium normal-case text-slate-900 outline-none focus:border-slate-400" />
    </label>
  );
}

function ChannelIcon({ channel }: { channel: string }) {
  const Icon = channel === "sms" ? Phone : channel === "whatsapp" ? MessageCircle : channel === "push" ? Smartphone : channel === "in-app" ? Users : channel === "admin-alert" ? AlertTriangle : Mail;
  return <span className="flex h-8 w-8 items-center justify-center rounded bg-slate-100 text-slate-600"><Icon className="h-4 w-4" /></span>;
}

function StatusPill({ value }: { value: string }) {
  const classes = value === "failed" ? "bg-rose-50 text-rose-700" : value === "pending" ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-600";
  return <span className={`inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-semibold capitalize ${classes}`}><CircleDot className="h-3 w-3" />{value}</span>;
}

function PriorityPill({ value }: { value: string }) {
  const classes = value === "critical" ? "bg-rose-50 text-rose-700" : value === "high" ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-600";
  return <span className={`rounded px-2 py-1 text-xs font-semibold capitalize ${classes}`}>{value}</span>;
}

function Notice({ text, tone = "default" }: { text: string; tone?: "default" | "danger" }) {
  const classes = tone === "danger" ? "border-rose-200 bg-rose-50 text-rose-700" : "border-slate-200 bg-white text-slate-600";
  return <div className={`rounded border p-4 text-sm ${classes}`}>{text}</div>;
}

function toQuery(filters: FilterState): AdminListQuery {
  return {
    limit: 150,
    offset: 0,
    channel: filters.channel || undefined,
    module: filters.module || undefined,
    customer: filters.customer || undefined,
    booking: filters.booking || undefined,
    dateFrom: filters.dateFrom || undefined,
    dateTo: filters.dateTo || undefined,
    status: filters.status || undefined,
    template: filters.template || undefined,
    priority: filters.priority || undefined,
    reference: filters.reference || undefined,
  };
}

function buildMetrics(events: AdminCommunicationEvent[]) {
  const successful = events.filter((event) => event.status === "successful").length;
  const failed = events.filter((event) => event.status === "failed").length;
  const pending = events.filter((event) => event.status === "pending").length;
  const suppressed = events.filter((event) => event.status === "suppressed").length;
  const highPriority = events.filter((event) => event.priority === "high" || event.priority === "critical").length;
  const manualReview = failed + pending;
  return {
    total: events.length,
    successful,
    failed,
    pending,
    suppressed,
    highPriority,
    manualReview,
    successRate: events.length ? Math.round((successful / events.length) * 100) : 0,
  };
}

function groupTemplates(templates: AdminCommunicationTemplate[]) {
  return templates.reduce<Record<string, AdminCommunicationTemplate[]>>((groups, template) => {
    groups[template.type] = [...(groups[template.type] ?? []), template];
    return groups;
  }, {});
}

function formatDate(value?: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}
