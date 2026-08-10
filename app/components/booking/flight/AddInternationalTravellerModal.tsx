"use client";

import { useEffect, useMemo, useState } from "react";

type TravellerType = "adult" | "child" | "infant";
type Gender = "male" | "female" | "";

export type InternationalTravellerForm = {
  id: string;
  travellerType: TravellerType;
  label: string;

  firstName: string;
  lastName: string;
  gender: Gender;

  countryCode: string;
  mobile: string;
  email: string;

  dateOfBirthDay: string;
  dateOfBirthMonth: string;
  dateOfBirthYear: string;

  passportNo: string;
  passportIssuingCountry: string;
  passportExpiryDay: string;
  passportExpiryMonth: string;
  passportExpiryYear: string;

  frequentFlyerAirline: string;
  frequentFlyerNo: string;

  wheelchairRequired: boolean;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  adults: number;
  children: number;
  infants: number;
  initialTravellers?: InternationalTravellerForm[];
  fieldErrors?: Record<string, string>;
  errorFocusNonce?: number;
  onSave: (travellers: InternationalTravellerForm[]) => void;
};

const COUNTRY_CODES = [
  "India (+91)",
  "UAE (+971)",
  "UK (+44)",
  "USA (+1)",
  "Singapore (+65)",
];

const COUNTRIES = [
  "India",
  "United Arab Emirates",
  "United Kingdom",
  "United States",
  "Singapore",
  "Thailand",
  "France",
  "Germany",
  "Australia",
  "Canada",
];

const AIRLINES = [
  "Air India",
  "IndiGo",
  "Vistara",
  "Emirates",
  "Etihad Airways",
  "Singapore Airlines",
  "Qatar Airways",
  "Lufthansa",
];

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function buildDefaultTravellers(
  adults: number,
  children: number,
  infants: number
): InternationalTravellerForm[] {
  const list: InternationalTravellerForm[] = [];

  for (let i = 0; i < adults; i++) {
    list.push({
      id: `adult-${i + 1}`,
      travellerType: "adult",
      label: `ADULT ${i + 1}`,
      firstName: "",
      lastName: "",
      gender: "",
      countryCode: "India (+91)",
      mobile: "",
      email: "",
      dateOfBirthDay: "",
      dateOfBirthMonth: "",
      dateOfBirthYear: "",
      passportNo: "",
      passportIssuingCountry: "",
      passportExpiryDay: "",
      passportExpiryMonth: "",
      passportExpiryYear: "",
      frequentFlyerAirline: "",
      frequentFlyerNo: "",
      wheelchairRequired: false,
    });
  }

  for (let i = 0; i < children; i++) {
    list.push({
      id: `child-${i + 1}`,
      travellerType: "child",
      label: `CHILD ${i + 1}`,
      firstName: "",
      lastName: "",
      gender: "",
      countryCode: "India (+91)",
      mobile: "",
      email: "",
      dateOfBirthDay: "",
      dateOfBirthMonth: "",
      dateOfBirthYear: "",
      passportNo: "",
      passportIssuingCountry: "",
      passportExpiryDay: "",
      passportExpiryMonth: "",
      passportExpiryYear: "",
      frequentFlyerAirline: "",
      frequentFlyerNo: "",
      wheelchairRequired: false,
    });
  }

  for (let i = 0; i < infants; i++) {
    list.push({
      id: `infant-${i + 1}`,
      travellerType: "infant",
      label: `INFANT ${i + 1}`,
      firstName: "",
      lastName: "",
      gender: "",
      countryCode: "India (+91)",
      mobile: "",
      email: "",
      dateOfBirthDay: "",
      dateOfBirthMonth: "",
      dateOfBirthYear: "",
      passportNo: "",
      passportIssuingCountry: "",
      passportExpiryDay: "",
      passportExpiryMonth: "",
      passportExpiryYear: "",
      frequentFlyerAirline: "",
      frequentFlyerNo: "",
      wheelchairRequired: false,
    });
  }

  return list;
}

function isRequiredDobFilled(item: InternationalTravellerForm) {
  return Boolean(
    item.dateOfBirthDay && item.dateOfBirthMonth && item.dateOfBirthYear
  );
}

function isRequiredPassportFilled(item: InternationalTravellerForm) {
  return Boolean(
    item.passportNo.trim() &&
      item.passportIssuingCountry.trim() &&
      item.passportExpiryDay &&
      item.passportExpiryMonth &&
      item.passportExpiryYear
  );
}

function isAdultComplete(item: InternationalTravellerForm) {
  return Boolean(
    item.firstName.trim() &&
      item.lastName.trim() &&
      item.gender &&
      item.countryCode.trim() &&
      item.mobile.trim().length >= 8 &&
      isRequiredDobFilled(item) &&
      isRequiredPassportFilled(item)
  );
}

function isChildComplete(item: InternationalTravellerForm) {
  return Boolean(
    item.firstName.trim() &&
      item.lastName.trim() &&
      item.gender &&
      isRequiredDobFilled(item) &&
      isRequiredPassportFilled(item)
  );
}

function isInfantComplete(item: InternationalTravellerForm) {
  return Boolean(
    item.firstName.trim() &&
      item.lastName.trim() &&
      item.gender &&
      isRequiredDobFilled(item) &&
      isRequiredPassportFilled(item)
  );
}

function isTravellerComplete(item: InternationalTravellerForm) {
  if (item.travellerType === "adult") return isAdultComplete(item);
  if (item.travellerType === "child") return isChildComplete(item);
  return isInfantComplete(item);
}

export default function AddInternationalTravellerModal({
  isOpen,
  onClose,
  adults,
  children,
  infants,
  initialTravellers,
  fieldErrors = {},
  errorFocusNonce = 0,
  onSave,
}: Props) {
  const [travellers, setTravellers] = useState<InternationalTravellerForm[]>(
    initialTravellers?.length
      ? initialTravellers
      : buildDefaultTravellers(adults, children, infants)
  );

  useEffect(() => {
    if (isOpen) {
      queueMicrotask(() => {
        setTravellers(
          initialTravellers?.length
            ? initialTravellers
            : buildDefaultTravellers(adults, children, infants)
        );
      });
    }
  }, [isOpen, adults, children, infants, initialTravellers]);

  useEffect(() => {
    if (!isOpen || !errorFocusNonce) return;
    queueMicrotask(() => {
      const firstErrorKey = Object.keys(fieldErrors)[0];
      const target = firstErrorKey
        ? document.querySelector<HTMLElement>(`[data-flight-field-error-key="${firstErrorKey}"]`)
        : null;
      target?.scrollIntoView({ block: "center", behavior: "smooth" });
      target?.focus();
    });
  }, [isOpen, errorFocusNonce, fieldErrors]);

  const completedCount = useMemo(() => {
    return travellers.filter(isTravellerComplete).length;
  }, [travellers]);

  const allCompleted =
    travellers.length > 0 && completedCount === travellers.length;

  const updateTraveller = (
    id: string,
    key: keyof InternationalTravellerForm,
    value: string | boolean
  ) => {
    setTravellers((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, [key]: value } : item
      )
    );
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="max-md:!items-stretch max-md:!overflow-hidden max-md:!p-3"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        zIndex: 1200,
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        padding: "32px 18px",
        overflowY: "auto",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-md:flex max-md:!max-h-[94vh] max-md:flex-col max-md:overflow-hidden max-md:rounded-xl"
        style={{
          width: "1160px",
          maxWidth: "100%",
          background: "#ffffff",
          borderRadius: "12px",
          overflow: "hidden",
          boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
        }}
      >
        <div
          className="max-md:sticky max-md:top-0 max-md:z-10 max-md:shrink-0 max-md:bg-white max-md:px-4 max-md:py-3"
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid #e5e7eb",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div
              className="max-md:text-[19px]"
              style={{
                fontSize: "24px",
                fontWeight: 800,
                color: "#111827",
              }}
            >
              International Travellers
            </div>
            <div
              style={{
                marginTop: "4px",
                fontSize: "14px",
                color: "#4b5563",
              }}
            >
              {completedCount}/{travellers.length} added
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              border: "none",
              background: "transparent",
              fontSize: "32px",
              lineHeight: 1,
              cursor: "pointer",
              color: "#111827",
            }}
          >
            ×
          </button>
        </div>

        <div className="max-md:min-h-0 max-md:flex-1 max-md:overflow-y-auto max-md:p-4 max-md:pb-5" style={{ padding: "18px 20px 22px 20px" }}>
          <div
            style={{
              background: "#f7d7cf",
              color: "#111827",
              fontSize: "13px",
              fontWeight: 700,
              padding: "12px 14px",
              borderRadius: "8px",
              marginBottom: "16px",
            }}
          >
            Important: Enter name as mentioned on your passport or Government approved IDs.
          </div>

          <div style={{ display: "grid", gap: "14px" }}>
            {travellers.map((item) => {
              const completed = isTravellerComplete(item);

              return (
                <div
                  key={item.id}
                  style={{
                    border: "1px solid #d9e2ec",
                    borderRadius: "10px",
                    overflow: "hidden",
                    background: "#ffffff",
                  }}
                >
                  <div
                    className="max-md:flex-col max-md:items-start max-md:gap-1"
                    style={{
                      padding: "12px 14px",
                      borderBottom: "1px solid #e5e7eb",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      background: completed ? "#f8fffb" : "#ffffff",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "18px",
                        fontWeight: 800,
                        color: "#111827",
                      }}
                    >
                      {item.label}
                    </div>

                    <div
                      style={{
                        fontSize: "14px",
                        fontWeight: 700,
                        color: completed ? "#15803d" : "#6b7280",
                      }}
                    >
                      {completed ? "Added" : "Required"}
                    </div>
                  </div>

                  <div style={{ padding: "16px 14px 18px 14px" }}>
                    {/* row 1 */}
                    <div
                      className="max-md:!grid-cols-1"
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr 280px",
                        gap: "12px",
                      }}
                    >
                      <input
                        value={item.firstName}
                        onChange={(e) =>
                          updateTraveller(item.id, "firstName", e.target.value)
                        }
                        placeholder="First & Middle Name"
                        style={inputStyle}
                      />

                      <input
                        value={item.lastName}
                        onChange={(e) =>
                          updateTraveller(item.id, "lastName", e.target.value)
                        }
                        placeholder="Last Name"
                        style={inputStyle}
                      />

                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          border: "1px solid #d9e2ec",
                          borderRadius: "8px",
                          overflow: "hidden",
                          height: "48px",
                        }}
                      >
                        <button
                          type="button"
                          onClick={() =>
                            updateTraveller(item.id, "gender", "male")
                          }
                          style={genderBtnStyle(item.gender === "male")}
                        >
                          MALE
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            updateTraveller(item.id, "gender", "female")
                          }
                          style={genderBtnStyle(item.gender === "female")}
                        >
                          FEMALE
                        </button>
                      </div>
                    </div>

                    {/* row 2 */}
                    <div
                      className="max-md:!grid-cols-1"
                      style={{
                        marginTop: "14px",
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr 1fr",
                        gap: "12px",
                      }}
                    >
                      <div>
                        <div style={labelStyle}>Country Code</div>
                        <select
                          value={item.countryCode}
                          onChange={(e) =>
                            updateTraveller(item.id, "countryCode", e.target.value)
                          }
                          style={inputStyle}
                        >
                          {COUNTRY_CODES.map((code) => (
                            <option key={code} value={code}>
                              {code}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <div style={labelStyle}>
                          Mobile No
                          {item.travellerType !== "adult" ? " (Optional)" : ""}
                        </div>
                        <input
                          value={item.mobile}
                          onChange={(e) =>
                            updateTraveller(item.id, "mobile", e.target.value)
                          }
                          placeholder={
                            item.travellerType === "adult"
                              ? "Mobile No"
                              : "Mobile No (Optional)"
                          }
                          style={inputStyle}
                        />
                      </div>

                      <div>
                        <div style={labelStyle}>Email (Optional)</div>
                        <input
                          value={item.email}
                          onChange={(e) =>
                            updateTraveller(item.id, "email", e.target.value)
                          }
                          placeholder="Email (Optional)"
                          style={inputStyle}
                        />
                      </div>
                    </div>

                    {/* row 3 */}
                    <div
                      className="max-md:!grid-cols-1"
                      style={{
                        marginTop: "14px",
                        display: "grid",
                        gridTemplateColumns: "340px 1fr 340px",
                        gap: "12px",
                        alignItems: "start",
                      }}
                    >
                      <div>
                        <div style={labelStyle}>Date of Birth</div>
                        <div
                          className="max-md:!grid-cols-3"
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr 1fr",
                            gap: "8px",
                          }}
                        >
                          <select
                            data-flight-field-error-key={`travellers.${travellers.indexOf(item)}.dateOfBirth`}
                            aria-invalid={Boolean(fieldErrors[`travellers.${travellers.indexOf(item)}.dateOfBirth`])}
                            value={item.dateOfBirthDay}
                            onChange={(e) =>
                              updateTraveller(
                                item.id,
                                "dateOfBirthDay",
                                e.target.value
                              )
                            }
                            style={inputStyle}
                          >
                            <option value="">Date</option>
                            {Array.from({ length: 31 }, (_, i) => i + 1).map(
                              (day) => (
                                <option key={day} value={String(day)}>
                                  {day}
                                </option>
                              )
                            )}
                          </select>

                          <select
                            value={item.dateOfBirthMonth}
                            onChange={(e) =>
                              updateTraveller(
                                item.id,
                                "dateOfBirthMonth",
                                e.target.value
                              )
                            }
                            style={inputStyle}
                          >
                            <option value="">Month</option>
                            {MONTHS.map((month) => (
                              <option key={month} value={month}>
                                {month}
                              </option>
                            ))}
                          </select>

                          <select
                            value={item.dateOfBirthYear}
                            onChange={(e) =>
                              updateTraveller(
                                item.id,
                                "dateOfBirthYear",
                                e.target.value
                              )
                            }
                            style={inputStyle}
                          >
                            <option value="">Year</option>
                            {Array.from({ length: 100 }, (_, i) => 2026 - i).map(
                              (year) => (
                                <option key={year} value={String(year)}>
                                  {year}
                                </option>
                              )
                            )}
                          </select>
                        </div>
                        {fieldErrors[`travellers.${travellers.indexOf(item)}.dateOfBirth`] ? (
                          <p style={errorTextStyle}>{fieldErrors[`travellers.${travellers.indexOf(item)}.dateOfBirth`]}</p>
                        ) : null}
                      </div>

                      <div>
                        <div style={labelStyle}>Passport No</div>
                        <input
                          data-flight-field-error-key={`travellers.${travellers.indexOf(item)}.passportNumber`}
                          aria-invalid={Boolean(fieldErrors[`travellers.${travellers.indexOf(item)}.passportNumber`])}
                          value={item.passportNo}
                          onChange={(e) =>
                            updateTraveller(item.id, "passportNo", e.target.value)
                          }
                          placeholder="Passport No"
                          style={inputStyle}
                        />
                        {fieldErrors[`travellers.${travellers.indexOf(item)}.passportNumber`] ? (
                          <p style={errorTextStyle}>{fieldErrors[`travellers.${travellers.indexOf(item)}.passportNumber`]}</p>
                        ) : null}
                      </div>

                      <div>
                        <div style={labelStyle}>Passport Issuing Country</div>
                        <select
                          data-flight-field-error-key={`travellers.${travellers.indexOf(item)}.passportIssuingCountry`}
                          aria-invalid={Boolean(fieldErrors[`travellers.${travellers.indexOf(item)}.passportIssuingCountry`] || fieldErrors[`travellers.${travellers.indexOf(item)}.nationality`])}
                          value={item.passportIssuingCountry}
                          onChange={(e) =>
                            updateTraveller(
                              item.id,
                              "passportIssuingCountry",
                              e.target.value
                            )
                          }
                          style={inputStyle}
                        >
                          <option value="">Passport Issuing Country</option>
                          {COUNTRIES.map((country) => (
                            <option key={country} value={country}>
                              {country}
                            </option>
                          ))}
                        </select>
                        {(fieldErrors[`travellers.${travellers.indexOf(item)}.passportIssuingCountry`] || fieldErrors[`travellers.${travellers.indexOf(item)}.nationality`]) ? (
                          <p style={errorTextStyle}>{fieldErrors[`travellers.${travellers.indexOf(item)}.passportIssuingCountry`] || fieldErrors[`travellers.${travellers.indexOf(item)}.nationality`]}</p>
                        ) : null}
                      </div>
                    </div>

                    {/* row 4 */}
                    <div
                      className="max-md:!grid-cols-1"
                      style={{
                        marginTop: "14px",
                        display: "grid",
                        gridTemplateColumns: "340px 1fr",
                        gap: "12px",
                        alignItems: "start",
                      }}
                    >
                      <div>
                        <div style={labelStyle}>Passport Expiry</div>
                        <div
                          className="max-md:!grid-cols-3"
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr 1fr",
                            gap: "8px",
                          }}
                        >
                          <select
                            data-flight-field-error-key={`travellers.${travellers.indexOf(item)}.passportExpiryDate`}
                            aria-invalid={Boolean(fieldErrors[`travellers.${travellers.indexOf(item)}.passportExpiryDate`])}
                            value={item.passportExpiryDay}
                            onChange={(e) =>
                              updateTraveller(
                                item.id,
                                "passportExpiryDay",
                                e.target.value
                              )
                            }
                            style={inputStyle}
                          >
                            <option value="">Date</option>
                            {Array.from({ length: 31 }, (_, i) => i + 1).map(
                              (day) => (
                                <option key={day} value={String(day)}>
                                  {day}
                                </option>
                              )
                            )}
                          </select>

                          <select
                            value={item.passportExpiryMonth}
                            onChange={(e) =>
                              updateTraveller(
                                item.id,
                                "passportExpiryMonth",
                                e.target.value
                              )
                            }
                            style={inputStyle}
                          >
                            <option value="">Month</option>
                            {MONTHS.map((month) => (
                              <option key={month} value={month}>
                                {month}
                              </option>
                            ))}
                          </select>

                          <select
                            value={item.passportExpiryYear}
                            onChange={(e) =>
                              updateTraveller(
                                item.id,
                                "passportExpiryYear",
                                e.target.value
                              )
                            }
                            style={inputStyle}
                          >
                            <option value="">Year</option>
                            {Array.from({ length: 30 }, (_, i) => 2026 + i).map(
                              (year) => (
                                <option key={year} value={String(year)}>
                                  {year}
                                </option>
                              )
                            )}
                          </select>
                        </div>
                        {fieldErrors[`travellers.${travellers.indexOf(item)}.passportExpiryDate`] ? (
                          <p style={errorTextStyle}>{fieldErrors[`travellers.${travellers.indexOf(item)}.passportExpiryDate`]}</p>
                        ) : null}
                      </div>

                      <div>
                        <label
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "10px",
                            fontSize: "14px",
                            fontWeight: 600,
                            color: "#111827",
                            cursor: "pointer",
                            marginTop: "34px",
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={item.wheelchairRequired}
                            onChange={(e) =>
                              updateTraveller(
                                item.id,
                                "wheelchairRequired",
                                e.target.checked
                              )
                            }
                          />
                          I require wheelchair <span style={{ color: "#6b7280" }}>(Optional)</span>
                        </label>
                      </div>
                    </div>

                    {/* row 5 */}
                    <div style={{ marginTop: "14px" }}>
                      <div
                        style={{
                          fontSize: "14px",
                          fontWeight: 700,
                          color: "#111827",
                          marginBottom: "8px",
                        }}
                      >
                        Frequent Flyer Number
                        <span style={{ color: "#6b7280", fontWeight: 500 }}>
                          {" "} (Avail extra benefits & earn points)
                        </span>
                      </div>

                      <div
                        className="max-md:!grid-cols-1"
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: "12px",
                        }}
                      >
                        <div>
                          <div style={labelStyle}>Frequent Flyer Airline</div>
                          <select
                            value={item.frequentFlyerAirline}
                            onChange={(e) =>
                              updateTraveller(
                                item.id,
                                "frequentFlyerAirline",
                                e.target.value
                              )
                            }
                            style={inputStyle}
                          >
                            <option value="">Frequent Flyer Airline</option>
                            {AIRLINES.map((airline) => (
                              <option key={airline} value={airline}>
                                {airline}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <div style={labelStyle}>Frequent Flyer No</div>
                          <input
                            value={item.frequentFlyerNo}
                            onChange={(e) =>
                              updateTraveller(
                                item.id,
                                "frequentFlyerNo",
                                e.target.value
                              )
                            }
                            placeholder="Frequent Flyer No"
                            style={inputStyle}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        <div
          className="max-md:shrink-0 max-md:flex-col max-md:border-t max-md:border-[#e5e7eb] max-md:bg-white max-md:px-4 max-md:py-3"
          style={{
            padding: "0 20px 20px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: "12px",
          }}
        >
          <button
            type="button"
            onClick={onClose}
            className="max-md:w-full"
            style={{
              height: "46px",
              padding: "0 18px",
              borderRadius: "8px",
              border: "1px solid #d1d5db",
              background: "#ffffff",
              fontSize: "14px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={!allCompleted}
            onClick={() => onSave(travellers)}
            className="max-md:w-full"
            style={{
              height: "46px",
              padding: "0 22px",
              borderRadius: "8px",
              border: "none",
              background: allCompleted ? "#0ea5e9" : "#cbd5e1",
              color: allCompleted ? "#ffffff" : "#64748b",
              fontSize: "14px",
              fontWeight: 800,
              cursor: allCompleted ? "pointer" : "not-allowed",
            }}
          >
            Save Travellers
          </button>
        </div>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  height: "48px",
  border: "1px solid #d9e2ec",
  borderRadius: "8px",
  padding: "0 14px",
  fontSize: "15px",
  color: "#111827",
  outline: "none",
  background: "#ffffff",
};

const errorTextStyle: React.CSSProperties = {
  margin: "6px 0 0 0",
  color: "#b91c1c",
  fontSize: "12px",
  fontWeight: 700,
};

const labelStyle: React.CSSProperties = {
  marginBottom: "8px",
  fontSize: "14px",
  fontWeight: 600,
  color: "#111827",
};

function genderBtnStyle(active: boolean): React.CSSProperties {
  return {
    border: "none",
    background: active ? "#dbeafe" : "#ffffff",
    color: "#111827",
    fontSize: "16px",
    fontWeight: 800,
    cursor: "pointer",
  };
}
