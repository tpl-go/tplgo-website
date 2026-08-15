"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import LoginModal from "@/app/components/common/LoginModal";

import TrainConfirmationSuccessHeader from "@/app/components/confirmation/train/TrainConfirmationSuccessHeader";
import TrainConfirmationTopBar from "@/app/components/confirmation/train/TrainConfirmationTopBar";
import TrainConfirmationJourneyCard from "@/app/components/confirmation/train/TrainConfirmationJourneyCard";
import TrainConfirmationTravellerCard from "@/app/components/confirmation/train/TrainConfirmationTravellerCard";
import TrainConfirmationFareCard from "@/app/components/confirmation/train/TrainConfirmationFareCard";
import TrainConfirmationActionsCard from "@/app/components/confirmation/train/TrainConfirmationActionsCard";

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
import { confirmTrainBackendCheckout } from "@/app/lib/api/trainCheckoutIntegration";

type ConfirmationPayload = any;

function buildBookingId() {
  return `TPL-TRN-${Date.now().toString().slice(-6)}`;
}

function buildPaymentId() {
  return `TPL-PAY-${Date.now().toString().slice(-6)}`;
}

function toNumber(value: any, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function getTravellerName(traveller: any) {
  const fullName = String(traveller?.fullName || "").trim();

  if (fullName) return fullName;

  return (
    `${traveller?.firstName || ""} ${traveller?.lastName || ""}`.trim() ||
    "Guest"
  );
}

function resolveTrainFareSnapshot(parsed: any) {
  const source =
    parsed?.pricing ||
    parsed?.fareSnapshot ||
    parsed?.priceBreakup ||
    parsed?.bookingPayload?.pricingSnapshot ||
    parsed?.bookingPayload?.fareSnapshot ||
    parsed?.bookingPayload?.priceBreakup ||
    parsed?.fare ||
    {};

  const paymentData = parsed?.paymentData || {};

  const baseFare = toNumber(source.trueBaseFare || source.baseFare || 0);

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

  const taxes = toNumber(source.taxes || source.tax || source.taxesAndFees || 0);
  const insuranceAmount = toNumber(source.insuranceAmount || 0);
  const mealAmount = toNumber(source.mealAmount || source.foodAmount || 0);

  const nonBenefitTotal = toNumber(
    source.nonBenefitTotal ||
      convenienceFee +
        gatewayFee +
        confirmUpgradeAmount +
        taxes +
        insuranceAmount +
        mealAmount
  );

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

  const totalBeforeWallet = toNumber(
    source.totalBeforeWallet || baseAfterOffer + nonBenefitTotal
  );

  const totalAmount = toNumber(
    source.totalAmount ||
      source.totalPaid ||
      source.payableAmount ||
      source.grandTotal ||
      paymentData?.totalPaid ||
      Math.max(totalBeforeWallet - totalWalletUsed, 0)
  );

  const earnedOnThisBooking = toNumber(
    source.earnedOnThisBooking ||
      source.walletBreakdown?.earnedOnThisBooking ||
      parsed?.earnedCreditAmount ||
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

    reservationCharge: convenienceFee,
    superfastCharge: toNumber(source.superfastCharge || 0),
    otherCharges: gatewayFee + confirmUpgradeAmount,

    tax: taxes,
    taxes,
    insuranceAmount,
    foodAmount: mealAmount,
    mealAmount,

    appliedOffer,
    offerApplied: appliedOffer,
    appliedOfferAmount: appliedOffer,
    appliedOfferCode: source.appliedOfferCode || parsed?.appliedOfferCode || "",
    appliedOfferTitle:
      source.appliedOfferTitle || parsed?.appliedOfferTitle || "",
    offerData: source.offerData || parsed?.offerData || null,

    nonBenefitTotal,
    totalBeforeWallet,

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

function creditEarnedForTrainBooking(params: {
  mobile: string;
  bookingId: string;
  earnedAmount: number;
}) {
  if (typeof window === "undefined") return;

  const { mobile, bookingId, earnedAmount } = params;

  if (!mobile || !bookingId || earnedAmount <= 0) return;

  const guardKey = `tpl_train_earned_credit_done_${bookingId}`;
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
      description: "Earned credit added after successful train booking",
      amount: earnedAmount,
      bookingId,
    },
    mobile
  );

  localStorage.setItem(guardKey, "true");
}

function persistTrainConfirmationSession(payload: ConfirmationPayload) {
  if (typeof window === "undefined") return;

  const value = JSON.stringify(payload);
  sessionStorage.setItem("trainConfirmationData", value);
  sessionStorage.setItem("trainPaymentSuccessData", value);
  sessionStorage.setItem("tplTrainPaymentConfirmedData", value);
}

export default function TrainConfirmationPage() {
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
        ? sessionStorage.getItem("trainConfirmationData") ||
          sessionStorage.getItem("trainPaymentSuccessData") ||
          sessionStorage.getItem("tplTrainPaymentConfirmedData")
        : null;

    if (!raw) return;

    try {
      let parsed = JSON.parse(raw);

      if (parsed?.backendCheckoutId) {
        const backendConfirm = await confirmTrainBackendCheckout({
          ...parsed,
          bookingId: parsed?.bookingId || "",
          paymentId:
            parsed?.backendPaymentId ||
            parsed?.paymentData?.paymentId ||
            parsed?.paymentId ||
            "",
          transactionId:
            parsed?.transactionId ||
            parsed?.paymentData?.transactionId ||
            parsed?.paymentData?.paymentId ||
            parsed?.paymentId ||
            "",
          paymentMethod:
            parsed?.paymentMethod ||
            parsed?.paymentData?.method ||
            "Online Payment",
          authState: parsed?.authState || parsed?.irctcAuthState || "",
        });

        if (backendConfirm.attempted && backendConfirm.refs) {
          parsed = {
            ...parsed,
            ...backendConfirm.payload,
            ...backendConfirm.refs,
          };
          persistTrainConfirmationSession(parsed);
        }
      }

      if (cancelled) return;
      const fareSnapshot = resolveTrainFareSnapshot(parsed);

      const travellers = Array.isArray(parsed?.travellers)
        ? parsed.travellers
        : Array.isArray(parsed?.bookingPayload?.passengers)
        ? parsed.bookingPayload.passengers
        : [];

      const contactDetails =
        parsed?.contactDetails || parsed?.bookingPayload?.contactDetails || {};

      const trainName =
        parsed?.trainName ||
        parsed?.bookingPayload?.trainName ||
        parsed?.bookingPayload?.train?.trainName ||
        parsed?.bookingPayload?.train?.name ||
        "Train Booking Confirmed";

      const trainNumber =
        parsed?.trainNumber ||
        parsed?.bookingPayload?.trainNumber ||
        parsed?.bookingPayload?.train?.trainNumber ||
        "";

      const route =
        parsed?.route ||
        parsed?.bookingPayload?.route ||
        `${
          parsed?.boardingStation ||
          parsed?.bookingPayload?.fromStation ||
          "Origin"
        } → ${
          parsed?.destinationStation ||
          parsed?.bookingPayload?.toStation ||
          "Destination"
        }`;

      const journeyDate =
        parsed?.journeyDate ||
        parsed?.bookingPayload?.journeyDate ||
        parsed?.bookingPayload?.travelDate ||
        parsed?.bookingPayload?.date ||
        new Date().toISOString();

      const paymentData = {
        ...(parsed?.paymentData || {}),
        totalPaid: fareSnapshot.totalAmount,
        walletUsed: fareSnapshot.totalWalletUsed,
        promoUsed: fareSnapshot.promoUsed,
        earnedUsed: fareSnapshot.earnedUsed,
        refundUsed: fareSnapshot.refundUsed,
      };

      const totalAmount = fareSnapshot.totalAmount;

      const mobile = contactDetails?.mobile || "";
      const email = contactDetails?.email || "";
      const leadTraveller = travellers?.[0] || {};

      const safePaidAt =
        paymentData?.paidAt ||
        parsed?.paidAt ||
        parsed?.bookedOn ||
        journeyDate;

      const title = trainNumber
        ? `${route} • ${trainName} (${trainNumber})`
        : `${route} • ${trainName}`;

      const leadName = getTravellerName(leadTraveller);
      const leadEmail = String(email || "").toLowerCase().trim();

      const leadIdentity = `${leadName}_${leadEmail}`
        .replace(/\s+/g, "_")
        .replace(/[^\w\-]/g, "");

      const confirmationSaveKey = `train_booking_saved_${safePaidAt}_${mobile}_${leadIdentity}_${title}`;

      const payloadStorageKey =
        `tpl_booking_payload_train_${safePaidAt}_${mobile}_${leadIdentity}_${title}`.replace(
          /\s+/g,
          "_"
        ).replace(/[^\w\-]/g, "");

      const earnedAmount = Number(fareSnapshot.earnedOnThisBooking || 0);

      setEarnedCreditAmount(earnedAmount);

      const normalizedPayload = {
        ...parsed,
        travellers,
        contactDetails,
        trainName,
        trainNumber,
        route,
        journeyDate,

        paymentData,
        pricing: fareSnapshot,
        fareSnapshot,
        priceBreakup: fareSnapshot,
        fare: fareSnapshot,

        bookingPayload: {
          ...(parsed?.bookingPayload || {}),
          pricingSnapshot: fareSnapshot,
          fareSnapshot,
          priceBreakup: fareSnapshot,
        },

        earnedCreditAmount: earnedAmount,
      };

      if (!mobile) {
        setData(normalizedPayload);
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
        source: "train",
      });

      const existingBooking = getAllBookings().find((booking) => {
        const existingName = String(booking.leadTraveller?.name || "")
          .toLowerCase()
          .trim();

        const existingEmail = String(booking.leadTraveller?.email || "")
          .toLowerCase()
          .trim();

        return (
          booking.type === "train" &&
          booking.mobile === mobile &&
          booking.travelDate === journeyDate &&
          booking.title === title &&
          booking.amount === totalAmount &&
          existingName === leadName.toLowerCase().trim() &&
          existingEmail === leadEmail
        );
      });

      if (existingBooking) {
        const payloadWithBookingId = {
          ...normalizedPayload,
          bookingId: existingBooking.id,
          earnedCreditAmount: earnedAmount,
        };

        localStorage.setItem(
          existingBooking.payloadStorageKey || payloadStorageKey,
          JSON.stringify(payloadWithBookingId)
        );
        persistTrainConfirmationSession(payloadWithBookingId);

        createGuestUserFromBooking({
          name: getTravellerName(leadTraveller),
          mobile,
          email,
        });

        creditEarnedForTrainBooking({
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
          type: "train",
          title,
          travelDate: journeyDate,
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
          ticketType: "train",
          detailRoute: "/train/confirmation",
          payloadStorageKey,
        });

        const payloadWithBookingId = {
          ...normalizedPayload,
          bookingId: newBooking.id,
          earnedCreditAmount: earnedAmount,
        };

        localStorage.setItem(
          payloadStorageKey,
          JSON.stringify(payloadWithBookingId)
        );
        persistTrainConfirmationSession(payloadWithBookingId);

        createGuestUserFromBooking({
          name: getTravellerName(leadTraveller),
          mobile,
          email,
        });

        creditEarnedForTrainBooking({
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
        creditEarnedForTrainBooking({
          mobile,
          bookingId: parsed.bookingId,
          earnedAmount,
        });
      }

      setData({
        ...normalizedPayload,
        earnedCreditAmount: earnedAmount,
      });
    } catch (e) {
      console.error("Train confirmation parse error:", e);
    }

    };

    loadConfirmation();

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

  const trainName = data?.trainName || "Train Booking Confirmed";
  const trainNumber = data?.trainNumber || "";
  const pnrNumber = data?.pnrNumber || data?.pnr || "";

  const route = data?.route || "";
  const boardingStation = data?.boardingStation || "";
  const destinationStation = data?.destinationStation || "";
  const journeyDate = data?.journeyDate || "";

  const departureTime = data?.departureTime || "";
  const arrivalTime = data?.arrivalTime || "";

  const coachClass = data?.coachClass || data?.travelClass || "";
  const quota = data?.quota || "";

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
      : "failed";
  }, [data?.paymentStatus]);

  const fare = data?.fare || data?.pricing || data?.fareSnapshot || {};

  const walletBreakdown = fare?.walletBreakdown || {
    promoUsed: 0,
    earnedUsed: 0,
    refundUsed: 0,
    earnedOnThisBooking: 0,
  };

  const earnedOnThisBooking = Number(
    earnedCreditAmount ||
      data?.earnedCreditAmount ||
      walletBreakdown.earnedOnThisBooking ||
      0
  );

  const fareSummary = useMemo(() => {
    return {
      baseFare: Number(fare?.baseFare || 0),
      reservationCharge: Number(
        fare?.reservationCharge || fare?.convenienceFee || 0
      ),
      superfastCharge: Number(fare?.superfastCharge || 0),
      otherCharges: Number(
        fare?.otherCharges ||
          Number(fare?.gatewayFee || 0) +
            Number(fare?.confirmUpgradeAmount || 0)
      ),
      tax: Number(fare?.tax || fare?.taxes || 0),
      insuranceAmount: Number(fare?.insuranceAmount || 0),
      foodAmount: Number(fare?.foodAmount || fare?.mealAmount || 0),

      tplCredit: Number(fare?.tplCredit || fare?.totalWalletUsed || 0),
      appliedOffer: Number(
        fare?.appliedOffer ||
          fare?.offerApplied ||
          fare?.appliedOfferAmount ||
          0
      ),

      totalAmount: Number(
        paymentData?.totalPaid ||
          fare?.totalPaid ||
          fare?.totalAmount ||
          fare?.payableAmount ||
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
  }, [fare, walletBreakdown, paymentData]);

  if (!data) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#eef3f8]">
        <div className="bg-white p-6 rounded-xl border font-semibold">
          No train confirmation data found.
        </div>
      </main>
    );
  }

  const handlePrint = () => window.print();

  return (
    <main className="min-w-0 overflow-x-hidden bg-[#eef3f8] pb-8 text-black md:min-h-screen">
      <TrainConfirmationTopBar
        route={route}
        onGoHome={() => router.push("/")}
      />

      <div className="hidden border-b border-green-200 bg-green-50 py-4 text-center md:block">
        <div className="font-black text-green-700 text-lg">
          🎉 Train Booking Confirmed
        </div>

        <div className="text-sm text-green-600">
          Your train ticket is successfully generated
        </div>

        {earnedOnThisBooking > 0 && (
          <div className="mt-2 text-sm font-bold text-green-700">
            🎁 You earned ₹
            {earnedOnThisBooking.toLocaleString("en-IN")} TPL Earned Credit
          </div>
        )}
      </div>

      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-3 py-3 md:px-4 md:py-6 lg:flex-row">
        <div className="flex min-w-0 flex-col gap-4 lg:w-[72%]">
          <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-4 text-center md:hidden">
            <div className="text-lg font-black text-green-700">
              Train Booking Confirmed
            </div>
            <div className="mt-1 text-sm font-semibold text-green-600">
              Your train ticket is successfully generated
            </div>
            {pnrNumber ? (
              <div className="mt-3 rounded-xl bg-white px-3 py-2 text-[13px] font-black text-slate-900">
                PNR: {pnrNumber}
              </div>
            ) : null}
            {earnedOnThisBooking > 0 && (
              <div className="mt-2 text-sm font-bold text-green-700">
                You earned ₹
                {earnedOnThisBooking.toLocaleString("en-IN")} TPL Earned Credit
              </div>
            )}
          </div>

          <TrainConfirmationSuccessHeader
            bookingId={bookingId}
            pnrNumber={pnrNumber}
            trainName={trainName}
            trainNumber={trainNumber}
            route={route}
            boardingStation={boardingStation}
            destinationStation={destinationStation}
            journeyDate={journeyDate}
            bookingStatus="confirmed"
            paymentStatus="paid"
            bookedAt={bookedAt}
          />

          {earnedOnThisBooking > 0 && (
            <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-bold text-green-700">
              🎉 ₹{earnedOnThisBooking.toLocaleString("en-IN")} Earned Credit
              added to your wallet
            </div>
          )}

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
            travellers={travellers}
            contactDetails={contactDetails}
            pnrNumber={pnrNumber}
            trainNumber={trainNumber}
            coachClass={coachClass}
          />

          <TrainConfirmationFareCard
            bookingId={bookingId}
            paymentId={paymentId}
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

        <div className="min-w-0 lg:w-[28%]">
          <TrainConfirmationActionsCard
            bookingId={bookingId}
            pnrNumber={pnrNumber}
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
