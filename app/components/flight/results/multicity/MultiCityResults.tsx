"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import FlightsSortBar from "../common/FlightsSortBar";
import FlightsFiltersSidebar, {
  DEFAULT_DOMESTIC_FILTERS,
  DEFAULT_INTERNATIONAL_FILTERS,
  FlightsFiltersState,
} from "../FlightsFiltersSidebar";
import {
  multiCitySearchMock,
  MultiCityFareOption,
  MultiCityFlight,
  MultiCityLeg,
} from "../../data/multicityFlights";
import MultiCityFlightList from "./MultiCityFlightList";
import MultiCityFlightTabs from "./MultiCityFlightTabs";
import MultiCityRouteHeader from "./MultiCityRouteHeader";
import MultiCityStickySummary, {
  SelectedMultiCityFlight,
} from "./MultiCityStickySummary";
import MultiCityViewModeSwitch from "./MultiCityViewModeSwitch";
import { FlightState } from "../../hooks";
import MultiCityCombinedResults from "./MultiCityCombinedResults";
import {
  createDefaultCombinedFiltersState,
  MultiCityCombinedFiltersState,
} from "./filters/filterTypes";
import { saveFlightReviewPayload } from "@/app/lib/flights/review/buildFlightReviewData";
import { SMART_OFFERS_DATA } from "@/app/lib/smartOffers/smartOffersData";

type Props = {
  state: FlightState;
};

type CombinedSelection = {
  legIndex: number;
  leg: MultiCityLeg;
  flight: MultiCityFlight;
  fare: MultiCityFareOption;
};

type CombinedPackage = {
  id: string;
  selections: CombinedSelection[];
  totalAmount: number;
};

const sampleFlightPool: MultiCityFlight[] = multiCitySearchMock.legs.flatMap(
  (leg) => leg.flights
);
const domesticSampleFlightPool =
  multiCitySearchMock.legs[0]?.flights || sampleFlightPool;
const internationalSampleFlightPool =
  multiCitySearchMock.legs
    .slice(1)
    .flatMap((leg) => leg.flights)
    .filter((flight) => flight.price >= 10000) || sampleFlightPool;

function formatDisplayDate(date: Date | null) {
  if (!date) return "Select Date";

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatPayloadDate(date: Date | null) {
  if (!date) return "";

  if (Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}


function createFareOptions(basePrice: number): MultiCityFareOption[] {
  return [
    {
      id: "published",
      label: "Published",
      subtitle: "Economy, Refundable",
      price: basePrice,
      refundable: true,
    },
    {
      id: "flexi",
      label: "Flexi Plus",
      subtitle: "Economy, Free Meal",
      price: basePrice + 420,
      refundable: true,
    },
    {
      id: "sme",
      label: "SME",
      subtitle: "Economy, Refundable",
      price: basePrice + 760,
      refundable: true,
    },
    {
      id: "premium",
      label: "Premium Flex",
      subtitle: "Priority, Meal Included",
      price: basePrice + 1190,
      refundable: true,
    },
  ];
}

function buildDynamicFlightsForSegment(
  segment: FlightState["segments"][number],
  legIndex: number
): MultiCityFlight[] {
  const fromCode = segment.from?.code || `FROM${legIndex + 1}`;
  const fromCity = segment.from?.city || "From City";
  const toCode = segment.to?.code || `TO${legIndex + 1}`;
  const toCity = segment.to?.city || "To City";
  const fromCountry = segment.from?.country || "India";
  const toCountry = segment.to?.country || "India";
  const routeIsInternational = isInternationalLeg({
    id: `leg-${legIndex + 1}`,
    fromCode,
    fromCity,
    fromCountry,
    toCode,
    toCity,
    toCountry,
    departureDate: "",
    flights: [],
  });
  const templatePool =
    routeIsInternational && internationalSampleFlightPool.length
      ? internationalSampleFlightPool
      : domesticSampleFlightPool;

  return templatePool.slice(0, 4).map((template, index) => {
    const basePrice =
      template.price + (routeIsInternational ? legIndex * 850 : legIndex * 350) + index * 140;

    return {
      ...template,
      id: `dynamic-leg-${legIndex + 1}-${index + 1}`,
      fromCode,
      fromCity,
      toCode,
      toCity,
      fromCountry,
      toCountry,
      price: basePrice,
      fareOptions: createFareOptions(basePrice),
    };
  });
}

function parseDurationToMinutes(duration: string) {
  const hoursMatch = duration.match(/(\d+)h/);
  const minutesMatch = duration.match(/(\d+)m/);

  const hours = hoursMatch ? Number(hoursMatch[1]) : 0;
  const minutes = minutesMatch ? Number(minutesMatch[1]) : 0;

  return hours * 60 + minutes;
}

function parseTimeToMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function matchesTimeBucket(time: string, bucket: string) {
  const mins = parseTimeToMinutes(time);

  if (bucket === "before6") return mins < 360;
  if (bucket === "6to12") return mins >= 360 && mins < 720;
  if (bucket === "12to18") return mins >= 720 && mins < 1080;
  if (bucket === "after18") return mins >= 1080;

  return true;
}

function normalizeAirlineId(name: string) {
  const value = name.toLowerCase().replace(/\s+/g, "");

  if (value.includes("airindiaexpress")) return "aiexpress";
  if (value.includes("airindia")) return "airindia";
  if (value.includes("indigo")) return "indigo";
  if (value.includes("akasa")) return "akasa";
  if (value.includes("spicejet")) return "spicejet";
  if (value.includes("emirates")) return "emirates";
  if (value.includes("qatar")) return "qatar";
  if (value.includes("etihad")) return "etihad";
  if (value.includes("lufthansa")) return "lufthansa";
  if (value.includes("britishairways")) return "britishairways";
  if (value.includes("virginatlantic")) return "virginatlantic";
  if (value.includes("airfrance")) return "airfrance";
  if (value.includes("singaporeairlines")) return "singaporeairlines";
  if (value.includes("vistara")) return "vistara";

  return value;
}

function getLowestFareForFlight(flight: MultiCityFlight): MultiCityFareOption {
  return (
    [...flight.fareOptions].sort((a, b) => a.price - b.price)[0] ??
    flight.fareOptions[0]
  );
}

function buildCombinedPackages(legs: MultiCityLeg[]): CombinedPackage[] {
  if (!legs.length) return [];

  const packageCount = Math.min(
    4,
    ...legs.map((leg) => Math.max(leg.flights.length, 1))
  );

  return Array.from({ length: packageCount }).map((_, packageIndex) => {
    const selections: CombinedSelection[] = legs.map((leg, legIndex) => {
      const sortedFlights = [...leg.flights].sort((a, b) => a.price - b.price);
      const flight =
        sortedFlights[
          Math.min(packageIndex, Math.max(sortedFlights.length - 1, 0))
        ];

      const fare = getLowestFareForFlight(flight);

      return {
        legIndex,
        leg,
        flight,
        fare,
      };
    });

    const totalAmount = selections.reduce(
      (sum, item) => sum + item.fare.price,
      0
    );

    return {
      id: `combined-package-${packageIndex + 1}`,
      selections,
      totalAmount,
    };
  });
}

type ActiveOfferSnapshot = {
  code: string;
  title: string;
  discountType: "flat" | "percent";
  discountValue: number;
  maxDiscount: number;
  minBookingValue: number;
};

const INDIAN_AIRPORT_CODES = new Set([
  "DEL",
  "BOM",
  "BLR",
  "HYD",
  "MAA",
  "CCU",
  "AMD",
  "PNQ",
  "GOI",
  "COK",
  "JAI",
  "LKO",
  "IXC",
  "PAT",
  "SXR",
  "GAU",
  "BBI",
  "NAG",
  "IDR",
  "VTZ",
  "TRV",
  "IXB",
  "VNS",
  "RPR",
  "UDR",
  "JDH",
  "ATQ",
  "BHO",
]);

const INTERNATIONAL_LOCATION_HINTS = [
  "dubai",
  "uae",
  "united arab emirates",
  "singapore",
  "bangkok",
  "thailand",
  "london",
  "united kingdom",
  "paris",
  "france",
  "doha",
  "qatar",
  "abu dhabi",
  "etihad",
  "hong kong",
  "kuala lumpur",
  "malaysia",
  "new york",
  "usa",
  "united states",
];

function hasInternationalLocationHint(...values: Array<string | undefined>) {
  return values.some((value) => {
    const normalized = (value || "").trim().toLowerCase();
    return (
      normalized.length > 0 &&
      INTERNATIONAL_LOCATION_HINTS.some((hint) => normalized.includes(hint))
    );
  });
}

function isInternationalLeg(leg: MultiCityLeg) {
  const fromCountry = leg.fromCountry?.trim().toLowerCase() || "";
  const toCountry = leg.toCountry?.trim().toLowerCase() || "";

  if (fromCountry && fromCountry !== "india") return true;
  if (toCountry && toCountry !== "india") return true;
  if (
    hasInternationalLocationHint(
      leg.fromCity,
      leg.toCity,
      leg.fromCountry,
      leg.toCountry,
      leg.fromCode,
      leg.toCode
    )
  ) {
    return true;
  }

  const fromCode = leg.fromCode?.trim().toUpperCase() || "";
  const toCode = leg.toCode?.trim().toUpperCase() || "";

  if (fromCode && !INDIAN_AIRPORT_CODES.has(fromCode)) return true;
  if (toCode && !INDIAN_AIRPORT_CODES.has(toCode)) return true;

  return false;
}

function readJsonStorage(key: string) {
  if (typeof window === "undefined") return null;

  try {
    const sessionValue = window.sessionStorage.getItem(key);
    if (sessionValue) return JSON.parse(sessionValue);
  } catch {}

  try {
    const localValue = window.localStorage.getItem(key);
    if (localValue) return JSON.parse(localValue);
  } catch {}

  return null;
}

function resolveOfferFromRaw(raw: any): ActiveOfferSnapshot | null {
  if (!raw) return null;

  const offer = raw.offer || raw.offerData || raw.appliedOffer || raw;
  const code =
    offer.couponCode ||
    offer.code ||
    offer.offerCode ||
    offer.slug ||
    offer.id ||
    "";
  const title = offer.title || offer.name || offer.offerTitle || "Offer applied";
  const minBookingValue = Number(
    offer.minBookingValue ||
      offer.minimumBookingValue ||
      offer.minAmount ||
      offer.minValue ||
      offer.rule?.minBookingValue ||
      0
  );

  const discountMode = String(
    offer.discountMode || offer.discountType || offer.type || offer.offerType || ""
  ).toLowerCase();

  const discountValue = Number(
    offer.discountValue ||
      offer.value ||
      offer.discountPercent ||
      offer.percent ||
      offer.percentage ||
      0
  );

  const discountAmount = Number(
    offer.discountAmount || offer.appliedOfferAmount || offer.flatDiscount || offer.amount || 0
  );
  const maxDiscount = Number(
    offer.maxDiscount ||
      offer.maximumDiscount ||
      offer.capAmount ||
      offer.discountCap ||
      0
  );

  if (discountMode.includes("percent") || discountMode.includes("percentage")) {
    return {
      code,
      title,
      discountType: "percent",
      discountValue,
      maxDiscount,
      minBookingValue,
    };
  }

  if (discountMode.includes("flat") || discountAmount > 0 || discountValue > 0) {
    return {
      code,
      title,
      discountType: "flat",
      discountValue: discountAmount || discountValue,
      maxDiscount,
      minBookingValue,
    };
  }

  return null;
}

function getActiveFlightOffer(): ActiveOfferSnapshot | null {
  return resolveOfferFromRaw(
    readJsonStorage("tpl_smart_active_offer_v1") ||
      readJsonStorage("tplActiveOfferPayload") ||
      readJsonStorage("tplActiveOfferActivation")
  );
}

function getMultiCityFlightOffer(isInternational: boolean): ActiveOfferSnapshot | null {
  const routeOffer =
    SMART_OFFERS_DATA.find(
      (offer) =>
        offer.service === "flight" &&
        offer.active &&
        (isInternational
          ? offer.rule?.internationalOnly
          : offer.rule?.domesticOnly)
    ) || null;

  return resolveOfferFromRaw(routeOffer) || getActiveFlightOffer();
}

function calculateOfferDiscount(baseAmount: number, offer: ActiveOfferSnapshot | null) {
  if (!offer || baseAmount <= 0) return 0;

  if (offer.minBookingValue > 0 && baseAmount < offer.minBookingValue) return 0;

  if (offer.discountType === "percent") {
    const value = Math.round((baseAmount * offer.discountValue) / 100);
    return offer.maxDiscount > 0 ? Math.min(value, offer.maxDiscount) : value;
  }

  return Math.min(Math.round(offer.discountValue), baseAmount);
}

export default function MultiCityResults({ state }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const limitedLegs = useMemo<MultiCityLeg[]>(() => {
    const validSegments = (state.segments || [])
      .slice(0, 5)
      .filter((segment) => segment.from && segment.to && segment.departure);

    if (!validSegments.length) {
      return multiCitySearchMock.legs.slice(0, 5);
    }

    return validSegments.map((segment, index) => ({
      id: `leg-${index + 1}`,
      fromCode: segment.from?.code || "",
      fromCity: segment.from?.city || "",
      fromCountry: segment.from?.country || "India",
      toCode: segment.to?.code || "",
      toCity: segment.to?.city || "",
      toCountry: segment.to?.country || "India",
      departureDate: formatPayloadDate(segment.departure),
      flights: buildDynamicFlightsForSegment(segment, index),
    }));
  }, [state]);

  const routeIsInternational = useMemo(
    () => limitedLegs.some((leg) => isInternationalLeg(leg)),
    [limitedLegs]
  );

  const [activeLegIndex, setActiveLegIndex] = useState(0);
  const [activeOffer, setActiveOffer] = useState<ActiveOfferSnapshot | null>(
    () => getMultiCityFlightOffer(routeIsInternational)
  );
  const [selectedFlights, setSelectedFlights] = useState<
    Record<number, SelectedMultiCityFlight>
  >({});
  const [filters, setFilters] = useState<FlightsFiltersState>(
    DEFAULT_DOMESTIC_FILTERS
  );
  const [sortType, setSortType] = useState<string>("cheapest");
  const [viewMode, setViewMode] = useState<"combined" | "individual">(
    "combined"
  );
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    const syncOffer = () =>
      setActiveOffer(getMultiCityFlightOffer(routeIsInternational));

    syncOffer();

    window.addEventListener("storage", syncOffer);
    window.addEventListener("TPL_SMART_OFFER_UPDATED", syncOffer as EventListener);
    window.addEventListener("TPL_ACTIVE_OFFER_UPDATED", syncOffer as EventListener);

    return () => {
      window.removeEventListener("storage", syncOffer);
      window.removeEventListener("TPL_SMART_OFFER_UPDATED", syncOffer as EventListener);
      window.removeEventListener("TPL_ACTIVE_OFFER_UPDATED", syncOffer as EventListener);
    };
  }, [routeIsInternational]);

  const safeActiveLegIndex =
    activeLegIndex > limitedLegs.length - 1 ? 0 : activeLegIndex;

  const activeLeg = limitedLegs[safeActiveLegIndex];

  const activeLegIsInternational = useMemo(() => {
    const fromCountry = activeLeg?.fromCountry?.trim().toLowerCase() || "";
    const toCountry = activeLeg?.toCountry?.trim().toLowerCase() || "";

    if (!fromCountry || !toCountry) return false;

    return fromCountry !== "india" || toCountry !== "india";
  }, [activeLeg]);

  useEffect(() => {
    if (viewMode !== "individual" || !activeLeg) return;

    const activeFlights = activeLeg.flights || [];

    const nextMinPrice =
      activeFlights.length > 0
        ? Math.min(...activeFlights.map((flight) => flight.price))
        : 0;

    const nextMaxPrice =
      activeFlights.length > 0
        ? Math.max(...activeFlights.map((flight) => flight.price))
        : 0;

    const nextMinDuration =
      activeFlights.length > 0
        ? Math.min(
            ...activeFlights.map((flight) =>
              parseDurationToMinutes(flight.duration)
            )
          )
        : 0;

    const nextMaxDuration =
      activeFlights.length > 0
        ? Math.max(
            ...activeFlights.map((flight) =>
              parseDurationToMinutes(flight.duration)
            )
          )
        : 0;

    const layoverDurations = activeFlights
      .map((flight) => Number(flight.layoverDurationMinutes || 0))
      .filter((value) => value > 0);

    const nextMinLayoverDuration =
      layoverDurations.length > 0 ? Math.min(...layoverDurations) : 0;

    const nextMaxLayoverDuration =
      layoverDurations.length > 0 ? Math.max(...layoverDurations) : 0;

    setFilters({
      ...(activeLegIsInternational
        ? DEFAULT_INTERNATIONAL_FILTERS
        : DEFAULT_DOMESTIC_FILTERS),
      priceRange: [nextMinPrice, nextMaxPrice],
      durationRange: [nextMinDuration, nextMaxDuration],
      layoverDurationRange: [
        nextMinLayoverDuration,
        nextMaxLayoverDuration,
      ],
    });
  }, [safeActiveLegIndex, activeLegIsInternational, viewMode, activeLeg]);

  const selectedLegIndexes = useMemo(
    () => Object.keys(selectedFlights).map(Number),
    [selectedFlights]
  );
  const activeLegOfferBaseFareOffset = useMemo(
    () =>
      Object.values(selectedFlights).reduce((sum, item) => {
        if (item.legIndex === safeActiveLegIndex) return sum;
        return sum + item.fare.price;
      }, 0),
    [selectedFlights, safeActiveLegIndex]
  );

  const handleSelectFlight = (
    flight: MultiCityFlight,
    fare: MultiCityFareOption
  ) => {
    setSelectedFlights((prev) => {
      const existing = prev[safeActiveLegIndex];

      if (
        existing &&
        existing.flight.id === flight.id &&
        existing.fare.id === fare.id
      ) {
        const updated = { ...prev };
        delete updated[safeActiveLegIndex];
        return updated;
      }

      return {
        ...prev,
        [safeActiveLegIndex]: {
          legIndex: safeActiveLegIndex,
          leg: activeLeg,
          flight,
          fare,
        },
      };
    });
  };

  const handleNext = () => {
    const currentLegSelected = selectedFlights[safeActiveLegIndex];
    if (!currentLegSelected) return;

    if (safeActiveLegIndex < limitedLegs.length - 1) {
      setActiveLegIndex((prev) => prev + 1);
      return;
    }

    const selectionsArray = Object.values(selectedFlights).sort(
      (a, b) => a.legIndex - b.legIndex
    );

    const adults = Math.max(Number(searchParams.get("adults") || "1"), 1);
    const children = Math.max(Number(searchParams.get("children") || "0"), 0);
    const infants = Math.max(Number(searchParams.get("infants") || "0"), 0);
    const cabinClass = searchParams.get("cabin") || "Economy";

    const totalBaseFare = selectionsArray.reduce(
      (sum, item) => sum + item.fare.price,
      0
    );

const baseFareTotal = totalBaseFare * adults;

    const isInternational = selectionsArray.some((item) =>
      isInternationalLeg(item.leg)
    );
const appliedOffer = calculateOfferDiscount(baseFareTotal, activeOffer);
const baseAfterOffer = Math.max(baseFareTotal - appliedOffer, 0);
const earnedOnThisBooking = Math.round(baseAfterOffer * 0.02);

const tax = Math.round(baseFareTotal * 0.18);
const surcharge = 0;
const discount = 0;
const tplCredit = 0;

    saveFlightReviewPayload({
      bookingType: "multiCity",
      tripMode: isInternational ? "international" : "domestic",
      passengers: {
        adults,
        children,
        infants,
      },
      cabinClass,
      pricing: {
  perAdultBaseFare: totalBaseFare,
  baseFareTotal,
  appliedOffer,
  appliedOfferCode: activeOffer?.code || "",
  appliedOfferTitle: activeOffer?.title || "",
  baseAfterOffer,
  earnedOnThisBooking,
  tax,
  surcharge,
  discount,
  tplCredit,
  totalAmount:
    baseAfterOffer +
    tax +
    surcharge -
    discount -
    tplCredit,
  benefitRule: {
    offerOnBaseOnly: true,
    promoEarnedOnBaseAfterOfferOnly: true,
    refundWalletOnFinalPayable: true,
    nonBenefitAmounts: [
      "tax",
      "seats",
      "meals",
      "baggage",
      "insurance",
      "convenienceFee",
      "gatewayFee",
      "addons",
    ],
  },
},
      journeys: selectionsArray.map((item, index) => ({
        journeyLabel: `Flight ${index + 1}`,
        segments: [
          {
            airline: item.flight.airline,
            flightNumber: item.flight.flightNumber,
            from: item.leg.fromCode,
            to: item.leg.toCode,
            departureTime: item.flight.departureTime,
            arrivalTime: item.flight.arrivalTime,
            departureDate: item.leg.departureDate || "",
            arrivalDate: item.leg.departureDate || "",
            duration: item.flight.duration,
            cabinBaggage: (item.flight as any).cabinBag || "7 Kg / Adult",
            checkinBaggage: (item.flight as any).checkInBag || "15 Kg / Adult",
            aircraft: "",
            terminalFrom: item.leg.fromCity,
            terminalTo: item.leg.toCity,
          },
        ],
        layovers:
          item.flight.stopCount > 0
            ? [
                {
                  airport:
                    item.flight.layoverAirport ||
                    item.flight.layoverCode ||
                    item.leg.toCity,
                  duration:
  (item.flight as any).layoverDuration ||
  `${(item.flight as any).layoverDurationMinutes || 0} mins`,
                  note: (item.flight as any).stopType || "Layover",
                },
              ]
            : [],
      })),
    });

    router.push("/flights/review");
  };

  const handleBack = () => {
    if (safeActiveLegIndex > 0) {
      setActiveLegIndex((prev) => prev - 1);
    }
  };

  const currentSelection = selectedFlights[safeActiveLegIndex];

  const selectionsArray = Object.values(selectedFlights).sort(
    (a, b) => a.legIndex - b.legIndex
  );

  const allFlightsForActiveLeg = activeLeg?.flights || [];

  const filteredFlightsForActiveLeg = useMemo(() => {
    return allFlightsForActiveLeg.filter((flight) => {
      const currentFare =
        [...(flight.fareOptions || [])].sort((a, b) => a.price - b.price)[0];
      const effectivePrice = currentFare?.price ?? flight.price ?? 0;

      if (
        effectivePrice < filters.priceRange[0] ||
        effectivePrice > filters.priceRange[1]
      ) {
        return false;
      }

      if (filters.stops.length > 0) {
        const stopId =
          flight.stopCount === 0
            ? "nonstop"
            : flight.stopCount === 1
            ? "1stop"
            : "2stop";

        if (!filters.stops.includes(stopId)) {
          return false;
        }
      }

      if (filters.departureTime.length > 0) {
        const match = filters.departureTime.some((bucket) =>
          matchesTimeBucket(flight.departureTime, bucket)
        );
        if (!match) return false;
      }

      if (filters.arrivalTime.length > 0) {
        const match = filters.arrivalTime.some((bucket) =>
          matchesTimeBucket(flight.arrivalTime, bucket)
        );
        if (!match) return false;
      }

      if (filters.airlines.length > 0) {
        const airlineId = normalizeAirlineId(flight.airline || "");
        if (!filters.airlines.includes(airlineId)) {
          return false;
        }
      }

      if (filters.popular.includes("nonstop") && flight.stopCount !== 0) {
        return false;
      }

      if (
        filters.popular.includes("morning") &&
        !matchesTimeBucket(flight.departureTime, "6to12")
      ) {
        return false;
      }

      if (
        filters.popular.includes("afternoon") &&
        !matchesTimeBucket(flight.departureTime, "12to18")
      ) {
        return false;
      }

      if (
        filters.popular.includes("early") &&
        !matchesTimeBucket(flight.departureTime, "before6")
      ) {
        return false;
      }

      if (activeLegIsInternational) {
        const durationMins = parseDurationToMinutes(flight.duration);
        if (
          durationMins < filters.durationRange[0] ||
          durationMins > filters.durationRange[1]
        ) {
          return false;
        }

        if (filters.checkInBaggage) {
          const baggageText = (flight.baggage || "").toLowerCase();
          if (
            !baggageText.includes("check") &&
            !baggageText.includes("kg") &&
            !baggageText.includes("baggage")
          ) {
            return false;
          }
        }

        if (filters.aircraftSize.length > 0) {
          const aircraftValue = String(
            flight.aircraftSize || (flight as any).aircraftCategory || ""
          ).toLowerCase();

          if (aircraftValue) {
            const matched = filters.aircraftSize.some((item) =>
              aircraftValue.includes(item.toLowerCase())
            );
            if (!matched) return false;
          }
        }

        if (filters.alliances.length > 0) {
          const allianceValue = String(flight.alliance || "").toLowerCase();
          if (allianceValue) {
            const matched = filters.alliances.some((item) =>
              allianceValue.includes(item.toLowerCase())
            );
            if (!matched) return false;
          }
        }

        if (filters.layoverAirports.length > 0) {
          const layoverValue = String(
            flight.layoverAirport || flight.layoverCode || (flight as any).via || ""
          ).toLowerCase();

          if (layoverValue) {
            const matched = filters.layoverAirports.some((item) =>
              layoverValue.includes(item.toLowerCase())
            );
            if (!matched) return false;
          }
        }

        const layoverDuration = Number(flight.layoverDurationMinutes || 0);
        if (layoverDuration > 0) {
          if (
            layoverDuration < filters.layoverDurationRange[0] ||
            layoverDuration > filters.layoverDurationRange[1]
          ) {
            return false;
          }
        }
      }

      return true;
    });
  }, [allFlightsForActiveLeg, filters, activeLegIsInternational]);

  const sortedFlightsForActiveLeg = useMemo(() => {
    const flights = [...filteredFlightsForActiveLeg];

    if (sortType === "cheapest" || sortType === "Discounted Price") {
      return flights.sort((a, b) => a.price - b.price);
    }

    if (sortType === "nonstop") {
      return flights.sort((a, b) => {
        if (a.stopCount !== b.stopCount) return a.stopCount - b.stopCount;
        return a.price - b.price;
      });
    }

    if (sortType === "prefer") {
      return flights.sort((a, b) => {
        const aScore =
          a.price + parseDurationToMinutes(a.duration) * 4 + a.stopCount * 500;
        const bScore =
          b.price + parseDurationToMinutes(b.duration) * 4 + b.stopCount * 500;
        return aScore - bScore;
      });
    }

    if (sortType === "Early Departure") {
      return flights.sort(
        (a, b) =>
          parseTimeToMinutes(a.departureTime) -
          parseTimeToMinutes(b.departureTime)
      );
    }

    if (sortType === "Late Departure") {
      return flights.sort(
        (a, b) =>
          parseTimeToMinutes(b.departureTime) -
          parseTimeToMinutes(a.departureTime)
      );
    }

    if (sortType === "Early Arrival") {
      return flights.sort(
        (a, b) =>
          parseTimeToMinutes(a.arrivalTime) - parseTimeToMinutes(b.arrivalTime)
      );
    }

    if (sortType === "Late Arrival") {
      return flights.sort(
        (a, b) =>
          parseTimeToMinutes(b.arrivalTime) - parseTimeToMinutes(a.arrivalTime)
      );
    }

    return flights;
  }, [filteredFlightsForActiveLeg, sortType]);

  const cheapestFlight = [...filteredFlightsForActiveLeg].sort(
    (a, b) => a.price - b.price
  )[0];

  const nonstopFlight = [...filteredFlightsForActiveLeg].sort((a, b) => {
    if (a.stopCount !== b.stopCount) return a.stopCount - b.stopCount;
    return a.price - b.price;
  })[0];

  const preferredFlight = [...filteredFlightsForActiveLeg].sort((a, b) => {
    const aScore =
      a.price + parseDurationToMinutes(a.duration) * 4 + a.stopCount * 500;
    const bScore =
      b.price + parseDurationToMinutes(b.duration) * 4 + b.stopCount * 500;
    return aScore - bScore;
  })[0];

  const cheapestLabel = cheapestFlight
    ? `₹ ${cheapestFlight.price.toLocaleString("en-IN")} | ${cheapestFlight.duration}`
    : "N/A";

  const nonstopLabel = nonstopFlight
    ? `₹ ${nonstopFlight.price.toLocaleString("en-IN")} | ${nonstopFlight.duration}`
    : "N/A";

  const preferLabel = preferredFlight
    ? `₹ ${preferredFlight.price.toLocaleString("en-IN")} | ${preferredFlight.duration}`
    : "N/A";

  const minPrice =
    allFlightsForActiveLeg.length > 0
      ? Math.min(...allFlightsForActiveLeg.map((flight) => flight.price))
      : 0;

  const maxPrice =
    allFlightsForActiveLeg.length > 0
      ? Math.max(...allFlightsForActiveLeg.map((flight) => flight.price))
      : 0;

  const minDuration =
    allFlightsForActiveLeg.length > 0
      ? Math.min(
          ...allFlightsForActiveLeg.map((flight) =>
            parseDurationToMinutes(flight.duration)
          )
        )
      : 0;

  const maxDuration =
    allFlightsForActiveLeg.length > 0
      ? Math.max(
          ...allFlightsForActiveLeg.map((flight) =>
            parseDurationToMinutes(flight.duration)
          )
        )
      : 0;

  const departureAirportOptions = useMemo(() => {
    return [
      {
        id: activeLeg.fromCode,
        label: `${activeLeg.fromCity} (${activeLeg.fromCode})`,
      },
    ];
  }, [activeLeg.fromCity, activeLeg.fromCode]);

  const allianceOptions = useMemo(() => {
    const values = Array.from(
      new Set(
        allFlightsForActiveLeg.map((flight) => flight.alliance).filter(Boolean)
      )
    );

    return values.map((item) => ({
      id: String(item).toLowerCase(),
      label: String(item),
    }));
  }, [allFlightsForActiveLeg]);

  const layoverAirportOptions = useMemo(() => {
    const values = Array.from(
      new Set(
        allFlightsForActiveLeg
          .map((flight) => flight.layoverAirport || flight.layoverCode)
          .filter(Boolean)
      )
    );

    return values.map((item) => ({
      id: String(item).toLowerCase(),
      label: String(item),
    }));
  }, [allFlightsForActiveLeg]);

  const layoverDurations = allFlightsForActiveLeg
    .map((flight) => Number(flight.layoverDurationMinutes || 0))
    .filter((value) => value > 0);

  const minLayoverDuration =
    layoverDurations.length > 0 ? Math.min(...layoverDurations) : 0;

  const maxLayoverDuration =
    layoverDurations.length > 0 ? Math.max(...layoverDurations) : 0;

  const combinedPackages = useMemo(
    () => buildCombinedPackages(limitedLegs),
    [limitedLegs]
  );

  const combinedMinPrice = useMemo(() => {
    if (!combinedPackages.length) return 0;
    return Math.min(...combinedPackages.map((pkg) => pkg.totalAmount));
  }, [combinedPackages]);

  const combinedMaxPrice = useMemo(() => {
    if (!combinedPackages.length) return 0;
    return Math.max(...combinedPackages.map((pkg) => pkg.totalAmount));
  }, [combinedPackages]);

  const combinedDurations = useMemo(() => {
    return combinedPackages.map((pkg) =>
      pkg.selections.reduce(
        (sum, item) => sum + parseDurationToMinutes(item.flight.duration),
        0
      )
    );
  }, [combinedPackages]);

  const combinedMinDuration = combinedDurations.length
    ? Math.min(...combinedDurations)
    : 0;

  const combinedMaxDuration = combinedDurations.length
    ? Math.max(...combinedDurations)
    : 0;

  const combinedAllFlights = useMemo(
    () => limitedLegs.flatMap((leg) => leg.flights),
    [limitedLegs]
  );

  const combinedLayoverDurations = useMemo(() => {
    return combinedAllFlights
      .map((flight) => Number(flight.layoverDurationMinutes || 0))
      .filter((value) => value > 0);
  }, [combinedAllFlights]);

  const combinedMinLayoverDuration = combinedLayoverDurations.length
    ? Math.min(...combinedLayoverDurations)
    : 0;

  const combinedMaxLayoverDuration = combinedLayoverDurations.length
    ? Math.max(...combinedLayoverDurations)
    : 0;

  const combinedAirlineOptions = useMemo(() => {
    const values = Array.from(
      new Set(combinedAllFlights.map((flight) => flight.airline).filter(Boolean))
    );

    return values.map((item) => ({
      id: normalizeAirlineId(String(item)),
      label: String(item),
    }));
  }, [combinedAllFlights]);

  const combinedLayoverAirportOptions = useMemo(() => {
    const values = Array.from(
      new Set(
        combinedAllFlights
          .map((flight) => flight.layoverAirport || flight.layoverCode)
          .filter(Boolean)
      )
    );

    return values.map((item) => ({
      id: String(item).toLowerCase(),
      label: String(item),
    }));
  }, [combinedAllFlights]);

  const [combinedFilters, setCombinedFilters] =
    useState<MultiCityCombinedFiltersState>(
      createDefaultCombinedFiltersState(
        limitedLegs.length,
        combinedMinPrice,
        combinedMaxPrice,
        combinedMinDuration,
        combinedMaxDuration,
        0,
        0
      )
    );

  useEffect(() => {
    if (viewMode !== "combined") return;

    setCombinedFilters(
      createDefaultCombinedFiltersState(
        limitedLegs.length,
        combinedMinPrice,
        combinedMaxPrice,
        combinedMinDuration,
        combinedMaxDuration,
        0,
        0
      )
    );
  }, [
    viewMode,
    limitedLegs.length,
    combinedMinPrice,
    combinedMaxPrice,
    combinedMinDuration,
    combinedMaxDuration,
    combinedMinLayoverDuration,
    combinedMaxLayoverDuration,
  ]);

  if (!activeLeg) return null;

  const filterPanel = (
    <FlightsFiltersSidebar
      key={
        viewMode === "combined"
          ? `combined-${limitedLegs.length}`
          : `${safeActiveLegIndex}-${
              activeLegIsInternational ? "international" : "domestic"
            }`
      }
      tripType="multicity"
      viewMode={viewMode}
      isInternational={activeLegIsInternational}
      filters={filters}
      onFiltersChange={setFilters}
      combinedFilters={combinedFilters}
      onCombinedFiltersChange={setCombinedFilters}
      legs={limitedLegs}
      fromCity={activeLeg.fromCity}
      toCity={activeLeg.toCity}
      minPrice={viewMode === "combined" ? combinedMinPrice : minPrice}
      maxPrice={viewMode === "combined" ? combinedMaxPrice : maxPrice}
      departureAirportOptions={departureAirportOptions}
      minDuration={viewMode === "combined" ? combinedMinDuration : minDuration}
      maxDuration={viewMode === "combined" ? combinedMaxDuration : maxDuration}
      minLayoverDuration={
        viewMode === "combined" ? combinedMinLayoverDuration : minLayoverDuration
      }
      maxLayoverDuration={
        viewMode === "combined" ? combinedMaxLayoverDuration : maxLayoverDuration
      }
      allianceOptions={allianceOptions}
      layoverAirportOptions={
        viewMode === "combined" ? combinedLayoverAirportOptions : layoverAirportOptions
      }
      airlineOptions={combinedAirlineOptions}
    />
  );

  return (
    <div className="space-y-3 overflow-x-hidden md:overflow-visible xl:space-y-5">
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-[280px_minmax(0,1fr)] xl:gap-5">
        <div className="hidden space-y-5 xl:block">
          <MultiCityViewModeSwitch
            viewMode={viewMode}
            onChange={setViewMode}
          />

          {filterPanel}
        </div>

        <div className="min-w-0 space-y-2.5 xl:space-y-2">
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
                  Multi City Flights
                </div>
                <div className="mt-0.5 truncate text-[11px] font-semibold text-[#64748b]">
                  {limitedLegs.length} segments ·{" "}
                  {viewMode === "combined" ? "Combined" : "Individual"}
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

          <div className="xl:hidden">
            <MultiCityViewModeSwitch
              viewMode={viewMode}
              onChange={setViewMode}
            />
          </div>

          <MultiCityRouteHeader legs={limitedLegs} />



          {viewMode === "individual" ? (
            <>
              <FlightsSortBar
                sortType={sortType}
                onSortChange={setSortType}
                cheapestLabel={cheapestLabel}
                nonstopLabel={nonstopLabel}
                preferLabel={preferLabel}
              />

              <MultiCityFlightTabs
                totalLegs={limitedLegs.length}
                activeLegIndex={safeActiveLegIndex}
                selectedLegIndexes={selectedLegIndexes}
                onTabChange={setActiveLegIndex}
                legs={limitedLegs}
              />

              <div className="rounded-2xl bg-sky-50 px-3 py-3 md:px-5 md:py-4">
                <h3 className="text-[14px] font-black text-gray-900 md:text-xl md:font-bold">
                  Flight {safeActiveLegIndex + 1}: {activeLeg.fromCity} (
                  {activeLeg.fromCode}) → {activeLeg.toCity} ({activeLeg.toCode})
                </h3>
                <p className="mt-1 text-[11px] font-semibold text-gray-600 md:text-sm md:font-normal">
                  Departure Date: {activeLeg.departureDate}
                </p>
              </div>

              <MultiCityFlightList
                flights={sortedFlightsForActiveLeg}
                selectedFlightId={currentSelection?.flight.id}
                selectedFareId={currentSelection?.fare.id}
                onSelectFlight={handleSelectFlight}
                offerBaseFareOffset={activeLegOfferBaseFareOffset}
                activeOffer={activeOffer}
              />

              <MultiCityStickySummary
                legs={limitedLegs}
                activeLegIndex={safeActiveLegIndex}
                selections={selectionsArray}
                activeOffer={activeOffer}
                onBack={handleBack}
                onNext={handleNext}
              />
            </>
          ) : (
            <MultiCityCombinedResults
              legs={limitedLegs}
              combinedFilters={combinedFilters}
            />
          )}
        </div>
      </div>

      {showMobileFilters && (
        <div className="fixed inset-0 z-[90] xl:hidden">
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
                  Multi City ·{" "}
                  {viewMode === "combined"
                    ? "Combined"
                    : `Flight ${safeActiveLegIndex + 1}`}
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
                Show Results
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
