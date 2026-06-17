"use client";

import {
  Activity,
  AlertTriangle,
  BrainCircuit,
  CloudSun,
  Gauge,
  MapPinned,
  ShieldCheck,
} from "lucide-react";
import type {
  TiyaJourneyMap as TiyaJourneyMapData,
  TiyaJourneyStatus,
  TiyaJourneyTimelineDay,
  TiyaAIRecommendationChangeLog,
} from "@/app/lib/ecosystem/planner/plannerTypes";
import TiyaJourneyMap from "./TiyaJourneyMap";
import TiyaTimelineDayCard from "./TiyaTimelineDayCard";

type TiyaJourneyTimelineProps = {
  days: TiyaJourneyTimelineDay[];
  map: TiyaJourneyMapData;
  status: TiyaJourneyStatus;
  changeHistory?: TiyaAIRecommendationChangeLog[];
  isGenerating?: boolean;
};

const statusChips = [
  { key: "comfortLevel", label: "Comfort", icon: ShieldCheck },
  { key: "travelIntensity", label: "Intensity", icon: Activity },
  { key: "routeReadiness", label: "Route", icon: Gauge },
  { key: "weatherReadiness", label: "Weather", icon: CloudSun },
  { key: "bookingReadiness", label: "Booking", icon: BrainCircuit },
] as const;

export default function TiyaJourneyTimeline({
  changeHistory = [],
  days,
  map,
  status,
  isGenerating = false,
}: TiyaJourneyTimelineProps) {
  const safeDays = Array.isArray(days) ? days : [];

  return (
    <section className="overflow-hidden rounded-3xl border border-white/80 bg-[#061839]/95 text-white shadow-[0_22px_80px_rgba(6,24,57,0.2)] backdrop-blur-xl">
      <div className="relative border-b border-white/10 p-4 sm:p-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_12%,rgba(34,211,238,0.2),transparent_28%),radial-gradient(circle_at_88%_12%,rgba(249,115,22,0.2),transparent_26%)]" />
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-cyan-100">
              <BrainCircuit
                size={15}
                className={isGenerating ? "animate-pulse" : undefined}
              />
              AI timeline operating layer
            </div>
            <h2 className="mt-2 text-xl font-black text-white sm:text-2xl">
              Visual journey flow
            </h2>
            <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-white/70">
              A living route timeline that connects day progression, transport
              transitions, stays, creators, market picks and booking readiness.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/10 px-3 py-2 text-xs font-black text-cyan-100">
            Stage: {status.activePlanningStage}
          </div>
        </div>
      </div>

      <div className="grid gap-3 p-3 sm:p-5">
        <div className="grid gap-2 md:grid-cols-5">
          {statusChips.map((chip) => {
            const Icon = chip.icon;
            const value = status[chip.key];

            return (
              <div
                key={chip.key}
                className="rounded-2xl border border-white/10 bg-white/10 p-3"
              >
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.14em] text-white/50">
                  <Icon size={13} />
                  {chip.label}
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-orange-400"
                      style={{ width: `${value}%` }}
                    />
                  </div>
                  <span className="text-xs font-black text-white">{value}</span>
                </div>
              </div>
            );
          })}
        </div>

        <TiyaJourneyMap map={map} />

        <div className="grid gap-3 lg:grid-cols-[1fr_0.9fr]">
          <div className="rounded-3xl border border-cyan-300/16 bg-cyan-300/10 p-3 sm:p-4">
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
              <MapPinned size={15} />
              Map sync and booking markers
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {[
                ["Route movement", `${safeDays.length} days synced`],
                ["Booking-ready markers", `${safeDays.reduce((sum, day) => sum + day.bookingSuggestions.length, 0)}`],
                ["Warning markers", `${safeDays.filter((day) => day.status === "Needs review").length}`],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-white/10 p-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.12em] text-white/45">
                    {label}
                  </p>
                  <p className="mt-1 text-sm font-black text-white">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-orange-300/18 bg-orange-400/10 p-3 sm:p-4">
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-orange-100">
              <AlertTriangle size={15} />
              Applied changes on timeline
            </div>
            <div className="mt-3 grid gap-2">
              {changeHistory.length ? changeHistory.slice(0, 3).map((change) => (
                <div key={change.id} className="rounded-2xl border border-white/10 bg-white/10 p-3">
                  <p className="text-xs font-black text-white">{change.title}</p>
                  <p className="mt-1 text-xs font-semibold leading-5 text-white/58">
                    {(change.affectedDays || []).join(", ") || change.summary}
                  </p>
                </div>
              )) : (
                <p className="rounded-2xl border border-white/10 bg-white/10 p-3 text-sm font-semibold text-white/58">
                  No applied planner changes yet.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="relative grid gap-3">
          <div className="absolute bottom-4 left-6 top-4 hidden w-px bg-gradient-to-b from-cyan-300 via-orange-300 to-blue-300 opacity-50 sm:block" />
          {safeDays.map((day, index) => (
            <div key={day.id} className="relative sm:pl-12">
              <div className="absolute left-[17px] top-6 hidden h-4 w-4 rounded-full bg-orange-400 shadow-[0_0_22px_rgba(249,115,22,0.6)] sm:block" />
              <TiyaTimelineDayCard day={day} isActive={index === 0} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
