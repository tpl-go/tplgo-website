"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import TrainBookingTopBar from "@/app/components/booking/train/TrainBookingTopBar";
import TrainBookingSummaryCard from "@/app/components/booking/train/TrainBookingSummaryCard";
import TrainTravellerDetailsSection from "@/app/components/booking/train/TrainTravellerDetailsSection";
import TrainContactDetailsSection from "@/app/components/booking/train/TrainContactDetailsSection";
import TrainIrctcAccountSection from "@/app/components/booking/train/TrainIrctcAccountSection";
import TrainBookingImportantInfo from "@/app/components/booking/train/TrainBookingImportantInfo";
import TrainBookingFareSummaryCard from "@/app/components/booking/train/TrainBookingFareSummaryCard";
import LoginModal from "@/app/components/common/LoginModal";
import TrainBookingOffersSection from "@/app/components/booking/train/TrainBookingOffersSection";
import {
  calculateSmartOfferDiscount,
  getSmartActiveOfferItem,
} from "@/app/lib/smartOffers";

import {
  areTrainTravellersValid,
  buildTrainBookingPageState,
  getTrainBookingPayload,
  isIrctcUsernameValid,
  isTrainContactValid,
} from "@/app/lib/train/trainBookingHelpers";
import type { TrainBookingPageState } from "@/app/lib/train/trainBookingTypes";
import { getWallet } from "@/app/lib/wallet/walletStorage";
import { AUTH_UPDATED_EVENT } from "@/app/lib/booking/guestAuth";
import { getSavedProfile } from "@/app/lib/account/profileStorage";

type TrainOfferItem = {
  code: string;
  title: string;
  description?: string;
  discountAmount: number;
};

function toNumber(value: any, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function clampAmount(value: number, min = 0, max = Number.POSITIVE_INFINITY) {
  return Math.min(Math.max(Math.round(toNumber(value)), min), max);
}

function calculateTrainNewBookingWallet(params: {
  baseAfterOffer: number;
  totalBeforeWallet: number;
  promoCredit: number;
  earnedCredit: number;
  refundableBalance: number;
}) {
  const baseAfterOffer = clampAmount(params.baseAfterOffer);
  const totalBeforeWallet = clampAmount(params.totalBeforeWallet);

  const promoCap = Math.floor(baseAfterOffer * 0.05);
  const earnedCap = Math.floor(baseAfterOffer * 0.1);
  const combinedTplCap = Math.floor(baseAfterOffer * 0.12);

  const promoUsed = clampAmount(
    Math.min(params.promoCredit, promoCap, totalBeforeWallet)
  );

  const earnedAllowedAfterPromo = Math.max(0, combinedTplCap - promoUsed);

  const earnedUsed = clampAmount(
    Math.min(
      params.earnedCredit,
      earnedCap,
      earnedAllowedAfterPromo,
      totalBeforeWallet - promoUsed
    )
  );

  const payableAfterTplCredit = Math.max(
    0,
    totalBeforeWallet - promoUsed - earnedUsed
  );

  const refundUsed = clampAmount(
    Math.min(params.refundableBalance, payableAfterTplCredit)
  );

  const finalPayable = Math.max(0, payableAfterTplCredit - refundUsed);

  return {
    promoUsed,
    earnedUsed,
    refundUsed,
    finalPayable,
    totalWalletUsed: promoUsed + earnedUsed + refundUsed,
    tplCreditUsed: promoUsed + earnedUsed,
  };
}

function getActiveUser() {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem("tpl_auth_session_v1");
    return raw ? JSON.parse(raw)?.user : null;
  } catch {
    return null;
  }
}

function getDisplayNameFromUser(user: any) {
  if (!user?.mobile) return "User";

  const sessionName = String(user?.fullName || "").trim();
  if (sessionName) return sessionName;

  const profile = getSavedProfile(user.mobile);
  const profileName = `${profile.firstName || ""} ${
    profile.lastName || ""
  }`.trim();

  if (profileName && profileName.toLowerCase() !== "pk") return profileName;

  return `User ${String(user.mobile).slice(-4)}`;
}

export default function TrainBookingPage() {
  const router = useRouter();

  const [pageState, setPageState] = useState<TrainBookingPageState | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [appliedOffer, setAppliedOffer] = useState<TrainOfferItem | null>(null);

  const [activeUser, setActiveUser] = useState<any>(null);
  const [wallet, setWallet] = useState({
    promoCredit: 0,
    earnedCredit: 0,
    refundableBalance: 0,
  });

  useEffect(() => {
    const payload = getTrainBookingPayload();
    if (!payload) return;

    setPageState(buildTrainBookingPageState(payload));
  }, []);

  useEffect(() => {
    const syncUserAndWallet = () => {
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

    syncUserAndWallet();

    window.addEventListener(AUTH_UPDATED_EVENT, syncUserAndWallet);
    window.addEventListener("storage", syncUserAndWallet);

    return () => {
      window.removeEventListener(AUTH_UPDATED_EVENT, syncUserAndWallet);
      window.removeEventListener("storage", syncUserAndWallet);
    };
  }, []);

  useEffect(() => {
    if (!pageState) return;
    if (pageState.timerLeft <= 0) return;

    const timer = setInterval(() => {
      setPageState((prev) =>
        prev
          ? {
              ...prev,
              timerLeft: prev.timerLeft - 1,
            }
          : prev
      );
    }, 1000);

    return () => clearInterval(timer);
  }, [pageState]);

  const timerLabel = useMemo(() => {
    if (!pageState) return "15:00";
    const mm = String(Math.floor(pageState.timerLeft / 60)).padStart(2, "0");
    const ss = String(pageState.timerLeft % 60).padStart(2, "0");
    return `${mm}:${ss}`;
  }, [pageState]);

  if (!pageState) {
    return (
      <main className="min-h-screen bg-[#f5f7fb]">
        <TrainBookingTopBar timerLabel="15:00" />
        <div className="mx-auto max-w-[1400px] px-4 py-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-[18px] font-bold text-slate-700">
            No train booking data found.
          </div>
        </div>
      </main>
    );
  }

  const { bookingPayload, travellers, contactDetails, irctcAccount } = pageState;

  const resultPricing =
    bookingPayload?.pricingSnapshot ||
    bookingPayload?.fareSnapshot ||
    bookingPayload?.priceBreakup ||
    {};

  const baseFare = clampAmount(
    resultPricing?.trueBaseFare ||
      resultPricing?.baseFare ||
      bookingPayload?.bookingSelection?.trueBaseFare ||
      bookingPayload?.bookingSelection?.baseFare ||
      bookingPayload?.bookingSelection?.originalTicketPrice ||
      bookingPayload?.bookingSelection?.ticketPrice ||
      0
  );

  const confirmUpgradeAmount = clampAmount(
    resultPricing?.confirmUpgradeAmount ||
      bookingPayload?.bookingSelection?.confirmUpgradeAmount ||
      0
  );

  const convenienceFee = Math.round(baseFare * 0.04);
  const gatewayFee = Math.round(baseFare * 0.015);

  const smartActiveOffer = getSmartActiveOfferItem();

  const resultAppliedOfferAmount = clampAmount(
    resultPricing?.appliedOfferAmount ||
      resultPricing?.offerDiscount ||
      resultPricing?.couponDiscount ||
      0
  );

  const resultMappedOffer =
    resultAppliedOfferAmount > 0
      ? {
          code:
            resultPricing?.appliedOfferCode ||
            resultPricing?.offerData?.couponCode ||
            resultPricing?.offerData?.code ||
            "",
          title:
            resultPricing?.appliedOfferTitle ||
            resultPricing?.offerData?.title ||
            "Offer Applied",
          description:
            resultPricing?.offerData?.description ||
            "Train offer applied on base fare.",
          discountAmount: resultAppliedOfferAmount,
        }
      : null;

  const estimatedBookingValue = baseFare;

  const smartMappedOffer =
    smartActiveOffer && !appliedOffer && !resultMappedOffer
      ? {
          code: smartActiveOffer.couponCode || smartActiveOffer.slug,
          title: smartActiveOffer.title,
          description:
            smartActiveOffer.description ||
            smartActiveOffer.subtitle ||
            "Smart train offer applied.",
          discountAmount: calculateSmartOfferDiscount(
            smartActiveOffer,
            estimatedBookingValue || 1200
          ),
        }
      : null;

  const finalSelectedOffer = appliedOffer || resultMappedOffer || smartMappedOffer;

  const offerApplied = clampAmount(
    Math.min(finalSelectedOffer?.discountAmount || 0, baseFare)
  );

  const baseAfterOffer = Math.max(0, baseFare - offerApplied);

  const nonBenefitTotal = convenienceFee + gatewayFee + confirmUpgradeAmount;

  const totalBeforeWallet = baseAfterOffer + nonBenefitTotal;

  const walletCalc = calculateTrainNewBookingWallet({
    baseAfterOffer,
    totalBeforeWallet,
    promoCredit: wallet.promoCredit,
    earnedCredit: wallet.earnedCredit,
    refundableBalance: wallet.refundableBalance,
  });

  const tplCredit = walletCalc.totalWalletUsed;
  const totalAmount = walletCalc.finalPayable;
  const earnedOnThisBooking = Math.floor(baseAfterOffer * 0.02);

  const travellersValid = areTrainTravellersValid(travellers);
  const contactValid = isTrainContactValid(contactDetails);
  const irctcValid = isIrctcUsernameValid(irctcAccount);

  const canProceed =
    pageState.timerLeft > 0 && travellersValid && contactValid && irctcValid;

  let blockerMessage = "";
  if (pageState.timerLeft <= 0) {
    blockerMessage = "Session expired. Please go back and select train again.";
  } else if (!travellersValid) {
    blockerMessage = "Please fill all traveller details.";
  } else if (!contactValid) {
    blockerMessage = "Please enter valid contact details.";
  } else if (!irctcValid) {
    blockerMessage = "Please enter a valid IRCTC username.";
  }

  function updateTravellers(next: typeof travellers) {
    setPageState((prev) => (prev ? { ...prev, travellers: next } : prev));
  }

  function updateContactDetails(next: typeof contactDetails) {
    setPageState((prev) => (prev ? { ...prev, contactDetails: next } : prev));
  }

  function updateIrctcAccount(next: typeof irctcAccount) {
    setPageState((prev) => (prev ? { ...prev, irctcAccount: next } : prev));
  }

  function applyOffer(offer: TrainOfferItem) {
    setAppliedOffer(offer);
  }

  function removeOffer() {
    setAppliedOffer(null);
  }

  function handleProceed() {
    if (!canProceed || !pageState) return;

    const pricingRuleSnapshot = {
      pricingVersion: "TPL_TRAIN_PRICING_RULE_V1",

      baseFare,
      trueBaseFare: baseFare,

      offerApplied,
      appliedOfferAmount: offerApplied,
      offerDiscount: offerApplied,
      couponDiscount: offerApplied,
      appliedOfferCode: finalSelectedOffer?.code || "",
      appliedOfferTitle: finalSelectedOffer?.title || "",
      offerData: finalSelectedOffer,

      baseAfterOffer,

      convenienceFee,
      gatewayFee,
      confirmUpgradeAmount,

      taxesAndFees: 0,
      taxes: 0,
      seatBerthCharges: 0,
      mealAmount: 0,
      insuranceAmount: 0,
      serviceFee: 0,
      cancellationFreeChangeAmount: 0,

      nonBenefitTotal,
      totalBeforeWallet,

      promoCreditEligibleBase: baseAfterOffer,
      earnedCreditEligibleBase: baseAfterOffer,
      refundWalletEligibleAmount: totalBeforeWallet,

      promoUsed: walletCalc.promoUsed,
      earnedUsed: walletCalc.earnedUsed,
      refundUsed: walletCalc.refundUsed,
      tplCredit,
      tplCreditUsed: walletCalc.tplCreditUsed,
      totalWalletUsed: walletCalc.totalWalletUsed,

      walletCalc: {
        promoUsed: walletCalc.promoUsed,
        earnedUsed: walletCalc.earnedUsed,
        refundUsed: walletCalc.refundUsed,
      },

      earnedOnThisBooking,
      totalAmount,
      grandTotal: totalAmount,
      payableAmount: totalAmount,

      rules: {
        offerAppliesOn: "true_base_train_fare",
        promoEarnedAppliesOn: "base_after_offer",
        refundWalletAppliesOn: "final_payable",
        earnedCreditRate: 0.02,
        managePaymentPromoEarnedAllowed: false,
        managePaymentRefundWalletAllowed: true,
      },
    };

    const paymentPayload = {
      serviceType: "train",
      bookingType: "train",
      bookingStatus: "draft",
      paymentStatus: "pending",
      nextAuthStep: "irctc_auth_after_payment",

      bookingPayload: {
        ...bookingPayload,
        pricingSnapshot: pricingRuleSnapshot,
        fareSnapshot: pricingRuleSnapshot,
        priceBreakup: pricingRuleSnapshot,
        bookingSelection: {
          ...bookingPayload.bookingSelection,
          ticketPrice: totalBeforeWallet,
          originalTicketPrice:
            bookingPayload.bookingSelection?.originalTicketPrice ||
            bookingPayload.bookingSelection?.ticketPrice,
          baseFare,
          trueBaseFare: baseFare,
          baseAfterOffer,
          payableAmount: totalAmount,
          confirmUpgradeAmount,
        },
      },
      travellers,
      contactDetails,
      irctcAccount,

      appliedOffer: finalSelectedOffer,
      appliedOfferCode: finalSelectedOffer?.code || "",
      appliedOfferTitle: finalSelectedOffer?.title || "",
      offerData: finalSelectedOffer,

      pricing: pricingRuleSnapshot,

      walletBreakdown: {
        promoUsed: walletCalc.promoUsed,
        earnedUsed: walletCalc.earnedUsed,
        refundUsed: walletCalc.refundUsed,
        promoAvailable: wallet.promoCredit,
        earnedAvailable: wallet.earnedCredit,
        refundWalletAvailable: wallet.refundableBalance,
        totalWalletUsed: walletCalc.totalWalletUsed,
        tplCreditUsed: walletCalc.tplCreditUsed,
        earnedOnThisBooking,
      },

      irctcFlow: {
        username: irctcAccount.username,
        usernameVerified: irctcValid,
        passwordRequiredAfterPayment: true,
        authRoute: "/train/irctc-auth",
        confirmationAfterAuth: true,
      },

      originalBookingBaseline: {
        amount: totalAmount,
        payableAmount: totalAmount,
        totalBeforeWallet,
        baseFare,
        baseAfterOffer,
        convenienceFee,
        gatewayFee,
        confirmUpgradeAmount,
        offerApplied,
        train: bookingPayload.train,
        bookingSelection: bookingPayload.bookingSelection,
        pricing: pricingRuleSnapshot,
      },

      manageBookingReady: true,
      timerLeft: pageState.timerLeft,
      timestamp: Date.now(),
    };

    sessionStorage.setItem("tplTrainPaymentData", JSON.stringify(paymentPayload));

    router.push("/train/payment");
  }

  return (
    <main className="min-h-screen bg-[#f5f7fb] text-black">
      <TrainBookingTopBar timerLabel={timerLabel} />

      <div className="mx-auto max-w-[1400px] px-4 py-6">
        <div className="flex items-start gap-5">
          <div className="w-[74%] min-w-0 space-y-5">
            <TrainBookingSummaryCard bookingPayload={bookingPayload} />

            <section className="rounded-2xl border border-[#f3d7c7] bg-[#fff7ed] px-5 py-3 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-[15px] font-extrabold text-slate-900">
                    {activeUser?.mobile
                      ? `Logged in as ${getDisplayNameFromUser(activeUser)}`
                      : "Login Now to avail exciting offers"}
                  </div>

                  <div className="mt-1 text-[13px] text-slate-600">
                    {activeUser?.mobile
                      ? "Saved traveller details and wallet benefits can be used for faster booking."
                      : "Use your common TPL login for faster booking and saved traveller details."}
                  </div>
                </div>

                {!activeUser?.mobile ? (
                  <button
                    type="button"
                    onClick={() => setShowLoginModal(true)}
                    className="h-[40px] rounded-xl border border-slate-300 bg-white px-5 text-[13px] font-extrabold text-slate-900 transition hover:border-sky-400 hover:text-sky-600"
                  >
                    LOGIN
                  </button>
                ) : null}
              </div>
            </section>

            <TrainTravellerDetailsSection
              travellers={travellers}
              onChange={updateTravellers}
            />

            <TrainContactDetailsSection
              contactDetails={contactDetails}
              onChange={updateContactDetails}
            />

            <TrainIrctcAccountSection
              irctcAccount={irctcAccount}
              onChange={updateIrctcAccount}
            />

            <TrainBookingImportantInfo />
          </div>

          <div className="w-[26%] min-w-0 self-start">
            <TrainBookingFareSummaryCard
              baseFare={baseFare}
              convenienceFee={convenienceFee}
              gatewayFee={gatewayFee}
              offerApplied={offerApplied}
              appliedOfferCode={finalSelectedOffer?.code || ""}
              appliedOfferTitle={finalSelectedOffer?.title || ""}
              tplCredit={tplCredit}
              walletBreakdown={{
                promoUsed: walletCalc.promoUsed,
                earnedUsed: walletCalc.earnedUsed,
                refundUsed: walletCalc.refundUsed,
              }}
              earnedOnThisBooking={earnedOnThisBooking}
              refundWalletAvailable={wallet.refundableBalance}
              useRefundWallet={true}
              totalAmount={totalAmount}
              canProceed={canProceed}
              blockerMessage={blockerMessage}
              onProceed={handleProceed}
            />

            <div className="mt-4">
              <TrainBookingOffersSection
                appliedOfferCode={finalSelectedOffer?.code || ""}
                bookingValue={baseFare || 1200}
                onApplyOffer={applyOffer}
                onRemoveOffer={removeOffer}
              />
            </div>
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