"use client";

import { useState } from "react";

interface Props {
  slug: string;
  countries: string[];
  activeCountry: string;
  setActiveCountry: (country: string) => void;
}

export default function CountryTabs({ slug, countries, activeCountry, setActiveCountry }: Props) {

  

  

  const formattedSlug =
  slug && slug.length > 0
    ? decodeURIComponent(slug)
        .split(" ")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ")
    : "Asia";

  return (
    <div className="w-full bg-white border rounded-2x1 shadow-sm p-6">

      {/* Title */}


      <h2 className="text-2xl font-semibold mb-6 text-black">
        Top Destinations in {formattedSlug}
      </h2>

      {/* Tabs Wrapper */}
      <div className="flex gap-3 overflow-x-auto pb-2">

        {countries.map((country) => {

          const isActive = activeCountry === country;

          return (
            <button
              key={country}
              onClick={() => setActiveCountry(isActive ? "" : country)}
              className={`
                whitespace-nowrap
                px-4
                py-2
                rounded-md
                border
                text-sm
                transition
                ${isActive
                  ? "bg-orange-500 text-white border-orange-500"
                  : "bg-white text-black border-gray-300 hover:border-orange-400"
                }
              `}
            >
              {country}
            </button>
          );
        })}

      </div>

    </div>
  );
}