"use client";

import { useState } from "react";

type PolicyItem = {
  id?: string;
  title: string;
  description: string;
};

type Props = {
  policies?: PolicyItem[];
  title?: string;
  defaultOpen?: boolean;
};

export default function CruisePoliciesSection({
  policies = [],
  title = "Cruise Policies",
  defaultOpen = false,
}: Props) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <section id="cruise-policies">
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
          {policies?.length ? (
            <div style={{ display: "grid", gap: "14px" }}>
              {policies.map((policy, index) => (
                <div
                  key={policy.id || `${policy.title}-${index}`}
                  style={{
                    border: "1px solid #d9e2ec",
                    background: "#ffffff",
                    borderRadius: "10px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      padding: "14px 16px",
                      background: "#f8fbff",
                      borderBottom: "1px solid #e5e7eb",
                      fontSize: "15px",
                      fontWeight: 800,
                      color: "#111827",
                    }}
                  >
                    {policy.title}
                  </div>

                  <div
                    style={{
                      padding: "14px 16px",
                      fontSize: "14px",
                      lineHeight: "22px",
                      color: "#4b5563",
                      fontWeight: 500,
                    }}
                  >
                    {policy.description}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={emptyStateStyle}>
              Cruise policies will be updated for this booking.
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
