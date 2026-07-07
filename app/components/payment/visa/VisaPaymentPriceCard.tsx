"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import { BadgeCheck, Sparkles, Tag } from "lucide-react";

type Props = {
  payload: any;

  appliedOfferAmount?: number;
  appliedOfferCode?: string;
  appliedOfferTitle?: string;

  selectedPaymentMethod: string;
  paymentActionState: "idle" | "processing" | "success" | "failure";
  isExpired: boolean;
  isLoggedIn?: boolean;
  onPayNow: () => void;
  onRetryPayment: () => void;
};

function formatPrice(value: number) {
  return `₹${Math.abs(Math.round(Number(value || 0))).toLocaleString("en-IN")}`;
}

function safeNumber(value: any, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? Math.round(num) : fallback;
}

export default function VisaPaymentPriceCard({
  payload,

  appliedOfferAmount = 0,
  appliedOfferCode = "",
  appliedOfferTitle = "Best Visa Offer Activated",

  selectedPaymentMethod,
  paymentActionState,
  isExpired,
  isLoggedIn = false,
  onPayNow,
  onRetryPayment,
}: Props) {
  const fare = payload?.fareBreakup || payload?.pricingSnapshot || {};
  const wallet = payload?.walletBreakdown || {};
  const benefitPricing = fare?.benefitPricing || payload?.pricingSnapshot?.benefitPricing || {};

  const offerAmount = safeNumber(
    appliedOfferAmount ||
      fare?.appliedOfferAmount ||
      benefitPricing?.offerDiscount ||
      payload?.appliedOffer?.discountAmount ||
      payload?.offerData?.discountAmount ||
      0
  );

  const offerCode =
    appliedOfferCode ||
    fare?.appliedOfferCode ||
    payload?.appliedOfferCode ||
    payload?.appliedOffer?.code ||
    payload?.offerData?.code ||
    "";

  const offerTitle =
    appliedOfferTitle ||
    fare?.appliedOfferTitle ||
    payload?.appliedOfferTitle ||
    payload?.appliedOffer?.title ||
    payload?.offerData?.title ||
    "Best Visa Offer Activated";

  const travellers = safeNumber(fare?.travellers || payload?.travellers || 1, 1);

  const visaFees = safeNumber(
    fare?.totalVisaFees,
    safeNumber(fare?.visaFee || payload?.option?.embassyFee) * travellers
  );

  const grossAmount = safeNumber(
    fare?.grossTotal ||
      benefitPricing?.grossAmount ||
      payload?.originalBookingBaseline?.grossTotal ||
      0
  );

  const serviceFees = Math.max(
    safeNumber(
      fare?.totalServiceFees,
      grossAmount - visaFees
    ),
    0
  );

  const totalBeforeWallet = safeNumber(
    fare?.totalBeforeWallet ||
      payload?.originalBookingBaseline?.totalBeforeWallet ||
      Math.max(grossAmount - offerAmount, 0)
  );

  const promoUsed = safeNumber(wallet?.promoUsed || fare?.promoUsed || 0);
  const earnedUsed = safeNumber(wallet?.earnedUsed || fare?.earnedUsed || 0);
  const refundUsed = safeNumber(wallet?.refundUsed || fare?.refundUsed || 0);

  const promoAvailable = safeNumber(wallet?.promoAvailable || 0);
  const earnedAvailable = safeNumber(wallet?.earnedAvailable || 0);
  const refundWalletAvailable = safeNumber(wallet?.refundWalletAvailable || 0);

  const totalWalletUsed = promoUsed + earnedUsed + refundUsed;

  const finalTotal = safeNumber(
    fare?.finalTotal ||
      benefitPricing?.finalPayable ||
      payload?.finalTotal ||
      payload?.originalBookingBaseline?.payableAmount ||
      Math.max(totalBeforeWallet - totalWalletUsed, 0)
  );

  const earnedOnThisBooking = safeNumber(
    wallet?.earnedOnThisBooking ||
      fare?.earnedOnThisBooking ||
      Math.round(safeNumber(fare?.baseAfterOffer || 0) * 0.02)
  );

  const showWallet =
    isLoggedIn &&
    (promoAvailable > 0 ||
      earnedAvailable > 0 ||
      refundWalletAvailable > 0 ||
      totalWalletUsed > 0);

  const disabled =
    !selectedPaymentMethod || isExpired || paymentActionState === "processing";

  return (
    <aside className="w-full">
      <div className="lg:sticky lg:top-5">
        <div className="min-w-0 overflow-hidden rounded-[22px] border border-[#d9e2ec] bg-white shadow-[0_12px_34px_rgba(15,23,42,0.08)] md:rounded-[24px]">
          <div className="border-b border-[#e5e7eb] bg-white px-4 py-4">
            <div className="break-words text-[20px] font-extrabold text-[#1f2937] md:text-[22px]">
              Payment Summary
            </div>

            <div className="mt-1 break-words text-[12px] font-semibold leading-5 text-[#6b7280]">
              Visa fees, service fees, offers and final payable amount
            </div>
          </div>

          {offerAmount > 0 ? (
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

                    {offerCode ? (
                      <div className="rounded-full border border-[#fdba74] bg-[#fff7ed] px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-[#ea580c]">
                        {offerCode}
                      </div>
                    ) : null}
                  </div>

                  <div className="mt-2 break-words text-[16px] font-black leading-tight text-[#111827]">
                    {offerTitle}
                  </div>

                  <div className="mt-1 flex items-start gap-2 text-[13px] font-bold leading-5 text-[#ea580c]">
                    <Tag className="h-4 w-4" />
                    <span className="min-w-0 break-words">
                      You saved {formatPrice(offerAmount)} instantly
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          <div className="border-b border-[#eef2f7] px-4 py-4">
            <FareRow label="Visa Fees" value={visaFees} />
            <FareRow label="Service Fees" value={serviceFees} />

            <div className="-mt-1 mb-3 rounded-[14px] border border-[#e5e7eb] bg-[#f8fafc] p-3">
              <MiniInfoRow label="Applicants" value={`x ${travellers}`} />
              <MiniInfoRow
                label="Gross Amount"
                value={formatPrice(grossAmount)}
              />
            </div>

            {offerAmount > 0 ? (
              <FareRow label="Offer Applied" value={-offerAmount} orange />
            ) : (
              <FareRow label="Offer Applied" value={0} />
            )}

            {totalWalletUsed > 0 ? (
              <>
                <FareRow label="TPL Credit" value={-totalWalletUsed} orange />

                {showWallet ? (
                  <div className="-mt-1 mb-4 rounded-[14px] border border-[#dbeafe] bg-[#f8fbff] p-3">
                    <div className="mb-2 text-[12px] font-extrabold text-[#1d4ed8]">
                      TPL Wallet Benefit Applied
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
                  </div>
                ) : null}
              </>
            ) : (
              <FareRow label="TPL Credit" value={0} />
            )}

            {showWallet ? (
              <div className="mb-4 rounded-[14px] border border-[#e5e7eb] bg-white p-3">
                <div className="mb-2 text-[12px] font-extrabold text-[#111827]">
                  Available Wallet Balance
                </div>

                <AvailableWalletRow label="Promo Credit" value={promoAvailable} />
                <AvailableWalletRow
                  label="Earned Credit"
                  value={earnedAvailable}
                />
                <AvailableWalletRow
                  label="Refund Wallet"
                  value={refundWalletAvailable}
                />
              </div>
            ) : null}

            {isLoggedIn && earnedOnThisBooking > 0 ? (
              <div className="mt-1 rounded-[14px] border border-[#fed7aa] bg-[linear-gradient(135deg,#fff7ed,#ffffff)] p-3 text-[12px] font-extrabold leading-[18px] text-[#ea580c]">
                🎉 You will earn ₹
                {earnedOnThisBooking.toLocaleString("en-IN")} TPL Earned Credit
                after this booking.
              </div>
            ) : null}
          </div>

          <div className="border-b border-[#e5e7eb] bg-white px-4 py-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="break-words text-[20px] font-extrabold text-[#111827]">
                  Pay Now
                </div>

                <div className="mt-1 break-words text-[12px] font-semibold leading-5 text-[#6b7280]">
                  Final amount after offer and wallet benefits
                </div>
              </div>

              <div className="shrink-0 whitespace-nowrap text-[25px] font-extrabold text-[#111827] md:text-[30px]">
                ₹{finalTotal.toLocaleString("en-IN")}
              </div>
            </div>
          </div>

          <div className="bg-white px-4 py-4">
            {paymentActionState === "failure" ? (
              <button
                type="button"
                data-testid="visa-payment-pay-button"
                onClick={onRetryPayment}
                disabled={disabled}
                className={`h-[50px] w-full rounded-full text-[16px] font-extrabold transition ${
                  disabled
                    ? "cursor-not-allowed bg-[#cfd8e3] text-white"
                    : "bg-[#dc2626] text-white shadow-[0_10px_24px_rgba(220,38,38,0.25)] hover:opacity-95"
                }`}
              >
                Retry Payment
              </button>
            ) : (
              <button
                type="button"
                data-testid="visa-payment-pay-button"
                onClick={onPayNow}
                disabled={disabled}
                className={`h-[50px] w-full rounded-full text-[15px] font-extrabold transition ${
                  disabled
                    ? "cursor-not-allowed bg-[#cfd8e3] text-white"
                    : "bg-[#ef4444] text-white shadow-[0_10px_24px_rgba(239,68,68,0.25)] hover:opacity-95"
                }`}
              >
                {paymentActionState === "processing"
                  ? "Processing..."
                  : selectedPaymentMethod
                  ? "Pay & Submit Visa Application"
                  : "Select Payment Method"}
              </button>
            )}

            {isExpired ? (
              <div className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-center text-[12px] font-bold text-red-700">
                Session expired. Please start again.
              </div>
            ) : (
              <div className="mt-3 text-center text-[12px] font-medium text-[#6b7280]">
                Secured payment powered by TPL
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
  orange = false,
}: {
  label: string;
  value: number;
  orange?: boolean;
}) {
  const isNegative = value < 0;

  return (
    <div className="mb-3 flex items-start justify-between gap-3 last:mb-0">
      <div
        className={`text-[15px] font-bold ${
          orange ? "text-[#ea580c]" : "text-[#1f2937]"
        }`}
      >
        {label}
      </div>

      <div
        className={`whitespace-nowrap text-[15px] font-bold ${
          orange ? "text-[#ea580c]" : "text-[#1f2937]"
        }`}
      >
        {isNegative ? "-" : ""}
        {formatPrice(value)}
      </div>
    </div>
  );
}

function WalletRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="mt-1.5 flex items-center justify-between gap-3">
      <span className="text-[12px] font-bold text-[#475569]">{label}</span>

      <span className="whitespace-nowrap text-[12px] font-extrabold text-[#ea580c]">
        -₹{Number(value || 0).toLocaleString("en-IN")}
      </span>
    </div>
  );
}

function AvailableWalletRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="mt-1.5 flex items-center justify-between gap-3">
      <span className="text-[12px] font-bold text-[#64748b]">{label}</span>

      <span className="whitespace-nowrap text-[12px] font-extrabold text-[#475569]">
        ₹{Number(value || 0).toLocaleString("en-IN")}
      </span>
    </div>
  );
}

function MiniInfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="mt-1 flex items-center justify-between gap-3 first:mt-0">
      <span className="text-[12px] font-bold text-[#64748b]">{label}</span>
      <span className="text-[12px] font-extrabold text-[#475569]">{value}</span>
    </div>
  );
}
