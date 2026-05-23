"use client";

import type { BookingItem } from "@/app/lib/booking/bookingStorage";

export function saveBookingPayload(
  payloadStorageKey: string,
  payload: unknown
) {
  if (typeof window === "undefined") return false;
  if (!payloadStorageKey) return false;

  localStorage.setItem(payloadStorageKey, JSON.stringify(payload));
  return true;
}

export function getBookingPayload<T = unknown>(
  payloadStorageKey?: string
): T | null {
  if (typeof window === "undefined" || !payloadStorageKey) return null;

  try {
    const raw = localStorage.getItem(payloadStorageKey);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function restoreBookingPayloadToSession(
  booking: BookingItem,
  sessionKey: string
) {
  if (typeof window === "undefined") return false;
  if (!booking.payloadStorageKey) return false;

  const payload = getBookingPayload(booking.payloadStorageKey);
  if (!payload) return false;

  sessionStorage.setItem(sessionKey, JSON.stringify(payload));
  return true;
}

export function getBookingResolvedPayload<T = unknown>(
  booking: BookingItem
): T | null {
  if (!booking.payloadStorageKey) return null;
  return getBookingPayload<T>(booking.payloadStorageKey);
}

export function buildBookingShareText(booking: BookingItem) {
  const travellerName = booking.leadTraveller?.name || "Guest";
  const amount = Number(booking.amount || 0).toLocaleString("en-IN");

  return `${booking.title}
Booking ID: ${booking.id}
Traveller: ${travellerName}
Travel Date: ${booking.travelDate}
Amount: ₹${amount}
Status: ${booking.status.toUpperCase()}`;
}

export async function shareBooking(booking: BookingItem) {
  const shareText = buildBookingShareText(booking);

  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      await navigator.share({
        title: booking.title,
        text: shareText,
      });
      return true;
    } catch {
      return false;
    }
  }

  if (typeof navigator !== "undefined" && navigator.clipboard) {
    await navigator.clipboard.writeText(shareText);
    alert("Booking details copied.");
    return true;
  }

  alert(shareText);
  return true;
}