"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  Building2,
  Check,
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
  requestPartnerEmailVerification,
  requestPartnerMobileVerification,
  savePartnerAccountContactDraft,
  savePartnerBusinessIdentityDraft,
  savePartnerBusinessLocationDraft,
  savePartnerServicesDraft,
  verifyPartnerEmail,
  verifyPartnerMobile,
  type PartnerMobileChallenge,
  type PartnerOrganizationBundle,
  type PartnerRequirementClassification,
} from "../lib/partner/partnerApiClient";
import {
  filterEligiblePartnerServiceCatalog,
  findPartnerCatalogueItem,
  partnerServiceCatalog,
  partnerServiceEligibleForApplication,
  type PartnerServiceCatalogueItem,
  type PartnerServiceDomainId,
} from "../lib/partner/partnerServiceCatalog";
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
  const [qaVerifiedContacts, setQaVerifiedContacts] = useState({ mobile: false, email: false });

  const previewBundle = useMemo(() => qaPreviewEnabled ? buildPartnerQaPreviewBundle(qaPreviewState) : null, [qaPreviewEnabled, qaPreviewState]);
  const activeBundle = qaPreviewEnabled ? previewBundle : bundle;
  const selectedServices = useMemo(() => servicesForm.selectedServiceCodes.map((code) => {
    const item = findPartnerCatalogueItem(code);
    return { id: code, label: item?.name ?? code, keywords: item ? [item.shortDescription, ...item.aliases] : [] };
  }), [servicesForm.selectedServiceCodes]);
  const readModel = useMemo(() => buildPartnerApplicationCenterReadModel({ bundle: activeBundle, profile: minimalProfile(form), selectedServices }), [activeBundle, form, selectedServices]);
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
  const canCompleteStepFour = isServicesComplete(servicesForm, locationForm.primaryLocation.countryCode, businessForm.organizationType);

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
        setServicesForm(servicesFormFromBundle(result.data));
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
  }, [initialQaStep, isAuthenticated, qaPreviewEnabled, qaPreviewState, user]);

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
      if (isServicesComplete(servicesFormFromBundle(saved), locationForm.primaryLocation.countryCode, businessForm.organizationType)) {
        setActiveStep("documents_compliance");
      } else {
        setMessage({ tone: "warning", text: "Choose at least one service before continuing." });
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
                qaPreviewEnabled={qaPreviewEnabled}
                legacyScopes={activeBundle?.serviceScopes ?? []}
                onChange={updateServicesForm}
              />
            ) : (
              <PlaceholderStep step={workspaceSteps.find((step) => step.id === activeStep) ?? workspaceSteps[1]!} />
            )}
          </section>
          <HelpPanel activeStep={activeStep} />
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
  qaPreviewEnabled,
  legacyScopes,
  onChange,
}: {
  form: ServicesForm;
  businessType: string;
  countryCode: string;
  canComplete: boolean;
  qaPreviewEnabled: boolean;
  legacyScopes: PartnerOrganizationBundle["serviceScopes"];
  onChange: (next: ServicesFormUpdate) => void;
}) {
  const [domainQuery, setDomainQuery] = useState("");
  const [activeDomainIds, setActiveDomainIds] = useState<PartnerServiceDomainId[]>([]);
  const [serviceFilters, setServiceFilters] = useState<Record<string, string>>({});
  const eligibleCatalog = useMemo(() => filterEligiblePartnerServiceCatalog(partnerServiceCatalog, countryCode, businessType), [businessType, countryCode]);
  const selectedItems = useMemo(() => form.selectedServiceCodes.map((code) => findPartnerCatalogueItem(code)).filter(Boolean) as PartnerServiceCatalogueItem[], [form.selectedServiceCodes]);
  const selectedCodes = useMemo(() => new Set(form.selectedServiceCodes), [form.selectedServiceCodes]);
  const selectedDomainIds = useMemo(() => {
    const domains = selectedItems.map((item) => item.domain);
    return [...new Set(domains)];
  }, [selectedItems]);
  const selectedItemsByDomain = selectedDomainIds.map((domainId) => ({
    domainId,
    title: domainTitleFor(domainId),
    items: selectedItems.filter((item) => item.domain === domainId),
  }));
  const visibleDomainIds = [...new Set([...activeDomainIds, ...selectedDomainIds])];
  const activeDomains = visibleDomainIds
    .map((domainId) => eligibleCatalog.find((category) => category.id === domainId))
    .filter(Boolean) as typeof eligibleCatalog;
  const remainingDomains = eligibleCatalog.filter((category) => !visibleDomainIds.includes(category.id));
  const domainOptions = eligibleCatalog.filter((category) => matchesServiceSearch(category.title, domainQuery) || matchesServiceSearch(category.description, domainQuery));
  const selectedUnavailable = selectedItems.filter((item) => !partnerServiceEligibleForApplication(item, countryCode, businessType));
  const staleScopes = legacyScopes.filter((scope) => {
    if (scope.status === "disabled") return false;
    const item = findPartnerCatalogueItem(scope.serviceCode);
    return !item || !partnerServiceEligibleForApplication(item, countryCode, businessType);
  });
  const requestedComplete = form.requestedServices.some((request) => request.requestedName.trim().length >= 2 && request.description.trim().length >= 10);

  function addDomainBlock(domainId: PartnerServiceDomainId | "") {
    if (!domainId) return;
    setActiveDomainIds((current) => current.includes(domainId) ? current : [...current, domainId]);
    setDomainQuery("");
  }

  function toggleService(service: PartnerServiceCatalogueItem) {
    onChange((current) => {
      const currentCodes = new Set(current.selectedServiceCodes);
      const removing = currentCodes.has(service.stableCode);
      if (removing) {
        const remainingCodes = current.selectedServiceCodes.filter((code) => code !== service.stableCode);
        const domainStillSelected = remainingCodes.some((code) => findPartnerCatalogueItem(code)?.domain === service.domain);
        if (!domainStillSelected) {
          setActiveDomainIds((domains) => domains.filter((domainId) => domainId !== service.domain));
        }
        return { selectedServiceCodes: remainingCodes };
      }
      return {
        selectedServiceCodes: [...current.selectedServiceCodes, service.stableCode],
      };
    });
  }

  function removeDomainGroup(domainId: PartnerServiceDomainId) {
    onChange((current) => ({
      selectedServiceCodes: current.selectedServiceCodes.filter((code) => findPartnerCatalogueItem(code)?.domain !== domainId),
    }));
    setActiveDomainIds((current) => current.filter((id) => id !== domainId));
  }

  function editDomainGroup(domainId: PartnerServiceDomainId) {
    setActiveDomainIds((current) => current.includes(domainId) ? current : [...current, domainId]);
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
                if (selected) onChange(selected.values);
              }}
              className="h-10 rounded-xl border border-[#f97316]/30 bg-[#11141a] px-3 text-sm font-bold text-white outline-none focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/25"
            >
              <option value="">Choose a sample service set</option>
              {qaServicesExamples.map((example) => <option key={example.key} value={example.key}>{example.label}</option>)}
            </select>
          </div>
        ) : null}

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="grid min-w-0 gap-5">
            <section className="rounded-xl border border-white/10 bg-[#11141a] p-4" aria-labelledby="select-your-services-heading">
              <div className="flex flex-col gap-4">
                <SectionHeading title="Select Your Services" detail="Start with a service area, then choose the exact services you provide." />
                <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(220px,320px)]">
                  <label className="grid min-w-0 gap-2">
                    <span id="select-your-services-heading" className="text-xs font-black uppercase tracking-[0.1em] text-slate-300">Please select a service</span>
                    <select
                      data-primary-service-dropdown="true"
                      value=""
                      onChange={(event) => addDomainBlock(event.target.value as PartnerServiceDomainId | "")}
                      className="h-12 w-full rounded-xl border border-white/10 bg-[#0f1217] px-3 text-sm font-bold text-white outline-none focus:border-[#38bdf8] focus:ring-2 focus:ring-[#38bdf8]/25"
                    >
                      <option value="">Choose a service area</option>
                      {domainOptions.map((category) => (
                        <option key={category.id} value={category.id}>{category.title}</option>
                      ))}
                    </select>
                  </label>
                  <label className="relative grid min-w-0 gap-2">
                    <span className="text-xs font-black uppercase tracking-[0.1em] text-slate-300">Search service areas</span>
                    <Search className="pointer-events-none absolute left-3 top-[39px] text-slate-500" size={17} aria-hidden="true" />
                    <input
                      data-domain-search="true"
                      value={domainQuery}
                      onChange={(event) => setDomainQuery(event.target.value)}
                      placeholder="Search domains"
                      className="h-12 w-full rounded-xl border border-white/10 bg-[#0f1217] pl-10 pr-10 text-sm font-semibold text-white outline-none placeholder:text-slate-500 focus:border-[#38bdf8] focus:ring-2 focus:ring-[#38bdf8]/25"
                    />
                    {domainQuery ? (
                      <button type="button" onClick={() => setDomainQuery("")} className="absolute right-3 top-[39px] text-slate-400 hover:text-white" aria-label="Clear service area search">
                        <X size={16} aria-hidden="true" />
                      </button>
                    ) : null}
                  </label>
                </div>
                {eligibleCatalog.length ? null : (
                  <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 p-3 text-sm font-bold text-amber-100">
                    No service areas are available for this country and business type yet.
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-xl border border-white/10 bg-[#11141a] p-4" aria-labelledby="available-services-heading">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 id="available-services-heading" className="text-sm font-black text-white">Available Services</h2>
                  <p className="mt-1 text-xs font-semibold text-slate-400">Only services from your selected service area are shown here.</p>
                </div>
                <span className="rounded-full border border-[#38bdf8]/30 bg-[#38bdf8]/10 px-3 py-1 text-xs font-black text-[#bae6fd]">
                  {activeDomains.length} service area{activeDomains.length === 1 ? "" : "s"} open
                </span>
              </div>

              <div className="mt-4 grid gap-4">
                {activeDomains.length ? activeDomains.map((category, index) => {
                  const filter = serviceFilters[category.id] ?? "";
                  const services = category.services.filter((service) => {
                    const item = findPartnerCatalogueItem(service.id);
                    if (!item) return false;
                    return matchesServiceSearch(`${item.name} ${item.shortDescription} ${item.aliases.join(" ")} ${category.title}`, filter);
                  });
                  const selectedCount = category.services.filter((service) => selectedCodes.has(service.id)).length;
                  return (
                    <div key={category.id} className="rounded-xl border border-[#38bdf8]/20 bg-[#0f1217] p-3">
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div className="min-w-0">
                          <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[#38bdf8]">Service area {index + 1}</p>
                          <h3 className="mt-1 text-base font-black text-white">{category.title}</h3>
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
                          placeholder={`Search ${category.title}`}
                          className="h-11 w-full rounded-xl border border-white/10 bg-[#151922] pl-10 pr-10 text-sm font-semibold text-white outline-none placeholder:text-slate-500 focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/25"
                        />
                        {filter ? (
                          <button type="button" onClick={() => setServiceFilters((current) => ({ ...current, [category.id]: "" }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white" aria-label={`Clear ${category.title} service search`}>
                            <X size={16} aria-hidden="true" />
                          </button>
                        ) : null}
                      </label>

                      <div className="mt-3 grid gap-2">
                        {services.length ? services.map((service) => {
                          const item = findPartnerCatalogueItem(service.id);
                          if (!item) return null;
                          const selected = selectedCodes.has(item.stableCode);
                          return (
                            <button
                              key={item.stableCode}
                              type="button"
                              data-service-option={item.stableCode}
                              aria-pressed={selected}
                              onClick={() => toggleService(item)}
                              className={`grid min-h-[68px] grid-cols-[1fr_auto] items-start gap-3 rounded-xl border p-3 text-left transition focus:outline-none focus:ring-2 focus:ring-[#38bdf8]/35 ${selected ? "border-[#f97316]/70 bg-[#f97316]/12 shadow-[0_0_0_1px_rgba(249,115,22,0.2)]" : "border-white/10 bg-[#151922] hover:border-[#38bdf8]/35"}`}
                            >
                              <span className="min-w-0">
                                <span className="block text-sm font-black text-white">{item.name}</span>
                                <span className="mt-1 block text-xs font-semibold leading-5 text-slate-400">{item.shortDescription}</span>
                              </span>
                              <span className={`flex h-6 min-w-6 items-center justify-center rounded-full border text-[11px] font-black ${selected ? "border-[#f97316] bg-[#f97316] text-white" : "border-white/20 text-slate-500"}`}>
                                {selected ? <Check size={14} aria-hidden="true" /> : "+"}
                              </span>
                            </button>
                          );
                        }) : (
                          <div className="rounded-xl border border-white/10 bg-[#151922] p-4 text-sm font-semibold text-slate-300">
                            No matching services in this service area.
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }) : (
                  <div className="rounded-xl border border-dashed border-white/15 bg-[#0f1217] p-5 text-sm font-semibold text-slate-300">
                    Select a service area above to see available service options.
                  </div>
                )}
              </div>

              {selectedItems.length ? (
                <div className="mt-4 rounded-xl border border-white/10 bg-[#0f1217] p-3">
                  <label className="grid gap-2">
                    <span className="text-xs font-black uppercase tracking-[0.1em] text-slate-300">Add another service</span>
                    <select
                      data-add-service-dropdown="true"
                      value=""
                      onChange={(event) => addDomainBlock(event.target.value as PartnerServiceDomainId | "")}
                      disabled={!remainingDomains.length}
                      className="h-11 w-full rounded-xl border border-white/10 bg-[#151922] px-3 text-sm font-bold text-white outline-none disabled:cursor-not-allowed disabled:text-slate-500 focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/25"
                    >
                      <option value="">{remainingDomains.length ? "Choose another service area" : "All eligible service areas are open"}</option>
                      {remainingDomains.map((category) => (
                        <option key={category.id} value={category.id}>{category.title}</option>
                      ))}
                    </select>
                  </label>
                </div>
              ) : null}
            </section>
          </div>

          <section className="min-w-0 rounded-xl border border-white/10 bg-[#11141a] p-4 xl:sticky xl:top-4 xl:self-start" aria-labelledby="selected-services-summary-heading">
            <div className="flex flex-col gap-3">
              <div>
                <h2 id="selected-services-summary-heading" className="text-sm font-black text-white">Selected Services Summary</h2>
                <p className="mt-1 text-xs font-semibold text-slate-400">Your selected services are grouped by service area.</p>
              </div>
              <span className="w-fit rounded-full border border-[#f97316]/30 bg-[#f97316]/10 px-3 py-1 text-xs font-black text-[#fed7aa]">
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
                      <button type="button" onClick={() => editDomainGroup(group.domainId)} className="rounded-lg border border-[#38bdf8]/30 bg-[#38bdf8]/10 px-2 py-1 text-[11px] font-black text-[#bae6fd]">
                        Edit
                      </button>
                      <button type="button" onClick={() => removeDomainGroup(group.domainId)} className="rounded-lg border border-white/10 px-2 py-1 text-[11px] font-black text-slate-300 hover:border-[#f97316]/40 hover:text-[#fed7aa]">
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
                        <button type="button" onClick={() => toggleService(item)} aria-label={`Remove ${item.name}`} className="rounded-md p-1 text-slate-400 hover:bg-white/10 hover:text-[#fed7aa]">
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

            <button type="button" onClick={addRequest} className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-[#f97316]/40 bg-[#f97316]/10 px-3 text-xs font-black text-[#fed7aa] hover:border-[#f97316]">
              <Plus size={15} aria-hidden="true" />
              Request another service
            </button>

            {staleScopes.length || selectedUnavailable.length ? (
              <div className="mt-4 rounded-xl border border-amber-400/30 bg-amber-400/10 p-3 text-xs font-bold leading-5 text-amber-100">
                Some saved services need attention because they are no longer available for new selection. They are preserved in your draft history and are not counted for completion.
              </div>
            ) : null}
          </section>
        </div>

        {form.requestPanelOpen || form.requestedServices.length ? (
          <section className="rounded-xl border border-white/10 bg-[#11141a] p-4">
            <SectionHeading title="Can't Find Your Service?" detail="Tell us what you provide. This request does not publish or approve a new service automatically." />
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
                        {partnerServiceCatalog.map((category) => <option key={category.id} value={category.id}>{category.title}</option>)}
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
  return (
    <div className="border-t border-white/5 px-4 py-2">
      <div className="mx-auto grid max-w-7xl grid-cols-4 gap-1 sm:grid-cols-8">
        {workspaceSteps.map((step) => {
          const modelStatus = readModel.steps.find((item) => item.id === step.id)?.status ?? "locked";
          const status = displayedStepStatus(step.id, activeStep, modelStatus, qaPreviewEnabled, accountStepOverride, businessStepOverride, locationStepOverride, servicesStepOverride);
          const current = activeStep === step.id;
          return (
            <div key={step.id} data-application-progress-step={step.id} className="flex items-center gap-2">
              <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-black ${
                status === "completed" ? "bg-emerald-500 text-white" : current ? "bg-[#f97316] text-white" : "bg-white/10 text-slate-400"
              }`}>
                {status === "completed" ? <Check size={12} aria-hidden="true" /> : step.number}
              </span>
              <span className="hidden truncate text-[11px] font-black text-slate-300 md:block">{step.shortTitle}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function HelpPanel({ activeStep }: { activeStep: WorkspaceStepId }) {
  return (
    <aside className="hidden xl:block">
      <div className="sticky top-28 rounded-2xl border border-white/10 bg-[#171a20] p-5 shadow-2xl">
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
  const toneClass = tone === "success" ? "border-emerald-500/40 text-emerald-100" : tone === "error" ? "border-red-500/40 text-red-100" : tone === "warning" ? "border-[#f97316]/50 text-[#fed7aa]" : "border-sky-500/40 text-sky-100";
  return (
    <div role="status" aria-live="polite" className={`fixed left-1/2 top-24 z-50 w-[min(92vw,420px)] -translate-x-1/2 rounded-xl border bg-[#171a20] p-3 shadow-2xl ${toneClass}`}>
      <div className="flex items-start gap-3">
        <span className="mt-0.5 h-5 w-1 rounded-full bg-[#f97316]" />
        <p className="min-w-0 flex-1 text-sm font-bold">{text}</p>
        <button type="button" onClick={onDismiss} className="text-xs font-black text-slate-400">Dismiss</button>
      </div>
    </div>
  );
}

function PlaceholderStep({ step }: { step: (typeof workspaceSteps)[number] }) {
  const isStepFive = step.id === "documents_compliance";
  return (
    <div data-application-active-step={step.id} className="rounded-2xl border border-white/10 bg-[#171a20] p-6 shadow-2xl">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-[#fb923c]">Step {step.number}</p>
      <h1 className="mt-2 text-2xl font-black sm:text-3xl">{step.title}</h1>
      <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-300">
        {isStepFive
          ? "We'll show the checks required for your business and selected services. Detailed verification form comes in the next development step."
          : "Detailed form will be added in the next development step."}
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
    ? servicesDraft.selectedServiceCodes.map(String).filter((code) => findPartnerCatalogueItem(code))
    : [];
  const selectedFromScopes = bundle?.serviceScopes
    .filter((scope) => scope.status !== "disabled" && findPartnerCatalogueItem(scope.serviceCode))
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
    closestDomain: partnerServiceCatalog.some((category) => category.id === closestDomain) ? closestDomain as PartnerServiceDomainId : "",
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

function isServicesComplete(form: ServicesForm, countryCode: string, businessType: string): boolean {
  return form.selectedServiceCodes.some((code) => {
    const item = findPartnerCatalogueItem(code);
    return item ? partnerServiceEligibleForApplication(item, countryCode, businessType) : false;
  });
}

function domainTitleFor(domainId: PartnerServiceDomainId): string {
  return partnerServiceCatalog.find((category) => category.id === domainId)?.title ?? "Service";
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
      selectedServiceCodes: selectedServiceCodes.filter((code) => Boolean(findPartnerCatalogueItem(code))),
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
    ? [...new Set(input.selectedServiceCodes.map(String).filter((code) => findPartnerCatalogueItem(code)))]
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
