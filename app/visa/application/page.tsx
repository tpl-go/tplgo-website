"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import LoginModal from "@/app/components/common/LoginModal";

import VisaApplicationSummaryCard from "@/app/components/booking/visa/VisaApplicationSummaryCard";
import VisaApplicantDetailsCard from "@/app/components/booking/visa/VisaApplicantDetailsCard";
import VisaPassportDetailsCard from "@/app/components/booking/visa/VisaPassportDetailsCard";
import VisaDocumentChecklistCard, {
  type VisaUploadedDoc,
} from "@/app/components/booking/visa/VisaDocumentChecklistCard";
import VisaSpecialRequestCard from "@/app/components/booking/visa/VisaSpecialRequestCard";
import VisaFareSummaryCard from "@/app/components/booking/visa/VisaFareSummaryCard";
import VisaBookingOffersSection from "@/app/components/booking/visa/VisaBookingOffersSection";

import { applyBenefitPricing } from "@/app/lib/pricing/applyBenefitPricing";
import { getWallet } from "@/app/lib/wallet/walletStorage";
import { getSavedProfile } from "@/app/lib/account/profileStorage";
import { getSavedTravellers } from "@/app/lib/booking/safeProfileSeed";

import {
  calculateSmartOfferDiscount,
  getSmartActiveOfferItem,
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

function safeNumber(value: any, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function cleanMobile(value?: string) {
  return String(value || "")
    .replace(/^\+91\s?/, "")
    .replace(/^\+91-?/, "")
    .replace(/\D/g, "")
    .slice(-10);
}

function joinName(firstName?: string, lastName?: string) {
  return `${String(firstName || "").trim()} ${String(lastName || "").trim()}`.trim();
}

function resolveVisaLoggedInDisplayName(user: any) {
  const mobile = cleanMobile(user?.mobile);
  if (!mobile) return "";

  const profile = getSavedProfile(mobile);
  const profileName = joinName(profile?.firstName, profile?.lastName);

  if (profileName) return profileName;

  const savedTravellers = getSavedTravellers(mobile);
  const leadTraveller = savedTravellers.find((traveller: any) =>
    joinName(traveller?.firstName, traveller?.lastName)
  );

  const leadName = joinName(leadTraveller?.firstName, leadTraveller?.lastName);

  if (leadName) return leadName;

  return mobile;
}

type Applicant = {
  title: string;
  firstName: string;
  lastName: string;
  dob: string;
  gender: string;
  email: string;
  mobile: string;
};

type Passport = {
  passportNumber: string;
  issueDate: string;
  expiryDate: string;
  issuePlace: string;
};

type VisaOfferItem = {
  code: string;
  title: string;
  description?: string;
  discountAmount: number;
};

const createDefaultApplicant = (): Applicant => ({
  title: "Mr",
  firstName: "",
  lastName: "",
  dob: "",
  gender: "Male",
  email: "",
  mobile: "",
});

const createDefaultPassport = (): Passport => ({
  passportNumber: "",
  issueDate: "",
  expiryDate: "",
  issuePlace: "",
});

export default function VisaApplicationPage() {
  const router = useRouter();

  const [showLoginModal, setShowLoginModal] = useState(false);
const [activeUser, setActiveUser] = useState<any>(null);
const [displayUserName, setDisplayUserName] = useState("");
const [appliedOffer, setAppliedOffer] = useState<VisaOfferItem | null>(null);

  const [selectedData, setSelectedData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [passports, setPassports] = useState<Passport[]>([]);
  const [uploadedDocsByApplicant, setUploadedDocsByApplicant] = useState<
    VisaUploadedDoc[][]
  >([]);
  const [acceptedDocsByApplicant, setAcceptedDocsByApplicant] = useState<
    string[][]
  >([]);

  const [specialRequest, setSpecialRequest] = useState("");

  const [wallet, setWallet] = useState({
    promoCredit: 0,
    earnedCredit: 0,
    refundableBalance: 0,
  });

  useEffect(() => {
    const loadUserAndWallet = () => {
      const user = getActiveUser();
setActiveUser(user);
setDisplayUserName(user?.mobile ? resolveVisaLoggedInDisplayName(user) : "");

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
    const raw =
      typeof window !== "undefined"
        ? sessionStorage.getItem("tplSelectedVisaOption")
        : null;

    if (!raw) {
      alert("No visa option selected. Please choose a visa option first.");
      router.push("/?service=visa");
      return;
    }

    try {
      const parsed = JSON.parse(raw);
      const user = getActiveUser();

      setSelectedData(parsed);

      const travellerCount = Math.max(
        Number(parsed?.searchData?.travellers || 1),
        1
      );

      const newApplicants = Array.from(
        { length: travellerCount },
        (_, index) => {
          const base = createDefaultApplicant();

          if (index === 0 && user) {
            const fullName = String(user?.name || "").trim();
            const nameParts = fullName.split(" ").filter(Boolean);

            return {
              ...base,
              firstName: nameParts[0] || "",
              lastName: nameParts.slice(1).join(" ") || "",
              email: user?.email || "",
              mobile: user?.mobile || "",
            };
          }

          return base;
        }
      );

      setApplicants(newApplicants);
      setPassports(
        Array.from({ length: travellerCount }, () => createDefaultPassport())
      );
      setUploadedDocsByApplicant(
        Array.from({ length: travellerCount }, () => [])
      );
      setAcceptedDocsByApplicant(
        Array.from({ length: travellerCount }, () => [])
      );
      setLoading(false);
    } catch (error) {
      console.error("Failed to parse visa selected option:", error);
      sessionStorage.removeItem("tplSelectedVisaOption");
      alert("Something went wrong. Please select visa option again.");
      router.push("/?service=visa");
    }
  }, [router]);

  const option = selectedData?.option || null;
  const searchData = selectedData?.searchData || null;
  const resultPricingSnapshot =
    selectedData?.pricingSnapshot || option?.pricingSnapshot || null;

  const travellers = Math.max(Number(searchData?.travellers || 1), 1);

  const visaFee = safeNumber(option?.embassyFee);
  const serviceFee = safeNumber(option?.serviceFee);
  const perApplicantTotal = safeNumber(option?.totalPrice, visaFee + serviceFee);
  const grossTotal = Math.round(perApplicantTotal * travellers);

  const baseVisaAmount = Math.round(
    safeNumber(resultPricingSnapshot?.baseVisaAmount, serviceFee * travellers)
  );

  const totalVisaFees = Math.round(
    safeNumber(resultPricingSnapshot?.embassyFee, visaFee * travellers)
  );

  const totalServiceFees = Math.max(Math.round(grossTotal - totalVisaFees), 0);
  const nonBenefitTotal = Math.max(Math.round(grossTotal - baseVisaAmount), 0);

  const smartActiveOffer = getSmartActiveOfferItem();

  const smartMappedOffer =
    smartActiveOffer && !appliedOffer
      ? {
          code: smartActiveOffer.couponCode || smartActiveOffer.slug,
          title: smartActiveOffer.title,
          description:
            smartActiveOffer.description ||
            smartActiveOffer.subtitle ||
            "Smart visa offer applied.",
          discountAmount: Math.min(
            Math.round(
              calculateSmartOfferDiscount(
                smartActiveOffer,
                baseVisaAmount || 5000
              )
            ),
            baseVisaAmount
          ),
        }
      : null;

  const finalSelectedOffer = appliedOffer || smartMappedOffer;

  const offerApplied = Math.min(
    Math.round(safeNumber(finalSelectedOffer?.discountAmount)),
    baseVisaAmount
  );

  const benefitPricing = useMemo(() => {
    return applyBenefitPricing({
      baseAmount: baseVisaAmount,
      visaCharges: nonBenefitTotal,
      offerDiscount: offerApplied,
      promoCredit: activeUser ? wallet.promoCredit : 0,
      earnedCredit: activeUser ? wallet.earnedCredit : 0,
      refundWallet: activeUser ? wallet.refundableBalance : 0,
    });
  }, [
    baseVisaAmount,
    nonBenefitTotal,
    offerApplied,
    activeUser,
    wallet.promoCredit,
    wallet.earnedCredit,
    wallet.refundableBalance,
  ]);

  const baseAfterOffer = benefitPricing.baseAfterOffer;
  const totalBeforeWallet = Math.max(
    benefitPricing.grossAmount - benefitPricing.offerDiscount,
    0
  );

  const promoUsed = benefitPricing.promoUsed;
  const earnedUsed = benefitPricing.earnedUsed;
  const refundUsed = benefitPricing.refundUsed;
  const tplCredit = benefitPricing.tplCreditUsed + refundUsed;
  const finalTotal = benefitPricing.finalPayable;
  const earnedOnThisBooking = Math.round(baseAfterOffer * 0.02);

  const pricingSnapshot = {
    visaFee,
    serviceFee,
    perApplicantTotal,
    travellers,

    baseVisaAmount: benefitPricing.baseAmount,
    baseAfterOffer,

    totalVisaFees,
    totalServiceFees,
    nonBenefitTotal: benefitPricing.nonBenefitAmount,

    grossTotal: benefitPricing.grossAmount,
    totalBeforeOffer: benefitPricing.grossAmount,

    appliedOfferAmount: benefitPricing.offerDiscount,
    appliedOfferCode: finalSelectedOffer?.code || "",
    appliedOfferTitle: finalSelectedOffer?.title || "",
    offerData: finalSelectedOffer,

    totalBeforeWallet,

    promoUsed,
    earnedUsed,
    refundUsed,
    tplCredit,
    finalTotal,

    earnedOnThisBooking,

    benefitPricing,
  };

  const walletBreakup = {
    promoUsed,
    earnedUsed,
    refundUsed,
    promoAvailable: wallet.promoCredit,
    earnedAvailable: wallet.earnedCredit,
    refundWalletAvailable: wallet.refundableBalance,
    totalWalletUsed: tplCredit,
    finalPayable: finalTotal,
    earnedOnBooking: earnedOnThisBooking,
    earnedOnThisBooking,
  };

  const requiredDocs = option?.documents || [];

  const areApplicantsValid =
    applicants.length === travellers &&
    applicants.every(
      (applicant) =>
        applicant.firstName.trim() &&
        applicant.lastName.trim() &&
        applicant.dob.trim() &&
        applicant.mobile.trim() &&
        applicant.email.trim()
    );

  const arePassportsValid =
    passports.length === travellers &&
    passports.every(
      (passport) =>
        passport.passportNumber.trim() &&
        passport.issueDate.trim() &&
        passport.expiryDate.trim() &&
        passport.issuePlace.trim()
    );

  const areDocumentsValid =
    uploadedDocsByApplicant.length === travellers &&
    uploadedDocsByApplicant.every((docs) =>
      requiredDocs.every((doc: string) =>
        docs.some((uploaded) => uploaded.name === doc)
      )
    );

  const canProceed =
    areApplicantsValid &&
    arePassportsValid &&
    areDocumentsValid &&
    Boolean(option);

  const blockerMessage = !areApplicantsValid
    ? "Please complete all applicant details."
    : !arePassportsValid
    ? "Please complete all passport details."
    : !areDocumentsValid
    ? "Please upload all required documents for every applicant."
    : "";

  const updateApplicant = (index: number, value: Applicant) => {
    setApplicants((prev) =>
      prev.map((item, idx) => (idx === index ? value : item))
    );
  };

  const updatePassport = (index: number, value: Passport) => {
    setPassports((prev) =>
      prev.map((item, idx) => (idx === index ? value : item))
    );
  };

  const updateUploadedDocs = (index: number, value: VisaUploadedDoc[]) => {
    setUploadedDocsByApplicant((prev) =>
      prev.map((item, idx) => (idx === index ? value : item))
    );
  };

  const updateAcceptedDocs = (index: number, value: string[]) => {
    setAcceptedDocsByApplicant((prev) =>
      prev.map((item, idx) => (idx === index ? value : item))
    );
  };

  function applyOffer(offer: VisaOfferItem) {
    setAppliedOffer({
      ...offer,
      discountAmount: Math.min(
        Math.round(safeNumber(offer?.discountAmount)),
        baseVisaAmount
      ),
    });
  }

  function removeOffer() {
    setAppliedOffer(null);
  }

  const handleContinue = () => {
    if (!canProceed || !option || !searchData) return;

    const optionWithPricing = {
      ...option,
      pricingSnapshot,
    };

    const payload = {
      serviceType: "visa",
      bookingType: "visa",
      bookingStatus: "draft",
      paymentStatus: "pending",

      option: optionWithPricing,
      searchData,

      applicants,
      passports,

      uploadedDocsByApplicant,
      acceptedDocsByApplicant,

      specialRequest,

      travellers,

      appliedOffer: finalSelectedOffer,
      appliedOfferCode: finalSelectedOffer?.code || "",
      appliedOfferTitle: finalSelectedOffer?.title || "",
      offerData: finalSelectedOffer,

      user: activeUser
        ? {
            name: activeUser?.name || "",
            email: activeUser?.email || applicants?.[0]?.email || "",
            mobile: activeUser?.mobile || applicants?.[0]?.mobile || "",
          }
        : null,

      pricingSnapshot,

      walletBreakdown: {
        promoUsed,
        earnedUsed,
        refundUsed,
        promoAvailable: wallet.promoCredit,
        earnedAvailable: wallet.earnedCredit,
        refundWalletAvailable: wallet.refundableBalance,
        totalWalletUsed: tplCredit,
        earnedOnThisBooking,
      },

      fareBreakup: pricingSnapshot,

      originalBookingBaseline: {
        amount: finalTotal,
        payableAmount: finalTotal,
        totalBeforeWallet,
        grossTotal: benefitPricing.grossAmount,
        baseVisaAmount: benefitPricing.baseAmount,
        baseAfterOffer,
        nonBenefitTotal: benefitPricing.nonBenefitAmount,
        appliedOfferAmount: benefitPricing.offerDiscount,
        visaOptionId: option?.id || "",
        visaTitle: option?.title || "Selected Visa",
        travellers,
      },

      manageBookingReady: true,

      finalTotal,
      timestamp: Date.now(),
    };

    sessionStorage.setItem("tplVisaBookingData", JSON.stringify(payload));
    router.push("/visa/payment");
  };

  if (loading || !option) {
    return (
      <main className="min-h-screen bg-[#f5f7fb] text-black">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="rounded-xl border border-[#d9e2ec] bg-white p-6 text-lg font-semibold text-[#374151]">
            Loading visa application...
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f7fb] text-black">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-4 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => router.push("/visa/results")}
            className="text-[13px] font-bold text-[#0b74ff] hover:underline"
          >
            ← Modify Search
          </button>

          <div className="text-[12px] font-semibold text-[#6b7280]">
            {option?.country
              ? `${option.country} • ${option.visaType} Visa • ${travellers} Applicant${
                  travellers > 1 ? "s" : ""
                }`
              : "Visa application in progress"}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[2.6fr_0.9fr]">
          <div className="space-y-5">
            <VisaApplicationSummaryCard
              option={option}
              searchData={searchData}
            />

            {applicants.map((applicant, index) => (
              <div key={index} className="space-y-5">
                <VisaApplicantDetailsCard
                  applicant={applicant}
                  applicantIndex={index}
                  onChange={(value) => updateApplicant(index, value)}
                  isAuthenticated={Boolean(activeUser)}
                  userName={displayUserName}
                  onLoginClick={() => setShowLoginModal(true)}
                  showLoginBox={index === 0}
                />

                <VisaPassportDetailsCard
                  passport={passports[index]}
                  applicantIndex={index}
                  onChange={(value) => updatePassport(index, value)}
                />

                <VisaDocumentChecklistCard
                  documents={requiredDocs}
                  acceptedDocs={acceptedDocsByApplicant[index] || []}
                  uploadedDocs={uploadedDocsByApplicant[index] || []}
                  applicantIndex={index}
                  onAcceptedChange={(value) => updateAcceptedDocs(index, value)}
                  onUploadedChange={(value) => updateUploadedDocs(index, value)}
                />
              </div>
            ))}

            <VisaSpecialRequestCard
              value={specialRequest}
              onChange={setSpecialRequest}
            />
          </div>

          <div className="space-y-4">
            <VisaFareSummaryCard
              option={{
                ...option,
                pricingSnapshot,
              }}
              travellers={travellers}
              walletBreakup={walletBreakup}
              appliedOfferAmount={benefitPricing.offerDiscount}
              appliedOfferCode={finalSelectedOffer?.code || ""}
              appliedOfferTitle={finalSelectedOffer?.title || ""}
              canProceed={canProceed}
              blockerMessage={blockerMessage}
              onContinue={handleContinue}
            />

            <VisaBookingOffersSection
              appliedOfferCode={finalSelectedOffer?.code || ""}
              bookingValue={baseVisaAmount || 5000}
              onApplyOffer={applyOffer}
              onRemoveOffer={removeOffer}
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