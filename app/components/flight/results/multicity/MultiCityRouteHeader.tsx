"use client";

import { MultiCityLeg } from "../../data/multicityFlights";

type Props = {
  legs: MultiCityLeg[];
};

export default function MultiCityRouteHeader({ legs }: Props) {
  if (!legs.length) return null;

  const routeCities = [
    legs[0]?.fromCity,
    ...legs.map((leg) => leg.toCity),
  ].filter(Boolean);

  const routeCodes = [
    legs[0]?.fromCode,
    ...legs.map((leg) => leg.toCode),
  ].filter(Boolean);

  return (
    <div className="rounded-2xl bg-sky-50 px-3 py-2 md:px-4">
      <h2 className="overflow-x-auto whitespace-nowrap text-[13px] font-black leading-snug text-[#111827] [-ms-overflow-style:none] [scrollbar-width:none] md:whitespace-normal md:text-[18px] md:font-bold [&::-webkit-scrollbar]:hidden">
        {routeCities.map((city, index) => (
          <span key={`${city}-${index}`}>
            {city} ({routeCodes[index]})
            {index < routeCities.length - 1 ? " → " : ""}
          </span>
        ))}
      </h2>

      <p className="mt-1 text-[11px] text-[#6b7280] md:text-[13px]">

      </p>
    </div>
  );
}
