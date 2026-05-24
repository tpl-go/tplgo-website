"use client";

import { useMemo, useState } from "react";

import FlightTrackingHero from "@/app/components/flight-tracking/FlightTrackingHero";
import FlightTrackingSearchCard from "@/app/components/flight-tracking/FlightTrackingSearchCard";
import FlightStatusResults from "@/app/components/flight-tracking/FlightStatusResults";

import { flightTrackingDummyResults } from "@/app/lib/flight-tracking/flightTrackingDummyData";

import {
  filterFlightsByFlightNumber,
} from "@/app/lib/flight-tracking/flightTrackingHelpers";

export default function FlightTrackingPage() {
  const [searchValue, setSearchValue] = useState("");
  const [searchType, setSearchType] =
    useState<"pnr" | "flight">("flight");

  const [hasSearched, setHasSearched] = useState(false);

  const results = useMemo(() => {
    if (!hasSearched) {
      return flightTrackingDummyResults;
    }

    if (searchType === "flight") {
      return filterFlightsByFlightNumber(
        flightTrackingDummyResults,
        searchValue
      );
    }

    return flightTrackingDummyResults;
  }, [hasSearched, searchType, searchValue]);

  const handleSearch = (
    value: string,
    type: "pnr" | "flight"
  ) => {
    setSearchValue(value);
    setSearchType(type);
    setHasSearched(true);
  };

  return (
    <main className="min-h-screen bg-[#f4f7fb] overflow-x-hidden">
      {/* Desktop untouched */}
      <div className="hidden md:block">
        <FlightTrackingHero />

        <FlightTrackingSearchCard
          onSearch={handleSearch}
        />

        <FlightStatusResults results={results} />
      </div>

      {/* Mobile responsive layer */}
      <div className="md:hidden">
        <div className="px-3 pt-3 pb-4">
          <div className="overflow-hidden rounded-[28px] shadow-sm">
            <FlightTrackingHero />
          </div>
        </div>

        <div className="px-3 -mt-3 relative z-10">
          <div className="rounded-[28px] bg-white shadow-lg">
            <FlightTrackingSearchCard
              onSearch={handleSearch}
            />
          </div>
        </div>

        <div className="px-3 pb-6 pt-4">
          <FlightStatusResults results={results} />
        </div>
      </div>
    </main>
  );
}