export function formatWebCheckInPnr(value: string) {
  return value
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 10);
}

export function formatPassengerLastName(value: string) {
  return value
    .trim()
    .replace(/[^a-zA-Z\s]/g, "")
    .toUpperCase();
}

export function isValidWebCheckInPayload(payload: {
  pnr: string;
  lastName: string;
  airline: string;
}) {
  return Boolean(
    payload.pnr.trim() &&
      payload.lastName.trim() &&
      payload.airline.trim()
  );
}