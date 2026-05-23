"use client";

import { CreditCard, Landmark, Smartphone } from "lucide-react";

type Props = {
  selectedMethod: string;
  onPaymentMethodChange: (method: string) => void;
};

const methods = [
  {
    id: "UPI",
    title: "UPI Payment",
    desc: "Pay using Google Pay, PhonePe, Paytm or any UPI app.",
    icon: Smartphone,
  },
  {
    id: "Card",
    title: "Credit / Debit Card",
    desc: "Pay securely with domestic or international cards.",
    icon: CreditCard,
  },
  {
    id: "Net Banking",
    title: "Net Banking",
    desc: "Pay directly from your bank account.",
    icon: Landmark,
  },
];

export default function VisaPaymentOptionSection({
  selectedMethod,
  onPaymentMethodChange,
}: Props) {
  return (
    <div className="rounded-2xl border border-[#d9e2ec] bg-white shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
      <div className="border-b border-[#e5e7eb] px-5 py-4">
        <div className="text-[18px] font-black text-[#111827]">
          Choose Payment Method
        </div>
        <div className="mt-1 text-[13px] font-medium text-[#6b7280]">
          Your visa application will be submitted to our visa team after payment.
        </div>
      </div>

      <div className="grid gap-3 p-5">
        {methods.map((method) => {
          const Icon = method.icon;
          const active = selectedMethod === method.id;

          return (
            <button
              key={method.id}
              type="button"
              onClick={() => onPaymentMethodChange(method.id)}
              className={`flex items-center gap-4 rounded-xl border p-4 text-left transition ${
                active
                  ? "border-[#ea580c] bg-orange-50"
                  : "border-[#e5e7eb] bg-white hover:border-[#ea580c]"
              }`}
            >
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                  active ? "bg-[#ea580c] text-white" : "bg-[#f3f4f6] text-[#111827]"
                }`}
              >
                <Icon size={21} />
              </div>

              <div>
                <div className="text-[15px] font-black text-[#111827]">
                  {method.title}
                </div>
                <div className="mt-1 text-[12px] font-medium text-[#6b7280]">
                  {method.desc}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}