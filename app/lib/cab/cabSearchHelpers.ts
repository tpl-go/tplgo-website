import type {
  CabRideType,
  CabSearchFormState,
  CabSearchPayload,
  CabStopItem,
} from "./cabSearchTypes";

export function createEmptyCabStop(index: number): CabStopItem {
  return {
    id: `stop-${Date.now()}-${index}`,
    location: null,
  };
}

export function getDefaultCabSearchFormState(): CabSearchFormState {
  return {
    rideType: "outstationOneWay",

    fromLocation: null,
    toLocation: null,

    pickupLocation: null,
    dropLocation: null,

    departureDate: new Date(),
    returnDate: null,
    pickupDate: new Date(),

    pickupTime: "10:00 AM",
    dropTime: "09:45 PM",

    stops: [],

    rentalPackage: null,
    rentalVehicleType: null,
  };
}

export function swapCabLocations(
  form: CabSearchFormState
): CabSearchFormState {
  return {
    ...form,
    fromLocation: form.toLocation,
    toLocation: form.fromLocation,
  };
}

export function canAddMoreStops(stops: CabStopItem[]) {
  return stops.length < 5;
}

export function formatCabDateToISO(date: Date | null) {
  if (!date) return "";

  const localISO = new Date(
    date.getTime() - date.getTimezoneOffset() * 60000
  )
    .toISOString()
    .split("T")[0];

  return localISO;
}

export function buildCabSearchPayload(
  form: CabSearchFormState
): CabSearchPayload {
  const payload: CabSearchPayload = {
    rideType: form.rideType,
  };

  // =========================
  // OUTSTATION ONE WAY
  // =========================
  if (form.rideType === "outstationOneWay") {
    payload.from = form.fromLocation?.city || "";
    payload.to = form.toLocation?.city || "";

    payload.departureDate = formatCabDateToISO(
      form.departureDate
    );

    payload.pickupDate = formatCabDateToISO(
      form.departureDate
    );

    payload.pickupTime = form.pickupTime;

    payload.stops = form.stops
      .map((item) => item.location?.city || "")
      .filter(Boolean);
  }

  // =========================
  // OUTSTATION ROUND TRIP
  // =========================
  if (form.rideType === "outstationRoundTrip") {
    payload.from = form.fromLocation?.city || "";
    payload.to = form.toLocation?.city || "";

    payload.departureDate = formatCabDateToISO(
      form.departureDate
    );

    payload.returnDate = formatCabDateToISO(
      form.returnDate
    );

    payload.pickupDate = formatCabDateToISO(
      form.departureDate
    );

    // ✅ IMPORTANT
    payload.dropDate = formatCabDateToISO(
      form.returnDate
    );

    payload.pickupTime = form.pickupTime;

    // ✅ IMPORTANT
    payload.dropTime = form.dropTime;

    payload.stops = form.stops
      .map((item) => item.location?.city || "")
      .filter(Boolean);
  }

  // =========================
  // AIRPORT TRANSFER
  // =========================
  if (form.rideType === "airportTransfers") {
    payload.pickup = form.pickupLocation?.city || "";
    payload.drop = form.dropLocation?.city || "";

    payload.departureDate = formatCabDateToISO(
      form.departureDate
    );

    payload.pickupDate = formatCabDateToISO(
      form.departureDate
    );

    payload.pickupTime = form.pickupTime;
  }

  // =========================
  // HOURLY RENTAL
  // =========================
  if (form.rideType === "hourlyRentals") {
    payload.pickup = form.pickupLocation?.city || "";

    payload.pickupDate = formatCabDateToISO(
      form.pickupDate
    );

    payload.pickupTime = form.pickupTime;

    payload.rentalPackage =
      form.rentalPackage?.label || "";
  }

  // =========================
  // CAR RENTAL
  // =========================
  if (form.rideType === "carRental") {
    payload.pickup = form.pickupLocation?.city || "";
    payload.drop = form.dropLocation?.city || "";

    payload.pickupDate = formatCabDateToISO(
      form.pickupDate
    );

    payload.departureDate = formatCabDateToISO(
      form.departureDate
    );

    // ✅ IMPORTANT
    payload.dropDate = formatCabDateToISO(
      form.departureDate
    );

    payload.pickupTime = form.pickupTime;

    // ✅ IMPORTANT
    payload.dropTime = form.dropTime;

    payload.rentalVehicleType =
      form.rentalVehicleType || "";
  }

  // =========================
  // BIKE RENTAL
  // =========================
  if (form.rideType === "bikeRental") {
    payload.pickup = form.pickupLocation?.city || "";
    payload.drop = form.dropLocation?.city || "";

    payload.pickupDate = formatCabDateToISO(
      form.pickupDate
    );

    payload.departureDate = formatCabDateToISO(
      form.departureDate
    );

    // ✅ IMPORTANT
    payload.dropDate = formatCabDateToISO(
      form.departureDate
    );

    payload.pickupTime = form.pickupTime;

    // ✅ IMPORTANT
    payload.dropTime = form.dropTime;

    payload.rentalVehicleType =
      form.rentalVehicleType || "";
  }

  return payload;
}

export function getCabSearchRoute(
  rideType: CabRideType
) {
  // ✅ FIXED
  return "/cab/result";
}