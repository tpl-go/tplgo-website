import assert from "node:assert/strict";

const monthMap = {
  jan: "1",
  feb: "2",
  mar: "3",
  apr: "4",
  may: "5",
  jun: "6",
  jul: "7",
  aug: "8",
  sep: "9",
  oct: "10",
  nov: "11",
  dec: "12",
};

function buildIsoDate(year, month, day) {
  const cleanYear = String(year || "").trim();
  const rawMonth = String(month || "").trim();
  const cleanMonth = (monthMap[rawMonth.toLowerCase()] || rawMonth).padStart(2, "0");
  const cleanDay = String(day || "").trim().padStart(2, "0");
  if (!/^\d{4}$/.test(cleanYear) || !/^\d{2}$/.test(cleanMonth) || !/^\d{2}$/.test(cleanDay)) return "";
  return `${cleanYear}-${cleanMonth}-${cleanDay}`;
}

function mapTraveller(card, international) {
  const dateOfBirth = card.dateOfBirth || buildIsoDate(international?.dateOfBirthYear, international?.dateOfBirthMonth, international?.dateOfBirthDay);
  const passportExpiryDate = card.passportExpiryDate || buildIsoDate(international?.passportExpiryYear, international?.passportExpiryMonth, international?.passportExpiryDay);
  return {
    id: card.id,
    travellerType: card.travellerType,
    firstName: card.firstName,
    lastName: card.lastName,
    gender: card.gender,
    ...(dateOfBirth ? { dateOfBirth } : {}),
    ...(card.passportNumber || international?.passportNo ? { passportNumber: card.passportNumber || international.passportNo } : {}),
    ...(card.passportIssuingCountry || international?.passportIssuingCountry ? { passportIssuingCountry: card.passportIssuingCountry || international.passportIssuingCountry } : {}),
    ...(passportExpiryDate ? { passportExpiryDate } : {}),
    ...(card.nationality || international?.passportIssuingCountry ? { nationality: card.nationality || international.passportIssuingCountry } : {}),
  };
}

const modalTraveller = {
  id: "adult-1",
  travellerType: "adult",
  firstName: "Test",
  lastName: "Traveller",
  gender: "male",
  dateOfBirthDay: "15",
  dateOfBirthMonth: "Jan",
  dateOfBirthYear: "1990",
  passportNo: "T1234567",
  passportIssuingCountry: "India",
  passportExpiryDay: "20",
  passportExpiryMonth: "Feb",
  passportExpiryYear: "2035",
};

const staleModalState = undefined;
const canonicalCard = {
  id: "adult-1",
  travellerType: "adult",
  firstName: "Test",
  lastName: "Traveller",
  gender: "male",
  dateOfBirth: buildIsoDate(modalTraveller.dateOfBirthYear, modalTraveller.dateOfBirthMonth, modalTraveller.dateOfBirthDay),
  passportNumber: modalTraveller.passportNo,
  passportIssuingCountry: modalTraveller.passportIssuingCountry,
  passportExpiryDate: buildIsoDate(modalTraveller.passportExpiryYear, modalTraveller.passportExpiryMonth, modalTraveller.passportExpiryDay),
  nationality: modalTraveller.passportIssuingCountry,
};

assert.equal(buildIsoDate("1990", "Jan", "15"), "1990-01-15");
assert.equal(buildIsoDate("2035", "02", "20"), "2035-02-20");

const payloadFromCanonicalCard = mapTraveller(canonicalCard, staleModalState);
assert.equal(payloadFromCanonicalCard.dateOfBirth, "1990-01-15");
assert.equal(payloadFromCanonicalCard.passportNumber, "T1234567");
assert.equal(payloadFromCanonicalCard.passportIssuingCountry, "India");
assert.equal(payloadFromCanonicalCard.passportExpiryDate, "2035-02-20");
assert.equal(payloadFromCanonicalCard.nationality, "India");

const payloadFromModalFallback = mapTraveller({
  id: "adult-1",
  travellerType: "adult",
  firstName: "Test",
  lastName: "Traveller",
  gender: "male",
}, modalTraveller);
assert.equal(payloadFromModalFallback.dateOfBirth, "1990-01-15");
assert.equal(payloadFromModalFallback.passportNumber, "T1234567");
assert.equal(payloadFromModalFallback.passportIssuingCountry, "India");
assert.equal(payloadFromModalFallback.passportExpiryDate, "2035-02-20");
assert.equal(payloadFromModalFallback.nationality, "India");

console.log("D26M.4 international traveller payload regression PASS");
