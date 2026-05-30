"use client";

import {
  Camera,
  FileText,
  LayoutGrid,
  Shield,
  Ship,
} from "lucide-react";

type InfoTab = "shipInfo" | "gallery" | "deckPlans" | "staterooms" | "shipFacts";

type Props = {
  activeTab: InfoTab;
  onChange: (tab: InfoTab) => void;
};

export default function CruiseShipPreviewInfoTabs({
  activeTab,
  onChange,
}: Props) {
  const tabs = [
    { key: "shipInfo", label: "Ship Info", icon: <Ship size={14} /> },
    { key: "gallery", label: "Gallery", icon: <Camera size={14} /> },
    { key: "deckPlans", label: "Deck Plans", icon: <LayoutGrid size={14} /> },
    { key: "staterooms", label: "Cabin", icon: <FileText size={14} /> },
    { key: "shipFacts", label: "Ship Facts", icon: <Shield size={14} /> },
  ] as const;

  return (
    <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => onChange(tab.key)}
          className={`flex min-h-[44px] items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-[12px] font-bold transition md:min-h-0 md:px-4 md:py-3 md:text-sm md:font-medium ${
            activeTab === tab.key
              ? "border-sky-500 bg-sky-50 text-sky-700"
              : "border-slate-200 bg-white text-slate-700"
          }`}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </div>
  );
}
