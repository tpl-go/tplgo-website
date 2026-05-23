"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { CruiseFilterSectionConfig } from "@/app/lib/cruise/cruiseResultTypes";

type Props = {
  section: CruiseFilterSectionConfig;
  selectedValues: string[];
  onToggleValue: (value: string, checked: boolean) => void;
};

export default function CruiseFilterSection({
  section,
  selectedValues,
  onToggleValue,
}: Props) {
  const [open, setOpen] = useState(false);

  const hasOptions = useMemo(
    () => Array.isArray(section.options) && section.options.length > 0,
    [section.options]
  );

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_4px_14px_rgba(15,23,42,0.05)]">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between px-4 py-3 text-left transition hover:bg-slate-50"
      >
        <span className="text-[15px] font-semibold text-slate-800">
          {section.label}
        </span>

        <span className="text-slate-500">
          {open ? <ChevronUp size={17} /> : <ChevronDown size={17} />}
        </span>
      </button>

      {open ? (
        <div className="border-t border-slate-200 px-4 py-3">
          <div className="max-h-[260px] space-y-2 overflow-y-auto pr-1">
            {hasOptions ? (
              section.options.map((option) => {
                const checked = selectedValues.includes(option.id);

                return (
                  <label
                    key={option.id}
                    className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border px-3 py-2.5 transition ${
                      checked
                        ? "border-sky-200 bg-sky-50"
                        : "border-slate-100 bg-slate-50 hover:border-slate-200"
                    }`}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) =>
                          onToggleValue(option.id, e.target.checked)
                        }
                        className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                      />

                      <span className="truncate text-[13px] font-medium text-slate-800">
                        {option.label}
                      </span>
                    </div>

                    {typeof option.count === "number" ? (
                      <span className="shrink-0 rounded-full bg-sky-100 px-2 py-0.5 text-[11px] font-semibold text-sky-700">
                        {option.count}
                      </span>
                    ) : null}
                  </label>
                );
              })
            ) : (
              <div className="rounded-xl bg-slate-50 px-3 py-3 text-[12px] text-slate-500">
                No options available
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}