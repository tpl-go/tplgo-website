// Actual Website/Mobile request builders and response parsers. Only platform
// storage/native imports and network transport are adapted inside this harness.
import { createRequire } from 'node:module';
import { mkdir } from 'node:fs/promises';
import assert from 'node:assert/strict';
import path from 'node:path';
const require = createRequire(import.meta.url);

export async function runClientCorrectionContracts({ request, website, mobile, organizationId, websiteToken, mobileToken }) {
  // Reuse the backend test runner's installed build tool; no installation.
  const { build } = createRequire(path.join(process.cwd(), 'package.json'))('esbuild');
  const output = path.join(website, '.tmp/uf2/client-contracts');
  await mkdir(output, { recursive: true });
  const nativeStubs = {
    'expo-crypto': 'export {randomUUID} from "node:crypto";',
    'expo-file-system/legacy': 'export const FileSystemUploadType={BINARY_CONTENT:0}; export function uploadAsync(){throw Error("Native upload outside this test scope");}',
    'expo-secure-store': 'export function getItemAsync(){throw Error("Explicit test storage required");} export const setItemAsync=getItemAsync,deleteItemAsync=getItemAsync;',
  };
  await build({ entryPoints: [path.join(mobile, 'src/features/partner/partnerApplicationApi.ts')], outfile: path.join(output, 'mobile.cjs'), bundle: true, platform: 'node', format: 'cjs', logLevel: 'silent', alias: { '@': path.join(mobile, 'src') }, plugins: [{ name: 'isolated-native-adapters', setup(b) {
    b.onResolve({ filter: /^expo-(crypto|file-system\/legacy|secure-store)$/ }, args => ({ path: args.path, namespace: 'isolated-native' }));
    b.onLoad({ filter: /.*/, namespace: 'isolated-native' }, args => ({ contents: nativeStubs[args.path], loader: 'js' }));
  } }] });
  await build({ entryPoints: [path.join(website, 'app/lib/partner/partnerApiClient.ts')], outfile: path.join(output, 'website.cjs'), bundle: true, platform: 'node', format: 'cjs', logLevel: 'silent', define: { 'process.env.NEXT_PUBLIC_TPL_API_BASE_URL': JSON.stringify('https://api-staging.tplgo.com'), 'process.env.VERCEL_ENV': JSON.stringify('preview') } });
  const fetchBridge = async (url, init = {}) => {
    const parsed = new URL(url);
    // NO network dispatch: the canonical hostname is checked, then the actual
    // route executes in the isolated Fastify/database test process only.
    assert.equal(parsed.origin, 'https://api-staging.tplgo.com');
    assert(parsed.pathname.startsWith('/api/v1/partner/application/'));
    const response = await request({ method: init.method ?? 'GET', url: parsed.pathname + parsed.search, headers: init.headers, ...(init.body ? { payload: init.body } : {}) });
    return new Response(response.body, { status: response.statusCode, headers: { 'content-type': 'application/json' } });
  };
  const oldFetch = globalThis.fetch, oldWindow = globalThis.window;
  try {
    globalThis.fetch = fetchBridge;
    globalThis.window = { localStorage: { getItem: key => key === 'tpl_auth_session_v1' ? JSON.stringify({ session: { token: websiteToken } }) : null }, sessionStorage: { getItem: () => organizationId }, location: { search: '?organizationId=' + organizationId } };
    const web = require(path.join(output, 'website.cjs'));
    const native = require(path.join(output, 'mobile.cjs')).createPartnerApplicationApi({
      config: { tplEnv: 'app-development', authApiBaseUrl: 'https://api-staging.tplgo.com', serviceApiBaseUrl: 'https://api-app-dev.tplgo.com' },
      storage: { get: async () => ({ ok: true, value: mobileToken }) }, fetchImpl: fetchBridge,
    });
    const fromWebsite = 'Synthetic correction through the actual Website API client.';
    assert.equal((await web.savePartnerBusinessIdentityDraft({ organizationId, description: fromWebsite })).ok, true);
    const seenOnMobile = await native.getDraft(organizationId);
    assert.equal(seenOnMobile.ok, true);
    assert.equal(seenOnMobile.data.organization.metadata.application.businessIdentity.description, fromWebsite);
    const fromMobile = 'Synthetic correction through the actual Mobile API client.';
    assert.equal((await native.saveBusinessIdentityCorrection({ organizationId, description: fromMobile })).ok, true);
    const seenOnWebsite = await web.fetchPartnerApplicationDraft();
    assert.equal(seenOnWebsite.ok, true);
    assert.equal(seenOnWebsite.data.organization.metadata.application.businessIdentity.description, fromMobile);
    return { websiteToMobile: 'PASS', mobileToWebsite: 'PASS', actualClientRequestAndResponseCode: true, networkTransport: 'isolated Fastify injection', nativeUi: 'NOT RUN' };
  } finally {
    globalThis.fetch = oldFetch;
    if (oldWindow === undefined) delete globalThis.window; else globalThis.window = oldWindow;
  }
}
