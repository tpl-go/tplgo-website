"use client";

import { useMemo, useState } from "react";
import FlightsFiltersSidebar, {
  FlightsFiltersState,
} from "../FlightsFiltersSidebar";
import FlightsResultHeader from "../common/FlightsResultHeader";

import FlightsDateFareStrip from "../common/FlightsDateFareStrip";
import FlightsSortBar from "../common/FlightsSortBar";
import OneWayFlightResultCard from "./OneWayFlightResultCard";
import { FlightState } from "../../hooks";
import {
  generateDummyFlights,
  formatMinutesToTime,
  formatDuration,
} from "../../data/flightDummyData";

type OneWayResultsLayoutProps = {
  fromCity: string;
  toCity: string;
  state: FlightState;
  filters: FlightsFiltersState;
  onFiltersChange: (filters: FlightsFiltersState) => void;
  isInternational?: boolean; // ✅ NEW
};

type SimpleOption = {
  id: string;
  label: string;
  price?: string;
};

function normalizeAirlineId(value: string) {
  return value.toLowerCase().replace(/\s/g, "");
}

function normalizeId(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
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

  const baseFlights = useMemo(() => {
    return generateDummyFlights(fromCity, toCity);
  }, [fromCity, toCity]);

  const { minPrice, maxPrice, minDuration, maxDuration } = useMemo(() => {
    if (!baseFlights.length) {
      return {
        minPrice: 0,
        maxPrice: 0,
        minDuration: 0,
        maxDuration: 0,
      };
    }

    const prices = baseFlights.map((flight: any) => flight.basePrice ?? 0);
    const durations = baseFlights.map(
      (flight: any) => flight.durationMinutes ?? 0
    );

    return {
      minPrice: Math.min(...prices),
      maxPrice: Math.max(...prices),
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
        flight.departAirportName || flight.departAirport || `${fromCity} Airport`;
      const departAirportId = normalizeId(departAirportName);

      if (!departureAirportMap.has(departAirportId)) {
        departureAirportMap.set(departAirportId, {
          id: departAirportId,
          label: departAirportName,
          price: `₹ ${Number(flight.basePrice || 0).toLocaleString("en-IN")}`,
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
    safeDurationRange[0] !== minDuration || safeDurationRange[1] !== maxDuration;

  const isLayoverDurationFilterApplied =
    safeLayoverDurationRange[0] !== minLayoverDuration ||
    safeLayoverDurationRange[1] !== maxLayoverDuration;

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
        (f) =>
          f.basePrice >= safePriceRange[0] && f.basePrice <= safePriceRange[1]
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
        const value =
          f.layoverDurationMinutes || f.stopDurationMinutes || 0;
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
              aircraftLabel.includes("wide") ||
              aircraftLabel.includes("body")
            );
          }

          return false;
        });
      });
    }

    if (sortType === "cheapest") {
      flights.sort((a, b) => a.basePrice - b.basePrice);
    }

    if (sortType === "nonstop") {
      flights.sort((a, b) => a.stops - b.stops);
    }

    if (sortType === "prefer") {
      flights.sort(
        (a, b) =>
          a.basePrice + a.durationMinutes - (b.basePrice + b.durationMinutes)
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
    minPrice,
    maxPrice,
    minDuration,
    maxDuration,
    minLayoverDuration,
    maxLayoverDuration,
  ]);

  return (
    <div className="grid grid-cols-[310px_minmax(0,1fr)] gap-5">
      <div className="sticky top-[82px] h-fit self-start">
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
</div>

      <section className="space-y-2">
        <FlightsResultHeader
          tripType="oneway"
          segments={[
            {
              fromCity,
              toCity,
              departure: state.segments[0]?.departure,
            },
          ]}
        />

        

        <FlightsDateFareStrip
          selectedDate={selectedDate}
          fromCity={fromCity}
          toCity={toCity}
        />

        <FlightsSortBar sortType={sortType} onSortChange={setSortType} />

        {finalFlights.length > 0 ? (
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
              price={`₹${card.basePrice.toLocaleString("en-IN")}`}
              timing={card.timing}
              promo={card.promo}
              stopDetails={card.stopDetails}
            />
          ))
        ) : (
          <div className="rounded-2xl border border-[#e5e7eb] bg-white px-6 py-10 text-center text-[15px] text-[#6b7280]">
            No flights found for the selected filters.
          </div>
        )}
      </section>
    </div>
  );
}