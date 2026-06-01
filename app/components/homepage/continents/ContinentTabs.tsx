"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useRouter } from "next/navigation";

export default function ContinentTabs({
  continents,
  active,
  setActive,
}: any) {
  const router = useRouter();

  const handleSelect = (continentId: string) => {
    const selected = continents.find((c: any) => c.id === continentId);
    if (!selected) return;

    setActive(selected.id);

    const slug = encodeURIComponent(String(selected.name).toLowerCase());

    router.push(`/continent/${slug}`);
  };

  return (
    <>
      {/* Mobile Premium Select */}
      <div className="mb-4 md:hidden">
        <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.16em] text-slate-600">
          Choose continent
        </label>

        <div className="relative rounded-2xl border border-white/70 bg-white/90 p-1 shadow-[0_12px_26px_rgba(15,23,42,0.12)] backdrop-blur-xl">
          <select
            value={active}
            onChange={(event) => handleSelect(event.target.value)}
            className="h-12 w-full appearance-none rounded-[14px] bg-transparent px-4 pr-10 text-[14px] font-black text-slate-900 outline-none"
            aria-label="Choose continent package"
          >
            <option value="" disabled>
              Select a continent
            </option>
            {continents.map((c: any) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[12px] font-black text-orange-600">
            ▼
          </span>
        </div>
      </div>

      {/* Desktop untouched */}
      <div className="mb-14 hidden flex-wrap justify-center gap-5 md:flex">
        {continents.map((c: any) => (
          <button
            key={c.id}
            onClick={() => {
              setActive(c.id);

              // ✅ Part 2: button click -> open continent page
              // Using name so "North America" becomes "north america" (space preserved)
              const slug = encodeURIComponent(
                String(c.name).toLowerCase()
              );

              router.push(`/continent/${slug}`);
            }}
            className={`
              px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300
              shadow-sm
              ${
                active === c.id
                  ? "bg-orange-500 text-white shadow-md"
                  : "bg-white text-gray-800 hover:-translate-y-1 hover:shadow-lg"
              }
            `}
          >
            {c.name}
          </button>
        ))}
      </div>
    </>
  );
}
