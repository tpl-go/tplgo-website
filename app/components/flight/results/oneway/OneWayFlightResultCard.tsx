"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import OneWayCardMainRow from "./card/OneWayCardMainRow";
import OneWayCardDetailsPanel from "./card/OneWayCardDetailsPanel";
import OneWayCardComparePanel from "./card/OneWayCardComparePanel";
import OneWayModal from "./card/OneWayModal";
import { DetailTab, Fare, StopDetail } from "./card/OneWayCardTypes";
import type { FlightFareOption } from "@/app/components/flight/data/flightDummyData";
import {
  formatFlightMoney,
  normalizeFlightCurrency,
  type FlightCurrency,
} from "@/app/lib/flights/flightCurrency";
import { saveFlightReviewPayload } from "@/app/lib/flights/review/buildFlightReviewData";
import {
  formatAirportLocalDate,
  formatAirportLocalTime,
  formatDayOffset,
  formatDurationFromSchedule,
} from "@/app/lib/flights/flightScheduleTime";
import type { BackendFlightItinerary, BackendFlightSegment } from "@/app/lib/api/flightSearchApi";

type Props = {
  airline: string;
  code: string;
  depart: string;
  departCity: string;
  duration: string;
  stop: string;
  arrive: string;
  arriveCity: string;
  price: string;
  currency?: FlightCurrency;
  timing: string;
  promo: string;
  stopDetails?: StopDetail[];
  backendFares?: FlightFareOption[];
  backendOffer?: {
    searchId: string;
    offerId: string;
    fareId?: string;
    expiresAt?: string;
    backendRequestId?: string;
    priceTotal?: number;
    currency?: FlightCurrency;
    supplierPrice?: {
      amount: number;
      currency: FlightCurrency;
    };
    displayPrice?: {
      amount: number;
      currency: FlightCurrency;
      fxRate?: string;
      fxSource?: string;
      fxTimestamp?: string;
      roundingVersion?: string;
    };
    paymentQuote?: {
      supplierAmount: number;
      supplierCurrency: FlightCurrency;
      displayAmount: number;
      displayCurrency: FlightCurrency;
      payableAmount: number;
      payableCurrency: FlightCurrency;
      fxRate?: string;
      fxTimestamp?: string;
      expiresAt: string;
      quoteId: string;
    };
    baggageAllowance?: {
      cabin?: string;
      checked?: string;
      summary?: string;
      source: "provider" | "not_provided";
    };
    availability?: {
      seatsRemaining?: number;
      source: "provider" | "not_provided";
    };
    itineraries?: BackendFlightItinerary[];
    smokeRunId?: string;
  };
};

type ActiveOfferSnapshot = {
  code: string;
  title: string;
  discountType: "flat" | "percent";
  discountValue: number;
  maxDiscount: number;
  minBookingValue: number;
};

const COMPARE_VISIBLE_COUNT = 3;

const INDIAN_AIRPORT_CODES = new Set([
  "DEL","BOM","BLR","HYD","MAA","CCU","AMD","PNQ","GOI","COK","JAI","LKO",
  "IXC","PAT","SXR","GAU","BBI","NAG","IDR","VTZ","TRV","IXB","VNS","RPR",
  "UDR","JDH","ATQ","BHO","GOP","IXR","IMF","DIB","DMU","IXA","JLR","HBX",
  "RAJ","BHU","DED","SAG","TIR","VGA","MYQ","STV","NDC","JGA","BDQ","CCJ",
  "CNN","CJB","IXM","TRZ","TCR","AGX",
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

function parseFareNumber(value: string) {
  return Number(String(value || "").replace(/[^\d.]/g, "")) || 0;
}

function formatFare(value: number, currency: FlightCurrency) {
  return formatFlightMoney(Math.max(0, value), currency);
}

function providerBaggageText(backendOffer: Props["backendOffer"]) {
  if (backendOffer?.baggageAllowance?.source === "provider" && backendOffer.baggageAllowance.summary) {
    return backendOffer.baggageAllowance.summary;
  }
  return "Not provided by supplier";
}

function providerBaggageSummaryPart(backendOffer: Props["backendOffer"], kind: "cabin" | "checked") {
  if (backendOffer?.baggageAllowance?.source !== "provider" || !backendOffer.baggageAllowance.summary) {
    return "";
  }
  const parts = backendOffer.baggageAllowance.summary
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  const match = parts.find((part) => {
    const normalized = part.toLowerCase();
    return kind === "cabin"
      ? normalized.includes("carry") || normalized.includes("cabin")
      : normalized.includes("checked") || normalized.includes("check-in");
  });
  return match || "";
}

function providerCabinBaggage(backendOffer: Props["backendOffer"]) {
  if (backendOffer?.baggageAllowance?.source === "provider" && backendOffer.baggageAllowance.cabin) {
    return backendOffer.baggageAllowance.cabin;
  }
  const summaryPart = providerBaggageSummaryPart(backendOffer, "cabin");
  if (summaryPart) return summaryPart;
  return "Cabin not provided";
}

function providerCheckedBaggage(backendOffer: Props["backendOffer"]) {
  if (backendOffer?.baggageAllowance?.source === "provider" && backendOffer.baggageAllowance.checked) {
    return backendOffer.baggageAllowance.checked;
  }
  const summaryPart = providerBaggageSummaryPart(backendOffer, "checked");
  if (summaryPart) return summaryPart;
  return "Checked not provided";
}

function availabilityLabel(backendOffer: Props["backendOffer"]) {
  const seats = Number(backendOffer?.availability?.seatsRemaining);
  if (
    backendOffer?.availability?.source === "provider" &&
    Number.isFinite(seats) &&
    seats > 0
  ) {
    return `${seats} seats left`;
  }
  return "Subject to recheck";
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

  if (
    INDIAN_AIRPORT_CODES.has(normalizeCode(fromCode)) &&
    INDIAN_AIRPORT_CODES.has(normalizeCode(toCode))
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

export default function FlightResultCard(props: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const {
    airline,
    code,
    depart,
    departCity,
    duration,
    stop,
    arrive,
    arriveCity,
      stopDetails = [],
    backendFares,
    backendOffer,
  } = props;

  const displayCurrency = normalizeFlightCurrency(backendOffer?.currency || props.currency);
  const baseCardFare = useMemo(
    () => Number(backendOffer?.priceTotal || 0) || parseFareNumber(props.price),
    [backendOffer?.priceTotal, props.price]
  );
  const [activeOffer, setActiveOffer] = useState<ActiveOfferSnapshot | null>(null);

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

  const fares: Fare[] = useMemo(() => {
    if (backendOffer && Array.isArray(backendFares) && backendFares.length > 0) {
      return backendFares.map((fare, index) => {
        const amount = Number(fare.price || 0);
        const currency = normalizeFlightCurrency(fare.currency || displayCurrency);
        return {
          id: fare.id || `backend-fare-${index + 1}`,
          title: fare.title || "Published",
          price: formatFare(amount, currency),
          priceAmount: amount,
          currency,
          baggage: fare.baggage,
          meals: fare.meals || "As per fare rules",
          seatCharge: fare.seatCharge || "As per fare rules",
          cancellationFee: fare.cancellationFee || "As per fare rules",
          dateChangeFee: fare.dateChangeFee || "As per fare rules",
        };
      });
    }

    const publishedBase = baseCardFare || 9154;

    return [
      {
        id: "1",
        title: "Published",
        price: formatFare(publishedBase, displayCurrency),
        priceAmount: publishedBase,
        currency: displayCurrency,
        baggage: "Economy, Refundable",
        meals: "Chargeable",
        seatCharge: "Chargeable",
        cancellationFee: "NA",
        dateChangeFee: "NA",
      },
      {
        id: "2",
        title: "Flexi Plus",
        price: formatFare(publishedBase + 315, displayCurrency),
        priceAmount: publishedBase + 315,
        currency: displayCurrency,
        baggage: "Economy, Free Meal, Refundable",
        meals: "Complimentary",
        seatCharge: "Chargeable",
        cancellationFee: "NA",
        dateChangeFee: "NA",
      },
      {
        id: "3",
        title: "SME",
        price: formatFare(publishedBase + 840, displayCurrency),
        priceAmount: publishedBase + 840,
        currency: displayCurrency,
        baggage: "Economy, Refundable",
        meals: "Chargeable",
        seatCharge: "Chargeable",
        cancellationFee: "NA",
        dateChangeFee: "NA",
      },
      {
        id: "4",
        title: "Upfront",
        price: formatFare(publishedBase + 1995, displayCurrency),
        priceAmount: publishedBase + 1995,
        currency: displayCurrency,
        baggage: "Economy, Refundable",
        meals: "Chargeable",
        seatCharge: "Complimentary",
        cancellationFee: "NA",
        dateChangeFee: "NA",
      },
    ];
  }, [backendFares, backendOffer, baseCardFare, displayCurrency]);

  const [showAllFares, setShowAllFares] = useState(false);
  const [selectedFareId, setSelectedFareId] = useState(fares[0].id);
  const [showDetailsPanel, setShowDetailsPanel] = useState(false);
  const [activeTab, setActiveTab] = useState<DetailTab>("flight");
  const [showComparePanel, setShowComparePanel] = useState(false);
  const [compareStartIndex, setCompareStartIndex] = useState(0);

  const visibleFares = showAllFares ? fares : fares.slice(0, 2);

  const selectedFare = useMemo(
    () => fares.find((fare) => fare.id === selectedFareId) || fares[0],
    [fares, selectedFareId]
  );

  const selectedBaseFare = useMemo(
    () => Number(selectedFare.priceAmount || 0) || parseFareNumber(selectedFare.price),
    [selectedFare.price, selectedFare.priceAmount]
  );

  const selectedCurrency = selectedFare.currency || displayCurrency;

  const selectedOfferDiscount = useMemo(
    () =>
      selectedCurrency === "INR"
        ? calculateOfferDiscount(selectedBaseFare, activeOffer)
        : 0,
    [selectedBaseFare, activeOffer, selectedCurrency]
  );

  const selectedBaseAfterOffer = Math.max(
    selectedBaseFare - selectedOfferDiscount,
    0
  );

  const earnedOnThisFare = Math.round(selectedBaseAfterOffer * 0.02);
  const displayFareAfterOffer = formatFare(selectedBaseAfterOffer, selectedCurrency);

  const selectedFareForDetails: Fare = useMemo(
    () => ({
      ...selectedFare,
      price:
        selectedOfferDiscount > 0
          ? displayFareAfterOffer
          : selectedFare.price,
    }),
    [selectedFare, selectedOfferDiscount, displayFareAfterOffer]
  );

  const toggleDetails = () => {
    setShowDetailsPanel((prev) => !prev);
    if (!showDetailsPanel) setActiveTab("flight");
    setShowComparePanel(false);
  };

  const toggleCompare = () => {
    setShowComparePanel((prev) => !prev);
    setShowDetailsPanel(false);
    setCompareStartIndex(0);
  };

  const handleBookNow = (payload: {
    airline: string;
    code: string;
    depart: string;
    departCity: string;
    duration: string;
    stop: string;
    arrive: string;
    arriveCity: string;
    stopDetails: StopDetail[];
    selectedFare: Fare;
  }) => {
    const adults = Math.max(Number(searchParams.get("adults") || "1"), 1);
    const children = Math.max(Number(searchParams.get("children") || "0"), 0);
    const infants = Math.max(Number(searchParams.get("infants") || "0"), 0);
    const cabinClass = searchParams.get("cabin") || "Economy";

    const fromCode = normalizeCode(searchParams.get("from"));
    const toCode = normalizeCode(searchParams.get("to"));

    const fromCity =
      normalizeValue(searchParams.get("fromCity")) || payload.departCity || "";
    const toCity =
      normalizeValue(searchParams.get("toCity")) || payload.arriveCity || "";

    const from = fromCity || fromCode || payload.departCity || "";
    const to = toCity || toCode || payload.arriveCity || "";

    const backendItinerary = backendOffer?.itineraries?.[0];
    const backendFirstSegment = backendItinerary?.segments?.[0];
    const backendLastSegment =
      backendItinerary?.segments?.[Math.max((backendItinerary?.segments?.length || 1) - 1, 0)] || backendFirstSegment;
    const departureDate =
      formatBackendSegmentDate(backendFirstSegment, "departure") ||
      normalizeSearchDate(searchParams.get("departure"));
    const arrivalDate =
      formatBackendSegmentDate(backendLastSegment, "arrival") ||
      departureDate;

    const rawFare =
      Number(selectedFare.priceAmount || 0) || parseFareNumber(selectedFare.price);
    const baseFareTotal = rawFare * adults;

    const appliedOffer = calculateOfferDiscount(baseFareTotal, activeOffer);
    const baseAfterOffer = Math.max(baseFareTotal - appliedOffer, 0);

    const tax = Math.round(baseFareTotal * 0.18);
    const surcharge = 0;
    const discount = 0;
    const tplCredit = 0;
    const totalAmount = baseAfterOffer + tax + surcharge - discount - tplCredit;

    const tripMode = detectTripMode(searchParams, fromCode, toCode);

    const smokeRunId = getSmokeRunId(searchParams);
    const backendOfferWithSmokeRun = backendOffer && smokeRunId
      ? { ...backendOffer, smokeRunId }
      : backendOffer;

    saveFlightReviewPayload({
      bookingType: "oneWay",
      tripMode,
      passengers: {
        adults,
        children,
        infants,
      },
      cabinClass,
      ...(backendOfferWithSmokeRun ? { backendOffer: backendOfferWithSmokeRun } : {}),
      pricing: {
        currency: selectedCurrency,
        perAdultBaseFare: rawFare,
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
        totalAmount,
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
          journeyLabel: "Flight 1",
          segments: buildReviewSegmentsFromBackend({
            backendItinerary,
            fallback: {
              airline: payload.airline,
              flightNumber: payload.code,
              from,
              to,
              fromCode,
              toCode,
              departureTime: payload.depart,
              arrivalTime: payload.arrive,
              departureDate,
              arrivalDate,
              duration: payload.duration,
              checkinBaggage: providerCheckedBaggage(backendOffer),
              cabinBaggage: providerCabinBaggage(backendOffer),
              aircraft: "",
              terminalFrom: fromCity,
              terminalTo: toCity,
            },
          }),
          layovers: payload.stopDetails.map((item) => ({
            airport: item.airport,
            code: item.airport,
            duration: item.layover,
            note: item.type,
          })),
        },
      ],
    });

    router.push("/flights/review");
  };

  return (
    <>
      <div className="overflow-visible rounded-2xl border-0 bg-transparent shadow-none md:rounded-xl md:border md:border-[#e5e7eb] md:bg-white md:shadow-sm">
        {selectedOfferDiscount > 0 && activeOffer ? (
          <>
            <div className="border-b border-[#fed7aa] bg-[#fff7ed] px-3 py-2.5 md:hidden">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[11px] font-black uppercase text-[#15803d]">
                    Offer applied
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[12px] font-bold text-[#111827]">
                    <span>Flight Price {selectedFare.price}</span>
                    <span className="text-[#15803d]">
                      - {formatFare(selectedOfferDiscount, selectedCurrency)}
                    </span>
                    <span>= {displayFareAfterOffer}</span>
                  </div>
                  <div className="mt-1 text-[11px] font-semibold text-[#64748b]">
                    Earn {formatFare(earnedOnThisFare, selectedCurrency)} TPL Earned Credit
                  </div>
                </div>

                <span className="shrink-0 rounded-full bg-[#16a34a] px-2.5 py-1 text-[10px] font-black text-white">
                  Save {formatFare(selectedOfferDiscount, selectedCurrency)}
                </span>
              </div>
            </div>

            <div className="hidden flex-col gap-2 bg-[#fff7ed] px-3 py-2 md:flex md:flex-row md:items-center md:justify-between md:gap-3 md:px-4">
              <div className="flex flex-wrap items-center gap-1.5 text-[11px] md:gap-2 md:text-[12px]">
                <span className="font-semibold text-[#15803d]">
                  Offer applied on base fare only:
                </span>

                <span className="text-gray-600">
                  {selectedFare.price} - {formatFare(selectedOfferDiscount, selectedCurrency)} =
                </span>

                <span className="font-bold text-[#111827]">
                  {displayFareAfterOffer}
                </span>

                <span className="text-[#6b7280]">
                  · Earn {formatFare(earnedOnThisFare, selectedCurrency)} TPL Earned Credit
                </span>
              </div>

              <span className="w-fit shrink-0 rounded-full bg-[#16a34a] px-3 py-1 text-[10px] font-bold text-white md:text-[11px]">
                {activeOffer.code || "OFFER"} applied · Save{" "}
                {formatFare(selectedOfferDiscount, selectedCurrency)}
              </span>
            </div>
          </>
        ) : null}

        <div className="px-0 py-0 md:px-4 md:py-3">
          <OneWayCardMainRow
            airline={airline}
            code={code}
            depart={depart}
            departCity={departCity}
            duration={duration}
            stop={stop}
            arrive={arrive}
            arriveCity={arriveCity}
            stopDetails={stopDetails}
            fares={fares}
            visibleFares={visibleFares}
            selectedFareId={selectedFareId}
            selectedFare={selectedFare}
            selectedFareOriginalPrice={selectedFare.price}
            selectedFareFinalPrice={displayFareAfterOffer}
            selectedOfferDiscount={selectedOfferDiscount}
            showAllFares={showAllFares}
            setSelectedFareId={setSelectedFareId}
            setShowAllFares={setShowAllFares}
            onToggleDetails={toggleDetails}
            onToggleCompare={toggleCompare}
            onBookNow={handleBookNow}
            baggageSummary={providerBaggageText(backendOffer)}
            cabinBaggage={providerCabinBaggage(backendOffer)}
            checkedBaggage={providerCheckedBaggage(backendOffer)}
            availabilityLabel={availabilityLabel(backendOffer)}
          />
        </div>
      </div>

      <OneWayModal
        isOpen={showDetailsPanel}
        onClose={() => setShowDetailsPanel(false)}
        title="Flight Details"
        maxWidthClass="max-w-5xl"
      >
        <OneWayCardDetailsPanel
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          selectedFare={selectedFareForDetails}
          depart={depart}
          departCity={departCity}
          duration={duration}
          stop={stop}
          arrive={arrive}
          arriveCity={arriveCity}
          code={code}
        />
      </OneWayModal>

      <OneWayModal
        isOpen={showComparePanel}
        onClose={() => setShowComparePanel(false)}
        title="Compare Fares"
        maxWidthClass="max-w-7xl"
      >
        <OneWayCardComparePanel
          fares={fares}
          selectedFareId={selectedFareId}
          setSelectedFareId={setSelectedFareId}
          compareStartIndex={compareStartIndex}
          setCompareStartIndex={setCompareStartIndex}
          compareVisibleCount={COMPARE_VISIBLE_COUNT}
          code={code}
          onSelectFare={(id) => {
            setSelectedFareId(id);
            setShowComparePanel(false);
          }}
        />
      </OneWayModal>
    </>
  );
}

function buildReviewSegmentsFromBackend(input: {
  backendItinerary?: BackendFlightItinerary;
  fallback: {
    airline: string;
    flightNumber: string;
    from: string;
    to: string;
    fromCode: string;
    toCode: string;
    departureTime: string;
    arrivalTime: string;
    departureDate: string;
    arrivalDate: string;
    duration: string;
    checkinBaggage: string;
    cabinBaggage: string;
    aircraft: string;
    terminalFrom: string;
    terminalTo: string;
  };
}) {
  const segments = input.backendItinerary?.segments || [];
  if (!segments.length) return [input.fallback];
  return segments.map((segment) => ({
    airline: segment.airlineName || segment.airlineCode || input.fallback.airline,
    flightNumber: segment.flightNumber || input.fallback.flightNumber,
    from: segment.departure.airport || input.fallback.from,
    to: segment.arrival.airport || input.fallback.to,
    fromCode: segment.departure.airport || input.fallback.fromCode,
    toCode: segment.arrival.airport || input.fallback.toCode,
    departureTime: formatAirportLocalTime(segment.departure, input.fallback.departureTime),
    arrivalTime: `${formatAirportLocalTime(segment.arrival, input.fallback.arrivalTime)}${formatDayOffset(segment.dayOffset) ? ` ${formatDayOffset(segment.dayOffset)}` : ""}`,
    departureDate: formatBackendSegmentDate(segment, "departure") || input.fallback.departureDate,
    arrivalDate: formatBackendSegmentDate(segment, "arrival") || input.fallback.arrivalDate,
    duration: formatDurationFromSchedule({
      departure: segment.departure,
      arrival: segment.arrival,
      duration: segment.duration,
      dayOffset: segment.dayOffset,
    }, input.fallback.duration),
    checkinBaggage: input.fallback.checkinBaggage,
    cabinBaggage: input.fallback.cabinBaggage,
    aircraft: segment.aircraft || "",
    terminalFrom: segment.departure.terminal ? `Terminal ${segment.departure.terminal}` : segment.departure.airport,
    terminalTo: segment.arrival.terminal ? `Terminal ${segment.arrival.terminal}` : segment.arrival.airport,
    schedule: {
      departure: {
        airport: segment.departure.airport,
        at: segment.departure.at,
        localDateTime: segment.departure.localDateTime,
        timeZone: segment.departure.timeZone,
        utcDateTime: segment.departure.utcDateTime,
        offset: segment.departure.offset,
      },
      arrival: {
        airport: segment.arrival.airport,
        at: segment.arrival.at,
        localDateTime: segment.arrival.localDateTime,
        timeZone: segment.arrival.timeZone,
        utcDateTime: segment.arrival.utcDateTime,
        offset: segment.arrival.offset,
      },
      dayOffset: segment.dayOffset,
    },
  }));
}

function formatBackendSegmentDate(segment: BackendFlightSegment | undefined, endpoint: "departure" | "arrival") {
  if (!segment) return "";
  return formatAirportLocalDate(segment[endpoint], "");
}

function getSmokeRunId(searchParams: URLSearchParams): string {
  if (
    process.env.NEXT_PUBLIC_PAYMENT_GATEWAY_TEST_ENABLED !== "true" ||
    process.env.NEXT_PUBLIC_RAZORPAY_CHECKOUT_ENABLED !== "true"
  ) {
    return "";
  }

  const value = searchParams.get("tplSmokeRunId") || "";
  return value.trim().replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 80);
}
