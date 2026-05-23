"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowUpRight, Building2, MapPin, Plane } from "lucide-react";

import { CAB_LOCATION_OPTIONS } from "@/app/lib/cab/cabSearchData";
import type { CabLocationItem } from "@/app/lib/cab/cabSearchTypes";

type Props = {
  label: string;
  value: CabLocationItem | null;
  onChange: (location: CabLocationItem) => void;
  placeholder: string;
  excludeId?: string;
  compact?: boolean;
};

export default function CabLocationSelector({
  label,
  value,
  onChange,
  placeholder,
  excludeId,
  compact = false,
}: Props) {
  const isFromLike =
    label.trim().toLowerCase() === "from" ||
    label.trim().toLowerCase() === "pickup" ||
    label.trim().toLowerCase() === "pickup location";

  const [query, setQuery] = useState(value?.city || "");
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
    setQuery(value?.city || "");
  }, [value]);

  const filteredLocations = useMemo(() => {
    const lower = query.trim().toLowerCase();

    return CAB_LOCATION_OPTIONS.filter((item) => {
      if (excludeId && item.id === excludeId) return false;

      if (!lower) return true;

      return (
        item.city.toLowerCase().includes(lower) ||
        item.label.toLowerCase().includes(lower) ||
        (item.code || "").toLowerCase().includes(lower)
      );
    });
  }, [query, excludeId]);

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
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;

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

  function renderPopupIcon(type?: string) {
    if (type === "airport") return <Plane size={18} />;
    if (type === "landmark") return <MapPin size={18} />;

    return <MapPin size={18} />;
  }

  const boxHeight = compact ? "h-[86px]" : "h-[86px]";
  const iconBox = compact ? "h-10 w-10" : "h-10 w-10";

  return (
    <>
      <div className="relative w-full min-w-0 flex-1">
        <div
          ref={triggerRef}
          onClick={() => setOpen(true)}
          className={`group flex ${boxHeight} cursor-text items-center gap-3 rounded-2xl border border-black bg-white/60 px-4 py-3 transition-all duration-300 hover:bg-white/75`}
        >
          <div
            className={`flex ${iconBox} items-center justify-center rounded-xl border border-orange-200 bg-orange-50 text-orange-600`}
          >
            {isFromLike ? <Building2 size={18} /> : <MapPin size={18} />}
          </div>

          <div className="min-w-0 flex-1">
            <p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-slate-600">
              {label}
            </p>

            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              placeholder={placeholder}
              className="w-full bg-transparent text-lg font-extrabold text-slate-950 outline-none placeholder:text-slate-500"
            />

            <p className="truncate text-[11px] text-slate-600">
              {value?.label || "Select location"}
            </p>
          </div>
        </div>
      </div>

      {mounted &&
        open &&
        createPortal(
          <div
            ref={popupRef}
            className="absolute z-[30] max-h-[320px] overflow-hidden rounded-2xl border border-black bg-white shadow-2xl"
            style={{
              top: popupStyle.top,
              left: popupStyle.left,
              width: popupStyle.width,
            }}
          >
            <div className="max-h-[320px] overflow-y-auto p-2">
              {filteredLocations.length > 0 ? (
                filteredLocations.map((location) => (
                  <button
                    key={location.id}
                    type="button"
                    onClick={() => {
                      onChange(location);
                      setQuery(location.city);
                      setOpen(false);
                    }}
                    className="flex w-full items-start justify-between rounded-xl px-3 py-3 text-left transition-all hover:bg-orange-50"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1 text-orange-600">
                        {renderPopupIcon(location.type)}
                      </div>

                      <div className="min-w-0">
                        <p className="text-[15px] font-bold text-slate-950">
                          {location.city}
                        </p>

                        <p className="text-sm text-slate-600">
                          {location.label}
                        </p>
                      </div>
                    </div>

                    <ArrowUpRight size={16} className="mt-1 text-slate-400" />
                  </button>
                ))
              ) : (
                <div className="px-4 py-6 text-sm text-slate-500">
                  No location found
                </div>
              )}
            </div>
          </div>,
          document.body
        )}
    </>
  );
}