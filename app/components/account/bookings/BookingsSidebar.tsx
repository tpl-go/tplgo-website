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
    <aside className="min-h-full border-r border-gray-200 bg-white">
      <div className="px-5 py-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500">
          My Bookings
        </p>
      </div>

      <div className="px-4 pb-6">
        <div className="space-y-1.5">
          {mainItems.map((item) => {
            const isActive = activeSection === item.key;

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => onSectionChange(item.key)}
                className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition ${
                  isActive
                    ? "bg-sky-100 text-slate-900"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <span className="text-[17px] leading-none">{item.icon}</span>
                <span className="text-[14px] font-medium">{item.label}</span>
                {item.key === "upcoming" && isActive && (
                  <span className="ml-auto h-2 w-2 rounded-full bg-red-700" />
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-10 border-t border-gray-200 pt-6">
          <button
            type="button"
            onClick={() => onSectionChange("refund")}
            className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition ${
              activeSection === "refund"
                ? "bg-slate-100 text-slate-900"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <span className="text-[16px] leading-none">💸</span>
            <span className="text-[13px] font-medium">Refund Status</span>
          </button>
        </div>
      </div>
    </aside>
  );
}