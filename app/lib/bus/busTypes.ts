export type BusAmenity =
  | "WiFi"
  | "Charging Point"
  | "Blanket"
  | "Water Bottle"
  | "CCTV"
  | "GPS"
  | "Reading Light"
  | "Hammer";

export type BusType =
  | "AC Sleeper"
  | "Non AC Sleeper"
  | "AC Seater"
  | "Non AC Seater"
  | "Volvo Multi-Axle"
  | "Bharat Benz Sleeper";

export type BusBoardingPoint = {
  id: string;
  name: string;
  time: string;
  address: string;
};

export type BusDroppingPoint = {
  id: string;
  name: string;
  time: string;
  address: string;
};

export type BusSeatLayoutType = "sleeper" | "seater" | "semi-sleeper";

export type BusResultItem = {
  id: string;
  operatorName: string;
  busName: string;
  busType: BusType;
  busLayoutType: BusSeatLayoutType;

  fromCity: string;
  toCity: string;

  departureDate: string;
  departureTime: string;
  arrivalDate: string;
  arrivalTime: string;
  duration: string;

  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  seatsAvailable: number;
  singleSeatsLeft: number;

  busTag?: string;
  isAssured?: boolean;
  isNewBus?: boolean;

  amenities: BusAmenity[];

  boardingPoints: BusBoardingPoint[];
  droppingPoints: BusDroppingPoint[];
};

export type BusSearchQuery = {
  fromCity: string;
  fromPoint?: string;
  toCity: string;
  toPoint?: string;
  date: string;
};

export type SelectedBusBookingPayload = {
  search: BusSearchQuery;
  bus: BusResultItem;
  selectedBoardingPoint?: BusBoardingPoint;
  selectedDroppingPoint?: BusDroppingPoint;
  selectedSeats?: {
    seatNumber: string;
    price: number;
  }[];
};