import { useEffect, useRef } from "react";

export default function useAutoScroll(
  scrollRef: any,
  pauseRef?: any,
  activeTab?: string
) {
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const speed = 0.8;

    const animate = () => {
      if (!container) return;

      if (!pauseRef?.current) {
        container.scrollLeft += speed;

        const maxScrollLeft = container.scrollWidth - container.clientWidth;

        if (container.scrollLeft >= maxScrollLeft - 2) {
          container.scrollLeft = 0;
        }
      }

      frameRef.current = requestAnimationFrame(animate);
    };

    container.scrollLeft = 0;
    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [scrollRef, pauseRef, activeTab]);
}