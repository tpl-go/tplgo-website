"use client";

import { useEffect, useReducer } from "react";
import { ArrowRightLeft } from "lucide-react";

import { busReducer } from "./busReducer";
import BusCityPointSelector from "./BusCityPointSelector";
import BusSearchButton from "./BusSearchButton";
import BusDatePicker from "./BusDatePicker";

const today = new Date();
today.setHours(0, 0, 0, 0);

export default function BusSearchBox() {
  const [state, dispatch] = useReducer(busReducer, {
    fromCity: "",
    fromPoint: "",
    toCity: "",
    toPoint: "",
    travelDate: null,
  });

  const todayISO = new Date(
    today.getTime() - today.getTimezoneOffset() * 60000
  )
    .toISOString()
    .split("T")[0];

  useEffect(() => {
    if (!state.travelDate) {
      dispatch({
        type: "SET_TRAVEL_DATE",
        payload: todayISO,
      });
    }
  }, [state.travelDate, todayISO]);

  return (
    <div className="mt-7 w-full rounded-[26px] border border-white/45 bg-white/20 px-5 pt-4 pb-5 shadow-xl backdrop-blur-md">
      {/* TOP */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-extrabold leading-tight text-slate-900">
            Book Bus Tickets
          </h3>

          <p className="text-sm font-semibold text-slate-700">
            Search routes, boarding points and drop points
          </p>
        </div>

        <div className="rounded-full border border-orange-300 bg-orange-50 px-4 py-2 text-xs font-bold text-orange-700">
          Smart Bus Search
        </div>
      </div>

      {/* SEARCH ROW */}
      <div className="grid grid-cols-[1fr_52px_1fr_220px_170px] items-center gap-3 overflow-visible">
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
            className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-300 bg-white/80 text-slate-700 shadow-sm transition hover:scale-105 hover:bg-orange-50"
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

        {/* SEARCH BUTTON */}
        <div className="flex items-center justify-center">
          <BusSearchButton state={state} />
        </div>
      </div>
    </div>
  );
}