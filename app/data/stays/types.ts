export type MealPlan = "EP" | "CP" | "MAP" | "AP";
export type CancellationType = "Free Cancellation" | "Non Refundable";

export type RoomVariant = {
  id: string;
  name: string;
  maxAdults: number;
  maxChildren: number;
  price: number;
  taxes: number;
  mealPlan: MealPlan;
  cancellation: CancellationType;
  availableRooms: number;
  amenities?: string[];
  roomView?: string[];
};

export type BaseProperty = {
  id: string;
  slug: string;
  city: string;
  area: string;
  title: string;
  description?: string;
  images: string[];
  rating: number;
  reviews: number;
  pricePerNight: number;
  taxes: number;
  tags?: string[];
  amenities?: string[];
  locationHighlights?: string[];
  variants: RoomVariant[];

  lat?: number;
  lng?: number;

  propertyType?: string;
  topLocation?: string[];
  roomViews?: string[];
  roomAmenities?: string[];
  houseRules?: string[];
  bookingPreference?: string[];
  luxuryTag?: boolean;
  guaranteed?: boolean;
  searchableAmenities?: string[];
};

export type Hotel = BaseProperty & {
  type: "hotel";
  starRating: number;
  brand?: string;
  chain?: string;
  checkInTime: string;
  checkOutTime: string;
  coupleFriendly?: boolean;
};

export type Homestay = BaseProperty & {
  type: "homestay";
  stayType: "entire_home" | "private_room" | "shared";
  hostType?: "owner" | "caretaker";
  kitchen?: boolean;
  parking?: boolean;
  scenicTags?: string[];
};