import { CruiseSearchState } from "./cruiseTypes"

export type CruiseSearchValidationResult = {
  isValid: boolean
  errors: {
    destination?: string
    departurePort?: string
    sailing?: string
    travellers?: string
  }
}

export function validateCruiseSearch(
  state: CruiseSearchState
): CruiseSearchValidationResult {
  const errors: CruiseSearchValidationResult["errors"] = {}

  const hasDestination = !!state.destination
  const hasDeparturePort = !!state.departurePort

  if (!hasDestination && !hasDeparturePort) {
    errors.destination = "Please select a destination or departure port."
  }

  if (state.travellers.adults < 1) {
    errors.travellers = "At least one adult is required."
  }

  const isValid = Object.keys(errors).length === 0

  return { isValid, errors }
}