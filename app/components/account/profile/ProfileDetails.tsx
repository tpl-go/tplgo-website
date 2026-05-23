"use client";

import type { ProfileSectionKey } from "@/app/account/profile/page";
import MyProfileSection from "@/app/components/account/profile/sections/MyProfileSection";
import CoTravellerSection from "@/app/components/account/profile/sections/CoTravellerSection";
import LoggedDevicesSection from "@/app/components/account/profile/sections/LoggedDevicesSection";
import ResetPasswordSection from "@/app/components/account/profile/sections/ResetPasswordSection";

type ProfileDetailsProps = {
  activeSection: ProfileSectionKey;
};

export default function ProfileDetails({
  activeSection,
}: ProfileDetailsProps) {
  if (activeSection === "coTraveller") {
    return <CoTravellerSection />;
  }

  if (activeSection === "loggedDevices") {
    return <LoggedDevicesSection />;
  }

  if (activeSection === "resetPassword") {
    return <ResetPasswordSection />;
  }

  return <MyProfileSection />;
}