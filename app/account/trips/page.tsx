"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/hooks/useAuth";
import {
  deleteMyTrip,
  duplicateMyTrip,
  loadMyTrips,
  removeSavedItemFromMyTrip,
  restoreMyTripToWorkspace,
  type MyTripSavedItem,
  type MyTripSnapshot,
} from "@/app/lib/ecosystem/planner/myTripsStorage";
import { generatePlannerPackingSections } from "@/app/lib/ecosystem/planner/plannerPackingEngine";
import { saveWorkspacePayload } from "@/app/components/ecosystem/planner/workspace/utils/workspaceStorage";

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-IN", {
    currency: "INR",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(value || 0);
}

function formatDate(value?: string) {
  if (!value) return "Not set";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(value?: string) {
  if (!value) return "Not saved yet";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
  });
}

function groupSavedItems(items: MyTripSavedItem[]) {
  const groups: Record<MyTripSavedItem["type"], MyTripSavedItem[]> = {
    "Local Life": [],
    Activities: [],
    Stays: [],
    Transport: [],
    Routes: [],
    Recommendations: [],
    Creators: [],
    "Expedition Strategies": [],
    "Group Decisions": [],
    Notes: [],
    Other: [],
  };

  items.forEach((item) => {
    groups[item.type || "Other"].push(item);
  });

  return groups;
}

function getPreparationStatus(trip: MyTripSnapshot) {
  const checkedIds = Object.values(trip.checklist || {}).flat();
  const intent = trip.workspacePayload?.tripIntent;
  const selectedRoute = trip.workspacePayload?.selectedRoute;
  const totalItems = intent
    ? generatePlannerPackingSections({ intent, selectedRoute }).reduce(
        (sum, section) => sum + section.items.length,
        0
      )
    : Math.max(checkedIds.length, 0);
  const completeItems = checkedIds.length;
  const readiness = totalItems
    ? Math.round((completeItems / totalItems) * 100)
    : 0;

  return {
    completeItems,
    readiness,
    totalItems,
  };
}

export default function MyTripsPage() {
  const router = useRouter();
  const { user, isAuthenticated, openLoginModal } = useAuth();
  const [trips, setTrips] = useState<MyTripSnapshot[]>([]);
  const [openSavedTripId, setOpenSavedTripId] = useState<string>("");
  const openLoginModalRef = useRef(openLoginModal);
  const loginPromptShownRef = useRef(false);
  const activeUserId = user?.id || "";
  const activeUserMobile = user?.mobile || "";
  const activeUserEmail = user?.email || "";

  useEffect(() => {
    openLoginModalRef.current = openLoginModal;
  }, [openLoginModal]);

  function syncTrips() {
    setTrips(loadMyTrips(user));
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (!isAuthenticated) {
        if (!loginPromptShownRef.current) {
          loginPromptShownRef.current = true;
          openLoginModalRef.current({ accountType: "personal", intent: "ai" });
        }
        setTrips([]);
        return;
      }

      loginPromptShownRef.current = false;
      setTrips(
        loadMyTrips({
          id: activeUserId,
          mobile: activeUserMobile,
          email: activeUserEmail,
        })
      );
    }, 0);

    return () => window.clearTimeout(timer);
  }, [isAuthenticated, activeUserId, activeUserMobile, activeUserEmail]);

  useEffect(() => {
    function refreshTripsFromUnifiedStore() {
      if (!isAuthenticated) return;
      syncTrips();
    }

    window.addEventListener(
      "tpl_tiya_saved_trips_updated",
      refreshTripsFromUnifiedStore
    );
    window.addEventListener("storage", refreshTripsFromUnifiedStore);

    return () => {
      window.removeEventListener(
        "tpl_tiya_saved_trips_updated",
        refreshTripsFromUnifiedStore
      );
      window.removeEventListener("storage", refreshTripsFromUnifiedStore);
    };
  }, [isAuthenticated, activeUserId, activeUserMobile, activeUserEmail]);

  function openTrip(trip: MyTripSnapshot, openCheckout = false) {
    saveWorkspacePayload(trip.workspacePayload);
    restoreMyTripToWorkspace(trip);
    if (openCheckout) {
      window.sessionStorage.setItem("tpl_open_trip_selections_after_restore", "true");
    }
    router.push("/smart-planner/workspace");
  }

  function exportTrip(trip: MyTripSnapshot) {
    const blob = new Blob([JSON.stringify(trip, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${trip.tripName.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function shareTrip(trip: MyTripSnapshot) {
    const text = `${trip.tripName} • ${trip.origin} to ${trip.destination} • ${formatMoney(trip.estimatedTripValue)}`;
    if (navigator.share) {
      await navigator.share({ title: trip.tripName, text }).catch(() => undefined);
      return;
    }
    await navigator.clipboard?.writeText(text).catch(() => undefined);
  }

  function duplicateTrip(trip: MyTripSnapshot) {
    duplicateMyTrip(user, trip.id);
    syncTrips();
  }

  function removeTrip(trip: MyTripSnapshot) {
    if (!window.confirm(`Delete ${trip.tripName}?`)) return;
    deleteMyTrip(user, trip.id);
    syncTrips();
  }

  function removeSavedItem(trip: MyTripSnapshot, itemId: string) {
    removeSavedItemFromMyTrip(user, trip.id, itemId);
    syncTrips();
  }

  if (!isAuthenticated) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm">
        <h2 className="text-2xl font-bold text-black">My Trips</h2>
        <p className="mt-2 text-gray-600">Login to view saved Smart Planner trips.</p>
      </div>
    );
  }

  return (
    <div className="rounded-[22px] border border-gray-200 bg-white p-4 shadow-[0_10px_35px_rgba(15,23,42,0.06)] sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">
            Tiya Smart Planner
          </p>
          <h2 className="mt-1 text-2xl font-black text-slate-950">My Trips</h2>
          <p className="mt-2 text-sm font-semibold text-slate-600">
            Saved Smart Planner journeys, drafts and booking-ready trip plans.
          </p>
        </div>
        <button
          type="button"
          onClick={() => router.push("/smart-planner")}
          className="rounded-full bg-gradient-to-r from-[#ff7b00] via-[#ff9500] to-[#ffb300] px-5 py-3 text-sm font-black text-white shadow-[0_14px_30px_rgba(255,123,0,0.24)]"
        >
          Open Smart Planner
        </button>
      </div>

      {trips.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
          <h3 className="text-xl font-black text-slate-950">No saved trips yet</h3>
          <p className="mt-2 text-sm font-semibold text-slate-500">
            Create and save a trip from Tiya Smart Planner.
          </p>
          <button
            type="button"
            onClick={() => router.push("/smart-planner")}
            className="mt-5 rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white"
          >
            Open Smart Planner
          </button>
        </div>
      ) : (
        <div className="mt-6 grid gap-4">
          {trips.map((trip) => (
            <article
              key={trip.id}
              className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-blue-50/40 to-orange-50/40 p-4 shadow-sm"
            >
              {(() => {
                const savedItems = trip.savedItems || [];
                const expertRequests = trip.expertRequests || [];
                const savedItemsCount = trip.savedItemsCount ?? savedItems.length;
                const lastSavedItem = trip.lastSavedItem || [...savedItems].sort((a, b) =>
                  b.savedAt.localeCompare(a.savedAt)
                )[0];
                const savedGroups = groupSavedItems(savedItems);
                const savedOpen = openSavedTripId === trip.id;
                const preparationStatus = getPreparationStatus(trip);

                return (
                  <>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-xl font-black text-slate-950">
                      {trip.tripName}
                    </h3>
                    <span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">
                      {trip.status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-bold text-slate-600">
                    {trip.origin} → {trip.destination}
                  </p>
                  <div className="mt-4 grid gap-2 text-xs font-bold text-slate-600 sm:grid-cols-2 lg:grid-cols-4">
                    <span>Dates: {formatDate(trip.startDate)} - {formatDate(trip.endDate)}</span>
                    <span>Duration: {trip.duration}</span>
                    <span>Travellers: {trip.travellerCount}</span>
                    <span>Selected Items: {trip.selectedItemsCount}</span>
                    <span>Saved Items: {savedItemsCount}</span>
                    <span>
                      Preparation Status: {preparationStatus.completeItems} / {preparationStatus.totalItems} complete
                    </span>
                    <span>Readiness: {preparationStatus.readiness}%</span>
                    <span>Expert Requests: {expertRequests.length}</span>
                    <span>Last Saved: {lastSavedItem?.title || "None"}</span>
                    <span>Created: {formatDate(trip.createdAt)}</span>
                    <span>Updated: {formatDateTime(trip.updatedAt)}</span>
                  </div>
                </div>

                <div className="shrink-0 rounded-2xl border border-white bg-white/80 p-4 text-left shadow-sm lg:text-right">
                  <p className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">
                    Estimated Trip Value
                  </p>
                  <p className="mt-1 text-2xl font-black text-slate-950">
                    {formatMoney(trip.estimatedTripValue)}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button type="button" onClick={() => openTrip(trip)} className="rounded-full border border-blue-100 bg-white px-4 py-2 text-xs font-black text-blue-700">Open Trip</button>
                <button type="button" onClick={() => openTrip(trip)} className="rounded-full border border-cyan-100 bg-cyan-50 px-4 py-2 text-xs font-black text-cyan-700">Resume Planning</button>
                <button type="button" onClick={() => exportTrip(trip)} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-black text-slate-700">Export</button>
                <button type="button" onClick={() => void shareTrip(trip)} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-black text-slate-700">Share</button>
                <button type="button" onClick={() => duplicateTrip(trip)} className="rounded-full border border-orange-100 bg-orange-50 px-4 py-2 text-xs font-black text-orange-700">Duplicate</button>
                <button type="button" onClick={() => openTrip(trip, true)} className="rounded-full bg-gradient-to-r from-[#ff7b00] via-[#ff9500] to-[#ffb300] px-4 py-2 text-xs font-black text-white">Continue Booking</button>
                <button type="button" onClick={() => openTrip(trip)} className="rounded-full border border-emerald-100 bg-emerald-50 px-4 py-2 text-xs font-black text-emerald-700">Open Checklist</button>
                <button type="button" onClick={() => setOpenSavedTripId(savedOpen ? "" : trip.id)} className="rounded-full border border-emerald-100 bg-emerald-50 px-4 py-2 text-xs font-black text-emerald-700">View Saved Items</button>
                <button type="button" onClick={() => removeTrip(trip)} className="rounded-full border border-rose-100 bg-white px-4 py-2 text-xs font-black text-rose-600">Delete</button>
              </div>
              {savedOpen ? (
                <section className="mt-4 rounded-3xl border border-slate-200 bg-white/85 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-[0.16em] text-blue-700">
                        Saved Items
                      </p>
                      <h4 className="mt-1 text-lg font-black text-slate-950">
                        Bookmarks inside this trip
                      </h4>
                    </div>
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-black text-slate-600">
                      {savedItemsCount} saved
                    </span>
                  </div>

                  {savedItems.length ? (
                    <div className="mt-4 grid gap-4">
                      {Object.entries(savedGroups).map(([group, items]) =>
                        items.length ? (
                          <div key={group} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                            <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">
                              {group === "Creators"
                                ? `Creator Bookmarks (${items.length})`
                                : group}
                            </p>
                            <div className="mt-3 grid gap-2">
                              {items.map((item) => (
                                <div key={item.id} className="rounded-2xl border border-white bg-white p-3 shadow-sm">
                                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                                    <div className="min-w-0">
                                      <p className="text-sm font-black text-slate-950">{item.title}</p>
                                      <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">
                                        {[
                                          item.category,
                                          item.city || item.destination,
                                          item.day && item.day !== "Flexible"
                                            ? `Day ${item.day}`
                                            : item.day,
                                          item.time,
                                        ].filter(Boolean).join(" · ")}
                                      </p>
                                      <p className="mt-1 text-[11px] font-bold text-slate-400">
                                        Source: {item.sourceModule} · Saved {formatDateTime(item.savedAt)}
                                      </p>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                      {item.estimatedCost ? (
                                        <span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-black text-blue-700">
                                          {formatMoney(item.estimatedCost)}
                                        </span>
                                      ) : null}
                                      <button type="button" onClick={() => openTrip(trip)} className="rounded-full border border-orange-100 bg-orange-50 px-3 py-1.5 text-xs font-black text-orange-700">
                                        {group === "Creators" ? "Open" : "Add to Trip"}
                                      </button>
                                      <button type="button" onClick={() => removeSavedItem(trip, item.id)} className="rounded-full border border-rose-100 bg-white px-3 py-1.5 text-xs font-black text-rose-600">
                                        Remove
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : null
                      )}
                    </div>
                  ) : (
                    <p className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm font-semibold text-slate-500">
                      No saved items yet. Use Save inside Smart Planner modules to bookmark items here.
                    </p>
                  )}
                </section>
              ) : null}
              {expertRequests.length ? (
                <section className="mt-4 rounded-3xl border border-orange-100 bg-orange-50/80 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-[0.16em] text-orange-700">
                        Expert Requests
                      </p>
                      <h4 className="mt-1 text-lg font-black text-slate-950">
                        CRM handoff drafts
                      </h4>
                    </div>
                    <span className="rounded-full border border-orange-200 bg-white px-3 py-1 text-xs font-black text-orange-700">
                      {expertRequests.length} request{expertRequests.length === 1 ? "" : "s"}
                    </span>
                  </div>
                  <div className="mt-3 grid gap-2">
                    {expertRequests.map((request) => (
                      <div key={request.leadId} className="rounded-2xl border border-orange-100 bg-white p-3 shadow-sm">
                        <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
                          <div className="min-w-0">
                            <p className="text-sm font-black text-slate-950">
                              {request.tripSummary || request.packageQuoteBundleSummary.route}
                            </p>
                            <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">
                              {request.communicationMode} · Priority {request.priorityScore}/100 · {formatDateTime(request.createdAt)}
                            </p>
                            <p className="mt-1 text-[11px] font-bold text-slate-400">
                              {request.customerContact.name} · {request.customerContact.mobile}
                            </p>
                          </div>
                          <button type="button" onClick={() => openTrip(trip)} className="rounded-full border border-orange-100 bg-orange-50 px-3 py-1.5 text-xs font-black text-orange-700">
                            Open
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ) : null}
                  </>
                );
              })()}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
