"use client";

import {
  FlightFareOption,
  RoundTripFlight,
} from "@/app/components/flight/data/roundtripFlights";
import RoundTripFlightCard from "./RoundTripFlightCard";

type RoundTripFlightColumnProps = {
  title: string;
  subtitle: string;

  flights: RoundTripFlight[];
  selectedFlight: RoundTripFlight | null;
  selectedFareId?: string | null;

  onSelect: (flight: RoundTripFlight) => void;

  onFareSelect: (
    flight: RoundTripFlight | null,
    fare: FlightFareOption | null
  ) => void;
};

export default function RoundTripFlightColumn({
  title,
  subtitle,
  flights,
  selectedFlight,
  selectedFareId,
  onSelect,
  onFareSelect,
}: RoundTripFlightColumnProps) {
  return (
    <section className="h-full min-w-0 rounded-none border-0 bg-transparent p-0 shadow-none md:rounded-2xl md:border md:border-[#d7dee7] md:bg-white md:p-3 md:shadow-sm">
      <div className="mb-2 md:mb-3">
        <h2 className="truncate text-[13px] font-black leading-tight text-[#111827] md:text-[15px]">
          {title}
        </h2>

        {subtitle ? (
          <p className="mt-1 text-[11px] text-[#6b7280] md:text-[12px]">
            {subtitle}
          </p>
        ) : null}
      </div>

      <div className="mb-3 hidden border border-[#d7dee7] bg-[#edf3f8] px-4 py-3 md:block">
        <div className="grid grid-cols-[90px_110px_110px_minmax(260px,1fr)] items-center gap-4 text-[12px] font-medium text-[#374151]">
          <div className="text-left">Departure</div>
          <div className="text-left">Duration</div>
          <div className="text-left">Arrival</div>
          <div className="text-left">Price ↑</div>
        </div>
      </div>

      <div className="space-y-2.5 md:space-y-3">
        {flights.length > 0 ? (
          flights.map((flight) => (
            <RoundTripFlightCard
              key={flight.id}
              flight={flight}
              isSelected={selectedFlight?.id === flight.id}
              selectedFareId={
                selectedFlight?.id === flight.id ? selectedFareId : null
              }
              onSelect={onSelect}
              onFareSelect={onFareSelect}
            />
          ))
        ) : (
          <div className="rounded-2xl border border-[#e5e7eb] bg-[#f8fafc] px-4 py-8 text-center text-[13px] text-[#6b7280] md:text-[14px]">
            No flights found for the selected filters.
          </div>
        )}
      </div>
    </section>
  );
}
