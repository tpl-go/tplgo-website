import { AUTH_UPDATED_EVENT } from "@/app/lib/booking/guestAuth";
import { tplApiRequest, type TplApiResult, type StoredTplAuthUser } from "./tplApiClient";

const AUTH_STORAGE_KEY = "tpl_auth_session_v1";

export type GuestBookingClaimContact = {
  mobile: string;
  email?: string;
  accountType?: "personal" | "partner";
};

export type GuestBookingClaimStart = {
  accepted: boolean;
  bookingId: string;
  contactMatched: boolean;
  verificationMode: "smoke_secret" | string;
};

export type GuestBookingClaimVerify = {
  user: StoredTplAuthUser;
  session: {
    token: string;
    tokenType?: "Bearer" | string;
    expiresAt?: string;
    cookieName?: string;
  };
  guestClaim: true;
  bookingId: string;
};

export function isGuestBookingClaimSmokeEnabled(): boolean {
  return (
    process.env.NEXT_PUBLIC_TPL_GUEST_BOOKING_CLAIM_SMOKE_ENABLED === "true" &&
    process.env.NODE_ENV !== "production"
  );
}

export async function startGuestBookingClaim(
  bookingId: string,
  contact: GuestBookingClaimContact
): Promise<TplApiResult<GuestBookingClaimStart>> {
  return tplApiRequest<GuestBookingClaimStart>(guestClaimPath(bookingId, "start"), {
    method: "POST",
    body: normalizeContact(contact),
    fallbackOnError: false,
  });
}

export async function verifyGuestBookingClaim(
  bookingId: string,
  contact: GuestBookingClaimContact
): Promise<TplApiResult<GuestBookingClaimVerify>> {
  return tplApiRequest<GuestBookingClaimVerify>(guestClaimPath(bookingId, "verify"), {
    method: "POST",
    body: normalizeContact(contact),
    fallbackOnError: false,
  });
}

export function persistGuestClaimAuthSession(result: GuestBookingClaimVerify): boolean {
  if (typeof window === "undefined") return false;
  const token = result.session?.token;
  if (!token || !result.user?.mobile) return false;

  window.localStorage.setItem(
    AUTH_STORAGE_KEY,
    JSON.stringify({
      user: result.user,
      token,
      sessionToken: token,
      session: result.session,
      guestClaim: true,
      bookingId: result.bookingId,
    })
  );
  window.dispatchEvent(new Event(AUTH_UPDATED_EVENT));
  return true;
}

function guestClaimPath(bookingId: string, action: "start" | "verify") {
  return `/api/v1/bookings/${encodeURIComponent(bookingId)}/guest-claim/${action}`;
}

function normalizeContact(contact: GuestBookingClaimContact) {
  return {
    mobile: contact.mobile,
    ...(contact.email ? { email: contact.email } : {}),
    accountType: contact.accountType || "personal",
  };
}