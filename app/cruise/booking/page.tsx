"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import CruiseBookingTopNav from "@/app/components/booking/cruise/CruiseBookingTopNav";
import CruiseTripSummarySection from "@/app/components/booking/cruise/CruiseTripSummarySection";
import CruiseTravellerSection from "@/app/components/booking/cruise/CruiseTravellerSection";
import CruiseInclusionsSection from "@/app/components/booking/cruise/CruiseInclusionsSection";
import CruisePoliciesSection from "@/app/components/booking/cruise/CruisePoliciesSection";
import CruiseAdditionalInfoSection from "@/app/components/booking/cruise/CruiseAdditionalInfoSection";
import CruiseFareSummaryCard from "@/app/components/booking/cruise/CruiseFareSummaryCard";
import CruiseOffersSection from "@/app/components/booking/cruise/CruiseOffersSection";
import {
  calculateSmartOfferDiscount,
  getSmartActiveOfferItem,
} from "@/app/lib/smartOffers";
import LoginModal from "@/app/components/common/LoginModal";
import { applyBenefitPricing } from "@/app/lib/pricing/applyBenefitPricing";
import type { CruiseOfferItem } from "@/app/components/booking/cruise/CruiseOffersSection";


import { getWallet } from "@/app/lib/wallet/walletStorage";
import { AUTH_UPDATED_EVENT } from "@/app/lib/booking/guestAuth";
import { getSavedProfile } from "@/app/lib/account/profileStorage";

type CruiseBookingPayload = {
  cruiseId: string;
  title: string;
  sailingDate: string | null;
  sailingDateId?: string | null;
  departurePort?: string | null;
  arrivalPort?: string | null;

  route?: any;
  visitingPorts?: any[];
  sailingStartDate?: string | null;
  sailingEndDate?: string | null;
  cruiseLine?: string | null;
  shipName?: string | null;
  durationLabel?: string | null;

  selectedCabins: {
    cabinKey: string;
    cabinId: string;
    rows: {
      id: string;
      adults: number;
      children: number;
      infants: number;
      nationality: string;
    }[];
    selectedAt: number;
  }[];

  pricingSummary?: {
    cabins: {
      cabinKey: string;
      cabinId: string;
      cabinName: string;
      adults: number;
      children: number;
      infants: number;
      subtotal: number;
    }[];
    cabinsTotal: number;
    taxesAndFees: number;
    grandTotal: number;
  } | null;

  cabinAssignmentMeta?: {
    cabinId: string;
    assignmentMode: "auto" | "select";
    deckCabinNumber?: string | null;
  }[];

  selectedDeckCabin?: {
    deckId: string;
    deckTitle: string;
    cabinId: string;
    cabinNumber: string;
  } | null;

  appliedOffer?: number;
  appliedOfferCode?: string;
  appliedOfferTitle?: string;
  offerData?: any;

  timerLeft?: number;
};

type TravellerValidationPayload = {
  travellers: any[];
  contactDetails: {
    countryCode: string;
    mobile: string;
    email: string;
  };
  allRequiredTravellersCompleted: boolean;
  contactValid: boolean;
  canProceed: boolean;
};

type AdditionalInfoPayload = {
  notes: string;
  isCompleted: boolean;
};



function getCruiseBookingPayload(): CruiseBookingPayload | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = sessionStorage.getItem("tplCruiseBookingDraft");
    if (!raw) return null;

    return JSON.parse(raw) as CruiseBookingPayload;
  } catch {
    return null;
  }
}

function getActiveUser() {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem("tpl_auth_session_v1");
    return raw ? JSON.parse(raw)?.user : null;
  } catch {
    return null;
  }
}

function getDisplayNameFromUser(user: any) {
  if (!user?.mobile) return "User";

  const sessionName = String(user?.fullName || "").trim();
  if (sessionName) return sessionName;

  const profile = getSavedProfile(user.mobile);
  const profileName = `${profile.firstName || ""} ${
    profile.lastName || ""
  }`.trim();

  if (profileName && profileName.toLowerCase() !== "pk") return profileName;

  return `User ${String(user.mobile).slice(-4)}`;
}

function CruiseBookingPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [bookingData, setBookingData] = useState<CruiseBookingPayload | null>(
    null
  );

  const [travellerValidation, setTravellerValidation] =
    useState<TravellerValidationPayload | null>(null);

  const [additionalInfoData, setAdditionalInfoData] =
    useState<AdditionalInfoPayload>({
      notes: "",
      isCompleted: true,
    });

  const [selectedOffer, setSelectedOffer] = useState<CruiseOfferItem | null>(
  null
);

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [activeUser, setActiveUser] = useState<any>(null);

  const [wallet, setWallet] = useState({
    promoCredit: 0,
    earnedCredit: 0,
    refundableBalance: 0,
  });

  const [timeLeft, setTimeLeft] = useState(10 * 60);
  const [isExpired, setIsExpired] = useState(false);
  const [showRefreshNotice, setShowRefreshNotice] = useState(false);

  useEffect(() => {
    const syncUserAndWallet = () => {
      const user = getActiveUser();
      setActiveUser(user);

      if (user?.mobile) {
        setWallet(getWallet(user.mobile));
      } else {
        setWallet({
          promoCredit: 0,
          earnedCredit: 0,
          refundableBalance: 0,
        });
      }
    };

    syncUserAndWallet();

    window.addEventListener(AUTH_UPDATED_EVENT, syncUserAndWallet);
    window.addEventListener("storage", syncUserAndWallet);

    return () => {
      window.removeEventListener(AUTH_UPDATED_EVENT, syncUserAndWallet);
      window.removeEventListener("storage", syncUserAndWallet);
    };
  }, []);

  useEffect(() => {
    const draft = getCruiseBookingPayload();

    if (draft) {
      setBookingData(draft);

      if (typeof draft.timerLeft === "number" && draft.timerLeft > 0) {
        setTimeLeft(draft.timerLeft);
      }

      return;
    }

    const cruiseId = searchParams.get("cruiseId") || "";

    if (!cruiseId) {
      setBookingData(null);
      return;
    }

    setBookingData({
      cruiseId,
      title: "Cruise Booking",
      sailingDate: null,
      sailingDateId: null,
      departurePort: null,
      arrivalPort: null,
      selectedCabins: [],
      pricingSummary: null,
      cabinAssignmentMeta: [],
      selectedDeckCabin: null,
      timerLeft: 10 * 60,
    });
  }, [searchParams]);

  useEffect(() => {
    if (!bookingData) return;

    if (timeLeft <= 0) {
      setIsExpired(true);
      setShowRefreshNotice(true);
      sessionStorage.removeItem("tplCruiseBookingDraft");
      return;
    }

    const timer = window.setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [timeLeft, bookingData]);

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

  const isInternationalTrip = useMemo(() => {
    const departure = (bookingData?.departurePort || "").toLowerCase();
    const arrival = (bookingData?.arrivalPort || "").toLowerCase();

    const indiaKeywords = [
      "india",
      "mumbai",
      "delhi",
      "chennai",
      "kochi",
      "goa",
      "visakhapatnam",
      "kolkata",
      "port blair",
      "new mangalore",
      "mangalore",
      "lakshadweep",
      "andaman",
    ];

    const departureIsIndia = indiaKeywords.some((key) =>
      departure.includes(key)
    );
    const arrivalIsIndia = indiaKeywords.some((key) => arrival.includes(key));

    return !(departureIsIndia && arrivalIsIndia);
  }, [bookingData?.departurePort, bookingData?.arrivalPort]);

  const handleRefreshPrice = () => {
    const latest = getCruiseBookingPayload();

    if (latest) {
      setBookingData(latest);

      if (typeof latest.timerLeft === "number" && latest.timerLeft > 0) {
        setTimeLeft(latest.timerLeft);
      } else {
        setTimeLeft(10 * 60);
      }
    } else {
      setTimeLeft(10 * 60);
    }

    setIsExpired(false);
    setShowRefreshNotice(false);
  };

  if (!bookingData) {
    return (
      <main className="min-h-screen bg-[#f5f7fb] text-black">
        <div className="sticky top-0 z-50 bg-[#f5f7fb]">
          <CruiseBookingTopNav />
        </div>

        <div className="mx-auto max-w-[1280px] px-4 py-5">
          <div className="rounded-xl border border-[#d9e2ec] bg-white p-6 text-base font-semibold text-slate-700">
            No cruise booking data found.
          </div>
        </div>
      </main>
    );
  }

  const pricingSummary = bookingData.pricingSummary;

  const cabinCount =
    bookingData.selectedCabins?.length || pricingSummary?.cabins?.length || 0;

  const baseFare = pricingSummary?.cabinsTotal || 0;
const taxes = pricingSummary?.taxesAndFees || 0;

const smartActiveOffer = getSmartActiveOfferItem();

const draftOffer =
  bookingData.offerData && !selectedOffer
    ? {
        code:
          bookingData.appliedOfferCode ||
          bookingData.offerData.couponCode ||
          bookingData.offerData.slug ||
          "",
        title:
          bookingData.appliedOfferTitle ||
          bookingData.offerData.title ||
          "Cruise smart offer",
        description:
          bookingData.offerData.description ||
          bookingData.offerData.subtitle ||
          "Smart cruise offer applied.",
        discountAmount: Number(bookingData.appliedOffer || 0),
        offer: bookingData.offerData,
      }
    : null;

const smartMappedOffer =
  smartActiveOffer && !selectedOffer && !draftOffer
    ? {
        code: smartActiveOffer.couponCode || smartActiveOffer.slug,
        title: smartActiveOffer.title,
        description:
          smartActiveOffer.description ||
          smartActiveOffer.subtitle ||
          "Smart cruise offer applied.",
        discountAmount: calculateSmartOfferDiscount(
          smartActiveOffer,
          baseFare || 50000
        ),
        offer: smartActiveOffer,
      }
    : null;

const finalSelectedOffer = selectedOffer || draftOffer || smartMappedOffer;

const appliedOfferAmount = Math.min(
  Number(finalSelectedOffer?.discountAmount || 0),
  baseFare
);

const benefitPricing = applyBenefitPricing({
  baseAmount: baseFare,
  taxes,
  offerDiscount: appliedOfferAmount,
  promoCredit: wallet.promoCredit,
  earnedCredit: wallet.earnedCredit,
  refundWallet: wallet.refundableBalance,
});

const totalBeforeWallet = benefitPricing.payableBeforeRefundWallet;

const walletCalc = {
  promoUsed: benefitPricing.promoUsed,
  earnedUsed: benefitPricing.earnedUsed,
  refundUsed: benefitPricing.refundUsed,
  finalPayable: benefitPricing.finalPayable,
};

const tplCreditUsed =
  benefitPricing.promoUsed +
  benefitPricing.earnedUsed +
  benefitPricing.refundUsed;

const totalAmount = benefitPricing.finalPayable;

const earnedOnThisBooking = Math.floor(
  benefitPricing.baseAfterOffer * 0.02
);

  const isTravellerDone = travellerValidation?.canProceed ?? false;
  const isAdditionalInfoDone = additionalInfoData.isCompleted;

  const blockerMessage = isExpired
    ? "Session expired. Please refresh price and continue again."
    : !isTravellerDone
    ? "Please fill Traveller Detail first."
    : !isAdditionalInfoDone
    ? "Please complete Additional Information section."
    : "";

  const canProceed = !isExpired && isTravellerDone && isAdditionalInfoDone;

  return (
    <main className="min-h-screen bg-[#f5f7fb] text-black">
      <div className="sticky top-0 z-50 bg-[#f5f7fb]">
        <CruiseBookingTopNav />

        <div className="flex flex-wrap items-center justify-between gap-3 px-4 pb-3 pt-2">
          <div
            className={`text-[13px] font-bold ${
              isExpired ? "text-red-600" : "text-slate-700"
            }`}
          >
            {isExpired
              ? "Session expired. Refresh latest fare to continue."
              : "Your cruise fare is being held for a limited time."}
          </div>

          <span
            className={`min-w-[80px] rounded-full border border-[#d9e2ec] bg-white px-3 py-1.5 text-center text-sm font-extrabold ${
              timeLeft < 120 ? "text-red-600" : "text-slate-900"
            }`}
          >
            {formattedTime}
          </span>
        </div>
      </div>

      <div className="mx-auto max-w-[1280px] px-4 py-5">
        {showRefreshNotice ? (
          <div
            className={`mb-4 flex flex-wrap items-center justify-between gap-4 rounded-xl border p-4 ${
              isExpired
                ? "border-red-200 bg-red-50"
                : "border-yellow-300 bg-yellow-50"
            }`}
          >
            <div>
              <div
                className={`text-sm font-extrabold ${
                  isExpired ? "text-red-700" : "text-yellow-800"
                }`}
              >
                {isExpired
                  ? "Session expired. Fare may have changed."
                  : "Price hold is ending soon."}
              </div>

              <div className="mt-1 text-[13px] leading-5 text-slate-600">
                Refresh latest fare before continuing to avoid price mismatch.
              </div>
            </div>

            <button
              type="button"
              onClick={handleRefreshPrice}
              className="h-10 min-w-[140px] rounded-[10px] bg-sky-500 px-4 text-sm font-extrabold text-white"
            >
              Refresh Price
            </button>
          </div>
        ) : null}

        <div className="flex items-start gap-4">
          <div className="w-[76%] min-w-0">
            <div className="overflow-hidden border border-[#d9e2ec] bg-white shadow-sm">
              <CruiseTripSummarySection bookingData={bookingData} />

              <div
                style={{
                  padding: "14px 18px",
                  background: "#eef8ff",
                  borderBottom: "1px solid #d9e2ec",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "16px",
                  flexWrap: "wrap",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontSize: "14px",
                    color: "#4b5563",
                    fontWeight: 500,
                  }}
                >
                  {activeUser?.mobile ? (
                    <>
                      <span style={{ fontWeight: 700, color: "#111827" }}>
                        Logged in
                      </span>{" "}
                      as {getDisplayNameFromUser(activeUser)}. Saved traveller
                      details and wallet benefits can be used for faster booking.
                    </>
                  ) : (
                    <>
                      <span style={{ fontWeight: 700, color: "#111827" }}>
                        Login
                      </span>{" "}
                      to view your saved traveller list, unlock special offers
                      and faster booking.
                    </>
                  )}
                </p>

                {!activeUser?.mobile ? (
                  <button
                    type="button"
                    onClick={() => setShowLoginModal(true)}
                    style={{
                      border: "none",
                      background: "transparent",
                      color: "#2a9fe8",
                      fontSize: "14px",
                      fontWeight: 700,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Login Now →
                  </button>
                ) : null}
              </div>

              <CruiseTravellerSection
                cabins={pricingSummary?.cabins || []}
                isInternationalTrip={isInternationalTrip}
                onValidationChange={setTravellerValidation}
                defaultOpen={true}
              />

              <CruiseInclusionsSection
                defaultOpen={false}
                pricingSummary={pricingSummary}
              />

              <CruisePoliciesSection defaultOpen={false} />

              <CruiseAdditionalInfoSection
                defaultOpen={false}
                onChange={setAdditionalInfoData}
              />
            </div>
          </div>

          <div className="w-[24%] min-w-0">
            <CruiseFareSummaryCard
  title={bookingData.title}
  sailingDate={bookingData.sailingDate}
  cabinCount={cabinCount}
  baseFare={baseFare}
  taxes={taxes}
  totalAmount={totalAmount}
  appliedOffer={appliedOfferAmount}
  appliedOfferCode={finalSelectedOffer?.code || ""}
  appliedOfferTitle={finalSelectedOffer?.title || ""}
  tplCredit={tplCreditUsed}
  walletBreakdown={{
    promoUsed: walletCalc.promoUsed,
    earnedUsed: walletCalc.earnedUsed,
    refundUsed: walletCalc.refundUsed,
  }}
  earnedOnThisBooking={earnedOnThisBooking}
  refundWalletAvailable={wallet.refundableBalance}

  pricingSummary={pricingSummary}

  baseAfterOffer={benefitPricing.baseAfterOffer}
  totalBeforeWallet={benefitPricing.payableBeforeRefundWallet}
  pricingRuleSummary={benefitPricing}

  canProceed={canProceed}
  blockerMessage={blockerMessage}
  buttonLabel={isExpired ? "Session Expired" : "Proceed to Payment"}
  onProceed={() => {
                if (!canProceed) return;

                const payload = {
                  serviceType: "cruise",
                  bookingType: "cruise",
                  bookingStatus: "draft",
                  paymentStatus: "pending",
                  manageBookingReady: true,
appliedOffer: appliedOfferAmount,
appliedOfferCode: finalSelectedOffer?.code || "",
appliedOfferTitle: finalSelectedOffer?.title || "",
offerData: finalSelectedOffer,

                  cruise: {
                    cruiseId: bookingData.cruiseId,
                    title: bookingData.title,
                    sailingDate: bookingData.sailingDate,
                    sailingDateId: bookingData.sailingDateId,
                    departurePort: bookingData.departurePort,
                    arrivalPort: bookingData.arrivalPort,
                    route: bookingData.route || null,
                    visitingPorts: bookingData.visitingPorts || [],
                    sailingStartDate:
                      bookingData.sailingStartDate ||
                      bookingData.sailingDate ||
                      null,
                    sailingEndDate: bookingData.sailingEndDate || null,
                    cruiseLine: bookingData.cruiseLine || null,
                    shipName: bookingData.shipName || null,
                    durationLabel: bookingData.durationLabel || null,
                  },

                  cabins: {
                    selectedCabins: bookingData.selectedCabins,
                    pricingSummary: bookingData.pricingSummary,
                    cabinAssignmentMeta: bookingData.cabinAssignmentMeta,
                    selectedDeckCabin: bookingData.selectedDeckCabin,
                  },

                  travellers: {
                    list: travellerValidation?.travellers || [],
                    contact: travellerValidation?.contactDetails || {},
                    isValid: travellerValidation?.canProceed || false,
                  },

                  additionalInfo: additionalInfoData,

                  offer: finalSelectedOffer,

                  fare: {
  baseFare,
  taxes,
  appliedOffer: appliedOfferAmount,
  appliedOfferCode: finalSelectedOffer?.code || "",
  appliedOfferTitle: finalSelectedOffer?.title || "",
  offerData: finalSelectedOffer,

  baseAfterOffer: benefitPricing.baseAfterOffer,
  totalBeforeWallet: benefitPricing.payableBeforeRefundWallet,
  pricingRuleSummary: benefitPricing,

  tplCreditUsed,
  grandTotal: totalAmount,
  walletBreakdown: {
    promoUsed: walletCalc.promoUsed,
    earnedUsed: walletCalc.earnedUsed,
    refundUsed: walletCalc.refundUsed,
    promoAvailable: wallet.promoCredit,
    earnedAvailable: wallet.earnedCredit,
    refundWalletAvailable: wallet.refundableBalance,
    totalWalletUsed: tplCreditUsed,
    earnedOnThisBooking,
  },
},

                  originalBookingBaseline: {
                    amount: totalAmount,
                    payableAmount: totalAmount,
                    totalBeforeWallet,
                    cruiseId: bookingData.cruiseId,
                    title: bookingData.title,
                    sailingDate: bookingData.sailingDate,
                    departurePort: bookingData.departurePort,
                    arrivalPort: bookingData.arrivalPort,
                    baseFare,
                    taxes,
                  },

                  session: {
                    timerLeft: timeLeft,
                    createdAt: Date.now(),
                  },
                };

                sessionStorage.setItem(
                  "tplCruiseBookingSession",
                  JSON.stringify(payload)
                );

                router.push("/cruise/payment");
              }}
            />

            <CruiseOffersSection
  appliedOfferCode={finalSelectedOffer?.code || ""}
  bookingValue={baseFare || 50000}
  onApplyOffer={(offer) => setSelectedOffer(offer)}
  onRemoveOffer={() => setSelectedOffer(null)}
/>
          </div>
        </div>
      </div>

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </main>
  );
}

export default function CruiseBookingPage() {
  return (
    <Suspense fallback={<div />}>
      <CruiseBookingPageContent />
    </Suspense>
  );
}