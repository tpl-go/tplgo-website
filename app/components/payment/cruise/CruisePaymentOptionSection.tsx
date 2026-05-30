"use client";

import { useState } from "react";

const QR_DARK_CELLS = new Set([
  0, 1, 2, 3, 4, 7, 11, 14, 18, 21, 22, 23, 24, 25, 28, 30, 32, 34, 36, 38,
  40, 42, 43, 44, 45, 46, 48,
]);

type PaymentOptionKey =
  | "upi"
  | "qr"
  | "cards"
  | "emi"
  | "netbanking";

type Props = {
  defaultOption?: PaymentOptionKey | null;
  payableAmount?: number;
  onPaymentMethodChange?: (method: string) => void;
};

export default function CruisePaymentOptionSection({
  defaultOption = null,
  payableAmount = 0,
  onPaymentMethodChange,
}: Props) {
  const [activeOption, setActiveOption] =
    useState<PaymentOptionKey | null>(defaultOption);

  const [selectedUpiMethod, setSelectedUpiMethod] = useState<string>("");

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
        icon="▦"
        title="QR Payment"
        subtitle="Scan and pay using any UPI app"
        badge="UPI QR"
        isActive={activeOption === "qr"}
        onClick={() => {
          setActiveOption((prev) => (prev === "qr" ? null : "qr"));
          onPaymentMethodChange?.("qr");
        }}
      />

      {activeOption === "qr" && (
        <ExpandedBox>
          <div style={expandedTitleStyle}>Scan QR using any UPI app</div>

          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="mx-auto grid h-[168px] w-[168px] shrink-0 grid-cols-7 gap-1 rounded-2xl border border-[#d9e2ec] bg-white p-3 shadow-sm sm:mx-0">
              {Array.from({ length: 49 }).map((_, index) => (
                <span
                  key={index}
                  className={`rounded-[2px] ${
                    QR_DARK_CELLS.has(index)
                      ? "bg-[#0f172a]"
                      : "bg-[#e2e8f0]"
                  }`}
                />
              ))}
            </div>

            <div className="min-w-0 flex-1 rounded-2xl bg-[#f8fbff] p-4">
              <div className="text-[13px] font-extrabold text-[#111827]">
                Amount: ₹
                {Math.round(payableAmount || 0).toLocaleString("en-IN")}
              </div>
              <div className="mt-2 text-[12px] font-semibold leading-5 text-[#475569]">
                After payment, click Confirm Payment. This is a QR placeholder
                for the current booking amount; gateway verification is not
                integrated yet.
              </div>
            </div>
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
        subtitle="Coming soon"
        badge="COMING SOON"
        disabled
      />

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

    </section>
  );
}

function PaymentRow({
  icon,
  title,
  subtitle,
  badge,
  isActive,
  disabled = false,
  onClick,
}: {
  icon: string;
  title: string;
  subtitle: string;
  badge?: string;
  isActive?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={disabled ? undefined : onClick}
      aria-disabled={disabled}
      style={{
        padding: "18px 20px",
        borderBottom: "1px solid #e5e7eb",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "14px",
        cursor: disabled ? "not-allowed" : "pointer",
        background: disabled ? "#f8fafc" : isActive ? "#f8fbff" : "#ffffff",
        boxShadow: isActive ? "inset 0 0 0 1.5px #7dd3fc" : "none",
        opacity: disabled ? 0.68 : 1,
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
            background: disabled ? "#e5e7eb" : isActive ? "#dff2ff" : "#eef6ff",
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
            color: disabled ? "#94a3b8" : isActive ? "#0ea5e9" : "#60a5fa",
            fontWeight: 800,
          }}
        >
          {disabled ? "×" : "›"}
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
        padding: "18px clamp(14px, 4vw, 20px) 20px clamp(14px, 4vw, 76px)",
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
