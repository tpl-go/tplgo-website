export type FlightCurrency = "INR" | (string & {});

export function normalizeFlightCurrency(value: unknown): FlightCurrency {
  if (typeof value !== "string") return "INR";
  const normalized = value.trim().toUpperCase();
  return /^[A-Z]{3}$/.test(normalized) ? normalized : "INR";
}

export function isInrFlightCurrency(value: unknown): value is "INR" {
  return normalizeFlightCurrency(value) === "INR";
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
      currencyDisplay: "symbol",
      maximumFractionDigits: safeCurrency === "INR" ? 0 : 2,
    }).format(safeAmount);
  } catch {
    return `${safeCurrency} ${safeAmount.toLocaleString("en-IN", {
      maximumFractionDigits: safeCurrency === "INR" ? 0 : 2,
    })}`;
  }
}
