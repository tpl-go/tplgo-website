import type {
  CabinNationalityOption,
  CruiseCabinType,
  CruiseDayPlanItem,
} from "./cruiseDetailTypes";

export const cruiseNationalityOptions: CabinNationalityOption[] = [
  { id: "indian", label: "Indian" },
  { id: "foreign", label: "Foreign National" },
  { id: "nri", label: "NRI" },
];

export const cruiseCabinTypesSeed: CruiseCabinType[] = [
  {
    id: "mini-suite",
    code: "MS",
    name: "Mini Suite",
    shortDescription: "Unwind in your luxurious stateroom with balcony views.",
    fullDescription:
      "Unwind in your luxurious stateroom with a private balcony, spacious interiors, and premium comfort for your sailing journey.",
    maxAdults: 3,
    maxChildren: 2,
    maxInfants: 1,
    maxGuests: 4,
    deckInfo: "Decks 7, 8, 9",
    pricePerPerson: 68300,
    images: [
      { id: "ms-1", url: "/cruise/cabins/mini-suite-1.jpg", alt: "Mini Suite 1" },
      { id: "ms-2", url: "/cruise/cabins/mini-suite-2.jpg", alt: "Mini Suite 2" },
      { id: "ms-3", url: "/cruise/cabins/mini-suite-3.jpg", alt: "Mini Suite 3" },
    ],
    amenities: [
      { id: "bed", label: "Twin beds convertible to queen" },
      { id: "sofa", label: "Sofa sitting area" },
      { id: "balcony", label: "Private balcony" },
      { id: "tv", label: "Television" },
      { id: "phone", label: "Telephone" },
    ],
    tags: ["Balcony", "Premium"],
  },
  {
    id: "interior-standard",
    code: "IS",
    name: "Interior Standard",
    shortDescription: "Welcome to your cozy haven onboard.",
    fullDescription:
      "A smart and comfortable interior stateroom designed for restful nights and practical sailing stays.",
    maxAdults: 4,
    maxChildren: 2,
    maxInfants: 1,
    maxGuests: 4,
    deckInfo: "Decks 5, 6, 7",
    pricePerPerson: 52900,
    images: [
      { id: "is-1", url: "/cruise/cabins/interior-standard-1.jpg", alt: "Interior Standard 1" },
      { id: "is-2", url: "/cruise/cabins/interior-standard-2.jpg", alt: "Interior Standard 2" },
    ],
    amenities: [
      { id: "bed", label: "Twin beds convertible to queen" },
      { id: "storage", label: "Wardrobe storage" },
      { id: "tv", label: "Television" },
      { id: "bath", label: "Private bathroom" },
    ],
    tags: ["Interior", "Value"],
  },
];

export const cruiseSailingPlanSeed: CruiseDayPlanItem[] = [
  {
    day: 1,
    title: "Dubai Embarkation",
    description:
      "Board your cruise from Dubai. Complete check-in, explore the ship, enjoy welcome experiences, and begin your sailing journey.",
  },
  {
    day: 2,
    title: "Cruising Day 1",
    description:
      "Enjoy onboard dining, entertainment, sea views, activities, deck experiences, and leisure facilities throughout the day.",
  },
  {
    day: 3,
    title: "Cruising Day 2",
    description:
      "Experience specialty dining, live performances, recreation zones, and relaxation spaces onboard.",
  },
  {
    day: 4,
    title: "Port Experience",
    description:
      "Disembark for selected port activities, shore exploration, and return onboard for evening sailing.",
  },
];