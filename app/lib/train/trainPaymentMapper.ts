export type RawTrainPaymentPayload = {
  bookingPayload?: any;
  travellers?: {
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
  pricing?: {
    baseFare?: number;
    convenienceFee?: number;
    gatewayFee?: number;
    offerApplied?: number;
    tplCredit?: number;
    totalAmount?: number;
  };
  timerLeft?: number;
};

export type NormalizedTrainJourney = {
  trainId: string;
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
  statusText: string;
};

export type NormalizedTrainPaymentData = {
  bookingPayload: NormalizedTrainJourney;
  travellers: {
    fullName?: string;
    age?: string;
    gender?: string;
    berthPreference?: string;
  }[];
  contactDetails: {
    email?: string;
    mobile?: string;
  };
  irctcAccount: {
    username?: string;
  };
  appliedOffer: {
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
  timerLeft: number;
};

function toNumber(value: unknown, fallback = 0): number {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function toText(value: unknown, fallback = ""): string {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return fallback;
}

function resolveBookingType(ticketType: unknown, fallback = "Regular Ticket") {
  const value = toText(ticketType).toLowerCase();

  if (value === "confirm") return "Confirm Ticket";
  if (value === "regular") return "Regular Ticket";
  if (value === "tatkal") return "Tatkal Ticket";

  return fallback;
}

export function normalizeTrainPaymentPayload(
  raw: RawTrainPaymentPayload
): NormalizedTrainPaymentData {
  const bookingPayload = raw?.bookingPayload || {};
  const train = bookingPayload?.train || {};

  const searchMeta = bookingPayload?.searchMeta || bookingPayload?.search || {};
  const bookingSelection = bookingPayload?.bookingSelection || {};

  const baseFare =
    toNumber(raw?.pricing?.baseFare) ||
    toNumber(bookingSelection?.confirmTicketPrice) ||
    toNumber(bookingSelection?.ticketPrice) ||
    toNumber(bookingPayload?.ticketPrice) ||
    toNumber(train?.ticketPrice);


console.log("DATE SOURCE CHECK", {
  searchMeta,
  bookingPayload,
  bookingSelection,
  train,
});

  const normalizedJourney: NormalizedTrainJourney = {
  trainId: toText(
    train?.id ??
      bookingPayload?.trainId ??
      bookingPayload?.id,
    ""
  ),
  trainName: toText(
    train?.trainName ??
      bookingPayload?.trainName ??
      bookingPayload?.name,
    "Train"
  ),
  trainNumber: toText(
    train?.trainNumber ??
      bookingPayload?.trainNumber ??
      bookingPayload?.number,
    ""
  ),
  fromCity: toText(
    searchMeta?.fromCity ??
      train?.fromCity ??
      bookingPayload?.fromCity ??
      bookingPayload?.sourceCity,
    ""
  ),
  fromCode: toText(
    searchMeta?.fromCode ??
      train?.fromCode ??
      train?.fromStationCode ??
      bookingPayload?.fromCode ??
      bookingPayload?.sourceCode,
    ""
  ),
  toCity: toText(
    searchMeta?.toCity ??
      train?.toCity ??
      bookingPayload?.toCity ??
      bookingPayload?.destinationCity,
    ""
  ),
  toCode: toText(
    searchMeta?.toCode ??
      train?.toCode ??
      train?.toStationCode ??
      bookingPayload?.toCode ??
      bookingPayload?.destinationCode,
    ""
  ),




  travelDate: toText(
  searchMeta?.date ||
    bookingPayload?.date ||
    bookingPayload?.travelDate ||
    bookingPayload?.journeyDate ||
    bookingSelection?.date ||
    train?.date,
  ""
),
  departureTime: toText(
    train?.departureTime ??
      bookingPayload?.departureTime ??
      bookingPayload?.departTime,
    ""
  ),
  arrivalTime: toText(
    train?.arrivalTime ??
      bookingPayload?.arrivalTime ??
      bookingPayload?.arriveTime,
    ""
  ),
  duration: toText(
    train?.duration ??
      bookingPayload?.duration,
    ""
  ),
  classCode: toText(
    bookingSelection?.classCode ??
      bookingPayload?.classCode ??
      bookingPayload?.selectedClassCode,
    ""
  ),
  quota: toText(
    bookingSelection?.quota ??
      bookingPayload?.quota ??
      bookingPayload?.selectedQuota,
    "General"
  ),
  bookingType: resolveBookingType(
    bookingSelection?.ticketType ?? bookingPayload?.bookingType,
    "Regular Ticket"
  ),
  ticketPrice: baseFare,
  statusText: toText(
    bookingSelection?.statusText ??
      bookingSelection?.availabilityText ??
      bookingPayload?.statusText ??
      bookingPayload?.selectedStatusText,
    "Selected"
  ),
};

  return {
    bookingPayload: normalizedJourney,
    travellers: Array.isArray(raw?.travellers) ? raw.travellers : [],
    contactDetails: {
      email: toText(raw?.contactDetails?.email, ""),
      mobile: toText(raw?.contactDetails?.mobile, ""),
    },
    irctcAccount: {
      username: toText(raw?.irctcAccount?.username, ""),
    },
    appliedOffer: raw?.appliedOffer
      ? {
          code: toText(raw.appliedOffer.code, ""),
          title: toText(raw.appliedOffer.title, ""),
          description: toText(raw.appliedOffer.description, ""),
          discountAmount: toNumber(raw.appliedOffer.discountAmount, 0),
        }
      : null,
    pricing: {
      baseFare: toNumber(raw?.pricing?.baseFare, baseFare),
      convenienceFee: toNumber(raw?.pricing?.convenienceFee, 0),
      gatewayFee: toNumber(raw?.pricing?.gatewayFee, 0),
      offerApplied: toNumber(raw?.pricing?.offerApplied, 0),
      tplCredit: toNumber(raw?.pricing?.tplCredit, 0),
      totalAmount: toNumber(
        raw?.pricing?.totalAmount,
        Math.max(
          0,
          baseFare +
            toNumber(raw?.pricing?.convenienceFee, 0) +
            toNumber(raw?.pricing?.gatewayFee, 0) -
            toNumber(raw?.pricing?.offerApplied, 0) -
            toNumber(raw?.pricing?.tplCredit, 0)
        )
      ),
    },
    timerLeft: toNumber(raw?.timerLeft, 15 * 60),
  };
}

export function buildTrainPaymentSessionData(input: {
  bookingPayload: any;
  travellers: {
    fullName?: string;
    age?: string;
    gender?: string;
    berthPreference?: string;
  }[];
  contactDetails: {
    email?: string;
    mobile?: string;
  };
  irctcAccount: {
    username?: string;
  };
  appliedOffer?: {
    code?: string;
    title?: string;
    description?: string;
    discountAmount?: number;
  } | null;
  pricing: {
    baseFare?: number;
    convenienceFee?: number;
    gatewayFee?: number;
    offerApplied?: number;
    tplCredit?: number;
    totalAmount?: number;
  };
  timerLeft?: number;
}): NormalizedTrainPaymentData {
  return normalizeTrainPaymentPayload({
    bookingPayload: input.bookingPayload,
    travellers: input.travellers,
    contactDetails: input.contactDetails,
    irctcAccount: input.irctcAccount,
    appliedOffer: input.appliedOffer || null,
    pricing: input.pricing,
    timerLeft: input.timerLeft,
  });
}

export function getNormalizedTrainPaymentDataFromSession(
  storageKey = "tplTrainPaymentData"
): NormalizedTrainPaymentData | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = sessionStorage.getItem(storageKey);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as RawTrainPaymentPayload;
    return normalizeTrainPaymentPayload(parsed);
  } catch {
    return null;
  }
}