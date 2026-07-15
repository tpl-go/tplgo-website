"use client";

import { useEffect, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { SlidersHorizontal, X } from "lucide-react";

interface Props {
  selectedFilters: string[];
  setSelectedFilters: Dispatch<SetStateAction<string[]>>;

  // ✅ Countries -> Continents
  continents: string[];
  activeContinent: string;
  setActiveContinent: (continent: string) => void;
  activeCountry?: string;
  setActiveCountry?: (country: string) => void;
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
  activeThemeId?: string;
  setActiveThemeId?: (themeId: string) => void;
  setResetFilters?: Dispatch<SetStateAction<boolean>>;
  onClearAll?: () => void;

  // ✅ Themes -> SubThemes (dynamic by selected theme)
  subThemes: string[];
  activeSubTheme: string;
  setActiveSubTheme: (sub: string) => void;

  resetFilters: boolean;
}

export default function ThemeFilters({
  selectedFilters,
  setSelectedFilters,
  continents,
  activeContinent,
  setActiveContinent,
  subThemes,
  activeSubTheme,
  setActiveSubTheme,
  resetFilters,
}: Props) {
  const [openSection, setOpenSection] = useState({
    duration: true,
    flights: true,
    budget: true,
    hotel: true,
    continents: true,
    bnpl: true,
    subThemes: true,
    packageType: true,
    premium: true,
  });
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const toggleSection = (section: keyof typeof openSection) => {
    setOpenSection((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const updateFilter = (label: string, active: boolean) => {
    if (active) {
      if (!selectedFilters.includes(label)) {
        setSelectedFilters([...selectedFilters, label]);
      }
    } else {
      setSelectedFilters(selectedFilters.filter((f) => f !== label));
    }
  };

  /* Duration */
  const [duration, setDuration] = useState(15);

  /* Flights */
  const [flightFilter, setFlightFilter] = useState({
    withFlight: false,
    withoutFlight: false,
  });

  /* Budget */
  const [budgetFilter, setBudgetFilter] = useState<string | null>(null);

  /* Hotel */
  const [hotelFilter, setHotelFilter] = useState<string | null>(null);

  /* BNPL + Premium (controlled so chip cross sync works) */
  const [bnplChecked, setBnplChecked] = useState(false);
  const [premiumChecked, setPremiumChecked] = useState(false);

  /* Continents (replaces Countries) */
  const [searchContinent, setSearchContinent] = useState("");
  const [showAllContinents, setShowAllContinents] = useState(false);




  const toggleContinent = (continent: string) => {
  setSelectedFilters((prev) => {
    if (prev.includes(continent)) {
      return prev.filter((f) => f !== continent);
    }
    return [...prev, continent];
  });
};




  const filteredContinents = continents.filter((c) =>
    c.toLowerCase().includes(searchContinent.toLowerCase())
  );

  const visibleContinents = showAllContinents
    ? filteredContinents
    : filteredContinents.slice(0, 4);

  /* SubThemes (replaces Themes) */
  const [selectedSubThemes, setSelectedSubThemes] = useState<string[]>([]);
  const [showAllSubThemes, setShowAllSubThemes] = useState(false);

  const toggleSubTheme = (sub: string) => {
    let updated: string[];

    if (selectedSubThemes.includes(sub)) {
      updated = selectedSubThemes.filter((t) => t !== sub);
    } else {
      // ✅ multi-select support (same as themes in continent)
      updated = [...selectedSubThemes, sub];
    }

    setSelectedSubThemes(updated);

    // remove any previous subTheme filters from selectedFilters and add updated
    setSelectedFilters([
      ...selectedFilters.filter((f) => !subThemes.includes(f)),
      ...updated,
    ]);

    // optional: keep one "active" subtheme too (single highlight)
    if (!updated.includes(activeSubTheme)) {
      setActiveSubTheme(updated[updated.length - 1] || "");
    }
  };

  const visibleSubThemes = showAllSubThemes ? subThemes : subThemes.slice(0, 4);

  /* ✅ RESET TRIGGER */
  useEffect(() => {
    if (resetFilters) {
      setDuration(15);
      setFlightFilter({ withFlight: false, withoutFlight: false });
      setBudgetFilter(null);
      setHotelFilter(null);

      setSearchContinent("");
      setShowAllContinents(false);

      setSelectedSubThemes([]);
      setShowAllSubThemes(false);

      setBnplChecked(false);
      setPremiumChecked(false);
      setIsMobileFiltersOpen(false);
    }
  }, [resetFilters]);

  /* ✅ MAIN FIX: chip cross -> selectedFilters update -> UI states sync */
  useEffect(() => {
    // Duration sync
    const dur = selectedFilters.find((f) => f.startsWith("Duration "));
    if (dur) {
      const match = dur.match(/Duration\s+(\d+)N/);
      if (match?.[1]) setDuration(Number(match[1]));
    } else {
      setDuration(15);
    }

    // Flights sync
    setFlightFilter({
      withFlight: selectedFilters.includes("With Flight"),
      withoutFlight: selectedFilters.includes("Without Flight"),
    });

    // Budget sync
    const budgetMap: Record<string, string> = {
      "< ₹25,000": "under25",
      "₹25,000 - ₹35,000": "25to35",
      "₹35,000 - ₹45,000": "35to45",
      "> ₹45,000": "above45",
    };
    const activeBudgetLabel = Object.keys(budgetMap).find((lbl) =>
      selectedFilters.includes(lbl)
    );
    setBudgetFilter(activeBudgetLabel ? budgetMap[activeBudgetLabel] : null);

    // Hotel sync
    const hotelMap: Record<string, string> = {
      "<3★": "below3",
      "3★": "3star",
      "4★": "4star",
      "5★": "5star",
    };
    const activeHotelLabel = Object.keys(hotelMap).find((lbl) =>
      selectedFilters.includes(lbl)
    );
    setHotelFilter(activeHotelLabel ? hotelMap[activeHotelLabel] : null);

    // BNPL + Premium sync
    setBnplChecked(selectedFilters.includes("Book @ ₹2,000"));
    setPremiumChecked(selectedFilters.includes("Premium Packages"));

    // SubThemes sync
    setSelectedSubThemes(subThemes.filter((t) => selectedFilters.includes(t)));

    // Continents sync (single select)
    const selectedContinentFromFilters = continents.find((c) =>
      selectedFilters.includes(c)
    );
    // NOTE: activeContinent ko yaha forcefully set/clear nahi kar rahe
    // kyunki page/grid already manage karega routing/state, but filter UI sync rahega.
    // Agar chaho to yaha setActiveContinent bhi kar sakte ho.
    // (Abhi same approach as your continent filter.)
    if (!selectedContinentFromFilters) {
      // nothing
    }

    // Active subtheme sync (optional highlight)
    const firstSub = subThemes.find((s) => selectedFilters.includes(s)) || "";
    if (!firstSub) {
      // keep as is
    } else if (activeSubTheme && selectedFilters.includes(activeSubTheme)) {
      // ok
    } else {
      setActiveSubTheme(firstSub);
    }
  }, [selectedFilters, continents, subThemes, activeSubTheme, setActiveSubTheme]);

  return (
    <div className="w-full lg:sticky lg:top-32">
      <button
        type="button"
        onClick={() => setIsMobileFiltersOpen(true)}
        className="lg:hidden mb-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-orange-200 bg-white px-4 text-sm font-semibold text-orange-600 shadow-sm"
      >
        <SlidersHorizontal className="h-4 w-4" />
        Filters
        {selectedFilters.length > 0 && (
          <span className="rounded-full bg-orange-500 px-2 py-0.5 text-xs text-white">
            {selectedFilters.length}
          </span>
        )}
      </button>

      {isMobileFiltersOpen && (
        <button
          type="button"
          aria-label="Close filters"
          className="fixed inset-0 z-40 bg-black/45 lg:hidden"
          onClick={() => setIsMobileFiltersOpen(false)}
        />
      )}

      <div
        className={`bg-white border shadow-sm ${
          isMobileFiltersOpen
            ? "fixed inset-x-0 bottom-0 z-50 max-h-[86vh] overflow-y-auto rounded-t-3xl p-4"
            : "hidden"
        } lg:block lg:static lg:max-h-none lg:overflow-visible lg:rounded-xl lg:p-6`}
      >
        <div className="mb-4 flex items-center justify-between border-b pb-3 lg:hidden">
          <div>
            <p className="text-base font-semibold text-black">Filters</p>
            <p className="text-xs text-gray-500">
              Refine packages without leaving results
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsMobileFiltersOpen(false)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-black"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <h3 className="hidden lg:block text-lg font-semibold text-black mb-6">Filters</h3>

        {/* Continents */}
        <div className="border-b pb-5 mb-5 text-black">
          <button
            onClick={() => toggleSection("continents")}
            className="flex justify-between w-full font-semibold text-black"
          >
            Continents
            <span>{openSection.continents ? "▲" : "▼"}</span>
          </button>

          {openSection.continents && (
            <div className="mt-4">
              <input
                type="text"
                placeholder="Search Continent"
                value={searchContinent}
                onChange={(e) => setSearchContinent(e.target.value)}
                className="w-full border rounded-md px-3 py-2 text-sm mb-3 text-black"
              />

              <div className="space-y-2">
                {visibleContinents.map((c) => (
                  <label key={c} className="flex items-center text-black">
                    <input
                      type="checkbox"
                      checked={selectedFilters.includes(c)}
                      onChange={() => toggleContinent(c)}
                      className="mr-2"
                    />
                    {c}
                  </label>
                ))}
              </div>

              {filteredContinents.length > 4 && (
                <button
                  onClick={() => setShowAllContinents(!showAllContinents)}
                  className="text-orange-500 text-sm mt-2"
                >
                  {showAllContinents ? "See Less" : "See All"}
                </button>
              )}
            </div>
          )}
        </div>

        {/* SubThemes */}
        <div className="border-b pb-5 mb-5">
          <button
            onClick={() => toggleSection("subThemes")}
            className="flex justify-between w-full font-semibold text-black"
          >
            Sub Themes
            <span>{openSection.subThemes ? "▲" : "▼"}</span>
          </button>

          {openSection.subThemes && (
            <div className="mt-3 space-y-2">
              {visibleSubThemes.map((sub) => (
                <label key={sub} className="flex items-center text-black">
                  <input
                    type="checkbox"
                    checked={selectedSubThemes.includes(sub)}
                    onChange={() => toggleSubTheme(sub)}
                    className="mr-2"
                  />
                  {sub}
                </label>
              ))}

              {subThemes.length > 4 && (
                <button
                  onClick={() => setShowAllSubThemes(!showAllSubThemes)}
                  className="text-blue-500 text-sm"
                >
                  {showAllSubThemes ? "Show Less" : "Show More"}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Duration */}
        <div className="border-b pb-5 mb-5">
          <button
            onClick={() => toggleSection("duration")}
            className="flex justify-between w-full font-semibold text-black"
          >
            Duration (in Nights)
            <span>{openSection.duration ? "▲" : "▼"}</span>
          </button>

          {openSection.duration && (
            <div className="mt-4">
              <input
                type="range"
                min="1"
                max="15"
                value={duration}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setDuration(val);
                  updateFilter(`Duration ${val}N`, true);
                }}
                className="w-full"
              />

              <div className="flex justify-between text-sm mt-2 text-black">
                <span>1N</span>
                <span>{duration === 15 ? "15N+" : `${duration}N`}</span>
              </div>
            </div>
          )}
        </div>

        {/* Flights */}
        <div className="border-b pb-5 mb-5">
          <button
            onClick={() => toggleSection("flights")}
            className="flex justify-between w-full font-semibold text-black"
          >
            Flights
            <span>{openSection.flights ? "▲" : "▼"}</span>
          </button>

          {openSection.flights && (
            <div className="grid grid-cols-2 gap-3 mt-4 lg:flex">
              <button
                onClick={() => {
                  const newState = !flightFilter.withFlight;
                  setFlightFilter({ ...flightFilter, withFlight: newState });
                  updateFilter("With Flight", newState);
                }}
                className={`border px-3 py-2 rounded-md text-xs sm:text-sm lg:text-sm ${
                  flightFilter.withFlight
                    ? "bg-orange-500 text-white border-orange-500"
                    : "text-black"
                }`}
              >
                With Flight (120)
              </button>

              <button
                onClick={() => {
                  const newState = !flightFilter.withoutFlight;
                  setFlightFilter({ ...flightFilter, withoutFlight: newState });
                  updateFilter("Without Flight", newState);
                }}
                className={`border px-3 py-2 rounded-md text-xs sm:text-sm lg:text-sm ${
                  flightFilter.withoutFlight
                    ? "bg-orange-500 text-white border-orange-500"
                    : "text-black"
                }`}
              >
                Without Flight (90)
              </button>
            </div>
          )}
        </div>

        {/* Budget */}
        <div className="border-b pb-5 mb-5">
          <button
            onClick={() => toggleSection("budget")}
            className="flex justify-between w-full font-semibold text-black"
          >
            Budget (per person)
            <span>{openSection.budget ? "▲" : "▼"}</span>
          </button>

          {openSection.budget && (
            <div className="mt-4 space-y-3 text-sm text-black">
              {[
                { key: "under25", label: "< ₹25,000" },
                { key: "25to35", label: "₹25,000 - ₹35,000" },
                { key: "35to45", label: "₹35,000 - ₹45,000" },
                { key: "above45", label: "> ₹45,000" },
              ].map((item) => (
                <label key={item.key} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={budgetFilter === item.key}
                    onChange={() => {
                      const newVal = budgetFilter === item.key ? null : item.key;
                      setBudgetFilter(newVal);
                      updateFilter(item.label, newVal !== null);
                    }}
                    className="mr-2"
                  />
                  {item.label}
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Hotel */}
        <div className="border-b pb-5 mb-5">
          <button
            onClick={() => toggleSection("hotel")}
            className="flex justify-between w-full font-semibold text-black"
          >
            Hotel Category
            <span>{openSection.hotel ? "▲" : "▼"}</span>
          </button>

          {openSection.hotel && (
            <div className="grid grid-cols-4 gap-2 mt-4">
              {[
                { name: "below3", label: "<3★" },
                { name: "3star", label: "3★" },
                { name: "4star", label: "4★" },
                { name: "5star", label: "5★" },
              ].map((hotel) => (
                <button
                  key={hotel.name}
                  onClick={() => {
                    const newVal =
                      hotelFilter === hotel.name ? null : hotel.name;
                    setHotelFilter(newVal);
                    updateFilter(hotel.label, newVal !== null);
                  }}
                  className={`border rounded-md text-sm py-3 ${
                    hotelFilter === hotel.name
                      ? "bg-orange-500 text-white border-orange-500"
                      : "text-black"
                  }`}
                >
                  {hotel.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Buy Now */}
        <div className="border-b pb-5 mb-5">
          <button
            onClick={() => toggleSection("bnpl")}
            className="flex justify-between w-full font-semibold text-black"
          >
            Buy Now Pay Later
            <span>{openSection.bnpl ? "▲" : "▼"}</span>
          </button>

          {openSection.bnpl && (
            <label className="flex items-center mt-3 text-black">
              <input
                type="checkbox"
                checked={bnplChecked}
                onChange={(e) => {
                  setBnplChecked(e.target.checked);
                  updateFilter("Book @ ₹2,000", e.target.checked);
                }}
                className="mr-2"
              />
              Book @ ₹2,000
            </label>
          )}
        </div>

        {/* Package Type */}
        <div className="border-b pb-5 mb-5">
          <button
            onClick={() => toggleSection("packageType")}
            className="flex justify-between w-full font-semibold text-black"
          >
            Package Type
            <span>{openSection.packageType ? "▲" : "▼"}</span>
          </button>

          {openSection.packageType && (
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-black lg:flex lg:gap-6">
              <button
                onClick={() => {
                  const value = "Customizable";
                  if (selectedFilters.includes(value)) {
                    setSelectedFilters(selectedFilters.filter((f) => f !== value));
                  } else {
                    setSelectedFilters([...selectedFilters, value]);
                  }
                }}
                className={`rounded-lg border px-3 py-2 transition lg:rounded-none lg:border-0 lg:p-0 ${
                  selectedFilters.includes("Customizable")
                    ? "border-orange-500 bg-orange-50 text-orange-600 font-semibold lg:bg-transparent lg:text-orange-500"
                    : "border-gray-200 text-black"
                }`}
              >
                Customizable (119)
              </button>

              <button
                onClick={() => {
                  const value = "Group Package";
                  if (selectedFilters.includes(value)) {
                    setSelectedFilters(selectedFilters.filter((f) => f !== value));
                  } else {
                    setSelectedFilters([...selectedFilters, value]);
                  }
                }}
                className={`rounded-lg border px-3 py-2 transition lg:rounded-none lg:border-0 lg:p-0 ${
                  selectedFilters.includes("Group Package")
                    ? "border-orange-500 bg-orange-50 text-orange-600 font-semibold lg:bg-transparent lg:text-orange-500"
                    : "border-gray-200 text-black"
                }`}
              >
                Group Package (9)
              </button>
            </div>
          )}
        </div>

        {/* Premium */}
        <div>
          <button
            onClick={() => toggleSection("premium")}
            className="flex justify-between w-full font-semibold text-black"
          >
            Premium Packages
            <span>{openSection.premium ? "▲" : "▼"}</span>
          </button>

          {openSection.premium && (
            <label className="flex items-center mt-3 text-black">
              <input
                type="checkbox"
                checked={premiumChecked}
                onChange={(e) => {
                  setPremiumChecked(e.target.checked);
                  updateFilter("Premium Packages", e.target.checked);
                }}
                className="mr-2"
              />
              Premium Packages
            </label>
          )}
        </div>

        <div className="mt-5 flex gap-3 border-t pt-3 lg:hidden">
          <button
            type="button"
            onClick={() => setSelectedFilters([])}
            className="h-11 flex-1 rounded-xl border border-gray-300 text-sm font-semibold text-black"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={() => setIsMobileFiltersOpen(false)}
            className="h-11 flex-1 rounded-xl bg-orange-500 text-sm font-semibold text-white"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
