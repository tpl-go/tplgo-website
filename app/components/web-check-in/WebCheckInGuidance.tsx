import type { AirlineOption } from "@/app/lib/web-check-in/webCheckInAirlines";

type Props = {
  airline: string;
  airlines: AirlineOption[];
};

export default function WebCheckInGuidance({
  airline,
  airlines,
}: Props) {
  return (
    <div className="rounded-[30px] border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-3xl font-extrabold text-gray-900">
        Airline check-in guidance
      </h2>

      <p className="mt-3 text-gray-600">
        Web check-in rules depend on airline, route, airport and booking
        class. Keep your ID proof and booking details ready.
      </p>

      <div className="mt-6 grid md:grid-cols-3 gap-4">
        {airlines.map((item) => (
          <div
            key={item.code}
            className={`rounded-2xl border p-5 transition ${
              item.code === airline
                ? "border-orange-300 bg-orange-50"
                : "border-gray-200 bg-gray-50"
            }`}
          >
            <div className="text-lg font-extrabold text-gray-900">
              {item.name}
            </div>

            <div className="mt-2 text-sm font-bold text-orange-600">
              {item.checkInWindow}
            </div>

            <p className="mt-3 text-sm leading-6 text-gray-600">
              {item.note}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}