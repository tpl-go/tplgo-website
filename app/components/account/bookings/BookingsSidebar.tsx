"use client";

import type { BookingSectionKey } from "@/app/account/bookings/page";

type BookingsSidebarProps = {
  activeSection: BookingSectionKey;
  onSectionChange: (section: BookingSectionKey) => void;
};

const mainItems: {
  key: BookingSectionKey;
  label: string;
  icon: string;
}[] = [
  { key: "upcoming", label: "Upcoming Journey", icon: "🧳" },
  { key: "completed", label: "Completed Journey", icon: "✅" },
  { key: "cancelled", label: "Canceled Journey", icon: "❌" },
];

export default function BookingsSidebar({
  activeSection,
  onSectionChange,
}: BookingsSidebarProps) {
  return (
    <aside className="min-h-full border-b border-gray-200 bg-white lg:border-b-0 lg:border-r">
      <div className="px-4 py-4 md:px-5 md:py-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500">
          My Bookings
        </p>
      </div>

      <div className="px-3 pb-4 md:px-4 md:pb-6">
        <div className="grid grid-cols-3 gap-2 lg:block lg:space-y-1.5">
          {mainItems.map((item) => {
            const isActive = activeSection === item.key;

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => onSectionChange(item.key)}
                className={`flex min-w-0 w-full items-center justify-center gap-2 rounded-2xl px-2 py-2.5 text-center transition lg:justify-start lg:gap-3 lg:px-4 lg:py-3 lg:text-left ${
                  isActive
                    ? "bg-sky-100 text-slate-900"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <span className="shrink-0 text-[15px] leading-none lg:text-[17px]">
                  {item.icon}
                </span>
                <span className="min-w-0 text-[11px] font-semibold leading-4 lg:text-[14px] lg:font-medium">
                  {item.label}
                </span>
                {item.key === "upcoming" && isActive && (
                  <span className="hidden h-2 w-2 rounded-full bg-red-700 lg:ml-auto lg:block" />
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-2 border-t border-gray-200 pt-3 lg:mt-10 lg:pt-6">
          <button
            type="button"
            onClick={() => onSectionChange("refund")}
            className={`flex w-full items-center justify-center gap-2 rounded-2xl px-3 py-2.5 text-center transition lg:justify-start lg:gap-3 lg:px-4 lg:py-3 lg:text-left ${
              activeSection === "refund"
                ? "bg-slate-100 text-slate-900"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <span className="shrink-0 text-[15px] leading-none lg:text-[16px]">
              💸
            </span>
            <span className="text-[12px] font-semibold leading-4 lg:text-[13px] lg:font-medium">
              Refund Status
            </span>
          </button>
        </div>
      </div>
    </aside>
  );
}
