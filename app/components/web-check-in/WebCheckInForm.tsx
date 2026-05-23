"use client";

import {
  Search,
  Ticket,
  User,
  MapPin,
  BadgeCheck,
} from "lucide-react";

import type { AirlineOption } from "@/app/lib/web-check-in/webCheckInAirlines";

type Props = {
  pnr: string;
  lastName: string;
  airline: string;
  departureCity: string;
  submitted: boolean;
  canContinue: boolean;
  prefillSource: "manual" | "booking";
  prefilledBookingTitle: string;
  selectedAirline: AirlineOption;
  airlines: AirlineOption[];

  setPnr: (value: string) => void;
  setLastName: (value: string) => void;
  setAirline: (value: string) => void;
  setDepartureCity: (value: string) => void;
  onContinue: () => void;
};

export default function WebCheckInForm({
  pnr,
  lastName,
  airline,
  departureCity,
  submitted,
  canContinue,
  prefillSource,
  prefilledBookingTitle,
  selectedAirline,
  airlines,
  setPnr,
  setLastName,
  setAirline,
  setDepartureCity,
  onContinue,
}: Props) {
  return (
    <section className="relative z-10 -mt-16">
      <div className="max-w-5xl mx-auto px-6">
        <div className="rounded-[32px] border border-white/40 bg-white/95 backdrop-blur-xl shadow-2xl p-6 md:p-8">
          {prefillSource === "booking" && (
            <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 p-4">
              <div className="flex items-start gap-3">
                <BadgeCheck
                  className="mt-1 text-green-700"
                  size={20}
                />

                <div>
                  <div className="font-extrabold text-green-800">
                    Details loaded from My Booking
                  </div>

                  <p className="mt-1 text-sm leading-6 text-green-700">
                    {prefilledBookingTitle
                      ? `Booking found: ${prefilledBookingTitle}`
                      : "Your flight booking details have been pre-filled."}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="grid lg:grid-cols-2 gap-5">
            <div>
              <label className="text-sm font-bold text-gray-700">
                PNR / Booking Reference
              </label>

              <div className="relative mt-2">
                <Ticket
                  className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"
                  size={20}
                />

                <input
                  value={pnr}
                  onChange={(event) =>
                    setPnr(event.target.value)
                  }
                  placeholder="Enter PNR"
                  className="h-16 w-full rounded-2xl border border-gray-200 bg-white pl-14 pr-5 text-lg font-semibold text-gray-900 outline-none transition focus:border-orange-500"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-bold text-gray-700">
                Passenger Last Name
              </label>

              <div className="relative mt-2">
                <User
                  className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"
                  size={20}
                />

                <input
                  value={lastName}
                  onChange={(event) =>
                    setLastName(event.target.value)
                  }
                  placeholder="Enter last name"
                  className="h-16 w-full rounded-2xl border border-gray-200 bg-white pl-14 pr-5 text-lg font-semibold text-gray-900 outline-none transition focus:border-orange-500"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-bold text-gray-700">
                Airline
              </label>

              <select
                value={airline}
                onChange={(event) =>
                  setAirline(event.target.value)
                }
                className="mt-2 h-16 w-full rounded-2xl border border-gray-200 bg-white px-5 text-lg font-semibold text-gray-900 outline-none transition focus:border-orange-500"
              >
                {airlines.map((item) => (
                  <option
                    key={item.code}
                    value={item.code}
                  >
                    {item.name} ({item.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-bold text-gray-700">
                Departure City
              </label>

              <div className="relative mt-2">
                <MapPin
                  className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"
                  size={20}
                />

                <input
                  value={departureCity}
                  onChange={(event) =>
                    setDepartureCity(event.target.value)
                  }
                  placeholder="Example: Delhi"
                  className="h-16 w-full rounded-2xl border border-gray-200 bg-white pl-14 pr-5 text-lg font-semibold text-gray-900 outline-none transition focus:border-orange-500"
                />
              </div>
            </div>
          </div>

          <button
            type="button"
            disabled={!canContinue}
            onClick={onContinue}
            className="mt-7 flex h-16 w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 px-8 text-base font-bold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Search size={18} />
            Continue to Web Check-in
          </button>

          {submitted && (
            <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-5">
              <div className="flex items-start gap-3">
                <BadgeCheck
                  className="mt-1 text-green-700"
                  size={20}
                />

                <div>
                  <div className="font-extrabold text-green-800">
                    Check-in details validated
                  </div>

                  <p className="mt-2 text-sm leading-6 text-green-700">
                    PNR {pnr} for {selectedAirline.name} is ready for
                    airline web check-in flow. You can now continue with
                    airline seat selection and boarding pass steps.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}