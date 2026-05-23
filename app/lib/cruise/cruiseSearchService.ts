import {
  CruiseDestination,
  CruiseDurationOption,
  CruisePort,
  CruiseSearchOptionsRequest,
  CruiseSearchOptionsResponse,
} from "./cruiseTypes";
import {
  cruiseDestinations,
  cruiseDurations,
  cruisePorts,
} from "./cruiseSearchData";

function cloneDestinations(items: CruiseDestination[]): CruiseDestination[] {
  return items.map((item) => ({ ...item, keywords: [...(item.keywords ?? [])] }));
}

function clonePorts(items: CruisePort[]): CruisePort[] {
  return items.map((item) => ({
    ...item,
    destinationIds: [...(item.destinationIds ?? [])],
    regionIds: [...(item.regionIds ?? [])],
    keywords: [...(item.keywords ?? [])],
  }));
}

function cloneDurations(items: CruiseDurationOption[]): CruiseDurationOption[] {
  return items.map((item) => ({ ...item }));
}

export async function fetchCruiseSearchOptions(
  request?: CruiseSearchOptionsRequest
): Promise<CruiseSearchOptionsResponse> {
  const destinationId = request?.destinationId ?? null;

  let destinations = cloneDestinations(cruiseDestinations);
  let ports = clonePorts(cruisePorts);
  const durations = cloneDurations(cruiseDurations);

  if (destinationId) {
    const matchedPorts = ports.filter(
      (port) =>
        port.destinationIds?.includes(destinationId) ||
        port.regionIds?.includes(destinationId)
    );

    const remainingPorts = ports.filter(
      (port) =>
        !port.destinationIds?.includes(destinationId) &&
        !port.regionIds?.includes(destinationId)
    );

    ports = [...matchedPorts, ...remainingPorts];
  }

  return {
    destinations,
    ports,
    durations,
  };
}