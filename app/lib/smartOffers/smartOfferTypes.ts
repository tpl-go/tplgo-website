export type SmartOfferService =
  | "flight"
  | "hotel"
  | "holiday"
  | "homestay"
  | "bus"
  | "train"
  | "cab"
  | "cruise"
  | "insurance"
  | "visa"
  | "all";

export type SmartOfferType =
  | "coupon"
  | "bank"
  | "wallet"
  | "membership"
  | "flash"
  | "festival"
  | "route"
  | "destination"
  | "service"
  | "ai";

export type SmartTripType =
  | "oneway"
  | "roundtrip"
  | "multicity"
  | "single"
  | "multi";

export type SmartOfferRule = {
  domesticOnly?: boolean;
  internationalOnly?: boolean;
  minBookingValue?: number;
  maxBookingValue?: number;
  origins?: string[];
  destinations?: string[];
  countries?: string[];
  themes?: string[];
  tags?: string[];
  routes?: string[];
  services?: SmartOfferService[];
  userTiers?: string[];
  banks?: string[];
};

export type SmartOfferItem = {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  description?: string;

  service: SmartOfferService;
  offerType: SmartOfferType;

  couponCode?: string;

  discountMode:
    | "flat"
    | "percent"
    | "cashback"
    | "wallet"
    | "membership"
    | "freebie";

  discountValue?: number;
  maxDiscount?: number;

  displayMode?: "exact" | "upTo";

  priority: number;
  active: boolean;
  featured?: boolean;
  validFrom?: string;
  validTill?: string;

  rule?: SmartOfferRule;

  stackableWithWallet?: boolean;
  stackableWithMembership?: boolean;
};

export type SmartOfferContext = {
  service: SmartOfferService;
  tripType?: SmartTripType;

  fromCity?: string;
  toCity?: string;
  fromCountry?: string;
  toCountry?: string;
  destination?: string;

  isInternational?: boolean;
  bookingValue?: number;

  userTier?: string;
  bankName?: string;
};

export type SmartOfferCard = {
  id: string;
  variant:
    | "applied"
    | "generic"
    | "bank"
    | "wallet"
    | "membership"
    | "date"
    | "service";

  title: string;
  subtitle?: string;
  description?: string;

  couponCode?: string;
  savingAmount?: number;
  applied?: boolean;
};

export type SmartOfferEngineResult = {
  appliedOffer?: SmartOfferCard;
  cards: SmartOfferCard[];
  bestOffer?: SmartOfferItem | null;
  reason?: string;
};
