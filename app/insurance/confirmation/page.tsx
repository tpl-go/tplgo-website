"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import LoginModal from "@/app/components/common/LoginModal";
import { useAuth } from "@/app/hooks/useAuth";

import InsuranceConfirmationHero from "@/app/components/confirmation/insurance/InsuranceConfirmationHero";
import InsuranceConfirmationPolicyCard from "@/app/components/confirmation/insurance/InsuranceConfirmationPolicyCard";
import InsuranceConfirmationTravellerCard from "@/app/components/confirmation/insurance/InsuranceConfirmationTravellerCard";
import InsuranceConfirmationCoverageCard from "@/app/components/confirmation/insurance/InsuranceConfirmationCoverageCard";
import InsuranceConfirmationFareCard from "@/app/components/confirmation/insurance/InsuranceConfirmationFareCard";
import InsuranceConfirmationActionsCard from "@/app/components/confirmation/insurance/InsuranceConfirmationActionsCard";

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
import { confirmInsuranceBackendCheckout } from "@/app/lib/api/insuranceCheckoutIntegration";

type ConfirmationPayload = any;

function buildPolicyNumber() {
  return `TPL-INS-${Date.now().toString().slice(-6)}`;
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

function toAmount(value: any, fallback = 0) {
  const amount = Number(value);
  return Number.isFinite(amount) && amount > 0 ? Math.round(amount) : fallback;
}

function resolveLeadName(traveller: any) {
  return (
    `${traveller?.firstName || ""} ${traveller?.lastName || ""}`.trim() ||
    traveller?.name ||
    "Traveller"
  );
}

function normalizeInsurancePricing(parsed: any) {
  const fare = parsed?.fare || {};
  const fareBreakup = parsed?.fareBreakup || {};
  const snapshot = parsed?.pricingSnapshot || parsed?.plan?.pricingSnapshot || {};

  const basePremium = toAmount(
    snapshot?.basePremium ||
      snapshot?.baseAmount ||
      fare?.basePremium ||
      fareBreakup?.basePremium ||
      parsed?.basePremium ||
      parsed?.plan?.premium,
    0
  );

  const gst = toAmount(
    snapshot?.gstAmount ||
      snapshot?.gst ||
      fare?.gst ||
      fareBreakup?.gst,
    Math.round(basePremium * 0.18)
  );

  const addOnTotal = toAmount(
    snapshot?.addOnTotal || fare?.addOnTotal || fareBreakup?.addOnTotal,
    0
  );

  const medicalSurcharge = toAmount(
    snapshot?.medicalSurcharge || fare?.medicalSurcharge || fareBreakup?.medicalSurcharge,
    0
  );

  const adventureSportsAddon = toAmount(
    snapshot?.adventureSportsAddon ||
      fare?.adventureSportsAddon ||
      fareBreakup?.adventureSportsAddon,
    0
  );

  const seniorCitizenSurcharge = toAmount(
    snapshot?.seniorCitizenSurcharge ||
      fare?.seniorCitizenSurcharge ||
      fareBreakup?.seniorCitizenSurcharge,
    0
  );

  const convenienceFee = toAmount(
    snapshot?.convenienceFee || fare?.convenienceFee || fareBreakup?.convenienceFee,
    0
  );

  const gatewayFee = toAmount(
    snapshot?.gatewayFee || fare?.gatewayFee || fareBreakup?.gatewayFee,
    0
  );

  const markup = toAmount(snapshot?.markup || fare?.markup || fareBreakup?.markup, 0);

  const visaLinkedSurcharge = toAmount(
    snapshot?.visaLinkedSurcharge ||
      fare?.visaLinkedSurcharge ||
      fareBreakup?.visaLinkedSurcharge,
    0
  );

  const nonBenefitAmount = toAmount(
    snapshot?.nonBenefitAmount || fare?.nonBenefitAmount || fareBreakup?.nonBenefitAmount,
    gst +
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
      snapshot?.appliedOfferAmount ||
        fare?.appliedOfferAmount ||
        fareBreakup?.appliedOfferAmount ||
        parsed?.appliedOfferAmount ||
        parsed?.offerApplied,
      0
    ),
    basePremium
  );

  const appliedOfferCode =
    snapshot?.appliedOfferCode ||
    fare?.appliedOfferCode ||
    fareBreakup?.appliedOfferCode ||
    parsed?.appliedOfferCode ||
    "";

  const appliedOfferTitle =
    snapshot?.appliedOfferTitle ||
    fare?.appliedOfferTitle ||
    fareBreakup?.appliedOfferTitle ||
    parsed?.appliedOfferTitle ||
    "";

  const baseAfterOffer = toAmount(
    snapshot?.baseAfterOffer || fare?.baseAfterOffer || fareBreakup?.baseAfterOffer,
    Math.max(basePremium - appliedOfferAmount, 0)
  );

  const grossAmount = toAmount(
    snapshot?.grossAmount || fare?.grossAmount || fareBreakup?.grossAmount || parsed?.grossAmount,
    basePremium + nonBenefitAmount
  );

  const totalBeforeWallet = toAmount(
    snapshot?.totalBeforeWallet || fare?.totalBeforeWallet || fareBreakup?.totalBeforeWallet,
    baseAfterOffer + nonBenefitAmount
  );

  const promoUsed = toAmount(
    snapshot?.promoUsed || fare?.promoUsed || fareBreakup?.promoUsed || parsed?.promoUsed,
    0
  );

  const earnedUsed = toAmount(
    snapshot?.earnedUsed || fare?.earnedUsed || fareBreakup?.earnedUsed || parsed?.earnedUsed,
    0
  );

  const refundUsed = toAmount(
    snapshot?.refundUsed || fare?.refundUsed || fareBreakup?.refundUsed || parsed?.refundUsed,
    0
  );

  const tplCreditUsed = toAmount(
    snapshot?.tplCreditUsed || fare?.tplCreditUsed || fareBreakup?.tplCreditUsed || parsed?.tplCreditUsed,
    promoUsed + earnedUsed
  );

  const walletUsed = promoUsed + earnedUsed + refundUsed;

  const payableBeforeRefundWallet = toAmount(
    snapshot?.payableBeforeRefundWallet ||
      fare?.payableBeforeRefundWallet ||
      fareBreakup?.payableBeforeRefundWallet ||
      parsed?.payableBeforeRefundWallet,
    Math.max(totalBeforeWallet - tplCreditUsed, 0)
  );

  const finalPayable = toAmount(
    snapshot?.finalPayable ||
      snapshot?.finalTotal ||
      fare?.totalPaid ||
      fare?.totalAmount ||
      fare?.finalTotal ||
      fareBreakup?.finalPayable ||
      fareBreakup?.finalTotal ||
      parsed?.finalPayable ||
      parsed?.finalTotal ||
      parsed?.paymentData?.totalPaid,
    Math.max(payableBeforeRefundWallet - refundUsed, 0)
  );

  const earnedOnThisBooking = toAmount(
    snapshot?.earnedOnThisBooking ||
      fare?.earnedOnThisBooking ||
      fare?.walletBreakdown?.earnedOnThisBooking ||
      parsed?.walletBreakdown?.earnedOnThisBooking ||
      parsed?.walletBreakdown?.earnedOnBooking ||
      parsed?.earnedOnThisBooking,
    Math.round(baseAfterOffer * 0.02)
  );

  const pricingSnapshot = {
    ...snapshot,
    basePremium,
    baseAmount: basePremium,
    gst,
    gstAmount: gst,
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
  };

  return {
    pricingSnapshot,
    basePremium,
    gst,
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
    walletUsed,
    payableBeforeRefundWallet,
    finalPayable,
    earnedOnThisBooking,
    finalTotal: finalPayable,
  };
}

function creditEarnedForInsuranceBooking(params: {
  mobile: string;
  bookingId: string;
  earnedAmount: number;
}) {
  if (typeof window === "undefined") return;

  const { mobile, bookingId, earnedAmount } = params;

  if (!mobile || !bookingId || earnedAmount <= 0) return;

  const guardKey = `tpl_insurance_earned_credit_done_${bookingId}`;
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
      description: "Earned credit added after successful insurance policy booking",
      amount: earnedAmount,
      bookingId,
    },
    mobile
  );

  localStorage.setItem(guardKey, "true");
}

function persistInsuranceConfirmationSession(payload: ConfirmationPayload) {
  if (typeof window === "undefined") return;

  const value = JSON.stringify(payload);
  sessionStorage.setItem("tplInsuranceConfirmationData", value);
  sessionStorage.setItem("insurancePaymentSuccessData", value);
}

export default function InsuranceConfirmationPage() {
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
        ? sessionStorage.getItem("tplInsuranceConfirmationData") ||
          sessionStorage.getItem("insurancePaymentSuccessData")
        : null;

    if (!raw) return;

    try {
      let parsed = JSON.parse(raw);

      if (parsed?.backendCheckoutId) {
        const backendConfirm = await confirmInsuranceBackendCheckout({
          ...parsed,
          bookingId: parsed?.bookingId || "",
          paymentId: parsed?.paymentId || parsed?.transactionId || "",
          transactionId: parsed?.transactionId || parsed?.paymentId || "",
          paymentMethod:
            parsed?.paymentMethod ||
            parsed?.paymentData?.method ||
            "Online Payment",
        });

        if (backendConfirm.attempted && backendConfirm.refs) {
          parsed = {
            ...parsed,
            ...backendConfirm.refs,
          };
          persistInsuranceConfirmationSession(parsed);
        }
      }

      if (cancelled) return;

      const pricing = normalizeInsurancePricing(parsed);

      const normalizedParsed = {
        ...parsed,
        pricingSnapshot: pricing.pricingSnapshot,
        baseAfterOffer: pricing.baseAfterOffer,
        nonBenefitAmount: pricing.nonBenefitAmount,
        grossAmount: pricing.grossAmount,
        appliedOfferAmount: pricing.appliedOfferAmount,
        appliedOfferCode: pricing.appliedOfferCode,
        appliedOfferTitle: pricing.appliedOfferTitle,
        promoUsed: pricing.promoUsed,
        earnedUsed: pricing.earnedUsed,
        refundUsed: pricing.refundUsed,
        tplCreditUsed: pricing.tplCreditUsed,
        payableBeforeRefundWallet: pricing.payableBeforeRefundWallet,
        finalPayable: pricing.finalPayable,
        earnedOnThisBooking: pricing.earnedOnThisBooking,
        finalTotal: pricing.finalPayable,
        offerApplied: pricing.appliedOfferAmount,
        fare: {
          ...(parsed?.fare || {}),
          basePremium: pricing.basePremium,
          gst: pricing.gst,
          addOnTotal: pricing.addOnTotal,
          nonBenefitAmount: pricing.nonBenefitAmount,
          grossAmount: pricing.grossAmount,
          appliedOfferAmount: pricing.appliedOfferAmount,
          appliedOfferCode: pricing.appliedOfferCode,
          appliedOfferTitle: pricing.appliedOfferTitle,
          offerApplied: pricing.appliedOfferAmount,
          baseAfterOffer: pricing.baseAfterOffer,
          totalBeforeWallet: pricing.totalBeforeWallet,
          walletUsed: pricing.walletUsed,
          promoUsed: pricing.promoUsed,
          earnedUsed: pricing.earnedUsed,
          refundUsed: pricing.refundUsed,
          tplCreditUsed: pricing.tplCreditUsed,
          payableBeforeRefundWallet: pricing.payableBeforeRefundWallet,
          totalPaid: pricing.finalPayable,
          totalAmount: pricing.finalPayable,
          finalTotal: pricing.finalPayable,
          earnedOnThisBooking: pricing.earnedOnThisBooking,
          walletBreakdown: {
            ...(parsed?.fare?.walletBreakdown || {}),
            promoUsed: pricing.promoUsed,
            earnedUsed: pricing.earnedUsed,
            refundUsed: pricing.refundUsed,
            totalWalletUsed: pricing.walletUsed,
            earnedOnThisBooking: pricing.earnedOnThisBooking,
          },
        },
        fareBreakup: {
          ...(parsed?.fareBreakup || {}),
          basePremium: pricing.basePremium,
          gst: pricing.gst,
          addOnTotal: pricing.addOnTotal,
          nonBenefitAmount: pricing.nonBenefitAmount,
          grossAmount: pricing.grossAmount,
          appliedOfferAmount: pricing.appliedOfferAmount,
          appliedOfferCode: pricing.appliedOfferCode,
          appliedOfferTitle: pricing.appliedOfferTitle,
          offerApplied: pricing.appliedOfferAmount,
          baseAfterOffer: pricing.baseAfterOffer,
          totalBeforeWallet: pricing.totalBeforeWallet,
          promoUsed: pricing.promoUsed,
          earnedUsed: pricing.earnedUsed,
          refundUsed: pricing.refundUsed,
          tplCreditUsed: pricing.tplCreditUsed,
          totalWalletUsed: pricing.walletUsed,
          payableBeforeRefundWallet: pricing.payableBeforeRefundWallet,
          finalPayable: pricing.finalPayable,
          earnedOnThisBooking: pricing.earnedOnThisBooking,
          finalTotal: pricing.finalPayable,
        },
        walletBreakdown: {
          ...(parsed?.walletBreakdown || {}),
          promoUsed: pricing.promoUsed,
          earnedUsed: pricing.earnedUsed,
          refundUsed: pricing.refundUsed,
          totalWalletUsed: pricing.walletUsed,
          finalPayable: pricing.finalPayable,
          earnedOnBooking: pricing.earnedOnThisBooking,
          earnedOnThisBooking: pricing.earnedOnThisBooking,
        },
      };

      const leadTraveller =
        normalizedParsed?.leadTraveller || normalizedParsed?.travellers?.[0] || {};
      const nominee = normalizedParsed?.nominee || {};

      const mobile = cleanMobile(
        leadTraveller?.mobile ||
          nominee?.mobile ||
          normalizedParsed?.user?.mobile
      );

      const email =
        leadTraveller?.email ||
        nominee?.email ||
        normalizedParsed?.user?.email ||
        "";

      const policyNumber =
        normalizedParsed?.policyNumber ||
        normalizedParsed?.bookingId ||
        buildPolicyNumber();

      const provider =
        normalizedParsed?.provider || normalizedParsed?.plan?.provider || "";
      const planName =
        normalizedParsed?.planName || normalizedParsed?.plan?.planName || "";
      const destination =
        normalizedParsed?.destination ||
        normalizedParsed?.search?.destination ||
        "";

      const title = `${provider} ${planName} - ${destination}`
        .trim()
        .replace(/\s+/g, " ");

      const travelDate =
        normalizedParsed?.startDate ||
        normalizedParsed?.search?.fromDate ||
        normalizedParsed?.search?.startDate ||
        normalizedParsed?.bookedOn ||
        new Date().toISOString();

      const totalAmount = pricing.finalPayable;

      const safePaidAt =
        normalizedParsed?.paymentData?.paidAt ||
        normalizedParsed?.bookedOn ||
        new Date().toISOString();

      const earnedAmount = pricing.earnedOnThisBooking;

      setEarnedCreditAmount(earnedAmount);

      if (!mobile) {
        setData({
          ...normalizedParsed,
          policyNumber,
          bookingId: policyNumber,
          earnedCreditAmount: earnedAmount,
        });
        return;
      }

      seedAccountAndTravellerSafely({
        mobile,
        email,
        traveller: {
          name: resolveLeadName(leadTraveller),
          firstName: leadTraveller?.firstName || "",
          lastName: leadTraveller?.lastName || "",
          gender: leadTraveller?.gender || "",
          dob: leadTraveller?.dob || leadTraveller?.dateOfBirth || "",
          email,
          mobile,
          nationality: leadTraveller?.nationality || "Indian",
          passportNumber: leadTraveller?.passportNumber || "",
          passportExpiry: leadTraveller?.passportExpiry || "",
        },
        source: "insurance",
      });

      const leadName = resolveLeadName(leadTraveller);
      const leadEmail = String(email || "").toLowerCase().trim();

      const leadIdentity = `${leadName}_${leadEmail}`
        .replace(/\s+/g, "_")
        .replace(/[^\w\-]/g, "");

      const confirmationSaveKey =
        `insurance_booking_saved_${safePaidAt}_${mobile}_${leadIdentity}_${title}`
          .replace(/\s+/g, "_")
          .replace(/[^\w\-]/g, "");

      const payloadStorageKey =
        `tpl_booking_payload_insurance_${safePaidAt}_${mobile}_${leadIdentity}_${title}`
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
          booking.type === "insurance" &&
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
          ...normalizedParsed,
          bookingId: existingBooking.id,
          policyNumber: existingBooking.id,
          earnedCreditAmount: earnedAmount,
        };

        localStorage.setItem(
          existingBooking.payloadStorageKey || payloadStorageKey,
          JSON.stringify(payloadWithBookingId)
        );

        createGuestUserFromBooking({
          name: leadName,
          mobile,
          email,
        });

        creditEarnedForInsuranceBooking({
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
        const travellerCount = normalizedParsed?.travellers?.length || 1;

        const newBooking = addBooking({
          type: "insurance",
          title,
          travelDate,
          travellers: `${travellerCount} Traveller${
            travellerCount > 1 ? "s" : ""
          }`,
          amount: totalAmount,
          status: "upcoming",
          mobile,
          leadTraveller: {
            name: leadName,
            mobile,
            email,
          },
          ticketType: "insurance",
          detailRoute: "/insurance/confirmation",
          payloadStorageKey,
        });

        const payloadWithBookingId = {
          ...normalizedParsed,
          bookingId: newBooking.id,
          policyNumber: newBooking.id,
          earnedCreditAmount: earnedAmount,
        };

        localStorage.setItem(
          payloadStorageKey,
          JSON.stringify(payloadWithBookingId)
        );

        createGuestUserFromBooking({
          name: leadName,
          mobile,
          email,
        });

        creditEarnedForInsuranceBooking({
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
        name: leadName,
        mobile,
        email,
      });

      if (normalizedParsed?.bookingId) {
        creditEarnedForInsuranceBooking({
          mobile,
          bookingId: normalizedParsed.bookingId,
          earnedAmount,
        });
      }

      setData({
        ...normalizedParsed,
        policyNumber,
        bookingId: policyNumber,
        earnedCreditAmount: earnedAmount,
      });
    } catch (error) {
      console.error("Insurance confirmation parse error:", error);
    }

    };

    void loadConfirmation();

    return () => {
      cancelled = true;
    };
  }, []);

  const policyNumber = useMemo(() => {
    return (
      savedBooking?.id ||
      data?.policyNumber ||
      data?.bookingId ||
      buildPolicyNumber()
    );
  }, [savedBooking?.id, data?.policyNumber, data?.bookingId]);

  const bookingId = useMemo(() => {
    return savedBooking?.id || data?.bookingId || policyNumber;
  }, [savedBooking?.id, data?.bookingId, policyNumber]);

  const paymentId = useMemo(() => {
    return data?.paymentId || data?.transactionId || buildPaymentId();
  }, [data?.paymentId, data?.transactionId]);

  if (!data) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#eef3f8]">
        <div className="rounded-xl border bg-white p-6 font-semibold">
          No insurance confirmation data found.
        </div>
      </main>
    );
  }

  const leadTraveller = data?.leadTraveller || data?.travellers?.[0] || {};
  const nominee = data?.nominee || {};

  const mobile = cleanMobile(
    leadTraveller?.mobile || nominee?.mobile || data?.user?.mobile
  );

  const email = leadTraveller?.email || nominee?.email || data?.user?.email || "";

  const policyStatus = data?.policyStatus || data?.bookingStatus || "Active";
  const paymentStatus = data?.paymentStatus || "Paid";
  const bookedOn =
    data?.bookedOn || data?.paymentData?.paidAt || new Date().toISOString();

  const finalEarnedCreditAmount =
    earnedCreditAmount || data?.earnedCreditAmount || 0;

  const handlePrint = () => window.print();

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#eef3f8] pb-8 text-black lg:pb-0">
      <div className="border-b border-orange-200 bg-orange-50 px-3 py-3 text-center md:py-4">
        <div className="break-words text-base font-black text-orange-700 md:text-lg">
          ✅ Insurance Policy Confirmed
        </div>
        <div className="mx-auto mt-1 max-w-3xl break-words text-xs font-semibold leading-5 text-orange-600 md:text-sm">
          Your policy is issued successfully. Download your policy document
          anytime from My Bookings.
        </div>

        {finalEarnedCreditAmount > 0 ? (
          <div className="mx-auto mt-2 max-w-3xl break-words text-xs font-bold leading-5 text-green-700 md:text-sm">
            🎁 You earned ₹
            {Number(finalEarnedCreditAmount).toLocaleString("en-IN")} TPL Earned
            Credit on this policy.
          </div>
        ) : null}
      </div>

      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-3 py-4 md:px-4 md:py-6 lg:flex-row">
        <div className="flex min-w-0 flex-col gap-4 lg:w-[72%]">
          <InsuranceConfirmationHero
            policyNumber={policyNumber}
            bookingId={bookingId}
            provider={data?.provider || data?.plan?.provider || ""}
            planName={data?.planName || data?.plan?.planName || ""}
            policyStatus={policyStatus}
            paymentStatus={paymentStatus}
            bookedOn={bookedOn}
            earnedCreditAmount={finalEarnedCreditAmount}
          />

          {finalEarnedCreditAmount > 0 ? (
            <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-[13px] font-bold leading-5 text-green-700 md:px-5 md:py-4 md:text-[14px]">
              🎉 You earned ₹
              {Number(finalEarnedCreditAmount).toLocaleString("en-IN")} TPL
              Earned Credit. This has been added to your wallet.
            </div>
          ) : null}

          <InsuranceConfirmationPolicyCard data={data} />

          <InsuranceConfirmationTravellerCard
            travellers={data?.travellers || []}
          />

          <InsuranceConfirmationCoverageCard data={data} />

          <InsuranceConfirmationFareCard data={data} paymentId={paymentId} />
        </div>

        <div className="min-w-0 lg:w-[28%]">
          <InsuranceConfirmationActionsCard
            policyNumber={policyNumber}
            email={email || undefined}
            mobile={mobile ? `+91 ${mobile}` : undefined}
            onDownloadPolicy={handlePrint}
            onDownloadInvoice={handlePrint}
            onPrintPolicy={handlePrint}
            onEmailPolicy={handlePrint}
            onWhatsAppPolicy={handlePrint}
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
