"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRightLeft, CalendarDays, Layers3 } from "lucide-react";

import TrainStationSelector from "@/app/components/train/search/TrainStationSelector";
import { TRAIN_STATIONS } from "@/app/components/train/search/trainData";
import type { TrainStation } from "@/app/components/train/search/trainTypes";

type Props = {
  initialSearch: {
    fromCity?: string;
    fromCode?: string;
    toCity?: string;
    toCode?: string;
    date?: string;
    class?: string;
  };
};

export default function TrainResultTopSearchBar({ initialSearch }: Props) {
  const router = useRouter();

  const initialFromStation = useMemo<TrainStation | null>(() => {
    return (
      TRAIN_STATIONS.find(
        (item) =>
          item.city === (initialSearch.fromCity || "") &&
          item.code === (initialSearch.fromCode || "")
      ) || null
    );
  }, [initialSearch.fromCity, initialSearch.fromCode]);

  const initialToStation = useMemo<TrainStation | null>(() => {
    return (
      TRAIN_STATIONS.find(
        (item) =>
          item.city === (initialSearch.toCity || "") &&
          item.code === (initialSearch.toCode || "")
      ) || null
    );
  }, [initialSearch.toCity, initialSearch.toCode]);

  const [fromStation, setFromStation] = useState<TrainStation | null>(
    initialFromStation
  );
  const [toStation, setToStation] = useState<TrainStation | null>(
    initialToStation
  );
  const [date, setDate] = useState(initialSearch.date || "");
  const [travelClass, setTravelClass] = useState(initialSearch.class || "ALL");

  function handleSwap() {
    const prevFrom = fromStation;
    setFromStation(toStation);
    setToStation(prevFrom);
  }

  function handleSearch() {
    if (!fromStation || !toStation || !date) {
      alert("Please fill From, To and Travel Date");
      return;
    }

    if (fromStation.code.trim().toLowerCase() === toStation.code.trim().toLowerCase()) {
      alert("From and To stations cannot be the same");
      return;
    }

    const query = new URLSearchParams({
      fromCity: fromStation.city,
      fromCode: fromStation.code,
      toCity: toStation.city,
      toCode: toStation.code,
      date,
      class: travelClass,
    });

    router.push(`/train/result?${query.toString()}`);
  }

  return (
    <div className="w-full rounded-2xl border border-white/10 bg-gradient-to-r from-[#0f172a] via-[#111827] to-[#0b1220] p-3 shadow-[0_18px_45px_rgba(2,6,23,0.35)]">
      <div className="grid grid-cols-[1.05fr_56px_1.05fr_0.95fr_0.78fr_155px] items-center gap-3">
        <TrainStationSelector
          label="From"
          value={fromStation}
          onChange={setFromStation}
          placeholder="From city"
          excludeCode={toStation?.code}
          compact
        />

        <div className="flex items-center justify-center">
          <button
            type="button"
            onClick={handleSwap}
            className="flex h-[52px] w-[52px] items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] text-cyan-300 shadow-sm transition hover:border-cyan-300/50 hover:bg-white/[0.1]"
            aria-label="Swap locations"
          >
            <ArrowRightLeft size={18} />
          </button>
        </div>

        <TrainStationSelector
          label="To"
          value={toStation}
          onChange={setToStation}
          placeholder="To city"
          excludeCode={fromStation?.code}
          compact
        />

        <label className="flex h-[75px] cursor-pointer items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] px-4 shadow-sm transition hover:bg-white/[0.1]">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-cyan-300">
            <CalendarDays size={18} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-black uppercase tracking-[0.14em] text-cyan-300">
              Travel Date
            </div>

            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 w-full bg-transparent text-[15px] font-extrabold text-white outline-none [color-scheme:dark]"
            />
          </div>
        </label>

        <label className="flex h-[75px] cursor-pointer items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] px-4 shadow-sm transition hover:bg-white/[0.1]">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-cyan-300">
            <Layers3 size={18} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-black uppercase tracking-[0.14em] text-cyan-300">
              Class
            </div>

            <select
              value={travelClass}
              onChange={(e) => setTravelClass(e.target.value)}
              className="mt-1 w-full bg-transparent text-[15px] font-extrabold text-white outline-none"
            >
              <option value="ALL" className="bg-[#111827] text-white">
                All Classes
              </option>
              <option value="1A" className="bg-[#111827] text-white">
                1A
              </option>
              <option value="2A" className="bg-[#111827] text-white">
                2A
              </option>
              <option value="3A" className="bg-[#111827] text-white">
                3A
              </option>
              <option value="3E" className="bg-[#111827] text-white">
                3E
              </option>
              <option value="SL" className="bg-[#111827] text-white">
                SL
              </option>
              <option value="CC" className="bg-[#111827] text-white">
                CC
              </option>
              <option value="2S" className="bg-[#111827] text-white">
                2S
              </option>
              <option value="EC" className="bg-[#111827] text-white">
                EC
              </option>
            </select>
          </div>
        </label>

        <button
          type="button"
          onClick={handleSearch}
          className="h-[75px] w-full rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-4 text-[14px] font-black text-white shadow-[0_10px_24px_rgba(14,165,233,0.35)] transition hover:scale-[1.02] hover:from-cyan-300 hover:to-blue-500 active:scale-[0.98]"
        >
          SEARCH
        </button>
      </div>
    </div>
  );
}