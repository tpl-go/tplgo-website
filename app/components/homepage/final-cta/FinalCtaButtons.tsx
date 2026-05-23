"use client";

import { ArrowRight, MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function FinalCtaButtons() {
  const router = useRouter();

  return (
    <div className="flex flex-col sm:flex-row justify-center gap-6 mb-12">

      <button
        type="button"
        onClick={() => router.push("/holidays")}
        className="inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-full text-lg font-semibold transition shadow-xl"
      >
        Explore Packages
        <ArrowRight size={20} />
      </button>

      <button
        type="button"
        onClick={() => {
          window.dispatchEvent(
            new CustomEvent("TPL_OPEN_AI_TRAVEL_EXPERT")
          );
        }}
        className="inline-flex items-center justify-center gap-2 border border-black text-black hover:bg-white hover:text-black px-8 py-4 rounded-full text-lg font-semibold transition"
      >
        Talk to Travel Expert
        <MessageCircle size={20} />
      </button>

    </div>
  );
}