import type { TiyaPlannerSnapshot } from "./plannerTypes";

export const TIYA_SAVED_TRIPS_KEY = "tpl_tiya_saved_trips";
export const TIYA_LAST_TRIP_KEY = "tpl_tiya_last_trip";
export const TIYA_DRAFT_KEY = "tpl_tiya_trip_draft";

function canUseStorage() {
  try {
    return typeof window !== "undefined" && Boolean(window.localStorage);
  } catch {
    return false;
  }
}

function readJson<T>(key: string, fallback: T): T {
  if (!canUseStorage()) return fallback;

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  if (!canUseStorage()) return;

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage can fail in private mode, quota limits, or locked-down browsers.
  }
}

export function buildTripId() {
  return `tiya_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function savePlannerTrip(snapshot: TiyaPlannerSnapshot) {
  const savedAt = new Date().toISOString();
  const trip: TiyaPlannerSnapshot = {
    ...snapshot,
    tripId: snapshot.tripId || buildTripId(),
    savedAt,
  };
  const savedTrips = readJson<TiyaPlannerSnapshot[]>(TIYA_SAVED_TRIPS_KEY, []);
  const nextTrips = [
    trip,
    ...savedTrips.filter((savedTrip) => savedTrip.tripId !== trip.tripId),
  ].slice(0, 12);

  writeJson(TIYA_SAVED_TRIPS_KEY, nextTrips);
  writeJson(TIYA_LAST_TRIP_KEY, trip);
  writeJson(TIYA_DRAFT_KEY, trip);

  return trip;
}

export function savePlannerDraft(snapshot: TiyaPlannerSnapshot) {
  writeJson(TIYA_DRAFT_KEY, {
    ...snapshot,
    savedAt: new Date().toISOString(),
  });
}

export function loadPlannerDraft() {
  return readJson<TiyaPlannerSnapshot | null>(TIYA_DRAFT_KEY, null);
}

export function loadSavedPlannerTrips() {
  const savedTrips = readJson<TiyaPlannerSnapshot[]>(TIYA_SAVED_TRIPS_KEY, []);
  return Array.isArray(savedTrips) ? savedTrips : [];
}

export function loadLastPlannerTrip() {
  return readJson<TiyaPlannerSnapshot | null>(TIYA_LAST_TRIP_KEY, null);
}

export function overwriteSavedPlannerTrips(trips: TiyaPlannerSnapshot[]) {
  const safeTrips = Array.isArray(trips) ? trips : [];
  writeJson(TIYA_SAVED_TRIPS_KEY, safeTrips);
}

export function renamePlannerTrip(tripId: string, tripName: string) {
  const savedTrips = loadSavedPlannerTrips();
  const nextTrips = savedTrips.map((trip) =>
    trip.tripId === tripId ? { ...trip, tripName } : trip
  );
  const lastTrip = loadLastPlannerTrip();

  overwriteSavedPlannerTrips(nextTrips);

  if (lastTrip?.tripId === tripId) {
    const renamedLastTrip = nextTrips.find((trip) => trip.tripId === tripId);

    if (renamedLastTrip) {
      writeJson(TIYA_LAST_TRIP_KEY, renamedLastTrip);
    }
  }

  return nextTrips;
}

export function duplicatePlannerTrip(tripId: string) {
  const savedTrips = loadSavedPlannerTrips();
  const sourceTrip = savedTrips.find((trip) => trip.tripId === tripId);

  if (!sourceTrip) return savedTrips;

  const duplicatedTrip: TiyaPlannerSnapshot = {
    ...sourceTrip,
    tripId: buildTripId(),
    tripName: `${sourceTrip.tripName} Copy`,
    savedAt: new Date().toISOString(),
  };
  const nextTrips = [duplicatedTrip, ...savedTrips].slice(0, 12);

  overwriteSavedPlannerTrips(nextTrips);
  writeJson(TIYA_LAST_TRIP_KEY, duplicatedTrip);

  return nextTrips;
}

export function deletePlannerTrip(tripId: string) {
  const nextTrips = loadSavedPlannerTrips().filter(
    (trip) => trip.tripId !== tripId
  );
  const lastTrip = loadLastPlannerTrip();

  overwriteSavedPlannerTrips(nextTrips);

  if (lastTrip?.tripId === tripId) {
    writeJson(TIYA_LAST_TRIP_KEY, nextTrips[0] ?? null);
  }

  return nextTrips;
}
