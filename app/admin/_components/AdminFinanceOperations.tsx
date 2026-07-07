"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BadgeIndianRupee,
  CheckCircle2,
  Clock3,
  CreditCard,
  FileClock,
  Landmark,
  ListFilter,
  ReceiptIndianRupee,
  RefreshCcw,
  ShieldAlert,
  WalletCards,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import {
  getAdminPaymentDetail,
  getAdminRefundDetail,
  getAdminWalletDetail,
  listAdminLedger,
  listAdminPayments,
  listAdminRefunds,
  listAdminWallets,
  type AdminApiError,
  type AdminLedgerRow,
  type AdminListQuery,
  type AdminPaymentDetail,
  type AdminPaymentRow,
  type AdminRefundDetail,
  type AdminRefundRow,
  type AdminWalletDetail,
  type AdminWalletRow,
} from "../../lib/admin/adminApiClient";

type LoadState<T> =
  | { status: "loading"; data: T; error: null }
  | { status: "ready"; data: T; error: null }
  | { status: "error"; data: T; error: AdminApiError };

type FilterState = {
  search: string;
  booking: string;
  customer: string;
  gateway: string;
  status: string;
  dateFrom: string;
  dateTo: string;
  amount: string;
  reference: string;
};

const emptyFilters: FilterState = {
  search: "",
  booking: "",
  customer: "",
  gateway: "",
  status: "",
  dateFrom: "",
  dateTo: "",
  amount: "",
  reference: "",
};

export function AdminPaymentsWorkspace() {
  const [filters, setFilters] = useState<FilterState>(emptyFilters);
  const [state, setState] = useState<LoadState<AdminPaymentRow[]>>({ status: "loading", data: [], error: null });

  useEffect(() => {
    let active = true;
    void listAdminPayments(toQuery(filters)).then((result) => {
      if (!active) return;
      setState(result.ok ? { status: "ready", data: result.data, error: null } : { status: "error", data: [], error: result.error });
    });
    return () => {
      active = false;
    };
  }, [filters]);

  const rows = useMemo(() => filterPayments(state.data, filters), [state.data, filters]);
  const totals = useMemo(() => {
    const failed = rows.filter((row) => isStatus(row.status, "failed")).length;
    const pending = rows.filter((row) => isStatus(row.status, "pending", "initiated")).length;
    const success = rows.filter((row) => isStatus(row.status, "paid", "success", "captured")).length;
    const highValue = rows.filter((row) => Number(row.amount ?? 0) >= 50000).length;
    return { failed, pending, success, highValue, successRate: rows.length ? Math.round((success / rows.length) * 100) : 0 };
  }, [rows]);
  const gatewaySummary = summarizeBy(rows, (row) => row.gateway || "Needs gateway");

  return (
    <div className="space-y-6">
      <FinanceHero
        eyebrow="Finance Operations"
        title="Payments Workspace"
        description="Read-only payment monitoring across booking, customer, gateway, wallet, coupon, and settlement signals."
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard icon={CreditCard} label="Today's Payments" value={rows.length} detail="Current result set" />
        <MetricCard icon={CheckCircle2} label="Success Rate" value={`${totals.successRate}%`} detail={`${totals.success} successful payments`} />
        <MetricCard icon={XCircle} label="Failed Payments" value={totals.failed} tone="danger" detail="Failure queue" />
        <MetricCard icon={Clock3} label="Pending Payments" value={totals.pending} tone="warning" detail="Needs follow-up" />
        <MetricCard icon={BadgeIndianRupee} label="High Value" value={totals.highValue} detail=">= INR 50,000" />
      </div>
      <FinanceFilters filters={filters} onChange={setFilters} />
      <div className="grid gap-4 xl:grid-cols-[1fr_22rem]">
        <Panel title="Payment Table" action={<StatusPill>{state.status}</StatusPill>}>
          <StateBanner state={state} emptyText="No payments returned by the admin API." />
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-3 py-3 font-semibold">Booking</th>
                  <th className="px-3 py-3 font-semibold">Customer</th>
                  <th className="px-3 py-3 font-semibold">Gateway</th>
                  <th className="px-3 py-3 font-semibold">Amount</th>
                  <th className="px-3 py-3 font-semibold">Status</th>
                  <th className="px-3 py-3 font-semibold">Attempts</th>
                  <th className="px-3 py-3 font-semibold">Wallet</th>
                  <th className="px-3 py-3 font-semibold">Coupon</th>
                  <th className="px-3 py-3 font-semibold">Quick View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50">
                    <td className="px-3 py-3 font-medium text-slate-900">{shortId(row.bookingId) || "-"}</td>
                    <td className="px-3 py-3 text-slate-600">{row.mobile || row.userId || "-"}</td>
                    <td className="px-3 py-3 text-slate-600">{row.gateway || "Needs API"}</td>
                    <td className="px-3 py-3 font-semibold text-slate-900">{money(row.amount, row.currency)}</td>
                    <td className="px-3 py-3"><StatusPill>{row.status || "-"}</StatusPill></td>
                    <td className="px-3 py-3 text-slate-500">Detail</td>
                    <td className="px-3 py-3 text-slate-500">{row.walletLedgerGroupId ? "Linked" : "Needs API"}</td>
                    <td className="px-3 py-3 text-slate-500">{row.offerRedemptionId ? "Linked" : "Needs API"}</td>
                    <td className="px-3 py-3">
                      <Link className="inline-flex items-center gap-1 text-sm font-semibold text-slate-950" href={`/admin/payments/${encodeURIComponent(row.paymentRef || row.id)}`}>
                        Open <ArrowRight className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
        <div className="space-y-4">
          <Panel title="Gateway Distribution">
            <KeyValueList items={gatewaySummary.map((item) => [item.label, String(item.count)])} />
          </Panel>
          <FinanceDashboardWidgets />
        </div>
      </div>
    </div>
  );
}

export function AdminPaymentDetailWorkspace({ paymentId }: { paymentId: string }) {
  const [state, setState] = useState<LoadState<AdminPaymentDetail | null>>({ status: "loading", data: null, error: null });

  useEffect(() => {
    let active = true;
    void getAdminPaymentDetail(paymentId).then((result) => {
      if (!active) return;
      setState(result.ok ? { status: "ready", data: result.data, error: null } : { status: "error", data: null, error: result.error });
    });
    return () => {
      active = false;
    };
  }, [paymentId]);

  const payment = state.data?.payment;
  return (
    <DetailLayout
      eyebrow="Payment Detail"
      title={payment?.paymentRef || paymentId}
      description="Read-only payment workspace with gateway, booking, wallet, offer, timeline, audit, and future operations context."
      state={state}
    >
      {payment && (
        <AccordionGroup
          sections={[
            ["Overview", <KeyValueList key="overview" items={[
              ["Payment Ref", payment.paymentRef || payment.id],
              ["Status", payment.status || "-"],
              ["Amount", money(payment.amount, payment.currency)],
              ["Created", formatDate(payment.createdAt)],
            ]} />],
            ["Gateway", <KeyValueList key="gateway" items={[
              ["Gateway", textValue(payment.gateway)],
              ["Gateway Order", textValue(payment.gatewayOrderId)],
              ["Gateway Payment", textValue(payment.gatewayPaymentId)],
              ["Method", textValue(payment.paymentMethod)],
            ]} />],
            ["Attempts", <RecordTable key="attempts" rows={state.data?.attempts ?? []} empty="No attempts API data returned." />],
            ["Booking Link", <LinkBlock key="booking" href={payment.bookingId ? `/admin/bookings/${payment.bookingId}` : null} label={shortId(payment.bookingId) || "Booking link needs API"} />],
            ["Customer Link", <p key="customer" className="text-sm text-slate-600">{payment.mobile || payment.userId || "Customer link needs identity mapping API."}</p>],
            ["Wallet", <RecordTable key="wallet" rows={state.data?.ledger ?? []} empty="No wallet ledger entries linked to this payment." />],
            ["Offer", <p key="offer" className="text-sm text-slate-600">{payment.offerRedemptionId ? `Offer redemption ${payment.offerRedemptionId}` : "Offer redemption details need API."}</p>],
            ["Timeline", <Timeline key="timeline" items={paymentTimeline(payment, state.data?.attempts ?? [], state.data?.refunds ?? [])} />],
            ["Gateway Response", <RawJson key="gateway-response" data={state.data?.gateway ?? { status: "Gateway response payload is intentionally not exposed." }} />],
            ["Audit", <RawJson key="audit" data={state.data?.audit ?? { status: "Audit metadata unavailable." }} />],
            ["Operations", <DisabledActions key="ops" actions={["Capture review", "Retry verification", "Mark exception", "Escalate gateway"]} />],
          ]}
        />
      )}
    </DetailLayout>
  );
}

export function AdminRefundsWorkspace() {
  const [filters, setFilters] = useState<FilterState>(emptyFilters);
  const [state, setState] = useState<LoadState<AdminRefundRow[]>>({ status: "loading", data: [], error: null });

  useEffect(() => {
    let active = true;
    void listAdminRefunds(toQuery(filters)).then((result) => {
      if (!active) return;
      setState(result.ok ? { status: "ready", data: result.data, error: null } : { status: "error", data: [], error: result.error });
    });
    return () => {
      active = false;
    };
  }, [filters]);

  const rows = useMemo(() => filterRefunds(state.data, filters), [state.data, filters]);
  const counts = countStatuses(rows, ["pending", "processing", "completed", "rejected", "failed"]);

  return (
    <div className="space-y-6">
      <FinanceHero eyebrow="Finance Operations" title="Refund Operations" description="Read-only refund queue for pending, processing, completed, rejected, failed, and gateway-linked refund records." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard icon={Clock3} label="Pending" value={counts.pending} tone="warning" detail="Awaiting processing" />
        <MetricCard icon={RefreshCcw} label="Processing" value={counts.processing} detail="Gateway in progress" />
        <MetricCard icon={CheckCircle2} label="Completed" value={counts.completed} detail="Closed refunds" />
        <MetricCard icon={ShieldAlert} label="Rejected" value={counts.rejected} tone="danger" detail="Needs support visibility" />
        <MetricCard icon={XCircle} label="Failed" value={counts.failed} tone="danger" detail="Gateway failure queue" />
      </div>
      <FinanceFilters filters={filters} onChange={setFilters} />
      <Panel title="Refund Table" action={<StatusPill>{state.status}</StatusPill>}>
        <StateBanner state={state} emptyText="No refunds returned by the admin API." />
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-3 font-semibold">Booking</th>
                <th className="px-3 py-3 font-semibold">Customer</th>
                <th className="px-3 py-3 font-semibold">Amount</th>
                <th className="px-3 py-3 font-semibold">Method</th>
                <th className="px-3 py-3 font-semibold">Status</th>
                <th className="px-3 py-3 font-semibold">Timeline</th>
                <th className="px-3 py-3 font-semibold">Gateway Ref</th>
                <th className="px-3 py-3 font-semibold">Quick View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50">
                  <td className="px-3 py-3 font-medium">{shortId(row.bookingId) || "-"}</td>
                  <td className="px-3 py-3 text-slate-600">Needs customer API</td>
                  <td className="px-3 py-3 font-semibold">{money(row.amount, row.currency)}</td>
                  <td className="px-3 py-3 text-slate-600">{row.refundMethod || "-"}</td>
                  <td className="px-3 py-3"><StatusPill>{row.status || "-"}</StatusPill></td>
                  <td className="px-3 py-3 text-slate-500">{formatDate(row.processedAt || row.createdAt)}</td>
                  <td className="px-3 py-3 text-slate-600">{shortId(row.gatewayRefundId) || "Needs API"}</td>
                  <td className="px-3 py-3">
                    <Link className="inline-flex items-center gap-1 text-sm font-semibold text-slate-950" href={`/admin/refunds/${encodeURIComponent(row.refundRef || row.id)}`}>
                      Open <ArrowRight className="h-4 w-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}

export function AdminRefundDetailWorkspace({ refundId }: { refundId: string }) {
  const [state, setState] = useState<LoadState<AdminRefundDetail | null>>({ status: "loading", data: null, error: null });

  useEffect(() => {
    let active = true;
    void getAdminRefundDetail(refundId).then((result) => {
      if (!active) return;
      setState(result.ok ? { status: "ready", data: result.data, error: null } : { status: "error", data: null, error: result.error });
    });
    return () => {
      active = false;
    };
  }, [refundId]);

  const refund = state.data?.refund;
  return (
    <DetailLayout eyebrow="Refund Detail" title={refund?.refundRef || refundId} description="Read-only refund operations workspace for gateway, booking, wallet, audit, and future approval flows." state={state}>
      {refund && (
        <AccordionGroup sections={[
          ["Overview", <KeyValueList key="overview" items={[
            ["Refund Ref", refund.refundRef || refund.id],
            ["Status", refund.status || "-"],
            ["Method", refund.refundMethod || "-"],
            ["Amount", money(refund.amount, refund.currency)],
          ]} />],
          ["Timeline", <Timeline key="timeline" items={[
            ["Refund created", formatDate(refund.createdAt), "Observed from refund record."],
            ["Refund processed", formatDate(refund.processedAt), refund.processedAt ? "Observed from refund record." : "Needs gateway completion API."],
          ]} />],
          ["Gateway", <KeyValueList key="gateway" items={[["Gateway Refund", textValue(refund.gatewayRefundId)]]} />],
          ["Booking", <LinkBlock key="booking" href={refund.bookingId ? `/admin/bookings/${refund.bookingId}` : null} label={shortId(refund.bookingId) || "Booking link needs API"} />],
          ["Customer", <p key="customer" className="text-sm text-slate-600">Customer details need booking/customer join API.</p>],
          ["Wallet", <RecordTable key="wallet" rows={state.data?.ledger ?? []} empty="No wallet ledger entries linked to this refund." />],
          ["Audit", <RawJson key="audit" data={state.data?.audit ?? { status: "Audit metadata unavailable." }} />],
          ["Operations", <DisabledActions key="ops" actions={["Approve refund", "Reject refund", "Retry gateway refund", "Manual settlement note"]} />],
        ]} />
      )}
    </DetailLayout>
  );
}

export function AdminWalletsWorkspace() {
  const [state, setState] = useState<LoadState<AdminWalletRow[]>>({ status: "loading", data: [], error: null });

  useEffect(() => {
    let active = true;
    void listAdminWallets({ limit: 100, offset: 0 }).then((result) => {
      if (!active) return;
      setState(result.ok ? { status: "ready", data: result.data, error: null } : { status: "error", data: [], error: result.error });
    });
    return () => {
      active = false;
    };
  }, []);

  const totals = useMemo(() => ({
    promo: sum(state.data, "promoCredit"),
    earned: sum(state.data, "earnedCredit"),
    refund: sum(state.data, "refundableBalance"),
  }), [state.data]);
  const liability = totals.promo + totals.earned + totals.refund;

  return (
    <div className="space-y-6">
      <FinanceHero eyebrow="Finance Operations" title="Wallet Operations" description="Read-only wallet liability, customer balance, refund wallet, and ledger visibility." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard icon={GiftIcon} label="Promo Wallet" value={money(totals.promo)} detail="Promotional liability" />
        <MetricCard icon={BadgeIndianRupee} label="Earned Wallet" value={money(totals.earned)} detail="Earned balance" />
        <MetricCard icon={RefreshCcw} label="Refund Wallet" value={money(totals.refund)} detail="Refund balance" />
        <MetricCard icon={WalletCards} label="Total Liability" value={money(liability)} tone="warning" detail="All wallet balances" />
        <MetricCard icon={FileClock} label="Ledger Entries" value="Needs API" detail="Open ledger workspace" />
      </div>
      <Panel title="Wallet Table" action={<StatusPill>{state.status}</StatusPill>}>
        <StateBanner state={state} emptyText="No wallets returned by the admin API." />
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-3 font-semibold">Customer</th>
                <th className="px-3 py-3 font-semibold">Promo</th>
                <th className="px-3 py-3 font-semibold">Earned</th>
                <th className="px-3 py-3 font-semibold">Refund</th>
                <th className="px-3 py-3 font-semibold">Balance</th>
                <th className="px-3 py-3 font-semibold">Status</th>
                <th className="px-3 py-3 font-semibold">Quick View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {state.data.map((row) => {
                const balance = Number(row.promoCredit ?? 0) + Number(row.earnedCredit ?? 0) + Number(row.refundableBalance ?? 0);
                return (
                  <tr key={row.id} className="hover:bg-slate-50">
                    <td className="px-3 py-3 font-medium">{row.mobile || shortId(row.userId) || "-"}</td>
                    <td className="px-3 py-3">{money(row.promoCredit, row.currency)}</td>
                    <td className="px-3 py-3">{money(row.earnedCredit, row.currency)}</td>
                    <td className="px-3 py-3">{money(row.refundableBalance, row.currency)}</td>
                    <td className="px-3 py-3 font-semibold">{money(balance, row.currency)}</td>
                    <td className="px-3 py-3"><StatusPill>{row.status || "-"}</StatusPill></td>
                    <td className="px-3 py-3">
                      <Link className="inline-flex items-center gap-1 text-sm font-semibold text-slate-950" href={`/admin/wallets/${encodeURIComponent(row.id)}`}>
                        Open <ArrowRight className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}

export function AdminWalletDetailWorkspace({ walletId }: { walletId: string }) {
  const [state, setState] = useState<LoadState<AdminWalletDetail | null>>({ status: "loading", data: null, error: null });

  useEffect(() => {
    let active = true;
    void getAdminWalletDetail(walletId).then((result) => {
      if (!active) return;
      setState(result.ok ? { status: "ready", data: result.data, error: null } : { status: "error", data: null, error: result.error });
    });
    return () => {
      active = false;
    };
  }, [walletId]);

  const wallet = state.data?.wallet;
  return (
    <DetailLayout eyebrow="Wallet Detail" title={wallet?.mobile || walletId} description="Read-only wallet workspace with balance, ledger, transaction links, expiry, and audit foundations." state={state}>
      {wallet && (
        <AccordionGroup sections={[
          ["Overview", <KeyValueList key="overview" items={[
            ["Mobile", wallet.mobile || "-"],
            ["Status", wallet.status || "-"],
            ["Promo", money(wallet.promoCredit, wallet.currency)],
            ["Earned", money(wallet.earnedCredit, wallet.currency)],
            ["Refundable", money(wallet.refundableBalance, wallet.currency)],
          ]} />],
          ["Ledger", <RecordTable key="ledger" rows={state.data?.ledger ?? []} empty="No ledger entries returned for this wallet." />],
          ["Transactions", <p key="transactions" className="text-sm text-slate-600">Payment and refund transaction grouping needs richer ledger API joins.</p>],
          ["Booking Links", <RecordTable key="bookings" rows={(state.data?.ledger ?? []).filter((row) => row.bookingId)} empty="No booking-linked ledger entries." />],
          ["Refund Links", <RecordTable key="refunds" rows={(state.data?.ledger ?? []).filter((row) => row.refundId)} empty="No refund-linked ledger entries." />],
          ["Expiry", <p key="expiry" className="text-sm text-slate-600">Wallet expiry rules need API support.</p>],
          ["Audit", <RawJson key="audit" data={state.data?.audit ?? { status: "Audit metadata unavailable." }} />],
        ]} />
      )}
    </DetailLayout>
  );
}

export function AdminLedgerWorkspace() {
  const [state, setState] = useState<LoadState<AdminLedgerRow[]>>({ status: "loading", data: [], error: null });

  useEffect(() => {
    let active = true;
    void listAdminLedger({ limit: 100, offset: 0 }).then((result) => {
      if (!active) return;
      setState(result.ok ? { status: "ready", data: result.data, error: null } : { status: "error", data: [], error: result.error });
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      <FinanceHero eyebrow="Finance Operations" title="Ledger Foundation" description="Read-only credits, debits, refunds, promo, earned, and adjustment ledger timeline." />
      <Panel title="Ledger Timeline" action={<StatusPill>{state.status}</StatusPill>}>
        <StateBanner state={state} emptyText="No ledger entries returned by the admin API." />
        <Timeline items={state.data.map((row) => [row.title || row.ledgerType || "Ledger entry", `${money(row.amount, row.currency)} | ${formatDate(row.createdAt)}`, row.description || "Linked financial event"])} />
      </Panel>
      <DisabledActions actions={["Manual credit", "Manual debit", "Ledger adjustment", "Export signed ledger"]} />
    </div>
  );
}

export function AdminSettlementWorkspace() {
  return (
    <PlaceholderWorkspace
      title="Settlement Foundation"
      description="Gateway settlement monitoring foundation. Read-only APIs for settlement batches, payout references, and reconciliation status are pending."
      cards={[
        ["Gateway Settlement", "Needs API"],
        ["Pending Settlement", "Needs API"],
        ["Completed", "Needs API"],
        ["Reconciliation Status", "Needs API"],
      ]}
    />
  );
}

export function AdminGatewayStatusWorkspace() {
  return (
    <PlaceholderWorkspace
      title="Gateway Status"
      description="Gateway health surface for Razorpay, Cashfree, webhook, latency, queue, and future gateway checks."
      cards={[
        ["Razorpay", "Health API pending"],
        ["Cashfree", "Health API pending"],
        ["Webhook", "Queue API pending"],
        ["Latency", "Metrics API pending"],
      ]}
    />
  );
}

export function AdminReconciliationWorkspace() {
  return (
    <PlaceholderWorkspace
      title="Reconciliation"
      description="Read-only reconciliation workspace for gateway files, booking-payment mismatches, settlement gaps, and wallet deltas."
      cards={[
        ["Payment Match", "Needs API"],
        ["Refund Match", "Needs API"],
        ["Wallet Delta", "Needs API"],
        ["Exception Queue", "Needs API"],
      ]}
    />
  );
}

export function AdminFinanceReportsWorkspace() {
  return (
    <PlaceholderWorkspace
      title="Finance Reports"
      description="Finance BI placeholder for revenue, refunds, wallet liability, settlements, and gateway performance reports."
      cards={[
        ["Revenue", "Needs API"],
        ["Refunds", "Needs API"],
        ["Wallet Liability", "Needs API"],
        ["Gateway Performance", "Needs API"],
      ]}
    />
  );
}

function FinanceHero({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <section className="rounded border border-slate-200 bg-white p-5">
      <p className="text-xs font-semibold uppercase text-slate-500">{eyebrow}</p>
      <div className="mt-2 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-normal text-slate-950">{title}</h2>
          <p className="mt-1 max-w-3xl text-sm text-slate-600">{description}</p>
        </div>
        <div className="inline-flex items-center gap-2 rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
          <ShieldAlert className="h-4 w-4" />
          Read only
        </div>
      </div>
    </section>
  );
}

function FinanceFilters({ filters, onChange }: { filters: FilterState; onChange: (filters: FilterState) => void }) {
  const update = (key: keyof FilterState, value: string) => onChange({ ...filters, [key]: value });
  return (
    <Panel title="Advanced Filters" action={<ListFilter className="h-4 w-4 text-slate-500" />}>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <FilterInput label="Booking" value={filters.booking} onChange={(value) => update("booking", value)} />
        <FilterInput label="Customer" value={filters.customer} onChange={(value) => update("customer", value)} />
        <FilterInput label="Gateway" value={filters.gateway} onChange={(value) => update("gateway", value)} />
        <FilterInput label="Status" value={filters.status} onChange={(value) => update("status", value)} />
        <FilterInput label="Date from" type="date" value={filters.dateFrom} onChange={(value) => update("dateFrom", value)} />
        <FilterInput label="Date to" type="date" value={filters.dateTo} onChange={(value) => update("dateTo", value)} />
        <FilterInput label="Amount" value={filters.amount} onChange={(value) => update("amount", value)} />
        <FilterInput label="Reference" value={filters.reference} onChange={(value) => update("reference", value)} />
      </div>
    </Panel>
  );
}

function FilterInput({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return (
    <label className="space-y-1 text-xs font-semibold uppercase text-slate-500">
      <span>{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full rounded border border-slate-200 bg-white px-3 text-sm font-medium normal-case text-slate-900 outline-none focus:border-slate-400"
      />
    </label>
  );
}

function MetricCard({ icon: Icon, label, value, detail, tone = "default" }: { icon: LucideIcon; label: string; value: React.ReactNode; detail: string; tone?: "default" | "warning" | "danger" }) {
  const toneClass = tone === "danger" ? "text-rose-700 bg-rose-50 border-rose-200" : tone === "warning" ? "text-amber-700 bg-amber-50 border-amber-200" : "text-slate-700 bg-slate-50 border-slate-200";
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

function Panel({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <section className="rounded border border-slate-200 bg-white">
      <div className="flex min-h-14 items-center justify-between gap-3 border-b border-slate-100 px-4">
        <h3 className="text-sm font-semibold text-slate-950">{title}</h3>
        {action}
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

function StateBanner<T>({ state, emptyText }: { state: LoadState<T[]>; emptyText: string }) {
  if (state.status === "loading") return <p className="mb-3 rounded bg-slate-50 px-3 py-2 text-sm text-slate-600">Loading finance data...</p>;
  if (state.status === "error") return <p className="mb-3 rounded bg-rose-50 px-3 py-2 text-sm text-rose-700">{state.error.message}</p>;
  if (state.data.length === 0) return <p className="mb-3 rounded bg-slate-50 px-3 py-2 text-sm text-slate-600">{emptyText}</p>;
  return null;
}

function DetailLayout<T>({ eyebrow, title, description, state, children }: { eyebrow: string; title: string; description: string; state: LoadState<T>; children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <FinanceHero eyebrow={eyebrow} title={title} description={description} />
      {state.status === "loading" && <Panel title="Loading"><p className="text-sm text-slate-600">Loading detail workspace...</p></Panel>}
      {state.status === "error" && <Panel title="Unable to load"><p className="text-sm text-rose-700">{state.error.message}</p></Panel>}
      {state.status === "ready" && children}
    </div>
  );
}

function AccordionGroup({ sections }: { sections: Array<[string, React.ReactNode]> }) {
  return (
    <div className="space-y-3">
      {sections.map(([title, content]) => (
        <details key={title} className="rounded border border-slate-200 bg-white" open>
          <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-slate-950">{title}</summary>
          <div className="border-t border-slate-100 p-4">{content}</div>
        </details>
      ))}
    </div>
  );
}

function KeyValueList({ items }: { items: Array<[string, string]> }) {
  return (
    <dl className="grid gap-3 md:grid-cols-2">
      {items.map(([label, value]) => (
        <div key={label} className="rounded border border-slate-100 bg-slate-50 px-3 py-2">
          <dt className="text-xs font-semibold uppercase text-slate-500">{label}</dt>
          <dd className="mt-1 break-words text-sm font-medium text-slate-950">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function RecordTable({ rows, empty }: { rows: Array<Record<string, unknown>>; empty: string }) {
  if (rows.length === 0) return <p className="text-sm text-slate-600">{empty}</p>;
  return <RawJson data={rows} />;
}

function RawJson({ data }: { data: unknown }) {
  return <pre className="max-h-96 overflow-auto rounded bg-slate-950 p-4 text-xs text-slate-100">{JSON.stringify(data, null, 2)}</pre>;
}

function Timeline({ items }: { items: Array<[string, string, string]> }) {
  if (items.length === 0) return <p className="text-sm text-slate-600">No timeline events available.</p>;
  return (
    <div className="space-y-3">
      {items.map(([title, when, detail]) => (
        <div key={`${title}-${when}`} className="flex gap-3">
          <div className="mt-1 h-2 w-2 rounded-full bg-slate-950" />
          <div>
            <p className="text-sm font-semibold text-slate-950">{title}</p>
            <p className="text-xs text-slate-500">{when}</p>
            <p className="text-sm text-slate-600">{detail}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function DisabledActions({ actions }: { actions: string[] }) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {actions.map((action) => (
        <button key={action} type="button" disabled className="h-10 rounded border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-400">
          {action} - Needs API
        </button>
      ))}
    </div>
  );
}

function FinanceDashboardWidgets() {
  return (
    <Panel title="Finance Dashboard">
      <div className="space-y-3">
        {[
          ["Payment Failures", "Monitor failed payment spikes from gateway responses."],
          ["Refund Delay", "Needs refund SLA API."],
          ["Wallet Liability", "Visible in wallet workspace."],
          ["Settlement Queue", "Needs settlement API."],
          ["Gateway Alerts", "Needs health metrics API."],
          ["Suspicious Activity", "Fraud scoring placeholder."],
          ["High Value Transactions", "Flagged from current result set."],
        ].map(([title, detail]) => (
          <div key={title} className="rounded border border-slate-100 bg-slate-50 px-3 py-2">
            <p className="text-sm font-semibold text-slate-950">{title}</p>
            <p className="text-xs text-slate-500">{detail}</p>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function PlaceholderWorkspace({ title, description, cards }: { title: string; description: string; cards: Array<[string, string]> }) {
  return (
    <div className="space-y-6">
      <FinanceHero eyebrow="Finance Operations" title={title} description={description} />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map(([label, detail]) => (
          <MetricCard key={label} icon={Landmark} label={label} value="--" detail={detail} />
        ))}
      </div>
      <Panel title="Future Actions">
        <DisabledActions actions={["Run reconciliation", "Create settlement note", "Export report", "Assign finance owner"]} />
      </Panel>
    </div>
  );
}

function LinkBlock({ href, label }: { href: string | null; label: string }) {
  if (!href) return <p className="text-sm text-slate-600">{label}</p>;
  return <Link className="inline-flex items-center gap-2 text-sm font-semibold text-slate-950" href={href}>{label}<ArrowRight className="h-4 w-4" /></Link>;
}

function StatusPill({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex h-7 items-center rounded bg-slate-100 px-2 text-xs font-semibold capitalize text-slate-700">{children}</span>;
}

function toQuery(filters: FilterState): AdminListQuery {
  return {
    limit: 100,
    offset: 0,
    status: filters.status || undefined,
    gateway: filters.gateway || undefined,
    booking: filters.booking || undefined,
    customer: filters.customer || undefined,
    dateFrom: filters.dateFrom || undefined,
    dateTo: filters.dateTo || undefined,
    amount: filters.amount || undefined,
    reference: filters.reference || undefined,
  };
}

function filterPayments(rows: AdminPaymentRow[], filters: FilterState) {
  return rows.filter((row) => {
    if (filters.booking && !contains(row.bookingId, filters.booking)) return false;
    if (filters.customer && !contains(`${row.mobile ?? ""} ${row.userId ?? ""}`, filters.customer)) return false;
    if (filters.gateway && !contains(row.gateway, filters.gateway)) return false;
    if (filters.status && !contains(row.status, filters.status)) return false;
    if (filters.amount && !contains(String(row.amount ?? ""), filters.amount)) return false;
    if (filters.reference && !contains(`${row.paymentRef ?? ""} ${row.gatewayOrderId ?? ""} ${row.gatewayPaymentId ?? ""}`, filters.reference)) return false;
    return true;
  });
}

function filterRefunds(rows: AdminRefundRow[], filters: FilterState) {
  return rows.filter((row) => {
    if (filters.booking && !contains(row.bookingId, filters.booking)) return false;
    if (filters.status && !contains(row.status, filters.status)) return false;
    if (filters.amount && !contains(String(row.amount ?? ""), filters.amount)) return false;
    if (filters.reference && !contains(`${row.refundRef ?? ""} ${row.gatewayRefundId ?? ""}`, filters.reference)) return false;
    return true;
  });
}

function countStatuses<T extends { status?: string }>(rows: T[], statuses: string[]) {
  return Object.fromEntries(statuses.map((status) => [status, rows.filter((row) => isStatus(row.status, status)).length])) as Record<string, number>;
}

function summarizeBy<T>(rows: T[], getLabel: (row: T) => string) {
  const map = new Map<string, number>();
  rows.forEach((row) => map.set(getLabel(row), (map.get(getLabel(row)) ?? 0) + 1));
  return [...map.entries()].map(([label, count]) => ({ label, count }));
}

function paymentTimeline(payment: AdminPaymentRow, attempts: Array<Record<string, unknown>>, refunds: AdminRefundRow[]): Array<[string, string, string]> {
  return [
    ["Payment created", formatDate(payment.createdAt), "Observed from payment record."],
    ["Payment paid", formatDate(payment.paidAt), payment.paidAt ? "Observed from payment record." : "Payment success timestamp unavailable."],
    ["Payment attempts", `${attempts.length} attempt(s)`, attempts.length ? "Observed from payment attempts read model." : "Attempts API returned no rows."],
    ["Refunds", `${refunds.length} linked refund(s)`, refunds.length ? "Observed from refund records." : "No linked refunds returned."],
  ];
}

function contains(value: unknown, expected: string) {
  return String(value ?? "").toLowerCase().includes(expected.toLowerCase());
}

function isStatus(value: unknown, ...statuses: string[]) {
  return statuses.some((status) => String(value ?? "").toLowerCase().includes(status));
}

function sum(rows: AdminWalletRow[], key: "promoCredit" | "earnedCredit" | "refundableBalance") {
  return rows.reduce((total, row) => total + Number(row[key] ?? 0), 0);
}

function money(value?: number, currency = "INR") {
  if (typeof value !== "number" || Number.isNaN(value)) return "-";
  return `${currency} ${value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

function formatDate(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

function shortId(value?: string | null) {
  if (!value) return "";
  return value.length > 14 ? `${value.slice(0, 8)}...${value.slice(-4)}` : value;
}

function textValue(value: unknown) {
  return typeof value === "string" && value.trim() ? value : "-";
}

const GiftIcon = ReceiptIndianRupee;
