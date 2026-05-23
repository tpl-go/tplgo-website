"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  MultiCityFareOption,
  MultiCityFlight,
  MultiCityLeg,
} from "../../data/multicityFlights";
import MultiCityModal from "./MultiCityModal";
import MultiCityCardDetailsPanel from "./MultiCityCardDetailsPanel";
import FlightStopInfo from "../common/FlightStopInfo";
import { MultiCityCombinedFiltersState } from "./filters/filterTypes";
import { saveFlightReviewPayload } from "@/app/lib/flights/review/buildFlightReviewData";

type Props = {
  legs: MultiCityLeg[];
  combinedFilters: MultiCityCombinedFiltersState;
};

type DetailTab = "flight" | "fare" | "rules" | "baggage";

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

function getLowestFareForFlight(flight: MultiCityFlight): MultiCityFareOption {
  return (
    [...flight.fareOptions].sort((a, b) => a.price - b.price)[0] ??
    flight.fareOptions[0]
  );
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

function formatLayoverDuration(minutes?: number) {
  const totalMinutes = Number(minutes || 0);

  if (!totalMinutes) return "";

  const hrs = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;

  if (hrs > 0 && mins > 0) return `${hrs} hrs ${mins} mins`;
  if (hrs > 0) return `${hrs} hrs`;
  return `${mins} mins`;
}

function normalizePayloadDate(value?: string) {
  const raw = String(value || "").trim();
  if (!raw) return "";

  const isoDateMatch = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoDateMatch) return raw;

  const isoWithTimeMatch = raw.match(/^(\d{4})-(\d{2})-(\d{2})T/);
  if (isoWithTimeMatch) {
    return `${isoWithTimeMatch[1]}-${isoWithTimeMatch[2]}-${isoWithTimeMatch[3]}`;
  }

  return raw;
}

function getLayoverData(flight: MultiCityFlight) {
  if (!flight.stopCount || flight.stopCount === 0) return [];

  if (flight.layoverAirport || flight.layoverCode || flight.layoverDurationMinutes) {
    return [
      {
        city: flight.layoverAirport || "Layover",
        code: flight.layoverCode || "---",
        duration: formatLayoverDuration(flight.layoverDurationMinutes) || "Layover",
      },
    ];
  }

  if (flight.stopCount === 1) {
    return [
      {
        city: "Jaipur",
        code: "JAI",
        duration: "4 hrs 30 mins",
      },
    ];
  }

  if (flight.stopCount >= 2) {
    return [
      {
        city: "Dubai",
        code: "DXB",
        duration: "2 hrs 10 mins",
      },
      {
        city: "Doha",
        code: "DOH",
        duration: "1 hr 45 mins",
      },
    ];
  }

  return [];
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

function recalculatePackage(pkg: CombinedPackage): CombinedPackage {
  return {
    ...pkg,
    totalAmount: pkg.selections.reduce((sum, item) => sum + item.fare.price, 0),
  };
}

type ActiveOfferSnapshot = {
  code: string;
  title: string;
  discountType: "flat" | "percent";
  discountValue: number;
  maxDiscount: number;
  minBookingValue: number;
};

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

  const discountMode = String(
    offer.discountMode || offer.discountType || offer.type || offer.offerType || ""
  ).toLowerCase();

  const discountValue = Number(
    offer.discountValue || offer.value || offer.discountPercent || offer.percent || 0
  );

  const discountAmount = Number(
    offer.discountAmount || offer.appliedOfferAmount || offer.flatDiscount || offer.amount || 0
  );

  if (discountMode.includes("percent")) {
    return {
      code: offer.couponCode || offer.code || offer.slug || "",
      title: offer.title || "Offer applied",
      discountType: "percent",
      discountValue,
      maxDiscount: Number(offer.maxDiscount || 0),
      minBookingValue: Number(offer.minBookingValue || 0),
    };
  }

  if (discountMode.includes("flat") || discountAmount > 0 || discountValue > 0) {
    return {
      code: offer.couponCode || offer.code || offer.slug || "",
      title: offer.title || "Offer applied",
      discountType: "flat",
      discountValue: discountAmount || discountValue,
      maxDiscount: Number(offer.maxDiscount || 0),
      minBookingValue: Number(offer.minBookingValue || 0),
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

function calculateOfferDiscount(baseAmount: number, offer: ActiveOfferSnapshot | null) {
  if (!offer || baseAmount <= 0) return 0;
  if (offer.minBookingValue > 0 && baseAmount < offer.minBookingValue) return 0;

  if (offer.discountType === "percent") {
    const value = Math.round((baseAmount * offer.discountValue) / 100);
    return offer.maxDiscount > 0 ? Math.min(value, offer.maxDiscount) : value;
  }

  return Math.min(Math.round(offer.discountValue), baseAmount);
}

function formatRupee(value: number) {
  return `₹${Math.max(0, Math.round(value)).toLocaleString("en-IN")}`;
}


export default function MultiCityCombinedResults({
  legs,
  combinedFilters,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [activeOffer, setActiveOffer] = useState<ActiveOfferSnapshot | null>(null);

useEffect(() => {
  setActiveOffer(getActiveFlightOffer());

  const syncOffer = () => setActiveOffer(getActiveFlightOffer());

  window.addEventListener("storage", syncOffer);
  window.addEventListener("TPL_SMART_OFFER_UPDATED", syncOffer as EventListener);
  window.addEventListener("TPL_ACTIVE_OFFER_UPDATED", syncOffer as EventListener);

  return () => {
    window.removeEventListener("storage", syncOffer);
    window.removeEventListener("TPL_SMART_OFFER_UPDATED", syncOffer as EventListener);
    window.removeEventListener("TPL_ACTIVE_OFFER_UPDATED", syncOffer as EventListener);
  };
}, []);

  const [packages, setPackages] = useState<CombinedPackage[]>(() =>
    buildCombinedPackages(legs)
  );

  const [showDetails, setShowDetails] = useState(false);
  const [detailsTab, setDetailsTab] = useState<DetailTab>("flight");
  const [activeDetailSelection, setActiveDetailSelection] =
    useState<CombinedSelection | null>(null);

  const [showChangeModal, setShowChangeModal] = useState(false);
  const [activeChangePackageId, setActiveChangePackageId] = useState<
    string | null
  >(null);
  const [activeChangeLegIndex, setActiveChangeLegIndex] = useState<
    number | null
  >(null);

  const [changeSortType, setChangeSortType] = useState<
    "cheapest" | "early" | "nonstop"
  >("cheapest");

  useEffect(() => {
    setPackages(buildCombinedPackages(legs));
  }, [legs]);

  const handleOpenDetails = (selection: CombinedSelection) => {
    setDetailsTab("flight");
    setActiveDetailSelection(selection);
    setShowDetails(true);
  };

  const handleOpenChangeModal = (packageId: string, legIndex: number) => {
    setActiveChangePackageId(packageId);
    setActiveChangeLegIndex(legIndex);
    setChangeSortType("cheapest");
    setShowChangeModal(true);
  };

  const activeChangePackage = useMemo(() => {
    return packages.find((pkg) => pkg.id === activeChangePackageId) || null;
  }, [packages, activeChangePackageId]);

  const activeChangeSelection = useMemo(() => {
    if (!activeChangePackage || activeChangeLegIndex === null) return null;
    return (
      activeChangePackage.selections.find(
        (item) => item.legIndex === activeChangeLegIndex
      ) || null
    );
  }, [activeChangePackage, activeChangeLegIndex]);

  const activeChangeFlights = useMemo(() => {
    if (!activeChangeSelection) return [];
    return activeChangeSelection.leg.flights;
  }, [activeChangeSelection]);

  const sortedChangeFlights = useMemo(() => {
    const flights = [...activeChangeFlights];

    if (changeSortType === "cheapest") {
      return flights.sort((a, b) => a.price - b.price);
    }

    if (changeSortType === "early") {
      return flights.sort(
        (a, b) =>
          parseTimeToMinutes(a.departureTime) -
          parseTimeToMinutes(b.departureTime)
      );
    }

    if (changeSortType === "nonstop") {
      return flights.sort((a, b) => {
        if (a.stopCount !== b.stopCount) return a.stopCount - b.stopCount;
        return a.price - b.price;
      });
    }

    return flights;
  }, [activeChangeFlights, changeSortType]);

  const handleReplaceFlight = (flight: MultiCityFlight) => {
    if (!activeChangePackageId || activeChangeLegIndex === null) return;

    const fare = getLowestFareForFlight(flight);

    setPackages((prev) =>
      prev.map((pkg) => {
        if (pkg.id !== activeChangePackageId) return pkg;

        const updatedSelections = pkg.selections.map((selection) => {
          if (selection.legIndex !== activeChangeLegIndex) return selection;

          return {
            ...selection,
            flight,
            fare,
          };
        });

        return recalculatePackage({
          ...pkg,
          selections: updatedSelections,
        });
      })
    );

    setShowChangeModal(false);
  };

  const handleBookCombinedPackage = (pkg: CombinedPackage) => {
    const adults = Math.max(Number(searchParams.get("adults") || "1"), 1);
    const children = Math.max(Number(searchParams.get("children") || "0"), 0);
    const infants = Math.max(Number(searchParams.get("infants") || "0"), 0);
    const cabinClass = searchParams.get("cabin") || "Economy";

    const totalBaseFare = pkg.selections.reduce(
      (sum, item) => sum + item.fare.price,
      0
    );

    const baseFareTotal = totalBaseFare * adults;
const appliedOffer = calculateOfferDiscount(baseFareTotal, activeOffer);
const baseAfterOffer = Math.max(baseFareTotal - appliedOffer, 0);
const earnedOnThisBooking = Math.round(baseAfterOffer * 0.02);

const tax = 0;
const surcharge = 0;
const discount = 0;
const tplCredit = 0;

    const isInternational = pkg.selections.some((item) => {
      const fromCountry = item.leg.fromCountry?.trim().toLowerCase() || "";
      const toCountry = item.leg.toCountry?.trim().toLowerCase() || "";
      return fromCountry !== "india" || toCountry !== "india";
    });

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
  totalAmount: baseAfterOffer + tax + surcharge - discount - tplCredit,
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
      journeys: pkg.selections.map((item, index) => ({
        journeyLabel: `Flight ${index + 1}`,
        segments: [
          {
            airline: item.flight.airline,
            flightNumber: item.flight.flightNumber,
            from: item.leg.fromCode,
            to: item.leg.toCode,
            departureTime: item.flight.departureTime,
            arrivalTime: item.flight.arrivalTime,
            departureDate: normalizePayloadDate(item.leg.departureDate),
arrivalDate: normalizePayloadDate(item.leg.departureDate),
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
                    formatLayoverDuration(item.flight.layoverDurationMinutes) ||
                    "Layover",
                  note: item.flight.stopsText || "Layover",
                },
              ]
            : [],
      })),
    });

    router.push("/flights/review");
  };

  const filteredPackages = useMemo(() => {
    return packages.filter((pkg) => {
      if (
        pkg.totalAmount < combinedFilters.priceRange[0] ||
        pkg.totalAmount > combinedFilters.priceRange[1]
      ) {
        return false;
      }

      const totalDuration = pkg.selections.reduce(
        (sum, item) => sum + parseDurationToMinutes(item.flight.duration),
        0
      );

      if (
        totalDuration < combinedFilters.durationRange[0] ||
        totalDuration > combinedFilters.durationRange[1]
      ) {
        return false;
      }

      if (combinedFilters.checkInBaggage) {
        const hasBaggageInAll = pkg.selections.every(
          (item) =>
            item.flight.checkInBaggageIncluded === true ||
            (item.flight.baggage || "").toLowerCase().includes("check")
        );

        if (!hasBaggageInAll) return false;
      }

      if (combinedFilters.popular.includes("nonstop")) {
        const allNonStop = pkg.selections.every((item) => item.flight.stopCount === 0);
        if (!allNonStop) return false;
      }

      if (combinedFilters.popular.includes("1stop")) {
        const hasOneStop = pkg.selections.some((item) => item.flight.stopCount === 1);
        if (!hasOneStop) return false;
      }

      if (combinedFilters.popular.includes("refundable")) {
        const allRefundable = pkg.selections.every(
          (item) => item.fare.refundable !== false
        );
        if (!allRefundable) return false;
      }

      if (combinedFilters.popular.includes("morning")) {
        const hasMorning = pkg.selections.some((item) =>
          matchesTimeBucket(item.flight.departureTime, "6to12")
        );
        if (!hasMorning) return false;
      }

      if (combinedFilters.popular.includes("afternoon")) {
        const hasAfternoon = pkg.selections.some((item) =>
          matchesTimeBucket(item.flight.departureTime, "12to18")
        );
        if (!hasAfternoon) return false;
      }

      if (combinedFilters.popular.includes("early")) {
        const hasEarly = pkg.selections.some((item) =>
          matchesTimeBucket(item.flight.departureTime, "before6")
        );
        if (!hasEarly) return false;
      }

      if (combinedFilters.airlines.length > 0) {
        const hasMatchingAirline = pkg.selections.some((item) =>
          combinedFilters.airlines.includes(normalizeAirlineId(item.flight.airline))
        );

        if (!hasMatchingAirline) return false;
      }

      if (combinedFilters.layoverAirports.length > 0) {
        const hasMatchingLayover = pkg.selections.some((item) => {
          const layover = String(
            item.flight.layoverAirport || item.flight.layoverCode || ""
          ).toLowerCase();

          return combinedFilters.layoverAirports.some((selected) =>
            layover.includes(selected.toLowerCase())
          );
        });

        if (!hasMatchingLayover) return false;
      }

      if (
        combinedFilters.layoverDurationRange[0] > 0 ||
        combinedFilters.layoverDurationRange[1] > 0
      ) {
        const hasMatchingLayoverDuration = pkg.selections.some((item) => {
          const layoverMins = Number(item.flight.layoverDurationMinutes || 0);

          if (layoverMins === 0) return false;

          return (
            layoverMins >= combinedFilters.layoverDurationRange[0] &&
            layoverMins <= combinedFilters.layoverDurationRange[1]
          );
        });

        if (!hasMatchingLayoverDuration) return false;
      }

      const allLegsMatch = pkg.selections.every((selection) => {
        const legFilter = combinedFilters.legFilters[selection.legIndex];

        if (!legFilter) return true;

        if (legFilter.stops.length > 0) {
          const stopId =
            selection.flight.stopCount === 0
              ? "nonstop"
              : selection.flight.stopCount === 1
              ? "1stop"
              : "2stop";

          if (!legFilter.stops.includes(stopId)) return false;
        }

        if (legFilter.departureTime.length > 0) {
          const departureMatch = legFilter.departureTime.some((bucket) =>
            matchesTimeBucket(selection.flight.departureTime, bucket)
          );
          if (!departureMatch) return false;
        }

        if (legFilter.arrivalTime.length > 0) {
          const arrivalMatch = legFilter.arrivalTime.some((bucket) =>
            matchesTimeBucket(selection.flight.arrivalTime, bucket)
          );
          if (!arrivalMatch) return false;
        }

        return true;
      });

      return allLegsMatch;
    });
  }, [packages, combinedFilters]);

  if (!packages.length) return null;

  return (
    <>
      <div className="space-y-4">
        {filteredPackages.length === 0 ? (
          <div className="rounded-2xl border border-[#dbe4ef] bg-white p-8 text-center shadow-sm">
            <div className="text-[18px] font-semibold text-[#111827]">
              No combined flights found
            </div>
            <div className="mt-2 text-[14px] text-[#6b7280]">
              Try changing or clearing some filters.
            </div>
          </div>
        ) : (
          filteredPackages.map((pkg, packageIndex) => {
  const appliedOffer = calculateOfferDiscount(
    pkg.totalAmount,
    activeOffer
  );

  const finalAmount = Math.max(
    pkg.totalAmount - appliedOffer,
    0
  );

  const earnedOnThisBooking = Math.round(
    finalAmount * 0.02
  );

  return (

            <div
              key={pkg.id}
              className="overflow-hidden rounded-2xl border border-[#dbe4ef] bg-white shadow-sm"
            >
              <div className="flex items-start justify-between border-b border-[#e5e7eb] bg-[#f8fbff] px-5 py-4">
                <div>
                  <div className="text-[13px] font-semibold text-[#0284c7]">
                    Combined Option {packageIndex + 1}
                  </div>
                  <div className="mt-1 text-[14px] text-[#6b7280]">
                    Best multi-city combination for all selected routes
                  </div>
                </div>

                <div className="flex items-center gap-4 text-right">
                  <div>
                    <div className="text-[11px] leading-none text-[#6b7280]">
                      Package Total / adult
                    </div>
                    {appliedOffer > 0 ? (
  <div className="mt-1">
    <div className="text-[12px] font-semibold leading-none text-[#9ca3af] line-through">
      {formatRupee(pkg.totalAmount)}
    </div>

    <div className="mt-1 text-[22px] font-bold leading-none text-[#111827]">
      {formatRupee(finalAmount)}
    </div>

    <div className="mt-2 inline-flex rounded-full bg-[#ff7a00] px-3 py-1 text-[11px] font-bold text-white">
      {activeOffer?.code || "OFFER"} applied · Save {formatRupee(appliedOffer)}
    </div>
  </div>
) : (
  <div className="mt-1 text-[22px] font-bold leading-none text-[#111827]">
    {formatRupee(pkg.totalAmount)}
  </div>
)}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleBookCombinedPackage(pkg)}
                    className="rounded-full border border-[#0ea5e9] bg-white px-5 py-2 text-[13px] font-bold text-[#0284c7] transition hover:bg-[#eef9ff]"
                  >
                    BOOK NOW
                  </button>
                </div>
              </div>

              <div className="divide-y divide-[#eef2f7]">
                {pkg.selections.map((selection, rowIndex) => (
                  <div
                    key={`${pkg.id}-${selection.leg.id}`}
                    className={`grid grid-cols-[220px_120px_minmax(150px,1fr)_120px_170px] items-center gap-4 px-5 py-5 ${
                      rowIndex === pkg.selections.length - 1 ? "border-b-0" : ""
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="text-[15px] font-bold leading-tight text-[#111827]">
                        {selection.flight.airline}
                      </div>

                      <div className="mt-1 text-[12px] font-medium text-[#374151]">
                        {selection.leg.fromCode}-{selection.leg.toCode} •{" "}
                        {selection.leg.departureDate}
                      </div>

                      <div className="mt-1 text-[12px] text-[#6b7280]">
                        {selection.flight.flightNumber}
                      </div>

                      {selection.flight.seatLeft ? (
                        <div className="mt-3 inline-flex rounded-full bg-[#fdecee] px-2.5 py-1 text-[11px] font-medium text-[#c2415d]">
                          Seats left: {selection.flight.seatLeft}
                        </div>
                      ) : null}
                    </div>

                    <div className="text-center">
                      <div className="text-[22px] font-bold leading-none text-[#111827]">
                        {selection.flight.departureTime}
                      </div>
                      <div className="mt-1 text-[13px] text-[#374151]">
                        {selection.flight.fromCity}
                      </div>
                    </div>

                    <div className="min-w-0 text-center">
                      <FlightStopInfo
                        duration={selection.flight.duration}
                        stopsText={selection.flight.stopsText}
                        baggage={selection.flight.baggage}
                        stopCount={selection.flight.stopCount}
                        layovers={getLayoverData(selection.flight)}
                      />

                      <button
                        type="button"
                        onClick={() => handleOpenDetails(selection)}
                        className="mt-2 text-[12px] font-semibold text-[#2563eb] hover:text-[#1d4ed8]"
                      >
                        View Details +
                      </button>
                    </div>

                    <div className="text-center">
                      <div className="text-[22px] font-bold leading-none text-[#111827]">
                        {selection.flight.arrivalTime}
                      </div>
                      <div className="mt-1 text-[13px] text-[#374151]">
                        {selection.flight.toCity}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-[15px] font-bold text-[#111827]">
                        ₹{selection.fare.price.toLocaleString("en-IN")}
                      </div>
                      <div className="mt-1 text-[11px] text-[#6b7280]">
                        {selection.fare.label}
                      </div>
                      <div className="mt-1 text-[11px] text-[#6b7280]">
                        {selection.fare.subtitle}
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          handleOpenChangeModal(pkg.id, selection.legIndex)
                        }
                        className="mt-3 rounded-full border border-[#0ea5e9] bg-white px-4 py-1.5 text-[12px] font-semibold text-[#0284c7] transition hover:bg-[#eef9ff]"
                      >
                        Change
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
})
        )}
      </div>

      <MultiCityModal
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
        title="Flight Details"
        maxWidthClass="max-w-5xl"
      >
        {activeDetailSelection ? (
          <MultiCityCardDetailsPanel
            flight={activeDetailSelection.flight}
            selectedFare={activeDetailSelection.fare}
            activeTab={detailsTab}
            setActiveTab={setDetailsTab}
          />
        ) : null}
      </MultiCityModal>

      <MultiCityModal
        isOpen={showChangeModal}
        onClose={() => setShowChangeModal(false)}
        title={
          activeChangeSelection
            ? `Change Flight • ${activeChangeSelection.leg.fromCode} → ${activeChangeSelection.leg.toCode}`
            : "Change Flight"
        }
        maxWidthClass="max-w-5xl"
      >
        <div className="mb-4 mt-3 flex items-center gap-3 border-b border-[#e5e7eb] px-6 pb-3">
          <div className="text-[14px] font-semibold text-[#374151] whitespace-nowrap">
            Sort by:
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {[
              { value: "cheapest", label: "Cheapest" },
              { value: "early", label: "Early Departure" },
              { value: "nonstop", label: "Non Stop" },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() =>
                  setChangeSortType(
                    option.value as "cheapest" | "early" | "nonstop"
                  )
                }
                className={`rounded-full px-3 py-1 text-[12px] font-medium transition ${
                  changeSortType === option.value
                    ? "bg-[#0ea5e9] text-white"
                    : "border border-[#e5e7eb] text-[#374151] hover:bg-[#f1f5f9]"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2 px-6 pb-6">
          {sortedChangeFlights.map((flight) => {
            const fare = getLowestFareForFlight(flight);
            const isCurrent =
              activeChangeSelection?.flight.id === flight.id &&
              activeChangeSelection?.fare.id === fare.id;

            return (
              <div
                key={flight.id}
                className={`rounded-2xl border px-6 py-3 shadow-sm transition ${
                  isCurrent
                    ? "border-[#38bdf8] bg-[#eef9ff]"
                    : "border-[#e5e7eb] bg-white"
                }`}
              >
                <div className="grid grid-cols-[220px_120px_minmax(150px,1fr)_120px_170px] items-center gap-4">
                  <div className="min-w-0">
                    <div className="text-[16px] font-bold text-[#111827]">
                      {flight.airline}
                    </div>
                    <div className="mt-1 text-[12px] text-[#374151]">
                      {flight.flightNumber}
                    </div>
                    {flight.seatLeft ? (
                      <div className="mt-3 inline-flex rounded-full bg-[#fdecee] px-2.5 py-1 text-[11px] font-medium text-[#c2415d]">
                        Seats left: {flight.seatLeft}
                      </div>
                    ) : null}
                  </div>

                  <div className="text-center">
                    <div className="text-[22px] font-bold leading-none text-[#111827]">
                      {flight.departureTime}
                    </div>
                    <div className="mt-1 text-[13px] text-[#374151]">
                      {flight.fromCity}
                    </div>
                  </div>

                  <div className="min-w-0 text-center">
                    <FlightStopInfo
                      duration={flight.duration}
                      stopsText={flight.stopsText}
                      baggage={flight.baggage}
                      stopCount={flight.stopCount}
                      layovers={getLayoverData(flight)}
                    />
                  </div>

                  <div className="text-center">
                    <div className="text-[22px] font-bold leading-none text-[#111827]">
                      {flight.arrivalTime}
                    </div>
                    <div className="mt-1 text-[13px] text-[#374151]">
                      {flight.toCity}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-[18px] font-bold text-[#111827]">
                      ₹{fare.price.toLocaleString("en-IN")}
                    </div>
                    <div className="mt-1 text-[11px] text-[#6b7280]">
                      {fare.label}
                    </div>
                    <div className="mt-1 text-[11px] text-[#6b7280]">
                      {fare.subtitle}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleReplaceFlight(flight)}
                      className={`mt-3 rounded-full px-4 py-2 text-[12px] font-semibold transition ${
                        isCurrent
                          ? "bg-[#dbeafe] text-[#1d4ed8]"
                          : "border border-[#0ea5e9] bg-white text-[#0284c7] hover:bg-[#eef9ff]"
                      }`}
                    >
                      {isCurrent ? "Current Flight" : "Select This Flight"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </MultiCityModal>
    </>
  );
}