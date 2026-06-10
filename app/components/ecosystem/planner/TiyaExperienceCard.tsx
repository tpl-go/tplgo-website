"use client";

import { CheckCircle2, Plus, Sparkles } from "lucide-react";
import type { TiyaExperience } from "@/app/lib/ecosystem/planner/plannerExperienceEngine";

type TiyaExperienceCardProps = {
  experience: TiyaExperience;
  isAdded?: boolean;
  onAdd: (experienceId: string) => void;
};

function ScoreChip({
  label,
  score,
}: {
  label: string;
  score: number;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 p-2.5">
      <p className="text-[10px] font-black uppercase tracking-[0.12em] text-white/50">
        {label}
      </p>
      <p className="mt-1 text-sm font-black text-white">{score}%</p>
    </div>
  );
}

export default function TiyaExperienceCard({
  experience,
  isAdded = false,
  onAdd,
}: TiyaExperienceCardProps) {
  return (
    <article
      className={`overflow-hidden rounded-3xl border transition ${
        experience.isHighlighted
          ? "border-orange-300/50 bg-orange-500/10 shadow-[0_16px_44px_rgba(249,115,22,0.18)]"
          : "border-white/10 bg-white/[0.08] hover:bg-white/10"
      }`}
    >
      <div className="relative min-h-[150px] p-4">
        <div className="absolute inset-0 bg-[linear-gradient(140deg,rgba(14,165,233,0.22),rgba(15,23,42,0.12),rgba(249,115,22,0.22))]" />
        <div className="relative flex h-full min-h-[118px] flex-col justify-between">
          <div className="flex items-start justify-between gap-3">
            <span className="rounded-full border border-white/15 bg-white/15 px-2.5 py-1 text-[11px] font-black text-white">
              {experience.category}
            </span>
            {experience.isHighlighted ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-cyan-300/15 px-2.5 py-1 text-[11px] font-black text-cyan-100">
                <Sparkles size={12} />
                Tiya fit
              </span>
            ) : null}
          </div>
          <div>
            <h3 className="text-xl font-black leading-tight text-white">
              {experience.title}
            </h3>
            <p className="mt-1 text-sm font-bold text-white/70">
              Day {experience.suggestedDay} · {experience.bestTime} ·{" "}
              {experience.duration}
            </p>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          <ScoreChip label="Fit" score={experience.fitScore} />
          <ScoreChip label="Crowd" score={experience.crowdLevel} />
          <ScoreChip label="Fatigue" score={experience.fatigueImpact} />
          <ScoreChip label="Budget" score={experience.budgetImpact} />
          <ScoreChip label="Creator" score={experience.creatorValue} />
          <ScoreChip label="Commerce" score={experience.localCommerceValue} />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-black text-white/75">
            {experience.intensity} intensity
          </span>
          <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-black text-white/75">
            {experience.costBand} cost
          </span>
          <span className="rounded-full bg-emerald-400/15 px-2.5 py-1 text-[11px] font-black text-emerald-100">
            {experience.bookingReadiness}
          </span>
        </div>

        <p className="mt-4 text-sm font-semibold leading-6 text-white/70">
          {experience.reason}
        </p>

        <button
          type="button"
          onClick={() => onAdd(experience.id)}
          className={`mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full px-4 py-2 text-xs font-black transition ${
            isAdded
              ? "bg-gradient-to-r from-[#ff7b00] via-[#ff9500] to-[#ffb300] text-white"
              : "border border-white/15 bg-white/10 text-white hover:bg-white/15"
          }`}
        >
          {isAdded ? <CheckCircle2 size={15} /> : <Plus size={15} />}
          {isAdded ? "Added to Day" : "Add to Day"}
        </button>
      </div>
    </article>
  );
}
