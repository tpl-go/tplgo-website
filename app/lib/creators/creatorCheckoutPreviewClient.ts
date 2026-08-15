import type { CreatorCheckoutPreview, CreatorCheckoutPreviewInput } from "./creatorCartTypes";

function getCreatorBackendBaseUrl() {
  return process.env.NEXT_PUBLIC_TPL_API_BASE_URL?.replace(/\/$/, "");
}

export async function requestCreatorCheckoutPreview(input: CreatorCheckoutPreviewInput): Promise<CreatorCheckoutPreview | null> {
  const baseUrl = getCreatorBackendBaseUrl();
  if (!baseUrl) return null;

  const response = await fetch(`${baseUrl}/api/v1/creators/checkout/preview`, {
    method: "POST",
    cache: "no-store",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) throw new Error("Creator checkout preview is unavailable");
  return (await response.json()) as CreatorCheckoutPreview;
}
