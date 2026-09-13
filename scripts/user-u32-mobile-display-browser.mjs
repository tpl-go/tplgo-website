import { chromium } from 'playwright';
import assert from 'node:assert/strict';
const base = process.env.TPL_U32_URL || 'http://127.0.0.1:3129';
if (new URL(base).hostname !== '127.0.0.1') throw Error('LOCAL_SYNTHETIC_ONLY');
const browser = await chromium.launch({ headless: true });
const a = { id: 'synthetic-a', fullName: 'Synthetic A', mobile: '', email: '', accountType: 'personal', verifiedLoginEmails: ['a@example.test'] };
const b = { ...a, id: 'synthetic-b' };
const mobile = { id: 'synthetic-method', provider: 'mobile', verified: true, label: '+******0123' };
const session = { token: 'synthetic-u32-token', expiresAt: '2027-01-01T00:00:00Z' };
let passed = 0;
async function scenario(name, width, setup, check) {
  const context = await browser.newContext({ viewport: { width, height: 950 } });
  const state = { user: a, methods: [mobile], delay: 0, failed: false, signedOut: false, calls: 0, ...setup };
  await context.addInitScript(({ user, session }) => localStorage.setItem('tpl_auth_session_v1', JSON.stringify({ user, session, token: session.token })), { user: state.user, session });
  await context.route('**/*', async route => {
    const url = new URL(route.request().url()), path = url.pathname;
    if (!path.includes('/api/')) return url.hostname === '127.0.0.1' ? route.continue() : route.abort();
    const reply = (data, status = 200) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify({ ok: status === 200, data }) }).catch(() => {});
    if (path === '/api/v1/auth/session') { if (state.authDelay) await new Promise(r => setTimeout(r, state.authDelay)); return reply({ user: state.user, session }, state.signedOut ? 401 : 200); }
    if (path === '/api/v1/auth/logout') { state.signedOut = true; return reply({ revoked: true }); }
    if (path === '/api/v1/me') return reply({ user: state.user });
    if (path === '/api/v1/me/login-methods') {
      state.calls++;
      const payload = { ownerId: state.wrongOwner || state.user.id, methods: state.methods };
      if (state.delay) await new Promise(r => setTimeout(r, state.delay));
      return reply(payload, state.failed ? 503 : 200);
    }
    if (path.endsWith('/wallet')) return reply({ promoCredit: 0, earnedCredit: 0, refundableBalance: 0 });
    if (path.endsWith('/bookings') || path.endsWith('/wallet/ledger')) return reply([]);
    return reply({});
  });
  const page = await context.newPage();
  const header = () => page.locator('[data-testid="user-login-mobile"]:visible');
  try {
    await page.goto(`${base}/account/profile`);
    await check(page, state, header);
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'no overflow');
    console.log(JSON.stringify({ name, width, result: 'PASS', synthetic: true })); passed++;
  } finally { await context.close(); }
}
try {
  await scenario('restoring-hides-mobile-until-server-validation', 1363, { authDelay: 1200 }, async (page, state, header) => {
    await page.getByText('Confirming your session…', { exact: true }).waitFor();
    assert.equal(await header().count(), 0);
    await header().filter({ hasText: '+******0123' }).waitFor();
  });
  await scenario('logout-back-refresh-hides-private-mobile', 1363, {}, async (page, state, header) => {
    await header().filter({ hasText: '+******0123' }).waitFor();
    await page.getByRole('button', { name: /Log out/i }).click();
    await page.getByRole('button', { name: /Yes, Logout/i }).click();
    await page.waitForURL(base + '/');
    await page.goBack(); await page.reload();
    await page.getByText('Sign in to view your account.', { exact: true }).waitFor();
    assert.equal(await header().count(), 0);
    assert.doesNotMatch(await page.locator('body').innerText(), /0123|Synthetic A|PK|0000000000/);
    await page.goto(base + '/account/wallet'); await page.reload();
    await page.getByText('Sign in to view your account.', { exact: true }).waitFor();
    assert.doesNotMatch(await page.locator('body').innerText(), /Available|No activity|0123/);
  });
  for (const width of [1363, 768, 390]) await scenario('email-first-added-mobile-refresh', width, {}, async (page, state, header) => {
    await header().getByText('+******0123 · Verified', { exact: true }).waitFor();
    await page.reload();
    await header().getByText('+******0123 · Verified', { exact: true }).waitFor();
    assert.equal(await page.locator('label').filter({ hasText: /^MOBILE NUMBER$/ }).locator('..').locator('input').inputValue(), '', 'no profile copy');
  });
  for (const [name, setup, expected] of [
    ['legacy-mobile-first', { user: { ...a, mobile: '+19995550123' }, methods: [{ ...mobile, id: 'legacy-mobile' }] }, '+******0123 · Verified'],
    ['none', { methods: [] }, 'Mobile not added'],
    ['multiple', { methods: [mobile, { ...mobile, id: 'second', label: '+******0456' }] }, '2 verified login mobiles'],
    ['disabled-unverified', { methods: [{ ...mobile, verified: false }, { ...mobile, status: 'disabled' }] }, 'Mobile not added'],
    ['failed', { failed: true }, 'Login mobile unavailable'],
    ['foreign-response', { wrongOwner: b.id }, 'Login mobile unavailable'],
  ]) await scenario(name, 1363, setup, async (_, state, header) => { await header().filter({ hasText: expected }).waitFor(); });
  await scenario('loading-then-account-switch-rejects-late-mobile', 1363, { delay: 1500 }, async (page, state, header) => {
    await header().getByText('Loading login mobile…', { exact: true }).waitFor();
    while (!state.calls) await page.waitForTimeout(10);
    state.user = b; state.methods = []; state.delay = 0;
    await page.evaluate(({ user, session }) => { localStorage.setItem('tpl_auth_session_v1', JSON.stringify({ user, session, token: session.token })); window.dispatchEvent(new Event('TPL_AUTH_UPDATED')); }, { user: b, session });
    await header().filter({ hasText: 'Mobile not added' }).waitFor();
    await page.waitForTimeout(1600);
    assert.equal(await header().textContent(), 'Mobile not added');
  });
  console.log(JSON.stringify({ passed, liveProof: false }));
} finally { await browser.close(); }
