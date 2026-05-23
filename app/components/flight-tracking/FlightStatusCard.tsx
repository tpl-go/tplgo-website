import {
  Plane,
  MapPin,
  CalendarDays,
  Navigation,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";

import type { FlightTrackingResult } from "@/app/lib/flight-tracking/flightTrackingTypes";
import { getFlightStatusStyle } from "@/app/lib/flight-tracking/flightTrackingHelpers";
import FlightRouteMap from "./FlightRouteMap";

type Props = {
  flight: FlightTrackingResult;
  showMap?: boolean;
};

export default function FlightStatusCard({
  flight,
  showMap = false,
}: Props) {
  return (
    <div className="space-y-5">
      <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm hover:shadow-lg transition">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-sm font-bold text-orange-600">
              {flight.airline}
            </div>

            <h3 className="mt-2 text-2xl font-extrabold text-gray-900">
              {flight.flightNumber}
            </h3>
          </div>

          <div
            className={`rounded-full border px-4 py-1.5 text-xs font-extrabold ${getFlightStatusStyle(
              flight.status
            )}`}
          >
            {flight.status}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between gap-4">
          <div>
            <div className="text-3xl font-extrabold text-gray-900">
              {flight.from}
            </div>

            <div className="mt-1 text-sm text-gray-500">
              Departure {flight.departureTime}
            </div>
          </div>

          <div className="flex flex-col items-center text-gray-400">
            <Plane size={22} />
            <div className="mt-2 h-px w-20 bg-gray-200" />
          </div>

          <div className="text-right">
            <div className="text-3xl font-extrabold text-gray-900">
              {flight.to}
            </div>

            <div className="mt-1 text-sm text-gray-500">
              Arrival {flight.arrivalTime}
            </div>
          </div>
        </div>

        {flight.status === "Delayed" && (
          <div className="mt-6 flex items-center gap-3 rounded-2xl border border-orange-200 bg-orange-50 p-4 text-orange-700">
            <AlertTriangle size={18} />

            <div className="text-sm font-semibold">
              Expected delay: {flight.delayMinutes} minutes
            </div>
          </div>
        )}

        <div className="mt-6 grid grid-cols-3 gap-3">
          <div className="rounded-2xl bg-gray-50 p-4">
            <MapPin size={18} className="text-gray-500" />

            <div className="mt-2 text-xs text-gray-500">
              Terminal
            </div>

            <div className="mt-1 font-bold text-gray-900">
              {flight.terminal}
            </div>
          </div>

          <div className="rounded-2xl bg-gray-50 p-4">
            <Navigation size={18} className="text-gray-500" />

            <div className="mt-2 text-xs text-gray-500">
              Gate
            </div>

            <div className="mt-1 font-bold text-gray-900">
              {flight.gate}
            </div>
          </div>

          <div className="rounded-2xl bg-gray-50 p-4">
            <CalendarDays size={18} className="text-gray-500" />

            <div className="mt-2 text-xs text-gray-500">
              Date
            </div>

            <div className="mt-1 font-bold text-gray-900">
              {flight.date}
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between rounded-2xl bg-[#0B1F3A] px-5 py-4 text-white">
          <div>
            <div className="text-xs text-white/60">
              Aircraft
            </div>

            <div className="mt-1 font-bold">
              {flight.aircraft}
            </div>
          </div>

          <ArrowRight size={20} />
        </div>
      </div>

      {showMap && <FlightRouteMap flight={flight} />}
    </div>
  );
}