"use client";

import { useState } from "react";
import { ChevronDown, Clock3, Route, ShieldCheck } from "lucide-react";
import type { TiyaExpeditionTimelineItem } from "@/app/lib/ecosystem/planner/plannerClusterEngine";

type TiyaExpeditionTimelineProps = {
  items: TiyaExpeditionTimelineItem[];
};

const densityTone: Record<TiyaExpeditionTimelineItem["activityDensity"], string> = {
  Light: "border-emerald-300/20 bg-emerald-300/10 text-emerald-100",
  Balanced: "border-cyan-300/20 bg-cyan-300/10 text-cyan-100",
  Packed: "border-orange-300/25 bg-orange-400/15 text-orange-100",
};

export default function TiyaExpeditionTimeline({
  items,
}: TiyaExpeditionTimelineProps) {
  const safeItems = Array.isArray(items) ? items : [];
  const [expandedId, setExpandedId] = useState(safeItems[0]?.id ?? "");

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.07] p-3 sm:p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
            <Route size={15} />
            Multi-city timeline
          </div>
          <h3 className="mt-1 text-lg font-black text-white">
            Connected expedition flow
          </h3>
        </div>
        <span className="w-fit rounded-full border border-orange-300/25 bg-orange-400/15 px-3 py-1 text-xs font-black text-orange-100">
          {safeItems.length} route stages
        </span>
      </div>

      <div className="mt-4 grid gap-3">
        {safeItems.map((item, index) => {
          const isExpanded = expandedId === item.id;

          return (
            <article
              key={item.id}
              className={`rounded-3xl border p-3 transition sm:p-4 ${
                isExpanded
                  ? "border-orange-300/35 bg-orange-400/10 shadow-[0_0_34px_rgba(249,115,22,0.16)]"
                  : "border-white/10 bg-white/[0.06]"
              }`}
            >
              <button
                type="button"
                onClick={() => setExpandedId(isExpanded ? "" : item.id)}
                className="flex w-full items-start justify-between gap-3 text-left"
              >
                <div className="flex min-w-0 gap-3">
                  <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-400/15 text-sm font-black text-cyan-100">
                    {index + 1}
                    {index < safeItems.length - 1 ? (
                      <span className="absolute left-1/2 top-11 h-5 w-px -translate-x-1/2 bg-gradient-to-b from-cyan-300 to-orange-400" />
                    ) : null}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-black uppercase tracking-[0.14em] text-white/50">
                      {item.dayRange}
                    </p>
                    <h4 className="mt-1 truncate text-base font-black text-white">
                      {item.destination}
                    </h4>
                  </div>
                </div>
                <ChevronDown
                  size={18}
                  className={`mt-1 shrink-0 text-white/60 transition ${
                    isExpanded ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isExpanded ? (
                <div className="mt-4 grid gap-2 sm:grid-cols-3">
                  <div className="rounded-2xl border border-white/10 bg-white/10 p-3">
                    <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.12em] text-cyan-100">
                      <Clock3 size={13} />
                      Transition
                    </div>
                    <p className="mt-2 text-xs font-semibold leading-5 text-white/70">
                      {item.transition}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/10 p-3">
                    <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.12em] text-cyan-100">
                      <ShieldCheck size={13} />
                      Recovery
                    </div>
                    <p className="mt-2 text-xs font-semibold leading-5 text-white/70">
                      {item.recoveryPoint
                        ? "Recovery point recommended before the next transfer."
                        : item.stayCluster}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/10 p-3">
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-black ${densityTone[item.activityDensity]}`}
                    >
                      {item.activityDensity} density
                    </span>
                    <p className="mt-2 text-xs font-semibold leading-5 text-white/70">
                      Activities are balanced around stay and transfer load.
                    </p>
                  </div>
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </div>
  );
}
