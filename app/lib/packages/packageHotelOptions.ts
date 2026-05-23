import type { PackageHotelOption } from "./packageSelectionTypes";

export function getPackageHotelOptions(params: {
  city: string;
  nights: number;
}): PackageHotelOption[] {
  const { city, nights } = params;

  return [
    {
      id: "htl-1",
      hotelName: `${city} Grand Residency`,
      city,
      roomType: "Deluxe Room",
      mealPlan: "Breakfast Included",
      starRating: 4,
      nights,
      fareDiff: 0,
      included: true,
    },
    {
      id: "htl-2",
      hotelName: `${city} Royal Palace`,
      city,
      roomType: "Premium Room",
      mealPlan: "Breakfast + Dinner",
      starRating: 5,
      nights,
      fareDiff: 3200,
      included: false,
    },
    {
      id: "htl-3",
      hotelName: `${city} Comfort Stay`,
      city,
      roomType: "Standard Room",
      mealPlan: "Room Only",
      starRating: 3,
      nights,
      fareDiff: -1200,
      included: false,
    },
  ];
}