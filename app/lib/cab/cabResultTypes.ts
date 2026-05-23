export type CabResultVehicleType =
  | "hatchback"
  | "sedan"
  | "suv"
  | "compactsuv"
  | "premium"
  | "bike"
  | "scooter";

export type CabResultFuelType =
  | "petrol"
  | "diesel"
  | "cng"
  | "electric";

export type CabResultTransmission = "manual" | "automatic";

export type CabResultItem = {
  id: string;
  rideType:
    | "outstationOneWay"
    | "outstationRoundTrip"
    | "airportTransfers"
    | "hourlyRentals"
    | "carRental"
    | "bikeRental";

  name: string;
  image: string;

  vehicleType: CabResultVehicleType;
  brand: string;

  rating: number;
  reviewCount: number;

  basePrice: number;
  finalPrice: number;
  discountPercent?: number;

  fuelType?: CabResultFuelType;
  transmission?: CabResultTransmission;

  seats?: number;
  luggage?: number;

  kmsIncluded?: number;
  extraKmFare?: number;
  packageLabel?: string;

  pickupIncluded?: boolean;
  freeCancellation?: boolean;
  instantConfirm?: boolean;

  engineCc?: number;
  helmetIncluded?: boolean;

  tags?: string[];
};

export type CabResultFiltersState = {
  vehicleTypes: string[];
  brands: string[];
  fuelTypes: string[];
  transmissions: string[];
  seats: string[];
  priceRange: [number, number];
  minRating: number | null;
};

export type CabResultSearchMeta = {
  rideType:
    | "outstationOneWay"
    | "outstationRoundTrip"
    | "airportTransfers"
    | "hourlyRentals"
    | "carRental"
    | "bikeRental";
  from?: string;
  to?: string;
  pickup?: string;
  drop?: string;
  departureDate?: string;
  returnDate?: string;
  pickupDate?: string;
  pickupTime?: string;
  dropTime?: string;
  stops?: string[];
  rentalPackage?: string;
  rentalVehicleType?: string;
};