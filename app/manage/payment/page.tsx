"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

import { getPaymentResolver } from "@/app/lib/manage/payment/getPaymentResolver";
import { applyManageUpdatePricing } from "@/app/lib/pricing/applyManageUpdatePricing";
import { getBookingPayload } from "@/app/lib/booking/bookingActionHelpers";
import { getAllBookings, type BookingItem } from "@/app/lib/booking/bookingStorage";
import {
  buildManageSuccessQuery,
  isBackendManageEligible,
  mergeBackendRefs,
  persistBackendManageCache,
  settleBackendManagePayment,
  type BackendManageRefs,
} from "@/app/lib/manage/backendManageBookingIntegration";
import {
  getWallet,
  saveWallet,
  addWalletLedgerItem,
  formatWalletPrice,
  type Wallet,
} from "@/app/lib/wallet/walletStorage";

type PaymentMethodKey = "upi" | "card" | "netbanking" | "wallet_gateway";

type ManageQuote = {
  totalAmount: number;
  currency?: string;
  settlementMode?: "payment" | "wallet_credit" | "save";
  refundCredit?: number;
  breakdown?: unknown;
};

const DEFAULT_WALLET: Wallet = {
  promoCredit: 0,
  earnedCredit: 0,
  refundableBalance: 0,
};

const DEFAULT_QUOTE: ManageQuote = {
  totalAmount: 0,
  currency: "INR",
  settlementMode: "save",
  refundCredit: 0,
};

const PAYMENT_OPTIONS: {
  key: PaymentMethodKey;
  title: string;
  subtitle: string;
}[] = [
  {
    key: "upi",
    title: "UPI",
    subtitle: "Pay instantly using any UPI app",
  },
  {
    key: "card",
    title: "Credit / Debit Card",
    subtitle: "Visa, Mastercard, RuPay supported",
  },
  {
    key: "netbanking",
    title: "Net Banking",
    subtitle: "Pay directly from your bank account",
  },
  {
    key: "wallet_gateway",
    title: "Wallet / Gateway",
    subtitle: "Use payment gateway saved flow",
  },
];

function formatCurrency(value: number) {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
}

function getBookingByTypeAndId(type: string, bookingId: string) {
  if (typeof window === "undefined") return undefined;

  return getAllBookings().find(
    (item) => item.id === bookingId && item.type === type
  );
}

function getManagePath(type: string, bookingId: string) {
  const pathMap: Record<string, string> = {
    flight: "/flights/manage",
    hotel: "/hotels/manage",
    homestay: "/homestays/manage",
    bus: "/bus/manage",
    train: "/train/manage",
    cab: "/cab/manage",
    cruise: "/cruise/manage",
    package: "/packages/manage",
    visa: "/visa/manage",
    insurance: "/insurance/manage",
    "smart-planner": "/smart-planner/manage",
  };

  const basePath = pathMap[type] || "/account/bookings";

  if (basePath === "/account/bookings") return basePath;

  return `${basePath}?bookingId=${encodeURIComponent(bookingId)}&from=payment`;
}

function supportsBackendManagePayment(type: string) {
  return (
    type === "cab" ||
    type === "bus" ||
    type === "hotel" ||
    type === "homestay" ||
    type === "cruise" ||
    type === "package" ||
    type === "train" ||
    type === "flight" ||
    type === "smart-planner"
  );
}

function hasBackendManageRequest(payload: unknown) {
  const record = asRecord(payload);
  const draft = asRecord(record.manageDraft);
  return Boolean(
    record.backendManageRequestId ||
      draft.backendManageRequestId
  );
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function ManagePaymentPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const bookingId = searchParams.get("bookingId") || "";
  const type = searchParams.get("type") || "flight";
  const section = searchParams.get("section") || "update";

  const [isMounted, setIsMounted] = useState(false);
  const [booking, setBooking] = useState<BookingItem | undefined>(undefined);
  const [quote, setQuote] = useState<ManageQuote>(DEFAULT_QUOTE);
  const [wallet, setWallet] = useState<Wallet>(DEFAULT_WALLET);

  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<PaymentMethodKey | null>("upi");

  const [isProcessing, setIsProcessing] = useState(false);

  const resolver = useMemo(() => getPaymentResolver(type), [type]);

  useEffect(() => {
    setIsMounted(true);

    const foundBooking = getBookingByTypeAndId(type, bookingId);
    setBooking(foundBooking);

    const mobile = foundBooking?.mobile || "";
    setWallet(getWallet(mobile));

    const nextQuote = resolver.getQuote({ bookingId, section });
    setQuote({
      ...DEFAULT_QUOTE,
      ...nextQuote,
      settlementMode: nextQuote?.settlementMode || "save",
      refundCredit: Number(nextQuote?.refundCredit || 0),
    });
  }, [type, bookingId, section, resolver]);

  const calculation = useMemo(() => {
    const amount = Number(quote?.totalAmount || 0);

    if (amount < 0) {
      return {
        updateAmount: 0,
        promoUsed: 0 as const,
        earnedUsed: 0 as const,
        tplCreditUsed: 0 as const,
        refundUsed: 0,
        refundCredit: Math.abs(Math.round(amount)),
        finalPayable: 0,
        settlementMode: "wallet_credit" as const,
        earnedOnThisUpdate: 0 as const,
      };
    }

    if (amount === 0) {
      return {
        updateAmount: 0,
        promoUsed: 0 as const,
        earnedUsed: 0 as const,
        tplCreditUsed: 0 as const,
        refundUsed: 0,
        refundCredit: 0,
        finalPayable: 0,
        settlementMode: "save" as const,
        earnedOnThisUpdate: 0 as const,
      };
    }

    return {
      ...applyManageUpdatePricing({
        updateAmount: amount,
        refundWallet: wallet.refundableBalance,
      }),
      promoUsed: 0 as const,
      earnedUsed: 0 as const,
      tplCreditUsed: 0 as const,
      refundCredit: 0,
      settlementMode: "payment" as const,
      earnedOnThisUpdate: 0 as const,
    };
  }, [quote, wallet.refundableBalance]);

  const settlementMode = calculation?.settlementMode || "save";

  const refundCredit =
    Number(calculation?.refundCredit || 0) ||
    Number(quote?.refundCredit || 0);

  const handleViewUpdate = () => {
    router.push(getManagePath(type, bookingId));
  };

  const handlePay = async () => {
    const latestBooking = getBookingByTypeAndId(type, bookingId);

    if (!latestBooking) {
      alert("Booking not found.");
      return;
    }

    const activeMobile = latestBooking.mobile || "";

    if (!activeMobile) {
      alert("Booking mobile number not found.");
      return;
    }

    const payload = getBookingPayload<Record<string, unknown>>(
      latestBooking.payloadStorageKey
    );

    if (!payload) {
      alert("Booking payload not found.");
      return;
    }

    const draft = asRecord(payload.manageDraft);
    const useBackendManage =
      supportsBackendManagePayment(type) &&
      isBackendManageEligible(type, latestBooking) &&
      hasBackendManageRequest(payload);

    try {
      setIsProcessing(true);

      if (settlementMode === "wallet_credit") {
        let backendRefs: BackendManageRefs = {};
        if (useBackendManage) {
          const backendSettlement = await settleBackendManagePayment({
            booking: latestBooking,
            payload,
            serviceType: type as "cab" | "bus" | "hotel" | "homestay" | "cruise" | "package" | "train" | "flight" | "smart-planner",
            section,
            settlementMode: "wallet_credit",
            amount: refundCredit,
          });

          if (!backendSettlement.ok) {
            alert(backendSettlement.error || "Backend manage settlement failed. Please retry.");
            return;
          }

          backendRefs = backendSettlement.payload || {};
          persistBackendManageCache(
            latestBooking.payloadStorageKey,
            mergeBackendRefs(payload, backendRefs)
          );
        }

        const latestWallet = getWallet(activeMobile);

        if (!useBackendManage) {
          const nextWallet: Wallet = {
            ...latestWallet,
            refundableBalance:
              Number(latestWallet.refundableBalance || 0) + refundCredit,
          };

          saveWallet(nextWallet, activeMobile);
          setWallet(nextWallet);

          if (refundCredit > 0) {
            addWalletLedgerItem(
              {
                type: "refund_credit",
                title: "Refund Wallet Credited",
                description: `Manage booking downgrade refund credited for ${type} - ${section}`,
                amount: refundCredit,
                bookingId,
              },
              activeMobile
            );
          }
        }

        await resolver.finalize({
          bookingId,
          section,
          seatSelections: draft.seats || [],
          mealSelections: draft.meals || [],
          baggageSelections: draft.baggage || [],
          payment: {
            method: "refund_wallet_credit",
            paidAmount: 0,
            promoUsed: 0,
            earnedUsed: 0,
            refundUsed: 0,
            totalWalletUsed: 0,
            refundCredit,
          },
        });

        router.push(
          `/manage/payment/success?bookingId=${encodeURIComponent(
            bookingId
          )}&type=${encodeURIComponent(type)}&section=${encodeURIComponent(
            section
          )}&paid=0&refund=${encodeURIComponent(refundCredit)}${buildManageSuccessQuery(
            backendRefs
          )}`
        );
        return;
      }

      if (settlementMode === "save") {
        let backendRefs: BackendManageRefs = {};
        if (useBackendManage) {
          const backendSettlement = await settleBackendManagePayment({
            booking: latestBooking,
            payload,
            serviceType: type as "cab" | "bus" | "hotel" | "homestay" | "cruise" | "package" | "train" | "flight" | "smart-planner",
            section,
            settlementMode: "save",
            amount: 0,
          });

          if (!backendSettlement.ok) {
            alert(backendSettlement.error || "Backend manage confirmation failed. Please retry.");
            return;
          }

          backendRefs = backendSettlement.payload || {};
          persistBackendManageCache(
            latestBooking.payloadStorageKey,
            mergeBackendRefs(payload, backendRefs)
          );
        }

        await resolver.finalize({
          bookingId,
          section,
          seatSelections: draft.seats || [],
          mealSelections: draft.meals || [],
          baggageSelections: draft.baggage || [],
          payment: {
            method: "no_payment_required",
            paidAmount: 0,
            promoUsed: 0,
            earnedUsed: 0,
            refundUsed: 0,
            totalWalletUsed: 0,
            refundCredit: 0,
          },
        });

        router.push(
          `/manage/payment/success?bookingId=${encodeURIComponent(
            bookingId
          )}&type=${encodeURIComponent(type)}&section=${encodeURIComponent(
            section
          )}&paid=0${buildManageSuccessQuery(backendRefs)}`
        );
        return;
      }

      if (!selectedPaymentMethod) {
        alert("Please select a payment option.");
        setIsProcessing(false);
        return;
      }

      const latestWallet = getWallet(activeMobile);
      const latestAmount = Number(quote?.totalAmount || 0);

      const latestCalculation =
        latestAmount < 0
          ? {
              updateAmount: 0,
              promoUsed: 0 as const,
              earnedUsed: 0 as const,
              tplCreditUsed: 0 as const,
              refundUsed: 0,
              refundCredit: Math.abs(Math.round(latestAmount)),
              finalPayable: 0,
              settlementMode: "wallet_credit" as const,
              earnedOnThisUpdate: 0 as const,
            }
          : latestAmount === 0
          ? {
              updateAmount: 0,
              promoUsed: 0 as const,
              earnedUsed: 0 as const,
              tplCreditUsed: 0 as const,
              refundUsed: 0,
              refundCredit: 0,
              finalPayable: 0,
              settlementMode: "save" as const,
              earnedOnThisUpdate: 0 as const,
            }
          : {
              ...applyManageUpdatePricing({
                updateAmount: latestAmount,
                refundWallet: latestWallet.refundableBalance,
              }),
              promoUsed: 0 as const,
              earnedUsed: 0 as const,
              tplCreditUsed: 0 as const,
              refundCredit: 0,
              settlementMode: "payment" as const,
              earnedOnThisUpdate: 0 as const,
            };

      let backendRefs: BackendManageRefs = {};
      if (useBackendManage) {
        const backendSettlement = await settleBackendManagePayment({
          booking: latestBooking,
          payload,
          serviceType: type as "cab" | "bus" | "hotel" | "homestay" | "cruise" | "package" | "train" | "flight" | "smart-planner",
          section,
          settlementMode: "payment",
          amount: latestCalculation.finalPayable,
          refundWalletRequested: latestCalculation.refundUsed,
          paymentAttemptId: `local_manage_${bookingId}_${Date.now()}`,
        });

        if (!backendSettlement.ok) {
          alert(backendSettlement.error || "Backend manage payment failed. Please retry.");
          return;
        }

        backendRefs = backendSettlement.payload || {};
        persistBackendManageCache(
          latestBooking.payloadStorageKey,
          mergeBackendRefs(payload, backendRefs)
        );
      } else {
        const nextWallet: Wallet = {
          promoCredit: latestWallet.promoCredit,
          earnedCredit: latestWallet.earnedCredit,
          refundableBalance: Math.max(
            Number(latestWallet.refundableBalance || 0) -
              Number(latestCalculation.refundUsed || 0),
            0
          ),
        };

        saveWallet(nextWallet, activeMobile);
        setWallet(nextWallet);

        if (Number(latestCalculation.refundUsed || 0) > 0) {
          addWalletLedgerItem(
            {
              type: "wallet_used",
              title: "Refund Wallet Used",
              description: `Refund wallet used for manage payment - ${type} - ${section}`,
              amount: Number(latestCalculation.refundUsed || 0),
              bookingId,
            },
            activeMobile
          );
        }
      }

      await resolver.finalize({
        bookingId,
        section,
        seatSelections: draft.seats || [],
        mealSelections: draft.meals || [],
        baggageSelections: draft.baggage || [],
        payment: {
          method: selectedPaymentMethod,
          paidAmount: latestCalculation.finalPayable,
          promoUsed: 0,
          earnedUsed: 0,
          refundUsed: latestCalculation.refundUsed,
          totalWalletUsed: latestCalculation.refundUsed,
          refundCredit: 0,
        },
      });

      router.push(
        `/manage/payment/success?bookingId=${encodeURIComponent(
          bookingId
        )}&type=${encodeURIComponent(type)}&section=${encodeURIComponent(
          section
        )}&paid=${encodeURIComponent(
          latestCalculation.finalPayable
        )}${buildManageSuccessQuery(backendRefs)}`
      );
    } catch (error) {
      console.error(error);
      alert("Payment failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const payButtonText =
    settlementMode === "wallet_credit"
      ? "Confirm & Credit Refund Wallet"
      : settlementMode === "save"
      ? "Confirm Update"
      : isProcessing
      ? "Processing Payment..."
      : "Pay Now";

  if (!isMounted) {
    return (
      <main className="min-h-screen bg-[#f8f9fb] px-4 py-8">
        <div className="mx-auto max-w-4xl rounded-[28px] border border-black/5 bg-white p-6 text-sm font-semibold text-[#6b7280]">
          Loading manage payment...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8f9fb] px-4 py-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="rounded-[28px] border border-black/5 bg-white p-6 shadow-[0_10px_40px_rgba(0,0,0,0.04)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 rounded-full border border-[#d9e2ec] bg-white px-5 py-2 text-[13px] font-extrabold text-[#111827] shadow-[0_6px_18px_rgba(15,23,42,0.06)] transition hover:bg-[#f8fbff] hover:border-[#bfd3ea]"
            >
              <span style={{ fontSize: "14px", lineHeight: 1 }}>←</span>
              <span>Back</span>
            </button>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleViewUpdate}
                className="rounded-full border border-[#d9e2ec] bg-white px-4 py-2 text-[12px] font-extrabold text-[#111827] transition hover:bg-[#f8fbff]"
              >
                View Update
              </button>

              <div className="rounded-full bg-[#fff7f2] px-4 py-2 text-[12px] font-extrabold uppercase tracking-[0.14em] text-[#ff6b00]">
                Manage Payment
              </div>
            </div>
          </div>

          <div className="mt-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#ff6b00]">
              {type} • {section}
            </p>
            <h1 className="mt-1 text-2xl font-bold text-[#111827]">
              Manage Booking Payment
            </h1>
            <p className="mt-1 text-sm text-[#6b7280]">
              Booking ID: {booking?.id || bookingId || "-"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-5">
            <div className="rounded-[28px] border border-black/5 bg-white p-6 shadow-[0_10px_40px_rgba(0,0,0,0.04)]">
              <h2 className="text-lg font-bold text-[#111827]">
                Select Payment Option
              </h2>

              <p className="mt-1 text-sm text-[#6b7280]">
                Choose a payment method to complete your manage booking update.
              </p>

              <div className="mt-5 grid gap-3">
                {PAYMENT_OPTIONS.map((option) => {
                  const isActive = selectedPaymentMethod === option.key;

                  return (
                    <button
                      key={option.key}
                      type="button"
                      onClick={() => setSelectedPaymentMethod(option.key)}
                      className={`rounded-[22px] border px-4 py-4 text-left transition ${
                        isActive
                          ? "border-[#ff6b00]/30 bg-[#fff7f2]"
                          : "border-black/10 bg-white hover:bg-[#f8f9fb]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-[#111827]">
                            {option.title}
                          </p>
                          <p className="mt-1 text-xs leading-5 text-[#6b7280]">
                            {option.subtitle}
                          </p>
                        </div>

                        {isActive ? (
                          <span className="rounded-full bg-[#ff6b00] px-2.5 py-1 text-[10px] font-semibold text-white">
                            Selected
                          </span>
                        ) : null}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-[28px] border border-black/5 bg-white p-6 shadow-[0_10px_40px_rgba(0,0,0,0.04)]">
              <h2 className="text-lg font-bold text-[#111827]">
                Wallet Summary
              </h2>

              <p className="mt-1 text-sm text-[#6b7280]">
                Wallet rules visible hain. Applied values below are used in
                final settlement.
              </p>

              <div className="mt-5 space-y-4">
                <WalletRow
                  title="TPL Promo Credit"
                  subtitle={`Available: ${formatWalletPrice(wallet.promoCredit)}`}
                  used={0}
                />
                <WalletRow
                  title="TPL Earned Credit"
                  subtitle={`Available: ${formatWalletPrice(wallet.earnedCredit)}`}
                  used={0}
                />
                <WalletRow
                  title="Refund Wallet"
                  subtitle={`Available: ${formatWalletPrice(
                    wallet.refundableBalance
                  )}`}
                  used={calculation.refundUsed}
                />
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-[28px] border border-black/5 bg-white p-6 shadow-[0_10px_40px_rgba(0,0,0,0.04)]">
              <h2 className="text-lg font-bold text-[#111827]">
                Final Payable
              </h2>

              <div className="mt-5 space-y-3">
                <SummaryRow
                  label="Total Change Amount"
                  value={formatCurrency(quote?.totalAmount || 0)}
                />
                <SummaryRow
                  label="Promo Used"
                  value={`- ${formatCurrency(0)}`}
                />
                <SummaryRow
                  label="Earned Used"
                  value={`- ${formatCurrency(0)}`}
                />
                <SummaryRow
                  label="Refund Wallet Used"
                  value={`- ${formatCurrency(calculation.refundUsed)}`}
                />

                {Number(refundCredit || 0) > 0 && (
                  <SummaryRow
                    label="Refund Wallet Credit"
                    value={formatCurrency(refundCredit)}
                  />
                )}
              </div>

              <div className="mt-5 rounded-[22px] bg-[#111827] px-5 py-5 text-white">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/70">
                  {settlementMode === "wallet_credit"
                    ? "Refund To Wallet"
                    : settlementMode === "save"
                    ? "No Payment Required"
                    : "Amount to Pay"}
                </p>

                <p className="mt-2 text-3xl font-bold">
                  {settlementMode === "wallet_credit"
                    ? formatCurrency(refundCredit || 0)
                    : formatCurrency(calculation.finalPayable)}
                </p>
              </div>

              <div className="mt-4 rounded-[18px] bg-[#f8f9fb] px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6b7280]">
                  Selected Method
                </p>

                <p className="mt-1 text-sm font-bold text-[#111827]">
                  {settlementMode === "wallet_credit"
                    ? "Refund Wallet Credit"
                    : settlementMode === "save"
                    ? "Direct Save"
                    : selectedPaymentMethod
                    ? PAYMENT_OPTIONS.find(
                        (x) => x.key === selectedPaymentMethod
                      )?.title
                    : "Please select payment option"}
                </p>
              </div>

              <button
                type="button"
                onClick={handlePay}
                disabled={
                  (settlementMode === "payment" && !selectedPaymentMethod) ||
                  isProcessing
                }
                className="mt-5 h-12 w-full rounded-full bg-[#ff6b00] text-sm font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {payButtonText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function WalletRow({
  title,
  subtitle,
  used,
}: {
  title: string;
  subtitle: string;
  used: number;
}) {
  return (
    <div className="rounded-[22px] border border-black/10 bg-white px-4 py-4">
      <p className="text-sm font-semibold text-[#111827]">{title}</p>
      <p className="mt-1 text-xs leading-5 text-[#6b7280]">{subtitle}</p>
      <p className="mt-2 text-sm font-bold text-[#111827]">
        Used: {formatCurrency(used)}
      </p>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <p className="text-sm text-[#6b7280]">{label}</p>
      <p className="text-sm font-semibold text-[#111827]">{value}</p>
    </div>
  );
}

export default function ManagePaymentPage() {
  return (
    <Suspense fallback={<div />}>
      <ManagePaymentPageContent />
    </Suspense>
  );
}
