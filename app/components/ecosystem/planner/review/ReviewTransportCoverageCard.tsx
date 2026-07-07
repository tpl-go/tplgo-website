"use client";

import type { LucideIcon } from "lucide-react";
import { BadgeIndianRupee, CalendarDays, Clock3, MapPin, UsersRound } from "lucide-react";
import { getReviewStatusVisual } from "./reviewStatusStyles";

export type TransportModeKey =
  | "flight"
  | "train"
  | "bus"
  | "cab"
  | "cruise"
  | "transfer";

export type TransportCoverageStatus =
  | "Selected"
  | "Recommended"
  | "Pending"
  | "Missing";

export type TransportMovement = {
  city?: string;
  date?: string;
  day?: number;
  estimatedValue?: number;
  from: string;
  id: string;
  mode: TransportModeKey;
  source: string;
  status: TransportCoverageStatus;
  time?: string;
  title: string;
  to: string;
  travellerCount?: number;
};

type ReviewTransportCoverageCardProps = {
  definition: {
    icon: LucideIcon;
    key: TransportModeKey;
    title: string;
  };
  movements: TransportMovement[];
  status: TransportCoverageStatus;
};

function formatCurrency(value?: number) {
  if (!Number.isFinite(Number(value)) || Number(value) <= 0) return "Not available";
  return `₹${Number(value).toLocaleString("en-IN")}`;
}

export default function ReviewTransportCoverageCard({
  definition,
  movements,
  status,
}: ReviewTransportCoverageCardProps) {
  const Icon = definition.icon;
  const statusVisual = getReviewStatusVisual(status);

  return (
    <article className={`rounded-[1.75rem] border border-slate-200 p-5 shadow-[0_18px_54px_rgba(15,23,42,0.07)] ${statusVisual.cardClass}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
            {definition.title} Coverage
          </p>
          <h3 className="mt-2 text-xl font-black text-slate-950">
            {definition.title}
          </h3>
        </div>
        <span className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-current/10 bg-white/70 ${statusVisual.iconClass}`}>
          <Icon size={20} />
        </span>
      </div>

      <span className={`mt-4 inline-flex rounded-full border px-3 py-1 text-xs font-black ${statusVisual.badgeClass}`}>
        {status}
      </span>

      <div className="mt-4 grid gap-3">
        {movements.length ? (
          movements.map((movement) => (
            <div key={movement.id} className={`rounded-2xl border border-slate-100 p-3 ${getReviewStatusVisual(movement.status).cardClass}`}>
              <p className="text-sm font-black text-slate-950">{movement.title}</p>
              <p className="mt-1 flex items-center gap-1.5 text-xs font-bold text-slate-500">
                <MapPin size={13} />
                {movement.from} → {movement.to}
              </p>
              <div className="mt-3 grid gap-2">
                <div className="flex items-center justify-between gap-3 text-xs">
                  <span className="inline-flex items-center gap-1.5 font-bold text-slate-500">
                    <CalendarDays size={13} />
                    Date
                  </span>
                  <span className="font-black text-slate-900">
                    {[movement.day ? `Day ${movement.day}` : "", movement.date].filter(Boolean).join(" · ") || "Not available"}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3 text-xs">
                  <span className="inline-flex items-center gap-1.5 font-bold text-slate-500">
                    <Clock3 size={13} />
                    Time
                  </span>
                  <span className="font-black text-slate-900">{movement.time || "Not available"}</span>
                </div>
                <div className="flex items-center justify-between gap-3 text-xs">
                  <span className="inline-flex items-center gap-1.5 font-bold text-slate-500">
                    <UsersRound size={13} />
                    Travellers
                  </span>
                  <span className="font-black text-slate-900">{movement.travellerCount || "Not available"}</span>
                </div>
                <div className="flex items-center justify-between gap-3 text-xs">
                  <span className="inline-flex items-center gap-1.5 font-bold text-slate-500">
                    <BadgeIndianRupee size={13} />
                    Value
                  </span>
                  <span className="font-black text-slate-900">{formatCurrency(movement.estimatedValue)}</span>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between gap-3">
                <span className={`rounded-full border px-2.5 py-1 text-[11px] font-black ${getReviewStatusVisual(movement.status).badgeClass}`}>
                  {movement.status}
                </span>
                <span className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-400">
                  {movement.source}
                </span>
              </div>
            </div>
          ))
        ) : (
          <p className="rounded-2xl border border-slate-100 bg-slate-50 p-3 text-sm font-black text-slate-500">
            No transport coverage available.
          </p>
        )}
      </div>
    </article>
  );
}
