"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  Building2,
  Check,
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  FileCheck2,
  HelpCircle,
  Loader2,
  LogOut,
  MapPin,
  Plus,
  RotateCcw,
  Scale,
  Search,
  ShieldCheck,
  X,
  UserRound,
  WalletCards,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import {
  fetchPartnerApplicationDraft,
  fetchPartnerServiceCatalogue,
  requestPartnerEmailVerification,
  requestPartnerMobileVerification,
  savePartnerAccountContactDraft,
  savePartnerBusinessIdentityDraft,
  savePartnerBusinessLocationDraft,
  savePartnerServicesDraft,
  savePartnerVerificationComplianceDraft,
  createPartnerDocumentUploadSession,
  confirmPartnerDocument,
  linkPartnerDocumentToRequirement,
  verifyPartnerEmail,
  verifyPartnerMobile,
  type PartnerMobileChallenge,
  type PartnerRequirement,
  type PartnerOrganizationBundle,
  type PartnerRequirementClassification,
} from "../lib/partner/partnerApiClient";
import {
  filterEligiblePartnerServiceCatalog,
  buildPartnerServiceCatalogFromItems,
  findPartnerCatalogueItemIn,
  partnerServiceEligibleForApplication,
  type PartnerServiceCategory,
  type PartnerServiceCatalogueItem,
  type PartnerServiceCatalogueRuntimeDomain,
  type PartnerServiceDomainId,
} from "../lib/partner/partnerServiceCatalogRuntime";
import {
  buildPartnerApplicationCenterReadModel,
  type PartnerApplicationStepId,
  type PartnerApplicationStepStatus,
} from "../lib/partner/partnerApplicationCenter";
import {
  buildPartnerQaPreviewBundle,
  partnerQaPreviewStates,
  type PartnerQaPreviewState,
} from "../lib/partner/partnerQaPreviewFixtures";
import { activeCountries, findCountry, type CountryMasterEntry } from "../lib/partner/countryMaster";
import { emptyPartnerOrganizationPreviewProfile } from "../lib/partner/partnerOrganizationPreviewProfile";

type WorkspaceStepId = PartnerApplicationStepId;

type AccountContactForm = {
  organizationId?: string;
  contactPersonFullName: string;
  designation: string;
  roleOther: string;
  countryCode: string;
  businessMobile: string;
  businessEmail: string;
  useAccountContactDetails: boolean;
  authorizedRepresentative: boolean;
};

type BusinessIdentityForm = {
  organizationId?: string;
  legalName: string;
  brandName: string;
  organizationType: string;
  organizationTypeOther: string;
  description: string;
  yearEstablished: string;
  registrationType: string;
  registrationNumber: string;
  registrationDate: string;
  registrationVerificationStatus: string;
};

type LocationAddressForm = {
  country: string;
  countryCode: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  stateRegion: string;
  postalCode: string;
  landmark: string;
  latitude: string;
  longitude: string;
  verificationStatus: string;
};

type ServiceAreaForm = {
  id: string;
  coverageLevel: string;
  country: string;
  countryCode: string;
  stateRegion: string;
  cityDestination: string;
  localArea: string;
};

type BusinessLocationForm = {
  organizationId?: string;
  primaryLocation: LocationAddressForm;
  sameAsOperating: boolean;
  operatingLocation: LocationAddressForm;
  serviceAreas: ServiceAreaForm[];
};

type RequestedServiceForm = {
  id: string;
  requestedName: string;
  description: string;
  closestDomain: PartnerServiceDomainId | "";
};

type ServicesForm = {
  organizationId?: string;
  selectedServiceCodes: string[];
  requestedServices: RequestedServiceForm[];
  requestPanelOpen: boolean;
};

type ServicesFormUpdate = Partial<ServicesForm> | ((current: ServicesForm) => Partial<ServicesForm>);

type RuntimeCatalogueState = {
  status: "loading" | "ready" | "error";
  version: number | null;
  updatedAt: string | null;
  domains: PartnerServiceCatalogueRuntimeDomain[];
  items: PartnerServiceCatalogueItem[];
};

const workspaceSteps: Array<{
  id: WorkspaceStepId;
  number: number;
  title: string;
  shortTitle: string;
  icon: typeof UserRound;
}> = [
  { id: "account_contact", number: 1, title: "Account & Contact", shortTitle: "Account", icon: UserRound },
  { id: "business_identity", number: 2, title: "Business Identity", shortTitle: "Identity", icon: Building2 },
  { id: "business_location", number: 3, title: "Business Location", shortTitle: "Location", icon: MapPin },
  { id: "services", number: 4, title: "Services", shortTitle: "Services", icon: BriefcaseBusiness },
  { id: "documents_compliance", number: 5, title: "Verification & Compliance", shortTitle: "Verify", icon: FileCheck2 },
  { id: "payout_tax", number: 6, title: "Payout & Tax", shortTitle: "Payout", icon: WalletCards },
  { id: "partner_agreement", number: 7, title: "Partner Agreement", shortTitle: "Agreement", icon: Scale },
  { id: "review_submit", number: 8, title: "Review & Submit", shortTitle: "Review", icon: ClipboardCheck },
];

const roleOptions = ["Owner", "Director", "Manager", "Authorized Representative", "Other"];
const verificationUploadMimeTypes = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
const verificationUploadMaxBytes = 25 * 1024 * 1024;
const verificationUploadAllowedMimeLabel = "PDF, JPG, PNG, or WebP (max 25 MB)";
const organizationTypeOptions = [
  "Individual / Independent Professional",
  "Sole Proprietorship",
  "Partnership Firm",
  "LLP",
  "One Person Company (OPC)",
  "Private Limited Company",
  "Public Limited Company",
  "Trust",
  "Society / NGO",
  "Government / Public Body",
  "Other",
];
const organizationTypeToBackend: Record<string, string> = {
  "Individual / Independent Professional": "Individual Professional",
  "Sole Proprietorship": "Individual / Proprietor",
  "Partnership Firm": "Partnership",
  LLP: "LLP",
  "One Person Company (OPC)": "One Person Company",
  "Private Limited Company": "Private Limited",
  "Public Limited Company": "Public Limited",
  Trust: "Trust",
  "Society / NGO": "Society / NGO",
  "Government / Public Body": "Government / Public Body",
  Other: "Other",
};
const entityTypesWithRegistration = new Set([
  "Partnership Firm",
  "LLP",
  "One Person Company (OPC)",
  "Private Limited Company",
  "Public Limited Company",
  "Trust",
  "Society / NGO",
  "Government / Public Body",
  "Other",
]);
const verificationStatusOptions = ["Not verified", "Checking", "Verified", "Needs review", "Manual review required"];
const locationVerificationStatusOptions = ["Not verified", "Verified", "Needs review"];
const countryOptions = activeCountries();
const coverageLevelOptions = ["Country-wide", "State/Region-wide", "City/Destination", "Local radius / local area", "International / multi-country"];
const qaAccountContactExamples: Array<{ key: string; label: string; values: Partial<AccountContactForm>; verified: { mobile: boolean; email: boolean } }> = [
  {
    key: "individual",
    label: "Individual Professional",
    verified: { mobile: true, email: true },
    values: {
      contactPersonFullName: "Aarav Mehta",
      designation: "Owner",
      countryCode: "+91",
      businessMobile: "9812345601",
      businessEmail: "aarav.guide@example.invalid",
      useAccountContactDetails: false,
      authorizedRepresentative: true,
    },
  },
  {
    key: "small-business",
    label: "Small Business Owner",
    verified: { mobile: true, email: true },
    values: {
      contactPersonFullName: "Neha Sharma",
      designation: "Owner",
      countryCode: "+91",
      businessMobile: "9822233344",
      businessEmail: "owner.mountainview@example.invalid",
      useAccountContactDetails: false,
      authorizedRepresentative: true,
    },
  },
  {
    key: "company-rep",
    label: "Company Representative",
    verified: { mobile: true, email: true },
    values: {
      contactPersonFullName: "Rohan Kapoor",
      designation: "Authorized Representative",
      countryCode: "+91",
      businessMobile: "9876501234",
      businessEmail: "partners.hospitality@example.invalid",
      useAccountContactDetails: false,
      authorizedRepresentative: true,
    },
  },
  {
    key: "international",
    label: "International Partner",
    verified: { mobile: true, email: true },
    values: {
      contactPersonFullName: "Maya Fernandes",
      designation: "Manager",
      countryCode: "+971",
      businessMobile: "501234567",
      businessEmail: "maya.dubai@example.invalid",
      useAccountContactDetails: false,
      authorizedRepresentative: true,
    },
  },
];
const qaBusinessIdentityExamples: Array<{ key: string; label: string; values: Partial<BusinessIdentityForm> }> = [
  {
    key: "individual",
    label: "Individual",
    values: {
      legalName: "Aarav Mehta",
      brandName: "Aarav City Walks",
      organizationType: "Individual / Independent Professional",
      organizationTypeOther: "",
      description: "Independent local guide offering curated city walks, food trails and cultural activities for TPL GO travellers.",
      yearEstablished: "2021",
      registrationType: "",
      registrationNumber: "",
      registrationDate: "",
      registrationVerificationStatus: "Not verified",
    },
  },
  {
    key: "opc",
    label: "OPC",
    values: {
      legalName: "Himalayan Trails OPC Private Limited",
      brandName: "Himalayan Trails",
      organizationType: "One Person Company (OPC)",
      organizationTypeOther: "",
      description: "Registered travel services company managing guided tours, activity bookings and local guest assistance.",
      yearEstablished: "2020",
      registrationType: "CIN",
      registrationNumber: "U63040HP2020OPC000001",
      registrationDate: "2020-06-15",
      registrationVerificationStatus: "Checking",
    },
  },
  {
    key: "private",
    label: "Private Limited",
    values: {
      legalName: "Sharma Hospitality Private Limited",
      brandName: "Mountain View Resort",
      organizationType: "Private Limited Company",
      organizationTypeOther: "",
      description: "Hospitality business operating a boutique resort and connected local experiences for leisure travellers.",
      yearEstablished: "2018",
      registrationType: "CIN",
      registrationNumber: "U55101HP2018PTC000002",
      registrationDate: "2018-03-21",
      registrationVerificationStatus: "Verified",
    },
  },
  {
    key: "llp",
    label: "LLP",
    values: {
      legalName: "Valley Mobility Services LLP",
      brandName: "Valley Cabs",
      organizationType: "LLP",
      organizationTypeOther: "",
      description: "Local transport operator coordinating verified cab services, airport transfers and day trips.",
      yearEstablished: "2019",
      registrationType: "LLPIN",
      registrationNumber: "AAB-1234",
      registrationDate: "2019-09-02",
      registrationVerificationStatus: "Needs review",
    },
  },
  {
    key: "ngo",
    label: "NGO",
    values: {
      legalName: "Hillside Eco Tourism Society",
      brandName: "Hillside Eco Trails",
      organizationType: "Society / NGO",
      organizationTypeOther: "",
      description: "Community tourism society offering responsible nature walks, local craft visits and cultural experiences.",
      yearEstablished: "2016",
      registrationType: "Society registration number",
      registrationNumber: "SOC-HP-2016-0042",
      registrationDate: "2016-11-10",
      registrationVerificationStatus: "Manual review required",
    },
  },
  {
    key: "other",
    label: "Other",
    values: {
      legalName: "North Ridge Adventure Collective",
      brandName: "North Ridge Adventures",
      organizationType: "Other",
      organizationTypeOther: "Community adventure collective",
      description: "Local collective coordinating guided hikes, camping experiences and outdoor activities with trained facilitators.",
      yearEstablished: "2022",
      registrationType: "Other registration type",
      registrationNumber: "LOCAL-REF-2022-17",
      registrationDate: "",
      registrationVerificationStatus: "Not verified",
    },
  },
];
const qaBusinessLocationExamples: Array<{ key: string; label: string; values: BusinessLocationForm }> = [
  {
    key: "guide",
    label: "Individual Guide",
    values: makeLocationForm({
      primary: indiaAddress("Amber Road, Near Jal Mahal", "", "Jaipur", "Rajasthan", "302002", "Near local guide pickup point"),
      sameAsOperating: true,
      areas: [
        serviceArea("City/Destination", "India", "IN", "Rajasthan", "Jaipur"),
        serviceArea("City/Destination", "India", "IN", "Rajasthan", "Amer"),
        serviceArea("State/Region-wide", "India", "IN", "Rajasthan", "Rajasthan"),
      ],
    }),
  },
  {
    key: "hotel",
    label: "Hotel",
    values: makeLocationForm({
      primary: indiaAddress("Lake Palace Road", "Near City Palace", "Udaipur", "Rajasthan", "313001", "Lake-facing property"),
      sameAsOperating: false,
      operating: indiaAddress("Mountain View Resort, Fateh Sagar Road", "", "Udaipur", "Rajasthan", "313001", "Hotel property"),
      areas: [serviceArea("City/Destination", "India", "IN", "Rajasthan", "Udaipur")],
    }),
  },
  {
    key: "cab",
    label: "Cab Operator",
    values: makeLocationForm({
      primary: indiaAddress("MI Road Transport Office", "", "Jaipur", "Rajasthan", "302001", "Main dispatch office"),
      sameAsOperating: true,
      areas: [
        serviceArea("City/Destination", "India", "IN", "Rajasthan", "Jaipur"),
        serviceArea("State/Region-wide", "India", "IN", "Rajasthan", "Rajasthan"),
        serviceArea("Local radius / local area", "India", "IN", "Rajasthan", "Intercity routes"),
      ],
    }),
  },
  {
    key: "medical",
    label: "Medical Facility",
    values: makeLocationForm({
      primary: indiaAddress("Sector 16 Medical Center", "", "New Delhi", "Delhi", "110001", "Hospital reception"),
      sameAsOperating: false,
      operating: indiaAddress("International Patient Wing, Sector 16", "", "New Delhi", "Delhi", "110001", "Hospital campus"),
      areas: [
        serviceArea("City/Destination", "India", "IN", "Delhi", "Delhi NCR"),
        serviceArea("International / multi-country", "India", "IN", "Delhi", "International Patients"),
      ],
    }),
  },
  {
    key: "wedding",
    label: "Wedding Planner",
    values: makeLocationForm({
      primary: indiaAddress("Bandra West Studio Office", "", "Mumbai", "Maharashtra", "400050", "Client meeting office"),
      sameAsOperating: true,
      areas: [
        serviceArea("City/Destination", "India", "IN", "Goa", "Goa"),
        serviceArea("City/Destination", "India", "IN", "Rajasthan", "Udaipur"),
        serviceArea("City/Destination", "India", "IN", "Rajasthan", "Jaipur"),
        serviceArea("International / multi-country", "United Arab Emirates", "AE", "Dubai", "Dubai"),
      ],
    }),
  },
  {
    key: "international",
    label: "International Partner",
    values: makeLocationForm({
      primary: address("United Arab Emirates", "AE", "Business Bay Office", "", "Dubai", "Dubai", "00000", "Tower reception"),
      sameAsOperating: true,
      areas: [
        serviceArea("Country-wide", "United Arab Emirates", "AE", "", "UAE"),
        serviceArea("City/Destination", "United Arab Emirates", "AE", "Dubai", "Dubai"),
      ],
    }),
  },
];
const qaServicesExamples: Array<{ key: string; label: string; values: ServicesForm }> = [
  serviceExample("hotel-cab", "Hotel + Cab", ["hotel", "cab-taxi-operator"]),
  serviceExample("yatra-company", "Yatra Company", ["yatra-operator-organizer", "spiritual-pilgrimage-packages", "group-tours", "yatra-logistics-coordination", "spiritual-guide-facilitator"]),
  serviceExample("medical-facility", "Medical Facility", ["hospital", "diagnostic-centre", "ambulance-service"]),
  serviceExample("doctor", "Doctor", ["doctor-medical-professional", "specialist-doctor"]),
  serviceExample("wedding-planner", "Wedding Planner", ["wedding-planner", "photographer", "decorator", "wedding-transport"]),
  serviceExample("photographer", "Photographer", ["professional-photographer", "photographer"]),
  serviceExample("film-ott", "Film / OTT Production Support", ["production-support", "permissions-facilitation", "transport-logistics", "equipment-rental", "local-crew"]),
  serviceExample("marketplace-food", "Marketplace / Local Food Seller", ["local-food-seller"]),
  serviceExample("adventure-individual", "Adventure Individual", ["paragliding", "adventure-instructor"]),
  serviceExample("international-multi-service", "International Multi-service Partner", ["destination-management-company", "customized-packages", "airport-transfer"]),
];
const qaDraftStorageKey = "tpl.partnerApplication.previewDraft.v1";

export default function PartnerApplicationWorkspaceClient({
  qaPreviewEnabled = false,
  initialQaPreviewState,
  initialQaStep,
}: {
  qaPreviewEnabled?: boolean;
  initialQaPreviewState?: string;
  initialQaStep?: string;
}) {
  const router = useRouter();
  const { isAuthenticated, user, openLoginModal } = useAuth();
  const initialQaState = parseQaPreviewState(initialQaPreviewState);
  const [qaPreviewState, setQaPreviewState] = useState<PartnerQaPreviewState>(initialQaState);
  const [bundle, setBundle] = useState<PartnerOrganizationBundle | null>(null);
  const [activeStep, setActiveStep] = useState<WorkspaceStepId>("account_contact");
  const [form, setForm] = useState<AccountContactForm>(() => emptyForm());
  const [businessForm, setBusinessForm] = useState<BusinessIdentityForm>(() => emptyBusinessForm());
  const [locationForm, setLocationForm] = useState<BusinessLocationForm>(() => emptyLocationForm());
  const [servicesForm, setServicesForm] = useState<ServicesForm>(() => emptyServicesForm());
  const [activeServiceDomainIds, setActiveServiceDomainIds] = useState<PartnerServiceDomainId[]>([]);
  const formRef = useRef(form);
  const businessFormRef = useRef(businessForm);
  const locationFormRef = useRef(locationForm);
  const servicesFormRef = useRef(servicesForm);
  const [loadStatus, setLoadStatus] = useState<"idle" | "loading" | "ready" | "error">(qaPreviewEnabled ? "ready" : "idle");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">(qaPreviewEnabled ? "saved" : "idle");
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(qaPreviewEnabled ? new Date().toISOString() : null);
  const [message, setMessage] = useState<{ tone: "success" | "info" | "warning" | "error"; text: string } | null>(null);
  const [mobileChallenge, setMobileChallenge] = useState<PartnerMobileChallenge | null>(null);
  const [mobileOtp, setMobileOtp] = useState("");
  const [emailChallenge, setEmailChallenge] = useState<{ challengeId: string; expiresAt: string } | null>(null);
  const [emailOtp, setEmailOtp] = useState("");
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [uploadingRequirementId, setUploadingRequirementId] = useState<string | null>(null);
  const [focusedVerificationSectionId, setFocusedVerificationSectionId] = useState<string | null>(null);
  const [qaVerifiedContacts, setQaVerifiedContacts] = useState({ mobile: false, email: false });
  const [serviceCatalogueState, setServiceCatalogueState] = useState<RuntimeCatalogueState>({
    status: "loading",
    version: null,
    updatedAt: null,
    domains: [],
    items: [],
  });

  const previewBundle = useMemo(() => qaPreviewEnabled ? buildPartnerQaPreviewBundle(qaPreviewState) : null, [qaPreviewEnabled, qaPreviewState]);
  const activeBundle = qaPreviewEnabled ? previewBundle : bundle;
  const runtimeServiceCatalog = useMemo(
    () => buildPartnerServiceCatalogFromItems(serviceCatalogueState.domains, serviceCatalogueState.items),
    [serviceCatalogueState.domains, serviceCatalogueState.items]
  );
  const selectedServices = useMemo(() => servicesForm.selectedServiceCodes.map((code) => {
    const item = findPartnerCatalogueItemIn(serviceCatalogueState.items, code);
    return { id: code, label: item?.name ?? code, keywords: item ? [item.shortDescription, ...item.aliases] : [] };
  }), [serviceCatalogueState.items, servicesForm.selectedServiceCodes]);
  const readModel = useMemo(
    () => buildPartnerApplicationCenterReadModel({ bundle: activeBundle, profile: minimalProfile(form), selectedServices, catalogueItems: serviceCatalogueState.items }),
    [activeBundle, form, selectedServices, serviceCatalogueState.items]
  );
  const isSubmittedState = readModel.overallStatus === "under-review" || readModel.overallStatus === "changes-required" || readModel.overallStatus === "rejected";
  const isApprovedState = readModel.overallStatus === "approved";
  const mobileVerified = qaPreviewEnabled ? qaVerifiedContacts.mobile || contactVerified(activeBundle, "mobile", normalizedMobile(form.businessMobile, form.countryCode)) : contactVerified(activeBundle, "mobile", normalizedMobile(form.businessMobile, form.countryCode));
  const emailVerified = qaPreviewEnabled ? qaVerifiedContacts.email || contactVerified(activeBundle, "email", normalizeEmail(form.businessEmail)) : contactVerified(activeBundle, "email", normalizeEmail(form.businessEmail));
  const canCompleteStepOne =
    form.contactPersonFullName.trim().length >= 2 &&
    form.designation.trim().length >= 2 &&
    (form.designation !== "Other" || form.roleOther.trim().length >= 2) &&
    mobileVerified &&
    emailVerified &&
    form.authorizedRepresentative;
  const showsRegistrationSection = entityTypesWithRegistration.has(businessForm.organizationType);
  const canCompleteStepTwo =
    businessForm.legalName.trim().length >= 2 &&
    businessForm.organizationType.trim().length > 0 &&
    (businessForm.organizationType !== "Other" || businessForm.organizationTypeOther.trim().length >= 2) &&
    businessForm.description.trim().length >= 20 &&
    businessForm.description.length <= 500;
  const canCompleteStepThree = isBusinessLocationComplete(locationForm);
  const canCompleteStepFour = serviceCatalogueState.status === "ready" && isServicesComplete(servicesForm, locationForm.primaryLocation.countryCode, businessForm.organizationType, serviceCatalogueState.items);

  useEffect(() => {
    formRef.current = form;
  }, [form]);

  useEffect(() => {
    businessFormRef.current = businessForm;
  }, [businessForm]);

  useEffect(() => {
    locationFormRef.current = locationForm;
  }, [locationForm]);

  useEffect(() => {
    servicesFormRef.current = servicesForm;
  }, [servicesForm]);

  useEffect(() => {
    let cancelled = false;
    setServiceCatalogueState((current) => ({ ...current, status: "loading" }));
    fetchPartnerServiceCatalogue().then((result) => {
      if (cancelled) return;
      if (result.ok) {
        setServiceCatalogueState({
          status: "ready",
          version: result.data.version,
          updatedAt: result.data.updatedAt,
          domains: result.data.domains,
          items: result.data.items,
        });
      } else {
        setServiceCatalogueState({ status: "error", version: null, updatedAt: null, domains: [], items: [] });
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (serviceCatalogueState.status !== "ready") return;
    setActiveServiceDomainIds((current) => {
      const fromSavedCodes = serviceDomainIdsFromCodes(servicesFormRef.current.selectedServiceCodes, serviceCatalogueState.items);
      return [...new Set([...current, ...fromSavedCodes])];
    });
  }, [serviceCatalogueState.items, serviceCatalogueState.status]);

  useEffect(() => {
    if (qaPreviewEnabled) {
      const qaBundle = buildPartnerQaPreviewBundle(qaPreviewState);
      const savedPreview = readQaDraft();
      const savedForState = savedPreview?.state === qaPreviewState ? savedPreview : null;
      const nextForm = savedForState?.form ?? formFromBundle(qaBundle, user);
      const nextBusinessForm = savedForState?.businessForm ?? businessFormFromBundle(qaBundle);
      const nextLocationForm = savedForState?.locationForm ?? locationFormFromBundle(qaBundle);
      const nextServicesForm = savedForState?.servicesForm ?? servicesFormFromBundle(qaBundle);
      setForm(nextForm);
      setBusinessForm(nextBusinessForm);
      setLocationForm(nextLocationForm);
      setServicesForm(nextServicesForm);
      setActiveServiceDomainIds(serviceDomainIdsFromCodes(nextServicesForm.selectedServiceCodes, serviceCatalogueState.items));
      setQaVerifiedContacts(savedForState?.verified ?? {
        mobile: contactVerified(qaBundle, "mobile", normalizedMobile(nextForm.businessMobile, nextForm.countryCode)),
        email: contactVerified(qaBundle, "email", normalizeEmail(nextForm.businessEmail)),
      });
      setLastSavedAt(savedForState?.savedAt ?? null);
      setSaveStatus(savedForState ? "saved" : "idle");
      setActiveStep(isWorkspaceStep(initialQaStep) ? initialQaStep : savedForState?.activeStep && isWorkspaceStep(savedForState.activeStep) ? savedForState.activeStep : qaPreviewState === "approved" ? "review_submit" : "account_contact");
      return;
    }
    if (!isAuthenticated) {
      setLoadStatus("ready");
      return;
    }
    let cancelled = false;
    setLoadStatus("loading");
    fetchPartnerApplicationDraft().then((result) => {
      if (cancelled) return;
      if (result.ok) {
        setBundle(result.data);
        setForm(formFromBundle(result.data, user));
        setBusinessForm(businessFormFromBundle(result.data));
        setLocationForm(locationFormFromBundle(result.data));
        const nextServicesForm = servicesFormFromBundle(result.data);
        setServicesForm(nextServicesForm);
        setActiveServiceDomainIds(serviceDomainIdsFromCodes(nextServicesForm.selectedServiceCodes, serviceCatalogueState.items));
        setLastSavedAt(readLastSaved(result.data));
        setActiveStep(resolveActiveStep(result.data));
        setLoadStatus("ready");
      } else {
        setMessage({ tone: "error", text: "Could not load your Partner application." });
        setLoadStatus("error");
      }
    });
    return () => {
      cancelled = true;
    };
  }, [initialQaStep, isAuthenticated, qaPreviewEnabled, qaPreviewState, serviceCatalogueState.items, user]);

  useEffect(() => {
    if (qaPreviewEnabled || !isAuthenticated || loadStatus !== "ready") return;
    const timer = window.setTimeout(() => {
      if (form.organizationId || hasMeaningfulStepOneInput(form)) void saveDraft({ silent: true });
    }, 1400);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.contactPersonFullName, form.designation, form.roleOther, form.businessMobile, form.businessEmail, form.authorizedRepresentative]);

  useEffect(() => {
    if (qaPreviewEnabled || !isAuthenticated || loadStatus !== "ready" || activeStep !== "business_identity") return;
    const timer = window.setTimeout(() => {
      if (businessForm.organizationId || hasMeaningfulStepTwoInput(businessForm)) void saveDraft({ silent: true });
    }, 1400);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStep, businessForm.legalName, businessForm.brandName, businessForm.organizationType, businessForm.organizationTypeOther, businessForm.description, businessForm.yearEstablished, businessForm.registrationType, businessForm.registrationNumber, businessForm.registrationDate]);

  useEffect(() => {
    if (qaPreviewEnabled || !isAuthenticated || loadStatus !== "ready" || activeStep !== "business_location") return;
    const timer = window.setTimeout(() => {
      if (locationForm.organizationId || hasMeaningfulStepThreeInput(locationForm)) void saveDraft({ silent: true });
    }, 1400);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStep, locationForm.primaryLocation, locationForm.sameAsOperating, locationForm.operatingLocation, locationForm.serviceAreas]);

  useEffect(() => {
    if (qaPreviewEnabled || !isAuthenticated || loadStatus !== "ready" || activeStep !== "services") return;
    const timer = window.setTimeout(() => {
      if (servicesForm.organizationId || hasMeaningfulStepFourInput(servicesForm)) void saveDraft({ silent: true });
    }, 1400);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStep, servicesForm.selectedServiceCodes, servicesForm.requestedServices]);

  function updateForm(next: Partial<AccountContactForm>) {
    setForm((current) => {
      const mobileChanged = next.businessMobile !== undefined && next.businessMobile !== current.businessMobile || next.countryCode !== undefined && next.countryCode !== current.countryCode;
      const emailChanged = next.businessEmail !== undefined && normalizeEmail(next.businessEmail) !== normalizeEmail(current.businessEmail);
      if (qaPreviewEnabled && mobileChanged) setQaVerifiedContacts((value) => ({ ...value, mobile: false }));
      if (qaPreviewEnabled && emailChanged) setQaVerifiedContacts((value) => ({ ...value, email: false }));
      const resolved = { ...current, ...next };
      formRef.current = resolved;
      return resolved;
    });
    setSaveStatus("idle");
  }

  function updateBusinessForm(next: Partial<BusinessIdentityForm>) {
    setBusinessForm((current) => {
      const resolved = { ...current, ...next };
      businessFormRef.current = resolved;
      return resolved;
    });
    setSaveStatus("idle");
  }

  function updateLocationForm(next: Partial<BusinessLocationForm>) {
    setLocationForm((current) => {
      const resolved = { ...current, ...next };
      locationFormRef.current = resolved;
      return resolved;
    });
    setSaveStatus("idle");
  }

  function updateServicesForm(next: ServicesFormUpdate) {
    setServicesForm((current) => {
      const resolved = { ...current, ...(typeof next === "function" ? next(current) : next) };
      servicesFormRef.current = resolved;
      return resolved;
    });
    setSaveStatus("idle");
  }

  function removeSelectedService(service: PartnerServiceCatalogueItem) {
    updateServicesForm((current) => {
      const remainingCodes = current.selectedServiceCodes.filter((code) => code !== service.stableCode);
      const domainStillSelected = remainingCodes.some((code) => findPartnerCatalogueItemIn(serviceCatalogueState.items, code)?.domain === service.domain);
      if (!domainStillSelected) {
        setActiveServiceDomainIds((domains) => domains.filter((domainId) => domainId !== service.domain));
      }
      return { selectedServiceCodes: remainingCodes };
    });
  }

  function removeSelectedServiceDomain(domainId: PartnerServiceDomainId) {
    updateServicesForm((current) => ({
      selectedServiceCodes: current.selectedServiceCodes.filter((code) => findPartnerCatalogueItemIn(serviceCatalogueState.items, code)?.domain !== domainId),
    }));
    setActiveServiceDomainIds((current) => current.filter((id) => id !== domainId));
  }

  function openSelectedServiceDomain(domainId: PartnerServiceDomainId) {
    setActiveServiceDomainIds((current) => current.includes(domainId) ? current : [...current, domainId]);
  }

  function changeQaPreviewState(state: PartnerQaPreviewState) {
    setQaPreviewState(state);
    router.replace(`/partner-preview?qa=1&state=${state}`, { scroll: false });
  }

  function currentQaDraftPayload(step: WorkspaceStepId, savedAt: string) {
    return {
      form: formRef.current,
      businessForm: businessFormRef.current,
      locationForm: locationFormRef.current,
      servicesForm: servicesFormRef.current,
      verified: qaVerifiedContacts,
      activeStep: step,
      state: qaPreviewState,
      savedAt,
    };
  }

  async function ensureDraft(): Promise<PartnerOrganizationBundle | null> {
    if (qaPreviewEnabled) return null;
    if (!isAuthenticated) {
      openLoginModal({ accountType: "partner", intent: "partner", redirectAfterLogin: "/partner-preview" });
      return null;
    }
    return saveDraft({ silent: true });
  }

  async function saveDraft(options: { silent?: boolean; continueAfter?: boolean } = {}) {
    if (qaPreviewEnabled) {
      const savedAt = new Date().toISOString();
      setSaveStatus("saved");
      setLastSavedAt(savedAt);
      writeQaDraft(currentQaDraftPayload(activeStep, savedAt));
      if (!options.silent) setMessage({ tone: "success", text: "Preview draft saved." });
      return previewBundle;
    }
    if (activeStep === "business_identity") return saveBusinessIdentityDraft(options);
    if (activeStep === "business_location") return saveBusinessLocationDraft(options);
    if (activeStep === "services") return saveServicesDraft(options);
    if (activeStep === "documents_compliance") return saveVerificationDraft(options);
    setSaveStatus("saving");
    if (!options.silent) setMessage({ tone: "info", text: "Saving your draft." });
    const payload = {
      organizationId: form.organizationId,
      contactPersonFullName: form.contactPersonFullName,
      designation: form.designation,
      roleOther: form.roleOther,
      businessMobile: normalizedMobile(form.businessMobile, form.countryCode),
      businessEmail: normalizeEmail(form.businessEmail),
      authorizedRepresentative: form.authorizedRepresentative,
    };
    const result = await savePartnerAccountContactDraft(payload);
    if (!result.ok) {
      setSaveStatus("error");
      if (!options.silent) setMessage({ tone: "error", text: "Could not save your changes." });
      return null;
    }
    setBundle(result.data);
    setForm((current) => ({ ...current, organizationId: result.data.organization.id }));
    const savedAt = readLastSaved(result.data) ?? new Date().toISOString();
    setLastSavedAt(savedAt);
    setSaveStatus("saved");
    if (!options.silent) setMessage({ tone: "success", text: options.continueAfter ? "Draft saved. Continue with Business Identity next." : "Draft saved." });
    return result.data;
  }

  async function saveBusinessIdentityDraft(options: { silent?: boolean; continueAfter?: boolean } = {}) {
    setSaveStatus("saving");
    if (!options.silent) setMessage({ tone: "info", text: "Saving your draft." });
    const payload = {
      organizationId: businessForm.organizationId || form.organizationId,
      legalName: businessForm.legalName,
      brandName: businessForm.brandName,
      organizationType: organizationTypeToBackend[businessForm.organizationType] ?? businessForm.organizationType,
      organizationTypeOther: businessForm.organizationTypeOther,
      description: businessForm.description,
      yearEstablished: businessForm.yearEstablished,
      registrationType: businessForm.registrationType,
      registrationNumber: businessForm.registrationNumber,
      registrationDate: businessForm.registrationDate,
      registrationVerification: {
        status: businessForm.registrationVerificationStatus || "Not verified",
        source: "manual_review_ready",
      },
      requirementClassifications: businessIdentityRequirementClassifications(businessForm.organizationType),
    };
    const result = await savePartnerBusinessIdentityDraft(payload);
    if (!result.ok) {
      setSaveStatus("error");
      if (!options.silent) setMessage({ tone: "error", text: "Could not save your changes." });
      return null;
    }
    setBundle(result.data);
    setForm((current) => ({ ...current, organizationId: result.data.organization.id }));
    setBusinessForm((current) => ({ ...current, organizationId: result.data.organization.id }));
    const savedAt = readLastSaved(result.data) ?? new Date().toISOString();
    setLastSavedAt(savedAt);
    setSaveStatus("saved");
    if (!options.silent) setMessage({ tone: "success", text: options.continueAfter ? "Draft saved. Continue with Business Location next." : "Draft saved." });
    return result.data;
  }

  async function saveBusinessLocationDraft(options: { silent?: boolean; continueAfter?: boolean } = {}) {
    setSaveStatus("saving");
    if (!options.silent) setMessage({ tone: "info", text: "Saving your draft." });
    const result = await savePartnerBusinessLocationDraft({
      organizationId: locationForm.organizationId || businessForm.organizationId || form.organizationId,
      primaryLocation: locationForm.primaryLocation,
      sameAsOperating: locationForm.sameAsOperating,
      operatingLocation: locationForm.sameAsOperating ? locationForm.primaryLocation : locationForm.operatingLocation,
      serviceAreas: locationForm.serviceAreas,
    });
    if (!result.ok) {
      setSaveStatus("error");
      if (!options.silent) setMessage({ tone: "error", text: "Could not save your changes." });
      return null;
    }
    setBundle(result.data);
    setForm((current) => ({ ...current, organizationId: result.data.organization.id }));
    setBusinessForm((current) => ({ ...current, organizationId: result.data.organization.id }));
    setLocationForm((current) => ({ ...current, organizationId: result.data.organization.id }));
    const savedAt = readLastSaved(result.data) ?? new Date().toISOString();
    setLastSavedAt(savedAt);
    setSaveStatus("saved");
    if (!options.silent) setMessage({ tone: "success", text: options.continueAfter ? "Draft saved. Continue with Services next." : "Draft saved." });
    return result.data;
  }

  async function saveServicesDraft(options: { silent?: boolean; continueAfter?: boolean } = {}) {
    setSaveStatus("saving");
    if (!options.silent) setMessage({ tone: "info", text: "Saving your draft." });
    const result = await savePartnerServicesDraft({
      organizationId: servicesForm.organizationId || locationForm.organizationId || businessForm.organizationId || form.organizationId,
      selectedServiceCodes: servicesForm.selectedServiceCodes,
      requestedServices: servicesForm.requestedServices
        .filter((request) => request.requestedName.trim() || request.description.trim())
        .map((request) => ({
          requestedName: request.requestedName,
          description: request.description,
          closestDomain: request.closestDomain || undefined,
          closestCategoryCode: request.closestDomain || undefined,
        })),
    });
    if (!result.ok) {
      setSaveStatus("error");
      if (!options.silent) setMessage({ tone: "error", text: "Could not save your services." });
      return null;
    }
    setBundle(result.data);
    setForm((current) => ({ ...current, organizationId: result.data.organization.id }));
    setBusinessForm((current) => ({ ...current, organizationId: result.data.organization.id }));
    setLocationForm((current) => ({ ...current, organizationId: result.data.organization.id }));
    setServicesForm((current) => ({ ...current, organizationId: result.data.organization.id }));
    const savedAt = readLastSaved(result.data) ?? new Date().toISOString();
    setLastSavedAt(savedAt);
    setSaveStatus("saved");
    if (!options.silent) setMessage({ tone: "success", text: options.continueAfter ? "Draft saved. Continue with Verification & Compliance next." : "Draft saved." });
    return result.data;
  }

  async function saveVerificationDraft(options: { silent?: boolean; continueAfter?: boolean } = {}) {
    if (qaPreviewEnabled) {
      const savedAt = new Date().toISOString();
      setSaveStatus("saved");
      setLastSavedAt(savedAt);
      writeQaDraft(currentQaDraftPayload(options.continueAfter ? "payout_tax" : "documents_compliance", savedAt));
      if (!options.silent) setMessage({ tone: "success", text: options.continueAfter ? "Preview draft saved. Continue with Payout & Tax next." : "Preview draft saved." });
      return previewBundle;
    }
    const organizationId = activeBundle?.organization.id || servicesForm.organizationId || locationForm.organizationId || businessForm.organizationId || form.organizationId;
    if (!organizationId) {
      setMessage({ tone: "warning", text: "Save your application before completing verification." });
      return null;
    }
    setSaveStatus("saving");
    if (!options.silent) setMessage({ tone: "info", text: "Saving verification progress." });
    const result = await savePartnerVerificationComplianceDraft({ organizationId, continueAfter: options.continueAfter === true });
    if (!result.ok) {
      setSaveStatus("error");
      if (!options.silent) setMessage({ tone: "error", text: options.continueAfter ? "Complete the required checks before continuing." : "Could not save verification progress." });
      return null;
    }
    setBundle(result.data);
    const savedAt = readLastSaved(result.data) ?? new Date().toISOString();
    setLastSavedAt(savedAt);
    setSaveStatus("saved");
    if (!options.silent) setMessage({ tone: "success", text: options.continueAfter ? "Verification progress saved. Continue with Payout & Tax next." : "Verification progress saved." });
    return result.data;
  }

  function firstRequiredVerificationSectionId(saved: PartnerOrganizationBundle): string | null {
    const missing = saved.requirements.find((requirement) => requirementStage(requirement) === "REQUIRED_NOW" && !requirementReadyForUiProgression(requirement.status));
    if (!missing) return null;
    const selectedServicesForChecklist = selectedVerificationServices(servicesForm.selectedServiceCodes, saved.serviceScopes, serviceCatalogueState.items);
    const groups = groupPartnerRequirements(saved.requirements, saved.serviceScopes, serviceCatalogueState.items, selectedServicesForChecklist);
    return groups.find((group) => group.requirements.some((requirement) => requirement.id === missing.id))?.id ?? null;
  }

  async function requestMobileOtp() {
    if (qaPreviewEnabled) {
      setMobileChallenge({ status: "otp_sent", challengeId: "preview-mobile", expiresAt: new Date(Date.now() + 5 * 60_000).toISOString(), otpLength: 6, deliveryChannel: "preview" });
      setMessage({ tone: "success", text: "Verification code sent." });
      return;
    }
    const draft = await ensureDraft();
    const organizationId = draft?.organization.id ?? form.organizationId;
    if (!organizationId) return;
    setBusyAction("mobile-request");
    const result = await requestPartnerMobileVerification(organizationId, normalizedMobile(form.businessMobile, form.countryCode));
    setBusyAction(null);
    if (!result.ok) {
      setMessage({ tone: "error", text: "We couldn't send the verification code." });
      return;
    }
    if (result.data.status === "verified_via_tpl_identity") {
      setMessage({ tone: "success", text: "Mobile number verified." });
      const refreshed = await fetchPartnerApplicationDraft();
      if (refreshed.ok) setBundle(refreshed.data);
      return;
    }
    setMobileChallenge(result.data);
    setMessage({ tone: "success", text: "Verification code sent." });
  }

  async function confirmMobileOtp() {
    if (qaPreviewEnabled) {
      if (mobileOtp.length !== 6) {
        setMessage({ tone: "error", text: "Enter the 6-digit code." });
        return;
      }
      setQaVerifiedContacts((value) => ({ ...value, mobile: true }));
      setMobileChallenge(null);
      setMobileOtp("");
      setMessage({ tone: "success", text: "Mobile number verified." });
      return;
    }
    if (!mobileChallenge || !form.organizationId) return;
    setBusyAction("mobile-verify");
    const result = await verifyPartnerMobile(form.organizationId, {
      challengeId: mobileChallenge.challengeId,
      mobile: normalizedMobile(form.businessMobile, form.countryCode),
      otp: mobileOtp,
    });
    setBusyAction(null);
    if (!result.ok) {
      setMessage({ tone: "error", text: "We couldn't verify that code." });
      return;
    }
    setMobileChallenge(null);
    setMobileOtp("");
    setMessage({ tone: "success", text: "Mobile number verified." });
    const refreshed = await fetchPartnerApplicationDraft();
    if (refreshed.ok) setBundle(refreshed.data);
  }

  async function requestEmailOtp() {
    if (qaPreviewEnabled) {
      setEmailChallenge({ challengeId: "preview-email", expiresAt: new Date(Date.now() + 5 * 60_000).toISOString() });
      setMessage({ tone: "success", text: "Verification code sent." });
      return;
    }
    const draft = await ensureDraft();
    const organizationId = draft?.organization.id ?? form.organizationId;
    if (!organizationId) return;
    setBusyAction("email-request");
    const result = await requestPartnerEmailVerification(organizationId, normalizeEmail(form.businessEmail));
    setBusyAction(null);
    if (!result.ok) {
      setMessage({ tone: "error", text: "We couldn't send the email code." });
      return;
    }
    setEmailChallenge({ challengeId: result.data.challengeId, expiresAt: result.data.expiresAt });
    setMessage({ tone: "success", text: "Verification code sent." });
  }

  async function confirmEmailOtp() {
    if (qaPreviewEnabled) {
      if (emailOtp.length !== 6) {
        setMessage({ tone: "error", text: "Enter the 6-digit code." });
        return;
      }
      setQaVerifiedContacts((value) => ({ ...value, email: true }));
      setEmailChallenge(null);
      setEmailOtp("");
      setMessage({ tone: "success", text: "Email verified." });
      return;
    }
    if (!emailChallenge || !form.organizationId) return;
    setBusyAction("email-verify");
    const result = await verifyPartnerEmail(form.organizationId, {
      challengeId: emailChallenge.challengeId,
      email: normalizeEmail(form.businessEmail),
      token: emailOtp,
    });
    setBusyAction(null);
    if (!result.ok) {
      setMessage({ tone: "error", text: "We couldn't verify that code." });
      return;
    }
    setEmailChallenge(null);
    setEmailOtp("");
    setMessage({ tone: "success", text: "Email verified." });
    const refreshed = await fetchPartnerApplicationDraft();
    if (refreshed.ok) setBundle(refreshed.data);
  }

  async function saveAndContinue() {
    if (qaPreviewEnabled) {
      const savedAt = new Date().toISOString();
      setSaveStatus("saved");
      setLastSavedAt(savedAt);
      if (activeStep === "business_identity") {
        if (!canCompleteStepTwo) {
          setMessage({ tone: "warning", text: "Complete the required business details before continuing." });
          return;
        }
        writeQaDraft(currentQaDraftPayload("business_location", savedAt));
        setActiveStep("business_location");
      } else if (activeStep === "account_contact") {
        if (!canCompleteStepOne) {
          setMessage({ tone: "warning", text: "Complete Step 1 before continuing." });
          writeQaDraft(currentQaDraftPayload(activeStep, savedAt));
          return;
        }
        writeQaDraft(currentQaDraftPayload("business_identity", savedAt));
        setActiveStep("business_identity");
      } else if (activeStep === "business_location") {
        if (!canCompleteStepThree) {
          setMessage({ tone: "warning", text: "Complete the required location details before continuing." });
          writeQaDraft(currentQaDraftPayload(activeStep, savedAt));
          return;
        }
        writeQaDraft(currentQaDraftPayload("services", savedAt));
        setActiveStep("services");
      } else if (activeStep === "services") {
        if (!canCompleteStepFour) {
          setMessage({ tone: "warning", text: "Choose at least one service before continuing." });
          writeQaDraft(currentQaDraftPayload(activeStep, savedAt));
          return;
        }
        writeQaDraft(currentQaDraftPayload("documents_compliance", savedAt));
        setActiveStep("documents_compliance");
      } else {
        const currentIndex = workspaceSteps.findIndex((step) => step.id === activeStep);
        const nextStep = workspaceSteps[Math.min(workspaceSteps.length - 1, currentIndex + 1)]?.id ?? activeStep;
        writeQaDraft(currentQaDraftPayload(nextStep, savedAt));
        setActiveStep(nextStep);
      }
      setMessage({ tone: "success", text: "Preview draft saved." });
      return;
    }
    if (activeStep === "business_identity") {
      const saved = await saveBusinessIdentityDraft({ continueAfter: true });
      if (!saved) return;
      if (canCompleteStepTwo || isBusinessIdentityComplete(readBusinessIdentity(saved))) {
        setActiveStep("business_location");
      } else {
        setMessage({ tone: "warning", text: "Complete the required business details before continuing." });
      }
      return;
    }
    if (activeStep === "business_location") {
      const saved = await saveBusinessLocationDraft({ continueAfter: true });
      if (!saved) return;
      if (canCompleteStepThree || isBusinessLocationComplete(locationFormFromBundle(saved))) {
        setActiveStep("services");
      } else {
        setMessage({ tone: "warning", text: "Complete the required location details before continuing." });
      }
      return;
    }
    if (activeStep === "services") {
      const saved = await saveServicesDraft({ continueAfter: true });
      if (!saved) return;
      if (isServicesComplete(servicesFormFromBundle(saved), locationForm.primaryLocation.countryCode, businessForm.organizationType, serviceCatalogueState.items)) {
        setActiveStep("documents_compliance");
      } else {
        setMessage({ tone: "warning", text: "Choose at least one service before continuing." });
      }
      return;
    }
    if (activeStep === "documents_compliance") {
      const saved = await saveVerificationDraft({ continueAfter: true });
      if (!saved) return;
      if (isVerificationStepComplete(saved)) {
        setActiveStep("payout_tax");
        setFocusedVerificationSectionId(null);
      } else {
        setFocusedVerificationSectionId(firstRequiredVerificationSectionId(saved));
        setMessage({ tone: "warning", text: "Complete this required check before continuing." });
      }
      return;
    }
    const saved = await saveDraft({ continueAfter: true });
    if (!saved) return;
    if (canCompleteStepOne || contactVerified(saved, "mobile", normalizedMobile(form.businessMobile, form.countryCode)) && contactVerified(saved, "email", normalizeEmail(form.businessEmail)) && form.authorizedRepresentative) {
      setActiveStep("business_identity");
    } else {
      setMessage({ tone: "warning", text: "Complete the required contact details before continuing." });
    }
  }

  async function uploadEvidence(requirement: PartnerRequirement, file: File, details?: { documentNumber?: string; issueDate?: string; expiryDate?: string; noExpiry?: boolean }) {
    const organizationId = activeBundle?.organization.id || form.organizationId;
    if (!organizationId) {
      setMessage({ tone: "warning", text: "Save your application before uploading evidence." });
      return;
    }
    setUploadingRequirementId(requirement.id);
    setMessage({ tone: "info", text: "Uploading evidence." });
    const upload = await createPartnerDocumentUploadSession(organizationId, {
      filename: file.name,
      mimeType: file.type || "application/octet-stream",
      sizeBytes: file.size,
    });
    if (!upload.ok || upload.data.executionStatus !== "READY" || upload.data.uploadMode !== "signed_url" || !upload.data.upload) {
      setUploadingRequirementId(null);
      setMessage({ tone: "error", text: "Secure upload is not available for this staging environment." });
      return;
    }
    const putResult = await fetch(upload.data.upload.url, {
      method: upload.data.upload.method,
      headers: { "Content-Type": file.type || "application/octet-stream" },
      body: file,
    });
    if (!putResult.ok) {
      setUploadingRequirementId(null);
      setMessage({ tone: "error", text: "Document upload failed. Please try again." });
      return;
    }
    const confirmed = await confirmPartnerDocument(organizationId, {
      ownerEntityType: requirement.ownerEntityType,
      ownerEntityId: requirement.ownerEntityType,
      documentCategory: requirementGroupTitle(requirement),
      documentType: requirement.title,
      storageReference: upload.data.storageReference,
      originalFilename: file.name,
      mimeType: file.type || "application/octet-stream",
      sizeBytes: file.size,
      documentNumber: details?.documentNumber,
      issueDate: details?.issueDate,
      expiryDate: details?.expiryDate,
      noExpiry: details?.noExpiry,
    });
    if (!confirmed.ok) {
      setUploadingRequirementId(null);
      setMessage({ tone: "error", text: "We couldn't save this evidence." });
      return;
    }
    const linked = await linkPartnerDocumentToRequirement(organizationId, { documentId: confirmed.data.id, requirementId: requirement.id });
    if (!linked.ok) {
      setUploadingRequirementId(null);
      setMessage({ tone: "error", text: "Evidence uploaded but could not be linked. Please retry." });
      const refreshed = await fetchPartnerApplicationDraft();
      if (refreshed.ok) setBundle(refreshed.data);
      return;
    }
    const refreshed = await fetchPartnerApplicationDraft();
    if (refreshed.ok) setBundle(refreshed.data);
    setUploadingRequirementId(null);
    setSaveStatus("saved");
    setLastSavedAt(new Date().toISOString());
    setMessage({ tone: "success", text: "Evidence uploaded and ready for review." });
  }

  function resetQaPreviewData() {
    if (!qaPreviewEnabled) return;
    window.localStorage.removeItem(qaDraftStorageKey);
    const qaBundle = buildPartnerQaPreviewBundle(qaPreviewState);
    const nextForm = formFromBundle(qaBundle, user);
    const nextBusinessForm = businessFormFromBundle(qaBundle);
    const nextLocationForm = locationFormFromBundle(qaBundle);
    const nextServicesForm = servicesFormFromBundle(qaBundle);
    setForm(nextForm);
    setBusinessForm(nextBusinessForm);
    setLocationForm(nextLocationForm);
    setServicesForm(nextServicesForm);
    setActiveServiceDomainIds(serviceDomainIdsFromCodes(nextServicesForm.selectedServiceCodes, serviceCatalogueState.items));
    setQaVerifiedContacts({
      mobile: contactVerified(qaBundle, "mobile", normalizedMobile(nextForm.businessMobile, nextForm.countryCode)),
      email: contactVerified(qaBundle, "email", normalizeEmail(nextForm.businessEmail)),
    });
    setSaveStatus("idle");
    setLastSavedAt(null);
    setActiveStep(qaPreviewState === "approved" ? "review_submit" : "account_contact");
    setMessage({ tone: "info", text: "Preview data reset." });
  }

  const currentStepIndex = workspaceSteps.findIndex((step) => step.id === activeStep);
  const previousStep = currentStepIndex > 0 ? workspaceSteps[currentStepIndex - 1]!.id : "account_contact";
  const accountStepOverride: PartnerApplicationStepStatus | undefined = canCompleteStepOne ? "completed" : hasMeaningfulStepOneInput(form) ? "in-progress" : undefined;
  const businessStepOverride: PartnerApplicationStepStatus | undefined = canCompleteStepTwo ? "completed" : hasMeaningfulStepTwoInput(businessForm) ? "in-progress" : undefined;
  const locationStepOverride: PartnerApplicationStepStatus | undefined = canCompleteStepThree ? "completed" : hasMeaningfulStepThreeInput(locationForm) ? "in-progress" : undefined;
  const servicesStepOverride: PartnerApplicationStepStatus | undefined = canCompleteStepFour ? "completed" : hasMeaningfulStepFourInput(servicesForm) ? "in-progress" : undefined;

  if (!qaPreviewEnabled && !isAuthenticated) {
    return (
      <main data-partner-application-workspace="true" className="min-h-screen bg-[#101216] text-white">
        <CenteredShell>
          <div className="rounded-2xl border border-white/10 bg-[#171a20] p-8 shadow-2xl">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#fb923c]">Partner Application</p>
            <h1 className="mt-3 text-3xl font-black">Sign in to continue</h1>
            <p className="mt-2 max-w-md text-sm font-semibold leading-6 text-slate-300">
              Use your TPL GO account to save and resume your Partner application.
            </p>
            <button
              type="button"
              onClick={() => openLoginModal({ accountType: "partner", intent: "partner", redirectAfterLogin: "/partner-preview" })}
              className="mt-6 inline-flex h-11 items-center rounded-xl bg-[linear-gradient(135deg,#f97316,#ea580c)] px-5 text-sm font-black text-white shadow-[0_12px_28px_rgba(249,115,22,0.28)]"
            >
              Continue to Partner Sign In
            </button>
          </div>
        </CenteredShell>
      </main>
    );
  }

  return (
    <main data-partner-application-workspace="true" className="min-h-screen bg-[#101216] text-white">
      <div className="flex min-h-screen flex-col">
        <header data-partner-application-topbar="true" className="sticky top-0 z-30 border-b border-white/10 bg-[#11141a]/95 backdrop-blur">
          <div className="flex min-h-14 items-center justify-between gap-3 px-4 sm:px-5">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#f97316,#ea580c)] text-sm font-black text-white">TPL</div>
              <div className="min-w-0">
                <p className="truncate text-sm font-black">TPL GO</p>
                <p className="truncate text-xs font-semibold text-slate-400">Partner Application</p>
              </div>
            </div>
            <div className="hidden min-w-0 text-center md:block">
              <p className="truncate text-sm font-black">{readModel.organizationName}</p>
              <p className="text-xs font-semibold text-slate-400">{statusText(saveStatus, lastSavedAt)}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Link href="/customer-support" className="hidden h-9 items-center gap-2 rounded-lg border border-white/10 px-3 text-xs font-black text-slate-200 hover:border-[#f97316] sm:inline-flex">
                <HelpCircle size={15} aria-hidden="true" />
                Help
              </Link>
              <Link href="/" className="inline-flex h-9 items-center gap-2 rounded-lg border border-white/10 px-3 text-xs font-black text-slate-200 hover:border-[#f97316]">
                <LogOut size={15} aria-hidden="true" />
                Exit
              </Link>
            </div>
          </div>
          <TopProgress activeStep={activeStep} readModel={readModel} qaPreviewEnabled={qaPreviewEnabled} accountStepOverride={accountStepOverride} businessStepOverride={businessStepOverride} locationStepOverride={locationStepOverride} servicesStepOverride={servicesStepOverride} />
        </header>

        {qaPreviewEnabled ? <QaPreviewBar selectedState={qaPreviewState} onChange={changeQaPreviewState} onReset={resetQaPreviewData} /> : null}
        {message ? <WorkspaceToast tone={message.tone} text={message.text} onDismiss={() => setMessage(null)} /> : null}

        <div className="grid flex-1 gap-4 px-4 py-4 lg:grid-cols-[270px_minmax(0,1fr)] xl:grid-cols-[280px_minmax(0,1fr)_320px]">
          <StepNavigator activeStep={activeStep} readModel={readModel} qaPreviewEnabled={qaPreviewEnabled} accountStepOverride={accountStepOverride} businessStepOverride={businessStepOverride} locationStepOverride={locationStepOverride} servicesStepOverride={servicesStepOverride} onSelect={(step) => setActiveStep(step)} />
          <section className="min-w-0">
            <MobileStepSelector activeStep={activeStep} readModel={readModel} qaPreviewEnabled={qaPreviewEnabled} accountStepOverride={accountStepOverride} businessStepOverride={businessStepOverride} locationStepOverride={locationStepOverride} servicesStepOverride={servicesStepOverride} onSelect={(step) => setActiveStep(step)} />
            {loadStatus === "loading" ? (
              <LoadingCard />
            ) : isApprovedState && !qaPreviewEnabled ? (
              <StateCard title="Your Partner account is ready" detail="The verified Partner Business Desk opens in the next approved phase." tone="success" />
            ) : isSubmittedState && !qaPreviewEnabled && activeStep === "review_submit" ? (
              <StateCard title={readModel.statusLabel} detail={readModel.reviewNote || "TPL GO will guide you through the next action when review is complete."} tone={readModel.overallStatus === "rejected" ? "danger" : "warning"} />
            ) : activeStep === "account_contact" ? (
              <AccountContactStep
                form={form}
                user={user}
                mobileVerified={mobileVerified}
                emailVerified={emailVerified}
                mobileChallenge={mobileChallenge}
                mobileOtp={mobileOtp}
                emailChallenge={emailChallenge}
                emailOtp={emailOtp}
                busyAction={busyAction}
                qaPreviewEnabled={qaPreviewEnabled}
                canComplete={canCompleteStepOne}
                onApplyQaExample={(example) => {
                  updateForm(example.values);
                  setQaVerifiedContacts(example.verified);
                }}
                onUseAccount={() => updateForm({
                  businessMobile: user?.mobile ? stripIndiaPrefix(user.mobile) : form.businessMobile,
                  businessEmail: user?.email ?? form.businessEmail,
                  contactPersonFullName: user?.fullName || form.contactPersonFullName,
                  useAccountContactDetails: true,
                })}
                onChange={updateForm}
                onRequestMobile={requestMobileOtp}
                onConfirmMobile={confirmMobileOtp}
                onMobileOtpChange={setMobileOtp}
                onRequestEmail={requestEmailOtp}
                onConfirmEmail={confirmEmailOtp}
                onEmailOtpChange={setEmailOtp}
              />
            ) : activeStep === "business_identity" ? (
              <BusinessIdentityStep
                form={businessForm}
                showsRegistrationSection={showsRegistrationSection}
                canComplete={canCompleteStepTwo}
                qaPreviewEnabled={qaPreviewEnabled}
                onChange={updateBusinessForm}
              />
            ) : activeStep === "business_location" ? (
              <BusinessLocationStep
                form={locationForm}
                canComplete={canCompleteStepThree}
                qaPreviewEnabled={qaPreviewEnabled}
                onChange={updateLocationForm}
              />
            ) : activeStep === "services" ? (
              <ServicesStep
                form={servicesForm}
                businessType={businessForm.organizationType}
                countryCode={locationForm.primaryLocation.countryCode}
                canComplete={canCompleteStepFour}
                catalogueStatus={serviceCatalogueState.status}
                serviceCatalog={runtimeServiceCatalog}
                serviceCatalogueItems={serviceCatalogueState.items}
                qaPreviewEnabled={qaPreviewEnabled}
                legacyScopes={activeBundle?.serviceScopes ?? []}
                activeDomainIds={activeServiceDomainIds}
                onActiveDomainIdsChange={setActiveServiceDomainIds}
                onRemoveSelectedService={removeSelectedService}
                onRemoveSelectedServiceDomain={removeSelectedServiceDomain}
                onOpenSelectedServiceDomain={openSelectedServiceDomain}
                onChange={updateServicesForm}
              />
            ) : activeStep === "documents_compliance" ? (
              <VerificationComplianceStep
                bundle={activeBundle}
                selectedServiceCodes={servicesForm.selectedServiceCodes}
                serviceCatalogueItems={serviceCatalogueState.items}
                qaPreviewEnabled={qaPreviewEnabled}
                uploadingRequirementId={uploadingRequirementId}
                onUploadEvidence={uploadEvidence}
                onEditSelectedServices={() => setActiveStep("services")}
                focusSectionId={focusedVerificationSectionId}
                onFocusSectionHandled={() => setFocusedVerificationSectionId(null)}
              />
            ) : activeStep === "payout_tax" ? (
              <PayoutTaxPlaceholder />
            ) : (
              <PlaceholderStep step={workspaceSteps.find((step) => step.id === activeStep) ?? workspaceSteps[1]!} />
            )}
          </section>
          <HelpPanel
            activeStep={activeStep}
            verificationSummary={activeStep === "documents_compliance" ? (
              <VerificationSummaryBody
                requirements={activeBundle?.requirements ?? (qaPreviewEnabled ? previewRequirementsForSelectedServices(servicesForm.selectedServiceCodes, serviceCatalogueState.items) : [])}
              />
            ) : null}
            servicesSummary={activeStep === "services" ? (
              <SelectedServicesSummary
                form={servicesForm}
                headingId="selected-services-summary-desktop"
                countryCode={locationForm.primaryLocation.countryCode}
                businessType={businessForm.organizationType}
                serviceCatalogueItems={serviceCatalogueState.items}
                serviceCatalog={runtimeServiceCatalog}
                legacyScopes={activeBundle?.serviceScopes ?? []}
                onRemoveService={removeSelectedService}
                onRemoveDomain={removeSelectedServiceDomain}
                onEditDomain={openSelectedServiceDomain}
              />
            ) : null}
          />
        </div>

        <footer className="sticky bottom-0 z-30 border-t border-white/10 bg-[#11141a]/95 px-4 py-3 backdrop-blur">
          <div className="mx-auto flex max-w-7xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              disabled={activeStep === "account_contact"}
              onClick={() => setActiveStep(previousStep)}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-white/10 px-4 text-sm font-black text-slate-300 disabled:cursor-not-allowed disabled:opacity-45"
            >
              <ArrowLeft size={16} aria-hidden="true" />
              Previous
            </button>
            <div className="grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => void saveDraft()}
                disabled={saveStatus === "saving"}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#1b1f27] px-4 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-55"
              >
                {saveStatus === "saving" ? <Loader2 className="animate-spin" size={16} aria-hidden="true" /> : null}
                Save as Draft
              </button>
              <button
                type="button"
                onClick={() => void saveAndContinue()}
                disabled={saveStatus === "saving"}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[linear-gradient(135deg,#f97316,#ea580c)] px-4 text-sm font-black text-white shadow-[0_12px_28px_rgba(249,115,22,0.26)] disabled:cursor-not-allowed disabled:opacity-55"
              >
                Save & Continue
                <ArrowRight size={16} aria-hidden="true" />
              </button>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}

function AccountContactStep({
  form,
  user,
  mobileVerified,
  emailVerified,
  mobileChallenge,
  mobileOtp,
  emailChallenge,
  emailOtp,
  busyAction,
  qaPreviewEnabled,
  canComplete,
  onApplyQaExample,
  onUseAccount,
  onChange,
  onRequestMobile,
  onConfirmMobile,
  onMobileOtpChange,
  onRequestEmail,
  onConfirmEmail,
  onEmailOtpChange,
}: {
  form: AccountContactForm;
  user: ReturnType<typeof useAuth>["user"];
  mobileVerified: boolean;
  emailVerified: boolean;
  mobileChallenge: PartnerMobileChallenge | null;
  mobileOtp: string;
  emailChallenge: { challengeId: string; expiresAt: string } | null;
  emailOtp: string;
  busyAction: string | null;
  qaPreviewEnabled: boolean;
  canComplete: boolean;
  onApplyQaExample: (example: (typeof qaAccountContactExamples)[number]) => void;
  onUseAccount: () => void;
  onChange: (next: Partial<AccountContactForm>) => void;
  onRequestMobile: () => void;
  onConfirmMobile: () => void;
  onMobileOtpChange: (value: string) => void;
  onRequestEmail: () => void;
  onConfirmEmail: () => void;
  onEmailOtpChange: (value: string) => void;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#171a20] shadow-2xl">
      <div className="border-b border-white/10 p-5">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-[#fb923c]">Step 1</p>
        <h1 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">Account & Contact</h1>
        <p className="mt-2 text-sm font-semibold leading-6 text-slate-300">Tell us who we should contact about your Partner application.</p>
      </div>

      <div className="grid gap-5 p-5">
        {qaPreviewEnabled ? (
          <div className="flex flex-col gap-2 rounded-xl border border-[#f97316]/25 bg-[#f97316]/10 p-3 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-xs font-black uppercase tracking-[0.12em] text-[#fed7aa]">Preview example</span>
            <select
              data-qa-account-example="true"
              defaultValue=""
              onChange={(event) => {
                const selected = qaAccountContactExamples.find((example) => example.key === event.target.value);
                if (selected) onApplyQaExample(selected);
              }}
              className="h-10 rounded-xl border border-[#f97316]/30 bg-[#11141a] px-3 text-sm font-bold text-white outline-none focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/25"
            >
              <option value="">Choose a sample contact</option>
              {qaAccountContactExamples.map((example) => <option key={example.key} value={example.key}>{example.label}</option>)}
            </select>
          </div>
        ) : null}

        <section className="rounded-xl border border-white/10 bg-[#11141a] p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-sm font-black text-white">Your TPL Account</h2>
              <p className="mt-1 text-sm font-black text-slate-100">{user?.fullName || "Account holder"}</p>
              <div className="mt-3 grid gap-2 text-xs font-semibold text-slate-300 sm:grid-cols-2">
                <div className="rounded-lg border border-white/10 bg-[#0f1217] p-3">
                  <p className="text-slate-500">Mobile</p>
                  <p className="mt-1 text-white">{maskMobile(user?.mobile)}</p>
                  {user?.mobile ? <p className="mt-1 text-emerald-300">Verified</p> : <p className="mt-1 text-slate-500">Not added</p>}
                </div>
                <div className="rounded-lg border border-white/10 bg-[#0f1217] p-3">
                  <p className="text-slate-500">Email</p>
                  <p className="mt-1 text-white">{maskEmail(user?.email)}</p>
                  {user?.email ? <p className="mt-1 text-emerald-300">Verified</p> : <p className="mt-1 text-slate-500">Not added</p>}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-white/10 bg-[#11141a] p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-black text-white">Business Contact</h2>
              <p className="mt-1 text-xs font-semibold text-slate-400">These details stay with this Partner application.</p>
            </div>
            <label className="inline-flex items-center gap-2 text-xs font-black text-slate-200">
              <input
                type="checkbox"
                checked={form.useAccountContactDetails}
                onChange={(event) => {
                  const checked = event.target.checked;
                  onChange({ useAccountContactDetails: checked });
                  if (checked) onUseAccount();
                }}
                className="h-4 w-4 rounded border-white/20 accent-[#f97316]"
              />
              Use my TPL account contact details
            </label>
          </div>
        </section>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2">
            <span className="text-xs font-black uppercase tracking-[0.1em] text-slate-300">Contact Person Full Name <span className="text-[#fb923c]">Required</span></span>
            <input name="contactPersonFullName" value={form.contactPersonFullName} onChange={(event) => onChange({ contactPersonFullName: event.target.value.slice(0, 80) })} className="h-11 rounded-xl border border-white/10 bg-[#0f1217] px-3 text-sm font-semibold text-white outline-none focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/25" />
          </label>
          <label className="grid gap-2">
            <span className="text-xs font-black uppercase tracking-[0.1em] text-slate-300">Designation / Role <span className="text-[#fb923c]">Required</span></span>
            <select name="designation" value={form.designation} onChange={(event) => onChange({ designation: event.target.value })} className="h-11 rounded-xl border border-white/10 bg-[#0f1217] px-3 text-sm font-semibold text-white outline-none focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/25">
              <option value="">Select role</option>
              {roleOptions.map((role) => <option key={role} value={role}>{role}</option>)}
            </select>
          </label>
        </div>

        {form.designation === "Other" ? (
          <label className="grid gap-2">
            <span className="text-xs font-black uppercase tracking-[0.1em] text-slate-300">Tell us your role <span className="text-[#fb923c]">Required</span></span>
            <input name="roleOther" value={form.roleOther} onChange={(event) => onChange({ roleOther: event.target.value.slice(0, 80) })} className="h-11 rounded-xl border border-white/10 bg-[#0f1217] px-3 text-sm font-semibold text-white outline-none focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/25" />
          </label>
        ) : null}

        <section className="grid gap-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-black text-white">Business / Service Mobile Number</h2>
            {mobileVerified ? <VerifiedChip label="Verified" /> : null}
          </div>
          <div className="grid gap-2 sm:grid-cols-[92px_minmax(0,1fr)_112px]">
            <select name="countryCode" value={form.countryCode} onChange={(event) => onChange({ countryCode: event.target.value, useAccountContactDetails: false })} className="h-11 rounded-xl border border-white/10 bg-[#0f1217] px-3 text-sm font-black text-white outline-none focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/25">
              <option value="+91">+91</option>
              <option value="+1">+1</option>
              <option value="+44">+44</option>
              <option value="+971">+971</option>
            </select>
            <input name="businessMobile" value={form.businessMobile} onChange={(event) => onChange({ businessMobile: event.target.value.replace(/\D/g, "").slice(0, 15), useAccountContactDetails: false })} inputMode="tel" className="h-11 rounded-xl border border-white/10 bg-[#0f1217] px-3 text-sm font-semibold text-white outline-none focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/25" />
            <button data-qa-mobile-verify={qaPreviewEnabled ? "true" : undefined} type="button" disabled={mobileVerified || busyAction === "mobile-request"} onClick={onRequestMobile} className="h-11 rounded-xl bg-[linear-gradient(135deg,#f97316,#ea580c)] px-3 text-xs font-black text-white disabled:opacity-50">
              {busyAction === "mobile-request" ? "Sending" : mobileVerified ? "Verified" : "Verify"}
            </button>
          </div>
          {mobileChallenge ? (
            <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_124px]">
              <input name="mobileOtp" value={mobileOtp} onChange={(event) => onMobileOtpChange(event.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="6-digit code" inputMode="numeric" className="h-10 rounded-xl border border-[#f97316]/40 bg-[#0f1217] px-3 text-sm font-semibold text-white outline-none focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/25" />
              <button data-qa-mobile-confirm={qaPreviewEnabled ? "true" : undefined} type="button" disabled={busyAction === "mobile-verify" || mobileOtp.length !== 6} onClick={onConfirmMobile} className="h-10 rounded-xl border border-[#f97316]/50 px-3 text-xs font-black text-[#fed7aa] disabled:opacity-50">
                Verify OTP
              </button>
            </div>
          ) : null}
        </section>

        <section className="grid gap-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-black text-white">Business Email</h2>
            {emailVerified ? <VerifiedChip label="Verified" /> : null}
          </div>
          <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_112px]">
            <input name="businessEmail" value={form.businessEmail} onChange={(event) => onChange({ businessEmail: event.target.value.slice(0, 160), useAccountContactDetails: false })} inputMode="email" className="h-11 rounded-xl border border-white/10 bg-[#0f1217] px-3 text-sm font-semibold text-white outline-none focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/25" />
            <button data-qa-email-verify={qaPreviewEnabled ? "true" : undefined} type="button" disabled={emailVerified || busyAction === "email-request"} onClick={onRequestEmail} className="h-11 rounded-xl bg-[linear-gradient(135deg,#f97316,#ea580c)] px-3 text-xs font-black text-white disabled:opacity-50">
              {busyAction === "email-request" ? "Sending" : emailVerified ? "Verified" : "Verify"}
            </button>
          </div>
          {emailChallenge ? (
            <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_124px]">
              <input name="emailOtp" value={emailOtp} onChange={(event) => onEmailOtpChange(event.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="6-digit code" inputMode="numeric" className="h-10 rounded-xl border border-[#f97316]/40 bg-[#0f1217] px-3 text-sm font-semibold text-white outline-none focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/25" />
              <button data-qa-email-confirm={qaPreviewEnabled ? "true" : undefined} type="button" disabled={busyAction === "email-verify" || emailOtp.length !== 6} onClick={onConfirmEmail} className="h-10 rounded-xl border border-[#f97316]/50 px-3 text-xs font-black text-[#fed7aa] disabled:opacity-50">
                Verify OTP
              </button>
            </div>
          ) : null}
        </section>

        <label className="flex items-start gap-3 rounded-xl border border-white/10 bg-[#11141a] p-4">
          <input name="authorizedRepresentative" type="checkbox" checked={form.authorizedRepresentative} onChange={(event) => onChange({ authorizedRepresentative: event.target.checked })} className="mt-1 h-4 w-4 rounded border-white/20 accent-[#f97316]" />
          <span className="text-sm font-semibold leading-6 text-slate-200">
            I confirm that I am authorized to provide information for this Partner application.
          </span>
        </label>

        <div className={`rounded-xl border p-3 text-sm font-bold ${canComplete ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200" : "border-[#f97316]/30 bg-[#f97316]/10 text-[#fed7aa]"}`}>
          {canComplete ? "Contact details verified." : "Mobile and email must be verified to continue."}
        </div>
      </div>
    </div>
  );
}

function BusinessIdentityStep({
  form,
  showsRegistrationSection,
  canComplete,
  qaPreviewEnabled,
  onChange,
}: {
  form: BusinessIdentityForm;
  showsRegistrationSection: boolean;
  canComplete: boolean;
  qaPreviewEnabled: boolean;
  onChange: (next: Partial<BusinessIdentityForm>) => void;
}) {
  return (
    <div data-application-active-step="business_identity" className="rounded-2xl border border-white/10 bg-[#171a20] shadow-2xl">
      <div className="border-b border-white/10 p-5">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-[#fb923c]">Step 2</p>
        <h1 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">Business Identity</h1>
        <p className="mt-2 text-sm font-semibold leading-6 text-slate-300">
          Tell us about the business or professional entity behind your Partner account.
        </p>
      </div>

      <div className="grid gap-5 p-5">
        {qaPreviewEnabled ? (
          <div className="flex flex-col gap-2 rounded-xl border border-[#f97316]/25 bg-[#f97316]/10 p-3 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-xs font-black uppercase tracking-[0.12em] text-[#fed7aa]">Preview example</span>
            <select
              data-qa-business-example="true"
              defaultValue=""
              onChange={(event) => {
                const selected = qaBusinessIdentityExamples.find((example) => example.key === event.target.value);
                if (selected) onChange(selected.values);
              }}
              className="h-10 rounded-xl border border-[#f97316]/30 bg-[#11141a] px-3 text-sm font-bold text-white outline-none focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/25"
            >
              <option value="">Choose a sample profile</option>
              {qaBusinessIdentityExamples.map((example) => <option key={example.key} value={example.key}>{example.label}</option>)}
            </select>
          </div>
        ) : null}

        <section className="rounded-xl border border-white/10 bg-[#11141a] p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-sm font-black text-white">Business Basics</h2>
              <p className="mt-1 text-xs font-semibold text-slate-400">Legal details are used for review. Display name is optional.</p>
            </div>
            <span className="rounded-full border border-[#f97316]/30 bg-[#f97316]/10 px-2.5 py-1 text-[11px] font-black text-[#fed7aa]">
              Required fields
            </span>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-xs font-black uppercase tracking-[0.1em] text-slate-300">Legal Business / Professional Name</span>
              <input
                name="legalName"
                value={form.legalName}
                onChange={(event) => onChange({ legalName: event.target.value.slice(0, 120) })}
                className="h-11 rounded-xl border border-white/10 bg-[#0f1217] px-3 text-sm font-semibold text-white outline-none focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/25"
              />
              {!form.legalName.trim() ? <span className="text-xs font-semibold text-[#fed7aa]">Enter your legal business name.</span> : null}
            </label>

            <label className="grid gap-2">
              <span className="text-xs font-black uppercase tracking-[0.1em] text-slate-300">Brand / Display Name <span className="text-slate-500">Optional</span></span>
              <input
                name="brandName"
                value={form.brandName}
                onChange={(event) => onChange({ brandName: event.target.value.slice(0, 120) })}
                placeholder="Example: Mountain View Resort"
                className="h-11 rounded-xl border border-white/10 bg-[#0f1217] px-3 text-sm font-semibold text-white outline-none placeholder:text-slate-600 focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/25"
              />
            </label>
          </div>

          <div className="mt-4 grid min-w-0 gap-4 md:grid-cols-[minmax(0,1fr)_160px]">
            <label className="grid min-w-0 gap-2">
              <span className="text-xs font-black uppercase tracking-[0.1em] text-slate-300">How do you operate?</span>
              <select
                name="organizationType"
                value={form.organizationType}
                onChange={(event) => onChange({ organizationType: event.target.value, organizationTypeOther: event.target.value === "Other" ? form.organizationTypeOther : "" })}
                className="h-11 w-full min-w-0 rounded-xl border border-white/10 bg-[#0f1217] px-3 text-sm font-semibold text-white outline-none focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/25"
              >
                <option value="">Select one</option>
                {organizationTypeOptions.map((type) => <option key={type} value={type}>{type}</option>)}
              </select>
              {!form.organizationType ? <span className="text-xs font-semibold text-[#fed7aa]">Select how your business is registered.</span> : null}
            </label>

            <label className="grid min-w-0 gap-2">
              <span className="text-xs font-black uppercase tracking-[0.1em] text-slate-300">Year Established <span className="text-slate-500">Optional</span></span>
              <input
                name="yearEstablished"
                value={form.yearEstablished}
                onChange={(event) => onChange({ yearEstablished: event.target.value.replace(/\D/g, "").slice(0, 4) })}
                inputMode="numeric"
                className="h-11 w-full min-w-0 rounded-xl border border-white/10 bg-[#0f1217] px-3 text-sm font-semibold text-white outline-none focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/25"
              />
            </label>
          </div>

          {form.organizationType === "Other" ? (
            <label className="mt-4 grid gap-2">
              <span className="text-xs font-black uppercase tracking-[0.1em] text-slate-300">Tell us your organization type</span>
              <input
                name="organizationTypeOther"
                value={form.organizationTypeOther}
                onChange={(event) => onChange({ organizationTypeOther: event.target.value.slice(0, 80) })}
                className="h-11 rounded-xl border border-white/10 bg-[#0f1217] px-3 text-sm font-semibold text-white outline-none focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/25"
              />
            </label>
          ) : null}

          <label className="mt-4 grid gap-2">
            <span className="text-xs font-black uppercase tracking-[0.1em] text-slate-300">Business / Professional Description</span>
            <textarea
              name="description"
              value={form.description}
              onChange={(event) => onChange({ description: event.target.value.slice(0, 500) })}
              placeholder="Briefly describe what your business or professional service does."
              maxLength={500}
              rows={4}
              className="min-h-28 resize-y rounded-xl border border-white/10 bg-[#0f1217] px-3 py-3 text-sm font-semibold leading-6 text-white outline-none placeholder:text-slate-600 focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/25"
            />
            <span className="flex items-center justify-between gap-3 text-xs font-semibold text-slate-500">
              <span>{form.description.trim().length > 0 && form.description.trim().length < 20 ? "Add a little more detail about your service." : "Maximum 500 characters."}</span>
              <span>{form.description.length} / 500</span>
            </span>
          </label>
        </section>

        {showsRegistrationSection ? (
          <section className="rounded-xl border border-white/10 bg-[#11141a] p-4">
            <div className="flex flex-col gap-1">
              <h2 className="text-sm font-black text-white">Registration Details</h2>
              <p className="text-xs font-semibold text-slate-400">Add these if they apply to your entity. Document checks come later.</p>
            </div>
            <div className="mt-4 grid gap-4">
              <label className="grid gap-2">
                <span className="text-xs font-black uppercase tracking-[0.1em] text-slate-300">Registration Type <span className="text-slate-500">Conditional</span></span>
                <select name="registrationType" value={form.registrationType} onChange={(event) => onChange({ registrationType: event.target.value })} className="h-11 w-full rounded-xl border border-white/10 bg-[#0f1217] px-3 text-sm font-semibold text-white outline-none focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/25">
                  <option value="">Select registration type</option>
                  {registrationTypeOptionsFor(form.organizationType).map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              </label>
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_132px]">
                <label className="grid gap-2">
                  <span className="text-xs font-black uppercase tracking-[0.1em] text-slate-300">Registration Number <span className="text-slate-500">Conditional</span></span>
                  <input name="registrationNumber" value={form.registrationNumber} onChange={(event) => onChange({ registrationNumber: event.target.value.slice(0, 80) })} className="h-11 min-w-0 rounded-xl border border-white/10 bg-[#0f1217] px-3 text-sm font-semibold text-white outline-none focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/25" />
                </label>
                <button
                  type="button"
                  onClick={() => onChange({ registrationVerificationStatus: "Manual review required" })}
                  className="self-end rounded-xl border border-[#f97316]/40 bg-[#f97316]/10 px-3 py-3 text-xs font-black text-[#fed7aa] hover:border-[#f97316]"
                >
                  Verify
                </button>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-2">
                  <span className="text-xs font-black uppercase tracking-[0.1em] text-slate-300">Registration Date <span className="text-slate-500">Conditional</span></span>
                  <input name="registrationDate" value={form.registrationDate} onChange={(event) => onChange({ registrationDate: event.target.value })} type="date" className="h-11 min-w-0 rounded-xl border border-white/10 bg-[#0f1217] px-3 text-sm font-semibold text-white outline-none focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/25" />
                </label>
                <div className="grid gap-2">
                  <span className="text-xs font-black uppercase tracking-[0.1em] text-slate-300">Verification Status</span>
                  {qaPreviewEnabled ? (
                    <select name="registrationVerificationStatus" value={form.registrationVerificationStatus} onChange={(event) => onChange({ registrationVerificationStatus: event.target.value })} className="h-11 w-full rounded-xl border border-white/10 bg-[#0f1217] px-3 text-sm font-semibold text-white outline-none focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/25">
                      {verificationStatusOptions.map((status) => <option key={status} value={status}>{status}</option>)}
                    </select>
                  ) : (
                    <span className="inline-flex h-11 items-center rounded-xl border border-white/10 bg-[#0f1217] px-3 text-sm font-bold text-slate-300">{form.registrationVerificationStatus || "Not verified"}</span>
                  )}
                </div>
              </div>
              <p className="rounded-xl border border-[#f97316]/25 bg-[#f97316]/10 px-3 py-2 text-xs font-bold text-[#fed7aa]">
                Verification service not connected yet. These details will be reviewed in Verification & Compliance.
              </p>
            </div>
          </section>
        ) : null}

        <div className={`rounded-xl border p-3 text-sm font-bold ${canComplete ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200" : "border-[#f97316]/30 bg-[#f97316]/10 text-[#fed7aa]"}`}>
          {canComplete ? "Business identity details are ready." : "Complete the required business details to continue."}
        </div>
      </div>
    </div>
  );
}

function BusinessLocationStep({
  form,
  canComplete,
  qaPreviewEnabled,
  onChange,
}: {
  form: BusinessLocationForm;
  canComplete: boolean;
  qaPreviewEnabled: boolean;
  onChange: (next: Partial<BusinessLocationForm>) => void;
}) {
  const primaryRegionLabel = regionLabelFor(form.primaryLocation.countryCode);
  const operatingRegionLabel = regionLabelFor(form.operatingLocation.countryCode);

  function updatePrimaryLocation(next: Partial<LocationAddressForm>) {
    const primaryLocation = { ...form.primaryLocation, ...next };
    onChange({
      primaryLocation,
      operatingLocation: form.sameAsOperating ? primaryLocation : form.operatingLocation,
    });
  }

  function updateOperatingLocation(next: Partial<LocationAddressForm>) {
    onChange({ operatingLocation: { ...form.operatingLocation, ...next } });
  }

  function updateServiceArea(id: string, next: Partial<ServiceAreaForm>) {
    onChange({ serviceAreas: form.serviceAreas.map((area) => area.id === id ? { ...area, ...next } : area) });
  }

  function addServiceArea() {
    onChange({ serviceAreas: [...form.serviceAreas, emptyServiceArea()] });
  }

  function removeServiceArea(id: string) {
    onChange({ serviceAreas: form.serviceAreas.length > 1 ? form.serviceAreas.filter((area) => area.id !== id) : form.serviceAreas });
  }

  return (
    <div data-application-active-step="business_location" className="rounded-2xl border border-white/10 bg-[#171a20] shadow-2xl">
      <div className="border-b border-white/10 p-5">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-[#fb923c]">Step 3</p>
        <h1 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">Business Location</h1>
        <p className="mt-2 text-sm font-semibold leading-6 text-slate-300">
          Tell us where your business is based and where you provide your services.
        </p>
      </div>

      <div className="grid gap-5 p-5">
        {qaPreviewEnabled ? (
          <div className="flex flex-col gap-2 rounded-xl border border-[#f97316]/25 bg-[#f97316]/10 p-3 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-xs font-black uppercase tracking-[0.12em] text-[#fed7aa]">Preview example</span>
            <select
              data-qa-location-example="true"
              defaultValue=""
              onChange={(event) => {
                const selected = qaBusinessLocationExamples.find((example) => example.key === event.target.value);
                if (selected) onChange(selected.values);
              }}
              className="h-10 rounded-xl border border-[#f97316]/30 bg-[#11141a] px-3 text-sm font-bold text-white outline-none focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/25"
            >
              <option value="">Choose a sample location</option>
              {qaBusinessLocationExamples.map((example) => <option key={example.key} value={example.key}>{example.label}</option>)}
            </select>
          </div>
        ) : null}

        <section className="rounded-xl border border-white/10 bg-[#11141a] p-4">
          <SectionHeading title="Primary Business Location" detail="Use your main registered or primary business address." />
          <LocationFields
            prefix="primary"
            value={form.primaryLocation}
            regionLabel={primaryRegionLabel}
            onChange={updatePrimaryLocation}
          />
        </section>

        <section className="rounded-xl border border-white/10 bg-[#11141a] p-4">
          <SectionHeading title="Operating Location" detail="Tell us if your main service location is different." />
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <label className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-sm font-bold ${form.sameAsOperating ? "border-[#f97316]/50 bg-[#f97316]/10 text-[#fed7aa]" : "border-white/10 bg-[#0f1217] text-slate-300"}`}>
              <input type="radio" name="sameAsOperating" checked={form.sameAsOperating} onChange={() => onChange({ sameAsOperating: true, operatingLocation: form.primaryLocation })} className="accent-[#f97316]" />
              Same as primary location
            </label>
            <label className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-sm font-bold ${!form.sameAsOperating ? "border-[#f97316]/50 bg-[#f97316]/10 text-[#fed7aa]" : "border-white/10 bg-[#0f1217] text-slate-300"}`}>
              <input type="radio" name="sameAsOperating" checked={!form.sameAsOperating} onChange={() => onChange({ sameAsOperating: false })} className="accent-[#f97316]" />
              Use a different location
            </label>
          </div>
          {!form.sameAsOperating ? (
            <div className="mt-4">
              <LocationFields
                prefix="operating"
                value={form.operatingLocation}
                regionLabel={operatingRegionLabel}
                onChange={updateOperatingLocation}
              />
            </div>
          ) : null}
        </section>

        <section className="rounded-xl border border-white/10 bg-[#11141a] p-4">
          <SectionHeading title="Where Do You Provide Services?" detail="Add the areas where customers can use your services." />
          <div className="mt-4 grid gap-3">
            {form.serviceAreas.map((area, index) => (
              <div key={area.id} className="rounded-xl border border-white/10 bg-[#0f1217] p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-black uppercase tracking-[0.1em] text-slate-400">Service Area {index + 1}</p>
                  <button type="button" onClick={() => removeServiceArea(area.id)} className="text-xs font-black text-slate-400 hover:text-[#fed7aa]">Remove</button>
                </div>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <label className="grid min-w-0 gap-2">
                    <span className="text-xs font-black uppercase tracking-[0.1em] text-slate-300">Coverage Level</span>
                    <select name={`coverageLevel-${area.id}`} value={area.coverageLevel} onChange={(event) => updateServiceArea(area.id, { coverageLevel: event.target.value })} className="h-11 w-full rounded-xl border border-white/10 bg-[#11141a] px-3 text-sm font-semibold text-white outline-none focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/25">
                      <option value="">Select coverage</option>
                      {coverageLevelOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                    </select>
                  </label>
                  <CountrySelect value={area.countryCode} onChange={(country) => updateServiceArea(area.id, { countryCode: country.countryCode, country: country.displayName })} />
                  <label className="grid min-w-0 gap-2">
                    <span className="text-xs font-black uppercase tracking-[0.1em] text-slate-300">State / Region</span>
                    <input name={`serviceAreaRegion-${area.id}`} value={area.stateRegion} onChange={(event) => updateServiceArea(area.id, { stateRegion: event.target.value.slice(0, 80) })} className="h-11 w-full min-w-0 rounded-xl border border-white/10 bg-[#11141a] px-3 text-sm font-semibold text-white outline-none focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/25" />
                  </label>
                  <label className="grid min-w-0 gap-2">
                    <span className="text-xs font-black uppercase tracking-[0.1em] text-slate-300">City / Destination</span>
                    <input name={`serviceAreaCity-${area.id}`} value={area.cityDestination} onChange={(event) => updateServiceArea(area.id, { cityDestination: event.target.value.slice(0, 80) })} className="h-11 w-full min-w-0 rounded-xl border border-white/10 bg-[#11141a] px-3 text-sm font-semibold text-white outline-none focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/25" />
                  </label>
                  <label className="grid min-w-0 gap-2 md:col-span-2">
                    <span className="text-xs font-black uppercase tracking-[0.1em] text-slate-300">Local Area <span className="text-slate-500">Optional</span></span>
                    <input name={`serviceAreaLocal-${area.id}`} value={area.localArea} onChange={(event) => updateServiceArea(area.id, { localArea: event.target.value.slice(0, 120) })} className="h-11 w-full min-w-0 rounded-xl border border-white/10 bg-[#11141a] px-3 text-sm font-semibold text-white outline-none focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/25" />
                  </label>
                </div>
              </div>
            ))}
            <button type="button" onClick={addServiceArea} className="h-11 rounded-xl border border-[#f97316]/40 bg-[#f97316]/10 px-4 text-sm font-black text-[#fed7aa] hover:border-[#f97316]">
              + Add another area
            </button>
          </div>
        </section>

        <div className={`rounded-xl border p-3 text-sm font-bold ${canComplete ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200" : "border-[#f97316]/30 bg-[#f97316]/10 text-[#fed7aa]"}`}>
          {canComplete ? "Business location details are ready." : "Complete the required location details and add at least one service area."}
        </div>
      </div>
    </div>
  );
}

function ServicesStep({
  form,
  businessType,
  countryCode,
  canComplete,
  catalogueStatus,
  serviceCatalog,
  serviceCatalogueItems,
  qaPreviewEnabled,
  legacyScopes,
  activeDomainIds,
  onActiveDomainIdsChange,
  onRemoveSelectedService,
  onRemoveSelectedServiceDomain,
  onOpenSelectedServiceDomain,
  onChange,
}: {
  form: ServicesForm;
  businessType: string;
  countryCode: string;
  canComplete: boolean;
  catalogueStatus: RuntimeCatalogueState["status"];
  serviceCatalog: PartnerServiceCategory[];
  serviceCatalogueItems: PartnerServiceCatalogueItem[];
  qaPreviewEnabled: boolean;
  legacyScopes: PartnerOrganizationBundle["serviceScopes"];
  activeDomainIds: PartnerServiceDomainId[];
  onActiveDomainIdsChange: (next: PartnerServiceDomainId[] | ((current: PartnerServiceDomainId[]) => PartnerServiceDomainId[])) => void;
  onRemoveSelectedService: (service: PartnerServiceCatalogueItem) => void;
  onRemoveSelectedServiceDomain: (domainId: PartnerServiceDomainId) => void;
  onOpenSelectedServiceDomain: (domainId: PartnerServiceDomainId) => void;
  onChange: (next: ServicesFormUpdate) => void;
}) {
  const [serviceFilters, setServiceFilters] = useState<Record<string, string>>({});
  const eligibleCatalog = useMemo(() => filterEligiblePartnerServiceCatalog(serviceCatalog, countryCode, businessType, serviceCatalogueItems), [businessType, countryCode, serviceCatalog, serviceCatalogueItems]);
  const selectedItems = useMemo(() => form.selectedServiceCodes.map((code) => findPartnerCatalogueItemIn(serviceCatalogueItems, code)).filter(Boolean) as PartnerServiceCatalogueItem[], [form.selectedServiceCodes, serviceCatalogueItems]);
  const selectedCodes = useMemo(() => new Set(form.selectedServiceCodes), [form.selectedServiceCodes]);
  const selectedDomainIds = useMemo(() => {
    const domains = selectedItems.map((item) => item.domain);
    return [...new Set(domains)];
  }, [selectedItems]);
  const visibleDomainIds = [...new Set([...activeDomainIds, ...selectedDomainIds])];
  const activeDomains = visibleDomainIds
    .map((domainId) => eligibleCatalog.find((category) => category.id === domainId))
    .filter(Boolean) as typeof eligibleCatalog;
  const remainingDomains = eligibleCatalog.filter((category) => !visibleDomainIds.includes(category.id));
  const selectedUnavailable = selectedItems.filter((item) => !partnerServiceEligibleForApplication(item, countryCode, businessType));
  const staleScopes = legacyScopes.filter((scope) => {
    if (scope.status === "disabled") return false;
    const item = findPartnerCatalogueItemIn(serviceCatalogueItems, scope.serviceCode);
    return !item || !partnerServiceEligibleForApplication(item, countryCode, businessType);
  });
  const requestedComplete = form.requestedServices.some((request) => request.requestedName.trim().length >= 2 && request.description.trim().length >= 10);

  function addDomainBlock(domainId: PartnerServiceDomainId | "") {
    if (!domainId) return;
    onActiveDomainIdsChange((current) => current.includes(domainId) ? current : [...current, domainId]);
  }

  function toggleService(service: PartnerServiceCatalogueItem) {
    onChange((current) => {
      const currentCodes = new Set(current.selectedServiceCodes);
      const removing = currentCodes.has(service.stableCode);
      if (removing) {
        const remainingCodes = current.selectedServiceCodes.filter((code) => code !== service.stableCode);
        const domainStillSelected = remainingCodes.some((code) => findPartnerCatalogueItemIn(serviceCatalogueItems, code)?.domain === service.domain);
        if (!domainStillSelected) {
          onActiveDomainIdsChange((domains) => domains.filter((domainId) => domainId !== service.domain));
        }
        return { selectedServiceCodes: remainingCodes };
      }
      return {
        selectedServiceCodes: [...current.selectedServiceCodes, service.stableCode],
      };
    });
  }

  function removeDomainGroup(domainId: PartnerServiceDomainId) {
    onRemoveSelectedServiceDomain(domainId);
  }

  function editDomainGroup(domainId: PartnerServiceDomainId) {
    onOpenSelectedServiceDomain(domainId);
  }

  function updateRequest(id: string, next: Partial<RequestedServiceForm>) {
    onChange((current) => ({
      requestedServices: current.requestedServices.map((request) => request.id === id ? { ...request, ...next } : request),
    }));
  }

  function addRequest() {
    onChange((current) => ({ requestPanelOpen: true, requestedServices: [...current.requestedServices, emptyRequestedService()] }));
  }

  function removeRequest(id: string) {
    onChange((current) => ({ requestedServices: current.requestedServices.filter((request) => request.id !== id) }));
  }

  return (
    <div data-application-active-step="services" className="rounded-2xl border border-white/10 bg-[#171a20] shadow-2xl">
      <div className="border-b border-white/10 p-5">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-[#fb923c]">Step 4</p>
        <h1 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">Services</h1>
        <p className="mt-2 text-sm font-semibold leading-6 text-slate-300">Choose the services your business provides through TPL GO.</p>
      </div>

      <div className="grid gap-5 p-5">
        {qaPreviewEnabled ? (
          <div className="flex flex-col gap-2 rounded-xl border border-[#f97316]/25 bg-[#f97316]/10 p-3 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-xs font-black uppercase tracking-[0.12em] text-[#fed7aa]">Preview example</span>
            <select
              data-qa-services-example="true"
              defaultValue=""
              onChange={(event) => {
                const selected = qaServicesExamples.find((example) => example.key === event.target.value);
                if (selected) {
                  onActiveDomainIdsChange(serviceDomainIdsFromCodes(selected.values.selectedServiceCodes, serviceCatalogueItems));
                  onChange(selected.values);
                }
              }}
              className="h-10 rounded-xl border border-[#f97316]/30 bg-[#11141a] px-3 text-sm font-bold text-white outline-none focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/25"
            >
              <option value="">Choose a sample service set</option>
              {qaServicesExamples.map((example) => <option key={example.key} value={example.key}>{example.label}</option>)}
            </select>
          </div>
        ) : null}

        <div className="xl:hidden">
          <SelectedServicesSummary
            form={form}
            headingId="selected-services-summary-mobile"
            countryCode={countryCode}
            businessType={businessType}
            serviceCatalogueItems={serviceCatalogueItems}
            serviceCatalog={serviceCatalog}
            legacyScopes={legacyScopes}
            onRemoveService={onRemoveSelectedService}
            onRemoveDomain={removeDomainGroup}
            onEditDomain={editDomainGroup}
          />
        </div>

        <section className="rounded-xl border border-white/10 bg-[#11141a] p-4" aria-labelledby="select-your-services-heading">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(260px,360px)] lg:items-end">
            <SectionHeading title="Select Your Services" detail="Start with a service area, then choose the exact services you provide." />
            <label className="grid min-w-0 gap-2">
              <span id="select-your-services-heading" className="text-xs font-black uppercase tracking-[0.1em] text-slate-300">Please select a service area</span>
              <select
                data-primary-service-dropdown="true"
                value=""
                onChange={(event) => addDomainBlock(event.target.value as PartnerServiceDomainId | "")}
                className="h-12 w-full appearance-auto rounded-xl border border-white/10 bg-[#0f1217] px-3 text-sm font-bold text-white outline-none focus:border-[#38bdf8] focus:ring-2 focus:ring-[#38bdf8]/25"
              >
                <option value="">Select a service area</option>
                {eligibleCatalog.map((category) => (
                  <option key={category.id} value={category.id}>{category.title}</option>
                ))}
              </select>
            </label>
          </div>
          {eligibleCatalog.length ? null : (
            <div className="mt-4 rounded-xl border border-amber-400/30 bg-amber-400/10 p-3 text-sm font-bold text-amber-100">
              {catalogueStatus === "loading" ? "Loading services..." : catalogueStatus === "error" ? "Service catalogue unavailable. Retry after the catalogue is available." : "No service areas are available for this country and business type yet."}
            </div>
          )}
        </section>

        <section className="rounded-xl border border-white/10 bg-[#11141a] p-4" aria-labelledby="available-services-heading">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 id="available-services-heading" className="text-sm font-black text-white">Available Services</h2>
              <p className="mt-1 text-xs font-semibold text-slate-400">Only services from your selected service area are shown here.</p>
            </div>
            <span className="w-fit rounded-full border border-[#38bdf8]/30 bg-[#38bdf8]/10 px-3 py-1 text-xs font-black text-[#bae6fd]">
              {activeDomains.length} service area{activeDomains.length === 1 ? "" : "s"} open
            </span>
          </div>

          <div className="mt-4 grid gap-4">
            {activeDomains.length ? activeDomains.map((category, index) => {
              const filter = serviceFilters[category.id] ?? "";
              const services = category.services.filter((service) => {
                const item = findPartnerCatalogueItemIn(serviceCatalogueItems, service.id);
                if (!item) return false;
                return matchesServiceSearch(`${item.name} ${item.shortDescription} ${item.aliases.join(" ")} ${category.title}`, filter);
              });
              const selectedCount = category.services.filter((service) => selectedCodes.has(service.id)).length;
              return (
                <div key={category.id} className="rounded-xl border border-white/10 bg-[#0f1217] p-3">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[#38bdf8]">Service area {index + 1}</p>
                      <h3 className="mt-1 text-sm font-black text-white">{category.title}</h3>
                      <p className="mt-1 text-xs font-semibold leading-5 text-slate-400">{category.description}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="rounded-full border border-[#f97316]/30 bg-[#f97316]/10 px-3 py-1 text-xs font-black text-[#fed7aa]">{selectedCount} selected</span>
                      <button type="button" onClick={() => removeDomainGroup(category.id)} className="rounded-lg border border-white/10 px-3 py-2 text-xs font-black text-slate-300 hover:border-[#f97316]/40 hover:text-[#fed7aa]">
                        Remove
                      </button>
                    </div>
                  </div>

                  <label className="relative mt-3 block">
                    <span className="sr-only">Search services in {category.title}</span>
                    <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} aria-hidden="true" />
                    <input
                      data-services-search="true"
                      value={filter}
                      onChange={(event) => setServiceFilters((current) => ({ ...current, [category.id]: event.target.value }))}
                      placeholder="Search services"
                      className="h-11 w-full rounded-xl border border-white/10 bg-[#151922] pl-10 pr-10 text-sm font-semibold text-white outline-none placeholder:text-slate-500 focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/25"
                    />
                    {filter ? (
                      <button type="button" onClick={() => setServiceFilters((current) => ({ ...current, [category.id]: "" }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white" aria-label={`Clear ${category.title} service search`}>
                        <X size={16} aria-hidden="true" />
                      </button>
                    ) : null}
                  </label>

                  <div className="mt-3 grid gap-2 md:grid-cols-2">
                    {services.length ? services.map((service) => {
                      const item = findPartnerCatalogueItemIn(serviceCatalogueItems, service.id);
                      if (!item) return null;
                      const selected = selectedCodes.has(item.stableCode);
                      return (
                        <button
                          key={item.stableCode}
                          type="button"
                          data-service-option={item.stableCode}
                          aria-pressed={selected}
                          onClick={() => toggleService(item)}
                          className={`min-h-[82px] rounded-xl border p-3 text-left transition focus:outline-none focus:ring-2 focus:ring-[#38bdf8]/35 ${selected ? "border-[#f97316]/70 bg-[#f97316]/12 shadow-[0_0_0_1px_rgba(249,115,22,0.22)]" : "border-white/10 bg-[#151922] hover:border-[#f97316]/35"}`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-sm font-black text-white">{item.name}</p>
                              <p className="mt-1 line-clamp-2 text-xs font-semibold leading-5 text-slate-400">{item.shortDescription}</p>
                              <p className="mt-2 text-[11px] font-black uppercase tracking-[0.1em] text-slate-500">{category.title}</p>
                            </div>
                            <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${selected ? "border-[#f97316] bg-[#f97316] text-white" : "border-white/20 text-transparent"}`}>
                              <Check size={13} aria-hidden="true" />
                            </span>
                          </div>
                        </button>
                      );
                    }) : (
                      <div className="rounded-xl border border-white/10 bg-[#151922] p-4 text-sm font-semibold text-slate-300 md:col-span-2">
                        No matching services in this service area.
                      </div>
                    )}
                  </div>
                </div>
              );
            }) : (
              <div className="rounded-xl border border-dashed border-white/15 bg-[#0f1217] p-4 text-sm font-semibold text-slate-300">
                Select a service area above to see available service options.
              </div>
            )}
          </div>
        </section>

        {selectedItems.length ? (
          <section className="rounded-xl border border-white/10 bg-[#11141a] p-4">
            <label className="grid max-w-xl gap-2">
              <span className="text-xs font-black uppercase tracking-[0.1em] text-slate-300">Add another service</span>
              <select
                data-add-service-dropdown="true"
                value=""
                onChange={(event) => addDomainBlock(event.target.value as PartnerServiceDomainId | "")}
                disabled={!remainingDomains.length}
                className="h-11 w-full appearance-auto rounded-xl border border-white/10 bg-[#0f1217] px-3 text-sm font-bold text-white outline-none disabled:cursor-not-allowed disabled:text-slate-500 focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/25"
              >
                <option value="">{remainingDomains.length ? "Select a service area" : "All eligible service areas are open"}</option>
                {remainingDomains.map((category) => (
                  <option key={category.id} value={category.id}>{category.title}</option>
                ))}
              </select>
            </label>
          </section>
        ) : null}

        <section className="rounded-xl border border-white/10 bg-[#11141a] p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <SectionHeading title="Can't Find Your Service?" detail="Tell us what you provide. This request does not publish or approve a new service automatically." />
            <button type="button" onClick={addRequest} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[#f97316]/40 bg-[#f97316]/10 px-3 text-xs font-black text-[#fed7aa] hover:border-[#f97316] focus:outline-none focus:ring-2 focus:ring-[#f97316]/30">
              <Plus size={15} aria-hidden="true" />
              Request another service
            </button>
          </div>
        </section>

        {staleScopes.length || selectedUnavailable.length ? (
          <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 p-3 text-xs font-bold leading-5 text-amber-100">
            Some saved services need attention because they are no longer available for new selection. They are preserved in your draft history and are not counted for completion.
          </div>
        ) : null}

        {form.requestPanelOpen || form.requestedServices.length ? (
          <section className="rounded-xl border border-white/10 bg-[#11141a] p-4">
            <div className="mt-4 grid gap-3">
              {(form.requestedServices.length ? form.requestedServices : [emptyRequestedService()]).map((request) => (
                <div key={request.id} className="rounded-xl border border-white/10 bg-[#0f1217] p-3">
                  <div className="grid gap-3 md:grid-cols-2">
                    <label className="grid min-w-0 gap-2">
                      <span className="text-xs font-black uppercase tracking-[0.1em] text-slate-300">Service Name</span>
                      <input data-requested-service-name="true" value={request.requestedName} onChange={(event) => updateRequest(request.id, { requestedName: event.target.value.slice(0, 120) })} className="h-11 w-full rounded-xl border border-white/10 bg-[#11141a] px-3 text-sm font-semibold text-white outline-none focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/25" />
                    </label>
                    <label className="grid min-w-0 gap-2">
                      <span className="text-xs font-black uppercase tracking-[0.1em] text-slate-300">Closest Domain <span className="text-slate-500">Optional</span></span>
                      <select value={request.closestDomain} onChange={(event) => updateRequest(request.id, { closestDomain: event.target.value as PartnerServiceDomainId | "" })} className="h-11 w-full rounded-xl border border-white/10 bg-[#11141a] px-3 text-sm font-semibold text-white outline-none focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/25">
                        <option value="">Not sure</option>
                        {serviceCatalog.map((category) => <option key={category.id} value={category.id}>{category.title}</option>)}
                      </select>
                    </label>
                    <label className="grid min-w-0 gap-2 md:col-span-2">
                      <span className="text-xs font-black uppercase tracking-[0.1em] text-slate-300">Short Description</span>
                      <textarea data-requested-service-description="true" value={request.description} onChange={(event) => updateRequest(request.id, { description: event.target.value.slice(0, 500) })} rows={3} className="w-full resize-y rounded-xl border border-white/10 bg-[#11141a] px-3 py-3 text-sm font-semibold text-white outline-none focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/25" />
                    </label>
                  </div>
                  <button type="button" onClick={() => removeRequest(request.id)} className="mt-3 text-xs font-black text-slate-400 hover:text-[#fed7aa]">Remove request</button>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <div className={`rounded-xl border p-3 text-sm font-bold ${canComplete ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200" : "border-[#f97316]/30 bg-[#f97316]/10 text-[#fed7aa]"}`}>
          {canComplete ? "Services are ready." : requestedComplete ? "Service request saved. Choose at least one available service to continue." : "Choose at least one service to continue."}
        </div>
      </div>
    </div>
  );
}

function SelectedServicesSummary({
  form,
  headingId,
  countryCode,
  businessType,
  serviceCatalogueItems,
  serviceCatalog,
  legacyScopes,
  onRemoveService,
  onRemoveDomain,
  onEditDomain,
}: {
  form: ServicesForm;
  headingId: string;
  countryCode: string;
  businessType: string;
  serviceCatalogueItems: PartnerServiceCatalogueItem[];
  serviceCatalog: PartnerServiceCategory[];
  legacyScopes: PartnerOrganizationBundle["serviceScopes"];
  onRemoveService: (service: PartnerServiceCatalogueItem) => void;
  onRemoveDomain: (domainId: PartnerServiceDomainId) => void;
  onEditDomain: (domainId: PartnerServiceDomainId) => void;
}) {
  const selectedItems = form.selectedServiceCodes.map((code) => findPartnerCatalogueItemIn(serviceCatalogueItems, code)).filter(Boolean) as PartnerServiceCatalogueItem[];
  const selectedDomainIds = serviceDomainIdsFromCodes(form.selectedServiceCodes, serviceCatalogueItems);
  const selectedItemsByDomain = selectedDomainIds.map((domainId) => ({
    domainId,
    title: domainTitleFor(domainId, serviceCatalog),
    items: selectedItems.filter((item) => item.domain === domainId),
  }));
  const selectedUnavailable = selectedItems.filter((item) => !partnerServiceEligibleForApplication(item, countryCode, businessType));
  const staleScopes = legacyScopes.filter((scope) => {
    if (scope.status === "disabled") return false;
    const item = findPartnerCatalogueItemIn(serviceCatalogueItems, scope.serviceCode);
    return !item || !partnerServiceEligibleForApplication(item, countryCode, businessType);
  });

  return (
    <section className="min-w-0 rounded-xl border border-white/10 bg-[#11141a] p-4 xl:border-0 xl:bg-transparent xl:p-0" aria-labelledby={headingId} data-selected-services-summary="true">
      <div className="flex flex-col gap-3">
        <div>
          <h2 id={headingId} className="text-sm font-black text-white">Selected Services Summary</h2>
          <p className="mt-1 text-xs font-semibold text-slate-400">Your selected services are grouped by service area.</p>
        </div>
        <span className="w-fit rounded-full border border-[#f97316]/30 bg-[#f97316]/10 px-3 py-1 text-xs font-black text-[#fed7aa]" aria-label={`${selectedItems.length} selected services`}>
          {selectedItems.length} selected
        </span>
      </div>

      <div className="mt-4 grid gap-3">
        {selectedItemsByDomain.length ? selectedItemsByDomain.map((group) => (
          <div key={group.domainId} className="rounded-xl border border-white/10 bg-[#0f1217] p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="text-sm font-black text-white">{group.title}</h3>
                <p className="mt-1 text-xs font-semibold text-slate-500">{group.items.length} selected</p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button type="button" onClick={() => onEditDomain(group.domainId)} className="rounded-lg border border-[#38bdf8]/30 bg-[#38bdf8]/10 px-2 py-1 text-[11px] font-black text-[#bae6fd] focus:outline-none focus:ring-2 focus:ring-[#38bdf8]/35">
                  Edit
                </button>
                <button type="button" onClick={() => onRemoveDomain(group.domainId)} className="rounded-lg border border-white/10 px-2 py-1 text-[11px] font-black text-slate-300 hover:border-[#f97316]/40 hover:text-[#fed7aa] focus:outline-none focus:ring-2 focus:ring-[#f97316]/30">
                  Remove
                </button>
              </div>
            </div>
            <div className="mt-3 grid gap-2">
              {group.items.map((item) => (
                <div key={item.stableCode} data-selected-service={item.stableCode} className="grid grid-cols-[1fr_auto] items-center gap-2 rounded-lg border border-white/10 bg-[#151922] px-3 py-2">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-black text-white">{item.name}</p>
                    <p className="truncate text-[11px] font-bold text-slate-500">{group.title}</p>
                  </div>
                  <button type="button" onClick={() => onRemoveService(item)} aria-label={`Remove ${item.name}`} className="rounded-md p-1 text-slate-400 hover:bg-white/10 hover:text-[#fed7aa] focus:outline-none focus:ring-2 focus:ring-[#f97316]/30">
                    <X size={14} aria-hidden="true" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )) : (
          <div className="rounded-xl border border-dashed border-white/15 bg-[#0f1217] p-4 text-sm font-semibold text-slate-400">
            No services selected yet.
          </div>
        )}
      </div>

      {staleScopes.length || selectedUnavailable.length ? (
        <div className="mt-4 rounded-xl border border-amber-400/30 bg-amber-400/10 p-3 text-xs font-bold leading-5 text-amber-100">
          Some saved services need attention because they are no longer available for new selection. They are preserved in your draft history and are not counted for completion.
        </div>
      ) : null}
    </section>
  );
}

function SectionHeading({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="flex flex-col gap-1">
      <h2 className="text-sm font-black text-white">{title}</h2>
      <p className="text-xs font-semibold text-slate-400">{detail}</p>
    </div>
  );
}

function LocationFields({
  prefix,
  value,
  regionLabel,
  onChange,
}: {
  prefix: string;
  value: LocationAddressForm;
  regionLabel: string;
  onChange: (next: Partial<LocationAddressForm>) => void;
}) {
  return (
    <div className="mt-4 grid gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <CountrySelect value={value.countryCode} onChange={(country) => onChange({ countryCode: country.countryCode, country: country.displayName })} />
        <label className="grid min-w-0 gap-2">
          <span className="text-xs font-black uppercase tracking-[0.1em] text-slate-300">Location Verification</span>
          <span className="inline-flex h-11 items-center rounded-xl border border-white/10 bg-[#0f1217] px-3 text-sm font-bold text-slate-300">{value.verificationStatus || "Not verified"}</span>
        </label>
      </div>
      <label className="grid min-w-0 gap-2">
        <span className="text-xs font-black uppercase tracking-[0.1em] text-slate-300">Address Line 1</span>
        <input name={`${prefix}AddressLine1`} value={value.addressLine1} onChange={(event) => onChange({ addressLine1: event.target.value.slice(0, 160) })} className="h-11 w-full min-w-0 rounded-xl border border-white/10 bg-[#0f1217] px-3 text-sm font-semibold text-white outline-none focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/25" />
      </label>
      <label className="grid min-w-0 gap-2">
        <span className="text-xs font-black uppercase tracking-[0.1em] text-slate-300">Address Line 2 <span className="text-slate-500">Optional</span></span>
        <input name={`${prefix}AddressLine2`} value={value.addressLine2} onChange={(event) => onChange({ addressLine2: event.target.value.slice(0, 160) })} className="h-11 w-full min-w-0 rounded-xl border border-white/10 bg-[#0f1217] px-3 text-sm font-semibold text-white outline-none focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/25" />
      </label>
      <div className="grid gap-4 md:grid-cols-3">
        <label className="grid min-w-0 gap-2">
          <span className="text-xs font-black uppercase tracking-[0.1em] text-slate-300">City / Town</span>
          <input name={`${prefix}City`} value={value.city} onChange={(event) => onChange({ city: event.target.value.slice(0, 80) })} className="h-11 w-full min-w-0 rounded-xl border border-white/10 bg-[#0f1217] px-3 text-sm font-semibold text-white outline-none focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/25" />
        </label>
        <label className="grid min-w-0 gap-2">
          <span className="text-xs font-black uppercase tracking-[0.1em] text-slate-300">{regionLabel}</span>
          <input name={`${prefix}StateRegion`} value={value.stateRegion} onChange={(event) => onChange({ stateRegion: event.target.value.slice(0, 80) })} className="h-11 w-full min-w-0 rounded-xl border border-white/10 bg-[#0f1217] px-3 text-sm font-semibold text-white outline-none focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/25" />
        </label>
        <label className="grid min-w-0 gap-2">
          <span className="text-xs font-black uppercase tracking-[0.1em] text-slate-300">{postalLabelFor(value.countryCode)}</span>
          <input name={`${prefix}PostalCode`} value={value.postalCode} onChange={(event) => onChange({ postalCode: event.target.value.slice(0, 24) })} className="h-11 w-full min-w-0 rounded-xl border border-white/10 bg-[#0f1217] px-3 text-sm font-semibold text-white outline-none focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/25" />
        </label>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <label className="grid min-w-0 gap-2 md:col-span-3">
          <span className="text-xs font-black uppercase tracking-[0.1em] text-slate-300">Landmark <span className="text-slate-500">Optional</span></span>
          <input name={`${prefix}Landmark`} value={value.landmark} onChange={(event) => onChange({ landmark: event.target.value.slice(0, 120) })} className="h-11 w-full min-w-0 rounded-xl border border-white/10 bg-[#0f1217] px-3 text-sm font-semibold text-white outline-none focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/25" />
        </label>
        <input type="hidden" name={`${prefix}Latitude`} value={value.latitude} readOnly />
        <input type="hidden" name={`${prefix}Longitude`} value={value.longitude} readOnly />
      </div>
    </div>
  );
}

function CountrySelect({ value, onChange }: { value: string; onChange: (country: CountryMasterEntry) => void }) {
  return (
    <label className="grid min-w-0 gap-2">
      <span className="text-xs font-black uppercase tracking-[0.1em] text-slate-300">Country</span>
      <select
        name="country"
        value={value}
        onChange={(event) => {
          const selected = countryOptions.find((country) => country.countryCode === event.target.value) ?? countryOptions[0]!;
          onChange(selected);
        }}
        className="h-11 w-full min-w-0 rounded-xl border border-white/10 bg-[#0f1217] px-3 text-sm font-semibold text-white outline-none focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/25"
      >
        {countryOptions.map((country) => <option key={country.countryCode} value={country.countryCode}>{country.flag} {country.displayName}</option>)}
      </select>
    </label>
  );
}

function StepNavigator({
  activeStep,
  readModel,
  qaPreviewEnabled,
  accountStepOverride,
  businessStepOverride,
  locationStepOverride,
  servicesStepOverride,
  onSelect,
}: {
  activeStep: WorkspaceStepId;
  readModel: ReturnType<typeof buildPartnerApplicationCenterReadModel>;
  qaPreviewEnabled: boolean;
  accountStepOverride?: PartnerApplicationStepStatus;
  businessStepOverride?: PartnerApplicationStepStatus;
  locationStepOverride?: PartnerApplicationStepStatus;
  servicesStepOverride?: PartnerApplicationStepStatus;
  onSelect: (step: WorkspaceStepId) => void;
}) {
  return (
    <aside className="hidden min-w-0 lg:block">
      <div className="sticky top-28 rounded-2xl border border-white/10 bg-[#171a20] p-4 shadow-2xl">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">Application Steps</p>
        <div className="mt-4 grid gap-2">
          {workspaceSteps.map((step) => {
            const modelStep = readModel.steps.find((item) => item.id === step.id);
            const status = displayedStepStatus(step.id, activeStep, modelStep?.status ?? "locked", qaPreviewEnabled, accountStepOverride, businessStepOverride, locationStepOverride, servicesStepOverride);
            const current = activeStep === step.id;
            const Icon = step.icon;
            const enabled = qaPreviewEnabled || Boolean(modelStep?.enabled);
            return (
              <button
                key={step.id}
                data-application-step-button={step.id}
                type="button"
                onClick={() => enabled ? onSelect(step.id) : undefined}
                disabled={!enabled}
                className={`relative flex min-h-14 w-full items-center gap-3 overflow-hidden rounded-xl border px-3 py-2 text-left transition ${
                  current ? "border-[#f97316]/45 bg-[#211a13] shadow-[0_10px_26px_rgba(0,0,0,0.24)]" : "border-white/10 bg-[#11141a] hover:border-white/20"
                } disabled:cursor-not-allowed disabled:opacity-55`}
              >
                {current ? <span className="absolute left-0 top-0 h-full w-1 bg-[#f97316]" /> : null}
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${status === "completed" ? "bg-emerald-500 text-white" : current ? "bg-[#f97316] text-white" : "bg-white/8 text-slate-300"}`}>
                  {status === "completed" ? <Check size={15} aria-hidden="true" /> : <Icon size={15} aria-hidden="true" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span data-step-title={step.id} className="block truncate text-sm font-black text-white">{step.number}. {step.title}</span>
                  <span className={`block text-xs font-semibold ${current ? "text-[#fb923c]" : status === "completed" ? "text-emerald-300" : status === "needs-attention" ? "text-amber-300" : "text-slate-400"}`}>
                    {humanStatus(status, current)}{status === "completed" && !isSubmittedFinal(readModel) ? " · Edit" : ""}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}

function MobileStepSelector({
  activeStep,
  readModel,
  qaPreviewEnabled,
  accountStepOverride,
  businessStepOverride,
  locationStepOverride,
  servicesStepOverride,
  onSelect,
}: {
  activeStep: WorkspaceStepId;
  readModel: ReturnType<typeof buildPartnerApplicationCenterReadModel>;
  qaPreviewEnabled: boolean;
  accountStepOverride?: PartnerApplicationStepStatus;
  businessStepOverride?: PartnerApplicationStepStatus;
  locationStepOverride?: PartnerApplicationStepStatus;
  servicesStepOverride?: PartnerApplicationStepStatus;
  onSelect: (step: WorkspaceStepId) => void;
}) {
  return (
    <div className="mb-4 rounded-xl border border-white/10 bg-[#171a20] p-3 lg:hidden">
      <label className="grid gap-2 text-xs font-black uppercase tracking-[0.12em] text-slate-400">
        Application step
        <select
          value={activeStep}
          onChange={(event) => onSelect(event.target.value as WorkspaceStepId)}
          className="h-10 rounded-lg border border-white/10 bg-[#0f1217] px-3 text-sm font-black normal-case tracking-normal text-white outline-none focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/25"
        >
          {workspaceSteps.map((step) => {
            const modelStep = readModel.steps.find((item) => item.id === step.id);
            const enabled = qaPreviewEnabled || Boolean(modelStep?.enabled);
            const status = displayedStepStatus(step.id, activeStep, modelStep?.status ?? "locked", qaPreviewEnabled, accountStepOverride, businessStepOverride, locationStepOverride, servicesStepOverride);
            return (
              <option key={step.id} value={step.id} disabled={!enabled}>
                {step.number}. {step.title} - {humanStatus(status, activeStep === step.id)}
              </option>
            );
          })}
        </select>
      </label>
    </div>
  );
}

function TopProgress({
  activeStep,
  readModel,
  qaPreviewEnabled,
  accountStepOverride,
  businessStepOverride,
  locationStepOverride,
  servicesStepOverride,
}: {
  activeStep: WorkspaceStepId;
  readModel: ReturnType<typeof buildPartnerApplicationCenterReadModel>;
  qaPreviewEnabled: boolean;
  accountStepOverride?: PartnerApplicationStepStatus;
  businessStepOverride?: PartnerApplicationStepStatus;
  locationStepOverride?: PartnerApplicationStepStatus;
  servicesStepOverride?: PartnerApplicationStepStatus;
}) {
  const [stepsExpanded, setStepsExpanded] = useState(false);
  const activeIndex = Math.max(0, workspaceSteps.findIndex((step) => step.id === activeStep));
  const progress = Math.round(((activeIndex + 1) / workspaceSteps.length) * 100);
  const activeStepMeta = workspaceSteps[activeIndex] ?? workspaceSteps[0]!;
  const stepVisual = (status: PartnerApplicationStepStatus, current: boolean) => {
    if (status === "completed") return { node: "bg-emerald-500 text-white", segment: "border-emerald-500/35 bg-emerald-500/10 text-emerald-100", connector: "text-emerald-300", icon: "check" as const };
    if (status === "needs-attention") return { node: "bg-red-500 text-white", segment: "border-red-500/35 bg-red-500/10 text-red-100", connector: "text-red-300", icon: "alert" as const };
    if (current) return { node: "bg-[#f97316] text-white", segment: "border-[#f97316]/45 bg-[#f97316]/15 text-[#fed7aa]", connector: "text-[#f97316]", icon: "number" as const };
    if (status === "under-review") return { node: "bg-amber-400 text-[#11141a]", segment: "border-amber-400/35 bg-amber-400/10 text-amber-100", connector: "text-amber-300", icon: "number" as const };
    if (status === "in-progress") return { node: "bg-[#38bdf8] text-[#07111a]", segment: "border-[#38bdf8]/35 bg-[#38bdf8]/10 text-sky-100", connector: "text-[#38bdf8]", icon: "number" as const };
    if (status === "not-started") return { node: "bg-[#2563eb] text-white", segment: "border-[#38bdf8]/25 bg-[#38bdf8]/8 text-slate-200", connector: "text-[#38bdf8]/70", icon: "number" as const };
    return { node: "bg-white/10 text-slate-400", segment: "border-white/10 bg-white/[0.03] text-slate-400", connector: "text-slate-600", icon: "number" as const };
  };
  return (
    <div className="border-t border-white/5 px-4 py-2">
      <div className="mx-auto max-w-7xl">
        <div className="lg:hidden">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-[#fb923c]">Step {activeStepMeta.number} of {workspaceSteps.length}</p>
              <p className="mt-0.5 truncate text-sm font-black text-white">{activeStepMeta.title}</p>
            </div>
            <button
              type="button"
              onClick={() => setStepsExpanded((value) => !value)}
              aria-expanded={stepsExpanded}
              className="shrink-0 rounded-lg border border-white/10 px-3 py-2 text-xs font-black text-slate-200 outline-none focus-visible:ring-2 focus-visible:ring-[#38bdf8]"
            >
              View all steps
            </button>
          </div>
          <div className="mt-2 h-2 rounded-full bg-white/10" aria-label={`Step ${activeStepMeta.number} of ${workspaceSteps.length}`}>
            <div className="h-full rounded-full bg-[linear-gradient(135deg,#38bdf8,#f97316)] transition-[width] duration-300 motion-reduce:transition-none" style={{ width: `${progress}%` }} />
          </div>
          {stepsExpanded ? (
            <ol className="mt-3 grid gap-2 rounded-xl border border-white/10 bg-[#11141a] p-3">
              {workspaceSteps.map((step) => {
                const modelStatus = readModel.steps.find((item) => item.id === step.id)?.status ?? "locked";
                const status = displayedStepStatus(step.id, activeStep, modelStatus, qaPreviewEnabled, accountStepOverride, businessStepOverride, locationStepOverride, servicesStepOverride);
                const current = activeStep === step.id;
                const visual = stepVisual(status, current);
                return (
                  <li key={step.id} data-mobile-application-progress-step={step.id} aria-current={current ? "step" : undefined} className="flex items-center gap-3 rounded-lg border border-white/10 bg-[#0f1217] p-2">
                    <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-black ${visual.node}`}>
                      {visual.icon === "check" ? <Check size={12} aria-hidden="true" /> : visual.icon === "alert" ? <X size={12} aria-hidden="true" /> : step.number}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-xs font-black text-white">{step.number}. {step.title}</span>
                      <span className="block text-[11px] font-semibold text-slate-400">{humanStatus(status, current)}</span>
                    </span>
                  </li>
                );
              })}
            </ol>
          ) : null}
        </div>
        <ol className="hidden items-center gap-1 lg:flex" aria-label="Application progress">
        {workspaceSteps.map((step) => {
          const modelStatus = readModel.steps.find((item) => item.id === step.id)?.status ?? "locked";
          const status = displayedStepStatus(step.id, activeStep, modelStatus, qaPreviewEnabled, accountStepOverride, businessStepOverride, locationStepOverride, servicesStepOverride);
          const current = activeStep === step.id;
          const visual = stepVisual(status, current);
          return (
            <li key={step.id} className="flex min-w-0 flex-1 items-center gap-1">
              <div
                data-application-progress-step={step.id}
                aria-current={current ? "step" : undefined}
                aria-label={`${step.title}: ${humanStatus(status, current)}`}
                title={`${step.title}: ${humanStatus(status, current)}`}
                className={`flex h-9 min-w-0 flex-1 items-center gap-2 rounded-xl border px-2 transition-colors motion-reduce:transition-none ${visual.segment}`}
              >
                <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-black ${visual.node}`}>
                  {visual.icon === "check" ? <Check size={12} aria-hidden="true" /> : visual.icon === "alert" ? <X size={12} aria-hidden="true" /> : step.number}
                </span>
                <span className="truncate text-[11px] font-black">{step.shortTitle}</span>
              </div>
              {step.number < workspaceSteps.length ? <ArrowRight className={`shrink-0 ${visual.connector}`} size={14} aria-hidden="true" /> : null}
            </li>
          );
        })}
        </ol>
      </div>
    </div>
  );
}

function HelpPanel({ activeStep, servicesSummary, verificationSummary }: { activeStep: WorkspaceStepId; servicesSummary?: ReactNode; verificationSummary?: ReactNode }) {
  return (
    <aside className="hidden xl:block">
      <div className="sticky top-28 rounded-2xl border border-white/10 bg-[#171a20] p-5 shadow-2xl">
        {activeStep === "services" && servicesSummary ? (
          servicesSummary
        ) : activeStep === "documents_compliance" && verificationSummary ? (
          verificationSummary
        ) : (
          <>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f97316]/12 text-[#fb923c]">
              <ShieldCheck size={19} aria-hidden="true" />
            </div>
            {activeStep === "account_contact" ? (
          <>
            <h2 className="mt-4 text-lg font-black">Why we need this</h2>
            <ul className="mt-3 grid gap-2 text-sm font-semibold leading-6 text-slate-300">
              <li>We use these details to contact you about your application.</li>
              <li>Verified contact details help protect your Partner account.</li>
            </ul>
            <h3 className="mt-5 text-sm font-black text-white">Tips</h3>
            <ul className="mt-2 grid gap-2 text-sm font-semibold leading-6 text-slate-400">
              <li>Use a mobile number you can access.</li>
              <li>Use an email address you check regularly.</li>
            </ul>
          </>
        ) : activeStep === "business_identity" ? (
          <>
            <h2 className="mt-4 text-lg font-black">Why we need this</h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-300">
              We use your legal business details to review your Partner application and match your documents.
            </p>
            <h3 className="mt-5 text-sm font-black text-white">Tips</h3>
            <ul className="mt-2 grid gap-2 text-sm font-semibold leading-6 text-slate-400">
              <li>Use the legal name shown on your registration documents.</li>
              <li>Your display name can be different from your legal name.</li>
            </ul>
          </>
        ) : activeStep === "business_location" ? (
          <>
            <h2 className="mt-4 text-lg font-black">Why we need this</h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-300">
              We use your location details to understand where your business operates and where customers can use your services.
            </p>
            <h3 className="mt-5 text-sm font-black text-white">Tips</h3>
            <ul className="mt-2 grid gap-2 text-sm font-semibold leading-6 text-slate-400">
              <li>Use your main business location.</li>
              <li>Add the areas where you actually provide services.</li>
              <li>You can manage additional branches later.</li>
            </ul>
          </>
        ) : (
          <>
            <h2 className="mt-4 text-lg font-black">Coming next</h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-300">
              This step opens in the next approved development batch.
            </p>
          </>
            )}
          </>
        )}
      </div>
    </aside>
  );
}

function QaPreviewBar({ selectedState, onChange, onReset }: { selectedState: PartnerQaPreviewState; onChange: (state: PartnerQaPreviewState) => void; onReset: () => void }) {
  return (
    <div className="border-b border-[#f97316]/25 bg-[#171a20] px-4 py-3" data-partner-qa-current-state={selectedState}>
      <div className="mx-auto flex max-w-7xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-[#f97316]/40 bg-[#f97316]/12 px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.12em] text-[#fed7aa]">QA</span>
          <span className="text-sm font-black text-white">Preview Application</span>
        </div>
        <div className="grid gap-2 sm:grid-cols-[240px_auto_auto]">
          <select data-partner-qa-state-select="true" value={selectedState} onChange={(event) => onChange(event.target.value as PartnerQaPreviewState)} className="h-9 rounded-lg border border-[#f97316]/50 bg-[#0f1217] px-3 text-xs font-black text-white">
            {partnerQaPreviewStates.map((state) => <option key={state.id} value={state.id}>Preview as: {state.label}</option>)}
          </select>
          <button type="button" onClick={onReset} className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-white/10 px-3 text-xs font-black text-slate-200">
            <RotateCcw size={14} aria-hidden="true" />
            Reset Preview Data
          </button>
          <Link data-partner-qa-exit="true" href="/partner-preview" className="inline-flex h-9 items-center justify-center rounded-lg border border-white/10 px-3 text-xs font-black text-slate-200">
            Exit Preview
          </Link>
        </div>
      </div>
    </div>
  );
}

function WorkspaceToast({ tone, text, onDismiss }: { tone: "success" | "info" | "warning" | "error"; text: string; onDismiss: () => void }) {
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const timer = window.setTimeout(() => closeButtonRef.current?.focus(), 0);
    return () => {
      window.clearTimeout(timer);
      document.body.style.overflow = previousOverflow;
    };
  }, []);
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onDismiss();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onDismiss]);
  const toneClass = tone === "success" ? "border-emerald-500/40 text-emerald-100" : tone === "error" ? "border-red-500/40 text-red-100" : tone === "warning" ? "border-[#f97316]/50 text-[#fed7aa]" : "border-sky-500/40 text-sky-100";
  if (typeof document === "undefined") return null;
  return createPortal(
    <div data-save-draft-modal-layer="true" className="fixed inset-0 z-[80] flex items-center justify-center bg-black/55 px-4 py-6 backdrop-blur-sm" aria-modal="true" role="dialog" aria-label="Application message">
      <div role="status" aria-live="polite" className={`w-[min(92vw,420px)] rounded-xl border bg-[#171a20] p-4 shadow-2xl ${toneClass}`}>
        <div className="flex items-start gap-3">
          <span className="mt-0.5 h-5 w-1 rounded-full bg-[#f97316]" />
          <p className="min-w-0 flex-1 text-sm font-bold">{text}</p>
          <button ref={closeButtonRef} type="button" onClick={onDismiss} className="rounded-md px-2 py-1 text-xs font-black text-slate-300 outline-none ring-offset-2 ring-offset-[#171a20] focus-visible:ring-2 focus-visible:ring-[#38bdf8]">Dismiss</button>
        </div>
      </div>
    </div>,
    document.body
  );
}

function VerificationComplianceStep({
  bundle,
  selectedServiceCodes,
  serviceCatalogueItems,
  qaPreviewEnabled,
  uploadingRequirementId,
  onUploadEvidence,
  onEditSelectedServices,
  focusSectionId,
  onFocusSectionHandled,
}: {
  bundle: PartnerOrganizationBundle | null;
  selectedServiceCodes: string[];
  serviceCatalogueItems: PartnerServiceCatalogueItem[];
  qaPreviewEnabled: boolean;
  uploadingRequirementId: string | null;
  onUploadEvidence: (requirement: PartnerRequirement, file: File) => void;
  onEditSelectedServices: () => void;
  focusSectionId?: string | null;
  onFocusSectionHandled?: () => void;
}) {
  const requirements = bundle?.requirements ?? (qaPreviewEnabled ? previewRequirementsForSelectedServices(selectedServiceCodes, serviceCatalogueItems) : []);
  const selectedServices = selectedVerificationServices(selectedServiceCodes, bundle?.serviceScopes ?? [], serviceCatalogueItems);
  const requirementGroups = groupPartnerRequirements(requirements, bundle?.serviceScopes ?? [], serviceCatalogueItems, selectedServices);
  const sectionButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const [selectedSectionId, setSelectedSectionId] = useState<string>(requirementGroups[0]?.id ?? "business-requirements");
  const [sectionRequirementIndexById, setSectionRequirementIndexById] = useState<Record<string, number>>({});
  const [selectedServicesExpanded, setSelectedServicesExpanded] = useState<boolean>(false);
  const [selectedFilenames, setSelectedFilenames] = useState<Record<string, string>>({});
  const [fileUploadMessages, setFileUploadMessages] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!focusSectionId) return;
    const sectionToFocus = requirementGroups.find((group) => group.id === focusSectionId);
    if (!sectionToFocus) return;
    requestAnimationFrame(() => {
      setSelectedSectionId(focusSectionId);
      setSectionRequirementIndexById((current) => {
        const sectionIndex = current[focusSectionId];
        if (sectionIndex !== undefined && sectionToFocus.requirements[sectionIndex]) return current;
        return { ...current, [focusSectionId]: getFirstOutstandingRequirementIndex(sectionToFocus.requirements) };
      });
      const sectionButton = sectionButtonRefs.current[focusSectionId];
      sectionButton?.scrollIntoView({ behavior: "smooth", block: "start" });
      sectionButton?.focus({ preventScroll: true });
      onFocusSectionHandled?.();
    });
  }, [focusSectionId, onFocusSectionHandled, requirementGroups]);

  const selectedSection = requirementGroups.find((group) => group.id === selectedSectionId) ?? requirementGroups[0];
  const requiredNow = requirements.filter((item) => requirementStage(item) === "REQUIRED_NOW");
  const readyRequired = requiredNow.filter((item) => requirementReadyForUiProgression(item.status)).length;
  const requiredChecksRemaining = Math.max(requiredNow.length - readyRequired, 0);
  const requiredNowProgress = requiredNow.length ? Math.round((readyRequired / requiredNow.length) * 100) : 0;

  const beforeActivation = requirements.filter((item) => requirementStage(item) === "BEFORE_ACTIVATION");
  const beforeActivationRemaining = Math.max(beforeActivation.length - beforeActivation.filter((item) => requirementReadyForUiProgression(item.status)).length, 0);

  const getSectionRequirementIndex = (group: VerificationRequirementGroup) => {
    if (!group.requirements.length) return 0;
    const current = sectionRequirementIndexById[group.id];
    if (current === undefined) return getFirstOutstandingRequirementIndex(group.requirements);
    return Math.max(0, Math.min(group.requirements.length - 1, current));
  };


  const isRequiredNowComplete = requiredNow.length === 0 || requiredChecksRemaining === 0;
  const hasStartedVerification = readyRequired > 0;
  const primaryVerificationAction = isRequiredNowComplete
    ? "Continue to Payout & Tax"
    : hasStartedVerification
      ? "Continue verification"
      : "Start verification";
  const isChecklistReady = requirements.length > 0;
  const selectedServicesSummary = getServicesHeadline(selectedServices);

  const updateSectionSelection = (nextSectionId: string) => {
    setSelectedSectionId(nextSectionId);
    setSectionRequirementIndexById((current) => {
      const requirementsForSection = requirementGroups.find((group) => group.id === nextSectionId)?.requirements ?? [];
      if (current[nextSectionId] !== undefined && requirementsForSection[current[nextSectionId]]) return current;
      return { ...current, [nextSectionId]: getFirstOutstandingRequirementIndex(requirementsForSection) };
    });
  };

  const setRequirementIndex = (groupId: string, nextIndex: number) => {
    setSectionRequirementIndexById((current) => ({ ...current, [groupId]: Math.max(0, nextIndex) }));
  };

  const handleFileSelection = (requirement: PartnerRequirement, file: File) => {
    const validationMessage = validateVerificationFile(file);
    if (validationMessage) {
      setFileUploadMessages((current) => ({ ...current, [requirement.id]: validationMessage }));
      return;
    }
    setFileUploadMessages((current) => ({ ...current, [requirement.id]: "" }));
    setSelectedFilenames((current) => ({ ...current, [requirement.id]: file.name }));
    onUploadEvidence(requirement, file);
  };

  const statusForRequirement = (requirement: PartnerRequirement) =>
    requirement.status === "VERIFIED" ? "Ready for review" : verificationStatusLabel(requirement.status);

  const statusLabelForProgress = (group: VerificationRequirementGroup) => {
    const requiredNowCount = group.requirements.filter((requirement) => requirementStage(requirement) === "REQUIRED_NOW").length;
    const requiredNowReadyCount = group.requirements.filter((requirement) => requirementStage(requirement) === "REQUIRED_NOW" && requirementReadyForUiProgression(requirement.status)).length;
    if (requiredNowCount > 0) return `${requiredNowReadyCount}/${requiredNowCount} required`;
    if (group.requirements.length === 0) return "No checks";
    return `${group.requirements.length} checks`;
  };
  const nextActionGroupId = requirementGroups.find((group) =>
    group.requirements.some((requirement) => requirementStage(requirement) === "REQUIRED_NOW" && !requirementReadyForUiProgression(requirement.status))
  )?.id ?? requirementGroups.find((group) => group.requirements.some((requirement) => !requirementReadyForUiProgression(requirement.status)))?.id;

  if (!isChecklistReady && !qaPreviewEnabled) {
    return (
      <div data-application-active-step="documents_compliance" className="rounded-2xl border border-white/10 bg-[#171a20] shadow-2xl">
        <div className="border-b border-white/10 p-5">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#fb923c]">Step 5</p>
          <h1 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">Verification & Compliance</h1>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-300">
            We couldn&apos;t load your verification checklist.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-3 inline-flex h-9 items-center justify-center rounded-lg border border-[#f97316]/50 px-3 text-xs font-black text-[#fed7aa] outline-none focus-visible:ring-2 focus-visible:ring-[#38bdf8]"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!isChecklistReady && qaPreviewEnabled) {
    return (
      <div data-application-active-step="documents_compliance" className="rounded-2xl border border-white/10 bg-[#171a20] shadow-2xl">
        <div className="border-b border-white/10 p-5">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#fb923c]">Step 5</p>
          <h1 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">Verification & Compliance</h1>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-300">
            We&apos;re confirming what is needed for this service.
          </p>
          <p className="mt-1 text-xs font-semibold text-[#f97316]">You can save your application and return later.</p>
        </div>
      </div>
    );
  }

  if (!requirementGroups.length) {
    return (
      <div data-application-active-step="documents_compliance" className="rounded-2xl border border-white/10 bg-[#171a20] shadow-2xl">
        <div className="border-b border-white/10 p-5">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#fb923c]">Step 5</p>
          <h1 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">Verification & Compliance</h1>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-300">
            We&apos;re confirming what is needed for this service.
          </p>
          <p className="mt-1 text-sm font-semibold leading-6 text-slate-200">
            You can save your application and return later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div data-application-active-step="documents_compliance" className="rounded-2xl border border-white/10 bg-[#171a20] shadow-2xl">
      <div className="border-b border-white/10 p-5">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-[#fb923c]">Step 5</p>
        <h1 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">Verification & Compliance</h1>
        <p className="mt-2 text-sm font-semibold leading-6 text-slate-300">
          Complete the checks needed for your business and selected services.
        </p>
        <p className="mt-2 text-sm font-black text-[#fed7aa]">
          {readyRequired} of {requiredNow.length} required checks completed
        </p>
        <div className="mt-2 h-2.5 w-full rounded-full bg-white/10">
          <div className="h-full rounded-full bg-[linear-gradient(135deg,#38bdf8,#22c55e)] transition-[width] duration-300" style={{ width: `${requiredNowProgress}%` }} />
        </div>
      </div>

      <div className="p-5">
        <div className="grid gap-4">
          {qaPreviewEnabled ? (
            <div className="rounded-lg border border-[#f97316]/30 bg-[#f97316]/10 p-2 text-xs font-black leading-5 text-[#fed7aa]">
              Preview example — Fictional data only. No documents are uploaded or verified.
            </div>
          ) : null}

          <section className="rounded-xl border border-white/10 bg-[#11141a] p-3" aria-labelledby="selected-verification-services-heading">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <h2 id="selected-verification-services-heading" className="text-sm font-black text-white">Your selected services</h2>
                <p className="mt-1 break-words text-sm font-semibold leading-5 text-slate-300">{selectedServicesSummary}</p>
              </div>
              <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={() => setSelectedServicesExpanded((value) => !value)}
                  className="inline-flex h-10 items-center justify-center rounded-xl border border-white/10 px-3 text-xs font-black text-slate-200 outline-none focus-visible:ring-2 focus-visible:ring-[#38bdf8]"
                  aria-expanded={selectedServicesExpanded}
                >
                  View services
                </button>
                <button
                  type="button"
                  onClick={onEditSelectedServices}
                  className="inline-flex h-10 items-center justify-center rounded-xl border border-[#f97316]/40 px-3 text-xs font-black text-[#fed7aa] outline-none focus-visible:ring-2 focus-visible:ring-[#38bdf8]"
                >
                  Edit
                </button>
              </div>
            </div>
            {selectedServices.length <= 2 || selectedServicesExpanded ? (
              <ul className="mt-4 space-y-2">
                {selectedServices.length ? selectedServices.map((service) => (
                  <li key={service.id} className="rounded-lg border border-white/10 bg-[#151922] p-3 text-sm font-black text-white">{service.label}</li>
                )) : (
                  <li className="rounded-lg border border-dashed border-white/15 bg-[#0f1217] p-3 text-sm font-semibold text-slate-400">No services selected</li>
                )}
              </ul>
            ) : null}
          </section>

          <section className="rounded-xl border border-white/10 bg-[#11141a] p-4 xl:hidden" aria-labelledby="mobile-verification-summary-heading">
            <h2 id="mobile-verification-summary-heading" className="sr-only">Your progress</h2>
            <VerificationSummaryBody
              requirements={requirements}
            />
            <p className="mt-1 text-xs font-semibold leading-5 text-emerald-200">
              {isRequiredNowComplete ? "Your documents are ready for review. Additional documents may still be needed before individual services go live." : null}
            </p>
          </section>

          <div className="rounded-xl border border-white/10 bg-[#11141a] p-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <h2 className="text-sm font-black text-white">What you need to complete</h2>
                <p className="mt-1 text-sm font-semibold leading-5 text-slate-300">
                  {requiredChecksRemaining} checks required now · {beforeActivationRemaining} before services go live
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!selectedSection) return;
                  setRequirementIndex(selectedSection.id, getFirstOutstandingRequirementIndex(selectedSection.requirements));
                }}
                className="inline-flex h-9 items-center justify-center rounded-lg border border-[#f97316]/40 px-3 text-xs font-black text-[#fed7aa] hover:bg-[#f97316]/10"
              >
                {primaryVerificationAction}
              </button>
            </div>
            <p className="mt-2 text-xs font-black uppercase tracking-[0.1em] text-[#fed7aa]">
              {isRequiredNowComplete ? "Required checks completed" : null}
            </p>
            <p className="mt-1 text-xs font-semibold leading-5 text-emerald-200">
              {isRequiredNowComplete ? "Your documents are ready for review. Additional documents may still be needed before individual services go live." : null}
            </p>
            <div className="mt-3 h-2 rounded-full bg-white/10">
              <div className="h-full rounded-full bg-[linear-gradient(135deg,#38bdf8,#22c55e)]" style={{ width: `${requiredNowProgress}%` }} />
            </div>
          </div>

          <section className="rounded-xl border border-white/10 bg-[#11141a] p-4" aria-label="Verification checklist">
            <h2 className="text-sm font-black text-white">Verification checklist</h2>
            <div className="mt-3 overflow-hidden rounded-xl border border-white/10">
              {requirementGroups.map((group, groupIndex) => {
                const isActiveGroup = selectedSection?.id === group.id;
                const sectionIndex = getSectionRequirementIndex(group);
                const sectionRequirement = group.requirements[sectionIndex];
                const railState = verificationGroupRailState(group, nextActionGroupId);
                const railStyle = verificationRailStyle(railState);
                const sectionStatus = verificationGroupStatusLabel(railState);
                const sectionDocument = sectionRequirement ? documentForRequirement(requirements, bundle?.links ?? [], bundle?.documents ?? [], sectionRequirement.id) : null;
                return (
                  <article key={group.id} className={`${isActiveGroup ? "bg-[#f97316]/8" : "bg-[#0f1217]"} border-b border-white/10 last:border-b-0`}>
                    <button
                      type="button"
                      ref={(button) => {
                        sectionButtonRefs.current[group.id] = button;
                      }}
                      data-verification-section={group.id}
                      data-verification-status-rail={railState}
                      onClick={() => updateSectionSelection(group.id)}
                      className="flex min-h-14 w-full items-stretch justify-between gap-3 p-3 text-left focus-visible:ring-2 focus-visible:ring-[#38bdf8]"
                      aria-expanded={isActiveGroup}
                    >
                      <div className="flex min-w-0 items-stretch gap-3">
                        <span className="flex w-6 shrink-0 flex-col items-center self-stretch" aria-hidden="true">
                          <span className={`h-3 w-px ${groupIndex === 0 ? "bg-transparent" : "bg-white/12"}`} />
                          <span className={`flex h-5 w-5 items-center justify-center rounded-full border text-[10px] font-black ${railStyle.node}`}>
                            {railState === "complete" ? <Check size={12} /> : railState === "changes" ? <X size={11} /> : railState === "review" ? <ShieldCheck size={11} /> : railState === "current" ? "!" : ""}
                          </span>
                          <span className={`min-h-3 flex-1 w-px ${groupIndex === requirementGroups.length - 1 ? "bg-transparent" : "bg-white/12"}`} />
                        </span>
                        <div className="min-w-0 self-center">
                          <p className="break-words text-sm font-black text-white">{sectionTitle(group)}</p>
                          <p className="mt-1 text-xs font-semibold leading-4 text-slate-400">{statusLabelForProgress(group)}</p>
                        </div>
                      </div>
                      <span className="flex shrink-0 items-center gap-2 text-xs font-black text-slate-300">
                        {sectionStatus}
                        {isActiveGroup ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      </span>
                    </button>
                    {isActiveGroup ? (
                      <div className="border-t border-white/10 p-3">
                        {sectionRequirement ? (
                          <div className="rounded-xl border border-[#f97316]/25 bg-[#171a20] p-4">
                            <div className="mb-3 flex flex-col gap-1">
                              <span className="text-xs font-black text-[#fed7aa]">
                                Check {sectionIndex + 1} of {group.requirements.length}
                              </span>
                              <h3 id={`${group.id}-check-heading`} className="text-sm font-black text-white">
                                {sectionRequirement.title}
                              </h3>
                              <p className="text-xs font-semibold leading-5 text-slate-300">{sectionRequirement.description}</p>
                              <p className="text-xs font-semibold leading-5 text-slate-500">{sharedEvidenceLabel(sectionRequirement, requirements, bundle?.serviceScopes ?? [], selectedServices)}</p>
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                                <StatusLabel label={statusForRequirement(sectionRequirement)} status={sectionRequirement.status} />
                                <span className="rounded-full border border-white/10 bg-[#151922] px-2 py-0.5 text-[11px] font-black text-slate-400">{requirementStageLabel(sectionRequirement)}</span>
                              </div>
                            </div>
                            <DocumentStateFlow
                              requirement={sectionRequirement}
                              uploading={uploadingRequirementId === sectionRequirement.id}
                            />
                                <p className="text-xs font-semibold text-slate-500">Accepted documents: {verificationUploadAllowedMimeLabel}</p>
                                <p className="mt-1 text-xs font-semibold text-slate-500">
                                  {sectionRequirement.status === "NOT_SUBMITTED" ? "Document not uploaded yet." : "Document uploaded"}
                                </p>
                            {requirementReadyForUiProgression(sectionRequirement.status) ? (
                              <p className="mt-1 text-xs font-bold text-[#86efac]">Ready for review</p>
                            ) : sectionRequirement.status === "CHANGES_REQUIRED" ? (
                              <p className="mt-1 text-xs font-bold text-amber-300">Changes requested: TPL needs an updated document.</p>
                            ) : null}
                            {sectionDocument?.reviewNote && (sectionRequirement.status === "CHANGES_REQUIRED" || sectionRequirement.status === "REJECTED" || sectionRequirement.status === "EXPIRED") ? (
                              <div className="mt-3 rounded-xl border border-amber-300/25 bg-amber-300/10 p-3 text-xs font-bold leading-5 text-amber-100" data-partner-review-feedback="true">
                                <p className="font-black">{sectionRequirement.status === "REJECTED" ? "Check rejected" : sectionRequirement.status === "EXPIRED" ? "Renewal required" : "TPL needs an updated document."}</p>
                                <p className="mt-1">{sectionDocument.reviewNote}</p>
                              </div>
                            ) : null}
                            {selectedFilenames[sectionRequirement.id] ? (
                              <p className="mt-1 text-xs font-bold text-slate-200">Selected: {selectedFilenames[sectionRequirement.id]}</p>
                            ) : null}
                            {fileUploadMessages[sectionRequirement.id] ? (
                              <p className="mt-1 text-xs font-bold text-red-300">{fileUploadMessages[sectionRequirement.id]}</p>
                            ) : null}
                            <label className={`mt-3 inline-flex h-10 w-full items-center justify-center rounded-xl px-3 text-xs font-black ${qaPreviewEnabled ? "cursor-not-allowed border border-white/10 bg-[#151922] text-slate-500" : "cursor-pointer border border-[#f97316]/40 bg-[#f97316]/10 text-[#fed7aa] hover:border-[#f97316]"}`}>
                              {uploadingRequirementId === sectionRequirement.id ? "Uploading..." : sectionRequirement.status === "NOT_SUBMITTED" ? "Upload document" : "Replace document"}
                              <input
                                type="file"
                                className="sr-only"
                                disabled={qaPreviewEnabled}
                                accept={verificationUploadMimeTypes.join(",")}
                                onChange={(event) => {
                                  const file = event.target.files?.[0];
                                  if (file) handleFileSelection(sectionRequirement, file);
                                  event.currentTarget.value = "";
                                }}
                              />
                            </label>
                            <div className="mt-3 flex flex-wrap gap-2">
                              <button
                                type="button"
                                disabled={sectionIndex <= 0}
                                onClick={() => setRequirementIndex(group.id, sectionIndex - 1)}
                                className="h-9 rounded-lg border border-white/10 px-3 text-xs font-black text-slate-300 disabled:cursor-not-allowed disabled:opacity-45"
                              >
                                Previous check
                              </button>
                              <button
                                type="button"
                                disabled={sectionIndex >= group.requirements.length - 1}
                                onClick={() => setRequirementIndex(group.id, sectionIndex + 1)}
                                className="h-9 rounded-lg border border-[#f97316]/45 px-3 text-xs font-black text-[#fed7aa] disabled:cursor-not-allowed disabled:opacity-45"
                              >
                                Next check
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs font-semibold leading-5 text-slate-500">No checks in this section.</p>
                        )}
                      </div>
                    ) : null}
                  </article>
                );
              })}
            </div>
          </section>
        </div>

      </div>
    </div>
  );
}
function PayoutTaxPlaceholder() {
  return (
    <div data-application-active-step="payout_tax" className="rounded-2xl border border-white/10 bg-[#171a20] p-6 shadow-2xl">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-[#fb923c]">Step 6</p>
      <h1 className="mt-2 text-2xl font-black sm:text-3xl">Payout & Tax</h1>
      <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-300">
        Add the payout and tax details required for your Partner account.
      </p>
    </div>
  );
}

function PlaceholderStep({ step }: { step: (typeof workspaceSteps)[number] }) {
  return (
    <div data-application-active-step={step.id} className="rounded-2xl border border-white/10 bg-[#171a20] p-6 shadow-2xl">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-[#fb923c]">Step {step.number}</p>
      <h1 className="mt-2 text-2xl font-black sm:text-3xl">{step.title}</h1>
      <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-300">
        This step is reserved in the approved 8-step Partner application flow.
      </p>
    </div>
  );
}

function StateCard({ title, detail, tone }: { title: string; detail: string; tone: "success" | "warning" | "danger" }) {
  const Icon = tone === "success" ? BadgeCheck : tone === "warning" ? ShieldCheck : HelpCircle;
  const color = tone === "success" ? "text-emerald-300 bg-emerald-500/10 border-emerald-500/30" : tone === "danger" ? "text-red-200 bg-red-500/10 border-red-500/30" : "text-[#fed7aa] bg-[#f97316]/10 border-[#f97316]/30";
  return (
    <div className={`rounded-2xl border p-6 shadow-2xl ${color}`}>
      <Icon size={26} aria-hidden="true" />
      <h1 className="mt-4 text-2xl font-black text-white">{title}</h1>
      <p className="mt-2 text-sm font-semibold leading-6 text-slate-300">{detail}</p>
    </div>
  );
}

function LoadingCard() {
  return (
    <div className="flex min-h-[360px] items-center justify-center rounded-2xl border border-white/10 bg-[#171a20]">
      <Loader2 className="animate-spin text-[#f97316]" size={28} aria-hidden="true" />
    </div>
  );
}

function VerifiedChip({ label }: { label: string }) {
  return <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/12 px-2.5 py-1 text-xs font-black text-emerald-200"><Check size={13} aria-hidden="true" />{label}</span>;
}

function StatusLabel({ label, status }: { label: string; status: string }) {
  const color = status === "VERIFIED"
    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
    : status === "SUBMITTED" || status === "UNDER_REVIEW"
      ? "border-sky-500/30 bg-sky-500/10 text-sky-200"
      : status === "CHANGES_REQUIRED" || status === "REJECTED" || status === "EXPIRED"
        ? "border-red-500/30 bg-red-500/10 text-red-200"
        : "border-[#f97316]/30 bg-[#f97316]/10 text-[#fed7aa]";
  return <span className={`rounded-full border px-2 py-0.5 text-[11px] font-black ${color}`}>{label}</span>;
}

function CenteredShell({ children }: { children: ReactNode }) {
  return <div className="flex min-h-screen items-center justify-center px-4">{children}</div>;
}

function emptyForm(): AccountContactForm {
  return {
    contactPersonFullName: "",
    designation: "",
    roleOther: "",
    countryCode: "+91",
    businessMobile: "",
    businessEmail: "",
    useAccountContactDetails: true,
    authorizedRepresentative: false,
  };
}

function formFromBundle(bundle: PartnerOrganizationBundle | null, user: ReturnType<typeof useAuth>["user"]): AccountContactForm {
  const accountContact = readAccountContact(bundle);
  const mobile = String(accountContact.businessMobile || bundle?.organization.businessMobile || user?.mobile || "");
  const email = String(accountContact.businessEmail || bundle?.organization.businessEmail || user?.email || "");
  return {
    organizationId: bundle?.organization.id,
    contactPersonFullName: String(accountContact.contactPersonFullName || user?.fullName || ""),
    designation: String(accountContact.designation || ""),
    roleOther: String(accountContact.roleOther || ""),
    countryCode: mobile.startsWith("+") ? `+${mobile.replace(/[^\d]/g, "").slice(0, 2)}` : "+91",
    businessMobile: stripIndiaPrefix(mobile),
    businessEmail: email,
    useAccountContactDetails: true,
    authorizedRepresentative: accountContact.authorizedRepresentative === true,
  };
}

function emptyBusinessForm(): BusinessIdentityForm {
  return {
    legalName: "",
    brandName: "",
    organizationType: "",
    organizationTypeOther: "",
    description: "",
    yearEstablished: "",
    registrationType: "",
    registrationNumber: "",
    registrationDate: "",
    registrationVerificationStatus: "Not verified",
  };
}

function emptyLocationAddress(country = "India", countryCode = "IN"): LocationAddressForm {
  return {
    country,
    countryCode,
    addressLine1: "",
    addressLine2: "",
    city: "",
    stateRegion: "",
    postalCode: "",
    landmark: "",
    latitude: "",
    longitude: "",
    verificationStatus: "Not verified",
  };
}

function emptyServiceArea(): ServiceAreaForm {
  return {
    id: `area-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    coverageLevel: "",
    country: "India",
    countryCode: "IN",
    stateRegion: "",
    cityDestination: "",
    localArea: "",
  };
}

function emptyLocationForm(): BusinessLocationForm {
  const primaryLocation = emptyLocationAddress();
  return {
    primaryLocation,
    sameAsOperating: true,
    operatingLocation: primaryLocation,
    serviceAreas: [emptyServiceArea()],
  };
}

function emptyRequestedService(): RequestedServiceForm {
  return {
    id: `request-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    requestedName: "",
    description: "",
    closestDomain: "",
  };
}

function emptyServicesForm(): ServicesForm {
  return {
    selectedServiceCodes: [],
    requestedServices: [],
    requestPanelOpen: false,
  };
}

function businessFormFromBundle(bundle: PartnerOrganizationBundle | null): BusinessIdentityForm {
  const businessIdentity = readBusinessIdentity(bundle);
  return {
    organizationId: bundle?.organization.id,
    legalName: String(businessIdentity.legalName || bundle?.organization.legalName || ""),
    brandName: String(businessIdentity.brandName || bundle?.organization.brandName || ""),
    organizationType: frontendOrganizationType(String(businessIdentity.organizationType || bundle?.organization.organizationType || "")),
    organizationTypeOther: String(businessIdentity.organizationTypeOther || ""),
    description: String(businessIdentity.description || ""),
    yearEstablished: String(businessIdentity.yearEstablished || ""),
    registrationType: String(businessIdentity.registrationType || ""),
    registrationNumber: String(businessIdentity.registrationNumber || ""),
    registrationDate: String(businessIdentity.registrationDate || ""),
    registrationVerificationStatus: readRegistrationVerificationStatus(businessIdentity.registrationVerification),
  };
}

function locationFormFromBundle(bundle: PartnerOrganizationBundle | null): BusinessLocationForm {
  const businessLocation = readBusinessLocation(bundle);
  const primaryLocation = locationAddressFromRecord(asClientRecord(businessLocation.primaryLocation), {
    country: bundle?.organization.country,
    addressLine1: bundle?.organization.addressLine1,
    addressLine2: bundle?.organization.addressLine2,
    city: bundle?.organization.city,
    stateRegion: bundle?.organization.stateRegion,
    postalCode: bundle?.organization.postalCode,
  });
  const sameAsOperating = businessLocation.sameAsOperating !== false;
  const operatingLocation = sameAsOperating
    ? primaryLocation
    : locationAddressFromRecord(asClientRecord(businessLocation.operatingLocation), {});
  const serviceAreas = Array.isArray(businessLocation.serviceAreas)
    ? businessLocation.serviceAreas.map((item, index) => serviceAreaFromRecord(asClientRecord(item), index)).filter((area) => area.country || area.cityDestination || area.coverageLevel)
    : [];
  return {
    organizationId: bundle?.organization.id,
    primaryLocation,
    sameAsOperating,
    operatingLocation,
    serviceAreas: serviceAreas.length ? serviceAreas : [emptyServiceArea()],
  };
}

function servicesFormFromBundle(bundle: PartnerOrganizationBundle | null): ServicesForm {
  const servicesDraft = readServicesDraft(bundle);
  const selectedFromDraft = Array.isArray(servicesDraft.selectedServiceCodes)
    ? servicesDraft.selectedServiceCodes.map(String).filter(Boolean)
    : [];
  const selectedFromScopes = bundle?.serviceScopes
    .filter((scope) => scope.status !== "disabled" && scope.serviceCode)
    .map((scope) => scope.serviceCode) ?? [];
  const requestedServices = Array.isArray(servicesDraft.requestedServices)
    ? servicesDraft.requestedServices.map((item, index) => requestedServiceFromRecord(asClientRecord(item), index)).filter((request) => request.requestedName || request.description)
    : [];
  return {
    organizationId: bundle?.organization.id,
    selectedServiceCodes: [...new Set([...selectedFromDraft, ...selectedFromScopes])],
    requestedServices,
    requestPanelOpen: requestedServices.length > 0,
  };
}

function readAccountContact(bundle: PartnerOrganizationBundle | null): Record<string, unknown> {
  const metadata = bundle?.organization.metadata;
  const application = metadata?.application && typeof metadata.application === "object" && !Array.isArray(metadata.application) ? metadata.application as Record<string, unknown> : {};
  return application.accountContact && typeof application.accountContact === "object" && !Array.isArray(application.accountContact) ? application.accountContact as Record<string, unknown> : {};
}

function readBusinessLocation(bundle: PartnerOrganizationBundle | null): Record<string, unknown> {
  const metadata = bundle?.organization.metadata;
  const application = metadata?.application && typeof metadata.application === "object" && !Array.isArray(metadata.application) ? metadata.application as Record<string, unknown> : {};
  return application.businessLocation && typeof application.businessLocation === "object" && !Array.isArray(application.businessLocation) ? application.businessLocation as Record<string, unknown> : {};
}

function asClientRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function locationAddressFromRecord(record: Record<string, unknown>, fallback: Record<string, unknown>): LocationAddressForm {
  const country = String(record.country || fallback.country || "India");
  const countryCode = String(record.countryCode || countryCodeFor(country));
  return {
    country,
    countryCode,
    addressLine1: String(record.addressLine1 || fallback.addressLine1 || ""),
    addressLine2: String(record.addressLine2 || fallback.addressLine2 || ""),
    city: String(record.city || fallback.city || ""),
    stateRegion: String(record.stateRegion || fallback.stateRegion || ""),
    postalCode: String(record.postalCode || fallback.postalCode || ""),
    landmark: String(record.landmark || ""),
    latitude: String(record.latitude || ""),
    longitude: String(record.longitude || ""),
    verificationStatus: locationVerificationStatusOptions.includes(String(record.verificationStatus)) ? String(record.verificationStatus) : "Not verified",
  };
}

function serviceAreaFromRecord(record: Record<string, unknown>, index: number): ServiceAreaForm {
  const country = String(record.country || "India");
  return {
    id: String(record.id || `area-${index + 1}`),
    coverageLevel: String(record.coverageLevel || ""),
    country,
    countryCode: String(record.countryCode || countryCodeFor(country)),
    stateRegion: String(record.stateRegion || ""),
    cityDestination: String(record.cityDestination || ""),
    localArea: String(record.localArea || ""),
  };
}

function requestedServiceFromRecord(record: Record<string, unknown>, index: number): RequestedServiceForm {
  const closestDomain = String(record.closestDomain || "");
  return {
    id: String(record.id || `request-${index + 1}`),
    requestedName: String(record.requestedName || ""),
    description: String(record.description || ""),
    closestDomain: closestDomain ? closestDomain as PartnerServiceDomainId : "",
  };
}

function readBusinessIdentity(bundle: PartnerOrganizationBundle | null): Record<string, unknown> {
  const metadata = bundle?.organization.metadata;
  const application = metadata?.application && typeof metadata.application === "object" && !Array.isArray(metadata.application) ? metadata.application as Record<string, unknown> : {};
  return application.businessIdentity && typeof application.businessIdentity === "object" && !Array.isArray(application.businessIdentity) ? application.businessIdentity as Record<string, unknown> : {};
}

function readServicesDraft(bundle: PartnerOrganizationBundle | null): Record<string, unknown> {
  const metadata = bundle?.organization.metadata;
  const application = metadata?.application && typeof metadata.application === "object" && !Array.isArray(metadata.application) ? metadata.application as Record<string, unknown> : {};
  return application.services && typeof application.services === "object" && !Array.isArray(application.services) ? application.services as Record<string, unknown> : {};
}

function readLastSaved(bundle: PartnerOrganizationBundle | null): string | null {
  const metadata = bundle?.organization.metadata;
  const application = metadata?.application && typeof metadata.application === "object" && !Array.isArray(metadata.application) ? metadata.application as Record<string, unknown> : {};
  return typeof application.lastSavedAt === "string" ? application.lastSavedAt : bundle?.organization.updatedAt ?? null;
}

function resolveActiveStep(bundle: PartnerOrganizationBundle | null): WorkspaceStepId {
  const metadata = bundle?.organization.metadata;
  const application = metadata?.application && typeof metadata.application === "object" && !Array.isArray(metadata.application) ? metadata.application as Record<string, unknown> : {};
  const current = application.currentStep;
  return workspaceSteps.some((step) => step.id === current) ? current as WorkspaceStepId : "account_contact";
}

function contactVerified(bundle: PartnerOrganizationBundle | null, channel: "mobile" | "email", value: string): boolean {
  if (!value) return false;
  return Boolean(bundle?.contacts.some((contact) => contact.channel === channel && (contact.normalizedValue ?? contact.value) === value && contact.verificationStatus === "verified"));
}

function minimalProfile(form: AccountContactForm) {
  return {
    ...emptyPartnerOrganizationPreviewProfile,
    legalName: "",
    businessName: "",
    organizationType: "Other" as const,
    businessMobile: normalizedMobile(form.businessMobile, form.countryCode),
    businessMobileVerificationStatus: "verification-required" as const,
    businessEmail: normalizeEmail(form.businessEmail),
    businessEmailVerificationStatus: "verification-required" as const,
    addressLine1: "",
    addressLine2: "",
    city: "",
    stateRegion: "",
    postalCode: "",
    country: "India",
    savedForPreview: false,
  };
}

function normalizedMobile(value: string, countryCode: string): string {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";
  const prefix = countryCode.replace(/\D/g, "") || "91";
  if (digits.startsWith(prefix) && digits.length > 10) return `+${digits}`;
  return `+${prefix}${digits}`;
}

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

function stripIndiaPrefix(value: string): string {
  const digits = value.replace(/\D/g, "");
  return digits.startsWith("91") && digits.length === 12 ? digits.slice(2) : digits;
}

function hasMeaningfulStepOneInput(form: AccountContactForm): boolean {
  return Boolean(form.contactPersonFullName.trim() || form.businessMobile.trim() || form.businessEmail.trim());
}

function hasMeaningfulStepTwoInput(form: BusinessIdentityForm): boolean {
  return Boolean(
    form.legalName.trim() ||
    form.brandName.trim() ||
    form.organizationType.trim() ||
    form.organizationTypeOther.trim() ||
    form.description.trim() ||
    form.yearEstablished.trim() ||
    form.registrationType.trim() ||
    form.registrationNumber.trim() ||
    form.registrationDate.trim()
  );
}

function isBusinessIdentityComplete(data: Record<string, unknown>): boolean {
  const legalName = typeof data.legalName === "string" ? data.legalName.trim() : "";
  const organizationType = typeof data.organizationType === "string" ? data.organizationType.trim() : "";
  const organizationTypeOther = typeof data.organizationTypeOther === "string" ? data.organizationTypeOther.trim() : "";
  const description = typeof data.description === "string" ? data.description.trim() : "";
  return legalName.length >= 2 && organizationType.length > 0 && (organizationType !== "Other" || organizationTypeOther.length >= 2) && description.length >= 20;
}

function frontendOrganizationType(value: string): string {
  const reverse = Object.entries(organizationTypeToBackend).find(([, backend]) => backend === value);
  return reverse?.[0] ?? (organizationTypeOptions.includes(value) ? value : "");
}

function registrationTypeOptionsFor(organizationType: string): string[] {
  if (organizationType === "LLP") return ["LLPIN", "Other registration type"];
  if (organizationType === "One Person Company (OPC)" || organizationType === "Private Limited Company" || organizationType === "Public Limited Company") return ["CIN", "Other registration type"];
  if (organizationType === "Partnership Firm") return ["Partnership registration number", "Firm registration number", "Other registration type"];
  if (organizationType === "Trust") return ["Trust registration number", "Other registration type"];
  if (organizationType === "Society / NGO") return ["Society registration number", "NGO registration number", "Other registration type"];
  if (organizationType === "Government / Public Body") return ["Institution reference", "Government registration reference", "Other registration type"];
  return ["Other registration type"];
}

function readRegistrationVerificationStatus(value: unknown): string {
  const record = value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
  const status = typeof record.status === "string" ? record.status : "";
  return verificationStatusOptions.includes(status) ? status : "Not verified";
}

function businessIdentityRequirementClassifications(organizationType: string): Record<string, PartnerRequirementClassification> {
  const registrationClassification: PartnerRequirementClassification = entityTypesWithRegistration.has(organizationType)
    ? "CONDITIONAL_BY_ENTITY"
    : "OPTIONAL";
  return {
    legalName: "REQUIRED_FOR_APPLICATION",
    brandName: "OPTIONAL",
    organizationType: "REQUIRED_FOR_APPLICATION",
    organizationTypeOther: organizationType === "Other" ? "CONDITIONAL_BY_ENTITY" : "OPTIONAL",
    description: "REQUIRED_FOR_APPLICATION",
    yearEstablished: "OPTIONAL",
    registrationType: registrationClassification,
    registrationNumber: registrationClassification,
    registrationDate: registrationClassification,
  };
}

function hasMeaningfulStepThreeInput(form: BusinessLocationForm): boolean {
  return Boolean(
    hasMeaningfulLocationInput(form.primaryLocation) ||
    (!form.sameAsOperating && hasMeaningfulLocationInput(form.operatingLocation)) ||
    form.serviceAreas.some((area) => area.coverageLevel || area.stateRegion || area.cityDestination || area.localArea || (area.countryCode && area.countryCode !== "IN"))
  );
}

function hasMeaningfulLocationInput(value: LocationAddressForm): boolean {
  return Boolean(value.addressLine1 || value.addressLine2 || value.city || value.stateRegion || value.postalCode || value.landmark);
}

function isBusinessLocationComplete(form: BusinessLocationForm): boolean {
  const primaryComplete = isLocationAddressComplete(form.primaryLocation);
  const operatingComplete = form.sameAsOperating || isLocationAddressComplete(form.operatingLocation);
  const hasServiceArea = form.serviceAreas.some((area) => area.coverageLevel.trim() && area.country.trim() && (area.cityDestination.trim() || area.stateRegion.trim() || area.coverageLevel === "Country-wide" || area.coverageLevel === "International / multi-country"));
  return primaryComplete && operatingComplete && hasServiceArea;
}

function hasMeaningfulStepFourInput(form: ServicesForm): boolean {
  return Boolean(form.selectedServiceCodes.length || form.requestedServices.some((request) => request.requestedName.trim() || request.description.trim()));
}

function isServicesComplete(form: ServicesForm, countryCode: string, businessType: string, catalogueItems: PartnerServiceCatalogueItem[]): boolean {
  return form.selectedServiceCodes.some((code) => {
    const item = findPartnerCatalogueItemIn(catalogueItems, code);
    return item ? partnerServiceEligibleForApplication(item, countryCode, businessType) : false;
  });
}

function isVerificationStepComplete(bundle: PartnerOrganizationBundle | null): boolean {
  if (!bundle || !bundle.requirements.length) return false;
  return bundle.requirements
    .filter((requirement) => requirementStage(requirement) === "REQUIRED_NOW")
    .every((requirement) => requirementReadyForUiProgression(requirement.status));
}

function requirementReadyForUiProgression(status: string): boolean {
  return status === "SUBMITTED" || status === "UNDER_REVIEW" || status === "VERIFIED" || status === "EXPIRING_SOON";
}

type VerificationRailState = "complete" | "current" | "in-progress" | "not-started" | "changes" | "review";

function verificationGroupRailState(group: VerificationRequirementGroup, nextActionGroupId?: string): VerificationRailState {
  if (group.requirements.some((requirement) => requirement.status === "CHANGES_REQUIRED" || requirement.status === "REJECTED" || requirement.status === "EXPIRED")) return "changes";
  if (group.requirements.length && group.requirements.every((requirement) => requirement.status === "VERIFIED")) return "complete";
  if (group.requirements.some((requirement) => requirement.status === "SUBMITTED" || requirement.status === "UNDER_REVIEW" || requirement.status === "EXPIRING_SOON")) return "review";
  if (group.id === nextActionGroupId) return "current";
  if (group.requirements.some((requirement) => requirement.status !== "NOT_SUBMITTED")) return "in-progress";
  return "not-started";
}

function verificationRailStyle(state: VerificationRailState): { node: string } {
  if (state === "complete") return { node: "border-emerald-400 bg-emerald-500 text-white" };
  if (state === "current") return { node: "border-[#f97316] bg-[#f97316] text-white" };
  if (state === "in-progress") return { node: "border-[#38bdf8] bg-[#38bdf8] text-[#07111a]" };
  if (state === "changes") return { node: "border-red-400 bg-red-500 text-white" };
  if (state === "review") return { node: "border-amber-300 bg-amber-300 text-[#11141a]" };
  return { node: "border-white/20 bg-transparent text-slate-500" };
}

function verificationGroupStatusLabel(state: VerificationRailState): string {
  if (state === "complete") return "Complete";
  if (state === "current") return "Action required";
  if (state === "in-progress") return "In progress";
  if (state === "changes") return "Changes required";
  if (state === "review") return "TPL review";
  return "Not started";
}

function getFirstOutstandingRequirementIndex(requirements: PartnerRequirement[]): number {
  const first = requirements.findIndex((requirement) => !requirementReadyForUiProgression(requirement.status));
  return first === -1 ? Math.max(requirements.length - 1, 0) : first;
}

function validateVerificationFile(file: File): string {
  if (file.size > verificationUploadMaxBytes) return `File is too large. Max size is ${verificationUploadAllowedMimeLabel}.`;
  if (!verificationUploadMimeTypes.includes(file.type || "")) return `Unsupported file type. Use ${verificationUploadAllowedMimeLabel}.`;
  return "";
}

function getServicesHeadline(services: VerificationSelectedService[]): string {
  if (!services.length) return "No services selected yet";
  if (services.length === 1) return services[0].label;
  return `${services[0].label} + ${services.length - 1} more`;
}

function sectionTitle(group: VerificationRequirementGroup): string {
  if (group.id === "business-requirements") return "Business details";
  if (group.id === "representative-requirements") return "Your identity";
  if (group.id === "jurisdiction-requirements" || group.id === "additional-review") return "Additional checks, only when needed";
  return group.title;
}

type VerificationSelectedService = { id: string; code: string; label: string };

type VerificationRequirementGroup = {
  id: string;
  title: string;
  description: string;
  optionLabel: string;
  requirements: PartnerRequirement[];
};

function selectedVerificationServices(selectedServiceCodes: string[], scopes: PartnerOrganizationBundle["serviceScopes"], catalogueItems: PartnerServiceCatalogueItem[]): VerificationSelectedService[] {
  const fromScopes = scopes.map((scope) => ({ id: scope.id, code: scope.serviceCode, label: scope.serviceLabel }));
  const fromSelectedCodes = selectedServiceCodes.map((code) => {
    const item = findPartnerCatalogueItemIn(catalogueItems, code);
    return { id: `scope-${code}`, code, label: item?.name ?? titleFromDomainId(code) };
  });
  const merged = [...fromScopes, ...fromSelectedCodes];
  const seen = new Set<string>();
  return merged.filter((service) => {
    if (seen.has(service.code)) return false;
    seen.add(service.code);
    return true;
  });
}

function groupPartnerRequirements(requirements: PartnerRequirement[], scopes: PartnerOrganizationBundle["serviceScopes"], catalogueItems: PartnerServiceCatalogueItem[], selectedServices: VerificationSelectedService[]): VerificationRequirementGroup[] {
  const business = requirements.filter((item) => item.ownerEntityType === "ORGANIZATION");
  const representative = requirements.filter((item) => ["PERSON", "PROFESSIONAL", "DRIVER"].includes(item.ownerEntityType) && !item.serviceScopeId);
  const service = requirements.filter((item) => item.serviceScopeId);
  const jurisdiction = requirements.filter((item) => item.ownerEntityType === "LOCATION");
  const additional = requirements.filter((item) => item.metadata?.missingProfile === true || item.title.toLowerCase().includes("manual"));
  const groups: VerificationRequirementGroup[] = [
    makeRequirementGroup("business-requirements", "Business details", "Checks shared by your Partner business profile.", business),
    makeRequirementGroup("representative-requirements", "Your identity", "Checks for the person managing this application.", representative),
    makeRequirementGroup("jurisdiction-requirements", "Additional checks, only when needed", "Checks based on your selected country and locations.", jurisdiction),
  ];
  const serviceGroups = selectedServices.map((selectedService) => {
    const scoped = service.filter((item) => {
      if (item.metadata?.missingProfile === true || item.title.toLowerCase().includes("manual")) return false;
      const scope = scopes.find((scopeItem) => scopeItem.id === item.serviceScopeId);
      return item.serviceScopeId === selectedService.id || scope?.serviceCode === selectedService.code || item.metadata?.serviceCode === selectedService.code;
    });
    return makeRequirementGroup(`service-${selectedService.code}`, selectedService.label, serviceRequirementDescription(scoped, scopes, catalogueItems), scoped);
  });
  const additionalGroup = makeRequirementGroup("additional-review", "Additional checks, only when needed", "Manual review items when requested by your profile.", additional);
  return [...groups, ...serviceGroups, additionalGroup]
    .map((group) => ({ ...group, requirements: sortRequirementsForDisplay(dedupeRequirements(group.requirements)), optionLabel: sectionOptionLabel(group.title, group.requirements) }))
    .filter((group) => group.requirements.length > 0);
}

function makeRequirementGroup(id: string, title: string, description: string, requirements: PartnerRequirement[]): VerificationRequirementGroup {
  return { id, title, description, optionLabel: sectionOptionLabel(title, requirements), requirements };
}

function sectionOptionLabel(title: string, requirements: PartnerRequirement[]): string {
  const actionCount = requirements.filter((requirement) => requirementStage(requirement) === "REQUIRED_NOW" && !requirementReadyForUiProgression(requirement.status)).length;
  if (actionCount > 0) return `${title} - ${actionCount} action${actionCount === 1 ? "" : "s"} required`;
  if (requirements.length && requirements.every((requirement) => requirementReadyForUiProgression(requirement.status))) return `${title} - Complete`;
  return `${title} - ${requirements.length} document${requirements.length === 1 ? "" : "s"} required`;
}

function sortRequirementsForDisplay(requirements: PartnerRequirement[]): PartnerRequirement[] {
  return [...requirements].sort((a, b) => {
    const statusA = requirementReadyForUiProgression(a.status) ? 1 : 0;
    const statusB = requirementReadyForUiProgression(b.status) ? 1 : 0;
    if (statusA !== statusB) return statusA - statusB;
    return requirementStageOrder(a) - requirementStageOrder(b);
  });
}

function requirementStageOrder(requirement: PartnerRequirement): number {
  const stage = requirementStage(requirement);
  if (stage === "REQUIRED_NOW") return 0;
  if (stage === "BEFORE_ACTIVATION") return 1;
  return 2;
}

function dedupeRequirements(requirements: PartnerRequirement[]): PartnerRequirement[] {
  const seen = new Set<string>();
  return requirements.filter((requirement) => {
    const key = `${requirement.requirementCode}:${requirement.ownerEntityType}:${requirement.title}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function previewRequirementsForSelectedServices(selectedServiceCodes: string[], catalogueItems: PartnerServiceCatalogueItem[]): PartnerRequirement[] {
  const serviceCodes = selectedServiceCodes.length ? selectedServiceCodes : ["hotel", "cab-taxi-operator"];
  const base: PartnerRequirement[] = [
    previewRequirement("preview-business-address", "Business address evidence", "ORGANIZATION", "BUSINESS_ADDRESS", "Upload evidence for the registered or operating business address.", "MANDATORY", null),
    previewRequirement("preview-identity", "Government identity document", "PERSON", "IDENTITY_DOCUMENT", "Upload identity evidence for the person responsible for this Partner application.", "MANDATORY", null),
  ];
  const serviceRequirements = serviceCodes.map((code) => {
    const item = findPartnerCatalogueItemIn(catalogueItems, code);
    const label = item?.name ?? titleFromDomainId(code);
    return previewRequirement(`preview-${code}`, `${label} evidence`, "SERVICE", `${code.toUpperCase()}_SERVICE_EVIDENCE`, `Provide the evidence required for ${label}.`, "CONDITIONAL", `scope-${code}`, item?.verificationProfileKey);
  });
  return [...base, ...serviceRequirements];
}

function previewRequirement(id: string, title: string, ownerEntityType: string, requirementCode: string, description: string, priority: PartnerRequirement["priority"], serviceScopeId: string | null, verificationProfileKey?: string): PartnerRequirement {
  return {
    id,
    title,
    ownerEntityType,
    requirementCode,
    description,
    priority,
    serviceScopeId,
    status: "NOT_SUBMITTED",
    expires: true,
    metadata: { previewExample: true, verificationProfileKey, requirementStage: serviceScopeId ? "BEFORE_ACTIVATION" : "REQUIRED_NOW" },
  };
}

function requirementGroupTitle(requirement: PartnerRequirement): string {
  if (requirement.ownerEntityType === "ORGANIZATION") return "Business details";
  if (["PERSON", "PROFESSIONAL", "DRIVER"].includes(requirement.ownerEntityType)) return "Your identity";
  if (requirement.ownerEntityType === "LOCATION") return "Additional checks, only when needed";
  return "Service-specific check";
}

function sharedEvidenceLabel(requirement: PartnerRequirement, requirements: PartnerRequirement[], scopes: PartnerOrganizationBundle["serviceScopes"], selectedServices: VerificationSelectedService[]): string {
  const labels = applicableServiceLabels(requirement, requirements, scopes, selectedServices);
  if (labels.length <= 1) return "Collected once for this requirement.";
  return `Used for ${formatHumanList(labels)}`;
}

function documentForRequirement(_requirements: PartnerRequirement[], links: NonNullable<PartnerOrganizationBundle["links"]>, documents: PartnerOrganizationBundle["documents"], requirementId: string) {
  const link = links.find((item) => item.requirementId === requirementId && item.status === "active");
  return documents.find((document) => document.id === link?.documentId) ?? null;
}

function applicableServiceLabels(requirement: PartnerRequirement, requirements: PartnerRequirement[], scopes: PartnerOrganizationBundle["serviceScopes"], selectedServices: VerificationSelectedService[]): string[] {
  const metadataLabels = requirement.metadata?.applicableServiceLabels;
  if (Array.isArray(metadataLabels) && metadataLabels.length) return metadataLabels.filter((label): label is string => typeof label === "string");
  if (requirement.serviceScopeId) {
    const scope = scopes.find((item) => item.id === requirement.serviceScopeId);
    return [scope?.serviceLabel ?? selectedServices.find((service) => service.id === requirement.serviceScopeId)?.label ?? "selected service"];
  }
  if (["ORGANIZATION", "PERSON"].includes(requirement.ownerEntityType) && selectedServices.length > 1) return selectedServices.map((service) => service.label);
  return [];
}

function formatHumanList(values: string[]): string {
  const unique = [...new Set(values)].filter(Boolean);
  if (unique.length <= 2) return unique.join(" and ");
  return `${unique.slice(0, -1).join(", ")} and ${unique[unique.length - 1]}`;
}

function serviceRequirementDescription(requirements: PartnerRequirement[], scopes: PartnerOrganizationBundle["serviceScopes"], catalogueItems: PartnerServiceCatalogueItem[]): string {
  const labels = [...new Set(requirements.map((requirement) => scopes.find((scope) => scope.id === requirement.serviceScopeId)?.serviceLabel).filter(Boolean))];
  if (labels.length) return `Checks for ${labels.slice(0, 3).join(", ")}${labels.length > 3 ? " and other selected services" : ""}.`;
  return catalogueItems.length ? "Selected service check." : "Selected service check.";
}

function verificationStatusLabel(status: string): string {
  if (status === "NOT_SUBMITTED") return "Action required";
  if (status === "SUBMITTED") return "Submitted for verification";
  if (status === "UNDER_REVIEW") return "TPL review required";
  if (status === "VERIFIED") return "Ready for review";
  if (status === "CHANGES_REQUIRED") return "TPL needs an updated document";
  if (status === "REJECTED") return "Rejected";
  if (status === "EXPIRING_SOON") return "Expiring soon";
  if (status === "EXPIRED") return "Expired";
  return "Requirements being reviewed";
}

function requirementStage(requirement: PartnerRequirement): "REQUIRED_NOW" | "BEFORE_ACTIVATION" | "IF_APPLICABLE" {
  const stage = requirement.metadata?.requirementStage;
  if (stage === "REQUIRED_NOW" || stage === "BEFORE_ACTIVATION" || stage === "IF_APPLICABLE") return stage;
  if (requirement.priority === "MANDATORY" && !requirement.serviceScopeId) return "REQUIRED_NOW";
  if (requirement.priority === "CONDITIONAL" || requirement.priority === "OPTIONAL") return "IF_APPLICABLE";
  return "BEFORE_ACTIVATION";
}

function requirementStageLabel(requirement: PartnerRequirement): string {
  const stage = requirementStage(requirement);
  if (stage === "REQUIRED_NOW") return "Required now";
  if (stage === "BEFORE_ACTIVATION") return "Required before this service goes live";
  return "We'll ask only if needed";
}

type DocumentJourneyState = "needed" | "uploading" | "uploaded" | "review" | "completed" | "changes" | "renewal";

function documentJourneyState(requirement: PartnerRequirement, uploading: boolean): DocumentJourneyState {
  if (uploading) return "uploading";
  if (requirement.status === "VERIFIED") return "completed";
  if (requirement.status === "UNDER_REVIEW") return "review";
  if (requirement.status === "SUBMITTED") return "uploaded";
  if (requirement.status === "CHANGES_REQUIRED" || requirement.status === "REJECTED") return "changes";
  if (requirement.status === "EXPIRED") return "renewal";
  return "needed";
}

function DocumentStateFlow({ requirement, uploading }: { requirement: PartnerRequirement; uploading: boolean }) {
  const state = documentJourneyState(requirement, uploading);
  const currentLabel = state === "uploading"
    ? "Uploading"
    : state === "changes"
      ? "Changes required"
      : state === "renewal"
        ? "Renewal required"
        : state === "needed"
          ? "Document needed"
          : state === "uploaded"
            ? "Uploaded"
            : state === "review"
              ? "TPL review"
              : "Completed";
  const steps = [
    { id: "needed", label: state === "changes" ? "Changes required" : state === "renewal" ? "Renewal required" : state === "uploading" ? "Uploading" : "Document needed" },
    { id: "uploaded", label: "Uploaded" },
    { id: "review", label: "TPL review" },
    { id: "completed", label: "Completed" },
  ] as const;
  const rank: Record<DocumentJourneyState, number> = {
    needed: 0,
    uploading: 0,
    changes: 0,
    renewal: 0,
    uploaded: 1,
    review: 2,
    completed: 3,
  };
  const toneForStep = (stepId: (typeof steps)[number]["id"]) => {
    const index = steps.findIndex((step) => step.id === stepId);
    const activeIndex = rank[state];
    const isActive = index === activeIndex;
    const isComplete = state === "completed" || index < activeIndex;
    if (state === "changes" && isActive) return "border-red-400 bg-red-500/15 text-red-100";
    if (state === "renewal" && isActive) return "border-amber-300 bg-amber-300/15 text-amber-100";
    if (state === "uploading" && isActive) return "border-[#38bdf8] bg-[#38bdf8]/15 text-sky-100";
    if (state === "review" && isActive) return "border-amber-300 bg-amber-300/15 text-amber-100";
    if (isComplete) return "border-emerald-400/50 bg-emerald-500/15 text-emerald-100";
    if (isActive) return "border-[#f97316]/60 bg-[#f97316]/15 text-[#fed7aa]";
    return "border-white/10 bg-[#0f1217] text-slate-400";
  };
  const iconForStep = (stepId: (typeof steps)[number]["id"]) => {
    if (state === "changes" && stepId === "needed") return <X size={12} aria-hidden="true" />;
    if (state === "renewal" && stepId === "needed") return <RotateCcw size={12} aria-hidden="true" />;
    if (state === "uploading" && stepId === "needed") return <Loader2 className="animate-spin motion-reduce:animate-none" size={12} aria-hidden="true" />;
    if (state === "completed" || steps.findIndex((step) => step.id === stepId) < rank[state]) return <Check size={12} aria-hidden="true" />;
    if (stepId === "review") return <ShieldCheck size={12} aria-hidden="true" />;
    if (stepId === "uploaded") return <FileCheck2 size={12} aria-hidden="true" />;
    return <span aria-hidden="true" className="h-2 w-2 rounded-full bg-current" />;
  };
  return (
    <div data-document-state-flow="true" aria-label={`Document progress: ${currentLabel}`} className="mb-3 flex flex-wrap items-center gap-2">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center gap-2">
          <span className={`inline-flex h-8 items-center gap-2 rounded-full border px-2.5 text-[11px] font-black ${toneForStep(step.id)}`}>
            {iconForStep(step.id)}
            {step.label}
          </span>
          {index < steps.length - 1 ? <ArrowRight size={13} className="text-slate-600" aria-hidden="true" /> : null}
        </div>
      ))}
    </div>
  );
}

function VerificationSummaryBody({
  requirements,
}: {
  requirements: PartnerRequirement[];
}) {
  const requiredNow = requirements.filter((item) => requirementStage(item) === "REQUIRED_NOW");
  const beforeActivation = requirements.filter((item) => requirementStage(item) === "BEFORE_ACTIVATION");
  const ready = requiredNow.filter((item) => requirementReadyForUiProgression(item.status));
  const beforeActivationReady = beforeActivation.filter((item) => requirementReadyForUiProgression(item.status));
  const progress = requiredNow.length ? Math.round((ready.length / requiredNow.length) * 100) : 0;
  const nextRequired = requiredNow.find((item) => !requirementReadyForUiProgression(item.status));
  const nextSectionAction = nextRequired ? `Upload your ${nextRequired.title}` : "Upload your next required document";
  return (
    <div data-step5-progress-summary="true" className="space-y-3">
      <h2 className="text-sm font-black text-white">Your progress</h2>
      <div className="h-2 rounded-full bg-white/10" aria-label={`${ready.length} of ${requiredNow.length} required checks completed`}>
        <div className="h-full rounded-full bg-[linear-gradient(135deg,#38bdf8,#22c55e)]" style={{ width: `${progress}%` }} />
      </div>
      <div className="rounded-xl border border-white/10 bg-[#0f1217] p-3">
        <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-400">Required now</p>
        <p className="mt-1 text-sm font-black text-white">{ready.length} of {requiredNow.length} completed</p>
      </div>
      <div className="rounded-xl border border-white/10 bg-[#0f1217] p-3">
        <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-400">Before services go live</p>
        <p className="mt-1 text-sm font-black text-white">{beforeActivationReady.length} of {beforeActivation.length} completed</p>
      </div>
      <div className="rounded-xl border border-[#f97316]/25 bg-[#f97316]/10 p-3">
        <p className="text-xs font-black uppercase tracking-[0.12em] text-[#fed7aa]">Next action</p>
        <p className="mt-1 break-words text-sm font-bold leading-5 text-white">{nextSectionAction}</p>
      </div>
      {!nextRequired && requiredNow.length ? (
        <p className="text-xs font-semibold leading-5 text-emerald-200">
          Your documents are ready for review. Additional documents may still be needed before individual services go live.
        </p>
      ) : null}
    </div>
  );
}

function domainTitleFor(domainId: PartnerServiceDomainId, serviceCatalog: PartnerServiceCategory[]): string {
  return serviceCatalog.find((category) => category.id === domainId)?.title ?? titleFromDomainId(domainId);
}

function titleFromDomainId(domainId: string): string {
  return domainId.split("-").filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}

function serviceDomainIdsFromCodes(serviceCodes: string[], catalogueItems: PartnerServiceCatalogueItem[]): PartnerServiceDomainId[] {
  const domainIds = serviceCodes
    .map((code) => findPartnerCatalogueItemIn(catalogueItems, code)?.domain)
    .filter(Boolean) as PartnerServiceDomainId[];
  return [...new Set(domainIds)];
}

function matchesServiceSearch(value: string, query: string): boolean {
  const normalizedQuery = query.trim().toLowerCase().replace(/\s+/g, " ");
  if (!normalizedQuery) return true;
  return value.toLowerCase().replace(/\s+/g, " ").includes(normalizedQuery);
}

function serviceExample(key: string, label: string, selectedServiceCodes: string[]): { key: string; label: string; values: ServicesForm } {
  return {
    key,
    label,
    values: {
      selectedServiceCodes,
      requestedServices: [],
      requestPanelOpen: false,
    },
  };
}

function isLocationAddressComplete(value: LocationAddressForm): boolean {
  const country = findCountry(value.countryCode);
  return Boolean(
    value.country.trim().length >= 2 &&
    value.addressLine1.trim().length >= 3 &&
    value.city.trim().length >= 2 &&
    value.stateRegion.trim().length >= 2 &&
    (!country.postalCodeRequired || value.postalCode.trim().length >= 3)
  );
}

function regionLabelFor(countryCode: string): string {
  return findCountry(countryCode).addressRegionLabel;
}

function postalLabelFor(countryCode: string): string {
  return findCountry(countryCode).postalCodeLabel;
}

function countryCodeFor(country: string): string {
  return findCountry(country).countryCode;
}

function address(country: string, countryCode: string, addressLine1: string, addressLine2: string, city: string, stateRegion: string, postalCode: string, landmark = ""): LocationAddressForm {
  return {
    country,
    countryCode,
    addressLine1,
    addressLine2,
    city,
    stateRegion,
    postalCode,
    landmark,
    latitude: "",
    longitude: "",
    verificationStatus: "Not verified",
  };
}

function indiaAddress(addressLine1: string, addressLine2: string, city: string, stateRegion: string, postalCode: string, landmark = ""): LocationAddressForm {
  return address("India", "IN", addressLine1, addressLine2, city, stateRegion, postalCode, landmark);
}

function serviceArea(coverageLevel: string, country: string, countryCode: string, stateRegion: string, cityDestination: string, localArea = ""): ServiceAreaForm {
  return {
    id: `area-${coverageLevel}-${countryCode}-${stateRegion}-${cityDestination}`.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    coverageLevel,
    country,
    countryCode,
    stateRegion,
    cityDestination,
    localArea,
  };
}

function makeLocationForm(input: { primary: LocationAddressForm; sameAsOperating: boolean; operating?: LocationAddressForm; areas: ServiceAreaForm[] }): BusinessLocationForm {
  return {
    primaryLocation: input.primary,
    sameAsOperating: input.sameAsOperating,
    operatingLocation: input.sameAsOperating ? input.primary : input.operating ?? input.primary,
    serviceAreas: input.areas,
  };
}

function statusText(status: "idle" | "saving" | "saved" | "error", lastSavedAt: string | null): string {
  if (status === "saving") return "Saving...";
  if (status === "error") return "Save failed";
  if (!lastSavedAt) return "Not saved yet";
  const elapsed = Math.max(0, Date.now() - new Date(lastSavedAt).getTime());
  if (elapsed < 60_000) return "Saved just now";
  return `Saved ${Math.floor(elapsed / 60_000)} min ago`;
}

function humanStatus(status: PartnerApplicationStepStatus, current: boolean): string {
  if (status === "completed") return "Complete";
  if (status === "needs-attention") return "Needs Attention";
  if (status === "under-review") return "Under Review";
  if (status === "locked") return "Locked";
  if (current || status === "in-progress") return "In Progress";
  return "Not Started";
}

function displayedStepStatus(
  stepId: WorkspaceStepId,
  activeStep: WorkspaceStepId,
  baseStatus: PartnerApplicationStepStatus,
  qaPreviewEnabled: boolean,
  accountStepOverride?: PartnerApplicationStepStatus,
  businessStepOverride?: PartnerApplicationStepStatus,
  locationStepOverride?: PartnerApplicationStepStatus,
  servicesStepOverride?: PartnerApplicationStepStatus
): PartnerApplicationStepStatus {
  if (qaPreviewEnabled) {
    if (stepId === "account_contact" && accountStepOverride) return accountStepOverride;
    if (stepId === "business_identity" && businessStepOverride) return businessStepOverride;
    if (stepId === "business_location" && locationStepOverride) return locationStepOverride;
    if (stepId === "services" && servicesStepOverride) return servicesStepOverride;
    if (stepId === activeStep) return baseStatus === "completed" ? "completed" : "in-progress";
    if (baseStatus === "locked") return "not-started";
  }
  if (stepId === "business_identity" && businessStepOverride && baseStatus !== "locked") return businessStepOverride;
  if (stepId === "business_location" && locationStepOverride && baseStatus !== "locked") return locationStepOverride;
  if (stepId === "services" && servicesStepOverride && baseStatus !== "locked") return servicesStepOverride;
  return baseStatus;
}

function isSubmittedFinal(readModel: ReturnType<typeof buildPartnerApplicationCenterReadModel>): boolean {
  return readModel.overallStatus === "under-review" || readModel.overallStatus === "changes-required" || readModel.overallStatus === "rejected";
}

function isWorkspaceStep(value: unknown): value is WorkspaceStepId {
  return typeof value === "string" && workspaceSteps.some((step) => step.id === value);
}

function readQaDraft(): { form: AccountContactForm; businessForm: BusinessIdentityForm; locationForm: BusinessLocationForm; servicesForm: ServicesForm; verified: { mobile: boolean; email: boolean }; activeStep: WorkspaceStepId; state: PartnerQaPreviewState; savedAt: string } | null {
  try {
    const raw = window.localStorage.getItem(qaDraftStorageKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<{ form: AccountContactForm; businessForm: BusinessIdentityForm; locationForm: BusinessLocationForm; servicesForm: ServicesForm; verified: { mobile: boolean; email: boolean }; activeStep: WorkspaceStepId; state: PartnerQaPreviewState; savedAt: string }>;
    const state = partnerQaPreviewStates.some((item) => item.id === parsed.state) ? parsed.state as PartnerQaPreviewState : null;
    if (!parsed.form || !parsed.verified || !isWorkspaceStep(parsed.activeStep) || !state) return null;
    return {
      form: { ...emptyForm(), ...parsed.form },
      businessForm: { ...emptyBusinessForm(), ...parsed.businessForm },
      locationForm: parsed.locationForm ? mergeLocationForm(parsed.locationForm) : emptyLocationForm(),
      servicesForm: parsed.servicesForm ? mergeServicesForm(parsed.servicesForm) : emptyServicesForm(),
      verified: { mobile: parsed.verified.mobile === true, email: parsed.verified.email === true },
      activeStep: parsed.activeStep,
      state,
      savedAt: typeof parsed.savedAt === "string" ? parsed.savedAt : new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

function writeQaDraft(input: { form: AccountContactForm; businessForm: BusinessIdentityForm; locationForm: BusinessLocationForm; servicesForm: ServicesForm; verified: { mobile: boolean; email: boolean }; activeStep: WorkspaceStepId; state: PartnerQaPreviewState; savedAt: string }) {
  window.localStorage.setItem(qaDraftStorageKey, JSON.stringify(input));
}

function mergeLocationForm(input: Partial<BusinessLocationForm>): BusinessLocationForm {
  const empty = emptyLocationForm();
  return {
    ...empty,
    ...input,
    primaryLocation: { ...empty.primaryLocation, ...input.primaryLocation },
    operatingLocation: { ...empty.operatingLocation, ...input.operatingLocation },
    serviceAreas: input.serviceAreas?.length ? input.serviceAreas.map((area, index) => ({ ...emptyServiceArea(), ...area, id: area.id || `area-${index + 1}` })) : empty.serviceAreas,
  };
}

function mergeServicesForm(input: Partial<ServicesForm>): ServicesForm {
  const selectedServiceCodes = Array.isArray(input.selectedServiceCodes)
    ? [...new Set(input.selectedServiceCodes.map(String).filter(Boolean))]
    : [];
  const requestedServices = Array.isArray(input.requestedServices)
    ? input.requestedServices.map((request, index) => requestedServiceFromRecord(asClientRecord(request), index)).filter((request) => request.requestedName || request.description)
    : [];
  return {
    organizationId: input.organizationId,
    selectedServiceCodes,
    requestedServices,
    requestPanelOpen: input.requestPanelOpen === true || requestedServices.length > 0,
  };
}

function maskMobile(value?: string): string {
  const digits = value?.replace(/\D/g, "") ?? "";
  return digits.length >= 4 ? `•••••• ${digits.slice(-4)}` : "Mobile not added";
}

function maskEmail(value?: string): string {
  if (!value) return "Email not added";
  const [name, domain] = value.split("@");
  if (!name || !domain) return "Email added";
  return `${name.slice(0, 1)}••••@${domain}`;
}

function parseQaPreviewState(value: string | undefined): PartnerQaPreviewState {
  return partnerQaPreviewStates.some((state) => state.id === value) ? value as PartnerQaPreviewState : "new";
}
