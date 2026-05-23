"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import ArticleTOC from "./ArticleTOC";

import { resolveRelatedPackageHref } from "@/app/lib/travel-guide/travelGuideLinkResolver";
import type { TravelGuideArticle } from "@/app/lib/travel-guide/travelGuideTypes";

type Props = {
  article: TravelGuideArticle;
  relatedArticles: TravelGuideArticle[];
  blocks: TravelGuideArticle["blocks"];
};

export default function ArticleSidebar({
  article,
  relatedArticles,
  blocks,
}: Props) {
  const [currentUrl, setCurrentUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setCurrentUrl(window.location.href);
  }, []);

  const shareText = currentUrl
    ? `${article.title} - ${currentUrl}`
    : article.title;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl || window.location.href);
      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <aside className="space-y-8 lg:sticky lg:top-24 self-start">
      <ArticleTOC blocks={blocks} />

      {article.relatedPackages && article.relatedPackages.length > 0 && (
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-bold text-gray-900 mb-5">
            Related Packages
          </h3>

          <div className="space-y-4">
            {article.relatedPackages.map((pkg) => (
              <Link
                key={pkg.title}
                href={resolveRelatedPackageHref(pkg)}
                className="block rounded-2xl border border-gray-100 p-4 hover:border-orange-300 hover:shadow-md transition"
              >
                <div className="font-bold text-gray-900">{pkg.title}</div>

                {pkg.priceText && (
                  <div className="mt-2 text-sm font-medium text-orange-600">
                    {pkg.priceText}
                  </div>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="text-xl font-bold text-gray-900 mb-5">
          Share This Guide
        </h3>

        <div className="flex flex-wrap gap-3">
          <a
            href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
            target="_blank"
            rel="noreferrer"
            className="rounded-full bg-green-500 px-5 py-2 text-sm font-semibold text-white hover:bg-green-600 transition"
          >
            WhatsApp
          </a>

          <button
            type="button"
            onClick={handleCopyLink}
            className="rounded-full bg-gray-900 px-5 py-2 text-sm font-semibold text-white hover:bg-black transition"
          >
            {copied ? "Copied" : "Copy Link"}
          </button>
        </div>
      </div>

      <div className="rounded-3xl bg-[#0B1F3A] p-7 text-white">
        <h3 className="text-2xl font-bold leading-9">
          Need help planning your trip?
        </h3>

        <p className="mt-4 text-sm leading-7 text-white/80">
          Talk to TPL travel experts for personalized planning, package support
          and booking guidance.
        </p>

        <a
          href="https://wa.me/919649400299"
          target="_blank"
          rel="noreferrer"
          className="mt-6 inline-flex rounded-full bg-orange-500 px-6 py-3 text-sm font-bold text-white hover:bg-orange-600 transition"
        >
          Talk to Travel Expert
        </a>
      </div>

      {relatedArticles.length > 0 && (
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-bold text-gray-900 mb-5">
            Related Articles
          </h3>

          <div className="space-y-4">
            {relatedArticles.map((related) => (
              <Link
                key={related.slug}
                href={`/travel-guide/${related.slug}`}
                className="block rounded-2xl border border-gray-100 p-4 hover:border-orange-300 hover:shadow-md transition"
              >
                <div className="text-sm font-semibold text-orange-600">
                  {related.category}
                </div>

                <div className="mt-2 font-bold text-gray-900 leading-7">
                  {related.title}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}