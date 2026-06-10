"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Compass,
  Flag,
  Plus,
  RotateCcw,
  Sparkles,
  Trash2,
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

type TiyaExpeditionBuilderProps = {
  intent: TiyaTripIntent;
  selectedScenarioId?: string;
  selectedVariantId?: string;
  isGenerating?: boolean;
};

const expeditionModes: TiyaExpeditionMode[] = [
  "Scenic Expedition",
  "Fast Circuit",
  "Cultural Circuit",
  "Spiritual Circuit",
  "Adventure Expedition",
  "Luxury Expedition",
  "Explorer Mode",
];

function makeDestination(name: string, index: number): TiyaExpeditionDestination {
  return {
    id: `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`,
    name,
    region: "custom route",
    role: index === 0 ? "Gateway" : "Core",
    stayNights: 1,
    intensity: "Medium",
  };
}

function moveDestination(
  destinations: TiyaExpeditionDestination[],
  fromIndex: number,
  toIndex: number
): TiyaExpeditionDestination[] {
  const safeDestinations = Array.isArray(destinations) ? destinations : [];
  if (toIndex < 0 || toIndex >= safeDestinations.length) return safeDestinations;

  const nextDestinations = [...safeDestinations];
  const [item] = nextDestinations.splice(fromIndex, 1);
  if (!item) return safeDestinations;

  nextDestinations.splice(toIndex, 0, item);
  return nextDestinations.map((destination, index) => {
    const role: TiyaExpeditionDestination["role"] =
      index === 0
        ? "Origin"
        : index === nextDestinations.length - 1
          ? "Finale"
          : destination.role === "Origin" || destination.role === "Finale"
            ? "Core"
            : destination.role;

    return {
      ...destination,
      role,
    };
  });
}

export default function TiyaExpeditionBuilder({
  intent,
  selectedScenarioId,
  selectedVariantId,
  isGenerating = false,
}: TiyaExpeditionBuilderProps) {
  const recommendedMode = useMemo(
    () => getRecommendedExpeditionMode(intent),
    [intent]
  );
  const [mode, setMode] = useState<TiyaExpeditionMode>(recommendedMode);
  const [destinations, setDestinations] = useState<TiyaExpeditionDestination[]>(
    () => getDefaultExpeditionDestinations(intent)
  );
  const [newDestination, setNewDestination] = useState("");
  const [loopMode, setLoopMode] = useState(intent.tripType === "Road trip loop");
  const [openEndedMode, setOpenEndedMode] = useState(
    intent.tripType === "Multi-city"
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setMode(recommendedMode);
      setDestinations(getDefaultExpeditionDestinations(intent));
      setLoopMode(intent.tripType === "Road trip loop");
      setOpenEndedMode(intent.tripType === "Multi-city");
    }, 0);

    return () => window.clearTimeout(timer);
  }, [intent, recommendedMode]);

  const safeDestinations = useMemo(
    () => (Array.isArray(destinations) ? destinations : []),
    [destinations]
  );
  const regionIntelligence = useMemo(
    () => getRegionIntelligence(intent),
    [intent]
  );
  const clusters = useMemo(
    () =>
      generateDestinationClusters({
        destinations: safeDestinations,
        intent,
        mode,
      }),
    [intent, mode, safeDestinations]
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
        mode,
      }),
    [clusters, intent, mode, safeDestinations]
  );

  function handleAddDestination() {
    const value = newDestination.trim();
    if (!value) return;

    setDestinations((currentDestinations) => [
      ...currentDestinations,
      makeDestination(value, currentDestinations.length),
    ]);
    setNewDestination("");
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
            Multi-destination expedition engine
          </div>
          <h2 className="mt-2 text-2xl font-black text-white sm:text-3xl">
            {intent.fromCity} to {intent.toCity} expedition OS
          </h2>
          <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-white/70">
            Tiya clusters long journeys into logical movement flows, recovery
            points and region-aware transfer chains for multi-city circuits.
          </p>
        </div>
        <div className="grid gap-2 rounded-3xl border border-orange-300/25 bg-orange-400/10 p-3 text-sm font-black text-orange-100 sm:min-w-[220px]">
          <span>{summary.totalRouteDistance}</span>
          <span>{summary.estimatedExpeditionDays} expedition days</span>
          <span>{summary.fatigueRisk} fatigue risk</span>
        </div>
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl border border-white/10 bg-white/[0.07] p-3 sm:p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
                <Flag size={15} />
                Route builder
              </div>
              <p className="mt-1 text-sm font-bold text-white/70">
                Add, remove and reorder destinations for a circuit-ready route.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setLoopMode((value) => !value)}
                className={`rounded-full border px-3 py-2 text-xs font-black transition ${
                  loopMode
                    ? "border-orange-300/50 bg-orange-500 text-white"
                    : "border-white/10 bg-white/10 text-white/70"
                }`}
              >
                Loop trip
              </button>
              <button
                type="button"
                onClick={() => setOpenEndedMode((value) => !value)}
                className={`rounded-full border px-3 py-2 text-xs font-black transition ${
                  openEndedMode
                    ? "border-cyan-300/50 bg-cyan-400/20 text-cyan-100"
                    : "border-white/10 bg-white/10 text-white/70"
                }`}
              >
                Open-ended
              </button>
            </div>
          </div>

          <div className="mt-4 grid gap-2">
            {safeDestinations.map((destination, index) => (
              <div
                key={destination.id}
                className="grid gap-3 rounded-3xl border border-white/10 bg-white/10 p-3 sm:grid-cols-[1fr_auto] sm:items-center"
              >
                <div className="min-w-0">
                  <p className="text-[11px] font-black uppercase tracking-[0.14em] text-white/50">
                    {destination.role} · {destination.region}
                  </p>
                  <h3 className="mt-1 truncate text-base font-black text-white">
                    {index + 1}. {destination.name}
                  </h3>
                  <div className="mt-2 flex flex-wrap gap-2 text-[11px] font-black">
                    <span className="rounded-full bg-white/10 px-2.5 py-1 text-white/70">
                      {destination.stayNights} night cluster
                    </span>
                    <span className="rounded-full bg-cyan-300/10 px-2.5 py-1 text-cyan-100">
                      {destination.intensity} intensity
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setDestinations((current) =>
                        moveDestination(current, index, index - 1)
                      )
                    }
                    className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-white transition hover:bg-white/15"
                    aria-label={`Move ${destination.name} up`}
                  >
                    <ArrowUp size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setDestinations((current) =>
                        moveDestination(current, index, index + 1)
                      )
                    }
                    className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-white transition hover:bg-white/15"
                    aria-label={`Move ${destination.name} down`}
                  >
                    <ArrowDown size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setDestinations((current) =>
                        current.filter((item) => item.id !== destination.id)
                      )
                    }
                    className="flex h-10 w-10 items-center justify-center rounded-2xl border border-red-300/20 bg-red-400/10 text-red-100 transition hover:bg-red-400/20"
                    aria-label={`Remove ${destination.name}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto]">
            <input
              value={newDestination}
              onChange={(event) => setNewDestination(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") handleAddDestination();
              }}
              placeholder="Add another city or stop"
              className="min-h-11 rounded-2xl border border-white/10 bg-white/10 px-4 text-sm font-bold text-white outline-none placeholder:text-white/40 focus:border-orange-300/45"
            />
            <button
              type="button"
              onClick={handleAddDestination}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-orange-500 px-4 text-sm font-black text-white shadow-[0_12px_32px_rgba(249,115,22,0.28)] transition hover:bg-orange-600"
            >
              <Plus size={16} />
              Add destination
            </button>
          </div>
        </div>

        <div className="grid gap-3">
          <div className="rounded-3xl border border-white/10 bg-white/[0.07] p-3 sm:p-4">
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
              <Sparkles size={15} />
              Expedition modes
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {expeditionModes.map((expeditionMode) => (
                <button
                  key={expeditionMode}
                  type="button"
                  onClick={() => setMode(expeditionMode)}
                  className={`rounded-full border px-3 py-2 text-xs font-black transition ${
                    mode === expeditionMode
                      ? "border-orange-300/55 bg-orange-500 text-white"
                      : "border-white/10 bg-white/10 text-white/70 hover:bg-white/15"
                  }`}
                >
                  {expeditionMode}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.07] p-3 sm:p-4">
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
              <RotateCcw size={15} />
              Region intelligence
            </div>
            <h3 className="mt-2 text-lg font-black text-white">
              {regionIntelligence.regionType}
            </h3>
            <p className="mt-2 text-sm font-semibold leading-6 text-white/70">
              {regionIntelligence.note}
            </p>
            <div className="mt-3 rounded-2xl border border-cyan-300/20 bg-cyan-400/10 p-3 text-xs font-black text-cyan-100">
              Transfer style: {regionIntelligence.transferStyle}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {[
          ["Route complexity", summary.routeComplexity],
          ["Comfort score", summary.comfortScore],
          ["Expedition intensity", summary.expeditionIntensity],
          ["Recommended for", summary.recommendedTravellerType],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-3xl border border-white/10 bg-white/[0.07] p-3"
          >
            <p className="text-[11px] font-black uppercase tracking-[0.14em] text-white/50">
              {label}
            </p>
            <p className="mt-2 text-xl font-black text-white">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-3 xl:grid-cols-[0.95fr_1.05fr]">
        <TiyaRouteClusterMap destinations={safeDestinations} loopMode={loopMode} />
        <TiyaExpeditionTimeline items={timeline} />
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        {clusters.map((cluster) => (
          <TiyaDestinationCluster key={cluster.id} cluster={cluster} />
        ))}
      </div>

      <div className="mt-4 grid gap-2 rounded-3xl border border-white/10 bg-white/[0.07] p-3 sm:p-4">
        <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
          <Sparkles size={15} />
          Long-route intelligence
        </div>
        <div className="grid gap-2 md:grid-cols-2">
          {summary.warnings.map((warning) => (
            <p
              key={warning}
              className="rounded-2xl border border-white/10 bg-white/10 p-3 text-xs font-semibold leading-5 text-white/70"
            >
              {warning}
            </p>
          ))}
          <p className="rounded-2xl border border-white/10 bg-white/10 p-3 text-xs font-semibold leading-5 text-white/70">
            {openEndedMode
              ? "Open-ended mode keeps the final cluster flexible for exploration."
              : "Fixed expedition mode keeps the route day-count controlled."}
          </p>
          <p className="rounded-2xl border border-white/10 bg-white/10 p-3 text-xs font-semibold leading-5 text-white/70">
            {selectedScenarioId || selectedVariantId
              ? "Selected scenario or variant is included as context for this expedition view."
              : "Base trip intent is driving this expedition simulation."}
          </p>
        </div>
      </div>
    </section>
  );
}
