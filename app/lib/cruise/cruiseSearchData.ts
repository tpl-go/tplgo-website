import {
  CruiseDestination,
  CruiseDurationOption,
  CruisePort,
} from "./cruiseTypes";

export const cruiseDestinations: CruiseDestination[] = [
  {
    id: "goa",
    label: "Goa",
    type: "destination",
    countryCode: "IN",
    popular: true,
    keywords: ["india", "goa cruise", "domestic"],
    description: "Domestic India cruise destination",
  },
  {
    id: "dubai",
    label: "Dubai",
    type: "destination",
    countryCode: "AE",
    popular: true,
    keywords: ["uae", "arabian gulf"],
    description: "Middle East cruise destination",
  },
  {
    id: "singapore",
    label: "Singapore",
    type: "destination",
    countryCode: "SG",
    popular: true,
    keywords: ["asia", "southeast asia"],
    description: "Asia cruise destination",
  },
  {
    id: "mediterranean",
    label: "Mediterranean",
    type: "region",
    popular: true,
    keywords: ["europe cruise", "med"],
    description: "Europe regional cruise route",
  },
  {
    id: "caribbean",
    label: "Caribbean",
    type: "region",
    popular: true,
    keywords: ["bahamas", "west indies"],
    description: "Caribbean regional cruise route",
  },
];

export const cruisePorts: CruisePort[] = [
  {
    id: "mumbai",
    label: "Mumbai",
    countryCode: "IN",
    destinationIds: ["goa"],
    popular: true,
    keywords: ["bombay"],
  },
  {
    id: "goa-port",
    label: "Goa",
    countryCode: "IN",
    destinationIds: ["goa"],
    popular: true,
  },
  {
    id: "dubai-port",
    label: "Dubai",
    countryCode: "AE",
    destinationIds: ["dubai"],
    popular: true,
  },
  {
    id: "singapore-port",
    label: "Singapore",
    countryCode: "SG",
    destinationIds: ["singapore"],
    popular: true,
  },
  {
    id: "barcelona",
    label: "Barcelona",
    countryCode: "ES",
    regionIds: ["mediterranean"],
    popular: true,
  },
  {
    id: "miami",
    label: "Miami",
    countryCode: "US",
    regionIds: ["caribbean"],
    popular: true,
  },
];

export const cruiseDurations: CruiseDurationOption[] = [
  { id: "any", label: "Any Duration" },
  { id: "2-3", label: "2–3 Nights", minNights: 2, maxNights: 3 },
  { id: "4-6", label: "4–6 Nights", minNights: 4, maxNights: 6 },
  { id: "7-9", label: "7–9 Nights", minNights: 7, maxNights: 9 },
  { id: "10plus", label: "10+ Nights", minNights: 10, maxNights: null },
];