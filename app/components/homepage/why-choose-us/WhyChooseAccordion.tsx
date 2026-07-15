"use client";

import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import WhyChooseItem from "./WhyChooseItem";
import { useWhyChooseData } from "./useWhyChooseData";

export default function WhyChooseAccordion({
  activeId,
  setActiveId,
}: {
  activeId: string | null;
  setActiveId: Dispatch<SetStateAction<string | null>>;
}) {
  const data = useWhyChooseData();

  return (
    <div className="space-y-4">
      {data.map((item) => (
        <WhyChooseItem
          key={item.id}
          item={item}
          isOpen={activeId === item.id}
          onClick={() =>
            setActiveId(activeId === item.id ? "" : item.id)
          }
        />
      ))}
    </div>
  );
}
