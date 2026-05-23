"use client";

import { useEffect, useState } from "react";

type Props = {
  defaultSelected?: boolean;
  defaultAmount?: number;
  onSelectionChange?: (payload: {
    selected: boolean;
    totalAmount: number;
  }) => void;
};

export default function HomestayPaymentTripSecureCard({
  defaultSelected = false,
  defaultAmount = 499,
  onSelectionChange,
}: Props) {
  const [selected, setSelected] = useState(defaultSelected);

  useEffect(() => {
    onSelectionChange?.({
      selected,
      totalAmount: selected ? defaultAmount : 0,
    });
  }, [selected, defaultAmount, onSelectionChange]);

  return (
    <section className="overflow-hidden rounded-2xl border border-[#d9e2ec] bg-white shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
      <div className="border-b border-[#e5e7eb] bg-[#f7fcff] px-[18px] py-4">
        <div className="mb-[10px] inline-block rounded-full bg-[#dff6ff] px-2 py-1 text-[12px] font-extrabold text-[#0891b2]">
          Recommended Protection
        </div>

        <div className="text-[18px] font-extrabold text-[#111827]">
          Trip Secure
        </div>

        <div className="mt-[6px] text-[14px] leading-[21px] text-[#4b5563]">
          Protect your homestay booking with cancellation support, priority help,
          and smoother stay assistance.
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 px-[18px] py-4">
        <div className="flex items-center gap-[14px]">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#eef6ff] text-[24px]">
            🛡️
          </div>

          <div>
            <div className="text-[13px] font-semibold text-[#6b7280]">
              homestay booking protection
            </div>

            <div className="mt-[2px] text-[18px] font-extrabold text-[#111827]">
              ₹{defaultAmount.toLocaleString("en-IN")}
            </div>

            <div className="mt-1 text-[13px] font-medium text-[#4b5563]">
              Better protection for cancellation, booking changes, and stay-related issues.
            </div>
          </div>
        </div>

        <button
          onClick={() => setSelected((prev) => !prev)}
          className={`min-w-[150px] h-[44px] rounded-full px-[18px] text-[14px] font-extrabold ${
            selected
              ? "border border-[#ef4444] bg-[#fff1f2] text-[#ef4444]"
              : "border border-[#1d9bf0] bg-[#1d9bf0] text-white"
          }`}
        >
          {selected
            ? `REMOVE ₹${defaultAmount.toLocaleString("en-IN")}`
            : `ADD @ ₹${defaultAmount.toLocaleString("en-IN")}`}
        </button>
      </div>
    </section>
  );
}