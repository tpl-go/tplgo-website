import { CruiseInfoItem, CruiseResultItem } from "./cruiseResultTypes";

const bogoInfo: CruiseInfoItem = {
  id: "bogo",
  label: "Buy One Get One Offer",
  title: "Buy One Get One Offer",
  description:
    "These promotions are subject to availability and may not always be applicable to all guests on the booking. Please continue to price and book for complete eligibility and promotion details.",
};

const onboardCreditInfo: CruiseInfoItem = {
  id: "onboard-credit",
  label: "Onboard Credit",
  title: "Onboard Credit",
  description:
    "Eligible sailings may include onboard credit that can be used for selected services and experiences during the cruise.",
};

const specialPromoInfo: CruiseInfoItem = {
  id: "special-promo",
  label: "Special Promotions",
  title: "Special Promotions",
  description:
    "Special promotions may vary by sailing date, cabin type, and availability.",
};

const nrdInfo: CruiseInfoItem = {
  id: "nrd",
  label: "Non Refundable Deposit",
  title: "Non Refundable Deposit",
  description:
    "This fare may include a non-refundable deposit. Cancellation rules and charges apply.",
};

export const cruiseResultsSeed: CruiseResultItem[] = [
  {
    id: "rc-voyager-brisbane-2n",
    title: "2 Nights | Australia/New Zealand | Royal Caribbean | Voyager of the Seas",
    tripLabel: "2 Night Brisbane Getaway Cruise",
    regionLabel: "Australia/New Zealand",
    cruiseLine: "Royal Caribbean",
    shipName: "Voyager of the Seas",
    departurePort: "Brisbane",
    arrivalPort: "Brisbane, Australia",
    durationNights: 2,
    mapImage: "/cruise/results/brisbane-getaway.jpg",
    lowestRates: {
      inside: 25404,
      outside: 28130,
      balcony: 38356,
      suite: 40219,
    },
    taxesText: "Excludes taxes and fees: ₹8,793",
    refundableType: "Non Refundable Deposit",
    callbackEnabled: true,
    badges: [
      { id: "bogo-badge", label: "BOGO", type: "promo", popup: bogoInfo },
      { id: "credit-badge", label: "Onboard Credit", type: "credit", popup: onboardCreditInfo },
      { id: "special-badge", label: "Special Promotions", type: "special", popup: specialPromoInfo },
      { id: "nrd-badge", label: "NRD", type: "deposit", popup: nrdInfo },
    ],
    promoItems: [bogoInfo, onboardCreditInfo, specialPromoInfo, nrdInfo],
    sailingDates: [
      {
        id: "voyager-2027-10-27",
        date: "2027-10-27",
        monthKey: "2027-10",
        inside: 25404,
        outside: 28130,
        balcony: 38356,
        suite: 40219,
        badges: [
          { id: "bogo-s1", label: "BOGO", type: "promo", popup: bogoInfo },
          { id: "nrd-s1", label: "NRD", type: "deposit", popup: nrdInfo },
        ],
        infoItems: [bogoInfo, onboardCreditInfo, specialPromoInfo, nrdInfo],
      },
      {
        id: "voyager-2027-11-10",
        date: "2027-11-10",
        monthKey: "2027-11",
        inside: 26850,
        outside: 29200,
        balcony: 39500,
        suite: 42100,
        badges: [
          { id: "credit-s2", label: "Onboard Credit", type: "credit", popup: onboardCreditInfo },
        ],
        infoItems: [onboardCreditInfo, specialPromoInfo],
      },
    ],
  },
  {
    id: "rc-quantum-brisbane-3n",
    title: "3 Nights | Australia/New Zealand | Royal Caribbean | Quantum of the Seas",
    tripLabel: "3 Night Brisbane Getaway",
    regionLabel: "Australia/New Zealand",
    cruiseLine: "Royal Caribbean",
    shipName: "Quantum of the Seas",
    departurePort: "Brisbane",
    arrivalPort: "Brisbane, Australia",
    durationNights: 3,
    mapImage: "/cruise/results/brisbane-quantum.jpg",
    lowestRates: {
      inside: 35084,
      outside: 27812,
      balcony: 38037,
      suite: 62623,
    },
    taxesText: "Excludes taxes and fees: ₹9,271",
    refundableType: "Non Refundable Deposit",
    callbackEnabled: true,
    badges: [
      { id: "bogo-badge-2", label: "BOGO", type: "promo", popup: bogoInfo },
      { id: "credit-badge-2", label: "Onboard Credit", type: "credit", popup: onboardCreditInfo },
    ],
    promoItems: [bogoInfo, onboardCreditInfo, nrdInfo],
    sailingDates: [
      {
        id: "quantum-2027-10-30",
        date: "2027-10-30",
        monthKey: "2027-10",
        inside: 35084,
        outside: 27812,
        balcony: 38037,
        suite: 62623,
        badges: [
          { id: "bogo-s3", label: "BOGO", type: "promo", popup: bogoInfo },
        ],
        infoItems: [bogoInfo, onboardCreditInfo],
      },
    ],
  },
];