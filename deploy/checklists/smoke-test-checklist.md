# Smoke Test Checklist

Run after PM2 and Nginx are started or reloaded.

## Backend Health

```bash
curl -i https://api.tpl.example.com/api/v1/health
```

Expected:

- HTTP `200`.
- Response does not expose secrets.

## Frontend Availability

```bash
curl -I https://tpl.example.com
curl -I https://www.tpl.example.com
```

Expected:

- HTTP `200` or valid redirect to canonical HTTPS host.
- No `502`, `503`, or TLS error.

## Homepage

Manual browser check:

- Homepage loads.
- Header/navigation loads.
- No blank page.
- No visible server error.

## User Login

Manual browser check:

- User login/OTP flow loads.
- Invalid input fails safely.
- Valid test login works if a safe test account is available.

## Mock Booking Flow

Manual browser check:

- Start a flight or hotel flow.
- Reach review/payment using the existing mock/local path.
- Confirm no real supplier API is called.
- Confirm no real payment gateway is shown.
- Complete mock/local payment.

## Confirmation

Manual browser check:

- Confirmation page loads after mock payment.
- Booking reference is visible.
- No pricing/wallet behavior changed.

## My Booking

Manual browser check:

- My Booking list loads.
- Newly created booking appears where expected.
- Booking detail opens after refresh.
- Locally stored booking data behaves as before.

## Admin Login

Manual browser check:

- `/admin/login` loads.
- Invalid login fails safely.
- Valid admin login works with approved production admin.
- MFA flow works if enabled.

## Admin Dashboard

Manual browser check:

- Admin dashboard loads.
- System/health page can reach backend.
- Logout clears session.
- Refresh restores valid session only.

## Failure Checks

Confirm:

- No `502 Bad Gateway`.
- No frontend blank page.
- No backend process crash loop.
- No PM2 process repeatedly restarting.
- No real supplier/provider calls.
- No real payment gateway activation.
