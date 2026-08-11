"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { TravellerMealSelection } from "@/app/lib/flights/ancillaries/ancillaryTypes";
import { formatCurrency } from "@/app/lib/manage/manageUtils";

type TravellerItem = {
  id: string;
  title: string;
  firstName: string;
  lastName: string;
  type: "adult" | "child" | "infant";
};

interface ManageMealsSectionProps {
  travellers: TravellerItem[];
  value: TravellerMealSelection[];
  currency?: string;
  onChange: (next: TravellerMealSelection[]) => void;
}

function getMealDiff(oldPrice: number, newPrice: number) {
  return Number((newPrice - oldPrice).toFixed(2));
}

function getMealName(mealId?: string | null, fallbackName?: string | null) {
  if (fallbackName?.trim()) return fallbackName.trim();
  if (!mealId) return "Not selected";
  return mealId;
}

export default function ManageMealsSection({
  travellers,
  value,
  currency = "INR",
  onChange,
}: ManageMealsSectionProps) {
  const totalMealDiff = useMemo(() => {
    return value.reduce((sum, item) => sum + getMealDiff(item.oldPrice, item.newPrice), 0);
  }, [value]);

  return (
    <div className="space-y-5">
      {/* Top Summary */}
      <div className="rounded-[28px] border border-black/5 bg-white p-5 shadow-[0_10px_40px_rgba(0,0,0,0.04)] lg:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#ff6b00]">
              Manage Meals
            </p>
            <h2 className="mt-1 text-xl font-bold text-[#111827] md:text-2xl">
              Modify traveller meal selection
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6b7280]">
              Booked meal data is shown from the booking snapshot. Meal changes are
              unavailable until a backend/provider read-only meal quote is available
              for this booking.
            </p>
          </div>

          <div className="rounded-[22px] bg-[#fff7f2] px-5 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6b7280]">
              Total Meal Difference
            </p>
            <p className="mt-1 text-xl font-bold text-[#111827]">
              {formatCurrency(totalMealDiff, currency)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[340px_minmax(0,1fr)]">
        {/* Left Traveller Rail */}
        <div className="rounded-[28px] border border-black/5 bg-white p-4 shadow-[0_10px_40px_rgba(0,0,0,0.04)]">
          <div className="border-b border-black/5 px-1 pb-4">
            <h3 className="text-base font-bold text-[#111827]">Travellers</h3>
            <p className="mt-1 text-sm text-[#6b7280]">
              Current meal selections are read-only.
            </p>
          </div>

          <div className="mt-4 space-y-3">
            {travellers.map((traveller, index) => {
              const selection = value.find((item) => item.travellerId === traveller.id);
              const diff = selection ? getMealDiff(selection.oldPrice, selection.newPrice) : 0;

              return (
                <button
                  key={traveller.id}
                  type="button"
                  onClick={() => undefined}
                  className={cn(
                    "w-full rounded-[22px] border px-4 py-4 text-left transition-all duration-200",
                    "border-black/5 bg-[#f8f9fb]"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[#111827]">
                        {traveller.title} {traveller.firstName} {traveller.lastName}
                      </p>
                      <p className="mt-1 text-xs uppercase tracking-[0.14em] text-[#6b7280]">
                        Traveller {index + 1} • {traveller.type}
                      </p>
                    </div>

                    <span
                      className={cn(
                        "rounded-full px-2.5 py-1 text-[10px] font-semibold",
                        diff > 0
                          ? "bg-[#fff1f2] text-[#be123c]"
                          : diff < 0
                          ? "bg-[#ecfdf5] text-[#166534]"
                          : "bg-white text-[#6b7280]"
                      )}
                    >
                      {diff > 0
                        ? `+${formatCurrency(diff, currency)}`
                        : diff < 0
                        ? `-${formatCurrency(Math.abs(diff), currency)}`
                        : "No Change"}
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-white px-3 py-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6b7280]">
                        Booked
                      </p>
                      <p className="mt-1 line-clamp-2 text-sm font-bold text-[#111827]">
                        {getMealName(selection?.oldMealId, selection?.oldMealName)}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-white px-3 py-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6b7280]">
                        Selected
                      </p>
                      <p className="mt-1 line-clamp-2 text-sm font-bold text-[#111827]">
                        {selection?.skipped
                          ? "Skipped"
                          : getMealName(selection?.newMealId, selection?.newMealName)}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Main Area */}
        <div className="space-y-5">
          {/* Meal change unavailable state */}
          <div className="rounded-[28px] border border-black/5 bg-white p-5 shadow-[0_10px_40px_rgba(0,0,0,0.04)] lg:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#ff6b00]">
                  Meal Change
                </p>
                <h3 className="mt-1 text-lg font-bold text-[#111827]">
                  Provider meal-change quote unavailable
                </h3>
                <p className="mt-1 text-sm text-[#6b7280]">
                  TPL will not show or price a replacement meal from a static catalog.
                  If the provider exposes real post-booking meal alternatives later,
                  this section can render those backend-authoritative options.
                </p>
              </div>
            </div>
          </div>

          {/* Per Traveller Meal Change Summary */}
          <div className="rounded-[28px] border border-black/5 bg-white p-5 shadow-[0_10px_40px_rgba(0,0,0,0.04)] lg:p-6">
            <h3 className="text-base font-bold text-[#111827]">Meal Change Summary</h3>

            <div className="mt-4 space-y-3">
              {value.map((item) => {
                const traveller = travellers.find((t) => t.id === item.travellerId);
                const diff = getMealDiff(item.oldPrice, item.newPrice);

                return (
                  <div
                    key={item.travellerId}
                    className="flex flex-col gap-3 rounded-[22px] bg-[#f8f9fb] px-4 py-4 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#111827]">
                        {traveller?.title} {traveller?.firstName} {traveller?.lastName}
                      </p>
                      <p className="mt-1 truncate text-sm text-[#6b7280]">
                        {getMealName(item.oldMealId, item.oldMealName)} →{" "}
                        {item.skipped ? "Skipped" : getMealName(item.newMealId, item.newMealName)}
                      </p>
                    </div>

                    <div className="text-left md:text-right">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6b7280]">
                        Fare Difference
                      </p>
                      <p
                        className={cn(
                          "mt-1 text-sm font-bold",
                          diff > 0
                            ? "text-[#dc2626]"
                            : diff < 0
                            ? "text-[#166534]"
                            : "text-[#111827]"
                        )}
                      >
                        {diff > 0
                          ? `+ ${formatCurrency(diff, currency)}`
                          : diff < 0
                          ? `- ${formatCurrency(Math.abs(diff), currency)}`
                          : formatCurrency(0, currency)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
