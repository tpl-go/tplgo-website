import { SmartOfferItem } from "./smartOfferTypes";

type SmartOfferDiscountInput = Record<string, unknown> &
  Partial<
    Pick<SmartOfferItem, "discountMode" | "discountValue" | "maxDiscount">
  >;

type Params = {
  offer?: SmartOfferItem | null;
  bookingValue: number;
  promoCredit?: number;
  earnedCredit?: number;
  refundWallet?: number;
  userTier?: string;
};

export function calculateSmartOfferDiscount(
  offer?: SmartOfferDiscountInput | null,
  bookingValue = 0
) {
  if (!offer) return 0;

  if (offer.discountMode === "flat") {
    return Math.min(
      Number(offer.discountValue || 0),
      Number(offer.maxDiscount || offer.discountValue || 0)
    );
  }

  if (offer.discountMode === "percent") {
    const value =
      (Number(bookingValue || 0) * Number(offer.discountValue || 0)) / 100;

    return Math.min(value, Number(offer.maxDiscount || value));
  }

  if (offer.discountMode === "cashback") {
    return Number(offer.maxDiscount || offer.discountValue || 0);
  }

  if (offer.discountMode === "wallet") {
    return Number(offer.discountValue || 0);
  }

  if (offer.discountMode === "membership") {
    return Number(offer.discountValue || 0);
  }

  return 0;
}

export function calculateSmartMembershipSaving(
  userTier = "guest",
  bookingValue = 0
) {
  const amount = Number(bookingValue || 0);

  switch (userTier.toLowerCase()) {
    case "silver":
      return Math.min(amount * 0.01, 500);

    case "gold":
      return Math.min(amount * 0.02, 1500);

    case "platinum":
      return Math.min(amount * 0.03, 3500);

    case "signature":
      return Math.min(amount * 0.05, 10000);

    default:
      return 0;
  }
}

export function calculateSmartWalletUse({
  bookingValue,
  promoCredit = 0,
  earnedCredit = 0,
  refundWallet = 0,
}: Params) {
  const walletTotal =
    Number(promoCredit || 0) +
    Number(earnedCredit || 0) +
    Number(refundWallet || 0);

  const maxWalletAllowed = Number(bookingValue || 0) * 0.12;

  return Math.round(
    Math.min(walletTotal, maxWalletAllowed, Number(bookingValue || 0))
  );
}

export function calculateSmartOfferStack(params: Params) {
  const bookingValue = Number(params.bookingValue || 0);

  const offerSaving = calculateSmartOfferDiscount(
    params.offer,
    bookingValue
  );

  const membershipSaving = params.offer?.stackableWithMembership
    ? calculateSmartMembershipSaving(params.userTier, bookingValue)
    : 0;

  const remainingAfterOffer = Math.max(
    bookingValue - offerSaving - membershipSaving,
    0
  );

  const walletUsed = params.offer?.stackableWithWallet
    ? calculateSmartWalletUse({
        ...params,
        bookingValue: remainingAfterOffer,
      })
    : 0;

  const finalPayable = Math.max(
    bookingValue - offerSaving - membershipSaving - walletUsed,
    0
  );

  return {
    bookingValue: Math.round(bookingValue),
    offerSaving: Math.round(offerSaving),
    membershipSaving: Math.round(membershipSaving),
    walletUsed: Math.round(walletUsed),
    totalSaving: Math.round(offerSaving + membershipSaving + walletUsed),
    finalPayable: Math.round(finalPayable),
  };
}
