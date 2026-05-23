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
      className="relative w-full mt-2 px-8 py-6 rounded-3xl bg-cover bg-center"
      style={{ backgroundImage: "url('/bg/destinationbg.jpg')" }}
    >
      <div className="absolute inset-0 bg-white/5 pointer-events-none"></div>

      <h2 className="text-center text-4xl font-bold mb-14 text-gray-800">
        Popular Destination
      </h2>

      <DestinationRow
        data={destinations.slice(0, 6)}
        onDestinationClick={handleDestinationClick}
      />

      <div className="mb-12"></div>

      <DestinationRow
        data={destinations.slice(6, 10)}
        onDestinationClick={handleDestinationClick}
      />
    </section>
  );
}