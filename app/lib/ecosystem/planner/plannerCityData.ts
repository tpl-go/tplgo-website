export type TiyaMockCity = {
  name: string;
  region: string;
  routeWeight: number;
  scenicBias: number;
  comfortBias: number;
};

export const tiyaMockCities: TiyaMockCity[] = [
  { name: "Delhi", region: "North India", routeWeight: 4, scenicBias: 48, comfortBias: 78 },
  { name: "Jaipur", region: "Rajasthan", routeWeight: 7, scenicBias: 68, comfortBias: 74 },
  { name: "Mumbai", region: "Maharashtra", routeWeight: 12, scenicBias: 58, comfortBias: 82 },
  { name: "Manali", region: "Himachal", routeWeight: 10, scenicBias: 92, comfortBias: 66 },
  { name: "Leh", region: "Ladakh", routeWeight: 16, scenicBias: 96, comfortBias: 52 },
  { name: "Srinagar", region: "Kashmir", routeWeight: 14, scenicBias: 94, comfortBias: 64 },
  { name: "Kerala", region: "South India", routeWeight: 18, scenicBias: 88, comfortBias: 82 },
  { name: "Goa", region: "West Coast", routeWeight: 13, scenicBias: 82, comfortBias: 84 },
  { name: "Udaipur", region: "Rajasthan", routeWeight: 9, scenicBias: 84, comfortBias: 76 },
  { name: "Jodhpur", region: "Rajasthan", routeWeight: 10, scenicBias: 76, comfortBias: 70 },
  { name: "Varanasi", region: "Uttar Pradesh", routeWeight: 8, scenicBias: 72, comfortBias: 66 },
  { name: "Rishikesh", region: "Uttarakhand", routeWeight: 6, scenicBias: 90, comfortBias: 68 },
  { name: "Haridwar", region: "Uttarakhand", routeWeight: 6, scenicBias: 78, comfortBias: 70 },
  { name: "Shimla", region: "Himachal", routeWeight: 8, scenicBias: 86, comfortBias: 72 },
  { name: "Darjeeling", region: "West Bengal", routeWeight: 15, scenicBias: 90, comfortBias: 70 },
  { name: "Gangtok", region: "Sikkim", routeWeight: 16, scenicBias: 92, comfortBias: 68 },
  { name: "Agra", region: "Uttar Pradesh", routeWeight: 5, scenicBias: 62, comfortBias: 74 },
  { name: "Amritsar", region: "Punjab", routeWeight: 7, scenicBias: 68, comfortBias: 76 },
  { name: "Ahmedabad", region: "Gujarat", routeWeight: 11, scenicBias: 58, comfortBias: 78 },
  { name: "Bengaluru", region: "Karnataka", routeWeight: 15, scenicBias: 66, comfortBias: 84 },
  { name: "Chennai", region: "Tamil Nadu", routeWeight: 17, scenicBias: 62, comfortBias: 80 },
  { name: "Hyderabad", region: "Telangana", routeWeight: 14, scenicBias: 60, comfortBias: 82 },
  { name: "Pune", region: "Maharashtra", routeWeight: 12, scenicBias: 64, comfortBias: 80 },
  { name: "Kolkata", region: "West Bengal", routeWeight: 14, scenicBias: 66, comfortBias: 78 },
];

export function findTiyaMockCity(value: string) {
  const normalizedValue = value.trim().toLowerCase();
  return tiyaMockCities.find(
    (city) => city.name.toLowerCase() === normalizedValue
  );
}

export function getTiyaCitySuggestions(value: string) {
  const query = value.trim().toLowerCase();

  if (!query) return tiyaMockCities.slice(0, 8);

  return tiyaMockCities
    .filter(
      (city) =>
        city.name.toLowerCase().includes(query) ||
        city.region.toLowerCase().includes(query)
    )
    .slice(0, 8);
}

export function getCustomCityRouteProfile(value: string): TiyaMockCity {
  const knownCity = findTiyaMockCity(value);

  if (knownCity) return knownCity;

  const cleanValue = value.trim() || "Custom place";
  const seed = cleanValue
    .toLowerCase()
    .split("")
    .reduce((sum, letter) => sum + letter.charCodeAt(0), 0);

  return {
    name: cleanValue,
    region: "Custom route",
    routeWeight: 5 + (seed % 13),
    scenicBias: 58 + (seed % 32),
    comfortBias: 64 + (seed % 24),
  };
}
