"use client";

type TabKey = "itinerary" | "policies" | "summary";

export default function PackageTabs({
  activeTab,
  onChange,
}: {
  activeTab: TabKey;
  onChange: (t: TabKey) => void;
}) {
  const tabs: { key: TabKey; label: string }[] = [
    { key: "itinerary", label: "Itinerary" },
    { key: "policies", label: "Policies" },
    { key: "summary", label: "Summary" },
  ];

  const base =
    "rounded-full border px-3 py-2 text-sm font-bold transition md:rounded-none md:border-x-0 md:border-t-0 md:px-0 md:py-0 md:text-lg md:font-semibold";
  const active =
    "border-blue-700 bg-blue-700 text-white md:bg-transparent md:text-blue-700 md:border-b-2";
  const inactive =
    "border-slate-200 bg-slate-50 text-gray-700 hover:text-gray-900 md:bg-transparent md:border-b-2 md:border-transparent";

  return (
    <div className="bg-white py-2 md:py-0">
      <div className="grid grid-cols-3 gap-2 md:flex md:items-center md:gap-12">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => onChange(t.key)}
            className={`${base} ${activeTab === t.key ? active : inactive}`}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}
