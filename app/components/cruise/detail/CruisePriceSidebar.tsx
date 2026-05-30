"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { Sparkles, BadgeCheck, Tag, X } from "lucide-react";
import { applyBenefitPricing } from "@/app/lib/pricing/applyBenefitPricing";

type CabinPricingItem = {
  cabinKey: string;
  cabinId: string;
  cabinName: string;
  adults: number;
  children: number;
  infants: number;
  subtotal: number;
};

type PricingSummary = {
  cabins: CabinPricingItem[];
  cabinsTotal: number;
  taxesAndFees: number;
  grandTotal: number;
} | null;

type CabinAssignmentMeta = {
  cabinId: string;
  assignmentMode: "auto" | "select";
  deckCabinNumber?: string | null;
};

type WalletPreview = {
  promoCredit: number;
  earnedCredit: number;
  refundableBalance: number;
};

type Props = {
  cruiseId: string;
  title?: string;
  sailingDate?: string | null;
  price: number;
  taxesText?: string;
  ctaText?: string;
  disabled?: boolean;
  onProceed: () => void;
  pricingSummary?: PricingSummary;
  cabinAssignmentMeta?: CabinAssignmentMeta[];
  offerCode?: string;
  offerTitle?: string;
  offerDiscount?: number;
  wallet?: WalletPreview;
  activeUserMobile?: string;
};

function formatPrice(value: number) {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
}

function formatDate(value?: string | null) {
  if (!value) return "Sailing date on request";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;

  return parsed.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function CruisePriceSidebar({
  cruiseId,
  title = "Cruise Sailing",
  sailingDate,
  price,
  taxesText = "Taxes & fees extra",
  ctaText = "Choose Cabin to Continue",
  disabled = false,
  onProceed,
  pricingSummary = null,
  cabinAssignmentMeta = [],
  offerCode = "",
  offerTitle = "Best Cruise Offer Activated",
  offerDiscount = 0,
  wallet = {
    promoCredit: 0,
    earnedCredit: 0,
    refundableBalance: 0,
  },
  activeUserMobile = "",
}: Props) {
  const [showMobileFareDetails, setShowMobileFareDetails] = useState(false);
  const hasSelection = !!pricingSummary?.cabins?.length;
  const isLoggedIn = !!activeUserMobile;

  const cabins = hasSelection ? pricingSummary?.cabins || [] : [];
  const cabinsTotal = hasSelection ? pricingSummary?.cabinsTotal || 0 : 0;
  const taxesAndFees = hasSelection ? pricingSummary?.taxesAndFees || 0 : 0;

  const startingPrice = Number(price || 0);
  const baseAmount = hasSelection ? cabinsTotal : startingPrice;

  const activeOfferDiscount =
    offerDiscount > 0 ? Math.min(Number(offerDiscount || 0), baseAmount) : 0;

  const benefitPricing = applyBenefitPricing({
    baseAmount,
    taxes: taxesAndFees,
    offerDiscount: activeOfferDiscount,
    promoCredit: isLoggedIn ? wallet.promoCredit : 0,
    earnedCredit: isLoggedIn ? wallet.earnedCredit : 0,
    refundWallet: isLoggedIn ? wallet.refundableBalance : 0,
  });

  const baseAfterOffer = benefitPricing.baseAfterOffer;
  const totalBeforeWallet = benefitPricing.payableBeforeRefundWallet;
  const desktopFinalPayable = benefitPricing.finalPayable;

  const tplCreditUsed = benefitPricing.promoUsed + benefitPricing.earnedUsed;
  const totalWalletUsed =
    benefitPricing.promoUsed +
    benefitPricing.earnedUsed +
    benefitPricing.refundUsed;

  const desktopSavingsAmount = activeOfferDiscount + totalWalletUsed;
  const desktopOriginalPayable = baseAmount + taxesAndFees;

  const earnedOnThisBooking = Math.floor(baseAfterOffer * 0.02);

  function getCabinDisplayAmount(subtotal: number) {
    const rawAmount = Number(subtotal || 0);

    if (!rawAmount || !cabinsTotal || activeOfferDiscount <= 0) {
      return rawAmount;
    }

    const cabinOfferDiscount = Math.min(
      rawAmount,
      Math.round((rawAmount / cabinsTotal) * activeOfferDiscount)
    );

    return Math.max(rawAmount - cabinOfferDiscount, 0);
  }

  return (
    <>
    <aside className="hidden w-full lg:block">
      <div className="sticky top-[110px] z-20 w-full">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-[#eef8ff] px-4 py-4">
            <div className="text-[12px] font-bold uppercase text-slate-500">
              {hasSelection ? "Total Price" : "Starting from"}
            </div>

            {desktopSavingsAmount > 0 ? (
              <div className="mt-2 text-[14px] font-bold text-slate-400 line-through">
                {formatPrice(desktopOriginalPayable)}
              </div>
            ) : null}

            <div className="mt-1 text-[30px] font-black leading-none text-slate-900">
              {formatPrice(desktopFinalPayable)}
            </div>

            <div className="mt-2 text-[12px] font-semibold text-slate-600">
              {taxesText}
            </div>
          </div>

          {activeOfferDiscount > 0 ? (
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

                  <div className="mt-2 text-[16px] font-black leading-tight text-[#111827]">
                    {offerTitle}
                  </div>

                  <div className="mt-1 flex items-center gap-2 text-[13px] font-bold text-[#ea580c]">
                    <Tag className="h-4 w-4" />

                    <span>
                      You saved {formatPrice(activeOfferDiscount)} instantly
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          <div className="border-b border-slate-200 px-4 py-4">
            <div className="text-[16px] font-extrabold text-slate-900">
              {title}
            </div>

            <div className="mt-2 text-[13px] font-semibold text-slate-600">
              Sailing: {formatDate(sailingDate)}
            </div>

            <div className="mt-1 text-[12px] font-medium text-slate-500">
              Cruise ID: {cruiseId}
            </div>
          </div>

          {isLoggedIn ? (
            <div className="border-b border-slate-200 px-4 py-4">
              <div className="mb-3 text-[15px] font-extrabold text-slate-900">
                TPL Wallet Available
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <WalletBox label="Promo" value={wallet.promoCredit} />
                <WalletBox label="Earned" value={wallet.earnedCredit} />
                <WalletBox label="Refund" value={wallet.refundableBalance} />
              </div>
            </div>
          ) : null}

          <div className="border-b border-slate-200 px-4 py-4">
            <div className="mb-3 text-[15px] font-extrabold text-slate-900">
              Price Breakup
            </div>

            {hasSelection ? (
              <>
                <PriceRow label="Cruise Base Fare" value={baseAmount} />

                {activeOfferDiscount > 0 ? (
                  <>
                    <PriceRow
                      label="Offer Discount"
                      value={-activeOfferDiscount}
                      orange
                    />

                    <div className="mb-3 rounded-[14px] border border-[#fed7aa] bg-[#fffaf5] p-3">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[12px] font-bold text-[#9a3412]">
                          Base After Offer
                        </span>

                        <span className="text-[12px] font-extrabold text-[#ea580c]">
                          {formatPrice(baseAfterOffer)}
                        </span>
                      </div>

                      <div className="mt-1 text-[11px] font-semibold leading-[17px] text-[#7c2d12]">
                        Offer applies only on cruise base fare. Taxes and extra
                        charges remain outside offer calculation.
                      </div>
                    </div>
                  </>
                ) : null}

                <PriceRow label="Taxes & Fees" value={taxesAndFees} />

                {tplCreditUsed > 0 ? (
                  <PriceRow
                    label="TPL Credit"
                    value={-tplCreditUsed}
                    orange
                  />
                ) : (
                  <PriceRow label="TPL Credit" value={0} />
                )}

                {totalWalletUsed > 0 ? (
                  <div className="-mt-1 mb-4 rounded-[14px] border border-[#dbeafe] bg-[#f8fbff] p-3">
                    <div className="mb-2 text-[12px] font-extrabold text-[#1d4ed8]">
                      TPL Wallet Benefit Applied
                    </div>

                    {benefitPricing.promoUsed > 0 ? (
                      <MiniWalletRow
                        label="Promo Credit"
                        value={benefitPricing.promoUsed}
                      />
                    ) : null}

                    {benefitPricing.earnedUsed > 0 ? (
                      <MiniWalletRow
                        label="Earned Credit"
                        value={benefitPricing.earnedUsed}
                      />
                    ) : null}

                    {benefitPricing.refundUsed > 0 ? (
                      <MiniWalletRow
                        label="Refund Wallet"
                        value={benefitPricing.refundUsed}
                      />
                    ) : null}
                  </div>
                ) : null}

                {benefitPricing.refundUsed > 0 ? (
                  <PriceRow
                    label="Refund Wallet"
                    value={-benefitPricing.refundUsed}
                    orange
                  />
                ) : null}

                {totalWalletUsed > 0 ? (
                  <div className="mb-3 rounded-[14px] border border-dashed border-slate-200 bg-white p-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[12px] font-bold text-slate-600">
                        Total Before Wallet
                      </span>

                      <span className="text-[12px] font-extrabold text-slate-900">
                        {formatPrice(totalBeforeWallet)}
                      </span>
                    </div>
                  </div>
                ) : null}

                {earnedOnThisBooking > 0 ? (
                  <div className="mt-1 rounded-[14px] border border-[#fed7aa] bg-[linear-gradient(135deg,#fff7ed,#ffffff)] p-3 text-[12px] font-extrabold leading-[18px] text-[#ea580c]">
                    🎉 You will earn {formatPrice(earnedOnThisBooking)} TPL
                    Earned Credit after this booking.
                  </div>
                ) : null}

                <div className="mt-3 rounded-[14px] border border-dashed border-[#d9e2ec] bg-white p-3 text-[11px] font-semibold leading-[17px] text-[#6b7280]">
                  Offer, Promo Credit and Earned Credit apply only on cruise
                  base value after offer. Refund Wallet can apply on full
                  payable.
                </div>
              </>
            ) : (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-[12px] font-semibold leading-[18px] text-slate-600">
                Select cabin and passenger details to view exact fare, taxes and
                final payable amount.
              </div>
            )}

            <div className="mt-3 border-t border-dashed border-slate-300 pt-3">
              <PriceRow label="Total Amount" value={desktopFinalPayable} strong />
            </div>
          </div>

          {cabins.length > 0 ? (
            <div className="border-b border-slate-200 px-4 py-4">
              <div className="mb-3 text-[15px] font-extrabold text-slate-900">
                Selected Cabins
              </div>

              <div className="space-y-3">
                {cabins.map((cabin, index) => {
                  const assignment = cabinAssignmentMeta.find(
                    (item) => item.cabinId === cabin.cabinId
                  );

                  return (
                    <div
                      key={`${cabin.cabinId}-${index}`}
                      className="rounded-xl border border-slate-200 bg-slate-50 p-3"
                    >
                      <div className="text-[13px] font-extrabold text-slate-900">
                        {cabin.cabinName}
                      </div>

                      <div className="mt-1 text-[12px] font-medium text-slate-600">
                        {cabin.adults} Adult
                        {cabin.adults > 1 ? "s" : ""}
                        {cabin.children ? ` • ${cabin.children} Child` : ""}
                        {cabin.infants ? ` • ${cabin.infants} Infant` : ""}
                      </div>

                      {assignment?.deckCabinNumber ? (
                        <div className="mt-1 text-[12px] font-bold text-sky-700">
                          Cabin No: {assignment.deckCabinNumber}
                        </div>
                      ) : (
                        <div className="mt-1 text-[12px] font-medium text-slate-500">
                          Cabin allocation:{" "}
                          {assignment?.assignmentMode === "select"
                            ? "Selected"
                            : "Auto"}
                        </div>
                      )}

                      <div className="mt-2 text-[13px] font-extrabold text-slate-900">
                        {formatPrice(getCabinDisplayAmount(cabin.subtotal))}
                        {activeOfferDiscount > 0 ? (
                          <span className="ml-1 text-[11px] font-bold text-orange-600">
                            after offer
                          </span>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}

          <div className="px-4 py-4">
            <button
              type="button"
              disabled={disabled}
              onClick={() => {
                if (!disabled) onProceed();
              }}
              className={`h-[48px] w-full rounded-full text-[15px] font-extrabold transition ${
                disabled
                  ? "cursor-not-allowed bg-slate-300 text-white"
                  : "bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 text-white shadow-[0_8px_20px_rgba(249,115,22,0.28)] hover:opacity-95"
              }`}
            >
              {ctaText}
            </button>

            <div className="mt-3 text-center text-[11px] font-semibold text-slate-500">
              Secure cruise booking powered by TPL
            </div>
          </div>
        </div>
      </div>
    </aside>
    {typeof document !== "undefined"
      ? createPortal(
          <>
            <div
              className="fixed bottom-0 left-0 right-0 z-[999] w-screen border-t border-slate-200 bg-white px-3 pb-[calc(env(safe-area-inset-bottom)+8px)] pt-3 shadow-[0_-14px_34px_rgba(15,23,42,0.18)] lg:hidden"
              style={{ bottom: 0, left: 0, right: 0, position: "fixed" }}
            >
              <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex min-w-0 items-center gap-2">
                    <div className="text-[10px] font-black uppercase tracking-wide text-slate-500">
                      {hasSelection ? "Total" : "From"}
                    </div>
                    {desktopSavingsAmount > 0 ? (
                      <div className="truncate rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-black text-orange-700">
                        Save {formatPrice(desktopSavingsAmount)}
                      </div>
                    ) : null}
                  </div>

                  <div className="mt-1 flex min-w-0 items-center gap-2">
                    <div className="text-[23px] font-black leading-none text-slate-900">
                      {formatPrice(desktopFinalPayable)}
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowMobileFareDetails(true)}
                      className="h-8 shrink-0 rounded-full border border-slate-200 bg-slate-50 px-3 text-[11px] font-black text-slate-800"
                    >
                      Details
                    </button>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => {
                      if (!disabled) onProceed();
                    }}
                    className={`h-12 shrink-0 rounded-full px-5 text-[13px] font-black transition ${
                      disabled
                        ? "cursor-not-allowed bg-slate-300 text-white"
                        : "bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 text-white shadow-[0_8px_20px_rgba(249,115,22,0.28)]"
                    }`}
                  >
                    {hasSelection ? "Continue" : "Choose Cabin"}
                  </button>
                </div>
              </div>
            </div>

            {showMobileFareDetails ? (
      <div className="fixed inset-0 z-[1000] lg:hidden">
        <button
          type="button"
          aria-label="Close fare details"
          className="absolute inset-0 h-full w-full bg-slate-950/45"
          onClick={() => setShowMobileFareDetails(false)}
        />

        <div className="absolute inset-x-0 bottom-0 max-h-[82dvh] overflow-hidden rounded-t-[28px] border border-slate-200 bg-white shadow-[0_-18px_42px_rgba(15,23,42,0.25)]">
          <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
            <div>
              <div className="text-[16px] font-black text-slate-900">
                Fare Details
              </div>
              <div className="mt-0.5 text-[12px] font-semibold text-slate-500">
                Same fare breakup as desktop sidebar
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowMobileFareDetails(false)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm"
              aria-label="Close fare details"
            >
              <X size={18} />
            </button>
          </div>

          <div className="max-h-[calc(82dvh-72px)] overflow-y-auto px-4 pb-[calc(env(safe-area-inset-bottom)+16px)] pt-4">
            {hasSelection ? (
              <>
                <PriceRow label="Cruise Base Fare" value={baseAmount} />

                {activeOfferDiscount > 0 ? (
                  <>
                    <PriceRow
                      label="Offer Discount"
                      value={-activeOfferDiscount}
                      orange
                    />

                    <div className="mb-3 rounded-[14px] border border-[#fed7aa] bg-[#fffaf5] p-3">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[12px] font-bold text-[#9a3412]">
                          Base After Offer
                        </span>

                        <span className="text-[12px] font-extrabold text-[#ea580c]">
                          {formatPrice(baseAfterOffer)}
                        </span>
                      </div>
                    </div>
                  </>
                ) : null}

                <PriceRow label="Taxes & Fees" value={taxesAndFees} />

                {tplCreditUsed > 0 ? (
                  <PriceRow
                    label="TPL Credit"
                    value={-tplCreditUsed}
                    orange
                  />
                ) : (
                  <PriceRow label="TPL Credit" value={0} />
                )}

                {totalWalletUsed > 0 ? (
                  <div className="-mt-1 mb-4 rounded-[14px] border border-[#dbeafe] bg-[#f8fbff] p-3">
                    <div className="mb-2 text-[12px] font-extrabold text-[#1d4ed8]">
                      TPL Wallet Benefit Applied
                    </div>

                    {benefitPricing.promoUsed > 0 ? (
                      <MiniWalletRow
                        label="Promo Credit"
                        value={benefitPricing.promoUsed}
                      />
                    ) : null}

                    {benefitPricing.earnedUsed > 0 ? (
                      <MiniWalletRow
                        label="Earned Credit"
                        value={benefitPricing.earnedUsed}
                      />
                    ) : null}

                    {benefitPricing.refundUsed > 0 ? (
                      <MiniWalletRow
                        label="Refund Wallet"
                        value={benefitPricing.refundUsed}
                      />
                    ) : null}
                  </div>
                ) : null}

                {benefitPricing.refundUsed > 0 ? (
                  <PriceRow
                    label="Refund Wallet"
                    value={-benefitPricing.refundUsed}
                    orange
                  />
                ) : null}

                {totalWalletUsed > 0 ? (
                  <div className="mb-3 rounded-[14px] border border-dashed border-slate-200 bg-white p-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[12px] font-bold text-slate-600">
                        Total Before Wallet
                      </span>

                      <span className="text-[12px] font-extrabold text-slate-900">
                        {formatPrice(totalBeforeWallet)}
                      </span>
                    </div>
                  </div>
                ) : null}
              </>
            ) : (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-[12px] font-semibold leading-[18px] text-slate-600">
                Select cabin and passenger details to view exact fare, taxes and
                final payable amount.
              </div>
            )}

            <div className="mt-3 border-t border-dashed border-slate-300 pt-3">
              <PriceRow
                label="Final Payable"
                value={desktopFinalPayable}
                strong
              />
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

function PriceRow({
  label,
  value,
  strong = false,
  orange = false,
}: {
  label: string;
  value: number;
  strong?: boolean;
  orange?: boolean;
}) {
  const isNegative = value < 0;

  return (
    <div className="mb-3 flex items-center justify-between gap-3 last:mb-0">
      <div
        className={`${
          strong
            ? "text-[16px] font-extrabold text-slate-900"
            : orange
            ? "text-[13px] font-bold text-[#ea580c]"
            : "text-[13px] font-bold text-slate-600"
        }`}
      >
        {label}
      </div>

      <div
        className={`whitespace-nowrap ${
          strong
            ? "text-[18px] font-black text-slate-900"
            : orange
            ? "text-[13px] font-extrabold text-[#ea580c]"
            : "text-[13px] font-extrabold text-slate-900"
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

function WalletBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-slate-50 px-2 py-2">
      <div className="text-[10px] font-bold text-[#6b7280]">{label}</div>
      <div className="mt-1 text-[12px] font-black text-[#111827]">
        {formatPrice(value)}
      </div>
    </div>
  );
}
