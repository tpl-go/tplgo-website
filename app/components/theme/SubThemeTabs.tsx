"use client";

import { useState } from "react";
import { ChevronDown, Layers3, X } from "lucide-react";

interface Props {
  slug?: string;
  themeName: string;
  subThemes: (string | { id: string; label: string })[];
  activeSubTheme: string;
  setActiveSubTheme: (subTheme: string) => void;
}

export default function SubThemeTabs({
  themeName,
  subThemes,
  activeSubTheme,
  setActiveSubTheme,
}: Props) {
  const [isSubThemeSheetOpen, setIsSubThemeSheetOpen] = useState(false);

  const selectedLabel = activeSubTheme || "All subthemes";

  const handleSubThemeSelect = (subTheme: string) => {
    setActiveSubTheme(subTheme);
    setIsSubThemeSheetOpen(false);
  };

  return (
    <div className="bg-white border rounded-2xl lg:rounded-none shadow-sm p-3 sm:p-4 lg:p-6 overflow-hidden">

      {/* Mobile Selector */}
      <div className="md:hidden">
        <button
          type="button"
          onClick={() => setIsSubThemeSheetOpen(true)}
          className="flex w-full items-center justify-between rounded-2xl border border-gray-200 bg-white px-3.5 py-3 text-left shadow-sm"
        >
          <span className="flex min-w-0 items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <Layers3 className="h-4 w-4" />
            </span>
            <span className="min-w-0">
              <span className="block text-[11px] font-bold uppercase tracking-wide text-gray-500">
                Explore subthemes
              </span>
              <span className="block truncate text-sm font-bold text-black">
                {selectedLabel}
              </span>
            </span>
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 text-gray-500" />
        </button>

        {activeSubTheme && (
          <div className="mt-2 flex min-w-0 items-center justify-between rounded-full bg-orange-50 px-3 py-2 text-xs font-bold text-orange-700">
            <span className="truncate">{activeSubTheme}</span>
            <button
              type="button"
              onClick={() => setActiveSubTheme("")}
              className="ml-2 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-orange-600"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}

        {isSubThemeSheetOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <button
              type="button"
              aria-label="Close subtheme selector"
              className="absolute inset-0 bg-black/45"
              onClick={() => setIsSubThemeSheetOpen(false)}
            />
            <div className="absolute inset-x-0 bottom-0 max-h-[78vh] overflow-hidden rounded-t-3xl bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b px-4 py-3">
                <div>
                  <p className="text-base font-bold text-black">
                    Explore subthemes
                  </p>
                  <p className="text-xs text-gray-500">
                    More in {themeName}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSubThemeSheetOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-black"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="max-h-[calc(78vh-64px)] overflow-y-auto px-4 py-4">
                <button
                  type="button"
                  onClick={() => handleSubThemeSelect("")}
                  className={`mb-2 flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left ${
                    !activeSubTheme
                      ? "border-orange-500 bg-orange-50 text-orange-600"
                      : "border-gray-200 bg-white text-black"
                  }`}
                >
                  <span className="text-sm font-bold">All subthemes</span>
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      !activeSubTheme ? "bg-orange-500" : "bg-gray-300"
                    }`}
                  />
                </button>

                <div className="grid grid-cols-1 gap-2">
                  {subThemes.map((item) => {
                    const subTheme = typeof item === "string" ? item : item.label;
                    const isActive = activeSubTheme === subTheme;

                    return (
                      <button
                        key={typeof item === "string" ? item : item.id}
                        type="button"
                        onClick={() => handleSubThemeSelect(isActive ? "" : subTheme)}
                        className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${
                          isActive
                            ? "border-orange-500 bg-orange-50 text-orange-600"
                            : "border-gray-200 bg-white text-black"
                        }`}
                      >
                        <span className="text-sm font-bold">{subTheme}</span>
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

      {/* Title */}
      <h2 className="hidden md:block text-2xl font-semibold mb-6 text-black">
        Explore more in {themeName}
      </h2>

      {/* Tabs Wrapper */}
      <div className="hidden md:flex flex-nowrap gap-2 pb-2 overflow-hidden">

        {subThemes.map((item) => {

const subTheme = typeof item === "string" ? item : item.label;

          const isActive = activeSubTheme === subTheme;

          return (
            <button
              key={typeof item === "string" ? item : item.id}
              onClick={() => setActiveSubTheme(isActive ? "" : subTheme)}
              className={`
                whitespace-normal break-words text-center leading-tight
                w-[180px] h-[75px]
                px-3
                py-4
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
              {subTheme}
            </button>
          );
        })}

      </div>

    </div>
  );
}
