import { CheckCircle2 } from "lucide-react";

import type { TiyaRouteOption } from "@/app/lib/ecosystem/planner/plannerTypes";

import {
  budgetEstimate,
  buildRouteBullets,
  routeAccent,
  transportHint,
} from "./utils/workspaceHelpers";

export default function WorkspaceRouteHero({
  selectedRoute,
  fromCity,
  toCity,
  selectedTravelStyle,
  selectedBudgetVibe,
}: {
  selectedRoute: TiyaRouteOption;
  fromCity: string;
  toCity: string;
  selectedTravelStyle: string;
  selectedBudgetVibe: string;
}) {
  const accent = routeAccent(selectedRoute.id);
  const bullets = buildRouteBullets(selectedRoute);

  const statusCards = [
    {
      label: "Best for",
      value: selectedRoute.bestFor,
      className: "border-orange-200 bg-orange-50 text-orange-700",
    },
    {
      label: "Terrain",
      value: selectedRoute.difficulty,
      className: "border-cyan-200 bg-cyan-50 text-cyan-700",
    },
    {
      label: "Transport",
      value: transportHint(selectedRoute),
      className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    },
    {
      label: "Risk",
      value: `${selectedRoute.riskLevel} risk`,
      className:
        selectedRoute.riskLevel === "High"
          ? "border-rose-200 bg-rose-50 text-rose-700"
          : selectedRoute.riskLevel === "Medium"
            ? "border-amber-200 bg-amber-50 text-amber-700"
            : "border-emerald-200 bg-emerald-50 text-emerald-700",
    },
    {
      label: "Weather",
      value: "Live check later",
      className: "border-blue-200 bg-blue-50 text-blue-700",
    },
    {
      label: "Permit",
      value: selectedRoute.riskLevel === "High" ? "Review needed" : "Basic check",
      className: "border-violet-200 bg-violet-50 text-violet-700",
    },
  ];

  return (
    <section className="mt-4 overflow-hidden rounded-[2rem] border border-white bg-white/95 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
      <div className="relative overflow-hidden bg-[#061839] px-5 py-6 text-white lg:px-7">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_12%,rgba(34,211,238,0.16),transparent_26%),radial-gradient(circle_at_86%_12%,rgba(249,115,22,0.20),transparent_25%)]" />

        <div className="relative grid gap-5 lg:grid-cols-[1fr_390px] lg:items-center">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-cyan-100">
              Selected route
            </p>
            <h1 className="mt-2 text-4xl font-black tracking-tight lg:text-5xl">
              {selectedRoute.name}
            </h1>

            <div className="mt-3 max-w-3xl rounded-2xl border border-white/10 bg-white/8 p-4 backdrop-blur">
              <p className="mb-2 text-sm font-black text-white">
                {fromCity} → {toCity}
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {bullets.map((bullet) => (
                  <div
                    key={bullet}
                    className="flex items-start gap-2 text-sm font-semibold leading-6 text-white/78"
                  >
                    <CheckCircle2
                      size={16}
                      className="mt-1 shrink-0 text-orange-300"
                    />
                    <span>{bullet}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {[
                selectedRoute.duration,
                selectedRoute.distance,
                budgetEstimate(selectedRoute),
                selectedTravelStyle,
                selectedBudgetVibe,
              ].map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-white/16 bg-white/12 px-3 py-1.5 text-xs font-black text-white backdrop-blur"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-white/18 bg-white/12 p-4 shadow-xl backdrop-blur-xl">
            <div className={`mb-3 h-1.5 rounded-full bg-gradient-to-r ${accent}`} />
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-cyan-100">
              Route status
            </p>
            <div className="mt-3 grid gap-2">
              {statusCards.map((card) => (
                <div
                  key={card.label}
                  className={`rounded-2xl border px-3 py-2 ${card.className}`}
                >
                  <p className="text-[9px] font-black uppercase tracking-[0.12em] opacity-70">
                    {card.label}
                  </p>
                  <p className="mt-1 text-sm font-black">{card.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
