import assert from 'node:assert/strict';

// Exercises the normal authenticated UI with a delayed, unchanged readiness response.
export async function verifyPrivateStep8Loading(page) {
  assert.equal(new URL(page.url()).origin, 'http://127.0.0.1:3100');
  await page.getByRole('button', { name: /1\. Account/ }).click();
  let release, entered;
  const gate = new Promise(resolve => { release = resolve; });
  const received = new Promise(resolve => { entered = resolve; });
  const path = '**/api/v1/partner/application/submission';
  const pending = [];
  const mutations = [];
  const onRequest = request => {
    if (request.method() === 'POST' && new URL(request.url()).pathname.endsWith('/application/submissions')) mutations.push(request.method());
  };
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
  page.on('request', onRequest);
  await page.route(path, handler);
  try {
    await page.getByRole('button', { name: /8\. Review/ }).click();
    await received;
    assert.equal(await page.getByRole('checkbox', { name: /DEMO ONLY - synthetic workflow acceptance/ }).count(), 0);
    assert.equal(await page.getByRole('dialog').count(), 0);
    const submit = page.getByRole('button', { name: /^(Re)?submit for review$/i });
    if (await submit.count()) assert.equal(await submit.isDisabled(), true);
    release();
    await page.getByRole('checkbox', { name: /DEMO ONLY - synthetic workflow acceptance/ }).waitFor();
    assert.deepEqual(mutations, []);
    return { passed: true, delayedReadiness: true, prematureSubmissions: 0, declarationAcceptanceRequiredAfterLoad: true };
  } finally {
    release();
    await Promise.allSettled(pending);
    await page.unroute(path, handler);
    page.off('request', onRequest);
  }
}
