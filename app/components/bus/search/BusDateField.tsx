"use client";

import HotelCalender from "../../hotel/search/HotelCalender";
import { CalendarDays } from "lucide-react";

type Props = {
  state: any;
  dispatch: any;
};

export default function BusDateField({ state, dispatch }: Props) {
  return (
    <div className="w-full min-w-[220px]">
      <div className="flex h-[78px] items-center gap-3 rounded-2xl border border-slate-200 bg-white/90 px-4 shadow-sm transition-all duration-300 hover:border-orange-300 hover:shadow-md">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
          <CalendarDays size={20} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Departure
          </p>

          <HotelCalender
            dispatch={dispatch}
            type="BUS_DATE"
            date={state.travelDate}
          />
        </div>
      </div>
    </div>
  );
}