import {
  CruiseDestination,
  CruiseDurationOption,
  CruisePort,
  CruiseSearchApiDestination,
  CruiseSearchApiDuration,
  CruiseSearchApiPort,
} from "./cruiseTypes";

export function mapApiDestinationToCruiseDestination(
  item: CruiseSearchApiDestination
): CruiseDestination {
  return {
    id: item.id,
    label: item.name,
    type: item.type,
    countryCode: item.countryCode,
    description: item.description,
    popular: item.popular,
    keywords: item.keywords ?? [],
  };
}

export function mapApiPortToCruisePort(item: CruiseSearchApiPort): CruisePort {
  return {
    id: item.id,
    label: item.name,
    countryCode: item.countryCode,
    destinationIds: item.destinationIds ?? [],
    regionIds: item.regionIds ?? [],
    popular: item.popular,
    keywords: item.keywords ?? [],
  };
}

export function mapApiDurationToCruiseDuration(
  item: CruiseSearchApiDuration
): CruiseDurationOption {
  return {
    id: item.id,
    label: item.name,
    minNights: item.minNights,
    maxNights: item.maxNights,
  };
}