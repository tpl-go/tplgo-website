import Link from "next/link";
import MobileInnerBack from "../components/common/mobile/MobileInnerBack";
import PopularDestinations from "../components/homepage/PopularDestinations/PopularDestinations";
import ContinentsSection from "../components/homepage/continents/ContinentsSection";
import ThemeSection from "../components/homepage/themes/ThemeSection";
import ExperiencesSection from "../components/homepage/experiences/ExperiencesSection";
import { ArrowRight, ChevronDown, Globe2, MapPin, Sparkles } from "lucide-react";

const indiaStates = [
  "Rajasthan",
  "Goa",
  "Kashmir",
  "Kerala",
  "Himachal Pradesh",
  "Uttarakhand",
  "Ladakh",
  "Sikkim",
  "Meghalaya",
  "Andaman",
];

const continentOptions = [
  { name: "Asia", href: "/continent/asia" },
  { name: "Europe", href: "/continent/europe" },
  { name: "North America", href: "/continent/northamerica" },
  { name: "South America", href: "/continent/southamerica" },
  { name: "Africa", href: "/continent/africa" },
  { name: "Australia & New Zealand", href: "/continent/oceania" },
  { name: "Antarctica", href: "/continent/antarctica" },
];

const themeOptions = [
  { name: "Cultural", href: "/themes/cultural" },
  { name: "Spiritual", href: "/themes/spiritual" },
  { name: "Rural", href: "/themes/rural" },
  { name: "Wellness & Medical", href: "/themes/wellness" },
  { name: "Adventure & Nature", href: "/themes/adventure" },
  { name: "Eco & Wild Life", href: "/themes/wildlife" },
  { name: "Honeymoon & Celebration", href: "/themes/romance" },
  { name: "Educational", href: "/themes/educational" },
  { name: "Short & Weekend", href: "/themes/weekend" },
  { name: "Pre Wedding & Production", href: "/themes/media" },
];

export default function HolidaysPage() {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-slate-100">
      <div className="bg-slate-100 px-3 pb-2 pt-3 lg:hidden">
        <MobileInnerBack title="Back" />
      </div>

      {/* HERO */}
      <section className="relative h-[340px] overflow-hidden md:h-[420px]">
        {/* BG IMAGE */}
        <img
          src="/images/holidays/holidays-hero.jpg"
          alt="TPL Holidays"
          className="absolute inset-0 h-full w-full object-cover"
        />

        {/* OVERLAY */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/20" />

        {/* GLOW */}
        <div className="absolute right-0 top-0 hidden h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl md:block" />
        <div className="absolute bottom-0 left-10 hidden h-60 w-60 rounded-full bg-blue-500/20 blur-3xl md:block" />

        {/* CONTENT */}
        <div className="relative mx-auto flex h-full max-w-7xl items-center px-3 sm:px-4">
          <div className="max-w-3xl min-w-0">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-300 md:text-sm md:tracking-[0.24em]">
              TPL HOLIDAYS
            </p>

            <h1 className="mt-3 text-3xl font-black leading-tight text-white sm:text-4xl md:mt-4 md:text-5xl">
              Explore India, International & Theme Based Holidays
            </h1>

            <p className="mt-4 max-w-2xl text-sm font-medium leading-7 text-slate-200 md:mt-5 md:text-base md:leading-8">
              Discover curated holiday experiences across India states,
              international continents, honeymoon escapes, adventure journeys,
              spiritual tours, luxury vacations and more.
            </p>
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <div className="space-y-2 bg-slate-100 pb-20 md:pb-10">
        <section className="px-3 py-10 sm:px-4 md:py-16">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="min-w-0">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-orange-50 px-4 py-2 text-xs font-bold text-orange-600 md:text-sm">
                  <MapPin size={16} />
                  India Packages
                </div>

                <h2 className="text-2xl font-extrabold text-slate-950 md:text-4xl">
                  Explore India by State
                </h2>

                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 md:text-base">
                  Choose a state to open curated India holiday packages with that
                  state already selected.
                </p>
              </div>

              <Link
                href="/popular/india"
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-[#061839] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 md:w-auto"
              >
                View all India packages
                <ArrowRight size={16} />
              </Link>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:mt-8 lg:grid-cols-5">
              {indiaStates.map((state) => (
                <Link
                  key={state}
                  href={`/popular/india?matchedState=${encodeURIComponent(state)}`}
                  className="group min-w-0 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition hover:-translate-y-1 hover:border-orange-200 hover:shadow-xl md:p-4"
                >
                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-orange-600 md:h-11 md:w-11">
                    <MapPin size={18} />
                  </div>

                  <h3 className="truncate text-sm font-extrabold text-slate-950 md:text-base">
                    {state}
                  </h3>

                  <p className="mt-1 text-xs font-semibold text-slate-500 md:text-sm">
                    Packages
                  </p>

                  <div className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-orange-600">
                    Explore
                    <ArrowRight
                      size={14}
                      className="transition group-hover:translate-x-0.5"
                    />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <PopularDestinations />

        <div className="holidays-continent-wrap">
          <div className="px-3 pt-2 sm:px-4 md:hidden">
            <details className="group rounded-2xl border border-orange-100 bg-white shadow-sm">
              <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3">
                <span className="flex min-w-0 items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-500 text-white">
                    <Globe2 size={17} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[11px] font-bold uppercase tracking-wide text-orange-600">
                      Continental Packages
                    </span>
                    <span className="block truncate text-sm font-extrabold text-slate-950">
                      Change Continent
                    </span>
                  </span>
                </span>
                <ChevronDown
                  size={17}
                  className="shrink-0 text-slate-500 transition group-open:rotate-180"
                />
              </summary>

              <div className="grid grid-cols-1 gap-2 border-t border-slate-100 px-3 pb-3 pt-2">
                {continentOptions.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex min-h-11 items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-bold text-slate-800"
                  >
                    <span className="truncate">{item.name}</span>
                    <ArrowRight size={14} className="shrink-0 text-orange-500" />
                  </Link>
                ))}
              </div>
            </details>
          </div>

          <ContinentsSection />
        </div>

        <div className="holidays-theme-wrap">
          <div className="px-3 pt-2 sm:px-4 md:hidden">
            <details className="group rounded-2xl border border-orange-100 bg-white shadow-sm">
              <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3">
                <span className="flex min-w-0 items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-500 text-white">
                    <Sparkles size={17} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[11px] font-bold uppercase tracking-wide text-orange-600">
                      Theme Packages
                    </span>
                    <span className="block truncate text-sm font-extrabold text-slate-950">
                      Explore Themes
                    </span>
                  </span>
                </span>
                <ChevronDown
                  size={17}
                  className="shrink-0 text-slate-500 transition group-open:rotate-180"
                />
              </summary>

              <div className="grid grid-cols-1 gap-2 border-t border-slate-100 px-3 pb-3 pt-2">
                {themeOptions.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex min-h-11 items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-bold text-slate-800"
                  >
                    <span className="truncate">{item.name}</span>
                    <ArrowRight size={14} className="shrink-0 text-orange-500" />
                  </Link>
                ))}
              </div>
            </details>
          </div>

          <ThemeSection />
        </div>

        <ExperiencesSection />
      </div>

      <style>{`
        @media (max-width: 767px) {
          .holidays-continent-wrap > section > div.relative.z-10:nth-of-type(2),
          .holidays-theme-wrap > section > div.relative.z-10:nth-of-type(2) {
            display: none;
          }
        }
      `}</style>
    </main>
  );
}
