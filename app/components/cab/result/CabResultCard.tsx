"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type {
  CabResultItem,
  CabResultSearchMeta,
} from "@/app/lib/cab/cabResultTypes";

type Props = {
  item: CabResultItem;
  searchMeta: CabResultSearchMeta;
};

type CabOfferSnapshot = {
  offerApplied: boolean;
  offerCode: string;
  offerTitle: string;
  offerAmount: number;
  baseFare: number;
  baseAfterOffer: number;
  nonBenefitTotal: number;
  totalBeforeWallet: number;
  finalPayable: number;
  pricingRule: "CAB_BASE_ONLY_BENEFIT_V1";
};

function formatVehicleType(type?: string) {
  if (!type) return "";
  if (type === "compactsuv") return "Compact SUV";
  return type.charAt(0).toUpperCase() + type.slice(1);
}

function formatFuelType(type?: string) {
  if (!type) return "NA";
  return type.toUpperCase();
}

function toNumber(value: unknown) {
  const n = Number(value || 0);
  return Number.isFinite(n) ? n : 0;
}

function clampAmount(value: number, min: number, max: number) {
  return Math.max(min, Math.min(value, max));
}

function getCabBaseFare(item: any) {
  return (
    toNumber(item?.trueBaseFare) ||
    toNumber(item?.cabBaseFare) ||
    toNumber(item?.baseFare) ||
    toNumber(item?.fare) ||
    toNumber(item?.price) ||
    toNumber(item?.estimatedFare) ||
    toNumber(item?.finalPrice) ||
    toNumber(item?.basePrice) ||
    0
  );
}

function getCabNonBenefitTotal(item: any) {
  return (
    toNumber(item?.taxes) +
    toNumber(item?.taxAmount) +
    toNumber(item?.gst) +
    toNumber(item?.charges) +
    toNumber(item?.serviceCharge) +
    toNumber(item?.convenienceFee) +
    toNumber(item?.tollParking) +
    toNumber(item?.tollParkingCharges) +
    toNumber(item?.tollCharges) +
    toNumber(item?.parkingCharges) +
    toNumber(item?.driverAllowance) +
    toNumber(item?.nightAllowance) +
    toNumber(item?.addonTotal) +
    toNumber(item?.addOnsTotal) +
    toNumber(item?.insuranceAmount) +
    toNumber(item?.extraKmCharge) +
    toNumber(item?.extraHourCharge)
  );
}

function readJsonFromSession<T>(key: string): T | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.sessionStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function getActiveCabOffer() {
  const specialPayload = readJsonFromSession<any>("tplActiveOfferPayload");
  const specialActivation = readJsonFromSession<any>("tplActiveOfferActivation");
  const smartPayload = readJsonFromSession<any>("tpl_smart_active_offer_v1");

  const offer =
    specialPayload ||
    smartPayload?.offer ||
    specialActivation ||
    null;

  if (!offer) return null;

  const service = String(
    offer?.service ||
      specialPayload?.service ||
      specialActivation?.service ||
      smartPayload?.offer?.service ||
      ""
  ).toLowerCase();

  if (service && service !== "cab" && service !== "cabs" && service !== "all") {
    return null;
  }

  const discountAmount =
    toNumber(specialPayload?.discountAmount) ||
    toNumber(offer?.discountAmount) ||
    toNumber(specialActivation?.discountAmount) ||
    0;

  return {
    ...offer,
    sessionDiscountAmount: discountAmount,
  };
}

function calculateCabOfferAmount(baseFare: number, offer: any) {
  if (!offer || baseFare <= 0) return 0;

  const sessionDiscountAmount = toNumber(offer?.sessionDiscountAmount);
  if (sessionDiscountAmount > 0) {
    return clampAmount(Math.round(sessionDiscountAmount), 0, baseFare);
  }

  const minBookingValue = toNumber(offer?.minBookingValue);
  if (minBookingValue > 0 && baseFare < minBookingValue) return 0;

  const flatDiscount =
    toNumber(offer?.discountAmount) ||
    toNumber(offer?.flatDiscount) ||
    toNumber(offer?.amount) ||
    toNumber(offer?.offerAmount);

  if (flatDiscount > 0) {
    return clampAmount(Math.round(flatDiscount), 0, baseFare);
  }

  const percentDiscount =
    toNumber(offer?.discountPercent) ||
    toNumber(offer?.percent) ||
    toNumber(offer?.discountPercentage);

  const maxDiscount =
    toNumber(offer?.maxDiscount) ||
    toNumber(offer?.maxDiscountAmount) ||
    toNumber(offer?.capAmount) ||
    baseFare;

  if (percentDiscount > 0) {
    const calculated = Math.round((baseFare * percentDiscount) / 100);
    return clampAmount(calculated, 0, Math.min(baseFare, maxDiscount));
  }

  return 0;
}

function buildCabPricingSnapshot(item: any): CabOfferSnapshot {
  const baseFare = getCabBaseFare(item);
  const nonBenefitTotal = getCabNonBenefitTotal(item);
  const offer = getActiveCabOffer();
  const offerAmount = calculateCabOfferAmount(baseFare, offer);
  const baseAfterOffer = Math.max(0, baseFare - offerAmount);
  const totalBeforeWallet = baseAfterOffer + nonBenefitTotal;

  return {
    offerApplied: offerAmount > 0,
    offerCode: String(offer?.couponCode || offer?.code || offer?.offerCode || offer?.slug || ""),
    offerTitle: String(offer?.title || offer?.offerTitle || "Offer Applied"),
    offerAmount,
    baseFare,
    baseAfterOffer,
    nonBenefitTotal,
    totalBeforeWallet,
    finalPayable: totalBeforeWallet,
    pricingRule: "CAB_BASE_ONLY_BENEFIT_V1",
  };
}

export default function CabResultCard({ item, searchMeta }: Props) {
  const router = useRouter();
  const isBike = item.rideType === "bikeRental";
  const [offerRefreshKey, setOfferRefreshKey] = useState(0);

  useEffect(() => {
    const refresh = () => setOfferRefreshKey((prev) => prev + 1);

    window.addEventListener("TPL_ACTIVE_OFFER_UPDATED", refresh);
    window.addEventListener("TPL_SMART_OFFER_UPDATED", refresh);

    const timer = window.setTimeout(refresh, 80);

    return () => {
      window.removeEventListener("TPL_ACTIVE_OFFER_UPDATED", refresh);
      window.removeEventListener("TPL_SMART_OFFER_UPDATED", refresh);
      window.clearTimeout(timer);
    };
  }, []);

  const pricingSnapshot = useMemo(
    () => buildCabPricingSnapshot(item),
    [item, offerRefreshKey]
  );

  const displayBaseFare = pricingSnapshot.baseFare;
  const displayFinalPrice = pricingSnapshot.offerApplied
    ? pricingSnapshot.finalPayable
    : toNumber((item as any)?.finalPrice) || pricingSnapshot.finalPayable;

  function handleSelect() {
    const params = new URLSearchParams();

    params.set("id", item.id);
    params.set("rideType", searchMeta.rideType);

    if (searchMeta.from) params.set("from", searchMeta.from);
    if (searchMeta.to) params.set("to", searchMeta.to);
    if (searchMeta.pickup) params.set("pickup", searchMeta.pickup);
    if (searchMeta.drop) params.set("drop", searchMeta.drop);
    if (searchMeta.departureDate) params.set("departureDate", searchMeta.departureDate);
    if (searchMeta.returnDate) params.set("returnDate", searchMeta.returnDate);
    if (searchMeta.pickupDate) params.set("pickupDate", searchMeta.pickupDate);
    if (searchMeta.pickupTime) params.set("pickupTime", searchMeta.pickupTime);
    if (searchMeta.dropTime) params.set("dropTime", searchMeta.dropTime);
    if (searchMeta.rentalPackage) params.set("rentalPackage", searchMeta.rentalPackage);
    if (searchMeta.rentalVehicleType) params.set("rentalVehicleType", searchMeta.rentalVehicleType);

    if (searchMeta.stops && searchMeta.stops.length > 0) {
      params.set("stops", searchMeta.stops.join(","));
    }

    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(
        "tplCabSelectedPricingSnapshot",
        JSON.stringify({
          cabId: item.id,
          item,
          searchMeta,
          pricingSnapshot,
        })
      );
    }

    router.push(`/cab/booking?${params.toString()}`);
  }

  return (
    <div className="rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[140px_minmax(0,1fr)_220px]">
        <div className="flex justify-center lg:justify-start">
          <div className="w-[118px] rounded-[18px] bg-[#eef8ff] p-3">
            <div className="flex h-[74px] items-center justify-center rounded-[14px] bg-[#dff3ff]">
              {item.image ? (
                <Image
                  src={item.image}
                  alt={item.name}
                  width={96}
                  height={56}
                  className="h-[56px] w-auto object-contain"
                />
              ) : (
                <div className="text-[12px] font-bold text-slate-500">IMG</div>
              )}
            </div>

            <div className="mt-3 rounded-full bg-sky-500 px-3 py-1 text-center text-[11px] font-bold text-white">
              {formatFuelType(item.fuelType)}
            </div>
          </div>
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-[16px] font-extrabold leading-5 text-slate-900">
              {item.name}
            </h3>

            <span className="rounded-md bg-sky-600 px-2 py-[2px] text-[11px] font-bold text-white">
              {item.rating.toFixed(1)}/5
            </span>
          </div>

          <div className="text-[12px] text-slate-500">
            {item.brand} • {item.reviewCount} reviews
          </div>

          <div className="mt-2 text-[14px] text-slate-800">
            {isBike ? (
              <>
                {formatVehicleType(item.vehicleType)} • {item.engineCc || 0}cc
                {" • "}
                {item.helmetIncluded ? "Helmet Included" : "Helmet Extra"}
              </>
            ) : (
              <>
                {formatVehicleType(item.vehicleType)} •{" "}
                {item.transmission
                  ? item.transmission.charAt(0).toUpperCase() +
                    item.transmission.slice(1)
                  : "Manual"}
                {item.seats ? ` • ${item.seats} Seats` : ""}
                {typeof item.luggage === "number" ? ` • ${item.luggage} Bags` : ""}
              </>
            )}
          </div>

          {item.packageLabel ? (
            <div className="mt-2 text-[13px] font-semibold text-sky-700">
              Package: {item.packageLabel}
            </div>
          ) : null}

          <div className="mt-3 flex flex-wrap gap-2">
            {item.pickupIncluded ? (
              <span className="rounded-full bg-sky-50 px-3 py-1 text-[11px] font-bold text-sky-700">
                Pickup Included
              </span>
            ) : null}

            {item.freeCancellation ? (
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-700">
                Free Cancellation
              </span>
            ) : null}

            {item.instantConfirm ? (
              <span className="rounded-full bg-violet-50 px-3 py-1 text-[11px] font-bold text-violet-700">
                Instant Confirm
              </span>
            ) : null}

            {pricingSnapshot.offerApplied ? (
              <span className="rounded-full bg-orange-50 px-3 py-1 text-[11px] font-bold text-orange-700">
                Offer Applied ₹{pricingSnapshot.offerAmount.toLocaleString("en-IN")}
              </span>
            ) : null}

            {item.tags?.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-amber-50 px-3 py-1 text-[11px] font-bold text-amber-700"
              >
                {tag}
              </span>
            ))}
          </div>

          {!isBike && item.extraKmFare ? (
            <div className="mt-4 border-t border-sky-100 pt-3 text-[12px] text-slate-600">
              ✨ Extra km fare ₹{item.extraKmFare}
              {item.kmsIncluded ? ` • ${item.kmsIncluded} kms included` : ""}
            </div>
          ) : null}
        </div>

        <div className="flex flex-col items-end">
          <div className="text-right">
            <div className="text-[13px] font-bold text-sky-700">
              {pricingSnapshot.offerApplied
                ? `₹${pricingSnapshot.offerAmount.toLocaleString("en-IN")} off`
                : "Best fare"}

              {pricingSnapshot.offerApplied ? (
                <span className="ml-2 text-slate-400 line-through">
                  ₹{displayBaseFare.toLocaleString("en-IN")}
                </span>
              ) : null}
            </div>

            <div className="mt-1 text-[30px] font-extrabold leading-none text-slate-900">
              ₹{displayFinalPrice.toLocaleString("en-IN")}
            </div>

            <div className="mt-1 text-[12px] text-slate-500">
              + Taxes & Charges
            </div>

            {pricingSnapshot.offerApplied ? (
              <div className="mt-1 text-[11px] font-semibold text-emerald-700">
                Offer on base fare only
              </div>
            ) : null}
          </div>

          <button
            type="button"
            onClick={handleSelect}
            className="mt-4 h-[44px] min-w-[170px] rounded-xl bg-sky-500 px-5 text-[13px] font-extrabold text-white transition hover:bg-sky-600"
          >
            {isBike ? "SELECT BIKE" : "SELECT CAB"}
          </button>
        </div>
      </div>
    </div>
  );
}