import type { FlightTrackingResult } from "@/app/lib/flight-tracking/flightTrackingTypes";
import FlightStatusCard from "./FlightStatusCard";

type Props = {
  results: FlightTrackingResult[];
};

export default function FlightStatusResults({ results }: Props) {
  return (
    <section className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-4xl font-bold text-gray-900">
            Flight Status Results
          </h2>

          <p className="mt-3 text-gray-600">
            Showing latest available flight tracking information.
          </p>
        </div>

        <div className="rounded-full bg-white px-5 py-2 text-sm font-bold text-gray-700 shadow-sm border">
          Latest flight updates
        </div>
      </div>

      {results.length > 0 ? (
        <div
          className={`mt-8 grid gap-6 ${
            results.length === 1
              ? "grid-cols-1 place-items-center"
              : "grid-cols-1 lg:grid-cols-2"
          }`}
        >
          {results.map((flight, index) => (
            <div
              key={`${flight.airline}-${flight.flightNumber}`}
              className={results.length === 1 ? "w-full max-w-4xl" : "w-full"}
            >
              <FlightStatusCard
                flight={flight}
                showMap={index === 0}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-[28px] border border-dashed border-gray-300 bg-white p-12 text-center">
          <div className="text-2xl font-bold text-gray-900">
            No flight status found
          </div>

          <p className="mt-3 text-gray-600">
            Try searching by another PNR, flight number, or route.
          </p>
        </div>
      )}
    </section>
  );
}