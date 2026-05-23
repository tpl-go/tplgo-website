"use client";

import { useRouter } from "next/navigation";

export default function ContinentTabs({ continents, active, setActive }: any) {
  const router = useRouter();

  return (
    <div className="flex flex-wrap justify-center gap-5 mb-14">
      {continents.map((c: any) => (
        <button
          key={c.id}
          onClick={() => {
            setActive(c.id);

            // ✅ Part 2: button click -> open continent page
            // Using name so "North America" becomes "north america" (space preserved)
            const slug = encodeURIComponent(String(c.name).toLowerCase());
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
  );
}