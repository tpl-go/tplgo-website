"use client";

import { useState } from "react";
import { ChevronDown, Gauge, Moon, Route } from "lucide-react";
import type { TiyaAdaptiveDay } from "@/app/lib/ecosystem/planner/plannerDynamicItineraryEngine";

type TiyaAdaptiveDayCardProps = {
  adaptiveDay: TiyaAdaptiveDay;
};

const densityStyles: Record<TiyaAdaptiveDay["density"], string> = {
  Light: "border-emerald-300/20 bg-emerald-400/10 text-emerald-100",
  Balanced: "border-cyan-300/20 bg-cyan-300/10 text-cyan-100",
  Packed: "border-orange-300/20 bg-orange-400/10 text-orange-100",
};

const fatigueStyles: Record<TiyaAdaptiveDay["fatigue"]["level"], string> = {
  Low: "text-emerald-100",
  Medium: "text-orange-100",
  High: "text-rose-100",
};

export default function TiyaAdaptiveDayCard({
  adaptiveDay,
}: TiyaAdaptiveDayCardProps) {
  const [expanded, setExpanded] = useState(adaptiveDay.day.day <= 2);
  const items = Array.isArray(adaptiveDay.day.items) ? adaptiveDay.day.items : [];

  return (
    <article className="rounded-3xl border border-white/10 bg-white/[0.08] p-3 transition hover:bg-white/10 sm:p-4">
      <button
        type="button"
        onClick={() => setExpanded((current) => !current)}
        className="flex w-full items-start justify-between gap-3 text-left"
      >
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-black text-white">
              Day {adaptiveDay.day.day}
            </span>
            <span
              className={`rounded-full border px-2.5 py-1 text-[11px] font-black ${densityStyles[adaptiveDay.density]}`}
            >
              {adaptiveDay.density}
            </span>
            <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-black text-white/75">
              {adaptiveDay.distributionRole}
            </span>
          </div>
          <h3 className="mt-2 truncate text-lg font-black text-white">
            {adaptiveDay.day.city}
          </h3>
          <p className="mt-1 text-xs font-semibold leading-5 text-white/70">
            {adaptiveDay.day.headline}
          </p>
        </div>
        <ChevronDown
          size={18}
          className={`mt-2 shrink-0 text-white/70 transition ${
            expanded ? "rotate-180" : ""
          }`}
        />
      </button>

      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/10 p-3">
          <p className="text-[10px] font-black uppercase tracking-[0.12em] text-white/50">
            Density score
          </p>
          <p className="mt-1 text-sm font-black text-white">
            {adaptiveDay.densityScore}%
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/10 p-3">
          <p className="text-[10px] font-black uppercase tracking-[0.12em] text-white/50">
            Fatigue
          </p>
          <p className={`mt-1 text-sm font-black ${fatigueStyles[adaptiveDay.fatigue.level]}`}>
            {adaptiveDay.fatigue.level} · {adaptiveDay.fatigue.score}%
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/10 p-3">
          <p className="text-[10px] font-black uppercase tracking-[0.12em] text-white/50">
            Indicators
          </p>
          <p className="mt-1 truncate text-sm font-black text-white">
            {adaptiveDay.fatigue.indicators.join(", ") || "stable"}
          </p>
        </div>
      </div>

      {expanded ? (
        <div className="mt-4 grid gap-3">
          <div className="grid gap-2 lg:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-3">
              <div className="flex items-start gap-2">
                <Route className="mt-0.5 h-4 w-4 shrink-0 text-cyan-100" />
                <p className="text-xs font-semibold leading-5 text-white/70">
                  {adaptiveDay.flowAdjustment}
                </p>
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-3">
              <div className="flex items-start gap-2">
                <Moon className="mt-0.5 h-4 w-4 shrink-0 text-orange-100" />
                <p className="text-xs font-semibold leading-5 text-white/70">
                  {adaptiveDay.stayLogic}
                </p>
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-3">
              <div className="flex items-start gap-2">
                <Gauge className="mt-0.5 h-4 w-4 shrink-0 text-cyan-100" />
                <p className="text-xs font-semibold leading-5 text-white/70">
                  {adaptiveDay.weatherSignal}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-2">
            {items.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-white/10 bg-white/[0.06] p-3"
              >
                <p className="text-xs font-black text-white">
                  {item.time} · {item.title}
                </p>
                <p className="mt-1 text-[11px] font-semibold text-white/60">
                  {item.location} · {item.type}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </article>
  );
}
