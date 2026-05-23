import { packageSeeds } from "./packageSeeds";

export type Package = {
  id: string;
  slug: string;
  title: string;
  shortTitle: string;
  continent: string;
  countries: string[];
  cities: string[];
  theme: string[];
  subThemes: string[];
  nights: number;
  days: number;
  startingPrice: number;
  currency: string;
  image: string;
  tags?: string[];
  source: "database" | "api";
  detailFile: string;
};

export const packages: Package[] = packageSeeds.map((p, index) => ({
  id: `pkg-${String(index + 1).padStart(3, "0")}`,
  slug: p.slug,
  title: p.title,
  shortTitle: p.title,
  continent: p.continent,
  countries: [p.country],
  cities: p.cities,
  theme: [p.theme],
  subThemes: p.subTheme ? [p.subTheme] : [],
  nights: 4,
  days: 5,
  startingPrice: 29999,
  currency: "INR",
  image: "/demo/kerala-cover.jpg",
  tags: [p.theme, p.continent, p.country, ...p.cities],
  source: "database",
  detailFile: p.slug,
}));

export const packageIndex = packages;

export function getPackageBySlug(slug: string) {
  return packages.find((pkg) => pkg.slug === slug);
}

export function getPackagesByTheme(theme: string) {
  return packages.filter((pkg) => pkg.theme.includes(theme));
}

export function getPackagesByContinent(continent: string) {
  return packages.filter((pkg) => pkg.continent === continent);
}

export function getPackagesByCountry(country: string) {
  return packages.filter((pkg) => pkg.countries.includes(country));
}