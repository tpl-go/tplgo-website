"use client";

import { Vote } from "lucide-react";
import { useState } from "react";

type VoteCategory = {
  id: "route" | "stay" | "transport" | "activity";
  label: string;
  options: string[];
};

const voteCategories: VoteCategory[] = [
  {
    id: "route",
    label: "Route",
    options: ["Fastest", "Scenic", "Budget", "Adventure"],
  },
  {
    id: "stay",
    label: "Stay style",
    options: ["Hotel", "Homestay", "Resort", "Villa"],
  },
  {
    id: "transport",
    label: "Transport",
    options: ["Flight", "Train", "Cab", "Self-drive"],
  },
  {
    id: "activity",
    label: "Activity style",
    options: ["Food", "Culture", "Adventure", "Relaxed"],
  },
];

export default function TiyaGroupVoting() {
  const [votes, setVotes] = useState<Record<string, string>>({
    route: "Scenic",
    stay: "Hotel",
    transport: "Flight",
    activity: "Culture",
  });

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.07] p-3 sm:p-4">
      <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
        <Vote size={15} />
        Group voting layer
      </div>
      <div className="mt-3 grid gap-3">
        {voteCategories.map((category) => (
          <div
            key={category.id}
            className="rounded-2xl border border-white/10 bg-white/[0.06] p-3"
          >
            <p className="text-xs font-black uppercase tracking-[0.14em] text-white/50">
              {category.label}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {category.options.map((option) => {
                const selected = votes[category.id] === option;

                return (
                  <button
                    key={`${category.id}-${option}`}
                    type="button"
                    onClick={() =>
                      setVotes((current) => ({
                        ...current,
                        [category.id]: option,
                      }))
                    }
                    className={`min-h-9 rounded-full px-3 py-1.5 text-xs font-black transition ${
                      selected
                        ? "bg-gradient-to-r from-[#ff7b00] via-[#ff9500] to-[#ffb300] text-white"
                        : "border border-white/15 bg-white/10 text-white hover:bg-white/15"
                    }`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
