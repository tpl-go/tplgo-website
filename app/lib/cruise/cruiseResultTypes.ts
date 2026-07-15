export type CruiseResultSearchMeta = {
  destinationId: string | null;
  departurePortId: string | null;
  sailingDate: string | null;
  sailingMonth: string | null;
  durationId: string | null;
  adults: number;
  children: number;
  infants: number;
};

export type CruiseFilterState = {
  sailingMonths: string[];
  priceRanges: string[];
  durations: string[];
  destinations: string[];
  departurePorts: string[];
  cruiseLines: string[];
  cruiseShips: string[];
  arrivalPorts: string[];
  cabinOccupancy: string[];
};

export type CruiseInfoItem = {
  id: string;
  label: string;
  title: string;
  description: string;
};

export type CruiseBadge = {
  id: string;
  label: string;
  type:
    | "promo"
    | "credit"
    | "special"
    | "deposit"
    | "refundable"
    | "cabin"
    | "info";
  popup: CruiseInfoItem;
};

export type CruiseSailingOption = {
  id: string;
  date: string;
  monthKey: string;
  inside?: number;
  outside?: number;
  balcony?: number;
  suite?: number;
  badges: CruiseBadge[];
  infoItems: CruiseInfoItem[];
};

export type CruiseResultItem = {
  id: string;
  title: string;
  tripLabel: string;
  regionLabel: string;
  cruiseLine: string;
  shipName: string;
  departurePort: string;
  arrivalPort: string;
  durationNights: number;
  mapImage: string;
  lowestRates: {
    inside?: number;
    outside?: number;
    balcony?: number;
    suite?: number;
  };
  taxesText: string;
  refundableType?: string;
  callbackEnabled: boolean;
  sailingDates: CruiseSailingOption[];
  badges: CruiseBadge[];
  promoItems: CruiseInfoItem[];
};

export type CruiseFilterOption = {
  id: string;
  label: string;
  count?: number;
};

export type CruiseFilterSectionConfig = {
  key: keyof CruiseFilterState;
  label: string;
  options: CruiseFilterOption[];
};

export type CruiseSortKey =
  | "price"
  | "duration"
  | "departure"
  | "price-low-high"
  | "price-high-low"
  | "duration-low-high"
  | "duration-high-low"
  | "departure-az"
  | "departure-za"
  | "line-az"
  | "ship-az";
