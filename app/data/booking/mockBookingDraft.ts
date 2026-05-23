import { createBookingDraft } from "./createBookingDraft";

export const mockBookingDraft = createBookingDraft({
  serial: 1,
  packageSlug: "india-festivals-cultural-traditions-tour",
  packageTitle: "India Festivals & Cultural Traditions Tour",
  variant: "withFlight",
  travelDateLabel: "Fri, 17 Apr'26 → Wed, 22 Apr'26",
  originCity: "Jaipur",

  travellers: [
    {
      firstName: "Prashant",
      lastName: "Sharma",
      day: "12",
      month: "08",
      year: "1995",
      gender: "Male",
    },
    {
      firstName: "Guest",
      lastName: "Traveller",
      day: "24",
      month: "11",
      year: "1997",
      gender: "Female",
    },
  ],

  contactDetails: {
    email: "prashantsharma142@gmail.com",
    mobileCode: "+91",
    mobile: "9828029230",
  },

  gstDetails: {
    gstState: "Rajasthan",
  },

  specialRequests: "Need early check-in if available.",

  insuranceSelected: false,
  paymentMethod: "upi",

  priceBreakup: {
    basePricePerPerson: 29999,
    totalTravellers: 2,
    basicCost: 59998,
    taxes: 5636,
    couponDiscount: 4417,
    insuranceAmount: 0,
    totalPayable: 61217,
    payNowAmount: 16561,
    payLaterAmount: 44656,
  },
});