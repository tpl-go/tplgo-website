"use client";

type Props = {
  hotelRules?: string[];
  coupleFriendly?: boolean;
};

export default function HotelBookingImportantInfoSection({
  hotelRules = [],
  coupleFriendly = false,
}: Props) {
  const fallbackRules = [
    "Primary guest should be at least 18 years of age.",
    "Valid government photo ID is mandatory at check-in.",
    "Early check-in / late check-out is subject to availability.",
    "Cancellation policy may differ for promotional room rates.",
    "Hotel may charge extra for additional guests or services.",
  ];

  const finalRules =
    hotelRules.length > 0 ? hotelRules : fallbackRules;

  return (
    <div className="rounded-xl border border-[#d9e2ec] bg-white p-4">
      <div className="mb-4 text-[20px] font-extrabold text-[#111827]">
        Important Information
      </div>

      <div className="rounded-xl border border-[#e5e7eb] bg-[#fcfdff] p-4">
        {coupleFriendly && (
          <div className="mb-3 rounded-lg bg-[#f8fbff] px-3 py-2 text-[13px] font-semibold text-[#0b74ff]">
            Couple Friendly stay. Unmarried couples are allowed.
          </div>
        )}

        <ul className="space-y-2 text-[14px] leading-6 text-[#4b5563]">
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