"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import FlightReviewTopNav from "@/app/components/booking/flight/FlightReviewTopNav";
import FlightTripSummarySection from "@/app/components/booking/flight/FlightTripSummarySection";
import FlightTravellerSection from "@/app/components/booking/flight/FlightTravellerSection";
import FlightTravelinsuranceSection from "@/app/components/booking/flight/FlightTravelinsuranceSection";
import FlightSeatMealSection from "@/app/components/booking/flight/FlightSeatMealSection";
import FlightCabSection from "@/app/components/booking/flight/FlightCabSection";
import FlightAddonsSection from "@/app/components/booking/flight/FlightAddonsSection";
import FlightFareSummaryCard from "@/app/components/booking/flight/FlightFareSummaryCard";
import FlightOffersSection, {
  FlightOfferItem,
} from "@/app/components/booking/flight/FlightOffersSection";

import {
  getFlightReviewPayload,
  saveFlightReviewPayload,
  type FlightReviewPayload,
} from "@/app/lib/flights/review/buildFlightReviewData";
import { confirmBackendFlightPrice } from "@/app/lib/api/flightPriceApi";
import { simulateBackendFlightBooking } from "@/app/lib/api/flightBookingSimulationApi";
import { applyBenefitPricing } from "@/app/lib/pricing/applyBenefitPricing";
import { getWallet } from "@/app/lib/wallet/walletStorage";
import {
  getSmartActiveOfferItem,
  calculateSmartOfferDiscount,
} from "@/app/lib/smartOffers";

function getActiveUser() {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem("tpl_auth_session_v1");
    return raw ? JSON.parse(raw)?.user : null;
  } catch {
    return null;
  }
}

type TravellerValidationPayload = {
  travellers: any[];
  contactDetails: {
    countryCode: string;
    mobile: string;
    email: string;
  };
  gstDetails: {
    hasGst: boolean;
    state: string;
    saveBillingToProfile: boolean;
  };
  allRequiredTravellersCompleted: boolean;
  contactValid: boolean;
  canProceed: boolean;
};

type SeatMealPayload = {
  seats: {
    travellerId: string;
    seatNumber: string;
    price: number;
  }[];
  meals: {
    travellerId: string;
    mealName: string;
    price: number;
  }[];
  seatTotal: number;
  mealTotal: number;
  seatStatus: "pending" | "selected" | "skipped";
  mealStatus: "pending" | "selected" | "skipped";
};

type CabPayload = {
  cabType: "airport" | "outstation" | "none";
  cabStatus: "pending" | "selected" | "skipped";
  cabLabel: string;
  cabPrice: number;
};

type InsurancePayload = {
  insuranceStatus: "pending" | "selected" | "skipped";
  insuranceLabel: string;
  insurancePrice: number;
};

type AddonsPayload = {
  addonsStatus: "pending" | "selected" | "skipped";
  addonsLabel: string;
  addonsPrice: number;
};



export default function FlightReviewPage() {
  const router = useRouter();

  const [reviewData, setReviewData] = useState<FlightReviewPayload | null>(null);
  const [travellerValidation, setTravellerValidation] =
    useState<TravellerValidationPayload | null>(null);



  const [seatMealData, setSeatMealData] = useState<SeatMealPayload>({
    seats: [],
    meals: [],
    seatTotal: 0,
    mealTotal: 0,
    seatStatus: "pending",
    mealStatus: "pending",
  });

  const [cabData, setCabData] = useState<CabPayload>({
    cabType: "none",
    cabStatus: "pending",
    cabLabel: "No cab selected",
    cabPrice: 0,
  });

  const [insuranceData, setInsuranceData] = useState<InsurancePayload>({
    insuranceStatus: "pending",
    insuranceLabel: "No insurance selected",
    insurancePrice: 0,
  });

  const [addonsData, setAddonsData] = useState<AddonsPayload>({
    addonsStatus: "pending",
    addonsLabel: "No add-on selected",
    addonsPrice: 0,
  });

const [wallet, setWallet] = useState({
  promoCredit: 0,
  earnedCredit: 0,
  refundableBalance: 0,
});

  const [selectedOffer, setSelectedOffer] = useState<FlightOfferItem | null>(null);
  const [backendPriceState, setBackendPriceState] = useState<"idle" | "checking" | "confirmed" | "changed" | "expired" | "failed">("idle");
  const [backendSimulationState, setBackendSimulationState] = useState<"idle" | "creating" | "failed">("idle");
  const [backendBlockerMessage, setBackendBlockerMessage] = useState("");

  const [timeLeft, setTimeLeft] = useState(10 * 60);
  const [isExpired, setIsExpired] = useState(false);
  const [showRefreshNotice, setShowRefreshNotice] = useState(false);

  useEffect(() => {
  const data = getFlightReviewPayload();
  setReviewData(data);

  const user = getActiveUser();
  if (user?.mobile) {
    setWallet(getWallet(user.mobile));
  }
}, []);

  useEffect(() => {
    if (!reviewData?.backendOffer || reviewData.backendOffer.priceConfirmationId || backendPriceState !== "idle") return;

    void refreshBackendPrice(reviewData);
  }, [reviewData, backendPriceState]);

  useEffect(() => {
    if (timeLeft <= 0) {
      setIsExpired(true);
      setShowRefreshNotice(true);
      sessionStorage.removeItem("tplFlightBookingReviewData");
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  useEffect(() => {
    if (timeLeft === 120) {
      setShowRefreshNotice(true);
    }
  }, [timeLeft]);

  const formattedTime = useMemo(() => {
    const mm = String(Math.floor(timeLeft / 60)).padStart(2, "0");
    const ss = String(timeLeft % 60).padStart(2, "0");
    return `${mm}:${ss}`;
  }, [timeLeft]);

  const handleRefreshPrice = () => {
    if (reviewData?.backendOffer) {
      void refreshBackendPrice(reviewData);
      return;
    }
    const freshData = getFlightReviewPayload();
    setReviewData(freshData);
    setTimeLeft(10 * 60);
    setIsExpired(false);
    setShowRefreshNotice(false);
  };

  if (!reviewData) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "#f5f7fb",
          color: "#000",
        }}
      >
        <div
          style={{
            
            background: "#f5f7fb",
          }}
        >
          <FlightReviewTopNav />
        </div>

        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            padding: "20px 16px",
          }}
        >
          <div
            style={{
              background: "#fff",
              border: "1px solid #d9e2ec",
              padding: "24px",
              borderRadius: "12px",
              fontSize: "16px",
              fontWeight: 600,
              color: "#374151",
            }}
          >
            No flight review data found.
          </div>
        </div>
      </main>
    );
  }

  const travellerCount =
    (reviewData.passengers?.adults || 0) +
    (reviewData.passengers?.children || 0) +
    (reviewData.passengers?.infants || 0);

  const perAdultBaseFare = reviewData.pricing?.perAdultBaseFare || 0;

const baseFare =
  Number((reviewData.pricing as any)?.baseFareTotal || 0) ||
  perAdultBaseFare * travellerCount;

  const tax = reviewData.pricing?.tax || 0;
  const surcharge = reviewData.pricing?.surcharge || 0;
  const discount = reviewData.pricing?.discount || 0;
const activeSmartOffer = getSmartActiveOfferItem();

const smartMappedOffer =
  activeSmartOffer && !selectedOffer
    ? {
        code: activeSmartOffer.couponCode || activeSmartOffer.slug,
        title: activeSmartOffer.title,
        description:
          activeSmartOffer.description ||
          activeSmartOffer.subtitle ||
          "Smart offer applied.",
        discountAmount: calculateSmartOfferDiscount(
          activeSmartOffer,
          baseFare
        ),
      }
    : null;

const finalSelectedOffer = selectedOffer || smartMappedOffer;

const payloadAppliedOffer = Number(
  (reviewData.pricing as any)?.appliedOffer || 0
);

const appliedOfferAmount =
  payloadAppliedOffer > 0
    ? payloadAppliedOffer
    : Number(finalSelectedOffer?.discountAmount || 0);

const benefitPricing = applyBenefitPricing({
  baseAmount: baseFare,

  taxes: tax,
  fees: surcharge,

  seatCharges: seatMealData.seatTotal,
  mealCharges: seatMealData.mealTotal,
  cabCharges: cabData.cabPrice,
  insuranceCharges: insuranceData.insurancePrice,
  addOns: addonsData.addonsPrice,

  offerDiscount: appliedOfferAmount,

  promoCredit: wallet.promoCredit,
  earnedCredit: wallet.earnedCredit,
  refundWallet: wallet.refundableBalance,
});

const walletCalc = {
  promoUsed: benefitPricing.promoUsed,
  earnedUsed: benefitPricing.earnedUsed,
  refundUsed: benefitPricing.refundUsed,
  finalPayable: benefitPricing.finalPayable,
};

const tplCredit =
  benefitPricing.promoUsed +
  benefitPricing.earnedUsed +
  benefitPricing.refundUsed;

const totalBeforeWallet = benefitPricing.payableBeforeRefundWallet;

const finalTotalAmount = benefitPricing.finalPayable;

  const isTravellerDone = travellerValidation?.canProceed ?? false;

  const isSeatMealDone =
    seatMealData.seatStatus !== "pending" &&
    seatMealData.mealStatus !== "pending";

  const isCabDone = cabData.cabStatus !== "pending";
  const isInsuranceDone = insuranceData.insuranceStatus !== "pending";

  const blockerMessage = backendBlockerMessage
    ? backendBlockerMessage
    : backendPriceState === "checking"
    ? "Confirming latest backend fare."
    : backendSimulationState === "creating"
    ? "Creating simulated booking draft."
    : backendPriceState === "changed"
    ? "Price changed. Please refresh latest fare before continuing."
    : backendPriceState === "expired"
    ? "Backend fare expired. Please search again."
    : backendPriceState === "failed"
    ? "Could not confirm latest backend fare. Please refresh price."
    : backendSimulationState === "failed"
    ? "Could not create simulated booking draft. Please retry after refreshing price."
    : isExpired
    ? "Session expired. Please refresh price and continue again."
    : !isTravellerDone
    ? "Please fill Traveller Detail first."
    : !isSeatMealDone
    ? "Please complete Seat & Meal section."
    : !isCabDone
    ? "Please complete Cab section."
    : !isInsuranceDone
    ? "Please complete Travel Insurance section."
    : "";

  const canProceed =
    !isExpired &&
    backendPriceState !== "checking" &&
    backendPriceState !== "changed" &&
    backendPriceState !== "expired" &&
    backendPriceState !== "failed" &&
    backendSimulationState !== "creating" &&
    backendSimulationState !== "failed" &&
    isTravellerDone &&
    isSeatMealDone &&
    isCabDone &&
    isInsuranceDone;

const reviewText = JSON.stringify(reviewData || {}).toLowerCase();

const isInternationalFlight =
  reviewText.includes("dubai") ||
  reviewText.includes("dxb") ||
  reviewText.includes("singapore") ||
  reviewText.includes("bangkok") ||
  reviewText.includes("london") ||
  reviewText.includes("paris") ||
  reviewText.includes("international");

  const totalTravellers =
    (reviewData.passengers?.adults || 0) +
    (reviewData.passengers?.children || 0) +
    (reviewData.passengers?.infants || 0);

  const isSeatMealUnlocked =
    travellerValidation?.allRequiredTravellersCompleted ?? false;

  const isCabUnlocked = isSeatMealDone;
  const isInsuranceUnlocked = isCabDone;
  const isAddonsUnlocked = isInsuranceDone;
  const bookingTypeLabel =
    reviewData.bookingType === "multiCity"
      ? "Multi City"
      : reviewData.bookingType === "roundTrip"
      ? "Round Trip"
      : "One Way";
  const tripModeLabel =
    reviewData.tripMode === "international" ? "International" : "Domestic";
  const firstSegment = reviewData.journeys?.[0]?.segments?.[0] || null;
  const lastJourney =
    reviewData.journeys?.[Math.max(reviewData.journeys.length - 1, 0)] || null;
  const lastSegment =
    lastJourney?.segments?.[
      Math.max((lastJourney?.segments?.length || 1) - 1, 0)
    ] || null;
  const routeSummary =
    firstSegment && lastSegment
      ? `${firstSegment.from || ""} to ${lastSegment.to || ""}`
      : `${bookingTypeLabel} flight`;
  const mobileReviewSubtitle = `${bookingTypeLabel} · ${tripModeLabel} flight`;

  return (
    <main
      className="max-md:overflow-x-hidden"
      style={{
        minHeight: "100vh",
        background: "#f5f7fb",
        color: "#000",
      }}
    >
      <div
        className="max-md:sticky max-md:top-0 max-md:z-50 max-md:shadow-[0_8px_24px_rgba(15,23,42,0.12)]"
        style={{
          
          background: "#f5f7fb",
        }}
      >
        <FlightReviewTopNav
          subtitle={mobileReviewSubtitle}
        />

        <div
          className="max-md:hidden"
          style={{
            padding: "8px 16px 12px 16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          <div
            className="max-md:text-[12px] max-md:leading-[18px]"
            style={{
              fontSize: "13px",
              fontWeight: 700,
              color: isExpired ? "#dc2626" : "#374151",
            }}
          >
            {isExpired
              ? "Session expired. Refresh latest fare to continue."
              : "Your fare is being held for a limited time."}
          </div>

          <span
            className="max-md:min-w-[70px] max-md:px-3 max-md:py-1.5 max-md:text-[13px]"
            style={{
              padding: "6px 12px",
              borderRadius: "999px",
              border: "1px solid #d9e2ec",
              background: "#fff",
              fontWeight: 800,
              color: timeLeft < 120 ? "#dc2626" : "#111827",
              minWidth: "80px",
              textAlign: "center",
            }}
          >
            {formattedTime}
          </span>
        </div>

        <div className="hidden max-md:block max-md:px-3 max-md:pb-3">
          <div className="rounded-2xl border border-[#d9e2ec] bg-white px-3 py-2.5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="truncate text-[11px] font-black uppercase tracking-[0.06em] text-[#64748b]">
                  {routeSummary}
                </div>
                <div
                  className={`mt-0.5 text-[13px] font-black leading-[18px] ${
                    isExpired ? "text-[#dc2626]" : "text-[#111827]"
                  }`}
                >
                  {isExpired
                    ? "Session expired. Refresh fare."
                    : "Fare held for a limited time"}
                </div>
                <div className="mt-1 text-[11px] font-semibold text-[#64748b]">
                  {mobileReviewSubtitle}
                </div>
              </div>

              <span
                className={`shrink-0 rounded-full border px-3 py-1.5 text-[13px] font-black ${
                  timeLeft < 120
                    ? "border-[#fecaca] bg-[#fff1f2] text-[#dc2626]"
                    : "border-[#d9e2ec] bg-[#f8fafc] text-[#111827]"
                }`}
              >
                {formattedTime}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div
        className="max-md:px-3 max-md:py-3"
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "20px 16px",
        }}
      >
        {showRefreshNotice && (
          <div
            className="max-md:flex-col max-md:items-stretch max-md:rounded-xl max-md:p-3"
            style={{
              marginBottom: "16px",
              border: "1px solid #fcd34d",
              background: isExpired ? "#fef2f2" : "#fffbea",
              borderRadius: "12px",
              padding: "14px 16px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "14px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: 800,
                  color: isExpired ? "#b91c1c" : "#92400e",
                }}
              >
                {isExpired
                  ? "Session expired. Fare may have changed."
                  : "Price hold is ending soon."}
              </div>

              <div
                style={{
                  marginTop: "4px",
                  fontSize: "13px",
                  color: "#4b5563",
                  lineHeight: "20px",
                }}
              >
                Refresh latest fare before continuing to avoid price mismatch.
              </div>
            </div>

            <button
              type="button"
              onClick={handleRefreshPrice}
              className="max-md:w-full"
              style={{
                minWidth: "140px",
                height: "40px",
                border: "none",
                borderRadius: "10px",
                background: "#1d9bf0",
                color: "#ffffff",
                fontSize: "14px",
                fontWeight: 800,
                cursor: "pointer",
                padding: "0 14px",
              }}
            >
              Refresh Price
            </button>
          </div>
        )}

        <div
          className="max-md:flex-col"
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "16px",
          }}
        >
          <div
            className="max-md:!w-full"
            style={{
              width: "76%",
              minWidth: 0,
            }}
          >
            <div
              className="max-md:rounded-xl"
              style={{
                background: "#ffffff",
                border: "1px solid #d9e2ec",
                boxShadow: "0 1px 2px rgba(16,24,40,0.04)",
                overflow: "hidden",
              }}
            >
              <FlightTripSummarySection reviewData={reviewData} />

              <FlightTravellerSection
                bookingType={reviewData.bookingType}
                tripMode={reviewData.tripMode}
                passengers={reviewData.passengers}
                onValidationChange={setTravellerValidation}
              />

              <FlightSeatMealSection
                isTravellerComplete={isSeatMealUnlocked}
                travellerCount={totalTravellers}
                onChange={setSeatMealData}
              />

              <FlightCabSection
                isEnabled={isCabUnlocked}
                onChange={setCabData}
              />

              <FlightTravelinsuranceSection
                isEnabled={isInsuranceUnlocked}
                onChange={setInsuranceData}
              />

              <FlightAddonsSection
                isEnabled={isAddonsUnlocked}
                onChange={setAddonsData}
              />
            </div>
          </div>

          <div
            className="max-md:!w-full"
            style={{
              width: "24%",
              minWidth: 0,
            }}
          >
            <FlightFareSummaryCard
              travellerCount={travellerCount}
              perAdultBaseFare={perAdultBaseFare}
              baseFare={baseFare}
              tax={tax}
              surcharge={surcharge}
              appliedOffer={appliedOfferAmount}
              discount={discount}
              tplCredit={tplCredit}
              
walletBreakdown={{
  promoUsed: walletCalc.promoUsed,
  earnedUsed: walletCalc.earnedUsed,
  refundUsed: walletCalc.refundUsed,
}}
earnedOnThisBooking={Math.floor(benefitPricing.baseAfterOffer * 0.02)}
refundWalletAvailable={wallet.refundableBalance}
useRefundWallet={true}
seatTotal={seatMealData.seatTotal}
              
              mealTotal={seatMealData.mealTotal}
              cabTotal={cabData.cabPrice}
              insuranceTotal={insuranceData.insurancePrice}
              addonsTotal={addonsData.addonsPrice}
              seatStatus={seatMealData.seatStatus}
              mealStatus={seatMealData.mealStatus}
              cabStatus={cabData.cabStatus}
              insuranceStatus={insuranceData.insuranceStatus}
              addonsStatus={addonsData.addonsStatus}
              totalAmount={finalTotalAmount}
              canProceed={canProceed}
              blockerMessage={blockerMessage}
              buttonLabel={isExpired ? "Session Expired" : "Proceed to Book"}
              onProceed={() => {
  if (isExpired) return;

  void proceedToPayment();
}}
            />

            <FlightOffersSection
  appliedOfferCode={selectedOffer?.code || ""}
  isInternational={isInternationalFlight}
  bookingValue={baseFare}
  onApplyOffer={(offer) => setSelectedOffer(offer)}
  onRemoveOffer={() => setSelectedOffer(null)}
/>
          </div>
        </div>
      </div>
    </main>
  );

  async function proceedToPayment() {
    if (!reviewData) return;

    let nextReviewData = reviewData;
    let backendSimulationMetadata:
      | {
          simulationId: string;
          bookingDraftId: string;
          bookingRef: string;
          priceConfirmationId: string;
          expiresAt: string;
          backendRequestId?: string;
        }
      | null = null;
    if (reviewData.backendOffer) {
      const priceReady = reviewData.backendOffer.priceConfirmationId
        ? reviewData
        : await refreshBackendPrice(reviewData);

      if (!priceReady?.backendOffer?.priceConfirmationId) return;
      nextReviewData = priceReady;

      setBackendSimulationState("creating");
      setBackendBlockerMessage("");
      const simulation = await simulateBackendFlightBooking({
        searchId: priceReady.backendOffer.searchId,
        offerId: priceReady.backendOffer.offerId,
        ...(priceReady.backendOffer.fareId ? { fareId: priceReady.backendOffer.fareId } : {}),
        priceConfirmationId: priceReady.backendOffer.priceConfirmationId,
        passengers: priceReady.passengers,
        travellers: buildBackendTravellers(travellerValidation, priceReady.passengers),
        contactDetails: buildBackendContactDetails(travellerValidation),
        clientPricingSnapshot: {
          total: finalTotalAmount,
          currency: "INR",
        },
        idempotencyKey: `flight-sim:${priceReady.backendOffer.priceConfirmationId}`,
      });

      if (!simulation.ok) {
        setBackendSimulationState("failed");
        setBackendBlockerMessage(simulation.error.message || "Could not create simulated booking draft.");
        setShowRefreshNotice(true);
        return;
      }

      setBackendSimulationState("idle");
      backendSimulationMetadata = {
        simulationId: simulation.data.simulationId,
        bookingDraftId: simulation.data.bookingDraftId,
        bookingRef: simulation.data.bookingRef,
        priceConfirmationId: simulation.data.priceConfirmationId,
        expiresAt: simulation.data.expiresAt,
        ...(priceReady.backendOffer.backendRequestId ? { backendRequestId: priceReady.backendOffer.backendRequestId } : {}),
      };
      nextReviewData = {
        ...priceReady,
        backendOffer: {
          ...priceReady.backendOffer,
          priceConfirmationId: simulation.data.priceConfirmationId,
          expiresAt: simulation.data.expiresAt,
        },
      };
      saveFlightReviewPayload(nextReviewData);
    }

  const payload = {
    reviewData: nextReviewData,
    travellerValidation,
    seatMealData,
    cabData,
    insuranceData,
    addonsData,

    offerData:
  finalSelectedOffer
    ? {
        ...finalSelectedOffer,
        discountAmount: benefitPricing.offerDiscount,
      }
    : null,

    timerLeft: timeLeft,
  };

  if (backendSimulationMetadata) {
    Object.assign(payload, {
      backendSimulation: backendSimulationMetadata,
    });
  }

  sessionStorage.setItem(
    "tplFlightBookingReviewData",
    JSON.stringify(payload)
  );

  router.push("/flights/payment");
  }

  async function refreshBackendPrice(source: FlightReviewPayload): Promise<FlightReviewPayload | null> {
    if (!source.backendOffer) return source;
    setBackendPriceState("checking");
    setBackendBlockerMessage("");
    const result = await confirmBackendFlightPrice(source.backendOffer.offerId, {
      searchId: source.backendOffer.searchId,
      ...(source.backendOffer.fareId ? { fareId: source.backendOffer.fareId } : {}),
      passengers: source.passengers,
      currency: "INR",
      clientOfferSnapshot: {
        total: Number(source.pricing?.totalAmount || finalTotalAmount || 0),
        currency: "INR",
      },
    });

    if (!result.ok) {
      setBackendPriceState(result.error.code.includes("EXPIRED") ? "expired" : "failed");
      setBackendBlockerMessage(result.error.message || "Could not confirm latest backend fare.");
      setShowRefreshNotice(true);
      return null;
    }

    if (result.data.status === "price_changed") {
      setBackendPriceState("changed");
      setBackendBlockerMessage("Price changed. Please refresh latest fare before continuing.");
      setShowRefreshNotice(true);
      return null;
    }

    if (result.data.status !== "confirmed") {
      setBackendPriceState("failed");
      setBackendBlockerMessage("Latest fare is not available. Please search again.");
      setShowRefreshNotice(true);
      return null;
    }

    const updated: FlightReviewPayload = {
      ...source,
      backendOffer: {
        ...source.backendOffer,
        priceConfirmationId: result.data.priceConfirmationId,
        priceStatus: result.data.status,
        expiresAt: result.data.expiresAt,
      },
      pricing: {
        ...source.pricing,
        perAdultBaseFare: Math.round(result.data.price.baseFare / Math.max(source.passengers.adults, 1)),
        baseFareTotal: result.data.price.baseFare,
        tax: result.data.price.taxes,
        surcharge: result.data.price.fees,
        totalAmount: result.data.price.total,
      },
    };
    setReviewData(updated);
    saveFlightReviewPayload(updated);
    setTimeLeft(10 * 60);
    setIsExpired(false);
    setShowRefreshNotice(false);
    setBackendPriceState("confirmed");
    return updated;
  }
}

function buildBackendTravellers(
  travellerValidation: TravellerValidationPayload | null,
  passengers: FlightReviewPayload["passengers"]
) {
  const source = Array.isArray(travellerValidation?.travellers) ? travellerValidation.travellers : [];
  const types: Array<"adult" | "child" | "infant"> = [
    ...Array.from({ length: passengers.adults }, () => "adult" as const),
    ...Array.from({ length: passengers.children }, () => "child" as const),
    ...Array.from({ length: passengers.infants }, () => "infant" as const),
  ];

  return types.map((type, index) => {
    const traveller = source[index] || {};
    return {
      type,
      ...(typeof traveller.title === "string" && traveller.title ? { title: traveller.title } : {}),
      firstName: String(traveller.firstName || traveller.name || `Traveller${index + 1}`),
      lastName: String(traveller.lastName || "."),
      ...(typeof traveller.dateOfBirth === "string" && traveller.dateOfBirth ? { dateOfBirth: traveller.dateOfBirth } : {}),
      ...(typeof traveller.gender === "string" && traveller.gender ? { gender: traveller.gender } : {}),
      ...(typeof traveller.nationality === "string" && traveller.nationality ? { nationality: traveller.nationality } : {}),
    };
  });
}

function buildBackendContactDetails(travellerValidation: TravellerValidationPayload | null) {
  const contact: Partial<TravellerValidationPayload["contactDetails"]> = travellerValidation?.contactDetails || {};
  return {
    countryCode: contact.countryCode || "+91",
    mobile: contact.mobile || "9999999999",
    email: contact.email || "guest@example.com",
  };
}
