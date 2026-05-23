"use client";

import { Sparkles, BadgeCheck, Tag } from "lucide-react";

type WalletCalc = {
  promoUsed?: number;
  earnedUsed?: number;
  refundUsed?: number;
};

type PriceBreakup = {
  baseFare: number;
  baseAfterOffer?: number;
  convenienceFee: number;
  gatewayFee: number;
  confirmUpgradeAmount?: number;

  tplCredit: number;
  tplCreditUsed?: number;

  appliedOffer: number;
  appliedOfferCode?: string;
  appliedOfferTitle?: string;

  totalBeforeWallet?: number;
  totalAmount: number;

  walletCalc?: WalletCalc;
  walletBreakdown?: WalletCalc;
  earnedOnThisBooking?: number;
};

type Props = {
  priceBreakup: PriceBreakup;
  selectedPaymentMethod?: string;
  paymentActionState?: "idle" | "processing" | "success" | "failure";
  isExpired?: boolean;
  onPayNow?: () => void;
  onRetryPayment?: () => void;
};

function formatPrice(value: number) {
  return `₹${Math.abs(Number(value || 0)).toLocaleString("en-IN")}`;
}

export default function TrainPaymentPriceCard({
  priceBreakup,
  selectedPaymentMethod = "",
  paymentActionState = "idle",
  isExpired = false,
  onPayNow,
  onRetryPayment,
}: Props) {
  const walletSource =
    priceBreakup.walletCalc || priceBreakup.walletBreakdown || {};

  const promoUsed = Number(walletSource.promoUsed || 0);
  const earnedUsed = Number(walletSource.earnedUsed || 0);
  const refundUsed = Number(walletSource.refundUsed || 0);

  const baseFare = Number(priceBreakup.baseFare || 0);
  const offerApplied = Number(priceBreakup.appliedOffer || 0);
  const baseAfterOffer = Number(
    priceBreakup.baseAfterOffer ?? Math.max(0, baseFare - offerApplied)
  );

  const convenienceFee = Number(priceBreakup.convenienceFee || 0);
  const gatewayFee = Number(priceBreakup.gatewayFee || 0);
  const confirmUpgradeAmount = Number(priceBreakup.confirmUpgradeAmount || 0);

  const tplPromoEarnedUsed = promoUsed + earnedUsed;
  const totalWalletUsed =
    promoUsed + earnedUsed + refundUsed || Number(priceBreakup.tplCredit || 0);

  const totalBeforeWallet = Number(
    priceBreakup.totalBeforeWallet ||
      baseAfterOffer + convenienceFee + gatewayFee + confirmUpgradeAmount
  );

  const buttonLabel = isExpired
    ? "Session Expired"
    : paymentActionState === "processing"
    ? "Processing..."
    : paymentActionState === "success"
    ? "Payment Success ✅"
    : paymentActionState === "failure"
    ? "Retry Payment"
    : "Proceed to Payment";

  return (
    <aside className="w-full">
      <div className="sticky top-[110px] z-20">
        <div className="overflow-hidden rounded-[24px] border border-[#d9e2ec] bg-white shadow-[0_12px_34px_rgba(15,23,42,0.08)]">
          <div className="border-b border-[#e5e7eb] bg-white px-4 py-4">
            <div className="text-[22px] font-extrabold text-[#1f2937]">
              Payment Summary
            </div>

            <div className="mt-1 text-[12px] font-semibold text-[#6b7280]">
              Train fare, non-benefit fees, offers and wallet benefits
            </div>
          </div>

          {offerApplied > 0 ? (
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

                    {priceBreakup.appliedOfferCode ? (
                      <div className="rounded-full border border-[#fdba74] bg-[#fff7ed] px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-[#ea580c]">
                        {priceBreakup.appliedOfferCode}
                      </div>
                    ) : null}
                  </div>

                  <div className="mt-2 text-[17px] font-black leading-tight text-[#111827]">
                    {priceBreakup.appliedOfferTitle ||
                      "Best Train Offer Activated"}
                  </div>

                  <div className="mt-1 flex items-center gap-2 text-[13px] font-bold text-[#ea580c]">
                    <Tag className="h-4 w-4" />
                    <span>
                      You saved {formatPrice(offerApplied)} on base train fare
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          <div className="border-b border-[#eef2f7] px-4 py-4">
            <FareRow label="Base Train Fare" value={baseFare} />

            <FareRow
              label="Offer Applied on Base Fare"
              value={-offerApplied}
              positiveGreen
            />

            {offerApplied > 0 ? (
              <div className="-mt-1 mb-3 rounded-[12px] border border-[#fed7aa] bg-[#fff7ed] px-3 py-2 text-[11px] font-bold leading-[17px] text-[#ea580c]">
                Base after offer: ₹{baseAfterOffer.toLocaleString("en-IN")}
              </div>
            ) : null}

            <FareRow label="Convenience Fee" value={convenienceFee} />
            <FareRow label="Gateway Fee" value={gatewayFee} />

            {confirmUpgradeAmount > 0 ? (
              <FareRow
                label="Confirm Ticket Upgrade"
                value={confirmUpgradeAmount}
              />
            ) : null}

            <div className="mb-4 rounded-[12px] border border-[#e5e7eb] bg-[#f8fafc] px-3 py-2">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[12px] font-extrabold text-[#475569]">
                  Total Before Wallet
                </span>

                <span className="whitespace-nowrap text-[12px] font-black text-[#111827]">
                  ₹{totalBeforeWallet.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {totalWalletUsed > 0 ? (
              <>
                {tplPromoEarnedUsed > 0 ? (
                  <FareRow
                    label="TPL Promo + Earned Credit"
                    value={-tplPromoEarnedUsed}
                    positiveGreen
                  />
                ) : null}

                {refundUsed > 0 ? (
                  <FareRow
                    label="Refund Wallet"
                    value={-refundUsed}
                    positiveGreen
                  />
                ) : null}

                <div className="-mt-1 mb-4 rounded-[14px] border border-[#dbeafe] bg-[#f8fbff] p-3">
                  <div className="mb-2 text-[12px] font-extrabold text-[#1d4ed8]">
                    Wallet Benefit Applied
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

                  <div className="mt-2 border-t border-[#dbeafe] pt-2 text-[11px] font-bold leading-[17px] text-[#475569]">
                    Promo/Earned used only on base-after-offer. Refund Wallet
                    used on final payable.
                  </div>
                </div>
              </>
            ) : (
              <FareRow label="Wallet Benefit" value={0} />
            )}

            {Number(priceBreakup.earnedOnThisBooking || 0) > 0 ? (
              <div className="mt-1 rounded-[14px] border border-[#fed7aa] bg-[linear-gradient(135deg,#fff7ed,#ffffff)] p-3 text-[12px] font-extrabold leading-[18px] text-[#ea580c]">
                🎉 You will earn ₹
                {Number(priceBreakup.earnedOnThisBooking || 0).toLocaleString(
                  "en-IN"
                )}{" "}
                TPL Earned Credit after this booking.
              </div>
            ) : null}
          </div>

          <div className="border-b border-[#e5e7eb] bg-white px-4 py-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[20px] font-extrabold text-[#111827]">
                  Total Amount
                </div>

                <div className="mt-1 text-[12px] font-semibold text-[#6b7280]">
                  Final payable after offer and wallet benefits
                </div>
              </div>

              <div className="whitespace-nowrap text-[30px] font-extrabold text-[#111827]">
                ₹{Number(priceBreakup.totalAmount || 0).toLocaleString("en-IN")}
              </div>
            </div>
          </div>

          <div className="bg-white px-4 py-4">
            <button
              type="button"
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
              {buttonLabel}
            </button>

            {isExpired ? (
              <div className="mt-3 text-[12px] font-bold leading-[18px] text-[#dc2626]">
                Your session has expired. Please restart booking.
              </div>
            ) : !selectedPaymentMethod ? (
              <div className="mt-3 text-[12px] font-semibold leading-[18px] text-[#b45309]">
                Please select a payment method first.
              </div>
            ) : paymentActionState === "failure" ? (
              <div className="mt-3 text-[12px] font-semibold leading-[18px] text-[#dc2626]">
                Payment failed. You can retry.
              </div>
            ) : (
              <div className="mt-3 text-center text-[12px] font-medium text-[#6b7280]">
                Secure train payment powered by TPL
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
  positiveGreen = false,
}: {
  label: string;
  value: number;
  positiveGreen?: boolean;
}) {
  const isNegative = value < 0;

  return (
    <div className="mb-3 flex items-start justify-between gap-3 last:mb-0">
      <div
        className={`text-[15px] font-bold ${
          positiveGreen ? "text-[#ea580c]" : "text-[#1f2937]"
        }`}
      >
        {label}
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