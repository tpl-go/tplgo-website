import type { FlightTrackingResult } from "@/app/lib/flight-tracking/flightTrackingTypes";
import FlightStatusCard from "./FlightStatusCard";

type Props = {
  results: FlightTrackingResult[];
};

export default function FlightStatusResults({ results }: Props) {
  return (
    <section className="max-w-7xl mx-auto px-3 md:px-6 py-8 md:py-12">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-2xl md:text-4xl font-bold text-gray-900 leading-tight">
            Flight Status Results
          </h2>

          <p className="mt-2 md:mt-3 text-sm md:text-base text-gray-600 leading-6">
            Showing latest available flight tracking information.
          </p>
        </div>

        <div className="w-fit rounded-full bg-white px-4 md:px-5 py-2 text-xs md:text-sm font-bold text-gray-700 shadow-sm border">
          Latest flight updates
        </div>
      </div>

      {results.length > 0 ? (
        <div
          className={`mt-5 md:mt-8 grid gap-4 md:gap-6 ${
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
        <div className="mt-5 md:mt-8 rounded-[24px] md:rounded-[28px] border border-dashed border-gray-300 bg-white p-7 md:p-12 text-center">
          <div className="text-xl md:text-2xl font-bold text-gray-900">
            No flight status found
          </div>

          <p className="mt-3 text-sm md:text-base text-gray-600 leading-6">
            Try searching by another PNR, flight number, or route.
          </p>
        </div>
      )}
    </section>
  );
}