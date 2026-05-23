export type FlightSeatType = "free" | "regular" | "premium";
export type FlightMealCategory = "veg" | "nonveg";

export type FlightSeatOption = {
  seatCode: string;
  price: number;
  type: FlightSeatType;
  available: boolean;
};

export type FlightMealOption = {
  id: string;
  name: string;
  category: FlightMealCategory;
  price: number;
  available: boolean;
};

export type TravellerSeatSelection = {
  travellerId: string;
  oldSeatCode?: string | null;
  newSeatCode?: string | null;
  oldPrice: number;
  newPrice: number;
  skipped?: boolean;
};

export type TravellerMealSelection = {
  travellerId: string;
  oldMealId?: string | null;
  newMealId?: string | null;
  oldPrice: number;
  newPrice: number;
  skipped?: boolean;
};

export type FlightAncillaryCatalog = {
  seats: FlightSeatOption[];
  meals: FlightMealOption[];
};

export type SeatMealStatus = "pending" | "selected" | "skipped";