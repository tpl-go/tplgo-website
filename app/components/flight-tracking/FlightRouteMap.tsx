import { Clock, Gauge, MapPin, Navigation, Plane } from "lucide-react";

import type { FlightTrackingResult } from "@/app/lib/flight-tracking/flightTrackingTypes";

type Props = {
  flight: FlightTrackingResult;
};

function getProgressByStatus(status: FlightTrackingResult["status"]) {
  if (status === "Boarding") return 12;
  if (status === "Departed") return 45;
  if (status === "Delayed") return 18;
  if (status === "Landed") return 100;
  if (status === "Cancelled") return 0;

  return 28;
}

function getProgressLabel(status: FlightTrackingResult["status"]) {
  if (status === "Boarding") return "Boarding in progress";
  if (status === "Departed") return "Flight departed";
  if (status === "Delayed") return "Delayed departure";
  if (status === "Landed") return "Flight landed";
  if (status === "Cancelled") return "Flight cancelled";

  return "Flight on schedule";
}

export default function FlightRouteMap({ flight }: Props) {
  const progress = getProgressByStatus(flight.status);
  const progressLabel = getProgressLabel(flight.status);

  return (
    <div className="rounded-[30px] border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-2xl font-extrabold text-gray-900">
            Route Map
          </h3>

          <p className="mt-2 text-sm font-medium text-gray-500">
            Visual flight route overview from {flight.from} to {flight.to}
          </p>
        </div>

        <div className="rounded-full bg-orange-50 px-4 py-1.5 text-xs font-extrabold text-orange-700">
          Route overview
        </div>
      </div>

      <div className="relative mt-6 overflow-hidden rounded-[28px] border border-blue-100 bg-gradient-to-br from-[#eaf4ff] via-[#f8fbff] to-[#fff7ed] p-6">
        <div className="absolute inset-0 opacity-50">
          <div className="h-full w-full bg-[radial-gradient(circle_at_1px_1px,#94a3b8_1px,transparent_0)] [background-size:24px_24px]" />
        </div>

        <div className="absolute -left-20 top-10 h-48 w-48 rounded-full bg-blue-300/20 blur-3xl" />
        <div className="absolute -right-20 bottom-10 h-48 w-48 rounded-full bg-orange-300/20 blur-3xl" />

        <div className="relative z-10">
          <div className="grid grid-cols-[160px_1fr_160px] items-center gap-4">
            <div className="rounded-3xl bg-white/90 p-5 text-center shadow-sm">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#0B1F3A] text-white shadow-lg">
                <MapPin size={20} />
              </div>

              <div className="mt-4 text-3xl font-extrabold text-gray-900">
                {flight.from}
              </div>

              <div className="mt-2 text-xs font-semibold text-gray-500">
                Departure
              </div>

              <div className="mt-1 text-sm font-bold text-gray-800">
                {flight.departureTime}
              </div>
            </div>

            <div className="relative h-40">
              <svg
                viewBox="0 0 520 160"
                className="absolute inset-0 h-full w-full"
                preserveAspectRatio="none"
              >
                <path
                  d="M20 110 C150 20, 370 20, 500 110"
                  fill="none"
                  stroke="#cbd5e1"
                  strokeWidth="6"
                  strokeLinecap="round"
                />

                <path
                  d="M20 110 C150 20, 370 20, 500 110"
                  fill="none"
                  stroke="#f97316"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={`${Math.max(progress, 1) * 5.2} 520`}
                />
              </svg>

              <div
                className="absolute top-[42%] flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-orange-500 text-white shadow-2xl ring-8 ring-orange-500/15 transition-all"
                style={{
                  left: `${Math.min(Math.max(progress, 8), 92)}%`,
                }}
              >
                <Plane size={28} />
              </div>

              <div className="absolute left-1/2 top-[78%] -translate-x-1/2 rounded-full bg-white/95 px-4 py-2 text-xs font-extrabold text-gray-700 shadow-sm">
                {progressLabel}
              </div>
            </div>

            <div className="rounded-3xl bg-white/90 p-5 text-center shadow-sm">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#0B1F3A] text-white shadow-lg">
                <MapPin size={20} />
              </div>

              <div className="mt-4 text-3xl font-extrabold text-gray-900">
                {flight.to}
              </div>

              <div className="mt-2 text-xs font-semibold text-gray-500">
                Arrival
              </div>

              <div className="mt-1 text-sm font-bold text-gray-800">
                {flight.arrivalTime}
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-4 gap-3">
            <div className="rounded-2xl bg-white/90 p-4 shadow-sm">
              <Navigation size={18} className="text-orange-600" />

              <div className="mt-2 text-xs font-semibold text-gray-500">
                Terminal
              </div>

              <div className="mt-1 text-lg font-extrabold text-gray-900">
                {flight.terminal}
              </div>
            </div>

            <div className="rounded-2xl bg-white/90 p-4 shadow-sm">
              <MapPin size={18} className="text-orange-600" />

              <div className="mt-2 text-xs font-semibold text-gray-500">
                Gate
              </div>

              <div className="mt-1 text-lg font-extrabold text-gray-900">
                {flight.gate}
              </div>
            </div>

            <div className="rounded-2xl bg-white/90 p-4 shadow-sm">
              <Plane size={18} className="text-orange-600" />

              <div className="mt-2 text-xs font-semibold text-gray-500">
                Aircraft
              </div>

              <div className="mt-1 text-lg font-extrabold text-gray-900">
                {flight.aircraft}
              </div>
            </div>

            <div className="rounded-2xl bg-white/90 p-4 shadow-sm">
              <Gauge size={18} className="text-orange-600" />

              <div className="mt-2 text-xs font-semibold text-gray-500">
                Progress
              </div>

              <div className="mt-1 text-lg font-extrabold text-gray-900">
                {progress}%
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3 rounded-2xl bg-[#0B1F3A] px-5 py-4 text-white">
            <Clock size={18} className="text-orange-300" />

            <div>
              <div className="text-xs font-semibold text-white/60">
                Current update
              </div>

              <div className="mt-1 text-sm font-bold">
                {flight.status}
                {flight.delayMinutes
                  ? ` • Expected delay ${flight.delayMinutes} minutes`
                  : " • Timings are currently as scheduled"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}