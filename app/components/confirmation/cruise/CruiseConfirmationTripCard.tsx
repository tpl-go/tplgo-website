"use client";

type Props = {
  title: string;
  route?: string | null;
  departurePort?: string | null;
  arrivalPort?: string | null;
  sailingStartDate?: string | null;
  sailingEndDate?: string | null;
  sailingDate?: string | null;
  visitingPorts?: string[];
  cruiseLine?: string | null;
  shipName?: string | null;
  durationLabel?: string | null;
};

function formatDate(value?: string | null) {
  if (!value) return "On Request";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;

  return parsed.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function CruiseConfirmationTripCard({
  title,
  route,
  departurePort,
  arrivalPort,
  sailingStartDate,
  sailingEndDate,
  sailingDate,
  visitingPorts = [],
  cruiseLine,
  shipName,
  durationLabel,
}: Props) {
  const finalStartDate = sailingStartDate || sailingDate || null;
  const finalEndDate = sailingEndDate || null;

  const allPorts =
    visitingPorts.length > 0
      ? visitingPorts
      : [departurePort, arrivalPort].filter(Boolean) as string[];

  return (
    <section
      style={{
        border: "1px solid #d9e2ec",
        borderRadius: "22px",
        overflow: "hidden",
        background: "#ffffff",
        boxShadow: "0 8px 24px rgba(15,23,42,0.05)",
      }}
    >
      <div
        style={{
          minHeight: "58px",
          padding: "0 22px",
          borderBottom: "1px solid #e5e7eb",
          background: "linear-gradient(180deg, #fffdf4 0%, #ffffff 100%)",
          display: "flex",
          alignItems: "center",
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: "19px",
            fontWeight: 900,
            color: "#111827",
            letterSpacing: "-0.2px",
          }}
        >
          Cruise Journey Details
        </h3>
      </div>

      <div style={{ padding: "22px" }}>
        {/* HERO BLOCK */}
        <div
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: "20px",
            background: "linear-gradient(135deg, #eff6ff 0%, #ffffff 55%, #f8fafc 100%)",
            padding: "20px",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.7)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: "16px",
              flexWrap: "wrap",
            }}
          >
            <div style={{ minWidth: 0, flex: 1 }}>
              <div
                style={{
                  fontSize: "28px",
                  fontWeight: 900,
                  color: "#0f172a",
                  lineHeight: "36px",
                  letterSpacing: "-0.4px",
                }}
              >
                {title}
              </div>

              {route ? (
                <div
                  style={{
                    marginTop: "10px",
                    fontSize: "16px",
                    fontWeight: 800,
                    color: "#1d4ed8",
                    lineHeight: "24px",
                  }}
                >
                  {route}
                </div>
              ) : null}

              <div
                style={{
                  marginTop: "14px",
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "10px",
                }}
              >
                {cruiseLine ? (
                  <span style={pillStyleSky}>Cruise Line: {cruiseLine}</span>
                ) : null}

                {shipName ? (
                  <span style={pillStyleNeutral}>Ship: {shipName}</span>
                ) : null}

                {durationLabel ? (
                  <span style={pillStyleGreen}>{durationLabel}</span>
                ) : null}
              </div>
            </div>

            <div
              style={{
                minWidth: "240px",
                border: "1px solid #dbeafe",
                borderRadius: "18px",
                background: "#ffffff",
                padding: "16px",
                boxShadow: "0 6px 18px rgba(37,99,235,0.05)",
              }}
            >
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: 800,
                  color: "#64748b",
                  textTransform: "uppercase",
                  letterSpacing: "0.6px",
                }}
              >
                Sailing Window
              </div>

              <div
                style={{
                  marginTop: "8px",
                  fontSize: "15px",
                  fontWeight: 800,
                  color: "#111827",
                  lineHeight: "24px",
                }}
              >
                {formatDate(finalStartDate)}
              </div>

              <div
                style={{
                  marginTop: "6px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  color: "#94a3b8",
                  fontWeight: 800,
                  fontSize: "13px",
                }}
              >
                <span>to</span>
              </div>

              <div
                style={{
                  marginTop: "6px",
                  fontSize: "15px",
                  fontWeight: 800,
                  color: "#111827",
                  lineHeight: "24px",
                }}
              >
                {formatDate(finalEndDate)}
              </div>
            </div>
          </div>
        </div>

        {/* ROUTE TIMELINE */}
        <div
          style={{
            marginTop: "18px",
            border: "1px solid #e5e7eb",
            borderRadius: "18px",
            background: "#ffffff",
            padding: "18px",
          }}
        >
          <div
            style={{
              fontSize: "15px",
              fontWeight: 900,
              color: "#111827",
              marginBottom: "14px",
            }}
          >
            Route Snapshot
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr auto 1fr",
              gap: "14px",
              alignItems: "center",
            }}
          >
            <RoutePortCard
              label="Departure"
              port={departurePort || "On Request"}
              date={formatDate(finalStartDate)}
              align="left"
            />

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "8px",
                minWidth: "100px",
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: "2px",
                  background:
                    "linear-gradient(90deg, #bfdbfe 0%, #60a5fa 50%, #bfdbfe 100%)",
                  borderRadius: "999px",
                }}
              />
              <div
                style={{
                  fontSize: "20px",
                  lineHeight: 1,
                }}
              >
                🚢
              </div>
              <div
                style={{
                  width: "100%",
                  height: "2px",
                  background:
                    "linear-gradient(90deg, #bfdbfe 0%, #60a5fa 50%, #bfdbfe 100%)",
                  borderRadius: "999px",
                }}
              />
            </div>

            <RoutePortCard
              label="Arrival"
              port={arrivalPort || "On Request"}
              date={formatDate(finalEndDate)}
              align="right"
            />
          </div>
        </div>

        {/* INFO GRID */}
        <div
          style={{
            marginTop: "18px",
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: "14px",
          }}
        >
          <InfoCard
            title="Departure Port"
            value={departurePort || "On Request"}
          />

          <InfoCard
            title="Arrival Port"
            value={arrivalPort || "On Request"}
          />

          <InfoCard
            title="Sailing Start"
            value={formatDate(finalStartDate)}
          />

          <InfoCard
            title="Sailing End"
            value={formatDate(finalEndDate)}
          />
        </div>

        {/* VISITING PORTS */}
        <div
          style={{
            marginTop: "18px",
            border: "1px solid #e5e7eb",
            borderRadius: "18px",
            background: "#ffffff",
            padding: "18px",
          }}
        >
          <div
            style={{
              fontSize: "15px",
              fontWeight: 900,
              color: "#111827",
              marginBottom: "14px",
            }}
          >
            Visiting Ports
          </div>

          {allPorts.length > 0 ? (
            <>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "10px",
                }}
              >
                {allPorts.map((port, index) => (
                  <span
                    key={`${port}-${index}`}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      padding: "9px 13px",
                      borderRadius: "999px",
                      background: index === 0 ? "#eff6ff" : "#f8fafc",
                      border:
                        index === 0
                          ? "1px solid #bfdbfe"
                          : "1px solid #e2e8f0",
                      color: index === 0 ? "#1d4ed8" : "#334155",
                      fontSize: "13px",
                      fontWeight: 800,
                    }}
                  >
                    {port}
                  </span>
                ))}
              </div>

              <div
                style={{
                  marginTop: "14px",
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "10px",
                }}
              >
                {allPorts.map((port, index) => (
                  <div
                    key={`step-${port}-${index}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <div
                      style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "999px",
                        background: "#e0f2fe",
                        color: "#0369a1",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "12px",
                        fontWeight: 900,
                        border: "1px solid #bae6fd",
                      }}
                    >
                      {index + 1}
                    </div>

                    <div
                      style={{
                        fontSize: "13px",
                        fontWeight: 700,
                        color: "#334155",
                      }}
                    >
                      {port}
                    </div>

                    {index !== allPorts.length - 1 ? (
                      <div
                        style={{
                          width: "34px",
                          height: "2px",
                          background: "#cbd5e1",
                          borderRadius: "999px",
                        }}
                      />
                    ) : null}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div
              style={{
                fontSize: "14px",
                color: "#6b7280",
                fontWeight: 600,
                lineHeight: "22px",
              }}
            >
              Visiting ports will appear here once full cruise itinerary data is connected.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function RoutePortCard({
  label,
  port,
  date,
  align,
}: {
  label: string;
  port: string;
  date: string;
  align: "left" | "right";
}) {
  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: "16px",
        background: "#f8fafc",
        padding: "16px",
        textAlign: align,
      }}
    >
      <div
        style={{
          fontSize: "12px",
          fontWeight: 800,
          color: "#64748b",
          marginBottom: "6px",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontSize: "18px",
          fontWeight: 900,
          color: "#111827",
          lineHeight: "26px",
        }}
      >
        {port}
      </div>

      <div
        style={{
          marginTop: "6px",
          fontSize: "13px",
          fontWeight: 700,
          color: "#475569",
          lineHeight: "21px",
        }}
      >
        {date}
      </div>
    </div>
  );
}

function InfoCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: "16px",
        background: "#ffffff",
        padding: "16px",
        boxShadow: "0 1px 4px rgba(15,23,42,0.03)",
      }}
    >
      <div
        style={{
          fontSize: "12px",
          fontWeight: 800,
          color: "#6b7280",
          marginBottom: "7px",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
        }}
      >
        {title}
      </div>

      <div
        style={{
          fontSize: "16px",
          fontWeight: 900,
          color: "#111827",
          lineHeight: "24px",
        }}
      >
        {value}
      </div>
    </div>
  );
}

const pillBase: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  padding: "8px 13px",
  borderRadius: "999px",
  fontSize: "12px",
  fontWeight: 800,
};

const pillStyleSky: React.CSSProperties = {
  ...pillBase,
  background: "#eff6ff",
  border: "1px solid #bfdbfe",
  color: "#1d4ed8",
};

const pillStyleNeutral: React.CSSProperties = {
  ...pillBase,
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  color: "#334155",
};

const pillStyleGreen: React.CSSProperties = {
  ...pillBase,
  background: "#ecfdf5",
  border: "1px solid #bbf7d0",
  color: "#166534",
};