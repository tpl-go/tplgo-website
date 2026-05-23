"use client";

import DestinationCard from "./DestinationCard";

export default function DestinationRow({ data, onDestinationClick }: any) {
  return (
    <div className="flex justify-center gap-10 flex-wrap">
      {data.map((d: any, i: number) => (
        <DestinationCard
          key={i}
          d={d}
          onClick={() => onDestinationClick?.(d.name)}
        />
      ))}
    </div>
  );
}