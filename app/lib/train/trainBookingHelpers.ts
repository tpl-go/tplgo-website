import type {
  TrainBookingPageState,
  TrainBookingPayload,
  TrainTravellerItem,
  TrainContactDetails,
  TrainIrctcAccountDetails,
} from "./trainBookingTypes";

export function getTrainBookingPayload(): TrainBookingPayload | null {
  if (typeof window === "undefined") return null;

  const raw = sessionStorage.getItem("tplTrainBookingData");
  if (!raw) return null;

  try {
    return JSON.parse(raw) as TrainBookingPayload;
  } catch {
    return null;
  }
}

export function buildTrainBookingPageState(
  payload: TrainBookingPayload
): TrainBookingPageState {
  const travellers: TrainTravellerItem[] = [
    {
      fullName: "",
      age: "",
      gender: "",
      berthPreference: "",
    },
  ];

  const contactDetails: TrainContactDetails = {
    mobile: "",
    email: "",
  };

  const irctcAccount: TrainIrctcAccountDetails = {
    username: "",
  };

  return {
    bookingPayload: payload,
    travellers,
    contactDetails,
    irctcAccount,
    timerLeft: 15 * 60,
  };
}

export function areTrainTravellersValid(travellers: TrainTravellerItem[]) {
  if (!travellers.length) return false;

  return travellers.every(
    (item) =>
      item.fullName.trim() &&
      item.age.trim() &&
      item.gender.trim() &&
      item.berthPreference.trim()
  );
}

export function isTrainContactValid(contact: TrainContactDetails) {
  const mobileValid = /^[0-9]{10}$/.test(contact.mobile.trim());
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email.trim());

  return mobileValid && emailValid;
}

export function isIrctcUsernameValid(irctc: TrainIrctcAccountDetails) {
  return irctc.username.trim().length >= 3;
}