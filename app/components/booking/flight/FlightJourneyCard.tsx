"use client";

import { useMemo, useState } from "react";
import FlightSegmentBlock from "./FlightSegmentBlock";

type LayoverInfo = {
  duration: string;
  airport: string;
  code: string;
};

type Segment = {
  airline: string;
  flightNumber: string;
  aircraft?: string;

  fromCity: string;
  fromCode: string;
  fromAirport: string;

  toCity: string;
  toCode: string;
  toAirport: string;

  departureTime: string;
  arrivalTime: string;

  duration: string;
  stopCount: number;

  baggage: string;
  cabinClass: string;

  layover?: LayoverInfo;
};

type FareRuleRow = {
  timeframe: string;
  value: string;
};

type BaggageOption = {
  label: string;
  price: number;
};

type Props = {
  title: string;
  routeLabel: string;
  dateLabel: string;
  stopText: string;
  duration: string;
  fareType: string;
  cabinClass: string;
  isInternational?: boolean;
  segments: Segment[];
  cancellationRules?: FareRuleRow[];
  dateChangeRules?: FareRuleRow[];
  baggageOptions?: BaggageOption[];
  includedCheckInText?: string;
};

export default function FlightJourneyCard({
  title,
  routeLabel,
  dateLabel,
  stopText,
  duration,
  fareType,
  cabinClass,
  isInternational = false,
  segments,
  cancellationRules = [
    { timeframe: "0 hours to 2 hours*", value: "ADULT: Non Refundable" },
    { timeframe: "2 hours to 365 days*", value: "ADULT: ₹ 4,300 + ₹ 350" },
  ],
  dateChangeRules = [
    {
      timeframe: "0 hours to 2 hours*",
      value: "ADULT: Non Changeable",
    },
    {
      timeframe: "2 hours to 365 days*",
      value: "ADULT: ₹ 3,000 + ₹ 350 + Fare difference",
    },
  ],
  baggageOptions = [
    { label: "Additional 3 KG", price: 1800 },
    { label: "Additional 5 KG", price: 3000 },
    { label: "Additional 10 KG", price: 6000 },
    { label: "Additional 15 KG", price: 9000 },
  ],
  includedCheckInText = "Included Check-in baggage per person - 15 KGS",
}: Props) {
  const [showFareRules, setShowFareRules] = useState(false);
  const [fareRuleTab, setFareRuleTab] = useState<"cancellation" | "dateChange">(
    "cancellation"
  );
  const [showBaggageModal, setShowBaggageModal] = useState(false);

  const activeRules =
    fareRuleTab === "cancellation" ? cancellationRules : dateChangeRules;

  const badgeText = isInternational
    ? "NON-REFUNDABLE"
    : "CANCELLATION FEES APPLY";

  const cabinText = useMemo(() => {
    return `${cabinClass} > ${fareType}`;
  }, [cabinClass, fareType]);

  const baggageAlertText = useMemo(() => {
    if (includedCheckInText.toLowerCase().includes("0 kg")) {
      const codeText = segments.length
        ? `${segments[0].fromCode}-${segments[segments.length - 1].toCode}`
        : routeLabel;
      return `Check-in baggage is not included for ${codeText}. You can buy extra baggage from the airline counter.`;
    }

    return "Got excess baggage? Don't stress, buy extra check-in baggage allowance.";
  }, [includedCheckInText, segments, routeLabel]);

  const actionStripBg = includedCheckInText.toLowerCase().includes("0 kg")
    ? "#f7dce2"
    : "#eef8fb";

  return (
    <>
      <div
        className="max-md:rounded-xl"
        style={{
          border: "1px solid #d9e2ec",
          background: "#ffffff",
          overflow: "hidden",
        }}
      >
        {/* TOP HEADER */}
        <div
          className="max-md:p-3"
          style={{
            padding: "12px 14px 10px 14px",
            borderBottom: "1px solid #e9eef5",
            background: "#ffffff",
          }}
        >
          <div
            className="max-md:flex-col max-md:gap-3"
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: "16px",
            }}
          >
            {/* LEFT */}
            <div>
              <div
                className="max-md:text-[15px] max-md:leading-[20px]"
                style={{
                  fontSize: "16px",
                  fontWeight: 800,
                  color: "#111827",
                }}
              >
                {routeLabel}
              </div>

              {(dateLabel || stopText || duration) && (
                <div
                  style={{
                    marginTop: "8px",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    flexWrap: "wrap",
                  }}
                >
                  {dateLabel ? (
                    <span
                      style={{
                        background: "#f4d7d0",
                        color: "#111827",
                        fontSize: "12px",
                        fontWeight: 700,
                        padding: "4px 8px",
                      }}
                    >
                      {dateLabel}
                    </span>
                  ) : null}

                  <span
                    style={{
                      fontSize: "13px",
                      color: "#111827",
                      fontWeight: 500,
                    }}
                  >
                    {stopText}
                    {duration ? ` · ${duration}` : ""}
                  </span>
                </div>
              )}
            </div>

            {/* RIGHT */}
            <div className="max-md:text-left" style={{ textAlign: "right" }}>
              <div
                style={{
                  display: "inline-block",
                  background: isInternational ? "#8a2234" : "#2d7b6e",
                  color: "#ffffff",
                  fontSize: "10px",
                  fontWeight: 800,
                  padding: "4px 8px",
                }}
              >
                {badgeText}
              </div>

              <button
                type="button"
                onClick={() => {
                  setFareRuleTab("cancellation");
                  setShowFareRules(true);
                }}
                style={{
                  display: "block",
                  marginTop: "8px",
                  border: "none",
                  background: "transparent",
                  color: "#2563eb",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                  marginLeft: "auto",
                }}
              >
                View Fare Rules
              </button>

              <div
                style={{
                  marginTop: "8px",
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "#374151",
                }}
              >
                {cabinText}
              </div>
            </div>
          </div>
        </div>

        {/* SEGMENT BODY */}
        <div
          className="max-md:mx-3"
          style={{
            background: "#edf4fb",
            margin: "0 14px",
          }}
        >
          <FlightSegmentBlock
            segments={segments}
            isInternational={isInternational}
          />
        </div>

        {/* BAGGAGE ROW */}
        <div
          className="max-md:gap-2 max-md:px-3 max-md:text-[12px]"
          style={{
            padding: "10px 14px",
            display: "flex",
            alignItems: "center",
            gap: "18px",
            flexWrap: "wrap",
            borderTop: "1px solid #e5e7eb",
            fontSize: "13px",
            fontWeight: 600,
            color: "#374151",
          }}
        >
          <div>Cabin Baggage: {segments[0]?.baggage || "7 Kg / Adult"}</div>
          <div>
            Check-In Baggage:{" "}
            {includedCheckInText.replace(
              "Included Check-in baggage per person - ",
              ""
            )}
          </div>
        </div>

        {/* ACTION STRIP */}
        <div
          className="max-md:mx-3 max-md:mb-3 max-md:flex-col max-md:items-start"
          style={{
            margin: "0 14px 14px 14px",
            background: actionStripBg,
            borderTop: "1px solid #d9e2ec",
            padding: "8px 12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "14px",
          }}
        >
          <div
            style={{
              fontSize: "12px",
              color: "#4b5563",
              fontWeight: 500,
            }}
          >
            {baggageAlertText}
          </div>

          <button
            type="button"
            onClick={() => setShowBaggageModal(true)}
            className="max-md:min-h-10"
            style={{
              border: "none",
              background: "transparent",
              color: "#0ea5e9",
              fontSize: "13px",
              fontWeight: 700,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            ADD BAGGAGE
          </button>
        </div>
      </div>

      {showFareRules && (
        <ModalOverlay onClose={() => setShowFareRules(false)}>
          <div className="max-md:!max-h-[92vh] max-md:!w-full max-md:overflow-y-auto max-md:rounded-xl" style={modalCardStyle}>
            <div style={modalHeaderStyle}>
              <div
                style={{
                  fontSize: "18px",
                  fontWeight: 800,
                  color: "#111827",
                }}
              >
                Fare rules
              </div>

              <button
                type="button"
                onClick={() => setShowFareRules(false)}
                style={closeBtnStyle}
              >
                ×
              </button>
            </div>

            <div className="max-md:p-4" style={{ padding: "18px 22px 22px 22px" }}>
              <div className="max-md:flex-col" style={{ display: "flex", gap: "8px", marginBottom: "18px" }}>
                <button
                  type="button"
                  onClick={() => setFareRuleTab("cancellation")}
                  style={tabBtnStyle(fareRuleTab === "cancellation")}
                >
                  Cancellation Charges
                </button>

                <button
                  type="button"
                  onClick={() => setFareRuleTab("dateChange")}
                  style={tabBtnStyle(fareRuleTab === "dateChange")}
                >
                  Date change charges
                </button>
              </div>

              <div style={{ border: "1px solid #d9e2ec", background: "#f8fbff" }}>
                <div
                  style={{
                    padding: "14px 16px",
                    borderBottom: "1px solid #d9e2ec",
                    fontSize: "18px",
                    fontWeight: 700,
                    color: "#374151",
                  }}
                >
                  {segments[0]?.fromCode}-{segments[segments.length - 1]?.toCode}
                </div>

                <div style={{ padding: "14px 16px 18px 16px" }}>
                  <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    border: "1px solid #d9e2ec",
                    overflowX: "auto",
                  }}
                >
                    <div style={tableHeadStyle}>
                      Time frame
                      <div style={tableSubHeadStyle}>
                        (From Scheduled Flight departure)
                      </div>
                    </div>

                    <div style={tableHeadStyle}>
                      {fareRuleTab === "cancellation"
                        ? "Airline Fee + MMT Fee"
                        : "Airline Fee + MMT Fee + Fare difference"}
                      <div style={tableSubHeadStyle}>(Per passenger)</div>
                    </div>

                    {activeRules.map((row, index) => (
                      <FragmentRow
                        key={index}
                        left={row.timeframe}
                        right={row.value}
                      />
                    ))}
                  </div>

                  <div
                    style={{
                      marginTop: "12px",
                      fontSize: "14px",
                      color: "#4b5563",
                    }}
                  >
                    *From the Time of Departure
                  </div>
                </div>
              </div>

              <div
                style={{
                  marginTop: "16px",
                  background: "#f7e8e8",
                  padding: "14px 16px",
                  fontSize: "13px",
                  color: "#4b5563",
                  lineHeight: "22px",
                }}
              >
                <strong>*Important:</strong> The Airline fee is indicative.
                Mentioned charges are per passenger. All refunds / changes remain
                subject to airline approval and applicable fare rules.
              </div>

              {fareRuleTab === "dateChange" && (
                <div
                  style={{
                    marginTop: "10px",
                    padding: "12px 16px",
                    background: "#eef8fb",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "12px",
                    fontSize: "14px",
                    fontWeight: 700,
                    color: "#0284c7",
                  }}
                >
                  <span>Add Free Date Change for ₹ 99</span>
                  <button
                    type="button"
                    style={{
                      border: "none",
                      background: "transparent",
                      color: "#0ea5e9",
                      fontWeight: 800,
                      cursor: "pointer",
                    }}
                  >
                    ADD
                  </button>
                </div>
              )}
            </div>
          </div>
        </ModalOverlay>
      )}

      {showBaggageModal && (
        <ModalOverlay onClose={() => setShowBaggageModal(false)}>
          <div className="max-md:!max-h-[92vh] max-md:!w-full max-md:overflow-y-auto max-md:rounded-xl" style={modalCardStyle}>
            <div style={modalHeaderStyle}>
              <div
                style={{
                  fontSize: "18px",
                  fontWeight: 800,
                  color: "#111827",
                }}
              >
                Add Extra Baggage
              </div>

              <button
                type="button"
                onClick={() => setShowBaggageModal(false)}
                style={closeBtnStyle}
              >
                ×
              </button>
            </div>

            <div className="max-md:p-4" style={{ padding: "18px 22px 22px 22px" }}>
              <div
                style={{
                  display: "inline-block",
                  background: "#1457d6",
                  color: "#ffffff",
                  padding: "12px 16px",
                  minWidth: "230px",
                  marginBottom: "18px",
                }}
              >
                <div style={{ fontSize: "22px", fontWeight: 700 }}>
                  {routeLabel}
                </div>
                <div
                  style={{
                    marginTop: "4px",
                    fontSize: "13px",
                    opacity: 0.85,
                  }}
                >
                  Selection pending
                </div>
              </div>

              <div
                style={{
                  fontSize: "16px",
                  color: "#374151",
                  marginBottom: "22px",
                }}
              >
                {includedCheckInText}
              </div>

              <div style={{ display: "grid", gap: "18px" }}>
                {baggageOptions.map((item, index) => (
                  <div
                    key={index}
                    className="max-md:!grid-cols-1 max-md:gap-2"
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 140px 140px",
                      alignItems: "center",
                      gap: "16px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "16px",
                        fontWeight: 500,
                        color: "#111827",
                      }}
                    >
                      {item.label}
                    </div>

                    <div
                      className="max-md:text-left"
                      style={{
                        textAlign: "right",
                        fontSize: "18px",
                        fontWeight: 700,
                        color: "#111827",
                      }}
                    >
                      ₹ {item.price.toLocaleString("en-IN")}
                    </div>

                    <button
                      type="button"
                      className="max-md:w-full"
                      style={{
                        height: "44px",
                        border: "1px solid #d9e2ec",
                        background: "#ffffff",
                        fontSize: "16px",
                        fontWeight: 700,
                        color: "#111827",
                        cursor: "pointer",
                      }}
                    >
                      Add ＋
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ModalOverlay>
      )}
    </>
  );
}

function FragmentRow({
  left,
  right,
}: {
  left: string;
  right: string;
}) {
  return (
    <>
      <div style={tableCellStyle}>{left}</div>
      <div style={tableCellStyle}>{right}</div>
    </>
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
      <div onClick={(e) => e.stopPropagation()}>{children}</div>
    </div>
  );
}

const modalCardStyle: React.CSSProperties = {
  width: "820px",
  maxWidth: "100%",
  background: "#ffffff",
  boxShadow: "0 20px 60px rgba(0,0,0,0.28)",
};

const modalHeaderStyle: React.CSSProperties = {
  padding: "18px 22px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  borderBottom: "1px solid #e5e7eb",
};

const closeBtnStyle: React.CSSProperties = {
  border: "none",
  background: "transparent",
  fontSize: "34px",
  lineHeight: 1,
  cursor: "pointer",
  color: "#374151",
};

function tabBtnStyle(active: boolean): React.CSSProperties {
  return {
    height: "40px",
    border: "none",
    padding: "0 16px",
    background: active ? "#bfe3f6" : "#d8dee6",
    color: "#111827",
    fontSize: "15px",
    fontWeight: 700,
    cursor: "pointer",
  };
}

const tableHeadStyle: React.CSSProperties = {
  padding: "14px 16px",
  borderBottom: "1px solid #d9e2ec",
  borderRight: "1px solid #d9e2ec",
  fontSize: "18px",
  fontWeight: 700,
  color: "#111827",
};

const tableSubHeadStyle: React.CSSProperties = {
  marginTop: "4px",
  fontSize: "13px",
  fontWeight: 500,
  color: "#4b5563",
};

const tableCellStyle: React.CSSProperties = {
  padding: "14px 16px",
  borderBottom: "1px solid #d9e2ec",
  borderRight: "1px solid #d9e2ec",
  fontSize: "15px",
  color: "#111827",
};
