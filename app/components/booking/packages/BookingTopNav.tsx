"use client";

export default function BookingTopNav() {
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
      className="booking-package-topnav"
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
        className="booking-package-topnav__inner"
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
          className="booking-package-topnav__title"
          style={{
            fontSize: "18px",
            fontWeight: 700,
            color: "#ffffff",
            whiteSpace: "nowrap",
          }}
        >
          Review package
        </div>

        <div
          className="booking-package-topnav__steps"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "24px",
            fontSize: "12px",
            fontWeight: 700,
            color: "#ffffff",
            whiteSpace: "nowrap",
          }}
        >
          <button
            className="booking-package-topnav__chip"
            onClick={() => scrollToSection("traveller-details")}
            style={{ background: "transparent", border: "none", color: "#ffffff", cursor: "pointer", fontWeight: 700 }}
          >
            1. TRAVELLER DETAILS
          </button>

          <button
            className="booking-package-topnav__chip"
            onClick={() => scrollToSection("package-addons")}
            style={{ background: "transparent", border: "none", color: "#ffffff", cursor: "pointer", fontWeight: 700 }}
          >
            2. PACKAGE ADD-ONS
          </button>

          <button
            className="booking-package-topnav__chip"
            onClick={() => scrollToSection("package-itinerary")}
            style={{ background: "transparent", border: "none", color: "#ffffff", cursor: "pointer", fontWeight: 700 }}
          >
            3. PACKAGE ITINERARY & INCLUSIONS
          </button>

          <button
            className="booking-package-topnav__chip"
            onClick={() => scrollToSection("cancellation-policy")}
            style={{ background: "transparent", border: "none", color: "#ffffff", cursor: "pointer", fontWeight: 700 }}
          >
            4. CANCELLATION & DATE CHANGE
          </button>
        </div>
      </div>
      <style>{`
        @media (max-width: 1023px) {
          .booking-package-topnav {
            min-height: auto !important;
          }

          .booking-package-topnav__inner {
            display: block !important;
            padding: 10px 12px !important;
          }

          .booking-package-topnav__title {
            margin-bottom: 8px !important;
            font-size: 15px !important;
          }

          .booking-package-topnav__steps {
            display: flex !important;
            gap: 8px !important;
            overflow-x: auto !important;
            padding-bottom: 2px !important;
            white-space: nowrap !important;
            scrollbar-width: none;
          }

          .booking-package-topnav__steps::-webkit-scrollbar {
            display: none;
          }

          .booking-package-topnav__chip {
            flex: 0 0 auto;
            border: 1px solid rgba(255, 255, 255, 0.18) !important;
            border-radius: 999px !important;
            background: rgba(255, 255, 255, 0.08) !important;
            padding: 8px 12px !important;
            font-size: 11px !important;
          }
        }
      `}</style>
    </div>
  );
}
