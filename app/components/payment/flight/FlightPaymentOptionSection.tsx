"use client";

import { useState } from "react";

type PaymentOptionKey =
  | "upi"
  | "cards"
  | "emi"
  | "netbanking"
  | "paylater"
  | "wallets";

type Props = {
  defaultOption?: PaymentOptionKey | null;
  onPaymentMethodChange?: (method: string) => void;
};

export default function FlightPaymentOptionSection({
  defaultOption = null,
  onPaymentMethodChange,
}: Props) {
  const [activeOption, setActiveOption] =
    useState<PaymentOptionKey | null>(defaultOption);

  const [selectedUpiMethod, setSelectedUpiMethod] = useState<string>("");
  const [selectedEmiPlan, setSelectedEmiPlan] = useState<string>("");
  const [selectedPayLater, setSelectedPayLater] = useState<string>("");

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
          padding: "18px 20px",
          borderBottom: "1px solid #e5e7eb",
          fontSize: "26px",
          fontWeight: 800,
          color: "#111827",
        }}
      >
        Payment Options
      </div>

      <PaymentRow
        icon="🇮🇳"
        title="UPI Options"
        subtitle="Pay Directly From Your Bank Account"
        isActive={activeOption === "upi"}
        onClick={() => {
          setActiveOption((prev) => (prev === "upi" ? null : "upi"));
          onPaymentMethodChange?.("upi");
        }}
      />

      {activeOption === "upi" && (
        <ExpandedBox>
          <div style={expandedTitleStyle}>Choose UPI Method</div>

          <div style={gridStyle}>
            {["Google Pay", "PhonePe", "Paytm", "BHIM UPI"].map((item) => (
              <SelectableMiniCard
                key={item}
                label={item}
                isSelected={selectedUpiMethod === item}
                onClick={() => setSelectedUpiMethod(item)}
              />
            ))}
          </div>

          <div style={{ marginTop: "18px" }}>
            <label style={fieldLabelStyle}>Enter UPI ID</label>
            <input placeholder="example@upi" style={inputStyle} />
          </div>
        </ExpandedBox>
      )}

      <PaymentRow
        icon="💳"
        title="Credit & Debit Cards"
        subtitle="Visa, Mastercard, Amex, Rupay and more"
        isActive={activeOption === "cards"}
        onClick={() => {
          setActiveOption((prev) => (prev === "cards" ? null : "cards"));
          onPaymentMethodChange?.("cards");
        }}
      />

      {activeOption === "cards" && (
        <ExpandedBox>
          <div style={expandedTitleStyle}>Card Details</div>

          <div style={{ marginTop: "16px" }}>
            <label style={fieldLabelStyle}>Card Number</label>
            <input placeholder="1234 5678 9012 3456" style={inputStyle} />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "14px",
              marginTop: "14px",
            }}
          >
            <div>
              <label style={fieldLabelStyle}>Expiry</label>
              <input placeholder="MM/YY" style={inputStyle} />
            </div>

            <div>
              <label style={fieldLabelStyle}>CVV</label>
              <input placeholder="123" style={inputStyle} />
            </div>
          </div>

          <div style={{ marginTop: "14px" }}>
            <label style={fieldLabelStyle}>Name on Card</label>
            <input
              placeholder="Enter card holder name"
              style={inputStyle}
            />
          </div>
        </ExpandedBox>
      )}

      <PaymentRow
        icon="🧾"
        title="EMI"
        subtitle="Credit/Debit Card & Cardless EMI available"
        badge="NO COST EMI"
        isActive={activeOption === "emi"}
        onClick={() => {
          setActiveOption((prev) => (prev === "emi" ? null : "emi"));
          onPaymentMethodChange?.("emi");
        }}
      />

      {activeOption === "emi" && (
        <ExpandedBox>
          <div style={expandedTitleStyle}>Choose EMI Option</div>

          <div style={gridStyle}>
            {["3 Months", "6 Months", "9 Months", "12 Months"].map((item) => (
              <SelectableMiniCard
                key={item}
                label={item}
                isSelected={selectedEmiPlan === item}
                onClick={() => setSelectedEmiPlan(item)}
              />
            ))}
          </div>
        </ExpandedBox>
      )}

      <PaymentRow
        icon="🏦"
        title="Net Banking"
        subtitle="40+ Banks Available"
        isActive={activeOption === "netbanking"}
        onClick={() => {
          setActiveOption((prev) =>
            prev === "netbanking" ? null : "netbanking"
          );
          onPaymentMethodChange?.("netbanking");
        }}
      />

      {activeOption === "netbanking" && (
        <ExpandedBox>
          <div style={expandedTitleStyle}>Select Your Bank</div>

          <select style={{ ...inputStyle, marginTop: "14px" }}>
            <option>Select Bank</option>
            <option>HDFC Bank</option>
            <option>ICICI Bank</option>
            <option>SBI</option>
            <option>Axis Bank</option>
          </select>
        </ExpandedBox>
      )}

      <PaymentRow
        icon="⏳"
        title="Pay Later"
        subtitle="LazyPay, Amazon"
        isActive={activeOption === "paylater"}
        onClick={() => {
          setActiveOption((prev) => (prev === "paylater" ? null : "paylater"));
          onPaymentMethodChange?.("paylater");
        }}
      />

      {activeOption === "paylater" && (
        <ExpandedBox>
          <div style={expandedTitleStyle}>Available Pay Later Options</div>

          <div style={gridStyle}>
            {["LazyPay", "Amazon Pay Later"].map((item) => (
              <SelectableMiniCard
                key={item}
                label={item}
                isSelected={selectedPayLater === item}
                onClick={() => setSelectedPayLater(item)}
              />
            ))}
          </div>
        </ExpandedBox>
      )}

      <PaymentRow
        icon="🎁"
        title="Gift Cards & e-wallets"
        subtitle="Gift cards & Amazon Pay"
        isActive={activeOption === "wallets"}
        onClick={() => {
          setActiveOption((prev) => (prev === "wallets" ? null : "wallets"));
          onPaymentMethodChange?.("wallets");
        }}
      />

      {activeOption === "wallets" && (
        <ExpandedBox>
          <div style={expandedTitleStyle}>Wallet / Gift Card</div>

          <div style={{ marginTop: "14px" }}>
            <label style={fieldLabelStyle}>Enter Code</label>
            <input
              placeholder="Enter wallet or gift card code"
              style={inputStyle}
            />
          </div>
        </ExpandedBox>
      )}
    </section>
  );
}

function PaymentRow({
  icon,
  title,
  subtitle,
  badge,
  isActive,
  onClick,
}: {
  icon: string;
  title: string;
  subtitle: string;
  badge?: string;
  isActive?: boolean;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: "18px 20px",
        borderBottom: "1px solid #e5e7eb",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "14px",
        cursor: "pointer",
        background: isActive ? "#f8fbff" : "#ffffff",
        boxShadow: isActive ? "inset 0 0 0 1.5px #7dd3fc" : "none",
        transition: "all 0.2s ease",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "14px",
          minWidth: 0,
        }}
      >
        <div
          style={{
            width: "42px",
            height: "42px",
            borderRadius: "10px",
            background: isActive ? "#dff2ff" : "#eef6ff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "20px",
            flexShrink: 0,
          }}
        >
          {icon}
        </div>

        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: "16px",
              fontWeight: 800,
              color: isActive ? "#0f172a" : "#111827",
            }}
          >
            {title}
          </div>

          <div
            style={{
              marginTop: "3px",
              fontSize: "13px",
              color: isActive ? "#475569" : "#6b7280",
              lineHeight: "18px",
            }}
          >
            {subtitle}
          </div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          flexShrink: 0,
        }}
      >
        {badge ? (
          <span
            style={{
              background: "#ccfbf1",
              color: "#0f766e",
              fontSize: "11px",
              fontWeight: 800,
              padding: "5px 8px",
              borderRadius: "999px",
            }}
          >
            {badge}
          </span>
        ) : null}

        <span
          style={{
            fontSize: "18px",
            color: isActive ? "#0ea5e9" : "#60a5fa",
            fontWeight: 800,
          }}
        >
          ›
        </span>
      </div>
    </div>
  );
}

function ExpandedBox({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        padding: "18px 20px 20px 76px",
        borderBottom: "1px solid #e5e7eb",
        background: "#ffffff",
      }}
    >
      {children}
    </div>
  );
}

function SelectableMiniCard({
  label,
  isSelected,
  onClick,
}: {
  label: string;
  isSelected?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      style={{
        minHeight: "46px",
        border: isSelected ? "1.5px solid #7dd3fc" : "1px solid #d1d5db",
        borderRadius: "10px",
        background: isSelected ? "#f8fbff" : "#ffffff",
        padding: "10px 14px",
        fontSize: "14px",
        fontWeight: 700,
        color: isSelected ? "#0f172a" : "#1f2937",
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );
}

const expandedTitleStyle: React.CSSProperties = {
  fontSize: "15px",
  fontWeight: 800,
  color: "#111827",
};

const fieldLabelStyle: React.CSSProperties = {
  display: "block",
  marginBottom: "8px",
  fontSize: "13px",
  fontWeight: 700,
  color: "#374151",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  height: "46px",
  border: "1px solid #d1d5db",
  borderRadius: "10px",
  padding: "0 14px",
  fontSize: "14px",
  color: "#111827",
  outline: "none",
  background: "#ffffff",
};

const gridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: "12px",
  marginTop: "14px",
};