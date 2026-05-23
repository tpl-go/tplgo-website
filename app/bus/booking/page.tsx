"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import BusBookingTopBar from "@/app/components/booking/bus/BusBookingTopBar";
import BusBookingSummaryCard from "@/app/components/booking/bus/BusBookingSummaryCard";
import BusTravellerDetailsSection from "@/app/components/booking/bus/BusTravellerDetailsSection";
import BusContactDetailsSection from "@/app/components/booking/bus/BusContactDetailsSection";
import BusTripAssuredSection from "@/app/components/booking/bus/BusTripAssuredSection";
import BusFreeCancellationSection from "@/app/components/booking/bus/BusFreeCancellationSection";
import BusBookingFareSummaryCard from "@/app/components/booking/bus/BusBookingFareSummaryCard";
import BusBookingOffersSection from "@/app/components/booking/bus/BusBookingOffersSection";
import BusPoliciesModal from "@/app/components/booking/bus/BusPoliciesModal";
import LoginModal from "@/app/components/common/LoginModal";

import {
  getSmartActiveOfferItem,
} from "@/app/lib/smartOffers";

import {
  areTravellersValid,
  buildBusBookingPageState,
  calculateBusSeatPricing,
  getBusBookingPayload,
  isContactValid,
} from "@/app/lib/bus/busBookingHelpers";

import type {
  BusBookingPageState,
  BusOfferItem,
} from "@/app/lib/bus/busBookingTypes";

import { applyBenefitPricing } from "@/app/lib/pricing/applyBenefitPricing";
import { getWallet } from "@/app/lib/wallet/walletStorage";
import { AUTH_UPDATED_EVENT } from "@/app/lib/booking/guestAuth";
import { getSavedProfile } from "@/app/lib/account/profileStorage";

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

  if (profileName && profileName.toLowerCase() !== "pk") {
    return profileName;
  }

  return `User ${String(user.mobile).slice(-4)}`;
}

function getOfferCode(offer: any) {
  return (
    offer?.code ||
    offer?.couponCode ||
    offer?.offerCode ||
    offer?.slug ||
    offer?.offer?.code ||
    offer?.offer?.couponCode ||
    offer?.offer?.slug ||
    ""
  );
}

function getOfferTitle(offer: any) {
  return (
    offer?.title ||
    offer?.offerTitle ||
    offer?.offer?.title ||
    "Best Bus Offer Activated"
  );
}

function getOfferDiscountAmount(offer: any, baseAmount: number) {
  if (!offer || baseAmount <= 0) return 0;

  const minBookingValue = Number(
    offer?.rule?.minBookingValue ||
      offer?.minBookingValue ||
      offer?.offer?.rule?.minBookingValue ||
      offer?.offer?.minBookingValue ||
      0
  );

  if (minBookingValue > 0 && baseAmount < minBookingValue) {
    return 0;
  }

  const discountMode = String(
    offer?.discountMode || offer?.offer?.discountMode || ""
  ).toLowerCase();

  const discountValue = Number(
    offer?.discountValue ||
      offer?.offer?.discountValue ||
      offer?.discountAmount ||
      offer?.appliedOfferAmount ||
      offer?.offerDiscount ||
      offer?.offer?.discountAmount ||
      offer?.offer?.appliedOfferAmount ||
      offer?.offer?.offerDiscount ||
      0
  );

  const maxDiscount = Number(
    offer?.maxDiscount ||
      offer?.offer?.maxDiscount ||
      discountValue ||
      0
  );

  let discount = 0;

  if (discountMode === "percent") {
    discount = Math.round((baseAmount * discountValue) / 100);
  } else {
    discount = Math.round(discountValue);
  }

  if (maxDiscount > 0) {
    discount = Math.min(discount, maxDiscount);
  }

  return Math.min(Math.max(discount, 0), baseAmount);
}

export default function BusBookingPage() {
  const router = useRouter();

  const [pageState, setPageState] = useState<BusBookingPageState | null>(null);
  const [showPolicies, setShowPolicies] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const [activeUser, setActiveUser] = useState<any>(null);
  const [wallet, setWallet] = useState({
    promoCredit: 0,
    earnedCredit: 0,
    refundableBalance: 0,
  });

  useEffect(() => {
    const payload = getBusBookingPayload();
    if (!payload) return;

    setPageState(buildBusBookingPageState(payload));
  }, []);

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
    if (!pageState) return;
    if (pageState.timerLeft <= 0) return;

    const timer = setInterval(() => {
      setPageState((prev) =>
        prev
          ? {
              ...prev,
              timerLeft: prev.timerLeft - 1,
            }
          : prev
      );
    }, 1000);

    return () => clearInterval(timer);
  }, [pageState]);

  const timerLabel = useMemo(() => {
    if (!pageState) return "10:00";
    const mm = String(Math.floor(pageState.timerLeft / 60)).padStart(2, "0");
    const ss = String(pageState.timerLeft % 60).padStart(2, "0");
    return `${mm}:${ss}`;
  }, [pageState]);

  if (!pageState) {
    return (
      <main className="min-h-screen bg-[#f5f7fb]">
        <BusBookingTopBar timerLabel="10:00" />
        <div className="mx-auto max-w-[1400px] px-4 py-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-[18px] font-bold text-slate-700">
            No booking data found.
          </div>
        </div>
      </main>
    );
  }

  const { bookingPayload, travellers, contactDetails, addons, appliedOffer } =
    pageState;

  const seatPricing = calculateBusSeatPricing(bookingPayload);

  const baseFare = seatPricing.baseFareTotal;
  const seatUpgradeTotal = seatPricing.seatUpgradeTotal;

  const taxAndSurcharge = Math.round(baseFare * 0.08);
  const discount = 0;

  const smartActiveOffer = getSmartActiveOfferItem();

  const incomingOffer =
    appliedOffer ||
    (bookingPayload as any).offerData ||
    (smartActiveOffer
      ? {
          ...smartActiveOffer,
          code: smartActiveOffer.couponCode || smartActiveOffer.slug,
          title: smartActiveOffer.title,
          description:
            smartActiveOffer.description ||
            smartActiveOffer.subtitle ||
            "Smart bus offer applied.",
        }
      : null);

  const offerApplied = getOfferDiscountAmount(incomingOffer, baseFare);

  const finalSelectedOffer = incomingOffer
    ? {
        ...incomingOffer,
        code: getOfferCode(incomingOffer),
        couponCode: getOfferCode(incomingOffer),
        title: getOfferTitle(incomingOffer),
        discountAmount: offerApplied,
        appliedOfferAmount: offerApplied,
        baseAmount: baseFare,
        baseAfterOffer: Math.max(baseFare - offerApplied, 0),
      }
    : null;

  const tripAssuredTotal = addons.tripAssuredSelected
    ? addons.tripAssuredTotal
    : 0;

  const freeCancellationTotal = addons.freeCancellationSelected
    ? addons.freeCancellationTotal
    : 0;

  const benefitPricing = applyBenefitPricing({
    baseAmount: baseFare,
    offerDiscount: offerApplied,

    taxes: taxAndSurcharge,
    seatCharges: seatUpgradeTotal,
    addOns: tripAssuredTotal + freeCancellationTotal,

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

  const tplCredit =
    walletCalc.promoUsed + walletCalc.earnedUsed + walletCalc.refundUsed;

  const finalTotal = benefitPricing.finalPayable;

  const earnedOnThisBooking = Math.floor(benefitPricing.baseAfterOffer * 0.02);

  const travellersValid = areTravellersValid(travellers);
  const contactValid = isContactValid(contactDetails);
  const canProceed = pageState.timerLeft > 0 && travellersValid && contactValid;

  let blockerMessage = "";
  if (pageState.timerLeft <= 0) {
    blockerMessage = "Session expired. Please go back and reselect seats.";
  } else if (!travellersValid) {
    blockerMessage = "Please fill all traveller details.";
  } else if (!contactValid) {
    blockerMessage = "Please fill valid contact details.";
  }

  function updateTravellers(next: typeof travellers) {
    setPageState((prev) => (prev ? { ...prev, travellers: next } : prev));
  }

  function updateContactDetails(next: typeof contactDetails) {
    setPageState((prev) => (prev ? { ...prev, contactDetails: next } : prev));
  }

  function toggleTripAssured(value: boolean) {
    setPageState((prev) =>
      prev
        ? {
            ...prev,
            addons: {
              ...prev.addons,
              tripAssuredSelected: value,
            },
          }
        : prev
    );
  }

  function toggleFreeCancellation(value: boolean) {
    setPageState((prev) =>
      prev
        ? {
            ...prev,
            addons: {
              ...prev.addons,
              freeCancellationSelected: value,
            },
          }
        : prev
    );
  }

  function applyOffer(offer: BusOfferItem) {
    setPageState((prev) => (prev ? { ...prev, appliedOffer: offer } : prev));
  }

  function removeOffer() {
    setPageState((prev) => (prev ? { ...prev, appliedOffer: null } : prev));
  }

  function handleProceed() {
    if (!canProceed) return;

    const paymentPayload = {
      serviceType: "bus",
      bookingType: "bus",
      bookingStatus: "draft",
      paymentStatus: "pending",

      bookingPayload,
      travellers,
      contactDetails,
      addons,

      appliedOffer: finalSelectedOffer,
      appliedOfferCode: finalSelectedOffer?.code || "",
      appliedOfferTitle: finalSelectedOffer?.title || "",
      offerData: finalSelectedOffer,

      pricing: {
        baseFare,
        baseAmount: baseFare,
        baseAfterOffer: benefitPricing.baseAfterOffer,

        seatUpgradeTotal,
        seatCharges: seatUpgradeTotal,

        taxAndSurcharge,
        taxes: taxAndSurcharge,

        discount,
        offerApplied,
        appliedOfferAmount: offerApplied,
        appliedOfferCode: finalSelectedOffer?.code || "",
        appliedOfferTitle: finalSelectedOffer?.title || "",
        offerData: finalSelectedOffer,

        tripAssuredTotal,
        freeCancellationTotal,
        addOns: tripAssuredTotal + freeCancellationTotal,

        grossAmount: benefitPricing.grossAmount,
        nonBenefitAmount: benefitPricing.nonBenefitAmount,
        totalBeforeWallet,

        promoUsed: walletCalc.promoUsed,
        earnedUsed: walletCalc.earnedUsed,
        refundUsed: walletCalc.refundUsed,
        tplCredit,

        finalTotal,
      },

      walletBreakdown: {
        promoUsed: walletCalc.promoUsed,
        earnedUsed: walletCalc.earnedUsed,
        refundUsed: walletCalc.refundUsed,
        promoAvailable: wallet.promoCredit,
        earnedAvailable: wallet.earnedCredit,
        refundWalletAvailable: wallet.refundableBalance,
        totalWalletUsed: tplCredit,
        earnedOnThisBooking,
      },

      originalBookingBaseline: {
        amount: finalTotal,
        payableAmount: finalTotal,
        totalBeforeWallet,

        baseFare,
        baseAmount: baseFare,
        baseAfterOffer: benefitPricing.baseAfterOffer,

        seatUpgradeTotal,
        taxAndSurcharge,
        tripAssuredTotal,
        freeCancellationTotal,

        offerApplied,
        appliedOfferCode: finalSelectedOffer?.code || "",
        selectedSeats: bookingPayload.selectedSeats,
      },

      manageBookingReady: true,
      timerLeft: pageState?.timerLeft ?? 0,
      timestamp: Date.now(),
    };

    sessionStorage.setItem("tplBusPaymentData", JSON.stringify(paymentPayload));

    router.push("/bus/payment");
  }

  return (
    <main className="min-h-screen bg-[#f5f7fb] text-black">
      <BusBookingTopBar timerLabel={timerLabel} />

      <div className="mx-auto max-w-[1400px] px-4 py-6">
        <div className="flex items-start gap-5">
          <div className="w-[74%] min-w-0 space-y-5">
            <BusBookingSummaryCard
              bus={bookingPayload.bus}
              selectedSeats={bookingPayload.selectedSeats}
              selectedBoardingPoint={bookingPayload.selectedBoardingPoint}
              selectedDroppingPoint={bookingPayload.selectedDroppingPoint}
              onViewPolicies={() => setShowPolicies(true)}
            />

            <section className="rounded-2xl border border-[#f3d7c7] bg-[#fff7ed] px-5 py-2 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-[15px] font-extrabold text-slate-900">
                    {activeUser?.mobile
                      ? `Logged in as ${getDisplayNameFromUser(activeUser)}`
                      : "Login Now to avail exciting offers"}
                  </div>

                  <div className="mt-1 text-[12px] font-semibold text-slate-600">
                    {activeUser?.mobile
                      ? "Saved traveller details and wallet benefits can be used for faster booking."
                      : "Login to use saved travellers, Promo Credit, Earned Credit and Refund Wallet."}
                  </div>
                </div>

                {!activeUser?.mobile ? (
                  <button
                    type="button"
                    onClick={() => setShowLoginModal(true)}
                    className="h-[40px] rounded-xl border border-slate-300 bg-white px-5 text-[13px] font-extrabold text-slate-900 transition hover:border-sky-400 hover:text-sky-600"
                  >
                    LOGIN
                  </button>
                ) : null}
              </div>
            </section>

            <BusTravellerDetailsSection
              travellers={travellers}
              onChange={updateTravellers}
            />

            <BusContactDetailsSection
              contactDetails={contactDetails}
              onChange={updateContactDetails}
            />

            <BusTripAssuredSection
              travellerCount={bookingPayload.travellerCount}
              selected={addons.tripAssuredSelected}
              total={addons.tripAssuredTotal}
              onToggle={toggleTripAssured}
            />

            <BusFreeCancellationSection
              selected={addons.freeCancellationSelected}
              total={addons.freeCancellationTotal}
              onToggle={toggleFreeCancellation}
            />
          </div>

          <div className="w-[26%] min-w-0 self-start">
            <BusBookingFareSummaryCard
              baseFare={baseFare}
              seatUpgradeTotal={seatUpgradeTotal}
              taxAndSurcharge={taxAndSurcharge}
              discount={discount}
              offerApplied={offerApplied}
              appliedOfferCode={finalSelectedOffer?.code || ""}
              appliedOfferTitle={finalSelectedOffer?.title || ""}
              tplCredit={tplCredit}
              walletBreakdown={{
                promoUsed: walletCalc.promoUsed,
                earnedUsed: walletCalc.earnedUsed,
                refundUsed: walletCalc.refundUsed,
              }}
              earnedOnThisBooking={earnedOnThisBooking}
              refundWalletAvailable={wallet.refundableBalance}
              useRefundWallet={true}
              tripAssuredTotal={tripAssuredTotal}
              freeCancellationTotal={freeCancellationTotal}
              finalTotal={finalTotal}
              canProceed={canProceed}
              blockerMessage={blockerMessage}
              onProceed={handleProceed}
            />

            <div className="mt-4">
              <BusBookingOffersSection
                appliedOfferCode={finalSelectedOffer?.code || ""}
                bookingValue={baseFare}
                onApplyOffer={applyOffer}
                onRemoveOffer={removeOffer}
              />
            </div>
          </div>
        </div>
      </div>

      <BusPoliciesModal
        open={showPolicies}
        onClose={() => setShowPolicies(false)}
      />

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </main>
  );
}