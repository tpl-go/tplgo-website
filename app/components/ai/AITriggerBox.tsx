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
    function handleOutsideClick(event: MouseEvent) {
      if (!boxRef.current) return;
      if (!boxRef.current.contains(event.target as Node)) {
        onClose?.();
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [onClose]);

  return (
    <div
  ref={boxRef}
  className="fixed left-[50px] z-[9999]"
  style={{ top: "130px" }}
>
      <button
        type="button"
        onClick={onOpenPanel}
        className="w-[340px] h-[84px] rounded-2xl border-[2px] border-orange-400 bg-white px-5 shadow-lg flex items-center justify-between text-left"
      >
        <span className="text-gray-700 text-sm font-medium">
          Where do you want to go?
        </span>
        <span className="text-lg">✨</span>
      </button>
    </div>
  );
}