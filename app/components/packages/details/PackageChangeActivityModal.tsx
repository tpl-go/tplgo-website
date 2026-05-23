"use client";

import { useEffect, useMemo, useState } from "react";
import type { PackageActivityOption } from "@/app/lib/packages/packageSelectionTypes";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  options: PackageActivityOption[];
  activityCount?: number;
  selectedActivities?: PackageActivityOption[];
  onSelectActivity: (activity: PackageActivityOption, index: number) => void;

  city?: string;
  travelDate?: string;
};

function formatFareDiff(value: number) {
  if (value === 0) return "Included";
  if (value > 0) return `+₹${value.toLocaleString("en-IN")}`;
  return `-₹${Math.abs(value).toLocaleString("en-IN")}`;
}

function formatDate(value?: string) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;

  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function addDays(value?: string, days = 0) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

export default function PackageChangeActivityModal({
  isOpen,
  onClose,
  options,
  activityCount = 1,
  selectedActivities = [],
  onSelectActivity,
  city,
  travelDate,
}: Props) {
  const [activeActivityIndex, setActiveActivityIndex] = useState(0);

  const activityPlans = useMemo(
    () => Array.from({ length: Math.max(activityCount, 1) }, (_, index) => index),
    [activityCount]
  );

  const defaultIncludedActivity = useMemo(
    () => options.find((activity) => activity.included) || null,
    [options]
  );

  useEffect(() => {
    if (!isOpen) return;
    if (!defaultIncludedActivity) return;

    activityPlans.forEach((index) => {
      const alreadySelected = selectedActivities?.[index];
      if (!alreadySelected) {
        onSelectActivity(defaultIncludedActivity, index);
      }
    });
  }, [
    isOpen,
    defaultIncludedActivity,
    activityPlans,
    onSelectActivity,
    selectedActivities,
  ]);

  if (!isOpen) return null;

  const currentSelectedActivity =
    selectedActivities?.[activeActivityIndex] || defaultIncludedActivity || null;

  const currentSelectedId = currentSelectedActivity?.id || null;
  const activeDate = addDays(travelDate, activeActivityIndex);
  const activeSelectedActivity = currentSelectedActivity;

  const isAnyActivitySelected =
    selectedActivities?.some(Boolean) || !!defaultIncludedActivity;

  const handleClose = () => {
    if (!isAnyActivitySelected && defaultIncludedActivity) {
      const confirmClose = window.confirm(
        "No activity selected.\nDefault included activity will be applied.\n\nDo you want to continue?"
      );
      if (!confirmClose) return;
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[240] overflow-y-auto bg-black/45 backdrop-blur-[2px]">
      <div className="flex min-h-full items-start justify-center px-4 py-4">
        <div className="my-2 w-full max-w-[920px] overflow-hidden rounded-[28px] border border-[#dbe4f0] bg-white shadow-[0_20px_60px_rgba(15,23,42,0.22)]">
          {/* HEADER */}
          <div className="border-b border-[#e5edf6] bg-white px-6 py-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-[24px] font-black leading-none text-[#111827]">
                  Change Activity
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-full border border-[#d8e4f4] bg-[#f8fbff] px-3 py-1.5 text-[12px] font-bold text-[#1f2937]">
                    {activityCount} Activit{activityCount > 1 ? "ies" : "y"}
                  </span>

                  {activeDate ? (
                    <span className="rounded-full border border-[#d8e4f4] bg-[#f8fbff] px-3 py-1.5 text-[12px] font-bold text-[#1f2937]">
                      {formatDate(activeDate)}
                    </span>
                  ) : null}

                  {city ? (
                    <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-[12px] font-bold text-blue-800">
                      {city}
                    </span>
                  ) : null}
                </div>

                <div className="mt-3 text-sm font-medium text-[#4b5563]">
                  Activities are linked with your trip date and destination. If you customize an
                  experience, the selection here updates automatically.
                </div>
              </div>

              <button
                onClick={handleClose}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-[#d5dce5] bg-white text-[20px] font-bold text-[#374151] transition hover:bg-slate-50"
              >
                ✕
              </button>
            </div>
          </div>

          {/* SWITCHER */}
          <div className="border-b border-[#e5edf6] bg-[#f8fbff] px-6 py-3">
            <div className="flex flex-wrap gap-3">
              {activityPlans.map((activityIndex) => {
                const selectedActivity =
                  selectedActivities?.[activityIndex] || defaultIncludedActivity || null;
                const isActive = activeActivityIndex === activityIndex;
                const hasSelection = !!selectedActivity;
                const activityDate = addDays(travelDate, activityIndex);

                return (
                  <button
                    key={activityIndex}
                    type="button"
                    onClick={() => setActiveActivityIndex(activityIndex)}
                    className={`min-w-[165px] rounded-xl border px-3 py-2 text-left transition ${
                      isActive
                        ? "border-blue-500 bg-blue-50 shadow-sm"
                        : hasSelection
                        ? "border-green-400 bg-green-50"
                        : "border-[#d6e4f5] bg-white hover:shadow-sm"
                    }`}
                  >
                    <div className="text-[11px] font-bold text-[#111827]">
                      Activity {activityIndex + 1}
                    </div>

                    <div className="mt-0.5 line-clamp-1 text-[10px] font-semibold text-[#374151]">
                      {city || "Destination"}
                    </div>

                    <div className="mt-0.5 line-clamp-1 text-[10px] font-medium text-[#6b7280]">
                      {selectedActivity ? selectedActivity.title : "Choose activity"}
                    </div>

                    {activityDate ? (
                      <div className="mt-0.5 text-[10px] font-medium text-[#6b7280]">
                        {formatDate(activityDate)}
                      </div>
                    ) : null}

                    {hasSelection ? (
                      <div className="mt-1 text-[10px] font-bold text-green-700">
                        ✓ Selected
                      </div>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>

          {/* BODY */}
          <div className="max-h-[46vh] overflow-y-auto bg-[#f8fafc] px-6 py-4">
            <div className="overflow-hidden rounded-2xl border border-[#dbe7f3] bg-white">
              <div className="border-b border-[#e7eef7] bg-[#f8fbff] px-4 py-3">
                <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="text-[15px] font-extrabold text-[#111827]">
                      Activity {activeActivityIndex + 1}
                      {city ? ` • ${city}` : ""}
                    </div>

                    <div className="mt-1 text-[12px] font-medium text-[#4b5563]">
                      {formatDate(activeDate)}
                    </div>
                  </div>

                  {activeSelectedActivity ? (
                    <div className="text-[12px] font-semibold text-blue-700">
                      Selected: {activeSelectedActivity.title}
                    </div>
                  ) : (
                    <div className="text-[12px] font-semibold text-[#4b5563]">
                      Choose preferred activity
                    </div>
                  )}
                </div>
              </div>

              <div className="p-3">
                <div className="grid gap-3">
                  {options.map((activity) => {
                    const isSelected = currentSelectedId === activity.id;

                    return (
                      <button
                        key={`${activeActivityIndex}-${activity.id}`}
                        onClick={() => onSelectActivity(activity, activeActivityIndex)}
                        className={`w-full rounded-xl border bg-white p-3 text-left transition ${
                          isSelected
                            ? "border-blue-500 ring-2 ring-blue-100 shadow-sm"
                            : "border-slate-200 hover:shadow-sm"
                        }`}
                      >
                        <div className="flex flex-col justify-between gap-4 lg:flex-row">
                          <div className="flex-1">
                            <div className="flex flex-wrap gap-2">
                              {activity.category ? (
                                <span className="rounded-full bg-slate-900 px-3 py-1 text-[10px] font-bold text-white">
                                  {activity.category}
                                </span>
                              ) : (
                                <span className="rounded-full bg-slate-900 px-3 py-1 text-[10px] font-bold text-white">
                                  Activity
                                </span>
                              )}

                              {activity.included ? (
                                <span className="rounded-full border border-green-200 bg-green-50 px-3 py-1 text-[10px] font-bold text-green-700">
                                  Included
                                </span>
                              ) : (
                                <span className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-[10px] font-bold text-orange-700">
                                  Upgrade
                                </span>
                              )}
                            </div>

                            <div className="mt-2 text-[14px] font-semibold text-[#111827]">
                              {activity.title}
                            </div>

                            {activity.description ? (
                              <div className="mt-1 text-[12px] font-medium text-[#4b5563]">
                                {activity.description}
                              </div>
                            ) : null}

                            <div className="mt-2 text-[11px] font-medium text-[#6b7280]">
                              Linked to: {city || "Destination"} • {formatDate(activeDate)}
                            </div>
                          </div>

                          <div className="flex flex-col items-start gap-2 lg:items-end">
                            <div
                              className={`rounded-full px-3 py-1.5 text-[12px] font-black ${
                                activity.fareDiff === 0
                                  ? "border border-green-200 bg-green-50 text-green-700"
                                  : activity.fareDiff > 0
                                  ? "border border-orange-200 bg-orange-50 text-orange-700"
                                  : "border border-blue-200 bg-blue-50 text-blue-700"
                              }`}
                            >
                              {formatFareDiff(activity.fareDiff)}
                            </div>

                            <div
                              className={`rounded-xl px-4 py-2 text-[12px] font-bold ${
                                isSelected
                                  ? "bg-blue-600 text-white"
                                  : "border border-slate-300 bg-white text-[#111827]"
                              }`}
                            >
                              {isSelected ? "Selected" : "Select Activity"}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <div className="flex items-center justify-between border-t border-[#e5edf6] bg-white px-6 py-4">
            <div className="text-xs font-medium text-[#4b5563]">
              Activity pricing will be revalidated on booking.
            </div>

            <button
              onClick={handleClose}
              className="rounded-xl border px-5 py-2.5 text-sm font-bold text-[#111827] transition hover:bg-slate-50"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}