export type ManageActionKey =
  | "summary"
  | "traveller-details"
  | "contact-details"
  | "special-request"
  | "seats"
  | "meals"
  | "baggage"
  | "cancel-booking";

export type SettlementMode = "save" | "payment" | "wallet_credit";

export type MoneyChangeType = "upgrade" | "downgrade" | "same";

export interface WalletSnapshot {
  promoCredit: number;
  earnedCredit: number;
  refundableBalance: number;
}

export interface WalletLedgerItem {
  id: string;
  type: "promo" | "earned" | "refund_credit" | "wallet_usage";
  amount: number;
  source: string;
  bookingId?: string;
  createdAt: string;
}

export interface FlightTraveller {
  id: string;
  title: string;
  firstName: string;
  lastName: string;
  type: "adult" | "child" | "infant";
}

export interface FlightContact {
  email: string;
  phone: string;
}

export interface SeatSelection {
  travellerId: string;
  oldSeatCode?: string;
  newSeatCode?: string;
  oldPrice: number;
  newPrice: number;
}

export interface MealSelection {
  travellerId: string;
  oldMealCode?: string;
  newMealCode?: string;
  oldPrice: number;
  newPrice: number;
}

export interface BaggageSelection {
  travellerId: string;
  oldBaggageCode?: string;
  newBaggageCode?: string;
  oldPrice: number;
  newPrice: number;
}

export interface ManageQuote {
  seatDiff: number;
  mealDiff: number;
  baggageDiff: number;
  upgradeTotal: number;
  downgradeTotal: number;
  airlineCharges: number;
  netPayable: number;
  walletCredit: number;
  settlementMode: SettlementMode;
}

export interface FlightManageBookingRecord {
  bookingId: string;
  pnr: string;
  bookingStatus: "confirmed" | "cancelled" | "changed";
  origin: string;
  destination: string;
  travelDate: string;
  airlineName: string;
  flightNumber: string;

  travellers: FlightTraveller[];
  contact: FlightContact;
  specialRequest?: string;

  seats: SeatSelection[];
  meals: MealSelection[];
  baggage: BaggageSelection[];

  baseFareSnapshot: {
    totalPaidAmount: number;
    currency: string;
  };
}