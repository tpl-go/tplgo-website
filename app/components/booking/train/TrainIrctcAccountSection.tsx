"use client";

import type { TrainIrctcAccountDetails } from "@/app/lib/train/trainBookingTypes";

type Props = {
  irctcAccount: TrainIrctcAccountDetails;
  onChange: (next: TrainIrctcAccountDetails) => void;
};

export default function TrainIrctcAccountSection({
  irctcAccount,
  onChange,
}: Props) {
  return (
    <section className="overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-4">
        <div className="text-[20px] font-extrabold text-slate-900">
          IRCTC Account Details
        </div>
        <div className="mt-1 text-[13px] text-slate-500">
          Train booking completion will require IRCTC authentication after payment.
        </div>
      </div>

      <div className="px-5 py-5">
        <div className="rounded-[18px] border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] font-medium text-amber-800">
          Use the correct IRCTC username linked to the account from which final train authentication will be completed.
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4">
          <label className="block">
            <div className="mb-2 text-[13px] font-bold text-slate-700">
              IRCTC Username
            </div>

            <div className="flex items-center gap-3">
              <input
                type="text"
                value={irctcAccount.username}
                onChange={(e) =>
                  onChange({
                    ...irctcAccount,
                    username: e.target.value,
                  })
                }
                placeholder="Enter IRCTC username"
                className="h-[46px] flex-1 rounded-xl border border-slate-300 bg-white px-3 text-[14px] font-medium text-slate-900 outline-none"
              />

              <button
                type="button"
                className="h-[46px] min-w-[110px] rounded-xl border border-sky-200 bg-sky-50 px-4 text-[13px] font-extrabold text-sky-700 transition hover:border-sky-300 hover:bg-sky-100"
              >
                VERIFY
              </button>
            </div>
          </label>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-4 text-[13px] font-semibold">
          <button
            type="button"
            className="text-sky-600 transition hover:text-sky-700 hover:underline"
          >
            Forgot Username?
          </button>

          <button
            type="button"
            className="text-sky-600 transition hover:text-sky-700 hover:underline"
          >
            Forgot Password?
          </button>

          <button
            type="button"
            className="text-emerald-600 transition hover:text-emerald-700 hover:underline"
          >
            Create Account
          </button>
        </div>

        <div className="mt-4 rounded-[16px] border border-slate-200 bg-slate-50 px-4 py-3">
          <div className="text-[13px] font-bold text-slate-800">
            Important
          </div>

          <div className="mt-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[13px] font-bold text-amber-800">
            Please keep your IRCTC password ready. It will be required after payment to complete authentication.
          </div>

          <ul className="mt-3 space-y-2 text-[13px] text-slate-600">
            <li>• After payment, the next step will require IRCTC password/authentication.</li>
            <li>• Final ticket booking will be completed only after successful IRCTC verification.</li>
            <li>• Entering the wrong IRCTC username may cause booking completion failure.</li>
          </ul>
        </div>
      </div>
    </section>
  );
}