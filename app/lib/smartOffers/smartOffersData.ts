import { SmartOfferItem } from "./smartOfferTypes";

export const SMART_OFFERS_DATA: SmartOfferItem[] = [
  // =========================================================
  // GLOBAL / COMMON OFFERS
  // =========================================================

  

  // =========================================================
  // FLIGHT OFFERS
  // =========================================================

  {
    id: "flight-domestic-1500",
    slug: "domestic-flight-smart-offer",
    title: "₹1500 OFF Domestic Flights",
    subtitle: "Smart domestic fare offer",
    description:
      "Auto-applied savings on eligible domestic flight routes.",
    service: "flight",
    offerType: "coupon",
    couponCode: "DOM1500",
    discountMode: "flat",
    discountValue: 1500,
    maxDiscount: 1500,
    priority: 100,
    active: true,
    featured: true,
    validTill: "2027-12-31T23:59:59",
    rule: {
      domesticOnly: true,
      services: ["flight"],
      minBookingValue: 5000,
    },
    stackableWithWallet: true,
    stackableWithMembership: true,
  },

  {
    id: "flight-international-4500",
    slug: "international-flight-smart-offer",
    title: "₹4500 OFF International Flights",
    subtitle: "Smart international fare offer",
    description:
      "Auto-matched savings on eligible international flight routes.",
    service: "flight",
    offerType: "coupon",
    couponCode: "INTL4500",
    discountMode: "flat",
    discountValue: 4500,
    maxDiscount: 4500,
    priority: 110,
    active: true,
    featured: true,
    validTill: "2027-12-31T23:59:59",
    rule: {
      internationalOnly: true,
      services: ["flight"],
      minBookingValue: 15000,
    },
    stackableWithWallet: true,
    stackableWithMembership: true,
  },

  {
    id: "flight-bank-icici",
    slug: "icici-flight-bank-offer",
    title: "ICICI Flight Offer",
    subtitle: "Instant bank discount",
    description:
      "Smart ICICI bank offer for eligible flight payments.",
    service: "flight",
    offerType: "bank",
    couponCode: "ICICIFLY",
    discountMode: "flat",
    discountValue: 1200,
    maxDiscount: 3200,
    priority: 90,
    active: true,
    validTill: "2027-12-31T23:59:59",
    rule: {
      services: ["flight"],
      banks: ["ICICI"],
    },
    stackableWithWallet: false,
    stackableWithMembership: true,
  },

  // =========================================================
  // HOTEL OFFERS
  // =========================================================

  {
    id: "hotel-luxury-40",
    slug: "luxury-hotel-smart-offer",
    title: "Up to 40% OFF Luxury Hotels",
    subtitle: "Premium hotel offer",
    description:
      "Smart luxury hotel savings for selected destinations.",
    service: "hotel",
    offerType: "coupon",
    couponCode: "LUX40",
    discountMode: "percent",
    discountValue: 40,
    maxDiscount: 12000,
    priority: 95,
    active: true,
    featured: true,
    validTill: "2027-12-31T23:59:59",
    rule: {
      services: ["hotel"],
      minBookingValue: 10000,
    },
    stackableWithWallet: true,
    stackableWithMembership: true,
  },

  {
    id: "hotel-family-save",
    slug: "family-hotel-smart-offer",
    title: "Family Stay Savings",
    subtitle: "Extra hotel value",
    description:
      "Special savings on family and multi-room hotel bookings.",
    service: "hotel",
    offerType: "coupon",
    couponCode: "FAMILYSTAY",
    discountMode: "flat",
    discountValue: 2500,
    maxDiscount: 2500,
    priority: 85,
    active: true,
    validTill: "2027-12-31T23:59:59",
    rule: {
      services: ["hotel"],
      minBookingValue: 12000,
    },
    stackableWithWallet: true,
    stackableWithMembership: true,
  },

  // =========================================================
  // HOMESTAY OFFERS
  // =========================================================

  {
    id: "homestay-weekend-deal",
    slug: "homestay-weekend-smart-offer",
    title: "Weekend Homestay Deal",
    subtitle: "Homestay smart savings",
    description:
      "Extra weekend savings on selected homestays.",
    service: "homestay",
    offerType: "coupon",
    couponCode: "HOMESTAY20",
    discountMode: "percent",
    discountValue: 20,
    maxDiscount: 6000,
    priority: 88,
    active: true,
    featured: true,
    validTill: "2027-12-31T23:59:59",
    rule: {
      services: ["homestay"],
      minBookingValue: 6000,
    },
    stackableWithWallet: true,
    stackableWithMembership: true,
  },

  // =========================================================
  // HOLIDAY / PACKAGE OFFERS
  // =========================================================

  {
  id: "test-india-honeymoon-6000",
  slug: "test-india-honeymoon-offer",
  title: "₹6000 OFF India Honeymoon Packages",
  subtitle: "Testing India honeymoon package offer",
  description: "Test offer for India honeymoon and romantic packages only.",
  service: "holiday",
  offerType: "coupon",
  couponCode: "TESTHONEY6K",
  discountMode: "flat",
  discountValue: 6000,
  maxDiscount: 6000,
  priority: 200,
  active: true,
  featured: true,
  validTill: "2027-12-31T23:59:59",
  rule: {
    services: ["holiday"],
    domesticOnly: true,
    countries: ["India"],
    themes: ["Honeymoon", "Romantic", "Couple"],
    tags: ["honeymoon", "romantic", "couple", "india"],
    minBookingValue: 20000,
  },
  stackableWithWallet: true,
  stackableWithMembership: true,
},

  // =========================================================
  // BUS OFFERS
  // =========================================================

  {
    id: "bus-smart-save",
    slug: "bus-smart-offer",
    title: "Bus Smart Saver",
    subtitle: "Extra bus savings",
    description:
      "Flat savings on selected bus routes.",
    service: "bus",
    offerType: "coupon",
    couponCode: "BUS300",
    discountMode: "flat",
    discountValue: 300,
    maxDiscount: 300,
    priority: 70,
    active: true,
    featured: true,
    validTill: "2027-12-31T23:59:59",
    rule: {
      services: ["bus"],
      minBookingValue: 1000,
    },
    stackableWithWallet: true,
    stackableWithMembership: true,
  },



  // =========================================================
  // TRAIN OFFERS
  // =========================================================

  {
    id: "train-smart-save",
    slug: "train-smart-offer",
    title: "Train Booking Savings",
    subtitle: "Train smart offer",
    description:
      "Extra savings on train bookings through TPL.",
    service: "train",
    offerType: "coupon",
    couponCode: "TRAIN200",
    discountMode: "flat",
    discountValue: 200,
    maxDiscount: 200,
    priority: 68,
    active: true,
    featured: true,
    validTill: "2027-12-31T23:59:59",
    rule: {
      services: ["train"],
      minBookingValue: 800,
    },
    stackableWithWallet: true,
    stackableWithMembership: true,
  },

  // =========================================================
  // CAB OFFERS
  // =========================================================

  {
    id: "cab-airport-deal",
    slug: "airport-cab-smart-offer",
    title: "Airport Cab Deal",
    subtitle: "Cab smart savings",
    description:
      "Flat discount on airport cab bookings.",
    service: "cab",
    offerType: "coupon",
    couponCode: "CAB250",
    discountMode: "flat",
    discountValue: 250,
    maxDiscount: 250,
    priority: 65,
    active: true,
    featured: true,
    validTill: "2027-12-31T23:59:59",
    rule: {
      services: ["cab"],
      minBookingValue: 1200,
    },
    stackableWithWallet: true,
    stackableWithMembership: true,
  },

  // =========================================================
  // CRUISE OFFERS
  // =========================================================

  {
    id: "cruise-premium-deal",
    slug: "cruise-premium-smart-offer",
    title: "Luxury Cruise Savings",
    subtitle: "Premium cruise offer",
    description:
      "Exclusive smart savings on premium cruise bookings.",
    service: "cruise",
    offerType: "coupon",
    couponCode: "CRUISE5000",
    discountMode: "flat",
    discountValue: 5000,
    maxDiscount: 5000,
    priority: 102,
    active: true,
    featured: true,
    validTill: "2027-12-31T23:59:59",
    rule: {
      services: ["cruise"],
      minBookingValue: 50000,
    },
    stackableWithWallet: true,
    stackableWithMembership: true,
  },

  // =========================================================
  // VISA OFFERS
  // =========================================================

  {
    id: "visa-fast-track",
    slug: "visa-fast-track-offer",
    title: "Visa Processing Savings",
    subtitle: "Visa smart offer",
    description:
      "Smart savings on selected visa processing services.",
    service: "visa",
    offerType: "coupon",
    couponCode: "VISA1000",
    discountMode: "flat",
    discountValue: 1000,
    maxDiscount: 1000,
    priority: 74,
    active: true,
    featured: true,
    validTill: "2027-12-31T23:59:59",
    rule: {
      services: ["visa"],
      minBookingValue: 5000,
    },
    stackableWithWallet: true,
    stackableWithMembership: true,
  },

  // =========================================================
  // INSURANCE OFFERS
  // =========================================================

  {
    id: "insurance-global-cover",
    slug: "insurance-global-smart-offer",
    title: "Travel Insurance Savings",
    subtitle: "Insurance smart offer",
    description:
      "Special savings on selected travel insurance plans.",
    service: "insurance",
    offerType: "coupon",
    couponCode: "SAFE500",
    discountMode: "flat",
    discountValue: 500,
    maxDiscount: 500,
    priority: 72,
    active: true,
    featured: true,
    validTill: "2027-12-31T23:59:59",
    rule: {
      services: ["insurance"],
      minBookingValue: 2000,
    },
    stackableWithWallet: true,
    stackableWithMembership: true,
  },

  // =========================================================
  // MEMBERSHIP
  // =========================================================

  {
    id: "membership-platinum-smart",
    slug: "tpl-platinum-privilege-smart",
    title: "TPL Platinum Privilege",
    subtitle: "Premium member savings",
    description:
      "Unlock hidden fares, wallet boost and priority smart offers.",
    service: "all",
    offerType: "membership",
    couponCode: "TPLPLATINUM",
    discountMode: "membership",
    discountValue: 2500,
    maxDiscount: 10000,
    priority: 120,
    active: true,
    featured: true,
    validTill: "2027-12-31T23:59:59",
    rule: {
      services: ["all"],
    },
    stackableWithWallet: true,
    stackableWithMembership: true,
  },
];