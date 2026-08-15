"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import TrainConfirmationJourneyCard from "@/app/components/confirmation/train/TrainConfirmationJourneyCard";
import TrainConfirmationTravellerCard from "@/app/components/confirmation/train/TrainConfirmationTravellerCard";
import TrainConfirmationFareCard from "@/app/components/confirmation/train/TrainConfirmationFareCard";

import {
  BOOKING_UPDATED_EVENT,
  type BookingItem,
} from "@/app/lib/booking/bookingStorage";

import { getBackendFirstBookingPayload } from "@/app/lib/api/bookingApi";

type Payload = any;

function toNumber(value: any, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function resolveTrainFareSnapshot(payload: any, booking?: BookingItem | null) {
  const source =
    payload?.fare ||
    payload?.pricing ||
    payload?.fareSnapshot ||
    payload?.priceBreakup ||
    payload?.bookingPayload?.pricingSnapshot ||
    payload?.bookingPayload?.fareSnapshot ||
    payload?.bookingPayload?.priceBreakup ||
    {};

  const paymentData = payload?.paymentData || {};

  const baseFare = toNumber(source.trueBaseFare || source.baseFare || 0);

  const appliedOffer = toNumber(
    source.appliedOffer ||
      source.offerApplied ||
      source.appliedOfferAmount ||
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

  const reservationCharge = toNumber(
    source.reservationCharge || convenienceFee || 0
  );

  const superfastCharge = toNumber(source.superfastCharge || 0);

  const otherCharges = toNumber(
    source.otherCharges || gatewayFee + confirmUpgradeAmount
  );

  const tax = toNumber(source.tax || source.taxes || source.taxesAndFees || 0);
  const insuranceAmount = toNumber(source.insuranceAmount || 0);
  const foodAmount = toNumber(source.foodAmount || source.mealAmount || 0);

  const promoUsed = toNumber(
    source.walletCalc?.promoUsed ||
      source.walletBreakdown?.promoUsed ||
      paymentData?.promoUsed ||
      0
  );

  const earnedUsed = toNumber(
    source.walletCalc?.earnedUsed ||
      source.walletBreakdown?.earnedUsed ||
      paymentData?.earnedUsed ||
      0
  );

  const refundUsed = toNumber(
    source.walletCalc?.refundUsed ||
      source.walletBreakdown?.refundUsed ||
      paymentData?.refundUsed ||
      0
  );

  const totalWalletUsed = promoUsed + earnedUsed + refundUsed;

  const nonBenefitTotal = toNumber(
    source.nonBenefitTotal ||
      reservationCharge +
        superfastCharge +
        otherCharges +
        tax +
        insuranceAmount +
        foodAmount
  );

  const totalBeforeWallet = toNumber(
    source.totalBeforeWallet || baseAfterOffer + nonBenefitTotal
  );

  const totalAmount = toNumber(
    paymentData?.totalPaid ||
      source.totalPaid ||
      source.totalAmount ||
      source.payableAmount ||
      source.grandTotal ||
      booking?.amount ||
      Math.max(totalBeforeWallet - totalWalletUsed, 0)
  );

  const earnedOnThisBooking = toNumber(
    payload?.earnedCreditAmount ||
      source.earnedOnThisBooking ||
      source.walletBreakdown?.earnedOnThisBooking ||
      0
  );

  return {
    pricingVersion: "TPL_TRAIN_PRICING_RULE_V1",

    baseFare,
    trueBaseFare: baseFare,
    baseAfterOffer,

    reservationCharge,
    superfastCharge,
    otherCharges,
    tax,
    insuranceAmount,
    foodAmount,

    convenienceFee,
    gatewayFee,
    confirmUpgradeAmount,

    tplCredit: toNumber(source.tplCredit || source.totalWalletUsed || totalWalletUsed),
    appliedOffer,
    totalBeforeWallet,
    totalAmount,

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

    earnedOnThisBooking,
  };
}

export default function TrainBookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = String(params?.bookingId || "");

  const [booking, setBooking] = useState<BookingItem | null>(null);
  const [payload, setPayload] = useState<Payload | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const result = await getBackendFirstBookingPayload<Payload>(
        bookingId,
        "train"
      );
      if (cancelled) return;

      setBooking(result.booking);
      setPayload(result.payload);
      setRefreshKey((p) => p + 1);
    };

    void load();

    window.addEventListener(BOOKING_UPDATED_EVENT, load);
    window.addEventListener("storage", load);
    window.addEventListener("focus", load);

    return () => {
      cancelled = true;
      window.removeEventListener(BOOKING_UPDATED_EVENT, load);
      window.removeEventListener("storage", load);
      window.removeEventListener("focus", load);
    };
  }, [bookingId]);

  const paymentStatus = useMemo(() => {
    return payload?.paymentStatus === "pending" ||
      payload?.paymentStatus === "Pending"
      ? "pending"
      : "success";
  }, [payload?.paymentStatus]);

  if (!booking || !payload) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#eef3f8]">
        <div className="bg-white p-6 rounded-xl border font-semibold">
          Train booking detail not found.
        </div>
      </main>
    );
  }

  const paymentData = payload?.paymentData || {};
  const fareSnapshot = resolveTrainFareSnapshot(payload, booking);

  const trainName = payload?.trainName || "Train Booking";
  const trainNumber = payload?.trainNumber || "";
  const pnrNumber = payload?.pnrNumber || payload?.pnr || "";

  const route = payload?.route || "";
  const boardingStation = payload?.boardingStation || "";
  const destinationStation = payload?.destinationStation || "";
  const journeyDate = payload?.journeyDate || booking.travelDate || "";

  const departureTime = payload?.departureTime || "";
  const arrivalTime = payload?.arrivalTime || "";
  const coachClass = payload?.coachClass || payload?.travelClass || "";
  const quota = payload?.quota || "";

  const travellers = Array.isArray(payload?.travellers)
    ? payload.travellers
    : Array.isArray(payload?.bookingPayload?.passengers)
    ? payload.bookingPayload.passengers
    : [];

  const contactDetails =
    payload?.contactDetails || payload?.bookingPayload?.contactDetails || {};

  const paymentMethod =
    paymentData?.method || payload?.paymentMethod || "Online Payment";

  const bookedAt =
    paymentData?.paidAt ||
    payload?.bookedOn ||
    payload?.paidAt ||
    booking.bookingDate;

  const earnedOnThisBooking = Number(fareSnapshot.earnedOnThisBooking || 0);

  const fareSummary = {
    baseFare: fareSnapshot.baseFare,
    reservationCharge: fareSnapshot.reservationCharge,
    superfastCharge: fareSnapshot.superfastCharge,
    otherCharges: fareSnapshot.otherCharges,
    tax: fareSnapshot.tax,
    insuranceAmount: fareSnapshot.insuranceAmount,
    foodAmount: fareSnapshot.foodAmount,
    tplCredit: fareSnapshot.tplCredit,
    appliedOffer: fareSnapshot.appliedOffer,
    totalAmount: fareSnapshot.totalAmount,
    walletCalc: fareSnapshot.walletCalc,
  };

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#eef3f8] text-black">
      <div className="min-h-[72px] bg-white border-b flex flex-col items-start justify-center gap-3 px-3 py-3 md:h-[72px] md:flex-row md:items-center md:justify-between md:px-6 md:py-0">
        <div className="text-2xl font-black">TPL</div>

        <button
          onClick={() => router.push("/account/bookings")}
          className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[#d9e2ec] bg-white px-4 py-2 text-[12px] font-extrabold text-[#111827] shadow-[0_6px_18px_rgba(15,23,42,0.06)] transition hover:border-[#bfd3ea] hover:bg-[#f8fbff] md:px-5 md:text-[13px]"
        >
          <span style={{ fontSize: "14px", lineHeight: 1 }}>←</span>
          <span>Back to My Bookings</span>
        </button>
      </div>

      <div className="bg-white border-b border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-3 md:px-4">
          <div className="text-[19px] font-black leading-7 text-slate-900 md:text-[22px]">
            Train Booking Detail
          </div>
          <div className="mt-1 break-words text-[12px] text-slate-600 md:text-sm">
            Booking ID: {booking.id}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 py-4 flex flex-col gap-4 md:px-4 md:py-6">
        <TrainConfirmationJourneyCard
          trainName={trainName}
          trainNumber={trainNumber}
          route={route}
          boardingStation={boardingStation}
          destinationStation={destinationStation}
          journeyDate={journeyDate}
          departureTime={departureTime}
          arrivalTime={arrivalTime}
          coachClass={coachClass}
          quota={quota}
        />

        <TrainConfirmationTravellerCard
          key={`train-traveller-${refreshKey}`}
          travellers={travellers}
          contactDetails={contactDetails}
          pnrNumber={pnrNumber}
          trainNumber={trainNumber}
          coachClass={coachClass}
        />

        <TrainConfirmationFareCard
          bookingId={booking.id}
          paymentId={
            payload?.paymentId ||
            payload?.transactionId ||
            paymentData?.paymentId ||
            "-"
          }
          pnrNumber={pnrNumber}
          baseFare={fareSummary.baseFare}
          reservationCharge={fareSummary.reservationCharge}
          superfastCharge={fareSummary.superfastCharge}
          otherCharges={fareSummary.otherCharges}
          tax={fareSummary.tax}
          insuranceAmount={fareSummary.insuranceAmount}
          foodAmount={fareSummary.foodAmount}
          tplCredit={fareSummary.tplCredit}
          appliedOffer={fareSummary.appliedOffer}
          totalAmount={fareSummary.totalAmount}
          paymentMethod={paymentMethod}
          paymentStatus={paymentStatus}
          paidAt={bookedAt}
          walletCalc={fareSummary.walletCalc}
          earnedOnThisBooking={earnedOnThisBooking}
        />
      </div>
    </main>
  );
}
