import { notFound } from "next/navigation";
import { isPartnerDeskPreviewEnabled } from "../lib/partner/partnerPreviewGate";
import PartnerGetStartedClient from "./PartnerGetStartedClient";

export default function PartnerPreviewPage() {
  if (!isPartnerDeskPreviewEnabled()) {
    notFound();
  }

  return <PartnerGetStartedClient />;
}
