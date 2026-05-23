"use client";

export const AUTH_UPDATED_EVENT = "TPL_AUTH_UPDATED";
export const GUEST_BOOKING_UPDATED_EVENT = "TPL_GUEST_BOOKING_UPDATED";

const GUEST_BOOKING_KEY = "tpl_guest_booking_identity_v1";

export function createGuestUserFromBooking(leadTraveller: {
  name: string;
  mobile: string;
  email?: string;
}) {
  if (typeof window === "undefined") return;
  if (!leadTraveller?.mobile) return;

  const guestIdentity = {
    id: `guest_${Date.now()}`,
    mobile: leadTraveller.mobile,
    fullName: leadTraveller.name,
    email: leadTraveller.email || "",
    accountType: "personal",
    leadTraveller: {
      phone: leadTraveller.mobile,
    },
    createdAt: new Date().toISOString(),
  };

  localStorage.setItem(GUEST_BOOKING_KEY, JSON.stringify(guestIdentity));

  window.dispatchEvent(new Event(GUEST_BOOKING_UPDATED_EVENT));
}