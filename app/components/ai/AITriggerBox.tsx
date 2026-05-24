"use client";

import { useEffect, useRef } from "react";

type AITriggerBoxProps = {
  onOpenPanel?: () => void;
  onClose?: () => void;
};

export default function AITriggerBox({
  onOpenPanel,
  onClose,
}: AITriggerBoxProps) {
  const boxRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent | TouchEvent) {
      if (!boxRef.current) return;
      if (!boxRef.current.contains(event.target as Node)) {
        onClose?.();
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
    };
  }, [onClose]);

  const handleOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    onOpenPanel?.();
  };

  return (
    <div
      ref={boxRef}
      onMouseDown={(event) => event.stopPropagation()}
      onTouchStart={(event) => event.stopPropagation()}
      className="fixed left-4 right-4 z-[9999] md:left-[50px] md:right-auto"
      style={{ top: "130px" }}
    >
      <button
        type="button"
        onClick={handleOpen}
        className="w-full h-[64px] rounded-2xl border-[2px] border-orange-400 bg-white px-4 shadow-lg flex items-center justify-between text-left md:w-[340px] md:h-[84px] md:px-5"
      >
        <span className="text-gray-700 text-sm font-medium">
          Where do you want to go?
        </span>
        <span className="text-lg">✨</span>
      </button>
    </div>
  );
}