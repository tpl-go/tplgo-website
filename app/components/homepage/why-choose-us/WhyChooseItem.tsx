"use client";

import { WhyChooseItemType } from "./types";
import { ChevronDown} from "lucide-react";
import { ShieldCheck, BadgeDollarSign, Sparkles, Zap, Headphones, Globe, RefreshCcw, Briefcase } from "lucide-react";


interface Props {
  item: WhyChooseItemType;
  isOpen: boolean;
  onClick: () => void;
}

export default function WhyChooseItem({
  item,
  isOpen,
  onClick,
}: Props) {
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden transition-all duration-300">
      
      <button
        onClick={onClick}
        className={`w-full flex items-center justify-between px-6 py-5 text-left transition-all duration-300 hover:bg-gray-50 ${
          isOpen ? "bg-orange-50" : "bg-white"
        }`}
      >
        <div className="flex items-center gap-4">
          <div className="text-orange-500">
  {item.id === "best-price" && <BadgeDollarSign size={20} />}
  {item.id === "secure-booking" && <ShieldCheck size={20} />}
  {item.id === "customized-trips" && <Sparkles size={20} />}
  {item.id === "priority-access" && <Zap size={20} />}
  {item.id === "24x7-support" && <Headphones size={20} />}
{item.id === "trusted-network" && <Globe size={20} />}
{item.id === "flexible-changes" && <RefreshCcw size={20} />}
{item.id === "corporate-expertise" && <Briefcase size={20} />}
</div>
          <span className="font-semibold text-gray-900">
            {item.title}
          </span>
        </div>

        <div
  className={`p-2 rounded-full transition-all duration-300 ${
    isOpen ? "bg-orange-100" : "bg-gray-100"
  }`}
>
  <ChevronDown
    className={`transition-all duration-300 ${
      isOpen
        ? "rotate-180 text-orange-600"
        : "rotate-0 text-gray-600"
    }`}
    size={18}
    strokeWidth={2.3}
  />
</div>
      </button>

      <div
        className={`transition-all duration-500 ease-in-out overflow-hidden ${
          isOpen ? "max-h-40 px-6 pb-6" : "max-h-0"
        }`}
      >
        <p className="text-sm text-gray-600 leading-relaxed">
          {item.description}
        </p>
      </div>
    </div>
  );
}