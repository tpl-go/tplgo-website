import {
  FlightMealOption,
  FlightSeatOption,
  TravellerMealSelection,
  TravellerSeatSelection,
} from "./ancillaryTypes";

type ApiSeat = {
  code: string;
  price: number;
  status: "available" | "blocked";
  band: "free" | "regular" | "premium";
};

type ApiMeal = {
  id: string;
  title: string;
  category: "veg" | "nonveg";
  amount: number;
  available: boolean;
};

export function mapApiSeatsToCatalog(apiSeats: ApiSeat[]): FlightSeatOption[] {
  return apiSeats.map((item) => ({
    seatCode: item.code,
    price: item.price,
    type: item.band,
    available: item.status === "available",
  }));
}

export function mapApiMealsToCatalog(apiMeals: ApiMeal[]): FlightMealOption[] {
  return apiMeals.map((item) => ({
    id: item.id,
    name: item.title,
    category: item.category,
    price: item.amount,
    available: item.available,
  }));
}

export function mapBookedSeatsToSelections(params: {
  travellerIds: string[];
  booked: Array<{ travellerId: string; seatCode?: string | null; price?: number }>;
}): TravellerSeatSelection[] {
  return params.travellerIds.map((travellerId) => {
    const bookedSeat = params.booked.find((item) => item.travellerId === travellerId);
    return {
      travellerId,
      oldSeatCode: bookedSeat?.seatCode ?? null,
      newSeatCode: bookedSeat?.seatCode ?? null,
      oldPrice: bookedSeat?.price ?? 0,
      newPrice: bookedSeat?.price ?? 0,
      skipped: false,
    };
  });
}

export function mapBookedMealsToSelections(params: {
  travellerIds: string[];
  booked: Array<{ travellerId: string; mealId?: string | null; price?: number }>;
}): TravellerMealSelection[] {
  return params.travellerIds.map((travellerId) => {
    const bookedMeal = params.booked.find((item) => item.travellerId === travellerId);
    return {
      travellerId,
      oldMealId: bookedMeal?.mealId ?? null,
      newMealId: bookedMeal?.mealId ?? null,
      oldPrice: bookedMeal?.price ?? 0,
      newPrice: bookedMeal?.price ?? 0,
      skipped: false,
    };
  });
}