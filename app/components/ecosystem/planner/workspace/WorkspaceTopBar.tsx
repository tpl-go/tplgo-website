import Link from "next/link";
import { Compass } from "lucide-react";

import type { TiyaRouteOption } from "@/app/lib/ecosystem/planner/plannerTypes";

import {
  budgetEstimate,
  routeAccent,
  transportHint,
} from "./utils/workspaceHelpers";

export default function WorkspaceTopBar({
  routeOptions,
  selectedRoute,
  fromCity,
  toCity,
  onSwitchRoute,
}: {
  routeOptions: TiyaRouteOption[];
  selectedRoute: TiyaRouteOption;
  fromCity: string;
  toCity: string;
  onSwitchRoute: (routeOption: TiyaRouteOption) => void;
}) {
  return (
    <div className="sticky top-0 z-40 rounded-[1.7rem] border border-white bg-white/92 p-4 shadow-[0_16px_50px_rgba(15,23,42,0.09)] backdrop-blur-2xl">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-blue-700">
            <Compass size={15} />
            Route Intelligence Workspace
          </div>
          <h2 className="mt-1 text-xl font-black text-slate-950">
            {routeOptions.length} route{routeOptions.length === 1 ? "" : "s"} available for {fromCity} → {toCity}
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/smart-planner"
            className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-black text-slate-700 hover:bg-orange-50 hover:text-orange-700"
          >
            ← Change Search
          </Link>

          <select
            value={selectedRoute.id}
            onChange={(event) => {
              const route = routeOptions.find((item) => item.id === event.target.value);
              if (route) onSwitchRoute(route);
            }}
            className="min-h-10 rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-xs font-black text-orange-700 outline-none"
          >
            {routeOptions.map((routeOption) => (
              <option key={routeOption.id} value={routeOption.id}>
                {routeOption.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {routeOptions.map((routeOption) => {
          const active = routeOption.id === selectedRoute.id;
          const accent = routeAccent(routeOption.id);

          return (
            <button
              key={routeOption.id}
              type="button"
              onClick={() => onSwitchRoute(routeOption)}
              className={`rounded-full border px-3 py-2 text-xs font-black transition ${
                active
                  ? "border-orange-300 bg-orange-50 text-orange-700 shadow-sm"
                  : "border-slate-200 bg-white text-slate-700 hover:border-orange-200 hover:bg-orange-50"
              }`}
            >
              <span className={`mr-2 inline-block h-2 w-2 rounded-full bg-gradient-to-r ${accent}`} />
              {routeOption.name}
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 rounded-2xl border border-slate-100 bg-slate-50/80 px-3 py-2 text-xs font-black text-slate-700">
        {[
          selectedRoute.name,
          transportHint(selectedRoute),
          `${selectedRoute.riskLevel} Risk`,
          selectedRoute.duration,
          budgetEstimate(selectedRoute),
        ].map((item, index) => (
          <span key={`${item}-${index}`} className="inline-flex items-center gap-2">
            {index > 0 ? <span className="text-slate-300">•</span> : null}
            <span>{item}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
