"use client";

import type { CSSProperties } from "react";

type Props = {
  cabType?: string;
  fromLocation?: string;
  toLocation?: string;
  pickupDate?: string;
  pickupTime?: string;
  dropDate?: string;
  dropTime?: string;
  tripType?: string;
  vehicleName?: string;
  specialRequest?: string;
};

function formatDate(value?: string) {
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

export default function CabConfirmationJourneyCard({
  cabType,
  fromLocation,
  toLocation,
  pickupDate,
  pickupTime,
  dropDate,
  dropTime,
  tripType,
  vehicleName,
  specialRequest,
}: Props) {
  const finalDropDate = dropDate || pickupDate || "";

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
          Journey Details
        </h3>
      </div>

      <div className="p-4 md:p-[22px]">
        <div
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: "20px",
            background: "#ffffff",
            overflow: "hidden",
            boxShadow: "0 4px 16px rgba(15,23,42,0.03)",
          }}
        >
          <div
            style={{
              padding: "16px 18px",
              borderBottom: "1px solid #e5e7eb",
              background: "linear-gradient(135deg, #f8fbff 0%, #ffffff 100%)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: "12px",
              flexWrap: "wrap",
            }}
          >
            <div style={{ minWidth: 0, flex: 1 }}>
              <div
                style={{
                  fontSize: "22px",
                  fontWeight: 900,
                  color: "#111827",
                  lineHeight: "30px",
                }}
              >
                {vehicleName || cabType || "Cab Journey"}
              </div>

              <div
                style={{
                  marginTop: "6px",
                  fontSize: "14px",
                  color: "#2563eb",
                  fontWeight: 800,
                  lineHeight: "22px",
                }}
              >
                {tripType || "Cab Ride"}
              </div>
            </div>

            <span style={topPillStyle}>Confirmed Ride</span>
          </div>

          <div style={{ padding: "18px" }}>
            <div
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: "18px",
                background:
                  "linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)",
                padding: "16px",
              }}
            >
              <div
                className="hidden md:grid"
                style={{
                  gridTemplateColumns: "1fr auto 1fr",
                  gap: "14px",
                  alignItems: "center",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: "13px",
                      fontWeight: 800,
                      color: "#64748b",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Pickup
                  </div>

                  <div
                    style={{
                      marginTop: "6px",
                      fontSize: "28px",
                      fontWeight: 900,
                      color: "#0f172a",
                      lineHeight: "30px",
                    }}
                  >
                    {pickupTime || "--:--"}
                  </div>

                  <div
                    style={{
                      marginTop: "8px",
                      fontSize: "18px",
                      fontWeight: 900,
                      color: "#111827",
                      lineHeight: "24px",
                    }}
                  >
                    {fromLocation || "Pickup Location"}
                  </div>

                  <div
                    style={{
                      marginTop: "4px",
                      fontSize: "12px",
                      fontWeight: 700,
                      color: "#64748b",
                      lineHeight: "18px",
                    }}
                  >
                    {formatDate(pickupDate)}
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "8px",
                    minWidth: "110px",
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

                  <div style={{ fontSize: "20px", lineHeight: 1 }}>🚕</div>

                  <div
                    style={{
                      fontSize: "12px",
                      color: "#64748b",
                      fontWeight: 800,
                      textAlign: "center",
                    }}
                  >
                    Cab Ride
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

                <div style={{ textAlign: "right" }}>
                  <div
                    style={{
                      fontSize: "13px",
                      fontWeight: 800,
                      color: "#64748b",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Drop
                  </div>

                  <div
                    style={{
                      marginTop: "6px",
                      fontSize: "28px",
                      fontWeight: 900,
                      color: "#0f172a",
                      lineHeight: "30px",
                    }}
                  >
                    {dropTime || "--:--"}
                  </div>

                  <div
                    style={{
                      marginTop: "8px",
                      fontSize: "18px",
                      fontWeight: 900,
                      color: "#111827",
                      lineHeight: "24px",
                    }}
                  >
                    {toLocation || "Drop Location"}
                  </div>

                  <div
                    style={{
                      marginTop: "4px",
                      fontSize: "12px",
                      fontWeight: 700,
                      color: "#64748b",
                      lineHeight: "18px",
                    }}
                  >
                    {dropTime ? formatDate(finalDropDate) : "Scheduled Drop"}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 md:hidden">
                <MobileJourneyPoint
                  label="Pickup"
                  time={pickupTime || "--:--"}
                  location={fromLocation || "Pickup Location"}
                  date={formatDate(pickupDate)}
                />

                <div className="flex justify-center">
                  <div className="rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-center text-[12px] font-extrabold text-blue-700">
                    Cab Ride
                  </div>
                </div>

                <MobileJourneyPoint
                  label="Drop"
                  time={dropTime || "--:--"}
                  location={toLocation || "Drop Location"}
                  date={dropTime ? formatDate(finalDropDate) : "Scheduled Drop"}
                />
              </div>
            </div>

            <div
              style={{
                marginTop: "14px",
                display: "flex",
                flexWrap: "wrap",
                gap: "10px",
              }}
            >
              {cabType ? <span style={infoPillStyle}>{cabType}</span> : null}
              {tripType ? <span style={infoPillStyle}>{tripType}</span> : null}
              {pickupDate ? (
                <span style={infoPillStyle}>Pickup: {formatDate(pickupDate)}</span>
              ) : null}
              {pickupTime ? <span style={infoPillStyle}>{pickupTime}</span> : null}
              {dropTime ? <span style={infoPillStyle}>Drop: {dropTime}</span> : null}
            </div>

            <div
              className="cab-confirmation-info-grid"
              style={{
                marginTop: "16px",
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: "14px",
              }}
            >
              <InfoCard title="Pickup Date" value={formatDate(pickupDate)} />
              <InfoCard title="Pickup Time" value={pickupTime || "On Request"} />
              <InfoCard title="Pickup Location" value={fromLocation || "N/A"} />
              <InfoCard title="Drop Location" value={toLocation || "N/A"} />
              <InfoCard title="Drop Date" value={dropTime ? formatDate(finalDropDate) : "On Request"} />
              <InfoCard title="Drop Time" value={dropTime || "On Request"} />
            </div>

            <div
              style={{
                marginTop: "14px",
                border: "1px solid #e5e7eb",
                background: "#ffffff",
                borderRadius: "14px",
                padding: "12px 14px",
              }}
            >
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: 900,
                  color: "#111827",
                  lineHeight: "20px",
                }}
              >
                Special Request
              </div>

              <div
                style={{
                  marginTop: "4px",
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#64748b",
                  lineHeight: "18px",
                }}
              >
                {specialRequest?.trim()
                  ? specialRequest
                  : "No special request added for this booking."}
              </div>
            </div>
          </div>
        </div>
      </div>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media (max-width: 767px) {
              .cab-confirmation-info-grid {
                grid-template-columns: minmax(0, 1fr) !important;
              }
            }
          `,
        }}
      />
    </section>
  );
}

function MobileJourneyPoint({
  label,
  time,
  location,
  date,
}: {
  label: string;
  time: string;
  location: string;
  date: string;
}) {
  return (
    <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-500">
        {label}
      </div>
      <div className="mt-2 break-words text-[26px] font-black leading-8 text-slate-950">
        {time}
      </div>
      <div className="mt-2 break-words text-[16px] font-black leading-6 text-slate-900">
        {location}
      </div>
      <div className="mt-1 break-words text-[12px] font-bold leading-5 text-slate-500">
        {date}
      </div>
    </div>
  );
}

function InfoCard({ title, value }: { title: string; value: string }) {
  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: "16px",
        background: "#ffffff",
        padding: "14px",
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
        {title}
      </div>

      <div
        style={{
          fontSize: "15px",
          fontWeight: 900,
          color: "#111827",
          lineHeight: "22px",
        }}
      >
        {value}
      </div>
    </div>
  );
}

const topPillStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  padding: "8px 12px",
  borderRadius: "999px",
  background: "#eff6ff",
  border: "1px solid #bfdbfe",
  color: "#1d4ed8",
  fontSize: "12px",
  fontWeight: 800,
};

const infoPillStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  padding: "8px 12px",
  borderRadius: "999px",
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  color: "#334155",
  fontSize: "12px",
  fontWeight: 800,
};
