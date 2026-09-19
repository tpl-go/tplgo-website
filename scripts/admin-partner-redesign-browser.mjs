// Synthetic production-build UI regression only. All APIs are intercepted;
// external traffic and all mutations are blocked. No real Admin/session is used.
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';

const base = 'http://127.0.0.1:3136';
const out = '.tmp/admin-partner-redesign-browser';
await mkdir(out, { recursive: true });
const admin = { id: 'synthetic-reviewer', fullName: 'Synthetic Reviewer', email: '', status: 'active', roles: ['synthetic'], permissions: ['partner_application.read', 'partner_verification.read', 'partner_payout_tax.read', 'partner_agreement.read'] };
const session = { admin, session: { id: 'synthetic-session', token: 'local-render-test-only', createdAt: '2026-01-01T00:00:00Z', expiresAt: '2099-01-01T00:00:00Z' } };
const row = { submissionId: 'synthetic-submission', applicationId: 'synthetic-application', organizationId: 'synthetic-org', organizationName: 'Synthetic Partner Studio', contact: 'QA contact', country: 'India', entityType: 'Organization', selectedServices: ['Hotel', 'Local experiences'], submissionReference: 'SYNTHETIC-REVIEW', submissionRevision: 1, submittedAt: '2026-09-19T00:00:00Z', workflowStatus: 'SUBMITTED', verificationStatus: 'UNDER_REVIEW', payoutTaxStatus: 'UNDER_REVIEW', agreementStatus: 'PARTNER_ACCEPTED', assignedReviewer: null, ageLabel: 'Today', transitionVersion: 1, blockers: [], warnings: [] };
const queue = { rows: [row], counts: { SUBMITTED: 1, ACTIONABLE: 1, ALL: 1 }, filters: {} };
const detail = {
  submission: { id: row.submissionId, applicationId: row.applicationId, organizationId: row.organizationId, submissionRevision: 1, workflowStatus: 'SUBMITTED', snapshotHash: 'synthetic-digest', submittedAt: row.submittedAt, previousSubmissionId: null, submissionKind: 'SUBMISSION', transitionVersion: 1, partnerVisibleMessage: null },
  organization: { name: row.organizationName, legalName: row.organizationName, brandName: null, country: 'India', entityType: 'Organization', status: 'draft' },
  contact: { displayName: 'Synthetic Contact', email: '', mobile: '' },
  snapshot: { applicationRevision: 1, steps: [{ step: 'business_identity', label: 'Business Identity', status: 'UNDER_REVIEW', reason: 'Ready for review.', blockerCodes: [], warningCodes: [], specialistHref: '/admin/partner-verification' }], selectedServices: row.selectedServices, verificationRequirements: [], payoutTax: null, agreement: null, declarationAcceptances: [] },
  readiness: { approvalReady: false, approvalBlockers: ['SPECIALIST_REVIEW_REQUIRED'], warnings: [] },
  messages: { partnerVisible: null, privateAdminNotes: [] },
  permissions: { canRead: true, canReview: false, canManage: false, canFinalApprove: false },
  actions: { canStartReview: false, canRequestChanges: false, canNotApprove: false, canApprove: false, canAddPrivateNote: false, disabledReasons: {} }, timeline: [],
};
const organization = { review: { id: 'synthetic-review', status: 'SUBMITTED' }, organization: { id: row.organizationId, legalName: row.organizationName, organizationType: 'ORGANIZATION' }, selectedServices: [{ id: 'synthetic-service', serviceCode: 'hotel', serviceLabel: 'Hotel', status: 'SELECTED' }], readiness: { overallVerificationStatus: 'UNDER_REVIEW', serviceComplianceStatus: [] }, blockingCount: 0 };
const results = [];
const browser = await chromium.launch({ headless: true });
try {
  for (const [width, height] of [[1365, 900], [768, 1024], [390, 844]]) {
    const context = await browser.newContext({ viewport: { width, height } });
    await context.addInitScript(value => localStorage.setItem('tpl_admin_session_v1', JSON.stringify(value)), session);
    const mutations = [], requests = [], errors = [];
    let failQueue = false;
    await context.route('**/*', async route => {
      const req = route.request(), url = new URL(req.url());
      if (!url.pathname.includes('/api/')) return url.origin === base ? route.continue() : route.abort();
      if (req.method() !== 'GET') { mutations.push(url.pathname); return route.abort(); }
      requests.push(url.pathname + url.search);
      if (url.pathname === '/api/v1/admin/partner-applications' && failQueue) return route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ ok: false, error: { code: 'UNAVAILABLE', message: 'Synthetic unavailable' } }) });
      let data = {};
      if (url.pathname.endsWith('/admin/me')) data = admin;
      else if (url.pathname.endsWith('/admin/notifications')) data = { unreadCount: 0, notifications: [] };
      else if (url.pathname === '/api/v1/admin/partner-applications') data = queue;
      else if (url.pathname === '/api/v1/admin/partner-applications/synthetic-submission') data = detail;
      else if (url.pathname.endsWith('/partner-verification/queue')) data = [organization];
      else if (url.pathname.includes('intake')) data = { rows: [] };
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, data, meta: { requestId: 'synthetic-request', apiVersion: 'v1' } }) });
    });
    const page = await context.newPage();
    page.setDefaultTimeout(15000);
    page.on('pageerror', error => errors.push(error.message));
    const overflow = async () => assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `no overflow at ${width}`);
    await page.goto(base + '/admin/partners', { waitUntil: 'domcontentloaded' });
    await page.getByText('New applications', { exact: true }).waitFor();
    await overflow();
    await page.screenshot({ path: `${out}/${width}-overview.png`, fullPage: true });
    assert.equal(await page.getByText('Activation data unavailable', { exact: true }).count(), 1);
    await page.getByRole('link', { name: 'View all applications →', exact: true }).click();
    const list = page.getByRole('region', { name: 'Application list' });
    await list.waitFor();
    if (width < 1024) assert.deepEqual(await page.getByRole('navigation', { name: 'Admin quick navigation' }).locator('[aria-current="page"]').allTextContents(), ['Applications']);
    assert.equal(await list.locator('a').count(), 1);
    assert.equal(await page.getByRole('heading', { name: 'Decision Controls' }).count(), 0);
    assert.equal(requests.filter(p => p.startsWith('/api/v1/admin/partner-applications/')).length, 0, 'list does not auto-open an application');
    await page.getByText('More filters', { exact: true }).click();
    await Promise.all([page.waitForResponse(r => new URL(r.url()).searchParams.get('verificationStatus') === 'UNDER_REVIEW'), page.getByLabel('Verification', { exact: true }).fill('UNDER_REVIEW')]);
    await page.getByLabel('Verification', { exact: true }).fill('');
    await list.waitFor();
    await overflow();
    await page.screenshot({ path: `${out}/${width}-applications.png`, fullPage: true });
    await list.locator('a').first().focus();
    await page.keyboard.press('Enter');
    await page.getByRole('heading', { name: 'Submitted Snapshot', exact: true }).waitFor();
    assert.equal(new URL(page.url()).pathname, '/admin/partners/applications/synthetic-submission');
    assert.equal(await page.getByRole('button', { name: 'Approve final application', exact: true }).isDisabled(), true);
    await overflow();
    await page.screenshot({ path: `${out}/${width}-detail.png`, fullPage: true });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.getByRole('heading', { name: 'Submitted Snapshot', exact: true }).waitFor();
    await page.getByRole('link', { name: 'Back to Partner Applications', exact: true }).click();
    await page.getByRole('region', { name: 'Application list' }).waitFor();
    await page.goto(base + '/admin/partners/organizations');
    await page.getByRole('region', { name: 'Organization records' }).waitFor();
    await overflow();
    assert.equal(await page.getByRole('region', { name: 'Organization records' }).locator('a').count(), 1);
    await page.goto(base + '/admin/partners/active');
    await page.getByText('Activation data unavailable', { exact: true }).waitFor();
    await overflow();
    failQueue = true;
    await page.goto(base + '/admin/partners');
    await page.getByRole('alert').waitFor();
    assert.equal(await page.getByText('New applications', { exact: true }).count(), 0, 'failed read is not a zero metric');
    assert.equal(await page.getByRole('region', { name: 'Application list' }).count(), 0);
    assert.deepEqual(mutations, []);
    assert.deepEqual(errors, []);
    results.push({ width, height, result: 'PASS', mutations: 0, checks: ['overview', 'row navigation', 'no auto detail', 'filter contract', 'keyboard', 'detail refresh', 'back', 'organization rows', 'active unavailable', 'read failure', 'no overflow'] });
    await context.close();
  }
} finally {
  await browser.close();
  await writeFile(`${out}/results.json`, JSON.stringify(results, null, 2));
}
console.log(JSON.stringify(results));
