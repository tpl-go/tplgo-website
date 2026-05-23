"use client";

import { useRouter } from "next/navigation";

const continents = [
  { name: "Asia", href: "/continent/asia" },
  { name: "Europe", href: "/continent/europe" },
  { name: "Africa", href: "/continent/africa" },
  { name: "North America", href: "/continent/northamerica" },
  { name: "South America", href: "/continent/southamerica" },
  { name: "Australia & New Zealand", href: "/continent/oceania" },
  { name: "Antarctica", href: "/continent/antarctica" },
];

export default function HolidaysContinentSection() {
  const router = useRouter();

  return (
    <section className="rounded-3xl bg-white p-6 shadow-sm">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
        International Holidays
      </p>
      <h2 className="mt-1 text-2xl font-black text-slate-900">
        Explore by Continent
      </h2>

      <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-4">
        {continents.map((item) => (
          <button
            key={item.name}
            type="button"
            onClick={() => router.push(item.href)}
            className="rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-50 to-white p-5 text-left text-sm font-black text-slate-800 transition hover:border-cyan-300 hover:shadow-md"
          >
            {item.name}
          </button>
        ))}
      </div>
    </section>
  );
}