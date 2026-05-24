"use client";

import { useRouter } from "next/navigation";
import DestinationRow from "./DestinationRow";
import { buildPopularDestinationUrl } from "@/app/lib/holidays/popularDestinationRouter";

function buildDefaultDate() {
  const date = new Date();
  date.setDate(date.getDate() + 30);
  return date.toISOString().split("T")[0];
}

export default function PopularDestinations() {
  const router = useRouter();

  const destinations = [
    { img: "/destinations/icons/india.svg", name: "India" },
    { img: "/destinations/icons/bali.svg", name: "Bali" },
    { img: "/destinations/icons/thailand.svg", name: "Thailand" },
    { img: "/destinations/icons/dubai.svg", name: "Dubai" },
    { img: "/destinations/icons/london.svg", name: "London" },
    { img: "/destinations/icons/paris.svg", name: "Paris" },
    { img: "/destinations/icons/newyork.svg", name: "NewYork" },
    { img: "/destinations/icons/brazil.svg", name: "Brazil" },
    { img: "/destinations/icons/egypt.svg", name: "Egypt" },
    { img: "/destinations/icons/maldives.svg", name: "Maldives" },
  ];

  const handleDestinationClick = (destinationName: string) => {
    const defaultDate = buildDefaultDate();

    if (destinationName === "India") {
      router.push("/popular/india");
      return;
    }

    const finalUrl = buildPopularDestinationUrl({
      destinationLabel: destinationName,
      origin: "Delhi",
      date: defaultDate,
      adults: 2,
      children: 0,
      rooms: 1,
    });

    if (typeof window !== "undefined") {
      sessionStorage.setItem(
        "holidaySearchContext",
        JSON.stringify({
          origin: "Delhi",
          toCity: destinationName,
          date: defaultDate,
          adults: 2,
          children: 0,
          rooms: 1,
          roomDetails: [{ adults: 2, children: 0 }],
          selectedTheme: "",
          activeTab: "popular",
          filters: {
            durationBucket: "",
            flightPreference: "",
            budgetBucket: "",
            hotelCategory: null,
          },
        })
      );
    }

    router.push(finalUrl);
  };

  return (
    <section
      className="relative mt-2 w-full rounded-[24px] bg-cover bg-center px-3 py-5 sm:rounded-3xl sm:px-8 sm:py-6"
      style={{ backgroundImage: "url('/bg/destinationbg.jpg')" }}
    >
      <div className="pointer-events-none absolute inset-0 rounded-[24px] bg-white/5 sm:rounded-3xl"></div>

      <h2 className="mb-5 text-center text-2xl font-bold text-gray-800 sm:mb-14 sm:text-4xl">
        Popular Destination
      </h2>

      {/* Mobile compact 2-row grid */}
      <div className="relative z-10 grid grid-cols-5 gap-2 md:hidden">
        {destinations.map((destination) => (
          <button
            key={destination.name}
            type="button"
            onClick={() => handleDestinationClick(destination.name)}
            className="flex min-h-[82px] flex-col items-center justify-center rounded-2xl border border-white/50 bg-white/80 px-1.5 py-2 text-center shadow-sm backdrop-blur-md transition hover:bg-orange-50"
          >
            <img
              src={destination.img}
              alt={destination.name}
              className="h-8 w-8 object-contain"
            />

            <span className="mt-1 line-clamp-2 text-[10px] font-extrabold leading-tight text-slate-800">
              {destination.name}
            </span>
          </button>
        ))}
      </div>

      {/* Desktop untouched */}
      <div className="relative z-10 hidden md:block">
        <DestinationRow
          data={destinations.slice(0, 6)}
          onDestinationClick={handleDestinationClick}
        />

        <div className="mb-12"></div>

        <DestinationRow
          data={destinations.slice(6, 10)}
          onDestinationClick={handleDestinationClick}
        />
      </div>
    </section>
  );
}