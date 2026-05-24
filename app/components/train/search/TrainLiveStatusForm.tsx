"use client";

import { useState } from "react";
import { SearchCheck } from "lucide-react";

type Props = {
  onSubmit: (payload: {
    trainInput: string;
    stop: string;
    startDate: string;
  }) => void;
};

export default function TrainLiveStatusForm({ onSubmit }: Props) {
  const [trainInput, setTrainInput] = useState("");
  const [stop, setStop] = useState("");
  const [startDate, setStartDate] = useState("");

  function handleCheckStatus() {
    if (!trainInput.trim()) {
      alert("Please enter Train Number or Name");
      return;
    }

    onSubmit({
      trainInput,
      stop,
      startDate,
    });
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="flex h-[76px] md:h-[86px] flex-col justify-center rounded-2xl border border-black bg-white/60 px-4 py-3">
          <div className="mb-1 text-[10px] md:text-[11px] font-bold uppercase tracking-wide text-slate-600">
            Train Number / Name
          </div>

          <input
            value={trainInput}
            onChange={(e) => setTrainInput(e.target.value)}
            placeholder="Select Train No"
            className="w-full bg-transparent text-base md:text-lg font-extrabold text-slate-950 outline-none placeholder:text-slate-500"
          />

          <div className="text-[10px] md:text-[11px] text-slate-600">
            Enter train details
          </div>
        </div>

        <div className="flex h-[76px] md:h-[86px] flex-col justify-center rounded-2xl border border-black bg-white/60 px-4 py-3">
          <div className="mb-1 text-[10px] md:text-[11px] font-bold uppercase tracking-wide text-slate-600">
            Your Stop
          </div>

          <input
            value={stop}
            onChange={(e) => setStop(e.target.value)}
            placeholder="Select Station"
            className="w-full bg-transparent text-base md:text-lg font-extrabold text-slate-950 outline-none placeholder:text-slate-500"
          />

          <div className="text-[10px] md:text-[11px] text-slate-600">
            Optional stop
          </div>
        </div>

        <div className="flex h-[76px] md:h-[86px] flex-col justify-center rounded-2xl border border-black bg-white/60 px-4 py-3">
          <div className="mb-1 text-[10px] md:text-[11px] font-bold uppercase tracking-wide text-slate-600">
            Train Start Date
          </div>

          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full bg-transparent text-base md:text-lg font-extrabold text-slate-950 outline-none"
          />

          <div className="text-[10px] md:text-[11px] text-slate-600">
            Select date optional
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