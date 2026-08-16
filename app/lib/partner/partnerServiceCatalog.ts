export type PartnerServiceCategoryId =
  | "stay-hospitality"
  | "transport-mobility"
  | "tours-experiences"
  | "special-tourism"
  | "commerce"
  | "destination-wedding"
  | "shooting-film-ott";

export type PartnerServiceDefinition = {
  id: string;
  label: string;
  keywords: string[];
};

export type PartnerServiceCategory = {
  id: PartnerServiceCategoryId;
  title: string;
  description: string;
  services: PartnerServiceDefinition[];
};

export const partnerServiceCatalog: PartnerServiceCategory[] = [
  {
    id: "stay-hospitality",
    title: "Stay & Hospitality",
    description: "Accommodation and stay experiences for TPL travellers.",
    services: [
      service("hotels-resorts", "Hotels & Resorts", ["hotel", "resort", "stay", "wedding hotel"]),
      service("homestays", "Homestays", ["home stay", "local stay"]),
      service("villas-apartments", "Villas / Apartments", ["villa", "apartment", "serviced apartment"]),
      service("hostels-guest-houses", "Hostels / Guest Houses", ["hostel", "guest house"]),
      service("rural-agro-stays", "Rural / Agro Stays", ["rural", "agro", "farm stay"]),
    ],
  },
  {
    id: "transport-mobility",
    title: "Transport & Mobility",
    description: "Point-to-point, rental, transfer, and local mobility services.",
    services: [
      service("cab-taxi", "Cab / Taxi", ["cab", "taxi", "car"]),
      service("self-drive-car-rental", "Self-drive / Car Rental", ["self drive", "car rental"]),
      service("bike-rental", "Bike Rental", ["bike", "scooter", "rental"]),
      service("bus-coach", "Bus / Coach", ["bus", "coach"]),
      service("local-transport", "Local Transport", ["local mobility", "transport"]),
      service("shikara", "Shikara", ["kashmir", "boat", "local transport"]),
      service("helicopter", "Helicopter", ["heli", "helicopter"]),
      service("airport-station-transfers", "Airport / Station Transfers", ["airport", "station", "transfer"]),
    ],
  },
  {
    id: "tours-experiences",
    title: "Tours & Experiences",
    description: "Activities, guided experiences, and travel operations.",
    services: [
      service("activities", "Activities", ["activity", "things to do"]),
      service("adventure", "Adventure", ["trek", "rafting", "adventure"]),
      service("sightseeing", "Sightseeing", ["tour", "city tour"]),
      service("local-experiences", "Local Experiences", ["local life", "experience"]),
      service("guides", "Guides", ["guide", "guided"]),
      service("tour-operators", "Tour Operators", ["operator", "tour package"]),
      service("travel-agency-dmc", "Travel Agency / DMC", ["agency", "dmc", "destination management"]),
    ],
  },
  {
    id: "special-tourism",
    title: "Special Tourism",
    description: "Theme-led travel categories aligned with TPL destination programs.",
    services: [
      service("rural-agro-tourism", "Rural / Agro Tourism", ["rural", "agro", "village"]),
      service("eco-tourism", "Eco Tourism", ["eco", "nature", "sustainable"]),
      service("wellness-spa", "Wellness / Spa", ["wellness", "spa", "retreat"]),
      service("medical-tourism", "Medical Tourism", ["medical", "healthcare", "treatment"]),
    ],
  },
  {
    id: "commerce",
    title: "Commerce",
    description: "Sell travel-relevant products through TPL commerce surfaces.",
    services: [
      service("marketplace-seller", "Marketplace Seller", ["marketplace", "seller", "commerce", "shop"]),
    ],
  },
  {
    id: "destination-wedding",
    title: "Destination Wedding",
    description: "A first-class partner category for complete wedding travel operations.",
    services: [
      service("wedding-venues", "Venues", ["wedding", "venue", "destination wedding"]),
      service("wedding-hotels-resorts", "Wedding Hotels / Resorts", ["wedding hotel", "resort", "stay"]),
      service("wedding-planners", "Wedding Planners", ["wedding planner", "planning"]),
      service("decorators", "Decorators", ["decor", "decoration"]),
      service("catering", "Catering", ["food", "caterer"]),
      service("photography-videography", "Photography / Videography", ["photo", "video", "photography"]),
      service("makeup-styling", "Makeup / Styling", ["makeup", "styling"]),
      service("artists-entertainment", "Artists / Entertainment", ["artist", "entertainment", "music"]),
      service("transport-logistics", "Transport / Logistics", ["transport", "logistics", "cab", "bus"]),
    ],
  },
  {
    id: "shooting-film-ott",
    title: "Shooting / Film / OTT",
    description: "Production support and location services for shooting and OTT teams.",
    services: [
      service("shooting-locations", "Shooting Locations", ["shoot", "film", "ott", "location"]),
      service("location-facilitation", "Location Facilitation", ["facilitation", "recce"]),
      service("permissions-support", "Permissions Support", ["permission", "permits"]),
      service("local-crew", "Local Crew", ["crew", "production crew"]),
      service("equipment-production-support", "Equipment / Production Support", ["equipment", "gear"]),
      service("shooting-accommodation", "Accommodation", ["hotel", "stay", "crew accommodation"]),
      service("shooting-transport", "Transport", ["transport", "cab", "logistics"]),
      service("production-services", "Production Services", ["production", "service"]),
    ],
  },
];

export function getAllPartnerServices(catalog = partnerServiceCatalog): PartnerServiceDefinition[] {
  return catalog.flatMap((category) => category.services);
}

export function findPartnerService(serviceId: string): PartnerServiceDefinition | undefined {
  return getAllPartnerServices().find((serviceItem) => serviceItem.id === serviceId);
}

export function filterPartnerServiceCatalog(query: string, catalog = partnerServiceCatalog): PartnerServiceCategory[] {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return catalog;

  return catalog
    .map((category) => {
      const searchableCategory = normalizeSearchText(`${category.title} ${category.description}`);
      const categoryMatches = searchableCategory.includes(normalizedQuery);
      const services = category.services.filter((serviceItem) => {
        const haystack = normalizeSearchText(`${serviceItem.label} ${serviceItem.keywords.join(" ")}`);
        return categoryMatches || haystack.includes(normalizedQuery);
      });
      return { ...category, services };
    })
    .filter((category) => category.services.length > 0);
}

export function normalizeSearchText(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function service(id: string, label: string, keywords: string[]): PartnerServiceDefinition {
  return { id, label, keywords };
}
