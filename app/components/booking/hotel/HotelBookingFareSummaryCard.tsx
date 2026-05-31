"use client";

import { useEffect, useMemo, useState } from "react";
import { Sparkles, BadgeCheck, Tag } from "lucide-react";

import {
  calculateSmartOfferDiscount,
  getSmartActiveOfferItem,
  SmartOfferItem,
} from "@/app/lib/smartOffers";

type StatusType = "pending" | "selected" | "skipped";

type WalletBreakdown = {
  promoUsed: number;
  earnedUsed: number;
  refundUsed: number;
};

type Props = {
  roomPrice: number;
  rooms: number;
  nights: number;
  subtotal: number;
  taxes: number;

  tplCredit: number;
  appliedOffer: number;

  walletBreakdown?: WalletBreakdown;
  earnedOnThisBooking?: number;
  refundWalletAvailable?: number;
  useRefundWallet?: boolean;
  onToggleRefundWallet?: (checked: boolean) => void;

  tripSecureTotal?: number;
  addOnsTotal?: number;
  cabTotal?: number;

  tripSecureStatus?: StatusType;
  cabStatus?: StatusType;
  addonsStatus?: StatusType;

  finalTotal: number;
  canProceed?: boolean;
  blockerMessage?: string;
  buttonLabel?: string;
  onProceed: () => void;
};

function formatPrice(value: number) {
  return `₹${Math.abs(value || 0).toLocaleString("en-IN")}`;
}

export default function HotelBookingFareSummaryCard({
  roomPrice,
  rooms,
  nights,
  subtotal,
  taxes,

  tplCredit,
  appliedOffer,

  walletBreakdown,
  earnedOnThisBooking = 0,
  refundWalletAvailable = 0,
  useRefundWallet = true,
  onToggleRefundWallet,

  tripSecureTotal = 0,
  addOnsTotal = 0,
  cabTotal = 0,

  tripSecureStatus = "pending",
  cabStatus = "pending",
  addonsStatus = "pending",

  finalTotal,
  canProceed = true,
  blockerMessage = "",
  buttonLabel = "Proceed to Payment",
  onProceed,
}: Props) {
  const [smartOffer, setSmartOffer] =
    useState<SmartOfferItem | null>(null);

  useEffect(() => {
    const load = () => {
      setSmartOffer(getSmartActiveOfferItem());
    };

    load();

    window.addEventListener("TPL_SMART_OFFER_UPDATED", load);
    window.addEventListener("storage", load);

    return () => {
      window.removeEventListener("TPL_SMART_OFFER_UPDATED", load);
      window.removeEventListener("storage", load);
    };
  }, []);

  const promoUsed = walletBreakdown?.promoUsed || 0;
  const earnedUsed = walletBreakdown?.earnedUsed || 0;
  const refundUsed = walletBreakdown?.refundUsed || 0;

  const grossBookingValue =
    subtotal +
    taxes +
    tripSecureTotal +
    cabTotal +
    addOnsTotal;

  const smartOfferAmount = useMemo(() => {
    if (!smartOffer) return 0;

    if (
      smartOffer.service !== "hotel" &&
      smartOffer.service !== "all"
    ) {
      return 0;
    }

    return calculateSmartOfferDiscount(
      smartOffer,
      grossBookingValue
    );
  }, [smartOffer, grossBookingValue]);

  const shouldUseSmartOffer =
    smartOfferAmount > 0 &&
    Number(appliedOffer || 0) <= 0;

  const finalAppliedOffer = shouldUseSmartOffer
    ? smartOfferAmount
    : appliedOffer;

  return (
    <aside className="w-full">
      <div className="md:sticky md:top-[88px] md:z-20">
        <div className="overflow-hidden rounded-2xl border border-[#d9e2ec] bg-white shadow-[0_12px_34px_rgba(15,23,42,0.08)] md:rounded-[24px]">
          {/* HEADER */}
          <div className="border-b border-[#e5e7eb] bg-white px-3 py-3 md:px-4 md:py-4">
            <div className="text-[20px] font-extrabold text-[#1f2937] md:text-[22px]">
              Fare Summary
            </div>
          </div>

          {/* SMART OFFER */}
          {finalAppliedOffer > 0 ? (
            <div className="relative overflow-hidden border-b border-[#fed7aa] bg-[linear-gradient(135deg,#fff7ed_0%,#ffffff_50%,#fff1e6_100%)] px-3 py-3 md:px-4 md:py-4">
              <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-[#fb923c]/10 blur-3xl" />

              <div className="relative flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#f97316,#ea580c)] shadow-[0_10px_24px_rgba(249,115,22,0.35)]">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-1 rounded-full bg-[linear-gradient(135deg,#f97316,#ea580c)] px-3 py-1 shadow-[0_6px_18px_rgba(249,115,22,0.3)]">
                      <BadgeCheck className="h-3.5 w-3.5 text-white" />

                      <span className="text-[10px] font-black uppercase tracking-[0.15em] text-white">
                        Offer Applied
                      </span>
                    </div>

                    <div className="rounded-full border border-[#fdba74] bg-[#fff7ed] px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-[#ea580c]">
                      AI Smart Savings
                    </div>
                  </div>

                  <div className="mt-2 text-[17px] font-black leading-tight text-[#111827]">
                    Best Hotel Offer Activated
                  </div>

                  <div className="mt-1 flex items-center gap-2 text-[13px] font-bold text-[#ea580c]">
                    <Tag className="h-4 w-4" />

                    <span>
                      You saved {formatPrice(finalAppliedOffer)} instantly
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {/* BODY */}
          <div className="border-b border-[#eef2f7] px-3 py-3 md:px-4 md:py-4">
            <FareRow label="Room Price / Night" value={roomPrice} />

            <FareRow
              label="Rooms × Nights"
              value={subtotal}
              detail={`${rooms} × ${nights}`}
            />

            <FareRow label="Subtotal" value={subtotal} />
            <FareRow label="Taxes & Fees" value={taxes} />

            {tripSecureStatus === "skipped" ? (
              <StatusRow label="Trip Secure" value="Skipped" />
            ) : (
              <FareRow label="Trip Secure" value={tripSecureTotal} />
            )}

            {cabStatus === "skipped" ? (
              <StatusRow label="Cab" value="Skipped" />
            ) : (
              <FareRow label="Cab" value={cabTotal} />
            )}

            {addonsStatus === "skipped" ? (
              <StatusRow label="Add-ons" value="Skipped" />
            ) : (
              <FareRow label="Add-ons" value={addOnsTotal} />
            )}

            <FareRow
              label={
                shouldUseSmartOffer && smartOffer?.couponCode
                  ? `Smart Offer (${smartOffer.couponCode})`
                  : "Offer Applied"
              }
              value={-finalAppliedOffer}
              positiveGreen
            />

            {tplCredit > 0 ? (
              <>
                <FareRow
                  label="TPL Credit"
                  value={-tplCredit}
                  positiveGreen
                />

                {(promoUsed > 0 ||
                  earnedUsed > 0 ||
                  refundUsed > 0) && (
                  <div className="-mt-1 mb-4 rounded-[14px] border border-[#dbeafe] bg-[#f8fbff] p-3">
                    <div className="mb-2 text-[12px] font-extrabold text-[#1d4ed8]">
                      TPL Wallet Benefit Applied
                    </div>

                    {promoUsed > 0 ? (
                      <MiniWalletRow
                        label="Promo Credit"
                        value={promoUsed}
                      />
                    ) : null}

                    {earnedUsed > 0 ? (
                      <MiniWalletRow
                        label="Earned Credit"
                        value={earnedUsed}
                      />
                    ) : null}

                    {refundUsed > 0 ? (
                      <MiniWalletRow
                        label="Refund Wallet"
                        value={refundUsed}
                      />
                    ) : null}
                  </div>
                )}
              </>
            ) : (
              <FareRow label="TPL Credit" value={0} />
            )}

            {refundWalletAvailable > 0 &&
            onToggleRefundWallet ? (
              <div className="mb-4 rounded-[12px] border border-[#e5e7eb] bg-white p-3">
                <label className="flex cursor-pointer items-start gap-2">
                  <input
                    type="checkbox"
                    checked={useRefundWallet}
                    onChange={(e) =>
                      onToggleRefundWallet(e.target.checked)
                    }
                    className="mt-1"
                  />

                  <span>
                    <span className="block text-[13px] font-extrabold text-[#111827]">
                      Use Refund Wallet
                    </span>

                    <span className="mt-1 block text-[12px] font-semibold leading-[18px] text-[#6b7280]">
                      Available balance ₹
                      {refundWalletAvailable.toLocaleString(
                        "en-IN"
                      )}
                    </span>
                  </span>
                </label>
              </div>
            ) : null}

            {earnedOnThisBooking > 0 ? (
              <div className="mt-1 rounded-[14px] border border-[#fed7aa] bg-[linear-gradient(135deg,#fff7ed,#ffffff)] p-3 text-[12px] font-extrabold leading-[18px] text-[#ea580c]">
                🎉 You will earn ₹
                {earnedOnThisBooking.toLocaleString("en-IN")} TPL
                Earned Credit after this booking.
              </div>
            ) : null}
          </div>

          {/* TOTAL */}
          <div className="border-b border-[#e5e7eb] bg-white px-3 py-3 md:px-4 md:py-4">
            <div className="flex items-center justify-between gap-3">
              <div className="text-[18px] font-extrabold text-[#111827] md:text-[20px]">
                Total Amount
              </div>

              <div className="whitespace-nowrap text-[25px] font-extrabold text-[#111827] md:text-[30px]">
                ₹{finalTotal.toLocaleString("en-IN")}
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="bg-white px-3 py-3 md:px-4 md:py-4">
            <button
              type="button"
              disabled={!canProceed}
              onClick={onProceed}
              className={`h-[50px] w-full rounded-xl text-[15px] font-extrabold transition md:rounded-full md:text-[16px] ${
                canProceed
                  ? "bg-[#ef4444] text-white shadow-[0_10px_24px_rgba(239,68,68,0.25)] hover:opacity-95"
                  : "cursor-not-allowed bg-[#cfd8e3] text-white"
              }`}
            >
              {buttonLabel}
            </button>

            {!canProceed && blockerMessage ? (
              <div className="mt-3 text-[12px] font-bold leading-[18px] text-[#dc2626]">
                {blockerMessage}
              </div>
            ) : (
              <div className="mt-3 text-center text-[12px] font-medium text-[#6b7280]">
                Secure booking powered by TPL
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}

function FareRow({
  label,
  value,
  detail,
  positiveGreen = false,
}: {
  label: string;
  value: number;
  detail?: string;
  positiveGreen?: boolean;
}) {
  const isNegative = value < 0;

  return (
    <div className="mb-3 flex items-start justify-between gap-3 last:mb-0">
      <div className="min-w-0">
        <div
          className={`text-[14px] font-bold md:text-[15px] ${
            positiveGreen
              ? "text-[#ea580c]"
              : "text-[#1f2937]"
          }`}
        >
          {label}
        </div>

        {detail ? (
          <div className="mt-0.5 text-[12px] font-semibold text-[#6b7280]">
            {detail}
          </div>
        ) : null}
      </div>

      <div
        className={`shrink-0 whitespace-nowrap text-[14px] font-bold md:text-[15px] ${
          positiveGreen
            ? "text-[#ea580c]"
            : "text-[#1f2937]"
        }`}
      >
        {isNegative ? "-" : ""}
        {formatPrice(value)}
      </div>
    </div>
  );
}

function MiniWalletRow({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="mt-1.5 flex items-center justify-between gap-3">
      <span className="text-[12px] font-bold text-[#475569]">
        {label}
      </span>

      <span className="whitespace-nowrap text-[12px] font-extrabold text-[#ea580c]">
        -₹{Number(value || 0).toLocaleString("en-IN")}
      </span>
    </div>
  );
}

function StatusRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3 last:mb-0">
      <div className="min-w-0 text-[14px] font-bold text-[#1f2937] md:text-[15px]">
        {label}
      </div>

      <div className="shrink-0 whitespace-nowrap text-[14px] font-bold text-[#6b7280] md:text-[15px]">
        {value}
      </div>
    </div>
  );
}
