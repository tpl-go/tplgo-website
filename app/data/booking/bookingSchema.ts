import type { BookingStatus, PaymentStatus } from "./bookingTypes";

export type TravellerInfo = {
  firstName: string;
  lastName: string;
  day: string;
  month: string;
  year: string;
  gender: string;
};

export type ContactDetails = {
  email: string;
  mobileCode: string;
  mobile: string;
};

export type GstDetails = {
  gstState: string;
};

export type PriceBreakup = {
  basePricePerPerson: number;
  totalTravellers: number;
  basicCost: number;
  taxes: number;
  couponDiscount: number;
  insuranceAmount: number;
  totalPayable: number;
  payNowAmount: number;
  payLaterAmount: number;
};

export type BookingRecord = {
  bookingId: string;
  packageSlug: string;
  packageTitle: string;
  variant: "withFlight" | "withoutFlight";
  travelDateLabel: string;
  originCity: string;

  travellers: TravellerInfo[];
  contactDetails: ContactDetails;
  gstDetails: GstDetails;
  specialRequests: string;

  insuranceSelected: boolean;
  paymentMethod?: string;

  priceBreakup: PriceBreakup;

  bookingStatus: BookingStatus;
  paymentStatus: PaymentStatus;

  createdAt: string;
  expiresAt: string;
};