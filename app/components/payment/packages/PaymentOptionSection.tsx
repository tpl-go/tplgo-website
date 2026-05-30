"use client";

import { useState } from "react";

const QR_DARK_CELLS = new Set([
  0, 1, 2, 3, 4, 7, 11, 14, 18, 21, 22, 23, 24, 25, 28, 30, 32, 34, 36, 38,
  40, 42, 43, 44, 45, 46, 48,
]);

type PaymentOptionKey = "upi" | "qr" | "cards" | "emi" | "netbanking";

type PaymentOptionSectionProps = {
  defaultOption?: PaymentOptionKey | null;
  payableAmount?: number;
  onPaymentMethodChange?: (method: string) => void;
};

export default function PaymentOptionSection({
  defaultOption = null,
  payableAmount = 0,
  onPaymentMethodChange,
}: PaymentOptionSectionProps) {
  const [activeOption, setActiveOption] =
    useState<PaymentOptionKey | null>(defaultOption);
  const [selectedUpiMethod, setSelectedUpiMethod] = useState<string>("");

  return (
    <section className="overflow-hidden rounded-2xl border border-[#d9e2ec] bg-white shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
      <div className="border-b border-[#e5e7eb] px-4 py-4 text-[22px] font-extrabold text-[#111827] sm:px-5 sm:py-[18px] sm:text-[26px]">
        Payment Options
      </div>

      <PaymentRow
        icon="IN"
        title="UPI Options"
        subtitle="Pay directly from your bank account"
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
        icon="QR"
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
                    QR_DARK_CELLS.has(index) ? "bg-[#0f172a]" : "bg-[#e2e8f0]"
                  }`}
                />
              ))}
            </div>

            <div className="min-w-0 flex-1 rounded-2xl bg-[#f8fbff] p-4">
              <div className="text-[13px] font-extrabold text-[#111827]">
                Amount: ₹{Math.round(payableAmount || 0).toLocaleString("en-IN")}
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
        icon="CARD"
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

          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
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
            <input placeholder="Enter card holder name" style={inputStyle} />
          </div>
        </ExpandedBox>
      )}

      <PaymentRow
        icon="EMI"
        title="EMI"
        subtitle="Coming soon"
        badge="COMING SOON"
        disabled
      />

      <PaymentRow
        icon="BANK"
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
      className={`flex items-center justify-between gap-3 border-b border-[#e5e7eb] px-4 py-4 transition sm:gap-4 sm:px-5 sm:py-[18px] ${
        disabled ? "cursor-not-allowed bg-[#f8fafc] opacity-[0.68]" : "cursor-pointer"
      } ${isActive && !disabled ? "bg-[#f8fbff] shadow-[inset_0_0_0_1.5px_#7dd3fc]" : "bg-white"}`}
    >
      <div className="flex min-w-0 items-center gap-3 sm:gap-3.5">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] text-[11px] font-black sm:h-[42px] sm:w-[42px] ${
            disabled ? "bg-[#e5e7eb]" : isActive ? "bg-[#dff2ff]" : "bg-[#eef6ff]"
          }`}
        >
          {icon}
        </div>

        <div className="min-w-0">
          <div
            className={`break-words text-[15px] font-extrabold sm:text-[16px] ${
              isActive ? "text-[#0f172a]" : "text-[#111827]"
            }`}
          >
            {title}
          </div>

          <div
            className={`mt-0.5 break-words text-[12px] font-medium leading-[18px] sm:text-[13px] ${
              isActive ? "text-[#475569]" : "text-[#6b7280]"
            }`}
          >
            {subtitle}
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        {badge ? (
          <span className="rounded-full bg-[#ccfbf1] px-2 py-1 text-[10px] font-extrabold text-[#0f766e] sm:text-[11px]">
            {badge}
          </span>
        ) : null}

        <span
          className={`text-[18px] font-extrabold ${
            disabled ? "text-[#94a3b8]" : isActive ? "text-[#0ea5e9]" : "text-[#60a5fa]"
          }`}
        >
          {disabled ? "x" : "›"}
        </span>
      </div>
    </div>
  );
}

function ExpandedBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-b border-[#e5e7eb] bg-white px-4 py-4 sm:px-5 sm:py-5 lg:pl-[76px]">
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
  gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
  gap: "12px",
  marginTop: "14px",
};
