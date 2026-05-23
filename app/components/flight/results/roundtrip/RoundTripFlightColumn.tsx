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
    flight: RoundTripFlight,
    fare: FlightFareOption
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
    <section className="h-full border border-[#d7dee7] bg-white p-3">
      <div className="mb-3">
        <h2 className="text-[15px] font-semibold text-[#111827]">
          {title}
        </h2>

        

        {subtitle ? (
          <p className="mt-1 text-[12px] text-[#6b7280]">
            {subtitle}
          </p>
        ) : null}
      </div>

      <div className="mb-3 border border-[#d7dee7] bg-[#edf3f8] px-4 py-3">
        <div className="grid grid-cols-[90px_110px_110px_minmax(260px,1fr)] items-center gap-4 text-[12px] font-medium text-[#374151]">
          <div className="text-left">Departure</div>
          <div className="text-left">Duration</div>
          <div className="text-left">Arrival</div>
          <div className="text-left">Price ↑</div>
        </div>
      </div>

      <div className="space-y-3">
        {flights.map((flight) => (
          <RoundTripFlightCard
            key={flight.id}
            flight={flight}
            isSelected={selectedFlight?.id === flight.id}
            selectedFareId={
              selectedFlight?.id === flight.id
                ? selectedFareId
                : null
            }
            onSelect={onSelect}
            onFareSelect={onFareSelect}
          />
        ))}
      </div>
    </section>
  );
}