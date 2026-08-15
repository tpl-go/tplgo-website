"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import LoginModal from "@/app/components/common/LoginModal";
import MobileInnerBack from "@/app/components/common/mobile/MobileInnerBack";

import BusConfirmationSuccessHeader from "@/app/components/confirmation/bus/BusConfirmationSuccessHeader";
import BusConfirmationJourneyCard from "@/app/components/confirmation/bus/BusConfirmationJourneyCard";
import BusConfirmationTravellerCard from "@/app/components/confirmation/bus/BusConfirmationTravellerCard";
import BusConfirmationFareCard from "@/app/components/confirmation/bus/BusConfirmationFareCard";
import BusConfirmationActionsCard from "@/app/components/confirmation/bus/BusConfirmationActionsCard";

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
import { confirmBusBackendCheckout } from "@/app/lib/api/busCheckoutIntegration";

type ConfirmationPayload = any;

function buildBookingId() {
  return `TPL-BUS-${Date.now().toString().slice(-6)}`;
}

function buildPaymentId() {
  return `TPL-PAY-${Date.now().toString().slice(-6)}`;
}



function creditEarnedForBusBooking(params: {
  mobile: string;
  bookingId: string;
  earnedAmount: number;
}) {
  if (typeof window === "undefined") return;

  const { mobile, bookingId, earnedAmount } = params;

  if (!mobile || !bookingId || earnedAmount <= 0) return;

  const guardKey = `tpl_bus_earned_credit_done_${bookingId}`;
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
      description: "Earned credit added after successful bus booking",
      amount: earnedAmount,
      bookingId,
    },
    mobile
  );

  localStorage.setItem(guardKey, "true");
}

function persistBusConfirmationSession(payload: ConfirmationPayload) {
  if (typeof window === "undefined") return;

  const value = JSON.stringify(payload);
  sessionStorage.setItem("busConfirmationData", value);
  sessionStorage.setItem("busPaymentSuccessData", value);
  sessionStorage.setItem("tplBusPaymentConfirmedData", value);
}

export default function BusConfirmationPage() {
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
        ? sessionStorage.getItem("busConfirmationData") ||
          sessionStorage.getItem("busPaymentSuccessData") ||
          sessionStorage.getItem("tplBusPaymentConfirmedData")
        : null;

    if (!raw) return;

    try {
      let parsed = JSON.parse(raw);

      if (parsed?.backendCheckoutId) {
        const backendConfirm = await confirmBusBackendCheckout({
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
          persistBusConfirmationSession(parsed);
        }
      }

      if (cancelled) return;

      const bookingPayload = parsed?.bookingPayload || {};
      const search = bookingPayload?.search || {};
      const bus = bookingPayload?.bus || {};
      const fare = parsed?.fare || {};
      const travellers = Array.isArray(parsed?.travellers)
        ? parsed.travellers
        : [];
      const contactDetails = parsed?.contactDetails || {};

      const busName =
        parsed?.busName ||
        bus?.name ||
        bus?.busName ||
        bus?.travelsName ||
        "Bus Booking Confirmed";

      const route =
        parsed?.route ||
        `${search?.fromCity || parsed?.fromCity || "Origin"} → ${
          search?.toCity || parsed?.toCity || "Destination"
        }`;

      const travelDate =
        parsed?.travelDate || search?.date || new Date().toISOString();

      const title = `${route} • ${busName}`;

      const totalAmount = Number(
        parsed?.paymentData?.totalPaid ||
          fare?.totalPaid ||
          fare?.totalAmount ||
          0
      );

      const mobile = String(contactDetails?.mobile || "").trim();
      const email = contactDetails?.email || "";
      const leadTraveller = travellers?.[0] || {};

      const safePaidAt =
        parsed?.paymentData?.paidAt ||
        parsed?.paidAt ||
        parsed?.bookedOn ||
        travelDate;

      const leadName =
  leadTraveller?.fullName ||
  leadTraveller?.name ||
  `${leadTraveller?.firstName || ""} ${leadTraveller?.lastName || ""}`.trim() ||
  "Guest";

const leadEmail = String(email || "").toLowerCase().trim();

const leadIdentity = `${leadName}_${leadEmail}`
  .replace(/\s+/g, "_")
  .replace(/[^\w\-]/g, "");

const confirmationSaveKey = `bus_booking_saved_${safePaidAt}_${mobile}_${leadIdentity}_${title}`;

const payloadStorageKey = `tpl_booking_payload_bus_${safePaidAt}_${mobile}_${leadIdentity}_${title}`
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
    name: leadTraveller?.fullName || leadTraveller?.name || "",
    firstName: leadTraveller?.firstName || "",
    lastName: leadTraveller?.lastName || "",
    gender: leadTraveller?.gender || "",
    dob: leadTraveller?.dob || leadTraveller?.dateOfBirth || "",
    email,
    mobile,
    nationality: leadTraveller?.nationality || "Indian",
  },
  source: "bus",
});

      const existingBooking = getAllBookings().find((booking) => {
  const existingName = String(booking.leadTraveller?.name || "")
    .toLowerCase()
    .trim();

  const existingEmail = String(booking.leadTraveller?.email || "")
    .toLowerCase()
    .trim();

  return (
    booking.type === "bus" &&
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
          name: leadTraveller?.fullName || "Guest",
          mobile,
          email,
        });

        creditEarnedForBusBooking({
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
          travellers.length || Number(bookingPayload?.travellerCount || 1);

        const newBooking = addBooking({
          type: "bus",
          title,
          travelDate,
          travellers: `${travellersCount} Traveller${
            travellersCount > 1 ? "s" : ""
          }`,
          amount: totalAmount,
          status: "upcoming",
          mobile,
          leadTraveller: {
            name: leadTraveller?.fullName || "Guest",
            mobile,
            email,
          },
          ticketType: "bus",
          detailRoute: "/bus/confirmation",
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
          name: leadTraveller?.fullName || "Guest",
          mobile,
          email,
        });

        creditEarnedForBusBooking({
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
        name: leadTraveller?.fullName || "Guest",
        mobile,
        email,
      });

      if (parsed?.bookingId) {
        creditEarnedForBusBooking({
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
      console.error("Bus confirmation parse error:", e);
    }

    };

    void loadConfirmation();

    return () => {
      cancelled = true;
    };
  }, []);

  const bookingId = useMemo(() => {
    return savedBooking?.id || data?.bookingId || buildBookingId();
  }, [savedBooking?.id, data?.bookingId]);

  const paymentId = useMemo(() => {
    return data?.paymentId || data?.transactionId || buildPaymentId();
  }, [data?.paymentId, data?.transactionId]);

  const bookingPayload = data?.bookingPayload || {};
  const search = bookingPayload?.search || {};
  const bus = bookingPayload?.bus || {};

  const busName =
    data?.busName ||
    bus?.name ||
    bus?.busName ||
    bus?.travelsName ||
    "Bus Booking Confirmed";

  const operatorName =
    data?.operatorName || bus?.operatorName || bus?.travelsName || "";

  const route =
    data?.route ||
    `${search?.fromCity || data?.fromCity || "Origin"} → ${
      search?.toCity || data?.toCity || "Destination"
    }`;

  const boardingPoint =
    data?.boardingPoint?.name ||
    bookingPayload?.selectedBoardingPoint?.name ||
    search?.fromPoint ||
    "";

  const droppingPoint =
    data?.droppingPoint?.name ||
    bookingPayload?.selectedDroppingPoint?.name ||
    search?.toPoint ||
    "";

  const travelDate = data?.travelDate || search?.date || "";
  const departureTime =
    data?.departureTime ||
    bookingPayload?.selectedBoardingPoint?.time ||
    bus?.departureTime ||
    "";
  const arrivalTime =
    data?.arrivalTime ||
    bookingPayload?.selectedDroppingPoint?.time ||
    bus?.arrivalTime ||
    "";
  const duration = data?.duration || bus?.duration || "";
  const busType = data?.busType || bus?.busType || bus?.type || "";

  const travellers = Array.isArray(data?.travellers) ? data.travellers : [];
  const contactDetails = data?.contactDetails || {};
  const ticketNumber = data?.ticketNumber || data?.operatorTicketNo || "";

  const paymentData = data?.paymentData || {};
  const paymentMethod =
    data?.selectedPaymentMethod ||
    paymentData?.method ||
    data?.paymentMethod ||
    "Online Payment";

  const bookedAt =
    paymentData?.paidAt || data?.bookedOn || data?.paidAt || new Date().toISOString();

  const paymentStatus = useMemo(() => {
    return data?.paymentState === "success" ||
      data?.paymentStatus === "paid" ||
      data?.paymentStatus === "Paid"
      ? "success"
      : data?.paymentStatus === "pending" || data?.paymentStatus === "Pending"
      ? "pending"
      : "failed";
  }, [data?.paymentState, data?.paymentStatus]);

  const fare = data?.fare || {};

  const fareSummary = useMemo(() => {
  return {
    baseFare: Number(fare?.baseFare || 0),

    seatUpgradeTotal: Number(
      fare?.seatUpgradeTotal ||
        fare?.seatCharges ||
        0
    ),

    taxAndSurcharge: Number(fare?.taxAndSurcharge || 0),

    tripSecureTotal: Number(fare?.tripSecureTotal || 0),
      freeCancellationTotal: Number(fare?.freeCancellationTotal || 0),
      tplCredit: Number(fare?.tplCredit || 0),
      appliedOffer: Number(fare?.appliedOffer || 0),
      discount: Number(fare?.discount || 0),
      totalAmount: Number(fare?.totalPaid || fare?.totalAmount || 0),
      walletCalc: {
        promoUsed:
          Number(fare?.walletBreakdown?.promoUsed || 0) ||
          Number(paymentData?.promoUsed || 0),
        earnedUsed:
          Number(fare?.walletBreakdown?.earnedUsed || 0) ||
          Number(paymentData?.earnedUsed || 0),
        refundUsed:
          Number(fare?.walletBreakdown?.refundUsed || 0) ||
          Number(paymentData?.refundUsed || 0),
      },
      earnedOnThisBooking: Number(
        data?.earnedCreditAmount ||
          fare?.walletBreakdown?.earnedOnThisBooking ||
          0
      ),
    };
  }, [fare, paymentData, data?.earnedCreditAmount]);

  if (!data) {
    return (
      <main className="flex min-h-screen items-center justify-center overflow-x-hidden bg-[#eef3f8] px-3">
        <div className="fixed left-0 right-0 top-0 bg-[#eef3f8] px-3 pt-3 lg:hidden">
          <MobileInnerBack title="Bus Confirmation" />
        </div>
        <div className="bg-white p-6 rounded-xl border font-semibold">
          No bus confirmation data found.
        </div>
      </main>
    );
  }

  const finalEarnedCreditAmount =
    earnedCreditAmount || data?.earnedCreditAmount || 0;

  const handlePrint = () => window.print();

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#eef3f8] pb-5 text-black">
      <div className="bg-[#eef3f8] px-3 pt-3 lg:hidden">
        <MobileInnerBack title="Bus Confirmation" />
      </div>
      

      <div className="border-b border-green-200 bg-green-50 px-3 py-4 text-center">
        <div className="font-black text-green-700 text-lg">
          🎉 Bus Booking Confirmed
        </div>
        <div className="text-sm text-green-600">
          Your bus ticket is successfully generated
        </div>

        {finalEarnedCreditAmount > 0 ? (
          <div className="mt-2 text-sm font-bold text-green-700">
            🎁 You earned ₹
            {Number(finalEarnedCreditAmount).toLocaleString("en-IN")} TPL
            Earned Credit on this booking.
          </div>
        ) : null}
      </div>

      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-3 py-4 md:px-4 md:py-6 lg:flex-row">
        <div className="flex w-full min-w-0 flex-col gap-4 lg:w-[72%]">
          <BusConfirmationSuccessHeader
            bookingId={bookingId}
            ticketNumber={ticketNumber}
            busName={busName}
            operatorName={operatorName}
            route={route}
            boardingPoint={boardingPoint}
            droppingPoint={droppingPoint}
            travelDate={travelDate}
            bookingStatus="confirmed"
            paymentStatus="paid"
            bookedAt={bookedAt}
            
          />

          {finalEarnedCreditAmount > 0 ? (
            <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-4 text-[14px] font-bold text-green-700 sm:px-5">
              🎉 You earned ₹
              {Number(finalEarnedCreditAmount).toLocaleString("en-IN")} TPL
              Earned Credit. This has been added to your wallet.
            </div>
          ) : null}

          <BusConfirmationJourneyCard
            busName={busName}
            operatorName={operatorName}
            busType={busType}
            fromCity={search?.fromCity || data?.fromCity || ""}
            toCity={search?.toCity || data?.toCity || ""}
            fromPoint={search?.fromPoint || ""}
            toPoint={search?.toPoint || ""}
            travelDate={travelDate}
            departureTime={departureTime}
            arrivalTime={arrivalTime}
            duration={duration}
            boardingPoint={bookingPayload?.selectedBoardingPoint}
            droppingPoint={bookingPayload?.selectedDroppingPoint}
          />

          <BusConfirmationTravellerCard
            travellers={travellers}
            contactDetails={contactDetails}
          />

          <BusConfirmationFareCard
  bookingId={bookingId}
  paymentId={paymentId}
  ticketNumber={ticketNumber}

  baseFare={fareSummary.baseFare}

  seatUpgradeTotal={fareSummary.seatUpgradeTotal}

  taxAndSurcharge={fareSummary.taxAndSurcharge}

  tripSecureTotal={fareSummary.tripSecureTotal}
  freeCancellationTotal={fareSummary.freeCancellationTotal}
  tplCredit={fareSummary.tplCredit}
  appliedOffer={fareSummary.appliedOffer}
  discount={fareSummary.discount}
  totalAmount={fareSummary.totalAmount}
  paymentMethod={paymentMethod}
  paymentStatus={paymentStatus}
  paidAt={bookedAt}
  walletCalc={fareSummary.walletCalc}
  earnedOnThisBooking={finalEarnedCreditAmount}
/>
        </div>

        <div className="w-full min-w-0 lg:w-[28%]">
          <BusConfirmationActionsCard
            bookingId={bookingId}
            ticketNumber={ticketNumber}
            email={contactDetails?.email || undefined}
            mobile={
              contactDetails?.mobile
                ? `${contactDetails?.countryCode || "+91"} ${contactDetails.mobile}`
                : undefined
            }
            supportNumber="+91 99999 99999"
            onDownloadTicket={handlePrint}
            onDownloadInvoice={handlePrint}
            onPrintTicket={handlePrint}
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
