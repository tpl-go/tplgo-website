"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bookmark,
  CheckCircle2,
  Compass,
  GitCompareArrows,
  MapPinned,
  Route,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import {
  getDefaultExpeditionDestinations,
  getRecommendedExpeditionMode,
  getRegionIntelligence,
  type TiyaExpeditionDestination,
  type TiyaExpeditionMode,
} from "@/app/lib/ecosystem/planner/plannerExpeditionEngine";
import {
  generateDestinationClusters,
  generateExpeditionTimeline,
} from "@/app/lib/ecosystem/planner/plannerClusterEngine";
import { generateExpeditionSummary } from "@/app/lib/ecosystem/planner/plannerExpeditionSummaryEngine";
import type { TiyaTripIntent } from "@/app/lib/ecosystem/planner/plannerTypes";
import TiyaDestinationCluster from "./TiyaDestinationCluster";
import TiyaExpeditionTimeline from "./TiyaExpeditionTimeline";
import TiyaRouteClusterMap from "./TiyaRouteClusterMap";

export type TiyaRouteStrategyId =
  | "fastest"
  | "cheapest"
  | "comfortable"
  | "scenic"
  | "adventure"
  | "spiritual"
  | "local-life"
  | "creator";

export type TiyaRouteStrategySnapshot = {
  id: TiyaRouteStrategyId;
  label: string;
  mode: TiyaExpeditionMode;
  comfortScore: number;
  riskScore: number;
  complexity: number;
  expeditionIntensity: number;
  travelHours: number;
  recommendedStops: number;
  recoveryWindows: number;
  clusterStructure: string;
  budget: number;
  budgetImpact: number;
  fatigueReduction: number;
  backtrackingReduction: number;
  travelHoursDelta: number;
  fuelEfficiency: number;
  creatorOpportunities: number;
  localLifeOpportunities: number;
  scenicExposure: number;
  reasons: string[];
  intelligence: Record<string, string>;
  flow: string[];
};

type TiyaExpeditionBuilderProps = {
  intent: TiyaTripIntent;
  selectedScenarioId?: string;
  selectedVariantId?: string;
  isGenerating?: boolean;
  appliedStrategyId?: string;
  savedStrategyIds?: string[];
  onStrategyAction?: (
    action: "preview" | "compare" | "apply" | "convert" | "save" | "remove",
    strategy: TiyaRouteStrategySnapshot
  ) => void;
};

const strategyDefinitions: Array<{
  id: TiyaRouteStrategyId;
  label: string;
  mode: TiyaExpeditionMode;
  tone: string;
}> = [
  { id: "fastest", label: "Fastest Route", mode: "Fast Circuit", tone: "cyan" },
  { id: "cheapest", label: "Cheapest Route", mode: "Explorer Mode", tone: "emerald" },
  { id: "comfortable", label: "Most Comfortable Route", mode: "Luxury Expedition", tone: "orange" },
  { id: "scenic", label: "Most Scenic Route", mode: "Scenic Expedition", tone: "cyan" },
  { id: "adventure", label: "Adventure Route", mode: "Adventure Expedition", tone: "orange" },
  { id: "spiritual", label: "Spiritual Route", mode: "Spiritual Circuit", tone: "emerald" },
  { id: "local-life", label: "Local Life Route", mode: "Cultural Circuit", tone: "cyan" },
  { id: "creator", label: "Creator Route", mode: "Explorer Mode", tone: "orange" },
];

function clampScore(value: number) {
  return Math.max(8, Math.min(98, Math.round(value)));
}

function formatMoney(value: number) {
  return `₹${Math.round(value).toLocaleString("en-IN")}`;
}

function strategyForRecommendedMode(mode: TiyaExpeditionMode): TiyaRouteStrategyId {
  if (mode === "Fast Circuit") return "fastest";
  if (mode === "Luxury Expedition") return "comfortable";
  if (mode === "Scenic Expedition") return "scenic";
  if (mode === "Adventure Expedition") return "adventure";
  if (mode === "Spiritual Circuit") return "spiritual";
  if (mode === "Cultural Circuit") return "local-life";
  return "creator";
}

function strategyAdjustments(id: TiyaRouteStrategyId) {
  const map: Record<TiyaRouteStrategyId, {
    comfort: number;
    risk: number;
    complexity: number;
    intensity: number;
    hours: number;
    budget: number;
    stops: number;
    recovery: number;
    creator: number;
    local: number;
    scenic: number;
    fuel: number;
  }> = {
    fastest: { comfort: -6, risk: 8, complexity: -8, intensity: 8, hours: -1.4, budget: -1200, stops: -1, recovery: -1, creator: 0, local: 0, scenic: -5, fuel: 5 },
    cheapest: { comfort: -8, risk: 4, complexity: 4, intensity: 7, hours: 0.8, budget: -3600, stops: 0, recovery: 0, creator: 0, local: 1, scenic: -2, fuel: 7 },
    comfortable: { comfort: 12, risk: -8, complexity: -3, intensity: -10, hours: 0.6, budget: 2400, stops: 1, recovery: 2, creator: 1, local: 1, scenic: 4, fuel: 2 },
    scenic: { comfort: 5, risk: -2, complexity: 6, intensity: 2, hours: 1.2, budget: 1800, stops: 2, recovery: 1, creator: 2, local: 2, scenic: 15, fuel: -3 },
    adventure: { comfort: -4, risk: 10, complexity: 9, intensity: 14, hours: 0.9, budget: 1200, stops: 2, recovery: 1, creator: 2, local: 1, scenic: 12, fuel: -4 },
    spiritual: { comfort: 3, risk: -6, complexity: 3, intensity: -2, hours: 0.4, budget: 900, stops: 2, recovery: 2, creator: 0, local: 2, scenic: 5, fuel: 1 },
    "local-life": { comfort: 4, risk: -3, complexity: 5, intensity: 1, hours: 0.5, budget: 1400, stops: 3, recovery: 1, creator: 1, local: 4, scenic: 7, fuel: 0 },
    creator: { comfort: 6, risk: -4, complexity: 4, intensity: 0, hours: 0.7, budget: 1600, stops: 3, recovery: 1, creator: 3, local: 2, scenic: 10, fuel: 1 },
  };

  return map[id];
}

function buildStrategySnapshot({
  definition,
  destinationCount,
  intent,
  summary,
}: {
  definition: (typeof strategyDefinitions)[number];
  destinationCount: number;
  intent: TiyaTripIntent;
  summary: ReturnType<typeof generateExpeditionSummary>;
}): TiyaRouteStrategySnapshot {
  const adjustment = strategyAdjustments(definition.id);
  const baseHours = Math.max(4.5, destinationCount * 2.35 + (intent.pace === "Packed" ? 0.7 : 0));
  const budgetBase = Math.max(
    12000,
    Number(intent.customBudgetAmount) || destinationCount * 4200
  );
  const recoveryWindows = Math.max(0, Math.round(destinationCount / 2) + adjustment.recovery);
  const recommendedStops = Math.max(1, destinationCount + adjustment.stops);
  const comfortScore = clampScore(summary.comfortScore + adjustment.comfort);
  const riskScore = clampScore(100 - comfortScore + adjustment.risk);
  const travelHours = Math.max(3.5, Number((baseHours + adjustment.hours).toFixed(1)));
  const fatigueReduction = clampScore(10 + adjustment.comfort + Math.max(0, adjustment.recovery) * 4);
  const backtrackingReduction = clampScore(54 + adjustment.stops * 5 + adjustment.fuel);

  return {
    id: definition.id,
    label: definition.label,
    mode: definition.mode,
    comfortScore,
    riskScore,
    complexity: clampScore(summary.routeComplexity + adjustment.complexity),
    expeditionIntensity: clampScore(summary.expeditionIntensity + adjustment.intensity),
    travelHours,
    recommendedStops,
    recoveryWindows,
    clusterStructure:
      definition.id === "fastest"
        ? "Gateway → Core → Destination"
        : definition.id === "comfortable"
          ? "Gateway → Recovery → Scenic → Destination"
          : definition.id === "creator"
            ? "Gateway → Scenic → Creator → Destination"
            : definition.id === "local-life"
              ? "Gateway → Food → Local Life → Destination"
              : "Gateway → Regional → Recovery → Destination",
    budget: Math.max(8000, budgetBase + adjustment.budget),
    budgetImpact: adjustment.budget,
    fatigueReduction,
    backtrackingReduction,
    travelHoursDelta: adjustment.hours,
    fuelEfficiency: adjustment.fuel,
    creatorOpportunities: Math.max(0, adjustment.creator),
    localLifeOpportunities: Math.max(0, adjustment.local),
    scenicExposure: Math.max(0, adjustment.scenic),
    reasons: [
      `${fatigueReduction}% lower travel fatigue`,
      `${Math.max(1, recoveryWindows)} recovery window${recoveryWindows === 1 ? "" : "s"} protected`,
      adjustment.fuel >= 0 ? "Better fuel and food coverage" : "More scenic detours with fuel checks required",
      riskScore <= 24 ? "Safer daylight movement" : "Needs tighter daylight monitoring",
      `Reduced route backtracking by ${backtrackingReduction}%`,
      definition.id === "creator"
        ? "Better creator and local life opportunities"
        : definition.id === "local-life"
          ? "Stronger local food, maker and market coverage"
          : "Balanced stop clustering for this traveller profile",
    ],
    intelligence: {
      "Longest Travel Day": `${Math.max(4, Math.round(travelHours * 0.62))}h transfer segment`,
      "Highest Fatigue Point": definition.id === "fastest" ? "Arrival-to-core transfer" : "Mid-route movement day",
      "Best Recovery Stop": definition.id === "comfortable" ? "Recovery Stop" : "Regional gateway halt",
      "Best Scenic Segment": definition.id === "scenic" || definition.id === "creator" ? "Scenic Zone" : "Core-to-destination movement",
      "Best Local Life Opportunity": definition.id === "local-life" ? "Food Zone + maker stop" : "Destination evening pocket",
      "Best Creator Opportunity": definition.id === "creator" ? "Creator Zone" : "Golden-hour stop",
      "Food Coverage Quality": definition.id === "fastest" ? "Moderate" : "Strong",
      "Night Travel Exposure": riskScore > 28 ? "Watchlist" : "Low",
      "Permit/Risk Alerts": definition.id === "adventure" ? "Terrain and permit checks needed" : "Standard route checks",
      "Weather Sensitivity": definition.id === "scenic" || definition.id === "adventure" ? "High" : "Medium",
    },
    flow:
      definition.id === "creator"
        ? ["Origin", "Recovery Stop", "Scenic Zone", "Creator Zone", "Destination"]
        : definition.id === "local-life"
          ? ["Origin", "Gateway", "Food Zone", "Local Life Zone", "Destination"]
          : definition.id === "comfortable"
            ? ["Origin", "Recovery Stop", "Scenic Zone", "Comfort Base", "Destination"]
            : ["Origin", "Gateway Cluster", "Regional Zone", "Recovery Stop", "Destination"],
  };
}

export default function TiyaExpeditionBuilder({
  intent,
  selectedScenarioId,
  selectedVariantId,
  isGenerating = false,
  appliedStrategyId,
  savedStrategyIds = [],
  onStrategyAction,
}: TiyaExpeditionBuilderProps) {
  const recommendedMode = useMemo(
    () => getRecommendedExpeditionMode(intent),
    [intent]
  );
  const [activeStrategyId, setActiveStrategyId] = useState<TiyaRouteStrategyId>(
    () => strategyForRecommendedMode(recommendedMode)
  );
  const [destinations, setDestinations] = useState<TiyaExpeditionDestination[]>(
    () => getDefaultExpeditionDestinations(intent)
  );
  const [showPreview, setShowPreview] = useState(false);
  const [showComparison, setShowComparison] = useState(true);
  const [loopMode, setLoopMode] = useState(intent.tripType === "Road trip loop");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setActiveStrategyId(strategyForRecommendedMode(recommendedMode));
      setDestinations(getDefaultExpeditionDestinations(intent));
      setLoopMode(intent.tripType === "Road trip loop");
    }, 0);

    return () => window.clearTimeout(timer);
  }, [intent, recommendedMode]);

  const safeDestinations = useMemo(
    () => (Array.isArray(destinations) ? destinations : []),
    [destinations]
  );
  const activeDefinition =
    strategyDefinitions.find((strategy) => strategy.id === activeStrategyId) ||
    strategyDefinitions[0];
  const regionIntelligence = useMemo(
    () => getRegionIntelligence(intent),
    [intent]
  );
  const clusters = useMemo(
    () =>
      generateDestinationClusters({
        destinations: safeDestinations,
        intent,
        mode: activeDefinition.mode,
      }),
    [activeDefinition.mode, intent, safeDestinations]
  );
  const timeline = useMemo(
    () =>
      generateExpeditionTimeline({
        destinations: safeDestinations,
        intent,
      }),
    [intent, safeDestinations]
  );
  const summary = useMemo(
    () =>
      generateExpeditionSummary({
        destinations: safeDestinations,
        clusters,
        intent,
        mode: activeDefinition.mode,
      }),
    [activeDefinition.mode, clusters, intent, safeDestinations]
  );
  const strategies = useMemo(
    () =>
      strategyDefinitions.map((definition) =>
        buildStrategySnapshot({
          definition,
          destinationCount: safeDestinations.length,
          intent,
          summary,
        })
      ),
    [intent, safeDestinations.length, summary]
  );
  const activeStrategy =
    strategies.find((strategy) => strategy.id === activeStrategyId) ||
    strategies[0];
  const comparisonStrategies = useMemo(() => {
    const preferred = ["fastest", "cheapest", "comfortable"].filter(
      (id) => id !== activeStrategy.id
    );
    return [
      activeStrategy,
      ...preferred
        .map((id) => strategies.find((strategy) => strategy.id === id))
        .filter(Boolean),
    ].slice(0, 3) as TiyaRouteStrategySnapshot[];
  }, [activeStrategy, strategies]);
  const isSaved = savedStrategyIds.includes(activeStrategy.id);
  const isApplied = appliedStrategyId === activeStrategy.id;

  function handleAction(
    action: "preview" | "compare" | "apply" | "convert" | "save" | "remove"
  ) {
    if (action === "preview") setShowPreview((current) => !current);
    if (action === "compare") setShowComparison(true);
    onStrategyAction?.(action, activeStrategy);
  }

  return (
    <section
      className={`overflow-hidden rounded-[2rem] border border-slate-800 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.22),transparent_34%),linear-gradient(135deg,#071329_0%,#0f1e36_52%,#111827_100%)] p-4 text-white shadow-[0_28px_90px_rgba(15,23,42,0.24)] transition-opacity duration-300 sm:p-5 ${
        isGenerating ? "opacity-80" : "opacity-100"
      }`}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-cyan-100">
            <Compass size={15} className={isGenerating ? "animate-pulse" : undefined} />
            Strategic Route Intelligence
          </div>
          <h2 className="mt-2 text-2xl font-black text-white sm:text-3xl">
            Which route strategy is best?
          </h2>
          <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-white/70">
            Tiya evaluates route strategy before itinerary commitment, balancing
            fatigue, safety, travel hours, stops, creator value and Local Life coverage.
          </p>
          <p className="mt-2 text-xs font-black uppercase tracking-[0.14em] text-white/42">
            {selectedScenarioId || selectedVariantId
              ? "Scenario and route variant context included"
              : "Base trip intent is driving this strategy simulation"}
          </p>
        </div>
        <div className="grid gap-2 rounded-3xl border border-orange-300/25 bg-orange-400/10 p-3 text-sm font-black text-orange-100 sm:min-w-[240px]">
          <span>{activeStrategy.label}</span>
          <span>Comfort {activeStrategy.comfortScore} · Risk {activeStrategy.riskScore}</span>
          <span>{activeStrategy.travelHours}h travel window</span>
          {isApplied ? <span className="text-emerald-100">✓ Applied to itinerary</span> : null}
        </div>
      </div>

      <div className="mt-5 rounded-3xl border border-white/10 bg-white/[0.07] p-3 sm:p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
              <Route size={15} />
              Route Strategy Simulator
            </div>
            <p className="mt-1 text-sm font-bold text-white/70">
              Select a strategy to simulate tradeoffs before applying it to the main itinerary.
            </p>
          </div>
          <span className="w-fit rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1.5 text-xs font-black text-cyan-100">
            Active: {activeStrategy.label}
          </span>
        </div>
        <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-4">
          {strategies.map((strategy) => (
            <button
              key={strategy.id}
              type="button"
              onClick={() => setActiveStrategyId(strategy.id)}
              className={`min-w-0 rounded-3xl border p-3 text-left transition hover:-translate-y-0.5 ${
                activeStrategy.id === strategy.id
                  ? "border-orange-300/55 bg-orange-500/16 shadow-[0_16px_44px_rgba(249,115,22,0.18)]"
                  : "border-white/10 bg-white/10 hover:bg-white/15"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-black text-white">{strategy.label}</p>
                {activeStrategy.id === strategy.id ? (
                  <CheckCircle2 size={16} className="text-orange-200" />
                ) : null}
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] font-black">
                <span className="rounded-2xl bg-white/10 px-2 py-1.5 text-cyan-100">
                  Comfort {strategy.comfortScore}
                </span>
                <span className="rounded-2xl bg-white/10 px-2 py-1.5 text-white/70">
                  {strategy.travelHours}h
                </span>
                <span className="rounded-2xl bg-white/10 px-2 py-1.5 text-white/70">
                  Stops {strategy.recommendedStops}
                </span>
                <span className="rounded-2xl bg-white/10 px-2 py-1.5 text-white/70">
                  Risk {strategy.riskScore}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {[
          ["Comfort score", activeStrategy.comfortScore],
          ["Complexity", activeStrategy.complexity],
          ["Expedition intensity", activeStrategy.expeditionIntensity],
          ["Travel hours", `${activeStrategy.travelHours}h`],
          ["Recommended stops", activeStrategy.recommendedStops],
          ["Recovery windows", activeStrategy.recoveryWindows],
          ["Cluster structure", activeStrategy.clusterStructure],
          ["Budget", formatMoney(activeStrategy.budget)],
        ].map(([label, value]) => (
          <div
            key={label}
            className="min-w-0 rounded-3xl border border-white/10 bg-white/[0.07] p-3"
          >
            <p className="text-[11px] font-black uppercase tracking-[0.14em] text-white/50">
              {label}
            </p>
            <p className="mt-2 break-words text-lg font-black text-white">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-3 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-3xl border border-cyan-300/14 bg-cyan-300/10 p-4">
          <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
            <Sparkles size={15} />
            Why Tiya Recommends This Strategy
          </div>
          <div className="mt-3 grid gap-2">
            {activeStrategy.reasons.map((reason) => (
              <p
                key={reason}
                className="rounded-2xl border border-white/10 bg-white/10 p-3 text-sm font-semibold leading-5 text-cyan-50/82"
              >
                ✓ {reason}
              </p>
            ))}
          </div>
        </div>

        {showComparison ? (
        <div className="rounded-3xl border border-white/10 bg-white/[0.07] p-4">
          <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
            <GitCompareArrows size={15} />
            Route Comparison Engine
          </div>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            {comparisonStrategies.map((strategy, index) => (
              <div
                key={strategy.id}
                className={`rounded-3xl border p-3 ${
                  index === 0
                    ? "border-orange-300/34 bg-orange-400/10"
                    : "border-white/10 bg-white/10"
                }`}
              >
                <p className="text-xs font-black uppercase tracking-[0.14em] text-white/48">
                  {index === 0 ? "Current Strategy" : `Alternative Strategy ${String.fromCharCode(64 + index)}`}
                </p>
                <h3 className="mt-1 text-sm font-black text-white">{strategy.label}</h3>
                <div className="mt-3 grid gap-1.5 text-xs font-black text-white/72">
                  <span>Comfort: {strategy.comfortScore}</span>
                  <span>Risk: {strategy.riskScore}</span>
                  <span>Travel Time: {strategy.travelHours}h</span>
                  <span>Budget: {formatMoney(strategy.budget)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        ) : null}
      </div>

      <div className="mt-4 rounded-3xl border border-white/10 bg-white/[0.07] p-4">
        <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
          <ShieldCheck size={15} />
          Expedition Intelligence
        </div>
        <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-5">
          {Object.entries(activeStrategy.intelligence).map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-white/10 bg-white/10 p-3">
              <p className="text-[10px] font-black uppercase tracking-[0.12em] text-white/45">
                {label}
              </p>
              <p className="mt-1 break-words text-xs font-black leading-5 text-white">
                {value}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 grid gap-3 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-3xl border border-white/10 bg-white/[0.07] p-4">
          <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
            <MapPinned size={15} />
            Journey Flow Architecture
          </div>
          <div className="mt-4 grid gap-2">
            {activeStrategy.flow.map((step, index) => (
              <div key={`${step}-${index}`} className="grid gap-2">
                <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-black text-white">
                  {step}
                </div>
                {index < activeStrategy.flow.length - 1 ? (
                  <div className="pl-4 text-cyan-100">↓</div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
        <TiyaRouteClusterMap destinations={safeDestinations} loopMode={loopMode} />
      </div>

      <div className="mt-4 grid gap-3 xl:grid-cols-[0.95fr_1.05fr]">
        <TiyaExpeditionTimeline items={timeline} />
        <div className="rounded-3xl border border-white/10 bg-white/[0.07] p-4">
          <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-orange-100">
            <Zap size={15} />
            If Applied To Main Itinerary
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {[
              ["Comfort", `+${Math.max(0, activeStrategy.comfortScore - summary.comfortScore) || 12}`],
              ["Risk", `-${Math.max(1, 100 - activeStrategy.riskScore - 68) || 18}`],
              ["Travel Hours", `${activeStrategy.travelHoursDelta > 0 ? "+" : ""}${activeStrategy.travelHoursDelta}h`],
              ["Fuel Efficiency", `${activeStrategy.fuelEfficiency > 0 ? "+" : ""}${activeStrategy.fuelEfficiency}%`],
              ["Creator Opportunities", `+${activeStrategy.creatorOpportunities}`],
              ["Local Life Opportunities", `+${activeStrategy.localLifeOpportunities}`],
              ["Scenic Exposure", `+${activeStrategy.scenicExposure}`],
              ["Budget Impact", `${activeStrategy.budgetImpact >= 0 ? "+" : "-"}${formatMoney(Math.abs(activeStrategy.budgetImpact))}`],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-white/10 p-3">
                <p className="text-[10px] font-black uppercase tracking-[0.12em] text-white/45">
                  {label}
                </p>
                <p className="mt-1 text-sm font-black text-white">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-3xl border border-orange-300/20 bg-orange-400/10 p-4">
        <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-orange-100">
          <Sparkles size={15} />
          Tiya Intelligence
        </div>
        <p className="mt-2 text-sm font-semibold leading-6 text-orange-50/82">
          This route is {activeStrategy.fatigueReduction}% more comfortable than a raw fastest-route plan and gives better {activeStrategy.creatorOpportunities >= activeStrategy.localLifeOpportunities ? "creator" : "Local Life"} coverage. Recommended for {summary.recommendedTravellerType.toLowerCase()} who want fewer route mistakes before booking.
        </p>
        <p className="mt-2 rounded-2xl border border-white/10 bg-white/10 px-3 py-2 text-xs font-black text-orange-50/76">
          {regionIntelligence.regionType}: {regionIntelligence.transferStyle}
        </p>
      </div>

      {showPreview ? (
        <div className="mt-4 rounded-3xl border border-cyan-300/18 bg-cyan-300/10 p-4">
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
            Strategy Preview
          </p>
          <div className="mt-3 grid gap-2 md:grid-cols-2">
            {activeStrategy.reasons.concat(summary.warnings).slice(0, 6).map((item) => (
              <p key={item} className="rounded-2xl border border-white/10 bg-white/10 p-3 text-xs font-semibold leading-5 text-cyan-50/76">
                {item}
              </p>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        {clusters.map((cluster) => (
          <TiyaDestinationCluster key={cluster.id} cluster={cluster} />
        ))}
      </div>

      <div className="mt-4 rounded-3xl border border-white/10 bg-white/[0.07] p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
              Convert To Main Itinerary
            </p>
            <h3 className="mt-1 text-lg font-black text-white">
              Apply {activeStrategy.label}
            </h3>
          </div>
          <div className="grid gap-2 sm:grid-cols-5">
            <button type="button" onClick={() => handleAction("preview")} className="rounded-full border border-white/12 bg-white/10 px-4 py-2 text-xs font-black text-white transition hover:bg-white/15">
              Preview Strategy
            </button>
            <button type="button" onClick={() => handleAction("compare")} className="rounded-full border border-cyan-300/18 bg-cyan-300/10 px-4 py-2 text-xs font-black text-cyan-50 transition hover:bg-cyan-300/15">
              Compare Route
            </button>
            <button type="button" onClick={() => handleAction("apply")} disabled={isApplied} className="rounded-full border border-emerald-300/24 bg-emerald-400/12 px-4 py-2 text-xs font-black text-emerald-50 transition hover:bg-emerald-400/18 disabled:cursor-not-allowed disabled:opacity-60">
              {isApplied ? "Applied" : "Apply Strategy"}
            </button>
            <button type="button" onClick={() => handleAction("convert")} disabled={isApplied} className="rounded-full bg-orange-500 px-4 py-2 text-xs font-black text-white shadow-[0_12px_30px_rgba(249,115,22,0.24)] transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-60">
              Convert To Main Itinerary
            </button>
            <button type="button" onClick={() => handleAction(isSaved ? "remove" : "save")} className={`inline-flex items-center justify-center gap-1.5 rounded-full border px-4 py-2 text-xs font-black transition ${isSaved ? "border-red-300/24 bg-red-400/12 text-red-50 hover:bg-red-400/18" : "border-cyan-300/18 bg-cyan-300/10 text-cyan-50 hover:bg-cyan-300/15"}`}>
              <Bookmark size={14} />
              {isSaved ? "Delete Saved" : "Save Strategy"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
