"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ProfileSectionKey } from "@/app/account/profile/page";

type ProfileSidebarProps = {
  activeSection: ProfileSectionKey;
  onSectionChange: (section: ProfileSectionKey) => void;
  onLogout: () => void;
};

const menuItems: {
  key: ProfileSectionKey | "logout";
  label: string;
  icon: string;
}[] = [
  { key: "profile", label: "My Profile", icon: "👤" },
  { key: "coTraveller", label: "Co Traveller", icon: "👥" },
  { key: "loggedDevices", label: "Logged in Device", icon: "🖥️" },
  { key: "logout", label: "Log out", icon: "🚪" },
];

export default function ProfileSidebar({
  activeSection,
  onSectionChange,
  onLogout,
}: ProfileSidebarProps) {
  const router = useRouter();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleConfirmLogout = () => {
    onLogout();
    setShowLogoutConfirm(false);
    router.push("/");
  };

  return (
    <>
      <aside className="min-h-full border-r border-gray-200 bg-white">
        <div className="px-5 py-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500">
            My Account
          </p>
        </div>

        <div className="px-4 pb-6">
          <div className="space-y-1.5">
            {menuItems.map((item) => {
              const isLogout = item.key === "logout";
              const isActive = !isLogout && activeSection === item.key;

              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => {
                    if (isLogout) {
                      setShowLogoutConfirm(true);
                      return;
                    }
                    onSectionChange(item.key as ProfileSectionKey);
                  }}
                  className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition ${
                    isActive
                      ? "bg-sky-100 text-slate-900"
                      : isLogout
                      ? "text-red-600 hover:bg-red-50"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span className="text-[17px] leading-none">{item.icon}</span>

                  <span className="text-[14px] font-medium">{item.label}</span>

                  {item.key === "profile" && isActive && (
                    <span className="ml-auto h-2 w-2 rounded-full bg-red-700" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-10 border-t border-gray-200 pt-6">
            <button
              type="button"
              onClick={() => onSectionChange("resetPassword")}
              className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition ${
                activeSection === "resetPassword"
                  ? "bg-slate-100 text-slate-900"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <span className="text-[16px] leading-none">🔑</span>
              <span className="text-[13px] font-medium">Reset Password</span>
            </button>
          </div>
        </div>
      </aside>

      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,0.2)]">
            <h3 className="text-[18px] font-semibold text-slate-900">
              Want to log out?
            </h3>

            <p className="mt-2 text-[13px] text-slate-500">
              You will be logged out from your current account session.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="h-10 rounded-xl border border-gray-300 px-5 text-[12px] font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                No
              </button>

              <button
                type="button"
                onClick={handleConfirmLogout}
                className="h-10 rounded-xl bg-red-600 px-5 text-[12px] font-semibold text-white transition hover:bg-red-700"
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}