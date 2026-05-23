"use client";

import { AlertCircle, Sparkles, BadgeCheck, Tag } from "lucide-react";

import { InsurancePlan } from "@/app/lib/insurance/insuranceDummyData";

import {
  InsuranceAddOnsState,
  insuranceAddOnPricing,
} from "@/app/components/booking/insurance/InsuranceAddOns";

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
  plan: InsurancePlan & {
    pricingSnapshot?: any;
    benefitPricing?: any;
    baseAfterOffer?: number;
    nonBenefitAmount?: number;
    grossAmount?: number;
    finalPayable?: number;
    earnedOnThisBooking?: number;
    finalTotal?: number;
    appliedOfferAmount?: number;
    appliedOfferCode?: string;
    appliedOfferTitle?: string;
  };
  addOns: InsuranceAddOnsState;

  walletBreakup?: WalletBreakup | null;

  offerApplied?: number;
  appliedOfferAmount?: number;
  appliedOfferCode?: string;
  appliedOfferTitle?: string;

  canProceed?: boolean;
  blockerMessage?: string;
  onContinue: () => void;
};

function formatPrice(value: number) {
  return `₹${Math.abs(Number(value || 0)).toLocaleString("en-IN")}`;
}

function safeNumber(value: any, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? Math.round(num) : fallback;
}

function getAddOnTotal(addOns: InsuranceAddOnsState) {
  return Object.entries(addOns).reduce((sum, [key, enabled]) => {
    if (!enabled) return sum;

    return (
      sum +
      Number(insuranceAddOnPricing[key as keyof typeof insuranceAddOnPricing] || 0)
    );
  }, 0);
}

export default function InsuranceFareSummary({
  plan,
  addOns,

  walletBreakup,

  offerApplied = 0,
  appliedOfferAmount = 0,
  appliedOfferCode = "",
  appliedOfferTitle = "",

  canProceed = true,
  blockerMessage = "",
  onContinue,
}: Props) {
  const pricingSnapshot = plan?.pricingSnapshot || {};

  const addOnTotal = getAddOnTotal(addOns);

  const basePremium = safeNumber(
    pricingSnapshot?.basePremium || pricingSnapshot?.baseAmount || plan?.premium
  );

  const gst = safeNumber(
    pricingSnapshot?.gstAmount || pricingSnapshot?.gst || pricingSnapshot?.taxes,
    Math.round(basePremium * 0.18)
  );

  const medicalSurcharge = safeNumber(pricingSnapshot?.medicalSurcharge);
  const adventureSportsAddon = safeNumber(pricingSnapshot?.adventureSportsAddon);
  const seniorCitizenSurcharge = safeNumber(
    pricingSnapshot?.seniorCitizenSurcharge
  );
  const convenienceFee = safeNumber(pricingSnapshot?.convenienceFee);
  const gatewayFee = safeNumber(pricingSnapshot?.gatewayFee);
  const markup = safeNumber(pricingSnapshot?.markup);
  const visaLinkedSurcharge = safeNumber(pricingSnapshot?.visaLinkedSurcharge);

  const nonBenefitAmount = safeNumber(
    pricingSnapshot?.nonBenefitAmount || plan?.nonBenefitAmount,
    gst +
      addOnTotal +
      medicalSurcharge +
      adventureSportsAddon +
      seniorCitizenSurcharge +
      convenienceFee +
      gatewayFee +
      markup +
      visaLinkedSurcharge
  );

  const grossAmount = safeNumber(
    pricingSnapshot?.grossAmount || plan?.grossAmount,
    basePremium + nonBenefitAmount
  );

  const offerDiscount = safeNumber(
    appliedOfferAmount ||
      offerApplied ||
      pricingSnapshot?.appliedOfferAmount ||
      plan?.appliedOfferAmount ||
      0
  );

  const finalOfferCode =
    appliedOfferCode ||
    pricingSnapshot?.appliedOfferCode ||
    plan?.appliedOfferCode ||
    "";

  const finalOfferTitle =
    appliedOfferTitle ||
    pricingSnapshot?.appliedOfferTitle ||
    plan?.appliedOfferTitle ||
    "Best Insurance Offer Activated";

  const baseAfterOffer = safeNumber(
    pricingSnapshot?.baseAfterOffer || plan?.baseAfterOffer,
    Math.max(basePremium - offerDiscount, 0)
  );

  const grossAfterOffer = safeNumber(
    pricingSnapshot?.totalBeforeWallet,
    baseAfterOffer + nonBenefitAmount
  );

  const promoUsed = Number(walletBreakup?.promoUsed || pricingSnapshot?.promoUsed || 0);
  const earnedUsed = Number(
    walletBreakup?.earnedUsed || pricingSnapshot?.earnedUsed || 0
  );
  const refundUsed = Number(walletBreakup?.refundUsed || pricingSnapshot?.refundUsed || 0);

  const promoAvailable = Number(walletBreakup?.promoAvailable || 0);
  const earnedAvailable = Number(walletBreakup?.earnedAvailable || 0);
  const refundWalletAvailable = Number(
    walletBreakup?.refundWalletAvailable || 0
  );

  const totalWalletUsed = Number(
    walletBreakup?.totalWalletUsed || promoUsed + earnedUsed + refundUsed
  );

  const finalPayable =
    walletBreakup?.finalPayable !== undefined
      ? Number(walletBreakup.finalPayable)
      : safeNumber(
          pricingSnapshot?.finalPayable ||
            pricingSnapshot?.finalTotal ||
            plan?.finalPayable,
          Math.max(0, grossAfterOffer - totalWalletUsed)
        );

  const earnedOnBooking = Number(
    walletBreakup?.earnedOnBooking ||
      walletBreakup?.earnedOnThisBooking ||
      pricingSnapshot?.earnedOnThisBooking ||
      plan?.earnedOnThisBooking ||
      0
  );

  const hasWallet =
    promoAvailable > 0 ||
    earnedAvailable > 0 ||
    refundWalletAvailable > 0 ||
    promoUsed > 0 ||
    earnedUsed > 0 ||
    refundUsed > 0;

  const shouldShowOfferStrip = offerDiscount > 0;

  const handleContinue = () => {
    if (!canProceed) return;
    onContinue();
  };

  return (
    <aside className="w-full">
      <div className="sticky top-[96px] z-20">
        <div className="overflow-hidden rounded-[24px] border border-[#d9e2ec] bg-white shadow-[0_12px_34px_rgba(15,23,42,0.08)]">
          <div className="border-b border-[#e5e7eb] bg-white px-4 py-4">
            <div className="text-[22px] font-extrabold text-[#1f2937]">
              Fare Summary
            </div>

            <div className="mt-1 text-[12px] font-semibold text-[#6b7280]">
              Insurance premium, GST, add-ons, offers and wallet benefits
            </div>
          </div>

          {shouldShowOfferStrip ? (
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

                    {finalOfferCode ? (
                      <div className="rounded-full border border-[#fdba74] bg-[#fff7ed] px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-[#ea580c]">
                        {finalOfferCode}
                      </div>
                    ) : null}
                  </div>

                  <div className="mt-2 text-[17px] font-black leading-tight text-[#111827]">
                    {finalOfferTitle}
                  </div>

                  <div className="mt-1 flex items-center gap-2 text-[13px] font-bold text-[#ea580c]">
                    <Tag className="h-4 w-4" />
                    <span>
                      You saved {formatPrice(offerDiscount)} instantly
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          <div className="border-b border-[#eef2f7] px-4 py-4">
            <FareRow label="Base Premium" value={basePremium} />
            <FareRow label="GST" value={gst} />

            {addOnTotal > 0 ? (
              <FareRow label="Add-ons" value={addOnTotal} />
            ) : null}

            {medicalSurcharge > 0 ? (
              <FareRow label="Medical Surcharge" value={medicalSurcharge} />
            ) : null}

            {adventureSportsAddon > 0 ? (
              <FareRow
                label="Adventure Sports Cover"
                value={adventureSportsAddon}
              />
            ) : null}

            {seniorCitizenSurcharge > 0 ? (
              <FareRow
                label="Senior Citizen Surcharge"
                value={seniorCitizenSurcharge}
              />
            ) : null}

            {convenienceFee > 0 ? (
              <FareRow label="Convenience Fee" value={convenienceFee} />
            ) : null}

            {gatewayFee > 0 ? (
              <FareRow label="Gateway Fee" value={gatewayFee} />
            ) : null}

            {markup > 0 ? <FareRow label="Markup" value={markup} /> : null}

            {visaLinkedSurcharge > 0 ? (
              <FareRow label="Visa-linked Surcharge" value={visaLinkedSurcharge} />
            ) : null}

            <div className="-mt-1 mb-3 rounded-[14px] border border-[#e5e7eb] bg-[#f8fafc] p-3">
              <MiniInfoRow
                label="Policy Type"
                value={String(plan?.insuranceType || "Travel Insurance")}
              />

              <MiniInfoRow
                label="Coverage"
                value={String(
                  (plan as any)?.coverage ||
                    (plan as any)?.coverageAmount ||
                    "Standard"
                )}
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

            <FareRow label="Amount After Offer" value={grossAfterOffer} />

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
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[20px] font-extrabold text-[#111827]">
                  Total Amount
                </div>

                <div className="mt-1 text-[12px] font-semibold text-[#6b7280]">
                  Payable amount after offer and wallet benefits
                </div>
              </div>

              <div className="whitespace-nowrap text-[30px] font-extrabold text-[#111827]">
                ₹{finalPayable.toLocaleString("en-IN")}
              </div>
            </div>
          </div>

          <div className="bg-white px-4 py-4">
            <button
              type="button"
              onClick={handleContinue}
              disabled={!canProceed}
              className={`h-[50px] w-full rounded-full text-[16px] font-extrabold transition ${
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
                Insurance policy issuance is subject to insurer validation and
                medical declaration.
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