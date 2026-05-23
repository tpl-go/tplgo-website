import type { CabConfirmationBookingRecord } from "./cabConfirmationTypes";

const CAB_BOOKING_STORAGE_KEY = "tplCabConfirmedBookings";

export function generateCabBookingId() {
  const random = Math.floor(100000 + Math.random() * 900000);
  return `TCB${random}`;
}

export function generateCabTransactionId() {
  const random = Math.floor(10000000 + Math.random() * 90000000);
  return `TXN-CAB-${random}`;
}

export function getStoredCabBookings(): CabConfirmationBookingRecord[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(CAB_BOOKING_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveCabConfirmedBooking(
  booking: CabConfirmationBookingRecord
) {
  if (typeof window === "undefined") return;

  const existing = getStoredCabBookings();
  const updated = [booking, ...existing];
  localStorage.setItem(CAB_BOOKING_STORAGE_KEY, JSON.stringify(updated));
}

export function findCabBookingByIdAndEmail(
  bookingId: string,
  email: string
): CabConfirmationBookingRecord | null {
  const all = getStoredCabBookings();

  return (
    all.find(
      (item) =>
        item.bookingId.trim().toLowerCase() === bookingId.trim().toLowerCase() &&
        item.traveller.email.trim().toLowerCase() === email.trim().toLowerCase()
    ) || null
  );
}

export function formatCabRouteLabel(record: CabConfirmationBookingRecord) {
  const meta = record.searchMeta;

  if (
    meta.rideType === "outstationOneWay" ||
    meta.rideType === "outstationRoundTrip"
  ) {
    return `${meta.from || "From"} → ${meta.to || "To"}`;
  }

  if (
    meta.rideType === "airportTransfers" ||
    meta.rideType === "carRental" ||
    meta.rideType === "bikeRental"
  ) {
    return `${meta.pickup || "Pickup"} → ${meta.drop || "Drop"}`;
  }

  if (meta.rideType === "hourlyRentals") {
    return `${meta.pickup || "Pickup"} • ${meta.rentalPackage || "Package"}`;
  }

  return "Route not available";
}

export function formatCabJourneyDate(record: CabConfirmationBookingRecord) {
  const meta = record.searchMeta;
  const raw =
    meta.pickupDate || meta.departureDate || meta.returnDate || "";

  if (!raw) return "Not selected";

  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return raw;

  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function buildCabWhatsappShareText(
  record: CabConfirmationBookingRecord
) {
  const route = formatCabRouteLabel(record);
  const date = formatCabJourneyDate(record);

  return [
    "Your cab booking is confirmed.",
    `Booking ID: ${record.bookingId}`,
    `Route: ${route}`,
    `Date: ${date}`,
    `Vehicle: ${record.cab.brand ? `${record.cab.brand} ` : ""}${record.cab.name}`,
    `Traveller: ${record.traveller.fullName}`,
    `Total Paid: ₹${record.fare.totalPayable.toLocaleString("en-IN")}`,
  ].join("\n");
}

export function getCabWhatsappShareUrl(
  record: CabConfirmationBookingRecord
) {
  const text = buildCabWhatsappShareText(record);
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}