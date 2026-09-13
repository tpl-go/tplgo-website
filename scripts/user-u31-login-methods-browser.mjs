// Local synthetic behavioral proof. Every API/provider request is intercepted.
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
const base = process.env.TPL_U31_URL || 'http://127.0.0.1:3129';
if (new URL(base).hostname !== '127.0.0.1') throw new Error('LOCAL_SYNTHETIC_ONLY');
const browser = await chromium.launch({ headless: true });
const directory = 'tmp/user-u31-browser';
await mkdir(directory, { recursive: true });
const owner = { id: 'u31-owner-a', fullName: 'Synthetic Owner A', mobile: '', email: '', accountType: 'personal', verifiedLoginEmails: ['a@example.test'] };
const other = { ...owner, id: 'u31-owner-b', fullName: 'Synthetic Owner B', verifiedLoginEmails: ['b@example.test'] };
const methodId = '11111111-1111-4111-8111-111111111111';
const actionId = '22222222-2222-4222-8222-222222222222';
const challengeId = '33333333-3333-4333-8333-333333333333';
const session = token => ({ token, expiresAt: '2027-01-01T00:00:00.000Z' });
const seed = (user, token) => ({ user, token, session: session(token) });
let scenarios = 0;

async function scenario(name, width, fn) {
  const context = await browser.newContext({ viewport: { width, height: 950 } });
  await context.addInitScript(value => localStorage.setItem('tpl_auth_session_v1', JSON.stringify(value)), seed(owner, 'u31-synthetic-a'));
  const state = { owner, delay: 0, conflict: false, already: false, unavailable: false, expired: false, rotated: false, signedOut: false, calls: [], completionKey: '', target: '' };
  await context.route('**/*', async route => {
    const request = route.request(), url = new URL(request.url()), path = url.pathname;
    if (!path.includes('/api/')) return url.hostname === '127.0.0.1' ? route.continue() : route.abort();
    state.calls.push(path);
    const reply = (data, status = 200, message = 'Unavailable') => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify({ ok: status === 200, data, ...(status === 200 ? {} : { error: { message } }) }) }).catch(() => {});
    if (path === '/api/v1/auth/session') return state.signedOut ? reply(null, 401) : reply({ user: state.owner, session: session(state.owner.id === other.id ? 'u31-synthetic-b' : state.rotated ? 'u31-synthetic-rotated' : 'u31-synthetic-a') });
    if (path === '/api/v1/auth/logout') { state.signedOut = true; return reply({ revoked: true }); }
    if (path === '/api/v1/me') return reply({ user: state.owner });
    if (path === '/api/v1/me/login-methods') {
      if (state.unavailable) return reply(null, 503, 'Login methods unavailable');
      return reply({ ownerId: state.owner.id, methods: [{ id: methodId, provider: 'email', label: state.owner.id === other.id ? 'b****@example.test' : 'a****@example.test', verified: true }, { id: '44444444-4444-4444-8444-444444444444', provider: 'google', label: 'Google connected', verified: true }, ...(state.rotated ? [{ id: challengeId, provider: 'email', label: 'n****@example.test', verified: true }] : [])], googleConnected: true });
    }
    if (path.endsWith('/reauth/start')) { if (state.delay) await new Promise(resolve => setTimeout(resolve, state.delay)); return reply({ actionId, challenge: challengeId, accepted: true }); }
    if (path.endsWith('/reauth/verify')) return state.expired ? reply(null, 401, 'This check has expired. Start again.') : reply({ actionId, verified: true });
    if (path.endsWith('/link/start')) {
      const input = request.postDataJSON(); state.completionKey = input.completionKey; state.target = input.contact;
      if (state.conflict) return reply(null, 409, 'This login method is already in use. Sign in with its existing account. Accounts cannot be combined here.');
      if (state.already) return reply({ status: 'already_added' });
      return reply({ challenge: challengeId, accepted: true });
    }
    if (path.endsWith('/link/complete')) { state.rotated = true; return reply({ ownerId: owner.id, session: session('u31-synthetic-rotated') }); }
    if (path.includes('/wallet/ledger') || path.endsWith('/bookings')) return reply([]);
    if (path.endsWith('/wallet')) return reply({ promoCredit: 0, earnedCredit: 0, refundableBalance: 0 });
    if (path.includes('/content/')) return reply({ contexts: {} });
    return reply({});
  });
  const page = await context.newPage(), errors = [];
  page.on('pageerror', error => errors.push(error.message));
  try {
    await page.goto(`${base}/account/profile`, { waitUntil: 'domcontentloaded', timeout: 120000 });
    await page.getByRole('button', { name: /Sign-in & Security/ }).click();
    await page.getByRole('heading', { name: 'Your verified login methods' }).waitFor();
    await page.getByText('Google connected · Connected', { exact: true }).waitFor();
    await fn(page, state);
    assert.deepEqual(errors, [], `${name}: runtime errors`);
    await page.screenshot({ path: `${directory}/${name}-${width}.png`, fullPage: true });
    console.log(JSON.stringify({ scenario: name, width, result: 'PASS', proof: 'synthetic intercepted browser' })); scenarios++;
  } catch (error) {
    await page.screenshot({ path: `${directory}/${name}-${width}-failure.png`, fullPage: true }).catch(() => {});
    throw error;
  } finally { await context.close(); }
}
async function existingProof(page, channel = 'email') {
  await page.getByRole('button', { name: `Add ${channel}`, exact: true }).click();
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.getByLabel('Verification code', { exact: true }).fill('123456');
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.getByLabel(`New ${channel}`, { exact: true }).waitFor();
}
try {
  for (const width of [1363, 768, 390]) {
    await scenario('explicit-add-email', width, async (page, state) => {
      await existingProof(page);
      await page.getByLabel('New email', { exact: true }).fill('new@example.test');
      await page.getByRole('button', { name: 'Continue', exact: true }).click();
      await page.getByLabel('Verification code', { exact: true }).fill('654321');
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, 'no horizontal overflow');
      const persisted = await page.evaluate(() => [JSON.stringify(localStorage), JSON.stringify(sessionStorage)]);
      assert(!persisted.join('').includes('654321') && !persisted.join('').includes(state.completionKey), 'no persisted OTP or completion proof');
      await page.getByRole('button', { name: 'Confirm Add email', exact: true }).click();
      await page.getByText('n****@example.test · Verified', { exact: true }).waitFor();
      assert.equal(state.calls.filter(p => p.endsWith('/link/complete')).length, 1);
      assert.equal(state.calls.filter(p => p.endsWith('/reauth/start')).length, 1);
    });
  }
  await scenario('global-mobile-and-conflict', 390, async (page, state) => {
    await existingProof(page, 'mobile');
    await page.getByLabel('New mobile country and dial code').selectOption('US');
    await page.getByLabel('New mobile', { exact: true }).fill('4155550123'); state.conflict = true;
    await page.getByRole('button', { name: 'Continue', exact: true }).click();
    await page.getByRole('alert').filter({ hasText: 'already in use' }).waitFor();
    assert.equal(state.target, '+14155550123');
    assert.equal(await page.getByLabel('Verification code', { exact: true }).count(), 0);
  });
  await scenario('same-owner-already-added', 768, async (page, state) => {
    await existingProof(page); state.already = true;
    await page.getByLabel('New email', { exact: true }).fill('a@example.test');
    await page.getByRole('button', { name: 'Continue', exact: true }).click();
    await page.getByRole('status').filter({ hasText: 'already added' }).waitFor();
    assert.equal(state.calls.filter(p => p.endsWith('/link/complete')).length, 0);
  });
  await scenario('expired-current-proof', 1363, async (page, state) => {
    state.expired = true;
    await page.getByRole('button', { name: 'Add email', exact: true }).click();
    await page.getByRole('button', { name: 'Continue', exact: true }).click();
    await page.getByLabel('Verification code', { exact: true }).fill('123456');
    await page.getByRole('button', { name: 'Continue', exact: true }).click();
    await page.getByRole('alert').filter({ hasText: 'expired' }).waitFor();
    assert.equal(await page.getByLabel('New email', { exact: true }).count(), 0);
  });
  await scenario('account-switch-rejects-delayed-proof', 1363, async (page, state) => {
    state.delay = 900;
    await page.getByRole('button', { name: 'Add email', exact: true }).click();
    await page.getByRole('button', { name: 'Continue', exact: true }).click();
    state.owner = other;
    await page.evaluate(value => { localStorage.setItem('tpl_auth_session_v1', JSON.stringify(value)); window.dispatchEvent(new Event('TPL_AUTH_UPDATED')); }, seed(other, 'u31-synthetic-b'));
    // The account guard unmounts private pages while the new owner is validated.
    await page.getByRole('button', { name: /Sign-in & Security/ }).click();
    await page.getByText('b****@example.test · Verified', { exact: true }).waitFor();
    await new Promise(resolve => setTimeout(resolve, 1100));
    assert.equal(await page.getByLabel('Verification code', { exact: true }).count(), 0);
    assert.equal(await page.getByText('a****@example.test · Verified', { exact: true }).count(), 0);
  });
  console.log(JSON.stringify({ result: 'PASS', scenarios, liveProof: false }));
} finally { await browser.close(); }
