"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type AccountDropdownProps = {
  onLogout: () => void;
  onClose: () => void;
};

const menuItems = [
  {
    href: "/account/profile",
    title: "My Profile",
    description: "Manage profile, traveller details and login info",
    icon: "👤",
  },
  {
    href: "/account/bookings",
    title: "My Bookings",
    description: "Check bookings, trips, cancellations and status",
    icon: "🧳",
  },
  {
    href: "/account/wishlist",
    title: "Wishlist",
    description: "Save and access your favourite packages and stays",
    icon: "❤️",
  },
  {
    href: "/account/wallet",
    title: "My Wallet",
    description: "View wallet balance, offers and future credits",
    icon: "💳",
  },
];

export default function AccountDropdown({
  onLogout,
  onClose,
}: AccountDropdownProps) {
  const pathname = usePathname();

  return (
    <div className="absolute right-0 mt-2 w-[280px] sm:w-[300px] max-w-[calc(100vw-24px)] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-[0_14px_32px_rgba(15,23,42,0.14)] z-50">
      <div className="border-b border-gray-100 bg-gradient-to-r from-blue-50 to-white px-3 py-2">
        <p className="text-[11px] font-medium leading-4 text-gray-500">
          Personal Account
        </p>
      </div>

      <div className="py-1.5">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-start gap-2.5 px-3 py-2.5 transition ${
                isActive ? "bg-blue-50" : "hover:bg-gray-50"
              }`}
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-sm">
                {item.icon}
              </div>

              <div className="min-w-0 flex-1">
                <div
                  className={`text-[14px] font-semibold leading-5 ${
                    isActive ? "text-blue-700" : "text-black"
                  }`}
                >
                  {item.title}
                </div>

                <p className="mt-0.5 text-[11px] leading-4 text-gray-500">
                  {item.description}
                </p>
              </div>
            </Link>
          );
        })}

        <div className="px-3 py-1.5">
          <div className="mb-2 h-px bg-gradient-to-r from-transparent via-blue-100 to-transparent" />

          <Link
            href="/explore"
            onClick={onClose}
            className="group relative flex items-center gap-3 overflow-hidden rounded-xl border border-blue-100 bg-gradient-to-br from-[#eef5ff] via-white to-[#f3f8ff] p-2.5 transition hover:border-blue-200 hover:shadow-sm"
          >
            <div className="absolute right-2 top-2 rounded-full bg-orange-500 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide text-white shadow-sm">
              Soon
            </div>

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#061839] via-[#0b5cff] to-[#00a8ff] text-base text-white shadow-sm">
              🎬
            </div>

            <div className="min-w-0 flex-1 pr-8">
              <h3 className="text-[13px] font-extrabold leading-4 text-[#0f172a]">
                Switch to Creator Mode
              </h3>

              <p className="mt-0.5 text-[10px] leading-4 text-slate-600">
                Explore upcoming creator ecosystem
              </p>
            </div>
          </Link>
        </div>

        <div className="px-3 pt-1 pb-3">
          <button
            type="button"
            onClick={() => {
              onClose();
              onLogout();
            }}
            className="w-full rounded-lg border border-red-100 px-3 py-2 text-left text-[13px] font-semibold text-red-600 transition hover:bg-red-50"
          >
            🚪 Logout
          </button>
        </div>
      </div>
    </div>
  );
}