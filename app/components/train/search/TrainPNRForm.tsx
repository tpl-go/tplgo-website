"use client";

import { useState } from "react";
import { SearchCheck } from "lucide-react";

type Props = {
  onSubmit: (pnr: string) => void;
};

export default function TrainPNRForm({ onSubmit }: Props) {
  const [pnr, setPnr] = useState("");

  function handleCheckStatus() {
    if (pnr.length !== 10) {
      alert("Please enter valid 10 digit PNR");
      return;
    }

    onSubmit(pnr);
  }

  return (
    <div>
      <div className="rounded-2xl border border-black bg-white/60 px-4 py-3">
        <div className="flex h-[76px] md:h-[86px] flex-col justify-center">
          <div className="mb-1 text-[10px] md:text-[11px] font-bold uppercase tracking-wide text-slate-600">
            PNR Number
          </div>

          <input
            value={pnr}
            onChange={(e) =>
              setPnr(e.target.value.replace(/\D/g, "").slice(0, 10))
            }
            placeholder="Enter 10 digit PNR"
            className="w-full bg-transparent text-base md:text-lg font-extrabold text-slate-950 outline-none placeholder:text-slate-500"
          />

          <div className="text-[10px] md:text-[11px] text-slate-600">
            Check your booking status instantly
          </div>
        </div>
      </div>

      <div className="mt-5 flex justify-center">
        <button
          type="button"
          onClick={handleCheckStatus}
          className="flex h-11 md:h-[52px] w-full md:w-auto min-w-0 md:min-w-[220px] items-center justify-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-lime-500 px-8 text-sm md:text-[17px] font-extrabold tracking-wide text-white shadow-[0_14px_32px_rgba(234,88,12,0.28)] transition hover:scale-[1.02] hover:from-orange-600 hover:to-orange-700 active:scale-[0.98]"
        >
          <SearchCheck size={18} />
          CHECK STATUS
        </button>
      </div>
    </div>
  );
}