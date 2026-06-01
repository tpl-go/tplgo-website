"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRouter } from "next/navigation"
import TPLDynamicImage from "@/app/components/common/TPLDynamicImage";



export default function ContinentCard({ c }: any) {

const router = useRouter()

  return (
    <div
      onClick={() => router.push(`/continent/${c.name.toLowerCase()}`)}
      className="group min-w-[172px] max-w-[172px] cursor-pointer sm:min-w-[220px] sm:max-w-[220px]"
    >
      <div className="relative h-[220px] overflow-hidden rounded-[18px] shadow-md sm:h-[280px] sm:rounded-2xl">

        <TPLDynamicImage
          src={c.imageUrl || c.image}
          imageQuery={c.imageQuery}
          fallbackSrc={c.fallbackImage || c.image}
          alt={c.imageAlt || c.name}
          className="h-full w-full"
          imgClassName="
            w-full h-full object-cover
            transition duration-500 ease-in-out
            group-hover:scale-110
          "
          sizes="(max-width: 640px) 172px, 220px"
          preferDynamic
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>

        <div className="absolute bottom-4 left-0 text-center w-full">
          <p className="px-3 text-[15px] font-black leading-5 text-white sm:text-lg sm:font-semibold">
            {c.name}
          </p>
        </div>

      </div>
    </div>
  );
}
