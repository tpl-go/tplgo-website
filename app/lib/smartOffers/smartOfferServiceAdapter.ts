import {
  SmartOfferContext,
  SmartOfferService,
  SmartTripType,
} from "./smartOfferTypes";

type FlightAdapterParams = {
  tripType?: string;
  fromCity?: string;
  toCity?: string;
  fromCountry?: string;
  toCountry?: string;
  isInternational?: boolean;
  bookingValue?: number;
};

function normalize(value?: string) {
  return String(value || "").trim().toLowerCase();
}

function isIndiaCityOrCode(value?: string) {
  const v = normalize(value);

  return [
    "india",
    "delhi",
    "new delhi",
    "mumbai",
    "goa",
    "bengaluru",
    "bangalore",
    "jaipur",
    "kashmir",
    "srinagar",
    "del",
    "bom",
    "goi",
    "blr",
    "jai",
    "sxr",
  ].includes(v);
}

function isKnownInternational(value?: string) {
  const v = normalize(value);

  return [
    "dubai",
    "dxb",
    "singapore",
    "sin",
    "thailand",
    "bangkok",
    "bkk",
    "malaysia",
    "kuala lumpur",
    "kul",
    "bali",
    "denpasar",
    "dps",
    "vietnam",
    "ho chi minh",
    "sgn",
    "london",
    "lhr",
    "paris",
    "cdg",
    "new york",
    "jfk",
    "canada",
    "toronto",
    "yyz",
    "australia",
    "sydney",
    "syd",
  ].includes(v);
}

function resolveIsInternational({
  fromCity,
  toCity,
  fromCountry,
  toCountry,
  isInternational,
}: FlightAdapterParams) {
  if (isInternational === true) return true;

  if (isKnownInternational(toCity) || isKnownInternational(toCountry)) {
    return true;
  }

  if (fromCountry && toCountry) {
    const from = normalize(fromCountry);
    const to = normalize(toCountry);

    if (from && to && from !== to) return true;
  }

  if (toCity && !isIndiaCityOrCode(toCity)) {
    return true;
  }

  return false;
}

export function buildFlightSmartOfferContext({
  tripType = "oneway",
  fromCity,
  toCity,
  fromCountry,
  toCountry,
  isInternational,
  bookingValue,
}: FlightAdapterParams): SmartOfferContext {
  const resolvedInternational = resolveIsInternational({
    fromCity,
    toCity,
    fromCountry,
    toCountry,
    isInternational,
  });

  return {
    service: "flight",
    tripType: tripType as SmartTripType,
    fromCity,
    toCity,
    fromCountry,
    toCountry,
    destination: toCity,
    isInternational: resolvedInternational,
    bookingValue:
      bookingValue ||
      (resolvedInternational ? 42000 : 12000),
    userTier: "guest",
  };
}

type GenericAdapterParams = {
  service: SmartOfferService;
  destination?: string;
  bookingValue?: number;
  userTier?: string;
};

export function buildGenericSmartOfferContext({
  service,
  destination,
  bookingValue,
  userTier = "guest",
}: GenericAdapterParams): SmartOfferContext {
  return {
    service,
    destination,
    toCity: destination,
    bookingValue: bookingValue || 25000,
    userTier,
  };
}