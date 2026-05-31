"use client";

import { useEffect, useMemo, useState } from "react";

type AddonStatus = "pending" | "selected" | "skipped";

type AddonItem = {
  key: string;
  title: string;
  subtitle: string;
  price: number;
};

export type HomestayAddonsPayload = {
  addonsStatus: AddonStatus;
  addonsLabel: string;
  addonsPrice: number;
  selectedItems: string[];
};

type Props = {
  isEnabled: boolean;
  onChange?: (payload: HomestayAddonsPayload) => void;
};

const ADDON_OPTIONS: AddonItem[] = [
  {
    key: "meal",
    title: "Meal Upgrade",
    subtitle: "Pre-book homemade meals for a more comfortable stay.",
    price: 1200,
  },
  {
    key: "decor",
    title: "Stay Decoration",
    subtitle: "Special setup for anniversary, honeymoon or celebration.",
    price: 699,
  },
  {
    key: "assistance",
    title: "Priority Assistance",
    subtitle: "Extra support for check-in, local coordination and stay handling.",
    price: 499,
  },
  {
    key: "flexi",
    title: "Flexi Stay Protection",
    subtitle: "Extra flexibility with support benefits for your homestay booking.",
    price: 999,
  },
];

export default function HomestayBookingAddonsSection({
  isEnabled,
  onChange,
}: Props) {
  const [isOpen, setIsOpen] = useState(true);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [addonsStatus, setAddonsStatus] = useState<AddonStatus>("pending");

  const selectedAddonDetails = useMemo(() => {
    return ADDON_OPTIONS.filter((item) => selectedItems.includes(item.key));
  }, [selectedItems]);

  const addonsTotal = useMemo(() => {
    return selectedAddonDetails.reduce((sum, item) => sum + item.price, 0);
  }, [selectedAddonDetails]);

  const addonsSummaryText =
    addonsStatus === "selected" && selectedAddonDetails.length > 0
      ? `Selected: ${selectedAddonDetails.map((item) => item.title).join(", ")}`
      : addonsStatus === "skipped"
      ? "Add-ons skipped"
      : "No add-on selected";

  useEffect(() => {
    const selectedTitles = ADDON_OPTIONS.filter((item) =>
      selectedItems.includes(item.key)
    ).map((item) => item.title);

    const nextPrice = ADDON_OPTIONS.filter((item) =>
      selectedItems.includes(item.key)
    ).reduce((sum, item) => sum + item.price, 0);

    onChange?.({
      addonsStatus,
      addonsLabel:
        addonsStatus === "skipped"
          ? "Add-ons skipped"
          : selectedTitles.length > 0
          ? selectedTitles.join(", ")
          : "No add-on selected",
      addonsPrice: addonsStatus === "selected" ? nextPrice : 0,
      selectedItems,
    });
  }, [addonsStatus, selectedItems, onChange]);

  const toggleItem = (itemKey: string) => {
    const updated = selectedItems.includes(itemKey)
      ? selectedItems.filter((x) => x !== itemKey)
      : [...selectedItems, itemKey];

    const nextStatus = updated.length > 0 ? "selected" : "pending";

    setSelectedItems(updated);
    setAddonsStatus(nextStatus);
  };

  const handleSkip = () => {
    setSelectedItems([]);
    setAddonsStatus("skipped");
  };

  return (
    <section className="overflow-hidden rounded-xl border border-[#d9e2ec] bg-white">
      <div
        className="flex min-h-[58px] cursor-pointer items-center justify-between gap-3 border-b border-[#d9e2ec] bg-[#fffdf4] px-3 md:gap-4 md:px-5"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <div className="flex items-center gap-3">
          <span
            className={`inline-flex h-[18px] w-[18px] items-center justify-center rounded-full text-[12px] font-extrabold text-white ${
              isEnabled ? "bg-[#22c55e]" : "bg-[#d9534f]"
            }`}
          >
            {isEnabled ? "✓" : "!"}
          </span>

          <h3 className="text-[17px] font-extrabold text-[#1f2937] md:text-[18px]">
            Add-ons
          </h3>
        </div>

        <span
          className={`text-[18px] font-bold text-[#55a8d8] transition ${
            isOpen ? "rotate-0" : "-rotate-90"
          }`}
        >
          ˅
        </span>
      </div>

      {isOpen && (
        <div className="border-t border-[#e5e7eb] bg-white p-3 md:p-5">
          {!isEnabled ? (
            <div className="rounded-lg border border-[#f3d2d0] bg-[#fff7f7] p-3 md:p-5">
              <div className="text-[17px] font-extrabold text-[#111827] md:text-[18px]">
                Add-ons locked
              </div>
              <div className="mt-2 text-[13px] leading-6 text-[#6b7280] md:text-[14px]">
                Please complete Cab section first to continue with add-ons.
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-[#d9e2ec] bg-[#f8fbff] p-3 md:p-5">
              <div className="text-[17px] font-extrabold text-[#111827] md:text-[18px]">
                Add more comfort
              </div>

              <div className="mt-2 text-[13px] leading-6 text-[#4b5563] md:text-[14px]">
                {addonsSummaryText}
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {ADDON_OPTIONS.map((item) => (
                  <AddonCard
                    key={item.key}
                    title={item.title}
                    subtitle={item.subtitle}
                    price={item.price}
                    checked={selectedItems.includes(item.key)}
                    onToggle={() => toggleItem(item.key)}
                  />
                ))}
              </div>

              <div className="mt-5 flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center md:justify-between">
                <div className="text-[15px] font-extrabold text-[#111827] md:text-[16px]">
                  Add-ons Total: ₹{addonsTotal.toLocaleString("en-IN")}
                </div>

                <button
                  type="button"
                  onClick={handleSkip}
                  className={`h-[42px] w-full rounded-lg px-4 font-bold transition md:w-auto ${
                    addonsStatus === "skipped"
                      ? "border-2 border-[#38bdf8] bg-[#e0f2fe] text-[#0369a1]"
                      : "border border-[#d1d5db] bg-white text-[#111827]"
                  }`}
                >
                  {addonsStatus === "skipped"
                    ? "Add-ons Skipped ✓"
                    : "Skip Add-ons"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function AddonCard({
  title,
  subtitle,
  price,
  checked,
  onToggle,
}: {
  title: string;
  subtitle: string;
  price: number;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className={`min-h-[140px] rounded-lg p-3 md:p-4 ${
        checked
          ? "border-2 border-[#38bdf8] bg-[#eef8ff]"
          : "border border-[#d9e2ec] bg-white"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[16px] font-extrabold text-[#111827] md:text-[17px]">
            {title}
          </div>
          <div className="mt-2 text-[13px] leading-6 text-[#4b5563] md:text-[14px]">
            {subtitle}
          </div>
          <div className="mt-3 text-[16px] font-extrabold text-[#111827]">
            ₹{price.toLocaleString("en-IN")}
          </div>
        </div>

        <input type="checkbox" checked={checked} onChange={onToggle} />
      </div>
    </div>
  );
}
