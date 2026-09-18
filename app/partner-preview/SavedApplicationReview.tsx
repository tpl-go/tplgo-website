import type { PartnerApplicationStepKey, PartnerOrganizationBundle } from "../lib/partner/partnerApiClient";
import { savedApplicationReviewRows } from "../lib/partner/partnerSavedApplicationReview";

export function SavedApplicationReview({ bundle, organizationId, step }: { bundle: PartnerOrganizationBundle | null; organizationId: string | null; step: PartnerApplicationStepKey }) {
  if (!bundle || !organizationId || bundle.organization.id !== organizationId) return <p className="mt-3 text-sm text-slate-400">Saved details are unavailable. Refresh the application to try again.</p>;
  return (
    <details className="mt-3 min-w-0 rounded-lg border border-white/10 bg-[#171a20] p-3">
      <summary className="cursor-pointer rounded text-sm font-bold text-[#fed7aa] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f97316]">View saved details</summary>
      <dl className="mt-3 grid min-w-0 gap-3 text-sm">
        {savedApplicationReviewRows(bundle, step).map((item, index) => <div key={`${item.label}-${index}`} className="min-w-0">
          <dt className="font-semibold text-slate-400">{item.label}</dt>
          <dd className="mt-1 whitespace-pre-wrap break-words font-medium text-slate-100 [overflow-wrap:anywhere]">{item.value}</dd>
        </div>)}
      </dl>
    </details>
  );
}
