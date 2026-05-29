"use client";

import { RoundTripFlight } from "@/app/components/flight/data/roundtripFlights";

type RoundTripFlightDetailsProps = {
  flight: RoundTripFlight;
};

export default function RoundTripFlightDetails({
  flight,
}: RoundTripFlightDetailsProps) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-3 sm:p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="text-[16px] font-black text-slate-950 sm:text-[18px]">
            {flight.fromCity} → {flight.toCity}
          </div>
          <div className="text-[12px] font-semibold text-slate-500">
            {flight.departureTime} to {flight.arrivalTime} · {flight.duration}
          </div>
        </div>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-black text-emerald-700">
          {flight.stopType}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
          <p className="text-[11px] font-black uppercase tracking-[0.1em] text-slate-400 sm:text-xs">
            Flight
          </p>
          <p className="mt-2 text-[13px] font-black text-slate-950 sm:text-sm">
            {flight.airline} · {flight.flightNumber}
          </p>
          <p className="mt-1 text-[13px] font-semibold text-slate-600 sm:text-sm">
            {flight.fromCode} → {flight.toCode}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
          <p className="text-[11px] font-black uppercase tracking-[0.1em] text-slate-400 sm:text-xs">
            Baggage
          </p>
          <p className="mt-2 text-[13px] font-semibold text-slate-800 sm:text-sm">
            Cabin: {flight.cabinBag || "7 KG"}
          </p>
          <p className="mt-1 text-[13px] font-semibold text-slate-800 sm:text-sm">
            Check-in: {flight.checkInBag || "15 KG"}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
          <p className="text-[11px] font-black uppercase tracking-[0.1em] text-slate-400 sm:text-xs">
            Terminal
          </p>
          <p className="mt-2 text-[13px] font-semibold text-slate-800 sm:text-sm">
            Departure Terminal: {flight.terminal || "T1"}
          </p>
          <p className="mt-1 text-[13px] font-semibold text-slate-800 sm:text-sm">
            Stop Type: {flight.stopType}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
          <p className="text-[11px] font-black uppercase tracking-[0.1em] text-slate-400 sm:text-xs">
            Info
          </p>
          <p className="mt-2 text-[13px] font-semibold text-slate-800 sm:text-sm">
            {flight.onTimeRate || "On-time info available"}
          </p>
          <p className="mt-1 text-[13px] font-semibold text-slate-800 sm:text-sm">
            Seats left: {flight.seatsLeft || 9}
          </p>
        </div>
      </div>

      {flight.fareOptions && flight.fareOptions.length > 0 ? (
        <div className="mt-3 rounded-3xl border border-slate-200 bg-white p-3 shadow-sm sm:mt-4 sm:p-4">
          <h4 className="text-[13px] font-black text-slate-950 sm:text-sm">
            Available Fare Options
          </h4>

          <div className="mt-3 grid grid-cols-1 gap-3 sm:mt-4 md:grid-cols-2">
            {flight.fareOptions.map((fare) => (
              <div
                key={fare.id}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-3 sm:p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[13px] font-black text-slate-950 sm:text-sm">
                      {fare.label}
                    </p>
                    {fare.subLabel ? (
                      <p className="mt-1 text-[11px] text-slate-600 sm:text-xs">
                        {fare.subLabel}
                      </p>
                    ) : null}
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="text-[13px] font-black text-slate-950 sm:text-sm">
                      ₹ {fare.price.toLocaleString("en-IN")}
                    </p>
                    <p className="text-[11px] text-slate-500 sm:text-xs">
                      /adult
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
