"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import LoginModal from "@/app/components/common/LoginModal";
import MobileInnerBack from "@/app/components/common/mobile/MobileInnerBack";

import PackageConfirmationSuccessHeader from "@/app/components/confirmation/packages/PackageConfirmationSuccessHeader";
import PackageConfirmationSummaryCard from "@/app/components/confirmation/packages/PackageConfirmationSummaryCard";
import PackageConfirmationTravellerCard from "@/app/components/confirmation/packages/PackageConfirmationTravellerCard";
import PackageConfirmationAddOnCard from "@/app/components/confirmation/packages/PackageConfirmationAddOnCard";
import PackageConfirmationItineraryCard from "@/app/components/confirmation/packages/PackageConfirmationItineraryCard";
import PackageConfirmationCancellationCard from "@/app/components/confirmation/packages/PackageConfirmationCancellationCard";
import PackageConfirmationFareCard from "@/app/components/confirmation/packages/PackageConfirmationFareCard";
import PackageConfirmationActionsCard from "@/app/components/confirmation/packages/PackageConfirmationActionsCard";

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
  paymentId?: string;
  invoiceNumber?: string;
  bookingStatus?: "confirmed" | "pending" | "failed";
  summary?: {
    packageSlug?: string;
    packageTitle?: string;
    route?: string[] | string;
    nights?: number;
    days?: number;
    variant?: "withFlight" | "withoutFlight";
    travelDate?: string;
    originCity?: string;
    rooms?: Array<{ adults: number; children: number }>;
    totalAdults?: number;
    totalChildren?: number;
    totalRooms?: number;
    isInternationalTrip?: boolean;
    selectedVariant?: any;
    packageSelectionState?: {
      basePrice?: number;
      selectedFlights?: any[];
      selectedHotels?: any[];
      selectedTransfers?: any[];
      selectedMeals?: any[];
      selectedActivities?: any[];
      flightFareDiff?: number;
      hotelFareDiff?: number;
      transferFareDiff?: number;
      mealFareDiff?: number;
      activityFareDiff?: number;
      finalPrice?: number;
    };
    includedFlightLabels?: string[];
    includedHotelLabels?: string[];
    includedTransferLabels?: string[];
    includedMealLabels?: string[];
    includedActivityLabels?: string[];
    features?: {
      flights?: number;
      hotels?: number;
      transfers?: number;
      activities?: number;
      meals?: number;
    };
  };
  traveller?: {
    travellers?: Array<any>;
    contactDetails?: {
      countryCode?: string;
      mobile?: string;
      email?: string;
    };
    gstDetails?: {
      hasGst?: boolean;
      state?: string;
      saveBillingToProfile?: boolean;
    };
  } | null;
  addOn?: {
    isInternationalTrip?: boolean;
    insuranceSelected?: boolean;
    insuranceAmount?: number;
    [key: string]: any;
  } | null;
  itinerary?: {
    travelDate?: string;
    dayPlans?: any[];
    features?: {
      flights?: number;
      hotels?: number;
      transfers?: number;
      activities?: number;
      meals?: number;
    };
    packageSelectionState?: any;
    includedFlightLabels?: string[];
    includedHotelLabels?: string[];
    includedTransferLabels?: string[];
    includedMealLabels?: string[];
    includedActivityLabels?: string[];
  } | null;
  cancellation?: {
    exclusions?: string[];
  } | null;
  payment?: {
    paymentId?: string;
    selectedPaymentMethod?: string;
    paymentActionState?: string;
    amountPaid?: number;
    basePackagePrice?: number;
    insuranceSelected?: boolean;
    insuranceAmount?: number;
    totalTravellers?: number;
    paidAt?: string;
    walletUsed?: number;
    promoUsed?: number;
    earnedUsed?: number;
    refundUsed?: number;
  } | null;
  fare?: {
    basePrice?: number;
    upgradedDiffTotal?: number;
    feesAndTaxes?: number;
    couponDiscount?: number;
    tplCreditUsed?: number;
    grandTotal?: number;
    finalPayableAmount?: number;
    insuranceAmount?: number;
    appliedCoupon?: string;
    walletBreakdown?: {
      promoUsed?: number;
      earnedUsed?: number;
      refundUsed?: number;
      totalWalletUsed?: number;
      earnedOnThisBooking?: number;
    };
  } | null;
  leadTraveller?: {
    name?: string;
    email?: string;
    mobile?: string;
  } | null;
  earnedCreditAmount?: number;
};

function buildBookingId() {
  return `TPL-PKG-${Date.now().toString().slice(-6)}`;
}

function buildPaymentId() {
  return `TPL-PAY-${Date.now().toString().slice(-6)}`;
}

function buildInvoiceId() {
  return `TPL-INV-${Date.now().toString().slice(-6)}`;
}

function normalizeMobile(value?: string) {
  const digits = String(value || "").replace(/\D/g, "");
  return digits.length > 10 ? digits.slice(-10) : digits;
}

function getLeadName(leadTraveller: any, travellers: any[]) {
  const leadName = String(leadTraveller?.name || "").trim();
  if (leadName) return leadName;

  const firstTraveller = travellers?.[0] || {};
  const fullName = String(
    firstTraveller?.fullName || firstTraveller?.name || ""
  ).trim();
  if (fullName) return fullName;

  const firstName = firstTraveller?.firstName || "";
  const lastName = firstTraveller?.lastName || "";

  return `${firstName} ${lastName}`.trim() || "Guest";
}



function creditEarnedForPackageBooking(params: {
  mobile: string;
  bookingId: string;
  earnedAmount: number;
}) {
  if (typeof window === "undefined") return;

  const { mobile, bookingId, earnedAmount } = params;

  if (!mobile || !bookingId || earnedAmount <= 0) return;

  const guardKey = `tpl_package_earned_credit_done_${bookingId}`;
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
      description: "Earned credit added after successful package booking",
      amount: earnedAmount,
      bookingId,
    },
    mobile
  );

  localStorage.setItem(guardKey, "true");
}

export default function PackageConfirmationPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const [data, setData] = useState<ConfirmationPayload | null>(null);
  const [savedBooking, setSavedBooking] = useState<BookingItem | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [earnedCreditAmount, setEarnedCreditAmount] = useState(0);

  useEffect(() => {
    const raw =
      typeof window !== "undefined"
        ? sessionStorage.getItem("tplPackageConfirmationPayload")
        : null;

    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as ConfirmationPayload;

      const summary = parsed.summary || {};
      const traveller = parsed.traveller || {};
      const payment = parsed.payment || {};
      const fare = parsed.fare || {};
      const leadTraveller = parsed.leadTraveller || {};

      const travellers = Array.isArray(traveller?.travellers)
        ? traveller.travellers
        : [];

      const contactDetails = traveller?.contactDetails || {};

      const mobile = normalizeMobile(
        leadTraveller?.mobile || contactDetails?.mobile || ""
      );

      const email = leadTraveller?.email || contactDetails?.email || "";

      const packageTitle =
        summary?.packageTitle || "Package Booking Confirmed";

      const routeLabel = Array.isArray(summary?.route)
        ? summary.route.join(" → ")
        : summary?.route || "";

      const title = routeLabel
        ? `${packageTitle} • ${routeLabel}`
        : packageTitle;

      const travelDate =
        summary?.travelDate ||
        parsed?.itinerary?.travelDate ||
        payment?.paidAt ||
        new Date().toISOString();

      const totalAmount = Number(
        payment?.amountPaid ||
          fare?.finalPayableAmount ||
          fare?.grandTotal ||
          0
      );

      const safePaidAt = payment?.paidAt || travelDate;

      const leadName = getLeadName(leadTraveller, travellers);
const leadEmail = String(email || "").toLowerCase().trim();

const leadIdentity = `${leadName}_${leadEmail}`
  .replace(/\s+/g, "_")
  .replace(/[^\w\-]/g, "");

const confirmationSaveKey = `package_booking_saved_${safePaidAt}_${mobile}_${leadIdentity}_${title}`;

const payloadStorageKey = `tpl_booking_payload_package_${safePaidAt}_${mobile}_${leadIdentity}_${title}`
  .replace(/\s+/g, "_")
  .replace(/[^\w\-]/g, "");

      const earnedAmount = Number(
        parsed?.earnedCreditAmount ||
          fare?.walletBreakdown?.earnedOnThisBooking ||
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
    name: getLeadName(leadTraveller, travellers),
    firstName: travellers?.[0]?.firstName || "",
    lastName: travellers?.[0]?.lastName || "",
    gender: travellers?.[0]?.gender || "",
    dob: travellers?.[0]?.dob || travellers?.[0]?.dateOfBirth || "",
    email,
    mobile,
    nationality: travellers?.[0]?.nationality || "Indian",
  },
  source: "package",
});

      const existingBooking = getAllBookings().find((booking) => {
  const existingName = String(booking.leadTraveller?.name || "")
    .toLowerCase()
    .trim();

  const existingEmail = String(booking.leadTraveller?.email || "")
    .toLowerCase()
    .trim();

  return (
    booking.type === "package" &&
    booking.mobile === mobile &&
    (booking.payloadStorageKey === payloadStorageKey ||
      (booking.travelDate === travelDate &&
        booking.title === title &&
        booking.amount === totalAmount &&
        existingName === leadName.toLowerCase().trim() &&
        existingEmail === leadEmail))
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
        sessionStorage.setItem(
          "tplPackageConfirmationPayload",
          JSON.stringify(payloadWithBookingId)
        );

        createGuestUserFromBooking({
          name: getLeadName(leadTraveller, travellers),
          mobile,
          email,
        });

        creditEarnedForPackageBooking({
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
          Number(payment?.totalTravellers || 0) ||
          Number(summary?.totalAdults || 0) +
            Number(summary?.totalChildren || 0) ||
          travellers.length ||
          1;

        const newBooking = addBooking({
          type: "package",
          title,
          travelDate,
          travellers: `${totalTravellers} Traveller${
            totalTravellers > 1 ? "s" : ""
          }`,
          amount: totalAmount,
          status: "upcoming",
          mobile,
          leadTraveller: {
            name: getLeadName(leadTraveller, travellers),
            mobile,
            email,
          },
          ticketType: "package",
          detailRoute: "/packages/confirmation",
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
        sessionStorage.setItem(
          "tplPackageConfirmationPayload",
          JSON.stringify(payloadWithBookingId)
        );

        createGuestUserFromBooking({
          name: getLeadName(leadTraveller, travellers),
          mobile,
          email,
        });

        creditEarnedForPackageBooking({
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
        name: getLeadName(leadTraveller, travellers),
        mobile,
        email,
      });

      if (parsed?.bookingId) {
        creditEarnedForPackageBooking({
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
      console.error("Package confirmation parse error:", e);
    }
  }, []);

  const bookingId = useMemo(() => {
    return savedBooking?.id || data?.bookingId || buildBookingId();
  }, [savedBooking?.id, data?.bookingId]);

  const paymentId = useMemo(() => {
    return data?.payment?.paymentId || data?.paymentId || buildPaymentId();
  }, [data?.payment?.paymentId, data?.paymentId]);

  const invoiceNumber = useMemo(() => {
    return data?.invoiceNumber || buildInvoiceId();
  }, [data?.invoiceNumber]);

  if (!data) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#eef3f8]">
        <div className="bg-white p-6 rounded-xl border font-semibold">
          No package confirmation data found.
        </div>
      </main>
    );
  }

  const summary = data.summary || {};
  const traveller = data.traveller || {};
  const addOn = data.addOn || {};
  const itinerary = data.itinerary || {};
  const cancellation = data.cancellation || {};
  const payment = data.payment || {};
  const fare = data.fare || {};
  const leadTraveller = data.leadTraveller || {};

  const finalEarnedCreditAmount =
    Number(earnedCreditAmount || data.earnedCreditAmount || 0) ||
    Number(fare?.walletBreakdown?.earnedOnThisBooking || 0);

  const handlePrint = () => window.print();

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#eef3f8] text-black">
      <div className="mx-auto max-w-7xl px-3 pt-4 lg:hidden">
        <MobileInnerBack title="Back" />
      </div>

      <div className="mt-4 border-b border-green-200 bg-green-50 px-4 py-4 text-center lg:mt-0">
        <div className="text-base font-black text-green-700 sm:text-lg">
          🎉 Package Booking Confirmed
        </div>
        <div className="text-sm text-green-600">
          Your package booking is successfully confirmed
        </div>

        {finalEarnedCreditAmount > 0 ? (
          <div className="mt-2 text-sm font-bold leading-5 text-green-700">
            🎁 You earned ₹
            {Number(finalEarnedCreditAmount).toLocaleString("en-IN")} TPL
            Earned Credit on this booking.
          </div>
        ) : null}
      </div>

      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-3 py-4 sm:px-4 lg:flex-row lg:gap-4 lg:py-6">
        <div className="flex min-w-0 flex-col gap-4 lg:w-[72%]">
          <PackageConfirmationSuccessHeader
            bookingId={bookingId}
            title={summary.packageTitle || "Package Booking Confirmed"}
            bookingStatus={data.bookingStatus || "confirmed"}
            paymentStatus={
              payment.paymentActionState === "success" ? "paid" : "pending"
            }
            bookedAt={payment.paidAt}
            packageCode={summary.packageSlug}
            travelDate={summary.travelDate}
            route={summary.route}
            variant={summary.variant}
          />

          {finalEarnedCreditAmount > 0 ? (
            <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-4 text-[14px] font-bold leading-5 text-green-700 sm:px-5">
              🎉 You earned ₹
              {Number(finalEarnedCreditAmount).toLocaleString("en-IN")} TPL
              Earned Credit. This has been added to your wallet.
            </div>
          ) : null}

          <PackageConfirmationSummaryCard
            packageTitle={summary.packageTitle}
            packageSlug={summary.packageSlug}
            route={summary.route}
            nights={summary.nights}
            days={summary.days}
            variant={summary.variant}
            travelDate={summary.travelDate}
            originCity={summary.originCity}
            rooms={summary.rooms}
            totalAdults={summary.totalAdults}
            totalChildren={summary.totalChildren}
            totalRooms={summary.totalRooms}
            isInternationalTrip={summary.isInternationalTrip}
            selectionState={summary.packageSelectionState}
            includedFlightLabels={summary.includedFlightLabels}
            includedHotelLabels={summary.includedHotelLabels}
            includedTransferLabels={summary.includedTransferLabels}
            includedMealLabels={summary.includedMealLabels}
            includedActivityLabels={summary.includedActivityLabels}
            bookingId={bookingId}
            bookingStatus={data.bookingStatus || "confirmed"}
          />

          <PackageConfirmationTravellerCard
            leadTraveller={leadTraveller}
            travellers={traveller.travellers || []}
            contactDetails={traveller.contactDetails || {}}
            gstDetails={traveller.gstDetails || {}}
          />

          <PackageConfirmationAddOnCard
            addOn={addOn}
            totalTravellers={payment.totalTravellers || summary.totalAdults || 1}
          />

          <PackageConfirmationItineraryCard
            title="Package Itinerary & Inclusions"
            travelDate={itinerary.travelDate || summary.travelDate}
            dayPlans={itinerary.dayPlans || []}
            features={itinerary.features || summary.features}
            packageSelectionState={
              itinerary.packageSelectionState || summary.packageSelectionState
            }
            includedFlightLabels={
              itinerary.includedFlightLabels || summary.includedFlightLabels || []
            }
            includedHotelLabels={
              itinerary.includedHotelLabels || summary.includedHotelLabels || []
            }
            includedTransferLabels={
              itinerary.includedTransferLabels ||
              summary.includedTransferLabels ||
              []
            }
            includedMealLabels={
              itinerary.includedMealLabels || summary.includedMealLabels || []
            }
            includedActivityLabels={
              itinerary.includedActivityLabels ||
              summary.includedActivityLabels ||
              []
            }
          />

          <PackageConfirmationCancellationCard
            travelDate={summary.travelDate}
            exclusions={cancellation.exclusions || []}
          />

          <PackageConfirmationFareCard
            bookingId={bookingId}
            paymentId={paymentId}
            invoiceNumber={invoiceNumber}
            paymentMethod={payment.selectedPaymentMethod}
            paymentStatus={
              payment.paymentActionState === "success" ? "paid" : "pending"
            }
            paidAt={payment.paidAt}
            basePrice={fare.basePrice}
            upgradedDiffTotal={fare.upgradedDiffTotal}
            feesAndTaxes={fare.feesAndTaxes}
            insuranceAmount={fare.insuranceAmount}
            couponDiscount={fare.couponDiscount}
            tplCreditUsed={fare.tplCreditUsed}
            grandTotal={fare.finalPayableAmount || fare.grandTotal}
            appliedCoupon={fare.appliedCoupon}
            totalTravellers={payment.totalTravellers || summary.totalAdults}
            walletCalc={{
              promoUsed:
                Number(fare?.walletBreakdown?.promoUsed || 0) ||
                Number(payment?.promoUsed || 0),
              earnedUsed:
                Number(fare?.walletBreakdown?.earnedUsed || 0) ||
                Number(payment?.earnedUsed || 0),
              refundUsed:
                Number(fare?.walletBreakdown?.refundUsed || 0) ||
                Number(payment?.refundUsed || 0),
            }}
            earnedOnThisBooking={finalEarnedCreditAmount}
          />
        </div>

        <div className="min-w-0 lg:w-[28%]">
          <PackageConfirmationActionsCard
            bookingId={bookingId}
            paymentId={paymentId}
            invoiceNumber={invoiceNumber}
            email={leadTraveller.email}
            mobile={leadTraveller.mobile}
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
