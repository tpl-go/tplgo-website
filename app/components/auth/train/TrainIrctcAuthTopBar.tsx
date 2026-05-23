"use client";

import { Clock3, ShieldCheck, TrainFront } from "lucide-react";

type Props = {
  timerLabel: string;
};

export default function TrainIrctcAuthTopBar({ timerLabel }: Props) {
  return (
    <div className="sticky top-0 z-[120] border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-4 py-3">
        <div className="flex items-center gap-4">
          <div className="hidden items-center gap-2 md:inline-flex">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
              <TrainFront size={18} />
            </div>
            <div>
              <div className="text-[15px] font-extrabold text-slate-900">
                Complete IRCTC authentication
              </div>
              <div className="text-[12px] text-slate-500">
                Final verification required to complete train booking
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-[12px] font-bold text-emerald-700 md:inline-flex">
            <ShieldCheck size={14} />
            Secure Verification Step
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-2 text-[13px] font-extrabold text-orange-700">
            <Clock3 size={15} />
            {timerLabel}
          </div>
        </div>
      </div>
    </div>
  );
}