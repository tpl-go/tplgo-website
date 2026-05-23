export function isBookingExpired(expiresAt: string) {
  return new Date(expiresAt).getTime() <= Date.now();
}

export function getBookingTimeLeftInSeconds(expiresAt: string) {
  const diff = Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000);
  return diff > 0 ? diff : 0;
}

export function formatTimeLeft(seconds: number) {
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}