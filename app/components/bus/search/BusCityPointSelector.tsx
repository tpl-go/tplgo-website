"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MapPin, ArrowUpRight, Building2 } from "lucide-react";
import { busLocations } from "./busData";

type Props = {
  mode: "FROM" | "TO";
  state: any;
  dispatch: any;
};

export default function BusCityPointSelector({ mode, state, dispatch }: Props) {
  const isFrom = mode === "FROM";

  const selectedCity = isFrom ? state.fromCity : state.toCity;
  const oppositeCity = isFrom ? state.toCity : state.fromCity;

  const [query, setQuery] = useState(selectedCity || "");
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [popupStyle, setPopupStyle] = useState({ top: 0, left: 0, width: 0 });

  const triggerRef = useRef<HTMLDivElement | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setQuery(selectedCity || "");
  }, [selectedCity]);

  const filteredCities = useMemo(() => {
    const lower = query.trim().toLowerCase();

    let list = !lower
      ? busLocations
      : busLocations.filter((item) => {
          return (
            item.city.toLowerCase().includes(lower) ||
            item.state.toLowerCase().includes(lower)
          );
        });

    if (oppositeCity?.trim()) {
      list = list.filter(
        (item) => item.city.toLowerCase() !== oppositeCity.trim().toLowerCase()
      );
    }

    return list;
  }, [query, oppositeCity]);

  function updatePosition() {
    if (!triggerRef.current) return;

    const rect = triggerRef.current.getBoundingClientRect();
    const width = rect.width;
    const gap = 10;

    let left = rect.left + window.scrollX;
    let top = rect.bottom + window.scrollY + gap;

    const maxLeft = window.scrollX + window.innerWidth - width - 16;
    if (left > maxLeft) {
      left = Math.max(window.scrollX + 16, maxLeft);
    }

    const safeHeaderBottom = window.scrollY + 120;
    if (top < safeHeaderBottom) {
      top = safeHeaderBottom;
    }

    setPopupStyle({ top, left, width });
  }

  useEffect(() => {
    if (!open) return;

    updatePosition();

    const handleScrollOrResize = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        updatePosition();
      });
    };

    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);

    return () => {
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [open]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;

      if (
        triggerRef.current &&
        !triggerRef.current.contains(target) &&
        popupRef.current &&
        !popupRef.current.contains(target)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelectCity(cityObj: any) {
    if (
      oppositeCity &&
      cityObj.city.trim().toLowerCase() === oppositeCity.trim().toLowerCase()
    ) {
      alert("From and To cities cannot be the same");
      return;
    }

    setQuery(cityObj.city);

    if (isFrom) {
      dispatch({ type: "SET_FROM_CITY", payload: cityObj.city });
      dispatch({ type: "SET_FROM_POINT", payload: "" });
    } else {
      dispatch({ type: "SET_TO_CITY", payload: cityObj.city });
      dispatch({ type: "SET_TO_POINT", payload: "" });
    }

    setOpen(false);
  }

  const heading = isFrom ? "From" : "To";

  return (
    <>
      <div className="relative w-full min-w-[280px] flex-1">
        <div
          ref={triggerRef}
          onClick={() => setOpen(true)}
          className="group flex h-[78px] cursor-text items-center gap-3 rounded-2xl border border-slate-200 bg-white/90 px-4 shadow-sm transition-all duration-300 hover:border-orange-300 hover:shadow-md"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
            {isFrom ? <Building2 size={20} /> : <MapPin size={20} />}
          </div>

          <div className="min-w-0 flex-1">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
              {heading}
            </p>

            <input
              value={query}
              onChange={(e) => {
                const value = e.target.value;
                setQuery(value);
                setOpen(true);

                if (
                  oppositeCity &&
                  value.trim().toLowerCase() === oppositeCity.trim().toLowerCase()
                ) {
                  if (isFrom) {
                    dispatch({ type: "SET_FROM_CITY", payload: "" });
                    dispatch({ type: "SET_FROM_POINT", payload: "" });
                  } else {
                    dispatch({ type: "SET_TO_CITY", payload: "" });
                    dispatch({ type: "SET_TO_POINT", payload: "" });
                  }
                  return;
                }

                if (isFrom) {
                  dispatch({ type: "SET_FROM_CITY", payload: value });
                  dispatch({ type: "SET_FROM_POINT", payload: "" });
                } else {
                  dispatch({ type: "SET_TO_CITY", payload: value });
                  dispatch({ type: "SET_TO_POINT", payload: "" });
                }
              }}
              placeholder={isFrom ? "Boarding city" : "Destination city"}
              className="w-full bg-transparent text-[15px] font-semibold text-slate-800 outline-none placeholder:text-slate-400"
            />

            <p className="truncate text-xs text-slate-500">
              {selectedCity
                ? "Selected city"
                : isFrom
                ? "Select boarding city"
                : "Select destination city"}
            </p>
          </div>
        </div>
      </div>

      {mounted &&
        open &&
        createPortal(
          <div
            ref={popupRef}
            className="absolute z-40 max-h-[320px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
            style={{
              top: popupStyle.top,
              left: popupStyle.left,
              width: popupStyle.width,
            }}
          >
            <div className="max-h-[320px] overflow-y-auto p-2">
              {filteredCities.length > 0 ? (
                filteredCities.map((item) => (
                  <button
                    key={item.city}
                    type="button"
                    onClick={() => handleSelectCity(item)}
                    className="flex w-full items-start justify-between rounded-xl px-3 py-3 text-left transition-all hover:bg-orange-50"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1 text-slate-500">
                        <MapPin size={18} />
                      </div>

                      <div>
                        <p className="text-[15px] font-semibold text-slate-800">
                          {item.city}
                        </p>
                        <p className="text-sm text-slate-500">{item.state}</p>
                      </div>
                    </div>

                    <ArrowUpRight size={16} className="mt-1 text-slate-400" />
                  </button>
                ))
              ) : (
                <div className="px-4 py-6 text-sm text-slate-500">
                  No city found
                </div>
              )}
            </div>
          </div>,
          document.body
        )}
    </>
  );
}