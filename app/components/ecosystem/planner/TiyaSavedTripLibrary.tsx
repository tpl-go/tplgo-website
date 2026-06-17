"use client";

import { useState } from "react";
import {
  Clock,
  Copy,
  Edit3,
  FolderOpen,
  Save,
  Search,
  RotateCcw,
  Trash2,
} from "lucide-react";
import type { TiyaPlannerSnapshot } from "@/app/lib/ecosystem/planner/plannerTypes";
import { TiyaEmptyState } from "./TiyaPolishStates";

type TiyaSavedTripLibraryProps = {
  savedTrips?: TiyaPlannerSnapshot[] | null;
  lastTrip?: TiyaPlannerSnapshot | null;
  currentSnapshot: TiyaPlannerSnapshot;
  onSaveCurrent: () => void;
  onRestore: (snapshot: TiyaPlannerSnapshot) => void;
  onRename: (tripId: string, tripName: string) => void;
  onDuplicate: (tripId: string) => void;
  onDelete: (tripId: string) => void;
};

function formatDate(value?: string) {
  if (!value) return "Draft";

  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function TripCard({
  trip,
  onRestore,
  onRename,
  onDuplicate,
  onDelete,
}: {
  trip: TiyaPlannerSnapshot;
  onRestore: (snapshot: TiyaPlannerSnapshot) => void;
  onRename: (tripId: string, tripName: string) => void;
  onDuplicate: (tripId: string) => void;
  onDelete: (tripId: string) => void;
}) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [tripName, setTripName] = useState(trip.tripName);
  const tripId = trip.tripId || "";
  const routeTitle = trip.plan?.routeTitle || "Tiya route";
  const nights = trip.plan?.nights ?? 0;
  const travellerCount = trip.plan?.travellerCount ?? 1;
  const budgetTier = trip.intent?.budgetTier || "Planned budget";
  const startDate = trip.intent?.startDate || "Start";
  const endDate = trip.intent?.endDate || "End";
  const transportMode = trip.intent?.transportMode || "Mixed Mode";
  const status = trip.status || "Planning";
  const readinessScore = trip.readinessScore ?? Math.min(96, 58 + (trip.selectedBookingModuleIds?.length || 0) * 7);
  const updatedAt = trip.updatedAt || trip.savedAt;

  function commitRename() {
    if (!tripId || !tripName.trim()) return;
    onRename(tripId, tripName.trim());
    setIsRenaming(false);
  }

  return (
    <article className="rounded-3xl border border-white/10 bg-white/[0.08] p-4 text-white transition hover:bg-white/10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          {isRenaming ? (
            <input
              value={tripName}
              onChange={(event) => setTripName(event.target.value)}
              onBlur={commitRename}
              onKeyDown={(event) => {
                if (event.key === "Enter") commitRename();
              }}
              className="w-full rounded-2xl border border-white/10 bg-white/10 px-3 py-2 text-lg font-black text-white outline-none focus:border-orange-300"
            />
          ) : (
            <h3 className="truncate text-lg font-black text-white">
              {trip.tripName}
            </h3>
          )}
          <p className="mt-1 text-sm font-semibold text-white/70">
            {routeTitle} · {nights} Nights · {travellerCount} Travellers
          </p>
        </div>
        <span className="w-fit rounded-full border border-orange-300/20 bg-orange-500/10 px-3 py-1.5 text-xs font-black text-orange-100">
          {status}
        </span>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/10 p-3">
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-white/50">
            Dates
          </p>
          <p className="mt-1 text-xs font-black text-white">
            {startDate} → {endDate}
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/10 p-3">
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-white/50">
            Mode
          </p>
          <p className="mt-1 text-xs font-black text-white">
            {transportMode}
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/10 p-3">
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-white/50">
            Saved
          </p>
          <p className="mt-1 text-xs font-black text-white">
            {formatDate(trip.savedAt)}
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/10 p-3">
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-white/50">
            Readiness
          </p>
          <p className="mt-1 text-xs font-black text-white">
            {readinessScore}%
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/10 p-3">
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-white/50">
            Budget
          </p>
          <p className="mt-1 text-xs font-black text-white">
            {budgetTier}
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/10 p-3">
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-white/50">
            Updated
          </p>
          <p className="mt-1 text-xs font-black text-white">
            {formatDate(updatedAt)}
          </p>
        </div>
      </div>

      {trip.recentActivity?.length ? (
        <div className="mt-4 rounded-2xl border border-cyan-300/15 bg-cyan-400/10 p-3">
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-cyan-100">
            Recent activity
          </p>
          <div className="mt-2 grid gap-1">
            {trip.recentActivity.slice(0, 4).map((activity) => (
              <p key={activity.id} className="text-xs font-semibold text-cyan-50/80">
                {activity.label} · {formatDate(activity.createdAt)}
              </p>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <button
          type="button"
          onClick={() => onRestore(trip)}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#ff7b00] via-[#ff9500] to-[#ffb300] px-3 py-2 text-xs font-black text-white"
        >
          <RotateCcw size={14} />
          Continue
        </button>
        <button
          type="button"
          onClick={() => setIsRenaming((current) => !current)}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-2 text-xs font-black text-white"
        >
          <Edit3 size={14} />
          Rename
        </button>
        <button
          type="button"
          onClick={() => tripId && onDuplicate(tripId)}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-2 text-xs font-black text-white"
        >
          <Copy size={14} />
          Duplicate
        </button>
        <button
          type="button"
          onClick={() => {
            if (!tripId) return;
            if (window.confirm(`Delete ${trip.tripName}? This will soft-delete the trip from this workspace.`)) {
              onDelete(tripId);
            }
          }}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-rose-200/20 bg-rose-500/10 px-3 py-2 text-xs font-black text-rose-100"
        >
          <Trash2 size={14} />
          Delete
        </button>
      </div>
    </article>
  );
}

export default function TiyaSavedTripLibrary({
  savedTrips = [],
  lastTrip,
  currentSnapshot,
  onSaveCurrent,
  onRestore,
  onRename,
  onDuplicate,
  onDelete,
}: TiyaSavedTripLibraryProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [destinationFilter, setDestinationFilter] = useState("");
  const safeTrips = Array.isArray(savedTrips) ? savedTrips : [];
  const filteredTrips = safeTrips.filter((trip) => {
    const haystack = `${trip.tripName} ${trip.intent?.fromCity} ${trip.intent?.toCity} ${trip.status || "Planning"}`.toLowerCase();
    const matchesSearch = !search || haystack.includes(search.toLowerCase());
    const matchesStatus = statusFilter === "All" || (trip.status || "Planning") === statusFilter;
    const matchesDestination =
      !destinationFilter ||
      (trip.intent?.toCity || "").toLowerCase().includes(destinationFilter.toLowerCase());

    return matchesSearch && matchesStatus && matchesDestination;
  });
  const lastRouteTitle = lastTrip?.plan?.routeTitle || "Tiya route";
  const currentRouteTitle = currentSnapshot.plan?.routeTitle || "Current route";
  const currentTravellerCount = currentSnapshot.plan?.travellerCount ?? 1;

  return (
    <section className="overflow-hidden rounded-3xl border border-white/80 bg-[#061839]/95 text-white shadow-[0_22px_80px_rgba(6,24,57,0.2)] backdrop-blur-xl">
      <div className="relative border-b border-white/10 p-4 sm:p-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_12%,rgba(34,211,238,0.18),transparent_28%),radial-gradient(circle_at_88%_12%,rgba(249,115,22,0.18),transparent_26%)]" />
        <div className="relative flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-cyan-100">
              <FolderOpen size={15} />
              Planner session library
            </div>
            <h2 className="mt-2 text-xl font-black text-white sm:text-2xl">
              Saved Tiya trips and drafts
            </h2>
            <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-white/70">
              Restore, rename, duplicate or remove frontend-only planner
              snapshots saved in this browser.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onSaveCurrent}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#ff7b00] via-[#ff9500] to-[#ffb300] px-5 py-2 text-sm font-black text-white"
            >
              <Save size={15} />
              Save Current Trip
            </button>
            <div className="rounded-2xl border border-white/10 bg-white/10 px-3 py-2 text-xs font-black text-cyan-100">
              {safeTrips.length} saved trip{safeTrips.length === 1 ? "" : "s"}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-3 p-3 sm:p-5">
        <div className="rounded-3xl border border-cyan-300/20 bg-cyan-400/10 p-4">
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
            Current trip ready to save
          </p>
          <div className="mt-3 grid gap-2 text-xs font-black text-white/80 sm:grid-cols-2 lg:grid-cols-4">
            <span>{currentSnapshot.intent.fromCity} → {currentSnapshot.intent.toCity}</span>
            <span>{currentSnapshot.intent.startDate} → {currentSnapshot.intent.endDate}</span>
            <span>{currentTravellerCount} travellers</span>
            <span>{currentRouteTitle}</span>
          </div>
        </div>

        <div className="grid gap-2 rounded-3xl border border-white/10 bg-white/[0.08] p-3 md:grid-cols-[1fr_180px_180px]">
          <label className="relative min-w-0">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/45" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="min-h-11 w-full rounded-2xl border border-white/10 bg-white/10 pl-9 pr-3 text-sm font-bold text-white outline-none placeholder:text-white/35"
              placeholder="Search saved trips"
            />
          </label>
          <input
            value={destinationFilter}
            onChange={(event) => setDestinationFilter(event.target.value)}
            className="min-h-11 w-full rounded-2xl border border-white/10 bg-white/10 px-3 text-sm font-bold text-white outline-none placeholder:text-white/35"
            placeholder="Destination"
          />
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="min-h-11 w-full rounded-2xl border border-white/10 bg-[#102746] px-3 text-sm font-bold text-white outline-none"
          >
            {["All", "Draft", "Planning", "Ready", "Booked", "Completed"].map((status) => (
              <option key={status}>{status}</option>
            ))}
          </select>
        </div>

        {lastTrip ? (
          <div className="rounded-3xl border border-orange-300/30 bg-orange-500/10 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-orange-100">
                  <Clock size={14} />
                  Continue last Tiya plan
                </div>
                <h3 className="mt-2 text-lg font-black text-white">
                  {lastTrip.tripName}
                </h3>
                <p className="mt-1 text-sm font-semibold text-white/70">
                  {lastRouteTitle} · saved {formatDate(lastTrip.savedAt)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onRestore(lastTrip)}
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-gradient-to-r from-[#ff7b00] via-[#ff9500] to-[#ffb300] px-5 py-2 text-sm font-black text-white"
              >
                Continue Planning
              </button>
            </div>
          </div>
        ) : null}

        {filteredTrips.length ? (
          <div className="grid gap-3">
            {filteredTrips.map((trip) => (
              <TripCard
                key={trip.tripId || trip.tripName}
                trip={trip}
                onRestore={onRestore}
                onRename={onRename}
                onDuplicate={onDuplicate}
                onDelete={onDelete}
              />
            ))}
          </div>
        ) : (
          <TiyaEmptyState
            icon={FolderOpen}
            eyebrow="Tiya draft memory"
            title="No saved Tiya trips in this browser yet"
            detail="Save the current plan from the action panel and Tiya will keep it ready here for restore, rename, duplicate and review."
          />
        )}
      </div>
    </section>
  );
}
