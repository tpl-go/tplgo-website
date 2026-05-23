"use client";

interface Props {
  slug: string;
  themeName: string;
  subThemes: (string | { id: string; label: string })[];
  activeSubTheme: string;
  setActiveSubTheme: (subTheme: string) => void;
}

export default function SubThemeTabs({
  slug,
  themeName,
  subThemes,
  activeSubTheme,
  setActiveSubTheme,
}: Props) {

  const formattedSlug =
    slug && slug.length > 0
      ? decodeURIComponent(slug)
          .split(" ")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ")
      : "Culture";

  return (
    <div className="bg-white border rounded-2xl shadow-sm p-6">

      {/* Title */}
      <h2 className="text-2xl font-semibold mb-6 text-black">
        Explore more in {themeName}
      </h2>

      {/* Tabs Wrapper */}
      <div className="flex flex-nowrap  gap-2 pb-2 overflow-hidden">

        {subThemes.map((item) => {

const subTheme = typeof item === "string" ? item : item.label;

          const isActive = activeSubTheme === subTheme;

          return (
            <button
              key={typeof item === "string" ? item : item.id}
              onClick={() => setActiveSubTheme(isActive ? "" : subTheme)}
              className={`
                whitespace-normal break-words text-center leading-tight
                w-[180px] h-[75px]
                px-3
                py-4
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
              {subTheme}
            </button>
          );
        })}

      </div>

    </div>
  );
}