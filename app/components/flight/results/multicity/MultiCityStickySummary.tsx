"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  MultiCityFareOption,
  MultiCityFlight,
  MultiCityLeg,
} from "../../data/multicityFlights";
import { SMART_OFFERS_DATA } from "@/app/lib/smartOffers/smartOffersData";

export type SelectedMultiCityFlight = {
  legIndex: number;
  leg: MultiCityLeg;
  flight: MultiCityFlight;
  fare: MultiCityFareOption;
};

type Props = {
  legs: MultiCityLeg[];
  activeLegIndex: number;
  selections: SelectedMultiCityFlight[];
  activeOffer?: ActiveOfferSnapshot | null;
  onBack: () => void;
  onNext: () => void;
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

function formatRupee(value: number) {
  return `₹${Math.max(0, Math.round(value)).toLocaleString("en-IN")}`;
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
      minBookingValue: Number(offer.rule?.minBookingValue || minBookingValue),
    };
  }

  if (discountMode.includes("flat") || discountAmount > 0 || discountValue > 0) {
    return {
      code,
      title,
      discountType: "flat",
      discountValue: discountAmount || discountValue,
      maxDiscount,
      minBookingValue: Number(offer.rule?.minBookingValue || minBookingValue),
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

export default function MultiCityStickySummary({
  legs,
  activeLegIndex,
  selections,
  activeOffer: activeOfferFromParent,
  onBack,
  onNext,
}: Props) {
  const [showFareDetails, setShowFareDetails] = useState(false);
  const [localActiveOffer, setLocalActiveOffer] = useState<ActiveOfferSnapshot | null>(
    null
  );
  const routeIsInternational = useMemo(
    () => legs.some((leg) => isInternationalLeg(leg)),
    [legs]
  );

  const fareDetailsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setLocalActiveOffer(getMultiCityFlightOffer(routeIsInternational));

    const syncOffer = () =>
      setLocalActiveOffer(getMultiCityFlightOffer(routeIsInternational));

    window.addEventListener("storage", syncOffer);
    window.addEventListener("TPL_SMART_OFFER_UPDATED", syncOffer as EventListener);
    window.addEventListener("TPL_ACTIVE_OFFER_UPDATED", syncOffer as EventListener);
    window.addEventListener("tpl_smart_offer_updated", syncOffer as EventListener);

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
  }, [routeIsInternational]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        fareDetailsRef.current &&
        !fareDetailsRef.current.contains(event.target as Node)
      ) {
        setShowFareDetails(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const fareSummary = useMemo(() => {
    const totalBaseFare = selections.reduce(
      (sum, item) => sum + item.fare.price,
      0
    );

    const appliedOffer = calculateOfferDiscount(
      totalBaseFare,
      activeOfferFromParent ?? localActiveOffer
    );
    const baseAfterOffer = Math.max(totalBaseFare - appliedOffer, 0);
    const earnedOnThisBooking = Math.round(baseAfterOffer * 0.02);

    return {
      totalBaseFare,
      appliedOffer,
      baseAfterOffer,
      earnedOnThisBooking,
      totalAmount: baseAfterOffer,
    };
  }, [selections, activeOfferFromParent, localActiveOffer]);

  if (!selections.length) return null;

  const isLastLeg = activeLegIndex === legs.length - 1;
  const currentLegSelected = selections.some(
    (item) => item.legIndex === activeLegIndex
  );

  return (
    <div className="fixed bottom-3 left-0 right-0 z-40 px-3 md:bottom-4 md:px-4">
      <div className="relative mx-auto max-w-8xl overflow-visible rounded-2xl bg-[#062b68] shadow-2xl">
        <div className="flex flex-col gap-3 p-3 md:gap-4 md:p-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex-1">
            <div className="flex gap-2 overflow-x-auto overflow-y-hidden pb-1 [-ms-overflow-style:none] [scrollbar-width:none] md:flex-wrap md:gap-3 md:overflow-visible md:pb-0 [&::-webkit-scrollbar]:hidden">
              {legs.map((leg, index) => {
                const selection = selections.find(
                  (item) => item.legIndex === index
                );

                return (
                  <div
                    key={leg.id}
                    className={`min-w-[148px] rounded-xl border px-3 py-2 md:min-w-0 md:px-4 md:py-3 ${
                      selection
                        ? "border-[#1f4588] bg-[#0d3b82]"
                        : "border-[#1f4588] bg-[#0a3475]"
                    }`}
                  >
                    <p className="text-[10px] font-black uppercase text-[#8ec5ff] md:text-xs md:font-semibold">
                      Flight {index + 1}
                    </p>

                    <p className="mt-1 text-[12px] font-black text-white md:text-sm md:font-semibold">
                      {leg.fromCode} → {leg.toCode}
                    </p>

                    {selection ? (
                      <p className="mt-1 truncate text-[10px] text-[#d7e6ff] md:text-xs">
                        {selection.flight.airline} •{" "}
                        {selection.flight.departureTime} -{" "}
                        {selection.flight.arrivalTime} • ₹
                        {selection.fare.price.toLocaleString("en-IN")}
                      </p>
                    ) : (
                      <p className="mt-1 text-[10px] text-[#8fb0de] md:text-xs">
                        Not selected
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex min-w-0 flex-col gap-3 md:min-w-[280px] xl:items-end">
            <div className="text-left xl:text-right">
              <div className="space-y-1">
                <div className="flex items-center justify-between gap-4 text-[11px] font-semibold text-white/75">
                  <span>Base Fare</span>
                  <span>{formatRupee(fareSummary.totalBaseFare)}</span>
                </div>

                <div className="flex items-center justify-between gap-4 text-[11px] font-bold text-emerald-300">
                  <span>Offer Discount</span>
                  <span>-{formatRupee(fareSummary.appliedOffer)}</span>
                </div>

                <div className="flex items-center justify-between gap-4 text-[15px] font-black text-white md:text-[16px]">
                  <span>Flight Price after offer</span>
                  <span>{formatRupee(fareSummary.baseAfterOffer)}</span>
                </div>

                <p className="text-[10px] font-medium text-white/60 md:text-[11px]">
                  Taxes & fees shown on booking page.
                </p>
              </div>

              <div className="relative inline-block">
                <button
                  type="button"
                  onClick={() => setShowFareDetails((prev) => !prev)}
                  className="mt-2 text-sm font-semibold text-[#7dd3fc] hover:text-white"
                >
                  Fare Details
                </button>

                {showFareDetails && (
                  <div
                    ref={fareDetailsRef}
                    className="fixed inset-0 z-[120] flex items-end bg-black/45 px-3 pb-3 md:absolute md:bottom-0 md:right-full md:inset-auto md:mr-4 md:block md:max-h-[420px] md:w-[520px] md:overflow-y-auto md:rounded-2xl md:border md:border-[#dbe4ef] md:bg-white md:p-5 md:shadow-2xl"
                  >
                    <div className="relative w-full overflow-hidden rounded-3xl bg-white md:overflow-visible md:rounded-none">
                      <div className="mb-0 flex items-center justify-between border-b border-[#eef2f7] px-4 py-3 md:mb-3 md:block md:border-b-0 md:px-0 md:py-0">
                        <div>
                          <div className="text-[15px] font-black text-[#111827] md:text-[20px] md:font-bold">
                            Fare Details
                          </div>
                          <div className="text-[11px] font-semibold text-[#64748b] md:hidden">
                            Base Fare and Offer Discount
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setShowFareDetails(false)}
                          className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f1f5f9] text-[22px] font-bold text-[#111827] md:hidden"
                        >
                          ×
                        </button>
                      </div>

                    <div className="max-h-[72vh] overflow-y-auto px-4 pb-4 md:max-h-none md:overflow-visible md:px-0 md:pb-0">
                    <div className="space-y-2 md:space-y-3">
                      {selections.map((item) => (
                        <div
                          key={`${item.leg.id}-${item.flight.id}-${item.fare.id}`}
                          className="flex items-start justify-between gap-4 border-b border-[#eef2f7] py-3"
                        >
                          <div className="min-w-0">
                            <div className="text-[13px] font-semibold text-[#111827]">
                              Flight {item.legIndex + 1}: {item.leg.fromCode} →{" "}
                              {item.leg.toCode}
                            </div>
                            <div className="mt-1 text-[12px] text-[#6b7280]">
                              {item.flight.airline} •{" "}
                              {item.flight.departureTime} -{" "}
                              {item.flight.arrivalTime}
                            </div>
                            <div className="mt-1 text-[12px] text-[#6b7280]">
                              {item.fare.label}
                            </div>
                          </div>

                          <div className="shrink-0 text-[15px] font-bold text-[#111827]">
                            ₹{item.fare.price.toLocaleString("en-IN")}
                          </div>
                        </div>
                      ))}
                    </div>

                      <div className="mt-4 space-y-2 border-t border-[#e5e7eb] pt-4">
                        <div className="flex items-center justify-between text-[13px]">
                          <span className="text-[#6b7280]">Base Fare</span>
                          <span className="font-semibold text-[#111827]">
                            {formatRupee(fareSummary.totalBaseFare)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[13px]">
                          <span className="text-[#15803d]">Offer Discount</span>
                          <span className="font-semibold text-[#15803d]">
                            - {formatRupee(fareSummary.appliedOffer)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[13px]">
                          <span className="text-[#111827] font-semibold">
                            Flight Price after offer
                          </span>
                          <span className="font-semibold text-[#111827]">
                            {formatRupee(fareSummary.baseAfterOffer)}
                          </span>
                        </div>

                        <div className="rounded-xl bg-[#f8fafc] px-3 py-2 text-[11px] font-semibold text-[#64748b] md:text-[12px]">
                          Taxes & fees shown on booking page.
                        </div>
                      </div>
                    </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 md:flex md:flex-wrap">
              <button
                type="button"
                onClick={onBack}
                disabled={activeLegIndex === 0}
                className="rounded-xl border border-[#3f6db5] px-4 py-2 text-sm font-semibold text-[#d7e6ff] transition hover:bg-[#0d3b82] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Back
              </button>

              <button
                type="button"
                onClick={onNext}
                disabled={!currentLegSelected}
                className="rounded-full bg-[#1ec7ff] px-5 py-2 text-sm font-bold text-[#062b68] transition hover:bg-[#56d6ff] disabled:cursor-not-allowed disabled:bg-[#87d9ef] disabled:text-[#0f3b67]"
              >
                {isLastLeg ? "Review Booking" : "Next"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
