"use client";

import { useMemo, useState } from "react";
import type { BusResultItem } from "@/app/lib/bus/busTypes";

type Props = {
  bus: BusResultItem | null;
  open: boolean;
  onClose: () => void;
};

type TabKey = "details" | "points" | "amenities" | "policies";

export default function BusViewDetailsModal({
  bus,
  open,
  onClose,
}: Props) {
  const [activeTab, setActiveTab] = useState<TabKey>("details");

  const groupedPolicies = useMemo(() => {
    if (!bus) return [];

    return [
      "Reporting time is 15-30 mins before departure.",
      "Operator may change boarding point in rare operational cases.",
      "Seat numbers are subject to final confirmation by operator.",
      "Government-issued ID is required during boarding.",
      "Partial cancellation and refund rules will apply as per operator policy.",
    ];
  }, [bus]);

  if (!open || !bus) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 px-4">
      <div className="max-h-[90vh] w-full max-w-6xl overflow-hidden rounded-3xl bg-white shadow-2xl">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Bus Details
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {bus.fromCity} → {bus.toCity}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-xl text-slate-600 transition hover:bg-slate-50"
          >
            ×
          </button>
        </div>

        {/* TABS */}
        <div className="border-b border-slate-200 px-6">
          <div className="flex flex-wrap gap-8">
            {[
              { key: "details", label: "Bus Details" },
              { key: "points", label: "Pickup & Drop Points" },
              { key: "amenities", label: "Amenities" },
              { key: "policies", label: "Policies" },
            ].map((tab) => {
              const isActive = activeTab === tab.key;

              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key as TabKey)}
                  className={`border-b-2 px-1 py-4 text-sm font-semibold transition ${
                    isActive
                      ? "border-red-400 text-red-500"
                      : "border-transparent text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* BODY */}
        <div className="max-h-[70vh] overflow-y-auto px-6 py-6">
          {activeTab === "details" && (
            <div className="grid grid-cols-[1.2fr_1fr_0.8fr_1fr] gap-6">
              <div>
                <div className="mb-4 h-20 w-20 rounded-xl bg-blue-600" />
                <p className="text-lg font-bold text-slate-900">
                  {bus.operatorName}
                </p>
                <p className="mt-1 text-sm text-slate-500">{bus.busName}</p>
                <p className="mt-2 text-sm text-slate-500">{bus.busType}</p>
                <p className="mt-6 text-sm text-red-400">
                  {bus.singleSeatsLeft} single seats left
                </p>
              </div>

              <div>
                <p className="text-xl font-bold text-slate-900">
                  {bus.departureDate}, {bus.departureTime}
                </p>
                <p className="mt-2 text-base text-slate-700">{bus.fromCity}</p>
                <p className="text-sm text-slate-500">
                  Main boarding city route
                </p>
              </div>

              <div className="text-center">
                <p className="text-base font-semibold text-slate-700">
                  {bus.duration}
                </p>
                <p className="mt-2 text-sm text-slate-500">Direct / Route Bus</p>
              </div>

              <div>
                <p className="text-xl font-bold text-slate-900">
                  {bus.arrivalDate}, {bus.arrivalTime}
                </p>
                <p className="mt-2 text-base text-slate-700">{bus.toCity}</p>
                <p className="text-sm text-slate-500">
                  Main dropping city route
                </p>
              </div>
            </div>
          )}

          {activeTab === "points" && (
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h3 className="mb-4 text-lg font-bold text-slate-900">
                  Boarding Points
                </h3>

                <div className="space-y-3">
                  {bus.boardingPoints.map((point) => (
                    <div
                      key={point.id}
                      className="rounded-2xl border border-slate-200 p-4"
                    >
                      <p className="text-lg font-bold text-slate-900">
                        {point.time}
                      </p>
                      <p className="mt-1 text-base font-semibold text-slate-800">
                        {point.name}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {point.address}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="mb-4 text-lg font-bold text-slate-900">
                  Dropping Points
                </h3>

                <div className="space-y-3">
                  {bus.droppingPoints.map((point) => (
                    <div
                      key={point.id}
                      className="rounded-2xl border border-slate-200 p-4"
                    >
                      <p className="text-lg font-bold text-slate-900">
                        {point.time}
                      </p>
                      <p className="mt-1 text-base font-semibold text-slate-800">
                        {point.name}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {point.address}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "amenities" && (
            <div>
              <h3 className="mb-4 text-lg font-bold text-slate-900">
                Bus Amenities
              </h3>

              <div className="grid grid-cols-3 gap-4">
                {bus.amenities.map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-slate-200 px-4 py-4 text-base font-medium text-slate-700"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "policies" && (
            <div>
              <h3 className="mb-4 text-lg font-bold text-slate-900">
                Important Policies
              </h3>

              <div className="space-y-3">
                {groupedPolicies.map((policy, index) => (
                  <div
                    key={index}
                    className="rounded-2xl border border-slate-200 px-4 py-4 text-sm leading-6 text-slate-700"
                  >
                    {policy}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}