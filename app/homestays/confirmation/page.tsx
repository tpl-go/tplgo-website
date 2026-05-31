"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import LoginModal from "@/app/components/common/LoginModal";

import HomestayConfirmationSuccessHeader from "@/app/components/confirmation/homestay/HomestayConfirmationSuccessHeader";
import HomestayConfirmationStayCard from "@/app/components/confirmation/homestay/HomestayConfirmationStayCard";
import HomestayConfirmationGuestCard from "@/app/components/confirmation/homestay/HomestayConfirmationGuestCard";
import HomestayConfirmationFareCard from "@/app/components/confirmation/homestay/HomestayConfirmationFareCard";
import HomestayConfirmationActionsCard from "@/app/components/confirmation/homestay/HomestayConfirmationActionsCard";

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
  return `TPL-HMS-${Date.now().toString().slice(-6)}`;
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

function creditEarnedForHomestayBooking(params: {
  mobile: string;
  bookingId: string;
  earnedAmount: number;
}) {
  if (typeof window === "undefined") return;

  const { mobile, bookingId, earnedAmount } = params;

  if (!mobile || !bookingId || earnedAmount <= 0) return;

  const guardKey = `tpl_homestay_earned_credit_done_${bookingId}`;
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
      description: "Earned credit added after successful homestay booking",
      amount: earnedAmount,
      bookingId,
    },
    mobile
  );

  localStorage.setItem(guardKey, "true");
}

export default function HomestayConfirmationPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const [data, setData] = useState<ConfirmationPayload | null>(null);
  const [savedBooking, setSavedBooking] = useState<BookingItem | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [earnedCreditAmount, setEarnedCreditAmount] = useState(0);

  useEffect(() => {
    const raw =
      typeof window !== "undefined"
        ? sessionStorage.getItem("homestayConfirmationData") ||
          sessionStorage.getItem("homestayPaymentSuccessData")
        : null;

    if (!raw) return;

    try {
      const parsed = JSON.parse(raw);

      const homestay = parsed?.homestay || {};
      const searchMeta = parsed?.searchMeta || {};
      const leadGuest = parsed?.leadGuest || {};
      const guestList = Array.isArray(parsed?.guestList)
        ? parsed.guestList
        : [];
      const fare = parsed?.fare || {};

      const homestayName =
        parsed?.homestayName ||
        homestay?.title ||
        homestay?.name ||
        homestay?.homestayName ||
        homestay?.propertyName ||
        "Homestay Booking Confirmed";

      const travelDate =
        parsed?.checkInDate || searchMeta?.checkIn || new Date().toISOString();

      const totalAmount = Number(
        parsed?.paymentData?.totalPaid ||
          fare?.totalPaid ||
          fare?.totalAmount ||
          0
      );

      const mobile =
  cleanMobile(leadGuest?.phone) ||
  cleanMobile(parsed?.guestValidation?.contactDetails?.mobile);

      const email = leadGuest?.email || "";

      const title = homestayName;

      const safePaidAt =
        parsed?.paymentData?.paidAt ||
        parsed?.paidAt ||
        parsed?.bookedOn ||
        travelDate;

      const confirmationSaveKey = `homestay_booking_saved_${safePaidAt}_${mobile}_${title}`;

      const payloadStorageKey = `tpl_booking_payload_homestay_${safePaidAt}_${mobile}_${title}`
        .replace(/\s+/g, "_")
        .replace(/[^\w\-]/g, "");

      const earnedAmount = Number(
        parsed?.earnedCreditAmount ||
          parsed?.fare?.walletBreakdown?.earnedOnThisBooking ||
          parsed?.walletBreakdown?.earnedOnThisBooking ||
          0
      );

      setEarnedCreditAmount(earnedAmount);

      if (!mobile) {
        setData({
          ...parsed,
          earnedCreditAmount: earnedAmount,
        });
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
        source: "homestay",
      });

      const existingBooking = getAllBookings().find(
        (booking) =>
          booking.type === "homestay" &&
          booking.mobile === mobile &&
          booking.travelDate === travelDate &&
          booking.title === title &&
          booking.amount === totalAmount
      );

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
          name:
            `${leadGuest?.firstName || ""} ${
              leadGuest?.lastName || ""
            }`.trim() || "Guest",
          mobile,
          email,
        });

        creditEarnedForHomestayBooking({
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
        const travellersCount =
          Number(parsed?.guests || 0) ||
          guestList.length ||
          Number(searchMeta?.adults || 1) + Number(searchMeta?.children || 0);

        const newBooking = addBooking({
          type: "homestay",
          title,
          travelDate,
          travellers: `${travellersCount} Guest${
            travellersCount > 1 ? "s" : ""
          }`,
          amount: totalAmount,
          status: "upcoming",
          mobile,
          leadTraveller: {
            name:
              `${leadGuest?.firstName || ""} ${
                leadGuest?.lastName || ""
              }`.trim() || "Guest",
            mobile,
            email,
          },
          ticketType: "homestay",
          detailRoute: "/homestays/confirmation",
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
          name:
            `${leadGuest?.firstName || ""} ${
              leadGuest?.lastName || ""
            }`.trim() || "Guest",
          mobile,
          email,
        });

        creditEarnedForHomestayBooking({
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
        name:
          `${leadGuest?.firstName || ""} ${
            leadGuest?.lastName || ""
          }`.trim() || "Guest",
        mobile,
        email,
      });

      if (parsed?.bookingId) {
        creditEarnedForHomestayBooking({
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
      console.error("Homestay confirmation parse error:", e);
    }
  }, []);

  const bookingId = useMemo(() => {
    return savedBooking?.id || data?.bookingId || buildBookingId();
  }, [savedBooking?.id, data?.bookingId]);

  const paymentId = useMemo(() => {
    return data?.paymentId || data?.transactionId || buildPaymentId();
  }, [data?.paymentId, data?.transactionId]);

  const homestay = data?.homestay || {};
  const selectedVariant = data?.selectedVariant || {};
  const searchMeta = data?.searchMeta || {};
  const leadGuest = data?.leadGuest || {};
  const guestList = Array.isArray(data?.guestList) ? data.guestList : [];
  const fare = data?.fare || {};
  const cabData = data?.cabData || {};
  const addonsData = data?.addonsData || {};
  const tripSecureData = data?.tripSecureData || {};
  const paymentData = data?.paymentData || {};

  const homestayName = useMemo(() => {
    return (
      data?.homestayName ||
      homestay?.title ||
      homestay?.name ||
      homestay?.homestayName ||
      homestay?.propertyName ||
      "Homestay Booking Confirmed"
    );
  }, [data?.homestayName, homestay]);

  const city = useMemo(() => {
    return (
      data?.city ||
      data?.location ||
      homestay?.city ||
      searchMeta?.city ||
      "City not available"
    );
  }, [data?.city, data?.location, homestay, searchMeta?.city]);

  const address = useMemo(() => {
    return (
      data?.address ||
      [homestay?.area, ...((homestay?.topLocation as string[]) || [])]
        .filter(Boolean)
        .join(", ") ||
      homestay?.locationHighlights?.join(", ") ||
      city ||
      "Address not available"
    );
  }, [data?.address, homestay, city]);

  const roomName = useMemo(() => {
    return (
      data?.roomType ||
      selectedVariant?.name ||
      selectedVariant?.roomType ||
      selectedVariant?.title ||
      "Selected Stay"
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

  const paymentMethod =
    paymentData?.method || data?.paymentMethod || "Online Payment";

  const bookedAt =
    paymentData?.paidAt ||
    data?.bookedOn ||
    data?.paidAt ||
    new Date().toISOString();

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

  const promoUsed =
    Number(walletBreakdown?.promoUsed || 0) ||
    Number(paymentData?.promoUsed || 0);

  const earnedUsed =
    Number(walletBreakdown?.earnedUsed || 0) ||
    Number(paymentData?.earnedUsed || 0);

  const refundUsed =
    Number(walletBreakdown?.refundUsed || 0) ||
    Number(paymentData?.refundUsed || 0);

  const tplCredit = Number(
    data?.tplCredit ||
      promoUsed + earnedUsed ||
      0
  );

  return {
    stayPrice:
      rooms > 0 && nights > 0
        ? Math.round(subtotal / (rooms * nights))
        : Number(selectedVariant?.price || homestay?.pricePerNight || 0),

    rooms,
    nights,

    subtotal,
    taxes,

    tripSecureTotal: Number(tripSecureData?.amount || 0),
    cabTotal: Number(cabData?.amount || 0),
    addOnsTotal: Number(addonsData?.amount || 0),

    tplCredit,
    appliedOffer,

    totalAmount: Number(fare?.totalPaid || fare?.totalAmount || 0),

    walletCalc: {
      promoUsed,
      earnedUsed,
      refundUsed,
    },

    earnedOnThisBooking: Number(
      data?.earnedCreditAmount ||
        walletBreakdown?.earnedOnThisBooking ||
        0
    ),
  };
}, [
  fare,
  data?.appliedOffer,
  data?.tplCredit,
  data?.earnedCreditAmount,
  rooms,
  nights,
  tripSecureData?.amount,
  cabData?.amount,
  addonsData?.amount,
  selectedVariant?.price,
  homestay?.pricePerNight,
  paymentData,
]);

  if (!data) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#eef3f8]">
        <div className="bg-white p-6 rounded-xl border font-semibold">
          No homestay confirmation data found.
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
              Homestay Confirmed
            </div>
            <div className="text-[11px] font-semibold text-[#64748b]">
              Booking voucher generated
            </div>
          </div>
        </div>
      </div>

      <div className="border-b border-green-200 bg-green-50 px-3 py-3 text-center md:py-4">
        <div className="text-[16px] font-black text-green-700 md:text-lg">
          🎉 Homestay Booking Confirmed
        </div>
        <div className="text-[12px] font-semibold text-green-600 md:text-sm">
          Your homestay voucher is successfully generated
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
          <HomestayConfirmationSuccessHeader
            bookingId={bookingId}
            homestayName={homestayName}
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
            earnedOnThisBooking={finalEarnedCreditAmount}
          />

          {finalEarnedCreditAmount > 0 ? (
            <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-[13px] font-bold leading-5 text-green-700 md:px-5 md:py-4 md:text-[14px]">
              🎉 You earned ₹
              {Number(finalEarnedCreditAmount).toLocaleString("en-IN")} TPL
              Earned Credit. This has been added to your wallet.
            </div>
          ) : null}

          <HomestayConfirmationStayCard
            homestayName={homestayName}
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

          <HomestayConfirmationGuestCard
            travellers={guestList}
            contactDetails={contactDetails}
          />

          <HomestayConfirmationFareCard
            bookingId={bookingId}
            paymentId={paymentId}
            stayPrice={fareSummary.stayPrice}
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
            walletCalc={fareSummary.walletCalc}
            earnedOnThisBooking={finalEarnedCreditAmount}
          />
        </div>

        <div className="min-w-0">
          <HomestayConfirmationActionsCard
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
