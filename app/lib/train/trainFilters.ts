import type { TrainFilterState, TrainResultItem } from "./trainResultTypes";

export const INITIAL_TRAIN_FILTERS: TrainFilterState = {
  quick: [],
  ticketTypes: [],
  quota: [],
  classes: [],
  arrivalTime: [],
  departureTime: [],
  trainTypes: [],
  fromStations: [],
  toStations: [],
};

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
  return true;
}

export function filterTrainResults(
  trains: TrainResultItem[],
  filters: TrainFilterState
) {
  return trains.filter((train) => {
    const classCodes = train.classes.map((item) => item.classCode);
    const statusTexts = train.classes.map((item) =>
      item.statusText.toLowerCase()
    );
    const refundTags = train.classes.map(
      (item) => item.refundTag?.toLowerCase() || ""
    );

    const quickMatch =
      filters.quick.length === 0 ||
      filters.quick.every((item) => {
        if (item === "ac") {
          return classCodes.some((code) =>
            ["1A", "2A", "3A", "3E", "CC", "EC"].includes(code)
          );
        }

        if (item === "available") {
          return statusTexts.some((status) => status.includes("available"));
        }

        if (item === "departureAfter6pm") {
          return parseHour(train.departureTime) >= 18;
        }

        if (item === "arrivalBefore12pm") {
          return parseHour(train.arrivalTime) < 12;
        }

        return true;
      });

    const ticketTypeMatch =
      filters.ticketTypes.length === 0 ||
      filters.ticketTypes.some((item) => {
        if (item === "freeCancellation") {
          return refundTags.some((tag) => tag.includes("free cancellation"));
        }

        if (item === "alternateTrip") {
          return (
            !!train.confirmedOptionTag ||
            !!train.confirmedOptionDescription ||
            refundTags.some((tag) => tag.includes("confirm"))
          );
        }

        return true;
      });

    const quotaMatch =
      filters.quota.length === 0 ||
      filters.quota.some((item) => {
        if (item === "general") return true;

        if (item === "ladies") {
          return train.classes.some(
            (cls) => cls.dateWiseAvailability.ladies.length > 0
          );
        }

        if (item === "tatkal") {
          return train.classes.some(
            (cls) => cls.dateWiseAvailability.tatkal.length > 0
          );
        }

        if (item === "seniorCitizen") {
          return train.classes.some(
            (cls) => cls.dateWiseAvailability.seniorCitizen.length > 0
          );
        }

        return true;
      });

    const classMatch =
      filters.classes.length === 0 ||
      filters.classes.some((item) => classCodes.includes(item));

    const arrivalMatch =
      filters.arrivalTime.length === 0 ||
      filters.arrivalTime.some((bucket) =>
        matchTimeBucket(parseHour(train.arrivalTime), bucket)
      );

    const departureMatch =
      filters.departureTime.length === 0 ||
      filters.departureTime.some((bucket) =>
        matchTimeBucket(parseHour(train.departureTime), bucket)
      );

    const trainTypeMatch =
      filters.trainTypes.length === 0 ||
      filters.trainTypes.some((item) => {
        if (item === "O") return true;
        return true;
      });

    const fromStationMatch =
      filters.fromStations.length === 0 ||
      filters.fromStations.includes(`${train.fromCity} - ${train.fromCode}`);

    const toStationMatch =
      filters.toStations.length === 0 ||
      filters.toStations.includes(`${train.toCity} - ${train.toCode}`);

    return (
      quickMatch &&
      ticketTypeMatch &&
      quotaMatch &&
      classMatch &&
      arrivalMatch &&
      departureMatch &&
      trainTypeMatch &&
      fromStationMatch &&
      toStationMatch
    );
  });
}