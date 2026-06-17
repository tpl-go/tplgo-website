"use client";

import type { AuthUser } from "@/app/lib/auth/auth.types";
import type { WorkspaceBookingBasketItem } from "@/app/components/ecosystem/planner/workspace/utils/bookingBasket";
import type { WorkspacePayload } from "@/app/components/ecosystem/planner/workspace/utils/workspaceTypes";
import type {
  TiyaDayPlan,
  TiyaPlannerSnapshot,
} from "@/app/lib/ecosystem/planner/plannerTypes";
import type { TiyaExpertLeadPayload } from "@/app/lib/ecosystem/planner/plannerExpertLeadEngine";

export const MY_TRIPS_STORAGE_KEY = "tpl_tiya_saved_trips";
export const MY_TRIPS_RESTORE_BASKET_KEY = "tpl_my_trips_restore_basket_v1";
export const MY_TRIPS_RESTORE_DAY_STATUSES_KEY =
  "tpl_my_trips_restore_day_statuses_v1";
export const MY_TRIPS_ACTIVE_TRIP_ID_KEY = "tpl_my_trips_active_trip_id_v1";

export type MyTripStatus = "Draft" | "Generated" | "Finalized" | "Booking Ready";

export type MyTripOwner = {
  id: string;
  mobile?: string;
  email?: string;
};

export type MyTripSavedItemType =
  | "Local Life"
  | "Activities"
  | "Stays"
  | "Transport"
  | "Routes"
  | "Recommendations"
  | "Creators"
  | "Expedition Strategies"
  | "Group Decisions"
  | "Notes"
  | "Other";

export type MyTripSavedItem = {
  id: string;
  type: MyTripSavedItemType;
  title: string;
  subtitle?: string;
  category: string;
  sourceModule: string;
  destination?: string;
  city?: string;
  day?: number | string;
  time?: string;
  estimatedCost?: number;
  image?: string;
  metadata?: Record<string, unknown>;
  savedAt: string;
};

export type MyTripLastSavedItem = {
  id: string;
  title: string;
  type: MyTripSavedItemType;
  savedAt: string;
};

export type MyTripSnapshot = {
  id: string;
  tripName: string;
  origin: string;
  destination: string;
  startDate?: string;
  endDate?: string;
  duration: string;
  travellerCount: number;
  selectedItemsCount: number;
  estimatedTripValue: number;
  status: MyTripStatus;
  createdAt: string;
  updatedAt: string;
  owner: MyTripOwner;
  workspacePayload: WorkspacePayload;
  itineraryDays: TiyaDayPlan[];
  dayStatuses: Record<string, string>;
  selectedTripItems: WorkspaceBookingBasketItem[];
  savedItems?: MyTripSavedItem[];
  expertRequests?: TiyaExpertLeadPayload[];
  checklist?: Record<string, string[]>;
  savedItemsCount?: number;
  lastSavedItem?: MyTripLastSavedItem | null;
  notes?: string;
  generatedJourneyData?: unknown;
};

export function myTripOwnerKey(owner: MyTripOwner | AuthUser | null | undefined) {
  return owner?.id || owner?.mobile || owner?.email || "guest";
}

function isPlannerSnapshot(snapshot: unknown): snapshot is TiyaPlannerSnapshot & {
  owner?: MyTripOwner;
  savedItems?: MyTripSavedItem[];
  expertRequests?: TiyaExpertLeadPayload[];
  checklist?: Record<string, string[]>;
  selectedTripItems?: WorkspaceBookingBasketItem[];
  workspacePayload?: WorkspacePayload;
} {
  return (
    typeof snapshot === "object" &&
    snapshot !== null &&
    "tripId" in snapshot &&
    "intent" in snapshot &&
    "plan" in snapshot
  );
}

function normalizeMyTripSnapshot(snapshot: unknown): MyTripSnapshot {
  if (isPlannerSnapshot(snapshot)) {
    const savedItems = Array.isArray(snapshot.savedItems) ? snapshot.savedItems : [];
    const expertRequests = Array.isArray(snapshot.expertRequests)
      ? snapshot.expertRequests
      : [];
    const checklist =
      snapshot.checklist && typeof snapshot.checklist === "object"
        ? snapshot.checklist
        : {};
    const selectedRoute =
      snapshot.plan.routeOptions?.find((route) => route.id === snapshot.selectedRouteId) ||
      snapshot.plan.routeOptions?.[0];
    const workspacePayload = snapshot.workspacePayload || {
      routeId: snapshot.selectedRouteId || selectedRoute?.id || "active-route",
      selectedRoute: selectedRoute || {
        id: snapshot.selectedRouteId || "fastest",
        name: snapshot.plan.routeTitle,
        distance: "",
        duration: "",
        difficulty: "Balanced",
        riskLevel: "Low",
        bestFor: "",
        routeStyle: "Smart Planner",
        note: "",
        scenicScore: 75,
        comfortScore: 75,
        budgetFit: 75,
        isRecommended: true,
      },
      routeOptions: snapshot.plan.routeOptions || [],
      tripIntent: snapshot.intent,
      generatedPlan: snapshot.plan,
      generatedAt: snapshot.savedAt || snapshot.updatedAt || snapshot.createdAt || new Date().toISOString(),
      source: "route-intelligence" as const,
    } as WorkspacePayload;
    const lastSaved = [...savedItems].sort((a, b) =>
      String(b.savedAt || "").localeCompare(String(a.savedAt || ""))
    )[0];
    const owner = snapshot.owner || {
      id: snapshot.userId || "guest",
    };

    return {
      id: snapshot.tripId || `trip-${Date.now()}`,
      tripName: snapshot.tripName,
      origin: snapshot.intent.fromCity,
      destination: snapshot.intent.toCity,
      startDate: snapshot.intent.startDate,
      endDate: snapshot.intent.endDate,
      duration: `${snapshot.itinerary?.length || snapshot.plan.days?.length || 0} Day${(snapshot.itinerary?.length || snapshot.plan.days?.length || 0) === 1 ? "" : "s"}`,
      travellerCount: snapshot.plan.travellerCount || Math.max(1, (snapshot.intent.adults || 0) + (snapshot.intent.children || 0) + (snapshot.intent.seniors || 0)),
      selectedItemsCount: snapshot.selectedTripItems?.length || snapshot.selectedBookingModuleIds?.length || 0,
      estimatedTripValue: snapshot.plan.totalBudget || 0,
      status:
        snapshot.status === "Ready"
          ? "Booking Ready"
          : snapshot.status === "Draft"
            ? "Draft"
            : "Generated",
      createdAt: snapshot.createdAt || snapshot.savedAt || new Date().toISOString(),
      updatedAt: snapshot.updatedAt || snapshot.savedAt || new Date().toISOString(),
      owner,
      workspacePayload,
      itineraryDays: snapshot.itinerary || snapshot.plan.days || [],
      dayStatuses: {},
      selectedTripItems: snapshot.selectedTripItems || [],
      savedItems,
      expertRequests,
      checklist,
      savedItemsCount: savedItems.length,
      lastSavedItem: lastSaved
        ? {
            id: lastSaved.id,
            title: lastSaved.title,
            type: lastSaved.type,
            savedAt: lastSaved.savedAt,
          }
        : null,
      notes: snapshot.notes
        ? [
            snapshot.notes.personal,
            snapshot.notes.packing,
            snapshot.notes.localTips,
            snapshot.notes.creatorNotes,
          ]
            .filter(Boolean)
            .join("\n")
        : "",
      generatedJourneyData: snapshot.plannerState || snapshot.plan,
    };
  }

  const typedSnapshot = snapshot as MyTripSnapshot;
  const savedItems = Array.isArray(typedSnapshot.savedItems) ? typedSnapshot.savedItems : [];
  const expertRequests = Array.isArray(typedSnapshot.expertRequests)
    ? typedSnapshot.expertRequests
    : [];
  const checklist =
    typedSnapshot.checklist && typeof typedSnapshot.checklist === "object"
      ? typedSnapshot.checklist
      : {};
  const lastSaved = [...savedItems].sort((a, b) =>
    String(b.savedAt || "").localeCompare(String(a.savedAt || ""))
  )[0];

  return {
    ...typedSnapshot,
    savedItems,
    expertRequests,
    checklist,
    savedItemsCount: savedItems.length,
    lastSavedItem: lastSaved
      ? {
          id: lastSaved.id,
          title: lastSaved.title,
          type: lastSaved.type,
          savedAt: lastSaved.savedAt,
        }
      : null,
  };
}

function readAllTrips() {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(MY_TRIPS_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed)
      ? parsed.map((trip) => normalizeMyTripSnapshot(trip))
      : [];
  } catch {
    return [];
  }
}

function writeAllTrips(trips: MyTripSnapshot[]) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(MY_TRIPS_STORAGE_KEY, JSON.stringify(trips));
  window.dispatchEvent(new Event("tpl_tiya_saved_trips_updated"));
  window.dispatchEvent(new Event("tpl_tiya_my_trips_updated"));
  window.dispatchEvent(new Event("tpl_tiya_workspace_payload_updated"));
}

export function loadMyTrips(owner: MyTripOwner | AuthUser | null | undefined) {
  const key = myTripOwnerKey(owner);
  return readAllTrips()
    .filter((trip) => myTripOwnerKey(trip.owner) === key)
    .map(normalizeMyTripSnapshot)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function saveMyTrip(snapshot: MyTripSnapshot) {
  const normalizedSnapshot = normalizeMyTripSnapshot(snapshot);
  const trips = readAllTrips();
  const existingIndex = trips.findIndex((trip) => trip.id === normalizedSnapshot.id);
  const nextTrips =
    existingIndex >= 0
      ? trips.map((trip, index) => (index === existingIndex ? normalizedSnapshot : trip))
      : [normalizedSnapshot, ...trips];

  writeAllTrips(nextTrips);
  if (typeof window !== "undefined") {
    window.sessionStorage.setItem(MY_TRIPS_ACTIVE_TRIP_ID_KEY, normalizedSnapshot.id);
    window.dispatchEvent(new Event("tpl_tiya_active_trip_updated"));
  }
  return normalizedSnapshot;
}

export function loadMyTripById(tripId?: string | null) {
  if (!tripId) return null;
  const trip = readAllTrips().find((item) => item.id === tripId);
  return trip ? normalizeMyTripSnapshot(trip) : null;
}

export function getActiveMyTrip() {
  if (typeof window === "undefined") return null;
  return loadMyTripById(window.sessionStorage.getItem(MY_TRIPS_ACTIVE_TRIP_ID_KEY));
}

export function removeSavedItemFromMyTrip(
  owner: MyTripOwner | AuthUser | null | undefined,
  tripId: string,
  savedItemId: string
) {
  const key = myTripOwnerKey(owner);
  const trips = readAllTrips();
  const nextTrips = trips.map((trip) => {
    if (trip.id !== tripId || myTripOwnerKey(trip.owner) !== key) return trip;

    return normalizeMyTripSnapshot({
      ...trip,
      savedItems: (trip.savedItems || []).filter((item) => item.id !== savedItemId),
      updatedAt: new Date().toISOString(),
    });
  });

  writeAllTrips(nextTrips);
  return nextTrips.find((trip) => trip.id === tripId && myTripOwnerKey(trip.owner) === key) || null;
}

export function deleteMyTrip(
  owner: MyTripOwner | AuthUser | null | undefined,
  tripId: string
) {
  const key = myTripOwnerKey(owner);
  writeAllTrips(
    readAllTrips().filter(
      (trip) => !(trip.id === tripId && myTripOwnerKey(trip.owner) === key)
    )
  );
}

export function duplicateMyTrip(
  owner: MyTripOwner | AuthUser | null | undefined,
  tripId: string
) {
  const key = myTripOwnerKey(owner);
  const trip = readAllTrips().find(
    (item) => item.id === tripId && myTripOwnerKey(item.owner) === key
  );

  if (!trip) return null;

  const now = new Date().toISOString();
  const copy: MyTripSnapshot = {
    ...trip,
    id: `trip-${Date.now()}`,
    tripName: `Copy of ${trip.tripName}`,
    createdAt: now,
    updatedAt: now,
  };

  saveMyTrip(copy);
  return copy;
}

export function restoreMyTripToWorkspace(trip: MyTripSnapshot) {
  if (typeof window === "undefined") return;

  window.sessionStorage.setItem(
    MY_TRIPS_RESTORE_BASKET_KEY,
    JSON.stringify(trip.selectedTripItems)
  );
  window.sessionStorage.setItem(
    MY_TRIPS_RESTORE_DAY_STATUSES_KEY,
    JSON.stringify(trip.dayStatuses)
  );
  window.sessionStorage.setItem(MY_TRIPS_ACTIVE_TRIP_ID_KEY, trip.id);
}
