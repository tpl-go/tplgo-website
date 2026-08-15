import assert from "node:assert/strict";
import test from "node:test";
import { GET as getCatalog } from "../../api/creators/catalog/route";
import { GET as getCategories } from "../../api/creators/categories/route";
import { GET as getAsset } from "../../api/creators/assets/[assetId]/route";
import { GET as getCreator } from "../../api/creators/creators/[creatorId]/route";
import { GET as getCollections } from "../../api/creators/collections/route";
import { GET as getCollection } from "../../api/creators/collections/[collectionId]/route";
import { GET as searchAssets } from "../../api/creators/search/route";
import { POST as previewCheckout } from "../../api/creators/checkout/preview/route";
import { POST as previewOrder } from "../../api/creators/orders/preview/route";
import { POST as previewPayment } from "../../api/creators/payments/preview/route";
import { POST as previewEntitlement } from "../../api/creators/entitlements/preview/route";
import { POST as previewDownload } from "../../api/creators/downloads/authorize-preview/route";
import { GET as getLicenses } from "../../api/creators/licenses/route";
import { POST as validateLicense } from "../../api/creators/licenses/validate/route";
import { POST as previewCertificate } from "../../api/creators/licenses/certificate-preview/route";

const previewFlags = [
  "NEXT_PUBLIC_TPL_CREATOR_BACKEND_PREVIEW_APIS",
  "NEXT_PUBLIC_TPL_CREATOR_CHECKOUT_PREVIEW_API",
  "NEXT_PUBLIC_TPL_CREATOR_ORDER_PREVIEW_API",
  "NEXT_PUBLIC_TPL_CREATOR_PAYMENT_PREVIEW_API",
  "NEXT_PUBLIC_TPL_CREATOR_ENTITLEMENT_PREVIEW_API",
  "NEXT_PUBLIC_TPL_CREATOR_DOWNLOAD_PREVIEW_API",
  "NEXT_PUBLIC_TPL_CREATOR_SECURE_DOWNLOADS",
  "NEXT_PUBLIC_TPL_CREATOR_VERSION_DELIVERY",
] as const;

async function withPreviewFlags(run: () => Promise<void> | void) {
  const previous = new Map<string, string | undefined>();
  for (const flag of previewFlags) {
    previous.set(flag, process.env[flag]);
    process.env[flag] = "true";
  }
  try {
    await run();
  } finally {
    for (const flag of previewFlags) {
      const value = previous.get(flag);
      if (value === undefined) delete process.env[flag];
      else process.env[flag] = value;
    }
  }
}

function jsonRequest(body: unknown) {
  return new Request("http://localhost/api/creators/preview", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

async function parse(response: Response) {
  return (await response.json()) as Record<string, unknown>;
}

test("Creator preview APIs are disabled by default", async () => {
  const response = await getCatalog();
  const body = await parse(response);

  assert.equal(response.status, 404);
  assert.equal(body.ok, false);
  assert.equal((body.error as Record<string, unknown>).code, "CREATOR_PREVIEW_DISABLED");
});

test("Creator catalog preview routes return safe envelopes and static fallback metadata", async () => {
  await withPreviewFlags(async () => {
    const catalog = await parse(await getCatalog());
    const categories = await parse(await getCategories());
    const asset = await parse(await getAsset(new Request("http://localhost"), { params: Promise.resolve({ assetId: "cinematic-ladakh-drone-pack" }) }));
    const creator = await parse(await getCreator(new Request("http://localhost"), { params: Promise.resolve({ creatorId: "aira-studio" }) }));
    const collections = await parse(await getCollections());
    const collection = await parse(await getCollection(new Request("http://localhost"), { params: Promise.resolve({ collectionId: "creator-launch-kits" }) }));
    const search = await parse(await searchAssets(new Request("http://localhost/api/creators/search?query=drone&category=videos")));

    assert.equal(catalog.ok, true);
    assert.equal((catalog.meta as Record<string, unknown>).persistent, false);
    assert.equal((catalog.meta as Record<string, unknown>).transactionAllowed, false);
    assert.equal((catalog.meta as Record<string, unknown>).source, "static_fallback");
    assert.equal(categories.ok, true);
    assert.equal(asset.ok, true);
    assert.equal(creator.ok, true);
    assert.equal(collections.ok, true);
    assert.equal(collection.ok, true);
    assert.equal(search.ok, true);
  });
});

test("Creator asset not found returns safe error envelope", async () => {
  await withPreviewFlags(async () => {
    const response = await getAsset(new Request("http://localhost"), { params: Promise.resolve({ assetId: "missing-asset" }) });
    const body = await parse(response);
    assert.equal(response.status, 404);
    assert.equal(body.ok, false);
    assert.equal(JSON.stringify(body).includes("Error:"), false);
  });
});

test("Creator checkout, order and payment preview APIs remain non-transactional", async () => {
  await withPreviewFlags(async () => {
    const payload = {
      buyerUserId: "buyer-1",
      items: [{ assetSlug: "cinematic-ladakh-drone-pack", selectedLicense: "commercial" }],
    };
    const checkout = await parse(await previewCheckout(jsonRequest(payload)));
    const order = await parse(await previewOrder(jsonRequest(payload)));
    const payment = await parse(await previewPayment(jsonRequest(payload)));

    assert.equal(checkout.ok, true);
    assert.equal(((checkout.data as Record<string, unknown>).checkoutAllowed), false);
    assert.equal(((checkout.data as Record<string, unknown>).paymentAllowed), false);
    assert.equal(order.ok, true);
    assert.equal((((order.data as Record<string, unknown>).draftOrder as Record<string, unknown>).transactionPermissions as Record<string, unknown>).orderPersistenceAllowed, false);
    assert.equal(payment.ok, true);
    assert.equal((payment.data as Record<string, unknown>).paymentExecutionAllowed, false);
    assert.equal((payment.data as Record<string, unknown>).walletMutationAllowed, false);
  });
});

test("Creator entitlement and download preview APIs deny execution permissions", async () => {
  await withPreviewFlags(async () => {
    const entitlement = await parse(await previewEntitlement(jsonRequest({ assetSlug: "cinematic-ladakh-drone-pack", buyerUserId: "buyer-1" })));
    const download = await parse(await previewDownload(jsonRequest({ assetSlug: "cinematic-ladakh-drone-pack", buyerUserId: "buyer-1", malwareStatus: "infected", fileId: "file-1" })));

    assert.equal(entitlement.ok, true);
    assert.equal((entitlement.data as Record<string, unknown>).persistenceAllowed, false);
    assert.equal((entitlement.data as Record<string, unknown>).accessGranted, false);
    assert.equal(download.ok, true);
    assert.equal((download.data as Record<string, unknown>).tokenIssuanceAllowed, false);
    assert.equal((download.data as Record<string, unknown>).signedUrlGenerationAllowed, false);
    assert.equal((download.data as Record<string, unknown>).fileDeliveryAllowed, false);
    assert.equal((((download.data as Record<string, unknown>).downloadRequest as Record<string, unknown>).accessDecision as Record<string, unknown>).decision, "denied_malware_infected");
  });
});

test("Creator license and certificate preview APIs are safe", async () => {
  await withPreviewFlags(async () => {
    const licenses = await parse(await getLicenses());
    const validation = await parse(await validateLicense(jsonRequest({ assetSlug: "jaipur-editorial-photo-set", licenseType: "editorial" })));
    const certificate = await parse(await previewCertificate(jsonRequest({ assetSlug: "jaipur-editorial-photo-set", licenseType: "editorial", buyerUserId: "buyer-1" })));

    assert.equal(licenses.ok, true);
    assert.ok(Array.isArray((licenses.data as Record<string, unknown>).definitions));
    assert.equal(validation.ok, true);
    assert.equal(certificate.ok, true);
    assert.equal((certificate.data as Record<string, unknown>).certificateStatus, "preview_only");
    assert.equal(JSON.stringify(certificate).includes("generatedUrl"), false);
  });
});
