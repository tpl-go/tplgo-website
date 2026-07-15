export type PackageSource = "database" | "api";

export interface PackageIndexItem {
  id: string;
  slug: string;

  title: string;
  shortTitle?: string;

  continent: string;
  countries: string[];
  cities: string[];

  theme: string[];
  subThemes: string[];

  nights: number;
  days: number;

  startingPrice: number;
  currency?: string;

  image: string;

  tags?: string[];

  source: PackageSource;

  detailFile: string;
}

export interface PackageItineraryDay {
  day: number;
  title: string;
  description?: string;
  activities?: string[];
  items: string[];
}

export interface PackageVariant {
  label: string;
  pricePerPerson: number;
  originCity?: string;

  inclusions: {
    flights?: number;
    hotels?: number;
    transfers?: number;
    activities?: number;
    meals?: number;
  };
}

export interface PackageMedia {
  coverImage: string;
  gallery?: string[];
  videoUrl?: string; // youtube link support
}

export interface PackageDetails {
  id: string;
  slug: string;

  title: string;
  tagline?: string;
  category?: string;
  defaultOriginCity?: string;
  originCity?: string;

  nights: number;
  days: number;

  route: string[];

  media: PackageMedia;

  variants: {
    withFlight?: PackageVariant;
    withoutFlight?: PackageVariant;
  };

  highlights?: string[];

  itinerary: PackageItineraryDay[];

  inclusions?: string[];
  exclusions?: string[];

  policies?: {
    cancellation?: string;
    dateChange?: string;
    terms?: string;
  };
}
