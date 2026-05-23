"use client";

type CruiseBookingTopNavProps = {
  title?: string;
};

export default function CruiseBookingTopNav({
  title = "Complete your cruise booking",
}: CruiseBookingTopNavProps) {
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
            type="button"
            onClick={() => scrollToSection("trip-summary")}
            style={navBtnStyle}
          >
            SUMMARY
          </button>

          <button
            type="button"
            onClick={() => scrollToSection("traveller-detail")}
            style={navBtnStyle}
          >
            TRAVELLER DETAIL
          </button>

          <button
            type="button"
            onClick={() => scrollToSection("inclusions-section")}
            style={navBtnStyle}
          >
            INCLUSIONS
          </button>

          <button
            type="button"
            onClick={() => scrollToSection("policies-section")}
            style={navBtnStyle}
          >
            CRUISE POLICIES
          </button>

          <button
            type="button"
            onClick={() => scrollToSection("additional-info")}
            style={navBtnStyle}
          >
            ADDITIONAL INFORMATION
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