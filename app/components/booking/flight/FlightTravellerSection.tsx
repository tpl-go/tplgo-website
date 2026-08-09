"use client";

import { useEffect, useMemo, useState } from "react";
import AddDomesticTravellerModal, {
  DomesticTravellerForm,
} from "./AddDomesticTravellerModal";
import AddInternationalTravellerModal, {
  InternationalTravellerForm,
} from "./AddInternationalTravellerModal";
import LoginModal from "@/app/components/common/LoginModal";
import { AUTH_UPDATED_EVENT } from "@/app/lib/booking/guestAuth";
import { getSavedProfile } from "@/app/lib/account/profileStorage";
import { getLoggedInDisplayName } from "@/app/lib/auth/displayName";

type ContactDetails = {
  countryCode: string;
  mobile: string;
  email: string;
};

type GstDetails = {
  hasGst: boolean;
  state: string;
  saveBillingToProfile: boolean;
};

type ValidationTraveller = {
  id: string;
  travellerType: "adult" | "child" | "infant";
  label: string;
  firstName: string;
  lastName: string;
  gender: string;
  dateOfBirth?: string;
  nationality?: string;
  passportNumber?: string;
  passportIssuingCountry?: string;
  passportExpiryDate?: string;
};

type ValidationPayload = {
  travellers: ValidationTraveller[];
  contactDetails: ContactDetails;
  gstDetails: GstDetails;
  allRequiredTravellersCompleted: boolean;
  contactValid: boolean;
  canProceed: boolean;
};

type Props = {
  bookingType: "oneWay" | "roundTrip" | "multiCity";
  tripMode: "domestic" | "international";
  passengers: {
    adults: number;
    children: number;
    infants: number;
  };
  onValidationChange?: (payload: ValidationPayload) => void;
};

type TravellerCardItem = {
  id: string;
  travellerType: "adult" | "child" | "infant";
  label: string;
  firstName: string;
  lastName: string;
  gender: string;
};

function getActiveUser() {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem("tpl_auth_session_v1");
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed?.user || null;
  } catch {
    return null;
  }
}

function splitFullName(fullName?: string) {
  const cleanName = String(fullName || "").trim();

  if (!cleanName) {
    return {
      firstName: "",
      lastName: "",
    };
  }

  const parts = cleanName.split(/\s+/);
  const firstName = parts.slice(0, -1).join(" ") || parts[0] || "";
  const lastName = parts.length > 1 ? parts[parts.length - 1] : "";

  return {
    firstName,
    lastName,
  };
}

function buildIsoDate(year?: string, month?: string, day?: string) {
  const cleanYear = String(year || "").trim();
  const cleanMonth = String(month || "").trim().padStart(2, "0");
  const cleanDay = String(day || "").trim().padStart(2, "0");
  if (!/^\d{4}$/.test(cleanYear) || !/^\d{2}$/.test(cleanMonth) || !/^\d{2}$/.test(cleanDay)) return "";
  return `${cleanYear}-${cleanMonth}-${cleanDay}`;
}

function getDisplayNameFromUser(user: any) {
  return getLoggedInDisplayName(user);
}

function buildTravellerShells(passengers: Props["passengers"]): TravellerCardItem[] {
  const items: TravellerCardItem[] = [];

  for (let i = 0; i < passengers.adults; i++) {
    items.push({
      id: `adult-${i + 1}`,
      travellerType: "adult",
      label: `ADULT ${i + 1}`,
      firstName: "",
      lastName: "",
      gender: "",
    });
  }

  for (let i = 0; i < passengers.children; i++) {
    items.push({
      id: `child-${i + 1}`,
      travellerType: "child",
      label: `CHILD ${i + 1}`,
      firstName: "",
      lastName: "",
      gender: "",
    });
  }

  for (let i = 0; i < passengers.infants; i++) {
    items.push({
      id: `infant-${i + 1}`,
      travellerType: "infant",
      label: `INFANT ${i + 1}`,
      firstName: "",
      lastName: "",
      gender: "",
    });
  }

  return items;
}

export default function FlightTravellerSection({
  bookingType,
  tripMode,
  passengers,
  onValidationChange,
}: Props) {
  const [isOpen, setIsOpen] = useState(true);
  const [showDomesticModal, setShowDomesticModal] = useState(false);
  const [showInternationalModal, setShowInternationalModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [activeUser, setActiveUser] = useState<any>(null);

  const [travellerCards, setTravellerCards] = useState<TravellerCardItem[]>(
    buildTravellerShells(passengers)
  );

  const [savedDomesticTravellers, setSavedDomesticTravellers] = useState<
    DomesticTravellerForm[]
  >([]);
  const [savedInternationalTravellers, setSavedInternationalTravellers] =
    useState<InternationalTravellerForm[]>([]);

const [contactDetails, setContactDetails] = useState<ContactDetails>({
  countryCode: "+91",
  mobile: "",
  email: "",
});

  const [gstDetails, setGstDetails] = useState<GstDetails>({
    hasGst: false,
    state: "",
    saveBillingToProfile: false,
  });

  useEffect(() => {
    setTravellerCards(buildTravellerShells(passengers));
    setSavedDomesticTravellers([]);
    setSavedInternationalTravellers([]);
  }, [passengers]);

  useEffect(() => {
    const syncActiveUser = () => {
      const user = getActiveUser();
      setActiveUser(user);

      if (!user?.mobile) return;

      const profile = getSavedProfile(user.mobile);

      setContactDetails((prev) => ({
        ...prev,
        mobile: String(user.mobile || "").replace(/\D/g, "").slice(0, 15),
        email: user.email || profile.email || prev.email,
      }));

      const displayName = getDisplayNameFromUser(user);
      const { firstName, lastName } = splitFullName(displayName);

      if (!firstName && !lastName) return;

      setTravellerCards((prev) =>
        prev.map((card, index) => {
          if (index !== 0) return card;
          if (card.firstName || card.lastName) return card;

          return {
            ...card,
            firstName,
            lastName,
          };
        })
      );
    };

    syncActiveUser();

    window.addEventListener(AUTH_UPDATED_EVENT, syncActiveUser);
    window.addEventListener("storage", syncActiveUser);

    return () => {
      window.removeEventListener(AUTH_UPDATED_EVENT, syncActiveUser);
      window.removeEventListener("storage", syncActiveUser);
    };
  }, []);

  const isTravellerComplete = (traveller: TravellerCardItem) => {
    const matchedInternational = savedInternationalTravellers.find(
      (item) => item.id === traveller.id
    );

    if (matchedInternational) {
      return Boolean(
        matchedInternational.firstName.trim() &&
          matchedInternational.lastName.trim() &&
          matchedInternational.gender &&
          matchedInternational.dateOfBirthDay &&
          matchedInternational.dateOfBirthMonth &&
          matchedInternational.dateOfBirthYear &&
          matchedInternational.passportNo.trim() &&
          matchedInternational.passportIssuingCountry.trim() &&
          matchedInternational.passportExpiryDay &&
          matchedInternational.passportExpiryMonth &&
          matchedInternational.passportExpiryYear
      );
    }

    const matchedDomestic = savedDomesticTravellers.find(
      (item) => item.id === traveller.id
    );

    if (matchedDomestic) {
      return Boolean(
        matchedDomestic.firstName.trim() &&
          matchedDomestic.lastName.trim() &&
          matchedDomestic.gender
      );
    }

    return false;
  };

  const completedTravellerCount = useMemo(() => {
    return travellerCards.filter((item) => isTravellerComplete(item)).length;
  }, [travellerCards, savedDomesticTravellers, savedInternationalTravellers]);

  const allRequiredTravellersCompleted =
    travellerCards.length > 0 &&
    completedTravellerCount === travellerCards.length;

  const contactValid = useMemo(() => {
    const emailOk = /\S+@\S+\.\S+/.test(contactDetails.email.trim());
    const mobileOk = /^[0-9]{8,15}$/.test(contactDetails.mobile.trim());
    return emailOk && mobileOk;
  }, [contactDetails]);

  const canProceed = allRequiredTravellersCompleted && contactValid;

  const validationTravellers: ValidationTraveller[] = useMemo(() => {
    return travellerCards.map((item) => {
      const domestic = savedDomesticTravellers.find((traveller) => traveller.id === item.id);
      const international = savedInternationalTravellers.find((traveller) => traveller.id === item.id);
      const source = international || domestic;
      return {
        id: item.id,
        travellerType: item.travellerType,
        label: item.label,
        firstName: item.firstName,
        lastName: item.lastName,
        gender: item.gender,
        ...(source ? { dateOfBirth: buildIsoDate(source.dateOfBirthYear, source.dateOfBirthMonth, source.dateOfBirthDay) } : {}),
        ...(international?.passportNo ? { passportNumber: international.passportNo } : {}),
        ...(international?.passportIssuingCountry ? { passportIssuingCountry: international.passportIssuingCountry } : {}),
        ...(international ? { passportExpiryDate: buildIsoDate(international.passportExpiryYear, international.passportExpiryMonth, international.passportExpiryDay) } : {}),
        ...(international?.passportIssuingCountry ? { nationality: international.passportIssuingCountry } : {}),
      };
    });
  }, [travellerCards, savedDomesticTravellers, savedInternationalTravellers]);

  useEffect(() => {
    onValidationChange?.({
      travellers: validationTravellers,
      contactDetails,
      gstDetails,
      allRequiredTravellersCompleted,
      contactValid,
      canProceed,
    });
  }, [
    validationTravellers,
    contactDetails,
    gstDetails,
    allRequiredTravellersCompleted,
    contactValid,
    canProceed,
    onValidationChange,
  ]);

  const openTravellerModal = () => {
    if (tripMode === "international") {
      setShowDomesticModal(false);
      setShowInternationalModal(true);
    } else {
      setShowInternationalModal(false);
      setShowDomesticModal(true);
    }
  };

  const handleDomesticSave = (travellers: DomesticTravellerForm[]) => {
    setSavedDomesticTravellers(travellers);

    const nextCards = travellerCards.map((card) => {
      const matched = travellers.find((item) => item.id === card.id);

      if (!matched) return card;

      return {
        ...card,
        firstName: matched.firstName,
        lastName: matched.lastName,
        gender: matched.gender,
      };
    });

    setTravellerCards(nextCards);
    setShowDomesticModal(false);
  };

  const handleInternationalSave = (travellers: InternationalTravellerForm[]) => {
    setSavedInternationalTravellers(travellers);

    const nextCards = travellerCards.map((card) => {
      const matched = travellers.find((item) => item.id === card.id);

      if (!matched) return card;

      return {
        ...card,
        firstName: matched.firstName,
        lastName: matched.lastName,
        gender: matched.gender,
      };
    });

    setTravellerCards(nextCards);
    setShowInternationalModal(false);
  };

  return (
    <>
      <section id="traveller-detail">
        <div
          className="max-md:flex-col max-md:items-stretch max-md:px-3 max-md:py-3"
          style={sectionHeaderStyle}
          onClick={() => setIsOpen((prev) => !prev)}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                width: "18px",
                height: "18px",
                borderRadius: "999px",
                background: canProceed ? "#22c55e" : "#d9534f",
                color: "#fff",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "12px",
                fontWeight: 800,
              }}
            >
              {canProceed ? "✓" : "!"}
            </span>

            <h3
              style={{
                margin: 0,
                fontSize: "18px",
                fontWeight: 800,
                color: "#1f2937",
              }}
            >
              Traveller Detail
            </h3>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
            }}
          >
            <span
              className="max-md:text-[11px]"
              style={{
                fontSize: "13px",
                fontWeight: 700,
                color: canProceed ? "#15803d" : "#9a4b55",
                textTransform: "uppercase",
              }}
            >
              {canProceed ? "Details complete" : "More information needed"}
            </span>

            <span
              style={{
                fontSize: "18px",
                color: "#55a8d8",
                fontWeight: 700,
                transform: isOpen ? "rotate(0deg)" : "rotate(-90deg)",
                transition: "transform 0.2s ease",
              }}
            >
              ˅
            </span>
          </div>
        </div>

        {isOpen && (
          <>
            <div className="max-md:px-3 max-md:py-3" style={loginStripStyle}>
              <p
                className="max-md:text-[13px] max-md:leading-[20px]"
                style={{
                  margin: 0,
                  fontSize: "14px",
                  color: "#4b5563",
                  fontWeight: 500,
                }}
              >
                {activeUser?.mobile ? (
                  <>
                    <span style={{ fontWeight: 700, color: "#111827" }}>
                      Logged in
                    </span>{" "}
                    as {getDisplayNameFromUser(activeUser)}. Saved traveller
                    details and wallet benefits can be used for faster booking.
                  </>
                ) : (
                  <>
                    <span style={{ fontWeight: 700, color: "#111827" }}>
                      Login
                    </span>{" "}
                    to view your saved traveller list, unlock special offers and
                    faster booking.
                  </>
                )}
              </p>

              {!activeUser?.mobile ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowLoginModal(true);
                  }}
                  style={linkButtonStyle}
                >
                  Login Now →
                </button>
              ) : null}
            </div>

            <div className="max-md:p-3" style={{ padding: "18px", background: "#ffffff" }}>
              <div style={{ display: "grid", gap: "14px" }}>
                {travellerCards.map((traveller) => {
                  const completed = isTravellerComplete(traveller);

                  return (
                    <div
                      key={traveller.id}
                      className="max-md:flex-col max-md:items-start max-md:gap-3"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "16px",
                        padding: "16px 0",
                        borderBottom: "1px solid #e5e7eb",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "14px",
                          minWidth: 0,
                        }}
                      >
                        <div
                          style={{
                            width: "44px",
                            height: "44px",
                            borderRadius: "6px",
                            background: completed ? "#dcfce7" : "#dff3ff",
                            color: completed ? "#16a34a" : "#67b8e8",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "22px",
                            flexShrink: 0,
                          }}
                        >
                          {completed ? "✓" : "👤"}
                        </div>

                        <div>
                          <p
                            style={{
                              margin: 0,
                              fontSize: "12px",
                              color: "#9ca3af",
                              fontWeight: 600,
                            }}
                          >
                            {traveller.label}
                          </p>

                          <button
                            onClick={openTravellerModal}
                            className="max-md:text-[15px] max-md:leading-[20px]"
                            style={{
                              marginTop: "4px",
                              border: "none",
                              background: "transparent",
                              padding: 0,
                              color: "#55b2ea",
                              fontSize: "16px",
                              fontWeight: 700,
                              cursor: "pointer",
                              textAlign: "left",
                            }}
                          >
                            {completed
                              ? `${traveller.firstName} ${traveller.lastName}`.trim()
                              : `Add ${traveller.label}`}
                          </button>
                        </div>
                      </div>

                      <p
                        style={{
                          margin: 0,
                          fontSize: "11px",
                          color: completed ? "#16a34a" : "#9ca3af",
                          fontWeight: 700,
                          whiteSpace: "nowrap",
                          flexShrink: 0,
                        }}
                      >
                        {completed ? "DETAILS ADDED" : "REQUIRED"}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div style={{ marginTop: "28px" }}>
                <h3 style={subHeadingStyle}>Booking details will be sent to</h3>

                <div className="max-md:!grid-cols-1" style={grid3Style}>
                  <Field label="Country Code">
                    <select
                      style={inputStyle}
                      value={contactDetails.countryCode}
                      onChange={(e) =>
                        setContactDetails((prev) => ({
                          ...prev,
                          countryCode: e.target.value,
                        }))
                      }
                    >
                      <option value="+91">India (+91)</option>
                      <option value="+971">UAE (+971)</option>
                      <option value="+44">UK (+44)</option>
                      <option value="+1">USA (+1)</option>
                      <option value="+65">Singapore (+65)</option>
                    </select>
                  </Field>

                  <Field label="Mobile No">
                    <input
                      type="text"
                      placeholder="Enter mobile number"
                      style={inputStyle}
                      value={contactDetails.mobile}
                      onChange={(e) =>
                        setContactDetails((prev) => ({
                          ...prev,
                          mobile: e.target.value.replace(/\D/g, "").slice(0, 15),
                        }))
                      }
                    />
                  </Field>

                  <Field label="Email">
                    <input
                      type="email"
                      placeholder="Enter email"
                      style={inputStyle}
                      value={contactDetails.email}
                      onChange={(e) =>
                        setContactDetails((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                    />
                  </Field>
                </div>
              </div>

              <div style={{ marginTop: "24px" }}>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    fontWeight: 700,
                    color: "#111827",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={gstDetails.hasGst}
                    onChange={() =>
                      setGstDetails((prev) => ({
                        ...prev,
                        hasGst: !prev.hasGst,
                      }))
                    }
                  />
                  I have a GST number (Optional)
                </label>
              </div>

              {gstDetails.hasGst && (
                  <div
                    className="max-md:p-3"
                    style={{
                      marginTop: "18px",
                      padding: "18px",
                    background: "#f8fbff",
                    border: "1px solid #d9e2ec",
                  }}
                >
                  <h3 style={subHeadingStyle}>Your State</h3>

                  <div
                    className="max-md:!grid-cols-1"
                    style={{
                      ...grid3Style,
                      gridTemplateColumns: "1fr 1fr",
                    }}
                  >
                    <Field label="Select State">
                      <select
                        style={inputStyle}
                        value={gstDetails.state}
                        onChange={(e) =>
                          setGstDetails((prev) => ({
                            ...prev,
                            state: e.target.value,
                          }))
                        }
                      >
                        <option value="">Select State</option>
                        <option>Rajasthan</option>
                        <option>Delhi</option>
                        <option>Maharashtra</option>
                        <option>Karnataka</option>
                      </select>
                    </Field>
                  </div>

                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      marginTop: "14px",
                      color: "#374151",
                      fontWeight: 600,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={gstDetails.saveBillingToProfile}
                      onChange={() =>
                        setGstDetails((prev) => ({
                          ...prev,
                          saveBillingToProfile: !prev.saveBillingToProfile,
                        }))
                      }
                    />
                    Confirm and save billing details to your profile
                  </label>
                </div>
              )}
            </div>
          </>
        )}
      </section>

      <AddDomesticTravellerModal
        isOpen={showDomesticModal}
        onClose={() => setShowDomesticModal(false)}
        adults={passengers.adults}
        children={passengers.children}
        infants={passengers.infants}
        initialTravellers={savedDomesticTravellers}
        onSave={handleDomesticSave}
      />

      <AddInternationalTravellerModal
        isOpen={showInternationalModal}
        onClose={() => setShowInternationalModal(false)}
        adults={passengers.adults}
        children={passengers.children}
        infants={passengers.infants}
        initialTravellers={savedInternationalTravellers}
        onSave={handleInternationalSave}
      />

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label style={fieldLabelStyle}>{label}</label>
      {children}
    </div>
  );
}

const sectionHeaderStyle: React.CSSProperties = {
  minHeight: "58px",
  padding: "0 18px",
  borderTop: "1px solid #d9e2ec",
  borderBottom: "1px solid #d9e2ec",
  background: "#fffdf4",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "16px",
  cursor: "pointer",
};

const loginStripStyle: React.CSSProperties = {
  padding: "14px 18px",
  background: "#eef8ff",
  borderBottom: "1px solid #d9e2ec",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "16px",
  flexWrap: "wrap",
};

const linkButtonStyle: React.CSSProperties = {
  border: "none",
  background: "transparent",
  color: "#2a9fe8",
  fontSize: "14px",
  fontWeight: 700,
  cursor: "pointer",
  whiteSpace: "nowrap",
};

const subHeadingStyle: React.CSSProperties = {
  margin: 0,
  fontSize: "18px",
  fontWeight: 800,
  color: "#111827",
};

const fieldLabelStyle: React.CSSProperties = {
  display: "block",
  marginBottom: "8px",
  fontSize: "13px",
  fontWeight: 600,
  color: "#6b7280",
};

const grid3Style: React.CSSProperties = {
  marginTop: "14px",
  display: "grid",
  gridTemplateColumns: "1fr 1fr 1fr",
  gap: "14px",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  height: "44px",
  border: "1px solid #d1d5db",
  borderRadius: "4px",
  padding: "0 12px",
  fontSize: "14px",
  color: "#111827",
  outline: "none",
  background: "#ffffff",
};
