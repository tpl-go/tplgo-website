"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { MoreHorizontal } from "lucide-react";
import type { AuthUser } from "@/app/lib/auth/auth.types";
import { creatorAccessDestination } from "@/app/lib/creators/creatorAccessContract";
import { readCreatorAccess } from "@/app/lib/creators/creatorTestingReadAdapter";

type AccountDropdownProps = {
  user?: AuthUser | null;
  onLogout: () => void;
  onClose: () => void;
};

const menuItems = [
  ["/account/profile", "My Profile", "👤"],
  ["/account/bookings", "My Bookings", "🧳"],
  ["/account/trips", "My Trips", "🗺️"],
  ["/account/wishlist", "Wishlist", "❤️"],
  ["/account/wallet", "My Wallet", "💳"],
  ["/account/orders", "My Orders", "📦"],
  ["/account/downloads", "My Downloads", "⬇️"],
  ["/account/medical-care", "Medical Care", "🩺"],
] as const;

const primaryRouteIds = new Set([
  "/account/profile",
  "/account/bookings",
  "/account/trips",
  "/account/wallet",
]);
const secondaryRouteIds = new Set([
  "/account/wishlist",
  "/account/orders",
  "/account/downloads",
  "/account/medical-care",
]);

type CreatorEntry = { href: string; label: string };
const safeCreatorEntry: CreatorEntry = { href: "/creators", label: "Explore Creators" };

function creatorEntryForStatus(status: Parameters<typeof creatorAccessDestination>[0]): CreatorEntry {
  if (status === "approved") return { href: "/creator-studio", label: "Open Creator Studio" };
  const destination = creatorAccessDestination(status);
  if (destination === "/creators/onboarding") return { href: destination, label: "Continue Creator application" };
  if (destination === "/creators/become-a-creator") return { href: destination, label: "Become a Creator" };
  return safeCreatorEntry;
}

export default function AccountDropdown({ user, onLogout, onClose }: AccountDropdownProps) {
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement | null>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const [creatorEntry, setCreatorEntry] = useState<CreatorEntry>(safeCreatorEntry);
  const [moreOpen, setMoreOpen] = useState(false);

  useEffect(() => {
    restoreFocusRef.current = document.activeElement as HTMLElement | null;
    const isSmallScreen = window.matchMedia("(max-width: 767px)").matches;
    const previousOverflow = document.body.style.overflow;
    if (isSmallScreen) document.body.style.overflow = "hidden";

    const focusable = () => Array.from(menuRef.current?.querySelectorAll<HTMLElement>(
      'a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])',
    ) ?? []);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const items = focusable();
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    window.requestAnimationFrame(() => focusable()[0]?.focus());
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      restoreFocusRef.current?.focus();
    };
  }, [onClose]);

  useEffect(() => {
    let active = true;
    if (!user) {
      return () => { active = false; };
    }
    void readCreatorAccess(user).then((result) => {
      if (!active) return;
      setCreatorEntry(result.data ? creatorEntryForStatus(result.data.status) : safeCreatorEntry);
    });
    return () => { active = false; };
  }, [user]);

  const activeRoute = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const primaryItems = menuItems.filter(([href]) => primaryRouteIds.has(href));
  const moreItems = menuItems.filter(([href]) => secondaryRouteIds.has(href));
  const activeMoreRoute = moreItems.some(([href]) => activeRoute(href));

  return (
    <>
      <div className="fixed inset-0 z-[240] bg-slate-950/25 md:hidden" aria-hidden="true" onMouseDown={onClose} />
      <div
        ref={menuRef}
        role="dialog"
        aria-modal="true"
        aria-label="My Account menu"
        onMouseDown={(event) => event.stopPropagation()}
        className="fixed inset-x-0 bottom-0 z-[250] max-h-[min(82vh,38rem)] overflow-y-auto overscroll-contain rounded-t-2xl border border-slate-200 bg-white p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-[0_-14px_40px_rgba(15,23,42,0.2)] md:absolute md:inset-x-auto md:bottom-auto md:right-0 md:top-full md:mt-2 md:max-h-none md:w-[250px] md:rounded-xl md:p-2 md:pb-2 md:shadow-[0_14px_32px_rgba(15,23,42,0.14)]"
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-2 pb-2 md:hidden">
          <span className="text-sm font-bold text-slate-900">My Account</span>
          <button type="button" onClick={onClose} className="rounded-lg px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100" aria-label="Close My Account menu">
            Close
          </button>
        </div>

        <nav className="py-1" aria-label="Personal account links">
          {primaryItems.map(([href, label, icon]) => (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={`flex min-h-10 items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${activeRoute(href) ? "bg-blue-50 text-blue-700" : "text-slate-800 hover:bg-slate-50"}`}
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-100 text-sm" aria-hidden="true">{icon}</span>
              <span className="min-w-0">{label}</span>
            </Link>
          ))}
          <button
            type="button"
            aria-expanded={moreOpen}
            aria-controls="account-menu-more-links"
            aria-label={activeMoreRoute ? "More account links, current section" : "More account links"}
            onClick={() => setMoreOpen((open) => !open)}
            className={`flex min-h-10 w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${activeMoreRoute ? "bg-blue-50 text-blue-700" : "text-slate-800 hover:bg-slate-50"}`}
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-100" aria-hidden="true"><MoreHorizontal className="h-4 w-4" /></span>
            <span className="min-w-0">{moreOpen ? "Less" : "More"}</span>
            {activeMoreRoute && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-blue-600" aria-hidden="true" />}
          </button>
          {moreOpen && (
            <div id="account-menu-more-links" className="mt-1 border-l-2 border-slate-100 pl-2" aria-label="More account links">
              {moreItems.map(([href, label, icon]) => (
                <Link
                  key={href}
                  href={href}
                  onClick={onClose}
                  className={`flex min-h-10 items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${activeRoute(href) ? "bg-blue-50 text-blue-700" : "text-slate-800 hover:bg-slate-50"}`}
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-100 text-sm" aria-hidden="true">{icon}</span>
                  <span className="min-w-0">{label}</span>
                </Link>
              ))}
            </div>
          )}
        </nav>

        <div className="mt-1 border-t border-slate-100 pt-1">
          <Link
            href={creatorEntry.href}
            onClick={onClose}
            className="flex min-h-10 items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-100 text-sm" aria-hidden="true">🎬</span>
            <span>{creatorEntry.label}</span>
          </Link>
        </div>

        <div className="mt-1 border-t border-slate-100 pt-1">
          <button
            type="button"
            onClick={() => {
              onClose();
              onLogout();
            }}
            className="flex min-h-10 w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-red-50 text-sm" aria-hidden="true">🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
}
