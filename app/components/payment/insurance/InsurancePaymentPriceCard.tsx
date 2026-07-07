"use client";

import {
  AlertCircle,
  BadgeCheck,
  ShieldCheck,
  Sparkles,
  Tag,
} from "lucide-react";

type PaymentState = "idle" | "processing" | "success" | "failure";

type Props = {
  payload: {
    fareBreakup?: Record<string, unknown>;
    walletBreakdown?: Record<string, unknown>;
    appliedOffer?: Record<string, unknown> | null;
    offerData?: Record<string, unknown> | null;
    offerApplied?: number;
    appliedOfferCode?: string;
    appliedOfferTitle?: string;
  };
  selectedPaymentMethod: string;
  paymentActionState: PaymentState;
  isExpired: boolean;
  isLoggedIn: boolean;
  onPayNow: () => void;
  onRetryPayment: () => void;
};

function money(value: number) {
  return `₹${Math.round(Number(value || 0)).toLocaleString("en-IN")}`;
}

export default function InsurancePaymentPriceCard({
  payload,
  selectedPaymentMethod,
  paymentActionState,
  isExpired,
  isLoggedIn,
  onPayNow,
  onRetryPayment,
}: Props) {
  const fareBreakup = payload?.fareBreakup || {};
  const walletBreakdown = payload?.walletBreakdown || {};

  const appliedOffer = payload?.appliedOffer || payload?.offerData || null;

  const offerAmount = Number(
    fareBreakup?.appliedOfferAmount ||
      fareBreakup?.offerApplied ||
      payload?.offerApplied ||
      appliedOffer?.discountAmount ||
      0
  );

  const offerCode =
    fareBreakup?.appliedOfferCode ||
    payload?.appliedOfferCode ||
    appliedOffer?.code ||
    appliedOffer?.couponCode ||
    "";

  const offerTitle =
    fareBreakup?.appliedOfferTitle ||
    payload?.appliedOfferTitle ||
    appliedOffer?.title ||
    "Insurance Offer Applied";

  const grossAmount = Number(
    fareBreakup?.grossAmount ||
      Number(fareBreakup?.basePremium || 0) +
        Number(fareBreakup?.gst || 0) +
        Number(fareBreakup?.addOnTotal || 0)
  );

  const totalBeforeWallet = Number(
    fareBreakup?.totalBeforeWallet || Math.max(grossAmount - offerAmount, 0)
  );

  const promoUsed = Number(
    walletBreakdown?.promoUsed || fareBreakup?.promoUsed || 0
  );
  const earnedUsed = Number(
    walletBreakdown?.earnedUsed || fareBreakup?.earnedUsed || 0
  );
  const refundUsed = Number(
    walletBreakdown?.refundUsed || fareBreakup?.refundUsed || 0
  );

  const walletUsed = promoUsed + earnedUsed + refundUsed;

  const finalPayable = Number(
    fareBreakup?.finalTotal ||
      walletBreakdown?.finalPayable ||
      Math.max(totalBeforeWallet - walletUsed, 0)
  );

  const earnedOnThisBooking = Number(
    walletBreakdown?.earnedOnThisBooking ||
      walletBreakdown?.earnedOnBooking ||
      fareBreakup?.earnedOnBooking ||
      Math.floor(Math.max(totalBeforeWallet, 0) * 0.02)
  );

  const buttonDisabled =
    !selectedPaymentMethod ||
    paymentActionState === "processing" ||
    paymentActionState === "success" ||
    isExpired;

  return (
    <div className="min-w-0 overflow-hidden rounded-[22px] border border-[#d9e2ec] bg-white shadow-[0_12px_34px_rgba(15,23,42,0.08)] md:rounded-[24px] lg:sticky lg:top-24">
      <div className="border-b border-[#e5e7eb] bg-white px-5 py-4">
        <div className="flex items-center gap-2">
          <ShieldCheck size={20} className="text-[#ea580c]" />

          <h2 className="text-[20px] font-black text-[#111827] md:text-[22px]">
            Payment Summary
          </h2>
        </div>

        <div className="mt-1 break-words text-[12px] font-semibold leading-4 text-[#6b7280]">
          Premium, offer, wallet and final payable
        </div>
      </div>

      {offerAmount > 0 ? (
        <div className="relative overflow-hidden border-b border-[#fed7aa] bg-[linear-gradient(135deg,#fff7ed_0%,#ffffff_50%,#fff1e6_100%)] px-5 py-4">
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

                {offerCode ? (
                  <div className="rounded-full border border-[#fdba74] bg-[#fff7ed] px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-[#ea580c]">
                    {offerCode}
                  </div>
                ) : null}
              </div>

              <div className="mt-2 break-words text-[15px] font-black leading-tight text-[#111827]">
                {offerTitle}
              </div>

              <div className="mt-1 flex items-center gap-2 text-[13px] font-bold text-[#ea580c]">
                <Tag className="h-4 w-4" />
                <span>You saved {money(offerAmount)} instantly</span>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="px-5 py-5">
        <div className="space-y-3 text-[14px]">
          <SummaryRow label="Base Premium" value={Number(fareBreakup?.basePremium || 0)} />
          <SummaryRow label="GST" value={Number(fareBreakup?.gst || 0)} />

          {Number(fareBreakup?.addOnTotal || 0) > 0 ? (
            <SummaryRow label="Add-ons" value={Number(fareBreakup?.addOnTotal || 0)} />
          ) : null}

          <div className="-mt-1 rounded-[14px] border border-[#e5e7eb] bg-[#f8fafc] p-3">
            <MiniInfoRow label="Gross Amount" value={money(grossAmount)} />
          </div>

          {offerAmount > 0 ? (
            <>
              <SummaryRow label="Offer Applied" value={-offerAmount} orange />
              <SummaryRow label="Amount After Offer" value={totalBeforeWallet} />
            </>
          ) : (
            <SummaryRow label="Gross Amount" value={totalBeforeWallet} />
          )}

          {isLoggedIn && walletUsed > 0 ? (
            <>
              <SummaryRow label="TPL Credit" value={-walletUsed} orange />

              <div className="rounded-[14px] border border-[#dbeafe] bg-[#f8fbff] p-3">
                <div className="mb-2 text-[12px] font-extrabold text-[#1d4ed8]">
                  TPL Wallet Applied
                </div>

                {promoUsed > 0 ? (
                  <WalletRow label="Promo Credit" value={promoUsed} />
                ) : null}

                {earnedUsed > 0 ? (
                  <WalletRow label="Earned Credit" value={earnedUsed} />
                ) : null}

                {refundUsed > 0 ? (
                  <WalletRow label="Refund Wallet" value={refundUsed} />
                ) : null}

                <div className="mt-2 border-t border-[#dbeafe] pt-2">
                  <WalletRow label="Total Wallet Used" value={walletUsed} />
                </div>
              </div>
            </>
          ) : null}

          <div className="border-t border-dashed border-[#d1d5db] pt-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[18px] font-black text-[#111827] md:text-[20px]">
                  Pay Now
                </div>

                <div className="mt-1 break-words text-[12px] font-semibold leading-4 text-[#6b7280]">
                  Final amount after offer and wallet benefits
                </div>
              </div>

              <div className="whitespace-nowrap text-[24px] font-black text-[#111827] md:text-[30px]">
                {money(finalPayable)}
              </div>
            </div>

            {earnedOnThisBooking > 0 ? (
              <div className="mt-3 rounded-[14px] border border-[#fed7aa] bg-[linear-gradient(135deg,#fff7ed,#ffffff)] p-3 text-[12px] font-extrabold leading-[18px] text-[#ea580c]">
                🎉 You will earn {money(earnedOnThisBooking)} TPL Credit after
                this booking.
              </div>
            ) : null}
          </div>
        </div>

        {!selectedPaymentMethod && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-yellow-200 bg-yellow-50 px-3 py-2 text-xs font-bold text-yellow-800">
            <AlertCircle size={15} className="mt-0.5 shrink-0" />
            <span>Please select a payment method.</span>
          </div>
        )}

        {isExpired && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700">
            <AlertCircle size={15} className="mt-0.5 shrink-0" />
            <span>Session expired. Please restart booking.</span>
          </div>
        )}

        {paymentActionState === "failure" && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700">
            Payment failed. Please try again.
          </div>
        )}

        <button
          type="button"
          data-testid="insurance-payment-pay-button"
          disabled={buttonDisabled}
          onClick={paymentActionState === "failure" ? onRetryPayment : onPayNow}
          className={`mt-5 h-12 w-full rounded-full text-[15px] font-black text-white transition ${
            buttonDisabled
              ? "cursor-not-allowed bg-gray-400"
              : "bg-[#ea580c] shadow-[0_10px_24px_rgba(234,88,12,0.25)] hover:opacity-95"
          }`}
        >
          {paymentActionState === "processing"
            ? "Processing..."
            : paymentActionState === "success"
            ? "Payment Successful"
            : paymentActionState === "failure"
            ? "Retry Payment"
            : "Pay Now"}
        </button>

        <p className="mt-3 text-center text-xs font-semibold text-[#64748b]">
          Policy will be issued after successful payment and insurer validation.
        </p>
      </div>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  orange = false,
}: {
  label: string;
  value: number;
  orange?: boolean;
}) {
  if (!value) return null;

  const isNegative = value < 0;

  return (
    <div className="flex min-w-0 items-start justify-between gap-3">
      <span
        className={`min-w-0 break-words text-[14px] font-bold md:text-[15px] ${
          orange ? "text-[#ea580c]" : "text-[#1f2937]"
        }`}
      >
        {label}
      </span>

      <span
        className={`whitespace-nowrap text-[15px] font-bold ${
          orange ? "text-[#ea580c]" : "text-[#1f2937]"
        }`}
      >
        {isNegative ? "-" : ""}
        {money(Math.abs(value))}
      </span>
    </div>
  );
}

function WalletRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="mt-1.5 flex items-center justify-between gap-3">
      <span className="text-[12px] font-bold text-[#475569]">{label}</span>

      <span className="whitespace-nowrap text-[12px] font-extrabold text-[#ea580c]">
        -{money(value)}
      </span>
    </div>
  );
}

function MiniInfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="mt-1 flex items-center justify-between gap-3 first:mt-0">
      <span className="text-[12px] font-bold text-[#64748b]">{label}</span>
      <span className="min-w-0 break-words text-right text-[12px] font-extrabold text-[#475569]">{value}</span>
    </div>
  );
}
