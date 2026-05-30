"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  Gift,
  IndianRupee,
  Share2,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import type {
  CruiseInfoItem,
  CruiseResultItem,
} from "@/app/lib/cruise/cruiseResultTypes";
import { applyBenefitPricing } from "@/app/lib/pricing/applyBenefitPricing";
import {
  calculateSmartOfferDiscount,
  getSmartActiveOfferItem,
  type SmartOfferItem,
} from "@/app/lib/smartOffers";

type SailingRow = CruiseResultItem["sailingDates"][number];

type Props = {
  item: CruiseResultItem;
  onOpenInfo: (item: CruiseInfoItem) => void;
  onOpenItinerary: (row: SailingRow) => void;
};

function formatPrice(value?: number) {
  if (!value) return "₹0";
  return `₹${value.toLocaleString("en-IN")}`;
}

function buildInfoItem(
  id: string,
  label: string,
  title: string,
  description: string
): CruiseInfoItem {
  return {
    id,
    label,
    title,
    description,
  };
}

export default function CruiseOtherSailingDatesTable({
  item,
  onOpenInfo,
  onOpenItinerary,
}: Props) {
  const router = useRouter();
  const [activeOffer, setActiveOffer] = useState<SmartOfferItem | null>(() =>
    typeof window === "undefined" ? null : getSmartActiveOfferItem()
  );

  useEffect(() => {
    const refresh = () => setActiveOffer(getSmartActiveOfferItem());
    const refreshTimer = window.setTimeout(refresh, 0);

    window.addEventListener("TPL_ACTIVE_OFFER_UPDATED", refresh);
    window.addEventListener("TPL_SMART_OFFER_UPDATED", refresh);
    window.addEventListener("storage", refresh);

    return () => {
      window.clearTimeout(refreshTimer);
      window.removeEventListener("TPL_ACTIVE_OFFER_UPDATED", refresh);
      window.removeEventListener("TPL_SMART_OFFER_UPDATED", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const activeOfferService = String(
    activeOffer?.service || ""
  ).toLowerCase();

  const canApplyCruiseOffer =
    !!activeOffer &&
    (activeOfferService === "cruise" || activeOfferService === "all");

  function getOfferAppliedFare(value?: number) {
    return getOfferPricing(value).displayFare;
  }

  function getOfferPricing(value?: number) {
    const baseAmount = Number(value || 0);

    if (!baseAmount) {
      return {
        displayFare: 0,
        offerDiscount: 0,
        hasOffer: false,
      };
    }

    const rawOfferDiscount = canApplyCruiseOffer
      ? calculateSmartOfferDiscount(activeOffer, baseAmount)
      : 0;

    const pricing = applyBenefitPricing({
      baseAmount,
      offerDiscount: rawOfferDiscount,
      promoCredit: 0,
      earnedCredit: 0,
      refundWallet: 0,
    });

    return {
      displayFare: pricing.baseAfterOffer || pricing.baseAmount,
      offerDiscount: pricing.offerDiscount,
      hasOffer:
        pricing.offerDiscount > 0 &&
        pricing.baseAfterOffer < pricing.baseAmount,
    };
  }

  function getRowOfferSummary(row: SailingRow) {
    const farePricings = [
      getOfferPricing(row.inside),
      getOfferPricing(row.outside),
      getOfferPricing(row.balcony),
      getOfferPricing(row.suite),
    ];

    const bestSaving = farePricings.reduce(
      (max, pricing) => Math.max(max, pricing.offerDiscount),
      0
    );

    return {
      hasOffer: bestSaving > 0,
      offerCode: activeOffer?.couponCode || activeOffer?.slug || "",
      savedAmount: bestSaving,
    };
  }

  function handleShare(row: SailingRow) {
    const shareText = `${item.tripLabel} | ${row.date}`;

    if (navigator.share) {
      navigator.share({
        title: item.shipName,
        text: shareText,
      });
      return;
    }

    navigator.clipboard.writeText(shareText);
    alert("Sailing copied for sharing");
  }

  function handleViewDetails(row: SailingRow) {
    const payload = {
      cruiseId: item.id,
      title: item.title,
      tripLabel: item.tripLabel,
      cruiseLine: item.cruiseLine,
      shipName: item.shipName,
      departurePort: item.departurePort,
      arrivalPort: item.arrivalPort,
      durationNights: item.durationNights,
      mapImage: item.mapImage,
      taxesText: item.taxesText,
      sailingDateId: row.id,
      sailingDate: row.date,
      rates: {
        inside: row.inside,
        outside: row.outside,
        balcony: row.balcony,
        suite: row.suite,
      },
      promoItems: item.promoItems,
    };

    sessionStorage.setItem(
      "tpl_cruise_selected_sailing",
      JSON.stringify(payload)
    );

    const query = new URLSearchParams({
      sailingId: row.id,
      date: row.date,
    });

    router.push(`/cruise/detail/${item.id}?${query.toString()}`);
  }

  return (
    <>
      <div className="md:hidden">
        <div className="space-y-3">
          {item.sailingDates.map((row) => {
            const offerSummary = getRowOfferSummary(row);

            return (
              <div
                key={row.id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
              >
              <div className="border-b border-slate-100 bg-gradient-to-r from-sky-50 via-white to-orange-50 px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-[11px] font-extrabold uppercase tracking-wide text-slate-500">
                      Sailing Date
                    </div>
                    <div className="mt-1 text-[18px] font-black leading-6 text-slate-900">
                      {row.date}
                    </div>
                  </div>

                  <div className="shrink-0 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-[11px] font-extrabold text-sky-700">
                    {item.durationNights} Nights
                  </div>
                </div>

                <div className="mt-2 text-[12px] font-semibold leading-5 text-slate-500">
                  {item.shipName} • {item.departurePort} to {item.arrivalPort}
                </div>
              </div>

              <div className="px-4 py-4">
                <div className="grid grid-cols-2 gap-2">
                  <MobileFarePill
                    label="Inside"
                    value={getOfferAppliedFare(row.inside)}
                  />
                  <MobileFarePill
                    label="Outside"
                    value={getOfferAppliedFare(row.outside)}
                  />
                  <MobileFarePill
                    label="Balcony"
                    value={getOfferAppliedFare(row.balcony)}
                  />
                  <MobileFarePill
                    label="Suite"
                    value={getOfferAppliedFare(row.suite)}
                  />
                </div>

                <div className="mt-4 rounded-2xl border border-orange-100 bg-orange-50/60 px-3 py-3">
                  <div className="text-[11px] font-extrabold uppercase tracking-wide text-orange-700">
                    Offers & Benefits
                  </div>

                  {offerSummary.hasOffer ? (
                    <div className="mt-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2">
                      <div className="text-[12px] font-black text-emerald-800">
                        Offer Applied
                      </div>
                      <div className="mt-0.5 text-[11px] font-bold leading-4 text-emerald-700">
                        {offerSummary.offerCode
                          ? `${offerSummary.offerCode} • `
                          : ""}
                        Base fare discount. You saved{" "}
                        {formatPrice(offerSummary.savedAmount)}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-2 rounded-2xl border border-orange-200 bg-white px-3 py-2">
                      <div className="text-[12px] font-black text-slate-800">
                        Cruise benefits available
                      </div>
                      <div className="mt-0.5 text-[11px] font-bold leading-4 text-slate-500">
                        Tap a benefit below to view eligibility and fare terms.
                      </div>
                    </div>
                  )}

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <MobileBenefitButton
                      title="Buy One Get One Offer"
                      label="BOGO Offer"
                      onClick={() =>
                        onOpenInfo(
                          buildInfoItem(
                            `${row.id}-bogo`,
                            "Buy One Get One Offer",
                            "Buy One Get One Offer",
                            "These promotions are subject to availability and may not always be applicable to all guests on the booking. Please continue to price and book for complete eligibility and promotion details."
                          )
                        )
                      }
                      icon={<Gift size={14} />}
                    />

                    <MobileBenefitButton
                      title="Special Promotions"
                      label="Promotions"
                      onClick={() =>
                        onOpenInfo(
                          buildInfoItem(
                            `${row.id}-promo`,
                            "Special Promotions",
                            "Special Promotions",
                            "Additional cruise promotions may apply for selected sailings, cabins, and guest categories."
                          )
                        )
                      }
                      icon={<Sparkles size={14} />}
                    />

                    <MobileBenefitButton
                      title="Non Refundable Deposit"
                      label="Deposit Terms"
                      onClick={() =>
                        onOpenInfo(
                          buildInfoItem(
                            `${row.id}-nrd`,
                            "Non Refundable Deposit",
                            "Non Refundable Deposit",
                            "This sailing may be booked under a non-refundable deposit fare. Cancellation and refund rules will apply as per fare conditions."
                          )
                        )
                      }
                      icon={<ShieldAlert size={14} />}
                    />

                    <MobileBenefitButton
                      title="Onboard Credit"
                      label="Onboard Credit"
                      onClick={() =>
                        onOpenInfo(
                          buildInfoItem(
                            `${row.id}-obc`,
                            "Onboard Credit",
                            "Onboard Credit",
                            "Eligible guests may receive onboard credit that can be used during the cruise for selected purchases and experiences."
                          )
                        )
                      }
                      icon={<IndianRupee size={14} />}
                    />
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-[44px_44px_minmax(0,1fr)] gap-2">
                  <IconPillButton
                    title="Itinerary"
                    onClick={() => onOpenItinerary(row)}
                    icon={<CalendarDays size={14} />}
                  />

                  <IconPillButton
                    title="Share"
                    onClick={() => handleShare(row)}
                    icon={<Share2 size={14} />}
                  />

                  <button
                    type="button"
                    onClick={() => handleViewDetails(row)}
                    className="h-11 rounded-full bg-sky-500 px-4 text-[14px] font-extrabold text-white shadow-sm transition active:scale-[0.98]"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
            );
          })}
        </div>
      </div>

      <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white md:block">
        <div className="grid grid-cols-[120px_130px_110px_110px_110px_110px_180px_140px] border-b border-slate-200 bg-slate-100 px-4 py-3 text-[13px] font-semibold text-slate-800">
          <div></div>
          <div>DATE</div>
          <div>INSIDE</div>
          <div>OUTSIDE</div>
          <div>BALCONY</div>
          <div>SUITE</div>
          <div>BENEFITS</div>
          <div className="text-right">ACTION</div>
        </div>

        <div className="divide-y divide-slate-200">
          {item.sailingDates.map((row) => (
            <div
              key={row.id}
              className="grid grid-cols-[110px_140px_110px_110px_110px_110px_180px_140px] items-center px-4 py-4 text-[13px]"
            >
              <div className="flex items-center gap-2">
                <IconPillButton
                  title="Itinerary"
                  onClick={() => onOpenItinerary(row)}
                  icon={<CalendarDays size={14} />}
                />

                <IconPillButton
                  title="Share"
                  onClick={() => handleShare(row)}
                  icon={<Share2 size={14} />}
                />
              </div>

              <div className="whitespace-nowrap text-[14px] font-semibold text-slate-800">
                {row.date}
              </div>

              <FareCell value={getOfferAppliedFare(row.inside)} />
              <FareCell value={getOfferAppliedFare(row.outside)} />
              <FareCell value={getOfferAppliedFare(row.balcony)} />
              <FareCell value={getOfferAppliedFare(row.suite)} />

              <div className="flex items-center gap-2">
                <IconPillButton
                  title="Buy One Get One Offer"
                  onClick={() =>
                    onOpenInfo(
                      buildInfoItem(
                        `${row.id}-bogo`,
                        "Buy One Get One Offer",
                        "Buy One Get One Offer",
                        "These promotions are subject to availability and may not always be applicable to all guests on the booking. Please continue to price and book for complete eligibility and promotion details."
                      )
                    )
                  }
                  icon={<Gift size={14} />}
                />

                <IconPillButton
                  title="Special Promotions"
                  onClick={() =>
                    onOpenInfo(
                      buildInfoItem(
                        `${row.id}-promo`,
                        "Special Promotions",
                        "Special Promotions",
                        "Additional cruise promotions may apply for selected sailings, cabins, and guest categories."
                      )
                    )
                  }
                  icon={<Sparkles size={14} />}
                />

                <IconPillButton
                  title="Non Refundable Deposit"
                  onClick={() =>
                    onOpenInfo(
                      buildInfoItem(
                        `${row.id}-nrd`,
                        "Non Refundable Deposit",
                        "Non Refundable Deposit",
                        "This sailing may be booked under a non-refundable deposit fare. Cancellation and refund rules will apply as per fare conditions."
                      )
                    )
                  }
                  icon={<ShieldAlert size={14} />}
                />

                <IconPillButton
                  title="Onboard Credit"
                  onClick={() =>
                    onOpenInfo(
                      buildInfoItem(
                        `${row.id}-obc`,
                        "Onboard Credit",
                        "Onboard Credit",
                        "Eligible guests may receive onboard credit that can be used during the cruise for selected purchases and experiences."
                      )
                    )
                  }
                  icon={<IndianRupee size={14} />}
                />
              </div>

              <div className="text-right">
                <button
                  type="button"
                  onClick={() => handleViewDetails(row)}
                  className="rounded-full bg-sky-500 px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-sky-600"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function FareCell({ value }: { value?: number }) {
  return (
    <div className="text-[14px] font-semibold text-slate-800">
      {value ? `₹${value.toLocaleString("en-IN")}` : "—"}
    </div>
  );
}

function MobileFarePill({ label, value }: { label: string; value?: number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
      <div className="text-[10px] font-extrabold uppercase tracking-wide text-slate-500">
        {label}
      </div>
      <div className="mt-1 text-[14px] font-black text-slate-900">
        {value ? `₹${value.toLocaleString("en-IN")}` : "—"}
      </div>
    </div>
  );
}

function MobileBenefitButton({
  icon,
  title,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="flex min-h-[42px] items-center gap-2 rounded-2xl border border-orange-100 bg-white px-3 py-2 text-left text-[11px] font-extrabold text-slate-700 shadow-sm transition active:scale-[0.98]"
    >
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-50 text-orange-700">
        {icon}
      </span>
      <span className="min-w-0 leading-4">{label}</span>
    </button>
  );
}

function IconPillButton({
  icon,
  title,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="flex h-[34px] w-[34px] items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
    >
      {icon}
    </button>
  );
}
