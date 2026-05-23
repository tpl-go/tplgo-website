"use client";

import { useEffect, useMemo, useState } from "react";

import {
  getSmartActiveOfferItem,
  SMART_OFFERS_DATA,
  SmartOfferItem,
  calculateSmartOfferDiscount,
} from "@/app/lib/smartOffers";

export type HotelOfferItem = {
  code: string;
  title: string;
  description: string;
  discountAmount: number;
};

type Props = {
  offers?: HotelOfferItem[];
  appliedOfferCode: string;
  bookingValue?: number;
  onApplyOffer: (offer: HotelOfferItem) => void;
  onRemoveOffer: () => void;
};

function isHotelOffer(offer: SmartOfferItem) {
  if (!offer.active) return false;

  if (
    offer.service !== "hotel" &&
    offer.service !== "all"
  ) {
    return false;
  }

  if (offer.offerType === "membership") {
    return false;
  }

  return true;
}

function mapSmartOfferToHotelOffer(
  offer: SmartOfferItem,
  bookingValue: number
): HotelOfferItem {
  return {
    code: offer.couponCode || offer.slug,
    title: offer.title,
    description:
      offer.description ||
      offer.subtitle ||
      "Smart hotel offer available for this booking.",
    discountAmount: calculateSmartOfferDiscount(
      offer,
      bookingValue
    ),
  };
}

function uniqueOffers(offers: HotelOfferItem[]) {
  const map = new Map<string, HotelOfferItem>();

  offers.forEach((offer) => {
    if (!offer.code) return;
    map.set(offer.code, offer);
  });

  return Array.from(map.values());
}

export default function HotelBookingOffersSection({
  offers = [],
  appliedOfferCode,
  bookingValue = 12000,
  onApplyOffer,
  onRemoveOffer,
}: Props) {
  const [smartActiveOffer, setSmartActiveOffer] =
    useState<SmartOfferItem | null>(null);

  useEffect(() => {
    const load = () => {
      setSmartActiveOffer(getSmartActiveOfferItem());
    };

    load();

    window.addEventListener("TPL_SMART_OFFER_UPDATED", load);
    window.addEventListener("storage", load);

    return () => {
      window.removeEventListener("TPL_SMART_OFFER_UPDATED", load);
      window.removeEventListener("storage", load);
    };
  }, []);

  const masterHotelOffers = useMemo(() => {
    return SMART_OFFERS_DATA.filter(isHotelOffer)
      .map((item) =>
        mapSmartOfferToHotelOffer(item, bookingValue)
      )
      .filter(
        (item) =>
          item.code &&
          Number(item.discountAmount || 0) > 0
      );
  }, [bookingValue]);

  const smartOfferCard = useMemo(() => {
    if (!smartActiveOffer) return null;

    if (!isHotelOffer(smartActiveOffer)) {
      return null;
    }

    const mapped = mapSmartOfferToHotelOffer(
      smartActiveOffer,
      bookingValue
    );

    if (!mapped.code || mapped.discountAmount <= 0) {
      return null;
    }

    return mapped;
  }, [smartActiveOffer, bookingValue]);

  const dynamicOffers = useMemo(() => {
    const list = uniqueOffers([
      ...masterHotelOffers,
    ]);

    if (!smartOfferCard?.code) {
      return list;
    }

    return list.filter(
      (offer) => offer.code !== smartOfferCard.code
    );
  }, [masterHotelOffers, smartOfferCard?.code]);

  const appliedOffer = useMemo(() => {
    return (
      dynamicOffers.find(
        (item) => item.code === appliedOfferCode
      ) ||
      offers.find(
        (item) => item.code === appliedOfferCode
      ) ||
      smartOfferCard ||
      null
    );
  }, [
    dynamicOffers,
    offers,
    smartOfferCard,
    appliedOfferCode,
  ]);

  const smartIsApplied =
    Boolean(smartOfferCard) &&
    (!appliedOfferCode ||
      smartOfferCard?.code === appliedOfferCode);

  const smartAvailableBelow =
    Boolean(smartOfferCard) &&
    Boolean(appliedOfferCode) &&
    smartOfferCard?.code !== appliedOfferCode;

  return (
    <div className="overflow-hidden rounded-xl border border-[#d9e2ec] bg-white shadow-sm">
      <div className="border-b border-[#e5e7eb] bg-[#fff7ed] px-4 py-4">
        <div className="text-[20px] font-extrabold text-[#111827]">
          Coupons & Offers
        </div>
      </div>

      <div className="px-4 py-4">
        {appliedOffer && appliedOfferCode ? (
          <div className="mb-4 rounded-lg border border-[#bae6fd] bg-[#f0f9ff] p-4">
            <div className="text-[14px] font-extrabold text-[#0369a1]">
              Applied: {appliedOffer.code}
            </div>

            <div className="mt-1 text-[13px] leading-5 text-[#374151]">
              {appliedOffer.title} — Save ₹
              {appliedOffer.discountAmount.toLocaleString("en-IN")}
            </div>

            <button
              type="button"
              onClick={onRemoveOffer}
              className="mt-3 h-[36px] rounded-lg border border-[#d1d5db] bg-white px-3 text-[13px] font-bold text-[#111827]"
            >
              Remove Offer
            </button>
          </div>
        ) : null}

        {smartOfferCard ? (
          <div
            className={`mb-4 rounded-xl p-4 shadow-[0_6px_16px_rgba(249,115,22,0.10)] ${
              smartIsApplied
                ? "border-2 border-[#f97316] bg-gradient-to-br from-[#fff7ed] to-[#ffedd5]"
                : "border border-[#fed7aa] bg-gradient-to-br from-[#fff7ed] to-white"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div
                  className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-black tracking-wide ${
                    smartIsApplied
                      ? "bg-[#f97316] text-white"
                      : "bg-[#ffedd5] text-[#c2410c]"
                  }`}
                >
                  {smartIsApplied
                    ? "AI HOTEL OFFER APPLIED"
                    : "AI RECOMMENDED"}
                </div>

                <div className="mt-2 text-[15px] font-extrabold text-[#111827]">
                  {smartOfferCard.code}
                </div>

                <div className="mt-1 text-[14px] font-bold text-[#111827]">
                  {smartOfferCard.title}
                </div>

                <div className="mt-2 text-[13px] leading-5 text-[#6b7280]">
                  {smartIsApplied
                    ? "This smart hotel offer is currently applied to your booking."
                    : "This smart hotel offer is still available if you want to switch back."}
                </div>

                <div className="mt-2 text-[13px] font-extrabold text-[#15803d]">
                  Save ₹
                  {smartOfferCard.discountAmount.toLocaleString("en-IN")}
                </div>
              </div>

              {smartAvailableBelow ? (
                <button
                  type="button"
                  onClick={() => onApplyOffer(smartOfferCard)}
                  className="min-w-[92px] rounded-lg bg-[#f97316] px-3 py-2 text-[13px] font-extrabold text-white shadow-[0_6px_14px_rgba(249,115,22,0.25)]"
                >
                  APPLY
                </button>
              ) : (
                <button
                  type="button"
                  disabled
                  className="min-w-[92px] cursor-not-allowed rounded-lg bg-[#f97316] px-3 py-2 text-[13px] font-extrabold text-white opacity-90"
                >
                  APPLIED
                </button>
              )}
            </div>
          </div>
        ) : null}

        <div className="grid gap-3">
          {dynamicOffers.length === 0 ? (
            <div className="rounded-lg border border-dashed border-[#d1d5db] bg-[#f9fafb] p-4 text-[13px] font-bold text-[#6b7280]">
              No eligible hotel offers available for this booking.
            </div>
          ) : null}

          {dynamicOffers.map((offer) => {
            const active =
              appliedOfferCode === offer.code;

            return (
              <div
                key={offer.code}
                className={`rounded-lg p-4 ${
                  active
                    ? "border-2 border-[#38bdf8] bg-[#eef8ff]"
                    : "border border-[#d9e2ec] bg-white"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-[15px] font-extrabold text-[#111827]">
                      {offer.code}
                    </div>

                    <div className="mt-1 text-[14px] font-bold text-[#111827]">
                      {offer.title}
                    </div>

                    <div className="mt-2 text-[13px] leading-5 text-[#6b7280]">
                      {offer.description}
                    </div>

                    <div className="mt-2 text-[13px] font-extrabold text-[#15803d]">
                      Save ₹
                      {offer.discountAmount.toLocaleString("en-IN")}
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={active}
                    onClick={() => onApplyOffer(offer)}
                    className={`min-w-[92px] rounded-lg px-3 py-2 text-[13px] font-extrabold ${
                      active
                        ? "cursor-not-allowed bg-[#38bdf8] text-white"
                        : "border border-[#d1d5db] bg-white text-[#111827]"
                    }`}
                  >
                    {active ? "APPLIED" : "APPLY"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}