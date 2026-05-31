import { getSavedProfile } from "@/app/lib/account/profileStorage";
import type { AuthUser } from "@/app/lib/auth/auth.types";

export const AUTH_SESSION_STORAGE_KEY = "tpl_auth_session_v1";

type DisplayUser = Partial<AuthUser> & {
  name?: string;
  phone?: string;
  fullName?: string;
  mobile?: string;
  email?: string;
  id?: string | number;
};

function clean(value: unknown) {
  return String(value || "").trim();
}

function isFallbackName(value: string) {
  return /^user\s+\d{3,}$/i.test(value);
}

function isUsableName(value: unknown) {
  const name = clean(value);
  return !!name && name.toLowerCase() !== "pk" && !isFallbackName(name);
}

function savedProfileName(mobile: string) {
  if (!mobile || typeof window === "undefined") return "";

  const profile = getSavedProfile(mobile) as ReturnType<typeof getSavedProfile> & {
    fullName?: string;
    name?: string;
  };
  const joinedName = `${profile.firstName || ""} ${profile.lastName || ""}`.trim();

  if (isUsableName(profile.name)) return clean(profile.name);
  if (isUsableName(profile.fullName)) return clean(profile.fullName);
  if (isUsableName(joinedName)) return joinedName;

  return "";
}

export function getAuthSessionUser(): DisplayUser | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(AUTH_SESSION_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed?.user || null;
  } catch {
    return null;
  }
}

export function getLoggedInDisplayName(user?: DisplayUser | null) {
  const sessionUser = user || getAuthSessionUser();
  if (!sessionUser) return "User";

  const mobile = clean(sessionUser.mobile || sessionUser.phone);
  const email = clean(sessionUser.email);

  if (isUsableName(sessionUser.name)) return clean(sessionUser.name);
  if (isUsableName(sessionUser.fullName)) return clean(sessionUser.fullName);

  const profileName = savedProfileName(mobile);
  if (profileName) return profileName;

  if (mobile) return mobile;
  if (email) return email;

  const id = clean(sessionUser.id);
  return id ? `User ${id.slice(-4)}` : "User";
}
