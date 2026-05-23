"use client";

type Props = {
  duration: string;
  airport: string;
  code: string;
  variant?: "full" | "compact";
};

export default function FlightLayoverBlock({
  duration,
  airport,
  code,
  variant = "full",
}: Props) {
  if (variant === "compact") {
    return (
      <div
        style={{
          fontSize: "11px",
          fontWeight: 600,
          color: "#7c5a5a",
          background: "#f8fafc",
          border: "1px dashed #cbd5e1",
          borderRadius: "8px",
          padding: "6px 10px",
          whiteSpace: "nowrap",
        }}
      >
        Layover {duration} in {airport} ({code})
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "10px 14px",
        borderTop: "1px solid #eceff3",
        borderBottom: "1px solid #eceff3",
        background: "#fffdf8",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: "10px",
        }}
      >
        <div
          style={{
            width: "14px",
            display: "flex",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: "2px",
              minHeight: "34px",
              borderLeft: "2px dashed #9ca3af",
            }}
          />
        </div>

        <div>
          <div
            style={{
              fontSize: "12px",
              fontWeight: 700,
              color: "#7c5a5a",
            }}
          >
            Change of planes
          </div>

          <div
            style={{
              marginTop: "2px",
              fontSize: "12px",
              color: "#111827",
              fontWeight: 500,
            }}
          >
            {duration} Layover in {airport}
            {code ? ` (${code})` : ""}
          </div>
        </div>
      </div>
    </div>
  );
}