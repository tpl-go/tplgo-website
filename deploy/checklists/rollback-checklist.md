# Rollback Checklist

Use rollback if production health checks, admin access, mock booking flow, or service startup fails after deployment.

1. Stop and record the failure condition.
2. Capture logs before rollback.
   - `pm2 logs tpl-api --lines 100`
   - `pm2 logs tpl-web --lines 100`
   - Nginx access/error logs

3. Return to the previous approved commit.
   - `git checkout PREVIOUS_COMMIT`

4. Restore frontend env if changed.
   - Restore `.env.production.local` from backup.

5. Restore backend env if changed.
   - Restore `tpl-api/.env` from backup.

6. Reinstall dependencies only if lockfiles changed.
   - Root: `npm ci`
   - Backend: `cd tpl-api && npm ci`

7. Rebuild.
   - Root: `npm run build`
   - Backend: `cd tpl-api && npm run build`

8. Reload PM2.
   - `pm2 reload tpl-api --update-env`
   - `pm2 reload tpl-web --update-env`
   - `pm2 save`

9. Restore Nginx config if changed.
   - `nginx -t`
   - `systemctl reload nginx`

10. Restore database only if an approved migration changed schema/data and rollback requires it.
11. Re-run frontend, backend health, admin, and mock booking smoke tests.
12. Document root cause before attempting redeploy.
