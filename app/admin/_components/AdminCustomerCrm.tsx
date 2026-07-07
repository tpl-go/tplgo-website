"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  CalendarDays,
  ChevronDown,
  CircleDot,
  Headphones,
  Mail,
  MapPin,
  MessageSquareText,
  Phone,
  Search,
  ShieldAlert,
  Star,
  Tags,
  UserRound,
  WalletCards,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  getAdminCustomerDetail,
  listAdminCustomers,
  type AdminApiResult,
  type AdminCustomerDetail,
  type AdminCustomerListRow,
  type AdminListQuery,
} from "../../lib/admin/adminApiClient";

type LoadState<T> = {
  loading: boolean;
  result: AdminApiResult<T> | null;
};

type RequestState<T> = {
  key: string;
  result: AdminApiResult<T> | null;
};

export function AdminCustomerCrmList() {
  const [query, setQuery] = useState<AdminListQuery>({ limit: 100, offset: 0 });
  const [typeFilter, setTypeFilter] = useState("");
  const requestKey = JSON.stringify(query);
  const [requestState, setRequestState] = useState<RequestState<AdminCustomerListRow[]>>({ key: requestKey, result: null });

  useEffect(() => {
    let active = true;
    listAdminCustomers(query).then((result) => {
      if (active) setRequestState({ key: requestKey, result });
    });
    return () => {
      active = false;
    };
  }, [query, requestKey]);

  const loadState: LoadState<AdminCustomerListRow[]> = {
    loading: requestState.key !== requestKey || requestState.result === null,
    result: requestState.key === requestKey ? requestState.result : null,
  };
  const rows = useMemo(() => {
    const source = loadState.result?.ok ? loadState.result.data : [];
    return typeFilter ? source.filter((row) => row.accountType.toLowerCase().includes(typeFilter.toLowerCase())) : source;
  }, [loadState.result, typeFilter]);
  const overview = buildCustomerOverview(rows);

  return (
    <div className="space-y-6">
      <StatusNotice loading={loadState.loading} result={loadState.result} />

      <section className="rounded border border-slate-200 bg-white p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-400">Customer management</p>
            <h2 className="mt-1 text-lg font-semibold text-slate-950">Customers / CRM Foundation</h2>
            <p className="mt-1 text-sm text-slate-500">Read-only customer search, booking context, wallet signals, and CRM readiness.</p>
          </div>
          <span className="rounded bg-slate-100 px-3 py-2 text-xs font-medium text-slate-600">Read-only CRM foundation</span>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <FilterInput label="Name / email / mobile / customer id" value={query.search ?? ""} onChange={(search) => setQuery((current) => ({ ...current, search }))} />
          <FilterInput label="Status" value={query.status ?? ""} onChange={(status) => setQuery((current) => ({ ...current, status }))} />
          <FilterInput label="Customer type / tag" value={typeFilter} onChange={setTypeFilter} placeholder="Needs CRM tags API" />
          <FilterInput label="Mobile" value={query.mobile ?? ""} onChange={(mobile) => setQuery((current) => ({ ...current, mobile }))} />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={UserRound} label="Customers" value={overview.total} detail="Current result set" />
        <MetricCard icon={BookOpen} label="With bookings" value={overview.withBookings} detail="Booking-linked customers" />
        <MetricCard icon={WalletCards} label="With wallet" value={overview.withWallet} detail="Wallet summary available" />
        <MetricCard icon={ShieldAlert} label="Needs follow-up" value={0} detail="Needs CRM follow-up API" muted />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_0.38fr]">
        <div className="overflow-hidden rounded border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-5 py-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase text-slate-400">Customer records</p>
                <h2 className="mt-1 text-sm font-semibold text-slate-950">Searchable customer list</h2>
              </div>
              <span className="text-xs text-slate-500">{rows.length} visible</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50">
                <tr>
                  {["customer", "contact", "status", "type", "bookings", "wallet", "last booking", "action"].map((column) => (
                    <th key={column} className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase text-slate-500">{column}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.length === 0 ? (
                  <tr>
                    <td className="px-4 py-10 text-center text-sm text-slate-500" colSpan={8}>
                      {loadState.loading ? "Loading customers" : "No customers match the selected filters."}
                    </td>
                  </tr>
                ) : rows.map((customer) => (
                  <tr key={customer.customerId} className="hover:bg-slate-50">
                    <td className="min-w-56 px-4 py-3">
                      <Link className="font-semibold text-slate-950 underline-offset-2 hover:underline" href={`/admin/customers/${encodeURIComponent(customer.customerId)}`}>
                        {formatCell(customer.fullName) !== "-" ? customer.fullName : customer.publicId}
                      </Link>
                      <p className="mt-1 text-xs text-slate-500">{customer.publicId}</p>
                    </td>
                    <td className="min-w-48 px-4 py-3 text-slate-700">
                      <p>{customer.mobile}</p>
                      <p className="mt-1 text-xs text-slate-500">{formatCell(customer.email)}</p>
                    </td>
                    <td className="px-4 py-3"><StatusPill value={customer.status} /></td>
                    <td className="px-4 py-3 text-slate-700">{customer.accountType}</td>
                    <td className="px-4 py-3 text-slate-700">{customer.totalBookings}</td>
                    <td className="px-4 py-3 text-slate-700">{customer.wallet ? formatMoney(walletTotal(customer.wallet), customer.wallet.currency) : "-"}</td>
                    <td className="px-4 py-3 text-slate-700">{formatCell(customer.lastBookingRef)}</td>
                    <td className="px-4 py-3">
                      <Link className="inline-flex h-8 items-center gap-2 rounded bg-slate-950 px-3 text-xs font-medium text-white" href={`/admin/customers/${encodeURIComponent(customer.customerId)}`}>
                        Quick view
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-4">
          <CrmPlaceholder title="Lead status" detail="Needs CRM lead pipeline API." />
          <CrmPlaceholder title="Assigned agent" detail="Needs agent assignment API." />
          <CrmPlaceholder title="Communication timeline" detail="Needs omnichannel communication events API." />
        </div>
      </section>
    </div>
  );
}

export function AdminCustomerWorkspace({ customerId }: { customerId: string }) {
  const [requestState, setRequestState] = useState<RequestState<AdminCustomerDetail>>({ key: customerId, result: null });

  useEffect(() => {
    let active = true;
    getAdminCustomerDetail(customerId).then((result) => {
      if (active) setRequestState({ key: customerId, result });
    });
    return () => {
      active = false;
    };
  }, [customerId]);

  const loadState: LoadState<AdminCustomerDetail> = {
    loading: requestState.key !== customerId || requestState.result === null,
    result: requestState.key === customerId ? requestState.result : null,
  };
  const detail = loadState.result?.ok ? loadState.result.data : null;
  const customer = detail?.customer;

  return (
    <div className="space-y-6">
      <StatusNotice loading={loadState.loading} result={loadState.result} />
      {customer ? (
        <>
          <section className="rounded border border-slate-200 bg-white p-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase text-slate-400">Customer workspace</p>
                <h2 className="mt-1 text-xl font-semibold text-slate-950">{formatCell(customer.fullName) !== "-" ? customer.fullName : customer.publicId}</h2>
                <p className="mt-2 text-sm text-slate-500">{customer.mobile} · {formatCell(customer.email)}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <StatusPill value={customer.status} />
                <span className="rounded bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">{customer.accountType}</span>
              </div>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard icon={BookOpen} label="Total bookings" value={customer.totalBookings} detail="From admin booking records" />
            <SummaryTile icon={CalendarDays} label="Last booking" value={formatCell(customer.lastBookingRef)} />
            <SummaryTile icon={WalletCards} label="Wallet" value={customer.wallet ? formatMoney(walletTotal(customer.wallet), customer.wallet.currency) : "No wallet"} />
            <SummaryTile icon={Star} label="Priority" value="Needs CRM API" />
          </section>

          <section className="grid gap-4 xl:grid-cols-[1fr_0.42fr]">
            <div className="space-y-4">
              <AccordionPanel title="Overview" icon={UserRound} defaultOpen>
                <DescriptionGrid items={[
                  ["Customer ID", customer.customerId],
                  ["Public ID", customer.publicId],
                  ["Account type", customer.accountType],
                  ["Status", customer.status],
                  ["Created", customer.createdAt],
                  ["Last login", customer.lastLoginAt],
                ]} />
              </AccordionPanel>

              <AccordionPanel title="Contact / Profile" icon={Phone} defaultOpen>
                <DescriptionGrid items={[
                  ["Mobile", customer.mobile],
                  ["Email", customer.email],
                  ["Full name", customer.fullName],
                  ["Profile", detail.profile ? "Profile record available" : "No profile record returned"],
                  ["Address", detail.profile?.address ? JSON.stringify(detail.profile.address) : undefined],
                  ["Preferences", detail.profile?.preferences ? JSON.stringify(detail.profile.preferences) : undefined],
                ]} />
              </AccordionPanel>

              <AccordionPanel title="Booking History" icon={BookOpen} defaultOpen>
                <SimpleTable
                  rows={detail.bookings}
                  columns={["bookingRef", "mobile", "status", "bookingStatus", "paymentStatus"]}
                  emptyLabel="No bookings returned for this customer."
                  linkBase="/admin/bookings"
                />
              </AccordionPanel>

              <AccordionPanel title="Wallet Summary" icon={WalletCards}>
                <DescriptionGrid items={[
                  ["Status", customer.wallet?.status],
                  ["Currency", customer.wallet?.currency],
                  ["Promo credit", customer.wallet?.promoCredit],
                  ["Earned credit", customer.wallet?.earnedCredit],
                  ["Refundable balance", customer.wallet?.refundableBalance],
                  ["Ledger", "Needs wallet ledger admin API"],
                ]} />
              </AccordionPanel>

              <AccordionPanel title="Traveller Profile" icon={UserRound}>
                <SimpleTable rows={detail.travellers} columns={["travellerType", "firstName", "lastName", "email", "mobile"]} emptyLabel="No saved travellers returned." />
              </AccordionPanel>

              <AccordionPanel title="Audit / Activity" icon={ShieldAlert}>
                <CrmPlaceholder title="Audit/activity" detail="Needs customer activity and admin CRM audit read model." />
              </AccordionPanel>
            </div>

            <div className="space-y-4">
              <CrmPanel />
              <CrmPlaceholder title="CRM notes" detail="Read-only placeholder. Needs audited CRM notes API." icon={MessageSquareText} />
              <CrmPlaceholder title="Lead / enquiry timeline" detail="Needs lead and enquiry event API." icon={MapPin} />
              <CrmPlaceholder title="Support cases" detail="Needs support case API." icon={Headphones} />
              <CrmPlaceholder title="Risk / fraud flags" detail="Needs risk/fraud scoring API." icon={ShieldAlert} />
              <CrmPlaceholder title="Preferences / tags" detail="Needs CRM tags/preferences API." icon={Tags} />
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}

function CrmPanel() {
  return (
    <section className="rounded border border-slate-200 bg-white p-5">
      <div className="mb-4 flex items-center gap-2">
        <Mail className="h-4 w-4 text-slate-400" />
        <h2 className="text-sm font-semibold text-slate-950">CRM Foundation</h2>
      </div>
      <DescriptionGrid items={[
        ["Lead status", "Needs CRM API"],
        ["Follow-up required", "Needs CRM API"],
        ["Destination interest", "Needs CRM API"],
        ["Budget range", "Needs CRM API"],
        ["Customer priority", "Needs CRM API"],
        ["Conversion probability", "Needs scoring API"],
        ["Assigned agent", "Needs assignment API"],
        ["Communication timeline", "Needs communication API"],
      ]} />
    </section>
  );
}

function StatusNotice<T>({ loading, result }: LoadState<T>) {
  if (loading) return <div className="rounded border border-slate-200 bg-white p-4 text-sm text-slate-500">Loading customer data</div>;
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

function FilterInput({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-slate-500">{label}</span>
      <div className="relative mt-1">
        <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="h-9 w-full rounded border border-slate-200 px-3 pl-9 text-sm outline-none focus:border-slate-400"
        />
      </div>
    </label>
  );
}

function MetricCard({ icon: Icon, label, value, detail, muted = false }: { icon: LucideIcon; label: string; value: number; detail: string; muted?: boolean }) {
  return (
    <div className={["rounded border p-5", muted ? "border-dashed border-slate-300 bg-white" : "border-slate-200 bg-white"].join(" ")}>
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

function SimpleTable({ rows, columns, emptyLabel, linkBase }: { rows: Array<Record<string, unknown>>; columns: string[]; emptyLabel: string; linkBase?: string }) {
  return (
    <div className="overflow-hidden rounded border border-slate-200">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-slate-50">
            <tr>
              {columns.map((column) => <th key={column} className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase text-slate-500">{column}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {rows.length === 0 ? (
              <tr><td className="px-4 py-8 text-center text-sm text-slate-500" colSpan={columns.length}>{emptyLabel}</td></tr>
            ) : rows.map((row, index) => (
              <tr key={String(row.id ?? row.bookingRef ?? index)}>
                {columns.map((column) => {
                  const value = formatCell(row[column]);
                  const canLink = linkBase && column === "bookingRef" && value !== "-";
                  return (
                    <td key={column} className="max-w-72 truncate px-4 py-3 text-slate-700">
                      {canLink ? <Link className="font-medium text-slate-950 underline-offset-2 hover:underline" href={`${linkBase}/${encodeURIComponent(value)}`}>{value}</Link> : value}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CrmPlaceholder({ title, detail, icon: Icon = CircleDot }: { title: string; detail: string; icon?: LucideIcon }) {
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
  const classes = text.includes("disabled") || text.includes("blocked")
    ? "bg-rose-50 text-rose-700"
    : "bg-slate-100 text-slate-600";
  return <span className={`inline-flex max-w-36 rounded px-2 py-1 text-xs font-medium ${classes}`}>{text === "-" ? "unknown" : text}</span>;
}

function buildCustomerOverview(rows: AdminCustomerListRow[]) {
  return {
    total: rows.length,
    withBookings: rows.filter((row) => row.totalBookings > 0).length,
    withWallet: rows.filter((row) => Boolean(row.wallet)).length,
  };
}

function walletTotal(wallet: NonNullable<AdminCustomerListRow["wallet"]>): number {
  return wallet.promoCredit + wallet.earnedCredit + wallet.refundableBalance;
}

function formatMoney(amount: unknown, currency: unknown): string {
  const value = typeof amount === "number" ? amount.toLocaleString("en-IN") : formatCell(amount);
  const currencyText = typeof currency === "string" && currency.trim() ? currency : "INR";
  return value === "-" ? "-" : `${currencyText} ${value}`;
}

function formatCell(value: unknown): string {
  if (typeof value === "undefined" || value === null || value === "") return "-";
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return String(value);
  return JSON.stringify(value);
}
