import { Bike, Car, Plane, Route, Train } from "lucide-react";
import type { TiyaJourneyMapSegment } from "@/app/lib/ecosystem/planner/plannerTypes";

type TiyaRouteVisualizerProps = {
  segmentStyle: TiyaJourneyMapSegment["segmentStyle"];
};

const styleConfig = {
  flight: {
    label: "Air route",
    icon: Plane,
    line: "from-cyan-300 via-blue-300 to-orange-300",
    dash: "border-dashed",
  },
  train: {
    label: "Rail route",
    icon: Train,
    line: "from-blue-300 via-cyan-200 to-blue-400",
    dash: "border-dotted",
  },
  road: {
    label: "Road route",
    icon: Car,
    line: "from-orange-300 via-amber-200 to-cyan-300",
    dash: "border-solid",
  },
  bike: {
    label: "Adventure route",
    icon: Bike,
    line: "from-orange-400 via-rose-300 to-cyan-300",
    dash: "border-dashed",
  },
  mixed: {
    label: "Mixed flow",
    icon: Route,
    line: "from-cyan-300 via-orange-300 to-blue-300",
    dash: "border-dashed",
  },
};

export default function TiyaRouteVisualizer({
  segmentStyle,
}: TiyaRouteVisualizerProps) {
  const config = styleConfig[segmentStyle];
  const Icon = config.icon;

  return (
    <div className="flex items-center gap-2">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15 text-white">
        <Icon size={15} />
      </div>
      <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-white/10">
        <div
          className={`absolute inset-y-0 left-0 w-full rounded-full bg-gradient-to-r ${config.line}`}
        />
        <div className="absolute left-1 top-1/2 h-1.5 w-1.5 -translate-y-1/2 animate-pulse rounded-full bg-white shadow-[0_0_16px_rgba(255,255,255,0.9)]" />
      </div>
      <span className="hidden text-[10px] font-black uppercase tracking-[0.14em] text-white/50 sm:inline">
        {config.label}
      </span>
    </div>
  );
}
