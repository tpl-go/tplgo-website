"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import LoginModal from "@/app/components/common/LoginModal";

import InsuranceBookingHeader from "@/app/components/booking/insurance/InsuranceBookingHeader";

import InsuranceTravellerForm, {
  createInsuranceTravellersFromAges,
  type InsuranceTraveller,
} from "@/app/components/booking/insurance/InsuranceTravellerForm";

import InsuranceNomineeForm, {
  type InsuranceNominee,
} from "@/app/components/booking/insurance/InsuranceNomineeForm";

import InsuranceMedicalDeclaration, {
  type InsuranceMedicalDeclarationData,
} from "@/app/components/booking/insurance/InsuranceMedicalDeclaration";

import InsuranceAddOns, {
  defaultInsuranceAddOns,
  type InsuranceAddOnsState,
} from "@/app/components/booking/insurance/InsuranceAddOns";

import InsuranceFareSummary from "@/app/components/booking/insurance/InsuranceFareSummary";
import InsuranceBookingOffersSection from "@/app/components/booking/insurance/InsuranceBookingOffersSection";

import { InsurancePlan } from "@/app/lib/insurance/insuranceDummyData";

import { getWallet } from "@/app/lib/wallet/walletStorage";
import { getSavedProfile } from "@/app/lib/account/profileStorage";
import { getLoggedInDisplayName } from "@/app/lib/auth/displayName";
import { applyBenefitPricing } from "@/app/lib/pricing/applyBenefitPricing";
import {
  calculateSmartOfferDiscount,
  getSmartActiveOfferItem,
} from "@/app/lib/smartOffers";

type InsurancePlanWithPricing = InsurancePlan & {
  originalPremium?: number;
  pricingSnapshot?: PricingSnapshot;
  benefitPricing?: PricingSnapshot | null;
  baseAfterOffer?: number;
  nonBenefitAmount?: number;
  grossAmount?: number;
  appliedOfferAmount?: number;
  appliedOfferCode?: string;
  appliedOfferTitle?: string;
  promoUsed?: number;
  earnedUsed?: number;
  refundUsed?: number;
  tplCreditUsed?: number;
  payableBeforeRefundWallet?: number;
  finalPayable?: number;
  earnedOnThisBooking?: number;
  finalTotal?: number;
};

type PricingSnapshot = Record<string, unknown>;

type SmartOffer = {
  service?: string;
  code?: string;
  couponCode?: string;
  offerCode?: string;
  slug?: string;
  title?: string;
  name?: string;
  offerTitle?: string;
  description?: string;
  subtitle?: string;
  discountAmount?: number;
};

type ActiveUser = {
  name: string;
  email: string;
  mobile: string;
};

type InsuranceSearchData = {
  destination?: string;
  insuranceType?: string;
  travellerAges?: string[];
  [key: string]: unknown;
};

type InsurancePlanChargeExtras = {
  gst?: number;
  taxes?: number;
  medicalSurcharge?: number;
  adventureSportsAddon?: number;
  adventureSportsCharge?: number;
  seniorCitizenSurcharge?: number;
  convenienceFee?: number;
  gatewayFee?: number;
  markup?: number;
  visaLinkedSurcharge?: number;
};

type BookingPayload = {
  plan: InsurancePlanWithPricing;
  search?: InsuranceSearchData;
  selectedAt?: string;
  pricingSnapshot?: PricingSnapshot;
  benefitPricing?: PricingSnapshot | null;
  baseAfterOffer?: number;
  nonBenefitAmount?: number;
  grossAmount?: number;
  appliedOfferAmount?: number;
  appliedOfferCode?: string;
  appliedOfferTitle?: string;
  promoUsed?: number;
  earnedUsed?: number;
  refundUsed?: number;
  tplCreditUsed?: number;
  payableBeforeRefundWallet?: number;
  finalPayable?: number;
  earnedOnThisBooking?: number;
  finalTotal?: number;
};

type InsuranceOfferItem = {
  code: string;
  title: string;
  description?: string;
  discountAmount: number;
};

const insuranceAddOnPricing: Record<string, number> = {
  adventureCover: 899,
  cruiseCover: 699,
  gadgetCover: 499,
  tripCancellation: 999,
  flightDelay: 349,
  baggageLoss: 399,
  covidUpgrade: 599,
};

function toAmount(value: unknown, fallback = 0) {
  const amount = Number(value);
  return Number.isFinite(amount) && amount > 0 ? Math.round(amount) : fallback;
}

function resolveUsedAmount(
  source: PricingSnapshot | null,
  keys: string[],
  fallback = 0
) {
  for (const key of keys) {
    const value = Number(source?.[key]);

    if (Number.isFinite(value) && value > 0) {
      return Math.round(value);
    }
  }

  return Math.round(Math.max(0, fallback));
}

function getActiveUser() {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem("tpl_auth_session_v1");
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    const user = parsed?.user || parsed;

    const mobile = user?.mobile || user?.phone || user?.phoneNumber || "";

    const savedProfile = mobile ? getSavedProfile(mobile) : null;

    const resolvedName =
      user?.name ||
      user?.fullName ||
      user?.full_name ||
      user?.displayName ||
      user?.username ||
      `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
      savedProfile?.fullName ||
      savedProfile?.name ||
      `${savedProfile?.firstName || ""} ${savedProfile?.lastName || ""}`.trim();

    return {
      name: resolvedName || "",
      email: user?.email || savedProfile?.email || "",
      mobile,
    };
  } catch {
    return null;
  }
}

function getPlanPricingBase(plan?: InsurancePlanWithPricing | null) {
  const snapshot = plan?.pricingSnapshot || {};
  const chargePlan = plan as
    | (InsurancePlanWithPricing & InsurancePlanChargeExtras)
    | null
    | undefined;

  const snapshotBase = toAmount(
    snapshot.baseAmount || snapshot.premium || plan?.originalPremium,
    0
  );

  if (snapshotBase > 0) {
    const gstAmount = toAmount(
      snapshot.gstAmount || snapshot.gst || snapshot.taxes,
      Math.round(snapshotBase * 0.18)
    );

    return {
      basePremium: snapshotBase,
      gstAmount,
    };
  }

  const premiumValue = toAmount(plan?.originalPremium || plan?.premium, 0);
  const explicitGst = toAmount(
      snapshot.gstAmount ||
      snapshot.gst ||
      snapshot.taxes ||
      chargePlan?.gst ||
      chargePlan?.taxes,
    0
  );

  if (explicitGst > 0) {
    return {
      basePremium: Math.max(premiumValue - explicitGst, 0),
      gstAmount: explicitGst,
    };
  }

  const basePremium = Math.round(premiumValue / 1.18);
  const gstAmount = Math.max(premiumValue - basePremium, 0);

  return {
    basePremium,
    gstAmount,
  };
}

function getOfferIdentity(offer: SmartOffer | null) {
  return {
    code: offer?.code || offer?.couponCode || offer?.offerCode || offer?.slug || "",
    title: offer?.title || offer?.name || offer?.offerTitle || "",
    description:
      offer?.description ||
      offer?.subtitle ||
      "Smart insurance offer applied.",
  };
}

function buildPricing({
  plan,
  addOnTotal,
  selectedOffer,
  wallet,
  hasUser,
}: {
  plan: InsurancePlanWithPricing;
  addOnTotal: number;
  selectedOffer: SmartOffer | null;
  wallet: {
    promoCredit: number;
    earnedCredit: number;
    refundableBalance: number;
  };
  hasUser: boolean;
}) {
  const { basePremium, gstAmount } = getPlanPricingBase(plan);
  const chargePlan = (plan ?? {}) as Partial<
    InsurancePlanWithPricing & InsurancePlanChargeExtras
  >;

  const medicalSurcharge = toAmount(chargePlan.medicalSurcharge ?? 0, 0);
  const adventureSportsAddon = toAmount(
    chargePlan.adventureSportsAddon ?? chargePlan.adventureSportsCharge ?? 0,
    0
  );
  const seniorCitizenSurcharge = toAmount(
    chargePlan.seniorCitizenSurcharge ?? 0,
    0
  );
  const convenienceFee = toAmount(chargePlan.convenienceFee ?? 0, 0);
  const gatewayFee = toAmount(chargePlan.gatewayFee ?? 0, 0);
  const markup = toAmount(chargePlan.markup ?? 0, 0);
  const visaLinkedSurcharge = toAmount(chargePlan.visaLinkedSurcharge ?? 0, 0);

  const nonBenefitAmount =
    gstAmount +
    addOnTotal +
    medicalSurcharge +
    adventureSportsAddon +
    seniorCitizenSurcharge +
    convenienceFee +
    gatewayFee +
    markup +
    visaLinkedSurcharge;

  const offerIdentity = getOfferIdentity(selectedOffer);

  let benefitPricing: PricingSnapshot | null = null;

  try {
    benefitPricing = applyBenefitPricing({
      baseAmount: basePremium,
      nonBenefitAmount,
      offerData: selectedOffer,
      wallet: hasUser
        ? {
            promoCredit: wallet.promoCredit,
            earnedCredit: wallet.earnedCredit,
            refundableBalance: wallet.refundableBalance,
            refundWallet: wallet.refundableBalance,
          }
        : null,
      allowPromoCredit: Boolean(hasUser),
      allowEarnedCredit: Boolean(hasUser),
      allowRefundWallet: Boolean(hasUser),
    });
  } catch {
    benefitPricing = null;
  }

  const smartOfferDiscount = selectedOffer
    ? calculateSmartOfferDiscount(selectedOffer, basePremium)
    : 0;

  const rawOfferDiscount = toAmount(
    selectedOffer?.discountAmount ||
      benefitPricing?.appliedOfferAmount ||
      benefitPricing?.offerDiscount ||
      benefitPricing?.couponDiscount ||
      benefitPricing?.discountAmount ||
      smartOfferDiscount,
    0
  );

  const appliedOfferAmount = Math.min(rawOfferDiscount, basePremium);
  const baseAfterOffer = Math.max(basePremium - appliedOfferAmount, 0);

  const promoCap = Math.round(baseAfterOffer * 0.05);
  const earnedCap = Math.round(baseAfterOffer * 0.1);
  const tplCreditCap = Math.round(baseAfterOffer * 0.12);

  const fallbackPromoUsed = hasUser
    ? Math.min(wallet.promoCredit, promoCap, tplCreditCap)
    : 0;

  const fallbackEarnedUsed = hasUser
    ? Math.min(
        wallet.earnedCredit,
        earnedCap,
        Math.max(tplCreditCap - fallbackPromoUsed, 0)
      )
    : 0;

  const promoUsed = hasUser
  ? resolveUsedAmount(
      benefitPricing,
      ["promoUsed", "tplPromoUsed", "promoCreditUsed"],
      fallbackPromoUsed
    )
  : 0;

const earnedUsed = hasUser
  ? resolveUsedAmount(
      benefitPricing,
      ["earnedUsed", "tplEarnedUsed", "earnedCreditUsed"],
      Math.min(fallbackEarnedUsed, Math.max(tplCreditCap - promoUsed, 0))
    )
  : 0;

const tplCreditUsed = Math.min(promoUsed + earnedUsed, tplCreditCap);

const payableBeforeRefundWallet = Math.max(
  baseAfterOffer + nonBenefitAmount - tplCreditUsed,
  0
);

const refundUsed = hasUser
  ? resolveUsedAmount(
      benefitPricing,
      ["refundUsed", "refundWalletUsed", "refundableUsed"],
      Math.min(wallet.refundableBalance, payableBeforeRefundWallet)
    )
  : 0;

  const finalPayable = Math.max(payableBeforeRefundWallet - refundUsed, 0);
  const earnedOnThisBooking = Math.round(baseAfterOffer * 0.02);
  const grossAmount = basePremium + nonBenefitAmount;
  const totalBeforeWallet = baseAfterOffer + nonBenefitAmount;

  return {
    benefitPricing,
    pricingSnapshot: {
      baseAmount: basePremium,
      basePremium,
      gst: gstAmount,
      gstAmount,
      addOnTotal,
      medicalSurcharge,
      adventureSportsAddon,
      seniorCitizenSurcharge,
      convenienceFee,
      gatewayFee,
      markup,
      visaLinkedSurcharge,
      nonBenefitAmount,
      grossAmount,
      appliedOfferAmount,
      appliedOfferCode: offerIdentity.code,
      appliedOfferTitle: offerIdentity.title,
      baseAfterOffer,
      promoUsed,
      earnedUsed,
      refundUsed,
      tplCreditUsed,
      payableBeforeRefundWallet,
      finalPayable,
      earnedOnThisBooking,
      finalTotal: finalPayable,
    },
    basePremium,
    gstAmount,
    addOnTotal,
    nonBenefitAmount,
    grossAmount,
    appliedOfferAmount,
    appliedOfferCode: offerIdentity.code,
    appliedOfferTitle: offerIdentity.title,
    baseAfterOffer,
    totalBeforeWallet,
    promoUsed,
    earnedUsed,
    refundUsed,
    tplCreditUsed,
    payableBeforeRefundWallet,
    finalPayable,
    earnedOnThisBooking,
    finalTotal: finalPayable,
  };
}

export default function InsuranceBookingPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [activeUser, setActiveUser] = useState<ActiveUser | null>(null);

  const [payload, setPayload] = useState<BookingPayload | null>(null);
  const [travellers, setTravellers] = useState<InsuranceTraveller[]>([]);
  const [manualAppliedOffer, setManualAppliedOffer] =
    useState<InsuranceOfferItem | null>(null);

  const [nominee, setNominee] = useState<InsuranceNominee>({
    fullName: "",
    relationship: "",
    dob: "",
    mobile: "",
    email: "",
    address: "",
  });

  const [medicalDeclaration, setMedicalDeclaration] =
    useState<InsuranceMedicalDeclarationData>({
      hasMedicalCondition: false,
      medicalConditions: "",
      takingMedication: false,
      medicationDetails: "",
      recentHospitalization: false,
      hospitalizationDetails: "",
      doctorConsultationRequired: false,
    });

  const [addOns, setAddOns] =
    useState<InsuranceAddOnsState>(defaultInsuranceAddOns);

  const [wallet, setWallet] = useState({
    promoCredit: 0,
    earnedCredit: 0,
    refundableBalance: 0,
  });

  useEffect(() => {
    const loadUserAndWallet = () => {
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

    loadUserAndWallet();

    const interval = window.setInterval(loadUserAndWallet, 800);

    window.addEventListener("storage", loadUserAndWallet);
    window.addEventListener("focus", loadUserAndWallet);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("storage", loadUserAndWallet);
      window.removeEventListener("focus", loadUserAndWallet);
    };
  }, []);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("tplInsuranceSearchData");

      if (!stored) {
        router.push("/insurance/results");
        return;
      }

      const parsed: BookingPayload = JSON.parse(stored);

      setPayload(parsed);

      const travellerAges = parsed?.search?.travellerAges || [];

      setTravellers(createInsuranceTravellersFromAges(travellerAges));

      const user = getActiveUser();

      if (user) {
        setNominee((prev) => ({
          ...prev,
          fullName: user?.name || "",
          mobile: user?.mobile || "",
          email: user?.email || "",
        }));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  const isPassportRequired = useMemo(() => {
    const destination = String(payload?.search?.destination || "").toLowerCase();
    const insuranceType = String(
      payload?.search?.insuranceType || ""
    ).toLowerCase();

    return (
      insuranceType.includes("international") ||
      insuranceType.includes("visa") ||
      insuranceType.includes("student") ||
      destination.includes("schengen") ||
      (!destination.includes("domestic") && !destination.includes("india"))
    );
  }, [payload]);

  const travellerValidation = useMemo(() => {
    return travellers.every((traveller) => {
      const basicValid =
        traveller.firstName &&
        traveller.lastName &&
        traveller.gender &&
        traveller.age;

      if (!basicValid) return false;

      if (isPassportRequired) {
        return traveller.passportNumber && traveller.passportExpiry;
      }

      return true;
    });
  }, [travellers, isPassportRequired]);

  const nomineeValidation = useMemo(() => {
    return nominee.fullName && nominee.relationship && nominee.mobile;
  }, [nominee]);

  const addOnTotal = useMemo(() => {
    return Object.entries(addOns).reduce((sum, [key, enabled]) => {
      if (!enabled) return sum;
      return sum + Number(insuranceAddOnPricing[key] || 0);
    }, 0);
  }, [addOns]);

  const smartActiveOffer = getSmartActiveOfferItem();

  const planBasePricing = useMemo(() => {
    return getPlanPricingBase(payload?.plan || null);
  }, [payload?.plan]);

  const smartMappedOffer = useMemo<InsuranceOfferItem | null>(() => {
    if (!smartActiveOffer || manualAppliedOffer) return null;

    const service = String(smartActiveOffer.service || "").toLowerCase();

    if (service && service !== "insurance" && service !== "all") return null;

    const pricing = buildPricing({
      plan: payload?.plan as InsurancePlanWithPricing,
      addOnTotal,
      selectedOffer: smartActiveOffer,
      wallet,
      hasUser: Boolean(activeUser),
    });

    if (!pricing.appliedOfferAmount || pricing.appliedOfferAmount <= 0) {
      return null;
    }

    return {
      code: smartActiveOffer.couponCode || smartActiveOffer.slug || "",
      title: smartActiveOffer.title || "Smart Insurance Offer",
      description:
        smartActiveOffer.description ||
        smartActiveOffer.subtitle ||
        "Smart insurance offer applied.",
      discountAmount: pricing.appliedOfferAmount,
    };
  }, [
    smartActiveOffer,
    manualAppliedOffer,
    payload?.plan,
    addOnTotal,
    wallet,
    activeUser,
  ]);

  const finalSelectedOffer = manualAppliedOffer || smartMappedOffer;

  const pricing = useMemo(() => {
    if (!payload?.plan) return null;

    return buildPricing({
      plan: payload.plan,
      addOnTotal,
      selectedOffer: finalSelectedOffer,
      wallet,
      hasUser: Boolean(activeUser),
    });
  }, [payload?.plan, addOnTotal, finalSelectedOffer, wallet, activeUser]);

  const normalizedPlan = useMemo(() => {
    if (!payload?.plan || !pricing) return payload?.plan;

    return {
      ...payload.plan,
      premium: pricing.basePremium,
      originalPremium: pricing.basePremium,
      pricingSnapshot: pricing.pricingSnapshot,
      benefitPricing: pricing.benefitPricing,
      baseAfterOffer: pricing.baseAfterOffer,
      nonBenefitAmount: pricing.nonBenefitAmount,
      grossAmount: pricing.grossAmount,
      appliedOfferAmount: pricing.appliedOfferAmount,
      appliedOfferCode: pricing.appliedOfferCode,
      appliedOfferTitle: pricing.appliedOfferTitle,
      promoUsed: pricing.promoUsed,
      earnedUsed: pricing.earnedUsed,
      refundUsed: pricing.refundUsed,
      tplCreditUsed: pricing.tplCreditUsed,
      payableBeforeRefundWallet: pricing.payableBeforeRefundWallet,
      finalPayable: pricing.finalPayable,
      earnedOnThisBooking: pricing.earnedOnThisBooking,
      finalTotal: pricing.finalTotal,
    };
  }, [payload?.plan, pricing]);

  const walletBreakup = activeUser && pricing
    ? {
        promoUsed: pricing.promoUsed,
        earnedUsed: pricing.earnedUsed,
        refundUsed: pricing.refundUsed,
        promoAvailable: wallet.promoCredit,
        earnedAvailable: wallet.earnedCredit,
        refundWalletAvailable: wallet.refundableBalance,
        totalWalletUsed:
          Number(pricing.promoUsed || 0) +
          Number(pricing.earnedUsed || 0) +
          Number(pricing.refundUsed || 0),
        finalPayable: Number(pricing.finalPayable || 0),
        earnedOnBooking: Number(pricing.earnedOnThisBooking || 0),
        earnedOnThisBooking: Number(pricing.earnedOnThisBooking || 0),
      }
    : null;

  const canContinue =
    travellerValidation && nomineeValidation && Boolean(payload?.plan);

  const blockerMessage = !travellerValidation
    ? "Please complete all traveller details."
    : !nomineeValidation
    ? "Please complete nominee details."
    : "";

  function handleApplyOffer(offer: InsuranceOfferItem) {
    const safeDiscount = Math.min(
      Number(offer?.discountAmount || 0),
      Number(planBasePricing.basePremium || 0)
    );

    setManualAppliedOffer({
      ...offer,
      discountAmount: Math.round(Math.max(0, safeDiscount)),
    });
  }

  function handleRemoveOffer() {
    setManualAppliedOffer(null);
  }

  const handleContinue = () => {
    if (!canContinue || !payload?.plan || !pricing || !normalizedPlan) return;

    const insuranceBookingPayload = {
      bookingType: "insurance",
      serviceType: "insurance",

      createdAt: new Date().toISOString(),

      plan: normalizedPlan,
      search: payload.search,

      travellers,
      nominee,
      medicalDeclaration,
      addOns,

      pricingSnapshot: pricing.pricingSnapshot,
      benefitPricing: pricing.benefitPricing,

      baseAfterOffer: pricing.baseAfterOffer,
      nonBenefitAmount: pricing.nonBenefitAmount,
      grossAmount: pricing.grossAmount,
      appliedOfferAmount: pricing.appliedOfferAmount,
      appliedOfferCode: pricing.appliedOfferCode,
      appliedOfferTitle: pricing.appliedOfferTitle,
      promoUsed: pricing.promoUsed,
      earnedUsed: pricing.earnedUsed,
      refundUsed: pricing.refundUsed,
      tplCreditUsed: pricing.tplCreditUsed,
      payableBeforeRefundWallet: pricing.payableBeforeRefundWallet,
      finalPayable: pricing.finalPayable,
      earnedOnThisBooking: pricing.earnedOnThisBooking,
      finalTotal: pricing.finalTotal,

      appliedOffer: finalSelectedOffer,
      offerData: finalSelectedOffer,
      offerApplied: pricing.appliedOfferAmount,

      walletBreakdown: walletBreakup,

      user: activeUser
        ? {
            name: activeUser?.name || "",
            email: activeUser?.email || "",
            mobile: activeUser?.mobile || "",
          }
        : null,

      fareBreakup: {
        basePremium: pricing.basePremium,
        gst: pricing.gstAmount,
        addOnTotal,
        nonBenefitAmount: pricing.nonBenefitAmount,
        grossAmount: pricing.grossAmount,
        appliedOfferAmount: pricing.appliedOfferAmount,
        appliedOfferCode: pricing.appliedOfferCode,
        appliedOfferTitle: pricing.appliedOfferTitle,
        offerApplied: pricing.appliedOfferAmount,
        baseAfterOffer: pricing.baseAfterOffer,
        totalBeforeWallet: pricing.totalBeforeWallet,
        promoUsed: pricing.promoUsed,
        earnedUsed: pricing.earnedUsed,
        refundUsed: pricing.refundUsed,
        tplCreditUsed: pricing.tplCreditUsed,
        totalWalletUsed:
          Number(pricing.promoUsed || 0) +
          Number(pricing.earnedUsed || 0) +
          Number(pricing.refundUsed || 0),
        payableBeforeRefundWallet: pricing.payableBeforeRefundWallet,
        finalPayable: pricing.finalPayable,
        earnedOnThisBooking: pricing.earnedOnThisBooking,
        finalTotal: pricing.finalPayable,
      },

      originalBookingBaseline: {
        amount: pricing.finalPayable,
        payableAmount: pricing.finalPayable,
        grossAmount: pricing.grossAmount,
        totalBeforeWallet: pricing.totalBeforeWallet,
        offerApplied: pricing.appliedOfferAmount,
        appliedOfferCode: pricing.appliedOfferCode,
        planId: payload.plan.id,
        planName: payload.plan.planName,
        provider: payload.plan.provider,
      },

      bookingStatus: "draft",
      paymentStatus: "pending",
      manageBookingReady: true,
      timestamp: Date.now(),
    };

    sessionStorage.setItem(
      "tplInsuranceBookingData",
      JSON.stringify(insuranceBookingPayload)
    );

    router.push("/insurance/payment");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="rounded-2xl bg-white px-6 py-5 text-sm font-bold text-gray-700 shadow-sm">
          Loading insurance booking...
        </div>
      </div>
    );
  }

  if (!payload?.plan || !pricing || !normalizedPlan) return null;

  return (
    <main className="min-h-screen overflow-x-hidden bg-gray-50 pb-8 lg:pb-0">
      <div className="sticky top-0 z-40 border-b border-gray-100 bg-white/95 px-3 py-3 shadow-sm backdrop-blur lg:hidden">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-xl font-black text-gray-800 shadow-sm"
            aria-label="Go back"
          >
            ‹
          </button>

          <div className="min-w-0 flex-1">
            <div className="truncate text-[16px] font-black text-gray-950">
              Insurance Booking
            </div>
            <div className="truncate text-[12px] font-semibold text-gray-500">
              {normalizedPlan.provider} • {normalizedPlan.planName}
            </div>
          </div>
        </div>
      </div>

      <section className="mx-auto max-w-7xl px-3 py-4 md:px-4 md:py-6">
        <InsuranceBookingHeader
          plan={normalizedPlan}
          searchData={payload.search}
        />

        <div className="mt-4 rounded-[22px] border border-orange-100 bg-gradient-to-r from-orange-50 to-white p-4 shadow-sm md:mt-5 md:rounded-3xl">
          {activeUser ? (
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <p className="break-words text-sm font-extrabold text-gray-950">
                  Logged in as{" "}
                  {getLoggedInDisplayName(activeUser)}
                </p>

                <p className="break-words text-xs font-semibold leading-5 text-gray-500">
                  Wallet benefits and faster insurance booking enabled.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <div className="rounded-2xl bg-white px-4 py-2 shadow-sm">
                  <p className="text-[11px] font-semibold text-gray-500">
                    Promo Credit
                  </p>
                  <p className="text-sm font-extrabold text-gray-950">
                    ₹{wallet.promoCredit.toLocaleString("en-IN")}
                  </p>
                </div>

                <div className="rounded-2xl bg-white px-4 py-2 shadow-sm">
                  <p className="text-[11px] font-semibold text-gray-500">
                    Earned Credit
                  </p>
                  <p className="text-sm font-extrabold text-gray-950">
                    ₹{wallet.earnedCredit.toLocaleString("en-IN")}
                  </p>
                </div>

                <div className="rounded-2xl bg-white px-4 py-2 shadow-sm">
                  <p className="text-[11px] font-semibold text-gray-500">
                    Refund Wallet
                  </p>
                  <p className="text-sm font-extrabold text-gray-950">
                    ₹{wallet.refundableBalance.toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <p className="break-words text-sm font-extrabold text-gray-950">
                  Login to unlock wallet benefits
                </p>

                <p className="break-words text-xs font-semibold leading-5 text-gray-500">
                  Use Promo Credit, Earned Credit and Refund Wallet during
                  payment.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowLoginModal(true)}
                className="flex h-11 w-full items-center justify-center rounded-2xl bg-orange-500 px-5 text-sm font-extrabold text-white transition hover:bg-orange-600 sm:w-auto"
              >
                Login / Signup
              </button>
            </div>
          )}
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-5">
            <InsuranceTravellerForm
              travellers={travellers}
              onChange={setTravellers}
              isPassportRequired={isPassportRequired}
            />

            <InsuranceNomineeForm nominee={nominee} onChange={setNominee} />

            <InsuranceMedicalDeclaration
              value={medicalDeclaration}
              onChange={setMedicalDeclaration}
            />

            <InsuranceAddOns value={addOns} onChange={setAddOns} />
          </div>

          <div className="min-w-0">
            <InsuranceFareSummary
  plan={normalizedPlan}
  addOns={addOns}
  walletBreakup={walletBreakup}
  offerApplied={pricing.appliedOfferAmount}
  appliedOfferAmount={pricing.appliedOfferAmount}
  appliedOfferCode={pricing.appliedOfferCode || ""}
  appliedOfferTitle={pricing.appliedOfferTitle || ""}
  canProceed={Boolean(canContinue)}
  blockerMessage={blockerMessage}
  onContinue={handleContinue}
/>

            <div className="mt-4">
              <InsuranceBookingOffersSection
                appliedOfferCode={pricing.appliedOfferCode || ""}
                bookingValue={pricing.basePremium || 2000}
                onApplyOffer={handleApplyOffer}
                onRemoveOffer={handleRemoveOffer}
              />
            </div>
          </div>
        </div>
      </section>

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </main>
  );
}
