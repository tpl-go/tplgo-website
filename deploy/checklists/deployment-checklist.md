# Deployment Checklist

Use this checklist for mock/provider-disabled deployment only.

1. Confirm Phase 1 and Phase 2 reports are approved.
2. Confirm real supplier APIs remain disabled.
3. Confirm mock/local booking flow remains active.
4. Confirm production env files exist on the server.
5. Confirm `NEXT_PUBLIC_TPL_USE_BACKEND_CHECKOUT=false`.
6. Confirm `PAYMENT_GATEWAY=mock`.
7. Confirm `PROVIDERS_ENABLED=false`.
8. Confirm `PROVIDERS_DRY_RUN=true`.
9. Confirm `ADMIN_AUTH_MODE=password`.
10. Confirm `ADMIN_DEV_LOGIN_ENABLED=false`.
11. Confirm `ADMIN_MFA_SECRET_ENCRYPTION_KEY` is set.
12. Confirm `ADMIN_PASSWORD_PEPPER` is set.
13. Run backup checklist.
14. Pull approved code.
15. Run `npm ci` in the project root.
16. Run `npm.cmd run build` locally or `npm run build` on Linux.
17. Run `npm ci` in `tpl-api`.
18. Run `npm run build` in `tpl-api`.
19. Run `npm run typecheck` in `tpl-api`.
20. Run `npm test -- --reporter=dot` in `tpl-api`.
21. Run database migrations only after backup and approval.
22. Start or reload PM2 apps.
23. Run `nginx -t`.
24. Reload Nginx.
25. Verify frontend URL.
26. Verify API health URL.
27. Verify admin login.
28. Run mock booking smoke test.
