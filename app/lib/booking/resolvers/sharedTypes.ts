export type SupportedBookingService =
  | "flight"
  | "hotel"
  | "homestay"
  | "bus"
  | "cab"
  | "train"
  | "cruise"
  | "package";

export type ResolvedTravellerType = "adult" | "child" | "infant";

export type ResolvedTraveller = {
  id: string;
  title?: string;
  firstName?: string;
  lastName?: string;
  gender?: string;
  travellerType?: ResolvedTravellerType;
  cabinLabel?: string;
  label?: string;
};

export type ResolvedContactDetails = {
  countryCode?: string;
  mobile?: string;
  email?: string;
};

export type ResolvedGstDetails = {
  hasGst?: boolean;
  state?: string;
  saveBillingToProfile?: boolean;
};

export type ResolvedSeatItem = {
  travellerId: string;
  seatNumber: string;
  price: number;
};

export type ResolvedMealItem = {
  travellerId: string;
  mealName: string;
  price: number;
};

export type ResolvedCabData = {
  cabStatus?: "pending" | "selected" | "skipped";
  cabLabel?: string;
  cabPrice?: number;
};

export type ResolvedInsuranceData = {
  insuranceStatus?: "pending" | "selected" | "skipped";
  insuranceLabel?: string;
  insurancePrice?: number;
};

export type ResolvedAddonsData = {
  addonsStatus?: "pending" | "selected" | "skipped";
  addonsLabel?: string;
  addonsPrice?: number;
  selectedItems?: string[];
  baggageSelections?: Array<{
    travellerId: string;
    baggageCode?: string;
    code?: string;
    price?: number;
  }>;
};

export type ResolvedSeatMealData = {
  seatStatus?: "pending" | "selected" | "skipped";
  mealStatus?: "pending" | "selected" | "skipped";
  seatTotal?: number;
  mealTotal?: number;
  seats?: ResolvedSeatItem[];
  meals?: ResolvedMealItem[];
};

export type ResolvedPaymentData = {
  method?: string;
  paidAt?: string | null;
  totalPaid?: number;
};

export type ResolvedPriceBreakup = {
  baseFare: number;
  tax: number;
  surcharge: number;
  seatTotal: number;
  mealTotal: number;
  cabTotal: number;
  insuranceTotal: number;
  addonsTotal: number;
  appliedOffer: number;
  discount: number;
  tplCredit: number;
  totalAmount: number;
};

export type ResolvedFlightSegment = {
  airline?: string;
  flightNumber?: string;
  from?: string;
  to?: string;
  fromCode?: string;
  toCode?: string;
  departureTime?: string;
  arrivalTime?: string;
  departureDate?: string;
  arrivalDate?: string;
  duration?: string;
  cabinBaggage?: string;
  checkinBaggage?: string;
  aircraft?: string;
  terminalFrom?: string;
  terminalTo?: string;
};

export type ResolvedFlightJourney = {
  journeyLabel?: string;
  segments?: ResolvedFlightSegment[];
  layovers?: {
    airport?: string;
    code?: string;
    duration?: string;
    note?: string;
  }[];
};

export type ResolvedFlightSource = {
  service: "flight";
  booking: any;
  payload: any;

  reviewData: any;
  travellerValidation: {
    travellers: ResolvedTraveller[];
    contactDetails?: ResolvedContactDetails;
    gstDetails?: ResolvedGstDetails;
  };
  seatMealData: ResolvedSeatMealData;
  cabData: ResolvedCabData;
  insuranceData: ResolvedInsuranceData;
  addonsData: ResolvedAddonsData;
  offerData: any;
  paymentData: ResolvedPaymentData;

  journeys: ResolvedFlightJourney[];
  firstJourney?: ResolvedFlightJourney;
  firstSegment?: ResolvedFlightSegment;
  lastJourney?: ResolvedFlightJourney;
  lastSegment?: ResolvedFlightSegment;

  routeTitle: string;
  airlineSummary: string;
  journeyDateLabel: string | null;
  priceBreakup: ResolvedPriceBreakup;
};