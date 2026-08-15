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
  Download,
  Eye,
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
  addAdminBookingNote,
  assignAdminBooking,
  buildAdminQuery,
  getAdminBookingDetail,
  getAdminBookingTimeline,
  listAdminBookings,
  listAdminBookingNotes,
  updateAdminBookingPriority,
  type AdminApiResult,
  type AdminBookingAssignment,
  type AdminBookingDetail,
  type AdminBookingExportResult,
  type AdminBookingNote,
  type AdminBookingOperationsQuery,
  type AdminBookingOperationalSummary,
  type AdminBookingPaymentSummary,
  type AdminBookingPriority,
  type AdminBookingPriorityValue,
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
  { key: "creators", label: "Creators" },
  { key: "marketplace", label: "TPL Marketplace" },
  { key: "local-life", label: "Local Life" },
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

type BookingActionState = {
  bookingId: string;
  result: AdminApiResult<AdminBookingNote | AdminBookingAssignment | AdminBookingPriority | AdminBookingExportResult> | null;
};

export function AdminBookingOperationsCenter() {
  const [query, setQuery] = useState<AdminBookingOperationsQuery>({ limit: 100, offset: 0 });
  const [activeService, setActiveService] = useState("all");
  const [actionState, setActionState] = useState<BookingActionState | null>(null);
  const [exporting, setExporting] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(true);

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
  const departures = rows.filter(isTodayOrUpcoming).slice(0, 5);
  const supplierQueue = rows.filter(isSupplierPending).slice(0, 5);
  const slaQueue = rows.filter((row) => getSlaStatus(row) === "breach").slice(0, 5);
  const manualReviewQueue = rows.filter(requiresManualReview).slice(0, 5);
  const creatorQueue = rows.filter((row) => getEcosystemType(row) === "creators").slice(0, 5);
  const marketplaceQueue = rows.filter((row) => getEcosystemType(row) === "tpl-marketplace").slice(0, 5);
  const localLifeQueue = rows.filter((row) => getEcosystemType(row) === "local-life").slice(0, 5);

  function handleExport() {
    setExporting(true);
    const result = buildLocalBookingExport(rows);
    setExporting(false);
    setActionState({ bookingId: "filtered-bookings", result });
    if (result.ok) downloadCsv(result.data.filename, result.data.csv);
  }

  return (
    <div className="space-y-6">
      <StatusNotice loading={loadState.loading} result={loadState.result} />

      <section className="overflow-hidden rounded border border-slate-200 bg-white">
        <div className="bg-slate-950 px-5 py-5 text-white">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-300">Admin command center</p>
              <h2 className="mt-1 text-2xl font-semibold">Booking Operations Center</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
                Triage OTA and TPL ecosystem bookings from the existing admin booking read API. Advanced filters are applied locally when the backend does not expose a matching filter.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded bg-emerald-400/15 px-3 py-2 text-xs font-semibold text-emerald-100">Read API connected</span>
              <span className="rounded bg-amber-400/15 px-3 py-2 text-xs font-semibold text-amber-100">Supplier APIs disabled</span>
              <span className="rounded bg-sky-400/15 px-3 py-2 text-xs font-semibold text-sky-100">CSV from visible rows</span>
            </div>
          </div>
        </div>

        <div className="border-b border-slate-200 px-5 py-4">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <FilterInput label="Global search: booking ID / customer / mobile / email" value={query.search ?? ""} onChange={(search) => setQuery((current) => ({ ...current, search }))} />
            <div className="flex flex-wrap items-end gap-2">
              <button
                type="button"
                onClick={() => setFiltersOpen((current) => !current)}
                className="flex h-9 items-center gap-2 rounded border border-slate-200 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <Filter className="h-4 w-4" />
                {filtersOpen ? "Hide filters" : "Show filters"}
              </button>
            <button
              type="button"
              onClick={() => setQuery({ limit: 100, offset: 0 })}
              className="flex h-9 items-center gap-2 rounded border border-slate-200 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <RefreshCcw className="h-4 w-4" />
              Reset
            </button>
            <button
              type="button"
              onClick={handleExport}
              disabled={exporting || rows.length === 0}
              className="flex h-9 items-center gap-2 rounded border border-slate-200 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400"
              title={rows.length === 0 ? "No filtered bookings to export" : "Export current filtered bookings as safe CSV"}
            >
              <Download className="h-4 w-4" />
              {exporting ? "Exporting" : "Export"}
            </button>
            </div>
          </div>
        </div>

        {filtersOpen ? (
          <div className="grid gap-3 border-b border-slate-200 bg-slate-50 px-5 py-5 md:grid-cols-2 xl:grid-cols-4">
            <FilterInput label="Customer mobile / email" value={query.customer ?? ""} onChange={(customer) => setQuery((current) => ({ ...current, customer }))} />
            <FilterSelect label="Service type" value={activeService} onChange={setActiveService} options={serviceTabs} />
            <FilterSelect label="Ecosystem type" value={query.ecosystemType ?? ""} onChange={(ecosystemType) => setQuery((current) => ({ ...current, ecosystemType }))} options={[{ key: "", label: "Any" }, { key: "ota", label: "OTA" }, { key: "creators", label: "Creators" }, { key: "tpl-marketplace", label: "TPL Marketplace" }, { key: "local-life", label: "Local Life" }]} />
            <FilterInput label="Booking / order status" value={query.status ?? ""} onChange={(status) => setQuery((current) => ({ ...current, status }))} />
            <FilterInput label="Payment status" value={query.paymentState ?? ""} onChange={(paymentState) => setQuery((current) => ({ ...current, paymentState }))} />
            <FilterInput label="Refund status" value={query.refundState ?? ""} onChange={(refundState) => setQuery((current) => ({ ...current, refundState }))} />
            <FilterInput label="Travel / experience from" type="date" value={query.dateFrom ?? ""} onChange={(dateFrom) => setQuery((current) => ({ ...current, dateFrom }))} />
            <FilterInput label="Travel / experience to" type="date" value={query.dateTo ?? ""} onChange={(dateTo) => setQuery((current) => ({ ...current, dateTo }))} />
            <FilterInput label="Created from" type="date" value={query.createdFrom ?? ""} onChange={(createdFrom) => setQuery((current) => ({ ...current, createdFrom }))} />
            <FilterInput label="Created to" type="date" value={query.createdTo ?? ""} onChange={(createdTo) => setQuery((current) => ({ ...current, createdTo }))} />
            <FilterInput label="Minimum amount" type="number" value={query.amountMin ?? ""} onChange={(amountMin) => setQuery((current) => ({ ...current, amountMin }))} />
            <FilterInput label="Maximum amount" type="number" value={query.amountMax ?? ""} onChange={(amountMax) => setQuery((current) => ({ ...current, amountMax }))} />
            <FilterSelect label="Priority" value={query.priority ?? ""} onChange={(priority) => setQuery((current) => ({ ...current, priority }))} options={[{ key: "", label: "Any" }, { key: "normal", label: "Normal" }, { key: "high", label: "High" }, { key: "urgent", label: "Urgent" }]} />
            <FilterInput label="Assigned agent" value={query.assignedAgent ?? ""} onChange={(assignedAgent) => setQuery((current) => ({ ...current, assignedAgent }))} />
            <FilterInput label="Source channel" value={query.sourceChannel ?? ""} onChange={(sourceChannel) => setQuery((current) => ({ ...current, sourceChannel }))} />
            <div className="grid grid-cols-2 gap-2">
              <ToggleFilter label="SLA risk" active={query.slaRisk === "true"} onClick={() => setQuery((current) => ({ ...current, slaRisk: current.slaRisk === "true" ? "" : "true" }))} />
              <ToggleFilter label="Supplier pending" active={query.supplierPending === "true"} onClick={() => setQuery((current) => ({ ...current, supplierPending: current.supplierPending === "true" ? "" : "true" }))} />
              <ToggleFilter label="Payment failed" active={query.paymentFailed === "true"} onClick={() => setQuery((current) => ({ ...current, paymentFailed: current.paymentFailed === "true" ? "" : "true" }))} />
              <ToggleFilter label="Refund pending" active={query.refundPending === "true"} onClick={() => setQuery((current) => ({ ...current, refundPending: current.refundPending === "true" ? "" : "true" }))} />
              <ToggleFilter label="Wallet used" active={query.walletUsed === "true"} onClick={() => setQuery((current) => ({ ...current, walletUsed: current.walletUsed === "true" ? "" : "true" }))} />
              <ToggleFilter label="Offer applied" active={query.offerApplied === "true"} onClick={() => setQuery((current) => ({ ...current, offerApplied: current.offerApplied === "true" ? "" : "true" }))} />
            </div>
          </div>
        ) : null}
        <ActionNotice state={actionState} />
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard icon={BookOpen} label="Total bookings / orders" value={overview.total} detail="Current filtered result set" />
        <MetricCard icon={CalendarDays} label="Today" value={overview.today} detail="Created or travel date today" />
        <MetricCard icon={CalendarDays} label="Upcoming" value={overview.upcoming} detail="Upcoming/open status" />
        <MetricCard icon={Clock3} label="In progress" value={overview.inProgress} detail="Pending or processing state" />
        <MetricCard icon={Ban} label="Cancelled" value={overview.cancelled} detail="Cancelled records" />
        <MetricCard icon={CreditCard} label="Payment pending" value={overview.paymentPending} detail="Awaiting payment completion" />
        <MetricCard icon={ShieldAlert} label="Payment failed" value={overview.paymentFailed} detail="Failed payment watch" />
        <MetricCard icon={RefreshCcw} label="Refund pending" value={overview.refundPending} detail="Needs refund API link" />
        <MetricCard icon={Network} label="Supplier pending" value={overview.supplierPending} detail="Provider action not enabled" />
        <MetricCard icon={Clock3} label="SLA risk" value={overview.slaRisk} detail="Warning or breach marker" />
        <MetricCard icon={ShieldAlert} label="Manual review" value={overview.manualReview} detail="Status needs attention" />
        <MetricCard icon={TicketCheck} label="Ecosystem bookings" value={overview.ecosystemBookings} detail="Creators, Marketplace, Local Life" />
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
        <QueuePanel title="Supplier pending queue" icon={Network} rows={supplierQueue} emptyLabel="No supplier pending records in this result set." />
        <QueuePanel title="SLA breach / watchlist" icon={Clock3} rows={slaQueue} emptyLabel="No SLA breach records in this result set." />
        <QueuePanel title="Manual review queue" icon={ShieldAlert} rows={manualReviewQueue} emptyLabel="No manual review records in this result set." />
        <QueuePanel title="Creator booking queue" icon={UserRound} rows={creatorQueue} emptyLabel="No creator ecosystem bookings in this result set." />
        <QueuePanel title="Marketplace order queue" icon={TicketCheck} rows={marketplaceQueue} emptyLabel="No TPL Marketplace orders in this result set." />
        <QueuePanel title="Local Life experience queue" icon={CalendarDays} rows={localLifeQueue} emptyLabel="No Local Life experience records in this result set." />
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
                  {["booking / order", "service / ecosystem", "customer", "date", "amount", "payment", "booking / order status", "refund", "priority / SLA", "assigned agent", "source", "last update", "actions"].map((column) => (
                    <th key={column} className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase text-slate-500">
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.length === 0 ? (
                  <tr>
                    <td className="px-4 py-10" colSpan={13}>
                      <EmptyBookingState loading={loadState.loading} backendEmpty={rawRows.length === 0} filteredEmpty={rawRows.length > 0 && rows.length === 0} onClear={() => setQuery({ limit: 100, offset: 0 })} />
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
                      <td className="px-4 py-3 text-slate-700">
                        <p className="font-medium text-slate-900">{getBookingServiceLabel(booking)}</p>
                        <p className="mt-1 text-xs text-slate-500">{titleCase(getEcosystemType(booking))}</p>
                      </td>
                      <td className="min-w-40 px-4 py-3 text-slate-700">
                        <p>{formatCell(getBookingCustomer(booking))}</p>
                        <p className="mt-1 text-xs text-slate-500">{formatCell(getBookingEmail(booking))}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-700">{formatCell(getTravelDate(booking))}</td>
                      <td className="px-4 py-3 text-slate-700">{formatMoney(getBookingAmount(booking), getBookingCurrency(booking))}</td>
                      <td className="px-4 py-3"><StatusPill value={booking.paymentStatus ?? getNestedString(booking, "paymentStatus")} /></td>
                      <td className="px-4 py-3"><StatusPill value={booking.bookingStatus ?? booking.status} /></td>
                      <td className="px-4 py-3"><StatusPill value={inferRefundState(booking)} /></td>
                      <td className="px-4 py-3"><SlaMarker booking={booking} /></td>
                      <td className="min-w-36 px-4 py-3 text-slate-700">{formatCell(getAssignedAgent(booking))}</td>
                      <td className="px-4 py-3 text-slate-700">{formatCell(getSourceChannel(booking))}</td>
                      <td className="px-4 py-3 text-slate-700">{formatCell(getLastUpdate(booking))}</td>
                      <td className="min-w-80 px-4 py-3">
                        <BookingRowActions booking={booking} onAction={setActionState} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-4">
          <PlaceholderPanel icon={ShieldAlert} title="Supplier exception actions" detail="Live supplier retry, cancellation, amend, reissue, resend voucher, and manual supplier status updates remain disabled because provider integrations are dry-run." />
          <PlaceholderPanel icon={MessageSquareText} title="Admin-only notes" detail="Internal notes are now available from booking rows and the booking workspace. They are audit-backed and admin-only." />
        </div>
      </section>
    </div>
  );
}

export function AdminBookingOperationsWorkspace({ bookingId }: { bookingId: string }) {
  const path = `/api/v1/admin/bookings/${bookingId}`;
  const [requestState, setRequestState] = useState<RequestState<AdminBookingDetail>>({ path, result: null });
  const [timelineState, setTimelineState] = useState<LoadState<AdminBookingTimelineEvent[]>>({ loading: true, result: null });
  const [notesState, setNotesState] = useState<LoadState<AdminBookingNote[]>>({ loading: true, result: null });
  const [actionState, setActionState] = useState<BookingActionState | null>(null);

  useEffect(() => {
    let active = true;
    getAdminBookingDetail(bookingId).then((result) => {
      if (active) setRequestState({ path, result });
    });
    return () => {
      active = false;
    };
  }, [bookingId, path]);

  useEffect(() => {
    let active = true;
    getAdminBookingTimeline(bookingId).then((result) => {
      if (active) setTimelineState({ loading: false, result });
    });
    listAdminBookingNotes(bookingId).then((result) => {
      if (active) setNotesState({ loading: false, result });
    });
    return () => {
      active = false;
    };
  }, [bookingId]);

  const loadState: LoadState<AdminBookingDetail> = {
    loading: requestState.path !== path || requestState.result === null,
    result: requestState.path === path ? requestState.result : null,
  };
  const booking = loadState.result?.ok ? loadState.result.data.booking : null;
  const detail = loadState.result?.ok ? loadState.result.data.detail : null;
  const normalized = detail?.normalizedSummary ?? {};
  const localTimeline = booking ? buildTimelineEvents(booking, normalized) : [];
  const timeline = timelineState.result?.ok ? timelineState.result.data : localTimeline;
  const notes = notesState.result?.ok ? notesState.result.data : [];
  const paymentSummary = booking ? buildPaymentSummary(booking, normalized) : null;
  const refundSummary = booking ? buildRefundSummary(booking, normalized) : null;
  const operationalSummary = booking ? buildOperationalSummary(booking, timeline, paymentSummary, refundSummary) : null;

  function refreshOperations() {
    getAdminBookingTimeline(bookingId).then((result) => setTimelineState({ loading: false, result }));
    listAdminBookingNotes(bookingId).then((result) => setNotesState({ loading: false, result }));
  }

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
                <StatusPill value={`priority: ${getPriority(booking)}`} />
                <StatusPill value={`SLA: ${getSlaStatus(booking)}`} />
              </div>
            </div>
            <ActionNotice state={actionState} />
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
                <BookingNotesPanel bookingId={bookingId} notes={notes} loading={notesState.loading} onAction={(state) => {
                  setActionState(state);
                  refreshOperations();
                }} />
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
                <BookingWorkspaceActions bookingId={bookingId} onAction={(state) => {
                  setActionState(state);
                  refreshOperations();
                }} />
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

function FilterSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: Array<{ key: string; label: string }> }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-slate-500">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 h-9 w-full rounded border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-400"
      >
        {options.map((option) => (
          <option key={option.key || "any"} value={option.key}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function ToggleFilter({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "flex h-9 items-center justify-between rounded border px-3 text-sm font-medium",
        active ? "border-slate-950 bg-slate-950 text-white" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
      ].join(" ")}
    >
      {label}
      <CheckCircle2 className="h-4 w-4" />
    </button>
  );
}

function EmptyBookingState({ loading, backendEmpty, filteredEmpty, onClear }: { loading: boolean; backendEmpty: boolean; filteredEmpty: boolean; onClear: () => void }) {
  if (loading) {
    return <div className="text-center text-sm text-slate-500">Loading bookings from the admin backend.</div>;
  }
  return (
    <div className="mx-auto max-w-xl rounded border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded bg-white text-slate-500">
        <BookOpen className="h-5 w-5" />
      </div>
      <h3 className="mt-3 text-sm font-semibold text-slate-950">No bookings visible</h3>
      <p className="mt-2 text-sm leading-6 text-slate-500">
        {backendEmpty
          ? "The backend returned an empty booking list for the current request."
          : filteredEmpty
            ? "The backend returned booking records, but none match the active frontend filters."
            : "No booking records are available for this view."}
      </p>
      <div className="mt-4 grid gap-2 text-left text-xs text-slate-500 sm:grid-cols-2">
        <span className="rounded bg-white px-3 py-2">Create or seed a test booking.</span>
        <span className="rounded bg-white px-3 py-2">Check backend health and auth session.</span>
        <span className="rounded bg-white px-3 py-2">Review active service/status filters.</span>
        <button type="button" onClick={onClear} className="rounded bg-slate-950 px-3 py-2 text-left font-medium text-white">
          Clear filters
        </button>
      </div>
    </div>
  );
}

function ActionNotice({ state }: { state: BookingActionState | null }) {
  if (!state?.result) return null;
  if (state.result.ok) {
    return (
      <div className="mt-4 rounded border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
        Action completed for {state.bookingId}.
      </div>
    );
  }
  return (
    <div className="mt-4 rounded border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      {state.result.error.message}
    </div>
  );
}

function BookingRowActions({ booking, onAction }: { booking: AdminBookingRow; onAction: (state: BookingActionState) => void }) {
  const bookingId = getBookingIdentifier(booking);
  const [note, setNote] = useState("");
  const [agent, setAgent] = useState(getAssignedAgent(booking) === "Unassigned" ? "" : String(getAssignedAgent(booking)));
  const [priority, setPriority] = useState<AdminBookingPriorityValue>(getPriority(booking));

  async function submitNote() {
    if (!note.trim()) return;
    const result = await addAdminBookingNote(bookingId, { note: note.trim(), category: "table_action" });
    onAction({ bookingId, result });
    if (result.ok) setNote("");
  }

  async function submitAssignment() {
    if (!agent.trim()) return;
    const result = await assignAdminBooking(bookingId, agent.trim());
    onAction({ bookingId, result });
  }

  async function submitPriority() {
    const result = await updateAdminBookingPriority(bookingId, { priority });
    onAction({ bookingId, result });
  }

  async function exportRow() {
    const result = buildLocalBookingExport([booking], bookingId);
    onAction({ bookingId, result });
    if (result.ok) downloadCsv(result.data.filename, result.data.csv);
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <Link className="inline-flex h-8 items-center gap-2 rounded bg-slate-950 px-3 text-xs font-medium text-white" href={`/admin/bookings/${encodeURIComponent(bookingId)}`}>
          <Eye className="h-3.5 w-3.5" />
          View detail
        </Link>
        {getCustomerWorkspaceId(booking) ? (
          <Link className="inline-flex h-8 items-center gap-2 rounded border border-slate-200 px-3 text-xs font-medium text-slate-700" href={`/admin/customers/${encodeURIComponent(getCustomerWorkspaceId(booking) ?? "")}`}>
            <UserRound className="h-3.5 w-3.5" />
            Customer
          </Link>
        ) : (
          <DisabledAction label="Customer" reason="No customer id/mobile" />
        )}
        {booking.paymentRef ? (
          <Link className="inline-flex h-8 items-center gap-2 rounded border border-slate-200 px-3 text-xs font-medium text-slate-700" href={`/admin/payments/${encodeURIComponent(booking.paymentRef)}`}>
            <CreditCard className="h-3.5 w-3.5" />
            Payment
          </Link>
        ) : (
          <DisabledAction label="Payment" reason="No payment reference" />
        )}
        <DisabledAction label="Refund" reason="Refund id is not exposed by booking row" />
        <button type="button" onClick={exportRow} className="inline-flex h-8 items-center gap-2 rounded border border-slate-200 px-3 text-xs font-medium text-slate-700 hover:bg-slate-50">
          <Download className="h-3.5 w-3.5" />
          Export
        </button>
      </div>
      <div className="grid gap-2 md:grid-cols-3">
        <div className="flex gap-1">
          <input value={note} onChange={(event) => setNote(event.target.value)} placeholder="Internal note" className="h-8 min-w-0 flex-1 rounded border border-slate-200 px-2 text-xs outline-none focus:border-slate-400" />
          <button type="button" onClick={submitNote} disabled={!note.trim()} className="h-8 rounded bg-slate-950 px-2 text-xs font-medium text-white disabled:bg-slate-200 disabled:text-slate-400">Add</button>
        </div>
        <div className="flex gap-1">
          <input value={agent} onChange={(event) => setAgent(event.target.value)} placeholder="Assign agent" className="h-8 min-w-0 flex-1 rounded border border-slate-200 px-2 text-xs outline-none focus:border-slate-400" />
          <button type="button" onClick={submitAssignment} disabled={!agent.trim()} className="h-8 rounded bg-slate-950 px-2 text-xs font-medium text-white disabled:bg-slate-200 disabled:text-slate-400">Assign</button>
        </div>
        <div className="flex gap-1">
          <select value={priority} onChange={(event) => setPriority(event.target.value as AdminBookingPriorityValue)} className="h-8 min-w-0 flex-1 rounded border border-slate-200 px-2 text-xs outline-none focus:border-slate-400">
            <option value="normal">Normal</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
          <button type="button" onClick={submitPriority} className="h-8 rounded bg-slate-950 px-2 text-xs font-medium text-white">Mark</button>
        </div>
      </div>
    </div>
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

function DisabledAction({ label, reason }: { label: string; reason: string }) {
  return (
    <button
      type="button"
      disabled
      className="inline-flex h-8 items-center gap-2 rounded border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-400"
      title={reason}
    >
      {label}
      <span className="text-[10px] uppercase">Disabled</span>
    </button>
  );
}

function BookingNotesPanel({ bookingId, notes, loading, onAction }: { bookingId: string; notes: AdminBookingNote[]; loading: boolean; onAction: (state: BookingActionState) => void }) {
  const [note, setNote] = useState("");
  const [category, setCategory] = useState("general");

  async function submitNote() {
    if (!note.trim()) return;
    const result = await addAdminBookingNote(bookingId, { note: note.trim(), category });
    onAction({ bookingId, result });
    if (result.ok) setNote("");
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-2 md:grid-cols-[1fr_160px_auto]">
        <input value={note} onChange={(event) => setNote(event.target.value)} placeholder="Add admin-only internal note" className="h-10 rounded border border-slate-200 px-3 text-sm outline-none focus:border-slate-400" />
        <select value={category} onChange={(event) => setCategory(event.target.value)} className="h-10 rounded border border-slate-200 px-3 text-sm outline-none focus:border-slate-400">
          <option value="general">General</option>
          <option value="follow_up">Follow-up</option>
          <option value="payment">Payment</option>
          <option value="refund">Refund</option>
          <option value="supplier">Supplier</option>
          <option value="sla">SLA</option>
        </select>
        <button type="button" onClick={submitNote} disabled={!note.trim()} className="h-10 rounded bg-slate-950 px-4 text-sm font-medium text-white disabled:bg-slate-200 disabled:text-slate-400">
          Add note
        </button>
      </div>
      <div className="divide-y divide-slate-100 rounded border border-slate-200">
        {loading ? (
          <p className="px-4 py-6 text-sm text-slate-500">Loading notes</p>
        ) : notes.length === 0 ? (
          <p className="px-4 py-6 text-sm text-slate-500">No internal notes recorded for this booking.</p>
        ) : notes.map((item) => (
          <div key={item.id} className="px-4 py-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-semibold uppercase text-slate-400">{item.category} · {item.visibility}</p>
              <p className="text-xs text-slate-500">{formatCell(item.createdAt)}</p>
            </div>
            <p className="mt-2 text-sm text-slate-700">{item.note}</p>
            <p className="mt-1 text-xs text-slate-500">{formatCell(item.createdByAdminEmail)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function BookingWorkspaceActions({ bookingId, onAction }: { bookingId: string; onAction: (state: BookingActionState) => void }) {
  const [agent, setAgent] = useState("");
  const [priority, setPriority] = useState<AdminBookingPriorityValue>("normal");
  const [reason, setReason] = useState("");

  async function submitAssignment() {
    if (!agent.trim()) return;
    const result = await assignAdminBooking(bookingId, agent.trim());
    onAction({ bookingId, result });
  }

  async function submitPriority() {
    const result = await updateAdminBookingPriority(bookingId, {
      priority,
      ...(reason.trim() ? { reason: reason.trim() } : {}),
    });
    onAction({ bookingId, result });
    if (result.ok) setReason("");
  }

  return (
    <div className="mb-4 space-y-3 rounded border border-slate-200 bg-slate-50 p-3">
      <div>
        <p className="text-xs font-semibold uppercase text-slate-400">Assignment</p>
        <div className="mt-2 flex gap-2">
          <input value={agent} onChange={(event) => setAgent(event.target.value)} placeholder="Admin or agent name" className="h-9 min-w-0 flex-1 rounded border border-slate-200 px-3 text-sm outline-none focus:border-slate-400" />
          <button type="button" onClick={submitAssignment} disabled={!agent.trim()} className="h-9 rounded bg-slate-950 px-3 text-sm font-medium text-white disabled:bg-slate-200 disabled:text-slate-400">
            Assign
          </button>
        </div>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase text-slate-400">Priority / SLA</p>
        <div className="mt-2 grid gap-2">
          <select value={priority} onChange={(event) => setPriority(event.target.value as AdminBookingPriorityValue)} className="h-9 rounded border border-slate-200 px-3 text-sm outline-none focus:border-slate-400">
            <option value="normal">Normal / SLA OK</option>
            <option value="high">High / SLA Warning</option>
            <option value="urgent">Urgent / SLA Breach</option>
          </select>
          <input value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Reason, optional" className="h-9 rounded border border-slate-200 px-3 text-sm outline-none focus:border-slate-400" />
          <button type="button" onClick={submitPriority} className="h-9 rounded bg-slate-950 px-3 text-sm font-medium text-white">
            Update priority
          </button>
        </div>
      </div>
    </div>
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
  const sla = getSlaStatus(booking);
  const issue = sla !== "ok";
  return (
    <span className={["inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium", issue ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-600"].join(" ")}>
      <Clock3 className="h-3 w-3" />
      {getPriority(booking)} / {sla}
    </span>
  );
}

function toBackendBookingQuery(query: AdminBookingOperationsQuery, activeService: string): AdminListQuery {
  const customer = query.customer?.trim();
  return {
    limit: query.limit ?? 100,
    offset: query.offset ?? 0,
    ...(activeService !== "all" ? { service: activeService } : {}),
    ...(query.search?.trim() ? { search: query.search.trim() } : {}),
    ...(query.status?.trim() ? { status: query.status.trim() } : {}),
    ...(customer ? { customer } : {}),
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
  const ecosystemType = query.ecosystemType?.trim();
  const amountMin = query.amountMin?.trim() ? Number(query.amountMin) : null;
  const amountMax = query.amountMax?.trim() ? Number(query.amountMax) : null;
  const sourceChannel = query.sourceChannel?.trim().toLowerCase();
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
    if (ecosystemType && getEcosystemType(row) !== ecosystemType) return false;
    if (paymentState && !String(row.paymentStatus ?? getNestedString(row, "paymentStatus") ?? "").toLowerCase().includes(paymentState)) return false;
    if (refundState && !inferRefundState(row).toLowerCase().includes(refundState)) return false;
    if (query.status?.trim() && !String(row.bookingStatus ?? row.status ?? "").toLowerCase().includes(query.status.trim().toLowerCase())) return false;
    if (query.priority?.trim() && getPriority(row) !== query.priority.trim()) return false;
    if (sourceChannel && !String(getSourceChannel(row)).toLowerCase().includes(sourceChannel)) return false;
    if (query.dateFrom?.trim() && !dateOnOrAfter(getTravelDate(row), query.dateFrom)) return false;
    if (query.dateTo?.trim() && !dateOnOrBefore(getTravelDate(row), query.dateTo)) return false;
    if (query.createdFrom?.trim() && !dateOnOrAfter(getCreatedAt(row), query.createdFrom)) return false;
    if (query.createdTo?.trim() && !dateOnOrBefore(getCreatedAt(row), query.createdTo)) return false;
    if (amountMin !== null && Number.isFinite(amountMin) && toNumber(getBookingAmount(row)) < amountMin) return false;
    if (amountMax !== null && Number.isFinite(amountMax) && toNumber(getBookingAmount(row)) > amountMax) return false;
    if (query.highPriority === "true" && getPriority(row) === "normal") return false;
    if (query.slaRisk === "true" && getSlaStatus(row) === "ok") return false;
    if (query.supplierPending === "true" && !isSupplierPending(row)) return false;
    if (query.paymentFailed === "true" && !includesAny(row.paymentStatus ?? getNestedString(row, "paymentStatus"), ["fail", "error"])) return false;
    if (query.refundPending === "true" && !isRefundCandidate(row)) return false;
    if (query.walletUsed === "true" && !hasWalletUsed(row)) return false;
    if (query.offerApplied === "true" && !hasOfferApplied(row)) return false;
    if (query.assignedAgent?.trim() && !String(getAssignedAgent(row)).toLowerCase().includes(query.assignedAgent.trim().toLowerCase())) return false;
    return true;
  });
}

function buildBookingOverview(rows: AdminBookingRow[]) {
  return {
    total: rows.length,
    today: rows.filter(isTodayBooking).length,
    upcoming: rows.filter((row) => includesAny(row.status ?? row.bookingStatus, ["upcoming", "confirmed", "open", "created"])).length,
    inProgress: rows.filter((row) => includesAny(row.status ?? row.bookingStatus, ["pending", "processing", "progress", "created"])).length,
    cancelled: rows.filter((row) => includesAny(row.status ?? row.bookingStatus, ["cancel"])).length,
    paymentPending: rows.filter((row) => includesAny(row.paymentStatus ?? getNestedString(row, "paymentStatus"), ["pending", "initiated"])).length,
    paymentFailed: rows.filter((row) => includesAny(row.paymentStatus ?? getNestedString(row, "paymentStatus"), ["fail", "error"])).length,
    refundPending: rows.filter(isRefundCandidate).length,
    paymentIssues: rows.filter(isPaymentIssue).length,
    supplierPending: rows.filter(isSupplierPending).length,
    slaBreach: rows.filter((row) => getSlaStatus(row) === "breach").length,
    slaRisk: rows.filter((row) => getSlaStatus(row) !== "ok").length,
    manualReview: rows.filter(requiresManualReview).length,
    ecosystemBookings: rows.filter((row) => getEcosystemType(row) !== "ota").length,
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

function isSupplierPending(row: AdminBookingRow): boolean {
  return includesAny(getNestedString(row, "supplierStatus") ?? getNestedString(row, "providerStatus") ?? getNestedString(row, "compatBookingItem.supplierStatus"), ["pending", "queued", "awaiting", "manual"]);
}

function requiresManualReview(row: AdminBookingRow): boolean {
  return isPaymentIssue(row) ||
    isRefundCandidate(row) ||
    isSupplierPending(row) ||
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

function getEcosystemType(booking: AdminBookingRow): string {
  const explicit = formatCell(
    getNestedString(booking, "ecosystemType") ??
    getNestedString(booking, "compatBookingItem.ecosystemType") ??
    getNestedString(booking, "orderType")
  ).toLowerCase();
  const service = getBookingService(booking);
  if (explicit.includes("creator") || service.includes("creator")) return "creators";
  if (explicit.includes("market") || service.includes("marketplace")) return "tpl-marketplace";
  if (explicit.includes("local") || service.includes("local-life")) return "local-life";
  if (["creators", "marketplace", "local-life"].includes(service)) {
    return service === "marketplace" ? "tpl-marketplace" : service;
  }
  return "ota";
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

function getAssignedAgent(booking: AdminBookingRow): unknown {
  return getNestedString(booking, "assignedAgent") ?? getNestedString(booking, "operations.assignedAgent") ?? "Unassigned";
}

function getPriority(booking: AdminBookingRow): AdminBookingPriorityValue {
  const value = getNestedString(booking, "priority") ?? getNestedString(booking, "operations.priority");
  return value === "urgent" || value === "high" ? value : "normal";
}

function getSlaStatus(booking: AdminBookingRow): "ok" | "warning" | "breach" {
  const value = getNestedString(booking, "slaStatus") ?? getNestedString(booking, "operations.slaStatus");
  if (value === "breach" || getPriority(booking) === "urgent" || isPaymentIssue(booking)) return "breach";
  if (value === "warning" || getPriority(booking) === "high" || isRefundCandidate(booking) || isSupplierPending(booking)) return "warning";
  return "ok";
}

function getLastUpdate(booking: AdminBookingRow): unknown {
  return getNestedString(booking, "updatedAt") ?? getNestedString(booking, "createdAt") ?? getNestedString(booking, "compatBookingItem.updatedAt");
}

function getCreatedAt(booking: AdminBookingRow): unknown {
  return getNestedString(booking, "createdAt") ?? getNestedString(booking, "compatBookingItem.createdAt");
}

function getSourceChannel(booking: AdminBookingRow): unknown {
  return getNestedString(booking, "sourceChannel") ??
    getNestedString(booking, "source") ??
    getNestedString(booking, "channel") ??
    getNestedString(booking, "compatBookingItem.sourceChannel") ??
    getNestedString(booking, "compatBookingItem.source") ??
    "Admin read model";
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

function hasWalletUsed(booking: AdminBookingRow): boolean {
  return includesAny(
    getNestedString(booking, "walletUsed") ??
    getNestedString(booking, "walletLedgerGroupId") ??
    getNestedString(booking, "compatBookingItem.walletUsed"),
    ["true", "wallet", "used", "yes"]
  );
}

function hasOfferApplied(booking: AdminBookingRow): boolean {
  return Boolean(
    getNestedString(booking, "offerRedemptionId") ??
    getNestedString(booking, "couponCode") ??
    getNestedString(booking, "promoCode") ??
    getNestedString(booking, "compatBookingItem.offerRedemptionId") ??
    getNestedString(booking, "compatBookingItem.couponCode")
  );
}

function inferRefundState(booking: AdminBookingRow): string {
  const explicit = getNestedString(booking, "refundStatus");
  if (explicit) return explicit;
  return isRefundCandidate(booking) ? "Review required" : "No refund signal";
}

function isTodayOrUpcoming(row: AdminBookingRow): boolean {
  return isTodayBooking(row) || includesAny(row.status ?? row.bookingStatus, ["upcoming", "confirmed", "open", "created"]);
}

function isTodayBooking(row: AdminBookingRow): boolean {
  const today = new Date().toISOString().slice(0, 10);
  const travelDate = String(getTravelDate(row) ?? "");
  const createdAt = getNestedString(row, "createdAt") ?? "";
  return travelDate.startsWith(today) || createdAt.startsWith(today);
}

function dateOnOrAfter(value: unknown, date: string | undefined): boolean {
  if (!date) return true;
  const valueDate = String(value ?? "").slice(0, 10);
  return Boolean(valueDate) && valueDate >= date;
}

function dateOnOrBefore(value: unknown, date: string | undefined): boolean {
  if (!date) return true;
  const valueDate = String(value ?? "").slice(0, 10);
  return Boolean(valueDate) && valueDate <= date;
}

function toNumber(value: unknown): number {
  const normalized = String(value ?? "0").replace(/[^0-9.-]/g, "");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
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

function buildLocalBookingExport(rows: AdminBookingRow[], suffix = "visible"): AdminApiResult<AdminBookingExportResult> {
  const headers = [
    "Booking/Order ID",
    "Service/Ecosystem",
    "Customer",
    "Date",
    "Amount",
    "Payment",
    "Booking/Order Status",
    "Refund",
    "Priority",
    "SLA",
    "Assigned Agent",
    "Source",
    "Last Update",
  ];
  const csvRows = rows.map((booking) => [
    getBookingIdentifier(booking),
    `${getBookingServiceLabel(booking)} / ${titleCase(getEcosystemType(booking))}`,
    `${formatCell(getBookingCustomer(booking))} ${formatCell(getBookingEmail(booking))}`.trim(),
    formatCell(getTravelDate(booking)),
    formatMoney(getBookingAmount(booking), getBookingCurrency(booking)),
    formatCell(booking.paymentStatus ?? getNestedString(booking, "paymentStatus")),
    formatCell(booking.bookingStatus ?? booking.status),
    inferRefundState(booking),
    getPriority(booking),
    getSlaStatus(booking),
    formatCell(getAssignedAgent(booking)),
    formatCell(getSourceChannel(booking)),
    formatCell(getLastUpdate(booking)),
  ]);
  const csv = [headers, ...csvRows].map((row) => row.map(escapeCsvCell).join(",")).join("\n");
  const today = new Date().toISOString().slice(0, 10);
  return {
    ok: true,
    data: {
      filename: `tpl-bookings-${safeFilenamePart(suffix)}-${today}.csv`,
      contentType: "text/csv",
      csv,
      rowCount: rows.length,
    },
    meta: { requestId: `local-csv-${Date.now()}`, apiVersion: "v1" },
    status: 200,
    requestId: `local-csv-${Date.now()}`,
  };
}

function escapeCsvCell(value: unknown): string {
  const text = formatCell(value).replace(/"/g, "\"\"");
  return /[",\n\r]/.test(text) ? `"${text}"` : text;
}

function safeFilenamePart(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "") || "visible";
}

function downloadCsv(filename: string, csv: string) {
  if (typeof window === "undefined") return;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  window.URL.revokeObjectURL(url);
}

function titleCase(value: string): string {
  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ") || "Unknown";
}
