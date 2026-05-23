"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  RoundTripFlight,
  FlightFareOption,
} from "@/app/components/flight/data/roundtripFlights";
import RoundTripFareSummary from "./RoundTripFareSummary";
import { saveFlightReviewPayload } from "@/app/lib/flights/review/buildFlightReviewData";

type DetailTab = "flight" | "fare" | "rules" | "baggage";

type RoundTripStickySummaryProps = {
  departure: RoundTripFlight | null;
  returnFlight: RoundTripFlight | null;
  departureFare?: FlightFareOption | null;
  returnFare?: FlightFareOption | null;
};

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
  "GOP",
  "IXR",
  "IMF",
  "DIB",
  "DMU",
  "IXA",
  "JLR",
  "HBX",
  "RAJ",
  "BHU",
  "DED",
  "SAG",
  "TIR",
  "VGA",
  "MYQ",
  "STV",
  "NDC",
  "JGA",
  "BDQ",
  "CCJ",
  "CNN",
  "CJB",
  "IXM",
  "TRZ",
  "TCR",
  "AGX",
]);

function normalizeValue(value: string | null | undefined) {
  return (value || "").trim();
}

function normalizeCode(value: string | null | undefined) {
  return normalizeValue(value).toUpperCase();
}

function normalizeCountry(value: string | null | undefined) {
  return normalizeValue(value).toLowerCase();
}

function formatRupee(value: number) {
  return `₹ ${Math.max(0, Math.round(value)).toLocaleString("en-IN")}`;
}

function normalizeSearchDate(value: string | null | undefined) {
  const raw = normalizeValue(value);
  if (!raw) return "";

  const dateOnlyMatch = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (dateOnlyMatch) return raw;

  const isoMatch = raw.match(/^(\d{4})-(\d{2})-(\d{2})T/);

  if (isoMatch) {
    const parsed = new Date(raw);

    if (!Number.isNaN(parsed.getTime())) {
      const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).formatToParts(parsed);

      const year = parts.find((p) => p.type === "year")?.value || isoMatch[1];
      const month = parts.find((p) => p.type === "month")?.value || isoMatch[2];
      const day = parts.find((p) => p.type === "day")?.value || isoMatch[3];

      return `${year}-${month}-${day}`;
    }

    return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;
  }

  return raw;
}

function detectTripMode(params: URLSearchParams, fromCode: string, toCode: string) {
  const fromCountry =
    normalizeCountry(params.get("fromCountry")) ||
    normalizeCountry(params.get("fromCountry_0"));

  const toCountry =
    normalizeCountry(params.get("toCountry")) ||
    normalizeCountry(params.get("toCountry_0"));

  if (fromCountry && toCountry) {
    return fromCountry === "india" && toCountry === "india"
      ? "domestic"
      : "international";
  }

  const normalizedFromCode = normalizeCode(fromCode);
  const normalizedToCode = normalizeCode(toCode);

  if (
    normalizedFromCode &&
    normalizedToCode &&
    INDIAN_AIRPORT_CODES.has(normalizedFromCode) &&
    INDIAN_AIRPORT_CODES.has(normalizedToCode)
  ) {
    return "domestic";
  }

  return "international";
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

  const title =
    offer.title ||
    offer.name ||
    offer.offerTitle ||
    "Offer applied";

  const minBookingValue = Number(
    offer.minBookingValue ||
      offer.minimumBookingValue ||
      offer.minAmount ||
      offer.minValue ||
      0
  );

  const discountMode = String(
    offer.discountMode ||
      offer.discountType ||
      offer.type ||
      offer.offerType ||
      ""
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
    offer.discountAmount ||
      offer.appliedOfferAmount ||
      offer.flatDiscount ||
      offer.amount ||
      0
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
  const smartOffer =
    readJsonStorage("tpl_smart_active_offer_v1") ||
    readJsonStorage("tplActiveOfferPayload") ||
    readJsonStorage("tplActiveOfferActivation");

  return resolveOfferFromRaw(smartOffer);
}

function calculateOfferDiscount(baseAmount: number, offer: ActiveOfferSnapshot | null) {
  if (!offer || baseAmount <= 0) return 0;

  if (offer.minBookingValue > 0 && baseAmount < offer.minBookingValue) {
    return 0;
  }

  if (offer.discountType === "percent") {
    const percentDiscount = Math.round((baseAmount * offer.discountValue) / 100);
    return offer.maxDiscount > 0
      ? Math.min(percentDiscount, offer.maxDiscount)
      : percentDiscount;
  }

  return Math.min(Math.round(offer.discountValue), baseAmount);
}

export default function RoundTripStickySummary({
  departure,
  returnFlight,
  departureFare,
  returnFare,
}: RoundTripStickySummaryProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [showFareDetails, setShowFareDetails] = useState(false);
  const [openDetailsFor, setOpenDetailsFor] = useState<"departure" | "return" | null>(null);
  const [activeTab, setActiveTab] = useState<DetailTab>("flight");
  const [activeOffer, setActiveOffer] = useState<ActiveOfferSnapshot | null>(null);

  const detailsPanelRef = useRef<HTMLDivElement | null>(null);
  const stickyBarRef = useRef<HTMLDivElement | null>(null);
  const farePopupRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setActiveOffer(getActiveFlightOffer());

    const syncOffer = () => setActiveOffer(getActiveFlightOffer());

    window.addEventListener("storage", syncOffer);
    window.addEventListener("TPL_SMART_OFFER_UPDATED", syncOffer as EventListener);
    window.addEventListener("TPL_ACTIVE_OFFER_UPDATED", syncOffer as EventListener);
    window.addEventListener("tpl_smart_offer_updated", syncOffer as EventListener);

    return () => {
      window.removeEventListener("storage", syncOffer);
      window.removeEventListener("TPL_SMART_OFFER_UPDATED", syncOffer as EventListener);
      window.removeEventListener("TPL_ACTIVE_OFFER_UPDATED", syncOffer as EventListener);
      window.removeEventListener("tpl_smart_offer_updated", syncOffer as EventListener);
    };
  }, []);

  const fareSummary = useMemo(() => {
    const departurePrice = departureFare?.price || departure?.price || 0;
    const returnPrice = returnFare?.price || returnFlight?.price || 0;

    const totalBaseFare = departurePrice + returnPrice;
    const returnTripDiscount = departure && returnFlight ? 0 : 0;
    const appliedOffer = departure && returnFlight
      ? calculateOfferDiscount(totalBaseFare, activeOffer)
      : 0;

    const baseAfterOffer = Math.max(totalBaseFare - appliedOffer, 0);
    const totalAmount = baseAfterOffer - returnTripDiscount;
    const earnedOnThisBooking = Math.round(baseAfterOffer * 0.02);

    return {
      totalBaseFare,
      returnTripDiscount,
      appliedOffer,
      baseAfterOffer,
      earnedOnThisBooking,
      totalAmount,
      departurePrice,
      returnPrice,
    };
  }, [departure, returnFlight, departureFare, returnFare, activeOffer]);

  const canBook = Boolean(departure && returnFlight);

  const detailFlight =
    openDetailsFor === "departure"
      ? departure
      : openDetailsFor === "return"
      ? returnFlight
      : null;

  const detailFare =
    openDetailsFor === "departure"
      ? departureFare
      : openDetailsFor === "return"
      ? returnFare
      : null;

  const selectedDetailPrice = detailFare?.price || detailFlight?.price || 0;

  const openDetails = (target: "departure" | "return") => {
    setOpenDetailsFor(target);
    setActiveTab("flight");
    setShowFareDetails(false);
  };

  const closeDetails = () => {
    setOpenDetailsFor(null);
  };

  const toggleFareDetails = () => {
    setShowFareDetails((prev) => !prev);
    setOpenDetailsFor(null);
  };

  const openDetailedRules = () => {
    window.open("/fare-rules-details", "_blank");
  };

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      const target = event.target as Node;

      const clickedInsidePanel = detailsPanelRef.current?.contains(target);
      const clickedInsideSticky = stickyBarRef.current?.contains(target);
      const clickedInsideFarePopup = farePopupRef.current?.contains(target);

      if (openDetailsFor && !clickedInsidePanel && !clickedInsideSticky) {
        setOpenDetailsFor(null);
      }

      if (showFareDetails && !clickedInsideFarePopup && !clickedInsideSticky) {
        setShowFareDetails(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [openDetailsFor, showFareDetails]);

  const renderTabButton = (tab: DetailTab, label: string) => {
    const isActive = activeTab === tab;

    return (
      <button
        type="button"
        onClick={() => setActiveTab(tab)}
        className={`border-b-2 px-3 py-2 text-[13px] font-semibold transition ${
          isActive
            ? "border-[#ef4444] text-[#ef4444]"
            : "border-transparent text-[#111827] hover:text-[#ef4444]"
        }`}
      >
        {label}
      </button>
    );
  };

  const handleBookNow = () => {
    if (!departure || !returnFlight) return;

    const adults = Math.max(Number(searchParams.get("adults") || "1"), 1);
    const children = Math.max(Number(searchParams.get("children") || "0"), 0);
    const infants = Math.max(Number(searchParams.get("infants") || "0"), 0);
    const cabinClass = searchParams.get("cabin") || "Economy";

    const fromCode = normalizeCode(searchParams.get("from")) || departure.fromCode || "";
    const toCode = normalizeCode(searchParams.get("to")) || departure.toCode || "";

    const fromCity = normalizeValue(searchParams.get("fromCity")) || departure.fromCity || "";
    const toCity = normalizeValue(searchParams.get("toCity")) || departure.toCity || "";

    const onwardDepartureDate = normalizeSearchDate(searchParams.get("departure"));
    const returnDepartureDate = normalizeSearchDate(searchParams.get("returnDate"));

    const baseFareTotal = fareSummary.totalBaseFare * adults;
    const appliedOffer = calculateOfferDiscount(baseFareTotal, activeOffer);
    const baseAfterOffer = Math.max(baseFareTotal - appliedOffer, 0);

    const discount = fareSummary.returnTripDiscount || 0;
    const tplCredit = 0;
    const surcharge = 0;
    const tax = 0;

    const tripMode = detectTripMode(searchParams, fromCode, toCode);

    saveFlightReviewPayload({
      bookingType: "roundTrip",
      tripMode,
      passengers: {
        adults,
        children,
        infants,
      },
      cabinClass,
      pricing: {
        perAdultBaseFare: fareSummary.totalBaseFare,
        baseFareTotal,
        appliedOffer,
        appliedOfferCode: activeOffer?.code || "",
        appliedOfferTitle: activeOffer?.title || "",
        baseAfterOffer,
        earnedOnThisBooking: Math.round(baseAfterOffer * 0.02),
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
      journeys: [
        {
          journeyLabel: "Onward Journey",
          segments: [
            {
              airline: departure.airline,
              flightNumber: departure.flightNumber,
              from: fromCity || departure.fromCity || departure.fromCode,
              to: toCity || departure.toCity || departure.toCode,
              fromCode: fromCode || departure.fromCode,
              toCode: toCode || departure.toCode,
              departureTime: departure.departureTime,
              arrivalTime: departure.arrivalTime,
              departureDate: onwardDepartureDate,
              arrivalDate: onwardDepartureDate,
              duration: departure.duration,
              cabinBaggage: departure.cabinBag || "7 Kg / Adult",
              checkinBaggage: departure.checkInBag || "15 Kg / Adult",
              aircraft: "",
              terminalFrom: departure.fromCity,
              terminalTo: departure.toCity,
            },
          ],
          layovers:
            departure.stopType && departure.stopType !== "Non Stop"
              ? [
                  {
                    airport: departure.toCity,
                    code: departure.toCode,
                    duration: departure.duration,
                    note: departure.stopType,
                  },
                ]
              : [],
        },
        {
          journeyLabel: "Return Journey",
          segments: [
            {
              airline: returnFlight.airline,
              flightNumber: returnFlight.flightNumber,
              from: toCity || returnFlight.fromCity || returnFlight.fromCode,
              to: fromCity || returnFlight.toCity || returnFlight.toCode,
              fromCode: returnFlight.fromCode || toCode,
              toCode: returnFlight.toCode || fromCode,
              departureTime: returnFlight.departureTime,
              arrivalTime: returnFlight.arrivalTime,
              departureDate: returnDepartureDate,
              arrivalDate: returnDepartureDate,
              duration: returnFlight.duration,
              cabinBaggage: returnFlight.cabinBag || "7 Kg / Adult",
              checkinBaggage: returnFlight.checkInBag || "15 Kg / Adult",
              aircraft: "",
              terminalFrom: returnFlight.fromCity,
              terminalTo: returnFlight.toCity,
            },
          ],
          layovers:
            returnFlight.stopType && returnFlight.stopType !== "Non Stop"
              ? [
                  {
                    airport: returnFlight.toCity,
                    code: returnFlight.toCode,
                    duration: returnFlight.duration,
                    note: returnFlight.stopType,
                  },
                ]
              : [],
        },
      ],
    });

    router.push("/flights/review");
  };

  const renderDetailsPanelContent = () => {
    if (!detailFlight) return null;

    if (activeTab === "flight") {
      return (
        <div className="px-4 py-4">
          <div className="mb-4 text-[16px] font-semibold text-[#111827]">
            {detailFlight.fromCity} → {detailFlight.toCity}
          </div>

          <div className="grid grid-cols-4 items-start gap-5">
            <div>
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-md bg-[#1d4ed8] text-[11px] font-bold text-white">
                {detailFlight.logoText}
              </div>
              <div className="text-[13px] font-semibold text-[#111827]">
                {detailFlight.flightNumber}
              </div>
              <div className="text-[12px] text-[#6b7280]">Economy</div>
              <div className="mt-1 text-[12px] text-[#dc2626]">
                CB: {detailFlight.seatsLeft || 9} seats left
              </div>
            </div>

            <div>
              <div className="text-[14px] font-semibold text-[#111827]">
                {detailFlight.departureTime}
              </div>
              <div className="mt-1 text-[13px] text-[#111827]">
                {detailFlight.fromCity}, India
              </div>
              <div className="text-[12px] text-[#6b7280]">
                {detailFlight.fromCity} {detailFlight.terminal || "Terminal 1"}
              </div>
            </div>

            <div className="pt-1 text-center">
              <div className="text-[13px] font-medium text-[#111827]">
                {detailFlight.stopType}
              </div>
              <div className="text-[13px] text-[#111827]">
                {detailFlight.duration}
              </div>
            </div>

            <div>
              <div className="text-[14px] font-semibold text-[#111827]">
                {detailFlight.arrivalTime}
              </div>
              <div className="mt-1 text-[13px] text-[#111827]">
                {detailFlight.toCity}, India
              </div>
              <div className="text-[12px] text-[#6b7280]">
                {detailFlight.toCity} Airport
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === "fare") {
      const basePrice = Math.max(selectedDetailPrice - 1054, 0);

      return (
        <div className="px-4 py-4">
          <div className="grid grid-cols-[1.3fr_1fr_1fr] border-b border-[#e5e7eb] pb-2 text-[13px] font-semibold text-[#111827]">
            <div>TYPE</div>
            <div>Fare</div>
            <div>Total</div>
          </div>

          <div className="py-3 text-[13px] text-[#111827]">
            <div className="mb-2 text-[13px] text-[#6b7280]">
              Fare Details for Adult
            </div>

            <div className="grid grid-cols-[1.3fr_1fr_1fr] py-1.5">
              <div>Base Price</div>
              <div>₹{basePrice.toLocaleString("en-IN")} x 1</div>
              <div>₹{basePrice.toLocaleString("en-IN")}</div>
            </div>

            <div className="grid grid-cols-[1.3fr_1fr_1fr] py-1.5">
              <div>Taxes and fees</div>
              <div>₹1,054 x 1</div>
              <div>₹1,054</div>
            </div>

            <div className="mt-2 grid grid-cols-[1.3fr_1fr_1fr] border-t border-[#e5e7eb] pt-2 text-[16px] font-semibold">
              <div>Total</div>
              <div></div>
              <div>₹{selectedDetailPrice.toLocaleString("en-IN")}</div>
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === "rules") {
      return (
        <div className="px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={openDetailedRules}
              className="rounded bg-[#fff7ed] px-3 py-1.5 text-[12px] font-semibold text-[#d97706]"
            >
              Detailed Rules
            </button>

            <div className="text-[13px] text-[#111827]">
              Sorry, unable to fetch fare rules from airline. Please refer to detailed
              fare rules or contact customer service.
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="px-4 py-4">
        <div className="grid grid-cols-3 border-b border-[#e5e7eb] pb-2 text-[13px] font-semibold text-[#111827]">
          <div>SECTOR</div>
          <div>CHECKIN</div>
          <div>CABIN</div>
        </div>

        <div className="grid grid-cols-3 py-3 text-[13px] text-[#111827]">
          <div>
            {detailFlight.fromCode}-{detailFlight.toCode}
          </div>
          <div>Adult : {detailFlight.checkInBag || "15 Kg"}</div>
          <div>Adult : {detailFlight.cabinBag || "7 Kg"}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="sticky bottom-0 z-20 mt-4 w-full">
      <div ref={stickyBarRef} className="relative">
        <div className="overflow-hidden rounded-[10px] bg-[#07204B] text-white shadow-2xl">
          {canBook && fareSummary.appliedOffer > 0 && activeOffer ? (
            <div className="flex items-center justify-between gap-3 border-b border-white/15 bg-[#fff7ed] px-5 py-2 text-[#111827]">
              <div className="flex flex-wrap items-center gap-2 text-[12px]">
                <span className="font-semibold text-[#15803d]">
                  Offer applied on base fare only:
                </span>

                <span className="text-gray-600">
                  {formatRupee(fareSummary.totalBaseFare)} -{" "}
                  {formatRupee(fareSummary.appliedOffer)} =
                </span>

                <span className="font-bold text-[#111827]">
                  {formatRupee(fareSummary.baseAfterOffer)}
                </span>

                <span className="text-[#6b7280]">
                  · Earn {formatRupee(fareSummary.earnedOnThisBooking)} TPL Earned Credit
                </span>
              </div>

              <span className="shrink-0 rounded-full bg-[#16a34a] px-3 py-1 text-[11px] font-bold text-white">
                {activeOffer.code || "OFFER"} applied · Save{" "}
                {formatRupee(fareSummary.appliedOffer)}
              </span>
            </div>
          ) : null}

          <div className="grid grid-cols-1 xl:grid-cols-[1.0fr_1.0fr_1.3fr]">
            <div className="border-b border-white/15 px-5 py-2 xl:border-b-0 xl:border-r">
              {departure ? (
                <div className="mt-1">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-white/80">Departure</p>
                    <p className="text-base font-semibold text-white">
                      {departure.airline}
                    </p>
                  </div>

                  <p className="mt-1 text-lg font-bold">
                    {departure.departureTime} → {departure.arrivalTime}
                  </p>

                  <div className="mt-2 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-sky-300">
                        Selected fare
                      </p>
                      <button
                        type="button"
                        onClick={() => openDetails("departure")}
                        className="mt-1 text-[12px] font-medium text-sky-300 hover:text-sky-200"
                      >
                        View Details
                      </button>
                    </div>

                    <p className="text-xl font-bold">
                      ₹ {fareSummary.departurePrice.toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="mt-3 text-sm text-white/70">
                  Select departure flight
                </p>
              )}
            </div>

            <div className="border-b border-white/15 px-5 py-2 xl:border-b-0 xl:border-r">
              {returnFlight ? (
                <div className="mt-1">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-white/80">Return</p>
                    <p className="text-base font-semibold text-white">
                      {returnFlight.airline}
                    </p>
                  </div>

                  <p className="mt-1 text-lg font-bold">
                    {returnFlight.departureTime} → {returnFlight.arrivalTime}
                  </p>

                  <div className="mt-2 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-sky-300">
                        Selected fare
                      </p>
                      <button
                        type="button"
                        onClick={() => openDetails("return")}
                        className="mt-1 text-[12px] font-medium text-sky-300 hover:text-sky-200"
                      >
                        View Details
                      </button>
                    </div>

                    <p className="text-xl font-bold">
                      ₹ {fareSummary.returnPrice.toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="mt-3 text-sm text-white/70">
                  Select return flight
                </p>
              )}
            </div>

            <div className="px-5 py-2">
              <div className="flex h-full items-start justify-between gap-4">
                <div>
                  {canBook && fareSummary.appliedOffer > 0 ? (
                    <div>
                      <p className="text-sm font-semibold text-white/55 line-through">
                        {formatRupee(fareSummary.totalBaseFare)}
                      </p>

                      <p className="text-2xl font-bold">
                        {formatRupee(fareSummary.totalAmount)}
                      </p>
                    </div>
                  ) : (
                    <p className="text-2xl font-bold">
                      {canBook
                        ? formatRupee(fareSummary.totalAmount)
                        : "--"}
                    </p>
                  )}

                  <p className="text-xs text-white/70">/adult</p>

                  {fareSummary.returnTripDiscount > 0 && (
                    <p className="mt-2 text-sm text-emerald-300">
                      Return discount applied ₹{" "}
                      {fareSummary.returnTripDiscount.toLocaleString("en-IN")}
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={toggleFareDetails}
                    className="mt-2 text-sm font-medium text-sky-300 hover:text-sky-200"
                  >
                    Fare Details
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleBookNow}
                  disabled={!canBook}
                  className={`mt-[1px] rounded-full px-6 py-3 text-sm font-semibold transition ${
                    canBook
                      ? "bg-sky-400 text-slate-950 hover:bg-sky-300"
                      : "cursor-not-allowed bg-white/10 text-white/50"
                  }`}
                >
                  BOOK NOW
                </button>
              </div>
            </div>
          </div>

          {showFareDetails && (
            <div
              ref={farePopupRef}
              className="absolute bottom-[100%] right-[170px] z-30 "
            >
              <div className="relative">
                <RoundTripFareSummary
                  totalBaseFare={fareSummary.totalBaseFare}
                  returnTripDiscount={fareSummary.returnTripDiscount}
                  totalAmount={fareSummary.totalAmount}
                />

                <div className="absolute left-1/2 top-full h-4 w-4 -translate-x-1/2 -translate-y-1/2 rotate-45 border-r border-b border-[#e5e7eb] bg-white" />
              </div>
            </div>
          )}
        </div>
      </div>

      {detailFlight && openDetailsFor && (
        <div
          ref={detailsPanelRef}
          className="mt-0 overflow-hidden rounded-xl border border-[#dbe4ef] bg-[#f8fbff] shadow-xl"
        >
          <div className="flex items-center justify-between border-b border-[#dbe4ef] px-4 pr-6">
            <div className="flex items-center gap-1">
              {renderTabButton("flight", "Flight Details")}
              {renderTabButton("fare", "Fare Details")}
              {renderTabButton("rules", "Fare Rules")}
              {renderTabButton("baggage", "Baggage Information")}
            </div>

            <button
              type="button"
              onClick={closeDetails}
              className="flex h-10 w-10 items-center justify-center text-[30px] leading-none text-[#111827]"
            >
              ×
            </button>
          </div>

          {renderDetailsPanelContent()}
        </div>
      )}
    </div>
  );
}