export type FlightScheduleEndpoint = {
  airport?: string;
  at?: string;
  localDateTime?: string;
  timeZone?: string;
  utcDateTime?: string;
  offset?: string;
};

export type FlightScheduleSegment = {
  departure?: FlightScheduleEndpoint;
  arrival?: FlightScheduleEndpoint;
  duration?: string;
  dayOffset?: number;
};

export function formatAirportLocalTime(endpoint?: FlightScheduleEndpoint, fallback = "") {
  const local = localDateTime(endpoint);
  if (local) return timeFromLocalDateTime(local);
  return fallback;
}

export function formatAirportLocalDate(endpoint?: FlightScheduleEndpoint, fallback = "") {
  const local = localDateTime(endpoint);
  if (local) return formatLocalDatePart(localDatePart(local));
  return formatLocalDatePart(localDatePart(fallback)) || fallback;
}

export function airportLocalContext(endpoint?: FlightScheduleEndpoint) {
  const code = endpoint?.airport?.trim().toUpperCase();
  if (!code) return "local time";
  return `${code} local time`;
}

export function formatDayOffset(value?: number) {
  const offset = Number(value || 0);
  if (offset <= 0) return "";
  return `+${offset} day${offset > 1 ? "s" : ""}`;
}

export function durationMinutesFromSchedule(segment?: FlightScheduleSegment) {
  const providerDuration = isoDurationMinutes(segment?.duration);
  if (providerDuration > 0) return providerDuration;
  const departure = instantMs(segment?.departure);
  const arrival = instantMs(segment?.arrival);
  if (departure === undefined || arrival === undefined) return 0;
  return Math.max(0, Math.round((arrival - departure) / 60000));
}

export function formatDurationFromSchedule(segment?: FlightScheduleSegment, fallback = "") {
  const minutes = durationMinutesFromSchedule(segment);
  if (minutes > 0) return minutesToDuration(minutes);
  return fallback;
}

function localDateTime(endpoint?: FlightScheduleEndpoint) {
  return endpoint?.localDateTime || stripOffset(endpoint?.at) || stripOffset(endpoint?.utcDateTime);
}

function stripOffset(value?: string) {
  const clean = String(value || "").trim();
  const match = clean.match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2})?)(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?$/);
  return match?.[1] || "";
}

function timeFromLocalDateTime(value: string) {
  const match = value.match(/T(\d{2}):(\d{2})/);
  return match ? `${match[1]}:${match[2]}` : value;
}

function localDatePart(value?: string) {
  return String(value || "").match(/^(\d{4}-\d{2}-\d{2})/)?.[1] || "";
}

function formatLocalDatePart(value?: string) {
  const match = String(value || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return "";
  const [, year, month, day] = match;
  const utcNoon = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day), 12));
  const dayName = utcNoon.toLocaleDateString("en-GB", { weekday: "short", timeZone: "UTC" });
  const dateText = utcNoon.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
  return `${dayName}, ${dateText}`;
}

function isoDurationMinutes(value?: string) {
  const match = String(value || "").match(/^PT(?:(\d+)H)?(?:(\d+)M)?$/i);
  if (!match) return 0;
  return Number(match[1] || 0) * 60 + Number(match[2] || 0);
}

function instantMs(endpoint?: FlightScheduleEndpoint) {
  const value = endpoint?.utcDateTime || endpoint?.at;
  if (!value || !/(Z|[+-]\d{2}:?\d{2})$/.test(value)) return undefined;
  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? undefined : parsed;
}

function minutesToDuration(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  if (hours > 0 && mins > 0) return `${hours}h ${mins}m`;
  if (hours > 0) return `${hours}h`;
  return `${mins}m`;
}
