"use client";

import { UserRound } from "lucide-react";
import type { TiyaGroupMember } from "@/app/lib/ecosystem/planner/plannerGroupEngine";

type TiyaGroupMemberCardProps = {
  member: TiyaGroupMember;
};

function PreferenceMeter({
  label,
  score,
}: {
  label: string;
  score: number;
}) {
  return (
    <div>
      <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.12em] text-white/50">
        <span>{label}</span>
        <span className="text-white/80">{score}</span>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-orange-400"
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

export default function TiyaGroupMemberCard({
  member,
}: TiyaGroupMemberCardProps) {
  return (
    <article className="rounded-3xl border border-white/10 bg-white/[0.08] p-4 transition hover:bg-white/10">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-cyan-100">
          <UserRound size={19} />
        </div>
        <div className="min-w-0">
          <h3 className="truncate text-lg font-black text-white">
            {member.name}
          </h3>
          <p className="mt-1 text-xs font-bold text-white/60">
            {member.travellerType} · {member.travelMood}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className="rounded-full bg-cyan-300/15 px-2.5 py-1 text-[11px] font-black text-cyan-100">
          {member.comfortPreference}
        </span>
        <span className="rounded-full bg-orange-400/15 px-2.5 py-1 text-[11px] font-black text-orange-100">
          {member.budgetPreference}
        </span>
      </div>

      <div className="mt-4 grid gap-2">
        <PreferenceMeter label="Activity" score={member.activityIntensity} />
        <PreferenceMeter label="Food" score={member.foodPreference} />
        <PreferenceMeter label="Spiritual" score={member.spiritualPreference} />
        <PreferenceMeter label="Adventure" score={member.adventurePreference} />
      </div>
    </article>
  );
}
