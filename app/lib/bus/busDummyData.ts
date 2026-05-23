import type { BusResultItem } from "./busTypes";

function normalizeCity(value: string) {
  return value.trim();
}

function slug(value: string) {
  return value.toLowerCase().replace(/\s+/g, "-");
}

function routeSeed(fromCity: string, toCity: string) {
  return `${fromCity}-${toCity}`
    .split("")
    .reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
}

function addMinutesToTime(time: string, minsToAdd: number) {
  const [hh, mm] = time.split(":").map(Number);
  const total = hh * 60 + mm + minsToAdd;
  const wrapped = ((total % 1440) + 1440) % 1440;
  const h = Math.floor(wrapped / 60);
  const m = wrapped % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function addDaysToISO(date: string, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  const localISO = new Date(
    d.getTime() - d.getTimezoneOffset() * 60000
  )
    .toISOString()
    .split("T")[0];
  return localISO;
}

function durationLabel(totalMinutes: number) {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, "0")}h ${String(m).padStart(2, "0")}m`;
}

function buildBoardingPoints(fromCity: string, departureTime: string) {
  return [
    {
      id: `${slug(fromCity)}-bp-1`,
      name: `${fromCity} Main Bus Stand`,
      address: `${fromCity} Central Bus Stand`,
      time: departureTime,
    },
    {
      id: `${slug(fromCity)}-bp-2`,
      name: `${fromCity} Railway Station`,
      address: `Near ${fromCity} Railway Station`,
      time: addMinutesToTime(departureTime, 15),
    },
    {
      id: `${slug(fromCity)}-bp-3`,
      name: `${fromCity} Bypass`,
      address: `${fromCity} Highway Bypass Point`,
      time: addMinutesToTime(departureTime, 30),
    },
  ];
}

function buildDroppingPoints(toCity: string, arrivalTime: string) {
  return [
    {
      id: `${slug(toCity)}-dp-1`,
      name: `${toCity} Main Bus Stand`,
      address: `${toCity} Central Drop Point`,
      time: arrivalTime,
    },
    {
      id: `${slug(toCity)}-dp-2`,
      name: `${toCity} Railway Station`,
      address: `Near ${toCity} Railway Station`,
      time: addMinutesToTime(arrivalTime, 10),
    },
    {
      id: `${slug(toCity)}-dp-3`,
      name: `${toCity} Bypass`,
      address: `${toCity} Highway Exit Point`,
      time: addMinutesToTime(arrivalTime, 20),
    },
  ];
}

const GOVT_OPERATORS = [
  "UPSRTC (Uttar Pradesh)",
  "RSRTC (Rajasthan)",
  "GSRTC",
];

const PRIVATE_OPERATORS = [
  "Rathore Travels",
  "zingbus plus",
  "Indo Canadian Express",
  "Mahadev Travels",
  "Shree Shyam Express",
  "Orange Tours",
  "Charan Bus Service",
  "CityLine Coaches",
  "Royal Cruiser",
  "Mewar Express",
];

const BUS_NAME_POOL = [
  "Volvo Multi Axle",
  "Bharat Benz AC Seater",
  "Scania Sleeper",
  "AC Sleeper 2+1",
  "Non AC Seater 2+3",
  "Luxury Sleeper",
  "Express Seater Sleeper",
  "Semi Sleeper Deluxe",
];

const AMENITY_POOL = [
  ["Charging Point", "GPS", "CCTV"],
  ["Water Bottle", "Blanket", "Charging Point"],
  ["Reading Light", "Emergency Exit", "GPS"],
  ["Snacks", "Charging Point", "WiFi"],
  ["Live Tracking", "CCTV", "Blanket"],
  ["USB Charger", "Reading Light", "WiFi"],
];

type GeneratedArgs = {
  fromCity: string;
  toCity: string;
  date: string;
  count?: number;
};

export function generateDummyBusesForRoute({
  fromCity,
  toCity,
  date,
  count = 12,
}: GeneratedArgs): BusResultItem[] {
  const safeFrom = normalizeCity(fromCity || "Jaipur");
  const safeTo = normalizeCity(toCity || "Delhi");
  const safeDate = date || addDaysToISO(new Date().toISOString().split("T")[0], 1);

  const seed = routeSeed(safeFrom, safeTo);

  const items: BusResultItem[] = [];

  for (let i = 0; i < count; i++) {
    const isGovernment = i < 3;
    const operatorName = isGovernment
      ? GOVT_OPERATORS[i % GOVT_OPERATORS.length]
      : PRIVATE_OPERATORS[(i - 3) % PRIVATE_OPERATORS.length];

    const departureHour = 5 + ((seed + i * 3) % 18);
    const departureMinute = [0, 15, 30, 45][(seed + i) % 4];
    const departureTime = `${String(departureHour).padStart(2, "0")}:${String(
      departureMinute
    ).padStart(2, "0")}`;

    const durationMinutes = 300 + ((seed + i * 47) % 420); // 5h to 12h
    const arrivalTime = addMinutesToTime(departureTime, durationMinutes);
    const overnight =
      Number(arrivalTime.split(":")[0]) < Number(departureTime.split(":")[0]);
    const arrivalDate = overnight ? addDaysToISO(safeDate, 1) : safeDate;

    const basePrice = 550 + ((seed + i * 61) % 900);
    const originalPrice = basePrice + 140 + ((i * 17) % 180);

    const busType = i % 2 === 0 ? "AC Sleeper" : "AC Seater";
    const busLayoutType = i % 3 === 0 ? "sleeper" : "seater";

    items.push({
      id: `${slug(safeFrom)}-${slug(safeTo)}-${i + 1}`,
      operatorName,
      busName: BUS_NAME_POOL[(seed + i) % BUS_NAME_POOL.length],
      busType,
      busLayoutType,
      fromCity: safeFrom,
      toCity: safeTo,
      departureDate: safeDate,
      arrivalDate,
      departureTime,
      arrivalTime,
      duration: durationLabel(durationMinutes),
      price: basePrice,
      originalPrice,
      rating: Number((3.2 + ((seed + i) % 18) / 10).toFixed(1)),
      reviewCount: 18 + ((seed + i * 11) % 240),
      seatsAvailable: 8 + ((seed + i * 5) % 28),
      singleSeatsLeft: 1 + ((seed + i) % 8),
      isAssured: i % 2 === 0,
      isNewBus: i % 5 === 0,
      busTag: isGovernment ? "Government Bus" : i % 3 === 0 ? "Top Rated" : "Best Deal",
      amenities: AMENITY_POOL[i % AMENITY_POOL.length],
      boardingPoints: buildBoardingPoints(safeFrom, departureTime),
      droppingPoints: buildDroppingPoints(safeTo, arrivalTime),
    });
  }

  return items;
}

// compatibility export
export const BUS_DUMMY_RESULTS: BusResultItem[] = generateDummyBusesForRoute({
  fromCity: "Jaipur",
  toCity: "Delhi",
  date: "2026-04-03",
  count: 12,
});