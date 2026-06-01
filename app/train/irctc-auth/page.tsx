"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import TrainIrctcAuthTopBar from "@/app/components/auth/train/TrainIrctcAuthTopBar";
import TrainIrctcAuthSummaryCard from "@/app/components/auth/train/TrainIrctcAuthSummaryCard";
import TrainIrctcAuthForm from "@/app/components/auth/train/TrainIrctcAuthForm";
import TrainIrctcAuthInfoCard from "@/app/components/auth/train/TrainIrctcAuthInfoCard";

type ConfirmedTrainPaymentPayload = any;

function buildBookingId() {
  return `TPL-TRN-${Date.now().toString().slice(-6)}`;
}

function buildPaymentId() {
  return `TPL-PAY-${Date.now().toString().slice(-6)}`;
}

function buildPnrNumber() {
  return `${Date.now().toString().slice(-10)}`;
}

function toNumber(value: any, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function resolveTrainPricingSnapshot(authData: any, booking: any) {
  const source =
    authData?.pricing ||
    authData?.fareSnapshot ||
    authData?.priceBreakup ||
    authData?.bookingPayload?.pricingSnapshot ||
    authData?.bookingPayload?.fareSnapshot ||
    authData?.bookingPayload?.priceBreakup ||
    authData?.fare ||
    {};

  const baseFare = toNumber(
    source.trueBaseFare || source.baseFare || booking?.trueBaseFare || booking?.baseFare || booking?.ticketPrice || 0
  );

  const appliedOffer = toNumber(
    source.appliedOfferAmount ||
      source.offerApplied ||
      source.appliedOffer ||
      source.offerDiscount ||
      source.couponDiscount ||
      0
  );

  const baseAfterOffer = toNumber(
    source.baseAfterOffer || Math.max(0, baseFare - appliedOffer)
  );

  const convenienceFee = toNumber(source.convenienceFee || 0);
  const gatewayFee = toNumber(source.gatewayFee || 0);
  const confirmUpgradeAmount = toNumber(source.confirmUpgradeAmount || 0);

  const nonBenefitTotal = toNumber(
    source.nonBenefitTotal || convenienceFee + gatewayFee + confirmUpgradeAmount
  );

  const promoUsed = toNumber(
    source.walletCalc?.promoUsed ||
      source.walletBreakdown?.promoUsed ||
      authData?.paymentData?.promoUsed ||
      0
  );

  const earnedUsed = toNumber(
    source.walletCalc?.earnedUsed ||
      source.walletBreakdown?.earnedUsed ||
      authData?.paymentData?.earnedUsed ||
      0
  );

  const refundUsed = toNumber(
    source.walletCalc?.refundUsed ||
      source.walletBreakdown?.refundUsed ||
      authData?.paymentData?.refundUsed ||
      0
  );

  const totalWalletUsed = promoUsed + earnedUsed + refundUsed;

  const totalBeforeWallet = toNumber(
    source.totalBeforeWallet || baseAfterOffer + nonBenefitTotal
  );

  const totalAmount = toNumber(
    source.totalAmount ||
      source.payableAmount ||
      source.grandTotal ||
      source.totalPaid ||
      authData?.paymentData?.totalPaid ||
      Math.max(totalBeforeWallet - totalWalletUsed, 0)
  );

  const earnedOnThisBooking = toNumber(
    source.earnedOnThisBooking ||
      source.walletBreakdown?.earnedOnThisBooking ||
      authData?.earnedCreditAmount ||
      Math.floor(baseAfterOffer * 0.02)
  );

  return {
    pricingVersion: "TPL_TRAIN_PRICING_RULE_V1",

    baseFare,
    trueBaseFare: baseFare,
    baseAfterOffer,

    convenienceFee,
    gatewayFee,
    confirmUpgradeAmount,

    taxesAndFees: toNumber(source.taxesAndFees || source.taxes || 0),
    taxes: toNumber(source.taxes || source.taxesAndFees || 0),
    seatBerthCharges: toNumber(source.seatBerthCharges || 0),
    mealAmount: toNumber(source.mealAmount || source.foodAmount || 0),
    insuranceAmount: toNumber(source.insuranceAmount || 0),
    serviceFee: toNumber(source.serviceFee || 0),
    cancellationFreeChangeAmount: toNumber(source.cancellationFreeChangeAmount || 0),

    nonBenefitTotal,
    totalBeforeWallet,

    appliedOffer,
    offerApplied: appliedOffer,
    appliedOfferAmount: appliedOffer,
    offerDiscount: appliedOffer,
    couponDiscount: appliedOffer,
    appliedOfferCode: source.appliedOfferCode || authData?.appliedOfferCode || "",
    appliedOfferTitle: source.appliedOfferTitle || authData?.appliedOfferTitle || "",
    offerData: source.offerData || authData?.offerData || null,

    promoUsed,
    earnedUsed,
    refundUsed,
    tplCredit: totalWalletUsed,
    tplCreditUsed: promoUsed + earnedUsed,
    totalWalletUsed,

    walletCalc: {
      promoUsed,
      earnedUsed,
      refundUsed,
    },

    walletBreakdown: {
      promoUsed,
      earnedUsed,
      refundUsed,
      totalWalletUsed,
      tplCreditUsed: promoUsed + earnedUsed,
      earnedOnThisBooking,
    },

    promoCreditEligibleBase: baseAfterOffer,
    earnedCreditEligibleBase: baseAfterOffer,
    refundWalletEligibleAmount: totalBeforeWallet,

    totalAmount,
    totalPaid: totalAmount,
    payableAmount: totalAmount,
    grandTotal: totalAmount,

    earnedOnThisBooking,

    rules: {
      offerAppliesOn: "true_base_train_fare",
      promoEarnedAppliesOn: "base_after_offer",
      refundWalletAppliesOn: "final_payable",
      earnedCreditRate: 0.02,
      managePaymentPromoEarnedAllowed: false,
      managePaymentRefundWalletAllowed: true,
    },
  };
}

export default function TrainIrctcAuthPage() {
  const router = useRouter();

  const [authData, setAuthData] =
    useState<ConfirmedTrainPaymentPayload | null>(null);
  const [password, setPassword] = useState("");
  const [captcha, setCaptcha] = useState("");
  const [authActionState, setAuthActionState] = useState<
    "idle" | "processing" | "success" | "failure"
  >("idle");

  const [timerLeft, setTimerLeft] = useState(10 * 60);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem("tplTrainPaymentConfirmedData");
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as ConfirmedTrainPaymentPayload;
      setAuthData(parsed);
      setTimerLeft(parsed.timerLeft || 10 * 60);
    } catch (error) {
      console.error("Failed to parse IRCTC auth data", error);
      setAuthData(null);
    }
  }, []);

  useEffect(() => {
    if (!authData) return;

    if (timerLeft <= 0) {
      setIsExpired(true);
      return;
    }

    const timer = setInterval(() => {
      setTimerLeft((prev) => {
        const next = prev > 0 ? prev - 1 : 0;

        try {
          const raw = sessionStorage.getItem("tplTrainPaymentConfirmedData");
          const latest = raw ? JSON.parse(raw) : authData;

          sessionStorage.setItem(
            "tplTrainPaymentConfirmedData",
            JSON.stringify({
              ...latest,
              timerLeft: next,
            })
          );
        } catch (error) {
          console.error("Failed to update IRCTC timer in sessionStorage", error);
        }

        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [authData, timerLeft]);

  const timerLabel = useMemo(() => {
    const mm = String(Math.max(0, Math.floor(timerLeft / 60))).padStart(2, "0");
    const ss = String(Math.max(0, timerLeft % 60)).padStart(2, "0");
    return `${mm}:${ss}`;
  }, [timerLeft]);

  const handleVerify = useCallback(() => {
    if (!authData || isExpired) return;
    if (!password.trim() || !captcha.trim()) return;

    setAuthActionState("processing");

    setTimeout(() => {
      try {
        const now = new Date().toISOString();
        const booking = authData.bookingPayload || {};

        const bookingId = authData.bookingId || buildBookingId();
        const paymentId =
          authData.paymentId ||
          authData.transactionId ||
          authData.paymentData?.paymentId ||
          buildPaymentId();

        const pnrNumber = authData.pnrNumber || authData.pnr || buildPnrNumber();

        const pricingSnapshot = resolveTrainPricingSnapshot(authData, booking);

        const sourcePassengers = Array.isArray(authData.travellers)
          ? authData.travellers
          : Array.isArray(booking.passengers)
          ? booking.passengers
          : [];

        const normalizedTravellers =
          sourcePassengers.length > 0
            ? sourcePassengers.map((passenger: any, index: number) => ({
                id: passenger.id || String(index + 1),
                fullName:
                  passenger.fullName ||
                  `${passenger.firstName || ""} ${
                    passenger.lastName || ""
                  }`.trim(),
                firstName:
                  passenger.firstName ||
                  passenger.fullName?.split(" ")?.[0] ||
                  "",
                lastName:
                  passenger.lastName ||
                  passenger.fullName?.split(" ")?.slice(1).join(" ") ||
                  "",
                gender: passenger.gender || "",
                age: passenger.age || "",
                seatNumber: passenger.seatNumber || "",
                coach: passenger.coach || booking.classCode || "",
                berth: passenger.berth || "",
                quota: passenger.quota || booking.quota || "",
                status: passenger.status || "Confirmed",
              }))
            : [];

        const contactDetails = {
          countryCode:
            authData.contactDetails?.countryCode ||
            booking.contactDetails?.countryCode ||
            "+91",
          mobile:
            authData.contactDetails?.mobile ||
            booking.contactDetails?.mobile ||
            "",
          email:
            authData.contactDetails?.email ||
            booking.contactDetails?.email ||
            "",
        };

        const confirmationPayload = {
          ...authData,

          bookingId,
          paymentId,
          transactionId: paymentId,
          pnrNumber,
          pnr: pnrNumber,

          bookingStatus: "confirmed",
          paymentStatus: "paid",
          bookedOn: authData.bookedOn || now,
          paidAt: authData.paymentData?.paidAt || authData.paidAt || now,
          paymentMethod:
            authData.paymentMethod ||
            authData.paymentData?.method ||
            "Online Payment",

          bookingPayload: {
            ...booking,
            pricingSnapshot,
            fareSnapshot: pricingSnapshot,
            priceBreakup: pricingSnapshot,
          },

          pricing: pricingSnapshot,
          fareSnapshot: pricingSnapshot,
          priceBreakup: pricingSnapshot,

          appliedOffer: authData.appliedOffer || null,
          appliedOfferCode: pricingSnapshot.appliedOfferCode || "",
          appliedOfferTitle: pricingSnapshot.appliedOfferTitle || "",
          offerData: pricingSnapshot.offerData || null,

          trainName:
            authData.trainName ||
            booking.trainName ||
            booking.train?.trainName ||
            booking.train?.name ||
            "Train Booking Confirmed",

          trainNumber:
            authData.trainNumber ||
            booking.trainNumber ||
            booking.train?.trainNumber ||
            "",

          route:
            authData.route ||
            booking.route ||
            `${booking.fromCode || booking.fromCity || booking.fromStation || "ORG"} → ${
              booking.toCode || booking.toCity || booking.toStation || "DST"
            }`,

          boardingStation:
            authData.boardingStation ||
            booking.fromCity ||
            booking.fromStation ||
            "",

          destinationStation:
            authData.destinationStation ||
            booking.toCity ||
            booking.toStation ||
            "",

          journeyDate:
            authData.journeyDate ||
            booking.travelDate ||
            booking.journeyDate ||
            booking.date ||
            "",

          departureTime: authData.departureTime || booking.departureTime || "",
          arrivalTime: authData.arrivalTime || booking.arrivalTime || "",
          duration: authData.duration || booking.duration || "",
          coachClass: authData.coachClass || booking.classCode || "",
          quota: authData.quota || booking.quota || "",

          travellers: normalizedTravellers,
          contactDetails,

          fare: {
            ...pricingSnapshot,
            reservationCharge: pricingSnapshot.convenienceFee,
            superfastCharge: 0,
            otherCharges:
              pricingSnapshot.gatewayFee + pricingSnapshot.confirmUpgradeAmount,
            tax: pricingSnapshot.taxes,
            insuranceAmount: pricingSnapshot.insuranceAmount,
            foodAmount: pricingSnapshot.mealAmount,
          },

          paymentData: {
            ...(authData.paymentData || {}),
            totalPaid: pricingSnapshot.totalAmount,
            walletUsed: pricingSnapshot.totalWalletUsed,
            promoUsed: pricingSnapshot.promoUsed,
            earnedUsed: pricingSnapshot.earnedUsed,
            refundUsed: pricingSnapshot.refundUsed,
          },

          irctcAccount: authData.irctcAccount || {},
          authState: "verified",
          verifiedAt: now,

          earnedCreditAmount: pricingSnapshot.earnedOnThisBooking,

          bookingMeta: {
            ...(authData.bookingMeta || {}),
            bookingId,
            bookingStatus: "confirmed",
            paymentStatus: "paid",
            createdAt: authData.bookingMeta?.createdAt || now,
            serviceType: "train",
          },
        };

        sessionStorage.setItem(
          "trainConfirmationData",
          JSON.stringify(confirmationPayload)
        );

        sessionStorage.setItem(
          "trainPaymentSuccessData",
          JSON.stringify(confirmationPayload)
        );

        sessionStorage.setItem(
          "tplTrainBookingConfirmedData",
          JSON.stringify(confirmationPayload)
        );

        sessionStorage.setItem(
          "tplTrainPaymentConfirmedData",
          JSON.stringify(confirmationPayload)
        );

        setAuthActionState("success");

        setTimeout(() => {
          router.push("/train/confirmation");
        }, 500);
      } catch (error) {
        console.error("Train auth verification handling failed", error);
        setAuthActionState("failure");
      }
    }, 1800);
  }, [authData, isExpired, password, captcha, router]);

  const handleRetry = useCallback(() => {
    if (isExpired) return;
    setAuthActionState("idle");
  }, [isExpired]);

  if (!authData) {
    return (
      <main className="min-h-screen bg-[#f5f7fb]">
        <TrainIrctcAuthTopBar timerLabel="10:00" />
        <div className="mx-auto max-w-[1400px] px-3 py-4 md:px-4 md:py-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-[18px] font-bold text-slate-700">
            No IRCTC authentication data found.
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-w-0 overflow-x-hidden bg-[#f5f7fb] pb-8 text-black lg:min-h-screen">
      <TrainIrctcAuthTopBar
        timerLabel={timerLabel}
        trainName={
          authData.trainName ||
          authData.bookingPayload?.trainName ||
          authData.bookingPayload?.train?.trainName ||
          ""
        }
        route={
          authData.route ||
          `${authData.bookingPayload?.fromCode || authData.bookingPayload?.fromCity || "From"} → ${
            authData.bookingPayload?.toCode || authData.bookingPayload?.toCity || "To"
          }`
        }
      />

      <div className="mx-auto max-w-[1400px] px-3 py-3 md:px-4 lg:py-6">
        <div className="flex min-w-0 flex-col items-stretch gap-4 lg:flex-row lg:items-start lg:gap-5">
          <div className="min-w-0 space-y-4 lg:w-[74%] lg:space-y-5">
            <TrainIrctcAuthSummaryCard
              bookingPayload={authData.bookingPayload}
              irctcUsername={authData.irctcAccount?.username || ""}
            />

            <TrainIrctcAuthForm
              irctcUsername={authData.irctcAccount?.username || ""}
              password={password}
              captcha={captcha}
              paymentActionState={authActionState}
              isExpired={isExpired}
              onPasswordChange={setPassword}
              onCaptchaChange={setCaptcha}
              onVerify={handleVerify}
              onRetry={handleRetry}
            />

            <div className="lg:hidden">
              <TrainIrctcAuthInfoCard />
            </div>
          </div>

          <div className="hidden w-[26%] min-w-0 self-start lg:block">
            <TrainIrctcAuthInfoCard />
          </div>
        </div>
      </div>
    </main>
  );
}
