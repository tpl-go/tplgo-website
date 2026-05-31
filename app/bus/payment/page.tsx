"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import BusBookingTopBar from "@/app/components/booking/bus/BusBookingTopBar";
import BusPaymentTopSummary from "@/app/components/payment/bus/BusPaymentTopSummary";
import BusPaymentTripSecureCard from "@/app/components/payment/bus/BusPaymentTripSecureCard";
import BusPaymentOptionSection from "@/app/components/payment/bus/BusPaymentOptionSection";
import BusPaymentPriceCard from "@/app/components/payment/bus/BusPaymentPriceCard";
import LoginModal from "@/app/components/common/LoginModal";
import MobileInnerBack from "@/app/components/common/mobile/MobileInnerBack";

import { AUTH_UPDATED_EVENT } from "@/app/lib/booking/guestAuth";
import {
  getWallet,
  saveWallet,
  addWalletLedgerItem,
  type Wallet,
} from "@/app/lib/wallet/walletStorage";

type BusPaymentPayload = {
  serviceType?: string;
  bookingType?: string;
  bookingStatus?: string;
  paymentStatus?: string;

  bookingPayload: {
    search: {
      fromCity: string;
      fromPoint: string;
      toCity: string;
      toPoint: string;
      date: string;
    };
    bus: any;
    selectedSeats: { seatNumber: string; price: number }[];
    selectedBoardingPoint: {
      id: string;
      name: string;
      address: string;
      time: string;
    };
    selectedDroppingPoint: {
      id: string;
      name: string;
      address: string;
      time: string;
    };
    totalFare: number;
    travellerCount: number;
  };

  travellers: {
    seatNumber: string;
    fullName: string;
    age: string;
    gender: "Male" | "Female" | "";
  }[];

  contactDetails: {
    email: string;
    mobile: string;
    hasGst: boolean;
    state: string;
    saveBilling: boolean;
  };

  addons: {
    tripAssuredSelected: boolean;
    tripAssuredTotal: number;
    freeCancellationSelected: boolean;
    freeCancellationTotal: number;
  };

  appliedOffer: {
    code?: string;
    title?: string;
    description?: string;
    discountAmount?: number;
  } | null;

  pricing: {
  baseFare: number;

  seatUpgradeTotal?: number;
  seatCharges?: number;

  taxAndSurcharge: number;
  discount: number;
    offerApplied: number;
    tplCredit: number;
    tripAssuredTotal: number;
    freeCancellationTotal: number;

    totalBeforeWallet?: number;
    promoUsed?: number;
    earnedUsed?: number;
    refundUsed?: number;

    finalTotal: number;
  };

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

  originalBookingBaseline?: {
    amount?: number;
    payableAmount?: number;
    totalBeforeWallet?: number;
    baseFare?: number;
    taxAndSurcharge?: number;
    tripAssuredTotal?: number;
    freeCancellationTotal?: number;
    selectedSeats?: { seatNumber: string; price: number }[];
  };

  manageBookingReady?: boolean;
  timerLeft: number;
  timestamp?: number;
};

function getActiveUser() {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem("tpl_auth_session_v1");
    return raw ? JSON.parse(raw)?.user : null;
  } catch {
    return null;
  }
}

function buildBookingId() {
  return `BUS-${Date.now()}`;
}

function buildPaymentId() {
  return `BUSPAY-${Date.now()}`;
}

function buildTicketNumber() {
  return `TKT-${Date.now().toString().slice(-8)}`;
}

export default function BusPaymentPage() {
  const router = useRouter();

  const [paymentData, setPaymentData] = useState<BusPaymentPayload | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [paymentActionState, setPaymentActionState] = useState<
    "idle" | "processing" | "success" | "failure"
  >("idle");

  const [timerLeft, setTimerLeft] = useState(10 * 60);
  const [isExpired, setIsExpired] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const [activeUser, setActiveUser] = useState<any>(null);
  const [wallet, setWallet] = useState<Wallet>({
    promoCredit: 0,
    earnedCredit: 0,
    refundableBalance: 0,
  });

  const [tripSecureSelection, setTripSecureSelection] = useState({
    selected: false,
    totalAmount: 0,
  });

  useEffect(() => {
    const raw = sessionStorage.getItem("tplBusPaymentData");
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as BusPaymentPayload;
      setPaymentData(parsed);
      setTimerLeft(parsed.timerLeft || 10 * 60);
    } catch (error) {
      console.error("Failed to parse bus payment data", error);
      setPaymentData(null);
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
    if (!paymentData) return;

    setTripSecureSelection({
      selected: paymentData.addons?.tripAssuredSelected || false,
      totalAmount: paymentData.addons?.tripAssuredTotal || 0,
    });
  }, [paymentData]);

  useEffect(() => {
    if (!paymentData) return;

    if (timerLeft <= 0) {
      setIsExpired(true);
      return;
    }

    const timer = setInterval(() => {
      setTimerLeft((prev) => {
        const next = prev > 0 ? prev - 1 : 0;

        try {
          sessionStorage.setItem(
            "tplBusPaymentData",
            JSON.stringify({
              ...paymentData,
              timerLeft: next,
            })
          );
        } catch (error) {
          console.error("Failed to update bus timer in sessionStorage", error);
        }

        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [paymentData, timerLeft]);

  const timerLabel = useMemo(() => {
    const mm = String(Math.max(0, Math.floor(timerLeft / 60))).padStart(2, "0");
    const ss = String(Math.max(0, timerLeft % 60)).padStart(2, "0");
    return `${mm}:${ss}`;
  }, [timerLeft]);

  const handleTripSecureChange = useCallback(
    (payload: { selected: boolean; totalAmount: number }) => {
      setTripSecureSelection((prev) => {
        if (
          prev.selected === payload.selected &&
          prev.totalAmount === payload.totalAmount
        ) {
          return prev;
        }

        return payload;
      });
    },
    []
  );

  const totalBeforeWallet = useMemo(() => {
    if (!paymentData) return 0;

    return Number(
      paymentData.pricing?.totalBeforeWallet ??
        paymentData.originalBookingBaseline?.totalBeforeWallet ??
        paymentData.pricing?.baseFare +
          paymentData.pricing?.taxAndSurcharge +
          (tripSecureSelection.selected ? tripSecureSelection.totalAmount : 0) +
          (paymentData.pricing?.freeCancellationTotal || 0) -
          (paymentData.pricing?.discount || 0) -
          (paymentData.pricing?.offerApplied || 0)
    );
  }, [paymentData, tripSecureSelection]);

  const savedPromoUsed = useMemo(() => {
    return Number(
      paymentData?.walletBreakdown?.promoUsed ??
        paymentData?.pricing?.promoUsed ??
        0
    );
  }, [paymentData]);

  const savedEarnedUsed = useMemo(() => {
    return Number(
      paymentData?.walletBreakdown?.earnedUsed ??
        paymentData?.pricing?.earnedUsed ??
        0
    );
  }, [paymentData]);

  const savedRefundUsed = useMemo(() => {
    return Number(
      paymentData?.walletBreakdown?.refundUsed ??
        paymentData?.pricing?.refundUsed ??
        0
    );
  }, [paymentData]);

  const walletUsed = useMemo(() => {
    return savedPromoUsed + savedEarnedUsed + savedRefundUsed;
  }, [savedPromoUsed, savedEarnedUsed, savedRefundUsed]);

  const earnedOnThisBooking = useMemo(() => {
    return Number(
      paymentData?.walletBreakdown?.earnedOnThisBooking ??
        Math.floor(Math.max(totalBeforeWallet, 0) * 0.02)
    );
  }, [paymentData, totalBeforeWallet]);

  const recalculatedTotal = useMemo(() => {
    if (!paymentData) return 0;

    return Math.max(
      Number(
        paymentData.pricing?.finalTotal ??
          paymentData.originalBookingBaseline?.payableAmount ??
          paymentData.originalBookingBaseline?.amount ??
          totalBeforeWallet - walletUsed
      ),
      0
    );
  }, [paymentData, totalBeforeWallet, walletUsed]);

  const buildConfirmationPayload = useCallback(() => {
    if (!paymentData) return null;

    const {
      bookingPayload,
      travellers,
      contactDetails,
      addons,
      appliedOffer,
      pricing,
    } = paymentData;

    const bus = bookingPayload.bus || {};
    const boarding = bookingPayload.selectedBoardingPoint || {};
    const dropping = bookingPayload.selectedDroppingPoint || {};
    const search = bookingPayload.search || {};
    const selectedSeats = bookingPayload.selectedSeats || [];

    const bookingId = buildBookingId();
    const paymentId = buildPaymentId();
    const ticketNumber = buildTicketNumber();
    const bookedOn = new Date().toISOString();

    return {
      bookingId,
      paymentId,
      ticketNumber,
      bookingStatus: "confirmed",
      paymentStatus: "paid",
      bookedOn,
      paidAt: bookedOn,
      paymentMethod: selectedPaymentMethod || "Online Payment",

      busName:
        bus?.name ||
        bus?.busName ||
        bus?.travelsName ||
        bus?.operatorName ||
        "Bus Booking",
      operatorName:
        bus?.operatorName ||
        bus?.travelsName ||
        bus?.vendorName ||
        bus?.name ||
        "Bus Operator",
      busType: bus?.busType || bus?.type || bus?.coachType || "Bus",

      fromCity: search?.fromCity || "",
      toCity: search?.toCity || "",
      fromPoint: search?.fromPoint || boarding?.name || "",
      toPoint: search?.toPoint || dropping?.name || "",
      route: `${search?.fromCity || "Origin"} → ${
        search?.toCity || "Destination"
      }`,
      travelDate: search?.date || "",

      boardingPoint: boarding,
      droppingPoint: dropping,
      departureTime: boarding?.time || bus?.departureTime || "",
      arrivalTime: dropping?.time || bus?.arrivalTime || "",
      duration: bus?.duration || "",

      travellers: Array.isArray(travellers)
        ? travellers.map((traveller, index) => ({
            id: String(index + 1),
            fullName: traveller?.fullName || "",
            gender: traveller?.gender || "",
            age: traveller?.age || "",
            seatNumber: traveller?.seatNumber || "",
          }))
        : [],

      contactDetails: {
        countryCode: "+91",
        mobile: contactDetails?.mobile || "",
        email: contactDetails?.email || "",
        hasGst: contactDetails?.hasGst || false,
        state: contactDetails?.state || "",
        saveBilling: contactDetails?.saveBilling || false,
      },

      selectedSeats,

      fare: {
  baseFare: Number(pricing.baseFare || 0),

  seatUpgradeTotal: Number(
    pricing.seatUpgradeTotal ||
      pricing.seatCharges ||
      0
  ),

  seatCharges: Number(
    pricing.seatUpgradeTotal ||
      pricing.seatCharges ||
      0
  ),

  taxAndSurcharge: Number(pricing.taxAndSurcharge || 0),
        tripSecureTotal: tripSecureSelection.selected
          ? tripSecureSelection.totalAmount
          : 0,
        freeCancellationTotal: Number(pricing.freeCancellationTotal || 0),
        discount: Number(pricing.discount || 0),
        appliedOffer: Number(pricing.offerApplied || 0),
        oldTplCredit: 0,
        tplCredit: walletUsed,
        walletUsed,
        walletBreakdown: {
          promoUsed: savedPromoUsed,
          earnedUsed: savedEarnedUsed,
          refundUsed: savedRefundUsed,
          promoAvailable: paymentData.walletBreakdown?.promoAvailable,
          earnedAvailable: paymentData.walletBreakdown?.earnedAvailable,
          refundWalletAvailable:
            paymentData.walletBreakdown?.refundWalletAvailable,
          totalWalletUsed: walletUsed,
          earnedOnThisBooking,
        },
        totalBeforeWallet,
        totalPaid: recalculatedTotal,
        totalAmount: recalculatedTotal,
      },

      paymentData: {
        method: selectedPaymentMethod || "Online Payment",
        totalPaid: recalculatedTotal,
        paidAt: bookedOn,
        walletUsed,
        promoUsed: savedPromoUsed,
        earnedUsed: savedEarnedUsed,
        refundUsed: savedRefundUsed,
      },

      bookingMeta: {
        bookingId,
        bookingStatus: "confirmed",
        paymentStatus: "paid",
        createdAt: bookedOn,
        serviceType: "bus",
      },

      bookingPayload,
      addons: {
        ...addons,
        tripAssuredSelected: tripSecureSelection.selected,
        tripAssuredTotal: tripSecureSelection.selected
          ? tripSecureSelection.totalAmount
          : 0,
      },
      appliedOffer,
    };
  }, [
    paymentData,
    tripSecureSelection,
    recalculatedTotal,
    selectedPaymentMethod,
    savedPromoUsed,
    savedEarnedUsed,
    savedRefundUsed,
    walletUsed,
    totalBeforeWallet,
    earnedOnThisBooking,
  ]);

  const handlePayNow = useCallback(() => {
    if (!paymentData) return;
    if (isExpired || !selectedPaymentMethod) return;

    setPaymentActionState("processing");

    setTimeout(() => {
      try {
        if (activeUser?.mobile) {
          const latestWallet = getWallet(activeUser.mobile);

          const nextWallet: Wallet = {
            promoCredit: Math.max(
              Number(latestWallet.promoCredit || 0) - savedPromoUsed,
              0
            ),
            earnedCredit: Math.max(
              Number(latestWallet.earnedCredit || 0) - savedEarnedUsed,
              0
            ),
            refundableBalance: Math.max(
              Number(latestWallet.refundableBalance || 0) - savedRefundUsed,
              0
            ),
          };

          saveWallet(nextWallet, activeUser.mobile);
          setWallet(nextWallet);

          if (savedPromoUsed > 0) {
            addWalletLedgerItem(
              {
                type: "wallet_used",
                title: "TPL Promo Credit Used",
                description: "Promo credit used for bus booking payment",
                amount: savedPromoUsed,
              },
              activeUser.mobile
            );
          }

          if (savedEarnedUsed > 0) {
            addWalletLedgerItem(
              {
                type: "wallet_used",
                title: "TPL Earned Credit Used",
                description: "Earned credit used for bus booking payment",
                amount: savedEarnedUsed,
              },
              activeUser.mobile
            );
          }

          if (savedRefundUsed > 0) {
            addWalletLedgerItem(
              {
                type: "wallet_used",
                title: "Refund Wallet Used",
                description: "Refund wallet used for bus booking payment",
                amount: savedRefundUsed,
              },
              activeUser.mobile
            );
          }
        }

        const confirmedPayload = buildConfirmationPayload();

        if (confirmedPayload) {
          sessionStorage.setItem(
            "busConfirmationData",
            JSON.stringify(confirmedPayload)
          );

          sessionStorage.setItem(
            "busPaymentSuccessData",
            JSON.stringify(confirmedPayload)
          );

          sessionStorage.setItem(
            "tplBusPaymentConfirmedData",
            JSON.stringify(confirmedPayload)
          );
        }

        setPaymentActionState("success");

        setTimeout(() => {
          router.push("/bus/confirmation");
        }, 600);
      } catch (error) {
        console.error("Bus payment success handling failed", error);
        setPaymentActionState("failure");
      }
    }, 1800);
  }, [
    paymentData,
    isExpired,
    selectedPaymentMethod,
    buildConfirmationPayload,
    router,
    activeUser,
    savedPromoUsed,
    savedEarnedUsed,
    savedRefundUsed,
  ]);

  const handleRetryPayment = useCallback(() => {
    if (isExpired) return;
    setPaymentActionState("idle");
  }, [isExpired]);

  if (!paymentData) {
    return (
      <main className="min-h-screen overflow-x-hidden bg-[#f5f7fb]">
        <div className="bg-[#f5f7fb] px-3 pt-3 lg:hidden">
          <MobileInnerBack title="Bus Payment" />
        </div>
        <BusBookingTopBar timerLabel="10:00" />
        <div className="mx-auto max-w-[1400px] px-3 py-4 md:px-4 md:py-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-[18px] font-bold text-slate-700">
            No payment data found.
          </div>
        </div>
      </main>
    );
  }

  const {
    bookingPayload,
    travellers,
    contactDetails,
    addons,
    appliedOffer,
    pricing,
  } = paymentData;

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f5f7fb] pb-5 text-black">
      <div className="bg-[#f5f7fb] px-3 pt-3 lg:hidden">
        <MobileInnerBack title="Bus Payment" />
      </div>
      <BusBookingTopBar timerLabel={timerLabel} />

      <div className="mx-auto max-w-[1400px] px-3 py-4 md:px-4 md:py-6">
        <div className="flex flex-col items-stretch gap-4 lg:flex-row lg:items-start lg:gap-5">
          <div className="w-full min-w-0 space-y-4 lg:w-[74%] lg:space-y-5">
            <BusPaymentTopSummary
              bookingPayload={bookingPayload}
              travellers={travellers}
              contactDetails={contactDetails}
              addons={{
                ...addons,
                tripAssuredSelected: tripSecureSelection.selected,
                tripAssuredTotal: tripSecureSelection.selected
                  ? tripSecureSelection.totalAmount
                  : 0,
              }}
              offerData={appliedOffer}
            />

            <section className="rounded-2xl border border-[#d9e2ec] bg-white px-4 py-4 shadow-sm sm:px-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="text-[16px] font-extrabold text-[#111827]">
                    Additional discounts and saved payment options
                  </div>
                  <div className="mt-1 text-[13px] text-[#6b7280]">
                    {activeUser?.mobile
                      ? "Wallet benefits are applied as per your booking snapshot."
                      : "Login to access saved cards and exclusive bus offers."}
                  </div>
                </div>

                {!activeUser?.mobile ? (
                  <button
                    type="button"
                    onClick={() => setShowLoginModal(true)}
                    className="h-[42px] w-full rounded-xl bg-[#1d9bf0] px-5 text-[13px] font-extrabold text-white transition hover:opacity-95 sm:w-auto sm:min-w-[110px]"
                  >
                    LOGIN
                  </button>
                ) : null}
              </div>
            </section>

            <BusPaymentTripSecureCard
              defaultSelected={tripSecureSelection.selected}
              defaultAmount={addons?.tripAssuredTotal || 0}
              onSelectionChange={handleTripSecureChange}
            />

            <BusPaymentOptionSection
              defaultOption={null}
              payableAmount={recalculatedTotal}
              onPaymentMethodChange={setSelectedPaymentMethod}
            />
          </div>

          <div className="w-full min-w-0 self-start lg:w-[26%]">
            <BusPaymentPriceCard
  priceBreakup={{
    baseFare: pricing.baseFare,

    seatUpgradeTotal:
      pricing.seatUpgradeTotal ||
      pricing.seatCharges ||
      0,

    taxAndSurcharge: pricing.taxAndSurcharge,

    tripSecureTotal: tripSecureSelection.selected
      ? tripSecureSelection.totalAmount
      : 0,

    freeCancellationTotal: pricing.freeCancellationTotal,

    tplCredit: walletUsed,

    appliedOffer: pricing.offerApplied,

    totalAmount: recalculatedTotal,

    totalBeforeWallet,

    earnedOnThisBooking,

    walletCalc: {
      promoUsed: savedPromoUsed,
      earnedUsed: savedEarnedUsed,
      refundUsed: savedRefundUsed,
    },
  }}
  selectedPaymentMethod={selectedPaymentMethod}
  paymentActionState={paymentActionState}
  isExpired={isExpired}
  onPayNow={handlePayNow}
  onRetryPayment={handleRetryPayment}
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
