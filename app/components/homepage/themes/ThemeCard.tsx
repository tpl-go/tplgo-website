"use client";
import { useRouter } from "next/navigation"

export default function ThemeCard({ t }: any) {

const router = useRouter();
const goTheme = () => router.push(`/themes/${t.key}`);

 return (
    <div
      onClick={() => router.push(`/themes/${t.id}`)}
      className="min-w-[220px] max-w-[220px] cursor-pointer group"
    >
      <div className="relative h-[280px] rounded-2xl overflow-hidden shadow-md">

        <img
          src={t.image}
          alt={t.name}
          className="
            w-full h-full object-cover
            transition duration-500 ease-in-out
            group-hover:scale-110
          "
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>

        <div className="absolute bottom-4 left-0 text-center w-full">
          <p className="text-white text-lg font-semibold">
            {t.name}
          </p>
        </div>

      </div>
    </div>
  );
}