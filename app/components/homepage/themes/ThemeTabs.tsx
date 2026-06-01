"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useRouter } from "next/navigation";

export default function ThemeTabs({ themes, active, setActive }: any) {
  const router = useRouter();

  const handleSelect = (themeId: string) => {
    const selected = themes.find((t: any) => t.id === themeId);
    if (!selected) return;

    setActive(selected.id);
    router.push(`/themes/${selected.id}`);
  };

  return (
    <>
      {/* Mobile Premium Select */}
      <div className="mb-4 md:hidden">
        <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.16em] text-slate-600">
          Choose theme
        </label>

        <div className="relative rounded-2xl border border-white/70 bg-white/90 p-1 shadow-[0_12px_26px_rgba(15,23,42,0.12)] backdrop-blur-xl">
          <select
            value={active}
            onChange={(event) => handleSelect(event.target.value)}
            className="h-12 w-full appearance-none rounded-[14px] bg-transparent px-4 pr-10 text-[14px] font-black text-slate-900 outline-none"
            aria-label="Choose theme package"
          >
            <option value="" disabled>
              Select a theme
            </option>
            {themes.map((t: any) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>

          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[12px] font-black text-orange-600">
            ▼
          </span>
        </div>
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
