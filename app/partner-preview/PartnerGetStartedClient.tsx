"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  BadgeCheck,
  BarChart3,
  BriefcaseBusiness,
  Building2,
  Check,
  ChevronRight,
  CircleDollarSign,
  ClipboardCheck,
  HelpCircle,
  LineChart,
  Link2,
  Menu,
  Megaphone,
  Search,
  Settings,
  Sparkles,
  Trash2,
  Users,
  X,
} from "lucide-react";
import {
  BusinessProfileSavedPanel,
  PartnerBusinessProfileStep,
} from "./PartnerBusinessProfileStep";
import {
  emptyPartnerOrganizationPreviewProfile,
  readPartnerOrganizationPreviewProfile,
  writePartnerOrganizationPreviewProfile,
  type PartnerOrganizationPreviewProfile,
} from "../lib/partner/partnerOrganizationPreviewProfile";
import {
  filterPartnerServiceCatalog,
  partnerServiceCatalog,
  type PartnerServiceCategory,
  type PartnerServiceDefinition,
} from "../lib/partner/partnerServiceCatalog";
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

const navItems = [
  { label: "Get Started", icon: Sparkles, active: true },
  { label: "Overview", icon: BarChart3 },
  { label: "My Organization", icon: Building2 },
  { label: "My Services", icon: BriefcaseBusiness },
  { label: "Bookings & Orders", icon: ClipboardCheck },
  { label: "Earnings & Payments", icon: CircleDollarSign },
  { label: "Verification Center", icon: BadgeCheck },
  { label: "Team & Roles", icon: Users },
  { label: "Marketing Tools", icon: Megaphone },
  { label: "Analytics", icon: LineChart },
  { label: "Integrations", icon: Link2 },
  { label: "Help & Support", icon: HelpCircle },
  { label: "Settings", icon: Settings },
];

const onboardingSteps = [
  "Choose Services",
  "Business Profile",
  "Verification",
  "Service Setup",
  "Go Live",
];

const valuePoints = [
  "One account, many services",
  "Reach TPL travellers",
  "Secure & trusted platform",
  "Grow your business",
  "Centralized bookings and payments",
];

export default function PartnerGetStartedClient() {
  const [currentStep, setCurrentStep] = useState<"choose-services" | "business-profile" | "verification-preview">("choose-services");
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSelectedOnly, setShowSelectedOnly] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [organizationProfile, setOrganizationProfile] = useState<PartnerOrganizationPreviewProfile>(emptyPartnerOrganizationPreviewProfile);
  const [draftSaved, setDraftSaved] = useState(false);
  const [storageReady, setStorageReady] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const previewState = readPartnerPreviewSelection(window.localStorage);
      setSelectedServiceIds(previewState.selectedServiceIds);
      setCurrentStep(previewState.completedStep);
      setOrganizationProfile(readPartnerOrganizationPreviewProfile(window.localStorage));
      setStorageReady(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!storageReady) return;
    writePartnerPreviewSelection(window.localStorage, {
      selectedServiceIds,
      completedStep: currentStep,
    });
  }, [currentStep, selectedServiceIds, storageReady]);

  useEffect(() => {
    if (!storageReady) return;
    writePartnerOrganizationPreviewProfile(window.localStorage, organizationProfile);
  }, [organizationProfile, storageReady]);

  const filteredCatalog = useMemo(() => filterPartnerServiceCatalog(searchQuery), [searchQuery]);
  const selectedServices = useMemo(() => selectedPartnerServices(selectedServiceIds), [selectedServiceIds]);
  const visibleCatalog = showSelectedOnly ? selectedOnlyCatalog(selectedServiceIds) : filteredCatalog;
  const continueEnabled = canContinuePartnerPreview(selectedServiceIds);

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

  function saveProfileDraft() {
    setOrganizationProfile((current) => ({ ...current, savedForPreview: true }));
    setDraftSaved(true);
  }

  function saveProfileAndContinue() {
    setOrganizationProfile((current) => ({ ...current, savedForPreview: true }));
    setDraftSaved(true);
    setCurrentStep("verification-preview");
  }

  return (
    <main className="min-h-screen bg-[#f7f8fc] text-[#111827]">
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
          {currentStep === "business-profile" ? (
            <PartnerBusinessProfileStep
              selectedServices={selectedServices}
              profile={organizationProfile}
              onProfileChange={(profile) => {
                setOrganizationProfile(profile);
                setDraftSaved(false);
              }}
              onBackToServices={() => setCurrentStep("choose-services")}
              onSaveDraft={saveProfileDraft}
              onSaveAndContinue={saveProfileAndContinue}
              draftSaved={draftSaved}
            />
          ) : currentStep === "verification-preview" ? (
            <BusinessProfileSavedPanel
              selectedServices={selectedServices}
              onBack={() => setCurrentStep("business-profile")}
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

function selectedOnlyCatalog(selectedServiceIds: string[]): PartnerServiceCategory[] {
  const selectedIds = new Set(selectedServiceIds);
  return partnerServiceCatalog
    .map((category) => ({
      ...category,
      services: category.services.filter((serviceItem) => selectedIds.has(serviceItem.id)),
    }))
    .filter((category) => category.services.length > 0);
}
