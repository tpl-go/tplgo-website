"use client";

import { Input, PrimaryButton, SectionTitle } from "./CabManageShared";

export type CabManageTraveller = {
  id?: string;
  name?: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  gender?: string;
  age?: string;
};

type Props = {
  travellers: CabManageTraveller[];
  onChange: (travellers: CabManageTraveller[]) => void;
  onSave: () => void;
};

export default function CabManageTravellerDetails({
  travellers,
  onChange,
  onSave,
}: Props) {
  return (
    <div className="space-y-5">
      <SectionTitle
        title="Traveller Details"
        subtitle="Update cab traveller names and basic information."
      />

      {travellers.map((traveller, index) => (
        <div
          key={traveller.id || index}
          className="rounded-[24px] border border-black/5 bg-[#f8f9fb] p-5"
        >
          <p className="text-sm font-bold text-[#111827]">
            Traveller {index + 1}
          </p>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            <Input
              label="First Name"
              value={traveller.firstName || ""}
              onChange={(value) =>
                onChange(
                  travellers.map((item, i) =>
                    i === index ? { ...item, firstName: value } : item
                  )
                )
              }
            />

            <Input
              label="Last Name"
              value={traveller.lastName || ""}
              onChange={(value) =>
                onChange(
                  travellers.map((item, i) =>
                    i === index ? { ...item, lastName: value } : item
                  )
                )
              }
            />

            <Input
              label="Gender"
              value={traveller.gender || ""}
              onChange={(value) =>
                onChange(
                  travellers.map((item, i) =>
                    i === index ? { ...item, gender: value } : item
                  )
                )
              }
            />

            <Input
              label="Age"
              value={traveller.age || ""}
              onChange={(value) =>
                onChange(
                  travellers.map((item, i) =>
                    i === index ? { ...item, age: value } : item
                  )
                )
              }
            />
          </div>
        </div>
      ))}

      <PrimaryButton label="Save Traveller Details" onClick={onSave} />
    </div>
  );
}