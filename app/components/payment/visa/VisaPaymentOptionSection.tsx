"use client";

import { useMemo, useState, type ReactNode } from "react";
import { CreditCard, Landmark, Smartphone } from "lucide-react";

type Props = {
  selectedMethod: string;
  onPaymentMethodChange: (method: string) => void;
};

export default function VisaPaymentOptionSection({
  selectedMethod,
  onPaymentMethodChange,
}: Props) {
  const [selectedUpiMethod, setSelectedUpiMethod] = useState("");

  const activeMethod = useMemo(() => selectedMethod || "", [selectedMethod]);

  const handleSelect = (method: string) => {
    onPaymentMethodChange(method);
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-[#d9e2ec] bg-white shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
      <div className="border-b border-[#e5e7eb] px-4 py-4 md:px-5">
        <h2 className="text-[22px] font-black leading-7 text-[#111827] md:text-[26px]">
          Payment Options
        </h2>
      </div>

      <PaymentRow
        icon={<Smartphone size={20} />}
        title="UPI Options"
        subtitle="Pay directly from your bank account"
        isActive={activeMethod === "UPI"}
        onClick={() => handleSelect("UPI")}
      />

      {activeMethod === "UPI" ? (
        <ExpandedBox>
          <div className="text-[15px] font-extrabold text-[#111827]">
            Choose UPI Method
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3">
            {["Google Pay", "PhonePe", "Paytm", "BHIM UPI"].map((item) => (
              <SelectableMiniCard
                key={item}
                label={item}
                isSelected={selectedUpiMethod === item}
                onClick={() => setSelectedUpiMethod(item)}
              />
            ))}
          </div>

          <div className="mt-4">
            <label className="mb-2 block text-[13px] font-bold text-[#374151]">
              Enter UPI ID
            </label>
            <input
              placeholder="example@upi"
              className="h-11 w-full rounded-[10px] border border-[#d1d5db] bg-white px-3.5 text-[14px] font-semibold text-[#111827] outline-none focus:border-[#0ea5e9]"
            />
          </div>
        </ExpandedBox>
      ) : null}

      <PaymentRow
        icon={<CreditCard size={20} />}
        title="Credit & Debit Cards"
        subtitle="Visa, Mastercard, RuPay, Amex and more"
        isActive={activeMethod === "Card"}
        onClick={() => handleSelect("Card")}
      />

      {activeMethod === "Card" ? (
        <ExpandedBox>
          <div className="text-[15px] font-extrabold text-[#111827]">
            Card Details
          </div>
          <div className="mt-4">
            <label className="mb-2 block text-[13px] font-bold text-[#374151]">
              Card Number
            </label>
            <input
              placeholder="1234 5678 9012 3456"
              className="h-11 w-full rounded-[10px] border border-[#d1d5db] bg-white px-3.5 text-[14px] font-semibold text-[#111827] outline-none focus:border-[#0ea5e9]"
            />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <label className="mb-2 block text-[13px] font-bold text-[#374151]">
                Expiry
              </label>
              <input
                placeholder="MM/YY"
                className="h-11 w-full rounded-[10px] border border-[#d1d5db] bg-white px-3.5 text-[14px] font-semibold text-[#111827] outline-none focus:border-[#0ea5e9]"
              />
            </div>
            <div>
              <label className="mb-2 block text-[13px] font-bold text-[#374151]">
                CVV
              </label>
              <input
                placeholder="123"
                className="h-11 w-full rounded-[10px] border border-[#d1d5db] bg-white px-3.5 text-[14px] font-semibold text-[#111827] outline-none focus:border-[#0ea5e9]"
              />
            </div>
          </div>
          <div className="mt-3">
            <label className="mb-2 block text-[13px] font-bold text-[#374151]">
              Name on Card
            </label>
            <input
              placeholder="Enter card holder name"
              className="h-11 w-full rounded-[10px] border border-[#d1d5db] bg-white px-3.5 text-[14px] font-semibold text-[#111827] outline-none focus:border-[#0ea5e9]"
            />
          </div>
        </ExpandedBox>
      ) : null}

      <PaymentRow
        icon={<Landmark size={20} />}
        title="Net Banking"
        subtitle="Pay securely using your bank account"
        isActive={activeMethod === "Net Banking"}
        onClick={() => handleSelect("Net Banking")}
      />

      {activeMethod === "Net Banking" ? (
        <ExpandedBox>
          <div className="text-[15px] font-extrabold text-[#111827]">
            Select Your Bank
          </div>
          <select className="mt-3 h-11 w-full rounded-[10px] border border-[#d1d5db] bg-white px-3.5 text-[14px] font-semibold text-[#111827] outline-none focus:border-[#0ea5e9]">
            <option>Select Bank</option>
            <option>HDFC Bank</option>
            <option>ICICI Bank</option>
            <option>SBI</option>
            <option>Axis Bank</option>
          </select>
        </ExpandedBox>
      ) : null}
    </section>
  );
}

function PaymentRow({
  icon,
  title,
  subtitle,
  isActive,
  onClick,
}: {
  icon: ReactNode;
  title: string;
  subtitle: string;
  isActive?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center justify-between gap-3 border-b border-[#e5e7eb] px-4 py-4 text-left transition md:px-5 ${
        isActive
          ? "bg-[#f8fbff] shadow-[inset_0_0_0_1.5px_#7dd3fc]"
          : "bg-white hover:bg-[#f8fafc]"
      }`}
    >
      <div className="flex min-w-0 items-center gap-3.5">
        <div
          className={`flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-[10px] ${
            isActive ? "bg-[#dff2ff] text-[#0ea5e9]" : "bg-[#eef6ff] text-[#475569]"
          }`}
        >
          {icon}
        </div>

        <div className="min-w-0">
          <div className="break-words text-[16px] font-extrabold leading-5 text-[#111827]">
            {title}
          </div>
          <div className="mt-1 break-words text-[13px] font-semibold leading-[18px] text-[#64748b]">
            {subtitle}
          </div>
        </div>
      </div>

      <span className={`shrink-0 text-[20px] font-black ${isActive ? "text-[#0ea5e9]" : "text-[#60a5fa]"}`}>
        ›
      </span>
    </button>
  );
}

function ExpandedBox({ children }: { children: ReactNode }) {
  return (
    <div className="border-b border-[#e5e7eb] bg-white px-4 py-4 md:px-5 lg:pl-[76px]">
      {children}
    </div>
  );
}

function SelectableMiniCard({
  label,
  isSelected,
  onClick,
}: {
  label: string;
  isSelected?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onClick?.();
      }}
      className={`min-h-[46px] rounded-[10px] px-3 py-2 text-[13px] font-bold transition ${
        isSelected
          ? "border border-[#7dd3fc] bg-[#f8fbff] text-[#0f172a]"
          : "border border-[#d1d5db] bg-white text-[#1f2937] hover:border-[#7dd3fc]"
      }`}
    >
      {label}
    </button>
  );
}
