import { packageIndex } from "./index";
import { packageDetailsMap } from "./details";

export function resolvePackageByRouteId(packageId: string) {
  const formattedId = `pkg-${String(packageId).padStart(3, "0")}`;

  const matchedPackage = packageIndex.find((item) => item.id === formattedId);

  if (!matchedPackage) return null;

  const detail =
    packageDetailsMap[
      matchedPackage.detailFile as keyof typeof packageDetailsMap
    ];

  if (!detail) return null;

  return {
    ...matchedPackage,
    ...detail,
  };
}

export function resolvePackageBySlug(slug: string) {
  const matchedPackage = packageIndex.find((item) => item.slug === slug);

  if (!matchedPackage) return null;

  const detail =
    packageDetailsMap[
      matchedPackage.detailFile as keyof typeof packageDetailsMap
    ];

  if (!detail) return null;

  return {
    ...matchedPackage,
    ...detail,
  };
}