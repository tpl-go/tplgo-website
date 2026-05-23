import type { CabResultItem, CabResultSearchMeta } from "./cabResultTypes";

export type CabBookingAddon = {
  id: string;
  title: string;
  description: string;
  price: number;
  selectedByDefault?: boolean;
};

export type CabOfferItem = {
  id: string;
  code: string;
  title: string;
  description: string;
  discountAmount: number;
};

export type CabBookingFareBreakup = {
  baseFare: number;
  taxesAndFees: number;
  specialRequestTotal: number;
  offerDiscount: number;
  tplCredit: number;
  totalPayable: number;
};

export type CabBookingTravellerDetails = {
  pickupLocation: string;
  fullName: string;
  gender: string;
  mobile: string;
  email: string;
  usePickupAsBillingAddress: boolean;
};

export type CabBookingPageData = {
  searchMeta: CabResultSearchMeta;
  cab: CabResultItem;

  inclusions: {
    title: string;
    subtitle: string;
  }[];

  policies: {
    title: string;
    subtitle: string;
  }[];

  reviews: {
    author: string;
    date: string;
    text: string;
    rating: number;
    tags?: string[];
  }[];

  specialRequests: CabBookingAddon[];

  // 🔥 UPDATED
  offers: CabOfferItem[];

  fare: CabBookingFareBreakup;
};