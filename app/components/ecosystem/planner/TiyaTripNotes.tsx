"use client";

import { BookOpenCheck, Lightbulb, MapPinned, PencilLine } from "lucide-react";
import type { TiyaTripNotes } from "@/app/lib/ecosystem/planner/plannerTypes";

type TiyaTripNotesProps = {
  notes: TiyaTripNotes;
  onChange: (notes: TiyaTripNotes) => void;
};

const noteFields = [
  {
    key: "personal",
    label: "Personal notes",
    icon: PencilLine,
    placeholder: "Add traveller preferences, reminders or trip context.",
  },
  {
    key: "packing",
    label: "Packing reminders",
    icon: BookOpenCheck,
    placeholder: "Jackets, charger, ID proof, walking shoes...",
  },
  {
    key: "localTips",
    label: "Local tips",
    icon: MapPinned,
    placeholder: "Local timings, market lanes, route cautions...",
  },
  {
    key: "creatorNotes",
    label: "Creator notes",
    icon: Lightbulb,
    placeholder: "Reel ideas, photo stops, creator recommendations...",
  },
] as const;

export default function TiyaTripNotes({ notes, onChange }: TiyaTripNotesProps) {
  return (
    <section className="rounded-3xl border border-white/80 bg-white/75 p-3 shadow-[0_18px_70px_rgba(15,23,42,0.07)] backdrop-blur-xl sm:p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-blue-700">
            <PencilLine size={15} />
            Trip notes
          </div>
          <h2 className="mt-2 text-xl font-black text-slate-950 sm:text-2xl">
            Notes and reminders
          </h2>
        </div>
        <span className="rounded-full border border-orange-100 bg-orange-50 px-3 py-1.5 text-xs font-black text-orange-700">
          Draft auto-saved
        </span>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {noteFields.map((field) => {
          const Icon = field.icon;

          return (
            <label
              key={field.key}
              className="rounded-2xl border border-blue-100 bg-white p-3 shadow-sm"
            >
              <span className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-blue-700">
                <Icon size={14} />
                {field.label}
              </span>
              <textarea
                value={notes[field.key]}
                onChange={(event) =>
                  onChange({ ...notes, [field.key]: event.target.value })
                }
                rows={3}
                placeholder={field.placeholder}
                className="mt-2 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-semibold leading-6 text-slate-700 outline-none transition focus:border-blue-300 focus:bg-white"
              />
            </label>
          );
        })}
      </div>
    </section>
  );
}
