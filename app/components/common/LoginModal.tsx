"use client";

import {
  KeyboardEvent,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  Mail,
  Phone,
  Sparkles,
  X,
} from "lucide-react";
import { useAuth } from "@/app/hooks/useAuth";
import {
  fetchPublishedLoginPromoContent,
  getLoginPromoContent,
  type LoginPromoContent,
  type LoginPromoContext,
} from "@/app/lib/auth/loginPromoContent";
import { createPartnerRegistrationIntake } from "@/app/lib/partner/partnerRegistrationIntake";

type LoginModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

type LoginStep = "mobile" | "otp";
type RegisterMobileStep = "idle" | "otp" | "verified";
type EmailOtpStep = "idle" | "otp" | "verified";
type AuthMethod = "mobile" | "email";
type AccountTab = "personal" | "partner";
type PartnerView = "login" | "register";
type RegisterStep = "contact" | "service";

type CountryOption = {
  code: string;
  name: string;
  dialCode: string;
  minLength: number;
  maxLength: number;
  certifiedOtp: boolean;
};

const COUNTRY_OPTIONS: CountryOption[] = [
  { code: "IN", name: "India", dialCode: "91", minLength: 10, maxLength: 10, certifiedOtp: true },
  { code: "US", name: "United States", dialCode: "1", minLength: 10, maxLength: 10, certifiedOtp: false },
  { code: "GB", name: "United Kingdom", dialCode: "44", minLength: 10, maxLength: 10, certifiedOtp: false },
  { code: "AE", name: "United Arab Emirates", dialCode: "971", minLength: 8, maxLength: 9, certifiedOtp: false },
  { code: "SG", name: "Singapore", dialCode: "65", minLength: 8, maxLength: 8, certifiedOtp: false },
  { code: "AU", name: "Australia", dialCode: "61", minLength: 9, maxLength: 9, certifiedOtp: false },
  { code: "CA", name: "Canada", dialCode: "1", minLength: 10, maxLength: 10, certifiedOtp: false },
  { code: "DE", name: "Germany", dialCode: "49", minLength: 10, maxLength: 11, certifiedOtp: false },
  { code: "FR", name: "France", dialCode: "33", minLength: 9, maxLength: 9, certifiedOtp: false },
  { code: "OTHER", name: "Other", dialCode: "", minLength: 6, maxLength: 15, certifiedOtp: false },
];

const PARTNER_PRIMARY_CATEGORIES = [
  "Hotels & Resorts",
  "Homestay",
  "Cab / Taxi",
  "Activities",
  "Guide",
  "Travel Agency / DMC",
  "Marketplace Seller",
  "Others",
] as const;

const API_BASE_URL = process.env.NEXT_PUBLIC_TPL_API_BASE_URL?.replace(/\/+$/, "") || "";

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const {
    activeAccountType,
    setActiveAccountType,
    sendOtp,
    sendEmailOtp,
    verifyOtp,
    verifyEmailOtp,
    verifyOtpForSession,
    verifyEmailOtpForSession,
  } = useAuth();

  const titleId = useId();
  const descriptionId = useId();
  const mobileInputId = useId();
  const otpInputId = useId();
  const emailInputId = useId();
  const registerLegalNameInputId = useId();
  const registerMobileInputId = useId();
  const registerOtpInputId = useId();
  const registerEmailInputId = useId();
  const registerCategoryInputId = useId();
  const registerRequestedServiceInputId = useId();
  const registerTermsInputId = useId();
  const modalRef = useRef<HTMLDivElement | null>(null);
  const mobileInputRef = useRef<HTMLInputElement | null>(null);
  const otpInputRef = useRef<HTMLInputElement | null>(null);
  const emailInputRef = useRef<HTMLInputElement | null>(null);
  const previousFocusRef = useRef<Element | null>(null);

  const [step, setStep] = useState<LoginStep>("mobile");
  const [method, setMethod] = useState<AuthMethod>("mobile");
  const [partnerView, setPartnerView] = useState<PartnerView>("login");
  const [registerStep, setRegisterStep] = useState<RegisterStep>("contact");
  const [countryCode, setCountryCode] = useState("IN");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [emailOtp, setEmailOtp] = useState("");
  const [emailStep, setEmailStep] = useState<EmailOtpStep>("idle");
  const [emailResendAvailableAt, setEmailResendAvailableAt] = useState<number | null>(null);
  const [registerLegalName, setRegisterLegalName] = useState("");
  const [registerCountryCode, setRegisterCountryCode] = useState("IN");
  const [registerMobile, setRegisterMobile] = useState("");
  const [registerOtp, setRegisterOtp] = useState("");
  const [registerMobileStep, setRegisterMobileStep] = useState<RegisterMobileStep>("idle");
  const [registerVerifiedMobile, setRegisterVerifiedMobile] = useState("");
  const [registerResendAvailableAt, setRegisterResendAvailableAt] = useState<number | null>(null);
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerEmailOtp, setRegisterEmailOtp] = useState("");
  const [registerEmailStep, setRegisterEmailStep] = useState<EmailOtpStep>("idle");
  const [registerVerifiedEmail, setRegisterVerifiedEmail] = useState("");
  const [registerEmailResendAvailableAt, setRegisterEmailResendAvailableAt] = useState<number | null>(null);
  const [registerCategory, setRegisterCategory] = useState("Hotels & Resorts");
  const [registerRequestedService, setRegisterRequestedService] = useState("");
  const [registerTermsAccepted, setRegisterTermsAccepted] = useState(false);
  const [otp, setOtp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [infoText, setInfoText] = useState("");
  const [successText, setSuccessText] = useState("");
  const [resendAvailableAt, setResendAvailableAt] = useState<number | null>(null);
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [isCompactViewport, setIsCompactViewport] = useState(false);

  const activeTab: AccountTab = activeAccountType === "partner" ? "partner" : "personal";
  const selectedCountry = useMemo(() => getCountry(countryCode), [countryCode]);
  const cleanedMobile = useMemo(() => mobile.replace(/\D/g, ""), [mobile]);
  const cleanedOtp = useMemo(() => otp.replace(/\D/g, ""), [otp]);
  const normalizedEmail = useMemo(() => normalizeEmail(email), [email]);
  const cleanedEmailOtp = useMemo(() => emailOtp.replace(/\D/g, ""), [emailOtp]);
  const selectedRegisterCountry = useMemo(() => getCountry(registerCountryCode), [registerCountryCode]);
  const cleanedRegisterMobile = useMemo(() => registerMobile.replace(/\D/g, ""), [registerMobile]);
  const cleanedRegisterOtp = useMemo(() => registerOtp.replace(/\D/g, ""), [registerOtp]);
  const normalizedRegisterEmail = useMemo(() => normalizeEmail(registerEmail), [registerEmail]);
  const cleanedRegisterEmailOtp = useMemo(() => registerEmailOtp.replace(/\D/g, ""), [registerEmailOtp]);
  const isValidMobile = isNationalMobileValid(cleanedMobile, selectedCountry);
  const isValidRegisterMobile = isNationalMobileValid(cleanedRegisterMobile, selectedRegisterCountry);
  const isValidRegisterEmail = isEmailValid(normalizedRegisterEmail);
  const cleanedRequestedService = useMemo(() => sanitizePlainText(registerRequestedService).slice(0, 80), [registerRequestedService]);
  const isOtherRegisterCategory = registerCategory === "Others";
  const isCertifiedMobileOtp = selectedCountry.certifiedOtp && selectedCountry.code === "IN";
  const isValidEmail = isEmailValid(normalizedEmail);
  const isValidOtp = cleanedOtp.length === 6;
  const mobileHasInvalidValue = cleanedMobile.length > 0 && !isValidMobile;
  const emailHasInvalidValue = normalizedEmail.length > 0 && !isValidEmail;
  const resendSecondsRemaining = resendAvailableAt
    ? Math.max(0, Math.ceil((resendAvailableAt - nowMs) / 1000))
    : 0;
  const registerResendSecondsRemaining = registerResendAvailableAt
    ? Math.max(0, Math.ceil((registerResendAvailableAt - nowMs) / 1000))
    : 0;
  const emailResendSecondsRemaining = emailResendAvailableAt
    ? Math.max(0, Math.ceil((emailResendAvailableAt - nowMs) / 1000))
    : 0;
  const registerEmailResendSecondsRemaining = registerEmailResendAvailableAt
    ? Math.max(0, Math.ceil((registerEmailResendAvailableAt - nowMs) / 1000))
    : 0;
  const canSendOtp = method === "mobile" && isValidMobile && isCertifiedMobileOtp && !isSubmitting;
  const canVerifyOtp = method === "mobile" && isValidOtp && !isSubmitting;
  const canResendOtp = step === "otp" && canSendOtp && resendSecondsRemaining === 0;
  const canVerifyEmailOtp = method === "email" && cleanedEmailOtp.length === 6 && !isSubmitting;
  const canResendEmailOtp = emailStep === "otp" && isValidEmail && !isSubmitting && emailResendSecondsRemaining === 0;
  const canSendRegisterOtp = isValidRegisterMobile && selectedRegisterCountry.certifiedOtp && selectedRegisterCountry.code === "IN" && !isSubmitting;
  const canVerifyRegisterOtp = cleanedRegisterOtp.length === 6 && !isSubmitting;
  const canResendRegisterOtp = registerMobileStep === "otp" && canSendRegisterOtp && registerResendSecondsRemaining === 0;
  const normalizedRegisterMobile = useMemo(
    () => toBackendMobile(cleanedRegisterMobile, selectedRegisterCountry),
    [cleanedRegisterMobile, selectedRegisterCountry]
  );
  const isRegisterMobileVerified =
    registerMobileStep === "verified" && Boolean(normalizedRegisterMobile) && registerVerifiedMobile === normalizedRegisterMobile;
  const isRegisterEmailVerified = registerEmailStep === "verified" && registerVerifiedEmail === normalizedRegisterEmail;
  const canSendRegisterEmailOtp = isValidRegisterEmail && registerEmailStep === "idle" && !isSubmitting;
  const canVerifyRegisterEmailOtp = cleanedRegisterEmailOtp.length === 6 && !isSubmitting;
  const canResendRegisterEmailOtp = registerEmailStep === "otp" && isValidRegisterEmail && !isSubmitting && registerEmailResendSecondsRemaining === 0;
  const canContinueRegistration =
    registerLegalName.trim().length >= 2 &&
    isValidRegisterMobile &&
    isRegisterMobileVerified &&
    isRegisterEmailVerified &&
    isValidRegisterEmail &&
    Boolean(registerCategory) &&
    (!isOtherRegisterCategory || cleanedRequestedService.length >= 2) &&
    registerTermsAccepted;
  const maskedMobile = cleanedMobile.length >= 4 ? `XXXXX${cleanedMobile.slice(-4)}` : "";
  const promoContext: LoginPromoContext =
    activeTab === "partner" && partnerView === "register"
      ? "partner_registration"
      : activeTab === "partner"
        ? "partner_login"
        : "user_login";

  useEffect(() => {
    const checkViewport = () => setIsCompactViewport(window.innerWidth < 900);
    checkViewport();
    window.addEventListener("resize", checkViewport);
    return () => window.removeEventListener("resize", checkViewport);
  }, []);

  useEffect(() => {
    if (!resendAvailableAt && !emailResendAvailableAt && !registerResendAvailableAt && !registerEmailResendAvailableAt) return;
    const timer = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [emailResendAvailableAt, registerEmailResendAvailableAt, registerResendAvailableAt, resendAvailableAt]);

  useEffect(() => {
    if (!isOpen) return;

    previousFocusRef.current = document.activeElement;
    const timer = window.setTimeout(() => {
      if (method === "email") {
        emailInputRef.current?.focus();
      } else if (step === "otp") {
        otpInputRef.current?.focus();
      } else {
        mobileInputRef.current?.focus();
      }
    }, 0);

    return () => {
      window.clearTimeout(timer);
      const previousFocus = previousFocusRef.current;
      if (previousFocus instanceof HTMLElement && document.contains(previousFocus)) previousFocus.focus();
    };
  }, [isOpen, method, step]);

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  const resetChallengeState = useCallback(() => {
    setStep("mobile");
    setOtp("");
    setEmailOtp("");
    setEmailStep("idle");
    setErrorText("");
    setInfoText("");
    setSuccessText("");
    setResendAvailableAt(null);
    setEmailResendAvailableAt(null);
  }, []);

  const resetState = useCallback(() => {
    resetChallengeState();
    setMethod("mobile");
    setPartnerView("login");
    setRegisterStep("contact");
    setCountryCode("IN");
    setMobile("");
    setEmail("");
    setEmailOtp("");
    setEmailStep("idle");
    setEmailResendAvailableAt(null);
    setRegisterLegalName("");
    setRegisterCountryCode("IN");
    setRegisterMobile("");
    setRegisterOtp("");
    setRegisterMobileStep("idle");
    setRegisterVerifiedMobile("");
    setRegisterResendAvailableAt(null);
    setRegisterEmail("");
    setRegisterEmailOtp("");
    setRegisterEmailStep("idle");
    setRegisterVerifiedEmail("");
    setRegisterEmailResendAvailableAt(null);
    setRegisterCategory("Hotels & Resorts");
    setRegisterRequestedService("");
    setRegisterTermsAccepted(false);
    setIsSubmitting(false);
  }, [resetChallengeState]);

  const handleClose = useCallback(() => {
    if (isSubmitting) return;
    resetState();
    onClose();
  }, [isSubmitting, onClose, resetState]);

  const handleDialogKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      handleClose();
      return;
    }

    if (event.key !== "Tab") return;
    const focusableElements = getFocusableElements(modalRef.current);
    if (!focusableElements.length) return;
    const first = focusableElements[0];
    const last = focusableElements[focusableElements.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
      return;
    }
    if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const handleAccountTypeChange = (nextType: AccountTab) => {
    if (isSubmitting) return;
    setActiveAccountType(nextType);
    resetChallengeState();
    setPartnerView("login");
    setMethod("mobile");
    setInfoText("");
  };

  const handleMethodChange = (nextMethod: AuthMethod) => {
    if (isSubmitting) return;
    setMethod(nextMethod);
    resetChallengeState();
  };

  const handleSendOtp = async () => {
    if (method !== "mobile") return;
    if (!isValidMobile) {
      setErrorText("Enter a valid mobile number for the selected country.");
      return;
    }
    if (!isCertifiedMobileOtp) {
      setErrorText("WhatsApp OTP delivery is currently certified for India only. Global provider certification is pending.");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorText("");
      setInfoText("");
      setSuccessText("");

      const result = await sendOtp(toBackendMobile(cleanedMobile, selectedCountry), activeTab);

      setStep("otp");
      setResendAvailableAt(parseTimestamp(result?.resendAvailableAt));
      setNowMs(Date.now());
      setInfoText("OTP sent. Please enter the 6-digit code.");
    } catch (error) {
      setErrorText(toUserFacingAuthError(error, "Failed to send OTP."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResendOtp) return;

    try {
      setIsSubmitting(true);
      setErrorText("");
      setInfoText("");
      setSuccessText("");

      const result = await sendOtp(toBackendMobile(cleanedMobile, selectedCountry), activeTab);
      setOtp("");
      setResendAvailableAt(parseTimestamp(result?.resendAvailableAt));
      setNowMs(Date.now());
      setInfoText("OTP resent. Please enter the 6-digit code.");
    } catch (error) {
      setErrorText(toUserFacingAuthError(error, "Failed to resend OTP."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!canVerifyOtp) return;

    try {
      setIsSubmitting(true);
      setErrorText("");
      setInfoText("");
      setSuccessText("");

      await verifyOtp(toBackendMobile(cleanedMobile, selectedCountry), cleanedOtp, activeTab);

      if (activeTab === "partner") {
        setSuccessText("Signed in. Opening Partner Desk.");
        window.setTimeout(() => {
          resetState();
          window.location.assign("/partner-preview");
        }, 500);
        return;
      }

      setSuccessText("Login successful. Welcome to TPL GO.");
      window.setTimeout(() => {
        resetState();
        onClose();
      }, 700);
    } catch (error) {
      setErrorText(toUserFacingAuthError(error, "Failed to verify OTP."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailContinue = async () => {
    if (!isValidEmail) {
      setErrorText("Enter a valid email address.");
      return;
    }
    try {
      setIsSubmitting(true);
      setErrorText("");
      setInfoText("");
      setSuccessText("");
      const result = await sendEmailOtp(normalizedEmail, activeTab);
      setEmailOtp("");
      setEmailStep("otp");
      setEmailResendAvailableAt(parseTimestamp(result?.resendAvailableAt));
      setNowMs(Date.now());
      setInfoText("OTP sent by email. Please enter the 6-digit code.");
    } catch (error) {
      setErrorText(toUserFacingEmailAuthError(error, "Failed to send Email OTP."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyEmailOtp = async () => {
    if (!canVerifyEmailOtp) return;

    try {
      setIsSubmitting(true);
      setErrorText("");
      setInfoText("");
      setSuccessText("");

      await verifyEmailOtp(normalizedEmail, cleanedEmailOtp, activeTab);

      if (activeTab === "partner") {
        setSuccessText("Signed in. Opening Partner Desk.");
        window.setTimeout(() => {
          resetState();
          window.location.assign("/partner-preview");
        }, 500);
        return;
      }

      setSuccessText("Login successful. Welcome to TPL GO.");
      window.setTimeout(() => {
        resetState();
        onClose();
      }, 700);
    } catch (error) {
      setErrorText(toUserFacingEmailAuthError(error, "Failed to verify Email OTP."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendEmailOtp = async () => {
    if (!canResendEmailOtp) return;
    await handleEmailContinue();
  };

  const handleRegisterAsPartner = () => {
    setActiveAccountType("partner");
    resetChallengeState();
    setPartnerView("register");
    setRegisterStep("contact");
    setInfoText("");
  };

  const handleBackToPartnerLogin = () => {
    resetChallengeState();
    setPartnerView("login");
    setInfoText("");
  };

  const handleRegisterMobileChange = (value: string) => {
    const currentMobile = toBackendMobile(cleanedRegisterMobile, selectedRegisterCountry);
    const nextMobile = toBackendMobile(value.replace(/\D/g, ""), selectedRegisterCountry);
    setRegisterMobile(value);
    if (currentMobile === nextMobile) return;
    setRegisterOtp("");
    setRegisterMobileStep("idle");
    setRegisterVerifiedMobile("");
    setRegisterResendAvailableAt(null);
  };

  const handleRegisterEmailChange = (value: string) => {
    const currentEmail = normalizeEmail(registerEmail);
    const nextEmail = normalizeEmail(value);
    setRegisterEmail(value);
    if (currentEmail === nextEmail) return;
    setRegisterEmailOtp("");
    setRegisterEmailStep("idle");
    setRegisterVerifiedEmail("");
    setRegisterEmailResendAvailableAt(null);
  };

  const handleRegisterCountryChange = (value: string) => {
    const nextCountry = getCountry(value);
    const nextMobile = toBackendMobile(cleanedRegisterMobile, nextCountry);
    setRegisterCountryCode(value);
    if (registerVerifiedMobile && nextMobile === registerVerifiedMobile) return;
    setRegisterOtp("");
    setRegisterMobileStep("idle");
    setRegisterVerifiedMobile("");
    setRegisterResendAvailableAt(null);
  };

  const handleRegisterSendOtp = async () => {
    if (!isValidRegisterMobile) {
      setErrorText("Enter a valid service mobile number for the selected country.");
      return;
    }
    if (!selectedRegisterCountry.certifiedOtp || selectedRegisterCountry.code !== "IN") {
      setErrorText("WhatsApp OTP delivery is currently certified for India only. Global provider certification is pending.");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorText("");
      setInfoText("");
      setSuccessText("");

      const result = await sendOtp(toBackendMobile(cleanedRegisterMobile, selectedRegisterCountry), "partner");
      setRegisterOtp("");
      setRegisterMobileStep("otp");
      setRegisterResendAvailableAt(parseTimestamp(result?.resendAvailableAt));
      setNowMs(Date.now());
      setInfoText("OTP sent by WhatsApp. Verify the service mobile to continue.");
    } catch (error) {
      setErrorText(toUserFacingAuthError(error, "Failed to send OTP."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterVerifyOtp = async () => {
    if (!canVerifyRegisterOtp) return;

    try {
      setIsSubmitting(true);
      setErrorText("");
      setInfoText("");
      setSuccessText("");

      await verifyOtpForSession(toBackendMobile(cleanedRegisterMobile, selectedRegisterCountry), cleanedRegisterOtp, "partner");
      setRegisterVerifiedMobile(toBackendMobile(cleanedRegisterMobile, selectedRegisterCountry));
      setRegisterMobileStep("verified");
      setRegisterResendAvailableAt(null);
      setSuccessText("Mobile verified successfully.");
    } catch (error) {
      setErrorText(toUserFacingAuthError(error, "Failed to verify OTP."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterResendOtp = async () => {
    if (!canResendRegisterOtp) return;
    await handleRegisterSendOtp();
  };

  const handleRegisterSendEmailOtp = async () => {
    if (!isValidRegisterEmail) {
      setErrorText("Enter a valid business email address.");
      return;
    }
    try {
      setIsSubmitting(true);
      setErrorText("");
      setInfoText("");
      setSuccessText("");
      const result = await sendEmailOtp(normalizedRegisterEmail, "partner");
      setRegisterEmailOtp("");
      setRegisterEmailStep("otp");
      setRegisterVerifiedEmail("");
      setRegisterEmailResendAvailableAt(parseTimestamp(result?.resendAvailableAt));
      setNowMs(Date.now());
      setInfoText("OTP sent by email. Verify the business email to continue.");
    } catch (error) {
      setErrorText(toUserFacingEmailAuthError(error, "Failed to send Email OTP."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterVerifyEmailOtp = async () => {
    if (!canVerifyRegisterEmailOtp) return;

    try {
      setIsSubmitting(true);
      setErrorText("");
      setInfoText("");
      setSuccessText("");

      await verifyEmailOtpForSession(normalizedRegisterEmail, cleanedRegisterEmailOtp, "partner");
      setRegisterVerifiedEmail(normalizedRegisterEmail);
      setRegisterEmailStep("verified");
      setRegisterEmailResendAvailableAt(null);
      setSuccessText("Email verified successfully.");
    } catch (error) {
      setErrorText(toUserFacingEmailAuthError(error, "Failed to verify Email OTP."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterResendEmailOtp = async () => {
    if (!canResendRegisterEmailOtp) return;
    await handleRegisterSendEmailOtp();
  };

  const handleRegisterContinue = async () => {
    if (!canContinueRegistration) {
      setErrorText(
        registerStep === "contact"
          ? "Verify mobile and email before continuing."
          : isOtherRegisterCategory
            ? "Tell us your service and accept the Partner verification terms."
            : "Choose a primary service and accept the Partner verification terms."
      );
      return;
    }
    try {
      setIsSubmitting(true);
      setErrorText("");
      await createPartnerRegistrationIntake({
        legalName: registerLegalName.trim(),
        serviceMobileCountryCode: registerCountryCode,
        serviceMobile: cleanedRegisterMobile,
        businessEmail: normalizedRegisterEmail,
        primaryCategory: isOtherRegisterCategory ? "OTHER" : registerCategory,
        requestedServiceName: isOtherRegisterCategory ? cleanedRequestedService : undefined,
      });
      setSuccessText("Application started. Opening Partner Desk.");
      window.setTimeout(() => {
        resetState();
        window.location.assign("/partner-preview");
      }, 500);
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : "Partner registration could not be saved.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleAvailability = () => {
    setErrorText("");
    setInfoText("");
    if (!API_BASE_URL) {
      setErrorText("Google sign-in is not configured for this environment.");
      return;
    }
    setIsSubmitting(true);
    const returnTo = typeof window !== "undefined"
      ? activeTab === "partner"
        ? `${window.location.origin}/partner-preview`
        : `${window.location.origin}${window.location.pathname}${window.location.search}`
      : activeTab === "partner"
        ? "/partner-preview"
        : "/";
    window.location.assign(`${API_BASE_URL}/api/v1/auth/google?returnTo=${encodeURIComponent(returnTo)}`);
  };

  const handleBackToMobile = () => {
    if (isSubmitting) return;
    resetChallengeState();
  };

  if (!isOpen) return null;

  const shouldUseCompactContent =
    step === "otp" || emailStep === "otp" || partnerView === "register";
  const showGlobalLegal = !(activeTab === "partner" && partnerView === "register");

  return (
    <div onClick={handleClose} style={overlayStyle(isCompactViewport)}>
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
        onKeyDown={handleDialogKeyDown}
        style={modalShellStyle(isCompactViewport)}
      >
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close login dialog"
          disabled={isSubmitting}
          style={closeButtonStyle(isCompactViewport, isSubmitting)}
        >
          <X size={18} aria-hidden="true" />
        </button>

        <PromoPanel context={promoContext} isCompact={isCompactViewport} descriptionId={descriptionId} />

        <section style={rightPanelStyle(isCompactViewport)}>
          <TopAccountTabs
            activeAccountType={activeTab}
            isCompact={isCompactViewport}
            partnerMode={activeTab === "partner"}
            onChange={handleAccountTypeChange}
          />

          <div
            style={authPanelContentStyle(
              isCompactViewport,
              shouldUseCompactContent,
              activeTab === "partner"
            )}
          >
            <div style={headingBlockStyle}>
              <p style={eyebrowStyle}>{activeTab === "partner" ? "TPL GO PARTNER ACCESS" : "TPL GO ACCOUNT"}</p>
              <h2 id={titleId} style={titleStyle(isCompactViewport, activeTab === "partner" && partnerView === "register")}>
                {activeTab === "partner"
                  ? partnerView === "register"
                    ? "Start your Partner Application"
                    : "Partner Desk"
                  : step === "otp"
                    ? "Verify OTP"
                    : "Login or Sign up"}
              </h2>
              <p style={introTextStyle}>
                {activeTab === "partner"
                  ? partnerView === "register"
                    ? "Verify your contact details to get started."
                    : "Sign in to manage your TPL Partner account."
                  : "Sign in to bookings, trips, wallet, and traveller services."}
              </p>
            </div>

            <AuthMessageLayer
              successText={successText}
              errorText={errorText}
              infoText={infoText}
              isCompact={isCompactViewport}
            />

            <AuthPanel
              activeTab={activeTab}
              method={method}
              setMethod={handleMethodChange}
              partnerView={partnerView}
              step={step}
              mobileInputId={mobileInputId}
              mobileInputRef={mobileInputRef}
              countryCode={countryCode}
              setCountryCode={setCountryCode}
              mobile={mobile}
              setMobile={setMobile}
              selectedCountry={selectedCountry}
              mobileHasInvalidValue={mobileHasInvalidValue}
              isCertifiedMobileOtp={isCertifiedMobileOtp}
              canSendOtp={canSendOtp}
              isSubmitting={isSubmitting}
              onSendOtp={handleSendOtp}
              otpInputId={otpInputId}
              otpInputRef={otpInputRef}
              otp={otp}
              setOtp={setOtp}
              isValidOtp={isValidOtp}
              canVerifyOtp={canVerifyOtp}
              onVerifyOtp={handleVerifyOtp}
              onBackToMobile={handleBackToMobile}
              canResendOtp={canResendOtp}
              resendSecondsRemaining={resendSecondsRemaining}
              onResendOtp={handleResendOtp}
              maskedMobile={maskedMobile}
              emailInputId={emailInputId}
              emailInputRef={emailInputRef}
              email={email}
              setEmail={setEmail}
              emailHasInvalidValue={emailHasInvalidValue}
              isValidEmail={isValidEmail}
              emailStep={emailStep}
              emailOtp={emailOtp}
              setEmailOtp={setEmailOtp}
              canVerifyEmailOtp={canVerifyEmailOtp}
              canResendEmailOtp={canResendEmailOtp}
              emailResendSecondsRemaining={emailResendSecondsRemaining}
              onEmailContinue={handleEmailContinue}
              onVerifyEmailOtp={handleVerifyEmailOtp}
              onResendEmailOtp={handleResendEmailOtp}
              onGoogleAvailability={handleGoogleAvailability}
              onRegisterAsPartner={handleRegisterAsPartner}
              onBackToPartnerLogin={handleBackToPartnerLogin}
              registerLegalNameInputId={registerLegalNameInputId}
              registerMobileInputId={registerMobileInputId}
              registerOtpInputId={registerOtpInputId}
              registerEmailInputId={registerEmailInputId}
              registerCategoryInputId={registerCategoryInputId}
              registerTermsInputId={registerTermsInputId}
              registerLegalName={registerLegalName}
              setRegisterLegalName={setRegisterLegalName}
              registerCountryCode={registerCountryCode}
              setRegisterCountryCode={handleRegisterCountryChange}
              registerMobile={registerMobile}
              setRegisterMobile={handleRegisterMobileChange}
              registerMobileStep={registerMobileStep}
              isRegisterMobileVerified={isRegisterMobileVerified}
              registerOtp={registerOtp}
              setRegisterOtp={setRegisterOtp}
              canSendRegisterOtp={canSendRegisterOtp}
              canVerifyRegisterOtp={canVerifyRegisterOtp}
              canResendRegisterOtp={canResendRegisterOtp}
              registerResendSecondsRemaining={registerResendSecondsRemaining}
              onRegisterSendOtp={handleRegisterSendOtp}
              onRegisterVerifyOtp={handleRegisterVerifyOtp}
              onRegisterResendOtp={handleRegisterResendOtp}
              registerEmail={registerEmail}
              setRegisterEmail={handleRegisterEmailChange}
              registerEmailStep={registerEmailStep}
              isRegisterEmailVerified={isRegisterEmailVerified}
              registerEmailOtp={registerEmailOtp}
              setRegisterEmailOtp={setRegisterEmailOtp}
              canSendRegisterEmailOtp={canSendRegisterEmailOtp}
              canVerifyRegisterEmailOtp={canVerifyRegisterEmailOtp}
              canResendRegisterEmailOtp={canResendRegisterEmailOtp}
              registerEmailResendSecondsRemaining={registerEmailResendSecondsRemaining}
              onRegisterSendEmailOtp={handleRegisterSendEmailOtp}
              onRegisterVerifyEmailOtp={handleRegisterVerifyEmailOtp}
              onRegisterResendEmailOtp={handleRegisterResendEmailOtp}
              registerCategory={registerCategory}
              setRegisterCategory={setRegisterCategory}
              registerRequestedServiceInputId={registerRequestedServiceInputId}
              registerRequestedService={registerRequestedService}
              setRegisterRequestedService={setRegisterRequestedService}
              registerTermsAccepted={registerTermsAccepted}
              setRegisterTermsAccepted={setRegisterTermsAccepted}
              registerMobileInvalid={cleanedRegisterMobile.length > 0 && !isValidRegisterMobile}
              registerEmailInvalid={normalizedRegisterEmail.length > 0 && !isValidRegisterEmail}
              canContinueRegistration={canContinueRegistration}
              onRegisterContinue={handleRegisterContinue}
              registerStep={registerStep}
              setRegisterStep={setRegisterStep}
            />

            {showGlobalLegal ? (
              <p style={termsTextStyle(shouldUseCompactContent)}>
                By proceeding, you agree to the TPL GO Privacy Policy, User Agreement and T&amp;Cs.
              </p>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}

function PromoPanel({
  context,
  isCompact,
  descriptionId,
}: {
  context: LoginPromoContext;
  isCompact: boolean;
  descriptionId: string;
}) {
  const fallbackContent = useMemo(() => getLoginPromoContent(context), [context]);
  const [publishedContent, setPublishedContent] = useState<{ context: LoginPromoContext; content: LoginPromoContent } | null>(null);
  const content = publishedContent?.context === context ? publishedContent.content : fallbackContent;
  const ImageIcon = context === "partner_login" || context === "partner_registration" ? BriefcaseBusiness : Sparkles;

  useEffect(() => {
    let active = true;
    void fetchPublishedLoginPromoContent(context).then((configured) => {
      if (active && configured?.active) setPublishedContent({ context, content: configured });
    });
    return () => {
      active = false;
    };
  }, [context]);

  if (isCompact) {
    return (
      <aside style={promoPanelStyle(true, content.desktopImage, content.mobileImage)}>
        <PromoBrand content={content} />
        <div style={promoCopyStyle(true)}>
          <p style={promoEyebrowStyle}>{content.eyebrow}</p>
          <h3 style={promoHeadlineStyle(true)}>
            {content.headline} <span style={promoHighlightStyle}>{content.highlightedText}</span>
          </h3>
        </div>
      </aside>
    );
  }

  return (
    <aside style={promoPanelStyle(isCompact, content.desktopImage, content.mobileImage)}>
      <PromoBrand content={content} />
      <div style={promoCopyStyle(isCompact)}>
        <p style={promoEyebrowStyle}>{content.eyebrow}</p>
        <h3 style={promoHeadlineStyle(isCompact)}>
          {content.headline} <span style={promoHighlightStyle}>{content.highlightedText}</span>
        </h3>
        <p id={descriptionId} style={promoSubtitleStyle(isCompact)}>
          {content.subtitle}
        </p>
      </div>
      <div style={promoVisualStyle(isCompact)}>
        <ImageIcon size={isCompact ? 22 : 34} aria-hidden="true" />
      </div>
      <div style={benefitGridStyle(isCompact)}>
        {content.benefits.map((benefit) => (
          <BenefitLine key={benefit.title} benefit={benefit} isCompact={isCompact} />
        ))}
      </div>
      <p style={promoFooterStyle}>{content.footerTrustLine}</p>
    </aside>
  );
}

function PromoBrand({ content }: { content: LoginPromoContent }) {
  return (
    <div style={promoLogoRowStyle}>
      {content.brandLogoImage ? (
        <span aria-hidden="true" data-media-slot={content.brandMediaSlot} style={brandLogoImageStyle(content.brandLogoImage)} />
      ) : (
        <span style={brandMarkStyle}>TPL</span>
      )}
      <span style={brandWordStyle}>{content.brandLabel}</span>
    </div>
  );
}

function AuthPanel(props: {
  activeTab: AccountTab;
  method: AuthMethod;
  setMethod: (method: AuthMethod) => void;
  partnerView: PartnerView;
  step: LoginStep;
  mobileInputId: string;
  mobileInputRef: React.RefObject<HTMLInputElement | null>;
  countryCode: string;
  setCountryCode: (countryCode: string) => void;
  mobile: string;
  setMobile: (mobile: string) => void;
  selectedCountry: CountryOption;
  mobileHasInvalidValue: boolean;
  isCertifiedMobileOtp: boolean;
  canSendOtp: boolean;
  isSubmitting: boolean;
  onSendOtp: () => void;
  otpInputId: string;
  otpInputRef: React.RefObject<HTMLInputElement | null>;
  otp: string;
  setOtp: (otp: string) => void;
  isValidOtp: boolean;
  canVerifyOtp: boolean;
  onVerifyOtp: () => void;
  onBackToMobile: () => void;
  canResendOtp: boolean;
  resendSecondsRemaining: number;
  onResendOtp: () => void;
  maskedMobile: string;
  emailInputId: string;
  emailInputRef: React.RefObject<HTMLInputElement | null>;
  email: string;
  setEmail: (email: string) => void;
  emailHasInvalidValue: boolean;
  isValidEmail: boolean;
  emailStep: EmailOtpStep;
  emailOtp: string;
  setEmailOtp: (value: string) => void;
  canVerifyEmailOtp: boolean;
  canResendEmailOtp: boolean;
  emailResendSecondsRemaining: number;
  onEmailContinue: () => void;
  onVerifyEmailOtp: () => void;
  onResendEmailOtp: () => void;
  onGoogleAvailability: () => void;
  onRegisterAsPartner: () => void;
  onBackToPartnerLogin: () => void;
  registerLegalNameInputId: string;
  registerMobileInputId: string;
  registerOtpInputId: string;
  registerEmailInputId: string;
  registerCategoryInputId: string;
  registerRequestedServiceInputId: string;
  registerTermsInputId: string;
  registerLegalName: string;
  setRegisterLegalName: (value: string) => void;
  registerCountryCode: string;
  setRegisterCountryCode: (value: string) => void;
  registerMobile: string;
  setRegisterMobile: (value: string) => void;
  registerMobileStep: RegisterMobileStep;
  isRegisterMobileVerified: boolean;
  registerOtp: string;
  setRegisterOtp: (value: string) => void;
  canSendRegisterOtp: boolean;
  canVerifyRegisterOtp: boolean;
  canResendRegisterOtp: boolean;
  registerResendSecondsRemaining: number;
  onRegisterSendOtp: () => void;
  onRegisterVerifyOtp: () => void;
  onRegisterResendOtp: () => void;
  registerEmail: string;
  setRegisterEmail: (value: string) => void;
  registerEmailStep: EmailOtpStep;
  isRegisterEmailVerified: boolean;
  registerEmailOtp: string;
  setRegisterEmailOtp: (value: string) => void;
  canSendRegisterEmailOtp: boolean;
  canVerifyRegisterEmailOtp: boolean;
  canResendRegisterEmailOtp: boolean;
  registerEmailResendSecondsRemaining: number;
  onRegisterSendEmailOtp: () => void;
  onRegisterVerifyEmailOtp: () => void;
  onRegisterResendEmailOtp: () => void;
  registerCategory: string;
  setRegisterCategory: (value: string) => void;
  registerRequestedService: string;
  setRegisterRequestedService: (value: string) => void;
  registerTermsAccepted: boolean;
  setRegisterTermsAccepted: (value: boolean) => void;
  registerMobileInvalid: boolean;
  registerEmailInvalid: boolean;
  canContinueRegistration: boolean;
  onRegisterContinue: () => void;
  registerStep: RegisterStep;
  setRegisterStep: (step: RegisterStep) => void;
}) {
  const {
    activeTab,
    method,
    setMethod,
    partnerView,
    step,
    mobileInputId,
    mobileInputRef,
    countryCode,
    setCountryCode,
    mobile,
    setMobile,
    selectedCountry,
    mobileHasInvalidValue,
    isCertifiedMobileOtp,
    canSendOtp,
    isSubmitting,
    onSendOtp,
    otpInputId,
    otpInputRef,
    otp,
    setOtp,
    isValidOtp,
    canVerifyOtp,
    onVerifyOtp,
    onBackToMobile,
    canResendOtp,
    resendSecondsRemaining,
    onResendOtp,
    maskedMobile,
    emailInputId,
    emailInputRef,
    email,
    setEmail,
    emailHasInvalidValue,
    isValidEmail,
    emailStep,
    emailOtp,
    setEmailOtp,
    canVerifyEmailOtp,
    canResendEmailOtp,
    emailResendSecondsRemaining,
    onEmailContinue,
    onVerifyEmailOtp,
    onResendEmailOtp,
    onGoogleAvailability,
    onRegisterAsPartner,
    onBackToPartnerLogin,
    registerLegalNameInputId,
    registerMobileInputId,
    registerOtpInputId,
    registerEmailInputId,
    registerCategoryInputId,
    registerRequestedServiceInputId,
    registerTermsInputId,
    registerLegalName,
    setRegisterLegalName,
    registerCountryCode,
    setRegisterCountryCode,
    registerMobile,
    setRegisterMobile,
    registerMobileStep,
    isRegisterMobileVerified,
    registerOtp,
    setRegisterOtp,
    canSendRegisterOtp,
    canVerifyRegisterOtp,
    canResendRegisterOtp,
    registerResendSecondsRemaining,
    onRegisterSendOtp,
    onRegisterVerifyOtp,
    onRegisterResendOtp,
    registerEmail,
    setRegisterEmail,
    registerEmailStep,
    isRegisterEmailVerified,
    registerEmailOtp,
    setRegisterEmailOtp,
    canSendRegisterEmailOtp,
    canVerifyRegisterEmailOtp,
    canResendRegisterEmailOtp,
    registerEmailResendSecondsRemaining,
    onRegisterSendEmailOtp,
    onRegisterVerifyEmailOtp,
    onRegisterResendEmailOtp,
    registerCategory,
    setRegisterCategory,
    registerRequestedService,
    setRegisterRequestedService,
    registerTermsAccepted,
    setRegisterTermsAccepted,
    registerMobileInvalid,
    registerEmailInvalid,
    canContinueRegistration,
    onRegisterContinue,
    registerStep,
    setRegisterStep,
  } = props;
  const selectedRegisterCountry = getCountry(registerCountryCode);

  if (step === "otp") {
    return (
      <div style={activeTab === "partner" ? partnerCompactStackStyle : stackStyle}>
        <label htmlFor={otpInputId} style={labelStyle}>
          Enter OTP
        </label>
        <input
          ref={otpInputRef}
          id={otpInputId}
          value={otp}
          onChange={(event) => setOtp(sanitizeDigits(event.target.value).slice(0, 6))}
          onPaste={(event) => {
            event.preventDefault();
            setOtp(sanitizeDigits(event.clipboardData.getData("text")).slice(0, 6));
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") onVerifyOtp();
          }}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="Enter 6-digit OTP"
          aria-invalid={Boolean(otp && !isValidOtp)}
          disabled={isSubmitting}
          style={standaloneInputStyle}
        />
        <p style={helperTextStyle}>
          OTP sent to +{selectedCountry.dialCode} {maskedMobile}
        </p>
        <button type="button" onClick={onVerifyOtp} disabled={!canVerifyOtp} style={primaryButtonStyle(!canVerifyOtp)}>
          {isSubmitting ? "Verifying..." : activeTab === "partner" ? "Open Partner Desk" : "Verify OTP"}
        </button>
        <div style={secondaryActionRowStyle}>
          <button type="button" onClick={onBackToMobile} style={secondaryButtonStyle}>
            Change mobile
          </button>
          <button
            type="button"
            onClick={onResendOtp}
            disabled={!canResendOtp}
            style={resendButtonStyle(!canResendOtp)}
          >
            {resendSecondsRemaining > 0 ? `Resend in ${resendSecondsRemaining}s` : "Resend OTP"}
          </button>
        </div>
      </div>
    );
  }

  if (activeTab === "partner" && partnerView === "register") {
    const canContinueContact =
      registerLegalName.trim().length >= 2 &&
      isRegisterMobileVerified &&
      isRegisterEmailVerified &&
      !isSubmitting;

    return (
      <div style={registerFormStyle}>
        <RegisterProgress currentStep={registerStep} />

        {registerStep === "contact" ? (
          <div style={registerStepGridStyle}>
            <label htmlFor={registerLegalNameInputId} style={labelStyle}>
              Legal / Company Name
            </label>
            <input
              id={registerLegalNameInputId}
              value={registerLegalName}
              onChange={(event) => setRegisterLegalName(event.target.value)}
              type="text"
              autoComplete="organization"
              placeholder="Registered business or professional name"
              style={standaloneInputStyle}
            />

            <label htmlFor={registerMobileInputId} style={labelStyle}>
              Service mobile number
            </label>
            <div style={registerMobileVerifyRowStyle}>
              <div style={compactCountryMobileShellStyle(registerMobileInvalid)}>
                <select
                  aria-label="Service mobile country code"
                  value={registerCountryCode}
                  onChange={(event) => setRegisterCountryCode(event.target.value)}
                  style={compactCountryCodeSelectStyle}
                >
                  {COUNTRY_OPTIONS.map((item) => (
                    <option key={item.code} value={item.code}>
                      {item.dialCode ? `+${item.dialCode}` : "Other"}
                    </option>
                  ))}
                </select>
                <input
                  id={registerMobileInputId}
                  value={registerMobile}
                  onChange={(event) => setRegisterMobile(sanitizeDigits(event.target.value).slice(0, selectedRegisterCountry.maxLength || 15))}
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  placeholder="Mobile number"
                  aria-invalid={registerMobileInvalid}
                  style={compactInputStyle}
                />
              </div>
              <button
                type="button"
                onClick={onRegisterSendOtp}
                disabled={!canSendRegisterOtp || registerMobileStep !== "idle"}
                style={compactActionButtonStyle(!canSendRegisterOtp || registerMobileStep !== "idle")}
              >
                {isRegisterMobileVerified ? "Verified" : registerMobileStep === "otp" ? "OTP Sent" : "Verify"}
              </button>
            </div>
            {isRegisterMobileVerified ? <p style={verifiedTextStyle}>Mobile verified</p> : null}

            {registerMobileStep === "otp" ? (
              <div style={registerOtpBoxStyle}>
                <div style={registerOtpRowStyle}>
                  <input
                    id={registerOtpInputId}
                    value={registerOtp}
                    onChange={(event) => setRegisterOtp(sanitizeDigits(event.target.value).slice(0, 6))}
                    onPaste={(event) => {
                      event.preventDefault();
                      setRegisterOtp(sanitizeDigits(event.clipboardData.getData("text")).slice(0, 6));
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") onRegisterVerifyOtp();
                    }}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    aria-label="Enter OTP"
                    placeholder="6-digit code"
                    aria-invalid={Boolean(registerOtp && registerOtp.length !== 6)}
                    disabled={isSubmitting}
                    style={registerOtpInputStyle}
                  />
                  <button
                    type="button"
                    onClick={onRegisterVerifyOtp}
                    disabled={!canVerifyRegisterOtp}
                    style={compactActionButtonStyle(!canVerifyRegisterOtp)}
                  >
                    Verify OTP
                  </button>
                </div>
                <button
                  type="button"
                  onClick={onRegisterResendOtp}
                  disabled={!canResendRegisterOtp}
                  style={resendButtonStyle(!canResendRegisterOtp)}
                >
                  {registerResendSecondsRemaining > 0 ? `Resend in ${registerResendSecondsRemaining}s` : "Resend OTP"}
                </button>
              </div>
            ) : null}

            <label htmlFor={registerEmailInputId} style={labelStyle}>
              Business email
            </label>
            <div style={emailVerifyInputRowStyle}>
              <input
                id={registerEmailInputId}
                value={registerEmail}
                onChange={(event) => setRegisterEmail(event.target.value)}
                onBlur={() => setRegisterEmail(normalizeEmail(registerEmail))}
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="partner@example.com"
                aria-invalid={registerEmailInvalid}
                style={standaloneInputStyle}
              />
              <button
                type="button"
                onClick={onRegisterSendEmailOtp}
                disabled={!canSendRegisterEmailOtp}
                style={compactActionButtonStyle(!canSendRegisterEmailOtp)}
              >
                {isRegisterEmailVerified ? "Verified" : registerEmailStep === "otp" ? "OTP Sent" : "Verify"}
              </button>
            </div>
            {registerEmailInvalid ? <p style={warningTextStyle}>Enter a valid business email address.</p> : null}
            {isRegisterEmailVerified ? <p style={verifiedTextStyle}>Email verified</p> : null}
            {registerEmailStep === "otp" ? (
              <div style={registerOtpBoxStyle}>
                <div style={registerOtpRowStyle}>
                  <input
                    id={`${registerEmailInputId}-otp`}
                    value={registerEmailOtp}
                    onChange={(event) => setRegisterEmailOtp(sanitizeDigits(event.target.value).slice(0, 6))}
                    onPaste={(event) => {
                      event.preventDefault();
                      setRegisterEmailOtp(sanitizeDigits(event.clipboardData.getData("text")).slice(0, 6));
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") onRegisterVerifyEmailOtp();
                    }}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    aria-label="Enter Email OTP"
                    placeholder="6-digit code"
                    aria-invalid={Boolean(registerEmailOtp && registerEmailOtp.length !== 6)}
                    disabled={isSubmitting}
                    style={registerOtpInputStyle}
                  />
                  <button
                    type="button"
                    onClick={onRegisterVerifyEmailOtp}
                    disabled={!canVerifyRegisterEmailOtp}
                    style={compactActionButtonStyle(!canVerifyRegisterEmailOtp)}
                  >
                    Verify OTP
                  </button>
                </div>
                <p style={helperTextStyle}>Code sent to {maskEmail(registerEmail)}</p>
                <button
                  type="button"
                  onClick={onRegisterResendEmailOtp}
                  disabled={!canResendRegisterEmailOtp}
                  style={resendButtonStyle(!canResendRegisterEmailOtp)}
                >
                  {registerEmailResendSecondsRemaining > 0 ? `Resend in ${registerEmailResendSecondsRemaining}s` : "Resend OTP"}
                </button>
              </div>
            ) : null}
          </div>
        ) : (
          <div style={registerStepGridStyle}>
            <label htmlFor={registerCategoryInputId} style={labelStyle}>
              Primary Service Category
            </label>
            <select
              id={registerCategoryInputId}
              value={registerCategory}
              onChange={(event) => {
                setRegisterCategory(event.target.value);
                if (event.target.value !== "Others") setRegisterRequestedService("");
              }}
              style={standaloneSelectStyle}
            >
              {PARTNER_PRIMARY_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            {registerCategory === "Others" ? (
              <>
                <label htmlFor={registerRequestedServiceInputId} style={labelStyle}>
                  Tell us your service *
                </label>
                <input
                  id={registerRequestedServiceInputId}
                  value={registerRequestedService}
                  onChange={(event) => setRegisterRequestedService(sanitizePlainText(event.target.value).slice(0, 80))}
                  type="text"
                  inputMode="text"
                  autoComplete="off"
                  placeholder="e.g. Yacht Charter, Interpreter, Event Equipment"
                  style={standaloneInputStyle}
                />
              </>
            ) : null}

            <label htmlFor={registerTermsInputId} style={termsCheckStyle}>
              <input
                id={registerTermsInputId}
                type="checkbox"
                checked={registerTermsAccepted}
                onChange={(event) => setRegisterTermsAccepted(event.target.checked)}
              />
              <span>I agree to continue with TPL GO Partner verification.</span>
            </label>
          </div>
        )}

        <div style={registerFooterActionsStyle}>
          {registerStep === "contact" ? (
            <button
              type="button"
              onClick={() => setRegisterStep("service")}
              disabled={!canContinueContact}
              style={primaryButtonStyle(!canContinueContact)}
            >
              Continue
            </button>
          ) : (
            <button
              type="button"
              onClick={onRegisterContinue}
              disabled={!canContinueRegistration}
              style={primaryButtonStyle(!canContinueRegistration)}
            >
              Continue to Partner Desk
            </button>
          )}
          <div style={registerFooterLinkRowStyle}>
            {registerStep === "service" ? (
              <button type="button" onClick={() => setRegisterStep("contact")} style={plainLinkButtonStyle}>
                Back
              </button>
            ) : null}
            <button type="button" onClick={onBackToPartnerLogin} style={plainLinkButtonStyle}>
              Existing Partner? Sign in
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={activeTab === "partner" ? partnerCompactStackStyle : stackStyle}>
        <MethodSelector
          active={method}
          onChange={setMethod}
          onGoogleAvailability={onGoogleAvailability}
          isDense={activeTab === "partner" || emailStep === "otp"}
        />
      <AuthDivider isDense={activeTab === "partner" || emailStep === "otp"} />
      {method === "mobile" ? (
        <>
          <MobileIdentityInput
            id={mobileInputId}
            inputRef={mobileInputRef}
            countryCode={countryCode}
            onCountryChange={setCountryCode}
            value={mobile}
            onChange={setMobile}
            label={activeTab === "partner" ? "Partner mobile number" : "Mobile number"}
            invalid={mobileHasInvalidValue}
            onEnter={onSendOtp}
          />
          {mobileHasInvalidValue ? <p style={warningTextStyle}>Enter a valid mobile number for the selected country.</p> : null}
          {!isCertifiedMobileOtp ? (
            <p style={helperTextStyle}>Global mobile UI is supported. WhatsApp OTP delivery outside India is pending provider certification.</p>
          ) : null}
          <button type="button" onClick={onSendOtp} disabled={!canSendOtp} style={primaryButtonStyle(!canSendOtp)}>
            {isSubmitting ? "Sending OTP..." : activeTab === "partner" ? "Continue to Partner Desk" : "Continue"}
          </button>
        </>
      ) : (
        <>
          <label htmlFor={emailInputId} style={labelStyle}>
            Email address
          </label>
          <input
            ref={emailInputRef}
            id={emailInputId}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            onBlur={() => setEmail(normalizeEmail(email))}
            onKeyDown={(event) => {
              if (event.key === "Enter") onEmailContinue();
            }}
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder={activeTab === "partner" ? "partner@example.com" : "you@example.com"}
            aria-invalid={emailHasInvalidValue}
            style={standaloneInputStyle}
          />
          {emailHasInvalidValue ? <p style={warningTextStyle}>Enter a valid email address.</p> : null}
          {emailStep === "otp" ? (
            <>
              <p style={helperTextStyle}>OTP sent to {maskEmail(email)}</p>
              <label htmlFor={`${emailInputId}-otp`} style={labelStyle}>
                Enter OTP
              </label>
              <input
                id={`${emailInputId}-otp`}
                value={emailOtp}
                onChange={(event) => setEmailOtp(sanitizeDigits(event.target.value).slice(0, 6))}
                onPaste={(event) => {
                  event.preventDefault();
                  setEmailOtp(sanitizeDigits(event.clipboardData.getData("text")).slice(0, 6));
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") onVerifyEmailOtp();
                }}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="Enter 6-digit OTP"
                aria-invalid={Boolean(emailOtp && emailOtp.length !== 6)}
                disabled={isSubmitting}
                style={standaloneInputStyle}
              />
              <button
                type="button"
                onClick={onVerifyEmailOtp}
                disabled={!canVerifyEmailOtp}
                style={primaryButtonStyle(!canVerifyEmailOtp)}
              >
                {isSubmitting ? "Verifying..." : activeTab === "partner" ? "Open Partner Desk" : "Verify & Continue"}
              </button>
              <button
                type="button"
                onClick={onResendEmailOtp}
                disabled={!canResendEmailOtp}
                style={resendButtonStyle(!canResendEmailOtp)}
              >
                {emailResendSecondsRemaining > 0 ? `Resend in ${emailResendSecondsRemaining}s` : "Resend OTP"}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onEmailContinue}
              disabled={!isValidEmail}
              style={primaryButtonStyle(!isValidEmail)}
            >
              {isSubmitting ? "Sending OTP..." : "Send Email OTP"}
            </button>
          )}
        </>
      )}

      {activeTab === "partner" ? (
        <div style={registerInlineStyle}>
          <span style={registerTitleStyle}>New to TPL?</span>
          <button type="button" onClick={onRegisterAsPartner} style={registerButtonStyle}>
            Become a TPL Partner
            <ArrowRight size={16} aria-hidden="true" />
          </button>
        </div>
      ) : null}
    </div>
  );
}

function TopAccountTabs(props: {
  activeAccountType: AccountTab;
  isCompact: boolean;
  partnerMode: boolean;
  onChange: (type: AccountTab) => void;
}) {
  return (
    <div role="tablist" aria-label="Login area" style={topTabsStyle(props.isCompact, props.partnerMode)}>
      <button
        type="button"
        role="tab"
        aria-selected={props.activeAccountType === "personal"}
        onClick={() => props.onChange("personal")}
        style={topTabStyle(props.activeAccountType === "personal")}
      >
        <Phone size={17} aria-hidden="true" />
        User Login
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={props.activeAccountType === "partner"}
        onClick={() => props.onChange("partner")}
        style={topTabStyle(props.activeAccountType === "partner")}
      >
        <BriefcaseBusiness size={17} aria-hidden="true" />
        Partner Desk
      </button>
    </div>
  );
}

function MethodSelector({
  active,
  onChange,
  onGoogleAvailability,
  isDense = false,
}: {
  active: AuthMethod;
  onChange: (method: AuthMethod) => void;
  onGoogleAvailability: () => void;
  isDense?: boolean;
}) {
  return (
    <div aria-label="Authentication method" style={methodGridStyle(isDense)}>
      <button type="button" onClick={() => onChange("mobile")} style={methodButtonStyle(active === "mobile", isDense)}>
        <Phone size={16} aria-hidden="true" />
        Continue with Mobile
      </button>
      <button
        type="button"
        onClick={onGoogleAvailability}
        style={methodButtonStyle(false, isDense)}
      >
        <span aria-hidden="true" style={googleMarkStyle}>G</span>
        Continue with Google
      </button>
      <button type="button" onClick={() => onChange("email")} style={methodButtonStyle(active === "email", isDense)}>
        <Mail size={16} aria-hidden="true" />
        Continue with Email
      </button>
    </div>
  );
}

function AuthDivider({ isDense = false }: { isDense?: boolean }) {
  return (
    <div style={authDividerStyle(isDense)} aria-hidden="true">
      <span style={authDividerLineStyle} />
      <b>OR</b>
      <span style={authDividerLineStyle} />
    </div>
  );
}

function RegisterProgress({ currentStep }: { currentStep: RegisterStep }) {
  return (
    <div aria-label="Partner application progress" style={registerProgressStyle}>
      <span style={registerProgressItemStyle(currentStep === "contact", true)}>1 Contact</span>
      <span aria-hidden="true" style={registerProgressDividerStyle} />
      <span style={registerProgressItemStyle(currentStep === "service", currentStep === "service")}>2 Service</span>
    </div>
  );
}

function MobileIdentityInput(props: {
  id?: string;
  inputRef?: React.RefObject<HTMLInputElement | null>;
  countryCode: string;
  onCountryChange: (countryCode: string) => void;
  value: string;
  onChange: (value: string) => void;
  label: string;
  invalid: boolean;
  onEnter?: () => void;
}) {
  const { id, inputRef, countryCode, onCountryChange, value, onChange, label, invalid, onEnter } = props;
  const country = getCountry(countryCode);
  const maxLength = country.maxLength || 15;

  return (
    <div style={stackStyle}>
      <label htmlFor={id} style={labelStyle}>
        {label}
      </label>
      <div style={mobileInputShellStyle(invalid)}>
        <select
          aria-label={`${label} country and dial code`}
          value={countryCode}
          onChange={(event) => onCountryChange(event.target.value)}
          style={countrySelectStyle}
        >
          {COUNTRY_OPTIONS.map((item) => (
            <option key={item.code} value={item.code}>
              {item.name} {item.dialCode ? `+${item.dialCode}` : ""}
            </option>
          ))}
        </select>
        <input
          ref={inputRef}
          id={id}
          value={value}
          onChange={(event) => onChange(sanitizeDigits(event.target.value).slice(0, maxLength))}
          onPaste={(event) => {
            event.preventDefault();
            onChange(sanitizeDigits(event.clipboardData.getData("text")).slice(-maxLength));
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") onEnter?.();
          }}
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          placeholder="Mobile number"
          aria-invalid={invalid}
          style={compactInputStyle}
        />
      </div>
    </div>
  );
}

function BenefitLine({
  benefit,
  isCompact,
}: {
  benefit: { title: string; description: string; tone: "sky" | "emerald" | "amber" | "violet" };
  isCompact: boolean;
}) {
  return (
    <div style={benefitLineStyle}>
      <span aria-hidden="true" style={benefitIconStyle(isCompact, benefit.tone)}>
        <CheckCircle2 size={isCompact ? 13 : 15} />
      </span>
      <span style={benefitTextWrapStyle}>
        <strong style={benefitTitleStyle(isCompact)}>{benefit.title}</strong>
        <span style={benefitDescriptionStyle(isCompact)}>{benefit.description}</span>
      </span>
    </div>
  );
}

function StatusMessage({ tone, children }: { tone: "success" | "error" | "info" | "warning"; children: string }) {
  const styles = {
    success: { accent: "#f97316", icon: "#0b5fff", color: "#0f172a" },
    error: { accent: "#dc2626", icon: "#dc2626", color: "#7f1d1d" },
    info: { accent: "#f97316", icon: "#0b5fff", color: "#0f172a" },
    warning: { accent: "#f59e0b", icon: "#f97316", color: "#78350f" },
  }[tone];

  return (
    <div
      id={`login-${tone}-message`}
      role={tone === "error" ? "alert" : "status"}
      style={{
        position: "relative",
        overflow: "hidden",
        border: "1px solid #e2e8f0",
        borderLeft: `4px solid ${styles.accent}`,
        background: "rgba(255, 255, 255, 0.98)",
        color: styles.color,
        borderRadius: "11px",
        padding: "8px 10px 8px 11px",
        fontSize: "12px",
        lineHeight: "16px",
        fontWeight: 700,
        boxShadow: "0 14px 30px rgba(15, 23, 42, 0.13)",
        display: "flex",
        alignItems: "center",
        gap: "8px",
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: "8px",
          height: "8px",
          borderRadius: "999px",
          background: styles.icon,
          boxShadow: `0 0 0 3px ${tone === "error" ? "rgba(220, 38, 38, 0.1)" : "rgba(249, 115, 22, 0.12)"}`,
          flexShrink: 0,
        }}
      />
      {children}
    </div>
  );
}

function AuthMessageLayer({
  successText,
  errorText,
  infoText,
  isCompact,
}: {
  successText: string;
  errorText: string;
  infoText: string;
  isCompact: boolean;
}) {
  const messages = [
    ...(errorText ? [{ tone: "error" as const, text: errorText }] : []),
    ...(successText ? [{ tone: "success" as const, text: successText }] : []),
    ...(infoText ? [{ tone: "info" as const, text: infoText }] : []),
  ].slice(0, 2);
  if (!messages.length) return null;

  return (
    <div style={authMessageLayerStyle(isCompact)} aria-live="polite" aria-atomic="true">
      {messages.map((message) => (
        <StatusMessage key={`${message.tone}-${message.text}`} tone={message.tone}>
          {message.text}
        </StatusMessage>
      ))}
    </div>
  );
}

function getCountry(code: string): CountryOption {
  return COUNTRY_OPTIONS.find((item) => item.code === code) || COUNTRY_OPTIONS[0];
}

function sanitizeDigits(value: string) {
  return value.replace(/\D/g, "");
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function sanitizePlainText(value: string) {
  return value.replace(/[<>]/g, "").replace(/\s+/g, " ").trimStart();
}

function isEmailValid(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isNationalMobileValid(value: string, country: CountryOption) {
  return value.length >= country.minLength && value.length <= country.maxLength;
}

function toBackendMobile(nationalMobile: string, country: CountryOption) {
  if (country.code === "IN" && nationalMobile.length === 10) return nationalMobile;
  return `${country.dialCode}${nationalMobile}`.replace(/\D/g, "").slice(0, 15);
}

function parseTimestamp(value: string | undefined): number | null {
  if (!value) return null;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function toUserFacingAuthError(error: unknown, fallbackMessage: string) {
  const message = error instanceof Error ? error.message : fallbackMessage;
  const lower = message.toLowerCase();

  if (lower.includes("expired")) return "This OTP has expired. Please request a new code.";
  if (lower.includes("invalid") || lower.includes("incorrect")) return "The OTP entered is incorrect. Please try again.";
  if (lower.includes("too many") || lower.includes("max attempts")) return "Too many attempts. Please wait before trying again.";
  if (lower.includes("cooldown") || lower.includes("wait") || lower.includes("resend")) return message;
  if (lower.includes("provider") || lower.includes("unavailable") || lower.includes("delivery")) {
    return "WhatsApp OTP is temporarily unavailable. Please try again shortly.";
  }
  return message || fallbackMessage;
}

function toUserFacingEmailAuthError(error: unknown, fallbackMessage: string) {
  const message = error instanceof Error ? error.message : fallbackMessage;
  const lower = message.toLowerCase();

  if (lower.includes("expired")) return "This Email OTP has expired. Please request a new code.";
  if (lower.includes("invalid") || lower.includes("incorrect")) return "The OTP entered is incorrect. Please try again.";
  if (lower.includes("too many") || lower.includes("max attempts")) return "Too many attempts. Please wait before trying again.";
  if (lower.includes("linked to another")) return "This email is already linked to another TPL account.";
  if (lower.includes("provider") || lower.includes("unavailable") || lower.includes("delivery")) {
    return "Email OTP is temporarily unavailable. Please try again shortly.";
  }
  return message || fallbackMessage;
}

function maskEmail(value: string) {
  const email = normalizeEmail(value);
  const [local = "", domain = ""] = email.split("@");
  if (!local || !domain) return "your email";
  const visible = local.slice(0, 1);
  return `${visible}${"*".repeat(Math.min(Math.max(local.length - 1, 4), 7))}@${domain}`;
}

function getFocusableElements(root: HTMLElement | null): HTMLElement[] {
  if (!root) return [];
  return Array.from(
    root.querySelectorAll<HTMLElement>(
      'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
    )
  ).filter((element) => !element.hasAttribute("aria-hidden"));
}

function overlayStyle(isCompact: boolean): React.CSSProperties {
  return {
    position: "fixed",
    inset: 0,
    background: "rgba(2, 6, 23, 0.68)",
    backdropFilter: "blur(8px)",
    zIndex: 1000,
    display: "flex",
    alignItems: isCompact ? "flex-end" : "center",
    justifyContent: "center",
    padding: isCompact ? "10px" : "24px",
    overflow: "hidden",
  };
}

function modalShellStyle(isCompact: boolean): React.CSSProperties {
  return {
    width: isCompact ? "100%" : "min(900px, calc(100vw - 48px))",
    maxWidth: "100%",
    height: isCompact ? "auto" : "min(570px, calc(100vh - 40px))",
    maxHeight: isCompact ? "92dvh" : "90vh",
    minHeight: isCompact ? "auto" : "520px",
    overflow: "hidden",
    background: "#ffffff",
    borderRadius: isCompact ? "24px 24px 18px 18px" : "28px",
    display: "grid",
    gridTemplateColumns: isCompact ? "1fr" : "43fr 57fr",
    boxShadow: "0 24px 70px rgba(2, 6, 23, 0.34)",
    position: "relative",
    fontFamily: "inherit",
  };
}

function closeButtonStyle(isCompact: boolean, disabled: boolean): React.CSSProperties {
  return {
    position: "absolute",
    top: isCompact ? "12px" : "18px",
    right: isCompact ? "12px" : "18px",
    width: "34px",
    height: "34px",
    border: "1px solid rgba(148, 163, 184, 0.34)",
    borderRadius: "999px",
    background: isCompact ? "rgba(15, 23, 42, 0.5)" : "#ffffff",
    color: isCompact ? "#ffffff" : "#334155",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: disabled ? "not-allowed" : "pointer",
    zIndex: 5,
    boxShadow: isCompact ? "none" : "0 8px 24px rgba(15, 23, 42, 0.12)",
  };
}

function promoPanelStyle(isCompact: boolean, desktopImage: string, mobileImage?: string): React.CSSProperties {
  const image = isCompact ? mobileImage || desktopImage : desktopImage;
  return {
    minHeight: isCompact ? "90px" : "100%",
    height: isCompact ? "90px" : "100%",
    background: [
      "linear-gradient(180deg, rgba(4, 15, 34, 0.18), rgba(4, 15, 34, 0.82))",
      "linear-gradient(135deg, rgba(11, 95, 255, 0.5), rgba(3, 12, 32, 0.26) 50%, rgba(2, 6, 23, 0.82))",
      `url('${image}') center/cover`,
    ].join(", "),
    color: "#ffffff",
    padding: isCompact ? "12px 16px 10px" : "22px 22px 20px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    gap: isCompact ? "5px" : "9px",
    position: "relative",
  };
}

function rightPanelStyle(isCompact: boolean): React.CSSProperties {
  return {
    minHeight: 0,
    maxHeight: isCompact ? "calc(92dvh - 90px)" : "100%",
    overflow: "hidden",
    padding: isCompact ? "14px 14px 16px" : "24px 34px 22px",
    display: "flex",
    flexDirection: "column",
    background: "#ffffff",
    position: "relative",
  };
}

const promoLogoRowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
};

const brandMarkStyle: React.CSSProperties = {
  width: "34px",
  height: "34px",
  borderRadius: "11px",
  background: "#ffffff",
  color: "#0b5fff",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "12px",
  fontWeight: 950,
};

function brandLogoImageStyle(imageUrl: string): React.CSSProperties {
  return {
    width: "34px",
    height: "34px",
    borderRadius: "11px",
    backgroundColor: "#ffffff",
    backgroundImage: `url(${imageUrl})`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
    backgroundSize: "contain",
    display: "inline-block",
  };
}

const brandWordStyle: React.CSSProperties = {
  fontSize: "13px",
  fontWeight: 900,
  letterSpacing: 0,
};

function promoCopyStyle(isCompact: boolean): React.CSSProperties {
  return {
    display: "grid",
    gap: isCompact ? "3px" : "6px",
  };
}

const promoEyebrowStyle: React.CSSProperties = {
  margin: 0,
  color: "#93c5fd",
  fontSize: "10px",
  lineHeight: "14px",
  fontWeight: 850,
  textTransform: "uppercase",
  letterSpacing: 0,
};

function promoHeadlineStyle(isCompact: boolean): React.CSSProperties {
  return {
    margin: 0,
    maxWidth: "340px",
    color: "#ffffff",
    fontSize: isCompact ? "18px" : "33px",
    lineHeight: isCompact ? "23px" : "38px",
    fontWeight: 900,
    letterSpacing: 0,
  };
}

const promoHighlightStyle: React.CSSProperties = {
  color: "#7dd3fc",
};

function promoSubtitleStyle(isCompact: boolean): React.CSSProperties {
  return {
    margin: 0,
    maxWidth: "330px",
    color: "#dbeafe",
    fontSize: isCompact ? "11px" : "13px",
    lineHeight: isCompact ? "16px" : "19px",
    fontWeight: 650,
  };
}

function promoVisualStyle(isCompact: boolean): React.CSSProperties {
  return {
    width: isCompact ? "34px" : "44px",
    height: isCompact ? "34px" : "44px",
    borderRadius: "15px",
    background: "rgba(255, 255, 255, 0.16)",
    border: "1px solid rgba(255, 255, 255, 0.24)",
    display: isCompact ? "none" : "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  };
}

function benefitGridStyle(isCompact: boolean): React.CSSProperties {
  return {
    display: isCompact ? "none" : "grid",
    gap: "6px",
  };
}

const promoFooterStyle: React.CSSProperties = {
  margin: 0,
  color: "#bfdbfe",
  fontSize: "11px",
  lineHeight: "15px",
  fontWeight: 750,
};

function authPanelContentStyle(isCompact: boolean, shouldScroll: boolean, partnerMode = false): React.CSSProperties {
  return {
    minHeight: 0,
    flex: "1 1 auto",
    overflowY: isCompact || shouldScroll ? "auto" : "visible",
    overscrollBehavior: "contain",
    scrollbarGutter: shouldScroll ? "stable" : "auto",
    display: "flex",
    flexDirection: "column",
    gap: shouldScroll ? (isCompact ? "7px" : "6px") : partnerMode ? (isCompact ? "8px" : "8px") : "10px",
    paddingBottom: shouldScroll ? (isCompact ? "12px" : "10px") : partnerMode ? (isCompact ? "6px" : "4px") : 0,
  };
}

const headingBlockStyle: React.CSSProperties = {
  display: "grid",
  gap: "3px",
};

const eyebrowStyle: React.CSSProperties = {
  margin: 0,
  color: "#0b5fff",
  fontSize: "10px",
  lineHeight: "14px",
  fontWeight: 900,
  letterSpacing: 0,
};

function titleStyle(isCompact: boolean, compactDesktop = false): React.CSSProperties {
  return {
    margin: 0,
    fontSize: isCompact ? "22px" : compactDesktop ? "24px" : "27px",
    lineHeight: isCompact ? "28px" : compactDesktop ? "30px" : "33px",
    color: "#0f172a",
    fontWeight: 950,
    letterSpacing: 0,
    whiteSpace: compactDesktop && !isCompact ? "nowrap" : "normal",
  };
}

const introTextStyle: React.CSSProperties = {
  margin: 0,
  fontSize: "13px",
  lineHeight: "18px",
  color: "#64748b",
  fontWeight: 650,
};

function authMessageLayerStyle(isCompact: boolean): React.CSSProperties {
  return {
    position: "sticky",
    top: isCompact ? "0" : "4px",
    zIndex: 6,
    display: "grid",
    gap: "5px",
    width: "min(100%, 420px)",
    margin: isCompact ? "0 auto 2px" : "0 auto 3px",
    pointerEvents: "none",
  };
}

function topTabsStyle(isCompact: boolean, partnerMode = false): React.CSSProperties {
  return {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    border: "1px solid #dbe4ef",
    borderRadius: "999px",
    background: "#eef3f8",
    padding: "4px",
    gap: "4px",
    margin: isCompact ? "0 0 12px" : partnerMode ? "0 42px 8px 0" : "0 42px 14px 0",
    flexShrink: 0,
  };
}

function topTabStyle(active: boolean): React.CSSProperties {
  return {
    minHeight: "42px",
    border: "none",
    borderRadius: "999px",
    background: active ? "linear-gradient(135deg, #0b5fff, #0284c7)" : "transparent",
    color: active ? "#ffffff" : "#475569",
    fontWeight: 900,
    fontSize: "12px",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    boxShadow: active ? "0 7px 18px rgba(11, 95, 255, 0.28)" : "none",
    transition: "all 0.18s ease",
    letterSpacing: 0,
  };
}

const stackStyle: React.CSSProperties = {
  display: "grid",
  gap: "9px",
};

const partnerCompactStackStyle: React.CSSProperties = {
  display: "grid",
  gap: "4px",
};

const registerFormStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateRows: "auto minmax(0, 1fr) auto",
  gap: "4px",
  minHeight: 0,
  flex: "1 1 auto",
};

const registerStepGridStyle: React.CSSProperties = {
  display: "grid",
  gap: "5px",
  minHeight: 0,
  paddingBottom: "10px",
  overflowY: "auto",
  overscrollBehavior: "contain",
};

const registerProgressStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) 22px minmax(0, 1fr)",
  alignItems: "center",
  gap: "6px",
  margin: "0 0 2px",
};

function registerProgressItemStyle(active: boolean, complete: boolean): React.CSSProperties {
  return {
    minHeight: "26px",
    borderRadius: "999px",
    border: active ? "1px solid #0b5fff" : "1px solid #dbe4ef",
    background: active ? "#eff6ff" : complete ? "#ecfdf5" : "#f8fafc",
    color: active ? "#0b5fff" : complete ? "#047857" : "#64748b",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0 8px",
    fontSize: "11px",
    lineHeight: "15px",
    fontWeight: 900,
    textAlign: "center",
    whiteSpace: "nowrap",
  };
}

const registerProgressDividerStyle: React.CSSProperties = {
  height: "1px",
  background: "#cbd5e1",
};

function methodGridStyle(isDense = false): React.CSSProperties {
  return {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: isDense ? "5px" : "7px",
  };
}

function methodButtonStyle(active: boolean, isDense = false): React.CSSProperties {
  return {
    minHeight: isDense ? "41px" : "44px",
    border: active ? "1px solid #0b5fff" : "1px solid #d9e2ec",
    borderRadius: "12px",
    background: active ? "linear-gradient(180deg, #f4f9ff, #eaf3ff)" : "#ffffff",
    color: active ? "#0b5fff" : "#334155",
    fontWeight: 850,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "7px",
    fontSize: "14px",
  };
}

const googleMarkStyle: React.CSSProperties = {
  width: "19px",
  height: "19px",
  borderRadius: "999px",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#ffffff",
  border: "1px solid #d9e2ec",
  color: "#111827",
  fontWeight: 900,
  fontSize: "11px",
};

function authDividerStyle(isDense: boolean): React.CSSProperties {
  return {
    display: "grid",
    gridTemplateColumns: "1fr auto 1fr",
    alignItems: "center",
    gap: isDense ? "7px" : "9px",
    color: "#94a3b8",
    fontSize: "10px",
    lineHeight: "14px",
    fontWeight: 850,
    margin: isDense ? "-1px 0" : 0,
  };
}

const authDividerLineStyle: React.CSSProperties = {
  height: "1px",
  background: "#e2e8f0",
};

const labelStyle: React.CSSProperties = {
  fontSize: "12px",
  lineHeight: "16px",
  fontWeight: 850,
  color: "#0f172a",
};

const helperTextStyle: React.CSSProperties = {
  margin: 0,
  fontSize: "11px",
  lineHeight: "16px",
  color: "#64748b",
  fontWeight: 650,
};

const warningTextStyle: React.CSSProperties = {
  margin: 0,
  fontSize: "11px",
  lineHeight: "16px",
  color: "#b45309",
  fontWeight: 750,
};

function mobileInputShellStyle(invalid: boolean): React.CSSProperties {
  return {
    minHeight: "46px",
    border: invalid ? "1px solid #f97316" : "1px solid #cbd5e1",
    borderRadius: "12px",
    display: "grid",
    gridTemplateColumns: "minmax(108px, 0.74fr) minmax(0, 1.26fr)",
    overflow: "hidden",
    background: "#ffffff",
  };
}

const countrySelectStyle: React.CSSProperties = {
  border: "none",
  borderRight: "1px solid #e2e8f0",
  outline: "none",
  padding: "0 9px 0 11px",
  color: "#1e293b",
  fontSize: "13px",
  fontWeight: 800,
  background: "#f8fafc",
  fontFamily: "inherit",
  minWidth: 0,
};

const compactInputStyle: React.CSSProperties = {
  minWidth: 0,
  height: "46px",
  border: "none",
  outline: "none",
  padding: "0 12px",
  fontSize: "14px",
  lineHeight: "20px",
  color: "#0f172a",
  background: "transparent",
  fontFamily: "inherit",
  fontVariantNumeric: "tabular-nums",
  fontFeatureSettings: '"tnum" 1',
  letterSpacing: 0,
};

const standaloneInputStyle: React.CSSProperties = {
  width: "100%",
  minWidth: 0,
  height: "46px",
  border: "1px solid #cbd5e1",
  borderRadius: "12px",
  outline: "none",
  padding: "0 12px",
  fontSize: "14px",
  lineHeight: "20px",
  color: "#0f172a",
  background: "#ffffff",
  fontFamily: "inherit",
  fontVariantNumeric: "tabular-nums",
  fontFeatureSettings: '"tnum" 1',
  letterSpacing: 0,
};

const standaloneSelectStyle: React.CSSProperties = {
  ...standaloneInputStyle,
  appearance: "auto",
};

function primaryButtonStyle(disabled: boolean): React.CSSProperties {
  return {
    minHeight: "48px",
    border: "none",
    borderRadius: "10px",
    background: disabled ? "#fed7aa" : "#f97316",
    color: disabled ? "#64748b" : "#ffffff",
    fontWeight: 900,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: 0.98,
    letterSpacing: 0,
    padding: "0 14px",
    fontSize: "14px",
    boxShadow: disabled ? "none" : "0 10px 20px rgba(249, 115, 22, 0.22)",
  };
}

const secondaryActionRowStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "10px",
};

const secondaryButtonStyle: React.CSSProperties = {
  minHeight: "42px",
  border: "1px solid #cbd5e1",
  borderRadius: "13px",
  background: "#ffffff",
  color: "#334155",
  fontWeight: 850,
  cursor: "pointer",
  padding: "0 12px",
};

function resendButtonStyle(disabled: boolean): React.CSSProperties {
  return {
    ...secondaryButtonStyle,
    border: "1px solid #bfdbfe",
    background: disabled ? "#f1f5f9" : "#eff6ff",
    color: disabled ? "#64748b" : "#0b5fff",
    cursor: disabled ? "not-allowed" : "pointer",
  };
}

const registerMobileVerifyRowStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) auto",
  alignItems: "center",
  gap: "8px",
  marginTop: "-3px",
};

function compactCountryMobileShellStyle(invalid: boolean): React.CSSProperties {
  return {
    height: "44px",
    border: invalid ? "1px solid #ef4444" : "1px solid #cbd5e1",
    borderRadius: "11px",
    display: "grid",
    gridTemplateColumns: "72px minmax(0, 1fr)",
    overflow: "hidden",
    background: "#ffffff",
  };
}

const compactCountryCodeSelectStyle: React.CSSProperties = {
  ...countrySelectStyle,
  width: "72px",
  padding: "0 7px",
  fontSize: "12px",
  background: "#f8fafc",
};

const emailVerifyInputRowStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) auto",
  alignItems: "center",
  gap: "8px",
};

const verifiedTextStyle: React.CSSProperties = {
  margin: "-2px 0 0",
  color: "#047857",
  fontSize: "11px",
  lineHeight: "16px",
  fontWeight: 850,
};

function compactActionButtonStyle(disabled: boolean): React.CSSProperties {
  return {
    minHeight: "36px",
    border: "1px solid #0b5fff",
    borderRadius: "10px",
    background: disabled ? "#f1f5f9" : "#0b5fff",
    color: disabled ? "#64748b" : "#ffffff",
    padding: "0 12px",
    fontSize: "12px",
    lineHeight: "16px",
    fontWeight: 900,
    cursor: disabled ? "not-allowed" : "pointer",
    whiteSpace: "nowrap",
  };
}

const registerOtpBoxStyle: React.CSSProperties = {
  display: "grid",
  gap: "4px",
  border: "1px solid #dbeafe",
  borderRadius: "12px",
  background: "#f8fbff",
  padding: "6px",
};

const registerOtpRowStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) auto",
  gap: "8px",
  alignItems: "center",
};

const registerOtpInputStyle: React.CSSProperties = {
  ...standaloneInputStyle,
  height: "38px",
  borderRadius: "10px",
};

const registerFooterActionsStyle: React.CSSProperties = {
  display: "grid",
  gap: "4px",
  paddingTop: "5px",
  background: "#ffffff",
};

const registerFooterLinkRowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "10px",
};

const registerInlineStyle: React.CSSProperties = {
  minHeight: "38px",
  marginTop: "0",
  borderTop: "1px solid #e2e8f0",
  paddingTop: "5px",
  paddingBottom: "7px",
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) minmax(160px, auto)",
  alignItems: "center",
  gap: "8px",
};

const registerTitleStyle: React.CSSProperties = {
  margin: 0,
  color: "#0f172a",
  fontSize: "13px",
  lineHeight: "17px",
  fontWeight: 900,
};

const registerButtonStyle: React.CSSProperties = {
  minHeight: "36px",
  border: "1px solid #f97316",
  borderRadius: "10px",
  background: "#ffffff",
  color: "#c2410c",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  fontWeight: 900,
  cursor: "pointer",
  padding: "0 10px",
  whiteSpace: "nowrap",
  width: "100%",
};

const plainLinkButtonStyle: React.CSSProperties = {
  border: "none",
  background: "transparent",
  color: "#0b5fff",
  fontSize: "11px",
  lineHeight: "16px",
  fontWeight: 850,
  cursor: "pointer",
  padding: "0",
};

const termsCheckStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  gap: "8px",
  color: "#475569",
  fontSize: "11px",
  lineHeight: "16px",
  fontWeight: 700,
};

const benefitLineStyle: React.CSSProperties = {
  display: "flex",
  gap: "8px",
  alignItems: "center",
  minHeight: "40px",
  padding: "6px 8px",
  borderRadius: "12px",
  background: "rgba(255, 255, 255, 0.13)",
  border: "1px solid rgba(255, 255, 255, 0.17)",
  backdropFilter: "blur(10px)",
};

function benefitIconStyle(isCompact: boolean, tone: "sky" | "emerald" | "amber" | "violet"): React.CSSProperties {
  const colors = {
    sky: { background: "#0ea5e9", color: "#ffffff" },
    emerald: { background: "#10b981", color: "#ffffff" },
    amber: { background: "#f59e0b", color: "#ffffff" },
    violet: { background: "#8b5cf6", color: "#ffffff" },
  }[tone];
  return {
    width: isCompact ? "22px" : "28px",
    height: isCompact ? "22px" : "28px",
    borderRadius: "9px",
    background: colors.background,
    color: colors.color,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  };
}

const benefitTextWrapStyle: React.CSSProperties = {
  display: "grid",
  gap: "2px",
  minWidth: 0,
};

function benefitTitleStyle(isCompact: boolean): React.CSSProperties {
  return {
    color: "#ffffff",
    fontSize: isCompact ? "13px" : "13px",
    lineHeight: isCompact ? "18px" : "17px",
    fontWeight: 900,
  };
}

function benefitDescriptionStyle(isCompact: boolean): React.CSSProperties {
  return {
    color: "#dbeafe",
    fontSize: isCompact ? "12px" : "11px",
    lineHeight: isCompact ? "16px" : "15px",
    fontWeight: 650,
  };
}

function termsTextStyle(isCompactExpanded = false): React.CSSProperties {
  return {
    margin: "2px 0 0",
    fontSize: isCompactExpanded ? "10.5px" : "12px",
    lineHeight: isCompactExpanded ? "15px" : "18px",
    color: "#6b7280",
    textAlign: "center",
    fontWeight: 600,
  };
}
