# Contabo Server Verification Checklist

Use this checklist before any deployment command changes code, PM2, Nginx, environment files, or database state.

## Access

1. Confirm SSH hostname or IP is correct.
2. Confirm SSH user has required privileges.
3. Confirm sudo access if Nginx/system services must be managed.
4. Confirm current project owner or release owner is available during deployment.

## Operating System

```bash
uname -a
cat /etc/os-release
uptime
df -h
free -h
```

Verify:

- OS is supported for Node, PM2, Nginx, PostgreSQL, and Certbot.
- Disk space is sufficient before dependency install/build.
- Memory is sufficient for Next.js build and backend tests.

## Node And npm

```bash
node -v
npm -v
which node
which npm
```

Verify:

- Node is `>=20.0.0`.
- npm is available to the deployment user.

## PM2

```bash
pm2 -v
pm2 list
pm2 describe tpl-web
pm2 describe tpl-api
pm2 logs --lines 100
pm2 startup
```

Verify:

- PM2 is installed.
- Existing process names are known.
- Existing PM2 state is backed up before changes.
- Startup command is configured after final process save.

## Nginx

```bash
nginx -v
sudo nginx -t
systemctl status nginx --no-pager
ls -la /etc/nginx/sites-available
ls -la /etc/nginx/sites-enabled
```

Verify:

- Nginx config is valid before changes.
- Existing enabled sites are known.
- Current TPL site config, if any, is backed up.

## PostgreSQL

```bash
systemctl status postgresql --no-pager
pg_isready
psql "$DATABASE_URL" -c "select now();"
psql "$DATABASE_URL" -c "\dt"
```

Verify:

- PostgreSQL is running.
- `DATABASE_URL` connects to the intended database.
- Existing schema/tables are visible.
- Backup is created before any migration.

## Redis

```bash
systemctl status redis-server --no-pager
redis-cli ping
```

Verify:

- Redis status is known.
- For Phase 3 mock deployment, Redis and queues remain disabled unless explicitly approved.

## Firewall And Ports

```bash
sudo ufw status verbose
ss -ltnp
```

Verify:

- Public ports: `80`, `443`, and SSH only unless explicitly required.
- Internal app ports `3000` and `4000` are not publicly exposed unless intentionally firewalled.
- PostgreSQL `5432` is local/private only.
- Redis `6379` is local/private only or disabled.

## Domain Mapping

```bash
dig +short tpl.example.com
dig +short www.tpl.example.com
dig +short api.tpl.example.com
```

Verify:

- Main domain points to the Contabo server.
- `www` points to the Contabo server.
- API subdomain points to the Contabo server.

## SSL/TLS

```bash
sudo certbot certificates
ls -la /etc/letsencrypt/live
```

Verify:

- Certificates exist for frontend domain.
- Certificates exist for API subdomain.
- Nginx template certificate paths match actual paths.

## Project Path

```bash
pwd
ls -la /var/www
ls -la /var/www/tpl-project
cd /var/www/tpl-project
git status --short
git rev-parse HEAD
```

Verify:

- Project path matches `ecosystem.config.cjs` or config is adjusted before use.
- Git branch and commit are expected.
- No uncommitted production changes will be overwritten.

## Environment Files

```bash
cd /var/www/tpl-project
test -f .env.production.local && echo "frontend env exists"
test -f tpl-api/.env && echo "backend env exists"
```

Verify without printing secrets:

- Frontend env exists.
- Backend env exists.
- Env files are backed up before modification.
- No production secrets are copied into reports.

## Current Runtime State

```bash
pm2 list
curl -I https://tpl.example.com
curl -i https://api.tpl.example.com/api/v1/health
```

Verify:

- Current live state is recorded before changes.
- Any existing live service failures are known before deployment.
