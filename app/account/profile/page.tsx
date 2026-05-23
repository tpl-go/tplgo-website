"use client";

import { useState } from "react";
import { useAuth } from "@/app/hooks/useAuth";
import ProfileSidebar from "@/app/components/account/profile/ProfileSidebar";
import ProfileDetails from "@/app/components/account/profile/ProfileDetails";

export type ProfileSectionKey =
  | "profile"
  | "coTraveller"
  | "loggedDevices"
  | "resetPassword";

export default function ProfilePage() {
  const { logout } = useAuth();
  const [activeSection, setActiveSection] =
    useState<ProfileSectionKey>("profile");

  return (
    <div className="overflow-hidden rounded-[22px] border border-gray-200 bg-white shadow-[0_10px_35px_rgba(15,23,42,0.06)]">
      <div className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)]">
        <ProfileSidebar
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          onLogout={logout}
        />

        <ProfileDetails activeSection={activeSection} />
      </div>
    </div>
  );
}