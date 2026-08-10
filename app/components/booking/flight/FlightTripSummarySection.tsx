"use client";

import FlightJourneyCard from "./FlightJourneyCard";
import type { FlightReviewAncillaryOption } from "./FlightSeatMealSection";
import { FlightReviewPayload } from "@/app/lib/flights/review/buildFlightReviewData";
import {
  formatAirportLocalDate,
  formatAirportLocalTime,
  formatDayOffset,
  formatDurationFromSchedule,
  type FlightScheduleEndpoint,
} from "@/app/lib/flights/flightScheduleTime";

type Props = {
  reviewData: FlightReviewPayload;
  paidBaggageOptions?: FlightReviewAncillaryOption[];
  selectedAncillaryIds?: string[];
  onAncillaryToggle?: (id: string) => void;
};

type JourneySegmentUI = {
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
  departureLocalContext?: string;
  arrivalLocalContext?: string;
  stopCount: number;
  baggage: string;
  cabinClass: string;
  layover?: {
    duration: string;
    airport: string;
    code: string;
  };
  schedule?: {
    departure?: FlightScheduleEndpoint;
    arrival?: FlightScheduleEndpoint;
    dayOffset?: number;
  };
};

function formatJourneyDate(value?: string) {
  if (!value) return "";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;

  const dayName = parsed.toLocaleDateString("en-GB", {
    weekday: "short",
    timeZone: "UTC",
  });

  const dateText = parsed.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });

  return `${dayName}, ${dateText}`;
}

function getStopText(stopCount: number) {
  if (stopCount <= 0) return "Non Stop";
  if (stopCount === 1) return "1 Stop";
  return `${stopCount} Stop`;
}

function parseDurationToMinutes(duration?: string) {
  if (!duration) return 0;

  const hoursMatch = duration.match(/(\d+)\s*h/i);
  const minsMatch = duration.match(/(\d+)\s*m/i);

  const hours = hoursMatch ? Number(hoursMatch[1]) : 0;
  const mins = minsMatch ? Number(minsMatch[1]) : 0;

  return hours * 60 + mins;
}

function formatMinutesToDuration(totalMinutes: number) {
  if (!totalMinutes) return "";
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;

  if (hours > 0 && mins > 0) return `${hours}h ${mins}m`;
  if (hours > 0) return `${hours}h`;
  return `${mins}m`;
}

function extractCode(value?: string) {
  if (!value) return "";
  const match = value.match(/\(([A-Z]{3,4})\)/);
  if (match) return match[1];
  return value;
}

export default function FlightTripSummarySection({
  reviewData,
  paidBaggageOptions = [],
  selectedAncillaryIds = [],
  onAncillaryToggle,
}: Props) {
  const journeys = reviewData.journeys || [];
  const isInternational = reviewData.tripMode === "international";

  return (
    <section id="trip-summary">
      {/* HEADER */}
      <div
        className="max-md:px-3"
        style={{
          minHeight: "50px",
          padding: "0 16px",
          borderBottom: "1px solid #d9e2ec",
          background: "#fffdf4",
          display: "flex",
          alignItems: "center",
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: "16px",
            fontWeight: 800,
            color: "#1f2937",
          }}
        >
          Trip Summary
        </h3>
      </div>

      {/* BODY */}
      <div
        className="max-md:p-3"
        style={{
          padding: "16px",
          background: "#ffffff",
        }}
      >
        {journeys.map((journey, journeyIndex) => {
          const firstSegment = journey.segments?.[0];
          const lastSegment = journey.segments?.[journey.segments.length - 1];
          const dynamicStopCount =
  journey.layovers && journey.layovers.length > 0
    ? journey.layovers.length
    : Math.max((journey.segments?.length || 1) - 1, 0);



          const routeLabel =
            firstSegment && lastSegment
              ? `${firstSegment.from} → ${lastSegment.to}`
              : `Flight ${journeyIndex + 1}`;

          const dateLabel =
            formatAirportLocalDate(firstSegment?.schedule?.departure, "") ||
            formatJourneyDate(firstSegment?.departureDate);

          const stopText = getStopText(dynamicStopCount);

          const totalDurationMinutes = (journey.segments || []).reduce(
            (acc, seg) => acc + parseDurationToMinutes(seg.duration),
            0
          );

          const totalDuration =
            formatMinutesToDuration(totalDurationMinutes) ||
            firstSegment?.duration ||
            "";

          const segments: JourneySegmentUI[] = (journey.segments || []).map(
            (segment, segmentIndex) => ({
              airline: segment.airline || "",
              flightNumber: segment.flightNumber || "",
              aircraft: segment.aircraft || "",
              fromCity: segment.from || "",
              fromCode: extractCode(segment.fromCode || segment.from),
              fromAirport: segment.terminalFrom || segment.from || "",
              toCity: segment.to || "",
              toCode: extractCode(segment.toCode || segment.to),
              toAirport: segment.terminalTo || segment.to || "",
              departureTime: formatAirportLocalTime(segment.schedule?.departure, segment.departureTime || ""),
              arrivalTime: `${formatAirportLocalTime(segment.schedule?.arrival, segment.arrivalTime || "")}${formatDayOffset(segment.schedule?.dayOffset) ? ` ${formatDayOffset(segment.schedule?.dayOffset)}` : ""}`,
              duration: formatDurationFromSchedule({
                departure: segment.schedule?.departure,
                arrival: segment.schedule?.arrival,
                duration: segment.duration,
                dayOffset: segment.schedule?.dayOffset,
              }, segment.duration || ""),
              departureLocalContext: segment.schedule?.departure?.airport
                ? `${segment.schedule.departure.airport} local time`
                : undefined,
              arrivalLocalContext: segment.schedule?.arrival?.airport
                ? `${segment.schedule.arrival.airport} local time`
                : undefined,
              stopCount: dynamicStopCount,
              baggage:
                segment.cabinBaggage ||
                segment.checkinBaggage ||
                "7 Kg / Adult",
              cabinClass: reviewData.cabinClass || "Economy",
              schedule: segment.schedule,
              layover:
                journey.layovers && journey.layovers[segmentIndex]
                  ? {
                      duration: journey.layovers[segmentIndex].duration || "",
                      airport: journey.layovers[segmentIndex].airport || "",
                      code:
                        journey.layovers[segmentIndex].code ||
                        journey.layovers[segmentIndex].airport ||
                        "",
                    }
                  : undefined,
            })
          );

          return (
            <div
              key={`${journeyIndex}-${routeLabel}`}
              style={{
                marginBottom:
                  journeyIndex === journeys.length - 1 ? "0" : "18px",
              }}
            >
              <FlightJourneyCard
                title=""
                routeLabel={routeLabel}
                dateLabel={dateLabel}
                stopText={stopText}
                duration={totalDuration}
                fareType={reviewData.cabinClass || "Economy"}
                cabinClass="Economy"
                isInternational={isInternational}
                segments={segments}
                includedCheckInText={
                  firstSegment?.checkinBaggage
                    ? `Included Check-in baggage per person - ${firstSegment.checkinBaggage}`
                    : "Included Check-in baggage per person - 15 KGS"
                }
                paidBaggageOptions={paidBaggageOptions}
                selectedAncillaryIds={selectedAncillaryIds}
                onAncillaryToggle={onAncillaryToggle}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}
