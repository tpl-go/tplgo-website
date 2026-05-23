"use client";

import { MessageCircle } from "lucide-react";
import FaqAccordion from "./FaqAccordion";
import { faqData, type FaqItemData } from "./useFaqData";

type FaqSectionProps = {
  title?: string;
  description?: string;
  highlights?: string[];
  items?: FaqItemData[];
};

export default function FaqSection({
  title = "Frequently Asked Questions",
  description = "Find answers to common questions about bookings, payments, customization, and travel support.",
  highlights = [
    "Instant Booking Assistance",
    "Secure & Verified Payments",
    "Flexible Travel Customization",
    "24/7 Dedicated Support",
  ],
  items = faqData,
}: FaqSectionProps) {
  return (
    <section
      className="relative w-full mt-2 px-8 py-6 rounded-3xl bg-cover bg-center"
      style={{ backgroundImage: "url('/bg/whychooseusbg.jpg')" }}
    >
      <div className="absolute inset-0 bg-white/5 pointer-events-none"></div>

      <div className="relative max-w-6xl mx-auto bg-white rounded-3xl shadow-2xl p-10">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* LEFT SIDE */}
          <div className="flex flex-col h-full">
            <h2 className="text-4xl font-bold mb-20 text-gray-900">
              {title}
            </h2>

            <p className="text-gray-600 mb-20">{description}</p>

            <div className="space-y-3 mb-20">
              {highlights.map((item) => (
                <div key={item} className="flex items-center gap-2 text-gray-700">
                  <span className="text-green-600">✔</span>
                  {item}
                </div>
              ))}
            </div>

            <button
  type="button"
  onClick={() => {
    window.dispatchEvent(
      new CustomEvent("TPL_OPEN_AI_TRAVEL_EXPERT")
    );
  }}
  className="mt-8 inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-full transition shadow-lg self-start"
>
  <MessageCircle size={18} />
  Talk to Travel Expert
</button>
          </div>

          {/* RIGHT SIDE */}
          <FaqAccordion items={items} />
        </div>
      </div>
    </section>
  );
}