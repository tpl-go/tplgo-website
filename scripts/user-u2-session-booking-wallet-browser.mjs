// U2 local synthetic runtime proof for session restore/logout and private account data authority.
// This script is intentionally localhost-only and intercepts all API calls.
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';

const base = process.env.TPL_USER_U2_URL || 'http://127.0.0.1:3127';
const parsedBase = new URL(base);
if (parsedBase.hostname !== '127.0.0.1') throw new Error('LOCAL_SYNTHETIC_ONLY');

const artifactsDir = 'tmp/user-u2-artifacts';
await mkdir(artifactsDir, { recursive: true });

const users = {
  bearer: {
    id: 'u2-user-bearer',
    accountType: 'personal',
    mobile: 'synthetic-mobile-bearer',
    email: '',
    fullName: 'Synthetic Bearer User',
  },
  cookie: {
    id: 'u2-user-cookie',
    accountType: 'personal',
    mobile: 'synthetic-mobile-cookie',
    email: '',
    fullName: 'Synthetic Cookie User',
  },
  emailOnly: {
    id: 'u2-user-email-only',
    accountType: 'personal',
    mobile: '',
    email: '',
    fullName: 'Synthetic Email Only User',
  },
  old: {
    id: 'u2-user-old',
    accountType: 'personal',
    mobile: 'synthetic-mobile-old',
    email: '',
    fullName: 'Synthetic Old User',
  },
  next: {
    id: 'u2-user-next',
    accountType: 'personal',
    mobile: 'synthetic-mobile-next',
    email: '',
    fullName: 'Synthetic Next User',
  },
  partner: {
    id: 'u2-partner-user',
    accountType: 'partner',
    mobile: 'synthetic-partner-mobile',
    email: '',
    fullName: 'Synthetic Partner User',
  },
};

const sessions = {
  bearer: { token: 'u2-bearer-token', expiresAt: '2027-01-01T00:00:00.000Z' },
  cookie: { token: 'u2-cookie-token', expiresAt: '2027-01-01T00:00:00.000Z' },
  old: { token: 'u2-old-token', expiresAt: '2027-01-01T00:00:00.000Z' },
  next: { token: 'u2-next-token', expiresAt: '2027-01-01T00:00:00.000Z' },
  partner: { token: 'u2-partner-token', expiresAt: '2027-01-01T00:00:00.000Z' },
};

const staleBooking = {
  id: 'TPL-STALE-LOCAL-PRIVATE',
  type: 'flight',
  title: 'Stale Local Private Booking',
  bookingDate: '2026-01-01T00:00:00.000Z',
  travelDate: '2026-02-01',
  travellers: '1 Traveller',
  amount: 99999,
  status: 'upcoming',
  mobile: 'synthetic-stale-mobile',
  leadTraveller: { name: 'Stale Traveller', mobile: 'synthetic-stale-mobile' },
};

const serverBooking = {
  id: 'TPL-U2-SERVER-BOOKING',
  type: 'flight',
  title: 'Server Account Flight',
  bookingDate: '2026-03-01T00:00:00.000Z',
  travelDate: '2026-04-01',
  travellers: '2 Travellers',
  amount: 12000,
  status: 'upcoming',
  mobile: 'synthetic-mobile-bearer',
  leadTraveller: { name: 'Server Traveller', mobile: 'synthetic-mobile-bearer' },
};

function apiEnvelope(data, status = 200, code = 'OK', message = 'OK') {
  if (status >= 200 && status < 300) {
    return { ok: true, data, meta: { requestId: `u2_${Date.now()}`, apiVersion: 'v1' } };
  }
  return { ok: false, error: { code, message }, meta: { requestId: `u2_${Date.now()}`, apiVersion: 'v1' } };
}

function storedSession(user, session) {
  const payload = { user };
  if (session?.token) {
    payload.token = session.token;
    payload.sessionToken = session.token;
    payload.session = session;
  }
  return payload;
}

async function installCommonInit(context, storedAuth = storedSession(users.bearer, sessions.bearer), state = {}) {
  await context.addInitScript(({ storedAuthPayload, staleBookingPayload, partnerPreference }) => {
    if (sessionStorage.getItem('tpl_user_u2_seeded') === '1') return;
    sessionStorage.setItem('tpl_user_u2_seeded', '1');
    if (partnerPreference) sessionStorage.setItem('tpl_partner_profile_preference_v1', partnerPreference);
    localStorage.clear();
    if (storedAuthPayload) localStorage.setItem('tpl_auth_session_v1', JSON.stringify(storedAuthPayload));
    localStorage.setItem('tpl_bookings_v1', JSON.stringify([staleBookingPayload]));
    localStorage.setItem('tpl_wallet_v1_guest', JSON.stringify({ promoCredit: 77777, earnedCredit: 88888, refundableBalance: 99999 }));
    localStorage.setItem('tpl_wallet_v1_synthetic-stale-mobile', JSON.stringify({ promoCredit: 77777, earnedCredit: 88888, refundableBalance: 99999 }));
    localStorage.setItem('tpl_wallet_ledger_v1_guest', JSON.stringify([{ id: 'stale-ledger', title: 'Stale Local Ledger', description: 'Should never render as account data', amount: 99999, type: 'promo_added', createdAt: '2026-01-01T00:00:00.000Z' }]));
  }, { storedAuthPayload: storedAuth, staleBookingPayload: staleBooking, partnerPreference: state.partnerPreference || null });
}

async function fulfill(route, status, data, code, message) {
  await route.fulfill({
    status,
    contentType: 'application/json',
    body: JSON.stringify(apiEnvelope(data, status, code, message)),
  }).catch(() => {});
}

function authByToken(token) {
  if (token === `Bearer ${sessions.bearer.token}`) return { user: users.bearer, session: sessions.bearer };
  if (token === `Bearer ${sessions.old.token}`) return { user: users.old, session: sessions.old };
  if (token === `Bearer ${sessions.next.token}`) return { user: users.next, session: sessions.next };
  if (token === `Bearer ${sessions.partner.token}`) return { user: users.partner, session: sessions.partner };
  return null;
}

async function routeAccountApis(context, state) {
  await context.route('**/*', async route => {
    const request = route.request();
    const url = new URL(request.url());
    if (!url.pathname.includes('/api/')) {
      if (url.hostname === '127.0.0.1' && url.pathname === '/partner-preview') {
        return route.fulfill({ status: 200, contentType: 'text/html', body: '<h1>Partner application navigation target</h1>' });
      }
      if (url.hostname === '127.0.0.1') return route.continue();
      return route.abort();
    }

    state.requests.push({ method: request.method(), path: url.pathname, search: url.search, authorization: request.headers().authorization || '', cookie: request.headers().cookie || '' });

    if (state.abortSession && url.pathname === '/api/v1/auth/session') return route.abort('failed');
    const wait = state.delays.get(url.pathname) || 0;
    if (wait) await new Promise(resolve => setTimeout(resolve, wait));

    if (url.pathname === '/api/v1/auth/session') {
      const status = state.sessionStatus;
      if (status !== 200) return fulfill(route, status, null, status === 403 ? 'SESSION_REVOKED' : 'SESSION_EXPIRED', status === 403 ? 'Session revoked' : 'Session expired');
      if (state.sessionResolver) return fulfill(route, 200, state.sessionResolver(request));
      const authorization = request.headers().authorization || '';
      const resolved = authByToken(authorization) || (state.cookieUser ? { user: state.cookieUser, session: state.cookieSession } : null);
      if (!resolved) return fulfill(route, 401, null, 'SESSION_REQUIRED', 'Session required');
      return fulfill(route, 200, resolved);
    }

    if (url.pathname === '/api/v1/auth/logout') {
      state.logoutCalls += 1;
      if (state.logoutStatus !== 200) return fulfill(route, state.logoutStatus, null, 'LOGOUT_FAILED', 'Server logout could not be confirmed.');
      return fulfill(route, 200, { revoked: true });
    }

    if (url.pathname === '/api/v1/me') {
      return fulfill(route, 200, { user: { id: state.accountUser?.id || users.bearer.id, verifiedLoginEmails: state.verifiedEmails || ['bearer@example.test'] } });
    }

    if (url.pathname === '/api/v1/me/device-sessions') {
      return fulfill(route, 200, { deviceSessions: [] });
    }

    if (url.pathname === '/api/v1/bookings') {
      if (state.bookingsStatus !== 200) return fulfill(route, state.bookingsStatus, null, 'BOOKINGS_UNAVAILABLE', 'We could not load your account bookings. Please retry.');
      return fulfill(route, 200, state.bookings ?? [serverBooking]);
    }

    if (url.pathname === '/api/v1/wallet') {
      if (state.walletStatus !== 200) return fulfill(route, state.walletStatus, null, 'WALLET_UNAVAILABLE', 'We could not load your wallet. Please retry.');
      if (state.walletResolver) return fulfill(route, 200, state.walletResolver(request));
      return fulfill(route, 200, state.wallet ?? { promoCredit: 10, earnedCredit: 20, refundableBalance: 30 });
    }

    if (url.pathname === '/api/v1/wallet/ledger') {
      if (state.walletStatus !== 200) return fulfill(route, state.walletStatus, null, 'WALLET_UNAVAILABLE', 'We could not load your wallet. Please retry.');
      return fulfill(route, 200, state.ledger ?? [{ id: 'u2-ledger', type: 'promo_added', title: 'Server Wallet Credit', description: 'Server-authoritative ledger', amount: 20, createdAt: '2026-03-01T00:00:00.000Z' }]);
    }

    if (url.pathname === '/api/v1/partner/access' && request.method() === 'GET') {
      state.partnerAccessCalls += 1;
      return fulfill(route, state.partnerAccessStatus || 200, state.partnerAccess ?? { outcome: 'APPLICATION', organizationId: '11111111-1111-4111-8111-111111111111', step: 'account_contact' });
    }

    if (url.pathname === '/api/v1/partner/access/select' && request.method() === 'POST') {
      state.partnerSelectCalls += 1;
      const body = JSON.parse(request.postData() || '{}');
      state.partnerSelectedOrganizationId = body.organizationId;
      return fulfill(route, state.partnerSelectStatus || 200, state.partnerSelectAccess ?? { outcome: 'APPLICATION', organizationId: body.organizationId, step: 'partner_agreement' });
    }

    if (url.pathname === '/api/v1/partner/recovery/start' && request.method() === 'POST') {
      state.partnerRecoveryStartCalls += 1;
      return fulfill(route, 200, { accepted: true, challenge: '11111111-1111-4111-8111-111111111111', expiresAt: '2030-01-01T00:00:00.000Z', resendAvailableAt: '2026-01-01T00:00:00.000Z' });
    }

    if (url.pathname === '/api/v1/partner/recovery/verify' && request.method() === 'POST') {
      state.partnerRecoveryVerifyCalls += 1;
      return fulfill(route, 200, { displayName: 'Recovered Synthetic Partner', statusLabel: 'Application in progress', reference: null });
    }

    if (url.pathname === '/api/v1/partner/recovery/complete' && request.method() === 'POST') {
      state.partnerRecoveryCompleteCalls += 1;
      return fulfill(route, 200, { access: state.partnerRecoveryAccess ?? { outcome: 'APPLICATION', organizationId: '11111111-1111-4111-8111-111111111111', step: 'account_contact' }, session: { token: sessions.partner.token, expiresAt: sessions.partner.expiresAt } });
    }

    if (url.pathname.startsWith('/api/v1/partner/applications')) {
      return fulfill(route, 200, state.partnerApplication ?? { application: { id: 'u2-draft', status: 'draft', locked: false, currentStep: 1 } });
    }

    if (url.pathname.startsWith('/api/v1/content/')) return fulfill(route, 200, { contexts: {} });
    return fulfill(route, 404, null, 'UNEXPECTED_API', `Unexpected API ${url.pathname}`);
  });
}

async function withPage(name, path, storedAuth, state, fn) {
  const context = await browser.newContext({ viewport: { width: state.width || 1363, height: 950 } });
  await installCommonInit(context, storedAuth, state);
  await routeAccountApis(context, state);
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  try {
    await page.goto(`${base}${path}`, { waitUntil: 'domcontentloaded' });
    await fn(page, state);
    assert.deepEqual(errors, [], `${name}: page errors`);
    console.log(JSON.stringify({ scenario: name, result: 'PASS' }));
  } catch (error) {
    await page.screenshot({ path: `${artifactsDir}/${name.replace(/[^a-z0-9_-]/gi, '_')}.png`, fullPage: true }).catch(() => {});
    throw error;
  } finally {
    await context.close();
  }
}

async function text(page) {
  return await page.locator('body').innerText({ timeout: 10000 });
}

async function waitUntil(check, label, timeout = 10000) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeout) {
    if (check()) return;
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  assert.fail(label);
}

function makeState(overrides = {}) {
  return {
    sessionStatus: 200,
    bookingsStatus: 200,
    walletStatus: 200,
    logoutStatus: 200,
    requests: [],
    delays: new Map(),
    logoutCalls: 0,
    partnerAccessCalls: 0,
    partnerSelectCalls: 0,
    partnerSelectedOrganizationId: null,
    partnerRecoveryStartCalls: 0,
    partnerRecoveryVerifyCalls: 0,
    partnerRecoveryCompleteCalls: 0,
    ...overrides,
  };
}

const browser = await chromium.launch({ headless: true });
try {
  await withPage('cached-user-waits-for-server-validation', '/account/bookings', storedSession(users.old, sessions.old), makeState({ delays: new Map([['/api/v1/auth/session', 900]]), sessionResolver: () => ({ user: users.bearer, session: sessions.bearer }) }), async page => {
    await page.getByText('Confirming your session…').waitFor({ timeout: 5000 });
    assert.doesNotMatch(await text(page), /Stale Local Private Booking|Synthetic Old User|Server Account Flight/);
    await page.getByText('Server Account Flight').waitFor({ timeout: 10000 });
    assert.doesNotMatch(await text(page), /Stale Local Private Booking|Synthetic Old User/);
  });

  await withPage('valid-bearer-restore-loads-private-account-data', '/account/bookings', storedSession(users.bearer, sessions.bearer), makeState(), async (page, state) => {
    await page.getByText('Server Account Flight').waitFor({ timeout: 10000 });
    assert.equal(state.requests.find(r => r.path === '/api/v1/auth/session')?.authorization, `Bearer ${sessions.bearer.token}`);
    const bookingsRequest = state.requests.find(r => r.path === '/api/v1/bookings');
    assert.ok(bookingsRequest, 'bookings request made');
    assert.equal(bookingsRequest.search, '', 'private bookings no longer send mobile lookup query');
  });

  await withPage('cookie-only-restore-and-logout-call-backend', '/account/profile', { user: users.cookie }, makeState({ cookieUser: users.cookie }), async (page, state) => {
    await waitUntil(() => state.requests.some(r => r.path === '/api/v1/auth/session'), 'session request made');
    await page.getByRole('button', { name: /My Account/ }).waitFor({ timeout: 10000 });
    const sessionRequest = state.requests.find(r => r.path === '/api/v1/auth/session');
    assert.ok(sessionRequest, 'session request made');
    assert.equal(sessionRequest.authorization, '', 'cookie-only restore sends no bearer header');
    await page.getByRole('button', { name: /Log out/i }).click();
    await page.getByRole('button', { name: /Yes, Logout/i }).click();
    await page.waitForFunction(() => location.pathname === '/');
    await page.waitForTimeout(250);
    state.cookieUser = null;
    state.sessionStatus = 401;
    await page.goBack();
    await page.reload();
    await page.getByText('Sign in to view your account.').waitFor();
    assert.doesNotMatch(await text(page), /Synthetic Cookie User|PK|0000000000|Available|Edit Profile|Save Profile/);
    assert.equal(state.logoutCalls, 1, 'cookie-only logout calls backend once');
    const logoutRequest = state.requests.find(r => r.path === '/api/v1/auth/logout');
    assert.ok(logoutRequest, 'logout request captured');
    assert.equal(logoutRequest.authorization, '', 'cookie-only logout sends no bearer header');
  });

  for (const [scenario, status] of [['expired-session-clears-private-ui', 401], ['revoked-session-clears-private-ui', 403]]) {
    await withPage(scenario, '/account/bookings', storedSession(users.bearer, sessions.bearer), makeState({ sessionStatus: status }), async page => {
      await page.getByText('Sign in to view your account.').waitFor({ timeout: 10000 });
      assert.doesNotMatch(await text(page), /Stale Local Private Booking|Server Account Flight|Synthetic Bearer User/);
      const stored = await page.evaluate(() => localStorage.getItem('tpl_auth_session_v1'));
      assert.equal(stored, null, 'unauthorized restore clears stored auth session');
    });
  }

  await withPage('network-failure-shows-retry-unavailable-state', '/account/wallet', storedSession(users.bearer, sessions.bearer), makeState({ abortSession: true }), async page => {
    await page.getByText('We could not confirm your session. Please retry.').waitFor({ timeout: 10000 });
    assert.doesNotMatch(await text(page), /Stale Local Ledger|₹77,777|Server Wallet Credit|Available|\u20b90|No activity/);
  });

  await withPage('account-switch-rejects-delayed-restore-and-clears-previous-user', '/account/profile', storedSession(users.old, sessions.old), makeState({ delays: new Map([['/api/v1/auth/session', 800]]), sessionResolver: request => {
    const authorization = request.headers().authorization || '';
    if (authorization === `Bearer ${sessions.old.token}`) return { user: users.old, session: sessions.old };
    if (authorization === `Bearer ${sessions.next.token}`) return { user: users.next, session: sessions.next };
    return { user: users.bearer, session: sessions.bearer };
  }, verifiedEmails: ['next@example.test'] }), async (page) => {
    await page.waitForFunction(() => document.body.innerText.includes('Confirming your session'));
    await page.evaluate(({ nextUser, nextSession }) => {
      localStorage.setItem('tpl_auth_session_v1', JSON.stringify({ user: nextUser, token: nextSession.token, sessionToken: nextSession.token, session: nextSession }));
      window.dispatchEvent(new Event('TPL_AUTH_UPDATED'));
    }, { nextUser: users.next, nextSession: sessions.next });
    await page.waitForFunction(() => !document.body.innerText.includes('Synthetic Old User'));
    await page.waitForFunction(() => document.body.innerText.includes('Synthetic Next User'));
    await page.waitForTimeout(1000);
    assert.doesNotMatch(await text(page), /Synthetic Old User/);
  });

  await withPage('failed-logout-does-not-claim-server-revocation', '/account/profile', storedSession(users.bearer, sessions.bearer), makeState({ logoutStatus: 500 }), async (page, state) => {
    await waitUntil(() => state.requests.some(r => r.path === '/api/v1/auth/session'), 'session request made before failed logout');
    await page.waitForFunction(() => document.body.innerText.includes('Synthetic Bearer User'));
    await page.getByRole('button', { name: /Log out/i }).click();
    await page.getByRole('button', { name: /Yes, Logout/i }).click();
    await page.waitForTimeout(700);
    assert.equal(state.logoutCalls, 1, 'logout attempted backend revocation');
    assert.equal(await page.evaluate(() => localStorage.getItem('tpl_auth_session_v1')), null, 'failed logout clears local auth session');
    assert.doesNotMatch(await text(page), /logout confirmed|server logout confirmed|session revoked/i);
    await page.goto(`${base}/account/bookings`, { waitUntil: 'domcontentloaded' });
    await page.getByText('Sign in to view your account.').waitFor({ timeout: 10000 });
    assert.doesNotMatch(await text(page), /Server Account Flight|Stale Local Private Booking/);
  });

  await withPage('bookings-failure-does-not-reveal-local-authoritative-data', '/account/bookings', storedSession(users.bearer, sessions.bearer), makeState({ bookingsStatus: 500 }), async page => {
    await page.getByText('We could not load your account bookings. Please retry.').waitFor({ timeout: 10000 });
    assert.doesNotMatch(await text(page), /Stale Local Private Booking|Server Account Flight|No upcoming bookings/);
  });

  await withPage('wallet-account-switch-rejects-late-old-balance', '/account/wallet', storedSession(users.old,sessions.old), makeState({delays:new Map([['/api/v1/wallet',900]]), walletResolver: request => ({promoCredit:request.headers().authorization === 'Bearer '+sessions.old.token ? 999999 : 23, earnedCredit:0, refundableBalance:0})}), async (page,state) => {
    await waitUntil(()=>state.requests.some(r=>r.path==='/api/v1/wallet'),'old wallet request started');
    await page.evaluate(({nextUser,nextSession})=>{localStorage.setItem('tpl_auth_session_v1',JSON.stringify({user:nextUser,token:nextSession.token,session:nextSession}));window.dispatchEvent(new Event('TPL_AUTH_UPDATED'));},{nextUser:users.next,nextSession:sessions.next});
    await page.waitForTimeout(1600);
    assert.doesNotMatch(await text(page), /999,999|9,99,999|Synthetic Old User/);
    assert.match(await text(page), /Synthetic Next User/);
  });
  for (const width of [1440, 768, 390]) {
    await withPage('signed-out-account-' + width, '/account/profile', null, makeState({sessionStatus:401}), async page => {
      await page.setViewportSize({width, height:900});
      await page.getByText('Sign in to view your account.').waitFor();
      assert.doesNotMatch(await text(page), /PK|0000000000|Available|Edit Profile|Save Profile/);
      await page.goto(base + '/account/wallet');
      await page.getByText('Sign in to view your account.').waitFor();
      assert.doesNotMatch(await text(page), /Available|No activity|\u20b90|0000000000/);
    });
  }
  await withPage('authenticated-real-zero-wallet', '/account/wallet', storedSession(users.bearer,sessions.bearer), makeState({wallet:{promoCredit:0,earnedCredit:0,refundableBalance:0},ledger:[]}), async page => {
    await page.waitForFunction(() => document.body.innerText.includes('Available'));
    assert.match(await text(page), /\u20b90/);
  });

  await withPage('wallet-failure-does-not-reveal-local-authoritative-data', '/account/wallet', storedSession(users.bearer, sessions.bearer), makeState({ walletStatus: 500 }), async page => {
    await page.getByText('We could not load your wallet. Please retry.').waitFor({ timeout: 10000 });
    assert.doesNotMatch(await text(page), /Stale Local Ledger|₹77,777|₹88,888|₹99,999|Server Wallet Credit/);
  });

  await withPage('email-only-canonical-user-loads-wallet-without-mobile-query', '/account/wallet', storedSession(users.emailOnly, sessions.bearer), makeState({ sessionResolver: () => ({ user: users.emailOnly, session: sessions.bearer }), verifiedEmails: ['emailonly@example.test'] }), async (page, state) => {
    await page.getByRole('heading', { name: 'Wallet Overview' }).waitFor({ timeout: 10000 });
    await page.getByText('Server Wallet Credit').waitFor({ timeout: 10000 });
    const walletRequest = state.requests.find(r => r.path === '/api/v1/wallet');
    const ledgerRequest = state.requests.find(r => r.path === '/api/v1/wallet/ledger');
    assert.ok(walletRequest, 'wallet request made');
    assert.ok(ledgerRequest, 'wallet ledger request made');
    assert.equal(walletRequest.search, '', 'wallet read uses canonical auth, no mobile query');
    assert.equal(ledgerRequest.search, '', 'ledger read uses canonical auth, no mobile query');
    assert.doesNotMatch(await text(page), /Stale Local Ledger|₹77,777|₹88,888|₹99,999/);
  });

  await withPage('partner-session-restore-destination-and-logout-contract', '/partner-access', storedSession(users.partner, sessions.partner), makeState({ sessionResolver: () => ({ user: users.partner, session: sessions.partner }), partnerAccess: { outcome: 'NO_LINKED_PROFILE', organizationId: null, step: null }, partnerApplication: { application: { id: 'u2-partner-draft', status: 'draft', locked: false, currentStep: 1 } } }), async (page, state) => {
    await page.waitForLoadState('networkidle').catch(() => {});
    assert.match(await text(page), /Partner|application|Logout/i);
    const sessionRequest = state.requests.find(r => r.path === '/api/v1/auth/session');
    assert.ok(sessionRequest, 'partner restore checked backend session');
    assert.equal(state.partnerAccessCalls, 1, 'partner access resolver called');
    await page.getByRole('button', { name: /Logout/i }).first().click();
    await page.waitForTimeout(500);
    assert.equal(state.logoutCalls, 1, 'partner logout attempted server logout');
  });

  await withPage('partner-existing-draft-resume-navigates-from-access-resolver', '/partner-access', storedSession(users.partner, sessions.partner), makeState({ sessionResolver: () => ({ user: users.partner, session: sessions.partner }), partnerAccess: { outcome: 'APPLICATION', organizationId: '11111111-1111-4111-8111-111111111111', step: 'account_contact' } }), async (page, state) => {
    await page.waitForURL('**/partner-preview?step=account_contact&organizationId=11111111-1111-4111-8111-111111111111', { timeout: 10000 });
    assert.equal(state.partnerAccessCalls, 1, 'partner access resolver called once for existing draft');
    assert.match(await text(page), /Partner application navigation target/);
  });

  await withPage('partner-remembered-organization-selection-revalidates-before-resume', '/partner-access', storedSession(users.partner, sessions.partner), makeState({
    sessionResolver: () => ({ user: users.partner, session: sessions.partner }),
    partnerPreference: '22222222-2222-4222-8222-222222222222',
    partnerAccess: {
      outcome: 'SELECTION_REQUIRED',
      organizationId: null,
      step: null,
      profiles: [
        { organizationId: '22222222-2222-4222-8222-222222222222', displayName: 'Synthetic remembered partner', reference: null, status: 'DRAFT_INCOMPLETE', destinationType: 'APPLICATION', updatedAt: '2026-09-13T00:00:00.000Z', selectable: true, restrictedReason: null },
      ],
    },
    partnerSelectAccess: { outcome: 'APPLICATION', organizationId: '22222222-2222-4222-8222-222222222222', step: 'partner_agreement' },
  }), async (page, state) => {
    await page.waitForURL('**/partner-preview?step=partner_agreement&organizationId=22222222-2222-4222-8222-222222222222', { timeout: 10000 });
    assert.equal(state.partnerAccessCalls, 1, 'partner access resolver called');
    assert.equal(state.partnerSelectCalls, 1, 'remembered organization revalidated through select endpoint');
    assert.equal(state.partnerSelectedOrganizationId, '22222222-2222-4222-8222-222222222222');
  });

  await withPage('partner-recovery-complete-adopts-session-and-resumes-draft', '/partner-access', storedSession(users.partner, sessions.partner), makeState({ sessionResolver: () => ({ user: users.partner, session: sessions.partner }), partnerAccess: { outcome: 'NO_LINKED_PROFILE', organizationId: null, step: null } }), async (page, state) => {
    await page.getByRole('button', { name: /Recover existing application/i }).click();
    await page.getByLabel('Registered contact').selectOption('email');
    await page.getByLabel('Registered email').fill('recovery@example.test');
    await page.getByRole('button', { name: /Send verification code/i }).click();
    await page.getByLabel('Verification code').fill('123456');
    await page.getByRole('button', { name: /Verify code/i }).click();
    await page.getByRole('button', { name: /Confirm recovery/i }).click();
    await page.waitForURL('**/partner-preview?step=account_contact&organizationId=11111111-1111-4111-8111-111111111111', { timeout: 10000 });
    assert.equal(state.partnerRecoveryStartCalls, 1, 'recovery start called once');
    assert.equal(state.partnerRecoveryVerifyCalls, 1, 'recovery verify called once');
    assert.equal(state.partnerRecoveryCompleteCalls, 1, 'recovery complete called once');
    const stored = await page.evaluate(() => localStorage.getItem('tpl_auth_session_v1'));
    assert.match(stored || '', /u2-partner-token/, 'recovered partner session persisted');
  });

  console.log(JSON.stringify({ result: 'PASS', proof: 'local synthetic browser runtime', scenarios: 20 }));
} finally {
  await browser.close();
}
