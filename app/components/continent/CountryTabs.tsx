"use client";

import { useState } from "react";
import { ChevronDown, MapPin, X } from "lucide-react";

interface Props {
  slug: string;
  countries: string[];
  activeCountry: string;
  setActiveCountry: (country: string) => void;
}

export default function CountryTabs({ slug, countries, activeCountry, setActiveCountry }: Props) {
  const [isCountrySheetOpen, setIsCountrySheetOpen] = useState(false);

  const formattedSlug =
  slug && slug.length > 0
    ? decodeURIComponent(slug)
        .split(" ")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ")
    : "Asia";

  const selectedLabel = activeCountry || "All countries";

  const handleCountrySelect = (country: string) => {
    setActiveCountry(country);
    setIsCountrySheetOpen(false);
  };

  return (
    <div className="w-full bg-white border rounded-2xl lg:rounded-none shadow-sm p-3 sm:p-4 lg:p-6 overflow-hidden">

      {/* Mobile Selector */}
      <div className="md:hidden">
        <button
          type="button"
          onClick={() => setIsCountrySheetOpen(true)}
          className="flex w-full items-center justify-between rounded-2xl border border-gray-200 bg-white px-3.5 py-3 text-left shadow-sm"
        >
          <span className="flex min-w-0 items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <MapPin className="h-4 w-4" />
            </span>
            <span className="min-w-0">
              <span className="block text-[11px] font-bold uppercase tracking-wide text-gray-500">
                Explore countries
              </span>
              <span className="block truncate text-sm font-bold text-black">
                {selectedLabel}
              </span>
            </span>
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 text-gray-500" />
        </button>

        {activeCountry && (
          <div className="mt-2 flex min-w-0 items-center justify-between rounded-full bg-orange-50 px-3 py-2 text-xs font-bold text-orange-700">
            <span className="truncate">{activeCountry}</span>
            <button
              type="button"
              onClick={() => setActiveCountry("")}
              className="ml-2 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-orange-600"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}

        {isCountrySheetOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <button
              type="button"
              aria-label="Close country selector"
              className="absolute inset-0 bg-black/45"
              onClick={() => setIsCountrySheetOpen(false)}
            />
            <div className="absolute inset-x-0 bottom-0 max-h-[78vh] overflow-hidden rounded-t-3xl bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b px-4 py-3">
                <div>
                  <p className="text-base font-bold text-black">
                    Explore countries
                  </p>
                  <p className="text-xs text-gray-500">
                    Top destinations in {formattedSlug}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCountrySheetOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-black"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="max-h-[calc(78vh-64px)] overflow-y-auto px-4 py-4">
                <button
                  type="button"
                  onClick={() => handleCountrySelect("")}
                  className={`mb-2 flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left ${
                    !activeCountry
                      ? "border-orange-500 bg-orange-50 text-orange-600"
                      : "border-gray-200 bg-white text-black"
                  }`}
                >
                  <span className="text-sm font-bold">All countries</span>
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      !activeCountry ? "bg-orange-500" : "bg-gray-300"
                    }`}
                  />
                </button>

                <div className="grid grid-cols-1 gap-2">
                  {countries.map((country) => {
                    const isActive = activeCountry === country;

                    return (
                      <button
                        key={country}
                        type="button"
                        onClick={() => handleCountrySelect(isActive ? "" : country)}
                        className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${
                          isActive
                            ? "border-orange-500 bg-orange-50 text-orange-600"
                            : "border-gray-200 bg-white text-black"
                        }`}
                      >
                        <span className="text-sm font-bold">{country}</span>
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

      {/* Desktop Title */}

      <h2 className="hidden md:block text-base sm:text-lg lg:text-2xl font-semibold mb-3 lg:mb-6 text-black">
        Top Destinations in {formattedSlug}
      </h2>

      {/* Desktop Tabs Wrapper */}
      <div className="hidden md:flex gap-2 lg:gap-3 overflow-x-auto overscroll-x-contain pb-2 -mx-3 px-3 sm:-mx-4 sm:px-4 lg:mx-0 lg:px-0">

        {countries.map((country) => {

          const isActive = activeCountry === country;

          return (
            <button
              key={country}
              onClick={() => setActiveCountry(isActive ? "" : country)}
              className={`
                whitespace-nowrap
                px-3
                lg:px-4
                py-2
                rounded-md
                border
                text-xs
                sm:text-sm
                font-medium
                transition
                ${isActive
                  ? "bg-orange-500 text-white border-orange-500"
                  : "bg-white text-black border-gray-300 hover:border-orange-400"
                }
              `}
            >
              {country}
            </button>
          );
        })}

      </div>

    </div>
  );
}
