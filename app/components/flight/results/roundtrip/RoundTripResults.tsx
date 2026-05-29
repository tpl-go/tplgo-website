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

type AppliedChip = {
  mode: "domestic" | "international";
  key: string;
  value: string;
  label: string;
};

function ensureArray(value: any) {
  return Array.isArray(value) ? value : [];
}

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
  const departureAirportName = flight.departureAirport || flight.fromCity || "";
  const arrivalAirportName = flight.arrivalAirport || flight.toCity || "";

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
      ? !filters.onwardStops.length ||
        filters.onwardStops.includes(flight.stopType)
      : !filters.returnStops.length ||
        filters.returnStops.includes(flight.stopType);

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
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [mobileActiveLeg, setMobileActiveLeg] = useState<"onward" | "return">(
  "onward"
);

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

  const [intlFilters, setIntlFilters] =
    useState<RoundTripInternationalFiltersValue>(buildInitialIntlFilters());

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
      const matching = [
        ...dynamicDepartureFlights,
        ...dynamicReturnFlights,
      ].filter((flight) => flight.aircraftSize === size);

      return {
        label: size,
        price: matching.length
          ? Math.min(...matching.map((flight) => getMinFarePrice(flight)))
          : undefined,
      };
    });
  }, [dynamicDepartureFlights, dynamicReturnFlights]);

  const appliedChips = useMemo(() => {
    const chips: AppliedChip[] = [];

    if (!isInternational) {
      ensureArray(filters.popularFilters).forEach((item) => {
        chips.push({
          mode: "domestic",
          key: "popularFilters",
          value: item,
          label: item,
        });
      });

      const isPriceCustom =
        filters.priceRange[0] !== priceBounds.min ||
        filters.priceRange[1] !== priceBounds.max;

      if (isPriceCustom) {
        chips.push({
          mode: "domestic",
          key: "priceRange",
          value: "priceRange",
          label: `₹${filters.priceRange[0].toLocaleString(
            "en-IN"
          )} - ₹${filters.priceRange[1].toLocaleString("en-IN")}`,
        });
      }

      ensureArray(filters.onwardStops).forEach((item) => {
        chips.push({
          mode: "domestic",
          key: "onwardStops",
          value: item,
          label: `Onward: ${item}`,
        });
      });

      ensureArray(filters.returnStops).forEach((item) => {
        chips.push({
          mode: "domestic",
          key: "returnStops",
          value: item,
          label: `Return: ${item}`,
        });
      });

      ensureArray(filters.onwardDepartureSlots).forEach((item) => {
        chips.push({
          mode: "domestic",
          key: "onwardDepartureSlots",
          value: item,
          label: `Onward departure: ${item}`,
        });
      });

      ensureArray(filters.onwardArrivalSlots).forEach((item) => {
        chips.push({
          mode: "domestic",
          key: "onwardArrivalSlots",
          value: item,
          label: `Onward arrival: ${item}`,
        });
      });

      ensureArray(filters.returnDepartureSlots).forEach((item) => {
        chips.push({
          mode: "domestic",
          key: "returnDepartureSlots",
          value: item,
          label: `Return departure: ${item}`,
        });
      });

      ensureArray(filters.returnArrivalSlots).forEach((item) => {
        chips.push({
          mode: "domestic",
          key: "returnArrivalSlots",
          value: item,
          label: `Return arrival: ${item}`,
        });
      });

      ensureArray(filters.onwardDepartureAirports).forEach((item) => {
        chips.push({
          mode: "domestic",
          key: "onwardDepartureAirports",
          value: item,
          label: `Onward from: ${item}`,
        });
      });

      ensureArray(filters.onwardArrivalAirports).forEach((item) => {
        chips.push({
          mode: "domestic",
          key: "onwardArrivalAirports",
          value: item,
          label: `Onward to: ${item}`,
        });
      });

      ensureArray(filters.returnDepartureAirports).forEach((item) => {
        chips.push({
          mode: "domestic",
          key: "returnDepartureAirports",
          value: item,
          label: `Return from: ${item}`,
        });
      });

      ensureArray(filters.returnArrivalAirports).forEach((item) => {
        chips.push({
          mode: "domestic",
          key: "returnArrivalAirports",
          value: item,
          label: `Return to: ${item}`,
        });
      });

      ensureArray(filters.airlines).forEach((item) => {
        chips.push({
          mode: "domestic",
          key: "airlines",
          value: item,
          label: item,
        });
      });

      ensureArray(filters.aircraftSizes).forEach((item) => {
        chips.push({
          mode: "domestic",
          key: "aircraftSizes",
          value: item,
          label: item,
        });
      });

      return chips;
    }

    if (intlFilters.hasCheckInBaggage) {
      chips.push({
        mode: "international",
        key: "hasCheckInBaggage",
        value: "hasCheckInBaggage",
        label: "Check-in baggage",
      });
    }

    ensureArray(intlFilters.popularFilters).forEach((item) => {
      chips.push({
        mode: "international",
        key: "popularFilters",
        value: item,
        label: item,
      });
    });

    if (
      intlFilters.maxRoundTripPrice > 0 &&
      intlFilters.maxRoundTripPrice !== intlRoundTripPriceRange.max
    ) {
      chips.push({
        mode: "international",
        key: "maxRoundTripPrice",
        value: "maxRoundTripPrice",
        label: `Max ₹${intlFilters.maxRoundTripPrice.toLocaleString("en-IN")}`,
      });
    }

    ensureArray(intlFilters.onwardStops).forEach((item) => {
      chips.push({
        mode: "international",
        key: "onwardStops",
        value: item,
        label: `Onward: ${item}`,
      });
    });

    if (
      intlFilters.onwardMaxDuration > 0 &&
      intlFilters.onwardMaxDuration !== onwardDurationRange.max
    ) {
      chips.push({
        mode: "international",
        key: "onwardMaxDuration",
        value: "onwardMaxDuration",
        label: `Onward duration ≤ ${intlFilters.onwardMaxDuration} min`,
      });
    }

    ensureArray(intlFilters.onwardDepartureSlots).forEach((item) => {
      chips.push({
        mode: "international",
        key: "onwardDepartureSlots",
        value: item,
        label: `Onward departure: ${item}`,
      });
    });

    ensureArray(intlFilters.onwardArrivalSlots).forEach((item) => {
      chips.push({
        mode: "international",
        key: "onwardArrivalSlots",
        value: item,
        label: `Onward arrival: ${item}`,
      });
    });

    ensureArray(intlFilters.onwardDepartureAirports).forEach((item) => {
      chips.push({
        mode: "international",
        key: "onwardDepartureAirports",
        value: item,
        label: `Onward from: ${item}`,
      });
    });

    ensureArray(intlFilters.onwardArrivalAirports).forEach((item) => {
      chips.push({
        mode: "international",
        key: "onwardArrivalAirports",
        value: item,
        label: `Onward to: ${item}`,
      });
    });

    ensureArray(intlFilters.onwardLayoverAirports).forEach((item) => {
      chips.push({
        mode: "international",
        key: "onwardLayoverAirports",
        value: item,
        label: `Onward layover: ${item}`,
      });
    });

    if (
      intlFilters.onwardMaxLayoverDuration > 0 &&
      intlFilters.onwardMaxLayoverDuration !== onwardLayoverDurationRange.max
    ) {
      chips.push({
        mode: "international",
        key: "onwardMaxLayoverDuration",
        value: "onwardMaxLayoverDuration",
        label: `Onward layover ≤ ${intlFilters.onwardMaxLayoverDuration} min`,
      });
    }

    ensureArray(intlFilters.returnStops).forEach((item) => {
      chips.push({
        mode: "international",
        key: "returnStops",
        value: item,
        label: `Return: ${item}`,
      });
    });

    if (
      intlFilters.returnMaxDuration > 0 &&
      intlFilters.returnMaxDuration !== returnDurationRange.max
    ) {
      chips.push({
        mode: "international",
        key: "returnMaxDuration",
        value: "returnMaxDuration",
        label: `Return duration ≤ ${intlFilters.returnMaxDuration} min`,
      });
    }

    ensureArray(intlFilters.returnDepartureSlots).forEach((item) => {
      chips.push({
        mode: "international",
        key: "returnDepartureSlots",
        value: item,
        label: `Return departure: ${item}`,
      });
    });

    ensureArray(intlFilters.returnArrivalSlots).forEach((item) => {
      chips.push({
        mode: "international",
        key: "returnArrivalSlots",
        value: item,
        label: `Return arrival: ${item}`,
      });
    });

    ensureArray(intlFilters.returnDepartureAirports).forEach((item) => {
      chips.push({
        mode: "international",
        key: "returnDepartureAirports",
        value: item,
        label: `Return from: ${item}`,
      });
    });

    ensureArray(intlFilters.returnArrivalAirports).forEach((item) => {
      chips.push({
        mode: "international",
        key: "returnArrivalAirports",
        value: item,
        label: `Return to: ${item}`,
      });
    });

    ensureArray(intlFilters.returnLayoverAirports).forEach((item) => {
      chips.push({
        mode: "international",
        key: "returnLayoverAirports",
        value: item,
        label: `Return layover: ${item}`,
      });
    });

    if (
      intlFilters.returnMaxLayoverDuration > 0 &&
      intlFilters.returnMaxLayoverDuration !== returnLayoverDurationRange.max
    ) {
      chips.push({
        mode: "international",
        key: "returnMaxLayoverDuration",
        value: "returnMaxLayoverDuration",
        label: `Return layover ≤ ${intlFilters.returnMaxLayoverDuration} min`,
      });
    }

    ensureArray(intlFilters.alliances).forEach((item) => {
      chips.push({
        mode: "international",
        key: "alliances",
        value: item,
        label: item,
      });
    });

    ensureArray(intlFilters.airlines).forEach((item) => {
      chips.push({
        mode: "international",
        key: "airlines",
        value: item,
        label: item,
      });
    });

    ensureArray(intlFilters.aircraftSizes).forEach((item) => {
      chips.push({
        mode: "international",
        key: "aircraftSizes",
        value: item,
        label: item,
      });
    });

    return chips;
  }, [
    isInternational,
    filters,
    intlFilters,
    priceBounds.min,
    priceBounds.max,
    intlRoundTripPriceRange.max,
    onwardDurationRange.max,
    returnDurationRange.max,
    onwardLayoverDurationRange.max,
    returnLayoverDurationRange.max,
  ]);

  const removeAppliedChip = (chip: AppliedChip) => {
    if (chip.mode === "domestic") {
      if (chip.key === "priceRange") {
        setFilters((prev) => ({
          ...prev,
          priceRange: [priceBounds.min, priceBounds.max],
        }));
        return;
      }

      const currentValues = ensureArray((filters as any)[chip.key]);

      setFilters((prev) => ({
        ...prev,
        [chip.key]: currentValues.filter((item) => item !== chip.value),
      }));

      return;
    }

    if (chip.key === "hasCheckInBaggage") {
      setIntlFilters((prev) => ({
        ...prev,
        hasCheckInBaggage: false,
      }));
      return;
    }

    if (chip.key === "maxRoundTripPrice") {
      setIntlFilters((prev) => ({
        ...prev,
        maxRoundTripPrice: intlRoundTripPriceRange.max,
      }));
      return;
    }

    if (chip.key === "onwardMaxDuration") {
      setIntlFilters((prev) => ({
        ...prev,
        onwardMaxDuration: onwardDurationRange.max,
      }));
      return;
    }

    if (chip.key === "returnMaxDuration") {
      setIntlFilters((prev) => ({
        ...prev,
        returnMaxDuration: returnDurationRange.max,
      }));
      return;
    }

    if (chip.key === "onwardMaxLayoverDuration") {
      setIntlFilters((prev) => ({
        ...prev,
        onwardMaxLayoverDuration: onwardLayoverDurationRange.max,
      }));
      return;
    }

    if (chip.key === "returnMaxLayoverDuration") {
      setIntlFilters((prev) => ({
        ...prev,
        returnMaxLayoverDuration: returnLayoverDurationRange.max,
      }));
      return;
    }

    const currentValues = ensureArray((intlFilters as any)[chip.key]);

    setIntlFilters((prev) => ({
      ...prev,
      [chip.key]: currentValues.filter((item) => item !== chip.value),
    }));
  };

  const clearAllAppliedFilters = () => {
    if (!isInternational) {
      setFilters({
        popularFilters: [],
        priceRange: [priceBounds.min, priceBounds.max],

        onwardStops: [],
        onwardDepartureSlots: [],
        onwardArrivalSlots: [],
        onwardDepartureAirports: [],
        onwardArrivalAirports: [],

        returnStops: [],
        returnDepartureSlots: [],
        returnArrivalSlots: [],
        returnDepartureAirports: [],
        returnArrivalAirports: [],

        airlines: [],
        aircraftSizes: [],
      });
      return;
    }

    setIntlFilters({
      hasCheckInBaggage: false,
      popularFilters: [],
      maxRoundTripPrice: intlRoundTripPriceRange.max,

      onwardStops: [],
      onwardMaxDuration: onwardDurationRange.max,
      onwardDepartureSlots: [],
      onwardArrivalSlots: [],
      onwardDepartureAirports: [],
      onwardArrivalAirports: [],
      onwardLayoverAirports: [],
      onwardMaxLayoverDuration: onwardLayoverDurationRange.max,

      returnStops: [],
      returnMaxDuration: returnDurationRange.max,
      returnDepartureSlots: [],
      returnArrivalSlots: [],
      returnDepartureAirports: [],
      returnArrivalAirports: [],
      returnLayoverAirports: [],
      returnMaxLayoverDuration: returnLayoverDurationRange.max,

      alliances: [],
      airlines: [],
      aircraftSizes: [],
    });
  };

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
        !matchesIntlTimeSlots(
          flight.departureTime,
          intlFilters.onwardDepartureSlots
        )
      ) {
        return false;
      }

      if (
        !matchesIntlTimeSlots(
          flight.arrivalTime,
          intlFilters.onwardArrivalSlots
        )
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
        !intlFilters.alliances.includes(
          (flight.alliance || "None") as FlightAlliance
        )
      ) {
        return false;
      }

      if (
        intlFilters.aircraftSizes.length &&
        !intlFilters.aircraftSizes.includes(
          (flight.aircraftSize ||
            "Small / Mid-size aircraft") as FlightAircraftSize
        )
      ) {
        return false;
      }

      return true;
    });
  }, [
    dynamicDepartureFlights,
    dynamicReturnFlights,
    filters,
    isInternational,
    intlFilters,
  ]);

  const filteredReturnFlights = useMemo(() => {
    if (!isInternational) {
      return dynamicReturnFlights.filter((flight) =>
        flightMatchesFilters(flight, filters, "return")
      );
    }

    return dynamicReturnFlights.filter((flight) => {
      const retFare = getMinFarePrice(flight);

      const hasValidRoundTrip = dynamicDepartureFlights.some(
        (departureFlight) => {
          const depFare = getMinFarePrice(departureFlight);
          return depFare + retFare <= intlFilters.maxRoundTripPrice;
        }
      );

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
        !matchesIntlTimeSlots(
          flight.departureTime,
          intlFilters.returnDepartureSlots
        )
      ) {
        return false;
      }

      if (
        !matchesIntlTimeSlots(
          flight.arrivalTime,
          intlFilters.returnArrivalSlots
        )
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
        !intlFilters.alliances.includes(
          (flight.alliance || "None") as FlightAlliance
        )
      ) {
        return false;
      }

      if (
        intlFilters.aircraftSizes.length &&
        !intlFilters.aircraftSizes.includes(
          (flight.aircraftSize ||
            "Small / Mid-size aircraft") as FlightAircraftSize
        )
      ) {
        return false;
      }

      return true;
    });
  }, [
    dynamicDepartureFlights,
    dynamicReturnFlights,
    filters,
    isInternational,
    intlFilters,
  ]);

  const departureTitle = `${fromCity} → ${toCity}${
    resolvedDepartureDate ? ` ${formatColumnDate(resolvedDepartureDate)}` : ""
  }`;

  const returnTitle = `${toCity} → ${fromCity}${
    resolvedReturnDate ? ` ${formatColumnDate(resolvedReturnDate)}` : ""
  }`;

  const handleDepartureFareSelect = (
  flight: RoundTripFlight | null,
  fare: FlightFareOption | null
) => {
  if (!flight || !fare) {
    setSelectedDeparture(null);
    setSelectedDepartureFare(null);
    return;
  }

  if (
    selectedDeparture?.id === flight.id &&
    selectedDepartureFare?.id === fare.id
  ) {
    setSelectedDeparture(null);
    setSelectedDepartureFare(null);
    return;
  }

  setSelectedDeparture(flight);
  setSelectedDepartureFare(fare);
  setMobileActiveLeg("return");

  if (typeof window !== "undefined" && window.innerWidth < 1024) {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
};

  const handleReturnFareSelect = (
    flight: RoundTripFlight | null,
    fare: FlightFareOption | null
  ) => {
    if (!flight || !fare) {
      setSelectedReturn(null);
      setSelectedReturnFare(null);
      return;
    }

    if (selectedReturn?.id === flight.id && selectedReturnFare?.id === fare.id) {
      setSelectedReturn(null);
      setSelectedReturnFare(null);
      return;
    }

    setSelectedReturn(flight);
    setSelectedReturnFare(fare);
  };

  const filterPanel = isInternational ? (
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
  );

  return (
    <div className="mx-auto w-full max-w-8xl overflow-x-hidden px-3 py-3 pb-[210px] sm:px-4 sm:pb-[210px] md:overflow-visible xl:pb-[150px]">
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-[300px_minmax(0,1fr)]">
        <div className="hidden xl:sticky xl:top-[82px] xl:block xl:h-fit xl:self-start">
          {filterPanel}
        </div>

        <div className="min-w-0">
          <div className="mb-2.5 space-y-2.5 md:mb-3 md:space-y-3">
            <div className="sticky top-0 z-30 -mx-3 border-b border-[#e5edf6] bg-[#eef3f8]/95 px-3 py-2 backdrop-blur md:hidden">
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
                    {fromCity} ⇄ {toCity}
                  </div>
                  <div className="mt-0.5 text-[11px] font-semibold text-[#64748b]">
                    Round trip ·{" "}
                    {filteredDepartureFlights.length +
                      filteredReturnFlights.length}{" "}
                    flights
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

            <div className="hidden md:block">
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

            <div className="space-y-2 md:hidden">
              <button
                type="button"
                onClick={() => setShowMobileFilters(true)}
                className="flex h-10 w-full items-center justify-between rounded-xl border border-[#d9e2ef] bg-white px-3.5 text-[12px] font-black text-[#111827] shadow-sm"
              >
                <span>Filters</span>
                <span className="rounded-full bg-[#eef7ff] px-3 py-1 text-[12px] font-extrabold text-[#0b66c3]">
                  {filteredDepartureFlights.length +
                    filteredReturnFlights.length}{" "}
                  Flights
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
                      onClick={clearAllAppliedFilters}
                      className="text-[12px] font-extrabold text-[#2563eb]"
                    >
                      Clear All
                    </button>
                  </div>

                  <div className="flex gap-2 overflow-x-auto overflow-y-hidden pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {appliedChips.map((chip) => (
                      <div
                        key={`${chip.mode}-${chip.key}-${chip.value}`}
                        className="flex shrink-0 items-center gap-2 rounded-full bg-[#e0f2fe] px-3 py-2 text-[12px] font-bold text-[#0f172a]"
                      >
                        <span>{chip.label}</span>

                        <button
                          type="button"
                          onClick={() => removeAppliedChip(chip)}
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
          </div>

          <div className="lg:hidden">
            <div className="mb-2.5 grid grid-cols-2 rounded-2xl border border-[#d9e2ef] bg-white p-1 shadow-sm">
              <button
                type="button"
                onClick={() => setMobileActiveLeg("onward")}
                className={`rounded-xl px-3 py-2 text-[12px] font-extrabold transition ${
                  mobileActiveLeg === "onward"
                    ? "bg-[#0f172a] text-white"
                    : "text-[#475569]"
                }`}
              >
                Onward
                {selectedDeparture ? " ✓" : ""}
              </button>

              <button
                type="button"
                onClick={() => setMobileActiveLeg("return")}
                className={`rounded-xl px-3 py-2 text-[12px] font-extrabold transition ${
                  mobileActiveLeg === "return"
                    ? "bg-[#0f172a] text-white"
                    : "text-[#475569]"
                }`}
              >
                Return
                {selectedReturn ? " ✓" : ""}
              </button>
            </div>

            {mobileActiveLeg === "onward" ? (
              <RoundTripFlightColumn
                title={departureTitle}
                subtitle=""
                flights={filteredDepartureFlights}
                selectedFlight={selectedDeparture}
                selectedFareId={selectedDepartureFare?.id}
                onSelect={setSelectedDeparture}
                onFareSelect={handleDepartureFareSelect}
              />
            ) : (
              <RoundTripFlightColumn
                title={returnTitle}
                subtitle=""
                flights={filteredReturnFlights}
                selectedFlight={selectedReturn}
                selectedFareId={selectedReturnFare?.id}
                onSelect={setSelectedReturn}
                onFareSelect={handleReturnFareSelect}
              />
            )}
          </div>

<div className="hidden gap-3 lg:grid lg:grid-cols-2">
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
  <div className="fixed bottom-3 left-0 right-0 z-[70] px-3 sm:px-4">
    <div className="mx-auto grid w-full max-w-8xl grid-cols-1 gap-3 xl:grid-cols-[300px_minmax(0,1fr)]">
      <div className="hidden xl:block" />

      <div className="min-w-0">
        <RoundTripStickySummary
          departure={selectedDeparture}
          returnFlight={selectedReturn}
          departureFare={selectedDepartureFare}
          returnFare={selectedReturnFare}
        />
      </div>
    </div>
  </div>
)}
        </div>
      </div>

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
                  {fromCity} ⇄ {toCity}
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
                Show{" "}
                {filteredDepartureFlights.length + filteredReturnFlights.length}{" "}
                Flights
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
