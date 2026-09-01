"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  KeyRound,
  Mail,
  Phone,
  RefreshCcw,
  Search,
  ShieldCheck,
} from "lucide-react";
import {
  getAdminIdentityAccessOverview,
  type AdminApiResult,
  type AdminAuthActivityEvent,
  type AdminIdentityAccessOverview,
} from "@/app/lib/admin/adminApiClient";

type Filters = {
  context: string;
  method: string;
  result: string;
  search: string;
};

const emptyOverview: AdminIdentityAccessOverview = {
  summary: {
    mobileOtp: 0,
    emailOtp: 0,
    googleLogin: 0,
    partnerContext: 0,
    successful: 0,
    failed: 0,
    accountLinkingRequired: 0,
  },
  events: [],
};

export function AdminIdentityAccessCenter() {
  const [filters, setFilters] = useState<Filters>({ context: "", method: "", result: "", search: "" });
  const [state, setState] = useState<AdminApiResult<AdminIdentityAccessOverview> | null>(null);
  const [loading, setLoading] = useState(true);

  const query = useMemo(() => ({
    ...(filters.context ? { context: filters.context } : {}),
    ...(filters.method ? { method: filters.method } : {}),
    ...(filters.result ? { result: filters.result } : {}),
    ...(filters.search ? { search: filters.search } : {}),
  }), [filters]);

  useEffect(() => {
    let active = true;
    void getAdminIdentityAccessOverview(query).then((result) => {
      if (!active) return;
      setState(result);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [query]);

  const data = state?.ok ? state.data : emptyOverview;
  const failedEvents = data.events.filter((event) => event.result === "failed").slice(0, 8);

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-2xl border border-indigo-100 bg-white shadow-sm">
        <div className="bg-gradient-to-r from-indigo-700 via-blue-700 to-cyan-600 p-6 text-white">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-bold uppercase">
                <KeyRound className="h-4 w-4" />
                Admin Controls
              </div>
              <h2 className="mt-4 text-2xl font-black tracking-tight">Identity & Access</h2>
              <p className="mt-2 max-w-3xl text-sm font-medium text-indigo-50">
                Manage sign-in health, account access and authentication activity without exposing OTPs or secrets.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setLoading(true);
                void getAdminIdentityAccessOverview(query).then((result) => {
                  setState(result);
                  setLoading(false);
                });
              }}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-white px-4 text-sm font-bold text-indigo-700 shadow-sm hover:bg-indigo-50"
            >
              <RefreshCcw className="h-4 w-4" />
              Refresh
            </button>
          </div>
        </div>

        <div className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-4">
          <StatusCard icon={Phone} label="Mobile Sign-ins" value={data.summary.mobileOtp} detail="WhatsApp verification activity" tone="blue" />
          <StatusCard icon={Mail} label="Email Sign-ins" value={data.summary.emailOtp} detail="Email verification activity" tone="cyan" />
          <StatusCard icon={ShieldCheck} label="Google Sign-ins" value={data.summary.googleLogin} detail="Google account activity" tone="indigo" />
          <StatusCard icon={KeyRound} label="Partner Access" value={data.summary.partnerContext} detail="Partner account activity" tone="emerald" />
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.1fr_.9fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h3 className="text-base font-black text-slate-950">Authentication Activity</h3>
              <p className="text-xs font-medium text-slate-500">Recent sign-in events with masked account details.</p>
            </div>
            <div className="grid gap-2 sm:grid-cols-4">
              <SelectFilter label="Area" value={filters.context} values={["", "user", "partner"]} labels={{ user: "Customer Account", partner: "Partner Account" }} onChange={(value) => setFilters((current) => ({ ...current, context: value }))} />
              <SelectFilter label="Method" value={filters.method} values={["", "mobile", "email", "google"]} labels={{ mobile: "WhatsApp OTP", email: "Email OTP", google: "Google" }} onChange={(value) => setFilters((current) => ({ ...current, method: value }))} />
              <SelectFilter label="Result" value={filters.result} values={["", "success", "failed", "attempt"]} labels={{ success: "Successful", failed: "Failed", attempt: "Started" }} onChange={(value) => setFilters((current) => ({ ...current, result: value }))} />
              <label className="relative">
                <span className="sr-only">Search masked identifier</span>
                <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  value={filters.search}
                  onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
                  className="h-9 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-xs font-semibold outline-none focus:border-indigo-400"
                  placeholder="Masked search"
                />
              </label>
            </div>
          </div>
          {state && !state.ok ? <Notice tone="error" text={state.error.message} /> : null}
          {loading ? <Notice tone="info" text="Loading identity and auth activity..." /> : <ActivityTable events={data.events} />}
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-rose-100 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-rose-600" />
              <h3 className="text-base font-black text-slate-950">Sign-in Issues</h3>
            </div>
            <div className="mt-3 space-y-2">
              {failedEvents.length ? failedEvents.map((event) => <IssueRow key={event.id} event={event} />) : (
                <p className="rounded-xl bg-slate-50 p-3 text-xs font-semibold text-slate-500">No failed sign-in events in the current view.</p>
              )}
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-base font-black text-slate-950">Identity Health</h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <MiniStat label="Successful" value={data.summary.successful} tone="green" />
              <MiniStat label="Failed" value={data.summary.failed} tone="red" />
              <MiniStat label="Needs attention" value={data.summary.accountLinkingRequired} tone="amber" />
            </div>
            <p className="mt-3 text-xs font-medium leading-5 text-slate-500">
              Mobile and email values stay masked in broad lists. Account recovery actions remain permission-gated.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function SelectFilter({
  label,
  value,
  values,
  labels = {},
  onChange,
}: {
  label: string;
  value: string;
  values: string[];
  labels?: Record<string, string>;
  onChange: (value: string) => void;
}) {
  return (
    <label>
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 w-full rounded-lg border border-slate-200 px-2 text-xs font-semibold capitalize text-slate-700 outline-none focus:border-indigo-400"
      >
        {values.map((item) => <option key={item || "all"} value={item}>{item ? labels[item] || humanizeValue(item) : label}</option>)}
      </select>
    </label>
  );
}

function StatusCard({ icon: Icon, label, value, detail, tone }: { icon: typeof Phone; label: string; value: number; detail: string; tone: "blue" | "cyan" | "indigo" | "emerald" }) {
  const tones = {
    blue: "bg-blue-50 text-blue-700 ring-blue-100",
    cyan: "bg-cyan-50 text-cyan-700 ring-cyan-100",
    indigo: "bg-indigo-50 text-indigo-700 ring-indigo-100",
    emerald: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  };
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ring-1 ${tones[tone]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-3 text-xs font-bold uppercase text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-black text-slate-950">{value}</p>
      <p className="mt-1 text-xs font-medium text-slate-500">{detail}</p>
    </div>
  );
}

function ActivityTable({ events }: { events: AdminAuthActivityEvent[] }) {
  if (!events.length) return <Notice tone="info" text="No auth activity events match the current filters yet." />;
  return (
    <div className="mt-4 overflow-x-auto">
      <table className="min-w-full text-left text-xs">
        <thead>
          <tr className="border-b border-slate-200 text-[11px] uppercase text-slate-400">
            <th className="py-2 pr-3 font-black">Time</th>
            <th className="py-2 pr-3 font-black">Account</th>
            <th className="py-2 pr-3 font-black">Sign-in method</th>
            <th className="py-2 pr-3 font-black">Area</th>
            <th className="py-2 pr-3 font-black">Result</th>
            <th className="py-2 pr-3 font-black">Details</th>
          </tr>
        </thead>
        <tbody>
          {events.map((event) => (
            <tr key={event.id} className="border-b border-slate-100 text-slate-700">
              <td className="py-3 pr-3 whitespace-nowrap">{formatTime(event.createdAt)}</td>
              <td className="py-3 pr-3 font-mono text-[11px]">{event.maskedIdentifier ?? "masked"}</td>
              <td className="py-3 pr-3 font-bold">{methodLabel(event.method)}</td>
              <td className="py-3 pr-3">{areaLabel(event.context)}</td>
              <td className="py-3 pr-3"><ResultChip result={event.result} /></td>
              <td className="py-3 pr-3 font-semibold">{eventDetailLabel(event)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function IssueRow({ event }: { event: AdminAuthActivityEvent }) {
  return (
    <div className="rounded-xl border border-rose-100 bg-rose-50/60 p-3">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-black text-rose-800">{methodLabel(event.method)} · {areaLabel(event.context)}</span>
        <span className="text-[11px] font-semibold text-rose-600">{formatTime(event.createdAt)}</span>
      </div>
      <p className="mt-1 font-mono text-[11px] text-slate-700">{event.maskedIdentifier ?? "masked identifier"}</p>
      <p className="mt-1 text-xs font-bold text-slate-700">{failureReasonLabel(event.reasonCode ?? event.eventType)}</p>
    </div>
  );
}

function ResultChip({ result }: { result: string }) {
  const tone = result === "success"
    ? "bg-emerald-50 text-emerald-700 ring-emerald-100"
    : result === "failed"
      ? "bg-rose-50 text-rose-700 ring-rose-100"
      : "bg-blue-50 text-blue-700 ring-blue-100";
  return <span className={`rounded-full px-2 py-1 text-[11px] font-black ring-1 ${tone}`}>{resultLabel(result)}</span>;
}

function humanizeValue(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function methodLabel(value: string) {
  if (value === "mobile") return "WhatsApp OTP";
  if (value === "email") return "Email OTP";
  if (value === "google") return "Google";
  return humanizeValue(value || "Sign-in");
}

function areaLabel(value: string) {
  if (value === "partner") return "Partner Account";
  if (value === "user") return "Customer Account";
  return humanizeValue(value || "Account");
}

function resultLabel(value: string) {
  if (value === "success") return "Successful";
  if (value === "failed") return "Failed";
  if (value === "attempt") return "Started";
  return humanizeValue(value || "Status");
}

function failureReasonLabel(value?: string | null) {
  if (!value) return "Sign-in could not be completed";
  const normalized = value.toUpperCase();
  if (normalized.includes("OTP_INVALID")) return "Incorrect verification code";
  if (normalized.includes("OTP_EXPIRED")) return "Verification code expired";
  if (normalized.includes("OTP_TOO_MANY_ATTEMPTS")) return "Too many verification attempts";
  if (normalized.includes("OTP_RESEND_COOLDOWN")) return "Please wait before requesting another code";
  if (normalized.includes("OTP_RATE_LIMITED")) return "Too many requests";
  if (normalized.includes("OTP_PROVIDER_FAILURE")) return "Verification code could not be sent";
  if (normalized.includes("ACCOUNT_LINKING_REQUIRED")) return "Account needs verification";
  if (normalized.includes("GOOGLE")) return "Google sign-in could not be completed";
  return humanizeValue(value.toLowerCase());
}

function eventDetailLabel(event: AdminAuthActivityEvent) {
  if (event.result === "failed") return failureReasonLabel(event.reasonCode ?? event.eventType);
  const normalized = event.eventType.toUpperCase();
  if (normalized.includes("OTP_SEND")) return "Verification code sent";
  if (normalized.includes("OTP_VERIFY")) return "Verification code confirmed";
  if (normalized.includes("LOGIN_SUCCESS")) return "Signed in successfully";
  if (normalized.includes("GOOGLE_LOGIN")) return "Google sign-in completed";
  if (normalized.includes("EMAIL_LOGIN")) return "Email sign-in completed";
  if (normalized.includes("PARTNER_CONTEXT")) return "Partner account checked";
  if (normalized.includes("ACCOUNT_LINKING")) return "Account needs verification";
  return humanizeValue(event.eventType.toLowerCase());
}

function MiniStat({ label, value, tone }: { label: string; value: number; tone: "green" | "red" | "amber" }) {
  const tones = {
    green: "bg-emerald-50 text-emerald-700",
    red: "bg-rose-50 text-rose-700",
    amber: "bg-amber-50 text-amber-700",
  };
  return (
    <div className={`rounded-xl p-3 ${tones[tone]}`}>
      <p className="text-[11px] font-black uppercase">{label}</p>
      <p className="mt-1 text-xl font-black">{value}</p>
    </div>
  );
}

function Notice({ tone, text }: { tone: "info" | "error"; text: string }) {
  const classes = tone === "error" ? "border-rose-100 bg-rose-50 text-rose-700" : "border-blue-100 bg-blue-50 text-blue-700";
  return <p className={`mt-4 rounded-xl border p-3 text-xs font-bold ${classes}`}>{text}</p>;
}

function formatTime(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}
