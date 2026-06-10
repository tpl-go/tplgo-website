import { CheckCircle2 } from "lucide-react";

import type { TiyaRouteOption } from "@/app/lib/ecosystem/planner/plannerTypes";

import { budgetEstimate, transportHint } from "../utils/workspaceHelpers";
import type { WorkspacePreferences } from "../utils/workspaceTypes";

export default function BookingTab({
  selectedRoute,
  preferences,
}: {
  selectedRoute: TiyaRouteOption;
  preferences: WorkspacePreferences;
}) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-blue-700">
        Booking prep
      </p>
      <h2 className="mt-2 text-2xl font-black text-slate-950">
        Booking-ready modules
      </h2>
      <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-slate-600">
        Transport, stay, activities, creator recommendations, and checkout prep
        will open after itinerary build.
      </p>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {[
          ["Transport", transportHint(selectedRoute)],
          ["Stay", preferences.stayPreference],
          ["Package Estimate", budgetEstimate(selectedRoute)],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
          >
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">
              {label}
            </p>
            <p className="mt-2 text-sm font-black text-slate-950">{value}</p>
            <button className="mt-3 inline-flex items-center gap-2 text-xs font-black text-orange-600">
              Prepare <CheckCircle2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
