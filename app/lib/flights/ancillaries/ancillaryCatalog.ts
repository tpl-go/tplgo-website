import { FlightAncillaryCatalog } from "./ancillaryTypes";

export const FLIGHT_ANCILLARY_CATALOG: FlightAncillaryCatalog = {
  seats: [
    { seatCode: "1A", price: 800, type: "premium", available: true },
    { seatCode: "1B", price: 800, type: "premium", available: true },
    { seatCode: "1C", price: 800, type: "premium", available: true },
    { seatCode: "1D", price: 800, type: "premium", available: true },
    { seatCode: "1E", price: 800, type: "premium", available: true },
    { seatCode: "1F", price: 800, type: "premium", available: true },

    { seatCode: "2A", price: 500, type: "regular", available: true },
    { seatCode: "2B", price: 500, type: "regular", available: true },
    { seatCode: "2C", price: 500, type: "regular", available: true },
    { seatCode: "2D", price: 500, type: "regular", available: true },
    { seatCode: "2E", price: 500, type: "regular", available: true },
    { seatCode: "2F", price: 500, type: "regular", available: true },

    { seatCode: "3A", price: 350, type: "regular", available: true },
    { seatCode: "3B", price: 350, type: "regular", available: true },
    { seatCode: "3C", price: 350, type: "regular", available: true },
    { seatCode: "3D", price: 350, type: "regular", available: true },
    { seatCode: "3E", price: 350, type: "regular", available: true },
    { seatCode: "3F", price: 350, type: "regular", available: true },

    { seatCode: "4A", price: 0, type: "free", available: true },
    { seatCode: "4B", price: 0, type: "free", available: true },
    { seatCode: "4C", price: 0, type: "free", available: true },
    { seatCode: "4D", price: 0, type: "free", available: true },
    { seatCode: "4E", price: 0, type: "free", available: true },
    { seatCode: "4F", price: 0, type: "free", available: true },

    { seatCode: "5A", price: 0, type: "free", available: true },
    { seatCode: "5B", price: 0, type: "free", available: true },
    { seatCode: "5C", price: 0, type: "free", available: true },
    { seatCode: "5D", price: 0, type: "free", available: true },
    { seatCode: "5E", price: 0, type: "free", available: true },
    { seatCode: "5F", price: 0, type: "free", available: true },
  ],
  meals: [
    { id: "m1", name: "Christopher Hot Chocolate", category: "veg", price: 130, available: true },
    { id: "m2", name: "Peppy Paneer Sandwich", category: "veg", price: 580, available: true },
    { id: "m3", name: "Mushroom & Brie Croissant", category: "veg", price: 580, available: true },
    { id: "m4", name: "Kosha Chicken Malabari Wrap", category: "nonveg", price: 620, available: true },
    { id: "m5", name: "Chicken Sandwich", category: "nonveg", price: 540, available: true },
    { id: "m6", name: "Veg Combo Meal", category: "veg", price: 480, available: true },
  ],
};