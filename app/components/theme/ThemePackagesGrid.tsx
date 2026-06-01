"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BadgeCheck, ChevronRight, Search, Sparkles, X } from "lucide-react";
import { packageIndex } from "@/app/data/packages";

import { getPackageOfferPreview } from "@/app/lib/smartOffers/getPackageOfferPreview";
import { resolvePackageByRouteId } from "@/app/data/packages/resolvePackage";
import { getSubthemeIntent } from "@/app/lib/holidays/themeSubthemeIntentMap";
import TPLDynamicImage from "@/app/components/common/TPLDynamicImage";
import { getSmartPackageImage } from "@/app/lib/images/smartPackageImageResolver";

interface Props {
  selectedFilters: string[];
  setSelectedFilters: (filters: string[]) => void;
  activeSubTheme: string;
  setActiveSubTheme: (subTheme: string) => void;
  theme: string;
  resetFilters: boolean;
  setResetFilters: (value: boolean) => void;
  onClearAll: () => void;
}

interface PackageCardData {
  routeId: string;
  title: string;
  nights: string;
  route: string;

  withFlightPrice: number;
  withoutFlightPrice: number;

  emi: string;

  country: string;
  continent: string;

  cities: string[];

  themes: string[];
  subThemes: string[];

  tags: string[];

  defaultOriginCity: string;

  durationNights: number;
  durationDays: number;
}

function buildDefaultDate() {
  const date = new Date();
  date.setDate(date.getDate() + 30);
  return date.toISOString().split("T")[0];
}

function norm(s?: string) {
  return (s ?? "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function compact(s?: string) {
  return norm(s).replace(/\s+/g, "");
}

const stop = new Set([
  "and",
  "tourism",
  "the",
  "of",
  "in",
  "to",
  "for",
  "a",
  "an",
  "tour",
  "tours",
  "package",
  "packages",
  "trip",
  "holiday",
  "holidays",
]);

function words(s?: string) {
  return norm(s)
    .split(" ")
    .filter((w) => w && !stop.has(w));
}

function hasWordOverlap(a?: string, b?: string) {
  const A = new Set(words(a));
  const B = new Set(words(b));
  for (const w of A) {
    if (B.has(w)) return true;
  }
  return false;
}

function smartMatch(field?: string, query?: string) {
  const F = norm(field);
  const Q = norm(query);

  if (!Q || !F) return false;
  if (F === Q) return true;
  if (F.includes(Q) || Q.includes(F)) return true;
  if (compact(F) === compact(Q)) return true;
  if (compact(F).includes(compact(Q)) || compact(Q).includes(compact(F))) {
    return true;
  }
  if (hasWordOverlap(F, Q)) return true;

  return false;
}

function parsePipeList(value: string | null) {
  if (!value) return [];
  return value
    .split("|")
    .map((item) => item.trim())
    .filter(Boolean);
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

function packageMatchesSubthemeIntent(
  pkg: PackageCardData,
  theme: string,
  activeSubTheme: string
) {
  if (!activeSubTheme) return true;

  const intent = getSubthemeIntent(theme, activeSubTheme);

  const searchableFields = [
    pkg.title,
    pkg.route,
    ...pkg.themes,
    ...pkg.subThemes,
  ];

  const directSubthemeMatch =
    pkg.subThemes.some((st) => smartMatch(st, activeSubTheme)) ||
    smartMatch(pkg.title, activeSubTheme) ||
    smartMatch(pkg.route, activeSubTheme);

  if (directSubthemeMatch) return true;

  if (!intent) return false;

  const keywordMatch =
    intent.keywords?.some((keyword) =>
      searchableFields.some((field) => smartMatch(field, keyword))
    ) || false;

  const themeMatch =
    intent.themes?.some((mappedTheme) =>
      pkg.themes.some((pkgTheme) => smartMatch(pkgTheme, mappedTheme))
    ) || false;

  const tagMatch =
    intent.tags?.some((tag) =>
      searchableFields.some((field) => smartMatch(field, tag))
    ) || false;

  return keywordMatch || themeMatch || tagMatch;
}

export default function ThemePackagesGrid({
  selectedFilters,
  setSelectedFilters,
  activeSubTheme,
  setActiveSubTheme,
  theme,
  resetFilters,
  setResetFilters,
  onClearAll,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [sort, setSort] = useState("popular");
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(6);
  const [activePackage, setActivePackage] = useState<string | null>(null);

  const popupRef = useRef<HTMLDivElement>(null);

  const mappedThemes = useMemo(
    () => parsePipeList(searchParams.get("mappedThemes")),
    [searchParams]
  );

  const mappedSubThemes = useMemo(
    () => parsePipeList(searchParams.get("mappedSubThemes")),
    [searchParams]
  );

  const experienceTags = useMemo(
    () => parsePipeList(searchParams.get("experienceTags")),
    [searchParams]
  );

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

    setSelectedFilters([]);
    setActiveSubTheme("");
    setSort("popular");
    setSearchQuery("");
    setVisibleCount(6);
    setActivePackage(null);
  }, [resetFilters, setSelectedFilters, setActiveSubTheme]);

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

  country:
    pkg?.countries?.[0] ||
    rawPkg?.countries?.[0] ||
    "",

  continent:
    pkg?.continent ||
    rawPkg?.continent ||
    "",

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

  defaultOriginCity:
    resolveDefaultOriginCity(pkg, rawPkg),

  durationNights,
  durationDays,
};
    });
  }, []);

  const themePackages = useMemo(() => {
    return packages.filter((pkg) => {
      const byMappedTheme =
        mappedThemes.length > 0 &&
        pkg.themes.some((t) => mappedThemes.some((mt) => smartMatch(t, mt)));

      const byMappedSubTheme =
        mappedSubThemes.length > 0 &&
        (pkg.subThemes.some((st) =>
          mappedSubThemes.some((mst) => smartMatch(st, mst))
        ) ||
          mappedSubThemes.some((mst) =>
            packageMatchesSubthemeIntent(pkg, theme, mst)
          ));

      const byExperienceTags =
        experienceTags.length > 0 &&
        [pkg.title, ...pkg.themes, ...pkg.subThemes, pkg.route].some((field) =>
          experienceTags.some((tag) => smartMatch(field, tag))
        );

      const byThemePageFallback =
        pkg.themes.some((t) => smartMatch(t, theme)) ||
        pkg.subThemes.some((st) => smartMatch(st, theme)) ||
        smartMatch(pkg.title, theme);

      if (
        mappedThemes.length ||
        mappedSubThemes.length ||
        experienceTags.length
      ) {
        return byMappedTheme || byMappedSubTheme || byExperienceTags;
      }

      return byThemePageFallback;
    });
  }, [packages, mappedThemes, mappedSubThemes, experienceTags, theme]);

  const filteredPackages = useMemo(() => {
    let base = themePackages.filter((p) => {
      const subThemeMatch = packageMatchesSubthemeIntent(
        p,
        theme,
        activeSubTheme
      );

      const filterMatch =
        selectedFilters.length === 0 ||
        selectedFilters.some((f) => {
          if (smartMatch(p.continent, f)) return true;
          if (p.subThemes.some((st) => smartMatch(st, f))) return true;
          if (p.themes.some((t) => smartMatch(t, f))) return true;
          if (smartMatch(p.title, f)) return true;
          if (smartMatch(p.route, f)) return true;
          if (packageMatchesSubthemeIntent(p, theme, f)) return true;
          return false;
        });

      const searchMatch =
        !searchQuery ||
        smartMatch(p.title, searchQuery) ||
        smartMatch(p.route, searchQuery) ||
        smartMatch(p.continent, searchQuery) ||
        p.themes.some((t) => smartMatch(t, searchQuery)) ||
        p.subThemes.some((st) => smartMatch(st, searchQuery));

      return subThemeMatch && filterMatch && searchMatch;
    });

    if (sort === "price") {
      base = [...base].sort(
        (a, b) => a.withoutFlightPrice - b.withoutFlightPrice
      );
    } else if (sort === "duration") {
      base = [...base].sort((a, b) => {
        if (a.durationNights !== b.durationNights) {
          return a.durationNights - b.durationNights;
        }
        return a.durationDays - b.durationDays;
      });
    }

    return base;
  }, [themePackages, activeSubTheme, selectedFilters, sort, theme, searchQuery]);

  const visiblePackages = filteredPackages.slice(0, visibleCount);


  useEffect(() => {
    setVisibleCount(6);
  }, [searchQuery, activeSubTheme, selectedFilters, sort]);

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

  const resultCount = filteredPackages.length;

  return (
    <div className="min-w-0">
      {selectedFilters.length > 0 && (
        <div className="flex flex-nowrap lg:flex-wrap items-center gap-2 mt-2 lg:mt-4 mb-5 lg:mb-6 overflow-x-auto pb-1">
          {selectedFilters.map((filter) => (
            <button
              key={filter}
              onClick={() => {
                setSelectedFilters(selectedFilters.filter((f) => f !== filter));

                if (filter === activeSubTheme) {
                  setActiveSubTheme("");
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
const smartImage = getSmartPackageImage({
  routeId: pkg.routeId,
  title: pkg.title,
  route: pkg.route,
  country: pkg.country,
  continent: pkg.continent,
  cities: pkg.cities,
  themes: pkg.themes,
  subThemes: pkg.subThemes,
  tags: pkg.tags,
});

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
                <TPLDynamicImage
                  src={smartImage.src}
                  imageQuery={smartImage.imageQuery}
                  fallbackSrc={smartImage.fallbackSrc}
                  fallbackQuery={smartImage.fallbackQuery}
                  alt={smartImage.alt || pkg.title}
                  className="absolute inset-0 h-full w-full"
                  imgClassName="h-full w-full object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  preferDynamic={smartImage.preferDynamic}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
                <span className="absolute top-3 left-3 z-10 bg-black text-white text-xs px-3 py-1 rounded-full">
  {offerTitle || "Best Deal"}
</span>

{offerCode ? (
  <span className="absolute top-3 right-3 z-10 rounded-full bg-orange-500 px-3 py-1 text-xs font-bold text-white">
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
                          Starting from -{" "}
                          {searchParams.get("origin") || pkg.defaultOriginCity}
                        </p>
                        <p className="font-semibold text-black">With Flight</p>
                      </div>

                      <div className="text-right flex items-center gap-2 shrink-0">
                        <div>
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
