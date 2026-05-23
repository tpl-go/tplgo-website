export type TrainSearchMode = "book" | "pnr" | "live";

export type TrainClassType =
  | "ALL"
  | "SL"
  | "3A"
  | "2A"
  | "1A"
  | "2S"
  | "CC"
  | "EC"
  | "EA"
  | "FC";

export type TrainStation = {
  code: string;
  city: string;
  stationName: string;
  label: string;
};

export type TrainPNRPassengerStatus = {
  passengerNo: number;
  currentStatus: string;
  coach?: string;
  berth?: string;
};

export type TrainPNRResult = {
  pnr: string;
  trainName: string;
  trainNumber: string;
  from: string;
  to: string;
  journeyDate: string;
  chartStatus: string;
  bookingStatus: string;
  passengers: TrainPNRPassengerStatus[];
};

export type TrainLiveStatusResult = {
  trainName: string;
  trainNumber: string;
  currentStation: string;
  nextStation: string;
  destinationStation: string;
  platform?: string;
  delayMinutes: number;
  statusLabel: string;
  lastUpdated: string;
};