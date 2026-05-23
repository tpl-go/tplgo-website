"use client";

import { CheckCircle2 } from "lucide-react";

export default function TrainConfirmationTopBar() {
  return (
    <div className="sticky top-0 z-[120] border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-[1400px] px-4 py-3 flex items-center gap-3">
        <CheckCircle2 className="text-green-600" />
        <div>
          <div className="text-[18px] font-extrabold text-slate-900">
            Booking Confirmed
          </div>
          <div className="text-[13px] font-medium text-slate-700">
            Your train ticket is successfully booked
          </div>
        </div>
      </div>
    </div>
  );
}