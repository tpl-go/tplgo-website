"use client";

import { useEffect, useMemo, useState } from "react";
import { Sparkles, BadgeCheck, Tag } from "lucide-react";

type PackageSelectionStateShape = {
  basePrice?: number;
  selectedFlights?: Array<{ fareDiff?: number }>;
  selectedHotels?: Array<{ fareDiff?: number }>;
  selectedTransfers?: Array<{ fareDiff?: number }>;
  selectedMeals?: Array<{ fareDiff?: number }>;
  selectedActivities?: Array<{ fareDiff?: number }>;
  flightFareDiff?: number;
  hotelFareDiff?: number;
  transferFareDiff?: number;
  mealFareDiff?: number;
  activityFareDiff?: number;
  finalPrice?: number;
};

type WalletBreakdown = {
  promoUsed: number;
  earnedUsed: number;
  refundUsed: number;
};

type FareSnapshot = {
  basePrice: number;
  upgradedDiffTotal: number;
  feesAndTaxes: number;
  couponDiscount: number;
  tplCreditUsed: number;
  grandTotal: number;
  appliedCoupon: string;
  baseAfterOffer?: number;
  promoUsed?: number;
  earnedUsed?: number;
  refundUsed?: number;
  totalBeforeWallet?: number;
};

interface BookingPriceCardProps {
  packageData?: {
    title?: string;
    days?: number;
    nights?: number;
  };
  selectedVariant?: {
    label?: string;
    pricePerPerson?: number;
    inclusions?: {
      flights?: number;
      hotels?: number;
      transfers?: number;
      activities?: number;
      meals?: number;
    };
  };
  selectedVariantKey?: string;
  totalAdults?: number;
  couponDiscount?: number;
  feesAndTaxes?: number;
  gstLabel?: string;
  couponCode?: string;
  canProceedFromTravellers?: boolean;
  onProceed?: () => void;
  onFareChange?: (fare: FareSnapshot) => void;
  packageSelectionState?: PackageSelectionStateShape | null;
  tplCreditUsed?: number;
  walletBreakdown?: WalletBreakdown;
  earnedOnThisBooking?: number;
  refundWalletAvailable?: number;
  useRefundWallet?: boolean;
  onToggleRefundWallet?: (checked: boolean) => void;
}

function sumFareDiff(items?: Array<{ fareDiff?: number }>) {
  if (!Array.isArray(items)) return 0;

  return items.reduce((sum, item) => sum + Number(item?.fareDiff || 0), 0);
}

function formatPrice(value: number) {
  return `₹${Math.abs(Math.round(value || 0)).toLocaleString("en-IN")}`;
}

export default function BookingPriceCard({
  packageData,
  selectedVariant,
  totalAdults = 2,
  couponDiscount = 0,
  feesAndTaxes = 2728,
  gstLabel = "GST 5.0%",
  couponCode = "",
  canProceedFromTravellers = false,
  onProceed,
  onFareChange,
  packageSelectionState,
  tplCreditUsed = 0,
  walletBreakdown,
  earnedOnThisBooking = 0,
  refundWalletAvailable = 0,
  useRefundWallet = true,
  onToggleRefundWallet,
}: BookingPriceCardProps) {
  const [importantChecked, setImportantChecked] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10 * 60);

  const promoUsed = Number(walletBreakdown?.promoUsed || 0);
  const earnedUsed = Number(walletBreakdown?.earnedUsed || 0);
  const refundUsed = Number(walletBreakdown?.refundUsed || 0);

  const totalTplCredit =
    promoUsed + earnedUsed + refundUsed > 0
      ? promoUsed + earnedUsed + refundUsed
      : tplCreditUsed;

  const sessionExpired = timeLeft <= 0;

  useEffect(() => {
    if (sessionExpired) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);

          if (typeof window !== "undefined") {
            window.location.reload();
          }

          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [sessionExpired]);

  const formattedTime = useMemo(() => {
    const mm = String(Math.floor(timeLeft / 60)).padStart(2, "0");
    const ss = String(timeLeft % 60).padStart(2, "0");

    return `${mm}:${ss}`;
  }, [timeLeft]);

  const basePricePerTraveller = Number(
    packageSelectionState?.basePrice || selectedVariant?.pricePerPerson || 0
  );

  const basePackageAmount = basePricePerTraveller * totalAdults;

  const flightUpgradePerTraveller = Number(
    packageSelectionState?.flightFareDiff ||
      sumFareDiff(packageSelectionState?.selectedFlights) ||
      0
  );

  const hotelUpgradePerTraveller = Number(
    packageSelectionState?.hotelFareDiff ||
      sumFareDiff(packageSelectionState?.selectedHotels) ||
      0
  );

  const transferUpgradePerTraveller = Number(
    packageSelectionState?.transferFareDiff ||
      sumFareDiff(packageSelectionState?.selectedTransfers) ||
      0
  );

  const mealUpgradePerTraveller = Number(
    packageSelectionState?.mealFareDiff ||
      sumFareDiff(packageSelectionState?.selectedMeals) ||
      0
  );

  const activityUpgradePerTraveller = Number(
    packageSelectionState?.activityFareDiff ||
      sumFareDiff(packageSelectionState?.selectedActivities) ||
      0
  );

  const upgradedDiffPerTraveller =
    flightUpgradePerTraveller +
    hotelUpgradePerTraveller +
    transferUpgradePerTraveller +
    mealUpgradePerTraveller +
    activityUpgradePerTraveller;

  const flightUpgradeTotal = flightUpgradePerTraveller * totalAdults;
  const hotelUpgradeTotal = hotelUpgradePerTraveller * totalAdults;
  const transferUpgradeTotal = transferUpgradePerTraveller * totalAdults;
  const mealUpgradeTotal = mealUpgradePerTraveller * totalAdults;
  const activityUpgradeTotal = activityUpgradePerTraveller * totalAdults;

  const upgradedDiffTotal = upgradedDiffPerTraveller * totalAdults;

  const upgradeRows = [
    {
      label: "Flight Upgrade",
      value: flightUpgradeTotal,
      detail: `${formatPrice(flightUpgradePerTraveller)} × ${totalAdults}`,
    },
    {
      label: "Hotel Upgrade",
      value: hotelUpgradeTotal,
      detail: `${formatPrice(hotelUpgradePerTraveller)} × ${totalAdults}`,
    },
    {
      label: "Transfer Upgrade",
      value: transferUpgradeTotal,
      detail: `${formatPrice(transferUpgradePerTraveller)} × ${totalAdults}`,
    },
    {
      label: "Meal Upgrade",
      value: mealUpgradeTotal,
      detail: `${formatPrice(mealUpgradePerTraveller)} × ${totalAdults}`,
    },
    {
      label: "Activity Upgrade",
      value: activityUpgradeTotal,
      detail: `${formatPrice(activityUpgradePerTraveller)} × ${totalAdults}`,
    },
  ].filter((item) => item.value > 0);

  const safeCouponDiscount = Math.min(couponDiscount, basePackageAmount);

  const baseAfterOffer = Math.max(basePackageAmount - safeCouponDiscount, 0);

  const totalBeforeWallet = baseAfterOffer + upgradedDiffTotal + feesAndTaxes;

  const finalTotal = Math.max(totalBeforeWallet - totalTplCredit, 0);

  const canProceed =
    canProceedFromTravellers && importantChecked && !sessionExpired;

  useEffect(() => {
    onFareChange?.({
      basePrice: basePackageAmount,
      upgradedDiffTotal,
      feesAndTaxes,
      couponDiscount: safeCouponDiscount,
      tplCreditUsed: totalTplCredit,
      grandTotal: finalTotal,
      appliedCoupon: safeCouponDiscount > 0 ? couponCode || "OFFER" : "",
      baseAfterOffer,
      promoUsed,
      earnedUsed,
      refundUsed,
      totalBeforeWallet,
    });
  }, [
    basePackageAmount,
    upgradedDiffTotal,
    feesAndTaxes,
    safeCouponDiscount,
    totalTplCredit,
    finalTotal,
    couponCode,
    baseAfterOffer,
    promoUsed,
    earnedUsed,
    refundUsed,
    totalBeforeWallet,
    onFareChange,
  ]);

  return (
    <aside className="w-full">
      <div className="sticky top-[96px] z-20">
        <div className="overflow-hidden rounded-[24px] border border-[#d9e2ec] bg-white shadow-[0_12px_34px_rgba(15,23,42,0.08)]">
          <div className="border-b border-[#e5e7eb] bg-white px-4 py-4">
            <div className="text-[22px] font-extrabold text-[#1f2937]">
              Fare Summary
            </div>

            {packageData?.title ? (
              <div className="mt-1 line-clamp-2 text-[12px] font-semibold leading-[18px] text-[#6b7280]">
                {packageData.title}
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

                    {couponCode ? (
                      <div className="rounded-full border border-[#fdba74] bg-[#fff7ed] px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-[#ea580c]">
                        {couponCode}
                      </div>
                    ) : null}
                  </div>

                  <div className="mt-2 text-[17px] font-black leading-tight text-[#111827]">
                    Best Package Offer Activated
                  </div>

                  <div className="mt-1 flex items-center gap-2 text-[13px] font-bold text-[#ea580c]">
                    <Tag className="h-4 w-4" />

                    <span>
                      You saved {formatPrice(safeCouponDiscount)} instantly
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          <div className="border-b border-[#eef2f7] px-4 py-4">
            <FareRow
              label="Base Package Price"
              value={basePackageAmount}
              detail={`₹${basePricePerTraveller.toLocaleString(
                "en-IN"
              )} × ${totalAdults} Traveller${totalAdults > 1 ? "s" : ""}`}
            />

            <FareRow
              label="Offer Discount"
              value={-safeCouponDiscount}
              positiveGreen
              detail="Applied only on base package value"
            />

            <FareRow
              label="Base After Offer"
              value={baseAfterOffer}
              detail="Eligible amount after offer"
            />

            <FareRow
              label="Upgrade Difference"
              value={upgradedDiffTotal}
              detail="Flight, hotel, transfer, meal or activity upgrades"
            />

            {upgradeRows.length > 0 ? (
              <div className="-mt-1 mb-4 rounded-[14px] border border-[#fed7aa] bg-[#fff7ed] p-3">
                <div className="mb-2 text-[12px] font-extrabold text-[#ea580c]">
                  Upgrade Breakup
                </div>

                {upgradeRows.map((item) => (
                  <MiniUpgradeRow
                    key={item.label}
                    label={item.label}
                    value={item.value}
                    detail={item.detail}
                  />
                ))}
              </div>
            ) : null}

            <FareRow label="Fees & Taxes" value={feesAndTaxes} detail={gstLabel} />

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
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[20px] font-extrabold text-[#111827]">
                  Total Amount
                </div>

                <div className="mt-1 text-[12px] font-semibold text-[#6b7280]">
                  Inclusive of taxes and wallet benefits
                </div>
              </div>

              <div className="whitespace-nowrap text-[30px] font-extrabold text-[#111827]">
                ₹{finalTotal.toLocaleString("en-IN")}
              </div>
            </div>
          </div>

          <div className="bg-white px-4 pt-4">
            <div className="mb-3 text-[16px] font-extrabold text-[#111827]">
              Important Information
            </div>

            <label className="flex cursor-pointer items-start gap-2.5">
              <input
                type="checkbox"
                checked={importantChecked}
                onChange={() => setImportantChecked((prev) => !prev)}
                className="mt-1"
              />

              <span className="text-[13px] font-semibold leading-[21px] text-[#4b5563]">
                I confirm that I have read and I accept Cancellation Policy, User
                Agreement, Terms of Service and Privacy Policy.
              </span>
            </label>

            {!canProceedFromTravellers ? (
              <div className="mt-3 text-[12px] font-bold leading-[18px] text-[#dc2626]">
                Please complete all traveller and contact details first.
              </div>
            ) : null}

            {sessionExpired ? (
              <div className="mt-3 text-[12px] font-bold leading-[18px] text-[#dc2626]">
                Booking session expired. Price is being refreshed.
              </div>
            ) : null}
          </div>

          <div className="bg-white px-4 py-4">
            <button
              type="button"
              disabled={!canProceed}
              onClick={() => {
                if (canProceed) onProceed?.();
              }}
              className={`h-[50px] w-full rounded-full text-[16px] font-extrabold transition ${
                canProceed
                  ? "bg-[#ef4444] text-white shadow-[0_10px_24px_rgba(239,68,68,0.25)] hover:opacity-95"
                  : "cursor-not-allowed bg-[#cfd8e3] text-white"
              }`}
            >
              Proceed to Payment
            </button>

            <div className="mt-3 text-center text-[12px] font-medium text-[#6b7280]">
              Secure booking powered by TPL
            </div>
          </div>

          <div className="border-t border-[#eef2f7] bg-white px-4 py-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[13px] font-extrabold text-[#111827]">
                  Complete Booking in
                </div>

                <div className="mt-0.5 text-[12px] font-semibold leading-[18px] text-[#6b7280]">
                  Package price will refresh after this timer.
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

function MiniUpgradeRow({
  label,
  value,
  detail,
}: {
  label: string;
  value: number;
  detail?: string;
}) {
  return (
    <div className="mt-1.5 flex items-start justify-between gap-3">
      <div>
        <span className="block text-[12px] font-bold text-[#9a3412]">
          {label}
        </span>

        {detail ? (
          <span className="mt-0.5 block text-[10px] font-semibold text-[#9a3412]/70">
            {detail}
          </span>
        ) : null}
      </div>

      <span className="whitespace-nowrap text-[12px] font-extrabold text-[#ea580c]">
        +₹{Number(value || 0).toLocaleString("en-IN")}
      </span>
    </div>
  );
}