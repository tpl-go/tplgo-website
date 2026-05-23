export type CruiseEntityType = "destination" | "region" | "route";

export type CruiseDestination = {
  id: string;
  label: string;
  type: CruiseEntityType;
  countryCode?: string;
  description?: string;
  popular?: boolean;
  keywords?: string[];
};

export type CruisePort = {
  id: string;
  label: string;
  countryCode?: string;
  destinationIds?: string[];
  regionIds?: string[];
  popular?: boolean;
  keywords?: string[];
};

export type CruiseSailingMode = "date" | "month";

export type CruiseSailing = {
  mode: CruiseSailingMode;
  exactDate: string | null;
  month: string | null;
};

export type CruiseDurationOption = {
  id: string;
  label: string;
  minNights?: number;
  maxNights?: number | null;
};

export type CruiseTravellers = {
  adults: number;
  children: number;
  infants: number;
};

export type CruiseSearchState = {
  destination: CruiseDestination | null;
  departurePort: CruisePort | null;
  sailing: CruiseSailing;
  duration: CruiseDurationOption | null;
  travellers: CruiseTravellers;
};

export type CruiseSearchPayload = {
  destinationId: string | null;
  departurePortId: string | null;
  sailingMode: CruiseSailingMode;
  sailingDate: string | null;
  sailingMonth: string | null;
  durationId: string | null;
  adults: number;
  children: number;
  infants: number;
};

export type CruiseSearchOptionsResponse = {
  destinations: CruiseDestination[];
  ports: CruisePort[];
  durations: CruiseDurationOption[];
};

export type CruiseSearchOptionsRequest = {
  destinationId?: string | null;
  portId?: string | null;
  query?: string;
};

export type CruiseSearchApiDestination = {
  id: string;
  name: string;
  type: CruiseEntityType;
  countryCode?: string;
  description?: string;
  popular?: boolean;
  keywords?: string[];
};

export type CruiseSearchApiPort = {
  id: string;
  name: string;
  countryCode?: string;
  destinationIds?: string[];
  regionIds?: string[];
  popular?: boolean;
  keywords?: string[];
};

export type CruiseSearchApiDuration = {
  id: string;
  name: string;
  minNights?: number;
  maxNights?: number | null;
};