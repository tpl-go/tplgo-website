"use client";

import type { AuthUser } from "@/app/lib/auth/auth.types";
import type { WorkspaceBookingBasketItem } from "@/app/components/ecosystem/planner/workspace/utils/bookingBasket";
import type { WorkspacePayload } from "@/app/components/ecosystem/planner/workspace/utils/workspaceTypes";
import type {
  TiyaDayPlan,
  TiyaPlannerSnapshot,
} from "@/app/lib/ecosystem/planner/plannerTypes";
import type { TiyaExpertLeadPayload } from "@/app/lib/ecosystem/planner/plannerExpertLeadEngine";
import {
  readPlannerDetailPayload,
  savePlannerDetailPayload,
} from "@/app/lib/ecosystem/planner/plannerPayloadStorage";
import { logSmartPlannerStorageWrite } from "@/app/lib/ecosystem/planner/booking/smartPlannerStorageWriteAudit";

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
  detailStorageKey?: string;
};

type CompactMyTripSnapshot = Omit<
  MyTripSnapshot,
  | "checklist"
  | "expertRequests"
  | "generatedJourneyData"
  | "itineraryDays"
  | "dayStatuses"
  | "notes"
  | "savedItems"
  | "selectedTripItems"
  | "workspacePayload"
> & {
  __compactMyTrip: true;
  detailStorageKey?: string;
  payloadStorageKey?: string;
  routeLabel?: string;
  thumbnail?: string;
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
    dayStatuses:
      typedSnapshot.dayStatuses && typeof typedSnapshot.dayStatuses === "object"
        ? typedSnapshot.dayStatuses
        : {},
    savedItems,
    expertRequests,
    checklist,
    itineraryDays: Array.isArray(typedSnapshot.itineraryDays)
      ? typedSnapshot.itineraryDays
      : [],
    selectedTripItems: Array.isArray(typedSnapshot.selectedTripItems)
      ? typedSnapshot.selectedTripItems
      : [],
    workspacePayload: typedSnapshot.workspacePayload || ({} as WorkspacePayload),
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

function routeLabelForTrip(trip: MyTripSnapshot) {
  return [trip.origin, trip.destination].filter(Boolean).join(" → ");
}

function smallImage(value: unknown) {
  const image = typeof value === "string" ? value.trim() : "";
  if (!image) return undefined;
  return image.length <= 500 ? image : undefined;
}

function compactTripIndexRecord(
  trip: MyTripSnapshot,
  detailStorageKey?: string
): CompactMyTripSnapshot {
  const routeLabel = routeLabelForTrip(trip);
  const thumbnail = smallImage(
    trip.lastSavedItem && "image" in trip.lastSavedItem
      ? (trip.lastSavedItem as MyTripLastSavedItem & { image?: string }).image
      : undefined
  );

  return {
    __compactMyTrip: true,
    createdAt: trip.createdAt,
    destination: trip.destination,
    detailStorageKey,
    duration: trip.duration,
    endDate: trip.endDate,
    estimatedTripValue: trip.estimatedTripValue,
    id: trip.id,
    lastSavedItem: trip.lastSavedItem,
    origin: trip.origin,
    owner: {
      email: trip.owner?.email,
      id: trip.owner?.id || trip.owner?.mobile || trip.owner?.email || "guest",
      mobile: trip.owner?.mobile,
    },
    payloadStorageKey: detailStorageKey,
    routeLabel,
    savedItemsCount: trip.savedItemsCount || trip.savedItems?.length || 0,
    selectedItemsCount: trip.selectedItemsCount,
    startDate: trip.startDate,
    status: trip.status,
    thumbnail,
    travellerCount: trip.travellerCount,
    tripName: trip.tripName,
    updatedAt: trip.updatedAt,
  };
}

function writeSavedTripsIndex(compactTrips: CompactMyTripSnapshot[]) {
  if (typeof window === "undefined") return false;

  const payload = JSON.stringify(compactTrips);
  logSmartPlannerStorageWrite({
    file: "app/lib/ecosystem/planner/myTripsStorage.ts",
    functionName: "writeSavedTripsIndex",
    key: MY_TRIPS_STORAGE_KEY,
    payload: compactTrips,
    serialized: payload,
    storageType: "localStorage",
    successOrFailed: "attempt",
  });
  try {
    window.localStorage.setItem(MY_TRIPS_STORAGE_KEY, payload);
    logSmartPlannerStorageWrite({
      file: "app/lib/ecosystem/planner/myTripsStorage.ts",
      functionName: "writeSavedTripsIndex",
      key: MY_TRIPS_STORAGE_KEY,
      payload: compactTrips,
      serialized: payload,
      storageType: "localStorage",
      successOrFailed: "success",
    });
    return true;
  } catch (error) {
    logSmartPlannerStorageWrite({
      error,
      file: "app/lib/ecosystem/planner/myTripsStorage.ts",
      functionName: "writeSavedTripsIndex",
      key: MY_TRIPS_STORAGE_KEY,
      payload: compactTrips,
      serialized: payload,
      storageType: "localStorage",
      successOrFailed: "failed",
    });
    const pruned = compactTrips
      .map((trip) => ({
        __compactMyTrip: true,
        createdAt: trip.createdAt,
        destination: trip.destination,
        detailStorageKey: trip.detailStorageKey,
        duration: trip.duration,
        endDate: trip.endDate,
        estimatedTripValue: trip.estimatedTripValue,
        id: trip.id,
        origin: trip.origin,
        owner: trip.owner,
        payloadStorageKey: trip.payloadStorageKey || trip.detailStorageKey,
        routeLabel: trip.routeLabel,
        savedItemsCount: trip.savedItemsCount || 0,
        selectedItemsCount: trip.selectedItemsCount,
        startDate: trip.startDate,
        status: trip.status,
        travellerCount: trip.travellerCount,
        tripName: trip.tripName,
        updatedAt: trip.updatedAt,
      }))
      .slice(0, 50);

    try {
      const prunedPayload = JSON.stringify(pruned);
      logSmartPlannerStorageWrite({
        file: "app/lib/ecosystem/planner/myTripsStorage.ts",
        functionName: "writeSavedTripsIndex:pruned",
        key: MY_TRIPS_STORAGE_KEY,
        payload: pruned,
        serialized: prunedPayload,
        storageType: "localStorage",
        successOrFailed: "attempt",
      });
      window.localStorage.setItem(MY_TRIPS_STORAGE_KEY, prunedPayload);
      logSmartPlannerStorageWrite({
        file: "app/lib/ecosystem/planner/myTripsStorage.ts",
        functionName: "writeSavedTripsIndex:pruned",
        key: MY_TRIPS_STORAGE_KEY,
        payload: pruned,
        serialized: prunedPayload,
        storageType: "localStorage",
        successOrFailed: "success",
      });
      return true;
    } catch (retryError) {
      logSmartPlannerStorageWrite({
        error: retryError,
        file: "app/lib/ecosystem/planner/myTripsStorage.ts",
        functionName: "writeSavedTripsIndex:pruned",
        key: MY_TRIPS_STORAGE_KEY,
        payload: pruned,
        storageType: "localStorage",
        successOrFailed: "failed",
      });
      if (process.env.NODE_ENV === "development") {
        console.warn("[Smart Planner] saved trips index write skipped", {
          error,
          retryError,
        });
      }
      return false;
    }
  }
}

function readAllTrips() {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(MY_TRIPS_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed)
      ? parsed.map((trip) => {
          if (
            trip &&
            typeof trip === "object" &&
            "__compactMyTrip" in trip &&
            typeof (trip as CompactMyTripSnapshot).detailStorageKey === "string"
          ) {
            const detail = readPlannerDetailPayload<MyTripSnapshot>(
              (trip as CompactMyTripSnapshot).detailStorageKey
            );
            return normalizeMyTripSnapshot(detail || trip);
          }
          return normalizeMyTripSnapshot(trip);
        })
      : [];
  } catch {
    return [];
  }
}

function writeAllTrips(trips: MyTripSnapshot[]) {
  if (typeof window === "undefined") return;

  const compactTrips = trips.map((trip) => {
    const save = savePlannerDetailPayload(`my_trip_${trip.id}`, trip);
    return compactTripIndexRecord(trip, save.key || trip.detailStorageKey);
  });

  writeSavedTripsIndex(compactTrips);
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
    logSmartPlannerStorageWrite({
      file: "app/lib/ecosystem/planner/myTripsStorage.ts",
      functionName: "saveMyTrip:activeTrip",
      key: MY_TRIPS_ACTIVE_TRIP_ID_KEY,
      payload: normalizedSnapshot.id,
      serialized: normalizedSnapshot.id,
      storageType: "sessionStorage",
      successOrFailed: "attempt",
    });
    window.sessionStorage.setItem(MY_TRIPS_ACTIVE_TRIP_ID_KEY, normalizedSnapshot.id);
    logSmartPlannerStorageWrite({
      file: "app/lib/ecosystem/planner/myTripsStorage.ts",
      functionName: "saveMyTrip:activeTrip",
      key: MY_TRIPS_ACTIVE_TRIP_ID_KEY,
      payload: normalizedSnapshot.id,
      serialized: normalizedSnapshot.id,
      storageType: "sessionStorage",
      successOrFailed: "success",
    });
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

  const basketPayload = JSON.stringify(trip.selectedTripItems);
  logSmartPlannerStorageWrite({
    file: "app/lib/ecosystem/planner/myTripsStorage.ts",
    functionName: "restoreMyTripToWorkspace",
    key: MY_TRIPS_RESTORE_BASKET_KEY,
    payload: trip.selectedTripItems,
    serialized: basketPayload,
    storageType: "sessionStorage",
    successOrFailed: "attempt",
  });
  window.sessionStorage.setItem(MY_TRIPS_RESTORE_BASKET_KEY, basketPayload);
  logSmartPlannerStorageWrite({
    file: "app/lib/ecosystem/planner/myTripsStorage.ts",
    functionName: "restoreMyTripToWorkspace",
    key: MY_TRIPS_RESTORE_BASKET_KEY,
    payload: trip.selectedTripItems,
    serialized: basketPayload,
    storageType: "sessionStorage",
    successOrFailed: "success",
  });
  const dayStatusPayload = JSON.stringify(trip.dayStatuses);
  logSmartPlannerStorageWrite({
    file: "app/lib/ecosystem/planner/myTripsStorage.ts",
    functionName: "restoreMyTripToWorkspace",
    key: MY_TRIPS_RESTORE_DAY_STATUSES_KEY,
    payload: trip.dayStatuses,
    serialized: dayStatusPayload,
    storageType: "sessionStorage",
    successOrFailed: "attempt",
  });
  window.sessionStorage.setItem(MY_TRIPS_RESTORE_DAY_STATUSES_KEY, dayStatusPayload);
  logSmartPlannerStorageWrite({
    file: "app/lib/ecosystem/planner/myTripsStorage.ts",
    functionName: "restoreMyTripToWorkspace",
    key: MY_TRIPS_RESTORE_DAY_STATUSES_KEY,
    payload: trip.dayStatuses,
    serialized: dayStatusPayload,
    storageType: "sessionStorage",
    successOrFailed: "success",
  });
  logSmartPlannerStorageWrite({
    file: "app/lib/ecosystem/planner/myTripsStorage.ts",
    functionName: "restoreMyTripToWorkspace",
    key: MY_TRIPS_ACTIVE_TRIP_ID_KEY,
    payload: trip.id,
    serialized: trip.id,
    storageType: "sessionStorage",
    successOrFailed: "attempt",
  });
  window.sessionStorage.setItem(MY_TRIPS_ACTIVE_TRIP_ID_KEY, trip.id);
  logSmartPlannerStorageWrite({
    file: "app/lib/ecosystem/planner/myTripsStorage.ts",
    functionName: "restoreMyTripToWorkspace",
    key: MY_TRIPS_ACTIVE_TRIP_ID_KEY,
    payload: trip.id,
    serialized: trip.id,
    storageType: "sessionStorage",
    successOrFailed: "success",
  });
}
