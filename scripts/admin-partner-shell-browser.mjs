// Local built-app checks only. Synthetic Admin session; all APIs intercepted.
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
const base = 'http://127.0.0.1:3136', out = '.tmp/admin-partner-subviews-browser';
await mkdir(out, { recursive: true });
const tabs = ['Overview', 'Applications', 'All Partners', 'Reports'];
const routes = ['/admin/partners', '/admin/partners/applications', '/admin/partners/organizations', '/admin/partners/reports'];
const views = [
  ['Summary', 'Performance', 'Revenue', 'Services', 'Alerts & Actions'],
  ['All Applications', 'New', 'Under Review', 'Documents Pending', 'Approved', 'Rejected'],
  ['All', 'Active', 'Inactive', 'Suspended'],
  ['Partner Performance', 'Business & Bookings', 'Revenue & Commission', 'Settlement & Payments', 'Domain & Service', 'Geography'],
];
const admin = { id: 'synthetic-shell-reviewer', fullName: 'Synthetic Reviewer', email: '', status: 'active', roles: ['synthetic'], permissions: ['partner_application.read', 'partner_verification.read'] };
const session = { admin, session: { id: 'synthetic-session', token: 'local-render-test-only', createdAt: '2026-01-01T00:00:00Z', expiresAt: '2099-01-01T00:00:00Z' } };
const results = [], browser = await chromium.launch({ headless: true });
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
    const sidebar = page.locator('aside nav[aria-label="Partners sidebar sections"]');
    const panel = page.locator('[data-partner-module-panel]');
    await nav.waitFor();
    await sidebar.locator('a[href="/admin/partners"]').waitFor({ state: 'attached' });
    assert.deepEqual(await nav.getByRole('link').allTextContents(), tabs);
    assert.deepEqual(await sidebar.locator('a').allTextContents(), tabs);
    assert.equal(await nav.locator('[aria-current="page"]').textContent(), 'Overview');
    for (let index = 0; index < tabs.length; index++) {
      await nav.getByRole('link', { name: tabs[index], exact: true }).click();
      await panel.getByRole('heading', { level: 2, name: tabs[index], exact: true }).waitFor();
      assert.equal(new URL(page.url()).pathname, routes[index]);
      assert.equal(await nav.locator('[aria-current="page"]').textContent(), tabs[index]);
      assert.equal(await sidebar.locator('[aria-current="page"]').textContent(), tabs[index]);
      const subnav = page.getByRole('navigation', { name: tabs[index] + ' views', exact: true });
      assert.deepEqual(await subnav.getByRole('link').allTextContents(), views[index]);
      await panel.getByRole('heading', { level: 3, name: views[index][0], exact: true }).waitFor();
      for (const name of views[index]) {
        const viewLink = subnav.getByRole('link', { name, exact: true });
        const destination = await viewLink.getAttribute('href');
        await viewLink.click();
        await page.waitForURL(base + destination);
        await panel.getByRole('heading', { level: 3, name, exact: true }).waitFor();
        assert.equal(await subnav.locator('[aria-current="page"]').count(), 1);
        assert.equal(await subnav.locator('[aria-current="page"]').textContent(), name);
        assert.ok(new URL(page.url()).searchParams.has('view'));
        assert.equal(await panel.locator('table,form,button,input,canvas').count(), 0);
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'no whole-page overflow');
        assert.ok(await subnav.getByRole('link').evaluateAll(els => els.every(el => { const r=el.getBoundingClientRect();return r.x>=0 && r.right<=innerWidth && el.scrollWidth<=el.clientWidth; })), 'no clipped view labels');
      }
      const lastViewUrl = page.url();
      const previousViewHref = await subnav.getByRole('link', { name: views[index].at(-2), exact: true }).getAttribute('href');
      await page.reload(); await panel.getByRole('heading', { level: 3, name: views[index].at(-1), exact: true }).waitFor();
      await page.goBack(); await page.waitForURL(base + previousViewHref); await panel.getByRole('heading', { level: 3, name: views[index].at(-2), exact: true }).waitFor();
      await page.waitForLoadState('networkidle');
      await page.goForward(); await page.waitForURL(lastViewUrl);
      try { await panel.getByRole('heading', { level: 3, name: views[index].at(-1), exact: true }).waitFor(); } catch (error) { console.log(JSON.stringify({ stage: 'forward', url: page.url(), headings: await panel.getByRole('heading').allTextContents(), active: await subnav.locator('[aria-current]').allTextContents(), errors })); await page.screenshot({ path: out + '/forward-failure.png', fullPage: true }); throw error; }
      await subnav.getByRole('link', { name: views[index][0], exact: true }).focus();
      await page.keyboard.press('Enter'); await panel.getByRole('heading', { level: 3, name: views[index][0], exact: true }).waitFor();
      if (width === 1365) await sidebar.getByRole('link', { name: tabs[index], exact: true }).scrollIntoViewIfNeeded();
      await page.screenshot({ path: `${out}/${width}-${index}.png`, fullPage: true });
    }
    if (width === 1365) {
      for (const name of tabs) {
        await sidebar.getByRole('link', { name, exact: true }).click();
        await panel.getByRole('heading', { level: 2, name, exact: true }).waitFor();
        assert.equal(await nav.locator('[aria-current="page"]').textContent(), name);
      }
      await page.locator('aside a[href="/admin/partners"]').filter({ hasText: /^Partners$/ }).click();
      await panel.getByRole('heading', { level: 3, name: 'Summary', exact: true }).waitFor();
    }
    await page.goto(base + '/admin/partners?view=unknown');
    await panel.getByRole('heading', { level: 3, name: 'Summary', exact: true }).waitFor();
    assert.deepEqual(writes, []); assert.deepEqual(partnerReads, []); assert.deepEqual(errors, []);
    results.push({ width, height, result: 'PASS', mainTabs: 4, subviews: 21, sidebarChildren: 4, partnerReads: 0, mutations: 0, checks: ['exact hierarchy', 'all views clickable', 'defaults', 'active states', 'refresh', 'Back/Forward', 'keyboard', 'invalid view fallback', 'sidebar route parity', 'no clipped labels/overflow', 'empty views'] });
    await context.close();
  }
} finally { await browser.close(); await writeFile(`${out}/results.json`, JSON.stringify(results, null, 2)); }
console.log(JSON.stringify(results));
