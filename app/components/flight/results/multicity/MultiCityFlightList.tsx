"use client";

import {
  MultiCityFareOption,
  MultiCityFlight,
} from "../../data/multicityFlights";
import MultiCityFlightCard from "./MultiCityFlightCard";

type Props = {
  flights: MultiCityFlight[];
  selectedFlightId?: string;
  selectedFareId?: string;
  onSelectFlight: (flight: MultiCityFlight, fare: MultiCityFareOption) => void;
};

export default function MultiCityFlightList({
  flights,
  selectedFlightId,
  selectedFareId,
  onSelectFlight,
}: Props) {
  if (!flights.length) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center text-gray-500">
        No flights available for this leg.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {flights.map((flight) => (
        <MultiCityFlightCard
          key={flight.id}
          flight={flight}
          selectedFareId={selectedFlightId === flight.id ? selectedFareId : undefined}
          isSelected={selectedFlightId === flight.id}
          onSelect={onSelectFlight}
        />
      ))}
    </div>
  );
}