import type { ProfileFormData, CoTravellerEntry } from "./profileStorage";
export type BasicRecord = {
  id: string; userId: string; version: number; updatedAt: string;
  firstName: string | null; lastName: string | null; gender: string | null;
  dateOfBirth: string | null; email: string | null; mobile: string | null;
  address?: { countryCode?: string | null; region?: string | null; city?: string | null };
  preferences?: PersonalFields; metadata?: PersonalFields;
};
type PersonalFields = { personal?: Record<string, string | null>; frequentFlyers?: { airline: string; flyerNumber: string }[] };
export type TravellerForm = Omit<CoTravellerEntry, "id"> & { id: string; version: number };
export function profileForm(row: BasicRecord | null): ProfileFormData {
  const p = row?.preferences?.personal ?? {};
  return { firstName: row?.firstName ?? "", lastName: row?.lastName ?? "", gender: row?.gender ?? "", dob: row?.dateOfBirth ?? "",
    email: row?.email ?? "", mobile: row?.mobile ?? "", nationality: p.nationality ?? "", maritalStatus: p.maritalStatus ?? "", anniversary: p.anniversary ?? "",
    country: row?.address?.countryCode ?? "", state: row?.address?.region ?? "", city: row?.address?.city ?? "",
    passportNo: "", passportExpiry: "", issuingCountry: "", panCard: "", photo: null, coTravellers: [],
    frequentFlyers: (row?.preferences?.frequentFlyers?.length ? row.preferences.frequentFlyers : [{ airline: "", flyerNumber: "" }]).map((f, id) => ({ ...f, id })) };
}
export function travellerForm(row?: BasicRecord): TravellerForm {
  const p = row?.metadata?.personal ?? {};
  return { id: row?.id ?? "", version: row?.version ?? 0, firstName: row?.firstName ?? "", lastName: row?.lastName ?? "", gender: row?.gender ?? "", dob: row?.dateOfBirth ?? "",
    email: row?.email ?? "", mobile: row?.mobile ?? "", nationality: p.nationality ?? "", relation: p.relation ?? "",
    passportNo: "", passportExpiry: "", issuingCountry: "", panCard: "",
    frequentFlyers: (row?.metadata?.frequentFlyers?.length ? row.metadata.frequentFlyers : [{ airline: "", flyerNumber: "" }]).map((f, id) => ({ ...f, id })) };
}
export function basicFields(form: ProfileFormData | TravellerForm) {
  return { firstName: form.firstName, lastName: form.lastName, gender: form.gender || null, dateOfBirth: form.dob || null,
    email: form.email || null, mobile: form.mobile || null };
}
export function profileInput(form: ProfileFormData, expectedVersion: number) {
  return { ...basicFields(form), expectedVersion, address: { countryCode: form.country || null, region: form.state || null, city: form.city || null },
    preferences: { personal: { nationality: form.nationality || null, maritalStatus: form.maritalStatus || null, anniversary: form.anniversary || null }, frequentFlyers: flyers(form.frequentFlyers) } };
}
export function travellerInput(form: TravellerForm) {
  return { ...basicFields(form), ...(form.id ? { expectedVersion: form.version } : {}), metadata: { personal: { nationality: form.nationality || null, relation: form.relation || null }, frequentFlyers: flyers(form.frequentFlyers) } };
}
function flyers(rows: { airline: string; flyerNumber: string }[]) {
  return rows.filter(f => f.airline.trim() || f.flyerNumber.trim()).map(({ airline, flyerNumber }) => ({ airline, flyerNumber }));
}
