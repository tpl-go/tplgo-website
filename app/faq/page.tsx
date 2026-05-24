import Link from "next/link";
import FaqSection from "@/app/components/homepage/faq/FaqSection";

export default function FAQPage() {
  return (
    <main className="min-h-screen bg-gray-50 px-3 py-5 sm:px-6 sm:py-8">
      <div className="mx-auto mb-5 max-w-6xl">
        <Link
          href="/"
          className="inline-flex items-center rounded-full bg-orange-500 px-5 py-2.5 text-xs font-semibold text-white shadow transition hover:bg-orange-600 sm:px-6 sm:py-3 sm:text-sm"
        >
          Back to Home
        </Link>
      </div>

      <FaqSection />
    </main>
  );
}