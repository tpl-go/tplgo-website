import PopularDestinations from "../components/homepage/PopularDestinations/PopularDestinations";
import ContinentsSection from "../components/homepage/continents/ContinentsSection";
import ThemeSection from "../components/homepage/themes/ThemeSection";
import ExperiencesSection from "../components/homepage/experiences/ExperiencesSection";

export default function HolidaysPage() {
  return (
    <main className="min-h-screen bg-slate-100">
      {/* HERO */}
      <section className="relative h-[420px] overflow-hidden">
        {/* BG IMAGE */}
        <img
          src="/images/holidays/holidays-hero.jpg"
          alt="TPL Holidays"
          className="absolute inset-0 h-full w-full object-cover"
        />

        {/* OVERLAY */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/20" />

        {/* GLOW */}
        <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="absolute bottom-0 left-10 h-60 w-60 rounded-full bg-blue-500/20 blur-3xl" />

        {/* CONTENT */}
        <div className="relative mx-auto flex h-full max-w-7xl items-center px-4">
          <div className="max-w-3xl">
            <p className="text-sm font-black uppercase tracking-[0.24em] text-cyan-300">
              TPL HOLIDAYS
            </p>

            <h1 className="mt-4 text-5xl font-black leading-tight text-white">
              Explore India, International & Theme Based Holidays
            </h1>

            <p className="mt-5 max-w-2xl text-base font-medium leading-8 text-slate-200">
              Discover curated holiday experiences across India states,
              international continents, honeymoon escapes, adventure journeys,
              spiritual tours, luxury vacations and more.
            </p>
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <div className="space-y-2 bg-slate-100 pb-10">
        <PopularDestinations />
        <ContinentsSection />
        <ThemeSection />
        <ExperiencesSection />
      </div>
    </main>
  );
}