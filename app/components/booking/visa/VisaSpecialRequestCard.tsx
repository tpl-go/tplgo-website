"use client";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export default function VisaSpecialRequestCard({ value, onChange }: Props) {
  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-extrabold text-gray-950">
        Special Request
      </h2>

      <p className="mt-1 text-sm font-semibold text-gray-600">
        Add any instruction for our visa operations team.
      </p>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        className="mt-5 w-full resize-none rounded-2xl border border-gray-300 px-4 py-3 text-sm font-semibold text-gray-950 outline-none focus:border-orange-500"
        placeholder="Example: Need urgent processing, family application, travel date is fixed..."
      />
    </div>
  );
}