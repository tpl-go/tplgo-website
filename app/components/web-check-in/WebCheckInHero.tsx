import Link from "next/link";
import {
  Plane,
  BadgeCheck,
  Clock,
  ShieldCheck,
} from "lucide-react";

export default function WebCheckInHero() {
  return (
    <section className="relative overflow-hidden bg-[#0B1F3A] text-white">
      <div className="absolute inset-0 bg-gradient-to-r from-[#0B1F3A] via-[#12315d] to-orange-500/30" />

      <div className="relative max-w-7xl mx-auto px-6 pt-16 pb-28">
        <Link
          href="/"
          className="inline-flex w-fit rounded-full bg-white/10 border border-white/20 px-5 py-2 text-sm font-semibold text-white hover:bg-white/20 transition"
        >
          ← Back to Home
        </Link>

        <div className="mt-10 max-w-4xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-4 py-1.5 text-sm font-bold">
            <Plane size={16} />
            Web Check-in
          </div>

          <h1 className="mt-6 text-4xl md:text-6xl font-extrabold leading-tight">
            Complete your web check-in with TPL
          </h1>

          <p className="mt-6 max-w-2xl text-base md:text-lg leading-8 text-white/85">
            Enter your PNR, passenger last name and airline details to continue
            toward airline web check-in and boarding pass flow.
          </p>

          <div className="mt-8 grid sm:grid-cols-3 gap-4 max-w-3xl">
            <div className="rounded-2xl bg-white/10 border border-white/15 p-4">
              <BadgeCheck size={22} className="text-green-300" />
              <div className="mt-3 font-bold">PNR Ready</div>
              <div className="mt-1 text-sm text-white/70">
                Booking details based flow
              </div>
            </div>

            <div className="rounded-2xl bg-white/10 border border-white/15 p-4">
              <Clock size={22} className="text-orange-300" />
              <div className="mt-3 font-bold">Check-in Window</div>
              <div className="mt-1 text-sm text-white/70">
                Airline-wise timing info
              </div>
            </div>

            <div className="rounded-2xl bg-white/10 border border-white/15 p-4">
              <ShieldCheck size={22} className="text-blue-300" />
              <div className="mt-3 font-bold">Secure Flow</div>
              <div className="mt-1 text-sm text-white/70">
                Passenger detail validation
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}