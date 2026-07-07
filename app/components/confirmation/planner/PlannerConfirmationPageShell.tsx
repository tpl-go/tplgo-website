"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import LoginModal from "@/app/components/common/LoginModal";
import MobileInnerBack from "@/app/components/common/mobile/MobileInnerBack";
import PlannerConfirmationActionsCard from "@/app/components/confirmation/planner/PlannerConfirmationActionsCard";
import PlannerConfirmationBasketCard from "@/app/components/confirmation/planner/PlannerConfirmationBasketCard";
import PlannerConfirmationFareCard from "@/app/components/confirmation/planner/PlannerConfirmationFareCard";
import PlannerConfirmationItineraryCard from "@/app/components/confirmation/planner/PlannerConfirmationItineraryCard";
import PlannerConfirmationSaveToBookings from "@/app/components/confirmation/planner/PlannerConfirmationSaveToBookings";
import PlannerConfirmationSuccessHeader from "@/app/components/confirmation/planner/PlannerConfirmationSuccessHeader";
import PlannerConfirmationTravellerCard from "@/app/components/confirmation/planner/PlannerConfirmationTravellerCard";
import PlannerConfirmationTripSummary from "@/app/components/confirmation/planner/PlannerConfirmationTripSummary";
import { useAuth } from "@/app/hooks/useAuth";
import {
  addBooking,
  getAllBookings,
  updateBooking,
  type BookingItem,
} from "@/app/lib/booking/bookingStorage";
import { saveChunkedBookingDetail } from "@/app/lib/booking/chunkedBookingStorage";
import { createGuestUserFromBooking } from "@/app/lib/booking/guestAuth";
import { seedAccountAndTravellerSafely } from "@/app/lib/booking/safeProfileSeed";
import {
  normalizePlannerFareSummary,
  plannerFareSummaryToFare,
  type PlannerFareSummary,
} from "@/app/lib/ecosystem/planner/plannerPricing";
import {
  buildSmartPlannerBookingPayload,
  getSmartPlannerPayloadCompleteness,
} from "@/app/lib/ecosystem/planner/booking/smartPlannerBookingPayload";
import { normalizeSmartPlannerBooking } from "@/app/lib/ecosystem/planner/smartPlannerBookingNormalizer";
import {
  compactPlannerDetailRecord,
  readPlannerDetailPayload,
  resetSmartPlannerWorkingSession,
  savePlannerDetailPayload,
} from "@/app/lib/ecosystem/planner/plannerPayloadStorage";
import { logSmartPlannerStorageWrite } from "@/app/lib/ecosystem/planner/booking/smartPlannerStorageWriteAudit";
import {
  addWalletLedgerItem,
  getWallet,
  saveWallet,
} from "@/app/lib/wallet/walletStorage";

const PLANNER_CONFIRMATION_KEY = "tpl_tiya_planner_confirmation_v1";
const PLANNER_PAYMENT_KEY = "tpl_tiya_planner_payment_v1";
const PLANNER_BOOKING_DRAFT_KEY = "tpl_tiya_planner_booking_draft_v1";
const CHECKOUT_PAYLOAD_KEY = "tpl_tiya_checkout_v1";
const REVIEW_DRAFT_KEY = "tpl_tiya_review_draft_v1";

type RecordValue = Record<string, unknown>;

type PlannerConfirmationPayload = {
  addOn?: RecordValue | null;
  bookingMeta?: RecordValue | null;
  bookingId?: string;
  bookingStatus?: string;
  earnedCreditAmount?: number;
  fare?: RecordValue | null;
  itinerary?: RecordValue | null;
  invoiceNumber?: string;
  leadTraveller?: RecordValue | null;
  payment?: RecordValue | null;
  plannerFareSummary?: PlannerFareSummary | null;
  paymentId?: string;
  routeData?: unknown;
  selectedRoute?: unknown;
  selectedRouteVariant?: unknown;
  smartPlannerPayload?: RecordValue | null;
  source?: string;
  summary?: RecordValue | null;
  traveller?: RecordValue | null;
  travellers?: unknown;
};

function asRecord(value: unknown): RecordValue {
  return typeof value === "object" && value !== null ? (value as RecordValue) : {};
}

function safeArray(value: unknown): RecordValue[] {
  return Array.isArray(value)
    ? value.filter((item): item is RecordValue => typeof item === "object" && item !== null)
    : [];
}

function hasMeaningfulValue(value: unknown) {
  if (value === undefined || value === null) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (typeof value === "number") return Number.isFinite(value);
  if (typeof value === "boolean") return true;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "object") return Object.keys(value).length > 0;
  return true;
}

function mergeNonEmptyRecords(...values: unknown[]): RecordValue {
  return values.reduce<RecordValue>((merged, value) => {
    const record = asRecord(value);
    Object.entries(record).forEach(([key, entry]) => {
      if (!hasMeaningfulValue(merged[key]) && hasMeaningfulValue(entry)) {
        merged[key] = entry;
      }
    });
    return merged;
  }, {});
}

function firstNonEmptyArrayValue(...values: unknown[]) {
  for (const value of values) {
    const array = safeArray(value);
    if (array.length) return array;
  }
  return [];
}

function firstNonEmptyRecordValue(...values: unknown[]) {
  for (const value of values) {
    const record = asRecord(value);
    if (Object.keys(record).length) return record;
  }
  return {};
}

function readStorageJSON(key: string): unknown {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(key) || window.localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed === "object" &&
      "__plannerDetailRecord" in parsed &&
      typeof parsed.detailStorageKey === "string"
    ) {
      return readPlannerDetailPayload(parsed.detailStorageKey) || null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function writeStorageJSON(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  const detail = savePlannerDetailPayload(
    `${key}_${Date.now()}`.replace(/[^\w-]/g, "_"),
    value
  );
  const compact = compactPlannerDetailRecord(detail.key || undefined, {
    key,
    savedAt: new Date().toISOString(),
  });
  const serialized = JSON.stringify(compact);
  try {
    logSmartPlannerStorageWrite({
      file: "app/components/confirmation/planner/PlannerConfirmationPageShell.tsx",
      functionName: "writeStorageJSON",
      key,
      payload: compact,
      serialized,
      storageType: "sessionStorage",
      successOrFailed: "attempt",
    });
    window.sessionStorage.setItem(key, serialized);
    logSmartPlannerStorageWrite({
      file: "app/components/confirmation/planner/PlannerConfirmationPageShell.tsx",
      functionName: "writeStorageJSON",
      key,
      payload: compact,
      serialized,
      storageType: "sessionStorage",
      successOrFailed: "success",
    });
  } catch (error) {
    logSmartPlannerStorageWrite({
      error,
      file: "app/components/confirmation/planner/PlannerConfirmationPageShell.tsx",
      functionName: "writeStorageJSON",
      key,
      payload: compact,
      serialized,
      storageType: "sessionStorage",
      successOrFailed: "failed",
    });
    // Session storage may be unavailable.
  }
  try {
    logSmartPlannerStorageWrite({
      file: "app/components/confirmation/planner/PlannerConfirmationPageShell.tsx",
      functionName: "writeStorageJSON",
      key,
      payload: compact,
      serialized,
      storageType: "localStorage",
      successOrFailed: "attempt",
    });
    window.localStorage.setItem(key, serialized);
    logSmartPlannerStorageWrite({
      file: "app/components/confirmation/planner/PlannerConfirmationPageShell.tsx",
      functionName: "writeStorageJSON",
      key,
      payload: compact,
      serialized,
      storageType: "localStorage",
      successOrFailed: "success",
    });
  } catch (error) {
    logSmartPlannerStorageWrite({
      error,
      file: "app/components/confirmation/planner/PlannerConfirmationPageShell.tsx",
      functionName: "writeStorageJSON",
      key,
      payload: compact,
      serialized,
      storageType: "localStorage",
      successOrFailed: "failed",
    });
    // Confirmation can still render from the chunked detail in session storage.
  }
}

function loadRawConfirmationSources() {
  return {
    bookingDraftRaw: readStorageJSON(PLANNER_BOOKING_DRAFT_KEY),
    checkoutRaw: readStorageJSON(CHECKOUT_PAYLOAD_KEY),
    confirmationRaw: readStorageJSON(PLANNER_CONFIRMATION_KEY),
    paymentRaw: readStorageJSON(PLANNER_PAYMENT_KEY),
    reviewRaw: readStorageJSON(REVIEW_DRAFT_KEY),
  };
}

function text(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : "";
}

function normalizeMobile(value?: unknown) {
  const digits = String(value || "").replace(/\D/g, "");
  return digits.length > 10 ? digits.slice(-10) : digits;
}

function buildBookingId() {
  return `TPL-SP-${Date.now().toString().slice(-6)}`;
}

function buildPaymentId() {
  return `TPL-SP-PAY-${Date.now().toString().slice(-6)}`;
}

function buildInvoiceId() {
  return `TPL-SP-INV-${Date.now().toString().slice(-6)}`;
}

function getNumber(...values: unknown[]) {
  for (const value of values) {
    const number = Number(value || 0);
    if (Number.isFinite(number) && number > 0) return number;
  }
  return 0;
}

function getNumberOrUndefined(...values: unknown[]) {
  for (const value of values) {
    if (value === undefined || value === null || value === "") continue;
    const number = Number(value);
    if (Number.isFinite(number)) return number;
  }
  return undefined;
}

function getDateRangeDays(startValue: unknown, endValue: unknown) {
  if (!startValue || !endValue) return 0;
  const start = new Date(String(startValue));
  const end = new Date(String(endValue));
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0;
  const diff = end.getTime() - start.getTime();
  if (diff < 0) return 0;
  return Math.floor(diff / 86_400_000) + 1;
}

function formatDurationFromDays(days: number) {
  if (days <= 0) return "";
  if (days === 1) return "1 Day";
  return `${days} Days / ${Math.max(days - 1, 0)} Night${days - 1 === 1 ? "" : "s"}`;
}

function durationDaysFromFields(...sources: unknown[]) {
  for (const source of sources) {
    const record = asRecord(source);
    const explicitDays = getNumber(
      record.durationDays,
      record.totalDays,
      record.days,
      record.dayCount,
      record.numberOfDays
    );
    if (explicitDays > 0) return explicitDays;

    const nights = getNumber(record.nights, record.totalNights, record.nightCount);
    if (nights > 0) return nights + 1;
  }

  return 0;
}

function validDurationText(value: unknown) {
  const duration = text(value);
  if (!duration) return "";
  if (/\b0\s*d\b/i.test(duration)) return "";
  if (/duration\s+not\s+available/i.test(duration)) return "";
  return duration;
}

function basketValue(item: RecordValue) {
  return getNumber(
    item.total,
    item.totalPrice,
    item.estimatedTotal,
    item.estimatedPrice,
    item.price,
    item.value,
    item.amount,
    item.cost
  );
}

function normalizeFlexibleFareSummary(...sources: unknown[]): PlannerFareSummary | null {
  for (const source of sources) {
    const strict = normalizePlannerFareSummary(source);
    if (
      strict &&
      (strict.selectedBasketValue > 0 ||
        strict.finalPayable > 0 ||
        strict.baseAfterOffer > 0)
    ) {
      return strict;
    }

    const record = asRecord(source);
    if (!Object.keys(record).length) continue;
    const walletBreakdown = asRecord(record.walletBreakdown);
    const payment = asRecord(record.payment);
    const selectedBasketValue = getNumber(
      record.selectedBasketValue,
      record.baseAmount,
      record.basePrice,
      record.subtotal,
      record.totalBasketValue,
      record.basketValue
    );
    const offerDiscount = getNumber(record.offerDiscount, record.couponDiscount, record.discount);
    const baseAfterOffer =
      getNumber(record.baseAfterOffer) || Math.max(selectedBasketValue - offerDiscount, 0);
    const taxesAndFees = getNumber(record.taxesAndFees, record.feesAndTaxes, record.tax);
    const convenienceFee = getNumber(record.convenienceFee, record.gatewayFee);
    const addOnsTotal = getNumber(
      record.addOnsTotal,
      record.addOnAmount,
      record.addOnsAmount,
      record.insuranceAmount
    );
    const promoCreditUsed = getNumber(record.promoCreditUsed, walletBreakdown.promoUsed);
    const earnedCreditUsed = getNumber(record.earnedCreditUsed, walletBreakdown.earnedUsed);
    const refundWalletUsed = getNumber(record.refundWalletUsed, walletBreakdown.refundUsed);
    const totalWalletBenefit =
      getNumber(record.totalWalletBenefit, record.tplCreditUsed, walletBreakdown.totalWalletUsed, payment.walletUsed) ||
      promoCreditUsed + earnedCreditUsed + refundWalletUsed;
    const finalPayable =
      getNumber(
        record.finalPayable,
        record.finalPayableAmount,
        record.grandTotal,
        record.totalPaid,
        record.totalAmount,
        record.amountPaid,
        payment.amountPaid
      ) || Math.max(baseAfterOffer + taxesAndFees + convenienceFee + addOnsTotal - totalWalletBenefit, 0);

    if (
      selectedBasketValue > 0 ||
      finalPayable > 0 ||
      baseAfterOffer > 0 ||
      taxesAndFees > 0 ||
      totalWalletBenefit > 0
    ) {
      return {
        addOnsTotal,
        baseAfterOffer,
        baseAmount: getNumber(record.baseAmount, selectedBasketValue),
        convenienceFee,
        currency: "INR",
        earnedCreditAmount: getNumber(
          record.earnedCreditAmount,
          walletBreakdown.earnedOnThisBooking
        ),
        earnedCreditUsed,
        finalPayable,
        offerData: asRecord(record.offerData),
        offerDiscount,
        promoCreditUsed,
        refundWalletUsed,
        selectedBasketValue,
        taxesAndFees,
        totalWalletBenefit,
      };
    }
  }

  return null;
}

function selectedBasketItems(record: RecordValue, payload: RecordValue) {
  const normalizedData = asRecord(record.normalizedConfirmationData);
  const summary = asRecord(record.summary);
  const rawPayloads = asRecord(record.rawPayloads);
  const rawConfirmation = asRecord(record.rawConfirmationPayload || rawPayloads.rawConfirmationPayload);
  const rawPayment = asRecord(record.rawPaymentPayload || rawPayloads.rawPaymentPayload);
  const rawBookingDraft = asRecord(record.rawBookingDraftPayload || rawPayloads.rawBookingDraftPayload);
  const rawCheckout = asRecord(record.rawCheckoutPayload || rawPayloads.rawCheckoutPayload);

  return firstNonEmptyArrayValue(
    record.selectedBasketItems,
    summary.selectedBasketItems,
    payload.selectedBasketItems,
    asRecord(record.smartPlannerPayload).selectedBasketItems,
    asRecord(normalizedData.smartPlannerPayload).selectedBasketItems,
    normalizedData.selectedBasketItems,
    rawConfirmation.selectedBasketItems,
    asRecord(rawConfirmation.smartPlannerPayload).selectedBasketItems,
    rawPayment.selectedBasketItems,
    asRecord(rawPayment.smartPlannerPayload).selectedBasketItems,
    rawBookingDraft.selectedBasketItems,
    asRecord(rawBookingDraft.smartPlannerPayload).selectedBasketItems,
    asRecord(rawBookingDraft.payload).selectedBasketItems,
    rawCheckout.selectedBasketItems,
    asRecord(rawCheckout.smartPlannerPayload).selectedBasketItems,
    asRecord(rawCheckout.payload).selectedBasketItems
  );
}

function routeFromPayload(payload: RecordValue) {
  const summary = asRecord(payload.summary);
  if (Array.isArray(summary.route) || typeof summary.route === "string") {
    return summary.route as string[] | string;
  }
  const trip = asRecord(payload.trip);
  const route = asRecord(payload.route);
  const stops = safeArray(route.stops)
    .map((stop) => text(stop.city) || text(stop.name) || text(stop.title))
    .filter(Boolean);
  return stops.length ? stops : [trip.origin, trip.destination].map(text).filter(Boolean);
}

function itineraryDays(payload: RecordValue) {
  const itinerary = payload.itinerary;
  const directDayPlans = safeArray(payload.dayPlans);
  if (directDayPlans.length) return directDayPlans;
  if (Array.isArray(itinerary)) return safeArray(itinerary);
  const itineraryRecord = asRecord(itinerary);
  if (Array.isArray(itineraryRecord.days)) return safeArray(itineraryRecord.days);
  if (Array.isArray(itineraryRecord.dayPlans)) return safeArray(itineraryRecord.dayPlans);
  if (Array.isArray(itineraryRecord.itineraryDays)) return safeArray(itineraryRecord.itineraryDays);
  if (Array.isArray(itineraryRecord.generatedDays)) return safeArray(itineraryRecord.generatedDays);
  return [];
}

function travellerCountFromValue(value: unknown): number {
  if (Array.isArray(value)) return value.length;
  const record = asRecord(value);
  if (!Object.keys(record).length) return getNumber(value);

  const arrayCount = firstNonEmptyArrayValue(
    record.travellers,
    record.travellerDetails,
    record.details,
    record.passengers,
    record.guestDetails,
    record.guests
  ).length;
  if (arrayCount > 0) return arrayCount;

  const adults = getNumber(record.adults, record.adultCount);
  const children = getNumber(record.children, record.childCount);
  const infants = getNumber(record.infants, record.infantCount);
  const seniors = getNumber(record.seniors, record.seniorCitizens, record.seniorCount);
  const composed = adults + children + infants + seniors;
  if (composed > 0) return composed;

  const rooms = firstNonEmptyArrayValue(record.rooms, record.roomDetails, record.roomAllocations);
  const roomGuests = rooms.reduce(
    (sum, room) =>
      sum +
      getNumber(room.guests, room.guestCount) +
      getNumber(room.adults, room.adultCount) +
      getNumber(room.children, room.childCount) +
      getNumber(room.infants, room.infantCount),
    0
  );
  if (roomGuests > 0) return roomGuests;

  return getNumber(
    record.total,
    record.count,
    record.travellerCount,
    record.travelersCount,
    record.passengerCount,
    record.guestCount,
    record.totalTravellers
  );
}

function resolveTravellerCount(...sources: unknown[]) {
  for (const source of sources) {
    const record = asRecord(source);
    const arrayCount = firstNonEmptyArrayValue(
      record.travellers,
      record.travellerDetails,
      record.passengers,
      record.guestDetails,
      record.guests
    ).length;
    if (arrayCount > 0) return arrayCount;
  }

  for (const source of sources) {
    const count = travellerCountFromValue(source);
    if (count > 0) return count;
  }

  return 1;
}

function durationLabel(
  payload: RecordValue,
  summary: RecordValue,
  days: RecordValue[] = [],
  ...routeSources: unknown[]
) {
  const trip = asRecord(payload.trip);
  const routeData = asRecord(payload.routeData);
  const selectedRouteVariant = asRecord(payload.selectedRouteVariant);
  const selectedRoute = asRecord(payload.selectedRoute);
  const route = asRecord(payload.route);

  const itineraryDayCount = days.length || itineraryDays(payload).length;
  if (itineraryDayCount > 0) return formatDurationFromDays(itineraryDayCount);

  const dateDays = getDateRangeDays(
    trip.startDate ||
      trip.travelStartDate ||
      payload.startDate ||
      payload.travelStartDate ||
      asRecord(trip.dateRange).start ||
      summary.travelDate,
    trip.endDate ||
      trip.travelEndDate ||
      payload.endDate ||
      payload.travelEndDate ||
      asRecord(trip.dateRange).end ||
      summary.endDate
  );
  if (dateDays > 0) return formatDurationFromDays(dateDays);

  const fieldDays = durationDaysFromFields(summary, trip, payload);
  if (fieldDays > 0) return formatDurationFromDays(fieldDays);

  const explicit =
    validDurationText(summary.durationLabel) ||
    validDurationText(trip.durationLabel) ||
    validDurationText(trip.duration) ||
    validDurationText(payload.durationLabel) ||
    validDurationText(payload.duration) ||
    validDurationText(routeData.durationLabel) ||
    validDurationText(routeData.duration) ||
    validDurationText(selectedRouteVariant.durationLabel) ||
    validDurationText(selectedRouteVariant.duration) ||
    validDurationText(selectedRoute.durationLabel) ||
    validDurationText(selectedRoute.duration) ||
    validDurationText(route.durationLabel) ||
    validDurationText(route.duration) ||
    routeSources
      .map(
        (source) =>
          validDurationText(asRecord(source).durationLabel) ||
          validDurationText(asRecord(source).duration)
      )
      .find(Boolean) ||
    "";
  if (explicit) return explicit;

  return "Duration not available";
}

function travellerName(lead: RecordValue, travellers: RecordValue[]) {
  const first = travellers[0] || {};
  return (
    text(lead.name) ||
    text(lead.fullName) ||
    [lead.firstName, lead.lastName].map(text).filter(Boolean).join(" ") ||
    text(first.fullName) ||
    text(first.name) ||
    [first.firstName, first.lastName].map(text).filter(Boolean).join(" ") ||
    "Guest"
  );
}

function normalizeTraveller(payload: RecordValue) {
  const traveller = asRecord(payload.traveller);
  const planner = asRecord(payload.smartPlannerPayload);
  const directTravellers = asRecord(payload.travellers);
  const plannerTravellers = asRecord(planner.travellers);
  const fallbackTraveller = asRecord(planner.traveller);
  const travellers = firstNonEmptyArrayValue(
    traveller.travellers,
    payload.travellerDetails,
    directTravellers.details,
    directTravellers.travellers,
    planner.travellerDetails,
    plannerTravellers.details,
    plannerTravellers.travellers,
    fallbackTraveller.travellers
  );
  const contactDetails = {
    ...asRecord(directTravellers.contactDetails),
    ...asRecord(payload.contactDetails),
    ...asRecord(plannerTravellers.contactDetails),
    ...asRecord(planner.contactDetails),
    ...asRecord(traveller.contactDetails),
  };
  const leadTraveller = {
    ...asRecord(directTravellers.leadTraveller),
    ...asRecord(payload.leadTraveller),
    ...asRecord(planner.leadTraveller),
    ...asRecord(plannerTravellers.leadTraveller),
  };

  return {
    contactDetails,
    leadTraveller,
    traveller: {
      ...traveller,
      contactDetails,
      travellers,
    },
    travellers,
  };
}

function normalizeConfirmation(value: unknown): PlannerConfirmationPayload | null {
  const record = asRecord(value);
  if (!Object.keys(record).length) return null;

  const rawPayloads = asRecord(record.rawPayloads);
  const normalizedData = asRecord(record.normalizedConfirmationData);
  const rawConfirmation = asRecord(record.rawConfirmationPayload || rawPayloads.rawConfirmationPayload);
  const rawPayment = asRecord(record.rawPaymentPayload || rawPayloads.rawPaymentPayload);
  const rawBookingDraft = asRecord(record.rawBookingDraftPayload || rawPayloads.rawBookingDraftPayload);
  const rawCheckout = asRecord(record.rawCheckoutPayload || rawPayloads.rawCheckoutPayload);
  const payload = mergeNonEmptyRecords(
    record.smartPlannerPayload,
    normalizedData.smartPlannerPayload,
    rawConfirmation.smartPlannerPayload,
    rawPayment.smartPlannerPayload,
    rawBookingDraft.smartPlannerPayload,
    rawCheckout.smartPlannerPayload,
    asRecord(rawBookingDraft.payload),
    asRecord(rawCheckout.payload),
    record.payload,
    record.checkoutPayload,
    record.reviewPayload,
    normalizedData.payload,
    record
  );
  const summary = mergeNonEmptyRecords(
    record.summary,
    normalizedData.summary,
    rawConfirmation.summary,
    rawPayment.summary,
    rawBookingDraft.summary,
    rawCheckout.summary
  );
  const trip = asRecord(payload.trip);
  const basket =
    safeArray(summary.selectedBasketItems).length
      ? safeArray(summary.selectedBasketItems)
      : selectedBasketItems(record, payload);
  const totalBasketValue =
    getNumber(
      record.totalBasketValue,
      asRecord(record.fareSummary).selectedBasketValue,
      asRecord(record.fareSummary).baseAmount,
      asRecord(record.fare).basePrice,
      asRecord(record.fare).grandTotal
    ) ||
    basket.reduce((sum, item) => sum + basketValue(item), 0);
  const normalizedTraveller = normalizeTraveller({
    ...record,
    smartPlannerPayload: payload,
    traveller: firstNonEmptyRecordValue(
      record.traveller,
      normalizedData.traveller,
      rawConfirmation.traveller,
      rawPayment.traveller,
      rawBookingDraft.traveller,
      rawCheckout.traveller
    ),
  });
  const days = firstNonEmptyArrayValue(
    record.dayPlans,
    payload.dayPlans,
    itineraryDays(payload),
    itineraryDays(record),
    itineraryDays(rawConfirmation),
    itineraryDays(rawPayment),
    itineraryDays(rawBookingDraft),
    itineraryDays(rawCheckout)
  );
  const route = routeFromPayload({
    ...payload,
    summary,
  });
  const duration = durationLabel(
    payload,
    summary,
    days,
    record.routeData,
    record.selectedRouteVariant,
    record.selectedRoute,
    rawConfirmation.routeData,
    rawPayment.routeData,
    rawBookingDraft.routeData,
    rawCheckout.routeData,
    asRecord(rawConfirmation.smartPlannerPayload).selectedRouteVariant,
    asRecord(rawPayment.smartPlannerPayload).selectedRouteVariant,
    asRecord(rawBookingDraft.smartPlannerPayload).selectedRouteVariant,
    asRecord(rawCheckout.smartPlannerPayload).selectedRouteVariant
  );
  const durationMatch = duration.match(/(\d+)\s*N\s*\/\s*(\d+)\s*D/i);
  const recordFareSummary = normalizeFlexibleFareSummary(record.fareSummary);
  const fareRecord = mergeNonEmptyRecords(
    record.fare,
    normalizedData.fare,
    rawConfirmation.fare,
    rawPayment.fare,
    recordFareSummary ? plannerFareSummaryToFare(recordFareSummary) : {}
  );
  const savedPlannerFareSummary =
    normalizeFlexibleFareSummary(record.plannerFareSummary) ||
    recordFareSummary ||
    normalizeFlexibleFareSummary(record.pricing) ||
    normalizeFlexibleFareSummary(record.paymentSummary) ||
    normalizeFlexibleFareSummary(fareRecord.plannerFareSummary) ||
    normalizeFlexibleFareSummary(payload.plannerFareSummary) ||
    normalizeFlexibleFareSummary(rawConfirmation.plannerFareSummary) ||
    normalizeFlexibleFareSummary(rawConfirmation.fareSummary) ||
    normalizeFlexibleFareSummary(rawConfirmation.pricing) ||
    normalizeFlexibleFareSummary(rawConfirmation.paymentSummary) ||
    normalizeFlexibleFareSummary(rawConfirmation.fare) ||
    normalizeFlexibleFareSummary(rawPayment.plannerFareSummary) ||
    normalizeFlexibleFareSummary(rawPayment.fareSummary) ||
    normalizeFlexibleFareSummary(rawPayment.pricing) ||
    normalizeFlexibleFareSummary(rawPayment.paymentSummary) ||
    normalizeFlexibleFareSummary(rawPayment.fare) ||
    normalizeFlexibleFareSummary(rawPayment.payment) ||
    normalizeFlexibleFareSummary(rawBookingDraft.plannerFareSummary) ||
    normalizeFlexibleFareSummary(rawBookingDraft.fareSummary) ||
    normalizeFlexibleFareSummary(rawBookingDraft.pricing) ||
    normalizeFlexibleFareSummary(rawCheckout.plannerFareSummary) ||
    normalizeFlexibleFareSummary(rawCheckout.fareSummary) ||
    normalizeFlexibleFareSummary(rawCheckout.pricing);
  const plannerFareRecord = savedPlannerFareSummary
    ? plannerFareSummaryToFare(savedPlannerFareSummary)
    : null;
  const paymentRecord = mergeNonEmptyRecords(
    record.payment,
    record.paymentSummary,
    normalizedData.payment,
    rawConfirmation.payment,
    rawPayment.payment,
    rawBookingDraft.payment,
    rawCheckout.payment
  );
  const walletBreakdown = asRecord(plannerFareRecord?.walletBreakdown || fareRecord.walletBreakdown);
  const savedBasePrice =
    getNumberOrUndefined(plannerFareRecord?.basePrice, fareRecord.basePrice, record.totalBasketValue) ??
    totalBasketValue;
  const savedCouponDiscount = getNumberOrUndefined(
    plannerFareRecord?.couponDiscount,
    fareRecord.couponDiscount
  );
  const savedTaxes = getNumberOrUndefined(plannerFareRecord?.feesAndTaxes, fareRecord.feesAndTaxes);
  const savedGatewayFee = getNumberOrUndefined(
    fareRecord.gatewayFee,
    fareRecord.convenienceFee,
    paymentRecord.gatewayFee,
    paymentRecord.convenienceFee
  );
  const savedAddOns = getNumberOrUndefined(
    fareRecord.insuranceAmount,
    fareRecord.addOnAmount,
    fareRecord.addOnsAmount,
    paymentRecord.insuranceAmount
  );
  const savedWalletUsed =
    getNumberOrUndefined(plannerFareRecord?.tplCreditUsed, fareRecord.tplCreditUsed, paymentRecord.walletUsed) ??
    getNumber(walletBreakdown.totalWalletUsed);
  const savedFinal =
    getNumberOrUndefined(
      plannerFareRecord?.finalPayableAmount,
      fareRecord.finalPayableAmount,
      paymentRecord.amountPaid,
      fareRecord.grandTotal
    ) ?? totalBasketValue;
  const resolvedTravellerCount = resolveTravellerCount(
    normalizedTraveller.travellers,
    normalizedTraveller.traveller,
    normalizedTraveller.leadTraveller,
    record.travellers,
    record.travellerDetails,
    record.passengers,
    record.guestDetails,
    payload.travellers,
    payload.travellerDetails,
    payload.passengers,
    payload.guestDetails,
    asRecord(payload.trip).travellers,
    summary,
    paymentRecord,
    rawConfirmation.traveller,
    rawPayment.traveller,
    rawBookingDraft.traveller,
    rawCheckout.traveller,
    rawConfirmation.summary,
    rawPayment.summary,
    rawBookingDraft.summary,
    rawCheckout.summary
  );

  return {
    ...record,
    addOn: asRecord(record.addOn),
    bookingId: text(record.bookingId) || buildBookingId(),
    bookingStatus: text(record.bookingStatus) || "confirmed",
    earnedCreditAmount: getNumber(
      savedPlannerFareSummary?.earnedCreditAmount,
      record.earnedCreditAmount,
      walletBreakdown.earnedOnThisBooking
    ),
    fare: {
      ...fareRecord,
      ...(plannerFareRecord || {}),
      addOnAmount: savedAddOns,
      baseAfterOffer:
        getNumberOrUndefined(plannerFareRecord?.baseAfterOffer, fareRecord.baseAfterOffer) ??
        Math.max(savedBasePrice - Number(savedCouponDiscount || 0), 0),
      basePrice: savedBasePrice,
      convenienceFee: savedGatewayFee,
      couponDiscount: savedCouponDiscount,
      feesAndTaxes: savedTaxes,
      finalPayableAmount: savedFinal,
      grandTotal: getNumberOrUndefined(fareRecord.grandTotal) ?? savedFinal,
      tplCreditUsed: savedWalletUsed,
      walletBreakdown,
    },
    itinerary: {
      dayPlans: days,
      travelDate: text(asRecord(record.itinerary).travelDate) || text(trip.startDate),
    },
    invoiceNumber: text(record.invoiceNumber) || buildInvoiceId(),
    leadTraveller: normalizedTraveller.leadTraveller,
    payment: {
      ...paymentRecord,
      amountPaid: getNumber(paymentRecord.amountPaid, savedFinal),
      paidAt: text(paymentRecord.paidAt) || new Date().toISOString(),
      paymentActionState: text(paymentRecord.paymentActionState) || "success",
      paymentId: text(paymentRecord.paymentId) || text(record.paymentId) || buildPaymentId(),
      totalTravellers: resolvedTravellerCount,
    },
    paymentId: text(record.paymentId) || text(asRecord(record.payment).paymentId) || buildPaymentId(),
    plannerFareSummary: savedPlannerFareSummary,
    smartPlannerPayload: {
      ...payload,
      ...(savedPlannerFareSummary ? { plannerFareSummary: savedPlannerFareSummary } : {}),
      selectedBasketItems: basket,
    },
    source: "smart-planner",
    summary: {
      ...summary,
      days: Number(durationMatch?.[2] || summary.days || days.length || 0),
      durationLabel: duration,
      nights: Number(durationMatch?.[1] || summary.nights || Math.max(days.length - 1, 0)),
      originCity: text(summary.originCity) || text(trip.origin) || (Array.isArray(route) ? route[0] : ""),
      packageSlug: "smart-planner",
      packageTitle: text(summary.packageTitle) || text(trip.name) || text(trip.title) || "Smart Planner Trip",
      route,
      selectedBasketItems: basket,
      totalAdults: resolvedTravellerCount,
      totalChildren: getNumber(summary.totalChildren, asRecord(payload.travellers).children),
      totalRooms: getNumber(summary.totalRooms, asRecord(payload.travellers).rooms, 1),
      travelDate: text(summary.travelDate) || text(trip.startDate),
    },
    traveller: normalizedTraveller.traveller,
  };
}

function loadConfirmation() {
  const reviewRaw = readStorageJSON(REVIEW_DRAFT_KEY);
  const reviewRecord = asRecord(reviewRaw);
  return (
    normalizeConfirmation(readStorageJSON(PLANNER_CONFIRMATION_KEY)) ||
    normalizeConfirmation(readStorageJSON(PLANNER_PAYMENT_KEY)) ||
    normalizeConfirmation(readStorageJSON(CHECKOUT_PAYLOAD_KEY)) ||
    normalizeConfirmation(readStorageJSON(PLANNER_BOOKING_DRAFT_KEY)) ||
    normalizeConfirmation(reviewRecord.reviewPayload || reviewRecord.payload || reviewRaw)
  );
}

function creditEarned(params: { bookingId: string; earnedAmount: number; mobile: string }) {
  if (typeof window === "undefined") return;
  if (!params.mobile || !params.bookingId || params.earnedAmount <= 0) return;

  const guardKey = `tpl_smart_planner_earned_credit_done_${params.bookingId}`;
  if (localStorage.getItem(guardKey)) return;

  const wallet = getWallet(params.mobile);
  saveWallet(
    {
      ...wallet,
      earnedCredit: Number(wallet.earnedCredit || 0) + params.earnedAmount,
    },
    params.mobile
  );
  addWalletLedgerItem(
    {
      amount: params.earnedAmount,
      bookingId: params.bookingId,
      description: "Earned credit added after successful Smart Planner booking",
      title: "TPL Earned Credit Added",
      type: "earned_added",
    },
    params.mobile
  );
  try {
    logSmartPlannerStorageWrite({
      file: "app/components/confirmation/planner/PlannerConfirmationPageShell.tsx",
      functionName: "creditEarned:guard",
      key: guardKey,
      payload: "true",
      serialized: "true",
      storageType: "localStorage",
      successOrFailed: "attempt",
    });
    localStorage.setItem(guardKey, "true");
    logSmartPlannerStorageWrite({
      file: "app/components/confirmation/planner/PlannerConfirmationPageShell.tsx",
      functionName: "creditEarned:guard",
      key: guardKey,
      payload: "true",
      serialized: "true",
      storageType: "localStorage",
      successOrFailed: "success",
    });
  } catch (error) {
    logSmartPlannerStorageWrite({
      error,
      file: "app/components/confirmation/planner/PlannerConfirmationPageShell.tsx",
      functionName: "creditEarned:guard",
      key: guardKey,
      payload: "true",
      serialized: "true",
      storageType: "localStorage",
      successOrFailed: "failed",
    });
    // Wallet credit guard is best effort; confirmation must remain visible.
  }
}

function markSessionGuard(key: string) {
  try {
    logSmartPlannerStorageWrite({
      file: "app/components/confirmation/planner/PlannerConfirmationPageShell.tsx",
      functionName: "markSessionGuard",
      key,
      payload: "true",
      serialized: "true",
      storageType: "sessionStorage",
      successOrFailed: "attempt",
    });
    sessionStorage.setItem(key, "true");
    logSmartPlannerStorageWrite({
      file: "app/components/confirmation/planner/PlannerConfirmationPageShell.tsx",
      functionName: "markSessionGuard",
      key,
      payload: "true",
      serialized: "true",
      storageType: "sessionStorage",
      successOrFailed: "success",
    });
  } catch (error) {
    logSmartPlannerStorageWrite({
      error,
      file: "app/components/confirmation/planner/PlannerConfirmationPageShell.tsx",
      functionName: "markSessionGuard",
      key,
      payload: "true",
      serialized: "true",
      storageType: "sessionStorage",
      successOrFailed: "failed",
    });
    // Duplicate-save guard is best effort when storage is full.
  }
}

function routeLabelForBooking(route: unknown) {
  if (Array.isArray(route)) return route.map(text).filter(Boolean).join(" → ");
  return text(route);
}

function smartPlannerBookingIndexFields(params: {
  amount: number;
  bookingId: string;
  detailStorageKey?: string;
  durationLabel: string;
  invoiceNo: string;
  payload: PlannerConfirmationPayload;
  paymentId: string;
  routeLabel: string;
  title: string;
  travelDate: string;
  travellerCount: number;
}) {
  const smartPayload = asRecord(params.payload.smartPlannerPayload);
  const trip = asRecord(smartPayload.trip);
  const routeParts = params.routeLabel.split("→").map((part) => part.trim()).filter(Boolean);
  const origin = text(trip.origin) || routeParts[0] || "";
  const destination = text(trip.destination) || routeParts[routeParts.length - 1] || "";
  const detailPath = `/account/bookings/smart-planner/${params.bookingId}`;
  const managePath = `/smart-planner/manage/${params.bookingId}?from=account`;
  const detailFields = params.detailStorageKey
    ? {
        detailPayloadStorageKey: params.detailStorageKey,
        detailSaved: true,
        detailStorageKey: params.detailStorageKey,
        hasChunkedDetail: true,
        smartPlannerDetailSaved: true,
      }
    : {};

  return {
    bookingId: params.bookingId,
    bookingStatus: "confirmed",
    dateRange: {
      end: text(trip.endDate) || text(asRecord(trip.dateRange).end),
      start: text(trip.startDate) || params.travelDate,
    },
    destination,
    detailPath,
    detailRoute: "/account/bookings/smart-planner",
    ...detailFields,
    durationLabel: params.durationLabel,
    invoiceNo: params.invoiceNo,
    managePath,
    origin,
    paidAmount: params.amount,
    paymentId: params.paymentId,
    paymentStatus: "paid",
    routeLabel: params.routeLabel,
    serviceType: "smart-planner",
    ticketType: "smart-planner" as const,
    title: params.title,
    totalAmount: params.amount,
    travellerCount: params.travellerCount,
    travellersLabel: `${params.travellerCount} Traveller${params.travellerCount > 1 ? "s" : ""}`,
  };
}

function findSmartPlannerBookingForConfirmation(params: {
  amount: number;
  email: string;
  legacyPayloadStorageKey: string;
  mobile: string;
  title: string;
  travelDate: string;
}) {
  return getAllBookings().find(
    (booking) =>
      booking.type === "smart-planner" &&
      booking.mobile === params.mobile &&
      (booking.payloadStorageKey === params.legacyPayloadStorageKey ||
        (booking.travelDate === params.travelDate &&
          booking.title === params.title &&
          booking.amount === params.amount &&
          String(booking.leadTraveller?.email || "").toLowerCase() === params.email.toLowerCase()))
  ) || null;
}

function saveSmartPlannerChunkedDetail(params: {
  booking: BookingItem;
  durationLabel: string;
  fullPlannerBookingPayload: ReturnType<typeof buildSmartPlannerBookingPayload>;
  invoiceNo: string;
  paymentId: string;
  routeLabel: string;
  title: string;
  totalAmount: number;
  travelDate: string;
  travellerCount: number;
}) {
  logSmartPlannerStorageWrite({
    file: "app/components/confirmation/planner/PlannerConfirmationPageShell.tsx",
    functionName: "saveSmartPlannerChunkedDetail",
    key: params.booking.id,
    payload: params.fullPlannerBookingPayload,
    storageType: "localStorage",
    successOrFailed: "attempt",
  });
  const detailSave = saveChunkedBookingDetail(
    params.booking.id,
    params.fullPlannerBookingPayload,
    { service: "smart-planner" }
  );
  logSmartPlannerStorageWrite({
    error: detailSave.ok ? undefined : detailSave.warning,
    file: "app/components/confirmation/planner/PlannerConfirmationPageShell.tsx",
    functionName: "saveSmartPlannerChunkedDetail",
    key: detailSave.ok ? detailSave.manifestKey : params.booking.id,
    payload: params.fullPlannerBookingPayload,
    storageType: "localStorage",
    successOrFailed: detailSave.ok ? "success" : "failed",
  });
  const indexFields = smartPlannerBookingIndexFields({
    amount: params.totalAmount,
    bookingId: params.booking.id,
    detailStorageKey: detailSave.ok ? detailSave.manifestKey : undefined,
    durationLabel: params.durationLabel,
    invoiceNo: params.invoiceNo,
    payload: normalizeConfirmation(params.fullPlannerBookingPayload) || {},
    paymentId: params.paymentId,
    routeLabel: params.routeLabel,
    title: params.title,
    travelDate: params.travelDate,
    travellerCount: params.travellerCount,
  });

  if (!detailSave.ok) {
    const updated = updateBooking(params.booking.id, {
      ...indexFields,
      travellers: indexFields.travellersLabel,
    });
    return {
      booking: updated || params.booking,
      detailSave,
    };
  }

  const updated = updateBooking(params.booking.id, {
    ...indexFields,
    detailPayloadStorageKey: detailSave.manifestKey,
    detailSaved: true,
    detailStorageKey: detailSave.manifestKey,
    hasChunkedDetail: true,
    payloadStorageKey: detailSave.manifestKey,
    smartPlannerDetailSaved: true,
    travellers: indexFields.travellersLabel,
  });

  return {
    booking:
      updated || {
        ...params.booking,
        ...indexFields,
        detailPayloadStorageKey: detailSave.manifestKey,
        detailSaved: true,
        detailStorageKey: detailSave.manifestKey,
        hasChunkedDetail: true,
        payloadStorageKey: detailSave.manifestKey,
        smartPlannerDetailSaved: true,
        travellers: indexFields.travellersLabel,
      },
    detailSave,
  };
}

export default function PlannerConfirmationPageShell() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [data, setData] = useState<PlannerConfirmationPayload | null>(null);
  const [detailSaveWarning, setDetailSaveWarning] = useState("");
  const [savedBooking, setSavedBooking] = useState<BookingItem | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
    try {
    const loaded = loadConfirmation();
    if (!loaded) return;
    const rawSources = loadRawConfirmationSources();
    const initialFullPlannerBookingPayload = buildSmartPlannerBookingPayload({
      bookingId:
        text(loaded.bookingId) ||
        text(asRecord(loaded.bookingMeta).bookingId) ||
        text(asRecord(loaded.payment).bookingId) ||
        buildBookingId(),
      earnedCreditAmount: getNumber(
        loaded.earnedCreditAmount,
        asRecord(asRecord(loaded.fare).walletBreakdown).earnedOnThisBooking
      ),
      parsed: loaded as Record<string, any>,
      rawBookingDraftPayload: rawSources.bookingDraftRaw,
      rawCheckoutPayload: rawSources.checkoutRaw,
      rawConfirmationPayload: rawSources.confirmationRaw,
      rawPaymentPayload: rawSources.paymentRaw,
    });
    const parsed = normalizeConfirmation(initialFullPlannerBookingPayload) || loaded;
    setData(parsed);
    const normalized = normalizeSmartPlannerBooking({ payload: parsed });

    const summary = asRecord(parsed.summary);
    const traveller = asRecord(parsed.traveller);
    const payment = asRecord(parsed.payment);
    const fare = asRecord(parsed.fare);
    const leadTraveller = asRecord(parsed.leadTraveller);
    const travellers = safeArray(traveller.travellers);
    const contact = asRecord(traveller.contactDetails);
    const mobile = normalizeMobile(leadTraveller.mobile || contact.mobile);
    const email = text(leadTraveller.email) || text(contact.email);
    const leadName = travellerName(leadTraveller, travellers);
    const title = `${normalized.tripTitle || text(summary.packageTitle) || "Smart Planner Trip"}${
      normalized.routeLabel ? ` • ${normalized.routeLabel}` : ""
    }`;
    const routeLabel = normalized.routeLabel || routeLabelForBooking(summary.route);
    const travelDate =
      normalized.travelDate ||
      text(summary.travelDate) ||
      text(asRecord(parsed.itinerary).travelDate) ||
      text(payment.paidAt) ||
      new Date().toISOString();
    const totalAmount = getNumber(normalized.finalPaidAmount, payment.amountPaid, fare.finalPayableAmount, fare.grandTotal);
    const travellerCount = resolveTravellerCount(
      travellers,
      traveller,
      parsed.travellers,
      asRecord(parsed.smartPlannerPayload).travellers,
      asRecord(parsed.smartPlannerPayload).travellerDetails,
      payment,
      summary
    );
    const durationForIndex =
      validDurationText(text(summary.durationLabel)) ||
      validDurationText(normalized.durationLabel) ||
      durationLabel(asRecord(parsed.smartPlannerPayload), summary, safeArray(asRecord(parsed.itinerary).dayPlans));
    const safePaidAt = text(payment.paidAt) || travelDate;
    const leadIdentity = `${leadName}_${email}`.replace(/\s+/g, "_").replace(/[^\w-]/g, "");
    const legacyPayloadStorageKey = `tpl_booking_payload_smart_planner_${safePaidAt}_${mobile}_${leadIdentity}_${title}`.replace(/\s+/g, "_").replace(/[^\w-]/g, "");
    const saveGuardKey = `smart_planner_booking_saved_${safePaidAt}_${mobile}_${leadIdentity}_${title}`.replace(/\s+/g, "_").replace(/[^\w-]/g, "");
    const earnedAmount = getNumber(parsed.earnedCreditAmount, asRecord(fare.walletBreakdown).earnedOnThisBooking);

    if (!mobile) {
      setData(parsed);
      writeStorageJSON(PLANNER_CONFIRMATION_KEY, initialFullPlannerBookingPayload);
      return;
    }

    seedAccountAndTravellerSafely({
      email,
      mobile,
      source: "package",
      traveller: {
        dob: text(travellers[0]?.dob) || text(travellers[0]?.dateOfBirth),
        email,
        firstName: text(travellers[0]?.firstName),
        gender: text(travellers[0]?.gender),
        lastName: text(travellers[0]?.lastName),
        mobile,
        name: leadName,
        nationality: text(travellers[0]?.nationality) || "Indian",
      },
    });

    const existingBooking = findSmartPlannerBookingForConfirmation({
      amount: totalAmount,
      email,
      legacyPayloadStorageKey,
      mobile,
      title,
      travelDate,
    });

    if (existingBooking) {
      const fullPlannerBookingPayload = buildSmartPlannerBookingPayload({
        bookingId: existingBooking.id,
        earnedCreditAmount: earnedAmount,
        parsed: parsed as Record<string, any>,
        rawBookingDraftPayload: rawSources.bookingDraftRaw,
        rawCheckoutPayload: rawSources.checkoutRaw,
        rawConfirmationPayload: rawSources.confirmationRaw,
        rawPaymentPayload: rawSources.paymentRaw,
      });
      if (process.env.NODE_ENV !== "production") {
        console.info(
          "[SmartPlanner] booking payload completeness",
          getSmartPlannerPayloadCompleteness(fullPlannerBookingPayload)
        );
      }
      const { booking: updatedBooking, detailSave } = saveSmartPlannerChunkedDetail({
        booking: existingBooking,
        durationLabel: durationForIndex,
        fullPlannerBookingPayload,
        invoiceNo: text(parsed.invoiceNumber),
        paymentId: text(payment.paymentId) || text(parsed.paymentId),
        routeLabel,
        title,
        totalAmount,
        travelDate,
        travellerCount,
      });
      setSavedBooking(updatedBooking);
      if (!detailSave.ok) {
        setDetailSaveWarning(detailSave.warning || "Detailed booking could not be saved.");
      }
      if (detailSave.warning) setDetailSaveWarning(detailSave.warning);
      createGuestUserFromBooking({ email, mobile, name: leadName });
      creditEarned({ bookingId: existingBooking.id, earnedAmount, mobile });
      markSessionGuard(saveGuardKey);
      setData(normalizeConfirmation(fullPlannerBookingPayload) || parsed);
      writeStorageJSON(PLANNER_CONFIRMATION_KEY, fullPlannerBookingPayload);
      if (detailSave.ok) {
        resetSmartPlannerWorkingSession({ preserveConfirmation: true });
      }
      return;
    }

    if (!sessionStorage.getItem(saveGuardKey)) {
      const newBookingRecord = {
        amount: totalAmount,
        bookingStatus: "confirmed",
        detailRoute: "/account/bookings/smart-planner",
        leadTraveller: {
          email,
          mobile,
          name: leadName,
        },
        mobile,
        payloadStorageKey: legacyPayloadStorageKey,
        paymentStatus: "paid",
        routeLabel,
        serviceType: "smart-planner",
        status: "upcoming" as const,
        ticketType: "smart-planner" as const,
        title,
        travelDate,
        travellerCount,
        travellers: `${travellerCount} Traveller${travellerCount > 1 ? "s" : ""}`,
        travellersLabel: `${travellerCount} Traveller${travellerCount > 1 ? "s" : ""}`,
        type: "smart-planner" as const,
      };
      const newBooking = addBooking({
        ...newBookingRecord,
      });
      const fullPlannerBookingPayload = buildSmartPlannerBookingPayload({
        bookingId: newBooking.id,
        earnedCreditAmount: earnedAmount,
        parsed: parsed as Record<string, any>,
        rawBookingDraftPayload: rawSources.bookingDraftRaw,
        rawCheckoutPayload: rawSources.checkoutRaw,
        rawConfirmationPayload: rawSources.confirmationRaw,
        rawPaymentPayload: rawSources.paymentRaw,
      });
      if (process.env.NODE_ENV !== "production") {
        console.info(
          "[SmartPlanner] booking payload completeness",
          getSmartPlannerPayloadCompleteness(fullPlannerBookingPayload)
        );
      }
      const { booking: bookingWithDetailKey, detailSave: savedDetail } = saveSmartPlannerChunkedDetail({
        booking: newBooking,
        durationLabel: durationForIndex,
        fullPlannerBookingPayload,
        invoiceNo: text(parsed.invoiceNumber),
        paymentId: text(payment.paymentId) || text(parsed.paymentId),
        routeLabel,
        title,
        totalAmount,
        travelDate,
        travellerCount,
      });
      if (savedDetail.warning) setDetailSaveWarning(savedDetail.warning);
      if (!savedDetail.ok) {
        setDetailSaveWarning(savedDetail.warning || "Detailed booking could not be saved.");
      }
      createGuestUserFromBooking({ email, mobile, name: leadName });
      creditEarned({ bookingId: newBooking.id, earnedAmount, mobile });
      markSessionGuard(saveGuardKey);
      setSavedBooking(bookingWithDetailKey);
      setData(normalizeConfirmation(fullPlannerBookingPayload) || parsed);
      writeStorageJSON(PLANNER_CONFIRMATION_KEY, fullPlannerBookingPayload);
      if (savedDetail.ok) {
        resetSmartPlannerWorkingSession({ preserveConfirmation: true });
      }
      return;
    }

    createGuestUserFromBooking({ email, mobile, name: leadName });
    const guardedBooking = findSmartPlannerBookingForConfirmation({
      amount: totalAmount,
      email,
      legacyPayloadStorageKey,
      mobile,
      title,
      travelDate,
    });
    if (guardedBooking) {
      const fullPlannerBookingPayload = buildSmartPlannerBookingPayload({
        bookingId: guardedBooking.id,
        earnedCreditAmount: earnedAmount,
        parsed: parsed as Record<string, any>,
        rawBookingDraftPayload: rawSources.bookingDraftRaw,
        rawCheckoutPayload: rawSources.checkoutRaw,
        rawConfirmationPayload: rawSources.confirmationRaw,
        rawPaymentPayload: rawSources.paymentRaw,
      });
      const { booking: updatedBooking, detailSave } = saveSmartPlannerChunkedDetail({
        booking: guardedBooking,
        durationLabel: durationForIndex,
        fullPlannerBookingPayload,
        invoiceNo: text(parsed.invoiceNumber),
        paymentId: text(payment.paymentId) || text(parsed.paymentId),
        routeLabel,
        title,
        totalAmount,
        travelDate,
        travellerCount,
      });
      if (detailSave.warning) setDetailSaveWarning(detailSave.warning);
      if (!detailSave.ok) {
        setDetailSaveWarning(detailSave.warning || "Detailed booking could not be saved.");
      }
      if (parsed.bookingId) {
        creditEarned({ bookingId: parsed.bookingId, earnedAmount, mobile });
      }
      setSavedBooking(updatedBooking);
      setData(normalizeConfirmation(fullPlannerBookingPayload) || parsed);
      writeStorageJSON(PLANNER_CONFIRMATION_KEY, fullPlannerBookingPayload);
      if (detailSave.ok) {
        resetSmartPlannerWorkingSession({ preserveConfirmation: true });
      }
      return;
    }
    setData(parsed);
    writeStorageJSON(PLANNER_CONFIRMATION_KEY, initialFullPlannerBookingPayload);
    } catch (error) {
      const fallback = loadConfirmation();
      if (fallback) {
        setData(fallback);
        setDetailSaveWarning(
          error instanceof Error
            ? error.message
            : "My Bookings save failed, but confirmation data is available."
        );
      }
    }
    });
  }, []);

  const bookingId = useMemo(() => savedBooking?.id || data?.bookingId || buildBookingId(), [data?.bookingId, savedBooking?.id]);
  const paymentId = useMemo(() => text(asRecord(data?.payment).paymentId) || data?.paymentId || buildPaymentId(), [data?.payment, data?.paymentId]);
  const invoiceNumber = useMemo(() => data?.invoiceNumber || buildInvoiceId(), [data?.invoiceNumber]);

  if (!data) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#eef3f8]">
        <div className="rounded-xl border bg-white p-6 font-semibold">
          No Smart Planner confirmation data found.
        </div>
      </main>
    );
  }

  const summary = asRecord(data.summary);
  const traveller = asRecord(data.traveller);
  const payment = asRecord(data.payment);
  const fare = asRecord(data.fare);
  const plannerFareSummary = data.plannerFareSummary || normalizePlannerFareSummary(fare.plannerFareSummary);
  const plannerFareRecord = plannerFareSummary ? plannerFareSummaryToFare(plannerFareSummary) : null;
  const leadTraveller = asRecord(data.leadTraveller);
  const smartPayload = asRecord(data.smartPlannerPayload);
  const basket = safeArray(summary.selectedBasketItems).length
    ? safeArray(summary.selectedBasketItems)
    : safeArray(smartPayload.selectedBasketItems);
  const travellers = safeArray(traveller.travellers);
  const displayDayPlans = safeArray(asRecord(data.itinerary).dayPlans).length
    ? safeArray(asRecord(data.itinerary).dayPlans)
    : itineraryDays(smartPayload);
  const displayDuration =
    validDurationText(summary.durationLabel) ||
    durationLabel(
      smartPayload,
      summary,
      displayDayPlans,
      data.routeData,
      data.selectedRouteVariant,
      data.selectedRoute
    );
  const displayTotalTravellers = resolveTravellerCount(
    travellers,
    traveller,
    data.travellers,
    smartPayload.travellers,
    smartPayload.travellerDetails,
    smartPayload.passengers,
    smartPayload.guestDetails,
    asRecord(smartPayload.trip).travellers,
    payment,
    summary
  );
  const earnedAmount = getNumber(
    plannerFareSummary?.earnedCreditAmount,
    data.earnedCreditAmount,
    asRecord(plannerFareRecord?.walletBreakdown || fare.walletBreakdown).earnedOnThisBooking
  );

  const handlePrint = () => window.print();

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#eef3f8] text-black">
      <div className="mx-auto max-w-7xl px-3 pt-4 lg:hidden">
        <MobileInnerBack title="Back" />
      </div>

      <div className="mt-4 border-b border-green-200 bg-green-50 px-4 py-4 text-center lg:mt-0">
        <div className="text-base font-black text-green-700 sm:text-lg">
          Smart Planner Booking Confirmed
        </div>
        <div className="text-sm text-green-600">
          Your Smart Planner trip booking is successfully confirmed.
        </div>
        {earnedAmount > 0 ? (
          <div className="mt-2 text-sm font-bold leading-5 text-green-700">
            You earned ₹{earnedAmount.toLocaleString("en-IN")} TPL Earned Credit on this booking.
          </div>
        ) : null}
      </div>

      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-3 py-4 sm:px-4 lg:flex-row lg:gap-4 lg:py-6">
        <div className="flex min-w-0 flex-col gap-4 lg:w-[72%]">
          <PlannerConfirmationSuccessHeader
            bookedAt={text(payment.paidAt)}
            bookingId={bookingId}
            bookingStatus={text(data.bookingStatus) || "confirmed"}
            paymentStatus={text(payment.paymentActionState) === "success" ? "paid" : "paid"}
            route={summary.route as string[] | string}
            title={text(summary.packageTitle) || "Smart Planner Trip"}
            travelDate={text(summary.travelDate)}
          />

          <PlannerConfirmationSaveToBookings bookingId={savedBooking?.id || data.bookingId} saved={Boolean(savedBooking || data.bookingId)} />

          <PlannerConfirmationTripSummary
            basketCount={basket.length}
            duration={displayDuration}
            route={summary.route as string[] | string}
            title={text(summary.packageTitle) || "Smart Planner Trip"}
            totalTravellers={displayTotalTravellers}
            travelDate={text(summary.travelDate)}
          />

          <PlannerConfirmationTravellerCard
            contactDetails={asRecord(traveller.contactDetails)}
            leadTraveller={leadTraveller}
            travellers={travellers}
          />

          <PlannerConfirmationBasketCard items={basket} />

          <PlannerConfirmationItineraryCard
            days={displayDayPlans}
            selectedBasketItems={basket}
          />

          <PlannerConfirmationFareCard
            appliedCoupon={text(plannerFareRecord?.appliedCoupon) || text(fare.appliedCoupon)}
            baseAfterOffer={getNumberOrUndefined(plannerFareRecord?.baseAfterOffer, fare.baseAfterOffer)}
            basePrice={getNumber(plannerFareRecord?.basePrice, fare.basePrice)}
            bookingId={bookingId}
            couponDiscount={getNumber(plannerFareRecord?.couponDiscount, fare.couponDiscount)}
            earnedOnThisBooking={earnedAmount}
            feesAndTaxes={getNumberOrUndefined(plannerFareRecord?.feesAndTaxes, fare.feesAndTaxes)}
            finalAmount={getNumber(plannerFareRecord?.finalPayableAmount, fare.finalPayableAmount, payment.amountPaid, fare.grandTotal)}
            invoiceNumber={invoiceNumber}
            paidAt={text(payment.paidAt)}
            paymentId={paymentId}
            paymentMethod={text(payment.selectedPaymentMethod)}
            paymentStatus="paid"
            tplCreditUsed={getNumber(plannerFareRecord?.tplCreditUsed, fare.tplCreditUsed)}
            totalBeforeWallet={getNumberOrUndefined(plannerFareRecord?.totalBeforeWallet, fare.totalBeforeWallet)}
            totalTravellers={displayTotalTravellers}
            walletCalc={asRecord(plannerFareRecord?.walletBreakdown || fare.walletBreakdown)}
          />
        </div>

        <div className="min-w-0 lg:w-[28%]">
          <PlannerConfirmationActionsCard
            bookingId={bookingId}
            email={text(leadTraveller.email) || text(asRecord(traveller.contactDetails).email)}
            invoiceNumber={invoiceNumber}
            mobile={text(leadTraveller.mobile) || text(asRecord(traveller.contactDetails).mobile)}
            onDownload={handlePrint}
            onGoHome={() => router.push("/")}
            onGoToMyBookings={() => {
              if (isAuthenticated) {
                router.push("/account/bookings");
                return;
              }
              setShowLoginModal(true);
            }}
            onManageBooking={() => alert("Smart Planner manage booking will be available soon.")}
            onPrint={handlePrint}
            onShare={() => {
              if (navigator.share) {
                navigator.share({
                  text: `Smart Planner booking confirmed: ${bookingId}`,
                  title: "Smart Planner Booking Confirmed",
                });
                return;
              }
              navigator.clipboard?.writeText(`Smart Planner booking confirmed: ${bookingId}`);
            }}
            paymentId={paymentId}
          />
        </div>
      </div>

      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </main>
  );
}
