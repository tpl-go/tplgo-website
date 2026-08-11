"use client";

import { useMemo } from "react";
import { formatCurrency } from "@/app/lib/manage/manageUtils";

type TravellerItem = {
  id: string;
  title: string;
  firstName: string;
  lastName: string;
  type: "adult" | "child" | "infant";
};

export type ManageBaggageOption = {
  code: string;
  label: string;
  weight: string;
  price: number;
  category: "light" | "standard" | "heavy";
  available: boolean;
};

export type TravellerBaggageSelection = {
  travellerId: string;
  oldBaggageCode?: string | null;
  newBaggageCode?: string | null;
  oldPrice: number;
  newPrice: number;
  skipped?: boolean;
};

interface ManageBaggageSectionProps {
  travellers: TravellerItem[];
  value: TravellerBaggageSelection[];
  baggageOptions?: ManageBaggageOption[];
  currency?: string;
  onChange: (next: TravellerBaggageSelection[]) => void;
}

function getBaggageDiff(oldPrice: number, newPrice: number) {
  return Number((newPrice - oldPrice).toFixed(2));
}

function getBaggageLabel(code: string | null | undefined) {
  if (!code) return "Not selected";
  if (code === "BG0") return "No extra baggage";
  return code;
}

export default function ManageBaggageSection({
  travellers,
  value,
  currency = "INR",
}: ManageBaggageSectionProps) {
  const totalBaggageDiff = useMemo(() => {
    return value.reduce((sum, item) => sum + getBaggageDiff(item.oldPrice, item.newPrice), 0);
  }, [value]);

  return (
    <div className="space-y-5">
      <div className="rounded-[28px] border border-black/5 bg-white p-5 shadow-[0_10px_40px_rgba(0,0,0,0.04)] lg:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#ff6b00]">
              Manage Baggage
            </p>
            <h2 className="mt-1 text-xl font-bold text-[#111827] md:text-2xl">
              Baggage change availability
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6b7280]">
              Current extra baggage is shown from the booking snapshot. New baggage
              alternatives require a backend/provider read-only quote and are unavailable
              until that safe contract exists for this booking.
            </p>
          </div>

          <div className="rounded-[22px] bg-[#fff7f2] px-5 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6b7280]">
              Quoted Difference
            </p>
            <p className="mt-1 text-xl font-bold text-[#111827]">
              {formatCurrency(totalBaggageDiff, currency)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {travellers.map((traveller, index) => {
          const selection = value.find((item) => item.travellerId === traveller.id) || value[index];
          return (
            <div key={traveller.id} className="rounded-[24px] border border-black/5 bg-white p-4 shadow-sm">
              <p className="text-sm font-bold text-[#111827]">
                {traveller.title} {traveller.firstName} {traveller.lastName}
              </p>
              <p className="mt-1 text-xs uppercase tracking-[0.14em] text-[#6b7280]">
                Traveller {index + 1} · {traveller.type}
              </p>
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between gap-3 rounded-2xl bg-[#f8f9fb] px-3 py-3">
                  <span className="text-sm font-semibold text-[#4b5563]">Booked baggage</span>
                  <span className="text-sm font-black text-[#111827]">
                    {getBaggageLabel(selection?.oldBaggageCode || selection?.newBaggageCode)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3 rounded-2xl bg-[#f8f9fb] px-3 py-3">
                  <span className="text-sm font-semibold text-[#4b5563]">Snapshot value</span>
                  <span className="text-sm font-black text-[#111827]">
                    {formatCurrency(Number(selection?.oldPrice ?? selection?.newPrice ?? 0), currency)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-[24px] border border-dashed border-[#cbd5e1] bg-[#f8fbff] p-5">
        <h3 className="text-base font-bold text-[#111827]">Baggage changes unavailable</h3>
        <p className="mt-2 text-sm leading-6 text-[#64748b]">
          No static baggage catalog or frontend price calculation is active. TPL will show
          provider-backed alternatives here only after the backend returns a safe manage-booking
          baggage quote.
        </p>
      </div>
    </div>
  );
}
