"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import LoginModal from "@/app/components/common/LoginModal";
import { applyPaymentMethod } from "@/app/data/booking/applyPaymentMethod";
import { startPaymentProcess } from "@/app/data/booking/startPaymentProcess";
import {
  handlePaymentSuccess,
  handlePaymentFailure,
} from "@/app/data/booking/completePaymentProcess";
import { confirmBooking } from "@/app/data/booking/confirmBooking";
import { expireBooking } from "@/app/data/booking/expireBooking";

import PaymentTopSummary from "@/app/components/payment/packages/PaymentTopSummary";
import PaymentInsuranceCard from "@/app/components/payment/packages/PaymentInsuranceCard";
import PaymentOptionSection from "@/app/components/payment/packages/PaymentOptionSection";
import PaymentPriceCard from "@/app/components/payment/packages/PaymentPriceCard";
import { applyBenefitPricing } from "@/app/lib/pricing/applyBenefitPricing";
import { resolvePackageBySlug } from "@/app/data/packages/resolvePackage";

import { AUTH_UPDATED_EVENT } from "@/app/lib/booking/guestAuth";
import {
  getWallet,
  saveWallet,
  addWalletLedgerItem,
  type Wallet,
} from "@/app/lib/wallet/walletStorage";

type VariantKey = "withFlight" | "withoutFlight";

type BookingReviewPayload = {
  summary?: {
    packageSlug?: string;
    packageTitle?: string;
    route?: string[] | string;
    nights?: number;
    days?: number;
    variant?: VariantKey;
    travelDate?: string;
    originCity?: string;
    rooms?: Array<{ adults: number; children: number }>;
    totalAdults?: number;
    totalChildren?: number;
    totalRooms?: number;
    isInternationalTrip?: boolean;
    selectedVariant?: any;
    packageSelectionState?: any;
    includedFlightLabels?: string[];
    includedHotelLabels?: string[];
    includedTransferLabels?: string[];
    includedMealLabels?: string[];
    includedActivityLabels?: string[];
    features?: any;
  };
  traveller?: any;
  addOn?: {
    isInternationalTrip?: boolean;
    [key: string]: any;
  };
  itinerary?: any;
  cancellation?: any;
  fare?: {
    basePrice?: number;
    upgradedDiffTotal?: number;
    feesAndTaxes?: number;
    couponDiscount?: number;
    tplCreditUsed?: number;
    grandTotal?: number;
    appliedCoupon?: string;
    totalBeforeWallet?: number;
    walletBreakdown?: {
      promoUsed?: number;
      earnedUsed?: number;
      refundUsed?: number;
      promoAvailable?: number;
      earnedAvailable?: number;
      refundWalletAvailable?: number;
      totalWalletUsed?: number;
      earnedOnThisBooking?: number;
    };
  };
};

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

function formatTravelDateLabel(date?: string, nights?: number) {
  if (!date) return "Travel date not available";

  const start = new Date(date);
  if (Number.isNaN(start.getTime())) return date;

  const safeNights = Math.max(Number(nights || 0), 0);
  const end = new Date(start);
  end.setDate(start.getDate() + safeNights);

  const startLabel = start.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "2-digit",
  });

  const endLabel = end.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "2-digit",
  });

  return `${startLabel} → ${endLabel}`;
}

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const slug = Array.isArray(params?.slug) ? params.slug[0] : params?.slug;
  const requestedVariant = searchParams.get("variant") as VariantKey | null;

  const totalTravellersFromQuery = Math.max(
    Number(searchParams.get("adults") || "0"),
    0
  );

  const [timeLeft, setTimeLeft] = useState(10 * 60);
  const [insuranceSelected, setInsuranceSelected] = useState(false);
  const [insuranceAmount, setInsuranceAmount] = useState(0);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [paymentActionState, setPaymentActionState] = useState<
    "idle" | "processing" | "success" | "failure"
  >("idle");

  const [leadTraveller, setLeadTraveller] = useState({
    name: "Lead Traveller",
    email: "traveller@email.com",
    mobile: "+91-9800000000",
  });

  const [bookingReview, setBookingReview] =
    useState<BookingReviewPayload | null>(null);

  const [activeUser, setActiveUser] = useState<any>(null);
  const [wallet, setWallet] = useState<Wallet>({
    promoCredit: 0,
    earnedCredit: 0,
    refundableBalance: 0,
  });

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
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          expireBooking();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const formattedTime = useMemo(() => {
    const mm = String(Math.floor(timeLeft / 60)).padStart(2, "0");
    const ss = String(timeLeft % 60).padStart(2, "0");
    return `${mm}:${ss}`;
  }, [timeLeft]);

  const pkg = useMemo(() => {
    if (!slug) return null;
    return resolvePackageBySlug(slug);
  }, [slug]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const rawBookingReview = sessionStorage.getItem("tplPackageBookingReview");
    if (rawBookingReview) {
      try {
        const parsed = JSON.parse(rawBookingReview);
        setBookingReview(parsed);
      } catch (error) {
        console.error("Failed to parse booking review payload:", error);
      }
    }

    const savedLeadTraveller = sessionStorage.getItem("tplPaymentLeadTraveller");
    if (savedLeadTraveller) {
      try {
        const parsed = JSON.parse(savedLeadTraveller);
        setLeadTraveller({
          name: parsed?.name || "Lead Traveller",
          email: parsed?.email || "traveller@email.com",
          mobile: parsed?.mobile || "+91-9800000000",
        });
      } catch (error) {
        console.error("Failed to parse lead traveller data:", error);
      }
    }
  }, []);

  const selectedVariantKey: VariantKey = useMemo(() => {
    const summaryVariant = bookingReview?.summary?.variant;
    if (summaryVariant === "withFlight" || summaryVariant === "withoutFlight") {
      return summaryVariant;
    }

    if (!pkg?.variants) return "withFlight";

    if (
      requestedVariant &&
      (requestedVariant === "withFlight" ||
        requestedVariant === "withoutFlight") &&
      pkg.variants[requestedVariant]
    ) {
      return requestedVariant;
    }

    if (pkg.variants.withFlight) return "withFlight";
    if (pkg.variants.withoutFlight) return "withoutFlight";

    return "withFlight";
  }, [pkg, requestedVariant, bookingReview]);

  const selectedVariant = useMemo(() => {
    if (bookingReview?.summary?.selectedVariant) {
      return bookingReview.summary.selectedVariant;
    }

    return pkg?.variants?.[selectedVariantKey];
  }, [bookingReview, pkg, selectedVariantKey]);

  const totalTravellers = useMemo(() => {
    return Math.max(
      Number(bookingReview?.summary?.totalAdults || 0) ||
        totalTravellersFromQuery,
      1
    );
  }, [bookingReview, totalTravellersFromQuery]);

  const travelDateLabel = useMemo(() => {
    return formatTravelDateLabel(
      bookingReview?.summary?.travelDate,
      bookingReview?.summary?.nights
    );
  }, [bookingReview]);

  const originCity = useMemo(() => {
    return (
      bookingReview?.summary?.originCity || searchParams.get("origin") || "Delhi"
    );
  }, [bookingReview, searchParams]);

  const fareData = useMemo(() => {
    return bookingReview?.fare || null;
  }, [bookingReview]);

  const baseFare = Number(fareData?.basePrice || 0);
  const upgradedDiffTotal = Number(fareData?.upgradedDiffTotal || 0);
  const taxes = Number(fareData?.feesAndTaxes || 0);
  const couponDiscount = Number(fareData?.couponDiscount || 0);
  const appliedCoupon = fareData?.appliedCoupon || "";

  const benefitPricing = useMemo(() => {
  return applyBenefitPricing({
    baseAmount: baseFare,
    taxes,
    addOns:
      upgradedDiffTotal +
      (insuranceSelected ? insuranceAmount : 0),

    offerDiscount: couponDiscount,

    promoCredit: wallet.promoCredit,
    earnedCredit: wallet.earnedCredit,
    refundWallet: wallet.refundableBalance,
  });
}, [
  baseFare,
  taxes,
  upgradedDiffTotal,
  insuranceSelected,
  insuranceAmount,
  couponDiscount,
  wallet,
]);

const storedPromoUsed = Number(
  benefitPricing.promoUsed || 0
);

const storedEarnedUsed = Number(
  benefitPricing.earnedUsed || 0
);

const storedRefundUsed = Number(
  benefitPricing.refundUsed || 0
);

const walletUsedTotal =
  storedPromoUsed +
  storedEarnedUsed +
  storedRefundUsed;

const totalTplCreditUsed = walletUsedTotal;

const finalPayableAmount = Number(
  benefitPricing.finalPayable || 0
);

const basePackagePrice = Number(
  benefitPricing.payableBeforeRefundWallet || 0
);

const walletCalc = {
  promoUsed: storedPromoUsed,
  earnedUsed: storedEarnedUsed,
  refundUsed: storedRefundUsed,
  finalPayable: finalPayableAmount,
  refundCredit: 0,
  settlementMode: "payment" as const,
};

  const effectivePerPersonPrice = useMemo(() => {
    if (!totalTravellers) return 0;

    const insurancePerTraveller = insuranceSelected
      ? Math.round(insuranceAmount / totalTravellers)
      : 0;

    return Math.round(basePackagePrice / totalTravellers) + insurancePerTraveller;
  }, [basePackagePrice, insuranceSelected, insuranceAmount, totalTravellers]);

  const earnedOnThisBooking = useMemo(() => {
    return Number(
      fareData?.walletBreakdown?.earnedOnThisBooking ||
        Math.floor(Math.max(Number(fareData?.totalBeforeWallet || 0), 0) * 0.02)
    );
  }, [fareData]);

  const handleMockPayment = async (shouldSucceed = true) => {
    if (!selectedPaymentMethod) return;

    setPaymentActionState("processing");
    startPaymentProcess();

    await new Promise((resolve) => setTimeout(resolve, 1500));

    if (shouldSucceed) {
      if (activeUser?.mobile && walletUsedTotal > 0) {
        const latestWallet = getWallet(activeUser.mobile);

        const nextWallet: Wallet = {
          promoCredit: Math.max(
            Number(latestWallet.promoCredit || 0) - Number(storedPromoUsed || 0),
            0
          ),
          earnedCredit: Math.max(
            Number(latestWallet.earnedCredit || 0) -
              Number(storedEarnedUsed || 0),
            0
          ),
          refundableBalance: Math.max(
            Number(latestWallet.refundableBalance || 0) -
              Number(storedRefundUsed || 0),
            0
          ),
        };

        saveWallet(nextWallet, activeUser.mobile);
        setWallet(nextWallet);

        if (storedPromoUsed > 0) {
          addWalletLedgerItem(
            {
              type: "wallet_used",
              title: "TPL Promo Credit Used",
              description: "Promo credit used for package booking payment",
              amount: storedPromoUsed,
            },
            activeUser.mobile
          );
        }

        if (storedEarnedUsed > 0) {
          addWalletLedgerItem(
            {
              type: "wallet_used",
              title: "TPL Earned Credit Used",
              description: "Earned credit used for package booking payment",
              amount: storedEarnedUsed,
            },
            activeUser.mobile
          );
        }

        if (storedRefundUsed > 0) {
          addWalletLedgerItem(
            {
              type: "wallet_used",
              title: "Refund Wallet Used",
              description: "Refund wallet used for package booking payment",
              amount: storedRefundUsed,
            },
            activeUser.mobile
          );
        }
      }

      handlePaymentSuccess();
      confirmBooking();
      setPaymentActionState("success");

      if (typeof window !== "undefined") {
        const confirmationPayload = {
          summary: bookingReview?.summary || null,
          traveller: bookingReview?.traveller || null,
          addOn: {
            ...(bookingReview?.addOn || {}),
            insuranceSelected,
            insuranceAmount,
          },
          itinerary: bookingReview?.itinerary || null,
          cancellation: bookingReview?.cancellation || null,
          fare: {
            basePrice: baseFare,
            upgradedDiffTotal,
            feesAndTaxes: taxes,
            couponDiscount,
            tplCreditUsed: totalTplCreditUsed,
            grandTotal: basePackagePrice,
            appliedCoupon,
            insuranceAmount,
            finalPayableAmount,
            totalBeforeWallet: fareData?.totalBeforeWallet || 0,
            walletBreakdown: {
              promoUsed: storedPromoUsed,
              earnedUsed: storedEarnedUsed,
              refundUsed: storedRefundUsed,
              promoAvailable: fareData?.walletBreakdown?.promoAvailable || 0,
              earnedAvailable: fareData?.walletBreakdown?.earnedAvailable || 0,
              refundWalletAvailable:
                fareData?.walletBreakdown?.refundWalletAvailable || 0,
              totalWalletUsed: walletUsedTotal,
              earnedOnThisBooking,
            },
          },
          payment: {
            selectedPaymentMethod,
            paymentActionState: "success",
            amountPaid: finalPayableAmount,
            basePackagePrice,
            insuranceSelected,
            insuranceAmount,
            totalTravellers,
            paidAt: new Date().toISOString(),
            walletUsed: walletUsedTotal,
            promoUsed: storedPromoUsed,
            earnedUsed: storedEarnedUsed,
            refundUsed: storedRefundUsed,
          },
          leadTraveller,
          earnedCreditAmount: earnedOnThisBooking,
        };

        sessionStorage.setItem(
          "tplPackageConfirmationPayload",
          JSON.stringify(confirmationPayload)
        );
      }

      router.push(`/packages/confirmation/${slug}?variant=${selectedVariantKey}`);
    } else {
      handlePaymentFailure();
      setPaymentActionState("failure");
    }
  };

  if (!pkg || !selectedVariant || !bookingReview?.summary) {
    return (
      <main className="min-h-screen bg-[#f5f7fb] text-black flex items-center justify-center">
        <div className="text-lg font-semibold">Payment page data not found</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#eef3f8] text-black">
      <div
        style={{
          height: "72px",
          background: "#ffffff",
          borderBottom: "1px solid #d9e2ec",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 28px",
        }}
      >
        <div
          style={{
            fontSize: "26px",
            fontWeight: 900,
            color: "#111827",
            letterSpacing: "-0.4px",
          }}
        >
          TPL
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontSize: "13px",
            fontWeight: 800,
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              minWidth: "64px",
              height: "30px",
              borderRadius: "999px",
              background: "#ffffff",
              border: "1px solid #d9e2ec",
              padding: "0 12px",
              color: "#111827",
            }}
          >
            {formattedTime}
          </span>

          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              height: "30px",
              borderRadius: "999px",
              background: "#ffffff",
              border: "1px solid #d9e2ec",
              padding: "0 12px",
              color: "#0f766e",
              fontWeight: 800,
            }}
          >
            SAFE &amp; SECURED
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div
          style={{
            display: "flex",
            alignItems: "stretch",
            gap: "18px",
          }}
        >
          <div
            style={{
              width: "72%",
              minWidth: 0,
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            <PaymentTopSummary
              packageData={pkg}
              bookingSummaryData={bookingReview?.summary || null}
              travellerData={bookingReview?.traveller || null}
              addOnData={{
                ...(bookingReview?.addOn || {}),
                insuranceSelected,
                insuranceAmount,
              }}
            />

            <div
              style={{
                border: "1px solid #d9e2ec",
                background: "#ffffff",
                borderRadius: "16px",
                overflow: "hidden",
                boxShadow: "0 2px 8px rgba(15,23,42,0.04)",
              }}
            >
              <div
                style={{
                  padding: "18px 20px",
                  borderBottom: "1px solid #e5e7eb",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "16px",
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: "16px",
                      fontWeight: 800,
                      color: "#111827",
                    }}
                  >
                    {activeUser?.mobile
                      ? "Wallet benefits applied automatically"
                      : "Additional discounts and saved payment options"}
                  </div>

                  <div
                    style={{
                      marginTop: "4px",
                      fontSize: "13px",
                      color: "#6b7280",
                    }}
                  >
                    {activeUser?.mobile
                      ? "Promo Credit, Earned Credit and Refund Wallet are applied as per booking summary."
                      : "Login to access saved payments and discounts!"}
                  </div>
                </div>

                {!activeUser?.mobile ? (
                  <button
                    onClick={() => setShowLoginModal(true)}
                    style={{
                      minWidth: "110px",
                      height: "42px",
                      border: "none",
                      borderRadius: "10px",
                      background: "#1d9bf0",
                      color: "#ffffff",
                      fontSize: "14px",
                      fontWeight: 800,
                      cursor: "pointer",
                    }}
                  >
                    LOGIN
                  </button>
                ) : null}
              </div>
            </div>

            <PaymentInsuranceCard
              totalTravellers={totalTravellers}
              onSelectionChange={({ selected, totalInsuranceAmount }) => {
                setInsuranceSelected(selected);
                setInsuranceAmount(totalInsuranceAmount);
              }}
            />

            <PaymentOptionSection
              onPaymentMethodChange={(method) => {
                setSelectedPaymentMethod(method);
                applyPaymentMethod(method);
              }}
            />
          </div>

          <div
            style={{
              width: "28%",
              minWidth: 0,
              alignSelf: "stretch",
            }}
          >
            <PaymentPriceCard
              selectedVariant={{
                ...selectedVariant,
                pricePerPerson: effectivePerPersonPrice,
              }}
              totalTravellers={totalTravellers}
              basePrice={baseFare}
              upgradedDiffTotal={upgradedDiffTotal}
              couponDiscount={couponDiscount}
              taxes={taxes}
              tplCreditUsed={totalTplCreditUsed}
              walletCalc={{
                promoUsed: storedPromoUsed,
                earnedUsed: storedEarnedUsed,
                refundUsed: storedRefundUsed,
              }}
              earnedOnThisBooking={earnedOnThisBooking}
              insuranceAmount={insuranceSelected ? insuranceAmount : 0}
              appliedCoupon={appliedCoupon}
              payNowAmount={finalPayableAmount}
              timerSeconds={timeLeft}
              selectedPaymentMethod={selectedPaymentMethod}
              paymentActionState={paymentActionState}
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