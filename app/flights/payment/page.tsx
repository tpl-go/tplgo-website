"use client";

import { useEffect, useMemo, useState } from "react";
import LoginModal from "@/app/components/common/LoginModal";
import { AUTH_UPDATED_EVENT } from "@/app/lib/booking/guestAuth";
import { applyPaymentMethod } from "@/app/data/booking/applyPaymentMethod";
import { startPaymentProcess } from "@/app/data/booking/startPaymentProcess";
import {
  handlePaymentSuccess,
  handlePaymentFailure,
} from "@/app/data/booking/completePaymentProcess";
import { confirmBooking } from "@/app/data/booking/confirmBooking";
import { expireBooking } from "@/app/data/booking/expireBooking";
import { applyBenefitPricing } from "@/app/lib/pricing/applyBenefitPricing";
import {
  getWallet,
  saveWallet,
  addWalletLedgerItem,
  type Wallet,
} from "@/app/lib/wallet/walletStorage";
import {
  startFlightBackendCheckout,
  type FlightBackendCheckoutRefs,
} from "@/app/lib/api/flightCheckoutIntegration";
import { confirmBackendFlightPrice } from "@/app/lib/api/flightPriceApi";
import { simulateBackendFlightBooking } from "@/app/lib/api/flightBookingSimulationApi";
import {
  confirmFlightTestPayment,
  createFlightTestPaymentOrder,
  type BackendFlightTestPaymentConfirmResponse,
  type BackendFlightTestPaymentOrderResponse,
} from "@/app/lib/api/flightTestPaymentApi";
import {
  isRazorpayTestCheckoutEnabled,
  isValidRazorpayTestCheckoutPayload,
  openRazorpayTestCheckout,
} from "@/app/lib/api/razorpayCheckoutClient";
import {
  isInrFlightCurrency,
  normalizeFlightCurrency,
  type FlightCurrency,
} from "@/app/lib/flights/flightCurrency";

import FlightPaymentTopSummary from "@/app/components/payment/flight/FlightPaymentTopSummary";
import FlightPaymentInsuranceCard from "@/app/components/payment/flight/FlightPaymentInsuranceCard";
import FlightPaymentOptionSection from "@/app/components/payment/flight/FlightPaymentOptionSection";
import FlightPaymentPriceCard from "@/app/components/payment/flight/FlightPaymentPriceCard";

type FlightBackendCheckoutRefsWithBookingPersistence = FlightBackendCheckoutRefs & {
  backendBookingRef?: string;
  bookingPersisted?: boolean;
};

type StoredPayload = {
  reviewData?: any;
  travellerValidation?: any;
  seatMealData?: {
    seatTotal?: number;
    mealTotal?: number;
    seatStatus?: "pending" | "selected" | "skipped";
    mealStatus?: "pending" | "selected" | "skipped";
    seats?: {
      travellerId: string;
      seatNumber: string;
      price: number;
    }[];
    meals?: {
      travellerId: string;
      mealName: string;
      price: number;
    }[];
  };
  cabData?: {
    cabPrice?: number;
    cabStatus?: "pending" | "selected" | "skipped";
    cabLabel?: string;
    cabType?: "airport" | "outstation" | "none";
  };
  insuranceData?: {
    insurancePrice?: number;
    insuranceStatus?: "pending" | "selected" | "skipped";
    insuranceLabel?: string;
  };
  addonsData?: {
    addonsPrice?: number;
    addonsStatus?: "pending" | "selected" | "skipped";
    addonsLabel?: string;
    selectedItems?: string[];
  };
  offerData?: {
    discountAmount?: number;
    code?: string;
    title?: string;
    description?: string;
  } | null;
  walletData?: {
    promoUsed: number;
    earnedUsed: number;
    refundUsed: number;
    refundCredit: number;
    finalPayable: number;
    settlementMode: "payment" | "save" | "wallet_credit";
  };
  earnedCreditAmount?: number;
  timerLeft?: number;
  backendSimulation?: {
    simulationId: string;
    bookingDraftId: string;
    bookingRef: string;
    priceConfirmationId: string;
    expiresAt: string;
    currency?: FlightCurrency;
    backendRequestId?: string;
  };
};

function sanitizeRazorpayContact(value: unknown): string {
  const digits = String(value || "").replace(/\D/g, "");
  if (digits.length > 10 && digits.startsWith("91")) {
    return digits.slice(-10);
  }
  return digits.slice(0, 10);
}


function sanitizeFlightPaymentStoragePayload<T>(value: T): T {
  const blockedKeys = new Set([
    "gatewaySignature",
    "razorpay_signature",
    "rawRazorpay",
    "rawResponse",
    "razorpayResponse",
  ]);

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeFlightPaymentStoragePayload(item)) as T;
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([key]) => !blockedKeys.has(key))
        .map(([key, item]) => [key, sanitizeFlightPaymentStoragePayload(item)])
    ) as T;
  }

  return value;
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
function getFlightTestPaymentMethod(selectedPaymentMethod: string) {
  if (
    process.env.NEXT_PUBLIC_PAYMENT_GATEWAY_TEST_ENABLED === "true" &&
    process.env.NEXT_PUBLIC_RAZORPAY_CHECKOUT_ENABLED === "true"
  ) {
    return "razorpay";
  }

  return selectedPaymentMethod || "mock";
}

function isBackendOfferTestPaymentExpected(payload: StoredPayload | null) {
  return Boolean(
    isRazorpayTestCheckoutEnabled() &&
      payload?.reviewData?.backendOffer
  );
}

const FLIGHT_INR_TEST_PAYMENT_UNSUPPORTED_MESSAGE =
  "This provider fare is currently not eligible for INR test payment.";

function getBackendDraftCurrency(payload: StoredPayload | null): FlightCurrency {
  return normalizeFlightCurrency(
    payload?.backendSimulation?.currency ||
      payload?.reviewData?.backendOffer?.currency ||
      payload?.reviewData?.pricing?.currency
  );
}

function hasBackendFlightDraft(payload: StoredPayload | null): boolean {
  return Boolean(payload?.backendSimulation?.bookingDraftId);
}

function buildBackendTravellersForPayment(
  travellerValidation: StoredPayload["travellerValidation"],
  passengers: StoredPayload["reviewData"]["passengers"]
) {
  const source = Array.isArray(travellerValidation?.travellers)
    ? travellerValidation.travellers
    : [];
  const types: Array<"adult" | "child" | "infant"> = [
    ...Array.from({ length: passengers?.adults || 1 }, () => "adult" as const),
    ...Array.from({ length: passengers?.children || 0 }, () => "child" as const),
    ...Array.from({ length: passengers?.infants || 0 }, () => "infant" as const),
  ];

  return types.map((type, index) => {
    const traveller = source[index] || {};
    return {
      type,
      ...(typeof traveller.title === "string" && traveller.title ? { title: traveller.title } : {}),
      firstName: String(traveller.firstName || traveller.name || `Traveller${index + 1}`),
      lastName: String(traveller.lastName || "."),
      ...(typeof traveller.dateOfBirth === "string" && traveller.dateOfBirth ? { dateOfBirth: traveller.dateOfBirth } : {}),
      ...(typeof traveller.gender === "string" && traveller.gender ? { gender: traveller.gender } : {}),
      ...(typeof traveller.nationality === "string" && traveller.nationality ? { nationality: traveller.nationality } : {}),
    };
  });
}

function buildBackendContactDetailsForPayment(
  travellerValidation: StoredPayload["travellerValidation"],
  mobile: string,
  email: string
) {
  const contact = travellerValidation?.contactDetails || {};
  return {
    countryCode: contact.countryCode || "+91",
    mobile: mobile || contact.mobile || "9999999999",
    email: email || contact.email || "guest@example.com",
  };
}

function getActiveUser() {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem("tpl_auth_session_v1");
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed?.user || null;
  } catch {
    return null;
  }
}

export default function FlightPaymentPage() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [paymentActionState, setPaymentActionState] = useState<
    "idle" | "processing" | "success" | "failure"
  >("idle");
  const [backendPaymentStep, setBackendPaymentStep] = useState<
    | "idle"
    | "creating_order"
    | "opening_razorpay"
    | "verifying_payment"
    | "confirmation_failed"
    | "payment_cancelled"
    | "confirmed"
    | "failed"
  >("idle");
  const [paymentFailureMessage, setPaymentFailureMessage] = useState("");
  const [storedPayload, setStoredPayload] = useState<StoredPayload | null>(null);
  const [insuranceSelected, setInsuranceSelected] = useState(false);
  const [insuranceAmount, setInsuranceAmount] = useState(0);
  const [activeUser, setActiveUser] = useState<any>(null);
  const [wallet, setWallet] = useState<Wallet>({
    promoCredit: 0,
    earnedCredit: 0,
    refundableBalance: 0,
  });

  const [timeLeft, setTimeLeft] = useState(10 * 60);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const raw =
      typeof window !== "undefined"
        ? sessionStorage.getItem("tplFlightBookingReviewData")
        : null;

    if (!raw) return;

    try {
      const parsed: StoredPayload = JSON.parse(raw);
      setStoredPayload(parsed);

      if (
        parsed?.insuranceData?.insurancePrice &&
        parsed.insuranceData.insurancePrice > 0
      ) {
        setInsuranceSelected(true);
        setInsuranceAmount(parsed.insuranceData.insurancePrice);
      }

      if (typeof parsed?.timerLeft === "number" && parsed.timerLeft > 0) {
        setTimeLeft(parsed.timerLeft);
      }
    } catch (error) {
      console.error("Failed to parse flight payment payload:", error);
    }
  }, []);

  useEffect(() => {
    const syncUserWallet = () => {
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

    syncUserWallet();

    window.addEventListener(AUTH_UPDATED_EVENT, syncUserWallet);
    window.addEventListener("storage", syncUserWallet);

    return () => {
      window.removeEventListener(AUTH_UPDATED_EVENT, syncUserWallet);
      window.removeEventListener("storage", syncUserWallet);
    };
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) {
      setIsExpired(true);
      expireBooking();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const next = prev - 1;

        const raw =
          typeof window !== "undefined"
            ? sessionStorage.getItem("tplFlightBookingReviewData")
            : null;

        if (raw) {
          try {
            const parsed: StoredPayload = JSON.parse(raw);
            sessionStorage.setItem(
              "tplFlightBookingReviewData",
              JSON.stringify({
                ...parsed,
                timerLeft: next > 0 ? next : 0,
              })
            );
          } catch (error) {
            console.error("Failed to update timerLeft in session:", error);
          }
        }

        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const formattedTime = useMemo(() => {
    const mm = String(Math.floor(timeLeft / 60)).padStart(2, "0");
    const ss = String(timeLeft % 60).padStart(2, "0");
    return `${mm}:${ss}`;
  }, [timeLeft]);

  const reviewData = storedPayload?.reviewData;
  const travellerValidation = storedPayload?.travellerValidation;
  const seatMealData = storedPayload?.seatMealData || {};
  const cabData = storedPayload?.cabData || {};
  const addonsData = storedPayload?.addonsData || {};
  const offerData = storedPayload?.offerData || null;

  const totalTravellers =
    (reviewData?.passengers?.adults || 0) +
      (reviewData?.passengers?.children || 0) +
      (reviewData?.passengers?.infants || 0) || 1;

  const priceBreakup = useMemo(() => {
    const baseFare =
  Number(reviewData?.pricing?.baseFareTotal || 0) ||
  (reviewData?.pricing?.perAdultBaseFare || 0) *
    totalTravellers;
    const tax = reviewData?.pricing?.tax || 0;
    const surcharge = reviewData?.pricing?.surcharge || 0;
    const seatTotal = seatMealData?.seatTotal || 0;
    const mealTotal = seatMealData?.mealTotal || 0;
    const cabTotal = cabData?.cabPrice || 0;
    const addonsTotal = addonsData?.addonsPrice || 0;
    const appliedOffer = offerData?.discountAmount || 0;
    const discount = reviewData?.pricing?.discount || 0;
    const oldTplCredit = reviewData?.pricing?.tplCredit || 0;

    const benefitPricing = applyBenefitPricing({
  baseAmount: baseFare,

  taxes: tax,
  fees: surcharge,

  seatCharges: seatTotal,
  mealCharges: mealTotal,
  cabCharges: cabTotal,
  insuranceCharges: insuranceSelected
    ? insuranceAmount
    : 0,

  addOns: addonsTotal,

  offerDiscount:
  appliedOffer + discount,

  promoCredit: activeUser?.mobile
    ? wallet.promoCredit
    : 0,

  earnedCredit: activeUser?.mobile
    ? wallet.earnedCredit
    : 0,

  refundWallet: activeUser?.mobile
    ? wallet.refundableBalance
    : 0,
});

const walletCalc = {
  promoUsed: benefitPricing.promoUsed,
  earnedUsed: benefitPricing.earnedUsed,
  refundUsed: benefitPricing.refundUsed,
  finalPayable: benefitPricing.finalPayable,
};

const tplCredit =
  benefitPricing.promoUsed +
  benefitPricing.earnedUsed;

const totalBeforeWallet =
  benefitPricing.payableBeforeRefundWallet;

const finalTotalAmount =
  benefitPricing.finalPayable;

    return {
  currency: normalizeFlightCurrency(reviewData?.backendOffer?.currency || reviewData?.pricing?.currency),
  baseFare,
  tax,
  surcharge,
  seatTotal,
  mealTotal,
  cabTotal,
  insuranceTotal: insuranceSelected ? insuranceAmount : 0,
  addonsTotal,
  appliedOffer,
  discount,
  tplCredit,
  walletCalc,
  totalBeforeWallet,
  baseAfterOffer: benefitPricing.baseAfterOffer,
  totalAmount: finalTotalAmount,
};
  }, [
    reviewData,
    totalTravellers,
    seatMealData,
    cabData,
    addonsData,
    insuranceSelected,
    insuranceAmount,
    offerData,
    activeUser,
    wallet,
  ]);

  const earnedOnThisBooking = Number(
  storedPayload?.earnedCreditAmount ||
    Math.floor(
      Number(priceBreakup.baseAfterOffer || 0) * 0.02
    )
);

  const ensureBackendSimulationForTestPayment = async (
    sourcePayload: StoredPayload,
    confirmationMobile: string,
    confirmationEmail: string
  ): Promise<StoredPayload> => {
    if (sourcePayload.backendSimulation?.bookingDraftId) return sourcePayload;

    const sourceReviewData = sourcePayload.reviewData;
    const backendOffer = sourceReviewData?.backendOffer;
    if (!backendOffer) return sourcePayload;

    let priceConfirmationId = backendOffer.priceConfirmationId;
    let nextReviewData = sourceReviewData;

    if (!priceConfirmationId) {
      const priceResult = await confirmBackendFlightPrice(backendOffer.offerId, {
        searchId: backendOffer.searchId,
        ...(backendOffer.fareId ? { fareId: backendOffer.fareId } : {}),
        passengers: sourceReviewData.passengers,
        currency: "INR",
        clientOfferSnapshot: {
          total: Number(backendOffer.priceTotal || priceBreakup.totalAmount || 0),
          currency: normalizeFlightCurrency(backendOffer.currency),
        },
      });

      if (!priceResult.ok) {
        throw new Error(priceResult.error.message || "Could not confirm latest backend fare.");
      }

      priceConfirmationId = priceResult.data.priceConfirmationId;
      nextReviewData = {
        ...sourceReviewData,
        backendOffer: {
          ...backendOffer,
          priceConfirmationId,
          priceStatus: priceResult.data.status,
          expiresAt: priceResult.data.expiresAt,
          priceTotal: priceResult.data.price.total,
          currency: normalizeFlightCurrency(priceResult.data.price.currency),
        },
        pricing: {
          ...(sourceReviewData.pricing || {}),
          currency: normalizeFlightCurrency(priceResult.data.price.currency),
        },
      };
    }

    if (!priceConfirmationId) {
      throw new Error("Backend price confirmation was missing.");
    }

    const simulation = await simulateBackendFlightBooking({
      searchId: backendOffer.searchId,
      offerId: backendOffer.offerId,
      ...(backendOffer.fareId ? { fareId: backendOffer.fareId } : {}),
      priceConfirmationId,
      passengers: nextReviewData.passengers,
      travellers: buildBackendTravellersForPayment(
        travellerValidation,
        nextReviewData.passengers
      ),
      contactDetails: buildBackendContactDetailsForPayment(
        travellerValidation,
        confirmationMobile,
        confirmationEmail
      ),
      clientPricingSnapshot: {
        total: priceBreakup.totalAmount,
        currency: normalizeFlightCurrency(nextReviewData.backendOffer?.currency),
      },
      idempotencyKey: buildFlightSmokeIdempotencyKey(
        `flight-sim:${priceConfirmationId}`,
        backendOffer.smokeRunId
      ),
    });

    if (!simulation.ok) {
      throw new Error(simulation.error.message || "Could not create simulated booking draft.");
    }

    const nextPayload: StoredPayload = {
      ...sourcePayload,
      reviewData: {
        ...nextReviewData,
        backendOffer: {
          ...nextReviewData.backendOffer,
          priceConfirmationId: simulation.data.priceConfirmationId,
          expiresAt: simulation.data.expiresAt,
          currency: normalizeFlightCurrency(simulation.data.priceSnapshot.currency),
        },
      },
      backendSimulation: {
        simulationId: simulation.data.simulationId,
        bookingDraftId: simulation.data.bookingDraftId,
        bookingRef: simulation.data.bookingRef,
        priceConfirmationId: simulation.data.priceConfirmationId,
        expiresAt: simulation.data.expiresAt,
        currency: normalizeFlightCurrency(simulation.data.priceSnapshot.currency),
        ...(backendOffer.backendRequestId ? { backendRequestId: backendOffer.backendRequestId } : {}),
      },
    };

    sessionStorage.setItem(
      "tplFlightBookingReviewData",
      JSON.stringify(sanitizeFlightPaymentStoragePayload(nextPayload))
    );
    setStoredPayload(nextPayload);
    return nextPayload;
  };

  const handleMockPayment = async (shouldSucceed = true) => {
    if (!selectedPaymentMethod || isExpired || paymentActionState === "processing") return;

    setPaymentActionState("processing");
    setBackendPaymentStep("idle");
    setPaymentFailureMessage("");
    startPaymentProcess();

    await new Promise((resolve) => setTimeout(resolve, 1500));

    if (shouldSucceed) {
      const contactDetails = travellerValidation?.contactDetails || {};
      const leadTraveller = travellerValidation?.travellers?.[0] || {};

      const confirmationMobile = sanitizeRazorpayContact(
        contactDetails?.mobile ||
          contactDetails?.phone ||
          activeUser?.mobile ||
          ""
      );
      const confirmationEmail =
        contactDetails?.email ||
        leadTraveller?.email ||
        activeUser?.email ||
        "";

      let backendRefs: FlightBackendCheckoutRefsWithBookingPersistence = {};
      const frontendBookingId = `TPL-FLT-${Date.now()}`;
      let backendCheckoutPayload: Record<string, unknown> | null = null;
      let backendTestOrder: BackendFlightTestPaymentOrderResponse | null = null;
      let backendTestConfirmation: BackendFlightTestPaymentConfirmResponse | null = null;
      let paymentPayload = storedPayload;

      try {
        if (paymentPayload && isBackendOfferTestPaymentExpected(paymentPayload)) {
          setBackendPaymentStep("creating_order");
          paymentPayload = await ensureBackendSimulationForTestPayment(
            paymentPayload,
            confirmationMobile,
            confirmationEmail
          );
        }

        if (paymentPayload?.backendSimulation?.bookingDraftId) {
          const bookingDraftId = paymentPayload.backendSimulation.bookingDraftId;
          const draftCurrency = getBackendDraftCurrency(paymentPayload);
          if (!isInrFlightCurrency(draftCurrency)) {
            setBackendPaymentStep("failed");
            setPaymentFailureMessage(FLIGHT_INR_TEST_PAYMENT_UNSUPPORTED_MESSAGE);
            throw new Error(FLIGHT_INR_TEST_PAYMENT_UNSUPPORTED_MESSAGE);
          }

          setBackendPaymentStep("creating_order");
          const testOrder = await createFlightTestPaymentOrder(bookingDraftId, {
            amount: priceBreakup.totalAmount,
            currency: "INR",
            paymentMethod: getFlightTestPaymentMethod(selectedPaymentMethod),
            contactDetails: {
              mobile: confirmationMobile,
              email: confirmationEmail,
            },
            idempotencyKey: buildFlightSmokeIdempotencyKey(`flight:test-order:${bookingDraftId}:${paymentPayload.backendSimulation.priceConfirmationId}`, paymentPayload?.reviewData?.backendOffer?.smokeRunId),
          });

          if (!testOrder.ok) {
            if (testOrder.error.code === "FLIGHT_PAYMENT_CURRENCY_UNSUPPORTED") {
              throw new Error(FLIGHT_INR_TEST_PAYMENT_UNSUPPORTED_MESSAGE);
            }
            throw new Error(testOrder.error.message || "Could not create test payment order.");
          }

          const checkoutPayload = testOrder.data.checkout;
          const useRazorpayTestCheckout =
            isRazorpayTestCheckoutEnabled() &&
            isValidRazorpayTestCheckoutPayload(checkoutPayload);

          if (useRazorpayTestCheckout) {
            setBackendPaymentStep("opening_razorpay");
          }

          const razorpayCheckoutResult = useRazorpayTestCheckout
            ? await openRazorpayTestCheckout(checkoutPayload)
            : null;

          setBackendPaymentStep("verifying_payment");
          const paymentIdentifier =
            checkoutPayload?.paymentId || testOrder.data.paymentId || testOrder.data.paymentRef;
          if (!paymentIdentifier) {
            throw new Error("Backend test payment reference was missing.");
          }

          const gatewayPaymentId = razorpayCheckoutResult?.gatewayPaymentId || `mock_frontend_${Date.now()}`;
          const gatewayOrderId = razorpayCheckoutResult?.gatewayOrderId;
          const gatewaySignature = razorpayCheckoutResult?.gatewaySignature;
          const testConfirm = await confirmFlightTestPayment(bookingDraftId, {
            paymentId: paymentIdentifier,
            gatewayPaymentId,
            ...(gatewayOrderId ? { gatewayOrderId, razorpay_order_id: gatewayOrderId } : {}),
            ...(gatewaySignature ? { gatewaySignature, razorpay_signature: gatewaySignature } : {}),
            ...(razorpayCheckoutResult?.gatewayPaymentId
              ? { razorpay_payment_id: razorpayCheckoutResult.gatewayPaymentId }
              : {}),
            testOutcome: "success",
            idempotencyKey: buildFlightSmokeIdempotencyKey(`flight:test-confirm:${bookingDraftId}:${paymentIdentifier}`, paymentPayload?.reviewData?.backendOffer?.smokeRunId),
          });

          if (!testConfirm.ok || testConfirm.data.status !== "TPL_TEST_BOOKING_CONFIRMED") {
            throw new Error(testConfirm.ok ? "Test payment was not confirmed." : testConfirm.error.message);
          }

          const hasPersistedBackendBooking =
            testConfirm.data.bookingPersisted === true &&
            Boolean(testConfirm.data.backendBookingRef || testConfirm.data.backendBookingId);
          if (!hasPersistedBackendBooking) {
            throw new Error("Backend did not persist the confirmed test booking.");
          }

          setBackendPaymentStep("confirmed");
          backendTestOrder = testOrder.data;
          backendTestConfirmation = testConfirm.data;
          backendRefs = {
            backendPaymentId: testConfirm.data.paymentId,
            backendBookingId: testConfirm.data.backendBookingId,
            backendBookingRef: testConfirm.data.backendBookingRef,
            bookingPersisted: testConfirm.data.bookingPersisted,
            backendRequestId: paymentPayload.backendSimulation.backendRequestId,
            backendServiceType: "flight",
            backendCheckoutStatus: testConfirm.data.status,
          };

          const updatedReviewPayload = {
            ...paymentPayload,
            backendTestPayment: {
              bookingDraftId,
              bookingRef: testConfirm.data.bookingRef,
              paymentId: testConfirm.data.paymentId,
              paymentRef: testConfirm.data.paymentRef,
              backendBookingId: testConfirm.data.backendBookingId,
              backendBookingRef: testConfirm.data.backendBookingRef,
              bookingPersisted: testConfirm.data.bookingPersisted,
              attemptId: testConfirm.data.attemptId,
              gateway: testOrder.data.gateway,
              status: testConfirm.data.status,
              confirmationRef: testConfirm.data.simulatedConfirmation.confirmationRef,
              supplierBookingDisabled: true,
              bookingAllowed: false,
              ticketingAllowed: false,
              paymentCaptureAllowed: false,
              pnr: null,
              ticketNumber: null,
            },
          };
          sessionStorage.setItem(
            "tplFlightBookingReviewData",
            JSON.stringify(sanitizeFlightPaymentStoragePayload(updatedReviewPayload))
          );
          setStoredPayload(updatedReviewPayload as StoredPayload);
        } else {
        if (isRazorpayTestCheckoutEnabled()) {
          throw new Error("Backend simulated booking draft was missing. No booking was confirmed.");
        }

        const backendRawPayload = {
          ...paymentPayload,
          bookingId: frontendBookingId,
          id: frontendBookingId,
          legacyFrontendId: frontendBookingId,
          mobile: confirmationMobile,
          contactDetails: {
            ...contactDetails,
            mobile: confirmationMobile,
            email: confirmationEmail,
          },
          reviewData,
          travellerValidation,
          seatMealData,
          cabData,
          insuranceData: {
            insuranceStatus: insuranceSelected ? "selected" : "skipped",
            insurancePrice: insuranceSelected ? insuranceAmount : 0,
          },
          addonsData,
          offerData,
          walletData: priceBreakup.walletCalc,
          walletBreakdown: priceBreakup.walletCalc,
          selectedPaymentMethod,
          paymentMethod: selectedPaymentMethod,
          paymentStatus: "paid",
          paymentState: "success",
          priceBreakup,
          pricing: priceBreakup,
          pricingSnapshot: {
            baseFare: priceBreakup.baseFare,
            baseAfterOffer: priceBreakup.baseAfterOffer,
            appliedOffer: priceBreakup.appliedOffer,
            totalBeforeWallet: priceBreakup.totalBeforeWallet,
            finalPayable: priceBreakup.totalAmount,
          },
          earnedCreditAmount: earnedOnThisBooking,
          paymentData: {
            method: selectedPaymentMethod,
            totalPaid: priceBreakup.totalAmount,
            mobile: confirmationMobile,
            email: confirmationEmail,
            leadTraveller: {
              ...leadTraveller,
              mobile: confirmationMobile,
              email: confirmationEmail,
            },
            walletUsed:
              Number(priceBreakup.walletCalc.promoUsed || 0) +
              Number(priceBreakup.walletCalc.earnedUsed || 0) +
              Number(priceBreakup.walletCalc.refundUsed || 0),
            promoUsed: priceBreakup.walletCalc.promoUsed,
            earnedUsed: priceBreakup.walletCalc.earnedUsed,
            refundUsed: priceBreakup.walletCalc.refundUsed,
          },
          timerLeft: timeLeft,
        };

        const backendStart = await startFlightBackendCheckout(
          backendRawPayload as Record<string, unknown>
        );
        backendRefs = backendStart.refs;
        backendCheckoutPayload = backendStart.payload;

        if (backendStart.attempted) {
          const updatedReviewPayload = {
            ...backendStart.payload,
            ...backendStart.refs,
          };
          sessionStorage.setItem(
            "tplFlightBookingReviewData",
            JSON.stringify(sanitizeFlightPaymentStoragePayload(updatedReviewPayload))
          );
          setStoredPayload(updatedReviewPayload as StoredPayload);
        }
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "";
        const paymentCancelled = /cancelled|dismissed/i.test(errorMessage);
        const currencyUnsupported =
          errorMessage === FLIGHT_INR_TEST_PAYMENT_UNSUPPORTED_MESSAGE ||
          errorMessage.includes("FLIGHT_PAYMENT_CURRENCY_UNSUPPORTED");
        setBackendPaymentStep(
          paymentCancelled
            ? "payment_cancelled"
            : currencyUnsupported ||
              hasBackendFlightDraft(paymentPayload) ||
              isBackendOfferTestPaymentExpected(paymentPayload)
            ? "confirmation_failed"
            : "failed"
        );
        setPaymentFailureMessage(
          paymentCancelled
            ? "Payment was cancelled. No booking was confirmed."
            : currencyUnsupported
            ? FLIGHT_INR_TEST_PAYMENT_UNSUPPORTED_MESSAGE
            : hasBackendFlightDraft(paymentPayload) ||
              isBackendOfferTestPaymentExpected(paymentPayload)
            ? "Could not complete backend payment confirmation. No booking was confirmed."
            : "Payment failed. You can retry."
        );
        handlePaymentFailure();
        setPaymentActionState("failure");
        return;
      }

      const canonicalBackendBookingRef =
        backendTestConfirmation?.backendBookingRef || backendTestConfirmation?.bookingRef;
      const canonicalBackendBookingId = backendTestConfirmation?.backendBookingId;
      const canonicalBookingId = canonicalBackendBookingRef || frontendBookingId;

      const confirmationPayload = {
        ...paymentPayload,
        bookingId: canonicalBookingId,
        id: canonicalBookingId,
        legacyFrontendId: canonicalBackendBookingRef ? frontendBookingId : undefined,
        backendBookingId: canonicalBackendBookingId,
        backendBookingRef: canonicalBackendBookingRef,
        bookingPersisted: backendTestConfirmation?.bookingPersisted,
        ...(backendCheckoutPayload || {}),
        ...backendRefs,
        ...(backendTestOrder
          ? {
              backendTestPaymentOrder: {
                bookingDraftId: backendTestOrder.bookingDraftId,
                bookingRef: backendTestOrder.bookingRef,
                paymentId: backendTestOrder.paymentId,
                paymentRef: backendTestOrder.paymentRef,
                attemptId: backendTestOrder.attemptId,
                gateway: backendTestOrder.gateway,
                amount: backendTestOrder.amount,
                currency: backendTestOrder.currency,
                status: backendTestOrder.status,
                supplierBookingDisabled: true,
                bookingAllowed: false,
                ticketingAllowed: false,
                paymentCaptureAllowed: false,
                pnr: null,
                ticketNumber: null,
              },
            }
          : {}),
        ...(backendTestConfirmation
          ? {
              backendTestPaymentConfirmation: {
                bookingDraftId: backendTestConfirmation.bookingDraftId,
                bookingRef: backendTestConfirmation.bookingRef,
                paymentId: backendTestConfirmation.paymentId,
                paymentRef: backendTestConfirmation.paymentRef,
                backendBookingId: backendTestConfirmation.backendBookingId,
                backendBookingRef: backendTestConfirmation.backendBookingRef,
                bookingPersisted: backendTestConfirmation.bookingPersisted,
                attemptId: backendTestConfirmation.attemptId,
                status: backendTestConfirmation.status,
                confirmationRef: backendTestConfirmation.simulatedConfirmation.confirmationRef,
                confirmedAt: backendTestConfirmation.simulatedConfirmation.confirmedAt,
                supplierBookingDisabled: true,
                bookingAllowed: false,
                ticketingAllowed: false,
                paymentCaptureAllowed: false,
                pnr: null,
                ticketNumber: null,
              },
            }
          : {}),
        reviewData,
        travellerValidation,
        seatMealData,
        cabData,
        insuranceData: {
          insuranceStatus: insuranceSelected ? "selected" : "skipped",
          insurancePrice: insuranceSelected ? insuranceAmount : 0,
        },
        addonsData,
        offerData,
        walletData: priceBreakup.walletCalc,
        walletBreakdown: priceBreakup.walletCalc,

pricingSnapshot: {
  baseFare: priceBreakup.baseFare,
  baseAfterOffer: priceBreakup.baseAfterOffer,
  appliedOffer: priceBreakup.appliedOffer,
  totalBeforeWallet: priceBreakup.totalBeforeWallet,
  finalPayable: priceBreakup.totalAmount,
  currency: getBackendDraftCurrency(paymentPayload),
},

earnedCreditAmount: earnedOnThisBooking,

paymentData: {
  method: selectedPaymentMethod,
  totalPaid: priceBreakup.totalAmount,
  currency: getBackendDraftCurrency(paymentPayload),
  paidAt: new Date().toISOString(),
  mobile: confirmationMobile,
  email: confirmationEmail,
leadTraveller: {
  ...leadTraveller,
  mobile: confirmationMobile,
  email: confirmationEmail,
},
          walletUsed:
            Number(priceBreakup.walletCalc.promoUsed || 0) +
            Number(priceBreakup.walletCalc.earnedUsed || 0) +
            Number(priceBreakup.walletCalc.refundUsed || 0),
          promoUsed: priceBreakup.walletCalc.promoUsed,
          earnedUsed: priceBreakup.walletCalc.earnedUsed,
          refundUsed: priceBreakup.walletCalc.refundUsed,
        },
        bookingMeta: {
          bookingId: canonicalBookingId,
          legacyFrontendId: canonicalBackendBookingRef ? frontendBookingId : undefined,
          backendBookingId: canonicalBackendBookingId,
          backendBookingRef: canonicalBackendBookingRef,
          bookingPersisted: backendTestConfirmation?.bookingPersisted,
          bookingStatus: backendTestConfirmation ? "TPL_TEST_BOOKING_CONFIRMED" : "confirmed",
          paymentStatus: "paid",
          createdAt: new Date().toISOString(),
          ...(backendTestConfirmation
            ? {
                supplierBookingDisabled: true,
                bookingAllowed: false,
                ticketingAllowed: false,
                paymentCaptureAllowed: false,
                pnr: null,
                ticketNumber: null,
              }
            : {}),
        },
      };

      const activeMobile = activeUser?.mobile || "";

      if (activeMobile) {
        const latestWallet = getWallet(activeMobile);

        const latestWalletCalc = applyBenefitPricing({
  baseAmount: priceBreakup.baseFare || 0,

  taxes:
    (priceBreakup.tax || 0) +
    (priceBreakup.surcharge || 0),

  seatCharges: priceBreakup.seatTotal || 0,
  mealCharges: priceBreakup.mealTotal || 0,
  cabCharges: priceBreakup.cabTotal || 0,
  insuranceCharges:
    priceBreakup.insuranceTotal || 0,

  addOns: priceBreakup.addonsTotal || 0,

  offerDiscount:
  Number(priceBreakup.appliedOffer || 0),

  promoCredit: latestWallet.promoCredit,
  earnedCredit: latestWallet.earnedCredit,
  refundWallet: latestWallet.refundableBalance,
});

        const nextWallet: Wallet = {
          promoCredit: Math.max(
            Number(latestWallet.promoCredit || 0) -
              Number(latestWalletCalc.promoUsed || 0),
            0
          ),
          earnedCredit: Math.max(
            Number(latestWallet.earnedCredit || 0) -
              Number(latestWalletCalc.earnedUsed || 0),
            0
          ),
          refundableBalance: Math.max(
            Number(latestWallet.refundableBalance || 0) -
              Number(latestWalletCalc.refundUsed || 0),
            0
          ),
        };

        saveWallet(nextWallet, activeMobile);
        setWallet(nextWallet);

        if (Number(latestWalletCalc.promoUsed || 0) > 0) {
          addWalletLedgerItem(
            {
              type: "wallet_used",
              title: "TPL Promo Credit Used",
              description: "Promo credit used for flight booking payment",
              amount: Number(latestWalletCalc.promoUsed || 0),
            },
            activeMobile
          );
        }

        if (Number(latestWalletCalc.earnedUsed || 0) > 0) {
          addWalletLedgerItem(
            {
              type: "wallet_used",
              title: "TPL Earned Credit Used",
              description: "Earned credit used for flight booking payment",
              amount: Number(latestWalletCalc.earnedUsed || 0),
            },
            activeMobile
          );
        }

        if (Number(latestWalletCalc.refundUsed || 0) > 0) {
          addWalletLedgerItem(
            {
              type: "wallet_used",
              title: "Refund Wallet Used",
              description: "Refund wallet used for flight booking payment",
              amount: Number(latestWalletCalc.refundUsed || 0),
            },
            activeMobile
          );
        }
      }

      handlePaymentSuccess();
      confirmBooking();
      setPaymentActionState("success");
      setBackendPaymentStep(backendTestConfirmation ? "confirmed" : "idle");

      sessionStorage.setItem(
        "tplFlightConfirmationData",
        JSON.stringify(sanitizeFlightPaymentStoragePayload(confirmationPayload))
      );

      window.location.href = "/flights/confirmation";
    } else {
      setBackendPaymentStep("failed");
      setPaymentFailureMessage("Payment failed. You can retry.");
      handlePaymentFailure();
      setPaymentActionState("failure");
    }
  };

  if (!reviewData) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "#eef3f8",
          color: "#000",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
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
          Flight payment data not found.
        </div>
      </main>
    );
  }

  return (
    <main className="tpl-flight-shell min-h-screen overflow-x-hidden bg-[#eef3f8] text-black">
      <div className="sticky top-0 z-40 flex min-h-[64px] items-center justify-between gap-3 border-b border-[#d9e2ec] bg-white px-4 py-3 lg:static lg:min-h-[72px] lg:px-7 lg:py-0">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#d9e2ec] bg-white text-[20px] font-black leading-none text-[#111827] shadow-sm md:hidden"
            aria-label="Go back"
          >
            ‹
          </button>

          <div
            style={{
              fontSize: "26px",
              fontWeight: 900,
              color: "#111827",
              letterSpacing: "-0.4px",
            }}
          >
            TPL
          </div>
        </div>

        <div
          className="flex shrink-0 items-center gap-2 text-[11px] font-extrabold md:gap-2.5 md:text-[13px]"
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              minWidth: "64px",
              height: "30px",
              borderRadius: "999px",
              background: "#ffffff",
              border: "1px solid #d9e2ec",
              padding: "0 12px",
              color: timeLeft < 120 ? "#dc2626" : "#111827",
              fontWeight: 800,
            }}
          >
            {formattedTime}
          </span>

          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              height: "30px",
              borderRadius: "999px",
              background: "#ffffff",
              border: "1px solid #d9e2ec",
              padding: "0 12px",
              color: "#0f766e",
              fontWeight: 800,
            }}
          >
            SAFE &amp; SECURED
          </span>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-3 py-4 pb-28 md:px-4 md:py-6 md:pb-6">
        {storedPayload?.backendSimulation ? (
          <div className="mb-4 rounded-xl border border-[#bfdbfe] bg-[#eff6ff] px-4 py-3 text-[12px] font-bold leading-5 text-[#1e3a8a] md:text-[13px]">
            {backendPaymentStep === "creating_order"
              ? "Creating TPL test payment order for this simulated flight booking."
              : backendPaymentStep === "opening_razorpay"
              ? "Opening Razorpay test checkout with backend-provided public checkout fields."
              : backendPaymentStep === "verifying_payment"
              ? "Verifying payment with TPL before confirming the booking."
              : backendPaymentStep === "confirmed"
              ? "Booking confirmed by TPL test payment. Supplier booking and ticketing remain disabled."
              : backendPaymentStep === "payment_cancelled" || backendPaymentStep === "confirmation_failed" || backendPaymentStep === "failed"
              ? paymentFailureMessage
              : "This backend-sourced booking will use TPL test payment only. Supplier PNR and ticketing are disabled."}
          </div>
        ) : null}

        <div className="flex flex-col items-stretch gap-4 xl:flex-row xl:gap-[18px]">
          <div className="flex min-w-0 flex-col gap-4 xl:w-[72%]">
            <FlightPaymentTopSummary
              reviewData={reviewData}
              travellerValidation={travellerValidation}
              seatMealData={storedPayload?.seatMealData}
              cabData={storedPayload?.cabData}
              insuranceData={{
                insuranceStatus: insuranceSelected ? "selected" : "skipped",
                insuranceLabel: insuranceSelected
                  ? "Travel Insurance Added"
                  : "Travel Insurance Skipped",
                insurancePrice: insuranceSelected ? insuranceAmount : 0,
              }}
              addonsData={storedPayload?.addonsData}
              offerData={storedPayload?.offerData}
            />

            <div
              style={{
                border: "1px solid #d9e2ec",
                background: "#ffffff",
                borderRadius: "16px",
                overflow: "hidden",
                boxShadow: "0 2px 8px rgba(15,23,42,0.04)",
              }}
            >
              <div
                style={{
                  padding: "18px 20px",
                  borderBottom: "1px solid #e5e7eb",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "16px",
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: "16px",
                      fontWeight: 800,
                      color: "#111827",
                    }}
                  >
                    Additional discounts and saved payment options
                  </div>
                  <div
                    style={{
                      marginTop: "4px",
                      fontSize: "13px",
                      color: "#6b7280",
                    }}
                  >
                    {activeUser?.mobile
                      ? "Wallet benefits are applied as per your account balance."
                      : "Login to access saved payments and wallet discounts!"}
                  </div>
                </div>

                {!activeUser?.mobile ? (
                  <button
                    onClick={() => setShowLoginModal(true)}
                    style={{
                      minWidth: "110px",
                      height: "42px",
                      border: "none",
                      borderRadius: "10px",
                      background: "#1d9bf0",
                      color: "#ffffff",
                      fontSize: "14px",
                      fontWeight: 800,
                      cursor: "pointer",
                    }}
                  >
                    LOGIN
                  </button>
                ) : null}
              </div>
            </div>

            <FlightPaymentInsuranceCard
              totalTravellers={totalTravellers}
              defaultSelected={insuranceSelected}
              pricePerTraveller={
                totalTravellers > 0
                  ? Math.round(
                      (storedPayload?.insuranceData?.insurancePrice ||
                        349 * totalTravellers) / totalTravellers
                    )
                  : 349
              }
              onSelectionChange={({ selected, totalInsuranceAmount }) => {
                setInsuranceSelected(selected);
                setInsuranceAmount(totalInsuranceAmount);
              }}
            />

            <FlightPaymentOptionSection
              payableAmount={priceBreakup.totalAmount}
              onPaymentMethodChange={(method) => {
                setSelectedPaymentMethod(method);
                applyPaymentMethod(method);
              }}
            />
          </div>

          <div className="min-w-0 self-stretch xl:w-[28%]">
            <FlightPaymentPriceCard
              priceBreakup={priceBreakup}
              earnedOnThisBooking={earnedOnThisBooking}
              selectedPaymentMethod={selectedPaymentMethod}
              paymentActionState={paymentActionState}
              isExpired={isExpired}
              onPayNow={() => handleMockPayment(true)}
              onRetryPayment={() => handleMockPayment(true)}
            />
          </div>
        </div>
      </div>

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </main>
  );
}
