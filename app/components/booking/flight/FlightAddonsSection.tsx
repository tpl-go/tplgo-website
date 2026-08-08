"use client";

import { useEffect, useState } from "react";

type AddonStatus = "pending" | "selected" | "skipped";

type AddonsPayload = {
  addonsStatus: AddonStatus;
  addonsLabel: string;
  addonsPrice: number;
  selectedItems: string[];
};

type Props = {
  isEnabled: boolean;
  onChange?: (payload: AddonsPayload) => void;
};

const EMPTY_ADDONS_PAYLOAD: AddonsPayload = {
  addonsStatus: "skipped",
  addonsLabel: "Add-ons not available",
  addonsPrice: 0,
  selectedItems: [],
};

export default function FlightAddonsSection({ isEnabled, onChange }: Props) {
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    onChange?.(EMPTY_ADDONS_PAYLOAD);
  }, [onChange]);

  return (
    <section id="addons">
      <div
        className="max-md:px-3"
        style={sectionHeaderStyle}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <span style={statusDotStyle}>i</span>

          <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 800, color: "#1f2937" }}>
            Addons
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
          className="max-md:p-3"
          style={{ padding: "18px", background: "#ffffff", borderTop: "1px solid #e5e7eb" }}
        >
          <div style={cardStyle}>
            <div style={{ fontSize: "18px", fontWeight: 800, color: "#111827" }}>
              Add-ons not available for this fare
            </div>
            <div style={bodyCopyStyle}>
              Extra baggage, priority services, flexibility, and assistance products will be
              offered only after backend quote support is available. No add-on price has
              been added to your total.
            </div>
          </div>
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

const statusDotStyle: React.CSSProperties = {
  width: "18px",
  height: "18px",
  borderRadius: "999px",
  background: "#94a3b8",
  color: "#fff",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "12px",
  fontWeight: 900,
  fontFamily: "Arial, sans-serif",
};

const cardStyle: React.CSSProperties = {
  border: "1px solid #d9e2ec",
  background: "#f8fbff",
  padding: "18px",
};

const bodyCopyStyle: React.CSSProperties = {
  marginTop: "8px",
  fontSize: "14px",
  color: "#4b5563",
  lineHeight: "22px",
};
