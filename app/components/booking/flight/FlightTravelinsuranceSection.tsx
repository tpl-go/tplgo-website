"use client";

import { useMemo, useState } from "react";

type InsuranceStatus = "pending" | "selected" | "skipped";

type InsurancePayload = {
  insuranceStatus: InsuranceStatus;
  insuranceLabel: string;
  insurancePrice: number;
};

type Props = {
  isEnabled: boolean;
  onChange?: (payload: InsurancePayload) => void;
};

const INSURANCE_PRICE_PER_TRAVELLER = 349;

export default function FlightTravelinsuranceSection({
  isEnabled,
  onChange,
}: Props) {
  const [isOpen, setIsOpen] = useState(true);
  const [selectedOption, setSelectedOption] = useState<"yes" | "no" | "pending">(
    "pending"
  );

  const insuranceStatus: InsuranceStatus = useMemo(() => {
    if (selectedOption === "yes") return "selected";
    if (selectedOption === "no") return "skipped";
    return "pending";
  }, [selectedOption]);

  const insurancePrice = selectedOption === "yes" ? INSURANCE_PRICE_PER_TRAVELLER : 0;

  const summaryText =
    insuranceStatus === "selected"
      ? `Trip Secure selected - ₹${insurancePrice.toLocaleString("en-IN")}`
      : insuranceStatus === "skipped"
      ? "Travel Insurance skipped"
      : "No travel insurance selected";

  const pushChange = (option: "yes" | "no" | "pending") => {
    const nextStatus: InsuranceStatus =
      option === "yes" ? "selected" : option === "no" ? "skipped" : "pending";

    const nextPrice = option === "yes" ? INSURANCE_PRICE_PER_TRAVELLER : 0;

    onChange?.({
      insuranceStatus: nextStatus,
      insuranceLabel:
        option === "yes"
          ? "Trip Secure selected"
          : option === "no"
          ? "Travel Insurance skipped"
          : "No travel insurance selected",
      insurancePrice: nextPrice,
    });
  };

  const handleSelect = (option: "yes" | "no") => {
    setSelectedOption(option);
    pushChange(option);
  };

  return (
    <section id="travel-insurance">
      <div
        className="max-md:px-3"
        style={sectionHeaderStyle}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <span
            style={{
              width: "18px",
              height: "18px",
              borderRadius: "999px",
              background: isEnabled ? "#22c55e" : "#d9534f",
              color: "#fff",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "12px",
              fontWeight: 800,
            }}
          >
            {isEnabled ? "✓" : "!"}
          </span>

          <h3
            style={{
              margin: 0,
              fontSize: "18px",
              fontWeight: 800,
              color: "#1f2937",
            }}
          >
            Travel Insurance
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
          style={{
            padding: "18px",
            background: "#ffffff",
            borderTop: "1px solid #e5e7eb",
          }}
        >
          {!isEnabled ? (
            <div style={lockedBoxStyle}>
              <div style={{ fontSize: "18px", fontWeight: 800, color: "#111827" }}>
                Travel Insurance locked
              </div>
              <div
                style={{
                  marginTop: "8px",
                  fontSize: "14px",
                  color: "#6b7280",
                  lineHeight: "22px",
                }}
              >
                Please complete Cab section first to continue with Travel Insurance.
              </div>
            </div>
          ) : (
            <div
              className="max-md:p-3"
              style={{
                border: "1px solid #d9e2ec",
                background: "#eef8ff",
                padding: "18px",
              }}
            >
              <div style={{ fontSize: "22px", fontWeight: 800, color: "#111827" }}>
                Trip Secure
              </div>

              <div
                className="max-md:text-[16px]"
                style={{
                  marginTop: "8px",
                  fontSize: "18px",
                  fontWeight: 800,
                  color: "#111827",
                }}
              >
                ₹349 <span style={{ fontSize: "14px", fontWeight: 600 }}>/ Traveller</span>
              </div>

              <div
                style={{
                  marginTop: "8px",
                  fontSize: "14px",
                  color: "#4b5563",
                  lineHeight: "22px",
                }}
              >
                {summaryText}
              </div>

              <div
                className="max-md:!grid-cols-1"
                style={{
                  marginTop: "16px",
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr 160px",
                  gap: "12px",
                }}
              >
                <BenefitCard title="24x7 Support" subtitle="Lost Baggage Assistance" />
                <BenefitCard title="Up to ₹5,500" subtitle="Missed Flight" />
                <BenefitCard title="Up to ₹4,000" subtitle="Trip Cancellation" />
                <div
                  style={{
                    border: "1px solid #d9e2ec",
                    background: "#ffffff",
                    minHeight: "74px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    color: "#0284c7",
                  }}
                >
                  View All Benefits →
                </div>
              </div>

              <div
                style={{
                  marginTop: "16px",
                  padding: "10px 12px",
                  background: "#f6fbff",
                  border: "1px solid #dbeafe",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#374151",
                }}
              >
                Recommended for your travel.
              </div>

              <div style={{ marginTop: "18px", display: "grid", gap: "10px" }}>
                <label style={radioRowStyle}>
                  <input
                    type="radio"
                    name="trip-secure"
                    checked={selectedOption === "yes"}
                    onChange={() => handleSelect("yes")}
                  />
                  <span>Yes, secure my trip.</span>
                </label>

                <label style={radioRowStyle}>
                  <input
                    type="radio"
                    name="trip-secure"
                    checked={selectedOption === "no"}
                    onChange={() => handleSelect("no")}
                  />
                  <span>No, I will book without trip secure.</span>
                </label>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function BenefitCard({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div
      style={{
        border: "1px solid #d9e2ec",
        background: "#ffffff",
        padding: "14px",
        minHeight: "74px",
      }}
    >
      <div style={{ fontSize: "16px", fontWeight: 700, color: "#111827" }}>
        {title}
      </div>
      <div style={{ marginTop: "4px", fontSize: "13px", color: "#4b5563" }}>
        {subtitle}
      </div>
    </div>
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

const lockedBoxStyle: React.CSSProperties = {
  border: "1px solid #f3d2d0",
  background: "#fff7f7",
  padding: "18px",
};

const radioRowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  fontSize: "15px",
  fontWeight: 600,
  color: "#111827",
};
