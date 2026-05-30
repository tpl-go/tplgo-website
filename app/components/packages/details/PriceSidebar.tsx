"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BadgeCheck, Sparkles, Tag } from "lucide-react";

import { AUTH_UPDATED_EVENT } from "@/app/lib/booking/guestAuth";
import { getBestPackageSmartOffer } from "@/app/lib/smartOffers/getBestPackageSmartOffer";
import { applyBenefitPricing } from "@/app/lib/pricing/applyBenefitPricing";
import { getWallet } from "@/app/lib/wallet/walletStorage";

interface PriceSidebarProps {
  slug: string;
  pricePerPerson: number;
  inclusions: {
    flights?: number;
    hotels?: number;
    transfers?: number;
    activities?: number;
    meals?: number;
  };
  selectionState?: any;
  ctaText?: string;
  travelDate?: string;
  originCity?: string;
  variant?: "withFlight" | "withoutFlight";
  packageOfferInput?: {
    routeId?: string;
    id?: string;
    slug?: string;
    title?: string;
    country?: string;
    countries?: string[];
    continent?: string;
    route?: string;
    cities?: string[];
    themes?: string[];
    theme?: string[] | string;
    subThemes?: string[];
    tags?: string[];
  };
}

type ActiveUser = {
  name?: string;
  fullName?: string;
  mobile?: string;
  email?: string;
};

function getActiveUser(): ActiveUser | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem("tpl_auth_session_v1");
    return raw ? JSON.parse(raw)?.user || null : null;
  } catch {
    return null;
  }
}

function formatPrice(value: number) {
  return `₹${Math.abs(Math.round(value || 0)).toLocaleString("en-IN")}`;
}

function safeNumber(value: any) {
  const parsed = Number(value || 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

export default function PriceSidebar({
  slug,
  pricePerPerson,
  selectionState,
  ctaText = "Proceed to Booking",
  travelDate,
  originCity,
  variant = "withFlight",
  packageOfferInput,
}: PriceSidebarProps) {
  const router = useRouter();

  const [activeUser, setActiveUser] = useState<ActiveUser | null>(null);
  const [wallet, setWallet] = useState({
    promoCredit: 0,
    earnedCredit: 0,
    refundableBalance: 0,
  });

  const loadUserAndWallet = () => {
    const user = getActiveUser();
    setActiveUser(user);

    if (user?.mobile) {
      setWallet(getWallet(user.mobile));
    } else {
      setWallet({
        promoCredit: 0,
        earnedCredit: 0,
        refundableBalance: 0,
      });
    }
  };

  useEffect(() => {
    loadUserAndWallet();

    window.addEventListener(AUTH_UPDATED_EVENT, loadUserAndWallet);
    window.addEventListener("storage", loadUserAndWallet);

    return () => {
      window.removeEventListener(AUTH_UPDATED_EVENT, loadUserAndWallet);
      window.removeEventListener("storage", loadUserAndWallet);
    };
  }, []);

  const basePrice = useMemo(() => {
    return Math.round(
      safeNumber(selectionState?.basePrice || pricePerPerson || 0)
    );
  }, [selectionState, pricePerPerson]);

  const flightFareDiff = Math.round(safeNumber(selectionState?.flightFareDiff));
  const hotelFareDiff = Math.round(safeNumber(selectionState?.hotelFareDiff));
  const transferFareDiff = Math.round(
    safeNumber(selectionState?.transferFareDiff)
  );
  const mealFareDiff = Math.round(safeNumber(selectionState?.mealFareDiff));
  const activityFareDiff = Math.round(
    safeNumber(selectionState?.activityFareDiff)
  );

  const upgradedDiffTotal = Math.max(
    Math.round(
      flightFareDiff +
        hotelFareDiff +
        transferFareDiff +
        mealFareDiff +
        activityFareDiff
    ),
    0
  );

  const packageOffer = useMemo(() => {
    return getBestPackageSmartOffer(
      {
        slug,
        routeId: slug,
        ...(packageOfferInput || {}),
      },
      basePrice
    );
  }, [slug, packageOfferInput, basePrice]);

  const smartOffer = packageOffer.offer;
  const smartOfferAmount = Math.round(packageOffer.offerDiscount || 0);

  const benefitPricing = useMemo(() => {
    return applyBenefitPricing({
      baseAmount: basePrice,

      taxes: 0,
      addOns: upgradedDiffTotal,

      offerDiscount: smartOfferAmount,

      promoCredit: activeUser?.mobile ? wallet.promoCredit : 0,
      earnedCredit: activeUser?.mobile ? wallet.earnedCredit : 0,
      refundWallet: activeUser?.mobile ? wallet.refundableBalance : 0,
    });
  }, [basePrice, upgradedDiffTotal, smartOfferAmount, wallet, activeUser]);

  const tplCreditUsed = benefitPricing.promoUsed + benefitPricing.earnedUsed;

  const totalWalletUsed =
    benefitPricing.promoUsed +
    benefitPricing.earnedUsed +
    benefitPricing.refundUsed;

  const baseAfterOffer = benefitPricing.baseAfterOffer;
  const totalBeforeWallet = benefitPricing.payableBeforeRefundWallet;
  const finalPrice = benefitPricing.finalPayable;
  const earnedOnThisBooking = Math.floor(baseAfterOffer * 0.02);

  const upgradeRows = useMemo(() => {
    return [
      { label: "Flight Upgrade", amount: flightFareDiff },
      { label: "Hotel Upgrade", amount: hotelFareDiff },
      { label: "Transfer Add-on", amount: transferFareDiff },
      { label: "Meal Add-on", amount: mealFareDiff },
      { label: "Activity Add-on", amount: activityFareDiff },
    ].filter((item) => item.amount > 0);
  }, [
    flightFareDiff,
    hotelFareDiff,
    transferFareDiff,
    mealFareDiff,
    activityFareDiff,
  ]);

  const handleBooking = () => {
    const params = new URLSearchParams();

    if (variant) params.set("variant", variant);
    if (travelDate) params.set("date", travelDate);
    if (originCity) params.set("origin", originCity);

    const activeOfferCode = smartOffer?.couponCode || smartOffer?.slug || "";

    if (activeOfferCode) {
      params.set("offer", activeOfferCode);
    }

    try {
      sessionStorage.setItem(
        "tplPackageAutoOfferData",
        JSON.stringify({
          source: "package_detail_auto",
          packageSlug: slug,

          offer: smartOffer || null,
          offerCode: activeOfferCode,
          offerDiscount: benefitPricing.offerDiscount,

          basePrice,
          baseAfterOffer,
          upgradedDiffTotal,
          upgradeRows,

          promoUsed: benefitPricing.promoUsed,
          earnedUsed: benefitPricing.earnedUsed,
          refundUsed: benefitPricing.refundUsed,
          tplCreditUsed,
          totalWalletUsed,

          earnedCreditAmount: earnedOnThisBooking,

          totalBeforeWallet,
          finalPrice,

          walletBreakdown: {
            promoUsed: benefitPricing.promoUsed,
            earnedUsed: benefitPricing.earnedUsed,
            refundUsed: benefitPricing.refundUsed,
            promoAvailable: wallet.promoCredit,
            earnedAvailable: wallet.earnedCredit,
            refundWalletAvailable: wallet.refundableBalance,
            totalWalletUsed,
            tplCreditUsed,
            earnedOnThisBooking,
          },

          matchScore: packageOffer.matchScore,
          isInternational: packageOffer.isInternational,
          appliedAt: new Date().toISOString(),
        })
      );
    } catch {}

    router.push(`/packages/booking/${slug}?${params.toString()}`);
  };

  return (
    <aside className="w-full">
      <div className="relative z-20 lg:sticky lg:top-[88px]">
        <div className="overflow-hidden rounded-[20px] border border-[#d9e2ec] bg-white shadow-[0_12px_34px_rgba(15,23,42,0.08)] lg:rounded-[24px]">
          <div className="border-b border-[#e5e7eb] bg-white px-4 py-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-[18px] font-extrabold text-[#1f2937] lg:text-[22px]">
                  Fare Summary
                </div>
                <div className="mt-1 text-[12px] font-semibold text-[#6b7280]">
                  Package price rule applied
                </div>
              </div>

              <span
                className={`max-w-[92px] truncate rounded-full border px-2.5 py-1 text-[10px] font-black ${
                  variant === "withFlight"
                    ? "border-orange-200 bg-orange-50 text-orange-800"
                    : "border-slate-200 bg-slate-50 text-slate-700"
                }`}
                title={variant === "withFlight" ? "With Flight" : "Without Flight"}
              >
                {variant === "withFlight" ? "Flight" : "No Flight"}
              </span>
            </div>
          </div>

          {benefitPricing.offerDiscount > 0 && smartOffer ? (
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

                    <div className="rounded-full border border-[#fdba74] bg-[#fff7ed] px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-[#ea580c]">
                      {smartOffer.couponCode || smartOffer.slug}
                    </div>
                  </div>

                  <div className="mt-2 text-[15px] font-black leading-tight text-[#111827] lg:text-[17px]">
                    {smartOffer.title || "Best Package Offer Activated"}
                  </div>

                  <div className="mt-1 flex items-center gap-2 text-[13px] font-bold text-[#ea580c]">
                    <Tag className="h-4 w-4" />
                    <span>
                      You saved {formatPrice(benefitPricing.offerDiscount)} on
                      base package
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

<div className="px-4 pt-4">
  <div className="flex flex-wrap gap-2">
    {travelDate ? (
      <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-[11px] font-bold text-blue-800">
        <span>📅</span>
        <span>
          {new Date(travelDate).toLocaleDateString("en-GB", {
            weekday: "short",
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </span>
      </span>
    ) : null}

    {variant === "withFlight" && originCity ? (
      <span className="inline-flex items-center gap-1 rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-[11px] font-bold text-orange-800">
        <span>🛫</span>
        <span>{originCity}</span>
      </span>
    ) : null}
  </div>
</div>

          <div className="border-b border-[#eef2f7] px-4 py-4">
            <FareRow label="Base Package" value={basePrice} />

            {benefitPricing.offerDiscount > 0 ? (
              <FareRow
                label={
                  smartOffer?.couponCode
                    ? `Package Offer (${smartOffer.couponCode})`
                    : "Package Offer"
                }
                value={-benefitPricing.offerDiscount}
                positiveGreen
              />
            ) : null}

            <FareRow label="Base After Offer" value={baseAfterOffer} />

            {upgradeRows.length > 0 ? (
              <>
                {upgradeRows.map((row) => (
                  <FareRow
                    key={row.label}
                    label={row.label}
                    value={row.amount}
                  />
                ))}

                
              </>
            ) : null}

            {tplCreditUsed > 0 ? (
              <FareRow label="TPL Credit" value={-tplCreditUsed} positiveGreen />
            ) : (
              <FareRow label="TPL Credit" value={0} />
            )}

            {(benefitPricing.promoUsed > 0 ||
              benefitPricing.earnedUsed > 0 ||
              benefitPricing.refundUsed > 0) && (
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
            )}

            {benefitPricing.refundUsed > 0 ? (
              <FareRow
                label="Refund Wallet"
                value={-benefitPricing.refundUsed}
                positiveGreen
              />
            ) : null}

            <div className="mt-1 rounded-[14px] border border-[#fed7aa] bg-[linear-gradient(135deg,#fff7ed,#ffffff)] p-3 text-[12px] font-extrabold leading-[18px] text-[#ea580c]">
              🎉 You will earn {formatPrice(earnedOnThisBooking)} TPL Earned
              Credit after this booking.
            </div>

            <div className="mt-3 rounded-[14px] border border-dashed border-[#d9e2ec] bg-white p-3 text-[11px] font-semibold leading-[17px] text-[#6b7280]">
              Offer, Promo Credit and Earned Credit apply only on base package
              amount. Refund Wallet can apply on full payable.
            </div>
          </div>

          <div className="border-b border-[#e5e7eb] bg-white px-4 py-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-[18px] font-extrabold text-[#111827] lg:text-[20px]">
                  Total Amount
                </div>
                <div className="mt-1 text-[11px] font-semibold text-[#6b7280]">
                  Taxes revalidated on booking step
                </div>
              </div>

              <div className="whitespace-nowrap text-[26px] font-extrabold text-[#111827] lg:text-[30px]">
                ₹{finalPrice.toLocaleString("en-IN")}
              </div>
            </div>
          </div>

          <div className="bg-white px-4 py-4">
            <button
              type="button"
              onClick={handleBooking}
              className="h-[50px] w-full rounded-full bg-[#ef4444] text-[16px] font-extrabold text-white shadow-[0_10px_24px_rgba(239,68,68,0.25)] transition hover:opacity-95"
            >
              {ctaText}
            </button>

            <div className="mt-3 text-center text-[12px] font-medium text-[#6b7280]">
              Secure booking powered by TPL
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
