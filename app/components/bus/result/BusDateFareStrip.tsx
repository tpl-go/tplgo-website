"use client";

import { useEffect, useMemo, useState } from "react";
import {
  addDays,
  differenceInCalendarDays,
  format,
  isSameDay,
  startOfDay,
} from "date-fns";
import { searchBuses } from "@/app/lib/bus/busSearchHelpers";
import type { BusResultItem } from "@/app/lib/bus/busTypes";
import { applyBenefitPricing } from "@/app/lib/pricing/applyBenefitPricing";

type BusDateFareStripProps = {
  selectedDate?: Date;
  fromCity: string;
  fromPoint?: string;
  toCity: string;
  toPoint?: string;
  visibleResults?: BusResultItem[];
  focusedBusId?: string | null;
  onFocusBus?: (busId: string) => void;
};

type FareItem = {
  date: Date;
  price: number | null;
  busId?: string;
};

const VISIBLE_DAYS = 8;
const MAX_DAYS = 365;
const SMART_ACTIVE_OFFER_KEY = "tpl_smart_active_offer_v1";
const SPECIAL_ACTIVE_OFFER_PAYLOAD_KEY = "tplActiveOfferPayload";

function formatDateForQuery(date: Date) {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .split("T")[0];
}

function resolveBusBaseFare(bus: any) {
  return Number(
    bus?.baseFare ||
      bus?.fare ||
      bus?.lowestFare ||
      bus?.finalFare ||
      bus?.price ||
      0
  );
}

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

    return offer;
  } catch {
    return null;
  }
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

  if (minBookingValue > 0 && baseAmount < minBookingValue) return 0;

  const discountMode = String(
    offer?.discountMode || offer?.offer?.discountMode || ""
  ).toLowerCase();

  const discountValue = Number(
    offer?.discountValue || offer?.offer?.discountValue || 0
  );

  const maxDiscount = Number(
    offer?.maxDiscount || offer?.offer?.maxDiscount || discountValue || 0
  );

  let discount = 0;

  if (discountMode === "percent") {
    discount = Math.round((baseAmount * discountValue) / 100);
  } else {
    discount = Math.round(discountValue);
  }

  if (maxDiscount > 0) discount = Math.min(discount, maxDiscount);

  return Math.min(Math.max(discount, 0), baseAmount);
}

function getVisibleCardFare(bus: any, activeOffer: any) {
  const baseFare = resolveBusBaseFare(bus);
  const offerDiscount = getOfferDiscountAmount(activeOffer, baseFare);

  if (activeOffer && offerDiscount > 0 && baseFare > 0) {
    return applyBenefitPricing({
      baseAmount: baseFare,
      offerDiscount,
    }).baseAfterOffer;
  }

  return Number(bus?.price || 0);
}

function resolveLowestFareBus(buses: BusResultItem[], activeOffer: any) {
  return buses.reduce<{
    busId: string;
    price: number;
  } | null>((lowest, bus) => {
    const price = getVisibleCardFare(bus, activeOffer);

    if (price <= 0) return lowest;
    if (!lowest || price < lowest.price) {
      return {
        busId: bus.id,
        price,
      };
    }

    return lowest;
  }, null);
}

export default function BusDateFareStrip({
  selectedDate,
  fromCity,
  fromPoint,
  toCity,
  toPoint,
  visibleResults = [],
  focusedBusId,
  onFocusBus,
}: BusDateFareStripProps) {
  const today = useMemo(() => startOfDay(new Date()), []);
  const [activeOffer, setActiveOffer] = useState<any>(() => readActiveBusOffer());

  const initialSelectedDate = selectedDate ? startOfDay(selectedDate) : today;

  const [activeDate, setActiveDate] = useState<Date>(initialSelectedDate);

  const [windowStartDate, setWindowStartDate] = useState<Date>(() => {
    const safeSelected = selectedDate ? startOfDay(selectedDate) : today;
    const diffFromToday = differenceInCalendarDays(safeSelected, today);

    if (diffFromToday <= 0) return today;
    if (diffFromToday >= MAX_DAYS - VISIBLE_DAYS) {
      return addDays(today, MAX_DAYS - VISIBLE_DAYS);
    }

    return safeSelected;
  });

  useEffect(() => {
    if (!selectedDate) return;

    const normalized = startOfDay(selectedDate);
    setActiveDate(normalized);

    const diffFromToday = differenceInCalendarDays(normalized, today);

    if (diffFromToday <= 0) {
      setWindowStartDate(today);
      return;
    }

    if (diffFromToday >= MAX_DAYS - VISIBLE_DAYS) {
      setWindowStartDate(addDays(today, MAX_DAYS - VISIBLE_DAYS));
      return;
    }

    setWindowStartDate(normalized);
  }, [selectedDate, today]);

  useEffect(() => {
    const syncOffer = () => {
      setActiveOffer(readActiveBusOffer());
    };

    window.addEventListener("TPL_ACTIVE_OFFER_UPDATED", syncOffer);
    window.addEventListener("TPL_SMART_OFFER_UPDATED", syncOffer);
    window.addEventListener("storage", syncOffer);

    return () => {
      window.removeEventListener("TPL_ACTIVE_OFFER_UPDATED", syncOffer);
      window.removeEventListener("TPL_SMART_OFFER_UPDATED", syncOffer);
      window.removeEventListener("storage", syncOffer);
    };
  }, []);

  const visibleDates = useMemo(() => {
    return Array.from({ length: VISIBLE_DAYS }, (_, index) =>
      addDays(windowStartDate, index)
    );
  }, [windowStartDate]);

  const fareData: FareItem[] = useMemo(() => {
    return visibleDates.map((date) => {
      const isSelectedDate = selectedDate
        ? isSameDay(date, startOfDay(selectedDate))
        : false;
      const buses = isSelectedDate
        ? visibleResults
        : searchBuses({
        fromCity,
        fromPoint: fromPoint || "All Boarding Points",
        toCity,
        toPoint: toPoint || "All Drop Points",
        date: formatDateForQuery(date),
      });

      const lowest = resolveLowestFareBus(buses, activeOffer);

      return {
        date,
        price: lowest?.price || null,
        busId: isSelectedDate ? lowest?.busId : undefined,
      };
    });
  }, [
    visibleDates,
    fromCity,
    fromPoint,
    toCity,
    toPoint,
    visibleResults,
    selectedDate,
    activeOffer,
  ]);

  const canGoLeft = differenceInCalendarDays(windowStartDate, today) > 0;
  const canGoRight =
    differenceInCalendarDays(windowStartDate, today) < MAX_DAYS - VISIBLE_DAYS;

  const handlePrev = () => {
    if (!canGoLeft) return;
    setWindowStartDate((prev) => addDays(prev, -1));
  };

  const handleNext = () => {
    if (!canGoRight) return;
    setWindowStartDate((prev) => addDays(prev, 1));
  };

  const handleSelectDate = (date: Date) => {
    const normalized = startOfDay(date);
    setActiveDate(normalized);
  };

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-[#d9e2ef] bg-white">
      <div className="grid min-w-[720px] grid-cols-[40px_repeat(8,minmax(0,1fr))_40px] overflow-hidden md:min-w-0">
        <button
          type="button"
          onClick={handlePrev}
          disabled={!canGoLeft}
          className={`flex items-center justify-center border-r border-[#eef2f7] text-xl ${
            canGoLeft
              ? "text-[#0b66c3] hover:bg-[#f8fbff]"
              : "cursor-not-allowed text-[#cbd5e1]"
          }`}
        >
          ‹
        </button>

      {fareData.map((item, index) => {
        const selected = isSameDay(item.date, activeDate);
        const isFocusedFare = Boolean(item.busId && item.busId === focusedBusId);
        const isLast = index === fareData.length - 1;

        return (
          <button
            key={item.date.toISOString()}
            type="button"
            onClick={() => {
              handleSelectDate(item.date);
              if (item.busId) {
                onFocusBus?.(item.busId);
              }
            }}
            className={`px-3 py-3 text-center transition ${
              !isLast ? "border-r border-[#eef2f7]" : ""
            } ${
              selected || isFocusedFare
                ? "bg-[#ecfdf5] ring-1 ring-inset ring-[#16a34a]"
                : "bg-white hover:bg-[#f8fafc]"
            }`}
          >
            <div
              className={`text-[12px] font-medium ${
                selected ? "text-[#111827]" : "text-[#374151]"
              }`}
            >
              {format(item.date, "EEE, MMM d")}
            </div>

            {item.price ? (
              <>
                <div className="mt-2 text-[11px] font-black uppercase tracking-[0.12em] text-[#15803d]">
                  From
                </div>

                <div className="mt-1 text-[18px] font-bold leading-none text-[#16a34a]">
                  ₹{item.price.toLocaleString("en-IN")}
                </div>
              </>
            ) : (
              <div className="mt-4 text-[20px] font-bold leading-none text-[#94a3b8]">
                —
              </div>
            )}
          </button>
        );
        })}

        <button
          type="button"
          onClick={handleNext}
          disabled={!canGoRight}
          className={`flex items-center justify-center border-l border-[#eef2f7] text-xl ${
            canGoRight
              ? "text-[#0b66c3] hover:bg-[#f8fbff]"
              : "cursor-not-allowed text-[#cbd5e1]"
          }`}
        >
          ›
        </button>
      </div>
    </div>
  );
}
