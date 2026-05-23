"use client";

import { useEffect, useMemo, useState } from "react";
import { Sparkles, BadgeCheck, Tag } from "lucide-react";

import {
  calculateSmartOfferDiscount,
  getSmartActiveOfferItem,
  SMART_OFFERS_DATA,
  type SmartOfferItem,
} from "@/app/lib/smartOffers";

export type InsuranceOfferItem = {
  code: string;
  title: string;
  description?: string;
  discountAmount: number;
};

type Props = {
  appliedOfferCode: string;
  bookingValue: number;
  onApplyOffer: (offer: InsuranceOfferItem) => void;
  onRemoveOffer: () => void;
};

function normalizeCode(value: any) {
  return String(value || "").trim().toUpperCase();
}

function isInsuranceOffer(offer: SmartOfferItem) {
  const service = String((offer as any)?.service || "").toLowerCase();
  return service === "insurance" || service === "all";
}

function buildOfferItem(
  offer: SmartOfferItem,
  bookingValue: number
): InsuranceOfferItem | null {
  const code = String((offer as any)?.couponCode || (offer as any)?.slug || "");
  const title = String((offer as any)?.title || "Smart Insurance Offer");

  const discountAmount = Math.round(
    Math.max(0, calculateSmartOfferDiscount(offer, bookingValue || 0))
  );

  if (!code || discountAmount <= 0) return null;

  return {
    code,
    title,
    description:
      (offer as any)?.description ||
      (offer as any)?.subtitle ||
      "Smart insurance offer available.",
    discountAmount,
  };
}

export default function InsuranceBookingOffersSection({
  appliedOfferCode,
  bookingValue,
  onApplyOffer,
  onRemoveOffer,
}: Props) {
  const [smartOffer, setSmartOffer] = useState<SmartOfferItem | null>(null);

  useEffect(() => {
    const load = () => setSmartOffer(getSmartActiveOfferItem());

    load();

    window.addEventListener("TPL_ACTIVE_OFFER_UPDATED", load);
    window.addEventListener("TPL_SMART_OFFER_UPDATED", load);
    window.addEventListener("tpl_smart_offer_updated", load);
    window.addEventListener("storage", load);

    return () => {
      window.removeEventListener("TPL_ACTIVE_OFFER_UPDATED", load);
      window.removeEventListener("TPL_SMART_OFFER_UPDATED", load);
      window.removeEventListener("tpl_smart_offer_updated", load);
      window.removeEventListener("storage", load);
    };
  }, []);

  const safeBookingValue = Math.max(0, Math.round(Number(bookingValue || 0)));

  const masterOffers = useMemo<InsuranceOfferItem[]>(() => {
    const list = SMART_OFFERS_DATA.filter((item) => {
      if (!(item as any)?.active) return false;
      return isInsuranceOffer(item);
    })
      .map((offer) => buildOfferItem(offer, safeBookingValue))
      .filter(Boolean) as InsuranceOfferItem[];

    const smartItem =
      smartOffer && isInsuranceOffer(smartOffer)
        ? buildOfferItem(smartOffer, safeBookingValue)
        : null;

    if (!smartItem) return list;

    const withoutDuplicate = list.filter(
      (item) => normalizeCode(item.code) !== normalizeCode(smartItem.code)
    );

    return [smartItem, ...withoutDuplicate];
  }, [safeBookingValue, smartOffer]);

  const appliedOffer = useMemo(() => {
    const appliedCode = normalizeCode(appliedOfferCode);

    if (!appliedCode) return null;

    return (
      masterOffers.find((item) => normalizeCode(item.code) === appliedCode) ||
      null
    );
  }, [masterOffers, appliedOfferCode]);

  return (
    <div className="overflow-hidden rounded-[24px] border border-[#d9e2ec] bg-white shadow-[0_12px_34px_rgba(15,23,42,0.08)]">
      <div className="border-b border-[#e5e7eb] bg-[linear-gradient(135deg,#fff7ed_0%,#ffffff_50%,#fff1e6_100%)] px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#f97316,#ea580c)] shadow-[0_10px_24px_rgba(249,115,22,0.35)]">
            <Sparkles className="h-5 w-5 text-white" />
          </div>

          <div>
            <div className="text-[20px] font-extrabold text-[#111827]">
              Smart Coupons & Offers
            </div>
            <div className="mt-0.5 text-[12px] font-semibold text-[#6b7280]">
              AI matched insurance savings on base premium
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-4">
        {appliedOffer ? (
          <div className="relative mb-4 overflow-hidden rounded-[18px] border border-[#fed7aa] bg-[linear-gradient(135deg,#fff7ed,#ffffff)] p-4">
            <div className="absolute right-0 top-0 h-20 w-20 rounded-full bg-[#fb923c]/10 blur-3xl" />

            <div className="relative flex items-start justify-between gap-3">
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
                  Save ₹{appliedOffer.discountAmount.toLocaleString("en-IN")}
                </div>
              </div>

              <button
                type="button"
                onClick={onRemoveOffer}
                className="h-[38px] shrink-0 rounded-full border border-[#fed7aa] bg-white px-4 text-[12px] font-black text-[#ea580c]"
              >
                Remove
              </button>
            </div>
          </div>
        ) : null}

        <div className="grid gap-3">
          {masterOffers.map((offer) => {
            const active =
              normalizeCode(appliedOfferCode) === normalizeCode(offer.code);

            const isSmart =
              normalizeCode((smartOffer as any)?.couponCode) ===
                normalizeCode(offer.code) ||
              normalizeCode((smartOffer as any)?.slug) === normalizeCode(offer.code);

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

                <div className="relative flex items-start justify-between gap-3">
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

                    <div className="mt-3 text-[15px] font-black text-[#111827]">
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
                  </div>

                  <button
                    type="button"
                    disabled={active}
                    onClick={() => onApplyOffer(offer)}
                    className={`min-w-[100px] rounded-full px-4 py-2 text-[12px] font-black transition-all ${
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
              No insurance offer available right now.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}