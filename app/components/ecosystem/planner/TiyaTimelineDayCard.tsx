"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  MapPin,
  ShoppingBag,
  Sparkles,
  Ticket,
} from "lucide-react";
import type { TiyaJourneyTimelineDay } from "@/app/lib/ecosystem/planner/plannerTypes";

type TiyaTimelineDayCardProps = {
  day: TiyaJourneyTimelineDay;
  isActive?: boolean;
};

const statusStyles: Record<TiyaJourneyTimelineDay["status"], string> = {
  Ready: "border-emerald-200 bg-emerald-50 text-emerald-700",
  "In planning": "border-blue-200 bg-blue-50 text-blue-700",
  "Needs review": "border-orange-200 bg-orange-50 text-orange-700",
};

export default function TiyaTimelineDayCard({
  day,
  isActive = false,
}: TiyaTimelineDayCardProps) {
  const [expanded, setExpanded] = useState(isActive);

  return (
    <article
      className={`rounded-3xl border p-3 transition-all duration-300 sm:p-4 ${
        isActive
          ? "border-orange-300/50 bg-orange-500/10 shadow-[0_16px_44px_rgba(249,115,22,0.16)]"
          : "border-white/10 bg-white/[0.08] hover:bg-white/10"
      }`}
    >
      <button
        type="button"
        onClick={() => setExpanded((current) => !current)}
        className="flex w-full items-start justify-between gap-3 text-left"
      >
        <div className="flex min-w-0 gap-3">
          <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-2xl bg-orange-500 text-white shadow-[0_0_24px_rgba(249,115,22,0.26)]">
            <span className="text-[10px] font-black uppercase">Day</span>
            <span className="text-lg font-black leading-none">{day.day}</span>
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap gap-2">
              <span className={`rounded-full border px-2.5 py-1 text-[11px] font-black ${statusStyles[day.status]}`}>
                {day.status}
              </span>
              <span className="rounded-full border border-white/10 bg-white/10 px-2.5 py-1 text-[11px] font-black text-cyan-100">
                {day.transportUsed}
              </span>
            </div>
            <h3 className="mt-2 text-lg font-black leading-tight text-white">
              {day.city}
            </h3>
            <p className="mt-1 text-sm font-semibold leading-5 text-white/70">
              {day.quickHighlight}
            </p>
          </div>
        </div>
        <div className="shrink-0 rounded-full border border-white/10 bg-white/10 p-2 text-white">
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/10 p-3">
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-white/50">
            Route segment
          </p>
          <p className="mt-1 text-xs font-black text-white">{day.routeSegment}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/10 p-3">
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-white/50">
            Stay type
          </p>
          <p className="mt-1 text-xs font-black text-white">{day.stayType}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/10 p-3">
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-white/50">
            Markers
          </p>
          <p className="mt-1 truncate text-xs font-black text-white">
            {day.markerTypes.join(", ")}
          </p>
        </div>
      </div>

      {expanded ? (
        <div className="mt-4 grid gap-3">
          <div className="rounded-2xl border border-white/10 bg-white/10 p-3">
            <div className="flex items-start gap-2">
              <MapPin className="mt-1 h-4 w-4 shrink-0 text-orange-200" />
              <p className="text-sm font-semibold leading-6 text-white/70">
                {day.notes}
              </p>
            </div>
          </div>

          <div className="grid gap-2">
            {day.itineraryItems.map((item) => (
              <div
                key={item.id}
                className="grid gap-2 rounded-2xl border border-white/10 bg-white/10 p-3 sm:grid-cols-[76px_minmax(0,1fr)_110px]"
              >
                <span className="text-sm font-black text-cyan-100">{item.time}</span>
                <span className="min-w-0 text-sm font-bold text-white">{item.title}</span>
                <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-black capitalize text-white/70">
                  {item.type}
                </span>
              </div>
            ))}
          </div>

          <div className="grid gap-2 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/10 p-3">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-cyan-100">
                <Sparkles size={14} />
                Creators
              </div>
              <p className="mt-2 text-sm font-semibold text-white/70">
                {day.creatorRecommendations.map((creator) => creator.creatorName).join(", ") || "Route creator fit pending"}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 p-3">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-orange-100">
                <ShoppingBag size={14} />
                Market
              </div>
              <p className="mt-2 text-sm font-semibold text-white/70">
                {day.localMarketPicks.map((product) => product.productName).join(", ") || "Local Life stop optional"}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 p-3">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-blue-100">
                <Ticket size={14} />
                Booking
              </div>
              <p className="mt-2 text-sm font-semibold text-white/70">
                {day.bookingSuggestions.map((booking) => booking.serviceName).join(", ") || "Booking modules flexible"}
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </article>
  );
}
