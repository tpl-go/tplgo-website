"use client";

import { Input, PrimaryButton, SectionTitle } from "../hotel/HotelManageShared";

export type HomestayManageContact = {
  countryCode?: string;
  mobile?: string;
  email?: string;
};

type Props = {
  contact: HomestayManageContact;
  onChange: (contact: HomestayManageContact) => void;
  onSave: () => void;
};

export default function HomestayManageContactDetails({
  contact,
  onChange,
  onSave,
}: Props) {
  return (
    <div className="space-y-5">
      <SectionTitle
        title="Contact Details"
        subtitle="Update email and mobile number for this booking."
      />

      <div className="min-w-0 rounded-[20px] border border-black/5 bg-[#f8f9fb] p-4 md:rounded-[24px] md:p-5">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            label="Mobile Number"
            value={contact.mobile || ""}
            onChange={(value) =>
              onChange({
                ...contact,
                mobile: value,
              })
            }
          />

          <Input
            label="Email Address"
            value={contact.email || ""}
            onChange={(value) =>
              onChange({
                ...contact,
                email: value,
              })
            }
          />
        </div>
      </div>

      <PrimaryButton label="Save Contact Details" onClick={onSave} />
    </div>
  );
}
