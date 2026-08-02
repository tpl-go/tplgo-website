"use client";

import { useEffect, useMemo, useState } from "react";
import FlightsFiltersSidebar, {
  FlightsFiltersState,
} from "../FlightsFiltersSidebar";
import FlightsResultHeader from "../common/FlightsResultHeader";

import FlightsDateFareStrip from "../common/FlightsDateFareStrip";
import FlightsSortBar from "../common/FlightsSortBar";
import OneWayFlightResultCard from "./OneWayFlightResultCard";
import { FlightState } from "../../hooks";
import {
  type DummyFlight,
  generateDummyFlights,
  formatMinutesToTime,
  formatDuration,
} from "../../data/flightDummyData";
import {
  isBackendFlightSearchEnabled,
  isBackendFlightSearchFallbackEnabled,
  searchBackendFlights,
  type BackendFlightSearchRequest,
} from "@/app/lib/api/flightSearchApi";
import { formatFlightMoney, normalizeFlightCurrency } from "@/app/lib/flights/flightCurrency";
import {
  isFlightBackendStateExpired,
  validateFlightSearchState,
} from "@/app/lib/flights/flightBackendIntegration";

type OneWayResultsLayoutProps = {
  fromCity: string;
  toCity: string;
  state: FlightState;
  filters: FlightsFiltersState;
  onFiltersChange: (filters: FlightsFiltersState) => void;
  isInternational?: boolean;
};

type SimpleOption = {
  id: string;
  label: string;
  price?: string;
};

type AppliedChip = {
  key: keyof FlightsFiltersState;
  value: string;
  label: string;
};

type FlightPriceLike = Partial<DummyFlight> & {
  basePrice?: number | string;
  fares?: Array<{
    price?: number | string;
  }>;
};

const popularFilterLabels: Record<string, string> = {
  nonstop: "Non Stop",
  nearby: "Hide Nearby Airports",
  refundable: "Refundable Fares",
  indigo: "IndiGo",
  airindia: "Air India",
  akasa: "Akasa Air",
  spicejet: "SpiceJet",
  morning: "Morning Departures",
  afternoon: "Afternoon Departures",
  early: "Early Morning Departures",
};

const stopLabels: Record<string, string> = {
  nonstop: "Non Stop",
  "1stop": "1 Stop",
  "2stop": "2+ Stop",
};

const timeLabels: Record<string, string> = {
  before6: "Before 6 AM",
  "6to12": "6 AM to 12 PM",
  "12to18": "12 PM to 6 PM",
  after18: "After 6 PM",
};

const airlineLabels: Record<string, string> = {
  airindia: "Air India",
  aiexpress: "Air India Express",
  akasa: "Akasa Air",
  indigo: "IndiGo",
  spicejet: "SpiceJet",
};

const aircraftLabels: Record<string, string> = {
  smallmid: "Small / Mid-size aircraft",
  widebody: "Large / Wide-body aircraft",
};

function normalizeAirlineId(value: string) {
  return value.toLowerCase().replace(/\s/g, "");
}

function normalizeId(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function ensureArray(value: any) {
  return Array.isArray(value) ? value : [];
}

function getEffectiveFlightPrice(flight: FlightPriceLike): number {
  const directPrice = Number(flight?.basePrice || 0);
  if (Number.isFinite(directPrice) && directPrice > 0) return directPrice;

  const farePrices = Array.isArray(flight?.fares)
    ? flight.fares
        .map((fare) => Number(fare?.price || 0))
        .filter((price: number) => Number.isFinite(price) && price > 0)
    : [];

  return farePrices.length ? Math.min(...farePrices) : 0;
}

export default function OneWayResultsLayout({
  fromCity,
  toCity,
  state,
  filters,
  onFiltersChange,
  isInternational = false,
}: OneWayResultsLayoutProps) {
  const initialSelectedDate = state.segments[0]?.departure || new Date();
  const [selectedDate] = useState(initialSelectedDate);
  const [sortType, setSortType] = useState("cheapest");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [backendFlights, setBackendFlights] = useState<DummyFlight[] | null>(null);
  const [backendSearchState, setBackendSearchState] = useState<{
    status:
      | "initial"
      | "loading"
      | "success"
      | "no_results"
      | "error"
      | "expired";
    message: string;
    requestId?: string;
    retryNonce: number;
  }>({ status: "initial", message: "", retryNonce: 0 });

  const localFlights = useMemo(() => {
    return generateDummyFlights(fromCity, toCity);
  }, [fromCity, toCity]);

  const backendSearchRequest = useMemo(
    () => buildBackendFlightSearchRequest(state),
    [state]
  );

  useEffect(() => {
    let active = true;

    if (!isBackendFlightSearchEnabled() || !backendSearchRequest) {
      setBackendFlights(null);
      setBackendSearchState((current) => ({
        ...current,
        status: "initial",
        message: backendSearchRequest ? "" : "Complete a valid one-way search to load backend fares.",
      }));
      return () => {
        active = false;
      };
    }

    setBackendSearchState((current) => ({
      ...current,
      status: "loading",
      message: "Loading backend flight fares.",
    }));

    searchBackendFlights(backendSearchRequest)
      .then((result) => {
        if (!active) return;

        if (result.ok) {
          setBackendFlights(result.flights);
          setBackendSearchState((current) => ({
            ...current,
            status: result.flights.length > 0 ? "success" : "no_results",
            message:
              result.flights.length > 0
                ? ""
                : "No backend fares were returned for this search.",
            requestId: result.requestId,
          }));
          return;
        }

        setBackendFlights(isBackendFlightSearchFallbackEnabled() ? null : []);
        setBackendSearchState((current) => ({
          ...current,
          status: "error",
          message: result.error.message,
          requestId: result.requestId,
        }));
      })
      .catch(() => {
        if (!active) return;
        setBackendFlights(isBackendFlightSearchFallbackEnabled() ? null : []);
        setBackendSearchState((current) => ({
          ...current,
          status: "error",
          message: "TPL backend is unavailable. Please retry.",
        }));
      });

    return () => {
      active = false;
    };
  }, [backendSearchRequest, backendSearchState.retryNonce]);

  const baseFlights = backendFlights ?? localFlights;
  const backendSearchActive = isBackendFlightSearchEnabled() && Boolean(backendSearchRequest);

  const { minPrice, maxPrice, minDuration, maxDuration } = useMemo(() => {
    if (!baseFlights.length) {
      return {
        minPrice: 0,
        maxPrice: 0,
        minDuration: 0,
        maxDuration: 0,
      };
    }

    const prices = baseFlights
      .map((flight) => getEffectiveFlightPrice(flight))
      .filter((price: number) => price > 0);
    const durations = baseFlights.map(
      (flight) => flight.durationMinutes ?? 0
    );

    return {
      minPrice: prices.length ? Math.min(...prices) : 0,
      maxPrice: prices.length ? Math.max(...prices) : 0,
      minDuration: Math.min(...durations),
      maxDuration: Math.max(...durations),
    };
  }, [baseFlights]);

  const {
    allianceOptions,
    layoverAirportOptions,
    minLayoverDuration,
    maxLayoverDuration,
    departureAirportOptions,
  } = useMemo(() => {
    const allianceMap = new Map<string, SimpleOption>();
    const layoverAirportMap = new Map<string, SimpleOption>();
    const departureAirportMap = new Map<string, SimpleOption>();
    const layoverDurations: number[] = [];

    baseFlights.forEach((flight: any) => {
      const allianceLabel = flight.alliance || flight.airlineAlliance;
      if (allianceLabel) {
        const id = normalizeId(allianceLabel);
        if (!allianceMap.has(id)) {
          allianceMap.set(id, { id, label: allianceLabel });
        }
      }

      const layoverAirport =
        flight.layoverAirport || flight.stopAirport || flight.stopCity;
      if (layoverAirport) {
        const id = normalizeId(layoverAirport);
        if (!layoverAirportMap.has(id)) {
          layoverAirportMap.set(id, { id, label: layoverAirport });
        }
      }

      const layoverDuration =
        flight.layoverDurationMinutes || flight.stopDurationMinutes || 0;
      if (layoverDuration > 0) {
        layoverDurations.push(layoverDuration);
      }

      const departAirportName =
        flight.departAirportName ||
        flight.departAirport ||
        `${fromCity} Airport`;
      const departAirportId = normalizeId(departAirportName);

      if (!departureAirportMap.has(departAirportId)) {
        departureAirportMap.set(departAirportId, {
          id: departAirportId,
          label: departAirportName,
          price: `₹ ${getEffectiveFlightPrice(flight).toLocaleString("en-IN")}`,
        });
      }
    });

    return {
      allianceOptions: Array.from(allianceMap.values()),
      layoverAirportOptions: Array.from(layoverAirportMap.values()),
      minLayoverDuration: layoverDurations.length
        ? Math.min(...layoverDurations)
        : 0,
      maxLayoverDuration: layoverDurations.length
        ? Math.max(...layoverDurations)
        : 0,
      departureAirportOptions: Array.from(departureAirportMap.values()),
    };
  }, [baseFlights, fromCity]);

  const safePriceRange: [number, number] =
    Array.isArray(filters.priceRange) &&
    filters.priceRange.length === 2 &&
    typeof filters.priceRange[0] === "number" &&
    typeof filters.priceRange[1] === "number" &&
    !(filters.priceRange[0] === 0 && filters.priceRange[1] === 0)
      ? filters.priceRange
      : [minPrice, maxPrice];

  const safeDurationRange: [number, number] =
    Array.isArray(filters.durationRange) &&
    filters.durationRange.length === 2 &&
    typeof filters.durationRange[0] === "number" &&
    typeof filters.durationRange[1] === "number" &&
    !(filters.durationRange[0] === 0 && filters.durationRange[1] === 0)
      ? filters.durationRange
      : [minDuration, maxDuration];

  const safeLayoverDurationRange: [number, number] =
    Array.isArray(filters.layoverDurationRange) &&
    filters.layoverDurationRange.length === 2 &&
    typeof filters.layoverDurationRange[0] === "number" &&
    typeof filters.layoverDurationRange[1] === "number" &&
    !(filters.layoverDurationRange[0] === 0 &&
      filters.layoverDurationRange[1] === 0)
      ? filters.layoverDurationRange
      : [minLayoverDuration, maxLayoverDuration];

  const isPriceFilterApplied =
    safePriceRange[0] !== minPrice || safePriceRange[1] !== maxPrice;

  const isDurationFilterApplied =
    safeDurationRange[0] !== minDuration ||
    safeDurationRange[1] !== maxDuration;

  const isLayoverDurationFilterApplied =
    safeLayoverDurationRange[0] !== minLayoverDuration ||
    safeLayoverDurationRange[1] !== maxLayoverDuration;

  const appliedChips: AppliedChip[] = useMemo(() => {
    const chips: AppliedChip[] = [];

    ensureArray(filters.popular)
      .filter((item) => item !== "__show_all_popular__")
      .forEach((item) => {
        chips.push({
          key: "popular",
          value: item,
          label: popularFilterLabels[item] || item,
        });
      });

    ensureArray(filters.departureAirports).forEach((item) => {
      chips.push({
        key: "departureAirports",
        value: item,
        label:
          departureAirportOptions.find((airport) => airport.id === item)
            ?.label || item,
      });
    });

    ensureArray(filters.stops).forEach((item) => {
      chips.push({
        key: "stops",
        value: item,
        label: stopLabels[item] || item,
      });
    });

    ensureArray(filters.departureTime).forEach((item) => {
      chips.push({
        key: "departureTime",
        value: item,
        label: `Departure: ${timeLabels[item] || item}`,
      });
    });

    ensureArray(filters.arrivalTime).forEach((item) => {
      chips.push({
        key: "arrivalTime",
        value: item,
        label: `Arrival: ${timeLabels[item] || item}`,
      });
    });

    ensureArray(filters.airlines).forEach((item) => {
      chips.push({
        key: "airlines",
        value: item,
        label: airlineLabels[item] || item,
      });
    });

    ensureArray(filters.aircraftSize).forEach((item) => {
      chips.push({
        key: "aircraftSize",
        value: item,
        label: aircraftLabels[item] || item,
      });
    });

    if (isPriceFilterApplied) {
      chips.push({
        key: "priceRange",
        value: "priceRange",
        label: `₹${safePriceRange[0].toLocaleString(
          "en-IN"
        )} - ₹${safePriceRange[1].toLocaleString("en-IN")}`,
      });
    }

    if (isInternational && filters.checkInBaggage) {
      chips.push({
        key: "checkInBaggage",
        value: "checkInBaggage",
        label: "Check-in baggage",
      });
    }

    if (isInternational && isDurationFilterApplied) {
      chips.push({
        key: "durationRange",
        value: "durationRange",
        label: `Duration ${safeDurationRange[0]} - ${safeDurationRange[1]} min`,
      });
    }

    ensureArray(filters.alliances).forEach((item) => {
      chips.push({
        key: "alliances",
        value: item,
        label:
          allianceOptions.find((alliance) => alliance.id === item)?.label ||
          item,
      });
    });

    ensureArray(filters.layoverAirports).forEach((item) => {
      chips.push({
        key: "layoverAirports",
        value: item,
        label:
          layoverAirportOptions.find((airport) => airport.id === item)?.label ||
          item,
      });
    });

    if (isInternational && isLayoverDurationFilterApplied) {
      chips.push({
        key: "layoverDurationRange",
        value: "layoverDurationRange",
        label: `Layover ${safeLayoverDurationRange[0]} - ${safeLayoverDurationRange[1]} min`,
      });
    }

    return chips;
  }, [
    filters,
    departureAirportOptions,
    allianceOptions,
    layoverAirportOptions,
    isInternational,
    isPriceFilterApplied,
    isDurationFilterApplied,
    isLayoverDurationFilterApplied,
    safePriceRange,
    safeDurationRange,
    safeLayoverDurationRange,
    minPrice,
    maxPrice,
    minDuration,
    maxDuration,
    minLayoverDuration,
    maxLayoverDuration,
  ]);

  const removeMobileChip = (chip: AppliedChip) => {
    if (chip.key === "priceRange") {
      onFiltersChange({
        ...filters,
        priceRange: [minPrice, maxPrice],
      });
      return;
    }

    if (chip.key === "durationRange") {
      onFiltersChange({
        ...filters,
        durationRange: [minDuration, maxDuration],
      });
      return;
    }

    if (chip.key === "layoverDurationRange") {
      onFiltersChange({
        ...filters,
        layoverDurationRange: [minLayoverDuration, maxLayoverDuration],
      });
      return;
    }

    if (chip.key === "checkInBaggage") {
      onFiltersChange({
        ...filters,
        checkInBaggage: false,
      });
      return;
    }

    const currentValues = ensureArray((filters as any)[chip.key]);

    onFiltersChange({
      ...filters,
      [chip.key]: currentValues.filter((item) => item !== chip.value),
    });
  };

  const clearAllMobileFilters = () => {
    onFiltersChange({
      popular: [],
      departureAirports: [],
      priceRange: [minPrice, maxPrice],
      stops: [],
      departureTime: [],
      arrivalTime: [],
      airlines: [],
      aircraftSize: [],
      checkInBaggage: false,
      durationRange: [minDuration, maxDuration],
      alliances: [],
      layoverAirports: [],
      layoverDurationRange: [minLayoverDuration, maxLayoverDuration],
    });
  };

  const finalFlights = useMemo(() => {
    let flights = [...baseFlights] as any[];

    if (filters.popular.length > 0) {
      flights = flights.filter((f) => {
        return filters.popular.every((popularId) => {
          if (popularId === "nonstop") return f.stops === 0;
          if (popularId === "1stop") return f.stops === 1;
          if (popularId === "morning")
            return f.departMinutes >= 360 && f.departMinutes < 720;
          if (popularId === "afternoon")
            return f.departMinutes >= 720 && f.departMinutes < 1080;
          if (popularId === "early") return f.departMinutes < 360;
          return true;
        });
      });
    }

    if (!isInternational && filters.departureAirports.length > 0) {
      flights = flights.filter((f) => {
        const rawAirportLabel =
          f.departAirportName || f.departAirport || `${fromCity} Airport`;
        const airportId = normalizeId(rawAirportLabel);
        return filters.departureAirports.includes(airportId);
      });
    }

    if (filters.stops.length > 0) {
      flights = flights.filter((f) => {
        if (filters.stops.includes("nonstop") && f.stops === 0) return true;
        if (filters.stops.includes("1stop") && f.stops === 1) return true;
        if (filters.stops.includes("2stop") && f.stops >= 2) return true;
        return false;
      });
    }

    if (filters.airlines.length > 0) {
      flights = flights.filter((f) =>
        filters.airlines.includes(normalizeAirlineId(f.airline))
      );
    }

    if (filters.departureTime.length > 0) {
      flights = flights.filter((f) => {
        const t = f.departMinutes;
        return filters.departureTime.some((slot) => {
          if (slot === "before6") return t < 360;
          if (slot === "6to12") return t >= 360 && t < 720;
          if (slot === "12to18") return t >= 720 && t < 1080;
          if (slot === "after18") return t >= 1080;
          return false;
        });
      });
    }

    if (filters.arrivalTime.length > 0) {
      flights = flights.filter((f) => {
        const t = f.arriveMinutes;
        return filters.arrivalTime.some((slot) => {
          if (slot === "before6") return t < 360;
          if (slot === "6to12") return t >= 360 && t < 720;
          if (slot === "12to18") return t >= 720 && t < 1080;
          if (slot === "after18") return t >= 1080;
          return false;
        });
      });
    }

    if (isPriceFilterApplied) {
      flights = flights.filter(
        (f) => {
          const price = getEffectiveFlightPrice(f);
          return price >= safePriceRange[0] && price <= safePriceRange[1];
        }
      );
    }

    if (isInternational && filters.checkInBaggage) {
      flights = flights.filter((f) => {
        const baggage =
          f.checkInBaggageKg ||
          f.checkinBaggage ||
          f.baggageIncluded ||
          f.checkedBaggage;
        return Boolean(baggage);
      });
    }

    if (isInternational && isDurationFilterApplied) {
      flights = flights.filter(
        (f) =>
          f.durationMinutes >= safeDurationRange[0] &&
          f.durationMinutes <= safeDurationRange[1]
      );
    }

    if (isInternational && filters.alliances.length > 0) {
      flights = flights.filter((f) => {
        const alliance = normalizeId(
          f.alliance || f.airlineAlliance || "unknown"
        );
        return filters.alliances.includes(alliance);
      });
    }

    if (isInternational && filters.layoverAirports.length > 0) {
      flights = flights.filter((f) => {
        const layoverAirport = normalizeId(
          f.layoverAirport || f.stopAirport || f.stopCity || ""
        );
        return filters.layoverAirports.includes(layoverAirport);
      });
    }

    if (isInternational && isLayoverDurationFilterApplied) {
      flights = flights.filter((f) => {
        const value = f.layoverDurationMinutes || f.stopDurationMinutes || 0;
        return (
          value >= safeLayoverDurationRange[0] &&
          value <= safeLayoverDurationRange[1]
        );
      });
    }

    if (filters.aircraftSize.length > 0) {
      flights = flights.filter((f) => {
        const aircraftLabel = String(
          f.aircraftSize || f.aircraftCategory || ""
        ).toLowerCase();

        return filters.aircraftSize.some((selected) => {
          if (selected === "smallmid") {
            return (
              aircraftLabel.includes("small") ||
              aircraftLabel.includes("mid") ||
              aircraftLabel.includes("narrow")
            );
          }

          if (selected === "widebody") {
            return (
              aircraftLabel.includes("wide") || aircraftLabel.includes("body")
            );
          }

          return false;
        });
      });
    }

    if (sortType === "cheapest") {
      flights.sort(
        (a, b) => getEffectiveFlightPrice(a) - getEffectiveFlightPrice(b)
      );
    }

    if (sortType === "nonstop") {
      flights.sort((a, b) => a.stops - b.stops);
    }

    if (sortType === "prefer") {
      flights.sort(
        (a, b) =>
          getEffectiveFlightPrice(a) +
          a.durationMinutes -
          (getEffectiveFlightPrice(b) + b.durationMinutes)
      );
    }

    if (sortType === "Early Departure") {
      flights.sort((a, b) => a.departMinutes - b.departMinutes);
    }

    if (sortType === "Late Departure") {
      flights.sort((a, b) => b.departMinutes - a.departMinutes);
    }

    if (sortType === "Early Arrival") {
      flights.sort((a, b) => a.arriveMinutes - b.arriveMinutes);
    }

    if (sortType === "Late Arrival") {
      flights.sort((a, b) => b.arriveMinutes - a.arriveMinutes);
    }

    return flights;
  }, [
    baseFlights,
    filters,
    sortType,
    fromCity,
    isInternational,
    isPriceFilterApplied,
    isDurationFilterApplied,
    isLayoverDurationFilterApplied,
    safePriceRange,
    safeDurationRange,
    safeLayoverDurationRange,
  ]);

  const filterPanel = (
    <FlightsFiltersSidebar
      tripType="oneway"
      isInternational={isInternational}
      filters={filters}
      onFiltersChange={onFiltersChange}
      fromCity={fromCity}
      toCity={toCity}
      minPrice={minPrice}
      maxPrice={maxPrice}
      departureAirportOptions={departureAirportOptions}
      minDuration={minDuration}
      maxDuration={maxDuration}
      minLayoverDuration={minLayoverDuration}
      maxLayoverDuration={maxLayoverDuration}
      allianceOptions={allianceOptions}
      layoverAirportOptions={layoverAirportOptions}
    />
  );

  return (
    <div className="grid w-full grid-cols-1 gap-2.5 overflow-x-hidden xl:grid-cols-[290px_minmax(0,1fr)] xl:gap-5 xl:overflow-visible">
      <div className="hidden xl:sticky xl:top-[82px] xl:block xl:h-fit xl:self-start">
        {filterPanel}
      </div>

      <section className="min-w-0 max-w-full space-y-2.5 xl:space-y-2">
        <div className="sticky top-0 z-30 -mx-3 border-b border-[#e5edf6] bg-[#eef3f8]/95 px-3 py-2 backdrop-blur xl:hidden">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#d9e2ef] bg-white text-[22px] font-bold leading-none text-[#111827] shadow-sm"
              aria-label="Go back"
            >
              ‹
            </button>

            <div className="min-w-0 flex-1">
              <div className="truncate text-[14px] font-black leading-tight text-[#111827]">
                {fromCity} to {toCity}
              </div>
              <div className="mt-0.5 text-[11px] font-semibold text-[#64748b]">
                {finalFlights.length} flights available
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowMobileFilters(true)}
              className="shrink-0 rounded-full bg-[#0f172a] px-3 py-2 text-[12px] font-black text-white shadow-sm"
            >
              Filters
            </button>
          </div>
        </div>

        <div className="hidden xl:block">
          <FlightsResultHeader
            tripType="oneway"
            segments={[
              {
                fromCity,
                toCity,
                departure: state.segments[0]?.departure ?? undefined,
              },
            ]}
          />
        </div>

        <div className="max-w-full space-y-2 xl:hidden">
          <button
            type="button"
            onClick={() => setShowMobileFilters(true)}
            className="flex h-10 w-full items-center justify-between rounded-xl border border-[#d9e2ef] bg-white px-3.5 text-[12px] font-black text-[#111827] shadow-sm"
          >
            <span>Filters</span>
            <span className="rounded-full bg-[#eef7ff] px-3 py-1 text-[12px] font-extrabold text-[#0b66c3]">
              {finalFlights.length} available
            </span>
          </button>

          {appliedChips.length > 0 ? (
            <div className="rounded-xl border border-[#d9e2ef] bg-white px-3 py-2.5 shadow-sm">
              <div className="mb-2 flex items-center justify-between gap-3">
                <div className="text-[12px] font-extrabold uppercase tracking-[0.08em] text-[#64748b]">
                  Applied Filters
                </div>

                <button
                  type="button"
                  onClick={clearAllMobileFilters}
                  className="text-[12px] font-extrabold text-[#2563eb]"
                >
                  Clear All
                </button>
              </div>

              <div className="flex gap-2 overflow-x-auto overflow-y-hidden pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {appliedChips.map((chip) => (
                  <div
                    key={`${chip.key}-${chip.value}`}
                    className="flex shrink-0 items-center gap-2 rounded-full bg-[#e0f2fe] px-3 py-2 text-[12px] font-bold text-[#0f172a]"
                  >
                    <span>{chip.label}</span>

                    <button
                      type="button"
                      onClick={() => removeMobileChip(chip)}
                      className="flex h-5 w-5 items-center justify-center rounded-full bg-[#2563eb] text-[12px] leading-none text-white"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <FlightsDateFareStrip
          selectedDate={selectedDate}
          fromCity={fromCity}
          toCity={toCity}
        />

        <FlightsSortBar sortType={sortType} onSortChange={setSortType} />

        <div className="max-w-full space-y-2.5 pb-1 lg:space-y-3 lg:pb-0">
          {backendSearchActive && backendSearchState.status === "loading" ? (
            <BackendSearchNotice title="Loading fares" message="Fetching normalized fares from TPL backend." />
          ) : backendSearchActive && backendSearchState.status === "error" ? (
            <BackendSearchNotice
              title="Backend search failed"
              message={backendSearchState.message}
              onRetry={() =>
                setBackendSearchState((current) => ({
                  ...current,
                  retryNonce: current.retryNonce + 1,
                }))
              }
            />
          ) : backendSearchActive && backendSearchState.status === "no_results" ? (
            <BackendSearchNotice
              title="No backend fares"
              message={backendSearchState.message}
              onRetry={() =>
                setBackendSearchState((current) => ({
                  ...current,
                  retryNonce: current.retryNonce + 1,
                }))
              }
            />
          ) : backendSearchActive && backendSearchState.status === "expired" ? (
            <BackendSearchNotice
              title="Search expired"
              message="Backend fare hold expired. Retry search to load fresh fares."
              onRetry={() =>
                setBackendSearchState((current) => ({
                  ...current,
                  retryNonce: current.retryNonce + 1,
                }))
              }
            />
          ) : finalFlights.length > 0 ? (
            finalFlights.map((card: any) => (
              <OneWayFlightResultCard
                key={card.id}
                airline={card.airline}
                code={card.code}
                depart={formatMinutesToTime(card.departMinutes)}
                departCity={fromCity}
                duration={formatDuration(card.durationMinutes)}
                stop={card.stopLabel}
                arrive={formatMinutesToTime(card.arriveMinutes)}
                arriveCity={toCity}
                price={formatFlightMoney(
                  getEffectiveFlightPrice(card),
                  normalizeFlightCurrency(card.backendOffer?.currency)
                )}
                timing={card.timing}
                promo={card.promo}
                stopDetails={card.stopDetails}
                backendFares={card.fares}
                backendOffer={
                  card.backendOffer &&
                  !isFlightBackendStateExpired(card.backendOffer.expiresAt)
                    ? card.backendOffer
                    : undefined
                }
              />
            ))
          ) : (
            <div className="rounded-2xl border border-[#e5e7eb] bg-white px-4 py-8 text-center text-[14px] text-[#6b7280] sm:px-6 sm:py-10 sm:text-[15px]">
              No flights found for the selected filters.
            </div>
          )}
        </div>
      </section>

      {showMobileFilters && (
        <div className="fixed inset-0 z-[80] xl:hidden">
          <button
            type="button"
            aria-label="Close filters"
            onClick={() => setShowMobileFilters(false)}
            className="absolute inset-0 bg-black/45"
          />

          <div className="absolute bottom-0 left-0 right-0 max-h-[86vh] overflow-hidden rounded-t-3xl bg-[#eef3f8] shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#d9e2ef] bg-white px-4 py-3">
              <div>
                <div className="text-[15px] font-extrabold text-[#111827]">
                  Filters
                </div>
                <div className="text-[12px] font-medium text-[#6b7280]">
                  {fromCity} to {toCity}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowMobileFilters(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f3f4f6] text-[20px] font-bold text-[#111827]"
              >
                ×
              </button>
            </div>

            <div className="max-h-[calc(86vh-128px)] overflow-y-auto px-3 py-3">
              {filterPanel}
            </div>

            <div className="sticky bottom-0 border-t border-[#d9e2ef] bg-white px-4 py-3">
              <button
                type="button"
                onClick={() => setShowMobileFilters(false)}
                className="h-11 w-full rounded-xl bg-[#f97316] text-[14px] font-extrabold text-white"
              >
                Show {finalFlights.length} Flights
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function buildBackendFlightSearchRequest(state: FlightState): BackendFlightSearchRequest | null {
  const validation = validateFlightSearchState(state);
  return validation.ok ? validation.request : null;
}

function BackendSearchNotice({
  title,
  message,
  onRetry,
}: {
  title: string;
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="rounded-2xl border border-[#d9e2ec] bg-white px-4 py-8 text-center sm:px-6 sm:py-10">
      <div className="text-[15px] font-black text-[#111827]">{title}</div>
      <div className="mx-auto mt-2 max-w-xl text-[13px] font-semibold leading-5 text-[#64748b]">
        {message}
      </div>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 h-10 rounded-xl bg-[#111827] px-5 text-[13px] font-black text-white"
        >
          Retry
        </button>
      ) : null}
    </div>
  );
}
