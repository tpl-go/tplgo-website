"use client";

import { useState } from "react";

type Props = {
  inclusions: string[];
  title?: string;
};

export default function CruiseInclusionsSection({
  inclusions,
  title = "Inclusions",
}: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section id="cruise-inclusions">
      <div
        style={sectionHeaderStyle}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <div style={leftHeaderWrapStyle}>
          <span style={headerDotStyle}>•</span>

          <h3
            style={{
              margin: 0,
              fontSize: "18px",
              fontWeight: 800,
              color: "#1f2937",
            }}
          >
            {title}
          </h3>
        </div>

        <span
          style={{
            fontSize: "18px",
            color: "#55a8d8",
            fontWeight: 700,
            transform: isOpen ? "rotate(0deg)" : "rotate(-90deg)",
            transition: "transform 0.2s ease",
          }}
        >
          ˅
        </span>
      </div>

      {isOpen && (
        <div
          style={{
            padding: "18px",
            background: "#ffffff",
            borderTop: "1px solid #e5e7eb",
          }}
        >
          {inclusions?.length ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "14px",
              }}
            >
              {inclusions.map((item, index) => (
                <div
                  key={`${item}-${index}`}
                  style={{
                    border: "1px solid #d9e2ec",
                    background: "#f8fbff",
                    padding: "14px 16px",
                    borderRadius: "10px",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "10px",
                  }}
                >
                  <span
                    style={{
                      width: "20px",
                      height: "20px",
                      borderRadius: "999px",
                      background: "#dcfce7",
                      color: "#16a34a",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "12px",
                      fontWeight: 800,
                      flexShrink: 0,
                      marginTop: "1px",
                    }}
                  >
                    ✓
                  </span>

                  <div
                    style={{
                      fontSize: "14px",
                      lineHeight: "22px",
                      color: "#374151",
                      fontWeight: 600,
                    }}
                  >
                    {item}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={emptyStateStyle}>
              Inclusions will be updated for this cruise booking.
            </div>
          )}
        </div>
      )}
    </section>
  );
}

const sectionHeaderStyle: React.CSSProperties = {
  minHeight: "58px",
  padding: "0 18px",
  borderTop: "1px solid #d9e2ec",
  borderBottom: "1px solid #d9e2ec",
  background: "#fffdf4",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "16px",
  cursor: "pointer",
};

const leftHeaderWrapStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "14px",
};

const headerDotStyle: React.CSSProperties = {
  width: "18px",
  height: "18px",
  borderRadius: "999px",
  background: "#e0f2fe",
  color: "#0284c7",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "14px",
  fontWeight: 800,
};

const emptyStateStyle: React.CSSProperties = {
  border: "1px solid #d9e2ec",
  background: "#f8fbff",
  padding: "16px",
  borderRadius: "10px",
  fontSize: "14px",
  color: "#4b5563",
  fontWeight: 500,
};