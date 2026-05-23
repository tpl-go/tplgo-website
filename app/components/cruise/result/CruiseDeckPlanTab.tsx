"use client";

import { useMemo, useState } from "react";

type CruiseDeckCabinPoint = {
  id: string;
  cabinNumber: string;
  x: number;
  y: number;
  status: "available" | "booked" | "blocked";
  category?: string;
  deckId: string;
};

type CruiseDeckPlan = {
  id: string;
  deckNumber: string;
  title: string;
  image: string;
  legends: string[];
  description?: string;
  selectionAvailable?: boolean;
  cabins?: CruiseDeckCabinPoint[];
};

type Props = {
  deckPlans: CruiseDeckPlan[];
  mode?: "view" | "select";
  selectedCabinNumber?: string | null;
  onCabinSelect?: (payload: {
    deckId: string;
    deckTitle: string;
    cabinId: string;
    cabinNumber: string;
  }) => void;
};

export default function CruiseDeckPlanTab({
  deckPlans,
  mode = "view",
  selectedCabinNumber = null,
  onCabinSelect,
}: Props) {
  const [activeDeckId, setActiveDeckId] = useState<string>(
    deckPlans?.[0]?.id || ""
  );

  const activeDeck = useMemo(() => {
    return deckPlans.find((deck) => deck.id === activeDeckId) || deckPlans[0];
  }, [deckPlans, activeDeckId]);

  const selectedCabinDetails = useMemo(() => {
    if (!selectedCabinNumber) return null;

    for (const deck of deckPlans) {
      const cabin = deck.cabins?.find(
        (item) => item.cabinNumber === selectedCabinNumber
      );
      if (cabin) {
        return {
          deckId: deck.id,
          deckTitle: deck.title,
          cabinId: cabin.id,
          cabinNumber: cabin.cabinNumber,
          category: cabin.category,
        };
      }
    }

    return null;
  }, [deckPlans, selectedCabinNumber]);

  if (!deckPlans?.length || !activeDeck) {
    return (
      <div className="rounded-2xl border bg-white p-6 text-sm text-slate-600">
        Deck plans will be shown here.
      </div>
    );
  }

  const canSelectCabin =
    mode === "select" &&
    activeDeck.selectionAvailable === true &&
    Array.isArray(activeDeck.cabins) &&
    activeDeck.cabins.length > 0;

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border bg-white p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="text-lg font-semibold text-slate-900">
              Deck Plan
            </div>
            <div className="mt-1 text-sm text-slate-600">
              Showing plan for{" "}
              <span className="font-semibold">{activeDeck.title}</span>
            </div>

            {mode === "select" ? (
              <div className="mt-2 inline-flex rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700">
                Cabin Selection Mode
              </div>
            ) : null}
          </div>

          <div className="w-full lg:w-[240px]">
            <select
              value={activeDeck.id}
              onChange={(e) => setActiveDeckId(e.target.value)}
              className="h-[46px] w-full rounded-xl border border-slate-300 bg-white px-4 text-sm font-medium text-slate-800 outline-none"
            >
              {deckPlans.map((deck) => (
                <option key={deck.id} value={deck.id}>
                  {deck.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {mode === "select" && selectedCabinDetails ? (
        <div className="rounded-2xl border border-purple-200 bg-purple-50 px-4 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-purple-800">
                Selected Cabin Number
              </div>
              <div className="mt-1 text-sm text-purple-700">
                <span className="font-semibold">
                  {selectedCabinDetails.cabinNumber}
                </span>{" "}
                on{" "}
                <span className="font-semibold">
                  {selectedCabinDetails.deckTitle}
                </span>
                {selectedCabinDetails.category
                  ? ` · ${selectedCabinDetails.category}`
                  : ""}
              </div>
            </div>

            <div className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-purple-700">
              Cabin Reserved in UI
            </div>
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12 lg:col-span-4 space-y-5">
          <div className="overflow-hidden rounded-2xl border bg-white">
            <div className="bg-slate-900 px-4 py-3 text-sm font-semibold text-white">
              Deck Plan Legends
            </div>

            <div className="divide-y">
              {activeDeck.legends.map((legend, index) => (
                <div
                  key={`${activeDeck.id}-legend-${index}`}
                  className="px-4 py-3 text-sm text-slate-800"
                >
                  {legend}
                </div>
              ))}
            </div>
          </div>

          {mode === "select" ? (
            <div className="overflow-hidden rounded-2xl border bg-white">
              <div className="bg-slate-900 px-4 py-3 text-sm font-semibold text-white">
                Cabin Selection Status
              </div>

              <div className="space-y-3 px-4 py-4 text-sm">
                {canSelectCabin ? (
                  <>
                    <div className="rounded-xl bg-green-50 px-3 py-3 text-green-700">
                      Specific cabin number selection is available for this
                      deck.
                    </div>

                    {selectedCabinNumber ? (
                      <div className="rounded-xl bg-purple-50 px-3 py-3 text-purple-700">
                        Selected Cabin:{" "}
                        <span className="font-semibold">
                          {selectedCabinNumber}
                        </span>
                      </div>
                    ) : (
                      <div className="rounded-xl bg-slate-50 px-3 py-3 text-slate-600">
                        Select an available cabin marker from the deck plan.
                      </div>
                    )}
                  </>
                ) : (
                  <div className="rounded-xl bg-amber-50 px-3 py-3 text-amber-700">
                    Cabin number selection is not available for this sailing.
                    Cabin will be assigned by cruise line.
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>

        <div className="col-span-12 lg:col-span-8">
          <div className="rounded-2xl border bg-white p-4">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="text-sm font-semibold text-slate-700">
                Showing Deck Plan for: {activeDeck.title}
              </div>

              {mode === "select" ? (
                <div
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    canSelectCabin
                      ? "bg-green-100 text-green-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {canSelectCabin
                    ? "Selection Available"
                    : "Auto Assignment Only"}
                </div>
              ) : (
                <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  View Mode
                </div>
              )}
            </div>

            {!activeDeck.image ? (
              <div className="rounded-2xl border bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
                Deck plan image will be added here.
              </div>
            ) : (
              <div className="relative overflow-hidden rounded-2xl border bg-slate-50">
                <div className="relative w-full overflow-auto">
                  <img
                    src={activeDeck.image}
                    alt={activeDeck.title}
                    className="h-auto w-full object-contain"
                  />

                  {canSelectCabin
                    ? activeDeck.cabins!.map((cabin) => {
                        const isSelected =
                          selectedCabinNumber === cabin.cabinNumber;

                        return (
                          <button
                            key={cabin.id}
                            type="button"
                            onClick={() => {
                              if (cabin.status !== "available") return;

                              onCabinSelect?.({
                                deckId: activeDeck.id,
                                deckTitle: activeDeck.title,
                                cabinId: cabin.id,
                                cabinNumber: cabin.cabinNumber,
                              });
                            }}
                            title={`${cabin.cabinNumber}${
                              cabin.category ? ` · ${cabin.category}` : ""
                            }`}
                            style={{
                              position: "absolute",
                              left: `${cabin.x}%`,
                              top: `${cabin.y}%`,
                              transform: "translate(-50%, -50%)",
                            }}
                            className={`group z-10 h-4 w-4 rounded-full border-2 shadow-sm transition ${
                              cabin.status === "available"
                                ? "border-white bg-green-500 hover:scale-125"
                                : cabin.status === "booked"
                                ? "cursor-not-allowed border-white bg-red-500"
                                : "cursor-not-allowed border-white bg-slate-400"
                            } ${isSelected ? "ring-4 ring-purple-300 scale-125" : ""}`}
                          >
                            <span className="pointer-events-none absolute left-1/2 top-[-34px] hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-2 py-1 text-[10px] font-semibold text-white shadow-md group-hover:block">
                              {cabin.cabinNumber}
                            </span>
                          </button>
                        );
                      })
                    : null}
                </div>
              </div>
            )}

            {activeDeck.description ? (
              <div className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                {activeDeck.description}
              </div>
            ) : null}

            {canSelectCabin ? (
              <div className="mt-4 flex flex-wrap gap-3 text-xs font-medium text-slate-600">
                <div className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-2">
                  <span className="h-3 w-3 rounded-full bg-green-500" />
                  Available
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-2">
                  <span className="h-3 w-3 rounded-full bg-red-500" />
                  Booked
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-2">
                  <span className="h-3 w-3 rounded-full bg-slate-400" />
                  Blocked
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-2">
                  <span className="h-3 w-3 rounded-full ring-2 ring-purple-300 bg-green-500" />
                  Selected
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}