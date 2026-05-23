"use client";

import { Input, PrimaryButton, SectionTitle } from "./BusManageShared";

export type BusManageTraveller = {
  id?: string;
  seatNo?: string;
  seatNumber?: string;
  name?: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  gender?: string;
  age?: string;
};

type Props = {
  travellers: BusManageTraveller[];
  onChange: (travellers: BusManageTraveller[]) => void;
  onSave: () => void;
};

export default function BusManageTravellerDetails({
  travellers,
  onChange,
  onSave,
}: Props) {
  return (
    <div className="space-y-5">
      <SectionTitle
        title="Traveller Details"
        subtitle="Update bus passenger names and basic information."
      />

      {travellers.map((traveller, index) => (
        <div
          key={traveller.id || index}
          className="rounded-[24px] border border-black/5 bg-[#f8f9fb] p-5"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-bold text-[#111827]">
              Passenger {index + 1}
            </p>

            <span className="rounded-full bg-white px-3 py-1 text-[11px] font-bold text-[#6b7280]">
              Seat: {traveller.seatNo || traveller.seatNumber || "-"}
            </span>
          </div>

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

            <Input
              label="Seat Number"
              value={traveller.seatNo || traveller.seatNumber || ""}
              onChange={(value) =>
                onChange(
                  travellers.map((item, i) =>
                    i === index
                      ? { ...item, seatNo: value, seatNumber: value }
                      : item
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