"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import {
  FlightMealOption,
  TravellerMealSelection,
} from "@/app/lib/flights/ancillaries/ancillaryTypes";
import { FLIGHT_ANCILLARY_CATALOG } from "@/app/lib/flights/ancillaries/ancillaryCatalog";
import { assignMealToTraveller } from "@/app/lib/flights/ancillaries/ancillarySelection";
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

const MEAL_CATALOG = FLIGHT_ANCILLARY_CATALOG.meals;

function getMealDiff(oldPrice: number, newPrice: number) {
  return Number((newPrice - oldPrice).toFixed(2));
}

function getMealName(mealId?: string | null) {
  if (!mealId) return "Not Selected";
  return MEAL_CATALOG.find((item) => item.id === mealId)?.name ?? "Unknown Meal";
}

function getMealCategoryLabel(category: FlightMealOption["category"]) {
  return category === "veg" ? "Veg" : "Non Veg";
}

function getMealColors(category: FlightMealOption["category"]) {
  return category === "veg"
    ? {
        bg: "#ecfdf5",
        border: "#86efac",
        text: "#166534",
      }
    : {
        bg: "#fff7ed",
        border: "#fdba74",
        text: "#c2410c",
      };
}

export default function ManageMealsSection({
  travellers,
  value,
  currency = "INR",
  onChange,
}: ManageMealsSectionProps) {
  const travellerIds = useMemo(() => travellers.map((item) => item.id), [travellers]);

  const [activeTravellerId, setActiveTravellerId] = useState<string>(
    travellers[0]?.id ?? ""
  );
  const [mealFilter, setMealFilter] = useState<"all" | "veg" | "nonveg">("all");

  const filteredMeals = useMemo(() => {
    if (mealFilter === "all") return MEAL_CATALOG;
    return MEAL_CATALOG.filter((item) => item.category === mealFilter);
  }, [mealFilter]);

  const activeTraveller = useMemo(() => {
    return travellers.find((item) => item.id === activeTravellerId) ?? null;
  }, [activeTravellerId, travellers]);

  const activeMealSelection = useMemo(() => {
    return value.find((item) => item.travellerId === activeTravellerId) ?? null;
  }, [activeTravellerId, value]);

  const totalMealDiff = useMemo(() => {
    return value.reduce((sum, item) => sum + getMealDiff(item.oldPrice, item.newPrice), 0);
  }, [value]);

  const handleMealSelect = (meal: FlightMealOption) => {
    if (!activeTravellerId) return;

    const nextSelections = assignMealToTraveller({
      current: value,
      travellerIds,
      travellerId: activeTravellerId,
      meal,
    });

    onChange(nextSelections);
  };

  const handleResetMeal = (travellerId: string) => {
    const current = value.find((item) => item.travellerId === travellerId);
    if (!current) return;

    const next = value.map((item) =>
      item.travellerId === travellerId
        ? {
            ...item,
            newMealId: item.oldMealId ?? null,
            newPrice: item.oldPrice,
            skipped: false,
          }
        : item
    );

    onChange(next);
  };

  const handleRemoveMeal = (travellerId: string) => {
    const current = value.find((item) => item.travellerId === travellerId);
    if (!current) return;

    const next = value.map((item) =>
      item.travellerId === travellerId
        ? {
            ...item,
            newMealId: null,
            newPrice: 0,
            skipped: true,
          }
        : item
    );

    onChange(next);
  };

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
              Booked meal aur new selected meal ka comparison yahin hoga.
              Fare difference auto-calculate hoke settlement summary me chala jayega.
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
              Traveller choose karke meal update karo.
            </p>
          </div>

          <div className="mt-4 space-y-3">
            {travellers.map((traveller, index) => {
              const selection = value.find((item) => item.travellerId === traveller.id);
              const diff = selection ? getMealDiff(selection.oldPrice, selection.newPrice) : 0;
              const isActive = traveller.id === activeTravellerId;

              return (
                <button
                  key={traveller.id}
                  type="button"
                  onClick={() => setActiveTravellerId(traveller.id)}
                  className={cn(
                    "w-full rounded-[22px] border px-4 py-4 text-left transition-all duration-200",
                    isActive
                      ? "border-[#ff6b00]/20 bg-[#fff7f2]"
                      : "border-black/5 bg-[#f8f9fb] hover:bg-[#f3f4f6]"
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
                        {getMealName(selection?.oldMealId)}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-white px-3 py-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6b7280]">
                        Selected
                      </p>
                      <p className="mt-1 line-clamp-2 text-sm font-bold text-[#111827]">
                        {selection?.skipped
                          ? "Skipped"
                          : getMealName(selection?.newMealId)}
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
          {/* Active Traveller Summary */}
          <div className="rounded-[28px] border border-black/5 bg-white p-5 shadow-[0_10px_40px_rgba(0,0,0,0.04)] lg:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#ff6b00]">
                  Active Traveller
                </p>
                <h3 className="mt-1 text-lg font-bold text-[#111827]">
                  {activeTraveller
                    ? `${activeTraveller.title} ${activeTraveller.firstName} ${activeTraveller.lastName}`
                    : "Select Traveller"}
                </h3>
                <p className="mt-1 text-sm text-[#6b7280]">
                  Booked meal aur new meal yahan compare hogi.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => activeTravellerId && handleResetMeal(activeTravellerId)}
                  className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-[#111827] transition hover:bg-[#f8f9fb]"
                >
                  Reset to Booked
                </button>

                <button
                  type="button"
                  onClick={() => activeTravellerId && handleRemoveMeal(activeTravellerId)}
                  className="rounded-full border border-[#ef4444]/20 bg-[#fff5f5] px-4 py-2 text-sm font-semibold text-[#dc2626] transition hover:bg-[#fee2e2]"
                >
                  Remove Meal
                </button>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
              <InfoCard
                label="Booked Meal"
                value={getMealName(activeMealSelection?.oldMealId)}
                subValue={formatCurrency(activeMealSelection?.oldPrice ?? 0, currency)}
              />
              <InfoCard
                label="New Meal"
                value={
                  activeMealSelection?.skipped
                    ? "Skipped"
                    : getMealName(activeMealSelection?.newMealId)
                }
                subValue={formatCurrency(activeMealSelection?.newPrice ?? 0, currency)}
              />
              <InfoCard
                label="Difference"
                value={formatCurrency(
                  getMealDiff(
                    activeMealSelection?.oldPrice ?? 0,
                    activeMealSelection?.newPrice ?? 0
                  ),
                  currency
                )}
                subValue="Auto calculated"
              />
            </div>
          </div>

          {/* Meal Catalog */}
          <div className="rounded-[28px] border border-black/5 bg-white p-5 shadow-[0_10px_40px_rgba(0,0,0,0.04)] lg:p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-base font-bold text-[#111827]">Available Meals</h3>
                <p className="mt-1 text-sm text-[#6b7280]">
                  Shared ancillary catalog se meal data aa raha hai. Later API se yahi replace hoga.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <FilterChip
                  label="All"
                  active={mealFilter === "all"}
                  onClick={() => setMealFilter("all")}
                />
                <FilterChip
                  label="Veg"
                  active={mealFilter === "veg"}
                  onClick={() => setMealFilter("veg")}
                />
                <FilterChip
                  label="Non Veg"
                  active={mealFilter === "nonveg"}
                  onClick={() => setMealFilter("nonveg")}
                />
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
              {filteredMeals.map((meal) => {
                const colors = getMealColors(meal.category);
                const isSelected = activeMealSelection?.newMealId === meal.id;

                return (
                  <button
                    key={meal.id}
                    type="button"
                    onClick={() => handleMealSelect(meal)}
                    className={cn(
                      "rounded-[24px] border p-4 text-left transition-all duration-200",
                      isSelected
                        ? "border-[#111827] shadow-[0_12px_30px_rgba(0,0,0,0.08)]"
                        : "border-black/5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.05)]"
                    )}
                    style={{ background: colors.bg }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-[#111827]">{meal.name}</p>
                        <p
                          className="mt-1 text-[11px] font-semibold uppercase tracking-[0.14em]"
                          style={{ color: colors.text }}
                        >
                          {getMealCategoryLabel(meal.category)}
                        </p>
                      </div>

                      {isSelected ? (
                        <span className="rounded-full bg-[#111827] px-2 py-1 text-[10px] font-semibold text-white">
                          Selected
                        </span>
                      ) : null}
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6b7280]">
                          Price
                        </p>
                        <p className="mt-1 text-sm font-bold text-[#111827]">
                          {formatCurrency(meal.price, currency)}
                        </p>
                      </div>

                      <span
                        className="rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]"
                        style={{
                          background: colors.bg,
                          borderColor: colors.border,
                          color: colors.text,
                        }}
                      >
                        {getMealCategoryLabel(meal.category)}
                      </span>
                    </div>
                  </button>
                );
              })}
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
                        {getMealName(item.oldMealId)} →{" "}
                        {item.skipped ? "Skipped" : getMealName(item.newMealId)}
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

function InfoCard({
  label,
  value,
  subValue,
}: {
  label: string;
  value: string;
  subValue?: string;
}) {
  return (
    <div className="rounded-[22px] bg-[#f8f9fb] px-4 py-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6b7280]">
        {label}
      </p>
      <p className="mt-1 line-clamp-2 text-base font-bold text-[#111827]">{value}</p>
      {subValue ? <p className="mt-1 text-xs text-[#6b7280]">{subValue}</p> : null}
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] transition-all",
        active
          ? "border-[#38bdf8] bg-[#e0f2fe] text-[#075985]"
          : "border-black/10 bg-white text-[#6b7280] hover:bg-[#f8f9fb]"
      )}
    >
      {label}
    </button>
  );
}