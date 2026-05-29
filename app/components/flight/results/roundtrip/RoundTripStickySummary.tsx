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

function detectTripMode(
  params: URLSearchParams,
  fromCode: string,
  toCode: string
) {
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
    offer.title || offer.name || offer.offerTitle || "Offer applied";

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

function calculateOfferDiscount(
  baseAmount: number,
  offer: ActiveOfferSnapshot | null
) {
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
  const [openDetailsFor, setOpenDetailsFor] = useState<
    "departure" | "return" | null
  >(null);
  const [activeTab, setActiveTab] = useState<DetailTab>("flight");
  const [activeOffer, setActiveOffer] = useState<ActiveOfferSnapshot | null>(
    null
  );

  const detailsPanelRef = useRef<HTMLDivElement | null>(null);
  const stickyBarRef = useRef<HTMLDivElement | null>(null);
  const farePopupRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setActiveOffer(getActiveFlightOffer());

    const syncOffer = () => setActiveOffer(getActiveFlightOffer());

    window.addEventListener("storage", syncOffer);
    window.addEventListener(
      "TPL_SMART_OFFER_UPDATED",
      syncOffer as EventListener
    );
    window.addEventListener(
      "TPL_ACTIVE_OFFER_UPDATED",
      syncOffer as EventListener
    );
    window.addEventListener(
      "tpl_smart_offer_updated",
      syncOffer as EventListener
    );

    return () => {
      window.removeEventListener("storage", syncOffer);
      window.removeEventListener(
        "TPL_SMART_OFFER_UPDATED",
        syncOffer as EventListener
      );
      window.removeEventListener(
        "TPL_ACTIVE_OFFER_UPDATED",
        syncOffer as EventListener
      );
      window.removeEventListener(
        "tpl_smart_offer_updated",
        syncOffer as EventListener
      );
    };
  }, []);

  const fareSummary = useMemo(() => {
    const departurePrice = departureFare?.price || departure?.price || 0;
    const returnPrice = returnFare?.price || returnFlight?.price || 0;

    const totalBaseFare = departurePrice + returnPrice;
    const returnTripDiscount = departure && returnFlight ? 0 : 0;
    const appliedOffer =
      departure && returnFlight
        ? calculateOfferDiscount(totalBaseFare, activeOffer)
        : 0;

    const baseAfterOffer = Math.max(totalBaseFare - appliedOffer, 0);

const tax = Math.round(totalBaseFare * 0.18);

const totalAmount =
  baseAfterOffer + tax - returnTripDiscount;
    const earnedOnThisBooking = Math.round(baseAfterOffer * 0.02);

    return {
      totalBaseFare,
      returnTripDiscount,
      appliedOffer,
      baseAfterOffer,
      tax,
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
        className={`shrink-0 rounded-full px-3 py-2 text-[12px] font-black transition sm:text-[13px] ${
          isActive
            ? "bg-slate-950 text-white shadow-sm"
            : "text-slate-600 hover:bg-white hover:text-slate-950"
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

    const fromCode =
      normalizeCode(searchParams.get("from")) || departure.fromCode || "";
    const toCode =
      normalizeCode(searchParams.get("to")) || departure.toCode || "";

    const fromCity =
      normalizeValue(searchParams.get("fromCity")) || departure.fromCity || "";
    const toCity =
      normalizeValue(searchParams.get("toCity")) || departure.toCity || "";

    const onwardDepartureDate = normalizeSearchDate(
      searchParams.get("departure")
    );
    const returnDepartureDate = normalizeSearchDate(
      searchParams.get("returnDate")
    );

    const baseFareTotal = fareSummary.totalBaseFare * adults;
    const appliedOffer = calculateOfferDiscount(baseFareTotal, activeOffer);
    const baseAfterOffer = Math.max(baseFareTotal - appliedOffer, 0);

    const discount = fareSummary.returnTripDiscount || 0;
    const tplCredit = 0;
    const surcharge = 0;
    const tax = Math.round(baseFareTotal * 0.18);

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
        <div className="px-3 py-4 sm:px-5 sm:py-5">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="text-[16px] font-black text-slate-950 sm:text-[18px]">
              {detailFlight.fromCity} → {detailFlight.toCity}
            </span>
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
              {detailFlight.stopType}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:grid-cols-[150px_1fr_130px_1fr] sm:items-center sm:gap-5 sm:p-4">
            <div className="rounded-2xl bg-slate-50 p-3">
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-[#1d4ed8] text-[11px] font-black text-white shadow-sm">
                {detailFlight.logoText}
              </div>
              <div className="text-[13px] font-black text-slate-950">
                {detailFlight.flightNumber}
              </div>
              <div className="text-[12px] font-semibold text-slate-500">Economy</div>
              <div className="mt-2 inline-flex rounded-full bg-orange-50 px-2 py-1 text-[11px] font-bold text-orange-700">
                CB: {detailFlight.seatsLeft || 9} seats left
              </div>
            </div>

            <div className="min-w-0">
              <div className="text-[20px] font-black leading-none text-slate-950">
                {detailFlight.departureTime}
              </div>
              <div className="mt-2 text-[13px] font-semibold text-slate-700">
                {detailFlight.fromCity}, India
              </div>
              <div className="text-[12px] text-slate-500">
                {detailFlight.fromCity} {detailFlight.terminal || "Terminal 1"}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-center">
              <div className="text-[12px] font-black uppercase tracking-[0.08em] text-slate-500">
                {detailFlight.stopType}
              </div>
              <div className="my-2 flex items-center gap-1">
                <div className="h-px flex-1 bg-slate-300" />
                <div className="h-2 w-2 rounded-full bg-orange-500" />
                <div className="h-px flex-1 bg-slate-300" />
              </div>
              <div className="text-[13px] font-black text-slate-900">
                {detailFlight.duration}
              </div>
            </div>

            <div className="min-w-0 sm:text-right">
              <div className="text-[20px] font-black leading-none text-slate-950">
                {detailFlight.arrivalTime}
              </div>
              <div className="mt-2 text-[13px] font-semibold text-slate-700">
                {detailFlight.toCity}, India
              </div>
              <div className="text-[12px] text-slate-500">
                {detailFlight.toCity} Airport
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === "fare") {
      return (
        <div className="px-3 py-4 sm:px-5 sm:py-5">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-4 py-3">
              <div className="text-[15px] font-black text-slate-950">
                Fare Details for Adult
              </div>
              <div className="text-[11px] font-semibold text-slate-500">
                Result page fare preview
              </div>
            </div>

            <div className="space-y-3 px-4 py-4 text-[13px] text-slate-700">
              <div className="flex items-center justify-between gap-4">
                <span>Base Fare</span>
                <span className="font-semibold text-slate-950">
                  ₹{selectedDetailPrice.toLocaleString("en-IN")}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4 text-emerald-700">
                <span>Offer Discount</span>
                <span className="font-semibold">- ₹0</span>
              </div>

              <div className="border-t border-slate-200 pt-3">
                <div className="flex items-center justify-between gap-4 text-[15px] font-black text-slate-950">
                  <span>Flight Price after offer</span>
                  <span>₹{selectedDetailPrice.toLocaleString("en-IN")}</span>
                </div>

                <div className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-[11px] font-bold text-slate-500 sm:text-[12px]">
                  Taxes & fees shown on booking page.
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === "rules") {
      return (
        <div className="px-3 py-4 sm:px-5 sm:py-5">
          <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={openDetailedRules}
              className="w-fit rounded-full bg-orange-50 px-3 py-1.5 text-[12px] font-black text-orange-700"
            >
              Detailed Rules
            </button>

            <div className="text-[12px] font-medium text-slate-700 sm:text-[13px]">
              Sorry, unable to fetch fare rules from airline. Please refer to
              detailed fare rules or contact customer service.
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="px-3 py-4 sm:px-5 sm:py-5">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-[11px] font-black uppercase tracking-[0.1em] text-slate-400">Sector</div>
            <div className="mt-2 text-[13px] font-bold text-slate-950">
            {detailFlight.fromCode}-{detailFlight.toCode}
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-[11px] font-black uppercase tracking-[0.1em] text-slate-400">Check-in</div>
            <div className="mt-2 text-[13px] font-bold text-slate-950">Adult : {detailFlight.checkInBag || "15 Kg"}</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-[11px] font-black uppercase tracking-[0.1em] text-slate-400">Cabin</div>
            <div className="mt-2 text-[13px] font-bold text-slate-950">Adult : {detailFlight.cabinBag || "7 Kg"}</div>
          </div>
        </div>
      </div>
    );
  };

  return (
  <div className="relative w-full">
    <div className="md:hidden rounded-2xl bg-[#071b3d] p-3 text-white shadow-2xl">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex min-w-0 gap-1.5">
          <span
            className={`rounded-full px-2 py-1 text-[10px] font-black ${
              departure ? "bg-emerald-400/15 text-emerald-200" : "bg-white/10 text-white/65"
            }`}
          >
            Onward {departure ? "selected" : "pending"}
          </span>
          <span
            className={`rounded-full px-2 py-1 text-[10px] font-black ${
              returnFlight ? "bg-emerald-400/15 text-emerald-200" : "bg-white/10 text-white/65"
            }`}
          >
            Return {returnFlight ? "selected" : "pending"}
          </span>
        </div>

        <button
          type="button"
          onClick={toggleFareDetails}
          className="shrink-0 text-[11px] font-black text-sky-300"
        >
          Fare details
        </button>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_104px] items-end gap-3">
        <div className="min-w-0">
          {canBook ? (
            <div className="space-y-1">
              <div className="flex items-center justify-between gap-3 text-[10px] font-semibold text-white/70">
                <span>Base Fare</span>
                <span>{formatRupee(fareSummary.totalBaseFare)}</span>
              </div>

              <div className="flex items-center justify-between gap-3 text-[10px] font-black text-emerald-300">
                <span>Offer Discount</span>
                <span>-{formatRupee(fareSummary.appliedOffer)}</span>
              </div>

              <div className="flex items-center justify-between gap-3 text-[15px] font-black leading-tight">
                <span>Flight Price after offer</span>
                <span>{formatRupee(fareSummary.baseAfterOffer)}</span>
              </div>
            </div>
          ) : (
            <div className="text-[13px] font-semibold text-white/70">
              Select onward and return flights
            </div>
          )}

          <div className="mt-1 text-[10px] text-white/65">
            Taxes & fees shown on booking page.
          </div>
        </div>

        <div className="flex flex-col items-stretch gap-1.5">
          <button
            type="button"
            onClick={handleBookNow}
            disabled={!canBook}
            className={`h-10 rounded-xl px-3 text-[12px] font-black ${
              canBook
                ? "bg-sky-400 text-slate-950"
                : "cursor-not-allowed bg-white/10 text-white/50"
            }`}
          >
            BOOK NOW
          </button>
        </div>
      </div>
    </div>
      <div ref={stickyBarRef} className="relative hidden xl:block">
        <div className="overflow-hidden rounded-[10px] bg-[#07204B] text-white shadow-2xl">
          <div className="grid grid-cols-1 xl:grid-cols-[1.0fr_1.0fr_1.3fr]">
            <div className="border-b border-white/15 px-4 py-3 xl:border-b-0 xl:border-r">
              {departure ? (
                <div className="mt-1">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-medium text-white/80 sm:text-sm">
                      Departure
                    </p>
                    <p className="text-sm font-semibold text-white sm:text-base">
                      {departure.airline}
                    </p>
                  </div>

                  <p className="mt-1 text-base font-bold sm:text-lg">
                    {departure.departureTime} → {departure.arrivalTime}
                  </p>

                  <div className="mt-2 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-medium text-sky-300 sm:text-sm">
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

                    <p className="text-lg font-bold sm:text-xl">
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

            <div className="border-b border-white/15 px-4 py-3 xl:border-b-0 xl:border-r">
              {returnFlight ? (
                <div className="mt-1">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-medium text-white/80 sm:text-sm">
                      Return
                    </p>
                    <p className="text-sm font-semibold text-white sm:text-base">
                      {returnFlight.airline}
                    </p>
                  </div>

                  <p className="mt-1 text-base font-bold sm:text-lg">
                    {returnFlight.departureTime} → {returnFlight.arrivalTime}
                  </p>

                  <div className="mt-2 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-medium text-sky-300 sm:text-sm">
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

                    <p className="text-lg font-bold sm:text-xl">
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

            <div className="px-4 py-3 sm:px-5 sm:py-2">
              <div className="flex h-full flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  {canBook ? (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-4 text-[12px] font-semibold text-white/75">
                        <span>Base Fare</span>
                        <span>{formatRupee(fareSummary.totalBaseFare)}</span>
                      </div>

                      <div className="flex items-center justify-between gap-4 text-[12px] font-bold text-emerald-300">
                        <span>Offer Discount</span>
                        <span>-{formatRupee(fareSummary.appliedOffer)}</span>
                      </div>

                      <div className="flex items-center justify-between gap-4 text-[16px] font-bold text-white">
                        <span>Flight Price after offer</span>
                        <span>{formatRupee(fareSummary.baseAfterOffer)}</span>
                      </div>

                      <p className="text-[11px] font-medium text-white/60">
                        Taxes & fees shown on booking page.
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm font-medium text-white/70">
                      Select onward and return flights
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
                  className={`mt-[1px] w-full rounded-full px-6 py-3 text-sm font-semibold transition sm:w-auto ${
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


        </div>
      </div>

      {showFareDetails && (
        <div className="fixed inset-0 z-[130] flex items-end bg-black/45 px-3 pb-3 md:absolute md:bottom-[105%] md:left-auto md:right-[170px] md:top-auto md:z-30 md:block md:w-auto md:bg-transparent md:px-0 md:pb-0">
          <button
            type="button"
            aria-label="Close fare details"
            onClick={toggleFareDetails}
            className="absolute inset-0 md:hidden"
          />

          <div
            ref={farePopupRef}
            className="relative z-10 w-full overflow-hidden rounded-3xl bg-white md:w-auto md:overflow-visible md:rounded-none md:bg-transparent"
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 md:hidden">
              <div>
                <div className="text-[15px] font-black text-slate-900">
                  Fare details
                </div>
                <div className="text-[11px] font-semibold text-slate-500">
                  Base Fare and Offer Discount
                </div>
              </div>

              <button
                type="button"
                onClick={toggleFareDetails}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-[22px] font-bold text-slate-900"
              >
                ×
              </button>
            </div>

            <RoundTripFareSummary
              totalBaseFare={fareSummary.totalBaseFare}
              appliedOffer={fareSummary.appliedOffer}
              baseAfterOffer={fareSummary.baseAfterOffer}
              returnTripDiscount={fareSummary.returnTripDiscount}
            />

            <div className="absolute left-1/2 top-full hidden h-4 w-4 -translate-x-1/2 -translate-y-1/2 rotate-45 border-r border-b border-[#e5e7eb] bg-white md:block" />
          </div>
        </div>
      )}

      {detailFlight && openDetailsFor && (
        <div
          ref={detailsPanelRef}
          className="mt-0 overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 shadow-2xl"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-slate-100/80 px-3 py-2 sm:px-4 sm:pr-6">
            <div className="flex max-w-full items-center gap-1 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {renderTabButton("flight", "Flight Details")}
              {renderTabButton("fare", "Fare Details")}
              {renderTabButton("rules", "Fare Rules")}
              {renderTabButton("baggage", "Baggage Information")}
            </div>

            <button
              type="button"
              onClick={closeDetails}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[24px] leading-none text-slate-700 shadow-sm sm:h-10 sm:w-10"
            >
              ×
            </button>
          </div>

          <div className="max-h-[55vh] overflow-y-auto sm:max-h-none sm:overflow-visible">
            {renderDetailsPanelContent()}
          </div>
        </div>
      )}
    </div>
  );
}
