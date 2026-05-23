import {
  SmartOfferContext,
  SmartOfferItem,
} from "./smartOfferTypes";

import { isSmartOfferEligible } from "./smartOfferValidation";

function normalize(value?: string) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function includesText(
  list?: string[],
  value?: string
) {
  if (!list?.length || !value) return false;

  const target = normalize(value);

  return list.some((item) => {
    const current = normalize(item);

    return (
      current === target ||
      current.includes(target) ||
      target.includes(current)
    );
  });
}

export function scoreSmartOffer(
  offer: SmartOfferItem,
  context: SmartOfferContext
) {
  const eligibility = isSmartOfferEligible(
    offer,
    context
  );

  if (!eligibility.eligible) {
    return {
      score: -999,
      reason: eligibility.reason,
      eligible: false,
    };
  }

  let score = offer.priority || 0;

  if (
    offer.service === context.service ||
    offer.service === "all"
  ) {
    score += 50;
  }

  if (
    offer.rule?.destinations?.length &&
    (includesText(
      offer.rule.destinations,
      context.toCity
    ) ||
      includesText(
        offer.rule.destinations,
        context.destination
      ))
  ) {
    score += 35;
  }

  if (
    offer.rule?.domesticOnly &&
    !context.isInternational
  ) {
    score += 20;
  }

  if (
    offer.rule?.internationalOnly &&
    context.isInternational
  ) {
    score += 25;
  }

  if (offer.featured) {
    score += 10;
  }

  if (
    offer.stackableWithWallet
  ) {
    score += 5;
  }

  if (
    offer.stackableWithMembership
  ) {
    score += 5;
  }

  return {
    score,
    reason: eligibility.reason,
    eligible: true,
  };
}