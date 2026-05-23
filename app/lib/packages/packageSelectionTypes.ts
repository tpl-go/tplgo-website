export type PackageVariant = "withFlight" | "withoutFlight";

export type PackageFlightOption = {
  id: string;
  airline: string;
  from?: string;
  to?: string;
  departureTime?: string;
  arrivalTime?: string;
  duration?: string;
  fareDiff: number;
  included?: boolean;
};

export type PackageHotelOption = {
  id: string;
  hotelName: string;
  city: string;
  roomType: string;
  mealPlan: string;
  starRating: number;
  nights: number;
  fareDiff: number;
  included?: boolean;
};

export type PackageTransferOption = {
  id: string;
  vehicleType: string;
  title: string;
  subtitle?: string;
  seats?: number;
  luggage?: number;
  fareDiff: number;
  included?: boolean;
};

export type PackageMealOption = {
  id: string;
  title: string;
  description?: string;
  fareDiff: number;
  included?: boolean;
};

export type PackageActivityOption = {
  id: string;
  title: string;
  description?: string;
  fareDiff: number;
  included?: boolean;
  category?: string;
};

export type PackageSelectionState = {
  basePrice: number;

  selectedFlights: PackageFlightOption[];
  selectedHotels: PackageHotelOption[];
  selectedTransfers: PackageTransferOption[];
  selectedMeals: PackageMealOption[];
  selectedActivities: PackageActivityOption[];

  flightFareDiff: number;
  hotelFareDiff: number;
  transferFareDiff: number;
  mealFareDiff: number;
  activityFareDiff: number;

  finalPrice: number;
};