"use client";

import { useRouter } from "next/navigation";
import DestinationRow from "./DestinationRow";
import { buildPopularDestinationUrl } from "@/app/lib/holidays/popularDestinationRouter";
import TPLDynamicImage from "@/app/components/common/TPLDynamicImage";

function buildDefaultDate() {
  const date = new Date();
  date.setDate(date.getDate() + 30);
  return date.toISOString().split("T")[0];
}

export default function PopularDestinations() {
  const router = useRouter();

  const destinations = [
    {
      imageUrl: "/destinations/icons/india.svg",
      imageQuery: "India travel destination",
      fallbackImage: "/destinations/icons/india.svg",
      imageAlt: "India",
      name: "India",
    },
    {
      imageUrl: "/destinations/icons/bali.svg",
      imageQuery: "Bali travel destination",
      fallbackImage: "/destinations/icons/bali.svg",
      imageAlt: "Bali",
      name: "Bali",
    },
    {
      imageUrl: "/destinations/icons/thailand.svg",
      imageQuery: "Thailand travel destination",
      fallbackImage: "/destinations/icons/thailand.svg",
      imageAlt: "Thailand",
      name: "Thailand",
    },
    {
      imageUrl: "/destinations/icons/dubai.svg",
      imageQuery: "Dubai travel destination",
      fallbackImage: "/destinations/icons/dubai.svg",
      imageAlt: "Dubai",
      name: "Dubai",
    },
    {
      imageUrl: "/destinations/icons/london.svg",
      imageQuery: "London travel destination",
      fallbackImage: "/destinations/icons/london.svg",
      imageAlt: "London",
      name: "London",
    },
    {
      imageUrl: "/destinations/icons/paris.svg",
      imageQuery: "Paris travel destination",
      fallbackImage: "/destinations/icons/paris.svg",
      imageAlt: "Paris",
      name: "Paris",
    },
    {
      imageUrl: "/destinations/icons/newyork.svg",
      imageQuery: "New York travel destination",
      fallbackImage: "/destinations/icons/newyork.svg",
      imageAlt: "New York",
      name: "NewYork",
    },
    {
      imageUrl: "/destinations/icons/brazil.svg",
      imageQuery: "Brazil travel destination",
      fallbackImage: "/destinations/icons/brazil.svg",
      imageAlt: "Brazil",
      name: "Brazil",
    },
    {
      imageUrl: "/destinations/icons/egypt.svg",
      imageQuery: "Egypt travel destination",
      fallbackImage: "/destinations/icons/egypt.svg",
      imageAlt: "Egypt",
      name: "Egypt",
    },
    {
      imageUrl: "/destinations/icons/maldives.svg",
      imageQuery: "Maldives travel destination",
      fallbackImage: "/destinations/icons/maldives.svg",
      imageAlt: "Maldives",
      name: "Maldives",
    },
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
            <div className="relative h-8 w-8">
              <TPLDynamicImage
                src={destination.imageUrl}
                imageQuery={destination.imageQuery}
                fallbackSrc={destination.fallbackImage}
                alt={destination.imageAlt}
                className="h-full w-full"
                imgClassName="h-full w-full object-contain"
                sizes="32px"
                preferDynamic
              />
            </div>

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
