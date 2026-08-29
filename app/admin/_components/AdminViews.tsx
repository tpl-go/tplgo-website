"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Activity,
  AlertCircle,
  BookOpen,
  Building2,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  CircleDot,
  Clock3,
  CreditCard,
  Database,
  FileBarChart,
  Gauge as GaugeIcon,
  Gift,
  Headphones,
  Map as MapIcon,
  Newspaper,
  RefreshCcw,
  Search,
  ShieldAlert,
  Users,
  WalletCards,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  adminApiRequest,
  buildAdminQuery,
  type AdminApiResult,
  type AdminBookingDetail,
  type AdminDashboardSummary,
  type AdminListQuery,
} from "../../lib/admin/adminApiClient";

type LoadState<T> = {
  loading: boolean;
  result: AdminApiResult<T> | null;
};

type LoadInternalState<T> = {
  path: string;
  result: AdminApiResult<T> | null;
};

const countCards = [
  { key: "bookings", label: "Bookings", description: "All service bookings", icon: BookOpen, href: "/admin/bookings" },
  { key: "users", label: "Users", description: "Admin/customer identity base", icon: Users, href: "/admin/users" },
  { key: "payments", label: "Payments", description: "Payment records", icon: CreditCard, href: "/admin/payments" },
  { key: "refunds", label: "Refunds", description: "Refund operations", icon: RefreshCcw, href: "/admin/refunds" },
  { key: "wallets", label: "Wallets", description: "Wallet accounts", icon: WalletCards, href: "/admin/wallets" },
  { key: "offers", label: "Offers", description: "Active commercial content", icon: Gift, href: "/admin/offers" },
  { key: "plannerTrips", label: "Planner Trips", description: "Smart planner pipeline", icon: MapIcon, href: "/admin/planner" },
  { key: "auditEvents", label: "Audit", description: "Admin activity events", icon: Activity, href: "/admin/audit" },
];

const serviceLabels: Record<string, string> = {
  flight: "Flights",
  hotel: "Hotels",
  homestay: "Homestays",
  cab: "Cabs",
  bus: "Buses",
  train: "Trains",
  cruise: "Cruise",
  visa: "Visa",
  insurance: "Insurance",
  package: "Packages",
  "smart-planner": "Smart Planner",
};

export function AdminDashboardView() {
  const summaryLoad = useAdminLoad<AdminDashboardSummary>("/api/v1/admin/dashboard/summary");
  const bookingsLoad = useAdminLoad<Array<Record<string, unknown>>>("/api/v1/admin/bookings?limit=20&offset=0");
  const paymentsLoad = useAdminLoad<Array<Record<string, unknown>>>("/api/v1/admin/payments?limit=20&offset=0");
  const refundsLoad = useAdminLoad<Array<Record<string, unknown>>>("/api/v1/admin/refunds?limit=20&offset=0");
  const auditLoad = useAdminLoad<Array<Record<string, unknown>>>("/api/v1/admin/audit/events?limit=8&offset=0");
  const systemLoad = useAdminLoad<Record<string, unknown>>("/api/v1/admin/system/health");

  const counts = summaryLoad.result?.ok ? summaryLoad.result.data.counts ?? {} : {};
  const bookings = bookingsLoad.result?.ok ? bookingsLoad.result.data : [];
  const payments = paymentsLoad.result?.ok ? paymentsLoad.result.data : [];
  const refunds = refundsLoad.result?.ok ? refundsLoad.result.data : [];
  const auditEvents = auditLoad.result?.ok ? auditLoad.result.data : [];
  const systemStatus = systemLoad.result?.ok ? String(systemLoad.result.data.status ?? "unknown") : "unknown";
  const serviceOverview = buildServiceOverview(bookings);
  const paymentIssues = payments.filter(isPaymentIssue).slice(0, 4);
  const refundQueue = refunds.filter(isRefundQueued).slice(0, 4);
  const todayBookings = bookings.slice(0, 5);
  const loading = summaryLoad.loading || bookingsLoad.loading || paymentsLoad.loading || refundsLoad.loading || auditLoad.loading || systemLoad.loading;

  return (
    <div className="space-y-6">
      <StatusNotice loading={summaryLoad.loading} result={summaryLoad.result} />
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {countCards.map((item) => {
          const Icon = item.icon;
          const count = counts[item.key] ?? 0;
          return (
            <Link key={item.key} href={item.href} className="rounded border border-slate-200 bg-white p-5 transition hover:border-slate-300 hover:shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-950">{item.label}</p>
                  <p className="mt-1 text-xs text-slate-500">{item.description}</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded bg-slate-100 text-slate-600">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-5 flex items-end justify-between gap-3">
                <p className="text-3xl font-semibold text-slate-950">{formatCount(count)}</p>
                <span className="flex items-center gap-1 text-xs font-medium text-slate-500">
                  Open <ChevronRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </Link>
          );
        })}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
        <Panel
          title="Today's Bookings"
          eyebrow="Operations queue"
          action={<PanelLink href="/admin/bookings" label="View all" />}
        >
          <RecordList
            rows={todayBookings}
            emptyLabel={loading ? "Loading bookings" : "No booking records returned by the admin bookings API."}
            render={(row) => (
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <Link className="truncate text-sm font-semibold text-slate-950 underline-offset-2 hover:underline" href={`/admin/bookings/${encodeURIComponent(String(row.bookingRef ?? row.id ?? ""))}`}>
                    {formatCell(row.bookingRef ?? row.id)}
                  </Link>
                  <p className="mt-1 truncate text-xs text-slate-500">{formatService(row)} · {formatCell(row.mobile)}</p>
                </div>
                <StatusPill value={row.status ?? row.bookingStatus ?? row.paymentStatus} />
              </div>
            )}
          />
        </Panel>

        <Panel title="Risk & Alerts" eyebrow="Live readiness">
          <div className="space-y-3">
            <AlertRow
              icon={systemStatus === "ok" ? CheckCircle2 : ShieldAlert}
              title="System health"
              detail={systemLoad.result?.ok ? `Runtime status is ${systemStatus}.` : systemLoad.result?.error.message ?? "Health check pending."}
              tone={systemStatus === "ok" ? "success" : "warn"}
            />
            <AlertRow
              icon={paymentIssues.length ? ShieldAlert : CheckCircle2}
              title="Payment issues"
              detail={paymentIssues.length ? `${paymentIssues.length} recent payment records need review.` : "No failed payment records in the latest admin sample."}
              tone={paymentIssues.length ? "warn" : "success"}
            />
            <AlertRow
              icon={refundQueue.length ? Clock3 : CheckCircle2}
              title="Refund queue"
              detail={refundQueue.length ? `${refundQueue.length} pending refund records returned.` : "No pending refund records in the latest admin sample."}
              tone={refundQueue.length ? "warn" : "success"}
            />
          </div>
        </Panel>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <Panel title="Service-wise Booking Overview" eyebrow="Booking mix">
          <RecordList
            rows={serviceOverview}
            emptyLabel={loading ? "Loading service mix" : "No service-wise booking data yet."}
            render={(row) => (
              <div>
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-medium text-slate-950">{row.label}</span>
                  <span className="text-slate-500">{row.count}</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded bg-slate-100">
                  <div className="h-full rounded bg-slate-950" style={{ width: `${row.percent}%` }} />
                </div>
              </div>
            )}
          />
        </Panel>

        <Panel title="Payment Issues" eyebrow="Finance watch" action={<PanelLink href="/admin/payments" label="Payments" />}>
          <RecordList
            rows={paymentIssues}
            emptyLabel={loading ? "Loading payments" : "No failed or pending payment records in the latest sample."}
            render={(row) => (
              <CompactRecord
                title={formatCell(row.paymentRef ?? row.id)}
                detail={`${formatCell(row.gateway)} · ${formatCurrency(row.amount, row.currency)}`}
                status={row.status}
              />
            )}
          />
        </Panel>

        <Panel title="Refund Queue" eyebrow="Customer recovery" action={<PanelLink href="/admin/refunds" label="Refunds" />}>
          <RecordList
            rows={refundQueue}
            emptyLabel={loading ? "Loading refunds" : "No pending refund records in the latest sample."}
            render={(row) => (
              <CompactRecord
                title={formatCell(row.refundRef ?? row.id)}
                detail={`${formatCell(row.refundMethod)} · ${formatCurrency(row.amount, row.currency)}`}
                status={row.status}
              />
            )}
          />
        </Panel>
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
        <Panel title="Quick Actions" eyebrow="Common admin paths">
          <div className="grid gap-3 sm:grid-cols-2">
            <QuickAction href="/admin/bookings" icon={BookOpen} title="Find booking" detail="Search service bookings" />
            <QuickAction href="/admin/customers" icon={Users} title="Customers / CRM" detail="Customer search and support context" />
            <QuickAction href="/admin/partners" icon={ClipboardCheck} title="Partners" detail="Overview, applications, verification, and compliance" />
            <QuickAction href="/admin/payments" icon={CreditCard} title="Review payments" detail="Inspect latest payments" />
            <QuickAction href="/admin/system" icon={GaugeIcon} title="Run health check" detail="Database and platform status" />
          </div>
        </Panel>

        <Panel title="Recent Admin Activity" eyebrow="Audit trail" action={<PanelLink href="/admin/audit" label="Audit" />}>
          <RecordList
            rows={auditEvents}
            emptyLabel={loading ? "Loading audit events" : "No admin activity events returned."}
            render={(row) => (
              <CompactRecord
                title={formatCell(row.action)}
                detail={`${formatCell(row.entityType)} · ${formatCell(row.createdAt)}`}
                status={row.requestId ? "recorded" : "logged"}
              />
            )}
          />
        </Panel>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <PlaceholderPanel icon={Headphones} title="CRM Leads" detail="Needs CRM/support API for lead queues, customer timelines, notes, and cases." />
        <PlaceholderPanel icon={Building2} title="Supplier Health" detail="Needs supplier/provider API for partner uptime, failures, inventory, and SLAs." />
        <PlaceholderPanel icon={Newspaper} title="Dynamic Content" detail="Needs CMS/content API for banners, destinations, content blocks, and approvals." />
        <PlaceholderPanel icon={FileBarChart} title="Reports" detail="Needs BI/export API for revenue, conversion, cohorts, and service reports." />
      </section>

      <section className="rounded border border-dashed border-slate-300 bg-white p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-950">Failed checkout</p>
            <p className="mt-1 text-sm text-slate-500">Checkout failure monitoring is ready for placement here once a backend admin checkout-events API exists.</p>
          </div>
          <span className="w-fit rounded bg-slate-100 px-3 py-1 text-xs font-semibold uppercase text-slate-500">Needs API</span>
        </div>
      </section>
    </div>
  );
}

function Panel({
  title,
  eyebrow,
  action,
  children,
}: {
  title: string;
  eyebrow: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded border border-slate-200 bg-white p-5">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase text-slate-400">{eyebrow}</p>
          <h2 className="mt-1 text-base font-semibold text-slate-950">{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function PanelLink({ href, label }: { href: string; label: string }) {
  return (
    <Link className="flex items-center gap-1 text-xs font-semibold text-slate-600 underline-offset-2 hover:text-slate-950 hover:underline" href={href}>
      {label}
      <ChevronRight className="h-3.5 w-3.5" />
    </Link>
  );
}

function RecordList<T>({
  rows,
  emptyLabel,
  render,
}: {
  rows: T[];
  emptyLabel: string;
  render: (row: T) => ReactNode;
}) {
  if (rows.length === 0) {
    return (
      <div className="rounded border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
        {emptyLabel}
      </div>
    );
  }
  return (
    <div className="divide-y divide-slate-100">
      {rows.map((row, index) => (
        <div key={recordKey(row, index)} className="py-3 first:pt-0 last:pb-0">
          {render(row)}
        </div>
      ))}
    </div>
  );
}

function AlertRow({
  icon: Icon,
  title,
  detail,
  tone,
}: {
  icon: LucideIcon;
  title: string;
  detail: string;
  tone: "success" | "warn";
}) {
  const classes = tone === "success"
    ? "border-emerald-100 bg-emerald-50 text-emerald-700"
    : "border-amber-100 bg-amber-50 text-amber-700";
  return (
    <div className="flex items-start gap-3 rounded border border-slate-100 bg-slate-50 p-3">
      <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded border ${classes}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-950">{title}</p>
        <p className="mt-1 text-xs leading-5 text-slate-500">{detail}</p>
      </div>
    </div>
  );
}

function CompactRecord({ title, detail, status }: { title: string; detail: string; status: unknown }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-slate-950">{title}</p>
        <p className="mt-1 truncate text-xs text-slate-500">{detail}</p>
      </div>
      <StatusPill value={status} />
    </div>
  );
}

function QuickAction({
  href,
  icon: Icon,
  title,
  detail,
}: {
  href: string;
  icon: LucideIcon;
  title: string;
  detail: string;
}) {
  return (
    <Link className="flex min-h-20 items-center gap-3 rounded border border-slate-200 bg-slate-50 p-3 hover:border-slate-300 hover:bg-white" href={href}>
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-white text-slate-700">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-slate-950">{title}</p>
        <p className="mt-1 text-xs text-slate-500">{detail}</p>
      </div>
    </Link>
  );
}

function PlaceholderPanel({ icon: Icon, title, detail }: { icon: LucideIcon; title: string; detail: string }) {
  return (
    <section className="rounded border border-dashed border-slate-300 bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded bg-slate-100 text-slate-600">
          <Icon className="h-5 w-5" />
        </div>
        <span className="rounded bg-slate-100 px-2 py-1 text-[10px] font-semibold uppercase text-slate-500">Needs API</span>
      </div>
      <h2 className="mt-4 text-sm font-semibold text-slate-950">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-500">{detail}</p>
    </section>
  );
}

function StatusPill({ value }: { value: unknown }) {
  const text = formatCell(value).toLowerCase();
  const tone = text.includes("fail") || text.includes("error") || text.includes("cancel")
    ? "warn"
    : text.includes("pending") || text.includes("processing")
      ? "pending"
      : "neutral";
  const classes = tone === "warn"
    ? "bg-rose-50 text-rose-700"
    : tone === "pending"
      ? "bg-amber-50 text-amber-700"
      : "bg-slate-100 text-slate-600";
  return (
    <span className={`inline-flex max-w-36 items-center gap-1 rounded px-2 py-1 text-xs font-medium ${classes}`}>
      <CircleDot className="h-3 w-3 shrink-0" />
      <span className="truncate">{text === "-" ? "unknown" : text}</span>
    </span>
  );
}

function buildServiceOverview(bookings: Array<Record<string, unknown>>) {
  const counts = new Map<string, number>();
  for (const booking of bookings) {
    const service = String(booking.serviceType ?? booking.type ?? booking.service ?? booking.compatBookingItemType ?? "unknown");
    counts.set(service, (counts.get(service) ?? 0) + 1);
  }
  const total = Math.max(bookings.length, 1);
  return [...counts.entries()]
    .sort(([, left], [, right]) => right - left)
    .slice(0, 8)
    .map(([service, count]) => ({
      id: service,
      label: serviceLabels[service] ?? titleCase(service),
      count,
      percent: Math.max(8, Math.round((count / total) * 100)),
    }));
}

function isPaymentIssue(row: Record<string, unknown>): boolean {
  const status = String(row.status ?? "").toLowerCase();
  return status.includes("fail") || status.includes("pending") || status.includes("error");
}

function isRefundQueued(row: Record<string, unknown>): boolean {
  const status = String(row.status ?? "").toLowerCase();
  return status.includes("pending") || status.includes("requested") || status.includes("processing");
}

function formatService(row: Record<string, unknown>): string {
  const service = String(row.serviceType ?? row.type ?? row.service ?? "service");
  return serviceLabels[service] ?? titleCase(service);
}

function formatCount(value: unknown): string {
  return typeof value === "number" ? value.toLocaleString("en-IN") : "0";
}

function formatCurrency(amount: unknown, currency: unknown): string {
  const amountText = formatCell(amount);
  const currencyText = typeof currency === "string" && currency.trim() ? currency : "INR";
  return amountText === "-" ? currencyText : `${currencyText} ${amountText}`;
}

function titleCase(value: string): string {
  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ") || "Unknown";
}

function recordKey(row: unknown, index: number): string {
  if (row && typeof row === "object") {
    const input = row as Record<string, unknown>;
    const key = input.id ?? input.bookingRef ?? input.paymentRef ?? input.refundRef ?? input.action;
    if (typeof key === "string" || typeof key === "number") return String(key);
  }
  return String(index);
}

export function AdminBookingsView() {
  const [query, setQuery] = useState<AdminListQuery>({ limit: 50, offset: 0 });
  const [path, setPath] = useState(`/api/v1/admin/bookings${buildAdminQuery(query)}`);
  const { loading, result } = useAdminLoad<Array<Record<string, unknown>>>(path);

  const applyFilters = () => {
    setPath(`/api/v1/admin/bookings${buildAdminQuery(query)}`);
  };

  return (
    <div className="space-y-5">
      <div className="rounded border border-slate-200 bg-white p-4">
        <div className="grid gap-3 md:grid-cols-5">
          <FilterInput label="Service" value={query.service ?? ""} onChange={(service) => setQuery((current) => ({ ...current, service }))} />
          <FilterInput label="Status" value={query.status ?? ""} onChange={(status) => setQuery((current) => ({ ...current, status }))} />
          <FilterInput label="Mobile" value={query.mobile ?? ""} onChange={(mobile) => setQuery((current) => ({ ...current, mobile }))} />
          <FilterInput label="Date From" value={query.dateFrom ?? ""} onChange={(dateFrom) => setQuery((current) => ({ ...current, dateFrom }))} />
          <FilterInput label="Date To" value={query.dateTo ?? ""} onChange={(dateTo) => setQuery((current) => ({ ...current, dateTo }))} />
        </div>
        <button
          type="button"
          onClick={applyFilters}
          className="mt-4 flex h-9 items-center gap-2 rounded bg-slate-950 px-4 text-sm font-medium text-white"
        >
          <Search className="h-4 w-4" />
          Apply filters
        </button>
      </div>
      <StatusNotice loading={loading} result={result} />
      <SafeTable
        rows={result?.ok ? result.data : []}
        columns={["bookingRef", "mobile", "status", "bookingStatus", "paymentStatus"]}
        linkColumn={{
          key: "bookingRef",
          href: (row) => `/admin/bookings/${encodeURIComponent(String(row.bookingRef ?? row.id ?? ""))}`,
        }}
      />
    </div>
  );
}

export function AdminBookingDetailView({ bookingId }: { bookingId: string }) {
  const { loading, result } = useAdminLoad<AdminBookingDetail>(`/api/v1/admin/bookings/${encodeURIComponent(bookingId)}`);
  const detail = result?.ok ? result.data.detail : null;

  return (
    <div className="space-y-5">
      <StatusNotice loading={loading} result={result} />
      {result?.ok ? (
        <>
          <JsonPanel title="Booking Summary" value={result.data.booking} />
          <section className="rounded border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-sm font-semibold text-slate-950">Raw Payload</h2>
                <p className="mt-1 text-xs text-slate-500">
                  Full payload is permission-gated by `bookings.raw_payload.read`.
                </p>
              </div>
              <span className="rounded bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                {detail?.rawPayload ? "Visible" : "Metadata only"}
              </span>
            </div>
            {detail?.rawPayload ? (
              <JsonBlock value={detail.rawPayload} />
            ) : (
              <dl className="mt-4 grid gap-3 text-sm md:grid-cols-2">
                <MetaItem label="Hash" value={detail?.rawPayloadHash} />
                <MetaItem label="Size Bytes" value={detail?.rawPayloadSizeBytes} />
                <MetaItem label="Mapper" value={detail?.mapperVersion} />
                <MetaItem label="Schema" value={detail?.rawPayloadSchema ?? "Not set"} />
              </dl>
            )}
          </section>
          <JsonPanel title="Normalized Summary" value={detail?.normalizedSummary ?? {}} />
        </>
      ) : null}
    </div>
  );
}

export function AdminResourceView({
  title,
  path,
  columns,
}: {
  title: string;
  path: string;
  columns: string[];
}) {
  const { loading, result } = useAdminLoad<Array<Record<string, unknown>>>(path);
  return (
    <div className="space-y-5">
      <StatusNotice loading={loading} result={result} />
      <SafeTable rows={result?.ok ? result.data : []} columns={columns} emptyLabel={`${title} will appear here when backend data exists.`} />
    </div>
  );
}

export function AdminSystemView() {
  const { loading, result } = useAdminLoad<Record<string, unknown>>("/api/v1/admin/system/health");
  return (
    <div className="space-y-5">
      <StatusNotice loading={loading} result={result} />
      <JsonPanel title="System Health" value={result?.ok ? result.data : {}} />
    </div>
  );
}

function useAdminLoad<T>(path: string): LoadState<T> {
  const [state, setState] = useState<LoadInternalState<T>>({ path, result: null });

  useEffect(() => {
    let active = true;
    adminApiRequest<T>(path).then((result) => {
      if (active) setState({ path, result });
    });
    return () => {
      active = false;
    };
  }, [path]);

  return {
    loading: state.path !== path || state.result === null,
    result: state.path === path ? state.result : null,
  };
}

function StatusNotice<T>({ loading, result }: LoadState<T>) {
  if (loading) {
    return <div className="rounded border border-slate-200 bg-white p-4 text-sm text-slate-500">Loading admin data</div>;
  }
  if (!result) return null;
  if (!result.ok) {
    return (
      <div className="flex items-start gap-3 rounded border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <AlertCircle className="mt-0.5 h-4 w-4" />
        <div>
          <p className="font-medium">{result.error.message}</p>
          <p className="mt-1 text-xs">Request ID: {result.requestId}</p>
        </div>
      </div>
    );
  }
  return null;
}

function SafeTable({
  rows,
  columns,
  emptyLabel = "No records returned.",
  linkColumn,
}: {
  rows: Array<Record<string, unknown>>;
  columns: string[];
  emptyLabel?: string;
  linkColumn?: {
    key: string;
    href: (row: Record<string, unknown>) => string;
  };
}) {
  const uniqueRows = useMemo(() => rows.slice(0, 100), [rows]);
  return (
    <div className="overflow-hidden rounded border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-slate-50">
            <tr>
              {columns.map((column) => (
                <th key={column} className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase text-slate-500">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {uniqueRows.length === 0 ? (
              <tr>
                <td className="px-4 py-8 text-center text-sm text-slate-500" colSpan={columns.length}>
                  {emptyLabel}
                </td>
              </tr>
            ) : (
              uniqueRows.map((row, index) => (
                <tr key={String(row.id ?? row.bookingRef ?? index)}>
                  {columns.map((column) => {
                    const value = formatCell(row[column]);
                    const isLink = linkColumn?.key === column;
                    return (
                      <td key={column} className="max-w-80 truncate px-4 py-3 text-slate-700">
                        {isLink ? (
                          <Link className="font-medium text-slate-950 underline-offset-2 hover:underline" href={linkColumn.href(row)}>
                            {value}
                          </Link>
                        ) : (
                          value
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FilterInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-slate-500">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 h-9 w-full rounded border border-slate-200 px-3 text-sm outline-none focus:border-slate-400"
      />
    </label>
  );
}

function JsonPanel({ title, value }: { title: string; value: unknown }) {
  return (
    <section className="rounded border border-slate-200 bg-white p-5">
      <div className="mb-4 flex items-center gap-2">
        <Database className="h-4 w-4 text-slate-400" />
        <h2 className="text-sm font-semibold text-slate-950">{title}</h2>
      </div>
      <JsonBlock value={value} />
    </section>
  );
}

function JsonBlock({ value }: { value: unknown }) {
  return (
    <pre className="max-h-[520px] overflow-auto rounded bg-slate-950 p-4 text-xs leading-5 text-slate-100">
      {JSON.stringify(value, null, 2)}
    </pre>
  );
}

function MetaItem({ label, value }: { label: string; value: unknown }) {
  return (
    <div className="rounded border border-slate-200 bg-slate-50 p-3">
      <dt className="text-xs font-medium text-slate-500">{label}</dt>
      <dd className="mt-1 break-all text-slate-900">{formatCell(value)}</dd>
    </div>
  );
}

function formatCell(value: unknown): string {
  if (typeof value === "undefined" || value === null) return "-";
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return String(value);
  return JSON.stringify(value);
}
