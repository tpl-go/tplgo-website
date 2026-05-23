type FlightSegment = {
  fromCity: string;
  toCity: string;
  departure?: Date | string;
};

type FlightsResultHeaderProps = {
  tripType: "oneway" | "roundtrip" | "multicity";
  segments: FlightSegment[];
  activeSegmentIndex?: number;
};

function formatHeaderDate(date?: Date | string) {
  if (!date) return "";

  const safeDate = typeof date === "string" ? new Date(date) : date;

  if (Number.isNaN(safeDate.getTime())) return "";

  return safeDate.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "2-digit",
  });
}

export default function FlightsResultHeader({
  tripType,
  segments,
  activeSegmentIndex = 0,
}: FlightsResultHeaderProps) {
  const firstSegment = segments[0];
  const secondSegment = segments[1];
  const activeSegment = segments[activeSegmentIndex] || segments[0];

  if (!firstSegment) return null;

  if (tripType === "oneway") {
    return (
      <h1 className="text-[24px] font-bold leading-tight text-[#111827]">
        Flights from {firstSegment.fromCity} to {firstSegment.toCity}
      </h1>
    );
  }

  if (tripType === "roundtrip") {
    const onwardDate = formatHeaderDate(firstSegment.departure);
    const returnDate = formatHeaderDate(secondSegment?.departure);

    return (
      <h1 className="text-[24px] font-bold leading-tight text-[#111827]">
        Flights from {firstSegment.fromCity} to {firstSegment.toCity}, and back
        {(onwardDate || returnDate) && (
          <span className="ml-2 text-[22px] font-semibold text-[#374151]">
            {onwardDate}
            {returnDate ? ` - ${returnDate}` : ""}
          </span>
        )}
      </h1>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap overflow-hidden rounded-xl border border-[#d9e2ef] bg-white">
        {segments.slice(0, 5).map((segment, index) => {
          const isActive = index === activeSegmentIndex;

          return (
            <div
              key={`${segment.fromCity}-${segment.toCity}-${index}`}
              className={`min-w-[220px] flex-1 border-r border-[#e5e7eb] px-5 py-4 last:border-r-0 ${
                isActive ? "bg-[#eef7ff]" : "bg-white"
              }`}
            >
              <div className="text-[22px] font-semibold leading-tight text-[#111827]">
                {segment.fromCity} → {segment.toCity}
              </div>
              <div className="mt-1 text-[18px] font-medium text-[#6b7280]">
                {formatHeaderDate(segment.departure)}
              </div>
            </div>
          );
        })}
      </div>

      <h1 className="text-[24px] font-bold leading-tight text-[#111827]">
        Select flight from {activeSegment.fromCity} to {activeSegment.toCity}
      </h1>
    </div>
  );
}