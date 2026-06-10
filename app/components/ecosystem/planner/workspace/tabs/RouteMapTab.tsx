import { Map } from "lucide-react";

import type { TiyaRouteOption } from "@/app/lib/ecosystem/planner/plannerTypes";

import MiniStaticMap from "../shared/MiniStaticMap";

export default function RouteMapTab({
  fromCity,
  toCity,
  selectedRoute,
}: {
  fromCity: string;
  toCity: string;
  selectedRoute: TiyaRouteOption;
}) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.16em] text-blue-700">
        <Map size={14} />
        Route map preview
      </div>

      <div className="mt-5">
        <MiniStaticMap
          fromCity={fromCity}
          toCity={toCity}
          selectedRoute={selectedRoute}
        />
      </div>

      <div className="mt-4 flex items-center justify-between text-xs font-black text-slate-600">
        <span>{fromCity}</span>
        <span>{selectedRoute.duration}</span>
        <span>{toCity}</span>
      </div>
    </div>
  );
}
