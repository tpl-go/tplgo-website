export type BusTimeBucket =
  | "00-06"
  | "06-12"
  | "12-18"
  | "18-24";

export type BusFilters = {
  busAcTypes: string[]; // ["AC", "Non-AC"]
  seatTypes: string[]; // ["Seater", "Sleeper"]
  pickupPoints: string[];
  pickupTimes: BusTimeBucket[];
  operators: string[];
  dropPoints: string[];
  dropTimes: BusTimeBucket[];
};

export const DEFAULT_BUS_FILTERS: BusFilters = {
  busAcTypes: [],
  seatTypes: [],
  pickupPoints: [],
  pickupTimes: [],
  operators: [],
  dropPoints: [],
  dropTimes: [],
};