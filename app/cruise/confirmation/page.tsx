"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import CruiseConfirmationSuccessHeader from "@/app/components/confirmation/cruise/CruiseConfirmationSuccessHeader";
import CruiseConfirmationTripCard from "@/app/components/confirmation/cruise/CruiseConfirmationTripCard";
import CruiseConfirmationCabinTravellerCard from "@/app/components/confirmation/cruise/CruiseConfirmationCabinTravellerCard";
import CruiseConfirmationFareCard from "@/app/components/confirmation/cruise/CruiseConfirmationFareCard";
import CruiseConfirmationActionsCard from "@/app/components/confirmation/cruise/CruiseConfirmationActionsCard";
import LoginModal from "@/app/components/common/LoginModal";
import MobileInnerBack from "@/app/components/common/mobile/MobileInnerBack";

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

type ConfirmationPayload = {
  bookingId?: string;
  cruise?: any;
  cabins?: any;
  travellers?: any;
  offer?: any;
  fare?: any;
  session?: any;
  paymentData?: any;
  earnedCreditAmount?: number;
};

function buildBookingId() {
  return `TPL-CRU-${Date.now().toString().slice(-6)}`;
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

function getActiveUserFromStorage() {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem("tpl_auth_session_v1");
    return raw ? JSON.parse(raw)?.user || null : null;
  } catch {
    return null;
  }
}

function getLeadName(traveller: any) {
  const firstName = traveller?.firstName || "";
  const lastName = traveller?.lastName || "";
  const fullName = traveller?.fullName || traveller?.name || "";

  return fullName || `${firstName} ${lastName}`.trim() || "Guest";
}

function creditEarnedForCruiseBooking(params: {
  mobile: string;
  bookingId: string;
  earnedAmount: number;
}) {
  if (typeof window === "undefined") return;

  const { mobile, bookingId, earnedAmount } = params;

  if (!mobile || !bookingId || earnedAmount <= 0) return;

  const guardKey = `tpl_cruise_earned_credit_done_${bookingId}`;
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
      description: "Earned credit added after successful cruise booking",
      amount: earnedAmount,
      bookingId,
    },
    mobile
  );

  localStorage.setItem(guardKey, "true");
}

export default function CruiseConfirmationPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const [data, setData] = useState<ConfirmationPayload | null>(null);
  const [savedBooking, setSavedBooking] = useState<BookingItem | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [earnedCreditAmount, setEarnedCreditAmount] = useState(0);

  useEffect(() => {
    const raw =
      typeof window !== "undefined"
        ? sessionStorage.getItem("tplCruiseConfirmationData")
        : null;

    if (!raw) return;

    try {
      const parsed: ConfirmationPayload = JSON.parse(raw);

      const activeUser = getActiveUserFromStorage();

      const cruise = parsed?.cruise || {};
      const pricingSummary = parsed?.cabins?.pricingSummary || {};
      const travellers = parsed?.travellers?.list || [];
      const contact = parsed?.travellers?.contact || {};
      const paymentData = parsed?.paymentData || {};
      const bookingFare = parsed?.fare || {};
      const walletBreakdown = bookingFare?.walletBreakdown || {};

      const leadTraveller = travellers?.[0] || {};

      const mobile =
        cleanMobile(contact?.mobile) ||
        cleanMobile(activeUser?.mobile) ||
        cleanMobile(activeUser?.phone);

      const email =
        contact?.email ||
        activeUser?.email ||
        "";

      const title = cruise?.route
        ? `${cruise?.title || "Cruise Booking"} • ${cruise.route}`
        : cruise?.title || "Cruise Booking";

      const travelDate =
        cruise?.sailingStartDate ||
        cruise?.sailingDate ||
        paymentData?.paidAt ||
        new Date().toISOString();

      const totalAmount = Number(
        bookingFare?.grandTotal ||
          bookingFare?.totalAmount ||
          paymentData?.finalPayableAmount ||
          pricingSummary?.grandTotal ||
          pricingSummary?.cabinsTotal ||
          0
      );

      const safePaidAt =
        paymentData?.paidAt ||
        (parsed?.session?.createdAt
          ? new Date(parsed.session.createdAt).toISOString()
          : travelDate);

      const leadName = getLeadName(leadTraveller);
      const leadEmail = String(email || "").toLowerCase().trim();

      const leadIdentity = `${leadName}_${leadEmail}`
        .replace(/\s+/g, "_")
        .replace(/[^\w\-]/g, "");

      const confirmationSaveKey = `cruise_booking_saved_${safePaidAt}_${mobile}_${leadIdentity}_${title}`;

      const payloadStorageKey = `tpl_booking_payload_cruise_${safePaidAt}_${mobile}_${leadIdentity}_${title}`
        .replace(/\s+/g, "_")
        .replace(/[^\w\-]/g, "");

      const earnedAmount = Number(
        parsed?.earnedCreditAmount ||
          bookingFare?.earnedOnThisBooking ||
          walletBreakdown?.earnedOnThisBooking ||
          paymentData?.earnedCreditAmount ||
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
          name: leadName,
          firstName: leadTraveller?.firstName || "",
          lastName: leadTraveller?.lastName || "",
          gender: leadTraveller?.gender || "",
          dob: leadTraveller?.dob || leadTraveller?.dateOfBirth || "",
          email,
          mobile,
          nationality: leadTraveller?.nationality || "Indian",
        },
        source: "cruise",
      });

      const existingBooking = getAllBookings().find((booking) => {
        const existingName = String(booking.leadTraveller?.name || "")
          .toLowerCase()
          .trim();

        const existingEmail = String(booking.leadTraveller?.email || "")
          .toLowerCase()
          .trim();

        return (
          booking.type === "cruise" &&
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
          name: leadName,
          mobile,
          email,
        });

        creditEarnedForCruiseBooking({
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
        const totalTravellers =
          travellers.length ||
          pricingSummary?.cabins?.reduce(
            (sum: number, cabin: any) =>
              sum +
              Number(cabin?.adults || 0) +
              Number(cabin?.children || 0) +
              Number(cabin?.infants || 0),
            0
          ) ||
          1;

        const newBooking = addBooking({
          type: "cruise",
          title,
          travelDate,
          travellers: `${totalTravellers} Traveller${
            totalTravellers > 1 ? "s" : ""
          }`,
          amount: totalAmount,
          status: "upcoming",
          mobile,
          leadTraveller: {
            name: leadName,
            mobile,
            email,
          },
          ticketType: "cruise",
          detailRoute: "/cruise/confirmation",
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
          name: leadName,
          mobile,
          email,
        });

        creditEarnedForCruiseBooking({
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

      if (parsed?.bookingId) {
        creditEarnedForCruiseBooking({
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
      console.error("Cruise confirmation parse error:", e);
    }
  }, []);

  const bookingId = useMemo(() => {
    return savedBooking?.id || data?.bookingId || buildBookingId();
  }, [savedBooking?.id, data?.bookingId]);

  const paymentId = useMemo(() => {
    return data?.paymentData?.paymentId || data?.paymentId || buildPaymentId();
  }, [data?.paymentData?.paymentId, data?.paymentId]);

  const cruise = data?.cruise || {};
  const cabinData = data?.cabins || {};
  const pricingSummary = cabinData?.pricingSummary || null;
  const travellers = data?.travellers?.list || [];
  const contact = data?.travellers?.contact || {};
  const paymentData = data?.paymentData || {};
  const offer = data?.offer || null;

  const fareData = useMemo(() => {
    const bookingFare = data?.fare || {};
    const walletBreakdown = bookingFare?.walletBreakdown || {};

    const baseFare = Number(
      bookingFare?.baseFare || pricingSummary?.cabinsTotal || 0
    );

    const taxes = Number(
      bookingFare?.taxes ||
        bookingFare?.tax ||
        pricingSummary?.taxesAndFees ||
        0
    );

    const insuranceTotal = Number(
      bookingFare?.insuranceTotal || paymentData?.insuranceAmount || 0
    );

    const appliedOffer = Number(
      bookingFare?.appliedOffer || offer?.discountAmount || 0
    );

    const promoUsed = Number(walletBreakdown?.promoUsed || 0);
    const earnedUsed = Number(walletBreakdown?.earnedUsed || 0);
    const refundUsed = Number(walletBreakdown?.refundUsed || 0);

    const tplCredit = Number(
      bookingFare?.tplCreditUsed ||
        bookingFare?.tplCredit ||
        walletBreakdown?.totalWalletUsed ||
        promoUsed + earnedUsed ||
        0
    );

    const totalAmount = Number(
      bookingFare?.grandTotal ||
        bookingFare?.totalAmount ||
        paymentData?.finalPayableAmount ||
        0
    );

    return {
      baseFare,
      taxes,
      portCharges: Number(bookingFare?.portCharges || 0),
      gratuityCharges: Number(bookingFare?.gratuityCharges || 0),
      insuranceTotal,
      addonsTotal: Number(bookingFare?.addonsTotal || 0),
      appliedOffer,
      appliedOfferCode:
        bookingFare?.appliedOfferCode || offer?.code || offer?.couponCode || "",
      appliedOfferTitle:
        bookingFare?.appliedOfferTitle ||
        offer?.title ||
        "Best Cruise Offer Applied",
      offerData: bookingFare?.offerData || offer || null,
      discount: Number(bookingFare?.discount || 0),
      tplCredit,
      walletCalc: {
        promoUsed,
        earnedUsed,
        refundUsed,
      },
      earnedOnThisBooking: Number(
        data?.earnedCreditAmount ||
          bookingFare?.earnedOnThisBooking ||
          walletBreakdown?.earnedOnThisBooking ||
          0
      ),
      totalAmount,
    };
  }, [data, pricingSummary, paymentData, offer]);

  if (!data) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#eef3f8]">
        <div className="bg-white p-6 rounded-xl border font-semibold">
          No cruise confirmation data found.
        </div>
      </main>
    );
  }

  const finalEarnedCreditAmount =
    earnedCreditAmount || data?.earnedCreditAmount || 0;

  const handlePrint = () => window.print();

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#eef3f8] text-black">
      <div className="bg-white px-3 py-3 lg:hidden">
        <MobileInnerBack title="Cruise Confirmation" />
      </div>

      <div className="bg-green-50 border-b border-green-200 px-3 py-4 text-center">
        <div className="font-black text-green-700 text-lg">
          🎉 Cruise Booking Confirmed
        </div>

        <div className="text-sm text-green-600">
          Your cruise booking is successfully confirmed.
        </div>

        {finalEarnedCreditAmount > 0 ? (
          <div className="mt-2 text-sm font-bold text-green-700">
            🎁 You earned ₹
            {Number(finalEarnedCreditAmount).toLocaleString("en-IN")} TPL Earned
            Credit on this booking.
          </div>
        ) : null}
      </div>

      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-3 py-4 lg:flex-row lg:px-4 lg:py-6">
        <div className="flex w-full flex-col gap-4 lg:w-[72%]">
          <CruiseConfirmationSuccessHeader
            bookingId={bookingId}
            title={cruise?.title || "Cruise Booking"}
            bookingStatus="confirmed"
            paymentStatus="paid"
            bookedAt={
              paymentData?.paidAt ||
              (data?.session?.createdAt
                ? new Date(data.session.createdAt).toISOString()
                : null)
            }
            cruiseLine={cruise?.cruiseLine || null}
            sailingDate={cruise?.sailingDate || null}
          />

          {finalEarnedCreditAmount > 0 ? (
            <div className="rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-[14px] font-bold text-green-700">
              🎉 You earned ₹
              {Number(finalEarnedCreditAmount).toLocaleString("en-IN")} TPL
              Earned Credit. This has been added to your wallet.
            </div>
          ) : null}

          <CruiseConfirmationTripCard
            title={cruise?.title || "Cruise Booking"}
            route={cruise?.route || null}
            departurePort={cruise?.departurePort || null}
            arrivalPort={cruise?.arrivalPort || null}
            sailingStartDate={cruise?.sailingStartDate || cruise?.sailingDate || null}
            sailingEndDate={cruise?.sailingEndDate || null}
            sailingDate={cruise?.sailingDate || null}
            visitingPorts={cruise?.visitingPorts || []}
            cruiseLine={cruise?.cruiseLine || null}
            shipName={cruise?.shipName || null}
            durationLabel={cruise?.durationLabel || null}
          />

          <CruiseConfirmationCabinTravellerCard
            cabins={pricingSummary?.cabins || []}
            travellers={travellers}
            contactDetails={contact}
          />

          <CruiseConfirmationFareCard
            bookingId={bookingId}
            paymentId={paymentId}
            baseFare={fareData.baseFare}
            taxes={fareData.taxes}
            portCharges={fareData.portCharges}
            gratuityCharges={fareData.gratuityCharges}
            insuranceTotal={fareData.insuranceTotal}
            addonsTotal={fareData.addonsTotal}
            appliedOffer={fareData.appliedOffer}
            appliedOfferCode={fareData.appliedOfferCode}
            appliedOfferTitle={fareData.appliedOfferTitle}
            offerData={fareData.offerData}
            discount={fareData.discount}
            tplCredit={fareData.tplCredit}
            totalAmount={fareData.totalAmount}
            paymentMethod={paymentData?.selectedPaymentMethod || "UPI"}
            paymentStatus="success"
            paidAt={paymentData?.paidAt}
            walletCalc={fareData.walletCalc}
            earnedOnThisBooking={fareData.earnedOnThisBooking}
          />
        </div>

        <div className="w-full lg:w-[28%]">
          <CruiseConfirmationActionsCard
            bookingId={bookingId}
            email={contact?.email}
            mobile={contact?.mobile}
            onDownloadPDF={handlePrint}
            onSendEmail={() => alert("Email API integration pending")}
            onSendWhatsApp={() => alert("WhatsApp API integration pending")}
            onPrint={handlePrint}
            onGoToBookings={() => {
              if (isAuthenticated) {
                router.push("/account/bookings");
                return;
              }

              setShowLoginModal(true);
            }}
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
