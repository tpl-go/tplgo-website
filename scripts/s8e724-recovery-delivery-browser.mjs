import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';

// All API requests are intercepted. This proves UI behavior, never OTP delivery.
const browser = await chromium.launch({ headless: true });
const evidence = [];
await mkdir('tmp/s8e724-artifacts', { recursive: true });
try {
  for (const width of [1363, 768, 390]) {
    for (const mode of ['india', 'international', 'email', 'limited', 'unavailable']) {
      const context = await browser.newContext({ viewport: { width, height: 950 } });
      const page = await context.newPage();
      let starts = 0;
      await context.route('https://api-staging.tplgo.com/**', async route => {
        const path = new URL(route.request().url()).pathname;
        let data = {}, status = 200;
        if (path === '/api/v1/auth/session' || path === '/api/v1/me') data = { user: { id: 'synthetic-source', fullName: 'Recovery QA', mobile: '', email: '', accountType: 'partner' }, session: { token: 'synthetic-local-only-session', expiresAt: '2030-01-01T00:00:00Z' } };
        if (path === '/api/v1/partner/access') data = { outcome: 'NO_LINKED_PROFILE', organizationId: null, step: null };
        if (path.endsWith('/recovery/start')) {
          starts++;
          const body = route.request().postDataJSON();
          assert.equal(body.contact, mode === 'international' ? '+447700900123' : mode === 'email' ? 'old@example.test' : '+919876543210');
          status = mode === 'limited' ? 429 : mode === 'unavailable' ? 503 : 200;
          data = { accepted: true, challenge: '00000000-0000-4000-8000-000000000001', expiresAt: new Date(Date.now() + 300000).toISOString(), resendAvailableAt: new Date(Date.now() + 60000).toISOString() };
        } else if (route.request().method() === 'POST') throw new Error('Unexpected mutation during delivery UI test');
        await route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(status === 200 ? { ok: true, data } : { ok: false, error: { code: 'PRIVATE_REASON', message: 'private backend detail' } }) });
      });
      await page.goto('http://127.0.0.1:3124/partner-access');
      await page.getByRole('button', { name: 'Recover existing application', exact: true }).click();
      const country = page.getByRole('combobox', { name: 'Registered mobile number country and dial code' });
      assert.equal(await country.inputValue(), 'IN');
      assert.equal(await country.locator('option').count(), 10);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      if (mode === 'india') await page.screenshot({ path: `tmp/s8e724-artifacts/find-${width}.png`, fullPage: true });
      if (mode === 'email') {
        await page.getByRole('combobox', { name: 'Registered contact' }).selectOption('email');
        await page.getByLabel('Registered email', { exact: true }).fill('old@example.test');
      } else {
        const input = page.getByLabel('Registered mobile number', { exact: true });
        await input.fill('123');
        await page.getByRole('button', { name: 'Send verification code', exact: true }).click();
        await page.getByRole('alert').filter({ hasText: 'Enter a valid mobile number' }).waitFor();
        assert.equal(starts, 0);
        if (mode === 'international') {
          await country.selectOption('GB');
          await input.fill('7700900123');
        } else await input.fill(width === 768 ? '+91 98765 43210' : '9876543210');
      }
      await page.getByRole('button', { name: 'Send verification code', exact: true }).dblclick();
      if (mode === 'limited' || mode === 'unavailable') {
        const errorAlert = page.getByRole('alert').filter({ hasText: mode === 'limited' ? 'does not confirm' : 'unavailable right now' });
        await errorAlert.waitFor();
        const alert = await errorAlert.innerText();
        assert.ok(alert.includes(mode === 'limited' ? 'does not confirm' : 'unavailable right now'));
        if (mode === 'limited') assert.ok(await page.getByRole('button', { name: /Try again in/ }).isDisabled());
      } else {
        await page.getByRole('heading', { name: 'Verify ownership' }).waitFor();
        assert.ok((await page.locator('body').innerText()).includes('This request does not confirm delivery.'));
        assert.ok(await page.getByRole('button', { name: /Resend in/ }).isDisabled());
        if (mode === 'india') await page.screenshot({ path: `tmp/s8e724-artifacts/verify-${width}.png`, fullPage: true });
        await page.getByRole('button', { name: 'Back', exact: true }).click();
        assert.ok(await page.getByRole('button', { name: /Try again in/ }).isDisabled());
      }
      assert.equal(starts, 1);
      const body = await page.locator('body').innerText();
      for (const forbidden of ['My Account', 'NO_LINKED_PROFILE', 'PRIVATE_REASON', 'private backend detail']) assert.ok(!body.includes(forbidden));
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      await page.getByRole('button', { name: 'Cancel', exact: true }).click();
      await page.getByRole('heading', { name: 'No Partner application found' }).waitFor();
      assert.equal(new URL(page.url()).pathname, '/partner-access');
      evidence.push({ width, mode, singleRequest: true, noOverflow: true, partnerContext: true });
      await context.close();
    }
  }
  console.log(JSON.stringify({ status: 'PASS', syntheticApi: true, deliveryProven: false, evidence }));
} finally { await browser.close(); }
