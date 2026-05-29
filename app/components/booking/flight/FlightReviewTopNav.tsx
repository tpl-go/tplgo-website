"use client";

import { useState } from "react";

type FlightReviewTopNavProps = {
  title?: string;
  subtitle?: string;
};

export default function FlightReviewTopNav({
  title = "Complete your booking",
  subtitle = "Flight booking review",
}: FlightReviewTopNavProps) {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;

    const y = el.getBoundingClientRect().top + window.pageYOffset - 140;

    window.scrollTo({
      top: y,
      behavior: "smooth",
    });

    setIsMobileNavOpen(false);
  };

  return (
    <div
      className="max-md:min-h-0"
      style={{
        width: "100%",
        background: "#111827",
        color: "#ffffff",
        minHeight: "56px",
        display: "flex",
        alignItems: "center",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        
      }}
    >
      <div
        className="max-md:flex-col max-md:items-start max-md:gap-3 max-md:px-3 max-md:py-3"
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          width: "100%",
          padding: "0 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "24px",
        }}
      >
        <div className="max-md:flex max-md:w-full max-md:items-center max-md:gap-3">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/20 text-[24px] font-bold leading-none text-white md:hidden"
            style={{
              background: "rgba(255,255,255,0.08)",
            }}
            aria-label="Go back"
          >
            ‹
          </button>

          <div
            className="max-md:min-w-0 max-md:flex-1 max-md:!whitespace-normal max-md:text-[16px] max-md:leading-[20px]"
            style={{
              fontSize: "18px",
              fontWeight: 700,
              color: "#ffffff",
              whiteSpace: "nowrap",
            }}
          >
            <span className="block truncate">{title}</span>
            <span className="mt-0.5 hidden truncate text-[11px] font-semibold text-white/65 max-md:block">
              {subtitle}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsMobileNavOpen((prev) => !prev)}
            className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 text-[18px] font-black leading-none text-white max-md:flex"
            aria-label="Toggle booking sections"
            aria-expanded={isMobileNavOpen}
          >
            ☰
          </button>
        </div>

        <div
          className={`max-md:w-full max-md:!flex-col max-md:items-stretch max-md:gap-1 max-md:overflow-hidden ${
            isMobileNavOpen ? "max-md:!flex" : "max-md:!hidden"
          }`}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "24px",
            fontSize: "12px",
            fontWeight: 700,
            color: "#ffffff",
            whiteSpace: "nowrap",
            flexWrap: "wrap",
            justifyContent: "flex-end",
          }}
        >
          <button
            onClick={() => scrollToSection("trip-summary")}
            className="max-md:w-full max-md:rounded-xl max-md:bg-white/10 max-md:px-3 max-md:py-2 max-md:text-left max-md:text-[11px]"
            style={navBtnStyle}
          >
            TRIP SUMMARY
          </button>

          <button
            onClick={() => scrollToSection("travel-insurance")}
            className="max-md:w-full max-md:rounded-xl max-md:bg-white/10 max-md:px-3 max-md:py-2 max-md:text-left max-md:text-[11px]"
            style={navBtnStyle}
          >
            TRAVEL INSURANCE
          </button>
          

          <button
            onClick={() => scrollToSection("traveller-detail")}
            className="max-md:w-full max-md:rounded-xl max-md:bg-white/10 max-md:px-3 max-md:py-2 max-md:text-left max-md:text-[11px]"
            style={navBtnStyle}
          >
            TRAVELLER DETAIL
          </button>

          

          <button
            onClick={() => scrollToSection("seat-meal")}
            className="max-md:w-full max-md:rounded-xl max-md:bg-white/10 max-md:px-3 max-md:py-2 max-md:text-left max-md:text-[11px]"
            style={navBtnStyle}
          >
            SEAT & MEAL
          </button>

          <button
            onClick={() => scrollToSection("cab")}
            className="max-md:w-full max-md:rounded-xl max-md:bg-white/10 max-md:px-3 max-md:py-2 max-md:text-left max-md:text-[11px]"
            style={navBtnStyle}
          >
            CAB
          </button>

          <button
            onClick={() => scrollToSection("addons")}
            className="max-md:w-full max-md:rounded-xl max-md:bg-white/10 max-md:px-3 max-md:py-2 max-md:text-left max-md:text-[11px]"
            style={navBtnStyle}
          >
            ADDONS
          </button>
        </div>
      </div>
    </div>
  );
}

const navBtnStyle: React.CSSProperties = {
  background: "transparent",
  border: "none",
  color: "#ffffff",
  cursor: "pointer",
  fontWeight: 700,
  fontSize: "12px",
  whiteSpace: "nowrap",
};
