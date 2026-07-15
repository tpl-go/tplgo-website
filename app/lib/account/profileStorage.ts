export const PROFILE_STORAGE_KEY = "tpl_profile_v1";
export const PROFILE_UPDATED_EVENT = "tpl-profile-updated";

export type FrequentFlyerEntry = {
  id: number;
  airline: string;
  flyerNumber: string;
};

export type CoTravellerEntry = {
  id: number;
  firstName: string;
  lastName: string;
  gender: string;
  dob: string;
  nationality: string;
  relation: string;
  mobile: string;
  email: string;
  passportNo: string;
  passportExpiry: string;
  issuingCountry: string;
  panCard: string;
  frequentFlyers: FrequentFlyerEntry[];
};

export type ProfileFormData = {
  fullName?: string;
  name?: string;
  firstName: string;
  lastName: string;
  gender: string;
  dob: string;
  nationality: string;
  maritalStatus: string;
  anniversary: string;
  country: string;
  state: string;
  city: string;
  mobile: string;
  email: string;
  passportNo: string;
  passportExpiry: string;
  issuingCountry: string;
  panCard: string;
  photo: string | null;
  frequentFlyers: FrequentFlyerEntry[];
  coTravellers: CoTravellerEntry[];
};

export const defaultProfileData: ProfileFormData = {
  firstName: "PK",
  lastName: "",
  gender: "",
  dob: "",
  nationality: "Indian",
  maritalStatus: "",
  anniversary: "",
  country: "India",
  state: "Rajasthan",
  city: "",
  mobile: "",
  email: "",
  passportNo: "",
  passportExpiry: "",
  issuingCountry: "",
  panCard: "",
  photo: null,
  frequentFlyers: [
    {
      id: 1,
      airline: "",
      flyerNumber: "",
    },
  ],
  coTravellers: [],
};

/* =========================
   🔥 NEW: MOBILE BASED KEY
========================= */
function getProfileKey(mobile: string) {
  return `${PROFILE_STORAGE_KEY}_${mobile}`;
}

/* =========================
   ✅ UPDATED GET
========================= */
export function getSavedProfile(mobile: string): ProfileFormData {
  if (typeof window === "undefined" || !mobile) {
    return defaultProfileData;
  }

  try {
    const raw = window.localStorage.getItem(getProfileKey(mobile));
    if (!raw) return { ...defaultProfileData, mobile };

    const parsed = JSON.parse(raw) as Partial<ProfileFormData>;

    return {
      ...defaultProfileData,
      ...parsed,
      mobile,
      frequentFlyers:
        parsed.frequentFlyers && parsed.frequentFlyers.length > 0
          ? parsed.frequentFlyers
          : defaultProfileData.frequentFlyers,
      coTravellers: parsed.coTravellers || [],
    };
  } catch {
    return defaultProfileData;
  }
}

/* =========================
   ✅ UPDATED SAVE
========================= */
export function saveProfile(mobile: string, data: ProfileFormData) {
  if (typeof window === "undefined" || !mobile) return;

  window.localStorage.setItem(
    getProfileKey(mobile),
    JSON.stringify(data)
  );

  window.dispatchEvent(new CustomEvent(PROFILE_UPDATED_EVENT));
}
