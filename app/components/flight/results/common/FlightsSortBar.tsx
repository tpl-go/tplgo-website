"use client";

import { useEffect, useRef, useState } from "react";

type SortType = "cheapest" | "nonstop" | "prefer" | "other";

type Props = {
  sortType: string;
  onSortChange: (value: string) => void;
  cheapestLabel?: string;
  nonstopLabel?: string;
  preferLabel?: string;
};

const otherOptions = [
  "Discounted Price",
  "Early Departure",
  "Late Departure",
  "Early Arrival",
  "Late Arrival",
];

export default function FlightsSortBar({
  sortType,
  onSortChange,
  cheapestLabel = "Current results",
  nonstopLabel = "Current results",
  preferLabel = "Current results",
}: Props) {
  const activeSort = sortType as SortType;

  const [selectedOtherOption, setSelectedOtherOption] = useState<string | null>(
    null
  );
  const [openDropdown, setOpenDropdown] = useState(false);

  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (otherOptions.includes(sortType)) {
      setSelectedOtherOption(sortType);
    } else {
      setSelectedOtherOption(null);
    }
  }, [sortType]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpenDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const getHeading = () => {
    if (sortType === "cheapest") {
      return "Flights sorted by Lowest fares on this route";
    }

    if (sortType === "nonstop") {
      return "Flights sorted by Fewest Stops";
    }

    if (sortType === "prefer") {
      return "Flights sorted by Popularity (based on price, duration & convenience)";
    }

    if (sortType === "Discounted Price") {
      return "Flights sorted by Discounted Price";
    }

    if (sortType === "Early Departure") {
      return "Flights sorted by Departure (Earliest first)";
    }

    if (sortType === "Late Departure") {
      return "Flights sorted by Departure (Latest first)";
    }

    if (sortType === "Early Arrival") {
      return "Flights sorted by Arrival (Earliest first)";
    }

    if (sortType === "Late Arrival") {
      return "Flights sorted by Arrival (Latest first)";
    }

    return "Flights sorted by Other Sort";
  };

  const isOtherActive =
    activeSort === "other" || otherOptions.includes(sortType);

  const baseCard =
    "relative rounded-xl bg-white px-3 py-3 shadow-sm cursor-pointer transition border sm:py-4";

  const activeStyle = "border-b-[3px] border-[#1d4ed8] bg-[#f8fbff]";
  const inactiveStyle = "border-[#e5e7eb] hover:bg-[#f9fafb]";

  const handleOtherOptionClick = (item: string) => {
    if (selectedOtherOption === item) {
      setSelectedOtherOption(null);
      onSortChange("other");
      setOpenDropdown(false);
      return;
    }

    setSelectedOtherOption(item);
    onSortChange(item);
    setOpenDropdown(false);
  };

  return (
    <>
      <div className="sm:hidden">
        <div className="rounded-2xl border border-[#d9e2ef] bg-white p-2 shadow-sm">
          <div className="mb-2 flex items-center justify-between gap-3 px-1">
            <div className="text-[12px] font-black text-[#111827]">
              Sort flights
            </div>
            <div className="max-w-[58%] truncate text-right text-[11px] font-semibold text-[#64748b]">
              {getHeading()}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => {
                onSortChange("cheapest");
                setOpenDropdown(false);
              }}
              className={`rounded-xl px-2 py-2 text-left transition ${
                activeSort === "cheapest"
                  ? "bg-[#0f172a] text-white"
                  : "bg-[#f8fafc] text-[#334155]"
              }`}
            >
              <div className="text-[11px] font-black">Cheapest</div>
              <div className="mt-0.5 truncate text-[10px] font-semibold opacity-80">
                {cheapestLabel}
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                onSortChange("nonstop");
                setOpenDropdown(false);
              }}
              className={`rounded-xl px-2 py-2 text-left transition ${
                activeSort === "nonstop"
                  ? "bg-[#0f172a] text-white"
                  : "bg-[#f8fafc] text-[#334155]"
              }`}
            >
              <div className="text-[11px] font-black">Non stop</div>
              <div className="mt-0.5 truncate text-[10px] font-semibold opacity-80">
                {nonstopLabel}
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                onSortChange("prefer");
                setOpenDropdown(false);
              }}
              className={`rounded-xl px-2 py-2 text-left transition ${
                activeSort === "prefer"
                  ? "bg-[#0f172a] text-white"
                  : "bg-[#f8fafc] text-[#334155]"
              }`}
            >
              <div className="text-[11px] font-black">Best</div>
              <div className="mt-0.5 truncate text-[10px] font-semibold opacity-80">
                {preferLabel}
              </div>
            </button>
          </div>

          <div className="relative mt-1.5">
            <button
              type="button"
              onClick={() => {
                onSortChange("other");
                setOpenDropdown((prev) => !prev);
              }}
              className={`flex h-9 w-full items-center justify-between rounded-xl px-3 text-[11px] font-black ${
                isOtherActive
                  ? "bg-[#eff6ff] text-[#1d4ed8]"
                  : "bg-[#f8fafc] text-[#475569]"
              }`}
            >
              <span>{selectedOtherOption || "More sorting options"}</span>
              <span>⌄</span>
            </button>

            {openDropdown && (
              <div className="absolute left-0 right-0 top-10 z-50 overflow-hidden rounded-xl border border-[#d9e2ef] bg-white shadow-xl">
                {otherOptions.map((item) => {
                  const isSelected = selectedOtherOption === item;

                  return (
                    <button
                      type="button"
                      key={item}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOtherOptionClick(item);
                      }}
                      className="flex w-full items-center justify-between px-3 py-2.5 text-left text-[12px] font-bold text-[#111827] hover:bg-[#f8fafc]"
                    >
                      <span>{item}</span>
                      <span className="text-[#2563eb]">{isSelected ? "✓" : ""}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>

      <div className="hidden grid-cols-[minmax(140px,1fr)_minmax(140px,1fr)_minmax(140px,1fr)_100px] gap-2 overflow-x-auto overflow-y-visible pb-1 sm:grid sm:grid-cols-[1fr_1fr_1fr_140px] sm:gap-3 sm:overflow-visible sm:pb-0 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div
          onClick={() => {
            onSortChange("cheapest");
            setOpenDropdown(false);
          }}
          className={`${baseCard} ${
            activeSort === "cheapest" ? activeStyle : inactiveStyle
          }`}
        >
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#0ea5e9] text-xs text-white sm:h-8 sm:w-8 sm:text-sm">
              ₹
            </div>

            <div>
              <div className="text-[12px] font-semibold text-[#111827] sm:text-[14px]">
                CHEAPEST
              </div>
              <div className="text-[11px] text-[#6b7280] sm:text-[12px]">
                {cheapestLabel}
              </div>
            </div>
          </div>
        </div>

        <div
          onClick={() => {
            onSortChange("nonstop");
            setOpenDropdown(false);
          }}
          className={`${baseCard} ${
            activeSort === "nonstop" ? activeStyle : inactiveStyle
          }`}
        >
          <div className="text-[12px] font-semibold text-[#111827] sm:text-[14px]">
            NON STOP FIRST
          </div>
          <div className="mt-1 text-[11px] text-[#6b7280] sm:text-[12px]">
            {nonstopLabel}
          </div>
        </div>

        <div
          onClick={() => {
            onSortChange("prefer");
            setOpenDropdown(false);
          }}
          className={`${baseCard} ${
            activeSort === "prefer" ? activeStyle : inactiveStyle
          }`}
        >
          <div className="text-[12px] font-semibold text-[#111827] sm:text-[14px]">
            YOU MAY PREFER
          </div>
          <div className="mt-1 text-[11px] text-[#6b7280] sm:text-[12px]">
            {preferLabel}
          </div>
        </div>

        <div
          ref={dropdownRef}
          className={`${baseCard} ${
            isOtherActive ? activeStyle : inactiveStyle
          } flex items-center justify-center`}
          onClick={() => {
            onSortChange("other");
            setOpenDropdown((prev) => !prev);
          }}
        >
          <div className="text-center text-[12px] font-semibold leading-tight text-[#111827] sm:text-[13px]">
            Other
            <br />
            Sort
          </div>

          {openDropdown && (
            <div className="absolute right-0 top-[62px] z-50 w-[210px] rounded-lg border border-[#e5e7eb] bg-white shadow-lg sm:top-[70px]">
              {otherOptions.map((item) => {
                const isSelected = selectedOtherOption === item;

                return (
                  <div
                    key={item}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOtherOptionClick(item);
                    }}
                    className="flex cursor-pointer items-center justify-between px-4 py-2 text-[14px] font-medium text-[#111827] hover:bg-[#f3f4f6]"
                  >
                    <span>{item}</span>
                    <span className="w-4 text-right text-[#111827]">
                      {isSelected ? "✓" : ""}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="mt-2 hidden flex-col gap-2 sm:mt-0 sm:flex sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="text-[12px] font-semibold text-[#111827] sm:text-[14px]">
          {getHeading()}
        </div>

      </div>
    </>
  );
}
