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

export default function CabPaymentOptionSection({
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
      <div className="border-b border-[#e5e7eb] px-5 py-[18px] text-[20px] font-extrabold text-[#111827]">
        Payment Options
      </div>

      <PaymentRow
        icon="🇮🇳"
        title="UPI Options"
        subtitle="Pay directly from your bank account"
        isActive={activeOption === "upi"}
        onClick={() => {
          const next = activeOption === "upi" ? null : "upi";
          setActiveOption(next);
          onPaymentMethodChange?.(next ? "upi" : "");
        }}
      />

      {activeOption === "upi" && (
        <ExpandedBox>
          <div className="text-[14px] font-extrabold text-[#111827]">
            Choose UPI Method
          </div>

          <div className="mt-[14px] grid grid-cols-2 gap-3">
            {["Google Pay", "PhonePe", "Paytm", "BHIM UPI"].map((item) => (
              <SelectableMiniCard
                key={item}
                label={item}
                isSelected={selectedUpiMethod === item}
                onClick={() => {
                  setSelectedUpiMethod(item);
                  onPaymentMethodChange?.(`upi:${item}`);
                }}
              />
            ))}
          </div>

          <div className="mt-[18px]">
            <label className="mb-2 block text-[12px] font-bold text-[#374151]">
              Enter UPI ID
            </label>
            <input
              placeholder="example@upi"
              className="h-[44px] w-full rounded-[10px] border border-[#d1d5db] px-[14px] text-[13px] text-[#111827] outline-none"
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
          const next = activeOption === "cards" ? null : "cards";
          setActiveOption(next);
          onPaymentMethodChange?.(next ? "cards" : "");
        }}
      />

      {activeOption === "cards" && (
        <ExpandedBox>
          <div className="text-[14px] font-extrabold text-[#111827]">
            Card Details
          </div>

          <div className="mt-4">
            <label className="mb-2 block text-[12px] font-bold text-[#374151]">
              Card Number
            </label>
            <input
              placeholder="1234 5678 9012 3456"
              className="h-[44px] w-full rounded-[10px] border border-[#d1d5db] px-[14px] text-[13px] text-[#111827] outline-none"
            />
          </div>

          <div className="mt-[14px] grid grid-cols-2 gap-[14px]">
            <div>
              <label className="mb-2 block text-[12px] font-bold text-[#374151]">
                Expiry
              </label>
              <input
                placeholder="MM/YY"
                className="h-[44px] w-full rounded-[10px] border border-[#d1d5db] px-[14px] text-[13px] text-[#111827] outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-[12px] font-bold text-[#374151]">
                CVV
              </label>
              <input
                placeholder="123"
                className="h-[44px] w-full rounded-[10px] border border-[#d1d5db] px-[14px] text-[13px] text-[#111827] outline-none"
              />
            </div>
          </div>

          <div className="mt-[14px]">
            <label className="mb-2 block text-[12px] font-bold text-[#374151]">
              Name on Card
            </label>
            <input
              placeholder="Enter card holder name"
              className="h-[44px] w-full rounded-[10px] border border-[#d1d5db] px-[14px] text-[13px] text-[#111827] outline-none"
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
          const next = activeOption === "emi" ? null : "emi";
          setActiveOption(next);
          onPaymentMethodChange?.(next ? "emi" : "");
        }}
      />

      {activeOption === "emi" && (
        <ExpandedBox>
          <div className="text-[14px] font-extrabold text-[#111827]">
            Choose EMI Option
          </div>

          <div className="mt-[14px] grid grid-cols-2 gap-3">
            {["3 Months", "6 Months", "9 Months", "12 Months"].map((item) => (
              <SelectableMiniCard
                key={item}
                label={item}
                isSelected={selectedEmiPlan === item}
                onClick={() => {
                  setSelectedEmiPlan(item);
                  onPaymentMethodChange?.(`emi:${item}`);
                }}
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
          const next = activeOption === "netbanking" ? null : "netbanking";
          setActiveOption(next);
          onPaymentMethodChange?.(next ? "netbanking" : "");
        }}
      />

      {activeOption === "netbanking" && (
        <ExpandedBox>
          <div className="text-[14px] font-extrabold text-[#111827]">
            Select Your Bank
          </div>

          <select
            className="mt-[14px] h-[44px] w-full rounded-[10px] border border-[#d1d5db] px-[14px] text-[13px] text-[#111827] outline-none"
            onChange={(e) =>
              onPaymentMethodChange?.(
                e.target.value ? `netbanking:${e.target.value}` : "netbanking"
              )
            }
          >
            <option value="">Select Bank</option>
            <option value="HDFC Bank">HDFC Bank</option>
            <option value="ICICI Bank">ICICI Bank</option>
            <option value="SBI">SBI</option>
            <option value="Axis Bank">Axis Bank</option>
          </select>
        </ExpandedBox>
      )}

      <PaymentRow
        icon="⏳"
        title="Pay Later"
        subtitle="LazyPay, Amazon Pay Later"
        isActive={activeOption === "paylater"}
        onClick={() => {
          const next = activeOption === "paylater" ? null : "paylater";
          setActiveOption(next);
          onPaymentMethodChange?.(next ? "paylater" : "");
        }}
      />

      {activeOption === "paylater" && (
        <ExpandedBox>
          <div className="text-[14px] font-extrabold text-[#111827]">
            Available Pay Later Options
          </div>

          <div className="mt-[14px] grid grid-cols-2 gap-3">
            {["LazyPay", "Amazon Pay Later"].map((item) => (
              <SelectableMiniCard
                key={item}
                label={item}
                isSelected={selectedPayLater === item}
                onClick={() => {
                  setSelectedPayLater(item);
                  onPaymentMethodChange?.(`paylater:${item}`);
                }}
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
          const next = activeOption === "wallets" ? null : "wallets";
          setActiveOption(next);
          onPaymentMethodChange?.(next ? "wallets" : "");
        }}
      />

      {activeOption === "wallets" && (
        <ExpandedBox>
          <div className="text-[14px] font-extrabold text-[#111827]">
            Wallet / Gift Card
          </div>

          <div className="mt-[14px]">
            <label className="mb-2 block text-[12px] font-bold text-[#374151]">
              Enter Code
            </label>
            <input
              placeholder="Enter wallet or gift card code"
              className="h-[44px] w-full rounded-[10px] border border-[#d1d5db] px-[14px] text-[13px] text-[#111827] outline-none"
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
      className={`flex cursor-pointer items-center justify-between gap-[14px] border-b border-[#e5e7eb] px-5 py-[16px] ${
        isActive
          ? "bg-[#f8fbff] shadow-[inset_0_0_0_1.5px_#7dd3fc]"
          : "bg-white"
      }`}
    >
      <div className="flex min-w-0 items-center gap-[14px]">
        <div
          className={`flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-[10px] text-[18px] ${
            isActive ? "bg-[#dff2ff]" : "bg-[#eef6ff]"
          }`}
        >
          {icon}
        </div>

        <div className="min-w-0">
          <div className="text-[14px] font-extrabold text-[#111827]">
            {title}
          </div>
          <div className="mt-[3px] text-[12px] leading-[17px] text-[#6b7280]">
            {subtitle}
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        {badge ? (
          <span className="rounded-full bg-[#ccfbf1] px-2 py-[5px] text-[10px] font-extrabold text-[#0f766e]">
            {badge}
          </span>
        ) : null}

        <span
          className={`text-[16px] font-extrabold ${
            isActive ? "text-[#0ea5e9]" : "text-[#60a5fa]"
          }`}
        >
          ›
        </span>
      </div>
    </div>
  );
}

function ExpandedBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-b border-[#e5e7eb] bg-white px-5 pb-5 pl-[72px] pt-[18px]">
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
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      className={`min-h-[44px] rounded-[10px] px-[14px] py-[10px] text-[13px] font-bold ${
        isSelected
          ? "border-[1.5px] border-[#7dd3fc] bg-[#f8fbff] text-[#0f172a]"
          : "border border-[#d1d5db] bg-white text-[#1f2937]"
      }`}
    >
      {label}
    </button>
  );
}
