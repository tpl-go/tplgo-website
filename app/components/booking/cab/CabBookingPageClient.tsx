"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import type {
  CabResultItem,
  CabResultSearchMeta,
} from "@/app/lib/cab/cabResultTypes";
import type {
  CabBookingAddon,
  CabOfferItem,
} from "@/app/lib/cab/cabBookingTypes";

import {
  buildCabBookingPageData,
  buildCabBookingFare,
  validateCabTravellerDetails,
} from "@/app/lib/cab/cabBookingHelpers";

import CabBookingTopBar from "@/app/components/booking/cab/CabBookingTopBar";
import CabBookingDetailCard from "@/app/components/booking/cab/CabBookingDetailCard";
import CabBookingTravellerForm from "@/app/components/booking/cab/CabBookingTravellerForm";
import CabBookingFareSummary from "@/app/components/booking/cab/CabBookingFareSummary";
import CabBookingSection from "@/app/components/booking/cab/CabBookingSection";
import CabBookingInclusions from "@/app/components/booking/cab/CabBookingInclusions";
import CabBookingPolicies from "@/app/components/booking/cab/CabBookingPolicies";
import CabBookingReviews from "@/app/components/booking/cab/CabBookingReviews";
import CabBookingSpecialRequests from "@/app/components/booking/cab/CabBookingSpecialRequests";
import CabBookingOffers from "@/app/components/booking/cab/CabBookingOffers";
import LoginModal from "@/app/components/common/LoginModal";
import MobileInnerBack from "@/app/components/common/mobile/MobileInnerBack";

import { getWallet } from "@/app/lib/wallet/walletStorage";
import { AUTH_UPDATED_EVENT } from "@/app/lib/booking/guestAuth";
import { getSavedProfile } from "@/app/lib/account/profileStorage";
import { getLoggedInDisplayName } from "@/app/lib/auth/displayName";
import {
  calculateSmartOfferDiscount,
  getSmartActiveOfferItem,
} from "@/app/lib/smartOffers";

type Props = {
  cab?: CabResultItem;
  searchMeta?: CabResultSearchMeta;
};

type CabSelectedPricingSnapshot = {
  cabId?: string;
  item?: CabResultItem;
  searchMeta?: CabResultSearchMeta;
  pricingSnapshot?: {
    offerApplied?: boolean;
    offerCode?: string;
    offerTitle?: string;
    offerAmount?: number;
    baseFare?: number;
    baseAfterOffer?: number;
    nonBenefitTotal?: number;
    totalBeforeWallet?: number;
    finalPayable?: number;
    pricingRule?: string;
  };
};

function toNumber(value: unknown) {
  const n = Number(value || 0);
  return Number.isFinite(n) ? n : 0;
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

function readSessionJson<T>(key: string): T | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function getDisplayNameFromUser(user: any) {
  return getLoggedInDisplayName(user);
}

function getCabTrueBaseFare(cab: any, snapshot?: CabSelectedPricingSnapshot | null) {
  return (
    toNumber(snapshot?.pricingSnapshot?.baseFare) ||
    toNumber(cab?.trueBaseFare) ||
    toNumber(cab?.cabBaseFare) ||
    toNumber(cab?.baseFare) ||
    toNumber(cab?.fare) ||
    toNumber(cab?.price) ||
    toNumber(cab?.estimatedFare) ||
    toNumber(cab?.finalPrice) ||
    toNumber(cab?.basePrice) ||
    0
  );
}

function calculateCabBenefitPricing(params: {
  baseAmount: number;
  offerAmount: number;
  nonBenefitAmount: number;
  promoCredit: number;
  earnedCredit: number;
  refundWallet: number;
}) {
  const baseAmount = Math.max(0, Math.round(params.baseAmount));
  const offerAmount = Math.max(
    0,
    Math.min(Math.round(params.offerAmount), baseAmount)
  );

  const baseAfterOffer = Math.max(0, baseAmount - offerAmount);
  const nonBenefitAmount = Math.max(0, Math.round(params.nonBenefitAmount));

  const promoCap = Math.floor(baseAfterOffer * 0.05);
  const earnedCap = Math.floor(baseAfterOffer * 0.1);
  const combinedCap = Math.floor(baseAfterOffer * 0.12);

  const promoUsed = Math.min(
    Math.max(0, Math.round(params.promoCredit)),
    promoCap,
    combinedCap
  );

  const earnedUsed = Math.min(
    Math.max(0, Math.round(params.earnedCredit)),
    earnedCap,
    Math.max(0, combinedCap - promoUsed)
  );

  const totalBeforeRefundWallet =
    baseAfterOffer + nonBenefitAmount - promoUsed - earnedUsed;

  const refundUsed = Math.min(
    Math.max(0, Math.round(params.refundWallet)),
    Math.max(0, totalBeforeRefundWallet)
  );

  const totalBeforeWallet = baseAfterOffer + nonBenefitAmount;
  const finalPayable = Math.max(0, totalBeforeRefundWallet - refundUsed);
  const earnedOnThisBooking = Math.floor(baseAfterOffer * 0.02);

  return {
    baseAmount,
    offerAmount,
    baseAfterOffer,
    nonBenefitAmount,
    totalBeforeWallet,
    promoUsed,
    earnedUsed,
    refundUsed,
    totalWalletUsed: promoUsed + earnedUsed + refundUsed,
    finalPayable,
    earnedOnThisBooking,
  };
}

export default function CabBookingPageClient({ cab, searchMeta }: Props) {
  const router = useRouter();

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600);
  const [selectedAddons, setSelectedAddons] = useState<CabBookingAddon[]>([]);
  const [appliedOffer, setAppliedOffer] = useState<CabOfferItem | null>(null);
  const [selectedPricingSnapshot, setSelectedPricingSnapshot] =
    useState<CabSelectedPricingSnapshot | null>(null);

  const [activeUser, setActiveUser] = useState<any>(null);
  const [wallet, setWallet] = useState({
    promoCredit: 0,
    earnedCredit: 0,
    refundableBalance: 0,
  });

  useEffect(() => {
    const stored = readSessionJson<CabSelectedPricingSnapshot>(
      "tplCabSelectedPricingSnapshot"
    );

    if (stored?.cabId && cab?.id && stored.cabId === cab.id) {
      setSelectedPricingSnapshot(stored);
    }
  }, [cab?.id]);

  const safeSearchMeta: CabResultSearchMeta = useMemo(() => {
    return {
      rideType:
  (searchMeta?.rideType ??
    cab?.rideType ??
    "outstationOneWay") as CabResultSearchMeta["rideType"],
      from: searchMeta?.from || "",
      to: searchMeta?.to || "",
      pickup: searchMeta?.pickup || "",
      drop: searchMeta?.drop || "",
      departureDate: searchMeta?.departureDate || "",
      returnDate: searchMeta?.returnDate || "",
      pickupDate: searchMeta?.pickupDate || "",
      pickupTime: searchMeta?.pickupTime || "",
      dropTime: searchMeta?.dropTime || "",
      stops: searchMeta?.stops || [],
      rentalPackage: searchMeta?.rentalPackage || "",
      rentalVehicleType: searchMeta?.rentalVehicleType || "",
    };
  }, [cab?.rideType, searchMeta]);

  const [traveller, setTraveller] = useState({
    pickupLocation: searchMeta?.pickup || searchMeta?.from || "",
    fullName: "",
    gender: "",
    mobile: "",
    email: "",
    usePickupAsBillingAddress: true,
  });

  useEffect(() => {
    const syncUserAndWallet = () => {
      const user = getActiveUser();
      setActiveUser(user);

      if (!user?.mobile) {
        setWallet({
          promoCredit: 0,
          earnedCredit: 0,
          refundableBalance: 0,
        });
        return;
      }

      const profile = getSavedProfile(user.mobile);
      const displayName = getDisplayNameFromUser(user);

      setWallet(getWallet(user.mobile));

      setTraveller((prev) => ({
        ...prev,
        fullName: prev.fullName || displayName,
        mobile:
          prev.mobile ||
          String(user.mobile || "").replace(/\D/g, "").slice(0, 10),
        email: prev.email || user.email || profile.email || "",
      }));
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
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const timerLabel = useMemo(() => {
    const mm = String(Math.floor(timeLeft / 60)).padStart(2, "0");
    const ss = String(timeLeft % 60).padStart(2, "0");
    return `${mm}:${ss}`;
  }, [timeLeft]);

  const data = useMemo(() => {
    if (!cab) return null;
    return buildCabBookingPageData(cab, safeSearchMeta);
  }, [cab, safeSearchMeta]);

  const errors = useMemo(
    () =>
      validateCabTravellerDetails({
        pickupLocation: traveller.pickupLocation,
        fullName: traveller.fullName,
        gender: traveller.gender,
        mobile: traveller.mobile,
        email: traveller.email,
      }),
    [traveller]
  );

  const canProceed = Object.keys(errors).length === 0 && timeLeft > 0;

  const blockerMessage =
    timeLeft <= 0
      ? "Session expired. Please go back and select cab again."
      : Object.keys(errors).length > 0
      ? "Please fill all required traveller details."
      : "";

  const cabBaseFare = useMemo(() => {
    if (!cab) return 0;
    return getCabTrueBaseFare(cab, selectedPricingSnapshot);
  }, [cab, selectedPricingSnapshot]);

  const estimatedBookingValue = cabBaseFare || 1500;

  const smartActiveOffer = getSmartActiveOfferItem();

  const smartMappedOffer =
    smartActiveOffer && !appliedOffer
      ? {
          code: smartActiveOffer.couponCode || smartActiveOffer.slug,
          title: smartActiveOffer.title,
          description:
            smartActiveOffer.description ||
            smartActiveOffer.subtitle ||
            "Smart cab offer applied.",
          discountAmount: calculateSmartOfferDiscount(
            smartActiveOffer,
            estimatedBookingValue
          ),
        }
      : null;

  const finalSelectedOffer = appliedOffer || smartMappedOffer;

  const appliedOfferDiscount = Math.min(
    cabBaseFare,
    toNumber(finalSelectedOffer?.discountAmount)
  );

  const rawFare = useMemo(() => {
    if (!cab) return null;
    return buildCabBookingFare(cab, selectedAddons, appliedOfferDiscount, 0);
  }, [cab, selectedAddons, appliedOfferDiscount]);

  const nonBenefitAmount = useMemo(() => {
    if (!rawFare) return 0;

    const rawTotal = toNumber(rawFare.totalPayable);
    const baseAfterOffer = Math.max(0, cabBaseFare - appliedOfferDiscount);

    return Math.max(0, rawTotal - baseAfterOffer);
  }, [rawFare, cabBaseFare, appliedOfferDiscount]);

  const benefitPricing = useMemo(() => {
    return calculateCabBenefitPricing({
      baseAmount: cabBaseFare,
      offerAmount: appliedOfferDiscount,
      nonBenefitAmount,
      promoCredit: wallet.promoCredit,
      earnedCredit: wallet.earnedCredit,
      refundWallet: wallet.refundableBalance,
    });
  }, [
    cabBaseFare,
    appliedOfferDiscount,
    nonBenefitAmount,
    wallet.promoCredit,
    wallet.earnedCredit,
    wallet.refundableBalance,
  ]);

  const totalBeforeWallet = benefitPricing.totalBeforeWallet;

  const tplCredit = benefitPricing.totalWalletUsed;

  const fare = rawFare
    ? {
        ...rawFare,

        baseFare: benefitPricing.baseAmount,
        baseAmount: benefitPricing.baseAmount,
        cabBaseFare: benefitPricing.baseAmount,

        appliedOfferAmount: benefitPricing.offerAmount,
        appliedOfferCode: finalSelectedOffer?.code || "",
        appliedOfferTitle: finalSelectedOffer?.title || "",
        offerData: finalSelectedOffer,

        baseAfterOffer: benefitPricing.baseAfterOffer,
        nonBenefitAmount: benefitPricing.nonBenefitAmount,
        totalBeforeWallet: benefitPricing.totalBeforeWallet,

        tplCredit,
        walletDiscount: tplCredit,
        totalPayable: benefitPricing.finalPayable,
        finalPayable: benefitPricing.finalPayable,

        earnedOnThisBooking: benefitPricing.earnedOnThisBooking,
        pricingRule: "CAB_BASE_ONLY_BENEFIT_V1",
      }
    : null;

  function handleTravellerChange(field: string, value: string | boolean) {
    setTraveller((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function handleApplyOffer(offer: CabOfferItem) {
    setAppliedOffer(offer);
  }

  function handleRemoveOffer() {
    setAppliedOffer(null);
  }

  function handleProceedToPayment() {
    if (!canProceed || !cab || !data || !fare) return;

    const paymentPayload = {
      serviceType: "cab",
      bookingType: "cab",
      bookingStatus: "draft",
      paymentStatus: "pending",

      cab,
      searchMeta: safeSearchMeta,
      traveller,
      selectedAddons,

      appliedOffer: finalSelectedOffer,
      appliedOfferCode: finalSelectedOffer?.code || "",
      appliedOfferTitle: finalSelectedOffer?.title || "",
      appliedOfferAmount: benefitPricing.offerAmount,
      offerData: finalSelectedOffer,

      fare,
      bookingData: data,

      pricingRule: "CAB_BASE_ONLY_BENEFIT_V1",
      benefitPricing: {
        baseAmount: benefitPricing.baseAmount,
        baseAfterOffer: benefitPricing.baseAfterOffer,
        offerAmount: benefitPricing.offerAmount,
        nonBenefitAmount: benefitPricing.nonBenefitAmount,
        totalBeforeWallet: benefitPricing.totalBeforeWallet,
        finalPayable: benefitPricing.finalPayable,
      },

      walletBreakdown: {
        promoUsed: benefitPricing.promoUsed,
        earnedUsed: benefitPricing.earnedUsed,
        refundUsed: benefitPricing.refundUsed,
        promoAvailable: wallet.promoCredit,
        earnedAvailable: wallet.earnedCredit,
        refundWalletAvailable: wallet.refundableBalance,
        totalWalletUsed: benefitPricing.totalWalletUsed,
        earnedOnThisBooking: benefitPricing.earnedOnThisBooking,
      },

      originalBookingBaseline: {
        amount: fare.totalPayable,
        payableAmount: fare.totalPayable,
        totalBeforeWallet,
        baseFare: benefitPricing.baseAmount,
        baseAfterOffer: benefitPricing.baseAfterOffer,
        appliedOfferAmount: benefitPricing.offerAmount,
        nonBenefitAmount: benefitPricing.nonBenefitAmount,
        taxesAndFees: fare.taxesAndFees,
        specialRequestTotal: fare.specialRequestTotal || 0,
      },

      manageBookingReady: true,
      timerLeft: timeLeft,
      timestamp: Date.now(),
    };

    sessionStorage.setItem("tplCabPaymentData", JSON.stringify(paymentPayload));

    router.push("/cab/payment");
  }

  if (!cab || !data || !fare) {
    return (
      <main className="min-h-screen overflow-x-hidden bg-[#f5f7fb] text-black">
        <div className="bg-[#f5f7fb] px-3 pt-3 lg:hidden">
          <MobileInnerBack title="Cab Booking" />
        </div>
        <CabBookingTopBar timerLabel="10:00" />
        <div className="mx-auto max-w-[1400px] px-3 py-4 md:px-4 md:py-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-[18px] font-bold text-slate-700">
            No booking data found.
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f5f7fb] pb-5 text-black">
      <div className="bg-[#f5f7fb] px-3 pt-3 lg:hidden">
        <MobileInnerBack title="Cab Booking" />
      </div>
      <CabBookingTopBar timerLabel={timerLabel} />

      <div className="mx-auto max-w-[1400px] px-3 py-4 md:px-4 md:py-6">
        <div className="flex flex-col items-stretch gap-4 lg:flex-row lg:items-start lg:gap-5">
          <div className="flex w-full min-w-0 flex-col gap-4 lg:w-[74%] lg:gap-5">
            <div className="order-1">
              <CabBookingDetailCard data={data} />
            </div>

            <section className="order-2 rounded-2xl border border-[#f3d7c7] bg-[#fff7ed] px-4 py-4 shadow-sm sm:px-5 sm:py-3">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="text-[15px] font-extrabold text-slate-900">
                    {activeUser?.mobile
                      ? `Logged in as ${getDisplayNameFromUser(activeUser)}`
                      : "Login Now to avail exciting offers"}
                  </div>

                  <div className="mt-1 text-[12px] font-semibold text-slate-600">
                    {activeUser?.mobile
                      ? "Saved traveller details and wallet benefits can be used for faster booking."
                      : "Login to use saved traveller details, Promo Credit, Earned Credit and Refund Wallet."}
                  </div>
                </div>

                {!activeUser?.mobile ? (
                  <button
                    type="button"
                    onClick={() => setShowLoginModal(true)}
                    className="h-[44px] w-full rounded-xl border border-slate-300 bg-white px-5 text-[13px] font-extrabold text-slate-900 transition hover:border-sky-400 hover:text-sky-600 sm:h-[40px] sm:w-auto"
                  >
                    LOGIN
                  </button>
                ) : null}
              </div>
            </section>

            <div className="order-3">
              <CabBookingSection title="Traveller Details" defaultOpen>
                <CabBookingTravellerForm
                  values={traveller}
                  errors={errors}
                  onChange={handleTravellerChange}
                />
              </CabBookingSection>
            </div>

            <div className="order-6 lg:order-4">
              <CabBookingSection title="Special Requests">
                <CabBookingSpecialRequests
                  items={data.specialRequests}
                  onChange={setSelectedAddons}
                />
              </CabBookingSection>
            </div>

            <div className="order-4 lg:order-5">
              <CabBookingSection title="Inclusions">
                <CabBookingInclusions data={data} />
              </CabBookingSection>
            </div>

            <div className="order-5 lg:hidden">
              <CabBookingOffers
                appliedOfferCode={finalSelectedOffer?.code || ""}
                bookingValue={estimatedBookingValue}
                onApplyOffer={handleApplyOffer as any}
                onRemoveOffer={handleRemoveOffer}
              />
            </div>

            <div className="order-7 lg:order-6">
              <CabBookingSection title="Policies">
                <CabBookingPolicies data={data} />
              </CabBookingSection>
            </div>

            <div className="order-8 lg:order-7">
              <CabBookingSection title="User Reviews">
                <CabBookingReviews data={data} />
              </CabBookingSection>
            </div>
          </div>

          <div className="w-full min-w-0 self-start lg:w-[26%]">
            <div className="space-y-4 lg:sticky lg:top-24">
              <CabBookingFareSummary
                fare={fare}
                canProceed={canProceed}
                blockerMessage={blockerMessage}
                appliedOfferCode={finalSelectedOffer?.code || ""}
                appliedOfferTitle={finalSelectedOffer?.title || ""}
                walletBreakdown={{
                  promoUsed: benefitPricing.promoUsed,
                  earnedUsed: benefitPricing.earnedUsed,
                  refundUsed: benefitPricing.refundUsed,
                }}
                earnedOnThisBooking={benefitPricing.earnedOnThisBooking}
                refundWalletAvailable={wallet.refundableBalance}
                useRefundWallet={true}
                onProceed={handleProceedToPayment}
              />

              <div className="hidden lg:block">
                <CabBookingOffers
                  appliedOfferCode={finalSelectedOffer?.code || ""}
                  bookingValue={estimatedBookingValue}
                  onApplyOffer={handleApplyOffer as any}
                  onRemoveOffer={handleRemoveOffer}
                />
              </div>
            </div>
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
