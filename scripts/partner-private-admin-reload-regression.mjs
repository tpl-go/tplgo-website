import assert from 'node:assert/strict';

// Adds one test-only private note through the normal UI; never makes a final decision.
export async function verifyPrivateAdminReloadLock(page) {
  assert.equal(new URL(page.url()).origin, 'http://127.0.0.1:3100');
  await page.getByText('DEMO / TEST ONLY.', { exact: false }).waitFor();
  const version = Number((await page.getByText(/^Transition v\d+$/).innerText()).match(/\d+/)[0]);
  let release, entered;
  const gate = new Promise(resolve => { release = resolve; });
  const received = new Promise(resolve => { entered = resolve; });
  const path = '**/api/v1/admin/partner-applications?*';
  const pending = [];
  const handler = async route => {
    const task = (async () => {
      const response = await route.fetch();
      assert.equal(response.status(), 200);
      entered();
      await gate;
      await route.fulfill({ response });
    })();
    pending.push(task);
    await task;
  };
  await page.route(path, handler);
  try {
    await page.getByLabel('Private Admin note', { exact: true }).fill('PRIVATE TEST ONLY post-action reload regression evidence.');
    const saved = page.waitForResponse(r => r.request().method() === 'POST' && new URL(r.url()).pathname.endsWith('/notes'));
    await page.getByRole('button', { name: 'Add private note', exact: true }).click();
    assert.equal((await saved).status(), 200);
    await received;
    assert.equal(await page.getByRole('button', { name: 'Approve final application', exact: true }).isDisabled(), true);
    release();
    await page.getByText(`Transition v${version + 1}`, { exact: true }).waitFor();
    return { passed: true, postActionReloadLocked: true, transitionVersionBefore: version, transitionVersionAfter: version + 1 };
  } finally {
    release();
    await Promise.allSettled(pending);
    await page.unroute(path, handler);
  }
}
