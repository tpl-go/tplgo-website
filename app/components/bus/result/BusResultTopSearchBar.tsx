"use client";

import { useReducer } from "react";
import { useRouter } from "next/navigation";
import { ArrowRightLeft } from "lucide-react";

import { busReducer } from "../search/busReducer";
import BusCityPointSelector from "../search/BusCityPointSelector";
import BusDatePicker from "../search/BusDatePicker";

type Props = {
  initialSearch: {
    fromCity?: string;
    fromPoint?: string;
    toCity?: string;
    toPoint?: string;
    date?: string;
  };
};

const today = new Date();
today.setHours(0, 0, 0, 0);

export default function BusResultTopSearchBar({ initialSearch }: Props) {
  const router = useRouter();

  const todayISO = new Date(
    today.getTime() - today.getTimezoneOffset() * 60000
  )
    .toISOString()
    .split("T")[0];

  const [state, dispatch] = useReducer(busReducer, {
    fromCity: initialSearch.fromCity || "",
    fromPoint: initialSearch.fromPoint || "",
    toCity: initialSearch.toCity || "",
    toPoint: initialSearch.toPoint || "",
    travelDate: initialSearch.date || todayISO,
  });

  function handleSearch() {
    if (!state.fromCity || !state.toCity || !state.travelDate) {
      alert("Please fill From, To and Travel Date");
      return;
    }

    if (
      state.fromCity.trim().toLowerCase() ===
      state.toCity.trim().toLowerCase()
    ) {
      alert("From and To cities cannot be the same");
      return;
    }

    const query = new URLSearchParams({
      fromCity: state.fromCity,
      fromPoint: state.fromPoint || "All Boarding Points",
      toCity: state.toCity,
      toPoint: state.toPoint || "All Drop Points",
      date: state.travelDate,
    });

    router.push(`/bus/result?${query.toString()}`);
  }

  return (
    <div className="w-full rounded-2xl border border-white/10 bg-gradient-to-r from-[#0f172a] via-[#111827] to-[#0b1220] p-3 shadow-[0_18px_45px_rgba(2,6,23,0.35)]">
      <div className="grid grid-cols-[1.15fr_56px_1.15fr_0.95fr_155px] items-center gap-3">
        {/* FROM */}
        <BusCityPointSelector
          mode="FROM"
          state={state}
          dispatch={dispatch}
        />

        {/* SWAP */}
        <div className="flex items-center justify-center">
          <button
            type="button"
            onClick={() => dispatch({ type: "SWAP_LOCATIONS" })}
            className="flex h-[52px] w-[52px] items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] text-cyan-300 shadow-sm transition-all duration-300 hover:border-cyan-300/50 hover:bg-white/[0.1]"
            aria-label="Swap locations"
          >
            <ArrowRightLeft size={18} />
          </button>
        </div>

        {/* TO */}
        <BusCityPointSelector
          mode="TO"
          state={state}
          dispatch={dispatch}
        />

        {/* DATE */}
        <BusDatePicker state={state} dispatch={dispatch} />

        {/* SEARCH */}
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