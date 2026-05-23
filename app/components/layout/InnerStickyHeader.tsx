"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/app/hooks/useAuth";
import AccountDropdown from "@/app/components/account/AccountDropdown";

const services = [
  { label: "Home", icon: "🏠", href: "/" },
  { label: "Flights", icon: "✈️", href: "/flights" },
  { label: "Hotels", icon: "🏨", href: "/hotels/results" },
  { label: "Homestay", icon: "🏡", href: "/homestays/results" },
  { label: "Holidays", icon: "🎁", href: "/holidays" },
  { label: "Bus", icon: "🚌", href: "/bus/result" },
  { label: "Train", icon: "🚆", href: "/train/result" },
  { label: "Cabs", icon: "🚕", href: "/cab/result" },
  { label: "Cruise", icon: "🚢", href: "/cruise/result" },
  { label: "Insurance", icon: "🛡️", href: "/insurance/results" },
  { label: "Visa", icon: "📄", href: "/visa/results" },
];

function isActive(pathname: string, href: string) {
  const base = href.split("/")[1];
  return pathname.startsWith(`/${base}`);
}

export default function InnerStickyHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const accountRef = useRef<HTMLDivElement | null>(null);

  const { openLoginModal, user, isAuthenticated, logout } = useAuth();
  const [accountOpen, setAccountOpen] = useState(false);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!accountRef.current) return;
      if (!accountRef.current.contains(event.target as Node)) {
        setAccountOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setAccountOpen(false);
    router.push("/");
  };

  return (
    <div className="sticky top-0 z-[300] border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur-xl">
      <div className="mx-auto flex h-[66px] max-w-[1500px] items-center justify-between gap-4 px-5">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <img
            src="/logo.png"
            alt="TPL Logo"
            className="h-9 w-16 object-contain"
          />
        </Link>

        <nav className="flex min-w-0 flex-1 items-center justify-center gap-1 overflow-x-auto scrollbar-hide">
          {services.map((item) => {
            const active = isActive(pathname, item.href);

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex h-[48px] min-w-[72px] flex-col items-center justify-center rounded-xl border px-3 text-[12px] font-bold transition ${
                  active
                    ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm"
                    : "border-transparent bg-white text-slate-700 hover:border-slate-200 hover:bg-slate-50"
                }`}
              >
                <span className="text-[15px] leading-none">{item.icon}</span>
                <span className="mt-1 whitespace-nowrap">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <div className="flex h-9 items-center gap-1 rounded-lg bg-slate-100 px-2">
            <span className="text-sm">🌐</span>
            <select className="bg-transparent text-xs font-bold text-slate-800 outline-none">
              <option>English</option>
              <option>Hindi</option>
            </select>
          </div>

          <div className="flex h-9 items-center gap-1 rounded-lg bg-slate-100 px-2">
            <span className="text-sm">💱</span>
            <select className="bg-transparent text-xs font-bold text-slate-800 outline-none">
              <option>INR</option>
              <option>USD</option>
              <option>EUR</option>
            </select>
          </div>

          {isAuthenticated && user ? (
            <div ref={accountRef} className="relative">
              <button
                type="button"
                onClick={() => setAccountOpen((prev) => !prev)}
                className="h-9 rounded-lg bg-blue-600 px-3 text-xs font-bold text-white hover:bg-blue-700"
              >
                My Account
              </button>

              {accountOpen && (
                <AccountDropdown
                  onClose={() => setAccountOpen(false)}
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
              className="h-9 rounded-lg bg-blue-600 px-3 text-xs font-bold text-white hover:bg-blue-700"
            >
              Login
            </button>
          )}
        </div>
      </div>
    </div>
  );
}