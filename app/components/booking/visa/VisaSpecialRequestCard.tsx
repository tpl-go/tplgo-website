"use client";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export default function VisaSpecialRequestCard({ value, onChange }: Props) {
  return (
    <div className="min-w-0 rounded-[22px] border border-gray-200 bg-white p-4 shadow-sm md:rounded-3xl md:p-6">
      <h2 className="break-words text-[19px] font-extrabold leading-6 text-gray-950 md:text-xl">
        Special Request
      </h2>

      <p className="mt-1 break-words text-sm font-semibold leading-5 text-gray-600">
        Add any instruction for our visa operations team.
      </p>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        className="mt-5 w-full min-w-0 resize-none rounded-2xl border border-gray-300 px-4 py-3 text-sm font-semibold leading-6 text-gray-950 outline-none focus:border-orange-500"
        placeholder="Example: Need urgent processing, family application, travel date is fixed..."
      />
    </div>
  );
}
