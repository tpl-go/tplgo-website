import { themeImageQueryMap } from "@/app/lib/images/imageQueryMaps";

export const themeImageQueries = themeImageQueryMap;

export function getThemeImageQuery(
  themeSlug?: string | null,
  fallbackName?: string | null
) {
  const slug = String(themeSlug || "").trim().toLowerCase();

  return (
    themeImageQueries[slug] ||
    themeImageQueries[slug.replace(/\s+/g, "-")] ||
    `${String(fallbackName || slug || "travel").trim()} travel experience india`
  );
}
