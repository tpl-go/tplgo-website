export type HolidayContinentKey =
  | "asia"
  | "europe"
  | "northamerica"
  | "southamerica"
  | "africa"
  | "oceania"
  | "antarctica";

export type DestinationRegistryItem = {
  label: string;
  slug: string;
  type: "country" | "state" | "city";
  continent: HolidayContinentKey | "";
  country?: string;
  indiaGroup?: boolean;
  aliases?: string[];
};

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const CONTINENT_COUNTRY_REGISTRY: Record<
  HolidayContinentKey,
  DestinationRegistryItem[]
> = {
  asia: [
    { label: "Thailand", slug: "thailand", type: "country", continent: "asia", country: "Thailand" },
    { label: "Dubai", slug: "dubai", type: "country", continent: "asia", country: "UAE", aliases: ["uae"] },
    { label: "Singapore", slug: "singapore", type: "country", continent: "asia", country: "Singapore" },
    { label: "Malaysia", slug: "malaysia", type: "country", continent: "asia", country: "Malaysia" },
    { label: "Indonesia", slug: "indonesia", type: "country", continent: "asia", country: "Indonesia", aliases: ["bali"] },
    { label: "Vietnam", slug: "vietnam", type: "country", continent: "asia", country: "Vietnam" },
    { label: "Japan", slug: "japan", type: "country", continent: "asia", country: "Japan", aliases: ["tokyo", "kyoto"] },
    { label: "Sri Lanka", slug: "sri-lanka", type: "country", continent: "asia", country: "Sri Lanka" },
    { label: "Maldives", slug: "maldives", type: "country", continent: "asia", country: "Maldives" },
    { label: "India", slug: "india", type: "country", continent: "asia", country: "India", indiaGroup: true },
  ],
  europe: [
    { label: "Switzerland", slug: "switzerland", type: "country", continent: "europe", country: "Switzerland" },
    { label: "France", slug: "france", type: "country", continent: "europe", country: "France", aliases: ["paris"] },
    { label: "Italy", slug: "italy", type: "country", continent: "europe", country: "Italy", aliases: ["rome", "florence", "venice"] },
    { label: "Germany", slug: "germany", type: "country", continent: "europe", country: "Germany" },
    { label: "Austria", slug: "austria", type: "country", continent: "europe", country: "Austria" },
    { label: "Spain", slug: "spain", type: "country", continent: "europe", country: "Spain" },
    { label: "Netherlands", slug: "netherlands", type: "country", continent: "europe", country: "Netherlands" },
    { label: "Greece", slug: "greece", type: "country", continent: "europe", country: "Greece" },
    { label: "Turkey", slug: "turkey", type: "country", continent: "europe", country: "Turkey" },
    { label: "United Kingdom", slug: "united-kingdom", type: "country", continent: "europe", country: "United Kingdom", aliases: ["uk", "london"] },
  ],
  northamerica: [
    { label: "USA", slug: "usa", type: "country", continent: "northamerica", country: "USA", aliases: ["united states", "new york"] },
    { label: "Canada", slug: "canada", type: "country", continent: "northamerica", country: "Canada" },
    { label: "Mexico", slug: "mexico", type: "country", continent: "northamerica", country: "Mexico" },
    { label: "Costa Rica", slug: "costa-rica", type: "country", continent: "northamerica", country: "Costa Rica" },
    { label: "Jamaica", slug: "jamaica", type: "country", continent: "northamerica", country: "Jamaica" },
    { label: "Bahamas", slug: "bahamas", type: "country", continent: "northamerica", country: "Bahamas" },
    { label: "Dominican Republic", slug: "dominican-republic", type: "country", continent: "northamerica", country: "Dominican Republic" },
    { label: "Cuba", slug: "cuba", type: "country", continent: "northamerica", country: "Cuba" },
    { label: "Panama", slug: "panama", type: "country", continent: "northamerica", country: "Panama" },
    { label: "Guatemala", slug: "guatemala", type: "country", continent: "northamerica", country: "Guatemala" },
  ],
  southamerica: [
    { label: "Brazil", slug: "brazil", type: "country", continent: "southamerica", country: "Brazil" },
    { label: "Argentina", slug: "argentina", type: "country", continent: "southamerica", country: "Argentina" },
    { label: "Peru", slug: "peru", type: "country", continent: "southamerica", country: "Peru" },
    { label: "Chile", slug: "chile", type: "country", continent: "southamerica", country: "Chile" },
    { label: "Colombia", slug: "colombia", type: "country", continent: "southamerica", country: "Colombia" },
    { label: "Ecuador", slug: "ecuador", type: "country", continent: "southamerica", country: "Ecuador" },
    { label: "Bolivia", slug: "bolivia", type: "country", continent: "southamerica", country: "Bolivia" },
    { label: "Uruguay", slug: "uruguay", type: "country", continent: "southamerica", country: "Uruguay" },
    { label: "Paraguay", slug: "paraguay", type: "country", continent: "southamerica", country: "Paraguay" },
    { label: "Venezuela", slug: "venezuela", type: "country", continent: "southamerica", country: "Venezuela" },
  ],
  africa: [
    { label: "South Africa", slug: "south-africa", type: "country", continent: "africa", country: "South Africa" },
    { label: "Kenya", slug: "kenya", type: "country", continent: "africa", country: "Kenya" },
    { label: "Morocco", slug: "morocco", type: "country", continent: "africa", country: "Morocco" },
    { label: "Egypt", slug: "egypt", type: "country", continent: "africa", country: "Egypt" },
    { label: "Tanzania", slug: "tanzania", type: "country", continent: "africa", country: "Tanzania" },
    { label: "Namibia", slug: "namibia", type: "country", continent: "africa", country: "Namibia" },
    { label: "Botswana", slug: "botswana", type: "country", continent: "africa", country: "Botswana" },
    { label: "Zimbabwe", slug: "zimbabwe", type: "country", continent: "africa", country: "Zimbabwe" },
    { label: "Rwanda", slug: "rwanda", type: "country", continent: "africa", country: "Rwanda" },
    { label: "Seychelles", slug: "seychelles", type: "country", continent: "africa", country: "Seychelles" },
  ],
  oceania: [
    { label: "Australia", slug: "australia", type: "country", continent: "oceania", country: "Australia" },
    { label: "New Zealand", slug: "new-zealand", type: "country", continent: "oceania", country: "New Zealand" },
    { label: "Fiji", slug: "fiji", type: "country", continent: "oceania", country: "Fiji" },
    { label: "Papua New Guinea", slug: "papua-new-guinea", type: "country", continent: "oceania", country: "Papua New Guinea" },
    { label: "Samoa", slug: "samoa", type: "country", continent: "oceania", country: "Samoa" },
    { label: "Tonga", slug: "tonga", type: "country", continent: "oceania", country: "Tonga" },
    { label: "Vanuatu", slug: "vanuatu", type: "country", continent: "oceania", country: "Vanuatu" },
    { label: "Solomon Islands", slug: "solomon-islands", type: "country", continent: "oceania", country: "Solomon Islands" },
    { label: "Tahiti", slug: "tahiti", type: "country", continent: "oceania", country: "Tahiti" },
    { label: "Cook Islands", slug: "cook-islands", type: "country", continent: "oceania", country: "Cook Islands" },
  ],
  antarctica: [
    { label: "Antarctica Cruise", slug: "antarctica-cruise", type: "country", continent: "antarctica", country: "Antarctica Cruise" },
    { label: "South Georgia", slug: "south-georgia", type: "country", continent: "antarctica", country: "South Georgia" },
    { label: "Falkland Islands", slug: "falkland-islands", type: "country", continent: "antarctica", country: "Falkland Islands" },
    { label: "Drake Passage", slug: "drake-passage", type: "country", continent: "antarctica", country: "Drake Passage" },
    { label: "King George Island", slug: "king-george-island", type: "country", continent: "antarctica", country: "King George Island" },
    { label: "Paradise Bay", slug: "paradise-bay", type: "country", continent: "antarctica", country: "Paradise Bay" },
    { label: "Deception Island", slug: "deception-island", type: "country", continent: "antarctica", country: "Deception Island" },
    { label: "Lemaire Channel", slug: "lemaire-channel", type: "country", continent: "antarctica", country: "Lemaire Channel" },
    { label: "Elephant Island", slug: "elephant-island", type: "country", continent: "antarctica", country: "Elephant Island" },
    { label: "Ross Sea", slug: "ross-sea", type: "country", continent: "antarctica", country: "Ross Sea" },
  ],
};

export const POPULAR_INTERNATIONAL_DESTINATIONS: DestinationRegistryItem[] = [
  { label: "Bali", slug: "bali", type: "country", continent: "asia", country: "Indonesia", aliases: ["indonesia"] },
  { label: "Thailand", slug: "thailand", type: "country", continent: "asia", country: "Thailand" },
  { label: "Dubai", slug: "dubai", type: "country", continent: "asia", country: "UAE", aliases: ["uae"] },
  { label: "London", slug: "london", type: "country", continent: "europe", country: "United Kingdom", aliases: ["uk"] },
  { label: "Paris", slug: "paris", type: "country", continent: "europe", country: "France" },
];

export const POPULAR_INDIA_STATES: DestinationRegistryItem[] = [
  { label: "Rajasthan", slug: "rajasthan", type: "state", continent: "asia", country: "India", indiaGroup: true, aliases: ["jaipur", "udaipur", "jodhpur", "jaisalmer"] },
  { label: "Goa", slug: "goa", type: "state", continent: "asia", country: "India", indiaGroup: true, aliases: ["north goa", "south goa"] },
  { label: "Kashmir", slug: "kashmir", type: "state", continent: "asia", country: "India", indiaGroup: true, aliases: ["srinagar", "gulmarg", "pahalgam"] },
  { label: "Kerala", slug: "kerala", type: "state", continent: "asia", country: "India", indiaGroup: true, aliases: ["kochi", "munnar", "alleppey", "kovalam", "varkala"] },
  { label: "Himachal Pradesh", slug: "himachal-pradesh", type: "state", continent: "asia", country: "India", indiaGroup: true, aliases: ["manali", "shimla", "kasol", "bir"] },
  { label: "Uttarakhand", slug: "uttarakhand", type: "state", continent: "asia", country: "India", indiaGroup: true, aliases: ["rishikesh", "auli", "joshimath", "nainital", "mussoorie"] },
  { label: "Ladakh", slug: "ladakh", type: "state", continent: "asia", country: "India", indiaGroup: true, aliases: ["leh", "pangong", "nubra"] },
  { label: "Sikkim", slug: "sikkim", type: "state", continent: "asia", country: "India", indiaGroup: true, aliases: ["gangtok", "pelling"] },
];

function normalize(value?: string) {
  return (value || "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]/g, "");
}

const ALL_CONTINENT_DESTINATIONS = Object.values(CONTINENT_COUNTRY_REGISTRY).flat();

export function findDestinationInRegistry(input?: string) {
  const needle = normalize(input);
  if (!needle) return null;

  const allItems = [
    ...ALL_CONTINENT_DESTINATIONS,
    ...POPULAR_INTERNATIONAL_DESTINATIONS,
    ...POPULAR_INDIA_STATES,
  ];

  for (const item of allItems) {
    const directPool = [item.label, item.country || "", item.slug]
      .map(normalize)
      .filter(Boolean);

    if (directPool.some((value) => value === needle || value.includes(needle) || needle.includes(value))) {
      return item;
    }

    if (item.aliases?.some((alias) => {
      const a = normalize(alias);
      return a === needle || a.includes(needle) || needle.includes(a);
    })) {
      return item;
    }
  }

  return null;
}

export function findContinentCountryItem(
  continent: HolidayContinentKey,
  input?: string
) {
  const needle = normalize(input);
  if (!needle) return null;

  const items = CONTINENT_COUNTRY_REGISTRY[continent] || [];

  return (
    items.find((item) => {
      const directPool = [item.label, item.country || "", item.slug]
        .map(normalize)
        .filter(Boolean);

      if (directPool.some((value) => value === needle || value.includes(needle) || needle.includes(value))) {
        return true;
      }

      return item.aliases?.some((alias) => {
        const a = normalize(alias);
        return a === needle || a.includes(needle) || needle.includes(a);
      });
    }) || null
  );
}

export function getContinentCountries(continent: HolidayContinentKey) {
  return CONTINENT_COUNTRY_REGISTRY[continent] || [];
}

export function getPopularInternationalDestinations() {
  return POPULAR_INTERNATIONAL_DESTINATIONS;
}

export function getPopularIndiaStates() {
  return POPULAR_INDIA_STATES;
}

export function buildPopularRoute(item: DestinationRegistryItem) {
  if (item.country === "India" || item.indiaGroup) {
    return "/popular/india";
  }

  return `/popular/${item.slug}`;
}

export function buildContinentRoute(item: DestinationRegistryItem) {
  return item.continent ? `/continent/${item.continent}` : "/continent/asia";
}

export { slugify };