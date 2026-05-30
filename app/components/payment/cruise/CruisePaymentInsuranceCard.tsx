"use client";

import { useEffect, useMemo, useState } from "react";

type Props = {
  totalTravellers?: number;
  defaultSelected?: boolean;
  pricePerTraveller?: number;
  onSelectionChange?: (payload: {
    selected: boolean;
    totalInsuranceAmount: number;
  }) => void;
};

export default function CruisePaymentInsuranceCard({
  totalTravellers = 1,
  defaultSelected = false,
  pricePerTraveller = 349,
  onSelectionChange,
}: Props) {
  const [selected, setSelected] = useState(defaultSelected);

  const totalInsuranceAmount = useMemo(() => {
    return totalTravellers * pricePerTraveller;
  }, [totalTravellers, pricePerTraveller]);

  useEffect(() => {
    onSelectionChange?.({
      selected,
      totalInsuranceAmount: selected ? totalInsuranceAmount : 0,
    });
  }, [selected, totalInsuranceAmount, onSelectionChange]);

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
        className="cruise-payment-insurance-body"
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
          Recommended Protection
        </div>

        <div
          style={{
            fontSize: "18px",
            fontWeight: 800,
            color: "#111827",
          }}
        >
          Cruise Travel Insurance
        </div>

        <div
          style={{
            marginTop: "6px",
            fontSize: "14px",
            color: "#4b5563",
            lineHeight: "21px",
          }}
        >
          Protect your sailing with trip cancellation cover, medical support,
          baggage assistance and travel disruption benefits.
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
              per traveller
            </div>

            <div
              style={{
                marginTop: "2px",
                fontSize: "18px",
                fontWeight: 800,
                color: "#111827",
              }}
            >
              ₹{pricePerTraveller.toLocaleString("en-IN")}
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
          type="button"
          onClick={() => setSelected((prev) => !prev)}
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
            : `ADD @ ₹${pricePerTraveller.toLocaleString("en-IN")}`}
        </button>
      </div>
      <style jsx>{`
        @media (max-width: 767px) {
          .cruise-payment-insurance-body {
            align-items: stretch !important;
            flex-direction: column !important;
          }

          .cruise-payment-insurance-body button {
            width: 100% !important;
          }
        }
      `}</style>
    </section>
  );
}
