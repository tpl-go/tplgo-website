"use client";

import { Input, PrimaryButton, SectionTitle } from "./PackageManageShared";

export type PackageManageTraveller = {
  id?: string;
  title?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  name?: string;
  fullName?: string;
  gender?: string;
  age?: string;
  travellerType?: string;
  type?: string;
};

type Props = {
  travellers: PackageManageTraveller[];
  onChange: (travellers: PackageManageTraveller[]) => void;
  onSave: () => void;
};

export default function PackageManageTravellerDetails({
  travellers,
  onChange,
  onSave,
}: Props) {
  return (
    <div className="space-y-5">
      <SectionTitle
        title="Traveller Details"
        subtitle="Update traveller names and basic information."
      />

      {travellers.map((traveller, index) => (
        <div
          key={traveller.id || index}
          className="rounded-[24px] border border-black/5 bg-[#f8f9fb] p-5"
        >
          <p className="text-sm font-bold text-[#111827]">
            Traveller {index + 1}
          </p>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-4">
            <Input
              label="Title"
              value={traveller.title || ""}
              onChange={(value) =>
                onChange(
                  travellers.map((item, i) =>
                    i === index ? { ...item, title: value } : item
                  )
                )
              }
            />

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
          </div>
        </div>
      ))}

      <PrimaryButton label="Save Traveller Details" onClick={onSave} />
    </div>
  );
}