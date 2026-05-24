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
      className="relative mt-2 w-full rounded-[24px] bg-cover bg-center px-3 py-5 sm:rounded-3xl sm:px-8 sm:py-6"
      style={{ backgroundImage: "url('/bg/whychooseusbg.jpg')" }}
    >
      <div className="pointer-events-none absolute inset-0 rounded-[24px] bg-white/5 sm:rounded-3xl"></div>

      <div className="relative mx-auto max-w-6xl rounded-[24px] bg-white p-4 shadow-2xl sm:rounded-3xl sm:p-10">
        <div className="grid items-start gap-8 lg:grid-cols-2 lg:gap-12">
          {/* LEFT SIDE */}
          <div className="flex h-full flex-col">
            <h2 className="text-2xl font-bold leading-tight text-gray-900 sm:text-4xl">
              {title}
            </h2>

            <p className="mt-5 text-sm leading-7 text-gray-600 sm:mt-8 sm:text-base">
              {description}
            </p>

            <div className="mt-6 space-y-3 sm:mt-10">
              {highlights.map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-2 text-sm text-gray-700 sm:text-base"
                >
                  <span className="mt-0.5 text-green-600">✔</span>

                  <span>{item}</span>
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
              className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-orange-600 sm:mt-8 sm:w-fit"
            >
              <MessageCircle size={18} />
              Talk to Travel Expert
            </button>
          </div>

          {/* RIGHT SIDE */}
          <div className="overflow-hidden rounded-[22px] sm:rounded-[28px]">
            <FaqAccordion items={items} />
          </div>
        </div>
      </div>
    </section>
  );
}