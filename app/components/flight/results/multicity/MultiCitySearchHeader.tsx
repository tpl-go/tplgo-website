"use client";

import { MultiCitySearchData } from "../../data/multicityFlights";

type Props = {
  searchData: MultiCitySearchData;
};

export default function MultiCitySearchHeader({ searchData }: Props) {
  const firstLeg = searchData.legs[0];
  const lastLeg = searchData.legs[searchData.legs.length - 1];

  const routeText =
    firstLeg && lastLeg
      ? `${firstLeg.fromCity} to ${lastLeg.toCity}`
      : "Multi City Route";

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-[160px_minmax(0,1fr)_220px_140px]">
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
            Trip Type
          </p>
          <p className="mt-1 text-[28px] font-bold leading-none text-gray-900">
            Multi City
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
            Route
          </p>
          <p className="mt-1 text-[18px] font-bold text-gray-900">{routeText}</p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
            Passenger & Class
          </p>
          <p className="mt-1 text-[18px] font-bold text-gray-900">
            {searchData.travellersText} • {searchData.cabinClassText}
          </p>
        </div>

        <button
          type="button"
          className="rounded-xl bg-red-600 px-4 py-4 text-sm font-semibold text-white transition hover:bg-red-700"
        >
          SEARCH
        </button>
      </div>
    </div>
  );
}