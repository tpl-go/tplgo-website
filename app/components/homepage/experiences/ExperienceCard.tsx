"use client";

import TPLDynamicImage from "@/app/components/common/TPLDynamicImage";
import { Experience } from "./types";

interface Props {
  item: Experience;
  colSpan: string;
  onClick: (slug: string) => void;
}

export default function ExperienceCard({ item, colSpan, onClick }: Props) {
  return (
    <div
      onClick={() => onClick(item.slug)}
      className={`${colSpan} group relative min-h-[180px] overflow-hidden rounded-2xl cursor-pointer md:min-h-0 md:rounded-3xl`}
    >
      <TPLDynamicImage
        src={item.image}
        imageQuery={item.imageQuery}
        fallbackSrc={item.fallbackImage || item.image}
        alt={item.imageAlt || item.name}
        className="h-full w-full"
        imgClassName="h-full w-full object-cover transition duration-700 group-hover:scale-105"
        sizes="(max-width: 768px) 50vw, 33vw"
        preferDynamic
      />

      <div className="absolute inset-0 bg-black/10"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>

      <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/75 via-black/40 to-transparent px-3 pb-3 pt-10 md:px-6 md:pb-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h4 className="line-clamp-2 text-sm font-bold leading-tight tracking-wide text-white md:text-lg md:font-semibold">
            {item.name}
          </h4>

          <button className="w-fit rounded-full bg-white px-3 py-1.5 text-[11px] font-semibold text-black shadow-md transition duration-300 hover:bg-orange-500 hover:text-white md:px-4 md:text-xs">
            Explore →
          </button>
        </div>
      </div>
    </div>
  );
}
