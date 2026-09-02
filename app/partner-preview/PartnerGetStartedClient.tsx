"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BadgeCheck,
  BriefcaseBusiness,
  Building2,
  Check,
  ChevronRight,
  ClipboardCheck,
  FileCheck2,
  HelpCircle,
  Menu,
  ShieldCheck,
  Search,
  Sparkles,
  Trash2,
  Users,
  X,
} from "lucide-react";
import {
  PartnerBusinessProfileStep,
} from "./PartnerBusinessProfileStep";
import { PartnerVerificationCenter, type DocumentUploadMetadata } from "./PartnerVerificationCenter";
import {
  emptyPartnerOrganizationPreviewProfile,
  markBusinessMobileVerifiedForPreview,
  readPartnerOrganizationPreviewProfile,
  writePartnerOrganizationPreviewProfile,
  type PartnerOrganizationPreviewProfile,
} from "../lib/partner/partnerOrganizationPreviewProfile";
import { useAuth } from "../hooks/useAuth";
import {
  confirmPartnerDocument,
  createPartnerDocumentUploadSession,
  fetchPartnerOrganizations,
  fetchPartnerOrganizationBundle,
  fetchPartnerServiceCatalogue,
  linkPartnerDocumentToRequirement,
  requestPartnerEmailVerification,
  requestPartnerMobileVerification,
  savePartnerOrganizationToBackend,
  submitPartnerVerification,
  updatePartnerOrganizationOnBackend,
  verifyPartnerMobile,
  type PartnerMobileChallenge,
  type PartnerOrganizationBundle,
  type PartnerRequirement,
} from "../lib/partner/partnerApiClient";
import {
  emptyPartnerVerificationPreviewState,
  readPartnerVerificationPreviewState,
  seedFictionalPreviewDocuments,
  writePartnerVerificationPreviewState,
  type PartnerVerificationPreviewState,
} from "../lib/partner/partnerVerificationPreview";
import {
  filterPartnerServiceCatalog,
  buildPartnerServiceCatalogFromItems,
  type PartnerServiceCategory,
  type PartnerServiceCatalogueItem,
  type PartnerServiceCatalogueRuntimeDomain,
  type PartnerServiceDefinition,
} from "../lib/partner/partnerServiceCatalogRuntime";
import {
  canContinuePartnerPreview,
  clearServiceSelection,
  deselectService,
  emptyPartnerPreviewSelection,
  readPartnerPreviewSelection,
  selectedPartnerServices,
  selectedServicesLabel,
  toggleServiceSelection,
  writePartnerPreviewSelection,
} from "../lib/partner/partnerPreviewSelection";
import {
  buildPartnerApplicationCenterReadModel,
  type PartnerApplicationCenterReadModel,
  type PartnerApplicationStep,
  type PartnerApplicationStepId,
  type PartnerApplicationStepStatus,
} from "../lib/partner/partnerApplicationCenter";
import {
  buildPartnerQaPreviewBundle,
  partnerQaPreviewStates,
  type PartnerQaPreviewState,
} from "../lib/partner/partnerQaPreviewFixtures";

const navItems = [
  { label: "Overview", icon: Sparkles, active: true },
  { label: "Application", icon: ClipboardCheck },
  { label: "Help", icon: HelpCircle },
];

const onboardingSteps = [
  "Contact Verification",
  "Business Information",
  "Services",
  "Documents",
  "Review & Submit",
];

const valuePoints = [
  "One account, many services",
  "Reach TPL travellers",
  "Secure & trusted platform",
  "Grow your business",
  "Centralized bookings and payments",
];

const PARTNER_BACKEND_ORGANIZATION_ID_KEY = "tpl.partnerPreview.backendOrganizationId.v1";

type RuntimeCatalogueState = {
  status: "loading" | "ready" | "error";
  domains: PartnerServiceCatalogueRuntimeDomain[];
  items: PartnerServiceCatalogueItem[];
};

export default function PartnerGetStartedClient({
  qaPreviewEnabled = false,
  initialQaPreviewState,
}: {
  qaPreviewEnabled?: boolean;
  initialQaPreviewState?: string;
}) {
  const router = useRouter();
  const { isAuthenticated, openLoginModal } = useAuth();
  const initialQaState = parseQaPreviewState(initialQaPreviewState);
  const [currentStep, setCurrentStep] = useState<"application-center" | "choose-services" | "business-profile" | "verification-preview" | "approved-transition">(
    qaPreviewEnabled && initialQaState === "approved" ? "approved-transition" : "application-center"
  );
  const [qaPreviewState, setQaPreviewState] = useState<PartnerQaPreviewState>(initialQaState);
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSelectedOnly, setShowSelectedOnly] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [organizationProfile, setOrganizationProfile] = useState<PartnerOrganizationPreviewProfile>(emptyPartnerOrganizationPreviewProfile);
  const [verificationState, setVerificationState] = useState<PartnerVerificationPreviewState>(emptyPartnerVerificationPreviewState);
  const [draftSaved, setDraftSaved] = useState(false);
  const [storageReady, setStorageReady] = useState(false);
  const [backendBundle, setBackendBundle] = useState<PartnerOrganizationBundle | null>(null);
  const [partnerOrganizations, setPartnerOrganizations] = useState<PartnerOrganizationBundle[]>([]);
  const [backendStatus, setBackendStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [backendError, setBackendError] = useState<string | null>(null);
  const [mobileChallenge, setMobileChallenge] = useState<PartnerMobileChallenge | null>(null);
  const [mobileOtp, setMobileOtp] = useState("");
  const [mobileVerificationBusy, setMobileVerificationBusy] = useState(false);
  const [mobileVerificationMessage, setMobileVerificationMessage] = useState<string | null>(null);
  const [emailVerificationBusy, setEmailVerificationBusy] = useState(false);
  const [emailVerificationMessage, setEmailVerificationMessage] = useState<string | null>(null);
  const [serviceCatalogueState, setServiceCatalogueState] = useState<RuntimeCatalogueState>({
    status: "loading",
    domains: [],
    items: [],
  });

  useEffect(() => {
    let cancelled = false;
    setServiceCatalogueState((current) => ({ ...current, status: "loading" }));
    fetchPartnerServiceCatalogue().then((result) => {
      if (cancelled) return;
      if (result.ok) {
        setServiceCatalogueState({ status: "ready", domains: result.data.domains, items: result.data.items });
      } else {
        setServiceCatalogueState({ status: "error", domains: [], items: [] });
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (qaPreviewEnabled) {
        setStorageReady(true);
        return;
      }
      const previewState = readPartnerPreviewSelection(window.localStorage);
      setSelectedServiceIds(previewState.selectedServiceIds);
      setCurrentStep("application-center");
      setOrganizationProfile(readPartnerOrganizationPreviewProfile(window.localStorage));
      setVerificationState(seedFictionalPreviewDocuments(readPartnerVerificationPreviewState(window.localStorage)));
      const organizationId = window.localStorage.getItem(PARTNER_BACKEND_ORGANIZATION_ID_KEY);
      if (organizationId) {
        void fetchPartnerOrganizationBundle(organizationId).then((result) => {
          if (result.ok) {
            applyBackendBundle(result.data, { restoreProfile: true });
          } else {
            setBackendStatus("error");
            setBackendError(result.error.message);
          }
        });
      }
      setStorageReady(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [qaPreviewEnabled]);

  useEffect(() => {
    if (qaPreviewEnabled || !storageReady || !isAuthenticated) return;
    void loadPartnerOrganizations();
    // Server organization loading is intentionally gated by auth/storage readiness;
    // adding the local function as a dependency would repeat the resolver after each state write.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, qaPreviewEnabled, storageReady]);

  useEffect(() => {
    if (qaPreviewEnabled || !storageReady) return;
    writePartnerPreviewSelection(window.localStorage, {
      selectedServiceIds,
      completedStep: currentStep === "business-profile" || currentStep === "verification-preview" ? currentStep : "choose-services",
    });
  }, [currentStep, qaPreviewEnabled, selectedServiceIds, storageReady]);

  useEffect(() => {
    if (qaPreviewEnabled || !storageReady) return;
    writePartnerOrganizationPreviewProfile(window.localStorage, organizationProfile);
  }, [organizationProfile, qaPreviewEnabled, storageReady]);

  useEffect(() => {
    if (qaPreviewEnabled || !storageReady) return;
    writePartnerVerificationPreviewState(window.localStorage, verificationState);
  }, [qaPreviewEnabled, storageReady, verificationState]);

  const runtimeServiceCatalog = useMemo(
    () => buildPartnerServiceCatalogFromItems(serviceCatalogueState.domains, serviceCatalogueState.items),
    [serviceCatalogueState.domains, serviceCatalogueState.items]
  );
  const filteredCatalog = useMemo(() => filterPartnerServiceCatalog(searchQuery, runtimeServiceCatalog), [runtimeServiceCatalog, searchQuery]);
  const selectedServices = useMemo(() => selectedPartnerServices(selectedServiceIds, runtimeServiceCatalog.flatMap((category) => category.services)), [runtimeServiceCatalog, selectedServiceIds]);
  const visibleCatalog = showSelectedOnly ? selectedOnlyCatalog(selectedServiceIds, runtimeServiceCatalog) : filteredCatalog;
  const continueEnabled = canContinuePartnerPreview(selectedServiceIds);
  const qaPreviewBundle = useMemo(() => (qaPreviewEnabled ? buildPartnerQaPreviewBundle(qaPreviewState) : null), [qaPreviewEnabled, qaPreviewState]);
  const activeBundle = qaPreviewEnabled ? qaPreviewBundle : backendBundle;
  const applicationCenter = useMemo(
    () => buildPartnerApplicationCenterReadModel({ bundle: activeBundle, profile: organizationProfile, selectedServices, catalogueItems: serviceCatalogueState.items }),
    [activeBundle, organizationProfile, selectedServices, serviceCatalogueState.items]
  );

  function changeQaPreviewState(state: PartnerQaPreviewState) {
    setQaPreviewState(state);
    setCurrentStep(state === "approved" ? "approved-transition" : "application-center");
    router.replace(`/partner-preview?qa=1&state=${state}`, { scroll: false });
  }

  function toggleService(serviceId: string) {
    setSelectedServiceIds((current) => toggleServiceSelection(current, serviceId));
    setCurrentStep("choose-services");
  }

  function clearAll() {
    setSelectedServiceIds(clearServiceSelection());
    setShowSelectedOnly(false);
    setCurrentStep("choose-services");
    writePartnerPreviewSelection(window.localStorage, emptyPartnerPreviewSelection);
  }

  function continueToBusinessProfile() {
    if (!continueEnabled) return;
    setCurrentStep("business-profile");
  }

  function openApplicationStep(stepId: PartnerApplicationStepId | "approved") {
    if (stepId === "approved") {
      setCurrentStep("approved-transition");
      return;
    }
    if (stepId === "account_contact" || stepId === "business_identity" || stepId === "business_location") {
      setCurrentStep("business-profile");
      return;
    }
    if (stepId === "services") {
      setCurrentStep("choose-services");
      return;
    }
    setCurrentStep("verification-preview");
  }

  function saveProfileDraft() {
    void saveProfileToStaging(false);
  }

  function saveProfileAndContinue() {
    void saveProfileToStaging(true);
  }

  async function saveProfileToStaging(continueAfterSave: boolean) {
    setOrganizationProfile((current) => ({ ...current, savedForPreview: true }));
    setDraftSaved(true);

    if (!isAuthenticated) {
      setBackendError("Sign in with TPL Login to save this Partner profile to staging.");
      openLoginModal({ accountType: "partner", intent: "partner", redirectAfterLogin: "/partner-preview" });
      if (continueAfterSave) setCurrentStep("verification-preview");
      return;
    }

    setBackendStatus("saving");
    setBackendError(null);
    const result = backendBundle
      ? await updatePartnerOrganizationOnBackend(backendBundle.organization.id, organizationProfile, selectedServices)
      : await savePartnerOrganizationToBackend(organizationProfile, selectedServices);
    if (!result.ok) {
      setBackendStatus("error");
      setBackendError(result.error.message);
      return;
    }

    applyBackendBundle(result.data, { restoreProfile: false });
    setPartnerOrganizations((current) => upsertBundle(current, result.data));
    if (continueAfterSave) setCurrentStep(resolvePartnerStep(result.data));
  }

  async function refreshBackendBundle(organizationId = backendBundle?.organization.id) {
    if (!organizationId) return;
    const result = await fetchPartnerOrganizationBundle(organizationId);
    if (result.ok) {
      applyBackendBundle(result.data, { restoreProfile: true });
      setPartnerOrganizations((current) => upsertBundle(current, result.data));
    } else {
      setBackendStatus("error");
      setBackendError(result.error.message);
    }
  }

  async function loadPartnerOrganizations() {
    const result = await fetchPartnerOrganizations();
    if (!result.ok) {
      setBackendError(result.error.message);
      return;
    }
    setPartnerOrganizations(result.data);
    const storedId = window.localStorage.getItem(PARTNER_BACKEND_ORGANIZATION_ID_KEY);
    const selected = result.data.find((bundle) => bundle.organization.id === storedId) ?? result.data[0] ?? null;
    if (selected) applyBackendBundle(selected, { restoreProfile: true });
  }

  function applyBackendBundle(bundle: PartnerOrganizationBundle, options: { restoreProfile: boolean }) {
    setBackendBundle(bundle);
    window.localStorage.setItem(PARTNER_BACKEND_ORGANIZATION_ID_KEY, bundle.organization.id);
    setBackendStatus("saved");
    setBackendError(null);
    if (options.restoreProfile) {
      setOrganizationProfile(profileFromBackendBundle(bundle));
      setSelectedServiceIds(bundle.serviceScopes.filter((scope) => scope.status !== "disabled").map((scope) => scope.serviceCode));
      setCurrentStep(resolvePartnerStep(bundle));
    }
  }

  async function requestMobileOtp() {
    if (!backendBundle) {
      setBackendError("Save the business profile to staging before requesting a business contact OTP.");
      return;
    }
    setMobileVerificationBusy(true);
    setBackendError(null);
    setMobileVerificationMessage(null);
    const result = await requestPartnerMobileVerification(backendBundle.organization.id, organizationProfile.businessMobile);
    setMobileVerificationBusy(false);
    if (result.ok) {
      if (result.data.status === "verified_via_tpl_identity") {
        setOrganizationProfile((current) => markBusinessMobileVerifiedForPreview(current));
        setMobileChallenge(null);
        setMobileOtp("");
        setMobileVerificationMessage("Verified via your TPL account.");
        await refreshBackendBundle(backendBundle.organization.id);
        return;
      }
      setMobileChallenge(result.data);
      setMobileOtp("");
      setMobileVerificationMessage(getMobileChallengeMessage(result.data));
      return;
    }
    setMobileVerificationMessage(result.error.message);
  }

  async function verifyMobileOtp() {
    if (!backendBundle || !mobileChallenge) return;
    setMobileVerificationBusy(true);
    setBackendError(null);
    setMobileVerificationMessage(null);
    const result = await verifyPartnerMobile(backendBundle.organization.id, {
      challengeId: mobileChallenge.challengeId,
      mobile: organizationProfile.businessMobile,
      otp: mobileOtp,
    });
    setMobileVerificationBusy(false);
    if (!result.ok) {
      setMobileVerificationMessage(result.error.message);
      return;
    }
    setOrganizationProfile((current) => markBusinessMobileVerifiedForPreview(current));
    setMobileChallenge(null);
    setMobileOtp("");
    setMobileVerificationMessage("Verified.");
    await refreshBackendBundle(backendBundle.organization.id);
  }

  async function requestEmailVerificationUx() {
    if (!backendBundle) {
      setEmailVerificationMessage("Save the business profile to staging before requesting email verification.");
      return;
    }
    setEmailVerificationBusy(true);
    setBackendError(null);
    setEmailVerificationMessage(null);
    const result = await requestPartnerEmailVerification(backendBundle.organization.id, organizationProfile.businessEmail);
    setEmailVerificationBusy(false);
    if (result.ok && result.data.status === "EMAIL_DELIVERY_NOT_CONFIGURED") {
      setEmailVerificationMessage("Email verification will be available when email delivery is enabled.");
      return;
    }
    setEmailVerificationMessage(result.ok ? "Email verification request created." : result.error.message);
  }

  async function submitBackendReview() {
    if (!backendBundle) {
      setBackendError("Save the business profile to staging before submitting for review.");
      return false;
    }
    const email = organizationProfile.businessEmail.trim();
    if (email) void requestPartnerEmailVerification(backendBundle.organization.id, email);
    const result = await submitPartnerVerification(backendBundle.organization.id);
    if (!result.ok) {
      setBackendError(result.error.message);
      return false;
    }
    await refreshBackendBundle(backendBundle.organization.id);
    return true;
  }

  async function uploadBackendDocument(requirement: PartnerRequirement, file: File, metadata: DocumentUploadMetadata) {
    if (!backendBundle) {
      setBackendError("Save the business profile to staging before uploading documents.");
      return false;
    }
    setBackendError(null);
    const validationError = validatePrivateDocumentFile(file);
    if (validationError) {
      setBackendError(validationError);
      return false;
    }
    const checksumSha256 = await sha256File(file);
    const session = await createPartnerDocumentUploadSession(backendBundle.organization.id, {
      filename: file.name,
      mimeType: file.type,
      sizeBytes: file.size,
      checksumSha256,
    });
    if (!session.ok) {
      setBackendError(session.error.message);
      return false;
    }
    if (session.data.executionStatus !== "READY" || !session.data.upload?.supported || !session.data.upload.url || !session.data.storageReference) {
      setBackendError("Private staging storage is not ready for document upload.");
      return false;
    }
    const putResponse = await fetch(session.data.upload.url, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    });
    if (!putResponse.ok) {
      setBackendError(`Private document upload failed with HTTP ${putResponse.status}.`);
      return false;
    }
    const confirmed = await confirmPartnerDocument(backendBundle.organization.id, {
      ownerEntityType: requirement.ownerEntityType,
      ownerEntityId: requirement.serviceScopeId ?? undefined,
      documentCategory: "partner_verification",
      documentType: requirement.title,
      storageReference: session.data.storageReference,
      originalFilename: file.name,
      mimeType: file.type,
      sizeBytes: file.size,
      checksumSha256,
      issueDate: metadata.issueDate,
      expiryDate: metadata.expiryDate,
      noExpiry: metadata.noExpiry,
    });
    if (!confirmed.ok) {
      setBackendError(confirmed.error.message);
      return false;
    }
    const linked = await linkPartnerDocumentToRequirement(backendBundle.organization.id, {
      documentId: confirmed.data.id,
      requirementId: requirement.id,
    });
    if (!linked.ok) {
      setBackendError(linked.error.message);
      return false;
    }
    await refreshBackendBundle(backendBundle.organization.id);
    return true;
  }

  async function linkBackendDocument(documentId: string, requirementId: string) {
    if (!backendBundle) return false;
    setBackendError(null);
    const linked = await linkPartnerDocumentToRequirement(backendBundle.organization.id, { documentId, requirementId });
    if (!linked.ok) {
      setBackendError(linked.error.message);
      return false;
    }
    await refreshBackendBundle(backendBundle.organization.id);
    return true;
  }

  return (
    <main data-partner-preview-root="true" className="min-h-screen bg-[#f7f8fc] pb-24 text-[#111827] lg:pb-0">
      <style jsx global>{`
        body:has([data-partner-preview-root="true"]) button.fixed.bottom-4 {
          display: none !important;
        }
      `}</style>
      <header className="border-b border-[#dbe3ef] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#4f46e5] text-white">
              <Sparkles size={18} aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-black uppercase tracking-[0.08em] text-[#4f46e5]">TPL Partner Desk</p>
              <p className="truncate text-[13px] font-bold text-[#64748b]">Preview workspace</p>
            </div>
          </div>
          <Link
            href="/"
            className="inline-flex h-9 shrink-0 items-center justify-center rounded-lg border border-[#cfd8e3] bg-white px-3 text-[12px] font-black text-[#334155] transition hover:border-[#4f46e5] focus:outline-none focus:ring-2 focus:ring-[#818cf8]"
          >
            TPL GO
          </Link>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-5 px-4 py-5 lg:grid-cols-[248px_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-4 lg:self-start">
          <button
            type="button"
            onClick={() => setMobileNavOpen((current) => !current)}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-[#cfd8e3] bg-white px-4 text-[13px] font-black text-[#334155] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#818cf8] lg:hidden"
            aria-expanded={mobileNavOpen}
          >
            <Menu size={17} aria-hidden="true" />
            Partner navigation
          </button>
          <nav
            aria-label="Partner navigation"
            className={`${mobileNavOpen ? "mt-2 grid" : "hidden"} gap-1 rounded-lg border border-[#dbe3ef] bg-white p-2 shadow-sm lg:grid`}
          >
            {navItems.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => setMobileNavOpen(false)}
                className={
                  item.active
                    ? "flex h-10 items-center gap-3 rounded-md bg-[#eef2ff] px-3 text-left text-[13px] font-black text-[#4338ca] focus:outline-none focus:ring-2 focus:ring-[#818cf8]"
                    : "flex h-10 items-center gap-3 rounded-md px-3 text-left text-[13px] font-bold text-[#475569] transition hover:bg-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-[#818cf8]"
                }
                aria-current={item.active ? "page" : undefined}
              >
                <item.icon size={16} aria-hidden="true" />
                <span className="truncate">{item.label}</span>
                {!item.active ? <span className="ml-auto text-[10px] font-black uppercase text-[#94a3b8]">Preview</span> : null}
              </button>
            ))}
          </nav>
        </aside>

        <section className="grid min-w-0 gap-5">
          {qaPreviewEnabled ? (
            <PartnerQaPreviewBar selectedState={qaPreviewState} onChange={changeQaPreviewState} />
          ) : null}

          {!qaPreviewEnabled && partnerOrganizations.length > 0 ? (
            <OrganizationContextBar
              organizations={partnerOrganizations}
              activeOrganizationId={backendBundle?.organization.id ?? null}
              onSwitch={(organizationId) => {
                const next = partnerOrganizations.find((bundle) => bundle.organization.id === organizationId);
                if (next) applyBackendBundle(next, { restoreProfile: true });
              }}
            />
          ) : null}

          {currentStep === "application-center" ? (
            <ApplicationCenterHome
              model={applicationCenter}
              authenticated={isAuthenticated}
              onOpenStep={openApplicationStep}
              onSignIn={() => openLoginModal({ accountType: "partner", intent: "partner", redirectAfterLogin: "/partner-preview" })}
            />
          ) : currentStep === "approved-transition" && activeBundle ? (
            <ApprovedPartnerTransition bundle={activeBundle} onBack={() => setCurrentStep("application-center")} />
          ) : currentStep === "business-profile" ? (
            <PartnerBusinessProfileStep
              selectedServices={selectedServices}
              profile={organizationProfile}
              onProfileChange={(profile) => {
                if (profile.businessMobile !== organizationProfile.businessMobile) {
                  setMobileChallenge(null);
                  setMobileOtp("");
                  setMobileVerificationMessage(null);
                }
                if (profile.businessEmail !== organizationProfile.businessEmail) {
                  setEmailVerificationMessage(null);
                }
                setOrganizationProfile(profile);
                setDraftSaved(false);
              }}
              onBackToServices={() => setCurrentStep("choose-services")}
              onSaveDraft={saveProfileDraft}
              onSaveAndContinue={saveProfileAndContinue}
              draftSaved={draftSaved}
              backendOrganizationId={backendBundle?.organization.id ?? null}
              backendStatus={backendStatus}
              backendError={backendError}
              mobileChallenge={mobileChallenge}
              mobileOtp={mobileOtp}
              onMobileOtpChange={setMobileOtp}
              onRequestMobileOtp={requestMobileOtp}
              onVerifyMobileOtp={verifyMobileOtp}
              mobileVerificationBusy={mobileVerificationBusy}
              mobileVerificationMessage={mobileVerificationMessage}
              emailVerificationBusy={emailVerificationBusy}
              emailVerificationMessage={emailVerificationMessage}
              onRequestEmailVerification={requestEmailVerificationUx}
            />
          ) : currentStep === "verification-preview" ? (
            <PartnerVerificationCenter
              profile={organizationProfile}
              selectedServices={selectedServices}
              state={verificationState}
              onStateChange={setVerificationState}
              onBackToBusinessProfile={() => setCurrentStep("business-profile")}
              onBackToServices={() => setCurrentStep("choose-services")}
              backendBundle={backendBundle}
              backendError={backendError}
              onSubmitBackendReview={submitBackendReview}
              onUploadBackendDocument={uploadBackendDocument}
              onLinkBackendDocument={linkBackendDocument}
            />
          ) : (
          <>
            <div className="rounded-lg border border-[#dbe3ef] bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div className="min-w-0">
                <div className="inline-flex items-center gap-2 rounded-full bg-[#eef2ff] px-3 py-1 text-[12px] font-black text-[#4338ca]">
                  Step 1 of 5
                </div>
                <h1 className="mt-4 text-[28px] font-black leading-9 text-[#111827] sm:text-[36px] sm:leading-10">
                  Let&apos;s build your business on TPL
                </h1>
                <p className="mt-3 max-w-3xl text-[15px] font-semibold leading-6 text-[#64748b]">
                  Select the services you provide and set up your business. You can manage multiple services from one Partner account.
                </p>
              </div>
              <div className="rounded-lg border border-[#dbe3ef] bg-[#fbfdff] p-4 xl:w-[360px]">
                <p className="text-[12px] font-black uppercase tracking-[0.08em] text-[#64748b]">Why partner with TPL?</p>
                <div className="mt-3 grid gap-2">
                  {valuePoints.map((point) => (
                    <div key={point} className="flex items-center gap-2 text-[13px] font-bold text-[#334155]">
                      <Check size={15} className="text-[#4f46e5]" aria-hidden="true" />
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <OnboardingJourney />
          </div>

            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
              <div className="grid min-w-0 gap-4">
                <div className="rounded-lg border border-[#dbe3ef] bg-white p-4 shadow-sm">
                  <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
                    <label className="relative block">
                      <span className="sr-only">Search services</span>
                      <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b]" size={18} aria-hidden="true" />
                      <input
                        value={searchQuery}
                        onChange={(event) => {
                          setSearchQuery(event.target.value);
                          setShowSelectedOnly(false);
                        }}
                        placeholder="Search services..."
                        className="h-11 w-full rounded-lg border border-[#cfd8e3] bg-white pl-10 pr-3 text-[14px] font-semibold text-[#111827] outline-none transition placeholder:text-[#94a3b8] focus:border-[#4f46e5] focus:ring-2 focus:ring-[#c7d2fe]"
                      />
                    </label>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setShowSelectedOnly((current) => !current)}
                        className="inline-flex h-10 items-center justify-center rounded-lg border border-[#cfd8e3] bg-white px-3 text-[12px] font-black text-[#334155] transition hover:border-[#4f46e5] focus:outline-none focus:ring-2 focus:ring-[#818cf8]"
                      >
                        View Selected Services
                      </button>
                      <button
                        type="button"
                        onClick={clearAll}
                        disabled={selectedServiceIds.length === 0}
                        className="inline-flex h-10 items-center justify-center rounded-lg border border-[#fecaca] bg-white px-3 text-[12px] font-black text-[#991b1b] transition hover:bg-[#fff7f7] disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#fca5a5]"
                      >
                        Clear All
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4">
                  {visibleCatalog.length > 0 ? (
                    visibleCatalog.map((category) => (
                      <ServiceCategoryCard
                        key={category.id}
                        category={category}
                        selectedServiceIds={selectedServiceIds}
                        onToggle={toggleService}
                      />
                    ))
                  ) : (
                    <div className="rounded-lg border border-dashed border-[#cfd8e3] bg-white p-6 text-center">
                      <p className="text-[15px] font-black text-[#111827]">No matching services</p>
                      <p className="mt-1 text-[13px] font-semibold text-[#64748b]">Try hotel, cab, wedding, shoot, medical, or marketplace.</p>
                    </div>
                  )}
                </div>
              </div>

              <SelectionSummary
                selectedServices={selectedServices}
                onRemove={(serviceId) => setSelectedServiceIds((current) => deselectService(current, serviceId))}
                onClear={clearAll}
                onContinue={continueToBusinessProfile}
                continueEnabled={continueEnabled}
              />
            </div>
          </>
          )}
        </section>
      </div>
    </main>
  );
}

function ApplicationCenterHome({
  model,
  authenticated,
  onOpenStep,
  onSignIn,
}: {
  model: PartnerApplicationCenterReadModel;
  authenticated: boolean;
  onOpenStep: (stepId: PartnerApplicationStepId | "approved") => void;
  onSignIn: () => void;
}) {
  const nextActionIsApproved = model.nextAction.stepId === "approved";
  return (
    <div className="grid gap-5">
      <section className="overflow-hidden rounded-xl border border-[#bfdbfe] bg-white shadow-sm">
        <div className="relative bg-[linear-gradient(135deg,#082f72_0%,#0b74ff_58%,#06b6d4_100%)] px-5 py-6 text-white sm:px-6">
          <div className="absolute right-0 top-0 h-28 w-28 rounded-full bg-white/10 blur-2xl" />
          <div className="relative grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div className="min-w-0">
              <p className="text-[11px] font-black uppercase tracking-[0.14em] text-cyan-100">Partner Application Center</p>
              <h1 className="mt-2 text-[26px] font-black leading-8 sm:text-[32px] sm:leading-10">
                Welcome, {model.organizationName}
              </h1>
              <p className="mt-2 max-w-2xl text-[14px] font-semibold leading-6 text-white/82">
                Complete your Partner application to get verified with TPL GO.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <StatusPill status={model.overallStatus} label={model.statusLabel} />
              <span className="inline-flex min-h-8 items-center rounded-full border border-white/20 bg-white/12 px-3 text-[11px] font-black uppercase tracking-[0.08em] text-white">
                Save & continue later
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="grid gap-4">
          <div className="rounded-xl border border-[#dbe3ef] bg-white p-4 shadow-sm sm:p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#eff6ff] text-[#0b74ff]">
                    <ClipboardCheck size={18} aria-hidden="true" />
                  </div>
                  <div>
                    <h2 className="text-[18px] font-black text-[#111827]">Application progress</h2>
                    <p className="text-[13px] font-semibold text-[#64748b]">
                      {model.progressCompleted} of {model.progressTotal} steps completed
                    </p>
                  </div>
                </div>
              </div>
              <div className="min-w-[180px]">
                <div className="h-2 rounded-full bg-[#e2e8f0]">
                  <div
                    className="h-2 rounded-full bg-[linear-gradient(135deg,#f97316,#ea580c)]"
                    style={{ width: `${model.progressPercent}%` }}
                  />
                </div>
                <p className="mt-2 text-right text-[12px] font-black text-[#475569]">{model.progressPercent}% complete</p>
              </div>
            </div>
          </div>

          {model.overallStatus === "under-review" ? <ReviewTimeline submittedAt={model.submittedAt} /> : null}
          {model.overallStatus === "changes-required" ? (
            <AttentionCard
              title="Action required"
              description={model.reviewNote ?? "TPL GO needs a few updates before we can continue."}
              onClick={() => onOpenStep(model.nextAction.stepId)}
            />
          ) : null}
          {model.overallStatus === "rejected" ? (
            <AttentionCard
              title="Application not approved"
              description={model.reviewNote ?? "Review the decision and contact support if you need help."}
              onClick={() => onOpenStep("review_submit")}
              tone="danger"
            />
          ) : null}

          <div className="grid gap-3 md:grid-cols-2">
            {model.steps.map((step) => (
              <ApplicationStepCard key={step.id} step={step} onOpen={() => onOpenStep(step.id)} />
            ))}
          </div>
        </div>

        <aside className="xl:sticky xl:top-4 xl:self-start">
          <div className="rounded-xl border border-[#fed7aa] bg-white p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#fff7ed] text-[#f97316]">
                <Sparkles size={19} aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-black uppercase tracking-[0.12em] text-[#ea580c]">Next step</p>
                <h2 className="mt-1 text-[20px] font-black leading-6 text-[#111827]">{model.nextAction.title}</h2>
                <p className="mt-2 text-[13px] font-semibold leading-5 text-[#64748b]">{model.nextAction.description}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onOpenStep(model.nextAction.stepId)}
              className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[linear-gradient(135deg,#f97316,#ea580c)] px-4 text-[14px] font-black text-white shadow-[0_10px_24px_rgba(249,115,22,0.24)] transition hover:translate-y-[-1px] focus:outline-none focus:ring-2 focus:ring-[#fdba74]"
            >
              {nextActionIsApproved ? "View Status" : model.nextAction.actionLabel}
              <ChevronRight size={17} aria-hidden="true" />
            </button>
            {!authenticated ? (
              <button
                type="button"
                onClick={onSignIn}
                className="mt-2 inline-flex h-10 w-full items-center justify-center rounded-xl border border-[#bfdbfe] bg-[#eff6ff] px-4 text-[13px] font-black text-[#0b74ff] transition hover:bg-[#dbeafe] focus:outline-none focus:ring-2 focus:ring-[#93c5fd]"
              >
                Sign in to save progress
              </button>
            ) : null}
          </div>

          <div className="mt-4 rounded-xl border border-[#dbe3ef] bg-white p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#eff6ff] text-[#0b74ff]">
                <HelpCircle size={18} aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-[16px] font-black text-[#111827]">Need help with your application?</h2>
                <p className="mt-1 text-[13px] font-semibold leading-5 text-[#64748b]">
                  Contact TPL GO support if you are unsure which step to complete.
                </p>
                <Link href="/customer-support" className="mt-3 inline-flex h-9 items-center rounded-lg border border-[#cfd8e3] bg-white px-3 text-[12px] font-black text-[#334155] hover:border-[#0b74ff]">
                  Get Help
                </Link>
              </div>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}

function PartnerQaPreviewBar({
  selectedState,
  onChange,
}: {
  selectedState: PartnerQaPreviewState;
  onChange: (state: PartnerQaPreviewState) => void;
}) {
  const selectedLabel = partnerQaPreviewStates.find((state) => state.id === selectedState)?.label ?? "New Partner";
  return (
    <div className="rounded-xl border border-[#fed7aa] bg-white p-3 shadow-sm" data-partner-qa-current-state={selectedState}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <span className="inline-flex h-8 shrink-0 items-center rounded-full bg-[linear-gradient(135deg,#082f72,#0b74ff)] px-3 text-[11px] font-black uppercase tracking-[0.1em] text-white">
            Staging QA Preview
          </span>
          <p className="min-w-0 text-[12px] font-semibold text-[#64748b]">
            Fictional read-only states for visual inspection. Current: {selectedLabel}.
          </p>
        </div>
        <div className="grid gap-2 sm:grid-cols-[minmax(0,240px)_auto]">
          <label className="block">
            <span className="sr-only">Preview as</span>
            <select
              data-partner-qa-state-select="true"
              value={selectedState}
              onChange={(event) => onChange(event.target.value as PartnerQaPreviewState)}
              className="h-10 w-full rounded-lg border border-[#fdba74] bg-[#fff7ed] px-3 text-[13px] font-black text-[#9a3412] outline-none focus:border-[#f97316] focus:ring-2 focus:ring-[#fed7aa]"
            >
              {partnerQaPreviewStates.map((state) => (
                <option key={state.id} value={state.id}>
                  Preview as: {state.label}
                </option>
              ))}
            </select>
          </label>
          <Link
            data-partner-qa-exit="true"
            href="/partner-preview"
            className="inline-flex h-10 items-center justify-center rounded-lg border border-[#cfd8e3] bg-white px-3 text-[12px] font-black text-[#334155] hover:border-[#0b74ff] focus:outline-none focus:ring-2 focus:ring-[#93c5fd]"
          >
            Exit Preview
          </Link>
        </div>
      </div>
    </div>
  );
}

function ApplicationStepCard({ step, onOpen }: { step: PartnerApplicationStep; onOpen: () => void }) {
  return (
    <article className="rounded-xl border border-[#dbe3ef] bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eff6ff] text-[#0b74ff]">
            {renderStepIcon(step.id)}
          </div>
          <div className="min-w-0">
            <h3 className="text-[15px] font-black text-[#111827]">{step.name}</h3>
            <p className="mt-1 text-[12px] font-semibold leading-5 text-[#64748b]">{step.description}</p>
          </div>
        </div>
        <StepStatusPill status={step.status} />
      </div>
      <button
        type="button"
        onClick={onOpen}
        disabled={!step.enabled}
        className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-[#cfd8e3] bg-white px-3 text-[13px] font-black text-[#334155] transition hover:border-[#0b74ff] disabled:cursor-not-allowed disabled:bg-[#f1f5f9] disabled:text-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#93c5fd]"
      >
        {step.enabled ? step.actionLabel : "Locked"}
        <ChevronRight size={16} aria-hidden="true" />
      </button>
    </article>
  );
}

function ReviewTimeline({ submittedAt }: { submittedAt?: string | null }) {
  const items = ["Submitted", "TPL Review", "Verification", "Decision"];
  return (
    <section className="rounded-xl border border-[#fde68a] bg-[#fffbeb] p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#d97706]">
          <ShieldCheck size={18} aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <h2 className="text-[17px] font-black text-[#111827]">Application submitted</h2>
          <p className="mt-1 text-[13px] font-semibold text-[#64748b]">
            {submittedAt ? `Submitted ${formatDate(submittedAt)}.` : "TPL GO is reviewing your application."}
          </p>
        </div>
      </div>
      <ol className="mt-4 grid gap-2 sm:grid-cols-4">
        {items.map((item, index) => (
          <li key={item} className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-[12px] font-black text-[#475569]">
            <span className={index === 0 ? "flex h-6 w-6 items-center justify-center rounded-full bg-[#22c55e] text-white" : "flex h-6 w-6 items-center justify-center rounded-full bg-[#fef3c7] text-[#92400e]"}>
              {index === 0 ? <Check size={13} aria-hidden="true" /> : index + 1}
            </span>
            {item}
          </li>
        ))}
      </ol>
    </section>
  );
}

function AttentionCard({
  title,
  description,
  tone = "warning",
  onClick,
}: {
  title: string;
  description: string;
  tone?: "warning" | "danger";
  onClick: () => void;
}) {
  const toneClass = tone === "danger" ? "border-[#fecaca] bg-[#fff7f7] text-[#b91c1c]" : "border-[#fed7aa] bg-[#fff7ed] text-[#c2410c]";
  return (
    <section className={`rounded-xl border p-4 shadow-sm ${toneClass}`}>
      <h2 className="text-[17px] font-black">{title}</h2>
      <p className="mt-1 text-[13px] font-semibold leading-5 text-[#475569]">{description}</p>
      <button type="button" onClick={onClick} className="mt-3 inline-flex h-9 items-center rounded-lg bg-white px-3 text-[12px] font-black text-[#334155] ring-1 ring-black/10">
        Update now
      </button>
    </section>
  );
}

function ApprovedPartnerTransition({ bundle, onBack }: { bundle: PartnerOrganizationBundle; onBack: () => void }) {
  return (
    <section className="rounded-xl border border-[#bbf7d0] bg-white p-5 shadow-sm">
      <div className="inline-flex items-center gap-2 rounded-full bg-[#dcfce7] px-3 py-1 text-[12px] font-black text-[#15803d]">
        <BadgeCheck size={15} aria-hidden="true" />
        Approved
      </div>
      <h1 className="mt-4 text-[26px] font-black leading-8 text-[#111827] sm:text-[32px]">
        {bundle.organization.brandName || bundle.organization.legalName}
      </h1>
      <p className="mt-2 max-w-2xl text-[14px] font-semibold leading-6 text-[#64748b]">
        This organization is approved. The verified Partner Business Desk opens in the next phase.
      </p>
      <button
        type="button"
        onClick={onBack}
        className="mt-5 inline-flex h-10 items-center justify-center rounded-lg border border-[#cfd8e3] bg-white px-4 text-[13px] font-black text-[#334155] hover:border-[#0b74ff] focus:outline-none focus:ring-2 focus:ring-[#93c5fd]"
      >
        Back to Application Center
      </button>
    </section>
  );
}

function StatusPill({ status, label }: { status: PartnerApplicationCenterReadModel["overallStatus"]; label: string }) {
  const className =
    status === "approved"
      ? "border-[#bbf7d0] bg-[#dcfce7] text-[#166534]"
      : status === "under-review"
        ? "border-[#fde68a] bg-[#fef3c7] text-[#92400e]"
        : status === "changes-required" || status === "rejected"
          ? "border-[#fecaca] bg-[#fee2e2] text-[#b91c1c]"
          : "border-white/20 bg-white text-[#0b74ff]";
  return <span className={`inline-flex min-h-8 items-center rounded-full border px-3 text-[11px] font-black uppercase tracking-[0.08em] ${className}`}>{label}</span>;
}

function StepStatusPill({ status }: { status: PartnerApplicationStepStatus }) {
  const label = stepStatusLabel(status);
  const className =
    status === "completed"
      ? "bg-[#dcfce7] text-[#15803d]"
      : status === "under-review"
        ? "bg-[#dbeafe] text-[#1d4ed8]"
        : status === "needs-attention"
          ? "bg-[#fee2e2] text-[#b91c1c]"
          : status === "locked"
            ? "bg-[#f1f5f9] text-[#64748b]"
            : "bg-[#fef3c7] text-[#92400e]";
  return <span className={`inline-flex shrink-0 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.06em] ${className}`}>{label}</span>;
}

function stepStatusLabel(status: PartnerApplicationStepStatus): string {
  if (status === "completed") return "Completed";
  if (status === "in-progress") return "In progress";
  if (status === "not-started") return "Not started";
  if (status === "needs-attention") return "Needs attention";
  if (status === "under-review") return "Under review";
  return "Locked";
}

function renderStepIcon(stepId: PartnerApplicationStepId) {
  if (stepId === "account_contact") return <Users size={18} aria-hidden="true" />;
  if (stepId === "business_identity" || stepId === "business_location") return <Building2 size={18} aria-hidden="true" />;
  if (stepId === "services") return <BriefcaseBusiness size={18} aria-hidden="true" />;
  if (stepId === "documents_compliance") return <FileCheck2 size={18} aria-hidden="true" />;
  return <ClipboardCheck size={18} aria-hidden="true" />;
}

function formatDate(value: string): string {
  try {
    return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
  } catch {
    return value;
  }
}

function parseQaPreviewState(value: string | undefined): PartnerQaPreviewState {
  return partnerQaPreviewStates.some((state) => state.id === value) ? (value as PartnerQaPreviewState) : "new";
}

function OrganizationContextBar({
  organizations,
  activeOrganizationId,
  onSwitch,
}: {
  organizations: PartnerOrganizationBundle[];
  activeOrganizationId: string | null;
  onSwitch: (organizationId: string) => void;
}) {
  if (organizations.length === 0) return null;
  return (
    <div className="rounded-lg border border-[#dbe3ef] bg-white p-4 shadow-sm">
      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_280px] md:items-center">
        <div className="min-w-0">
          <p className="text-[11px] font-black uppercase tracking-[0.08em] text-[#64748b]">Organization context</p>
          <p className="mt-1 truncate text-[15px] font-black text-[#111827]">
            {organizations.find((bundle) => bundle.organization.id === activeOrganizationId)?.organization.legalName ?? "Select organization"}
          </p>
        </div>
        <label className="block">
          <span className="sr-only">Switch Partner organization</span>
          <select
            value={activeOrganizationId ?? ""}
            onChange={(event) => onSwitch(event.target.value)}
            className="h-10 w-full rounded-lg border border-[#cfd8e3] bg-white px-3 text-[13px] font-bold text-[#111827] outline-none focus:border-[#4f46e5] focus:ring-2 focus:ring-[#c7d2fe]"
          >
            {organizations.map((bundle) => (
              <option key={bundle.organization.id} value={bundle.organization.id}>
                {bundle.organization.legalName}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}

function profileFromBackendBundle(bundle: PartnerOrganizationBundle): PartnerOrganizationPreviewProfile {
  const mobile = bundle.contacts.find((contact) => contact.channel === "mobile" && contact.isPrimary);
  const email = bundle.contacts.find((contact) => contact.channel === "email" && contact.isPrimary);
  return {
    ...emptyPartnerOrganizationPreviewProfile,
    businessName: bundle.organization.brandName ?? "",
    legalName: bundle.organization.legalName,
    organizationType: bundle.organization.organizationType as PartnerOrganizationPreviewProfile["organizationType"],
    businessMobile: bundle.organization.businessMobile ?? mobile?.value ?? "",
    businessEmail: bundle.organization.businessEmail ?? email?.value ?? "",
    businessMobileVerificationStatus: mobile?.verificationStatus === "verified" ? "verified" : "verification-required",
    businessMobileVerifiedValue: mobile?.verificationStatus === "verified" ? mobile.value : "",
    businessEmailVerificationStatus: email?.verificationStatus === "verified" ? "verified" : "unavailable",
    businessEmailVerifiedValue: email?.verificationStatus === "verified" ? email.value : "",
    addressLine1: bundle.organization.addressLine1 ?? "",
    addressLine2: bundle.organization.addressLine2 ?? "",
    city: bundle.organization.city ?? "",
    stateRegion: bundle.organization.stateRegion ?? "",
    postalCode: bundle.organization.postalCode ?? "",
    country: bundle.organization.country,
    savedForPreview: true,
  };
}

function resolvePartnerStep(bundle: PartnerOrganizationBundle): "application-center" | "approved-transition" {
  if (bundle.organization.status === "active" || bundle.review?.status === "VERIFIED") return "approved-transition";
  return "application-center";
}

function upsertBundle(bundles: PartnerOrganizationBundle[], next: PartnerOrganizationBundle): PartnerOrganizationBundle[] {
  const remaining = bundles.filter((bundle) => bundle.organization.id !== next.organization.id);
  return [next, ...remaining];
}

function getMobileChallengeMessage(challenge: PartnerMobileChallenge): string {
  const channel = challenge.deliveryChannel === "sms" ? "SMS" : "WhatsApp";
  if (challenge.deliveryConfirmed || challenge.deliveryStatus === "sent") return `${channel} OTP sent.`;
  if (challenge.deliveryStatus === "dry_run" || challenge.developmentOtp) {
    return "Staging test OTP created. Provider delivery was not used for this request.";
  }
  if (challenge.deliveryStatus === "not_connected") {
    return `${channel} delivery is not connected for this staging request.`;
  }
  return "OTP challenge created. Provider delivery is not confirmed.";
}

function OnboardingJourney() {
  return (
    <ol className="mt-6 grid gap-2 sm:grid-cols-5" aria-label="Partner onboarding journey">
      {onboardingSteps.map((step, index) => (
        <li key={step} className="flex items-center gap-2 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] px-3 py-2">
          <span
            className={
              index === 0
                ? "flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#4f46e5] text-[12px] font-black text-white"
                : "flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-[12px] font-black text-[#64748b]"
            }
          >
            {index + 1}
          </span>
          <span className={index === 0 ? "text-[12px] font-black text-[#111827]" : "text-[12px] font-bold text-[#64748b]"}>
            {step}
          </span>
        </li>
      ))}
    </ol>
  );
}

function ServiceCategoryCard({
  category,
  selectedServiceIds,
  onToggle,
}: {
  category: PartnerServiceCategory;
  selectedServiceIds: string[];
  onToggle: (serviceId: string) => void;
}) {
  const selectedCount = category.services.filter((serviceItem) => selectedServiceIds.includes(serviceItem.id)).length;

  return (
    <article className="rounded-lg border border-[#dbe3ef] bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-[17px] font-black text-[#111827]">{category.title}</h2>
          <p className="mt-1 text-[13px] font-semibold leading-5 text-[#64748b]">{category.description}</p>
        </div>
        <span className="inline-flex w-fit rounded-full bg-[#f1f5f9] px-3 py-1 text-[11px] font-black uppercase tracking-[0.06em] text-[#475569]">
          {selectedCount}/{category.services.length} selected
        </span>
      </div>

      <div className="mt-4 grid gap-2 md:grid-cols-2">
        {category.services.map((serviceItem) => {
          const selected = selectedServiceIds.includes(serviceItem.id);
          return (
            <label
              key={serviceItem.id}
              className={
                selected
                  ? "flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border border-[#818cf8] bg-[#eef2ff] px-3 py-2 text-[13px] font-black text-[#312e81] transition focus-within:ring-2 focus-within:ring-[#818cf8]"
                  : "flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border border-[#e2e8f0] bg-white px-3 py-2 text-[13px] font-bold text-[#334155] transition hover:border-[#a5b4fc] focus-within:ring-2 focus-within:ring-[#818cf8]"
              }
            >
              <input
                type="checkbox"
                checked={selected}
                onChange={() => onToggle(serviceItem.id)}
                className="h-4 w-4 rounded border-[#94a3b8] accent-[#4f46e5]"
              />
              <span>{serviceItem.label}</span>
            </label>
          );
        })}
      </div>
    </article>
  );
}

function SelectionSummary({
  selectedServices,
  onRemove,
  onClear,
  onContinue,
  continueEnabled,
}: {
  selectedServices: PartnerServiceDefinition[];
  onRemove: (serviceId: string) => void;
  onClear: () => void;
  onContinue: () => void;
  continueEnabled: boolean;
}) {
  return (
    <aside className="xl:sticky xl:top-4 xl:self-start">
      <div className="rounded-lg border border-[#dbe3ef] bg-white p-4 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-[17px] font-black text-[#111827]">Your Selection</h2>
            <p className="mt-1 text-[13px] font-bold text-[#4f46e5]">{selectedServicesLabel(selectedServices.length)}</p>
          </div>
          {selectedServices.length > 0 ? (
            <button
              type="button"
              onClick={onClear}
              className="rounded-md p-2 text-[#991b1b] transition hover:bg-[#fff7f7] focus:outline-none focus:ring-2 focus:ring-[#fca5a5]"
              aria-label="Clear all selected services"
            >
              <Trash2 size={16} aria-hidden="true" />
            </button>
          ) : null}
        </div>

        <div className="mt-4 grid max-h-[320px] gap-2 overflow-auto pr-1">
          {selectedServices.length > 0 ? (
            selectedServices.map((serviceItem) => (
              <div key={serviceItem.id} className="flex items-center justify-between gap-2 rounded-lg bg-[#f8fafc] px-3 py-2">
                <span className="text-[13px] font-bold text-[#334155]">{serviceItem.label}</span>
                <button
                  type="button"
                  onClick={() => onRemove(serviceItem.id)}
                  className="rounded-md p-1 text-[#64748b] transition hover:bg-white hover:text-[#991b1b] focus:outline-none focus:ring-2 focus:ring-[#818cf8]"
                  aria-label={`Remove ${serviceItem.label}`}
                >
                  <X size={15} aria-hidden="true" />
                </button>
              </div>
            ))
          ) : (
            <div className="rounded-lg border border-dashed border-[#cfd8e3] bg-[#fbfdff] p-4 text-[13px] font-semibold leading-5 text-[#64748b]">
              Choose one or more services to continue. Hotel, cab, activities, wedding, and production scopes can live under one Partner account.
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onContinue}
          disabled={!continueEnabled}
          className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#4f46e5] px-4 text-[14px] font-black text-white transition hover:bg-[#4338ca] disabled:cursor-not-allowed disabled:bg-[#cbd5e1] focus:outline-none focus:ring-2 focus:ring-[#818cf8]"
        >
          Continue
          <ChevronRight size={17} aria-hidden="true" />
        </button>
        <p className="mt-2 text-center text-[12px] font-bold text-[#64748b]">Next: Business Profile</p>

        <div className="mt-4 rounded-lg border border-[#dbeafe] bg-[#eff6ff] p-3">
          <h3 className="text-[13px] font-black text-[#1d4ed8]">Need help getting started?</h3>
          <p className="mt-1 text-[12px] font-semibold leading-5 text-[#475569]">
            Partner support contact will be available here.
          </p>
        </div>
      </div>
    </aside>
  );
}

function selectedOnlyCatalog(selectedServiceIds: string[], catalog: PartnerServiceCategory[]): PartnerServiceCategory[] {
  const selectedIds = new Set(selectedServiceIds);
  return catalog
    .map((category) => ({
      ...category,
      services: category.services.filter((serviceItem) => selectedIds.has(serviceItem.id)),
    }))
    .filter((category) => category.services.length > 0);
}

const allowedPrivateDocumentTypes = new Set(["application/pdf", "image/jpeg", "image/png", "image/webp"]);
const maxPrivateDocumentBytes = 15 * 1024 * 1024;

function validatePrivateDocumentFile(file: File): string | null {
  if (!allowedPrivateDocumentTypes.has(file.type)) return "Upload a PDF, JPG, PNG, or WebP document.";
  if (file.size <= 0 || file.size > maxPrivateDocumentBytes) return "Document must be larger than 0 bytes and no more than 15 MB.";
  return null;
}

async function sha256File(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hash = await crypto.subtle.digest("SHA-256", buffer);
  return Array.from(new Uint8Array(hash))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}
