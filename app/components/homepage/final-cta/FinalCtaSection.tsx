"use client";

import FinalCtaButtons from "./FinalCtaButtons";
import FinalCtaTrust from "./FinalCtaTrust";

export default function FinalCtaSection() {
  return (
    <section
      className="relative w-full mt-2 px-8 py-6 rounded-3xl bg-cover bg-center"
style={{backgroundImage:"url('/bg/destinationbg.jpg')"}}
>

<div className="absolute inset-0 bg-white/5 pointer-events-none"></div>


      <div className="relative max-w-6xl mx-auto text-center text-black">

        <h2 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
          Your Next Journey Starts With TPL
        </h2>

        <p className="text-lg md:text-xl text-black max-w-3xl mx-auto mb-6">
          Seamless bookings, expert-crafted itineraries, and 24/7 travel support.
          Experience travel the way it should be.
        </p>

        <FinalCtaButtons />
        <FinalCtaTrust />

      </div>
    </section>
  );
}