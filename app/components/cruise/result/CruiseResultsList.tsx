"use client";

import { CruiseResultItem } from "@/app/lib/cruise/cruiseResultTypes";
import CruiseResultCard from "./CruiseResultCard";

type Props = {
  results: CruiseResultItem[];
};

export default function CruiseResultsList({ results }: Props) {
  if (!results.length) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm">
        No cruise results found for the selected search and filters.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {results.map((item) => (
        <CruiseResultCard key={item.id} item={item} />
      ))}
    </div>
  );
}