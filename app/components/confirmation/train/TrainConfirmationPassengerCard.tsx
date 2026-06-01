"use client";

type Traveller = {
  fullName?: string;
  age?: string | number;
  gender?: string;
  coach?: string;
  seatNumber?: string;
  berth?: string;
  status?: string;
};

type Props = {
  travellers: Traveller[];
};

export default function TrainConfirmationPassengerCard({ travellers }: Props) {
  return (
    <div className="min-w-0 rounded-xl border bg-white p-4 shadow-sm md:p-5">
      <div className="mb-3 text-[18px] font-extrabold text-slate-900">
        Passenger Details
      </div>

      {travellers.map((t, i) => (
        <div
          key={i}
          className="mb-3 overflow-hidden rounded-[18px] border border-slate-200 bg-[#f8fafc] md:break-words md:rounded-lg md:bg-white md:px-4 md:py-3 md:text-[15px] md:font-semibold md:text-slate-800"
        >
          <div className="p-4 md:hidden">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="break-words text-[15px] font-black leading-5 text-[#111827]">
                  {t.fullName || `Passenger ${i + 1}`}
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="rounded-full border border-[#e5e7eb] bg-white px-2.5 py-1 text-[11px] font-black text-[#475569]">
                    {t.gender || "Passenger"}
                  </span>
                  {t.age ? (
                    <span className="rounded-full border border-[#e5e7eb] bg-white px-2.5 py-1 text-[11px] font-black text-[#475569]">
                      {t.age} yrs
                    </span>
                  ) : null}
                </div>
              </div>
              <span className="shrink-0 rounded-full bg-[#dcfce7] px-2.5 py-1 text-[10px] font-black uppercase text-[#15803d]">
                {t.status || "Confirmed"}
              </span>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <Mini label="Coach" value={t.coach || "NA"} />
              <Mini label="Seat" value={t.seatNumber || "NA"} />
              <Mini label="Berth" value={t.berth || "NA"} />
              <Mini label="Status" value={t.status || "Confirmed"} />
            </div>
          </div>

          <div className="hidden md:block">
            {t.fullName} • {t.age} • {t.gender}
          </div>
        </div>
      ))}
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#e5e7eb] bg-white px-3 py-2.5">
      <div className="text-[10px] font-black uppercase tracking-[0.12em] text-[#64748b]">
        {label}
      </div>
      <div className="mt-1 break-words text-[12px] font-black leading-4 text-[#111827]">
        {value}
      </div>
    </div>
  );
}
