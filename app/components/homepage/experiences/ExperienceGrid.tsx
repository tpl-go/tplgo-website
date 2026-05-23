"use client";

import ExperienceCard from "./ExperienceCard";
import { Experience } from "./types";

interface Props {
  sorted: Experience[];
  handleClick: (slug: string) => void;
}

export default function ExperienceGrid({ sorted, handleClick }: Props) {
  return (
    <div className="grid grid-cols-6 auto-rows-[260px] gap-6">

      {/* Row 1 – 60 / 40 */}
      <ExperienceCard item={sorted[0]} colSpan="col-span-4" onClick={handleClick} />
      <ExperienceCard item={sorted[1]} colSpan="col-span-2" onClick={handleClick} />

      {/* Row 2 */}
      {sorted.slice(2, 5).map((item) => (
        <ExperienceCard
          key={item.id}
          item={item}
          colSpan="col-span-2"
          onClick={handleClick}
        />
      ))}

      {/* Row 3 */}
      {sorted.slice(5, 8).map((item) => (
        <ExperienceCard
          key={item.id}
          item={item}
          colSpan="col-span-2"
          onClick={handleClick}
        />
      ))}

      {/* Row 4 – 40 / 60 */}
      <ExperienceCard item={sorted[8]} colSpan="col-span-2" onClick={handleClick} />
      <ExperienceCard item={sorted[9]} colSpan="col-span-4" onClick={handleClick} />

    </div>
  );
}