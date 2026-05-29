"use client";

import React from "react";
import { useRouter } from "next/navigation";

type ManageTab =
  | "summary"
  | "traveller-details"
  | "contact-details"
  | "special-request"
  | "seats"
  | "meals"
  | "baggage"
  | "cancel-booking";

type SidebarItem = {
  key: ManageTab;
  label: string;
  badge?: string;
  disabled?: boolean;
};

interface ManageBookingLayoutProps {
  activeTab: ManageTab;
  onTabChange: (tab: ManageTab) => void;
  bookingId?: string;
  pnr?: string;
  tripLabel?: string;
  journeyLabel?: string;
  sidebarItems?: SidebarItem[];
  children: React.ReactNode;
  rightTopSlot?: React.ReactNode;
}

const defaultSidebarItems: SidebarItem[] = [
  { key: "summary", label: "Booking Summary" },
  { key: "traveller-details", label: "Traveller Details" },
  { key: "contact-details", label: "Contact Details" },
  { key: "special-request", label: "Special Request" },
  { key: "seats", label: "Seats", badge: "Paid" },
  { key: "meals", label: "Meals", badge: "Paid" },
  { key: "baggage", label: "Baggage", badge: "Paid" },
  { key: "cancel-booking", label: "Cancel Booking" },
];

export default function ManageBookingLayout({
  activeTab,
  onTabChange,
  bookingId = "TPL-FLT-2026-0001",
  pnr = "Q7L9PX",
  tripLabel = "Delhi → Mumbai",
  journeyLabel = "1 Adult • One Way",
  sidebarItems = defaultSidebarItems,
  children,
  rightTopSlot,
}: ManageBookingLayoutProps) {
  const router = useRouter();

  return (
    <section className="w-full overflow-x-hidden bg-[#f8f9fb]">
      <div className="mx-auto w-full max-w-[1440px] px-3 py-4 md:px-6 md:py-5 lg:px-8 lg:py-6">
        <div className="mb-4 rounded-[20px] border border-black/5 bg-white p-4 shadow-[0_10px_40px_rgba(0,0,0,0.04)] md:mb-5 md:rounded-[28px] md:p-5 lg:p-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => router.push("/account/bookings")}
                className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[#d9e2ec] bg-white px-4 py-2 text-[12px] font-extrabold text-[#111827] shadow-[0_6px_18px_rgba(15,23,42,0.06)] transition hover:border-[#bfd3ea] hover:bg-[#f8fbff] md:px-5 md:text-[13px]"
              >
                <span style={{ fontSize: "14px", lineHeight: 1 }}>←</span>
                <span>Back to My Bookings</span>
              </button>
            </div>

            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#ff6b00]">
                  Manage Booking
                </p>
                <h1 className="mt-1 text-[20px] font-bold leading-7 text-[#111827] md:text-2xl">
                  Modify Your Flight Booking
                </h1>
                <p className="mt-1 text-[13px] leading-5 text-[#6b7280] md:text-sm">
                  Review booking details, update traveller info, manage ancillaries, or continue to cancellation.
                </p>
              </div>

              <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-3 lg:w-auto lg:gap-3">
                <InfoPill label="Booking ID" value={bookingId} />
                <InfoPill label="PNR" value={pnr} />
                <InfoPill label="Journey" value={journeyLabel} subValue={tripLabel} />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[320px_minmax(0,1fr)] lg:gap-5 xl:grid-cols-[340px_minmax(0,1fr)]">
          <aside className="lg:sticky lg:top-4 lg:self-start">
            <div className="overflow-hidden rounded-[20px] border border-black/5 bg-white shadow-[0_10px_40px_rgba(0,0,0,0.04)] md:rounded-[28px]">
              <div className="border-b border-black/5 px-4 py-3 md:px-5 md:py-4">
                <h2 className="text-base font-bold text-[#111827]">
                  Booking Actions
                </h2>
                <p className="mt-1 text-sm text-[#6b7280]">
                  Select what you want to manage.
                </p>
              </div>

              <div className="p-3 lg:hidden">
                <select
                  value={activeTab}
                  onChange={(event) =>
                    onTabChange(event.target.value as ManageTab)
                  }
                  className="h-12 w-full rounded-2xl border border-[#ff6b00]/20 bg-[#fff7f2] px-4 text-sm font-bold text-[#111827] outline-none shadow-[0_8px_24px_rgba(255,107,0,0.08)]"
                  aria-label="Select booking action"
                >
                  {sidebarItems.map((item) => (
                    <option
                      key={item.key}
                      value={item.key}
                      disabled={item.disabled}
                    >
                      {item.badge ? `${item.label} (${item.badge})` : item.label}
                    </option>
                  ))}
                </select>
              </div>

              <nav className="hidden p-3 lg:block lg:overflow-visible">
                <div className="space-y-2">
                  {sidebarItems.map((item) => {
                    const isActive = activeTab === item.key;

                    const buttonClass = item.disabled
                      ? "cursor-not-allowed opacity-50"
                      : isActive
                      ? "border-[#ff6b00]/20 bg-[#fff7f2] shadow-[0_8px_24px_rgba(255,107,0,0.08)]"
                      : "border-transparent bg-[#f8f9fb] hover:border-black/5 hover:bg-[#f3f4f6]";

                    const titleClass = isActive
                      ? "truncate text-sm font-semibold text-[#ff6b00]"
                      : "truncate text-sm font-semibold text-[#111827]";

                    const dotClass = isActive
                      ? "ml-3 h-2.5 w-2.5 shrink-0 rounded-full bg-[#ff6b00]"
                      : "ml-3 h-2.5 w-2.5 shrink-0 rounded-full bg-[#d1d5db]";

                    const badgeClass = isActive
                      ? "ml-3 shrink-0 rounded-full bg-[#ff6b00] px-2.5 py-1 text-[10px] font-semibold text-white"
                      : "ml-3 shrink-0 rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold text-[#6b7280]";

                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => !item.disabled && onTabChange(item.key)}
                        disabled={item.disabled}
                        className={`group flex min-w-[172px] items-center justify-between rounded-2xl border px-3 py-3 text-left transition-all duration-200 lg:w-full lg:min-w-0 lg:px-4 ${buttonClass}`}
                      >
                        <div className="min-w-0">
                          <p className={titleClass}>{item.label}</p>
                          <p className="mt-0.5 hidden text-xs text-[#6b7280] lg:block">
                            {getTabDescription(item.key)}
                          </p>
                        </div>

                        {item.badge ? (
                          <span className={badgeClass}>{item.badge}</span>
                        ) : (
                          <span className={dotClass} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </nav>

              <div className="hidden border-t border-black/5 bg-[#fcfcfd] px-5 py-4 lg:block">
                <div className="rounded-2xl bg-[#f8f9fb] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6b7280]">
                    Important
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[#4b5563]">
                    Any fare difference, deduction, payment requirement, or refund wallet credit will be shown before final confirmation.
                  </p>
                </div>
              </div>
            </div>
          </aside>

          <div className="min-w-0 space-y-5">
            {rightTopSlot ? rightTopSlot : null}

            <div className="rounded-[20px] border border-black/5 bg-white p-4 shadow-[0_10px_40px_rgba(0,0,0,0.04)] md:rounded-[28px] md:p-5 lg:p-6">
              {children}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function InfoPill({
  label,
  value,
  subValue,
}: {
  label: string;
  value: string;
  subValue?: string;
}) {
  return (
    <div className="min-w-0 rounded-2xl border border-black/5 bg-[#f8f9fb] px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6b7280]">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-bold text-[#111827]">{value}</p>
      {subValue ? (
        <p className="mt-0.5 truncate text-xs text-[#6b7280]">{subValue}</p>
      ) : null}
    </div>
  );
}

function getTabDescription(tab: ManageTab) {
  switch (tab) {
    case "summary":
      return "View full booking details";
    case "traveller-details":
      return "Edit traveller information";
    case "contact-details":
      return "Update email and phone";
    case "special-request":
      return "Update support notes";
    case "seats":
      return "Modify seat selection";
    case "meals":
      return "Modify meal selection";
    case "baggage":
      return "Modify baggage selection";
    case "cancel-booking":
      return "Review cancellation path";
    default:
      return "";
  }
}
