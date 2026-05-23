"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronRight, Search, X } from "lucide-react";
import { packageIndex } from "@/app/data/packages";
import { getPackageOfferPreview } from "@/app/lib/smartOffers/getPackageOfferPreview";
import { resolvePackageByRouteId } from "@/app/data/packages/resolvePackage";
import { advancedSmartPackageSearch } from "@/app/lib/holidays/advancedSmartPackageSearch";

interface Props {
  selectedFilters: string[];
  setSelectedFilters: (filters: string[]) => void;
  activeCountry: string;
  setActiveCountry: (country: string) => void;
  continent: string;
  resetFilters: boolean;
  setResetFilters: (value: boolean) => void;
  onClearAll: () => void;
  searchMode?: string;
  destinationKind?: string;
  requestedToCity?: string;
  requestedMatchedCountry?: string;
}

interface PackageCardData {
  routeId: string;
  title: string;
  nights: string;
  route: string;
  withFlightPrice: number;
  withoutFlightPrice: number;
  emi: string;
  category: string;
  country: string;
  continent: string;
  defaultOriginCity: string;
  cities: string[];

  themes: string[];
  subThemes: string[];
  tags: string[];

  durationNights: number;
  durationDays: number;
}

function normalizeValue(value?: string) {
  return (value || "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]/g, "");
}

function normalizeLoose(value?: string) {
  return (value || "")
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function compact(value?: string) {
  return normalizeLoose(value).replace(/\s+/g, "");
}

function smartTextMatch(field?: string, query?: string) {
  const f = normalizeLoose(field);
  const q = normalizeLoose(query);

  if (!f || !q) return false;
  if (f === q) return true;
  if (f.includes(q) || q.includes(f)) return true;
  if (compact(f) === compact(q)) return true;
  if (compact(f).includes(compact(q)) || compact(q).includes(compact(f))) {
    return true;
  }

  const fWords = new Set(f.split(" ").filter(Boolean));
  const qWords = q.split(" ").filter(Boolean);

  for (const word of qWords) {
    if (fWords.has(word)) return true;
  }

  return false;
}

function countryAliasMatch(pkgCountry: string, target: string) {
  const p = normalizeValue(pkgCountry);
  const t = normalizeValue(target);

  if (!p || !t) return false;
  if (p === t) return true;
  if (p.includes(t) || t.includes(p)) return true;

  const aliasMap: Record<string, string[]> = {
    uae: ["dubai", "unitedarabemirates"],
    unitedkingdom: ["uk", "london"],
    uk: ["unitedkingdom", "london"],
    usa: ["unitedstates", "newyork", "newyorkcity", "nyc"],
    unitedstates: ["usa", "newyork", "nyc"],
    indonesia: ["bali"],
    france: ["paris"],
    italy: ["rome", "florence", "venice"],
    japan: ["tokyo", "kyoto"],
    srilanka: ["colombo", "srilanka"],
    thailand: ["phuket", "krabi", "bangkok"],
    malaysia: ["kualalumpur"],
    india: ["goa", "kerala", "kashmir", "rajasthan"],
  };

  const pkgAliases = aliasMap[p] || [];
  const targetAliases = aliasMap[t] || [];

  if (pkgAliases.some((a) => a === t)) return true;
  if (targetAliases.some((a) => a === p)) return true;
  if (pkgAliases.some((a) => targetAliases.includes(a))) return true;

  return false;
}

function cityAliasMatch(cities: string[], target: string) {
  const t = normalizeValue(target);
  if (!t) return false;

  return cities.some((city) => {
    const c = normalizeValue(city);
    if (!c) return false;
    return c === t || c.includes(t) || t.includes(c);
  });
}

function resolveRouteId(pkg: any) {
  if (typeof pkg?.id === "string" && pkg.id.startsWith("pkg-")) {
    return pkg.id.replace("pkg-", "");
  }
  return String(pkg?.id || pkg?.routeId || pkg?.slug || "");
}

function formatEmi(price: number) {
  const emi = Math.max(Math.round(price / 12), 0);
  return `₹${emi.toLocaleString("en-IN")}/month`;
}

function buildDefaultDate() {
  const date = new Date();
  date.setDate(date.getDate() + 30);
  return date.toISOString().split("T")[0];
}

function resolveDefaultOriginCity(pkg: any, rawPkg: any) {
  return (
    pkg?.defaultOriginCity ||
    pkg?.originCity ||
    pkg?.variants?.withFlight?.originCity ||
    rawPkg?.defaultOriginCity ||
    rawPkg?.originCity ||
    "Delhi"
  );
}

export default function ContinentPackagesGrid({
  selectedFilters,
  setSelectedFilters,
  activeCountry,
  setActiveCountry,
  continent,
  resetFilters,
  onClearAll,
  searchMode = "",
  destinationKind = "",
  requestedToCity = "",
  requestedMatchedCountry = "",
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [activeCategory, setActiveCategory] = useState("All Packages");
  const [sort, setSort] = useState("popular");
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(6);
  const [activePackage, setActivePackage] = useState<string | null>(null);

  const popupRef = useRef<HTMLDivElement>(null);

  const packages: PackageCardData[] = useMemo(() => {
    return packageIndex.map((rawPkg: any) => {
      const routeId = resolveRouteId(rawPkg);
      const pkg = resolvePackageByRouteId(routeId) || rawPkg;

      const withoutFlightPrice = Number(
        pkg?.variants?.withoutFlight?.pricePerPerson ||
          pkg?.startingPrice ||
          0
      );

      let withFlightPrice = Number(
        pkg?.variants?.withFlight?.pricePerPerson || 0
      );

      if (!withFlightPrice || withFlightPrice === 0) {
        withFlightPrice = withoutFlightPrice + 12000;
      }

      const durationNights = Number(pkg?.nights || rawPkg?.nights || 0);
      const durationDays = Number(pkg?.days || rawPkg?.days || 0);

      return {
  routeId,
  title: pkg?.title || rawPkg?.title || "Package",
  nights: `${durationNights}N/${durationDays}D`,
  route: Array.isArray(pkg?.cities)
    ? pkg.cities.join(" • ")
    : pkg?.route || rawPkg?.route || "",
  withFlightPrice,
  withoutFlightPrice,
  emi: formatEmi(withoutFlightPrice || withFlightPrice),
  category: pkg?.category || rawPkg?.category || "All Packages",
  country: pkg?.countries?.[0] || rawPkg?.countries?.[0] || "",
  continent: pkg?.continent || rawPkg?.continent || "",
  defaultOriginCity: resolveDefaultOriginCity(pkg, rawPkg),

  cities: Array.isArray(pkg?.cities)
    ? pkg.cities
    : Array.isArray(rawPkg?.cities)
    ? rawPkg.cities
    : [],

  themes: Array.isArray(pkg?.theme)
    ? pkg.theme
    : Array.isArray(pkg?.themes)
    ? pkg.themes
    : [],

  subThemes: Array.isArray(pkg?.subThemes)
    ? pkg.subThemes
    : [],

  tags: Array.isArray(pkg?.tags)
    ? pkg.tags
    : [],

  durationNights,
  durationDays,
};
    });
  }, []);

  const handleVariantSelect = (
    packageId: string,
    variant: "withFlight" | "withoutFlight",
    originCity: string
  ) => {
    setActivePackage(null);

    const params = new URLSearchParams(searchParams.toString());

    params.set("variant", variant);
    params.set("date", params.get("date") || buildDefaultDate());
    params.set("origin", params.get("origin") || originCity || "Delhi");
    params.set("adults", params.get("adults") || "2");
    params.set("children", params.get("children") || "0");
    params.set("rooms", params.get("rooms") || "1");

    router.push(`/packages/${packageId}?${params.toString()}`);
  };

  useEffect(() => {
  if (!resetFilters) return;

  setActiveCategory("All Packages");
  setSort("popular");
  setSearchQuery("");
  setVisibleCount(6);
  setActivePackage(null);
}, [resetFilters]);

  const continentPackages = useMemo(() => {
    return packages.filter(
      (p) => normalizeValue(p.continent) === normalizeValue(continent)
    );
  }, [packages, continent]);

  const targetCountry = requestedMatchedCountry || activeCountry || "";
  const targetCity = requestedToCity || "";
  const smartTargetQuery =
    requestedToCity || requestedMatchedCountry || activeCountry || "";

  const smartSearchPackages = useMemo(() => {
    if (!smartTargetQuery) return [];

    const smartResults = advancedSmartPackageSearch(smartTargetQuery, 50);
    const smartIds = new Set(
      smartResults.map((item) => String(item.id).replace("pkg-", ""))
    );

    return continentPackages.filter((pkg) => {
      const normalizedRouteId = String(pkg.routeId).replace("pkg-", "");
      return smartIds.has(normalizedRouteId);
    });
  }, [continentPackages, smartTargetQuery]);

  const exactCountryPackages = useMemo(() => {
    if (!targetCountry) return [];

    return continentPackages.filter((p) =>
      countryAliasMatch(p.country, targetCountry)
    );
  }, [continentPackages, targetCountry]);

  const exactCityPackages = useMemo(() => {
    if (!targetCity) return [];

    return continentPackages.filter(
      (p) =>
        cityAliasMatch(p.cities || [], targetCity) ||
        countryAliasMatch(p.country, targetCity)
    );
  }, [continentPackages, targetCity]);

  const filteredPackages = useMemo(() => {
    let base = continentPackages.filter((p) => {
      const categoryMatch =
        activeCategory === "All Packages" || p.category === activeCategory;

      const countryMatch =
        !activeCountry || countryAliasMatch(p.country, activeCountry);

      const filterMatch =
        selectedFilters.length === 0 ||
        selectedFilters.some(
          (filter) =>
            countryAliasMatch(p.country, filter) ||
            normalizeValue(p.category) === normalizeValue(filter)
        );

      const searchMatch =
        !searchQuery ||
        smartTextMatch(p.title, searchQuery) ||
        smartTextMatch(p.route, searchQuery) ||
        smartTextMatch(p.country, searchQuery) ||
        smartTextMatch(p.continent, searchQuery) ||
        p.cities.some((city) => smartTextMatch(city, searchQuery));

      return categoryMatch && countryMatch && filterMatch && searchMatch;
    });

    const shouldUseSearchTargeting =
      searchMode === "destination" && destinationKind === "international";

    if (shouldUseSearchTargeting) {
      if (smartSearchPackages.length > 0) {
        base = base.filter((p) =>
          smartSearchPackages.some((item) => item.routeId === p.routeId)
        );
      } else if (exactCityPackages.length > 0) {
        base = base.filter((p) =>
          exactCityPackages.some((item) => item.routeId === p.routeId)
        );
      } else if (exactCountryPackages.length > 0) {
        base = base.filter((p) =>
          exactCountryPackages.some((item) => item.routeId === p.routeId)
        );
      }
    }

    if (sort === "price") {
      return [...base].sort(
        (a, b) => a.withoutFlightPrice - b.withoutFlightPrice
      );
    }

    if (sort === "duration") {
      return [...base].sort((a, b) => {
        if (a.durationNights !== b.durationNights) {
          return a.durationNights - b.durationNights;
        }
        return a.durationDays - b.durationDays;
      });
    }

    return base;
  }, [
    continentPackages,
    activeCategory,
    activeCountry,
    selectedFilters,
    sort,
    searchMode,
    destinationKind,
    smartSearchPackages,
    exactCityPackages,
    exactCountryPackages,
    searchQuery,
  ]);

  const fallbackMessage = useMemo(() => {
    const shouldUseSearchTargeting =
      searchMode === "destination" && destinationKind === "international";

    if (!shouldUseSearchTargeting) return "";

    const target = targetCity || targetCountry;

    if (
      target &&
      smartSearchPackages.length === 0 &&
      exactCityPackages.length === 0 &&
      exactCountryPackages.length === 0
    ) {
      const countryNote = activeCountry
        ? ` Also ensure this place belongs to ${activeCountry}.`
        : "";

      return `${target} active packages not available right now. Showing similar ${continent} packages instead. Ensure the place belongs to this Continent.${countryNote} If not, please search in the correct Continent or clear filters.`;
    }

    return "";
  }, [
    searchMode,
    destinationKind,
    targetCity,
    targetCountry,
    smartSearchPackages.length,
    exactCityPackages.length,
    exactCountryPackages.length,
    continent,
    activeCountry,
  ]);

  const searchWarningMessage = useMemo(() => {
    if (!searchQuery || filteredPackages.length > 0) return "";

    const countryNote = activeCountry
      ? ` Also ensure the place belongs to ${activeCountry}.`
      : "";

    return `No package found for "${searchQuery}". Ensure the place belongs to this Continent.${countryNote} If not, please search in the correct Continent or clear filters.`;
  }, [searchQuery, filteredPackages.length, activeCountry]);

  const resultCount = filteredPackages.length;
  const visiblePackages = filteredPackages.slice(0, visibleCount);

  useEffect(() => {
    setVisibleCount(6);
  }, [searchQuery, activeCategory, activeCountry, selectedFilters, sort]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 400
      ) {
        setVisibleCount((prev) =>
          prev < filteredPackages.length ? prev + 2 : prev
        );
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [filteredPackages.length]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setActivePackage(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div>
      {fallbackMessage && (
        <div className="mb-4 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-[#9a3412]">
          {fallbackMessage}
        </div>
      )}

      <div className="flex items-center justify-between gap-4 flex-wrap mb-5">
        <div className="text-sm md:text-base font-medium text-gray-700 whitespace-nowrap">
          {searchQuery ? (
            <>
              Showing <span className="font-semibold text-black">{resultCount}</span>{" "}
              results for{" "}
              <span className="font-semibold text-black">"{searchQuery}"</span>
            </>
          ) : (
            <>
              Total <span className="font-semibold text-black">{resultCount}</span>{" "}
              packages
            </>
          )}
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto lg:min-w-[550px]">
          <div className="relative flex-1 min-w-0">
            <Search className="w-4 h-4 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2" />

            <input
              type="text"
              placeholder="Search packages or destination..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-[48px] border-2 border-orange-300 rounded-xl pl-11 pr-11 text-[15px] font-medium text-black placeholder:text-gray-400 bg-white shadow-[0_6px_18px_rgba(0,0,0,0.06)] focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
            />

            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="h-[48px] min-w-[170px] border border-gray-300 px-4 rounded-xl text-sm font-medium bg-white text-black shadow-[0_4px_12px_rgba(0,0,0,0.05)] focus:outline-none focus:ring-2 focus:ring-orange-300"
          >
            <option value="popular">Sort by Popular</option>
            <option value="price">Sort by Price</option>
            <option value="duration">Sort by Duration</option>
          </select>
        </div>
      </div>

      {selectedFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mt-2 mb-5">
          {selectedFilters.map((filter) => (
            <button
              key={filter}
              onClick={() =>
                setSelectedFilters(selectedFilters.filter((f) => f !== filter))
              }
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-white text-blue-800 border border-blue-200 rounded-full"
            >
              {filter}
              <span className="text-blue-600">✕</span>
            </button>
          ))}

          <button
            onClick={onClearAll}
            className="text-sm font-semibold text-red-600 ml-2 hover:text-red-700"
          >
            Clear All
          </button>
        </div>
      )}

      {searchWarningMessage && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {searchWarningMessage}
        </div>
      )}



      {filteredPackages.length === 0 ? (
        <div className="border rounded-xl bg-white p-10 text-center">
          <p className="text-lg font-semibold text-black mb-2">
            No packages found
          </p>
          <p className="text-sm text-gray-600 mb-4">
            Try another destination, place name, or clear filters.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              onClearAll();
            }}
            className="mt-2.5 px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-medium transition hover:bg-red-600 shadow-sm"
          >
            Clear Search & Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {visiblePackages.map((pkg) => {
  const landOfferPreview = getPackageOfferPreview(
  {
    routeId: pkg.routeId,
    title: pkg.title,
    country: pkg.country,
    continent: pkg.continent,
    route: pkg.route,
    cities: pkg.cities,
    themes: pkg.themes,
    subThemes: pkg.subThemes,
    tags: pkg.tags,
  },
  pkg.withoutFlightPrice
);

const flightOfferPreview = getPackageOfferPreview(
  {
    routeId: pkg.routeId,
    title: pkg.title,
    country: pkg.country,
    continent: pkg.continent,
    route: pkg.route,
    cities: pkg.cities,
    themes: pkg.themes,
    subThemes: pkg.subThemes,
    tags: pkg.tags,
  },
  pkg.withFlightPrice
);

const offerDiscount = Math.round(Number(landOfferPreview?.discount || 0));
const flightOfferDiscount = Math.round(
  Number(flightOfferPreview?.discount || 0)
);

const finalOfferPrice = Math.max(
  Math.round(pkg.withoutFlightPrice - offerDiscount),
  0
);

const withFlightOfferPrice = Math.max(
  Math.round(pkg.withFlightPrice - flightOfferDiscount),
  0
);

const bestOfferPreview = landOfferPreview || flightOfferPreview || null;
const offerCode = bestOfferPreview?.code || "";
const offerTitle = bestOfferPreview?.offer?.title || bestOfferPreview?.label || "";

  return (
            <div
              key={pkg.routeId}
              onClick={() =>
                setActivePackage((prev) =>
                  prev === pkg.routeId ? null : pkg.routeId
                )
              }
              className="border rounded-xl shadow-sm hover:shadow-md transition bg-white cursor-pointer"
            >
              <div className="h-52 bg-gray-200 rounded-t-xl relative cursor-pointer">
                <span className="absolute top-3 left-3 bg-black text-white text-xs px-3 py-1 rounded-full">
  {offerTitle || "Best Deal"}
</span>

{offerCode ? (
  <span className="absolute top-3 right-3 rounded-full bg-orange-500 px-3 py-1 text-xs font-bold text-white">
    {offerCode}
  </span>
) : null}

                {activePackage === pkg.routeId && (
                  <div
                    ref={popupRef}
                    className="absolute top-16 left-4 right-4 bg-white rounded-xl shadow-lg p-4 z-20 border"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <h4 className="font-semibold text-black mb-3 pr-8">
                      {pkg.title}
                    </h4>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActivePackage(null);
                      }}
                      className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center bg-black text-white rounded-full text-xs"
                    >
                      ✕
                    </button>

                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        handleVariantSelect(
                          pkg.routeId,
                          "withFlight",
                          pkg.defaultOriginCity
                        );
                      }}
                      className="border rounded-lg p-3 mb-3 flex justify-between items-center hover:shadow cursor-pointer bg-white"
                    >
                      <div>
                        <p className="text-xs text-gray-600">
                          Starting from -{" "}
                          {searchParams.get("origin") || pkg.defaultOriginCity}
                        </p>
                        <p className="font-semibold text-black">With Flight</p>
                      </div>

                      <div className="text-right flex items-center gap-2">
                        <div>
  {flightOfferDiscount > 0 && (
    <p className="text-[11px] font-semibold text-black line-through">
      ₹{pkg.withFlightPrice.toLocaleString("en-IN")}
    </p>
  )}

  <p className="font-bold text-black">
    ₹
    {withFlightOfferPrice.toLocaleString("en-IN")}
  </p>

  {flightOfferDiscount > 0 && (
    <p className="text-[10px] font-bold text-green-600">
      Save ₹
      {flightOfferDiscount.toLocaleString("en-IN")}
    </p>
  )}

  <p className="text-xs text-gray-600">per person</p>
</div>
                        <ChevronRight className="w-4 h-4 text-gray-500" />
                      </div>
                    </div>

                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        handleVariantSelect(
                          pkg.routeId,
                          "withoutFlight",
                          pkg.defaultOriginCity
                        );
                      }}
                      className="border rounded-lg p-3 flex justify-between items-center hover:shadow cursor-pointer bg-white"
                    >
                      <div>
                        <p className="text-xs text-gray-600">
                          Starting from - Land Package
                        </p>
                        <p className="font-semibold text-black">Without Flight</p>
                      </div>

                      <div className="text-right flex items-center gap-2">
                        <div>
  {offerDiscount > 0 && (
    <p className="text-[11px] font-semibold text-black line-through">
      ₹{pkg.withoutFlightPrice.toLocaleString("en-IN")}
    </p>
  )}

  <p className="font-bold text-black">
    ₹{finalOfferPrice.toLocaleString("en-IN")}
  </p>

  {offerDiscount > 0 && (
    <p className="text-[10px] font-bold text-green-600">
      Save ₹
      {Math.round(offerDiscount).toLocaleString("en-IN")}
    </p>
  )}

  <p className="text-xs text-gray-600">per person</p>
</div>
                        <ChevronRight className="w-4 h-4 text-gray-500" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-lg text-black">
                    {pkg.title}
                  </h3>
                  <span className="text-xs border px-2 py-1 rounded text-black">
                    {pkg.nights}
                  </span>
                </div>

                <p className="text-sm text-gray-700 mb-3 font-medium">
                  {pkg.route}
                </p>

                <div className="grid grid-cols-2 text-sm text-gray-800 gap-2 mb-4">
                  <p>• Round Trip Flights</p>
                  <p>• Intercity Transfers</p>
                  <p>• 4 Star Hotels</p>
                  <p>• Airport Transfers</p>
                  <p>• Selected Meals</p>
                  <p>• Activities</p>
                </div>

                <div className="flex justify-between items-center">
                  <div className="text-xs text-gray-700 font-medium">
                    No Cost EMI at <br />
                    {pkg.emi}
                  </div>

                  <div className="text-right">
  {offerDiscount > 0 && (
    <p className="text-[15px] font-semibold text-gray-900 line-through">
      ₹{pkg.withoutFlightPrice.toLocaleString("en-IN")}
    </p>
  )}

  <p className="text-xl font-bold text-black">
    ₹{finalOfferPrice.toLocaleString("en-IN")}
  </p>

  {offerDiscount > 0 && (
    <p className="text-[11px] font-bold text-green-600">
      Save ₹{Math.round(offerDiscount).toLocaleString("en-IN")}
    </p>
  )}

  <p className="text-xs text-gray-700 font-medium">/Person</p>
</div>
                </div>

                <div className="text-center text-xs text-blue-500 mt-3 font-medium">
                  2 More Options Available
                </div>
              </div>
            </div>
          );
        })}
        </div>
      )}
    </div>
  );
}