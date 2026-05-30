"use client";

import { useState } from "react";
import { ChevronDown, UsersRound, X } from "lucide-react";

interface Props {
  tabs: string[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function GroupTabs({
  tabs,
  activeTab,
  setActiveTab,
}: Props) {
  const [isTabSheetOpen, setIsTabSheetOpen] = useState(false);
  const selectedLabel = activeTab || "All group tours";

  const handleTabSelect = (tab: string) => {
    setActiveTab(tab);
    setIsTabSheetOpen(false);
  };

  return (
    <div className="w-full bg-white border rounded-2xl shadow-sm p-3 sm:p-4 lg:p-6 overflow-hidden md:overflow-visible">
      <div className="md:hidden">
        <button
          type="button"
          onClick={() => setIsTabSheetOpen(true)}
          className="flex w-full items-center justify-between rounded-2xl border border-orange-100 bg-gradient-to-r from-orange-50 to-white px-3.5 py-3 text-left shadow-sm"
        >
          <span className="flex min-w-0 items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-500 text-white">
              <UsersRound className="h-4 w-4" />
            </span>
            <span className="min-w-0">
              <span className="block text-[11px] font-bold uppercase tracking-wide text-orange-600">
                Group category
              </span>
              <span className="block truncate text-sm font-bold text-black">
                {selectedLabel}
              </span>
            </span>
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 text-gray-500" />
        </button>

        {activeTab && (
          <div className="mt-2 flex min-w-0 items-center justify-between rounded-full bg-orange-50 px-3 py-2 text-xs font-bold text-orange-700">
            <span className="truncate">{activeTab}</span>
            <button
              type="button"
              onClick={() => setActiveTab("")}
              className="ml-2 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-orange-600"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}

        {isTabSheetOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <button
              type="button"
              aria-label="Close group category selector"
              className="absolute inset-0 bg-black/45"
              onClick={() => setIsTabSheetOpen(false)}
            />
            <div className="absolute inset-x-0 bottom-0 max-h-[78vh] overflow-hidden rounded-t-3xl bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b px-4 py-3">
                <div>
                  <p className="text-base font-bold text-black">
                    Choose group category
                  </p>
                  <p className="text-xs text-gray-500">
                    Switch group tour results instantly
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsTabSheetOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-black"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="max-h-[calc(78vh-64px)] overflow-y-auto px-4 py-4">
                <button
                  type="button"
                  onClick={() => handleTabSelect("")}
                  className={`mb-2 flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left ${
                    !activeTab
                      ? "border-orange-500 bg-orange-50 text-orange-600"
                      : "border-gray-200 bg-white text-black"
                  }`}
                >
                  <span className="text-sm font-bold">All group tours</span>
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      !activeTab ? "bg-orange-500" : "bg-gray-300"
                    }`}
                  />
                </button>

                <div className="grid grid-cols-1 gap-2">
                  {tabs.map((tab) => {
                    const isActive = activeTab === tab;

                    return (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => handleTabSelect(isActive ? "" : tab)}
                        className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${
                          isActive
                            ? "border-orange-500 bg-orange-50 text-orange-600"
                            : "border-gray-200 bg-white text-black"
                        }`}
                      >
                        <span className="text-sm font-bold">{tab}</span>
                        <span
                          className={`h-2.5 w-2.5 rounded-full ${
                            isActive ? "bg-orange-500" : "bg-gray-300"
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <h2 className="hidden md:block text-2xl font-semibold mb-6 text-black">
        Explore Group Tour Categories
      </h2>

      <div className="hidden md:flex gap-3 overflow-x-auto pb-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab;

          return (
            <button
              key={tab}
              onClick={() => setActiveTab(isActive ? "" : tab)}
              className={`
                whitespace-nowrap
                px-4
                py-2
                rounded-md
                border
                text-sm
                transition
                ${
                  isActive
                    ? "bg-orange-500 text-white border-orange-500"
                    : "bg-white text-black border-gray-300 hover:border-orange-400"
                }
              `}
            >
              {tab}
            </button>
          );
        })}
      </div>
    </div>
  );
}
