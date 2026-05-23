export type CruiseMainTabKey =
  | "cabin"
  | "cruiseInfo"
  | "cruiseDeckPlan"
  | "policy";

export type CruiseCabinSectionKey =
  | "cabins"
  | "sailing"
  | "dining"
  | "entertainment"
  | "policies";

export type CabinNationalityOption = {
  id: string;
  label: string;
};

export type CruiseCabinAmenity = {
  id: string;
  label: string;
  icon?: string;
};

export type CruiseCabinImage = {
  id: string;
  url: string;
  alt: string;
};

export type CruiseCabinType = {
  id: string;
  code: string;
  name: string;
  shortDescription: string;
  fullDescription: string;
  maxAdults: number;
  maxChildren: number;
  maxInfants: number;
  maxGuests: number;
  deckInfo?: string;
  pricePerPerson: number;
  images: CruiseCabinImage[];
  amenities: CruiseCabinAmenity[];
  tags?: string[];
};

export type CruiseCabinSelectionRow = {
  id: string;
  adults: number;
  children: number;
  infants: number;
  nationality: string;
};

export type CruiseSelectedCabinState = {
  cabinId: string;
  rows: CruiseCabinSelectionRow[];
  selectedAt: number;
};

export type CruiseDayPlanItem = {
  day: number;
  title: string;
  description: string;
  dateLabel?: string;
};

export type CruiseDeckCabinPoint = {
  id: string;
  cabinNumber: string;
  x: number;
  y: number;
  status: "available" | "booked" | "blocked";
  category?: string;
  deckId: string;
};

export type CruiseDeckPlan = {
  id: string;
  deckNumber: string;
  title: string;
  image: string;
  legends: string[];
  description?: string;
  selectionAvailable?: boolean;
  cabins?: CruiseDeckCabinPoint[];
};

export type CruiseInfoBlock = {
  title: string;
  value: string;
};

export type CruiseDetailExtraData = {
  cabins: CruiseCabinType[];
  nationalityOptions: CabinNationalityOption[];
  sailingPlan: CruiseDayPlanItem[];
  diningHighlights: string[];
  entertainmentHighlights: string[];
  cabinPolicies: string[];
  deckPlans: CruiseDeckPlan[];
  cruiseInfoBlocks: CruiseInfoBlock[];
};