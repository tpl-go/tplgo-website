import {
  SmartOfferContext,
  SmartOfferItem,
} from "./smartOfferTypes";

import {
  clearSmartActiveOffer,
  getSmartActiveOffer,
} from "./smartOfferSession";

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

function isExpired(
  offer: SmartOfferItem
) {
  if (!offer.validTill) return false;

  const time = new Date(
    offer.validTill
  ).getTime();

  if (Number.isNaN(time)) return false;

  return Date.now() > time;
}

export function isSmartOfferEligible(
  offer: SmartOfferItem,
  context: SmartOfferContext
) {
  const rule = offer.rule;

  if (!offer.active) {
    return {
      eligible: false,
      reason: "INACTIVE",
    };
  }

  if (isExpired(offer)) {
    return {
      eligible: false,
      reason: "EXPIRED",
    };
  }

  if (!rule) {
    return {
      eligible: true,
      reason: "ELIGIBLE",
    };
  }

  if (
    rule.services?.length &&
    !rule.services.includes("all") &&
    !rule.services.includes(context.service)
  ) {
    return {
      eligible: false,
      reason: "SERVICE_MISMATCH",
    };
  }

  if (
    rule.domesticOnly &&
    context.isInternational
  ) {
    return {
      eligible: false,
      reason: "DOMESTIC_ONLY",
    };
  }

  if (
    rule.internationalOnly &&
    !context.isInternational
  ) {
    return {
      eligible: false,
      reason: "INTERNATIONAL_ONLY",
    };
  }

  if (
    rule.minBookingValue &&
    Number(context.bookingValue || 0) > 0 &&
    Number(context.bookingValue || 0) <
      rule.minBookingValue
  ) {
    return {
      eligible: false,
      reason: "MIN_BOOKING_NOT_MET",
    };
  }

  if (
    rule.destinations?.length &&
    context.destination &&
    !includesText(
      rule.destinations,
      context.destination
    )
  ) {
    return {
      eligible: false,
      reason: "DESTINATION_MISMATCH",
    };
  }

  if (
    rule.destinations?.length &&
    context.toCity &&
    !includesText(
      rule.destinations,
      context.toCity
    )
  ) {
    return {
      eligible: false,
      reason: "DESTINATION_MISMATCH",
    };
  }

  return {
    eligible: true,
    reason: "ELIGIBLE",
  };
}

export function validateSmartActiveOffer(
  context: SmartOfferContext
) {
  const active = getSmartActiveOffer();

  if (!active?.offer) {
    return {
      valid: false,
      applied: false,
      reason: "NO_ACTIVE_OFFER",
      offer: null,
    };
  }

  const offer = active.offer;

  const result = isSmartOfferEligible(
    offer,
    context
  );

  if (!result.eligible) {
    clearSmartActiveOffer();

    return {
      valid: false,
      applied: false,
      reason: result.reason,
      offer: null,
    };
  }

  return {
    valid: true,
    applied: true,
    reason: null,
    offer,
  };
}