"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
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

const DEFAULT_BAGGAGE_OPTIONS: ManageBaggageOption[] = [
  {
    code: "BG0",
    label: "No Extra Baggage",
    weight: "0 KG",
    price: 0,
    category: "light",
    available: true,
  },
  {
    code: "BG10",
    label: "Extra Baggage",
    weight: "10 KG",
    price: 900,
    category: "light",
    available: true,
  },
  {
    code: "BG15",
    label: "Extra Baggage",
    weight: "15 KG",
    price: 1300,
    category: "standard",
    available: true,
  },
  {
    code: "BG20",
    label: "Extra Baggage",
    weight: "20 KG",
    price: 1700,
    category: "standard",
    available: true,
  },
  {
    code: "BG25",
    label: "Heavy Baggage",
    weight: "25 KG",
    price: 2200,
    category: "heavy",
    available: true,
  },
  {
    code: "BG30",
    label: "Heavy Baggage",
    weight: "30 KG",
    price: 2800,
    category: "heavy",
    available: true,
  },
];

function getBaggageDiff(oldPrice: number, newPrice: number) {
  return Number((newPrice - oldPrice).toFixed(2));
}

function getBaggageCategoryLabel(category: ManageBaggageOption["category"]) {
  switch (category) {
    case "light":
      return "Light";
    case "standard":
      return "Standard";
    default:
      return "Heavy";
  }
}

function getBaggageColors(category: ManageBaggageOption["category"]) {
  switch (category) {
    case "light":
      return {
        bg: "#eff6ff",
        border: "#93c5fd",
        text: "#1d4ed8",
      };
    case "standard":
      return {
        bg: "#ecfeff",
        border: "#67e8f9",
        text: "#0e7490",
      };
    default:
      return {
        bg: "#fff7ed",
        border: "#fdba74",
        text: "#c2410c",
      };
  }
}

function getBaggageLabel(
  code: string | null | undefined,
  options: ManageBaggageOption[]
) {
  if (!code) return "Not Selected";
  return options.find((item) => item.code === code)?.weight ?? "Unknown Baggage";
}

function assignBaggageToTraveller(params: {
  current: TravellerBaggageSelection[];
  travellerIds: string[];
  travellerId: string;
  baggage: ManageBaggageOption;
}) {
  const { current, travellerIds, travellerId, baggage } = params;
  const existing = current.find((item) => item.travellerId === travellerId);

  return [
    ...current.filter((item) => item.travellerId !== travellerId),
    {
      travellerId,
      oldBaggageCode: existing?.oldBaggageCode ?? null,
      oldPrice: existing?.oldPrice ?? 0,
      newBaggageCode: baggage.code,
      newPrice: baggage.price,
      skipped: false,
    },
  ].sort(
    (a, b) => travellerIds.indexOf(a.travellerId) - travellerIds.indexOf(b.travellerId)
  );
}

export default function ManageBaggageSection({
  travellers,
  value,
  baggageOptions = DEFAULT_BAGGAGE_OPTIONS,
  currency = "INR",
  onChange,
}: ManageBaggageSectionProps) {
  const travellerIds = useMemo(() => travellers.map((item) => item.id), [travellers]);

  const [activeTravellerId, setActiveTravellerId] = useState<string>(
    travellers[0]?.id ?? ""
  );
  const [baggageFilter, setBaggageFilter] = useState<"all" | "light" | "standard" | "heavy">(
    "all"
  );

  const filteredBaggageOptions = useMemo(() => {
    if (baggageFilter === "all") return baggageOptions;
    return baggageOptions.filter((item) => item.category === baggageFilter);
  }, [baggageFilter, baggageOptions]);

  const activeTraveller = useMemo(() => {
    return travellers.find((item) => item.id === activeTravellerId) ?? null;
  }, [activeTravellerId, travellers]);

  const activeBaggageSelection = useMemo(() => {
    return value.find((item) => item.travellerId === activeTravellerId) ?? null;
  }, [activeTravellerId, value]);

  const totalBaggageDiff = useMemo(() => {
    return value.reduce((sum, item) => sum + getBaggageDiff(item.oldPrice, item.newPrice), 0);
  }, [value]);

  const handleBaggageSelect = (baggage: ManageBaggageOption) => {
    if (!activeTravellerId) return;

    const nextSelections = assignBaggageToTraveller({
      current: value,
      travellerIds,
      travellerId: activeTravellerId,
      baggage,
    });

    onChange(nextSelections);
  };

  const handleResetBaggage = (travellerId: string) => {
    const current = value.find((item) => item.travellerId === travellerId);
    if (!current) return;

    const next = value.map((item) =>
      item.travellerId === travellerId
        ? {
            ...item,
            newBaggageCode: item.oldBaggageCode ?? null,
            newPrice: item.oldPrice,
            skipped: false,
          }
        : item
    );

    onChange(next);
  };

  const handleRemoveBaggage = (travellerId: string) => {
    const current = value.find((item) => item.travellerId === travellerId);
    if (!current) return;

    const next = value.map((item) =>
      item.travellerId === travellerId
        ? {
            ...item,
            newBaggageCode: null,
            newPrice: 0,
            skipped: true,
          }
        : item
    );

    onChange(next);
  };

  return (
    <div className="space-y-5">
      <div className="rounded-[28px] border border-black/5 bg-white p-5 shadow-[0_10px_40px_rgba(0,0,0,0.04)] lg:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#ff6b00]">
              Manage Baggage
            </p>
            <h2 className="mt-1 text-xl font-bold text-[#111827] md:text-2xl">
              Modify traveller baggage selection
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6b7280]">
              Booked extra baggage aur new selected baggage ka comparison yahin hoga.
              Fare difference auto-calculate hoke settlement summary me chala jayega.
            </p>
          </div>

          <div className="rounded-[22px] bg-[#fff7f2] px-5 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6b7280]">
              Total Baggage Difference
            </p>
            <p className="mt-1 text-xl font-bold text-[#111827]">
              {formatCurrency(totalBaggageDiff, currency)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[340px_minmax(0,1fr)]">
        <div className="rounded-[28px] border border-black/5 bg-white p-4 shadow-[0_10px_40px_rgba(0,0,0,0.04)]">
          <div className="border-b border-black/5 px-1 pb-4">
            <h3 className="text-base font-bold text-[#111827]">Travellers</h3>
            <p className="mt-1 text-sm text-[#6b7280]">
              Traveller choose karke baggage update karo.
            </p>
          </div>

          <div className="mt-4 space-y-3">
            {travellers.map((traveller, index) => {
              const selection = value.find((item) => item.travellerId === traveller.id);
              const diff = selection ? getBaggageDiff(selection.oldPrice, selection.newPrice) : 0;
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
                      <p className="mt-1 text-sm font-bold text-[#111827]">
                        {getBaggageLabel(selection?.oldBaggageCode, baggageOptions)}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-white px-3 py-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6b7280]">
                        Selected
                      </p>
                      <p className="mt-1 text-sm font-bold text-[#111827]">
                        {selection?.skipped
                          ? "Skipped"
                          : getBaggageLabel(selection?.newBaggageCode, baggageOptions)}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-5">
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
                  Booked baggage aur new baggage yahan compare hogi.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => activeTravellerId && handleResetBaggage(activeTravellerId)}
                  className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-[#111827] transition hover:bg-[#f8f9fb]"
                >
                  Reset to Booked
                </button>

                <button
                  type="button"
                  onClick={() => activeTravellerId && handleRemoveBaggage(activeTravellerId)}
                  className="rounded-full border border-[#ef4444]/20 bg-[#fff5f5] px-4 py-2 text-sm font-semibold text-[#dc2626] transition hover:bg-[#fee2e2]"
                >
                  Remove Baggage
                </button>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
              <InfoCard
                label="Booked Baggage"
                value={getBaggageLabel(activeBaggageSelection?.oldBaggageCode, baggageOptions)}
                subValue={formatCurrency(activeBaggageSelection?.oldPrice ?? 0, currency)}
              />
              <InfoCard
                label="New Baggage"
                value={
                  activeBaggageSelection?.skipped
                    ? "Skipped"
                    : getBaggageLabel(activeBaggageSelection?.newBaggageCode, baggageOptions)
                }
                subValue={formatCurrency(activeBaggageSelection?.newPrice ?? 0, currency)}
              />
              <InfoCard
                label="Difference"
                value={formatCurrency(
                  getBaggageDiff(
                    activeBaggageSelection?.oldPrice ?? 0,
                    activeBaggageSelection?.newPrice ?? 0
                  ),
                  currency
                )}
                subValue="Auto calculated"
              />
            </div>
          </div>

          <div className="rounded-[28px] border border-black/5 bg-white p-5 shadow-[0_10px_40px_rgba(0,0,0,0.04)] lg:p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-base font-bold text-[#111827]">Available Baggage Options</h3>
                <p className="mt-1 text-sm text-[#6b7280]">
                  Shared ancillary-style baggage data use ho raha hai. Later API se direct map ho jayega.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <FilterChip
                  label="All"
                  active={baggageFilter === "all"}
                  onClick={() => setBaggageFilter("all")}
                />
                <FilterChip
                  label="Light"
                  active={baggageFilter === "light"}
                  onClick={() => setBaggageFilter("light")}
                />
                <FilterChip
                  label="Standard"
                  active={baggageFilter === "standard"}
                  onClick={() => setBaggageFilter("standard")}
                />
                <FilterChip
                  label="Heavy"
                  active={baggageFilter === "heavy"}
                  onClick={() => setBaggageFilter("heavy")}
                />
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
              {filteredBaggageOptions.map((baggage) => {
                const colors = getBaggageColors(baggage.category);
                const isSelected = activeBaggageSelection?.newBaggageCode === baggage.code;

                return (
                  <button
                    key={baggage.code}
                    type="button"
                    disabled={!baggage.available}
                    onClick={() => handleBaggageSelect(baggage)}
                    className={cn(
                      "rounded-[24px] border p-4 text-left transition-all duration-200",
                      isSelected
                        ? "border-[#111827] shadow-[0_12px_30px_rgba(0,0,0,0.08)]"
                        : "border-black/5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.05)]",
                      !baggage.available && "cursor-not-allowed opacity-40"
                    )}
                    style={{ background: colors.bg }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-[#111827]">{baggage.label}</p>
                        <p
                          className="mt-1 text-[11px] font-semibold uppercase tracking-[0.14em]"
                          style={{ color: colors.text }}
                        >
                          {getBaggageCategoryLabel(baggage.category)}
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
                          Weight
                        </p>
                        <p className="mt-1 text-sm font-bold text-[#111827]">
                          {baggage.weight}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6b7280]">
                          Price
                        </p>
                        <p className="mt-1 text-sm font-bold text-[#111827]">
                          {formatCurrency(baggage.price, currency)}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-[28px] border border-black/5 bg-white p-5 shadow-[0_10px_40px_rgba(0,0,0,0.04)] lg:p-6">
            <h3 className="text-base font-bold text-[#111827]">Baggage Change Summary</h3>

            <div className="mt-4 space-y-3">
              {value.map((item) => {
                const traveller = travellers.find((t) => t.id === item.travellerId);
                const diff = getBaggageDiff(item.oldPrice, item.newPrice);

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
                        {getBaggageLabel(item.oldBaggageCode, baggageOptions)} →{" "}
                        {item.skipped
                          ? "Skipped"
                          : getBaggageLabel(item.newBaggageCode, baggageOptions)}
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
      <p className="mt-1 text-base font-bold text-[#111827]">{value}</p>
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