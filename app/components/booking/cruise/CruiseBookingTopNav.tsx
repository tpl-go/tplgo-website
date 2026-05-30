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
    <>
      <div className="lg:hidden bg-[#111827] px-3 py-3 text-white">
        <div className="text-[15px] font-extrabold leading-tight">{title}</div>

        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {[
            ["Summary", "trip-summary"],
            ["Traveller", "traveller-detail"],
            ["Inclusions", "inclusions-section"],
            ["Policies", "policies-section"],
            ["Info", "additional-info"],
          ].map(([label, id]) => (
            <button
              key={id}
              type="button"
              onClick={() => scrollToSection(id)}
              className="h-9 shrink-0 rounded-full border border-white/15 bg-white/10 px-3 text-[12px] font-extrabold text-white"
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div
        className="hidden lg:flex"
        style={{
          width: "100%",
          background: "#111827",
          color: "#ffffff",
          minHeight: "56px",
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
    </>
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
