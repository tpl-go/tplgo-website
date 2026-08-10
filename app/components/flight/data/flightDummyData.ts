import type {
  FlightCurrency,
  FlightDisplayPriceSnapshot,
  FlightPaymentQuoteSnapshot,
  FlightPriceSnapshot,
} from "@/app/lib/flights/flightCurrency";

type FlightScheduleEndpointSnapshot = {
  airport: string;
  terminal?: string;
  at: string;
  localDateTime?: string;
  timeZone?: string;
  utcDateTime?: string;
  offset?: string;
};

type FlightItinerarySnapshot = {
  itineraryId: string;
  duration: string;
  stops: number;
  segments: Array<{
    segmentId: string;
    airlineCode: string;
    airlineName: string;
    flightNumber: string;
    departure: FlightScheduleEndpointSnapshot;
    arrival: FlightScheduleEndpointSnapshot;
    duration: string;
    dayOffset?: number;
    aircraft?: string;
  }>;
};

export type FlightFareOption = {
  id: string;
  title: string;
  price: number;
  currency?: FlightCurrency;
  baggage: string;
  meals?: string;
  seatCharge?: string;
  cancellationFee?: string;
  dateChangeFee?: string;
};

export type FlightStopDetail = {
  airport: string;
  layover: string;
  type: string;
};

export type DummyFlight = {
  id: string;
  airline: string;
  code: string;
  from: string;
  to: string;
  departMinutes: number;
  arriveMinutes: number;
  stops: number;
  stopLabel: string;
  durationMinutes: number;
  basePrice: number;
  tag: "cheapest" | "fastest" | "early" | "late" | "recommended";
  fares: FlightFareOption[];
  timing: string;
  promo: string;
  stopDetails: FlightStopDetail[];
  backendOffer?: {
    searchId: string;
    offerId: string;
    fareId?: string;
    expiresAt?: string;
    backendRequestId?: string;
    priceTotal?: number;
    currency?: FlightCurrency;
    supplierPrice?: FlightPriceSnapshot;
    displayPrice?: FlightDisplayPriceSnapshot;
    paymentQuote?: FlightPaymentQuoteSnapshot;
    baggageAllowance?: {
      cabin?: string;
      checked?: string;
      summary?: string;
      source: "provider" | "not_provided";
    };
    availability?: {
      seatsRemaining?: number;
      source: "provider" | "not_provided";
    };
    providerLabel?: string;
    source?: string;
    itineraries?: FlightItinerarySnapshot[];
    bookingAllowed?: boolean;
    ticketingAllowed?: boolean;
    warnings?: string[];
  };
};

const AIRLINES = [
  { name: "IndiGo", prefix: "6E" },
  { name: "Air India", prefix: "AI" },
  { name: "Vistara", prefix: "UK" },
  { name: "SpiceJet", prefix: "SG" },
  { name: "Akasa Air", prefix: "QP" },
  { name: "Air India Express", prefix: "IX" },
];

function getStopLabel(stops: number) {
  if (stops === 0) return "Non stop";
  if (stops === 1) return "1 Stop";
  return "2 Stop";
}

function getDurationByStops(stops: number, index: number) {
  if (stops === 0) return 125 + (index % 4) * 10;
  if (stops === 1) return 220 + (index % 5) * 20;
  return 340 + (index % 4) * 25;
}

function getBasePrice(stops: number, index: number) {
  if (stops === 0) return 8200 + index * 170;
  if (stops === 1) return 6900 + index * 140;
  return 5900 + index * 120;
}

function getTag(index: number, departMinutes: number, stops: number) {
  if (index === 0) return "cheapest";
  if (index === 1) return "fastest";
  if (departMinutes < 360) return "early";
  if (departMinutes >= 1260) return "late";
  if (stops === 0) return "recommended";
  return "recommended";
}

function getStopDetails(stops: number, index: number): FlightStopDetail[] {
  if (stops === 0) return [];

  if (stops === 1) {
    const oneStopAirports = [
      "Ahmedabad (AMD)",
      "New Delhi (DEL)",
      "Bengaluru (BLR)",
      "Hyderabad (HYD)",
      "Jaipur (JAI)",
      "Lucknow (LKO)",
    ];

    return [
      {
        airport: oneStopAirports[index % oneStopAirports.length],
        layover: `${2 + (index % 4)} hrs ${10 + ((index * 7) % 50)} mins`,
        type: "Plane change",
      },
    ];
  }

  const firstStopAirports = [
    "New Delhi (DEL)",
    "Ahmedabad (AMD)",
    "Bengaluru (BLR)",
    "Hyderabad (HYD)",
  ];

  const secondStopAirports = [
    "Bengaluru (BLR)",
    "Mumbai (BOM)",
    "Chennai (MAA)",
    "Kolkata (CCU)",
  ];

  return [
    {
      airport: firstStopAirports[index % firstStopAirports.length],
      layover: `${2 + (index % 3)} hrs ${5 + ((index * 9) % 50)} mins`,
      type: "Plane change",
    },
    {
      airport: secondStopAirports[index % secondStopAirports.length],
      layover: `${3 + (index % 4)} hrs ${15 + ((index * 11) % 40)} mins`,
      type: index % 2 === 0 ? "Terminal change" : "Plane change",
    },
  ];
}

export function formatMinutesToTime(minutes: number) {
  const minsInDay = 24 * 60;
  const safe = ((minutes % minsInDay) + minsInDay) % minsInDay;

  const hrs = Math.floor(safe / 60)
    .toString()
    .padStart(2, "0");
  const mins = (safe % 60).toString().padStart(2, "0");

  return `${hrs}:${mins}`;
}

export function formatDuration(minutes: number) {
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hrs}h ${mins}m`;
}

export function generateDummyFlights(from: string, to: string): DummyFlight[] {
  const departureSlots = [
    240, 300, 360, 420, 480, 540, 600, 660, 720, 780,
    840, 900, 960, 1020, 1080, 1140, 1200, 1260, 1320, 1380,
    270, 390, 510, 630, 750, 870, 990, 1110, 1230, 1350,
  ];

  return departureSlots.map((departMinutes, index) => {
    const airline = AIRLINES[index % AIRLINES.length];
    const stops = index % 3;
    const durationMinutes = getDurationByStops(stops, index);
    const arriveMinutes = departMinutes + durationMinutes;
    const basePrice = getBasePrice(stops, index);
    const tag = getTag(index, departMinutes, stops);
    const stopDetails = getStopDetails(stops, index);

    return {
      id: `FLT-${index + 1}`,
      airline: airline.name,
      code: `${airline.prefix} ${2100 + index}`,
      from,
      to,
      departMinutes,
      arriveMinutes,
      stops,
      stopLabel: getStopLabel(stops),
      durationMinutes,
      basePrice,
      tag,
      timing:
        tag === "cheapest"
          ? "Lowest fare"
          : tag === "fastest"
          ? "Fastest option"
          : tag === "early"
          ? "Early departure"
          : tag === "late"
          ? "Late departure"
          : "Good choice",
      promo:
        index % 2 === 0
          ? "₹ 500 OFF using promo code + selected payment offer"
          : "Special web fare available on selected options",
      stopDetails,
      fares: [
        {
          id: `fare-${index + 1}-1`,
          title: "Published",
          price: basePrice,
          baggage: "Economy, Refundable",
          meals: "Chargeable",
          seatCharge: "Chargeable",
          cancellationFee: "NA",
          dateChangeFee: "NA",
        },
        {
          id: `fare-${index + 1}-2`,
          title: "Flexi Plus",
          price: basePrice + 350,
          baggage: "Economy, Free Meal, Refundable",
          meals: "Complimentary",
          seatCharge: "Chargeable",
          cancellationFee: "NA",
          dateChangeFee: "NA",
        },
        {
          id: `fare-${index + 1}-3`,
          title: "SME",
          price: basePrice + 700,
          baggage: "Economy, Refundable",
          meals: "Chargeable",
          seatCharge: "Chargeable",
          cancellationFee: "NA",
          dateChangeFee: "NA",
        },
        {
          id: `fare-${index + 1}-4`,
          title: "Upfront",
          price: basePrice + 1100,
          baggage: "Economy, Refundable",
          meals: "Chargeable",
          seatCharge: "Complimentary",
          cancellationFee: "NA",
          dateChangeFee: "NA",
        },
      ],
    };
  });
}
