export type CabRideType =
  | "outstationOneWay"
  | "outstationRoundTrip"
  | "airportTransfers"
  | "hourlyRentals"
  | "carRental"
  | "bikeRental";

export type CabLocationItem = {
  id: string;
  city: string;
  code?: string;
  label: string;
  type?: "city" | "airport" | "landmark";
};

export type CabStopItem = {
  id: string;
  location: CabLocationItem | null;
};

export type CabRentalPackage = {
  id: string;
  label: string;
  hours: number;
  kms: number;
};

export type RentalVehicleType =
  | "hatchback"
  | "sedan"
  | "suv"
  | "premium"
  | "bike"
  | "scooter";

export type RentalVehicleOption = {
  id: RentalVehicleType;
  label: string;
};

export type CabSearchFormState = {
  rideType: CabRideType;

  fromLocation: CabLocationItem | null;
  toLocation: CabLocationItem | null;

  pickupLocation: CabLocationItem | null;
  dropLocation: CabLocationItem | null;

  departureDate: Date | null;
  returnDate: Date | null;
  pickupDate: Date | null;

  pickupTime: string;
  dropTime: string;

  stops: CabStopItem[];

  rentalPackage: CabRentalPackage | null;

  rentalVehicleType: RentalVehicleType | null;
};

export type CabSearchPayload = {
  rideType: CabRideType;

  from?: string;
  to?: string;

  pickup?: string;
  drop?: string;

  departureDate?: string;
  returnDate?: string;
  pickupDate?: string;

  // ✅ Added for complete cab confirmation/payment flow
  dropDate?: string;

  pickupTime?: string;
  dropTime?: string;

  stops?: string[];

  rentalPackage?: string;
  rentalVehicleType?: string;
};