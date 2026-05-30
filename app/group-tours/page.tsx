"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import GroupBanner from "@/app/components/group/GroupBanner";
import GroupTabs from "@/app/components/group/GroupTabs";
import GroupFilters from "@/app/components/group/GroupFilters";
import GroupPackagesGrid from "@/app/components/group/GroupPackagesGrid";
import MobileInnerBack from "@/app/components/common/mobile/MobileInnerBack";

const GROUP_TABS = [
  "Cultural",
  "Spiritual",
  "Women Special",
  "Trekking",
  "Family",
  "Senior Citizen",
  "Fixed Departure",
  "Corporate",
];

const GROUP_COUNTRIES = [
  "India",
  "Thailand",
  "Dubai",
  "Singapore",
  "Malaysia",
  "Indonesia",
  "Vietnam",
  "Japan",
  "Sri Lanka",
  "Maldives",
  "Europe",
];

function GroupPageContent() {
  const searchParams = useSearchParams();

  const [activeTab, setActiveTab] = useState<string>("");
  const [activeCountry, setActiveCountry] = useState<string>("");
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [resetFilters, setResetFilters] = useState(false);

  useEffect(() => {
    const tabFromUrl = searchParams.get("tab");

    const matchedTab =
      GROUP_TABS.find(
        (tab) => tab.toLowerCase() === (tabFromUrl || "").toLowerCase()
      ) || "";

    if (matchedTab) {
      setActiveTab(matchedTab);
    }
  }, [searchParams]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const handleCountryChange = (country: string) => {
    setActiveCountry(country);
  };

  const handleClearAll = () => {
    setSelectedFilters([]);
    setActiveCountry("");
    setActiveTab("");
    setResetFilters((prev) => !prev);
  };

  return (
    <main className="relative overflow-x-hidden">
      <div className="absolute left-3 top-3 z-30 lg:hidden">
        <MobileInnerBack title="Back" />
      </div>

      <GroupBanner slug="group-tour" />

      <div className="max-w-7xl mx-auto px-3 sm:px-4 -mt-6 lg:-mt-10 relative z-20">
        <div className="bg-white/95 backdrop-blur border rounded-2xl shadow-sm px-3 pt-3 pb-4 lg:px-4 lg:pt-4 lg:pb-6">
          <GroupTabs
            tabs={GROUP_TABS}
            activeTab={activeTab}
            setActiveTab={handleTabChange}
          />
        </div>
      </div>

      <section className="max-w-7xl mx-auto px-3 sm:px-4 pb-20 lg:pb-16 mt-4">
        <div className="bg-white lg:border lg:rounded-xl lg:shadow-sm lg:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-8">
            <div className="lg:col-span-1 lg:sticky lg:top-32 h-fit">
              <GroupFilters
                selectedFilters={selectedFilters}
                setSelectedFilters={setSelectedFilters}
                countries={GROUP_COUNTRIES}
                activeCountry={activeCountry}
                setActiveCountry={handleCountryChange}
                resetFilters={resetFilters}
              />
            </div>

            <div className="lg:col-span-3">
              <GroupPackagesGrid
                selectedFilters={selectedFilters}
                setSelectedFilters={setSelectedFilters}
                activeTab={activeTab}
                setActiveTab={handleTabChange}
                activeCountry={activeCountry}
                setActiveCountry={handleCountryChange}
                resetFilters={resetFilters}
                setResetFilters={setResetFilters}
                onClearAll={handleClearAll}
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function GroupPage() {
  return (
    <Suspense fallback={<div />}>
      <GroupPageContent />
    </Suspense>
  );
}
