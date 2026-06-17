"use client";

import type { TiyaExpertContact } from "@/app/lib/ecosystem/planner/plannerExpertLeadEngine";

type TiyaExpertRequestFormProps = {
  contact: TiyaExpertContact;
  errors?: Partial<Record<keyof TiyaExpertContact, string>>;
  onChange: (contact: TiyaExpertContact) => void;
};

const communicationModes: TiyaExpertContact["communicationMode"][] = [
  "Call",
  "WhatsApp",
  "Email",
];

export default function TiyaExpertRequestForm({
  contact,
  errors = {},
  onChange,
}: TiyaExpertRequestFormProps) {
  function updateContact(value: Partial<TiyaExpertContact>) {
    onChange({ ...contact, ...value });
  }

  return (
    <div className="min-w-0 rounded-3xl border border-white/10 bg-white/[0.08] p-3 sm:p-4">
      <div className="text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
        Expert request form
      </div>
      <div className="mt-4 grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2">
        <label className="grid min-w-0 gap-1 text-xs font-black text-white">
          Name
          <input
            value={contact.name}
            onChange={(event) => updateContact({ name: event.target.value })}
            className={`min-h-11 w-full min-w-0 rounded-2xl border bg-white/10 px-4 py-3 text-sm font-bold text-white outline-none placeholder:text-white/40 focus:border-orange-300/45 ${
              errors.name ? "border-red-300/45" : "border-white/10"
            }`}
            placeholder="Traveller name"
          />
          {errors.name ? (
            <span className="text-[11px] font-black text-red-200">
              {errors.name}
            </span>
          ) : null}
        </label>
        <label className="grid min-w-0 gap-1 text-xs font-black text-white">
          Mobile
          <input
            value={contact.mobile}
            onChange={(event) => updateContact({ mobile: event.target.value })}
            className={`min-h-11 w-full min-w-0 rounded-2xl border bg-white/10 px-4 py-3 text-sm font-bold text-white outline-none placeholder:text-white/40 focus:border-orange-300/45 ${
              errors.mobile ? "border-red-300/45" : "border-white/10"
            }`}
            placeholder="Mobile number"
          />
          {errors.mobile ? (
            <span className="text-[11px] font-black text-red-200">
              {errors.mobile}
            </span>
          ) : null}
        </label>
        <label className="grid min-w-0 gap-1 text-xs font-black text-white">
          Email
          <input
            value={contact.email}
            onChange={(event) => updateContact({ email: event.target.value })}
            className="min-h-11 w-full min-w-0 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-bold text-white outline-none placeholder:text-white/40 focus:border-orange-300/45"
            placeholder="Email address"
          />
        </label>
        <label className="grid min-w-0 gap-1 text-xs font-black text-white">
          Preferred contact time
          <input
            value={contact.preferredContactTime}
            onChange={(event) =>
              updateContact({ preferredContactTime: event.target.value })
            }
            className="min-h-11 w-full min-w-0 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-bold text-white outline-none placeholder:text-white/40 focus:border-orange-300/45"
            placeholder="Tomorrow 11 AM"
          />
        </label>
      </div>

      <div className="mt-4">
        <p className="text-xs font-black text-white">Communication mode</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {communicationModes.map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => updateContact({ communicationMode: mode })}
              className={`rounded-full border px-3 py-2 text-xs font-black transition ${
                contact.communicationMode === mode
                  ? "border-orange-300/50 bg-orange-500 text-white"
                  : "border-white/10 bg-white/10 text-white/70 hover:bg-white/15"
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
        {errors.communicationMode ? (
          <p className="mt-2 text-[11px] font-black text-red-200">
            {errors.communicationMode}
          </p>
        ) : null}
      </div>

      <label className="mt-4 grid min-w-0 gap-1 text-xs font-black text-white">
        Special request/message
        <textarea
          value={contact.specialRequest}
          onChange={(event) =>
            updateContact({ specialRequest: event.target.value })
          }
          className="min-h-[120px] w-full min-w-0 resize-none rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-bold text-white outline-none placeholder:text-white/40 focus:border-orange-300/45"
          placeholder="Any specific hotel, route, food, senior comfort or expert review requirement"
        />
      </label>
    </div>
  );
}
