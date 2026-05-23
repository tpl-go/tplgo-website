import Link from "next/link";
import FaqSection from "@/app/components/homepage/faq/FaqSection";

export default function FAQPage() {
  return (
    <main className="min-h-screen bg-gray-50 px-6 py-8">
      <div className="max-w-6xl mx-auto mb-5">
        <Link
          href="/"
          className="inline-flex items-center rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white shadow hover:bg-orange-600 transition"
        >
          Back to Home
        </Link>
      </div>

      <FaqSection />
    </main>
  );
}