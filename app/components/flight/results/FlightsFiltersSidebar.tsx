"use client";

import OneWayDomesticFilters from "./oneway/filters/OneWayDomesticFilters";
import OneWayInternationalFilters from "./oneway/filters/OneWayInternationalFilters";
import MultiCityDomesticFilters from "./multicity/filters/MultiCityDomesticFilters";
import MultiCityInternationalFilters from "./multicity/filters/MultiCityInternationalFilters";
import MultiCityCombinedFilters from "./multicity/filters/MultiCityCombinedFilters";
import {
  MultiCityCombinedFiltersState,
} from "./multicity/filters/filterTypes";
import { MultiCityLeg } from "../data/multicityFlights";

export type FlightsFiltersState = {
  popular: string[];
  departureAirports: string[];
  priceRange: [number, number];
  stops: string[];
  departureTime: string[];
  arrivalTime: string[];
  airlines: string[];
  aircraftSize: string[];

  // International
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

  departureAirportOptions?: AirportOption[];

  minDuration?: number;
  maxDuration?: number;

  minLayoverDuration?: number;
  maxLayoverDuration?: number;

  allianceOptions?: SimpleOption[];
  layoverAirportOptions?: SimpleOption[];
  airlineOptions?: SimpleOption[];
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
  departureAirportOptions = [],
  minDuration = 0,
  maxDuration = 0,
  minLayoverDuration = 0,
  maxLayoverDuration = 0,
  allianceOptions = [],
  layoverAirportOptions = [],
  airlineOptions = [],
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

  if (tripType === "oneway") {
    if (isInternational) {
      return (
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <OneWayInternationalFilters
            filters={safeFilters}
            updateFilter={updateFilter}
            resetAllFilters={onFiltersChange}
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
      <div className="rounded-xl bg-white p-4 shadow-sm">
        <OneWayDomesticFilters
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

  if (tripType === "roundtrip") {
    return (
      <div className="rounded-xl bg-white p-4 shadow-sm">
        <div className="text-[16px] font-semibold text-[#111827]">
          Round Trip Filters
        </div>
        <div className="mt-2 text-[13px] text-[#6b7280]">
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
        <div className="rounded-xl bg-white p-4 shadow-sm">
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
        <div className="rounded-xl bg-white p-4 shadow-sm">
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
      <div className="rounded-xl bg-white p-4 shadow-sm">
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