"use client";

import type { TrainBookingPayload } from "@/app/lib/train/trainBookingTypes";

type Props = {
  bookingPayload: TrainBookingPayload;
};

function getQuotaLabel(quota: string) {
  switch (quota) {
    case "general":
      return "General";
    case "tatkal":
      return "Tatkal";
    case "seniorCitizen":
      return "Senior Citizen";
    case "ladies":
      return "Ladies";
    default:
      return quota;
  }
}

function formatJourneyDate(dateStr?: string) {
  if (!dateStr) return "Date not selected";

  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;

  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function TrainBookingSummaryCard({
  bookingPayload,
}: Props) {
  const { train, bookingSelection, selectedClass } = bookingPayload;

  const fareToShow =
    bookingSelection.ticketType === "confirm" &&
    bookingSelection.confirmTicketPrice
      ? bookingSelection.confirmTicketPrice
      : bookingSelection.ticketPrice;

  return (
    <section className="overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 bg-[linear-gradient(135deg,#eff6ff,#ffffff)] px-5 py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            {train.offerTag ? (
              <div className="mb-2 inline-flex rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-bold text-emerald-700">
                {train.offerTag}
              </div>
            ) : null}

            <div className="text-[22px] font-extrabold uppercase leading-tight text-slate-900">
              {train.trainName}
            </div>

            <div className="mt-1 text-[13px] font-semibold text-slate-500">
              #{train.trainNumber}
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-2 text-[13px] text-slate-600">
              <span>{formatJourneyDate(bookingSelection.journeyDate)}</span>
              <span>•</span>
              <span>{getQuotaLabel(bookingSelection.quota)}</span>
              <span>•</span>
              <span>{bookingSelection.ticketType === "confirm" ? "Confirm Ticket" : "Regular Ticket"}</span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-right shadow-sm">
            <div className="text-[12px] font-bold uppercase tracking-wide text-slate-500">
              Selected Fare
            </div>
            <div className="mt-1 text-[24px] font-black text-slate-900">
              ₹{fareToShow.toLocaleString("en-IN")}
            </div>
            <div className="text-[12px] text-slate-500">
              {bookingSelection.classCode} • {getQuotaLabel(bookingSelection.quota)}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 px-5 py-5">
        <div>
          <div className="text-[26px] font-black leading-none text-slate-900">
            {train.departureTime}
          </div>
          <div className="mt-1 text-[13px] text-slate-500">
            {train.departureDateLabel}
          </div>
          <div className="mt-2 text-[16px] font-extrabold text-slate-900">
            {train.fromStationCode}
          </div>
          <div className="text-[13px] text-slate-500">
            {train.fromCity}
          </div>
        </div>

        <div className="min-w-[180px] text-center">
          <div className="text-[14px] font-bold text-slate-600">
            {train.duration}
          </div>
          <div className="mt-2 h-px w-full bg-slate-200" />
          <div className="mt-2 text-[12px] font-semibold uppercase tracking-wide text-sky-600">
            Train Journey
          </div>
        </div>

        <div className="text-right">
          <div className="text-[26px] font-black leading-none text-slate-900">
            {train.arrivalTime}
          </div>
          <div className="mt-1 text-[13px] text-slate-500">
            {train.arrivalDateLabel}
          </div>
          <div className="mt-2 text-[16px] font-extrabold text-slate-900">
            {train.toStationCode}
          </div>
          <div className="text-[13px] text-slate-500">
            {train.toCity}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4">
        <MiniInfo
          label="Class"
          value={selectedClass?.classCode || bookingSelection.classCode}
        />
        <MiniInfo
          label="Booking Type"
          value={bookingSelection.ticketType === "confirm" ? "Confirm Ticket" : "Regular"}
        />
        <MiniInfo
          label="Status"
          value={bookingSelection.statusText}
        />
        <MiniInfo
          label="Route"
          value={`${train.fromCode} → ${train.toCode}`}
        />
      </div>
    </section>
  );
}

function MiniInfo({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[16px] border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <div className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
        {label}
      </div>
      <div className="mt-1 text-[14px] font-bold text-slate-900">
        {value}
      </div>
    </div>
  );
}