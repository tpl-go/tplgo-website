/** Presentation only. Canonical readiness and existing mutation guards remain authoritative. */
export function partnerSubmittedDestination(status: string | undefined, preview: string | null, organizationMatches: boolean): string | null {
  return organizationMatches && preview !== "application" && ["SUBMITTED", "UNDER_REVIEW", "RESUBMITTED", "NOT_APPROVED"].includes(status ?? "") ? "/partner-access" : null;
}

export function partnerApplicationPreviewHref(organizationId: string): string {
  return `/partner-preview?step=review_submit&organizationId=${encodeURIComponent(organizationId)}&view=application`;
}
