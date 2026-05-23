"use client";

import { useRouter } from "next/navigation";

export default function HolidaysHero() {
  const router = useRouter();

  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0f172a] via-[#111827] to-[#0b1220] p-8 text-white shadow-xl">
      <div className="absolute right-0 top-0 h-56 w-56 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="absolute bottom-0 left-20 h-40 w-40 rounded-full bg-blue-500/20 blur-3xl" />

      <div className="relative max-w-3xl">
        <p className="text-sm font-black uppercase tracking-[0.22em] text-cyan-300">
          TPL Holidays
        </p>

        <h1 className="mt-3 text-4xl font-black leading-tight">
          Explore India, International & Theme Based Holiday Packages
        </h1>

        <p className="mt-4 max-w-2xl text-sm font-medium leading-7 text-slate-300">
          Discover curated holiday packages by India states, continents and
          travel themes. Continue with the existing TPL package discovery flow.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => router.push("/popular/india")}
            className="rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 px-6 py-3 text-sm font-black text-white shadow-lg transition hover:scale-[1.02]"
          >
            Explore India Packages
          </button>

          <button
            type="button"
            onClick={() => router.push("/themes/romance")}
            className="rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-black text-white transition hover:bg-white/15"
          >
            Explore Theme Holidays
          </button>
        </div>
      </div>
    </section>
  );
}