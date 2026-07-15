# Backup Checklist

Complete this checklist before changing production code, environment files, Nginx, PM2, or database state.

1. Record current commit.
   - `git rev-parse HEAD`

2. Record current working tree state.
   - `git status --short`

3. Backup frontend env.
   - `.env.production.local`

4. Backup backend env.
   - `tpl-api/.env`

5. Backup Nginx site config.
   - `/etc/nginx/sites-available/*tpl*`
   - `/etc/nginx/sites-enabled/*tpl*`

6. Backup PM2 process list.
   - `pm2 list`
   - `pm2 save`
   - Copy `~/.pm2/dump.pm2` if operational policy requires it.

7. Backup PostgreSQL before migrations.
   - `pg_dump "$DATABASE_URL" > tpl-backup-before-deploy.sql`

8. Verify backup readability.
   - Confirm env backups are present.
   - Confirm PostgreSQL dump is non-empty.
   - Store backups outside the release directory.

9. Do not run `npm run seed:local` against production.
