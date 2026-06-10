"use client";

import { AlertTriangle, CheckCircle2, Info, ShieldAlert } from "lucide-react";
import type { TiyaPreparationNote } from "@/app/lib/ecosystem/planner/plannerPreparationEngine";

type TiyaTravelPreparationProps = {
  notes: TiyaPreparationNote[];
  riskItems: Array<{
    label: string;
    value: string;
  }>;
};

const toneStyle: Record<TiyaPreparationNote["tone"], string> = {
  info: "border-cyan-300/20 bg-cyan-400/10 text-cyan-50",
  warning: "border-orange-300/20 bg-orange-400/10 text-orange-50",
  critical: "border-rose-300/20 bg-rose-400/10 text-rose-50",
  success: "border-emerald-300/20 bg-emerald-400/10 text-emerald-50",
};

const toneIcon: Record<TiyaPreparationNote["tone"], typeof Info> = {
  info: Info,
  warning: AlertTriangle,
  critical: ShieldAlert,
  success: CheckCircle2,
};

export default function TiyaTravelPreparation({
  notes,
  riskItems,
}: TiyaTravelPreparationProps) {
  const safeNotes = Array.isArray(notes) ? notes : [];
  const safeRiskItems = Array.isArray(riskItems) ? riskItems : [];

  return (
    <div className="grid gap-3">
      <div className="rounded-3xl border border-white/10 bg-white/[0.08] p-3 sm:p-4">
        <div className="text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
          Dynamic travel preparation
        </div>
        <div className="mt-3 grid gap-2">
          {safeNotes.map((note) => {
            const Icon = toneIcon[note.tone];

            return (
              <article
                key={note.id}
                className={`rounded-2xl border p-3 ${toneStyle[note.tone]}`}
              >
                <div className="flex items-start gap-2">
                  <Icon className="mt-0.5 h-4 w-4 shrink-0" />
                  <div>
                    <h3 className="text-sm font-black">{note.title}</h3>
                    <p className="mt-1 text-xs font-semibold leading-5 opacity-80">
                      {note.detail}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/[0.08] p-3 sm:p-4">
        <div className="text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
          Smart risk preparation
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {safeRiskItems.map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-white/10 bg-white/10 p-3"
            >
              <p className="text-[10px] font-black uppercase tracking-[0.12em] text-white/50">
                {item.label}
              </p>
              <p className="mt-1 text-xs font-black text-white">{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
