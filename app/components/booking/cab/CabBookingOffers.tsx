"use client";

import { useEffect, useMemo, useState } from "react";
import { Sparkles, BadgeCheck, Tag } from "lucide-react";

import {
  calculateSmartOfferDiscount,
  getSmartActiveOfferItem,
  SMART_OFFERS_DATA,
  type SmartOfferItem,
} from "@/app/lib/smartOffers";

export type CabOfferItem = {
  code: string;
  title: string;
  description: string;
  discountAmount: number;
};

type Props = {
  appliedOfferCode: string;
  bookingValue: number;
  onApplyOffer: (offer: CabOfferItem) => void;
  onRemoveOffer: () => void;
};

function toNumber(value: unknown) {
  const n = Number(value || 0);
  return Number.isFinite(n) ? n : 0;
}

function readSessionJson<T>(key: string): T | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function getSessionCabOfferAmount(code: string) {
  const specialPayload = readSessionJson<any>("tplActiveOfferPayload");
  const specialActivation = readSessionJson<any>("tplActiveOfferActivation");

  const payloadCode = String(
    specialPayload?.couponCode ||
      specialPayload?.code ||
      specialPayload?.slug ||
      ""
  );

  const activationCode = String(
    specialActivation?.couponCode ||
      specialActivation?.code ||
      specialActivation?.slug ||
      ""
  );

  const service = String(
    specialPayload?.service || specialActivation?.service || ""
  ).toLowerCase();

  if (service && service !== "cab" && service !== "cabs" && service !== "all") {
    return 0;
  }

  if (payloadCode === code || activationCode === code) {
    return toNumber(specialPayload?.discountAmount);
  }

  return 0;
}

export default function CabBookingOffers({
  appliedOfferCode,
  bookingValue,
  onApplyOffer,
  onRemoveOffer,
}: Props) {
  const [smartOffer, setSmartOffer] = useState<SmartOfferItem | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const load = () => {
      setSmartOffer(getSmartActiveOfferItem());
      setRefreshKey((prev) => prev + 1);
    };

    load();

    window.addEventListener("TPL_SMART_OFFER_UPDATED", load);
    window.addEventListener("TPL_ACTIVE_OFFER_UPDATED", load);
    window.addEventListener("storage", load);

    return () => {
      window.removeEventListener("TPL_SMART_OFFER_UPDATED", load);
      window.removeEventListener("TPL_ACTIVE_OFFER_UPDATED", load);
      window.removeEventListener("storage", load);
    };
  }, []);

  const masterOffers = useMemo<CabOfferItem[]>(() => {
    void refreshKey;

    return SMART_OFFERS_DATA.filter((item) => {
      if (!item.active) return false;
      return item.service === "cab" || item.service === "all";
    })
      .map((offer) => {
        const code = offer.couponCode || offer.slug;

        const sessionAmount = getSessionCabOfferAmount(code);

        const calculatedAmount = calculateSmartOfferDiscount(
          offer,
          bookingValue || 1500
        );

        const discountAmount = sessionAmount || calculatedAmount;

        return {
          code,
          title: offer.title,
          description:
            offer.description ||
            offer.subtitle ||
            "Smart cab offer available.",
          discountAmount: Math.max(0, Math.min(discountAmount, bookingValue || 0)),
        };
      })
      .filter((offer) => offer.code && offer.discountAmount > 0)
      .sort((a, b) => {
        if (a.code === appliedOfferCode) return -1;
        if (b.code === appliedOfferCode) return 1;

        const smartCode = smartOffer?.couponCode || smartOffer?.slug || "";

        if (a.code === smartCode) return -1;
        if (b.code === smartCode) return 1;

        return b.discountAmount - a.discountAmount;
      });
  }, [bookingValue, appliedOfferCode, smartOffer, refreshKey]);

  const appliedOffer = useMemo(() => {
    return masterOffers.find((item) => item.code === appliedOfferCode) || null;
  }, [masterOffers, appliedOfferCode]);

  function handleApply(offer: CabOfferItem) {
    onApplyOffer(offer);

    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("TPL_ACTIVE_OFFER_UPDATED"));
      window.dispatchEvent(new CustomEvent("TPL_SMART_OFFER_UPDATED"));
    }
  }

  function handleRemove() {
    onRemoveOffer();

    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("TPL_ACTIVE_OFFER_UPDATED"));
      window.dispatchEvent(new CustomEvent("TPL_SMART_OFFER_UPDATED"));
    }
  }

  return (
    <div className="overflow-hidden rounded-[22px] border border-[#d9e2ec] bg-white shadow-[0_12px_34px_rgba(15,23,42,0.08)] sm:rounded-[24px]">
      <div className="border-b border-[#e5e7eb] bg-[linear-gradient(135deg,#fff7ed_0%,#ffffff_50%,#fff1e6_100%)] px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#f97316,#ea580c)] shadow-[0_10px_24px_rgba(249,115,22,0.35)]">
            <Sparkles className="h-5 w-5 text-white" />
          </div>

          <div className="min-w-0">
            <div className="break-words text-[18px] font-extrabold text-[#111827] sm:text-[20px]">
              Smart Coupons & Offers
            </div>

            <div className="mt-0.5 text-[12px] font-semibold text-[#6b7280]">
              AI matched cab savings on base fare only
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-4">
        {appliedOffer ? (
          <div className="relative mb-4 overflow-hidden rounded-[18px] border border-[#fed7aa] bg-[linear-gradient(135deg,#fff7ed,#ffffff)] p-4">
            <div className="absolute right-0 top-0 h-20 w-20 rounded-full bg-[#fb923c]/10 blur-3xl" />

            <div className="relative flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1 rounded-full bg-[linear-gradient(135deg,#f97316,#ea580c)] px-3 py-1 shadow-[0_6px_18px_rgba(249,115,22,0.3)]">
                    <BadgeCheck className="h-3.5 w-3.5 text-white" />

                    <span className="text-[10px] font-black uppercase tracking-[0.15em] text-white">
                      Applied
                    </span>
                  </div>

                  <div className="rounded-full border border-[#fdba74] bg-[#fff7ed] px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-[#ea580c]">
                    {appliedOffer.code}
                  </div>
                </div>

                <div className="mt-3 break-words text-[16px] font-black text-[#111827]">
                  {appliedOffer.title}
                </div>

                <div className="mt-1 text-[13px] font-bold text-[#ea580c]">
                  Save ₹{appliedOffer.discountAmount.toLocaleString("en-IN")} on
                  base cab fare
                </div>
              </div>

              <button
                type="button"
                onClick={handleRemove}
                className="h-[42px] w-full shrink-0 rounded-full border border-[#fed7aa] bg-white px-4 text-[12px] font-black text-[#ea580c] sm:h-[38px] sm:w-auto"
              >
                Remove
              </button>
            </div>
          </div>
        ) : null}

        <div className="grid gap-3">
          {masterOffers.map((offer) => {
            const active = appliedOfferCode === offer.code;
            const isSmart =
              smartOffer?.couponCode === offer.code ||
              smartOffer?.slug === offer.code;

            return (
              <div
                key={offer.code}
                className={`relative overflow-hidden rounded-[18px] border p-4 transition-all ${
                  active
                    ? "border-[#fb923c] bg-[linear-gradient(135deg,#fff7ed,#ffffff)] shadow-[0_10px_24px_rgba(249,115,22,0.12)]"
                    : "border-[#e5e7eb] bg-white hover:border-[#fdba74]"
                }`}
              >
                <div className="absolute right-0 top-0 h-16 w-16 rounded-full bg-[#fb923c]/5 blur-2xl" />

                <div className="relative flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="rounded-full bg-[#111827] px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-white">
                        {offer.code}
                      </div>

                      {isSmart ? (
                        <div className="rounded-full bg-[linear-gradient(135deg,#f97316,#ea580c)] px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-white shadow-[0_4px_12px_rgba(249,115,22,0.3)]">
                          AI Smart
                        </div>
                      ) : null}
                    </div>

                    <div className="mt-3 break-words text-[15px] font-black text-[#111827]">
                      {offer.title}
                    </div>

                    <div className="mt-2 text-[13px] leading-[20px] text-[#6b7280]">
                      {offer.description}
                    </div>

                    <div className="mt-3 flex items-center gap-2 text-[13px] font-black text-[#ea580c]">
                      <Tag className="h-4 w-4" />

                      <span>
                        Save ₹{offer.discountAmount.toLocaleString("en-IN")}
                      </span>
                    </div>

                    <div className="mt-1 text-[11px] font-bold text-[#64748b]">
                      Applies only on true base cab fare
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={active}
                    onClick={() => handleApply(offer)}
                    className={`min-h-[42px] w-full rounded-full px-4 py-2 text-[12px] font-black transition-all sm:w-auto sm:min-w-[100px] ${
                      active
                        ? "cursor-not-allowed bg-[linear-gradient(135deg,#f97316,#ea580c)] text-white shadow-[0_8px_18px_rgba(249,115,22,0.3)]"
                        : "border border-[#fdba74] bg-white text-[#ea580c] hover:bg-[#fff7ed]"
                    }`}
                  >
                    {active ? "APPLIED" : "APPLY"}
                  </button>
                </div>
              </div>
            );
          })}

          {masterOffers.length === 0 ? (
            <div className="rounded-[18px] border border-dashed border-[#e5e7eb] bg-[#fafafa] p-4 text-[13px] font-semibold text-[#6b7280]">
              No cab offer available right now.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
