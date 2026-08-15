"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import LoginModal from "@/app/components/common/LoginModal";
import { useAuth } from "@/app/hooks/useAuth";

import VisaConfirmationHero from "@/app/components/confirmation/visa/VisaConfirmationHero";
import VisaConfirmationStatusTimeline from "@/app/components/confirmation/visa/VisaConfirmationStatusTimeline";
import VisaConfirmationApplicationCard from "@/app/components/confirmation/visa/VisaConfirmationApplicationCard";
import VisaConfirmationApplicantCard from "@/app/components/confirmation/visa/VisaConfirmationApplicantCard";
import VisaConfirmationDocumentCard from "@/app/components/confirmation/visa/VisaConfirmationDocumentCard";
import VisaConfirmationFareCard from "@/app/components/confirmation/visa/VisaConfirmationFareCard";
import VisaConfirmationActionsCard from "@/app/components/confirmation/visa/VisaConfirmationActionsCard";

import {
  addBooking,
  getAllBookings,
  type BookingItem,
} from "@/app/lib/booking/bookingStorage";

import { createGuestUserFromBooking } from "@/app/lib/booking/guestAuth";
import { seedAccountAndTravellerSafely } from "@/app/lib/booking/safeProfileSeed";

import {
  getWallet,
  saveWallet,
  addWalletLedgerItem,
} from "@/app/lib/wallet/walletStorage";
import { confirmVisaBackendCheckout } from "@/app/lib/api/visaCheckoutIntegration";

type ConfirmationPayload = any;

function buildApplicationId() {
  return `TPL-VSA-${Date.now().toString().slice(-6)}`;
}

function buildPaymentId() {
  return `TPL-PAY-${Date.now().toString().slice(-6)}`;
}

function cleanMobile(value?: string) {
  return String(value || "")
    .replace(/^\+91\s?/, "")
    .replace(/^\+91-?/, "")
    .replace(/\D/g, "")
    .slice(-10);
}

function resolveLeadName(applicant: any) {
  return (
    `${applicant?.firstName || ""} ${applicant?.lastName || ""}`.trim() ||
    applicant?.name ||
    "Applicant"
  );
}

function safeNumber(value: any, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? Math.round(num) : fallback;
}

function normalizeVisaPricingPayload(parsed: any) {
  const fare = parsed?.fare || {};
  const fareBreakup = parsed?.fareBreakup || {};
  const pricingSnapshot = parsed?.pricingSnapshot || fareBreakup || {};

  const walletBreakdown =
    parsed?.walletBreakdown || fare?.walletBreakdown || {};

  const benefitPricing =
    pricingSnapshot?.benefitPricing ||
    fareBreakup?.benefitPricing ||
    fare?.benefitPricing ||
    {};

  const travellers = safeNumber(
    pricingSnapshot?.travellers ||
      fareBreakup?.travellers ||
      fare?.travellers ||
      parsed?.travellers ||
      parsed?.applicants?.length ||
      1,
    1
  );

  const visaFee = safeNumber(
    pricingSnapshot?.visaFee ||
      fareBreakup?.visaFee ||
      fare?.visaFee ||
      parsed?.option?.embassyFee ||
      0
  );

  const serviceFee = safeNumber(
    pricingSnapshot?.serviceFee ||
      fareBreakup?.serviceFee ||
      fare?.serviceFee ||
      parsed?.option?.serviceFee ||
      0
  );

  const perApplicantTotal = safeNumber(
    pricingSnapshot?.perApplicantTotal ||
      fareBreakup?.perApplicantTotal ||
      fare?.perApplicantTotal ||
      parsed?.option?.totalPrice ||
      visaFee + serviceFee
  );

  const baseVisaAmount = safeNumber(
    pricingSnapshot?.baseVisaAmount ||
      fareBreakup?.baseVisaAmount ||
      fare?.baseVisaAmount ||
      benefitPricing?.baseAmount ||
      serviceFee * travellers
  );

  const baseAfterOffer = safeNumber(
    pricingSnapshot?.baseAfterOffer ||
      fareBreakup?.baseAfterOffer ||
      fare?.baseAfterOffer ||
      benefitPricing?.baseAfterOffer ||
      baseVisaAmount
  );

  const totalVisaFees = safeNumber(
    pricingSnapshot?.totalVisaFees ||
      fareBreakup?.totalVisaFees ||
      fare?.totalVisaFees ||
      visaFee * travellers
  );

  const grossTotal = safeNumber(
    pricingSnapshot?.grossTotal ||
      pricingSnapshot?.grossAmount ||
      fareBreakup?.grossTotal ||
      fare?.grossTotal ||
      benefitPricing?.grossAmount ||
      perApplicantTotal * travellers
  );

  const totalServiceFees = safeNumber(
    pricingSnapshot?.totalServiceFees ||
      fareBreakup?.totalServiceFees ||
      fare?.totalServiceFees ||
      grossTotal - totalVisaFees
  );

  const nonBenefitTotal = safeNumber(
    pricingSnapshot?.nonBenefitTotal ||
      pricingSnapshot?.nonBenefitAmount ||
      fareBreakup?.nonBenefitTotal ||
      fare?.nonBenefitTotal ||
      benefitPricing?.nonBenefitAmount ||
      grossTotal - baseVisaAmount
  );

  const appliedOfferAmount = safeNumber(
    pricingSnapshot?.appliedOfferAmount ||
      fareBreakup?.appliedOfferAmount ||
      fare?.appliedOfferAmount ||
      fare?.offerApplied ||
      benefitPricing?.offerDiscount ||
      parsed?.appliedOffer?.discountAmount ||
      parsed?.offerData?.discountAmount ||
      0
  );

  const totalBeforeWallet = safeNumber(
    pricingSnapshot?.totalBeforeWallet ||
      fareBreakup?.totalBeforeWallet ||
      fare?.totalBeforeWallet ||
      grossTotal - appliedOfferAmount
  );

  const promoUsed = safeNumber(
    pricingSnapshot?.promoUsed ||
      fareBreakup?.promoUsed ||
      fare?.promoUsed ||
      walletBreakdown?.promoUsed ||
      benefitPricing?.promoUsed ||
      0
  );

  const earnedUsed = safeNumber(
    pricingSnapshot?.earnedUsed ||
      fareBreakup?.earnedUsed ||
      fare?.earnedUsed ||
      walletBreakdown?.earnedUsed ||
      benefitPricing?.earnedUsed ||
      0
  );

  const refundUsed = safeNumber(
    pricingSnapshot?.refundUsed ||
      fareBreakup?.refundUsed ||
      fare?.refundUsed ||
      walletBreakdown?.refundUsed ||
      benefitPricing?.refundUsed ||
      0
  );

  const tplCredit = promoUsed + earnedUsed + refundUsed;

  const finalTotal = safeNumber(
    pricingSnapshot?.finalTotal ||
      fareBreakup?.finalTotal ||
      fare?.totalPaid ||
      fare?.totalAmount ||
      parsed?.paymentData?.totalPaid ||
      parsed?.finalTotal ||
      benefitPricing?.finalPayable ||
      totalBeforeWallet - tplCredit
  );

  const earnedOnThisBooking = safeNumber(
    pricingSnapshot?.earnedOnThisBooking ||
      fareBreakup?.earnedOnThisBooking ||
      fare?.walletBreakdown?.earnedOnThisBooking ||
      walletBreakdown?.earnedOnThisBooking ||
      Math.round(baseAfterOffer * 0.02)
  );

  const appliedOfferCode =
    pricingSnapshot?.appliedOfferCode ||
    fareBreakup?.appliedOfferCode ||
    fare?.appliedOfferCode ||
    parsed?.appliedOfferCode ||
    parsed?.appliedOffer?.code ||
    parsed?.offerData?.code ||
    "";

  const appliedOfferTitle =
    pricingSnapshot?.appliedOfferTitle ||
    fareBreakup?.appliedOfferTitle ||
    fare?.appliedOfferTitle ||
    parsed?.appliedOfferTitle ||
    parsed?.appliedOffer?.title ||
    parsed?.offerData?.title ||
    "";

  const offerData =
    pricingSnapshot?.offerData ||
    fareBreakup?.offerData ||
    fare?.offerData ||
    parsed?.offerData ||
    parsed?.appliedOffer ||
    null;

  const normalizedBenefitPricing = {
    ...benefitPricing,
    baseAmount: baseVisaAmount,
    visaCharges: nonBenefitTotal,
    nonBenefitAmount: nonBenefitTotal,
    grossAmount: grossTotal,
    offerDiscount: appliedOfferAmount,
    baseAfterOffer,
    promoUsed,
    earnedUsed,
    tplCreditUsed: promoUsed + earnedUsed,
    payableBeforeRefundWallet: totalBeforeWallet - promoUsed - earnedUsed,
    refundUsed,
    finalPayable: finalTotal,
  };

  const normalizedPricingSnapshot = {
    ...pricingSnapshot,

    visaFee,
    serviceFee,
    perApplicantTotal,
    travellers,

    baseVisaAmount,
    baseAfterOffer,

    totalVisaFees,
    totalServiceFees,
    nonBenefitTotal,

    grossTotal,
    totalBeforeOffer: grossTotal,

    appliedOfferAmount,
    appliedOfferCode,
    appliedOfferTitle,
    offerData,

    totalBeforeWallet,

    promoUsed,
    earnedUsed,
    refundUsed,
    tplCredit,
    finalTotal,

    earnedOnThisBooking,

    benefitPricing: normalizedBenefitPricing,
  };

  const normalizedWalletBreakdown = {
    ...walletBreakdown,
    promoUsed,
    earnedUsed,
    refundUsed,
    totalWalletUsed: tplCredit,
    earnedOnThisBooking,
  };

  return {
    ...parsed,
    pricingSnapshot: normalizedPricingSnapshot,
    fareBreakup: normalizedPricingSnapshot,
    walletBreakdown: normalizedWalletBreakdown,
    earnedCreditAmount: earnedOnThisBooking,
    finalTotal,
    fare: {
      ...fare,
      visaFee,
      serviceFee,
      perApplicantTotal,
      travellers,

      baseVisaAmount,
      baseAfterOffer,
      nonBenefitTotal,

      totalVisaFees,
      totalServiceFees,

      grossTotal,
      offerApplied: appliedOfferAmount,
      appliedOfferAmount,
      appliedOfferCode,
      appliedOfferTitle,
      offerData,

      totalBeforeWallet,
      walletUsed: tplCredit,
      promoUsed,
      earnedUsed,
      refundUsed,
      totalPaid: finalTotal,
      totalAmount: finalTotal,

      benefitPricing: normalizedBenefitPricing,

      walletBreakdown: normalizedWalletBreakdown,
    },
    paymentData: {
      ...(parsed?.paymentData || {}),
      totalPaid: finalTotal,
      walletUsed: tplCredit,
      promoUsed,
      earnedUsed,
      refundUsed,
      appliedOfferAmount,
      appliedOfferCode,
      appliedOfferTitle,
      offerData,
      benefitPricing: normalizedBenefitPricing,
    },
    originalBookingBaseline: {
      ...(parsed?.originalBookingBaseline || {}),
      amount: finalTotal,
      payableAmount: finalTotal,
      totalBeforeWallet,
      grossTotal,
      baseVisaAmount,
      baseAfterOffer,
      nonBenefitTotal,
      appliedOfferAmount,
      travellers,
    },
  };
}

function creditEarnedForVisaBooking(params: {
  mobile: string;
  bookingId: string;
  earnedAmount: number;
}) {
  if (typeof window === "undefined") return;

  const { mobile, bookingId, earnedAmount } = params;

  if (!mobile || !bookingId || earnedAmount <= 0) return;

  const guardKey = `tpl_visa_earned_credit_done_${bookingId}`;
  const alreadyCredited = localStorage.getItem(guardKey);

  if (alreadyCredited) return;

  const wallet = getWallet(mobile);

  const nextWallet = {
    ...wallet,
    earnedCredit: Number(wallet.earnedCredit || 0) + earnedAmount,
  };

  saveWallet(nextWallet, mobile);

  addWalletLedgerItem(
    {
      type: "earned_added",
      title: "TPL Earned Credit Added",
      description: "Earned credit added after successful visa application",
      amount: earnedAmount,
      bookingId,
    },
    mobile
  );

  localStorage.setItem(guardKey, "true");
}

function persistVisaConfirmationSession(payload: ConfirmationPayload) {
  if (typeof window === "undefined") return;

  const value = JSON.stringify(payload);
  sessionStorage.setItem("tplVisaConfirmationData", value);
  sessionStorage.setItem("visaPaymentSuccessData", value);
}

export default function VisaConfirmationPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const [data, setData] = useState<ConfirmationPayload | null>(null);
  const [savedBooking, setSavedBooking] = useState<BookingItem | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [earnedCreditAmount, setEarnedCreditAmount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const loadConfirmation = async () => {
    const raw =
      typeof window !== "undefined"
        ? sessionStorage.getItem("tplVisaConfirmationData") ||
          sessionStorage.getItem("visaPaymentSuccessData")
        : null;

    if (!raw) return;

    try {
      let parsedRaw = JSON.parse(raw);

      if (parsedRaw?.backendCheckoutId) {
        const backendConfirm = await confirmVisaBackendCheckout({
          ...parsedRaw,
          bookingId: parsedRaw?.bookingId || "",
          paymentId: parsedRaw?.paymentId || parsedRaw?.transactionId || "",
          transactionId: parsedRaw?.transactionId || parsedRaw?.paymentId || "",
          paymentMethod:
            parsedRaw?.paymentMethod ||
            parsedRaw?.paymentData?.method ||
            "Online Payment",
        });

        if (backendConfirm.attempted && backendConfirm.refs) {
          parsedRaw = {
            ...parsedRaw,
            ...backendConfirm.refs,
          };
          persistVisaConfirmationSession(parsedRaw);
        }
      }

      if (cancelled) return;

      const parsed = normalizeVisaPricingPayload(parsedRaw);

      const leadApplicant = parsed?.leadApplicant || parsed?.applicants?.[0] || {};
      const mobile = cleanMobile(leadApplicant?.mobile);
      const email = leadApplicant?.email || "";

      const applicationId =
        parsed?.applicationId || parsed?.bookingId || buildApplicationId();

      const visaTitle = parsed?.visaTitle || "Visa Application";
      const country = parsed?.country || parsed?.searchData?.destinationCountry || "";
      const title = `${visaTitle} - ${country}`.trim();

      const travelDate =
        parsed?.travelDate || parsed?.searchData?.travelDate || new Date().toISOString();

      const totalAmount = Number(
        parsed?.fare?.totalPaid ||
          parsed?.fare?.totalAmount ||
          parsed?.paymentData?.totalPaid ||
          parsed?.finalTotal ||
          0
      );

      const safePaidAt =
        parsed?.paymentData?.paidAt ||
        parsed?.bookedOn ||
        new Date().toISOString();

      const earnedAmount = Number(parsed?.earnedCreditAmount || 0);

      setEarnedCreditAmount(earnedAmount);

      if (!mobile) {
        setData({
          ...parsed,
          applicationId,
          bookingId: applicationId,
          earnedCreditAmount: earnedAmount,
        });
        return;
      }

      seedAccountAndTravellerSafely({
        mobile,
        email,
        traveller: {
          name: resolveLeadName(leadApplicant),
          firstName: leadApplicant?.firstName || "",
          lastName: leadApplicant?.lastName || "",
          gender: leadApplicant?.gender || "",
          dob: leadApplicant?.dob || leadApplicant?.dateOfBirth || "",
          email,
          mobile,
          nationality: leadApplicant?.nationality || "Indian",
          passportNumber: parsed?.passports?.[0]?.passportNumber || "",
          passportExpiry: parsed?.passports?.[0]?.expiryDate || "",
        },
        source: "visa",
      });

      const leadName = resolveLeadName(leadApplicant);
      const leadEmail = String(email || "").toLowerCase().trim();

      const leadIdentity = `${leadName}_${leadEmail}`
        .replace(/\s+/g, "_")
        .replace(/[^\w\-]/g, "");

      const confirmationSaveKey = `visa_booking_saved_${safePaidAt}_${mobile}_${leadIdentity}_${title}`;

      const payloadStorageKey = `tpl_booking_payload_visa_${safePaidAt}_${mobile}_${leadIdentity}_${title}`
        .replace(/\s+/g, "_")
        .replace(/[^\w\-]/g, "");

      const existingBooking = getAllBookings().find((booking) => {
        const existingName = String(booking.leadTraveller?.name || "")
          .toLowerCase()
          .trim();

        const existingEmail = String(booking.leadTraveller?.email || "")
          .toLowerCase()
          .trim();

        return (
          booking.type === "visa" &&
          booking.mobile === mobile &&
          booking.travelDate === travelDate &&
          booking.title === title &&
          booking.amount === totalAmount &&
          existingName === leadName.toLowerCase().trim() &&
          existingEmail === leadEmail
        );
      });

      if (existingBooking) {
        const payloadWithBookingId = {
          ...parsed,
          bookingId: existingBooking.id,
          applicationId: existingBooking.id,
          earnedCreditAmount: earnedAmount,
          bookingMeta: {
            ...(parsed?.bookingMeta || {}),
            bookingId: existingBooking.id,
            applicationId: existingBooking.id,
            serviceType: "visa",
          },
        };

        localStorage.setItem(
          existingBooking.payloadStorageKey || payloadStorageKey,
          JSON.stringify(payloadWithBookingId)
        );

        createGuestUserFromBooking({
          name: resolveLeadName(leadApplicant),
          mobile,
          email,
        });

        creditEarnedForVisaBooking({
          mobile,
          bookingId: existingBooking.id,
          earnedAmount,
        });

        sessionStorage.setItem(confirmationSaveKey, "true");
        setSavedBooking(existingBooking);
        setData(payloadWithBookingId);
        return;
      }

      const alreadySaved = sessionStorage.getItem(confirmationSaveKey);

      if (!alreadySaved) {
        const newBooking = addBooking({
          type: "visa",
          title,
          travelDate,
          travellers: `${parsed?.travellers || parsed?.applicants?.length || 1} Applicant${
            (parsed?.travellers || parsed?.applicants?.length || 1) > 1 ? "s" : ""
          }`,
          amount: totalAmount,
          status: "upcoming",
          mobile,
          leadTraveller: {
            name: resolveLeadName(leadApplicant),
            mobile,
            email,
          },
          ticketType: "visa",
          detailRoute: "/visa/confirmation",
          payloadStorageKey,
        });

        const payloadWithBookingId = {
          ...parsed,
          bookingId: newBooking.id,
          applicationId: newBooking.id,
          earnedCreditAmount: earnedAmount,
          bookingMeta: {
            ...(parsed?.bookingMeta || {}),
            bookingId: newBooking.id,
            applicationId: newBooking.id,
            serviceType: "visa",
          },
        };

        localStorage.setItem(payloadStorageKey, JSON.stringify(payloadWithBookingId));

        createGuestUserFromBooking({
          name: resolveLeadName(leadApplicant),
          mobile,
          email,
        });

        creditEarnedForVisaBooking({
          mobile,
          bookingId: newBooking.id,
          earnedAmount,
        });

        sessionStorage.setItem(confirmationSaveKey, "true");
        setSavedBooking(newBooking);
        setData(payloadWithBookingId);
        return;
      }

      createGuestUserFromBooking({
        name: resolveLeadName(leadApplicant),
        mobile,
        email,
      });

      if (parsed?.bookingId) {
        creditEarnedForVisaBooking({
          mobile,
          bookingId: parsed.bookingId,
          earnedAmount,
        });
      }

      setData({
        ...parsed,
        applicationId,
        bookingId: applicationId,
        earnedCreditAmount: earnedAmount,
      });
    } catch (error) {
      console.error("Visa confirmation parse error:", error);
    }

    };

    void loadConfirmation();

    return () => {
      cancelled = true;
    };
  }, []);

  const applicationId = useMemo(() => {
    return savedBooking?.id || data?.applicationId || data?.bookingId || buildApplicationId();
  }, [savedBooking?.id, data?.applicationId, data?.bookingId]);

  const paymentId = useMemo(() => {
    return data?.paymentId || data?.transactionId || buildPaymentId();
  }, [data?.paymentId, data?.transactionId]);

  if (!data) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#eef3f8]">
        <div className="rounded-xl border bg-white p-6 font-semibold">
          No visa confirmation data found.
        </div>
      </main>
    );
  }

  const leadApplicant = data?.leadApplicant || data?.applicants?.[0] || {};
  const mobile = cleanMobile(leadApplicant?.mobile);
  const email = leadApplicant?.email || "";

  const applicationStatus =
    data?.applicationStatus || data?.bookingStatus || "Documents Received";

  const paymentStatus = data?.paymentStatus || "Paid";
  const bookedOn = data?.bookedOn || data?.paymentData?.paidAt || new Date().toISOString();

  const finalEarnedCreditAmount =
    earnedCreditAmount || data?.earnedCreditAmount || 0;

  const handlePrint = () => window.print();

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#eef3f8] pb-8 text-black lg:pb-0">
      <div className="border-b border-orange-200 bg-orange-50 px-3 py-3 text-center md:py-4">
        <div className="break-words text-base font-black text-orange-700 md:text-lg">
          ✅ Visa Application Submitted
        </div>
        <div className="mx-auto mt-1 max-w-3xl break-words text-xs font-semibold leading-5 text-orange-600 md:text-sm">
          Your application is received. TPL Visa Desk will verify your documents.
        </div>

        {finalEarnedCreditAmount > 0 ? (
          <div className="mx-auto mt-2 max-w-3xl break-words text-xs font-bold leading-5 text-green-700 md:text-sm">
            🎁 You earned ₹
            {Number(finalEarnedCreditAmount).toLocaleString("en-IN")} TPL Earned
            Credit on this application.
          </div>
        ) : null}
      </div>

      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-3 py-4 md:px-4 md:py-6 lg:flex-row">
        <div className="flex min-w-0 flex-col gap-4 lg:w-[72%]">
          <VisaConfirmationHero
            applicationId={applicationId}
            visaTitle={data?.visaTitle || "Visa Application"}
            country={data?.country || data?.searchData?.destinationCountry || ""}
            applicationStatus={applicationStatus}
            paymentStatus={paymentStatus}
            bookedOn={bookedOn}
          />

          {finalEarnedCreditAmount > 0 ? (
            <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-[13px] font-bold leading-5 text-green-700 md:px-5 md:py-4 md:text-[14px]">
              🎉 You earned ₹
              {Number(finalEarnedCreditAmount).toLocaleString("en-IN")} TPL
              Earned Credit. This has been added to your wallet.
            </div>
          ) : null}

          <VisaConfirmationStatusTimeline currentStatus={applicationStatus} />

          <VisaConfirmationApplicationCard data={data} />

          <VisaConfirmationApplicantCard
            applicants={data?.applicants || []}
            passports={data?.passports || []}
          />

          <VisaConfirmationDocumentCard
            uploadedDocsByApplicant={data?.uploadedDocsByApplicant || []}
          />

          <VisaConfirmationFareCard data={data} paymentId={paymentId} />
        </div>

        <div className="min-w-0 lg:w-[28%]">
          <VisaConfirmationActionsCard
            applicationId={applicationId}
            email={email || undefined}
            mobile={mobile ? `+91 ${mobile}` : undefined}
            onDownloadApplication={handlePrint}
            onDownloadInvoice={handlePrint}
            onPrintApplication={handlePrint}
            onCheckStatus={() =>
              router.push(`/visa/status?bookingId=${encodeURIComponent(applicationId)}`)
            }
            onGoToMyBookings={() => {
              if (isAuthenticated) {
                router.push("/account/bookings");
                return;
              }

              setShowLoginModal(true);
            }}
            onGoHome={() => router.push("/")}
          />
        </div>
      </div>

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </main>
  );
}
