import type { CreatorCartState } from "./creatorCartTypes";

const CREATOR_CART_SESSION_KEY = "tpl_creator_cart_preview_v1";

function createEmptyCart(): CreatorCartState {
  return {
    id: `creator-cart-${Date.now()}`,
    items: [],
    persistence: "session",
    updatedAt: new Date().toISOString(),
    schemaVersion: 1,
  };
}

function canUseSessionStorage() {
  return typeof window !== "undefined" && Boolean(window.sessionStorage);
}

export function getEmptyCreatorCart(): CreatorCartState {
  return createEmptyCart();
}

export function readCreatorCart(): CreatorCartState {
  if (!canUseSessionStorage()) return createEmptyCart();

  try {
    const raw = window.sessionStorage.getItem(CREATOR_CART_SESSION_KEY);
    if (!raw) return createEmptyCart();
    const parsed = JSON.parse(raw) as CreatorCartState;
    if (parsed.schemaVersion !== 1 || parsed.persistence !== "session" || !Array.isArray(parsed.items)) {
      return createEmptyCart();
    }
    return parsed;
  } catch {
    return createEmptyCart();
  }
}

export function writeCreatorCart(cart: CreatorCartState): CreatorCartState {
  const nextCart = { ...cart, updatedAt: new Date().toISOString() };
  if (canUseSessionStorage()) {
    window.sessionStorage.setItem(CREATOR_CART_SESSION_KEY, JSON.stringify(nextCart));
  }
  return nextCart;
}

export function clearCreatorCart(): CreatorCartState {
  if (canUseSessionStorage()) {
    window.sessionStorage.removeItem(CREATOR_CART_SESSION_KEY);
  }
  return createEmptyCart();
}
