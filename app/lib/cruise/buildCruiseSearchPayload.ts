import { CruiseSearchPayload, CruiseSearchState } from "./cruiseTypes"

export function buildCruiseSearchPayload(
  state: CruiseSearchState
): CruiseSearchPayload {
  return {
    destinationId: state.destination?.id ?? null,
    departurePortId: state.departurePort?.id ?? null,
    sailingMode: state.sailing.mode,
    sailingDate: state.sailing.exactDate,
    sailingMonth: state.sailing.month,
    durationId: state.duration?.id ?? null,
    adults: state.travellers.adults,
    children: state.travellers.children,
    infants: state.travellers.infants,
  }
}