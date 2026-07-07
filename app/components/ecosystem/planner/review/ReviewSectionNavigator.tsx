"use client";

import { useEffect, useMemo, useState } from "react";

import ReviewSectionChip from "./ReviewSectionChip";

export type ReviewSectionNavItem = {
  id: string;
  label: string;
};

type ReviewSectionNavigatorProps = {
  sections: ReviewSectionNavItem[];
};

export default function ReviewSectionNavigator({
  sections,
}: ReviewSectionNavigatorProps) {
  const [activeId, setActiveId] = useState(sections[0]?.id || "");
  const sectionIds = useMemo(() => sections.map((section) => section.id), [sections]);

  useEffect(() => {
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible?.target?.id) {
          setActiveId(visible.target.id);
        }
      },
      {
        rootMargin: "-22% 0px -64% 0px",
        threshold: [0.12, 0.24, 0.4],
      }
    );

    sectionIds.forEach((id) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [sectionIds]);

  function scrollToSection(id: string) {
    const element = document.getElementById(id);
    if (!element) return;
    setActiveId(id);
    element.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <nav className="sticky top-0 z-30 w-full max-w-full min-w-0 overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white/82 p-3 shadow-[0_18px_54px_rgba(15,23,42,0.10)] backdrop-blur-xl">
      <div className="flex max-w-full min-w-0 flex-nowrap items-center gap-2 overflow-x-auto overflow-y-hidden pb-1">
        {sections.map((section) => (
          <ReviewSectionChip
            key={section.id}
            active={activeId === section.id}
            label={section.label}
            onClick={() => scrollToSection(section.id)}
          />
        ))}
        <ReviewSectionChip
          active={false}
          label="Back To Top"
          onClick={() => scrollToSection("section-review-overview")}
        />
      </div>
    </nav>
  );
}
