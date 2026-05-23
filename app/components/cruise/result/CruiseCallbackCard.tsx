"use client";

type Props = {
  onRequest?: () => void;
};

export default function CruiseCallbackCard({ onRequest }: Props) {
  return (
    <div className="rounded-[22px] border border-rose-200 bg-[#fffdf6] p-5 shadow-sm">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600 text-xl font-bold text-white">
        ?
      </div>

      <div className="text-[28px] font-semibold leading-tight text-slate-900">
        Not sure which cruise to book?
      </div>

      <div className="mt-3 text-[18px] leading-7 text-slate-600">
        Our cruise experts will help you explore the best options.
      </div>

      <button
        type="button"
        onClick={onRequest}
        className="mt-6 w-full rounded-full bg-sky-500 px-5 py-4 text-[15px] font-extrabold text-white transition hover:bg-sky-600"
      >
        REQUEST A CALLBACK
      </button>
    </div>
  );
}