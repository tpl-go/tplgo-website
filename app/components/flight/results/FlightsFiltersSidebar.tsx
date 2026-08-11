"use client";

import OneWayDomesticFilters from "./oneway/filters/OneWayDomesticFilters";
import OneWayInternationalFilters from "./oneway/filters/OneWayInternationalFilters";
import MultiCityDomesticFilters from "./multicity/filters/MultiCityDomesticFilters";
import MultiCityInternationalFilters from "./multicity/filters/MultiCityInternationalFilters";
import MultiCityCombinedFilters from "./multicity/filters/MultiCityCombinedFilters";
import { MultiCityCombinedFiltersState } from "./multicity/filters/filterTypes";
import { MultiCityLeg } from "../data/multicityFlights";
import type { FlightCurrency } from "@/app/lib/flights/flightCurrency";

export type FlightsFiltersState = {
  popular: string[];
  departureAirports: string[];
  priceRange: [number, number];
  stops: string[];
  departureTime: string[];
  arrivalTime: string[];
  airlines: string[];
  aircraftSize: string[];
  checkInBaggage: boolean;
  durationRange: [number, number];
  alliances: string[];
  layoverAirports: string[];
  layoverDurationRange: [number, number];
};

type AirportOption = {
  id: string;
  label: string;
  price?: string;
};

type SimpleOption = {
  id: string;
  label: string;
  price?: string;
};

type Props = {
  tripType?: "oneway" | "roundtrip" | "multicity";
  viewMode?: "individual" | "combined";
  isInternational?: boolean;
  filters?: FlightsFiltersState;
  onFiltersChange: (filters: FlightsFiltersState) => void;
  combinedFilters?: MultiCityCombinedFiltersState;
  onCombinedFiltersChange?: (filters: MultiCityCombinedFiltersState) => void;
  legs?: MultiCityLeg[];
  fromCity?: string;
  toCity?: string;
  minPrice?: number;
  maxPrice?: number;
  priceCurrency?: FlightCurrency;
  departureAirportOptions?: AirportOption[];
  minDuration?: number;
  maxDuration?: number;
  minLayoverDuration?: number;
  maxLayoverDuration?: number;
  allianceOptions?: SimpleOption[];
  layoverAirportOptions?: SimpleOption[];
  airlineOptions?: SimpleOption[];
  aircraftOptions?: SimpleOption[];
};

export const DEFAULT_DOMESTIC_FILTERS: FlightsFiltersState = {
  popular: [],
  departureAirports: [],
  priceRange: [0, 0],
  stops: [],
  departureTime: [],
  arrivalTime: [],
  airlines: [],
  aircraftSize: [],
  checkInBaggage: false,
  durationRange: [0, 0],
  alliances: [],
  layoverAirports: [],
  layoverDurationRange: [0, 0],
};

export const DEFAULT_INTERNATIONAL_FILTERS: FlightsFiltersState = {
  popular: [],
  departureAirports: [],
  priceRange: [0, 0],
  stops: [],
  departureTime: [],
  arrivalTime: [],
  airlines: [],
  aircraftSize: [],
  checkInBaggage: false,
  durationRange: [0, 0],
  alliances: [],
  layoverAirports: [],
  layoverDurationRange: [0, 0],
};

export default function FlightsFiltersSidebar({
  tripType = "oneway",
  viewMode = "individual",
  isInternational = false,
  filters,
  onFiltersChange,
  combinedFilters,
  onCombinedFiltersChange,
  legs = [],
  fromCity = "",
  toCity = "",
  minPrice = 0,
  maxPrice = 0,
  priceCurrency = "INR",
  departureAirportOptions = [],
  minDuration = 0,
  maxDuration = 0,
  minLayoverDuration = 0,
  maxLayoverDuration = 0,
  allianceOptions = [],
  layoverAirportOptions = [],
  airlineOptions = [],
  aircraftOptions = [],
}: Props) {
  const safeFilters: FlightsFiltersState = filters ?? {
    ...(isInternational
      ? DEFAULT_INTERNATIONAL_FILTERS
      : DEFAULT_DOMESTIC_FILTERS),
    priceRange: [minPrice, maxPrice],
    durationRange: [minDuration, maxDuration],
    layoverDurationRange: [minLayoverDuration, maxLayoverDuration],
  };

  const updateFilter = (key: keyof FlightsFiltersState, value: any) => {
    onFiltersChange({
      ...safeFilters,
      [key]: value,
    });
  };

  const shellClass =
    "rounded-xl bg-white p-3 shadow-sm sm:p-4";

  if (tripType === "oneway") {
    if (isInternational) {
      return (
        <div className={shellClass}>
          <OneWayInternationalFilters
            filters={safeFilters}
            updateFilter={updateFilter}
            resetAllFilters={onFiltersChange}
            fromCity={fromCity}
            toCity={toCity}
            minPrice={minPrice}
            maxPrice={maxPrice}
            priceCurrency={priceCurrency}
            minDuration={minDuration}
            maxDuration={maxDuration}
            minLayoverDuration={minLayoverDuration}
            maxLayoverDuration={maxLayoverDuration}
            allianceOptions={allianceOptions}
            layoverAirportOptions={layoverAirportOptions}
            aircraftOptions={aircraftOptions}
          />
        </div>
      );
    }

    return (
      <div className={shellClass}>
        <OneWayDomesticFilters
          filters={safeFilters}
          updateFilter={updateFilter}
          resetAllFilters={onFiltersChange as any}
          fromCity={fromCity}
          toCity={toCity}
          minPrice={minPrice}
          maxPrice={maxPrice}
            priceCurrency={priceCurrency}
            departureAirportOptions={departureAirportOptions}
            airlineOptions={airlineOptions}
            aircraftOptions={aircraftOptions}
          />
      </div>
    );
  }

  if (tripType === "roundtrip") {
    return (
      <div className={shellClass}>
        <div className="text-[15px] font-semibold text-[#111827] sm:text-[16px]">
          Round Trip Filters
        </div>
        <div className="mt-2 text-[12px] text-[#6b7280] sm:text-[13px]">
          Round Trip filter system will be added in Day 23 next phase.
        </div>
      </div>
    );
  }

  if (tripType === "multicity") {
    if (viewMode === "combined") {
      if (!combinedFilters || !onCombinedFiltersChange) {
        return null;
      }

      return (
        <div className={shellClass}>
          <MultiCityCombinedFilters
            filters={combinedFilters}
            onFiltersChange={onCombinedFiltersChange}
            legs={legs}
            minPrice={minPrice}
            maxPrice={maxPrice}
            minDuration={minDuration}
            maxDuration={maxDuration}
            minLayoverDuration={minLayoverDuration}
            maxLayoverDuration={maxLayoverDuration}
            airlineOptions={airlineOptions}
            layoverAirportOptions={layoverAirportOptions}
          />
        </div>
      );
    }

    if (isInternational) {
      return (
        <div className={shellClass}>
          <MultiCityInternationalFilters
            filters={safeFilters}
            updateFilter={updateFilter}
            resetAllFilters={onFiltersChange as any}
            fromCity={fromCity}
            toCity={toCity}
            minPrice={minPrice}
            maxPrice={maxPrice}
            minDuration={minDuration}
            maxDuration={maxDuration}
            minLayoverDuration={minLayoverDuration}
            maxLayoverDuration={maxLayoverDuration}
            allianceOptions={allianceOptions}
            layoverAirportOptions={layoverAirportOptions}
          />
        </div>
      );
    }

    return (
      <div className={shellClass}>
        <MultiCityDomesticFilters
          filters={safeFilters}
          updateFilter={updateFilter}
          resetAllFilters={onFiltersChange as any}
          fromCity={fromCity}
          toCity={toCity}
          minPrice={minPrice}
          maxPrice={maxPrice}
          departureAirportOptions={departureAirportOptions}
        />
      </div>
    );
  }

  return null;
}
