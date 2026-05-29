"use client";

import FlightLayoverBlock from "./FlightLayoverBlock";

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

  layover?: {
    duration: string;
    airport: string;
    code: string;
  };
};

type Props = {
  segments: Segment[];
  isInternational?: boolean;
};

export default function FlightSegmentBlock({ segments }: Props) {
  if (!segments?.length) return null;

  const isSameFlightContinuation = (
    current: Segment,
    next?: Segment
  ): boolean => {
    if (!next) return false;

    return (
      current.airline?.trim().toLowerCase() ===
        next.airline?.trim().toLowerCase() &&
      current.flightNumber?.trim().toLowerCase() ===
        next.flightNumber?.trim().toLowerCase()
    );
  };

  return (
    <div>
      {segments.map((seg, index) => {
        const nextSeg = segments[index + 1];

const hasLayover = !!seg.layover;
const isSingleSegmentJourney = segments.length === 1;

const sameFlight =
  hasLayover && nextSeg
    ? isSameFlightContinuation(seg, nextSeg)
    : false;

const showFullLayoverBlock =
  hasLayover && (isSingleSegmentJourney || !sameFlight);

const showCompactLayover =
  hasLayover && !isSingleSegmentJourney && sameFlight;

        return (
          <div key={index}>
            {/* FLIGHT ROW */}
            <div
              style={{
                padding: "12px 14px",
                borderBottom:
                  index !== segments.length - 1 ? "1px solid #e5e7eb" : "none",
              }}
            >
              {/* AIRLINE */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "12px",
                  marginBottom: "6px",
                }}
              >
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "#111827",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    flexWrap: "wrap",
                  }}
                >
                  <span>
                    {seg.airline} • {seg.flightNumber}
                  </span>

                  {seg.aircraft ? (
                    <span
                      style={{
                        padding: "2px 8px",
                        border: "1px solid #bfc9d4",
                        borderRadius: "999px",
                        fontSize: "11px",
                        fontWeight: 600,
                        color: "#374151",
                        lineHeight: 1.2,
                        background: "#fff",
                      }}
                    >
                      {seg.aircraft}
                    </span>
                  ) : null}
                </div>
              </div>

              {/* MAIN ROW */}
              <div
                className="max-md:!grid-cols-[64px_1fr_64px] max-md:gap-2"
                style={{
                  display: "grid",
                  gridTemplateColumns: "80px 1fr 80px",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                {/* LEFT */}
                <div>
                  <div
                    className="max-md:text-[17px]"
                    style={{
                      fontSize: "20px",
                      fontWeight: 800,
                      color: "#111827",
                    }}
                  >
                    {seg.departureTime}
                  </div>
                  <div
                    className="max-md:break-words max-md:text-[11px]"
                    style={{
                      fontSize: "12px",
                      color: "#4b5563",
                      marginTop: "2px",
                    }}
                  >
                    {seg.fromCity}
                  </div>
                </div>

                {/* CENTER LINE */}
                <div
                  style={{
                    position: "relative",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      height: "2px",
                      background: "#9ca3af",
                      width: "100%",
                    }}
                  />

                  <span
                    style={{
                      position: "absolute",
                      left: 0,
                      top: "-4px",
                      width: "8px",
                      height: "8px",
                      background: "#fff",
                      border: "2px solid #6b7280",
                      borderRadius: "50%",
                    }}
                  />
                  <span
                    style={{
                      position: "absolute",
                      right: 0,
                      top: "-4px",
                      width: "8px",
                      height: "8px",
                      background: "#fff",
                      border: "2px solid #6b7280",
                      borderRadius: "50%",
                    }}
                  />

                  <div
                    style={{
                      marginTop: "6px",
                      fontSize: "12px",
                      color: "#4b5563",
                      fontWeight: 500,
                    }}
                  >
                    {seg.duration}
                  </div>

                  <div
                    className="max-md:text-[11px] max-md:leading-[15px]"
                    style={{
                      fontSize: "11px",
                      color: "#6b7280",
                    }}
                  >
                    {seg.stopCount === 0 ? "Non Stop" : `${seg.stopCount} Stop`}
                  </div>

                  <div
                    style={{
                      fontSize: "11px",
                      color: "#6b7280",
                    }}
                  >
                    {seg.fromCity} → {seg.toCity}
                  </div>
                </div>

                {/* RIGHT */}
                <div style={{ textAlign: "right" }}>
                  <div
                    className="max-md:text-[17px]"
                    style={{
                      fontSize: "20px",
                      fontWeight: 800,
                      color: "#111827",
                    }}
                  >
                    {seg.arrivalTime}
                  </div>
                  <div
                    className="max-md:break-words max-md:text-[11px]"
                    style={{
                      fontSize: "12px",
                      color: "#4b5563",
                      marginTop: "2px",
                    }}
                  >
                    {seg.toCity}
                  </div>
                </div>
              </div>

              {/* SAME FLIGHT LAYOVER - compact */}
              {showCompactLayover ? (
  <div
    style={{
      marginTop: "10px",
      display: "flex",
      justifyContent: "flex-end",
    }}
  >
    <FlightLayoverBlock
      duration={seg.layover!.duration}
      airport={seg.layover!.airport}
      code={seg.layover!.code}
      variant="compact"
    />
  </div>
) : null}
            </div>

            {/* DIFFERENT FLIGHT LAYOVER */}
            {showFullLayoverBlock ? (
              <FlightLayoverBlock
                duration={seg.layover!.duration}
                airport={seg.layover!.airport}
                code={seg.layover!.code}
              />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
