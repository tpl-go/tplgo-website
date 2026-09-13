// Synthetic local proof only: no live session/provider access or account writes.
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
const base = process.env.TPL_USER_U1_URL || 'http://127.0.0.1:3126';
if (new URL(base).hostname !== '127.0.0.1') throw new Error('LOCAL_SYNTHETIC_ONLY');
const browser = await chromium.launch({ headless: true });
await mkdir('tmp/user-u1-artifacts', { recursive: true });
try {
  for (const width of [1363, 768, 390]) {
    const context = await browser.newContext({ viewport: { width, height: 950 } });
    await context.addInitScript(() => {
      localStorage.setItem('tpl_auth_session_v1', JSON.stringify({ user: { id: 'user-a', fullName: 'Synthetic A', mobile: 'synthetic-mobile-a', email: '', accountType: 'personal' }, token: 'synthetic-token-a' }));
      localStorage.setItem('tpl_profile_v1_synthetic-mobile-a', JSON.stringify({ firstName: 'Synthetic A', email: 'local-profile@example.test', mobile: 'synthetic-mobile-a' }));
      window.u1PasswordAccesses = 0;
      for (const method of ['getItem', 'setItem', 'removeItem']) {
        const original = Storage.prototype[method];
        Storage.prototype[method] = function(key, ...args) {
          if (/password/i.test(key)) window.u1PasswordAccesses++;
          return original.call(this, key, ...args);
        };
      }
    });
    let owner = 'user-a', emails = ['z@example.test', 'a@example.test', 'a@example.test'], profileEmail = 'server-profile@example.test';
    let accountStatus = 200, devicesStatus = 200, delay = 0, meCalls = 0, mutations = 0;
    let devices = [{ id: 'device-a', userId: 'user-a', deviceLabel: 'Synthetic device', lastSeenAt: '2026-01-01T00:00:00Z' }];
    const errors = [];
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(error.message));
    await context.route('**/*', async route => {
      const url = new URL(route.request().url());
      if (!url.pathname.includes('/api/')) return url.hostname === '127.0.0.1' ? route.continue() : route.abort();
      if (route.request().method() !== 'GET') { mutations++; return route.abort(); }
      let data = {}, status = 200, wait = 0;
      if (url.pathname === '/api/v1/me') {
        meCalls++; status = accountStatus; wait = delay;
        data = { user: { id: owner, email: profileEmail, verifiedLoginEmails: emails } };
      } else if (url.pathname === '/api/v1/me/device-sessions') { status = devicesStatus; data = { deviceSessions: devices }; }
      else if (url.pathname.includes('/wallet/ledger')) data = [];
      else if (url.pathname.includes('/wallet')) data = { promoCredit: 0, earnedCredit: 0, refundableBalance: 0 };
      else if (url.pathname.includes('/content/')) data = { contexts: {} };
      else { status = 401; }
      if (wait) await new Promise(resolve => setTimeout(resolve, wait));
      await route.fulfill({ status, contentType: 'application/json', body: JSON.stringify({ ok: status === 200, data }) }).catch(() => {});
    });
    const banner = page.getByTestId('user-login-email').filter({ visible: true });
    const refreshRead = () => page.evaluate(() => window.dispatchEvent(new Event('TPL_AUTH_UPDATED')));
    await page.goto(`${base}/account/profile`);
    await page.waitForFunction(() => [...document.querySelectorAll('[data-testid="user-login-email"]')].some(el => el.textContent.includes('a••••@example.test, z••••@example.test')));
    assert.match(await banner.innerText(), /Verified/);
    assert.equal(await page.getByRole('button', { name: 'Reset Password', exact: true }).count(), 0);
    assert.equal(await page.locator('input[type="password"]').count(), 0);
    assert.equal(await page.locator('input').filter({ visible: true }).count() > 0, true);
    assert.equal(await page.locator('input[placeholder="name@example.com"]').inputValue(), 'local-profile@example.test');
    assert.match(await page.getByRole('region', { name: 'Sign-in details' }).innerText(), /Profile email · Not verified/);
    assert.match(await page.getByRole('region', { name: 'Sign-in details' }).innerText(), /l••••@example.test/);
    assert.doesNotMatch(await page.getByRole('region', { name: 'Sign-in details' }).innerText(), /s••••@example.test/);
    const idleCount = meCalls;
    await page.waitForTimeout(1600);
    assert.equal(meCalls, idleCount, 'No idle read loop');
    try { await page.getByRole('button', { name: /Sign-in & Security/ }).click({ timeout: 5000 }); }
    catch (error) { console.log({ syntheticButtons: await page.getByRole('button').allTextContents(), errors }); await page.screenshot({ path: 'tmp/user-u1-artifacts/failure.png', fullPage: true }); throw error; }
    await page.getByRole('heading', { name: 'Sign-in & Security', exact: true }).waitFor();
    assert.equal(await page.locator('input[type="password"]').count(), 0);
    await page.getByRole('button', { name: /Device information/ }).click();
    await page.getByText('Synthetic device', { exact: true }).waitFor();
    assert.equal(await page.getByRole('button', { name: /sign out device|logout device/i }).count(), 0);
    assert.equal(await page.getByText(/This is not a list of active sign-in sessions/).count(), 1);
    devicesStatus = 500; await refreshRead();
    await page.getByText('Device information is unavailable. Please try again later.', { exact: true }).waitFor();
    assert.equal(await page.getByText('Synthetic device', { exact: true }).count(), 0);
    // Latest request wins, even when an earlier response is deliberately delayed.
    delay = 900; emails = ['old@example.test']; await refreshRead();
    await page.waitForTimeout(100);
    delay = 0; emails = ['new@example.test']; await refreshRead();
    await page.waitForFunction(() => document.querySelector('[data-testid="user-login-email"]').textContent.includes('n••••@example.test'));
    await page.waitForTimeout(1000);
    assert.doesNotMatch(await banner.innerText(), /o••••/);
    // Switch owner while account and device responses are pending.
    delay = 900; await refreshRead(); await page.waitForTimeout(100);
    owner = 'user-b'; emails = ['b@example.test']; delay = 500; devicesStatus = 200; devices = [];
    await page.evaluate(() => {
      localStorage.setItem('tpl_auth_session_v1', JSON.stringify({ user: { id: 'user-b', mobile: '', email: '', fullName: 'Synthetic B', accountType: 'personal' }, token: 'synthetic-token-b' }));
      window.dispatchEvent(new Event('TPL_AUTH_UPDATED'));
    });
    await page.waitForFunction(() => !document.querySelector('[data-testid="user-login-email"]').textContent.includes('n••••'));
    assert.doesNotMatch(await banner.innerText(), /Verified|Email not added/);
    await page.waitForFunction(() => document.querySelector('[data-testid="user-login-email"]').textContent.includes('b••••@example.test'));
    await page.waitForTimeout(1000);
    assert.equal(await page.getByText(/Synthetic device|Synthetic A/).count(), 0);
    delay = 0; accountStatus = 401; await refreshRead();
    await page.waitForFunction(() => document.querySelector('[data-testid="user-login-email"]').textContent.includes('Login email unavailable'));
    assert.doesNotMatch(await banner.innerText(), /Verified|Email not added/);
    accountStatus = 200; emails = []; profileEmail = 'unverified@example.test'; await refreshRead();
    await page.waitForFunction(() => document.querySelector('[data-testid="user-login-email"]').textContent.includes('Email not added'));
    assert.doesNotMatch(await banner.innerText(), /Verified/);
    await page.getByRole('button', { name: /Sign-in & Security/ }).click();
    assert.match(await page.getByRole('region', { name: 'Sign-in details' }).innerText(), /No profile email saved/);
    // Wrong-owner contract must not be rendered.
    owner = 'user-other'; emails = ['other@example.test']; await refreshRead();
    await page.waitForFunction(() => document.querySelector('[data-testid="user-login-email"]').textContent.includes('Login email unavailable'));
    owner = 'user-a'; emails = ['refreshed@example.test']; profileEmail = ''; delay = 0;
    await page.reload(); // init script restores the synthetic A account; no live auth.
    await page.waitForFunction(() => document.querySelector('[data-testid="user-login-email"]').textContent.includes('r••••@example.test'));
    await page.getByRole('button', { name: /Sign-in & Security/ }).click();
    assert.equal(await page.evaluate(() => window.u1PasswordAccesses), 0, 'No password storage access');
    assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('tpl_profile_v1_synthetic-mobile-a')).email), 'local-profile@example.test');
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, 'No horizontal overflow');
    assert.equal(mutations, 0, 'Visual QA must not mutate accounts');
    assert.deepEqual(errors, []);
    await page.screenshot({ path: `tmp/user-u1-artifacts/security-${width}.png`, fullPage: true });
    console.log(JSON.stringify({ width, result: 'PASS', meCalls, mutations, proof: 'local synthetic only' }));
    await context.close();
  }
} finally { await browser.close(); }
