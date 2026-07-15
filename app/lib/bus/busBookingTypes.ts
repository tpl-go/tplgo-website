export type BusSelectedSeat = {
  seatNumber: string;
  price: number;
};

export type BusBookingPayload = {
  search: {
    fromCity: string;
    fromPoint: string;
    toCity: string;
    toPoint: string;
    date: string;
  };
  bus: any;
  selectedSeats: BusSelectedSeat[];
  baseFare?: number;
  baseAmount?: number;
  selectedBoardingPoint: {
    id: string;
    name: string;
    address: string;
    time: string;
  };
  selectedDroppingPoint: {
    id: string;
    name: string;
    address: string;
    time: string;
  };
  totalFare: number;
  travellerCount: number;
};

export type BusTravellerItem = {
  seatNumber: string;
  fullName: string;
  age: string;
  gender: "Male" | "Female" | "";
};

export type BusContactDetails = {
  email: string;
  mobile: string;
  hasGst: boolean;
  state: string;
  saveBilling: boolean;
};

export type BusAddonState = {
  tripAssuredSelected: boolean;
  tripAssuredTotal: number;
  freeCancellationSelected: boolean;
  freeCancellationTotal: number;
};

export type BusOfferItem = {
  code: string;
  title: string;
  description: string;
  discountAmount: number;
};

export type BusBookingPageState = {
  bookingPayload: BusBookingPayload;
  travellers: BusTravellerItem[];
  contactDetails: BusContactDetails;
  addons: BusAddonState;
  appliedOffer: BusOfferItem | null;
  timerLeft: number;
};
