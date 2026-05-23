"use client";

import type { WalletSectionKey } from "@/app/account/wallet/page";

type WalletSidebarProps = {
  activeSection: WalletSectionKey;
  onSectionChange: (section: WalletSectionKey) => void;
};

const menuItems: {
  key: WalletSectionKey;
  label: string;
  icon: string;
}[] = [
  { key: "overview", label: "Wallet Overview", icon: "💼" },
  { key: "tplCredit", label: "TPL Credit", icon: "🎁" },
  { key: "refundWallet", label: "Refund Wallet", icon: "💸" },
  { key: "activity", label: "Wallet Activity", icon: "📖" },
  { key: "statement", label: "Generate Statement", icon: "🧾" },
];

export default function WalletSidebar({
  activeSection,
  onSectionChange,
}: WalletSidebarProps) {
  return (
    <aside className="min-h-full border-r border-gray-200 bg-white">
      <div className="px-5 py-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500">
          My Wallet
        </p>
      </div>

      <div className="px-4 pb-6">
        <div className="space-y-1.5">
          {menuItems.map((item) => {
            const isActive = activeSection === item.key;

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => onSectionChange(item.key)}
                className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition ${
                  isActive
                    ? "bg-sky-100 text-slate-900"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <span className="text-[17px] leading-none">{item.icon}</span>
                <span className="text-[14px] font-medium">{item.label}</span>

                {item.key === "overview" && isActive && (
                  <span className="ml-auto h-2 w-2 rounded-full bg-red-700" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}