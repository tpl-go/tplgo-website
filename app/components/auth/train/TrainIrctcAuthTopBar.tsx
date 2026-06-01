"use client";

import { useRouter } from "next/navigation";
import { Clock3, ShieldCheck, TrainFront } from "lucide-react";

type Props = {
  timerLabel: string;
  trainName?: string;
  route?: string;
};

export default function TrainIrctcAuthTopBar({
  timerLabel,
  trainName,
  route,
}: Props) {
  const router = useRouter();

  return (
    <div className="sticky top-0 z-[120] border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-3 py-3 md:px-4">
        <div className="flex min-w-0 items-center gap-3 md:gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-xl font-bold text-slate-700 shadow-sm md:hidden"
            aria-label="Go back"
          >
            ‹
          </button>

          <div className="min-w-0 md:hidden">
            <div className="truncate text-[15px] font-extrabold text-slate-900">
              IRCTC Authentication
            </div>
            <div className="mt-0.5 truncate text-[12px] font-semibold text-slate-500">
              {trainName || route ? `${trainName || "Train"} • ${route || ""}` : "Final verification"}
            </div>
          </div>

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
