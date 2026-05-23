import type { RelatedPackage } from "./travelGuideTypes";
import { slugifyTravelGuide } from "./travelGuideUtils";

import {
  buildHolidayResolvedUrl,
  resolveHolidaySearchFromSeeds,
} from "@/app/lib/holidays/resolveHolidaySearchFromSeeds";

function buildTodayPlus30Date() {
  const date = new Date();
  date.setDate(date.getDate() + 30);

  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function resolveRelatedPackageHref(pkg: RelatedPackage) {
  if (pkg.href) return pkg.href;

  const resolved = resolveHolidaySearchFromSeeds({
    originCity: "Delhi",
    toCity: pkg.linkedDestination || "",
    departureDate: buildTodayPlus30Date(),
    adults: 2,
    children: 0,
    rooms: 1,
    selectedTheme: pkg.linkedTheme || "",
    selectedSubTheme: pkg.linkedSubTheme || "",
    filters: {
      durationBucket: "",
      flightPreference: "",
      budgetBucket: "",
    },
  });

  const baseUrl = buildHolidayResolvedUrl(resolved);

  if (pkg.linkedTheme && pkg.linkedSubTheme) {
    const subSlug = slugifyTravelGuide(pkg.linkedSubTheme);

    const separator = baseUrl.includes("?") ? "&" : "?";

    return `${baseUrl}${separator}sub=${subSlug}`;
  }

  return baseUrl;
}