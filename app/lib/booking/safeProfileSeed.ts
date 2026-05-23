"use client";

import {
  getSavedProfile,
  saveProfile,
} from "@/app/lib/account/profileStorage";

export type SafeTravellerSource =
  | "flight"
  | "hotel"
  | "homestay"
  | "package"
  | "bus"
  | "train"
  | "cab"
  | "cruise"
  | "visa"
  | "insurance";

export type SafeTravellerInput = {
  title?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  gender?: string;
  dob?: string;
  dateOfBirth?: string;
  email?: string;
  mobile?: string;
  phone?: string;
  nationality?: string;
  passportNumber?: string;
  passportExpiry?: string;
};

export type SavedTraveller = {
  id: string;
  source: SafeTravellerSource;
  title: string;
  firstName: string;
  lastName: string;
  gender: string;
  dob: string;
  email: string;
  mobile: string;
  nationality: string;
  passportNumber: string;
  passportExpiry: string;
  createdAt: string;
  updatedAt: string;
};

const TRAVELLER_STORAGE_PREFIX = "tpl_saved_travellers_";

function cleanMobile(value?: string) {
  return String(value || "")
    .replace(/^\+91\s?/, "")
    .replace(/^\+91-?/, "")
    .replace(/\D/g, "")
    .slice(-10);
}

function normalize(value?: string) {
  return String(value || "").trim();
}

function splitName(traveller: SafeTravellerInput) {
  const firstName = normalize(traveller.firstName);
  const lastName = normalize(traveller.lastName);

  if (firstName || lastName) {
    return { firstName, lastName };
  }

  const fullName = normalize(traveller.name);
  const parts = fullName.split(" ").filter(Boolean);

  return {
    firstName: parts[0] || "",
    lastName: parts.slice(1).join(" ") || "",
  };
}

function getTravellerKey(mobile: string) {
  return `${TRAVELLER_STORAGE_PREFIX}${cleanMobile(mobile)}`;
}

export function getSavedTravellers(mobile: string): SavedTraveller[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(getTravellerKey(mobile));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveTravellers(mobile: string, travellers: SavedTraveller[]) {
  if (typeof window === "undefined") return;

  localStorage.setItem(
    getTravellerKey(mobile),
    JSON.stringify(travellers)
  );
}

function buildTraveller(params: {
  traveller: SafeTravellerInput;
  source: SafeTravellerSource;
}): SavedTraveller {
  const { traveller, source } = params;
  const { firstName, lastName } = splitName(traveller);

  const now = new Date().toISOString();

  return {
    id: `TVL-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
    source,
    title: normalize(traveller.title),
    firstName,
    lastName,
    gender: normalize(traveller.gender),
    dob: normalize(traveller.dob || traveller.dateOfBirth),
    email: normalize(traveller.email),
    mobile: cleanMobile(traveller.mobile || traveller.phone),
    nationality: normalize(traveller.nationality || "Indian"),
    passportNumber: normalize(traveller.passportNumber),
    passportExpiry: normalize(traveller.passportExpiry),
    createdAt: now,
    updatedAt: now,
  };
}

function isSameTraveller(a: SavedTraveller, b: SavedTraveller) {
  const aName = `${a.firstName} ${a.lastName}`.toLowerCase().trim();
  const bName = `${b.firstName} ${b.lastName}`.toLowerCase().trim();

  const sameName = aName && bName && aName === bName;
  const sameDob = a.dob && b.dob && a.dob === b.dob;
  const samePassport =
    a.passportNumber &&
    b.passportNumber &&
    a.passportNumber === b.passportNumber;

  return samePassport || (sameName && sameDob) || sameName;
}

export function saveTravellerUnderMobile(params: {
  mobile: string;
  traveller: SafeTravellerInput;
  source: SafeTravellerSource;
}) {
  const mobile = cleanMobile(params.mobile);
  if (!mobile) return null;

  const nextTraveller = buildTraveller({
    traveller: params.traveller,
    source: params.source,
  });

  const existing = getSavedTravellers(mobile);
  const index = existing.findIndex((item) =>
    isSameTraveller(item, nextTraveller)
  );

  if (index >= 0) {
    const old = existing[index];

    const updated: SavedTraveller = {
      ...old,
      source: nextTraveller.source || old.source,
      title: nextTraveller.title || old.title,
      firstName: nextTraveller.firstName || old.firstName,
      lastName: nextTraveller.lastName || old.lastName,
      gender: nextTraveller.gender || old.gender,
      dob: nextTraveller.dob || old.dob,
      email: nextTraveller.email || old.email,
      mobile: nextTraveller.mobile || old.mobile,
      nationality: nextTraveller.nationality || old.nationality,
      passportNumber: nextTraveller.passportNumber || old.passportNumber,
      passportExpiry: nextTraveller.passportExpiry || old.passportExpiry,
      updatedAt: new Date().toISOString(),
    };

    const list = [...existing];
    list[index] = updated;

    saveTravellers(mobile, list);
    return updated;
  }

  const updatedList = [nextTraveller, ...existing];
  saveTravellers(mobile, updatedList);

  return nextTraveller;
}

function isProfileEmpty(profile: any) {
  return !profile?.firstName && !profile?.lastName && !profile?.email;
}

function isSameAsProfile(profile: any, traveller: SafeTravellerInput) {
  const { firstName, lastName } = splitName(traveller);

  const profileName = `${profile?.firstName || ""} ${
    profile?.lastName || ""
  }`
    .toLowerCase()
    .trim();

  const travellerName = `${firstName || ""} ${lastName || ""}`
    .toLowerCase()
    .trim();

  if (!profileName || !travellerName) return false;

  return profileName === travellerName;
}

export function seedAccountAndTravellerSafely(params: {
  mobile: string;
  email?: string;
  traveller: SafeTravellerInput;
  source: SafeTravellerSource;
}) {
  if (typeof window === "undefined") return null;

  const mobile = cleanMobile(params.mobile);
  if (!mobile) return null;

  const { firstName, lastName } = splitName(params.traveller);
  const email = normalize(params.email || params.traveller.email);

  const existingProfile = getSavedProfile(mobile);

  if (isProfileEmpty(existingProfile)) {
    saveProfile(mobile, {
      ...existingProfile,
      firstName,
      lastName,
      gender: normalize(params.traveller.gender),
      mobile,
      email,
      nationality: existingProfile?.nationality || "Indian",
    });
  } else if (isSameAsProfile(existingProfile, params.traveller)) {
    saveProfile(mobile, {
      ...existingProfile,
      firstName: existingProfile.firstName || firstName,
      lastName: existingProfile.lastName || lastName,
      gender: existingProfile.gender || normalize(params.traveller.gender),
      mobile,
      email: existingProfile.email || email,
      nationality: existingProfile.nationality || "Indian",
    });
  }

  return saveTravellerUnderMobile({
    mobile,
    traveller: {
      ...params.traveller,
      email,
      mobile,
    },
    source: params.source,
  });
}