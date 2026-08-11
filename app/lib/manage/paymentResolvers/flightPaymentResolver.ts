type ManageSection = "seats" | "meals" | "baggage" | "update";

type QuoteParams = {
  bookingId: string;
  section?: ManageSection | string;
};

type FinalizeParams = {
  bookingId: string;
  section?: ManageSection | string;
};

function unavailableFlightManageQuote(section?: string) {
  return {
    totalAmount: 0,
    currency: "INR",
    unavailable: true,
    reason:
      section === "seats" || section === "meals" || section === "baggage"
        ? "Flight manage-booking ancillary changes require a backend/provider quote. No static seat, meal or baggage pricing is available."
        : "Flight manage-booking payment requires backend authority.",
    breakdown: {
      seatDiff: 0,
      mealDiff: 0,
      baggageDiff: 0,
    },
  };
}

export function getQuote({ section }: QuoteParams) {
  return unavailableFlightManageQuote(section);
}

export function finalize({ section }: FinalizeParams) {
  throw new Error(unavailableFlightManageQuote(section).reason);
}
