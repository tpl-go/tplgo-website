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

  const base = "text-lg font-semibold transition";
  const active = "text-blue-700 border-b-2 border-blue-700";
  const inactive = "text-gray-700 hover:text-gray-900 border-b-2 border-transparent";

  return (
    <div className="bg-white">
      <div className="flex items-center gap-12">
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