"use client";

import { AlertCircle, Sparkles, BadgeCheck, Tag } from "lucide-react";

type WalletBreakup = {
  promoUsed?: number;
  earnedUsed?: number;
  refundUsed?: number;
  totalWalletUsed?: number;
  finalPayable?: number;
  earnedOnBooking?: number;
  earnedOnThisBooking?: number;

  promoAvailable?: number;
  earnedAvailable?: number;
  refundWalletAvailable?: number;
};

type Props = {
  option: {
    pricingSnapshot?: Record<string, unknown>;
    embassyFee?: number;
    serviceFee?: number;
    totalPrice?: number;
  };
  travellers: number;
  walletBreakup?: WalletBreakup;
  canProceed?: boolean;
  blockerMessage?: string;

  appliedOfferAmount?: number;
  appliedOfferCode?: string;
  appliedOfferTitle?: string;

  onContinue: () => void;
};

function formatPrice(value: number) {
  return `₹${Math.abs(Number(value || 0)).toLocaleString("en-IN")}`;
}

function safeNumber(value: unknown, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

export default function VisaFareSummaryCard({
  option,
  travellers,
  walletBreakup,
  canProceed = true,
  blockerMessage = "",

  appliedOfferAmount = 0,
  appliedOfferCode = "",
  appliedOfferTitle = "Best Visa Offer Activated",

  onContinue,
}: Props) {
  const travellerCount = Math.max(Number(travellers || 1), 1);

  const pricingSnapshot = option?.pricingSnapshot || {};

  const embassyFeePerApplicant = safeNumber(option?.embassyFee);
  const serviceFeePerApplicant = safeNumber(option?.serviceFee);
  const perTravellerTotal = safeNumber(
    option?.totalPrice,
    embassyFeePerApplicant + serviceFeePerApplicant
  );

  const grossAmount = safeNumber(
    pricingSnapshot?.totalBeforeOffer,
    perTravellerTotal * travellerCount
  );

  const visaFees = safeNumber(
    pricingSnapshot?.embassyFee,
    embassyFeePerApplicant * travellerCount
  );

  const serviceFees = Math.max(grossAmount - visaFees, 0);

  const promoUsed = Number(walletBreakup?.promoUsed || 0);
  const earnedUsed = Number(walletBreakup?.earnedUsed || 0);
  const refundUsed = Number(walletBreakup?.refundUsed || 0);

  const promoAvailable = Number(walletBreakup?.promoAvailable || 0);
  const earnedAvailable = Number(walletBreakup?.earnedAvailable || 0);
  const refundWalletAvailable = Number(walletBreakup?.refundWalletAvailable || 0);

  const totalWalletUsed = Number(
    walletBreakup?.totalWalletUsed || promoUsed + earnedUsed + refundUsed
  );

  const offerDiscount = Number(appliedOfferAmount || 0);
  const grossAfterOffer = Math.max(grossAmount - offerDiscount, 0);

  const finalPayable =
    walletBreakup?.finalPayable !== undefined
      ? Number(walletBreakup.finalPayable)
      : Math.max(0, grossAfterOffer - totalWalletUsed);

  const earnedOnBooking = Number(
    walletBreakup?.earnedOnBooking ||
      walletBreakup?.earnedOnThisBooking ||
      pricingSnapshot?.earnedOnThisBooking ||
      0
  );

  const hasWallet =
    promoAvailable > 0 ||
    earnedAvailable > 0 ||
    refundWalletAvailable > 0 ||
    promoUsed > 0 ||
    earnedUsed > 0 ||
    refundUsed > 0;

  const handleContinue = () => {
    if (!canProceed) return;
    onContinue();
  };

  return (
    <aside className="w-full">
      <div className="lg:sticky lg:top-[96px] lg:z-20">
        <div className="min-w-0 overflow-hidden rounded-[22px] border border-[#d9e2ec] bg-white shadow-[0_12px_34px_rgba(15,23,42,0.08)] md:rounded-[24px]">
          <div className="border-b border-[#e5e7eb] bg-white px-4 py-4">
            <div className="break-words text-[20px] font-extrabold leading-6 text-[#1f2937] md:text-[22px]">
              Fare Summary
            </div>

            <div className="mt-1 break-words text-[12px] font-semibold leading-4 text-[#6b7280]">
              Visa fees, service fees, offers and wallet benefits
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

                  <div className="mt-2 break-words text-[16px] font-black leading-tight text-[#111827] md:text-[17px]">
                    {appliedOfferTitle}
                  </div>

                  <div className="mt-1 flex items-center gap-2 text-[13px] font-bold text-[#ea580c]">
                    <Tag className="h-4 w-4" />
                    <span>You saved {formatPrice(offerDiscount)} instantly</span>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          <div className="border-b border-[#eef2f7] px-4 py-4">
            <FareRow label="Visa Fees" value={visaFees} />
            <FareRow label="Service Fees" value={serviceFees} />

            <div className="-mt-1 mb-3 rounded-[14px] border border-[#e5e7eb] bg-[#f8fafc] p-3">
              <MiniInfoRow label="Applicants" value={`x ${travellerCount}`} />
              <MiniInfoRow
                label="Per Applicant"
                value={formatPrice(perTravellerTotal)}
              />
            </div>

            <FareRow label="Gross Amount" value={grossAmount} />

            {offerDiscount > 0 ? (
              <FareRow
                label="Offer Applied"
                value={-offerDiscount}
                positiveGreen
              />
            ) : (
              <FareRow label="Offer Applied" value={0} />
            )}

            {totalWalletUsed > 0 ? (
              <>
                <FareRow
                  label="TPL Credit"
                  value={-totalWalletUsed}
                  positiveGreen
                />

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
              </>
            ) : (
              <FareRow label="TPL Credit" value={0} />
            )}

            {hasWallet ? (
              <div className="mb-4 rounded-[14px] border border-[#e5e7eb] bg-white p-3">
                <div className="mb-2 text-[12px] font-extrabold text-[#111827]">
                  Available Wallet Balance
                </div>

                <AvailableWalletRow label="Promo Credit" value={promoAvailable} />
                <AvailableWalletRow label="Earned Credit" value={earnedAvailable} />
                <AvailableWalletRow
                  label="Refund Wallet"
                  value={refundWalletAvailable}
                />
              </div>
            ) : null}

            {earnedOnBooking > 0 ? (
              <div className="mt-1 rounded-[14px] border border-[#fed7aa] bg-[linear-gradient(135deg,#fff7ed,#ffffff)] p-3 text-[12px] font-extrabold leading-[18px] text-[#ea580c]">
                🎉 You will earn ₹{earnedOnBooking.toLocaleString("en-IN")} TPL
                Earned Credit after this booking.
              </div>
            ) : null}
          </div>

          <div className="border-b border-[#e5e7eb] bg-white px-4 py-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="break-words text-[18px] font-extrabold text-[#111827] md:text-[20px]">
                  Total Amount
                </div>

                <div className="mt-1 break-words text-[12px] font-semibold leading-4 text-[#6b7280]">
                  Payable amount after offer and wallet benefits
                </div>
              </div>

              <div className="whitespace-nowrap text-[24px] font-extrabold text-[#111827] md:text-[30px]">
                ₹{finalPayable.toLocaleString("en-IN")}
              </div>
            </div>
          </div>

          <div className="bg-white px-4 py-4">
            <button
              type="button"
              onClick={handleContinue}
              disabled={!canProceed}
              className={`h-[52px] w-full rounded-full text-[16px] font-extrabold transition ${
                canProceed
                  ? "bg-[#ef4444] text-white shadow-[0_10px_24px_rgba(239,68,68,0.25)] hover:opacity-95"
                  : "cursor-not-allowed bg-[#cfd8e3] text-white"
              }`}
            >
              Continue to Payment
            </button>

            {!canProceed && blockerMessage ? (
              <div className="mt-3 flex items-start gap-2 rounded-xl border border-yellow-200 bg-yellow-50 px-3 py-2 text-[12px] font-bold leading-[18px] text-yellow-800">
                <AlertCircle size={15} className="mt-0.5 shrink-0" />
                <span>{blockerMessage}</span>
              </div>
            ) : (
              <div className="mt-3 text-center text-[12px] font-medium text-[#6b7280]">
                Visa approval is subject to embassy / immigration decision.
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
    <div className="mb-3 flex min-w-0 items-start justify-between gap-3 last:mb-0">
      <div
        className={`min-w-0 break-words text-[14px] font-bold md:text-[15px] ${
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
      <span className="min-w-0 break-words text-right text-[12px] font-extrabold text-[#475569]">{value}</span>
    </div>
  );
}
