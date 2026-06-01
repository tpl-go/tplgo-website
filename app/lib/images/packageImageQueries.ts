import {
  getSmartContinentBannerImage,
  getSmartDestinationImage,
  getSmartPackageImage,
} from "@/app/lib/images/smartPackageImageResolver";

type PackageImageContext = {
  imageQuery?: string;
  imageUrl?: string;
  coverImage?: string;
  images?: string[];
  id?: string | number;
  slug?: string;
  routeId?: string;
  title?: string;
  route?: string;
  country?: string;
  continent?: string;
  cities?: string[];
  themes?: string[];
  subThemes?: string[];
  tags?: string[];
  category?: string;
};

export function getContinentImageQuery(continent?: string, label?: string) {
  return (
    getSmartContinentBannerImage(continent).imageQuery ||
    `${label || continent || "continent"} scenic travel`
  );
}

export function getIndiaImageQuery(state?: string, label?: string) {
  const resolved = getSmartDestinationImage({
    title: label || state || "India",
    route: state,
    country: "India",
    cities: state ? [state] : [],
  });

  return resolved.imageQuery || `${label || state || "india"} travel india scenic`;
}

export function getGroupImageQuery(group?: string, label?: string) {
  const resolved = getSmartDestinationImage({
    title: label || group || "Group Tour",
    route: group,
    category: "group tour",
    tags: group ? [group] : [],
  });

  return resolved.imageQuery || `${label || group || "group tour"} group travel india`;
}

export function getPackageFallbackImageQuery(context: PackageImageContext) {
  return getSmartPackageImage(context).fallbackQuery || "";
}

export function getPackageImageQuery(context: PackageImageContext) {
  return getSmartPackageImage(context).imageQuery || "";
}
