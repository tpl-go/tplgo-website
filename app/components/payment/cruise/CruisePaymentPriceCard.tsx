"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Sparkles, BadgeCheck, Tag } from "lucide-react";

type WalletCalc = {
  promoUsed: number;
  earnedUsed: number;
  refundUsed: number;
};

type PriceBreakup = {
  baseFare: number;
  tax: number;
  surcharge: number;
  insuranceTotal: number;
  appliedOffer: number;
  discount: number;
  tplCredit: number;
  totalAmount: number;

  travellerCount?: number;
  baseFarePerTraveller?: number;

  baseAfterOffer?: number;
  totalBeforeWallet?: number;

  walletCalc?: WalletCalc;
  earnedOnThisBooking?: number;
};

type Props = {
  priceBreakup: PriceBreakup;
  selectedPaymentMethod?: string;
  paymentActionState?: "idle" | "processing" | "success" | "failure";
  isExpired?: boolean;
  timerSeconds?: number;
  onPayNow?: () => void;
  onRetryPayment?: () => void;
};

function formatPrice(value: number) {
  return `₹${Math.abs(Math.round(value || 0)).toLocaleString("en-IN")}`;
}

export default function CruisePaymentPriceCard({
  priceBreakup,
  selectedPaymentMethod = "",
  paymentActionState = "idle",
  isExpired = false,
  timerSeconds = 10 * 60,
  onPayNow,
  onRetryPayment,
}: Props) {
  const [timeLeft, setTimeLeft] = useState(timerSeconds);
  const [showMobileFareDetails, setShowMobileFareDetails] = useState(false);

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

  const walletCalc = priceBreakup.walletCalc || {
    promoUsed: 0,
    earnedUsed: 0,
    refundUsed: 0,
  };

  const promoUsed = Number(walletCalc.promoUsed || 0);
  const earnedUsed = Number(walletCalc.earnedUsed || 0);
  const refundUsed = Number(walletCalc.refundUsed || 0);

  const totalTplCredit =
    promoUsed + earnedUsed + refundUsed > 0
      ? promoUsed + earnedUsed + refundUsed
      : Number(priceBreakup.tplCredit || 0);

  const totalTravellers = Number(priceBreakup.travellerCount || 0);

  const baseFarePerTraveller = useMemo(() => {
    if (Number(priceBreakup.baseFarePerTraveller || 0) > 0) {
      return Number(priceBreakup.baseFarePerTraveller || 0);
    }

    if (totalTravellers > 0 && priceBreakup.baseFare > 0) {
      return Math.round(priceBreakup.baseFare / totalTravellers);
    }

    return 0;
  }, [priceBreakup.baseFare, priceBreakup.baseFarePerTraveller, totalTravellers]);

  const baseCruiseAmount = Number(priceBreakup.baseFare || 0);

  const safeOfferDiscount = Math.min(
    Number(priceBreakup.appliedOffer || 0),
    baseCruiseAmount
  );

  const baseAfterOffer =
    Number(priceBreakup.baseAfterOffer || 0) > 0
      ? Number(priceBreakup.baseAfterOffer || 0)
      : Math.max(baseCruiseAmount - safeOfferDiscount, 0);

  const totalBeforeWallet =
    Number(priceBreakup.totalBeforeWallet || 0) > 0
      ? Number(priceBreakup.totalBeforeWallet || 0)
      : Math.max(
          baseAfterOffer +
            Number(priceBreakup.tax || 0) +
            Number(priceBreakup.surcharge || 0) +
            Number(priceBreakup.insuranceTotal || 0),
          0
        );

  const finalTotal = Number(priceBreakup.totalAmount || 0);

  const sessionExpired = isExpired || timeLeft <= 0;

  const formattedTime = useMemo(() => {
    const mm = String(Math.floor(timeLeft / 60)).padStart(2, "0");
    const ss = String(timeLeft % 60).padStart(2, "0");

    return `${mm}:${ss}`;
  }, [timeLeft]);

  const canPay =
    Boolean(selectedPaymentMethod) &&
    paymentActionState !== "processing" &&
    !sessionExpired;

  const handlePayAction = () => {
    if (!canPay) return;

    if (paymentActionState === "failure") {
      onRetryPayment?.();
    } else {
      onPayNow?.();
    }
  };

  const payButtonLabel =
    paymentActionState === "processing"
      ? "Processing..."
      : paymentActionState === "success"
      ? "Payment Success ✅"
      : paymentActionState === "failure"
      ? "Retry Payment"
      : "Proceed to Payment";

  const fareBreakup = (
    <>
      <FareRow
        label="Cruise Base Fare"
        value={baseCruiseAmount}
        detail={
          totalTravellers > 0
            ? `${formatPrice(baseFarePerTraveller)} × ${totalTravellers} Traveller${
                totalTravellers > 1 ? "s" : ""
              }`
            : "Selected cabin fare"
        }
      />

      <FareRow
        label="Offer Discount"
        value={-safeOfferDiscount}
        positiveGreen
        detail="Applied only on cruise base fare"
      />

      <FareRow
        label="Base After Offer"
        value={baseAfterOffer}
        detail="Eligible base amount after offer"
      />

      <FareRow
        label="Taxes & Fees"
        value={Number(priceBreakup.tax || 0)}
        detail="Cruise taxes and supplier charges"
      />

      {Number(priceBreakup.surcharge || 0) > 0 ? (
        <FareRow
          label="Surcharge"
          value={Number(priceBreakup.surcharge || 0)}
          detail="Additional cruise surcharge"
        />
      ) : null}

      {Number(priceBreakup.insuranceTotal || 0) > 0 ? (
        <FareRow
          label="Cruise Insurance"
          value={Number(priceBreakup.insuranceTotal || 0)}
          detail="Travel protection add-on"
        />
      ) : null}

      {Number(priceBreakup.discount || 0) > 0 ? (
        <FareRow
          label="Discount"
          value={-Number(priceBreakup.discount || 0)}
          positiveGreen
        />
      ) : null}

      {totalTplCredit > 0 ? (
        <>
          <FareRow
            label="TPL Wallet Benefit"
            value={-totalTplCredit}
            positiveGreen
          />

          {(promoUsed > 0 || earnedUsed > 0 || refundUsed > 0) && (
            <div className="-mt-1 mb-4 rounded-[14px] border border-[#dbeafe] bg-[#f8fbff] p-3">
              <div className="mb-2 text-[12px] font-extrabold text-[#1d4ed8]">
                Wallet Split
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
            </div>
          )}
        </>
      ) : (
        <FareRow label="TPL Wallet Benefit" value={0} />
      )}
    </>
  );

  return (
    <>
    <aside className="hidden w-full lg:block">
      <div className="sticky top-[110px] z-20">
        <div className="overflow-hidden rounded-[24px] border border-[#d9e2ec] bg-white shadow-[0_12px_34px_rgba(15,23,42,0.08)]">
          <div className="border-b border-[#e5e7eb] bg-white px-4 py-4">
            <div className="text-[22px] font-extrabold text-[#1f2937]">
              Fare Summary
            </div>

            <div className="mt-1 line-clamp-2 text-[12px] font-semibold leading-[18px] text-[#6b7280]">
              Cruise payment price rule applied
            </div>
          </div>

          {safeOfferDiscount > 0 ? (
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
                  </div>

                  <div className="mt-2 text-[17px] font-black leading-tight text-[#111827]">
                    Best Cruise Offer Activated
                  </div>

                  <div className="mt-1 flex items-center gap-2 text-[13px] font-bold text-[#ea580c]">
                    <Tag className="h-4 w-4" />

                    <span>
                      You saved {formatPrice(safeOfferDiscount)} instantly
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          <div className="border-b border-[#eef2f7] px-4 py-4">
            {fareBreakup}

            {totalTplCredit > 0 ? (
              <div className="mb-4 rounded-[14px] border border-dashed border-[#d9e2ec] bg-white p-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[12px] font-bold text-[#475569]">
                    Total Before Wallet
                  </span>

                  <span className="whitespace-nowrap text-[12px] font-extrabold text-[#111827]">
                    {formatPrice(totalBeforeWallet)}
                  </span>
                </div>
              </div>
            ) : null}

            {priceBreakup.earnedOnThisBooking &&
            priceBreakup.earnedOnThisBooking > 0 ? (
              <div className="mt-1 rounded-[14px] border border-[#fed7aa] bg-[linear-gradient(135deg,#fff7ed,#ffffff)] p-3 text-[12px] font-extrabold leading-[18px] text-[#ea580c]">
                🎉 You will earn ₹
                {priceBreakup.earnedOnThisBooking.toLocaleString("en-IN")} TPL
                Earned Credit after this booking.
              </div>
            ) : null}

            <div className="mt-3 rounded-[14px] border border-dashed border-[#d9e2ec] bg-white p-3 text-[11px] font-semibold leading-[17px] text-[#6b7280]">
              Offer, Promo Credit and Earned Credit apply only on cruise base
              amount after offer. Refund Wallet can apply on full payable.
            </div>
          </div>

          <div className="border-b border-[#e5e7eb] bg-white px-4 py-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[20px] font-extrabold text-[#111827]">
                  Total Amount
                </div>

                <div className="mt-1 text-[12px] font-semibold text-[#6b7280]">
                  Inclusive of taxes, insurance and wallet benefits
                </div>
              </div>

              <div className="whitespace-nowrap text-[30px] font-extrabold text-[#111827]">
                ₹{finalTotal.toLocaleString("en-IN")}
              </div>
            </div>
          </div>

          <div className="bg-white px-4 py-4">
            <button
              type="button"
              disabled={!canPay}
              onClick={handlePayAction}
              className={`h-[50px] w-full rounded-full text-[16px] font-extrabold transition ${
                canPay
                  ? "bg-[#ef4444] text-white shadow-[0_10px_24px_rgba(239,68,68,0.25)] hover:opacity-95"
                  : "cursor-not-allowed bg-[#cfd8e3] text-white"
              }`}
            >
              {payButtonLabel}
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
                  Cruise price will refresh after this timer.
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
    {typeof document !== "undefined"
      ? createPortal(
          <>
            <div className="fixed bottom-0 left-0 right-0 z-[999] w-screen border-t border-[#d9e2ec] bg-white px-3 pt-3 shadow-[0_-14px_34px_rgba(15,23,42,0.16)] lg:hidden">
              <div className="mx-auto flex max-w-[520px] items-center gap-3 pb-[calc(12px+env(safe-area-inset-bottom))]">
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] font-black uppercase tracking-[0.12em] text-[#64748b]">
                    Payable amount
                  </div>
                  <div className="mt-0.5 truncate text-[22px] font-black leading-none text-[#111827]">
                    ₹{finalTotal.toLocaleString("en-IN")}
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowMobileFareDetails(true)}
                    className="mt-2 rounded-full border border-[#bae6fd] bg-[#f0f9ff] px-3 py-1 text-[11px] font-black text-[#0284c7]"
                  >
                    Fare Details
                  </button>
                </div>

                <button
                  type="button"
                  disabled={!canPay}
                  onClick={handlePayAction}
                  className={`h-12 min-w-[148px] rounded-full px-5 text-[14px] font-black shadow-[0_10px_22px_rgba(239,68,68,0.22)] ${
                    canPay
                      ? "bg-[#ef4444] text-white"
                      : "cursor-not-allowed bg-[#cfd8e3] text-white"
                  }`}
                >
                  {paymentActionState === "processing"
                    ? "Processing..."
                    : paymentActionState === "failure"
                    ? "Retry"
                    : "Pay Now"}
                </button>
              </div>
            </div>

            {showMobileFareDetails ? (
              <div className="fixed inset-0 z-[1000] bg-black/45 px-3 pt-16 lg:hidden">
                <div className="mx-auto flex max-h-[82vh] max-w-[520px] flex-col overflow-hidden rounded-t-[28px] border border-[#e5e7eb] bg-white shadow-2xl">
                  <div className="flex items-start justify-between gap-4 border-b border-[#e5e7eb] px-4 py-4">
                    <div>
                      <div className="text-[18px] font-black text-[#111827]">
                        Fare Details
                      </div>
                      <div className="mt-1 text-[12px] font-semibold text-[#64748b]">
                        Cruise payment price rule applied
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowMobileFareDetails(false)}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f1f5f9] text-[20px] font-black text-[#111827]"
                    >
                      ×
                    </button>
                  </div>

                  <div className="overflow-y-auto px-4 py-4">
                    {safeOfferDiscount > 0 ? (
                      <div className="mb-4 rounded-[18px] border border-[#fed7aa] bg-[linear-gradient(135deg,#fff7ed,#ffffff)] p-4">
                        <div className="text-[12px] font-black uppercase tracking-[0.12em] text-[#ea580c]">
                          Offer Applied
                        </div>
                        <div className="mt-1 text-[13px] font-bold text-[#9a3412]">
                          You saved {formatPrice(safeOfferDiscount)} instantly
                        </div>
                      </div>
                    ) : null}

                    {fareBreakup}

                    {totalTplCredit > 0 ? (
                      <div className="mt-4 rounded-[16px] border border-[#e5e7eb] bg-[#f8fafc] p-4">
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-[13px] font-black text-[#111827]">
                            Total Before Wallet
                          </span>
                          <span className="text-[16px] font-black text-[#111827]">
                            {formatPrice(totalBeforeWallet)}
                          </span>
                        </div>
                      </div>
                    ) : null}

                    <div className="mt-4 rounded-[18px] bg-[#111827] p-4 text-white">
                      <div className="text-[12px] font-bold text-white/70">
                        Total Amount
                      </div>
                      <div className="mt-1 text-[26px] font-black">
                        ₹{finalTotal.toLocaleString("en-IN")}
                      </div>
                      {!selectedPaymentMethod ? (
                        <div className="mt-3 rounded-xl bg-white/10 p-3 text-[12px] font-bold leading-5 text-white">
                          Please select a payment method first.
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </>,
          document.body
        )
      : null}
    </>
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
      <div>
        <div
          className={`text-[15px] font-bold ${
            positiveGreen ? "text-[#ea580c]" : "text-[#1f2937]"
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
          positiveGreen ? "text-[#ea580c]" : "text-[#1f2937]"
        }`}
      >
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
