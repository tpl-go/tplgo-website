// Local production-build regression. Synthetic Admin session only; all APIs
// intercepted and every mutation/external request blocked. No live records.
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';

const base = 'http://127.0.0.1:3136';
const out = '.tmp/admin-partner-shell-browser';
await mkdir(out, { recursive: true });
const tabs = ['Overview', 'Applications', 'All Partners', 'Reports'];
const routes = ['/admin/partners', '/admin/partners/applications', '/admin/partners/organizations', '/admin/partners/reports'];
const admin = { id: 'synthetic-shell-reviewer', fullName: 'Synthetic Reviewer', email: '', status: 'active', roles: ['synthetic'], permissions: ['partner_application.read', 'partner_verification.read'] };
const session = { admin, session: { id: 'synthetic-session', token: 'local-render-test-only', createdAt: '2026-01-01T00:00:00Z', expiresAt: '2099-01-01T00:00:00Z' } };
const results = [];
const browser = await chromium.launch({ headless: true });
try {
  for (const [width, height] of [[1365, 900], [768, 1024], [390, 844]]) {
    const context = await browser.newContext({ viewport: { width, height } });
    const writes = [], partnerReads = [], errors = [];
    await context.addInitScript(value => localStorage.setItem('tpl_admin_session_v1', JSON.stringify(value)), session);
    await context.route('**/*', async route => {
      const request = route.request(), url = new URL(request.url());
      if (!url.pathname.includes('/api/')) return url.origin === base ? route.continue() : route.abort();
      if (request.method() !== 'GET') { writes.push(url.pathname); return route.abort(); }
      if (url.pathname.startsWith('/api/v1/admin/partner')) partnerReads.push(url.pathname);
      const data = url.pathname.endsWith('/admin/me') ? admin : url.pathname.endsWith('/admin/notifications') ? { unreadCount: 0, notifications: [] } : {};
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, data, meta: { requestId: 'synthetic-request', apiVersion: 'v1' } }) });
    });
    const page = await context.newPage(); page.setDefaultTimeout(15000);
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(base + routes[0]);
    const nav = page.getByRole('navigation', { name: 'Partner navigation', exact: true });
    const panel = page.locator('[data-partner-module-panel]');
    await nav.waitFor();
    assert.deepEqual(await nav.getByRole('link').allTextContents(), tabs);
    assert.equal(await nav.locator('[aria-current="page"]').textContent(), 'Overview');
    assert.deepEqual(await page.locator('aside a[href^="/admin/partners"]').allTextContents(), ['Partners']);
    for (let index = 0; index < tabs.length; index++) {
      await nav.getByRole('link', { name: tabs[index], exact: true }).click();
      await panel.getByRole('heading', { name: tabs[index], exact: true }).waitFor();
      assert.equal(new URL(page.url()).pathname, routes[index]);
      assert.equal(await nav.locator('[aria-current="page"]').count(), 1);
      assert.equal(await nav.locator('[aria-current="page"]').textContent(), tabs[index]);
      assert.equal(await page.getByRole('heading', { level: 1, name: 'Partners', exact: true }).count(), 1);
      assert.equal(await panel.locator('table,form,button,input,canvas').count(), 0);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'no whole-page horizontal overflow');
      const bounds = await nav.getByRole('link').evaluateAll(elements => elements.map(element => { const r = element.getBoundingClientRect(); return { x: r.x, right: r.right, width: r.width }; }));
      assert.ok(bounds.every(r => r.x >= 0 && r.right <= width && r.width > 40), 'four readable tabs inside viewport');
      if (index === 0 || index === 3) await page.screenshot({ path: `${out}/${width}-${index === 0 ? 'overview' : 'reports'}.png`, fullPage: true });
    }
    await page.reload(); await panel.getByRole('heading', { name: 'Reports', exact: true }).waitFor();
    await page.goBack(); await panel.getByRole('heading', { name: 'All Partners', exact: true }).waitFor();
    await nav.getByRole('link', { name: 'Applications', exact: true }).focus();
    await page.keyboard.press('Enter'); await panel.getByRole('heading', { name: 'Applications', exact: true }).waitFor();
    assert.deepEqual(writes, []); assert.deepEqual(partnerReads, []); assert.deepEqual(errors, []);
    results.push({ width, height, result: 'PASS', tabCount: 4, sidebarPartnerEntries: 1, partnerReads: 0, mutations: 0, checks: ['order', 'default Overview', 'active state', 'four routes', 'refresh', 'Back', 'keyboard', 'all labels visible', 'no overflow', 'empty shell'] });
    await context.close();
  }
} finally {
  await browser.close();
  await writeFile(`${out}/results.json`, JSON.stringify(results, null, 2));
}
console.log(JSON.stringify(results));
