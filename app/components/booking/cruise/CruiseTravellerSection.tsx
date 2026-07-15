"use client";

import { useEffect, useMemo, useState } from "react";
import CruiseDomesticTravellerModal, {
  CruiseDomesticTravellerForm,
} from "@/app/components/booking/cruise/CruiseDomesticTravellerModal";
import CruiseInternationalTravellerModal, {
  CruiseInternationalTravellerForm,
} from "@/app/components/booking/cruise/CruiseInternationalTravellerModal";
import { AUTH_UPDATED_EVENT } from "@/app/lib/booking/guestAuth";
import { getSavedProfile } from "@/app/lib/account/profileStorage";
import { getLoggedInDisplayName } from "@/app/lib/auth/displayName";

type CruiseCabinItem = {
  cabinKey: string;
  cabinId: string;
  cabinName: string;
  adults: number;
  children: number;
  infants: number;
  subtotal: number;
};

type ContactDetails = {
  countryCode: string;
  mobile: string;
  email: string;
};

type ValidationTraveller = {
  id: string;
  travellerType: "adult" | "child" | "infant";
  label: string;
  firstName: string;
  lastName: string;
  gender: string;
  cabinLabel: string;
};

type ValidationPayload = {
  travellers: ValidationTraveller[];
  contactDetails: ContactDetails;
  allRequiredTravellersCompleted: boolean;
  contactValid: boolean;
  canProceed: boolean;
};

type Props = {
  cabins?: CruiseCabinItem[];
  pricingSummary?: {
    cabins?: CruiseCabinItem[];
  } | null;
  isInternationalTrip?: boolean;
  onValidationChange?: (payload: ValidationPayload) => void;
  defaultOpen?: boolean;
};

type TravellerCardItem = {
  id: string;
  travellerType: "adult" | "child" | "infant";
  label: string;
  cabinLabel: string;
  firstName: string;
  lastName: string;
  gender: string;
};

function getActiveUser() {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem("tpl_auth_session_v1");
    return raw ? JSON.parse(raw)?.user : null;
  } catch {
    return null;
  }
}

function splitFullName(fullName?: string) {
  const cleanName = String(fullName || "").trim();

  if (!cleanName) {
    return { firstName: "", lastName: "" };
  }

  const parts = cleanName.split(/\s+/);
  const firstName = parts.slice(0, -1).join(" ") || parts[0] || "";
  const lastName = parts.length > 1 ? parts[parts.length - 1] : "";

  return { firstName, lastName };
}

function getDisplayNameFromUser(user: any) {
  return getLoggedInDisplayName(user);
}

function buildTravellerShells(
  cabins: CruiseCabinItem[] = []
): TravellerCardItem[] {
  const items: TravellerCardItem[] = [];

  cabins.forEach((cabin, cabinIndex) => {
    const cabinLabel = `Cabin ${cabinIndex + 1} - ${cabin.cabinName}`;

    for (let i = 0; i < (cabin.adults || 0); i++) {
      items.push({
        id: `${cabin.cabinKey}-adult-${i + 1}`,
        travellerType: "adult",
        label: `ADULT ${i + 1}`,
        cabinLabel,
        firstName: "",
        lastName: "",
        gender: "",
      });
    }

    for (let i = 0; i < (cabin.children || 0); i++) {
      items.push({
        id: `${cabin.cabinKey}-child-${i + 1}`,
        travellerType: "child",
        label: `CHILD ${i + 1}`,
        cabinLabel,
        firstName: "",
        lastName: "",
        gender: "",
      });
    }

    for (let i = 0; i < (cabin.infants || 0); i++) {
      items.push({
        id: `${cabin.cabinKey}-infant-${i + 1}`,
        travellerType: "infant",
        label: `INFANT ${i + 1}`,
        cabinLabel,
        firstName: "",
        lastName: "",
        gender: "",
      });
    }
  });

  return items;
}

function getModalTravellerId(cardId: string) {
  const parts = cardId.split("-");
  if (parts.length < 3) return cardId;
  return parts.slice(parts.length - 2).join("-");
}

export default function CruiseTravellerSection({
  cabins = [],
  isInternationalTrip = false,
  onValidationChange,
  defaultOpen = true,
}: Props) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [showDomesticModal, setShowDomesticModal] = useState(false);
  const [showInternationalModal, setShowInternationalModal] = useState(false);
  const [activeUser, setActiveUser] = useState<any>(null);

  const [travellerCards, setTravellerCards] = useState<TravellerCardItem[]>(
    buildTravellerShells(cabins)
  );

  const [savedDomesticTravellers, setSavedDomesticTravellers] = useState<
    CruiseDomesticTravellerForm[]
  >([]);
  const [savedInternationalTravellers, setSavedInternationalTravellers] =
    useState<CruiseInternationalTravellerForm[]>([]);

  const [contactDetails, setContactDetails] = useState<ContactDetails>({
    countryCode: "+91",
    mobile: "",
    email: "",
  });

  const cabinsSignature = useMemo(() => {
    return JSON.stringify(
      cabins.map((cabin) => ({
        cabinKey: cabin.cabinKey,
        cabinId: cabin.cabinId,
        adults: cabin.adults,
        children: cabin.children,
        infants: cabin.infants,
      }))
    );
  }, [cabins]);

  useEffect(() => {
    setTravellerCards(buildTravellerShells(cabins));
    setSavedDomesticTravellers([]);
    setSavedInternationalTravellers([]);
  }, [cabinsSignature, cabins]);

  useEffect(() => {
    const syncActiveUser = () => {
      const user = getActiveUser();
      setActiveUser(user);

      if (!user?.mobile) return;

      const profile = getSavedProfile(user.mobile);

      setContactDetails((prev) => ({
        ...prev,
        mobile: String(user.mobile || "").replace(/\D/g, "").slice(0, 10),
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

  const totalAdults = useMemo(
    () => cabins.reduce((sum, cabin) => sum + (cabin.adults || 0), 0),
    [cabins]
  );

  const totalChildren = useMemo(
    () => cabins.reduce((sum, cabin) => sum + (cabin.children || 0), 0),
    [cabins]
  );

  const totalInfants = useMemo(
    () => cabins.reduce((sum, cabin) => sum + (cabin.infants || 0), 0),
    [cabins]
  );

  const isTravellerComplete = (traveller: TravellerCardItem) => {
    const modalTravellerId = getModalTravellerId(traveller.id);

    const matchedInternational = savedInternationalTravellers.find(
      (item) => item.id === modalTravellerId
    );

    if (matchedInternational) {
      return Boolean(
        matchedInternational.firstName?.trim() &&
          matchedInternational.lastName?.trim() &&
          matchedInternational.gender &&
          matchedInternational.dateOfBirthDay &&
          matchedInternational.dateOfBirthMonth &&
          matchedInternational.dateOfBirthYear &&
          matchedInternational.passportNo?.trim() &&
          matchedInternational.passportIssuingCountry?.trim() &&
          matchedInternational.passportExpiryDay &&
          matchedInternational.passportExpiryMonth &&
          matchedInternational.passportExpiryYear
      );
    }

    const matchedDomestic = savedDomesticTravellers.find(
      (item) => item.id === modalTravellerId
    );

    if (matchedDomestic) {
      return Boolean(
        matchedDomestic.firstName?.trim() &&
          matchedDomestic.lastName?.trim() &&
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
    const mobileOk = /^[0-9]{10}$/.test(contactDetails.mobile.trim());
    return emailOk && mobileOk;
  }, [contactDetails]);

  const canProceed = allRequiredTravellersCompleted && contactValid;

  const validationTravellers: ValidationTraveller[] = useMemo(() => {
    return travellerCards.map((item) => ({
      id: item.id,
      travellerType: item.travellerType,
      label: item.label,
      cabinLabel: item.cabinLabel,
      firstName: item.firstName,
      lastName: item.lastName,
      gender: item.gender,
    }));
  }, [travellerCards]);

  useEffect(() => {
    onValidationChange?.({
      travellers: validationTravellers,
      contactDetails,
      allRequiredTravellersCompleted,
      contactValid,
      canProceed,
    });
  }, [
    validationTravellers,
    contactDetails,
    allRequiredTravellersCompleted,
    contactValid,
    canProceed,
    onValidationChange,
  ]);

  const openTravellerModal = () => {
    if (isInternationalTrip) {
      setShowDomesticModal(false);
      setShowInternationalModal(true);
    } else {
      setShowInternationalModal(false);
      setShowDomesticModal(true);
    }
  };

  const handleDomesticSave = (travellers: CruiseDomesticTravellerForm[]) => {
    setSavedDomesticTravellers(travellers);

    const nextCards = travellerCards.map((card) => {
      const matched = travellers.find(
        (item) => item.id === getModalTravellerId(card.id)
      );
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

  const handleInternationalSave = (
    travellers: CruiseInternationalTravellerForm[]
  ) => {
    setSavedInternationalTravellers(travellers);

    const nextCards = travellerCards.map((card) => {
      const matched = travellers.find(
        (item) => item.id === getModalTravellerId(card.id)
      );
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
          style={sectionHeaderStyle}
          onClick={() => setIsOpen((prev) => !prev)}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
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

        {isOpen && (
          <>
            <div style={loginStripStyle}>
              <p
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
            </div>

            <div style={{ padding: "18px", background: "#ffffff" }}>
              <div
                style={{
                  marginBottom: "18px",
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "12px",
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#374151",
                }}
              >
                <span>Total Adults: {totalAdults}</span>
                <span>Total Children: {totalChildren}</span>
                <span>Total Infants: {totalInfants}</span>
                <span>
                  Trip Type:{" "}
                  {isInternationalTrip ? "International" : "Domestic"}
                </span>
              </div>

              <div className="cruise-traveller-list" style={{ display: "grid", gap: "14px" }}>
                {travellerCards.map((traveller) => {
                  const completed = isTravellerComplete(traveller);

                  return (
                    <div
                      className="cruise-traveller-row"
                      key={traveller.id}
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
                            {traveller.cabinLabel} · {traveller.label}
                          </p>

                          <button
                            type="button"
                            onClick={openTravellerModal}
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

                <div className="cruise-contact-grid" style={grid3Style}>
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
                          mobile: e.target.value.replace(/\D/g, "").slice(0, 10),
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
            </div>
          </>
        )}
      </section>

      <CruiseDomesticTravellerModal
        isOpen={showDomesticModal}
        onClose={() => setShowDomesticModal(false)}
        adults={totalAdults}
        children={totalChildren}
        infants={totalInfants}
        initialTravellers={savedDomesticTravellers}
        onSave={handleDomesticSave}
      />

      <CruiseInternationalTravellerModal
        isOpen={showInternationalModal}
        onClose={() => setShowInternationalModal(false)}
        adults={totalAdults}
        children={totalChildren}
        infants={totalInfants}
        initialTravellers={savedInternationalTravellers}
        onSave={handleInternationalSave}
      />

      <style jsx>{`
        @media (max-width: 767px) {
          .cruise-traveller-row {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 12px !important;
            border: 1px solid #e5e7eb !important;
            border-radius: 16px !important;
            padding: 14px !important;
            box-shadow: 0 8px 22px rgba(15, 23, 42, 0.06) !important;
          }

          .cruise-contact-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
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
