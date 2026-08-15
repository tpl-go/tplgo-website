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
import { Building2, Mail, Phone, UserRound } from "lucide-react";
import { useAuth } from "@/app/hooks/useAuth";

type LoginModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

type LoginStep = "mobile" | "otp";
type AuthMethod = "mobile" | "email";
type PartnerMode = "signin" | "register";
type RegistrationStep = 0 | 1 | 2 | 3 | 4 | 5;

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

const PARTNER_TYPES = [
  "Airline / Flight Supplier",
  "Hotel / Property",
  "Homestay",
  "Tour Operator / DMC",
  "Bus",
  "Train Integration Partner",
  "Cab / Transfer",
  "Cruise",
  "Activity Provider",
  "Insurance",
  "Visa Services",
  "Medical Tourism",
  "Marketplace / Future Services",
  "Other",
];

const CONNECTIVITY_OPTIONS = ["CRM", "PMS", "Channel Manager", "ERP", "API", "Webhooks", "None / Manual Portal"];

const REGISTRATION_STEPS = [
  "Business",
  "Services",
  "Contact",
  "Compliance",
  "Technology",
  "Consent",
];

const PARTNER_PREVIEW_SANDBOX_ENABLED =
  process.env.NEXT_PUBLIC_PARTNER_PREVIEW_SANDBOX_ENABLED === "true" &&
  process.env.NEXT_PUBLIC_VERCEL_ENV !== "production";

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const { activeAccountType, setActiveAccountType, sendOtp, verifyOtp } = useAuth();

  const titleId = useId();
  const descriptionId = useId();
  const mobileInputId = useId();
  const otpInputId = useId();
  const emailInputId = useId();
  const modalRef = useRef<HTMLDivElement | null>(null);
  const mobileInputRef = useRef<HTMLInputElement | null>(null);
  const otpInputRef = useRef<HTMLInputElement | null>(null);
  const emailInputRef = useRef<HTMLInputElement | null>(null);
  const previousFocusRef = useRef<Element | null>(null);

  const [step, setStep] = useState<LoginStep>("mobile");
  const [userMethod, setUserMethod] = useState<AuthMethod>("mobile");
  const [partnerMode, setPartnerMode] = useState<PartnerMode>("signin");
  const [partnerMethod, setPartnerMethod] = useState<AuthMethod>("mobile");
  const [countryCode, setCountryCode] = useState("IN");
  const [partnerCountryCode, setPartnerCountryCode] = useState("IN");
  const [partnerContactCountryCode, setPartnerContactCountryCode] = useState("IN");
  const [mobile, setMobile] = useState("");
  const [partnerMobile, setPartnerMobile] = useState("");
  const [partnerContactMobile, setPartnerContactMobile] = useState("");
  const [email, setEmail] = useState("");
  const [partnerEmail, setPartnerEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [infoText, setInfoText] = useState("");
  const [successText, setSuccessText] = useState("");
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [resendAvailableAt, setResendAvailableAt] = useState<number | null>(null);
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [registrationStep, setRegistrationStep] = useState<RegistrationStep>(0);
  const [partnerRegistration, setPartnerRegistration] = useState({
    legalName: "",
    brandName: "",
    country: "IN",
    website: "",
    serviceType: PARTNER_TYPES[0],
    contactName: "",
    contactEmail: "",
    designation: "",
    taxId: "",
    registrationNumber: "",
    address: "",
    serviceRegions: "",
    connectivity: CONNECTIVITY_OPTIONS[6],
    systemName: "",
    consent: false,
  });

  const selectedCountry = useMemo(() => getCountry(countryCode), [countryCode]);
  const selectedPartnerCountry = useMemo(() => getCountry(partnerCountryCode), [partnerCountryCode]);
  const selectedPartnerContactCountry = useMemo(
    () => getCountry(partnerContactCountryCode),
    [partnerContactCountryCode]
  );
  const cleanedMobile = useMemo(() => mobile.replace(/\D/g, ""), [mobile]);
  const cleanedPartnerMobile = useMemo(() => partnerMobile.replace(/\D/g, ""), [partnerMobile]);
  const cleanedPartnerContactMobile = useMemo(
    () => partnerContactMobile.replace(/\D/g, ""),
    [partnerContactMobile]
  );
  const cleanedOtp = useMemo(() => otp.replace(/\D/g, ""), [otp]);
  const normalizedEmail = useMemo(() => normalizeEmail(email), [email]);
  const normalizedPartnerEmail = useMemo(() => normalizeEmail(partnerEmail), [partnerEmail]);
  const normalizedRegistrationEmail = useMemo(
    () => normalizeEmail(partnerRegistration.contactEmail),
    [partnerRegistration.contactEmail]
  );

  const isPartnerDesk = activeAccountType === "partner";
  const isUserEmail = !isPartnerDesk && userMethod === "email";
  const isUserMobile = !isPartnerDesk && userMethod === "mobile";
  const isPartnerSignin = isPartnerDesk && partnerMode === "signin";
  const isPartnerRegister = isPartnerDesk && partnerMode === "register";
  const isValidMobile = isNationalMobileValid(cleanedMobile, selectedCountry);
  const isCertifiedUserMobileOtp = selectedCountry.certifiedOtp && selectedCountry.code === "IN";
  const isValidOtp = cleanedOtp.length === 6;
  const isValidEmail = isEmailValid(normalizedEmail);
  const isValidPartnerEmail = isEmailValid(normalizedPartnerEmail);
  const isValidPartnerMobile = isNationalMobileValid(cleanedPartnerMobile, selectedPartnerCountry);
  const isValidRegistrationContact =
    partnerRegistration.contactName.trim().length >= 2 &&
    isEmailValid(normalizedRegistrationEmail) &&
    isNationalMobileValid(cleanedPartnerContactMobile, selectedPartnerContactCountry);
  const mobileHasInvalidValue = cleanedMobile.length > 0 && !isValidMobile;
  const emailHasInvalidValue = normalizedEmail.length > 0 && !isValidEmail;
  const partnerEmailHasInvalidValue = normalizedPartnerEmail.length > 0 && !isValidPartnerEmail;
  const partnerMobileHasInvalidValue = cleanedPartnerMobile.length > 0 && !isValidPartnerMobile;
  const maskedMobile = cleanedMobile.length >= 4 ? `XXXXX${cleanedMobile.slice(-4)}` : "";
  const resendSecondsRemaining = resendAvailableAt
    ? Math.max(0, Math.ceil((resendAvailableAt - nowMs) / 1000))
    : 0;
  const canSendOtp = isUserMobile && isValidMobile && isCertifiedUserMobileOtp && !isSubmitting;
  const canVerifyOtp = isUserMobile && isValidOtp && !isSubmitting;
  const canResendOtp = step === "otp" && canSendOtp && resendSecondsRemaining === 0;

  useEffect(() => {
    const checkMobile = () => setIsMobileViewport(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (!resendAvailableAt) return;
    const timer = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [resendAvailableAt]);

  useEffect(() => {
    if (!isOpen) return;

    previousFocusRef.current = document.activeElement;
    const timer = window.setTimeout(() => {
      if (isUserEmail) {
        emailInputRef.current?.focus();
      } else {
        mobileInputRef.current?.focus();
      }
    }, 0);

    return () => {
      window.clearTimeout(timer);
      const previousFocus = previousFocusRef.current;
      if (previousFocus instanceof HTMLElement && document.contains(previousFocus)) previousFocus.focus();
    };
  }, [isOpen, isUserEmail]);

  useEffect(() => {
    if (!isOpen || step !== "otp") return;
    const timer = window.setTimeout(() => otpInputRef.current?.focus(), 0);
    return () => window.clearTimeout(timer);
  }, [isOpen, step]);

  const resetState = useCallback(() => {
    setStep("mobile");
    setUserMethod("mobile");
    setPartnerMode("signin");
    setPartnerMethod("mobile");
    setCountryCode("IN");
    setPartnerCountryCode("IN");
    setPartnerContactCountryCode("IN");
    setMobile("");
    setPartnerMobile("");
    setPartnerContactMobile("");
    setEmail("");
    setPartnerEmail("");
    setOtp("");
    setErrorText("");
    setInfoText("");
    setSuccessText("");
    setIsSubmitting(false);
    setResendAvailableAt(null);
    setRegistrationStep(0);
  }, []);

  const resetChallengeState = () => {
    setStep("mobile");
    setOtp("");
    setErrorText("");
    setInfoText("");
    setSuccessText("");
    setResendAvailableAt(null);
  };

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

  const handleAccountTypeChange = (nextType: "personal" | "partner") => {
    if (isSubmitting) return;
    setActiveAccountType(nextType);
    resetChallengeState();
    if (nextType === "partner") {
      setInfoText("Partner access requires an approved Partner account. Registration submits for review only.");
    } else {
      setInfoText("");
    }
  };

  const handleSendOtp = async () => {
    if (!isUserMobile) return;
    if (!isValidMobile) {
      setErrorText("Enter a valid mobile number for the selected country.");
      return;
    }
    if (!isCertifiedUserMobileOtp) {
      setErrorText("WhatsApp OTP delivery is currently certified for India only. Global provider certification is pending.");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorText("");
      setInfoText("");
      setSuccessText("");

      const result = await sendOtp(toBackendMobile(cleanedMobile, selectedCountry), "personal");

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

      const result = await sendOtp(toBackendMobile(cleanedMobile, selectedCountry), "personal");
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

      await verifyOtp(toBackendMobile(cleanedMobile, selectedCountry), cleanedOtp, "personal");

      setSuccessText("Login successful. Welcome to TPL.");
      window.setTimeout(() => {
        resetState();
        onClose();
      }, 900);
    } catch (error) {
      setErrorText(toUserFacingAuthError(error, "Failed to verify OTP."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailContinue = () => {
    if (!isValidEmail) {
      setErrorText("Enter a valid email address.");
      return;
    }
    setErrorText("");
    setInfoText("Verified email login will be available after secure account linking is enabled.");
  };

  const handlePartnerSigninContinue = () => {
    if (partnerMethod === "mobile" && !isValidPartnerMobile) {
      setErrorText("Enter a valid partner mobile number for the selected country.");
      return;
    }
    if (partnerMethod === "email" && !isValidPartnerEmail) {
      setErrorText("Enter a valid partner email address.");
      return;
    }
    setErrorText("");
    setInfoText("Partner access requires an approved Partner account. No customer session is created from Partner Desk.");
  };

  const handleRegisterStepChange = (nextStep: RegistrationStep) => {
    setRegistrationStep(nextStep);
    setErrorText("");
    setInfoText("");
  };

  const handlePartnerRegistrationSubmit = () => {
    if (!partnerRegistration.consent) {
      setErrorText("Confirm the onboarding acknowledgements before submitting.");
      return;
    }
    setErrorText("");
    setInfoText("Partner registration would be submitted as UNDER_REVIEW after backend onboarding is enabled. No active partner is created in this preview.");
  };

  const handleBackToMobile = () => {
    if (isSubmitting) return;
    resetChallengeState();
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={handleClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.55)",
        zIndex: 1000,
        display: "flex",
        alignItems: isMobileViewport ? "flex-end" : "center",
        justifyContent: "center",
        padding: isMobileViewport ? "10px" : "20px",
      }}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
        onKeyDown={handleDialogKeyDown}
        style={{
          width: isMobileViewport ? "100%" : "820px",
          maxWidth: "100%",
          minHeight: isMobileViewport ? "auto" : "470px",
          maxHeight: isMobileViewport ? "92dvh" : "min(620px, calc(100vh - 40px))",
          overflow: "hidden",
          background: "#ffffff",
          borderRadius: isMobileViewport ? "18px" : "14px",
          display: "grid",
          gridTemplateColumns: isMobileViewport ? "1fr" : "0.96fr 1.04fr",
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
          position: "relative",
          fontFamily: "inherit",
        }}
      >
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close login dialog"
          disabled={isSubmitting}
          style={{
            position: "absolute",
            top: "12px",
            right: "14px",
            width: "36px",
            height: "36px",
            border: "none",
            borderRadius: "999px",
            background: isMobileViewport ? "rgba(15,23,42,0.35)" : "#f8fafc",
            fontSize: "26px",
            lineHeight: 1,
            cursor: isSubmitting ? "not-allowed" : "pointer",
            color: isMobileViewport ? "#ffffff" : "#475569",
            zIndex: 5,
          }}
        >
          ×
        </button>

        <PromoPanel isMobile={isMobileViewport} descriptionId={descriptionId} />

        <div
          style={{
            minHeight: 0,
            maxHeight: isMobileViewport ? "calc(92dvh - 126px)" : "min(620px, calc(100vh - 40px))",
            overflow: "hidden",
            padding: isMobileViewport ? "18px 18px 20px" : "30px 32px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={stickySwitchStyle}>
            <TopAccountTabs
              activeAccountType={activeAccountType}
              isMobile={isMobileViewport}
              onChange={handleAccountTypeChange}
            />
          </div>

          <div className="auth-panel-scroll" style={authPanelScrollContentStyle}>
            <h2 id={titleId} style={titleStyle(isMobileViewport)}>
              {isPartnerDesk ? "Partner Desk" : step === "otp" ? "Verify OTP" : "Login or Sign up"}
            </h2>

            <p style={introTextStyle}>
              {isPartnerDesk
                ? "Partner sign-in and onboarding are separate from customer login."
                : "Choose mobile OTP or verified email login for your TPL GO account."}
            </p>

            {successText ? <StatusMessage tone="success">{successText}</StatusMessage> : null}

            {!isPartnerDesk ? (
              <UserLoginPanel
                method={userMethod}
                setMethod={(nextMethod) => {
                  setUserMethod(nextMethod);
                  resetChallengeState();
                }}
                step={step}
                mobileInputId={mobileInputId}
                mobileInputRef={mobileInputRef}
                countryCode={countryCode}
                setCountryCode={setCountryCode}
                mobile={mobile}
                setMobile={setMobile}
                selectedCountry={selectedCountry}
                mobileHasInvalidValue={mobileHasInvalidValue}
                isCertifiedUserMobileOtp={isCertifiedUserMobileOtp}
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
                onEmailContinue={handleEmailContinue}
              />
            ) : (
              <PartnerDeskPanel
                mode={partnerMode}
                setMode={(nextMode) => {
                  setPartnerMode(nextMode);
                  setErrorText("");
                  setInfoText("");
                }}
                method={partnerMethod}
                setMethod={(nextMethod) => {
                  setPartnerMethod(nextMethod);
                  setErrorText("");
                  setInfoText("");
                }}
                countryCode={partnerCountryCode}
                setCountryCode={setPartnerCountryCode}
                selectedCountry={selectedPartnerCountry}
                mobile={partnerMobile}
                setMobile={setPartnerMobile}
                mobileHasInvalidValue={partnerMobileHasInvalidValue}
                email={partnerEmail}
                setEmail={setPartnerEmail}
                emailHasInvalidValue={partnerEmailHasInvalidValue}
                isValidEmail={isValidPartnerEmail}
                isValidMobile={isValidPartnerMobile}
                onSigninContinue={handlePartnerSigninContinue}
                registrationStep={registrationStep}
                setRegistrationStep={handleRegisterStepChange}
                registration={partnerRegistration}
                setRegistration={setPartnerRegistration}
                contactCountryCode={partnerContactCountryCode}
                setContactCountryCode={setPartnerContactCountryCode}
                contactCountry={selectedPartnerContactCountry}
                contactMobile={partnerContactMobile}
                setContactMobile={setPartnerContactMobile}
                contactMobileValid={isNationalMobileValid(cleanedPartnerContactMobile, selectedPartnerContactCountry)}
                contactReady={isValidRegistrationContact}
                onRegistrationSubmit={handlePartnerRegistrationSubmit}
                previewSandboxEnabled={PARTNER_PREVIEW_SANDBOX_ENABLED}
              />
            )}

            {errorText ? <StatusMessage tone="error">{errorText}</StatusMessage> : null}
            {infoText ? <StatusMessage tone="info">{infoText}</StatusMessage> : null}

            <p
              style={{
                margin: "14px 0 0 0",
                fontSize: "12px",
                lineHeight: "18px",
                color: "#6b7280",
                textAlign: "center",
              }}
            >
              By proceeding, you agree to our Privacy Policy, User Agreement and T&amp;Cs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function PromoPanel({ isMobile, descriptionId }: { isMobile: boolean; descriptionId: string }) {
  return (
    <div
      style={{
        background:
          "linear-gradient(180deg, rgba(15,23,42,0.88), rgba(17,24,39,0.88)), url('/demo/kerala-cover.jpg') center/cover",
        color: "#ffffff",
        padding: isMobile ? "22px 20px" : "38px 32px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <h3
        style={{
          margin: 0,
          fontSize: isMobile ? "21px" : "32px",
          lineHeight: isMobile ? "28px" : "40px",
          fontWeight: 800,
          letterSpacing: 0,
        }}
      >
        Sign up now to get
      </h3>
      <div
        id={descriptionId}
        style={{
          marginTop: isMobile ? "16px" : "30px",
          display: "grid",
          gap: isMobile ? "11px" : "22px",
        }}
      >
        <BenefitLine icon="FL" text="Lock Flight Prices & Pay Later" isMobile={isMobile} />
        <BenefitLine icon="HT" text="Book Hotels @ Rs. 1" isMobile={isMobile} />
        <BenefitLine icon="RF" text="Get 3X refund if your waitlisted train is not confirmed" isMobile={isMobile} />
      </div>
    </div>
  );
}

function UserLoginPanel(props: {
  method: AuthMethod;
  setMethod: (method: AuthMethod) => void;
  step: LoginStep;
  mobileInputId: string;
  mobileInputRef: React.RefObject<HTMLInputElement | null>;
  countryCode: string;
  setCountryCode: (countryCode: string) => void;
  mobile: string;
  setMobile: (mobile: string) => void;
  selectedCountry: CountryOption;
  mobileHasInvalidValue: boolean;
  isCertifiedUserMobileOtp: boolean;
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
  onEmailContinue: () => void;
}) {
  if (props.step === "otp") {
    return (
      <div style={stackStyle}>
        <label htmlFor={props.otpInputId} style={labelStyle}>
          Enter OTP
        </label>
        <input
          ref={props.otpInputRef}
          id={props.otpInputId}
          value={props.otp}
          onChange={(event) => props.setOtp(sanitizeDigits(event.target.value).slice(0, 6))}
          onPaste={(event) => {
            event.preventDefault();
            props.setOtp(sanitizeDigits(event.clipboardData.getData("text")).slice(0, 6));
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") props.onVerifyOtp();
          }}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="Enter 6-digit OTP"
          aria-invalid={Boolean(props.otp && !props.isValidOtp)}
          disabled={props.isSubmitting}
          style={standaloneInputStyle}
        />
        <p style={helperTextStyle}>OTP sent to +{getCountry("IN").dialCode} {props.maskedMobile}</p>
        <button type="button" onClick={props.onVerifyOtp} disabled={!props.canVerifyOtp} style={primaryButtonStyle(!props.canVerifyOtp)}>
          {props.isSubmitting ? "VERIFYING..." : "VERIFY OTP"}
        </button>
        <button type="button" onClick={props.onBackToMobile} style={secondaryButtonStyle}>
          CHANGE MOBILE
        </button>
        <button
          type="button"
          onClick={props.onResendOtp}
          disabled={!props.canResendOtp}
          style={{
            ...secondaryButtonStyle,
            border: "none",
            background: props.canResendOtp ? "#eff6ff" : "#f1f5f9",
            color: props.canResendOtp ? "#0b5fff" : "#64748b",
            cursor: props.canResendOtp ? "pointer" : "not-allowed",
          }}
        >
          {props.resendSecondsRemaining > 0 ? `RESEND OTP IN ${props.resendSecondsRemaining}s` : "RESEND OTP"}
        </button>
      </div>
    );
  }

  return (
    <div style={stackStyle}>
      <MethodSelector active={props.method} onChange={props.setMethod} />
      {props.method === "mobile" ? (
        <>
          <MobileIdentityInput
            id={props.mobileInputId}
            inputRef={props.mobileInputRef}
            countryCode={props.countryCode}
            onCountryChange={props.setCountryCode}
            value={props.mobile}
            onChange={props.setMobile}
            label="Mobile Number"
            invalid={props.mobileHasInvalidValue}
            onEnter={props.onSendOtp}
          />
          {props.mobileHasInvalidValue ? <p style={warningTextStyle}>Enter a valid mobile number for the selected country.</p> : null}
          {!props.isCertifiedUserMobileOtp ? (
            <p style={helperTextStyle}>Global mobile UI is supported. WhatsApp OTP delivery outside India is pending provider certification.</p>
          ) : null}
          <button type="button" onClick={props.onSendOtp} disabled={!props.canSendOtp} style={primaryButtonStyle(!props.canSendOtp)}>
            {props.isSubmitting ? "SENDING OTP..." : "CONTINUE"}
          </button>
        </>
      ) : (
        <>
          <label htmlFor={props.emailInputId} style={labelStyle}>
            Email Address
          </label>
          <input
            ref={props.emailInputRef}
            id={props.emailInputId}
            value={props.email}
            onChange={(event) => props.setEmail(event.target.value)}
            onBlur={() => props.setEmail(normalizeEmail(props.email))}
            onKeyDown={(event) => {
              if (event.key === "Enter") props.onEmailContinue();
            }}
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@example.com"
            aria-invalid={props.emailHasInvalidValue}
            style={standaloneInputStyle}
          />
          {props.emailHasInvalidValue ? <p style={warningTextStyle}>Enter a valid email address.</p> : null}
          <button
            type="button"
            onClick={props.onEmailContinue}
            disabled={!props.isValidEmail}
            style={primaryButtonStyle(!props.isValidEmail)}
          >
            CONTINUE WITH EMAIL
          </button>
          <p style={helperTextStyle}>Verified email login is UI-ready. It will not issue a session until secure email identity is implemented.</p>
        </>
      )}
    </div>
  );
}

function PartnerDeskPanel(props: {
  mode: PartnerMode;
  setMode: (mode: PartnerMode) => void;
  method: AuthMethod;
  setMethod: (method: AuthMethod) => void;
  countryCode: string;
  setCountryCode: (countryCode: string) => void;
  selectedCountry: CountryOption;
  mobile: string;
  setMobile: (mobile: string) => void;
  mobileHasInvalidValue: boolean;
  email: string;
  setEmail: (email: string) => void;
  emailHasInvalidValue: boolean;
  isValidEmail: boolean;
  isValidMobile: boolean;
  onSigninContinue: () => void;
  registrationStep: RegistrationStep;
  setRegistrationStep: (step: RegistrationStep) => void;
  registration: {
    legalName: string;
    brandName: string;
    country: string;
    website: string;
    serviceType: string;
    contactName: string;
    contactEmail: string;
    designation: string;
    taxId: string;
    registrationNumber: string;
    address: string;
    serviceRegions: string;
    connectivity: string;
    systemName: string;
    consent: boolean;
  };
  setRegistration: React.Dispatch<
    React.SetStateAction<{
      legalName: string;
      brandName: string;
      country: string;
      website: string;
      serviceType: string;
      contactName: string;
      contactEmail: string;
      designation: string;
      taxId: string;
      registrationNumber: string;
      address: string;
      serviceRegions: string;
      connectivity: string;
      systemName: string;
      consent: boolean;
    }>
  >;
  contactCountryCode: string;
  setContactCountryCode: (countryCode: string) => void;
  contactCountry: CountryOption;
  contactMobile: string;
  setContactMobile: (mobile: string) => void;
  contactMobileValid: boolean;
  contactReady: boolean;
  onRegistrationSubmit: () => void;
  previewSandboxEnabled: boolean;
}) {
  return (
    <div style={stackStyle}>
      {props.previewSandboxEnabled ? (
        <a href="/partner-preview" style={partnerPreviewLinkStyle}>
          <Building2 size={16} aria-hidden="true" />
          Enter Partner Preview
        </a>
      ) : (
        <div style={sandboxUnavailableStyle}>
          Partner Preview Sandbox is disabled for this deployment.
        </div>
      )}

      <SegmentedTabs
        items={[
          { value: "signin", label: "SIGN IN" },
          { value: "register", label: "REGISTER AS PARTNER" },
        ]}
        value={props.mode}
        onChange={(value) => props.setMode(value as PartnerMode)}
      />

      {props.mode === "signin" ? (
        <>
          <MethodSelector active={props.method} onChange={props.setMethod} />
          {props.method === "mobile" ? (
            <>
              <MobileIdentityInput
                countryCode={props.countryCode}
                onCountryChange={props.setCountryCode}
                value={props.mobile}
                onChange={props.setMobile}
                label="Partner Mobile"
                invalid={props.mobileHasInvalidValue}
                onEnter={props.onSigninContinue}
              />
              {props.mobileHasInvalidValue ? <p style={warningTextStyle}>Enter a valid partner mobile number.</p> : null}
            </>
          ) : (
            <>
              <label style={labelStyle}>Partner Email</label>
              <input
                value={props.email}
                onChange={(event) => props.setEmail(event.target.value)}
                onBlur={() => props.setEmail(normalizeEmail(props.email))}
                onKeyDown={(event) => {
                  if (event.key === "Enter") props.onSigninContinue();
                }}
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="partner@example.com"
                aria-invalid={props.emailHasInvalidValue}
                style={standaloneInputStyle}
              />
              {props.emailHasInvalidValue ? <p style={warningTextStyle}>Enter a valid partner email address.</p> : null}
            </>
          )}
          <button
            type="button"
            onClick={props.onSigninContinue}
            disabled={props.method === "mobile" ? !props.isValidMobile : !props.isValidEmail}
            style={primaryButtonStyle(props.method === "mobile" ? !props.isValidMobile : !props.isValidEmail)}
          >
            CHECK PARTNER ACCESS
          </button>
          <p style={helperTextStyle}>Partner sign-in is gated until Partner organization, RBAC, approval, and MFA-ready identity are implemented.</p>
        </>
      ) : (
        <PartnerRegistrationForm {...props} />
      )}
    </div>
  );
}

function PartnerRegistrationForm(props: Parameters<typeof PartnerDeskPanel>[0]) {
  const updateRegistration = (patch: Partial<typeof props.registration>) => {
    props.setRegistration((current) => ({ ...current, ...patch }));
  };
  const canGoNext = isRegistrationStepValid(props.registrationStep, props.registration, props.contactReady);

  return (
    <div style={stackStyle}>
      <div role="tablist" aria-label="Partner registration steps" style={stepGridStyle}>
        {REGISTRATION_STEPS.map((label, index) => (
          <button
            key={label}
            type="button"
            role="tab"
            aria-selected={props.registrationStep === index}
            onClick={() => props.setRegistrationStep(index as RegistrationStep)}
            style={stepButtonStyle(props.registrationStep === index)}
          >
            {index + 1}. {label}
          </button>
        ))}
      </div>

      {props.registrationStep === 0 ? (
        <div style={formGridStyle}>
          <TextField label="Legal Company / Organization Name" value={props.registration.legalName} onChange={(value) => updateRegistration({ legalName: value })} />
          <TextField label="Brand / Trade Name" value={props.registration.brandName} onChange={(value) => updateRegistration({ brandName: value })} />
          <CountrySelect label="Business Country" value={props.registration.country} onChange={(value) => updateRegistration({ country: value })} />
          <TextField label="Website" value={props.registration.website} onChange={(value) => updateRegistration({ website: value })} placeholder="https://example.com" />
        </div>
      ) : null}

      {props.registrationStep === 1 ? (
        <div style={formGridStyle}>
          <label style={labelStyle}>Partner Type / Services</label>
          <select value={props.registration.serviceType} onChange={(event) => updateRegistration({ serviceType: event.target.value })} style={standaloneInputStyle}>
            {PARTNER_TYPES.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
          <p style={helperTextStyle}>Service scope is captured for future admin review and does not activate inventory, rates, or supplier booking.</p>
        </div>
      ) : null}

      {props.registrationStep === 2 ? (
        <div style={formGridStyle}>
          <TextField label="Contact Person Name" value={props.registration.contactName} onChange={(value) => updateRegistration({ contactName: value })} />
          <MobileIdentityInput
            countryCode={props.contactCountryCode}
            onCountryChange={props.setContactCountryCode}
            value={props.contactMobile}
            onChange={props.setContactMobile}
            label="Contact Mobile"
            invalid={Boolean(props.contactMobile) && !props.contactMobileValid}
          />
          <TextField
            label="Contact Email"
            type="email"
            value={props.registration.contactEmail}
            onChange={(value) => updateRegistration({ contactEmail: value })}
            onBlur={() => updateRegistration({ contactEmail: normalizeEmail(props.registration.contactEmail) })}
            placeholder="contact@example.com"
          />
          <TextField label="Designation / Role" value={props.registration.designation} onChange={(value) => updateRegistration({ designation: value })} />
        </div>
      ) : null}

      {props.registrationStep === 3 ? (
        <div style={formGridStyle}>
          <TextField label="GST / Tax ID" value={props.registration.taxId} onChange={(value) => updateRegistration({ taxId: value })} />
          <TextField label="Registration Number" value={props.registration.registrationNumber} onChange={(value) => updateRegistration({ registrationNumber: value })} />
          <TextField label="Address" value={props.registration.address} onChange={(value) => updateRegistration({ address: value })} />
          <TextField label="Service Regions" value={props.registration.serviceRegions} onChange={(value) => updateRegistration({ serviceRegions: value })} placeholder="Countries, cities, or routes served" />
          <p style={helperTextStyle}>Compliance fields are country-aware placeholders for review. They do not approve or activate a partner.</p>
        </div>
      ) : null}

      {props.registrationStep === 4 ? (
        <div style={formGridStyle}>
          <label style={labelStyle}>Current System / Connectivity</label>
          <select value={props.registration.connectivity} onChange={(event) => updateRegistration({ connectivity: event.target.value })} style={standaloneInputStyle}>
            {CONNECTIVITY_OPTIONS.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
          <TextField label="System / Provider Name" value={props.registration.systemName} onChange={(value) => updateRegistration({ systemName: value })} placeholder="Optional" />
          <p style={helperTextStyle}>CRM, PMS, API, and webhook details are metadata only in this preview. No connector or mutation is created.</p>
        </div>
      ) : null}

      {props.registrationStep === 5 ? (
        <div style={formGridStyle}>
          <label style={{ ...labelStyle, display: "flex", alignItems: "flex-start", gap: "10px" }}>
            <input
              type="checkbox"
              checked={props.registration.consent}
              onChange={(event) => updateRegistration({ consent: event.target.checked })}
              style={{ marginTop: "3px" }}
            />
            <span>I confirm I am authorized to submit partner onboarding information and acknowledge platform review is required before activation.</span>
          </label>
          <StatusMessage tone="info">Registration status model: DRAFT to SUBMITTED to UNDER_REVIEW to APPROVED/ACTIVE only after Admin approval.</StatusMessage>
        </div>
      ) : null}

      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <button
          type="button"
          disabled={props.registrationStep === 0}
          onClick={() => props.setRegistrationStep(Math.max(0, props.registrationStep - 1) as RegistrationStep)}
          style={secondaryButtonStyle}
        >
          BACK
        </button>
        {props.registrationStep < 5 ? (
          <button
            type="button"
            disabled={!canGoNext}
            onClick={() => props.setRegistrationStep((props.registrationStep + 1) as RegistrationStep)}
            style={{ ...primaryButtonStyle(!canGoNext), flex: 1, marginTop: "10px" }}
          >
            NEXT
          </button>
        ) : (
          <button
            type="button"
            disabled={!props.registration.consent}
            onClick={props.onRegistrationSubmit}
            style={{ ...primaryButtonStyle(!props.registration.consent), flex: 1, marginTop: "10px" }}
          >
            SUBMIT FOR REVIEW
          </button>
        )}
      </div>
    </div>
  );
}

function TopAccountTabs(props: {
  activeAccountType: "personal" | "partner";
  isMobile: boolean;
  onChange: (type: "personal" | "partner") => void;
}) {
  return (
    <div role="tablist" aria-label="Login area" style={pillTabsStyle}>
      <button
        type="button"
        role="tab"
        aria-selected={props.activeAccountType === "personal"}
        onClick={() => props.onChange("personal")}
        style={pillTabStyle(props.activeAccountType === "personal", props.isMobile)}
      >
        USER LOGIN
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={props.activeAccountType === "partner"}
        onClick={() => props.onChange("partner")}
        style={pillTabStyle(props.activeAccountType === "partner", props.isMobile)}
      >
        PARTNER DESK
      </button>
    </div>
  );
}

function MethodSelector({ active, onChange }: { active: AuthMethod; onChange: (method: AuthMethod) => void }) {
  return (
    <div aria-label="Authentication method" style={methodStackStyle}>
      <button type="button" onClick={() => onChange("mobile")} style={primaryMethodButtonStyle(active === "mobile")}>
        <Phone size={16} aria-hidden="true" />
        Mobile
      </button>
      <button
        type="button"
        disabled
        aria-disabled="true"
        title="Google login requires secure OAuth configuration before activation."
        style={googleButtonStyle}
      >
        <span aria-hidden="true" style={googleMarkStyle}>G</span>
        Continue with Google
      </button>
      <button type="button" onClick={() => onChange("email")} style={secondaryMethodButtonStyle(active === "email")}>
        <Mail size={16} aria-hidden="true" />
        Email
      </button>
    </div>
  );
}

function SegmentedTabs(props: {
  items: Array<{ value: string; label: string }>;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div role="tablist" aria-label="Partner Desk mode" style={pillTabsStyle}>
      {props.items.map((item) => (
        <button
          key={item.value}
          type="button"
          role="tab"
          aria-selected={props.value === item.value}
          onClick={() => props.onChange(item.value)}
          style={pillTabStyle(props.value === item.value, item.label.length > 12)}
        >
          {item.label}
        </button>
      ))}
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
  const country = getCountry(props.countryCode);
  const maxLength = country.maxLength || 15;

  return (
    <div style={stackStyle}>
      <label htmlFor={props.id} style={labelStyle}>
        {props.label}
      </label>
      <div
        style={{
          minHeight: "48px",
          border: props.invalid ? "1px solid #f97316" : "1px solid #cbd5e1",
          borderRadius: "8px",
          display: "grid",
          gridTemplateColumns: "minmax(132px, 0.9fr) minmax(0, 1.1fr)",
          overflow: "hidden",
          background: "#ffffff",
        }}
      >
        <select
          aria-label={`${props.label} country and dial code`}
          value={props.countryCode}
          onChange={(event) => props.onCountryChange(event.target.value)}
          style={{
            border: "none",
            borderRight: "1px solid #e2e8f0",
            outline: "none",
            padding: "0 10px",
            color: "#1e293b",
            fontSize: "14px",
            fontWeight: 800,
            background: "#f8fafc",
            fontFamily: "inherit",
            minWidth: 0,
          }}
        >
          {COUNTRY_OPTIONS.map((item) => (
            <option key={item.code} value={item.code}>
              {item.name} {item.dialCode ? `+${item.dialCode}` : ""}
            </option>
          ))}
        </select>
        <input
          ref={props.inputRef}
          id={props.id}
          value={props.value}
          onChange={(event) => props.onChange(sanitizeDigits(event.target.value).slice(0, maxLength))}
          onPaste={(event) => {
            event.preventDefault();
            props.onChange(sanitizeDigits(event.clipboardData.getData("text")).slice(-maxLength));
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") props.onEnter?.();
          }}
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          placeholder="Mobile number"
          aria-invalid={props.invalid}
          style={compactInputStyle}
        />
      </div>
    </div>
  );
}

function CountrySelect(props: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <div style={stackStyle}>
      <label style={labelStyle}>{props.label}</label>
      <select value={props.value} onChange={(event) => props.onChange(event.target.value)} style={standaloneInputStyle}>
        {COUNTRY_OPTIONS.map((item) => (
          <option key={item.code} value={item.code}>
            {item.name}
          </option>
        ))}
      </select>
    </div>
  );
}

function TextField(props: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div style={stackStyle}>
      <label style={labelStyle}>{props.label}</label>
      <input
        value={props.value}
        onChange={(event) => props.onChange(event.target.value)}
        onBlur={props.onBlur}
        type={props.type || "text"}
        inputMode={props.type === "email" ? "email" : "text"}
        autoComplete={props.type === "email" ? "email" : "on"}
        placeholder={props.placeholder}
        style={standaloneInputStyle}
      />
    </div>
  );
}

function BenefitLine({ icon, text, isMobile }: { icon: string; text: string; isMobile: boolean }) {
  return (
    <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
      <span
        aria-hidden="true"
        style={{
          width: isMobile ? "30px" : "38px",
          height: isMobile ? "30px" : "38px",
          borderRadius: "999px",
          background: "rgba(255,255,255,0.16)",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: isMobile ? "11px" : "12px",
          fontWeight: 900,
          flexShrink: 0,
        }}
      >
        {icon}
      </span>
      <span
        style={{
          fontSize: isMobile ? "15px" : "21px",
          lineHeight: isMobile ? "21px" : "28px",
          fontWeight: 800,
          letterSpacing: 0,
        }}
      >
        {text}
      </span>
    </div>
  );
}

function StatusMessage({ tone, children }: { tone: "success" | "error" | "info"; children: string }) {
  const styles = {
    success: { border: "1px solid #bbf7d0", background: "#f0fdf4", color: "#15803d" },
    error: { border: "1px solid #fecaca", background: "#fef2f2", color: "#b91c1c" },
    info: { border: "1px solid #bfdbfe", background: "#eff6ff", color: "#1d4ed8" },
  }[tone];

  return (
    <div
      id={`login-${tone}-message`}
      role={tone === "error" ? "alert" : "status"}
      style={{
        ...styles,
        marginTop: "10px",
        borderRadius: "8px",
        padding: "10px 12px",
        fontSize: "13px",
        lineHeight: "18px",
        fontWeight: 700,
      }}
    >
      {children}
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

function getFocusableElements(root: HTMLElement | null): HTMLElement[] {
  if (!root) return [];
  return Array.from(
    root.querySelectorAll<HTMLElement>(
      'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
    )
  ).filter((element) => !element.hasAttribute("aria-hidden"));
}

function isRegistrationStepValid(
  step: RegistrationStep,
  registration: {
    legalName: string;
    brandName: string;
    serviceType: string;
    contactName: string;
    contactEmail: string;
    consent: boolean;
  },
  contactReady: boolean
) {
  if (step === 0) return registration.legalName.trim().length >= 2 && registration.brandName.trim().length >= 2;
  if (step === 1) return Boolean(registration.serviceType);
  if (step === 2) return registration.contactName.trim().length >= 2 && contactReady;
  return true;
}

const stackStyle: React.CSSProperties = {
  display: "grid",
  gap: "10px",
};

const pillTabsStyle: React.CSSProperties = {
  display: "flex",
  border: "1px solid #e2e8f0",
  borderRadius: "999px",
  overflow: "hidden",
  marginBottom: "16px",
  background: "#eef2f7",
  padding: "4px",
  gap: "4px",
};

const methodStackStyle: React.CSSProperties = {
  display: "grid",
  gap: "8px",
  marginBottom: "2px",
};

const formGridStyle: React.CSSProperties = {
  display: "grid",
  gap: "10px",
};

const stepGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: "6px",
};

const labelStyle: React.CSSProperties = {
  fontSize: "13px",
  fontWeight: 800,
  color: "#0f172a",
};

const introTextStyle: React.CSSProperties = {
  margin: "0 0 14px 0",
  fontSize: "13px",
  lineHeight: "19px",
  color: "#64748b",
  fontWeight: 600,
};

const helperTextStyle: React.CSSProperties = {
  margin: "0",
  fontSize: "12px",
  lineHeight: "18px",
  color: "#64748b",
  fontWeight: 650,
};

const warningTextStyle: React.CSSProperties = {
  margin: "0",
  fontSize: "12px",
  color: "#b45309",
  fontWeight: 750,
};

const compactInputStyle: React.CSSProperties = {
  minWidth: 0,
  height: "48px",
  border: "none",
  outline: "none",
  padding: "0 12px",
  fontSize: "16px",
  lineHeight: "22px",
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
  height: "48px",
  border: "1px solid #cbd5e1",
  borderRadius: "8px",
  outline: "none",
  padding: "0 12px",
  fontSize: "16px",
  lineHeight: "22px",
  color: "#0f172a",
  background: "#ffffff",
  fontFamily: "inherit",
  fontVariantNumeric: "tabular-nums",
  fontFeatureSettings: '"tnum" 1',
  letterSpacing: 0,
};

const secondaryButtonStyle: React.CSSProperties = {
  marginTop: "10px",
  minHeight: "42px",
  border: "1px solid #cbd5e1",
  borderRadius: "8px",
  background: "#ffffff",
  color: "#334155",
  fontWeight: 800,
  cursor: "pointer",
  padding: "0 14px",
};

function titleStyle(isMobile: boolean): React.CSSProperties {
  return {
    margin: "0 0 4px 0",
    fontSize: isMobile ? "20px" : "23px",
    lineHeight: isMobile ? "26px" : "29px",
    color: "#0f172a",
    fontWeight: 900,
    letterSpacing: 0,
  };
}

function pillTabStyle(active: boolean, compact: boolean): React.CSSProperties {
  return {
    flex: 1,
    minHeight: "40px",
    border: "none",
    borderRadius: "999px",
    background: active ? "#0b5fff" : "transparent",
    color: active ? "#ffffff" : "#475569",
    fontWeight: 800,
    fontSize: compact ? "12px" : "13px",
    cursor: "pointer",
    boxShadow: active ? "0 4px 14px rgba(11,95,255,0.25)" : "none",
    transition: "all 0.2s ease",
    letterSpacing: 0,
    padding: "0 10px",
  };
}

const stickySwitchStyle: React.CSSProperties = {
  position: "sticky",
  top: 0,
  zIndex: 4,
  background: "#ffffff",
  padding: "0 42px 1px 0",
  marginBottom: "2px",
  flexShrink: 0,
};

const authPanelScrollContentStyle: React.CSSProperties = {
  minHeight: 0,
  flex: "1 1 auto",
  overflowY: "auto",
  overscrollBehavior: "contain",
  display: "flex",
  flexDirection: "column",
};

const googleMarkStyle: React.CSSProperties = {
  width: "22px",
  height: "22px",
  borderRadius: "999px",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#ffffff",
  border: "1px solid #d9e2ec",
  color: "#111827",
  fontWeight: 900,
  fontSize: "13px",
};

const googleButtonStyle: React.CSSProperties = {
  minHeight: "42px",
  border: "1px solid #d9e2ec",
  borderRadius: "8px",
  background: "#f8fafc",
  color: "#64748b",
  fontWeight: 850,
  cursor: "not-allowed",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  opacity: 0.9,
};

const partnerPreviewLinkStyle: React.CSSProperties = {
  minHeight: "42px",
  borderRadius: "8px",
  border: "1px solid #bfdbfe",
  background: "#eff6ff",
  color: "#0b5fff",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  fontWeight: 900,
  textDecoration: "none",
};

const sandboxUnavailableStyle: React.CSSProperties = {
  borderRadius: "8px",
  border: "1px solid #e2e8f0",
  background: "#f8fafc",
  color: "#64748b",
  padding: "10px 12px",
  fontSize: "12px",
  fontWeight: 750,
  lineHeight: "18px",
};

function primaryMethodButtonStyle(active: boolean): React.CSSProperties {
  return {
    minHeight: "42px",
    border: active ? "1px solid #0b5fff" : "1px solid #d9e2ec",
    borderRadius: "8px",
    background: active ? "#eff6ff" : "#ffffff",
    color: active ? "#0b5fff" : "#334155",
    fontWeight: 850,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  };
}

function secondaryMethodButtonStyle(active: boolean): React.CSSProperties {
  return {
    minHeight: "40px",
    border: active ? "1px solid #0b5fff" : "1px solid #d9e2ec",
    borderRadius: "8px",
    background: active ? "#eff6ff" : "#ffffff",
    color: active ? "#0b5fff" : "#334155",
    fontWeight: 800,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  };
}

function stepButtonStyle(active: boolean): React.CSSProperties {
  return {
    minHeight: "34px",
    border: active ? "1px solid #0b5fff" : "1px solid #d9e2ec",
    borderRadius: "8px",
    background: active ? "#eff6ff" : "#ffffff",
    color: active ? "#0b5fff" : "#475569",
    fontSize: "11px",
    fontWeight: 850,
    cursor: "pointer",
    padding: "4px 6px",
  };
}

function primaryButtonStyle(disabled: boolean): React.CSSProperties {
  return {
    marginTop: "10px",
    minHeight: "44px",
    border: "none",
    borderRadius: "8px",
    background: disabled ? "#dbeafe" : "#0b5fff",
    color: disabled ? "#64748b" : "#ffffff",
    fontWeight: 850,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: 0.98,
    letterSpacing: 0,
    padding: "0 14px",
  };
}
