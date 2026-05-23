import type { PackageActivityOption } from "./packageSelectionTypes";

type Params = {
  packageSlug?: string;
  city?: string;
  theme?: unknown;
};

function safeLower(value: unknown): string {
  if (typeof value === "string") return value.toLowerCase();

  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === "string" ? item : ""))
      .join(" ")
      .toLowerCase();
  }

  return "";
}

export function getPackageActivityOptions(
  params?: Params
): PackageActivityOption[] {
  const slug = safeLower(params?.packageSlug);
  const city = safeLower(params?.city);
  const theme = safeLower(params?.theme);

  // Historical / heritage style packages
  if (
    slug.includes("heritage") ||
    slug.includes("monument") ||
    theme.includes("heritage") ||
    city.includes("jaipur") ||
    city.includes("agra") ||
    city.includes("delhi")
  ) {
    return [
      {
        id: "act-standard-city-tour",
        title: "Standard City Sightseeing",
        description: "Core heritage sightseeing as per package schedule",
        fareDiff: 0,
        included: true,
        category: "Sightseeing",
      },
      {
        id: "act-private-heritage-walk",
        title: "Private Heritage Walk with Local Expert",
        description:
          "Guided storytelling experience through key historical areas",
        fareDiff: 1800,
        included: false,
        category: "Signature Experience",
      },
      {
        id: "act-monument-guide",
        title: "Monument Guide + Priority Entry",
        description:
          "Licensed guide support with faster monument access where available",
        fareDiff: 2500,
        included: false,
        category: "Premium Upgrade",
      },
      {
        id: "act-light-sound-show",
        title: "Evening Light & Sound Show",
        description:
          "Add an immersive cultural evening experience to your itinerary",
        fareDiff: 1200,
        included: false,
        category: "Evening Experience",
      },
      {
        id: "act-royal-dining",
        title: "Royal Dining Experience",
        description:
          "Curated premium dinner in a heritage-style setting",
        fareDiff: 3200,
        included: false,
        category: "Premium Upgrade",
      },
    ];
  }

  // Kerala / nature / leisure style
  if (
    slug.includes("kerala") ||
    theme.includes("nature") ||
    city.includes("kochi") ||
    city.includes("munnar") ||
    city.includes("alleppey")
  ) {
    return [
      {
        id: "act-standard-local-tour",
        title: "Standard Local Sightseeing",
        description: "Included sightseeing as per package schedule",
        fareDiff: 0,
        included: true,
        category: "Sightseeing",
      },
      {
        id: "act-backwater-cruise",
        title: "Premium Backwater Cruise",
        description: "Extended scenic backwater experience",
        fareDiff: 2200,
        included: false,
        category: "Signature Experience",
      },
      {
        id: "act-kathakali-show",
        title: "Cultural Performance Evening",
        description: "Curated traditional performance experience",
        fareDiff: 900,
        included: false,
        category: "Cultural Experience",
      },
      {
        id: "act-ayurvedic-session",
        title: "Ayurvedic Wellness Session",
        description: "Relaxation and wellness add-on",
        fareDiff: 2800,
        included: false,
        category: "Wellness",
      },
    ];
  }

  // Default generic set
  return [
    {
      id: "act-standard",
      title: "Standard Included Sightseeing",
      description: "Included activity and sightseeing coverage",
      fareDiff: 0,
      included: true,
      category: "Sightseeing",
    },
    {
      id: "act-private-tour",
      title: "Private Guided Tour",
      description: "More personalized and flexible exploration",
      fareDiff: 2000,
      included: false,
      category: "Premium Upgrade",
    },
    {
      id: "act-evening-experience",
      title: "Evening Experience Add-on",
      description: "Add a curated cultural or entertainment activity",
      fareDiff: 1500,
      included: false,
      category: "Experience",
    },
    {
      id: "act-premium-experience",
      title: "Premium Signature Experience",
      description: "Unique curated premium highlight for this destination",
      fareDiff: 3500,
      included: false,
      category: "Signature Experience",
    },
  ];
}