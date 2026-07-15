# TPL Deployment Runbook

## Purpose

This runbook prepares the TPL project for a mock/provider-disabled Contabo deployment. It does not enable real supplier APIs, real payment gateways, new product features, or UI changes.

## Target Architecture

- Nginx terminates HTTP/TLS on ports `80` and `443`.
- Frontend Next.js runs on `127.0.0.1:3000` as PM2 app `tpl-web`.
- Backend Fastify API runs on `127.0.0.1:4000` or `0.0.0.0:4000` as PM2 app `tpl-api`.
- PostgreSQL runs locally or privately on `5432`.
- Redis and queues remain disabled unless explicitly verified and approved.

## Required Files

- Root PM2 config: `ecosystem.config.cjs`
- Nginx template: `deploy/nginx-tpl.conf`
- Frontend env template: `deploy/env/frontend.production.env.example`
- Backend env template: `deploy/env/backend.production.env.example`
- Lint strategy: `deploy/LINT_STRATEGY.md`
- Backup checklist: `deploy/checklists/backup-checklist.md`
- Deployment checklist: `deploy/checklists/deployment-checklist.md`
- Rollback checklist: `deploy/checklists/rollback-checklist.md`
- Admin readiness: `deploy/ADMIN_PRODUCTION_READINESS.md`

## Server Verification

Run on Contabo before deployment:

```bash
node -v
npm -v
pm2 -v
pm2 list
pm2 logs --lines 100
nginx -t
systemctl status nginx
ls -la /etc/nginx/sites-enabled
systemctl status postgresql
pg_isready
systemctl status redis-server
ss -ltnp
```

## Environment Setup

1. Copy `deploy/env/frontend.production.env.example` to `.env.production.local`.
2. Copy `deploy/env/backend.production.env.example` to `tpl-api/.env`.
3. Replace all example domains and placeholder secrets.
4. Keep mock deployment flags:

```bash
NEXT_PUBLIC_TPL_USE_BACKEND_CHECKOUT=false
NEXT_PUBLIC_TPL_BACKEND_FALLBACK_TO_LOCAL=true
PAYMENT_GATEWAY=mock
PROVIDERS_ENABLED=false
PROVIDERS_DRY_RUN=true
REDIS_ENABLED=false
QUEUE_ENABLED=false
```

## Build And Verification

Run from project root:

```bash
npm ci
npm run build
npm run lint
```

Run from backend:

```bash
cd tpl-api
npm ci
npm run build
npm run typecheck
npm test -- --reporter=dot
```

Current Phase 2 note: backend build, typecheck, and tests are the authoritative backend gates. Root/frontend lint is scoped away from backend code but still has existing frontend source lint debt that must be tracked separately from runtime deployment readiness.

## PM2 Start Or Reload

Initial start:

```bash
pm2 start ecosystem.config.cjs
pm2 save
```

Existing deployment reload:

```bash
pm2 reload tpl-api --update-env
pm2 reload tpl-web --update-env
pm2 save
```

## Nginx Setup

1. Copy `deploy/nginx-tpl.conf` to `/etc/nginx/sites-available/tpl.conf`.
2. Replace example domains and certificate paths.
3. Enable the site.
4. Test and reload:

```bash
nginx -t
systemctl reload nginx
```

## Smoke Tests

Frontend:

```bash
curl -I https://tpl.example.com
curl -I https://www.tpl.example.com
```

Backend:

```bash
curl -i https://api.tpl.example.com/api/v1/health
```

User flow:

- Homepage loads.
- Flight or hotel flow reaches mock/local booking.
- Mock/local payment completes.
- Confirmation page loads.
- My Booking list and detail load.

Admin flow:

- `/admin/login` loads.
- Valid admin login succeeds.
- Session restores after refresh.
- Logout clears session.
- System/health page can reach backend.

## Rollback

Use `deploy/checklists/rollback-checklist.md`.

Do not restore the database unless an approved migration changed schema/data and rollback requires it.
