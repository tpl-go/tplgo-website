"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  AlertCircle,
  ArrowRight,
  BadgeIndianRupee,
  Ban,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  CircleDot,
  Clock3,
  CreditCard,
  FileText,
  Filter,
  History,
  MessageSquareText,
  Network,
  Plane,
  RefreshCcw,
  Search,
  ShieldAlert,
  TicketCheck,
  UserRound,
  WalletCards,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  buildAdminQuery,
  getAdminBookingDetail,
  listAdminBookings,
  type AdminApiResult,
  type AdminBookingDetail,
  type AdminBookingOperationsQuery,
  type AdminBookingOperationalSummary,
  type AdminBookingPaymentSummary,
  type AdminBookingRefundSummary,
  type AdminBookingRow,
  type AdminBookingTimelineEvent,
  type AdminListQuery,
} from "../../lib/admin/adminApiClient";

const serviceTabs = [
  { key: "all", label: "All" },
  { key: "flight", label: "Flight" },
  { key: "hotel", label: "Hotel" },
  { key: "homestay", label: "Homestay" },
  { key: "package", label: "Package" },
  { key: "bus", label: "Bus" },
  { key: "train", label: "Train" },
  { key: "cab", label: "Cab" },
  { key: "cruise", label: "Cruise" },
  { key: "visa", label: "Visa" },
  { key: "insurance", label: "Insurance" },
  { key: "smart-planner", label: "Smart Planner" },
];

const serviceLabels: Record<string, string> = Object.fromEntries(serviceTabs.map((service) => [service.key, service.label]));

const disabledActions = [
  "Cancel",
  "Amend",
  "Reissue",
  "Retry supplier",
  "Resend voucher",
  "Manual status update",
];

type LoadState<T> = {
  loading: boolean;
  result: AdminApiResult<T> | null;
};

type RequestState<T> = {
  path: string;
  result: AdminApiResult<T> | null;
};

export function AdminBookingOperationsCenter() {
  const [query, setQuery] = useState<AdminBookingOperationsQuery>({ limit: 100, offset: 0 });
  const [activeService, setActiveService] = useState("all");

  const backendQuery = useMemo(() => toBackendBookingQuery(query, activeService), [query, activeService]);
  const backendPath = `/api/v1/admin/bookings${buildAdminQuery(backendQuery)}`;
  const [requestState, setRequestState] = useState<RequestState<AdminBookingRow[]>>({ path: backendPath, result: null });

  useEffect(() => {
    let active = true;
    listAdminBookings(backendQuery).then((result) => {
      if (active) setRequestState({ path: backendPath, result });
    });
    return () => {
      active = false;
    };
  }, [backendPath, backendQuery]);

  const loadState: LoadState<AdminBookingRow[]> = {
    loading: requestState.path !== backendPath || requestState.result === null,
    result: requestState.path === backendPath ? requestState.result : null,
  };
  const rawRows = useMemo(() => loadState.result?.ok ? loadState.result.data : [], [loadState.result]);
  const rows = useMemo(() => applyLocalBookingFilters(rawRows, query), [rawRows, query]);
  const overview = useMemo(() => buildBookingOverview(rows), [rows]);
  const serviceSummary = useMemo(() => buildServiceSummary(rawRows), [rawRows]);
  const pendingPayments = rows.filter(isPaymentIssue).slice(0, 5);
  const refundQueue = rows.filter(isRefundCandidate).slice(0, 5);
  const departures = rows.slice(0, 5);

  return (
    <div className="space-y-6">
      <StatusNotice loading={loadState.loading} result={loadState.result} />

      <section className="rounded border border-slate-200 bg-white p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-400">Booking operations</p>
            <h2 className="mt-1 text-lg font-semibold text-slate-950">Booking Operations Center</h2>
            <p className="mt-1 text-sm text-slate-500">Search, triage, and inspect backend booking records across OTA services.</p>
          </div>
          <div className="rounded bg-slate-100 px-3 py-2 text-xs font-medium text-slate-600">
            Read-only operations foundation
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <FilterInput label="Booking ID / search" value={query.search ?? ""} onChange={(search) => setQuery((current) => ({ ...current, search }))} />
          <FilterInput label="Customer mobile / email" value={query.customer ?? ""} onChange={(customer) => setQuery((current) => ({ ...current, customer }))} />
          <FilterInput label="Booking status" value={query.status ?? ""} onChange={(status) => setQuery((current) => ({ ...current, status }))} />
          <FilterInput label="Date from" type="date" value={query.dateFrom ?? ""} onChange={(dateFrom) => setQuery((current) => ({ ...current, dateFrom }))} />
          <FilterInput label="Date to" type="date" value={query.dateTo ?? ""} onChange={(dateTo) => setQuery((current) => ({ ...current, dateTo }))} />
          <FilterInput label="Payment state" value={query.paymentState ?? ""} onChange={(paymentState) => setQuery((current) => ({ ...current, paymentState }))} />
          <FilterInput label="Refund state" value={query.refundState ?? ""} onChange={(refundState) => setQuery((current) => ({ ...current, refundState }))} />
          <div className="flex items-end gap-2">
            <button
              type="button"
              onClick={() => setQuery({ limit: 100, offset: 0 })}
              className="flex h-9 items-center gap-2 rounded border border-slate-200 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <RefreshCcw className="h-4 w-4" />
              Reset
            </button>
            <div className="flex h-9 items-center gap-2 rounded bg-slate-950 px-3 text-sm font-medium text-white">
              <Filter className="h-4 w-4" />
              Live filters
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard icon={BookOpen} label="Total bookings" value={overview.total} detail="Current result set" />
        <MetricCard icon={CalendarDays} label="Upcoming" value={overview.upcoming} detail="Upcoming/open status" />
        <MetricCard icon={Ban} label="Cancelled" value={overview.cancelled} detail="Cancelled records" />
        <MetricCard icon={RefreshCcw} label="Refund pending" value={overview.refundPending} detail="Needs refund API link" />
        <MetricCard icon={ShieldAlert} label="Payment pending/failed" value={overview.paymentIssues} detail="Payment status watch" />
      </section>

      <section className="rounded border border-slate-200 bg-white p-4">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-400">Service view</p>
            <h2 className="mt-1 text-sm font-semibold text-slate-950">Service-wise booking summary</h2>
          </div>
          <span className="rounded bg-slate-100 px-2 py-1 text-xs font-medium text-slate-500">Backend list API</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {serviceTabs.map((service) => {
            const active = activeService === service.key;
            const count = service.key === "all" ? rawRows.length : serviceSummary[service.key] ?? 0;
            return (
              <button
                key={service.key}
                type="button"
                onClick={() => setActiveService(service.key)}
                className={[
                  "flex h-9 items-center gap-2 rounded border px-3 text-sm font-medium",
                  active ? "border-slate-950 bg-slate-950 text-white" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
                ].join(" ")}
              >
                {service.label}
                <span className={active ? "text-slate-300" : "text-slate-400"}>{count}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <QueuePanel title="Today's departures / check-ins" icon={Plane} rows={departures} emptyLabel="No booking records returned for this queue." />
        <QueuePanel title="Pending payment / failure queue" icon={CreditCard} rows={pendingPayments} emptyLabel="No payment pending or failed bookings in this result set." />
        <QueuePanel title="Refund / cancellation queue" icon={RefreshCcw} rows={refundQueue} emptyLabel="No cancellation or refund candidates in this result set." />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_0.42fr]">
        <div className="overflow-hidden rounded border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-5 py-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase text-slate-400">Bookings table</p>
                <h2 className="mt-1 text-sm font-semibold text-slate-950">Operational booking records</h2>
              </div>
              <span className="text-xs text-slate-500">{rows.length} visible</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50">
                <tr>
                  {["booking", "service", "customer", "travel date", "amount", "payment", "booking status", "SLA", "action"].map((column) => (
                    <th key={column} className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase text-slate-500">
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.length === 0 ? (
                  <tr>
                    <td className="px-4 py-10 text-center text-sm text-slate-500" colSpan={9}>
                      {loadState.loading ? "Loading bookings" : "No bookings match the selected filters."}
                    </td>
                  </tr>
                ) : (
                  rows.slice(0, 100).map((booking) => (
                    <tr key={booking.id} className="hover:bg-slate-50">
                      <td className="min-w-48 px-4 py-3">
                        <Link className="font-semibold text-slate-950 underline-offset-2 hover:underline" href={`/admin/bookings/${encodeURIComponent(getBookingIdentifier(booking))}`}>
                          {getBookingIdentifier(booking)}
                        </Link>
                        <p className="mt-1 text-xs text-slate-500">{formatCell(booking.id)}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-700">{getBookingServiceLabel(booking)}</td>
                      <td className="min-w-40 px-4 py-3 text-slate-700">
                        <p>{formatCell(getBookingCustomer(booking))}</p>
                        <p className="mt-1 text-xs text-slate-500">{formatCell(getBookingEmail(booking))}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-700">{formatCell(getTravelDate(booking))}</td>
                      <td className="px-4 py-3 text-slate-700">{formatMoney(getBookingAmount(booking), getBookingCurrency(booking))}</td>
                      <td className="px-4 py-3"><StatusPill value={booking.paymentStatus ?? getNestedString(booking, "paymentStatus")} /></td>
                      <td className="px-4 py-3"><StatusPill value={booking.bookingStatus ?? booking.status} /></td>
                      <td className="px-4 py-3"><SlaMarker booking={booking} /></td>
                      <td className="px-4 py-3">
                        <Link className="inline-flex h-8 items-center gap-2 rounded bg-slate-950 px-3 text-xs font-medium text-white" href={`/admin/bookings/${encodeURIComponent(getBookingIdentifier(booking))}`}>
                          Quick view
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-4">
          <PlaceholderPanel icon={ShieldAlert} title="Exception / SLA watchlist" detail="Needs supplier SLA, failure reason, and escalation read model APIs before live alerting can be enabled." />
          <PlaceholderPanel icon={MessageSquareText} title="Internal ops notes" detail="Needs audited internal notes API. Notes are intentionally disabled in this read-only phase." />
        </div>
      </section>
    </div>
  );
}

export function AdminBookingOperationsWorkspace({ bookingId }: { bookingId: string }) {
  const path = `/api/v1/admin/bookings/${bookingId}`;
  const [requestState, setRequestState] = useState<RequestState<AdminBookingDetail>>({ path, result: null });

  useEffect(() => {
    let active = true;
    getAdminBookingDetail(bookingId).then((result) => {
      if (active) setRequestState({ path, result });
    });
    return () => {
      active = false;
    };
  }, [bookingId, path]);

  const loadState: LoadState<AdminBookingDetail> = {
    loading: requestState.path !== path || requestState.result === null,
    result: requestState.path === path ? requestState.result : null,
  };
  const booking = loadState.result?.ok ? loadState.result.data.booking : null;
  const detail = loadState.result?.ok ? loadState.result.data.detail : null;
  const normalized = detail?.normalizedSummary ?? {};
  const timeline = booking ? buildTimelineEvents(booking, normalized) : [];
  const paymentSummary = booking ? buildPaymentSummary(booking, normalized) : null;
  const refundSummary = booking ? buildRefundSummary(booking, normalized) : null;
  const operationalSummary = booking ? buildOperationalSummary(booking, timeline, paymentSummary, refundSummary) : null;

  return (
    <div className="space-y-6">
      <StatusNotice loading={loadState.loading} result={loadState.result} />

      {booking ? (
        <>
          <section className="rounded border border-slate-200 bg-white p-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase text-slate-400">Booking workspace</p>
                <h2 className="mt-1 text-xl font-semibold text-slate-950">{getBookingIdentifier(booking)}</h2>
                <p className="mt-2 text-sm text-slate-500">{getBookingServiceLabel(booking)} · {formatCell(getBookingCustomer(booking))}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <StatusPill value={booking.bookingStatus ?? booking.status} />
                <StatusPill value={booking.paymentStatus} />
              </div>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <SummaryTile icon={BookOpen} label="Service" value={getBookingServiceLabel(booking)} />
            <SummaryTile icon={CalendarDays} label="Travel date" value={formatCell(getTravelDate(booking))} />
            <SummaryTile icon={BadgeIndianRupee} label="Amount" value={formatMoney(getBookingAmount(booking), getBookingCurrency(booking))} />
            <SummaryTile icon={CreditCard} label="Payment ref" value={formatCell(booking.paymentRef)} />
          </section>

          {operationalSummary ? (
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <IntelligenceCard label="Risk Score" value="Needs API" detail="Risk model is intentionally disabled until backend signals exist." tone="pending" />
              <IntelligenceCard label="Automation Status" value={operationalSummary.automationStatus} detail="Derived from current booking/payment fields." />
              <IntelligenceCard label="Sync Status" value={operationalSummary.syncStatus} detail="Supplier sync read model pending." tone="pending" />
              <IntelligenceCard label="Documents Status" value={operationalSummary.documentsStatus} detail="Ticket/voucher signals only when backend exposes them." />
              <IntelligenceCard label="Provider Status" value={operationalSummary.providerStatus} detail="Provider health API pending." tone="pending" />
              <IntelligenceCard label="Notification Status" value={operationalSummary.notificationStatus} detail="Notification delivery API pending." tone="pending" />
              <IntelligenceCard label="Wallet Status" value={operationalSummary.walletStatus} detail="Wallet usage derived only from available payload fields." />
              <IntelligenceCard label="Manual Review" value={requiresManualReview(booking) ? "Recommended" : "Not signalled"} detail="Based on visible status/refund/payment fields." tone={requiresManualReview(booking) ? "warn" : "neutral"} />
            </section>
          ) : null}

          <section className="grid gap-4 xl:grid-cols-[1fr_0.42fr]">
            <div className="space-y-4">
              <AccordionPanel title="Overview" icon={BookOpen} defaultOpen>
                <DescriptionGrid
                  items={[
                    ["Booking ref", getBookingIdentifier(booking)],
                    ["Service", getBookingServiceLabel(booking)],
                    ["Booking status", booking.bookingStatus ?? booking.status],
                    ["Payment status", booking.paymentStatus],
                    ["Route", getNestedString(booking, "routeLabel") ?? getNestedString(normalized, "route")],
                    ["Raw mapper", detail?.mapperVersion],
                  ]}
                />
              </AccordionPanel>

              <AccordionPanel title="Customer" icon={UserRound} defaultOpen>
                {getCustomerWorkspaceId(booking) ? (
                  <Link
                    className="mb-4 inline-flex h-9 items-center gap-2 rounded bg-slate-950 px-3 text-sm font-medium text-white"
                    href={`/admin/customers/${encodeURIComponent(getCustomerWorkspaceId(booking) ?? "")}`}
                  >
                    Open customer workspace
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                ) : null}
                <DescriptionGrid
                  items={[
                    ["Mobile", getBookingCustomer(booking)],
                    ["Email", getBookingEmail(booking)],
                    ["User id", booking.userId],
                    ["Customer source", getNestedString(normalized, "customerSource") ?? "Existing booking read model"],
                  ]}
                />
              </AccordionPanel>

              <AccordionPanel title="Travellers" icon={TicketCheck}>
                <DescriptionGrid
                  items={[
                    ["Lead traveller", getNestedString(booking, "leadTraveller.name") ?? getNestedString(booking, "travellerName")],
                    ["Travellers", getNestedString(booking, "travellers") ?? getNestedString(booking, "passengers")],
                    ["Traveller count", getNestedString(booking, "travellerCount") ?? getNestedString(normalized, "travellerCount")],
                    ["Travel date", getTravelDate(booking)],
                  ]}
                />
              </AccordionPanel>

              <AccordionPanel title="Timeline" icon={History} defaultOpen>
                <TimelineReadModel events={timeline} />
              </AccordionPanel>

              <AccordionPanel title="Payment" icon={CreditCard} defaultOpen>
                <DescriptionGrid
                  items={[
                    ["Amount", paymentSummary?.amount],
                    ["Payment status", paymentSummary?.status],
                    ["Gateway reference", paymentSummary?.gatewayReference],
                    ["Payment attempts", paymentSummary?.attempts],
                    ["Wallet used", paymentSummary?.walletUsed],
                    ["Coupon used", paymentSummary?.couponUsed],
                  ]}
                />
              </AccordionPanel>

              <AccordionPanel title="Refund" icon={RefreshCcw}>
                <DescriptionGrid
                  items={[
                    ["Refund status", refundSummary?.status],
                    ["Refund amount", refundSummary?.amount],
                    ["Refund method", refundSummary?.method],
                    ["Refund reference", refundSummary?.reference],
                  ]}
                />
                <TimelineReadModel events={refundSummary?.timeline ?? []} compact />
              </AccordionPanel>

              <AccordionPanel title="Wallet" icon={WalletCards}>
                <DescriptionGrid
                  items={[
                    ["Wallet used", paymentSummary?.walletUsed],
                    ["Wallet status", operationalSummary?.walletStatus],
                    ["Wallet ledger", "Needs wallet-ledger admin join API"],
                    ["Wallet refund", getNestedString(booking, "refund.refundMethod") === "refund_wallet" ? "Signal present" : "No wallet refund signal"],
                  ]}
                />
              </AccordionPanel>

              <AccordionPanel title="Documents" icon={FileText}>
                <DescriptionGrid
                  items={[
                    ["Ticket", getNestedString(booking, "ticketUrl") ? "Available" : "Not exposed by current admin detail API"],
                    ["Voucher", getNestedString(booking, "voucherUrl") ? "Available" : "Not exposed by current admin detail API"],
                    ["Documents status", operationalSummary?.documentsStatus],
                    ["Resend voucher", "Disabled until audited notification/document API exists"],
                  ]}
                />
              </AccordionPanel>

              <AccordionPanel title="Internal Notes" icon={MessageSquareText}>
                <PlaceholderPanel icon={MessageSquareText} title="Read-only notes foundation" detail="Audited internal notes API is pending. This phase does not create local or fake note storage." />
              </AccordionPanel>

              <AccordionPanel title="Raw Payload" icon={FileText}>
                <p className="text-sm text-slate-500">
                  Full payload is permission-gated by <span className="font-mono text-xs">bookings.raw_payload.read</span>.
                </p>
                {detail?.rawPayload ? (
                  <JsonBlock value={detail.rawPayload} />
                ) : (
                  <DescriptionGrid
                    items={[
                      ["Hash", detail?.rawPayloadHash],
                      ["Size bytes", detail?.rawPayloadSizeBytes],
                      ["Mapper", detail?.mapperVersion],
                      ["Schema", detail?.rawPayloadSchema ?? "Not set"],
                    ]}
                  />
                )}
              </AccordionPanel>
            </div>

            <div className="space-y-4">
              <AccordionPanel title="Operations" icon={TicketCheck} defaultOpen>
                <div className="space-y-2">
                  {disabledActions.map((action) => (
                    <button
                      key={action}
                      type="button"
                      disabled
                      className="flex h-10 w-full items-center justify-between rounded border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-400"
                    >
                      {action}
                      <span className="text-[10px] font-semibold uppercase">Needs API</span>
                    </button>
                  ))}
                </div>
              </AccordionPanel>

              <SlaExceptionPanel booking={booking} paymentSummary={paymentSummary} refundSummary={refundSummary} />
              <PlaceholderPanel icon={Network} title="Ecosystem readiness" detail="Workspace remains modular for future TPL Creators, TPL Marketplace, and TPL Local Life operations without implementing their business logic." />
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}

function StatusNotice<T>({ loading, result }: LoadState<T>) {
  if (loading) {
    return <div className="rounded border border-slate-200 bg-white p-4 text-sm text-slate-500">Loading booking operations data</div>;
  }
  if (!result || result.ok) return null;
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

function FilterInput({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-slate-500">{label}</span>
      <div className="relative mt-1">
        {type === "text" ? <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" /> : null}
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={["h-9 w-full rounded border border-slate-200 text-sm outline-none focus:border-slate-400", type === "text" ? "pl-9 pr-3" : "px-3"].join(" ")}
        />
      </div>
    </label>
  );
}

function MetricCard({ icon: Icon, label, value, detail }: { icon: LucideIcon; label: string; value: number; detail: string }) {
  return (
    <div className="rounded border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-950">{label}</p>
          <p className="mt-1 text-xs text-slate-500">{detail}</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded bg-slate-100 text-slate-600">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="mt-5 text-3xl font-semibold text-slate-950">{value.toLocaleString("en-IN")}</p>
    </div>
  );
}

function QueuePanel({ title, icon: Icon, rows, emptyLabel }: { title: string; icon: LucideIcon; rows: AdminBookingRow[]; emptyLabel: string }) {
  return (
    <section className="rounded border border-slate-200 bg-white p-5">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded bg-slate-100 text-slate-600">
          <Icon className="h-4 w-4" />
        </div>
        <h2 className="text-sm font-semibold text-slate-950">{title}</h2>
      </div>
      {rows.length === 0 ? (
        <div className="rounded border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">{emptyLabel}</div>
      ) : (
        <div className="divide-y divide-slate-100">
          {rows.map((booking) => (
            <div key={booking.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
              <div className="min-w-0">
                <Link className="truncate text-sm font-semibold text-slate-950 underline-offset-2 hover:underline" href={`/admin/bookings/${encodeURIComponent(getBookingIdentifier(booking))}`}>
                  {getBookingIdentifier(booking)}
                </Link>
                <p className="mt-1 truncate text-xs text-slate-500">{getBookingServiceLabel(booking)} · {formatCell(getBookingCustomer(booking))}</p>
              </div>
              <StatusPill value={booking.bookingStatus ?? booking.paymentStatus ?? booking.status} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function PlaceholderPanel({ icon: Icon, title, detail }: { icon: LucideIcon; title: string; detail: string }) {
  return (
    <section className="rounded border border-dashed border-slate-300 bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded bg-slate-100 text-slate-600">
          <Icon className="h-5 w-5" />
        </div>
        <span className="rounded bg-slate-100 px-2 py-1 text-[10px] font-semibold uppercase text-slate-500">Coming soon</span>
      </div>
      <h2 className="mt-4 text-sm font-semibold text-slate-950">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-500">{detail}</p>
    </section>
  );
}

function SummaryTile({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="rounded border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded bg-slate-100 text-slate-600">
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-500">{label}</p>
          <p className="mt-1 truncate text-sm font-semibold text-slate-950">{value}</p>
        </div>
      </div>
    </div>
  );
}

function IntelligenceCard({
  label,
  value,
  detail,
  tone = "neutral",
}: {
  label: string;
  value: string;
  detail: string;
  tone?: "neutral" | "pending" | "warn";
}) {
  const classes = tone === "warn"
    ? "border-amber-200 bg-amber-50"
    : tone === "pending"
      ? "border-dashed border-slate-300 bg-white"
      : "border-slate-200 bg-white";
  return (
    <div className={`rounded border p-4 ${classes}`}>
      <p className="text-xs font-semibold uppercase text-slate-400">{label}</p>
      <p className="mt-2 text-sm font-semibold text-slate-950">{value}</p>
      <p className="mt-2 text-xs leading-5 text-slate-500">{detail}</p>
    </div>
  );
}

function AccordionPanel({ title, icon: Icon, children, defaultOpen = false }: { title: string; icon: LucideIcon; children: ReactNode; defaultOpen?: boolean }) {
  return (
    <details className="group rounded border border-slate-200 bg-white p-5" open={defaultOpen}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
        <span className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-slate-400" />
          <span className="text-sm font-semibold text-slate-950">{title}</span>
        </span>
        <ChevronDown className="h-4 w-4 text-slate-400 transition group-open:rotate-180" />
      </summary>
      <div className="mt-4">{children}</div>
    </details>
  );
}

function DescriptionGrid({ items }: { items: Array<[string, unknown]> }) {
  return (
    <dl className="grid gap-3 text-sm md:grid-cols-2">
      {items.map(([label, value]) => (
        <div key={label} className="rounded border border-slate-200 bg-slate-50 p-3">
          <dt className="text-xs font-medium text-slate-500">{label}</dt>
          <dd className="mt-1 break-words text-slate-900">{formatCell(value)}</dd>
        </div>
      ))}
    </dl>
  );
}

function TimelineReadModel({ events, compact = false }: { events: AdminBookingTimelineEvent[]; compact?: boolean }) {
  const rows = events.length ? events : [{
    key: "timeline-unavailable",
    label: "Timeline unavailable",
    status: "unavailable" as const,
    detail: "Booking event API has not exposed timeline records for this booking yet.",
    source: "future" as const,
  }];
  return (
    <div className="space-y-3">
      {rows.map((event, index) => (
        <div key={event.key} className="flex gap-3">
          <div className="flex flex-col items-center">
            <div className={["flex h-7 w-7 items-center justify-center rounded-full", event.status === "observed" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"].join(" ")}>
              {event.status === "observed" ? <CheckCircle2 className="h-4 w-4" /> : <CircleDot className="h-3.5 w-3.5" />}
            </div>
            {index < rows.length - 1 ? <div className="h-8 w-px bg-slate-200" /> : null}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold text-slate-950">{event.label}</p>
              <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-slate-500">{event.status}</span>
            </div>
            <p className="mt-1 text-sm text-slate-500">{event.detail}</p>
            {!compact && event.occurredAt ? <p className="mt-1 text-xs text-slate-400">{event.occurredAt}</p> : null}
          </div>
        </div>
      ))}
    </div>
  );
}

function SlaExceptionPanel({
  booking,
  paymentSummary,
  refundSummary,
}: {
  booking: AdminBookingRow;
  paymentSummary: AdminBookingPaymentSummary | null;
  refundSummary: AdminBookingRefundSummary | null;
}) {
  const items = [
    ["Supplier Delay", "Needs supplier SLA API", "future"],
    ["Payment Failure", includesAny(paymentSummary?.status, ["fail", "error"]) ? "Signal present" : "No visible signal", includesAny(paymentSummary?.status, ["fail", "error"]) ? "warn" : "neutral"],
    ["Refund Delay", includesAny(refundSummary?.status, ["pending", "processing"]) ? "Monitor" : "No visible signal", includesAny(refundSummary?.status, ["pending", "processing"]) ? "warn" : "neutral"],
    ["Booking Stuck", includesAny(booking.bookingStatus ?? booking.status, ["pending", "processing"]) ? "Monitor" : "No visible signal", includesAny(booking.bookingStatus ?? booking.status, ["pending", "processing"]) ? "warn" : "neutral"],
    ["Pending Supplier", "Needs supplier/provider read model", "future"],
    ["High Priority", "Needs priority/risk API", "future"],
    ["Manual Review", requiresManualReview(booking) ? "Recommended" : "No visible signal", requiresManualReview(booking) ? "warn" : "neutral"],
  ];
  return (
    <AccordionPanel title="SLA / Exceptions" icon={ShieldAlert} defaultOpen>
      <div className="space-y-2">
        {items.map(([label, detail, tone]) => (
          <div key={label} className="flex items-center justify-between gap-3 rounded border border-slate-200 bg-slate-50 p-3">
            <div>
              <p className="text-sm font-semibold text-slate-950">{label}</p>
              <p className="mt-1 text-xs text-slate-500">{detail}</p>
            </div>
            <span className={[
              "rounded px-2 py-1 text-[10px] font-semibold uppercase",
              tone === "warn" ? "bg-amber-100 text-amber-700" : tone === "future" ? "bg-slate-200 text-slate-500" : "bg-emerald-50 text-emerald-700",
            ].join(" ")}>
              {tone === "future" ? "Needs API" : tone === "warn" ? "Watch" : "OK"}
            </span>
          </div>
        ))}
      </div>
    </AccordionPanel>
  );
}

function JsonBlock({ value }: { value: unknown }) {
  return (
    <pre className="mt-4 max-h-[520px] overflow-auto rounded bg-slate-950 p-4 text-xs leading-5 text-slate-100">
      {JSON.stringify(value, null, 2)}
    </pre>
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
    <span className={`inline-flex max-w-40 items-center gap-1 rounded px-2 py-1 text-xs font-medium ${classes}`}>
      <CircleDot className="h-3 w-3 shrink-0" />
      <span className="truncate">{text === "-" ? "unknown" : text}</span>
    </span>
  );
}

function SlaMarker({ booking }: { booking: AdminBookingRow }) {
  const issue = isPaymentIssue(booking) || isRefundCandidate(booking);
  return (
    <span className={["inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium", issue ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-600"].join(" ")}>
      <Clock3 className="h-3 w-3" />
      {issue ? "Watch" : "Normal"}
    </span>
  );
}

function toBackendBookingQuery(query: AdminBookingOperationsQuery, activeService: string): AdminListQuery {
  const customer = query.customer?.trim();
  return {
    limit: query.limit ?? 100,
    offset: query.offset ?? 0,
    ...(activeService !== "all" ? { service: activeService } : {}),
    ...(query.status?.trim() ? { status: query.status.trim() } : {}),
    ...(customer && /^[0-9+ -]+$/.test(customer) ? { mobile: customer.replace(/\s+/g, "") } : {}),
    ...(query.dateFrom?.trim() ? { dateFrom: query.dateFrom.trim() } : {}),
    ...(query.dateTo?.trim() ? { dateTo: query.dateTo.trim() } : {}),
  };
}

function applyLocalBookingFilters(rows: AdminBookingRow[], query: AdminBookingOperationsQuery): AdminBookingRow[] {
  const search = query.search?.trim().toLowerCase();
  const customer = query.customer?.trim().toLowerCase();
  const paymentState = query.paymentState?.trim().toLowerCase();
  const refundState = query.refundState?.trim().toLowerCase();
  return rows.filter((row) => {
    const haystack = JSON.stringify({
      id: row.id,
      bookingRef: row.bookingRef,
      mobile: row.mobile,
      paymentRef: row.paymentRef,
      customer: getBookingCustomer(row),
      email: getBookingEmail(row),
      compatBookingItem: row.compatBookingItem,
    }).toLowerCase();
    if (search && !haystack.includes(search)) return false;
    if (customer && !haystack.includes(customer)) return false;
    if (paymentState && !String(row.paymentStatus ?? getNestedString(row, "paymentStatus") ?? "").toLowerCase().includes(paymentState)) return false;
    if (refundState && !inferRefundState(row).toLowerCase().includes(refundState)) return false;
    return true;
  });
}

function buildBookingOverview(rows: AdminBookingRow[]) {
  return {
    total: rows.length,
    upcoming: rows.filter((row) => includesAny(row.status ?? row.bookingStatus, ["upcoming", "confirmed", "open", "created"])).length,
    cancelled: rows.filter((row) => includesAny(row.status ?? row.bookingStatus, ["cancel"])).length,
    refundPending: rows.filter(isRefundCandidate).length,
    paymentIssues: rows.filter(isPaymentIssue).length,
  };
}

function buildServiceSummary(rows: AdminBookingRow[]): Record<string, number> {
  return rows.reduce<Record<string, number>>((summary, row) => {
    const service = getBookingService(row);
    summary[service] = (summary[service] ?? 0) + 1;
    return summary;
  }, {});
}

function buildTimelineEvents(booking: AdminBookingRow, normalized: Record<string, unknown>): AdminBookingTimelineEvent[] {
  const events: AdminBookingTimelineEvent[] = [];
  const createdAt = getNestedString(booking, "createdAt") ?? getNestedString(normalized, "createdAt");
  events.push({
    key: "booking-created",
    label: "Booking Created",
    status: "observed",
    occurredAt: createdAt,
    detail: createdAt ? "Booking record exists in admin read model." : "Booking record exists; created timestamp is not exposed by current admin API.",
    source: "booking",
  });

  const paymentStatus = booking.paymentStatus ?? getNestedString(booking, "paymentStatus");
  if (booking.paymentRef || paymentStatus) {
    events.push({
      key: "payment-state",
      label: paymentStatus && includesAny(paymentStatus, ["success", "paid", "captured"]) ? "Payment Success" : paymentStatus && includesAny(paymentStatus, ["fail", "error"]) ? "Payment Failure" : "Payment Initiated",
      status: "observed",
      detail: `Payment status: ${formatCell(paymentStatus)}. Reference: ${formatCell(booking.paymentRef)}.`,
      source: "payment",
    });
  } else {
    events.push(unavailableEvent("payment-initiated", "Payment Initiated", "Payment read model is not linked for this booking yet.", "payment"));
  }

  if (includesAny(booking.bookingStatus ?? booking.status, ["confirm", "success", "completed", "upcoming"])) {
    events.push({
      key: "confirmation-generated",
      label: "Confirmation Generated",
      status: "observed",
      detail: `Booking status: ${formatCell(booking.bookingStatus ?? booking.status)}.`,
      source: "booking",
    });
  } else {
    events.push(unavailableEvent("confirmation-generated", "Confirmation Generated", "Confirmation event is not exposed by current admin API.", "booking"));
  }

  const hasTicket = Boolean(getNestedString(booking, "ticketUrl") ?? getNestedString(booking, "voucherUrl"));
  events.push(hasTicket
    ? {
        key: "document-generated",
        label: "Voucher/Ticket Generated",
        status: "observed",
        detail: "Ticket or voucher URL is present in the booking read model.",
        source: "document",
      }
    : unavailableEvent("document-generated", "Voucher/Ticket Generated", "Document generation state is not exposed by current admin API.", "document"));

  events.push(unavailableEvent("supplier-sync", "Supplier Sync", "Supplier/provider sync event API is pending.", "supplier"));

  const refundStatus = inferRefundState(booking);
  if (refundStatus !== "No refund signal") {
    events.push({
      key: "refund-state",
      label: includesAny(refundStatus, ["complete", "success", "processed"]) ? "Refund Completed" : "Refund Initiated",
      status: "observed",
      detail: refundStatus,
      source: "refund",
    });
  } else {
    events.push(unavailableEvent("refund-initiated", "Refund Initiated", "No refund signal is available in current booking detail.", "refund"));
  }

  if (includesAny(booking.bookingStatus ?? booking.status, ["cancel"])) {
    events.push({
      key: "cancellation",
      label: "Cancellation",
      status: "observed",
      detail: `Cancellation signal from status: ${formatCell(booking.bookingStatus ?? booking.status)}.`,
      source: "booking",
    });
  } else {
    events.push(unavailableEvent("cancellation", "Cancellation", "No cancellation signal is available in current booking detail.", "booking"));
  }

  events.push({
    key: "manual-admin-event",
    label: "Manual Admin Event",
    status: "future",
    detail: "Future audited admin event API placeholder.",
    source: "admin",
  });
  events.push({
    key: "smart-planner-event",
    label: "Smart Planner Events",
    status: getBookingService(booking) === "smart-planner" ? "unavailable" : "future",
    detail: getBookingService(booking) === "smart-planner" ? "Smart Planner timeline API is not exposed yet." : "Reserved for Smart Planner bookings.",
    source: "planner",
  });

  return events;
}

function buildPaymentSummary(booking: AdminBookingRow, normalized: Record<string, unknown>): AdminBookingPaymentSummary {
  return {
    amount: formatMoney(getBookingAmount(booking), getBookingCurrency(booking)),
    status: formatCell(booking.paymentStatus ?? getNestedString(booking, "paymentStatus")),
    gatewayReference: formatCell(
      booking.paymentRef ??
      getNestedString(booking, "gatewayPaymentId") ??
      getNestedString(normalized, "gatewayPaymentId") ??
      getNestedString(normalized, "paymentRef")
    ),
    attempts: formatCell(getNestedString(normalized, "paymentAttempts") ?? getNestedString(booking, "paymentAttempts") ?? "Needs payment attempts API"),
    walletUsed: formatCell(
      getNestedString(booking, "walletUsed") ??
      getNestedString(booking, "compatBookingItem.walletUsed") ??
      getNestedString(normalized, "walletUsed") ??
      "No wallet signal"
    ),
    couponUsed: formatCell(
      getNestedString(booking, "couponCode") ??
      getNestedString(booking, "compatBookingItem.couponCode") ??
      getNestedString(normalized, "couponCode") ??
      "No coupon signal"
    ),
  };
}

function buildRefundSummary(booking: AdminBookingRow, normalized: Record<string, unknown>): AdminBookingRefundSummary {
  const status = inferRefundState(booking);
  const amount = getNestedString(booking, "refund.amount") ?? getNestedString(normalized, "refundAmount");
  const method = getNestedString(booking, "refund.method") ?? getNestedString(booking, "refund.refundMethod") ?? getNestedString(normalized, "refundMethod");
  const reference = getNestedString(booking, "refund.refundRef") ?? getNestedString(normalized, "refundRef");
  const timeline = status === "No refund signal"
    ? [unavailableEvent("refund-timeline-unavailable", "Refund Timeline", "No refund timeline is available from current read APIs.", "refund")]
    : [{
        key: "refund-status",
        label: includesAny(status, ["complete", "success", "processed"]) ? "Refund Completed" : "Refund Initiated",
        status: "observed" as const,
        detail: status,
        source: "refund" as const,
      }];
  return {
    status,
    amount: amount ? formatMoney(amount, getBookingCurrency(booking)) : "No refund amount signal",
    method: method ?? "No refund method signal",
    reference: reference ?? "No refund reference signal",
    timeline,
  };
}

function buildOperationalSummary(
  booking: AdminBookingRow,
  timeline: AdminBookingTimelineEvent[],
  paymentSummary: AdminBookingPaymentSummary | null,
  refundSummary: AdminBookingRefundSummary | null
): AdminBookingOperationalSummary {
  const observedTimelineCount = timeline.filter((event) => event.status === "observed").length;
  return {
    riskScore: "needs_api",
    automationStatus: observedTimelineCount > 2 ? "Partially observable" : "Limited signals",
    syncStatus: timeline.some((event) => event.key === "supplier-sync" && event.status === "observed") ? "Synced" : "Needs provider API",
    providerStatus: "Needs provider API",
    documentsStatus: timeline.some((event) => event.key === "document-generated" && event.status === "observed") ? "Document signal present" : "No document signal",
    notificationStatus: "Needs notification API",
    walletStatus: paymentSummary?.walletUsed && paymentSummary.walletUsed !== "No wallet signal" ? "Wallet signal present" : refundSummary?.method === "refund_wallet" ? "Wallet refund signal" : "No wallet signal",
  };
}

function unavailableEvent(key: string, label: string, detail: string, source: AdminBookingTimelineEvent["source"]): AdminBookingTimelineEvent {
  return {
    key,
    label,
    status: "unavailable",
    detail,
    source,
  };
}

function isPaymentIssue(row: AdminBookingRow): boolean {
  return includesAny(row.paymentStatus ?? getNestedString(row, "paymentStatus"), ["pending", "fail", "error"]);
}

function isRefundCandidate(row: AdminBookingRow): boolean {
  return includesAny(row.bookingStatus ?? row.status, ["cancel", "refund"]) || includesAny(getNestedString(row, "refundStatus"), ["pending", "requested", "processing"]);
}

function requiresManualReview(row: AdminBookingRow): boolean {
  return isPaymentIssue(row) ||
    isRefundCandidate(row) ||
    includesAny(row.bookingStatus ?? row.status, ["pending", "processing", "manual", "review", "stuck"]);
}

function includesAny(value: unknown, needles: string[]): boolean {
  const text = String(value ?? "").toLowerCase();
  return needles.some((needle) => text.includes(needle));
}

function getBookingIdentifier(booking: AdminBookingRow): string {
  return formatCell(booking.bookingRef ?? booking.id);
}

function getBookingService(booking: AdminBookingRow): string {
  return formatCell(booking.compatBookingItem?.serviceType ?? booking.compatBookingItem?.type ?? booking.serviceType ?? booking.type).toLowerCase();
}

function getBookingServiceLabel(booking: AdminBookingRow): string {
  const service = getBookingService(booking);
  return serviceLabels[service] ?? titleCase(service);
}

function getBookingCustomer(booking: AdminBookingRow): unknown {
  return booking.mobile ?? getNestedString(booking, "leadTraveller.mobile") ?? getNestedString(booking, "customer.mobile");
}

function getCustomerWorkspaceId(booking: AdminBookingRow): string | null {
  const id = booking.userId ?? booking.mobile ?? getNestedString(booking, "customer.id") ?? getNestedString(booking, "leadTraveller.mobile");
  return typeof id === "string" && id.trim() ? id : null;
}

function getBookingEmail(booking: AdminBookingRow): unknown {
  return getNestedString(booking, "customer.email") ?? getNestedString(booking, "leadTraveller.email") ?? getNestedString(booking, "email");
}

function getTravelDate(booking: AdminBookingRow): unknown {
  return getNestedString(booking, "compatBookingItem.travelDate") ??
    getNestedString(booking, "compatBookingItem.checkIn") ??
    getNestedString(booking, "compatBookingItem.departureDate") ??
    getNestedString(booking, "travelDate") ??
    getNestedString(booking, "bookingDate");
}

function getBookingAmount(booking: AdminBookingRow): unknown {
  return getNestedString(booking, "compatBookingItem.amount") ??
    getNestedString(booking, "compatBookingItem.total") ??
    getNestedString(booking, "amount") ??
    getNestedString(booking, "totalAmount");
}

function getBookingCurrency(booking: AdminBookingRow): unknown {
  return getNestedString(booking, "compatBookingItem.currency") ?? getNestedString(booking, "currency") ?? "INR";
}

function inferRefundState(booking: AdminBookingRow): string {
  const explicit = getNestedString(booking, "refundStatus");
  if (explicit) return explicit;
  return isRefundCandidate(booking) ? "Review required" : "No refund signal";
}

function getNestedString(input: unknown, path: string): string | undefined {
  const value = getNestedValue(input, path);
  return typeof value === "string" || typeof value === "number" || typeof value === "boolean" ? String(value) : undefined;
}

function getNestedValue(input: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((current, key) => {
    if (!current || typeof current !== "object" || Array.isArray(current)) return undefined;
    return (current as Record<string, unknown>)[key];
  }, input);
}

function formatMoney(amount: unknown, currency: unknown): string {
  const value = formatCell(amount);
  const currencyText = typeof currency === "string" && currency.trim() ? currency : "INR";
  return value === "-" ? "-" : `${currencyText} ${value}`;
}

function formatCell(value: unknown): string {
  if (typeof value === "undefined" || value === null || value === "") return "-";
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return String(value);
  return JSON.stringify(value);
}

function titleCase(value: string): string {
  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ") || "Unknown";
}
