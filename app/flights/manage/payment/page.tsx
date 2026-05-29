"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

import { getPaymentResolver } from "@/app/lib/manage/payment/getPaymentResolver";
import { applyManageUpdatePricing } from "@/app/lib/pricing/applyManageUpdatePricing";
import { getBookingPayload } from "@/app/lib/booking/bookingActionHelpers";
import { getAllBookings } from "@/app/lib/booking/bookingStorage";
import {
  getWallet,
  saveWallet,
  addWalletLedgerItem,
  formatWalletPrice,
  type Wallet,
} from "@/app/lib/wallet/walletStorage";

function formatCurrency(value: number) {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
}

function getFlightBookingById(bookingId: string) {
  return getAllBookings().find(
    (item) => item.id === bookingId && item.type === "flight"
  );
}

type PaymentMethodKey = "upi" | "card" | "netbanking" | "wallet_gateway";

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

function ManagePaymentPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const bookingId = searchParams.get("bookingId") || "";
  const type = searchParams.get("type") || "flight";
  const section = searchParams.get("section") || "update";

  const resolver = getPaymentResolver(type);

  const bookingMobile = useMemo(() => {
    const booking = getFlightBookingById(bookingId);
    return booking?.mobile || "";
  }, [bookingId]);

  const quote = useMemo(() => {
    return resolver.getQuote({ bookingId, section });
  }, [resolver, bookingId, section]);

  const [wallet, setWallet] = useState<Wallet>(() => {
    const booking = getFlightBookingById(bookingId);
    return getWallet(booking?.mobile || "");
  });

  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<PaymentMethodKey | null>("upi");
  const [isProcessing, setIsProcessing] = useState(false);

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

  const result = applyManageUpdatePricing({
    updateAmount: amount,
    refundWallet: wallet.refundableBalance,
  });

  return {
    ...result,
    refundCredit: 0,
    settlementMode: "payment" as const,
  };
}, [quote, wallet.refundableBalance]);

  const handlePay = async () => {
    const booking = getFlightBookingById(bookingId);

    if (!booking) {
      alert("Booking not found.");
      return;
    }

    const activeMobile = booking.mobile || bookingMobile || "";

    if (!activeMobile) {
      alert("Booking mobile number not found.");
      return;
    }

    const payload = getBookingPayload<any>(booking.payloadStorageKey);
    const draft = payload?.manageDraft || {};

    if (!payload) {
      alert("Booking payload not found.");
      return;
    }

    try {
      setIsProcessing(true);

      if (calculation.settlementMode === "wallet_credit") {
        const refundCredit = Number(calculation.refundCredit || 0);

        const latestWallet = getWallet(activeMobile);

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
              description: `Manage booking downgrade refund credited for ${section}`,
              amount: refundCredit,
              bookingId,
            },
            activeMobile
          );
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
          )}&paid=0&refund=${encodeURIComponent(refundCredit)}`
        );
        return;
      }

      if (calculation.settlementMode === "save") {
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
          )}&paid=0`
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
        refundCredit: 0,
        settlementMode: "payment" as const,
      };

      const nextWallet: Wallet = {
        promoCredit: Math.max(
          Number(latestWallet.promoCredit || 0) -
            Number(latestCalculation.promoUsed || 0),
          0
        ),
        earnedCredit: Math.max(
          Number(latestWallet.earnedCredit || 0) -
            Number(latestCalculation.earnedUsed || 0),
          0
        ),
        refundableBalance: Math.max(
          Number(latestWallet.refundableBalance || 0) -
            Number(latestCalculation.refundUsed || 0),
          0
        ),
      };

      saveWallet(nextWallet, activeMobile);
      setWallet(nextWallet);

      if (Number(latestCalculation.promoUsed || 0) > 0) {
        addWalletLedgerItem(
          {
            type: "wallet_used",
            title: "TPL Promo Credit Used",
            description: `Promo credit used for manage payment - ${section}`,
            amount: Number(latestCalculation.promoUsed || 0),
            bookingId,
          },
          activeMobile
        );
      }

      if (Number(latestCalculation.earnedUsed || 0) > 0) {
        addWalletLedgerItem(
          {
            type: "wallet_used",
            title: "TPL Earned Credit Used",
            description: `Earned credit used for manage payment - ${section}`,
            amount: Number(latestCalculation.earnedUsed || 0),
            bookingId,
          },
          activeMobile
        );
      }

      if (Number(latestCalculation.refundUsed || 0) > 0) {
        addWalletLedgerItem(
          {
            type: "wallet_used",
            title: "Refund Wallet Used",
            description: `Refund wallet used for manage payment - ${section}`,
            amount: Number(latestCalculation.refundUsed || 0),
            bookingId,
          },
          activeMobile
        );
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
          promoUsed: latestCalculation.promoUsed,
          earnedUsed: latestCalculation.earnedUsed,
          refundUsed: latestCalculation.refundUsed,
          totalWalletUsed:
            latestCalculation.promoUsed +
            latestCalculation.earnedUsed +
            latestCalculation.refundUsed,
          refundCredit: 0,
        },
      });

      router.push(
        `/manage/payment/success?bookingId=${encodeURIComponent(
          bookingId
        )}&type=${encodeURIComponent(type)}&section=${encodeURIComponent(
          section
        )}&paid=${encodeURIComponent(latestCalculation.finalPayable)}`
      );
    } catch (error) {
      console.error(error);
      alert("Payment failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const payButtonText =
    calculation.settlementMode === "wallet_credit"
      ? "Confirm & Credit Refund Wallet"
      : calculation.settlementMode === "save"
      ? "Confirm Update"
      : isProcessing
      ? "Processing Payment..."
      : "Pay Now";

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f8f9fb] px-3 py-4 md:px-4 md:py-8">
      <div className="mx-auto max-w-4xl space-y-4 md:space-y-6">
        <div className="rounded-[20px] border border-black/5 bg-white p-4 shadow-[0_10px_40px_rgba(0,0,0,0.04)] md:rounded-[28px] md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[#d9e2ec] bg-white px-4 py-2 text-[12px] font-extrabold text-[#111827] shadow-[0_6px_18px_rgba(15,23,42,0.06)] transition hover:border-[#bfd3ea] hover:bg-[#f8fbff] md:px-5 md:text-[13px]"
            >
              <span style={{ fontSize: "14px", lineHeight: 1 }}>←</span>
              <span>Back</span>
            </button>

            <div className="rounded-full bg-[#fff7f2] px-3 py-2 text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#ff6b00] md:px-4 md:text-[12px] md:tracking-[0.14em]">
              Manage Payment
            </div>
          </div>

          <div className="mt-4 md:mt-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#ff6b00]">
              {type} • {section}
            </p>
            <h1 className="mt-1 text-[22px] font-bold leading-8 text-[#111827] md:text-2xl">
              Manage Booking Payment
            </h1>
            <p className="mt-1 break-words text-sm text-[#6b7280]">
              Booking ID: {bookingId || "-"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.1fr_0.9fr] lg:gap-5">
          <div className="space-y-4 lg:space-y-5">
            <div className="rounded-[20px] border border-black/5 bg-white p-4 shadow-[0_10px_40px_rgba(0,0,0,0.04)] md:rounded-[28px] md:p-6">
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
                      className={`rounded-[18px] border px-4 py-4 text-left transition md:rounded-[22px] ${
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

            <div className="rounded-[20px] border border-black/5 bg-white p-4 shadow-[0_10px_40px_rgba(0,0,0,0.04)] md:rounded-[28px] md:p-6">
              <h2 className="text-lg font-bold text-[#111827]">
                Wallet Summary
              </h2>
              <p className="mt-1 text-sm text-[#6b7280]">
                Wallet rules visible hain. Applied values below are now used in
                final settlement.
              </p>

              <div className="mt-5 space-y-4">
                <WalletRow
                  title="TPL Promo Credit"
                  subtitle={`Available: ${formatWalletPrice(
                    wallet.promoCredit
                  )}`}
                  used={calculation.promoUsed}
                />
                <WalletRow
                  title="TPL Earned Credit"
                  subtitle={`Available: ${formatWalletPrice(
                    wallet.earnedCredit
                  )}`}
                  used={calculation.earnedUsed}
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

          <div className="space-y-4 lg:space-y-5">
            <div className="rounded-[20px] border border-black/5 bg-white p-4 shadow-[0_10px_40px_rgba(0,0,0,0.04)] md:rounded-[28px] md:p-6">
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
                  value={`- ${formatCurrency(calculation.promoUsed)}`}
                />
                <SummaryRow
                  label="Earned Used"
                  value={`- ${formatCurrency(calculation.earnedUsed)}`}
                />
                <SummaryRow
                  label="Refund Wallet Used"
                  value={`- ${formatCurrency(calculation.refundUsed)}`}
                />

                {Number(calculation.refundCredit || 0) > 0 && (
                  <SummaryRow
                    label="Refund Wallet Credit"
                    value={formatCurrency(calculation.refundCredit)}
                  />
                )}
              </div>

              <div className="mt-5 rounded-[20px] bg-[#111827] px-4 py-4 text-white md:rounded-[22px] md:px-5 md:py-5">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/70">
                  {calculation.settlementMode === "wallet_credit"
                    ? "Refund To Wallet"
                    : calculation.settlementMode === "save"
                    ? "No Payment Required"
                    : "Amount to Pay"}
                </p>
                <p className="mt-2 text-[28px] font-bold leading-9 md:text-3xl">
                  {calculation.settlementMode === "wallet_credit"
                    ? formatCurrency(calculation.refundCredit || 0)
                    : formatCurrency(calculation.finalPayable)}
                </p>
              </div>

              <div className="mt-4 rounded-[18px] bg-[#f8f9fb] px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6b7280]">
                  Selected Method
                </p>
                <p className="mt-1 text-sm font-bold text-[#111827]">
                  {calculation.settlementMode === "wallet_credit"
                    ? "Refund Wallet Credit"
                    : calculation.settlementMode === "save"
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
                  (calculation.settlementMode === "payment" &&
                    !selectedPaymentMethod) ||
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
    <div className="rounded-[18px] border border-black/10 bg-white px-4 py-4 md:rounded-[22px]">
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
    <div className="flex items-center justify-between gap-3">
      <p className="text-sm text-[#6b7280]">{label}</p>
      <p className="shrink-0 text-sm font-semibold text-[#111827]">{value}</p>
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
