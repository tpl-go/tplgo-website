"use client";

type Props = {
  homestayRules?: string[];
  coupleFriendly?: boolean;
};

export default function HomestayBookingImportantInfoSection({
  homestayRules = [],
  coupleFriendly = false,
}: Props) {
  const fallbackRules = [
    "Primary guest should be at least 18 years of age.",
    "Valid government photo ID is mandatory at check-in.",
    "Early check-in / late check-out is subject to availability.",
    "Meal timings, kitchen access and house rules may vary by homestay.",
    "Host may charge extra for additional guests or special services.",
  ];

  const finalRules =
    homestayRules.length > 0 ? homestayRules : fallbackRules;

  return (
    <div className="rounded-xl border border-[#d9e2ec] bg-white p-3 md:p-4">
      <div className="mb-3 text-[18px] font-extrabold text-[#111827] md:mb-4 md:text-[20px]">
        Important Information
      </div>

      <div className="rounded-xl border border-[#e5e7eb] bg-[#fcfdff] p-3 md:p-4">
        {coupleFriendly && (
          <div className="mb-3 rounded-lg bg-[#f8fbff] px-3 py-2 text-[13px] font-semibold text-[#0b74ff]">
            Couple Friendly stay. Unmarried couples are allowed.
          </div>
        )}

        <ul className="space-y-2 text-[13px] leading-6 text-[#4b5563] md:text-[14px]">
          {finalRules.map((rule, index) => (
            <li key={index} className="flex gap-2">
              <span className="mt-[6px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#0b74ff]" />
              <span>{rule}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
