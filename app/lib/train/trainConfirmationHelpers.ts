export type TrainConfirmedBookingData = {
  pnr: string;
  bookingPayload: {
    trainId?: string;
    trainName: string;
    trainNumber: string;
    fromCity: string;
    fromCode: string;
    toCity: string;
    toCode: string;
    travelDate: string;
    departureTime: string;
    arrivalTime: string;
    duration: string;
    classCode: string;
    quota: string;
    bookingType: string;
    ticketPrice: number;
    statusText?: string;
  };
  travellers: {
    fullName?: string;
    age?: string;
    gender?: string;
    berthPreference?: string;
  }[];
  contactDetails?: {
    email?: string;
    mobile?: string;
  };
  irctcAccount?: {
    username?: string;
  };
  appliedOffer?: {
    code?: string;
    title?: string;
    description?: string;
    discountAmount?: number;
  } | null;
  pricing: {
    baseFare: number;
    convenienceFee: number;
    gatewayFee: number;
    offerApplied: number;
    tplCredit: number;
    totalAmount: number;
  };
  verifiedAt?: number;
  bookingStatus?: string;
};

export function generateTrainPNR() {
  return Math.floor(1000000000 + Math.random() * 9000000000).toString();
}

export function buildConfirmedTrainBookingPayload(raw: any) {
  return {
    ...raw,
    pnr: raw?.pnr || generateTrainPNR(),
    bookingStatus: raw?.bookingStatus || "Confirmed",
  } as TrainConfirmedBookingData;
}

export function saveTrainBookingToUserBookings(
  booking: TrainConfirmedBookingData,
  storageKey = "tplUserBookings"
) {
  if (typeof window === "undefined") return;

  try {
    const raw = localStorage.getItem(storageKey);
    const existing = raw ? JSON.parse(raw) : [];

    const nextItem = {
      type: "train",
      id: `${booking.bookingPayload.trainId || booking.bookingPayload.trainNumber}-${booking.pnr}`,
      pnr: booking.pnr,
      bookingStatus: booking.bookingStatus || "Confirmed",
      createdAt: booking.verifiedAt || Date.now(),
      bookingData: booking,
    };

    const alreadyExists = Array.isArray(existing)
      ? existing.some(
          (item: any) =>
            item?.type === "train" &&
            item?.pnr === booking.pnr
        )
      : false;

    const next = alreadyExists ? existing : [nextItem, ...(Array.isArray(existing) ? existing : [])];

    localStorage.setItem(storageKey, JSON.stringify(next));
  } catch {
    // ignore local storage failures safely
  }
}

export function formatTrainDate(dateStr?: string) {
  if (!dateStr) return "N/A";

  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;

  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}