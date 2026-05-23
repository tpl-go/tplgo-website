"use client";

import type { TrainSearchMode } from "./trainTypes";

type Props = {
  activeMode: TrainSearchMode;
  onChange: (mode: TrainSearchMode) => void;
};

const tabs: { key: TrainSearchMode; label: string }[] = [
  { key: "book", label: "Book Train Tickets" },
  { key: "pnr", label: "Check PNR Status" },
  { key: "live", label: "Live Train Status" },
];

export default function TrainModeTabs({
  activeMode,
  onChange,
}: Props) {
  return (
    <div className="mb-5 flex flex-wrap items-center gap-3">
      {tabs.map((tab) => {
        const active = activeMode === tab.key;

        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            className={`rounded-full border px-5 py-2 text-[13px] font-bold transition-all duration-200 ${
              active
                ? "border-orange-500 bg-orange-500 text-white shadow-md"
                : "border-black bg-white/60 text-black hover:bg-white"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}