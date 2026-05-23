"use client";

import { Suspense } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";

function PackageGalleryPageContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const packageId = String(params?.packageId || "");
  const activeTab = searchParams.get("tab") || "all";

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-black">
          Package Gallery (ID: {packageId})
        </h1>

        <button
          onClick={() => router.back()}
          className="px-3 py-2 rounded-md border text-sm text-black hover:bg-gray-50"
        >
          ← Back
        </button>
      </div>

      <div className="flex gap-2 mb-6">
        {[
          { key: "all", label: "All" },
          { key: "activities", label: "Activities & Sightseeing" },
          { key: "property", label: "Property Photos" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() =>
              router.push(`/packages/${packageId}/gallery?tab=${t.key}`)
            }
            className={`px-4 py-2 rounded-md border text-sm font-medium transition ${
              activeTab === t.key
                ? "bg-orange-500 text-white border-orange-500"
                : "bg-white text-black hover:bg-gray-50"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="rounded-xl border bg-white p-6">
        <p className="text-black font-semibold mb-2">Gallery Skeleton</p>
        <p className="text-gray-600 text-sm">
          Abhi dummy. Baad me API se images/video/sections dynamic honge.
        </p>

        <div className="mt-4 grid grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-28 rounded-lg bg-gray-100 border" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function PackageGalleryPage() {
  return (
    <Suspense fallback={<div />}>
      <PackageGalleryPageContent />
    </Suspense>
  );
}