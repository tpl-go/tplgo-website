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
          Review package
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
          }}
        >
          <button
            onClick={() => scrollToSection("traveller-details")}
            style={{ background: "transparent", border: "none", color: "#ffffff", cursor: "pointer", fontWeight: 700 }}
          >
            1. TRAVELLER DETAILS
          </button>

          <button
            onClick={() => scrollToSection("package-addons")}
            style={{ background: "transparent", border: "none", color: "#ffffff", cursor: "pointer", fontWeight: 700 }}
          >
            2. PACKAGE ADD-ONS
          </button>

          <button
            onClick={() => scrollToSection("package-itinerary")}
            style={{ background: "transparent", border: "none", color: "#ffffff", cursor: "pointer", fontWeight: 700 }}
          >
            3. PACKAGE ITINERARY & INCLUSIONS
          </button>

          <button
            onClick={() => scrollToSection("cancellation-policy")}
            style={{ background: "transparent", border: "none", color: "#ffffff", cursor: "pointer", fontWeight: 700 }}
          >
            4. CANCELLATION & DATE CHANGE
          </button>
        </div>
      </div>
    </div>
  );
}