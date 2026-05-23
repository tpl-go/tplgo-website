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
  type FlightReviewPayload,
} from "@/app/lib/flights/review/buildFlightReviewData";
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

  const blockerMessage = isExpired
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

        <div
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
      </div>

      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "20px 16px",
        }}
      >
        {showRefreshNotice && (
          <div
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
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "16px",
          }}
        >
          <div
            style={{
              width: "76%",
              minWidth: 0,
            }}
          >
            <div
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

  

  const payload = {
    reviewData,
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

  sessionStorage.setItem(
    "tplFlightBookingReviewData",
    JSON.stringify(payload)
  );

  router.push("/flights/payment");
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
}