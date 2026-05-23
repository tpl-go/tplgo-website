"use client";

export default function TrainConfirmationPassengerCard({ travellers }: any) {
  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <div className="text-[18px] font-extrabold text-slate-900 mb-3">
        Passenger Details
      </div>

      {travellers.map((t: any, i: number) => (
        <div
          key={i}
          className="mb-3 rounded-lg border border-slate-200 px-4 py-3 text-[15px] font-semibold text-slate-800"
        >
          {t.fullName} • {t.age} • {t.gender}
        </div>
      ))}
    </div>
  );
}