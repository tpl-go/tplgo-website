# Contabo Server Deployment Guide

## Status

Server execution pending manual run by project owner.

Codex does not have active SSH access to the Contabo server in this workspace. The following commands are a controlled server-side execution guide. Do not paste commands blindly. Replace placeholders, verify each result, and stop on any unexpected output.

## Deployment Mode

This guide is for mock/provider-disabled deployment only.

Required locked settings:

```bash
NEXT_PUBLIC_TPL_USE_BACKEND_CHECKOUT=false
NEXT_PUBLIC_TPL_BACKEND_FALLBACK_TO_LOCAL=true
PAYMENT_GATEWAY=mock
PROVIDERS_ENABLED=false
PROVIDERS_DRY_RUN=true
REDIS_ENABLED=false
QUEUE_ENABLED=false
```

Do not enable real supplier APIs or real payment gateways.

## Placeholders

Replace before use:

- `SSH_USER`
- `CONTABO_HOST`
- `/var/www/tpl-project`
- `tpl.example.com`
- `www.tpl.example.com`
- `api.tpl.example.com`
- `PREVIOUS_COMMIT`

Do not put secrets in terminal transcripts, screenshots, or reports.

## 1. SSH Login

```bash
ssh SSH_USER@CONTABO_HOST
```

Confirm server identity:

```bash
hostname
whoami
pwd
date
```

## 2. Server Verification

Run the full checklist:

```bash
cd /var/www/tpl-project
cat deploy/checklists/server-verification-checklist.md
```

Core commands:

```bash
uname -a
cat /etc/os-release
node -v
npm -v
pm2 -v
pm2 list
nginx -v
sudo nginx -t
systemctl status nginx --no-pager
systemctl status postgresql --no-pager
pg_isready
systemctl status redis-server --no-pager
sudo ufw status verbose
ss -ltnp
```

Stop if:

- Node is below version 20.
- Nginx config is already invalid.
- PostgreSQL is unavailable.
- Disk space is low.
- Existing live service state is unknown.

## 3. Project Folder Verification

```bash
cd /var/www/tpl-project
pwd
git status --short
git rev-parse HEAD
git branch --show-current
ls -la
```

Stop if:

- Project path is different from `ecosystem.config.cjs`.
- There are uncommitted server changes that have not been reviewed.
- The branch is not the approved deployment branch.

## 4. Environment File Safety

Do not overwrite existing env files.

Check existence:

```bash
test -f .env.production.local && echo "frontend env exists" || echo "frontend env missing"
test -f tpl-api/.env && echo "backend env exists" || echo "backend env missing"
```

Create from templates only if missing:

```bash
test -f .env.production.local || cp deploy/env/frontend.production.env.example .env.production.local
test -f tpl-api/.env || cp deploy/env/backend.production.env.example tpl-api/.env
```

Edit values manually on the server:

```bash
nano .env.production.local
nano tpl-api/.env
```

Verify required flags without printing secrets:

```bash
grep -E "^(NEXT_PUBLIC_TPL_USE_BACKEND_CHECKOUT|NEXT_PUBLIC_TPL_BACKEND_FALLBACK_TO_LOCAL)=" .env.production.local
grep -E "^(NODE_ENV|PAYMENT_GATEWAY|PROVIDERS_ENABLED|PROVIDERS_DRY_RUN|REDIS_ENABLED|QUEUE_ENABLED|ADMIN_AUTH_MODE|ADMIN_DEV_LOGIN_ENABLED)=" tpl-api/.env
```

Expected:

- `NEXT_PUBLIC_TPL_USE_BACKEND_CHECKOUT=false`
- `NEXT_PUBLIC_TPL_BACKEND_FALLBACK_TO_LOCAL=true`
- `NODE_ENV=production`
- `PAYMENT_GATEWAY=mock`
- `PROVIDERS_ENABLED=false`
- `PROVIDERS_DRY_RUN=true`
- `REDIS_ENABLED=false`
- `QUEUE_ENABLED=false`
- `ADMIN_AUTH_MODE=password`
- `ADMIN_DEV_LOGIN_ENABLED=false`

## 5. Backups

Create a timestamp:

```bash
DEPLOY_TS="$(date +%Y%m%d-%H%M%S)"
BACKUP_DIR="$HOME/tpl-backups/$DEPLOY_TS"
mkdir -p "$BACKUP_DIR"
```

Backup env files:

```bash
cp .env.production.local "$BACKUP_DIR/.env.production.local.backup"
cp tpl-api/.env "$BACKUP_DIR/tpl-api.env.backup"
```

Backup Nginx config:

```bash
sudo cp -a /etc/nginx/sites-available "$BACKUP_DIR/nginx-sites-available"
sudo cp -a /etc/nginx/sites-enabled "$BACKUP_DIR/nginx-sites-enabled"
```

Backup PM2 state:

```bash
pm2 list > "$BACKUP_DIR/pm2-list.txt"
pm2 save
cp ~/.pm2/dump.pm2 "$BACKUP_DIR/pm2-dump.pm2"
```

Backup database before any migration:

```bash
set -a
. tpl-api/.env
set +a
pg_dump "$DATABASE_URL" > "$BACKUP_DIR/tpl-db-before-deploy.sql"
test -s "$BACKUP_DIR/tpl-db-before-deploy.sql" && echo "database backup created"
```

Do not run migrations if database backup fails.

## 6. Git Update

```bash
cd /var/www/tpl-project
git status --short
git fetch --all --prune
git pull
git rev-parse HEAD
```

Stop if pull conflicts or overwrites unreviewed server changes.

## 7. Install Dependencies

Root:

```bash
cd /var/www/tpl-project
npm ci
```

Backend:

```bash
cd /var/www/tpl-project/tpl-api
npm ci
```

## 8. Build And Verify

Frontend build:

```bash
cd /var/www/tpl-project
npm run build
```

Frontend lint note:

```bash
cd /var/www/tpl-project
npm run lint
```

Known Phase 3 status: frontend lint is scoped correctly but still has existing source lint debt. Do not mass-refactor during server deployment.

Backend:

```bash
cd /var/www/tpl-project/tpl-api
npm run build
npm run typecheck
npm test -- --reporter=dot
```

Stop if frontend build, backend build, backend typecheck, or backend tests fail.

## 9. Database Safety

Connection check:

```bash
cd /var/www/tpl-project/tpl-api
set -a
. .env
set +a
psql "$DATABASE_URL" -c "select now();"
psql "$DATABASE_URL" -c "\dt"
```

Migration rule:

- Do not run migrations unless database backup is complete and approved.
- Do not run `npm run seed:local` against production.

Migration command, only after explicit approval:

```bash
cd /var/www/tpl-project/tpl-api
npm run db:migrate
```

Restore warning:

- Restore database only if an approved migration changed schema/data and rollback requires it.
- Never restore over production without owner approval.

## 10. PM2 Deployment

First-time start:

```bash
cd /var/www/tpl-project
pm2 start ecosystem.config.cjs
pm2 save
pm2 list
```

Safe update reload:

```bash
pm2 reload tpl-api --update-env
pm2 reload tpl-web --update-env
pm2 save
pm2 list
```

Validation:

```bash
pm2 describe tpl-api
pm2 describe tpl-web
pm2 logs tpl-api --lines 100
pm2 logs tpl-web --lines 100
```

Restart only if reload fails:

```bash
pm2 restart tpl-api --update-env
pm2 restart tpl-web --update-env
pm2 save
```

Startup persistence:

```bash
pm2 startup
pm2 save
```

Run the printed `sudo` startup command if PM2 instructs you to do so.

## 11. Nginx Deployment

Copy template:

```bash
sudo cp deploy/nginx-tpl.conf /etc/nginx/sites-available/tpl.conf
```

Replace domains and certificate paths:

```bash
sudo nano /etc/nginx/sites-available/tpl.conf
```

Required replacements:

- `tpl.example.com` -> production frontend domain.
- `www.tpl.example.com` -> production www domain.
- `api.tpl.example.com` -> production API subdomain.
- Certificate paths -> actual `/etc/letsencrypt/live/...` paths.

Enable site:

```bash
sudo ln -sfn /etc/nginx/sites-available/tpl.conf /etc/nginx/sites-enabled/tpl.conf
sudo nginx -t
sudo systemctl reload nginx
```

SSL certificate creation, only if missing:

```bash
sudo certbot --nginx -d tpl.example.com -d www.tpl.example.com
sudo certbot --nginx -d api.tpl.example.com
sudo nginx -t
sudo systemctl reload nginx
```

## 12. Health Checks

Backend:

```bash
curl -i https://api.tpl.example.com/api/v1/health
```

Frontend:

```bash
curl -I https://tpl.example.com
curl -I https://www.tpl.example.com
```

Admin:

```bash
curl -I https://tpl.example.com/admin/login
```

## 13. Smoke Tests

Run:

```bash
cat deploy/checklists/smoke-test-checklist.md
cat deploy/checklists/admin-production-checklist.md
```

Minimum manual checks:

- Homepage loads.
- User login flow loads.
- Mock booking flow completes.
- Confirmation page loads.
- My Booking list/detail works.
- Admin login works.
- Admin dashboard loads.
- Backend health is reachable.

## 14. Rollback Commands

Use only after recording failure condition and logs.

```bash
cd /var/www/tpl-project
git checkout PREVIOUS_COMMIT
npm ci
npm run build
cd tpl-api
npm ci
npm run build
cd ..
pm2 reload tpl-api --update-env
pm2 reload tpl-web --update-env
pm2 save
sudo nginx -t
sudo systemctl reload nginx
```

Restore env files if changed:

```bash
cp "$BACKUP_DIR/.env.production.local.backup" /var/www/tpl-project/.env.production.local
cp "$BACKUP_DIR/tpl-api.env.backup" /var/www/tpl-project/tpl-api/.env
```

Restore Nginx config if changed:

```bash
sudo cp -a "$BACKUP_DIR/nginx-sites-available/." /etc/nginx/sites-available/
sudo cp -a "$BACKUP_DIR/nginx-sites-enabled/." /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

Database restore warning:

- Do not restore the database unless an approved migration changed schema/data and rollback requires it.
- Confirm owner approval before any restore.
