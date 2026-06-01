"use client";

import { CheckCircle2 } from "lucide-react";

type Props = {
  route?: string;
  onGoHome?: () => void;
};

export default function TrainConfirmationTopBar({ route, onGoHome }: Props) {
  return (
    <div className="sticky top-0 z-[120] border-b border-slate-200 bg-white md:hidden">
      <div className="mx-auto flex max-w-[1400px] items-center gap-3 px-3 py-3">
        <button
          type="button"
          onClick={onGoHome}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-xl font-black text-slate-700 shadow-sm"
          aria-label="Go home"
        >
          ‹
        </button>
        <CheckCircle2 className="text-green-600" />
        <div className="min-w-0">
          <div className="truncate text-[16px] font-extrabold text-slate-900">
            Booking Confirmed
          </div>
          <div className="truncate text-[12px] font-medium text-slate-700">
            {route || "Your train ticket is successfully booked"}
          </div>
        </div>
      </div>
    </div>
  );
}
