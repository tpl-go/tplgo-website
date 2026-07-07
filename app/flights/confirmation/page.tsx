"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import LoginModal from "@/app/components/common/LoginModal";

import FlightConfirmationSuccessHeader from "@/app/components/confirmation/flight/FlightConfirmationSuccessHeader";
import FlightConfirmationJourneyCard from "@/app/components/confirmation/flight/FlightConfirmationJourneyCard";
import FlightConfirmationPassengerCard from "@/app/components/confirmation/flight/FlightConfirmationPassengerCard";
import FlightConfirmationFareCard from "@/app/components/confirmation/flight/FlightConfirmationFareCard";
import FlightConfirmationActionsCard from "@/app/components/confirmation/flight/FlightConfirmationActionsCard";

import {
  addBooking,
  getAllBookings,
  type BookingItem,
} from "@/app/lib/booking/bookingStorage";
import { createGuestUserFromBooking } from "@/app/lib/booking/guestAuth";
import { printFlightTicketFromConfirmation } from "@/app/lib/booking/print/flightTicketPrint";
import { seedAccountAndTravellerSafely } from "@/app/lib/booking/safeProfileSeed";
import { useAuth } from "@/app/hooks/useAuth";
import {
  getWallet,
  saveWallet,
  addWalletLedgerItem,
} from "@/app/lib/wallet/walletStorage";

type ConfirmationPayload = any;

const DIGI_YATRA_REDIRECT_URL = "https://www.digiyatra.org.in/";

function creditEarnedForFlightBooking(params: {
  mobile: string;
  bookingId: string;
  earnedAmount: number;
}) {
  if (typeof window === "undefined") return;
  const { mobile, bookingId, earnedAmount } = params;

  if (!mobile || !bookingId || earnedAmount <= 0) return;

  const guardKey = `tpl_flight_earned_credit_done_${bookingId}`;
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
      description: "Earned credit added after successful flight booking",
      amount: earnedAmount,
      bookingId,
    },
    mobile
  );

  localStorage.setItem(guardKey, "true");
}

export default function FlightConfirmationPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const [data, setData] = useState<ConfirmationPayload | null>(null);
  const [savedBooking, setSavedBooking] = useState<BookingItem | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [earnedCreditAmount, setEarnedCreditAmount] = useState(0);
  const [showDigiYatraPopup, setShowDigiYatraPopup] = useState(false);

  useEffect(() => {
    const raw =
      typeof window !== "undefined"
        ? sessionStorage.getItem("tplFlightConfirmationData")
        : null;

    if (!raw) return;

    try {
      const parsed = JSON.parse(raw);

      const contact = parsed?.travellerValidation?.contactDetails || {};
      const passengers = parsed?.reviewData?.passengers || {};
      const firstJourney = parsed?.reviewData?.journeys?.[0];
      const firstSegment = firstJourney?.segments?.[0];

      const totalTravellers =
        (passengers.adults || 0) +
        (passengers.children || 0) +
        (passengers.infants || 0);

      const title = `${firstSegment?.fromCode || firstSegment?.from || "ORG"} → ${
        firstSegment?.toCode || firstSegment?.to || "DST"
      }`;

      const travelDate =
        firstSegment?.departureDate || new Date().toISOString();

      const totalAmount = parsed?.paymentData?.totalPaid || 0;

      const mobile = contact?.mobile || "";
      const leadTraveller =
        parsed?.travellerValidation?.travellers?.[0] || {};

      const safePaidAt = parsed?.paymentData?.paidAt || travelDate;

      const leadName =
        `${leadTraveller?.firstName || ""} ${
          leadTraveller?.lastName || ""
        }`.trim() || "Guest";

      const leadEmail = String(contact?.email || "").toLowerCase().trim();

      const leadIdentity = `${leadName}_${leadEmail}`
        .replace(/\s+/g, "_")
        .replace(/[^\w\-]/g, "");

      const confirmationSaveKey = `flight_booking_saved_${safePaidAt}_${mobile}_${leadIdentity}_${title}`;

      const payloadStorageKey =
        `tpl_booking_payload_flight_${safePaidAt}_${mobile}_${leadIdentity}_${title}`
          .replace(/\s+/g, "_")
          .replace(/[^\w\-]/g, "");

      const earnedAmount = Number(parsed?.earnedCreditAmount || 0);
      setEarnedCreditAmount(earnedAmount);

      const isDomesticFlight =
        String(parsed?.reviewData?.tripMode || "").toLowerCase() === "domestic";

      const popupGuardKey = `tpl_digi_yatra_prompt_shown_${
        parsed?.bookingId || confirmationSaveKey
      }`;

      if (
        isDomesticFlight &&
        typeof window !== "undefined" &&
        !sessionStorage.getItem(popupGuardKey)
      ) {
        setTimeout(() => {
          setShowDigiYatraPopup(true);
          sessionStorage.setItem(popupGuardKey, "true");
        }, 700);
      }

      if (!mobile) {
        setData(parsed);
        return;
      }

      seedAccountAndTravellerSafely({
        mobile,
        email: contact?.email || "",
        traveller: {
          title: leadTraveller?.title || "",
          firstName: leadTraveller?.firstName || "",
          lastName: leadTraveller?.lastName || "",
          gender: leadTraveller?.gender || "",
          dob: leadTraveller?.dob || leadTraveller?.dateOfBirth || "",
          email: contact?.email || leadTraveller?.email || "",
          mobile,
          nationality: leadTraveller?.nationality || "Indian",
        },
        source: "flight",
      });

      const existingBooking = getAllBookings().find((booking) => {
        const existingName = String(booking.leadTraveller?.name || "")
          .toLowerCase()
          .trim();

        const existingEmail = String(booking.leadTraveller?.email || "")
          .toLowerCase()
          .trim();

        return (
          booking.type === "flight" &&
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
          digiYatra: {
            eligible: isDomesticFlight,
            status: "not_started",
            redirectUrl: DIGI_YATRA_REDIRECT_URL,
          },
        };

        localStorage.setItem(
          existingBooking.payloadStorageKey || payloadStorageKey,
          JSON.stringify(payloadWithBookingId)
        );
        sessionStorage.setItem(
          "tplFlightConfirmationData",
          JSON.stringify(payloadWithBookingId)
        );

        createGuestUserFromBooking({
          name:
            `${leadTraveller?.firstName || ""} ${
              leadTraveller?.lastName || ""
            }`.trim() || "Guest",
          mobile,
          email: contact?.email || "",
        });

        creditEarnedForFlightBooking({
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
          type: "flight",
          title,
          travelDate,
          travellers: `${totalTravellers} Traveller${
            totalTravellers > 1 ? "s" : ""
          }`,
          amount: totalAmount,
          status: "upcoming",
          mobile,
          leadTraveller: {
            name:
              `${leadTraveller?.firstName || ""} ${
                leadTraveller?.lastName || ""
              }`.trim() || "Guest",
            mobile,
            email: contact?.email || "",
          },
          ticketType: "flight",
          detailRoute: "/flights/confirmation",
          payloadStorageKey,
        });

        const payloadWithBookingId = {
          ...parsed,
          bookingId: newBooking.id,
          earnedCreditAmount: earnedAmount,
          digiYatra: {
            eligible: isDomesticFlight,
            status: "not_started",
            redirectUrl: DIGI_YATRA_REDIRECT_URL,
          },
        };

        localStorage.setItem(
          payloadStorageKey,
          JSON.stringify(payloadWithBookingId)
        );
        sessionStorage.setItem(
          "tplFlightConfirmationData",
          JSON.stringify(payloadWithBookingId)
        );

        createGuestUserFromBooking({
          name:
            `${leadTraveller?.firstName || ""} ${
              leadTraveller?.lastName || ""
            }`.trim() || "Guest",
          mobile,
          email: contact?.email || "",
        });

        creditEarnedForFlightBooking({
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
          `${leadTraveller?.firstName || ""} ${
            leadTraveller?.lastName || ""
          }`.trim() || "Guest",
        mobile,
        email: contact?.email || "",
      });

      if (parsed?.bookingId) {
        creditEarnedForFlightBooking({
          mobile,
          bookingId: parsed.bookingId,
          earnedAmount,
        });
      }

      setData({
        ...parsed,
        earnedCreditAmount: earnedAmount,
        digiYatra: {
          eligible: isDomesticFlight,
          status: "not_started",
          redirectUrl: DIGI_YATRA_REDIRECT_URL,
        },
      });
    } catch (e) {
      console.error("Parse error:", e);
    }
  }, []);

  const reviewData = data?.reviewData;
  const travellerValidation = data?.travellerValidation;
  const travellers = travellerValidation?.travellers || [];
  const contact = travellerValidation?.contactDetails || {};
  const seatMealData = data?.seatMealData || {};
  const cabData = data?.cabData || {};
  const insuranceData = data?.insuranceData || {};
  const addonsData = data?.addonsData || {};
  const offerData = data?.offerData || null;
  const paymentData = data?.paymentData || {};

  const isDomesticFlight =
    String(reviewData?.tripMode || "").toLowerCase() === "domestic";

  const handleDigiYatraRedirect = () => {
    if (typeof window === "undefined") return;

    try {
      const bookingId = savedBooking?.id || data?.bookingId || "flight";
      sessionStorage.setItem(`tpl_digi_yatra_redirected_${bookingId}`, "true");
    } catch {}

    window.open(DIGI_YATRA_REDIRECT_URL, "_blank", "noopener,noreferrer");
  };

  const priceBreakup = useMemo(() => {
    const pricing = reviewData?.pricing || {};

    const totalAmount =
      paymentData?.totalPaid ||
      Math.max(
        (pricing.perAdultBaseFare || 0) *
          ((reviewData?.passengers?.adults || 0) +
            (reviewData?.passengers?.children || 0) +
            (reviewData?.passengers?.infants || 0)) +
          (pricing.tax || 0) +
          (pricing.surcharge || 0) +
          (seatMealData?.seatTotal || 0) +
          (seatMealData?.mealTotal || 0) +
          (cabData?.cabPrice || 0) +
          (insuranceData?.insurancePrice || 0) +
          (addonsData?.addonsPrice || 0) -
          (offerData?.discountAmount || 0) -
          (pricing.discount || 0) -
          (pricing.tplCredit || 0),
        0
      );

    return {
      baseFare:
        Number(data?.pricingSnapshot?.baseFare || 0) ||
        Number(pricing.baseFareTotal || 0) ||
        (pricing.perAdultBaseFare || 0) *
          ((reviewData?.passengers?.adults || 0) +
            (reviewData?.passengers?.children || 0) +
            (reviewData?.passengers?.infants || 0)),
      tax: pricing.tax || 0,
      surcharge: pricing.surcharge || 0,
      seatTotal: seatMealData?.seatTotal || 0,
      mealTotal: seatMealData?.mealTotal || 0,
      cabTotal: cabData?.cabPrice || 0,
      insuranceTotal: insuranceData?.insurancePrice || 0,
      addonsTotal: addonsData?.addonsPrice || 0,
      appliedOffer:
        Number(data?.pricingSnapshot?.appliedOffer || 0) ||
        Number(pricing.appliedOffer || 0) ||
        Number(offerData?.discountAmount || 0),
      baseAfterOffer:
        Number(data?.pricingSnapshot?.baseAfterOffer || 0) ||
        Number(pricing.baseAfterOffer || 0),
      totalBeforeWallet: Number(data?.pricingSnapshot?.totalBeforeWallet || 0),
      appliedOfferCode:
        offerData?.code || offerData?.couponCode || offerData?.coupon || "",
      appliedOfferTitle:
        offerData?.title || offerData?.offerTitle || "Best Flight Offer Applied",
      offerData,
      discount: pricing.discount || 0,

      tplCredit:
        Number(paymentData?.promoUsed || 0) +
        Number(paymentData?.earnedUsed || 0),

      walletCalc: {
        promoUsed: paymentData?.promoUsed || 0,
        earnedUsed: paymentData?.earnedUsed || 0,
        refundUsed: paymentData?.refundUsed || 0,
      },

      totalAmount,
    };
  }, [
    data,
    reviewData,
    seatMealData,
    cabData,
    insuranceData,
    addonsData,
    offerData,
    paymentData,
  ]);

  if (!data) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#eef3f8]">
        <div className="bg-white p-6 rounded-xl border font-semibold">
          No confirmation data found.
        </div>
      </main>
    );
  }

  const firstJourney = reviewData?.journeys?.[0];
  const firstSegment = firstJourney?.segments?.[0];
  const lastJourney = reviewData?.journeys?.[reviewData?.journeys?.length - 1];
  const lastSegment =
    lastJourney?.segments?.[lastJourney?.segments?.length - 1] || firstSegment;

  const routeTitle =
    reviewData?.bookingType === "roundTrip"
      ? `${firstSegment?.fromCode || firstSegment?.from || "ORG"} → ${
          firstSegment?.toCode || firstSegment?.to || "DST"
        } → ${lastSegment?.toCode || lastSegment?.to || "ORG"}`
      : reviewData?.bookingType === "multiCity"
      ? "Multi City Flight Booking"
      : `${firstSegment?.fromCode || firstSegment?.from || "ORG"} → ${
          firstSegment?.toCode || firstSegment?.to || "DST"
        }`;

  const airlineSummary =
    firstSegment?.airline && firstSegment?.flightNumber
      ? `${firstSegment.airline} • ${firstSegment.flightNumber}`
      : "Flight Ticket";

  const journeyDateLabel = firstSegment?.departureDate || null;
  const bookingId = savedBooking?.id || data?.bookingId || "-";
  const finalEarnedCreditAmount =
    earnedCreditAmount || data?.earnedCreditAmount || 0;

  const handlePrint = () => {
    const finalBookingId = savedBooking?.id || data?.bookingId;

    if (!data || !finalBookingId) return;

    printFlightTicketFromConfirmation({
      bookingId: finalBookingId,
      data,
      priceBreakup,
    });
  };

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#eef3f8] text-black">
      <div className="border-b border-green-200 bg-green-50 px-3 py-3 text-center md:px-0 md:py-4">
        <div className="text-[16px] font-black text-green-700 md:text-lg">
          🎉 Flight Booking Confirmed
        </div>
        <div className="text-[12px] font-semibold text-green-600 md:text-sm md:font-normal">
          Your ticket is successfully generated
        </div>

        {finalEarnedCreditAmount > 0 ? (
          <div className="mt-2 text-[12px] font-bold text-green-700 md:text-sm">
            🎁 You earned ₹
            {Number(finalEarnedCreditAmount).toLocaleString("en-IN")} TPL
            Earned Credit on this booking.
          </div>
        ) : null}
      </div>

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 overflow-x-hidden px-3 py-3 md:flex-row md:gap-4 md:overflow-visible md:px-4 md:py-6">
        <div className="flex min-w-0 flex-col gap-4 md:w-[72%]">
          <FlightConfirmationSuccessHeader
            bookingId={bookingId}
            bookingStatus="confirmed"
            paymentStatus="paid"
            bookedAt={paymentData?.paidAt || new Date().toISOString()}
            bookingType={reviewData?.bookingType}
            tripMode={reviewData?.tripMode}
            cabinClass={reviewData?.cabinClass}
            airlineSummary={airlineSummary}
            routeTitle={routeTitle}
            journeyDateLabel={journeyDateLabel}
          />

          {isDomesticFlight ? (
            <DigiYatraInlineBanner onClick={handleDigiYatraRedirect} />
          ) : null}

          {finalEarnedCreditAmount > 0 ? (
            <div className="rounded-2xl border border-green-200 bg-green-50 px-3 py-3 text-[12px] font-bold leading-5 text-green-700 md:px-5 md:py-4 md:text-[14px]">
              🎉 You earned ₹
              {Number(finalEarnedCreditAmount).toLocaleString("en-IN")} TPL
              Earned Credit. This has been added to your wallet.
            </div>
          ) : null}

          <FlightConfirmationJourneyCard
            journeys={reviewData?.journeys || []}
            cabinClass={reviewData?.cabinClass}
          />

          <FlightConfirmationPassengerCard
            travellerValidation={travellerValidation}
            seatMealData={seatMealData}
            cabData={cabData}
            insuranceData={insuranceData}
            addonsData={addonsData}
          />

          <FlightConfirmationFareCard
            priceBreakup={priceBreakup}
            paymentMethod={paymentData?.method || "Online Payment"}
            paymentStatus="paid"
            paidAt={paymentData?.paidAt || new Date().toISOString()}
            earnedOnThisBooking={finalEarnedCreditAmount}
          />
        </div>

        <div className="min-w-0 md:w-[28%]">
          <FlightConfirmationActionsCard
            bookingId={bookingId}
            email={contact?.email}
            mobile={
              contact?.mobile
                ? `${contact?.countryCode || "+91"} ${contact.mobile}`
                : undefined
            }
            isDomesticFlight={isDomesticFlight}
            onDigiYatra={handleDigiYatraRedirect}
            onDownloadPDF={handlePrint}
            onPrint={handlePrint}
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

      {showDigiYatraPopup && isDomesticFlight ? (
        <DigiYatraPromptModal
          onClose={() => setShowDigiYatraPopup(false)}
          onContinue={() => {
            setShowDigiYatraPopup(false);
            handleDigiYatraRedirect();
          }}
        />
      ) : null}

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </main>
  );
}

function DigiYatraInlineBanner({ onClick }: { onClick: () => void }) {
  return (
    <div className="rounded-[18px] border border-[#fdba74] bg-[linear-gradient(135deg,#fff7ed,#ffffff)] px-4 py-3 shadow-[0_8px_22px_rgba(249,115,22,0.10)] md:rounded-2xl md:px-5 md:py-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-4">
        <div className="min-w-0">
          <div className="text-[14px] font-black text-[#9a3412] md:text-[15px]">
            🛂 Digi Yatra Fast Airport Entry
          </div>
          <div className="mt-1 text-[12px] font-semibold leading-[19px] text-[#475569] md:text-[13px] md:leading-[20px]">
            Avoid long airport entry queues. Set up Digi Yatra before your
domestic flight for a faster airport experience.
<br />
<span className="text-[#9a3412]">
  लंबी airport entry line से बचें। अपनी domestic flight से पहले Digi Yatra setup करें।
</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onClick}
          className="min-h-10 w-full shrink-0 rounded-full bg-[#f97316] px-5 py-2 text-[13px] font-black text-white shadow-[0_8px_18px_rgba(249,115,22,0.25)] md:w-auto"
        >
          Continue
        </button>
      </div>
    </div>
  );
}

function DigiYatraPromptModal({
  onClose,
  onContinue,
}: {
  onClose: () => void;
  onContinue: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[120] flex items-end justify-center overflow-x-hidden bg-black/45 px-3 py-3 md:items-center md:px-4 md:py-6">
      <div className="relative flex max-h-[calc(100dvh-24px)] w-full max-w-[520px] flex-col overflow-hidden rounded-[22px] bg-white shadow-2xl md:max-h-[min(680px,calc(100vh-48px))] md:rounded-3xl">
        <div className="shrink-0 bg-[linear-gradient(135deg,#fff7ed,#ffffff)] px-4 py-4 md:px-6 md:py-6">
          <div className="flex items-start gap-3 md:gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#f97316] text-[21px] shadow-[0_10px_24px_rgba(249,115,22,0.25)] md:h-14 md:w-14 md:text-[26px]">
              🛂
            </div>

            <div className="min-w-0 flex-1">
              <div className="pr-8 text-[18px] font-black leading-6 text-[#111827] md:pr-0 md:text-[21px] md:leading-normal">
                Skip Airport Entry Queues
              </div>
              <div className="mt-2 text-[13px] font-semibold leading-[20px] text-[#475569] md:text-[14px] md:leading-[22px]">
                Your domestic flight is eligible for Digi Yatra. Complete the
fast-entry setup and enjoy a smoother airport experience.
<br />
<span className="text-[#9a3412]">
  आपकी domestic flight Digi Yatra के लिए eligible है। Fast airport entry के लिए setup complete करें।
</span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close Digi Yatra prompt"
              className="absolute right-4 top-4 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#fed7aa] bg-white text-[18px] font-black leading-none text-[#9a3412] shadow-[0_8px_18px_rgba(15,23,42,0.10)] md:hidden"
            >
              ×
            </button>
          </div>
        </div>

        <div className="min-h-0 overflow-y-auto overflow-x-hidden px-4 pb-4 md:px-6 md:pb-6">
          <div className="rounded-2xl border border-[#fed7aa] bg-[#fff7ed] p-3 text-[12px] font-bold leading-[19px] text-[#9a3412] md:p-4 md:text-[13px] md:leading-[21px]">
            Save time at the airport with face-based entry where available.
<br />
<span>
  जहां सुविधा उपलब्ध है, वहां face-based entry से airport पर समय बचाएं।
</span>
          </div>

          <div className="mt-4 grid gap-2 md:mt-5 md:grid-cols-2 md:gap-3">
            <button
              type="button"
              onClick={onClose}
              className="h-11 rounded-full border border-[#d9e2ec] bg-white text-[14px] font-black text-[#374151]"
            >
              Do Later
            </button>

            <button
              type="button"
              onClick={onContinue}
              className="h-11 rounded-full bg-[#f97316] px-4 text-[14px] font-black text-white shadow-[0_10px_22px_rgba(249,115,22,0.25)]"
            >
              Continue to Digi Yatra
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
