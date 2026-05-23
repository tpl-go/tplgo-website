import Link from "next/link";
import {
  Plane,
  Clock,
  BadgeCheck,
  Navigation,
} from "lucide-react";

export default function FlightTrackingHero() {
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
            Live Flight Tracking
          </div>

          <h1 className="mt-6 text-4xl md:text-6xl font-extrabold leading-tight">
            Track your flight status with TPL
          </h1>

          <p className="mt-6 max-w-2xl text-base md:text-lg leading-8 text-white/85">
            Check flight status by PNR, booking ID, flight number, or route.
            This tracking layer is designed to help you plan airport arrival, boarding and travel updates.
          </p>

          <div className="mt-8 grid sm:grid-cols-3 gap-4 max-w-3xl">
            <div className="rounded-2xl bg-white/10 border border-white/15 p-4">
              <BadgeCheck size={22} className="text-green-300" />
              <div className="mt-3 font-bold">Real-time Ready</div>
              <div className="mt-1 text-sm text-white/70">
                API compatible structure
              </div>
            </div>

            <div className="rounded-2xl bg-white/10 border border-white/15 p-4">
              <Clock size={22} className="text-orange-300" />
              <div className="mt-3 font-bold">Delay Alerts</div>
              <div className="mt-1 text-sm text-white/70">
                Status & timing updates
              </div>
            </div>

            <div className="rounded-2xl bg-white/10 border border-white/15 p-4">
              <Navigation size={22} className="text-blue-300" />
              <div className="mt-3 font-bold">Route Tracking</div>
              <div className="mt-1 text-sm text-white/70">
                Origin to destination
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}