import { createBookingDraft } from "./createBookingDraft";
import type { BookingRecord } from "./bookingSchema";

type BuildBookingDraftInput = {
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

  basePricePerPerson: number;
  totalTravellers: number;
  taxes: number;
  couponDiscount: number;
  insuranceAmount: number;
  payNowAmount: number;
};

export function buildBookingDraft(input: BuildBookingDraftInput) {
  const basicCost = input.basePricePerPerson * input.totalTravellers;
  const totalPayable =
    basicCost + input.taxes - input.couponDiscount + input.insuranceAmount;
  const payLaterAmount = Math.max(totalPayable - input.payNowAmount, 0);

  return createBookingDraft({
    serial: input.serial,
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

    priceBreakup: {
      basePricePerPerson: input.basePricePerPerson,
      totalTravellers: input.totalTravellers,
      basicCost,
      taxes: input.taxes,
      couponDiscount: input.couponDiscount,
      insuranceAmount: input.insuranceAmount,
      totalPayable,
      payNowAmount: input.payNowAmount,
      payLaterAmount,
    },
  });
}