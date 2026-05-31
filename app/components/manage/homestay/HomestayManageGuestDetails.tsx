"use client";

import { Input, PrimaryButton, SectionTitle } from "../hotel/HotelManageShared";

export type HomestayManageGuest = {
  id?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  gender?: string;
  age?: string;
};

type Props = {
  guests: HomestayManageGuest[];
  onChange: (guests: HomestayManageGuest[]) => void;
  onSave: () => void;
};

export default function HomestayManageGuestDetails({
  guests,
  onChange,
  onSave,
}: Props) {
  return (
    <div className="space-y-5">
      <SectionTitle
        title="Guest Details"
        subtitle="Update guest names and basic information."
      />

      {guests.map((guest, index) => (
        <div
          key={guest.id || index}
          className="min-w-0 rounded-[20px] border border-black/5 bg-[#f8f9fb] p-4 md:rounded-[24px] md:p-5"
        >
          <p className="text-sm font-bold text-[#111827]">
            Guest {index + 1}
          </p>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            <Input
              label="First Name"
              value={guest.firstName || ""}
              onChange={(value) =>
                onChange(
                  guests.map((item, i) =>
                    i === index ? { ...item, firstName: value } : item
                  )
                )
              }
            />

            <Input
              label="Last Name"
              value={guest.lastName || ""}
              onChange={(value) =>
                onChange(
                  guests.map((item, i) =>
                    i === index ? { ...item, lastName: value } : item
                  )
                )
              }
            />

            <Input
              label="Gender"
              value={guest.gender || ""}
              onChange={(value) =>
                onChange(
                  guests.map((item, i) =>
                    i === index ? { ...item, gender: value } : item
                  )
                )
              }
            />
          </div>
        </div>
      ))}

      <PrimaryButton label="Save Guest Details" onClick={onSave} />
    </div>
  );
}
