"use client";

import { useEffect, useMemo, useState } from "react";
import PackageDomesticTravellerModal, {
  PackageDomesticTravellerForm,
} from "@/app/components/booking/packages/PackageDomesticTravellerModal";
import PackageInternationalTravellerModal, {
  PackageInternationalTravellerForm,
} from "@/app/components/booking/packages/PackageInternationalTravellerModal";
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
  travellerType: "adult" | "child";
  label: string;
  firstName: string;
  lastName: string;
  gender: string;
  roomLabel?: string;
};

type ValidationPayload = {
  travellers: ValidationTraveller[];
  contactDetails: ContactDetails;
  gstDetails: GstDetails;
  allRequiredTravellersCompleted: boolean;
  contactValid: boolean;
  canProceed: boolean;
};

type Room = {
  adults: number;
  children: number;
};

type TravellerCardItem = {
  id: string;
  travellerType: "adult" | "child";
  label: string;
  roomLabel: string;
  firstName: string;
  lastName: string;
  gender: string;
};

type Props = {
  rooms?: Room[];
  isInternationalTrip?: boolean;
  onValidationChange?: (payload: ValidationPayload) => void;
  defaultOpen?: boolean;
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

function getDisplayNameFromUser(user: any) {
  return getLoggedInDisplayName(user);
}

function buildTravellerShells(rooms: Room[] = []): TravellerCardItem[] {
  const items: TravellerCardItem[] = [];

  rooms.forEach((room, roomIndex) => {
    const roomLabel = `Room ${roomIndex + 1}`;

    for (let i = 0; i < (room.adults || 0); i++) {
      items.push({
        id: `room-${roomIndex + 1}-adult-${i + 1}`,
        travellerType: "adult",
        label: `ADULT ${i + 1}`,
        roomLabel,
        firstName: "",
        lastName: "",
        gender: "",
      });
    }

    for (let i = 0; i < (room.children || 0); i++) {
      items.push({
        id: `room-${roomIndex + 1}-child-${i + 1}`,
        travellerType: "child",
        label: `CHILD ${i + 1}`,
        roomLabel,
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
  if (parts.length < 4) return cardId;
  return parts.slice(2).join("-");
}

export default function BookingTravellersSection({
  rooms = [{ adults: 2, children: 0 }],
  isInternationalTrip = false,
  onValidationChange,
  defaultOpen = true,
}: Props) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [showDomesticModal, setShowDomesticModal] = useState(false);
  const [showInternationalModal, setShowInternationalModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [activeUser, setActiveUser] = useState<any>(null);

  const [travellerCards, setTravellerCards] = useState<TravellerCardItem[]>(
    buildTravellerShells(rooms)
  );

  const [savedDomesticTravellers, setSavedDomesticTravellers] = useState<
    PackageDomesticTravellerForm[]
  >([]);
  const [savedInternationalTravellers, setSavedInternationalTravellers] =
    useState<PackageInternationalTravellerForm[]>([]);

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

  const roomsSignature = useMemo(() => JSON.stringify(rooms), [rooms]);

  useEffect(() => {
    setTravellerCards(buildTravellerShells(rooms));
    setSavedDomesticTravellers([]);
    setSavedInternationalTravellers([]);
  }, [roomsSignature, rooms]);

  useEffect(() => {
    const syncActiveUser = () => {
      const user = getActiveUser();
      setActiveUser(user);

      if (!user?.mobile) return;

      const profile = getSavedProfile(user.mobile);

      setContactDetails((prev) => ({
        ...prev,
        mobile:
          prev.mobile ||
          String(user.mobile || "").replace(/\D/g, "").slice(0, 10),
        email: prev.email || user.email || profile.email || "",
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
    () => rooms.reduce((sum, room) => sum + (room.adults || 0), 0),
    [rooms]
  );

  const totalChildren = useMemo(
    () => rooms.reduce((sum, room) => sum + (room.children || 0), 0),
    [rooms]
  );

  const isTravellerComplete = (traveller: TravellerCardItem) => {
    const modalTravellerId = getModalTravellerId(traveller.id);

    const matchedInternational = savedInternationalTravellers.find(
      (item) => item.id === modalTravellerId
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
      (item) => item.id === modalTravellerId
    );

    if (matchedDomestic) {
      if (matchedDomestic.travellerType === "adult") {
        return Boolean(
          matchedDomestic.firstName.trim() &&
            matchedDomestic.lastName.trim() &&
            matchedDomestic.gender &&
            matchedDomestic.countryCode.trim() &&
            matchedDomestic.mobile.trim().length >= 8
        );
      }

      return Boolean(
        matchedDomestic.firstName.trim() &&
          matchedDomestic.lastName.trim() &&
          matchedDomestic.gender &&
          matchedDomestic.dateOfBirthDay &&
          matchedDomestic.dateOfBirthMonth &&
          matchedDomestic.dateOfBirthYear
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
      firstName: item.firstName,
      lastName: item.lastName,
      gender: item.gender,
      roomLabel: item.roomLabel,
    }));
  }, [travellerCards]);

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
    if (isInternationalTrip) {
      setShowDomesticModal(false);
      setShowInternationalModal(true);
    } else {
      setShowInternationalModal(false);
      setShowDomesticModal(true);
    }
  };

  const handleDomesticSave = (travellers: PackageDomesticTravellerForm[]) => {
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
    travellers: PackageInternationalTravellerForm[]
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
      <section id="traveller-details">
        <div
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

            <div className="booking-travellers-body" style={{ padding: "18px", background: "#ffffff" }}>
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
                <span>
                  Trip Type: {isInternationalTrip ? "International" : "Domestic"}
                </span>
              </div>

              <div style={{ display: "grid", gap: "14px" }}>
                {travellerCards.map((traveller) => {
                  const completed = isTravellerComplete(traveller);

                  return (
                    <div
                      className="booking-traveller-card"
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
                            {traveller.roomLabel} · {traveller.label}
                          </p>

                          <button
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

                <div className="booking-contact-grid" style={grid3Style}>
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
                  style={{
                    marginTop: "18px",
                    padding: "18px",
                    background: "#f8fbff",
                    border: "1px solid #d9e2ec",
                  }}
                >
                  <h3 style={subHeadingStyle}>Your State</h3>

                  <div
                    className="booking-gst-grid"
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

      <PackageDomesticTravellerModal
        isOpen={showDomesticModal}
        onClose={() => setShowDomesticModal(false)}
        adults={totalAdults}
        children={totalChildren}
        initialTravellers={savedDomesticTravellers}
        onSave={handleDomesticSave}
      />

      <PackageInternationalTravellerModal
        isOpen={showInternationalModal}
        onClose={() => setShowInternationalModal(false)}
        adults={totalAdults}
        children={totalChildren}
        initialTravellers={savedInternationalTravellers}
        onSave={handleInternationalSave}
      />

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
      <style>{`
        @media (max-width: 767px) {
          .booking-contact-grid {
            grid-template-columns: 1fr !important;
          }

          .booking-travellers-body {
            padding: 14px !important;
          }

          .booking-traveller-card {
            align-items: flex-start !important;
            flex-direction: column !important;
            gap: 12px !important;
            padding: 14px 0 !important;
          }

          .booking-traveller-card > p {
            align-self: flex-start !important;
          }

          .booking-gst-grid {
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
