"use client";




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
      className={`${colSpan} relative rounded-3xl overflow-hidden cursor-pointer group`}
    >
      <img
        src={item.image}
        alt={item.name}
        className="w-full h-full object-cover transition duration-700 group-hover:scale-105"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>

      <div className="absolute bottom-0 left-0 w-full px-6 pb-6 pt-10
                bg-gradient-to-t from-black/75 via-black/40 to-transparent">

        <div className="flex items-center justify-between">

          <h4 className="text-white text-lg font-semibold tracking-wide">
            {item.name}
          </h4>

          <button
            className="bg-white text-black px-4 py-1.5 rounded-full text-xs font-semibold
                       shadow-md hover:bg-orange-500 hover:text-white transition duration-300">
            Explore →
          </button>

        </div>
      </div>
    </div>
  );
}