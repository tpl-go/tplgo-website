"use client";

import { RoundTripFlight } from "@/app/components/flight/data/roundtripFlights";

type RoundTripFlightDetailsProps = {
  flight: RoundTripFlight;
};

export default function RoundTripFlightDetails({
  flight,
}: RoundTripFlightDetailsProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Flight
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-900">
            {flight.airline} • {flight.flightNumber}
          </p>
          <p className="mt-1 text-sm text-slate-600">
            {flight.fromCode} → {flight.toCode}
          </p>
        </div>

        <div className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Baggage
          </p>
          <p className="mt-2 text-sm text-slate-800">
            Cabin: {flight.cabinBag || "7 KG"}
          </p>
          <p className="mt-1 text-sm text-slate-800">
            Check-in: {flight.checkInBag || "15 KG"}
          </p>
        </div>

        <div className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Terminal
          </p>
          <p className="mt-2 text-sm text-slate-800">
            Departure Terminal: {flight.terminal || "T1"}
          </p>
          <p className="mt-1 text-sm text-slate-800">
            Stop Type: {flight.stopType}
          </p>
        </div>

        <div className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Info
          </p>
          <p className="mt-2 text-sm text-slate-800">
            {flight.onTimeRate || "On-time info available"}
          </p>
          <p className="mt-1 text-sm text-slate-800">
            Seats left: {flight.seatsLeft || 9}
          </p>
        </div>
      </div>

      {flight.fareOptions && flight.fareOptions.length > 0 ? (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
          <h4 className="text-sm font-semibold text-slate-900">
            Available Fare Options
          </h4>

          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
            {flight.fareOptions.map((fare) => (
              <div
                key={fare.id}
                className="rounded-xl border border-slate-200 bg-slate-50 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {fare.label}
                    </p>
                    {fare.subLabel ? (
                      <p className="mt-1 text-xs text-slate-600">
                        {fare.subLabel}
                      </p>
                    ) : null}
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-900">
                      ₹ {fare.price.toLocaleString("en-IN")}
                    </p>
                    <p className="text-xs text-slate-500">/adult</p>
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