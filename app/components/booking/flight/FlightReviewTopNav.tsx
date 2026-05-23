"use client";

type FlightReviewTopNavProps = {
  title?: string;
};

export default function FlightReviewTopNav({
  title = "Complete your booking",
}: FlightReviewTopNavProps) {
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;

    const y = el.getBoundingClientRect().top + window.pageYOffset - 140;

    window.scrollTo({
      top: y,
      behavior: "smooth",
    });
  };

  return (
    <div
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
        <div
          style={{
            fontSize: "18px",
            fontWeight: 700,
            color: "#ffffff",
            whiteSpace: "nowrap",
          }}
        >
          {title}
        </div>

        <div
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
            style={navBtnStyle}
          >
            TRIP SUMMARY
          </button>

          <button
            onClick={() => scrollToSection("travel-insurance")}
            style={navBtnStyle}
          >
            TRAVEL INSURANCE
          </button>
          

          <button
            onClick={() => scrollToSection("traveller-detail")}
            style={navBtnStyle}
          >
            TRAVELLER DETAIL
          </button>

          

          <button
            onClick={() => scrollToSection("seat-meal")}
            style={navBtnStyle}
          >
            SEAT & MEAL
          </button>

          <button
            onClick={() => scrollToSection("cab")}
            style={navBtnStyle}
          >
            CAB
          </button>

          <button
            onClick={() => scrollToSection("addons")}
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