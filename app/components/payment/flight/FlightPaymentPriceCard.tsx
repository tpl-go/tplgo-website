"use client";

import { Sparkles, BadgeCheck, Tag } from "lucide-react";
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

type PriceBreakup = {
  baseFare: number;
  tax: number;
  surcharge: number;
  seatTotal: number;
  mealTotal: number;
  cabTotal: number;
  insuranceTotal: number;
  addonsTotal: number;
  appliedOffer: number;
  discount: number;
  tplCredit: number;

  totalBeforeWallet?: number;
  baseAfterOffer?: number;

  walletCalc?: WalletBreakdown;

  totalAmount: number;
  currency?: FlightCurrency;
};

type Props = {
  priceBreakup: PriceBreakup;
  earnedOnThisBooking?: number;
  selectedPaymentMethod?: string;
  paymentActionState?: "idle" | "processing" | "success" | "failure";
  isExpired?: boolean;
  onPayNow?: () => void;
  onRetryPayment?: () => void;
};

function formatPrice(value: number, currency: FlightCurrency = "INR") {
  return formatFlightMoney(Math.abs(Number(value || 0)), currency);
}

export default function FlightPaymentPriceCard({
  priceBreakup,
  earnedOnThisBooking = 0,
  selectedPaymentMethod = "",
  paymentActionState = "idle",
  isExpired = false,
  onPayNow,
  onRetryPayment,
}: Props) {
  const promoUsed = priceBreakup.walletCalc?.promoUsed || 0;
  const currency = normalizeFlightCurrency(priceBreakup.currency);
  const earnedUsed = priceBreakup.walletCalc?.earnedUsed || 0;
  const refundUsed = priceBreakup.walletCalc?.refundUsed || 0;

  const walletUsed = promoUsed + earnedUsed + refundUsed;

  const finalAppliedOffer = Number(priceBreakup.appliedOffer || 0);
  const taxesAndFees =
    Number(priceBreakup.tax || 0) + Number(priceBreakup.surcharge || 0);

  const totalBeforeWallet =
    Number(priceBreakup.totalBeforeWallet || 0) ||
    priceBreakup.baseFare +
      taxesAndFees +
      priceBreakup.seatTotal +
      priceBreakup.mealTotal +
      priceBreakup.cabTotal +
      priceBreakup.insuranceTotal +
      priceBreakup.addonsTotal -
      finalAppliedOffer -
      priceBreakup.discount;

  return (
    <aside className="w-full">
      <div className="xl:sticky xl:top-[110px] xl:z-20">
        <div className="overflow-hidden rounded-[24px] border border-[#d9e2ec] bg-white shadow-[0_12px_34px_rgba(15,23,42,0.08)]">
          {/* HEADER */}
          <div className="border-b border-[#e5e7eb] bg-white px-4 py-4">
            <div className="text-[22px] font-extrabold text-[#1f2937]">
              Payment Summary
            </div>
          </div>

          {/* OFFER STRIP */}
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
                      Payment Savings
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
          <div className="border-b border-[#eef2f7] px-4 py-4">
            <FareRow label="Base Fare" value={priceBreakup.baseFare} currency={currency} />

            {finalAppliedOffer > 0 ? (
              <>
                <FareRow
                  label="Applied Offer"
                  value={-finalAppliedOffer}
                  currency={currency}
                  positiveOrange
                />

                {(priceBreakup.baseAfterOffer || 0) > 0 ? (
                  <FareRow
                    label="Base After Offer"
                    value={Number(priceBreakup.baseAfterOffer || 0)}
                    currency={currency}
                  />
                ) : null}
              </>
            ) : null}

            <FareRow label="Taxes & Fees" value={taxesAndFees} currency={currency} />

            {priceBreakup.seatTotal > 0 ? (
              <FareRow label="Seat Selection" value={priceBreakup.seatTotal} currency={currency} />
            ) : null}

            {priceBreakup.mealTotal > 0 ? (
              <FareRow label="Meal Selection" value={priceBreakup.mealTotal} currency={currency} />
            ) : null}

            {priceBreakup.cabTotal > 0 ? (
              <FareRow label="Cab" value={priceBreakup.cabTotal} currency={currency} />
            ) : null}

            {priceBreakup.insuranceTotal > 0 ? (
              <FareRow
                label="Travel Insurance"
                value={priceBreakup.insuranceTotal}
                currency={currency}
              />
            ) : null}

            {priceBreakup.addonsTotal > 0 ? (
              <FareRow label="Add-ons" value={priceBreakup.addonsTotal} currency={currency} />
            ) : null}

            {priceBreakup.discount > 0 ? (
              <FareRow
                label="Discount"
                value={-priceBreakup.discount}
                currency={currency}
                positiveOrange
              />
            ) : null}

            {walletUsed > 0 ? (
              <div className="-mt-1 mb-4 rounded-[14px] border border-[#dbeafe] bg-[#f8fbff] p-3">
                <div className="mb-2 text-[12px] font-extrabold text-[#1d4ed8]">
                  TPL Wallet Benefit Applied
                </div>

                {promoUsed > 0 ? (
                  <MiniWalletRow label="Promo Credit" value={promoUsed} />
                ) : null}

                {earnedUsed > 0 ? (
                  <MiniWalletRow label="Earned Credit" value={earnedUsed} />
                ) : null}

                {refundUsed > 0 ? (
                  <MiniWalletRow label="Refund Wallet" value={refundUsed} />
                ) : null}

                <div className="mt-2 border-t border-[#dbeafe] pt-2">
                  <MiniWalletRow label="Total Wallet Used" value={walletUsed} />
                </div>
              </div>
            ) : null}

            {earnedOnThisBooking > 0 ? (
              <div className="mt-1 rounded-[14px] border border-[#fed7aa] bg-[linear-gradient(135deg,#fff7ed,#ffffff)] p-3 text-[12px] font-extrabold leading-[18px] text-[#ea580c]">
                🎉 You will earn ₹
                {earnedOnThisBooking.toLocaleString("en-IN")} TPL Earned
                Credit after this booking.
              </div>
            ) : null}
          </div>

          {/* TOTAL */}
          <div className="border-b border-[#e5e7eb] bg-white px-4 py-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[20px] font-extrabold text-[#111827]">
                  Total Amount
                </div>

                {walletUsed > 0 || finalAppliedOffer > 0 ? (
                  <div className="mt-1 text-[12px] font-bold text-[#9ca3af] line-through">
                    {formatPrice(totalBeforeWallet, currency)}
                  </div>
                ) : null}
              </div>

              <div className="whitespace-nowrap text-[24px] sm:text-[30px] font-extrabold text-[#111827]">
                {formatPrice(priceBreakup.totalAmount, currency)}
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="bg-white px-4 py-4">
            <button
              type="button"
              data-testid="flight-payment-pay-button"
              onClick={() => {
                if (paymentActionState === "failure") {
                  onRetryPayment?.();
                } else {
                  onPayNow?.();
                }
              }}
              disabled={
                isExpired ||
                !selectedPaymentMethod ||
                paymentActionState === "processing"
              }
              className={`h-[50px] w-full rounded-full text-[16px] font-extrabold transition ${
                isExpired ||
                !selectedPaymentMethod ||
                paymentActionState === "processing"
                  ? "cursor-not-allowed bg-[#cfd8e3] text-white"
                  : "bg-[#ef4444] text-white shadow-[0_10px_24px_rgba(239,68,68,0.25)] hover:opacity-95"
              }`}
            >
              {isExpired
                ? "Session Expired"
                : paymentActionState === "processing"
                ? "Processing..."
                : paymentActionState === "success"
                ? "Payment Success ✅"
                : paymentActionState === "failure"
                ? "Retry Payment"
                : selectedPaymentMethod === "qr"
                ? "Confirm Payment"
                : "Proceed to Payment"}
            </button>

            {isExpired ? (
              <div className="mt-3 text-[12px] font-bold leading-[18px] text-[#dc2626]">
                Your session has expired. Please restart booking.
              </div>
            ) : !selectedPaymentMethod ? (
              <div className="mt-3 text-[12px] font-bold leading-[18px] text-[#b45309]">
                Please select a payment method first.
              </div>
            ) : paymentActionState === "failure" ? (
              <div className="mt-3 text-[12px] font-bold leading-[18px] text-[#dc2626]">
                Payment failed. You can retry.
              </div>
            ) : (
              <div className="mt-3 text-center text-[12px] font-medium text-[#6b7280]">
                Secure payment powered by TPL
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
  currency,
  detail,
  positiveOrange = false,
}: {
  label: string;
  value: number;
  currency: FlightCurrency;
  detail?: string;
  positiveOrange?: boolean;
}) {
  const isNegative = value < 0;

  if (!value && value !== 0) return null;

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
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="mt-1.5 flex items-center justify-between gap-3">
      <span className="text-[12px] font-bold text-[#475569]">{label}</span>

      <span className="whitespace-nowrap text-[12px] font-extrabold text-[#ea580c]">
        -₹{Number(value || 0).toLocaleString("en-IN")}
      </span>
    </div>
  );
}
