"use client";

import { CloudSun } from "lucide-react";
import type { TiyaWeatherSimulationCard } from "@/app/lib/ecosystem/planner/plannerWeatherSimulationEngine";

type TiyaWeatherSimulationCardsProps = {
  cards: TiyaWeatherSimulationCard[];
};

const toneStyles: Record<TiyaWeatherSimulationCard["tone"], string> = {
  green: "from-emerald-300 to-cyan-300",
  orange: "from-orange-300 to-amber-400",
  red: "from-rose-300 to-orange-400",
  blue: "from-cyan-300 to-blue-400",
};

function travelImpactForCard(card: TiyaWeatherSimulationCard) {
  const risk =
    card.tone === "red" || card.score < 50
      ? "high"
      : card.tone === "orange" || card.score < 72
        ? "medium"
        : "low";

  if (card.id === "rain-snow") {
    return risk === "high"
      ? {
          positives: ["Greener landscapes", "Better waterfall visibility"],
          warnings: ["Slower road movement", "Buffer time recommended"],
        }
      : {
          positives: ["Scenic landscapes remain workable", "Outdoor slots possible"],
          warnings: ["Keep one weather backup window"],
        };
  }

  if (card.id === "fog-cloud") {
    return {
      positives: risk === "low" ? ["Sunrise slots remain usable"] : ["Midday movement remains possible"],
      warnings: risk === "low" ? ["Monitor early morning visibility"] : ["Lower morning visibility", "Sunrise activities may shift"],
    };
  }

  if (card.id === "visibility") {
    return {
      positives: card.score >= 60 ? ["Scenic viewpoints available"] : ["Flexible scenic stops still possible"],
      warnings: card.score >= 60 ? ["Flexible travel timing advised"] : ["Route visibility reduction", "Avoid rushed road movement"],
    };
  }

  if (card.id === "daylight") {
    return {
      positives: ["Better route safety in daylight", "Cleaner transfer planning"],
      warnings: risk === "low" ? ["Avoid late starts"] : ["Start transfers earlier", "Limit late-evening roads"],
    };
  }

  if (card.id === "comfort") {
    return {
      positives: card.score >= 70 ? ["Traveller comfort is workable"] : ["Comfort can improve with buffers"],
      warnings: card.score >= 70 ? ["Keep hydration and rest windows"] : ["Add recovery windows", "Reduce packed activity pressure"],
    };
  }

  return {
    positives: card.score >= 70 ? ["Comfortable movement window"] : ["Route remains manageable with planning"],
    warnings: card.score >= 70 ? ["Carry seasonal backup layers"] : ["Weather-sensitive timing advised"],
  };
}

export default function TiyaWeatherSimulationCards({
  cards,
}: TiyaWeatherSimulationCardsProps) {
  const safeCards = Array.isArray(cards) ? cards : [];

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.07] p-3 sm:p-4">
      <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
        <CloudSun size={15} />
        Weather simulation cards
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {safeCards.map((card) => (
          <article
            key={card.id}
            className="rounded-2xl border border-white/10 bg-white/[0.06] p-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="text-sm font-black text-white">{card.label}</h4>
                <p className="mt-1 text-lg font-black text-white">
                  {card.value}
                </p>
              </div>
              <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-black text-white/75">
                {card.score}%
              </span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${toneStyles[card.tone]}`}
                style={{ width: `${card.score}%` }}
              />
            </div>
            <p className="mt-3 text-xs font-semibold leading-5 text-white/70">
              {card.note}
            </p>
            <div className="mt-3 rounded-2xl border border-white/10 bg-black/10 p-3">
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-cyan-100">
                Travel impact
              </p>
              <div className="mt-2 grid gap-1.5 text-xs font-semibold leading-5">
                {travelImpactForCard(card).positives.map((impact) => (
                  <div key={`${card.id}-positive-${impact}`} className="flex gap-2 text-emerald-100">
                    <span>✓</span>
                    <span>{impact}</span>
                  </div>
                ))}
                {travelImpactForCard(card).warnings.map((impact) => (
                  <div key={`${card.id}-warning-${impact}`} className="flex gap-2 text-amber-100">
                    <span>⚠</span>
                    <span>{impact}</span>
                  </div>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
