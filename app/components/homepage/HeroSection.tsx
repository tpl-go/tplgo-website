"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Plane,
  Hotel,
  Home,
  Bus,
  Train,
  Car,
  Ship,
  ShieldCheck,
  FileText,
  Briefcase,
  MoreHorizontal,
} from "lucide-react";

import FlightSearchBox from "../flight/search/FlightSearchBox";
import HotelSearchBox from "../hotel/search/HotelSearchBox";
import HomestaySearchBox from "../Homestays/search/HomestaySearchBox";
import HolidaySearchBox from "../holidays/HolidaySearch/HolidaySearchBox";
import BusSearchBox from "../bus/search/BusSearchBox";
import TrainSearchBox from "../train/search/TrainSearchBox";
import CabSearchBox from "../cab/search/CabSearchBox";
import CruiseSearchBox from "../cruise/search/CruiseSearchBox";
import VisaSearchBox from "../visa/search/VisaSearchBox";
import InsuranceSearchBox from "../insurance/search/InsuranceSearchBox";

export default function HeroSection() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("Flights");
  const [showMoreServices, setShowMoreServices] = useState(false);

  const services = [
    "Flights",
    "Hotels",
    "Homestay",
    "Holidays",
    "Bus",
    "Train",
    "Cabs",
    "Cruise",
    "Insurance",
    "Visa",
  ];

  const serviceMap: Record<string, string> = {
    flights: "Flights",
    flight: "Flights",
    hotels: "Hotels",
    hotel: "Hotels",
    homestays: "Homestay",
    homestay: "Homestay",
    holidays: "Holidays",
    holiday: "Holidays",
    packages: "Holidays",
    bus: "Bus",
    buses: "Bus",
    train: "Train",
    trains: "Train",
    cab: "Cabs",
    cabs: "Cabs",
    cruise: "Cruise",
    cruises: "Cruise",
    insurance: "Insurance",
    visa: "Visa",
  };

  useEffect(() => {
    const service = searchParams.get("service");
    if (!service) return;

    const normalizedService = service.trim().toLowerCase();
    const matchedTab = serviceMap[normalizedService];

    if (matchedTab && services.includes(matchedTab)) {
      setActiveTab(matchedTab);
    }
  }, [searchParams]);

  const renderIcon = (tab: string, size = 18) => {
    if (tab === "Flights") return <Plane size={size} />;
    if (tab === "Hotels") return <Hotel size={size} />;
    if (tab === "Homestay") return <Home size={size} />;
    if (tab === "Holidays") return <Briefcase size={size} />;
    if (tab === "Bus") return <Bus size={size} />;
    if (tab === "Train") return <Train size={size} />;
    if (tab === "Cabs") return <Car size={size} />;
    if (tab === "Cruise") return <Ship size={size} />;
    if (tab === "Insurance") return <ShieldCheck size={size} />;
    if (tab === "Visa") return <FileText size={size} />;
    return null;
  };

  const handleMobileTabClick = (tab: string) => {
    setActiveTab(tab);
    setShowMoreServices(false);
  };

  return (
    <section
      className="relative z-30 w-full overflow-visible bg-cover bg-center md:flex md:min-h-[500px] md:items-center md:rounded-3xl"
      style={{ backgroundImage: "url('/hero-bg.jpg')" }}
    >
      <div className="absolute inset-0 bg-white/5" />

      <div className="relative w-full px-3 pb-6 pt-5 md:mt-20 md:flex md:items-start md:justify-center md:px-0 md:pb-10 md:pt-0">
        <div className="w-full max-w-6xl md:px-4">
          <div className="flex w-full justify-center">
            {/* Desktop tabs — unchanged */}
            <div className="hidden w-fit flex-nowrap items-center justify-center gap-6 md:flex">
              {services.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`flex h-13 w-22 items-center justify-center rounded-2xl border border-white/40 bg-white/90 text-sm font-semibold backdrop-blur-sm transition-all duration-300 ${
                    activeTab === tab
                      ? "!scale-105 !border-orange-500 !bg-orange-500 !text-white shadow-xl"
                      : "text-gray-700 hover:scale-105 hover:text-black hover:shadow-lg"
                  }`}
                >
                  <div className="flex flex-col items-center justify-center gap-1">
                    <span>{tab}</span>
                    {renderIcon(tab, 18)}
                  </div>
                </button>
              ))}
            </div>

            {/* Mobile tabs — 5 + 5 grid, no More */}
            <div className="w-full md:hidden">
              <div className="grid grid-cols-5 gap-2">
                {services.map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => handleMobileTabClick(tab)}
                    className={`flex h-[58px] min-w-0 flex-col items-center justify-center gap-1 rounded-2xl border border-white/40 bg-white/90 px-1 text-[9px] font-bold backdrop-blur-sm transition-all duration-300 ${
                      activeTab === tab
                        ? "!border-orange-500 !bg-orange-500 !text-white shadow-xl"
                        : "text-gray-700"
                    }`}
                  >
                    {renderIcon(tab, 14)}
                    <span className="max-w-full truncate">{tab}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-3 w-full overflow-visible md:mt-0 md:overflow-visible">
            {activeTab === "Flights" && <FlightSearchBox />}
            {activeTab === "Hotels" && <HotelSearchBox />}
            {activeTab === "Homestay" && <HomestaySearchBox />}
            {activeTab === "Holidays" && <HolidaySearchBox />}
            {activeTab === "Bus" && <BusSearchBox />}
            {activeTab === "Train" && <TrainSearchBox />}
            {activeTab === "Cabs" && <CabSearchBox />}
            {activeTab === "Cruise" && <CruiseSearchBox />}
            {activeTab === "Insurance" && <InsuranceSearchBox />}
            {activeTab === "Visa" && <VisaSearchBox />}
          </div>
        </div>
      </div>
    </section>
  );
}