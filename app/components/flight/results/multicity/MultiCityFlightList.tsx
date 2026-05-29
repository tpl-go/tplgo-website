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
  offerBaseFareOffset?: number;
  activeOffer?: {
    code: string;
    title: string;
    discountType: "flat" | "percent";
    discountValue: number;
    maxDiscount: number;
    minBookingValue: number;
  } | null;
};

export default function MultiCityFlightList({
  flights,
  selectedFlightId,
  selectedFareId,
  onSelectFlight,
  offerBaseFareOffset = 0,
  activeOffer,
}: Props) {
  if (!flights.length) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-6 text-center text-[13px] text-gray-500 md:p-10 md:text-base">
        No flights available for this leg.
      </div>
    );
  }

  return (
    <div className="space-y-2.5 md:space-y-4">
      {flights.map((flight) => (
        <MultiCityFlightCard
          key={flight.id}
          flight={flight}
          selectedFareId={selectedFlightId === flight.id ? selectedFareId : undefined}
          isSelected={selectedFlightId === flight.id}
          onSelect={onSelectFlight}
          offerBaseFareOffset={offerBaseFareOffset}
          activeOffer={activeOffer}
        />
      ))}
    </div>
  );
}
