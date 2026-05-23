export type MultiCityFareOption = {
  id: string;
  label: string;
  subtitle: string;
  price: number;
  refundable?: boolean;
};

export type MultiCityFlight = {
  id: string;
  airline: string;
  flightNumber: string;

  fromCode: string;
  fromCity: string;
  fromCountry: string;

  toCode: string;
  toCity: string;
  toCountry: string;

  departureTime: string;
  arrivalTime: string;
  duration: string;

  stopsText: string;
  stopCount: number;

  baggage: string;
  checkInBaggageIncluded?: boolean;

  seatLeft?: number;
  badge?: string;

  price: number;
  fareOptions: MultiCityFareOption[];

  aircraftSize?: "smallmid" | "widebody";
  alliance?: string;
  layoverAirport?: string;
  layoverCode?: string;
  layoverDurationMinutes?: number;
};

export type MultiCityLeg = {
  id: string;
  fromCode: string;
  fromCity: string;
  fromCountry: string;

  toCode: string;
  toCity: string;
  toCountry: string;

  departureDate: string;
  flights: MultiCityFlight[];
};

export type MultiCitySearchData = {
  tripType: "multicity";
  travellersText: string;
  cabinClassText: string;
  legs: MultiCityLeg[];
};

const createFareOptions = (
  basePrice: number,
  refundable = true
): MultiCityFareOption[] => [
  {
    id: "published",
    label: "Published",
    subtitle: refundable ? "Economy, Refundable" : "Economy, Non-refundable",
    price: basePrice,
    refundable,
  },
  {
    id: "flexi",
    label: "Flexi Plus",
    subtitle: "Economy, Free Meal",
    price: basePrice + 420,
    refundable: true,
  },
  {
    id: "sme",
    label: "SME",
    subtitle: refundable ? "Economy, Refundable" : "Economy, Non-refundable",
    price: basePrice + 760,
    refundable,
  },
  {
    id: "premium",
    label: "Premium Flex",
    subtitle: "Priority, Meal Included",
    price: basePrice + 1190,
    refundable: true,
  },
];

const leg1Flights: MultiCityFlight[] = [
  {
    id: "mc-leg1-1",
    airline: "IndiGo",
    flightNumber: "6E 2145",
    fromCode: "DEL",
    fromCity: "Delhi",
    fromCountry: "India",
    toCode: "BOM",
    toCity: "Mumbai",
    toCountry: "India",
    departureTime: "06:10",
    arrivalTime: "08:25",
    duration: "2h 15m",
    stopsText: "Non Stop",
    stopCount: 0,
    baggage: "7kg Cabin • 15kg Check-in",
    checkInBaggageIncluded: true,
    aircraftSize: "smallmid",
    alliance: "None",
    seatLeft: 6,
    badge: "Best Seller",
    price: 5150,
    fareOptions: createFareOptions(5150, true),
  },
  {
    id: "mc-leg1-2",
    airline: "Air India",
    flightNumber: "AI 675",
    fromCode: "DEL",
    fromCity: "Delhi",
    fromCountry: "India",
    toCode: "BOM",
    toCity: "Mumbai",
    toCountry: "India",
    departureTime: "09:00",
    arrivalTime: "11:20",
    duration: "2h 20m",
    stopsText: "Non Stop",
    stopCount: 0,
    baggage: "7kg Cabin • 15kg Check-in",
    checkInBaggageIncluded: true,
    aircraftSize: "smallmid",
    alliance: "Star Alliance",
    seatLeft: 4,
    price: 5480,
    fareOptions: createFareOptions(5480, true),
  },
  {
    id: "mc-leg1-3",
    airline: "Akasa Air",
    flightNumber: "QP 1412",
    fromCode: "DEL",
    fromCity: "Delhi",
    fromCountry: "India",
    toCode: "BOM",
    toCity: "Mumbai",
    toCountry: "India",
    departureTime: "13:40",
    arrivalTime: "16:10",
    duration: "2h 30m",
    stopsText: "1 Stop",
    stopCount: 1,
    baggage: "7kg Cabin • 15kg Check-in",
    checkInBaggageIncluded: true,
    aircraftSize: "smallmid",
    alliance: "None",
    layoverAirport: "Jaipur",
    layoverCode: "JAI",
    layoverDurationMinutes: 270,
    seatLeft: 9,
    price: 4890,
    fareOptions: createFareOptions(4890, false),
  },
];

const leg2Flights: MultiCityFlight[] = [
  {
    id: "mc-leg2-1",
    airline: "IndiGo",
    flightNumber: "6E 531",
    fromCode: "BOM",
    fromCity: "Mumbai",
    fromCountry: "India",
    toCode: "DXB",
    toCity: "Dubai",
    toCountry: "UAE",
    departureTime: "07:15",
    arrivalTime: "09:30",
    duration: "3h 45m",
    stopsText: "Non Stop",
    stopCount: 0,
    baggage: "7kg Cabin • 20kg Check-in",
    checkInBaggageIncluded: true,
    aircraftSize: "widebody",
    alliance: "None",
    seatLeft: 5,
    badge: "Cheapest",
    price: 13190,
    fareOptions: createFareOptions(13190, false),
  },
  {
    id: "mc-leg2-2",
    airline: "Air India",
    flightNumber: "AI 983",
    fromCode: "BOM",
    fromCity: "Mumbai",
    fromCountry: "India",
    toCode: "DXB",
    toCity: "Dubai",
    toCountry: "UAE",
    departureTime: "11:05",
    arrivalTime: "13:35",
    duration: "4h 00m",
    stopsText: "Non Stop",
    stopCount: 0,
    baggage: "7kg Cabin • 25kg Check-in",
    checkInBaggageIncluded: true,
    aircraftSize: "widebody",
    alliance: "Star Alliance",
    seatLeft: 8,
    price: 14510,
    fareOptions: createFareOptions(14510, true),
  },
  {
    id: "mc-leg2-3",
    airline: "SpiceJet",
    flightNumber: "SG 492",
    fromCode: "BOM",
    fromCity: "Mumbai",
    fromCountry: "India",
    toCode: "DXB",
    toCity: "Dubai",
    toCountry: "UAE",
    departureTime: "17:20",
    arrivalTime: "21:50",
    duration: "6h 00m",
    stopsText: "1 Stop",
    stopCount: 1,
    baggage: "7kg Cabin • 20kg Check-in",
    checkInBaggageIncluded: true,
    aircraftSize: "smallmid",
    alliance: "None",
    layoverAirport: "Muscat",
    layoverCode: "MCT",
    layoverDurationMinutes: 110,
    seatLeft: 3,
    price: 11990,
    fareOptions: createFareOptions(11990, false),
  },
];

const leg3Flights: MultiCityFlight[] = [
  {
    id: "mc-leg3-1",
    airline: "Emirates",
    flightNumber: "EK 564",
    fromCode: "DXB",
    fromCity: "Dubai",
    fromCountry: "UAE",
    toCode: "LHR",
    toCity: "London",
    toCountry: "UK",
    departureTime: "08:45",
    arrivalTime: "12:55",
    duration: "7h 40m",
    stopsText: "Non Stop",
    stopCount: 0,
    baggage: "7kg Cabin • 25kg Check-in",
    checkInBaggageIncluded: true,
    aircraftSize: "widebody",
    alliance: "None",
    seatLeft: 7,
    badge: "Fastest",
    price: 28480,
    fareOptions: createFareOptions(28480, true),
  },
  {
    id: "mc-leg3-2",
    airline: "Qatar Airways",
    flightNumber: "QR 1004",
    fromCode: "DXB",
    fromCity: "Dubai",
    fromCountry: "UAE",
    toCode: "LHR",
    toCity: "London",
    toCountry: "UK",
    departureTime: "14:10",
    arrivalTime: "20:40",
    duration: "9h 00m",
    stopsText: "1 Stop",
    stopCount: 1,
    baggage: "7kg Cabin • 25kg Check-in",
    checkInBaggageIncluded: true,
    aircraftSize: "widebody",
    alliance: "Oneworld",
    layoverAirport: "Doha",
    layoverCode: "DOH",
    layoverDurationMinutes: 95,
    seatLeft: 6,
    price: 24140,
    fareOptions: createFareOptions(24140, true),
  },
  {
    id: "mc-leg3-3",
    airline: "Lufthansa",
    flightNumber: "LH 631",
    fromCode: "DXB",
    fromCity: "Dubai",
    fromCountry: "UAE",
    toCode: "LHR",
    toCity: "London",
    toCountry: "UK",
    departureTime: "19:30",
    arrivalTime: "05:55",
    duration: "12h 55m",
    stopsText: "2+ Stop",
    stopCount: 2,
    baggage: "7kg Cabin • 23kg Check-in",
    checkInBaggageIncluded: true,
    aircraftSize: "widebody",
    alliance: "Star Alliance",
    layoverAirport: "Frankfurt",
    layoverCode: "FRA",
    layoverDurationMinutes: 160,
    seatLeft: 2,
    price: 21990,
    fareOptions: createFareOptions(21990, false),
  },
];

const leg4Flights: MultiCityFlight[] = [
  {
    id: "mc-leg4-1",
    airline: "British Airways",
    flightNumber: "BA 117",
    fromCode: "LHR",
    fromCity: "London",
    fromCountry: "UK",
    toCode: "JFK",
    toCity: "New York",
    toCountry: "USA",
    departureTime: "09:55",
    arrivalTime: "13:05",
    duration: "8h 10m",
    stopsText: "Non Stop",
    stopCount: 0,
    baggage: "7kg Cabin • 23kg Check-in",
    checkInBaggageIncluded: true,
    aircraftSize: "widebody",
    alliance: "Oneworld",
    seatLeft: 9,
    price: 31890,
    fareOptions: createFareOptions(31890, true),
  },
  {
    id: "mc-leg4-2",
    airline: "Virgin Atlantic",
    flightNumber: "VS 3",
    fromCode: "LHR",
    fromCity: "London",
    fromCountry: "UK",
    toCode: "JFK",
    toCity: "New York",
    toCountry: "USA",
    departureTime: "13:20",
    arrivalTime: "16:30",
    duration: "8h 10m",
    stopsText: "Non Stop",
    stopCount: 0,
    baggage: "7kg Cabin • 23kg Check-in",
    checkInBaggageIncluded: true,
    aircraftSize: "widebody",
    alliance: "SkyTeam",
    seatLeft: 5,
    price: 33120,
    fareOptions: createFareOptions(33120, true),
  },
  {
    id: "mc-leg4-3",
    airline: "Air France",
    flightNumber: "AF 1181",
    fromCode: "LHR",
    fromCity: "London",
    fromCountry: "UK",
    toCode: "JFK",
    toCity: "New York",
    toCountry: "USA",
    departureTime: "17:10",
    arrivalTime: "22:30",
    duration: "10h 50m",
    stopsText: "1 Stop",
    stopCount: 1,
    baggage: "7kg Cabin • 23kg Check-in",
    checkInBaggageIncluded: true,
    aircraftSize: "widebody",
    alliance: "SkyTeam",
    layoverAirport: "Paris",
    layoverCode: "CDG",
    layoverDurationMinutes: 105,
    seatLeft: 4,
    price: 28640,
    fareOptions: createFareOptions(28640, false),
  },
];

const leg5Flights: MultiCityFlight[] = [
  {
    id: "mc-leg5-1",
    airline: "Singapore Airlines",
    flightNumber: "SQ 25",
    fromCode: "JFK",
    fromCity: "New York",
    fromCountry: "USA",
    toCode: "SIN",
    toCity: "Singapore",
    toCountry: "Singapore",
    departureTime: "08:30",
    arrivalTime: "17:45",
    duration: "18h 15m",
    stopsText: "Non Stop",
    stopCount: 0,
    baggage: "7kg Cabin • 25kg Check-in",
    checkInBaggageIncluded: true,
    aircraftSize: "widebody",
    alliance: "Star Alliance",
    seatLeft: 8,
    badge: "Recommended",
    price: 52490,
    fareOptions: createFareOptions(52490, true),
  },
  {
    id: "mc-leg5-2",
    airline: "Emirates",
    flightNumber: "EK 204",
    fromCode: "JFK",
    fromCity: "New York",
    fromCountry: "USA",
    toCode: "SIN",
    toCity: "Singapore",
    toCountry: "Singapore",
    departureTime: "15:10",
    arrivalTime: "23:55",
    duration: "22h 15m",
    stopsText: "1 Stop",
    stopCount: 1,
    baggage: "7kg Cabin • 25kg Check-in",
    checkInBaggageIncluded: true,
    aircraftSize: "widebody",
    alliance: "None",
    layoverAirport: "Dubai",
    layoverCode: "DXB",
    layoverDurationMinutes: 150,
    seatLeft: 4,
    price: 46890,
    fareOptions: createFareOptions(46890, true),
  },
  {
    id: "mc-leg5-3",
    airline: "Qatar Airways",
    flightNumber: "QR 702",
    fromCode: "JFK",
    fromCity: "New York",
    fromCountry: "USA",
    toCode: "SIN",
    toCity: "Singapore",
    toCountry: "Singapore",
    departureTime: "20:15",
    arrivalTime: "07:20",
    duration: "21h 35m",
    stopsText: "1 Stop",
    stopCount: 1,
    baggage: "7kg Cabin • 25kg Check-in",
    checkInBaggageIncluded: true,
    aircraftSize: "widebody",
    alliance: "Oneworld",
    layoverAirport: "Doha",
    layoverCode: "DOH",
    layoverDurationMinutes: 130,
    seatLeft: 6,
    price: 45120,
    fareOptions: createFareOptions(45120, true),
  },
];

export const multiCitySearchMock: MultiCitySearchData = {
  tripType: "multicity",
  travellersText: "1 Traveller",
  cabinClassText: "Economy",
  legs: [
    {
      id: "leg-1",
      fromCode: "DEL",
      fromCity: "Delhi",
      fromCountry: "India",
      toCode: "BOM",
      toCity: "Mumbai",
      toCountry: "India",
      departureDate: "28 Mar 2026",
      flights: leg1Flights,
    },
    {
      id: "leg-2",
      fromCode: "BOM",
      fromCity: "Mumbai",
      fromCountry: "India",
      toCode: "DXB",
      toCity: "Dubai",
      toCountry: "UAE",
      departureDate: "30 Mar 2026",
      flights: leg2Flights,
    },
    {
      id: "leg-3",
      fromCode: "DXB",
      fromCity: "Dubai",
      fromCountry: "UAE",
      toCode: "LHR",
      toCity: "London",
      toCountry: "UK",
      departureDate: "02 Apr 2026",
      flights: leg3Flights,
    },
    {
      id: "leg-4",
      fromCode: "LHR",
      fromCity: "London",
      fromCountry: "UK",
      toCode: "JFK",
      toCity: "New York",
      toCountry: "USA",
      departureDate: "05 Apr 2026",
      flights: leg4Flights,
    },
    {
      id: "leg-5",
      fromCode: "JFK",
      fromCity: "New York",
      fromCountry: "USA",
      toCode: "SIN",
      toCity: "Singapore",
      toCountry: "Singapore",
      departureDate: "09 Apr 2026",
      flights: leg5Flights,
    },
  ],
};