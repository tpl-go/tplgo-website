# Flight Backend Search Readiness

Batch D3 wires frontend one-way flight results to the TPL backend flight search API behind feature flags.

## Flags

- `NEXT_PUBLIC_TPL_USE_BACKEND_FLIGHT_SEARCH=true|false`
- `NEXT_PUBLIC_TPL_BACKEND_FLIGHT_SEARCH_FALLBACK_TO_LOCAL=true|false`
- `NEXT_PUBLIC_TPL_API_BASE_URL`

Backend search remains disabled unless `NEXT_PUBLIC_TPL_USE_BACKEND_FLIGHT_SEARCH=true` and `NEXT_PUBLIC_TPL_API_BASE_URL` is configured.

Fallback to local dummy results is enabled by default. Set `NEXT_PUBLIC_TPL_BACKEND_FLIGHT_SEARCH_FALLBACK_TO_LOCAL=false` only when intentionally testing hard backend failures.

## API

Frontend calls only:

- `POST /api/v1/flights/search`

No Amadeus or provider-specific endpoint is called from the frontend.

## Scope

Enabled scope:

- one-way search result replacement
- normalized backend flight offer mapping to existing result card shape
- local dummy results fallback

Disabled scope:

- price/offer confirmation
- booking
- ticketing
- PNR
- cancellation
- payment capture
- live supplier behavior

Round-trip and multicity results continue to use existing local data until separately approved.
