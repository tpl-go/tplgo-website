# Admin Production Checklist

Use this checklist before exposing `/admin` to production users.

## Environment

Verify on the server without printing secrets:

```bash
cd /var/www/tpl-project/tpl-api
grep -E "^(ADMIN_AUTH_MODE|ADMIN_DEV_LOGIN_ENABLED|ADMIN_SSO_ENABLED|ADMIN_SSO_PROVIDER|ADMIN_SESSION_TTL_SECONDS)=" .env
test -n "$(grep '^ADMIN_PASSWORD_PEPPER=' .env | cut -d= -f2-)" && echo "ADMIN_PASSWORD_PEPPER set"
test -n "$(grep '^ADMIN_MFA_SECRET_ENCRYPTION_KEY=' .env | cut -d= -f2-)" && echo "ADMIN_MFA_SECRET_ENCRYPTION_KEY set"
```

Required:

- `ADMIN_AUTH_MODE=password`
- `ADMIN_DEV_LOGIN_ENABLED=false`
- `ADMIN_PASSWORD_PEPPER` is set to a strong secret.
- `ADMIN_MFA_SECRET_ENCRYPTION_KEY` is set to a strong secret.
- `ADMIN_SSO_ENABLED=false` unless SSO is fully approved and configured.

## First Admin / Bootstrap

Required owner confirmation:

1. Approved first-admin creation path is known.
2. `seed:local` is not used against production.
3. Admin email and role policy are approved.
4. Setup token or temporary credential handling is approved.
5. MFA enrollment expectation is approved.
6. Password reset/setup-token flow is verified.

## Login Flow

Manual browser checks:

1. `/admin/login` loads.
2. Invalid login fails safely.
3. Valid login creates a session.
4. MFA challenge flow works if enabled.
5. Session persists after refresh until expiry.
6. Logout clears session.
7. Expired/revoked sessions redirect to login.

## Admin Pages

Manual browser checks:

1. Dashboard loads.
2. Users page loads.
3. Bookings page loads.
4. Payments page loads.
5. Refunds page loads.
6. Wallet page loads.
7. Security sessions page loads.
8. MFA controls page loads.
9. System/health page reaches backend.

## Session Storage

Frontend storage keys:

- Local storage: `tpl_admin_session_v1`
- Session storage: `tpl_admin_mfa_challenge_v1`

Verify:

- Logout clears active admin session.
- Expired session is not reused.
- MFA challenge does not survive beyond intended flow.
