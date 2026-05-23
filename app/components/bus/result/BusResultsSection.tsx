"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { BusResultItem } from "@/app/lib/bus/busTypes";
import { applyBenefitPricing } from "@/app/lib/pricing/applyBenefitPricing";

import GovernmentBusGroupCard from "./GovernmentBusGroupCard";
import PrivateBusResultsList from "./PrivateBusResultsList";
import BusViewDetailsModal from "./BusViewDetailsModal";
import BusSeatSelectionModal from "./BusSeatSelectionModal";

type Props = {
  results: BusResultItem[];
};

const SMART_ACTIVE_OFFER_KEY = "tpl_smart_active_offer_v1";
const SMART_OFFER_SOURCE_KEY = "tpl_smart_offer_source_v1";
const SPECIAL_ACTIVE_OFFER_PAYLOAD_KEY = "tplActiveOfferPayload";

function readActiveBusOffer() {
  if (typeof window === "undefined") return null;

  try {
    const specialRaw = sessionStorage.getItem(SPECIAL_ACTIVE_OFFER_PAYLOAD_KEY);

    if (specialRaw) {
      const special = JSON.parse(specialRaw);
      const service = String(special?.service || "").toLowerCase();

      if (!service || service === "bus" || service === "all") {
        return special;
      }
    }

    const smartRaw = sessionStorage.getItem(SMART_ACTIVE_OFFER_KEY);

    if (!smartRaw) return null;

    const smart = JSON.parse(smartRaw);
    const offer = smart?.offer || smart;

    const service = String(offer?.service || "").toLowerCase();

    if (service && service !== "bus" && service !== "all") return null;

    return {
      ...offer,
      source: smart?.source || offer?.source || "ai_auto",
      activatedAt: smart?.activatedAt || offer?.activatedAt,
    };
  } catch {
    return null;
  }
}

function resolveBusBaseFare(bus: any) {
  return Number(
    bus?.baseFare ||
      bus?.fare ||
      bus?.lowestFare ||
      bus?.finalFare ||
      bus?.price ||
      bus?.originalPrice ||
      0
  );
}

function getOfferCode(offer: any) {
  return (
    offer?.couponCode ||
    offer?.code ||
    offer?.offerCode ||
    offer?.offer?.couponCode ||
    offer?.offer?.code ||
    ""
  );
}

function getOfferTitle(offer: any) {
  return (
    offer?.title ||
    offer?.offerTitle ||
    offer?.offer?.title ||
    "Offer Applied"
  );
}

function getOfferDiscountAmount(offer: any, baseAmount: number) {
  if (!offer || baseAmount <= 0) return 0;

  const minBookingValue = Number(
    offer?.rule?.minBookingValue ||
      offer?.minBookingValue ||
      offer?.offer?.rule?.minBookingValue ||
      offer?.offer?.minBookingValue ||
      0
  );

  if (minBookingValue > 0 && baseAmount < minBookingValue) {
    return 0;
  }

  const discountMode = String(
    offer?.discountMode || offer?.offer?.discountMode || ""
  ).toLowerCase();

  const discountValue = Number(
    offer?.discountValue || offer?.offer?.discountValue || 0
  );

  const maxDiscount = Number(
    offer?.maxDiscount ||
      offer?.offer?.maxDiscount ||
      discountValue ||
      0
  );

  let discount = 0;

  if (discountMode === "percent") {
    discount = Math.round((baseAmount * discountValue) / 100);
  } else {
    discount = Math.round(discountValue);
  }

  if (maxDiscount > 0) {
    discount = Math.min(discount, maxDiscount);
  }

  return Math.min(Math.max(discount, 0), baseAmount);
}

export default function BusResultsSection({ results }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedBusForDetails, setSelectedBusForDetails] =
    useState<BusResultItem | null>(null);

  const [selectedBusForSeats, setSelectedBusForSeats] =
    useState<BusResultItem | null>(null);

  const governmentKeywords = [
    "upsrtc",
    "rsrtc",
    "gsrtc",
    "msrtc",
    "hrtc",
    "government",
    "state roadways",
  ];

  const governmentBuses = useMemo(() => {
    return results.filter((bus) =>
      governmentKeywords.some((keyword) =>
        bus.operatorName.toLowerCase().includes(keyword)
      )
    );
  }, [results]);

  const privateBuses = useMemo(() => {
    return results.filter(
      (bus) =>
        !governmentKeywords.some((keyword) =>
          bus.operatorName.toLowerCase().includes(keyword)
        )
    );
  }, [results]);

  function handleSeatFlowConfirm(payload: {
    bus: BusResultItem;
    selectedSeats: { seatNumber: string; price: number }[];
    boardingPoint: any;
    droppingPoint: any;
    totalFare: number;
    travellerCount: number;
  }) {
    const routeQuery = {
      fromCity: searchParams.get("fromCity") || payload.bus.fromCity,
      fromPoint: searchParams.get("fromPoint") || "",
      toCity: searchParams.get("toCity") || payload.bus.toCity,
      toPoint: searchParams.get("toPoint") || "",
      date: searchParams.get("date") || payload.bus.departureDate,
    };

    const activeOffer = readActiveBusOffer();

    const baseFare = resolveBusBaseFare(payload.bus);

    const selectedSeatTotal = payload.selectedSeats.reduce(
      (sum, seat) => sum + Number(seat.price || 0),
      0
    );

    const resolvedTotalFare = Number(
      payload.totalFare || selectedSeatTotal || baseFare
    );

    const seatExtraAmount = Math.max(resolvedTotalFare - baseFare, 0);

    const offerDiscount = getOfferDiscountAmount(activeOffer, baseFare);

    const pricing = applyBenefitPricing({
      baseAmount: baseFare,
      offerDiscount,
      seatCharges: seatExtraAmount,
    });

    const offerData = activeOffer
      ? {
          ...activeOffer,
          service: "bus",
          couponCode: getOfferCode(activeOffer),
          code: getOfferCode(activeOffer),
          title: getOfferTitle(activeOffer),
          appliedOfferAmount: pricing.offerDiscount,
          discountAmount: pricing.offerDiscount,
          baseAmount: pricing.baseAmount,
          baseAfterOffer: pricing.baseAfterOffer,
          finalPayable: pricing.finalPayable,
        }
      : null;

    const bookingPayload = {
      search: routeQuery,

      bus: {
        ...payload.bus,
        baseFare: pricing.baseAmount,
        price: pricing.baseAfterOffer,
        originalPrice:
          pricing.offerDiscount > 0
            ? pricing.baseAmount
            : (payload.bus as any)?.originalPrice,
      },

      selectedSeats: payload.selectedSeats,
      selectedBoardingPoint: payload.boardingPoint,
      selectedDroppingPoint: payload.droppingPoint,

      totalFare: pricing.finalPayable,
      travellerCount: payload.travellerCount,

      baseAmount: pricing.baseAmount,
      baseFare: pricing.baseAmount,

      seatCharges: pricing.seatCharges,
      seatExtraAmount,

      offerData,
      appliedOfferAmount: pricing.offerDiscount,
      appliedOfferCode: offerData?.couponCode || "",
      appliedOfferTitle: offerData?.title || "",

      baseAfterOffer: pricing.baseAfterOffer,
      totalBeforeWallet: pricing.finalPayable,
      grossAmount: pricing.grossAmount,
      nonBenefitAmount: pricing.nonBenefitAmount,

      walletCalc: {
        promoUsed: 0,
        earnedUsed: 0,
        refundUsed: 0,
      },

      pricing,
      earnedOnThisBooking: Math.floor(pricing.baseAfterOffer * 0.02),
    };

    if (typeof window !== "undefined") {
      try {
        if (offerData) {
          sessionStorage.setItem(
            SMART_ACTIVE_OFFER_KEY,
            JSON.stringify(offerData)
          );

          sessionStorage.setItem(
            SPECIAL_ACTIVE_OFFER_PAYLOAD_KEY,
            JSON.stringify(offerData)
          );

          sessionStorage.setItem(
            SMART_OFFER_SOURCE_KEY,
            JSON.stringify({
              service: "bus",
              source: "results-seat-confirm",
              selectedAt: new Date().toISOString(),
              baseAmount: pricing.baseAmount,
              offerDiscount: pricing.offerDiscount,
              baseAfterOffer: pricing.baseAfterOffer,
              seatCharges: pricing.seatCharges,
              finalPayable: pricing.finalPayable,
              operatorName: payload.bus.operatorName,
            })
          );

          window.dispatchEvent(new CustomEvent("TPL_ACTIVE_OFFER_UPDATED"));
          window.dispatchEvent(new CustomEvent("TPL_SMART_OFFER_UPDATED"));
        }

        sessionStorage.setItem(
          "tplBusBookingData",
          JSON.stringify(bookingPayload)
        );
      } catch {}
    }

    setSelectedBusForSeats(null);
    router.push("/bus/booking");
  }

  return (
    <>
      <div className="space-y-4">
        {governmentBuses.length > 0 && (
          <GovernmentBusGroupCard
            buses={governmentBuses}
            onViewDetails={(bus) => setSelectedBusForDetails(bus)}
            onSelectSeats={(bus) => setSelectedBusForSeats(bus)}
          />
        )}

        <PrivateBusResultsList
          buses={privateBuses}
          onViewDetails={(bus) => setSelectedBusForDetails(bus)}
          onSelectSeats={(bus) => setSelectedBusForSeats(bus)}
        />
      </div>

      <BusViewDetailsModal
        bus={selectedBusForDetails}
        open={!!selectedBusForDetails}
        onClose={() => setSelectedBusForDetails(null)}
      />

      <BusSeatSelectionModal
        bus={selectedBusForSeats}
        open={!!selectedBusForSeats}
        onClose={() => setSelectedBusForSeats(null)}
        onConfirm={handleSeatFlowConfirm}
      />
    </>
  );
}