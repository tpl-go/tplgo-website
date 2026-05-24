"use client";

import { useState } from "react";

const mainTabs = [
  { key: "all", label: "All" },
  { key: "flight", label: "Flights" },
  { key: "hotel", label: "Hotels" },
  { key: "holiday", label: "Holidays" },
];

const moreTabs = [
  { key: "homestay", label: "Homestay" },
  { key: "bus", label: "Bus" },
  { key: "train", label: "Train" },
  { key: "cab", label: "Cab" },
  { key: "cruise", label: "Cruise" },
  { key: "visa", label: "Visa" },
  { key: "insurance", label: "Insurance" },
  { key: "membership", label: "Privilege" },
];

const allTabs = [...mainTabs, ...moreTabs];

export default function OfferTabs({ activeTab, setActiveTab }: any) {
  const [showMore, setShowMore] = useState(false);

  const selectedMore = moreTabs.find((item) => item.key === activeTab);
  const selectedTab = allTabs.find((item) => item.key === activeTab);

  const renderButton = (tab: any) => {
    const active = activeTab === tab.key;

    return (
      <button
        key={tab.key}
        type="button"
        onClick={() => {
          setActiveTab(tab.key);
          setShowMore(false);
        }}
        className={`relative overflow-hidden rounded-2xl border px-5 py-2.5 text-sm font-bold transition-all duration-300 ${
          active
            ? "border-transparent bg-gradient-to-r from-[#ff5f2e] via-[#ff7a18] to-[#ff9f43] text-white shadow-[0_8px_24px_rgba(255,120,40,0.35)]"
            : "border-white/20 bg-white/85 text-[#111827] backdrop-blur-xl hover:bg-white hover:shadow-md"
        }`}
      >
        {tab.label}
      </button>
    );
  };

  return (
    <>
      {/* Mobile Dropdown */}
      <div className="block w-full md:hidden">
        <label className="mb-1 block text-xs font-extrabold uppercase tracking-wide text-white/85">
          Offer Category
        </label>

        <select
          value={activeTab}
          onChange={(e) => {
            setActiveTab(e.target.value);
            setShowMore(false);
          }}
          className="w-full rounded-2xl border border-white/40 bg-white/95 px-4 py-3 text-sm font-extrabold text-slate-900 shadow-md outline-none backdrop-blur-xl focus:border-orange-300"
        >
          {allTabs.map((tab) => (
            <option key={tab.key} value={tab.key}>
              {tab.label}
            </option>
          ))}
        </select>

        <p className="mt-2 text-xs font-bold text-white/75">
          Showing {selectedTab?.label || "All"} offers
        </p>
      </div>

      {/* Desktop Tabs - untouched layout */}
      <div className="relative z-30 hidden items-center gap-3 md:flex">
        {mainTabs.map(renderButton)}

        <div className="relative">
          <button
            type="button"
            onClick={() => setShowMore((prev) => !prev)}
            className={`rounded-2xl border px-5 py-2.5 text-sm font-bold backdrop-blur-xl transition-all duration-300 ${
              selectedMore
                ? "border-transparent bg-gradient-to-r from-[#ff5f2e] via-[#ff7a18] to-[#ff9f43] text-white shadow-[0_8px_24px_rgba(255,120,40,0.35)]"
                : "border-white/20 bg-white/85 text-[#111827] hover:bg-white hover:shadow-md"
            }`}
          >
            {selectedMore ? selectedMore.label : "More"} ▾
          </button>

          {showMore && (
            <div className="absolute left-0 top-[52px] z-50 w-[230px] rounded-2xl border border-white/20 bg-white/95 p-2 shadow-[0_18px_50px_rgba(15,23,42,0.20)] backdrop-blur-2xl">
              <div className="grid gap-2">{moreTabs.map(renderButton)}</div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}