"use client";

import { useState } from "react";
import { ChevronDown, CheckCircle2, Circle } from "lucide-react";
import type {
  TiyaPackingItem,
  TiyaPackingSection,
} from "@/app/lib/ecosystem/planner/plannerPackingEngine";

type TiyaPackingChecklistProps = {
  sections: TiyaPackingSection[];
};

const priorityTone: Record<TiyaPackingItem["priority"], string> = {
  Critical: "border-rose-300/20 bg-rose-400/10 text-rose-100",
  Recommended: "border-orange-300/20 bg-orange-400/10 text-orange-100",
  Optional: "border-cyan-300/20 bg-cyan-400/10 text-cyan-100",
};

export default function TiyaPackingChecklist({
  sections,
}: TiyaPackingChecklistProps) {
  const safeSections = Array.isArray(sections) ? sections : [];
  const [openSectionId, setOpenSectionId] = useState(safeSections[0]?.id ?? "");
  const [checkedItemIds, setCheckedItemIds] = useState<string[]>([]);

  function toggleChecked(itemId: string) {
    setCheckedItemIds((currentIds) =>
      currentIds.includes(itemId)
        ? currentIds.filter((id) => id !== itemId)
        : [...currentIds, itemId]
    );
  }

  return (
    <div className="grid gap-3">
      {safeSections.map((section) => {
        const safeItems = Array.isArray(section.items) ? section.items : [];
        const isOpen = openSectionId === section.id;
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
              onClick={() => setOpenSectionId(isOpen ? "" : section.id)}
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
              <ChevronDown
                size={18}
                className={`shrink-0 text-white/60 transition ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
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
                      onClick={() => toggleChecked(item.id)}
                      className="grid gap-2 rounded-2xl border border-white/10 bg-white/10 p-3 text-left transition hover:bg-white/15 sm:grid-cols-[1fr_auto] sm:items-start"
                    >
                      <div className="flex min-w-0 gap-2">
                        <Icon className="mt-0.5 h-4 w-4 shrink-0 text-cyan-100" />
                        <div className="min-w-0">
                          <p className="text-sm font-black text-white">
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
