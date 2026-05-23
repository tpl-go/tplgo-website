"use client";

interface Props {
  tabs: string[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function GroupTabs({
  tabs,
  activeTab,
  setActiveTab,
}: Props) {
  return (
    <div className="w-full bg-white border rounded-2xl shadow-sm p-6">
      <h2 className="text-2xl font-semibold mb-6 text-black">
        Explore Group Tour Categories
      </h2>

      <div className="flex gap-3 overflow-x-auto pb-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab;

          return (
            <button
              key={tab}
              onClick={() => setActiveTab(isActive ? "" : tab)}
              className={`
                whitespace-nowrap
                px-4
                py-2
                rounded-md
                border
                text-sm
                transition
                ${
                  isActive
                    ? "bg-orange-500 text-white border-orange-500"
                    : "bg-white text-black border-gray-300 hover:border-orange-400"
                }
              `}
            >
              {tab}
            </button>
          );
        })}
      </div>
    </div>
  );
}