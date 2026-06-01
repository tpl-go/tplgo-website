"use client";

import type { CSSProperties, ReactNode } from "react";

type Traveller = {
  id?: string;
  label?: string;
  firstName?: string;
  lastName?: string;
  gender?: string;
  age?: string | number;
  seatNumber?: string;
  coach?: string;
  berth?: string;
  quota?: string;
  status?: string;
};

type ContactDetails = {
  countryCode?: string;
  mobile?: string;
  email?: string;
};

type Props = {
  travellers?: Traveller[];
  contactDetails?: ContactDetails;
  pnrNumber?: string;
  trainNumber?: string;
  coachClass?: string;
};

function getFullName(t?: Traveller) {
  const name = `${t?.firstName || ""} ${t?.lastName || ""}`.trim();
  return name || t?.label || "Passenger";
}

function getGenderText(value?: string) {
  if (!value) return "Passenger";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default function TrainConfirmationTravellerCard({
  travellers = [],
  contactDetails,
  pnrNumber,
  trainNumber,
  coachClass,
}: Props) {
  const leadTraveller = travellers[0];

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
          background: "linear-gradient(180deg, #f8fbff 0%, #ffffff 100%)",
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
          Passenger Details
        </h3>
      </div>

      <div className="p-4 md:p-[22px]">
        <div className="md:hidden">
          {leadTraveller ? (
            <div className="mb-4 rounded-[20px] border border-[#dbeafe] bg-[linear-gradient(135deg,#eff6ff_0%,#ffffff_70%)] p-4 shadow-[0_8px_22px_rgba(37,99,235,0.06)]">
              <div className="text-[11px] font-black uppercase tracking-[0.14em] text-[#1d4ed8]">
                Lead Passenger
              </div>
              <div className="mt-1 break-words text-[19px] font-black leading-6 text-[#111827]">
                {getFullName(leadTraveller)}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <MobileBadge>{getGenderText(leadTraveller.gender)}</MobileBadge>
                {leadTraveller.age ? (
                  <MobileBadge>{leadTraveller.age} yrs</MobileBadge>
                ) : null}
                {contactDetails?.mobile ? (
                  <MobileBadge>
                    {contactDetails.countryCode || "+91"} {contactDetails.mobile}
                  </MobileBadge>
                ) : null}
              </div>
            </div>
          ) : null}

          <div className="rounded-[20px] border border-[#e5e7eb] bg-white p-4 shadow-[0_8px_22px_rgba(15,23,42,0.05)]">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[16px] font-black text-[#111827]">
                  Passenger Ticket List
                </div>
                <div className="mt-1 text-[12px] font-semibold text-[#64748b]">
                  {travellers.length || 0} passenger{travellers.length === 1 ? "" : "s"}
                </div>
              </div>
              {pnrNumber ? (
                <div className="shrink-0 rounded-full border border-[#bbf7d0] bg-[#f0fdf4] px-3 py-1 text-[11px] font-black text-[#15803d]">
                  PNR {pnrNumber}
                </div>
              ) : null}
            </div>

            <div className="mt-4 grid gap-3">
              {travellers.length > 0 ? (
                travellers.map((traveller, index) => (
                  <div
                    key={traveller.id || index}
                    className="overflow-hidden rounded-[18px] border border-[#dbe4ee] bg-[#f8fafc]"
                  >
                    <div className="flex items-start gap-3 bg-white p-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#dbeafe] bg-[#eff6ff] text-[15px] font-black text-[#1d4ed8]">
                        {index + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="break-words text-[15px] font-black leading-5 text-[#111827]">
                          {getFullName(traveller)}
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <MobileBadge>{getGenderText(traveller.gender)}</MobileBadge>
                          {traveller.age ? (
                            <MobileBadge>{traveller.age} yrs</MobileBadge>
                          ) : null}
                          {index === 0 ? <MobileBadge>Lead</MobileBadge> : null}
                        </div>
                      </div>
                      <div className="shrink-0 rounded-full bg-[#dcfce7] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.08em] text-[#15803d]">
                        {traveller.status || "Confirmed"}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 p-3">
                      <MobileTicketRow
                        label="Coach"
                        value={traveller.coach || coachClass || "NA"}
                      />
                      <MobileTicketRow
                        label="Seat"
                        value={traveller.seatNumber || "NA"}
                      />
                      <MobileTicketRow
                        label="Berth"
                        value={traveller.berth || "No Preference"}
                      />
                      <MobileTicketRow
                        label="Quota"
                        value={traveller.quota || "General"}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-[#dbe4ee] bg-[#f8fafc] p-4 text-sm font-semibold text-[#64748b]">
                  No passenger data available
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 grid gap-3">
            <MobileInfoPanel
              title="Contact Details"
              rows={[
                {
                  label: "Email",
                  value: contactDetails?.email || "Not provided",
                },
                {
                  label: "Mobile",
                  value: contactDetails?.mobile
                    ? `${contactDetails?.countryCode || "+91"} ${contactDetails.mobile}`
                    : "Not provided",
                },
              ]}
            />
            <MobileInfoPanel
              title="Ticket Snapshot"
              rows={[
                { label: "PNR Number", value: pnrNumber || "Not available" },
                { label: "Train Number", value: trainNumber || "Not available" },
                { label: "Coach/Class", value: coachClass || "Not available" },
                { label: "Passengers", value: `${travellers.length || 0}` },
              ]}
            />
          </div>
        </div>

        <div className="hidden md:block">
        {leadTraveller ? (
          <div
            style={{
              marginBottom: "18px",
              border: "1px solid #dbeafe",
              borderRadius: "20px",
              background:
                "linear-gradient(135deg, #eff6ff 0%, #ffffff 60%, #f8fafc 100%)",
              padding: "18px",
              boxShadow: "0 6px 18px rgba(37,99,235,0.05)",
            }}
          >
            <div
              style={{
                fontSize: "12px",
                fontWeight: 900,
                color: "#1d4ed8",
                textTransform: "uppercase",
                letterSpacing: "0.6px",
                marginBottom: "8px",
              }}
            >
              Lead Passenger
            </div>

            <div
              style={{
                fontSize: "clamp(19px, 6vw, 22px)",
                fontWeight: 900,
                color: "#111827",
                lineHeight: "30px",
                wordBreak: "break-word",
              }}
            >
              {getFullName(leadTraveller)}
            </div>

            <div
              style={{
                marginTop: "8px",
                display: "flex",
                flexWrap: "wrap",
                gap: "10px",
              }}
            >
              <span style={leadPillStyle}>
                {getGenderText(leadTraveller.gender)}
              </span>

              {leadTraveller.age ? (
                <span style={leadPillStyle}>{leadTraveller.age} yrs</span>
              ) : null}

              <span style={leadPillStyle}>Primary Booking Contact</span>

              {contactDetails?.mobile ? (
                <span style={leadPillStyle}>
                  {contactDetails.countryCode || "+91"} {contactDetails.mobile}
                </span>
              ) : null}
            </div>
          </div>
        ) : null}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "16px",
          }}
        >
          <div
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: "18px",
              background: "#ffffff",
              padding: "16px",
              boxShadow: "0 3px 10px rgba(15,23,42,0.03)",
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
              Passenger Ticket List
            </div>

            <div style={{ display: "grid", gap: "12px" }}>
              {travellers.length > 0 ? (
                travellers.map((traveller, index) => (
                  <div
                    key={traveller.id || index}
                    style={{
                      border: "1px solid #e5e7eb",
                      borderRadius: "16px",
                      padding: "14px 16px",
                      background:
                        index === 0
                          ? "linear-gradient(135deg, #f8fbff 0%, #ffffff 100%)"
                          : "#f9fafb",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: "14px",
                      flexWrap: "wrap",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "14px",
                        minWidth: 0,
                        flex: 1,
                      }}
                    >
                      <div
                        style={{
                          width: "52px",
                          height: "52px",
                          borderRadius: "14px",
                          background: index === 0 ? "#dbeafe" : "#eef2ff",
                          color: index === 0 ? "#1d4ed8" : "#4338ca",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "18px",
                          fontWeight: 900,
                          flexShrink: 0,
                          border:
                            index === 0
                              ? "1px solid #bfdbfe"
                              : "1px solid #c7d2fe",
                        }}
                      >
                        {traveller.seatNumber || index + 1}
                      </div>

                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div
                          style={{
                            fontSize: "15px",
                            fontWeight: 900,
                            color: "#111827",
                            lineHeight: "22px",
                            wordBreak: "break-word",
                          }}
                        >
                          {getFullName(traveller)}
                        </div>

                        <div
                          style={{
                            marginTop: "6px",
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "8px",
                          }}
                        >
                          <span style={travellerMetaPill}>
                            {getGenderText(traveller.gender)}
                          </span>

                          {traveller.age ? (
                            <span style={travellerMetaPill}>
                              {traveller.age} yrs
                            </span>
                          ) : null}

                          {traveller.coach ? (
                            <span style={travellerMetaPill}>
                              Coach {traveller.coach}
                            </span>
                          ) : null}

                          {traveller.berth ? (
                            <span style={travellerMetaPill}>
                              {traveller.berth}
                            </span>
                          ) : null}

                          {index === 0 ? (
                            <span style={leadBadgeStyle}>Lead Passenger</span>
                          ) : null}
                        </div>

                        <div
                          style={{
                            marginTop: "10px",
                            border: "1px dashed #dbe4ee",
                            borderRadius: "12px",
                            background: "#ffffff",
                            padding: "10px 12px",
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(92px, 1fr))",
                            gap: "8px 12px",
                          }}
                        >
                          <TicketMini label="Seat" value={traveller.seatNumber || "NA"} />
                          <TicketMini label="Coach" value={traveller.coach || coachClass || "NA"} />
                          <TicketMini label="Quota" value={traveller.quota || "General"} />
                          <TicketMini
                            label="Status"
                            value={traveller.status || "Confirmed"}
                          />
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        fontSize: "11px",
                        fontWeight: 900,
                        color: "#16a34a",
                        whiteSpace: "nowrap",
                      }}
                    >
                      CONFIRMED
                    </div>
                  </div>
                ))
              ) : (
                <div style={emptyTextStyle}>No passenger data available</div>
              )}
            </div>
          </div>

          <div style={{ display: "grid", gap: "16px" }}>
            <InfoCard
              title="Contact Details"
              rows={[
                {
                  label: "Email",
                  value: contactDetails?.email || "Not provided",
                },
                {
                  label: "Mobile",
                  value: contactDetails?.mobile
                    ? `${contactDetails?.countryCode || "+91"} ${contactDetails.mobile}`
                    : "Not provided",
                },
              ]}
            />

            <InfoCard
              title="Ticket Snapshot"
              rows={[
                {
                  label: "PNR Number",
                  value: pnrNumber || "Not available",
                },
                {
                  label: "Train Number",
                  value: trainNumber || "Not available",
                },
                {
                  label: "Coach/Class",
                  value: coachClass || "Not available",
                },
                {
                  label: "Passengers",
                  value: `${travellers.length || 0}`,
                },
              ]}
            />
          </div>
        </div>
        </div>
      </div>
    </section>
  );
}

function MobileBadge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-[#e5e7eb] bg-white px-2.5 py-1 text-[11px] font-black text-[#475569]">
      {children}
    </span>
  );
}

function MobileTicketRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-2xl border border-[#e5e7eb] bg-white px-3 py-2.5">
      <div className="text-[10px] font-black uppercase tracking-[0.12em] text-[#64748b]">
        {label}
      </div>
      <div className="mt-1 break-words text-[12px] font-black leading-4 text-[#111827]">
        {value}
      </div>
    </div>
  );
}

function MobileInfoPanel({
  title,
  rows,
}: {
  title: string;
  rows: { label: string; value: string }[];
}) {
  return (
    <div className="rounded-[18px] border border-[#e5e7eb] bg-white p-4 shadow-[0_6px_18px_rgba(15,23,42,0.04)]">
      <div className="text-[15px] font-black text-[#111827]">{title}</div>
      <div className="mt-3 grid gap-2">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex min-w-0 items-start justify-between gap-3 rounded-2xl bg-[#f8fafc] px-3 py-2.5"
          >
            <div className="text-[12px] font-bold text-[#64748b]">{row.label}</div>
            <div className="min-w-0 break-words text-right text-[12px] font-black leading-4 text-[#111827]">
              {row.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TicketMini({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <div
        style={{
          fontSize: "10px",
          fontWeight: 800,
          color: "#64748b",
          textTransform: "uppercase",
          letterSpacing: "0.4px",
          marginBottom: "4px",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: "12px",
          fontWeight: 900,
          color: "#111827",
          lineHeight: "18px",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function InfoCard({
  title,
  rows,
}: {
  title: string;
  rows: { label: string; value: string }[];
}) {
  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: "18px",
        background: "#ffffff",
        padding: "16px",
        boxShadow: "0 3px 10px rgba(15,23,42,0.03)",
      }}
    >
      <div
        style={{
          fontSize: "15px",
          fontWeight: 900,
          color: "#111827",
          marginBottom: "12px",
        }}
      >
        {title}
      </div>

      <div style={{ display: "grid", gap: "12px" }}>
        {rows.map((row, index) => (
          <div
            key={`${row.label}-${index}`}
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "12px",
              alignItems: "flex-start",
              borderTop: index === 0 ? "none" : "1px dashed #e5e7eb",
              paddingTop: index === 0 ? 0 : "12px",
            }}
          >
            <div
              style={{
                fontSize: "13px",
                fontWeight: 800,
                color: "#64748b",
                minWidth: "110px",
                maxWidth: "45%",
              }}
            >
              {row.label}
            </div>

            <div
              style={{
                fontSize: "13px",
                fontWeight: 700,
                color: "#1f2937",
                lineHeight: "20px",
                textAlign: "right",
                wordBreak: "break-word",
                minWidth: 0,
              }}
            >
              {row.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const emptyTextStyle: CSSProperties = {
  fontSize: "14px",
  color: "#6b7280",
  fontWeight: 600,
};

const leadPillStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  padding: "8px 12px",
  borderRadius: "999px",
  background: "#ffffff",
  border: "1px solid #dbeafe",
  color: "#1e40af",
  fontSize: "12px",
  fontWeight: 800,
};

const travellerMetaPill: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  padding: "6px 10px",
  borderRadius: "999px",
  background: "#ffffff",
  border: "1px solid #e5e7eb",
  color: "#475569",
  fontSize: "11px",
  fontWeight: 800,
};

const leadBadgeStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  padding: "6px 10px",
  borderRadius: "999px",
  background: "#dbeafe",
  border: "1px solid #bfdbfe",
  color: "#1d4ed8",
  fontSize: "11px",
  fontWeight: 900,
};
