import type { TiyaRouteOption } from "@/app/lib/ecosystem/planner/plannerTypes";

import type { WorkspacePreferences } from "../utils/workspaceTypes";

export default function OverviewTab({
  selectedRoute,
  selectedTravelStyle,
  selectedBudgetVibe,
  preferences,
}: {
  selectedRoute: TiyaRouteOption;
  selectedTravelStyle: string;
  selectedBudgetVibe: string;
  preferences: WorkspacePreferences;
}) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-blue-700">
        Route overview
      </p>
      <h2 className="mt-2 text-3xl font-black text-slate-950">
        {selectedRoute.routeStyle}
      </h2>
      <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">
        {selectedRoute.bestFor}. This workspace first explains the selected
        route, then allows preferences, itinerary and booking prep step-by-step.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {[
          ["Best for", selectedRoute.bestFor],
          ["Travel style", selectedTravelStyle],
          ["Budget vibe", selectedBudgetVibe],
          ["Stay style", preferences.stayPreference],
          ["Transport", preferences.transportMode],
          ["Pace", preferences.pace],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-2xl border border-slate-200 bg-slate-50 p-3"
          >
            <p className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-500">
              {label}
            </p>
            <p className="mt-1 text-sm font-black text-slate-950">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
