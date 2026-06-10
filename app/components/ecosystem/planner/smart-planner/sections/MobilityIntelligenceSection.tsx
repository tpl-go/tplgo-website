"use client";

import {
  Armchair,
  BatteryCharging,
  Bus,
  Car,
  CircleCheck,
  CircleGauge,
  Fuel,
  Gauge,
  MapPin,
  MapPinned,
  Moon,
  Navigation,
  ParkingCircle,
  Plane,
  PlugZap,
  Route,
  Sparkles,
  Timer,
  TrainFront,
  WalletCards,
  Zap,
} from "lucide-react";
import type { TiyaRouteOption, TiyaTripIntent } from "@/app/lib/ecosystem/planner/plannerTypes";
import { stopsHint } from "../data/routePreviewData";

type MobilityIntelligenceData = {
  title: string;
  score: number;
  items: Array<[string, string]>;
};

function normalizeIntentValue(value?: string | null) {
  return (value || "").toLowerCase().trim();
}

function transportHint(routeOption: TiyaRouteOption) {
  return routeOption.bestFor || routeOption.routeStyle || "Smart route";
}

function getMobilityMode(tripIntent?: TiyaTripIntent) {
  const rawMode = normalizeIntentValue(
    tripIntent?.transportPreference || tripIntent?.transportMode
  );
  if (rawMode.includes("ev") || rawMode.includes("electric")) return "ev";
  if (rawMode.includes("flight")) return "flight";
  if (rawMode.includes("train")) return "train";
  if (rawMode.includes("bus")) return "bus";
  if (rawMode.includes("cab") || rawMode.includes("taxi")) return "cab";
  if (rawMode.includes("car") || rawMode.includes("drive")) return "self-drive";
  return "mixed";
}

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function getMetricValue(
  items: Array<[string, string]>,
  labels: string[],
  fallback: string
) {
  const normalizedLabels = labels.map((label) => normalizeIntentValue(label));
  const match = items.find(([label]) => {
    const normalized = normalizeIntentValue(label);
    return normalizedLabels.some((target) => normalized.includes(target));
  });

  return match?.[1] ?? fallback;
}

function getComplexityReadiness(routeOption: TiyaRouteOption) {
  if (routeOption.riskLevel === "Low") return { label: "Low", score: 86 };
  if (routeOption.riskLevel === "Medium") return { label: "Medium", score: 68 };
  return { label: "High", score: 46 };
}

function getMobilityDashboardScores(
  routeOption: TiyaRouteOption,
  mobilityIntelligence: MobilityIntelligenceData
) {
  const complexity = getComplexityReadiness(routeOption);
  const routeBias =
    routeOption.id === "fastest" ? 5 : routeOption.id === "adventure" ? -7 : 1;

  return {
    mobility: clampScore(mobilityIntelligence.score),
    comfort: clampScore(routeOption.comfortScore),
    convenience: clampScore(mobilityIntelligence.score + routeBias),
    complexity,
  };
}

function getMobilityStatus(score: number) {
  if (score >= 84) return "Ready";
  if (score >= 70) return "Prepare";
  return "Review";
}

function getMobilityModeLabel(mode: string) {
  if (mode === "ev") return "EV";
  if (mode === "self-drive") return "Self Drive";
  if (mode === "flight") return "Flight";
  if (mode === "train") return "Train";
  if (mode === "bus") return "Bus";
  if (mode === "cab") return "Cab";
  return "Mixed Mode";
}

function getMobilityModeIcon(mode: string) {
  if (mode === "ev") return <Zap size={28} />;
  if (mode === "flight") return <Plane size={28} />;
  if (mode === "train") return <TrainFront size={28} />;
  if (mode === "bus") return <Bus size={28} />;
  if (mode === "cab") return <Navigation size={28} />;
  return <Car size={28} />;
}

function getMobilityModeTone(mode: string) {
  if (mode === "ev") {
    return {
      shell:
        "border-emerald-200 bg-[linear-gradient(135deg,#052e2b,#0f766e_48%,#164e63)] text-white",
      chip: "border-emerald-200/30 bg-emerald-300/15 text-emerald-50",
      icon: "bg-emerald-300 text-emerald-950",
      rail: "from-emerald-300 via-cyan-200 to-lime-300",
    };
  }
  if (mode === "flight") {
    return {
      shell:
        "border-sky-200 bg-[linear-gradient(135deg,#082f49,#0369a1_52%,#1e3a8a)] text-white",
      chip: "border-sky-200/30 bg-sky-300/15 text-sky-50",
      icon: "bg-sky-200 text-sky-950",
      rail: "from-sky-200 via-cyan-200 to-blue-300",
    };
  }
  if (mode === "train") {
    return {
      shell:
        "border-indigo-200 bg-[linear-gradient(135deg,#111827,#334155_52%,#4338ca)] text-white",
      chip: "border-indigo-200/30 bg-indigo-300/15 text-indigo-50",
      icon: "bg-indigo-200 text-indigo-950",
      rail: "from-indigo-200 via-slate-200 to-cyan-200",
    };
  }
  if (mode === "bus") {
    return {
      shell:
        "border-amber-200 bg-[linear-gradient(135deg,#3b2f12,#b45309_50%,#0f766e)] text-white",
      chip: "border-amber-200/30 bg-amber-200/15 text-amber-50",
      icon: "bg-amber-200 text-amber-950",
      rail: "from-amber-200 via-orange-200 to-teal-200",
    };
  }
  if (mode === "cab") {
    return {
      shell:
        "border-yellow-200 bg-[linear-gradient(135deg,#1f2937,#3f3f46_48%,#ca8a04)] text-white",
      chip: "border-yellow-200/30 bg-yellow-200/15 text-yellow-50",
      icon: "bg-yellow-200 text-yellow-950",
      rail: "from-yellow-200 via-slate-100 to-orange-200",
    };
  }

  return {
    shell:
      "border-cyan-200 bg-[linear-gradient(135deg,#0f172a,#155e75_48%,#0f766e)] text-white",
    chip: "border-cyan-200/30 bg-cyan-300/15 text-cyan-50",
    icon: "bg-cyan-200 text-cyan-950",
    rail: "from-cyan-200 via-emerald-200 to-orange-200",
  };
}

function MobilityGauge({
  label,
  value,
  displayValue,
  tone,
}: {
  label: string;
  value: number;
  displayValue?: string;
  tone: "emerald" | "cyan" | "orange" | "slate";
}) {
  const tones = {
    emerald: "#10b981",
    cyan: "#06b6d4",
    orange: "#f97316",
    slate: "#475569",
  };
  const score = clampScore(value);

  return (
    <div className="min-w-0 rounded-[1.15rem] border border-white/70 bg-white/86 p-3 shadow-[0_16px_36px_rgba(15,23,42,0.08)] sm:rounded-[1.35rem] sm:p-4">
      <div
        className="mx-auto flex h-20 w-20 items-center justify-center rounded-full p-1.5 shadow-inner sm:h-24 sm:w-24 sm:p-2"
        style={{
          background: `conic-gradient(${tones[tone]} ${score * 3.6}deg, #e2e8f0 0deg)`,
        }}
      >
        <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-white text-center">
          <span className="text-xl font-black text-slate-950">
            {displayValue ?? score}
          </span>
          {!displayValue ? (
            <span className="text-[9px] font-black uppercase tracking-[0.12em] text-slate-400">
              /100
            </span>
          ) : null}
        </div>
      </div>
      <p className="mt-3 text-center text-[11px] font-black uppercase tracking-[0.12em] text-slate-600">
        {label}
      </p>
    </div>
  );
}

function MobilityHeroCard({
  mode,
  title,
  routeOption,
  score,
}: {
  mode: string;
  title: string;
  routeOption: TiyaRouteOption;
  score: number;
}) {
  const tone = getMobilityModeTone(mode);
  const modeIcon = getMobilityModeIcon(mode);
  const comfortLabel =
    routeOption.comfortScore >= 84
      ? "High comfort"
      : routeOption.comfortScore >= 70
        ? "Balanced comfort"
        : "Comfort caution";

  return (
    <div className={`relative min-w-0 overflow-hidden rounded-[1.2rem] border p-3 shadow-[0_22px_54px_rgba(15,23,42,0.18)] sm:rounded-[1.45rem] sm:p-5 ${tone.shell}`}>
      <div className="absolute inset-x-8 top-24 h-px bg-white/18" />
      <div className="absolute -right-10 -top-12 h-44 w-44 rounded-full border border-white/10" />
      <div className="absolute bottom-8 right-6 hidden h-20 w-52 rounded-full border border-white/10 sm:block" />

      <div className="relative flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3 sm:gap-4">
          <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl shadow-[0_16px_34px_rgba(0,0,0,0.22)] sm:h-14 sm:w-14 ${tone.icon}`}>
            {modeIcon}
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/66">
              Transport mode hero
            </p>
            <h5 className="mt-1 text-xl font-black leading-tight text-white sm:text-2xl">
              {title}
            </h5>
            <p className="mt-2 text-sm font-semibold text-white/72">
              {routeOption.name} · {transportHint(routeOption)}
            </p>
          </div>
        </div>
        <span className={`rounded-full border px-3 py-1.5 text-xs font-black ${tone.chip}`}>
          {getMobilityStatus(score)}
        </span>
      </div>

      <div className="relative mt-4 grid grid-cols-2 gap-2 sm:mt-6 sm:gap-3 sm:grid-cols-4">
        {[
          ["Selected Mode", getMobilityModeLabel(mode)],
          ["Readiness Status", getMobilityStatus(score)],
          ["Journey Style", routeOption.bestFor],
          ["Comfort Indicator", comfortLabel],
        ].map(([label, value]) => (
          <div
            key={`mobility-hero-${label}`}
            className="rounded-2xl border border-white/12 bg-white/10 px-3 py-3 backdrop-blur"
          >
            <p className="text-[9px] font-black uppercase tracking-[0.13em] text-white/58">
              {label}
            </p>
            <p className="mt-1 text-sm font-black leading-snug text-white">
              {value}
            </p>
          </div>
        ))}
      </div>

      <div className="relative mt-5">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-white" />
          <span className={`h-1 flex-1 rounded-full bg-gradient-to-r ${tone.rail}`} />
          <span className="h-2.5 w-2.5 rounded-full bg-white" />
        </div>
      </div>
    </div>
  );
}

function MobilityInfoCard({
  label,
  value,
  icon,
  score,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  score?: number;
}) {
  return (
    <div className="min-w-0 rounded-[1.15rem] border border-slate-200 bg-white/90 p-3 shadow-[0_14px_34px_rgba(15,23,42,0.07)] sm:rounded-[1.25rem] sm:p-4">
      <div className="flex items-start justify-between gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-cyan-100 bg-cyan-50 text-cyan-700">
          {icon}
        </span>
        {typeof score === "number" ? (
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-[10px] font-black text-emerald-700">
            {score}/100
          </span>
        ) : null}
      </div>
      <p className="mt-3 text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-base font-black leading-snug text-slate-950">
        {value}
      </p>
    </div>
  );
}

function MobilityProgressCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: number;
  detail: string;
}) {
  const score = clampScore(value);

  return (
    <div className="min-w-0 rounded-[1.15rem] border border-emerald-100 bg-white/88 p-3 shadow-[0_14px_34px_rgba(15,23,42,0.07)] sm:rounded-[1.25rem] sm:p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-black text-slate-950">{label}</p>
        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-[10px] font-black text-emerald-700">
          {score}%
        </span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-cyan-400 to-lime-400"
          style={{ width: `${score}%` }}
        />
      </div>
      <p className="mt-2 text-xs font-semibold leading-5 text-slate-600">
        {detail}
      </p>
    </div>
  );
}

function MobilityRouteVisual({
  mode,
  items,
  routeOption,
}: {
  mode: string;
  items: Array<[string, string]>;
  routeOption: TiyaRouteOption;
}) {
  const tone = getMobilityModeTone(mode);
  const stopLabel =
    mode === "ev"
      ? getMetricValue(items, ["Charging Stops"], stopsHint(routeOption))
      : stopsHint(routeOption);
  const lastReliable =
    mode === "ev"
      ? getMetricValue(items, ["Last Reliable Charger"], "Verify in workspace")
      : routeOption.duration;

  return (
    <div className="min-w-0 rounded-[1.15rem] border border-slate-200 bg-slate-950 p-3 text-white shadow-[0_18px_44px_rgba(15,23,42,0.16)] sm:rounded-[1.35rem] sm:p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-cyan-200">
            Live route style
          </p>
          <p className="mt-1 text-lg font-black">Preparation corridor</p>
        </div>
        <Route size={22} className="text-cyan-200" />
      </div>
      <div className="mt-5 grid grid-cols-[auto_1fr_auto] items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-slate-950">
          <MapPin size={18} />
        </span>
        <div className="relative h-3 rounded-full bg-white/10">
          <div className={`absolute inset-y-0 left-0 w-[74%] rounded-full bg-gradient-to-r ${tone.rail}`} />
          <span className="absolute left-[35%] top-1/2 h-5 w-5 -translate-y-1/2 rounded-full border-2 border-slate-950 bg-cyan-200" />
          <span className="absolute left-[72%] top-1/2 h-5 w-5 -translate-y-1/2 rounded-full border-2 border-slate-950 bg-lime-200" />
        </div>
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-slate-950">
          <CircleCheck size={18} />
        </span>
      </div>
      <div className="mt-4 grid gap-2 sm:gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/8 p-3">
          <p className="text-[9px] font-black uppercase tracking-[0.13em] text-white/48">
            Route
          </p>
          <p className="mt-1 text-sm font-black">{routeOption.distance}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/8 p-3">
          <p className="text-[9px] font-black uppercase tracking-[0.13em] text-white/48">
            Recommended stop
          </p>
          <p className="mt-1 text-sm font-black">{stopLabel}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/8 p-3">
          <p className="text-[9px] font-black uppercase tracking-[0.13em] text-white/48">
            Last reliable point
          </p>
          <p className="mt-1 text-sm font-black">{lastReliable}</p>
        </div>
      </div>
    </div>
  );
}

function getMobilitySpecificCards(
  mode: string,
  routeOption: TiyaRouteOption,
  items: Array<[string, string]>
) {
  if (mode === "ev") {
    return [
      {
        label: "Battery Planning",
        value: getMetricValue(items, ["Battery Planning"], "Plan 20-30% reserve"),
        icon: <BatteryCharging size={18} />,
      },
      {
        label: "Charging Availability",
        value: getMetricValue(items, ["Charging Stations"], "Map before departure"),
        icon: <PlugZap size={18} />,
      },
      {
        label: "Fast Charger Coverage",
        value: getMetricValue(items, ["Fast Chargers"], "Available near hubs"),
        icon: <Zap size={18} />,
      },
      {
        label: "Recommended Charging Stops",
        value: getMetricValue(items, ["Charging Stops"], stopsHint(routeOption)),
        icon: <MapPinned size={18} />,
      },
      {
        label: "Last Reliable Charger",
        value: getMetricValue(items, ["Last Reliable Charger"], "Verify in workspace"),
        icon: <MapPin size={18} />,
      },
      {
        label: "Range Buffer",
        value: getMetricValue(items, ["Charging Buffer"], "45-60 min buffer"),
        icon: <Gauge size={18} />,
      },
    ];
  }

  if (mode === "self-drive") {
    return [
      {
        label: "Highway Quality",
        value: getMetricValue(items, ["Highway Quality"], routeOption.difficulty),
        icon: <Route size={18} />,
      },
      {
        label: "Fuel Coverage",
        value: getMetricValue(items, ["Fuel Stations"], "Available on route"),
        icon: <Fuel size={18} />,
      },
      {
        label: "Parking Access",
        value: getMetricValue(items, ["Parking"], "Destination dependent"),
        icon: <ParkingCircle size={18} />,
      },
      {
        label: "Night Risk",
        value: getMetricValue(items, ["Night Driving Risk"], "Avoid night movement"),
        icon: <Moon size={18} />,
      },
      {
        label: "Comfort Score",
        value: getMetricValue(items, ["Driving Comfort"], `${routeOption.comfortScore}/100`),
        icon: <Armchair size={18} />,
        score: routeOption.comfortScore,
      },
      {
        label: "Estimated Toll",
        value: getMetricValue(items, ["Toll Estimate"], "Workspace estimate ready"),
        icon: <WalletCards size={18} />,
      },
    ];
  }

  if (mode === "flight") {
    return [
      {
        label: "Terminal Information",
        value: getMetricValue(items, ["Terminal Info"], "Verify after booking"),
        icon: <Plane size={18} />,
      },
      {
        label: "Transfer Complexity",
        value: getMetricValue(items, ["Transfer Duration"], "Airport + local transfer"),
        icon: <Route size={18} />,
      },
      {
        label: "Airport Connectivity",
        value: getMetricValue(items, ["Airport Connectivity"], "Cab / local transfer ready"),
        icon: <Navigation size={18} />,
      },
      {
        label: "Check-in Window",
        value: getMetricValue(items, ["Check-in Window"], "2-3 hours before departure"),
        icon: <Timer size={18} />,
      },
      {
        label: "Journey Buffer",
        value: getMetricValue(items, ["Travel Buffer"], "Add city traffic buffer"),
        icon: <CircleGauge size={18} />,
      },
    ];
  }

  if (mode === "train") {
    return [
      {
        label: "Crowd Score",
        value: getMetricValue(items, ["Crowd Expectation"], "Moderate"),
        icon: <Gauge size={18} />,
      },
      {
        label: "Platform Guidance",
        value: getMetricValue(items, ["Platform Guidance"], "Check before departure"),
        icon: <TrainFront size={18} />,
      },
      {
        label: "Transfer Ease",
        value: getMetricValue(items, ["Local Transport"], "Station transfer required"),
        icon: <Route size={18} />,
      },
      {
        label: "Local Connectivity",
        value: getMetricValue(items, ["Station Facilities"], "Food, lounge and cab access"),
        icon: <Navigation size={18} />,
      },
    ];
  }

  if (mode === "bus") {
    return [
      {
        label: "Boarding Point",
        value: getMetricValue(items, ["Boarding Point"], "Verify pickup point"),
        icon: <Bus size={18} />,
      },
      {
        label: "Rest Stops",
        value: getMetricValue(items, ["Rest Stops"], "Planned on route"),
        icon: <MapPinned size={18} />,
      },
      {
        label: "Comfort Score",
        value: getMetricValue(items, ["Comfort Level"], `${routeOption.comfortScore}/100`),
        icon: <Armchair size={18} />,
        score: routeOption.comfortScore,
      },
      {
        label: "Travel Window",
        value: getMetricValue(items, ["Travel Window"], "Day movement preferred"),
        icon: <Timer size={18} />,
      },
    ];
  }

  if (mode === "cab") {
    return [
      {
        label: "Pickup Ease",
        value: getMetricValue(items, ["Pickup Guidance"], "Doorstep / hub pickup"),
        icon: <MapPin size={18} />,
      },
      {
        label: "Driver Availability",
        value: getMetricValue(items, ["Driver Window"], "Avoid late night stretch"),
        icon: <Timer size={18} />,
      },
      {
        label: "Route Efficiency",
        value: getMetricValue(items, ["Route Efficiency"], "Balanced"),
        icon: <Navigation size={18} />,
      },
      {
        label: "Stop Flexibility",
        value: getMetricValue(items, ["Stop Flexibility"], "Custom halts possible"),
        icon: <MapPinned size={18} />,
      },
    ];
  }

  return items.map(([label, value]) => ({
    label,
    value,
    icon: <Route size={18} />,
  }));
}

function getMobilityRecommendations(
  mode: string,
  routeOption: TiyaRouteOption,
  items: Array<[string, string]>
) {
  const recommendations =
    mode === "ev"
      ? [
          `Best charging halt: ${getMetricValue(items, ["Charging Stops"], stopsHint(routeOption))}`,
          "Keep 20% battery reserve before the longest stretch.",
          `Last reliable charger: ${getMetricValue(items, ["Last Reliable Charger"], "verify in workspace")}.`,
        ]
      : mode === "self-drive"
        ? [
            "Refuel before entering remote sections.",
            routeOption.riskLevel === "Low"
              ? "Night driving is acceptable only on verified highway stretches."
              : "Avoid night driving on this route.",
            "Confirm parking access before locking the stay area.",
          ]
        : mode === "flight"
          ? [
              "Use airport transfer option for first and last mile.",
              "Keep the check-in window clear of city traffic risk.",
              "Travel light for easier terminal transfers.",
            ]
          : mode === "train"
            ? [
                "Check platform guidance before departure.",
                "Keep luggage compact for station transfers.",
                "Pre-book local connectivity from the arrival station.",
              ]
            : mode === "bus"
              ? [
                  "Verify boarding point pin before the travel day.",
                  "Choose the day travel window where possible.",
                  "Use planned rest stops for food and refresh breaks.",
                ]
              : mode === "cab"
                ? [
                    "Confirm driver window before late-night movement.",
                    "Use flexible stops for meals and scenic breaks.",
                    "Share route and pickup pin before departure.",
                  ]
                : [
                    "Keep transfer buffers between transport modes.",
                    "Travel light for easier transfers.",
                    "Confirm local connectivity before departure.",
                  ];

  return recommendations.slice(0, 4);
}

export default function MobilityIntelligenceSection({
  routeOption,
  tripIntent,
  mobilityIntelligence,
}: {
  routeOption: TiyaRouteOption;
  tripIntent?: TiyaTripIntent;
  mobilityIntelligence: MobilityIntelligenceData;
}) {
  const mode = getMobilityMode(tripIntent);
  const scores = getMobilityDashboardScores(routeOption, mobilityIntelligence);
  const cards = getMobilitySpecificCards(
    mode,
    routeOption,
    mobilityIntelligence.items
  );
  const recommendations = getMobilityRecommendations(
    mode,
    routeOption,
    mobilityIntelligence.items
  );
  const isEv = mode === "ev";

  return (
    <div className="grid min-w-0 gap-3 sm:gap-4">
      <div className="rounded-[1.15rem] border border-slate-200 bg-gradient-to-br from-white via-cyan-50/80 to-orange-50/60 p-3 shadow-[0_18px_44px_rgba(15,23,42,0.10)] sm:rounded-[1.45rem] sm:p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-orange-600">
              Mobility readiness dashboard
            </p>
            <h5 className="mt-1 text-xl font-black text-slate-950">
              Journey preparation cockpit
            </h5>
          </div>
          <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-black text-slate-700 shadow-sm">
            {routeOption.distance} · {routeOption.duration}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 sm:gap-3 sm:grid-cols-4">
          <MobilityGauge
            label="Overall Mobility Score"
            value={scores.mobility}
            tone="emerald"
          />
          <MobilityGauge
            label="Comfort Score"
            value={scores.comfort}
            tone="cyan"
          />
          <MobilityGauge
            label="Convenience Score"
            value={scores.convenience}
            tone="orange"
          />
          <MobilityGauge
            label="Journey Complexity"
            value={scores.complexity.score}
            displayValue={scores.complexity.label}
            tone="slate"
          />
        </div>
      </div>

      <MobilityHeroCard
        mode={mode}
        title={mobilityIntelligence.title}
        routeOption={routeOption}
        score={scores.mobility}
      />

      {isEv ? (
        <div className="rounded-[1.15rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-cyan-50 p-3 shadow-[0_18px_44px_rgba(15,23,42,0.10)] sm:rounded-[1.45rem] sm:p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-700">
                EV dashboard
              </p>
              <h5 className="mt-1 text-xl font-black text-slate-950">
                Battery, charger and range confidence
              </h5>
            </div>
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] font-black text-emerald-700">
              EV confidence {scores.mobility}/100
            </span>
          </div>
          <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_0.9fr]">
            <MobilityRouteVisual
              mode={mode}
              items={mobilityIntelligence.items}
              routeOption={routeOption}
            />
            <div className="grid gap-3">
              <MobilityProgressCard
                label="Battery Planning"
                value={scores.mobility}
                detail={getMetricValue(
                  mobilityIntelligence.items,
                  ["Battery Planning"],
                  "Plan 20-30% reserve"
                )}
              />
              <MobilityProgressCard
                label="Fast Charger Coverage"
                value={scores.convenience}
                detail={getMetricValue(
                  mobilityIntelligence.items,
                  ["Fast Chargers"],
                  "Available near hubs"
                )}
              />
              <MobilityProgressCard
                label="Range Buffer"
                value={scores.complexity.score}
                detail={getMetricValue(
                  mobilityIntelligence.items,
                  ["Charging Buffer"],
                  "45-60 min buffer"
                )}
              />
            </div>
          </div>
        </div>
      ) : (
        <MobilityRouteVisual
          mode={mode}
          items={mobilityIntelligence.items}
          routeOption={routeOption}
        />
      )}

      <div className="grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <MobilityInfoCard
            key={`mobility-card-${card.label}`}
            label={card.label}
            value={card.value}
            icon={card.icon}
            score={card.score}
          />
        ))}
      </div>

      <div className="rounded-[1.15rem] border border-orange-200 bg-gradient-to-br from-white via-orange-50/80 to-cyan-50/70 p-3 shadow-[0_18px_44px_rgba(15,23,42,0.10)] sm:rounded-[1.45rem] sm:p-4">
        <div className="flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-orange-200 bg-orange-50 text-orange-700">
            <Sparkles size={18} />
          </span>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-orange-600">
              AI mobility recommendations
            </p>
            <h5 className="text-lg font-black text-slate-950">
              Transport-specific preparation
            </h5>
          </div>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {recommendations.map((recommendation) => (
            <div
              key={`mobility-recommendation-${recommendation}`}
              className="flex items-start gap-3 rounded-2xl border border-white/70 bg-white/86 p-3 shadow-sm"
            >
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-950 text-white">
                <CircleCheck size={14} />
              </span>
              <p className="text-sm font-bold leading-5 text-slate-800">
                {recommendation}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
