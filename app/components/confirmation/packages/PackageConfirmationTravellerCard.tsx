"use client";

type TravellerItem = {
  id?: string;
  travellerType?: "adult" | "child";
  label?: string;
  firstName?: string;
  lastName?: string;
  gender?: string;
  roomLabel?: string;
  fullName?: string;
};

type ContactDetails = {
  countryCode?: string;
  mobile?: string;
  email?: string;
};

type GstDetails = {
  hasGst?: boolean;
  state?: string;
  saveBillingToProfile?: boolean;
};

type LeadTraveller = {
  name?: string;
  email?: string;
  mobile?: string;
};

type Props = {
  leadTraveller?: LeadTraveller | null;
  travellers?: TravellerItem[];
  contactDetails?: ContactDetails;
  gstDetails?: GstDetails;
};

function getTravellerName(item: TravellerItem) {
  const fullName = item?.fullName?.trim();
  if (fullName) return fullName;

  const first = item?.firstName?.trim() || "";
  const last = item?.lastName?.trim() || "";
  const merged = `${first} ${last}`.trim();

  if (merged) return merged;
  return item?.label || "Traveller";
}

function getTravellerTypeLabel(item: TravellerItem) {
  if (item?.travellerType === "child") return "Child";
  if (item?.travellerType === "adult") return "Adult";
  return "Traveller";
}

function getGenderLabel(value?: string) {
  if (!value) return "Not specified";
  return value;
}

function getMobileLabel(contactDetails?: ContactDetails, leadTraveller?: LeadTraveller | null) {
  const mobile =
    contactDetails?.mobile?.trim() || leadTraveller?.mobile?.trim() || "";
  const code = contactDetails?.countryCode?.trim() || "+91";

  if (!mobile) return "Not available";
  if (mobile.startsWith("+")) return mobile;

  return `${code} ${mobile}`;
}

function getEmailLabel(contactDetails?: ContactDetails, leadTraveller?: LeadTraveller | null) {
  return (
    contactDetails?.email?.trim() ||
    leadTraveller?.email?.trim() ||
    "Not available"
  );
}

export default function PackageConfirmationTravellerCard({
  leadTraveller,
  travellers = [],
  contactDetails,
  gstDetails,
}: Props) {
  const hasTravellers = Array.isArray(travellers) && travellers.length > 0;

  return (
    <section
      style={{
        border: "1px solid #d9e2ec",
        borderRadius: "22px",
        overflow: "hidden",
        background: "#ffffff",
        boxShadow: "0 10px 28px rgba(15,23,42,0.06)",
      }}
    >
      <div
        style={{
          padding: "18px 20px",
          borderBottom: "1px solid #e5e7eb",
          background: "linear-gradient(90deg, #f8fbff 0%, #ffffff 100%)",
        }}
      >
        <div
          style={{
            fontSize: "22px",
            fontWeight: 900,
            color: "#111827",
            lineHeight: "30px",
          }}
        >
          Traveller Details
        </div>

        <div
          style={{
            marginTop: "6px",
            fontSize: "14px",
            color: "#6b7280",
            lineHeight: "22px",
            fontWeight: 500,
          }}
        >
          Lead traveller, passenger details, contact info and GST snapshot.
        </div>
      </div>

      <div style={{ padding: "20px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.2fr 0.8fr",
            gap: "18px",
            alignItems: "start",
          }}
        >
          <div>
            <div
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: "18px",
                overflow: "hidden",
                background: "#ffffff",
              }}
            >
              <div
                style={{
                  padding: "14px 16px",
                  borderBottom: "1px solid #eef2f7",
                  background: "#f9fbff",
                  fontSize: "16px",
                  fontWeight: 800,
                  color: "#111827",
                }}
              >
                Passenger List
              </div>

              <div style={{ padding: "14px" }}>
                {hasTravellers ? (
                  <div style={{ display: "grid", gap: "12px" }}>
                    {travellers.map((item, index) => (
                      <div
                        key={item?.id || `${getTravellerName(item)}-${index}`}
                        style={{
                          border: "1px solid #e5e7eb",
                          borderRadius: "16px",
                          padding: "14px 14px 12px 14px",
                          background: "#fcfcfd",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            gap: "12px",
                            alignItems: "start",
                            flexWrap: "wrap",
                          }}
                        >
                          <div>
                            <div
                              style={{
                                fontSize: "16px",
                                fontWeight: 800,
                                color: "#111827",
                              }}
                            >
                              {getTravellerName(item)}
                            </div>

                            <div
                              style={{
                                marginTop: "6px",
                                display: "flex",
                                flexWrap: "wrap",
                                gap: "8px",
                              }}
                            >
                              <span style={pillStyle}>
                                {getTravellerTypeLabel(item)}
                              </span>

                              <span style={pillStyle}>
                                {getGenderLabel(item?.gender)}
                              </span>

                              {item?.roomLabel ? (
                                <span style={pillStyle}>{item.roomLabel}</span>
                              ) : null}
                            </div>
                          </div>

                          <div
                            style={{
                              fontSize: "12px",
                              fontWeight: 800,
                              color: "#64748b",
                              background: "#eef6ff",
                              border: "1px solid #dbeafe",
                              borderRadius: "999px",
                              padding: "7px 10px",
                            }}
                          >
                            Traveller {index + 1}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    style={{
                      border: "1px dashed #cbd5e1",
                      borderRadius: "16px",
                      padding: "18px",
                      background: "#fcfcfd",
                      fontSize: "14px",
                      fontWeight: 600,
                      color: "#6b7280",
                    }}
                  >
                    Traveller details not available.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gap: "16px" }}>
            <div
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: "18px",
                overflow: "hidden",
                background: "#ffffff",
              }}
            >
              <div
                style={{
                  padding: "14px 16px",
                  borderBottom: "1px solid #eef2f7",
                  background: "#f9fbff",
                  fontSize: "16px",
                  fontWeight: 800,
                  color: "#111827",
                }}
              >
                Lead Traveller
              </div>

              <div style={{ padding: "16px", display: "grid", gap: "14px" }}>
                <InfoBlock
                  label="Name"
                  value={leadTraveller?.name?.trim() || "Not available"}
                />
                <InfoBlock
                  label="Mobile"
                  value={getMobileLabel(contactDetails, leadTraveller)}
                />
                <InfoBlock
                  label="Email"
                  value={getEmailLabel(contactDetails, leadTraveller)}
                />
              </div>
            </div>

            <div
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: "18px",
                overflow: "hidden",
                background: "#ffffff",
              }}
            >
              <div
                style={{
                  padding: "14px 16px",
                  borderBottom: "1px solid #eef2f7",
                  background: "#f9fbff",
                  fontSize: "16px",
                  fontWeight: 800,
                  color: "#111827",
                }}
              >
                GST Snapshot
              </div>

              <div style={{ padding: "16px", display: "grid", gap: "14px" }}>
                <InfoBlock
                  label="GST Requested"
                  value={gstDetails?.hasGst ? "Yes" : "No"}
                />
                <InfoBlock
                  label="State"
                  value={gstDetails?.state?.trim() || "Not provided"}
                />
                <InfoBlock
                  label="Save Billing Profile"
                  value={gstDetails?.saveBillingToProfile ? "Yes" : "No"}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function InfoBlock({
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
          fontSize: "12px",
          fontWeight: 800,
          color: "#64748b",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
        }}
      >
        {label}
      </div>

      <div
        style={{
          marginTop: "6px",
          fontSize: "15px",
          lineHeight: "23px",
          fontWeight: 700,
          color: "#111827",
          wordBreak: "break-word",
        }}
      >
        {value}
      </div>
    </div>
  );
}

const pillStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  padding: "6px 10px",
  borderRadius: "999px",
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  color: "#334155",
  fontSize: "12px",
  fontWeight: 800,
};