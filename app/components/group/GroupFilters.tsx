"use client";

import { useState, useEffect, useMemo } from "react";

interface Props {
  selectedFilters: string[];
  setSelectedFilters: (filters: string[]) => void;
  countries: string[];
  activeCountry: string;
  setActiveCountry: (country: string) => void;
  resetFilters: boolean;
}

export default function GroupFilters({
  selectedFilters,
  setSelectedFilters,
  countries,
  activeCountry,
  setActiveCountry,
  resetFilters,
}: Props) {
  const [openSection, setOpenSection] = useState({
    duration: true,
    flights: true,
    budget: true,
    hotel: true,
    countries: true,
    bnpl: true,
    themes: true,
    packageType: true,
    premium: true,
  });

  const [searchCountry, setSearchCountry] = useState("");
  const [showAllCountries, setShowAllCountries] = useState(false);
  const [showAllThemes, setShowAllThemes] = useState(false);

  const themes = [
    "Cultural",
    "Spiritual",
    "Women Special",
    "Trekking",
    "Family",
    "Senior Citizen",
    "Fixed Departure",
    "Weekend",
    "Adventure",
    "Wildlife",
    "Premium",
    "Leisure",
    "Honeymoon",
    "Nature",
    "Heritage",
  ];

  const toggleSection = (section: keyof typeof openSection) => {
    setOpenSection((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const replaceGroupedFilter = (
    nextFilters: string[],
    groupLabels: string[],
    valueToAdd?: string | null
  ) => {
    const cleaned = nextFilters.filter((f) => !groupLabels.includes(f));
    return valueToAdd ? [...cleaned, valueToAdd] : cleaned;
  };

  const updateSimpleFilter = (label: string, active: boolean) => {
    if (active) {
      if (!selectedFilters.includes(label)) {
        setSelectedFilters([...selectedFilters, label]);
      }
    } else {
      setSelectedFilters(selectedFilters.filter((f) => f !== label));
    }
  };

  const duration = useMemo(() => {
    const dur = selectedFilters.find((f) => f.startsWith("Duration "));
    if (!dur) return 15;

    const match = dur.match(/Duration\s+(\d+)N/);
    return match?.[1] ? Number(match[1]) : 15;
  }, [selectedFilters]);

  const flightFilter = useMemo(() => {
    return {
      withFlight: selectedFilters.includes("With Flight"),
      withoutFlight: selectedFilters.includes("Without Flight"),
    };
  }, [selectedFilters]);

  const budgetFilter = useMemo(() => {
    const budgetMap: Record<string, string> = {
      "< ₹25,000": "under25",
      "₹25,000 - ₹35,000": "25to35",
      "₹35,000 - ₹45,000": "35to45",
      "> ₹45,000": "above45",
    };

    const activeBudgetLabel = Object.keys(budgetMap).find((lbl) =>
      selectedFilters.includes(lbl)
    );

    return activeBudgetLabel ? budgetMap[activeBudgetLabel] : null;
  }, [selectedFilters]);

  const hotelFilter = useMemo(() => {
    const hotelMap: Record<string, string> = {
      "<3★": "below3",
      "3★": "3star",
      "4★": "4star",
      "5★": "5star",
    };

    const activeHotelLabel = Object.keys(hotelMap).find((lbl) =>
      selectedFilters.includes(lbl)
    );

    return activeHotelLabel ? hotelMap[activeHotelLabel] : null;
  }, [selectedFilters]);

  const bnplChecked = useMemo(() => {
    return selectedFilters.includes("Book @ ₹2,000");
  }, [selectedFilters]);

  const premiumChecked = useMemo(() => {
    return selectedFilters.includes("Premium Packages");
  }, [selectedFilters]);

  const selectedCountries = useMemo(() => {
    if (activeCountry) return [activeCountry];

    const selectedCountryFromFilters = countries.find((c) =>
      selectedFilters.includes(c)
    );

    return selectedCountryFromFilters ? [selectedCountryFromFilters] : [];
  }, [selectedFilters, countries, activeCountry]);

  const selectedThemes = useMemo(() => {
    return themes.filter((t) => selectedFilters.includes(t));
  }, [selectedFilters]);

  const filteredCountries = countries.filter((c) =>
    c.toLowerCase().includes(searchCountry.toLowerCase())
  );

  const visibleCountries = showAllCountries
    ? filteredCountries
    : filteredCountries.slice(0, 4);

  const visibleThemes = showAllThemes ? themes : themes.slice(0, 4);

  const toggleCountry = (country: string) => {
    if (activeCountry === country) {
      setActiveCountry("");
      setSelectedFilters(selectedFilters.filter((f) => !countries.includes(f)));
      return;
    }

    setActiveCountry(country);
    setSelectedFilters(
      selectedFilters.filter((f) => !countries.includes(f)).concat(country)
    );
  };

  const toggleTheme = (theme: string) => {
    let updated: string[];

    if (selectedThemes.includes(theme)) {
      updated = selectedThemes.filter((t) => t !== theme);
    } else {
      updated = [...selectedThemes, theme];
    }

    setSelectedFilters([
      ...selectedFilters.filter((f) => !themes.includes(f)),
      ...updated,
    ]);
  };

  useEffect(() => {
    if (resetFilters) {
      setSearchCountry("");
      setShowAllCountries(false);
      setShowAllThemes(false);
    }
  }, [resetFilters]);

  return (
    <div className="w-full sticky top-32">
      <div className="bg-white border rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-black mb-6">Filters</h3>

        {/* Countries */}
        <div className="border-b pb-5 mb-5 text-black">
          <button
            onClick={() => toggleSection("countries")}
            className="flex justify-between w-full font-semibold text-black"
          >
            Countries
            <span>{openSection.countries ? "▲" : "▼"}</span>
          </button>

          {openSection.countries && (
            <div className="mt-4">
              <input
                type="text"
                placeholder="Search Country"
                value={searchCountry}
                onChange={(e) => setSearchCountry(e.target.value)}
                className="w-full border rounded-md px-3 py-2 text-sm mb-3"
              />

              <div className="space-y-2">
                {visibleCountries.map((country) => (
                  <label key={country} className="flex items-center text-black">
                    <input
                      type="checkbox"
                      checked={selectedCountries.includes(country)}
                      onChange={() => toggleCountry(country)}
                      className="mr-2"
                    />
                    {country}
                  </label>
                ))}
              </div>

              {filteredCountries.length > 4 && (
                <button
                  onClick={() => setShowAllCountries(!showAllCountries)}
                  className="text-orange-500 text-sm mt-2"
                >
                  {showAllCountries ? "See Less" : "See All"}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Themes */}
        <div className="border-b pb-5 mb-5">
          <button
            onClick={() => toggleSection("themes")}
            className="flex justify-between w-full font-semibold text-black"
          >
            Themes
            <span>{openSection.themes ? "▲" : "▼"}</span>
          </button>

          {openSection.themes && (
            <div className="mt-3 space-y-2">
              {visibleThemes.map((theme) => (
                <label key={theme} className="flex items-center text-black">
                  <input
                    type="checkbox"
                    checked={selectedThemes.includes(theme)}
                    onChange={() => toggleTheme(theme)}
                    className="mr-2"
                  />
                  {theme}
                </label>
              ))}

              <button
                onClick={() => setShowAllThemes(!showAllThemes)}
                className="text-blue-500 text-sm"
              >
                {showAllThemes ? "Show Less" : "Show More"}
              </button>
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

                  setSelectedFilters(
                    replaceGroupedFilter(
                      selectedFilters,
                      selectedFilters.filter((f) => f.startsWith("Duration ")),
                      `Duration ${val}N`
                    )
                  );
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
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => {
                  const newState = !flightFilter.withFlight;
                  updateSimpleFilter("With Flight", newState);
                }}
                className={`border px-3 py-2 rounded-md text-sm ${
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
                  updateSimpleFilter("Without Flight", newState);
                }}
                className={`border px-3 py-2 rounded-md text-sm ${
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
                      const newVal =
                        budgetFilter === item.key ? null : item.key;

                      setSelectedFilters(
                        replaceGroupedFilter(
                          selectedFilters,
                          [
                            "< ₹25,000",
                            "₹25,000 - ₹35,000",
                            "₹35,000 - ₹45,000",
                            "> ₹45,000",
                          ],
                          newVal ? item.label : null
                        )
                      );
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

                    setSelectedFilters(
                      replaceGroupedFilter(
                        selectedFilters,
                        ["<3★", "3★", "4★", "5★"],
                        newVal ? hotel.label : null
                      )
                    );
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
                  updateSimpleFilter("Book @ ₹2,000", e.target.checked);
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
            <div className="mt-4 flex gap-6 text-sm text-black">
              <button
                onClick={() => {
                  const value = "Customizable";
                  if (selectedFilters.includes(value)) {
                    setSelectedFilters(
                      selectedFilters.filter((f) => f !== value)
                    );
                  } else {
                    setSelectedFilters([...selectedFilters, value]);
                  }
                }}
                className={`transition ${
                  selectedFilters.includes("Customizable")
                    ? "text-orange-500 font-semibold"
                    : "text-black"
                }`}
              >
                Customizable (119)
              </button>

              <button
                onClick={() => {
                  const value = "Group Package";
                  if (selectedFilters.includes(value)) {
                    setSelectedFilters(
                      selectedFilters.filter((f) => f !== value)
                    );
                  } else {
                    setSelectedFilters([...selectedFilters, value]);
                  }
                }}
                className={`transition ${
                  selectedFilters.includes("Group Package")
                    ? "text-orange-500 font-semibold"
                    : "text-black"
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
                  updateSimpleFilter("Premium Packages", e.target.checked);
                }}
                className="mr-2"
              />
              Premium Packages
            </label>
          )}
        </div>
      </div>
    </div>
  );
}