"use client";

type Props = {
  activeTab: string;
  setActiveTab: any;
};

export default function HolidayTabs({ activeTab, setActiveTab }: Props) {
  const tabs = [
    "search",
    "honeymoon",
    "group",
    "weekend",
    "adventure",
    "spiritual",
    "prewedding",
  ];

  return (
    <div className="mb-4 flex flex-nowrap items-center justify-center gap-3 text-sm font-bold">
      {tabs.map((t) => (
        <button
          key={t}
          onClick={() => setActiveTab(t)}
          className={`min-h-[58px] rounded-xl border px-5 py-2 capitalize backdrop-blur-md transition-all ${
            activeTab === t
              ? "border-orange-500 bg-orange-600 text-white shadow"
              : "border-black bg-white/45 text-black hover:bg-orange-50"
          }`}
        >
          {t === "search"
            ? "Search"
            : t === "honeymoon"
            ? "Honeymoon & Celebrations"
            : t === "group"
            ? "Group Tour Package"
            : t === "weekend"
            ? "Weekend Tour"
            : t === "adventure"
            ? "Adventure & Wildlife"
            : t === "spiritual"
            ? "Spiritual Packages"
            : "Pre-wedding & Production"}
        </button>
      ))}
    </div>
  );
}