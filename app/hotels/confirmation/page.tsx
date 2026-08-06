"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import LoginModal from "@/app/components/common/LoginModal";

import HotelConfirmationSuccessHeader from "@/app/components/confirmation/hotel/HotelConfirmationSuccessHeader";
import HotelConfirmationStayCard from "@/app/components/confirmation/hotel/HotelConfirmationStayCard";
import HotelConfirmationGuestCard from "@/app/components/confirmation/hotel/HotelConfirmationGuestCard";
import HotelConfirmationFareCard from "@/app/components/confirmation/hotel/HotelConfirmationFareCard";
import HotelConfirmationActionsCard from "@/app/components/confirmation/hotel/HotelConfirmationActionsCard";

import {
  addBooking,
  getAllBookings,
  type BookingItem,
} from "@/app/lib/booking/bookingStorage";
import { createGuestUserFromBooking } from "@/app/lib/booking/guestAuth";
import { seedAccountAndTravellerSafely } from "@/app/lib/booking/safeProfileSeed";
import { useAuth } from "@/app/hooks/useAuth";
import {
  getWallet,
  saveWallet,
  addWalletLedgerItem,
} from "@/app/lib/wallet/walletStorage";

type ConfirmationPayload = any;

function buildBookingId() {
  return `TPL-HTL-${Date.now().toString().slice(-6)}`;
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

function resolveHotelName(payload: any) {
  const hotel = payload?.hotel || {};

  return (
    payload?.hotelName ||
    hotel?.title ||
    hotel?.name ||
    hotel?.hotelName ||
    hotel?.propertyName ||
    "Hotel Test Confirmation"
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

function resolveLeadGuestName(leadGuest: any) {
  return (
    `${leadGuest?.firstName || ""} ${leadGuest?.lastName || ""}`.trim() ||
    leadGuest?.name ||
    "Guest"
  );
}

function creditEarnedForHotelBooking(params: {
  mobile: string;
  bookingId: string;
  earnedAmount: number;
}) {
  if (typeof window === "undefined") return;

  const { mobile, bookingId, earnedAmount } = params;

  if (!mobile || !bookingId || earnedAmount <= 0) return;

  const guardKey = `tpl_hotel_earned_credit_done_${bookingId}`;
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
      description: "Earned credit added after successful hotel booking",
      amount: earnedAmount,
      bookingId,
    },
    mobile
  );

  localStorage.setItem(guardKey, "true");
}

export default function HotelConfirmationPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const [data, setData] = useState<ConfirmationPayload | null>(null);
  const [savedBooking, setSavedBooking] = useState<BookingItem | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [earnedCreditAmount, setEarnedCreditAmount] = useState(0);

  useEffect(() => {
    const raw =
      typeof window !== "undefined"
        ? sessionStorage.getItem("hotelConfirmationData") ||
          sessionStorage.getItem("hotelPaymentSuccessData")
        : null;

    if (!raw) return;

    try {
      const parsed = JSON.parse(raw);

      const leadGuest = parsed?.leadGuest || {};
      const searchMeta = parsed?.searchMeta || {};
      const guestList = Array.isArray(parsed?.guestList)
        ? parsed.guestList
        : [];

      const hotelName = resolveHotelName(parsed);
      const city = resolveHotelCity(parsed);
      const checkIn = parsed?.checkInDate || searchMeta?.checkIn || "";
      const totalAmount = Number(
        parsed?.fare?.totalPaid ||
          parsed?.fare?.totalAmount ||
          parsed?.finalTotal ||
          0
      );

      const mobile =
        cleanMobile(leadGuest?.phone) ||
        cleanMobile(parsed?.guestValidation?.contactDetails?.mobile);

      const email =
        leadGuest?.email ||
        parsed?.guestValidation?.contactDetails?.email ||
        "";

      const title = `${hotelName} - ${city}`;
      const travelDate = checkIn || new Date().toISOString();
      const safePaidAt =
        parsed?.paidAt || parsed?.bookedOn || new Date().toISOString();

      const isBackendHotelTestFlow = parsed?.backendHotel || parsed?.simulationMode === true;
      const earnedAmount = isBackendHotelTestFlow ? 0 : Number(
        parsed?.earnedCreditAmount ||
          parsed?.fare?.walletBreakdown?.earnedOnThisBooking ||
          parsed?.paymentData?.earnedCreditAmount ||
          parsed?.walletBreakdown?.earnedOnThisBooking ||
          0
      );

      setEarnedCreditAmount(earnedAmount);

      if (!mobile) {
        setData(parsed);
        return;
      }

      seedAccountAndTravellerSafely({
        mobile,
        email,
        traveller: {
          title: leadGuest?.title || "",
          firstName:
            leadGuest?.firstName || leadGuest?.name?.split?.(" ")?.[0] || "",
          lastName:
            leadGuest?.lastName ||
            leadGuest?.name?.split?.(" ")?.slice(1).join(" ") ||
            "",
          gender: leadGuest?.gender || "",
          email,
          mobile,
          nationality: leadGuest?.nationality || "Indian",
        },
        source: "hotel",
      });

      const leadName = resolveLeadGuestName(leadGuest);
const leadEmail = String(email || "").toLowerCase().trim();

const leadIdentity = `${leadName}_${leadEmail}`
  .replace(/\s+/g, "_")
  .replace(/[^\w\-]/g, "");

const confirmationSaveKey = `hotel_booking_saved_${safePaidAt}_${mobile}_${leadIdentity}_${title}`;

const payloadStorageKey = `tpl_booking_payload_hotel_${safePaidAt}_${mobile}_${leadIdentity}_${title}`
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
    booking.type === "hotel" &&
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
          earnedCreditAmount: earnedAmount,
        };

        localStorage.setItem(
          existingBooking.payloadStorageKey || payloadStorageKey,
          JSON.stringify(payloadWithBookingId)
        );

        createGuestUserFromBooking({
          name: resolveLeadGuestName(leadGuest),
          mobile,
          email,
        });

        if (!isBackendHotelTestFlow) creditEarnedForHotelBooking({
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
          type: "hotel",
          title,
          travelDate,
          travellers: `${guestList.length || 1} Guest${
            (guestList.length || 1) > 1 ? "s" : ""
          }`,
          amount: totalAmount,
          status: "upcoming",
          mobile,
          leadTraveller: {
            name: resolveLeadGuestName(leadGuest),
            mobile,
            email,
          },
          ticketType: "hotel",
          detailRoute: "/hotels/confirmation",
          payloadStorageKey,
        });

        const payloadWithBookingId = {
          ...parsed,
          bookingId: newBooking.id,
          earnedCreditAmount: earnedAmount,
        };

        localStorage.setItem(
          payloadStorageKey,
          JSON.stringify(payloadWithBookingId)
        );

        createGuestUserFromBooking({
          name: resolveLeadGuestName(leadGuest),
          mobile,
          email,
        });

        if (!isBackendHotelTestFlow) creditEarnedForHotelBooking({
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
        name: resolveLeadGuestName(leadGuest),
        mobile,
        email,
      });

      if (parsed?.bookingId) {
        if (!isBackendHotelTestFlow) creditEarnedForHotelBooking({
          mobile,
          bookingId: parsed.bookingId,
          earnedAmount,
        });
      }

      setData({
        ...parsed,
        earnedCreditAmount: earnedAmount,
      });
    } catch (e) {
      console.error("Hotel confirmation parse error:", e);
    }
  }, []);

  const bookingId = useMemo(() => {
    return savedBooking?.id || data?.bookingId || buildBookingId();
  }, [savedBooking?.id, data?.bookingId]);

  const paymentId = useMemo(() => {
    return data?.paymentId || data?.transactionId || buildPaymentId();
  }, [data?.paymentId, data?.transactionId]);

  const hotel = data?.hotel || {};
  const selectedVariant = data?.selectedVariant || {};
  const searchMeta = data?.searchMeta || {};
  const leadGuest = data?.leadGuest || {};
  const guestList = Array.isArray(data?.guestList) ? data.guestList : [];
  const fare = data?.fare || {};
  const cabData = data?.cabData || {};
  const addonsData = data?.addonsData || {};
  const tripSecureData = data?.tripSecureData || {};

  const hotelName = useMemo(() => {
    return (
      data?.hotelName ||
      hotel?.title ||
      hotel?.name ||
      hotel?.hotelName ||
      hotel?.propertyName ||
      "Hotel Booking Confirmed"
    );
  }, [data?.hotelName, hotel]);

  const city = useMemo(() => {
    return (
      data?.city ||
      data?.location ||
      hotel?.city ||
      searchMeta?.city ||
      "City not available"
    );
  }, [data?.city, data?.location, hotel, searchMeta?.city]);

  const address = useMemo(() => {
    return (
      data?.address ||
      [hotel?.area, ...((hotel?.topLocation as string[]) || [])]
        .filter(Boolean)
        .join(", ") ||
      hotel?.locationHighlights?.join(", ") ||
      city ||
      "Address not available"
    );
  }, [data?.address, hotel, city]);

  const roomName = useMemo(() => {
    return (
      data?.roomType ||
      selectedVariant?.name ||
      selectedVariant?.roomType ||
      selectedVariant?.title ||
      "Selected Room"
    );
  }, [data?.roomType, selectedVariant]);

  const checkIn = data?.checkInDate || searchMeta?.checkIn || "";
  const checkOut = data?.checkOutDate || searchMeta?.checkOut || "";
  const nights = Number(data?.nights || 1);
  const rooms = Number(data?.rooms || searchMeta?.rooms || 1);

  const adults = Number(
    searchMeta?.adults || data?.adults || guestList.length || 1
  );

  const children = Number(searchMeta?.children || data?.children || 0);

  const contactDetails = useMemo(() => {
    return {
      countryCode: "+91",
      mobile: leadGuest?.phone
        ? String(leadGuest.phone).replace(/^\+91\s?/, "").trim()
        : "",
      email: leadGuest?.email || "",
    };
  }, [leadGuest]);

  const paymentMethod = data?.paymentMethod || "Online Payment";
  const bookedAt = data?.bookedOn || data?.paidAt || new Date().toISOString();

  const paymentStatus = useMemo(() => {
    return data?.paymentStatus === "paid" || data?.paymentStatus === "Paid"
      ? "success"
      : data?.paymentStatus === "pending" || data?.paymentStatus === "Pending"
      ? "pending"
      : data?.paymentStatus === "failed" || data?.paymentStatus === "Failed"
      ? "failed"
      : "success";
  }, [data?.paymentStatus]);

  const fareSummary = useMemo(() => {
  const subtotal = Number(fare?.baseFare || 0);
  const taxes = Number(fare?.taxesAndFees || 0);

  const appliedOffer = Number(
    data?.appliedOffer ||
      fare?.appliedOffer ||
      0
  );

  const walletBreakdown = fare?.walletBreakdown || {};

  const promoUsed = Number(walletBreakdown?.promoUsed || 0);
  const earnedUsed = Number(walletBreakdown?.earnedUsed || 0);
  const refundUsed = Number(walletBreakdown?.refundUsed || 0);

  const tplCredit = Number(
    data?.tplCredit ||
      promoUsed + earnedUsed ||
      0
  );

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
    appliedOffer,

    walletBreakdown: {
      promoUsed,
      earnedUsed,
      refundUsed,
    },

    totalAmount: Number(fare?.totalPaid || fare?.totalAmount || 0),
  };
}, [
  fare,
  data?.appliedOffer,
  data?.tplCredit,
  rooms,
  nights,
  tripSecureData?.amount,
  cabData?.amount,
  addonsData?.amount,
  selectedVariant?.price,
  hotel?.pricePerNight,
]);

  if (!data) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#eef3f8]">
        <div className="bg-white p-6 rounded-xl border font-semibold">
          No hotel confirmation data found.
        </div>
      </main>
    );
  }

  const finalEarnedCreditAmount =
    earnedCreditAmount || data?.earnedCreditAmount || 0;

  const handlePrint = () => window.print();

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#eef3f8] pb-6 text-black">
      <div className="sticky top-0 z-40 border-b border-[#d7dce3] bg-white md:hidden">
        <div className="flex h-12 items-center gap-3 px-3">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#e5e7eb] bg-white text-[#111827]"
            aria-label="Go home"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div className="min-w-0 flex-1">
            <div className="truncate text-[14px] font-black text-[#111827]">
              TPL Test Confirmation
            </div>
            <div className="text-[11px] font-semibold text-[#64748b]">
              No supplier voucher issued. Voucher: Not Issued
            </div>
          </div>
        </div>
      </div>

      <div className="border-b border-green-200 bg-green-50 px-3 py-3 text-center md:py-4">
        <div className="text-[16px] font-black text-green-700 md:text-lg">
          TPL Test Confirmation
        </div>
        <div className="text-[12px] font-semibold leading-5 text-green-600 md:text-sm">
          Supplier reservation: Not created in test mode. Supplier confirmation: Not issued in test mode.
          Voucher: Not Issued.
        </div>

        {finalEarnedCreditAmount > 0 ? (
          <div className="mt-2 text-[12px] font-bold text-green-700 md:text-sm">
            🎁 You earned ₹
            {Number(finalEarnedCreditAmount).toLocaleString("en-IN")} TPL
            Earned Credit on this booking.
          </div>
        ) : null}
      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 px-3 py-3 md:px-4 md:py-6 lg:grid-cols-[minmax(0,1fr)_minmax(300px,0.39fr)]">
        <div className="flex min-w-0 flex-col gap-4">
          <HotelConfirmationSuccessHeader
            bookingId={bookingId}
            hotelName={hotelName}
            city={city}
            address={address}
            bookingStatus="confirmed"
            paymentStatus="paid"
            bookedAt={bookedAt}
            roomName={roomName}
            roomCount={rooms}
            checkIn={checkIn}
            checkOut={checkOut}
            nights={nights}
          />

          {finalEarnedCreditAmount > 0 ? (
            <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-[13px] font-bold leading-5 text-green-700 md:px-5 md:py-4 md:text-[14px]">
              🎉 You earned ₹
              {Number(finalEarnedCreditAmount).toLocaleString("en-IN")} TPL
              Earned Credit. This has been added to your wallet.
            </div>
          ) : null}

          <HotelConfirmationStayCard
            hotelName={hotelName}
            city={city}
            address={address}
            checkIn={checkIn}
            checkOut={checkOut}
            rooms={rooms}
            adults={adults}
            childCount={children}
            roomName={roomName}
            specialRequest={data?.specialRequest || ""}
          />

          <HotelConfirmationGuestCard
            travellers={guestList}
            contactDetails={contactDetails}
          />

          <HotelConfirmationFareCard
  bookingId={bookingId}
  paymentId={paymentId}
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
  walletCalc={fareSummary.walletBreakdown}
  earnedOnThisBooking={finalEarnedCreditAmount}
/>
        </div>

        <div className="min-w-0">
          <HotelConfirmationActionsCard
            bookingId={bookingId}
            email={contactDetails.email || undefined}
            mobile={
              contactDetails.mobile
                ? `${contactDetails.countryCode || "+91"} ${contactDetails.mobile}`
                : undefined
            }
            supportNumber="+91 99999 99999"
            onDownloadVoucher={handlePrint}
            onDownloadInvoice={handlePrint}
            onPrintVoucher={handlePrint}
            onShareWhatsApp={() => alert("WhatsApp API integration pending")}
            onSendEmail={() => alert("Email API integration pending")}
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
