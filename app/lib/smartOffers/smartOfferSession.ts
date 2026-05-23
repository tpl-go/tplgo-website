import { SmartOfferItem, SmartOfferService } from "./smartOfferTypes";

const SMART_ACTIVE_OFFER_KEY = "tpl_smart_active_offer_v1";
const SMART_OFFER_SOURCE_KEY = "tpl_smart_offer_source_v1";

const SPECIAL_ACTIVE_OFFER_PAYLOAD_KEY = "tplActiveOfferPayload";
const SPECIAL_ACTIVE_OFFER_ACTIVATION_KEY = "tplActiveOfferActivation";

export type SmartOfferSource =
  | "homepage"
  | "results"
  | "booking"
  | "payment"
  | "manual"
  | "ai_auto";

export type SmartActiveOfferPayload = {
  offer: SmartOfferItem;
  source: SmartOfferSource;
  activatedAt: number;
};

type ActivateSmartOfferOptions = {
  service?: SmartOfferService;
  destination?: string;
  bookingValue?: number;
  discountAmount?: number;
  entryPoint?: string;
};

export function activateSmartOffer(
  offer: SmartOfferItem,
  source: SmartOfferSource = "manual",
  options: ActivateSmartOfferOptions = {}
) {
  if (typeof window === "undefined") return;

  const activatedAt = Date.now();

  const payload: SmartActiveOfferPayload = {
    offer,
    source,
    activatedAt,
  };

  sessionStorage.setItem(SMART_ACTIVE_OFFER_KEY, JSON.stringify(payload));
  sessionStorage.setItem(SMART_OFFER_SOURCE_KEY, source);

  const couponCode = offer.couponCode || offer.slug;

  const specialOfferPayload = {
    id: offer.id,
    offerId: offer.id,
    slug: offer.slug,
    title: offer.title,
    subtitle: offer.subtitle,
    description: offer.description,
    service: options.service || offer.service,
    offerType: offer.offerType,
    couponCode,
    code: couponCode,
    discountMode: offer.discountMode,
    discountValue: offer.discountValue || 0,
    maxDiscount: offer.maxDiscount || 0,
    discountAmount: options.discountAmount || 0,
    destination: options.destination || "",
    bookingValue: options.bookingValue || 0,
    active: offer.active,
    source,
    autoApplied: source === "ai_auto" || source === "results",
    activatedAt,
  };

  const specialOfferActivation = {
    source,
    entryPoint: options.entryPoint || "smart_results_offer_strip",
    service: options.service || offer.service,
    destination: options.destination || "",
    bookingValue: options.bookingValue || 0,
    couponCode,
    code: couponCode,
    autoApplied: source === "ai_auto" || source === "results",
    activatedAt,
  };

  sessionStorage.setItem(
    SPECIAL_ACTIVE_OFFER_PAYLOAD_KEY,
    JSON.stringify(specialOfferPayload)
  );

  sessionStorage.setItem(
    SPECIAL_ACTIVE_OFFER_ACTIVATION_KEY,
    JSON.stringify(specialOfferActivation)
  );

  window.dispatchEvent(new CustomEvent("TPL_SMART_OFFER_UPDATED"));
  window.dispatchEvent(new CustomEvent("TPL_ACTIVE_OFFER_UPDATED"));
}

export function getSmartActiveOffer(): SmartActiveOfferPayload | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = sessionStorage.getItem(SMART_ACTIVE_OFFER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getSmartActiveOfferItem(): SmartOfferItem | null {
  return getSmartActiveOffer()?.offer || null;
}

export function clearSmartActiveOffer() {
  if (typeof window === "undefined") return;

  sessionStorage.removeItem(SMART_ACTIVE_OFFER_KEY);
  sessionStorage.removeItem(SMART_OFFER_SOURCE_KEY);
  sessionStorage.removeItem(SPECIAL_ACTIVE_OFFER_PAYLOAD_KEY);
  sessionStorage.removeItem(SPECIAL_ACTIVE_OFFER_ACTIVATION_KEY);

  window.dispatchEvent(new CustomEvent("TPL_SMART_OFFER_UPDATED"));
  window.dispatchEvent(new CustomEvent("TPL_ACTIVE_OFFER_UPDATED"));
}

export function hasSmartActiveOffer() {
  return Boolean(getSmartActiveOfferItem());
}

export function notifySmartOfferUpdated() {
  if (typeof window === "undefined") return;

  window.dispatchEvent(new CustomEvent("TPL_SMART_OFFER_UPDATED"));
  window.dispatchEvent(new CustomEvent("TPL_ACTIVE_OFFER_UPDATED"));
}