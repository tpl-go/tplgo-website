"use client";

import { Input, PrimaryButton, SectionTitle } from "./HotelManageShared";

export type HotelManageContact = {
  countryCode?: string;
  mobile?: string;
  email?: string;
};

type Props = {
  contact: HotelManageContact;
  onChange: (contact: HotelManageContact) => void;
  onSave: () => void;
};

export default function HotelManageContactDetails({
  contact,
  onChange,
  onSave,
}: Props) {
  return (
    <div className="space-y-5">
      <SectionTitle
        title="Contact Details"
        subtitle="Update mobile number and email."
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Input
          label="Mobile"
          value={contact.mobile || ""}
          onChange={(value) => onChange({ ...contact, mobile: value })}
        />

        <Input
          label="Email"
          value={contact.email || ""}
          onChange={(value) => onChange({ ...contact, email: value })}
        />
      </div>

      <PrimaryButton label="Save Contact Details" onClick={onSave} />
    </div>
  );
}