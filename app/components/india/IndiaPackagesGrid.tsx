"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronRight, Search, X } from "lucide-react";
import { packageIndex } from "@/app/data/packages";
import { resolvePackageByRouteId } from "@/app/data/packages/resolvePackage";
import { advancedSmartPackageSearch } from "@/app/lib/holidays/advancedSmartPackageSearch";
import { getPackageOfferPreview } from "@/app/lib/smartOffers/getPackageOfferPreview";

interface Props {
  selectedFilters: string[];
  setSelectedFilters: (filters: string[]) => void;
  activeState: string;
  setActiveState: (state: string) => void;
  resetFilters: boolean;
  setResetFilters: (value: boolean) => void;
  onClearAll: () => void;
  searchMode?: string;
  destinationKind?: string;
  requestedToCity?: string;
  requestedMatchedState?: string;
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
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function smartTextMatch(a?: string, b?: string) {
  const A = normalizeLoose(a);
  const B = normalizeLoose(b);
  if (!A || !B) return false;
  return A === B || A.includes(B) || B.includes(A);
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

const STATE_ALIAS_MAP: Record<string, string[]> = {
  rajasthan: ["jaipur", "udaipur", "jodhpur", "jaisalmer", "ajmer", "pushkar"],
  goa: ["northgoa", "southgoa", "goa"],
  kashmir: ["srinagar", "gulmarg", "pahalgam"],
  kerala: ["kochi", "munnar", "alleppey", "kovalam", "varkala", "kumarakom"],
  himachalpradesh: ["manali", "shimla", "kasol", "bir", "dharamshala"],
  uttarakhand: ["rishikesh", "auli", "joshimath", "nainital", "mussoorie", "kedarnath"],
  ladakh: ["leh", "nubra", "pangong"],
  sikkim: ["gangtok", "pelling"],
  meghalaya: ["shillong", "cherrapunji"],
  andaman: ["portblair", "havelock"],
  tamilnadu: ["madurai", "rameswaram"],
  karnataka: ["hampi", "bangalore"],
  gujarat: ["ahmedabad", "bhuj", "kutch"],
  maharashtra: ["mumbai"],
  assam: ["guwahati", "kaziranga"],
  westbengal: ["darjeeling", "kalimpong"],
  odisha: ["bhubaneswar", "puri"],
  bihar: ["bodhgaya", "nalanda"],
  uttarpradesh: ["varanasi", "ayodhya"],
};

function stateAliasMatch(pkgCities: string[], target: string) {
  const t = normalizeValue(target);
  if (!t) return false;

  const targetAliases = STATE_ALIAS_MAP[t] || [];

  return pkgCities.some((city) => {
    const c = normalizeValue(city);
    if (!c) return false;
    if (c === t || c.includes(t) || t.includes(c)) return true;
    if (targetAliases.includes(c)) return true;
    return false;
  });
}

function cityMatch(cities: string[], target: string) {
  const t = normalizeValue(target);
  if (!t) return false;

  return cities.some((city) => {
    const c = normalizeValue(city);
    if (!c) return false;
    return c === t || c.includes(t) || t.includes(c);
  });
}

export default function IndiaPackagesGrid({
  selectedFilters,
  setSelectedFilters,
  activeState,
  setActiveState,
  resetFilters,
  onClearAll,
  searchMode = "",
  destinationKind = "",
  requestedToCity = "",
  requestedMatchedState = "",
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

      let withFlightPrice = Number(pkg?.variants?.withFlight?.pricePerPerson || 0);

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

  const indiaPackages = useMemo(() => {
    return packages.filter((p) => normalizeValue(p.country) === "india");
  }, [packages]);

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

  const targetState = requestedMatchedState || activeState || "";
  const targetCity = requestedToCity || "";
  const smartTargetQuery =
    requestedToCity || requestedMatchedState || activeState || "";

  const smartSearchPackages = useMemo(() => {
    if (!smartTargetQuery) return [];

    const smartResults = advancedSmartPackageSearch(smartTargetQuery, 50);
    const smartIds = new Set(
      smartResults.map((item) => String(item.id).replace("pkg-", ""))
    );

    return indiaPackages.filter((pkg) => {
      const normalizedRouteId = String(pkg.routeId).replace("pkg-", "");
      return smartIds.has(normalizedRouteId);
    });
  }, [indiaPackages, smartTargetQuery]);

  const exactStatePackages = useMemo(() => {
    if (!targetState) return [];
    return indiaPackages.filter((p) => stateAliasMatch(p.cities || [], targetState));
  }, [indiaPackages, targetState]);

  const exactCityPackages = useMemo(() => {
    if (!targetCity) return [];
    return indiaPackages.filter((p) => cityMatch(p.cities || [], targetCity));
  }, [indiaPackages, targetCity]);

  const filteredPackages = useMemo(() => {
    let base = indiaPackages.filter((p) => {
      const categoryMatch =
        activeCategory === "All Packages" || p.category === activeCategory;

      const stateMatch =
        !activeState || stateAliasMatch(p.cities || [], activeState);

      const filterMatch =
        selectedFilters.length === 0 ||
        selectedFilters.some(
          (filter) =>
            stateAliasMatch(p.cities || [], filter) ||
            normalizeValue(p.category) === normalizeValue(filter)
        );

      const searchMatch =
        !searchQuery ||
        smartTextMatch(p.title, searchQuery) ||
        smartTextMatch(p.route, searchQuery) ||
        p.cities.some((city) => smartTextMatch(city, searchQuery)) ||
        smartTextMatch(p.category, searchQuery);

      return categoryMatch && stateMatch && filterMatch && searchMatch;
    });

    const shouldUseSearchTargeting =
      searchMode === "destination" && destinationKind === "india";

    if (shouldUseSearchTargeting) {
      if (smartSearchPackages.length > 0) {
        base = base.filter((p) =>
          smartSearchPackages.some((item) => item.routeId === p.routeId)
        );
      } else if (exactCityPackages.length > 0) {
        base = base.filter((p) =>
          exactCityPackages.some((item) => item.routeId === p.routeId)
        );
      } else if (exactStatePackages.length > 0) {
        base = base.filter((p) =>
          exactStatePackages.some((item) => item.routeId === p.routeId)
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
    indiaPackages,
    activeCategory,
    activeState,
    selectedFilters,
    sort,
    searchMode,
    destinationKind,
    smartSearchPackages,
    exactCityPackages,
    exactStatePackages,
    searchQuery,
  ]);

  const visiblePackages = filteredPackages.slice(0, visibleCount);
  const resultCount = filteredPackages.length;

  useEffect(() => {
    setVisibleCount(6);
  }, [searchQuery, activeState, selectedFilters, sort]);

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
    <div className="min-w-0">
      {selectedFilters.length > 0 && (
        <div className="flex flex-nowrap lg:flex-wrap items-center gap-2 mt-2 lg:mt-4 mb-5 lg:mb-6 overflow-x-auto pb-1">
          {selectedFilters.map((filter) => (
            <button
              key={filter}
              onClick={() => {
                setSelectedFilters(selectedFilters.filter((f) => f !== filter));

                if (filter === activeState) {
                  setActiveState("");
                }
              }}
              className="flex shrink-0 items-center gap-2 px-3 py-1.5 text-xs sm:text-sm font-medium bg-white text-blue-800 border border-blue-200 rounded-full"
            >
              {filter}
              <span className="text-blue-600">✕</span>
            </button>
          ))}

          <button
            onClick={onClearAll}
            className="shrink-0 text-sm font-semibold text-red-600 ml-1 lg:ml-2 hover:text-red-700"
          >
            Clear All
          </button>
        </div>
      )}

      <div className="flex items-start lg:items-center justify-between gap-3 lg:gap-4 flex-wrap mb-4 lg:mb-5">
        <div className="text-sm md:text-base font-medium text-gray-700">
          {searchQuery ? (
            <>
              Showing <span className="font-semibold text-black">{resultCount}</span>{" "}
              results for{" "}
              <span className="font-semibold text-black">&quot;{searchQuery}&quot;</span>
            </>
          ) : (
            <>
              Total <span className="font-semibold text-black">{resultCount}</span>{" "}
              packages
            </>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto lg:min-w-[550px]">
          <div className="relative flex-1 min-w-0">
            <Search className="w-4 h-4 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2" />

            <input
              type="text"
              placeholder="Search packages or destination..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-[44px] lg:h-[48px] border-2 border-orange-300 rounded-xl pl-11 pr-11 text-sm lg:text-[15px] font-medium text-black placeholder:text-gray-400 bg-white shadow-[0_6px_18px_rgba(0,0,0,0.06)] focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
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
            className="h-[44px] lg:h-[48px] w-full sm:w-auto sm:min-w-[170px] border border-gray-300 px-4 rounded-xl text-sm font-medium bg-white text-black shadow-[0_4px_12px_rgba(0,0,0,0.05)] focus:outline-none focus:ring-2 focus:ring-orange-300"
          >
            <option value="popular">Sort by Popular</option>
            <option value="price">Sort by Price</option>
            <option value="duration">Sort by Duration</option>
          </select>
        </div>
      </div>

      {filteredPackages.length === 0 ? (
        <div className="border rounded-xl bg-white p-6 lg:p-10 text-center">
          <p className="text-lg font-semibold text-black mb-2">
            No packages found
          </p>
          <p className="text-sm text-gray-600 mb-4">
            Try another destination, state name, or clear filters.
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 items-start">
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

const offerDiscount = Math.round(
  Number(landOfferPreview?.discount || 0)
);

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

const bestOfferPreview =
  landOfferPreview ||
  flightOfferPreview ||
  null;

const offerCode =
  bestOfferPreview?.code || "";

const offerTitle =
  bestOfferPreview?.offer?.title ||
  bestOfferPreview?.label ||
  "";

return (
            <div
              key={pkg.routeId}
              onClick={() =>
                setActivePackage((prev) =>
                  prev === pkg.routeId ? null : pkg.routeId
                )
              }
              className="border rounded-xl shadow-sm hover:shadow-md transition bg-white cursor-pointer overflow-hidden lg:overflow-visible"
            >
              <div className="h-40 sm:h-48 lg:h-52 bg-gray-200 relative cursor-pointer lg:rounded-t-xl">
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
                    className="absolute top-12 lg:top-16 left-3 right-3 lg:left-4 lg:right-4 bg-white rounded-xl shadow-lg p-3 lg:p-4 z-20 border"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <h4 className="font-semibold text-sm lg:text-base text-black mb-3 pr-8">
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
                      className="border rounded-lg p-3 mb-3 flex justify-between items-center gap-3 hover:shadow cursor-pointer bg-white"
                    >
                      <div>
                        <p className="text-xs text-gray-600">
                          Starting from - {searchParams.get("origin") || pkg.defaultOriginCity}
                        </p>
                        <p className="font-semibold text-black">With Flight</p>
                      </div>

                      <div className="text-right flex items-center gap-2 shrink-0">
                        <div>
                          <>
  {flightOfferDiscount > 0 && (
    <p className="text-[11px] font-semibold text-black line-through">
      ₹{pkg.withFlightPrice.toLocaleString("en-IN")}
    </p>
  )}

  <p className="font-bold text-black">
    ₹{withFlightOfferPrice.toLocaleString("en-IN")}
  </p>

  {flightOfferDiscount > 0 && (
    <p className="text-[10px] font-bold text-green-600">
      Save ₹{flightOfferDiscount.toLocaleString("en-IN")}
    </p>
  )}
</>
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
                      className="border rounded-lg p-3 flex justify-between items-center gap-3 hover:shadow cursor-pointer bg-white"
                    >
                      <div>
                        <p className="text-xs text-gray-600">
                          Starting from - Land Package
                        </p>
                        <p className="font-semibold text-black">Without Flight</p>
                      </div>

                      <div className="text-right flex items-center gap-2 shrink-0">
                        <div>
                          <>
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
      Save ₹{offerDiscount.toLocaleString("en-IN")}
    </p>
  )}
</>
                          <p className="text-xs text-gray-600">per person</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-500" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-3.5 lg:p-4">
                <div className="flex justify-between items-start gap-3 mb-2">
                  <h3 className="font-semibold text-base lg:text-lg leading-snug text-black min-w-0">
                    {pkg.title}
                  </h3>
                  <span className="shrink-0 text-xs border px-2 py-1 rounded text-black">
                    {pkg.nights}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-gray-700 mb-3 font-medium leading-relaxed">
                  {pkg.route}
                </p>

                <div className="grid grid-cols-2 text-xs sm:text-sm text-gray-800 gap-2 mb-4">
                  <p>• Round Trip Flights</p>
                  <p>• Intercity Transfers</p>
                  <p>• 4 Star Hotels</p>
                  <p>• Airport Transfers</p>
                  <p>• Selected Meals</p>
                  <p>• Activities</p>
                </div>

                <div className="flex justify-between items-end gap-3">
                  <div className="text-xs text-gray-700 font-medium">
                    No Cost EMI at <br />
                    {pkg.emi}
                  </div>

                  <div className="text-right shrink-0">
                    <>
  {offerDiscount > 0 && (
    <p className="text-[15px] font-bold text-black line-through">
      ₹{pkg.withoutFlightPrice.toLocaleString("en-IN")}
    </p>
  )}

  <p className="text-lg lg:text-xl font-bold text-black">
    ₹{finalOfferPrice.toLocaleString("en-IN")}
  </p>

  {offerDiscount > 0 && (
    <p className="text-[11px] font-bold text-green-600">
      Save ₹{offerDiscount.toLocaleString("en-IN")}
    </p>
  )}
</>
                    <p className="text-xs text-gray-700 font-medium">/Person</p>
                  </div>
                </div>

                <div className="mt-3 rounded-lg bg-blue-50 px-3 py-2 text-center text-xs font-semibold text-blue-600">
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
