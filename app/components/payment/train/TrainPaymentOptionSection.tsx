"use client";

import { useState } from "react";

const QR_DARK_CELLS = new Set([
  0, 1, 2, 3, 4, 7, 11, 14, 18, 21, 22, 23, 24, 25, 28, 30, 32, 34, 36, 38,
  40, 42, 43, 44, 45, 46, 48,
]);

type PaymentOptionKey =
  | "upi"
  | "qr"
  | "cards"
  | "emi"
  | "netbanking";

type Props = {
  defaultOption?: PaymentOptionKey | null;
  payableAmount?: number;
  onPaymentMethodChange?: (method: string) => void;
};

export default function TrainPaymentOptionSection({
  defaultOption = null,
  payableAmount = 0,
  onPaymentMethodChange,
}: Props) {
  const [activeOption, setActiveOption] =
    useState<PaymentOptionKey | null>(defaultOption);

  const [selectedUpiMethod, setSelectedUpiMethod] = useState("");

  return (
    <section className="overflow-hidden rounded-2xl border border-[#d9e2ec] bg-white shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
      <div className="border-b border-[#e5e7eb] px-4 py-[18px] text-[22px] font-extrabold text-[#111827] md:px-5 md:text-[26px]">
        Payment Options
      </div>

      <PaymentRow
        icon="🇮🇳"
        title="UPI Options"
        subtitle="Pay Directly From Your Bank Account"
        isActive={activeOption === "upi"}
        onClick={() => {
          setActiveOption((prev) => (prev === "upi" ? null : "upi"));
          onPaymentMethodChange?.("upi");
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
                onClick={() => setSelectedUpiMethod(item)}
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
        icon="▦"
        title="QR Payment"
        subtitle="Scan and pay using any UPI app"
        badge="UPI QR"
        isActive={activeOption === "qr"}
        onClick={() => {
          setActiveOption((prev) => (prev === "qr" ? null : "qr"));
          onPaymentMethodChange?.("qr");
        }}
      />

      {activeOption === "qr" && (
        <ExpandedBox>
          <div className="text-[15px] font-extrabold text-[#111827]">
            Scan QR using any UPI app
          </div>

          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="mx-auto grid h-[168px] w-[168px] shrink-0 grid-cols-7 gap-1 rounded-2xl border border-[#d9e2ec] bg-white p-3 shadow-sm sm:mx-0">
              {Array.from({ length: 49 }).map((_, index) => (
                <span
                  key={index}
                  className={`rounded-[2px] ${
                    QR_DARK_CELLS.has(index)
                      ? "bg-[#0f172a]"
                      : "bg-[#e2e8f0]"
                  }`}
                />
              ))}
            </div>

            <div className="min-w-0 flex-1 rounded-2xl bg-[#f8fbff] p-4">
              <div className="text-[13px] font-extrabold text-[#111827]">
                Amount: ₹
                {Math.round(payableAmount || 0).toLocaleString("en-IN")}
              </div>
              <div className="mt-2 text-[12px] font-semibold leading-5 text-[#475569]">
                After payment, click Confirm Payment. This is a QR placeholder
                for the current booking amount; gateway verification is not
                integrated yet.
              </div>
            </div>
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
        subtitle="Coming soon"
        badge="COMING SOON"
        disabled
      />

      <PaymentRow
        icon="🏦"
        title="Net Banking"
        subtitle="40+ Banks Available"
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
          <div className="text-[14px] font-extrabold text-[#111827]">
            Select Your Bank
          </div>

          <select className="mt-[14px] h-[44px] w-full rounded-[10px] border border-[#d1d5db] px-[14px] text-[13px] text-[#111827] outline-none">
            <option>Select Bank</option>
            <option>HDFC Bank</option>
            <option>ICICI Bank</option>
            <option>SBI</option>
            <option>Axis Bank</option>
          </select>
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
  disabled = false,
  onClick,
}: {
  icon: string;
  title: string;
  subtitle: string;
  badge?: string;
  isActive?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={disabled ? undefined : onClick}
      aria-disabled={disabled}
      className={`flex items-center justify-between gap-[14px] border-b border-[#e5e7eb] px-4 py-[18px] transition-all md:px-5 ${
        disabled
          ? "cursor-not-allowed bg-[#f8fafc] opacity-70"
          : isActive
          ? "cursor-pointer bg-[#f8fbff] shadow-[inset_0_0_0_1.5px_#7dd3fc]"
          : "cursor-pointer bg-white"
      }`}
    >
      <div className="flex min-w-0 items-center gap-[14px]">
        <div
          className={`flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-[10px] text-[20px] ${
            disabled ? "bg-[#e5e7eb]" : isActive ? "bg-[#dff2ff]" : "bg-[#eef6ff]"
          }`}
        >
          {icon}
        </div>

        <div className="min-w-0">
          <div className="text-[15px] font-extrabold text-[#111827] md:text-[16px]">
            {title}
          </div>
          <div className="mt-[3px] text-[12px] leading-[17px] text-[#6b7280] md:text-[13px] md:leading-[18px]">
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
          className={`text-[18px] font-extrabold ${
            disabled ? "text-[#94a3b8]" : isActive ? "text-[#0ea5e9]" : "text-[#60a5fa]"
          }`}
        >
          {disabled ? "×" : "›"}
        </span>
      </div>
    </div>
  );
}

function ExpandedBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-b border-[#e5e7eb] bg-white px-4 pb-5 pt-[18px] md:px-5 md:pl-[76px]">
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
