"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import HotelConfirmationStayCard from "@/app/components/confirmation/hotel/HotelConfirmationStayCard";
import HotelConfirmationGuestCard from "@/app/components/confirmation/hotel/HotelConfirmationGuestCard";
import HotelConfirmationFareCard from "@/app/components/confirmation/hotel/HotelConfirmationFareCard";

import {
  BOOKING_UPDATED_EVENT,
  type BookingItem,
} from "@/app/lib/booking/bookingStorage";
import { getBackendFirstBookingPayload } from "@/app/lib/api/bookingApi";

type ConfirmationPayload = any;

function resolveHotelName(payload: any) {
  const hotel = payload?.hotel || {};

  return (
    payload?.hotelName ||
    hotel?.title ||
    hotel?.name ||
    hotel?.hotelName ||
    hotel?.propertyName ||
    "Hotel Booking"
  );
}

function resolveHotelCity(payload: any) {
  const hotel = payload?.hotel || {};
  const searchMeta = payload?.searchMeta || {};

  return (
    payload?.city ||
    payload?.location ||
    hotel?.city ||
    searchMeta?.city ||
    "City not available"
  );
}

export default function HotelBookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = String(params?.bookingId || "");

  const [booking, setBooking] = useState<BookingItem | null>(null);
  const [payload, setPayload] = useState<ConfirmationPayload | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const loadBookingDetail = async () => {
      const result = await getBackendFirstBookingPayload<ConfirmationPayload>(
        bookingId,
        "hotel"
      );
      if (cancelled) return;

      setBooking(result.booking);
      setPayload(result.payload);
      setRefreshKey((prev) => prev + 1);
    };

    void loadBookingDetail();

    window.addEventListener(BOOKING_UPDATED_EVENT, loadBookingDetail);
    window.addEventListener("storage", loadBookingDetail);
    window.addEventListener("focus", loadBookingDetail);

    return () => {
      cancelled = true;
      window.removeEventListener(BOOKING_UPDATED_EVENT, loadBookingDetail);
      window.removeEventListener("storage", loadBookingDetail);
      window.removeEventListener("focus", loadBookingDetail);
    };
  }, [bookingId]);

  const hotel = payload?.hotel || {};
  const selectedVariant = payload?.selectedVariant || {};
  const searchMeta = payload?.searchMeta || {};
  const leadGuest = payload?.leadGuest || {};
  const guestList = Array.isArray(payload?.guestList) ? payload.guestList : [];
  const fare = payload?.fare || {};
  const cabData = payload?.cabData || {};
  const addonsData = payload?.addonsData || {};
  const tripSecureData = payload?.tripSecureData || {};
  const managePayment = payload?.managePayment || {};

  const hotelName = useMemo(() => resolveHotelName(payload), [payload]);
  const city = useMemo(() => resolveHotelCity(payload), [payload]);

  const address = useMemo(() => {
    return (
      payload?.address ||
      [hotel?.area, ...((hotel?.topLocation as string[]) || [])]
        .filter(Boolean)
        .join(", ") ||
      hotel?.locationHighlights?.join(", ") ||
      city ||
      "Address not available"
    );
  }, [payload?.address, hotel, city]);

  const roomName = useMemo(() => {
    return (
      payload?.roomType ||
      selectedVariant?.name ||
      selectedVariant?.roomType ||
      selectedVariant?.title ||
      "Selected Room"
    );
  }, [payload?.roomType, selectedVariant]);

  const checkIn = payload?.checkInDate || searchMeta?.checkIn || booking?.travelDate || "";
  const checkOut = payload?.checkOutDate || searchMeta?.checkOut || "";
  const nights = Number(payload?.nights || 1);
  const rooms = Number(payload?.rooms || searchMeta?.rooms || 1);

  const adults = Number(
    searchMeta?.adults || payload?.adults || guestList.length || 1
  );

  const children = Number(searchMeta?.children || payload?.children || 0);

  const contactDetails = useMemo(() => {
    return {
      countryCode: "+91",
      mobile: leadGuest?.phone
        ? String(leadGuest.phone).replace(/^\+91\s?/, "").trim()
        : payload?.guestValidation?.contactDetails?.mobile || "",
      email: leadGuest?.email || payload?.guestValidation?.contactDetails?.email || "",
    };
  }, [leadGuest, payload?.guestValidation]);

  const paymentMethod =
    managePayment?.method || payload?.paymentMethod || "Online Payment";

  const bookedAt =
    managePayment?.paidAt ||
    payload?.bookedOn ||
    payload?.paidAt ||
    booking?.bookingDate ||
    new Date().toISOString();

  const paymentStatus = useMemo(() => {
    const status = payload?.paymentStatus || "paid";

    if (status === "paid" || status === "Paid") return "success";
    if (status === "pending" || status === "Pending") return "pending";
    if (status === "failed" || status === "Failed") return "failed";

    return "success";
  }, [payload?.paymentStatus]);

  const fareSummary = useMemo(() => {
    const subtotal = Number(fare?.baseFare || 0);
    const taxes = Number(fare?.taxesAndFees || 0);
    const appliedOffer = Number(payload?.appliedOffer || 0);
    const tplCredit = Number(payload?.tplCredit || fare?.tplCredit || 0);

    const inferredExtraDiscount =
      Number(fare?.discount || 0) - appliedOffer - tplCredit;

    return {
      roomPrice:
        rooms > 0 && nights > 0
          ? Math.round(subtotal / (rooms * nights))
          : Number(selectedVariant?.price || hotel?.pricePerNight || 0),
      rooms,
      nights,
      subtotal,
      taxes,
      tripSecureTotal: Number(tripSecureData?.amount || 0),
      cabTotal: Number(cabData?.amount || 0),
      addOnsTotal: Number(addonsData?.amount || 0),
      tplCredit,
      appliedOffer: appliedOffer + Math.max(inferredExtraDiscount, 0),
      totalAmount:
        Number(managePayment?.updatedTotalAmount || 0) ||
        Number(fare?.totalPaid || fare?.totalAmount || booking?.amount || 0),
    };
  }, [
    fare,
    payload?.appliedOffer,
    payload?.tplCredit,
    rooms,
    nights,
    tripSecureData?.amount,
    cabData?.amount,
    addonsData?.amount,
    selectedVariant?.price,
    hotel?.pricePerNight,
    managePayment?.updatedTotalAmount,
    booking?.amount,
  ]);

  if (!booking || !payload) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#eef3f8]">
        <div className="bg-white p-6 rounded-xl border font-semibold">
          Hotel booking detail not found.
        </div>
      </main>
    );
  }

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
            Hotel Booking Detail
          </div>
          <div className="mt-1 break-words text-[12px] text-slate-600 md:text-sm">
            Booking ID: {booking.id}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 py-4 md:px-4 md:py-6">
        <div className="w-full flex flex-col gap-4">
          <div className="overflow-hidden rounded-[18px] border border-[#d9e2ec] bg-white shadow-[0_8px_24px_rgba(15,23,42,0.05)] md:rounded-[24px]">
            <div className="min-h-[60px] border-b border-[#e5e7eb] bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_100%)] flex flex-col items-start justify-center gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between md:px-5 md:py-0">
              <h2 className="m-0 text-[18px] font-black text-[#111827]">
                Booking Summary
              </h2>

              <button
                type="button"
                onClick={() => router.push("/account/bookings")}
                className="inline-flex items-center gap-2 rounded-full border border-[#d9e2ec] bg-white px-4 py-2 text-[12px] font-extrabold text-[#111827] shadow-[0_4px_14px_rgba(15,23,42,0.05)] transition hover:bg-[#f8fbff] hover:border-[#bfd3ea]"
              >
                <span style={{ fontSize: "13px", lineHeight: 1 }}>←</span>
                <span>Back</span>
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3 p-4 md:grid-cols-2 md:gap-4 md:p-5 xl:grid-cols-4">
              <InfoCard label="Booking Status" value={capitalize(booking.status)} />
              <InfoCard label="Payment Status" value="Paid" />
              <InfoCard label="Booked On" value={formatDateTime(bookedAt)} />
              <InfoCard label="Check-in Date" value={formatDateOnly(checkIn)} />
              <InfoCard label="Hotel" value={hotelName} />
              <InfoCard label="City" value={city} />
              <InfoCard label="Room Type" value={roomName} />
              <InfoCard label="Guests" value={booking.travellers || `${guestList.length || 1} Guest`} />
            </div>

            <div className="px-4 pb-4 md:px-5 md:pb-5">
              <div className="rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] px-4 py-4 text-[15px] font-bold text-[#0f172a]">
                {hotelName} • {city}
              </div>
            </div>
          </div>

          <HotelConfirmationStayCard
            hotelName={hotelName}
            city={city}
            address={address}
            checkIn={checkIn}
            checkOut={checkOut}
            rooms={rooms}
            adults={adults}
            children={children}
            roomName={roomName}
            specialRequest={payload?.specialRequest || ""}
          />

          <HotelConfirmationGuestCard
            key={`hotel-guest-${refreshKey}`}
            travellers={guestList}
            contactDetails={contactDetails}
          />

          <HotelConfirmationFareCard
            bookingId={booking.id}
            paymentId={
              payload?.paymentId ||
              payload?.transactionId ||
              managePayment?.paymentId ||
              "-"
            }
            roomPrice={fareSummary.roomPrice}
            rooms={fareSummary.rooms}
            nights={fareSummary.nights}
            subtotal={fareSummary.subtotal}
            taxes={fareSummary.taxes}
            tripSecureTotal={fareSummary.tripSecureTotal}
            cabTotal={fareSummary.cabTotal}
            addOnsTotal={fareSummary.addOnsTotal}
            tplCredit={fareSummary.tplCredit}
            appliedOffer={fareSummary.appliedOffer}
            totalAmount={fareSummary.totalAmount}
            paymentMethod={paymentMethod}
            paymentStatus={paymentStatus}
            paidAt={bookedAt}
          />
        </div>
      </div>
    </main>
  );
}

function InfoCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-[#e2e8f0] bg-white p-4">
      <div className="text-[11px] font-black uppercase tracking-[0.7px] text-[#64748b] mb-2">
        {label}
      </div>
      <div className="text-[14px] font-extrabold text-[#111827] leading-[20px] break-words">
        {value || "-"}
      </div>
    </div>
  );
}

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value || "-";

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatDateOnly(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value || "-";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function capitalize(value: string) {
  if (!value) return "-";
  return value.charAt(0).toUpperCase() + value.slice(1);
}
