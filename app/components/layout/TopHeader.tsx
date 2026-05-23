"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/hooks/useAuth";
import AccountDropdown from "@/app/components/account/AccountDropdown";
import HeaderPrintModal from "@/app/components/common/print/HeaderPrintModal";

type TopHeaderProps = {
  onChatWithAI?: () => void;
};

export default function TopHeader({ onChatWithAI }: TopHeaderProps) {
  const router = useRouter();

  const [openMenu, setOpenMenu] = useState<"ai" | "account" | null>(null);
  const [showPrintModal, setShowPrintModal] = useState(false);

  const menuRef = useRef<HTMLDivElement | null>(null);

  const { openLoginModal, user, isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
    setOpenMenu(null);
    router.push("/");
  };

  const handleOpenPrintModal = () => {
    setOpenMenu(null);
    setShowPrintModal(true);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(event.target as Node)) {
        setOpenMenu(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

useEffect(() => {
  const handleOpenAITravelExpert = () => {
    setOpenMenu(null);
    onChatWithAI?.();
  };

  window.addEventListener(
    "TPL_OPEN_AI_TRAVEL_EXPERT",
    handleOpenAITravelExpert
  );

  return () => {
    window.removeEventListener(
      "TPL_OPEN_AI_TRAVEL_EXPERT",
      handleOpenAITravelExpert
    );
  };
}, [onChatWithAI]);

  return (
    <>
      <header className="relative z-[200] bg-white shadow-sm isolate">
        <div
          ref={menuRef}
          className="max-w-7xl mx-auto px-2 py-3 flex items-center justify-between"
        >
          <div className="flex items-center gap-10 py-1">
            <Link href="/">
              <img
                src="/logo.png"
                alt="TPL Logo"
                className="w-20 h-10 object-contain cursor-pointer"
              />
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-black">
            <Link
              href="/"
              className="flex items-center gap-1 cursor-pointer hover:text-black transition duration-200"
            >
              🏠 <span>Home</span>
            </Link>

            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setOpenMenu((prev) => (prev === "ai" ? null : "ai"))
                }
                className="
                  flex items-center gap-1
                  px-3 py-1.5
                  rounded-full
                  border border-orange-400
                  text-black
                  font-semibold
                  bg-orange-100
                  hover:bg-orange-100
                  transition
                "
              >
                🤖 <span>AI Travel Expert</span>
              </button>

              {openMenu === "ai" && (
                <div className="absolute top-full left-0 mt-3 w-72 bg-white border border-gray-200 rounded-xl shadow-lg p-2 z-50">
                  <button
                    type="button"
                    onClick={() => {
                      setOpenMenu(null);
                      onChatWithAI?.();
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 text-sm text-gray-700"
                  >
                    💬 Chat with AI
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setOpenMenu(null);
                      alert("Voice AI coming soon");
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 text-sm text-gray-700 whitespace-nowrap"
                  >
                    🎤 Speak to AI
                  </button>

                  <button
                    type="button"
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 text-sm text-gray-700"
                  >
                    🧳 Plan My Trip
                  </button>

                  <button
                    type="button"
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 text-sm text-gray-700"
                  >
                    🌍 Best Package Suggestions
                  </button>
                </div>
              )}
            </div>

            <Link
              href="/explore"
              className="
                group relative flex items-center gap-1.5
                rounded-full
                border border-blue-500/30
                bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-500
                px-3.5 py-1.5
                text-white
                font-semibold
                shadow-sm
                transition
                hover:-translate-y-0.5
                hover:shadow-md
              "
            >
              <span className="absolute -top-2 -right-2 rounded-full bg-orange-500 px-1.5 py-0.5 text-[9px] font-bold leading-none text-white shadow-sm">
                Soon
              </span>
              🎬 <span>TPL Creators</span>
            </Link>

            <Link
              href="/flight-tracking"
              className="flex items-center gap-1 cursor-pointer hover:text-black"
            >
              ✈️ <span>Flight Tracking</span>
            </Link>

            <Link
              href="/web-check-in"
              className="flex items-center gap-1 cursor-pointer hover:text-black"
            >
              🧾 <span>Web Check-in</span>
            </Link>

            <button
              type="button"
              onClick={handleOpenPrintModal}
              className="flex items-center gap-1 cursor-pointer hover:text-black"
            >
              🖨 <span>Print</span>
            </button>
          </nav>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
              <span className="text-black text-sm">🌐</span>
              <select className="bg-transparent text-black text-sm font-semibold outline-none cursor-pointer">
                <option>English</option>
                <option>Hindi</option>
              </select>
            </div>

            <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
              <span className="text-black text-sm">💱</span>
              <select className="bg-transparent text-black text-sm font-semibold outline-none cursor-pointer">
                <option>INR</option>
                <option>USD</option>
                <option>EUR</option>
              </select>
            </div>

            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() =>
                    setOpenMenu((prev) =>
                      prev === "account" ? null : "account"
                    )
                  }
                  className="bg-blue-600 text-white px-4 py-1.5 rounded text-sm font-medium hover:bg-blue-700 transition"
                >
                  My Account
                </button>

                {openMenu === "account" && (
                  <AccountDropdown
                    onClose={() => setOpenMenu(null)}
                    onLogout={handleLogout}
                  />
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() =>
                  openLoginModal({
                    accountType: "personal",
                    intent: "generic",
                  })
                }
                className="bg-blue-600 text-white px-4 py-1.5 rounded text-sm font-medium hover:bg-blue-700 transition"
              >
                Login / Signup
              </button>
            )}
          </div>
        </div>
      </header>

      <HeaderPrintModal
        open={showPrintModal}
        onClose={() => setShowPrintModal(false)}
      />
    </>
  );
}