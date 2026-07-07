"use client";

import { useEffect, useMemo, useState } from "react";
import { BadgeCheck, Sparkles, Tag } from "lucide-react";

type WalletCalc = {
  earnedUsed: number;
  promoUsed: number;
  refundUsed: number;
};

type PlannerPaymentPriceCardProps = {
  selectedVariant?: {
    label?: string;
    pricePerPerson?: number;
  };
  totalTravellers?: number;
  basePrice?: number;
  couponDiscount?: number;
  taxes?: number;
  tplCreditUsed?: number;
  walletCalc?: WalletCalc;
  earnedOnThisBooking?: number;
  insuranceAmount?: number;
  appliedCoupon?: string;
  payNowAmount?: number;
  timerSeconds?: number;
  selectedPaymentMethod?: string;
  paymentActionState?: "idle" | "processing" | "success" | "failure";
  onPayNow?: () => void;
  onRetryPayment?: () => void;
};

function formatPrice(value: number) {
  return `₹${Math.abs(Math.round(value || 0)).toLocaleString("en-IN")}`;
}

export default function PlannerPaymentPriceCard({
  selectedVariant,
  totalTravellers = 1,
  basePrice = 0,
  couponDiscount = 0,
  taxes = 0,
  tplCreditUsed = 0,
  walletCalc,
  earnedOnThisBooking = 0,
  insuranceAmount = 0,
  appliedCoupon = "",
  payNowAmount = 0,
  timerSeconds = 10 * 60,
  selectedPaymentMethod = "",
  paymentActionState,
  onPayNow,
  onRetryPayment,
}: PlannerPaymentPriceCardProps) {
  const [timeLeft, setTimeLeft] = useState(timerSeconds);

  useEffect(() => {
    setTimeLeft(timerSeconds);
  }, [timerSeconds]);

  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const promoUsed = Number(walletCalc?.promoUsed || 0);
  const earnedUsed = Number(walletCalc?.earnedUsed || 0);
  const refundUsed = Number(walletCalc?.refundUsed || 0);
  const totalTplCredit =
    promoUsed + earnedUsed + refundUsed > 0
      ? promoUsed + earnedUsed + refundUsed
      : Number(tplCreditUsed || 0);

  const basketAmount =
    Number(basePrice || 0) > 0 ? Number(basePrice || 0) : Number(selectedVariant?.pricePerPerson || 0);
  const safeCouponDiscount = Math.min(Number(couponDiscount || 0), basketAmount);
  const baseAfterOffer = Math.max(basketAmount - safeCouponDiscount, 0);
  const totalBeforeWallet =
    baseAfterOffer + Number(taxes || 0) + Number(insuranceAmount || 0);
  const finalTotal =
    Number(payNowAmount || 0) > 0
      ? Number(payNowAmount || 0)
      : Math.max(totalBeforeWallet - totalTplCredit, 0);
  const sessionExpired = timeLeft <= 0;

  const formattedTime = useMemo(() => {
    const mm = String(Math.floor(timeLeft / 60)).padStart(2, "0");
    const ss = String(timeLeft % 60).padStart(2, "0");
    return `${mm}:${ss}`;
  }, [timeLeft]);

  const canPay =
    Boolean(selectedPaymentMethod) &&
    paymentActionState !== "processing" &&
    !sessionExpired;

  return (
    <aside className="w-full">
      <div className="lg:sticky lg:top-[110px] lg:z-20">
        <div className="overflow-hidden rounded-[24px] border border-[#d9e2ec] bg-white shadow-[0_12px_34px_rgba(15,23,42,0.08)]">
          <div className="border-b border-[#e5e7eb] bg-white px-4 py-4">
            <div className="text-[22px] font-extrabold text-[#1f2937]">
              Fare Summary
            </div>

            {selectedVariant?.label ? (
              <div className="mt-1 line-clamp-2 text-[12px] font-semibold leading-[18px] text-[#6b7280]">
                {selectedVariant.label}
              </div>
            ) : null}
          </div>

          {safeCouponDiscount > 0 ? (
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

                    {appliedCoupon ? (
                      <div className="rounded-full border border-[#fdba74] bg-[#fff7ed] px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-[#ea580c]">
                        {appliedCoupon}
                      </div>
                    ) : null}
                  </div>

                  <div className="mt-2 text-[17px] font-black leading-tight text-[#111827]">
                    Smart Planner Offer Activated
                  </div>

                  <div className="mt-1 flex items-center gap-2 text-[13px] font-bold text-[#ea580c]">
                    <Tag className="h-4 w-4" />
                    <span>You saved {formatPrice(safeCouponDiscount)} instantly</span>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          <div className="border-b border-[#eef2f7] px-4 py-4">
            <FareRow
              detail={`${totalTravellers} traveller${totalTravellers > 1 ? "s" : ""} in selected basket`}
              label="Selected Basket Value"
              value={basketAmount}
            />

            <FareRow
              detail="Applied only on eligible Smart Planner basket value"
              label="Offer Discount"
              positiveGreen
              value={-safeCouponDiscount}
            />

            <FareRow
              detail="Eligible amount after offer"
              label="Base After Offer"
              value={baseAfterOffer}
            />

            <FareRow
              detail="Taxes and supplier charges"
              label="Taxes & Fees"
              value={Number(taxes || 0)}
            />

            {insuranceAmount > 0 ? (
              <FareRow
                detail="Planner protection add-on"
                label="Planner Add-ons"
                value={Number(insuranceAmount || 0)}
              />
            ) : null}

            {totalTplCredit > 0 ? (
              <>
                <FareRow
                  label="TPL Wallet Benefit"
                  positiveGreen
                  value={-totalTplCredit}
                />

                {(promoUsed > 0 || earnedUsed > 0 || refundUsed > 0) && (
                  <div className="-mt-1 mb-4 rounded-[14px] border border-[#dbeafe] bg-[#f8fbff] p-3">
                    <div className="mb-2 text-[12px] font-extrabold text-[#1d4ed8]">
                      Wallet Split
                    </div>
                    {promoUsed > 0 ? <MiniWalletRow label="Promo Credit" value={promoUsed} /> : null}
                    {earnedUsed > 0 ? <MiniWalletRow label="Earned Credit" value={earnedUsed} /> : null}
                    {refundUsed > 0 ? <MiniWalletRow label="Refund Wallet" value={refundUsed} /> : null}
                  </div>
                )}
              </>
            ) : (
              <FareRow label="TPL Wallet Benefit" value={0} />
            )}

            {earnedOnThisBooking > 0 ? (
              <div className="mt-1 rounded-[14px] border border-[#fed7aa] bg-[linear-gradient(135deg,#fff7ed,#ffffff)] p-3 text-[12px] font-extrabold leading-[18px] text-[#ea580c]">
                You will earn ₹{earnedOnThisBooking.toLocaleString("en-IN")} TPL
                Earned Credit after this booking.
              </div>
            ) : null}
          </div>

          <div className="border-b border-[#e5e7eb] bg-white px-4 py-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
              <div>
                <div className="text-[20px] font-extrabold text-[#111827]">
                  Total Amount
                </div>
                <div className="mt-1 text-[12px] font-semibold text-[#6b7280]">
                  Inclusive of taxes, planner add-ons and wallet benefits
                </div>
              </div>

              <div className="whitespace-nowrap text-[28px] font-extrabold text-[#111827] sm:text-[30px]">
                ₹{finalTotal.toLocaleString("en-IN")}
              </div>
            </div>
          </div>

          <div className="bg-white px-4 py-4">
            <button
              data-testid="smart-planner-payment-pay-button"
              className={`h-[50px] w-full rounded-full text-[16px] font-extrabold transition ${
                canPay
                  ? "bg-[#ef4444] text-white shadow-[0_10px_24px_rgba(239,68,68,0.25)] hover:opacity-95"
                  : "cursor-not-allowed bg-[#cfd8e3] text-white"
              }`}
              disabled={!canPay}
              onClick={() => {
                if (!canPay) return;
                if (paymentActionState === "failure") {
                  onRetryPayment?.();
                } else {
                  onPayNow?.();
                }
              }}
              type="button"
            >
              {paymentActionState === "processing"
                ? "Processing..."
                : paymentActionState === "success"
                  ? "Payment Success"
                  : paymentActionState === "failure"
                    ? "Retry Payment"
                    : selectedPaymentMethod === "qr"
                      ? "Confirm Payment"
                      : "Proceed to Payment"}
            </button>

            {!selectedPaymentMethod ? (
              <div className="mt-3 text-[12px] font-bold leading-[18px] text-[#dc2626]">
                Please select a payment method first.
              </div>
            ) : null}

            {paymentActionState === "failure" ? (
              <div className="mt-3 text-[12px] font-bold leading-[18px] text-[#dc2626]">
                Payment failed. You can retry.
              </div>
            ) : null}

            {sessionExpired ? (
              <div className="mt-3 text-[12px] font-bold leading-[18px] text-[#dc2626]">
                Payment session expired. Amount may refresh.
              </div>
            ) : (
              <div className="mt-3 text-center text-[12px] font-medium text-[#6b7280]">
                Secure payment powered by TPL
              </div>
            )}
          </div>

          <div className="border-t border-[#eef2f7] bg-white px-4 py-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[13px] font-extrabold text-[#111827]">
                  Complete Payment in
                </div>
                <div className="mt-0.5 text-[12px] font-semibold leading-[18px] text-[#6b7280]">
                  Planner payment amount will refresh after this timer.
                </div>
              </div>

              <div className="flex h-16 min-w-16 items-center justify-center rounded-full border-2 border-[#fecaca] bg-[#fff7f7] text-center text-[14px] font-extrabold leading-[18px] text-[#dc2626]">
                {formattedTime}
                <br />
                mins
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

function FareRow({
  detail,
  label,
  positiveGreen = false,
  value,
}: {
  detail?: string;
  label: string;
  positiveGreen?: boolean;
  value: number;
}) {
  const isNegative = value < 0;

  return (
    <div className="mb-3 flex items-start justify-between gap-3 last:mb-0">
      <div>
        <div className={`text-[15px] font-bold ${positiveGreen ? "text-[#ea580c]" : "text-[#1f2937]"}`}>
          {label}
        </div>
        {detail ? (
          <div className="mt-0.5 text-[12px] font-semibold text-[#6b7280]">{detail}</div>
        ) : null}
      </div>

      <div className={`whitespace-nowrap text-[15px] font-bold ${positiveGreen ? "text-[#ea580c]" : "text-[#1f2937]"}`}>
        {isNegative ? "-" : ""}
        {formatPrice(value)}
      </div>
    </div>
  );
}

function MiniWalletRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="mt-1.5 flex items-center justify-between gap-3">
      <span className="text-[12px] font-bold text-[#475569]">{label}</span>
      <span className="whitespace-nowrap text-[12px] font-extrabold text-[#ea580c]">
        -₹{Number(value || 0).toLocaleString("en-IN")}
      </span>
    </div>
  );
}
