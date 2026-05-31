"use client";

import { useRef } from "react";

export type HomestaySortOption =
  | "tplGuaranteed"
  | "popularity"
  | "priceLowToHigh"
  | "priceHighToLow"
  | "userRatingHighest"
  | "lowestPriceBestRated";

type Props = {
  activeSort: HomestaySortOption;
  onChange: (value: HomestaySortOption) => void;
};

const SORT_OPTIONS: { key: HomestaySortOption; label: string }[] = [
  { key: "tplGuaranteed", label: "TPL Guaranteed" },
  { key: "popularity", label: "Popularity" },
  { key: "priceLowToHigh", label: "Price (Low to High)" },
  { key: "priceHighToLow", label: "Price (High to Low)" },
  { key: "userRatingHighest", label: "User Rating (Highest)" },
  { key: "lowestPriceBestRated", label: "Lowest Price & Best Rated" },
];

export default function HomestayResultsSortBar({
  activeSort,
  onChange,
}: Props) {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const handleScroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;

    const firstItem = scrollRef.current.querySelector(
      '[data-sort-item="true"]'
    ) as HTMLButtonElement | null;

    const step = firstItem ? firstItem.offsetWidth : 180;

    scrollRef.current.scrollBy({
      left: direction === "left" ? -step : step,
      behavior: "smooth",
    });
  };

  return (
    <div className="mb-3 overflow-hidden rounded-2xl border border-[#e5e7eb] bg-white shadow-[0_1px_8px_rgba(15,23,42,0.04)] md:mb-4 md:rounded-md md:shadow-none">
      <div className="flex h-[44px] items-center md:h-[46px]">
        
        {/* LEFT ARROW */}
        <button
          type="button"
          onClick={() => handleScroll("left")}
          className="flex h-[44px] w-[34px] shrink-0 items-center justify-center border-r border-[#eef2f7] text-[18px] font-bold text-[#4b5563] transition hover:bg-[#f8fbff] hover:text-[#111827] md:h-[46px] md:w-[42px]"
        >
          ‹
        </button>

        {/* SCROLL AREA */}
        <div
          ref={scrollRef}
          className="flex min-w-0 flex-1 items-center overflow-x-auto whitespace-nowrap scroll-smooth"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {SORT_OPTIONS.map((option) => {
            const isActive = activeSort === option.key;

            return (
              <button
                key={option.key}
                data-sort-item="true"
                type="button"
                onClick={() => onChange(option.key)}
                className={[
                  "relative flex h-[44px] w-[132px] shrink-0 items-center justify-center border-r border-[#eef2f7] px-3 text-center text-[12px] font-bold transition-all duration-200 last:border-r-0 md:h-[46px] md:w-[190px] md:px-4 md:text-sm md:font-semibold",
                  isActive
                    ? "bg-[#eaf4ff] text-[#0b74ff]"
                    : "bg-white text-[#4b5563] hover:bg-[#f8fbff] hover:text-[#111827]",
                ].join(" ")}
              >
                <span className="relative z-10 block truncate">
                  {option.label}
                </span>

                {isActive && (
                  <span className="absolute inset-x-0 bottom-0 h-[2.5px] bg-[#0b74ff]" />
                )}
              </button>
            );
          })}
        </div>

        {/* RIGHT ARROW */}
        <button
          type="button"
          onClick={() => handleScroll("right")}
          className="flex h-[44px] w-[34px] shrink-0 items-center justify-center border-l border-[#eef2f7] text-[18px] font-bold text-[#4b5563] transition hover:bg-[#f8fbff] hover:text-[#111827] md:h-[46px] md:w-[42px]"
        >
          ›
        </button>

      </div>
    </div>
  );
}
