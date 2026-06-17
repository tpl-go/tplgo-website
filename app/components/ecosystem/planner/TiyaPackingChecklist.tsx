"use client";

import { useState } from "react";
import { CheckCircle2, Circle } from "lucide-react";
import type {
  TiyaPackingItem,
  TiyaPackingSection,
} from "@/app/lib/ecosystem/planner/plannerPackingEngine";

type TiyaPackingChecklistProps = {
  sections: TiyaPackingSection[];
  checkedItemIds: string[];
  onToggleItem: (item: TiyaPackingItem, section: TiyaPackingSection) => void;
};

const priorityTone: Record<TiyaPackingItem["priority"], string> = {
  Critical: "border-rose-300/20 bg-rose-400/10 text-rose-100",
  Recommended: "border-orange-300/20 bg-orange-400/10 text-orange-100",
  Optional: "border-cyan-300/20 bg-cyan-400/10 text-cyan-100",
};

export default function TiyaPackingChecklist({
  sections,
  checkedItemIds,
  onToggleItem,
}: TiyaPackingChecklistProps) {
  const safeSections = Array.isArray(sections) ? sections : [];
  const [openSectionIds, setOpenSectionIds] = useState<string[]>(
    safeSections[0]?.id ? [safeSections[0].id] : []
  );

  return (
    <div className="grid gap-3">
      {safeSections.map((section) => {
        const safeItems = Array.isArray(section.items) ? section.items : [];
        const isOpen = openSectionIds.includes(section.id);
        const checkedCount = safeItems.filter((item) =>
          checkedItemIds.includes(item.id)
        ).length;

        return (
          <article
            key={section.id}
            className="rounded-3xl border border-white/10 bg-white/[0.08] p-3 transition hover:bg-white/10 sm:p-4"
          >
            <button
              type="button"
              onClick={() =>
                setOpenSectionIds((current) =>
                  current.includes(section.id)
                    ? current.filter((id) => id !== section.id)
                    : [...current, section.id]
                )
              }
              className="flex w-full items-center justify-between gap-3 text-left"
            >
              <div className="min-w-0">
                <h3 className="truncate text-base font-black text-white">
                  {section.category}
                </h3>
                <p className="mt-1 text-xs font-bold text-white/50">
                  {checkedCount}/{safeItems.length} locally checked
                </p>
              </div>
              <span className="shrink-0 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] font-black text-white/70">
                {isOpen ? "Hide" : "Open"}
              </span>
            </button>

            {isOpen ? (
              <div className="mt-4 grid gap-2">
                {safeItems.map((item) => {
                  const checked = checkedItemIds.includes(item.id);
                  const Icon = checked ? CheckCircle2 : Circle;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onToggleItem(item, section)}
                      className={`grid gap-2 rounded-2xl border p-3 text-left transition hover:bg-white/15 sm:grid-cols-[1fr_auto] sm:items-start ${
                        checked
                          ? "border-emerald-300/30 bg-emerald-400/10"
                          : "border-white/10 bg-white/10"
                      }`}
                    >
                      <div className="flex min-w-0 gap-2">
                        <Icon
                          className={`mt-0.5 h-4 w-4 shrink-0 ${
                            checked ? "text-emerald-200" : "text-cyan-100"
                          }`}
                        />
                        <div className="min-w-0">
                          <p
                            className={`text-sm font-black ${
                              checked ? "text-white/55 line-through" : "text-white"
                            }`}
                          >
                            {item.label}
                          </p>
                          <p className="mt-1 text-xs font-semibold leading-5 text-white/60">
                            {item.reason}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`w-fit rounded-full border px-2.5 py-1 text-[11px] font-black ${priorityTone[item.priority]}`}
                      >
                        {item.priority}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}
