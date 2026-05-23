"use client";

import { useEffect, useMemo, useState } from "react";
import { Sparkles, BadgeCheck, Tag } from "lucide-react";

import {
  calculateSmartOfferDiscount,
  getSmartActiveOfferItem,
  SMART_OFFERS_DATA,
  type SmartOfferItem,
} from "@/app/lib/smartOffers";

export type PackageOfferItem = {
  code: string;
  title: string;
  description: string;
  discountAmount: number;
};

type PackageOfferContext = {
  title?: string;
  country?: string;
  countries?: string[];
  continent?: string;
  route?: string | string[];
  cities?: string[];
  theme?: string[] | string;
  themes?: string[];
  subThemes?: string[];
  tags?: string[];
  isInternationalTrip?: boolean;
};

type Props = {
  appliedOfferCode: string;
  bookingValue: number;
  onApplyOffer: (offer: PackageOfferItem) => void;
  onRemoveOffer: () => void;
  packageContext?: PackageOfferContext;
};

function normalize(value?: string) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function toArray(value?: string[] | string) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === "string" && value.trim()) return [value.trim()];
  return [];
}

function smartTextMatch(source?: string, target?: string) {
  const s = normalize(source);
  const t = normalize(target);

  if (!s || !t) return false;

  return s === t || s.includes(t) || t.includes(s);
}

function hasAnyMatch(sourceList: string[], targetList?: string[]) {
  if (!Array.isArray(targetList) || targetList.length === 0) return true;

  return targetList.some((target) =>
    sourceList.some((source) => smartTextMatch(source, target))
  );
}

function isOfferValidForPackage(
  offer: SmartOfferItem,
  packageContext?: PackageOfferContext
) {
  if (!offer.active) return false;

  const serviceOk =
    offer.service === "holiday" ||
    (offer.service as string) === "package" ||
    offer.service === "all";

  if (!serviceOk) return false;

  if (offer.offerType === "membership") return false;

  const isInternational =
    typeof packageContext?.isInternationalTrip === "boolean"
      ? packageContext.isInternationalTrip
      : toArray(packageContext?.countries).some(
          (country) => normalize(country) !== "india"
        );

  if (offer.rule?.internationalOnly && !isInternational) return false;
  if (offer.rule?.domesticOnly && isInternational) return false;

  const countries = [
    packageContext?.country || "",
    ...toArray(packageContext?.countries),
  ];

  const routeValues = [
    ...toArray(packageContext?.route),
    ...toArray(packageContext?.cities),
  ];

  const themeValues = [
    ...toArray(packageContext?.theme),
    ...toArray(packageContext?.themes),
  ];

  const subThemeValues = toArray(packageContext?.subThemes);

  const tagValues = [
    packageContext?.title || "",
    packageContext?.continent || "",
    ...routeValues,
    ...themeValues,
    ...subThemeValues,
    ...toArray(packageContext?.tags),
  ];

  const searchableValues = [
    ...countries,
    packageContext?.continent || "",
    ...routeValues,
    ...themeValues,
    ...subThemeValues,
    ...tagValues,
  ].filter(Boolean);

  if (
  (offer.rule as any)?.countries?.length &&
  !hasAnyMatch(countries, (offer.rule as any).countries)
) {
    return false;
  }

  if (
  (offer.rule as any)?.continents?.length &&
  !hasAnyMatch(
    [packageContext?.continent || ""],
    (offer.rule as any).continents
  )
) {
  return false;
}

  if (
  (offer.rule as any)?.destinations?.length &&
  !hasAnyMatch(routeValues, (offer.rule as any).destinations)
) {
  return false;
}

  if (
  (offer.rule as any)?.themes?.length &&
  !hasAnyMatch(themeValues, (offer.rule as any).themes)
) {
  return false;
}

  if (
  (offer.rule as any)?.subThemes?.length &&
  !hasAnyMatch(subThemeValues, (offer.rule as any).subThemes)
) {
  return false;
}

if (
  (offer.rule as any)?.tags?.length &&
  !hasAnyMatch(searchableValues, (offer.rule as any).tags)
) {
  return false;
}

  return true;
}

export default function BookingPackageOffersSection({
  appliedOfferCode,
  bookingValue,
  onApplyOffer,
  onRemoveOffer,
  packageContext,
}: Props) {
  const [smartOffer, setSmartOffer] = useState<SmartOfferItem | null>(null);

  useEffect(() => {
    const load = () => {
      setSmartOffer(getSmartActiveOfferItem());
    };

    load();

    window.addEventListener("TPL_SMART_OFFER_UPDATED", load);
    window.addEventListener("storage", load);

    return () => {
      window.removeEventListener("TPL_SMART_OFFER_UPDATED", load);
      window.removeEventListener("storage", load);
    };
  }, []);

  const masterOffers = useMemo<PackageOfferItem[]>(() => {
    const map = new Map<string, PackageOfferItem>();

    SMART_OFFERS_DATA.filter((offer) =>
      isOfferValidForPackage(offer, packageContext)
    )
      .map((offer) => ({
        code: offer.couponCode || offer.slug,
        title: offer.title,
        description:
          offer.description ||
          offer.subtitle ||
          "Smart holiday package offer available.",
        discountAmount: calculateSmartOfferDiscount(offer, bookingValue || 25000),
      }))
      .filter((offer) => offer.code && offer.discountAmount > 0)
      .sort((a, b) => b.discountAmount - a.discountAmount)
      .forEach((offer) => {
        map.set(offer.code, offer);
      });

    return Array.from(map.values()).slice(0, 5);
  }, [bookingValue, packageContext]);

  const appliedOffer = useMemo(() => {
    return masterOffers.find((item) => item.code === appliedOfferCode) || null;
  }, [masterOffers, appliedOfferCode]);

  return (
    <div className="overflow-hidden rounded-[24px] border border-[#d9e2ec] bg-white shadow-[0_12px_34px_rgba(15,23,42,0.08)]">
      <div className="border-b border-[#e5e7eb] bg-[linear-gradient(135deg,#fff7ed_0%,#ffffff_50%,#fff1e6_100%)] px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#f97316,#ea580c)] shadow-[0_10px_24px_rgba(249,115,22,0.35)]">
            <Sparkles className="h-5 w-5 text-white" />
          </div>

          <div>
            <div className="text-[20px] font-extrabold text-[#111827]">
              Smart Coupons & Offers
            </div>

            <div className="mt-0.5 text-[12px] font-semibold text-[#6b7280]">
              AI matched holiday package savings
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-4">
        {appliedOffer ? (
          <div className="relative mb-4 overflow-hidden rounded-[18px] border border-[#fed7aa] bg-[linear-gradient(135deg,#fff7ed,#ffffff)] p-4">
            <div className="absolute right-0 top-0 h-20 w-20 rounded-full bg-[#fb923c]/10 blur-3xl" />

            <div className="relative flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1 rounded-full bg-[linear-gradient(135deg,#f97316,#ea580c)] px-3 py-1 shadow-[0_6px_18px_rgba(249,115,22,0.3)]">
                    <BadgeCheck className="h-3.5 w-3.5 text-white" />

                    <span className="text-[10px] font-black uppercase tracking-[0.15em] text-white">
                      Applied
                    </span>
                  </div>

                  <div className="rounded-full border border-[#fdba74] bg-[#fff7ed] px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-[#ea580c]">
                    {appliedOffer.code}
                  </div>
                </div>

                <div className="mt-3 text-[16px] font-black text-[#111827]">
                  {appliedOffer.title}
                </div>

                <div className="mt-1 text-[13px] font-bold text-[#ea580c]">
                  Save ₹{appliedOffer.discountAmount.toLocaleString("en-IN")}
                </div>
              </div>

              <button
                type="button"
                onClick={onRemoveOffer}
                className="h-[38px] shrink-0 rounded-full border border-[#fed7aa] bg-white px-4 text-[12px] font-black text-[#ea580c]"
              >
                Remove
              </button>
            </div>
          </div>
        ) : null}

        <div className="grid gap-3">
          {masterOffers
            .filter((offer) => offer.code !== appliedOfferCode)
            .map((offer) => {
              const isSmart =
                smartOffer?.couponCode === offer.code ||
                smartOffer?.slug === offer.code;

              return (
                <div
                  key={offer.code}
                  className="relative overflow-hidden rounded-[18px] border border-[#e5e7eb] bg-white p-4 transition-all hover:border-[#fdba74]"
                >
                  <div className="absolute right-0 top-0 h-16 w-16 rounded-full bg-[#fb923c]/5 blur-2xl" />

                  <div className="relative flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="rounded-full bg-[#111827] px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-white">
                          {offer.code}
                        </div>

                        {isSmart ? (
                          <div className="rounded-full bg-[linear-gradient(135deg,#f97316,#ea580c)] px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-white shadow-[0_4px_12px_rgba(249,115,22,0.3)]">
                            AI Smart
                          </div>
                        ) : null}
                      </div>

                      <div className="mt-3 text-[15px] font-black text-[#111827]">
                        {offer.title}
                      </div>

                      <div className="mt-2 text-[13px] leading-[20px] text-[#6b7280]">
                        {offer.description}
                      </div>

                      <div className="mt-3 flex items-center gap-2 text-[13px] font-black text-[#ea580c]">
                        <Tag className="h-4 w-4" />

                        <span>
                          Save ₹{offer.discountAmount.toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onApplyOffer(offer)}
                      className="min-w-[100px] rounded-full border border-[#fdba74] bg-white px-4 py-2 text-[12px] font-black text-[#ea580c] transition-all hover:bg-[#fff7ed]"
                    >
                      APPLY
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}