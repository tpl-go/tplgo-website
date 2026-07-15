# Admin Production Readiness

## Status

The admin panel is build-ready and included in the frontend production build. Production operation depends on backend environment setup, admin authentication configuration, and a confirmed first-admin/bootstrap process.

## Required Production Settings

- `ADMIN_AUTH_MODE=password`
- `ADMIN_DEV_LOGIN_ENABLED=false`
- `ADMIN_PASSWORD_PEPPER` set to a strong secret
- `ADMIN_MFA_SECRET_ENCRYPTION_KEY` set to a strong secret
- `ADMIN_SESSION_TTL_SECONDS=43200` or another approved TTL
- `ADMIN_SSO_ENABLED=false` unless SSO is fully configured and approved

Do not use `ADMIN_AUTH_MODE=dev` in production.

## Session Handling

Frontend admin session storage uses:

- Local storage key: `tpl_admin_session_v1`
- Session storage key for MFA challenge: `tpl_admin_mfa_challenge_v1`

The frontend removes expired stored admin sessions during session read. Production smoke testing must confirm login, session restore, logout, MFA challenge handling where enabled, and revoked/expired session behavior.

## Bootstrap Process

The production-safe first-admin/bootstrap process must be confirmed before production exposure.

Known constraints:

- Local seed tooling exists.
- `seed:local` must not be run against a production database.
- No production bootstrap command was verified during Phase 1 or Phase 2.

Required owner action before launch:

1. Confirm the approved first-admin creation path.
2. Confirm the admin email and role policy.
3. Confirm temporary credentials or setup token handling.
4. Confirm MFA enrollment expectation for the first admin.
5. Confirm password reset/setup-token flow in production.

## Admin Smoke Tests

Run after deployment:

1. `/admin/login` loads.
2. Invalid login fails safely.
3. Valid login creates a session.
4. MFA challenge flow works if enabled.
5. Session restores after refresh.
6. Logout clears session.
7. Dashboard loads.
8. Users page loads.
9. Bookings page loads.
10. Payments/refunds pages load.
11. Wallet page loads.
12. System/health page can reach backend.
13. Expired or revoked session redirects correctly.
