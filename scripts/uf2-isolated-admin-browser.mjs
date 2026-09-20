// Optional isolated integration harness. Real built Admin UI + real Fastify
// routes/PostgreSQL supplied by the test; no mocked application responses.
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

export async function runIsolatedAdminBrowser({ request, sessions, submissionId, output }) {
  const base = 'http://127.0.0.1:3158';
  await mkdir(output, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const results = [];
  try {
    for (const [index, viewport] of [{ width: 1365, height: 1000 }, { width: 768, height: 1024 }, { width: 390, height: 844 }].entries()) {
      const context = await browser.newContext({ viewport });
      // Real password-authenticated isolated sessions, never staging credentials.
      await context.addInitScript(session => localStorage.setItem('tpl_admin_session_v1', JSON.stringify(session)), sessions[index]);
      await context.route('**/*', async route => {
        const req = route.request(), url = new URL(req.url());
        if (!url.pathname.includes('/api/')) return url.origin === base ? route.continue() : route.abort();
        const allowed = url.pathname === '/api/v1/admin/me' || url.pathname.startsWith('/api/v1/admin/partner-applications');
        if (!allowed) return route.abort();
        const response = await request({ method: req.method(), url: url.pathname + url.search, headers: req.headers(), ...(req.postData() ? { payload: req.postData() } : {}) });
        await route.fulfill({ status: response.statusCode, headers: { 'content-type': String(response.headers['content-type'] ?? 'application/json'), 'cache-control': 'private, no-store', ...(response.headers['content-disposition'] ? { 'content-disposition': String(response.headers['content-disposition']) } : {}) }, body: response.rawPayload });
      });
      const page = await context.newPage();
      await page.goto(base + '/admin/partners/applications?status=APPROVED');
      await page.getByRole('link', { name: 'Open application', exact: true }).waitFor();
      for (const format of ['CSV', 'XLSX']) {
        const pending = page.waitForEvent('download');
        await page.getByRole('button', { name: 'Export ' + format, exact: true }).click();
        const download = await pending;
        assert.equal(await download.failure(), null);
        await download.saveAs(path.join(output, `applications-${index}.${format.toLowerCase()}`));
      }
      await page.getByRole('link', { name: 'Open application', exact: true }).click();
      await page.getByRole('heading', { name: 'Ready Step 8 Partner', exact: true }).waitFor();
      assert(page.url().endsWith('/' + submissionId));
      await page.getByText('Resubmission 2 · Approved', { exact: true }).waitFor();
      const startReview = page.getByRole('button', { name: 'Start review', exact: true });
      if (await startReview.count()) assert.equal(await startReview.isEnabled(), false);
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
      await page.screenshot({ path: path.join(output, `approved-${viewport.width}.png`), fullPage: true });
      if (index === 0) {
        const pending = page.waitForEvent('download');
        await page.getByRole('button', { name: 'Export PDF', exact: true }).click();
        const download = await pending;
        assert.equal(await download.failure(), null);
        await download.saveAs(path.join(output, 'review-summary.pdf'));
        await page.emulateMedia({ media: 'print' });
        await page.pdf({ path: path.join(output, 'print-summary.pdf'), format: 'A4', printBackground: true });
      }
      results.push({ actor: `TEST_L${index + 1}`, ...viewport, result: 'PASS', checks: ['real isolated list and detail', 'approved revision visible', 'CSV and XLSX download', 'no horizontal overflow'], evidence: 'production-built Admin + real authenticated routes + isolated PostgreSQL' });
      await context.close();
    }
  } finally {
    await writeFile(path.join(output, 'results.json'), JSON.stringify(results, null, 2));
    await browser.close();
  }
  return results;
}
