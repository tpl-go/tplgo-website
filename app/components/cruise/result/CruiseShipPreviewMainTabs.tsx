"use client";

import type { CruisePreviewMainTab } from "./CruiseShipPreviewModal";

type Props = {
  activeTab: CruisePreviewMainTab;
  onChange: (tab: CruisePreviewMainTab) => void;
};

export default function CruiseShipPreviewMainTabs({
  activeTab,
  onChange,
}: Props) {
  const tabs: { key: CruisePreviewMainTab; label: string }[] = [
    { key: "itinerary", label: "Itinerary" },
    { key: "otherDates", label: "Other Sailing Dates" },
    { key: "cruiseInfo", label: "Cruise Info" },
    { key: "deckPlan", label: "Deck Plan" }, // 🔥 NEW TAB
    { key: "policies", label: "Policies" },
  ];

  return (
    <div className="grid grid-cols-5 border-b border-slate-200 bg-slate-100">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => onChange(tab.key)}
          className={`px-4 py-3 text-sm font-semibold transition ${
            activeTab === tab.key
              ? "border-b-2 border-sky-500 bg-white text-slate-900"
              : "text-slate-700"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}