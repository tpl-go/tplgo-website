"use client";

import { MapPinned } from "lucide-react";
import type { TiyaExpeditionDestination } from "@/app/lib/ecosystem/planner/plannerExpeditionEngine";

type TiyaRouteClusterMapProps = {
  destinations: TiyaExpeditionDestination[];
  loopMode: boolean;
};

export default function TiyaRouteClusterMap({
  destinations,
  loopMode,
}: TiyaRouteClusterMapProps) {
  const safeDestinations = Array.isArray(destinations) ? destinations : [];

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.07] p-3 sm:p-4">
      <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
        <MapPinned size={15} />
        Route cluster chain
      </div>
      <div className="mt-4 overflow-x-auto pb-1">
        <div className="flex min-w-max items-center gap-2">
          {safeDestinations.map((destination, index) => (
            <div key={destination.id} className="flex items-center gap-2">
              <div className="rounded-3xl border border-white/10 bg-white/10 p-3 text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-500 text-sm font-black text-white shadow-[0_0_24px_rgba(249,115,22,0.35)]">
                  {index + 1}
                </div>
                <p className="mt-2 max-w-[120px] truncate text-xs font-black text-white">
                  {destination.name}
                </p>
                <p className="mt-1 text-[10px] font-bold text-white/50">
                  {destination.role}
                </p>
              </div>
              {index < safeDestinations.length - 1 || loopMode ? (
                <div className="h-1 w-12 rounded-full bg-gradient-to-r from-cyan-300 to-orange-400" />
              ) : null}
            </div>
          ))}
          {loopMode && safeDestinations[0] ? (
            <div className="rounded-3xl border border-cyan-300/20 bg-cyan-300/10 p-3 text-center">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-500 text-sm font-black text-white">
                ↺
              </div>
              <p className="mt-2 max-w-[120px] truncate text-xs font-black text-white">
                {safeDestinations[0].name}
              </p>
              <p className="mt-1 text-[10px] font-bold text-white/50">
                Loop return
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
