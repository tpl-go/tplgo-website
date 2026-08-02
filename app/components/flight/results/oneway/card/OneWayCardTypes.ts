import type { FlightCurrency } from "@/app/lib/flights/flightCurrency";

export type Fare = {
  id: string;
  title: string;
  price: string;
  priceAmount?: number;
  currency?: FlightCurrency;
  baggage: string;
  meals?: string;
  seatCharge?: string;
  cancellationFee?: string;
  dateChangeFee?: string;
};

export type StopDetail = {
  airport: string;
  layover: string;
  type: string;
};

export type DetailTab = "flight" | "fare" | "rules" | "baggage";
