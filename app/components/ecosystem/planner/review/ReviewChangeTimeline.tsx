"use client";

import { Clock3 } from "lucide-react";

import ReviewChangeItemCard from "./ReviewChangeItemCard";
import type { ReviewChangeItem } from "./ReviewChangeItemCard";

type ReviewChangeTimelineProps = {
  changes: ReviewChangeItem[];
};

export default function ReviewChangeTimeline({
  changes,
}: ReviewChangeTimelineProps) {
  return (
    <article className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_18px_54px_rgba(15,23,42,0.07)]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
            Timeline View
          </p>
          <h3 className="mt-2 text-2xl font-black text-slate-950">
            Newest-first Workspace Changes
          </h3>
        </div>
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-blue-700">
          <Clock3 size={22} />
        </span>
      </div>

      <div className="mt-6 grid gap-0">
        {changes.length ? (
          changes.map((change, index) => (
            <div key={change.id} className="grid grid-cols-[34px_minmax(0,1fr)] gap-4">
              <div className="flex flex-col items-center">
                <span className="mt-2 h-4 w-4 rounded-full border-4 border-white bg-gradient-to-r from-[#2563eb] to-[#7c3aed] shadow-[0_0_0_1px_rgba(79,70,229,0.22)]" />
                {index < changes.length - 1 ? (
                  <span className="h-full min-h-16 w-px bg-gradient-to-b from-[#4f46e5]/60 to-slate-200" />
                ) : null}
              </div>
              <div className="min-w-0 pb-5">
                <ReviewChangeItemCard change={change} />
              </div>
            </div>
          ))
        ) : (
          <p className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm font-black text-slate-500">
            No change history available yet.
          </p>
        )}
      </div>
    </article>
  );
}
