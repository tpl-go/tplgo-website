"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import CabConfirmationJourneyCard from "@/app/components/confirmation/cab/CabConfirmationJourneyCard";
import CabConfirmationTravellerCard from "@/app/components/confirmation/cab/CabConfirmationTravellerCard";
import CabConfirmationFareCard from "@/app/components/confirmation/cab/CabConfirmationFareCard";

import {
  BOOKING_UPDATED_EVENT,
  getAllBookings,
  type BookingItem,
} from "@/app/lib/booking/bookingStorage";

import { getBookingPayload } from "@/app/lib/booking/bookingActionHelpers";

type Payload = any;

export default function CabBookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = String(params?.bookingId || "");

  const [booking, setBooking] = useState<BookingItem | null>(null);
  const [payload, setPayload] = useState<Payload | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const load = () => {
      const all = getAllBookings();
      const found =
        all.find((b) => b.id === bookingId && b.type === "cab") || null;

      setBooking(found);

      if (found?.payloadStorageKey) {
        const data = getBookingPayload<Payload>(found.payloadStorageKey);
        setPayload(data ? { ...data } : null);
      } else {
        setPayload(null);
      }

      setRefreshKey((p) => p + 1);
    };

    load();

    window.addEventListener(BOOKING_UPDATED_EVENT, load);
    window.addEventListener("storage", load);
    window.addEventListener("focus", load);

    return () => {
      window.removeEventListener(BOOKING_UPDATED_EVENT, load);
      window.removeEventListener("storage", load);
      window.removeEventListener("focus", load);
    };
  }, [bookingId]);

  const paymentStatus = useMemo(() => {
    return payload?.paymentStatus === "pending" ||
      payload?.paymentStatus === "Pending"
      ? "pending"
      : payload?.paymentStatus === "failed" ||
        payload?.paymentStatus === "Failed"
      ? "failed"
      : "success";
  }, [payload?.paymentStatus]);

  if (!booking || !payload) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#eef3f8]">
        <div className="bg-white p-6 rounded-xl border font-semibold">
          Cab booking detail not found.
        </div>
      </main>
    );
  }

  const cabType =
    payload?.cabType ||
    payload?.vehicleType ||
    payload?.cab?.vehicleType ||
    payload?.cab?.rideType ||
    "Cab Booking";

  const cabName =
    payload?.cabName ||
    payload?.vehicleName ||
    payload?.cab?.name ||
    payload?.cab?.brand ||
    cabType;

  const rideId = payload?.rideId || payload?.tripId || "";

  const fromLocation =
    payload?.fromLocation ||
    payload?.pickupLocation ||
    payload?.searchMeta?.from ||
    payload?.searchMeta?.pickup ||
    payload?.traveller?.pickupLocation ||
    "";

  const toLocation =
    payload?.toLocation ||
    payload?.dropLocation ||
    payload?.searchMeta?.to ||
    payload?.searchMeta?.drop ||
    "";

  const pickupDate =
    payload?.pickupDate ||
    payload?.travelDate ||
    payload?.searchMeta?.pickupDate ||
    payload?.searchMeta?.departureDate ||
    booking.travelDate ||
    "";

  const pickupTime = payload?.pickupTime || payload?.searchMeta?.pickupTime || "";
  const tripType = payload?.tripType || payload?.searchMeta?.rideType || "";

  const specialRequest =
    payload?.specialRequest ||
    (Array.isArray(payload?.selectedAddons)
      ? payload.selectedAddons.map((item: any) => item?.title).filter(Boolean).join(", ")
      : "");

  const travellers = Array.isArray(payload?.travellers) ? payload.travellers : [];
  const contactDetails = payload?.contactDetails || {};

  const paymentData = payload?.paymentData || {};
  const fare = payload?.fare || {};
  const walletBreakdown = fare?.walletBreakdown || {};

  const paymentMethod =
    paymentData?.method || payload?.paymentMethod || "Online Payment";

  const bookedAt =
    paymentData?.paidAt ||
    payload?.bookedOn ||
    payload?.paidAt ||
    booking.bookingDate;

  const finalEarnedCreditAmount =
    Number(payload?.earnedCreditAmount || 0) ||
    Number(walletBreakdown?.earnedOnThisBooking || 0);

  const fareSummary = {
    baseFare: Number(fare?.baseFare || 0),
    driverAllowance: Number(fare?.driverAllowance || 0),
    nightCharge: Number(fare?.nightCharge || 0),
    tollTax: Number(fare?.tollTax || 0),
    stateTax: Number(fare?.stateTax || 0),
    parkingCharge: Number(fare?.parkingCharge || 0),
    gst: Number(fare?.gst || fare?.taxesAndFees || 0),
    tplCredit: Number(payload?.tplCredit || fare?.tplCredit || 0),
    appliedOffer: Number(payload?.appliedOffer || fare?.appliedOffer || 0),
    totalAmount: Number(
      paymentData?.totalPaid ||
        fare?.totalPaid ||
        fare?.totalAmount ||
        fare?.totalPayable ||
        booking.amount ||
        0
    ),
    walletCalc: {
      promoUsed:
        Number(walletBreakdown?.promoUsed || 0) ||
        Number(paymentData?.promoUsed || 0),
      earnedUsed:
        Number(walletBreakdown?.earnedUsed || 0) ||
        Number(paymentData?.earnedUsed || 0),
      refundUsed:
        Number(walletBreakdown?.refundUsed || 0) ||
        Number(paymentData?.refundUsed || 0),
    },
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
            Cab Booking Detail
          </div>
          <div className="mt-1 break-words text-[12px] text-slate-600 md:text-sm">
            Booking ID: {booking.id}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 py-4 flex flex-col gap-4 md:px-4 md:py-6">
        <CabConfirmationJourneyCard
          cabType={cabType}
          fromLocation={fromLocation}
          toLocation={toLocation}
          pickupDate={pickupDate}
          pickupTime={pickupTime}
          tripType={tripType}
          vehicleName={cabName}
          specialRequest={specialRequest}
        />

        <CabConfirmationTravellerCard
          key={`cab-traveller-${refreshKey}`}
          travellers={travellers}
          contactDetails={contactDetails}
        />

        <CabConfirmationFareCard
  bookingId={booking.id}
  paymentId={
    payload?.paymentId ||
    payload?.transactionId ||
    paymentData?.paymentId ||
    "-"
  }
  rideId={rideId}

  baseFare={fareSummary.baseFare}
  driverAllowance={fareSummary.driverAllowance}
  nightCharge={fareSummary.nightCharge}
  tollTax={fareSummary.tollTax}
  stateTax={fareSummary.stateTax}
  parkingCharge={fareSummary.parkingCharge}
  gst={fareSummary.gst}

  tplCredit={fareSummary.tplCredit}
  appliedOffer={fareSummary.appliedOffer}

  appliedOfferCode={
    payload?.appliedOfferCode ||
    payload?.appliedOffer?.code ||
    ""
  }

  appliedOfferTitle={
    payload?.appliedOfferTitle ||
    payload?.appliedOffer?.title ||
    ""
  }

  offerData={
    payload?.offerData ||
    payload?.appliedOffer ||
    null
  }

  baseAfterOffer={fare?.baseAfterOffer}
  nonBenefitAmount={fare?.nonBenefitAmount}
  totalBeforeWallet={fare?.totalBeforeWallet}

  totalAmount={fareSummary.totalAmount}

  paymentMethod={paymentMethod}
  paymentStatus={paymentStatus}
  paidAt={bookedAt}

  walletCalc={fareSummary.walletCalc}
  earnedOnThisBooking={finalEarnedCreditAmount}
/>
      </div>
    </main>
  );
}