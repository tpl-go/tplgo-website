"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import LoginModal from "@/app/components/common/LoginModal";
import { applyPaymentMethod } from "@/app/data/booking/applyPaymentMethod";
import { startPaymentProcess } from "@/app/data/booking/startPaymentProcess";
import {
  handlePaymentSuccess,
  handlePaymentFailure,
} from "@/app/data/booking/completePaymentProcess";
import { confirmBooking } from "@/app/data/booking/confirmBooking";
import { expireBooking } from "@/app/data/booking/expireBooking";

import CruisePaymentTopSummary from "@/app/components/payment/cruise/CruisePaymentTopSummary";
import CruisePaymentInsuranceCard from "@/app/components/payment/cruise/CruisePaymentInsuranceCard";
import CruisePaymentOptionSection from "@/app/components/payment/cruise/CruisePaymentOptionSection";
import CruisePaymentPriceCard from "@/app/components/payment/cruise/CruisePaymentPriceCard";
import MobileInnerBack from "@/app/components/common/mobile/MobileInnerBack";

import { AUTH_UPDATED_EVENT } from "@/app/lib/booking/guestAuth";

import {
  getWallet,
  saveWallet,
  addWalletLedgerItem,
  type Wallet,
} from "@/app/lib/wallet/walletStorage";

function getActiveUser() {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem("tpl_auth_session_v1");
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed?.user || null;
  } catch {
    return null;
  }
}

export default function CruisePaymentPage() {
  const router = useRouter();

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [paymentActionState, setPaymentActionState] = useState<
    "idle" | "processing" | "success" | "failure"
  >("idle");

  const [storedPayload, setStoredPayload] = useState<any>(null);

  const [insuranceSelected, setInsuranceSelected] = useState(false);
  const [insuranceAmount, setInsuranceAmount] = useState(0);

  const [timeLeft, setTimeLeft] = useState(10 * 60);
  const [isExpired, setIsExpired] = useState(false);

  const [activeUser, setActiveUser] = useState<any>(null);
  const [wallet, setWallet] = useState<Wallet>({
    promoCredit: 0,
    earnedCredit: 0,
    refundableBalance: 0,
  });

  useEffect(() => {
    const raw =
      typeof window !== "undefined"
        ? sessionStorage.getItem("tplCruiseBookingSession")
        : null;

    if (!raw) return;

    try {
      const parsed = JSON.parse(raw);
      setStoredPayload(parsed);

      if (typeof parsed?.session?.timerLeft === "number") {
        setTimeLeft(parsed.session.timerLeft);
      }
    } catch (error) {
      console.error("Failed to parse cruise payment payload:", error);
    }
  }, []);

  useEffect(() => {
    const syncUserWallet = () => {
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

    syncUserWallet();

    window.addEventListener(AUTH_UPDATED_EVENT, syncUserWallet);
    window.addEventListener("storage", syncUserWallet);

    return () => {
      window.removeEventListener(AUTH_UPDATED_EVENT, syncUserWallet);
      window.removeEventListener("storage", syncUserWallet);
    };
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) {
      setIsExpired(true);
      expireBooking();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const next = prev - 1;

        const raw = sessionStorage.getItem("tplCruiseBookingSession");

        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            sessionStorage.setItem(
              "tplCruiseBookingSession",
              JSON.stringify({
                ...parsed,
                session: {
                  ...parsed.session,
                  timerLeft: next > 0 ? next : 0,
                },
              })
            );
          } catch {}
        }

        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const formattedTime = useMemo(() => {
    const mm = String(Math.floor(timeLeft / 60)).padStart(2, "0");
    const ss = String(timeLeft % 60).padStart(2, "0");
    return `${mm}:${ss}`;
  }, [timeLeft]);

  const cruiseData = storedPayload?.cruise;
  const cabinData = storedPayload?.cabins;
  const travellerData = storedPayload?.travellers;
  const additionalInfoData = storedPayload?.additionalInfo;
  const selectedOffer = storedPayload?.offer;

  const totalTravellers =
    travellerData?.list?.length ||
    cabinData?.pricingSummary?.cabins?.reduce(
      (sum: number, c: any) =>
        sum + (c.adults || 0) + (c.children || 0) + (c.infants || 0),
      0
    ) ||
    1;

 const bookingFare = storedPayload?.fare || {};

const walletBreakdown =
  bookingFare?.walletBreakdown || {};

const walletUsedTotal =
  Number(walletBreakdown?.promoUsed || 0) +
  Number(walletBreakdown?.earnedUsed || 0) +
  Number(walletBreakdown?.refundUsed || 0);

const insuranceTotal =
  insuranceSelected ? insuranceAmount : 0;

const finalTotalAmount =
  Number(bookingFare?.grandTotal || 0) + insuranceTotal;

const totalBeforeWallet =
  Number(bookingFare?.totalBeforeWallet || 0) + insuranceTotal;

const earnedOnThisBooking =
  Number(bookingFare?.earnedOnThisBooking || 0);

const priceBreakup = {
  baseFare: Number(bookingFare?.baseFare || 0),

  travellerCount: totalTravellers,

  baseFarePerTraveller:
    totalTravellers > 0
      ? Math.round(
          Number(bookingFare?.baseFare || 0) / totalTravellers
        )
      : 0,

  baseAfterOffer:
    Number(bookingFare?.baseAfterOffer || 0),

  tax:
    Number(bookingFare?.taxes || 0) +
    Number(bookingFare?.portCharges || 0) +
    Number(bookingFare?.gratuityCharges || 0),

  surcharge: 0,

  insuranceTotal,

  appliedOffer:
    Number(bookingFare?.appliedOffer || 0),

  discount: 0,

  tplCredit: walletUsedTotal,

  walletCalc: {
    promoUsed: Number(walletBreakdown?.promoUsed || 0),
    earnedUsed: Number(walletBreakdown?.earnedUsed || 0),
    refundUsed: Number(walletBreakdown?.refundUsed || 0),
  },

  earnedOnThisBooking,

  totalBeforeWallet,

  totalAmount: finalTotalAmount,
};

  const handleMockPayment = async (shouldSucceed = true) => {
    if (!selectedPaymentMethod || isExpired) return;

    setPaymentActionState("processing");
    startPaymentProcess();

    await new Promise((resolve) => setTimeout(resolve, 1500));

    if (shouldSucceed) {
      if (activeUser?.mobile && walletUsedTotal > 0) {
  const latestWallet = getWallet(activeUser.mobile);

  const nextWallet: Wallet = {
    promoCredit: Math.max(
      Number(latestWallet.promoCredit || 0) -
        Number(walletBreakdown?.promoUsed || 0),
      0
    ),

    earnedCredit: Math.max(
      Number(latestWallet.earnedCredit || 0) -
        Number(walletBreakdown?.earnedUsed || 0),
      0
    ),

    refundableBalance: Math.max(
      Number(latestWallet.refundableBalance || 0) -
        Number(walletBreakdown?.refundUsed || 0),
      0
    ),
  };

  saveWallet(nextWallet, activeUser.mobile);
  setWallet(nextWallet);

  if (Number(walletBreakdown?.promoUsed || 0) > 0) {
    addWalletLedgerItem(
      {
        type: "wallet_used",
        title: "TPL Promo Credit Used",
        description: "Promo credit used for cruise booking payment",
        amount: Number(walletBreakdown?.promoUsed || 0),
      },
      activeUser.mobile
    );
  }

  if (Number(walletBreakdown?.earnedUsed || 0) > 0) {
    addWalletLedgerItem(
      {
        type: "wallet_used",
        title: "TPL Earned Credit Used",
        description: "Earned credit used for cruise booking payment",
        amount: Number(walletBreakdown?.earnedUsed || 0),
      },
      activeUser.mobile
    );
  }

  if (Number(walletBreakdown?.refundUsed || 0) > 0) {
    addWalletLedgerItem(
      {
        type: "wallet_used",
        title: "Refund Wallet Used",
        description: "Refund wallet used for cruise booking payment",
        amount: Number(walletBreakdown?.refundUsed || 0),
      },
      activeUser.mobile
    );
  }
}

      handlePaymentSuccess();
      confirmBooking();
      setPaymentActionState("success");

      const confirmationPayload = {
  ...storedPayload,

  earnedCreditAmount: earnedOnThisBooking, // ✅ THIS LINE ADD

  fare: {
  ...bookingFare,

  insuranceTotal,

  grandTotal: finalTotalAmount,

  totalAmount: finalTotalAmount,

  walletBreakdown: {
    ...walletBreakdown,
    totalWalletUsed: walletUsedTotal,
  },
},

  paymentData: {
  selectedPaymentMethod,
  insuranceSelected,
  insuranceAmount,
  finalPayableAmount: priceBreakup.totalAmount,
  totalBeforeWallet,
  walletUsed: walletUsedTotal,
  promoUsed: Number(walletBreakdown?.promoUsed || 0),
  earnedUsed: Number(walletBreakdown?.earnedUsed || 0),
  refundUsed: Number(walletBreakdown?.refundUsed || 0),
  paidAt: new Date().toISOString(),
},
};

      sessionStorage.setItem(
        "tplCruiseConfirmationData",
        JSON.stringify(confirmationPayload)
      );

      router.push("/cruise/confirmation");
    } else {
      handlePaymentFailure();
      setPaymentActionState("failure");
    }
  };

  if (!cruiseData) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        Cruise payment data not found.
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#eef3f8] pb-[calc(112px+env(safe-area-inset-bottom))] text-black lg:pb-0">
      <div className="bg-white border-b px-3 py-3 lg:hidden">
        <MobileInnerBack title="Cruise Payment" />
      </div>

      <div className="flex min-h-[62px] items-center justify-between border-b bg-white px-3 lg:h-[72px] lg:px-6">
        <div className="text-2xl font-black">TPL</div>

        <div className="flex flex-wrap justify-end gap-2 text-xs font-bold lg:text-sm">
          <span>{formattedTime}</span>
          <span>SAFE & SECURED</span>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-3 py-4 lg:flex-row lg:px-4 lg:py-6">
        <div className="flex w-full flex-col gap-4 lg:w-[72%]">
          <CruisePaymentTopSummary
            bookingData={{
              ...cruiseData,
              pricingSummary: cabinData?.pricingSummary,
            }}
            travellerValidation={{
              travellers: travellerData?.list,
              contactDetails: travellerData?.contact,
            }}
            additionalInfoData={additionalInfoData}
offerData={selectedOffer}
fareData={{
  baseFare: priceBreakup.baseFare,
  taxes: priceBreakup.tax,
  appliedOffer: priceBreakup.appliedOffer,
  tplCredit: priceBreakup.tplCredit,
  insuranceTotal: priceBreakup.insuranceTotal,
  totalAmount: priceBreakup.totalAmount,
  totalBeforeWallet: priceBreakup.totalBeforeWallet,
}}
/>

          <section className="rounded-2xl border border-[#d9e2ec] bg-white px-5 py-4 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="text-[16px] font-extrabold text-[#111827]">
                  {activeUser?.mobile
                    ? "Wallet benefits applied automatically"
                    : "Additional discounts and saved payment options"}
                </div>

                <div className="mt-1 text-[13px] text-[#6b7280]">
                  {activeUser?.mobile
                    ? "Promo Credit, Earned Credit and Refund Wallet are applied as per your account balance."
                    : "Login to access saved payments and exclusive cruise offers."}
                </div>
              </div>

              {!activeUser?.mobile ? (
                <button
                  type="button"
                  onClick={() => setShowLoginModal(true)}
                  className="h-[42px] w-full rounded-xl bg-[#1d9bf0] px-5 text-[13px] font-extrabold text-white transition hover:opacity-95 lg:w-auto lg:min-w-[110px]"
                >
                  LOGIN
                </button>
              ) : null}
            </div>
          </section>

          <CruisePaymentInsuranceCard
            totalTravellers={totalTravellers}
            defaultSelected={insuranceSelected}
            pricePerTraveller={349}
            onSelectionChange={({ selected, totalInsuranceAmount }) => {
              setInsuranceSelected(selected);
              setInsuranceAmount(totalInsuranceAmount);
            }}
          />

          <CruisePaymentOptionSection
            payableAmount={priceBreakup.totalAmount}
            onPaymentMethodChange={(method) => {
              setSelectedPaymentMethod(method);
              applyPaymentMethod(method);

              if (paymentActionState === "failure") {
                setPaymentActionState("idle");
              }
            }}
          />
        </div>

        <div className="w-full lg:w-[28%]">
  <div className="space-y-4">
    <CruisePaymentPriceCard
      priceBreakup={priceBreakup}
      selectedPaymentMethod={selectedPaymentMethod}
      paymentActionState={paymentActionState}
      isExpired={isExpired}
      onPayNow={() => handleMockPayment(true)}
      onRetryPayment={() => handleMockPayment(true)}
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
