export type FlightCurrency = "INR" | (string & {});
export type FlightPriceSnapshot = {
  amount: number;
  currency: FlightCurrency;
};

export type FlightDisplayPriceSnapshot = FlightPriceSnapshot & {
  fxRate?: string;
  fxSource?: string;
  fxTimestamp?: string;
  roundingVersion?: string;
};

export type FlightPaymentQuoteSnapshot = {
  supplierAmount: number;
  supplierCurrency: FlightCurrency;
  displayAmount: number;
  displayCurrency: FlightCurrency;
  payableAmount: number;
  payableCurrency: FlightCurrency;
  fxRate?: string;
  fxTimestamp?: string;
  expiresAt: string;
  quoteId: string;
};

const DISPLAY_CURRENCIES: FlightCurrency[] = ["INR", "USD", "GBP", "EUR", "AED", "SGD", "AUD", "CAD", "JPY"];
export const FLIGHT_CURRENCY_STORAGE_KEY = "tpl_flight_display_currency_v1";

export function normalizeFlightCurrency(value: unknown): FlightCurrency {
  if (typeof value !== "string") return "INR";
  const normalized = value.trim().toUpperCase();
  return /^[A-Z]{3}$/.test(normalized) ? normalized : "INR";
}

export function isInrFlightCurrency(value: unknown): value is "INR" {
  return normalizeFlightCurrency(value) === "INR";
}

export function getSupportedFlightDisplayCurrencies(): FlightCurrency[] {
  return DISPLAY_CURRENCIES;
}

export function isSupportedFlightDisplayCurrency(value: unknown): boolean {
  const normalized = normalizeFlightCurrency(value);
  return DISPLAY_CURRENCIES.includes(normalized);
}

export function readFlightDisplayCurrencyPreference(): FlightCurrency {
  if (typeof window === "undefined") return "INR";
  try {
    const stored = window.localStorage.getItem(FLIGHT_CURRENCY_STORAGE_KEY);
    return isSupportedFlightDisplayCurrency(stored) ? normalizeFlightCurrency(stored) : "INR";
  } catch {
    return "INR";
  }
}

export function saveFlightDisplayCurrencyPreference(currency: FlightCurrency) {
  if (typeof window === "undefined") return;
  const normalized = normalizeFlightCurrency(currency);
  if (!isSupportedFlightDisplayCurrency(normalized)) return;
  window.localStorage.setItem(FLIGHT_CURRENCY_STORAGE_KEY, normalized);
  window.dispatchEvent(new CustomEvent("TPL_FLIGHT_CURRENCY_UPDATED", { detail: { currency: normalized } }));
}

export function formatFlightMoney(
  amount: number,
  currency: FlightCurrency = "INR"
): string {
  const safeAmount = Number.isFinite(Number(amount)) ? Number(amount) : 0;
  const safeCurrency = normalizeFlightCurrency(currency);

  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: safeCurrency,
      currencyDisplay: safeCurrency === "INR" ? "symbol" : "code",
      maximumFractionDigits: safeCurrency === "INR" || safeCurrency === "JPY" ? 0 : 2,
    }).format(safeAmount);
  } catch {
    return `${safeCurrency} ${safeAmount.toLocaleString("en-IN", {
      maximumFractionDigits: safeCurrency === "INR" || safeCurrency === "JPY" ? 0 : 2,
    })}`;
  }
}
