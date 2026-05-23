"use client";

type Props = {
  travellers: any[];
};

export default function InsuranceConfirmationTravellerCard({
  travellers,
}: Props) {
  return (
    <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h2 className="text-lg font-black text-gray-950">
          Insured Travellers
        </h2>
        <p className="text-sm font-semibold text-gray-500">
          Traveller-wise insured member details.
        </p>
      </div>

      <div className="space-y-4">
        {(travellers || []).map((traveller, index) => (
          <div
            key={traveller?.id || index}
            className="rounded-2xl border border-orange-100 bg-orange-50/40 p-4"
          >
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-black text-gray-950">
                  Traveller {index + 1}
                </p>
                <p className="text-xs font-semibold text-gray-500">
                  {traveller?.title} {traveller?.firstName}{" "}
                  {traveller?.lastName}
                </p>
              </div>

              {Number(traveller?.age || 0) >= 60 && (
                <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-bold text-purple-700">
                  Senior Traveller
                </span>
              )}
            </div>

            <div className="grid gap-3 md:grid-cols-4">
              <div className="rounded-xl bg-white p-3">
                <p className="text-xs font-bold text-gray-500">Gender</p>
                <p className="text-sm font-black text-gray-950">
                  {traveller?.gender || "-"}
                </p>
              </div>

              <div className="rounded-xl bg-white p-3">
                <p className="text-xs font-bold text-gray-500">DOB</p>
                <p className="text-sm font-black text-gray-950">
                  {traveller?.dob || "-"}
                </p>
              </div>

              <div className="rounded-xl bg-white p-3">
                <p className="text-xs font-bold text-gray-500">Age</p>
                <p className="text-sm font-black text-gray-950">
                  {traveller?.age || "-"}
                </p>
              </div>

              <div className="rounded-xl bg-white p-3">
                <p className="text-xs font-bold text-gray-500">Passport</p>
                <p className="break-all text-sm font-black text-gray-950">
                  {traveller?.passportNumber || "Not required"}
                </p>
              </div>

              {traveller?.passportExpiry && (
                <div className="rounded-xl bg-white p-3">
                  <p className="text-xs font-bold text-gray-500">
                    Passport Expiry
                  </p>
                  <p className="text-sm font-black text-gray-950">
                    {traveller.passportExpiry}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}