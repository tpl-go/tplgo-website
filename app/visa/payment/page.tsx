"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import LoginModal from "@/app/components/common/LoginModal";
import { AUTH_UPDATED_EVENT } from "@/app/lib/booking/guestAuth";
import { getLoggedInDisplayName } from "@/app/lib/auth/displayName";

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
  confirmVisaBackendCheckout,
  startVisaBackendCheckout,
  type VisaBackendCheckoutRefs,
} from "@/app/lib/api/visaCheckoutIntegration";

import VisaPaymentTopSummary from "@/app/components/payment/visa/VisaPaymentTopSummary";
import VisaPaymentOptionSection from "@/app/components/payment/visa/VisaPaymentOptionSection";
import VisaPaymentPriceCard from "@/app/components/payment/visa/VisaPaymentPriceCard";

type PaymentState = "idle" | "processing" | "success" | "failure";

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

function safeNumber(value: any, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

export default function VisaPaymentPage() {
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
        ? sessionStorage.getItem("tplVisaBookingData")
        : null;

    if (!raw) return;

    try {
      const parsed = JSON.parse(raw);
      // Existing session payload hydration; keep timing and routing behavior intact.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStoredPayload(parsed);

      if (typeof parsed?.timerLeft === "number" && parsed.timerLeft > 0) {
        setTimeLeft(parsed.timerLeft);
      }
    } catch (error) {
      console.error("Failed to parse visa payment payload:", error);
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
      // Existing expiry transition; preserve timer behavior.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsExpired(true);
      expireBooking();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const next = prev - 1;

        const raw =
          typeof window !== "undefined"
            ? sessionStorage.getItem("tplVisaBookingData")
            : null;

        if (raw) {
          try {
            const parsed = JSON.parse(raw);

            sessionStorage.setItem(
              "tplVisaBookingData",
              JSON.stringify({
                ...parsed,
                timerLeft: next > 0 ? next : 0,
              })
            );
          } catch (error) {
            console.error("Failed to update visa timer:", error);
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

  const pricingData = useMemo(() => {
    const fareBreakup = storedPayload?.fareBreakup || {};
    const pricingSnapshot =
      storedPayload?.pricingSnapshot ||
      fareBreakup ||
      storedPayload?.option?.pricingSnapshot ||
      {};

    const walletBreakdown = storedPayload?.walletBreakdown || {};

    const appliedOfferAmount = safeNumber(
      pricingSnapshot?.appliedOfferAmount ||
        fareBreakup?.appliedOfferAmount ||
        storedPayload?.appliedOffer?.discountAmount ||
        storedPayload?.offerData?.discountAmount ||
        0
    );

    const appliedOfferCode =
      pricingSnapshot?.appliedOfferCode ||
      fareBreakup?.appliedOfferCode ||
      storedPayload?.appliedOfferCode ||
      storedPayload?.appliedOffer?.code ||
      storedPayload?.offerData?.code ||
      "";

    const appliedOfferTitle =
      pricingSnapshot?.appliedOfferTitle ||
      fareBreakup?.appliedOfferTitle ||
      storedPayload?.appliedOfferTitle ||
      storedPayload?.appliedOffer?.title ||
      storedPayload?.offerData?.title ||
      "";

    const offerData =
      pricingSnapshot?.offerData ||
      fareBreakup?.offerData ||
      storedPayload?.offerData ||
      storedPayload?.appliedOffer ||
      null;

    const baseAmount = safeNumber(
      pricingSnapshot?.baseVisaAmount ||
        pricingSnapshot?.baseAmount ||
        storedPayload?.originalBookingBaseline?.baseVisaAmount ||
        0
    );

    const grossAmount = safeNumber(
      pricingSnapshot?.grossTotal ||
        pricingSnapshot?.grossAmount ||
        fareBreakup?.grossTotal ||
        storedPayload?.originalBookingBaseline?.grossTotal ||
        0
    );

    const nonBenefitAmount = Math.max(
      safeNumber(
        pricingSnapshot?.nonBenefitTotal ||
          pricingSnapshot?.nonBenefitAmount ||
          storedPayload?.originalBookingBaseline?.nonBenefitTotal ||
          grossAmount - baseAmount
      ),
      0
    );

    const benefitPricing = applyBenefitPricing({
      baseAmount,
      visaCharges: nonBenefitAmount,
      offerDiscount: appliedOfferAmount,
      promoCredit: activeUser ? wallet.promoCredit : 0,
      earnedCredit: activeUser ? wallet.earnedCredit : 0,
      refundWallet: activeUser ? wallet.refundableBalance : 0,
    });

    const savedPromoUsed = benefitPricing.promoUsed;
    const savedEarnedUsed = benefitPricing.earnedUsed;
    const savedRefundUsed = benefitPricing.refundUsed;
    const walletUsed = savedPromoUsed + savedEarnedUsed + savedRefundUsed;

    const totalBeforeWallet = Math.max(
      benefitPricing.grossAmount - benefitPricing.offerDiscount,
      0
    );

    const finalPayable = benefitPricing.finalPayable;
    const earnedOnThisBooking = Math.round(benefitPricing.baseAfterOffer * 0.02);

    const visaFee = safeNumber(
      pricingSnapshot?.visaFee || fareBreakup?.visaFee || storedPayload?.option?.embassyFee
    );

    const serviceFee = safeNumber(
      pricingSnapshot?.serviceFee ||
        fareBreakup?.serviceFee ||
        storedPayload?.option?.serviceFee
    );

    const perApplicantTotal = safeNumber(
      pricingSnapshot?.perApplicantTotal ||
        fareBreakup?.perApplicantTotal ||
        storedPayload?.option?.totalPrice ||
        visaFee + serviceFee
    );

    const travellers = safeNumber(
      pricingSnapshot?.travellers ||
        fareBreakup?.travellers ||
        storedPayload?.travellers ||
        1,
      1
    );

    const totalVisaFees = safeNumber(
      pricingSnapshot?.totalVisaFees,
      visaFee * travellers
    );

    const totalServiceFees = Math.max(
      safeNumber(
        pricingSnapshot?.totalServiceFees,
        benefitPricing.grossAmount - totalVisaFees
      ),
      0
    );

    const normalizedPricingSnapshot = {
      ...pricingSnapshot,

      visaFee,
      serviceFee,
      perApplicantTotal,
      travellers,

      baseVisaAmount: benefitPricing.baseAmount,
      baseAfterOffer: benefitPricing.baseAfterOffer,

      totalVisaFees,
      totalServiceFees,
      nonBenefitTotal: benefitPricing.nonBenefitAmount,

      grossTotal: benefitPricing.grossAmount,
      totalBeforeOffer: benefitPricing.grossAmount,

      appliedOfferAmount: benefitPricing.offerDiscount,
      appliedOfferCode,
      appliedOfferTitle,
      offerData,

      totalBeforeWallet,

      promoUsed: savedPromoUsed,
      earnedUsed: savedEarnedUsed,
      refundUsed: savedRefundUsed,
      tplCredit: walletUsed,
      finalTotal: finalPayable,

      earnedOnThisBooking,

      benefitPricing,
    };

    return {
      fareBreakup,
      pricingSnapshot: normalizedPricingSnapshot,
      walletBreakdown,

      appliedOfferAmount: benefitPricing.offerDiscount,
      appliedOfferCode,
      appliedOfferTitle,
      offerData,

      savedPromoUsed,
      savedEarnedUsed,
      savedRefundUsed,
      walletUsed,
      totalBeforeWallet,
      grossTotal: benefitPricing.grossAmount,
      finalPayable,
      earnedOnThisBooking,
      benefitPricing,
    };
  }, [
    storedPayload,
    activeUser,
    wallet.promoCredit,
    wallet.earnedCredit,
    wallet.refundableBalance,
  ]);

  if (!storedPayload?.option) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#eef3f8] text-black">
        <div className="rounded-xl border border-[#d9e2ec] bg-white p-6 text-[16px] font-semibold text-[#374151]">
          Visa payment data not found.
        </div>
      </main>
    );
  }

  const {
    pricingSnapshot,
    walletBreakdown,
    appliedOfferAmount,
    appliedOfferCode,
    appliedOfferTitle,
    offerData,
    savedPromoUsed,
    savedEarnedUsed,
    savedRefundUsed,
    walletUsed,
    totalBeforeWallet,
    grossTotal,
    finalPayable,
    earnedOnThisBooking,
    benefitPricing,
  } = pricingData;

  const paymentPayload = {
    ...storedPayload,
    pricingSnapshot,
    fareBreakup: pricingSnapshot,
    walletBreakdown: {
      ...walletBreakdown,
      promoUsed: savedPromoUsed,
      earnedUsed: savedEarnedUsed,
      refundUsed: savedRefundUsed,
      promoAvailable: wallet.promoCredit,
      earnedAvailable: wallet.earnedCredit,
      refundWalletAvailable: wallet.refundableBalance,
      totalWalletUsed: walletUsed,
      earnedOnThisBooking,
    },
    finalTotal: finalPayable,
  };

  const buildConfirmationPayload = (sourcePayload = paymentPayload) => {
    const bookingId = `VSA-${Date.now()}`;
    const option = {
      ...sourcePayload.option,
      pricingSnapshot,
    };
    const searchData = sourcePayload.searchData;
    const applicants = sourcePayload.applicants || [];
    const passports = sourcePayload.passports || [];

    const leadApplicant = applicants?.[0] || {};

    return {
      bookingId,
      applicationId: bookingId,
      bookingStatus: "Application Received",
      applicationStatus: "Documents Received",
      paymentStatus: "Paid",
      bookedOn: new Date().toISOString(),

      serviceType: "visa",
      bookingType: "visa",

      visaTitle: option?.title || "Visa Application",
      country: option?.country || searchData?.destinationCountry || "",
      nationality: searchData?.nationality || "",
      visaType: option?.visaType || searchData?.visaType || "",
      entryType: option?.entryType || "",
      processingTime: option?.processingTime || "",
      validity: option?.validity || "",
      stayDuration: option?.stayDuration || "",
      travelDate: searchData?.travelDate || "",

      travellers: sourcePayload.travellers || applicants.length || 1,
      applicants,
      passports,
      uploadedDocsByApplicant: sourcePayload.uploadedDocsByApplicant || [],
      acceptedDocsByApplicant: sourcePayload.acceptedDocsByApplicant || [],

      leadApplicant: {
        title: leadApplicant?.title || "",
        firstName: leadApplicant?.firstName || "",
        lastName: leadApplicant?.lastName || "",
        email: leadApplicant?.email || "",
        mobile: leadApplicant?.mobile || "",
      },

      appliedOffer: offerData,
      appliedOfferCode,
      appliedOfferTitle,
      offerData,

      pricingSnapshot,

      fare: {
        visaFee: Number(pricingSnapshot?.visaFee || 0),
        serviceFee: Number(pricingSnapshot?.serviceFee || 0),
        perApplicantTotal: Number(pricingSnapshot?.perApplicantTotal || 0),
        travellers: Number(pricingSnapshot?.travellers || sourcePayload.travellers || 1),

        baseVisaAmount: benefitPricing.baseAmount,
        baseAfterOffer: benefitPricing.baseAfterOffer,
        nonBenefitTotal: benefitPricing.nonBenefitAmount,

        totalVisaFees: Number(pricingSnapshot?.totalVisaFees || 0),
        totalServiceFees: Number(pricingSnapshot?.totalServiceFees || 0),

        grossTotal,
        offerApplied: appliedOfferAmount,
        appliedOfferAmount,
        appliedOfferCode,
        appliedOfferTitle,
        offerData,

        totalBeforeWallet,
        walletUsed,
        promoUsed: savedPromoUsed,
        earnedUsed: savedEarnedUsed,
        refundUsed: savedRefundUsed,
        totalPaid: finalPayable,
        totalAmount: finalPayable,

        benefitPricing,

        walletBreakdown: {
          promoUsed: savedPromoUsed,
          earnedUsed: savedEarnedUsed,
          refundUsed: savedRefundUsed,
          promoAvailable: walletBreakdown?.promoAvailable,
          earnedAvailable: walletBreakdown?.earnedAvailable,
          refundWalletAvailable: walletBreakdown?.refundWalletAvailable,
          totalWalletUsed: walletUsed,
          earnedOnThisBooking,
        },
      },

      paymentMethod: selectedPaymentMethod || "Online Payment",

      paymentData: {
        method: selectedPaymentMethod || "Online Payment",
        totalPaid: finalPayable,
        paidAt: new Date().toISOString(),
        walletUsed,
        promoUsed: savedPromoUsed,
        earnedUsed: savedEarnedUsed,
        refundUsed: savedRefundUsed,
        appliedOfferAmount,
        appliedOfferCode,
        appliedOfferTitle,
        offerData,
        benefitPricing,
      },

      bookingMeta: {
        bookingId,
        applicationId: bookingId,
        bookingStatus: "application_received",
        paymentStatus: "paid",
        createdAt: new Date().toISOString(),
        serviceType: "visa",
      },

      option,
      searchData,
      specialRequest: sourcePayload.specialRequest || "",
      walletBreakdown: sourcePayload.walletBreakdown,
      fareBreakup: pricingSnapshot,
      originalBookingBaseline: {
        ...(sourcePayload.originalBookingBaseline || {}),
        amount: finalPayable,
        payableAmount: finalPayable,
        totalBeforeWallet,
        grossTotal,
        baseVisaAmount: benefitPricing.baseAmount,
        baseAfterOffer: benefitPricing.baseAfterOffer,
        nonBenefitTotal: benefitPricing.nonBenefitAmount,
        appliedOfferAmount,
        travellers: Number(pricingSnapshot?.travellers || sourcePayload.travellers || 1),
      },
      walletSource: sourcePayload.walletSource,
      walletSyncStatus: sourcePayload.walletSyncStatus,
      backendWalletSnapshot: sourcePayload.backendWalletSnapshot,
      metadata: sourcePayload.metadata,
      backendCheckoutId: sourcePayload.backendCheckoutId,
      backendBookingId: sourcePayload.backendBookingId,
      backendPaymentId: sourcePayload.backendPaymentId,
      backendRequestId: sourcePayload.backendRequestId,
      backendServiceType: sourcePayload.backendServiceType,
      backendCheckoutStatus: sourcePayload.backendCheckoutStatus,
      manageBookingReady: true,
      finalTotal: finalPayable,
    };
  };

  const handleMockPayment = async (shouldSucceed = true) => {
    if (!selectedPaymentMethod || isExpired) return;

    setPaymentActionState("processing");
    startPaymentProcess();

    await new Promise((resolve) => setTimeout(resolve, 1500));

    if (shouldSucceed) {
      const backendStart = await startVisaBackendCheckout(
        paymentPayload as Record<string, unknown>
      );
      let backendRefs: VisaBackendCheckoutRefs = backendStart.refs;

      const checkoutPayload = {
        ...paymentPayload,
        ...(backendStart.payload as Record<string, unknown>),
        ...backendStart.refs,
      };

      if (backendStart.attempted) {
        sessionStorage.setItem(
          "tplVisaBookingData",
          JSON.stringify(checkoutPayload)
        );

        setStoredPayload(checkoutPayload);
      }

      let confirmationPayload = buildConfirmationPayload(checkoutPayload);

      if (backendRefs.backendCheckoutId) {
        const backendConfirm = await confirmVisaBackendCheckout({
          ...confirmationPayload,
          ...backendRefs,
        });

        backendRefs = {
          ...backendRefs,
          ...backendConfirm.refs,
        };

        confirmationPayload = {
          ...confirmationPayload,
          ...backendRefs,
        };
      }

      const activeMobile =
        activeUser?.mobile ||
        storedPayload?.user?.mobile ||
        storedPayload?.applicants?.[0]?.mobile ||
        "";

      if (activeMobile) {
        const latestWallet = getWallet(activeMobile);

        const nextWallet: Wallet = {
          promoCredit: Math.max(
            Number(latestWallet.promoCredit || 0) - savedPromoUsed,
            0
          ),
          earnedCredit: Math.max(
            Number(latestWallet.earnedCredit || 0) - savedEarnedUsed,
            0
          ),
          refundableBalance: Math.max(
            Number(latestWallet.refundableBalance || 0) - savedRefundUsed,
            0
          ),
        };

        saveWallet(nextWallet, activeMobile);
        setWallet(nextWallet);

        if (savedPromoUsed > 0) {
          addWalletLedgerItem(
            {
              type: "wallet_used",
              title: "TPL Promo Credit Used",
              description: "Promo credit used for visa application payment",
              amount: savedPromoUsed,
            },
            activeMobile
          );
        }

        if (savedEarnedUsed > 0) {
          addWalletLedgerItem(
            {
              type: "wallet_used",
              title: "TPL Earned Credit Used",
              description: "Earned credit used for visa application payment",
              amount: savedEarnedUsed,
            },
            activeMobile
          );
        }

        if (savedRefundUsed > 0) {
          addWalletLedgerItem(
            {
              type: "wallet_used",
              title: "Refund Wallet Used",
              description: "Refund wallet used for visa application payment",
              amount: savedRefundUsed,
            },
            activeMobile
          );
        }
      }

      handlePaymentSuccess();
      confirmBooking();

      try {
        sessionStorage.setItem(
          "tplVisaConfirmationData",
          JSON.stringify(confirmationPayload)
        );

        sessionStorage.setItem(
          "visaPaymentSuccessData",
          JSON.stringify(confirmationPayload)
        );

        sessionStorage.removeItem("tplVisaBookingData");
      } catch (error) {
        console.error("Failed to store visa confirmation payload:", error);
      }

      setPaymentActionState("success");

      setTimeout(() => {
        router.push("/visa/confirmation");
      }, 600);
    } else {
      handlePaymentFailure();
      setPaymentActionState("failure");
    }
  };

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#eef3f8] pb-8 text-black lg:pb-0">
      <div className="flex min-h-[64px] items-center justify-between border-b border-[#d9e2ec] bg-white px-3 py-3 md:h-[72px] md:px-7 md:py-0">
        <div className="text-[26px] font-black tracking-[-0.4px] text-[#111827]">
          TPL
        </div>

        <div className="flex min-w-0 items-center gap-2 text-[12px] font-extrabold md:gap-3 md:text-[13px]">
          <span
            className={`inline-flex h-[30px] min-w-[64px] items-center justify-center rounded-full border border-[#d9e2ec] bg-white px-3 ${
              timeLeft < 120 ? "text-[#dc2626]" : "text-[#111827]"
            }`}
          >
            {formattedTime}
          </span>

          <span className="hidden h-[30px] items-center justify-center rounded-full border border-[#d9e2ec] bg-white px-3 font-extrabold text-[#0f766e] sm:inline-flex">
            VISA SECURED PAYMENT
          </span>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-3 py-4 md:px-4 md:py-6">
        <div className="flex flex-col items-stretch gap-4 lg:flex-row lg:items-start lg:gap-[18px]">
          <div className="flex min-w-0 flex-col gap-4 lg:w-[72%]">
            <VisaPaymentTopSummary payload={paymentPayload} />

            <div className="min-w-0 overflow-hidden rounded-2xl border border-[#d9e2ec] bg-white shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e5e7eb] px-5 py-4">
                <div className="min-w-0">
                  <div className="break-words text-[16px] font-extrabold text-[#111827]">
                    Visa application submission note
                  </div>
                  <div className="mt-1 break-words text-[13px] leading-5 text-[#6b7280]">
                    After successful payment, your application will move to
                    document verification and visa operations review.
                  </div>
                </div>

                {!activeUser?.mobile ? (
                  <button
                    type="button"
                    onClick={() => setShowLoginModal(true)}
                    className="h-[42px] w-full rounded-[10px] bg-[#1d9bf0] px-4 text-[14px] font-extrabold text-white sm:w-auto sm:min-w-[110px]"
                  >
                    LOGIN
                  </button>
                ) : (
                  <div className="break-words rounded-full bg-green-100 px-4 py-2 text-[12px] font-extrabold text-green-700">
                    Logged in as{" "}
                    {getLoggedInDisplayName(activeUser) ||
                      `${storedPayload?.applicants?.[0]?.firstName || ""} ${
                        storedPayload?.applicants?.[0]?.lastName || ""
                      }`.trim() ||
                      activeUser?.mobile}
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-[#d9e2ec] bg-white p-4 shadow-[0_2px_8px_rgba(15,23,42,0.04)] md:p-5">
              <div className="break-words text-[18px] font-black text-[#111827]">
                What happens after payment?
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <div className="rounded-xl bg-[#f8fafc] p-4">
                  <div className="text-[13px] font-black text-[#111827]">
                    1. Document Review
                  </div>
                  <p className="mt-1 text-[12px] font-medium text-[#64748b]">
                    TPL team verifies uploaded documents.
                  </p>
                </div>

                <div className="rounded-xl bg-[#f8fafc] p-4">
                  <div className="text-[13px] font-black text-[#111827]">
                    2. Embassy / VFS Process
                  </div>
                  <p className="mt-1 text-[12px] font-medium text-[#64748b]">
                    Application is processed as per destination rules.
                  </p>
                </div>

                <div className="rounded-xl bg-[#f8fafc] p-4">
                  <div className="text-[13px] font-black text-[#111827]">
                    3. Status Updates
                  </div>
                  <p className="mt-1 text-[12px] font-medium text-[#64748b]">
                    Updates will be shared by call, WhatsApp and email.
                  </p>
                </div>
              </div>
            </div>

            <VisaPaymentOptionSection
              selectedMethod={selectedPaymentMethod}
              onPaymentMethodChange={(method) => {
                setSelectedPaymentMethod(method);
                applyPaymentMethod(method);
              }}
            />
          </div>

          <div className="min-w-0 lg:w-[28%]">
            <VisaPaymentPriceCard
              payload={paymentPayload}
              appliedOfferAmount={appliedOfferAmount}
              appliedOfferCode={appliedOfferCode}
              appliedOfferTitle={appliedOfferTitle}
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
