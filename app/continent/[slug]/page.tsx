"use client";

import { useMemo, useState, use, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, Globe2, X } from "lucide-react";

import ContinentBanner from "../../components/continent/ContinentBanner";
import CountryTabs from "../../components/continent/CountryTabs";
import ContinentFilters from "../../components/continent/ContinentFilters";
import ContinentPackagesGrid from "../../components/continent/ContinentPackagesGrid";
import ContinentTabs from "../../components/homepage/continents/ContinentTabs";
import MobileInnerBack from "../../components/common/mobile/MobileInnerBack";

interface PageProps {
  params: Promise<{
    slug?: string;
  }>;
}

type ContinentConfig = {
  key: string;
  id: string;
  routeSlug: string;
  displayName: string;
  bannerSlug: string;
  countries: string[];
};

const CONTINENT_REGISTRY: ContinentConfig[] = [
  {
    key: "Asia",
    id: "asia",
    routeSlug: "asia",
    displayName: "Asia",
    bannerSlug: "asia",
    countries: [
      "Thailand",
      "Dubai",
      "Singapore",
      "Malaysia",
      "Indonesia",
      "Vietnam",
      "Japan",
      "Sri Lanka",
      "Maldives",
      "India",
    ],
  },
  {
    key: "Europe",
    id: "europe",
    routeSlug: "europe",
    displayName: "Europe",
    bannerSlug: "europe",
    countries: [
      "Switzerland",
      "France",
      "Italy",
      "Germany",
      "Austria",
      "Spain",
      "Netherlands",
      "Greece",
      "Turkey",
      "United Kingdom",
    ],
  },
  {
    key: "NorthAmerica",
    id: "northamerica",
    routeSlug: "northamerica",
    displayName: "North America",
    bannerSlug: "north america",
    countries: [
      "USA",
      "Canada",
      "Mexico",
      "Costa Rica",
      "Jamaica",
      "Bahamas",
      "Dominican Republic",
      "Cuba",
      "Panama",
      "Guatemala",
    ],
  },
  {
    key: "SouthAmerica",
    id: "southamerica",
    routeSlug: "southamerica",
    displayName: "South America",
    bannerSlug: "south america",
    countries: [
      "Brazil",
      "Argentina",
      "Peru",
      "Chile",
      "Colombia",
      "Ecuador",
      "Bolivia",
      "Uruguay",
      "Paraguay",
      "Venezuela",
    ],
  },
  {
    key: "Africa",
    id: "africa",
    routeSlug: "africa",
    displayName: "Africa",
    bannerSlug: "africa",
    countries: [
      "South Africa",
      "Kenya",
      "Morocco",
      "Egypt",
      "Tanzania",
      "Namibia",
      "Botswana",
      "Zimbabwe",
      "Rwanda",
      "Seychelles",
    ],
  },
  {
    key: "Oceania",
    id: "oceania",
    routeSlug: "oceania",
    displayName: "Australia & New Zealand",
    bannerSlug: "australia & new zealand",
    countries: [
      "Australia",
      "New Zealand",
      "Fiji",
      "Papua New Guinea",
      "Samoa",
      "Tonga",
      "Vanuatu",
      "Solomon Islands",
      "Tahiti",
      "Cook Islands",
    ],
  },
  {
    key: "Antarctica",
    id: "antarctica",
    routeSlug: "antarctica",
    displayName: "Antarctica",
    bannerSlug: "antarctica",
    countries: [
      "Antarctica Cruise",
      "South Georgia",
      "Falkland Islands",
      "Drake Passage",
      "King George Island",
      "Paradise Bay",
      "Deception Island",
      "Lemaire Channel",
      "Elephant Island",
      "Ross Sea",
    ],
  },
];

function normalizeSlug(value?: string) {
  return decodeURIComponent(value || "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/\s+/g, "")
    .replace(/-/g, "");
}

function normalizeText(value?: string) {
  return decodeURIComponent(value || "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/\s+/g, " ");
}

function findContinentBySlug(rawSlug?: string) {
  const normalized = normalizeSlug(rawSlug);

  return (
    CONTINENT_REGISTRY.find((item) => normalizeSlug(item.routeSlug) === normalized) ||
    CONTINENT_REGISTRY.find((item) => normalizeSlug(item.bannerSlug) === normalized) ||
    CONTINENT_REGISTRY.find((item) => normalizeSlug(item.displayName) === normalized) ||
    CONTINENT_REGISTRY.find((item) => normalizeSlug(item.id) === normalized) ||
    CONTINENT_REGISTRY.find((item) => normalizeSlug(item.key) === normalized) ||
    null
  );
}

export default function ContinentPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();

  const rawSlug = decodeURIComponent(resolvedParams?.slug ?? "");

  const continentConfig = useMemo(() => {
    return findContinentBySlug(rawSlug) || CONTINENT_REGISTRY[0];
  }, [rawSlug]);

  const continents = useMemo(() => {
    return CONTINENT_REGISTRY.map((item) => ({
      id: item.id,
      name: item.displayName,
    }));
  }, []);

  const activeContinentId = continentConfig.id;
  const finalSlug = continentConfig.key;
  const bannerSlug = continentConfig.bannerSlug;
  const countries = continentConfig.countries;

  const [activeCountry, setActiveCountry] = useState<string>("");
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [resetFilters, setResetFilters] = useState(false);
  const [isManualCountrySelection, setIsManualCountrySelection] = useState(false);
  const [isContinentSheetOpen, setIsContinentSheetOpen] = useState(false);

  const matchedCountry = searchParams.get("matchedCountry") || "";
  const toCity = searchParams.get("toCity") || "";
  const searchMode = searchParams.get("searchMode") || "";
  const destinationKind = searchParams.get("destinationKind") || "";

  useEffect(() => {
    if (!matchedCountry || isManualCountrySelection) return;

    const matched = countries.find(
      (country) => normalizeText(country) === normalizeText(matchedCountry)
    );

    if (matched) {
      setActiveCountry(matched);
    }
  }, [matchedCountry, countries, isManualCountrySelection]);

  const handleContinentSwitch = (id: string) => {
    const selectedContinent =
      CONTINENT_REGISTRY.find((item) => item.id === id) || CONTINENT_REGISTRY[0];

    const params = new URLSearchParams(searchParams.toString());

    router.push(`/continent/${selectedContinent.routeSlug}?${params.toString()}`);
  };

  const handleMobileContinentSwitch = (id: string) => {
    setIsContinentSheetOpen(false);
    handleContinentSwitch(id);
  };

  const handleCountryChange = (country: string) => {
    setIsManualCountrySelection(true);
    setActiveCountry(country);
  };

  const handleClearAll = () => {
    setSelectedFilters([]);
    setActiveCountry("");
    setIsManualCountrySelection(false);
    setResetFilters((prev) => !prev);
  };

  return (
    <main className="relative overflow-x-hidden">
      <div className="absolute left-3 top-3 z-30 lg:hidden">
        <MobileInnerBack title="Back" />
      </div>

      <ContinentBanner slug={bannerSlug} />

      <div className="max-w-7xl mx-auto px-3 sm:px-4 -mt-6 lg:-mt-10 relative z-20">
        <div className="bg-white/95 backdrop-blur border rounded-2xl shadow-sm px-3 pt-3 pb-4 lg:px-4 lg:pt-4 lg:pb-6">
          <div className="md:hidden">
            <button
              type="button"
              onClick={() => setIsContinentSheetOpen(true)}
              className="flex w-full items-center justify-between rounded-2xl border border-orange-100 bg-gradient-to-r from-orange-50 to-white px-3.5 py-3 text-left shadow-sm"
            >
              <span className="flex min-w-0 items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-500 text-white">
                  <Globe2 className="h-4 w-4" />
                </span>
                <span className="min-w-0">
                  <span className="block text-[11px] font-bold uppercase tracking-wide text-orange-600">
                    Continent
                  </span>
                  <span className="block truncate text-sm font-bold text-black">
                    {continentConfig.displayName}
                  </span>
                </span>
              </span>
              <ChevronDown className="h-4 w-4 shrink-0 text-gray-500" />
            </button>
          </div>

          <div className="hidden md:block">
            <ContinentTabs
              continents={continents}
              active={activeContinentId}
              setActive={handleContinentSwitch}
            />
          </div>

          <div className="mt-3 lg:-mt-10 rounded-3x1">
            <CountryTabs
              slug={bannerSlug}
              countries={countries}
              activeCountry={activeCountry}
              setActiveCountry={handleCountryChange}
            />
          </div>
        </div>
      </div>

      {isContinentSheetOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Close continent selector"
            className="absolute inset-0 bg-black/45"
            onClick={() => setIsContinentSheetOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-0 rounded-t-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div>
                <p className="text-base font-bold text-black">Choose continent</p>
                <p className="text-xs text-gray-500">Switch package results instantly</p>
              </div>
              <button
                type="button"
                onClick={() => setIsContinentSheetOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-black"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-2 px-4 py-4">
              {CONTINENT_REGISTRY.map((continent) => {
                const isActive = continent.id === activeContinentId;

                return (
                  <button
                    key={continent.id}
                    type="button"
                    onClick={() => handleMobileContinentSwitch(continent.id)}
                    className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${
                      isActive
                        ? "border-orange-500 bg-orange-50 text-orange-600"
                        : "border-gray-200 bg-white text-black"
                    }`}
                  >
                    <span className="text-sm font-bold">{continent.displayName}</span>
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
      )}

      <section className="max-w-7xl mx-auto px-3 sm:px-4 pb-20 lg:pb-16 mt-4">
        <div className="bg-white lg:border lg:rounded-xl lg:shadow-sm lg:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-8">
            <div className="lg:col-span-1 lg:sticky lg:top-32 h-fit">
              <ContinentFilters
                selectedFilters={selectedFilters}
                setSelectedFilters={setSelectedFilters}
                countries={countries}
                activeCountry={activeCountry}
                setActiveCountry={handleCountryChange}
                resetFilters={resetFilters}
              />
            </div>

            <div className="lg:col-span-3">
              <ContinentPackagesGrid
                selectedFilters={selectedFilters}
                setSelectedFilters={setSelectedFilters}
                activeCountry={activeCountry}
                setActiveCountry={handleCountryChange}
                continent={finalSlug}
                resetFilters={resetFilters}
                setResetFilters={setResetFilters}
                onClearAll={handleClearAll}
                searchMode={isManualCountrySelection ? "" : searchMode}
                destinationKind={isManualCountrySelection ? "" : destinationKind}
                requestedToCity={isManualCountrySelection ? "" : toCity}
                requestedMatchedCountry={
                  isManualCountrySelection ? "" : matchedCountry
                }
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
