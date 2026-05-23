"use client";

import { useMemo, useState } from "react";

type PaymentInsuranceCardProps = {
  title?: string;
  description?: string;
  coverageText?: string;
  pricePerPerson?: number;
  totalTravellers?: number;
  defaultSelected?: boolean;
  onSelectionChange?: (payload: {
    selected: boolean;
    totalInsuranceAmount: number;
  }) => void;
};

export default function PaymentInsuranceCard({
  title = "Travel Insurance",
  description = "One Plan, Many Benefits",
  coverageText = "All inclusive cover with coverage upto Rs.5,00,000 for accident, Rs.1,500 for trip delay, Rs.10,000 for trip cancellation and more.",
  pricePerPerson = 636,
  totalTravellers = 2,
  defaultSelected = false,
  onSelectionChange,
}: PaymentInsuranceCardProps) {
  const [selected, setSelected] = useState(defaultSelected);

  const totalInsuranceAmount = useMemo(() => {
    return pricePerPerson * totalTravellers;
  }, [pricePerPerson, totalTravellers]);

  const handleToggle = () => {
    const next = !selected;
    setSelected(next);
    onSelectionChange?.({
      selected: next,
      totalInsuranceAmount: next ? totalInsuranceAmount : 0,
    });
  };

  return (
    <section
      style={{
        border: "1px solid #d9e2ec",
        background: "#ffffff",
        borderRadius: "16px",
        overflow: "hidden",
        boxShadow: "0 2px 8px rgba(15,23,42,0.04)",
      }}
    >
      <div
        style={{
          padding: "16px 18px 14px 18px",
          background: "#f7fcff",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        <div
          style={{
            display: "inline-block",
            background: "#dff6ff",
            color: "#0891b2",
            fontSize: "12px",
            fontWeight: 800,
            padding: "4px 8px",
            borderRadius: "999px",
            marginBottom: "10px",
          }}
        >
          {description}
        </div>

        <div
          style={{
            fontSize: "18px",
            fontWeight: 800,
            color: "#111827",
          }}
        >
          {title}
        </div>

        <div
          style={{
            marginTop: "6px",
            fontSize: "14px",
            color: "#4b5563",
            lineHeight: "21px",
          }}
        >
          {coverageText}{" "}
          <span
            style={{
              color: "#1d9bf0",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            (View T&amp;C)
          </span>
        </div>
      </div>

      <div
        style={{
          padding: "16px 18px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "16px",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: "#eef6ff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px",
            }}
          >
            🛡️
          </div>

          <div>
            <div
              style={{
                fontSize: "13px",
                color: "#6b7280",
                fontWeight: 600,
              }}
            >
              per person
            </div>

            <div
              style={{
                marginTop: "2px",
                fontSize: "18px",
                fontWeight: 800,
                color: "#111827",
              }}
            >
              ₹{pricePerPerson.toLocaleString("en-IN")}
            </div>

            <div
              style={{
                marginTop: "4px",
                fontSize: "13px",
                color: "#4b5563",
                fontWeight: 500,
              }}
            >
              Total for {totalTravellers} traveller(s): ₹
              {totalInsuranceAmount.toLocaleString("en-IN")}
            </div>
          </div>
        </div>

        <button
          onClick={handleToggle}
          style={{
            minWidth: "140px",
            height: "44px",
            border: selected ? "1px solid #ef4444" : "1px solid #1d9bf0",
            borderRadius: "999px",
            background: selected ? "#fff1f2" : "#1d9bf0",
            color: selected ? "#ef4444" : "#ffffff",
            fontSize: "14px",
            fontWeight: 800,
            cursor: "pointer",
            padding: "0 18px",
          }}
        >
          {selected
            ? `REMOVE ₹${totalInsuranceAmount.toLocaleString("en-IN")}`
            : `ADD @ ₹${pricePerPerson.toLocaleString("en-IN")}`}
        </button>
      </div>
    </section>
  );
}