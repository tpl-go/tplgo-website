import { SMART_OFFERS_DATA } from "./smartOffersData";

import {
  SmartOfferCard,
  SmartOfferContext,
  SmartOfferEngineResult,
  SmartOfferItem,
} from "./smartOfferTypes";

import { scoreSmartOffer } from "./smartOfferScoring";

import { validateSmartActiveOffer } from "./smartOfferValidation";

function estimateSaving(
  offer: SmartOfferItem,
  bookingValue = 0
) {
  if (offer.discountMode === "flat") {
    return Math.min(
      Number(offer.discountValue || 0),
      Number(
        offer.maxDiscount ||
          offer.discountValue ||
          0
      )
    );
  }

  if (offer.discountMode === "percent") {
    const value =
      (Number(bookingValue || 0) *
        Number(offer.discountValue || 0)) /
      100;

    return Math.min(
      value,
      Number(offer.maxDiscount || value)
    );
  }

  if (offer.discountMode === "wallet") {
    return Number(offer.discountValue || 0);
  }

  if (offer.discountMode === "membership") {
    return Number(offer.discountValue || 0);
  }

  return Number(offer.discountValue || 0);
}

export function getBestSmartOffer(
  context: SmartOfferContext
) {
  return SMART_OFFERS_DATA.map((offer) => {
    const scored = scoreSmartOffer(
      offer,
      context
    );

    return {
      offer,
      score: scored.score,
      eligible: scored.eligible,
      reason: scored.reason,
      saving: estimateSaving(
        offer,
        context.bookingValue
      ),
    };
  })
    .filter((item) => item.eligible)
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }

      return b.saving - a.saving;
    })[0];
}

function buildGenericFirstCard(
  context: SmartOfferContext,
  bestOffer?: {
    offer: SmartOfferItem;
    saving: number;
  }
): SmartOfferCard {
  if (bestOffer?.offer) {
    return {
      id: "smart-generic-best",
      variant: "generic",
      title: bestOffer.offer.title,
      description:
        context.isInternational
          ? "AI matched best international deal"
          : "AI matched best domestic deal",
      couponCode:
        bestOffer.offer.couponCode,
      savingAmount:
        bestOffer.saving,
      applied: false,
    };
  }

  return {
    id: "smart-generic-default",
    variant: "generic",
    title: context.isInternational
      ? "AI International Offers"
      : "AI Smart Offers",
    description: context.isInternational
      ? "International deals auto-matched"
      : "Best travel offers auto-matched",
  };
}

function buildAppliedCard(
  offer: SmartOfferItem,
  context: SmartOfferContext
): SmartOfferCard {
  return {
    id: "smart-applied-offer",
    variant: "applied",
    title: `${offer.couponCode || offer.title} Applied`,
    description: context.isInternational
      ? "International smart fare activated"
      : "Domestic smart fare activated",
    couponCode: offer.couponCode,
    savingAmount: estimateSaving(
      offer,
      context.bookingValue
    ),
    applied: true,
  };
}

function buildBankCard(
  context: SmartOfferContext
): SmartOfferCard {
  if (context.isInternational) {
    return {
      id: "smart-bank-intl",
      variant: "bank",
      title: "Save ₹3200 with ICICI",
      description:
        "International payment combo detected",
      savingAmount: 3200,
    };
  }

  return {
    id: "smart-bank-dom",
    variant: "bank",
    title: "Save ₹1200 with ICICI",
    description:
      "Hidden bank deal available",
    savingAmount: 1200,
  };
}

function buildWalletCard(
  context: SmartOfferContext
): SmartOfferCard {
  if (context.isInternational) {
    return {
      id: "smart-wallet-intl",
      variant: "wallet",
      title: "Use ₹1200 Wallet",
      description:
        "Apply TPL Credit at payment",
      savingAmount: 1200,
    };
  }

  return {
    id: "smart-wallet-dom",
    variant: "wallet",
    title: "Use ₹450 Wallet",
    description:
      "Apply TPL Credit at payment",
    savingAmount: 450,
  };
}

function buildDateCard(
  context: SmartOfferContext
): SmartOfferCard {
  const destination =
    context.toCity ||
    context.destination ||
    "Destination";

  if (context.tripType === "roundtrip") {
    return {
      id: "smart-date-roundtrip",
      variant: "date",
      title: context.isInternational
        ? "Wednesday return cheaper"
        : "Wednesday return cheaper",
      description: context.isInternational
        ? "Save upto ₹4800"
        : "Save upto ₹900",
      savingAmount: context.isInternational
        ? 4800
        : 900,
    };
  }

  return {
    id: "smart-date-oneway",
    variant: "date",
    title: context.isInternational
      ? `${destination} fares cheaper`
      : `${destination} cheaper on Tuesday`,
    description: context.isInternational
      ? "Save upto ₹4800"
      : "Save upto ₹900",
    savingAmount: context.isInternational
      ? 4800
      : 900,
  };
}

export function buildSmartOfferCards(
  context: SmartOfferContext
): SmartOfferEngineResult {
  const validation =
    validateSmartActiveOffer(context);

  const bestOffer =
    getBestSmartOffer(context);

  const firstCard =
    validation.valid && validation.offer
      ? buildAppliedCard(
          validation.offer,
          context
        )
      : buildGenericFirstCard(
          context,
          bestOffer
            ? {
                offer: bestOffer.offer,
                saving: bestOffer.saving,
              }
            : undefined
        );

  const cards: SmartOfferCard[] = [
    firstCard,
    buildBankCard(context),
    buildWalletCard(context),
    buildDateCard(context),
  ];

  return {
    appliedOffer:
      validation.valid && validation.offer
        ? firstCard
        : undefined,
    cards,
    bestOffer:
      bestOffer?.offer || null,
    reason:
      validation.reason || bestOffer?.reason,
  };
}