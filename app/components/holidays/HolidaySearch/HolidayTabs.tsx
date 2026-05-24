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

  function getTabLabel(t: string) {
    return t === "search"
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
      : "Pre-wedding & Production";
  }

  function getMobileTabLabel(t: string) {
    return t === "search" ? "Search Destination" : getTabLabel(t);
  }

  return (
    <>
      {/* Mobile Category Dropdown */}
      <div className="mb-4 block md:hidden">
        <label className="mb-1 block text-xs font-extrabold uppercase tracking-wide text-slate-700">
          Category
        </label>

        <select
          value={activeTab}
          onChange={(e) => setActiveTab(e.target.value)}
          className="w-full rounded-2xl border border-white/60 bg-white/90 px-4 py-3 text-sm font-extrabold text-slate-800 shadow-md outline-none backdrop-blur-md focus:border-orange-400"
        >
          {tabs.map((t) => (
            <option key={t} value={t}>
              {getMobileTabLabel(t)}
            </option>
          ))}
        </select>
      </div>

      {/* Desktop Tabs - untouched layout */}
      <div className="mb-4 hidden flex-nowrap items-center justify-center gap-3 text-sm font-bold md:flex">
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
            {getTabLabel(t)}
          </button>
        ))}
      </div>
    </>
  );
}