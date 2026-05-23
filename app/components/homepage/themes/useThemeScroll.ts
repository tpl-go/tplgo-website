import { useEffect, useRef } from "react";

export default function useThemeScroll(
  scrollRef: any,
  pauseRef: any
) {

  const frameRef = useRef<number | null>(null);

  useEffect(() => {

    const container = scrollRef.current;
    if (!container) return;

    const speed = 0.8;

    const animate = () => {

      if (!pauseRef.current) {

        container.scrollLeft += speed;

        if (
          container.scrollLeft >=
          container.scrollWidth - container.clientWidth
        ) {
          container.scrollLeft = 0;
        }
      }

      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };

  }, []);
}