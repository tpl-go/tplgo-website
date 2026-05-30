"use client";

import type { CruiseCabinSectionKey } from "@/app/lib/cruise/cruiseDetailTypes";

type Props = {
  activeSection: CruiseCabinSectionKey;
  onChange: (section: CruiseCabinSectionKey) => void;
  dayCountLabel?: string;
};

const sections: {
  key: CruiseCabinSectionKey;
  label: string;
  mobileLabel?: string;
}[] = [
  { key: "cabins", label: "CABINS" },
  { key: "sailing", label: "SAILING", mobileLabel: "DAY WISE PLAN" },
  { key: "dining", label: "DINING" },
  { key: "entertainment", label: "ENTERTAINMENT", mobileLabel: "SHIP AREAS" },
  { key: "policies", label: "POLICIES" },
];

export default function CruiseCabinSectionTabs({
  activeSection,
  onChange,
  dayCountLabel = "8 DAY PLAN",
}: Props) {
  const activeLabel =
    sections.find((section) => section.key === activeSection)?.label ||
    "CABINS";

  return (
    <div className="rounded-xl border bg-[#EAF3FF] px-3 py-3 lg:px-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-4">
        <span className="w-fit rounded-full border border-blue-300 bg-white px-4 py-2 text-xs font-extrabold text-blue-800 md:text-sm md:font-semibold">
          {dayCountLabel}
        </span>

        <div className="md:hidden">
          <label className="mb-1 block text-[10px] font-black uppercase tracking-wide text-blue-800">
            Explore
          </label>
          <select
            value={activeSection}
            onChange={(event) =>
              onChange(event.target.value as CruiseCabinSectionKey)
            }
            className="h-11 w-full rounded-2xl border border-blue-200 bg-white px-3 text-[13px] font-extrabold text-slate-900 outline-none"
            aria-label={`Current cruise section ${activeLabel}`}
          >
            {sections.map((section) => (
              <option key={section.key} value={section.key}>
                {section.mobileLabel || section.label}
              </option>
            ))}
          </select>
        </div>

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
