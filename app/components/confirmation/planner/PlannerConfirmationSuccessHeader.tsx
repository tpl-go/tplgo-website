"use client";

import { CheckCircle2, CalendarDays, MapPin, ReceiptText } from "lucide-react";

type Props = {
  bookedAt?: string;
  bookingId: string;
  bookingStatus?: string;
  paymentStatus?: string;
  route?: string[] | string;
  title: string;
  travelDate?: string;
};

function formatDate(value?: string) {
  if (!value) return "On Request";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    weekday: "short",
    year: "numeric",
  });
}

function formatDateTime(value?: string) {
  if (!value) return "Just now";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString("en-GB", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function routeLabel(route?: string[] | string) {
  if (Array.isArray(route)) return route.filter(Boolean).join(" • ");
  return route || "Route not available";
}

export default function PlannerConfirmationSuccessHeader({
  bookedAt,
  bookingId,
  bookingStatus = "confirmed",
  paymentStatus = "paid",
  route,
  title,
  travelDate,
}: Props) {
  return (
    <section className="overflow-hidden rounded-[24px] border border-[#d9e2ec] bg-[linear-gradient(135deg,#ecfeff_0%,#f8fafc_45%,#ffffff_100%)] shadow-[0_14px_40px_rgba(15,23,42,0.08)]">
      <div className="relative overflow-hidden px-6 py-7">
        <div className="absolute -right-10 -top-10 h-44 w-44 rounded-full bg-blue-500/10 blur-sm" />
        <div className="absolute -bottom-8 -left-6 h-32 w-32 rounded-full bg-emerald-500/10 blur-sm" />

        <div className="relative flex flex-wrap items-start justify-between gap-5">
          <div className="min-w-0 flex-1">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-[13px] font-black text-emerald-700">
              <CheckCircle2 className="h-4 w-4" />
              Smart Planner Booking Confirmed
            </div>

            <h1 className="mt-4 break-words text-[28px] font-black leading-tight text-slate-950">
              {title}
            </h1>

            <div className="mt-3 flex min-w-0 items-center gap-2 text-[14px] font-semibold text-slate-600">
              <MapPin className="h-4 w-4 shrink-0 text-orange-500" />
              <span className="truncate">{routeLabel(route)}</span>
            </div>
          </div>

          <div className="grid min-w-[360px] grid-cols-2 gap-3">
            <Mini label="Booking ID" value={bookingId} icon={<ReceiptText className="h-4 w-4" />} />
            <Mini label="Travel Date" value={formatDate(travelDate)} icon={<CalendarDays className="h-4 w-4" />} />
            <Mini label="Booking Status" value={bookingStatus} />
            <Mini label="Payment Status" value={paymentStatus} />
          </div>
        </div>

        <div className="relative mt-5 text-[13px] font-semibold text-slate-500">
          Confirmed at {formatDateTime(bookedAt)}
        </div>
      </div>
    </section>
  );
}

function Mini({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
      <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-wide text-slate-500">
        {icon}
        {label}
      </div>
      <div className="mt-1 truncate text-[13px] font-black text-slate-950">{value}</div>
    </div>
  );
}
