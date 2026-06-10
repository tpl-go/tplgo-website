import { Navigation, Route } from "lucide-react";
import type { TiyaRouteStop } from "@/app/lib/ecosystem/planner/plannerTypes";

type TiyaRouteSummaryProps = {
  routeStops: TiyaRouteStop[];
  title?: string;
  pace?: string;
  transportMode?: string;
};

export default function TiyaRouteSummary({
  routeStops,
  title = "Golden Triangle",
  pace = "Smart",
  transportMode = "Flight",
}: TiyaRouteSummaryProps) {
  const safeRouteStops = Array.isArray(routeStops) ? routeStops : [];
  const totalNights = safeRouteStops.reduce((sum, stop) => sum + stop.nights, 0);

  return (
    <section className="rounded-3xl border border-white/80 bg-white/78 p-4 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-blue-700">
            <Route size={15} />
            Route summary
          </div>
          <h2 className="mt-2 text-xl font-black text-slate-950">
            {title}
          </h2>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-950 text-white">
          <Navigation size={20} />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        {[
          ["Stops", safeRouteStops.length.toString()],
          ["Nights", totalNights.toString()],
          ["Pace", pace],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-2xl border border-blue-100 bg-blue-50/70 p-3"
          >
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">
              {label}
            </p>
            <p className="mt-1 text-base font-black text-slate-950">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 space-y-3">
        <div className="rounded-2xl border border-orange-100 bg-orange-50/70 p-3 text-xs font-black text-orange-700">
          Preferred mode: {transportMode}
        </div>

        {safeRouteStops.map((stop, index) => (
          <div key={`${stop.city}-${index}`} className="relative pl-7">
            {index < safeRouteStops.length - 1 ? (
              <span className="absolute left-[9px] top-5 h-[calc(100%+10px)] w-px bg-blue-200" />
            ) : null}
            <span className="absolute left-0 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 ring-4 ring-orange-100" />
            <div className="rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <p className="font-black text-slate-950">{stop.city}</p>
                <p className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-black text-slate-600">
                  {stop.nights}N
                </p>
              </div>
              <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">
                {stop.transfer}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
