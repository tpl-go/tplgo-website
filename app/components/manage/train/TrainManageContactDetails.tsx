"use client";

import {
  Input,
  PrimaryButton,
  SectionTitle,
} from "./TrainManageShared";

export type TrainManageContact = {
  countryCode: string;
  mobile: string;
  email: string;
};

type Props = {
  contact: TrainManageContact;

  onChange: (
    value: TrainManageContact
  ) => void;

  onSave: () => void;
};

export default function TrainManageContactDetails({
  contact,
  onChange,
  onSave,
}: Props) {
  return (
    <div className="space-y-5">
      <SectionTitle
        title="Contact Details"
        subtitle="Update train booking communication details."
      />

      <div className="min-w-0 rounded-[20px] border border-black/5 bg-white p-4 shadow-[0_10px_30px_rgba(0,0,0,0.04)] md:rounded-[24px] md:p-5">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Input
            label="Country Code"
            value={
              contact.countryCode
            }
            onChange={(value) =>
              onChange({
                ...contact,
                countryCode:
                  value,
              })
            }
          />

          <Input
            label="Mobile Number"
            value={contact.mobile}
            onChange={(value) =>
              onChange({
                ...contact,
                mobile: value,
              })
            }
          />

          <Input
            label="Email Address"
            value={contact.email}
            onChange={(value) =>
              onChange({
                ...contact,
                email: value,
              })
            }
          />
        </div>
      </div>

      <PrimaryButton
        label="Save Contact Details"
        onClick={onSave}
      />
    </div>
  );
}
