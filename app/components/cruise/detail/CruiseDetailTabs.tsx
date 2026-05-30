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
  const activeLabel =
    tabs.find((tab) => tab.key === activeTab)?.label || "Cabin";

  return (
    <div className="bg-white">
      <div className="md:hidden">
        <label className="mb-1 block text-[11px] font-black uppercase tracking-wide text-slate-500">
          View section
        </label>
        <select
          value={activeTab}
          onChange={(event) => onChange(event.target.value as CruiseMainTabKey)}
          className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 text-[14px] font-extrabold text-slate-900 outline-none"
          aria-label={`Current section ${activeLabel}`}
        >
          {tabs.map((tab) => (
            <option key={tab.key} value={tab.key}>
              {tab.label}
            </option>
          ))}
        </select>
      </div>

      <div className="hidden items-center gap-10 md:flex">
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
