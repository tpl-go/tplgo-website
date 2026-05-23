import type { CabResultItem, CabResultSearchMeta } from "./cabResultTypes";
import type {
  CabBookingAddon,
  CabBookingFareBreakup,
  CabBookingPageData,
  CabOfferItem,
} from "./cabBookingTypes";

export function buildCabBookingFare(
  cab: CabResultItem,
  selectedAddons: CabBookingAddon[] = [],
  offerDiscount = 0,
  tplCredit = 100
): CabBookingFareBreakup {
  const baseFare = cab.finalPrice;
  const taxesAndFees = Math.round(baseFare * 0.1);

  const specialRequestTotal = selectedAddons.reduce(
    (sum, item) => sum + item.price,
    0
  );

  return {
    baseFare,
    taxesAndFees,
    specialRequestTotal,
    offerDiscount,
    tplCredit,
    totalPayable:
      baseFare +
      taxesAndFees +
      specialRequestTotal -
      offerDiscount -
      tplCredit,
  };
}

export function getCabBookingSpecialRequests(
  rideType: CabResultSearchMeta["rideType"]
): CabBookingAddon[] {
  if (rideType === "bikeRental") {
    return [
      {
        id: "helmet-extra",
        title: "Extra Helmet",
        description: "Add one extra helmet",
        price: 79,
      },
      {
        id: "phone-holder",
        title: "Mobile Holder",
        description: "Bike-mounted holder",
        price: 99,
      },
      {
        id: "support",
        title: "Local Support",
        description: "Priority assistance",
        price: 149,
      },
    ];
  }

  return [
    {
      id: "roof",
      title: "Roof Carrier",
      description: "Extra luggage space",
      price: 157,
    },
    {
      id: "new",
      title: "New Vehicle",
      description: "Newer model car",
      price: 262,
    },
    {
      id: "language",
      title: "Driver Language",
      description: "Preferred language",
      price: 209,
    },
  ];
}

export function buildCabBookingPageData(
  cab?: CabResultItem,
  searchMeta?: CabResultSearchMeta
): CabBookingPageData {
  if (!cab) {
    throw new Error("Cab data is required");
  }

  const safeRideType = searchMeta?.rideType ?? cab.rideType;

  const safeSearchMeta: CabResultSearchMeta = {
    rideType: safeRideType,
    from: searchMeta?.from || "",
    to: searchMeta?.to || "",
    pickup: searchMeta?.pickup || "",
    drop: searchMeta?.drop || "",
    departureDate: searchMeta?.departureDate || "",
    returnDate: searchMeta?.returnDate || "",
    pickupDate: searchMeta?.pickupDate || "",
    pickupTime: searchMeta?.pickupTime || "",
    dropTime: searchMeta?.dropTime || "",
    stops: searchMeta?.stops || [],
    rentalPackage: searchMeta?.rentalPackage || "",
    rentalVehicleType: searchMeta?.rentalVehicleType || "",
  };

  const specialRequests = getCabBookingSpecialRequests(safeRideType);

  // 🔥 FINAL OFFERS (bus jaisa)
  const offers: CabOfferItem[] = [
    {
      id: "1",
      code: "CAB100",
      title: "Flat ₹100 Off",
      description: "Applicable on cab bookings",
      discountAmount: 100,
    },
    {
      id: "2",
      code: "TPL200",
      title: "TPL Credit Offer",
      description: "Use TPL credits",
      discountAmount: 200,
    },
  ];

  return {
    searchMeta: safeSearchMeta,
    cab,

    inclusions: [
      {
        title: cab.kmsIncluded
          ? `${cab.kmsIncluded} Km included`
          : "Distance included",
        subtitle: cab.extraKmFare
          ? `₹${cab.extraKmFare}/km extra`
          : "Standard fare",
      },
      {
        title: "Toll & Taxes",
        subtitle: "Included in fare",
      },
      {
        title: "Driver allowance",
        subtitle: "Included",
      },
    ],

    policies: [
      {
        title: "Free cancellation",
        subtitle: cab.freeCancellation
          ? "Available"
          : "Depends on fare",
      },
      {
        title: "Reschedule",
        subtitle: "Allowed with approval",
      },
    ],

    reviews: [
      {
        author: "User",
        date: "2026",
        text: "Good ride experience",
        rating: cab.rating,
      },
    ],

    specialRequests,
    offers,

    fare: buildCabBookingFare(cab),
  };
}

export function validateCabTravellerDetails(details: {
  pickupLocation: string;
  fullName: string;
  gender: string;
  mobile: string;
  email: string;
}) {
  const errors: Record<string, string> = {};

  if (!details.pickupLocation.trim()) {
    errors.pickupLocation = "Required";
  }

  if (!details.fullName.trim()) {
    errors.fullName = "Required";
  }

  if (!details.gender.trim()) {
    errors.gender = "Required";
  }

  if (!/^\d{10}$/.test(details.mobile.trim())) {
    errors.mobile = "Invalid mobile";
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(details.email.trim())) {
    errors.email = "Invalid email";
  }

  return errors;
}