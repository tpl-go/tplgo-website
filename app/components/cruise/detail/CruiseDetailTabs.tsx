"use client";

import type { CruiseMainTabKey } from "@/app/lib/cruise/cruiseDetailTypes";

type Props = {
  activeTab: CruiseMainTabKey;
  onChange: (tab: CruiseMainTabKey) => void;
};

const tabs: { key: CruiseMainTabKey; label: string }[] = [
  { key: "cabin", label: "Cabin" },
  { key: "cruiseInfo", label: "Cruise Info" },
  { key: "cruiseDeckPlan", label: "Cruise Deck Plan" },
  { key: "policy", label: "Policy" },
];

export default function CruiseDetailTabs({ activeTab, onChange }: Props) {
  return (
    <div className="bg-white">
      <div className="flex items-center gap-10">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            className={`border-b-2 text-lg font-semibold transition ${
              activeTab === tab.key
                ? "border-blue-700 text-blue-700"
                : "border-transparent text-gray-700 hover:text-gray-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}