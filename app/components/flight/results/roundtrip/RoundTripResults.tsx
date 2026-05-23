"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  FlightFareOption,
  FlightAlliance,
  FlightAircraftSize,
  roundTripDepartureFlights,
  roundTripReturnFlights,
  RoundTripFlight,
} from "@/app/components/flight/data/roundtripFlights";
import RoundTripFlightColumn from "./RoundTripFlightColumn";
import RoundTripStickySummary from "./RoundTripStickySummary";
import RoundTripDomesticFilters from "./filters/RoundTripDomesticFilters";
import RoundTripInternationalFilters, {
  RoundTripInternationalFiltersValue,
  TimeSlot,
} from "./filters/RoundTripInternationalFilters";
import FlightsResultHeader from "../common/FlightsResultHeader";


type RoundTripResultsProps = {
  fromCity: string;
  toCity: string;
  departureDate?: string;
  returnDate?: string;
  isInternational?: boolean;
};

export type RoundTripFiltersState = {
  popularFilters: string[];
  priceRange: [number, number];

  onwardStops: string[];
  onwardDepartureSlots: string[];
  onwardArrivalSlots: string[];
  onwardDepartureAirports: string[];
  onwardArrivalAirports: string[];

  returnStops: string[];
  returnDepartureSlots: string[];
  returnArrivalSlots: string[];
  returnDepartureAirports: string[];
  returnArrivalAirports: string[];

  airlines: string[];
  aircraftSizes: string[];
};

function getCityCode(city: string) {
  const normalized = city.trim().toLowerCase();

  const codeMap: Record<string, string> = {
    "new delhi": "DEL",
    delhi: "DEL",
    mumbai: "BOM",
    bengaluru: "BLR",
    bangalore: "BLR",
    goa: "GOI",
    hyderabad: "HYD",
    chennai: "MAA",
    kolkata: "CCU",
    pune: "PNQ",
    ahmedabad: "AMD",
    jaipur: "JAI",
    singapore: "SIN",
    london: "LHR",
    dubai: "DXB",
    "new york": "JFK",
    bangkok: "BKK",
  };

  return codeMap[normalized] || city.slice(0, 3).toUpperCase();
}

function mapFlightForRoute(
  flight: RoundTripFlight,
  fromCity: string,
  toCity: string
): RoundTripFlight {
  return {
    ...flight,
    fromCity,
    toCity,
    fromCode: getCityCode(fromCity),
    toCode: getCityCode(toCity),
  };
}

function formatColumnDate(date?: string) {
  if (!date) return "";

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "";

  return parsed.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

function getMinutesFromTime(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function matchesTimeSlots(time: string, slots: string[]) {
  if (!slots.length) return true;

  const minutes = getMinutesFromTime(time);

  return slots.some((slot) => {
    if (slot === "Before 6 AM") return minutes < 360;
    if (slot === "6 AM to 12 PM") return minutes >= 360 && minutes < 720;
    if (slot === "12 PM to 6 PM") return minutes >= 720 && minutes < 1080;
    if (slot === "After 6 PM") return minutes >= 1080;
    return true;
  });
}

function matchesIntlTimeSlots(time: string, slots: TimeSlot[]) {
  if (!slots.length) return true;

  const minutes = getMinutesFromTime(time);

  return slots.some((slot) => {
    if (slot === "Before 6 AM") return minutes < 360;
    if (slot === "6 AM to 12 PM") return minutes >= 360 && minutes < 720;
    if (slot === "12 PM to 6 PM") return minutes >= 720 && minutes < 1080;
    if (slot === "After 6 PM") return minutes >= 1080;
    return true;
  });
}

function normalizeAircraftSize(duration: string) {
  const hasLongDuration =
    duration.includes("03h") ||
    duration.includes("04h") ||
    duration.includes("05h");

  return hasLongDuration ? "Large Aircraft" : "Small / Mid-size aircraft";
}

function matchesPopularFilters(
  flight: RoundTripFlight,
  selectedPopularFilters: string[]
) {
  if (!selectedPopularFilters.length) return true;

  const wantsNonStop = selectedPopularFilters.includes("Non Stop");
  const wantsRefundable = selectedPopularFilters.includes("Refundable Fares");

  const selectedPopularAirlines = selectedPopularFilters.filter(
    (item) =>
      item !== "Non Stop" &&
      item !== "Hide Nearby Airports" &&
      item !== "Refundable Fares"
  );

  const nonStopPass = !wantsNonStop || flight.stopType === "Non Stop";
  const refundablePass =
    !wantsRefundable ||
    (flight.fareOptions || []).some((fare) => fare.refundable);

  const airlinePass =
    !selectedPopularAirlines.length ||
    selectedPopularAirlines.includes(flight.airline);

  return nonStopPass && refundablePass && airlinePass;
}

function flightMatchesAirports(
  flight: RoundTripFlight,
  departureAirports: string[],
  arrivalAirports: string[]
) {
  const departureAirportName =
    flight.departureAirport || flight.fromCity || "";
  const arrivalAirportName =
    flight.arrivalAirport || flight.toCity || "";

  const departurePass =
    !departureAirports.length ||
    departureAirports.includes(departureAirportName) ||
    departureAirports.some((airport) =>
      departureAirportName.toLowerCase().includes(airport.toLowerCase())
    );

  const arrivalPass =
    !arrivalAirports.length ||
    arrivalAirports.includes(arrivalAirportName) ||
    arrivalAirports.some((airport) =>
      arrivalAirportName.toLowerCase().includes(airport.toLowerCase())
    );

  return departurePass && arrivalPass;
}

function flightMatchesFilters(
  flight: RoundTripFlight,
  filters: RoundTripFiltersState,
  type: "onward" | "return"
) {
  const pricePass =
    flight.price >= filters.priceRange[0] &&
    flight.price <= filters.priceRange[1];

  const stopPass =
    type === "onward"
      ? !filters.onwardStops.length || filters.onwardStops.includes(flight.stopType)
      : !filters.returnStops.length || filters.returnStops.includes(flight.stopType);

  const departureTimePass =
    type === "onward"
      ? matchesTimeSlots(flight.departureTime, filters.onwardDepartureSlots)
      : matchesTimeSlots(flight.departureTime, filters.returnDepartureSlots);

  const arrivalTimePass =
    type === "onward"
      ? matchesTimeSlots(flight.arrivalTime, filters.onwardArrivalSlots)
      : matchesTimeSlots(flight.arrivalTime, filters.returnArrivalSlots);

  const airportsPass =
    type === "onward"
      ? flightMatchesAirports(
          flight,
          filters.onwardDepartureAirports,
          filters.onwardArrivalAirports
        )
      : flightMatchesAirports(
          flight,
          filters.returnDepartureAirports,
          filters.returnArrivalAirports
        );

  const airlinePass =
    !filters.airlines.length || filters.airlines.includes(flight.airline);

  const aircraftPass =
    !filters.aircraftSizes.length ||
    filters.aircraftSizes.includes(
      (flight.aircraftSize as string) || normalizeAircraftSize(flight.duration)
    );

  const popularPass = matchesPopularFilters(flight, filters.popularFilters);

  return (
    pricePass &&
    stopPass &&
    departureTimePass &&
    arrivalTimePass &&
    airportsPass &&
    airlinePass &&
    aircraftPass &&
    popularPass
  );
}

function getMinFarePrice(flight: RoundTripFlight) {
  if (!flight.fareOptions?.length) return flight.price;
  return Math.min(...flight.fareOptions.map((fare) => fare.price));
}

function getOptionPriceByStop(flights: RoundTripFlight[], stop: string) {
  const matched = flights.filter((flight) => flight.stopType === stop);
  if (!matched.length) return undefined;
  return Math.min(...matched.map((flight) => getMinFarePrice(flight)));
}

function getMinMax(values: number[]) {
  if (!values.length) return { min: 0, max: 0 };
  return {
    min: Math.min(...values),
    max: Math.max(...values),
  };
}

const buildInitialIntlFilters = (): RoundTripInternationalFiltersValue => ({
  hasCheckInBaggage: false,
  popularFilters: [],
  maxRoundTripPrice: 0,

  onwardStops: [],
  onwardMaxDuration: 0,
  onwardDepartureSlots: [],
  onwardArrivalSlots: [],
  onwardDepartureAirports: [],
  onwardArrivalAirports: [],
  onwardLayoverAirports: [],
  onwardMaxLayoverDuration: 0,

  returnStops: [],
  returnMaxDuration: 0,
  returnDepartureSlots: [],
  returnArrivalSlots: [],
  returnDepartureAirports: [],
  returnArrivalAirports: [],
  returnLayoverAirports: [],
  returnMaxLayoverDuration: 0,

  alliances: [],
  airlines: [],
  aircraftSizes: [],
});

export default function RoundTripResults({
  fromCity,
  toCity,
  departureDate,
  returnDate,
  isInternational = false,
}: RoundTripResultsProps) {

const searchParams = useSearchParams();

const resolvedDepartureDate =
  departureDate ||
  searchParams.get("departure") ||
  searchParams.get("departureDate") ||
  "";

const resolvedReturnDate =
  returnDate ||
  searchParams.get("returnDate") ||
  searchParams.get("return") ||
  "";
  const [selectedDeparture, setSelectedDeparture] =
    useState<RoundTripFlight | null>(null);
  const [selectedReturn, setSelectedReturn] =
    useState<RoundTripFlight | null>(null);

  const [selectedDepartureFare, setSelectedDepartureFare] =
    useState<FlightFareOption | null>(null);
  const [selectedReturnFare, setSelectedReturnFare] =
    useState<FlightFareOption | null>(null);

  const [filters, setFilters] = useState<RoundTripFiltersState>({
    popularFilters: ["Non Stop"],
    priceRange: [0, 999999],

    onwardStops: ["Non Stop"],
    onwardDepartureSlots: [],
    onwardArrivalSlots: [],
    onwardDepartureAirports: [],
    onwardArrivalAirports: [],

    returnStops: ["Non Stop"],
    returnDepartureSlots: [],
    returnArrivalSlots: [],
    returnDepartureAirports: [],
    returnArrivalAirports: [],

    airlines: [],
    aircraftSizes: [],
  });

  const [intlFilters, setIntlFilters] = useState<RoundTripInternationalFiltersValue>(
    buildInitialIntlFilters()
  );

  const dynamicDepartureFlights = useMemo(() => {
    return roundTripDepartureFlights.map((flight) =>
      mapFlightForRoute(flight, fromCity, toCity)
    );
  }, [fromCity, toCity]);

  const dynamicReturnFlights = useMemo(() => {
    return roundTripReturnFlights.map((flight) =>
      mapFlightForRoute(flight, toCity, fromCity)
    );
  }, [fromCity, toCity]);

  const priceBounds = useMemo(() => {
    const allPrices = [...dynamicDepartureFlights, ...dynamicReturnFlights].map(
      (flight) => flight.price
    );

    const min = Math.min(...allPrices);
    const max = Math.max(...allPrices);

    return { min, max };
  }, [dynamicDepartureFlights, dynamicReturnFlights]);

  useEffect(() => {
    if (filters.priceRange[0] === 0 && filters.priceRange[1] === 999999) {
      setFilters((prev) => ({
        ...prev,
        priceRange: [priceBounds.min, priceBounds.max],
      }));
    }
  }, [priceBounds.min, priceBounds.max, filters.priceRange]);

  const intlRoundTripPrices = useMemo(() => {
    const all: number[] = [];

    dynamicDepartureFlights.forEach((dep) => {
      dynamicReturnFlights.forEach((ret) => {
        all.push(getMinFarePrice(dep) + getMinFarePrice(ret));
      });
    });

    return all;
  }, [dynamicDepartureFlights, dynamicReturnFlights]);

  const intlRoundTripPriceRange = useMemo(
    () => getMinMax(intlRoundTripPrices),
    [intlRoundTripPrices]
  );

  const onwardDurationRange = useMemo(
    () =>
      getMinMax(
        dynamicDepartureFlights.map((flight) => flight.durationMinutes || 0)
      ),
    [dynamicDepartureFlights]
  );

  const returnDurationRange = useMemo(
    () =>
      getMinMax(
        dynamicReturnFlights.map((flight) => flight.durationMinutes || 0)
      ),
    [dynamicReturnFlights]
  );

  const onwardLayoverDurationRange = useMemo(
    () =>
      getMinMax(
        dynamicDepartureFlights
          .filter((flight) => flight.stopType !== "Non Stop")
          .map((flight) => flight.layoverDurationMinutes || 0)
      ),
    [dynamicDepartureFlights]
  );

  const returnLayoverDurationRange = useMemo(
    () =>
      getMinMax(
        dynamicReturnFlights
          .filter((flight) => flight.stopType !== "Non Stop")
          .map((flight) => flight.layoverDurationMinutes || 0)
      ),
    [dynamicReturnFlights]
  );

  useEffect(() => {
    if (!isInternational) return;

    setIntlFilters((prev) => {
      const isInitial =
        prev.maxRoundTripPrice === 0 &&
        prev.onwardMaxDuration === 0 &&
        prev.returnMaxDuration === 0;

      if (!isInitial) return prev;

      return {
        ...prev,
        maxRoundTripPrice: intlRoundTripPriceRange.max,
        onwardMaxDuration: onwardDurationRange.max,
        returnMaxDuration: returnDurationRange.max,
        onwardMaxLayoverDuration: onwardLayoverDurationRange.max,
        returnMaxLayoverDuration: returnLayoverDurationRange.max,
      };
    });
  }, [
    isInternational,
    intlRoundTripPriceRange.max,
    onwardDurationRange.max,
    returnDurationRange.max,
    onwardLayoverDurationRange.max,
    returnLayoverDurationRange.max,
  ]);

  const onwardDepartureAirportOptions = useMemo(
    () =>
      Array.from(
        new Set(
          dynamicDepartureFlights.map(
            (flight) => flight.departureAirport || flight.fromCity
          )
        )
      ),
    [dynamicDepartureFlights]
  );

  const onwardArrivalAirportOptions = useMemo(
    () =>
      Array.from(
        new Set(
          dynamicDepartureFlights.map(
            (flight) => flight.arrivalAirport || flight.toCity
          )
        )
      ),
    [dynamicDepartureFlights]
  );

  const returnDepartureAirportOptions = useMemo(
    () =>
      Array.from(
        new Set(
          dynamicReturnFlights.map(
            (flight) => flight.departureAirport || flight.fromCity
          )
        )
      ),
    [dynamicReturnFlights]
  );

  const returnArrivalAirportOptions = useMemo(
    () =>
      Array.from(
        new Set(
          dynamicReturnFlights.map(
            (flight) => flight.arrivalAirport || flight.toCity
          )
        )
      ),
    [dynamicReturnFlights]
  );

  const onwardLayoverAirportOptions = useMemo(() => {
    const allLayovers = Array.from(
      new Set(
        dynamicDepartureFlights.flatMap((flight) => flight.layoverAirports || [])
      )
    );

    return allLayovers.map((airport) => {
      const matching = dynamicDepartureFlights.filter((flight) =>
        (flight.layoverAirports || []).includes(airport)
      );
      return {
        label: airport,
        price: matching.length
          ? Math.min(...matching.map((flight) => getMinFarePrice(flight)))
          : undefined,
      };
    });
  }, [dynamicDepartureFlights]);

  const returnLayoverAirportOptions = useMemo(() => {
    const allLayovers = Array.from(
      new Set(
        dynamicReturnFlights.flatMap((flight) => flight.layoverAirports || [])
      )
    );

    return allLayovers.map((airport) => {
      const matching = dynamicReturnFlights.filter((flight) =>
        (flight.layoverAirports || []).includes(airport)
      );
      return {
        label: airport,
        price: matching.length
          ? Math.min(...matching.map((flight) => getMinFarePrice(flight)))
          : undefined,
      };
    });
  }, [dynamicReturnFlights]);

  const airlineOptions = useMemo(() => {
    const priceMap = new Map<string, number>();

    [...dynamicDepartureFlights, ...dynamicReturnFlights].forEach((flight) => {
      const current = priceMap.get(flight.airline);
      const price = getMinFarePrice(flight);

      if (typeof current !== "number" || price < current) {
        priceMap.set(flight.airline, price);
      }
    });

    return Array.from(priceMap.entries()).map(([label, price]) => ({
      label,
      price,
    }));
  }, [dynamicDepartureFlights, dynamicReturnFlights]);

  const aircraftSizeOptions = useMemo(() => {
    const allSizes: FlightAircraftSize[] = [
      "Small / Mid-size aircraft",
      "Large Aircraft",
    ];

    return allSizes.map((size) => {
      const matching = [...dynamicDepartureFlights, ...dynamicReturnFlights].filter(
        (flight) => flight.aircraftSize === size
      );

      return {
        label: size,
        price: matching.length
          ? Math.min(...matching.map((flight) => getMinFarePrice(flight)))
          : undefined,
      };
    });
  }, [dynamicDepartureFlights, dynamicReturnFlights]);

  const filteredDepartureFlights = useMemo(() => {
    if (!isInternational) {
      return dynamicDepartureFlights.filter((flight) =>
        flightMatchesFilters(flight, filters, "onward")
      );
    }

    return dynamicDepartureFlights.filter((flight) => {
      const depFare = getMinFarePrice(flight);

      const hasValidRoundTrip = dynamicReturnFlights.some((returnFlight) => {
        const retFare = getMinFarePrice(returnFlight);
        return depFare + retFare <= intlFilters.maxRoundTripPrice;
      });

      if (!hasValidRoundTrip) return false;

      if (
        intlFilters.popularFilters.includes("Non Stop") &&
        flight.stopType !== "Non Stop"
      ) {
        return false;
      }

      if (
        intlFilters.popularFilters.includes("Hide Nearby Airports") &&
        flight.nearbyDepartureAirports &&
        flight.nearbyDepartureAirports.length > 1
      ) {
        const isNearby =
          flight.departureAirport &&
          flight.departureAirport !== flight.nearbyDepartureAirports[0];
        if (isNearby) return false;
      }

      if (
        intlFilters.popularFilters.includes("Refundable Fares") &&
        flight.refundableType === "Non Refundable"
      ) {
        return false;
      }

      if (intlFilters.hasCheckInBaggage && !flight.hasCheckInBaggage) {
        return false;
      }

      if (
        intlFilters.onwardStops.length &&
        !intlFilters.onwardStops.includes(flight.stopType)
      ) {
        return false;
      }

      if ((flight.durationMinutes || 0) > intlFilters.onwardMaxDuration) {
        return false;
      }

      if (
        !matchesIntlTimeSlots(flight.departureTime, intlFilters.onwardDepartureSlots)
      ) {
        return false;
      }

      if (
        !matchesIntlTimeSlots(flight.arrivalTime, intlFilters.onwardArrivalSlots)
      ) {
        return false;
      }

      if (
        intlFilters.onwardDepartureAirports.length &&
        !intlFilters.onwardDepartureAirports.includes(
          flight.departureAirport || ""
        )
      ) {
        return false;
      }

      if (
        intlFilters.onwardArrivalAirports.length &&
        !intlFilters.onwardArrivalAirports.includes(flight.arrivalAirport || "")
      ) {
        return false;
      }

      if (
        intlFilters.onwardLayoverAirports.length &&
        !intlFilters.onwardLayoverAirports.some((airport) =>
          (flight.layoverAirports || []).includes(airport)
        )
      ) {
        return false;
      }

      if (
        flight.stopType !== "Non Stop" &&
        (flight.layoverDurationMinutes || 0) >
          intlFilters.onwardMaxLayoverDuration
      ) {
        return false;
      }

      if (
        intlFilters.airlines.length &&
        !intlFilters.airlines.includes(flight.airline)
      ) {
        return false;
      }

      if (
        intlFilters.alliances.length &&
        !intlFilters.alliances.includes((flight.alliance || "None") as FlightAlliance)
      ) {
        return false;
      }

      if (
        intlFilters.aircraftSizes.length &&
        !intlFilters.aircraftSizes.includes(
          (flight.aircraftSize || "Small / Mid-size aircraft") as FlightAircraftSize
        )
      ) {
        return false;
      }

      return true;
    });
  }, [dynamicDepartureFlights, dynamicReturnFlights, filters, isInternational, intlFilters]);

  const filteredReturnFlights = useMemo(() => {
    if (!isInternational) {
      return dynamicReturnFlights.filter((flight) =>
        flightMatchesFilters(flight, filters, "return")
      );
    }

    return dynamicReturnFlights.filter((flight) => {
      const retFare = getMinFarePrice(flight);

      const hasValidRoundTrip = dynamicDepartureFlights.some((departureFlight) => {
        const depFare = getMinFarePrice(departureFlight);
        return depFare + retFare <= intlFilters.maxRoundTripPrice;
      });

      if (!hasValidRoundTrip) return false;

      if (
        intlFilters.popularFilters.includes("Non Stop") &&
        flight.stopType !== "Non Stop"
      ) {
        return false;
      }

      if (
        intlFilters.popularFilters.includes("Hide Nearby Airports") &&
        flight.nearbyDepartureAirports &&
        flight.nearbyDepartureAirports.length > 1
      ) {
        const isNearby =
          flight.departureAirport &&
          flight.departureAirport !== flight.nearbyDepartureAirports[0];
        if (isNearby) return false;
      }

      if (
        intlFilters.popularFilters.includes("Refundable Fares") &&
        flight.refundableType === "Non Refundable"
      ) {
        return false;
      }

      if (intlFilters.hasCheckInBaggage && !flight.hasCheckInBaggage) {
        return false;
      }

      if (
        intlFilters.returnStops.length &&
        !intlFilters.returnStops.includes(flight.stopType)
      ) {
        return false;
      }

      if ((flight.durationMinutes || 0) > intlFilters.returnMaxDuration) {
        return false;
      }

      if (
        !matchesIntlTimeSlots(flight.departureTime, intlFilters.returnDepartureSlots)
      ) {
        return false;
      }

      if (
        !matchesIntlTimeSlots(flight.arrivalTime, intlFilters.returnArrivalSlots)
      ) {
        return false;
      }

      if (
        intlFilters.returnDepartureAirports.length &&
        !intlFilters.returnDepartureAirports.includes(
          flight.departureAirport || ""
        )
      ) {
        return false;
      }

      if (
        intlFilters.returnArrivalAirports.length &&
        !intlFilters.returnArrivalAirports.includes(flight.arrivalAirport || "")
      ) {
        return false;
      }

      if (
        intlFilters.returnLayoverAirports.length &&
        !intlFilters.returnLayoverAirports.some((airport) =>
          (flight.layoverAirports || []).includes(airport)
        )
      ) {
        return false;
      }

      if (
        flight.stopType !== "Non Stop" &&
        (flight.layoverDurationMinutes || 0) >
          intlFilters.returnMaxLayoverDuration
      ) {
        return false;
      }

      if (
        intlFilters.airlines.length &&
        !intlFilters.airlines.includes(flight.airline)
      ) {
        return false;
      }

      if (
        intlFilters.alliances.length &&
        !intlFilters.alliances.includes((flight.alliance || "None") as FlightAlliance)
      ) {
        return false;
      }

      if (
        intlFilters.aircraftSizes.length &&
        !intlFilters.aircraftSizes.includes(
          (flight.aircraftSize || "Small / Mid-size aircraft") as FlightAircraftSize
        )
      ) {
        return false;
      }

      return true;
    });
  }, [dynamicDepartureFlights, dynamicReturnFlights, filters, isInternational, intlFilters]);

  const departureTitle = `${fromCity} → ${toCity}${
  resolvedDepartureDate
    ? ` ${formatColumnDate(resolvedDepartureDate)}`
    : ""
}`;

const returnTitle = `${toCity} → ${fromCity}${
  resolvedReturnDate
    ? ` ${formatColumnDate(resolvedReturnDate)}`
    : ""
}`;

  const handleDepartureFareSelect = (
    flight: RoundTripFlight,
    fare: FlightFareOption
  ) => {
    setSelectedDeparture(flight);
    setSelectedDepartureFare(fare);
  };

  const handleReturnFareSelect = (
    flight: RoundTripFlight,
    fare: FlightFareOption
  ) => {
    setSelectedReturn(flight);
    setSelectedReturnFare(fare);
  };

  return (
    <div className="mx-auto max-w-8xl px-4 py-4 pb-12">
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-[300px_minmax(0,1fr)]">
        <div className="sticky top-[82px] h-fit self-start">
  {isInternational ? (
    <RoundTripInternationalFilters
      filters={intlFilters}
      onChange={setIntlFilters}
      fromCity={fromCity}
      toCity={toCity}
      minRoundTripPrice={intlRoundTripPriceRange.min}
      maxRoundTripPrice={intlRoundTripPriceRange.max}
      minOnwardDuration={onwardDurationRange.min}
      maxOnwardDuration={onwardDurationRange.max}
      minReturnDuration={returnDurationRange.min}
      maxReturnDuration={returnDurationRange.max}
      minOnwardLayoverDuration={onwardLayoverDurationRange.min}
      maxOnwardLayoverDuration={onwardLayoverDurationRange.max}
      minReturnLayoverDuration={returnLayoverDurationRange.min}
      maxReturnLayoverDuration={returnLayoverDurationRange.max}
      onwardStopOptions={[
        {
          label: "Non Stop",
          price: getOptionPriceByStop(dynamicDepartureFlights, "Non Stop"),
        },
        {
          label: "1 Stop",
          price: getOptionPriceByStop(dynamicDepartureFlights, "1 Stop"),
        },
        {
          label: "2+ Stops",
          price: getOptionPriceByStop(dynamicDepartureFlights, "2+ Stops"),
        },
      ]}
      returnStopOptions={[
        {
          label: "Non Stop",
          price: getOptionPriceByStop(dynamicReturnFlights, "Non Stop"),
        },
        {
          label: "1 Stop",
          price: getOptionPriceByStop(dynamicReturnFlights, "1 Stop"),
        },
        {
          label: "2+ Stops",
          price: getOptionPriceByStop(dynamicReturnFlights, "2+ Stops"),
        },
      ]}
      onwardDepartureAirportOptions={onwardDepartureAirportOptions}
      onwardArrivalAirportOptions={onwardArrivalAirportOptions}
      onwardLayoverAirportOptions={onwardLayoverAirportOptions}
      returnDepartureAirportOptions={returnDepartureAirportOptions}
      returnArrivalAirportOptions={returnArrivalAirportOptions}
      returnLayoverAirportOptions={returnLayoverAirportOptions}
      airlineOptions={airlineOptions}
      aircraftSizeOptions={aircraftSizeOptions}
    />
  ) : (
    <RoundTripDomesticFilters
      filters={filters}
      onFiltersChange={setFilters}
      fromCity={fromCity}
      toCity={toCity}
      minPrice={priceBounds.min}
      maxPrice={priceBounds.max}
    />
  )}
</div>

        <div className="min-w-0">
          <div className="mb-3 space-y-3">
            <FlightsResultHeader
  tripType="roundtrip"
  segments={[
    {
      fromCity,
      toCity,
      departure: resolvedDepartureDate,
    },
    {
      fromCity: toCity,
      toCity: fromCity,
      departure: resolvedReturnDate,
    },
  ]}
/>

            
          </div>

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            <RoundTripFlightColumn
              title={departureTitle}
              subtitle=""
              
              flights={filteredDepartureFlights}
              selectedFlight={selectedDeparture}
              selectedFareId={selectedDepartureFare?.id}
              onSelect={setSelectedDeparture}
              onFareSelect={handleDepartureFareSelect}
            />

            <RoundTripFlightColumn
              title={returnTitle}
              subtitle=""
              
              flights={filteredReturnFlights}
              selectedFlight={selectedReturn}
              selectedFareId={selectedReturnFare?.id}
              onSelect={setSelectedReturn}
              onFareSelect={handleReturnFareSelect}
            />
          </div>

          {(selectedDeparture || selectedReturn) && (
  <RoundTripStickySummary
    departure={selectedDeparture}
    returnFlight={selectedReturn}
    departureFare={selectedDepartureFare}
    returnFare={selectedReturnFare}
  />
)}
        </div>
      </div>
    </div>
  );
}