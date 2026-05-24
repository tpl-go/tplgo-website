"use client";

import FinalCtaButtons from "./FinalCtaButtons";
import FinalCtaTrust from "./FinalCtaTrust";

export default function FinalCtaSection() {
  return (
    <section
      className="relative mt-2 w-full rounded-[24px] bg-cover bg-center px-3 py-6 sm:rounded-3xl sm:px-8 sm:py-6"
      style={{ backgroundImage: "url('/bg/destinationbg.jpg')" }}
    >
      <div className="pointer-events-none absolute inset-0 rounded-[24px] bg-white/5 sm:rounded-3xl"></div>

      <div className="relative mx-auto max-w-6xl text-center text-black">
        <h2 className="text-3xl font-bold leading-tight sm:text-4xl md:text-5xl">
          Your Next Journey Starts With TPL
        </h2>

        <p className="mx-auto mt-4 max-w-3xl text-sm leading-7 text-black sm:mt-6 sm:text-lg md:text-xl">
          Seamless bookings, expert-crafted itineraries, and 24/7 travel
          support. Experience travel the way it should be.
        </p>

        <div className="mt-6 sm:mt-8">
          <FinalCtaButtons />
        </div>

        <div className="mt-6 sm:mt-8">
          <FinalCtaTrust />
        </div>
      </div>
    </section>
  );
}