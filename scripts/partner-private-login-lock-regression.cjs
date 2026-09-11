const { chromium } = require('playwright');
const { execFileSync } = require('node:child_process');
const assert = require('node:assert/strict');

// Existing private runtime only. Credentials and simulated OTP never leave memory.
const base = 'http://127.0.0.1:3100';
const email = 's8e51-partner@partner-demo.example.test';
let phase = 'health';
(async () => {
  const health = await fetch('http://127.0.0.1:4300/api/v1/health');
  assert.equal(health.status, 200);
  assert.match(health.headers.get('x-tpl-demo') ?? '', /TEST ONLY/);
  const browser = await chromium.launch({ headless: true });
  try {
    for (const width of [1440, 390]) {
      phase = `${width}: login`;
      const context = await browser.newContext({ viewport: { width, height: 1000 } });
      await context.route('**/*', route => ['127.0.0.1', 'localhost'].includes(new URL(route.request().url()).hostname) ? route.continue() : route.abort());
      const page = await context.newPage();
      const mutations = [], errors = [], verificationRequests = [];
      page.on('pageerror', () => errors.push('uncaught exception'));
      page.on('request', request => {
        const path = new URL(request.url()).pathname;
        if (request.method() === 'POST' && path.includes('/partner/application/draft/')) mutations.push(path);
        if (request.method() === 'POST' && path.endsWith('/email/verify-otp')) verificationRequests.push(path);
      });
      await page.goto(base + '/partner-preview');
      await page.getByRole('button', { name: /continue to partner sign in/i }).click();
      await page.getByRole('button', { name: /continue with email/i }).click();
      await page.getByPlaceholder('partner@example.com').fill(email);
      const sent = page.waitForResponse(r => r.url().endsWith('/email/send-otp') && r.request().method() === 'POST');
      await page.getByRole('button', { name: 'Send Email OTP' }).click();
      assert.equal((await sent).status(), 202);
      const input = page.getByPlaceholder('Enter 6-digit OTP');
      await input.fill('12');
      assert.equal(await page.getByRole('button', { name: 'Open Partner Desk', exact: true }).isDisabled(), true);
      await input.press('Enter');
      assert.equal(verificationRequests.length, 0);
      let inbox = JSON.parse(execFileSync('ssh', ['TPL-Server', 'cat /home/tpladmin/tpl-partner-demo-s8e3/test-inbox.json'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }));
      assert.equal(inbox.email, email);
      assert.equal(inbox.simulated, true);
      await input.fill(String(inbox.otp));
      inbox = null;
      const verified = page.waitForResponse(r => r.url().endsWith('/email/verify-otp') && r.request().method() === 'POST');
      await input.press('Enter');
      assert.equal((await verified).status(), 200);
      await page.getByRole('button', { name: /continue to partner sign in/i }).waitFor({ state: 'hidden' });
      phase = `${width}: approved result`;
      await page.getByText('Application approved', { exact: true }).waitFor();
      for (const step of ['account_contact', 'business_identity', 'business_location', 'services']) {
        phase = `${width}: ${step}`;
        // Normal navigation/reopen, without modifying a form or invoking an API directly.
        await page.goto(base + '/partner-preview');
        await page.getByText('Application approved', { exact: true }).waitFor();
        await page.setViewportSize({ width: 1440, height: 1000 });
        const labels = { account_contact: /1\. Account/, business_identity: /2\. Business/, business_location: /3\. Business/, services: /4\. Services/ };
        await page.getByRole('button', { name: labels[step] }).click();
        await page.setViewportSize({ width, height: 1000 });
        await page.getByText(/Editing is locked while the application status is/).waitFor();
        await page.waitForTimeout(1800); // Exceeds the actual 1400ms autosave debounce.
        if (step === 'services') {
          const remove = page.getByRole('button', { name: 'Remove Hotel', exact: true });
          assert.equal(await remove.isDisabled(), true);
          await remove.dispatchEvent('click');
          assert.equal(await remove.count(), 1);
        }
      }
      assert.deepEqual(mutations, []);
      assert.deepEqual(errors, []);
      assert.equal(verificationRequests.length, 1);
      console.log(JSON.stringify({ width, login: 'simulated-email-OTP normal UI', verifyRequests: 1, lockedDraftMutations: 0, terminal: 'APPROVED', passed: true }));
      await context.close();
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error.name, phase, 'Private login/lock regression failed; no authentication values logged.'); process.exitCode = 1; });
