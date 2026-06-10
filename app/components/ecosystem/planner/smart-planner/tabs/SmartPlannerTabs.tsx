"use client";

import {
  Brain,
  Car,
  IndianRupee,
  LayoutDashboard,
  MapPin,
  Route,
  Video,
  type LucideIcon,
} from "lucide-react";
import {
  smartPlannerPreviewTabs,
  type SmartPlannerPreviewTab,
} from "../data/routePreviewData";

const previewTabVisuals: Record<SmartPlannerPreviewTab, { Icon: LucideIcon }> = {
  Overview: { Icon: LayoutDashboard },
  Itinerary: { Icon: Route },
  Cost: { Icon: IndianRupee },
  "Travel Intelligence": { Icon: Brain },
  "Mobility Intelligence": { Icon: Car },
  "Local Life": { Icon: MapPin },
  "TPL Creators": { Icon: Video },
};

type SmartPlannerTabsProps = {
  activeTab: SmartPlannerPreviewTab;
  onTabChange: (tab: SmartPlannerPreviewTab) => void;
};

export default function SmartPlannerTabs({
  activeTab,
  onTabChange,
}: SmartPlannerTabsProps) {
  return (
    <div className="mt-3 min-w-0 rounded-[1.15rem] border border-white/70 bg-white/62 p-1 shadow-sm backdrop-blur-xl sm:mt-4 sm:rounded-[1.35rem] sm:p-1.5">
      <label className="block lg:hidden">
        <span className="sr-only">Select route detail tab</span>
        <select
          value={activeTab}
          onChange={(event) =>
            onTabChange(event.target.value as SmartPlannerPreviewTab)
          }
          className="min-h-12 w-full rounded-2xl border border-orange-200 bg-white px-4 py-3 text-sm font-black text-slate-950 shadow-sm outline-none focus:border-orange-400"
        >
          {smartPlannerPreviewTabs.map((tab) => (
            <option key={tab} value={tab}>
              {tab}
            </option>
          ))}
        </select>
      </label>

      <div className="hidden min-w-0 gap-1 lg:flex lg:overflow-visible lg:gap-1.5">
        {smartPlannerPreviewTabs.map((tab) => {
          const { Icon } = previewTabVisuals[tab];
          const isActive = activeTab === tab;
          const labelParts =
            tab === "Travel Intelligence"
              ? ["Travel", "Intelligence"]
              : tab === "Mobility Intelligence"
                ? ["Mobility", "Intelligence"]
                : tab === "TPL Creators"
                  ? ["TPL", "Creators"]
                  : [tab];

          return (
            <button
              key={tab}
              type="button"
              aria-pressed={isActive}
              onClick={() => onTabChange(tab)}
              className={`group inline-flex min-h-[56px] min-w-[104px] shrink-0 snap-start flex-col items-center justify-center gap-1 rounded-2xl border px-2.5 py-2 text-center text-[11px] font-black leading-tight transition duration-200 md:min-h-[60px] md:min-w-0 md:flex-1 md:shrink md:px-2 lg:text-[12px] xl:text-[13px] ${
                isActive
                  ? "scale-[1.02] border-orange-400 bg-gradient-to-r from-[#ff4d2e] via-[#ff6f1f] to-[#ff9d22] text-white shadow-[0_14px_34px_rgba(255,111,31,0.32)]"
                  : "border-slate-200/80 bg-white/58 text-slate-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.68)] hover:-translate-y-0.5 hover:border-orange-200 hover:bg-orange-50/85 hover:text-slate-950"
              }`}
            >
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition ${
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-slate-100 text-slate-500 group-hover:bg-white group-hover:text-orange-600"
                }`}
              >
                <Icon size={14} />
              </span>
              <span className="flex min-w-0 flex-col items-center justify-center whitespace-normal text-center">
                {labelParts.map((part) => (
                  <span key={`${tab}-${part}`} className="block">
                    {part}
                  </span>
                ))}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
