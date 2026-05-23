"use client";

import { useMemo } from "react";
import type { TravelGuideBlock } from "@/app/lib/travel-guide/travelGuideTypes";

type Props = {
  blocks: TravelGuideBlock[];
};

function makeId(text: string) {
  return text
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "");
}

export default function ArticleTOC({ blocks }: Props) {
  const headings = useMemo(
    () =>
      blocks
        .filter((block) => block.type === "heading")
        .map((block) => ({
          title: block.content,
          id: makeId(block.content),
        })),
    [blocks]
  );

  if (!headings.length) return null;

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="text-xl font-bold text-gray-900 mb-5">
        In This Guide
      </h3>

      <div className="space-y-3">
        {headings.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className="block rounded-xl px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition"
          >
            {item.title}
          </a>
        ))}
      </div>
    </div>
  );
}