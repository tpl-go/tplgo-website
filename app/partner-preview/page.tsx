import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { isPartnerDeskPreviewEnabled } from "../lib/partner/partnerPreviewGate";
import { isPartnerQaPreviewEnabled, isPartnerQaPreviewRequested } from "../lib/partner/partnerQaPreviewGate";
import PartnerApplicationWorkspaceClient from "./PartnerApplicationWorkspaceClient";

export default async function PartnerPreviewPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = await searchParams;
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const qaRequested = isPartnerQaPreviewRequested(resolvedSearchParams.qa);
  const qaPreviewEnabled = qaRequested && isPartnerQaPreviewEnabled({ host });
  const qaState = typeof resolvedSearchParams.state === "string" ? resolvedSearchParams.state : undefined;
  const qaStep = typeof resolvedSearchParams.step === "string" ? resolvedSearchParams.step : undefined;

  if (qaPreviewEnabled) {
    return <PartnerApplicationWorkspaceClient qaPreviewEnabled initialQaPreviewState={qaState} initialQaStep={qaStep} />;
  }

  if (!isPartnerDeskPreviewEnabled()) {
    notFound();
  }

  return <PartnerApplicationWorkspaceClient initialQaPreviewState={qaState} />;
}
