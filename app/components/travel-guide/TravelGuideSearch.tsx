"use client";

type Props = {
  search: string;
  onSearchChange: (value: string) => void;

  categories: string[];

  activeCategory: string;

  onCategoryChange: (value: string) => void;
};

export default function TravelGuideSearch({
  search,
  onSearchChange,
  categories,
  activeCategory,
  onCategoryChange,
}: Props) {
  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col xl:flex-row gap-5">
        {/* Search */}
        <div className="flex-1">
          <label className="text-sm font-semibold text-gray-700">
            Search Travel Guides
          </label>

          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search destination, guide or topic..."
            className="mt-2 h-14 w-full rounded-2xl border border-gray-300 px-5 text-[15px] font-medium text-gray-900 outline-none focus:border-orange-500"
          />
        </div>

        {/* Category */}
        <div className="xl:w-[260px]">
          <label className="text-sm font-semibold text-gray-700">
            Category
          </label>

          <select
            value={activeCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="mt-2 h-14 w-full rounded-2xl border border-gray-300 px-5 text-[15px] font-medium text-gray-900 outline-none focus:border-orange-500"
          >
            <option value="all">All Categories</option>

            {categories.map((category) => (
              <option
                key={category}
                value={category}
              >
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}