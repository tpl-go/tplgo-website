"use client";

import { useRouter } from "next/navigation";

export default function ThemeTabs({ themes, active, setActive }: any) {
  const router = useRouter();

  return (
    <>
      {/* Mobile Premium Grid */}
      <div className="mb-6 grid grid-cols-2 gap-3 md:hidden">
        {themes.map((t: any) => (
          <button
            key={t.id}
            onClick={() => {
              setActive(t.id);
              router.push(`/themes/${t.id}`);
            }}
            className={`
              relative overflow-hidden rounded-2xl border px-3 py-3 text-center
              transition-all duration-300 shadow-md backdrop-blur-xl
              ${
                active === t.id
                  ? "border-transparent bg-gradient-to-r from-[#ff5f2e] via-[#ff7a18] to-[#ff9f43] text-white shadow-[0_10px_24px_rgba(255,120,40,0.35)]"
                  : "border-white/50 bg-white/85 text-slate-800"
              }
            `}
          >
            <div className="text-[12px] font-black leading-tight">
              {t.name}
            </div>
          </button>
        ))}
      </div>

      {/* Desktop untouched */}
      <div className="mb-12 hidden justify-center gap-3 md:flex">
        {themes.map((t: any) => (
          <button
            key={t.id}
            onClick={() => {
              setActive(t.id);
              router.push(`/themes/${t.id}`);
            }}
            className={`
              px-3 py-1.5 rounded-md border border-gray-300 text-[12px] font-semibold transition-all duration-300
              shadow-sm
              ${
                active === t.id
                  ? "bg-orange-500 text-white shadow-md"
                  : "bg-white text-gray-800 hover:-translate-y-1 hover:shadow-lg"
              }
            `}
          >
            {t.name}
          </button>
        ))}
      </div>
    </>
  );
}