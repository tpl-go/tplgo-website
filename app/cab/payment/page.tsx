"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import LoginModal from "@/app/components/common/LoginModal";
import MobileInnerBack from "@/app/components/common/mobile/MobileInnerBack";

import CabBookingTopBar from "@/app/components/booking/cab/CabBookingTopBar";
import CabPaymentTopSummary from "@/app/components/payment/cab/CabPaymentTopSummary";
import CabPaymentOptionSection from "@/app/components/payment/cab/CabPaymentOptionSection";
import CabPaymentPriceCard from "@/app/components/payment/cab/CabPaymentPriceCard";

import {
  generateCabBookingId,
  generateCabTransactionId,
  saveCabConfirmedBooking,
} from "@/app/lib/cab/cabConfirmationHelpers";
import {
  confirmCabBackendCheckout,
  startCabBackendCheckout,
  type CabBackendCheckoutRefs,
} from "@/app/lib/api/cabCheckoutIntegration";

import { AUTH_UPDATED_EVENT } from "@/app/lib/booking/guestAuth";
import {
  getWallet,
  saveWallet,
  addWalletLedgerItem,
  type Wallet,
} from "@/app/lib/wallet/walletStorage";

type CabPaymentPayload = {
  cab: {
    id: string;
    name: string;
    brand?: string;
    image?: string;
    rideType?: string;
    vehicleType?: string;
    fuelType?: string;
    transmission?: string;
    seats?: number;
    luggage?: number;
    engineCc?: number;
    helmetIncluded?: boolean;
    rating?: number;
    reviewCount?: number;
    finalPrice: number;
    kmsIncluded?: number;
    extraKmFare?: number;
  };
  searchMeta: {
  rideType?: string;
  from?: string;
  to?: string;
  pickup?: string;
  drop?: string;
  departureDate?: string;
  returnDate?: string;
  pickupDate?: string;
  dropDate?: string;
  pickupTime?: string;
  dropTime?: string;
  rentalPackage?: string;
};
  traveller: {
    pickupLocation?: string;
    fullName?: string;
    gender?: string;
    mobile?: string;
    email?: string;
    usePickupAsBillingAddress?: boolean;
  };
  selectedAddons: {
    id: string;
    title: string;
    description: string;
    price: number;
  }[];
  appliedOffer?: {
    id?: string;
    code?: string;
    title?: string;
    description?: string;
    discountAmount?: number;
  } | null;
  fare: {
    baseFare: number;
    taxesAndFees: number;
    specialRequestTotal: number;
    offerDiscount: number;
    tplCredit: number;
    totalPayable: number;
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
    taxesAndFees?: number;
    specialRequestTotal?: number;
  };
  bookingData?: any;
  timerLeft: number;
  backendCheckoutId?: string;
  backendBookingId?: string;
  backendPaymentId?: string;
  backendRequestId?: string;
  backendServiceType?: "cab";
  backendCheckoutStatus?: string;
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

export default function CabPaymentPage() {
  const router = useRouter();

  const [paymentData, setPaymentData] = useState<CabPaymentPayload | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [paymentActionState, setPaymentActionState] = useState<
    "idle" | "processing" | "success" | "failure"
  >("idle");

  const [activeUser, setActiveUser] = useState<any>(null);
  const [wallet, setWallet] = useState<Wallet>({
    promoCredit: 0,
    earnedCredit: 0,
    refundableBalance: 0,
  });

  useEffect(() => {
    const raw = sessionStorage.getItem("tplCabPaymentData");
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as CabPaymentPayload;
      setPaymentData(parsed);
    } catch (error) {
      console.error("Failed to parse cab payment data", error);
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
    if (paymentData.timerLeft <= 0) return;

    const timer = setInterval(() => {
      setPaymentData((prev) => {
        if (!prev) return prev;

        const nextTimer = prev.timerLeft > 0 ? prev.timerLeft - 1 : 0;

        const updated = {
          ...prev,
          timerLeft: nextTimer,
        };

        try {
          sessionStorage.setItem("tplCabPaymentData", JSON.stringify(updated));
        } catch (error) {
          console.error("Failed to update cab timer in sessionStorage", error);
        }

        return updated;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [paymentData?.timerLeft]);

  const timerLabel = useMemo(() => {
    if (!paymentData) return "10:00";
    const mm = String(Math.floor(paymentData.timerLeft / 60)).padStart(2, "0");
    const ss = String(paymentData.timerLeft % 60).padStart(2, "0");
    return `${mm}:${ss}`;
  }, [paymentData]);

  const isExpired = !paymentData || paymentData.timerLeft <= 0;

  const walletPriceBreakup = useMemo(() => {
    if (!paymentData) return null;

    const baseFare = Number(paymentData.fare?.baseFare || 0);
    const taxesAndFees = Number(paymentData.fare?.taxesAndFees || 0);
    const specialRequestTotal = Number(
      paymentData.fare?.specialRequestTotal || 0
    );
    const offerDiscount = Number(paymentData.fare?.offerDiscount || 0);

    const promoUsed = Number(paymentData.walletBreakdown?.promoUsed || 0);
    const earnedUsed = Number(paymentData.walletBreakdown?.earnedUsed || 0);
    const refundUsed = Number(paymentData.walletBreakdown?.refundUsed || 0);

    const totalWalletUsed = Number(
      paymentData.walletBreakdown?.totalWalletUsed ||
        promoUsed + earnedUsed + refundUsed ||
        paymentData.fare?.tplCredit ||
        0
    );

    const totalBeforeWallet = Number(
      paymentData.originalBookingBaseline?.totalBeforeWallet ||
        baseFare + taxesAndFees + specialRequestTotal - offerDiscount
    );

    const totalPayable = Number(
      paymentData.fare?.totalPayable ||
        paymentData.originalBookingBaseline?.payableAmount ||
        Math.max(totalBeforeWallet - totalWalletUsed, 0)
    );

    return {
      ...paymentData.fare,
      baseFare,
      taxesAndFees,
      specialRequestTotal,
      offerDiscount,
      tplCredit: totalWalletUsed,
      oldTplCredit: totalWalletUsed,
      walletUsed: totalWalletUsed,
      walletCalc: {
        promoUsed,
        earnedUsed,
        refundUsed,
      },
      walletBreakdown: {
        promoUsed,
        earnedUsed,
        refundUsed,
      },
      totalBeforeWallet,
      totalPayable,
      totalAmount: totalPayable,
      earnedOnThisBooking: Number(
        paymentData.walletBreakdown?.earnedOnThisBooking ||
          Math.floor(totalBeforeWallet * 0.02)
      ),
    };
  }, [paymentData]);

  function handlePayNow() {
    if (!paymentData || isExpired || !selectedPaymentMethod) return;

    setPaymentActionState("processing");

    setTimeout(async () => {
      try {
        const backendStart = await startCabBackendCheckout(
          paymentData as unknown as Record<string, unknown>
        );
        let backendRefs: CabBackendCheckoutRefs = backendStart.refs;
        const checkoutPaymentData = {
          ...paymentData,
          ...(backendStart.payload as Partial<CabPaymentPayload>),
          ...backendStart.refs,
        } as CabPaymentPayload & Record<string, unknown>;

        if (backendStart.attempted) {
          sessionStorage.setItem(
            "tplCabPaymentData",
            JSON.stringify(checkoutPaymentData)
          );

          setPaymentData(checkoutPaymentData as CabPaymentPayload);
        }

        const now = new Date().toISOString();
        const bookingId = generateCabBookingId();
        const transactionId = generateCabTransactionId();
        const rideId = `RIDE-${Date.now().toString().slice(-8)}`;

        const finalFare = walletPriceBreakup || checkoutPaymentData.fare;

        const walletCalc = walletPriceBreakup?.walletCalc || {
          promoUsed: 0,
          earnedUsed: 0,
          refundUsed: 0,
        };

        if (backendRefs.backendCheckoutId) {
          const backendConfirm = await confirmCabBackendCheckout({
            ...backendRefs,
            bookingId,
            paymentId: transactionId,
            transactionId,
            paymentMethod: selectedPaymentMethod,
          });

          backendRefs = {
            ...backendRefs,
            ...backendConfirm.refs,
          };
        }

        if (activeUser?.mobile && walletPriceBreakup?.walletCalc) {
          const latestWallet = getWallet(activeUser.mobile);

          const nextWallet: Wallet = {
            promoCredit: Math.max(
              Number(latestWallet.promoCredit || 0) -
                Number(walletCalc.promoUsed || 0),
              0
            ),
            earnedCredit: Math.max(
              Number(latestWallet.earnedCredit || 0) -
                Number(walletCalc.earnedUsed || 0),
              0
            ),
            refundableBalance: Math.max(
              Number(latestWallet.refundableBalance || 0) -
                Number(walletCalc.refundUsed || 0),
              0
            ),
          };

          saveWallet(nextWallet, activeUser.mobile);
          setWallet(nextWallet);

          if (Number(walletCalc.promoUsed || 0) > 0) {
            addWalletLedgerItem(
              {
                type: "wallet_used",
                title: "TPL Promo Credit Used",
                description: "Promo credit used for cab booking payment",
                amount: Number(walletCalc.promoUsed || 0),
              },
              activeUser.mobile
            );
          }

          if (Number(walletCalc.earnedUsed || 0) > 0) {
            addWalletLedgerItem(
              {
                type: "wallet_used",
                title: "TPL Earned Credit Used",
                description: "Earned credit used for cab booking payment",
                amount: Number(walletCalc.earnedUsed || 0),
              },
              activeUser.mobile
            );
          }

          if (Number(walletCalc.refundUsed || 0) > 0) {
            addWalletLedgerItem(
              {
                type: "wallet_used",
                title: "Refund Wallet Used",
                description: "Refund wallet used for cab booking payment",
                amount: Number(walletCalc.refundUsed || 0),
              },
              activeUser.mobile
            );
          }
        }

        const bookingRecord = {
          bookingId,
          bookingStatus: "confirmed" as const,
          createdAt: now,
          confirmedAt: now,

          cab: checkoutPaymentData.cab,
          searchMeta: checkoutPaymentData.searchMeta,

          traveller: {
            pickupLocation: checkoutPaymentData.traveller.pickupLocation || "",
            fullName: checkoutPaymentData.traveller.fullName || "",
            gender: checkoutPaymentData.traveller.gender || "",
            mobile: checkoutPaymentData.traveller.mobile || "",
            email: checkoutPaymentData.traveller.email || "",
            usePickupAsBillingAddress:
              checkoutPaymentData.traveller.usePickupAsBillingAddress ?? true,
          },

          travellers: checkoutPaymentData.traveller?.fullName
            ? [
                {
                  id: "1",
                  fullName: checkoutPaymentData.traveller.fullName || "",
                  gender: checkoutPaymentData.traveller.gender || "",
                },
              ]
            : [],

          contactDetails: {
            countryCode: "+91",
            mobile: checkoutPaymentData.traveller.mobile || "",
            email: checkoutPaymentData.traveller.email || "",
          },

          selectedAddons: checkoutPaymentData.selectedAddons || [],
          appliedOffer: checkoutPaymentData.appliedOffer || null,

          fare: {
            baseFare: Number(finalFare?.baseFare || 0),
            driverAllowance: 0,
            nightCharge: 0,
            tollTax: 0,
            stateTax: 0,
            parkingCharge: 0,
            gst: Number(finalFare?.taxesAndFees || 0),
            tplCredit: Number(finalFare?.tplCredit || 0),
            oldTplCredit: Number((finalFare as any)?.oldTplCredit || 0),
            walletUsed: Number((finalFare as any)?.walletUsed || 0),
            walletBreakdown: {
              promoUsed: Number(walletCalc.promoUsed || 0),
              earnedUsed: Number(walletCalc.earnedUsed || 0),
              refundUsed: Number(walletCalc.refundUsed || 0),
              totalWalletUsed: Number((finalFare as any)?.walletUsed || 0),
              earnedOnThisBooking: Number(
                (finalFare as any)?.earnedOnThisBooking || 0
              ),
            },
            appliedOffer: Number(finalFare?.offerDiscount || 0),
            totalPaid: Number(
              (finalFare as any)?.totalPayable || paymentData.fare?.totalPayable || 0
            ),
            totalAmount: Number(
              (finalFare as any)?.totalPayable || paymentData.fare?.totalPayable || 0
            ),
          },

          payment: {
            paymentMethod: selectedPaymentMethod,
            paymentStatus: "success" as const,
            paidAt: now,
            transactionId,
          },

          walletSource: checkoutPaymentData.walletSource,
          walletSyncStatus: checkoutPaymentData.walletSyncStatus,
          backendWalletSnapshot: checkoutPaymentData.backendWalletSnapshot,
          metadata: checkoutPaymentData.metadata,
          ...backendRefs,
        };

        saveCabConfirmedBooking(bookingRecord as any);

        const confirmationPayload = {
          bookingId,
          paymentId: transactionId,
          transactionId,
          rideId,
          bookingStatus: "confirmed",
          paymentStatus: "paid",
          bookedOn: now,
          paidAt: now,
          paymentMethod: selectedPaymentMethod,

          cabType:
            checkoutPaymentData.cab.vehicleType ||
            checkoutPaymentData.cab.rideType ||
            checkoutPaymentData.cab.name ||
            "Cab Booking",
          cabName: checkoutPaymentData.cab.name || "Cab Booking",

          fromLocation:
            checkoutPaymentData.searchMeta.from ||
            checkoutPaymentData.searchMeta.pickup ||
            checkoutPaymentData.traveller.pickupLocation ||
            "",
          toLocation:
            checkoutPaymentData.searchMeta.to || checkoutPaymentData.searchMeta.drop || "",
          pickupDate:
  checkoutPaymentData.searchMeta.pickupDate ||
  checkoutPaymentData.searchMeta.departureDate ||
  "",

pickupTime: checkoutPaymentData.searchMeta.pickupTime || "",

dropDate:
  checkoutPaymentData.searchMeta.returnDate ||
  (checkoutPaymentData.searchMeta as any).dropDate ||
  checkoutPaymentData.searchMeta.pickupDate ||
  checkoutPaymentData.searchMeta.departureDate ||
  "",

dropTime: checkoutPaymentData.searchMeta.dropTime || "",

tripType:
  checkoutPaymentData.searchMeta.rideType || checkoutPaymentData.cab.rideType || "",

          specialRequest:
            checkoutPaymentData.selectedAddons?.map((item) => item.title).join(", ") ||
            "",

          travellers: checkoutPaymentData.traveller?.fullName
            ? [
                {
                  id: "1",
                  fullName: checkoutPaymentData.traveller.fullName || "",
                  gender: checkoutPaymentData.traveller.gender || "",
                },
              ]
            : [],

          contactDetails: {
            countryCode: "+91",
            mobile: checkoutPaymentData.traveller.mobile || "",
            email: checkoutPaymentData.traveller.email || "",
          },

          fare: {
            baseFare: Number(finalFare?.baseFare || 0),
            driverAllowance: 0,
            nightCharge: 0,
            tollTax: 0,
            stateTax: 0,
            parkingCharge: 0,
            gst: Number(finalFare?.taxesAndFees || 0),
            tplCredit: Number(finalFare?.tplCredit || 0),
            oldTplCredit: Number((finalFare as any)?.oldTplCredit || 0),
            walletUsed: Number((finalFare as any)?.walletUsed || 0),
            walletBreakdown: {
              promoUsed: Number(walletCalc.promoUsed || 0),
              earnedUsed: Number(walletCalc.earnedUsed || 0),
              refundUsed: Number(walletCalc.refundUsed || 0),
              totalWalletUsed: Number((finalFare as any)?.walletUsed || 0),
              earnedOnThisBooking: Number(
                (finalFare as any)?.earnedOnThisBooking || 0
              ),
            },
            earnedOnThisBooking: Number(
              (finalFare as any)?.earnedOnThisBooking || 0
            ),
            appliedOffer: Number(finalFare?.offerDiscount || 0),
            totalBeforeWallet: Number((finalFare as any)?.totalBeforeWallet || 0),
            totalPaid: Number(
              (finalFare as any)?.totalPayable || paymentData.fare?.totalPayable || 0
            ),
            totalAmount: Number(
              (finalFare as any)?.totalPayable || paymentData.fare?.totalPayable || 0
            ),
          },

          paymentData: {
            method: selectedPaymentMethod,
            totalPaid: Number(
              (finalFare as any)?.totalPayable || paymentData.fare?.totalPayable || 0
            ),
            paidAt: now,
            walletUsed: Number((finalFare as any)?.walletUsed || 0),
            promoUsed: Number(walletCalc.promoUsed || 0),
            earnedUsed: Number(walletCalc.earnedUsed || 0),
            refundUsed: Number(walletCalc.refundUsed || 0),
          },

          earnedCreditAmount: Number((finalFare as any)?.earnedOnThisBooking || 0),

          cab: checkoutPaymentData.cab,
          searchMeta: checkoutPaymentData.searchMeta,
          traveller: checkoutPaymentData.traveller,
          selectedAddons: checkoutPaymentData.selectedAddons || [],
          appliedOffer: checkoutPaymentData.appliedOffer || null,
          walletSource: checkoutPaymentData.walletSource,
          walletSyncStatus: checkoutPaymentData.walletSyncStatus,
          backendWalletSnapshot: checkoutPaymentData.backendWalletSnapshot,
          metadata: checkoutPaymentData.metadata,

          ...backendRefs,
        };

        sessionStorage.setItem(
          "cabConfirmationData",
          JSON.stringify(confirmationPayload)
        );

        sessionStorage.setItem(
          "cabPaymentSuccessData",
          JSON.stringify(confirmationPayload)
        );

        sessionStorage.setItem(
          "tplCabConfirmationData",
          JSON.stringify(confirmationPayload)
        );

        setPaymentActionState("success");

        setTimeout(() => {
          router.push("/cab/confirmation");
        }, 700);
      } catch (error) {
        console.error("Cab payment success handling failed", error);
        setPaymentActionState("failure");
      }
    }, 1800);
  }

  function handleRetryPayment() {
    if (isExpired) return;
    setPaymentActionState("idle");
  }

  if (!paymentData) {
    return (
      <main className="min-h-screen overflow-x-hidden bg-[#f5f7fb] text-black">
        <div className="bg-[#f5f7fb] px-3 pt-3 lg:hidden">
          <MobileInnerBack title="Cab Payment" />
        </div>
        <CabBookingTopBar timerLabel="10:00" />
        <div className="mx-auto max-w-[1400px] px-3 py-4 md:px-4 md:py-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-[18px] font-bold text-slate-700">
            No payment data found.
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f5f7fb] pb-5 text-black">
      <div className="bg-[#f5f7fb] px-3 pt-3 lg:hidden">
        <MobileInnerBack title="Cab Payment" />
      </div>
      <CabBookingTopBar timerLabel={timerLabel} />

      <div className="mx-auto max-w-[1400px] px-3 py-4 md:px-4 md:py-6">
        <div className="flex flex-col items-stretch gap-4 lg:flex-row lg:items-start lg:gap-5">
          <div className="w-full min-w-0 space-y-4 lg:w-[74%] lg:space-y-5">
            <CabPaymentTopSummary
              cab={paymentData.cab}
              searchMeta={paymentData.searchMeta}
              traveller={paymentData.traveller}
              selectedAddons={paymentData.selectedAddons}
              appliedOffer={paymentData.appliedOffer || null}
            />

            <section className="rounded-2xl border border-[#f3d7c7] bg-[#fff7ed] px-4 py-4 shadow-sm sm:px-5 sm:py-3">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="text-[15px] font-extrabold text-slate-900">
                    {activeUser?.mobile
                      ? "Wallet benefits are applied as per your account balance"
                      : "Login Now to save your payment details faster"}
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

            <CabPaymentOptionSection
              payableAmount={Number(
                (walletPriceBreakup || paymentData.fare)?.totalPayable || 0
              )}
              onPaymentMethodChange={(method) => {
                setSelectedPaymentMethod(method);

                if (paymentActionState === "failure") {
                  setPaymentActionState("idle");
                }
              }}
            />
          </div>

          <div className="w-full min-w-0 self-start lg:w-[26%]">
            <CabPaymentPriceCard
              priceBreakup={walletPriceBreakup || paymentData.fare}
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
