"use client";

type SectionKey =
  | "homestaySummary"
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

export default function HomestayBookingTopNav({
  timeLeft,
  isExpired = false,
  sections,
  activeSection,
  onSectionClick,
}: Props) {
  return (
    <div className="border-b border-[#d9e2ec] bg-[#0f172a] text-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-3 py-2 md:gap-4 md:px-4 md:py-2.5">
        {/* LEFT */}
        <div className="min-w-0 md:min-w-[180px]">
          <div className="truncate text-[15px] font-extrabold leading-none md:text-[22px]">
            Complete your booking
          </div>
          <div className="mt-1 line-clamp-1 text-[10px] font-semibold text-white/75 md:text-[11px]">
            {isExpired
              ? "Session expired. Please refresh your selection."
              : "Your selected stay and fare are being held for a limited time."}
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
          className={`min-w-[70px] rounded-full border px-2.5 py-1 text-center text-[12px] font-extrabold md:min-w-[84px] md:px-3 md:py-1.5 md:text-[14px] ${
            isExpired
              ? "border-[#fecaca] bg-[#7f1d1d] text-[#fecaca]"
              : "border-white/20 bg-white text-[#111827]"
          }`}
        >
          {timeLeft}
        </div>
      </div>

      <div className="mx-auto max-w-7xl overflow-x-auto px-3 pb-2 md:hidden">
        <div className="flex min-w-max gap-2">
          {sections.map((section, index) => {
            const isActive = activeSection === section.key;
            const isCompleted = !!section.completed;

            return (
              <button
                key={section.key}
                type="button"
                onClick={() => onSectionClick(section.key)}
                className={`inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-[11px] font-extrabold ${
                  isActive
                    ? "border-[#38bdf8] bg-[#0f2f46] text-white"
                    : isCompleted
                    ? "border-[#22c55e]/40 bg-[#052e16] text-[#86efac]"
                    : "border-white/15 bg-white/5 text-white/75"
                }`}
              >
                <span>{index + 1}</span>
                <span>{section.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
