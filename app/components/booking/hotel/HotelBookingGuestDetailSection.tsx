"use client";

import { useEffect, useMemo, useState } from "react";
import LoginModal from "@/app/components/common/LoginModal";
import AddDomesticTravellerModal, {
  DomesticTravellerForm,
} from "@/app/components/booking/flight/AddDomesticTravellerModal";
import AddInternationalTravellerModal, {
  InternationalTravellerForm,
} from "@/app/components/booking/flight/AddInternationalTravellerModal";
import { AUTH_UPDATED_EVENT } from "@/app/lib/booking/guestAuth";
import { getSavedProfile } from "@/app/lib/account/profileStorage";

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
};

type ValidationPayload = {
  guests: ValidationTraveller[];
  contactDetails: ContactDetails;
  gstDetails: GstDetails;
  allRequiredGuestsCompleted: boolean;
  contactValid: boolean;
  isValid: boolean;
};

type Props = {
  adultCount: number;
  childCount?: number;
  tripMode?: "domestic" | "international";
  onValidationChange?: (payload: ValidationPayload) => void;
};

type TravellerCardItem = {
  id: string;
  travellerType: "adult" | "child";
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

function getDisplayNameFromUser(user: any) {
  if (!user?.mobile) return "User";

  const sessionName = String(user?.fullName || "").trim();
  if (sessionName) return sessionName;

  const profile = getSavedProfile(user.mobile);
  const profileName = `${profile.firstName || ""} ${
    profile.lastName || ""
  }`.trim();

  if (profileName && profileName.toLowerCase() !== "pk") {
    return profileName;
  }

  return `User ${String(user.mobile).slice(-4)}`;
}

function buildTravellerShells(
  adults: number,
  children: number
): TravellerCardItem[] {
  const items: TravellerCardItem[] = [];

  for (let i = 0; i < adults; i++) {
    items.push({
      id: `adult-${i + 1}`,
      travellerType: "adult",
      label: `ADULT ${i + 1}`,
      firstName: "",
      lastName: "",
      gender: "",
    });
  }

  for (let i = 0; i < children; i++) {
    items.push({
      id: `child-${i + 1}`,
      travellerType: "child",
      label: `CHILD ${i + 1}`,
      firstName: "",
      lastName: "",
      gender: "",
    });
  }

  return items;
}

export default function HotelBookingGuestDetailSection({
  adultCount,
  childCount = 0,
  tripMode = "domestic",
  onValidationChange,
}: Props) {
  const [isOpen, setIsOpen] = useState(true);
  const [showDomesticModal, setShowDomesticModal] = useState(false);
  const [showInternationalModal, setShowInternationalModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [activeUser, setActiveUser] = useState<any>(null);

  const [travellerCards, setTravellerCards] = useState<TravellerCardItem[]>(
    buildTravellerShells(adultCount, childCount)
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
    setTravellerCards(buildTravellerShells(adultCount, childCount));
    setSavedDomesticTravellers([]);
    setSavedInternationalTravellers([]);
  }, [adultCount, childCount]);

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

  const allRequiredGuestsCompleted =
    travellerCards.length > 0 &&
    completedTravellerCount === travellerCards.length;

  const contactValid = useMemo(() => {
    const emailOk = /\S+@\S+\.\S+/.test(contactDetails.email.trim());
    const mobileOk = /^[0-9]{10}$/.test(contactDetails.mobile.trim());
    return emailOk && mobileOk;
  }, [contactDetails]);

  const isValid = allRequiredGuestsCompleted && contactValid;

  const validationGuests: ValidationTraveller[] = useMemo(() => {
    return travellerCards.map((item) => ({
      id: item.id,
      travellerType: item.travellerType,
      label: item.label,
      firstName: item.firstName,
      lastName: item.lastName,
      gender: item.gender,
    }));
  }, [travellerCards]);

  useEffect(() => {
    onValidationChange?.({
      guests: validationGuests,
      contactDetails,
      gstDetails,
      allRequiredGuestsCompleted,
      contactValid,
      isValid,
    });
  }, [
    validationGuests,
    contactDetails,
    gstDetails,
    allRequiredGuestsCompleted,
    contactValid,
    isValid,
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
      <section
        id="guest-detail"
        className="overflow-hidden rounded-xl border border-[#d9e2ec] bg-white"
      >
        <div
          className="flex min-h-[58px] cursor-pointer items-center justify-between gap-4 border-b border-[#d9e2ec] bg-[#fffdf4] px-5"
          onClick={() => setIsOpen((prev) => !prev)}
        >
          <div className="flex flex-wrap items-center gap-3">
            <span
              className={`inline-flex h-[18px] w-[18px] items-center justify-center rounded-full text-[12px] font-extrabold text-white ${
                isValid ? "bg-[#22c55e]" : "bg-[#d9534f]"
              }`}
            >
              {isValid ? "✓" : "!"}
            </span>

            <h3 className="text-[18px] font-extrabold text-[#1f2937]">
              Guest Detail
            </h3>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`text-[13px] font-bold uppercase ${
                isValid ? "text-[#15803d]" : "text-[#9a4b55]"
              }`}
            >
              {isValid ? "Details complete" : "More information needed"}
            </span>

            <span
              className={`text-[18px] font-bold text-[#55a8d8] transition ${
                isOpen ? "rotate-0" : "-rotate-90"
              }`}
            >
              ˅
            </span>
          </div>
        </div>

        {isOpen && (
          <>
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#d9e2ec] bg-[#eef8ff] px-5 py-4">
              <p className="m-0 text-[14px] font-medium text-[#4b5563]">
                {activeUser?.mobile ? (
                  <>
                    <span className="font-bold text-[#111827]">Logged in</span>{" "}
                    as {getDisplayNameFromUser(activeUser)}. Saved guest details
                    and wallet benefits can be used for faster booking.
                  </>
                ) : (
                  <>
                    <span className="font-bold text-[#111827]">Login</span> to
                    view your saved traveller list, unlock special offers and
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
                  className="whitespace-nowrap border-0 bg-transparent text-[14px] font-bold text-[#2a9fe8]"
                >
                  Login Now →
                </button>
              ) : null}
            </div>

            <div className="bg-white p-5">
              <div className="grid gap-3">
                {travellerCards.map((traveller) => {
                  const completed = isTravellerComplete(traveller);

                  return (
                    <div
                      key={traveller.id}
                      className="flex items-center justify-between gap-4 border-b border-[#e5e7eb] py-4"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div
                          className={`flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-md text-[22px] ${
                            completed
                              ? "bg-[#dcfce7] text-[#16a34a]"
                              : "bg-[#dff3ff] text-[#67b8e8]"
                          }`}
                        >
                          {completed ? "✓" : "👤"}
                        </div>

                        <div>
                          <p className="m-0 text-[12px] font-semibold text-[#9ca3af]">
                            {traveller.label}
                          </p>

                          <button
                            type="button"
                            onClick={openTravellerModal}
                            className="mt-1 border-0 bg-transparent p-0 text-left text-[16px] font-bold text-[#55b2ea]"
                          >
                            {completed
                              ? `${traveller.firstName} ${traveller.lastName}`.trim()
                              : `Add ${traveller.label}`}
                          </button>
                        </div>
                      </div>

                      <p
                        className={`m-0 shrink-0 whitespace-nowrap text-[11px] font-bold ${
                          completed ? "text-[#16a34a]" : "text-[#9ca3af]"
                        }`}
                      >
                        {completed ? "DETAILS ADDED" : "REQUIRED"}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="mt-7">
                <h3 className="m-0 text-[18px] font-extrabold text-[#111827]">
                  Booking details will be sent to
                </h3>

                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                  <Field label="Country Code">
                    <select
                      className="h-[44px] w-full rounded border border-[#d1d5db] bg-white px-3 text-[14px] text-[#111827] outline-none"
                      value={contactDetails.countryCode}
                      onChange={(e) =>
                        setContactDetails((prev) => ({
                          ...prev,
                          countryCode: e.target.value,
                        }))
                      }
                    >
                      <option value="+91">India (+91)</option>
                      <option value="+1">USA (+1)</option>
                      <option value="+44">UK (+44)</option>
                      <option value="+971">UAE (+971)</option>
                    </select>
                  </Field>

                  <Field label="Mobile No">
                    <input
                      type="text"
                      placeholder="Enter mobile number"
                      className="h-[44px] w-full rounded border border-[#d1d5db] bg-white px-3 text-[14px] text-[#111827] outline-none"
                      value={contactDetails.mobile}
                      onChange={(e) =>
                        setContactDetails((prev) => ({
                          ...prev,
                          mobile: e.target.value
                            .replace(/\D/g, "")
                            .slice(0, 10),
                        }))
                      }
                    />
                  </Field>

                  <Field label="Email">
                    <input
                      type="email"
                      placeholder="Enter email"
                      className="h-[44px] w-full rounded border border-[#d1d5db] bg-white px-3 text-[14px] text-[#111827] outline-none"
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

              <div className="mt-6">
                <label className="flex items-center gap-2 font-bold text-[#111827]">
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
                <div className="mt-5 rounded-lg border border-[#d9e2ec] bg-[#f8fbff] p-5">
                  <h3 className="m-0 text-[18px] font-extrabold text-[#111827]">
                    Your State
                  </h3>

                  <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Field label="Select State">
                      <select
                        className="h-[44px] w-full rounded border border-[#d1d5db] bg-white px-3 text-[14px] text-[#111827] outline-none"
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

                  <label className="mt-4 flex items-center gap-2 font-semibold text-[#374151]">
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
        adults={adultCount}
        children={childCount}
        infants={0}
        initialTravellers={savedDomesticTravellers}
        onSave={handleDomesticSave}
      />

      <AddInternationalTravellerModal
        isOpen={showInternationalModal}
        onClose={() => setShowInternationalModal(false)}
        adults={adultCount}
        children={childCount}
        infants={0}
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
      <label className="mb-2 block text-[13px] font-semibold text-[#6b7280]">
        {label}
      </label>
      {children}
    </div>
  );
}