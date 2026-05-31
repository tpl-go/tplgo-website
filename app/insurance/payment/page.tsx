"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

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

import {
  getWallet,
  saveWallet,
  addWalletLedgerItem,
  type Wallet,
} from "@/app/lib/wallet/walletStorage";

import { getSavedProfile } from "@/app/lib/account/profileStorage";
import { getLoggedInDisplayName } from "@/app/lib/auth/displayName";
import { applyBenefitPricing } from "@/app/lib/pricing/applyBenefitPricing";

import InsurancePaymentTopSummary from "@/app/components/payment/insurance/InsurancePaymentTopSummary";
import InsurancePaymentOptionSection from "@/app/components/payment/insurance/InsurancePaymentOptionSection";
import InsurancePaymentPriceCard from "@/app/components/payment/insurance/InsurancePaymentPriceCard";

type PaymentState = "idle" | "processing" | "success" | "failure";

function toAmount(value: any, fallback = 0) {
  const amount = Number(value);
  return Number.isFinite(amount) && amount > 0 ? Math.round(amount) : fallback;
}

function getActiveUser() {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem("tpl_auth_session_v1");
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    const user = parsed?.user || parsed;

    const mobile = user?.mobile || user?.phone || user?.phoneNumber || "";
    const savedProfile = mobile ? getSavedProfile(mobile) : null;

    const resolvedName =
      user?.name ||
      user?.fullName ||
      user?.full_name ||
      user?.displayName ||
      user?.username ||
      `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
      savedProfile?.fullName ||
      savedProfile?.name ||
      `${savedProfile?.firstName || ""} ${savedProfile?.lastName || ""}`.trim();

    return {
      name: resolvedName || "",
      email: user?.email || savedProfile?.email || "",
      mobile,
    };
  } catch {
    return null;
  }
}

function buildPaymentPricing(payload: any) {
  const fareBreakup = payload?.fareBreakup || {};
  const pricingSnapshot = payload?.pricingSnapshot || {};
  const walletBreakdown = payload?.walletBreakdown || {};
  const plan = payload?.plan || {};

  const basePremium = toAmount(
    pricingSnapshot?.basePremium ||
      pricingSnapshot?.baseAmount ||
      fareBreakup?.basePremium ||
      plan?.pricingSnapshot?.basePremium ||
      plan?.pricingSnapshot?.baseAmount ||
      plan?.premium,
    0
  );

  const gstAmount = toAmount(
    pricingSnapshot?.gstAmount ||
      pricingSnapshot?.gst ||
      fareBreakup?.gst ||
      plan?.pricingSnapshot?.gstAmount ||
      plan?.pricingSnapshot?.gst,
    Math.round(basePremium * 0.18)
  );

  const addOnTotal = toAmount(
    pricingSnapshot?.addOnTotal || fareBreakup?.addOnTotal,
    0
  );

  const medicalSurcharge = toAmount(
    pricingSnapshot?.medicalSurcharge || fareBreakup?.medicalSurcharge,
    0
  );

  const adventureSportsAddon = toAmount(
    pricingSnapshot?.adventureSportsAddon || fareBreakup?.adventureSportsAddon,
    0
  );

  const seniorCitizenSurcharge = toAmount(
    pricingSnapshot?.seniorCitizenSurcharge ||
      fareBreakup?.seniorCitizenSurcharge,
    0
  );

  const convenienceFee = toAmount(
    pricingSnapshot?.convenienceFee || fareBreakup?.convenienceFee,
    0
  );

  const gatewayFee = toAmount(
    pricingSnapshot?.gatewayFee || fareBreakup?.gatewayFee,
    0
  );

  const markup = toAmount(pricingSnapshot?.markup || fareBreakup?.markup, 0);

  const visaLinkedSurcharge = toAmount(
    pricingSnapshot?.visaLinkedSurcharge || fareBreakup?.visaLinkedSurcharge,
    0
  );

  const nonBenefitAmount = toAmount(
    pricingSnapshot?.nonBenefitAmount || fareBreakup?.nonBenefitAmount,
    gstAmount +
      addOnTotal +
      medicalSurcharge +
      adventureSportsAddon +
      seniorCitizenSurcharge +
      convenienceFee +
      gatewayFee +
      markup +
      visaLinkedSurcharge
  );

  const appliedOfferAmount = Math.min(
    toAmount(
      pricingSnapshot?.appliedOfferAmount ||
        fareBreakup?.appliedOfferAmount ||
        fareBreakup?.offerApplied ||
        payload?.offerApplied,
      0
    ),
    basePremium
  );

  const appliedOfferCode =
    pricingSnapshot?.appliedOfferCode ||
    fareBreakup?.appliedOfferCode ||
    payload?.appliedOfferCode ||
    payload?.appliedOffer?.code ||
    payload?.offerData?.code ||
    payload?.appliedOffer?.couponCode ||
    "";

  const appliedOfferTitle =
    pricingSnapshot?.appliedOfferTitle ||
    fareBreakup?.appliedOfferTitle ||
    payload?.appliedOfferTitle ||
    payload?.appliedOffer?.title ||
    payload?.offerData?.title ||
    "";

  const baseAfterOffer = toAmount(
    pricingSnapshot?.baseAfterOffer || fareBreakup?.baseAfterOffer,
    Math.max(basePremium - appliedOfferAmount, 0)
  );

  const promoUsed = toAmount(
    walletBreakdown?.promoUsed || pricingSnapshot?.promoUsed || fareBreakup?.promoUsed,
    0
  );

  const earnedUsed = toAmount(
    walletBreakdown?.earnedUsed ||
      pricingSnapshot?.earnedUsed ||
      fareBreakup?.earnedUsed,
    0
  );

  const refundUsed = toAmount(
    walletBreakdown?.refundUsed ||
      pricingSnapshot?.refundUsed ||
      fareBreakup?.refundUsed,
    0
  );

  const tplCreditUsed = toAmount(
    pricingSnapshot?.tplCreditUsed || fareBreakup?.tplCreditUsed,
    promoUsed + earnedUsed
  );

  const grossAmount = toAmount(
    pricingSnapshot?.grossAmount || fareBreakup?.grossAmount,
    basePremium + nonBenefitAmount
  );

  const totalBeforeWallet = toAmount(
    pricingSnapshot?.totalBeforeWallet || fareBreakup?.totalBeforeWallet,
    baseAfterOffer + nonBenefitAmount
  );

  const payableBeforeRefundWallet = toAmount(
    pricingSnapshot?.payableBeforeRefundWallet ||
      fareBreakup?.payableBeforeRefundWallet,
    Math.max(totalBeforeWallet - tplCreditUsed, 0)
  );

  const finalPayable = toAmount(
    pricingSnapshot?.finalPayable ||
      pricingSnapshot?.finalTotal ||
      fareBreakup?.finalPayable ||
      fareBreakup?.finalTotal ||
      walletBreakdown?.finalPayable ||
      payload?.originalBookingBaseline?.payableAmount,
    Math.max(payableBeforeRefundWallet - refundUsed, 0)
  );

  const earnedOnThisBooking = toAmount(
    pricingSnapshot?.earnedOnThisBooking ||
      fareBreakup?.earnedOnThisBooking ||
      walletBreakdown?.earnedOnThisBooking ||
      walletBreakdown?.earnedOnBooking,
    Math.round(baseAfterOffer * 0.02)
  );

  let benefitPricing = payload?.benefitPricing || null;

  try {
    benefitPricing =
      benefitPricing ||
      (applyBenefitPricing as any)({
        baseAmount: basePremium,
        nonBenefitAmount,
        offerData: payload?.appliedOffer || payload?.offerData || null,
        wallet: null,
        allowPromoCredit: false,
        allowEarnedCredit: false,
        allowRefundWallet: false,
      });
  } catch {
    benefitPricing = payload?.benefitPricing || null;
  }

  return {
    benefitPricing,
    pricingSnapshot: {
      ...pricingSnapshot,
      basePremium,
      baseAmount: basePremium,
      gst: gstAmount,
      gstAmount,
      addOnTotal,
      medicalSurcharge,
      adventureSportsAddon,
      seniorCitizenSurcharge,
      convenienceFee,
      gatewayFee,
      markup,
      visaLinkedSurcharge,
      nonBenefitAmount,
      grossAmount,
      appliedOfferAmount,
      appliedOfferCode,
      appliedOfferTitle,
      baseAfterOffer,
      totalBeforeWallet,
      promoUsed,
      earnedUsed,
      refundUsed,
      tplCreditUsed,
      payableBeforeRefundWallet,
      finalPayable,
      earnedOnThisBooking,
      finalTotal: finalPayable,
    },
    basePremium,
    gstAmount,
    addOnTotal,
    nonBenefitAmount,
    grossAmount,
    appliedOfferAmount,
    appliedOfferCode,
    appliedOfferTitle,
    baseAfterOffer,
    totalBeforeWallet,
    promoUsed,
    earnedUsed,
    refundUsed,
    tplCreditUsed,
    walletUsed: promoUsed + earnedUsed + refundUsed,
    payableBeforeRefundWallet,
    finalPayable,
    earnedOnThisBooking,
    finalTotal: finalPayable,
  };
}

export default function InsurancePaymentPage() {
  const router = useRouter();

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [paymentActionState, setPaymentActionState] =
    useState<PaymentState>("idle");

  const [storedPayload, setStoredPayload] = useState<any>(null);
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
        ? sessionStorage.getItem("tplInsuranceBookingData")
        : null;

    if (!raw) return;

    try {
      const parsed = JSON.parse(raw);
      setStoredPayload(parsed);

      if (typeof parsed?.timerLeft === "number" && parsed.timerLeft > 0) {
        setTimeLeft(parsed.timerLeft);
      }
    } catch (error) {
      console.error("Failed to parse insurance payment payload:", error);
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
    window.addEventListener("focus", syncUserWallet);

    return () => {
      window.removeEventListener(AUTH_UPDATED_EVENT, syncUserWallet);
      window.removeEventListener("storage", syncUserWallet);
      window.removeEventListener("focus", syncUserWallet);
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
            ? sessionStorage.getItem("tplInsuranceBookingData")
            : null;

        if (raw) {
          try {
            const parsed = JSON.parse(raw);

            sessionStorage.setItem(
              "tplInsuranceBookingData",
              JSON.stringify({
                ...parsed,
                timerLeft: next > 0 ? next : 0,
              })
            );
          } catch (error) {
            console.error("Failed to update insurance timer:", error);
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

  if (!storedPayload?.plan) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#eef3f8] text-black">
        <div className="rounded-xl border border-[#d9e2ec] bg-white p-6 text-[16px] font-semibold text-[#374151]">
          Insurance payment data not found.
        </div>
      </main>
    );
  }

  const paymentPricing = buildPaymentPricing(storedPayload);

  const appliedOffer =
    storedPayload.appliedOffer || storedPayload.offerData || null;

  const enhancedStoredPayload = {
    ...storedPayload,
    benefitPricing: paymentPricing.benefitPricing,
    pricingSnapshot: paymentPricing.pricingSnapshot,
    baseAfterOffer: paymentPricing.baseAfterOffer,
    nonBenefitAmount: paymentPricing.nonBenefitAmount,
    grossAmount: paymentPricing.grossAmount,
    appliedOfferAmount: paymentPricing.appliedOfferAmount,
    appliedOfferCode: paymentPricing.appliedOfferCode,
    appliedOfferTitle: paymentPricing.appliedOfferTitle,
    promoUsed: paymentPricing.promoUsed,
    earnedUsed: paymentPricing.earnedUsed,
    refundUsed: paymentPricing.refundUsed,
    tplCreditUsed: paymentPricing.tplCreditUsed,
    payableBeforeRefundWallet: paymentPricing.payableBeforeRefundWallet,
    finalPayable: paymentPricing.finalPayable,
    earnedOnThisBooking: paymentPricing.earnedOnThisBooking,
    finalTotal: paymentPricing.finalTotal,
    appliedOffer,
    appliedOfferCode: paymentPricing.appliedOfferCode,
    appliedOfferTitle: paymentPricing.appliedOfferTitle,
    offerData: appliedOffer,
    offerApplied: paymentPricing.appliedOfferAmount,
    walletBreakdown: {
      ...(storedPayload.walletBreakdown || {}),
      promoUsed: paymentPricing.promoUsed,
      earnedUsed: paymentPricing.earnedUsed,
      refundUsed: paymentPricing.refundUsed,
      totalWalletUsed: paymentPricing.walletUsed,
      finalPayable: paymentPricing.finalPayable,
      earnedOnBooking: paymentPricing.earnedOnThisBooking,
      earnedOnThisBooking: paymentPricing.earnedOnThisBooking,
    },
    fareBreakup: {
      ...(storedPayload.fareBreakup || {}),
      basePremium: paymentPricing.basePremium,
      gst: paymentPricing.gstAmount,
      addOnTotal: paymentPricing.addOnTotal,
      nonBenefitAmount: paymentPricing.nonBenefitAmount,
      grossAmount: paymentPricing.grossAmount,
      appliedOfferAmount: paymentPricing.appliedOfferAmount,
      appliedOfferCode: paymentPricing.appliedOfferCode,
      appliedOfferTitle: paymentPricing.appliedOfferTitle,
      offerApplied: paymentPricing.appliedOfferAmount,
      baseAfterOffer: paymentPricing.baseAfterOffer,
      totalBeforeWallet: paymentPricing.totalBeforeWallet,
      promoUsed: paymentPricing.promoUsed,
      earnedUsed: paymentPricing.earnedUsed,
      refundUsed: paymentPricing.refundUsed,
      tplCreditUsed: paymentPricing.tplCreditUsed,
      totalWalletUsed: paymentPricing.walletUsed,
      payableBeforeRefundWallet: paymentPricing.payableBeforeRefundWallet,
      finalPayable: paymentPricing.finalPayable,
      earnedOnThisBooking: paymentPricing.earnedOnThisBooking,
      finalTotal: paymentPricing.finalPayable,
    },
  };

  const buildConfirmationPayload = () => {
    const bookingId = `INS-${Date.now()}`;
    const plan = enhancedStoredPayload.plan;
    const search = enhancedStoredPayload.search || {};
    const travellers = enhancedStoredPayload.travellers || [];
    const leadTraveller = travellers?.[0] || {};

    return {
      bookingId,
      policyNumber: bookingId,
      bookingStatus: "Policy Issued",
      policyStatus: "Active",
      paymentStatus: "Paid",
      bookedOn: new Date().toISOString(),

      serviceType: "insurance",
      bookingType: "insurance",

      provider: plan?.provider || "",
      planName: plan?.planName || "",
      insuranceType: search?.insuranceType || plan?.insuranceType || "",
      destination: search?.destination || "",
      travelDates: search?.travelDates || "",
      startDate: search?.fromDate || search?.startDate || "",
      endDate: search?.toDate || search?.endDate || "",
      coverageAmount: plan?.coverageAmount || 0,
      claimSettlementRatio: plan?.claimSettlementRatio || 0,

      travellers,
      nominee: enhancedStoredPayload.nominee || {},
      medicalDeclaration: enhancedStoredPayload.medicalDeclaration || {},
      addOns: enhancedStoredPayload.addOns || {},

      pricingSnapshot: paymentPricing.pricingSnapshot,
      benefitPricing: paymentPricing.benefitPricing,
      baseAfterOffer: paymentPricing.baseAfterOffer,
      nonBenefitAmount: paymentPricing.nonBenefitAmount,
      grossAmount: paymentPricing.grossAmount,
      appliedOfferAmount: paymentPricing.appliedOfferAmount,
      appliedOfferCode: paymentPricing.appliedOfferCode,
      appliedOfferTitle: paymentPricing.appliedOfferTitle,
      promoUsed: paymentPricing.promoUsed,
      earnedUsed: paymentPricing.earnedUsed,
      refundUsed: paymentPricing.refundUsed,
      tplCreditUsed: paymentPricing.tplCreditUsed,
      payableBeforeRefundWallet: paymentPricing.payableBeforeRefundWallet,
      finalPayable: paymentPricing.finalPayable,
      earnedOnThisBooking: paymentPricing.earnedOnThisBooking,
      finalTotal: paymentPricing.finalPayable,

      appliedOffer,
      appliedOfferCode: paymentPricing.appliedOfferCode,
      appliedOfferTitle: paymentPricing.appliedOfferTitle,
      offerData: appliedOffer,
      offerApplied: paymentPricing.appliedOfferAmount,

      leadTraveller: {
        title: leadTraveller?.title || "",
        firstName: leadTraveller?.firstName || "",
        lastName: leadTraveller?.lastName || "",
        email: enhancedStoredPayload?.user?.email || "",
        mobile: enhancedStoredPayload?.user?.mobile || "",
      },

      fare: {
        basePremium: paymentPricing.basePremium,
        gst: paymentPricing.gstAmount,
        addOnTotal: paymentPricing.addOnTotal,
        nonBenefitAmount: paymentPricing.nonBenefitAmount,
        grossAmount: paymentPricing.grossAmount,
        appliedOfferAmount: paymentPricing.appliedOfferAmount,
        appliedOfferCode: paymentPricing.appliedOfferCode,
        appliedOfferTitle: paymentPricing.appliedOfferTitle,
        offerApplied: paymentPricing.appliedOfferAmount,
        baseAfterOffer: paymentPricing.baseAfterOffer,
        totalBeforeWallet: paymentPricing.totalBeforeWallet,
        walletUsed: paymentPricing.walletUsed,
        promoUsed: paymentPricing.promoUsed,
        earnedUsed: paymentPricing.earnedUsed,
        refundUsed: paymentPricing.refundUsed,
        tplCreditUsed: paymentPricing.tplCreditUsed,
        payableBeforeRefundWallet: paymentPricing.payableBeforeRefundWallet,
        totalPaid: paymentPricing.finalPayable,
        totalAmount: paymentPricing.finalPayable,
        finalTotal: paymentPricing.finalPayable,
        earnedOnThisBooking: paymentPricing.earnedOnThisBooking,
        walletBreakdown: {
          promoUsed: paymentPricing.promoUsed,
          earnedUsed: paymentPricing.earnedUsed,
          refundUsed: paymentPricing.refundUsed,
          totalWalletUsed: paymentPricing.walletUsed,
          earnedOnThisBooking: paymentPricing.earnedOnThisBooking,
        },
      },

      paymentMethod: selectedPaymentMethod || "Online Payment",

      paymentData: {
        method: selectedPaymentMethod || "Online Payment",
        totalPaid: paymentPricing.finalPayable,
        paidAt: new Date().toISOString(),
        walletUsed: paymentPricing.walletUsed,
        promoUsed: paymentPricing.promoUsed,
        earnedUsed: paymentPricing.earnedUsed,
        refundUsed: paymentPricing.refundUsed,
        appliedOfferAmount: paymentPricing.appliedOfferAmount,
        appliedOfferCode: paymentPricing.appliedOfferCode,
        appliedOfferTitle: paymentPricing.appliedOfferTitle,
      },

      bookingMeta: {
        bookingId,
        policyNumber: bookingId,
        bookingStatus: "policy_issued",
        paymentStatus: "paid",
        createdAt: new Date().toISOString(),
        serviceType: "insurance",
      },

      plan,
      search,
      user: enhancedStoredPayload.user || null,
      walletBreakdown: enhancedStoredPayload.walletBreakdown || {},
      fareBreakup: enhancedStoredPayload.fareBreakup || {},
      originalBookingBaseline: {
        ...enhancedStoredPayload.originalBookingBaseline,
        grossAmount: paymentPricing.grossAmount,
        offerApplied: paymentPricing.appliedOfferAmount,
        appliedOfferCode: paymentPricing.appliedOfferCode,
        totalBeforeWallet: paymentPricing.totalBeforeWallet,
        payableAmount: paymentPricing.finalPayable,
        amount: paymentPricing.finalPayable,
      },
      manageBookingReady: true,
    };
  };

  const handleMockPayment = async (shouldSucceed = true) => {
    if (!selectedPaymentMethod || isExpired) return;

    setPaymentActionState("processing");
    startPaymentProcess();

    await new Promise((resolve) => setTimeout(resolve, 1500));

    if (shouldSucceed) {
      const activeMobile =
        activeUser?.mobile ||
        enhancedStoredPayload?.user?.mobile ||
        enhancedStoredPayload?.nominee?.mobile ||
        "";

      if (activeMobile) {
        const latestWallet = getWallet(activeMobile);

        const nextWallet: Wallet = {
          promoCredit: Math.max(
            Number(latestWallet.promoCredit || 0) - paymentPricing.promoUsed,
            0
          ),
          earnedCredit: Math.max(
            Number(latestWallet.earnedCredit || 0) - paymentPricing.earnedUsed,
            0
          ),
          refundableBalance: Math.max(
            Number(latestWallet.refundableBalance || 0) -
              paymentPricing.refundUsed,
            0
          ),
        };

        saveWallet(nextWallet, activeMobile);
        setWallet(nextWallet);

        if (paymentPricing.promoUsed > 0) {
          addWalletLedgerItem(
            {
              type: "wallet_used",
              title: "TPL Promo Credit Used",
              description: "Promo credit used for insurance policy payment",
              amount: paymentPricing.promoUsed,
            },
            activeMobile
          );
        }

        if (paymentPricing.earnedUsed > 0) {
          addWalletLedgerItem(
            {
              type: "wallet_used",
              title: "TPL Earned Credit Used",
              description: "Earned credit used for insurance policy payment",
              amount: paymentPricing.earnedUsed,
            },
            activeMobile
          );
        }

        if (paymentPricing.refundUsed > 0) {
          addWalletLedgerItem(
            {
              type: "wallet_used",
              title: "Refund Wallet Used",
              description: "Refund wallet used for insurance policy payment",
              amount: paymentPricing.refundUsed,
            },
            activeMobile
          );
        }
      }

      handlePaymentSuccess();
      confirmBooking();

      const confirmationPayload = buildConfirmationPayload();

      try {
        sessionStorage.setItem(
          "tplInsuranceConfirmationData",
          JSON.stringify(confirmationPayload)
        );

        sessionStorage.setItem(
          "insurancePaymentSuccessData",
          JSON.stringify(confirmationPayload)
        );

        sessionStorage.removeItem("tplInsuranceBookingData");
      } catch (error) {
        console.error("Failed to store insurance confirmation payload:", error);
      }

      setPaymentActionState("success");

      setTimeout(() => {
        router.push("/insurance/confirmation");
      }, 600);
    } else {
      handlePaymentFailure();
      setPaymentActionState("failure");
    }
  };

  return (
    <main className="min-h-screen bg-[#eef3f8] text-black">
      <div className="flex h-[72px] items-center justify-between border-b border-[#d9e2ec] bg-white px-7">
        <div className="text-[26px] font-black tracking-[-0.4px] text-[#111827]">
          TPL
        </div>

        <div className="flex items-center gap-3 text-[13px] font-extrabold">
          <span
            className={`inline-flex h-[30px] min-w-[64px] items-center justify-center rounded-full border border-[#d9e2ec] bg-white px-3 ${
              timeLeft < 120 ? "text-[#dc2626]" : "text-[#111827]"
            }`}
          >
            {formattedTime}
          </span>

          <span className="inline-flex h-[30px] items-center justify-center rounded-full border border-[#d9e2ec] bg-white px-3 font-extrabold text-[#0f766e]">
            INSURANCE SECURED PAYMENT
          </span>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="flex items-start gap-[18px]">
          <div className="flex w-[72%] min-w-0 flex-col gap-4">
            <InsurancePaymentTopSummary payload={enhancedStoredPayload} />

            <div className="overflow-hidden rounded-2xl border border-[#d9e2ec] bg-white shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e5e7eb] px-5 py-4">
                <div>
                  <div className="text-[16px] font-extrabold text-[#111827]">
                    Insurance policy issuance note
                  </div>
                  <div className="mt-1 text-[13px] text-[#6b7280]">
                    After successful payment, your policy will be issued and
                    shared with coverage summary, emergency helpline and insurer
                    contact details.
                  </div>
                </div>

                {!activeUser?.mobile ? (
                  <button
                    type="button"
                    onClick={() => setShowLoginModal(true)}
                    className="h-[42px] min-w-[110px] rounded-[10px] bg-orange-500 px-4 text-[14px] font-extrabold text-white hover:bg-orange-600"
                  >
                    LOGIN
                  </button>
                ) : (
                  <div className="rounded-full bg-green-100 px-4 py-2 text-[12px] font-extrabold text-green-700">
                    Logged in as{" "}
                    {getLoggedInDisplayName(activeUser)}
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-[#d9e2ec] bg-white p-5 shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
              <div className="text-[18px] font-black text-[#111827]">
                What happens after payment?
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <div className="rounded-xl bg-[#f8fafc] p-4">
                  <div className="text-[13px] font-black text-[#111827]">
                    1. Policy Issuance
                  </div>
                  <p className="mt-1 text-[12px] font-medium text-[#64748b]">
                    Insurer validates traveller and policy details.
                  </p>
                </div>

                <div className="rounded-xl bg-[#f8fafc] p-4">
                  <div className="text-[13px] font-black text-[#111827]">
                    2. Policy PDF
                  </div>
                  <p className="mt-1 text-[12px] font-medium text-[#64748b]">
                    Policy document and coverage summary will be generated.
                  </p>
                </div>

                <div className="rounded-xl bg-[#f8fafc] p-4">
                  <div className="text-[13px] font-black text-[#111827]">
                    3. Emergency Support
                  </div>
                  <p className="mt-1 text-[12px] font-medium text-[#64748b]">
                    Emergency helpline and insurer contact will be available.
                  </p>
                </div>
              </div>
            </div>

            <InsurancePaymentOptionSection
              selectedMethod={selectedPaymentMethod}
              onPaymentMethodChange={(method) => {
                setSelectedPaymentMethod(method);
                applyPaymentMethod(method);
              }}
            />
          </div>

          <div className="w-[28%] min-w-0">
            <InsurancePaymentPriceCard
              payload={enhancedStoredPayload}
              selectedPaymentMethod={selectedPaymentMethod}
              paymentActionState={paymentActionState}
              isExpired={isExpired}
              isLoggedIn={Boolean(activeUser?.mobile)}
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
