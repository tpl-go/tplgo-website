"use client";

import { useEffect, useRef, useState } from "react";
import {
  ChevronRight,
  FileText,
  MessageCircle,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

export default function FloatingSupportWidget() {
  const pathname = usePathname();
  const router = useRouter();

  const hideOnRoutes = ["/flights"];

  const shouldHide = hideOnRoutes.some((route) =>
    pathname.startsWith(route)
  );

  const [showPopup, setShowPopup] = useState(false);

  const popupRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;

      const clickedInsidePopup =
        popupRef.current && popupRef.current.contains(target);

      const clickedButton =
        buttonRef.current && buttonRef.current.contains(target);

      if (!clickedInsidePopup && !clickedButton) {
        setShowPopup(false);
      }
    }

    if (showPopup) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showPopup]);

  if (shouldHide) return null;

  return (
    <>
      {/* FLOATING BUTTON */}
      <button
        ref={buttonRef}
        onClick={() => setShowPopup((prev) => !prev)}
        className="fixed bottom-4 left-1/2 z-50 min-h-11 -translate-x-1/2 rounded-full bg-purple-600 px-4 py-2.5 text-sm font-black text-white shadow-lg transition hover:bg-purple-700 md:bottom-2 md:left-auto md:right-[125px] md:translate-x-0 md:px-4 md:py-3 md:font-medium"
      >
        Customise My Trip
      </button>

      {/* POPUP */}
      {showPopup && (
        <div
          ref={popupRef}
          className="fixed bottom-20 left-1/2 z-50 w-[calc(100vw-24px)] max-w-72 -translate-x-1/2 space-y-4 rounded-xl border border-gray-200 bg-white p-4 shadow-xl md:bottom-18 md:left-auto md:right-[125px] md:w-72 md:translate-x-0"
        >
          {/* GET A QUOTE */}
          <button
            type="button"
            onClick={() => {
              setShowPopup(false);
              router.push("/popular/india");
            }}
            className="w-full flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition text-left"
          >
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-full">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>

              <div>
                <p className="font-semibold text-black">Get a quote</p>
                <p className="text-xs text-gray-500">
                  Customise your holiday to your liking
                </p>
              </div>
            </div>

            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>

          {/* CHAT WITH EXPERT */}
          <button
            type="button"
            onClick={() => {
              setShowPopup(false);

              window.dispatchEvent(
                new CustomEvent("TPL_OPEN_AI_TRAVEL_EXPERT")
              );
            }}
            className="w-full flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition text-left"
          >
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-full">
                <MessageCircle className="w-5 h-5 text-blue-600" />
              </div>

              <div>
                <p className="font-semibold text-black">
                  Chat with an Expert
                </p>
                <p className="text-xs text-gray-500">
                  Get instant assistance at your fingertips
                </p>
              </div>
            </div>

            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      )}
    </>
  );
}
