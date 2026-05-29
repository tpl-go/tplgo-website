"use client";

import { useMemo, useState } from "react";

type CabType = "airport" | "outstation" | "none";
type CabStatus = "pending" | "selected" | "skipped";

type CabPayload = {
  cabType: CabType;
  cabStatus: CabStatus;
  cabLabel: string;
  cabPrice: number;
};

type Props = {
  isEnabled: boolean;
  onChange?: (payload: CabPayload) => void;
};

type CabOption = {
  key: CabType;
  title: string;
  subtitle: string;
  price: number;
};

const CAB_OPTIONS: CabOption[] = [
  {
    key: "airport",
    title: "Airport Transfer",
    subtitle: "Reliable pickup/drop for airport travel.",
    price: 899,
  },
  {
    key: "outstation",
    title: "Outstation Cab",
    subtitle: "Pre-book a city/outstation ride with fixed fare.",
    price: 2499,
  },
];

export default function FlightCabSection({
  isEnabled,
  onChange,
}: Props) {
  const [isOpen, setIsOpen] = useState(true);
  const [showCabModal, setShowCabModal] = useState(false);

  const [selectedCab, setSelectedCab] = useState<CabType>("none");
  const [cabStatus, setCabStatus] = useState<CabStatus>("pending");

  const selectedCabOption = useMemo(() => {
    return CAB_OPTIONS.find((item) => item.key === selectedCab) || null;
  }, [selectedCab]);

  const summaryText =
    cabStatus === "selected" && selectedCabOption
      ? `${selectedCabOption.title} selected`
      : cabStatus === "skipped"
      ? "Cab skipped"
      : "No cab selected";

  const pushChange = (
    nextType: CabType,
    nextStatus: CabStatus
  ) => {
    const option = CAB_OPTIONS.find((item) => item.key === nextType) || null;

    onChange?.({
      cabType: nextType,
      cabStatus: nextStatus,
      cabLabel:
        nextStatus === "skipped"
          ? "Cab skipped"
          : option?.title || "No cab selected",
      cabPrice: nextStatus === "selected" && option ? option.price : 0,
    });
  };

  const handleSelectCab = (cabType: CabType) => {
    if (cabType === "none") {
      setSelectedCab("none");
      setCabStatus("skipped");
      pushChange("none", "skipped");
      setShowCabModal(false);
      return;
    }

    setSelectedCab(cabType);
    setCabStatus("selected");
    pushChange(cabType, "selected");
    setShowCabModal(false);
  };

  return (
    <>
      <section id="cab">
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
              Cab
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
                  Cab locked
                </div>
                <div
                  style={{
                    marginTop: "8px",
                    fontSize: "14px",
                    color: "#6b7280",
                    lineHeight: "22px",
                  }}
                >
                  Please complete Seat & Meal first to continue with cab selection.
                </div>
              </div>
            ) : (
              <div style={cardStyle}>
                <div style={{ fontSize: "18px", fontWeight: 800, color: "#111827" }}>
                  Travel with comfort
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
                    marginTop: "14px",
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: "14px",
                  }}
                >
                  <CabCard
                    title="Airport Transfer"
                    subtitle="Reliable pickup/drop for airport travel."
                    price={899}
                    active={selectedCab === "airport" && cabStatus === "selected"}
                    onClick={() => setShowCabModal(true)}
                  />

                  <CabCard
                    title="Outstation Cab"
                    subtitle="Pre-book a city/outstation ride with fixed fare."
                    price={2499}
                    active={selectedCab === "outstation" && cabStatus === "selected"}
                    onClick={() => setShowCabModal(true)}
                  />

                  <CabCard
                    title="No Cab Needed"
                    subtitle="Skip cab booking for this trip."
                    price={0}
                    active={cabStatus === "skipped"}
                    onClick={() => handleSelectCab("none")}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {showCabModal && (
        <ModalOverlay onClose={() => setShowCabModal(false)}>
          <div className="max-md:!w-full max-md:rounded-xl" style={cabModalStyle}>
            <div style={modalHeaderStyle}>
              <div className="max-md:text-[18px]" style={{ fontSize: "22px", fontWeight: 800, color: "#111827" }}>
                Select Cab
              </div>

              <button
                type="button"
                onClick={() => setShowCabModal(false)}
                style={closeBtnStyle}
              >
                ×
              </button>
            </div>

            <div className="max-md:p-4" style={{ padding: "20px" }}>
              <div style={{ display: "grid", gap: "14px" }}>
                {CAB_OPTIONS.map((item) => {
                  const active = selectedCab === item.key && cabStatus === "selected";

                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => handleSelectCab(item.key)}
                      style={{
                        textAlign: "left",
                        border: active ? "2px solid #38bdf8" : "1px solid #d9e2ec",
                        background: active ? "#eef8ff" : "#ffffff",
                        padding: "18px",
                        cursor: "pointer",
                        borderRadius: "8px",
                      }}
                    >
                      <div
                        className="max-md:flex-col max-md:items-start"
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: "12px",
                          alignItems: "center",
                        }}
                      >
                        <div>
                          <div
                            style={{
                              fontSize: "18px",
                              fontWeight: 800,
                              color: "#111827",
                            }}
                          >
                            {item.title}
                          </div>
                          <div
                            style={{
                              marginTop: "8px",
                              fontSize: "14px",
                              color: "#4b5563",
                              lineHeight: "22px",
                            }}
                          >
                            {item.subtitle}
                          </div>
                        </div>

                        <div
                          style={{
                            fontSize: "20px",
                            fontWeight: 800,
                            color: "#111827",
                            whiteSpace: "nowrap",
                          }}
                        >
                          ₹{item.price.toLocaleString("en-IN")}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="max-md:flex-col" style={modalFooterStyle}>
                <button
                  type="button"
                  onClick={() => handleSelectCab("none")}
                  className="max-md:w-full"
                  style={secondaryBtnStyle}
                >
                  Skip Cab
                </button>

                <button
                  type="button"
                  onClick={() => setShowCabModal(false)}
                  className="max-md:w-full"
                  style={primaryBtnStyle}
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </ModalOverlay>
      )}
    </>
  );
}

function CabCard({
  title,
  subtitle,
  price,
  active,
  onClick,
}: {
  title: string;
  subtitle: string;
  price: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <label
      style={{
        textAlign: "left",
        border: active ? "2px solid #38bdf8" : "1px solid #d9e2ec",
        background: active ? "#eef8ff" : "#ffffff",
        padding: "16px",
        cursor: "pointer",
        minHeight: "150px",
        display: "block",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "12px",
        }}
      >
        <div style={{ fontSize: "17px", fontWeight: 800, color: "#111827" }}>
          {title}
        </div>
        <input
          type="checkbox"
          checked={active}
          onChange={onClick}
          aria-label={`${title} selected`}
          className="h-5 w-5 shrink-0 cursor-pointer accent-[#38bdf8]"
        />
      </div>
      <div
        style={{
          marginTop: "8px",
          fontSize: "14px",
          color: "#4b5563",
          lineHeight: "22px",
        }}
      >
        {subtitle}
      </div>
      <div
        style={{
          marginTop: "14px",
          fontSize: "16px",
          fontWeight: 800,
          color: "#111827",
        }}
      >
        {price > 0 ? `₹${price.toLocaleString("en-IN")}` : "Skip"}
      </div>
    </label>
  );
}

function ModalOverlay({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      onClick={onClose}
      className="max-md:p-3"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ maxHeight: "90vh", overflowY: "auto" }}
      >
        {children}
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

const cardStyle: React.CSSProperties = {
  border: "1px solid #d9e2ec",
  background: "#f8fbff",
  padding: "18px",
};

const lockedBoxStyle: React.CSSProperties = {
  border: "1px solid #f3d2d0",
  background: "#fff7f7",
  padding: "18px",
};

const cabModalStyle: React.CSSProperties = {
  width: "860px",
  maxWidth: "100%",
  background: "#ffffff",
  borderRadius: "10px",
  overflow: "hidden",
  boxShadow: "0 20px 60px rgba(0,0,0,0.28)",
};

const modalHeaderStyle: React.CSSProperties = {
  padding: "18px 22px",
  borderBottom: "1px solid #e5e7eb",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
};

const closeBtnStyle: React.CSSProperties = {
  border: "none",
  background: "transparent",
  fontSize: "34px",
  lineHeight: 1,
  cursor: "pointer",
  color: "#374151",
};

const modalFooterStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "flex-end",
  gap: "12px",
  marginTop: "24px",
};

const secondaryBtnStyle: React.CSSProperties = {
  height: "44px",
  padding: "0 18px",
  border: "1px solid #d1d5db",
  background: "#ffffff",
  borderRadius: "8px",
  fontWeight: 700,
  cursor: "pointer",
};

const primaryBtnStyle: React.CSSProperties = {
  height: "44px",
  padding: "0 18px",
  border: "none",
  background: "#38bdf8",
  color: "#ffffff",
  borderRadius: "8px",
  fontWeight: 800,
  cursor: "pointer",
};
