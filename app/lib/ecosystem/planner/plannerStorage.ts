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

function normalizePlannerSnapshot(value: unknown): TiyaPlannerSnapshot | null {
  if (!value || typeof value !== "object") return null;
  const snapshot = value as TiyaPlannerSnapshot & {
    id?: string;
    workspacePayload?: {
      generatedPlan?: TiyaPlannerSnapshot["plan"];
      tripIntent?: TiyaPlannerSnapshot["intent"];
      selectedRoute?: { id?: TiyaPlannerSnapshot["selectedRouteId"] };
    };
    itineraryDays?: TiyaPlannerSnapshot["itinerary"];
    owner?: { id?: string };
    savedItems?: unknown[];
    expertRequests?: unknown[];
    checklist?: Record<string, string[]>;
    selectedTripItems?: unknown[];
  };

  if (snapshot.intent && snapshot.plan) {
    return snapshot;
  }

  if (snapshot.workspacePayload?.tripIntent && snapshot.workspacePayload.generatedPlan) {
    const plan = snapshot.workspacePayload.generatedPlan;
    const intent = snapshot.workspacePayload.tripIntent;

    return {
      ...(snapshot as unknown as TiyaPlannerSnapshot),
      tripId: snapshot.tripId || snapshot.id,
      userId: snapshot.userId || snapshot.owner?.id,
      tripName: snapshot.tripName || `${intent.fromCity} to ${intent.toCity}`,
      status:
        (snapshot.status as string | undefined) === "Booking Ready"
          ? "Ready"
          : snapshot.status || "Planning",
      createdAt: snapshot.createdAt,
      updatedAt: snapshot.updatedAt,
      savedAt: snapshot.savedAt || snapshot.updatedAt,
      intent,
      plan,
      itinerary: snapshot.itinerary || snapshot.itineraryDays || plan.days || [],
      notes:
        snapshot.notes && typeof snapshot.notes === "object"
          ? snapshot.notes
          : {
              personal: typeof snapshot.notes === "string" ? snapshot.notes : "",
              packing: "",
              localTips: "",
              creatorNotes: "",
            },
      selectedRouteId:
        snapshot.selectedRouteId || snapshot.workspacePayload.selectedRoute?.id,
      selectedCreatorPickIds: snapshot.selectedCreatorPickIds || [],
      selectedMarketPickIds: snapshot.selectedMarketPickIds || [],
      selectedBookingModuleIds: snapshot.selectedBookingModuleIds || [],
    };
  }

  return null;
}

export function savePlannerTrip(snapshot: TiyaPlannerSnapshot) {
  const savedAt = new Date().toISOString();
  const trip: TiyaPlannerSnapshot = {
    ...snapshot,
    tripId: snapshot.tripId || buildTripId(),
    status: snapshot.status || "Planning",
    createdAt: snapshot.createdAt || savedAt,
    updatedAt: savedAt,
    savedAt,
  };
  const savedTrips = readJson<Array<TiyaPlannerSnapshot & { id?: string }>>(
    TIYA_SAVED_TRIPS_KEY,
    []
  );
  const nextTrips = [
    trip,
    ...savedTrips.filter(
      (savedTrip) => (savedTrip.tripId || savedTrip.id) !== trip.tripId
    ),
  ].slice(0, 12);

  writeJson(TIYA_SAVED_TRIPS_KEY, nextTrips);
  writeJson(TIYA_LAST_TRIP_KEY, trip);
  writeJson(TIYA_DRAFT_KEY, trip);
  if (typeof window !== "undefined") {
    window.sessionStorage.setItem("tpl_my_trips_active_trip_id_v1", trip.tripId || "");
    window.dispatchEvent(new Event("tpl_tiya_saved_trips_updated"));
  }

  return trip;
}

export function savePlannerDraft(snapshot: TiyaPlannerSnapshot) {
  writeJson(TIYA_DRAFT_KEY, {
    ...snapshot,
    status: snapshot.status || "Draft",
    updatedAt: new Date().toISOString(),
    savedAt: new Date().toISOString(),
  });
}

export function loadPlannerDraft() {
  return normalizePlannerSnapshot(
    readJson<TiyaPlannerSnapshot | null>(TIYA_DRAFT_KEY, null)
  );
}

export function loadSavedPlannerTrips() {
  const savedTrips = readJson<unknown[]>(TIYA_SAVED_TRIPS_KEY, []);
  return Array.isArray(savedTrips)
    ? savedTrips
        .map(normalizePlannerSnapshot)
        .filter((trip): trip is TiyaPlannerSnapshot => Boolean(trip))
        .filter((trip) => !trip.deletedAt && trip.status !== "Deleted")
    : [];
}

function loadAllSavedPlannerTrips() {
  const savedTrips = readJson<unknown[]>(TIYA_SAVED_TRIPS_KEY, []);
  return Array.isArray(savedTrips)
    ? savedTrips
        .map(normalizePlannerSnapshot)
        .filter((trip): trip is TiyaPlannerSnapshot => Boolean(trip))
    : [];
}

export function loadLastPlannerTrip() {
  return normalizePlannerSnapshot(
    readJson<TiyaPlannerSnapshot | null>(TIYA_LAST_TRIP_KEY, null)
  );
}

export function overwriteSavedPlannerTrips(trips: TiyaPlannerSnapshot[]) {
  const safeTrips = Array.isArray(trips) ? trips : [];
  writeJson(TIYA_SAVED_TRIPS_KEY, safeTrips);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("tpl_tiya_saved_trips_updated"));
  }
}

export function renamePlannerTrip(tripId: string, tripName: string) {
  const savedTrips = loadAllSavedPlannerTrips();
  const nextTrips = savedTrips.map((trip) =>
    trip.tripId === tripId
      ? {
          ...trip,
          tripName,
          updatedAt: new Date().toISOString(),
          recentActivity: [
            {
              id: `rename-${Date.now()}`,
              label: `Trip renamed to ${tripName}`,
              createdAt: new Date().toISOString(),
            },
            ...(trip.recentActivity || []),
          ].slice(0, 12),
        }
      : trip
  );
  const lastTrip = loadLastPlannerTrip();

  overwriteSavedPlannerTrips(nextTrips);

  if (lastTrip?.tripId === tripId) {
    const renamedLastTrip = nextTrips.find((trip) => trip.tripId === tripId);

    if (renamedLastTrip) {
      writeJson(TIYA_LAST_TRIP_KEY, renamedLastTrip);
    }
  }

  return loadSavedPlannerTrips();
}

export function duplicatePlannerTrip(tripId: string) {
  const savedTrips = loadAllSavedPlannerTrips();
  const sourceTrip = savedTrips.find((trip) => trip.tripId === tripId);

  if (!sourceTrip) return savedTrips;

  const duplicatedTrip: TiyaPlannerSnapshot = {
    ...sourceTrip,
    tripId: buildTripId(),
    tripName: `${sourceTrip.tripName} Copy`,
    status: "Draft",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    savedAt: new Date().toISOString(),
    recentActivity: [
      {
        id: `duplicate-${Date.now()}`,
        label: `Duplicated from ${sourceTrip.tripName}`,
        createdAt: new Date().toISOString(),
      },
      ...(sourceTrip.recentActivity || []),
    ].slice(0, 12),
  };
  const nextTrips = [duplicatedTrip, ...savedTrips].slice(0, 12);

  overwriteSavedPlannerTrips(nextTrips);
  writeJson(TIYA_LAST_TRIP_KEY, duplicatedTrip);

  return loadSavedPlannerTrips();
}

export function deletePlannerTrip(tripId: string) {
  const deletedAt = new Date().toISOString();
  const nextTrips = loadAllSavedPlannerTrips().map((trip) =>
    trip.tripId === tripId
      ? {
          ...trip,
          status: "Deleted" as const,
          deletedAt,
          updatedAt: deletedAt,
          recentActivity: [
            {
              id: `delete-${Date.now()}`,
              label: "Trip soft deleted",
              createdAt: deletedAt,
            },
            ...(trip.recentActivity || []),
          ].slice(0, 12),
        }
      : trip
  );
  const lastTrip = loadLastPlannerTrip();

  overwriteSavedPlannerTrips(nextTrips);

  if (lastTrip?.tripId === tripId) {
    writeJson(TIYA_LAST_TRIP_KEY, loadSavedPlannerTrips()[0] ?? null);
  }

  return loadSavedPlannerTrips();
}

export function updatePlannerTripNotes(
  tripId: string,
  notes: TiyaPlannerSnapshot["notes"]
) {
  const now = new Date().toISOString();
  const nextTrips = loadAllSavedPlannerTrips().map((trip) =>
    trip.tripId === tripId
      ? {
          ...trip,
          notes,
          updatedAt: now,
          savedAt: now,
          recentActivity: [
            {
              id: `notes-${Date.now()}`,
              label: "Trip notes auto-saved",
              createdAt: now,
            },
            ...(trip.recentActivity || []),
          ].slice(0, 12),
        }
      : trip
  );
  const updatedTrip = nextTrips.find((trip) => trip.tripId === tripId);

  overwriteSavedPlannerTrips(nextTrips);

  if (updatedTrip) {
    writeJson(TIYA_LAST_TRIP_KEY, updatedTrip);
    writeJson(TIYA_DRAFT_KEY, updatedTrip);
  }

  return loadSavedPlannerTrips();
}
