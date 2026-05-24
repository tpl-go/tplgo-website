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
    <div className="space-y-4 md:space-y-5">
      <div className="rounded-[24px] md:rounded-[28px] border border-gray-200 bg-white p-4 md:p-6 shadow-sm hover:shadow-lg transition">
        {/* Top */}
        <div className="flex items-start justify-between gap-3 md:gap-4">
          <div className="min-w-0">
            <div className="text-xs md:text-sm font-bold text-orange-600 truncate">
              {flight.airline}
            </div>

            <h3 className="mt-1 md:mt-2 text-xl md:text-2xl font-extrabold text-gray-900">
              {flight.flightNumber}
            </h3>
          </div>

          <div
            className={`shrink-0 rounded-full border px-3 md:px-4 py-1.5 text-[11px] md:text-xs font-extrabold whitespace-nowrap ${getFlightStatusStyle(
              flight.status
            )}`}
          >
            {flight.status}
          </div>
        </div>

        {/* Route */}
        <div className="mt-5 md:mt-6 flex items-center justify-between gap-2 md:gap-4">
          <div className="min-w-0">
            <div className="text-2xl md:text-3xl font-extrabold text-gray-900">
              {flight.from}
            </div>

            <div className="mt-1 text-xs md:text-sm text-gray-500">
              Departure {flight.departureTime}
            </div>
          </div>

          <div className="flex flex-1 flex-col items-center text-gray-400 min-w-[60px]">
            <Plane size={18} className="md:w-[22px] md:h-[22px]" />

            <div className="mt-2 h-px w-full max-w-[80px] bg-gray-200" />
          </div>

          <div className="min-w-0 text-right">
            <div className="text-2xl md:text-3xl font-extrabold text-gray-900">
              {flight.to}
            </div>

            <div className="mt-1 text-xs md:text-sm text-gray-500">
              Arrival {flight.arrivalTime}
            </div>
          </div>
        </div>

        {/* Delay */}
        {flight.status === "Delayed" && (
          <div className="mt-5 md:mt-6 flex items-start gap-3 rounded-2xl border border-orange-200 bg-orange-50 p-4 text-orange-700">
            <AlertTriangle size={18} className="shrink-0 mt-0.5" />

            <div className="text-sm font-semibold leading-6">
              Expected delay: {flight.delayMinutes} minutes
            </div>
          </div>
        )}

        {/* Info Cards */}
        <div className="mt-5 md:mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-2xl bg-gray-50 p-4">
            <MapPin size={18} className="text-gray-500" />

            <div className="mt-2 text-xs text-gray-500">
              Terminal
            </div>

            <div className="mt-1 font-bold text-sm md:text-base text-gray-900">
              {flight.terminal}
            </div>
          </div>

          <div className="rounded-2xl bg-gray-50 p-4">
            <Navigation size={18} className="text-gray-500" />

            <div className="mt-2 text-xs text-gray-500">
              Gate
            </div>

            <div className="mt-1 font-bold text-sm md:text-base text-gray-900">
              {flight.gate}
            </div>
          </div>

          <div className="rounded-2xl bg-gray-50 p-4">
            <CalendarDays size={18} className="text-gray-500" />

            <div className="mt-2 text-xs text-gray-500">
              Date
            </div>

            <div className="mt-1 font-bold text-sm md:text-base text-gray-900">
              {flight.date}
            </div>
          </div>
        </div>

        {/* Aircraft */}
        <div className="mt-5 md:mt-6 flex items-center justify-between rounded-2xl bg-[#0B1F3A] px-4 md:px-5 py-4 text-white">
          <div className="min-w-0">
            <div className="text-[11px] md:text-xs text-white/60">
              Aircraft
            </div>

            <div className="mt-1 font-bold text-sm md:text-base truncate">
              {flight.aircraft}
            </div>
          </div>

          <ArrowRight size={18} className="shrink-0 md:w-5 md:h-5" />
        </div>
      </div>

      {showMap && <FlightRouteMap flight={flight} />}
    </div>
  );
}