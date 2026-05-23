import { packageSeeds } from "./packageSeeds.ts";
import fs from "fs";
import path from "path";

const detailsDir = path.join(process.cwd(), "app/data/packages/details");

if (!fs.existsSync(detailsDir)) {
  fs.mkdirSync(detailsDir, { recursive: true });
}

// In files ko overwrite nahi karna
const protectedSlugs = [
  "romantic-kerala-holiday",
];

packageSeeds.forEach((pkg, index) => {
  if (protectedSlugs.includes(pkg.slug)) {
    return;
  }

  const filePath = path.join(detailsDir, `${pkg.slug}.ts`);
  const pkgId = `pkg-${String(index + 1).padStart(3, "0")}`;

  const content = `import type { PackageDetails } from "../types";

export const packageDetail: PackageDetails = {
  id: "${pkgId}",
  slug: "${pkg.slug}",

  title: "${pkg.title}",
  tagline: "${pkg.title} package",

  nights: 4,
  days: 5,

  route: ${JSON.stringify(pkg.cities)},

  media: {
    coverImage: "/demo/kerala-cover.jpg",
    gallery: [
      "/demo/kerala-cover.jpg",
      "/demo/kerala-cover.jpg",
      "/demo/kerala-cover.jpg"
    ],
    videoUrl: "https://www.youtube.com/watch?v=example"
  },

  variants: {
    withFlight: {
      label: "With Flight",
      pricePerPerson: 29999,
      inclusions: {
        flights: 1,
        hotels: 2,
        transfers: 2,
        activities: 2,
        meals: 4
      }
    },
    withoutFlight: {
      label: "Without Flight",
      pricePerPerson: 22999,
      inclusions: {
        flights: 0,
        hotels: 2,
        transfers: 2,
        activities: 2,
        meals: 4
      }
    }
  },

  highlights: [
    "Curated itinerary",
    "Handpicked stays",
    "Smooth transfers"
  ],

  itinerary: [
    {
      day: 1,
      title: "Arrival & Hotel Check-in",
      items: ["Arrival", "Transfer", "Check-in"]
    },
    {
      day: 2,
      title: "Sightseeing",
      items: ["Breakfast", "Local sightseeing"]
    },
    {
      day: 3,
      title: "Leisure Day",
      items: ["Breakfast", "Optional activities"]
    },
    {
      day: 4,
      title: "Explore More",
      items: ["Breakfast", "Free time"]
    },
    {
      day: 5,
      title: "Departure",
      items: ["Breakfast", "Check-out", "Departure transfer"]
    }
  ],

  inclusions: [
    "Hotel Stay",
    "Daily Breakfast",
    "Airport Transfers",
    "Sightseeing Tours"
  ],

  exclusions: [
    "Personal Expenses",
    "Travel Insurance"
  ],

  policies: {
    cancellation: "Standard cancellation policy will apply.",
    dateChange: "Date change policy will apply.",
    terms: "Standard terms will apply."
  }
};
`;

  fs.writeFileSync(filePath, content, "utf8");
});

console.log("Package detail files generated successfully");