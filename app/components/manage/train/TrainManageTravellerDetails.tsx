"use client";

import {
  Input,
  PrimaryButton,
  SectionTitle,
} from "./TrainManageShared";

export type TrainManageTraveller = {
  id?: string;

  firstName?: string;
  lastName?: string;

  name?: string;

  gender?: string;
  age?: string;

  berthPreference?: string;

  mealPreference?: string;

  passportNumber?: string;
};

type Props = {
  travellers: TrainManageTraveller[];

  onChange: (
    travellers: TrainManageTraveller[]
  ) => void;

  onSave: () => void;
};

export default function TrainManageTravellerDetails({
  travellers,
  onChange,
  onSave,
}: Props) {
  return (
    <div className="space-y-5">
      <SectionTitle
        title="Traveller Details"
        subtitle="Update passenger information and travel preferences."
      />

      {travellers.map(
        (traveller, index) => (
          <div
            key={
              traveller.id || index
            }
            className="min-w-0 rounded-[20px] border border-black/5 bg-white p-4 shadow-[0_10px_30px_rgba(0,0,0,0.04)] md:rounded-[24px] md:p-5"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#ff6b00]">
                  Traveller
                </p>

                <h3 className="mt-1 break-words text-lg font-black text-[#111827]">
                  Passenger{" "}
                  {index + 1}
                </h3>
              </div>

              <div className="shrink-0 rounded-full bg-[#fff4ec] px-4 py-2 text-[11px] font-black uppercase tracking-[0.12em] text-[#ff6b00]">
                Editable
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              <Input
                label="First Name"
                value={
                  traveller.firstName ||
                  ""
                }
                onChange={(
                  value
                ) =>
                  onChange(
                    travellers.map(
                      (
                        item,
                        i
                      ) =>
                        i === index
                          ? {
                              ...item,
                              firstName:
                                value,
                            }
                          : item
                    )
                  )
                }
              />

              <Input
                label="Last Name"
                value={
                  traveller.lastName ||
                  ""
                }
                onChange={(
                  value
                ) =>
                  onChange(
                    travellers.map(
                      (
                        item,
                        i
                      ) =>
                        i === index
                          ? {
                              ...item,
                              lastName:
                                value,
                            }
                          : item
                    )
                  )
                }
              />

              <Input
                label="Gender"
                value={
                  traveller.gender ||
                  ""
                }
                onChange={(
                  value
                ) =>
                  onChange(
                    travellers.map(
                      (
                        item,
                        i
                      ) =>
                        i === index
                          ? {
                              ...item,
                              gender:
                                value,
                            }
                          : item
                    )
                  )
                }
              />

              <Input
                label="Age"
                value={
                  traveller.age || ""
                }
                onChange={(
                  value
                ) =>
                  onChange(
                    travellers.map(
                      (
                        item,
                        i
                      ) =>
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

              <Input
                label="Berth Preference"
                value={
                  traveller.berthPreference ||
                  ""
                }
                onChange={(
                  value
                ) =>
                  onChange(
                    travellers.map(
                      (
                        item,
                        i
                      ) =>
                        i === index
                          ? {
                              ...item,
                              berthPreference:
                                value,
                            }
                          : item
                    )
                  )
                }
              />

              <Input
                label="Meal Preference"
                value={
                  traveller.mealPreference ||
                  ""
                }
                onChange={(
                  value
                ) =>
                  onChange(
                    travellers.map(
                      (
                        item,
                        i
                      ) =>
                        i === index
                          ? {
                              ...item,
                              mealPreference:
                                value,
                            }
                          : item
                    )
                  )
                }
              />
            </div>
          </div>
        )
      )}

      <PrimaryButton
        label="Save Traveller Details"
        onClick={onSave}
      />
    </div>
  );
}
