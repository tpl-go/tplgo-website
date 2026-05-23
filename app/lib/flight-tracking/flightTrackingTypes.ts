export type FlightTrackingSearchMode = "pnr" | "flight" | "route";

export type FlightTrackingStatus =
  | "On Time"
  | "Delayed"
  | "Boarding"
  | "Departed"
  | "Landed"
  | "Cancelled";

export type FlightTrackingResult = {
  airline: string;
  flightNumber: string;
  from: string;
  to: string;
  date: string;
  departureTime: string;
  arrivalTime: string;
  terminal: string;
  gate: string;
  status: FlightTrackingStatus;
  delayMinutes?: number;
  aircraft: string;
};