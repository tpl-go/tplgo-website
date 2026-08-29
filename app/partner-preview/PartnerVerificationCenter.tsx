"use client";

import { useMemo, useState } from "react";
import { BadgeCheck, ChevronDown, ChevronRight, Eye, FileText, Link2, Upload } from "lucide-react";
import type { PartnerOrganizationPreviewProfile } from "../lib/partner/partnerOrganizationPreviewProfile";
import type { PartnerDocument, PartnerOrganizationBundle, PartnerRequirement } from "../lib/partner/partnerApiClient";
import type { PartnerServiceDefinition } from "../lib/partner/partnerServiceCatalog";
import {
  addPreviewDocumentForRequirement,
  buildPartnerVerificationRequirements,
  calculateVerificationReadiness,
  findReusableDocuments,
  getPrimaryVerificationCta,
  groupVerificationRequirements,
  isBlockingRequirement,
  linkDocumentToRequirement,
  type PartnerPreviewDocument,
  type PartnerVerificationPreviewState,
  type PartnerVerificationRequirement,
  type VerificationStatus,
} from "../lib/partner/partnerVerificationPreview";

type PartnerVerificationCenterProps = {
  profile: PartnerOrganizationPreviewProfile;
  selectedServices: PartnerServiceDefinition[];
  state: PartnerVerificationPreviewState;
  onStateChange: (state: PartnerVerificationPreviewState) => void;
  onBackToBusinessProfile: () => void;
  onBackToServices: () => void;
  backendBundle?: PartnerOrganizationBundle | null;
  backendError?: string | null;
  onSubmitBackendReview?: () => Promise<boolean>;
  onUploadBackendDocument?: (requirement: PartnerRequirement, file: File, metadata: DocumentUploadMetadata) => Promise<boolean>;
  onLinkBackendDocument?: (documentId: string, requirementId: string) => Promise<boolean>;
};

export type DocumentUploadMetadata = {
  issueDate?: string;
  expiryDate?: string;
  noExpiry?: boolean;
};

export function PartnerVerificationCenter({
  profile,
  selectedServices,
  state,
  onStateChange,
  onBackToBusinessProfile,
  onBackToServices,
  backendBundle,
  backendError,
  onSubmitBackendReview,
  onUploadBackendDocument,
  onLinkBackendDocument,
}: PartnerVerificationCenterProps) {
  const requirements = useMemo(
    () => buildPartnerVerificationRequirements(profile, selectedServices, state.documents),
    [profile, selectedServices, state.documents]
  );
  const groups = groupVerificationRequirements(requirements);
  const readiness = calculateVerificationReadiness(profile, selectedServices, requirements, state.documents);
  const primaryCta = getPrimaryVerificationCta(readiness, state.reviewStatus);
  const actionItems = requirements
    .filter((requirement) => requirement.status !== "Verified" && (isBlockingRequirement(requirement) || requirement.status === "Expired"))
    .sort((a, b) => Number(isBlockingRequirement(b)) - Number(isBlockingRequirement(a)));
  const backendActionItems = backendBundle?.readiness.blockingRequirements ?? [];
  const backendRequirements = backendBundle?.requirements ?? [];
  const serverOverall = backendBundle?.readiness.overallVerificationStatus;
  const serverReviewStatus = backendBundle?.review?.status ?? "NOT_SUBMITTED";

  function toggleGroup(groupId: string) {
    const expanded = state.expandedGroupIds.includes(groupId);
    onStateChange({
      ...state,
      expandedGroupIds: expanded
        ? state.expandedGroupIds.filter((id) => id !== groupId)
        : [...state.expandedGroupIds, groupId],
    });
  }

  async function previewSubmit() {
    if (backendBundle && onSubmitBackendReview) {
      const submitted = await onSubmitBackendReview();
      if (submitted) onStateChange({ ...state, reviewStatus: "preview-submitted" });
      return;
    }
    if (readiness.blockingRequirements.length > 0) return;
    onStateChange({ ...state, reviewStatus: "preview-submitted" });
  }

  return (
    <section className="grid min-w-0 gap-5">
      <div className="rounded-lg border border-[#dbe3ef] bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#eef2ff] px-3 py-1 text-[12px] font-black text-[#4338ca]">
              Step 3 of 5 - Verification Center
            </div>
            <h1 className="mt-4 text-[26px] font-black leading-9 text-[#111827] sm:text-[36px] sm:leading-10">
              Verification Center
            </h1>
            <p className="mt-3 max-w-3xl text-[15px] font-semibold leading-6 text-[#64748b]">
              Preview rules are configured samples by entity, service, and jurisdiction. They are not universal legal requirements.
            </p>
          </div>
          <div className="rounded-lg border border-[#dbe3ef] bg-[#fbfdff] p-4 xl:w-[360px]">
            <p className="text-[12px] font-black uppercase tracking-[0.08em] text-[#64748b]">Readiness output for Page 4</p>
            <div className="mt-3 grid gap-2 text-[13px] font-bold text-[#334155]">
              <SummaryLine label="Organization" value={backendBundle?.readiness.organizationVerified ?? readiness.organizationVerified ? "Verified" : "Action required"} />
              <SummaryLine label="Identity" value={backendBundle?.readiness.identityVerified ?? readiness.identityVerified ? "Verified" : "Action required"} />
              <SummaryLine label="Blocking" value={`${backendActionItems.length || readiness.blockingRequirements.length} requirement(s)`} />
              <SummaryLine label="Overall" value={serverOverall ?? readiness.overallVerificationStatus} />
            </div>
          </div>
        </div>
        <OnboardingJourneyForVerification />
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="grid min-w-0 gap-4">
          <section className="rounded-lg border border-[#dbe3ef] bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-[18px] font-black text-[#111827]">Actions required</h2>
                <p className="mt-1 text-[13px] font-semibold text-[#64748b]">Critical and blocking checks appear first.</p>
              </div>
              <StatusBadge status={toUiStatus(serverOverall) ?? readiness.overallVerificationStatus} />
            </div>
            <div className="mt-4 grid gap-2">
              {backendActionItems.length > 0 ? (
                backendActionItems.slice(0, 6).map((requirement) => (
                  <div key={requirement.id} className="rounded-lg border border-[#e2e8f0] bg-[#f8fafc] p-3">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-[13px] font-black text-[#111827]">{requirement.title}</p>
                        <p className="mt-1 text-[12px] font-semibold text-[#64748b]">
                          Server requirement - {requirement.priority}
                        </p>
                      </div>
                      <StatusBadge status={toUiStatus(requirement.status) ?? "Changes needed"} />
                    </div>
                  </div>
                ))
              ) : actionItems.length > 0 ? (
                actionItems.slice(0, 6).map((requirement) => (
                  <div key={requirement.id} className="rounded-lg border border-[#e2e8f0] bg-[#f8fafc] p-3">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-[13px] font-black text-[#111827]">{requirement.title}</p>
                        <p className="mt-1 text-[12px] font-semibold text-[#64748b]">
                          Applies to: {requirement.entityLabel} - {requirement.ownerType.replace("_", " / ")}
                        </p>
                      </div>
                      <StatusBadge status={requirement.status} />
                    </div>
                  </div>
                ))
              ) : (
                <p className="rounded-lg border border-[#bbf7d0] bg-[#f0fdf4] p-3 text-[13px] font-bold text-[#166534]">
                  Required Preview checks are ready for review submission.
                </p>
              )}
            </div>
          </section>

          {groups.map((group) => {
            const expanded = state.expandedGroupIds.includes(group.id);
            return (
              <section key={group.id} className="rounded-lg border border-[#dbe3ef] bg-white shadow-sm">
                <button
                  type="button"
                  onClick={() => toggleGroup(group.id)}
                  className="flex w-full items-center justify-between gap-3 p-4 text-left focus:outline-none focus:ring-2 focus:ring-[#818cf8]"
                  aria-expanded={expanded}
                >
                  <div>
                    <h2 className="text-[18px] font-black text-[#111827]">{group.title}</h2>
                    <p className="mt-1 text-[13px] font-semibold text-[#64748b]">{group.requirements.length} configured requirement(s)</p>
                  </div>
                  {expanded ? <ChevronDown size={18} aria-hidden="true" /> : <ChevronRight size={18} aria-hidden="true" />}
                </button>
                {expanded ? (
                  <div className="grid gap-3 border-t border-[#e2e8f0] p-4">
                    {group.requirements.map((requirement) => (
                      <RequirementCard
                        key={requirement.id}
                        requirement={requirement}
                        documents={state.documents}
                        onUseDocument={(documentId) => onStateChange(linkDocumentToRequirement(state, documentId, requirement.id))}
                        onUpload={(filename, issueDate, expiryDate) =>
                          onStateChange(addPreviewDocumentForRequirement(state, requirement, filename, issueDate, expiryDate))
                        }
                      />
                    ))}
                  </div>
                ) : null}
              </section>
            );
          })}

          {backendBundle ? (
            <section className="rounded-lg border border-[#dbe3ef] bg-white p-4 shadow-sm">
              <h2 className="text-[18px] font-black text-[#111827]">Server requirements</h2>
              <p className="mt-1 text-[13px] font-semibold text-[#64748b]">
                These records come from staging and are used for Admin review.
              </p>
              <div className="mt-4 grid gap-3">
                {backendRequirements.map((requirement) => (
                  <ServerRequirementCard
                    key={requirement.id}
                    requirement={requirement}
                    documents={backendBundle.documents}
                    onUpload={onUploadBackendDocument ? (file, metadata) => onUploadBackendDocument(requirement, file, metadata) : undefined}
                    onUseDocument={onLinkBackendDocument ? (documentId) => onLinkBackendDocument(documentId, requirement.id) : undefined}
                  />
                ))}
              </div>
            </section>
          ) : null}

          <section className="rounded-lg border border-[#dbe3ef] bg-white p-4 shadow-sm">
            <h2 className="text-[18px] font-black text-[#111827]">Document Library</h2>
            <p className="mt-1 text-[13px] font-semibold text-[#64748b]">
              Metadata only is shown unless secure preview is available. All Preview examples are fictional.
            </p>
            <div className="mt-4 grid gap-3">
              {backendBundle?.documents.map((document) => (
                <BackendDocumentCard key={document.id} document={document} />
              ))}
              {state.documents.map((document) => (
                <DocumentCard key={document.id} document={document} requirements={requirements} />
              ))}
              {backendBundle?.documents.length === 0 && state.documents.length === 0 ? (
                <p className="rounded-lg border border-[#e2e8f0] bg-[#f8fafc] p-3 text-[13px] font-bold text-[#64748b]">
                  No document metadata has been persisted yet.
                </p>
              ) : null}
            </div>
          </section>
        </div>

        <aside className="xl:sticky xl:top-4 xl:self-start">
          <div className="rounded-lg border border-[#dbe3ef] bg-white p-4 shadow-sm">
            <h2 className="text-[17px] font-black text-[#111827]">Verification summary</h2>
            <p className="mt-1 text-[13px] font-bold text-[#4f46e5]">{selectedServices.length} service scope(s)</p>
            <div className="mt-4 grid gap-2">
              {readiness.serviceComplianceStatus.map((service) => (
                <div key={service.serviceId} className="rounded-lg bg-[#f8fafc] p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[13px] font-black text-[#334155]">{service.serviceLabel}</p>
                    <StatusBadge status={service.status} />
                  </div>
                  {service.blockingRequirements.length > 0 ? (
                    <p className="mt-1 text-[12px] font-semibold text-[#64748b]">{service.blockingRequirements[0]}</p>
                  ) : null}
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-lg border border-[#fef3c7] bg-[#fffbeb] p-3">
              <p className="text-[12px] font-black uppercase tracking-[0.08em] text-[#92400e]">Preview honesty</p>
              <p className="mt-2 text-[12px] font-semibold leading-5 text-[#64748b]">
                {backendBundle
                  ? "Private document upload uses staging R2 signed URLs. Uploading stores metadata only after the backend verifies the private object."
                  : "Secure upload provider, email delivery, and Admin review persistence require an authenticated staging organization."}
              </p>
              {backendError ? <p className="mt-2 text-[12px] font-bold text-[#b91c1c]">{backendError}</p> : null}
            </div>
          </div>
        </aside>
      </div>

      <div className="sticky bottom-20 z-20 -mx-4 border-t border-[#dbe3ef] bg-white/95 px-4 py-3 shadow-[0_-10px_30px_rgba(15,23,42,0.08)] backdrop-blur lg:static lg:mx-0 lg:rounded-lg lg:border lg:shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2 sm:flex-row">
            <button type="button" onClick={onBackToServices} className="inline-flex h-11 items-center justify-center rounded-lg border border-[#cfd8e3] bg-white px-4 text-[13px] font-black text-[#334155] transition hover:border-[#4f46e5] focus:outline-none focus:ring-2 focus:ring-[#818cf8]">
              Back to Services
            </button>
            <button type="button" onClick={onBackToBusinessProfile} className="inline-flex h-11 items-center justify-center rounded-lg border border-[#cfd8e3] bg-white px-4 text-[13px] font-black text-[#334155] transition hover:border-[#4f46e5] focus:outline-none focus:ring-2 focus:ring-[#818cf8]">
              Back to Business Profile
            </button>
          </div>
          <button
            type="button"
            onClick={previewSubmit}
            disabled={Boolean(backendBundle ? serverReviewStatus !== "NOT_SUBMITTED" && serverReviewStatus !== "CHANGES_REQUIRED" : readiness.blockingRequirements.length > 0 || state.reviewStatus !== "draft")}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#4f46e5] px-5 text-[14px] font-black text-white transition hover:bg-[#4338ca] disabled:cursor-not-allowed disabled:bg-[#cbd5e1] focus:outline-none focus:ring-2 focus:ring-[#818cf8]"
          >
            {primaryCta}
            <ChevronRight size={17} aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  );
}

function ServerRequirementCard({
  requirement,
  documents,
  onUpload,
  onUseDocument,
}: {
  requirement: PartnerRequirement;
  documents: PartnerDocument[];
  onUpload?: (file: File, metadata: DocumentUploadMetadata) => Promise<boolean>;
  onUseDocument?: (documentId: string) => Promise<boolean>;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [issueDate, setIssueDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const reusableDocuments = documents.filter((document) => document.status !== "REJECTED" && document.status !== "EXPIRED");

  async function upload() {
    if (!file || !onUpload) return;
    setBusy(true);
    setMessage(null);
    const ok = await onUpload(file, {
      issueDate: issueDate || undefined,
      expiryDate: expiryDate || undefined,
      noExpiry: !expiryDate,
    });
    setBusy(false);
    setMessage(ok ? "Document uploaded and linked for review." : "Upload did not complete.");
    if (ok) {
      setFile(null);
      setIssueDate("");
      setExpiryDate("");
    }
  }

  async function reuse(documentId: string) {
    if (!onUseDocument) return;
    setBusy(true);
    setMessage(null);
    const ok = await onUseDocument(documentId);
    setBusy(false);
    setMessage(ok ? "Existing document linked to this requirement." : "Document link did not complete.");
  }

  return (
    <article className="rounded-lg border border-[#e2e8f0] bg-[#fbfdff] p-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[13px] font-black text-[#111827]">{requirement.title}</p>
          <p className="mt-1 text-[12px] font-semibold text-[#64748b]">{requirement.description}</p>
          <p className="mt-1 text-[12px] font-bold text-[#475569]">{requirement.ownerEntityType} - {requirement.priority}</p>
        </div>
        <StatusBadge status={toUiStatus(requirement.status) ?? "Action required"} />
      </div>
      {reusableDocuments.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {reusableDocuments.slice(0, 4).map((document) => (
            <button
              key={document.id}
              type="button"
              onClick={() => reuse(document.id)}
              disabled={busy || !onUseDocument}
              className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-[#bfdbfe] bg-white px-3 text-[12px] font-black text-[#1d4ed8] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Link2 size={14} aria-hidden="true" />
              Use {document.originalFilename}
            </button>
          ))}
        </div>
      ) : null}
      <div className="mt-3 grid gap-2 md:grid-cols-[minmax(0,1fr)_140px_140px_auto]">
        <label className="grid gap-1">
          <span className="text-[12px] font-black text-[#334155]">Private document</span>
          <input
            type="file"
            accept="application/pdf,image/jpeg,image/png,image/webp"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            className="min-h-10 rounded-lg border border-[#cfd8e3] bg-white px-3 py-2 text-[12px] font-semibold text-[#334155]"
          />
        </label>
        <label className="grid gap-1">
          <span className="text-[12px] font-black text-[#334155]">Issue date</span>
          <input type="date" value={issueDate} onChange={(event) => setIssueDate(event.target.value)} className="h-10 rounded-lg border border-[#cfd8e3] px-3 text-[13px] font-semibold outline-none focus:border-[#4f46e5] focus:ring-2 focus:ring-[#c7d2fe]" />
        </label>
        <label className="grid gap-1">
          <span className="text-[12px] font-black text-[#334155]">Expiry date</span>
          <input type="date" value={expiryDate} onChange={(event) => setExpiryDate(event.target.value)} className="h-10 rounded-lg border border-[#cfd8e3] px-3 text-[13px] font-semibold outline-none focus:border-[#4f46e5] focus:ring-2 focus:ring-[#c7d2fe]" />
        </label>
        <button type="button" onClick={upload} disabled={!file || busy || !onUpload} className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#4f46e5] px-3 text-[12px] font-black text-white transition hover:bg-[#4338ca] disabled:cursor-not-allowed disabled:bg-[#cbd5e1] md:mt-auto">
          <Upload size={14} aria-hidden="true" />
          {busy ? "Saving" : "Upload"}
        </button>
      </div>
      {message ? <p className="mt-2 text-[12px] font-bold text-[#475569]">{message}</p> : null}
    </article>
  );
}

function RequirementCard({
  requirement,
  documents,
  onUseDocument,
  onUpload,
}: {
  requirement: PartnerVerificationRequirement;
  documents: PartnerPreviewDocument[];
  onUseDocument: (documentId: string) => void;
  onUpload: (filename: string, issueDate?: string, expiryDate?: string) => void;
}) {
  const [filename, setFilename] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const reusableDocuments = findReusableDocuments(requirement, documents);

  return (
    <article className="rounded-lg border border-[#e2e8f0] bg-[#fbfdff] p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-[16px] font-black text-[#111827]">{requirement.title}</h3>
            <span className="rounded-full bg-[#eef2ff] px-2.5 py-1 text-[11px] font-black text-[#4338ca]">{requirement.priority}</span>
          </div>
          <p className="mt-2 text-[13px] font-semibold text-[#64748b]">Applies to: {requirement.entityLabel} ({requirement.ownerType.replace("_", " / ")})</p>
        </div>
        <StatusBadge status={requirement.status} />
      </div>
      <dl className="mt-3 grid gap-2 text-[13px] leading-5 text-[#334155] md:grid-cols-2">
        <InfoItem label="What do I need?" value={requirement.what} />
        <InfoItem label="Why is TPL asking?" value={requirement.why} />
        <InfoItem label="Does it expire?" value={requirement.expires ? "Yes, expiry date is tracked." : "No expiry expected for this configured rule."} />
        <InfoItem label="Jurisdiction" value={`${requirement.jurisdiction.country}${requirement.jurisdiction.stateRegion ? ` / ${requirement.jurisdiction.stateRegion}` : ""}${requirement.jurisdiction.city ? ` / ${requirement.jurisdiction.city}` : ""}`} />
      </dl>
      {reusableDocuments.length > 0 ? (
        <div className="mt-3 rounded-lg border border-[#dbeafe] bg-[#eff6ff] p-3">
          <p className="text-[13px] font-black text-[#1d4ed8]">Existing document may satisfy this requirement.</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {reusableDocuments.map((document) => (
              <button
                key={document.id}
                type="button"
                onClick={() => onUseDocument(document.id)}
                className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-white px-3 text-[12px] font-black text-[#334155] ring-1 ring-[#bfdbfe] focus:outline-none focus:ring-2 focus:ring-[#818cf8]"
              >
                <Link2 size={14} aria-hidden="true" />
                Use existing document: {document.filename}
              </button>
            ))}
          </div>
        </div>
      ) : null}
      <div className="mt-3 grid gap-2 md:grid-cols-[minmax(0,1fr)_140px_140px_auto]">
        <label className="grid gap-1">
          <span className="text-[12px] font-black text-[#334155]">Upload metadata filename</span>
          <input value={filename} onChange={(event) => setFilename(event.target.value)} placeholder="FICTIONAL-DOCUMENT.pdf" className="h-10 rounded-lg border border-[#cfd8e3] px-3 text-[13px] font-semibold outline-none focus:border-[#4f46e5] focus:ring-2 focus:ring-[#c7d2fe]" />
        </label>
        <label className="grid gap-1">
          <span className="text-[12px] font-black text-[#334155]">Issue date</span>
          <input type="date" value={issueDate} onChange={(event) => setIssueDate(event.target.value)} className="h-10 rounded-lg border border-[#cfd8e3] px-3 text-[13px] font-semibold outline-none focus:border-[#4f46e5] focus:ring-2 focus:ring-[#c7d2fe]" />
        </label>
        <label className="grid gap-1">
          <span className="text-[12px] font-black text-[#334155]">Expiry date</span>
          <input type="date" value={expiryDate} onChange={(event) => setExpiryDate(event.target.value)} className="h-10 rounded-lg border border-[#cfd8e3] px-3 text-[13px] font-semibold outline-none focus:border-[#4f46e5] focus:ring-2 focus:ring-[#c7d2fe]" />
        </label>
        <button type="button" onClick={() => onUpload(filename, issueDate || undefined, expiryDate || undefined)} className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[#cfd8e3] bg-white px-3 text-[12px] font-black text-[#334155] transition hover:border-[#4f46e5] focus:outline-none focus:ring-2 focus:ring-[#818cf8] md:mt-auto">
          <Upload size={14} aria-hidden="true" />
          Add
        </button>
      </div>
    </article>
  );
}

function DocumentCard({ document, requirements }: { document: PartnerPreviewDocument; requirements: PartnerVerificationRequirement[] }) {
  const usage = requirements.filter((requirement) => document.linkedRequirementIds.includes(requirement.id)).map((requirement) => requirement.title);
  return (
    <article className="rounded-lg border border-[#e2e8f0] bg-[#f8fafc] p-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 gap-3">
          <FileText className="mt-0.5 shrink-0 text-[#4f46e5]" size={18} aria-hidden="true" />
          <div className="min-w-0">
            <p className="break-words text-[13px] font-black text-[#111827]">{document.filename}</p>
            <p className="mt-1 text-[12px] font-semibold text-[#64748b]">
              {document.documentType} - Uploaded {document.uploadDate}
            </p>
            <p className="mt-1 text-[12px] font-semibold text-[#64748b]">
              Issue: {document.issueDate ?? "Not captured"} - Expiry: {document.expiryDate ?? "Not captured"}
            </p>
            <p className="mt-1 text-[12px] font-semibold text-[#64748b]">Usage: {usage.length > 0 ? usage.join(", ") : "Not linked"}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <StatusBadge status={document.status} />
          {document.safePreviewAvailable ? (
            <button type="button" className="inline-flex h-8 items-center gap-1 rounded-lg border border-[#cfd8e3] bg-white px-2 text-[12px] font-black text-[#334155] focus:outline-none focus:ring-2 focus:ring-[#818cf8]">
              <Eye size={13} aria-hidden="true" />
              View document
            </button>
          ) : (
            <span className="inline-flex h-8 items-center rounded-lg bg-white px-2 text-[12px] font-bold text-[#64748b] ring-1 ring-[#e2e8f0]">Metadata only</span>
          )}
        </div>
      </div>
    </article>
  );
}

function BackendDocumentCard({ document }: { document: PartnerDocument }) {
  return (
    <article className="rounded-lg border border-[#dbeafe] bg-[#eff6ff] p-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 gap-3">
          <FileText className="mt-0.5 shrink-0 text-[#1d4ed8]" size={18} aria-hidden="true" />
          <div className="min-w-0">
            <p className="break-words text-[13px] font-black text-[#111827]">{document.originalFilename}</p>
            <p className="mt-1 text-[12px] font-semibold text-[#475569]">
              {document.documentType} - {document.mimeType} - {formatBytes(document.sizeBytes)}
            </p>
            <p className="mt-1 text-[12px] font-semibold text-[#64748b]">
              Issue: {document.issueDate ?? "Not captured"} - Expiry: {document.expiryDate ?? "Not captured"}
            </p>
            {document.reviewNote ? <p className="mt-1 text-[12px] font-bold text-[#b91c1c]">{document.reviewNote}</p> : null}
          </div>
        </div>
        <StatusBadge status={toUiStatus(document.status) ?? "Submitted"} />
      </div>
    </article>
  );
}

function StatusBadge({ status }: { status: VerificationStatus }) {
  const className =
    status === "Verified"
      ? "bg-[#dcfce7] text-[#15803d]"
      : status === "Under review" || status === "Submitted"
        ? "bg-[#dbeafe] text-[#1d4ed8]"
        : status === "Expired" || status === "Changes needed"
          ? "bg-[#fee2e2] text-[#b91c1c]"
          : "bg-[#fef3c7] text-[#92400e]";
  return <span className={`inline-flex w-fit rounded-full px-2.5 py-1 text-[11px] font-black ${className}`}>{status}</span>;
}

function toUiStatus(status?: string | null): VerificationStatus | null {
  if (!status) return null;
  if (status === "VERIFIED") return "Verified";
  if (status === "SUBMITTED") return "Submitted";
  if (status === "UNDER_REVIEW") return "Under review";
  if (status === "CHANGES_REQUIRED" || status === "REJECTED") return "Changes needed";
  if (status === "EXPIRED") return "Expired";
  return "Action required";
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-black text-[#111827]">{label}</dt>
      <dd className="mt-1 font-semibold text-[#64748b]">{value}</dd>
    </div>
  );
}

function SummaryLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg bg-white px-3 py-2">
      <span>{label}</span>
      <span className="text-right text-[#111827]">{value}</span>
    </div>
  );
}

function formatBytes(value: number): string {
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${Math.round(value / 102.4) / 10} KB`;
  return `${Math.round(value / 1024 / 102.4) / 10} MB`;
}

function OnboardingJourneyForVerification() {
  const steps = ["Choose Services", "Business Profile", "Verification", "Service Setup", "Go Live"];
  return (
    <ol className="mt-6 grid gap-2 sm:grid-cols-5" aria-label="Partner onboarding journey">
      {steps.map((step, index) => (
        <li key={step} className="flex items-center gap-2 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] px-3 py-2">
          <span className={index < 3 ? "flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#4f46e5] text-[12px] font-black text-white" : "flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-[12px] font-black text-[#64748b]"}>
            {index < 2 ? <BadgeCheck size={13} aria-hidden="true" /> : index + 1}
          </span>
          <span className={index === 2 ? "text-[12px] font-black text-[#111827]" : "text-[12px] font-bold text-[#64748b]"}>{step}</span>
        </li>
      ))}
    </ol>
  );
}
