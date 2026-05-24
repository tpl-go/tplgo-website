"use client";

import { useState } from "react";
import { ArrowRightLeft } from "lucide-react";

import TrainClassSelector from "./TrainClassSelector";
import TrainDatePicker from "./TrainDatePicker";
import TrainStationSelector from "./TrainStationSelector";
import TrainSearchButton from "./TrainSearchButton";
import type { TrainClassType, TrainStation } from "./trainTypes";

export default function TrainBookTicketForm() {
  const [from, setFrom] = useState<TrainStation | null>(null);
  const [to, setTo] = useState<TrainStation | null>(null);

  const [travelDate, setTravelDate] = useState(() => {
    const d = new Date();
    return d.toISOString().split("T")[0];
  });

  const [trainClass, setTrainClass] = useState<TrainClassType>("ALL");

  function handleSwapStations() {
    setFrom(to);
    setTo(from);
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-[1.1fr_52px_1.1fr_240px_180px] items-center gap-3 overflow-visible">
        <TrainStationSelector
          label="From"
          value={from}
          onChange={setFrom}
          placeholder="From city"
          excludeCode={to?.code}
        />

        <div className="flex items-center justify-center">
          <button
            type="button"
            onClick={handleSwapStations}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-300 bg-white/80 text-slate-700 shadow-sm transition hover:scale-105 hover:bg-orange-50"
            aria-label="Swap stations"
          >
            <ArrowRightLeft size={18} />
          </button>
        </div>

        <TrainStationSelector
          label="To"
          value={to}
          onChange={setTo}
          placeholder="To city"
          excludeCode={from?.code}
        />

        <TrainDatePicker value={travelDate} onChange={setTravelDate} />

        <TrainClassSelector value={trainClass} onChange={setTrainClass} />
      </div>

      <div className="mt-5 flex justify-center">
        <div className="w-full md:w-auto">
          <TrainSearchButton
            from={from}
            to={to}
            travelDate={travelDate}
            trainClass={trainClass}
          />
        </div>
      </div>
    </div>
  );
}