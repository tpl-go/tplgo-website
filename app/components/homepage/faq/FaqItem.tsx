"use client";

import { ChevronDown } from "lucide-react";

interface FaqItemProps {
  id: number;
  question: string;
  answer: string;
  activeId: number | null;
  toggle: (id: number) => void;
}

export default function FaqItem({
  id,
  question,
  answer,
  activeId,
  toggle,
}: FaqItemProps) {
  return (
    <div className="border rounded-2xl overflow-hidden">
      <button
        onClick={() => toggle(id)}
        className="w-full flex justify-between items-center p-5 text-left font-medium text-gray-800 hover:bg-gray-50 transition"
      >
        {question}
        <ChevronDown
  className={`transition-all duration-300 ${
    activeId === id
      ? "rotate-180 text-orange-600"
      : "rotate-0 text-gray-600"
  }`}
  size={18}
  strokeWidth={2.3}
/>
      </button>

      {activeId === id && (
        <div className="px-5 pb-5 text-gray-600 text-sm">
          {answer}
        </div>
      )}
    </div>
  );
}