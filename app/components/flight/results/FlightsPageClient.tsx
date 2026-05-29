"use client";

import { useEffect, useMemo, useReducer, useState } from "react";
import FlightsModifySearchBar from "./common/FlightsModifySearchBar";
import OneWayResultsLayout from "./oneway/OneWayResultsLayout";
import RoundTripResults from "./roundtrip/RoundTripResults";
import MultiCityResults from "./multicity/MultiCityResults";

import SmartResultsOfferStrip from "@/app/components/smartOffers/SmartResultsOfferStrip";

import {
  buildInitialFlightStateFromParams,
  flightSearchReducer,
  initialFlightState,
  FlightState,
} from "../hooks";

import {
  DEFAULT_DOMESTIC_FILTERS,
  FlightsFiltersState,
} from "./FlightsFiltersSidebar";

type FlightsPageClientProps = {
  initialParams: Record<string, string | undefined>;
};

export default function FlightsPageClient({
  initialParams,
}: FlightsPageClientProps) {
  const appliedState: FlightState = useMemo(() => {
    const urlParams = new URLSearchParams();

    Object.entries(initialParams).forEach(([key, value]) => {
      if (value) {
        urlParams.set(key, value);
      }
    });

    const hasStandardQuery =
      urlParams.get("from") ||
      urlParams.get("to") ||
      urlParams.get("departure");

    const hasMultiCityQuery =
      urlParams.get("from_0") ||
      urlParams.get("to_0") ||
      urlParams.get("departure_0");

    if (!hasStandardQuery && !hasMultiCityQuery) {
      return initialFlightState;
    }

    return buildInitialFlightStateFromParams(urlParams);
  }, [initialParams]);

  const [draftState, draftDispatch] = useReducer(
    flightSearchReducer,
    appliedState
  );

  const [filters, setFilters] = useState<FlightsFiltersState>(
    DEFAULT_DOMESTIC_FILTERS
  );

  const [isMultiCityExpanded, setIsMultiCityExpanded] = useState(false);

  useEffect(() => {
    draftDispatch({
      type: "RESET_STATE",
      payload: appliedState,
    });
  }, [appliedState]);

  useEffect(() => {
    setFilters(DEFAULT_DOMESTIC_FILTERS);
  }, [
    initialParams.from,
    initialParams.to,
    initialParams.departure,
    initialParams.tripType,
    initialParams.from_0,
    initialParams.to_0,
    initialParams.departure_0,
  ]);

  const firstSegment = draftState.segments[0];

  const fromCity = firstSegment?.from?.city || "New Delhi";
  const toCity = firstSegment?.to?.city || "Bengaluru";

  const tripType = draftState.tripType || initialParams.tripType || "oneway";

  const fromCountry =
    firstSegment?.from?.country ||
    (firstSegment?.from as any)?.countryName ||
    "India";

  const toCountry =
    firstSegment?.to?.country ||
    (firstSegment?.to as any)?.countryName ||
    "India";

  const isInternational =
    fromCountry.trim().toLowerCase() !== "india" ||
    toCountry.trim().toLowerCase() !== "india";

  const estimatedBookingValue = isInternational ? 42000 : 12000;

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-[#eef3f8]">
      <div
        className={`w-full border-b border-[#e5e7eb] bg-white ${
          draftState.tripType === "multicity" && isMultiCityExpanded
            ? "relative z-[120]"
            : "relative z-40"
        }`}
      >
        <div className="mx-auto w-full max-w-7xl px-3 py-3 sm:px-4">
          <div className="w-full overflow-visible">
            <FlightsModifySearchBar
              state={draftState}
              dispatch={draftDispatch}
              onExpandedChange={setIsMultiCityExpanded}
            />
          </div>
        </div>
      </div>

      <div className="border-b border-[#dbeafe] bg-white">
        <div className="mx-auto w-full max-w-7xl px-3 py-3 sm:px-4">
          <div className="w-full overflow-x-auto overflow-y-hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <SmartResultsOfferStrip
              service="flight"
              destination={toCity}
              bookingValue={estimatedBookingValue}
              isInternational={isInternational}
            />
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-8xl px-3 py-4 sm:px-4 sm:py-6">
        <div className="w-full min-w-0">
          {tripType === "oneway" ? (
            <OneWayResultsLayout
              fromCity={fromCity}
              toCity={toCity}
              state={draftState}
              filters={filters}
              onFiltersChange={setFilters}
              isInternational={isInternational}
            />
          ) : tripType === "roundtrip" ? (
            <RoundTripResults
              fromCity={fromCity}
              toCity={toCity}
              departureDate={initialParams.departure}
              returnDate={initialParams.returnDate}
              isInternational={isInternational}
            />
          ) : (
            <MultiCityResults state={draftState} />
          )}
        </div>
      </div>
    </main>
  );
}
