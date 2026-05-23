"use client";

import {
  Input,
  PrimaryButton,
  SectionTitle,
} from "./CruiseManageShared";

export type CruiseManageTraveller = {
  id?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  gender?: string;
  age?: string;
  passportNumber?: string;
};

type Props = {
  travellers: CruiseManageTraveller[];
  onChange: (travellers: CruiseManageTraveller[]) => void;
  onSave: () => void;
};

export default function CruiseManageTravellerDetails({
  travellers,
  onChange,
  onSave,
}: Props) {
  return (
    <div className="space-y-5">
      <SectionTitle
        title="Traveller Details"
        subtitle="Update cruise traveller information."
      />

      {travellers.map((traveller, index) => (
        <div
          key={traveller.id || index}
          className="rounded-[24px] border border-black/5 bg-[#f8f9fb] p-5"
        >
          <p className="text-sm font-bold text-[#111827]">
            Traveller {index + 1}
          </p>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Input
              label="First Name"
              value={traveller.firstName || ""}
              onChange={(value) =>
                onChange(
                  travellers.map((item, i) =>
                    i === index
                      ? {
                          ...item,
                          firstName: value,
                        }
                      : item
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
                    i === index
                      ? {
                          ...item,
                          lastName: value,
                        }
                      : item
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
                    i === index
                      ? {
                          ...item,
                          gender: value,
                        }
                      : item
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
                    i === index
                      ? {
                          ...item,
                          age: value,
                        }
                      : item
                  )
                )
              }
            />
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input
              label="Passport Number"
              value={traveller.passportNumber || ""}
              onChange={(value) =>
                onChange(
                  travellers.map((item, i) =>
                    i === index
                      ? {
                          ...item,
                          passportNumber: value,
                        }
                      : item
                  )
                )
              }
            />
          </div>
        </div>
      ))}

      <PrimaryButton
        label="Save Traveller Details"
        onClick={onSave}
      />
    </div>
  );
}