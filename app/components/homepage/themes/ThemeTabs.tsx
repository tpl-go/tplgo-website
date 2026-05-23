"use client";
import { useRouter } from "next/navigation";

export default function ThemeTabs({ themes, active, setActive }: any) {
const router = useRouter();


  return (
    <div className="flex justify-center gap-3 mb-12">
      {themes.map((t: any) => (
        <button
          key={t.id}
          onClick={() => {
 setActive(t.id)
 router.push(`/themes/${t.id}`)
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
  );
}