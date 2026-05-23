"use client";

type SectionKey =
  | "hotelSummary"
  | "guestDetail"
  | "tripSecure"
  | "cab"
  | "addons";

type SectionItem = {
  key: SectionKey;
  label: string;
  completed?: boolean;
};

type Props = {
  timeLeft: string;
  isExpired?: boolean;
  sections: SectionItem[];
  activeSection: SectionKey;
  onSectionClick: (key: SectionKey) => void;
};

export default function HotelBookingTopNav({
  timeLeft,
  isExpired = false,
  sections,
  activeSection,
  onSectionClick,
}: Props) {
  return (
    <div className="border-b border-[#d9e2ec] bg-[#0f172a] text-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2.5">
        {/* LEFT */}
        <div className="min-w-[180px]">
          <div className="text-[22px] font-extrabold leading-none">
            Complete your booking
          </div>
          <div className="mt-1 text-[11px] font-semibold text-white/75">
            {isExpired
              ? "Session expired. Please refresh your selection."
              : "Your selected room and fare are being held for a limited time."}
          </div>
        </div>

        {/* CENTER */}
        <div className="hidden flex-1 items-center justify-center md:flex">
          <div className="flex items-center gap-1">
            {sections.map((section, index) => {
              const isActive = activeSection === section.key;
              const isCompleted = !!section.completed;

              return (
                <div key={section.key} className="flex items-center">
                  <button
                    type="button"
                    onClick={() => onSectionClick(section.key)}
                    className={`relative px-3 py-2 text-[12px] font-extrabold uppercase tracking-[0.2px] transition ${
                      isActive
                        ? "text-white"
                        : isCompleted
                        ? "text-[#86efac]"
                        : "text-white/70 hover:text-white"
                    }`}
                  >
                    {section.label}

                    <span
                      className={`absolute bottom-0 left-1/2 h-[2px] -translate-x-1/2 rounded-full transition-all ${
                        isActive
                          ? "w-[80%] bg-[#38bdf8]"
                          : isCompleted
                          ? "w-[60%] bg-[#22c55e]"
                          : "w-0 bg-transparent"
                      }`}
                    />
                  </button>

                  {index < sections.length - 1 && (
                    <span
                      className={`mx-1 h-[2px] w-5 rounded-full ${
                        isCompleted ? "bg-[#22c55e]" : "bg-white/20"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT */}
        <div
          className={`min-w-[84px] rounded-full border px-3 py-1.5 text-center text-[14px] font-extrabold ${
            isExpired
              ? "border-[#fecaca] bg-[#7f1d1d] text-[#fecaca]"
              : "border-white/20 bg-white text-[#111827]"
          }`}
        >
          {timeLeft}
        </div>
      </div>
    </div>
  );
}