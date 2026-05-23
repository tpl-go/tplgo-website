import type { CabResultItem, CabResultSearchMeta } from "./cabResultTypes";
import type {
  CabBookingAddon,
  CabBookingFareBreakup,
  CabBookingTravellerDetails,
  CabOfferItem,
} from "./cabBookingTypes";

export type CabConfirmationStatus = "confirmed" | "pending" | "failed";

export type CabConfirmationPaymentInfo = {
  paymentMethod: string;
  paymentStatus: "success" | "pending" | "failed";
  paidAt: string;
  transactionId: string;
};

export type CabConfirmationBookingRecord = {
  bookingId: string;
  bookingStatus: CabConfirmationStatus;
  createdAt: string;
  confirmedAt: string;

  cab: CabResultItem;
  searchMeta: CabResultSearchMeta;
  traveller: CabBookingTravellerDetails;

  selectedAddons: CabBookingAddon[];
  appliedOffer: CabOfferItem | null;
  fare: CabBookingFareBreakup;

  payment: CabConfirmationPaymentInfo;
};

export type CabBookingLookupPayload = {
  bookingId: string;
  email: string;
};