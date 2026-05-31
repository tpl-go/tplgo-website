"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import LoginModal from "@/app/components/common/LoginModal";
import { AUTH_UPDATED_EVENT } from "@/app/lib/booking/guestAuth";

import { applyPaymentMethod } from "@/app/data/booking/applyPaymentMethod";
import { startPaymentProcess } from "@/app/data/booking/startPaymentProcess";
import {
  handlePaymentSuccess,
  handlePaymentFailure,
} from "@/app/data/booking/completePaymentProcess";
import { confirmBooking } from "@/app/data/booking/confirmBooking";
import { expireBooking } from "@/app/data/booking/expireBooking";

import {
  getWallet,
  saveWallet,
  addWalletLedgerItem,
  type Wallet,
} from "@/app/lib/wallet/walletStorage";

import { applyBenefitPricing } from "@/app/lib/pricing/applyBenefitPricing";

import HomestayPaymentTopSummary from "@/app/components/payment/homestay/HomestayPaymentTopSummary";
import HomestayPaymentTripSecureCard from "@/app/components/payment/homestay/HomestayPaymentTripSecureCard";
import HomestayPaymentOptionSection from "@/app/components/payment/homestay/HomestayPaymentOptionSection";
import HomestayPaymentPriceCard from "@/app/components/payment/homestay/HomestayPaymentPriceCard";

import type { Homestay, RoomVariant } from "@/app/data/stays/types";

type StoredHomestayPaymentPayload = {
  homestay: Homestay;
  selectedVariant: RoomVariant | null;
  searchMeta: {
    city: string;
    checkIn: string;
    checkOut: string;
    rooms: number;
    adults: number;
    children?: number;
    nights?: number;
  };
  guestValidation?: {
    guests?: any[];
    isValid?: boolean;
    travellers?: any[];
    contactDetails?: {
      countryCode?: string;
      mobile?: string;
      email?: string;
    };
  };
  tripSecureSelected?: boolean;
  tripSecureTotal?: number;
  tripSecureLabel?: string;
  cabSelected?: boolean;
  cabTotal?: number;
  cabLabel?: string;
  addonsSelected?: boolean;
  addOnsTotal?: number;
  addonsLabel?: string;
  selectedAddonItems?: string[];
  tplCredit?: number;
  appliedOffer?: number;
  appliedOfferCode?: string;
  appliedOfferTitle?: string;
  specialRequest?: string;
  finalTotal?: number;
  timerLeft?: number;
  timestamp: number;

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

  fareBreakup?: {
    stayPrice?: number;
    rooms?: number;
    nights?: number;
    subtotal?: number;
    taxes?: number;
    tripSecureTotal?: number;
    cabTotal?: number;
    addOnsTotal?: number;
    appliedOffer?: number;
    totalBeforeWallet?: number;
    promoUsed?: number;
    earnedUsed?: number;
    refundUsed?: number;
    tplCredit?: number;
    finalTotal?: number;
  };

  originalBookingBaseline?: {
    amount?: number;
    payableAmount?: number;
    totalBeforeWallet?: number;
    selectedVariantId?: string;
    selectedVariantTitle?: string;
    stayPrice?: number;
    rooms?: number;
    nights?: number;
    tripSecureTotal?: number;
    cabTotal?: number;
    addOnsTotal?: number;
  };

  manageBookingReady?: boolean;
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

function getHomestayName(homestay: any) {
  return (
    homestay?.title ||
    homestay?.name ||
    homestay?.homestayName ||
    homestay?.propertyName ||
    "Homestay Booking"
  );
}

function getHomestayCity(homestay: any, searchMeta: any) {
  return homestay?.city || searchMeta?.city || "City not available";
}

function getHomestayAddress(homestay: any, searchMeta: any) {
  return (
    [homestay?.area, ...((homestay?.topLocation as string[]) || [])]
      .filter(Boolean)
      .join(", ") ||
    homestay?.locationHighlights?.join(", ") ||
    homestay?.city ||
    searchMeta?.city ||
    "Address not available"
  );
}

function parseLocalDate(value: string) {
  if (!value) return null;
  const parts = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const date = parts
    ? new Date(Number(parts[1]), Number(parts[2]) - 1, Number(parts[3]))
    : new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
}

export default function HomestayPaymentPage() {
  const router = useRouter();

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [paymentActionState, setPaymentActionState] = useState<
    "idle" | "processing" | "success" | "failure"
  >("idle");

  const [storedPayload, setStoredPayload] =
    useState<StoredHomestayPaymentPayload | null>(null);

  const [tripSecureSelected, setTripSecureSelected] = useState(false);
  const [tripSecureAmount, setTripSecureAmount] = useState(0);

  const [activeUser, setActiveUser] = useState<any>(null);
  const [wallet, setWallet] = useState<Wallet>({
    promoCredit: 0,
    earnedCredit: 0,
    refundableBalance: 0,
  });

  const [timeLeft, setTimeLeft] = useState(10 * 60);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const raw =
      typeof window !== "undefined"
        ? sessionStorage.getItem("tplHomestayBookingData")
        : null;

    if (!raw) return;

    try {
      const parsed: StoredHomestayPaymentPayload = JSON.parse(raw);
      setStoredPayload(parsed);

      if (parsed.tripSecureSelected && (parsed.tripSecureTotal || 0) > 0) {
        setTripSecureSelected(true);
        setTripSecureAmount(parsed.tripSecureTotal || 0);
      }

      if (typeof parsed.timerLeft === "number" && parsed.timerLeft > 0) {
        setTimeLeft(parsed.timerLeft);
      }
    } catch (error) {
      console.error("Failed to parse homestay payment payload:", error);
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

        const raw =
          typeof window !== "undefined"
            ? sessionStorage.getItem("tplHomestayBookingData")
            : null;

        if (raw) {
          try {
            const parsed: StoredHomestayPaymentPayload = JSON.parse(raw);
            sessionStorage.setItem(
              "tplHomestayBookingData",
              JSON.stringify({
                ...parsed,
                timerLeft: next > 0 ? next : 0,
              })
            );
          } catch (error) {
            console.error("Failed to update homestay timer:", error);
          }
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

  if (!storedPayload?.homestay) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#eef3f8] text-black">
        <div className="rounded-xl border border-[#d9e2ec] bg-white p-6 text-[16px] font-semibold text-[#374151]">
          Homestay payment data not found.
        </div>
      </main>
    );
  }

  const homestay = storedPayload.homestay;
  const selectedVariant = storedPayload.selectedVariant;
  const searchMeta = storedPayload.searchMeta;

  const stayPrice =
    storedPayload.fareBreakup?.stayPrice ||
    selectedVariant?.price ||
    homestay.pricePerNight ||
    0;

  const taxesPerNight = selectedVariant?.taxes || homestay.taxes || 0;
  const rooms = storedPayload.fareBreakup?.rooms || searchMeta.rooms || 1;

  const start = parseLocalDate(searchMeta.checkIn);
  const end = parseLocalDate(searchMeta.checkOut);
  const diff = start && end ? end.getTime() - start.getTime() : Number.NaN;

  const nights =
    storedPayload.fareBreakup?.nights ||
    searchMeta.nights ||
    (Number.isNaN(diff) || diff <= 0
      ? 1
      : Math.ceil(diff / (1000 * 60 * 60 * 24)));

  const subtotal =
    storedPayload.fareBreakup?.subtotal || stayPrice * rooms * nights;

  const taxes =
    storedPayload.fareBreakup?.taxes || taxesPerNight * rooms * nights;

  const cabTotal =
    storedPayload.fareBreakup?.cabTotal ??
    (storedPayload.cabSelected && (storedPayload.cabTotal || 0) > 0
      ? storedPayload.cabTotal || 0
      : 0);

  const addOnsTotal =
    storedPayload.fareBreakup?.addOnsTotal ??
    (storedPayload.addonsSelected && (storedPayload.addOnsTotal || 0) > 0
      ? storedPayload.addOnsTotal || 0
      : 0);

  const appliedOffer =
    storedPayload.fareBreakup?.appliedOffer ??
    storedPayload.appliedOffer ??
    0;

  const benefitPricing = applyBenefitPricing({
    baseAmount: subtotal,

    taxes,

    insuranceCharges: tripSecureSelected ? tripSecureAmount : 0,
    cabCharges: cabTotal,
    addOns: addOnsTotal,

    offerDiscount: appliedOffer,

    promoCredit: activeUser?.mobile ? wallet.promoCredit : 0,
    earnedCredit: activeUser?.mobile ? wallet.earnedCredit : 0,
    refundWallet: activeUser?.mobile ? wallet.refundableBalance : 0,
  });

  const savedPromoUsed = benefitPricing.promoUsed;
  const savedEarnedUsed = benefitPricing.earnedUsed;
  const savedRefundUsed = benefitPricing.refundUsed;

  const walletUsed =
    Number(savedPromoUsed || 0) +
    Number(savedEarnedUsed || 0) +
    Number(savedRefundUsed || 0);

  const oldTplCredit = Number(storedPayload.tplCredit || 0);

  const tplCredit =
    oldTplCredit +
    Number(savedPromoUsed || 0) +
    Number(savedEarnedUsed || 0);

  const totalBeforeWallet = benefitPricing.payableBeforeRefundWallet;

  const finalPayable = benefitPricing.finalPayable;

  const earnedOnThisBooking = Math.floor(
    Number(benefitPricing.baseAfterOffer || 0) * 0.02
  );

  const priceBreakup = {
    stayPrice,
    rooms,
    nights,
    subtotal,
    taxes,
    tripSecureTotal: tripSecureSelected ? tripSecureAmount : 0,
    cabTotal,
    addOnsTotal,
    tplCredit,
    appliedOffer: benefitPricing.offerDiscount,
    totalAmount: finalPayable,
    walletBreakdown: {
      promoUsed: savedPromoUsed,
      earnedUsed: savedEarnedUsed,
      refundUsed: savedRefundUsed,
    },
    totalBeforeWallet,
    baseAfterOffer: benefitPricing.baseAfterOffer,
    earnedOnThisBooking,
  };

  const buildConfirmationPayload = () => {
    const guests =
      storedPayload.guestValidation?.travellers ||
      storedPayload.guestValidation?.guests ||
      [];

    const contactDetails = storedPayload.guestValidation?.contactDetails;
    const leadGuest = guests?.[0] || {};

    const bookingId = `HMS-${Date.now()}`;
    const homestayName = getHomestayName(homestay);
    const city = getHomestayCity(homestay, searchMeta);
    const address = getHomestayAddress(homestay, searchMeta);

    return {
      bookingId,
      bookingStatus: "Confirmed",
      paymentStatus: "Paid",
      bookedOn: new Date().toISOString(),

      homestayName,
      city,
      address,
      location: city,

      roomType:
        selectedVariant?.name ||
        selectedVariant?.roomType ||
        selectedVariant?.title ||
        "Selected Stay",

      checkInDate: searchMeta.checkIn,
      checkOutDate: searchMeta.checkOut,
      nights,
      rooms,
      guests: (searchMeta.adults || 0) + (searchMeta.children || 0),

      leadGuest: {
        title: leadGuest?.title || "",
        firstName:
          leadGuest?.firstName || leadGuest?.name?.split?.(" ")?.[0] || "",
        lastName:
          leadGuest?.lastName ||
          (leadGuest?.name?.split?.(" ")?.slice(1).join(" ") ?? ""),
        email: contactDetails?.email || leadGuest?.email || "",
        phone: `${
          contactDetails?.countryCode || "+91"
        } ${contactDetails?.mobile || leadGuest?.phone || ""}`.trim(),
      },

      guestList: Array.isArray(guests)
        ? guests.map((guest: any) => ({
            title: guest?.title || "",
            firstName:
              guest?.firstName || guest?.name?.split?.(" ")?.[0] || "",
            lastName:
              guest?.lastName ||
              (guest?.name?.split?.(" ")?.slice(1).join(" ") ?? ""),
            gender: guest?.gender || "",
            email: guest?.email || contactDetails?.email || "",
            phone: guest?.phone || contactDetails?.mobile || "",
          }))
        : [],

      fare: {
        baseFare: subtotal,
        taxesAndFees: taxes,
        discount: benefitPricing.offerDiscount + tplCredit,
        baseAfterOffer: benefitPricing.baseAfterOffer,
        earnedCreditAmount: earnedOnThisBooking,
        oldTplCredit,
        walletUsed,
        addOns:
          (tripSecureSelected ? tripSecureAmount : 0) +
          cabTotal +
          addOnsTotal,
        totalBeforeWallet,
        totalPaid: finalPayable,
        totalAmount: finalPayable,
        walletBreakdown: {
          promoUsed: savedPromoUsed,
          earnedUsed: savedEarnedUsed,
          refundUsed: savedRefundUsed,
          promoAvailable: storedPayload.walletBreakdown?.promoAvailable,
          earnedAvailable: storedPayload.walletBreakdown?.earnedAvailable,
          refundWalletAvailable:
            storedPayload.walletBreakdown?.refundWalletAvailable,
          totalWalletUsed: walletUsed,
          earnedOnThisBooking,
        },
      },

      paymentMethod: selectedPaymentMethod || "Online Payment",

      paymentData: {
        method: selectedPaymentMethod || "Online Payment",
        totalPaid: finalPayable,
        paidAt: new Date().toISOString(),
        walletUsed,
        promoUsed: savedPromoUsed,
        earnedUsed: savedEarnedUsed,
        refundUsed: savedRefundUsed,
      },

      bookingMeta: {
        bookingId,
        bookingStatus: "confirmed",
        paymentStatus: "paid",
        createdAt: new Date().toISOString(),
        serviceType: "homestay",
      },

      homestay,
      selectedVariant,
      searchMeta,
      specialRequest: storedPayload.specialRequest || "",
      appliedOffer: benefitPricing.offerDiscount || 0,
      tplCredit,
      oldTplCredit,
      appliedOfferCode: storedPayload.appliedOfferCode || "",
      appliedOfferTitle: storedPayload.appliedOfferTitle || "",

      cabData: {
        selected: !!storedPayload.cabSelected,
        amount: cabTotal,
        label: storedPayload.cabLabel || "",
      },
      addonsData: {
        selected: !!storedPayload.addonsSelected,
        amount: addOnsTotal,
        label: storedPayload.addonsLabel || "",
      },
      tripSecureData: {
        selected: tripSecureSelected,
        amount: tripSecureSelected ? tripSecureAmount : 0,
        label: storedPayload.tripSecureLabel || "",
      },
    };
  };

  const handleMockPayment = async (shouldSucceed = true) => {
    if (!selectedPaymentMethod || isExpired) return;

    setPaymentActionState("processing");
    startPaymentProcess();

    await new Promise((resolve) => setTimeout(resolve, 1500));

    if (shouldSucceed) {
      const activeMobile = activeUser?.mobile || "";

      if (activeMobile) {
        const latestWallet = getWallet(activeMobile);

        const nextWallet: Wallet = {
          promoCredit: Math.max(
            Number(latestWallet.promoCredit || 0) - Number(savedPromoUsed || 0),
            0
          ),
          earnedCredit: Math.max(
            Number(latestWallet.earnedCredit || 0) -
              Number(savedEarnedUsed || 0),
            0
          ),
          refundableBalance: Math.max(
            Number(latestWallet.refundableBalance || 0) -
              Number(savedRefundUsed || 0),
            0
          ),
        };

        saveWallet(nextWallet, activeMobile);
        setWallet(nextWallet);

        if (Number(savedPromoUsed || 0) > 0) {
          addWalletLedgerItem(
            {
              type: "wallet_used",
              title: "TPL Promo Credit Used",
              description: "Promo credit used for homestay booking payment",
              amount: Number(savedPromoUsed || 0),
            },
            activeMobile
          );
        }

        if (Number(savedEarnedUsed || 0) > 0) {
          addWalletLedgerItem(
            {
              type: "wallet_used",
              title: "TPL Earned Credit Used",
              description: "Earned credit used for homestay booking payment",
              amount: Number(savedEarnedUsed || 0),
            },
            activeMobile
          );
        }

        if (Number(savedRefundUsed || 0) > 0) {
          addWalletLedgerItem(
            {
              type: "wallet_used",
              title: "Refund Wallet Used",
              description: "Refund wallet used for homestay booking payment",
              amount: Number(savedRefundUsed || 0),
            },
            activeMobile
          );
        }
      }

      handlePaymentSuccess();
      confirmBooking();

      const confirmationPayload = buildConfirmationPayload();

      try {
        sessionStorage.setItem(
          "homestayConfirmationData",
          JSON.stringify(confirmationPayload)
        );

        sessionStorage.setItem(
          "homestayPaymentSuccessData",
          JSON.stringify(confirmationPayload)
        );

        sessionStorage.removeItem("tplHomestayBookingData");
      } catch (error) {
        console.error("Failed to store homestay confirmation payload:", error);
      }

      setPaymentActionState("success");

      setTimeout(() => {
        router.push("/homestays/confirmation");
      }, 600);
    } else {
      handlePaymentFailure();
      setPaymentActionState("failure");
    }
  };

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#eef3f8] pb-6 text-black">
      <div className="sticky top-0 z-40 border-b border-[#d7dce3] bg-white md:hidden">
        <div className="flex h-12 items-center gap-3 px-3">
          <button
            type="button"
            onClick={() => router.push("/homestays/booking")}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#e5e7eb] bg-white text-[#111827]"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div className="min-w-0 flex-1">
            <div className="truncate text-[14px] font-black text-[#111827]">
              Homestay Payment
            </div>
            <div className="text-[11px] font-semibold text-[#64748b]">
              Select payment method
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-[56px] items-center justify-between border-b border-[#d9e2ec] bg-white px-3 md:h-[72px] md:px-7">
        <div className="hidden text-[26px] font-black tracking-[-0.4px] text-[#111827] md:block">
          TPL
        </div>

        <div className="ml-auto flex items-center gap-2 text-[12px] font-extrabold md:gap-3 md:text-[13px]">
          <span
            className={`inline-flex h-[30px] min-w-[64px] items-center justify-center rounded-full border border-[#d9e2ec] bg-white px-3 ${
              timeLeft < 120 ? "text-[#dc2626]" : "text-[#111827]"
            }`}
          >
            {formattedTime}
          </span>

          <span className="inline-flex h-[30px] items-center justify-center rounded-full border border-[#d9e2ec] bg-white px-3 font-extrabold text-[#0f766e]">
            SAFE & SECURED
          </span>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-3 py-3 md:px-4 md:py-6">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(300px,0.39fr)] lg:items-start lg:gap-[18px]">
          <div className="flex min-w-0 flex-col gap-4">
            <HomestayPaymentTopSummary
              homestay={homestay}
              selectedVariant={selectedVariant}
              searchMeta={searchMeta}
              guestValidation={storedPayload.guestValidation}
              tripSecureData={{
                selected: tripSecureSelected,
                amount: tripSecureSelected ? tripSecureAmount : 0,
              }}
              cabData={{
                selected: !!storedPayload.cabSelected,
                amount: cabTotal,
                label: storedPayload.cabLabel || "No cab selected",
              }}
              addonsData={{
                selected: !!storedPayload.addonsSelected,
                amount: addOnsTotal,
                label: storedPayload.addonsLabel || "No add-ons selected",
              }}
              offerData={
                appliedOffer > 0
                  ? {
                      code: storedPayload.appliedOfferCode || "",
                      title:
                        storedPayload.appliedOfferTitle || "Offer Applied",
                      amount: benefitPricing.offerDiscount,
                    }
                  : null
              }
              specialRequest={storedPayload.specialRequest || ""}
            />

            <div className="overflow-hidden rounded-2xl border border-[#d9e2ec] bg-white shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
              <div className="flex flex-col gap-3 border-b border-[#e5e7eb] px-4 py-4 md:flex-row md:flex-wrap md:items-center md:justify-between md:gap-4 md:px-5">
                <div className="min-w-0">
                  <div className="text-[15px] font-extrabold text-[#111827] md:text-[16px]">
                    Additional discounts and saved payment options
                  </div>
                  <div className="mt-1 text-[13px] text-[#6b7280]">
                    {activeUser?.mobile
                      ? "Wallet benefits are applied as per your booking snapshot."
                      : "Login to access saved cards and wallet discounts."}
                  </div>
                </div>

                {!activeUser?.mobile ? (
                  <button
                    onClick={() => setShowLoginModal(true)}
                    className="h-[42px] w-full min-w-[110px] rounded-[10px] bg-[#1d9bf0] px-4 text-[14px] font-extrabold text-white md:w-auto"
                  >
                    LOGIN
                  </button>
                ) : null}
              </div>
            </div>

            <HomestayPaymentTripSecureCard
              defaultSelected={tripSecureSelected}
              defaultAmount={storedPayload.tripSecureTotal || 499}
              onSelectionChange={({ selected, totalAmount }) => {
                setTripSecureSelected(selected);
                setTripSecureAmount(totalAmount);
              }}
            />

            <HomestayPaymentOptionSection
              payableAmount={finalPayable}
              onPaymentMethodChange={(method) => {
                setSelectedPaymentMethod(method);
                applyPaymentMethod(method);
              }}
            />
          </div>

          <div className="min-w-0">
            <HomestayPaymentPriceCard
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
