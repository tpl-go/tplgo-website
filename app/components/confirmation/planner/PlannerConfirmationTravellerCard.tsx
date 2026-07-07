"use client";

type RecordValue = Record<string, unknown>;

type Props = {
  contactDetails?: RecordValue;
  leadTraveller?: RecordValue;
  travellers?: RecordValue[];
};

function text(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : "";
}

function travellerName(traveller: RecordValue, fallback: string) {
  return (
    text(traveller.fullName) ||
    text(traveller.name) ||
    [traveller.firstName, traveller.lastName].map(text).filter(Boolean).join(" ") ||
    fallback
  );
}

export default function PlannerConfirmationTravellerCard({
  contactDetails,
  leadTraveller,
  travellers = [],
}: Props) {
  const leadName = travellerName(leadTraveller || travellers[0] || {}, "Lead Traveller");
  const mobile = text(leadTraveller?.mobile) || text(contactDetails?.mobile);
  const email = text(leadTraveller?.email) || text(contactDetails?.email);

  return (
    <section className="rounded-[24px] border border-[#d9e2ec] bg-white p-5 shadow-[0_2px_10px_rgba(15,23,42,0.05)]">
      <h2 className="text-[21px] font-black text-slate-950">Traveller Details</h2>
      <p className="mt-1 text-sm font-semibold text-slate-500">
        Traveller and contact details saved from Smart Planner booking.
      </p>

      <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
        <div className="text-xs font-black uppercase tracking-wide text-blue-700">Lead Traveller</div>
        <div className="mt-1 text-base font-black text-slate-950">{leadName}</div>
        <div className="mt-1 text-sm font-semibold text-slate-600">
          {[mobile, email].filter(Boolean).join(" • ") || "Contact pending"}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3">
        {travellers.length ? (
          travellers.map((traveller, index) => {
            const meta = [
              text(traveller.travellerType) || text(traveller.type) || "Traveller",
              text(traveller.gender),
              traveller.age ? `Age ${traveller.age}` : "",
              text(traveller.roomLabel),
            ].filter(Boolean);
            const contact = [text(traveller.mobile), text(traveller.email)].filter(Boolean);

            return (
              <div key={`${travellerName(traveller, "traveller")}-${index}`} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <div className="font-black text-slate-950">
                  {travellerName(traveller, `Traveller ${index + 1}`)}
                </div>
                <div className="mt-1 text-sm font-semibold text-slate-500">
                  {meta.join(" • ") || "Traveller details"}
                </div>
                {contact.length ? (
                  <div className="mt-1 text-sm font-semibold text-slate-600">
                    {contact.join(" • ")}
                  </div>
                ) : null}
              </div>
            );
          })
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm font-bold text-slate-600">
            Traveller list is not available in the planner confirmation payload.
          </div>
        )}
      </div>
    </section>
  );
}
