"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/app/hooks/useAuth";

type LoginModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

type LoginStep = "mobile" | "otp";

export default function LoginModal({
  isOpen,
  onClose,
}: LoginModalProps) {
  const {
    activeAccountType,
    setActiveAccountType,
    sendOtp,
    verifyOtp,
  } = useAuth();

  const [step, setStep] = useState<LoginStep>("mobile");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [infoText, setInfoText] = useState("");
  const [successText, setSuccessText] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  const cleanedMobile = useMemo(() => mobile.replace(/\D/g, ""), [mobile]);
  const cleanedOtp = useMemo(() => otp.replace(/\D/g, ""), [otp]);

  const isValidMobile = cleanedMobile.length === 10;
  const isValidOtp = cleanedOtp.length === 6;

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  const resetState = () => {
    setStep("mobile");
    setMobile("");
    setOtp("");
    setErrorText("");
    setInfoText("");
    setSuccessText("");
    setIsSubmitting(false);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleSendOtp = async () => {
    if (!isValidMobile) return;

    try {
      setIsSubmitting(true);
      setErrorText("");
      setInfoText("");
      setSuccessText("");

      await sendOtp(cleanedMobile, activeAccountType);

      setStep("otp");
      setInfoText("OTP sent. Please enter the 6-digit code.");
    } catch (error) {
      setErrorText(
        error instanceof Error ? error.message : "Failed to send OTP."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!isValidOtp) return;

    try {
      setIsSubmitting(true);
      setErrorText("");
      setInfoText("");
      setSuccessText("");

      await verifyOtp(cleanedMobile, cleanedOtp, activeAccountType);

      setSuccessText("Login successful. Welcome to TPL.");

      setTimeout(() => {
        resetState();
        onClose();
      }, 900);
    } catch (error) {
      setErrorText(
        error instanceof Error ? error.message : "Failed to verify OTP."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToMobile = () => {
    setStep("mobile");
    setOtp("");
    setErrorText("");
    setInfoText("");
    setSuccessText("");
    setIsSubmitting(false);
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
        alignItems: isMobile ? "flex-end" : "center",
        justifyContent: "center",
        padding: isMobile ? "12px" : "20px",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: isMobile ? "100%" : "820px",
          maxWidth: "100%",
          minHeight: isMobile ? "auto" : "470px",
          maxHeight: isMobile ? "92dvh" : "none",
          overflowY: isMobile ? "auto" : "hidden",
          background: "#ffffff",
          borderRadius: isMobile ? "22px" : "16px",
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1.1fr",
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
          position: "relative",
        }}
      >
        <button
          onClick={handleClose}
          style={{
            position: "absolute",
            top: "12px",
            right: "14px",
            border: "none",
            background: "transparent",
            fontSize: "28px",
            lineHeight: 1,
            cursor: "pointer",
            color: isMobile ? "#ffffff" : "#6b7280",
            zIndex: 5,
          }}
        >
          ×
        </button>

        <div
          style={{
            background:
              "linear-gradient(180deg, rgba(15,23,42,0.88), rgba(17,24,39,0.88)), url('/demo/kerala-cover.jpg') center/cover",
            color: "#ffffff",
            padding: isMobile ? "24px 20px" : "44px 34px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: isMobile ? "22px" : "34px",
              lineHeight: isMobile ? "30px" : "42px",
              fontWeight: 800,
            }}
          >
            Sign up now to get
          </h3>

          <div
            style={{
              marginTop: isMobile ? "18px" : "34px",
              display: "grid",
              gap: isMobile ? "12px" : "24px",
            }}
          >
            <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
              <span style={{ fontSize: isMobile ? "20px" : "26px" }}>✈️</span>
              <span
                style={{
                  fontSize: isMobile ? "15px" : "22px",
                  lineHeight: isMobile ? "21px" : "28px",
                  fontWeight: 700,
                }}
              >
                Lock Flight Prices &amp; Pay Later
              </span>
            </div>

            <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
              <span style={{ fontSize: isMobile ? "20px" : "26px" }}>🏨</span>
              <span
                style={{
                  fontSize: isMobile ? "15px" : "22px",
                  lineHeight: isMobile ? "21px" : "28px",
                  fontWeight: 700,
                }}
              >
                Book Hotels @ ₹1
              </span>
            </div>

            <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
              <span style={{ fontSize: isMobile ? "20px" : "26px" }}>🚆</span>
              <span
                style={{
                  fontSize: isMobile ? "15px" : "22px",
                  lineHeight: isMobile ? "21px" : "28px",
                  fontWeight: 700,
                }}
              >
                Get 3X refund, if your waitlisted Train doesn&apos;t get confirmed
              </span>
            </div>
          </div>
        </div>

        <div
          style={{
            padding: isMobile ? "22px 18px 20px" : "36px 34px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              border: "1px solid #e2e8f0",
              borderRadius: "999px",
              overflow: "hidden",
              marginBottom: "22px",
              background: "#eef2f7",
              padding: "4px",
            }}
          >
            <button
              onClick={() => setActiveAccountType("personal")}
              style={{
                flex: 1,
                height: isMobile ? "40px" : "44px",
                border: "none",
                borderRadius: "999px",
                background:
                  activeAccountType === "personal" ? "#0b5fff" : "transparent",
                color:
                  activeAccountType === "personal" ? "#ffffff" : "#475569",
                fontWeight: 700,
                fontSize: isMobile ? "13px" : "15px",
                cursor: "pointer",
                boxShadow:
                  activeAccountType === "personal"
                    ? "0 4px 14px rgba(11,95,255,0.25)"
                    : "none",
                transition: "all 0.2s ease",
              }}
            >
              USER LOGIN
            </button>

            <button
              onClick={() => setActiveAccountType("partner")}
              style={{
                flex: 1,
                height: isMobile ? "40px" : "44px",
                border: "none",
                borderRadius: "999px",
                background:
                  activeAccountType === "partner" ? "#0b5fff" : "transparent",
                color:
                  activeAccountType === "partner" ? "#ffffff" : "#475569",
                fontWeight: 700,
                fontSize: isMobile ? "13px" : "15px",
                cursor: "pointer",
                boxShadow:
                  activeAccountType === "partner"
                    ? "0 4px 14px rgba(11,95,255,0.25)"
                    : "none",
                transition: "all 0.2s ease",
              }}
            >
              PARTNER DESK
            </button>
          </div>

          {successText ? (
            <div
              style={{
                marginBottom: "16px",
                border: "1px solid #bbf7d0",
                background: "#f0fdf4",
                color: "#15803d",
                borderRadius: "10px",
                padding: "12px 14px",
                fontSize: "14px",
                fontWeight: 700,
                textAlign: "center",
              }}
            >
              {successText}
            </div>
          ) : null}

          {step === "mobile" ? (
            <>
              <label
                style={{
                  fontSize: "14px",
                  fontWeight: 700,
                  color: "#0f172a",
                  marginBottom: "8px",
                }}
              >
                Mobile Number
              </label>

              <div
                style={{
                  height: "48px",
                  border: "1px solid #cbd5e1",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  overflow: "hidden",
                  background: "#ffffff",
                }}
              >
                <div
                  style={{
                    width: "84px",
                    borderRight: "1px solid #e2e8f0",
                    textAlign: "center",
                    fontWeight: 600,
                    color: "#1e293b",
                  }}
                >
                  +91
                </div>
                <input
                  value={mobile}
                  onChange={(e) =>
                    setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))
                  }
                  placeholder="Enter Mobile Number"
                  style={{
                    flex: 1,
                    height: "100%",
                    border: "none",
                    outline: "none",
                    padding: "0 14px",
                    fontSize: "14px",
                    color: "#0f172a",
                  }}
                />
              </div>

              {errorText ? (
                <p
                  style={{
                    marginTop: "10px",
                    fontSize: "13px",
                    color: "#dc2626",
                  }}
                >
                  {errorText}
                </p>
              ) : null}

              {infoText ? (
                <p
                  style={{
                    marginTop: "10px",
                    fontSize: "13px",
                    color: "#2563eb",
                  }}
                >
                  {infoText}
                </p>
              ) : null}

              <button
                onClick={handleSendOtp}
                disabled={!isValidMobile || isSubmitting}
                style={{
                  marginTop: "18px",
                  height: "46px",
                  border: "none",
                  borderRadius: "8px",
                  background:
                    !isValidMobile || isSubmitting ? "#dbeafe" : "#0b5fff",
                  color:
                    !isValidMobile || isSubmitting ? "#64748b" : "#ffffff",
                  fontWeight: 700,
                  cursor:
                    !isValidMobile || isSubmitting ? "not-allowed" : "pointer",
                  opacity: 0.98,
                }}
              >
                {isSubmitting ? "SENDING OTP..." : "CONTINUE"}
              </button>
            </>
          ) : (
            <>
              <label
                style={{
                  fontSize: "14px",
                  fontWeight: 700,
                  color: "#0f172a",
                  marginBottom: "8px",
                }}
              >
                Enter OTP
              </label>

              <div
                style={{
                  height: "48px",
                  border: "1px solid #cbd5e1",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  overflow: "hidden",
                  background: "#ffffff",
                }}
              >
                <input
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  placeholder="Enter 6-digit OTP"
                  style={{
                    flex: 1,
                    height: "100%",
                    border: "none",
                    outline: "none",
                    padding: "0 14px",
                    fontSize: "14px",
                    color: "#0f172a",
                  }}
                />
              </div>

              <p
                style={{
                  marginTop: "10px",
                  fontSize: "13px",
                  color: "#64748b",
                }}
              >
                OTP sent to +91 {cleanedMobile}
              </p>

              {errorText ? (
                <p
                  style={{
                    marginTop: "8px",
                    fontSize: "13px",
                    color: "#dc2626",
                  }}
                >
                  {errorText}
                </p>
              ) : null}

              {infoText ? (
                <p
                  style={{
                    marginTop: "8px",
                    fontSize: "13px",
                    color: "#2563eb",
                  }}
                >
                  {infoText}
                </p>
              ) : null}

              <button
                onClick={handleVerifyOtp}
                disabled={!isValidOtp || isSubmitting}
                style={{
                  marginTop: "18px",
                  height: "46px",
                  border: "none",
                  borderRadius: "8px",
                  background:
                    !isValidOtp || isSubmitting ? "#dbeafe" : "#0b5fff",
                  color:
                    !isValidOtp || isSubmitting ? "#64748b" : "#ffffff",
                  fontWeight: 700,
                  cursor:
                    !isValidOtp || isSubmitting ? "not-allowed" : "pointer",
                  opacity: 0.98,
                }}
              >
                {isSubmitting ? "VERIFYING..." : "VERIFY OTP"}
              </button>

              <button
                onClick={handleBackToMobile}
                type="button"
                style={{
                  marginTop: "10px",
                  height: "42px",
                  border: "1px solid #cbd5e1",
                  borderRadius: "8px",
                  background: "#ffffff",
                  color: "#334155",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                CHANGE MOBILE
              </button>
            </>
          )}

          <div
            style={{
              marginTop: "22px",
              textAlign: "center",
              fontSize: "13px",
              color: "#6b7280",
            }}
          >
            Or Login/Signup With
          </div>

          <div
            style={{
              marginTop: "14px",
              display: "flex",
              justifyContent: "center",
              gap: "14px",
            }}
          >
            <button
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "999px",
                border: "1px solid #d1d5db",
                background: "#ffffff",
                cursor: "pointer",
                color: "#374151",
                fontWeight: 600,
              }}
            >
              G
            </button>
            <button
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "999px",
                border: "1px solid #d1d5db",
                background: "#ffffff",
                cursor: "pointer",
                color: "#374151",
                fontWeight: 600,
              }}
            >
              ✉
            </button>
          </div>

          <p
            style={{
              marginTop: "22px",
              fontSize: "12px",
              lineHeight: "18px",
              color: "#6b7280",
              textAlign: "center",
            }}
          >
            By proceeding, you agree to our Privacy Policy, User Agreement and T&amp;Cs
          </p>
        </div>
      </div>
    </div>
  );
}
