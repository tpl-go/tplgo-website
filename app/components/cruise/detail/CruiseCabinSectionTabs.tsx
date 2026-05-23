"use client";

import type { CruiseCabinSectionKey } from "@/app/lib/cruise/cruiseDetailTypes";

type Props = {
  activeSection: CruiseCabinSectionKey;
  onChange: (section: CruiseCabinSectionKey) => void;
  dayCountLabel?: string;
};

const sections: { key: CruiseCabinSectionKey; label: string }[] = [
  { key: "cabins", label: "CABINS" },
  { key: "sailing", label: "SAILING" },
  { key: "dining", label: "DINING" },
  { key: "entertainment", label: "ENTERTAINMENT" },
  { key: "policies", label: "POLICIES" },
];

export default function CruiseCabinSectionTabs({
  activeSection,
  onChange,
  dayCountLabel = "8 DAY PLAN",
}: Props) {
  return (
    <div className="rounded-xl border bg-[#EAF3FF] px-4 py-3">
      <div className="flex items-center justify-between gap-4">
        <span className="rounded-full border border-blue-300 bg-white px-4 py-2 text-sm font-semibold text-blue-800">
          {dayCountLabel}
        </span>

        <div className="hidden items-center gap-8 text-sm font-semibold text-gray-700 md:flex">
          {sections.map((section) => (
            <button
              key={section.key}
              type="button"
              onClick={() => onChange(section.key)}
              className={`transition ${
                activeSection === section.key
                  ? "text-blue-700"
                  : "text-gray-700 hover:text-gray-900"
              }`}
            >
              {section.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}