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
          </article>
        ))}
      </div>
    </div>
  );
}
