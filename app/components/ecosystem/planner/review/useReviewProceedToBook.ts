"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/app/hooks/useAuth";
import { AUTH_UPDATED_EVENT } from "@/app/lib/booking/guestAuth";
import {
  routeTiyaSmartBookingBasket,
  type TiyaSmartBasketItem,
} from "@/app/lib/ecosystem/planner/plannerBookingBridge";
import {
  TIYA_CHECKOUT_DRAFT_KEY,
  TIYA_CHECKOUT_DRAFT_V1_KEY,
  TIYA_CHECKOUT_PAYLOAD_KEY,
  TIYA_REVIEW_DRAFT_KEY,
  type TiyaSmartPlannerReviewPayload,
} from "@/app/lib/ecosystem/planner/plannerReviewPayload";
import {
  buildPlannerDetailId,
  cleanupPlannerTempStorage,
  compactPlannerPayload,
  savePlannerDetailPayload,
} from "@/app/lib/ecosystem/planner/plannerPayloadStorage";
import type { TiyaTripIntent } from "@/app/lib/ecosystem/planner/plannerTypes";

type PayloadWithMode = TiyaSmartPlannerReviewPayload & {
  bookingMode?: string;
  tripMode?: string;
};

type CheckoutReviewPayload = TiyaSmartPlannerReviewPayload & {
  bookingMode: string;
  checkoutSource: "smart-planner-review";
  reviewedAt: string;
};

export type ReviewProceedState = "idle" | "processing" | "success" | "error";

export type ReviewProceedController = {
  basketItemsCount: number;
  basketValue: string;
  blockers: string[];
  isProcessing: boolean;
  mode: "FULL_TRIP_BOOKING" | "PARTIAL_TRIP_BOOKING";
  onProceed: () => void;
  readiness: string;
  statusMessage: string;
  statusState: ReviewProceedState;
  warningsCount: number;
};

const BOOKING_ROUTE_RESULT_KEY = "tpl_tiya_booking_route_result_v1";
const PENDING_REVIEW_PROCEED_KEY = "tpl_tiya_pending_review_proceed_v1";

function safeArray<T>(value: T[] | null | undefined): T[] {
  return Array.isArray(value) ? value : [];
}

function basketRawValue(payload: TiyaSmartPlannerReviewPayload) {
  return safeArray(payload.selectedBasketItems).reduce(
    (sum, item) =>
      sum + Number(item.estimatedTotal || item.estimatedPrice || item.price || 0),
    0
  );
}

function formatCurrency(value?: number) {
  if (!Number.isFinite(Number(value)) || Number(value) <= 0) return "Not available";
  return `₹${Number(value).toLocaleString("en-IN")}`;
}

function normalizePace(value?: string): TiyaTripIntent["pace"] {
  if (value === "Relaxed" || value === "Packed" || value === "Balanced") return value;
  return "Balanced";
}

function bookingMode(payload: TiyaSmartPlannerReviewPayload) {
  const mode = String(
    (payload as PayloadWithMode).bookingMode || (payload as PayloadWithMode).tripMode || ""
  ).toUpperCase();
  if (mode.includes("FULL")) return "FULL_TRIP_BOOKING";
  if (mode.includes("PARTIAL")) return "PARTIAL_TRIP_BOOKING";
  const itineraryDays = safeArray(payload.itinerary).length;
  const basketDays = new Set(
    safeArray(payload.selectedBasketItems).map((item) => item.day).filter(Boolean)
  ).size;
  return itineraryDays > 0 && basketDays >= itineraryDays
    ? "FULL_TRIP_BOOKING"
    : "PARTIAL_TRIP_BOOKING";
}

function buildIntent(payload: TiyaSmartPlannerReviewPayload): TiyaTripIntent {
  return {
    adults: Math.max(1, Number(payload.travellers?.adults || 1)),
    budgetTier: payload.preferences?.budgetTier || "Premium",
    children: Math.max(0, Number(payload.travellers?.children || 0)),
    customBudgetAmount: "",
    endDate: payload.trip?.endDate || payload.trip?.startDate || "",
    fromCity: payload.trip?.origin || "",
    interests: [],
    pace: normalizePace(payload.trip?.pace),
    pets: Boolean(payload.travellers?.pets),
    seniors: Math.max(0, Number(payload.travellers?.seniors || 0)),
    smartPreferences: {
      avoidNightTravel: false,
      includeCreatorSpots: safeArray(payload.selectedCreatorSpots).length > 0,
      includeInsurance: safeArray(payload.selectedInsurance).length > 0,
      includeLocalMarket:
        safeArray(payload.selectedLocalLifeItems).length +
          safeArray(payload.selectedLocalMarketItems).length >
        0,
      includeStays:
        safeArray(payload.selectedHotels).length + safeArray(payload.selectedHomestays).length >
        0,
      preferScenicRoute:
        payload.route?.routeType?.toLowerCase().includes("scenic") || false,
    },
    startDate: payload.trip?.startDate || "",
    stayPreference: payload.preferences?.stayPreference || "Hotel",
    toCity: payload.trip?.destination || "",
    transportMode: payload.preferences?.transportMode || payload.route?.transportMode || "Mixed Mode",
    travelStyle: payload.preferences?.travelStyle || payload.trip?.travelStyle || "Leisure",
    tripType: payload.trip?.tripType || "Custom Trip",
  };
}

function buildBridgeItems(payload: TiyaSmartPlannerReviewPayload): TiyaSmartBasketItem[] {
  return safeArray(payload.selectedBasketItems).map((item) => ({
    bookingType: item.serviceType || item.category || "package",
    city: item.city,
    dayLabel: item.dayLabel,
    estimatedPrice: Number(item.estimatedTotal || item.estimatedPrice || item.price || 0),
    selectedOption: item.selectedOptionName || item.serviceLabel || item.title,
    serviceId: item.id,
    serviceName: item.serviceName || item.title,
    time: item.time,
  }));
}

function compactLocalValue(key: string, value: unknown) {
  const record = typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : {};
  const payload =
    record.source === "smart-planner"
      ? (record as TiyaSmartPlannerReviewPayload)
      : record.checkoutPayload && typeof record.checkoutPayload === "object"
        ? (record.checkoutPayload as TiyaSmartPlannerReviewPayload)
        : null;

  if (!payload || payload.source !== "smart-planner") return value;

  const detail = savePlannerDetailPayload(
    buildPlannerDetailId(key.replace(/[^\w-]/g, "_"), payload),
    payload
  );
  const compact = compactPlannerPayload(payload, detail.key || undefined);

  if (record.checkoutPayload || record.reviewPayload) {
    return {
      ...record,
      checkoutPayload: compact,
      detailStorageKey: detail.key || undefined,
      reviewPayload: compact,
    };
  }

  return compact;
}

function writeStorageJSON(key: string, value: unknown) {
  const serialized = JSON.stringify(value);
  try {
    window.sessionStorage.setItem(key, serialized);
  } catch {
    // Session storage can be unavailable in restricted browser modes.
  }
  try {
    window.localStorage.setItem(key, JSON.stringify(compactLocalValue(key, value)));
  } catch (error) {
    cleanupPlannerTempStorage();
    try {
      window.localStorage.setItem(key, JSON.stringify(compactLocalValue(key, value)));
    } catch {
      if (process.env.NODE_ENV === "development") {
        console.warn("[Smart Planner Review] local handoff mirror skipped", key, error);
      }
    }
  }
}

function proceedBlockers(payload: TiyaSmartPlannerReviewPayload | null) {
  const blockers: string[] = [];
  if (!payload) {
    blockers.push("Review payload is missing. Please return to Workspace and rebuild your trip review.");
    return blockers;
  }
  if (!safeArray(payload.selectedBasketItems).length) {
    blockers.push("No booking basket items found. Please return to Workspace and add at least one item.");
  }
  if (!payload.trip?.origin || !payload.trip?.destination) {
    blockers.push("Trip origin or destination is missing.");
  }
  if (!payload.route?.name && !payload.route?.activeRouteId && !payload.route?.selectedRouteVariant) {
    blockers.push("Trip route is missing.");
  }
  if (!safeArray(payload.itinerary).length) {
    blockers.push("Itinerary is missing.");
  }
  return blockers;
}

function persistCheckoutPayload(payload: TiyaSmartPlannerReviewPayload): CheckoutReviewPayload {
  const checkoutPayload = {
    ...payload,
    bookingMode: bookingMode(payload),
    checkoutSource: "smart-planner-review" as const,
    reviewedAt: new Date().toISOString(),
    selectedBasketItems: safeArray(payload.selectedBasketItems),
    source: "smart-planner" as const,
  } satisfies CheckoutReviewPayload;
  const checkoutDraft = {
    checkoutPayload,
    createdAt: checkoutPayload.reviewedAt,
    draftId: `tiya_review_checkout_${Date.now()}`,
    reviewPayload: payload,
    selectedBasketItems: checkoutPayload.selectedBasketItems,
    source: "smart-planner-review",
    updatedAt: checkoutPayload.reviewedAt,
  };
  const reviewDraft = {
    checkoutPayload,
    reviewPayload: payload,
    savedAt: checkoutPayload.reviewedAt,
    selectedBasketItems: checkoutPayload.selectedBasketItems,
    source: "smart-planner-review",
    updatedAt: checkoutPayload.reviewedAt,
  };

  writeStorageJSON(TIYA_CHECKOUT_PAYLOAD_KEY, checkoutPayload);
  writeStorageJSON(TIYA_CHECKOUT_DRAFT_KEY, checkoutDraft);
  writeStorageJSON(TIYA_CHECKOUT_DRAFT_V1_KEY, checkoutDraft);
  writeStorageJSON(TIYA_REVIEW_DRAFT_KEY, reviewDraft);
  return checkoutPayload;
}

export function useReviewProceedToBook(
  payload: TiyaSmartPlannerReviewPayload
): ReviewProceedController {
  const router = useRouter();
  const { isAuthenticated, openLoginModal, user } = useAuth();
  const [statusState, setStatusState] = useState<ReviewProceedState>("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const processingRef = useRef(false);
  const pendingProceedRef = useRef(false);
  const latestAuthRef = useRef({ isAuthenticated, user });
  const openLoginModalRef = useRef(openLoginModal);
  const blockers = useMemo(() => proceedBlockers(payload), [payload]);
  const mode = bookingMode(payload);

  useEffect(() => {
    latestAuthRef.current = { isAuthenticated, user };
  }, [isAuthenticated, user]);

  useEffect(() => {
    openLoginModalRef.current = openLoginModal;
  }, [openLoginModal]);

  const executeProceed = useCallback(() => {
    if (processingRef.current) return;

    const currentBlockers = proceedBlockers(payload);
    if (currentBlockers.length) {
      setStatusState("error");
      setStatusMessage(currentBlockers[0]);
      return;
    }

    if (!latestAuthRef.current.isAuthenticated || !latestAuthRef.current.user) {
      pendingProceedRef.current = true;
      window.sessionStorage.setItem(PENDING_REVIEW_PROCEED_KEY, "1");
      setStatusState("error");
      setStatusMessage("Login required to continue to booking.");
      openLoginModalRef.current({ accountType: "personal", intent: "ai" });
      return;
    }

    processingRef.current = true;
    setStatusState("processing");
    setStatusMessage("Preparing your booking handoff...");

    try {
      const checkoutPayload = persistCheckoutPayload(payload);
      const bridgeItems = buildBridgeItems(checkoutPayload);
      const detectedServiceTypes = Array.from(
        new Set(bridgeItems.map((item) => item.bookingType || "package"))
      );
      const routeResult = routeTiyaSmartBookingBasket({
        intent: buildIntent(checkoutPayload),
        items: bridgeItems,
      });

      if (!routeResult?.route) {
        throw new Error("Booking bridge did not return a route.");
      }

      if (process.env.NODE_ENV === "development") {
        console.info("[Smart Planner Review] booking handoff", {
          basketItemCount: bridgeItems.length,
          bookingMode: checkoutPayload.bookingMode,
          returnedRoute: routeResult.route,
          serviceTypesDetected: detectedServiceTypes,
        });
      }

      writeStorageJSON(BOOKING_ROUTE_RESULT_KEY, routeResult);
      setStatusState("success");
      setStatusMessage("Booking handoff prepared. Redirecting...");
      router.push(routeResult.route);
    } catch (error) {
      processingRef.current = false;
      setStatusState("error");
      setStatusMessage(
        error instanceof Error
          ? error.message
          : "Unable to prepare booking handoff."
      );
    }
  }, [payload, router]);

  useEffect(() => {
    function resumeAfterLogin() {
      if (window.sessionStorage.getItem(PENDING_REVIEW_PROCEED_KEY) !== "1") return;
      if (!latestAuthRef.current.isAuthenticated || !latestAuthRef.current.user) return;
      window.sessionStorage.removeItem(PENDING_REVIEW_PROCEED_KEY);
      pendingProceedRef.current = false;
      window.setTimeout(executeProceed, 0);
    }

    window.addEventListener(AUTH_UPDATED_EVENT, resumeAfterLogin);
    return () => window.removeEventListener(AUTH_UPDATED_EVENT, resumeAfterLogin);
  }, [executeProceed]);

  useEffect(() => {
    if (!pendingProceedRef.current) return;
    if (!isAuthenticated || !user) return;
    window.sessionStorage.removeItem(PENDING_REVIEW_PROCEED_KEY);
    pendingProceedRef.current = false;
    window.setTimeout(executeProceed, 0);
  }, [executeProceed, isAuthenticated, user]);

  return {
    basketItemsCount: safeArray(payload.selectedBasketItems).length,
    basketValue: formatCurrency(basketRawValue(payload)),
    blockers,
    isProcessing: statusState === "processing",
    mode,
    onProceed: executeProceed,
    readiness: payload.plannerAudit?.readinessScore
      ? `${payload.plannerAudit.readinessScore}%`
      : blockers.length
        ? "Needs Review"
        : "Ready",
    statusMessage,
    statusState,
    warningsCount: blockers.length,
  };
}
