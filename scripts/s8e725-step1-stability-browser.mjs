import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';

const base = process.env.TPL_STABILITY_URL || 'http://127.0.0.1:3125';
if (new URL(base).hostname !== '127.0.0.1') throw new Error('LOCAL_SYNTHETIC_ONLY');
const baseline = process.env.TPL_STABILITY_BASELINE === '1';
const organizationId = '11111111-1111-4111-8111-111111111111';
const bundle = {
  organization: { id: organizationId, legalName: 'Synthetic Stability QA', status: 'draft', country: 'India', metadata: { application: { accountContact: { contactPersonFullName: 'Synthetic Operator', designation: 'Owner', businessMobile: '+919876543210', businessEmail: 'qa@example.test' } } }, updatedAt: '2026-09-13T00:00:00Z' },
  members: [], contacts: [], serviceScopes: [], requirements: [], documents: [], review: null, events: [],
  readiness: { contactVerified: false, organizationVerified: false, identityVerified: false, overallVerificationStatus: 'NOT_SUBMITTED', blockingRequirements: [], expiringCredentials: [], serviceComplianceStatus: [] },
};
const steps = ['account_contact','business_identity','business_location','services','verification_compliance','payout_tax','partner_agreement'];
function readiness(locked) { return { organizationId, applicationId: organizationId, organizationName: 'Synthetic Stability QA', organizationStatus: 'draft', applicationStatus: locked ? 'UNDER_REVIEW' : 'DRAFT_INCOMPLETE', applicationRevision: 1, submissionReady: false, approvalReady: false, steps: steps.map(step => ({ step, label: step, status: 'NEEDS_ATTENTION', reason: 'Continue', blockerCodes: [], warningCodes: [], correctionRoute: `/partner-preview?step=${step}` })), submissionBlockers: ['APPLICATION_INCOMPLETE'], approvalBlockers: [], warnings: [], activeDeclarations: [], latestSubmission: null }; }
const browser = await chromium.launch({ headless: true });
await mkdir('tmp/s8e725-artifacts', { recursive: true });
try {
 for (const width of baseline ? [1363] : [1363,768,390]) {
  const context = await browser.newContext({ viewport: { width, height: 950 } });
  const page = await context.newPage();
  page.on('pageerror', error => console.log({ syntheticPageError: error.message }));
  const calls = { save: 0, readiness: 0, draft: 0, otp: 0 };
  let locked = false, denied = false, sessionExpired = false, releaseReadiness, releaseOtp;
  await context.route('**/*', async route => {
    const url = new URL(route.request().url());
    if (!url.pathname.includes('/api/v1/')) return url.hostname === '127.0.0.1' ? route.continue() : route.abort();
    let data = {}, status = 200;
    if (url.pathname === '/api/v1/auth/session' || url.pathname === '/api/v1/me') { status = sessionExpired ? 401 : 200; data = { user: { id: 'synthetic-user', fullName: 'Synthetic Operator', mobile: '', email: '', accountType: 'partner' }, session: { token: 'synthetic-local-only-session', expiresAt: '2030-01-01T00:00:00Z' } }; }
    else if (url.pathname.endsWith('/application/draft/account-contact')) { calls.save++; data = bundle; }
    else if (url.pathname.endsWith('/application/draft')) { calls.draft++; data = bundle; }
    else if (url.pathname.endsWith('/application/submission')) {
      calls.readiness++;
      if (releaseReadiness) await new Promise(resolve => { releaseReadiness.resolve = resolve; });
      else await new Promise(resolve => setTimeout(resolve, 200));
      status = denied ? 403 : 200; data = { readiness: readiness(locked), latestSubmission: null };
    }
    else if (url.pathname.endsWith('/contact/mobile/request')) { calls.otp++; if (releaseOtp) await new Promise(resolve => { releaseOtp.resolve = resolve; }); data = { status: 'otp_sent', challengeId: 'synthetic-challenge', expiresAt: '2030-01-01T00:00:00Z', otpLength: 6, deliveryChannel: 'synthetic' }; }
    else if (url.pathname.endsWith('/service-catalogue')) data = { version: 1, domains: [], items: [] };
    else if (url.pathname.includes('/content/website-experience/')) data = { contexts: {} };
    else { status = 401; }
    await route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(status === 200 ? { ok: true, data } : { ok: false, error: { code: 'ACCESS_DENIED', message: 'Denied' } }) });
  });
  await page.goto(`${base}/partner-preview?step=account_contact&organizationId=${organizationId}`);
  const name = page.locator('input[name="contactPersonFullName"]');
  try { await name.waitFor(); } catch (error) { console.log({ syntheticState: await page.locator('body').innerText(), calls }); throw error; }
  // Deliberate observation window spanning several 1.4s autosave periods.
  await page.waitForTimeout(6500);
  if (baseline) {
    assert.ok(calls.save >= 2 && calls.readiness >= 3);
    console.log(JSON.stringify({ baselineLoopReproduced: true, calls }));
    await context.close(); continue;
  }
  assert.equal(calls.save, 0, 'Loaded unchanged draft must not autosave at idle');
  const editorNode = await name.elementHandle();
  await page.locator('input[name="businessMobile"]').fill('9876543210');
  const mobileSection = page.locator('input[name="businessMobile"]').locator('..');
  await mobileSection.getByRole('button', { name: 'Verify', exact: true }).dblclick();
  const otp = page.locator('input[name="mobileOtp"]');
  await otp.waitFor(); await otp.fill('123');
  assert.equal(calls.otp, 1);
  releaseReadiness = {};
  await name.fill('Synthetic Edited Operator');
  await otp.focus();
  await page.waitForFunction(() => document.querySelector('input[name="contactPersonFullName"]')?.value === 'Synthetic Edited Operator');
  await page.waitForTimeout(1900);
  assert.ok(releaseReadiness.resolve, 'Background readiness fetch started');
  assert.ok(await editorNode.evaluate(node => node.isConnected));
  assert.equal(await otp.inputValue(), '123');
  assert.ok(await otp.evaluate(node => document.activeElement === node));
  await otp.press('4');
  releaseReadiness.resolve(); releaseReadiness = null;
  await page.waitForTimeout(4000);
  const idleCalls = { ...calls };
  await page.waitForTimeout(3200);
  assert.deepEqual(calls, idleCalls, 'No request feedback loop');
  assert.equal(await otp.inputValue(), '1234');
  assert.ok(await editorNode.evaluate(node => node.isConnected));
  assert.equal(calls.otp, 1);
  await page.screenshot({ path: `tmp/s8e725-artifacts/stable-${width}.png`, fullPage: true });
  await page.locator('input[name="businessMobile"]').fill('9876543211');
  assert.equal(await otp.count(), 0, 'Changing contact clears the old challenge');
  await page.locator('input[name="businessMobile"]').fill('9876543210');
  assert.equal(await otp.count(), 0, 'Returning to old contact does not restore a challenge');
  releaseOtp = {};
  await mobileSection.getByRole('button', { name: 'Verify', exact: true }).click();
  await page.waitForTimeout(500);
  assert.ok(releaseOtp.resolve);
  await page.locator('input[name="businessMobile"]').fill('9876543212');
  releaseOtp.resolve(); releaseOtp = null;
  await page.waitForTimeout(500);
  assert.equal(await otp.count(), 0, 'Stale in-flight send cannot restore a challenge');
  locked = true;
  await name.fill('Synthetic Terminal Check');
  await page.waitForTimeout(2000);
  assert.ok(await name.isDisabled(), 'Authoritative terminal state locks editor');
  console.log(JSON.stringify({ width, stableEditor: true, otpFocusAndValuePreserved: true, changedContactInvalidates: true, staleSendIgnored: true, noIdleLoop: true, terminalLock: true, calls }));
  // A new read receiving access denial must fail closed, not retain old editor.
  denied = true; await page.reload();
  await page.getByRole('heading', { name: 'Partner application unavailable', exact: true }).waitFor();
  assert.equal(await name.count(), 0);
  denied = false; locked = false; await page.reload(); await name.waitFor();
  denied = true; await name.fill('Synthetic Access Revoked');
  await page.getByRole('heading', { name: 'Partner application unavailable', exact: true }).waitFor();
  assert.equal(await name.count(), 0, 'Background access denial removes editor');
  sessionExpired = true; await page.reload();
  await page.waitForTimeout(1200);
  assert.equal(await name.count(), 0, 'Expired session cannot retain editor');
  await context.close();
 }
} finally { await browser.close(); }
