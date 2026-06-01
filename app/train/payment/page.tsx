"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import TrainBookingTopBar from "@/app/components/booking/train/TrainBookingTopBar";
import TrainPaymentTopSummary from "@/app/components/payment/train/TrainPaymentTopSummary";
import TrainPaymentOptionSection from "@/app/components/payment/train/TrainPaymentOptionSection";
import TrainPaymentPriceCard from "@/app/components/payment/train/TrainPaymentPriceCard";
import LoginModal from "@/app/components/common/LoginModal";

import {
  getNormalizedTrainPaymentDataFromSession,
  type NormalizedTrainPaymentData,
} from "@/app/lib/train/trainPaymentMapper";

import { AUTH_UPDATED_EVENT } from "@/app/lib/booking/guestAuth";
import {
  getWallet,
  saveWallet,
  addWalletLedgerItem,
  type Wallet,
} from "@/app/lib/wallet/walletStorage";

function toNumber(value: any, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

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

export default function TrainPaymentPage() {
  const router = useRouter();

  const [paymentData, setPaymentData] =
    useState<NormalizedTrainPaymentData | null>(null);

  const [rawPaymentData, setRawPaymentData] = useState<any>(null);

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [paymentActionState, setPaymentActionState] = useState<
    "idle" | "processing" | "success" | "failure"
  >("idle");

  const [timerLeft, setTimerLeft] = useState(15 * 60);
  const [isExpired, setIsExpired] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const [activeUser, setActiveUser] = useState<any>(null);
  const [, setWallet] = useState<Wallet>({
    promoCredit: 0,
    earnedCredit: 0,
    refundableBalance: 0,
  });

  useEffect(() => {
    const parsed = getNormalizedTrainPaymentDataFromSession(
      "tplTrainPaymentData"
    );

    const raw =
      typeof window !== "undefined"
        ? sessionStorage.getItem("tplTrainPaymentData")
        : null;

    if (raw) {
      try {
        setRawPaymentData(JSON.parse(raw));
      } catch (error) {
        console.error("Failed to parse raw train payment data", error);
      }
    }

    if (!parsed) return;

    setPaymentData(parsed);
    setTimerLeft(parsed.timerLeft || 15 * 60);
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

    if (timerLeft <= 0) {
      setIsExpired(true);
      return;
    }

    const timer = setInterval(() => {
      setTimerLeft((prev) => {
        const next = prev > 0 ? prev - 1 : 0;

        try {
          const currentRaw = sessionStorage.getItem("tplTrainPaymentData");
          const currentParsed = currentRaw ? JSON.parse(currentRaw) : {};

          sessionStorage.setItem(
            "tplTrainPaymentData",
            JSON.stringify({
              ...currentParsed,
              timerLeft: next,
            })
          );
        } catch (error) {
          console.error("Failed to update train timer in sessionStorage", error);
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

  const walletPriceBreakup = useMemo(() => {
    if (!paymentData) return null;

    const rawPricing =
      rawPaymentData?.pricing ||
      rawPaymentData?.bookingPayload?.pricingSnapshot ||
      rawPaymentData?.bookingPayload?.fareSnapshot ||
      rawPaymentData?.bookingPayload?.priceBreakup ||
      {};

    const rawWalletBreakdown = rawPaymentData?.walletBreakdown || {};

    const baseFare = toNumber(
      rawPricing.trueBaseFare ||
        rawPricing.baseFare ||
        paymentData.pricing.baseFare ||
        0
    );

    const baseAfterOffer = toNumber(
      rawPricing.baseAfterOffer ||
        Math.max(
          baseFare -
            toNumber(
              rawPricing.offerApplied ||
                rawPricing.appliedOfferAmount ||
                rawPricing.offerDiscount ||
                paymentData.pricing.offerApplied ||
                0
            ),
          0
        )
    );

    const convenienceFee = toNumber(
      rawPricing.convenienceFee || paymentData.pricing.convenienceFee || 0
    );

    const gatewayFee = toNumber(
      rawPricing.gatewayFee || paymentData.pricing.gatewayFee || 0
    );

    const confirmUpgradeAmount = toNumber(rawPricing.confirmUpgradeAmount || 0);

    const appliedOffer = toNumber(
      rawPricing.offerApplied ||
        rawPricing.appliedOfferAmount ||
        rawPricing.offerDiscount ||
        rawPricing.couponDiscount ||
        paymentData.pricing.offerApplied ||
        0
    );

    const promoUsed = toNumber(
      rawWalletBreakdown.promoUsed ||
        rawPricing.promoUsed ||
        rawPricing.walletCalc?.promoUsed ||
        0
    );

    const earnedUsed = toNumber(
      rawWalletBreakdown.earnedUsed ||
        rawPricing.earnedUsed ||
        rawPricing.walletCalc?.earnedUsed ||
        0
    );

    const refundUsed = toNumber(
      rawWalletBreakdown.refundUsed ||
        rawPricing.refundUsed ||
        rawPricing.walletCalc?.refundUsed ||
        0
    );

    const totalWalletUsed = toNumber(
      rawWalletBreakdown.totalWalletUsed ||
        rawPricing.totalWalletUsed ||
        rawPricing.tplCredit ||
        promoUsed + earnedUsed + refundUsed ||
        0
    );

    const tplCreditUsed = toNumber(
      rawWalletBreakdown.tplCreditUsed ||
        rawPricing.tplCreditUsed ||
        promoUsed + earnedUsed ||
        0
    );

    const nonBenefitTotal = toNumber(
      rawPricing.nonBenefitTotal ||
        convenienceFee + gatewayFee + confirmUpgradeAmount
    );

    const totalBeforeWallet = toNumber(
      rawPricing.totalBeforeWallet ||
        rawWalletBreakdown.totalBeforeWallet ||
        baseAfterOffer + nonBenefitTotal
    );

    const totalAmount = toNumber(
      rawPricing.totalAmount ||
        rawPricing.payableAmount ||
        rawPricing.grandTotal ||
        rawPricing.finalTotal ||
        paymentData.pricing.totalAmount ||
        paymentData.pricing.finalTotal ||
        Math.max(totalBeforeWallet - totalWalletUsed, 0)
    );

    const earnedOnThisBooking = toNumber(
      rawWalletBreakdown.earnedOnThisBooking ||
        rawPricing.earnedOnThisBooking ||
        Math.floor(baseAfterOffer * 0.02)
    );

    return {
      pricingVersion: "TPL_TRAIN_PRICING_RULE_V1",
      baseFare,
      trueBaseFare: baseFare,
      baseAfterOffer,
      convenienceFee,
      gatewayFee,
      confirmUpgradeAmount,
      nonBenefitTotal,
      appliedOffer,
      offerApplied: appliedOffer,
      appliedOfferAmount: appliedOffer,
      appliedOfferCode:
        rawPricing.appliedOfferCode || rawPaymentData?.appliedOfferCode || "",
      appliedOfferTitle:
        rawPricing.appliedOfferTitle || rawPaymentData?.appliedOfferTitle || "",
      offerData: rawPricing.offerData || rawPaymentData?.offerData || null,
      tplCredit: totalWalletUsed,
      tplCreditUsed,
      totalWalletUsed,
      totalAmount,
      payableAmount: totalAmount,
      grandTotal: totalAmount,
      totalBeforeWallet,
      earnedOnThisBooking,
      promoCreditEligibleBase: baseAfterOffer,
      earnedCreditEligibleBase: baseAfterOffer,
      refundWalletEligibleAmount: totalBeforeWallet,
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
      rules: {
        offerAppliesOn: "true_base_train_fare",
        promoEarnedAppliesOn: "base_after_offer",
        refundWalletAppliesOn: "final_payable",
        earnedCreditRate: 0.02,
        managePaymentPromoEarnedAllowed: false,
        managePaymentRefundWalletAllowed: true,
      },
    };
  }, [paymentData, rawPaymentData]);

  const handlePayNow = useCallback(() => {
    if (!paymentData) return;
    if (isExpired || !selectedPaymentMethod) return;

    setPaymentActionState("processing");

    setTimeout(() => {
      try {
        const now = new Date().toISOString();

        const walletCalc = walletPriceBreakup?.walletCalc || {
          promoUsed: 0,
          earnedUsed: 0,
          refundUsed: 0,
        };

        if (activeUser?.mobile) {
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
                description:
                  "Promo credit used on base-after-offer for train booking payment",
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
                description:
                  "Earned credit used on base-after-offer for train booking payment",
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
                description:
                  "Refund wallet used on final payable for train booking payment",
                amount: Number(walletCalc.refundUsed || 0),
              },
              activeUser.mobile
            );
          }
        }

        const normalizedPassengers = Array.isArray(paymentData.travellers)
          ? paymentData.travellers.map((traveller: any, index: number) => ({
              id: traveller?.id || String(index + 1),
              fullName:
                traveller?.fullName ||
                `${traveller?.firstName || ""} ${
                  traveller?.lastName || ""
                }`.trim(),
              firstName:
                traveller?.firstName ||
                traveller?.fullName?.split(" ")?.[0] ||
                "",
              lastName:
                traveller?.lastName ||
                traveller?.fullName?.split(" ")?.slice(1).join(" ") ||
                "",
              gender: traveller?.gender || "",
              age: traveller?.age || "",
              seatNumber: traveller?.seatNumber || "",
              coach:
                traveller?.coach || paymentData.bookingPayload?.classCode || "",
              berth: traveller?.berth || "",
              quota: traveller?.quota || paymentData.bookingPayload?.quota || "",
              status: traveller?.status || "Confirmed",
            }))
          : [];

        const pricingSnapshot = walletPriceBreakup || {
          baseFare: 0,
          trueBaseFare: 0,
          baseAfterOffer: 0,
          convenienceFee: 0,
          gatewayFee: 0,
          confirmUpgradeAmount: 0,
          nonBenefitTotal: 0,
          appliedOffer: 0,
          offerApplied: 0,
          appliedOfferAmount: 0,
          tplCredit: 0,
          tplCreditUsed: 0,
          totalWalletUsed: 0,
          totalBeforeWallet: 0,
          totalAmount: 0,
          payableAmount: 0,
          grandTotal: 0,
          earnedOnThisBooking: 0,
          walletCalc,
          walletBreakdown: walletCalc,
        };

        const confirmedPayload = {
          ...rawPaymentData,
          ...paymentData,
          timerLeft,
          selectedPaymentMethod,
          paymentState: "success",
          paymentStatus: "paid",
          paidAt: now,
          bookedOn: now,

          bookingPayload: {
            ...paymentData.bookingPayload,
            ...(rawPaymentData?.bookingPayload || {}),
            pricingSnapshot,
            fareSnapshot: pricingSnapshot,
            priceBreakup: pricingSnapshot,
          },

          pricing: pricingSnapshot,
          fareSnapshot: pricingSnapshot,
          priceBreakup: pricingSnapshot,

          appliedOffer:
            rawPaymentData?.appliedOffer || paymentData.appliedOffer || null,
          appliedOfferCode:
            pricingSnapshot.appliedOfferCode ||
            rawPaymentData?.appliedOfferCode ||
            "",
          appliedOfferTitle:
            pricingSnapshot.appliedOfferTitle ||
            rawPaymentData?.appliedOfferTitle ||
            "",
          offerData: pricingSnapshot.offerData || rawPaymentData?.offerData || null,

          travellers: normalizedPassengers,

          contactDetails: {
            countryCode: paymentData.contactDetails?.countryCode || "+91",
            mobile: paymentData.contactDetails?.mobile || "",
            email: paymentData.contactDetails?.email || "",
          },

          paymentMethod: selectedPaymentMethod,

          paymentData: {
            method: selectedPaymentMethod,
            totalPaid: pricingSnapshot.totalAmount || 0,
            paidAt: now,
            walletUsed: pricingSnapshot.tplCredit || 0,
            promoUsed: walletCalc.promoUsed || 0,
            earnedUsed: walletCalc.earnedUsed || 0,
            refundUsed: walletCalc.refundUsed || 0,
          },

          fare: {
            pricingVersion: "TPL_TRAIN_PRICING_RULE_V1",

            baseFare: pricingSnapshot.baseFare || 0,
            trueBaseFare: pricingSnapshot.trueBaseFare || pricingSnapshot.baseFare || 0,
            baseAfterOffer: pricingSnapshot.baseAfterOffer || 0,

            convenienceFee: pricingSnapshot.convenienceFee || 0,
            gatewayFee: pricingSnapshot.gatewayFee || 0,
            confirmUpgradeAmount: pricingSnapshot.confirmUpgradeAmount || 0,

            reservationCharge: pricingSnapshot.convenienceFee || 0,
            superfastCharge: 0,
            otherCharges:
              (pricingSnapshot.gatewayFee || 0) +
              (pricingSnapshot.confirmUpgradeAmount || 0),
            tax: 0,
            insuranceAmount: 0,
            foodAmount: 0,

            appliedOffer: pricingSnapshot.appliedOffer || 0,
            offerApplied: pricingSnapshot.appliedOffer || 0,
            appliedOfferAmount: pricingSnapshot.appliedOffer || 0,
            appliedOfferCode: pricingSnapshot.appliedOfferCode || "",
            appliedOfferTitle: pricingSnapshot.appliedOfferTitle || "",
            offerData: pricingSnapshot.offerData || null,

            tplCredit: pricingSnapshot.tplCredit || 0,
            tplCreditUsed: pricingSnapshot.tplCreditUsed || 0,
            totalWalletUsed: pricingSnapshot.totalWalletUsed || 0,

            totalBeforeWallet: pricingSnapshot.totalBeforeWallet || 0,
            totalPaid: pricingSnapshot.totalAmount || 0,
            totalAmount: pricingSnapshot.totalAmount || 0,
            payableAmount: pricingSnapshot.totalAmount || 0,

            walletBreakdown: {
              promoUsed: walletCalc.promoUsed || 0,
              earnedUsed: walletCalc.earnedUsed || 0,
              refundUsed: walletCalc.refundUsed || 0,
              totalWalletUsed: pricingSnapshot.tplCredit || 0,
              tplCreditUsed: pricingSnapshot.tplCreditUsed || 0,
              earnedOnThisBooking: pricingSnapshot.earnedOnThisBooking || 0,
            },
          },

          trainName:
            paymentData.bookingPayload?.trainName ||
            paymentData.bookingPayload?.train?.trainName ||
            paymentData.bookingPayload?.train?.name ||
            (paymentData as any).trainName ||
            "Train Booking Confirmed",

          trainNumber:
            paymentData.bookingPayload?.trainNumber ||
            paymentData.bookingPayload?.train?.trainNumber ||
            (paymentData as any).trainNumber ||
            "",

          pnrNumber:
            (paymentData as any).pnrNumber || (paymentData as any).pnr || "",

          route:
            (paymentData as any).route ||
            paymentData.bookingPayload?.route ||
            `${paymentData.bookingPayload?.fromStation || "Origin"} → ${
              paymentData.bookingPayload?.toStation || "Destination"
            }`,

          boardingStation:
            (paymentData as any).boardingStation ||
            paymentData.bookingPayload?.fromStation ||
            "",

          destinationStation:
            (paymentData as any).destinationStation ||
            paymentData.bookingPayload?.toStation ||
            "",

          journeyDate:
            (paymentData as any).journeyDate ||
            paymentData.bookingPayload?.journeyDate ||
            paymentData.bookingPayload?.date ||
            "",

          departureTime:
            (paymentData as any).departureTime ||
            paymentData.bookingPayload?.departureTime ||
            "",

          arrivalTime:
            (paymentData as any).arrivalTime ||
            paymentData.bookingPayload?.arrivalTime ||
            "",

          coachClass:
            (paymentData as any).coachClass ||
            (paymentData as any).travelClass ||
            paymentData.bookingPayload?.classCode ||
            "",

          quota:
            (paymentData as any).quota || paymentData.bookingPayload?.quota || "",

          bookingMeta: {
            bookingStatus: "confirmed",
            paymentStatus: "paid",
            createdAt: now,
            serviceType: "train",
          },

          earnedCreditAmount: pricingSnapshot.earnedOnThisBooking || 0,
        };

        sessionStorage.setItem(
          "tplTrainPaymentConfirmedData",
          JSON.stringify(confirmedPayload)
        );

        router.push("/train/irctc-auth");
      } catch (error) {
        console.error("Train payment success handling failed", error);
        setPaymentActionState("failure");
      }
    }, 1800);
  }, [
    paymentData,
    rawPaymentData,
    isExpired,
    selectedPaymentMethod,
    walletPriceBreakup,
    activeUser,
    router,
    timerLeft,
  ]);

  const handleRetryPayment = useCallback(() => {
    if (isExpired) return;
    setPaymentActionState("idle");
  }, [isExpired]);

  if (!paymentData) {
    return (
    <main className="min-h-screen bg-[#f5f7fb]">
        <TrainBookingTopBar timerLabel="15:00" />
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
    irctcAccount,
    appliedOffer,
  } = paymentData;

  return (
    <main className="min-w-0 overflow-x-hidden bg-[#f5f7fb] pb-28 text-black lg:min-h-screen lg:pb-0">
      <TrainBookingTopBar timerLabel={timerLabel} />

      <div className="mx-auto max-w-[1400px] px-3 py-4 md:px-4 lg:py-6">
        <div className="flex min-w-0 flex-col items-stretch gap-4 lg:flex-row lg:items-start lg:gap-5">
          <div className="min-w-0 space-y-4 lg:w-[74%] lg:space-y-5">
            <TrainPaymentTopSummary
              paymentPayload={{
                bookingPayload,
                travellers,
                contactDetails,
                irctcAccount,
                appliedOffer,
              }}
            />

            <section className="rounded-2xl border border-[#d9e2ec] bg-white px-5 py-4 shadow-sm">
              <div className="flex min-w-0 flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-4">
                <div className="min-w-0">
                  <div className="text-[16px] font-extrabold text-[#111827]">
                    {activeUser?.mobile
                      ? "Wallet benefits applied automatically"
                      : "Login to access wallet & offers"}
                  </div>
                </div>

                {!activeUser?.mobile && (
                  <button
                    type="button"
                    onClick={() => setShowLoginModal(true)}
                    className="h-[42px] w-full rounded-xl bg-[#1d9bf0] px-5 text-[13px] font-extrabold text-white md:min-w-[110px] md:w-auto"
                  >
                    LOGIN
                  </button>
                )}
              </div>
            </section>

            <TrainPaymentOptionSection
              defaultOption={null}
              payableAmount={
                walletPriceBreakup?.totalAmount ||
                paymentData.pricing.totalAmount
              }
              onPaymentMethodChange={setSelectedPaymentMethod}
            />
          </div>

          <div className="min-w-0 self-stretch lg:w-[26%] lg:self-start">
            <TrainPaymentPriceCard
              priceBreakup={{
                baseFare:
                  walletPriceBreakup?.baseFare || paymentData.pricing.baseFare,
                baseAfterOffer: walletPriceBreakup?.baseAfterOffer || 0,
                convenienceFee:
                  walletPriceBreakup?.convenienceFee ||
                  paymentData.pricing.convenienceFee,
                gatewayFee:
                  walletPriceBreakup?.gatewayFee ||
                  paymentData.pricing.gatewayFee,
                confirmUpgradeAmount:
                  walletPriceBreakup?.confirmUpgradeAmount || 0,
                appliedOffer:
                  walletPriceBreakup?.appliedOffer ||
                  paymentData.pricing.offerApplied ||
                  0,
                appliedOfferCode: walletPriceBreakup?.appliedOfferCode || "",
                appliedOfferTitle: walletPriceBreakup?.appliedOfferTitle || "",
                tplCredit:
                  walletPriceBreakup?.tplCredit ||
                  paymentData.pricing.tplCredit ||
                  0,
                tplCreditUsed: walletPriceBreakup?.tplCreditUsed || 0,
                totalAmount:
                  walletPriceBreakup?.totalAmount ||
                  paymentData.pricing.totalAmount,
                totalBeforeWallet: walletPriceBreakup?.totalBeforeWallet || 0,
                earnedOnThisBooking:
                  walletPriceBreakup?.earnedOnThisBooking ||
                  Number(rawPaymentData?.walletBreakdown?.earnedOnThisBooking || 0),
                walletCalc: {
                  promoUsed:
                    walletPriceBreakup?.walletCalc?.promoUsed ||
                    Number(rawPaymentData?.walletBreakdown?.promoUsed || 0),
                  earnedUsed:
                    walletPriceBreakup?.walletCalc?.earnedUsed ||
                    Number(rawPaymentData?.walletBreakdown?.earnedUsed || 0),
                  refundUsed:
                    walletPriceBreakup?.walletCalc?.refundUsed ||
                    Number(rawPaymentData?.walletBreakdown?.refundUsed || 0),
                },
                walletBreakdown: {
                  promoUsed:
                    walletPriceBreakup?.walletCalc?.promoUsed ||
                    Number(rawPaymentData?.walletBreakdown?.promoUsed || 0),
                  earnedUsed:
                    walletPriceBreakup?.walletCalc?.earnedUsed ||
                    Number(rawPaymentData?.walletBreakdown?.earnedUsed || 0),
                  refundUsed:
                    walletPriceBreakup?.walletCalc?.refundUsed ||
                    Number(rawPaymentData?.walletBreakdown?.refundUsed || 0),
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
