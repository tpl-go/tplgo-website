"use client";

import {
  CreditCard,
  Landmark,
  Smartphone,
  WalletCards,
} from "lucide-react";

type Props = {
  selectedMethod: string;
  onPaymentMethodChange: (method: string) => void;
};

const PAYMENT_METHODS = [
  {
    id: "upi",
    title: "UPI",
    description: "Pay using PhonePe, Google Pay, Paytm or any UPI app",
    icon: Smartphone,
  },
  {
    id: "card",
    title: "Credit / Debit Card",
    description: "Visa, Mastercard, RuPay and Amex cards accepted",
    icon: CreditCard,
  },
  {
    id: "netbanking",
    title: "Net Banking",
    description: "Pay securely using your bank account",
    icon: Landmark,
  },
  {
    id: "wallet",
    title: "Wallet / Other",
    description: "Use supported payment wallets and other payment options",
    icon: WalletCards,
  },
];

export default function InsurancePaymentOptionSection({
  selectedMethod,
  onPaymentMethodChange,
}: Props) {
  return (
    <div className="rounded-2xl border border-[#d9e2ec] bg-white p-5 shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
      <div>
        <h2 className="text-[18px] font-black text-[#111827]">
          Choose Payment Method
        </h2>
        <p className="mt-1 text-[13px] font-semibold text-[#64748b]">
          Select a secure payment option to issue your insurance policy.
        </p>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {PAYMENT_METHODS.map((method) => {
          const Icon = method.icon;
          const active = selectedMethod === method.id;

          return (
            <button
              key={method.id}
              type="button"
              onClick={() => onPaymentMethodChange(method.id)}
              className={`rounded-2xl border p-4 text-left transition ${
                active
                  ? "border-orange-500 bg-orange-50 shadow-sm"
                  : "border-[#e5e7eb] bg-white hover:border-orange-200 hover:bg-orange-50/40"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                    active
                      ? "bg-orange-500 text-white"
                      : "bg-[#f8fafc] text-[#475569]"
                  }`}
                >
                  <Icon size={20} />
                </div>

                <div>
                  <p className="text-[14px] font-black text-[#111827]">
                    {method.title}
                  </p>
                  <p className="mt-1 text-[12px] font-semibold text-[#64748b]">
                    {method.description}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}