"use client";

import { useMemo, useState } from "react";

interface PolicyPoint {
  title: string;
  subtext: string;
}

interface BookingCancellationSectionProps {
  initiallyOpen?: boolean;
  travelDate?: string;
}

function formatDateLabel(date: Date) {
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
  });
}

function isValidDate(value?: string) {
  if (!value) return false;
  const parsed = new Date(value);
  return !Number.isNaN(parsed.getTime());
}

function getCutoffDate(travelDate?: string) {
  if (!isValidDate(travelDate)) return null;

  const travel = new Date(travelDate as string);
  travel.setHours(0, 0, 0, 0);

  const cutoff = new Date(travel);
  cutoff.setDate(cutoff.getDate() - 15);
  cutoff.setHours(0, 0, 0, 0);

  return cutoff;
}

export default function BookingCancellationSection({
  initiallyOpen = false,
  travelDate,
}: BookingCancellationSectionProps) {
  const [isOpen, setIsOpen] = useState(initiallyOpen);

  const dynamicData = useMemo(() => {
    const cutoffDate = getCutoffDate(travelDate);

    const cutoffLabel = cutoffDate ? formatDateLabel(cutoffDate) : "Cutoff Date";
    const travelLabel =
      travelDate && isValidDate(travelDate)
        ? formatDateLabel(new Date(travelDate))
        : "Travel Date";

    const cancellationNotes: PolicyPoint[] = [
      {
        title:
          "Till the cutoff date, package components excluding flight are 100% refundable.",
        subtext: "",
      },
      {
        title:
          "Flight refund will be applicable only as per airline / flight policy and fare rules.",
        subtext: "",
      },
      {
        title:
          "After the cutoff date, package amount becomes non-refundable except any refund allowed separately under the flight policy.",
        subtext: "",
      },
      {
        title:
          "Please note, TCS once collected cannot be refunded in case of any cancellation / modification. You can claim the TCS amount as adjustment against Income Tax payable at the time of filing the return of income.",
        subtext: "",
      },
      {
        title:
          "Cancellation charges shown are exclusive of applicable taxes, and taxes will be added wherever applicable.",
        subtext: "",
      },
    ];

    const dateChangeNotes: PolicyPoint[] = [
      {
        title:
          "Till the cutoff date, date change request may be considered subject to package and component availability.",
        subtext: "",
      },
      {
        title:
          "Flight date change / reissue will always be charged as per airline policy, fare rule and seat availability.",
        subtext: "",
      },
      {
        title:
          "Any fare difference in package components on the new requested date will be charged separately.",
        subtext: "",
      },
      {
        title:
          "After the cutoff date, package date change is not allowed.",
        subtext: "",
      },
      {
        title:
          "Please note, TCS once collected cannot be refunded in case of any cancellation / modification. You can claim the TCS amount as adjustment against Income Tax payable at the time of filing the return of income.",
        subtext: "",
      },
    ];

    return {
      cancellation: {
        subtitleTop: `Cancellation possible till ${cutoffLabel}.*`,
        subtitleBottom: `After that, package amount is non-refundable. Flight refund will be as per flight policy.`,
        leftTitle: `Till ${cutoffLabel}`,
        leftSub: "100% Refund (Flight excluded)",
        rightTitle: `After ${cutoffLabel}`,
        rightSub: "Zero Refund (Flight policy separate)",
        notes: cancellationNotes,
      },
      dateChange: {
        subtitleTop: `Date change possible till ${cutoffLabel}.*`,
        subtitleBottom: `After that, package date cannot be changed. Flight change will be as per flight policy.`,
        leftTitle: `Till ${cutoffLabel}`,
        leftSub: "Date change allowed (fare difference extra)",
        rightTitle: `After ${cutoffLabel}`,
        rightSub: "Date cannot be changed",
        notes: dateChangeNotes,
      },
      travelLabel,
    };
  }, [travelDate]);

  return (
    <section id="cancellation-policy">
      <div
        onClick={() => setIsOpen((prev) => !prev)}
        style={{
          minHeight: "58px",
          padding: "0 18px",
          borderTop: "1px solid #d9e2ec",
          borderBottom: "1px solid #d9e2ec",
          background: "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
          cursor: "pointer",
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: "18px",
            fontWeight: 800,
            color: "#1f2937",
          }}
        >
          4. Cancellation &amp; Date Change
        </h3>

        <span
          style={{
            fontSize: "18px",
            color: "#55a8d8",
            fontWeight: 700,
            lineHeight: 1,
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
            background: "#ffffff",
            borderBottom: "1px solid #d9e2ec",
            padding: "22px 18px 20px 18px",
          }}
        >
          <PolicyBlock
            title="Package Cancellation Policy"
            subtitleTop={dynamicData.cancellation.subtitleTop}
            subtitleBottom={dynamicData.cancellation.subtitleBottom}
            leftTitle={dynamicData.cancellation.leftTitle}
            leftSub={dynamicData.cancellation.leftSub}
            rightTitle={dynamicData.cancellation.rightTitle}
            rightSub={dynamicData.cancellation.rightSub}
            notes={dynamicData.cancellation.notes}
          />

          <div style={{ marginTop: "34px" }}>
            <PolicyBlock
              title="Package Date Change Policy"
              subtitleTop={dynamicData.dateChange.subtitleTop}
              subtitleBottom={dynamicData.dateChange.subtitleBottom}
              leftTitle={dynamicData.dateChange.leftTitle}
              leftSub={dynamicData.dateChange.leftSub}
              rightTitle={dynamicData.dateChange.rightTitle}
              rightSub={dynamicData.dateChange.rightSub}
              notes={dynamicData.dateChange.notes}
            />
          </div>
        </div>
      )}
    </section>
  );
}

interface PolicyBlockProps {
  title: string;
  subtitleTop: string;
  subtitleBottom: string;
  leftTitle: string;
  leftSub: string;
  rightTitle: string;
  rightSub: string;
  notes: PolicyPoint[];
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
}: PolicyBlockProps) {
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