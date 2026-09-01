"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import OfferStrip from "../homepage/OfferStrip";
import TopHeader from "./TopHeader";
import InnerStickyHeader from "./InnerStickyHeader";
import FloatingSupportWidget from "../common/FloatingSupportWidget";
import AITriggerBox from "../ai/AITriggerBox";
import AIChatPanel from "../ai/AIChatPanel";

export default function StickyHeaderWrapper() {
  const pathname = usePathname();

  const [showTrigger, setShowTrigger] = useState(false);
  const [openPanel, setOpenPanel] = useState(false);

  if (pathname.startsWith("/admin") || pathname.startsWith("/partner-preview")) {
    return null;
  }

  const disableUniversalSticky =
  pathname.startsWith("/holidays") ||
  pathname.startsWith("/popular") ||
  pathname.startsWith("/continent") ||
  pathname.startsWith("/themes") ||
  pathname.startsWith("/account") ||
  pathname.startsWith("/packages") ||
  pathname.startsWith("/booking") ||
  pathname.startsWith("/flights") ||
  pathname.startsWith("/hotels") ||
  pathname.startsWith("/homestays") ||
  pathname.startsWith("/bus") ||
  pathname.startsWith("/train") ||
  pathname.startsWith("/cab") ||
  pathname.startsWith("/cruise") ||
  pathname.startsWith("/insurance") ||
  pathname.startsWith("/visa");

  const handleChatWithAI = () => {
    setOpenPanel(false);
    setShowTrigger(true);
  };

  const handleCloseTrigger = () => {
    setShowTrigger(false);
  };

  const handleOpenPanel = () => {
    setShowTrigger(false);
    setOpenPanel(true);
  };

  const handleClosePanel = () => {
    setOpenPanel(false);
    setShowTrigger(false);
  };

  if (disableUniversalSticky) {
    return (
      <>
        {openPanel && (
          <div className="fixed top-0 left-0 z-[9999] h-screen w-[380px] bg-white border-r border-gray-200 shadow-2xl">
            <AIChatPanel onClose={handleClosePanel} />
          </div>
        )}

        <InnerStickyHeader />

        {showTrigger && (
          <AITriggerBox
            onClose={handleCloseTrigger}
            onOpenPanel={handleOpenPanel}
          />
        )}
      </>
    );
  }

  return (
    <>
      {openPanel && (
        <div className="fixed top-0 left-0 z-[9999] h-screen w-[380px] bg-white border-r border-gray-200 shadow-2xl">
          <AIChatPanel onClose={handleClosePanel} />
        </div>
      )}

      <OfferStrip />

      <div className="sticky top-0 z-[200]">
        <TopHeader onChatWithAI={handleChatWithAI} />
      </div>

      {showTrigger && (
        <AITriggerBox
          onClose={handleCloseTrigger}
          onOpenPanel={handleOpenPanel}
        />
      )}

      <FloatingSupportWidget />
    </>
  );
}
