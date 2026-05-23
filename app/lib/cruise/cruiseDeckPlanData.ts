import type { CruiseDeckPlan } from "./cruiseDetailTypes";

export const cruiseDeckPlansSeed: CruiseDeckPlan[] = [
  {
    id: "deck-20",
    deckNumber: "20",
    title: "Deck 20",
    image: "/cruise/deck-plans/deck-20.jpg",
    legends: [
      "Elevator",
      "Wheelchair accessible cabin",
      "Connecting cabins",
      "Solid wall balcony",
      "Green marker = Available cabin",
      "Red marker = Booked cabin",
      "Gray marker = Blocked cabin",
    ],
    description: "Upper deck featuring premium access and signature areas.",
    selectionAvailable: false,
    cabins: [],
  },
  {
    id: "deck-18",
    deckNumber: "18",
    title: "Deck 18",
    image: "/cruise/deck-plans/deck-18.jpg",
    legends: [
      "Elevator",
      "Wheelchair accessible cabin",
      "Connecting cabins",
      "Green marker = Available cabin",
      "Red marker = Booked cabin",
      "Gray marker = Blocked cabin",
    ],
    description: "Mid-upper deck with recreation and accommodation mix.",
    selectionAvailable: false,
    cabins: [],
  },
];