"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BriefcaseBusiness,
  Download,
  FileCheck2,
  RotateCcw,
  Save,
  Sparkles,
} from "lucide-react";
import { generatePlannerPackingSections } from "@/app/lib/ecosystem/planner/plannerPackingEngine";
import type {
  TiyaPackingItem,
  TiyaPackingSection,
} from "@/app/lib/ecosystem/planner/plannerPackingEngine";
import {
  generatePlannerPreparationNotes,
  generatePlannerRiskPreparation,
} from "@/app/lib/ecosystem/planner/plannerPreparationEngine";
import { generatePlannerReadiness } from "@/app/lib/ecosystem/planner/plannerReadinessEngine";
import {
  MY_TRIPS_ACTIVE_TRIP_ID_KEY,
  loadMyTripById,
  saveMyTrip,
} from "@/app/lib/ecosystem/planner/myTripsStorage";
import type {
  TiyaRouteOption,
  TiyaTripIntent,
} from "@/app/lib/ecosystem/planner/plannerTypes";
import TiyaPackingChecklist from "./TiyaPackingChecklist";
import TiyaReadinessMeter from "./TiyaReadinessMeter";
import TiyaTravelPreparation from "./TiyaTravelPreparation";

type TiyaPackingEngineProps = {
  intent: TiyaTripIntent;
  selectedRoute?: TiyaRouteOption;
  isGenerating?: boolean;
  onChecklistUpdate?: (message: string) => void;
};

function checklistKey(section: TiyaPackingSection) {
  return section.id || section.category.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function activeTripId() {
  if (typeof window === "undefined") return "";
  return window.sessionStorage.getItem(MY_TRIPS_ACTIVE_TRIP_ID_KEY) || "";
}

function flattenChecklist(checklist: Record<string, string[]> | undefined) {
  return Object.values(checklist || {}).flat();
}

export default function TiyaPackingEngine({
  intent,
  selectedRoute,
  isGenerating = false,
  onChecklistUpdate,
}: TiyaPackingEngineProps) {
  const [checklist, setChecklist] = useState<Record<string, string[]>>({});
  const [statusMessage, setStatusMessage] = useState("");
  const sections = useMemo(
    () => generatePlannerPackingSections({ intent, selectedRoute }),
    [intent, selectedRoute]
  );
  const notes = useMemo(
    () => generatePlannerPreparationNotes({ intent, selectedRoute }),
    [intent, selectedRoute]
  );
  const riskItems = useMemo(
    () => generatePlannerRiskPreparation({ intent }),
    [intent]
  );
  const readiness = useMemo(
    () => generatePlannerReadiness({ intent, sections, notes }),
    [intent, notes, sections]
  );
  const safeSections = Array.isArray(sections) ? sections : [];
  const allItems = safeSections.flatMap((section) =>
    (Array.isArray(section.items) ? section.items : []).map((item) => ({
      item,
      section,
    }))
  );
  const checkedItemIds = flattenChecklist(checklist);
  const totalItems = safeSections.reduce(
    (sum, section) =>
      sum + (Array.isArray(section.items) ? section.items.length : 0),
    0
  );
  const checkedCount = allItems.filter(({ item }) =>
    checkedItemIds.includes(item.id)
  ).length;
  const dynamicReadiness = totalItems
    ? Math.round((checkedCount / totalItems) * 100)
    : 0;
  const criticalItems = allItems.filter(
    ({ item }) => item.priority === "Critical"
  );
  const checkedCriticalItems = criticalItems.filter(({ item }) =>
    checkedItemIds.includes(item.id)
  ).length;
  const liveReadiness = {
    ...readiness,
    packingReadiness: dynamicReadiness,
    missingEssentials: totalItems - checkedCount,
    criticalItems: criticalItems.length - checkedCriticalItems,
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const activeTrip = loadMyTripById(activeTripId());
      setChecklist(activeTrip?.checklist || {});
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  function persistChecklist(nextChecklist: Record<string, string[]>) {
    const trip = loadMyTripById(activeTripId());
    if (!trip) {
      setStatusMessage("Checklist updated locally. Save a trip first to sync with My Trips.");
      return false;
    }

    saveMyTrip({
      ...trip,
      checklist: nextChecklist,
      updatedAt: new Date().toISOString(),
    });
    setStatusMessage("Checklist saved to My Trips.");
    return true;
  }

  function updateChecklist(nextChecklist: Record<string, string[]>) {
    setChecklist(nextChecklist);
    persistChecklist(nextChecklist);
  }

  function handleToggleItem(
    item: TiyaPackingItem,
    section: TiyaPackingSection
  ) {
    const key = checklistKey(section);
    const sectionItems = checklist[key] || [];
    const checked = sectionItems.includes(item.id);
    const nextSectionItems = checked
      ? sectionItems.filter((id) => id !== item.id)
      : [...sectionItems, item.id];
    const nextChecklist = {
      ...checklist,
      [key]: nextSectionItems,
    };

    updateChecklist(nextChecklist);

    if (!checked) {
      onChecklistUpdate?.(`Checklist item completed: ${item.label}`);
    }
  }

  function handleMarkAllComplete() {
    const nextChecklist = safeSections.reduce<Record<string, string[]>>(
      (next, section) => ({
        ...next,
        [checklistKey(section)]: (section.items || []).map((item) => item.id),
      }),
      {}
    );
    updateChecklist(nextChecklist);
    onChecklistUpdate?.("Checklist marked all complete");
  }

  function handleResetChecklist() {
    updateChecklist({});
    onChecklistUpdate?.("Checklist reset");
  }

  function handleSaveChecklist() {
    persistChecklist(checklist);
  }

  function handleDownloadChecklist() {
    const lines = [
      "TPL Smart Planner Packing Checklist",
      `${intent.fromCity} to ${intent.toCity}`,
      `${intent.startDate} to ${intent.endDate}`,
      `Readiness: ${dynamicReadiness}% (${checkedCount}/${totalItems} complete)`,
      "",
      ...safeSections.flatMap((section) => [
        section.category,
        ...(section.items || []).map((item) =>
          `${checkedItemIds.includes(item.id) ? "[x]" : "[ ]"} ${item.label} (${item.priority}) - ${item.reason}`
        ),
        "",
      ]),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `tpl-packing-checklist-${intent.toCity || "trip"}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    setStatusMessage("Checklist downloaded.");
  }

  return (
    <section className="overflow-hidden rounded-3xl border border-white/80 bg-[#061839]/95 text-white shadow-[0_22px_80px_rgba(6,24,57,0.2)] backdrop-blur-xl">
      <div className="relative border-b border-white/10 p-4 sm:p-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_8%,rgba(14,165,233,0.22),transparent_28%),radial-gradient(circle_at_88%_8%,rgba(249,115,22,0.18),transparent_26%)]" />
        <div className="relative flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-cyan-100">
              <BriefcaseBusiness
                size={15}
                className={isGenerating ? "animate-pulse" : undefined}
              />
              Smart packing and preparation engine
            </div>
            <h2 className="mt-2 text-xl font-black text-white sm:text-2xl">
              Trip-ready preparation intelligence
            </h2>
            <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-white/70">
              Generates route, weather, traveller and transport-aware packing
              guidance without backend, live weather or permit APIs.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-center sm:grid-cols-3">
            <div className="rounded-2xl border border-orange-300/20 bg-orange-400/10 px-3 py-2">
              <p className="text-lg font-black text-orange-100">{totalItems}</p>
              <p className="text-[10px] font-black uppercase text-orange-100/70">
                Items
              </p>
            </div>
            <div className="rounded-2xl border border-cyan-300/20 bg-cyan-400/10 px-3 py-2">
              <p className="text-lg font-black text-cyan-100">
                {safeSections.length}
              </p>
              <p className="text-[10px] font-black uppercase text-cyan-100/70">
                Sections
              </p>
            </div>
            <div className="rounded-2xl border border-emerald-300/20 bg-emerald-400/10 px-3 py-2">
              <p className="text-lg font-black text-emerald-100">
                {dynamicReadiness}%
              </p>
              <p className="text-[10px] font-black uppercase text-emerald-100/70">
                Ready
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-3 p-3 sm:p-5 xl:grid-cols-[0.82fr_1.18fr]">
        <div className="grid gap-3">
          <TiyaReadinessMeter readiness={liveReadiness} />
          <div className="rounded-3xl border border-white/10 bg-white/[0.08] p-3 sm:p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
                  Trip checklist progress
                </p>
                <p className="mt-1 text-sm font-black text-white">
                  {checkedCount} / {totalItems} complete
                </p>
              </div>
              <span className="rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1 text-xs font-black text-emerald-100">
                Readiness {dynamicReadiness}%
              </span>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-emerald-300 to-orange-400"
                style={{ width: `${dynamicReadiness}%` }}
              />
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {[
                ["Mark All Complete", handleMarkAllComplete, FileCheck2],
                ["Reset Checklist", handleResetChecklist, RotateCcw],
                ["Download Checklist", handleDownloadChecklist, Download],
                ["Save to My Trips", handleSaveChecklist, Save],
              ].map(([label, action, Icon]) => {
                const ActionIcon = Icon as typeof FileCheck2;
                return (
                  <button
                    key={label as string}
                    type="button"
                    onClick={action as () => void}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/12 bg-white/10 px-3 text-xs font-black text-white transition hover:bg-white/15"
                  >
                    <ActionIcon size={14} />
                    {label as string}
                  </button>
                );
              })}
            </div>
            {statusMessage ? (
              <p className="mt-3 rounded-2xl border border-cyan-300/20 bg-cyan-400/10 p-3 text-xs font-black text-cyan-50">
                {statusMessage}
              </p>
            ) : null}
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/[0.08] p-3 sm:p-4">
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
              <FileCheck2 size={15} />
              Document and permit suggestions
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {[
                "Government ID",
                "Offline booking copies",
                selectedRoute?.riskLevel === "High" ? "Route backup contacts" : "Emergency contacts",
                intent.transportMode.includes("Car") || intent.transportMode === "Bike"
                  ? "Driving documents"
                  : "Transport tickets",
                intent.pets ? "Pet vaccination proof" : "Insurance copy",
                intent.travelStyle === "Spiritual" || intent.interests.includes("Temples")
                  ? "Permit or darshan copy"
                  : "Local entry checks",
              ].map((documentItem) => (
                <span
                  key={documentItem}
                  className="rounded-full border border-white/10 bg-white/10 px-3 py-2 text-xs font-black text-white"
                >
                  {documentItem}
                </span>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-orange-300/20 bg-orange-400/10 p-3 sm:p-4">
            <div className="flex items-start gap-2">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-orange-100" />
              <p className="text-xs font-semibold leading-5 text-orange-50/90">
                Preparation is simulated from destination type, date window,
                travellers, pace, route risk, transport mode and selected smart
                preferences.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-3">
          <TiyaPackingChecklist
            sections={safeSections}
            checkedItemIds={checkedItemIds}
            onToggleItem={handleToggleItem}
          />
          <TiyaTravelPreparation notes={notes} riskItems={riskItems} />
        </div>
      </div>
    </section>
  );
}
