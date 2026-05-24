"use client";

import { useRouter } from "next/navigation";

export default function ContinentTabs({
  continents,
  active,
  setActive,
}: any) {
  const router = useRouter();

  return (
    <>
      {/* Mobile Premium Grid */}
      <div className="mb-6 grid grid-cols-2 gap-3 md:hidden">
        {continents.map((c: any) => (
          <button
            key={c.id}
            onClick={() => {
              setActive(c.id);

              const slug = encodeURIComponent(
                String(c.name).toLowerCase()
              );

              router.push(`/continent/${slug}`);
            }}
            className={`
              relative overflow-hidden rounded-2xl border px-3 py-3 text-center
              transition-all duration-300 shadow-md backdrop-blur-xl
              ${
                active === c.id
                  ? "border-transparent bg-gradient-to-r from-[#ff5f2e] via-[#ff7a18] to-[#ff9f43] text-white shadow-[0_10px_24px_rgba(255,120,40,0.35)]"
                  : "border-white/50 bg-white/85 text-slate-800"
              }
            `}
          >
            <div className="text-[12px] font-black leading-tight">
              {c.name}
            </div>
          </button>
        ))}
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