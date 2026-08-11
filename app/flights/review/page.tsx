"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import FlightReviewTopNav from "@/app/components/booking/flight/FlightReviewTopNav";
import FlightTripSummarySection from "@/app/components/booking/flight/FlightTripSummarySection";
import FlightTravellerSection from "@/app/components/booking/flight/FlightTravellerSection";
import FlightTravelinsuranceSection from "@/app/components/booking/flight/FlightTravelinsuranceSection";
import FlightSeatMealSection from "@/app/components/booking/flight/FlightSeatMealSection";
import FlightCabSection from "@/app/components/booking/flight/FlightCabSection";
import FlightAddonsSection from "@/app/components/booking/flight/FlightAddonsSection";
import FlightFareSummaryCard from "@/app/components/booking/flight/FlightFareSummaryCard";
import FlightOffersSection, {
  FlightOfferItem,
} from "@/app/components/booking/flight/FlightOffersSection";

import {
  getFlightReviewPayload,
  saveFlightReviewPayload,
  type FlightReviewPayload,
} from "@/app/lib/flights/review/buildFlightReviewData";
import {
  formatFlightMoney,
  normalizeFlightCurrency,
  readFlightDisplayCurrencyPreference,
} from "@/app/lib/flights/flightCurrency";
import {
  confirmBackendFlightPrice,
  type BackendFlightPriceConfirmResponse,
} from "@/app/lib/api/flightPriceApi";
import {
  fetchBackendFlightAncillaries,
  quoteBackendFlightAncillaries,
  type BackendFlightAncillaryOption,
  type BackendFlightAncillaryQuote,
  type BackendFlightAncillarySet,
  type BackendFlightAncillarySelection,
} from "@/app/lib/api/flightAncillaryApi";
import { simulateBackendFlightBooking } from "@/app/lib/api/flightBookingSimulationApi";
import {
  assertSafeFlightSimulationFlags,
  isFlightBackendStateExpired,
  normalizeFlightBackendError,
  sanitizeFlightStoragePayload,
  validateAndMapFlightTravellers,
} from "@/app/lib/flights/flightBackendIntegration";
import { applyBenefitPricing } from "@/app/lib/pricing/applyBenefitPricing";
import { getWallet } from "@/app/lib/wallet/walletStorage";
import {
  getSmartActiveOfferItem,
  calculateSmartOfferDiscount,
} from "@/app/lib/smartOffers";

function getActiveUser() {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem("tpl_auth_session_v1");
    return raw ? JSON.parse(raw)?.user : null;
  } catch {
    return null;
  }
}

const PROCEED_DEBUG_KEY = "tplFlightProceedDebug";

type ProceedDebugTrace = {
  stage?: string;
  failedAt?: string;
  safeReason?: string;
  canProceed?: boolean;
  travellerReady?: boolean;
  contactReady?: boolean;
  recheckStatus?: string;
  simulationRequestSent?: boolean;
  simulationHttpStatus?: number;
  simulationOk?: boolean;
  bookingDraftIdPresent?: boolean;
  paymentQuotePresent?: boolean;
  safetyAssert?: "pass" | "fail";
  updatedReviewObjectReady?: boolean;
  sanitizer?: "pass" | "fail";
  storageWrite?: "pass" | "fail";
  storageReadback?: "pass" | "fail";
  routerPushCalled?: boolean;
  currentPathname?: string;
  paymentPageMounted?: boolean;
  paymentGuard?: "pass" | "fail";
  safeErrorCode?: string;
  safeErrorMessage?: string;
  timestamp?: string;
};

const PAYMENT_ROUTE = "/flights/payment";
const PAYMENT_NAVIGATION_COMMIT_TIMEOUT_MS = 1200;

function readProceedDebugTrace(): ProceedDebugTrace {
  if (typeof window === "undefined") return {};
  try {
    const raw = sessionStorage.getItem(PROCEED_DEBUG_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeProceedDebugTrace(patch: ProceedDebugTrace): ProceedDebugTrace {
  if (typeof window === "undefined") return patch;
  const next = {
    ...readProceedDebugTrace(),
    ...patch,
    currentPathname: window.location.pathname,
    timestamp: new Date().toISOString(),
  };
  try {
    sessionStorage.setItem(PROCEED_DEBUG_KEY, JSON.stringify(next));
  } catch {
    // Debug trace must never affect booking flow.
  }
  return next;
}

function isProceedDebugEnabled() {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("debugProceed") === "1";
}

function saveFlightPaymentPayloadForNavigation(payload: unknown): {
  ok: true;
  details: ProceedDebugTrace;
} | {
  ok: false;
  message: string;
  details: ProceedDebugTrace;
} {
  if (typeof window === "undefined") {
    return { ok: false, message: "Payment can only be opened in the browser.", details: { sanitizer: "fail" } };
  }

  try {
    const serialized = JSON.stringify(sanitizeFlightStoragePayload(payload));
    const details: ProceedDebugTrace = { sanitizer: "pass" };
    sessionStorage.setItem(
      "tplFlightBookingReviewData",
      serialized
    );
    details.storageWrite = "pass";
    const raw = sessionStorage.getItem("tplFlightBookingReviewData");
    if (!raw) {
      return {
        ok: false,
        message: "Could not prepare the payment page. Please refresh the fare and try again.",
        details: { ...details, storageReadback: "fail" },
      };
    }
    const parsed = JSON.parse(raw) as {
      reviewData?: { backendOffer?: { paymentQuote?: unknown } };
      backendSimulation?: { bookingDraftId?: unknown };
    };
    details.storageReadback = "pass";
    details.bookingDraftIdPresent = Boolean(parsed.backendSimulation?.bookingDraftId);
    details.paymentQuotePresent = Boolean(parsed.reviewData?.backendOffer?.paymentQuote);
    if (parsed.reviewData?.backendOffer) {
      if (!parsed.backendSimulation?.bookingDraftId) {
        return {
          ok: false,
          message: "Backend booking draft was missing. Please refresh the fare and try again.",
          details,
        };
      }
      if (!parsed.reviewData.backendOffer.paymentQuote) {
        return {
          ok: false,
          message: "Backend payment quote was missing. Please refresh the fare and try again.",
          details,
        };
      }
    }
    return { ok: true, details };
  } catch {
    return {
      ok: false,
      message: "Could not prepare the payment page. Please refresh the fare and try again.",
      details: { sanitizer: "fail", storageWrite: "fail", storageReadback: "fail" },
    };
  }
}

function ProceedDebugPanel({
  trace,
  open,
  onToggle,
}: {
  trace: ProceedDebugTrace;
  open: boolean;
  onToggle: () => void;
}) {
  const safeTrace = {
    stage: trace.stage,
    failedAt: trace.failedAt,
    safeReason: trace.safeReason,
    canProceed: trace.canProceed,
    travellerReady: trace.travellerReady,
    contactReady: trace.contactReady,
    recheckStatus: trace.recheckStatus,
    simulationRequestSent: trace.simulationRequestSent,
    simulationHttpStatus: trace.simulationHttpStatus,
    simulationOk: trace.simulationOk,
    bookingDraftIdPresent: trace.bookingDraftIdPresent,
    paymentQuotePresent: trace.paymentQuotePresent,
    safetyAssert: trace.safetyAssert,
    updatedReviewObjectReady: trace.updatedReviewObjectReady,
    sanitizer: trace.sanitizer,
    storageWrite: trace.storageWrite,
    storageReadback: trace.storageReadback,
    routerPushCalled: trace.routerPushCalled,
    currentPathname: trace.currentPathname,
    paymentPageMounted: trace.paymentPageMounted,
    paymentGuard: trace.paymentGuard,
    safeErrorCode: trace.safeErrorCode,
    safeErrorMessage: trace.safeErrorMessage,
    timestamp: trace.timestamp,
  };

  return (
    <div className="fixed bottom-4 left-4 z-[80] max-w-[min(420px,calc(100vw-32px))] rounded-lg border border-[#bfdbfe] bg-white text-[#111827] shadow-xl">
      <button type="button" onClick={onToggle} className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-[12px] font-black">
        <span>Proceed diagnostics</span>
        <span>{open ? "Hide" : "Show"}</span>
      </button>
      {open ? (
        <div className="border-t border-[#e5e7eb] p-3">
          <pre className="max-h-[280px] overflow-auto whitespace-pre-wrap text-[11px] leading-5">
            {JSON.stringify(safeTrace, null, 2)}
          </pre>
          <button
            type="button"
            className="mt-2 rounded-md border border-[#d1d5db] px-2 py-1 text-[11px] font-bold"
            onClick={() => {
              void navigator.clipboard?.writeText(JSON.stringify(safeTrace, null, 2));
            }}
          >
            Copy safe debug
          </button>
        </div>
      ) : null}
    </div>
  );
}

type TravellerValidationPayload = {
  travellers: any[];
  contactDetails: {
    countryCode: string;
    mobile: string;
    email: string;
  };
  gstDetails: {
    hasGst: boolean;
    state: string;
    saveBillingToProfile: boolean;
  };
  allRequiredTravellersCompleted: boolean;
  contactValid: boolean;
  canProceed: boolean;
};

type SeatMealPayload = {
  seats: {
    travellerId: string;
    seatNumber: string;
    price: number;
  }[];
  meals: {
    travellerId: string;
    mealName: string;
    price: number;
  }[];
  seatTotal: number;
  mealTotal: number;
  seatStatus: "pending" | "selected" | "skipped";
  mealStatus: "pending" | "selected" | "skipped";
};

type CabPayload = {
  cabType: "airport" | "outstation" | "none";
  cabStatus: "pending" | "selected" | "skipped";
  cabLabel: string;
  cabPrice: number;
};

type InsurancePayload = {
  insuranceStatus: "pending" | "selected" | "skipped";
  insuranceLabel: string;
  insurancePrice: number;
};

type AddonsPayload = {
  addonsStatus: "pending" | "selected" | "skipped";
  addonsLabel: string;
  addonsPrice: number;
};



export default function FlightReviewPage() {
  const router = useRouter();

  const [reviewData, setReviewData] = useState<FlightReviewPayload | null>(null);
  const [travellerValidation, setTravellerValidation] =
    useState<TravellerValidationPayload | null>(null);



  const [seatMealData, setSeatMealData] = useState<SeatMealPayload>({
    seats: [],
    meals: [],
    seatTotal: 0,
    mealTotal: 0,
    seatStatus: "skipped",
    mealStatus: "skipped",
  });

  const [cabData, setCabData] = useState<CabPayload>({
    cabType: "none",
    cabStatus: "skipped",
    cabLabel: "Cab not available",
    cabPrice: 0,
  });

  const [insuranceData, setInsuranceData] = useState<InsurancePayload>({
    insuranceStatus: "skipped",
    insuranceLabel: "Travel insurance not available",
    insurancePrice: 0,
  });

  const [addonsData, setAddonsData] = useState<AddonsPayload>({
    addonsStatus: "skipped",
    addonsLabel: "Add-ons not available",
    addonsPrice: 0,
  });

const [wallet, setWallet] = useState({
  promoCredit: 0,
  earnedCredit: 0,
  refundableBalance: 0,
});

  const [selectedOffer, setSelectedOffer] = useState<FlightOfferItem | null>(null);
  const [backendPriceState, setBackendPriceState] = useState<"idle" | "checking" | "confirmed" | "changed" | "expired" | "failed">("idle");
  const [backendSimulationState, setBackendSimulationState] = useState<"idle" | "creating" | "failed">("idle");
  const [ancillaryState, setAncillaryState] = useState<"idle" | "loading" | "ready" | "quoting" | "failed">("idle");
  const [ancillarySet, setAncillarySet] = useState<BackendFlightAncillarySet | null>(null);
  const [selectedAncillaryIds, setSelectedAncillaryIds] = useState<string[]>([]);
  const [selectedSeatAssignments, setSelectedSeatAssignments] = useState<BackendFlightAncillarySelection[]>([]);
  const [ancillaryQuote, setAncillaryQuote] = useState<BackendFlightAncillaryQuote | null>(null);
  const [ancillaryMessage, setAncillaryMessage] = useState("");
  const [backendBlockerMessage, setBackendBlockerMessage] = useState("");
  const [travellerFieldErrors, setTravellerFieldErrors] = useState<Record<string, string>>({});
  const [travellerErrorFocusNonce, setTravellerErrorFocusNonce] = useState(0);
  const [proceedDebugEnabled, setProceedDebugEnabled] = useState(false);
  const [proceedDebugOpen, setProceedDebugOpen] = useState(true);
  const [proceedDebugTrace, setProceedDebugTrace] = useState<ProceedDebugTrace>({});
  const [pendingPriceChange, setPendingPriceChange] = useState<{
    total: number;
    previousTotal: number;
    currency: string;
    response: BackendFlightPriceConfirmResponse;
  } | null>(null);

  const [timeLeft, setTimeLeft] = useState(10 * 60);
  const [isExpired, setIsExpired] = useState(false);
  const [showRefreshNotice, setShowRefreshNotice] = useState(false);

  const updateProceedDebug = (patch: ProceedDebugTrace) => {
    if (!proceedDebugEnabled) return;
    setProceedDebugTrace(writeProceedDebugTrace(patch));
  };

  const failProceedDebug = (failedAt: string, safeReason: string, extra: ProceedDebugTrace = {}) => {
    updateProceedDebug({
      ...extra,
      stage: failedAt,
      failedAt,
      safeReason,
    });
  };

  const navigateToPaymentRoute = () => {
    const beforePathname = typeof window !== "undefined" ? window.location.pathname : "";
    updateProceedDebug({
      stage: "N01_BEFORE_PUSH",
      currentPathname: beforePathname,
      routerPushCalled: false,
    });

    try {
      updateProceedDebug({ stage: "T19_ROUTER_PUSH_CALLED", routerPushCalled: true });
      router.push(PAYMENT_ROUTE);
      updateProceedDebug({ stage: "N02_PUSH_RETURNED", routerPushCalled: true });

      if (typeof window === "undefined") {
        setBackendSimulationState("idle");
        return;
      }

      window.setTimeout(() => {
        const currentPathname = window.location.pathname;
        if (currentPathname !== beforePathname) {
          updateProceedDebug({
            stage: "N03_ROUTE_CHANGE_DETECTED",
            currentPathname,
            routerPushCalled: true,
          });
        }
        if (currentPathname === PAYMENT_ROUTE) {
          updateProceedDebug({
            stage: "N04_PATHNAME_CHANGED",
            currentPathname,
            routerPushCalled: true,
          });
          return;
        }

        updateProceedDebug({
          stage: "N02_NAVIGATION_NOT_COMMITTED",
          failedAt: "N02_NAVIGATION_NOT_COMMITTED",
          safeReason: "Client router navigation did not commit; using hard navigation fallback.",
          currentPathname,
          routerPushCalled: true,
        });

        try {
          window.location.assign(PAYMENT_ROUTE);
        } catch {
          setBackendSimulationState("failed");
          setBackendBlockerMessage("Could not open payment page. Please retry.");
          failProceedDebug("N02_NAVIGATION_NOT_COMMITTED", "Could not open payment page.", {
            currentPathname,
            routerPushCalled: true,
          });
        }
      }, PAYMENT_NAVIGATION_COMMIT_TIMEOUT_MS);
    } catch {
      setBackendSimulationState("failed");
      setBackendBlockerMessage("Could not open payment page. Please retry.");
      failProceedDebug("N02_PUSH_RETURNED", "Could not open payment page.", { routerPushCalled: true });
    }
  };

  useEffect(() => {
  const data = getFlightReviewPayload();
  setReviewData(data);

  const user = getActiveUser();
  if (user?.mobile) {
    setWallet(getWallet(user.mobile));
  }
}, []);

  useEffect(() => {
    const enabled = isProceedDebugEnabled();
    setProceedDebugEnabled(enabled);
    if (enabled) {
      setProceedDebugTrace(writeProceedDebugTrace({ stage: "REVIEW_DEBUG_READY" }));
    }
  }, []);

  useEffect(() => {
    if (!reviewData?.backendOffer || reviewData.backendOffer.priceConfirmationId || backendPriceState !== "idle") return;

    void refreshBackendPrice(reviewData);
  }, [reviewData, backendPriceState]);

  useEffect(() => {
    if (!reviewData?.backendOffer?.priceConfirmationId) return;
    void loadBackendAncillaries(reviewData);
  }, [reviewData?.backendOffer?.priceConfirmationId, reviewData?.backendOffer?.displayPrice?.currency]);

  useEffect(() => {
    if (timeLeft <= 0) {
      setIsExpired(true);
      setShowRefreshNotice(true);
      sessionStorage.removeItem("tplFlightBookingReviewData");
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  useEffect(() => {
    if (timeLeft === 120) {
      setShowRefreshNotice(true);
    }
  }, [timeLeft]);

  const formattedTime = useMemo(() => {
    const mm = String(Math.floor(timeLeft / 60)).padStart(2, "0");
    const ss = String(timeLeft % 60).padStart(2, "0");
    return `${mm}:${ss}`;
  }, [timeLeft]);

  const handleRefreshPrice = () => {
    if (reviewData?.backendOffer) {
      void refreshBackendPrice(reviewData);
      return;
    }
    const freshData = getFlightReviewPayload();
    setReviewData(freshData);
    setTimeLeft(10 * 60);
    setIsExpired(false);
    setShowRefreshNotice(false);
  };

  if (!reviewData) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "#f5f7fb",
          color: "#000",
        }}
      >
        <div
          style={{
            
            background: "#f5f7fb",
          }}
        >
          <FlightReviewTopNav />
        </div>

        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            padding: "20px 16px",
          }}
        >
          <div
            style={{
              background: "#fff",
              border: "1px solid #d9e2ec",
              padding: "24px",
              borderRadius: "12px",
              fontSize: "16px",
              fontWeight: 600,
              color: "#374151",
            }}
          >
            No flight review data found.
          </div>
        </div>
      </main>
    );
  }

  const travellerCount =
    (reviewData.passengers?.adults || 0) +
    (reviewData.passengers?.children || 0) +
    (reviewData.passengers?.infants || 0);

  const perAdultBaseFare = reviewData.pricing?.perAdultBaseFare || 0;
  const reviewCurrency = normalizeFlightCurrency(
    reviewData.backendOffer?.displayPrice?.currency ||
      reviewData.pricing?.currency ||
      readFlightDisplayCurrencyPreference()
  );

const baseFare =
  Number((reviewData.pricing as any)?.baseFareTotal || 0) ||
  perAdultBaseFare * travellerCount;

  const tax = reviewData.pricing?.tax || 0;
  const surcharge = reviewData.pricing?.surcharge || 0;
  const discount = reviewData.pricing?.discount || 0;
const supplierBackedReview = Boolean(reviewData.backendOffer);
const activeSmartOffer = reviewCurrency === "INR" && !supplierBackedReview ? getSmartActiveOfferItem() : null;

const smartMappedOffer =
  activeSmartOffer && !selectedOffer
    ? {
        code: activeSmartOffer.couponCode || activeSmartOffer.slug,
        title: activeSmartOffer.title,
        description:
          activeSmartOffer.description ||
          activeSmartOffer.subtitle ||
          "Smart offer applied.",
        discountAmount: calculateSmartOfferDiscount(
          activeSmartOffer,
          baseFare
        ),
      }
    : null;

const finalSelectedOffer = selectedOffer || smartMappedOffer;

const payloadAppliedOffer = Number(
  (reviewData.pricing as any)?.appliedOffer || 0
);

const appliedOfferAmount = supplierBackedReview
  ? 0
  : reviewCurrency !== "INR"
    ? 0
    : payloadAppliedOffer > 0
    ? payloadAppliedOffer
    : Number(finalSelectedOffer?.discountAmount || 0);

const benefitPricing = applyBenefitPricing({
  baseAmount: baseFare,

  taxes: tax,
  fees: surcharge,

  seatCharges: 0,
  mealCharges: 0,
  cabCharges: 0,
  insuranceCharges: 0,
  addOns: 0,

  offerDiscount: appliedOfferAmount,

  promoCredit: reviewCurrency === "INR" && !supplierBackedReview ? wallet.promoCredit : 0,
  earnedCredit: reviewCurrency === "INR" && !supplierBackedReview ? wallet.earnedCredit : 0,
  refundWallet: reviewCurrency === "INR" && !supplierBackedReview ? wallet.refundableBalance : 0,
});

const walletCalc = {
  promoUsed: benefitPricing.promoUsed,
  earnedUsed: benefitPricing.earnedUsed,
  refundUsed: benefitPricing.refundUsed,
  finalPayable: benefitPricing.finalPayable,
};

const tplCredit =
  benefitPricing.promoUsed +
  benefitPricing.earnedUsed +
  benefitPricing.refundUsed;

const totalBeforeWallet = benefitPricing.payableBeforeRefundWallet;

const backendAncillaryTotals = summarizeBackendAncillaryQuote(ancillaryQuote);

const finalTotalAmount = ancillaryQuote
  ? Number(ancillaryQuote.displayTotal.amount || benefitPricing.finalPayable)
  : benefitPricing.finalPayable;

  const isTravellerDone = travellerValidation?.canProceed ?? false;

  const blockerMessage = backendBlockerMessage
    ? backendBlockerMessage
    : backendPriceState === "checking"
    ? "Confirming latest backend fare."
    : backendSimulationState === "creating"
    ? "Creating simulated booking draft."
    : backendPriceState === "changed"
    ? "Price changed. Please accept the latest fare before continuing."
    : backendPriceState === "expired"
    ? "Backend fare expired. Please search again."
    : backendPriceState === "failed"
    ? "Could not confirm latest backend fare. Please refresh price."
    : backendSimulationState === "failed"
    ? "Could not create simulated booking draft. Please retry after refreshing price."
    : isExpired
    ? "Session expired. Please refresh price and continue again."
    : !isTravellerDone && travellerValidation?.allRequiredTravellersCompleted === false
    ? "Please complete all required traveller details."
    : !isTravellerDone && travellerValidation?.contactValid === false
    ? "Please enter a valid contact mobile number and email."
    : !isTravellerDone
    ? "Please fill Traveller Detail first."
    : "";

  const canProceed =
    !isExpired &&
    backendPriceState !== "checking" &&
    backendPriceState !== "changed" &&
    backendPriceState !== "expired" &&
    backendPriceState !== "failed" &&
    backendSimulationState !== "creating" &&
    backendSimulationState !== "failed" &&
    isTravellerDone;

const reviewText = JSON.stringify(reviewData || {}).toLowerCase();

const isInternationalFlight =
  reviewText.includes("dubai") ||
  reviewText.includes("dxb") ||
  reviewText.includes("singapore") ||
  reviewText.includes("bangkok") ||
  reviewText.includes("london") ||
  reviewText.includes("paris") ||
  reviewText.includes("international");

  const totalTravellers =
    (reviewData.passengers?.adults || 0) +
    (reviewData.passengers?.children || 0) +
    (reviewData.passengers?.infants || 0);

  const isSeatMealUnlocked =
    travellerValidation?.allRequiredTravellersCompleted ?? false;

  const isCabUnlocked = isTravellerDone;
  const isInsuranceUnlocked = isTravellerDone;
  const isAddonsUnlocked = isTravellerDone;
  const bookingTypeLabel =
    reviewData.bookingType === "multiCity"
      ? "Multi City"
      : reviewData.bookingType === "roundTrip"
      ? "Round Trip"
      : "One Way";
  const tripModeLabel =
    reviewData.tripMode === "international" ? "International" : "Domestic";
  const firstSegment = reviewData.journeys?.[0]?.segments?.[0] || null;
  const lastJourney =
    reviewData.journeys?.[Math.max(reviewData.journeys.length - 1, 0)] || null;
  const lastSegment =
    lastJourney?.segments?.[
      Math.max((lastJourney?.segments?.length || 1) - 1, 0)
    ] || null;
  const routeSummary =
    firstSegment && lastSegment
      ? `${firstSegment.from || ""} to ${lastSegment.to || ""}`
      : `${bookingTypeLabel} flight`;
  const mobileReviewSubtitle = `${bookingTypeLabel} · ${tripModeLabel} flight`;

  return (
    <main
      className="max-md:overflow-x-hidden"
      style={{
        minHeight: "100vh",
        background: "#f5f7fb",
        color: "#000",
      }}
    >
      <div
        className="max-md:sticky max-md:top-0 max-md:z-50 max-md:shadow-[0_8px_24px_rgba(15,23,42,0.12)]"
        style={{
          
          background: "#f5f7fb",
        }}
      >
        <FlightReviewTopNav
          subtitle={mobileReviewSubtitle}
        />

        <div
          className="max-md:hidden"
          style={{
            padding: "8px 16px 12px 16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          <div
            className="max-md:text-[12px] max-md:leading-[18px]"
            style={{
              fontSize: "13px",
              fontWeight: 700,
              color: isExpired ? "#dc2626" : "#374151",
            }}
          >
            {isExpired
              ? "Session expired. Refresh latest fare to continue."
              : "Your fare is being held for a limited time."}
          </div>

          <span
            className="max-md:min-w-[70px] max-md:px-3 max-md:py-1.5 max-md:text-[13px]"
            style={{
              padding: "6px 12px",
              borderRadius: "999px",
              border: "1px solid #d9e2ec",
              background: "#fff",
              fontWeight: 800,
              color: timeLeft < 120 ? "#dc2626" : "#111827",
              minWidth: "80px",
              textAlign: "center",
            }}
          >
            {formattedTime}
          </span>
        </div>

        <div className="hidden max-md:block max-md:px-3 max-md:pb-3">
          <div className="rounded-2xl border border-[#d9e2ec] bg-white px-3 py-2.5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="truncate text-[11px] font-black uppercase tracking-[0.06em] text-[#64748b]">
                  {routeSummary}
                </div>
                <div
                  className={`mt-0.5 text-[13px] font-black leading-[18px] ${
                    isExpired ? "text-[#dc2626]" : "text-[#111827]"
                  }`}
                >
                  {isExpired
                    ? "Session expired. Refresh fare."
                    : "Fare held for a limited time"}
                </div>
                <div className="mt-1 text-[11px] font-semibold text-[#64748b]">
                  {mobileReviewSubtitle}
                </div>
              </div>

              <span
                className={`shrink-0 rounded-full border px-3 py-1.5 text-[13px] font-black ${
                  timeLeft < 120
                    ? "border-[#fecaca] bg-[#fff1f2] text-[#dc2626]"
                    : "border-[#d9e2ec] bg-[#f8fafc] text-[#111827]"
                }`}
              >
                {formattedTime}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div
        className="max-md:px-3 max-md:py-3"
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "20px 16px",
        }}
      >
        {showRefreshNotice && (
          <div
            className="max-md:flex-col max-md:items-stretch max-md:rounded-xl max-md:p-3"
            style={{
              marginBottom: "16px",
              border: "1px solid #fcd34d",
              background: isExpired ? "#fef2f2" : "#fffbea",
              borderRadius: "12px",
              padding: "14px 16px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "14px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: 800,
                  color: isExpired ? "#b91c1c" : "#92400e",
                }}
              >
                {isExpired
                  ? "Session expired. Fare may have changed."
                  : "Price hold is ending soon."}
              </div>

              <div
                style={{
                  marginTop: "4px",
                  fontSize: "13px",
                  color: "#4b5563",
                  lineHeight: "20px",
                }}
              >
                Refresh latest fare before continuing to avoid price mismatch.
              </div>
            </div>

            <button
              type="button"
              onClick={handleRefreshPrice}
              className="max-md:w-full"
              style={{
                minWidth: "140px",
                height: "40px",
                border: "none",
                borderRadius: "10px",
                background: "#1d9bf0",
                color: "#ffffff",
                fontSize: "14px",
                fontWeight: 800,
                cursor: "pointer",
                padding: "0 14px",
              }}
            >
              Refresh Price
            </button>
          </div>
        )}

        {pendingPriceChange ? (
          <div className="mb-4 rounded-xl border border-[#fed7aa] bg-[#fff7ed] px-4 py-3">
            <div className="text-[14px] font-black text-[#9a3412]">
              Backend fare changed
            </div>
            <div className="mt-1 text-[13px] font-semibold leading-5 text-[#7c2d12]">
              Previous total: {formatFlightMoney(pendingPriceChange.previousTotal, normalizeFlightCurrency(pendingPriceChange.currency))} · New total:{" "}
              {formatFlightMoney(pendingPriceChange.total, normalizeFlightCurrency(pendingPriceChange.currency))}
            </div>
            <button
              type="button"
              onClick={() => acceptBackendPriceChange()}
              className="mt-3 h-10 rounded-xl bg-[#111827] px-4 text-[13px] font-black text-white"
            >
              Accept Latest Fare
            </button>
          </div>
        ) : null}

        {proceedDebugEnabled ? (
          <ProceedDebugPanel
            trace={proceedDebugTrace}
            open={proceedDebugOpen}
            onToggle={() => setProceedDebugOpen((value) => !value)}
          />
        ) : null}

        <div
          className="max-md:flex-col"
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "16px",
          }}
        >
          <div
            className="max-md:!w-full"
            style={{
              width: "76%",
              minWidth: 0,
            }}
          >
            <div
              className="max-md:rounded-xl"
              style={{
                background: "#ffffff",
                border: "1px solid #d9e2ec",
                boxShadow: "0 1px 2px rgba(16,24,40,0.04)",
                overflow: "hidden",
              }}
            >
              <FlightTripSummarySection
                reviewData={reviewData}
                paidBaggageOptions={ancillarySet?.paidBaggage || []}
                selectedAncillaryIds={selectedAncillaryIds}
                onAncillaryToggle={handleAncillaryToggle}
              />

              <FlightTravellerSection
                bookingType={reviewData.bookingType}
                tripMode={reviewData.tripMode}
                passengers={reviewData.passengers}
                fieldErrors={travellerFieldErrors}
                errorFocusNonce={travellerErrorFocusNonce}
                onValidationChange={(payload) => {
                  setTravellerValidation(payload);
                  if (Object.keys(travellerFieldErrors).length > 0) setTravellerFieldErrors({});
                }}
              />

              <FlightSeatMealSection
                isTravellerComplete={isSeatMealUnlocked}
                travellerCount={totalTravellers}
                seatOptions={ancillarySet?.seats || []}
                seatMaps={ancillarySet?.seatMaps || []}
                mealOptions={ancillarySet?.meals || []}
                selectedAncillaryIds={selectedAncillaryIds}
                selectedSeatAssignments={selectedSeatAssignments}
                isLoadingAncillaries={ancillaryState === "loading" || ancillaryState === "quoting"}
                ancillaryMessage={ancillaryMessage}
                onAncillaryToggle={handleAncillaryToggle}
                onSeatAssignmentsChange={handleSeatAssignmentsChange}
                onChange={setSeatMealData}
              />

              <FlightCabSection
                isEnabled={isCabUnlocked}
                onChange={setCabData}
              />

              <FlightTravelinsuranceSection
                isEnabled={isInsuranceUnlocked}
                onChange={setInsuranceData}
              />

              <FlightAddonsSection
                isEnabled={isAddonsUnlocked}
                onChange={setAddonsData}
              />
            </div>
          </div>

          <div
            className="max-md:!w-full"
            style={{
              width: "24%",
              minWidth: 0,
            }}
          >
            <FlightFareSummaryCard
              travellerCount={travellerCount}
              currency={reviewCurrency}
              perAdultBaseFare={perAdultBaseFare}
              baseFare={baseFare}
              tax={tax}
              surcharge={surcharge}
              appliedOffer={appliedOfferAmount}
              discount={discount}
              tplCredit={tplCredit}
              
walletBreakdown={{
  promoUsed: walletCalc.promoUsed,
  earnedUsed: walletCalc.earnedUsed,
  refundUsed: walletCalc.refundUsed,
}}
earnedOnThisBooking={0}
refundWalletAvailable={supplierBackedReview ? 0 : wallet.refundableBalance}
useRefundWallet={!supplierBackedReview}
seatTotal={backendAncillaryTotals.seats}
              
              mealTotal={backendAncillaryTotals.meals}
              baggageTotal={backendAncillaryTotals.paidBaggage}
              cabTotal={cabData.cabPrice}
              insuranceTotal={insuranceData.insurancePrice}
              addonsTotal={addonsData.addonsPrice}
              seatStatus={backendAncillaryTotals.seats > 0 ? "selected" : seatMealData.seatStatus}
              mealStatus={backendAncillaryTotals.meals > 0 ? "selected" : seatMealData.mealStatus}
              baggageStatus={backendAncillaryTotals.paidBaggage > 0 ? "selected" : "skipped"}
              cabStatus={cabData.cabStatus}
              insuranceStatus={insuranceData.insuranceStatus}
              addonsStatus={addonsData.addonsStatus}
              totalAmount={finalTotalAmount}
              canProceed={canProceed}
              blockerMessage={blockerMessage}
              buttonLabel={isExpired ? "Session Expired" : "Proceed to Book"}
              onProceed={handleProceedClick}
            />

            <FlightOffersSection
  appliedOfferCode={selectedOffer?.code || ""}
  isInternational={isInternationalFlight}
  bookingValue={baseFare}
  onApplyOffer={(offer) => setSelectedOffer(offer)}
  onRemoveOffer={() => setSelectedOffer(null)}
/>
          </div>
        </div>
      </div>
    </main>
  );

  function handleProceedClick() {
    updateProceedDebug({
      stage: "T01_CLICK",
      canProceed,
      travellerReady: Boolean(travellerValidation?.allRequiredTravellersCompleted),
      contactReady: Boolean(travellerValidation?.contactValid),
      recheckStatus: backendPriceState,
    });
    if (!canProceed) {
      const message = blockerMessage || "Please complete the required booking details before continuing.";
      setBackendBlockerMessage(message);
      failProceedDebug("T02_CAN_PROCEED_PASS", message, {
        canProceed: false,
        travellerReady: Boolean(travellerValidation?.allRequiredTravellersCompleted),
        contactReady: Boolean(travellerValidation?.contactValid),
        recheckStatus: backendPriceState,
      });
      if (!isTravellerDone) {
        document.getElementById("traveller-detail")?.scrollIntoView({ block: "start", behavior: "smooth" });
        setTravellerErrorFocusNonce((value) => value + 1);
      }
      return;
    }

    updateProceedDebug({
      stage: "T02_CAN_PROCEED_PASS",
      canProceed: true,
      travellerReady: Boolean(travellerValidation?.allRequiredTravellersCompleted),
      contactReady: Boolean(travellerValidation?.contactValid),
      recheckStatus: backendPriceState,
    });
    void proceedToPayment();
  }
  async function proceedToPayment() {
    if (!reviewData) {
      failProceedDebug("T02_CAN_PROCEED_PASS", "Review data was missing.");
      return;
    }

    let nextReviewData = reviewData;
    let backendSimulationMetadata:
      | {
          simulationId: string;
          bookingDraftId: string;
          bookingRef: string;
          priceConfirmationId: string;
          expiresAt: string;
          backendRequestId?: string;
          currency?: string;
        }
      | null = null;
    if (reviewData.backendOffer) {
      updateProceedDebug({
        stage: reviewData.backendOffer.priceConfirmationId ? "T06_RECHECK_PASS" : "T05_RECHECK_START",
        recheckStatus: backendPriceState,
      });
      const priceReady = reviewData.backendOffer.priceConfirmationId
        ? reviewData
        : await refreshBackendPrice(reviewData);

      if (!priceReady?.backendOffer?.priceConfirmationId) {
        failProceedDebug("T06_RECHECK_PASS", "Backend price confirmation was missing.", { recheckStatus: "failed" });
        return;
      }
      updateProceedDebug({ stage: "T06_RECHECK_PASS", recheckStatus: "confirmed" });
      nextReviewData = priceReady;
      if (isFlightBackendStateExpired(priceReady.backendOffer.expiresAt)) {
        setBackendPriceState("expired");
        setBackendBlockerMessage("Backend fare expired. Please search again.");
        failProceedDebug("T06_RECHECK_PASS", "Backend fare expired.", { recheckStatus: "expired" });
        return;
      }

      updateProceedDebug({
        stage: "T03_TRAVELLER_READY",
        travellerReady: Boolean(travellerValidation?.allRequiredTravellersCompleted),
      });
      updateProceedDebug({
        stage: "T04_CONTACT_READY",
        contactReady: Boolean(travellerValidation?.contactValid),
      });
      const mappedTravellers = validateAndMapFlightTravellers(
        travellerValidation,
        priceReady.passengers
      );

      if (!mappedTravellers.ok) {
        setBackendSimulationState("failed");
        setBackendBlockerMessage(mappedTravellers.errors[0] || "Traveller details are invalid.");
        failProceedDebug("T07_TRAVELLER_MAP_PASS", mappedTravellers.errors[0] || "Traveller details are invalid.");
        return;
      }

      updateProceedDebug({ stage: "T07_TRAVELLER_MAP_PASS" });
      setBackendSimulationState("creating");
      setBackendBlockerMessage("");
      setTravellerFieldErrors({});
      updateProceedDebug({
        stage: "T08_SIMULATION_REQUEST_START",
        simulationRequestSent: true,
      });
      const simulation = await simulateBackendFlightBooking({
        searchId: priceReady.backendOffer.searchId,
        offerId: priceReady.backendOffer.offerId,
        ...(priceReady.backendOffer.fareId ? { fareId: priceReady.backendOffer.fareId } : {}),
        priceConfirmationId: priceReady.backendOffer.priceConfirmationId,
        passengers: priceReady.passengers,
        travellers: mappedTravellers.travellers,
        contactDetails: mappedTravellers.contactDetails,
        clientPricingSnapshot: {
          total: Number(priceReady.backendOffer.priceTotal || finalTotalAmount),
          currency: normalizeFlightCurrency(priceReady.backendOffer.currency),
          ...(priceReady.backendOffer.displayPrice ? {
            displayTotal: priceReady.backendOffer.displayPrice.amount,
            displayCurrency: normalizeFlightCurrency(priceReady.backendOffer.displayPrice.currency),
          } : {}),
          ...(priceReady.backendOffer.paymentQuote?.quoteId ? {
            paymentQuoteId: priceReady.backendOffer.paymentQuote.quoteId,
          } : {}),
        },
        acceptedPriceChange: priceReady.backendOffer.priceStatus === "price_changed",
        idempotencyKey: buildFlightSmokeIdempotencyKey(`flight-sim:${priceReady.backendOffer.priceConfirmationId}`, priceReady.backendOffer.smokeRunId),
      });

      updateProceedDebug({
        stage: "T09_SIMULATION_HTTP_RESPONSE",
        simulationRequestSent: true,
        simulationHttpStatus: simulation.status,
        simulationOk: simulation.ok,
        safeErrorCode: simulation.ok ? undefined : simulation.error.code,
        safeErrorMessage: simulation.ok ? undefined : normalizeFlightBackendError(simulation.error.code, simulation.error.message),
      });

      if (!simulation.ok) {
        setBackendSimulationState("failed");
        const fieldErrors = mapBackendFieldErrors(simulation.error.fieldErrors);
        if (Object.keys(fieldErrors).length > 0) {
          setTravellerFieldErrors(fieldErrors);
          setTravellerErrorFocusNonce((value) => value + 1);
        }
        setBackendBlockerMessage(
          normalizeFlightBackendError(simulation.error.code, simulation.error.message)
        );
        failProceedDebug("T09_SIMULATION_HTTP_RESPONSE", normalizeFlightBackendError(simulation.error.code, simulation.error.message), {
          simulationHttpStatus: simulation.status,
          simulationOk: false,
          safeErrorCode: simulation.error.code,
        });
        setShowRefreshNotice(true);
        return;
      }

      updateProceedDebug({ stage: "T10_SIMULATION_JSON_PARSED", simulationHttpStatus: simulation.status, simulationOk: true });
      updateProceedDebug({ stage: "T11_SIMULATION_OK", simulationOk: true });
      const simulationFlagErrors = assertSafeFlightSimulationFlags(simulation.data);
      if (simulationFlagErrors.length > 0) {
        setBackendSimulationState("failed");
        setBackendBlockerMessage(simulationFlagErrors[0]);
        failProceedDebug("T12_SAFETY_ASSERT_PASS", simulationFlagErrors[0], { safetyAssert: "fail" });
        return;
      }

      updateProceedDebug({ stage: "T12_SAFETY_ASSERT_PASS", safetyAssert: "pass" });
      updateProceedDebug({ stage: "T13_BOOKING_DRAFT_PRESENT", bookingDraftIdPresent: Boolean(simulation.data.bookingDraftId) });
      updateProceedDebug({ stage: "T14_PAYMENT_QUOTE_PRESENT", paymentQuotePresent: Boolean(simulation.data.paymentQuote || priceReady.backendOffer.paymentQuote) });
      backendSimulationMetadata = {
        simulationId: simulation.data.simulationId,
        bookingDraftId: simulation.data.bookingDraftId,
        bookingRef: simulation.data.bookingRef,
        priceConfirmationId: simulation.data.priceConfirmationId,
        expiresAt: simulation.data.expiresAt,
        currency: normalizeFlightCurrency(simulation.data.displayPriceSnapshot?.currency || simulation.data.priceSnapshot.currency),
        ...(priceReady.backendOffer.backendRequestId ? { backendRequestId: priceReady.backendOffer.backendRequestId } : {}),
      };
      nextReviewData = {
        ...priceReady,
        backendOffer: {
          ...priceReady.backendOffer,
          priceConfirmationId: simulation.data.priceConfirmationId,
          expiresAt: simulation.data.expiresAt,
          supplierPrice: simulation.data.supplierPriceSnapshot || priceReady.backendOffer.supplierPrice,
          displayPrice: simulation.data.displayPriceSnapshot || priceReady.backendOffer.displayPrice,
          paymentQuote: simulation.data.paymentQuote || priceReady.backendOffer.paymentQuote,
          priceTotal: Number(simulation.data.displayPriceSnapshot?.amount || priceReady.backendOffer.priceTotal || 0),
          currency: normalizeFlightCurrency(simulation.data.displayPriceSnapshot?.currency || priceReady.backendOffer.currency),
        },
      };
      updateProceedDebug({ stage: "T15_NEXT_REVIEW_DATA_READY", updatedReviewObjectReady: true });
      try {
        saveFlightReviewPayload(nextReviewData);
      } catch {
        // The payment payload below is authoritative for navigation; back-navigation cache failures must not silently abort Proceed.
      }
    }

  const payload = {
    reviewData: nextReviewData,
    travellerValidation,
    seatMealData: {
      seats: [],
      meals: [],
      seatTotal: 0,
      mealTotal: 0,
      seatStatus: "skipped",
      mealStatus: "skipped",
    },
    cabData: {
      cabType: "none",
      cabStatus: "skipped",
      cabLabel: "Cab not available",
      cabPrice: 0,
    },
    insuranceData: {
      insuranceStatus: "skipped",
      insuranceLabel: "Travel insurance not available",
      insurancePrice: 0,
    },
    addonsData: {
      addonsStatus: "skipped",
      addonsLabel: "Add-ons not available",
      addonsPrice: 0,
      selectedItems: [],
    },

    offerData:
  finalSelectedOffer
    ? {
        ...finalSelectedOffer,
        discountAmount: benefitPricing.offerDiscount,
      }
    : null,

    timerLeft: timeLeft,
    backendAncillaryQuote: ancillaryQuote
      ? {
          quoteId: ancillaryQuote.quoteId,
          ancillarySetId: ancillaryQuote.ancillarySetId,
          selectedAncillaryIds,
          displayTotal: ancillaryQuote.displayTotal,
          payableQuote: ancillaryQuote.payableQuote,
          expiresAt: ancillaryQuote.expiresAt,
        }
      : null,
  };

  if (backendSimulationMetadata) {
    Object.assign(payload, {
      backendSimulation: backendSimulationMetadata,
    });
  }

  const paymentPayloadSaved = saveFlightPaymentPayloadForNavigation(payload);
  updateProceedDebug({
    stage: "T16_SANITIZER_PASS",
    sanitizer: paymentPayloadSaved.details.sanitizer,
    storageWrite: paymentPayloadSaved.details.storageWrite,
    storageReadback: paymentPayloadSaved.details.storageReadback,
    bookingDraftIdPresent: paymentPayloadSaved.details.bookingDraftIdPresent,
    paymentQuotePresent: paymentPayloadSaved.details.paymentQuotePresent,
  });
  if (paymentPayloadSaved.details.storageWrite === "pass") {
    updateProceedDebug({ stage: "T17_STORAGE_WRITE_PASS", storageWrite: "pass" });
  }
  if (paymentPayloadSaved.details.storageReadback === "pass") {
    updateProceedDebug({ stage: "T18_STORAGE_READBACK_PASS", storageReadback: "pass" });
  }
  if (!paymentPayloadSaved.ok) {
    setBackendSimulationState("failed");
    setBackendBlockerMessage(paymentPayloadSaved.message);
    failProceedDebug(
      paymentPayloadSaved.details.storageReadback === "fail" ? "T18_STORAGE_READBACK_PASS" : "T16_SANITIZER_PASS",
      paymentPayloadSaved.message,
      paymentPayloadSaved.details
    );
    return;
  }

  navigateToPaymentRoute();
  }

  async function loadBackendAncillaries(source: FlightReviewPayload) {
    const backendOffer = source.backendOffer;
    if (!backendOffer?.priceConfirmationId) return;
    setAncillaryState("loading");
    setAncillaryMessage("");
    const result = await fetchBackendFlightAncillaries(backendOffer.offerId, {
      searchId: backendOffer.searchId,
      priceConfirmationId: backendOffer.priceConfirmationId,
      displayCurrency: normalizeFlightCurrency(backendOffer.displayPrice?.currency || source.pricing?.currency || readFlightDisplayCurrencyPreference()),
    });
    if (!result.ok) {
      setAncillaryState("failed");
      setAncillarySet(null);
      setSelectedAncillaryIds([]);
      setAncillaryQuote(null);
      setAncillaryMessage(normalizeFlightBackendError(result.error.code, result.error.message));
      return;
    }
    setAncillarySet(result.data);
    setSelectedAncillaryIds((current) => current.filter((id) => allBackendAncillaryOptions(result.data).some((item) => item.id === id)));
    setSelectedSeatAssignments((current) =>
      current.filter((selection) =>
        allBackendAncillaryOptions(result.data).some((item) => item.id === selection.id)
      )
    );
    setAncillaryState("ready");
    setAncillaryMessage(result.data.warnings[0] || "");
    await quoteSelectedAncillaries([], result.data, source);
  }

  async function handleAncillaryToggle(id: string) {
    if (!ancillarySet || !reviewData?.backendOffer?.priceConfirmationId) return;
    const nextSelected = selectedAncillaryIds.includes(id)
      ? selectedAncillaryIds.filter((item) => item !== id)
      : [...selectedAncillaryIds, id];
    setSelectedAncillaryIds(nextSelected);
    await quoteSelectedAncillaries(
      nextSelected,
      ancillarySet,
      reviewData,
      selectedSeatAssignments.filter((item) => nextSelected.includes(item.id))
    );
  }

  async function handleSeatAssignmentsChange(assignments: BackendFlightAncillarySelection[]) {
    if (!ancillarySet || !reviewData?.backendOffer?.priceConfirmationId) return;
    const nonSeatSelectedIds = selectedAncillaryIds.filter((id) => {
      const option = allBackendAncillaryOptions(ancillarySet).find((item) => item.id === id);
      return option?.category !== "seat";
    });
    const nextSelected = [...nonSeatSelectedIds, ...assignments.map((item) => item.id)];
    setSelectedSeatAssignments(assignments);
    setSelectedAncillaryIds(nextSelected);
    await quoteSelectedAncillaries(nextSelected, ancillarySet, reviewData, assignments);
  }

  async function quoteSelectedAncillaries(
    selectedIds: string[],
    sourceSet: BackendFlightAncillarySet,
    sourceReviewData: FlightReviewPayload,
    seatAssignments: BackendFlightAncillarySelection[] = selectedSeatAssignments
  ) {
    const backendOffer = sourceReviewData.backendOffer;
    if (!backendOffer?.priceConfirmationId) return;
    setAncillaryState("quoting");
    const result = await quoteBackendFlightAncillaries(backendOffer.offerId, {
      searchId: backendOffer.searchId,
      priceConfirmationId: backendOffer.priceConfirmationId,
      ancillarySetId: sourceSet.ancillarySetId,
      displayCurrency: normalizeFlightCurrency(backendOffer.displayPrice?.currency || sourceReviewData.pricing?.currency || readFlightDisplayCurrencyPreference()),
      selectedAncillaryIds: selectedIds,
      selectedAncillarySelections: seatAssignments.filter((item) => selectedIds.includes(item.id)),
    });
    if (!result.ok) {
      setAncillaryState("failed");
      setAncillaryQuote(null);
      setAncillaryMessage(normalizeFlightBackendError(result.error.code, result.error.message));
      return;
    }
    setAncillaryQuote(result.data);
    setAncillaryState("ready");
    setAncillaryMessage(result.data.warnings[0] || "");
  }

  async function refreshBackendPrice(source: FlightReviewPayload): Promise<FlightReviewPayload | null> {
    if (!source.backendOffer) return source;
    setBackendPriceState("checking");
    setBackendBlockerMessage("");
    const result = await confirmBackendFlightPrice(source.backendOffer.offerId, {
      searchId: source.backendOffer.searchId,
      ...(source.backendOffer.fareId ? { fareId: source.backendOffer.fareId } : {}),
      passengers: source.passengers,
      currency: "INR",
      displayCurrency: normalizeFlightCurrency(source.backendOffer.displayPrice?.currency || source.pricing?.currency || readFlightDisplayCurrencyPreference()),
      clientOfferSnapshot: {
        total: getBackendOfferSnapshotTotal(source, finalTotalAmount),
        currency: normalizeFlightCurrency(source.backendOffer.currency),
        ...(source.backendOffer.displayPrice ? {
          displayTotal: source.backendOffer.displayPrice.amount,
          displayCurrency: normalizeFlightCurrency(source.backendOffer.displayPrice.currency),
        } : {}),
        ...(source.backendOffer.paymentQuote?.quoteId ? {
          paymentQuoteId: source.backendOffer.paymentQuote.quoteId,
        } : {}),
      },
    });

    if (!result.ok) {
      const isExpiredError = result.error.code.includes("EXPIRED");
      setBackendPriceState(isExpiredError ? "expired" : "failed");
      setBackendBlockerMessage(
        normalizeFlightBackendError(result.error.code, result.error.message)
      );
      setShowRefreshNotice(true);
      return null;
    }

    const displayPrice = getBackendDisplayPrice(result.data, source);
    if (result.data.status === "price_changed") {
      setBackendPriceState("changed");
      setPendingPriceChange({
        total: displayPrice.amount,
        previousTotal: Number(source.backendOffer.displayPrice?.amount || source.backendOffer.priceTotal || 0),
        currency: normalizeFlightCurrency(displayPrice.currency),
        response: result.data,
      });
      setBackendBlockerMessage("Price changed. Please accept the latest fare before continuing.");
      setShowRefreshNotice(true);
      return null;
    }

    if (result.data.status === "expired") {
      setBackendPriceState("expired");
      setBackendBlockerMessage("Backend fare expired. Please search again.");
      setShowRefreshNotice(true);
      return null;
    }

    if (result.data.status !== "confirmed") {
      setBackendPriceState(result.data.status === "provider_pending" ? "failed" : "failed");
      setBackendBlockerMessage(
        result.data.status === "provider_pending"
          ? "Provider fare confirmation is pending. Please retry price refresh."
          : "Latest fare is not available. Please search again."
      );
      setShowRefreshNotice(true);
      return null;
    }

    const updated: FlightReviewPayload = {
      ...source,
      backendOffer: {
        ...source.backendOffer,
        priceConfirmationId: result.data.priceConfirmationId,
        ...(result.data.fareId ? { fareId: result.data.fareId } : { fareId: undefined }),
        priceStatus: result.data.status,
        expiresAt: result.data.expiresAt,
        supplierPrice: result.data.supplierPrice || source.backendOffer.supplierPrice,
        displayPrice,
        paymentQuote: result.data.paymentQuote,
        priceTotal: displayPrice.amount,
        currency: normalizeFlightCurrency(displayPrice.currency),
      },
      pricing: {
        ...source.pricing,
        currency: normalizeFlightCurrency(displayPrice.currency),
        perAdultBaseFare: displayPrice.amount / Math.max(source.passengers.adults, 1),
        baseFareTotal: displayPrice.amount,
        tax: 0,
        surcharge: 0,
        totalAmount: displayPrice.amount,
      },
    };
    setReviewData(updated);
    saveFlightReviewPayload(updated);
    setTimeLeft(10 * 60);
    setIsExpired(false);
    setShowRefreshNotice(false);
    setBackendPriceState("confirmed");
    return updated;
  }

  function acceptBackendPriceChange() {
    if (!reviewData?.backendOffer || !pendingPriceChange) return;
    const result = pendingPriceChange.response;
    const displayPrice = getBackendDisplayPrice(result, reviewData);
    const updated: FlightReviewPayload = {
      ...reviewData,
      backendOffer: {
        ...reviewData.backendOffer,
        priceConfirmationId: result.priceConfirmationId,
        priceStatus: result.status,
        expiresAt: result.expiresAt,
        supplierPrice: result.supplierPrice || reviewData.backendOffer.supplierPrice,
        displayPrice,
        paymentQuote: result.paymentQuote,
        priceTotal: displayPrice.amount,
        currency: normalizeFlightCurrency(displayPrice.currency),
      },
      pricing: {
        ...reviewData.pricing,
        currency: normalizeFlightCurrency(displayPrice.currency),
        perAdultBaseFare: displayPrice.amount / Math.max(reviewData.passengers.adults, 1),
        baseFareTotal: displayPrice.amount,
        tax: 0,
        surcharge: 0,
        totalAmount: displayPrice.amount,
      },
    };
    setPendingPriceChange(null);
    setReviewData(updated);
    saveFlightReviewPayload(updated);
    setBackendBlockerMessage("");
    setBackendPriceState("confirmed");
    setTimeLeft(10 * 60);
    setIsExpired(false);
    setShowRefreshNotice(false);
  }
}

function buildFlightSmokeIdempotencyKey(baseKey: string, smokeRunId?: string) {
  const cleanSmokeRunId = sanitizeSmokeRunId(smokeRunId);
  return cleanSmokeRunId ? `${baseKey}:smoke:${cleanSmokeRunId}` : baseKey;
}

function sanitizeSmokeRunId(value?: string) {
  if (
    process.env.NEXT_PUBLIC_PAYMENT_GATEWAY_TEST_ENABLED !== "true" ||
    process.env.NEXT_PUBLIC_RAZORPAY_CHECKOUT_ENABLED !== "true"
  ) {
    return "";
  }

  return String(value || "").trim().replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 80);
}
function getBackendOfferSnapshotTotal(
  source: FlightReviewPayload,
  fallbackTotal: number
) {
  const backendTotal = Number(source.backendOffer?.displayPrice?.amount || source.backendOffer?.priceTotal);
  if (Number.isFinite(backendTotal) && backendTotal > 0) {
    return backendTotal;
  }

  const baseFare = Number(source.pricing?.baseFareTotal || 0);
  const tax = Number(source.pricing?.tax || 0);
  const surcharge = Number(source.pricing?.surcharge || 0);
  const discount = Number(source.pricing?.discount || 0);
  const tplCredit = Number(source.pricing?.tplCredit || 0);
  const reconstructedTotal = baseFare + tax + surcharge - discount - tplCredit;

  if (Number.isFinite(reconstructedTotal) && reconstructedTotal > 0) {
    return Math.round(reconstructedTotal);
  }

  return Math.round(Number(source.pricing?.totalAmount || fallbackTotal || 0));
}

function getBackendDisplayPrice(
  response: BackendFlightPriceConfirmResponse,
  source: FlightReviewPayload
) {
  const fallbackCurrency = normalizeFlightCurrency(
    source.backendOffer?.displayPrice?.currency ||
      source.pricing?.currency ||
      readFlightDisplayCurrencyPreference()
  );
  if (response.displayPrice && Number.isFinite(Number(response.displayPrice.amount))) {
    return {
      amount: Number(response.displayPrice.amount),
      currency: normalizeFlightCurrency(response.displayPrice.currency || fallbackCurrency),
      ...(response.displayPrice.fxRate ? { fxRate: response.displayPrice.fxRate } : {}),
      ...(response.displayPrice.fxSource ? { fxSource: response.displayPrice.fxSource } : {}),
      ...(response.displayPrice.fxTimestamp ? { fxTimestamp: response.displayPrice.fxTimestamp } : {}),
      ...(response.displayPrice.roundingVersion ? { roundingVersion: response.displayPrice.roundingVersion } : {}),
    };
  }
  return {
    amount: Number(response.price?.total || 0),
    currency: normalizeFlightCurrency(response.price?.currency || fallbackCurrency),
  };
}

function allBackendAncillaryOptions(set: BackendFlightAncillarySet): BackendFlightAncillaryOption[] {
  return [...(set.seats || []), ...(set.paidBaggage || []), ...(set.meals || [])];
}

function summarizeBackendAncillaryQuote(quote: BackendFlightAncillaryQuote | null) {
  const totals = {
    seats: 0,
    paidBaggage: 0,
    meals: 0,
  };
  for (const item of quote?.selectedAncillaries || []) {
    const amount = Number(item.displayPrice?.amount || 0);
    if (item.category === "seat") totals.seats += amount;
    if (item.category === "paid_baggage") totals.paidBaggage += amount;
    if (item.category === "meal") totals.meals += amount;
  }
  return {
    seats: Math.round(totals.seats * 100) / 100,
    paidBaggage: Math.round(totals.paidBaggage * 100) / 100,
    meals: Math.round(totals.meals * 100) / 100,
  };
}

function mapBackendFieldErrors(fieldErrors: unknown[] | undefined) {
  const mapped: Record<string, string> = {};
  if (!Array.isArray(fieldErrors)) return mapped;
  for (const item of fieldErrors) {
    if (!item || typeof item !== "object" || Array.isArray(item)) continue;
    const record = item as Record<string, unknown>;
    const field = typeof record.field === "string" ? record.field : "";
    const message = typeof record.message === "string" ? record.message : "";
    if (field.startsWith("travellers.") && message) mapped[field] = message;
  }
  return mapped;
}
