import { Car, Hotel, Sparkles, Train, type LucideIcon } from "lucide-react";

import type { TiyaRouteOption } from "@/app/lib/ecosystem/planner/plannerTypes";

import { transportHint } from "../utils/workspaceHelpers";
import type { WorkspacePreferences } from "../utils/workspaceTypes";

export default function ItineraryTab({
  selectedRoute,
  preferences,
}: {
  selectedRoute: TiyaRouteOption;
  preferences: WorkspacePreferences;
}) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-blue-700">
            Itinerary builder
          </p>
          <h2 className="mt-2 text-2xl font-black text-slate-950">
            Prepare day-wise journey
          </h2>
        </div>
        <button className="rounded-full bg-gradient-to-r from-[#ff7b00] via-[#ff9500] to-[#ffb300] px-5 py-3 text-sm font-black text-white shadow-[0_14px_34px_rgba(249,115,22,0.24)]">
          Build Itinerary
        </button>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {(
          [
          ["Transport", transportHint(selectedRoute), Train],
          ["Stay", preferences.stayPreference, Hotel],
          ["Local Transfer", "Cab / route movement", Car],
          ["Activities", preferences.interests.slice(0, 2).join(", "), Sparkles],
        ] as Array<[string, string, LucideIcon]>
        ).map(([title, value, CardIcon]) => {

          return (
            <div
              key={String(title)}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-950 text-orange-300">
                <CardIcon size={18} />
              </div>
              <p className="mt-3 text-sm font-black text-slate-950">{title}</p>
              <p className="mt-1 text-xs font-bold text-slate-600">{value}</p>
              <button
                type="button"
                className="mt-3 text-xs font-black text-orange-600"
              >
                Change
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
