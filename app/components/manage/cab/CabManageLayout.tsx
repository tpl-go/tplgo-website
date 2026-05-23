"use client";

import React from "react";
import { useRouter } from "next/navigation";

export type CabManageTab =
  | "summary"
  | "traveller-details"
  | "contact-details"
  | "special-request"
  | "cab-addons";

type SidebarItem = {
  key: CabManageTab;
  label: string;
  desc: string;
  badge?: string;
};

type Props = {
  activeTab: CabManageTab;
  onTabChange: (tab: CabManageTab) => void;
  bookingId: string;
  cabName: string;
  routeLabel: string;
  pickupDateLabel: string;
  children: React.ReactNode;
};

const sidebarItems: SidebarItem[] = [
  {
    key: "summary",
    label: "Booking Summary",
    desc: "View cab booking details",
  },
  {
    key: "traveller-details",
    label: "Traveller Details",
    desc: "Update traveller information",
  },
  {
    key: "contact-details",
    label: "Contact Details",
    desc: "Update email and phone",
  },
  {
    key: "special-request",
    label: "Special Request",
    desc: "Update cab travel notes",
  },
  {
    key: "cab-addons",
    label: "Cab / Add-ons",
    desc: "Paid changes next",
    badge: "Paid",
  },
];

export default function CabManageLayout({
  activeTab,
  onTabChange,
  bookingId,
  cabName,
  routeLabel,
  pickupDateLabel,
  children,
}: Props) {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-[#f8f9fb]">
      <div className="mx-auto w-full max-w-[1440px] px-4 py-5 md:px-6 lg:px-8 lg:py-6">
        <div className="mb-5 rounded-[28px] border border-black/5 bg-white p-5 shadow-[0_10px_40px_rgba(0,0,0,0.04)] lg:p-6">
          <button
            type="button"
            onClick={() => router.push("/account/bookings")}
            className="inline-flex items-center gap-2 rounded-full border border-[#d9e2ec] bg-white px-5 py-2 text-[13px] font-extrabold text-[#111827] shadow-[0_6px_18px_rgba(15,23,42,0.06)] transition hover:bg-[#f8fbff] hover:border-[#bfd3ea]"
          >
            <span style={{ fontSize: "14px", lineHeight: 1 }}>←</span>
            <span>Back to My Bookings</span>
          </button>

          <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#ff6b00]">
                Manage Booking
              </p>
              <h1 className="mt-1 text-xl font-bold text-[#111827] md:text-2xl">
                Modify Your Cab Booking
              </h1>
              <p className="mt-1 text-sm text-[#6b7280]">
                Update traveller details, contact details, ride notes and review cab booking.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <InfoPill label="Booking ID" value={bookingId} />
              <InfoPill label="Cab" value={cabName} />
              <InfoPill
                label="Pickup Date"
                value={pickupDateLabel}
                subValue={routeLabel}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[320px_minmax(0,1fr)] xl:grid-cols-[340px_minmax(0,1fr)]">
          <aside className="lg:sticky lg:top-4 lg:self-start">
            <div className="overflow-hidden rounded-[28px] border border-black/5 bg-white shadow-[0_10px_40px_rgba(0,0,0,0.04)]">
              <div className="border-b border-black/5 px-5 py-4">
                <h2 className="text-base font-bold text-[#111827]">
                  Booking Actions
                </h2>
                <p className="mt-1 text-sm text-[#6b7280]">
                  Select what you want to manage.
                </p>
              </div>

              <nav className="p-3">
                <div className="space-y-2">
                  {sidebarItems.map((item) => {
                    const isActive = activeTab === item.key;

                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => onTabChange(item.key)}
                        className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition-all duration-200 ${
                          isActive
                            ? "border-[#ff6b00]/20 bg-[#fff7f2] shadow-[0_8px_24px_rgba(255,107,0,0.08)]"
                            : "border-transparent bg-[#f8f9fb] hover:border-black/5 hover:bg-[#f3f4f6]"
                        }`}
                      >
                        <div className="min-w-0">
                          <p
                            className={`truncate text-sm font-semibold ${
                              isActive ? "text-[#ff6b00]" : "text-[#111827]"
                            }`}
                          >
                            {item.label}
                          </p>
                          <p className="mt-0.5 text-xs text-[#6b7280]">
                            {item.desc}
                          </p>
                        </div>

                        {item.badge ? (
                          <span
                            className={`ml-3 shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                              isActive
                                ? "bg-[#ff6b00] text-white"
                                : "bg-white text-[#6b7280]"
                            }`}
                          >
                            {item.badge}
                          </span>
                        ) : (
                          <span
                            className={`ml-3 h-2.5 w-2.5 shrink-0 rounded-full ${
                              isActive ? "bg-[#ff6b00]" : "bg-[#d1d5db]"
                            }`}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </nav>

              <div className="border-t border-black/5 bg-[#fcfcfd] px-5 py-4">
                <div className="rounded-2xl bg-[#f8f9fb] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6b7280]">
                    Important
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[#4b5563]">
                    Cab upgrade, add-ons, fare difference or refund wallet credit will be shown before final confirmation.
                  </p>
                </div>
              </div>
            </div>
          </aside>

          <div className="min-w-0">
            <div className="rounded-[28px] border border-black/5 bg-white p-5 shadow-[0_10px_40px_rgba(0,0,0,0.04)] lg:p-6">
              {children}
            </div>
          </div>
        </div>
      </div>
    </main>
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
    <div className="rounded-2xl border border-black/5 bg-[#f8f9fb] px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6b7280]">
        {label}
      </p>
      <p className="mt-1 text-sm font-bold text-[#111827]">{value || "-"}</p>
      {subValue ? (
        <p className="mt-0.5 truncate text-xs text-[#6b7280]">{subValue}</p>
      ) : null}
    </div>
  );
}