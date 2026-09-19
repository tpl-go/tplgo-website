import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';

const base = 'http://127.0.0.1:3158';
if (new URL(base).hostname !== '127.0.0.1') throw new Error('LOCAL_SYNTHETIC_ONLY');
const baseline = process.env.TPL_STABILITY_BASELINE === '1';
const accountEmailQa = process.env.TPL_ACCOUNT_EMAIL_QA === '1';
const artifacts = '.tmp/uf1/workspace-browser';
const organizationId = '11111111-1111-4111-8111-111111111111';
const bundle = {
  organization: { id: organizationId, legalName: 'Synthetic Stability QA', status: 'draft', country: 'India', metadata: { application: { accountContact: { contactPersonFullName: 'Synthetic Operator', designation: 'Owner', businessMobile: '+919876543210', businessEmail: 'qa@example.test' } } }, updatedAt: '2026-09-13T00:00:00Z' },
  members: [], contacts: [], serviceScopes: [], requirements: [], documents: [], review: null, events: [],
  readiness: { contactVerified: false, organizationVerified: false, identityVerified: false, overallVerificationStatus: 'NOT_SUBMITTED', blockingRequirements: [], expiringCredentials: [], serviceComplianceStatus: [] },
};
const steps = ['account_contact','business_identity','business_location','services','verification_compliance','payout_tax','partner_agreement'];
function readiness(locked) { return { organizationId, applicationId: organizationId, organizationName: 'Synthetic Stability QA', organizationStatus: 'draft', applicationStatus: locked ? 'UNDER_REVIEW' : 'DRAFT_INCOMPLETE', applicationRevision: 1, submissionReady: false, approvalReady: false, steps: steps.map(step => ({ step, label: step, status: 'NEEDS_ATTENTION', reason: 'Continue', blockerCodes: [], warningCodes: [], correctionRoute: `/partner-preview?step=${step}` })), submissionBlockers: ['APPLICATION_INCOMPLETE'], approvalBlockers: [], warnings: [], activeDeclarations: [], latestSubmission: null }; }
const browser = await chromium.launch({ headless: true });
await mkdir(artifacts, { recursive: true });
try {
 for (const width of baseline ? [1363] : [1363,768,390]) {
  const context = await browser.newContext({ viewport: { width, height: 950 } });
  await context.addInitScript(() => localStorage.setItem("tpl_auth_session_v1", JSON.stringify({user:{id:"synthetic-user",accountType:"partner",fullName:"Synthetic Operator"},token:"synthetic-local-only-session"})));
  const page = await context.newPage();
  page.on('pageerror', error => console.log({ syntheticPageError: error.message }));
  const calls = { save: 0, readiness: 0, draft: 0, otp: 0, account: 0 };
  let configurationVersion = 1, configurationCalls = 0, configFail = false;
  let locked = false, denied = false, sessionExpired = false, releaseReadiness, releaseOtp;
  let emailStatus = "EMAIL_DELIVERY_NOT_CONFIGURED";
  let profileEmail = '', loginEmails = ['recovered@example.test'];
  await context.route('**/*', async route => {
    const url = new URL(route.request().url());
    if (!url.pathname.includes('/api/v1/')) return url.hostname === '127.0.0.1' ? route.continue() : route.abort();
    let data = {}, status = 200;
    if (url.pathname === '/api/v1/me') calls.account++;
    if (url.pathname === '/api/v1/auth/session' || url.pathname === '/api/v1/me') { status = sessionExpired ? 401 : 200; data = { user: { id: 'synthetic-user', fullName: 'Synthetic Operator', mobile: '', email: profileEmail, verifiedLoginEmails: loginEmails, accountType: 'partner' }, session: { token: 'synthetic-local-only-session', expiresAt: '2030-01-01T00:00:00Z' } }; }
    else if (url.pathname.endsWith('/application/draft/account-contact')) { calls.save++; data = bundle; }
    else if (url.pathname.endsWith('/application/draft')) { calls.draft++; data = bundle; }
    else if (url.pathname.endsWith('/application/submission')) {
      calls.readiness++;
      if (releaseReadiness) await new Promise(resolve => { releaseReadiness.resolve = resolve; });
      else await new Promise(resolve => setTimeout(resolve, 200));
      status = denied ? 403 : 200; data = { readiness: readiness(locked), latestSubmission: null };
    }
    else if (url.pathname.endsWith('/contact/mobile/request')) { calls.otp++; if (releaseOtp) await new Promise(resolve => { releaseOtp.resolve = resolve; }); data = { status: 'otp_sent', challengeId: 'synthetic-challenge', expiresAt: '2030-01-01T00:00:00Z', otpLength: 6, deliveryChannel: 'synthetic' }; }
    else if (url.pathname.endsWith('/contact/email/request')) data = { status: emailStatus, challengeId: 'synthetic-email', expiresAt: '2030-01-01T00:00:00Z' };
    else if (url.pathname.endsWith('/configuration')) { configurationCalls++; status=configFail?503:200; data={contractVersion:1,versions:{catalogue:configurationVersion,content:1,policy:1},catalogue:{version:configurationVersion,updatedAt:'2026-09-19T00:00:00Z',domains:[],items:[]},applicationContent:[]}; }
    else if (url.pathname.endsWith('/service-catalogue')) data = { version: 1, domains: [], items: [] };
    else if (url.pathname.includes('/content/website-experience/')) data = { contexts: {}, version:'partner_application:1' };
    else { status = 401; }
    await route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(status === 200 ? { ok: true, data } : { ok: false, error: { code: 'ACCESS_DENIED', message: 'Denied' } }) });
  });
  await page.goto(`${base}/partner-preview?step=account_contact&organizationId=${organizationId}`);
  const name = page.locator('input[name="contactPersonFullName"]');
  try { await name.waitFor(); } catch (error) { console.log({ syntheticState: await page.locator('body').innerText(), calls }); throw error; }

  await page.waitForTimeout(1800);
  const mobileSection=page.locator('input[name="businessMobile"]').locator('..');
  await mobileSection.getByRole('button',{name:'Verify',exact:true}).click();
  const otp=page.locator('input[name="mobileOtp"]');await otp.waitFor();await otp.fill('123');
  await name.fill('Synthetic UF1 unsaved operator');await otp.focus();
  const node=await name.elementHandle(),beforeDraft=calls.draft,beforeOtp=calls.otp;
  configurationVersion=2;await page.evaluate(()=>window.dispatchEvent(new Event('focus')));
  await page.waitForTimeout(700);
  assert.equal(await name.inputValue(),'Synthetic UF1 unsaved operator');assert.equal(await otp.inputValue(),'123');
  assert(await node.evaluate(n=>n.isConnected));assert(await otp.evaluate(n=>document.activeElement===n));
  assert.equal(calls.draft,beforeDraft);assert.equal(calls.otp,beforeOtp);assert(configurationCalls>=2);
  configurationVersion=1;await page.evaluate(()=>window.dispatchEvent(new Event('focus')));
  await page.getByText('Updates are temporarily unavailable.',{exact:false}).waitFor();
  assert.equal(await otp.inputValue(),'123');
  configurationVersion=3;configFail=true;await page.getByRole('button',{name:'Retry updates',exact:true}).click();await page.waitForTimeout(300);
  assert.equal(await name.inputValue(),'Synthetic UF1 unsaved operator');assert.equal(calls.otp,beforeOtp);
  configFail=false;await page.getByRole('button',{name:'Retry updates',exact:true}).click();
  await page.getByRole('button',{name:'Retry updates',exact:true}).waitFor({state:'detached'});
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  await page.screenshot({path:artifacts+'/'+width+'.png',fullPage:true});
  console.log(JSON.stringify({width,height:950,synthetic:true,result:'PASS',checks:['configuration refresh','dirty input preserved','OTP challenge preserved','focus and mount preserved','no duplicate OTP','no draft rehydration','older version rejected','failed refresh preserves input','explicit retry','no horizontal overflow']}));
  await context.close();
 }
} finally { await browser.close(); }
