"use client";

type PackageConfirmationCancellationCardProps = {
  travelDate?: string;
  exclusions?: string[];
  bookingDate?: string;
};

type PolicyPoint = {
  title: string;
  subtext?: string;
};

function formatDateLabel(value?: string) {
  if (!value) return "Date not available";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;

  return parsed.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
  });
}

function getCutoffDate(travelDate?: string, daysBefore = 15) {
  if (!travelDate) return null;

  const parsed = new Date(travelDate);
  if (Number.isNaN(parsed.getTime())) return null;

  parsed.setDate(parsed.getDate() - daysBefore);
  return parsed;
}

function formatCutoffText(travelDate?: string) {
  const cutoff = getCutoffDate(travelDate, 15);
  if (!cutoff) return "15 days before travel";

  return cutoff.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
  });
}

export default function PackageConfirmationCancellationCard({
  travelDate,
  exclusions = [],
}: PackageConfirmationCancellationCardProps) {
  const cutoffText = formatCutoffText(travelDate);

  const cancellationNotes: PolicyPoint[] = [
    {
      title:
        "Package cancellation before the cutoff date is eligible for 100% refund excluding flight components.",
    },
    {
      title:
        "Within 15 days of travel date, the package becomes non-refundable for land components as well.",
    },
    {
      title:
        "Flight refund will always be applicable only as per airline / fare rule / flight policy.",
    },
    {
      title:
        "If package components are modified, upgraded or reissued, the cancellation outcome may change accordingly.",
    },
    {
      title:
        "Taxes, supplier deductions or processing cuts may apply wherever operationally relevant.",
    },
  ];

  const dateChangeNotes: PolicyPoint[] = [
    {
      title:
        "Date change depends on component availability on the newly requested date.",
    },
    {
      title:
        "Fare difference for flights / hotels / services on revised date will be charged extra wherever applicable.",
    },
    {
      title:
        "Flight date change will be governed separately by airline fare rules and amendment policy.",
    },
    {
      title:
        "After the cutoff date, date change may not be possible for confirmed package inventory.",
    },
  ];

  return (
    <section
      style={{
        border: "1px solid #d9e2ec",
        background: "#ffffff",
        borderRadius: "20px",
        overflow: "hidden",
        boxShadow: "0 2px 10px rgba(15,23,42,0.05)",
      }}
    >
      <div
        style={{
          padding: "18px 20px",
          borderBottom: "1px solid #e5e7eb",
          background:
            "linear-gradient(90deg, #eef6ff 0%, #ffffff 55%, #fff7ed 100%)",
        }}
      >
        <div
          style={{
            fontSize: "20px",
            fontWeight: 900,
            color: "#111827",
          }}
        >
          Cancellation & Date Change Policy
        </div>

        <div
          style={{
            marginTop: "6px",
            fontSize: "13px",
            color: "#6b7280",
            fontWeight: 500,
          }}
        >
          Final confirmed policy snapshot for this booking
        </div>
      </div>

      <div
        style={{
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          gap: "28px",
        }}
      >
        <PolicyBlock
          title="Package Cancellation Policy"
          subtitleTop={`Cancellation before ${cutoffText}*`}
          subtitleBottom="100% refund on package land components. Flight refund only as per flight policy."
          leftTitle={`Till ${cutoffText}`}
          leftSub="100% refund except flight component"
          rightTitle={`After ${cutoffText}`}
          rightSub="Zero refund on package land components"
          notes={cancellationNotes}
        />

        <PolicyBlock
          title="Package Date Change Policy"
          subtitleTop={`Date change request before ${cutoffText}*`}
          subtitleBottom="Subject to availability, repricing and flight amendment rules."
          leftTitle={`Till ${cutoffText}`}
          leftSub="Date change possible with applicable fare / policy difference"
          rightTitle={`After ${cutoffText}`}
          rightSub="Date change may not be possible"
          notes={dateChangeNotes}
        />

        {exclusions.length > 0 ? (
          <div
            style={{
              border: "1px solid #f3d7c7",
              borderRadius: "18px",
              background: "#fffaf3",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "14px 16px",
                borderBottom: "1px solid #f3d7c7",
                background: "#fff3df",
                fontSize: "15px",
                fontWeight: 800,
                color: "#111827",
              }}
            >
              Booking Exclusions / Notes
            </div>

            <div style={{ padding: "16px" }}>
              {exclusions.map((item, index) => (
                <div
                  key={`${item}-${index}`}
                  style={{
                    display: "flex",
                    gap: "12px",
                    alignItems: "flex-start",
                    marginBottom: index === exclusions.length - 1 ? 0 : "12px",
                  }}
                >
                  <span
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "999px",
                      background: "#b45309",
                      marginTop: "7px",
                      flexShrink: 0,
                    }}
                  />

                  <div
                    style={{
                      fontSize: "14px",
                      lineHeight: "22px",
                      color: "#4b5563",
                      fontWeight: 500,
                    }}
                  >
                    {item}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function PolicyBlock({
  title,
  subtitleTop,
  subtitleBottom,
  leftTitle,
  leftSub,
  rightTitle,
  rightSub,
  notes,
}: {
  title: string;
  subtitleTop: string;
  subtitleBottom: string;
  leftTitle: string;
  leftSub: string;
  rightTitle: string;
  rightSub: string;
  notes: PolicyPoint[];
}) {
  return (
    <div>
      <h4
        style={{
          margin: 0,
          fontSize: "18px",
          fontWeight: 800,
          color: "#1f2937",
        }}
      >
        {title}
      </h4>

      <div
        style={{
          marginTop: "8px",
          fontSize: "14px",
          lineHeight: "22px",
        }}
      >
        <div
          style={{
            color: "#3b7f45",
            fontWeight: 700,
          }}
        >
          {subtitleTop}
        </div>

        <div
          style={{
            color: "#6b7280",
            fontWeight: 500,
          }}
        >
          {subtitleBottom}
        </div>
      </div>

      <div style={{ marginTop: "18px" }}>
        <div
          style={{
            position: "relative",
            height: "24px",
            marginBottom: "16px",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: "10px",
              height: "6px",
              borderRadius: "999px",
              background:
                "linear-gradient(to right, #9ad38c 0%, #c7ddb6 46%, #f1d8d2 54%, #eaa7a1 100%)",
            }}
          />

          <span
            style={{
              position: "absolute",
              left: "8px",
              top: "2px",
              width: "18px",
              height: "18px",
              borderRadius: "999px",
              background: "#5fa15c",
              color: "#ffffff",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "12px",
              fontWeight: 800,
              boxShadow: "0 0 0 3px #ffffff",
            }}
          >
            ✓
          </span>

          <span
            style={{
              position: "absolute",
              right: "130px",
              top: "2px",
              width: "18px",
              height: "18px",
              borderRadius: "999px",
              background: "#b96b61",
              color: "#ffffff",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "12px",
              fontWeight: 800,
              boxShadow: "0 0 0 3px #ffffff",
            }}
          >
            ×
          </span>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "30px",
            alignItems: "flex-start",
            flexWrap: "wrap",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "18px",
                fontWeight: 800,
                color: "#2f5f67",
              }}
            >
              {leftTitle}
            </div>
            <div
              style={{
                marginTop: "4px",
                fontSize: "14px",
                color: "#6b7280",
                fontWeight: 500,
              }}
            >
              {leftSub}
            </div>
          </div>

          <div style={{ textAlign: "right" }}>
            <div
              style={{
                fontSize: "18px",
                fontWeight: 800,
                color: "#7c3f39",
              }}
            >
              {rightTitle}
            </div>
            <div
              style={{
                marginTop: "4px",
                fontSize: "14px",
                color: "#6b7280",
                fontWeight: 500,
              }}
            >
              {rightSub}
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          marginTop: "22px",
          background: "#f9fafb",
          padding: "18px 16px",
          borderRadius: "16px",
        }}
      >
        {notes.map((note, index) => (
          <div
            key={`${note.title}-${index}`}
            style={{
              display: "flex",
              gap: "12px",
              alignItems: "flex-start",
              marginBottom: index === notes.length - 1 ? 0 : "16px",
            }}
          >
            <span
              style={{
                width: "9px",
                height: "9px",
                borderRadius: "999px",
                background: "#4f7b45",
                marginTop: "7px",
                flexShrink: 0,
              }}
            />

            <div
              style={{
                fontSize: "14px",
                lineHeight: "22px",
                color: "#4b5563",
                fontWeight: 500,
              }}
            >
              {note.title}
              {note.subtext ? ` ${note.subtext}` : ""}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}