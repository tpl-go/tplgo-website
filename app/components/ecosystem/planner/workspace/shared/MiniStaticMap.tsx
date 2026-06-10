import type { TiyaRouteOption } from "@/app/lib/ecosystem/planner/plannerTypes";

import { routeAccent } from "../utils/workspaceHelpers";

export default function MiniStaticMap({
  fromCity,
  toCity,
  selectedRoute,
}: {
  fromCity: string;
  toCity: string;
  selectedRoute: TiyaRouteOption;
}) {
  const accent = routeAccent(selectedRoute.id);

  return (
    <div className="relative h-[150px] overflow-hidden rounded-xl bg-slate-950">
      <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:30px_30px]" />
      <div className={`absolute left-5 right-5 top-1/2 h-1 -translate-y-1/2 rounded-full bg-gradient-to-r ${accent}`} />
      <div className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-cyan-200 shadow-[0_0_24px_rgba(34,211,238,0.7)]" />
      <div className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-orange-300 shadow-[0_0_24px_rgba(251,146,60,0.7)]" />
      <div className="absolute bottom-3 left-3 right-3 flex justify-between text-[10px] font-black text-white/70">
        <span>{fromCity}</span>
        <span>{toCity}</span>
      </div>
    </div>
  );
}
