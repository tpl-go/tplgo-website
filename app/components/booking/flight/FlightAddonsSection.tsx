"use client";

import { useMemo, useState } from "react";

type AddonStatus = "pending" | "selected" | "skipped";

type AddonItem = {
  key: string;
  title: string;
  subtitle: string;
  price: number;
};

type AddonsPayload = {
  addonsStatus: AddonStatus;
  addonsLabel: string;
  addonsPrice: number;
  selectedItems: string[];
};

type Props = {
  isEnabled: boolean;
  onChange?: (payload: AddonsPayload) => void;
};

const ADDON_OPTIONS: AddonItem[] = [
  {
    key: "baggage",
    title: "Extra Baggage",
    subtitle: "Pre-book additional baggage for convenience.",
    price: 1200,
  },
  {
    key: "priority",
    title: "Priority Check-in",
    subtitle: "Get quicker airport processing and convenience.",
    price: 699,
  },
  {
    key: "assistance",
    title: "Travel Assistance",
    subtitle: "Add support services for smoother travel.",
    price: 499,
  },
  {
    key: "flexi",
    title: "Flexi Protection",
    subtitle: "Extra flexibility on changes and support.",
    price: 999,
  },
];

export default function FlightAddonsSection({
  isEnabled,
  onChange,
}: Props) {
  const [isOpen, setIsOpen] = useState(true);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [addonsStatus, setAddonsStatus] = useState<AddonStatus>("pending");

  const selectedAddonDetails = useMemo(() => {
    return ADDON_OPTIONS.filter((item) => selectedItems.includes(item.key));
  }, [selectedItems]);

  const addonsTotal = useMemo(() => {
    return selectedAddonDetails.reduce((sum, item) => sum + item.price, 0);
  }, [selectedAddonDetails]);

  const addonsSummaryText =
    addonsStatus === "selected" && selectedAddonDetails.length > 0
      ? `Selected: ${selectedAddonDetails.map((item) => item.title).join(", ")}`
      : addonsStatus === "skipped"
      ? "Add-ons skipped"
      : "No add-on selected";

  const pushChange = (
    nextSelectedItems: string[],
    nextStatus: AddonStatus
  ) => {
    const selectedTitles = ADDON_OPTIONS.filter((item) =>
      nextSelectedItems.includes(item.key)
    ).map((item) => item.title);

    const nextPrice = ADDON_OPTIONS.filter((item) =>
      nextSelectedItems.includes(item.key)
    ).reduce((sum, item) => sum + item.price, 0);

    onChange?.({
      addonsStatus: nextStatus,
      addonsLabel:
        nextStatus === "skipped"
          ? "Add-ons skipped"
          : selectedTitles.length > 0
          ? selectedTitles.join(", ")
          : "No add-on selected",
      addonsPrice: nextStatus === "selected" ? nextPrice : 0,
      selectedItems: nextSelectedItems,
    });
  };

  const toggleItem = (itemKey: string) => {
    const updated = selectedItems.includes(itemKey)
      ? selectedItems.filter((x) => x !== itemKey)
      : [...selectedItems, itemKey];

    const nextStatus = updated.length > 0 ? "selected" : "pending";

    setSelectedItems(updated);
    setAddonsStatus(nextStatus);
    pushChange(updated, nextStatus);
  };

  const handleSkip = () => {
    setSelectedItems([]);
    setAddonsStatus("skipped");
    pushChange([], "skipped");
  };

  return (
    <section id="addons">
      <div
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
            Addons
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
          style={{
            padding: "18px",
            background: "#ffffff",
            borderTop: "1px solid #e5e7eb",
          }}
        >
          {!isEnabled ? (
            <div style={lockedBoxStyle}>
              <div style={{ fontSize: "18px", fontWeight: 800, color: "#111827" }}>
                Add-ons locked
              </div>
              <div
                style={{
                  marginTop: "8px",
                  fontSize: "14px",
                  color: "#6b7280",
                  lineHeight: "22px",
                }}
              >
                Please complete Travel Insurance first to continue with add-ons.
              </div>
            </div>
          ) : (
            <div style={cardStyle}>
              <div style={{ fontSize: "18px", fontWeight: 800, color: "#111827" }}>
                Add more comfort
              </div>

              <div
                style={{
                  marginTop: "8px",
                  fontSize: "14px",
                  color: "#4b5563",
                  lineHeight: "22px",
                }}
              >
                {addonsSummaryText}
              </div>

              <div
                style={{
                  marginTop: "14px",
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "14px",
                }}
              >
                {ADDON_OPTIONS.map((item) => (
                  <AddonCard
                    key={item.key}
                    title={item.title}
                    subtitle={item.subtitle}
                    price={item.price}
                    checked={selectedItems.includes(item.key)}
                    onToggle={() => toggleItem(item.key)}
                  />
                ))}
              </div>

              <div
                style={{
                  marginTop: "18px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "12px",
                  flexWrap: "wrap",
                }}
              >
                <div
                  style={{
                    fontSize: "16px",
                    fontWeight: 800,
                    color: "#111827",
                  }}
                >
                  Add-ons Total: ₹{addonsTotal.toLocaleString("en-IN")}
                </div>

                <button
                  type="button"
                  onClick={handleSkip}
                  style={skipBtnStyle(addonsStatus === "skipped")}
                >
                  {addonsStatus === "skipped" ? "Add-ons Skipped ✓" : "Skip Add-ons"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function AddonCard({
  title,
  subtitle,
  price,
  checked,
  onToggle,
}: {
  title: string;
  subtitle: string;
  price: number;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      style={{
        border: checked ? "2px solid #38bdf8" : "1px solid #d9e2ec",
        background: checked ? "#eef8ff" : "#ffffff",
        padding: "16px",
        minHeight: "140px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "start",
          justifyContent: "space-between",
          gap: "12px",
        }}
      >
        <div>
          <div style={{ fontSize: "17px", fontWeight: 800, color: "#111827" }}>
            {title}
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
              marginTop: "12px",
              fontSize: "16px",
              fontWeight: 800,
              color: "#111827",
            }}
          >
            ₹{price.toLocaleString("en-IN")}
          </div>
        </div>

        <input type="checkbox" checked={checked} onChange={onToggle} />
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

function skipBtnStyle(active: boolean): React.CSSProperties {
  return {
    height: "42px",
    padding: "0 16px",
    border: active ? "2px solid #38bdf8" : "1px solid #d1d5db",
    background: active ? "#e0f2fe" : "#ffffff",
    borderRadius: "8px",
    fontWeight: 700,
    cursor: "pointer",
    color: active ? "#0369a1" : "#111827",
  };
}