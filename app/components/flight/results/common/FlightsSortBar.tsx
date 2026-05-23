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
  cheapestLabel = "₹ 9,753 | 02h 55m",
  nonstopLabel = "₹ 9,753 | 02h 55m",
  preferLabel = "₹ 9,753 | 02h 45m",
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
    "relative rounded-xl bg-white px-3 py-4 shadow-sm cursor-pointer transition border";

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
      <div className="grid grid-cols-[1fr_1fr_1fr_140px] gap-3">
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
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#0ea5e9] text-sm text-white">
              ₹
            </div>

            <div>
              <div className="text-[14px] font-semibold text-[#111827]">
                CHEAPEST
              </div>
              <div className="text-[12px] text-[#6b7280]">{cheapestLabel}</div>
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
          <div className="text-[14px] font-semibold text-[#111827]">
            NON STOP FIRST
          </div>
          <div className="mt-1 text-[12px] text-[#6b7280]">{nonstopLabel}</div>
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
          <div className="text-[14px] font-semibold text-[#111827]">
            YOU MAY PREFER
          </div>
          <div className="mt-1 text-[12px] text-[#6b7280]">{preferLabel}</div>
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
          <div className="text-center text-[13px] font-semibold leading-tight text-[#111827]">
            Other
            <br />
            Sort
          </div>

          {openDropdown && (
            <div className="absolute right-0 top-[70px] z-50 w-[210px] rounded-lg border border-[#e5e7eb] bg-white shadow-lg">
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

      <div className="mt-0 flex items-center justify-between gap-4">
        <div className="text-[14px] font-semibold text-[#111827]">
          {getHeading()}
        </div>

        <div className="rounded-full bg-[#fde2d7] px-4 py-2 text-[12px] font-medium text-[#7c2d12]">
          Cheaper Non-stop Flights available on 24 Mar & 27 Mar
        </div>
      </div>
    </>
  );
}