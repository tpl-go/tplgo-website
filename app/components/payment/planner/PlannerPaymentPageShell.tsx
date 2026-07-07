"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import LoginModal from "@/app/components/common/LoginModal";
import MobileInnerBack from "@/app/components/common/mobile/MobileInnerBack";
import PaymentOptionSection from "@/app/components/payment/packages/PaymentOptionSection";
import PlannerPaymentAddOnsCard from "@/app/components/payment/planner/PlannerPaymentAddOnsCard";
import PlannerPaymentPriceCard from "@/app/components/payment/planner/PlannerPaymentPriceCard";
import PlannerPaymentTopSummary from "@/app/components/payment/planner/PlannerPaymentTopSummary";
import { applyPaymentMethod } from "@/app/data/booking/applyPaymentMethod";
import {
  handlePaymentFailure,
  handlePaymentSuccess,
} from "@/app/data/booking/completePaymentProcess";
import { confirmBooking } from "@/app/data/booking/confirmBooking";
import { expireBooking } from "@/app/data/booking/expireBooking";
import { startPaymentProcess } from "@/app/data/booking/startPaymentProcess";
import { AUTH_UPDATED_EVENT } from "@/app/lib/booking/guestAuth";
import {
  confirmSmartPlannerBackendCheckout,
  startSmartPlannerBackendCheckout,
  type SmartPlannerBackendCheckoutRefs,
} from "@/app/lib/api/smartPlannerCheckoutIntegration";
import {
  buildPlannerFareSummary,
  normalizePlannerFareSummary,
  plannerFareSummaryToFare,
  type PlannerFareSummary,
} from "@/app/lib/ecosystem/planner/plannerPricing";
import {
  compactPlannerDetailRecord,
  readPlannerDetailPayload,
  savePlannerDetailPayload,
} from "@/app/lib/ecosystem/planner/plannerPayloadStorage";
import { logSmartPlannerStorageWrite } from "@/app/lib/ecosystem/planner/booking/smartPlannerStorageWriteAudit";
import { applyBenefitPricing } from "@/app/lib/pricing/applyBenefitPricing";
import {
  addWalletLedgerItem,
  getWallet,
  saveWallet,
  type Wallet,
} from "@/app/lib/wallet/walletStorage";

const PLANNER_BOOKING_DRAFT_KEY = "tpl_tiya_planner_booking_draft_v1";
const CHECKOUT_PAYLOAD_KEY = "tpl_tiya_checkout_v1";
const REVIEW_DRAFT_KEY = "tpl_tiya_review_draft_v1";
const PAYMENT_LEAD_TRAVELLER_KEY = "tplPaymentLeadTraveller";
const PLANNER_PAYMENT_KEY = "tpl_tiya_planner_payment_v1";
const PLANNER_CONFIRMATION_KEY = "tpl_tiya_planner_confirmation_v1";

type RecordValue = Record<string, unknown>;

type PlannerPaymentReview = {
  addOn?: RecordValue;
  cancellation?: RecordValue;
  fare?: RecordValue;
  itinerary?: RecordValue;
  plannerFareSummary?: PlannerFareSummary | null;
  smartPlannerPayload?: RecordValue;
  source?: string;
  summary?: RecordValue;
  traveller?: RecordValue;
};

type ActiveUser = {
  email?: string;
  mobile?: string;
  name?: string;
  phone?: string;
};

function asRecord(value: unknown): RecordValue {
  return typeof value === "object" && value !== null ? (value as RecordValue) : {};
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
      return readPlannerDetailPayload(parsed.detailStorageKey) || parsed;
    }
    return parsed;
  } catch {
    return null;
  }
}

function writeStorageJSON(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  const isPlannerDurableKey =
    key === PLANNER_PAYMENT_KEY || key === PLANNER_CONFIRMATION_KEY;

  if (isPlannerDurableKey) {
    const detail = savePlannerDetailPayload(
      `${key}_${Date.now()}`.replace(/[^\w-]/g, "_"),
      value
    );
    const compact = compactPlannerDetailRecord(detail.key || undefined, {
      key,
      savedAt: new Date().toISOString(),
    });
    const compactSerialized = JSON.stringify(compact);

    try {
      logSmartPlannerStorageWrite({
        file: "app/components/payment/planner/PlannerPaymentPageShell.tsx",
        functionName: "writeStorageJSON:durable",
        key,
        payload: compact,
        serialized: compactSerialized,
        storageType: "sessionStorage",
        successOrFailed: "attempt",
      });
      window.sessionStorage.setItem(key, compactSerialized);
      logSmartPlannerStorageWrite({
        file: "app/components/payment/planner/PlannerPaymentPageShell.tsx",
        functionName: "writeStorageJSON:durable",
        key,
        payload: compact,
        serialized: compactSerialized,
        storageType: "sessionStorage",
        successOrFailed: "success",
      });
    } catch (error) {
      logSmartPlannerStorageWrite({
        error,
        file: "app/components/payment/planner/PlannerPaymentPageShell.tsx",
        functionName: "writeStorageJSON:durable",
        key,
        payload: compact,
        serialized: compactSerialized,
        storageType: "sessionStorage",
        successOrFailed: "failed",
      });
      // localStorage/sessionStorage fallback below still keeps the detail pointer.
    }
    try {
      logSmartPlannerStorageWrite({
        file: "app/components/payment/planner/PlannerPaymentPageShell.tsx",
        functionName: "writeStorageJSON:durable",
        key,
        payload: compact,
        serialized: compactSerialized,
        storageType: "localStorage",
        successOrFailed: "attempt",
      });
      window.localStorage.setItem(key, compactSerialized);
      logSmartPlannerStorageWrite({
        file: "app/components/payment/planner/PlannerPaymentPageShell.tsx",
        functionName: "writeStorageJSON:durable",
        key,
        payload: compact,
        serialized: compactSerialized,
        storageType: "localStorage",
        successOrFailed: "success",
      });
    } catch (error) {
      logSmartPlannerStorageWrite({
        error,
        file: "app/components/payment/planner/PlannerPaymentPageShell.tsx",
        functionName: "writeStorageJSON:durable",
        key,
        payload: compact,
        serialized: compactSerialized,
        storageType: "localStorage",
        successOrFailed: "failed",
      });
      // The full payload is already chunked; compact mirror is best effort.
    }
    return;
  }

  try {
    const serialized = JSON.stringify(value);
    logSmartPlannerStorageWrite({
      file: "app/components/payment/planner/PlannerPaymentPageShell.tsx",
      functionName: "writeStorageJSON",
      key,
      payload: value,
      serialized,
      storageType: "sessionStorage",
      successOrFailed: "attempt",
    });
    window.sessionStorage.setItem(key, serialized);
    logSmartPlannerStorageWrite({
      file: "app/components/payment/planner/PlannerPaymentPageShell.tsx",
      functionName: "writeStorageJSON",
      key,
      payload: value,
      serialized,
      storageType: "sessionStorage",
      successOrFailed: "success",
    });
  } catch (error) {
    logSmartPlannerStorageWrite({
      error,
      file: "app/components/payment/planner/PlannerPaymentPageShell.tsx",
      functionName: "writeStorageJSON",
      key,
      payload: value,
      storageType: "sessionStorage",
      successOrFailed: "failed",
    });
    // Session storage can be unavailable in restricted browser modes.
  }
}

function getActiveUser(): ActiveUser | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem("tpl_auth_session_v1");
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed?.user || null;
  } catch {
    return null;
  }
}

function getNumber(...values: unknown[]) {
  for (const value of values) {
    const number = Number(value || 0);
    if (Number.isFinite(number) && number > 0) return number;
  }

  return 0;
}

function buildPlannerBookingId() {
  return `TPL-SP-${Date.now().toString().slice(-6)}`;
}

function buildPlannerPaymentId() {
  return `TPL-SP-PAY-${Date.now().toString().slice(-6)}`;
}

function buildPlannerInvoiceId() {
  return `TPL-SP-INV-${Date.now().toString().slice(-6)}`;
}

function safeArray(value: unknown): RecordValue[] {
  return Array.isArray(value)
    ? value.filter((item): item is RecordValue => typeof item === "object" && item !== null)
    : [];
}

function basketItemValue(item: unknown) {
  const record = asRecord(item);
  return getNumber(
    record.total,
    record.totalPrice,
    record.estimatedTotal,
    record.estimatedPrice,
    record.price,
    record.value,
    record.amount,
    record.cost,
    record.fare,
    record.unitPrice
  );
}

function getSelectedBasketItems(record: RecordValue, payload: RecordValue) {
  const direct = safeArray(record.selectedBasketItems);
  if (direct.length) return direct;

  const payloadItems = safeArray(payload.selectedBasketItems);
  if (payloadItems.length) return payloadItems;

  const checkoutPayload = asRecord(record.checkoutPayload);
  const checkoutItems = safeArray(checkoutPayload.selectedBasketItems);
  if (checkoutItems.length) return checkoutItems;

  const reviewPayload = asRecord(record.reviewPayload);
  return safeArray(reviewPayload.selectedBasketItems);
}

function inclusiveDateDays(startValue: unknown, endValue: unknown) {
  if (!startValue || !endValue) return 0;

  const start = new Date(String(startValue));
  const end = new Date(String(endValue));
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0;

  const diff = end.getTime() - start.getTime();
  if (diff < 0) return 0;

  return Math.floor(diff / 86_400_000) + 1;
}

function getPlannerDuration(payload: RecordValue) {
  const trip = asRecord(payload.trip);
  const durationLabel = String(trip.durationLabel || trip.duration || "");
  if (durationLabel && !/\b0\s*d\b/i.test(durationLabel)) return durationLabel;

  const itinerary = Array.isArray(payload.itinerary)
    ? payload.itinerary
    : safeArray(asRecord(payload.itinerary).days);
  if (itinerary.length > 0) {
    return `${Math.max(itinerary.length - 1, 0)}N / ${itinerary.length}D`;
  }

  const totalDays = getNumber(trip.totalDays, trip.durationDays, trip.days);
  if (totalDays > 0) return `${Math.max(totalDays - 1, 0)}N / ${totalDays}D`;

  const dateDays = inclusiveDateDays(
    trip.startDate || asRecord(trip.dateRange).start,
    trip.endDate || asRecord(trip.dateRange).end
  );
  if (dateDays > 0) return `${Math.max(dateDays - 1, 0)}N / ${dateDays}D`;

  return "Duration not available";
}

function getLeadTraveller() {
  const parsed = asRecord(readStorageJSON(PAYMENT_LEAD_TRAVELLER_KEY));
  const contactDetails = asRecord(parsed.contactDetails);

  return {
    email: String(parsed.email || contactDetails.email || ""),
    mobile: String(parsed.mobile || contactDetails.mobile || ""),
    name: String(parsed.name || ""),
  };
}

function getAuthFallbackContact() {
  const user = getActiveUser();
  return {
    email: String(user?.email || ""),
    mobile: String(user?.mobile || user?.phone || ""),
    name: String(user?.name || ""),
  };
}

function splitFullName(name: unknown) {
  const fullName = String(name || "").trim();
  if (!fullName) return { firstName: "", lastName: "" };

  const parts = fullName.split(/\s+/);
  return {
    firstName: parts[0] || "",
    lastName: parts.slice(1).join(" "),
  };
}

function normalizeTravellerItem(value: unknown, index: number, contact: RecordValue) {
  const record = asRecord(value);
  const fullName = String(
    record.fullName ||
      record.name ||
      [record.firstName, record.lastName].filter(Boolean).join(" ")
  ).trim();
  const split = splitFullName(fullName);

  return {
    age: record.age ? String(record.age) : "",
    email: String(record.email || (index === 0 ? contact.email || "" : "")),
    firstName: String(record.firstName || split.firstName),
    fullName,
    gender: String(record.gender || ""),
    id: String(record.id || `traveller-${index + 1}`),
    label: String(record.label || `Traveller ${index + 1}`),
    lastName: String(record.lastName || split.lastName),
    mobile: String(record.mobile || (index === 0 ? contact.mobile || "" : "")),
    notes: String(record.notes || ""),
    roomLabel: String(record.roomLabel || record.room || ""),
    travellerType: String(record.travellerType || record.type || "Adult"),
  };
}

function firstNonEmptyRecord(...records: unknown[]) {
  for (const value of records) {
    const record = asRecord(value);
    if (Object.keys(record).length) return record;
  }

  return {};
}

function normalizeTravellerPayload(record: RecordValue, payload: RecordValue) {
  const travellerRecord = asRecord(record.traveller);
  const payloadTravellers = asRecord(payload.travellers);
  const leadStorage = asRecord(readStorageJSON(PAYMENT_LEAD_TRAVELLER_KEY));
  const leadStorageContact = asRecord(leadStorage.contactDetails);
  const authFallback = getAuthFallbackContact();
  const leadFromPayload = firstNonEmptyRecord(
    record.leadTraveller,
    payload.leadTraveller,
    payloadTravellers.leadTraveller,
    leadStorage
  );
  const contact = firstNonEmptyRecord(
    record.contactDetails,
    asRecord(record.travellerPayload).contactDetails,
    travellerRecord.contactDetails,
    payload.contactDetails,
    payloadTravellers.contactDetails,
    leadStorageContact
  );
  const email = String(
    contact.email ||
      leadFromPayload.email ||
      leadStorage.email ||
      authFallback.email ||
      ""
  );
  const mobile = String(
    contact.mobile ||
      leadFromPayload.mobile ||
      leadStorage.mobile ||
      authFallback.mobile ||
      ""
  );
  const countryCode = String(contact.countryCode || leadStorageContact.countryCode || "+91");
  const travellerSources = [
    record.travellerDetails,
    asRecord(record.travellerPayload).travellers,
    travellerRecord.travellers,
    payload.travellerDetails,
    payloadTravellers.details,
    payloadTravellers.travellers,
    record.travellers,
    leadStorage.travellers,
  ];
  const travellersSource =
    travellerSources.find((source) => Array.isArray(source) && source.length > 0) || [];
  const contactDetails = {
    countryCode,
    email,
    mobile,
  };
  const travellers = safeArray(travellersSource).map((item, index) =>
    normalizeTravellerItem(item, index, contactDetails)
  );

  if (!travellers.length) {
    const leadName = String(
      leadFromPayload.name || authFallback.name || leadStorage.name || "Lead Traveller"
    );
    travellers.push(
      normalizeTravellerItem(
        {
          ...leadFromPayload,
          email,
          fullName: leadName,
          mobile,
        },
        0,
        contactDetails
      )
    );
  }

  return {
    allRequiredTravellersCompleted: Boolean(email && mobile && travellers[0]?.fullName),
    canProceed: Boolean(email && mobile && travellers[0]?.fullName),
    contactDetails,
    gstDetails:
      asRecord(travellerRecord.gstDetails) ||
      asRecord(record.gstDetails) ||
      asRecord(payload.gstDetails),
    travellers,
  };
}

function packageReviewFromPlannerDraft(value: unknown): PlannerPaymentReview | null {
  const record = asRecord(value);
  const payloadCandidate = record.payload || record.reviewPayload || record.checkoutPayload || value;
  const payloadCandidateRecord = asRecord(payloadCandidate);
  const detailStorageKey =
    typeof payloadCandidateRecord.detailStorageKey === "string"
      ? payloadCandidateRecord.detailStorageKey
      : typeof record.detailStorageKey === "string"
        ? record.detailStorageKey
        : typeof record.fullDetailStorageKey === "string"
          ? record.fullDetailStorageKey
          : "";
  const detailPayload = detailStorageKey
    ? asRecord(readPlannerDetailPayload(detailStorageKey))
    : {};
  const detailDraft = asRecord(detailPayload.draft);
  const payload = asRecord(
    detailPayload.checkoutPayload ||
      detailDraft.payload ||
      detailPayload.smartPlannerPayload ||
      payloadCandidate
  );
  const basket = getSelectedBasketItems(record, payload);
  const savedPlannerFareSummary =
    normalizePlannerFareSummary(record.plannerFareSummary) ||
    normalizePlannerFareSummary(payload.plannerFareSummary) ||
    normalizePlannerFareSummary(asRecord(record.fare).plannerFareSummary);

  if (!basket.length && !Object.keys(payload).length) return null;

  const totalBasketValue =
    getNumber(
      savedPlannerFareSummary?.selectedBasketValue,
      record.totalBasketValue,
      record.selectedBasketValue,
      payload.selectedBasketValue
    ) ||
    basket.reduce((sum, item) => sum + basketItemValue(item), 0) ||
    getNumber(
      asRecord(payload.quoteEstimate).total,
      asRecord(payload.quoteEstimate).amount,
      payload.quoteEstimate,
      asRecord(payload.budgetEstimate).selectedBasketValue
    );
  const trip = asRecord(payload.trip);
  const routeRecord = asRecord(payload.route);
  const routeStops = safeArray(routeRecord.stops)
    .map((stop) => String(stop.city || stop.name || stop.title || ""))
    .filter(Boolean);
  const route = routeStops.length
    ? routeStops
    : [trip.origin, trip.destination].filter(Boolean);
  const durationLabel = getPlannerDuration(payload);
  const durationMatch = durationLabel.match(/(\d+)\s*N\s*\/\s*(\d+)\s*D/i);
  const parsedNights = durationMatch ? Number(durationMatch[1]) : 0;
  const parsedDays = durationMatch ? Number(durationMatch[2]) : 0;

  return {
    addOn: {
      isInternationalTrip: false,
      plannerAddOns: payload.selectedAddOns || payload.addOns || [],
      selectedInsurance: payload.selectedInsurance || [],
    },
    cancellation: { exclusions: [] },
    fare: savedPlannerFareSummary
      ? plannerFareSummaryToFare(savedPlannerFareSummary)
      : {
          appliedCoupon: "",
          basePrice: totalBasketValue,
          couponDiscount: 0,
          feesAndTaxes: 0,
          grandTotal: totalBasketValue,
          totalBeforeWallet: totalBasketValue,
          tplCreditUsed: 0,
          upgradedDiffTotal: 0,
          walletBreakdown: {},
        },
    itinerary: {
      dayPlans: payload.itinerary,
      travelDate: trip.startDate,
    },
    plannerFareSummary: savedPlannerFareSummary,
    smartPlannerPayload: payload,
    source: "smart-planner",
    summary: {
      days: parsedDays,
      durationLabel,
      includedActivityLabels: [],
      includedFlightLabels: [],
      includedHotelLabels: [],
      includedMealLabels: [],
      includedTransferLabels: [],
      isInternationalTrip: false,
      nights: parsedNights,
      originCity: trip.origin || route[0] || "",
      packageSlug: "smart-planner",
      packageTitle: trip.name || trip.title || "Smart Planner Trip",
      route,
      selectedBasketItems: basket,
      selectedVariant: {
        label: "Selected Smart Planner Basket",
        pricePerPerson: totalBasketValue,
      },
      totalAdults: getNumber(asRecord(payload.travellers).adults, asRecord(payload.travellers).total, 1),
      totalChildren: getNumber(asRecord(payload.travellers).children),
      totalRooms: getNumber(asRecord(payload.travellers).rooms, 1),
      travelDate: trip.startDate || "",
      variant: "withoutFlight",
    },
    traveller: normalizeTravellerPayload(record, payload),
  };
}

function loadPlannerPaymentReview(): PlannerPaymentReview | null {
  const plannerDraft = packageReviewFromPlannerDraft(
    readStorageJSON(PLANNER_BOOKING_DRAFT_KEY)
  );
  if (plannerDraft) return plannerDraft;

  const plannerPaymentHandoff = packageReviewFromPlannerDraft(
    readStorageJSON(PLANNER_PAYMENT_KEY)
  );
  if (plannerPaymentHandoff) return plannerPaymentHandoff;

  const checkout = packageReviewFromPlannerDraft({
    payload: readStorageJSON(CHECKOUT_PAYLOAD_KEY),
  });
  if (checkout) return checkout;

  return packageReviewFromPlannerDraft({
    payload: asRecord(readStorageJSON(REVIEW_DRAFT_KEY)).reviewPayload,
  });
}

function formatTimer(seconds: number) {
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

export default function PlannerPaymentPageShell() {
  const router = useRouter();
  const [bookingReview] = useState<PlannerPaymentReview | null>(() =>
    loadPlannerPaymentReview()
  );
  const [timeLeft, setTimeLeft] = useState(10 * 60);
  const [insuranceSelected] = useState(false);
  const [insuranceAmount] = useState(0);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [paymentActionState, setPaymentActionState] = useState<
    "idle" | "processing" | "success" | "failure"
  >("idle");
  const [leadTraveller] = useState(getLeadTraveller);
  const [activeUser, setActiveUser] = useState<ActiveUser | null>(null);
  const [wallet, setWallet] = useState<Wallet>({
    earnedCredit: 0,
    promoCredit: 0,
    refundableBalance: 0,
  });

  useEffect(() => {
    const syncUserWallet = () => {
      const user = getActiveUser();
      setActiveUser(user);

      if (user?.mobile) {
        setWallet(getWallet(user.mobile));
      } else {
        setWallet({
          earnedCredit: 0,
          promoCredit: 0,
          refundableBalance: 0,
        });
      }
    };

    syncUserWallet();

    window.addEventListener(AUTH_UPDATED_EVENT, syncUserWallet);
    window.addEventListener("storage", syncUserWallet);

    return () => {
      window.removeEventListener(AUTH_UPDATED_EVENT, syncUserWallet);
      window.removeEventListener("storage", syncUserWallet);
    };
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((current) => {
        if (current <= 1) {
          clearInterval(timer);
          expireBooking();
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const fareData = asRecord(bookingReview?.fare);
  const savedPlannerFareSummary = bookingReview?.plannerFareSummary || null;
  const summary = asRecord(bookingReview?.summary);
  const totalTravellers = Math.max(getNumber(summary.totalAdults, 1), 1);
  const baseFare = Number(
    savedPlannerFareSummary?.selectedBasketValue || fareData.basePrice || 0
  );
  const upgradedDiffTotal = 0;
  const taxes = Number(savedPlannerFareSummary?.taxesAndFees ?? fareData.feesAndTaxes ?? 0);
  const couponDiscount = Number(
    savedPlannerFareSummary?.offerDiscount ?? fareData.couponDiscount ?? 0
  );
  const appliedCoupon = String(
    (typeof savedPlannerFareSummary?.offerData?.code === "string"
      ? savedPlannerFareSummary.offerData.code
      : "") || fareData.appliedCoupon || ""
  );

  const benefitPricing = useMemo(
    () =>
      applyBenefitPricing({
        addOns: upgradedDiffTotal + (insuranceSelected ? insuranceAmount : 0),
        baseAmount: baseFare,
        earnedCredit: wallet.earnedCredit,
        offerDiscount: couponDiscount,
        promoCredit: wallet.promoCredit,
        refundWallet: wallet.refundableBalance,
        taxes,
      }),
    [
      baseFare,
      couponDiscount,
      insuranceAmount,
      insuranceSelected,
      taxes,
      upgradedDiffTotal,
      wallet,
    ]
  );

  const walletUsedTotal =
    benefitPricing.promoUsed + benefitPricing.earnedUsed + benefitPricing.refundUsed;
  const finalPlannerFareSummary = useMemo(
    () =>
      buildPlannerFareSummary({
        addOnsTotal: upgradedDiffTotal + (insuranceSelected ? insuranceAmount : 0),
        benefitPricing,
        earnedCreditAmount: savedPlannerFareSummary?.earnedCreditAmount,
        offerData: savedPlannerFareSummary?.offerData || null,
        selectedBasketValue: baseFare,
        taxesAndFees: taxes,
      }),
    [
      baseFare,
      benefitPricing,
      insuranceAmount,
      insuranceSelected,
      savedPlannerFareSummary,
      taxes,
      upgradedDiffTotal,
    ]
  );
  const finalFareRecord = plannerFareSummaryToFare(finalPlannerFareSummary);
  const finalPayableAmount = finalPlannerFareSummary.finalPayable;
  const basePackagePrice =
    finalPlannerFareSummary.baseAfterOffer +
    finalPlannerFareSummary.taxesAndFees +
    finalPlannerFareSummary.convenienceFee +
    finalPlannerFareSummary.addOnsTotal;
  const effectivePerPersonPrice =
    totalTravellers > 0
      ? Math.round(basePackagePrice / totalTravellers) +
        (insuranceSelected ? Math.round(insuranceAmount / totalTravellers) : 0)
      : 0;
  const earnedOnThisBooking = finalPlannerFareSummary.earnedCreditAmount;

  const handleMockPayment = async (shouldSucceed = true) => {
    if (!selectedPaymentMethod || !bookingReview) return;

    setPaymentActionState("processing");
    startPaymentProcess();

    await new Promise((resolve) => setTimeout(resolve, 1500));

    if (!shouldSucceed) {
      handlePaymentFailure();
      setPaymentActionState("failure");
      return;
    }

    const paymentId = buildPlannerPaymentId();
    const invoiceNumber = buildPlannerInvoiceId();
    const frontendBookingId = buildPlannerBookingId();
    let backendRefs: SmartPlannerBackendCheckoutRefs = {};
    let backendCheckoutPayload: Record<string, unknown> | null = null;

    try {
      const backendRawPayload = {
        addOn: {
          ...(bookingReview.addOn || {}),
          insuranceAmount,
          insuranceSelected,
        },
        bookingId: frontendBookingId,
        bookingReview,
        checkoutPayload: readStorageJSON(CHECKOUT_PAYLOAD_KEY),
        contactDetails: {
          email: leadTraveller.email,
          mobile: leadTraveller.mobile,
        },
        fare: {
          ...finalFareRecord,
          appliedCoupon,
          insuranceAmount,
          plannerFareSummary: finalPlannerFareSummary,
        },
        invoiceNumber,
        legacyFrontendId: frontendBookingId,
        leadTraveller,
        mobile: leadTraveller.mobile,
        payment: {
          amountPaid: finalPayableAmount,
          basePackagePrice,
          insuranceAmount,
          insuranceSelected,
          paymentId,
          paymentActionState: "success",
          selectedPaymentMethod,
          totalTravellers,
          walletUsed: walletUsedTotal,
        },
        paymentData: {
          amountPaid: finalPayableAmount,
          method: selectedPaymentMethod,
          paymentId,
          paymentStatus: "paid",
          totalPaid: finalPayableAmount,
        },
        plannerBookingDraft: readStorageJSON(PLANNER_BOOKING_DRAFT_KEY),
        plannerFareSummary: finalPlannerFareSummary,
        rawPaymentPayload: readStorageJSON(PLANNER_PAYMENT_KEY),
        reviewDraft: readStorageJSON(REVIEW_DRAFT_KEY),
        serviceType: "smart-planner",
        smartPlannerPayload: bookingReview.smartPlannerPayload || null,
        source: "smart-planner",
        summary: bookingReview.summary || null,
        timerLeft: timeLeft,
        traveller: bookingReview.traveller || null,
        walletBreakdown: finalFareRecord.walletBreakdown,
        workspaceReviewPayload: readStorageJSON(
          "tpl_tiya_workspace_review_payload_v1"
        ),
      };

      const backendStart = await startSmartPlannerBackendCheckout(
        backendRawPayload as Record<string, unknown>
      );
      backendRefs = backendStart.refs;
      backendCheckoutPayload = backendStart.payload;

      if (backendStart.attempted) {
        const updatedPaymentPayload = {
          ...backendStart.payload,
        };
        writeStorageJSON(PLANNER_PAYMENT_KEY, updatedPaymentPayload);
      }
    } catch {
      handlePaymentFailure();
      setPaymentActionState("failure");
      return;
    }

    const checkoutWalletBreakdown =
      (backendCheckoutPayload?.walletBreakdown as Record<string, unknown> | undefined) ||
      ((backendCheckoutPayload?.fare as Record<string, unknown> | undefined)
        ?.walletBreakdown as Record<string, unknown> | undefined);

    let confirmationPayload = {
      ...(backendCheckoutPayload || {}),
      ...backendRefs,
      addOn: {
        ...(bookingReview.addOn || {}),
        insuranceAmount,
        insuranceSelected,
      },
      bookingId:
        (backendCheckoutPayload?.bookingId as string | undefined) ||
        frontendBookingId,
      bookingStatus: "confirmed",
      cancellation: bookingReview.cancellation || null,
      contactDetails: {
        email: leadTraveller.email,
        mobile: leadTraveller.mobile,
      },
      earnedCreditAmount: earnedOnThisBooking,
      fare: {
        ...finalFareRecord,
        appliedCoupon,
        insuranceAmount,
        plannerFareSummary: finalPlannerFareSummary,
        walletBreakdown: {
          ...asRecord(finalFareRecord.walletBreakdown),
          ...(checkoutWalletBreakdown || {}),
        },
      },
      id:
        (backendCheckoutPayload?.id as string | undefined) ||
        frontendBookingId,
      itinerary: bookingReview.itinerary || null,
      invoiceNumber,
      legacyFrontendId:
        (backendCheckoutPayload?.legacyFrontendId as string | undefined) ||
        frontendBookingId,
      leadTraveller,
      mobile: leadTraveller.mobile,
      payment: {
        amountPaid: finalPayableAmount,
        basePackagePrice,
        insuranceAmount,
        insuranceSelected,
        paidAt: new Date().toISOString(),
        paymentId,
        paymentActionState: "success",
        selectedPaymentMethod,
        totalTravellers,
        walletUsed: walletUsedTotal,
      },
      plannerFareSummary: finalPlannerFareSummary,
      smartPlannerPayload: bookingReview.smartPlannerPayload || null,
      source: "smart-planner",
      summary: bookingReview.summary || null,
      traveller: bookingReview.traveller || null,
      walletBreakdown: checkoutWalletBreakdown || finalFareRecord.walletBreakdown,
    };

    if (backendRefs.backendCheckoutId) {
      try {
        const backendConfirm = await confirmSmartPlannerBackendCheckout(
          confirmationPayload as Record<string, unknown>
        );
        backendRefs = {
          ...backendRefs,
          ...backendConfirm.refs,
        };
        confirmationPayload = {
          ...confirmationPayload,
          ...backendConfirm.payload,
          ...backendRefs,
        };
      } catch {
        handlePaymentFailure();
        setPaymentActionState("failure");
        return;
      }
    }

    if (activeUser?.mobile && walletUsedTotal > 0) {
      const latestWallet = getWallet(activeUser.mobile);
      const nextWallet = {
        earnedCredit: Math.max(latestWallet.earnedCredit - benefitPricing.earnedUsed, 0),
        promoCredit: Math.max(latestWallet.promoCredit - benefitPricing.promoUsed, 0),
        refundableBalance: Math.max(
          latestWallet.refundableBalance - benefitPricing.refundUsed,
          0
        ),
      };

      saveWallet(nextWallet, activeUser.mobile);
      setWallet(nextWallet);

      [
        ["TPL Promo Credit Used", benefitPricing.promoUsed],
        ["TPL Earned Credit Used", benefitPricing.earnedUsed],
        ["Refund Wallet Used", benefitPricing.refundUsed],
      ].forEach(([title, amount]) => {
        if (Number(amount) <= 0 || !activeUser.mobile) return;

        addWalletLedgerItem(
          {
            amount: Number(amount),
            description: `${title} for Smart Planner payment`,
            title: String(title),
            type: "wallet_used",
          },
          activeUser.mobile
        );
      });
    }

    handlePaymentSuccess();
    confirmBooking();
    setPaymentActionState("success");

    writeStorageJSON(PLANNER_PAYMENT_KEY, confirmationPayload);
    writeStorageJSON(PLANNER_CONFIRMATION_KEY, confirmationPayload);
    router.push("/smart-planner/confirmation");
  };

  if (!bookingReview?.summary) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f5f7fb] text-black">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-lg font-semibold shadow-sm">
          Smart Planner payment data not found
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#eef3f8] text-black">
      <div
        className="h-auto min-h-[64px] px-4 py-3 lg:h-[72px] lg:px-7 lg:py-0"
        style={{
          alignItems: "center",
          background: "#ffffff",
          borderBottom: "1px solid #d9e2ec",
          display: "flex",
          gap: "12px",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            color: "#111827",
            fontSize: "clamp(22px, 6vw, 26px)",
            fontWeight: 900,
            letterSpacing: "-0.4px",
          }}
        >
          TPL
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 text-[13px] font-extrabold">
          <span className="inline-flex h-[30px] min-w-16 items-center justify-center rounded-full border border-[#d9e2ec] bg-white px-3 text-[#111827]">
            {formatTimer(timeLeft)}
          </span>
          <span className="inline-flex h-[30px] items-center justify-center rounded-full border border-[#d9e2ec] bg-white px-3 text-[#0f766e]">
            SAFE &amp; SECURED
          </span>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-3 pb-8 pt-4 sm:px-4 sm:py-6">
        <div className="mb-4 lg:hidden">
          <MobileInnerBack title="Back" />
        </div>

        <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,72%)_minmax(280px,28%)] lg:gap-[18px]">
          <div className="flex min-w-0 flex-col gap-4">
            <PlannerPaymentTopSummary
              addOnData={{
                ...(bookingReview.addOn || {}),
                insuranceAmount,
                insuranceSelected,
              }}
              bookingSummaryData={bookingReview.summary || null}
              travellerData={bookingReview.traveller || null}
            />

            <div className="overflow-hidden rounded-2xl border border-[#d9e2ec] bg-white shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e5e7eb] px-5 py-[18px]">
                <div>
                  <div className="text-[16px] font-extrabold text-[#111827]">
                    {activeUser?.mobile
                      ? "Wallet benefits applied automatically"
                      : "Additional discounts and saved payment options"}
                  </div>
                  <div className="mt-1 text-[13px] text-[#6b7280]">
                    {activeUser?.mobile
                      ? "Promo Credit, Earned Credit and Refund Wallet are applied as per booking summary."
                      : "Login to access saved payments and discounts!"}
                  </div>
                </div>

                {!activeUser?.mobile ? (
                  <button
                    className="h-[42px] w-full rounded-[10px] bg-[#1d9bf0] text-[14px] font-extrabold text-white sm:w-auto sm:min-w-[110px]"
                    onClick={() => setShowLoginModal(true)}
                    type="button"
                  >
                    LOGIN
                  </button>
                ) : null}
              </div>
            </div>

            <PlannerPaymentAddOnsCard
              addOnData={bookingReview.addOn || null}
              selectedBasketItems={safeArray(asRecord(bookingReview.summary).selectedBasketItems)}
            />

            <PaymentOptionSection
              onPaymentMethodChange={(method) => {
                setSelectedPaymentMethod(method);
                applyPaymentMethod(method);
              }}
              payableAmount={finalPayableAmount}
              upiTestId="smart-planner-payment-method-upi"
            />
          </div>

          <div className="min-w-0 self-stretch">
            <PlannerPaymentPriceCard
              appliedCoupon={appliedCoupon}
              basePrice={baseFare}
              couponDiscount={couponDiscount}
              earnedOnThisBooking={earnedOnThisBooking}
              insuranceAmount={insuranceSelected ? insuranceAmount : 0}
              onPayNow={() => handleMockPayment(true)}
              onRetryPayment={() => handleMockPayment(true)}
              payNowAmount={finalPayableAmount}
              paymentActionState={paymentActionState}
              selectedPaymentMethod={selectedPaymentMethod}
              selectedVariant={{
                label: String(asRecord(bookingReview.summary).packageTitle || "Smart Planner Trip"),
                pricePerPerson: effectivePerPersonPrice,
              }}
              taxes={taxes}
              timerSeconds={timeLeft}
              totalTravellers={totalTravellers}
              tplCreditUsed={walletUsedTotal}
              walletCalc={{
                earnedUsed: benefitPricing.earnedUsed,
                promoUsed: benefitPricing.promoUsed,
                refundUsed: benefitPricing.refundUsed,
              }}
            />
          </div>
        </div>
      </div>

      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </main>
  );
}
