"use client";

import { Sparkles, BadgeCheck, Tag } from "lucide-react";
import type { CabBookingFareBreakup } from "@/app/lib/cab/cabBookingTypes";

type WalletBreakdown = {
  promoUsed: number;
  earnedUsed: number;
  refundUsed: number;
};

type Props = {
  fare: CabBookingFareBreakup & {
    baseAmount?: number;
    cabBaseFare?: number;
    appliedOfferAmount?: number;
    baseAfterOffer?: number;
    nonBenefitAmount?: number;
    totalBeforeWallet?: number;
    walletDiscount?: number;
    finalPayable?: number;
    pricingRule?: string;
  };
  canProceed: boolean;
  blockerMessage?: string;
  appliedOfferCode?: string;
  appliedOfferTitle?: string;

  walletBreakdown?: WalletBreakdown;
  earnedOnThisBooking?: number;
  refundWalletAvailable?: number;
  useRefundWallet?: boolean;
  onToggleRefundWallet?: (checked: boolean) => void;

  onProceed: () => void;
};

function formatPrice(value: number) {
  return `₹${Math.abs(value || 0).toLocaleString("en-IN")}`;
}

function toNumber(value: unknown) {
  const n = Number(value || 0);
  return Number.isFinite(n) ? n : 0;
}

export default function CabBookingFareSummary({
  fare,
  canProceed,
  blockerMessage = "",
  appliedOfferCode = "",
  appliedOfferTitle = "Best Cab Offer Activated",

  walletBreakdown,
  earnedOnThisBooking = 0,
  refundWalletAvailable = 0,
  useRefundWallet = true,
  onToggleRefundWallet,

  onProceed,
}: Props) {
  const promoUsed = walletBreakdown?.promoUsed || 0;
  const earnedUsed = walletBreakdown?.earnedUsed || 0;
  const refundUsed = walletBreakdown?.refundUsed || 0;

  const baseFare =
    toNumber(fare.baseAmount) ||
    toNumber(fare.cabBaseFare) ||
    toNumber(fare.baseFare);

  const offerDiscount =
    toNumber(fare.appliedOfferAmount) || toNumber(fare.offerDiscount);

  const baseAfterOffer =
    toNumber(fare.baseAfterOffer) || Math.max(0, baseFare - offerDiscount);

  const totalBeforeWallet =
    toNumber(fare.totalBeforeWallet) ||
    Math.max(0, toNumber(fare.totalPayable) + toNumber(fare.tplCredit));

  const specialRequestTotal = toNumber(fare.specialRequestTotal);

  const nonBenefitAmount =
    toNumber(fare.nonBenefitAmount) ||
    Math.max(0, totalBeforeWallet - baseAfterOffer);

  const taxesAndFees = Math.max(
    0,
    nonBenefitAmount - specialRequestTotal
  );

  const gstAmount = Math.round(taxesAndFees * 0.6);
  const serviceFeeAmount = Math.max(0, taxesAndFees - gstAmount);

  const tplCredit =
    toNumber(fare.walletDiscount) ||
    toNumber(fare.tplCredit) ||
    promoUsed + earnedUsed + refundUsed;

  const finalPayable =
    toNumber(fare.finalPayable) || toNumber(fare.totalPayable);

  return (
    <aside className="w-full">
      <div className="z-20 lg:sticky lg:top-[88px]">
        <div className="overflow-hidden rounded-[22px] border border-[#d9e2ec] bg-white shadow-[0_12px_34px_rgba(15,23,42,0.08)] sm:rounded-[24px]">
          <div className="border-b border-[#e5e7eb] bg-white px-4 py-4">
            <div className="text-[20px] font-extrabold text-[#1f2937] sm:text-[22px]">
              Fare Summary
            </div>
            <div className="mt-1 text-[12px] font-semibold text-[#6b7280]">
              Cab fare, requests, offers and wallet benefits
            </div>
          </div>

          {offerDiscount > 0 ? (
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

                    {appliedOfferCode ? (
                      <div className="rounded-full border border-[#fdba74] bg-[#fff7ed] px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-[#ea580c]">
                        {appliedOfferCode}
                      </div>
                    ) : null}
                  </div>

                  <div className="mt-2 text-[17px] font-black leading-tight text-[#111827]">
                    {appliedOfferTitle}
                  </div>

                  <div className="mt-1 flex items-center gap-2 text-[13px] font-bold text-[#ea580c]">
                    <Tag className="h-4 w-4" />
                    <span>
                      You saved {formatPrice(offerDiscount)} on base fare
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          <div className="border-b border-[#eef2f7] px-4 py-4">
            <FareRow label="Base Cab Fare" value={baseFare} />

            {offerDiscount > 0 ? (
              <>
                <FareRow
                  label="Offer Applied"
                  value={-offerDiscount}
                  positiveGreen
                />

                <div className="-mt-1 mb-3 rounded-[14px] border border-[#fed7aa] bg-[#fff7ed] p-3">
                  <MiniInfoRow label="Base After Offer" value={baseAfterOffer} />
                  <div className="mt-1 text-[11px] font-bold leading-[16px] text-[#ea580c]">
                    Offer applies only on true base cab fare.
                  </div>
                </div>
              </>
            ) : (
              <FareRow label="Offer Applied" value={0} />
            )}

            <FareRow label="Taxes & Fees" value={taxesAndFees} />

            <div className="-mt-1 mb-3 rounded-[14px] border border-[#e5e7eb] bg-[#f8fafc] p-3">
              <MiniInfoRow label="GST" value={gstAmount} />
              <MiniInfoRow label="Service Fee" value={serviceFeeAmount} />
            </div>

            {specialRequestTotal > 0 ? (
              <FareRow label="Special Requests" value={specialRequestTotal} />
            ) : (
              <StatusRow label="Special Requests" value="Not selected" />
            )}

            {tplCredit > 0 ? (
              <>
                <FareRow
                  label="TPL Credit / Wallet"
                  value={-tplCredit}
                  positiveGreen
                />

                {(promoUsed > 0 || earnedUsed > 0 || refundUsed > 0) && (
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

                    <div className="mt-2 text-[11px] font-bold leading-[16px] text-[#64748b]">
                      Promo + Earned Credit apply only on base-after-offer.
                      Refund Wallet can apply on final payable.
                    </div>
                  </div>
                )}
              </>
            ) : (
              <FareRow label="TPL Credit / Wallet" value={0} />
            )}

            {refundWalletAvailable > 0 && onToggleRefundWallet ? (
              <div className="mb-4 rounded-[12px] border border-[#e5e7eb] bg-white p-3">
                <label className="flex cursor-pointer items-start gap-2">
                  <input
                    type="checkbox"
                    checked={useRefundWallet}
                    onChange={(e) => onToggleRefundWallet(e.target.checked)}
                    className="mt-1"
                  />

                  <span>
                    <span className="block text-[13px] font-extrabold text-[#111827]">
                      Use Refund Wallet
                    </span>

                    <span className="mt-1 block text-[12px] font-semibold leading-[18px] text-[#6b7280]">
                      Available balance ₹
                      {refundWalletAvailable.toLocaleString("en-IN")}
                    </span>
                  </span>
                </label>
              </div>
            ) : null}

            {earnedOnThisBooking > 0 ? (
              <div className="mt-1 rounded-[14px] border border-[#fed7aa] bg-[linear-gradient(135deg,#fff7ed,#ffffff)] p-3 text-[12px] font-extrabold leading-[18px] text-[#ea580c]">
                🎉 You will earn ₹
                {earnedOnThisBooking.toLocaleString("en-IN")} TPL Earned Credit
                after this booking.
              </div>
            ) : null}
          </div>

          <div className="border-b border-[#e5e7eb] bg-white px-4 py-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="text-[20px] font-extrabold text-[#111827]">
                  Total Amount
                </div>

                <div className="mt-1 text-[12px] font-semibold text-[#6b7280]">
                  Inclusive of fare, selected requests and wallet benefits
                </div>
              </div>

              <div className="shrink-0 whitespace-nowrap text-[28px] font-extrabold text-[#111827] sm:text-[30px]">
                ₹{finalPayable.toLocaleString("en-IN")}
              </div>
            </div>
          </div>

          <div className="bg-white px-4 py-4">
            <button
              type="button"
              disabled={!canProceed}
              onClick={onProceed}
              className={`h-[50px] w-full rounded-full text-[16px] font-extrabold transition ${
                canProceed
                  ? "bg-[#ef4444] text-white shadow-[0_10px_24px_rgba(239,68,68,0.25)] hover:opacity-95"
                  : "cursor-not-allowed bg-[#cfd8e3] text-white"
              }`}
            >
              Proceed to Payment
            </button>

            {!canProceed && blockerMessage ? (
              <div className="mt-3 text-[12px] font-bold leading-[18px] text-[#dc2626]">
                {blockerMessage}
              </div>
            ) : (
              <div className="mt-3 text-center text-[12px] font-medium text-[#6b7280]">
                Secure cab booking powered by TPL
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
        className={`min-w-0 break-words text-[15px] font-bold ${
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

function MiniInfoRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="mt-1 flex items-center justify-between gap-3 first:mt-0">
      <span className="text-[12px] font-bold text-[#64748b]">{label}</span>
      <span className="text-[12px] font-extrabold text-[#475569]">
        ₹{Number(value || 0).toLocaleString("en-IN")}
      </span>
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

function StatusRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3 last:mb-0">
      <div className="min-w-0 break-words text-[15px] font-bold text-[#1f2937]">{label}</div>

      <div className="whitespace-nowrap text-[15px] font-bold text-[#6b7280]">
        {value}
      </div>
    </div>
  );
}
