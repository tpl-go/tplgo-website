import type { PackageDetails } from "../types";

export const packageDetail: PackageDetails = {
  id: "pkg-001",
  slug: "romantic-kerala-holiday",

  title: "Romantic Kerala Holiday",
  tagline: "A romantic Kerala escape with hills, wildlife, and backwaters.",

  nights: 4,
  days: 5,

  route: ["2N Munnar", "1N Thekkady", "1N Alleppey"],

  media: {
    coverImage: "/demo/kerala-cover.jpg",
    gallery: [
      "/demo/kerala-cover.jpg",
      "/demo/kerala-cover.jpg",
      "/demo/kerala-cover.jpg",
    ],
    videoUrl: "https://www.youtube.com/watch?v=example",
  },

  variants: {
    withFlight: {
      label: "With Flight",
      pricePerPerson: 54502,
      inclusions: {
        flights: 1,
        hotels: 3,
        transfers: 5,
        activities: 5,
        meals: 5,
      },
    },
    withoutFlight: {
      label: "Without Flight",
      pricePerPerson: 41502,
      inclusions: {
        flights: 0,
        hotels: 3,
        transfers: 5,
        activities: 5,
        meals: 5,
      },
    },
  },

  highlights: [
    "Tea Garden Views in Munnar",
    "Wildlife and Spice Trails in Thekkady",
    "Houseboat Experience in Alleppey",
  ],

  itinerary: [
    {
      day: 1,
      title: "Arrival in Kochi → Munnar",
      items: [
        "Arrival at Kochi",
        "Private transfer to Munnar",
        "Hotel check-in",
        "Leisure evening",
        "Dinner",
      ],
    },
    {
      day: 2,
      title: "Munnar Sightseeing",
      items: [
        "Breakfast",
        "Tea garden visit",
        "Local sightseeing",
        "View points exploration",
        "Dinner",
      ],
    },
    {
      day: 3,
      title: "Transfer to Thekkady",
      items: [
        "Breakfast",
        "Check-out from Munnar",
        "Transfer to Thekkady",
        "Spice plantation visit",
        "Dinner",
      ],
    },
    {
      day: 4,
      title: "Transfer to Alleppey",
      items: [
        "Breakfast",
        "Transfer to Alleppey",
        "Backwater experience",
        "Hotel/houseboat stay",
        "Dinner",
      ],
    },
    {
      day: 5,
      title: "Departure",
      items: [
        "Breakfast",
        "Check-out",
        "Departure transfer",
        "Tour ends",
      ],
    },
  ],

  inclusions: [
    "Hotel accommodation",
    "Selected meals",
    "Transfers",
    "Sightseeing as per itinerary",
  ],

  exclusions: [
    "Personal expenses",
    "Anything not mentioned in inclusions",
    "Optional activities",
  ],

  policies: {
    cancellation: "Cancellation policy will be updated later.",
    dateChange: "Date change policy will be updated later.",
    terms: "Standard terms will be updated later.",
  },
};