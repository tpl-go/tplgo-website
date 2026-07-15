# Vercel Beta Env Template: Flight Backend-Search Beta

This document lists the frontend environment variables required for the TPL flight beta deployment on Vercel.

Do not put backend secrets in Vercel. Vercel frontend env must not contain database URLs, session secrets, Amadeus credentials, Razorpay secret keys, OTP provider credentials, or webhook secrets.

## Required Variables

| Variable | Beta value | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_TPL_API_BASE_URL` | `https://<api-beta-domain>` | Public HTTPS URL for the TPL backend API. Do not use localhost in Vercel. |
| `NEXT_PUBLIC_TPL_USE_BACKEND_FLIGHT_SEARCH` | `true` | Enables backend-sourced flight search for beta. Set to `false` for rollback. |
| `NEXT_PUBLIC_TPL_BACKEND_FLIGHT_SEARCH_FALLBACK_TO_LOCAL` | `true` | Keeps local dummy fallback available if backend search fails. |

## Explicitly Forbidden In Vercel

- `DATABASE_URL`
- `SESSION_SECRET`
- `AMADEUS_CLIENT_ID`
- `AMADEUS_CLIENT_SECRET`
- `RAZORPAY_KEY_SECRET`
- `RAZORPAY_WEBHOOK_SECRET`
- `OTP` provider secrets
- `MSG91_AUTH_KEY`
- Firebase service account JSON
- Any backend private token, webhook secret, or database credential

## Rollback Lever

Set:

```text
NEXT_PUBLIC_TPL_USE_BACKEND_FLIGHT_SEARCH=false
```

Then redeploy the Vercel frontend. The local dummy flight flow should remain available.
