"use client";

type AddOnData = {
  isInternationalTrip?: boolean;
  insuranceSelected?: boolean;
  insuranceAmount?: number;
  [key: string]: any;
} | null;

type Props = {
  addOn?: AddOnData;
  totalTravellers?: number;
};

function formatCurrency(value?: number) {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
}

export default function PackageConfirmationAddOnCard({
  addOn,
  totalTravellers = 1,
}: Props) {
  const insuranceSelected = Boolean(addOn?.insuranceSelected);
  const insuranceAmount = Number(addOn?.insuranceAmount || 0);
  const isInternationalTrip = Boolean(addOn?.isInternationalTrip);

  const hasAnyAddOn = insuranceSelected || isInternationalTrip;

  return (
    <section
      className="pkg-confirm-addon"
      style={{
        border: "1px solid #d9e2ec",
        borderRadius: "22px",
        overflow: "hidden",
        background: "#ffffff",
        boxShadow: "0 10px 28px rgba(15,23,42,0.06)",
      }}
    >
      <div
        className="pkg-confirm-card-head"
        style={{
          padding: "18px 20px",
          borderBottom: "1px solid #e5e7eb",
          background: "linear-gradient(90deg, #fffaf5 0%, #ffffff 100%)",
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
          Add-ons & Protection
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
          Selected protection, trip type and extra booking support items.
        </div>
      </div>

      <div className="pkg-confirm-card-body" style={{ padding: "20px" }}>
        {hasAnyAddOn ? (
          <div
            className="pkg-confirm-addon-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: "16px",
            }}
          >
            <div
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: "18px",
                padding: "16px",
                background: "#fcfcfd",
              }}
            >
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: 800,
                  color: "#64748b",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Trip Category
              </div>

              <div
                style={{
                  marginTop: "8px",
                  fontSize: "16px",
                  fontWeight: 800,
                  color: "#111827",
                }}
              >
                {isInternationalTrip ? "International Package" : "Domestic Package"}
              </div>

              <div
                style={{
                  marginTop: "6px",
                  fontSize: "14px",
                  lineHeight: "22px",
                  color: "#6b7280",
                  fontWeight: 500,
                }}
              >
                Booking category carried forward from the traveller and package flow.
              </div>
            </div>

            <div
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: "18px",
                padding: "16px",
                background: insuranceSelected ? "#effcf6" : "#fcfcfd",
              }}
            >
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: 800,
                  color: "#64748b",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Travel Insurance
              </div>

              <div
                style={{
                  marginTop: "8px",
                  fontSize: "16px",
                  fontWeight: 800,
                  color: "#111827",
                }}
              >
                {insuranceSelected ? "Selected" : "Not Selected"}
              </div>

              <div
                style={{
                  marginTop: "6px",
                  fontSize: "14px",
                  lineHeight: "22px",
                  color: "#6b7280",
                  fontWeight: 500,
                }}
              >
                {insuranceSelected
                  ? `${formatCurrency(insuranceAmount)} total insurance added for ${totalTravellers} traveller${totalTravellers > 1 ? "s" : ""}.`
                  : "No insurance amount was added in this booking."}
              </div>
            </div>
          </div>
        ) : (
          <div
            style={{
              border: "1px dashed #cbd5e1",
              borderRadius: "18px",
              padding: "18px",
              background: "#fcfcfd",
              fontSize: "14px",
              fontWeight: 600,
              color: "#6b7280",
            }}
          >
            No additional add-ons were selected for this package booking.
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 767px) {
          .pkg-confirm-addon {
            border-radius: 18px !important;
          }

          .pkg-confirm-card-head,
          .pkg-confirm-card-body {
            padding: 16px !important;
          }

          .pkg-confirm-addon-grid {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
          }
        }
      `}</style>
    </section>
  );
}
