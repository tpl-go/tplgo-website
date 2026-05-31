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

export default function BusPaymentTripSecureCard({
  defaultSelected = false,
  defaultAmount = 0,
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
      <div className="border-b border-[#e5e7eb] bg-[#f7fcff] px-4 py-4 sm:px-[18px]">
        <div className="mb-[10px] inline-block rounded-full bg-[#dff6ff] px-2 py-1 text-[11px] font-extrabold text-[#0891b2]">
          Recommended Protection
        </div>

        <div className="text-[16px] font-extrabold text-[#111827]">
          Trip Secure
        </div>

        <div className="mt-[6px] text-[13px] leading-[20px] text-[#4b5563]">
          Protect your bus booking with cancellation support and priority help.
        </div>
      </div>

      <div className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:px-[18px]">
        <div className="flex min-w-0 items-start gap-[14px] sm:items-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#eef6ff] text-[22px]">
            🛡️
          </div>

          <div className="min-w-0">
            <div className="text-[12px] font-semibold text-[#6b7280]">
              bus journey protection
            </div>

            <div className="mt-[2px] text-[16px] font-extrabold text-[#111827]">
              ₹{defaultAmount.toLocaleString("en-IN")}
            </div>

            <div className="mt-1 break-words text-[12px] font-medium text-[#4b5563]">
              Better protection for cancellation and booking issues.
            </div>
          </div>
        </div>

        <button
          onClick={() => setSelected((prev) => !prev)}
          className={`h-[42px] w-full rounded-full px-[18px] text-[13px] font-extrabold sm:w-auto sm:min-w-[140px] ${
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
