import { packageSeeds } from "./packageSeeds.ts";
import fs from "fs";
import path from "path";

const detailsDir = path.join(process.cwd(), "app/data/packages/details");

if (!fs.existsSync(detailsDir)) {
  fs.mkdirSync(detailsDir, { recursive: true });
}

packageSeeds.forEach((pkg) => {
  const filePath = path.join(detailsDir, `${pkg.slug}.ts`);

  const content = `export const packageDetail = {
  slug: "${pkg.slug}",
  days: 5,
  nights: 4,
  price: 29999,
  rating: 4.5,

  itinerary: [
    { day: 1, title: "Arrival & Hotel Check-in" },
    { day: 2, title: "City Sightseeing" },
    { day: 3, title: "Local Experiences" },
    { day: 4, title: "Leisure / Optional Tours" },
    { day: 5, title: "Departure" }
  ],

  inclusions: [
    "Hotel Stay",
    "Daily Breakfast",
    "Airport Transfers",
    "Sightseeing Tours"
  ],

  exclusions: [
    "Flights",
    "Personal Expenses",
    "Travel Insurance"
  ]
};
`;

  fs.writeFileSync(filePath, content, "utf8");
});

console.log("Package detail files generated successfully");