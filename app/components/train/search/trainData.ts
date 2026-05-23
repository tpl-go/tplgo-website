import type {
  TrainClassType,
  TrainLiveStatusResult,
  TrainPNRResult,
  TrainStation,
} from "./trainTypes";

export const TRAIN_CLASSES: { value: TrainClassType; label: string }[] = [
  { value: "ALL", label: "All Class" },
  { value: "SL", label: "Sleeper Class" },
  { value: "3A", label: "Third AC" },
  { value: "2A", label: "Second AC" },
  { value: "1A", label: "First AC" },
  { value: "2S", label: "Second Seating" },
  { value: "CC", label: "AC Chair Car" },
  { value: "EC", label: "Executive Chair Car" },
  { value: "EA", label: "Anubhuti / Economy AC" },
  { value: "FC", label: "First Class" },
];

export const TRAIN_STATIONS: TrainStation[] = [
  {
    code: "UJN",
    city: "Ujjain",
    stationName: "Ujjain Junction",
    label: "UJN, Ujjain - All Stations",
  },
  {
    code: "JP",
    city: "Jaipur",
    stationName: "Jaipur Junction",
    label: "JP, Jaipur - All Stations",
  },
  {
    code: "NDLS",
    city: "Delhi",
    stationName: "New Delhi",
    label: "NDLS, Delhi - All Stations",
  },
  {
    code: "BCT",
    city: "Mumbai",
    stationName: "Mumbai Central",
    label: "BCT, Mumbai - All Stations",
  },
  {
    code: "INDB",
    city: "Indore",
    stationName: "Indore Junction",
    label: "INDB, Indore - All Stations",
  },
  {
    code: "KOTA",
    city: "Kota",
    stationName: "Kota Junction",
    label: "KOTA, Kota - All Stations",
  },
  {
    code: "ADI",
    city: "Ahmedabad",
    stationName: "Ahmedabad Junction",
    label: "ADI, Ahmedabad - All Stations",
  },
];

export function getTrainPNRStatus(pnr: string): TrainPNRResult {
  return {
    pnr,
    trainName: "Intercity Superfast Express",
    trainNumber: "12978",
    from: "Jaipur Junction",
    to: "Ujjain Junction",
    journeyDate: "07 May 2026",
    chartStatus: "Chart Not Prepared",
    bookingStatus: "Partially Confirmed",
    passengers: [
      {
        passengerNo: 1,
        currentStatus: "CNF",
        coach: "B2",
        berth: "32",
      },
      {
        passengerNo: 2,
        currentStatus: "RAC 18",
      },
    ],
  };
}

export function getLiveTrainStatus(
  trainInput: string
): TrainLiveStatusResult {
  return {
    trainName: trainInput?.trim() || "Rajdhani Express",
    trainNumber: "12952",
    currentStation: "Kota Junction",
    nextStation: "Sawai Madhopur",
    destinationStation: "Mumbai Central",
    platform: "3",
    delayMinutes: 18,
    statusLabel: "Running Late",
    lastUpdated: "Today, 05:42 PM",
  };
}