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

  return (
    <section
      className="relative z-30 flex min-h-[500px] w-full items-center rounded-3xl bg-cover bg-center"
      style={{ backgroundImage: "url('/hero-bg.jpg')" }}
    >
      <div className="absolute inset-0 bg-white/5" />

      <div className="relative mt-20 flex w-full items-start justify-center">
        <div className="w-full max-w-6xl px-4">
          <div className="flex justify-center">
            <div className="mx-auto flex w-fit flex-nowrap items-center justify-center gap-6">
              {services.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`h-13 w-22 flex items-center justify-center rounded-2xl border border-white/40 bg-white/90 text-sm font-semibold backdrop-blur-sm transition-all duration-300 ${
                    activeTab === tab
                      ? "!scale-105 !border-orange-500 !bg-orange-500 !text-white shadow-xl"
                      : "text-gray-700 hover:scale-105 hover:text-black hover:shadow-lg"
                  }`}
                >
                  <div className="flex flex-col items-center justify-center gap-1">
                    <span>{tab}</span>

                    {tab === "Flights" && <Plane size={18} />}
                    {tab === "Hotels" && <Hotel size={18} />}
                    {tab === "Homestay" && <Home size={18} />}
                    {tab === "Holidays" && <Briefcase size={18} />}
                    {tab === "Bus" && <Bus size={18} />}
                    {tab === "Train" && <Train size={18} />}
                    {tab === "Cabs" && <Car size={18} />}
                    {tab === "Cruise" && <Ship size={18} />}
                    {tab === "Insurance" && <ShieldCheck size={18} />}
                    {tab === "Visa" && <FileText size={18} />}
                  </div>
                </button>
              ))}
            </div>
          </div>

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
    </section>
  );
}