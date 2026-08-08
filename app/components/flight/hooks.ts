"use client";

import { useMemo, useReducer } from "react";
import { useSearchParams } from "next/navigation";
import { AIRPORTS } from "./utils";

export type TripType = "oneway" | "roundtrip" | "multicity";

export type Airport = {
  code: string;
  city: string;
  name: string;
  country: string;
};

export type Segment = {
  from: Airport | null;
  to: Airport | null;
  departure: Date | null;
};

export type TravellerState = {
  adults: number;
  children: number;
  infants: number;
  cabin: string;
};

export type FlightState = {
  tripType: TripType;
  segments: Segment[];
  returnDate: Date | null;
  fareType: string;
  travellers: TravellerState;
};

function getDefaultAirport(code: string): Airport | null {
  return AIRPORTS.find((airport) => airport.code === code) ?? null;
}

function getTodayDate(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

export const initialFlightState: FlightState = {
  tripType: "oneway",
  segments: [
    {
      from: getDefaultAirport("DEL"),
      to: getDefaultAirport("BOM"),
      departure: getTodayDate(),
    },
  ],
  returnDate: null,
  fareType: "Regular",
  travellers: {
    adults: 1,
    children: 0,
    infants: 0,
    cabin: "Economy",
  },
};

export function flightSearchReducer(
  state: FlightState,
  action: any
): FlightState {
  switch (action.type) {
    case "SET_TRIP_TYPE":
      return {
        ...state,
        tripType: action.payload,
        returnDate: action.payload === "roundtrip" ? state.returnDate : null,
        segments:
          action.payload === "multicity"
            ? state.segments.length
              ? state.segments
              : [
                  {
                    from: null,
                    to: null,
                    departure: null,
                  },
                ]
            : [state.segments[0]],
      };

    case "SET_SEGMENT_FIELD": {
      const updatedSegments = [...state.segments];
      updatedSegments[action.index] = {
        ...updatedSegments[action.index],
        [action.field]: action.value,
      };

      if (
        action.field === "to" &&
        state.tripType === "multicity" &&
        updatedSegments[action.index + 1]
      ) {
        updatedSegments[action.index + 1] = {
          ...updatedSegments[action.index + 1],
          from: action.value,
        };
      }

      return { ...state, segments: updatedSegments };
    }

    case "ADD_SEGMENT":
      if (state.segments.length >= 5) return state;

      const lastSeg = state.segments[state.segments.length - 1];

      return {
        ...state,
        segments: [
          ...state.segments,
          {
            from: lastSeg?.to ?? null,
            to: null,
            departure: null,
          },
        ],
      };

    case "REMOVE_SEGMENT":
      if (state.segments.length <= 1) return state;

      return {
        ...state,
        segments: state.segments.filter((_: any, i: number) => i !== action.index),
      };

    case "SET_RETURN":
      return { ...state, returnDate: action.payload };

    case "SET_FARE":
      return { ...state, fareType: action.payload };

    case "SET_TRAVELLERS":
      return {
        ...state,
        travellers: {
          ...state.travellers,
          ...action.payload,
        },
      };

    default:
      return state;
  }
}

function getAirportFromParams(code: string | null, city: string | null) {
  if (!code) return null;

  const matched = AIRPORTS.find((a) => a.code === code);
  if (matched) return matched;

  return {
    code,
    city: city || code,
    name: city || code,
    country: "",
  };
}

function parseDate(dateStr: string | null) {
  if (!dateStr) return null;
  const parsed = new Date(dateStr);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function buildMultiCitySegmentsFromParams(
  searchParams: URLSearchParams
): Segment[] {
  const segments: Segment[] = [];

  for (let i = 0; i < 5; i++) {
    const fromCode = searchParams.get(`from_${i}`);
    const fromCity = searchParams.get(`fromCity_${i}`);
    const toCode = searchParams.get(`to_${i}`);
    const toCity = searchParams.get(`toCity_${i}`);
    const departureParam = searchParams.get(`departure_${i}`);

    const from = getAirportFromParams(fromCode, fromCity);
    const to = getAirportFromParams(toCode, toCity);
    const departure = parseDate(departureParam);

    const hasAnyValue = fromCode || fromCity || toCode || toCity || departureParam;

    if (!hasAnyValue) continue;

    segments.push({
      from,
      to,
      departure,
    });
  }

  return segments;
}

export function buildInitialFlightStateFromParams(
  searchParams: URLSearchParams
): FlightState {
  const tripType = (searchParams.get("tripType") as TripType) || "oneway";
  const fareType = searchParams.get("fareType") || "Regular";

  const adults = Number(searchParams.get("adults") || 1);
  const children = Number(searchParams.get("children") || 0);
  const infants = Number(searchParams.get("infants") || 0);
  const cabin = searchParams.get("cabin") || "Economy";

  const returnDate = parseDate(searchParams.get("returnDate"));

  let segments: Segment[] = [];

  if (tripType === "multicity") {
    segments = buildMultiCitySegmentsFromParams(searchParams);
  } else {
    const fromCode = searchParams.get("from");
    const fromCity = searchParams.get("fromCity");
    const toCode = searchParams.get("to");
    const toCity = searchParams.get("toCity");
    const departure = parseDate(searchParams.get("departure"));

    segments = [
      {
        from: getAirportFromParams(fromCode, fromCity),
        to: getAirportFromParams(toCode, toCity),
        departure,
      },
    ];
  }

  if (!segments.length) {
    segments = [
      {
        from: null,
        to: null,
        departure: null,
      },
    ];
  }

  return {
    tripType,
    segments,
    returnDate,
    fareType,
    travellers: {
      adults,
      children,
      infants,
      cabin,
    },
  };
}

export function useFlightSearch(initialOverride?: FlightState) {
  const searchParams = useSearchParams();

  const hydratedInitialState = useMemo(() => {
    if (initialOverride) return initialOverride;

    const hasQuery =
      searchParams.get("from") ||
      searchParams.get("to") ||
      searchParams.get("departure") ||
      searchParams.get("from_0") ||
      searchParams.get("to_0") ||
      searchParams.get("departure_0");

    if (!hasQuery) return initialFlightState;

    return buildInitialFlightStateFromParams(searchParams);
  }, [searchParams, initialOverride]);

  const [state, dispatch] = useReducer(
    flightSearchReducer,
    hydratedInitialState
  );

  return {
    state,
    dispatch,
  };
}
