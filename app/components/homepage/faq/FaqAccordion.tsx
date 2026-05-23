"use client";

import { useState } from "react";
import FaqItem from "./FaqItem";
import { faqData, type FaqItemData } from "./useFaqData";

type FaqAccordionProps = {
  items?: FaqItemData[];
};

export default function FaqAccordion({ items = faqData }: FaqAccordionProps) {
  const [activeId, setActiveId] = useState<number | null>(null);

  const toggle = (id: number) => {
    setActiveId(activeId === id ? null : id);
  };

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <FaqItem
          key={item.id}
          id={item.id}
          question={item.question}
          answer={item.answer}
          activeId={activeId}
          toggle={toggle}
        />
      ))}
    </div>
  );
}