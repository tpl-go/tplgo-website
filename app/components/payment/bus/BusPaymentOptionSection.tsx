"use client";

import { useState } from "react";

const QR_DARK_CELLS = new Set([
  "0-0",
  "0-1",
  "0-2",
  "0-4",
  "0-6",
  "0-7",
  "0-8",
  "1-0",
  "1-2",
  "1-5",
  "1-6",
  "1-8",
  "2-0",
  "2-1",
  "2-2",
  "2-4",
  "2-7",
  "2-8",
  "3-3",
  "3-5",
  "3-6",
  "4-0",
  "4-2",
  "4-4",
  "4-5",
  "4-8",
  "5-1",
  "5-3",
  "5-6",
  "5-7",
  "6-0",
  "6-1",
  "6-2",
  "6-4",
  "6-6",
  "6-8",
  "7-0",
  "7-2",
  "7-5",
  "7-7",
  "8-0",
  "8-1",
  "8-2",
  "8-4",
  "8-6",
  "8-8",
]);

type PaymentOptionKey = "upi" | "qr" | "cards" | "emi" | "netbanking";

type Props = {
  defaultOption?: PaymentOptionKey | null;
  payableAmount?: number;
  onPaymentMethodChange?: (method: string) => void;
};

export default function BusPaymentOptionSection({
  defaultOption = null,
  payableAmount = 0,
  onPaymentMethodChange,
}: Props) {
  const [activeOption, setActiveOption] =
    useState<PaymentOptionKey | null>(defaultOption);

  const [selectedUpiMethod, setSelectedUpiMethod] = useState("");

  const selectOption = (option: PaymentOptionKey) => {
    setActiveOption((prev) => (prev === option ? null : option));
    onPaymentMethodChange?.(option);
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-[#d9e2ec] bg-white shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
      <div className="border-b border-[#e5e7eb] px-4 py-4 text-[18px] font-extrabold text-[#111827] sm:px-5 sm:text-[20px]">
        Payment Options
      </div>

      <PaymentRow
        icon="UPI"
        title="UPI Options"
        subtitle="Pay directly from your bank account"
        isActive={activeOption === "upi"}
        onClick={() => selectOption("upi")}
        testId="bus-payment-method-upi"
      />

      {activeOption === "upi" && (
        <ExpandedBox>
          <div className="text-[14px] font-extrabold text-[#111827]">
            Choose UPI Method
          </div>

          <div className="mt-[14px] grid grid-cols-1 gap-3 sm:grid-cols-2">
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
        icon="QR"
        title="QR Payment"
        subtitle="Scan and pay with any UPI app"
        badge="UPI QR"
        isActive={activeOption === "qr"}
        onClick={() => selectOption("qr")}
        testId="bus-payment-method-qr"
      />

      {activeOption === "qr" && (
        <ExpandedBox>
          <div className="grid gap-4 sm:grid-cols-[auto_1fr] sm:items-center">
            <div className="mx-auto grid h-[132px] w-[132px] grid-cols-9 gap-[3px] rounded-[18px] border border-[#d1d5db] bg-white p-3 sm:mx-0">
              {Array.from({ length: 81 }).map((_, index) => {
                const row = Math.floor(index / 9);
                const col = index % 9;
                return (
                  <span
                    key={`${row}-${col}`}
                    className={`rounded-[2px] ${
                      QR_DARK_CELLS.has(`${row}-${col}`)
                        ? "bg-[#111827]"
                        : "bg-[#e5e7eb]"
                    }`}
                  />
                );
              })}
            </div>

            <div className="min-w-0">
              <div className="text-[14px] font-extrabold text-[#111827]">
                Scan to pay
              </div>
              <div className="mt-2 text-[13px] font-semibold leading-[20px] text-[#4b5563]">
                Open any UPI app, scan this QR and complete your bus payment.
              </div>
              <div className="mt-3 rounded-[12px] bg-[#f8fbff] px-3 py-2 text-[12px] font-extrabold text-[#0f766e]">
                Amount: ₹{Number(payableAmount || 0).toLocaleString("en-IN")}
              </div>
            </div>
          </div>
        </ExpandedBox>
      )}

      <PaymentRow
        icon="CARD"
        title="Credit & Debit Cards"
        subtitle="Visa, Mastercard, Amex, Rupay and more"
        isActive={activeOption === "cards"}
        onClick={() => selectOption("cards")}
        testId="bus-payment-method-cards"
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

          <div className="mt-[14px] grid grid-cols-1 gap-[14px] sm:grid-cols-2">
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
        icon="EMI"
        title="EMI"
        subtitle="Coming soon"
        badge="COMING SOON"
        disabled
        testId="bus-payment-method-emi"
      />

      <PaymentRow
        icon="BANK"
        title="Net Banking"
        subtitle="40+ banks available"
        isActive={activeOption === "netbanking"}
        onClick={() => selectOption("netbanking")}
        testId="bus-payment-method-netbanking"
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
  testId,
}: {
  icon: string;
  title: string;
  subtitle: string;
  badge?: string;
  isActive?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  testId?: string;
}) {
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      data-testid={testId}
      data-selected={isActive ? "true" : "false"}
      className={`flex w-full items-center justify-between gap-3 border-b border-[#e5e7eb] px-4 py-4 text-left sm:px-5 ${
        disabled
          ? "cursor-not-allowed bg-[#f9fafb] opacity-70"
          : isActive
          ? "bg-[#f8fbff] shadow-[inset_0_0_0_1.5px_#7dd3fc]"
          : "bg-white"
      }`}
    >
      <div className="flex min-w-0 items-center gap-3 sm:gap-[14px]">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] text-[10px] font-black ${
            isActive ? "bg-[#dff2ff] text-[#0369a1]" : "bg-[#eef6ff] text-[#2563eb]"
          }`}
        >
          {icon}
        </div>

        <div className="min-w-0">
          <div className="break-words text-[14px] font-extrabold leading-[18px] text-[#111827]">
            {title}
          </div>
          <div className="mt-[3px] break-words text-[12px] leading-[17px] text-[#6b7280]">
            {subtitle}
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        {badge ? (
          <span className="rounded-full bg-[#ccfbf1] px-2 py-[5px] text-[9px] font-extrabold text-[#0f766e] sm:text-[10px]">
            {badge}
          </span>
        ) : null}

        {!disabled ? (
          <span
            className={`text-[16px] font-extrabold ${
              isActive ? "text-[#0ea5e9]" : "text-[#60a5fa]"
            }`}
          >
            ›
          </span>
        ) : null}
      </div>
    </button>
  );
}

function ExpandedBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-b border-[#e5e7eb] bg-white px-4 pb-5 pt-[18px] sm:px-5 md:pl-[72px]">
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
