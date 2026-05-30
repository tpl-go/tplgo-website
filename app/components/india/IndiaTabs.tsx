"use client";

import { useState } from "react";
import { ChevronDown, MapPin, X } from "lucide-react";

interface Props {
  states: string[];
  activeState: string;
  setActiveState: (state: string) => void;
}

export default function IndiaTabs({
  states,
  activeState,
  setActiveState,
}: Props) {
  const [isStateSheetOpen, setIsStateSheetOpen] = useState(false);
  const selectedLabel = activeState || "All India";

  const handleStateSelect = (state: string) => {
    setActiveState(state);
    setIsStateSheetOpen(false);
  };

  return (
    <div className="w-full bg-white border rounded-2xl shadow-sm p-3 sm:p-4 lg:p-6 overflow-hidden md:overflow-visible">
      <div className="md:hidden">
        <button
          type="button"
          onClick={() => setIsStateSheetOpen(true)}
          className="flex w-full items-center justify-between rounded-2xl border border-orange-100 bg-gradient-to-r from-orange-50 to-white px-3.5 py-3 text-left shadow-sm"
        >
          <span className="flex min-w-0 items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-500 text-white">
              <MapPin className="h-4 w-4" />
            </span>
            <span className="min-w-0">
              <span className="block text-[11px] font-bold uppercase tracking-wide text-orange-600">
                State
              </span>
              <span className="block truncate text-sm font-bold text-black">
                {selectedLabel}
              </span>
            </span>
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 text-gray-500" />
        </button>

        {activeState && (
          <div className="mt-2 flex min-w-0 items-center justify-between rounded-full bg-orange-50 px-3 py-2 text-xs font-bold text-orange-700">
            <span className="truncate">{activeState}</span>
            <button
              type="button"
              onClick={() => setActiveState("")}
              className="ml-2 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-orange-600"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}

        {isStateSheetOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <button
              type="button"
              aria-label="Close state selector"
              className="absolute inset-0 bg-black/45"
              onClick={() => setIsStateSheetOpen(false)}
            />
            <div className="absolute inset-x-0 bottom-0 max-h-[78vh] overflow-hidden rounded-t-3xl bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b px-4 py-3">
                <div>
                  <p className="text-base font-bold text-black">
                    Choose state
                  </p>
                  <p className="text-xs text-gray-500">
                    Switch India package results instantly
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsStateSheetOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-black"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="max-h-[calc(78vh-64px)] overflow-y-auto px-4 py-4">
                <button
                  type="button"
                  onClick={() => handleStateSelect("")}
                  className={`mb-2 flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left ${
                    !activeState
                      ? "border-orange-500 bg-orange-50 text-orange-600"
                      : "border-gray-200 bg-white text-black"
                  }`}
                >
                  <span className="text-sm font-bold">All India</span>
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      !activeState ? "bg-orange-500" : "bg-gray-300"
                    }`}
                  />
                </button>

                <div className="grid grid-cols-1 gap-2">
                  {states.map((state) => {
                    const isActive = activeState === state;

                    return (
                      <button
                        key={state}
                        type="button"
                        onClick={() => handleStateSelect(isActive ? "" : state)}
                        className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${
                          isActive
                            ? "border-orange-500 bg-orange-50 text-orange-600"
                            : "border-gray-200 bg-white text-black"
                        }`}
                      >
                        <span className="text-sm font-bold">{state}</span>
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
        Top Destinations in India
      </h2>

      <div className="hidden md:flex gap-3 overflow-x-auto pb-2">
        {states.map((state) => {
          const isActive = activeState === state;

          return (
            <button
              key={state}
              onClick={() => setActiveState(isActive ? "" : state)}
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
              {state}
            </button>
          );
        })}
      </div>
    </div>
  );
}
