export type TrainQuotaType =
  | "general"
  | "tatkal"
  | "seniorCitizen"
  | "ladies";

export type TrainStatusType = "AVAILABLE" | "RAC" | "WL" | "NA";

export type AvailabilityStatusType = TrainStatusType;

export type TrainSortOption =
  | "relevance"
  | "departure"
  | "arrival"
  | "duration"
  | "price";

export type TrainDateAvailability = {
  date: string;
  dayLabel: string;
  statusType: TrainStatusType;
  statusText: string;
  price: number;
  confirmChance?: number;
  confirmTicketPrice?: number;
};

export type TrainClassAvailability = {
  classCode: string;
  price: number;
  statusText: string;
  statusType: TrainStatusType;
  refundTag?: string;
  lastUpdatedText: string;
  dateWiseAvailability: Record<TrainQuotaType, TrainDateAvailability[]>;
};

export type TrainRouteStop = {
  stationName: string;
  stationCode: string;
  arrival: string;
  haltMinutes: string;
  departure: string;
  day: number;
};

export type TrainTemplate = {
  name: string;
  number: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  offerTag?: string;
  confirmedOptionTag?: string;
  confirmedOptionDescription?: string;
};

export type TrainResultItem = {
  id: string;
  trainName: string;
  trainNumber: string;

  offerTag?: string;
  confirmedOptionTag?: string;
  confirmedOptionDescription?: string;

  fromCity: string;
  fromCode: string;
  toCity: string;
  toCode: string;

  departureTime: string;
  departureDateLabel: string;
  arrivalTime: string;
  arrivalDateLabel: string;
  duration: string;

  fromStationCode: string;
  toStationCode: string;

  runDays: string[] | string;
  classes: TrainClassAvailability[];
  routeStops: TrainRouteStop[];
};

export type TrainFilterState = {
  quick: string[];
  ticketTypes: string[];
  quota: string[];
  classes: string[];
  arrivalTime: string[];
  departureTime: string[];
  trainTypes: string[];
  fromStations: string[];
  toStations: string[];
};

export type TrainFilterChip =
  | {
      type: "quick";
      value: string;
      label: string;
    }
  | {
      type: "ticketType";
      value: string;
      label: string;
    }
  | {
      type: "quota";
      value: string;
      label: string;
    }
  | {
      type: "class";
      value: string;
      label: string;
    }
  | {
      type: "arrivalTime";
      value: string;
      label: string;
    }
  | {
      type: "departureTime";
      value: string;
      label: string;
    }
  | {
      type: "trainType";
      value: string;
      label: string;
    }
  | {
      type: "fromStation";
      value: string;
      label: string;
    }
  | {
      type: "toStation";
      value: string;
      label: string;
    };