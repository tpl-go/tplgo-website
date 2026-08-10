"use client";

import { useEffect, useMemo, useState } from "react";
import { Sparkles, BadgeCheck, Tag } from "lucide-react";

import {
  calculateSmartOfferDiscount,
  getSmartActiveOfferItem,
  SmartOfferItem,
} from "@/app/lib/smartOffers";
import {
  formatFlightMoney,
  normalizeFlightCurrency,
  type FlightCurrency,
} from "@/app/lib/flights/flightCurrency";

type WalletBreakdown = {
  promoUsed: number;
  earnedUsed: number;
  refundUsed: number;
};

type Props = {
  travellerCount: number;
  currency?: FlightCurrency;
  perAdultBaseFare: number;

  baseFare: number;
  tax: number;
  surcharge: number;
  appliedOffer: number;
  discount: number;
  tplCredit: number;

  walletBreakdown?: WalletBreakdown;
  earnedOnThisBooking?: number;
  refundWalletAvailable?: number;
  useRefundWallet?: boolean;
  onToggleRefundWallet?: (checked: boolean) => void;

  seatTotal?: number;
  mealTotal?: number;
  cabTotal?: number;
  insuranceTotal?: number;
  addonsTotal?: number;
  baggageTotal?: number;

  seatStatus?: "pending" | "selected" | "skipped";
  mealStatus?: "pending" | "selected" | "skipped";
  cabStatus?: "pending" | "selected" | "skipped";
  insuranceStatus?: "pending" | "selected" | "skipped";
  addonsStatus?: "pending" | "selected" | "skipped";
  baggageStatus?: "pending" | "selected" | "skipped";

  totalAmount: number;
  canProceed: boolean;
  blockerMessage?: string;
  buttonLabel?: string;
  onProceed: () => void;
};

function formatPrice(value: number, currency: FlightCurrency = "INR") {
  return formatFlightMoney(Math.abs(value || 0), currency);
}

export default function FlightFareSummaryCard({
  travellerCount,
  currency: inputCurrency = "INR",
  perAdultBaseFare,

  baseFare,
  tax,
  surcharge,
  appliedOffer,
  discount,
  tplCredit,

  walletBreakdown,
  earnedOnThisBooking = 0,
  refundWalletAvailable = 0,
  useRefundWallet = true,
  onToggleRefundWallet,

  seatTotal = 0,
  mealTotal = 0,
  cabTotal = 0,
  insuranceTotal = 0,
  addonsTotal = 0,
  baggageTotal = 0,

  seatStatus = "pending",
  mealStatus = "pending",
  cabStatus = "pending",
  insuranceStatus = "pending",
  addonsStatus = "pending",
  baggageStatus = "skipped",

  totalAmount,
  canProceed,
  blockerMessage = "",
  buttonLabel = "Proceed to Book",
  onProceed,
}: Props) {
  const currency = normalizeFlightCurrency(inputCurrency);
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
    baseFare +
    tax +
    surcharge +
    seatTotal +
    mealTotal +
    baggageTotal +
    cabTotal +
    insuranceTotal +
    addonsTotal;

  const smartOfferAmount = useMemo(() => {
    if (!smartOffer) return 0;

    if (
      smartOffer.service !== "flight" &&
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

  const taxesAndFees = tax + surcharge;

  return (
    <aside className="w-full">
      <div className="sticky top-[96px] z-20 max-md:static">
        <div className="overflow-hidden rounded-[24px] border border-[#d9e2ec] bg-white shadow-[0_12px_34px_rgba(15,23,42,0.08)] max-md:rounded-xl">
          {/* HEADER */}
          <div className="border-b border-[#e5e7eb] bg-white px-4 py-4 max-md:px-3 max-md:py-3">
            <div className="text-[22px] font-extrabold text-[#1f2937] max-md:text-[18px]">
              Fare Summary
            </div>
          </div>

          {/* SMART OFFER */}
          {finalAppliedOffer > 0 ? (
            <div className="relative overflow-hidden border-b border-[#fed7aa] bg-[linear-gradient(135deg,#fff7ed_0%,#ffffff_50%,#fff1e6_100%)] px-4 py-4">
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
                    Best Flight Offer Activated
                  </div>

                  <div className="mt-1 flex items-center gap-2 text-[13px] font-bold text-[#ea580c]">
                    <Tag className="h-4 w-4" />

                    <span>
                      You saved {formatPrice(finalAppliedOffer, currency)} instantly
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {/* BODY */}
          <div className="border-b border-[#eef2f7] px-4 py-4 max-md:px-3 max-md:py-3">
            <FareRow
              label="Base Fare"
              value={baseFare}
              detail={
                travellerCount > 1
                  ? `${formatPrice(perAdultBaseFare, currency)} x ${travellerCount}`
                  : undefined
              }
              currency={currency}
            />

            <FareRow label="Taxes & Fees" value={taxesAndFees} currency={currency} />

            {seatStatus === "skipped" ? (
              <StatusRow label="Seat Selection" value="Skipped" />
            ) : (
              <FareRow label="Seat Selection" value={seatTotal} currency={currency} />
            )}

            {mealStatus === "skipped" ? (
              <StatusRow label="Meal Selection" value="Skipped" />
            ) : (
              <FareRow label="Meal Selection" value={mealTotal} currency={currency} />
            )}

            {baggageStatus === "skipped" ? (
              <StatusRow label="Extra Baggage" value="Skipped" />
            ) : (
              <FareRow label="Extra Baggage" value={baggageTotal} currency={currency} />
            )}

            {cabStatus === "skipped" ? (
              <StatusRow label="Cab" value="Skipped" />
            ) : (
              <FareRow label="Cab" value={cabTotal} currency={currency} />
            )}

            {insuranceStatus === "skipped" ? (
              <StatusRow label="Travel Insurance" value="Skipped" />
            ) : (
              <FareRow
                label="Travel Insurance"
                value={insuranceTotal}
                currency={currency}
              />
            )}

            {addonsStatus === "skipped" ? (
              <StatusRow label="Add-ons" value="Skipped" />
            ) : (
              <FareRow label="Add-ons" value={addonsTotal} currency={currency} />
            )}

            <FareRow
              label={
                shouldUseSmartOffer && smartOffer?.couponCode
                  ? `Smart Offer (${smartOffer.couponCode})`
                  : "Applied Offer"
              }
              value={-finalAppliedOffer}
              currency={currency}
              positiveOrange
            />

            <FareRow
              label="Discount"
              value={-discount}
              currency={currency}
              positiveOrange
            />

            {tplCredit > 0 ? (
              <>
                <FareRow
                  label="TPL Credit"
                  value={-tplCredit}
                  currency={currency}
                  positiveOrange
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
                        currency={currency}
                      />
                    ) : null}

                    {earnedUsed > 0 ? (
                      <MiniWalletRow
                        label="Earned Credit"
                        value={earnedUsed}
                        currency={currency}
                      />
                    ) : null}

                    {refundUsed > 0 ? (
                      <MiniWalletRow
                        label="Refund Wallet"
                        value={refundUsed}
                        currency={currency}
                      />
                    ) : null}
                  </div>
                )}
              </>
            ) : (
              <FareRow label="TPL Credit" value={0} currency={currency} />
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
                      Available balance {formatPrice(refundWalletAvailable, currency)}
                    </span>
                  </span>
                </label>
              </div>
            ) : null}

            {earnedOnThisBooking > 0 ? (
              <div className="mt-1 rounded-[14px] border border-[#fed7aa] bg-[linear-gradient(135deg,#fff7ed,#ffffff)] p-3 text-[12px] font-extrabold leading-[18px] text-[#ea580c]">
                You will earn {formatPrice(earnedOnThisBooking, currency)} TPL
                Earned Credit after this booking.
              </div>
            ) : null}
          </div>

          {/* TOTAL */}
          <div className="border-b border-[#e5e7eb] bg-white px-4 py-4 max-md:px-3 max-md:py-3">
            <div className="flex items-center justify-between gap-3">
              <div className="text-[20px] font-extrabold text-[#111827] max-md:text-[17px]">
                Total Amount
              </div>

              <div className="whitespace-nowrap text-[30px] font-extrabold text-[#111827] max-md:text-[24px]">
                {formatPrice(totalAmount, currency)}
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="bg-white px-4 py-4 max-md:px-3 max-md:py-3">
            <button
              type="button"
              aria-disabled={!canProceed}
              onClick={onProceed}
              className={`h-[50px] w-full rounded-full text-[16px] font-extrabold transition max-md:h-12 max-md:text-[15px] ${
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
  positiveOrange = false,
  currency = "INR",
}: {
  label: string;
  value: number;
  detail?: string;
  positiveOrange?: boolean;
  currency?: FlightCurrency;
}) {
  const isNegative = value < 0;

  return (
    <div className="mb-3 flex items-start justify-between gap-3 last:mb-0">
      <div>
        <div
          className={`text-[15px] font-bold ${
            positiveOrange ? "text-[#ea580c]" : "text-[#1f2937]"
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
        className={`whitespace-nowrap text-[15px] font-bold ${
          positiveOrange ? "text-[#ea580c]" : "text-[#1f2937]"
        }`}
      >
        {isNegative ? "-" : ""}
        {formatPrice(value, currency)}
      </div>
    </div>
  );
}

function MiniWalletRow({
  label,
  value,
  currency = "INR",
}: {
  label: string;
  value: number;
  currency?: FlightCurrency;
}) {
  return (
    <div className="mt-1.5 flex items-center justify-between gap-3">
      <span className="text-[12px] font-bold text-[#475569]">
        {label}
      </span>

      <span className="whitespace-nowrap text-[12px] font-extrabold text-[#ea580c]">
        -{formatPrice(Number(value || 0), currency)}
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
      <div className="text-[15px] font-bold text-[#1f2937]">
        {label}
      </div>

      <div className="whitespace-nowrap text-[15px] font-bold text-[#6b7280]">
        {value}
      </div>
    </div>
  );
}
