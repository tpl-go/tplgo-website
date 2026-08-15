import { NextResponse } from "next/server";
import type { CreatorCartState } from "./creatorCartTypes";
import { getCreatorAsset, getCreatorCollection } from "./creatorCatalogService";
import type { CreatorEntitlement } from "./creatorEntitlementTypes";

export type CreatorPreviewMeta = {
  requestId: string;
  mode: "preview";
  persistent: false;
  transactionAllowed: false;
  source?: "static_fallback" | "preview_service";
};

export function createCreatorPreviewRequestId(prefix = "creator_preview") {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export function creatorPreviewOk<T>(data: T, meta: Partial<CreatorPreviewMeta> = {}) {
  return NextResponse.json({
    ok: true,
    data,
    meta: {
      requestId: meta.requestId || createCreatorPreviewRequestId(),
      mode: "preview",
      persistent: false,
      transactionAllowed: false,
      source: meta.source || "preview_service",
    },
  });
}

export function creatorPreviewDisabled() {
  return NextResponse.json(
    {
      ok: false,
      error: {
        code: "CREATOR_PREVIEW_DISABLED",
        message: "Creator preview service is unavailable.",
      },
      meta: {
        requestId: createCreatorPreviewRequestId(),
      },
    },
    { status: 404 }
  );
}

export function creatorPreviewError(code: string, message: string, status = 400) {
  return NextResponse.json(
    {
      ok: false,
      error: { code, message },
      meta: {
        requestId: createCreatorPreviewRequestId(),
      },
    },
    { status }
  );
}

export async function readCreatorPreviewJson(request: Request, maxLength = 64_000): Promise<Record<string, unknown>> {
  const text = await request.text();
  if (text.length > maxLength) throw new Error("Payload too large.");
  if (!text.trim()) return {};
  const parsed = JSON.parse(text) as unknown;
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("Invalid JSON body.");
  return parsed as Record<string, unknown>;
}

export function sanitizeCreatorPreviewData<T>(data: T): T {
  return JSON.parse(
    JSON.stringify(data, (key, value) => {
      const lowered = key.toLowerCase();
      if (lowered.includes("private") || lowered.includes("secret") || lowered.includes("rawurl") || lowered === "objectkeyreference") {
        return undefined;
      }
      return value;
    })
  ) as T;
}

export function buildCreatorPreviewCart(body: Record<string, unknown>): CreatorCartState {
  const items = Array.isArray(body.items) ? body.items : [];
  const cartItems = items
    .map((item, index) => {
      if (!item || typeof item !== "object") return null;
      const record = item as Record<string, unknown>;
      const assetSlug = String(record.assetSlug || record.slug || "");
      const asset = getCreatorAsset(assetSlug);
      if (!asset) return null;
      const selectedLicense = String(record.selectedLicense || record.license || asset.licenseOptions[0]?.type || "personal");
      const licenseOption = asset.licenseOptions.find((option) => option.type === selectedLicense) || asset.licenseOptions[0];
      if (!licenseOption) return null;
      return {
        id: `creator_preview_cart_item_${index}_${asset.slug}_${licenseOption.type}`,
        itemType: "asset" as const,
        assetSlug: asset.slug,
        title: asset.title,
        creatorSlug: asset.creatorSlug,
        creatorName: asset.creatorName,
        selectedLicense: licenseOption.type,
        licenseOption,
        quantity: 1 as const,
        unitPrice: licenseOption.price,
        currency: asset.currency,
        source: "manual" as const,
        previewQuery: asset.previewQuery,
      };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  return {
    id: String(body.cartId || `creator_preview_cart_${Date.now()}`),
    items: cartItems,
    persistence: "session",
    updatedAt: new Date().toISOString(),
    schemaVersion: 1,
  };
}

export function buildCreatorPreviewEntitlement(body: Record<string, unknown>): CreatorEntitlement {
  const assetSlug = String(body.assetSlug || "cinematic-ladakh-drone-pack");
  const asset = getCreatorAsset(assetSlug) || getCreatorAsset("cinematic-ladakh-drone-pack");
  if (!asset) throw new Error("Creator preview asset is unavailable.");
  const licenseType = asset.licenseOptions[0]?.type || "commercial";

  return {
    entitlementId: String(body.entitlementId || "creator_preview_entitlement_1"),
    buyerUserId: String(body.buyerUserId || "creator_preview_buyer"),
    orderId: String(body.orderId || "creator_preview_order_1"),
    orderItemId: String(body.orderItemId || "creator_preview_order_item_1"),
    assetId: asset.id,
    assetVersionId: String(body.assetVersionId || asset.version),
    creatorId: asset.creatorSlug,
    licenseId: String(body.licenseId || `${asset.id}:${licenseType}:creator-license-policy-v1`),
    licenseType,
    entitlementStatus: (body.entitlementStatus as CreatorEntitlement["entitlementStatus"]) || "active",
    accessStartsAt: String(body.accessStartsAt || new Date().toISOString()),
    accessExpiresAt: typeof body.accessExpiresAt === "string" ? body.accessExpiresAt : null,
    downloadLimit: Number(body.downloadLimit ?? 5),
    downloadCount: Number(body.downloadCount ?? 0),
    remainingDownloads: Math.max(Number(body.downloadLimit ?? 5) - Number(body.downloadCount ?? 0), 0),
    versionAccessPolicy: "minor_updates",
    supportExpiresAt: typeof body.supportExpiresAt === "string" ? body.supportExpiresAt : "2030-01-01T00:00:00.000Z",
    licenseCertificateId: String(body.licenseCertificateId || "creator_preview_certificate_1"),
    revokedAt: null,
    revocationReason: null,
    refundRestricted: Boolean(body.refundRestricted),
    refundRestrictionReason: typeof body.refundRestrictionReason === "string" ? body.refundRestrictionReason : null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    metadata: {
      previewOnly: true,
    },
  };
}

export function getCreatorPreviewCollectionOrNull(collectionId: string) {
  return getCreatorCollection(collectionId) || null;
}
