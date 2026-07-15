export type TrainBookingSelection = {
  journeyDate: string;
  classCode: string;
  quota: "general" | "tatkal" | "seniorCitizen" | "ladies";
  ticketPrice: number;
  trueBaseFare?: number;
  baseFare?: number;
  originalTicketPrice?: number;
  confirmUpgradeAmount?: number;
  ticketType: "regular" | "confirm";
  statusText: string;
  statusType: string;
  confirmChance?: number | null;
  confirmTicketPrice?: number | null;
};

export type TrainBookingTrainInfo = {
  id: string;
  trainName: string;
  trainNumber: string;
  offerTag?: string;
  confirmedOptionTag?: string;
  confirmedOptionDescription?: string;
  fromCity: string;
  fromCode: string;
  toCity: string;
  toCode: string;
  departureTime: string;
  departureDateLabel: string;
  arrivalTime: string;
  arrivalDateLabel: string;
  duration: string;
  fromStationCode: string;
  toStationCode: string;
  runDays: string[] | string;
};

export type TrainBookingPayload = {
  train: TrainBookingTrainInfo;
  bookingSelection: TrainBookingSelection;
  selectedClass: {
    classCode: string;
    price: number;
    refundTag?: string;
    lastUpdatedText?: string;
  } | null;
  routeStops: any[];
  pricingSnapshot?: Record<string, unknown>;
  fareSnapshot?: Record<string, unknown>;
  priceBreakup?: Record<string, unknown>;
  savedAt: number;
};

export type TrainTravellerItem = {
  fullName: string;
  age: string;
  gender: "Male" | "Female" | "Other" | "";
  berthPreference: string;
};

export type TrainContactDetails = {
  mobile: string;
  email: string;
};

export type TrainIrctcAccountDetails = {
  username: string;
};

export type TrainBookingPageState = {
  bookingPayload: TrainBookingPayload;
  travellers: TrainTravellerItem[];
  contactDetails: TrainContactDetails;
  irctcAccount: TrainIrctcAccountDetails;
  timerLeft: number;
};
