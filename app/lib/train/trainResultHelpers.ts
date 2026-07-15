import { addDays, format } from "date-fns";
import {
  TRAIN_CLASS_CODES,
  TRAIN_RUN_DAYS,
  TRAIN_TEMPLATES,
} from "./trainResultDummyData";
import type {
  TrainClassAvailability,
  TrainDateAvailability,
  TrainQuotaType,
  TrainResultItem,
  TrainRouteStop,
} from "./trainResultTypes";

type GenerateTrainResultsInput = {
  fromCity: string;
  fromCode?: string;
  toCity: string;
  toCode?: string;
  date: string;
  travelClass?: string;
};

export function normalizeTrainValue(value: string) {
  return value.trim().toLowerCase();
}

export function titleCaseTrainValue(value: string) {
  return value
    .trim()
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

export function hashTrainString(value: string) {
  return value.split("").reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
}

export function getTrainRouteSeed(fromCity: string, toCity: string) {
  return hashTrainString(
    `${normalizeTrainValue(fromCity)}-${normalizeTrainValue(toCity)}`
  );
}

export function getBasePriceByTrainClass(classCode: string) {
  switch (classCode) {
    case "1A":
      return 2850;
    case "2A":
      return 1760;
    case "3A":
      return 965;
    case "3E":
      return 885;
    case "SL":
      return 365;
    case "CC":
      return 780;
    case "2S":
      return 180;
    case "EC":
      return 1520;
    default:
      return 999;
  }
}

export function buildTrainStatus(seed: number): {
  statusType: "AVAILABLE" | "RAC" | "WL" | "NA";
  statusText: string;
} {
  const roll = seed % 10;

  if (roll <= 3) {
    const seats = 6 + (seed % 140);
    return {
      statusType: "AVAILABLE",
      statusText: `Available ${seats}`,
    };
  }

  if (roll <= 5) {
    const rac = 1 + (seed % 40);
    return {
      statusType: "RAC",
      statusText: `RAC ${rac}`,
    };
  }

  if (roll <= 8) {
    const wl = 1 + (seed % 120);
    return {
      statusType: "WL",
      statusText: `WL ${wl}`,
    };
  }

  return {
    statusType: "NA",
    statusText: "Not Available",
  };
}

export function buildTrainDateWiseAvailability(
  classCode: string,
  date: string,
  seed: number
): Record<TrainQuotaType, TrainDateAvailability[]> {
  const baseDate = new Date(date);

  function buildRows(quotaOffset: number): TrainDateAvailability[] {
    return Array.from({ length: 6 }, (_, index) => {
      const rowDate = addDays(baseDate, index);
      const rowSeed = seed + quotaOffset + index * 11;
      const status = buildTrainStatus(rowSeed);
      const price =
        getBasePriceByTrainClass(classCode) + ((rowSeed % 5) * 55);

      const showConfirm =
        (status.statusType === "WL" || status.statusType === "RAC") &&
        rowSeed % 2 === 0;

      return {
        date: format(rowDate, "yyyy-MM-dd"),
        dayLabel: format(rowDate, "EEE"),
        statusType: status.statusType,
        statusText: status.statusText,
        price,
        confirmChance: showConfirm ? 68 + (rowSeed % 25) : undefined,
        confirmTicketPrice: showConfirm
          ? price + 280 + (rowSeed % 140)
          : undefined,
      };
    });
  }

  return {
    general: buildRows(1),
    tatkal: buildRows(19),
    seniorCitizen: buildRows(37),
    ladies: buildRows(53),
  };
}

export function buildTrainClasses(
  routeSeed: number,
  date: string
): TrainClassAvailability[] {
  return TRAIN_CLASS_CODES.map((classCode, index) => {
    const seed = routeSeed + index * 17 + hashTrainString(classCode);
    const price = getBasePriceByTrainClass(classCode) + (routeSeed % 120);
    const status = buildTrainStatus(seed);

    let refundTag = "";
    if (seed % 4 === 0) refundTag = "Free Cancellation";
    else if (seed % 5 === 0) refundTag = "Confirm Ticket";
    else if (seed % 6 === 0) refundTag = "Confirm or 3X Refund";

    return {
      classCode,
      price,
      statusText: status.statusText,
      statusType: status.statusType,
      refundTag: refundTag || undefined,
      lastUpdatedText: `Updated ${2 + (seed % 6)} hrs ago`,
      dateWiseAvailability: buildTrainDateWiseAvailability(classCode, date, seed),
    };
  });
}

export function buildTrainRouteStops(
  fromCity: string,
  fromCode: string,
  toCity: string,
  toCode: string
): TrainRouteStop[] {
  return [
    {
      stationName: `${titleCaseTrainValue(fromCity)} Junction`,
      stationCode: fromCode || titleCaseTrainValue(fromCity).slice(0, 3).toUpperCase(),
      arrival: "--",
      haltMinutes: "--",
      departure: "16:30",
      day: 1,
    },
    {
      stationName: "Sehore",
      stationCode: "SEH",
      arrival: "17:16",
      haltMinutes: "02:00",
      departure: "17:18",
      day: 1,
    },
    {
      stationName: "Shujalpur",
      stationCode: "SJP",
      arrival: "17:58",
      haltMinutes: "02:00",
      departure: "18:00",
      day: 1,
    },
    {
      stationName: "Kota Junction",
      stationCode: "KOTA",
      arrival: "22:10",
      haltMinutes: "05:00",
      departure: "22:15",
      day: 1,
    },
    {
      stationName: `${titleCaseTrainValue(toCity)} Junction`,
      stationCode: toCode || titleCaseTrainValue(toCity).slice(0, 2).toUpperCase(),
      arrival: "09:50",
      haltMinutes: "--",
      departure: "--",
      day: 2,
    },
  ];
}

export function generateTrainResults({
  fromCity,
  fromCode,
  toCity,
  toCode,
  date,
  travelClass = "ALL",
}: GenerateTrainResultsInput): TrainResultItem[] {
  if (!fromCity || !toCity || !date) return [];

  const safeFromCity = titleCaseTrainValue(fromCity);
  const safeToCity = titleCaseTrainValue(toCity);
  const safeFromCode = (fromCode || safeFromCity.slice(0, 3)).toUpperCase();
  const safeToCode = (toCode || safeToCity.slice(0, 2)).toUpperCase();

  const routeSeed = getTrainRouteSeed(safeFromCity, safeToCity) + hashTrainString(date);

  const results = TRAIN_TEMPLATES.map((template, index) => {
    const seed = routeSeed + index * 31;
    let classes = buildTrainClasses(seed, date);

    if (travelClass !== "ALL") {
      const filteredClasses = classes.filter(
        (item) => item.classCode === travelClass
      );
      classes = filteredClasses.length > 0 ? filteredClasses : classes;
    }

    return {
      id: `${template.number}-${safeFromCode}-${safeToCode}-${index}`,
      trainName: template.name,
      trainNumber: template.number,
      offerTag: template.offerTag,
      confirmedOptionTag: template.confirmedOptionTag,
      confirmedOptionDescription: template.confirmedOptionDescription,
      fromCity: safeFromCity,
      fromCode: safeFromCode,
      toCity: safeToCity,
      toCode: safeToCode,
      departureTime: template.departureTime,
      departureDateLabel: format(new Date(date), "dd MMM yyyy"),
      arrivalTime: template.arrivalTime,
      arrivalDateLabel: format(
        addDays(new Date(date), index % 2 === 0 ? 1 : 0),
        "dd MMM yyyy"
      ),
      duration: template.duration,
      fromStationCode: safeFromCode,
      toStationCode: safeToCode,
      runDays: TRAIN_RUN_DAYS,
      classes,
      routeStops: buildTrainRouteStops(
        safeFromCity,
        safeFromCode,
        safeToCity,
        safeToCode
      ),
    };
  });

  return results;
}

export function sortTrainResults(
  trains: TrainResultItem[],
  sort: string
): TrainResultItem[] {
  const list = [...trains];

  if (sort === "departure") {
    return list.sort((a, b) => a.departureTime.localeCompare(b.departureTime));
  }

  if (sort === "arrival") {
    return list.sort((a, b) => a.arrivalTime.localeCompare(b.arrivalTime));
  }

  if (sort === "duration") {
    return list.sort((a, b) => {
      const aMinutes = convertDurationToMinutes(a.duration);
      const bMinutes = convertDurationToMinutes(b.duration);
      return aMinutes - bMinutes;
    });
  }

  if (sort === "price") {
    return list.sort((a, b) => {
      const aMin = Math.min(...a.classes.map((c) => c.price));
      const bMin = Math.min(...b.classes.map((c) => c.price));
      return aMin - bMin;
    });
  }

  return list;
}

function convertDurationToMinutes(duration: string) {
  const hourMatch = duration.match(/(\d+)\s*h/);
  const minuteMatch = duration.match(/(\d+)\s*m/);

  const hours = hourMatch ? Number(hourMatch[1]) : 0;
  const minutes = minuteMatch ? Number(minuteMatch[1]) : 0;

  return hours * 60 + minutes;
}
