"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import LoginModal from "@/app/components/common/LoginModal";
import MobileInnerBack from "@/app/components/common/mobile/MobileInnerBack";

import CabConfirmationSuccessHeader from "@/app/components/confirmation/cab/CabConfirmationSuccessHeader";
import CabConfirmationJourneyCard from "@/app/components/confirmation/cab/CabConfirmationJourneyCard";
import CabConfirmationTravellerCard from "@/app/components/confirmation/cab/CabConfirmationTravellerCard";
import CabConfirmationFareCard from "@/app/components/confirmation/cab/CabConfirmationFareCard";
import CabConfirmationActionsCard from "@/app/components/confirmation/cab/CabConfirmationActionsCard";

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
import { confirmCabBackendCheckout } from "@/app/lib/api/cabCheckoutIntegration";

type ConfirmationPayload = any;

function buildBookingId() {
  return `TPL-CAB-${Date.now().toString().slice(-6)}`;
}

function buildPaymentId() {
  return `TPL-PAY-${Date.now().toString().slice(-6)}`;
}

function getTravellerName(traveller: any) {
  const fullName = String(traveller?.fullName || traveller?.name || "").trim();

  if (fullName) return fullName;

  const firstName = traveller?.firstName || "";
  const lastName = traveller?.lastName || "";

  return `${firstName} ${lastName}`.trim() || "Guest";
}

function creditEarnedForCabBooking(params: {
  mobile: string;
  bookingId: string;
  earnedAmount: number;
}) {
  if (typeof window === "undefined") return;

  const { mobile, bookingId, earnedAmount } = params;

  if (!mobile || !bookingId || earnedAmount <= 0) return;

  const guardKey = `tpl_cab_earned_credit_done_${bookingId}`;
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
      description: "Earned credit added after successful cab booking",
      amount: earnedAmount,
      bookingId,
    },
    mobile
  );

  localStorage.setItem(guardKey, "true");
}

function persistCabConfirmationSession(payload: ConfirmationPayload) {
  if (typeof window === "undefined") return;

  const value = JSON.stringify(payload);
  sessionStorage.setItem("cabConfirmationData", value);
  sessionStorage.setItem("cabPaymentSuccessData", value);
  sessionStorage.setItem("tplCabConfirmationData", value);
}

export default function CabConfirmationPage() {
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
        ? sessionStorage.getItem("cabConfirmationData") ||
          sessionStorage.getItem("cabPaymentSuccessData") ||
          sessionStorage.getItem("tplCabConfirmationData")
        : null;

    if (!raw) return;

    try {
      let parsed = JSON.parse(raw);

      if (parsed?.backendCheckoutId) {
        const backendConfirm = await confirmCabBackendCheckout({
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
          persistCabConfirmationSession(parsed);
        }
      }

      if (cancelled) return;

      const travellers = Array.isArray(parsed?.travellers)
        ? parsed.travellers
        : parsed?.traveller?.fullName
        ? [
            {
              id: "1",
              fullName: parsed.traveller.fullName || "",
              gender: parsed.traveller.gender || "",
            },
          ]
        : [];

      const contactDetails =
        parsed?.contactDetails || {
          countryCode: "+91",
          mobile: parsed?.traveller?.mobile || "",
          email: parsed?.traveller?.email || "",
        };

      const cabType =
        parsed?.cabType ||
        parsed?.cab?.vehicleType ||
        parsed?.cab?.rideType ||
        parsed?.cab?.name ||
        "Cab Booking";

      const fromLocation =
        parsed?.fromLocation ||
        parsed?.searchMeta?.from ||
        parsed?.searchMeta?.pickup ||
        parsed?.traveller?.pickupLocation ||
        "";

      const toLocation =
        parsed?.toLocation ||
        parsed?.searchMeta?.to ||
        parsed?.searchMeta?.drop ||
        "";

      const rawPickupDate =
  parsed?.pickupDate ||
  parsed?.searchMeta?.pickupDate ||
  parsed?.searchMeta?.departureDate ||
  new Date().toISOString();

const pickupDate = String(rawPickupDate).slice(0, 10);

      const totalAmount = Number(
        parsed?.paymentData?.totalPaid ||
          parsed?.fare?.totalPaid ||
          parsed?.fare?.totalAmount ||
          parsed?.fare?.totalPayable ||
          0
      );

      const mobile = String(contactDetails?.mobile || "").trim();
      const email = contactDetails?.email || "";
      const leadTraveller = travellers?.[0] || parsed?.traveller || {};

      const safePaidAt =
        parsed?.paymentData?.paidAt ||
        parsed?.paidAt ||
        parsed?.bookedOn ||
        pickupDate;

      const title = `${cabType} • ${fromLocation || "Pickup"}${
        toLocation ? ` → ${toLocation}` : ""
      }`;

      const leadIdentity = `${getTravellerName(leadTraveller)}_${email}`
        .replace(/\s+/g, "_")
        .replace(/[^\w\-]/g, "");

      const confirmationSaveKey = `cab_booking_saved_${safePaidAt}_${mobile}_${leadIdentity}_${title}`;

      const payloadStorageKey = `tpl_booking_payload_cab_${safePaidAt}_${mobile}_${leadIdentity}_${title}`
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
          travellers,
          contactDetails,
          earnedCreditAmount: earnedAmount,
        });
        return;
      }

      seedAccountAndTravellerSafely({
        mobile,
        email,
        traveller: {
          name: getTravellerName(leadTraveller),
          firstName: leadTraveller?.firstName || "",
          lastName: leadTraveller?.lastName || "",
          gender: leadTraveller?.gender || "",
          dob: leadTraveller?.dob || leadTraveller?.dateOfBirth || "",
          email,
          mobile,
          nationality: leadTraveller?.nationality || "Indian",
        },
        source: "cab",
      });

      const leadName = getTravellerName(leadTraveller).toLowerCase().trim();
      const leadEmail = String(email || "").toLowerCase().trim();

      const existingBooking = getAllBookings().find((booking) => {
        const existingName = String(booking.leadTraveller?.name || "")
          .toLowerCase()
          .trim();

        const existingEmail = String(booking.leadTraveller?.email || "")
          .toLowerCase()
          .trim();

        return (
          booking.type === "cab" &&
          booking.mobile === mobile &&
          booking.travelDate === pickupDate &&
          booking.title === title &&
          booking.amount === totalAmount &&
          existingName === leadName &&
          existingEmail === leadEmail
        );
      });

      if (existingBooking) {
        const payloadWithBookingId = {
          ...parsed,
          bookingId: existingBooking.id,
          travellers,
          contactDetails,
          earnedCreditAmount: earnedAmount,
        };

        localStorage.setItem(
          existingBooking.payloadStorageKey || payloadStorageKey,
          JSON.stringify(payloadWithBookingId)
        );
        persistCabConfirmationSession(payloadWithBookingId);

        createGuestUserFromBooking({
          name: getTravellerName(leadTraveller),
          mobile,
          email,
        });

        creditEarnedForCabBooking({
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
        const totalTravellers = travellers.length || 1;

        const newBooking = addBooking({
          type: "cab",
          title,
          travelDate: pickupDate,
          travellers: `${totalTravellers} Traveller${
            totalTravellers > 1 ? "s" : ""
          }`,
          amount: totalAmount,
          status: "upcoming",
          mobile,
          leadTraveller: {
            name: getTravellerName(leadTraveller),
            mobile,
            email,
          },
          ticketType: "cab",
          detailRoute: "/cab/confirmation",
          payloadStorageKey,
        });

        const payloadWithBookingId = {
          ...parsed,
          bookingId: newBooking.id,
          travellers,
          contactDetails,
          earnedCreditAmount: earnedAmount,
        };

        localStorage.setItem(
          payloadStorageKey,
          JSON.stringify(payloadWithBookingId)
        );
        persistCabConfirmationSession(payloadWithBookingId);

        createGuestUserFromBooking({
          name: getTravellerName(leadTraveller),
          mobile,
          email,
        });

        creditEarnedForCabBooking({
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
        name: getTravellerName(leadTraveller),
        mobile,
        email,
      });

      if (parsed?.bookingId) {
        creditEarnedForCabBooking({
          mobile,
          bookingId: parsed.bookingId,
          earnedAmount,
        });
      }

      setData({
        ...parsed,
        travellers,
        contactDetails,
        earnedCreditAmount: earnedAmount,
      });
    } catch (e) {
      console.error("Cab confirmation parse error:", e);
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

  const cabType =
    data?.cabType ||
    data?.vehicleType ||
    data?.cab?.vehicleType ||
    data?.cab?.rideType ||
    "Cab Booking";

  const cabName =
    data?.cabName ||
    data?.vehicleName ||
    data?.cab?.name ||
    data?.cab?.brand ||
    cabType;

  const rideId = data?.rideId || data?.tripId || "";

  const fromLocation =
    data?.fromLocation ||
    data?.pickupLocation ||
    data?.searchMeta?.from ||
    data?.searchMeta?.pickup ||
    data?.traveller?.pickupLocation ||
    "";

  const toLocation =
    data?.toLocation ||
    data?.dropLocation ||
    data?.searchMeta?.to ||
    data?.searchMeta?.drop ||
    "";

  const pickupDate =
    data?.pickupDate ||
    data?.travelDate ||
    data?.searchMeta?.pickupDate ||
    data?.searchMeta?.departureDate ||
    "";

  const pickupTime = data?.pickupTime || data?.searchMeta?.pickupTime || "";

  const dropDate =
    data?.dropDate ||
    data?.searchMeta?.dropDate ||
    data?.searchMeta?.returnDate ||
    data?.pickupDate ||
    data?.travelDate ||
    data?.searchMeta?.pickupDate ||
    data?.searchMeta?.departureDate ||
    "";

  const dropTime = data?.dropTime || data?.searchMeta?.dropTime || "";

  const tripType = data?.tripType || data?.searchMeta?.rideType || "";

  const specialRequest =
    data?.specialRequest ||
    data?.selectedAddons?.map((item: any) => item.title).join(", ") ||
    "";

  const travellers = Array.isArray(data?.travellers) ? data.travellers : [];
  const contactDetails = data?.contactDetails || {};

  const paymentData = data?.paymentData || {};
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

  const fare = data?.fare || {};

  const walletBreakdown = fare?.walletBreakdown || {
    promoUsed: 0,
    earnedUsed: 0,
    refundUsed: 0,
    earnedOnThisBooking: 0,
  };

  const finalEarnedCreditAmount =
    Number(earnedCreditAmount || data?.earnedCreditAmount || 0) ||
    Number(walletBreakdown.earnedOnThisBooking || 0);

  const fareSummary = useMemo(() => {
    return {
      baseFare: Number(fare?.baseFare || 0),
      driverAllowance: Number(fare?.driverAllowance || 0),
      nightCharge: Number(fare?.nightCharge || 0),
      tollTax: Number(fare?.tollTax || 0),
      stateTax: Number(fare?.stateTax || 0),
      parkingCharge: Number(fare?.parkingCharge || 0),
      gst: Number(fare?.gst || fare?.taxesAndFees || 0),
      tplCredit: Number(data?.tplCredit || fare?.tplCredit || 0),
      appliedOffer: Number(data?.appliedOffer || fare?.appliedOffer || 0),
      totalAmount: Number(
        paymentData?.totalPaid ||
          fare?.totalPaid ||
          fare?.totalAmount ||
          fare?.totalPayable ||
          0
      ),
      walletCalc: {
        promoUsed:
          Number(walletBreakdown.promoUsed || 0) ||
          Number(paymentData?.promoUsed || 0),
        earnedUsed:
          Number(walletBreakdown.earnedUsed || 0) ||
          Number(paymentData?.earnedUsed || 0),
        refundUsed:
          Number(walletBreakdown.refundUsed || 0) ||
          Number(paymentData?.refundUsed || 0),
      },
    };
  }, [fare, data?.tplCredit, data?.appliedOffer, walletBreakdown, paymentData]);

  if (!data) {
    return (
      <main className="min-h-screen overflow-x-hidden bg-[#eef3f8]">
        <MobileInnerBack title="Cab Confirmation" />
        <div className="flex min-h-[70vh] items-center justify-center px-4">
          <div className="rounded-xl border bg-white p-6 text-center font-semibold">
            No cab confirmation data found.
          </div>
        </div>
      </main>
    );
  }

  const handlePrint = () => window.print();

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#eef3f8] text-black">
      <MobileInnerBack title="Cab Confirmation" />
      <div className="border-b border-green-200 bg-green-50 px-4 py-4 text-center">
        <div className="text-lg font-black text-green-700">
          Cab Booking Confirmed
        </div>

        <div className="text-sm text-green-600">
          Your cab voucher is successfully generated
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
          <CabConfirmationSuccessHeader
            bookingId={bookingId}
            rideId={rideId}
            cabType={cabType}
            fromLocation={fromLocation}
            toLocation={toLocation}
            pickupDate={pickupDate}
            pickupTime={pickupTime}
            bookingStatus="confirmed"
            paymentStatus="paid"
            bookedAt={bookedAt}
          />

          {finalEarnedCreditAmount > 0 ? (
            <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-4 text-[13px] font-bold leading-5 text-green-700 md:px-5 md:text-[14px]">
              You earned ₹
              {Number(finalEarnedCreditAmount).toLocaleString("en-IN")} TPL
              Earned Credit. This has been added to your wallet.
            </div>
          ) : null}

          <CabConfirmationJourneyCard
            cabType={cabType}
            fromLocation={fromLocation}
            toLocation={toLocation}
            pickupDate={pickupDate}
            pickupTime={pickupTime}
            dropDate={dropDate}
            dropTime={dropTime}
            tripType={tripType}
            vehicleName={cabName}
            specialRequest={specialRequest}
          />

          <CabConfirmationTravellerCard
            travellers={travellers}
            contactDetails={contactDetails}
          />

          <CabConfirmationFareCard
            bookingId={bookingId}
            paymentId={paymentId}
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
            appliedOfferCode={data?.appliedOfferCode || data?.appliedOffer?.code || ""}
            appliedOfferTitle={data?.appliedOfferTitle || data?.appliedOffer?.title || ""}
            offerData={data?.offerData || data?.appliedOffer || null}
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

        <div className="w-full min-w-0 pb-6 lg:w-[28%] lg:pb-0">
          <CabConfirmationActionsCard
            bookingId={bookingId}
            rideId={rideId}
            email={contactDetails?.email || undefined}
            mobile={
              contactDetails?.mobile
                ? `${contactDetails?.countryCode || "+91"} ${contactDetails.mobile}`
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
