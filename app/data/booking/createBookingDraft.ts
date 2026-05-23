import type { BookingRecord } from "./bookingSchema";
import { generateBookingId } from "./bookingTypes";

type CreateBookingDraftInput = {
  serial: number;
  packageSlug: string;
  packageTitle: string;
  variant: "withFlight" | "withoutFlight";
  travelDateLabel: string;
  originCity: string;

  travellers: BookingRecord["travellers"];
  contactDetails: BookingRecord["contactDetails"];
  gstDetails: BookingRecord["gstDetails"];
  specialRequests: string;

  insuranceSelected: boolean;
  paymentMethod?: string;

  priceBreakup: BookingRecord["priceBreakup"];
};

export function createBookingDraft(
  input: CreateBookingDraftInput
): BookingRecord {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 10 * 60 * 1000);

  return {
    bookingId: generateBookingId(input.serial),
    packageSlug: input.packageSlug,
    packageTitle: input.packageTitle,
    variant: input.variant,
    travelDateLabel: input.travelDateLabel,
    originCity: input.originCity,

    travellers: input.travellers,
    contactDetails: input.contactDetails,
    gstDetails: input.gstDetails,
    specialRequests: input.specialRequests,

    insuranceSelected: input.insuranceSelected,
    paymentMethod: input.paymentMethod,

    priceBreakup: input.priceBreakup,

    bookingStatus: "INITIATED",
    paymentStatus: "NOT_STARTED",

    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
  };
}