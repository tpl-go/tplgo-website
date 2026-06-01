"use client";

import { useEffect, useMemo, useState } from "react";
import { Sparkles, BadgeCheck, Tag } from "lucide-react";

import {
  calculateSmartOfferDiscount,
  getSmartActiveOfferItem,
  SMART_OFFERS_DATA,
  type SmartOfferItem,
} from "@/app/lib/smartOffers";

export type TrainOfferItem = {
  code: string;
  title: string;
  description?: string;
  discountAmount: number;
  offerData?: any;
};

type Props = {
  appliedOfferCode: string;
  bookingValue: number;
  onApplyOffer: (offer: TrainOfferItem) => void;
  onRemoveOffer: () => void;
};

const SMART_ACTIVE_OFFER_KEY = "tpl_smart_active_offer_v1";
const SPECIAL_ACTIVE_OFFER_PAYLOAD_KEY = "tplActiveOfferPayload";

function toNumber(value: any, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeService(value: any) {
  return String(value || "").toLowerCase().trim();
}

function getOfferCode(offer: any) {
  return (
    offer?.couponCode ||
    offer?.code ||
    offer?.offerCode ||
    offer?.slug ||
    offer?.offer?.couponCode ||
    offer?.offer?.code ||
    offer?.offer?.slug ||
    ""
  );
}

function getOfferTitle(offer: any) {
  return (
    offer?.title ||
    offer?.offerTitle ||
    offer?.offer?.title ||
    "Best Train Offer Activated"
  );
}

function getOfferDescription(offer: any) {
  return (
    offer?.description ||
    offer?.subtitle ||
    offer?.offer?.description ||
    offer?.offer?.subtitle ||
    "Smart train offer available on base train fare."
  );
}

function calculateOfferDiscount(offer: any, baseFare: number) {
  const safeBaseFare = Math.max(0, Math.round(toNumber(baseFare)));
  if (!offer || safeBaseFare <= 0) return 0;

  const directDiscount = toNumber(
    offer?.appliedOfferAmount ||
      offer?.discountAmount ||
      offer?.offerDiscount ||
      offer?.couponDiscount ||
      0
  );

  if (directDiscount > 0) {
    return Math.min(Math.round(directDiscount), safeBaseFare);
  }

  return Math.min(
    Math.max(0, calculateSmartOfferDiscount(offer, safeBaseFare)),
    safeBaseFare
  );
}

function isTrainOffer(offer: any) {
  const service = normalizeService(offer?.service || offer?.offer?.service);

  return !service || service === "train" || service === "trains" || service === "all";
}

function readSessionOffer() {
  if (typeof window === "undefined") return null;

  try {
    const specialRaw = sessionStorage.getItem(SPECIAL_ACTIVE_OFFER_PAYLOAD_KEY);
    if (specialRaw) {
      const special = JSON.parse(specialRaw);
      if (isTrainOffer(special)) return special;
    }

    const smartRaw = sessionStorage.getItem(SMART_ACTIVE_OFFER_KEY);
    if (smartRaw) {
      const smart = JSON.parse(smartRaw);
      const offer = smart?.offer || smart;
      if (isTrainOffer(offer)) {
        return {
          ...offer,
          source: smart?.source || offer?.source || "results",
          activatedAt: smart?.activatedAt || offer?.activatedAt,
        };
      }
    }

    return null;
  } catch {
    return null;
  }
}

export default function TrainBookingOffersSection({
  appliedOfferCode,
  bookingValue,
  onApplyOffer,
  onRemoveOffer,
}: Props) {
  const [smartOffer, setSmartOffer] = useState<SmartOfferItem | null>(null);
  const [sessionOffer, setSessionOffer] = useState<any>(null);

  useEffect(() => {
    const load = () => {
      setSmartOffer(getSmartActiveOfferItem());
      setSessionOffer(readSessionOffer());
    };

    load();

    window.addEventListener("TPL_ACTIVE_OFFER_UPDATED", load);
    window.addEventListener("TPL_SMART_OFFER_UPDATED", load);
    window.addEventListener("storage", load);

    return () => {
      window.removeEventListener("TPL_ACTIVE_OFFER_UPDATED", load);
      window.removeEventListener("TPL_SMART_OFFER_UPDATED", load);
      window.removeEventListener("storage", load);
    };
  }, []);

  const safeBaseFare = Math.max(0, Math.round(toNumber(bookingValue)));

  const sessionMappedOffer = useMemo<TrainOfferItem | null>(() => {
    if (!sessionOffer) return null;

    const code = getOfferCode(sessionOffer);
    const discountAmount = calculateOfferDiscount(sessionOffer, safeBaseFare);

    if (!code || discountAmount <= 0) return null;

    return {
      code,
      title: getOfferTitle(sessionOffer),
      description: getOfferDescription(sessionOffer),
      discountAmount,
      offerData: sessionOffer,
    };
  }, [sessionOffer, safeBaseFare]);

  const masterOffers = useMemo<TrainOfferItem[]>(() => {
    const offers = SMART_OFFERS_DATA.filter((item) => {
      if (!item.active) return false;
      return (
  item.service === "train" ||
  (item.service as string) === "trains" ||
  item.service === "all"
);
    }).map((offer) => ({
      code: offer.couponCode || offer.slug,
      title: offer.title,
      description:
        offer.description || offer.subtitle || "Smart train offer available.",
      discountAmount: calculateOfferDiscount(offer, safeBaseFare || 1200),
      offerData: offer,
    }));

    if (!sessionMappedOffer) return offers;

    const alreadyExists = offers.some(
      (item) => item.code === sessionMappedOffer.code
    );

    if (alreadyExists) {
      return offers.map((item) =>
        item.code === sessionMappedOffer.code ? sessionMappedOffer : item
      );
    }

    return [sessionMappedOffer, ...offers];
  }, [safeBaseFare, sessionMappedOffer]);

  const appliedOffer = useMemo(() => {
    return masterOffers.find((item) => item.code === appliedOfferCode) || null;
  }, [masterOffers, appliedOfferCode]);

  return (
    <div className="overflow-hidden rounded-[24px] border border-[#d9e2ec] bg-white shadow-[0_12px_34px_rgba(15,23,42,0.08)]">
      <div className="border-b border-[#e5e7eb] bg-[linear-gradient(135deg,#fff7ed_0%,#ffffff_50%,#fff1e6_100%)] px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#f97316,#ea580c)] shadow-[0_10px_24px_rgba(249,115,22,0.35)]">
            <Sparkles className="h-5 w-5 text-white" />
          </div>

          <div className="min-w-0">
            <div className="text-[18px] font-extrabold text-[#111827] md:text-[20px]">
              Smart Coupons & Offers
            </div>

            <div className="mt-0.5 text-[12px] font-semibold text-[#6b7280]">
              Offers apply only on base train fare
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-4">
        {appliedOffer ? (
          <div className="relative mb-4 overflow-hidden rounded-[18px] border border-[#fed7aa] bg-[linear-gradient(135deg,#fff7ed,#ffffff)] p-4">
            <div className="absolute right-0 top-0 h-20 w-20 rounded-full bg-[#fb923c]/10 blur-3xl" />

            <div className="relative flex min-w-0 flex-col gap-3 md:flex-row md:items-start md:justify-between">
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

                <div className="mt-3 text-[16px] font-black text-[#111827]">
                  {appliedOffer.title}
                </div>

                <div className="mt-1 text-[13px] font-bold text-[#ea580c]">
                  Save ₹{appliedOffer.discountAmount.toLocaleString("en-IN")} on
                  base fare
                </div>
              </div>

              <button
                type="button"
                onClick={onRemoveOffer}
                className="h-[38px] w-full shrink-0 rounded-full border border-[#fed7aa] bg-white px-4 text-[12px] font-black text-[#ea580c] md:w-auto"
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
              smartOffer?.slug === offer.code ||
              sessionMappedOffer?.code === offer.code;

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

                <div className="relative flex min-w-0 flex-col gap-3 md:flex-row md:items-start md:justify-between">
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

                      {active ? (
                        <div className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-emerald-700">
                          Active
                        </div>
                      ) : null}
                    </div>

                    <div className="mt-3 text-[15px] font-black text-[#111827]">
                      {offer.title}
                    </div>

                    <div className="mt-2 text-[13px] leading-[20px] text-[#6b7280]">
                      {offer.description}
                    </div>

                    <div className="mt-3 flex items-center gap-2 text-[13px] font-black text-[#ea580c]">
                      <Tag className="h-4 w-4" />

                      <span>
                        Save ₹{offer.discountAmount.toLocaleString("en-IN")} on
                        base fare
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={active || offer.discountAmount <= 0}
                    onClick={() => onApplyOffer(offer)}
                    className={`min-h-10 w-full rounded-full px-4 py-2 text-[12px] font-black transition-all md:min-w-[100px] md:w-auto ${
                      active
                        ? "cursor-not-allowed bg-[linear-gradient(135deg,#f97316,#ea580c)] text-white shadow-[0_8px_18px_rgba(249,115,22,0.3)]"
                        : offer.discountAmount <= 0
                        ? "cursor-not-allowed border border-[#e5e7eb] bg-[#f8fafc] text-[#94a3b8]"
                        : "border border-[#fdba74] bg-white text-[#ea580c] hover:bg-[#fff7ed]"
                    }`}
                  >
                    {active ? "APPLIED" : offer.discountAmount <= 0 ? "N/A" : "APPLY"}
                  </button>
                </div>
              </div>
            );
          })}

          {masterOffers.length === 0 ? (
            <div className="rounded-[18px] border border-dashed border-[#e5e7eb] bg-[#fafafa] p-4 text-[13px] font-semibold text-[#6b7280]">
              No train offer available right now.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
