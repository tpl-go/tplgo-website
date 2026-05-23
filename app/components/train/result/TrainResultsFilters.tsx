"use client";

import type {
  TrainFilterChip,
  TrainFilterState,
  TrainResultItem,
} from "@/app/lib/train/trainResultTypes";

type Props = {
  fromCity: string;
  toCity: string;
  trains: TrainResultItem[];
  filters: TrainFilterState;
  chips: TrainFilterChip[];
  onToggleQuick: (value: string) => void;
  onToggleTicketType: (value: string) => void;
  onToggleQuota: (value: string) => void;
  onToggleClass: (value: string) => void;
  onToggleArrivalTime: (value: string) => void;
  onToggleDepartureTime: (value: string) => void;
  onToggleTrainType: (value: string) => void;
  onToggleFromStation: (value: string) => void;
  onToggleToStation: (value: string) => void;
  onClearAll: () => void;
};

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[20px] border border-slate-200 bg-white px-4 py-4 shadow-sm">
      <div className="mb-4 text-[16px] font-extrabold text-slate-900">{title}</div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function CheckboxRow({
  label,
  checked,
  count,
  onChange,
}: {
  label: string;
  checked: boolean;
  count?: number;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="h-5 w-5 rounded border-slate-300"
        />
        <span className="text-[15px] font-medium leading-5 text-slate-800">
          {label}
        </span>
      </div>

      {typeof count === "number" ? (
        <span className="text-[14px] font-semibold text-slate-600">{count}</span>
      ) : null}
    </label>
  );
}

function TimeGridButton({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-[56px] items-center justify-center rounded-xl border text-[15px] font-medium transition ${
        selected
          ? "border-sky-400 bg-sky-50 text-sky-700"
          : "border-slate-200 bg-white text-slate-800 hover:border-slate-300"
      }`}
    >
      {label}
    </button>
  );
}

function parseHour(timeValue: string) {
  const normalized = timeValue.toUpperCase().trim();
  const match = normalized.match(/(\d{1,2}):(\d{2})\s?(AM|PM)/);
  if (!match) return 0;

  let hour = Number(match[1]);
  const suffix = match[3];

  if (suffix === "PM" && hour !== 12) hour += 12;
  if (suffix === "AM" && hour === 12) hour = 0;

  return hour;
}

function matchTimeBucket(hour: number, bucket: string) {
  if (bucket === "12am-6am") return hour >= 0 && hour < 6;
  if (bucket === "6am-12pm") return hour >= 6 && hour < 12;
  if (bucket === "12pm-6pm") return hour >= 12 && hour < 18;
  if (bucket === "6pm-12am") return hour >= 18 && hour < 24;
  return false;
}

function countQuickFilter(trains: TrainResultItem[], key: string) {
  if (key === "ac") {
    return trains.filter((train) =>
      train.classes.some((item) =>
        ["1A", "2A", "3A", "3E", "CC", "EC"].includes(item.classCode)
      )
    ).length;
  }

  if (key === "available") {
    return trains.filter((train) =>
      train.classes.some((item) =>
        item.statusText.toLowerCase().includes("available")
      )
    ).length;
  }

  if (key === "departureAfter6pm") {
    return trains.filter((train) => parseHour(train.departureTime) >= 18).length;
  }

  if (key === "arrivalBefore12pm") {
    return trains.filter((train) => parseHour(train.arrivalTime) < 12).length;
  }

  return 0;
}

function countClass(trains: TrainResultItem[], classCode: string) {
  return trains.filter((train) =>
    train.classes.some((item) => item.classCode === classCode)
  ).length;
}

function countTicketType(trains: TrainResultItem[], key: string) {
  if (key === "freeCancellation") {
    return trains.filter((train) =>
      train.classes.some((item) =>
        item.refundTag?.toLowerCase().includes("free cancellation")
      )
    ).length;
  }

  if (key === "alternateTrip") {
    return trains.filter(
      (train) => !!train.confirmedOptionTag || !!train.confirmedOptionDescription
    ).length;
  }

  return 0;
}

function countTimeBucket(
  trains: TrainResultItem[],
  bucket: string,
  mode: "arrival" | "departure"
) {
  return trains.filter((train) => {
    const hour =
      mode === "arrival"
        ? parseHour(train.arrivalTime)
        : parseHour(train.departureTime);

    return matchTimeBucket(hour, bucket);
  }).length;
}

function uniqueFromStations(trains: TrainResultItem[]) {
  return Array.from(
    new Set(trains.map((train) => `${train.fromCity} - ${train.fromCode}`))
  );
}

function uniqueToStations(trains: TrainResultItem[]) {
  return Array.from(
    new Set(trains.map((train) => `${train.toCity} - ${train.toCode}`))
  );
}

function countStation(trains: TrainResultItem[], station: string, mode: "from" | "to") {
  return trains.filter((train) => {
    const value =
      mode === "from"
        ? `${train.fromCity} - ${train.fromCode}`
        : `${train.toCity} - ${train.toCode}`;

    return value === station;
  }).length;
}

export default function TrainResultsFilters({
  fromCity,
  toCity,
  trains,
  filters,
  chips,
  onToggleQuick,
  onToggleTicketType,
  onToggleQuota,
  onToggleClass,
  onToggleArrivalTime,
  onToggleDepartureTime,
  onToggleTrainType,
  onToggleFromStation,
  onToggleToStation,
  onClearAll,
}: Props) {
  const fromStations = uniqueFromStations(trains);
  const toStations = uniqueToStations(trains);

  return (
    <div className="space-y-4">
      <div className="rounded-[20px] border border-slate-200 bg-white px-4 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="text-[18px] font-extrabold text-slate-900">Filters</div>
          <button
            type="button"
            onClick={onClearAll}
            className="text-[13px] font-bold text-slate-600 transition hover:text-red-500"
          >
            CLEAR ALL
          </button>
        </div>
      </div>

      <Section title="Quick Filters">
        <CheckboxRow
          label="AC"
          checked={filters.quick.includes("ac")}
          count={countQuickFilter(trains, "ac")}
          onChange={() => onToggleQuick("ac")}
        />

        <CheckboxRow
          label="Available"
          checked={filters.quick.includes("available")}
          count={countQuickFilter(trains, "available")}
          onChange={() => onToggleQuick("available")}
        />

        <CheckboxRow
          label="Departure after 6 PM"
          checked={filters.quick.includes("departureAfter6pm")}
          count={countQuickFilter(trains, "departureAfter6pm")}
          onChange={() => onToggleQuick("departureAfter6pm")}
        />

        <CheckboxRow
          label="Arrival before 12 PM"
          checked={filters.quick.includes("arrivalBefore12pm")}
          count={countQuickFilter(trains, "arrivalBefore12pm")}
          onChange={() => onToggleQuick("arrivalBefore12pm")}
        />
      </Section>

      <Section title="Ticket Types">
        <CheckboxRow
          label="Free Cancellation"
          checked={filters.ticketTypes.includes("freeCancellation")}
          count={countTicketType(trains, "freeCancellation")}
          onChange={() => onToggleTicketType("freeCancellation")}
        />

        <CheckboxRow
          label="Alternate Trip Plan (previously Trip Guarantee)"
          checked={filters.ticketTypes.includes("alternateTrip")}
          count={countTicketType(trains, "alternateTrip")}
          onChange={() => onToggleTicketType("alternateTrip")}
        />
      </Section>

      <Section title="Quota">
        <CheckboxRow
          label="General Quota"
          checked={filters.quota.includes("general")}
          count={trains.length}
          onChange={() => onToggleQuota("general")}
        />

        <CheckboxRow
          label="Ladies Quota"
          checked={filters.quota.includes("ladies")}
          count={trains.filter((train) =>
            train.classes.some((item) => item.dateWiseAvailability.ladies.length > 0)
          ).length}
          onChange={() => onToggleQuota("ladies")}
        />
      </Section>

      <Section title="Journey Class Filters">
        <CheckboxRow
          label="1st Class AC - 1A"
          checked={filters.classes.includes("1A")}
          count={countClass(trains, "1A")}
          onChange={() => onToggleClass("1A")}
        />

        <CheckboxRow
          label="2nd Class AC - 2A"
          checked={filters.classes.includes("2A")}
          count={countClass(trains, "2A")}
          onChange={() => onToggleClass("2A")}
        />

        <CheckboxRow
          label="3rd Class AC - 3A"
          checked={filters.classes.includes("3A")}
          count={countClass(trains, "3A")}
          onChange={() => onToggleClass("3A")}
        />

        <CheckboxRow
          label="Sleeper - SL"
          checked={filters.classes.includes("SL")}
          count={countClass(trains, "SL")}
          onChange={() => onToggleClass("SL")}
        />

        <CheckboxRow
          label="AC three tier (economy) - 3E"
          checked={filters.classes.includes("3E")}
          count={countClass(trains, "3E")}
          onChange={() => onToggleClass("3E")}
        />

        <CheckboxRow
          label="Chair Car - CC"
          checked={filters.classes.includes("CC")}
          count={countClass(trains, "CC")}
          onChange={() => onToggleClass("CC")}
        />

        <CheckboxRow
          label="Second Seating - 2S"
          checked={filters.classes.includes("2S")}
          count={countClass(trains, "2S")}
          onChange={() => onToggleClass("2S")}
        />

        <CheckboxRow
          label="Executive Chair Car - EC"
          checked={filters.classes.includes("EC")}
          count={countClass(trains, "EC")}
          onChange={() => onToggleClass("EC")}
        />
      </Section>

      <Section title={`Arrival in ${toCity}`}>
        <div className="grid grid-cols-2 gap-3">
          <TimeGridButton
            label="12am - 6am"
            selected={filters.arrivalTime.includes("12am-6am")}
            onClick={() => onToggleArrivalTime("12am-6am")}
          />
          <TimeGridButton
            label="6am - 12pm"
            selected={filters.arrivalTime.includes("6am-12pm")}
            onClick={() => onToggleArrivalTime("6am-12pm")}
          />
          <TimeGridButton
            label="12pm - 6pm"
            selected={filters.arrivalTime.includes("12pm-6pm")}
            onClick={() => onToggleArrivalTime("12pm-6pm")}
          />
          <TimeGridButton
            label="6pm - 12am"
            selected={filters.arrivalTime.includes("6pm-12am")}
            onClick={() => onToggleArrivalTime("6pm-12am")}
          />
        </div>

        <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[12px] font-medium text-slate-500">
          <div className="text-center">
            {countTimeBucket(trains, "12am-6am", "arrival")}
          </div>
          <div className="text-center">
            {countTimeBucket(trains, "6am-12pm", "arrival")}
          </div>
          <div className="text-center">
            {countTimeBucket(trains, "12pm-6pm", "arrival")}
          </div>
          <div className="text-center">
            {countTimeBucket(trains, "6pm-12am", "arrival")}
          </div>
        </div>
      </Section>

      <Section title={`Departure from ${fromCity}`}>
        <div className="grid grid-cols-2 gap-3">
          <TimeGridButton
            label="12am - 6am"
            selected={filters.departureTime.includes("12am-6am")}
            onClick={() => onToggleDepartureTime("12am-6am")}
          />
          <TimeGridButton
            label="6am - 12pm"
            selected={filters.departureTime.includes("6am-12pm")}
            onClick={() => onToggleDepartureTime("6am-12pm")}
          />
          <TimeGridButton
            label="12pm - 6pm"
            selected={filters.departureTime.includes("12pm-6pm")}
            onClick={() => onToggleDepartureTime("12pm-6pm")}
          />
          <TimeGridButton
            label="6pm - 12am"
            selected={filters.departureTime.includes("6pm-12am")}
            onClick={() => onToggleDepartureTime("6pm-12am")}
          />
        </div>

        <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[12px] font-medium text-slate-500">
          <div className="text-center">
            {countTimeBucket(trains, "12am-6am", "departure")}
          </div>
          <div className="text-center">
            {countTimeBucket(trains, "6am-12pm", "departure")}
          </div>
          <div className="text-center">
            {countTimeBucket(trains, "12pm-6pm", "departure")}
          </div>
          <div className="text-center">
            {countTimeBucket(trains, "6pm-12am", "departure")}
          </div>
        </div>
      </Section>

      <Section title="Train Types">
        <CheckboxRow
          label="Others - O"
          checked={filters.trainTypes.includes("O")}
          count={trains.length}
          onChange={() => onToggleTrainType("O")}
        />
      </Section>

      <Section title={`Stations in ${fromCity}`}>
        {fromStations.map((station) => (
          <CheckboxRow
            key={station}
            label={station}
            checked={filters.fromStations.includes(station)}
            count={countStation(trains, station, "from")}
            onChange={() => onToggleFromStation(station)}
          />
        ))}
      </Section>

      <Section title={`Stations in ${toCity}`}>
        {toStations.map((station) => (
          <CheckboxRow
            key={station}
            label={station}
            checked={filters.toStations.includes(station)}
            count={countStation(trains, station, "to")}
            onChange={() => onToggleToStation(station)}
          />
        ))}
      </Section>
    </div>
  );
}