"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  MultiCityFareOption,
  MultiCityFlight,
  MultiCityLeg,
} from "../../data/multicityFlights";

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

export default function MultiCityStickySummary({
  legs,
  activeLegIndex,
  selections,
  onBack,
  onNext,
}: Props) {
  const [showFareDetails, setShowFareDetails] = useState(false);
  const [activeOffer, setActiveOffer] = useState<ActiveOfferSnapshot | null>(
    null
  );

  const fareDetailsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setActiveOffer(getActiveFlightOffer());

    const syncOffer = () => setActiveOffer(getActiveFlightOffer());

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
  }, []);

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

    const appliedOffer = calculateOfferDiscount(totalBaseFare, activeOffer);
    const baseAfterOffer = Math.max(totalBaseFare - appliedOffer, 0);
    const earnedOnThisBooking = Math.round(baseAfterOffer * 0.02);

    return {
      totalBaseFare,
      appliedOffer,
      baseAfterOffer,
      earnedOnThisBooking,
      totalAmount: baseAfterOffer,
    };
  }, [selections, activeOffer]);

  if (!selections.length) return null;

  const isLastLeg = activeLegIndex === legs.length - 1;
  const currentLegSelected = selections.some(
    (item) => item.legIndex === activeLegIndex
  );

  return (
    <div className="sticky bottom-4 z-40 mt-6">
      <div className="relative overflow-visible rounded-2xl bg-[#062b68] shadow-2xl">
        {fareSummary.appliedOffer > 0 && activeOffer ? (
          <div className="flex items-center justify-between gap-3 border-b border-[#0f4aa3] bg-[#1ec7ff] px-5 py-2">
            <div className="flex flex-wrap items-center gap-2 text-[12px]">
              <span className="font-bold text-black">
  Offer applied on base fare only:
</span>

              <span className="text-black">
                {formatRupee(fareSummary.totalBaseFare)} -{" "}
                {formatRupee(fareSummary.appliedOffer)} =
              </span>

              <span className="font-bold text-black">
                {formatRupee(fareSummary.baseAfterOffer)}
              </span>

              <span className="text-black font-bold">
                · Earn {formatRupee(fareSummary.earnedOnThisBooking)} TPL Earned
                Credit
              </span>
            </div>

            <span className="shrink-0 rounded-full bg-[#ff7a00] px-3 py-1 text-[11px] font-bold text-white shadow-sm">
  {activeOffer.code || "OFFER"} applied · Save{" "}
  {formatRupee(fareSummary.appliedOffer)}
</span>
          </div>
        ) : null}

        <div className="flex flex-col gap-4 p-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex-1">
            <div className="flex flex-wrap gap-3">
              {legs.map((leg, index) => {
                const selection = selections.find(
                  (item) => item.legIndex === index
                );

                return (
                  <div
                    key={leg.id}
                    className={`rounded-xl border px-4 py-3 ${
                      selection
                        ? "border-[#1f4588] bg-[#0d3b82]"
                        : "border-[#1f4588] bg-[#0a3475]"
                    }`}
                  >
                    <p className="text-xs font-semibold uppercase text-[#8ec5ff]">
                      Flight {index + 1}
                    </p>

                    <p className="mt-1 text-sm font-semibold text-white">
                      {leg.fromCode} → {leg.toCode}
                    </p>

                    {selection ? (
                      <p className="mt-1 text-xs text-[#d7e6ff]">
                        {selection.flight.airline} •{" "}
                        {selection.flight.departureTime} -{" "}
                        {selection.flight.arrivalTime} • ₹
                        {selection.fare.price.toLocaleString("en-IN")}
                      </p>
                    ) : (
                      <p className="mt-1 text-xs text-[#8fb0de]">
                        Not selected
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex min-w-[280px] flex-col gap-3 xl:items-end">
            <div className="text-right">
              <p className="text-sm text-[#8ec5ff]">Total Selected Fare</p>

              {fareSummary.appliedOffer > 0 ? (
                <div>
                  <p className="text-sm font-semibold text-white/55 line-through">
                    {formatRupee(fareSummary.totalBaseFare)}
                  </p>

                  <p className="text-2xl font-bold text-white">
                    {formatRupee(fareSummary.totalAmount)}
                  </p>
                </div>
              ) : (
                <p className="text-2xl font-bold text-white">
                  {formatRupee(fareSummary.totalAmount)}
                </p>
              )}

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
                    className="absolute right-full bottom-0 z-50 mr-4 max-h-[420px] w-[520px] overflow-y-auto rounded-2xl border border-[#dbe4ef] bg-white p-5 shadow-2xl"
                  >
                    <div className="mb-3 text-[20px] font-bold text-[#111827]">
                      Fare Details
                    </div>

                    <div className="space-y-3">
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

                    {fareSummary.appliedOffer > 0 && activeOffer ? (
                      <div className="mt-4 space-y-2 border-t border-[#e5e7eb] pt-4">
                        <div className="flex items-center justify-between text-[13px]">
                          <span className="text-[#6b7280]">Base fare</span>
                          <span className="font-semibold text-[#111827]">
                            {formatRupee(fareSummary.totalBaseFare)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[13px]">
                          <span className="text-[#15803d]">
                            Offer ({activeOffer.code || "OFFER"})
                          </span>
                          <span className="font-semibold text-[#15803d]">
                            - {formatRupee(fareSummary.appliedOffer)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[13px]">
                          <span className="text-[#6b7280]">
                            TPL Earned Credit
                          </span>
                          <span className="font-semibold text-[#111827]">
                            {formatRupee(fareSummary.earnedOnThisBooking)}
                          </span>
                        </div>
                      </div>
                    ) : null}

                    <div className="mt-4 flex items-center justify-between border-t border-[#e5e7eb] pt-4">
                      <div className="text-[15px] font-semibold text-[#111827]">
                        Total Amount
                      </div>
                      <div className="text-[22px] font-bold text-[#111827]">
                        {formatRupee(fareSummary.totalAmount)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
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