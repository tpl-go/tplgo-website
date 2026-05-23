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
    <div className="rounded-2xl bg-sky-50 px-4 py-2">
      <h2 className="text-[18px] font-bold leading-snug text-[#111827]">
        {routeCities.map((city, index) => (
          <span key={`${city}-${index}`}>
            {city} ({routeCodes[index]})
            {index < routeCities.length - 1 ? " → " : ""}
          </span>
        ))}
      </h2>

      <p className="mt-1 text-[13px] text-[#6b7280]">
        
      </p>
    </div>
  );
}