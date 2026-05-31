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

export default function HotelPaymentTripSecureCard({
  defaultSelected = false,
  defaultAmount = 499,
  onSelectionChange,
}: Props) {
  const [selected, setSelected] = useState(defaultSelected);

  useEffect(() => {
    queueMicrotask(() => {
      onSelectionChange?.({
        selected,
        totalAmount: selected ? defaultAmount : 0,
      });
    });
  }, [selected, defaultAmount, onSelectionChange]);

  return (
    <section className="overflow-hidden rounded-2xl border border-[#d9e2ec] bg-white shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
      <div className="border-b border-[#e5e7eb] bg-[#f7fcff] px-4 py-4 md:px-[18px]">
        <div className="mb-[10px] inline-block rounded-full bg-[#dff6ff] px-2 py-1 text-[12px] font-extrabold text-[#0891b2]">
          Recommended Protection
        </div>

        <div className="text-[18px] font-extrabold text-[#111827]">
          Trip Secure
        </div>

        <div className="mt-[6px] text-[14px] leading-[21px] text-[#4b5563]">
          Protect your hotel booking with cancellation support and priority help.
        </div>
      </div>

      <div className="flex flex-col gap-4 px-4 py-4 md:flex-row md:flex-wrap md:items-center md:justify-between md:px-[18px]">
        <div className="flex items-start gap-[14px] md:items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#eef6ff] text-[24px]">
            🛡️
          </div>

          <div className="min-w-0">
            <div className="text-[13px] font-semibold text-[#6b7280]">
              hotel booking protection
            </div>

            <div className="mt-[2px] text-[18px] font-extrabold text-[#111827]">
              ₹{defaultAmount.toLocaleString("en-IN")}
            </div>

            <div className="mt-1 text-[13px] font-medium text-[#4b5563]">
              Better protection for cancellation and booking issues.
            </div>
          </div>
        </div>

        <button
          onClick={() => setSelected((prev) => !prev)}
          className={`h-[44px] w-full rounded-xl px-[18px] text-[14px] font-extrabold md:w-auto md:min-w-[150px] md:rounded-full ${
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
