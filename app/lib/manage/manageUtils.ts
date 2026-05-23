import { ManageQuote } from "./manageTypes";

export function getSettlementLabel(quote: ManageQuote) {
  if (quote.settlementMode === "payment") return "Payment Required";
  if (quote.settlementMode === "wallet_credit") return "Refund Wallet Credit";
  return "Direct Save";
}

export function getSettlementDescription(quote: ManageQuote) {
  if (quote.settlementMode === "payment") {
    return `Extra payment of ₹${quote.netPayable.toFixed(2)} is required to confirm this change.`;
  }

  if (quote.settlementMode === "wallet_credit") {
    return `₹${quote.walletCredit.toFixed(2)} will be added to Refund Wallet after deductions.`;
  }

  return "No additional payment or wallet credit involved. Changes can be saved directly.";
}

export function formatCurrency(amount: number, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}