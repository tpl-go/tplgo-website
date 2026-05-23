export function calculateFlightPayloadTotal(payload: any) {
  const reviewData = payload?.reviewData || {};
  const seatMealData = payload?.seatMealData || {};
  const cabData = payload?.cabData || {};
  const insuranceData = payload?.insuranceData || {};
  const addonsData = payload?.addonsData || {};
  const offerData = payload?.offerData || null;

  const pricing = reviewData?.pricing || {};

  const passengerCount =
    Number(reviewData?.passengers?.adults || 0) +
    Number(reviewData?.passengers?.children || 0) +
    Number(reviewData?.passengers?.infants || 0);

  return Math.max(
    Number(pricing.perAdultBaseFare || 0) * passengerCount +
      Number(pricing.tax || 0) +
      Number(pricing.surcharge || 0) +
      Number(seatMealData?.seatTotal || 0) +
      Number(seatMealData?.mealTotal || 0) +
      Number(cabData?.cabPrice || 0) +
      Number(insuranceData?.insurancePrice || 0) +
      Number(addonsData?.addonsPrice || 0) -
      Number(offerData?.discountAmount || 0) -
      Number(pricing.discount || 0) -
      Number(pricing.tplCredit || 0),
    0
  );
}

export function resolveFlightDisplayAmount(params: {
  booking?: { amount?: number } | null;
  payload?: any;
}) {
  const { booking, payload } = params;

  const manageUpdatedTotal = Number(
    payload?.managePayment?.updatedTotalAmount || 0
  );

  if (manageUpdatedTotal > 0) {
    return manageUpdatedTotal;
  }

  const originalPaidTotal = Number(payload?.paymentData?.totalPaid || 0);
  if (originalPaidTotal > 0) {
    return originalPaidTotal;
  }

  const bookingAmount = Number(booking?.amount || 0);
  if (bookingAmount > 0) {
    return bookingAmount;
  }

  return calculateFlightPayloadTotal(payload);
}