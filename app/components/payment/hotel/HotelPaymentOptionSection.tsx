"use client";

import { useState } from "react";

type PaymentOptionKey =
  | "upi"
  | "cards"
  | "emi"
  | "netbanking"
  | "paylater"
  | "wallets";

type Props = {
  defaultOption?: PaymentOptionKey | null;
  onPaymentMethodChange?: (method: string) => void;
};

export default function HotelPaymentOptionSection({
  defaultOption = null,
  onPaymentMethodChange,
}: Props) {
  const [activeOption, setActiveOption] =
    useState<PaymentOptionKey | null>(defaultOption);

  const [selectedUpiMethod, setSelectedUpiMethod] = useState("");
  const [selectedEmiPlan, setSelectedEmiPlan] = useState("");
  const [selectedPayLater, setSelectedPayLater] = useState("");

  return (
    <section className="overflow-hidden rounded-2xl border border-[#d9e2ec] bg-white shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
      <div className="border-b border-[#e5e7eb] px-5 py-[18px] text-[26px] font-extrabold text-[#111827]">
        Payment Options
      </div>

      <PaymentRow
        icon="🇮🇳"
        title="UPI Options"
        subtitle="Pay directly from your bank account"
        isActive={activeOption === "upi"}
        onClick={() => {
          setActiveOption((prev) => (prev === "upi" ? null : "upi"));
          onPaymentMethodChange?.("upi");
        }}
      />

      {activeOption === "upi" && (
        <ExpandedBox>
          <div className="text-[15px] font-extrabold text-[#111827]">
            Choose UPI Method
          </div>

          <div className="mt-[14px] grid grid-cols-2 gap-3">
            {["Google Pay", "PhonePe", "Paytm", "BHIM UPI"].map((item) => (
              <SelectableMiniCard
                key={item}
                label={item}
                isSelected={selectedUpiMethod === item}
                onClick={() => setSelectedUpiMethod(item)}
              />
            ))}
          </div>

          <div className="mt-[18px]">
            <label className="mb-2 block text-[13px] font-bold text-[#374151]">
              Enter UPI ID
            </label>
            <input
              placeholder="example@upi"
              className="h-[46px] w-full rounded-[10px] border border-[#d1d5db] px-[14px] text-[14px] text-[#111827] outline-none"
            />
          </div>
        </ExpandedBox>
      )}

      <PaymentRow
        icon="💳"
        title="Credit & Debit Cards"
        subtitle="Visa, Mastercard, Amex, Rupay and more"
        isActive={activeOption === "cards"}
        onClick={() => {
          setActiveOption((prev) => (prev === "cards" ? null : "cards"));
          onPaymentMethodChange?.("cards");
        }}
      />

      {activeOption === "cards" && (
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
              className="h-[46px] w-full rounded-[10px] border border-[#d1d5db] px-[14px] text-[14px] text-[#111827] outline-none"
            />
          </div>

          <div className="mt-[14px] grid grid-cols-2 gap-[14px]">
            <div>
              <label className="mb-2 block text-[13px] font-bold text-[#374151]">
                Expiry
              </label>
              <input
                placeholder="MM/YY"
                className="h-[46px] w-full rounded-[10px] border border-[#d1d5db] px-[14px] text-[14px] text-[#111827] outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-[13px] font-bold text-[#374151]">
                CVV
              </label>
              <input
                placeholder="123"
                className="h-[46px] w-full rounded-[10px] border border-[#d1d5db] px-[14px] text-[14px] text-[#111827] outline-none"
              />
            </div>
          </div>

          <div className="mt-[14px]">
            <label className="mb-2 block text-[13px] font-bold text-[#374151]">
              Name on Card
            </label>
            <input
              placeholder="Enter card holder name"
              className="h-[46px] w-full rounded-[10px] border border-[#d1d5db] px-[14px] text-[14px] text-[#111827] outline-none"
            />
          </div>
        </ExpandedBox>
      )}

      <PaymentRow
        icon="🧾"
        title="EMI"
        subtitle="Credit / Debit Card & cardless EMI available"
        badge="NO COST EMI"
        isActive={activeOption === "emi"}
        onClick={() => {
          setActiveOption((prev) => (prev === "emi" ? null : "emi"));
          onPaymentMethodChange?.("emi");
        }}
      />

      {activeOption === "emi" && (
        <ExpandedBox>
          <div className="text-[15px] font-extrabold text-[#111827]">
            Choose EMI Option
          </div>

          <div className="mt-[14px] grid grid-cols-2 gap-3">
            {["3 Months", "6 Months", "9 Months", "12 Months"].map((item) => (
              <SelectableMiniCard
                key={item}
                label={item}
                isSelected={selectedEmiPlan === item}
                onClick={() => setSelectedEmiPlan(item)}
              />
            ))}
          </div>
        </ExpandedBox>
      )}

      <PaymentRow
        icon="🏦"
        title="Net Banking"
        subtitle="40+ banks available"
        isActive={activeOption === "netbanking"}
        onClick={() => {
          setActiveOption((prev) =>
            prev === "netbanking" ? null : "netbanking"
          );
          onPaymentMethodChange?.("netbanking");
        }}
      />

      {activeOption === "netbanking" && (
        <ExpandedBox>
          <div className="text-[15px] font-extrabold text-[#111827]">
            Select Your Bank
          </div>

          <select className="mt-[14px] h-[46px] w-full rounded-[10px] border border-[#d1d5db] px-[14px] text-[14px] text-[#111827] outline-none">
            <option>Select Bank</option>
            <option>HDFC Bank</option>
            <option>ICICI Bank</option>
            <option>SBI</option>
            <option>Axis Bank</option>
          </select>
        </ExpandedBox>
      )}

      <PaymentRow
        icon="⏳"
        title="Pay Later"
        subtitle="LazyPay, Amazon Pay Later"
        isActive={activeOption === "paylater"}
        onClick={() => {
          setActiveOption((prev) => (prev === "paylater" ? null : "paylater"));
          onPaymentMethodChange?.("paylater");
        }}
      />

      {activeOption === "paylater" && (
        <ExpandedBox>
          <div className="text-[15px] font-extrabold text-[#111827]">
            Available Pay Later Options
          </div>

          <div className="mt-[14px] grid grid-cols-2 gap-3">
            {["LazyPay", "Amazon Pay Later"].map((item) => (
              <SelectableMiniCard
                key={item}
                label={item}
                isSelected={selectedPayLater === item}
                onClick={() => setSelectedPayLater(item)}
              />
            ))}
          </div>
        </ExpandedBox>
      )}

      <PaymentRow
        icon="🎁"
        title="Gift Cards & e-wallets"
        subtitle="Gift card / wallet code"
        isActive={activeOption === "wallets"}
        onClick={() => {
          setActiveOption((prev) => (prev === "wallets" ? null : "wallets"));
          onPaymentMethodChange?.("wallets");
        }}
      />

      {activeOption === "wallets" && (
        <ExpandedBox>
          <div className="text-[15px] font-extrabold text-[#111827]">
            Wallet / Gift Card
          </div>

          <div className="mt-[14px]">
            <label className="mb-2 block text-[13px] font-bold text-[#374151]">
              Enter Code
            </label>
            <input
              placeholder="Enter wallet or gift card code"
              className="h-[46px] w-full rounded-[10px] border border-[#d1d5db] px-[14px] text-[14px] text-[#111827] outline-none"
            />
          </div>
        </ExpandedBox>
      )}
    </section>
  );
}

function PaymentRow({
  icon,
  title,
  subtitle,
  badge,
  isActive,
  onClick,
}: {
  icon: string;
  title: string;
  subtitle: string;
  badge?: string;
  isActive?: boolean;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`flex cursor-pointer items-center justify-between gap-[14px] border-b border-[#e5e7eb] px-5 py-[18px] ${
        isActive ? "bg-[#f8fbff] shadow-[inset_0_0_0_1.5px_#7dd3fc]" : "bg-white"
      }`}
    >
      <div className="flex min-w-0 items-center gap-[14px]">
        <div
          className={`flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-[10px] text-[20px] ${
            isActive ? "bg-[#dff2ff]" : "bg-[#eef6ff]"
          }`}
        >
          {icon}
        </div>

        <div className="min-w-0">
          <div className="text-[16px] font-extrabold text-[#111827]">
            {title}
          </div>
          <div className="mt-[3px] text-[13px] leading-[18px] text-[#6b7280]">
            {subtitle}
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        {badge ? (
          <span className="rounded-full bg-[#ccfbf1] px-2 py-[5px] text-[11px] font-extrabold text-[#0f766e]">
            {badge}
          </span>
        ) : null}

        <span className={`text-[18px] font-extrabold ${isActive ? "text-[#0ea5e9]" : "text-[#60a5fa]"}`}>
          ›
        </span>
      </div>
    </div>
  );
}

function ExpandedBox({ children }: { children: React.ReactNode }) {
  return <div className="border-b border-[#e5e7eb] bg-white px-5 pb-5 pl-[76px] pt-[18px]">{children}</div>;
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
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      className={`min-h-[46px] rounded-[10px] px-[14px] py-[10px] text-[14px] font-bold ${
        isSelected
          ? "border-[1.5px] border-[#7dd3fc] bg-[#f8fbff] text-[#0f172a]"
          : "border border-[#d1d5db] bg-white text-[#1f2937]"
      }`}
    >
      {label}
    </button>
  );
}